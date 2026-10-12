package com.phonegap.sfa;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;

public class Utility {

	
	 //public static final String LocationUpdateUrl="http://enomsfa01.westeurope.cloudapp.azure.com:8095/sfa/enhancetest/api/ws/routetrack";  //test
	
	//public static final String LocationUpdateUrl="http://enomsfa01.westeurope.cloudapp.azure.com:8095/sfa/enhance_live/api/ws/routetrack1";  //oracle
	
	//commented due to server response issue - aswin 30-06-2025
	 //public static final String LocationUpdateUrl="http://enomsfa01.westeurope.cloudapp.azure.com:8095/sfa/enhance_live/api/ws/routetrack2";
	public static final String LocationUpdateUrl="https://routetrackmicroservice.enhance-group.com/api/v1/routeTrack";
	//public static final String LocationUpdateUrl="";
	
	public interface getGpsStatus{
		public void IsAvailable();
	}
	public static void scheduleLTService(Context c) {
		Intent mIntent = new Intent(c, LocationTrackService.class);
		PendingIntent mPendingIntent = PendingIntent.getService(c, LocationTrackService.HBSERVICE_ALARMID, mIntent, 0);
		AlarmManager alarmManager = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
		alarmManager.setRepeating(AlarmManager.RTC_WAKEUP, System.currentTimeMillis(), LocationTrackService.INTERVAL,
				mPendingIntent);
	}

	public static void cancelLTServiceSchedule(Context c) {
		Intent mIntent = new Intent(c, LocationTrackService.class);
		PendingIntent mPendingIntent = PendingIntent.getService(c, LocationTrackService.HBSERVICE_ALARMID, mIntent, 0);
		AlarmManager alarmManager = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
		alarmManager.cancel(mPendingIntent);
	}

	
	
}
