package com.phonegap.sfa;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;

import org.json.JSONException;
import org.json.JSONObject;

import android.app.Service;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.database.sqlite.SQLiteDatabase;
import android.database.Cursor;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.IBinder;
import android.os.Looper;
import android.os.Handler;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings.Secure;
import android.util.Log;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;

public class LocationUpdateService extends Service  {

	   private static final long LOCATION_INTERVAL_MS = 5000L;
	   private static final float MAX_ACCURACY_METERS = 50.0f;
	   private static final float MIN_DISTANCE_METERS = 5.0f;
	   private static final int NOTIFICATION_ID = 4105;
	   private static final int RESTART_REQUEST_CODE = 4106;
	   private static final int WATCHDOG_REQUEST_CODE = 4107;
	   private static final long WATCHDOG_INTERVAL_MS = 60 * 1000L;
	   private static final long SYNC_INTERVAL_MS = 1 * 60 * 1000L;
	   private static final String NOTIFICATION_CHANNEL_ID = "route_tracking";
	   private static final String ACTION_PROCESS_LOCATION =
	         "com.phonegap.sfa.action.PROCESS_LOCATION";

	   String GPS_FILTER = "";
	      Thread triggerService;
	      LocationManager lm;
	      GpsListener gpsLocationListener;
	      PendingIntent locationUpdatePendingIntent;
	      boolean isRunning = true;
	      Handler locationHandler;
	      Runnable routeStateChecker;
	      Runnable gpsSyncScheduler;
	      PowerManager.WakeLock trackingWakeLock;
	      Location lastSavedLocation;
	      long lastSavedTimestamp = Long.MIN_VALUE;

	      private static class RouteInfo {
	            String routeKey;
	            String routeCode;
	            String salesmanCode;
	      }

	      public static void reconcileWithRouteState(Context context) {
	            boolean routeIsOpen = hasOpenRoute(context)
	                  && isGpsTrackingEnabled(context);
	            Intent serviceIntent = new Intent(context, LocationUpdateService.class);
	            if (routeIsOpen) {
	                  scheduleTrackingWatchdog(context);
	                  startTrackingService(context, serviceIntent);
	            } else {
	                  cancelTrackingWatchdog(context);
	                  context.stopService(serviceIntent);
	            }
	      }

	      private static boolean isGpsTrackingEnabled(Context context) {
	            DBHelper helper = null;
	            SQLiteDatabase database = null;
	            Cursor cursor = null;
	            boolean trackingEnabled = false;
	            try {
	                  helper = new DBHelper(context.getApplicationContext());
	                  database = helper.getReadableDatabase();
	                  cursor = database.rawQuery(
	                              "SELECT rm.routecode, rm.salesmancode, "
	                              + "IFNULL(rm.enablegpstracking, 0) "
	                              + "FROM routemaster rm WHERE rm.routecode = ("
	                              + "SELECT sed.routecode FROM startendday sed "
	                              + "WHERE IFNULL(sed.routeclosed, 0) = 0 "
	                              + "ORDER BY sed.routekey DESC LIMIT 1) LIMIT 1",
	                              null);
	                  boolean hasRouteRow = cursor.moveToFirst();
	                  trackingEnabled = hasRouteRow && cursor.getInt(2) == 1;
	                  String routeCode = hasRouteRow ? cursor.getString(0) : "none";
	                  String salesmanCode = hasRouteRow ? cursor.getString(1) : "none";
	                  Log.d("GPS_TRACKING_FLAG", "routecode=" + routeCode
	                              + " salesmancode=" + salesmanCode
	                              + " enabled=" + trackingEnabled);
	                  RouteTrackingFileLogger.write(
	                              "GPS_TRACKING_FLAG routecode=" + routeCode
	                              + " salesmancode=" + salesmanCode
	                              + " enabled=" + trackingEnabled);
	            } catch (Exception ex) {
	                  Log.e("GPS_ROUTE", "Unable to read GPS tracking flag", ex);
	            } finally {
	                  if (cursor != null) cursor.close();
	                  if (database != null) database.close();
	            }

	            return trackingEnabled;
	      }

