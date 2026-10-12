package com.phonegap.sfa;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.text.SimpleDateFormat;
import java.util.Date;

import android.os.Environment;
import android.util.Log;

public final class RouteTrackingFileLogger {
    private static final Object FILE_LOCK = new Object();
    private static final String TAG = "GPS_FILE_LOG";

    private RouteTrackingFileLogger() {
    }

    public static void write(String message) {
        //writeToDownloads("SFA_GPS_Tracking_", message);
    }

    public static void writeSending(String message) {
       // writeToDownloads("SFA_GPS_Sending_", message);
    }

    private static void writeToDownloads(String filePrefix, String message) {
        synchronized (FILE_LOCK) {
            BufferedWriter writer = null;
            try {
                File downloads = Environment.getExternalStoragePublicDirectory(
                        Environment.DIRECTORY_DOWNLOADS);
                if (!downloads.exists() && !downloads.mkdirs()) {
                    Log.e(TAG, "Unable to create Downloads directory");
                    return;
                }

                String day = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
                File logFile = new File(downloads, filePrefix + day + ".log");
                writer = new BufferedWriter(new FileWriter(logFile, true));
                String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS")
                        .format(new Date());
                writer.write(timestamp + " | " + message);
                writer.newLine();
            } catch (Exception ex) {
                Log.e(TAG, "Unable to write GPS tracking log", ex);
            } finally {
                if (writer != null) {
                    try {
                        writer.close();
                    } catch (Exception ignored) {
                    }
                }
            }
        }
    }
}
