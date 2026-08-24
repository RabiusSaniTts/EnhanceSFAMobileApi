package com.phonegap.sfa;

import android.app.Service;
import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.provider.Settings.Secure;
import android.util.Log;
import android.view.View;

import org.apache.cordova.api.PluginResult;
import org.apache.cordova.api.Plugin;


import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import org.apache.cordova.api.Plugin;


import android.app.Activity;

import org.json.JSONException;
import org.json.JSONObject;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesClient;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.location.LocationClient;
import com.google.android.gms.location.LocationListener;
import com.google.android.gms.location.LocationRequest;

public class LocationTrackService extends Service implements LocationListener,
		GooglePlayServicesClient.ConnectionCallbacks,
		GooglePlayServicesClient.OnConnectionFailedListener {
	private LocationRequest mLocationRequest;
	private LocationClient mLocationClient;
	private double lat = 0.0, lng = 0.0;
	private JSONObject status;
	public static final int HBSERVICE_ALARMID = 1;
	public static final long INTERVAL = 5 * 60 * 1000;
	private  GPSTracker gpstracker;
	private Logger logger;

	@Override
	public IBinder onBind(Intent intent) {
		return null;
	}

	@Override
	public void onCreate() {
		super.onCreate();
		
		mLocationRequest = LocationRequest.create();
		mLocationRequest
				.setInterval(LocationUtils.UPDATE_INTERVAL_IN_MILLISECONDS);
		mLocationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
		mLocationRequest
				.setFastestInterval(LocationUtils.FAST_INTERVAL_CEILING_IN_MILLISECONDS);
		mLocationClient = new LocationClient(this, this, this);
		
	}

	private void connect() {
		Log.d("Init called", "Connect Called");
		mLocationClient.connect();

	}

	private void disConnect() {
		mLocationClient.disconnect();
	}

	@Override
	public void onDestroy() {

		super.onDestroy();
	}

	@Override
	public int onStartCommand(Intent intent, int flags, int startId) {
		this.connect();
		return super.onStartCommand(intent, flags, startId);
		
		
	}

	public void onConnectionFailed(ConnectionResult arg0) {
		Log.d("Location", "Connection Failed");
	}

	public void onConnected(Bundle arg0) {
		// org line sujee commented 
		if (servicesConnected()) {
			Log.e("Location", "Service track Connected");
			startPeriodicUpdates();
			
		}else{
			
		
			Log.e("Location", "Service track Disconnected");
		}
		
		//checkGooglePlayServicesAvailale();
	}

/*private void checkGooglePlayServicesAvailale(){
		
		if(servicesConnected()){
			
			startPeriodicUpdates();
			
		}else{
		
			cordova.getActivity().runOnUiThread(new Runnable() {
				
				public void run() {
					// TODO Auto-generated method stub
					 gpstracker=new GPSTracker(cordova.getActivity(), null);
				}
			});
			
			cordova.getActivity().runOnUiThread(new Runnable() {
				
				public void run() {
					// TODO Auto-generated method stub
					new Handler().postDelayed(new Runnable() {
						
						public void run() {
							
							
									// TODO Auto-generated method stub
									if(gpstracker.canGetLocation() && gpstracker.getLatitude()!=0 && gpstracker.getLongitude()!=0){
										
										try {
											
											logger.appendLog("Getting Location Accuracy "+gpstracker.getLocation().getAccuracy());
												
											if(gpstracker.getLocation().getAccuracy()<25){
												
												logger.appendLog("Getting Location "+gpstracker.getLatitude()+" Lon"+gpstracker.getLongitude());
												status.put("state", true);
												status.put("message", "Location fetched");
												status.put("lat", gpstracker.getLatitude());
												status.put("lng", gpstracker.getLongitude());
												startPeriodicUpdates();
												Log.e("Success--", "Location fetched");
												
											}else{
												logger.appendLog("Getting Location Less Accuracy "+gpstracker.getLatitude()+" Lon"+gpstracker.getLongitude());
												
												status.put("state", false);
												status.put("lat", "0");
												status.put("lng", "0");
												status.put("message", "Failed to fetch Coordinates");
												startPeriodicUpdates();
												Log.e("Failed--", "Failed to fetch Coordinates");
												
												
											}
											
											
											
										} catch (JSONException e) {
											// TODO Auto-generated catch block
											e.printStackTrace();
										}
										
									}else{
										try {
											status.put("state", false);
											status.put("lat", "0");
											status.put("lng", "0");
											status.put("message", "Failed to fetch Coordinates");
											Log.e("Error--", "Failed to fetch Coordinates");
										} catch (JSONException e) {
											// TODO Auto-generated catch block
											e.printStackTrace();
										}
										
										
									}
								
							
							
						}
					}, 10000);
				}
			});
			
			
		}
	
		
	}
	*/
	public void onDisconnected() {

	}

	public void onLocationChanged(Location location) {
		Log.e("Location", "Location Changed");
		if (location != null && location.getLatitude() != 0.0 && location.getLongitude() != 0.0) {
			lat = location.getLatitude();
			lng = location.getLongitude();
		} else {
			lat = mLocationClient.getLastLocation().getLatitude();
			lng = mLocationClient.getLastLocation().getLongitude();
		}
		stopPeriodicUpdates();
		if (lat != 0.0 && lng != 0.0) {
			disConnect();
			stopSelf();
			Log.e("Location", "LAT" + lat + " Long" + lng);
			// Send To server

			/* Code to send data to the server */

			updateLocation(lat, lng);

		}

	}
	private void updateLocation(double latitude, double longitude) {
		JSONObject obj = new JSONObject();
		SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
		SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm:ss");
		Date date = new Date();
		String dateString = dateFormat.format(date);
		Calendar cal = Calendar.getInstance();
		String time = timeFormat.format(cal.getTime());

		String android_id = Secure.getString(getBaseContext().getContentResolver(), Secure.ANDROID_ID);
		try {
			
			obj.put("lat", latitude);
			obj.put("log", longitude);
			obj.put("deviceid", android_id);
			// obj.put("date", dateString);
			// obj.put("time", time);
			//Log.e("Device Id --- Sujee --- ",  android_id );
			//status.put("message",  android_id );
			
			String data = obj.toString();

			UpdateLocationTask updateLocationTask = new UpdateLocationTask();
			updateLocationTask.execute("gpstrack=[" + data+"]");

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}
	
	private boolean servicesConnected() {

		// Check that Google Play services is available
		int resultCode = GooglePlayServicesUtil
				.isGooglePlayServicesAvailable(this);

		// If Google Play services is available
		if (ConnectionResult.SUCCESS == resultCode) {
			// In debug mode, log the status
			Log.e(LocationUtils.APPTAG, "Services connection Available");
			// Continue
			return true;
			// Google Play services was not available for some reason
		} else {
			// Display an error dialog
			Log.e(LocationUtils.APPTAG, "Services missing");

			return false;
		}
	}

	public void startUpdates(View v) {

		if (servicesConnected()) {
			startPeriodicUpdates();
		}
	}

	/**
	 * Invoked by the "Stop Updates" button Sends a request to remove location
	 * updates request them.
	 * 
	 * @param v
	 *            The view object associated with this method, in this case a
	 *            Button.
	 */
	public void stopUpdates(View v) {

		if (servicesConnected()) {
			stopPeriodicUpdates();
		}
	}

	/**
	 * In response to a request to start updates, send a request to Location
	 * Services
	 */
	private void startPeriodicUpdates() {

		mLocationClient.requestLocationUpdates(mLocationRequest, this);
	}

	/**
	 * In response to a request to stop updates, send a request to Location
	 * Services
	 */
	private void stopPeriodicUpdates() {
		mLocationClient.removeLocationUpdates(this);
	}

}


class UpdateLocationTask extends AsyncTask<String, Void, String> {

	protected String doInBackground(String... params) {
	
		//android.os.Debug.waitForDebugger();
		
		String data = "";
		String url = Utility.LocationUpdateUrl+"?"+params[0];
		try {
			HttpConnection http = new HttpConnection();
			data = http.readUrl(url);
		} catch (Exception e) {
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