	      private static void scheduleTrackingWatchdog(Context context) {
	            Intent watchdogIntent = new Intent(context, LocationTrackingBootReceiver.class);
	            watchdogIntent.setAction(LocationTrackingBootReceiver.ACTION_WATCHDOG_TRACKING);
	            int pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT;
	            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
	                  pendingFlags |= PendingIntent.FLAG_IMMUTABLE;
	            }
	            PendingIntent watchdog = PendingIntent.getBroadcast(
	                  context, WATCHDOG_REQUEST_CODE, watchdogIntent, pendingFlags);
	            AlarmManager alarmManager =
	                  (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
	            alarmManager.setRepeating(AlarmManager.RTC_WAKEUP,
	                  System.currentTimeMillis() + WATCHDOG_INTERVAL_MS,
	                  WATCHDOG_INTERVAL_MS, watchdog);
	      }

	      private static void cancelTrackingWatchdog(Context context) {
	            Intent watchdogIntent = new Intent(context, LocationTrackingBootReceiver.class);
	            watchdogIntent.setAction(LocationTrackingBootReceiver.ACTION_WATCHDOG_TRACKING);
	            int pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT;
	            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
	                  pendingFlags |= PendingIntent.FLAG_IMMUTABLE;
	            }
	            PendingIntent watchdog = PendingIntent.getBroadcast(
	                  context, WATCHDOG_REQUEST_CODE, watchdogIntent, pendingFlags);
	            AlarmManager alarmManager =
	                  (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
	            alarmManager.cancel(watchdog);
	            watchdog.cancel();
	      }

	      private static boolean hasOpenRoute(Context context) {
	            DBHelper helper = null;
	            SQLiteDatabase database = null;
	            Cursor cursor = null;
	            boolean routeIsOpen = false;
	            try {
	                  helper = new DBHelper(context.getApplicationContext());
	                  database = helper.getReadableDatabase();
	                  cursor = database.rawQuery(
	                              "SELECT 1 FROM startendday WHERE IFNULL(routeclosed, 0) = 0 LIMIT 1",
	                              null);
	                  routeIsOpen = cursor.moveToFirst();
	            } catch (Exception ex) {
	                  Log.e("GPS_ROUTE", "Unable to read route state", ex);
	            } finally {
	                  if (cursor != null) cursor.close();
	                  if (database != null) database.close();
	            }

	            return routeIsOpen;
	      }

	      public static void startTrackingService(Context context, Intent intent) {
	            // The application targets API 25. Starting the service normally and
	            // promoting it immediately in onCreate keeps old devices compatible.
	            context.startService(intent);
	      }
	     
	      @Override
	      public void onCreate() {
	           
	            // TODO Auto-generated method stub
	            super.onCreate();
	            GPS_FILTER = "MyGPSLocation";
	            startLocationForegroundService(createTrackingNotification());
	            acquireTrackingWakeLock();
	            RouteTrackingFileLogger.write("SERVICE_CREATED foreground=true");
	           
	      }

	      private void startLocationForegroundService(Notification notification) {
	            if (Build.VERSION.SDK_INT >= 29) {
	                  try {
	                        Method startForegroundWithType = Service.class.getMethod(
	                              "startForeground", int.class, Notification.class, int.class);
	                        // ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION = 8.
	                        startForegroundWithType.invoke(this, NOTIFICATION_ID, notification, 8);
	                        RouteTrackingFileLogger.write(
	                              "FOREGROUND_LOCATION_TYPE_STARTED type=location");
	                        return;
	                  } catch (Exception ex) {
	                        Log.e("GPS_FOREGROUND", "Unable to set location service type", ex);
	                        RouteTrackingFileLogger.write(
	                              "FOREGROUND_LOCATION_TYPE_ERROR " + ex.toString());
	                  }
	            }
	            startForeground(NOTIFICATION_ID, notification);
	      }
	     
