package com.phonegap.sfa;

import java.util.ArrayList;
import java.util.Set;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.util.Log;
import android.widget.Toast;

public class BluetoothHelper extends Plugin {

	private JSONObject status;

	private JSONArray jArr;
	private BluetoothAdapter mBtAdapter;
	private String callbackId = "";
	private boolean isExceptionThrown = false;
	private String currentMacAddress = "";
	private ArrayList<BluetoothDevice> devices;
	private String reqMacaddress = "";

	@Override
	public PluginResult execute(String request, JSONArray querystring,
			String callbackId) {
		// TODO Auto-generated method stub
		try {
			status = new JSONObject();
			status.put("status", true);
			this.jArr = querystring;
			this.callbackId = callbackId;
			mBtAdapter = BluetoothAdapter.getDefaultAdapter();
			if (request.equals("1")) {
				this.fetch();
			} else {

				reqMacaddress = request;
				IntentFilter filter = new IntentFilter(
						BluetoothDevice.ACTION_FOUND);
				cordova.getActivity().registerReceiver(myReceiver, filter);
				mBtAdapter.startDiscovery();
				devices = new ArrayList<BluetoothDevice>();
				cordova.getActivity().runOnUiThread(new Runnable() {

					public void run() {
						// TODO Auto-generated method stub
						registerHandler();
					}
				});

			}

		} catch (Exception e) {
			e.printStackTrace();
		} finally {

		}
		PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
		result.setKeepCallback(true);
		return result;

	}

	private void registerHandler() {

		new Handler().postDelayed(new Runnable() {

			public void run() {
				boolean Available = false;
				for (int i = 0; i < devices.size(); i++) {
					if (devices.get(i).getAddress().equals(reqMacaddress)) {
						Available = true;
						try {
							JSONObject jObject = new JSONObject();
							try {
								jObject.put("name", devices.get(i).getName());
								jObject.put("address", devices.get(i)
										.getAddress());
							} catch (JSONException e) {
								// TODO Auto-generated catch block
								e.printStackTrace();
							}
							status.put("status", true);
							status.put("devices", jObject.toString());

						} catch (JSONException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
						sendUpdate(status, true);
						break;

					}

				}

				if (!Available) {
					try {
						status.put("status", false);
					} catch (JSONException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
					sendUpdate(status, false);
				}

			}
		}, 9000);

	}

	@Override
	public void onDestroy() {
		// TODO Auto-generated method stub
		super.onDestroy();
		cordova.getActivity().unregisterReceiver(myReceiver);
	}

	private BroadcastReceiver myReceiver = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			Message msg = Message.obtain();
			String action = intent.getAction();
			if (BluetoothDevice.ACTION_FOUND.equals(action)) {
				//Toast.makeText(context, "ACTION_FOUND", Toast.LENGTH_SHORT).show();

				BluetoothDevice device = intent
						.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);

				devices.add(device);
//				JSONObject jObject = new JSONObject();
//				try {
//					jObject.put("name", device.getName());
//					jObject.put("address", device.getAddress());
//
//				} catch (JSONException e) {
//					// TODO Auto-generated catch block
//					e.printStackTrace();
//				}
//
//				try {
//					status.put("status", true);
//					status.put("devices", jObject.toString());
//
//				} catch (JSONException e) {
//					// TODO Auto-generated catch block
//					e.printStackTrace();
//				}
//				sendUpdate(status, true);

			}
		}
	};

	public void fetch() {

		Looper.prepare();

		jArr = new JSONArray();
		// Get a set of currently paired devices
		Set<BluetoothDevice> pairedDevices = mBtAdapter.getBondedDevices();
		if (pairedDevices.size() > 0) {

			for (BluetoothDevice device : pairedDevices) {
				Log.e("devices", device.getName() + "\n" + device.getAddress());
				System.out.println("devices" + device.getName() + "\n"
						+ device.getAddress());

				JSONObject jObject = new JSONObject();
				try {
					status.put("name", device.getName());
					status.put("address", device.getAddress());
					//jArr.put(jObject);
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

			}

			try {
				
				status.put("status", true);
			//	status.put("devices", jArr.toString());

			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			sendUpdate(status, true);

		} else {
			Toast t = Toast.makeText(cordova.getActivity()
					.getApplicationContext(), "No Devices Found!",
					Toast.LENGTH_SHORT);
			t.show();
			System.out.println("No devices");
			Log.e("devices", "No devices");
			try {
				status.put("status", false);
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			sendUpdate(status, true);
		}
		Looper.loop();
		/*
		 * if (mBtAdapter.isDiscovering()) { mBtAdapter.cancelDiscovery(); } //
		 * Request discover from BluetoothAdapter mBtAdapter.startDiscovery();
		 */

	}

	private void sendUpdate(JSONObject obj, boolean keepCallback) {
		if (this.callbackId != null) {

			PluginResult result = new PluginResult(PluginResult.Status.OK, obj);
			result.setKeepCallback(keepCallback);
			this.success(result, this.callbackId);
		}
	}

}
