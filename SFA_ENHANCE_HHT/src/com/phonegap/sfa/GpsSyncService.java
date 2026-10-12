package com.phonegap.sfa;

import android.app.Service;
import android.content.ContentValues;
import android.content.Intent;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.os.IBinder;
import android.provider.Settings.Secure;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/** Uploads a bounded packet of route locations. A later five-minute tick handles
 * the next packet, which prevents a large offline backlog from becoming one request. */
public class GpsSyncService extends Service {
    private static final String TAG = "GPS_SYNC";
    private static final int PACKET_SIZE = 100;
    private static final int MAX_PACKETS_PER_RUN = 10;
    private static boolean syncRunning;

    private static class Point {
        long id;
        double latitude;
        double longitude;
        String routeKey;
        String routeCode;
        String deviceKey;
        String salesmanCode;
        String date;
        String time;
        String deviceId;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        synchronized (GpsSyncService.class) {
            if (syncRunning) {
                RouteTrackingFileLogger.writeSending(
                        "SYNC_SKIPPED another upload is already running");
                return START_NOT_STICKY;
            }
            syncRunning = true;
        }
        RouteTrackingFileLogger.writeSending("SYNC_STARTED endpoint="
                + Utility.LocationUpdateUrl);
        new Thread(new Runnable() {
            public void run() {
                try {
                    for (int i = 0; i < MAX_PACKETS_PER_RUN; i++) {
                        if (!syncOnePacket()) break;
                    }
                } finally {
                    synchronized (GpsSyncService.class) { syncRunning = false; }
                    RouteTrackingFileLogger.writeSending("SYNC_FINISHED");
                    stopSelf();
                }
            }
        }, "gps-sync").start();
        return START_NOT_STICKY;
    }

    /** Returns true when a packet was uploaded and another packet may be waiting. */
    private boolean syncOnePacket() {
        DBHelper helper = new DBHelper(getApplicationContext());
        SQLiteDatabase db = helper.getWritableDatabase();
        try {
            if (!hasOpenRoute(db)) {
                Log.d(TAG, "Route is not started; upload skipped");
                RouteTrackingFileLogger.writeSending(
                        "UPLOAD_SKIPPED route is not started");
                return false;
            }

            if (!isGpsTrackingEnabled(db)) {
                Log.d(TAG, "GPS tracking is disabled; upload skipped");
                RouteTrackingFileLogger.writeSending(
                        "UPLOAD_SKIPPED GPS tracking is disabled");
                return false;
            }

            List<Point> packet = readPacket(db);
            if (packet.isEmpty()) {
                RouteTrackingFileLogger.writeSending(
                        "UPLOAD_SKIPPED no unsynced location rows");
                return false;
            }

            JSONObject request = new JSONObject();
            JSONArray routeTrackData = new JSONArray();
            for (Point point : packet) {
                JSONObject item = new JSONObject();
                item.put("routekey", jsonNumberOrString(point.routeKey));
                item.put("routecode", jsonNumberOrString(point.routeCode));
                item.put("devicekey", jsonNumberOrString(point.deviceKey));
                item.put("salesmancode", jsonNumberOrString(point.salesmanCode));
                item.put("date", point.date);
                item.put("time", point.time);
                item.put("deviceid", point.deviceId);
                item.put("latitude", point.latitude);
                item.put("longitude", point.longitude);
                routeTrackData.put(item);
            }
            request.put("routeTrackData", routeTrackData);

            RouteTrackingFileLogger.writeSending("PACKET_READY rawRows=" + packet.size()
                    + " uploadPoints=" + packet.size() + " firstId="
                    + packet.get(0).id + " lastId=" + packet.get(packet.size() - 1).id);
            RouteTrackingFileLogger.writeSending("API_REQUEST " + request.toString());

            String response = new HttpConnection().postJson(
                    Utility.LocationUpdateUrl, request.toString());
            RouteTrackingFileLogger.writeSending("API_RESPONSE "
                    + (response == null ? "null" : response));
            if (!isSuccessfulResponse(response)) {
                Log.w(TAG, "Server rejected packet: " + response);
                RouteTrackingFileLogger.writeSending("UPLOAD_REJECTED firstId="
                        + packet.get(0).id + " lastId="
                        + packet.get(packet.size() - 1).id);
                return false;
            }

            // Only mark rows after the complete packet is accepted by the server.
            markPacketSynced(db, packet);
            Log.i(TAG, "Uploaded " + packet.size() + " location points");
            RouteTrackingFileLogger.writeSending("UPLOAD_SUCCESS syncedRows="
                    + packet.size() + " uploadedPoints=" + packet.size()
                    + " firstId=" + packet.get(0).id + " lastId="
                    + packet.get(packet.size() - 1).id);
            return packet.size() == PACKET_SIZE;
        } catch (Exception ex) {
            Log.e(TAG, "Location packet upload failed; rows remain unsynced", ex);
            RouteTrackingFileLogger.writeSending("UPLOAD_FAILED rows remain unsynced error="
                    + ex.toString());
            return false;
        } finally {
            db.close();
        }
    }

