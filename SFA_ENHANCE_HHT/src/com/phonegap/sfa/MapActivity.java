package com.phonegap.sfa;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.w3c.dom.Text;

import android.graphics.Color;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.CompoundButton.OnCheckedChangeListener;
import android.widget.TextView;
import android.widget.ToggleButton;

import com.google.android.gms.maps.CameraUpdate;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.PolylineOptions;

public class MapActivity extends FragmentActivity implements OnClickListener,
		LocationListener {

	private GoogleMap map;
	private JSONArray jRoutes;
	private ArrayList<LocationData> arrMarkers;
	private ArrayList<LocationData> arrMarkerssublist;
	private TextView btnBack;
	private MyProgressDialog progressDialog = null;
	private Location location;
	private ToggleButton tglSequence;

	@Override
	protected void onCreate(Bundle arg0) {
		// TODO Auto-generated method stub
		super.onCreate(arg0);
		setContentView(R.layout.sfa_map);

		try {
			SupportMapFragment fm = (SupportMapFragment) getSupportFragmentManager()
					.findFragmentById(R.id.map);
			map = fm.getMap();
			map.setMyLocationEnabled(true);

			// Getting LocationManager object from System Service LOCATION_SERVICE
			LocationManager locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);

			// Creating a criteria object to retrieve provider
			Criteria criteria = new Criteria();

			// Getting the name of the best provider
			String provider = locationManager.getBestProvider(criteria, true);

			// Getting Current Location
			location = locationManager.getLastKnownLocation(provider);

			if (location != null) {
				onLocationChanged(location);
			}
			locationManager.requestLocationUpdates(provider, 5000, 0, this);
			showProgressDialog();
			btnBack = (TextView) findViewById(R.id.btnBack);
			tglSequence = (ToggleButton) findViewById(R.id.tglLocation);
			tglSequence.setOnCheckedChangeListener(new OnCheckedChangeListener() {

				public void onCheckedChanged(CompoundButton buttonView,
						boolean isChecked) {
					if (map != null) {
						map.clear();

					}

					if (isChecked) {
						Collections.sort(arrMarkerssublist,
								new SequenceComparator());
						showMap();
					} else {
						Collections.sort(arrMarkerssublist, new CustomComparator());
						showMap();
					}
				}
			});
			btnBack.setOnClickListener(this);
			Bundle b = getIntent().getExtras();
			if (b != null && b.containsKey((MapHelper.PARAM_GEO))) {
				Log.d("Array", "" + b.getString(MapHelper.PARAM_GEO));
				try {

					JSONArray jArray = new JSONArray(
							b.getString(MapHelper.PARAM_GEO));

					JSONObject jobject = jArray.getJSONObject(0);
					jRoutes = jobject.getJSONArray("array");

					filterRecords();
				} catch (JSONException e) {
					e.printStackTrace();
				}

			} else {
				finish();
			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	private void showMap() {
		try {

			MarkerOptions options = new MarkerOptions();
			boolean validCoordinates = false;
			for (int i = 0; i < arrMarkerssublist.size(); i++) {

				if (arrMarkerssublist.get(i).getLatLng().latitude != 0.0
						&& arrMarkerssublist.get(i).getLatLng().longitude != 0.0) {
					options.position(arrMarkerssublist.get(i).getLatLng());
					Log.e("Sequence", ""
							+ arrMarkerssublist.get(i).getCustomer_sequence());
					validCoordinates = true;
				}
			}

			if (validCoordinates) {
				//map.addMarker(options);

				String url = getMapsApiDirectionsUrl();
				Log.e("Direction Url", "" + url);
				ReadTask downloadTask = new ReadTask();
				downloadTask.execute(url);
		
				addMarkers();
				
			}else{
				dismissProgressDialog();
			}
		//	 setPOIZoomLevelForMapV2Route(arrMarkers, map);

			// Zoom in, animating the camera.

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private void addMarkers() {
		if (map != null) {

			for (int i = 0; i < arrMarkerssublist.size(); i++) {

				map.addMarker(new MarkerOptions()
						.position(arrMarkerssublist.get(i).getLatLng())
						.icon(i == 0 ? BitmapDescriptorFactory
								.fromResource(R.drawable.map_pin)
								: BitmapDescriptorFactory
										.fromResource(R.drawable.pinred))
						.title("" + arrMarkerssublist.get(i).getCustomerName())
						.snippet(
								"" + arrMarkerssublist.get(i).getCustomerCode()));

			}

		}

	}

	private String getMapsApiDirectionsUrl() {
		String url = "";
		if (arrMarkerssublist != null && arrMarkerssublist.size() > 0) {
			String waypoints = "origin="
					+ arrMarkerssublist.get(0).getLatLng().latitude
					+ ","
					+ arrMarkerssublist.get(0).getLatLng().longitude
					+ "&destination="
					+ arrMarkerssublist.get(arrMarkerssublist.size() - 1)
							.getLatLng().latitude
					+ ","
					+ arrMarkerssublist.get(arrMarkerssublist.size() - 1)
							.getLatLng().longitude + "&waypoints=|";

			String wayPoitsData = "";
			for (int i = 0; i < arrMarkerssublist.size(); i++) {

				wayPoitsData = wayPoitsData + "|"
						+ arrMarkerssublist.get(i).getLatLng().latitude + ","
						+ arrMarkerssublist.get(i).getLatLng().longitude + "|";
			}

			waypoints = waypoints + wayPoitsData;

			String sensor = "sensor=false";
			String params = waypoints + "&" + sensor;
			String output = "json";
			url = "https://maps.googleapis.com/maps/api/directions/" + output
					+ "?" + params;
		}
		return url;
	}

	public void setPOIZoomLevelForMapV2Route(ArrayList<LocationData> pointList,
			GoogleMap mapview) {

		try {

			LatLngBounds.Builder builder = new LatLngBounds.Builder();

			for (LocationData item : pointList) {
				builder.include(item.getLatLng());
			}
			LatLngBounds bounds = builder.build();
			int padding = 50; // offset from edges of the map in pixels
			CameraUpdate cu = CameraUpdateFactory.newLatLngBounds(bounds,
					padding);
			mapview.animateCamera(cu);

		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	
	private class ReadTask extends AsyncTask<String, Void, String> {
		@Override
		protected String doInBackground(String... url) {
			String data = "";
			try {
				HttpConnection http = new HttpConnection();
				data = http.readUrl(url[0]);
			} catch (Exception e) {
				Log.d("Background Task", e.toString());
			}
			return data;
		}

		@Override
		protected void onPostExecute(String result) {
			super.onPostExecute(result);
			dismissProgressDialog();
			try{
			new ParserTask().execute(result);
			
			}catch(Exception e){
				e.printStackTrace();
			}
		}
	}

	private class ParserTask extends
			AsyncTask<String, Integer, List<List<HashMap<String, String>>>> {

		@Override
		protected List<List<HashMap<String, String>>> doInBackground(
				String... jsonData) {

			JSONObject jObject;
			List<List<HashMap<String, String>>> routes = null;

			try {
				jObject = new JSONObject(jsonData[0]);
				PathJSONParser parser = new PathJSONParser();
				routes = parser.parse(jObject);
				
			} catch (Exception e) {
				e.printStackTrace();
			}
			return routes;
		}

		@Override
		protected void onPostExecute(List<List<HashMap<String, String>>> routes) {
			ArrayList<LatLng> points = null;
			PolylineOptions polyLineOptions = null;

			// traversing through routes
			for (int i = 0; i < routes.size(); i++) {
				points = new ArrayList<LatLng>();
				polyLineOptions = new PolylineOptions();
				List<HashMap<String, String>> path = routes.get(i);

				for (int j = 0; j < path.size(); j++) {
					HashMap<String, String> point = path.get(j);

					double lat = Double.parseDouble(point.get("lat"));
					double lng = Double.parseDouble(point.get("lng"));
					LatLng position = new LatLng(lat, lng);

					points.add(position);
				}

				polyLineOptions.addAll(points);
				polyLineOptions.width(2);
				polyLineOptions.color(Color.RED);
			}
			if (polyLineOptions != null) {
				map.addPolyline(polyLineOptions);
				setPOIZoomLevelForMapV2Route(arrMarkers, map);
			}
		}
	}

	public void onClick(View v) {
		if (v.getId() == R.id.btnBack) {

			finish();
		}
	}

	public void onLocationChanged(Location location) {
		// Getting latitude of the current location
		double latitude = location.getLatitude();

		// Getting longitude of the current location
		double longitude = location.getLongitude();

		// Creating a LatLng object for the current location
		LatLng latLng = new LatLng(latitude, longitude);

		// // Showing the current location in Google Map
		// map.moveCamera(CameraUpdateFactory.newLatLng(latLng));
		// //
		// // // Zoom in the Google Map
		// map.animateCamera(CameraUpdateFactory.zoomTo(15));

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

	public double distance(LatLng StartP, LatLng EndP) {
		double lat1 = StartP.latitude;
		double lat2 = EndP.latitude;
		double lon1 = StartP.longitude;
		double lon2 = EndP.longitude;
		double dLat = Math.toRadians(lat2 - lat1);
		double dLon = Math.toRadians(lon2 - lon1);
		double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
				+ Math.cos(Math.toRadians(lat1))
				* Math.cos(Math.toRadians(lat2)) * Math.sin(dLon / 2)
				* Math.sin(dLon / 2);
		double c = 2 * Math.asin(Math.sqrt(a));
		return 6366000 * c;
	}

	private void filterRecords() {

		arrMarkers = new ArrayList<LocationData>();
		arrMarkerssublist = new ArrayList<LocationData>();
		int sequence = 0;
		for (int i = 0; i < jRoutes.length(); i++) {

			try {
				JSONObject jLatLngs = jRoutes.getJSONObject(i);

				LatLng latLng = new LatLng(jLatLngs.getDouble("fixedlatitude"),
						jLatLngs.getDouble("fixedlongitude"));
				if (latLng.latitude != 0.0 && latLng.longitude != 0.0) {
					LocationData locationData = new LocationData();
					locationData.setCustomerCode(jLatLngs
							.getString("customername"));
				/*	locationData.setCustomerName(jLatLngs
							.getString("customercode"));*/
					locationData.setCustomerName(jLatLngs
							.getString("ancustomercode"));
					
	
					
					locationData.setCustomer_sequence(sequence);
					sequence = sequence + 1;

					locationData.setLatLng(latLng);
					if (location != null) {

						Log.e("My Location",
								"My Location" + location.getLatitude());
						Log.e("My Location",
								"My Location" + location.getLongitude());
						double distance = distance(
								new LatLng(location.getLatitude(),
										location.getLongitude()),
								locationData.getLatLng());
						locationData.setDistance(distance);
					}
					arrMarkers.add(locationData);

				}
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		}
		try {
			if (arrMarkers.size() > 0) {
				Collections.sort(arrMarkers, new CustomComparator());
				if (arrMarkers != null && arrMarkers.size() >= 8) {

					for (int i = 0; i < arrMarkers.size(); i++) {
						Log.e("Distance", "Distance is"
								+ arrMarkers.get(i).getDistance());
						// org line sujee commented 
						/*if (i < 8) {
							arrMarkerssublist.add(arrMarkers.get(i));
						}*/
						// show all sequence customers 08/10/2018
						if (i < arrMarkers.size()) {
							arrMarkerssublist.add(arrMarkers.get(i));
						}

					}
					Log.e("Markers size", "" + arrMarkerssublist.size());
				} else {
					arrMarkerssublist = arrMarkers;
				}

				showMap();

			}else{
				
				dismissProgressDialog();
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	/**
	 * Display custom progress dialog
	 */
	public void showProgressDialog() {
		progressDialog = new MyProgressDialog(this);
	}

	public void dismissProgressDialog() {

		runOnUiThread(new Runnable() {
			public void run() {
				// Log.e("Progress **:", "Progress ******");
				if (progressDialog != null && progressDialog.isShowing()) {
					progressDialog.dismiss();
					progressDialog = null;
					Log.e("Progress **:", "Progress ******");
				}
			}
		});
	}

	public class CustomComparator implements Comparator<LocationData> {

		public int compare(LocationData o1, LocationData o2) {
			return (int) o1.getDistance() - (int) o2.getDistance();
		}
	}

	public class SequenceComparator implements Comparator<LocationData> {

		public int compare(LocationData o1, LocationData o2) {
			return (int) o1.getCustomer_sequence()
					- (int) o2.getCustomer_sequence();
		}
	}

}