	      @Override
	      public int onStartCommand(Intent intent, int flags, int startId) {
	            if (!hasOpenRoute(getApplicationContext())) {
	                  RouteTrackingFileLogger.write("SERVICE_STOP no open route");
	                  stopSelf();
	                  return START_NOT_STICKY;
	            }
	            if (!isGpsTrackingEnabled(getApplicationContext())) {
	                  RouteTrackingFileLogger.write("SERVICE_STOP GPS tracking disabled");
	                  cancelTrackingWatchdog(getApplicationContext());
	                  stopSelf();
	                  return START_NOT_STICKY;
	            }
	            boolean isLocationDelivery = intent != null
	                  && ACTION_PROCESS_LOCATION.equals(intent.getAction());
	            if (isLocationDelivery) {
	                  Location deliveredLocation = (Location) intent.getParcelableExtra(
	                        LocationManager.KEY_LOCATION_CHANGED);
	                  if (deliveredLocation != null) {
	                        RouteTrackingFileLogger.write("PENDING_SERVICE_LOCATION_RECEIVED provider="
	                              + deliveredLocation.getProvider() + " accuracy="
	                              + (deliveredLocation.hasAccuracy()
	                                    ? deliveredLocation.getAccuracy() : -1));
	                        if (gpsLocationListener == null) gpsLocationListener = new GpsListener();
	                        gpsLocationListener.onLocationChanged(deliveredLocation);
	                  } else {
	                        RouteTrackingFileLogger.write(
	                              "PENDING_SERVICE_LOCATION_RECEIVED without location payload");
	                  }
	            }
	            if (triggerService != null && triggerService.isAlive()) {
	                  if (isLocationDelivery) return START_STICKY;
	                  RouteTrackingFileLogger.write(
	                        "SERVICE_ALREADY_RUNNING refreshing location listeners");
	                  refreshLocationListeners();
	                  return START_STICKY;
	            }
	            triggerService = new Thread(new Runnable(){
	                  public void run(){
	                        try{
	                              Looper.prepare();//Initialize the current thread as a looper.
	                              lm = (LocationManager)getSystemService(Context.LOCATION_SERVICE);
	                              gpsLocationListener = new GpsListener();
	                              long minTime = LOCATION_INTERVAL_MS;
	                              // Apply the distance rule after accuracy and duplicate checks.
	                              float minDistance = 0;
	                              locationUpdatePendingIntent = createLocationUpdatePendingIntent();
	                              lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, minTime,
	                                          minDistance, locationUpdatePendingIntent);
	                              lm.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, minTime,
	                                          minDistance, locationUpdatePendingIntent);
	                              RouteTrackingFileLogger.write(
	                                    "LOCATION_PENDING_INTENT_STARTED intervalMs="
	                                    + LOCATION_INTERVAL_MS);
	                              locationHandler = new Handler();
	                              startRouteStateChecks();
	                              startGpsSyncSchedule();
	                              Looper.loop();
	                        }catch(Exception ex){
	                        	Log.e("Location EXception", "Exception in triggerService Thread");
	                              RouteTrackingFileLogger.write(
	                                    "LOCATION_LISTENER_ERROR " + ex.toString());
	                              System.out.println("Exception in triggerService Thread -- "+ex);
	                        }
	                  }
	            }, "myLocationThread");
	            triggerService.start();
	            return START_STICKY;
	      }

	      private void startRouteStateChecks() {
	            routeStateChecker = new Runnable() {
	                  public void run() {
	                        if (!hasOpenRoute(getApplicationContext())
	                              || !isGpsTrackingEnabled(getApplicationContext())) {
	                              RouteTrackingFileLogger.write(
	                                    "ROUTE_STATE_CHECK disabled or closed; stopping GPS tracking");
	                              cancelTrackingWatchdog(getApplicationContext());
	                              stopSelf();
	                              return;
	                        }
	                        if (locationHandler != null) {
	                              locationHandler.postDelayed(this, LOCATION_INTERVAL_MS);
	                        }
	                  }
	            };
	            locationHandler.post(routeStateChecker);
	            RouteTrackingFileLogger.write("ROUTE_STATE_CHECK_STARTED intervalMs="
	                  + LOCATION_INTERVAL_MS);
	      }

	      private void startGpsSyncSchedule() {
	            gpsSyncScheduler = new Runnable() {
	                  public void run() {
	                        if (!hasOpenRoute(getApplicationContext())
	                              || !isGpsTrackingEnabled(getApplicationContext())) return;
	                        getApplicationContext().startService(
	                              new Intent(getApplicationContext(), GpsSyncService.class));
	                        if (locationHandler != null) {
	                              locationHandler.postDelayed(this, SYNC_INTERVAL_MS);
	                        }
	                  }
	            };
	            // First upload check is five minutes after route tracking starts.
	            locationHandler.postDelayed(gpsSyncScheduler, SYNC_INTERVAL_MS);
	            RouteTrackingFileLogger.write("GPS_SYNC_SCHEDULE_STARTED intervalMs="
	                  + SYNC_INTERVAL_MS);
	      }

	      private void acquireTrackingWakeLock() {
	            try {
	                  PowerManager powerManager =
	                        (PowerManager) getSystemService(Context.POWER_SERVICE);
	                  trackingWakeLock = powerManager.newWakeLock(
	                        PowerManager.PARTIAL_WAKE_LOCK,
	                        "SFA:RouteTracking");
	                  trackingWakeLock.setReferenceCounted(false);
	                  trackingWakeLock.acquire();
	            } catch (Exception ex) {
	                  RouteTrackingFileLogger.write(
	                        "TRACKING_WAKE_LOCK_ERROR " + ex.toString());
	            }
	      }

	      private PendingIntent createLocationUpdatePendingIntent() {
	            Intent updateIntent = new Intent(this, LocationUpdateService.class);
	            updateIntent.setAction(ACTION_PROCESS_LOCATION);
	            return PendingIntent.getService(this, 0, updateIntent,
	                  PendingIntent.FLAG_UPDATE_CURRENT);
	      }

	      private void refreshLocationListeners() {
	            final Handler handler = locationHandler;
	            if (handler == null || lm == null || gpsLocationListener == null) {
	                  RouteTrackingFileLogger.write(
	                        "LOCATION_LISTENER_REFRESH_SKIPPED listener not ready");
	                  return;
	            }
	            handler.post(new Runnable() {
	                  public void run() {
	                        try {
	                              if (locationUpdatePendingIntent != null) {
	                                    lm.removeUpdates(locationUpdatePendingIntent);
	                              }
	                              locationUpdatePendingIntent = createLocationUpdatePendingIntent();
	                              lm.requestLocationUpdates(LocationManager.GPS_PROVIDER,
	                                    LOCATION_INTERVAL_MS, 0, locationUpdatePendingIntent);
	                              lm.requestLocationUpdates(LocationManager.NETWORK_PROVIDER,
	                                    LOCATION_INTERVAL_MS, 0, locationUpdatePendingIntent);
	                              RouteTrackingFileLogger.write(
	                                    "LOCATION_PENDING_INTENT_REFRESHED after service recovery");
	                        } catch (Exception ex) {
	                              Log.e("GPS_REFRESH", "Unable to refresh location listeners", ex);
	                              RouteTrackingFileLogger.write(
	                                    "LOCATION_LISTENER_REFRESH_ERROR " + ex.toString());
	                        }
	                  }
	            });
	      }

	      private Notification createTrackingNotification() {
	            NotificationManager manager =
	                  (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
	            createNotificationChannelIfRequired(manager);

	            Intent openAppIntent = new Intent(this, App.class);
	            openAppIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
	            int pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT;
	            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
	                  pendingFlags |= PendingIntent.FLAG_IMMUTABLE;
	            }
	            PendingIntent contentIntent = PendingIntent.getActivity(
	                  this, 0, openAppIntent, pendingFlags);

	            Notification.Builder builder = new Notification.Builder(this);
	            if (Build.VERSION.SDK_INT >= 26) {
	                  try {
	                        Method setChannelId = Notification.Builder.class.getMethod(
	                              "setChannelId", String.class);
	                        setChannelId.invoke(builder, NOTIFICATION_CHANNEL_ID);
	                  } catch (Exception ex) {
	                        Log.e("GPS_NOTIFICATION", "Unable to set notification channel", ex);
	                  }
	            }
	            return builder
	                  .setSmallIcon(R.drawable.icon)
	                  .setContentTitle("Route tracking active")
	                  .setContentText("Location is being recorded for the open route")
	                  .setContentIntent(contentIntent)
	                  .setOngoing(true)
	                  .setOnlyAlertOnce(true)
	                  .build();
	      }

	      private void createNotificationChannelIfRequired(NotificationManager manager) {
	            if (Build.VERSION.SDK_INT < 26) return;
	            try {
	                  Class<?> channelClass = Class.forName("android.app.NotificationChannel");
	                  Constructor<?> constructor = channelClass.getConstructor(
	                        String.class, CharSequence.class, int.class);
	                  Object channel = constructor.newInstance(
	                        NOTIFICATION_CHANNEL_ID, "Route tracking", 2);
	                  Method setDescription = channelClass.getMethod("setDescription", String.class);
	                  setDescription.invoke(channel, "Tracks the active sales route");
	                  Method createChannel = NotificationManager.class.getMethod(
	                        "createNotificationChannel", channelClass);
	                  createChannel.invoke(manager, channel);
	            } catch (Exception ex) {
	                  Log.e("GPS_NOTIFICATION", "Unable to create notification channel", ex);
	            }
	      }

	      @Override
	      public void onTaskRemoved(Intent rootIntent) {
	            RouteTrackingFileLogger.write("APP_TASK_REMOVED scheduling service recovery");
	            Intent restartIntent = new Intent(getApplicationContext(), LocationTrackingBootReceiver.class);
	            restartIntent.setAction(LocationTrackingBootReceiver.ACTION_RESTART_TRACKING);
	            int pendingFlags = PendingIntent.FLAG_ONE_SHOT;
	            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
	                  pendingFlags |= PendingIntent.FLAG_IMMUTABLE;
	            }
	            PendingIntent restartPendingIntent = PendingIntent.getBroadcast(
	                  getApplicationContext(), RESTART_REQUEST_CODE, restartIntent, pendingFlags);
	            AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
	            alarmManager.set(AlarmManager.RTC_WAKEUP,
	                  System.currentTimeMillis() + 1000L, restartPendingIntent);
	            super.onTaskRemoved(rootIntent);
	      }
	     
	      @Override
	      public void onDestroy() {
	            // TODO Auto-generated method stub
	            super.onDestroy();
	            removeGpsListener();
	            if (trackingWakeLock != null && trackingWakeLock.isHeld()) {
	                  trackingWakeLock.release();
	            }
	            RouteTrackingFileLogger.write("SERVICE_DESTROYED listeners removed");
	      }
	     
	      @Override
	      public IBinder onBind(Intent intent) {
	            // TODO Auto-generated method stub
	            return null;
	      }
	     
	      private void removeGpsListener(){
	            try{
	                  if (lm != null && gpsLocationListener != null) {
	                        lm.removeUpdates(gpsLocationListener);
	                  }
	                  if (lm != null && locationUpdatePendingIntent != null) {
	                        lm.removeUpdates(locationUpdatePendingIntent);
	                        locationUpdatePendingIntent.cancel();
	                  }
	                  if (locationHandler != null) {
	                        if (routeStateChecker != null) {
	                              locationHandler.removeCallbacks(routeStateChecker);
	                        }
	                        if (gpsSyncScheduler != null) {
	                              locationHandler.removeCallbacks(gpsSyncScheduler);
	                        }
	                        locationHandler.getLooper().quit();
	                  }
	            }
	            catch(Exception ex){
	            	Log.e("GPS Exception", "Exception in GPSService ---");
	                  System.out.println("Exception in GPSService --- "+ex);
	            }
	      }
	     
	      class GpsListener implements LocationListener{

	    	  public void onLocationChanged(Location location) {
	    		    if (location != null) {
	    		        RouteTrackingFileLogger.write("LOCATION_RECEIVED provider="
	    		                + location.getProvider() + " latitude=" + location.getLatitude()
	    		                + " longitude=" + location.getLongitude() + " accuracy="
	    		                + (location.hasAccuracy() ? location.getAccuracy() : -1)
	    		                + " capturedAt=" + location.getTime());
	    		    }
		    RouteInfo routeInfo = getOpenRouteInfo();
		    if (location == null || routeInfo == null) {
		        RouteTrackingFileLogger.write("LOCATION_IGNORED no open route or null location");
		        if (location != null) stopSelf();
		        return;
		    }

		    if (!isGpsTrackingEnabled(getApplicationContext())) {
		        RouteTrackingFileLogger.write("LOCATION_IGNORED GPS tracking disabled");
		        stopSelf();
		        return;
		    }

	    		    if (!location.hasAccuracy() || location.getAccuracy() > MAX_ACCURACY_METERS) {
	    		        Log.d("GPS_FILTER", "Ignored inaccurate location: " + location.getAccuracy() + "m");
	    		        RouteTrackingFileLogger.write("LOCATION_IGNORED accuracy="
	    		                + location.getAccuracy() + " maxAllowed=" + MAX_ACCURACY_METERS);
	    		        return;
	    		    }

	    		    long capturedAt = location.getTime();
	    		    if (capturedAt <= 0) capturedAt = System.currentTimeMillis();
	    		    if (capturedAt == lastSavedTimestamp) {
	    		        Log.d("GPS_FILTER", "Ignored duplicate timestamp: " + capturedAt);
	    		        RouteTrackingFileLogger.write(
	    		                "LOCATION_IGNORED duplicate captured timestamp=" + capturedAt);
	    		        return;
	    		    }

	    		    ensureLastSavedLocationLoaded(routeInfo.routeKey);
	    		    if (lastSavedLocation != null
	    		            && lastSavedLocation.distanceTo(location) < MIN_DISTANCE_METERS) {
	    		        Log.d("GPS_FILTER", "Ignored movement below 5 metres");
	    		        RouteTrackingFileLogger.write("LOCATION_IGNORED distance="
	    		                + lastSavedLocation.distanceTo(location) + " minDistance="
	    		                + MIN_DISTANCE_METERS);
	    		        return;
	    		    }

	    		    double latitude = location.getLatitude();
	    		    double longitude = location.getLongitude();
	    		    float speed = location.getSpeed();
	    		    String android_id = Secure.getString(getBaseContext().getContentResolver(), Secure.ANDROID_ID);

	    		    JSONObject obj = new JSONObject();
	    		    try {
	    		        obj.put("lat", latitude);
	    		        obj.put("log", longitude);
	    		        obj.put("deviceid", android_id);
	    		    } catch (JSONException e) {
	    		        e.printStackTrace();
	    		    }

	    		    String data = obj.toString();
	    		    Log.e("GPS DATA--->", data);

	    		    // Save to SQLite
	    		    DBHelper dbHelper = new DBHelper(getApplicationContext());
	    		    SQLiteDatabase db = dbHelper.getWritableDatabase();

	    		    String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date(capturedAt));
	    		    String captureDate = new SimpleDateFormat("yyyy-MM-dd").format(new java.util.Date(capturedAt));
	    		    String captureTime = new SimpleDateFormat("HH:mm:ss").format(new java.util.Date(capturedAt));
	    		    Cursor duplicateCursor = db.query("location_logs", new String[]{"id"},
	    		            "timestamp = ?", new String[]{timestamp}, null, null, null, "1");
	    		    boolean duplicateTimestamp = duplicateCursor.moveToFirst();
	    		    duplicateCursor.close();
	    		    if (duplicateTimestamp) {
	    		        Log.d("GPS_FILTER", "Ignored duplicate database timestamp: " + timestamp);
	    		        RouteTrackingFileLogger.write(
	    		                "LOCATION_IGNORED duplicate database timestamp=" + timestamp);
	    		        db.close();
	    		        return;
	    		    }

	    		    ContentValues values = new ContentValues();
	    		    values.put("latitude", latitude);
	    		    values.put("longitude", longitude);
	    		    values.put("routekey", routeInfo.routeKey);
	    		    values.put("routecode", routeInfo.routeCode);
	    		    values.put("salesmancode", routeInfo.salesmanCode);
	    		    values.put("date", captureDate);
	    		    values.put("time", captureTime);
	    		    values.put("deviceid", android_id);
	    		    values.put("timestamp", timestamp);
	    		    values.put("is_synced", 0);

	    		    long rowId = db.insert("location_logs", null, values);
	    		    Log.d("DB_INSERT", "Inserted row ID: " + rowId);
	    		    db.close();
	    		    if (rowId == -1) {
	    		        RouteTrackingFileLogger.write("LOCATION_INSERT_FAILED routekey="
	    		                + routeInfo.routeKey + " timestamp=" + timestamp);
	    		        return;
	    		    }
	    		    RouteTrackingFileLogger.write("LOCATION_INSERTED id=" + rowId
	    		            + " routekey=" + routeInfo.routeKey + " routecode="
	    		            + routeInfo.routeCode + " salesmancode=" + routeInfo.salesmanCode
	    		            + " latitude=" + latitude + " longitude=" + longitude
	    		            + " accuracy=" + location.getAccuracy() + " timestamp=" + timestamp
	    		            + " deviceid=" + android_id);

	    		    lastSavedLocation = new Location(location);
	    		    lastSavedTimestamp = capturedAt;

	    		    // Send to server
//	    		    UpdateCordinatesTask updatecordinatesTask = new UpdateCordinatesTask();
//	    		    updatecordinatesTask.execute("gpstrack=[" + data + "]");
	    		    
		    // Broadcast intent
	    		    Intent filterRes = new Intent(GPS_FILTER);
	    		    filterRes.putExtra("latitude", latitude);
	    		    filterRes.putExtra("longitude", longitude);
	    		    filterRes.putExtra("speed", speed);
	    		    sendBroadcast(filterRes);
	    		}

	    		private RouteInfo getOpenRouteInfo() {
	    		    DBHelper helper = new DBHelper(getApplicationContext());
	    		    SQLiteDatabase database = helper.getReadableDatabase();
	    		    Cursor cursor = null;
	    		    try {
	    		        cursor = database.rawQuery(
		                "SELECT routekey, routecode, salesmancode FROM startendday " +
		                "WHERE IFNULL(routeclosed, 0) = 0 " +
		                "ORDER BY routekey DESC LIMIT 1",
	    		                null);
	    		        if (!cursor.moveToFirst()) return null;
	    		        RouteInfo info = new RouteInfo();
	    		        info.routeKey = cursor.getString(0);
	    		        info.routeCode = cursor.getString(1);
	    		        info.salesmanCode = cursor.getString(2);
	    		        return info;
	    		    } catch (Exception ex) {
	    		        Log.e("GPS_ROUTE", "Unable to validate route state", ex);
	    		        return null;
	    		    } finally {
	    		        if (cursor != null) cursor.close();
	    		        database.close();
	    		    }
	    		}

	    		private void ensureLastSavedLocationLoaded(String routeKey) {
	    		    if (lastSavedLocation != null) return;
	    		    DBHelper helper = new DBHelper(getApplicationContext());
	    		    SQLiteDatabase database = helper.getReadableDatabase();
	    		    Cursor cursor = null;
	    		    try {
	    		        cursor = database.rawQuery(
	    		                "SELECT latitude, longitude, timestamp FROM location_logs " +
	    		                "WHERE routekey = ? ORDER BY id DESC LIMIT 1",
	    		                new String[]{routeKey});
	    		        if (cursor.moveToFirst()) {
	    		            Location saved = new Location("local_database");
	    		            saved.setLatitude(cursor.getDouble(0));
	    		            saved.setLongitude(cursor.getDouble(1));
	    		            lastSavedLocation = saved;
	    		            try {
	    		                lastSavedTimestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")
	    		                        .parse(cursor.getString(2)).getTime();
	    		            } catch (Exception ignored) {
	    		                lastSavedTimestamp = Long.MIN_VALUE;
	    		            }
	    		        }
	    		    } finally {
	    		        if (cursor != null) cursor.close();
	    		        database.close();
	    		    }
	    		}


	            public void onProviderDisabled(String provider) {
	                  // TODO Auto-generated method stub
	                 
	            }

	            public void onProviderEnabled(String provider) {
	                  // TODO Auto-generated method stub
	                 
	            }

	            public void onStatusChanged(String provider, int status, Bundle extras) {
	                  // TODO Auto-generated method stub
	                 
	            }

	      }
}



class UpdateCordinatesTask extends AsyncTask<String, Void, String> {

	protected String doInBackground(String... params) {
	
	//	android.os.Debug.waitForDebugger();
		
		String data = "";
		String url = Utility.LocationUpdateUrl+"?"+params[0];
		try {
			HttpConnection http = new HttpConnection();
			data = http.readUrl(url);
			Log.e("GPS SUCCESS-", "GPS UPDATED TO SERVER");
			 System.out.println("GPS UPDATED TO SERVER");
		} catch (Exception e) {
			Log.e("GPS FAILED-", "GPS UPDATION TO SERVER FAILED");
			 System.out.println("GPS UPDATION TO SERVER FAILED ");
			Log.d("Background Task", e.toString());
		}
		return data;
		
	

		
	}

	@Override
	protected void onPostExecute(String result) {
		super.onPostExecute(result);

	}

	private static String convertInputStreamToString(InputStream inputStream) throws IOException {
		BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
		String line = "";
		String result = "";
		while ((line = bufferedReader.readLine()) != null)
			result += line;

		inputStream.close();
		return result;
	

	}


}