    private boolean isGpsTrackingEnabled(SQLiteDatabase db) {
        Cursor cursor = db.rawQuery(
                "SELECT rm.routecode, rm.salesmancode, "
                + "IFNULL(rm.enablegpstracking, 0) "
                + "FROM routemaster rm WHERE rm.routecode = ("
                + "SELECT sed.routecode FROM startendday sed "
                + "WHERE IFNULL(sed.routeclosed, 0) = 0 "
                + "ORDER BY sed.routekey DESC LIMIT 1) LIMIT 1", null);
        try {
            boolean hasRouteRow = cursor.moveToFirst();
            boolean trackingEnabled = hasRouteRow && cursor.getInt(2) == 1;
            String routeCode = hasRouteRow ? cursor.getString(0) : "none";
            String salesmanCode = hasRouteRow ? cursor.getString(1) : "none";
            Log.d(TAG, "GPS_TRACKING_FLAG routecode=" + routeCode
                    + " salesmancode=" + salesmanCode
                    + " enabled=" + trackingEnabled);
            RouteTrackingFileLogger.writeSending(
                    "GPS_TRACKING_FLAG routecode=" + routeCode
                    + " salesmancode=" + salesmanCode
                    + " enabled=" + trackingEnabled);
            return trackingEnabled;
        } finally {
            cursor.close();
        }
    }

    private boolean hasOpenRoute(SQLiteDatabase db) {
        Cursor cursor = db.rawQuery(
                "SELECT 1 FROM startendday "
                + "WHERE IFNULL(routeclosed, 0) = 0 LIMIT 1", null);
        try { return cursor.moveToFirst(); } finally { cursor.close(); }
    }

    private List<Point> readPacket(SQLiteDatabase db) {
        List<Point> points = new ArrayList<Point>();
        Cursor cursor = db.rawQuery(
                "SELECT id, latitude, longitude, routekey, routecode, salesmancode, "
                + "COALESCE(date, substr(timestamp, 1, 10)), "
                + "COALESCE(time, substr(timestamp, 12, 8)), deviceid "
                + "FROM location_logs WHERE IFNULL(is_synced, 0) = 0 "
                + "ORDER BY id LIMIT " + PACKET_SIZE, null);
        try {
            while (cursor.moveToNext()) {
                Point point = new Point();
                point.id = cursor.getLong(0);
                point.latitude = cursor.getDouble(1);
                point.longitude = cursor.getDouble(2);
                point.routeKey = cursor.getString(3);
                point.routeCode = cursor.getString(4);
                point.salesmanCode = cursor.getString(5);
                point.date = cursor.getString(6);
                point.time = cursor.getString(7);
                point.deviceId = cursor.getString(8);
                if (point.deviceId == null || point.deviceId.length() == 0) {
                    point.deviceId = Secure.getString(getContentResolver(), Secure.ANDROID_ID);
                }
                point.deviceKey = String.valueOf(point.id);
                points.add(point);
            }
        } finally { cursor.close(); }
        return points;
    }

    private Object jsonNumberOrString(String value) {
        if (value == null) return JSONObject.NULL;
        try { return Long.valueOf(value); } catch (NumberFormatException ignored) { return value; }
    }

    private boolean isSuccessfulResponse(String response) {
        if (response == null || response.trim().length() == 0) return true;
        try {
            JSONObject json = new JSONObject(response);
            if (json.has("status")) {
                Object status = json.get("status");
                return "1".equals(String.valueOf(status))
                        || "true".equalsIgnoreCase(String.valueOf(status))
                        || "success".equalsIgnoreCase(String.valueOf(status));
            }
            if (json.has("success")) return json.optBoolean("success", false);
            return true; // A 2xx JSON response without a status field is successful.
        } catch (Exception ignored) {
            return true; // postJson only returns normally for a 2xx response.
        }
    }

    private void markPacketSynced(SQLiteDatabase db, List<Point> packet) {
        StringBuilder placeholders = new StringBuilder();
        String[] ids = new String[packet.size()];
        for (int i = 0; i < packet.size(); i++) {
            if (i > 0) placeholders.append(',');
            placeholders.append('?');
            ids[i] = String.valueOf(packet.get(i).id);
        }
        ContentValues values = new ContentValues();
        values.put("is_synced", 1);
        db.update("location_logs", values, "id IN (" + placeholders + ")", ids);
    }

    @Override public IBinder onBind(Intent intent) { return null; }
}
