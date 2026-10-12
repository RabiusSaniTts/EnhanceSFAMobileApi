package com.phonegap.sfa;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Set;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.AlertDialog;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.util.Log;
import android.widget.Toast;

import com.woosim.bt.WoosimPrinter;

public class PrinterHelper extends Plugin {

	JSONObject data = null;
	private WoosimPrinter woosim = new WoosimPrinter();
	private byte[] cardData;
	private BluetoothAdapter mBtAdapter;
	private ArrayList<DevicesData> arrData;
	private final static String EUC_KR = "EUC-KR";
	private final static String UTF_8 = "UTF-8";
	private byte[] extractdata = new byte[300];
	private HashMap<String, Integer> hashValues;
	private HashMap<String, Integer> hashPositions;
	private String request;
	private JSONArray jArr;
	private JSONObject status;
	private boolean isExceptionThrown = false;
	private String callbackId="";
	@SuppressWarnings("finally")
	@Override
	public PluginResult execute(String request, JSONArray querystring,
			String callbackId) {
		// TODO Auto-generated method stub
		try {
			arrData = new ArrayList<DevicesData>();
			status = new JSONObject();
			status.put("status", false);
			this.callbackId=callbackId;
			this.request = request;
			this.jArr = querystring;
			Log.d("Request", "" + querystring.toString());
			this.print();
			System.out.println("After print");
			Log.d("After Print", "in print" + status.getString("status"));

		} catch (Exception e) {
			e.printStackTrace();
		} finally {

		}

		return new PluginResult(PluginResult.Status.OK, status);

	}

