package com.phonegap.sfa;

import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesClient;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.location.LocationClient;
import com.google.android.gms.location.LocationListener;
import com.google.android.gms.location.LocationRequest;



public class LocationHelper_old extends org.apache.cordova.api.Plugin implements LocationListener,
		GooglePlayServicesClient.ConnectionCallbacks,
		GooglePlayServicesClient.OnConnectionFailedListener {
	private JSONObject status;
	private String callbackId = "";
	// A request to connect to Location Services
	private LocationRequest mLocationRequest;
	private boolean isTimerOff = false;
	// Stores the current instantiation of the location client in this object
	private LocationClient mLocationClient;
	private double lat = 0.0, lng = 0.0;

	@Override
	public PluginResult execute(String request, JSONArray querystring,
			String callbackId) {

		PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
		result.setKeepCallback(true);
		try {
			this.callbackId = callbackId;
			status = new JSONObject();
			Log.d("Init called", "init");
			status.put("state", true);
			this.init();

		} catch (Exception e) {

			e.printStackTrace();
		}
		return result;
	}

	private void init() {
		Log.d("Init called", "init cALLLED");
		// Create a new global location parameters object

		LocationManager manager = (LocationManager) cordova.getActivity()
				.getSystemService(cordova.getActivity().LOCATION_SERVICE);

		if (!manager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
			cordova.getActivity().runOnUiThread(new Runnable() {
				
				public void run() {
					// TODO Auto-generated method stub
					buildAlertMessageNoGps();
				}
			});
			
//			Toast.makeText(cordova.getActivity(), "Gps Is Disabled"+manager.isProviderEnabled(LocationManager.GPS_PROVIDER), Toast.LENGTH_LONG).show();
		} else {
//			Toast.makeText(cordova.getActivity(), "Gps Is Disabled"+manager.isProviderEnabled(LocationManager.GPS_PROVIDER), Toast.LENGTH_LONG).show();
			mLocationRequest = LocationRequest.create();

			/*
			 * Set the update interval
			 */
			mLocationRequest
					.setInterval(LocationUtils.UPDATE_INTERVAL_IN_MILLISECONDS);

			// Use high accuracy
			mLocationRequest
					.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);

			// Set the interval ceiling to one minute
			mLocationRequest
					.setFastestInterval(LocationUtils.FAST_INTERVAL_CEILING_IN_MILLISECONDS);

			/*
			 * Create a new location client, using the enclosing class to handle
			 * callbacks.
			 */
			mLocationClient = new LocationClient(cordova.getActivity(), this,
					this);
			this.connect();
		}
	}

	private void connect() {
		Log.d("Init called", "Connect cALLLED");
		mLocationClient.connect();

	}

	private void disConnect() {
		mLocationClient.disconnect();
	}

	@Override
	public void onDestroy() {
		// TODO Auto-generated method stub
		super.onDestroy();

	}

	private void sendUpdate(JSONObject obj, boolean keepCallback) {
		if (callbackId != null) {

			PluginResult result = new PluginResult(PluginResult.Status.OK, obj);
//			result.setKeepCallback(true);
			success(result, this.callbackId);
		}
	}

	public void onConnectionFailed(ConnectionResult arg0) {
		try {
			status.put("state", false);
			status.put("message", "Connection failed");

		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		sendUpdate(status, true);

	}

	public void onConnected(Bundle arg0) {
		Log.d("Init called", "Connect Called");
		// this.getLocation();
		if (servicesConnected()) {
			
//			Location currentLocation = mLocationClient.getLastLocation();
//			if (currentLocation != null) {
//				lat = currentLocation.getLatitude();
//				lng = currentLocation.getLongitude();
//			}
			startPeriodicUpdates();

			new Handler().postDelayed(new Runnable() {

				public void run() {
					if (lat != 0.0 && lng != 0.0) {
						try {
							status.put("state", true);
							status.put("message", "Location fetched");
							status.put("lat", lat);
							status.put("lng", lng);
							//Toast.makeText(cordova.getActivity(), "Location Changed Latitude"+lat+"Longitude"+lng+"", Toast.LENGTH_LONG).show();

						} catch (JSONException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						} finally {
							sendUpdate(status, true);
							// getAddress(currentLocation);
						}
					} else {
						try {
							status.put("state", false);
							status.put("lat", "0");
							status.put("lng", "0");
							status.put("message", "Failed to fetch Coordinates");

						} catch (JSONException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
						sendUpdate(status, true);

					}

				}
			}, 10000);
		} else {
			try {
				status.put("state", false);
				status.put("lat", "0");
				status.put("lng", "0");
				status.put("message", "Service not available");

			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			sendUpdate(status, true);

		}

	}

	public void onDisconnected() {
		Log.d("Init called", "disconnexted cALLLED");
	}

	public void onLocationChanged(Location location) {

		if (location != null && location.getLatitude() != 0.0
				&& location.getLongitude() != 0.0) {
			
			lat = location.getLatitude();
			lng = location.getLongitude();
			
		}
	}

	public void getLocation() {

		// If Google Play Services is available
		if (servicesConnected()) {

			// Get the current location
			Location currentLocation = mLocationClient.getLastLocation();
			if (currentLocation != null) {
				Log.d("Location", "Location" + currentLocation.getLatitude());
				Log.d("Init called", "init");
				try {
					status.put("state", true);
					status.put("message", "Location fetched");
					status.put("lat", currentLocation.getLatitude());
					status.put("lng", currentLocation.getLongitude());

				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} finally {
					sendUpdate(status, true);
					// getAddress(currentLocation);
				}
			} else {
				try {
					status.put("lat", "0");
					status.put("lng", "0");
					status.put("state", false);
					status.put("message", "Google Play Services missing!");

				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				sendUpdate(status, true);

			}
			// Display the current location in the UI

		} else {

			try {
				status.put("state", false);
				status.put("lat", "0");
				status.put("lng", "0");
				status.put("message", "Google Play Services missing!");

			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			sendUpdate(status, true);

		}
	}

	private boolean servicesConnected() {

		// Check that Google Play services is available
		int resultCode = GooglePlayServicesUtil
				.isGooglePlayServicesAvailable(cordova.getActivity());

		// If Google Play services is available
		if (ConnectionResult.SUCCESS == resultCode) {
			// In debug mode, log the status
			Log.d(LocationUtils.APPTAG, "Services Available");

			// Continue
			return true;
			// Google Play services was not available for some reason
		} else {
			// Display an error dialog
			showMessage("Google Play services missing,Please download it to use geocoding");
			Log.d(LocationUtils.APPTAG, "Services missing");

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

	private void showMessage(String msg) {

		new AlertDialog.Builder(cordova.getActivity())
				.setTitle("SFA")
				.setMessage(msg)
				.setPositiveButton(android.R.string.ok,
						new DialogInterface.OnClickListener() {
							public void onClick(DialogInterface dialog,
									int which) {
								dialog.dismiss();
								// InstallAPK(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
								// + "/TEStapk.apk");
							}
						}).setIcon(android.R.drawable.ic_dialog_alert).show();

	}

	private void buildAlertMessageNoGps() {
		AlertDialog.Builder builder = new AlertDialog.Builder(
				cordova.getActivity());
		builder.setMessage(
				"Your GPS seems to be disabled, do you want to enable it?")
				.setCancelable(false)
				.setPositiveButton("Settings",
						new DialogInterface.OnClickListener() {
							public void onClick(
									DialogInterface dialog,
									 int id) {
								cordova.getActivity()
										.startActivity(
												new Intent(
														android.provider.Settings.ACTION_LOCATION_SOURCE_SETTINGS));
							}
						});
				
		final AlertDialog alert = builder.create();
		alert.show();
	}
}
