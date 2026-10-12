package com.phonegap.sfa;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class LocationTrackingBootReceiver extends BroadcastReceiver {
    public static final String ACTION_RESTART_TRACKING =
            "com.phonegap.sfa.action.RESTART_ROUTE_TRACKING";
    public static final String ACTION_WATCHDOG_TRACKING =
            "com.phonegap.sfa.action.WATCHDOG_ROUTE_TRACKING";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())
                || Intent.ACTION_MY_PACKAGE_REPLACED.equals(intent.getAction())
                || ACTION_RESTART_TRACKING.equals(intent.getAction())
                || ACTION_WATCHDOG_TRACKING.equals(intent.getAction())) {
            RouteTrackingFileLogger.write("RECOVERY_RECEIVED action=" + intent.getAction());
            LocationUpdateService.reconcileWithRouteState(context.getApplicationContext());
        }
    }
}