	private void print() {
		Looper.prepare();

		woosim.setHandle(acthandler);
		mBtAdapter = BluetoothAdapter.getDefaultAdapter();

		// Get a set of currently paired devices
		Set<BluetoothDevice> pairedDevices = mBtAdapter.getBondedDevices();
		if (pairedDevices.size() > 0) {

			for (BluetoothDevice device : pairedDevices) {
				Log.e("devices", device.getName() + "\n" + device.getAddress());
				System.out.println("devices" + device.getName() + "\n"
						+ device.getAddress());
				DevicesData d1 = new DevicesData();
				d1.setAddress(device.getAddress());
				d1.setName(device.getName());
				arrData.add(d1);
			}
			showDialog(arrData);
		} else {
			Toast t = Toast.makeText(cordova.getActivity()
					.getApplicationContext(), "No Devices Found!",
					Toast.LENGTH_SHORT);
			t.show();
			System.out.println("No devices");
			Log.e("devices", "No devices");
			try {
				status.put("status", false);
				status.put("isconnected", -7);
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			sendUpdate(status,true);
		}
		/*
		 * if (mBtAdapter.isDiscovering()) { mBtAdapter.cancelDiscovery(); } //
		 * Request discover from BluetoothAdapter mBtAdapter.startDiscovery();
		 */
		Looper.loop();

	}
	private void sendUpdate(JSONObject obj, boolean keepCallback) {
        if (this.callbackId != null) {
           
            PluginResult result = new PluginResult(PluginResult.Status.OK, obj);
            result.setKeepCallback(keepCallback);
            this.success(result, this.callbackId);
        }
    }
	
	public Handler acthandler = new Handler() {

		public void handleMessage(Message msg) {
			if (msg.what == 0x01) {
				Log.e("+++Activity+++", "******0x01");
				Object obj1 = msg.obj;
				cardData = (byte[]) obj1;

			} else if (msg.what == 0x02) {
				// ardData[msg.arg1] = (byte) msg.arg2;
				Log.e("+++Activity+++", "MSRFAIL: [" + msg.arg1 + "]: ");
			} else if (msg.what == 0x03) {
				Log.e("+++Activity+++", "******EOT");
			} else if (msg.what == 0x04) {
				Log.e("+++Activity+++", "******ETX");
			} else if (msg.what == 0x05) {
				Log.e("+++Activity+++", "******NACK");
			}
		}
	};

	void clearMemory() {
		System.gc();

	}

	private final BroadcastReceiver mReceiver = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			String action = intent.getAction();
			// When discovery finds a device
			if (BluetoothDevice.ACTION_FOUND.equals(action)) {
				// Get the BluetoothDevice object from the Intent
				BluetoothDevice device = intent
						.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
				// If it's already paired, skip it, because it's been listed
				// already
				if (device.getBondState() != BluetoothDevice.BOND_BONDED) {
					Log.d("",
							"" + device.getName() + "\n" + device.getAddress());
					System.out.println("devices" + device.getName() + "\n"
							+ device.getAddress());
					DevicesData d1 = new DevicesData();

					d1.setAddress(device.getAddress());
					d1.setName(device.getName());
					// arrData.add(d1);
				}
				// When discovery is finished, change the Activity title
			} else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED
					.equals(action)) {
				// showDialog(arrData);
				
				Log.d("devices", "No devices");

			}
		}
	};

	public void showDialog(final ArrayList<DevicesData> arrData) {

		final String[] arrDevices = new String[arrData.size()];
		for (int i = 0; i < arrData.size(); i++) {
			arrDevices[i] = arrData.get(i).getName() + "\n"
					+ arrData.get(i).getAddress();

		}

		Runnable runnable = new Runnable() {

			public void run() {
				AlertDialog.Builder dialog = new AlertDialog.Builder(
						cordova.getActivity());
				dialog.setTitle("Choose Device To Pair");
				dialog.setItems(arrDevices,
						new DialogInterface.OnClickListener() {

							public void onClick(DialogInterface dialog,
									int which) {
								dialog.dismiss();
								try {
									doConnection(arrData.get(which)
											.getAddress());
								} catch (JSONException e) {
									// TODO Auto-generated catch block
									e.printStackTrace();
								}
								Toast.makeText(
										cordova.getActivity()
												.getApplicationContext(),
										" you have selected "
												+ arrData.get(which).getName()
												+ "", Toast.LENGTH_LONG).show();
							}
						});
				dialog.setPositiveButton("Cancel",
						new DialogInterface.OnClickListener() {

							public void onClick(DialogInterface dialog,
									int which) {
								dialog.dismiss();
								try {
									status.put("status", false);
									status.put("isconnected", -1);
								} catch (JSONException e) {
									// TODO Auto-generated catch block
									e.printStackTrace();
								}
								sendUpdate(status,true);
							}
						});
				dialog.show();
			}
		};

		this.cordova.getActivity().runOnUiThread(runnable);

	}

	protected void doConnection(String address) throws JSONException {
		int reVal = woosim.BTConnection(address, false);
		if (reVal == 1) {
			Toast t = Toast.makeText(cordova.getActivity()
					.getApplicationContext(), "SUCCESS CONNECTION!",
					Toast.LENGTH_SHORT);
			t.show();
			try {
				printReports();

				/*
				 * for Load Request InputStream isRequest =
				 * ctx.getResources().openRawResource(R.raw.response); String
				 * jsonString = convertStreamToString(isRequest);
				 * printLoadTransfer(jsonString);
				 */

				/*
				 * for Load Summary1 InputStream is =
				 * ctx.getResources().openRawResource(R.raw.loadsummary); String
				 * jsonStringLoad = convertStreamToString(is);
				 * printLoadSummary(jsonStringLoad);
				 */

				/*
				 * for Load Summaer2 InputStream isLoad2 =
				 * ctx.getResources().openRawResource(R.raw.loadsummary2);
				 * String jsonStringLoad2 = convertStreamToString(isLoad2);
				 * printLoadSummary2(jsonStringLoad2);
				 */

				/*
				 * for End Inventory
				 * 
				 * 
				 * InputStream isEndInvent =
				 * ctx.getResources().openRawResource(R.raw.endinventory);
				 * String jsonStringInventory =
				 * convertStreamToString(isEndInvent);
				 * printEndInventory(jsonStringInventory);
				 */

				/*
				 * for Collection
				 * 
				 * 
				 * InputStream isCollection =
				 * ctx.getResources().openRawResource(R.raw.collection); String
				 * jsonStringCollection = convertStreamToString(isCollection);
				 * printCollection(jsonStringCollection);
				 */

				/*
				 * for Sales
				 * 
				 * 
				 * 
				 * InputStream isSales =
				 * ctx.getResources().openRawResource(R.raw.sales); String
				 * jsonStringSales = convertStreamToString(isSales);
				 * printSales(jsonStringSales);
				 */

				/*
				 * for Deposit InputStream isSales =
				 * ctx.getResources().openRawResource(R.raw.deposit); String
				 * jsonStringDeposit = convertStreamToString(isSales);
				 * printDeposit(jsonStringDeposit);
				 */
				/*
				 * InputStream isSales =
				 * ctx.getResources().openRawResource(R.raw.salesreport); String
				 * jsonStringSalesReport = convertStreamToString(isSales);
				 * printSalesReport(jsonStringSalesReport);
				 */

			} catch (Exception e) {
				e.printStackTrace();
				isExceptionThrown = true;

			} finally {
				if (!isExceptionThrown)
					status.put("status", true);
					status.put("isconnected",0);
					sendUpdate(status,true);
			}

		} else if (reVal == -2) {
			Toast t = Toast.makeText(cordova.getActivity()
					.getApplicationContext(), "NOT CONNECTED",
					Toast.LENGTH_SHORT);
			t.show();
			status.put("status", false);
			status.put("isconnected", -3);
			sendUpdate(status,true);
		} else if (reVal == -5) {
			Toast t = Toast.makeText(cordova.getActivity()
					.getApplicationContext(), "DEVICE IS NOT BONDED",
					Toast.LENGTH_SHORT);
			t.show();
			status.put("status", false);
			status.put("isconnected", -4);
			sendUpdate(status,true);
		} else if (reVal == -6) {

			try {

				printReports();

				/*
				 * for Load Request InputStream isRequest =
				 * ctx.getResources().openRawResource(R.raw.response); String
				 * jsonString = convertStreamToString(isRequest);
				 * printLoadTransfer(jsonString);
				 */

				/*
				 * for Load Summary1 InputStream is =
				 * ctx.getResources().openRawResource(R.raw.loadsummary); String
				 * jsonStringLoad = convertStreamToString(is);
				 * printLoadSummary(jsonStringLoad);
				 */

				/*
				 * for Load Summaer2 InputStream isLoad2 =
				 * ctx.getResources().openRawResource(R.raw.loadsummary2);
				 * String jsonStringLoad2 = convertStreamToString(isLoad2);
				 * printLoadSummary2(jsonStringLoad2);
				 */

				/*
				 * for End Inventory
				 * 
				 * 
				 * InputStream isEndInvent =
				 * ctx.getResources().openRawResource(R.raw.endinventory);
				 * String jsonStringInventory =
				 * convertStreamToString(isEndInvent);
				 * printEndInventory(jsonStringInventory);
				 */

				/*
				 * for Collection
				 * 
				 * 
				 * InputStream isCollection =
				 * ctx.getResources().openRawResource(R.raw.collection); String
				 * jsonStringCollection = convertStreamToString(isCollection);
				 * printCollection(jsonStringCollection);
				 */

				/*
				 * for Sales
				 * 
				 * 
				 * 
				 * InputStream isSales =
				 * ctx.getResources().openRawResource(R.raw.sales); String
				 * jsonStringSales = convertStreamToString(isSales);
				 * printSales(jsonStringSales);
				 */

				/*
				 * for Deposit InputStream isSales =
				 * ctx.getResources().openRawResource(R.raw.deposit); String
				 * jsonStringDeposit = convertStreamToString(isSales);
				 * printDeposit(jsonStringDeposit);
				 */
				/*
				 * InputStream isSales =
				 * ctx.getResources().openRawResource(R.raw.salesreport); String
				 * jsonStringSalesReport = convertStreamToString(isSales);
				 * printSalesReport(jsonStringSalesReport);
				 */

			} catch (Exception e) {
				isExceptionThrown = true;
				e.printStackTrace();

			} finally {
				if (!isExceptionThrown)
					status.put("status", true);
					status.put("isconnected", 0);
					sendUpdate(status,true);
			}

		} else if (reVal == -8) {
			Toast t = Toast.makeText(cordova.getActivity()
					.getApplicationContext(),
					"Please enable your Bluetooth and re-run this program!",
					Toast.LENGTH_LONG);
			t.show();
			status.put("status", false);
			status.put("isconnected", -5);
			sendUpdate(status,true);
		} else {
			Toast t = Toast.makeText(cordova.getActivity()
					.getApplicationContext(), "ELSE", Toast.LENGTH_SHORT);
			t.show();
			status.put("status", false);
			status.put("isconnected", -6);
			sendUpdate(status,true);
		}
	}

	private void printReports() {

		try {

			/*
			 * InputStream isSales = cordova.getActivity().getResources()
			 * .openRawResource(R.raw.mutiple); String jsonString =
			 * convertStreamToString(isSales);
			 * 
			 * JSONArray jArr = new JSONArray(jsonString);
			 */

			Log.d("Print Report", "" + jArr.toString());
			
			
			for(int j=0;j<jArr.length();j++)
			{
				JSONArray jInner=jArr.getJSONArray(j);
				for (int i = 0; i < jInner.length(); i++) {

					JSONObject jDict = jInner.getJSONObject(i);
					String request = jDict.getString("name");
					JSONObject jsnData = jDict.getJSONObject("mainArr");
					if (request.equalsIgnoreCase("Transfer_In")) {
						printLoadTransfer(jsnData);
					} else if (request.equalsIgnoreCase("LoadSummary")) {
						printLoadSummary(jsnData);
					} else if (request.equalsIgnoreCase("LoadSummary2")) {
						printLoadSummary2(jsnData);
					} else if (request.equalsIgnoreCase("Sales")) {
						printSales(jsnData);
					} else if (request.equalsIgnoreCase("SalesReport")) {
						printSalesReport(jsnData);
					} else if (request.equalsIgnoreCase("Deposit")) {
						printDeposit(jsnData);
					} else if (request.equalsIgnoreCase("Collection")) {
						printCollection(jsnData);
					} else if (request.equalsIgnoreCase("EndInventory")) {
						printEndInventory(jsnData);
					}

				}
				
			}
			
			
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	private void printLoadTransfer(JSONObject object) {

		try {

			hashValues = new HashMap<String, Integer>();
			hashValues.put("Item#", 6);
			hashValues.put("Description", 22);
			hashValues.put("UPC", 4);
			hashValues.put("Van Qty", 9);
			hashValues.put("Transfer Qty", 10);
			hashValues.put("Net Qty", 7);
			hashValues.put("Value", 9);
			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("UPC", 0);
			hashPositions.put("Van Qty", 2);
			hashPositions.put("Transfer Qty", 2);
			hashPositions.put("Net Qty", 2);
			hashPositions.put("Value", 2);

			byte[] init = { 0x1b, '@' };
			woosim.controlCommand(init, init.length);

			byte[] lf = { 0x0a };
			woosim.controlCommand(lf, lf.length);

			if (object.getString("addresssetting").equals("1")) {
					
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyname"), 35,1), 0x01, true);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyaddress"), 69,1), 0x00, true);
				if(object.has("contactinfo"))
				{
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR,getAccurateText(object.getString("contactinfo"), 69,1), 0x00, true);
				}
			} else {
				woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);


			woosim.saveSpool(EUC_KR,getAccurateText("ROUTE: " + object.getString("ROUTE"), 35,0)+ getAccurateText("DATE:" + object.getString("DOC DATE"), 34, 2),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 35, 0)+ getAccurateText("TIME:" + object.getString("TIME"), 34, 2),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("DOCUMENT NO: " + object.getString("DOCUMENT NO"), 34, 0)+ getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 35, 2),0x00, false);

			
			
			
			/*woosim.saveSpool(
					EUC_KR,
					getAccurateText("ROUTE: " + object.getString("ROUTE"), 23,
							0)
							+ " "
							+ getAccurateText(
									"SALESMAN:" + object.getString("SALESMAN"),
									22, 1)
							+ " "
							+ getAccurateText(
									"DOC DATE:" + object.getString("DOC DATE"),
									22, 2), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(
					EUC_KR,
					getAccurateText(
							"DOCUMENT NO:" + object.getString("DOCUMENT NO"),
							25, 0)
							+ " "
							+ getAccurateText(
									"TRIP START DATE:"
											+ object.getString("TRIP START DATE"),
									25, 1)
							+ " "
							+ getAccurateText(
									"TIME:" + object.getString("TIME"), 17, 2),
					0x00, false);*/
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,
					getAccurateText("LOAD TRANSFER SUMMARY", 35, 1), 0x01, true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(
					EUC_KR,
					getAccurateText(
							"TO ROUTE: " + object.getString("TO ROUTE"), 69, 0),
					0x00, true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);

			woosim.saveSpool(EUC_KR, getAccurateText("TRANSFER IN", 69, 1),
					0x00, true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "";
			int MAXLEngth = 69;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth
						- hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}
			for (int i = 0; i < headers.length(); i++) {

				strheader = strheader
						+ getAccurateText(headers.getString(i).toString(),
								hashValues.get(headers.getString(i).toString())
										+ MAXLEngth, hashPositions.get(headers
										.getString(i).toString()));

			}
			;
			woosim.saveSpool(EUC_KR, strheader, 0x00, true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					strData = strData
							+ getAccurateText(
									jArr.getString(j),
									hashValues.get(headers.getString(j)
											.toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j)
											.toString()));
				}

				woosim.saveSpool(EUC_KR, strData, 0x00, false);
				woosim.saveSpool(EUC_KR, "\r\n", 0x00, false);
			}
			woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			JSONArray jTotal = object.getJSONArray("TOTAL");
			for (int i = 0; i < jTotal.length(); i++) {
				JSONObject jTOBject = jTotal.getJSONObject(0);
				String strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					if (jTOBject.has(headers.getString(j))) {
						strTotal = strTotal
								+ getAccurateText(
										jTOBject.getString(headers.getString(j)
												.toString()),
										hashValues.get(headers.getString(j)
												.toString()) + MAXLEngth,
										hashPositions.get(headers.getString(j)
												.toString()));
					} else {

						strTotal = strTotal
								+ getAccurateText(
										headers.getString(j).equals(
												"Description") ? "TOTAL" : "",
										hashValues.get(headers.getString(j))
												+ MAXLEngth, 1);
					}
				}

				woosim.saveSpool(EUC_KR, strTotal, 0x00, false);
			}

			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\r\n", 0x00, false);
			woosim.saveSpool(
					EUC_KR,
					getAccurateText("FROM SALESMAN", 23, 1)
							+ getAccurateText("TO SALESMAN", 23, 1)
							+ getAccurateText("SUPERVISOR", 23, 1), 0x00, false);
			woosim.saveSpool(EUC_KR, "\r\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText(object.getString("printstatus"), 69, 1),
					0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.controlCommand(lf, lf.length);
			byte[] ff = { 0x0c };
			woosim.controlCommand(ff, 1);
			woosim.printSpool(true);

			cardData = null;

		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	private void printLoadSummary(JSONObject object) {

		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Item#", 6);
			hashValues.put("Description", 25);
			hashValues.put("Open Qty", 10);
			hashValues.put("Load Qty", 9);
			hashValues.put("Adjust Qty", 11);
			hashValues.put("Net Qty", 8);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("Open Qty", 2);
			hashPositions.put("Load Qty", 2);
			hashPositions.put("Adjust Qty", 2);
			hashPositions.put("Net Qty", 2);

			byte[] init = { 0x1b, '@' };
			woosim.controlCommand(init, init.length);

			byte[] lf = { 0x0a };
			woosim.controlCommand(lf, lf.length);

			if (object.getString("addresssetting").equals("1")) {
				
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyname"), 35,1), 0x01, true);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyaddress"), 69,1), 0x00, true);
				if(object.has("contactinfo"))
				{
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR,getAccurateText(object.getString("contactinfo"), 69,1), 0x00, true);
				}
			} else {
				woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			/*woosim.saveSpool(
					EUC_KR,
					getAccurateText("ROUTE: " + object.getString("ROUTE"), 23,
							0)
							+ " "
							+ getAccurateText(
									"SALESMAN:" + object.getString("SALESMAN"),
									22, 1)
							+ " "
							+ getAccurateText(
									"DOC DATE:" + object.getString("DOC DATE"),
									22, 2), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(
					EUC_KR,
					getAccurateText(
							"DOCUMENT NO:" + object.getString("DOCUMENT NO"),
							25, 0)
							+ " "
							+ getAccurateText(
									"TRIP START DATE:"
											+ object.getString("TRIP START DATE"),
									25, 1)
							+ " "
							+ getAccurateText(
									"TIME:" + object.getString("TIME"), 17, 2),
					0x00, false);*/
			
			woosim.saveSpool(EUC_KR,getAccurateText("ROUTE: " + object.getString("ROUTE"), 35,0)+ getAccurateText("DATE:" + object.getString("DOC DATE"), 34, 2),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 35, 0)+ getAccurateText("TIME:" + object.getString("TIME"), 34, 2),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("DOCUMENT NO: " + object.getString("DOCUMENT NO"), 34, 0)+ getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 35, 2),0x00, false);
			
			
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,
					getAccurateText("NEW LOAD SUMMARY - LOAD: 1", 35, 1), 0x01,
					true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "";
			int MAXLEngth = 69;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth
						- hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}
			for (int i = 0; i < headers.length(); i++) {

				strheader = strheader
						+ getAccurateText(headers.getString(i).toString(),
								hashValues.get(headers.getString(i).toString())
										+ MAXLEngth, hashPositions.get(headers
										.getString(i).toString()));

			}
			;
			woosim.saveSpool(EUC_KR, strheader, 0x00, true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					strData = strData
							+ getAccurateText(
									jArr.getString(j),
									hashValues.get(headers.getString(j)
											.toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j)
											.toString()));
				}

				woosim.saveSpool(EUC_KR, strData, 0x00, false);
				woosim.saveSpool(EUC_KR, "\r\n", 0x00, false);
			}
			woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			JSONArray jTotal = object.getJSONArray("TOTAL");
			for (int i = 0; i < jTotal.length(); i++) {
				JSONObject jTOBject = jTotal.getJSONObject(0);
				String strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					if (jTOBject.has(headers.getString(j))) {
						strTotal = strTotal
								+ getAccurateText(
										jTOBject.getString(headers.getString(j)
												.toString()),
										hashValues.get(headers.getString(j)
												.toString()) + MAXLEngth,
										hashPositions.get(headers.getString(j)
												.toString()));
					} else {

						strTotal = strTotal
								+ getAccurateText(
										headers.getString(j).equals(
												"Description") ? "TOTAL" : "",
										hashValues.get(headers.getString(j))
												+ MAXLEngth, 1);
					}
				}

				woosim.saveSpool(EUC_KR, strTotal, 0x00, false);
			}

			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\r\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("STORE KEEPER", 35, 1)
					+ getAccurateText("TO SALESMAN", 34, 1), 0x00, false);
			woosim.saveSpool(EUC_KR, "\r\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText(object.getString("printstatus"), 69, 1),
					0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.controlCommand(lf, lf.length);
			byte[] ff = { 0x0c };
			woosim.controlCommand(ff, 1);
			woosim.printSpool(true);

			cardData = null;

		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	private void printLoadSummary2(JSONObject object) {
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Item#", 7);
			hashValues.put("Description", 26);
			hashValues.put("Van Qty", 12);
			hashValues.put("Load Qty", 12);
			hashValues.put("Net Qty", 12);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("Van Qty", 2);
			hashPositions.put("Load Qty", 2);

			hashPositions.put("Net Qty", 2);

			byte[] init = { 0x1b, '@' };
			woosim.controlCommand(init, init.length);

			byte[] lf = { 0x0a };
			woosim.controlCommand(lf, lf.length);

			if (object.getString("addresssetting").equals("1")) {
				
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyname"), 35,1), 0x01, true);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyaddress"), 69,1), 0x00, true);
				if(object.has("contactinfo"))
				{
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR,getAccurateText(object.getString("contactinfo"), 69,1), 0x00, true);
				}
			} else {
				woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			/*woosim.saveSpool(
					EUC_KR,
					getAccurateText("ROUTE: " + object.getString("ROUTE"), 23,
							0)
							+ " "
							+ getAccurateText(
									"SALESMAN:" + object.getString("SALESMAN"),
									22, 1)
							+ " "
							+ getAccurateText(
									"DOC DATE:" + object.getString("DOC DATE"),
									22, 2), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(
					EUC_KR,
					getAccurateText(
							"DOCUMENT NO:" + object.getString("DOCUMENT NO"),
							25, 0)
							+ " "
							+ getAccurateText(
									"TRIP START DATE:"
											+ object.getString("TRIP START DATE"),
									25, 1)
							+ " "
							+ getAccurateText(
									"TIME:" + object.getString("TIME"), 17, 2),
					0x00, false);*/
			
			woosim.saveSpool(EUC_KR,getAccurateText("ROUTE: " + object.getString("ROUTE"), 35,0)+ getAccurateText("DATE:" + object.getString("DOC DATE"), 34, 2),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 35, 0)+ getAccurateText("TIME:" + object.getString("TIME"), 34, 2),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("DOCUMENT NO: " + object.getString("DOCUMENT NO"), 34, 0)+ getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 35, 2),0x00, false);
			
			
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,
					getAccurateText("NEW LOAD SUMMARY - LOAD: 2", 35, 1), 0x01,
					true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "";
			int MAXLEngth = 69;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth
						- hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}
			for (int i = 0; i < headers.length(); i++) {

				strheader = strheader
						+ getAccurateText(headers.getString(i).toString(),
								hashValues.get(headers.getString(i).toString())
										+ MAXLEngth, hashPositions.get(headers
										.getString(i).toString()));

			}
			;
			woosim.saveSpool(EUC_KR, strheader, 0x00, true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					strData = strData
							+ getAccurateText(
									jArr.getString(j),
									hashValues.get(headers.getString(j)
											.toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j)
											.toString()));
				}

				woosim.saveSpool(EUC_KR, strData, 0x00, false);
				woosim.saveSpool(EUC_KR, "\r\n", 0x00, false);
			}
			woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			JSONArray jTotal = object.getJSONArray("TOTAL");
			for (int i = 0; i < jTotal.length(); i++) {
				JSONObject jTOBject = jTotal.getJSONObject(0);
				String strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					if (jTOBject.has(headers.getString(j))) {
						strTotal = strTotal
								+ getAccurateText(
										jTOBject.getString(headers.getString(j)
												.toString()),
										hashValues.get(headers.getString(j)
												.toString()) + MAXLEngth,
										hashPositions.get(headers.getString(j)
												.toString()));
					} else {

						strTotal = strTotal
								+ getAccurateText(
										headers.getString(j).equals(
												"Description") ? "TOTAL" : "",
										hashValues.get(headers.getString(j))
												+ MAXLEngth, 1);
					}
				}

				woosim.saveSpool(EUC_KR, strTotal, 0x00, false);
			}

			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\r\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText("STORE KEEPER", 35, 1)
					+ getAccurateText("TO SALESMAN", 34, 1), 0x00, false);
			woosim.saveSpool(EUC_KR, "\r\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText(object.getString("printstatus"), 69, 1),
					0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.controlCommand(lf, lf.length);
			byte[] ff = { 0x0c };
			woosim.controlCommand(ff, 1);
			woosim.printSpool(true);

			cardData = null;

		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	private void printSales(JSONObject object) {
		hashValues = new HashMap<String, Integer>();
		hashValues.put("Item#", 6);
		hashValues.put("Description", 23);
		hashValues.put("Quantity", 9);
		hashValues.put("Case Price", 7);
		hashValues.put("Unit Price", 7);
		hashValues.put("Discount", 9);
		hashValues.put("Amount", 8);
		hashPositions = new HashMap<String, Integer>();
		hashPositions.put("Item#", 0);
		hashPositions.put("Description", 0);
		hashPositions.put("Quantity", 2);
		hashPositions.put("Case Price", 2);
		hashPositions.put("Unit Price", 2);
		hashPositions.put("Discount", 2);
		hashPositions.put("Amount", 2);

		try {
			byte[] init = { 0x1b, '@' };
			woosim.controlCommand(init, init.length);

			byte[] lf = { 0x0a };
			woosim.controlCommand(lf, lf.length);

			if (object.getString("addresssetting").equals("1")) {
				
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyname"), 35,1), 0x01, true);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyaddress"), 69,1), 0x00, true);
				if(object.has("contactinfo"))
				{
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR,getAccurateText(object.getString("contactinfo"), 69,1), 0x00, true);
				}
			} else {
				woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("ROUTE: " + object.getString("ROUTE"), 35,0)+getAccurateText("DATE:" + object.getString("DATE"), 34, 2),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 35, 0)+ getAccurateText("TIME:" + object.getString("TIME"), 34, 2),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("Invoice Header Message", 69, 0), 0x00,false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,
					getAccurateText(object.getString("INVOICETYPE"), 35, 1),
					0x01, true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(
					EUC_KR,
					getAccurateText("CUSTOMER:" + object.getString("CUSTOMER"),
							35, 0), 0x00, false);
			woosim.saveSpool(EUC_KR,
					getAccurateText(object.getString("CUSTOMER"), 34, 0), 0x00,
					true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(
					EUC_KR,
					getAccurateText("ADDRESS :" + object.getString("ADDRESS"),
							69, 0), 0x00, true);

			JSONArray jData = object.getJSONArray("data");

			for (int i = 0; i < jData.length(); i++) {

				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");
				if (jInnerData.length() > 0) {
					switch (i) {
					case 0:
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						woosim.saveSpool(EUC_KR,
								getAccurateText("SALES", 69, 1), 0x00, true);
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					
						break;
					case 1:
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						woosim.saveSpool(EUC_KR,
								getAccurateText("FREE", 69, 1), 0x00, true);
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						
						break;
					case 2:
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						woosim.saveSpool(EUC_KR,
								getAccurateText("PROMOTION FREE", 69, 1), 0x00, true);
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						
						break;	
					case 3:
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						woosim.saveSpool(EUC_KR,
								getAccurateText("GOOD RETURN", 69, 1), 0x00,
								true);
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						
						break;
					case 4:
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						woosim.saveSpool(EUC_KR,
								getAccurateText("BAD RETURN", 69, 1), 0x00,
								true);
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					
						break;

					default:
						break;
					}
				}
				int MAXLEngth = 69;
				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth- hashValues.get(headers.getString(k).toString());
				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}

				
				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					strheader = strheader
							+ getAccurateText((headers.getString(j).indexOf(" ") == -1) ? headers.getString(j): headers.getString(j).substring(0,headers.getString(j).indexOf(" ")),
								hashValues.get(headers.getString(j)
											.toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j)
											.toString()));

					strHeaderBottom = strHeaderBottom
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? ""
											: headers.getString(j).substring(
													headers.getString(j)
															.indexOf(" "),
													headers.getString(j)
															.length()),
									hashValues.get(headers.getString(j)
											.toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j)
											.toString()));

					if (jTotal.has(headers.getString(j))) {
						strTotal = strTotal
								+ getAccurateText(
										jTotal.getString(headers.getString(j)
												.toString()),
										hashValues.get(headers.getString(j)
												.toString()) + MAXLEngth,
										hashPositions.get(headers.getString(j)
												.toString()));
					} else {

						strTotal = strTotal
								+ getAccurateText(
										headers.getString(j).equals(
												"Description") ? "TOTAL" : "",
										hashValues.get(headers.getString(j))
												+ MAXLEngth, 1);
					}

				}
				if (jInnerData.length() > 0) {
					woosim.saveSpool(EUC_KR, strheader, 0x00, true);
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR, strHeaderBottom, 0x00, true);
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
					woosim.saveSpool(EUC_KR, "\r\n", 0x00, false);
				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					for (int m = 0; m < jArr.length(); m++) {
						strData = strData
								+ getAccurateText(
										jArr.getString(m),
										hashValues.get(headers.getString(m)
												.toString()) + MAXLEngth,
										hashPositions.get(headers.getString(m)
												.toString()));
					}

					woosim.saveSpool(EUC_KR, strData, 0x00, false);
					woosim.saveSpool(EUC_KR, "\r\n", 0x00, false);
				}
				if (jInnerData.length() > 0) {
					woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
					woosim.saveSpool(EUC_KR, "\r\n", 0x00, false);
					woosim.saveSpool(EUC_KR, strTotal, 0x00, false);
				}

			}
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText("SUB TOTAL: ", 20, 0)
					+ getAccurateText(object.getString("SUB TOTAL"), 15, 2),
					0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(
					EUC_KR,
					getAccurateText("INVOICE DISCOUNT: ", 20, 0)
							+ getAccurateText(
									object.getString("INVOICE DISCOUNT"), 15, 2),
					0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(
					EUC_KR,
					getAccurateText("NET SALES: ", 20, 0)+getAccurateText(object.getString("NET SALES"),
									15, 2), 0x00, true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText("Comments:"+object.getString("comments"), 69, 0), 0x00,
					false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,
					getAccurateText("Invoice Trailor Message", 69, 0), 0x00,
					false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText("CUSTOMER", 35, 1)
					+ getAccurateText("SALESMAN", 34, 1), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText(object.getString("printstatus"), 69, 1),
					0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);

			woosim.controlCommand(lf, lf.length);
			byte[] ff = { 0x0c };
			woosim.controlCommand(ff, 1);
			woosim.printSpool(true);

			cardData = null;

		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	private void printCollection(JSONObject object) {

		hashValues = new HashMap<String, Integer>();
		hashValues.put("Invoice#", 14);
		hashValues.put("Invoice Date", 14);
		hashValues.put("Invoice Amount", 13);
		hashValues.put("Invoice Balance", 14);
		hashValues.put("Amount Paid", 14);

		hashPositions = new HashMap<String, Integer>();
		hashPositions.put("Invoice#", 0);
		hashPositions.put("Invoice Date", 0);
		hashPositions.put("Invoice Amount", 2);
		hashPositions.put("Invoice Balance", 2);
		hashPositions.put("Amount Paid", 2);

		try {

			byte[] init = { 0x1b, '@' };
			woosim.controlCommand(init, init.length);

			byte[] lf = { 0x0a };
			woosim.controlCommand(lf, lf.length);
			if (object.getString("addresssetting").equals("1")) {
				
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyname"), 35,1), 0x01, true);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyaddress"), 69,1), 0x00, true);
				if(object.has("contactinfo"))
				{
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR,getAccurateText(object.getString("contactinfo"), 69,1), 0x00, true);
				}
			} else {
				woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(
					EUC_KR,
					getAccurateText("ROUTE: " + object.getString("ROUTE"), 35,
							0)
							+ getAccurateText(
									"DATE:" + object.getString("DATE"), 34, 2),
					0x00, false);
		
			woosim.saveSpool(
					EUC_KR,
					getAccurateText(
							"SALESMAN: " + object.getString("SALESMAN"), 35, 0)
							+ getAccurateText(
									"TIME:" + object.getString("TIME"), 34, 2),
					0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,
					getAccurateText("Invoice Header Message", 69, 0), 0x00,
					false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(
					EUC_KR,
					getAccurateText("RECEIPT: " + object.getString("RECEIPT"),
							69, 1), 0x00, true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText("CUSTOMER:", 10, 0), 0x00,
					false);

			woosim.saveSpool(EUC_KR,
					getAccurateText(object.getString("CUSTOMER"), 59, 0), 0x00,
					true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(
					EUC_KR,
					getAccurateText("ADDRESS :" + object.getString("ADDRESS"),
							69, 0), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strTotal = "", strHeaderBottom = "";
			int MAXLEngth = 69;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth
						- hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}

			JSONObject jTOBject = object.getJSONObject("TOTAL");
			for (int i = 0; i < headers.length(); i++) {

				strheader = strheader
						+ getAccurateText(
								(headers.getString(i).indexOf(" ") == -1) ? headers.getString(i)
										: headers.getString(i).substring(
												0,
												headers.getString(i).indexOf(
														" ")),
								hashValues.get(headers.getString(i).toString())
										+ MAXLEngth, hashPositions.get(headers
										.getString(i).toString()));
				strHeaderBottom = strHeaderBottom
						+ getAccurateText(
								(headers.getString(i).indexOf(" ") == -1) ? ""
										: headers.getString(i).substring(
												headers.getString(i).indexOf(
														" "),
												headers.getString(i).length()),
								hashValues.get(headers.getString(i).toString())
										+ MAXLEngth, hashPositions.get(headers
										.getString(i).toString()));

				if (jTOBject.has(headers.getString(i))) {
					strTotal = strTotal
							+ getAccurateText(
									jTOBject.getString(headers.getString(i)
											.toString()),
									hashValues.get(headers.getString(i)
											.toString()) + MAXLEngth,
									hashPositions.get(headers.getString(i)
											.toString()));
				} else {

					strTotal = strTotal
							+ getAccurateText(
									headers.getString(i).equals("Invoice Date") ? "TOTAL"
											: "",
									hashValues.get(headers.getString(i))
											+ MAXLEngth, 1);
				}
			}

			woosim.saveSpool(EUC_KR, strheader, 0x00, true);
			woosim.saveSpool(EUC_KR, strHeaderBottom, 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					strData = strData
							+ getAccurateText(
									jArr.getString(j),
									hashValues.get(headers.getString(j)
											.toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j)
											.toString()));
				}
				woosim.saveSpool(EUC_KR, strData, 0x00, false);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			}

			woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, strTotal, 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText("PAYMENT DETAILS", 69, 1),
					0x00, true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			// 0 Check only
			// 1 Cash Only
			// 2 Both
			JSONArray jCheques = object.has("Cheque") ? object
					.getJSONArray("Cheque") : null;
			JSONObject jCash = object.has("Cash") ? object
					.getJSONObject("Cash") : null;

			switch (Integer.parseInt(object.getString("PaymentType"))) {
			case 0:
				woosim.saveSpool(
						EUC_KR,
						getAccurateText("CASH: ", 6, 0)
								+ getAccurateText(
										"Amount:" + jCash.getString("Amount"),
										63, 0), 0x00, false);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);
				
				break;
			case 1:

				
				
				woosim.saveSpool(EUC_KR, getAccurateText("CHEQUE: ", 69, 0),
						0x00, true);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);
				woosim.saveSpool(EUC_KR,
						getAccurateText("Cheque Date:", 17, 0)
								+ getAccurateText("Cheque No:", 17, 0)
								+ getAccurateText("Bank:", 17, 0)
								+ getAccurateText("Amount:", 17, 2), 0x00,
						false);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);
				woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);

				for (int j = 0; j < jCheques.length(); j++) {
					JSONObject jChequeDetails = jCheques.getJSONObject(j);
					woosim.saveSpool(
							EUC_KR,
							getAccurateText(
									jChequeDetails.getString("Cheque Date"),
									17, 0)
									+ getAccurateText(jChequeDetails
											.getString("Cheque No"), 18, 0)
									+ getAccurateText(
											jChequeDetails.getString("Bank"),
											17, 0)
									+ getAccurateText(
											jChequeDetails.getString("Amount"),
											17, 2), 0x00, false);
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
				}
				woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);
				
				break;
			case 2:

				woosim.saveSpool(
						EUC_KR,
						getAccurateText("CASH: ", 6, 0)
								+ getAccurateText(
										"Amount:" + jCash.getString("Amount"),
										63, 0), 0x00, false);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);
				woosim.saveSpool(EUC_KR, getAccurateText("CHEQUE: ", 69, 0),
						0x00, true);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);
				woosim.saveSpool(EUC_KR,
						getAccurateText("Cheque Date:", 17, 0)
								+ getAccurateText("Cheque No:", 17, 0)
								+ getAccurateText("Bank:", 17, 0)
								+ getAccurateText("Amount:", 17, 2), 0x00,
						false);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);
				woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);

				for (int j = 0; j < jCheques.length(); j++) {
					JSONObject jChequeDetails = jCheques.getJSONObject(j);
					woosim.saveSpool(
							EUC_KR,
							getAccurateText(
									jChequeDetails.getString("Cheque Date"),
									17, 0)
									+ getAccurateText(jChequeDetails
											.getString("Cheque No"), 18, 0)
									+ getAccurateText(
											jChequeDetails.getString("Bank"),
											17, 0)
									+ getAccurateText(
											jChequeDetails.getString("Amount"),
											17, 2), 0x00, false);
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
				}
				woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);
				break;

			default:
				break;
			}
			
			
			String exPayment=object.has("expayment")?object.getString("expayment"):"";
			
			woosim.saveSpool(EUC_KR,
					getAccurateText("Excess Payment"+exPayment, 69, 0), 0x00,
					false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText("Comments: "+object.getString("comments"), 69, 0), 0x00,
					false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);

			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText("CUSTOMER", 35, 1)
					+ getAccurateText("SALESMAN", 34, 1), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText(object.getString("printstatus"), 69, 1),
					0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.controlCommand(lf, lf.length);
			byte[] ff = { 0x0c };
			woosim.controlCommand(ff, 1);
			woosim.printSpool(true);

			cardData = null;

		} catch (Exception e) {
			e.printStackTrace();

		}

	}

	private void printDeposit(JSONObject object) {
		hashValues = new HashMap<String, Integer>();
		hashValues.put("Transaction Number", 12);
		hashValues.put("Customer Code", 12);
		hashValues.put("Cheque No", 12);
		hashValues.put("Cheque Date", 11);
		hashValues.put("Bank Name", 12);
		hashValues.put("Cheque Amount", 10);
		hashValues.put("Amount", 10);
		hashPositions = new HashMap<String, Integer>();
		hashPositions.put("Transaction Number", 0);
		hashPositions.put("Customer Code", 0);
		hashPositions.put("Cheque No", 0);
		hashPositions.put("Cheque Date", 0);
		hashPositions.put("Bank Name", 0);
		hashPositions.put("Cheque Amount", 2);
		hashPositions.put("Amount", 2);
		try {
			byte[] init = { 0x1b, '@' };
			woosim.controlCommand(init, init.length);

			byte[] lf = { 0x0a };
			woosim.controlCommand(lf, lf.length);

			if (object.getString("addresssetting").equals("1")) {
				
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyname"), 35,1), 0x01, true);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyaddress"), 69,1), 0x00, true);
				if(object.has("contactinfo"))
				{
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR,getAccurateText(object.getString("contactinfo"), 69,1), 0x00, true);
				}
			} else {
				woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);

			
			woosim.saveSpool(EUC_KR,getAccurateText("ROUTE: " + object.getString("ROUTE"), 35,0)+ getAccurateText("DATE:" + object.getString("DOC DATE"), 34, 2),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 35, 0)+ getAccurateText("TIME:" + object.getString("TIME"), 34, 2),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 69, 0),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText("DEPOSIT SUMMARY", 35, 1),
					0x01, true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");

				if (jInnerData.length() > 0) {
					switch (i) {
					case 0:
						woosim.saveSpool(EUC_KR,
								getAccurateText("CASH", 69, 0), 0x00, true);

						break;
					case 1:
						woosim.saveSpool(EUC_KR,
								getAccurateText("CHEQUE",69, 0), 0x00, true);

						break;
					default:
						break;
					}
				}
				int MAXLEngth = 69;
				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth
							- hashValues.get(headers.getString(k).toString());
				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}

				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					strheader = strheader
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? headers.getString(j)
											: headers
													.getString(j)
													.substring(
															0,
															headers.getString(j)
																	.indexOf(
																			" "))
													.trim(),
									hashValues.get(headers.getString(j)
											.toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j)
											.toString()));

					strHeaderBottom = strHeaderBottom
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? ""
											: headers
													.getString(j)
													.substring(
															headers.getString(j)
																	.indexOf(
																			" "),
															headers.getString(j)
																	.length())
													.trim(),
									hashValues.get(headers.getString(j)
											.toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j)
											.toString()));

					if (jTotal.has(headers.getString(j))) {
						strTotal = strTotal
								+ getAccurateText(
										jTotal.getString(headers.getString(j)
												.toString()),
										hashValues.get(headers.getString(j)
												.toString()) + MAXLEngth,
										hashPositions.get(headers.getString(j)
												.toString()));
					} else {

						strTotal = strTotal
								+ getAccurateText(
										headers.getString(j).equals(
												i == 0 ? "Customer Code"
														: "Cheque Date") ? "SUB TOTAL"
												: "",
										hashValues.get(headers.getString(j))
												+ MAXLEngth, 1);
					}

				}
				if (jInnerData.length() > 0) {
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR, strheader, 0x00, true);
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR, strHeaderBottom, 0x00, true);
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);

				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					for (int m = 0; m < jArr.length(); m++) {
						strData = strData
								+ getAccurateText(
										jArr.getString(m),
										hashValues.get(headers.getString(m)
												.toString()) + MAXLEngth,
										hashPositions.get(headers.getString(m)
												.toString()));
					}
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR, strData, 0x00, false);

				}
				if (jInnerData.length() > 0) {
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR, strTotal, 0x00, false);
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
				}

			}
			woosim.saveSpool(EUC_KR,
					getAccurateText("TOTAL DEPOSIT AMOUNT", 50, 2), 0x00, true);
			woosim.saveSpool(
					EUC_KR,
					getAccurateText(object.getString("TOTAL DEPOSIT AMOUNT"),
							19, 2), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText("", 39, 2)
					+ getAccurateText("SALESMAN", 30, 1), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText(object.has("printstatus")?object.getString("printstatus"):"", 69, 1),
					0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.controlCommand(lf, lf.length);
			byte[] ff = { 0x0c };
			woosim.controlCommand(ff, 1);
			woosim.printSpool(true);

			cardData = null;

		} catch (Exception e) {

			e.printStackTrace();
		}

	}

	private void printSalesReport(JSONObject object) {
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Transaction Number", 12);
			hashValues.put("Customer Code", 11);
			hashValues.put("Sales Amount", 9);
			hashValues.put("G.Return Amount", 9);
			hashValues.put("D.Return Amount", 9);
			hashValues.put("Invoice Discount", 9);
			hashValues.put("Total Amount", 10);
			hashValues.put("Check Number", 12);
			hashValues.put("Check Date", 12);
			hashValues.put("Bank Name", 12);
			
			
			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Transaction Number", 0);
			hashPositions.put("Customer Code", 0);
			hashPositions.put("Sales Amount", 2);
			hashPositions.put("G.Return Amount", 2);
			hashPositions.put("D.Return Amount", 2);
			hashPositions.put("Invoice Discount", 2);
			hashPositions.put("Total Amount", 2);
			hashPositions.put("Check Number", 0);
			hashPositions.put("Check Date", 0);
			hashPositions.put("Bank Name", 0);

			byte[] init = { 0x1b, '@' };
			woosim.controlCommand(init, init.length);

			byte[] lf = { 0x0a };
			woosim.controlCommand(lf, lf.length);

			if (object.getString("addresssetting").equals("1")) {
				
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyname"), 35,1), 0x01, true);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyaddress"), 69,1), 0x00, true);
				if(object.has("contactinfo"))
				{
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR,getAccurateText(object.getString("contactinfo"), 69,1), 0x00, true);
				}
			} else {
				woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);

			woosim.saveSpool(EUC_KR,getAccurateText("ROUTE: " + object.getString("ROUTE"), 35,0)+ getAccurateText("DATE:" + object.getString("DOC DATE"), 34, 2),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 35, 0)+ getAccurateText("TIME:" + object.getString("TIME"), 34, 2),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 69, 0),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText("SALES SUMMARY", 35, 1),
					0x01, true);
			

			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");

				if (jInnerData.length() > 0) {
					switch (i) {
					case 0:
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						woosim.saveSpool(EUC_KR,
								getAccurateText("CASH INVOICE", 69, 0), 0x00,
								true);
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						break;
					case 1:

						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						woosim.saveSpool(EUC_KR,
								getAccurateText("CREDIT INVOICE", 69, 0), 0x00,
								true);
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);

						break;
					case 2:

						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						woosim.saveSpool(EUC_KR,
								getAccurateText("TC INVOICE", 69, 0), 0x00,
								true);
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);

						break;
					case 3:

						woosim.saveSpool(EUC_KR, "\n", 0x00, false);
						woosim.saveSpool(EUC_KR,
								getAccurateText("COLLECTION", 69, 0), 0x00,
								true);
						woosim.saveSpool(EUC_KR, "\n", 0x00, false);

						break;
					default:
						break;
					}
				}
				int MAXLEngth = 69;
				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth
							- hashValues.get(headers.getString(k).toString());
				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}

				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					strheader = strheader
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? headers.getString(j)
											: headers
													.getString(j)
													.substring(
															0,
															headers.getString(j)
																	.indexOf(
																			" "))
													.trim(),
									hashValues.get(headers.getString(j)
											.toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j)
											.toString()));

					strHeaderBottom = strHeaderBottom
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? ""
											: headers
													.getString(j)
													.substring(
															headers.getString(j)
																	.indexOf(
																			" "),
															headers.getString(j)
																	.length())
													.trim(),
									hashValues.get(headers.getString(j)
											.toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j)
											.toString()));

					if (jTotal.has(headers.getString(j))) {
						strTotal = strTotal
								+ getAccurateText(
										jTotal.getString(headers.getString(j)
												.toString()),
										hashValues.get(headers.getString(j)
												.toString()) + MAXLEngth,
										hashPositions.get(headers.getString(j)
												.toString()));
					} else {

						strTotal = strTotal
								+ getAccurateText(
										headers.getString(j).equals(
												"Customer Code") ? "SUB TOTAL"
												: "",
										hashValues.get(headers.getString(j))
												+ MAXLEngth, 1);
					}

				}
				if (jInnerData.length() > 0) {
					woosim.saveSpool(EUC_KR, strheader, 0x00, false);
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR, strHeaderBottom, 0x00, false);
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);

				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					for (int m = 0; m < jArr.length(); m++) {
						strData = strData
								+ getAccurateText(
										jArr.getString(m),
										hashValues.get(headers.getString(m)
												.toString()) + MAXLEngth,
										hashPositions.get(headers.getString(m)
												.toString()));
					}
					woosim.saveSpool(EUC_KR, strData, 0x00, false);
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
				}
				if (jInnerData.length() > 0) {
					woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR, strTotal, 0x00, false);
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);

				}

			}
			woosim.saveSpool(EUC_KR, getAccurateText("", 39, 2)
					+ getAccurateText("SALESMAN", 30, 1), 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText(object.has("printstatus")?object.getString("printstatus"):"", 69, 1),
					0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.controlCommand(lf, lf.length);
			byte[] ff = { 0x0c };
			woosim.controlCommand(ff, 1);
			woosim.printSpool(true);

			cardData = null;
		} catch (Exception e) {
			e.printStackTrace();

		}

	}

	private String printSeprator() {
		String seprator = "";
		for (int i = 0; i < 69; i++) {
			seprator = seprator + "-";
		}
		return seprator;
	}

	private String getAccurateText(String text, int width, int position) {
		String finalText = "";
		if (text.length() == width) {
			Log.d("Matched String", text);
			finalText = text;
		} else if (text.length() > width) {

			finalText = text.substring(0, width);
		} else {
			finalText = text;
			Log.d("String", finalText);
			switch (position) {
			case 0:
				for (int i = 0; i < (width - text.length()); i++) {
					finalText = finalText.concat(" ");
				}

				break;
			case 1:
				for (int i = 0; i < (width - text.length()); i++) {
					if (i < (width - text.length()) / 2) {
						finalText = " " + finalText;
					} else {
						finalText = finalText + " ";
					}

				}

				break;
			case 2:
				for (int i = 0; i < (width - text.length()); i++) {
					finalText = " " + finalText;
				}
				break;
			default:
				break;
			}

		}

		return finalText;

	}

	private void printEndInventory(JSONObject object) {

		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Item#", 6);
			hashValues.put("Description", 24);
			hashValues.put("Truck Stock", 7);
			hashValues.put("Fresh Unload", 8);
			hashValues.put("Truck Damage", 7);
			hashValues.put("Closing Stock", 8);
			hashValues.put("Variance Qty", 9);
			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("Truck Stock", 2);
			hashPositions.put("Fresh Unload", 2);
			hashPositions.put("Truck Damage", 2);
			hashPositions.put("Closing Stock", 2);
			hashPositions.put("Variance Qty", 2);

			byte[] init = { 0x1b, '@' };
			woosim.controlCommand(init, init.length);

			byte[] lf = { 0x0a };
			woosim.controlCommand(lf, lf.length);

			if (object.getString("addresssetting").equals("1")) {
				
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyname"), 35,1), 0x01, true);
				woosim.saveSpool(EUC_KR, "\n", 0x00, false);	
				woosim.saveSpool(EUC_KR,getAccurateText(object.getString("companyaddress"), 69,1), 0x00, true);
				if(object.has("contactinfo"))
				{
					woosim.saveSpool(EUC_KR, "\n", 0x00, false);
					woosim.saveSpool(EUC_KR,getAccurateText(object.getString("contactinfo"), 69,1), 0x00, true);
				}
			} else {
				woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			
			
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			
			
			woosim.saveSpool(EUC_KR,getAccurateText("ROUTE: " + object.getString("ROUTE"), 35,0)+ getAccurateText("DATE:" + object.getString("DOC DATE"), 34, 2),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 35, 0)+ getAccurateText("TIME:" + object.getString("TIME"), 34, 2),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,getAccurateText("DOCUMENT NO: " + object.getString("DOCUMENT NO"), 34, 0)+ getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 35, 2),0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR,
					getAccurateText("END INVENTORY SUMMARY", 35, 1), 0x01, true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strHeaderBottom = "";
			int MAXLEngth = 69;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth
						- hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}
			String strTotal = "";
			JSONArray jTotal = object.getJSONArray("TOTAL");
			JSONObject jTOBject = jTotal.getJSONObject(0);
			for (int i = 0; i < headers.length(); i++) {

				try {
					strheader = strheader
							+ getAccurateText(
									(headers.getString(i).indexOf(" ") == -1) ? headers.getString(i)
											: headers.getString(i).substring(
													0,
													headers.getString(i)
															.indexOf(" ")),
									hashValues.get(headers.getString(i)
											.toString()) + MAXLEngth,
									hashPositions.get(headers.getString(i)
											.toString()));

					strHeaderBottom = strHeaderBottom
							+ getAccurateText(
									(headers.getString(i).indexOf(" ") == -1) ? ""
											: headers.getString(i).substring(
													headers.getString(i)
															.indexOf(" "),
													headers.getString(i)
															.length()),
									hashValues.get(headers.getString(i)
											.toString()) + MAXLEngth,
									hashPositions.get(headers.getString(i)
											.toString()));
					if (jTOBject.has(headers.getString(i))) {
						strTotal = strTotal
								+ getAccurateText(
										jTOBject.getString(headers.getString(i)
												.toString()),
										hashValues.get(headers.getString(i)
												.toString()) + MAXLEngth,
										hashPositions.get(headers.getString(i)
												.toString()));
					} else {

						strTotal = strTotal
								+ getAccurateText(
										headers.getString(i).equals(
												"Description") ? "TOTAL" : "",
										hashValues.get(headers.getString(i))
												+ MAXLEngth, 1);
					}
				} catch (Exception e) {

				}

			}
			;
			woosim.saveSpool(EUC_KR, strheader, 0x00, true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, strHeaderBottom, 0x00, true);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					strData = strData
							+ getAccurateText(
									jArr.getString(j),
									hashValues.get(headers.getString(j)
											.toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j)
											.toString()));
				}

				woosim.saveSpool(EUC_KR, strData, 0x00, false);
				woosim.saveSpool(EUC_KR, "\r\n", 0x00, false);
			}

			woosim.saveSpool(EUC_KR, printSeprator(), 0x00, false);
			woosim.saveSpool(EUC_KR, strTotal, 0x00, false);

			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\r\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText("STORE KEEPER", 35, 1)
					+ getAccurateText("SALESMAN", 34, 1), 0x00, false);
			woosim.saveSpool(EUC_KR, "\r\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, getAccurateText(object.has("printstatus")?object.getString("printstatus"):"", 69, 1),
					0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.saveSpool(EUC_KR, "\n", 0x00, false);
			woosim.controlCommand(lf, lf.length);
			byte[] ff = { 0x0c };
			woosim.controlCommand(ff, 1);
			woosim.printSpool(true);

			cardData = null;

		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	@Override
	public void onDestroy() {
		// TODO Auto-generated method stub
		super.onDestroy();
		// Make sure we're not doing discovery anymore
		if (mBtAdapter != null) {
			mBtAdapter.cancelDiscovery();
		}
		woosim.closeConnection();
		// Unregister broadcast listeners
		// ctx.unregisterReceiver(mReceiver);
	}

	public String convertStreamToString(InputStream is) throws Exception {

		BufferedReader reader = new BufferedReader(new InputStreamReader(is,
				"iso-8859-1"));
		StringBuilder sb = new StringBuilder();
		String line = null;
		while ((line = reader.readLine()) != null) {
			sb.append(line + "\n");
		}
		is.close();
		return sb.toString();
	}

}
