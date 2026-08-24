package com.phonegap.sfa;

import java.io.IOException;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Set;
import java.util.UUID;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.app.NotificationManager;
import android.app.ProgressDialog;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Message;
import android.text.TextUtils;
import android.util.Log;
import android.widget.ArrayAdapter;
import android.widget.Toast;

import com.ganesh.intermecarabic.Arabic6822;
import com.intermec.print.lp.LinePrinterException;
import com.zebra.android.printer.ZebraPrinter;

public class DotmatHelper_original extends Plugin {
	private JSONObject status;
	boolean isTwice = false;
	private HashMap<String, Integer> hashValues;
	private HashMap<String, Integer> hashArbPositions;
	private HashMap<String, Integer> hashPositions;
	private HashMap<String, String> hashArabVales;
	private JSONArray jArr;
	private ZebraPrinter printer;
	String resolution = "";
	String strFormat, strFormatBold, strFormatHeader, strFormatTitle, strPrintLeftBold, strUnderLine;
	private BluetoothAdapter mBtAdapter;
	private String callbackId = "";
	private ArrayList<DevicesData> arrData;
	ArrayAdapter<String> adapter, detectedAdapter;
	ArrayList<BluetoothDevice> arrayListBluetoothDevices = null;
	private boolean isExceptionThrown = false;
	BluetoothSocket btSocket = null;
	OutputStream outStream = null;
	String devicename = "";
	int startln = 4;
	int endln = 10; //12
	int cnln = 15;
	private boolean isEnglish = true;
	private String sMacAddr = "";
	private static final UUID MY_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
	byte[] BoldOn = new byte[] { 0x1b, 0x47 };
	byte[] BoldOff = new byte[] { 0x1b, 0x48 };
	byte[] UnderlineOn = new byte[] { 0x1b, 0x2d, 0x01 };
	byte[] UnderlineOff = new byte[] { 0x1b, 0x2d, 0x00 };
	byte[] CompressOn = new byte[] { 0x1b, 0x21, 0x04 };
	byte[] CompressOff = new byte[] { 0x1b, 0x21, 0x00 };
	byte[] NewLine = new byte[] { 0x0d, 0x0a };
	byte[] DoubleHighOn = new byte[] { 0x1b, 0x21, 0x10 };
	byte[] DoubleHighOff = new byte[] { 0x1b, 0x21, 0x10 };
	byte[] DoubleWideOn = new byte[] { 0x1b, 0x21, 0x20 };
	byte[] DoubleWideOff = new byte[] { 0x1b, 0x21, 0x00 };
	byte[] resetprinter = new byte[] { 0x1b, 0x40 };
	byte[] CarriageReturn = new byte[] { 0x0D, 0x0A };
	private int retryCount = 0;
	private ProgressDialog ProgressDialog;
	private android.app.ProgressDialog progressDialog;
	int  companyTaxStng;

	@Override
	public PluginResult execute(String request, JSONArray querystring, String callbackId) {
		// TODO Auto-generated method stub
		PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
		result.setKeepCallback(true);
		try {

			Log.e("Called", "Start of Plugin");
			status = new JSONObject();
			status.put("status", false);
			this.jArr = querystring;
			arrData = new ArrayList<DevicesData>();
			this.callbackId = callbackId;
			this.print();

		} catch (Exception e) {
			e.printStackTrace();
		} finally {

		}

		return result;

	}

	private class asyncgetDevices extends AsyncTask<Void, Set<BluetoothDevice>, Set<BluetoothDevice>> {

		@Override
		protected Set<BluetoothDevice> doInBackground(Void... params) {
			Set<BluetoothDevice> pairedDevices = null;
			mBtAdapter = BluetoothAdapter.getDefaultAdapter();
			if (!mBtAdapter.isEnabled()) {
				mBtAdapter.enable();
				this.cancel(true);
				new asyncgetDevices().execute();

			} else {

				pairedDevices = mBtAdapter.getBondedDevices();
			}
			return pairedDevices;
		}

		@Override
		protected void onPostExecute(Set<BluetoothDevice> pairedDevices) {
			// TODO Auto-generated method stub
			super.onPostExecute(pairedDevices);
			if (pairedDevices != null) {
				if (pairedDevices.size() > 0) {

					for (BluetoothDevice device : pairedDevices) {
						Log.e("devices", device.getName() + "\n" + device.getAddress());
						System.out.println("devices" + device.getName() + "\n" + device.getAddress());
						DevicesData d1 = new DevicesData();
						d1.setAddress(device.getAddress());
						d1.setName(device.getName());
						arrData.add(d1);
					}
					showDialog(arrData);
				} else {
					Toast t = Toast.makeText(cordova.getActivity().getApplicationContext(), "No Devices Found!",
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
					sendUpdate(status, true);
				}
			}

		}

	}

	public void print() {

		new asyncgetDevices().execute();

	}

	public void showDialog(final ArrayList<DevicesData> arrData) {

		final String[] arrDevices = new String[arrData.size()];
		for (int i = 0; i < arrData.size(); i++) {
			arrDevices[i] = arrData.get(i).getName() + "\n" + arrData.get(i).getAddress();

		}

		Runnable runnable = new Runnable() {

			public void run() {
				AlertDialog.Builder dialog = new AlertDialog.Builder(cordova.getActivity());
				dialog.setTitle("Choose Device To Pair");
				dialog.setItems(arrDevices, new DialogInterface.OnClickListener() {

					public void onClick(DialogInterface dialog, int which) {
						dialog.dismiss();
						try {
							retryCount = 0;
							sMacAddr = arrData.get(which).getAddress();
							if (sMacAddr.contains(":") == false && sMacAddr.length() == 12) {
								// If the MAC address only contains hex
								// digits without the
								// ":" delimiter, then add ":" to the
								// MAC address string.
								char[] cAddr = new char[17];
								for (int i = 0, j = 0; i < 12; i += 2) {
									sMacAddr.getChars(i, i + 2, cAddr, j);
									j += 2;
									if (j < 17) {
										cAddr[j++] = ':';
									}
								}

								sMacAddr = new String(cAddr);
							}
							showProgressDialog();
							doConnectionTest(sMacAddr);

						} catch (Exception e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
						Toast.makeText(cordova.getActivity().getApplicationContext(),
								" you have selected " + arrData.get(which).getName() + "", Toast.LENGTH_LONG).show();
					}
				});
				dialog.setPositiveButton("Cancel", new DialogInterface.OnClickListener() {

					public void onClick(DialogInterface dialog, int which) {
						dialog.dismiss();
						try {
							status.put("status", false);
							status.put("isconnected", -1);
						} catch (JSONException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
						sendUpdate(status, true);
					}
				});
				dialog.setCancelable(false);
				dialog.show();
			}
		};

		this.cordova.getActivity().runOnUiThread(runnable);

	}

	private void sendUpdate(JSONObject obj, boolean keepCallback) {
		if (this.callbackId != null) {
			Log.e("End of plugin", "true");
			PluginResult result = new PluginResult(PluginResult.Status.OK, obj);
			// result.setKeepCallback(keepCallback);
			this.success(result, this.callbackId);

		}
	}

	@Override
	public void onDestroy() {
		// TODO Auto-generated method stub
		super.onDestroy();

		try {
			if (btSocket != null)
				btSocket.close();

			if (outStream != null)
				outStream.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	private void doConnectionTest(final String address) throws JSONException {
		try {

			retryCount++;
			if (retryCount < 3) {
				Thread.sleep(200);
				cordova.getActivity().runOnUiThread(new Runnable() {

					public void run() {
						new ConnectTo().execute(address);
					}
				});

			} else {
				dismissProgress();
				try {
					status.put("status", false);
					sendUpdate(status, true);
				} catch (Exception e) {
					e.printStackTrace();
				}

			}
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	private void showProgressDialog() {
		progressDialog = ProgressDialog.show(cordova.getActivity(), "Please Wait", "Connecting to printer..", false);

	}

	private void dismissProgress() {

		if (progressDialog != null && progressDialog.isShowing()) {
			progressDialog.dismiss();

		}

	}

	public class ConnectTo extends AsyncTask<String, Void, Boolean> {

		@SuppressLint("NewApi")
		protected Boolean doInBackground(String... address) {

			boolean isConnected = false;

			try {

				// Set up a pointer to the remote node using it's address.
				BluetoothDevice device = mBtAdapter.getRemoteDevice(address[0]);
				// btSocket =
				// device.createInsecureRfcommSocketToServiceRecord(MY_UUID); //
				// doesn't work on lenovo
				// btSocket =
				// device.createRfcommSocketToServiceRecord(MY_UUID);// works
				// // on
				// // lenovo

				if (btSocket != null && btSocket.isConnected()) {

					btSocket.close();
					btSocket = null;
				}

				if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.KITKAT) {
					Method m = device.getClass().getMethod("createRfcommSocket", new Class[] { int.class });
					btSocket = (BluetoothSocket) m.invoke(device, 1);
				} else {
					btSocket = device.createInsecureRfcommSocketToServiceRecord(device.getUuids()[0].getUuid());

				}
				devicename = device.getName();

			} catch (Exception e) {
				e.printStackTrace();
				return false;
			}

			try {

				btSocket.connect();
				outStream = btSocket.getOutputStream();

			} catch (IOException e) {
				e.printStackTrace();
				return false;
			}

			return true;

		}

		@Override
		protected void onPostExecute(Boolean result) {

			if (result) {
				dismissProgress();
				Log.e("Connected", "true");
				printReports(sMacAddr);

			} else {
				try {
					doConnectionTest(sMacAddr);
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

			}

		}

		@Override
		protected void onPreExecute() {

		}

	}

	@SuppressLint("NewApi")
	void printReports(String address) {

		String configLabel = null;
		String sResult = null;
		boolean isTwice = false;
		try {
			Log.d("Print Report", "" + jArr.toString());
			for (int j = 0; j < jArr.length(); j++) {
				JSONArray jInner = jArr.getJSONArray(j);
				for (int i = 0; i < jInner.length(); i++) {
					JSONObject jDict = jInner.getJSONObject(i);
					String request = jDict.getString("name");
					JSONObject jsnData = jDict.getJSONObject("mainArr");
					if (request.equalsIgnoreCase("Transfer_In")) {
						// Checked
						parseLoadTransferResponse(jsnData, address);
					} else if (request.equalsIgnoreCase("Transfer_Out")) {
						// Checked
						parseLoadTransferResponse(jsnData, address);
					} else if (request.equalsIgnoreCase("LoadSummary")) {
						// Checked
						parseLoadSummaryResponse(jsnData, address);
					} else if (request.equalsIgnoreCase("LoadSummary2")) {
						// Checked
						parseLoadSummary2Response(jsnData, address);
					} else if (request.equalsIgnoreCase("Sales")) {
						  companyTaxStng=Integer.parseInt(jsnData.getString("enabletax"));
						if (!TextUtils.isEmpty(jsnData.getString("invoicepriceprint"))
								&& jsnData.getString("invoicepriceprint") != null
								&& jsnData.getString("invoicepriceprint").equals("0")) {
							printMiniSalesReport(jsnData, address);

						} else if(companyTaxStng==1){
							printSalesTaxReport(jsnData, address);
						} else {
							printSalesReport(jsnData, address);

						}
					} else if (request.equalsIgnoreCase("SalesReport")) {
						printSalesSummaryReport(jsnData, address);
					} else if (request.equalsIgnoreCase("Deposit")) {
						parseDepositResponse(jsnData, address);
						// parseDepositCashResponse(jsnData,address);

					} else if (request.equalsIgnoreCase("DepositSlip")) {
						// parseDepositResponse(jsnData,address);
						parseDepositCashResponse(jsnData, address);

					} else if (request.equalsIgnoreCase("UnloadDamage")) {
						parseUnloadResponse(jsnData, address);
					} else if (request.equalsIgnoreCase("Collection")) {
						parseCollectionResponse(jsnData, address);
					} else if (request.equalsIgnoreCase("AdvancePayment")) {
						parseAdvancePaymentResponse(jsnData, address);
					} else if (request.equalsIgnoreCase("EndInventory")) {
						// Checked
						parseEndInventory(jsnData, address);
					} else if (request.equalsIgnoreCase("RouteActivity")) {
						// Checked
						printRouteactivityReport(jsnData, address);
					} else if (request.equalsIgnoreCase("RouteSummary")) {
						// Checked
						printRouteSummaryReport(jsnData, address);
					} else if (request.equalsIgnoreCase("VanStock")) {
						// Checked
						printVanStockReport(jsnData, address);
					} else if (request.equalsIgnoreCase("EndInventoryReport")) {
						// Checked
						parseEndInventory(jsnData, address);
					} else if (request.equalsIgnoreCase("VanStockReport")) {
						// Checked
						printVanStockReport(jsnData, address);
					} else if (request.equalsIgnoreCase("LoadRequst")) {
						// Checked
						printLoadRequestReport(jsnData, address);
					} else if (request.equalsIgnoreCase("CreditSummary")) {
						printCreditSummaryReport(jsnData, address);
					} else if (request.equalsIgnoreCase("CreditTempSummary")) {
						printCreditTempSummaryReport(jsnData, address);
					} else if (request.equalsIgnoreCase("ItemSalesSummary")) {
						printItemSalesSummaryReport(jsnData, address);
					}else if(request.equalsIgnoreCase("Order")){
						printSalesOrderReport(jsnData, address); 
					}
					else if(request.equalsIgnoreCase("AgingAnalysis")){
						parseAgingAnalysisResponse(jsnData, address); 
					}else if (request.equalsIgnoreCase("ReturnSummary")) {
						parseReturnSummarysResponse(jsnData, address);

					} else if (request.equalsIgnoreCase("VanSettlement")) {
						// Checked
						printVanSettlementReport(jsnData, address);
					}
					

				}

			}
			Log.d("Print Report", "" + jArr.toString());

			// setStatus("Sending Data", Color.BLUE);

			/*
			 * if (zebraPrinterConnection instanceof BluetoothPrinterConnection)
			 * { String friendlyName = ((BluetoothPrinterConnection)
			 * zebraPrinterConnection) .getFriendlyName();
			 * setStatus(friendlyName, Color.MAGENTA);
			 * 
			 * }
			 */
		} /*
			 * catch (LinePrinterException ex) { sResult =
			 * "LinePrinterException: " + ex.getMessage(); }
			 */catch (Exception ex) {
			if (ex.getMessage() != null)
				sResult = "Unexpected exception: " + ex.getMessage();
			else
				sResult = "Unexpected exception.";
		} finally {
			if (outStream != null) {

				try {
					outStream.flush();
					outStream.close();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

			}

			if (btSocket != null && btSocket.isConnected()) {
				try {
					btSocket.close();
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}

			//
		} //

		/*
		 * } catch (Exception e) { sResult = "Unexpected exception: " +
		 * e.getMessage(); //setStatus(e.getMessage(), Color.RED); }
		 */

	}

	void parseLoadTransferResponse(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Sl#", 4);
			hashValues.put("Item#", 11);
			hashValues.put("Description", 25);
			hashValues.put("UPC", 4);
			hashValues.put("Transfer Qty",10);
			hashValues.put("Qty", 0);
			
			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Sl#", 0);
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("UPC", 2);
			hashPositions.put("Transfer Qty", 2);
			hashPositions.put("Qty", 2);
			

			// ---------Start
			// printconnect(args[0]);
			// ----------End
			line(startln);
			headerinvprint(object, 2);
			boolean transferout=false;
			int position = 300;
			JSONArray jData = object.getJSONArray("data");

			for (int i = 0; i < jData.length(); i++) {

				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");
				if(i==1){
					transferout=true;
					
				}
				if (jInnerData.length() > 0) {
					position = position + 60;
					switch (i) {
					case 0:
						outStream.write(BoldOn);
						outStream.write("       ".getBytes());
						outStream.write(UnderlineOn);
						printlines1("TRANSFER IN", 1, object, 1, args[0], 2);
						outStream.write(UnderlineOff);
						outStream.write(BoldOff);
						break;
					case 1:
						outStream.write(BoldOn);
						outStream.write("       ".getBytes());
						outStream.write(UnderlineOn);
						printlines1("TRANSFER OUT", 1, object, 1, args[0], 2);
						outStream.write(UnderlineOff);
						outStream.write(BoldOff);

						break;
					case 2:
						outStream.write(BoldOn);
						outStream.write("       ".getBytes());
						outStream.write(UnderlineOn);
						printlines1("DAMAGE TRANSFER OUT", 1, object, 1, args[0], 2);
						outStream.write(UnderlineOff);
						outStream.write(BoldOff);
						break;

					default:
						break;
					}

				}
				if(transferout){
					hashValues.put("Reason", 13);
					hashValues.put("Expiry Date", 13);
					hashPositions.put("Reason", 1);
					hashPositions.put("Expiry Date", 2);
				}else{
					hashValues.put("Net Qty", 13);
					hashValues.put("Value", 13);
					hashPositions.put("Net Qty", 1);
					hashPositions.put("Value", 2);
				}
				
				int MAXLEngth = 80;
				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());

				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / (headers.length()-1);
				}

				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					strheader = strheader + getAccurateText(
							(headers.getString(j).indexOf(" ") == -1) ? headers.getString(j)
									: headers.getString(j).substring(0, headers.getString(j).indexOf(" ")),
							hashValues.get(headers.getString(j).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(j).toString()));

					strHeaderBottom = strHeaderBottom
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? ""
											: headers.getString(j)
													.substring(headers.getString(j).indexOf(" "),
															headers.getString(j).length())
													.trim(),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));

					if (jTotal.has(headers.getString(j))) {
						strTotal = strTotal + getAccurateText(jTotal.getString(headers.getString(j).toString()),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					} else {

						strTotal = strTotal + getAccurateText(headers.getString(j).equals("Description") ? "TOTAL" : "",
								hashValues.get(headers.getString(j)) + MAXLEngth, 1);
					}

				}
				if (jInnerData.length() > 0) {
					printlines1(strheader, 1, object, 1, args[0], 2);
					if (strHeaderBottom.length() > 0) {

						printlines1(strHeaderBottom, 1, object, 1, args[0], 2);

					}

					printlines1(printSeprator(), 1, object, 1, args[0], 2);

				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					for (int m = 0; m < jArr.length(); m++) {
						strData = strData + getAccurateText(m == 0 ? (l + 1) + "" : jArr.getString(m),
								hashValues.get(headers.getString(m).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(m).toString()));
					}

					printlines1(strData, 1, object, 1, args[0], 2);

				}
				if (jInnerData.length() > 0) {

					printlines1(printSeprator(), 1, object, 1, args[0], 2);
					printlines1(strTotal, 1, object, 1, args[0], 2);

				}

			}
			// printlines1(getAccurateText("", 80, 1), 2, object, 1, args[0],
			// 2);
			// outStream.write(NewLine);
			outStream.write(BoldOn);
			printlines1((getAccurateText("Net Value : ", 50, 2) + getAccurateText(object.getString("netvalue"), 12, 2)),
					2, object, 1, args[0], 2);
			outStream.write(BoldOff);
			printlines1((getAccurateText("FROM SALESMAN_____________", 26, 1)
					+ getAccurateText("TO SALESMAN____________", 26, 1)
					+ getAccurateText("SUPERVISOR____________", 26, 1)), 2, object, 1, args[0], 2);
			printlines1(getAccurateText(object.getString("printstatus"), 80, 1), 2, object, 2, args[0], 2);

			// s1.insert(0,
			// "! 0 "+position+" "+position+" "+(position+10)+" 1\n");

		} catch (Exception e) {
			e.printStackTrace();
		}

		// return String.valueOf(s1);
	}

	void parseLoadSummary2Response(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {

			hashValues = new HashMap<String, Integer>();
			hashValues.put("Sl#", 4);
			hashValues.put("Item#", 10);
			hashValues.put("Description", 55);
			hashValues.put("UPC", 8);
			hashValues.put("Van Qty", 0);
			hashValues.put("Load Qty", 20);
			hashValues.put("Net Qty", 20);
			hashValues.put("VALUE", 20);
			hashValues.put("Description", 55);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Sl#", 0);
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("UPC", 2);
			hashPositions.put("Van Qty", 2);
			hashPositions.put("Load Qty", 2);
			hashPositions.put("Net Qty", 2);
			hashPositions.put("VALUE", 2);
			hashPositions.put("Description", 0);
			// ---------Start
			// printconnect(args[0]);
			// ----------End
			line(startln);
			headerinvprint(object, 1);

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "";
			int MAXLEngth = 137;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}
			for (int i = 0; i < headers.length(); i++) {

				strheader = strheader + getAccurateText(headers.getString(i).toString(),
						hashValues.get(headers.getString(i).toString()) + MAXLEngth,
						hashPositions.get(headers.getString(i).toString()));

			}
			outStream.write(CompressOn);
			printlines1(strheader, 1, object, 1, args[0], 1);
			printlines1(printSepratorcomp(), 1, object, 1, args[0], 1);
			outStream.write(CompressOff);
			JSONArray jData = object.getJSONArray("data");
			int position = 310;
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					if (j != 4) {
						String itemDescrion = jArr.getString(j);
						if (j == 0) {
							itemDescrion = (i + 1) + "";

						} else if (j == 8) {
							itemDescrion = "                *" + jArr.getString(j) + "!";

						}

						strData = strData + getAccurateText(itemDescrion,
								j == 8 ? 60 : hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(j == 8 ? "Description" : headers.getString(j).toString()));
					}
				}

				// position = position + 30;
				// s1.append(String.format(strFormat, position, strData) +
				// "\n");
				count++;
				outStream.write(CompressOn);
				printlines1(strData, 1, object, 1, args[0], 1);
				outStream.write(CompressOff);
			}
			outStream.write(CompressOn);
			printlines1(printSepratorcomp(), 1, object, 1, args[0], 1);

			JSONArray jTotal = object.getJSONArray("TOTAL");
			for (int i = 0; i < jTotal.length(); i++) {
				JSONObject jTOBject = jTotal.getJSONObject(0);
				String strTotal = "";
				for (int j = 0; j < headers.length(); j++) {
					if (j != 4) {
						if (jTOBject.has(headers.getString(j))) {
							strTotal = strTotal + getAccurateText(jTOBject.getString(headers.getString(j).toString()),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));
						} else {

							strTotal = strTotal
									+ getAccurateText(headers.getString(j).equals("Description") ? "TOTAL" : "",
											hashValues.get(headers.getString(j)) + MAXLEngth, 1);
						}
					}
				}

				printlines1(strTotal, 1, object, 1, args[0], 1);

			}
			outStream.write(CompressOff);
			printlines1(getAccurateText("", 80, 1), 2, object, 1, args[0], 1);
			outStream.write(BoldOn);
			printlines1(
					(getAccurateText("Load Value : ", 50, 2) + getAccurateText(object.getString("LoadValue"), 12, 2)),
					1, object, 1, args[0], 2);
			outStream.write(BoldOff);
			printlines1((getAccurateText("STORE KEEPER____________", 40, 1)
					+ getAccurateText("TO SALESMAN___________", 40, 1)), 2, object, 1, args[0], 1);
			printlines1(getAccurateText(object.getString("printstatus"), 80, 1), 2, object, 2, args[0], 1);

		} catch (Exception e) {
			e.printStackTrace();
		}
		// return String.valueOf(s1);
	}

	// ------------company status report
	void printCreditSummaryReport(final JSONObject object, final String... args) {
		try {

			hashValues = new HashMap<String, Integer>();
			hashValues.put("Customer#", 20);
			hashValues.put("Customer Name", 57);
			hashValues.put("Opening Balance", 15);
			hashValues.put("Sales Amount", 15);
			hashValues.put("Collection Amount", 15);
			hashValues.put("Current Balance", 15);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Customer#", 0);
			hashPositions.put("Customer Name", 0);
			hashPositions.put("Opening Balance", 2);
			hashPositions.put("Sales Amount", 2);
			hashPositions.put("Collection Amount", 2);
			hashPositions.put("Current Balance", 2);

			line(startln);
			// printlines1(printSeprator(), 1, object, 1, args[0], 6);
			// headerinvprint(object, 6);
			headervanstockprint(object, 6);

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strHeaderBottom = "";
			int MAXLEngth = 137;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}
			for (int i = 0; i < headers.length(); i++) {

				strheader = strheader + getAccurateText(
						(headers.getString(i).indexOf(" ") == -1) ? headers.getString(i)
								: headers.getString(i).substring(0, headers.getString(i).indexOf(" ")),
						hashValues.get(headers.getString(i).toString()) + MAXLEngth,
						hashPositions.get(headers.getString(i).toString()));
				strHeaderBottom = strHeaderBottom + getAccurateText(
						(headers.getString(i).indexOf(" ") == -1) ? ""
								: headers.getString(i).substring(headers.getString(i).indexOf(" "),
										headers.getString(i).length()),
						hashValues.get(headers.getString(i).toString()) + MAXLEngth,
						hashPositions.get(headers.getString(i).toString()));

			}
			outStream.write(CompressOn);
			printlines1(strheader, 1, object, 1, args[0], 6);
			printlines1(strHeaderBottom, 1, object, 1, args[0], 6);
			printlines1(printSepratorcomp(), 1, object, 1, args[0], 6);
			outStream.write(CompressOff);
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					strData = strData + getAccurateText(jArr.getString(j),
							hashValues.get(headers.getString(j).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(j).toString()));
				}

				// position = position + 30;
				// s1.append(String.format(strFormat, position, strData) +
				// "\n");
				outStream.write(CompressOn);
				printlines1(strData, 1, object, 1, args[0], 6);
				outStream.write(CompressOff);
			}
			outStream.write(CompressOn);
			printlines1(printSepratorcomp(), 1, object, 1, args[0], 6);
			outStream.write(CompressOff);

			JSONArray jTotal = object.getJSONArray("TOTAL");
			for (int i = 0; i < jTotal.length(); i++) {
				JSONObject jTOBject = jTotal.getJSONObject(0);
				String strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					if (jTOBject.has(headers.getString(j))) {
						strTotal = strTotal + getAccurateText(jTOBject.getString(headers.getString(j).toString()),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					} else {

						strTotal = strTotal + getAccurateText(headers.getString(j).equals("Description") ? "TOTAL" : "",
								hashValues.get(headers.getString(j)) + MAXLEngth, 1);
					}
				}
				outStream.write(CompressOn);
				printlines1(strTotal, 1, object, 1, args[0], 6);
				outStream.write(CompressOff);
			}
			printlines1("", 1, object, 2, args[0], 6);
			// outStream.write(BoldOn);

		} catch (Exception e) {
			e.printStackTrace();
		}
		// return String.valueOf(s1);
	}

	// --------
	void printCreditTempSummaryReport(final JSONObject object, final String... args) {
		try {

			hashValues = new HashMap<String, Integer>();
			hashValues.put("Customer#", 20);
			hashValues.put("Customer Name", 57);
			hashValues.put("Opening Balance", 15);
			hashValues.put("Sales Amount", 15);
			hashValues.put("Collection Amount", 15);
			hashValues.put("Current Balance", 15);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Customer#", 0);
			hashPositions.put("Customer Name", 0);
			hashPositions.put("Opening Balance", 2);
			hashPositions.put("Sales Amount", 2);
			hashPositions.put("Collection Amount", 2);
			hashPositions.put("Current Balance", 2);

			line(startln);
			// printlines1(printSeprator(), 1, object, 1, args[0], 6);
			// headerinvprint(object, 6);
			headervanstockprint(object, 25);

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strHeaderBottom = "";
			int MAXLEngth = 137;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}
			for (int i = 0; i < headers.length(); i++) {

				strheader = strheader + getAccurateText(
						(headers.getString(i).indexOf(" ") == -1) ? headers.getString(i)
								: headers.getString(i).substring(0, headers.getString(i).indexOf(" ")),
						hashValues.get(headers.getString(i).toString()) + MAXLEngth,
						hashPositions.get(headers.getString(i).toString()));
				strHeaderBottom = strHeaderBottom + getAccurateText(
						(headers.getString(i).indexOf(" ") == -1) ? ""
								: headers.getString(i).substring(headers.getString(i).indexOf(" "),
										headers.getString(i).length()),
						hashValues.get(headers.getString(i).toString()) + MAXLEngth,
						hashPositions.get(headers.getString(i).toString()));

			}
			outStream.write(CompressOn);
			printlines1(strheader, 1, object, 1, args[0], 25);
			printlines1(strHeaderBottom, 1, object, 1, args[0], 25);
			printlines1(printSepratorcomp(), 1, object, 1, args[0], 25);
			outStream.write(CompressOff);
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					strData = strData + getAccurateText(jArr.getString(j),
							hashValues.get(headers.getString(j).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(j).toString()));
				}

				// position = position + 30;
				// s1.append(String.format(strFormat, position, strData) +
				// "\n");
				outStream.write(CompressOn);
				printlines1(strData, 1, object, 1, args[0], 25);
				outStream.write(CompressOff);
			}
			outStream.write(CompressOn);
			printlines1(printSepratorcomp(), 1, object, 1, args[0], 25);
			outStream.write(CompressOff);

			JSONArray jTotal = object.getJSONArray("TOTAL");
			for (int i = 0; i < jTotal.length(); i++) {
				JSONObject jTOBject = jTotal.getJSONObject(0);
				String strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					if (jTOBject.has(headers.getString(j))) {
						strTotal = strTotal + getAccurateText(jTOBject.getString(headers.getString(j).toString()),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					} else {

						strTotal = strTotal + getAccurateText(headers.getString(j).equals("Description") ? "TOTAL" : "",
								hashValues.get(headers.getString(j)) + MAXLEngth, 1);
					}
				}
				outStream.write(CompressOn);
				printlines1(strTotal, 1, object, 1, args[0], 25);
				outStream.write(CompressOff);
			}
			printlines1("", 1, object, 2, args[0], 25);
			// outStream.write(BoldOn);

		} catch (Exception e) {
			e.printStackTrace();
		}
		// return String.valueOf(s1);
	}

	// -------
	// --------
	void parseLoadSummaryResponse(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Sl#", 4);
			hashValues.put("Item#", 10);
			hashValues.put("Description", 40);
			hashValues.put("UPC", 8);
			hashValues.put("Open Qty", 12);
			hashValues.put("Load Qty", 12);
			hashValues.put("Adjust Qty", 12);
			hashValues.put("Net Qty", 12);
			hashValues.put("VALUE", 12);
			hashValues.put("Description", 40);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Sl#", 0);
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("UPC", 2);
			hashPositions.put("Open Qty", 2);
			hashPositions.put("Load Qty", 2);
			hashPositions.put("Adjust Qty", 2);
			hashPositions.put("Net Qty", 2);
			hashPositions.put("VALUE", 2);
			hashPositions.put("Description", 0);
			// ---------Start
			// printconnect(args[0]);
			// ----------End
			line(startln);

			// headercommmanprint(object);
			headerinvprint(object, 1);

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strHeaderBottom = "";
			int MAXLEngth = 137;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}
			for (int i = 0; i < headers.length(); i++) {

				// strheader = strheader
				// + getAccurateText(headers.getString(i).toString(),
				// hashValues.get(headers.getString(i).toString())
				// + MAXLEngth, hashPositions.get(headers
				// .getString(i).toString()));

				strheader = strheader + getAccurateText(
						(headers.getString(i).indexOf(" ") == -1) ? headers.getString(i)
								: headers.getString(i).substring(0, headers.getString(i).indexOf(" ")),
						hashValues.get(headers.getString(i).toString()) + MAXLEngth,
						hashPositions.get(headers.getString(i).toString()));

				strHeaderBottom = strHeaderBottom
						+ getAccurateText(
								(headers.getString(i).indexOf(" ") == -1) ? ""
										: headers.getString(i)
												.substring(headers.getString(i).indexOf(" "),
														headers.getString(i).length())
												.trim(),
								hashValues.get(headers.getString(i).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(i).toString()));

			}
			outStream.write(CompressOn);
			printlines1(strheader, 1, object, 1, args[0], 1);
			printlines1(strHeaderBottom, 1, object, 1, args[0], 1);
			printlines1(printSepratorcomp(), 1, object, 1, args[0], 1);
			outStream.write(CompressOff);
			JSONArray jData = object.getJSONArray("data");

			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {

					String itemDescrion = jArr.getString(j);
					if (j == 0) {
						itemDescrion = (i + 1) + "";

					} else if (j == 8) {
						itemDescrion = "                 *" + jArr.getString(j) + "!";

					}

					strData = strData + getAccurateText(itemDescrion,
							j == 9 ? 60 : hashValues.get(headers.getString(j).toString()) + MAXLEngth,
							hashPositions.get(j == 9 ? "Description" : headers.getString(j).toString()));
				}
				outStream.write(CompressOn);
				count++;
				printlines1(strData, 1, object, 1, args[0], 1);
				outStream.write(CompressOff);
			}

			outStream.write(CompressOn);
			printlines1(printSepratorcomp(), 1, object, 1, args[0], 1);
			JSONArray jTotal = object.getJSONArray("TOTAL");
			for (int i = 0; i < jTotal.length(); i++) {
				JSONObject jTOBject = jTotal.getJSONObject(0);
				String strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					if (jTOBject.has(headers.getString(j))) {
						strTotal = strTotal + getAccurateText(jTOBject.getString(headers.getString(j).toString()),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					} else {

						strTotal = strTotal + getAccurateText(headers.getString(j).equals("Description") ? "TOTAL" : "",
								hashValues.get(headers.getString(j)) + MAXLEngth, 1);
					}
				}
				printlines1(strTotal, 1, object, 1, args[0], 1);

			}
			outStream.write(CompressOff);
			printlines1(" ", 1, object, 1, args[0], 1);
			outStream.write(BoldOn);
			// printlines1(
			// (getAccurateText("Opening Value : ", 50, 2) + getAccurateText(
			// object.getString("OpenValue"), 12, 2)), 1, object,
			// 1, args[0], 2);
			printlines1(
					(getAccurateText("Load Value : ", 50, 2) + getAccurateText(object.getString("LoadValue"), 12, 2)),
					1, object, 1, args[0], 2);
			// printlines1(
			// (getAccurateText("Net Value : ", 50, 2) + getAccurateText(
			// object.getString("netvalue"), 12, 2)), 1, object,
			// 1, args[0], 2);
			outStream.write(NewLine);
			outStream.write(BoldOff);
			printlines1((getAccurateText("STORE KEEPER_____________", 40, 1)
					+ getAccurateText("TO SALESMAN____________", 40, 1)), 2, object, 1, args[0], 1);
			printlines1(getAccurateText(object.getString("printstatus"), 80, 1), 2, object, 2, args[0], 1);

		} catch (Exception e) {
			e.printStackTrace();
		}
		// return String.valueOf(s1);
	}

	//
	void parseUnloadResponse(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("ITEM#", 15);
			hashValues.put("DESCRIPTION", 42);
			hashValues.put("UPC", 7);
			hashValues.put("STALES OUT/PCS", 0);
			hashValues.put("STALES T.PCS", 0);
			hashValues.put("DAMAGE OUT/PCS", 0);
			hashValues.put("DAMAGE IN PCS", 12);
			hashValues.put("OTHER OUT/PCS", 0);
			hashValues.put("OTHER T.PCS", 0);
			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("ITEM#", 0);
			hashPositions.put("DESCRIPTION", 0);
			hashPositions.put("UPC", 1);
			hashPositions.put("STALES OUT/PCS", 2);
			hashPositions.put("STALES T.PCS", 2);
			hashPositions.put("DAMAGE OUT/PCS", 2);
			hashPositions.put("DAMAGE IN PCS", 2);
			hashPositions.put("OTHER OUT/PCS", 2);
			hashPositions.put("OTHER T.PCS", 2);

			// ---------Start
			// printconnect(args[0]);
			// ----------End
			line(startln);

			headerprint(object, 7);

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strHeaderBottom = "";
			int MAXLEngth = 130;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}
			for (int i = 0; i < headers.length(); i++) {
				if (i != 3 || i != 4 || i != 5 || i != 7 || i != 8) {
					strheader = strheader + getAccurateText(
							(headers.getString(i).indexOf(" ") == -1) ? headers.getString(i)
									: headers.getString(i).substring(0, headers.getString(i).indexOf(" ")),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));
					strHeaderBottom = strHeaderBottom + getAccurateText(
							(headers.getString(i).indexOf(" ") == -1) ? ""
									: headers.getString(i).substring(headers.getString(i).indexOf(" "),
											headers.getString(i).length()),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));
				}

			}
			outStream.write(CompressOn);
			printlines2(printSepratorcomp(), 1, object, 1, args[0], 7, 7);
			printlines2(strheader, 1, object, 1, args[0], 7, 7);
			printlines2(strHeaderBottom, 1, object, 1, args[0], 7, 7);
			printlines2(printSepratorcomp(), 1, object, 1, args[0], 7, 7);
			outStream.write(CompressOff);

			JSONArray jData = object.getJSONArray("data");

			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					if (i != 3 || i != 4 || i != 5 || i != 7 || i != 8) {

						String itemDescrion = jArr.getString(j);
						if (j == 1) {
							if (object.getString("LANG").equals("en")) {
								itemDescrion = jArr.getString(j);
							} else {
								itemDescrion = "*" + jArr.getString(j) + "!";
							}
						}

						strData = strData + getAccurateText(itemDescrion,
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					}

				}

				outStream.write(CompressOn);
				printlines2(strData, 1, object, 1, args[0], 7, 7);
				outStream.write(CompressOff);
			}
			outStream.write(CompressOn);
			printlines2(printSepratorcomp(), 1, object, 1, args[0], 7, 7);
			JSONArray jTotal = object.getJSONArray("TOTAL");
			
			// sujee commented no need to print total 08/06/2021
			/*
			for (int i = 0; i < jTotal.length(); i++) {
				JSONObject jTOBject = jTotal.getJSONObject(0);
				String strTotal = "";
				for (int j = 0; j < headers.length(); j++) {
					if (i != 3 || i != 4 || i != 5 || i != 7 || i != 8) {
						if (jTOBject.has(headers.getString(j))) {
							strTotal = strTotal + getAccurateText(jTOBject.getString(headers.getString(j).toString()),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));
						} else {

							strTotal = strTotal
									+ getAccurateText(headers.getString(j).equals("Description") ? "TOTAL" : "",
											hashValues.get(headers.getString(j)) + MAXLEngth, 1);
						}
					}
				}

				printlines2(strTotal, 1, object, 1, args[0], 7, 7);

			}
			*/
			
			outStream.write(CompressOff);
			printlines2(" ", 2, object, 1, args[0], 7, 7);
			outStream.write(BoldOn);
			String totalAmt = "0";
			String varAmt = "0";
			// printlines2(
			// (getAccurateText("TOTAL EXPIRY VALUE", 60, 2) + getAccurateText(
			// object.has("TOTAL_EXPIRY_VALUE") ? object
			// .getString("TOTAL_EXPIRY_VALUE") : "0", 16,
			// 1)), 1, object, 1, args[0], 7, 7);
			printlines2(
					(getAccurateText("TOTAL DAMAGE VALUE", 60, 2) + getAccurateText(
							object.has("TOTAL_DAMAGE_VALUE") ? object.getString("TOTAL_DAMAGE_VALUE") : "0", 16, 1)),
					1, object, 1, args[0], 7, 7);
			
			 printlines2(
			 (getAccurateText("TOTAL EXPIRY VALUE", 60, 2) + getAccurateText(
			 object.has("TOTAL_EXPIRY_VALUE") ? object
			 .getString("TOTAL_EXPIRY_VALUE") : "0", 16,
			 1)), 1, object, 1, args[0], 7, 7);
			
			// printlines2(
			// (getAccurateText("TOTAL OTHER VALUE", 60, 2) + getAccurateText(
			// object.has("TOTAL_OTHER_VALUE") ? object
			// .getString("TOTAL_OTHER_VALUE") : "0", 16,
			// 1)), 1, object, 1, args[0], 7, 7);
			// printlines2(
			// (getAccurateText("UNLOADED STALES VARIANCE", 60, 2) +
			// getAccurateText(
			// object.has("TOTAL_STALES_VAR") ? object
			// .getString("TOTAL_STALES_VAR") : "0", 16, 1)),
			// 1, object, 1, args[0], 7, 7);
			
			// no need to print variance 08/06/2021
			/*
			 * printlines2( (getAccurateText("UNLOADED DAMAGE VARIANCE", 60, 2) +
			 * getAccurateText( object.has("damagevariance") ?
			 * object.getString("damagevariance") : "0", 16, 1)), 1, object, 1, args[0], 7,
			 * 7);
			 */

			outStream.write(BoldOff);
			printlines2(" ", 2, object, 1, args[0], 7, 7);
			printlines2(getAccurateText("SALESMAN______________", 80, 1), 1, object, 2, args[0], 7, 7);

		} catch (Exception e) {
			e.printStackTrace();
		}
		// return String.valueOf(s1);
	}

	//
	// ----------Start LoadRequest By VB 9/1/2104
	void printLoadRequestReport(final JSONObject object, final String... args) {

		try {

			hashValues = new HashMap<String, Integer>();
			hashValues.put("Sl#", 4);
			hashValues.put("Item#", 12); //7
			hashValues.put("Description", 36); // 41
			hashValues.put("UPC", 4);
			hashValues.put("Case Price", 8);
			hashValues.put("Unit Price", 8);
			hashValues.put("Request Qty", 8);
			// hashValues.put("Sale Qty", 8);
			// hashValues.put("Return Qty", 7);
			// hashValues.put("Truck Stock", 9);
			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Sl#", 0);
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("UPC", 2);
			hashPositions.put("Case Price", 2);
			hashPositions.put("Unit Price", 2);
			hashPositions.put("Request Qty", 2);
			// hashPositions.put("Sale Qty", 2);
			// hashPositions.put("Return Qty", 2);
			// hashPositions.put("Truck Stock", 2);
			// ---------Start
			// printconnect(args[0]);
			// ----------End
			line(startln);
			// headerRequestprint(object);
			headerinvprint(object, 5);

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strHeaderBottom = "";

			String strTotal = "";
			JSONArray jTotal = object.getJSONArray("TOTAL");
			int MAXLEngth = 80;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}

			JSONObject jTOBject = jTotal.getJSONObject(0);
			for (int i = 0; i < headers.length(); i++) {

				try {
					strheader = strheader + getAccurateText(
							(headers.getString(i).indexOf(" ") == -1) ? headers.getString(i)
									: headers.getString(i).substring(0, headers.getString(i).indexOf(" ")),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));

					strHeaderBottom = strHeaderBottom + getAccurateText(
							(headers.getString(i).indexOf(" ") == -1) ? ""
									: headers.getString(i).substring(headers.getString(i).indexOf(" "),
											headers.getString(i).length()),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));
					if (jTOBject.has(headers.getString(i))) {
						strTotal = strTotal + getAccurateText(jTOBject.getString(headers.getString(i).toString()),
								hashValues.get(headers.getString(i).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(i).toString()));
					} else {

						strTotal = strTotal + getAccurateText(headers.getString(i).equals("Description") ? "TOTAL" : "",
								hashValues.get(headers.getString(i)) + MAXLEngth, 1);
					}
				} catch (Exception e) {

				}
			}

			printlines1(strheader, 1, object, 1, args[0], 5);
			printlines1(strHeaderBottom, 1, object, 1, args[0], 5);
			printlines1(printSeprator(), 1, object, 1, args[0], 5);

			JSONArray jData = object.getJSONArray("data");

			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";

				for (int j = 0; j < jArr.length(); j++) {

					String itemDescrion = jArr.getString(j);
					if (j == 0) {
						itemDescrion = (i + 1) + "";

					} else if (j == 2) {
						if (object.getString("LANG").equals("en")) {
							itemDescrion = jArr.getString(j);
						} else {
							itemDescrion = "*" + jArr.getString(j) + "!";
						}

					}

					strData = strData
							+ getAccurateText(itemDescrion, hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));
				}

				printlines1(strData, 1, object, 1, args[0], 5);

			}
			printlines1(printSeprator(), 1, object, 1, args[0], 5);
			printlines1(strTotal, 1, object, 1, args[0], 5);

			printlines1(getAccurateText("", 80, 1), 2, object, 1, args[0], 5);
			outStream.write(BoldOn);
			printlines1((getAccurateText("Net Value : ", 50, 2) + getAccurateText(object.getString("netvalue"), 12, 2)),
					3, object, 1, args[0], 5);
			outStream.write(BoldOff);
			printlines1((getAccurateText("STORE KEEPER____________", 40, 1)
					+ getAccurateText("TO SALESMAN___________", 40, 1)), 2, object, 1, args[0], 5);
			printlines1(getAccurateText(object.getString("printstatus"), 80, 1), 2, object, 2, args[0], 5);

		} catch (Exception e) {
			e.printStackTrace();
		}
		// return String.valueOf(s1);
	}

	// ---------End Vanstock Report
	// ----------Start Vanstock By VB 9/1/2104
	void printVanStockReport(final JSONObject object, final String... args) {

		try {

			hashValues = new HashMap<String, Integer>();
			hashValues.put("Item#", 10);
			hashValues.put("Description", 34);
			hashValues.put("Loaded Qty", 8);
			hashValues.put("Transfer Qty", 0);
			hashValues.put("Sale Qty", 6);
			hashValues.put("Return Qty", 6);
			hashValues.put("Truck Stock", 7);
			hashValues.put("Total", 9);
			hashValues.put("Description", 34);
			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("Loaded Qty", 2);
			hashPositions.put("Transfer Qty", 2);
			hashPositions.put("Sale Qty", 2);
			hashPositions.put("Return Qty", 2);
			hashPositions.put("Truck Stock", 2);
			hashPositions.put("Total", 1);
			hashPositions.put("Description", 0);
			// ---------Start
			// printconnect(args[0]);
			// ----------End
			line(startln);
			headervanstockprint(object, 4);

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strHeaderBottom = "";

			String strTotal = "";
			JSONArray jTotal = object.getJSONArray("TOTAL");
			int MAXLEngth = 80;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}

			JSONObject jTOBject = jTotal.getJSONObject(0);
			for (int i = 0; i < headers.length(); i++) {

				try {
					strheader = strheader + getAccurateText(
							(headers.getString(i).indexOf(" ") == -1) ? headers.getString(i)
									: headers.getString(i).substring(0, headers.getString(i).indexOf(" ")),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));

					strHeaderBottom = strHeaderBottom + getAccurateText(
							(headers.getString(i).indexOf(" ") == -1) ? ""
									: headers.getString(i).substring(headers.getString(i).indexOf(" "),
											headers.getString(i).length()),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));
					if (jTOBject.has(headers.getString(i))) {
						strTotal = strTotal + getAccurateText(jTOBject.getString(headers.getString(i).toString()),
								hashValues.get(headers.getString(i).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(i).toString()));
					} else {

						strTotal = strTotal + getAccurateText(headers.getString(i).equals("Description") ? "TOTAL" : "",
								hashValues.get(headers.getString(i)) + MAXLEngth, 1);
					}
				} catch (Exception e) {

				}
			}

			printlines1(strheader, 1, object, 1, args[0], 4);
			printlines1(strHeaderBottom, 1, object, 1, args[0], 4);
			printlines1(printSeprator(), 1, object, 1, args[0], 4);

			JSONArray jData = object.getJSONArray("data");

			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				String barcodeData = "";
				for (int j = 0; j < jArr.length(); j++) {
					if (j != 3) {
						String itemDescrion = jArr.getString(j);

						if (j == 8) {
							itemDescrion = "        " + jArr.getString(j) + "";
						}

						strData = strData + getAccurateText(itemDescrion,
								j == 8 ? 60 : hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(j == 8 ? "Description" : headers.getString(j).toString()));
					}
				}
				count++;
				printlines1(strData, 1, object, 1, args[0], 4);

			}
			printlines1(printSeprator(), 1, object, 1, args[0], 4);
			printlines1(strTotal, 1, object, 1, args[0], 4);
			printlines1(printSeprator(), 1, object, 2, args[0], 4);

		} catch (Exception e) {
			e.printStackTrace();
		}
		// return String.valueOf(s1);
	}

	void printItemSalesSummaryReport(final JSONObject object, final String... args) {

		try {

			hashValues = new HashMap<String, Integer>();
			hashValues.put("Item#", 8);
			hashValues.put("Description", 47);
			hashValues.put("Sale Qty", 8);
			hashValues.put("Free Qty", 8);
			hashValues.put("Total", 9);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("Sale Qty", 1);
			hashPositions.put("Free Qty", 1);
			hashPositions.put("Total", 1);
			// ---------Start
			// printconnect(args[0]);
			// ----------End
			line(startln);
			headervanstockprint(object, 10);

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strHeaderBottom = "";

			String strTotal = "";
			JSONArray jTotal = object.getJSONArray("TOTAL");
			int MAXLEngth = 80;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}

			JSONObject jTOBject = jTotal.getJSONObject(0);
			for (int i = 0; i < headers.length(); i++) {

				try {
					strheader = strheader + getAccurateText(
							(headers.getString(i).indexOf(" ") == -1) ? headers.getString(i)
									: headers.getString(i).substring(0, headers.getString(i).indexOf(" ")),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));

					strHeaderBottom = strHeaderBottom + getAccurateText(
							(headers.getString(i).indexOf(" ") == -1) ? ""
									: headers.getString(i).substring(headers.getString(i).indexOf(" "),
											headers.getString(i).length()),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));
					if (jTOBject.has(headers.getString(i))) {
						strTotal = strTotal + getAccurateText(jTOBject.getString(headers.getString(i).toString()),
								hashValues.get(headers.getString(i).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(i).toString()));
					} else {

						strTotal = strTotal + getAccurateText(headers.getString(i).equals("Description") ? "TOTAL" : "",
								hashValues.get(headers.getString(i)) + MAXLEngth, 1);
					}
				} catch (Exception e) {

				}
			}

			printlines1(strheader, 1, object, 1, args[0], 10);
			printlines1(strHeaderBottom, 1, object, 1, args[0], 10);
			printlines1(printSeprator(), 1, object, 1, args[0], 10);

			JSONArray jData = object.getJSONArray("data");

			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {

					String itemDescrion = jArr.getString(j);

					if (j == 1) {
						if (object.getString("LANG").equals("en")) {
							itemDescrion = jArr.getString(j);
						} else {
							itemDescrion = "*" + jArr.getString(j) + "!";
						}

					}

					strData = strData
							+ getAccurateText(itemDescrion, hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));

				}

				printlines1(strData, 1, object, 1, args[0], 10);

			}
			printlines1(printSeprator(), 1, object, 1, args[0], 10);
			printlines1(strTotal, 1, object, 1, args[0], 4);
			printlines1(printSeprator(), 3, object, 1, args[0], 10);

			outStream.write(BoldOn);
			printlines2((getAccurateText("Total Amount", 20, 0) + getAccurateText(" : ", 3, 0)
					+ getAccurateText(object.getString("totalamount"), 12, 0) + getAccurateText(" : ", 3, 0) + "*"
					+ getAccurateText(ArabicTEXT.TOTAL, 15, 2) + "!"), 3, object, 1, args[0], 1, 10);
			outStream.write(BoldOff);
			printlines2(getAccurateText("SALESMAN_______________*" + ArabicTEXT.Salesman + "!", 80, 1), 2, object, 2,
					args[0], 1, 10);
			outStream.write(NewLine);

		} catch (Exception e) {
			e.printStackTrace();
		}
		// return String.valueOf(s1);
	}

	void printMiniSalesReport(JSONObject object, String... args) {
		StringBuffer s1 = new StringBuffer();
		int printoultlet = 0;
		try {

			if (object.getString("printoutletitemcode").length() > 0) {
				printoultlet = Integer.parseInt(object.getString("printoutletitemcode"));
			} else {
				printoultlet = 0;
			}

			hashValues = new HashMap<String, Integer>();
			hashValues.put("SL#", 5);
			hashValues.put("ITEM#", 15);

			if (printoultlet == 0) {
				hashValues.put("OUTLET CODE", 0);
				hashValues.put("DESCRIPTION", 85);

			} else {

				hashValues.put("OUTLET CODE", 10);
				hashValues.put("DESCRIPTION", 75);
			}
			hashValues.put("UPC", 7);
			hashValues.put("QTY CAS/PCS", 15);
			hashValues.put("QTY OUT/PCS", 15);
			hashValues.put("TOTAL PCS", 10);
			hashValues.put("CASE PRICE", 0);
			hashValues.put("UNIT PRICE", 0);
			hashValues.put("DISCOUNT", 0);
			hashValues.put("AMOUNT", 0);

			hashValues.put("OUTER PRICE", 0);
			hashValues.put("PCS PRICE", 0);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("SL#", 0);
			hashPositions.put("ITEM#", 0);
			hashPositions.put("OUTLET CODE", 0);
			hashPositions.put("DESCRIPTION", 0);
			hashPositions.put("UPC", 1);
			hashPositions.put("QTY CAS/PCS", 1);
			hashPositions.put("QTY OUT/PCS", 1);
			hashPositions.put("TOTAL PCS", 1);
			hashPositions.put("CASE PRICE", 2);
			hashPositions.put("UNIT PRICE", 2);
			hashPositions.put("DISCOUNT", 2);
			hashPositions.put("AMOUNT", 2);
			hashPositions.put("DESCRIPTION", 0);
			hashPositions.put("OUTER PRICE", 2);
			hashPositions.put("PCS PRICE", 2);

			// ---------Start

			// ----------End
			line(startln);
			// lp.newLine(5);
			headerprint(object, 1);

			Log.e("Printoutletitemcode", "" + printoultlet);
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {

				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");
				if (jInnerData.length() > 0) {

					String header = mainJson.getString("TITLE").trim();
					String HeadTitle = "";
					if (header.equals("sales")) {
						HeadTitle = "SALES  *" + ArabicTEXT.Sales + "!";

					} else if (header.equals("free")) {

						HeadTitle = "FOC  *" + ArabicTEXT.Free + "!";

					} else if (header.equals("bad")) {

						HeadTitle = "BAD RETURN  *" + ArabicTEXT.BadReturn + "!";

					} else if (header.equals("good")) {
						HeadTitle = "GOOD RETURN  *" + ArabicTEXT.GoodReturn + "!";

					} else if (header.equals("promofree")) {

						HeadTitle = "PROMOTION FREE  *" + ArabicTEXT.PromotionFree + "!";

					}
					outStream.write(BoldOn);

					outStream.write(UnderlineOn);

					outStream.write(NewLine);
					outStream.write("       ".getBytes());
					printlines2(HeadTitle, 1, object, 1, args[0], 1, 1);
					outStream.write(NewLine);
					outStream.write(UnderlineOff);
					outStream.write(BoldOff);

				}
				int MAXLEngth = 137;

				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());

				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}
				boolean isoutlet = false;
				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {
					isoutlet = false;
					if (j == 2 && printoultlet == 0) {
						Log.e("isOutlet", "true");
						isoutlet = true;
					}

					if (!isoutlet) {
						String HeaderVal = "";

						HeaderVal = ArabicTEXT.getHeaderVal(headers.getString(j));

						strheader = strheader + getAccurateText(
								(HeaderVal.indexOf(" ") == -1) ? HeaderVal
										: HeaderVal.substring(0, HeaderVal.indexOf(" ")),
								hashValues.get(HeaderVal.toString()) + MAXLEngth,
								hashPositions.get(HeaderVal.toString()));

						strHeaderBottom = strHeaderBottom
								+ getAccurateText(
										(HeaderVal.indexOf(" ") == -1) ? ""
												: HeaderVal.substring(HeaderVal.indexOf(" "), HeaderVal.length())
														.trim(),
										hashValues.get(HeaderVal.toString()) + MAXLEngth,
										hashPositions.get(HeaderVal.toString()));

						if (jTotal.has(headers.getString(j))) {
							strTotal = strTotal + getAccurateText(jTotal.getString(headers.getString(j).toString()),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));
						} else {

							strTotal = strTotal
									+ getAccurateText(headers.getString(j).equals("DESCRIPTION") ? "TOTAL" : "",
											hashValues.get(headers.getString(j)) + MAXLEngth, 1);
						}
					}

				}
				if (jInnerData.length() > 0) {
					outStream.write(CompressOn);

					// if (!object.getString("LANG").equals("en")) {
					if (strHeaderBottom.length() > 0) {

						printlines2(ArabicTEXT.headerminiDotmatrevereseArabic, 1, object, 1, args[0], 1, 1);
					}
					printlines2(ArabicTEXT.headerminiDotmatbottomrevereArabic.trim(), 1, object, 1, args[0], 1, 1);

					// } else {

					printlines2(strheader, 1, object, 1, args[0], 1, 1);
					if (strHeaderBottom.length() > 0) {
						printlines2(strHeaderBottom, 1, object, 1, args[0], 1, 1);
					}
					// }

					outStream.write(CompressOff);

					outStream.write(CompressOn);
					printlines2(printSepratorcomp(), 1, object, 1, args[0], 1, 1);
					outStream.write(CompressOff);
				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					boolean isoutletdata = false;
					for (int m = 0; m < jArr.length(); m++) {

						isoutletdata = false;
						if (m == 2 && printoultlet == 0) {
							isoutletdata = true;
						}

						if (!isoutletdata) {

							String itemDescrion = jArr.getString(m);
							if (m == 0) {
								itemDescrion = (l + 1) + "";

							} else if (m == 11) {
								itemDescrion = "                    *" + jArr.getString(m) + "!";

							}
							strData = strData + getAccurateText(itemDescrion,
									m == 11 ? 80 : hashValues.get(headers.getString(m).toString()) + MAXLEngth,
									hashPositions.get(m == 11 ? "DESCRIPTION" : headers.getString(m).toString()));
						}
					}

					// lp.writeLine(strData);
					outStream.write(CompressOn);
					count++;
					printlines2(strData, 1, object, 1, args[0], 1, 1);

					outStream.write(CompressOff);
				}
				if (jInnerData.length() > 0) {
					outStream.write(CompressOn);
					printlines2(printSepratorcomp(), 1, object, 1, args[0], 1, 1);
					printlines2(strTotal, 1, object, 1, args[0], 1, 1);
					outStream.write(CompressOff);

				}

			}
			outStream.write(NewLine);
			outStream.write(BoldOn);
			if (object.getString("invoicepriceprint").equals("1")) {
				printlines2(
						(getAccurateText("SUB TOTAL", 20, 0) + getAccurateText(" : ", 3, 0)
								+ getAccurateText(object.getString("SUB TOTAL"), 12, 0) + getAccurateText(" : ", 3, 0)
								+ "*" + getAccurateText(ArabicTEXT.SubTotal, 15, 2) + "!"),
						1, object, 1, args[0], 1, 1);
				outStream.write(BoldOff);
				outStream.write(BoldOn);
				if (object.has("INVOICE DISCOUNT") && object.getString("INVOICE DISCOUNT").toString().length() > 0) {
					double invoice = Double.parseDouble(object.getString("INVOICE DISCOUNT"));

					if (invoice > 0) {

						printlines2(
								(getAccurateText("INVOICE DISCOUNT", 20, 0) + getAccurateText(" : ", 3, 0)
										+ getAccurateText(object.getString("INVOICE DISCOUNT"), 12, 0)
										+ getAccurateText(" : ", 3, 0) + "*"
										+ getAccurateText(ArabicTEXT.InvoiceDiscount, 15, 2) + "!"),
								1, object, 1, args[0], 1, 1);
					}
				}

				outStream.write(BoldOff);
				outStream.write(BoldOn);
				printlines2(
						(getAccurateText("NET SALES", 20, 0) + getAccurateText(" : ", 3, 0)
								+ getAccurateText(object.getString("NET SALES"), 12, 0) + getAccurateText(" : ", 3, 0)
								+ "*" + getAccurateText(ArabicTEXT.NetSales, 15, 2) + "!"),
						1, object, 1, args[0], 1, 1);
				outStream.write(BoldOff);
			}
			if (object.has("TCALLOWED") && object.getString("TCALLOWED").toString().trim().length() > 0
					&& object.getString("TCALLOWED").equals("1")) {

				// printlines2(getAccurateText("TC CHARGED:
				// "+object.getString("TC
				// CHARGED"),80,1),1,object,1,args[0],1,1);
				printlines2(
						(getAccurateText("TC CHARGED", 20, 0) + getAccurateText(" : ", 3, 0)
								+ getAccurateText(object.getString("TCCHARGED"), 12, 0) + getAccurateText(" : ", 3, 0)
								+ "*" + getAccurateText(ArabicTEXT.TCcharged, 15, 2) + "!"),
						1, object, 1, args[0], 1, 1);

			} else {
				printlines2("", 2, object, 1, args[0], 1, 1);
			}

			if (object.has("PaymentType") && Integer.parseInt(object.getString("PaymentType")) < 2) {
				// position = position + 60;
				outStream.write(BoldOn);
				if (!object.getString("LANG").equals("en")) {

					printlines2(getAccurateText("*" + ArabicTEXT.PaymentDetails + "!", 80, 1), 2, object, 1, args[0], 1,
							1);
				} else {
					printlines2(getAccurateText("PAYMENT DETAILS", 80, 1), 2, object, 1, args[0], 1, 1);
				}

				outStream.write(BoldOff);
				// lp.newLine(2);

				JSONArray jCheques = object.has("Cheque") ? object.getJSONArray("Cheque") : null;
				JSONObject jCash = object.has("Cash") ? object.getJSONObject("Cash") : null;

				switch (Integer.parseInt(object.getString("PaymentType"))) {
				case 0:

					outStream.write(BoldOn);
					if (!object.getString("LANG").equals("en")) {

						printlines2(getAccurateText("*" + ArabicTEXT.Cash + "! :" + jCash.getString("Amount"), 80, 1),
								2, object, 1, args[0], 1, 1);
					} else {
						printlines2(getAccurateText("CASH:" + jCash.getString("Amount"), 80, 1), 2, object, 1, args[0],
								1, 1);
					}

					outStream.write(BoldOff);
					break;
				case 1:
					outStream.write(BoldOn);
					// lp.write("CHEQUE");
					printlines2(getAccurateText("CHEQUE", 80, 1), 2, object, 1, args[0], 1, 1);
					outStream.write(BoldOff);
					// lp.newLine(2);
					printlines2(
							(getAccurateText("Cheque Date:", 20, 0) + getAccurateText("Cheque No:", 20, 0)
									+ getAccurateText("Bank:", 20, 0) + getAccurateText("Amount:", 20, 2)),
							1, object, 1, args[0], 1, 1);
					printlines2(printSeprator(), 1, object, 1, args[0], 1, 1);

					for (int j = 0; j < jCheques.length(); j++) {
						JSONObject jChequeDetails = jCheques.getJSONObject(j);
						printlines2(
								(getAccurateText(jChequeDetails.getString("Cheque Date"), 20, 0)
										+ getAccurateText(jChequeDetails.getString("Cheque No"), 20, 0)
										+ getAccurateText(jChequeDetails.getString("Bank"), 20, 0)
										+ getAccurateText(jChequeDetails.getString("Amount"), 20, 2)),
								1, object, 1, args[0], 1, 1);

					}
					// lp.writeLine(printSeprator());
					printlines2(printSeprator(), 1, object, 1, args[0], 1, 1);
					printlines2("", 1, object, 1, args[0], 1, 1);
					// lp.newLine(2);
					break;
				default:
					break;
				}
			}
			if (object.getString("comments").toString().length() > 0) {

				printlines2("Comments:" + object.getString("comments"), 2, object, 1, args[0], 1, 1);

			}
			if (object.getString("invtrailormsg").toString().length() > 0) {
				printlines2(object.getString("invtrailormsg"), 2, object, 1, args[0], 1, 1);

			}
			Log.e("CountNOW", "" + count);
			printlines2("", 5, object, 1, args[0], 1, 1);
			printlines2(
					getAccurateText("CUSTOMER_________________*" + ArabicTEXT.Customer
							+ "!             SALESMAN_______________*" + ArabicTEXT.Salesman + "!", 80, 1),
					2, object, 1, args[0], 1, 1);

			String copyStatus = "";
			if (object.getString("printstatus").equals("DUPLICATE COPY")) {

				copyStatus = getAccurateText(object.getString("printstatus") + "  *" + ArabicTEXT.DuplicateCopy + "",
						80, 1) + "!";
			} else if (object.getString("printstatus").equals("ORIGINAL COPY")) {
				copyStatus = getAccurateText(object.getString("printstatus") + "  *" + ArabicTEXT.OriginalCopy + "!",
						80, 1);

			} else {
				copyStatus = getAccurateText(object.getString("printstatus") + "  *" + ArabicTEXT.DraftCopy + "!", 80,
						1);

			}

			printlines2(copyStatus, 2, object, 2, args[0], 1, 1);

		} catch (Exception e) {
			e.printStackTrace();
		}

	}
	
	void printSalesTaxReport(JSONObject object, String... args) {
		StringBuffer s1 = new StringBuffer();
		int printoultlet = 0;
		try {
			
			int printtax = Integer.parseInt(object.getString("printtax"));
			
			// -------------------START
			// Set font style to Bold + Double Wide + Double High.
			if (object.getString("printoutletitemcode").length() > 0) {
				printoultlet = Integer.parseInt(object.getString("printoutletitemcode"));
			} else {
				printoultlet = 0;
			}
			
			JSONArray jDataNew = object.getJSONArray("data");
			double excTot=0,vatTot=0;
			for (int i = 0; i < jDataNew.length(); i++) {
				JSONObject mainJsonNew = jDataNew.getJSONObject(i);
				JSONObject jTotalNew = mainJsonNew.getJSONObject("TOTAL");
				 excTot = excTot + Double.parseDouble(jTotalNew.getString("EXC TAX"));
				 vatTot = vatTot + Double.parseDouble(jTotalNew.getString("VAT"));
			}

			if (object.getString("displayupc").equals("1")) {
				hashValues = new HashMap<String, Integer>();
				hashValues.put("SL#", 0);
				hashValues.put("ITEM#", 10);

				if (printoultlet != 0) {
					hashValues.put("OUTLET CODE", 8);
					hashValues.put("DESCRIPTION", 25);
					hashValues.put("DISCOUNT", 10);
				} else {

					hashValues.put("OUTLET CODE", 0);
					hashValues.put("DESCRIPTION", 35);
					hashValues.put("DISCOUNT", 10);

				}
				hashValues.put("EXC TAX", 0);
            	hashValues.put("VAT", 0);
				if (printtax > 0) {
					
		              if(excTot>0){
		                 	hashValues.put("AMOUNT", 12);
	                    	hashValues.put("EXC TAX", 12);
	                    	hashValues.put("VAT", 0);
	                    	hashValues.put("AMOUNT AFTER VAT", 10);
	                    	hashValues.put("GROSS AMT", 9);
	             
	                    }
	                    if(vatTot>=0){
	                      	hashValues.put("AMOUNT", 15);
	                    	hashValues.put("EXC TAX", 0);
	                    	hashValues.put("VAT", 10);
	                    	hashValues.put("AMOUNT AFTER VAT", 16);
	                    	hashValues.put("GROSS AMT", 9);
	                    }
	                    if(excTot>0&&vatTot>0){
	                      	hashValues.put("AMOUNT", 9);
	                    	hashValues.put("EXC TAX", 9);
	                    	hashValues.put("VAT", 6);
	                    	hashValues.put("AMOUNT AFTER VAT", 10);
	                    	hashValues.put("GROSS AMT", 9);
	                  
	                    }
					
					hashValues.put("CASE PRICE", 10);
					hashValues.put("UNIT PRICE", 10);
					
				}else{
				
					hashValues.put("VAT", 0);
					hashValues.put("EXC TAX", 0);
					hashValues.put("CASE PRICE", 11);
					hashValues.put("UNIT PRICE", 11);
					hashValues.put("AMOUNT", 11);
				}
				
				
					
				hashValues.put("UPC", 5);
				hashValues.put("QTY CAS/PCS", 7);
				hashValues.put("TOTAL PCS", 0);
				

				
				hashValues.put("DESCRIPTION", 35);
				hashValues.put("QTY OUT/PCS", 11);
				hashValues.put("OUTER PRICE", 11);
				hashValues.put("PCS PRICE", 11);

				hashPositions = new HashMap<String, Integer>();
				hashPositions.put("SL#", 0);
				hashPositions.put("ITEM#", 0);
				hashPositions.put("OUTLET CODE", 0);
				hashPositions.put("DESCRIPTION", 0);
				hashPositions.put("UPC", 2);
				hashPositions.put("QTY CAS/PCS", 1);
				hashPositions.put("QTY OUT/PCS", 1);
				hashPositions.put("TOTAL PCS", 1);
				hashPositions.put("CASE PRICE", 2);
				hashPositions.put("OUTER PRICE", 2);
				hashPositions.put("UNIT PRICE", 1);
				hashPositions.put("PCS PRICE", 2);
				hashPositions.put("DISCOUNT", 2);
				hashPositions.put("EXC TAX", 2);
				hashPositions.put("VAT", 1);
				hashPositions.put("AMOUNT", 1);
				hashPositions.put("AMOUNT AFTER VAT", 1);
				hashPositions.put("GROSS AMT", 1);
				hashPositions.put("DESCRIPTION", 0);

				hashArabVales = new HashMap<String, String>();
				hashArabVales.put("SL#", "SL#");
				hashArabVales.put("ITEM#", ArabicTEXT.Item);
				hashArabVales.put("OUTLET CODE", ArabicTEXT.OUTLET);
				hashArabVales.put("DESCRIPTION", ArabicTEXT.DESCRIPTION);
				hashArabVales.put("UPC", ArabicTEXT.UPC);
				hashArabVales.put("QTY CAS/PCS", ArabicTEXT.QTY);
				hashArabVales.put("TOTAL PCS", ArabicTEXT.TOTAL);
				hashArabVales.put("CASE PRICE", ArabicTEXT.CASEPRICE);
				hashArabVales.put("UNIT PRICE", ArabicTEXT.UNITPRICE);
				hashArabVales.put("DISCOUNT", ArabicTEXT.DISCOUNT);
				hashArabVales.put("AMOUNT", ArabicTEXT.AMOUNT);
				hashArabVales.put("AMOUNT AFTER VAT", ArabicTEXT.AMOUNT);
				hashArabVales.put("GROSS AMT", ArabicTEXT.AMOUNT);

			} else {
				hashValues = new HashMap<String, Integer>();
				hashValues.put("SL#", 4);
				hashValues.put("ITEM#", 8);
				hashValues.put("OUTLET CODE", 8);
				hashValues.put("DESCRIPTION", 32);
				hashValues.put("QTY CAS/PCS", 3);
				hashValues.put("QTY OUT/PCS", 3);
				hashValues.put("CASE PRICE", 7);
				hashValues.put("OUTER PRICE", 7);
				hashValues.put("UNIT PRICE", 7);
				hashValues.put("PCS PRICE", 7);
				hashValues.put("DISCOUNT", 4);
				hashValues.put("AMOUNT", 8);
				hashValues.put("AMOUNT AFTER VAT", 8);
				hashValues.put("GROSS AMT", 8);
				hashPositions = new HashMap<String, Integer>();
				hashPositions.put("SL#", 0);
				hashPositions.put("ITEM#", 0);
				hashPositions.put("OUTLET CODE", 0);
				// hashPositions.put("DESCRIPTION", 0);
				hashPositions.put("QTY CAS/PCS", 2);
				hashPositions.put("CASE PRICE", 2);
				hashPositions.put("QTY OUT/PCS", 2);
				hashPositions.put("OUTER PRICE", 2);
				hashPositions.put("UNIT PRICE", 2);
				hashPositions.put("PCS PRICE", 2);
				hashPositions.put("DISCOUNT", 2);
				hashPositions.put("AMOUNT", 2);
				hashPositions.put("AMOUNT AFTER VAT", 1);
				hashPositions.put("GROSS AMT", 1);
			}
			// ---------Start

			// ----------End
			line(startln);
			// lp.newLine(5);
			headerTaxprint(object, 1);
			outStream.write(NewLine);
			Log.e("Printoutletitemcode", "" + printoultlet);
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {

				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");
				if (jInnerData.length() > 0) {

					String header = mainJson.getString("TITLE").trim();
					String HeadTitle = "";
					if (header.equals("sales")) {
						HeadTitle = "SALES  *" + ArabicTEXT.Sales + "!";

					} else if (header.equals("free")) {

						HeadTitle = "TRADE DEAL  *" + ArabicTEXT.tradeDeal + "!";

					} else if (header.equals("bad")) {

						HeadTitle = "BAD RETURN  *" + ArabicTEXT.BadReturn + "!";

					} else if (header.equals("good")) {
						HeadTitle = "GOOD RETURN  *" + ArabicTEXT.GoodReturn + "!";

					} else if (header.equals("promofree")) {

						HeadTitle = "PROMOTION FREE  *" + ArabicTEXT.PromotionFree + "!";

					}else if (header.equals("buyback")) {

						HeadTitle = "BUYBACK FREE*" + ArabicTEXT.PromotionFree + "!";

					}
					outStream.write(BoldOn);

					outStream.write(UnderlineOn);

				//	outStream.write(NewLine);
					//outStream.write("       ".getBytes());
					printlines2(HeadTitle, 1, object, 1, args[0], 1, 1);
					outStream.write(NewLine);
					outStream.write(UnderlineOff);
					outStream.write(BoldOff);

				}
				int MAXLEngth = 140;   // 137

				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());

				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}
				boolean isoutlet = false;
				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {
					isoutlet = false;
					if (j != 0 && j != 6) {
						if (j == 2 && printoultlet == 0) {
							Log.e("isOutlet", "true");
							isoutlet = true;
						}

						if (!isoutlet) {

							String HeaderVal = "";

							HeaderVal = ArabicTEXT.getHeaderVal(headers.getString(j));
							
							if(j==9)
							{
								HeaderVal = ArabicTEXT.getHeaderVal(headers.getString(14));
							}
							else if(j==10)
							{
								HeaderVal = "DISCOUNT";
							}
							else if(j==12)
							{
								HeaderVal = "AMOUNT BEFORE VAT";
							}
							else if(j==13)
							{
								HeaderVal = "VAT";
							}	
							
							else if(j==14)
							{
								HeaderVal = "AMOUNT AFTER VAT";
							}	
							
			          if(j==14)
			          {
							strheader = strheader + getAccurateText(
									(HeaderVal.indexOf(" ") == -1) ? HeaderVal
											: HeaderVal.substring(0, HeaderVal.indexOf(" ")),
																8 + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));

							strHeaderBottom = strHeaderBottom
									+ getAccurateText(
											(HeaderVal.indexOf(" ") == -1) ? ""
													: HeaderVal.substring(HeaderVal.indexOf(" "), HeaderVal.length())
															.trim(),
																	9 + MAXLEngth,
											hashPositions.get(headers.getString(j).toString()));
			        	  
			          } else {

							strheader = strheader + getAccurateText(
									(HeaderVal.indexOf(" ") == -1) ? HeaderVal
											: HeaderVal.substring(0, HeaderVal.indexOf(" ")),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));

							strHeaderBottom = strHeaderBottom
									+ getAccurateText(
											(HeaderVal.indexOf(" ") == -1) ? ""
													: HeaderVal.substring(HeaderVal.indexOf(" "), HeaderVal.length())
															.trim(),
											hashValues.get(headers.getString(j).toString()) + MAXLEngth,
											hashPositions.get(headers.getString(j).toString()));
							
			          }

							if (jTotal.has(headers.getString(j))) {
								// added this condition as not to print total for enhance 22/03/2021
								if(j<9) {
								strTotal = strTotal + getAccurateText(jTotal.getString(headers.getString(j).toString()),
										hashValues.get(headers.getString(j).toString()) + MAXLEngth,
										hashPositions.get(headers.getString(j).toString()));
								} else if(j==13) {
									strTotal = strTotal + getAccurateText(jTotal.getString(headers.getString(j).toString()),
											108 + MAXLEngth,
											hashPositions.get(headers.getString(j).toString()));
								}
							} else {

								strTotal = strTotal
										+ getAccurateText(headers.getString(j).equals("DESCRIPTION") ? "TOTAL" : "",
												hashValues.get(headers.getString(j)) + MAXLEngth, 1);
							}
						}
					}

				}
				if (jInnerData.length() > 0) {
					outStream.write(CompressOn);

					Log.e("Header", "" + strheader);
					Log.e("HeaderBottom", "" + strHeaderBottom);
					// if (!object.getString("LANG").equals("en")) {
				/*	printlines2(ArabicTEXT.headerbottomrevereseArabic, 1, object, 1, args[0], 1, 1);
					printlines2(ArabicTEXT.headerrevereseArabic, 1, object, 1, args[0], 1, 1);*/
					
					if (strHeaderBottom.length() > 0) {

						printlines2(ArabicTEXT.headerDotmatbottomrevereArab, 1, object, 1, args[0], 1, 1);
					}
					printlines2(ArabicTEXT.headerDotmatrevereseArabic.trim(), 1, object, 1, args[0], 1, 1);

					// } else {
					printlines2(strheader, 1, object, 1, args[0], 1, 1);
					outStream.write(CompressOff);
					if (strHeaderBottom.length() > 0) {
						outStream.write(CompressOn);
						printlines2(strHeaderBottom, 1, object, 1, args[0], 1, 1);
						outStream.write(CompressOff);
					}
					// }
					outStream.write(CompressOn);
					printlines2(printSepratorcomp(), 1, object, 1, args[0], 1, 1);
					outStream.write(CompressOff);
				}
				outStream.write(CompressOn);
				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					String ItemName="";
					boolean isoutletdata = false;
					for (int m = 0; m < jArr.length(); m++) {
						if (m != 0 && m != 6) {
							isoutletdata = false;
							if (m == 2 && printoultlet == 0) {
								isoutletdata = true;
							}

							if (!isoutletdata) {

								String itemDescrion = jArr.getString(m);
								if (m == 0) {
									itemDescrion = (l + 1) + "";

								} 
								else if(m==9) {
									itemDescrion = "" + jArr.getString(14) + "";
								}  //g
								
								else if(m==10)
								{
									itemDescrion = "" + jArr.getString(9) + "";   //d
								}else if(m==11)
								{
									itemDescrion = "" + jArr.getString(12) + "";
								} //v
								
								else if(m==12)
								{
									itemDescrion = "" + jArr.getString(12) + "";
								} 
								
								else if (m == 13) {
									itemDescrion = "" + jArr.getString(11) + "";
									
								}
								else if (m == 14) {
									itemDescrion = "" + jArr.getString(13) + "";
									
								}
								
								if(m != 15) {
									strData = strData + getAccurateText(itemDescrion,
											m == 15 ? 60 : hashValues.get(headers.getString(m).toString()) + MAXLEngth,
											hashPositions.get(m == 15 ? "DESCRIPTION" : headers.getString(m).toString()));
									
								} 
								/*else {

								strData = strData + getAccurateText(itemDescrion,
										m == 15 ?2 : hashValues.get(headers.getString(m).toString()) + MAXLEngth,
										hashPositions.get(m == 15 ? "DESCRIPTION" : headers.getString(m).toString()));
								}*/

								if (m == 15) {

									printlines2(strData, 1, object, 1, args[0], 1, 1);
									//outStream.write(NewLine);
								}

							}
							

	
						}

					}

					// lp.writeLine(strData);
					//outStream.write(CompressOff);
				}
				outStream.write(CompressOff);
				if (jInnerData.length() > 0) {
					outStream.write(CompressOn);
					printlines2(printSepratorcomp(), 1, object, 1, args[0], 1, 1);
					printlines2(strTotal, 1, object, 1, args[0], 1, 1);
					outStream.write(CompressOff);

				}

			}
			outStream.write(NewLine);
			
			int taxSetting=0;
			
			if(taxSetting==1){
				printArabic(getAccurateText("  ", 15, 1) + getAccurateText("TOTAL ", 15, 1)+
						getAccurateText("TAX " , 15, 1) +getAccurateText("TOTAL AMOUNT" , 15, 1) );
				outStream.write(NewLine);
				outStream.write(CompressOn);
				printlines2(printSeprator(), 1, object, 1, args[0], 1, 1);
				outStream.write(CompressOff);
				
				double salesamnt=0,retrnamnt=0,damageamnt=0,freeamnt=0;
				double salestax=0,retrntax=0,damagetax=0,freetax=0;
				
				if(Integer.parseInt(object.getString("totalSalesQty"))>0){
					salesamnt=Double.parseDouble(object.getString("TOTSALES"));
					salestax=Double.parseDouble(object.getString("SALESTAX"));
					printArabic(getAccurateText("SALES", 15, 1) + getAccurateText(object.getString("TOTSALES"), 15, 1)+
							getAccurateText(object.getString("SALESTAX") , 15, 1) +getAccurateText(String.valueOf(salesamnt+salestax) , 15, 1) );
					outStream.write(NewLine);
				}
				if(Integer.parseInt(object.getString("totalFreeQty"))>0){
					freeamnt=Double.parseDouble(object.getString("TOTFREE"));
					freetax=Double.parseDouble(object.getString("FREETAX"));
					printArabic(getAccurateText("FREE", 15, 1) + getAccurateText(object.getString("TOTFREE"), 15, 1)+
							getAccurateText(object.getString("FREETAX") , 15, 1) +getAccurateText(String.valueOf(freeamnt+freetax) , 15, 1) );
					outStream.write(NewLine);
				}
				if(Integer.parseInt(object.getString("totalReturnQty"))>0){
					retrnamnt=Double.parseDouble(object.getString("TOTGOOD"));
					retrntax=Double.parseDouble(object.getString("RETURNTAX"));
					printArabic(getAccurateText("GOOD RETURN", 15, 1) + getAccurateText(object.getString("TOTGOOD"), 15, 1)+
							getAccurateText(object.getString("RETURNTAX") , 15, 1) +getAccurateText(String.valueOf(retrnamnt+retrntax) , 15, 1) );
					outStream.write(NewLine);
				}
				if(Integer.parseInt(object.getString("totalDamagedQty"))>0){
					damageamnt=Double.parseDouble(object.getString("TOTBAD"));
					damagetax=Double.parseDouble(object.getString("DAMAGEDTAX"));
					printArabic(getAccurateText("BAD RETURN", 15, 1) + getAccurateText(object.getString("TOTBAD"), 15, 1)+
							getAccurateText(object.getString("DAMAGEDTAX") , 15, 1) +getAccurateText(String.valueOf(damageamnt+damagetax) , 15, 1) );
					outStream.write(NewLine);
				}
				
				outStream.write(CompressOn);
				printlines2(printSeprator(), 1, object, 1, args[0], 1, 1);
				outStream.write(CompressOff);
				
				printArabic(getAccurateText("TOTAL", 15, 1) + getAccurateText(String.valueOf(salesamnt+retrnamnt+damageamnt+freeamnt), 15, 1)+
						getAccurateText(object.getString("TOTTAX") , 15, 1) +getAccurateText(String.valueOf(salesamnt+salestax+retrnamnt+retrntax+damageamnt+damagetax+freeamnt+freetax) , 15, 1) );
				outStream.write(NewLine);
				outStream.write(NewLine);
				
				if (object.has("TOTEXC")) {
					
					if(Double.parseDouble(object.getString("TOTEXC"))!=0){
						int  companyTaxStng=Integer.parseInt(object.getString("enabletax"));
						if(companyTaxStng==1&&taxSetting!=1){
							printlines2(
									(getAccurateText("TOTAL EXC TAX", 20, 0) + getAccurateText(" : ", 3, 0)
											+ getAccurateText(object.getString("TOTEXC"), 12, 0)
											+ getAccurateText(" : ", 3, 0) + "*"
											+ getAccurateText(ArabicTEXT.TotalExcTax, 20, 2) + "!"),
									1, object, 1, args[0], 1, 1);
						}
					}

				}
				
				if (object.has("TOTVAT")) {
					
				//	if(Double.parseDouble(object.getString("TOTVAT"))!=0){
						int  companyTaxStng=Integer.parseInt(object.getString("enabletax"));
						if(companyTaxStng==1&&taxSetting!=1){
							printlines2(
									(getAccurateText("VAT AMOUNT", 20, 0) + getAccurateText(" : ", 3, 0)
											+ getAccurateText(object.getString("TOTVAT"), 12, 0)
											+ getAccurateText(" : ", 3, 0) + "*"
											+ getAccurateText(ArabicTEXT.TotalVatTax, 20, 2) + "!"),
									1, object, 1, args[0], 1, 1);
						}
				//	}

				}
			}
			
			
			outStream.write(CompressOff);
			outStream.write(BoldOn);
			printlines2(
					(getAccurateText("AMOUNT BEFORE VAT", 25, 0) + getAccurateText(" : ", 3, 0)
							+ getAccurateText(object.getString("NET SALES") + " OMR", 12, 0)
							+ getAccurateText(" : ", 3, 0) + "*" + getAccurateText(ArabicTEXT.SubTotal, 15, 2) + "!"),
					1, object, 1, args[0], 1, 1);
			outStream.write(BoldOff);
			
			outStream.write(BoldOn);
			if (object.has("INVOICE DISCOUNT") && object.getString("INVOICE DISCOUNT").toString().length() > 0) {
				double invoice = Double.parseDouble(object.getString("INVOICE DISCOUNT"));

				if (invoice != 0) {

					printlines2(
							(getAccurateText("INVOICE DISCOUNT", 25, 0) + getAccurateText(" : ", 3, 0)
									+ getAccurateText(object.getString("INVOICE DISCOUNT") + " OMR", 12, 0)
									+ getAccurateText(" : ", 3, 0) + "*"
									+ getAccurateText(ArabicTEXT.InvoiceDiscount, 15, 2) + "!"),
							1, object, 1, args[0], 1, 1);
				}
			}
			
			if (object.has("INVOICE HEADER DISCOUNT") && object.getString("INVOICE HEADER DISCOUNT").toString().length() > 0) {
				double invoiceheader = Double.parseDouble(object.getString("INVOICE HEADER DISCOUNT"));

				if (invoiceheader != 0) {

					printlines2(
							(getAccurateText("INVOICE HEADER DISCOUNT", 25, 0) + getAccurateText(" : ", 3, 0)
									+ getAccurateText(object.getString("INVOICE HEADER DISCOUNT") + " OMR", 12, 0)
									+ getAccurateText(" : ", 3, 0) + "*"
									+ getAccurateText(ArabicTEXT.InvoiceDiscount, 15, 2) + "!"),
							1, object, 1, args[0], 1, 1);
				}
			}
			
			if (object.has("VAT CASH DISCOUNT") && object.getString("VAT CASH DISCOUNT").toString().length() > 0) {
				double cashdiscount = Double.parseDouble(object.getString("VAT CASH DISCOUNT"));

				if (cashdiscount != 0) {

					
					printlines2(
							(getAccurateText("VAT CASH DISCOUNT", 25, 0) + getAccurateText(" : ", 3, 0)
									+ getAccurateText(object.getString("VAT CASH DISCOUNT") + " OMR", 12, 0)
									+ getAccurateText(" : ", 3, 0) + "*"
									+ getAccurateText(ArabicTEXT.InvoiceDiscount, 15, 2) + "!"),
							1, object, 1, args[0], 1, 1);
				}
			}


			outStream.write(BoldOff);
			
			
			if (object.has("TOTEXC")) {
				
				if(Double.parseDouble(object.getString("TOTEXC"))!=0){
					int  companyTaxStng=Integer.parseInt(object.getString("enabletax"));
					if(companyTaxStng==1&&taxSetting!=1){
						printlines2(
								(getAccurateText("TOTAL EXC TAX", 20, 0) + getAccurateText(" : ", 3, 0)
										+ getAccurateText(object.getString("TOTEXC"), 12, 0)
										+ getAccurateText(" : ", 3, 0) + "*"
										+ getAccurateText(ArabicTEXT.TotalExcTax, 20, 2) + "!"),
								1, object, 1, args[0], 1, 1);
					}
				}

			}
			
			if (object.has("TOTVAT")) {
				
			//if(Double.parseDouble(object.getString("TOTVAT"))!=0){
					int  companyTaxStng=Integer.parseInt(object.getString("enabletax"));
					if(companyTaxStng==1&&taxSetting!=1){
						printlines2(
								(getAccurateText("VAT AMOUNT", 25, 0) + getAccurateText(" : ", 3, 0)
										+ getAccurateText(object.getString("TOTVAT") + " OMR", 12, 0)
										+ getAccurateText(" : ", 3, 0) + "*"
										+ getAccurateText(ArabicTEXT.TotalVatTax, 20, 2) + "!"),
								1, object, 1, args[0], 1, 1);
					}
			//	}

			}

			outStream.write(BoldOn);
			printlines2(
					(getAccurateText("AMOUNT AFTER VAT", 25, 0) + getAccurateText(" : ", 3, 0)
							+ getAccurateText(object.getString("SUB TOTAL") + " OMR", 12, 0) 
							+ getAccurateText(" : ", 3, 0) + "*" + getAccurateText(ArabicTEXT.NetSales, 15, 2) + "!"),
					1, object, 1, args[0], 1, 1);
			outStream.write(BoldOff);

			if (object.has("TCALLOWED") && object.getString("TCALLOWED").toString().trim().length() > 0
					&& object.getString("TCALLOWED").equals("1")) {

				// printlines2(getAccurateText("TC CHARGED:
				// "+object.getString("TC
				// CHARGED"),80,1),1,object,1,args[0],1,1);
				printlines2(
						(getAccurateText("TC CHARGED", 20, 0) + getAccurateText(" : ", 3, 0)
								+ getAccurateText(object.getString("TCCHARGED"), 12, 0) + getAccurateText(" : ", 3, 0)
								+ "*" + getAccurateText(ArabicTEXT.TCcharged, 15, 2) + "!"),
						1, object, 1, args[0], 1, 1);

			} else {
				printlines2("", 2, object, 1, args[0], 1, 1);
			}

			if (object.has("PaymentType") && Integer.parseInt(object.getString("PaymentType")) < 2) {
				// position = position + 60;
				outStream.write(BoldOn);
				if (!object.getString("LANG").equals("en")) {
					printlines2(getAccurateText("PAYMENT DETAILS   " + "*" + ArabicTEXT.PaymentDetails + "!", 80, 1), 2,
							object, 1, args[0], 1, 1);
				} else {
					printlines2(getAccurateText("PAYMENT DETAILS", 80, 1), 2, object, 1, args[0], 1, 1);
				}

				outStream.write(BoldOff);
				// lp.newLine(2);

				JSONArray jCheques = object.has("Cheque") ? object.getJSONArray("Cheque") : null;
				JSONObject jCash = object.has("Cash") ? object.getJSONObject("Cash") : null;

				switch (Integer.parseInt(object.getString("PaymentType"))) {
				case 0:

					outStream.write(BoldOn);
					if (!object.getString("LANG").equals("en")) {

						printlines2(
								getAccurateText("CASH:  " + jCash.getString("Amount") + "   :*" + ArabicTEXT.Cash + "!",
										80, 1),
								2, object, 1, args[0], 1, 1);

					} else {
						printlines2(getAccurateText("CASH:" + jCash.getString("Amount"), 80, 1), 2, object, 1, args[0],
								1, 1);
					}

					outStream.write(BoldOff);
					break;
				case 1:
					outStream.write(BoldOn);
					// lp.write("CHEQUE");
					printlines2(getAccurateText("CHEQUE", 80, 1), 2, object, 1, args[0], 1, 1);
					outStream.write(BoldOff);
					// lp.newLine(2);
					printlines2(
							(getAccurateText("Cheque Date:", 20, 0) + getAccurateText("Cheque No:", 20, 0)
									+ getAccurateText("Bank:", 20, 0) + getAccurateText("Amount:", 20, 2)),
							1, object, 1, args[0], 1, 1);
					printlines2(printSeprator(), 1, object, 1, args[0], 1, 1);

					for (int j = 0; j < jCheques.length(); j++) {
						JSONObject jChequeDetails = jCheques.getJSONObject(j);
						printlines2(
								(getAccurateText(jChequeDetails.getString("Cheque Date"), 20, 0)
										+ getAccurateText(jChequeDetails.getString("Cheque No"), 20, 0)
										+ getAccurateText(jChequeDetails.getString("Bank"), 20, 0)
										+ getAccurateText(jChequeDetails.getString("Amount"), 20, 2)),
								1, object, 1, args[0], 1, 1);

					}
					// lp.writeLine(printSeprator());
					printlines2(printSeprator(), 1, object, 1, args[0], 1, 1);
					printlines2("", 1, object, 1, args[0], 1, 1);
					// lp.newLine(2);
					break;
				default:
					break;
				}
			}
			if (object.getString("comments").toString().length() > 0) {

				printlines2("Comments:" + object.getString("comments"), 2, object, 1, args[0], 1, 1);

			}
			if (object.getString("invtrailormsg").toString().length() > 0) {
				printlines2(object.getString("invtrailormsg"), 2, object, 1, args[0], 1, 1);

			}
		//printlines2("", 3, object, 1, args[0], 1, 1);
			printlines2(
					getAccurateText("CUSTOMER_________________*" + ArabicTEXT.Customer
							+ "!             SALESMAN_______________*" + ArabicTEXT.Salesman + "!", 80, 1),
					2, object, 1, args[0], 1, 1);
			outStream.write(NewLine);
			String copyStatus = "";
			if (object.getString("printstatus").equals("DUPLICATE COPY")) {

				copyStatus = getAccurateText(object.getString("printstatus") + "  *" + ArabicTEXT.DuplicateCopy + "",
						80, 1) + "!";
			} else if (object.getString("printstatus").equals("ORIGINAL COPY")) {
				copyStatus = getAccurateText(object.getString("printstatus") + "  *" + ArabicTEXT.OriginalCopy + "!",
						80, 1);

			} else {
				copyStatus = getAccurateText(object.getString("printstatus") + "  *" + ArabicTEXT.DraftCopy + "!", 80,
						1);

			}
			printlines2(copyStatus, 2, object, 2, args[0], 1, 1);

		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	void printSalesReport(JSONObject object, String... args) {
		StringBuffer s1 = new StringBuffer();
		int printoultlet = 0;
		try {

			if (object.getString("printoutletitemcode").length() > 0) {
				printoultlet = Integer.parseInt(object.getString("printoutletitemcode"));
			} else {
				printoultlet = 0;
			}

			if (object.getString("displayupc").equals("1")) {
				hashValues = new HashMap<String, Integer>();
				hashValues.put("SL#", 4);
				hashValues.put("ITEM#", 11);
				
				if(printoultlet!=0){
					hashValues.put("OUTLET CODE", 10);
					hashValues.put("DESCRIPTION", 43);
					hashValues.put("DISCOUNT", 13);
				}else{
					hashValues.put("OUTLET CODE", 0);
					hashValues.put("DESCRIPTION", 56);
					hashValues.put("DISCOUNT", 10);
				}
				
				hashValues.put("UPC", 5);
				hashValues.put("QTY CAS/PCS", 11);
				hashValues.put("QTY OUT/PCS", 11);
				hashValues.put("TOTAL PCS", 7);
				hashValues.put("CASE PRICE", 11);
				hashValues.put("UNIT PRICE", 11);
				
				hashValues.put("AMOUNT", 11);
				hashValues.put("DESCRIPTION", 56);
				hashValues.put("OUTER PRICE", 11);
				hashValues.put("PCS PRICE", 11);

				hashPositions = new HashMap<String, Integer>();
				hashPositions.put("SL#", 0);
				hashPositions.put("ITEM#", 0);
				hashPositions.put("OUTLET CODE", 0);
				hashPositions.put("DESCRIPTION", 0);
				hashPositions.put("UPC", 1);
				hashPositions.put("QTY CAS/PCS", 1);
				hashPositions.put("QTY OUT/PCS", 1);
				hashPositions.put("TOTAL PCS", 1);
				hashPositions.put("CASE PRICE", 2);
				hashPositions.put("UNIT PRICE", 2);
				hashPositions.put("DISCOUNT", 2);
				hashPositions.put("AMOUNT", 2);
				hashPositions.put("DESCRIPTION", 0);
				hashPositions.put("OUTER PRICE", 2);
				hashPositions.put("PCS PRICE", 2);
			} else {
				hashValues = new HashMap<String, Integer>();
				hashValues.put("SL#", 4);
				hashValues.put("ITEM#", 8);
				hashValues.put("OUTLET CODE", 8);
				hashValues.put("DESCRIPTION", 36);
				hashValues.put("QTY CAS/PCS", 3);
				hashValues.put("QTY OUT/PCS", 3);
				hashValues.put("CASE PRICE", 7);
				hashValues.put("UNIT PRICE", 7);
				hashValues.put("DISCOUNT", 0);
				hashValues.put("AMOUNT", 8);
				hashValues.put("OUTER PRICE", 7);
				hashValues.put("PCS PRICE", 7);
				hashPositions = new HashMap<String, Integer>();
				hashPositions.put("SL#", 0);
				hashPositions.put("ITEM#", 0);
				hashPositions.put("OUTLET CODE", 0);
				// hashPositions.put("DESCRIPTION", 0);
				hashPositions.put("QTY CAS/PCS", 2);
				hashPositions.put("CASE PRICE", 2);
				hashPositions.put("UNIT PRICE", 2);
				hashPositions.put("DISCOUNT", 2);
				hashPositions.put("AMOUNT", 2);
				hashPositions.put("OUTER PRICE", 2);
				hashPositions.put("PCS PRICE", 2);
			}
			// ---------Start

			// ----------End
			line(startln);
			// lp.newLine(5);
			headerprint(object, 1);

			Log.e("Printoutletitemcode", "" + printoultlet);
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {

				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");
				if (jInnerData.length() > 0) {

					String header = mainJson.getString("TITLE").trim();
					String HeadTitle = "";
					if (header.equals("sales")) {
						HeadTitle = "SALES  *" + ArabicTEXT.Sales + "!";

					} else if (header.equals("free")) {

						HeadTitle = "FOC  *" + ArabicTEXT.Free + "!";

					} else if (header.equals("bad")) {

						HeadTitle = "BAD RETURN  *" + ArabicTEXT.BadReturn + "!";

					} else if (header.equals("good")) {
						HeadTitle = "GOOD RETURN  *" + ArabicTEXT.GoodReturn + "!";

					} else if (header.equals("promofree")) {

						HeadTitle = "PROMOTION FREE  *" + ArabicTEXT.PromotionFree + "!";

					}else if (header.equals("buyback")) {

						HeadTitle = "BUYBACK FREE  *" + ArabicTEXT.BuybackFree + "!";

					}
					outStream.write(BoldOn);

					outStream.write(UnderlineOn);

					outStream.write(NewLine);
					outStream.write("       ".getBytes());
					printlines2(HeadTitle, 1, object, 1, args[0], 1, 1);
					outStream.write(NewLine);
					outStream.write(UnderlineOff);
					outStream.write(BoldOff);

					

				}
				int MAXLEngth = 137;
				
				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());

				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}
				boolean isoutlet = false;
				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {
					isoutlet = false;
					if (j == 2 && printoultlet == 0) {
						Log.e("isOutlet", "true");
						isoutlet = true;
					}

					if (!isoutlet) {
						String HeaderVal = "";

						HeaderVal = ArabicTEXT.getHeaderVal(headers.getString(j));

						strheader = strheader + getAccurateText(
								(HeaderVal.indexOf(" ") == -1) ? HeaderVal
										: HeaderVal.substring(0, HeaderVal.indexOf(" ")),
								hashValues.get(HeaderVal.toString()) + MAXLEngth,
								hashPositions.get(HeaderVal.toString()));

						strHeaderBottom = strHeaderBottom
								+ getAccurateText(
										(HeaderVal.indexOf(" ") == -1) ? ""
												: HeaderVal.substring(HeaderVal.indexOf(" "), HeaderVal.length())
														.trim(),
										hashValues.get(HeaderVal.toString()) + MAXLEngth,
										hashPositions.get(HeaderVal.toString()));

						if (jTotal.has(headers.getString(j))) {
							strTotal = strTotal + getAccurateText(jTotal.getString(headers.getString(j).toString()),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));
						} else {

							strTotal = strTotal
									+ getAccurateText(headers.getString(j).equals("DESCRIPTION") ? "TOTAL" : "",
											hashValues.get(headers.getString(j)) + MAXLEngth, 1);
						}
					}

				}
				if (jInnerData.length() > 0) {
					outStream.write(CompressOn);

					// if (!object.getString("LANG").equals("en")) {
					if (strHeaderBottom.length() > 0) {

						printlines2(ArabicTEXT.headerDotmatbottomrevereArab, 1, object, 1, args[0], 1, 1);
					}
					printlines2(ArabicTEXT.headerDotmatrevereseArabic.trim(), 1, object, 1, args[0], 1, 1);

					// } else {

					printlines2(strheader, 1, object, 1, args[0], 1, 1);
					if (strHeaderBottom.length() > 0) {
						printlines2(strHeaderBottom, 1, object, 1, args[0], 1, 1);
					}
					// }

					outStream.write(CompressOff);

					outStream.write(CompressOn);
					printlines2(printSepratorcomp(), 1, object, 1, args[0], 1, 1);
					outStream.write(CompressOff);
				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					boolean isoutletdata = false;
					for (int m = 0; m < jArr.length(); m++) {

						isoutletdata = false;
						if (m == 2 && printoultlet == 0) {
							isoutletdata = true;
						}

						if (!isoutletdata) {

							String itemDescrion = jArr.getString(m);
							if (m == 0) {
								itemDescrion = (l + 1) + "";

							} else if (m == 11) {
								if(object.getString("printbarcode").equals("1")){
									itemDescrion = "               " + jArr.getString(m) + "";
								}else{
									itemDescrion = "              *" + jArr.getString(m) + "!";
								}
								
								
							}
							
							strData = strData + getAccurateText(itemDescrion,
									m == 11 ? 65 : hashValues.get(headers.getString(m).toString()) + MAXLEngth,
									hashPositions.get(m == 11 ? "DESCRIPTION" : headers.getString(m).toString()));
						}
					}

					// lp.writeLine(strData);
					outStream.write(CompressOn);
					count++;
					printlines2(strData, 1, object, 1, args[0], 1, 1);

					outStream.write(CompressOff);
				}
				if (jInnerData.length() > 0) {
					outStream.write(CompressOn);
					printlines2(printSepratorcomp(), 1, object, 1, args[0], 1, 1);
					printlines2(strTotal, 1, object, 1, args[0], 1, 1);
					outStream.write(CompressOff);

				}

			}
			outStream.write(NewLine);
			outStream.write(BoldOn);
			printlines2((getAccurateText("SUB TOTAL", 20, 0) + getAccurateText(" : ", 3, 0)
					+ getAccurateText(object.getString("SUB TOTAL"), 12, 0) + getAccurateText(" : ", 3, 0) + "*"
					+ getAccurateText(ArabicTEXT.SubTotal, 15, 2) + "!"), 1, object, 1, args[0], 1, 1);
			outStream.write(BoldOff);
			outStream.write(BoldOn);
			if (object.has("INVOICE DISCOUNT") && object.getString("INVOICE DISCOUNT").toString().length() > 0) {
				double invoice = Double.parseDouble(object.getString("INVOICE DISCOUNT"));

				if (invoice != 0) {

					printlines2(
							(getAccurateText("INVOICE DISCOUNT", 20, 0) + getAccurateText(" : ", 3, 0)
									+ getAccurateText(object.getString("INVOICE DISCOUNT"), 12, 0)
									+ getAccurateText(" : ", 3, 0) + "*"
									+ getAccurateText(ArabicTEXT.InvoiceDiscount, 15, 2) + "!"),
							1, object, 1, args[0], 1, 1);
				}
			}

			outStream.write(BoldOff);
			outStream.write(BoldOn);
			printlines2((getAccurateText("NET SALES", 20, 0) + getAccurateText(" : ", 3, 0)
					+ getAccurateText(object.getString("NET SALES"), 12, 0) + getAccurateText(" : ", 3, 0) + "*"
					+ getAccurateText(ArabicTEXT.NetSales, 15, 2) + "!"), 1, object, 1, args[0], 1, 1);
			outStream.write(BoldOff);

			if (object.has("TCALLOWED") && object.getString("TCALLOWED").toString().trim().length() > 0
					&& object.getString("TCALLOWED").equals("1")) {

				// printlines2(getAccurateText("TC CHARGED:
				// "+object.getString("TC
				// CHARGED"),80,1),1,object,1,args[0],1,1);
				printlines2(
						(getAccurateText("TC CHARGED", 20, 0) + getAccurateText(" : ", 3, 0)
								+ getAccurateText(object.getString("TCCHARGED"), 12, 0) + getAccurateText(" : ", 3, 0)
								+ "*" + getAccurateText(ArabicTEXT.TCcharged, 15, 2) + "!"),
						1, object, 1, args[0], 1, 1);

			} else {
				printlines2("", 2, object, 1, args[0], 1, 1);
			}

			if (object.has("PaymentType") && Integer.parseInt(object.getString("PaymentType")) < 2) {
				// position = position + 60;
				outStream.write(BoldOn);
				if (!object.getString("LANG").equals("en")) {

					printlines2(getAccurateText("*" + ArabicTEXT.PaymentDetails + "!", 80, 1), 2, object, 1, args[0], 1,
							1);
				} else {
					printlines2(getAccurateText("PAYMENT DETAILS", 80, 1), 2, object, 1, args[0], 1, 1);
				}

				outStream.write(BoldOff);
				// lp.newLine(2);

				JSONArray jCheques = object.has("Cheque") ? object.getJSONArray("Cheque") : null;
				JSONObject jCash = object.has("Cash") ? object.getJSONObject("Cash") : null;

				switch (Integer.parseInt(object.getString("PaymentType"))) {
				case 0:

					outStream.write(BoldOn);
					if (!object.getString("LANG").equals("en")) {

						printlines2(getAccurateText("*" + ArabicTEXT.Cash + "! :" + jCash.getString("Amount"), 80, 1),
								2, object, 1, args[0], 1, 1);
					} else {
						printlines2(getAccurateText("CASH:" + jCash.getString("Amount"), 80, 1), 2, object, 1, args[0],
								1, 1);
					}

					outStream.write(BoldOff);
					break;
				case 1:
					outStream.write(BoldOn);
					// lp.write("CHEQUE");
					printlines2(getAccurateText("CHEQUE", 80, 1), 2, object, 1, args[0], 1, 1);
					outStream.write(BoldOff);
					// lp.newLine(2);
					printlines2(
							(getAccurateText("Cheque Date:", 20, 0) + getAccurateText("Cheque No:", 20, 0)
									+ getAccurateText("Bank:", 20, 0) + getAccurateText("Amount:", 20, 2)),
							1, object, 1, args[0], 1, 1);
					printlines2(printSeprator(), 1, object, 1, args[0], 1, 1);

					for (int j = 0; j < jCheques.length(); j++) {
						JSONObject jChequeDetails = jCheques.getJSONObject(j);
						printlines2(
								(getAccurateText(jChequeDetails.getString("Cheque Date"), 20, 0)
										+ getAccurateText(jChequeDetails.getString("Cheque No"), 20, 0)
										+ getAccurateText(jChequeDetails.getString("Bank"), 20, 0)
										+ getAccurateText(jChequeDetails.getString("Amount"), 20, 2)),
								1, object, 1, args[0], 1, 1);

					}
					// lp.writeLine(printSeprator());
					printlines2(printSeprator(), 1, object, 1, args[0], 1, 1);
					printlines2("", 1, object, 1, args[0], 1, 1);
					// lp.newLine(2);
					break;
				default:
					break;
				}
			}
			if (object.getString("comments").toString().length() > 0) {

				printlines2("Comments:" + object.getString("comments"), 2, object, 1, args[0], 1, 1);

			}
			if (object.getString("invtrailormsg").toString().length() > 0) {
				printlines2(object.getString("invtrailormsg"), 2, object, 1, args[0], 1, 1);

			}
			Log.e("CountNOW", "" + count);
			printlines2("", 5, object, 1, args[0], 1, 1);
			printlines2(
					getAccurateText("CUSTOMER_________________*" + ArabicTEXT.Customer
							+ "!             SALESMAN_______________*" + ArabicTEXT.Salesman + "!", 80, 1),
					2, object, 1, args[0], 1, 1);

			String copyStatus = "";
			if (object.getString("printstatus").equals("DUPLICATE COPY")) {

				copyStatus = getAccurateText(object.getString("printstatus") + "  *" + ArabicTEXT.DuplicateCopy + "",
						80, 1) + "!";
			} else if (object.getString("printstatus").equals("ORIGINAL COPY")) {
				copyStatus = getAccurateText(object.getString("printstatus") + "  *" + ArabicTEXT.OriginalCopy + "!",
						80, 1);

			} else {
				copyStatus = getAccurateText(object.getString("printstatus") + "  *" + ArabicTEXT.DraftCopy + "!", 80,
						1);

			}

			printlines2(copyStatus, 2, object, 2, args[0], 1, 1);

		} catch (Exception e) {
			e.printStackTrace();
		}

	}
	
	void parseReturnSummarysResponse(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Item Code", 10);
			hashValues.put("Description", 50);
			hashValues.put("ARBDESCRIPTION", 0); // 25
			hashValues.put("Quantity", 20);  // 10 
			hashValues.put("Expiry Date", 0);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Item Code", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("ARBDESCRIPTION", 0);
			hashPositions.put("Quantity", 1);
			hashPositions.put("Expiry Date", 0);

			line(startln);
			headerprint(object, 9);

			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {

				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");
				if (jInnerData.length() > 0) {

					String header = mainJson.getString("TITLE").trim();
					String HeadTitle = "";
					if (header.equals("damage")) {
						HeadTitle = "DAMAGE SUMMARY :";

					} else if (header.equals("return")) {

						HeadTitle = "RETURN SUMMARY :";

					}
					outStream.write(BoldOn);

					outStream.write(UnderlineOn);

					outStream.write(NewLine);

					printlines2(HeadTitle, 1, object, 1, args[0], 1, 1);
					outStream.write(NewLine);
					outStream.write(UnderlineOff);
					outStream.write(BoldOff);

				}
				int MAXLEngth = 80;

				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());

				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}

				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					String HeaderVal = "";

					HeaderVal = headers.getString(j);

					strheader = strheader + getAccurateText(
							j == 3 ? ""
									: (HeaderVal.indexOf(" ") == -1) ? HeaderVal
											: HeaderVal.substring(0, HeaderVal.indexOf(" ")),
							hashValues.get(headers.getString(j).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(j).toString()));

					strHeaderBottom = strHeaderBottom + getAccurateText(
							(HeaderVal.indexOf(" ") == -1) ? ""
									: HeaderVal.substring(HeaderVal.indexOf(" "), HeaderVal.length()).trim(),
							hashValues.get(headers.getString(j).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(j).toString()));

					if (jTotal.has(headers.getString(j))) {
						strTotal = strTotal + getAccurateText(jTotal.getString(headers.getString(j).toString()),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					} else {

						strTotal = strTotal + getAccurateText(headers.getString(j).equals("Description") ? "TOTAL" : "",
								hashValues.get(headers.getString(j)) + MAXLEngth, 1);
					}

				}
				if (jInnerData.length() > 0) {

					printlines2(strheader, 1, object, 1, args[0], 1, 1);

					if (strHeaderBottom.length() > 0) {

						printlines2(strHeaderBottom, 1, object, 1, args[0], 1, 1);

					}
					// }

					printlines2(printSeprator(), 1, object, 1, args[0], 1, 1);

				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";

					for (int m = 0; m < jArr.length(); m++) {

						String itemDescrion = jArr.getString(m);
						if (m == 3) {
							try {
								//itemDescrion = "*" + jArr.getString(m) + "!";
								itemDescrion = "";
							} catch (Exception e) {
								e.printStackTrace();
							}
						}

						strData = strData + getAccurateText(itemDescrion,
								hashValues.get(headers.getString(m).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(m).toString()));

					}
					printlines2(strData, 1, object, 1, args[0], 1, 1);
					// lp.writeLine(strData);

				}
				if (jInnerData.length() > 0) {

					printlines2(printSeprator(), 1, object, 1, args[0], 1, 1);
					printlines2(strTotal, 1, object, 1, args[0], 1, 1);

				}

			}

			printlines2("", 1, object, 1, args[0], 1, 1);
			printlines2("", 1, object, 1, args[0], 1, 1);

			printlines2(getAccurateText("             SALESMAN_______________*" + ArabicTEXT.Salesman + "!", 80, 1), 2,
					object, 2, args[0], 2, 2);

		} catch (Exception e) {
			e.printStackTrace();
		}

		// return String.valueOf(s1);
	}

	void printSalesOrderReport(JSONObject object, String... args) {
		StringBuffer s1 = new StringBuffer();
		int printoultlet = 0;
		try {

			if (object.getString("printoutletitemcode").length() > 0) {
				printoultlet = Integer.parseInt(object.getString("printoutletitemcode"));
			} else {
				printoultlet = 0;
			}

			if (object.getString("displayupc").equals("1")) {
				hashValues = new HashMap<String, Integer>();
				hashValues.put("SL#", 4);
				hashValues.put("ITEM#", 20);
				
				if(printoultlet!=0){
					hashValues.put("OUTLET CODE", 10);
					hashValues.put("DESCRIPTION", 43);
					hashValues.put("DISCOUNT", 13);
				}else{
					hashValues.put("OUTLET CODE", 0);
					hashValues.put("DESCRIPTION", 47);
					hashValues.put("DISCOUNT", 10);
				}
				
				hashValues.put("UPC", 5);
				hashValues.put("QTY CAS/PCS", 11);
				hashValues.put("QTY OUT/PCS", 11);
				hashValues.put("TOTAL PCS", 7);
				hashValues.put("CASE PRICE", 11);
				hashValues.put("UNIT PRICE", 11);
				
				hashValues.put("AMOUNT", 11);
				hashValues.put("DESCRIPTION", 47);
				hashValues.put("OUTER PRICE", 11);
				hashValues.put("PCS PRICE", 11);

				hashPositions = new HashMap<String, Integer>();
				hashPositions.put("SL#", 0);
				hashPositions.put("ITEM#", 0);
				hashPositions.put("OUTLET CODE", 0);
				hashPositions.put("DESCRIPTION", 0);
				hashPositions.put("UPC", 1);
				hashPositions.put("QTY CAS/PCS", 1);
				hashPositions.put("QTY OUT/PCS", 1);
				hashPositions.put("TOTAL PCS", 1);
				hashPositions.put("CASE PRICE", 2);
				hashPositions.put("UNIT PRICE", 2);
				hashPositions.put("DISCOUNT", 2);
				hashPositions.put("AMOUNT", 2);
				hashPositions.put("DESCRIPTION", 0);
				hashPositions.put("OUTER PRICE", 2);
				hashPositions.put("PCS PRICE", 2);
			} else {
				hashValues = new HashMap<String, Integer>();
				hashValues.put("SL#", 4);
				hashValues.put("ITEM#", 8);
				hashValues.put("OUTLET CODE", 8);
				hashValues.put("DESCRIPTION", 36);
				hashValues.put("QTY CAS/PCS", 3);
				hashValues.put("QTY OUT/PCS", 3);
				hashValues.put("CASE PRICE", 7);
				hashValues.put("UNIT PRICE", 7);
				hashValues.put("DISCOUNT", 0);
				hashValues.put("AMOUNT", 8);
				hashValues.put("OUTER PRICE", 7);
				hashValues.put("PCS PRICE", 7);
				hashPositions = new HashMap<String, Integer>();
				hashPositions.put("SL#", 0);
				hashPositions.put("ITEM#", 0);
				hashPositions.put("OUTLET CODE", 0);
				// hashPositions.put("DESCRIPTION", 0);
				hashPositions.put("QTY CAS/PCS", 2);
				hashPositions.put("CASE PRICE", 2);
				hashPositions.put("UNIT PRICE", 2);
				hashPositions.put("DISCOUNT", 2);
				hashPositions.put("AMOUNT", 2);
				hashPositions.put("OUTER PRICE", 2);
				hashPositions.put("PCS PRICE", 2);
			}
			// ---------Start

			// ----------End
			line(startln);
			// lp.newLine(5);
			headerprint(object, 1);

			Log.e("Printoutletitemcode", "" + printoultlet);
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {

				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");
				if (jInnerData.length() > 0) {

					String header = mainJson.getString("TITLE").trim();
					String HeadTitle = "";
					if (header.equals("order")) {
						HeadTitle = "SALES ORDER *" + ArabicTEXT.Sales + "!";

					} else if (header.equals("free")) {

						HeadTitle = "FOC  *" + ArabicTEXT.Free + "!";

					} else if (header.equals("bad")) {

						HeadTitle = "BAD RETURN  *" + ArabicTEXT.BadReturn + "!";

					} else if (header.equals("good")) {
						HeadTitle = "GOOD RETURN  *" + ArabicTEXT.GoodReturn + "!";

					} else if (header.equals("promofree")) {

						HeadTitle = "PROMOTION FREE  *" + ArabicTEXT.PromotionFree + "!";

					}else if (header.equals("buyback")) {

						HeadTitle = "BUYBACK FREE  *" + ArabicTEXT.BuybackFree + "!";

					}
					outStream.write(BoldOn);

				//	outStream.write(UnderlineOn);

					outStream.write(NewLine);
					outStream.write("       ".getBytes());
					printlines2(HeadTitle, 1, object, 1, args[0], 1, 1);
					outStream.write(NewLine);
					//outStream.write(UnderlineOff);
					outStream.write(BoldOff);

					

				}
				int MAXLEngth = 137;
				
				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());

				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}
				boolean isoutlet = false;
				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {
					isoutlet = false;
					if (j == 2 && printoultlet == 0) {
						Log.e("isOutlet", "true");
						isoutlet = true;
					}

					if (!isoutlet) {
						String HeaderVal = "";

						HeaderVal = ArabicTEXT.getHeaderVal(headers.getString(j));

						strheader = strheader + getAccurateText(
								(HeaderVal.indexOf(" ") == -1) ? HeaderVal
										: HeaderVal.substring(0, HeaderVal.indexOf(" ")),
								hashValues.get(HeaderVal.toString()) + MAXLEngth,
								hashPositions.get(HeaderVal.toString()));

						strHeaderBottom = strHeaderBottom
								+ getAccurateText(
										(HeaderVal.indexOf(" ") == -1) ? ""
												: HeaderVal.substring(HeaderVal.indexOf(" "), HeaderVal.length())
														.trim(),
										hashValues.get(HeaderVal.toString()) + MAXLEngth,
										hashPositions.get(HeaderVal.toString()));

						if (jTotal.has(headers.getString(j))) {
							strTotal = strTotal + getAccurateText(jTotal.getString(headers.getString(j).toString()),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));
						} else {

							strTotal = strTotal
									+ getAccurateText(headers.getString(j).equals("DESCRIPTION") ? "TOTAL" : "",
											hashValues.get(headers.getString(j)) + MAXLEngth, 1);
						}
					}

				}
				if (jInnerData.length() > 0) {
					outStream.write(CompressOn);

					// if (!object.getString("LANG").equals("en")) {
					if (strHeaderBottom.length() > 0) {

						printlines2(ArabicTEXT.headerDotmatbottomrevereArab, 1, object, 1, args[0], 1, 1);
					}
					printlines2(ArabicTEXT.headerDotmatrevereseArabic.trim(), 1, object, 1, args[0], 1, 1);

					// } else {

					printlines2(strheader, 1, object, 1, args[0], 1, 1);
					if (strHeaderBottom.length() > 0) {
						printlines2(strHeaderBottom, 1, object, 1, args[0], 1, 1);
					}
					// }

					outStream.write(CompressOff);

					outStream.write(CompressOn);
					printlines2(printSepratorcomp(), 1, object, 1, args[0], 1, 1);
					outStream.write(CompressOff);
				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					boolean isoutletdata = false;
					for (int m = 0; m < jArr.length(); m++) {

						isoutletdata = false;
						if (m == 2 && printoultlet == 0) {
							isoutletdata = true;
						}

						if (!isoutletdata) {

							String itemDescrion = jArr.getString(m);
							if (m == 0) {
								itemDescrion = (l + 1) + "";

							} else if (m == 11) {
								
								itemDescrion = "              " + jArr.getString(m) + " "; 
								// commented by sujee 
								/*if(object.getString("printbarcode").equals("1")){
									itemDescrion = "               " + jArr.getString(m) + "";
								}else{
									itemDescrion = "              *" + jArr.getString(m) + "!";
								}*/
								
								
							}
							
							strData = strData + getAccurateText(itemDescrion,
									m == 11 ? 65 : hashValues.get(headers.getString(m).toString()) + MAXLEngth,
									hashPositions.get(m == 11 ? "DESCRIPTION" : headers.getString(m).toString()));
						}
					}

					// lp.writeLine(strData);
					outStream.write(CompressOn);
					count++;
					printlines2(strData, 1, object, 1, args[0], 1, 1);

					outStream.write(CompressOff);
				}
				if (jInnerData.length() > 0) {
					outStream.write(CompressOn);
					printlines2(printSepratorcomp(), 1, object, 1, args[0], 1, 1);
					printlines2(strTotal, 1, object, 1, args[0], 1, 1);
					outStream.write(CompressOff);

				}

			}
			outStream.write(NewLine);
			outStream.write(BoldOn);
			printlines2((getAccurateText("SUB TOTAL", 20, 0) + getAccurateText(" : ", 3, 0)
					+ getAccurateText(object.getString("SUB TOTAL"), 12, 0) + getAccurateText(" : ", 3, 0) + "*"
					+ getAccurateText(ArabicTEXT.SubTotal, 15, 2) + "!"), 1, object, 1, args[0], 1, 1);
			outStream.write(BoldOff);
			outStream.write(BoldOn);
			if (object.has("INVOICE DISCOUNT") && object.getString("INVOICE DISCOUNT").toString().length() > 0) {
				double invoice = Double.parseDouble(object.getString("INVOICE DISCOUNT"));

				if (invoice != 0) {

					printlines2(
							(getAccurateText("INVOICE DISCOUNT", 20, 0) + getAccurateText(" : ", 3, 0)
									+ getAccurateText(object.getString("INVOICE DISCOUNT"), 12, 0)
									+ getAccurateText(" : ", 3, 0) + "*"
									+ getAccurateText(ArabicTEXT.InvoiceDiscount, 15, 2) + "!"),
							1, object, 1, args[0], 1, 1);
				}
			}

			outStream.write(BoldOff);
			outStream.write(BoldOn);
			printlines2((getAccurateText("NET ORDER", 20, 0) + getAccurateText(" : ", 3, 0)
					+ getAccurateText(object.getString("SUB TOTAL"), 12, 0) + getAccurateText(" : ", 3, 0) + "*"
					+ getAccurateText(ArabicTEXT.NetSales, 15, 2) + "!"), 1, object, 1, args[0], 1, 1);
			outStream.write(BoldOff);

			if (object.has("TCALLOWED") && object.getString("TCALLOWED").toString().trim().length() > 0
					&& object.getString("TCALLOWED").equals("1")) {

				// printlines2(getAccurateText("TC CHARGED:
				// "+object.getString("TC
				// CHARGED"),80,1),1,object,1,args[0],1,1);
				printlines2(
						(getAccurateText("TC CHARGED", 20, 0) + getAccurateText(" : ", 3, 0)
								+ getAccurateText(object.getString("TCCHARGED"), 12, 0) + getAccurateText(" : ", 3, 0)
								+ "*" + getAccurateText(ArabicTEXT.TCcharged, 15, 2) + "!"),
						1, object, 1, args[0], 1, 1);

			} else {
				printlines2("", 2, object, 1, args[0], 1, 1);
			}

		
			Log.e("CountNOW", "" + count);
			printlines2("", 5, object, 1, args[0], 1, 1);
			printlines2(
					getAccurateText("CUSTOMER_________________*" + ArabicTEXT.Customer
							+ "!             SALESMAN_______________*" + ArabicTEXT.Salesman + "!", 80, 1),
					2, object, 1, args[0], 1, 1);

			String copyStatus = "";
			if (object.getString("printstatus").equals("DUPLICATE COPY")) {

				copyStatus = getAccurateText(object.getString("printstatus") + "  *" + ArabicTEXT.DuplicateCopy + "",
						80, 1) + "!";
			} else if (object.getString("printstatus").equals("ORIGINAL COPY")) {
				copyStatus = getAccurateText(object.getString("printstatus") + "  *" + ArabicTEXT.OriginalCopy + "!",
						80, 1);

			} else {
				copyStatus = getAccurateText(object.getString("printstatus") + "  *" + ArabicTEXT.DraftCopy + "!", 80,
						1);

			}

			printlines2(copyStatus, 2, object, 2, args[0], 1, 1);

		} catch (Exception e) {
			e.printStackTrace();
		}

	}
	
	
	private String printSepratorcomp() {
		String seprator = "";
		for (int i = 0; i < 137; i++) {
			seprator = seprator + "-";
		}
		return seprator;
	}

	private String printSeprator() {
		String seprator = "";
		for (int i = 0; i < 80; i++) {
			seprator = seprator + "-";
		}
		return seprator;
	}

	private String printSepratorCompress() {
		String seprator = "";
		for (int i = 0; i < 137; i++) {
			seprator = seprator + "-";
		}
		return seprator;
	}

	void parseCollectionResponse(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {
			/*hashValues = new HashMap<String, Integer>();
			hashValues.put("Invoice#", 18);
			hashValues.put("Due Date", 15);
			hashValues.put("Due Amount", 15);
			hashValues.put("Invoice Balance", 15);
			hashValues.put("Amount Paid", 15);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Invoice#", 0);
			hashPositions.put("Due Date", 0);
			hashPositions.put("Due Amount", 2);
			hashPositions.put("Invoice Balance", 2);
			hashPositions.put("Amount Paid", 2);

			hashArbPositions = new HashMap<String, Integer>();
			hashArbPositions.put("Invoice#", 2);
			hashArbPositions.put("Due Date", 2);
			hashArbPositions.put("Due Amount", 0);
			hashArbPositions.put("Invoice Balance", 0);
			hashArbPositions.put("Amount Paid", 0);

			hashArabVales = new HashMap<String, String>();
			hashArabVales.put("Invoice#", ArabicTEXT.Invoice);
			hashArabVales.put("Due Date", ArabicTEXT.InvoiceDate);
			hashArabVales.put("Due Amount", ArabicTEXT.InvoiceAmount);
			hashArabVales.put("Invoice Balance", ArabicTEXT.InvoiceBalance);
			hashArabVales.put("Amount Paid", ArabicTEXT.AmountPaid);*/
			
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Invoice#", 18);   
			hashValues.put("Due Date", 15);
			hashValues.put("Invoice Amount", 10);  // 15 
			hashValues.put("Previous Balance", 15);
		
			hashValues.put("Invoice Balance", 10); //15
			hashValues.put("Amount Paid", 10); //15
			
			
			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Invoice#", 0);
			hashPositions.put("Due Date", 0);
			hashPositions.put("Invoice Amount", 2);
			hashPositions.put("Previous Balance", 2);
			hashPositions.put("Invoice Balance", 2);
			hashPositions.put("Amount Paid", 2);
		

			hashArbPositions = new HashMap<String, Integer>();
			hashArbPositions.put("Invoice#", 2);
			hashArbPositions.put("Due Date", 2);
			hashArbPositions.put("Invoice Amount", 0);
			hashArbPositions.put("Previous Balance", 0);
			hashArbPositions.put("Invoice Balance", 0);
			hashArbPositions.put("Amount Paid", 0);
			

			hashArabVales = new HashMap<String, String>();
			hashArabVales.put("Invoice#", ArabicTEXT.Invoice);
			hashArabVales.put("Due Date", ArabicTEXT.InvoiceDate);
			hashArabVales.put("Invoice Amount", ArabicTEXT.InvoiceAmount);
			hashArabVales.put("Previous Balance", ArabicTEXT.PreviousBalance);
			hashArabVales.put("Invoice Balance", ArabicTEXT.InvoiceBalance);
			hashArabVales.put("Amount Paid", ArabicTEXT.AmountPaid);

			// ---------Start
			// printconnect(args[0]);
			// ----------End
			line(startln);
			headerprint(object, 2);

			JSONArray headers = object.getJSONArray("HEADERS");

			String strheader = "", strTotal = "", strHeaderBottom = "";
			int MAXLEngth = 80;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}

			JSONObject jTOBject = object.getJSONObject("TOTAL");
			for (int i = 0; i < headers.length(); i++) {

				String HeaderVal = "";

				if (!object.getString("LANG").equals("en")) {
					HeaderVal = hashArabVales.get(headers.getString(i));
					strheader = getAccurateText(
							(HeaderVal.indexOf(" ") == -1) ? HeaderVal : HeaderVal.substring(0, HeaderVal.indexOf(" ")),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashArbPositions.get(headers.getString(i).toString())) + strheader;
					strHeaderBottom = getAccurateText(
							(HeaderVal.indexOf(" ") == -1) ? ""
									: HeaderVal.substring(HeaderVal.indexOf(" "), HeaderVal.length()),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashArbPositions.get(headers.getString(i).toString())) + strHeaderBottom;
				} else {
					HeaderVal = headers.getString(i);

					strheader = strheader + getAccurateText(
							(HeaderVal.indexOf(" ") == -1) ? HeaderVal : HeaderVal.substring(0, HeaderVal.indexOf(" ")),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));
					strHeaderBottom = strHeaderBottom + getAccurateText(
							(HeaderVal.indexOf(" ") == -1) ? ""
									: HeaderVal.substring(HeaderVal.indexOf(" "), HeaderVal.length()),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));

				}

				if (jTOBject.has(headers.getString(i))) {
					strTotal = strTotal + getAccurateText(jTOBject.getString(headers.getString(i).toString()),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));
				} else {

					strTotal = strTotal + getAccurateText(headers.getString(i).equals("Due Date") ? "TOTAL" : "",
							hashValues.get(headers.getString(i)) + MAXLEngth, 1);
				}
			}
			Log.e("Header", "" + strheader);
			Log.e("Bottom", "" + strHeaderBottom);
			if (!object.getString("LANG").equals("en")) {
				printlines2("*" + strHeaderBottom + "!", 1, object, 1, args[0], 2, 2);
				printlines2("*" + strheader + "!", 1, object, 1, args[0], 2, 2);

			} else {
				printlines2(strheader, 1, object, 1, args[0], 2, 2);
				printlines2(strHeaderBottom, 1, object, 1, args[0], 2, 2);
			}
			printlines2(printSeprator(), 1, object, 1, args[0], 2, 2);

			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					strData = strData + getAccurateText(jArr.getString(j),
							hashValues.get(headers.getString(j).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(j).toString()));
				}
				// position = position + 30;

				// s1.append(String.format(strFormat, position, strData) +
				// "\n");
				printlines2(strData, 1, object, 1, args[0], 2, 2);

			}
			printlines2(printSeprator(), 1, object, 1, args[0], 2, 2);
			printlines2(strTotal, 2, object, 1, args[0], 2, 2);
			if (!object.getString("LANG").equals("en")) {
				printlines2(getAccurateText("*" + ArabicTEXT.PaymentDetails + "!", 80, 1), 2, object, 1, args[0], 2, 2);

			} else {
				printlines2(getAccurateText("PAYMENT DETAILS", 80, 1), 2, object, 1, args[0], 2, 2);
			}

			// 0 Check only
			// 1 Cash Only
			// 2 Both

			JSONArray jCheques = object.has("Cheque") ? object.getJSONArray("Cheque") : null;
			JSONObject jCash = object.has("Cash") ? object.getJSONObject("Cash") : null;

			switch (Integer.parseInt(object.getString("PaymentType"))) {
			case 0:
				outStream.write(BoldOn);
				if (!object.getString("LANG").equals("en")) {

					printlines2(getAccurateText("*" + ArabicTEXT.Cash + "! :" + jCash.getString("Amount"), 80, 1), 1,
							object, 1, args[0], 2, 2);
				} else {
					printlines2(getAccurateText("CASH:" + jCash.getString("Amount"), 80, 1), 1, object, 1, args[0], 2,
							2);
				}

				outStream.write(BoldOff);

				break;
			case 1:
				outStream.write(BoldOn);
				printlines2(getAccurateText("CHEQUE", 80, 1), 2, object, 1, args[0], 2, 2);
				outStream.write(BoldOff);
				printlines2(
						(getAccurateText("Cheque Date:", 20, 0) + getAccurateText("Cheque No:", 20, 0)
								+ getAccurateText("Bank:", 20, 0) + getAccurateText("Amount:", 20, 2)),
						1, object, 1, args[0], 2, 2);
				printlines2(printSeprator(), 1, object, 1, args[0], 2, 2);

				for (int j = 0; j < jCheques.length(); j++) {
					JSONObject jChequeDetails = jCheques.getJSONObject(j);
					printlines2(
							getAccurateText(jChequeDetails.getString("Cheque Date"), 20, 0)
									+ getAccurateText(jChequeDetails.getString("Cheque No"), 20, 0)
									+ getAccurateText(jChequeDetails.getString("Bank"), 20, 0)
									+ getAccurateText(jChequeDetails.getString("Amount"), 20, 2),
							1, object, 1, args[0], 2, 2);

				}
				printlines2(printSeprator(), 1, object, 1, args[0], 2, 2);

				break;
			case 2:

				outStream.write(BoldOn);
				printlines2(getAccurateText("CASH:" + jCash.getString("Amount"), 80, 1), 2, object, 1, args[0], 2, 2);
				outStream.write(BoldOff);
				outStream.write(BoldOn);
				printlines2(getAccurateText("CHEQUE", 80, 1), 1, object, 2, args[0], 2, 2);
				outStream.write(BoldOff);
				printlines2(
						getAccurateText("Cheque Date:", 20, 0) + getAccurateText("Cheque No:", 20, 0)
								+ getAccurateText("Bank:", 20, 0) + getAccurateText("Amount:", 20, 2),
						1, object, 1, args[0], 2, 2);

				printlines2(printSeprator(), 1, object, 1, args[0], 2, 2);

				for (int j = 0; j < jCheques.length(); j++) {
					JSONObject jChequeDetails = jCheques.getJSONObject(j);
					printlines2(
							getAccurateText(jChequeDetails.getString("Cheque Date"), 20, 0)
									+ getAccurateText(jChequeDetails.getString("Cheque No"), 20, 0)
									+ getAccurateText(jChequeDetails.getString("Bank"), 20, 0)
									+ getAccurateText(jChequeDetails.getString("Amount"), 20, 2),
							1, object, 1, args[0], 2, 2);

				}
				printlines2(printSeprator(), 1, object, 1, args[0], 2, 2);
				break;

			default:
				break;
			}

			String exPayment = object.has("expayment") ? object.getString("expayment") : "";

			if (exPayment != null && exPayment.toString().trim().length() > 0) {

				printlines2(getAccurateText("Excess Payment : " + exPayment, 80, 0), 1, object, 1, args[0], 2, 2);
			}
			if (object.getString("comments").toString().length() > 0) {
				printlines2(getAccurateText("Comments: " + object.getString("comments"), 80, 0), 3, object, 1, args[0],
						2, 2);

			} else {
				printlines2(" ", 2, object, 1, args[0], 2, 2);
			}
			// sujee added  27/06/2018 to print cust bal
			printlines2(getAccurateText("CUSTOMER BALANCE: " + object.getString("CustBalance"), 80, 0), 3, object, 1, args[0],
					2, 2);
			
			
			
			printlines2(
					getAccurateText("CUSTOMER_________________*" + ArabicTEXT.Customer
							+ "!             SALESMAN_______________*" + ArabicTEXT.Salesman + "!", 80, 1),
					2, object, 1, args[0], 2, 2);

			String copyStatus = "";
			if (object.getString("printstatus").equals("DUPLICATE COPY")) {

				copyStatus = getAccurateText(object.getString("printstatus") + "  *" + ArabicTEXT.DuplicateCopy + "",
						80, 1) + "!";
			} else if (object.getString("printstatus").equals("ORIGINAL COPY")) {
				copyStatus = getAccurateText(object.getString("printstatus") + "  *" + ArabicTEXT.OriginalCopy + "!",
						80, 1);

			} else {
				copyStatus = getAccurateText(object.getString("printstatus") + "  *" + ArabicTEXT.DraftCopy + "!", 80,
						1);

			}

			printlines2(copyStatus, 2, object, 2, args[0], 2, 2);

		} catch (Exception e) {
			e.printStackTrace();
		}

		// return String.valueOf(s1);
	}

	void parseAgingAnalysisResponse(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Invoice#", 18);
			hashValues.put("Invoice Date", 15);
			hashValues.put("Due Date", 15);
			hashValues.put("Due Amount", 15);
			hashValues.put("Credit Days", 15);
			

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Invoice#", 0);
			hashPositions.put("Invoice Date", 0);
			hashPositions.put("Due Date", 1);
			hashPositions.put("Due Amount", 2);
			hashPositions.put("Credit Days", 1);

			
			line(startln);
			headerprint(object, 8);

			JSONArray headers = object.getJSONArray("HEADERS");

			String strheader = "", strTotal = "", strHeaderBottom = "";
			int MAXLEngth = 80;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}

			JSONObject jTOBject = object.getJSONObject("TOTAL");
			for (int i = 0; i < headers.length(); i++) {

				String HeaderVal = "";

				
				HeaderVal = headers.getString(i);

				strheader = strheader + getAccurateText(
						(HeaderVal.indexOf(" ") == -1) ? HeaderVal : HeaderVal.substring(0, HeaderVal.indexOf(" ")),
						hashValues.get(headers.getString(i).toString()) + MAXLEngth,
						hashPositions.get(headers.getString(i).toString()));
				strHeaderBottom = strHeaderBottom + getAccurateText(
						(HeaderVal.indexOf(" ") == -1) ? ""
								: HeaderVal.substring(HeaderVal.indexOf(" "), HeaderVal.length()),
						hashValues.get(headers.getString(i).toString()) + MAXLEngth,
						hashPositions.get(headers.getString(i).toString()));

				

				if (jTOBject.has(headers.getString(i))) {
					strTotal = strTotal + getAccurateText(jTOBject.getString(headers.getString(i).toString()),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));
				} else {

					strTotal = strTotal + getAccurateText(headers.getString(i).equals("Due Date") ? "TOTAL" : "",
							hashValues.get(headers.getString(i)) + MAXLEngth, 1);
				}
			}
			Log.e("Header", "" + strheader);
			Log.e("Bottom", "" + strHeaderBottom);
			
			printlines2(strheader, 1, object, 1, args[0], 2, 2);
			printlines2(strHeaderBottom, 1, object, 1, args[0], 2, 2);
			
			printlines2(printSeprator(), 1, object, 1, args[0], 2, 2);

			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					strData = strData + getAccurateText(jArr.getString(j),
							hashValues.get(headers.getString(j).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(j).toString()));
				}
				
				printlines2(strData, 1, object, 1, args[0], 2, 2);

			}
			printlines2(printSeprator(), 1, object, 1, args[0], 2, 2);
			printlines2(strTotal, 2, object, 1, args[0], 2, 2);

			printlines2(
					getAccurateText("CUSTOMER_________________*" + ArabicTEXT.Customer
							+ "!             SALESMAN_______________*" + ArabicTEXT.Salesman + "!", 80, 1),
					2, object, 2, args[0], 2, 2);

		} catch (Exception e) {
			e.printStackTrace();
		}

		
	}

	void parseAdvancePaymentResponse(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Invoice#", 25);
			hashValues.put("Invoice Date", 25);
			hashValues.put("Invoice Amount", 25);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Invoice#", 0);
			hashPositions.put("Invoice Date", 0);
			hashPositions.put("Invoice Amount", 2);

			// ---------Start
			// printconnect(args[0]);
			// ----------End
			line(startln);
			headerprint(object, 2);

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strTotal = "", strHeaderBottom = "";
			int MAXLEngth = 80;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}

			JSONObject jTOBject = object.getJSONObject("TOTAL");
			for (int i = 0; i < headers.length(); i++) {

				strheader = strheader + getAccurateText(
						(headers.getString(i).indexOf(" ") == -1) ? headers.getString(i)
								: headers.getString(i).substring(0, headers.getString(i).indexOf(" ")),
						hashValues.get(headers.getString(i).toString()) + MAXLEngth,
						hashPositions.get(headers.getString(i).toString()));
				strHeaderBottom = strHeaderBottom + getAccurateText(
						(headers.getString(i).indexOf(" ") == -1) ? ""
								: headers.getString(i).substring(headers.getString(i).indexOf(" "),
										headers.getString(i).length()),
						hashValues.get(headers.getString(i).toString()) + MAXLEngth,
						hashPositions.get(headers.getString(i).toString()));

				if (jTOBject.has(headers.getString(i))) {
					strTotal = strTotal + getAccurateText(jTOBject.getString(headers.getString(i).toString()),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));
				} else {

					strTotal = strTotal + getAccurateText(headers.getString(i).equals("Invoice Date") ? "TOTAL" : "",
							hashValues.get(headers.getString(i)) + MAXLEngth, 1);
				}
			}

			printlines2(strheader, 1, object, 1, args[0], 2, 2);
			printlines2(strHeaderBottom, 1, object, 1, args[0], 2, 2);
			printlines2(printSeprator(), 1, object, 1, args[0], 2, 2);

			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					strData = strData + getAccurateText(jArr.getString(j),
							hashValues.get(headers.getString(j).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(j).toString()));
				}
				// position = position + 30;

				// s1.append(String.format(strFormat, position, strData) +
				// "\n");
				printlines2(strData, 1, object, 1, args[0], 2, 2);

			}
			printlines2(printSeprator(), 1, object, 1, args[0], 2, 2);
			// printlines2(strTotal, 2, object, 1, args[0], 2, 2);

			printlines2(getAccurateText("PAYMENT DETAILS", 80, 1), 2, object, 1, args[0], 2, 2);

			// 0 Check only
			// 1 Cash Only
			// 2 Both

			JSONArray jCheques = object.has("Cheque") ? object.getJSONArray("Cheque") : null;
			JSONObject jCash = object.has("Cash") ? object.getJSONObject("Cash") : null;

			switch (Integer.parseInt(object.getString("PaymentType"))) {
			case 0:
				outStream.write(BoldOn);
				printlines2(getAccurateText("CASH:" + jCash.getString("Amount"), 80, 1), 1, object, 1, args[0], 2, 2);
				outStream.write(BoldOff);

				break;
			case 1:
				outStream.write(BoldOn);
				printlines2(getAccurateText("CHEQUE", 80, 1), 2, object, 1, args[0], 2, 2);
				outStream.write(BoldOff);
				printlines2(
						(getAccurateText("Cheque Date:", 20, 0) + getAccurateText("Cheque No:", 20, 0)
								+ getAccurateText("Bank:", 20, 0) + getAccurateText("Amount:", 20, 2)),
						1, object, 1, args[0], 2, 2);
				printlines2(printSeprator(), 1, object, 1, args[0], 2, 2);

				for (int j = 0; j < jCheques.length(); j++) {
					JSONObject jChequeDetails = jCheques.getJSONObject(j);
					printlines2(
							getAccurateText(jChequeDetails.getString("Cheque Date"), 20, 0)
									+ getAccurateText(jChequeDetails.getString("Cheque No"), 20, 0)
									+ getAccurateText(jChequeDetails.getString("Bank"), 20, 0)
									+ getAccurateText(jChequeDetails.getString("Amount"), 20, 2),
							1, object, 1, args[0], 2, 2);

				}
				printlines2(printSeprator(), 1, object, 1, args[0], 2, 2);

				break;
			case 2:

				outStream.write(BoldOn);
				printlines2(getAccurateText("CASH:" + jCash.getString("Amount"), 80, 1), 2, object, 1, args[0], 2, 2);
				outStream.write(BoldOff);
				outStream.write(BoldOn);
				printlines2(getAccurateText("CHEQUE", 80, 1), 1, object, 2, args[0], 2, 2);
				outStream.write(BoldOff);
				printlines2(
						getAccurateText("Cheque Date:", 20, 0) + getAccurateText("Cheque No:", 20, 0)
								+ getAccurateText("Bank:", 20, 0) + getAccurateText("Amount:", 20, 2),
						1, object, 1, args[0], 2, 2);

				printlines2(printSeprator(), 1, object, 1, args[0], 2, 2);

				for (int j = 0; j < jCheques.length(); j++) {
					JSONObject jChequeDetails = jCheques.getJSONObject(j);
					printlines2(
							getAccurateText(jChequeDetails.getString("Cheque Date"), 20, 0)
									+ getAccurateText(jChequeDetails.getString("Cheque No"), 20, 0)
									+ getAccurateText(jChequeDetails.getString("Bank"), 20, 0)
									+ getAccurateText(jChequeDetails.getString("Amount"), 20, 2),
							1, object, 1, args[0], 2, 2);

				}
				printlines2(printSeprator(), 1, object, 1, args[0], 2, 2);
				break;

			default:
				break;
			}

			String exPayment = object.has("expayment") ? object.getString("expayment") : "";

			if (exPayment != null && exPayment.toString().trim().length() > 0) {

				printlines2(getAccurateText("Excess Payment : " + exPayment, 80, 0), 1, object, 1, args[0], 2, 2);
			}
			if (object.getString("comments").toString().length() > 0) {
				printlines2(getAccurateText("Comments: " + object.getString("comments"), 80, 0), 3, object, 1, args[0],
						2, 2);

			} else {
				printlines2(" ", 2, object, 1, args[0], 2, 2);
			}
			printlines2(getAccurateText(("CUSTOMER_________________             SALESMAN_______________ "), 80, 1), 2,
					object, 1, args[0], 2, 2);
			printlines2(getAccurateText(object.getString("printstatus"), 80, 1), 2, object, 2, args[0], 2, 2);

		} catch (Exception e) {
			e.printStackTrace();
		}

		// return String.valueOf(s1);
	}

	void parseEndInventory(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Sl#", 0);
			hashValues.put("Item#", 10);//10
			hashValues.put("Description", 47); //38 
			hashValues.put("UPC", 0);
			hashValues.put("Truck Stock", 10);
			hashValues.put("Fresh Unload", 10);
			hashValues.put("Truck Damage", 0);
			hashValues.put("Closing Stock", 10);
			hashValues.put("Variance Qty", 10);  //9
			hashValues.put("Sales Qty", 10); 
			hashValues.put("Return Qty", 10); 
			hashValues.put("Damage Qty", 10); 
			hashValues.put("FOC Qty",10);
			hashValues.put("Total Value", 0);
			hashValues.put("Description", 47); //38
			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Sl#", 0);
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("UPC", 2);
			hashPositions.put("Truck Stock", 2);
			hashPositions.put("Fresh Unload", 2);
			hashPositions.put("Truck Damage", 2);
			hashPositions.put("Closing Stock", 2);
			hashPositions.put("Variance Qty", 2);
			hashPositions.put("Sales Qty", 2);
			hashPositions.put("Return Qty", 2);
			hashPositions.put("Damage Qty", 2);
			hashPositions.put("FOC Qty", 2);
			hashPositions.put("Total Value", 2);
			hashPositions.put("Description", 0);
			// ---------Start
			// printconnect(args[0]);
			// ----------End
			line(startln);
			headerinvprint(object, 25);//3

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strHeaderBottom = "";
			int MAXLEngth = 138; //80
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}
			String strTotal = "";
			JSONArray jTotal = object.getJSONArray("TOTAL");
			JSONObject jTOBject = jTotal.getJSONObject(0);
		
			for (int i = 0; i < headers.length(); i++) {

				try {
					strheader = strheader + getAccurateText(
							(headers.getString(i).indexOf(" ") == -1) ? headers.getString(i)
									: headers.getString(i).substring(0, headers.getString(i).indexOf(" ")),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));

					strHeaderBottom = strHeaderBottom + getAccurateText(
							(headers.getString(i).indexOf(" ") == -1) ? ""
									: headers.getString(i).substring(headers.getString(i).indexOf(" "),
											headers.getString(i).length()),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));
					if (jTOBject.has(headers.getString(i))) {
						strTotal = strTotal + getAccurateText(jTOBject.getString(headers.getString(i).toString()),
								hashValues.get(headers.getString(i).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(i).toString()));
					} else {

						strTotal = strTotal + getAccurateText(headers.getString(i).equals("Description") ? "TOTAL" : "",
								hashValues.get(headers.getString(i)) + MAXLEngth, 1);
					}
				} catch (Exception e) {

				}
			}
			outStream.write(CompressOn);
			printlines1(strheader, 1, object, 1, args[0], 3);
			printlines1(strHeaderBottom, 1, object, 1, args[0], 3);
			//printlines1(printSeprator(), 1, object, 1, args[0], 3);
			printlines2(printSepratorcomp(), 1, object, 1, args[0], 1, 1);
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
			
				for (int j = 0; j < jArr.length(); j++) {
					String itemDescrion = jArr.getString(j);
					if (j == 7) {
						itemDescrion = "       " + jArr.getString(j) + "";
					}

					strData = strData + getAccurateText(itemDescrion,
							j == 11 ? 60 : hashValues.get(headers.getString(j).toString()) + MAXLEngth,
							hashPositions.get(j == 11 ? "Description" : headers.getString(j).toString()));
				}
			
				// s1.append(String.format(strFormat, position, strData) +
				// "\n");
				count++;
				outStream.write(CompressOn);
				printlines1(strData, 1, object, 1, args[0], 3);

			}
			//printlines1(printSeprator(), 1, object, 1, args[0], 3);
			printlines2(printSepratorcomp(), 1, object, 1, args[0], 1, 1);
			printlines1(strTotal, 1, object, 1, args[0], 3);
			outStream.write(CompressOff);
			outStream.write(BoldOn);
			outStream.write(NewLine);

			printlines1((getAccurateText("END INVENTORY VALUE : ", 70, 2)
					+ getAccurateText(object.getString("closevalue"), 10, 2)), 1, object, 1, args[0], 2);
			outStream.write(NewLine);
			printlines1((getAccurateText("Available Inventory : ", 40, 2)
					+ getAccurateText(object.getString("availvalue"), 30, 1)), 1, object, 1, args[0], 2);
			printlines1((getAccurateText("Unload Inventory : ", 40, 2)
					+ getAccurateText(object.getString("unloadvalue"), 30, 1)), 1, object, 1, args[0], 2);
			printlines1(printSeprator(), 1, object, 1, args[0], 3);
			printlines1((getAccurateText("Calculated Inventory : ", 40, 2)
					+ getAccurateText(object.getString("closevalue"), 30, 1)), 1, object, 1, args[0], 2);
			printlines1(printSeprator(), 1, object, 1, args[0], 3);
			outStream.write(BoldOff);
			// s1.append(String.format(strFormat, position + 30,
			// printSeprator())+ "\n");
			printlines1(" ", 1, object, 1, args[0], 3);
			printlines1(
					getAccurateText("STORE KEEPER___________", 40, 1) + getAccurateText("SALESMAN__________", 40, 1), 2,
					object, 1, args[0], 3);
			printlines1(getAccurateText(object.has("printstatus") ? object.getString("printstatus") : "", 80, 1), 2,
					object, 2, args[0], 3);

		} catch (Exception e) {

		}

	}

	void parseDepositResponse(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Transaction Number", 12);
			hashValues.put("Customer Code", 12);
			hashValues.put("Customer Name", 25);
			hashValues.put("Cheque No", 12);
			hashValues.put("Cheque Date", 11);
			hashValues.put("Bank Name", 14);
			hashValues.put("Cheque Amount", 12);
			hashValues.put("Amount", 10);
			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Transaction Number", 0);
			hashPositions.put("Customer Code", 0);
			hashPositions.put("Customer Name", 0);
			hashPositions.put("Cheque No", 0);
			hashPositions.put("Cheque Date", 0);
			hashPositions.put("Bank Name", 0);
			hashPositions.put("Cheque Amount", 2);
			hashPositions.put("Amount", 2);

			// ---------Start
			// printconnect(args[0]);
			// ----------End

			line(startln);
			headerprint(object, 3);

			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");

				if (jInnerData.length() > 0) {

					switch (i) {
					case 0:
						outStream.write(BoldOn);
						outStream.write("       ".getBytes());
						outStream.write(UnderlineOn);
						printlines2("CASH", 1, object, 1, args[0], 3, 3);
						outStream.write(UnderlineOff);
						outStream.write(BoldOff);

						break;
					case 1:
						outStream.write(BoldOn);
						outStream.write("       ".getBytes());
						outStream.write(UnderlineOn);
						printlines2("CHEQUE", 1, object, 1, args[0], 3, 3);
						outStream.write(UnderlineOff);
						outStream.write(BoldOff);
						break;
					default:
						break;
					}
				}
				int MAXLEngth = 80;
				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());
				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}

				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					strheader = strheader
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? headers.getString(j)
											: headers.getString(j).substring(0, headers.getString(j).indexOf(" "))
													.trim(),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));

					strHeaderBottom = strHeaderBottom
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? ""
											: headers.getString(j)
													.substring(headers.getString(j).indexOf(" "),
															headers.getString(j).length())
													.trim(),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));

					if (jTotal.has(headers.getString(j))) {
						strTotal = strTotal + getAccurateText(jTotal.getString(headers.getString(j).toString()),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					} else {

						strTotal = strTotal
								+ getAccurateText(
										headers.getString(j).equals(i == 0 ? "Customer Code" : "Cheque Date")
												? "SUB TOTAL" : "",
										hashValues.get(headers.getString(j)) + MAXLEngth, 1);
					}

				}
				if (jInnerData.length() > 0) {
					printlines2(strheader, 1, object, 1, args[0], 3, 3);
					printlines2(strHeaderBottom, 1, object, 1, args[0], 3, 3);
					printlines2(printSeprator(), 1, object, 1, args[0], 3, 3);

				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					for (int m = 0; m < jArr.length(); m++) {
						strData = strData + getAccurateText(jArr.getString(m),
								hashValues.get(headers.getString(m).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(m).toString()));
					}
					printlines2(strData, 1, object, 1, args[0], 3, 3);

				}
				if (jInnerData.length() > 0) {
					printlines2(printSeprator(), 1, object, 1, args[0], 3, 3);
					printlines2(strTotal, 2, object, 1, args[0], 3, 3);
				}

			}
			outStream.write(BoldOn);
			String totalAmt = object.getString("TOTAL DEPOSIT AMOUNT");
			String varAmt = object.getString("totalvaramount");
			printlines2((getAccurateText("TOTAL DEPOSIT AMOUNT", 67, 2) + getAccurateText(totalAmt, 16, 1)), 1, object,
					1, args[0], 3, 3);
			printlines2((getAccurateText("TOTAL VARIENCE AMOUNT", 67, 2) + getAccurateText(varAmt, 16, 1)), 1, object,
					1, args[0], 3, 3);
			if (totalAmt.length() > 0 && varAmt.length() > 0) {
				float totalCount = Float.parseFloat(totalAmt) + Float.parseFloat(varAmt);

				int decimal_count = totalAmt.substring(totalAmt.indexOf(".") + 1, totalAmt.length()).length();
				printlines2(
						getAccurateText("NET DUE AMOUNT", 67, 2)
								+ getAccurateText(String.format("%." + decimal_count + "f", totalCount), 16, 1),
						1, object, 1, args[0], 3, 3);
			}
			
			
			/* Sujee added for Cash Denomination Print --------------- Start-----------------*/
			
			
			outStream.write(BoldOn);
			outStream.write(DoubleWideOn);
			outStream.write(getAccurateText("CASH DENOMINATION", 40, 1).getBytes());
			outStream.write(DoubleWideOff);
			outStream.write(BoldOff);
			outStream.write(NewLine);
			outStream.write(NewLine);
			outStream.write(NewLine);

			
			printlines2(getAccurateText("OMR 50", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("OMR50AMT"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("Amount50AMT"),5, 2), 1, object, 1, args[0], 6, 6);
			
			printlines2(getAccurateText("OMR 20", 35, 2)
					 +  getAccurateText("x", 5, 2)
						+ getAccurateText(object.getString("OMR20AMT"),5, 2)
						+  getAccurateText("=", 5, 2) 
						+ getAccurateText(object.getString("Amount20AMT"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
				 
			printlines2(getAccurateText("OMR 10", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("OMR10AMT"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("Amount10AMT"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
				 
			printlines2(getAccurateText("OMR 5", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("OMR5AMT"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("Amount5AMT"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
					 
			printlines2(getAccurateText("OMR 1", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("OMR1AMT"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("Amount1AMT"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
					 
			printlines2(getAccurateText("OMR 0.500", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("OMR500PAISA"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("Amount500PAISA"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
					 
			printlines2(getAccurateText("OMR 0.200", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("OMR200PAISA"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("Amount200PAISA"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
				 
			printlines2(getAccurateText("OMR 0.100", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("OMR100PAISA"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("Amount100PAISA"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
					 
			printlines2(getAccurateText("OMR COINS", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("COIN"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("AmountCOIN"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
			 
				// ------------ End-------------------	
			
			

			outStream.write(BoldOff);
			printlines2(" ", 2, object, 1, args[0], 3, 3);
			printlines2(getAccurateText("SALES REP______________", 26, 0)
					+ getAccurateText("SUPERVISOR______________", 26, 0)
					+ getAccurateText("ACCOUNTANT______________", 26, 0), 1, object, 2, args[0], 3, 3);

		} catch (Exception e) {
			e.printStackTrace();
		}

		// return String.valueOf(s1);
	}

	// --------------
	void parseDepositCashResponse(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Transaction Number", 12);
			hashValues.put("Customer Code", 12);
			hashValues.put("Customer Name", 25);
			hashValues.put("Cheque No", 12);
			hashValues.put("Cheque Date", 11);
			hashValues.put("Bank Name", 14);
			hashValues.put("Cheque Amount", 12);
			hashValues.put("Amount", 10);
			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Transaction Number", 0);
			hashPositions.put("Customer Code", 0);
			hashPositions.put("Customer Name", 0);
			hashPositions.put("Cheque No", 0);
			hashPositions.put("Cheque Date", 0);
			hashPositions.put("Bank Name", 0);
			hashPositions.put("Cheque Amount", 2);
			hashPositions.put("Amount", 2);

			// ---------Start
			// printconnect(args[0]);
			// ----------End

			line(startln);
			headerprint(object, 3);

			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");

				if (jInnerData.length() > 0) {

					switch (i) {
					case 0:
						outStream.write(BoldOn);
						outStream.write("       ".getBytes());
						outStream.write(UnderlineOn);
						printlines2("CASH", 1, object, 1, args[0], 3, 3);
						
						outStream.write(UnderlineOff);
						outStream.write(BoldOff);

						break;
					case 1:
						outStream.write(BoldOn);
						outStream.write("       ".getBytes());
						outStream.write(UnderlineOn);
						printlines2("CHEQUE", 1, object, 1, args[0], 3, 3);
						outStream.write(UnderlineOff);
						outStream.write(BoldOff);
						break;
					default:
						break;
					}
				}
				int MAXLEngth = 80;
				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());
				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}

				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					strheader = strheader
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? headers.getString(j)
											: headers.getString(j).substring(0, headers.getString(j).indexOf(" "))
													.trim(),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));

					strHeaderBottom = strHeaderBottom
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? ""
											: headers.getString(j)
													.substring(headers.getString(j).indexOf(" "),
															headers.getString(j).length())
													.trim(),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));

					if (jTotal.has(headers.getString(j))) {
						strTotal = strTotal + getAccurateText(jTotal.getString(headers.getString(j).toString()),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					} else {

						strTotal = strTotal + getAccurateText(
								headers.getString(j).equals(i == 0 ? "Customer Code" : "Cheque Date") ? "Total" : "",
								hashValues.get(headers.getString(j)) + MAXLEngth, 1);
					}

				}

				if (jInnerData.length() > 0) {
					printlines2(strheader, 1, object, 1, args[0], 3, 3);
					printlines2(strHeaderBottom, 1, object, 1, args[0], 3, 3);
					printlines2(printSeprator(), 1, object, 1, args[0], 3, 3);

				}
				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					for (int m = 0; m < jArr.length(); m++) {
						strData = strData + getAccurateText(jArr.getString(m),
								hashValues.get(headers.getString(m).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(m).toString()));
					}
					printlines2(strData, 1, object, 1, args[0], 3, 3);

				}

				if (jInnerData.length() > 0) {

					printlines2(printSeprator(), 1, object, 1, args[0], 3, 3);

					printlines2(strTotal, 2, object, 1, args[0], 3, 3);
				}

			}
			outStream.write(BoldOn);
			String totalAmt = object.getString("TOTAL DEPOSIT AMOUNT");
			String varAmt = object.getString("totalvaramount");
			printlines2((getAccurateText("TOTAL DEPOSIT AMOUNT", 67, 2) + getAccurateText(totalAmt, 16, 1)), 1, object,
					1, args[0], 3, 3);
			printlines2((getAccurateText("TOTAL VARIENCE AMOUNT", 67, 2) + getAccurateText(varAmt, 16, 1)), 1, object,
					1, args[0], 3, 3);
			if (totalAmt.length() > 0 && varAmt.length() > 0) {
				float totalCount = Float.parseFloat(totalAmt) + Float.parseFloat(varAmt);

				int decimal_count = totalAmt.substring(totalAmt.indexOf(".") + 1, totalAmt.length()).length();
				printlines2(
						getAccurateText("NET DUE AMOUNT", 67, 2)
								+ getAccurateText(String.format("%." + decimal_count + "f", totalCount), 16, 1),
						1, object, 1, args[0], 3, 3);
			}

			outStream.write(BoldOn);
			outStream.write(DoubleWideOn);
			outStream.write(getAccurateText("CASH DENOMINATION", 40, 1).getBytes());
			outStream.write(DoubleWideOff);
			outStream.write(BoldOff);
			outStream.write(NewLine);
			outStream.write(NewLine);
			outStream.write(NewLine);
/* Sujee added for Cash Denomination Print --------------- Start-----------------*/
			
			printlines2(getAccurateText("OMR 50", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("OMR50AMT"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("Amount50AMT"),5, 2), 1, object, 1, args[0], 6, 6);
			
			printlines2(getAccurateText("OMR 20", 35, 2)
					 +  getAccurateText("x", 5, 2)
						+ getAccurateText(object.getString("OMR20AMT"),5, 2)
						+  getAccurateText("=", 5, 2) 
						+ getAccurateText(object.getString("Amount20AMT"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
				 
			printlines2(getAccurateText("OMR 10", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("OMR10AMT"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("Amount10AMT"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
				 
			printlines2(getAccurateText("OMR 5", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("OMR5AMT"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("Amount5AMT"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
					 
			printlines2(getAccurateText("OMR 1", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("OMR1AMT"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("Amount1AMT"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
					 
			printlines2(getAccurateText("OMR 0.500", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("OMR500PAISA"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("Amount500PAISA"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
					 
			printlines2(getAccurateText("OMR 0.200", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("OMR200PAISA"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("Amount200PAISA"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
				 
			printlines2(getAccurateText("OMR 0.100", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("OMR100PAISA"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("Amount100PAISA"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
					 
			printlines2(getAccurateText("OMR COINS", 35, 2) +  getAccurateText("x", 5, 2)
					+ getAccurateText(object.getString("COIN"),5, 2)
					+  getAccurateText("=", 5, 2) 
					+ getAccurateText(object.getString("AmountCOIN"),5, 2), 1, object, 1, args[0], 6, 6);
			
			
			 
				// ------------ End-------------------	
			outStream.write(BoldOff);
			printlines2(" ", 2, object, 1, args[0], 3, 3);
			printlines2(getAccurateText("SALES REP______________", 26, 0)
					+ getAccurateText("SUPERVISOR______________", 26, 0)
					+ getAccurateText("ACCOUNTANT______________", 26, 0), 1, object, 2, args[0], 3, 3);

		} catch (Exception e) {
			e.printStackTrace();
		}

		// return String.valueOf(s1);
	}

	// --------------
	void parseUnloadDamage(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("ITEM#", 12);
			hashValues.put("DESCRIPTION", 12);
			hashValues.put("UPC", 4);
			hashValues.put("STALES Qty", 11);
			hashValues.put("T1.UNITS", 14);
			hashValues.put("DAMAGE Qty", 12);
			hashValues.put("T2.UNITS", 10);
			hashValues.put("OTHER Qty", 12);
			hashValues.put("T3.UNITS", 10);
			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("ITEM#", 0);
			hashPositions.put("DESCRIPTION", 0);
			hashPositions.put("UPC", 0);
			hashPositions.put("STALES Qty", 0);
			hashPositions.put("T1.UNITS", 0);
			hashPositions.put("DAMAGE Qty", 2);
			hashPositions.put("T2.UNITS", 2);
			hashPositions.put("OTHER Qty", 2);
			hashPositions.put("T3.UNITS", 2);

			// ---------Start
			// printconnect(args[0]);
			// ----------End

			line(startln);
			headerprint(object, 7);

			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");

				int MAXLEngth = 130;
				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());
				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}

				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					strheader = strheader
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? headers.getString(j)
											: headers.getString(j).substring(0, headers.getString(j).indexOf(" "))
													.trim(),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));

					strHeaderBottom = strHeaderBottom
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? ""
											: headers.getString(j)
													.substring(headers.getString(j).indexOf(" "),
															headers.getString(j).length())
													.trim(),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));

					if (jTotal.has(headers.getString(j))) {
						strTotal = strTotal + getAccurateText(jTotal.getString(headers.getString(j).toString()),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					} else {

						strTotal = strTotal
								+ getAccurateText(headers.getString(j).equals("DESCRIPTION") ? "TOTAL QUANTITY" : "",
										hashValues.get(headers.getString(j)) + MAXLEngth, 1);
					}

				}
				if (jInnerData.length() > 0) {
					outStream.write(CompressOn);
					printlines2(printSeprator(), 1, object, 1, args[0], 7, 7);
					printlines2((getAccurateText("UNLOADED STALES", 67, 2) + getAccurateText("UNLOADED DAMAGE", 16, 1)),
							1, object, 1, args[0], 7, 7);
					printlines2(strheader, 1, object, 1, args[0], 7, 7);
					printlines2(strHeaderBottom, 1, object, 1, args[0], 7, 7);
					printlines2(printSeprator(), 1, object, 1, args[0], 7, 7);

				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					for (int m = 0; m < jArr.length(); m++) {
						strData = strData + getAccurateText(jArr.getString(m),
								hashValues.get(headers.getString(m).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(m).toString()));
					}
					printlines2(strData, 1, object, 1, args[0], 7, 7);

				}
				if (jInnerData.length() > 0) {
					printlines2(printSeprator(), 1, object, 1, args[0], 7, 7);
					printlines2(strTotal, 2, object, 1, args[0], 7, 7);
				}

			}
			outStream.write(CompressOff);
			outStream.write(BoldOn);
			String totalAmt = "0";
			String varAmt = "0";
			printlines2((getAccurateText("UNLOADED STALES VARIANCE", 67, 2) + getAccurateText(totalAmt, 16, 1)), 1,
					object, 1, args[0], 7, 7);
			printlines2((getAccurateText("UNLOADED DAMAGE VARIANCE", 67, 2) + getAccurateText(varAmt, 16, 1)), 1,
					object, 1, args[0], 7, 7);

			outStream.write(BoldOff);
			printlines2(" ", 2, object, 1, args[0], 7, 7);
			printlines2(getAccurateText("SALESMAN______________", 80, 1), 1, object, 2, args[0], 7, 7);

		} catch (Exception e) {
			e.printStackTrace();
		}

		// return String.valueOf(s1);
	}

	void printSalesSummaryReport(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Transaction Number", 20);
			hashValues.put("Customer Code", 15);
			hashValues.put("Customer Name", 25);
			hashValues.put("Sales Amount", 10);
			hashValues.put("G.Return Amount", 10);
			hashValues.put("D.Return Amount", 10);
			hashValues.put("Invoice Discount", 10);
			hashValues.put("Total Amount", 11);
			hashValues.put("Check Number", 10);
			hashValues.put("Check Date", 8);
			hashValues.put("Bank Name", 11);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Transaction Number", 0);
			hashPositions.put("Customer Code", 0);
			hashPositions.put("Customer Name", 0);
			hashPositions.put("Sales Amount", 2);
			hashPositions.put("G.Return Amount", 2);
			hashPositions.put("D.Return Amount", 2);
			hashPositions.put("Invoice Discount", 2);
			hashPositions.put("Total Amount", 2);
			hashPositions.put("Check Number", 0);
			hashPositions.put("Check Date", 0);
			hashPositions.put("Bank Name", 0);

			// ---------Start
			// printconnect(args[0]);
			// ----------End
			line(startln);
			headerprint(object, 4);
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");

				if (jInnerData.length() > 0) {

					switch (i) {
					case 0:
						outStream.write(BoldOn);
						outStream.write("       ".getBytes());
						outStream.write(UnderlineOn);
						printlines2("CASH INVOICE", 1, object, 1, args[0], 4, 4);
						outStream.write(UnderlineOff);
						outStream.write(BoldOff);

						break;
					case 1:
						outStream.write(BoldOn);
						outStream.write("       ".getBytes());
						outStream.write(UnderlineOn);
						printlines2("CREDIT INVOICE", 1, object, 1, args[0], 4, 4);
						outStream.write(UnderlineOff);
						outStream.write(BoldOff);

						break;
					case 2:
						outStream.write(BoldOn);
						outStream.write("       ".getBytes());
						outStream.write(UnderlineOn);
						printlines2("TC INVOICE", 1, object, 1, args[0], 4, 4);
						outStream.write(UnderlineOff);
						outStream.write(BoldOff);

						break;
					case 3:
						outStream.write(BoldOn);
						outStream.write("       ".getBytes());
						outStream.write(UnderlineOn);
						printlines2("COLLECTION", 1, object, 1, args[0], 4, 4);
						outStream.write(UnderlineOff);
						outStream.write(BoldOff);

						break;
					default:
						break;
					}
				}

				int MAXLEngth = 140;
				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());
				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}

				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					strheader = strheader
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? headers.getString(j)
											: headers.getString(j).substring(0, headers.getString(j).indexOf(" "))
													.trim(),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));

					strHeaderBottom = strHeaderBottom
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? ""
											: headers.getString(j)
													.substring(headers.getString(j).indexOf(" "),
															headers.getString(j).length())
													.trim(),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));

					if (jTotal.has(headers.getString(j))) {
						strTotal = strTotal + getAccurateText(jTotal.getString(headers.getString(j).toString()),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					} else {

						strTotal = strTotal
								+ getAccurateText(headers.getString(j).equals("Customer Code") ? "SUB TOTAL" : "",
										hashValues.get(headers.getString(j)) + MAXLEngth, 1);
					}

				}
				if (jInnerData.length() > 0) {
					outStream.write(CompressOn);
					printlines2(strheader, 1, object, 1, args[0], 4, 4);
					printlines2(strHeaderBottom, 1, object, 1, args[0], 4, 4);
					printlines2(printSepratorCompress(), 1, object, 1, args[0], 4, 4);
					outStream.write(CompressOff);
				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					for (int m = 0; m < jArr.length(); m++) {
						strData = strData + getAccurateText(jArr.getString(m),
								hashValues.get(headers.getString(m).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(m).toString()));
					}
					outStream.write(CompressOn);
					printlines2(strData, 1, object, 1, args[0], 4, 4);
					outStream.write(CompressOff);
				}
				if (jInnerData.length() > 0) {
					outStream.write(CompressOn);
					printlines2(printSepratorCompress(), 1, object, 1, args[0], 4, 4);
					outStream.write(CompressOff);
					outStream.write(CompressOn);
					printlines2(strTotal, 1, object, 1, args[0], 4, 4);
					outStream.write(CompressOff);

				}

			}

			printlines2(" ", 2, object, 1, args[0], 4, 4);
			printlines2(getAccurateText(("SALESMAN_______________ "), 80, 1), 2, object, 2, args[0], 4, 4);

		} catch (Exception e) {
			e.printStackTrace();

		}

		// return String.valueOf(s1).getBytes();
	}

	// -------------start Route Activity Developer By VB 5/1/2014
	void printRouteactivityReport(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {

			hashValues = new HashMap<String, Integer>();
			hashValues.put("Transaction No", 20);
			hashValues.put("Time In", 10);
			hashValues.put("Time Out", 10);
			hashValues.put("Customer Code", 15);
			hashValues.put("Customer Name", 35);
			hashValues.put("Transaction Type", 24);
			hashValues.put("Total Amount", 15);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Transaction No", 0);
			hashPositions.put("Time In", 0);
			hashPositions.put("Time Out", 0);
			hashPositions.put("Customer Code", 0);
			hashPositions.put("Customer Name", 0);
			hashPositions.put("Transaction Type", 0);
			hashPositions.put("Total Amount", 2);

			/*
			 * hashValues = new HashMap<String, Integer>(); hashValues.put(
			 * "Transaction Number", 11); hashValues.put("Time In", 6);
			 * hashValues.put("Time Out", 6); hashValues.put("Customer Code",
			 * 10); hashValues.put("Transaction Type", 14);
			 * hashValues.put("Amount", 8);
			 * 
			 * hashPositions = new HashMap<String, Integer>(); hashValues.put(
			 * "Transaction Number",0); hashValues.put("Time In",0);
			 * hashValues.put("Time Out",0); hashValues.put("Customer Code",0);
			 * hashValues.put("Transaction Type",0); hashValues.put("Amount",
			 * 2);
			 */

			// ---------Start
			// printconnect(args[0]);
			// ----------End
			line(startln);
			headerprint(object, 5);
			outStream.write(CompressOn);
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {

				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");
				int MAXLEngth = 137;
				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());
				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}

				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					strheader = strheader
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? headers.getString(j)
											: headers.getString(j).substring(0, headers.getString(j).indexOf(" "))
													.trim(),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));

					strHeaderBottom = strHeaderBottom
							+ getAccurateText(
									(headers.getString(j).indexOf(" ") == -1) ? ""
											: headers.getString(j)
													.substring(headers.getString(j).indexOf(" "),
															headers.getString(j).length())
													.trim(),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));

					if (jTotal.has(headers.getString(j))) {
						strTotal = strTotal + getAccurateText(jTotal.getString(headers.getString(j).toString()),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					} else {

						strTotal = strTotal + getAccurateText(
								headers.getString(j).equals("Customer Name") ? "TOTAL SALES&RECEIPT" : "",
								hashValues.get(headers.getString(j)) + MAXLEngth, 1);

					}

				}
				if (jInnerData.length() > 0) {

					printlines2(strheader, 1, object, 1, args[0], 5, 5);
					printlines2(strHeaderBottom, 1, object, 1, args[0], 5, 5);
					printlines2(printSepratorcomp(), 1, object, 1, args[0], 5, 5);

				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					for (int m = 0; m < jArr.length(); m++) {
						strData = strData + getAccurateText(jArr.getString(m),
								hashValues.get(headers.getString(m).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(m).toString()));
					}

					printlines2(strData, 1, object, 1, args[0], 5, 5);

				}
				if (jInnerData.length() > 0) {

					printlines2(printSepratorcomp(), 1, object, 1, args[0], 5, 5);

					printlines2(strTotal, 1, object, 1, args[0], 5, 5);

				}
				if (jInnerData.length() > 0) {

					printlines2(printSepratorcomp(), 2, object, 1, args[0], 5, 5);

				}

			}
			outStream.write(CompressOff);
			outStream.write(BoldOn);
			printlines2(getAccurateText("ENDING ODOMETER READING", 40, 2)
					+ getAccurateText(object.getString("endreading"), 10, 2), 2, object, 1, args[0], 5, 5);
			printlines2(getAccurateText("STARTING ODOMETER READING", 40, 2)
					+ getAccurateText(object.getString("startreading"), 10, 2), 2, object, 1, args[0], 5, 5);
			printlines2(getAccurateText("TOTAL KILOMETRS", 40, 2) + getAccurateText(object.getString("totalkm"), 10, 2),
					2, object, 1, args[0], 5, 5);
			outStream.write(BoldOff);
			printlines2(" ", 2, object, 1, args[0], 5, 5);
			printlines2(getAccurateText(("SALESMAN_______________ "), 80, 1), 2, object, 2, args[0], 5, 5);

		} catch (Exception e) {
			e.printStackTrace();

		}

		// return String.valueOf(s1);
	}
	
	
	void printVanSettlementReport(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {
			// ---------Start
			// printconnect(args[0]);
			// ----------End
			line(startln);
			headerprint(object, 9);
			outStream.write(BoldOn);
			outStream.write("       ".getBytes());
			outStream.write(UnderlineOn);
			printlines2("TRANSACTIONS", 2, object, 1, args[0], 6, 6);
			outStream.write(UnderlineOff);
			outStream.write(BoldOff);
			outStream.write(NewLine);
			
			printlines2(getAccurateText("TOTAL LOAD VALUE: ", 30, 0)
					+ getAccurateText(object.getString("LOAD_TOTAL"), 10, 0), 1, object, 1, args[0], 6, 6);
			outStream.write(NewLine);
			
			if(Double.parseDouble(object.getString("LOAD1"))!=0){
				printlines2(getAccurateText("PREVIOUS DAY STOCK VALUE: ", 50, 0)
						+ getAccurateText(object.getString("LOAD1"), 10, 0), 1, object, 1, args[0], 6, 6);
			}
			if(Double.parseDouble(object.getString("LOAD2"))!=0){
				printlines2(getAccurateText("TODAY LOAD 1 STOCK VALUE: ", 50, 0)
						+ getAccurateText(object.getString("LOAD2"), 10, 0), 1, object, 1, args[0], 6, 6);
			}
			if(Double.parseDouble(object.getString("LOAD3"))!=0){
				printlines2(getAccurateText("TODAY LOAD 2 STOCK VALUE: ", 50, 0)
						+ getAccurateText(object.getString("LOAD3"), 10, 0), 1, object, 1, args[0], 6, 6);
			}
			if(Double.parseDouble(object.getString("LOAD4"))!=0){
				printlines2(getAccurateText("TODAY LOAD 3 STOCK VALUE: ", 50, 0)
						+ getAccurateText(object.getString("LOAD4"), 10, 0), 1, object, 1, args[0], 6, 6);
			}
			if(Double.parseDouble(object.getString("LOAD5"))!=0){
				printlines2(getAccurateText("TODAY LOAD 4 STOCK VALUE: ", 50, 0)
						+ getAccurateText(object.getString("LOAD5"), 10, 0), 1, object, 1, args[0], 6, 6);
			}
			outStream.write(NewLine);
			outStream.write(BoldOn);
			outStream.write("       ".getBytes());
			outStream.write(UnderlineOn);
			printlines2("ENDING INVENTORY VALUE", 1, object, 1, args[0], 6, 6);
			outStream.write(UnderlineOff);
			outStream.write(BoldOff);
			//outStream.write(NewLine);
			printlines2(
					getAccurateText("END SALE STOCK VALUE: ", 50, 0)
							+ getAccurateText(object.getString("END_VALUE"), 10, 0), 1, object, 1, args[0], 6, 6);
			
			outStream.write(NewLine);
			outStream.write(BoldOn);
			outStream.write("       ".getBytes());
			outStream.write(UnderlineOn);
			printlines2("SALES ", 1, object, 1, args[0], 6, 6);
			outStream.write(UnderlineOff);
			outStream.write(BoldOff);
			
			printlines2(
			getAccurateText("TOTAL SALES VALUE: ", 30, 0)
					+ getAccurateText(object.getString("TOTAL_SALES"), 10, 0), 1, object, 1, args[0], 6, 6);
	
			printlines2(
					getAccurateText("NET CREDIT SALE VALUE: ", 50, 0)
							+ getAccurateText(object.getString("CREDIT_SALES"), 10, 0), 1, object, 1, args[0], 6, 6);

			printlines2(
					getAccurateText("NET CASH SALE VALUE: ", 50, 0)
							+ getAccurateText(object.getString("CASH_SALES"), 10, 0), 1, object, 1, args[0], 6, 6);
			printlines2(
					getAccurateText("NET TC SALE VALUE: ", 50, 0)
							+ getAccurateText(object.getString("TC_SALES"), 10, 0), 1, object, 1, args[0], 6, 6);
			outStream.write(NewLine);
			
			outStream.write(BoldOn);
			outStream.write("       ".getBytes());
			outStream.write(UnderlineOn);
			printlines2("GOODS RETURN ", 1, object, 1, args[0], 6, 6);
			outStream.write(UnderlineOff);
			outStream.write(BoldOff);

			printlines2(
					getAccurateText("GOOD RETURN VALUE: ", 50, 0)
							+ getAccurateText(object.getString("GOOD_AMT"), 10, 0), 1, object, 1, args[0], 6, 6);
			
			outStream.write(NewLine);
			outStream.write(BoldOn);
			outStream.write("       ".getBytes());
			outStream.write(UnderlineOn);
			printlines2("DAMAGE/EXPIRY ", 1, object, 1, args[0], 6, 6);
			outStream.write(UnderlineOff);
			outStream.write(BoldOff);

			printlines2(
					getAccurateText("DAMAGE VALUE: ", 50, 0)
							+ getAccurateText(object.getString("DAM_AMT"), 10, 0), 1, object, 1, args[0], 6, 6);
			printlines2(
					getAccurateText("EXPIRY VALUE: ", 50, 0)
							+ getAccurateText(object.getString("EXP_AMT"), 10, 0), 1, object, 1, args[0], 6, 6);

			outStream.write(NewLine);

			outStream.write(BoldOn);
			outStream.write("       ".getBytes());
			outStream.write(UnderlineOn);
			printlines2("SALES DISCOUNT ", 1, object, 1, args[0], 6, 6);
			outStream.write(UnderlineOff);
			outStream.write(BoldOff);
			//outStream.write(NewLine);
			
			printlines2(
					getAccurateText("DISCOUNT VALUE: ", 50, 0)
							+ getAccurateText(object.getString("SALE_DISCOUNT"), 10, 0), 1, object, 1, args[0], 6, 6);
			outStream.write(NewLine);
			
			outStream.write(BoldOn);
			outStream.write("       ".getBytes());
			outStream.write(UnderlineOn);
			printlines2("FREE AMOUNT ", 1, object, 1, args[0], 6, 6);
			outStream.write(UnderlineOff);
			outStream.write(BoldOff);
			//outStream.write(NewLine);
			printlines2(
					getAccurateText("FREE VALUE: ", 50, 0)
							+ getAccurateText(object.getString("FREE_AMOUNT"), 10, 0), 1, object, 1, args[0], 6, 6);
			outStream.write(NewLine);

			
			outStream.write(BoldOn);
			outStream.write("       ".getBytes());
			outStream.write(UnderlineOn);
			printlines2("VAT ", 1, object, 1, args[0], 6, 6);
			outStream.write(UnderlineOff);
			outStream.write(BoldOff);

			printlines2(
					getAccurateText("TOTAL VAT VALUE: ", 50, 0)
							+ getAccurateText(object.getString("TOTAL_TAX"), 10, 0), 1, object, 1, args[0], 6, 6);
			outStream.write(NewLine);
			
			
			outStream.write(BoldOn);
			outStream.write("       ".getBytes());
			outStream.write(UnderlineOn);
			printlines2("RECEIPTS ", 1, object, 1, args[0], 6, 6);
			outStream.write(UnderlineOff);
			outStream.write(BoldOff);
			
			printlines2(
					getAccurateText("TOTAL COLLECTION: ", 30, 0)
							+ getAccurateText(object.getString("AR_AMT"), 10, 0), 1, object, 1, args[0], 6, 6);
			
			printlines2(
					getAccurateText("CASH VALUE: ", 50, 0)
							+ getAccurateText(object.getString("AR_CASH"), 10, 0), 1, object, 1, args[0], 6, 6);
			printlines2(
					getAccurateText("CHEQUE VALUE: ", 50, 0)
							+ getAccurateText(object.getString("AR_CHEQUE"), 10, 0), 1, object, 1, args[0], 6, 6);
			
			outStream.write(NewLine);
			printlines2(
					getAccurateText("SHORTAGE PENALTY VALUE: ", 50, 0)
							+ getAccurateText("0.000", 10, 0), 1, object, 1, args[0], 6, 6);


			printlines2(" ", 2, object, 1, args[0], 6, 6);
			printlines2(getAccurateText("SALESMAN_______________ ", 80, 1), 2, object, 2, args[0], 6, 6);

		} catch (Exception e) {
			e.printStackTrace();

		}

		// return String.valueOf(s1);
	}

	
	

	// ---------End
	// -------------start Route Summary Report Developed By VB 7/1/2014
	void printRouteSummaryReport(final JSONObject object, final String... args) {
		StringBuffer s1 = new StringBuffer();
		try {
			// ---------Start
			// printconnect(args[0]);
			// ----------End
			line(startln);
			headerprint(object, 6);

			// JSONArray jData = object.getJSONArray("data");
			outStream.write(BoldOn);
			outStream.write("       ".getBytes());
			outStream.write(UnderlineOn);
			printlines2("VISIT DETAIL", 1, object, 1, args[0], 6, 6);
			outStream.write(UnderlineOff);
			outStream.write(BoldOff);

			// ------------
			printlines2(getAccurateText("SCANNED CUSTOMERS: ", 30, 0)
					+ getAccurateText(object.getString("ScannedCustomers"), 10, 0)
					+ getAccurateText("PLANNED CALLS:", 30, 0)
					+ getAccurateText(object.getString("PlannedCalls"), 10, 0), 1, object, 1, args[0], 6, 6);

			printlines2(

			getAccurateText("NON SCANNED CUSTOMER", 30, 0)
					+ getAccurateText(object.getString("NonScannedCustomers"), 10, 0)
					+ getAccurateText("CALLS MADE(PLANNED)", 30, 0)
					+ getAccurateText(object.getString("CallsMadePlanned"), 10, 0), 1, object, 1, args[0], 6, 6);

			printlines2(
					getAccurateText("NO CALLS CUSTOMERS", 30, 0)
							+ getAccurateText(object.getString("NoCallCustomer"), 10, 0)
							+ getAccurateText("CALLS MADE(UNPLANNED)", 30, 0)
							+ getAccurateText(object.getString("CallsMadeUnPlanned"), 10, 0),
					1, object, 1, args[0], 6, 6);

			printlines2(
					getAccurateText("VOID INVOICES", 30, 0) + getAccurateText(object.getString("VoidInvoices"), 10, 0)
							+ getAccurateText("ACTUAL CALLS MADE", 30, 0)
							+ getAccurateText(object.getString("ActualCallsMade"), 10, 0),
					1, object, 1, args[0], 6, 6);

			printlines2(getAccurateText("START TIME", 30, 0) + getAccurateText(object.getString("StartTime"), 10, 0)
					+ getAccurateText("INVOICED CALLS", 30, 0)
					+ getAccurateText(object.getString("InvoicedCalls"), 10, 0), 1, object, 1, args[0], 6, 6);

			printlines2(
					getAccurateText("END TIME", 30, 0) + getAccurateText(object.getString("EndTime"), 10, 0)
							+ getAccurateText("PRODUCTIVE CALLS", 30, 0)
							+ getAccurateText(object.getString("ProductiveCalls") + "%", 10, 0),
					1, object, 1, args[0], 6, 6);

			printlines2(
					getAccurateText("TOTAL KMS RUN", 30, 0) + getAccurateText(object.getString("TotalKmsRun"), 10, 0)
							+ getAccurateText("COVERAGE", 30, 0)
							+ getAccurateText(object.getString("CoverageCalls") + "%", 10, 0),
					1, object, 1, args[0], 6, 6);
			// ------------

			outStream.write(BoldOn);
			outStream.write("       ".getBytes());
			outStream.write(UnderlineOn);
			printlines2("INVENTORY - OVER/SHORT", 1, object, 1, args[0], 6, 6);
			outStream.write(UnderlineOff);
			outStream.write(BoldOff);

			printlines2(getAccurateText("OPENING", 20, 0) + getAccurateText(object.getString("Opening"), 10, 2), 1,
					object, 1, args[0], 6, 6);
			printlines2(getAccurateText("LOADED", 20, 0) + getAccurateText(object.getString("Loaded"), 10, 2), 1,
					object, 1, args[0], 6, 6);
			printlines2(
					getAccurateText("TRANSFERED IN", 20, 0) + getAccurateText(object.getString("Transferin"), 10, 2), 1,
					object, 1, args[0], 6, 6);
			printlines2(
					getAccurateText("TRANSFERED OUT", 20, 0) + getAccurateText(object.getString("Transferout"), 35, 2),
					1, object, 1, args[0], 6, 6);
			printlines2(getAccurateText("SALES & FREE", 20, 0) + getAccurateText(object.getString("salesfree"), 35, 2),
					1, object, 1, args[0], 6, 6);
			
			printlines2(
					getAccurateText("FRESH UNLOAD", 20, 0) + getAccurateText(object.getString("freshunload"), 35, 2), 1,
					object, 1, args[0], 6, 6);
			printlines2(
					getAccurateText("TRUCK DAMAGES", 20, 0) + getAccurateText(object.getString("truckdamage"), 35, 2),
					1, object, 1, args[0], 6, 6);
			printlines2(getAccurateText("BAD RETURN", 20, 0) + getAccurateText(object.getString("badreturn"), 35, 2), 1,
					object, 1, args[0], 6, 6);
			printlines2(
					getAccurateText("CALCULATED UNLOAD", 30, 0)
							+ getAccurateText(object.getString("calculatedunload"), 45, 2),
					1, object, 1, args[0], 6, 6);
			printlines2(getAccurateText("UNLOAD", 30, 0) + getAccurateText(object.getString("unload"), 45, 2), 1,
					object, 1, args[0], 6, 6);
			printlines2(getAccurateText("UNLOAD VARIENCE", 30, 0)
					+ getAccurateText(object.getString("unloadvariance"), 45, 2), 1, object, 1, args[0], 6, 6);
			/*
			 * printlines2( getAccurateText("CALCULATED BAD RETURN", 30, 0) +
			 * getAccurateText( object.getString("calculatedunload"), 45, 2), 1,
			 * object, 1, args[0], 6, 6); printlines2( getAccurateText(
			 * "UNLOADED BAD RETURN", 30, 0) + getAccurateText(
			 * object.getString("unloadbadreturn"), 45, 2), 1, object, 1,
			 * args[0], 6, 6); printlines2( getAccurateText("RETURN VARIANCE",
			 * 30, 0) + getAccurateText( object.getString("returnvarinace"), 45,
			 * 2), 1, object, 1, args[0], 6, 6);
			 */
			printlines2(getAccurateText("TOTAL INVENTORY VARIANCE", 30, 0)
					+ getAccurateText(object.getString("Totalinvvarince"), 45, 2), 2, object, 1, args[0], 6, 6);

			outStream.write(BoldOn);
			outStream.write("       ".getBytes());
			outStream.write(UnderlineOn);
			printlines2("CASH - OVER/SHORT", 1, object, 1, args[0], 6, 6);
			outStream.write(UnderlineOff);
			outStream.write(BoldOff);

			printlines2(getAccurateText("TODAYS SALES", 20, 0) + getAccurateText(object.getString("todaysales"), 35, 2),
					1, object, 1, args[0], 6, 6);
			printlines2(
					getAccurateText("    CASH SALES", 20, 0) + getAccurateText(object.getString("cashsales"), 10, 2), 1,
					object, 1, args[0], 6, 6);
			printlines2(getAccurateText("    CREDIT SALES", 20, 0)
					+ getAccurateText(object.getString("creditsales"), 10, 2), 1, object, 1, args[0], 6, 6);
			printlines2(getAccurateText("    TC SALES", 20, 0) + getAccurateText(object.getString("tcsales"), 10, 2), 1,
					object, 1, args[0], 6, 6);
			printlines2(getAccurateText("COLLECTIONS", 20, 0) + getAccurateText(object.getString("collection"), 35, 2),
					1, object, 1, args[0], 6, 6);
			printlines2(getAccurateText("    CASH", 20, 0) + getAccurateText(object.getString("cash"), 10, 2), 1,
					object, 1, args[0], 6, 6);
			printlines2(getAccurateText("    CHEQUE", 20, 0) + getAccurateText(object.getString("cheque"), 10, 2), 1,
					object, 1, args[0], 6, 6);
			/*
			 * printlines2(getAccurateText("EXPENSES", 20, 0)+
			 * getAccurateText(object.getString("expense"),35,
			 * 2),1,object,1,args[0],6,6); printlines2(getAccurateText(
			 * "CASH ADJUSTMENT", 20, 0)+
			 * getAccurateText(object.getString("cashadj"), 10,
			 * 2),1,object,1,args[0],6,6); printlines2(getAccurateText(
			 * "CHEQUE ADJUSTMENT", 20, 0)+
			 * getAccurateText(object.getString("chkadj"), 10,
			 * 2),1,object,1,args[0],6,6); printlines2(getAccurateText(
			 * "CALCULATED CASH DUE", 20, 0)+
			 * getAccurateText(object.getString("calculatedcashdue"), 55,
			 * 2),1,object,1,args[0],6,6); printlines2(getAccurateText(
			 * "CASH VARIANCE", 20, 0)+
			 * getAccurateText(object.getString("cashvariance"), 55,
			 * 2),1,object,1,args[0],6,6); printlines2(getAccurateText(
			 * "NET CASH DUE", 20, 0)+
			 * getAccurateText(object.getString("netcashdue"), 55,
			 * 2),3,object,1,args[0],6,6);
			 */
			printlines2(" ", 2, object, 1, args[0], 6, 6);
			printlines2(getAccurateText("SALESMAN_______________ ", 80, 1), 2, object, 2, args[0], 6, 6);

		} catch (Exception e) {
			e.printStackTrace();

		}

		// return String.valueOf(s1);
	}

	// ---------End
	private int count = 0;

	// -----------Start for testing
	/*
	 * Printline1 function arguments definition String Data = Passed string int
	 * ln = how many line want to skip after printing one line JSONObject = json
	 * object for retrieving JSON data int sts = its argument of the status 0=
	 * start,1=continue,2=end String adr = useful of print sales report for
	 * duplicate copy passed mac address of printer int tran = argument use full
	 * for transcation type 1= inventory,2=invoice,3=vanstock int type =
	 * argument for passing subtype of invoice and inventory
	 */

	// For Inventory
	private void printlines1(String data, int ln, JSONObject object, int sts, String adr, int tp)
			throws JSONException, IOException, LinePrinterException {

		count += ln;
		int pln = 48;

		// int pln = 45;
		// isTwice=false;
		// if (tp == 6 || tp == 25) {
		// pln = 45;
		// }
		// if (tp == 3) {
		// pln = 43;
		// }
		//
		// if (tp == 1) {
		//
		// pln = 42;
		// }

		boolean isEnd = false;
		if (sts == 2 && count != 0) {
			printArabic(data);
			int lnno;
			isEnd = true;
			// if (tp == 6 || tp == 25 || tp == 3 || tp == 1) {
			// lnno = 51 - count;
			// } else {
			// lnno = pln - count;
			// }
			lnno = pln - count;
			lnno = lnno + endln;

			for (int i = 0; i < lnno; i++) {
				try {
					if (i % 10 == 0) {
						try {
							Thread.sleep(1000);
							// lp.flush()
						} catch (InterruptedException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
					}
					outStream.write(NewLine);

				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
			outStream.write(CarriageReturn);
			// outStream.write(NewLine);
			// outStream.write(NewLine);
			// outStream.write(NewLine);
			count = 0;
			// lp.disconnect(); // Disconnects from the printer
			// outStream.write(resetprinter);

			try {
				Thread.sleep(5000);
				// lp.flush()
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			status.put("status", true);
			status.put("isconnected", 0);
			sendUpdate(status, true);

		}
		if (!isEnd) {
			printArabic(data);
			for (int i = 0; i < ln; i++) {
				try {

					outStream.write(NewLine);
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
			// line(ln);
			if (count % 10 == 0) {
				try {
					Thread.sleep(5000);
					// lp.flush()
				} catch (InterruptedException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}

			if (count > pln) {
				Log.e("Count 1 time", "Count " + count);
				outStream.write(CompressOff);
				count = 0;
				try {
					line(cnln);
					if (tp == 4) {
						headervanstockprint(object, tp);
					} else if (tp == 6 || tp == 25) {
						headervanstockprint(object, tp);
					} else {

						headerinvprint(object, tp);
					}
					// outStream.write(NewLine);
					outStream.write(printSeprator().getBytes());
					count = count + 1;
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

			}
		}
	}

	// -----------
	// For Tranasactions
	private void printlines2(String data, int ln, JSONObject object, int sts, String adr, int tran, int tp)
			throws JSONException, IOException, LinePrinterException {
		count += ln;

		int pln = 42; // 48
		boolean isEnd = false;
		if (sts == 2 && count != 0) {
			printArabic(data);
			int lnno;
			int lnno1;
			Log.e("salessummary count", "" + count);
			Log.e("salessummary pln", "" + pln);
			lnno = pln - count;
			isEnd = true;

			lnno1 = lnno + endln;

			for (int i = 0; i < lnno1; i++) {
				try {
					if (i % 10 == 0) {
						try {
							Thread.sleep(1000);
							// lp.flush()
						} catch (InterruptedException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
						}
					}
					outStream.write(NewLine);
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
			outStream.write(CarriageReturn);
			// outStream.write(NewLine);
			// outStream.write(NewLine);
			// outStream.write(NewLine);
			count = 0;
			// lp.disconnect(); // Disconnects from the printer
			// outStream.write(resetprinter);

			try {
				Thread.sleep(5000);
				// lp.flush()
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			// if (outStream != null)
			//
			// try {
			// outStream.close();
			//
			// } catch (IOException e) {
			// // TODO Auto-generated catch block
			// // e.printStackTrace();
			// Log.v("osERROR", e.getMessage());
			// }

			status.put("status", true);
			status.put("isconnected", 0);
			sendUpdate(status, true);

		}

		if (!isEnd) {
			printArabic(data);

			for (int i = 0; i < ln; i++) {
				try {

					outStream.write(NewLine);
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
			if (count % 10 == 0) {
				try {
					Thread.sleep(5000);
					// lp.flush()
				} catch (InterruptedException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
			Log.d("Count", "Count1" + count);
			if (count > pln) {
				count = 0;
				Log.d("Count", "Count1" + count);
				Log.d("Pln", "PLn" + pln);
				try {
					line(cnln);
					//outStream.write(CompressOff);
					if (tran == 2) {
						// suje commnted based on tax print header 21/04/2021
						headerprint(object, tp);
						/* if(companyTaxStng==1){
							 headerTaxprint(object, tp);
						 }else {
						headerprint(object, tp);
						 }*/
					} else if (tran == 1) {  
						 if(companyTaxStng==1){
							 headerTaxprint(object, tp);
						 }else {
						headerprint(object, tp);
						 }
					} else if (tran == 5) {
						headerprint(object, tp);
					
					} else if (tran == 4) {
						headerprint(object, tp);
						
					} else if (tran == 3) {
					   headerprint(object, tp);
					
					} else if (tran == 6) {
						headerprint(object, tp);
						 
					} else if (tran == 7) {
						headerprint(object, tp);
					
					}
					// outStream.write(NewLine);
					outStream.write(printSeprator().getBytes());
					count = count + 1;

					if (tran == 5 || tran == 4) {
						outStream.write(CompressOn);

					}
					outStream.write(CompressOn);
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

			}
		}
	}
	private void headerTaxprint(JSONObject object, int type, String... args) throws JSONException {
		try {
	
			
			outStream.write(BoldOn);
			outStream.write(DoubleWideOn);
			printArabic(getAccurateText(object.getString("companyname"), 40, 1));
			outStream.write(DoubleWideOff);
			outStream.write(NewLine);
			
			/*printArabic(getAccurateText(object.getString("companyaddress"), 80, 1));
			outStream.write(NewLine);*/
			try {
				String[] Add = object.getString("companyaddress").split("\\$");
				//outStream.write(("                        "  + Add[0]).getBytes());
				//printheaders(( Add[0] + ""), false, 2);
				//outStream.write(( Add[0]).getBytes());
				printheaders((getAccurateText("", 20, 1)+ getAccurateText(Add[0], 40, 0)), false, 1);
				outStream.write(NewLine);
				//outStream.write(("                        " + Add[1]).getBytes());
				//printArabic(getAccurateText( Add[1], 40, 1));
				printheaders((getAccurateText("", 20, 1)+ getAccurateText(Add[1], 40, 0)), false, 1);
				//printheaders(( Add[1] + ""), false, 2);
				//outStream.write(( Add[1]).getBytes());
				///printArabic(getAccurateText(object.getString("companyaddress"), 80, 1));

				}catch (Exception e) {

				}
			////outStream.write(getAccurateText(object.getString("arbcompanyname"), 80, 1).getBytes());
			//outStream.write(NewLine);
			//outStream.write(NewLine);
			
			
              if (object.has("companytaxregistrationnumber")){
				
				/*printArabic(getAccurateText("", 30, 1) + getAccurateText("VATIN : "+object.getString("companytaxregistrationnumber"), 80, 0)
				   +getAccurateText("", 60, 1)
		           +getAccurateText("*" + ArabicTEXT.taxdetail + "! ", 20, 2));*/
				 
					printheaders(getAccurateText("", 45, 1) +  getAccurateText("VATIN: "+object.getString("companytaxregistrationnumber"), 30, 0),true,2);
				//	outStream.write(NewLine);

			}
			
			if (type == 1) {
				outStream.write(BoldOn);
				outStream.write(DoubleWideOn);
				/*
				if (!object.getString("LANG").equals("en")) {

					if (object.getString("invoicepaymentterms").contains("2")) {
						printArabic(getAccurateText(
								"*" + ArabicTEXT.Creditinvoice + "! ", 40, 1));
						outStream.write(NewLine);
						printArabic(getAccurateText(
								"Invoice No. " + object.getString("invoicenumber"), 40, 1));

					} else if (object.getString("invoicepaymentterms").contains("0")
							|| object.getString("invoicepaymentterms").contains("1")) {
						printArabic(getAccurateText(
								"*" + ArabicTEXT.Cashinvoice + "! ", 40, 1));
						outStream.write(NewLine);
						printArabic(getAccurateText(
								"Invoice No" + object.getString("invoicenumber"), 40, 1));

					} else {
						outStream.write((getAccurateText(object.getString("INVOICETYPE"), 40, 1)).getBytes());
						outStream.write(NewLine);
						outStream.write((getAccurateText(
								"Invoice No" + object.getString("invoicenumber"), 40, 1)).getBytes());
					}

				} else {
					outStream.write((getAccurateText(object.getString("INVOICETYPE"), 40, 1)).getBytes());
					outStream.write(NewLine);
					outStream.write(DoubleWideOff);
					outStream.write(BoldOff);
					outStream.write(NewLine);
					outStream.write(BoldOn);
					outStream.write(DoubleWideOn);
					outStream.write((getAccurateText(
							"Invoice No. " + object.getString("invoicenumber"), 40, 1)).getBytes());
					outStream.write(DoubleWideOff);
					outStream.write(BoldOff);
				}
				*/
				printheaders(getAccurateText("TAX INVOICE  "+object.getString("invoicenumber"), 50, 2) ,true,2);
				
				// printArabic(getAccurateText("TAX INVOICE "+"*" + ArabicTEXT.taxInv + "! ", 60, 1));
					outStream.write(NewLine);
					//printheaders(getAccurateText("INVOICE NUMBER:"+object.getString("invoicenumber"), 35, 1) ,true,2);
					//printheaders(getAccurateText("Invoice No "+object.getString("invoicenumber")+" "+"*"  + ArabicTEXT.invNo + "! ", 40, 1) ,true,2);
					// printArabic(getAccurateText("Invoice No" + object.getString("invoicenumber")+" "+"*" + ArabicTEXT.invNo + "! ", 80, 1));
				//outStream.write(NewLine);
				//outStream.write(NewLine);
				outStream.write(BoldOff);
				outStream.write(DoubleWideOff);
	
				
			}else if (type == 2) {
				
				outStream.write(BoldOn);
				outStream.write(DoubleWideOn);
				if (!object.getString("LANG").equals("en")) {

					if (object.getString("invoicepaymentterms").contains("2")) {
						printArabic(getAccurateText(
								"*" + ArabicTEXT.Creditinvoice + "! ", 40, 1));
						outStream.write(NewLine);
						printArabic(getAccurateText(
								"Order No. " + object.getString("invoicenumber"), 40, 1));

					} else if (object.getString("invoicepaymentterms").contains("0")
							|| object.getString("invoicepaymentterms").contains("1")) {
						printArabic(getAccurateText(
								"*" + ArabicTEXT.Cashinvoice + "! ", 40, 1));
						outStream.write(NewLine);
						printArabic(getAccurateText(
								"Order No. " + object.getString("invoicenumber"), 40, 1));

					} else {
						outStream.write((getAccurateText(object.getString("INVOICETYPE"), 40, 1)).getBytes());
						outStream.write(NewLine);
						outStream.write((getAccurateText(
								"Order No. " + object.getString("invoicenumber"), 40, 1)).getBytes());
					}

				} else {
					outStream.write((getAccurateText(object.getString("INVOICETYPE"), 40, 1)).getBytes());
					outStream.write(NewLine);
					outStream.write(DoubleWideOff);
					outStream.write(BoldOff);
					outStream.write(NewLine);
					outStream.write(BoldOn);
					outStream.write(DoubleWideOn);
					outStream.write((getAccurateText(
							"Order No. " + object.getString("invoicenumber"), 40, 1)).getBytes());
					outStream.write(DoubleWideOff);
					outStream.write(BoldOff);
				}
				
				outStream.write(NewLine);
				outStream.write(NewLine);
				outStream.write(BoldOn);
			}
			/*
			outStream.write(NewLine);
			int paymenttype = Integer.parseInt(object.getString("ptype"));
			outStream.write(BoldOn);
			if(paymenttype==0){
				printheaders(getAccurateText("(CASH)", 20, 1) ,true,2);
			//	outStream.write((getAccurateText("(Cash)", 80, 1)).getBytes());
				outStream.write(NewLine);
			}else if(paymenttype==1){
				printheaders(getAccurateText("(CREDIT)", 20, 1) ,true,2);
				//outStream.write((getAccurateText("(Credit)", 80, 1)).getBytes());
				outStream.write(NewLine);
			}else if(paymenttype==2){
				//outStream.write((getAccurateText("(Cash/Credit)", 80, 1)).getBytes());
				printheaders(getAccurateText("(CASH/CREDIT)", 20, 1) ,true,2);
				outStream.write(NewLine);
			}
			outStream.write(BoldOff);
			*/
			outStream.write(NewLine);
				/*
				try {
					String[] parts = object.getString("CUSTOMER").split("\\-");
					outStream.write(("CUSTOMER: " + parts[0]).getBytes());
				} catch (Exception e) {
					e.printStackTrace();
			}*/
				outStream.write(("CUSTOMER: " + object.getString("CUSTOMER")).getBytes());
					outStream.write(NewLine);
					/*printArabic("          *" + parts[1] + "!");
					outStream.write(NewLine);*/
					outStream.write(BoldOff);
					//outStream.write(("ADDRESS: " + object.getString("ADDRESS")).getBytes());
					
					printArabic(getAccurateText("" + object.getString("ADDRESS1"), 40, 0)  +
							getAccurateText(
							"ROUTE:" + object.getString("ROUTE") , 40, 2));
					printArabic(getAccurateText("" + object.getString("ADDRESS2"), 40, 0)  
							+ getAccurateText(
							"SALESMAN:" +  object.getString("SALESMAN") + "-" + object.getString("CONTACTNO") , 40, 2));
					printArabic(getAccurateText("" + object.getString("ADDRESS3"), 40, 0) + getAccurateText(
							"SUPERVISOR:" + object.getString("supervisorname") + "-" + object.getString("supervisorno") , 40, 2));
					outStream.write(NewLine);
					//printArabic("          *" + object.getString("ARBADDRESS") + "!");
		


				
				if (object.has("taxregistrationnumber")){
					
				/*	printArabic(getAccurateText("VATIN" + object.getString("taxregistrationnumber"), 40, 0) + getAccurateText(
							"Trip ID" + object.getString("TourID"), 40, 2) + getAccurateText(" : ", 3, 0));*/
					printheaders(getAccurateText("VATIN: " + object.getString("taxregistrationnumber"), 40, 0)
								+ getAccurateText("INVOICE DATE:" + object.getString("DOC DATE") + " (" + object.getString("TIME") + ")", 40, 0)
								,true,2);
					outStream.write(NewLine);
					
				}
				
				printArabic(getAccurateText("TAX CARD NO: " + object.getString("TAXCARDNO"), 40, 0) + getAccurateText(
						"SUPPLY DATE :" + object.getString("DOC DATE") + " (" + object.getString("TIME") + ")", 40, 2));
				outStream.write(NewLine);
				
				String paymentdueDate = "";
				try {
				paymentdueDate = object.getString("PAYMENTDUEDATE");
				} catch (Exception e) {
					
				}
				
				
				printArabic(getAccurateText("CR NO: " + object.getString("CRNO"), 40, 0) + getAccurateText(
						"PAYMENT DUE DATE :" + paymentdueDate, 40, 2));
				outStream.write(NewLine);
				
				printArabic(getAccurateText("", 40, 0) + getAccurateText("ADVANCE PAYMENT DATE: N/A" , 40, 2));
				outStream.write(NewLine);
				
				

				/*
				printArabic(getAccurateText("ROUTE: " + object.getString("ROUTE"), 40, 0) + getAccurateText(
						"SALESMAN :" + object.getString("SALESMAN") + "-" + object.getString("CONTACTNO"), 40, 2));
				outStream.write(NewLine);
				

				printArabic(getAccurateText("PAYMENT DUE DATE: " + paymentdueDate, 40, 0) +getAccurateText("SUPERVISOR : " + object.getString("supervisorname") + "-" + object.getString("supervisorno"), 40, 2));
				*/
				//outStream.write(NewLine);

					//printArabic( getAccurateText("PAYMENT DUE DATE", 57, 2) + getAccurateText(" : ", 3, 0)+ getAccurateText(paymentdueDate, 10, 2));
					

				/*	printArabic(getAccurateText("DATE:" + object.getString("DOC DATE") + " (" + object.getString("TIME") + ")", 40, 0) + getAccurateText(
							"PAYMENT DUE DATE:" + object.getString("PAYMENTDUEDATE"), 40, 2));
			 */
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private void printArabic(String data) {
		try {
			if (data.indexOf("*") != -1 && data.indexOf("!") != -1) {
				String start = data.substring(0, data.indexOf("*"));
				String middle = data.substring(data.indexOf("*") + 1, data.indexOf("!"));
				String end = data.substring(data.indexOf("!") + 1, data.length());

				Log.e("start", start);
				Log.e("middle", middle);
				Log.e("end", end);

				Arabic6822 Arabic = null;
				Arabic = new Arabic6822();
				byte[] printbyte = Arabic.Convert(middle, true);

				outStream.write(start.getBytes());

				outStream.write(printbyte);
				outStream.write("  ".getBytes());
				if (end.indexOf("*") != -1 && end.indexOf("!") != -1) {
					String startbet = end.substring(0, end.indexOf("*"));
					String middlebet = end.substring(end.indexOf("*") + 1, end.indexOf("!"));
					String endbet = end.substring(end.indexOf("!") + 1, end.length());
					byte[] printmidbyte = Arabic.Convert(middlebet, true);
					outStream.write(startbet.getBytes());

					outStream.write(printmidbyte);
					outStream.write("  ".getBytes());
					outStream.write(endbet.getBytes());
				} else {
					outStream.write(end.getBytes());
				}

			} else {
				outStream.write(data.getBytes());

			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	private void headerprint(JSONObject object, int type) throws JSONException {
		try {

			outStream.write(BoldOn);
			printheaders(
					getAccurateText("ROUTE: " + object.getString("ROUTE"), 40, 0) + getAccurateText(
							"DATE:" + object.getString("DOC DATE") + " (" + object.getString("TIME") + ")", 40, 2),
					true, 1);
			outStream.write(NewLine);
			printheaders(getAccurateText("SALESMAN: " + object.getString("SALESMAN") + "", 40, 0)
					+ getAccurateText("SALESMAN NO: " + object.getString("CONTACTNO"), 40, 2), true, 1);

			outStream.write(NewLine);
			printheaders(getAccurateText("SUPERVISOR NAME:" + object.getString("supervisorname"), 40, 0)
					+ getAccurateText("SUPERVISOR NO: " + object.getString("supervisorno"), 40, 2), true, 1);

			if (type == 3 || type == 5 || type == 6 || type == 4 || type == 7) {

				printheaders((getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 40, 0)
						+ getAccurateText("TOUR ID:" + object.getString("TourID"), 40, 2)), false, 1);
			} else {

				printheaders((getAccurateText("TOUR ID:" + object.getString("TourID"), 80, 0)), false, 1);

			}
			outStream.write(BoldOff);
			outStream.write(NewLine);
			outStream.write(NewLine);

			if (type != 3 || type != 6 || type != 4 || type != 5 || type != 7) {
				if (object.has("invheadermsg") && object.getString("invheadermsg").length() > 0) {
					outStream.write(BoldOn);
					outStream.write(DoubleWideOn);
					printheaders(object.getString("invheadermsg"), false, 3);
					outStream.write(BoldOff);
					outStream.write(DoubleWideOff);

				}
			}
			// lp.newLine(2);

			if (type == 1) {
				outStream.write(BoldOn);
				outStream.write(DoubleWideOn);
				if (!object.getString("LANG").equals("en")) {

					if (object.getString("invoicepaymentterms").contains("2")) {
						printheaders(getAccurateText(
								"*" + ArabicTEXT.Creditinvoice + "!:" + object.getString("invoicenumber"), 40, 1), true,
								2);

					} else if (object.getString("invoicepaymentterms").contains("0")
							|| object.getString("invoicepaymentterms").contains("1")) {
						printheaders(
								getAccurateText("*" + ArabicTEXT.Cashinvoice + "!:" + object.getString("invoicenumber"),
										40, 1),
								true, 2);

					} else {
						printheaders((getAccurateText(object.getString("INVOICETYPE"), 40, 1)), false, 2);
					}

				} else {
					printheaders((getAccurateText(object.getString("INVOICETYPE"), 40, 1)), false, 2);
				}
				outStream.write(DoubleWideOff);
				outStream.write(BoldOff);
				outStream.write(NewLine);
				outStream.write(NewLine);

				outStream.write(BoldOn);
				try {
					String[] parts = object.getString("CUSTOMER").split("\\-");
					printheaders(("CUSTOMER: " + parts[0] + ""), false, 2);
					outStream.write(NewLine);
					printheaders(("          *" + parts[1] + "!"), true, 1);
				} catch (Exception e) {
					e.printStackTrace();
				}
				try {
					outStream.write(NewLine);
					outStream.write(BoldOff);
					printheaders(("ADDRESS: " + object.getString("ADDRESS") + ""), false, 1);
					outStream.write(NewLine);
					printheaders(("          *" + object.getString("ARBADDRESS") + "!"), true, 1);
					outStream.write(NewLine);
				} catch (Exception e) {
					e.printStackTrace();
				}
		

				count++;

			} else if (type == 2) {
				outStream.write(BoldOn);
				outStream.write(DoubleWideOn);
				if (!object.getString("LANG").equals("en")) {
					printheaders(
							getAccurateText("*" + ArabicTEXT.Receipt + "!:" + object.getString("RECEIPT") + "", 40, 1),
							true, 2);

				} else {
					printheaders(getAccurateText("RECEIPT: " + object.getString("RECEIPT"), 40, 1), false, 2);
				}
				outStream.write(DoubleWideOff);
				outStream.write(BoldOff);
				outStream.write(NewLine);
				outStream.write(NewLine);
				outStream.write(BoldOn);
				printheaders("CUSTOMER: " + object.getString("CUSTOMER") + "", true, 1);

				outStream.write(NewLine);
				outStream.write(BoldOff);
				printheaders("ADDRESS :" + object.getString("ADDRESS") + "", true, 1);
				outStream.write(NewLine);
				outStream.write(NewLine);

			} else if (type == 3) {
				outStream.write(BoldOn);
				outStream.write(DoubleWideOn);
				printheaders(getAccurateText("DEPOSIT SUMMARY", 40, 1), false, 3);
				outStream.write(DoubleWideOff);
				outStream.write(BoldOff);
				outStream.write(NewLine);
				outStream.write(NewLine);
				count++;
			} else if (type == 4) {

				outStream.write(BoldOn);
				outStream.write(DoubleWideOn);
				printheaders(getAccurateText("SALES SUMMARY", 40, 1), false, 1);
				outStream.write(DoubleWideOff);
				outStream.write(BoldOff);
				outStream.write(NewLine);
				outStream.write(NewLine);
			} else if (type == 5) {
				outStream.write(BoldOn);
				outStream.write(DoubleWideOn);
				printheaders(getAccurateText("ROUTE ACTIVITY LOG", 40, 1), false, 1);
				outStream.write(DoubleWideOff);
				outStream.write(BoldOff);
				outStream.write(NewLine);
				outStream.write(NewLine);
			} else if (type == 6) {
				outStream.write(BoldOn);
				outStream.write(DoubleWideOn);
				printheaders(getAccurateText("ROUTE SUMMARY", 40, 1), false, 1);
				outStream.write(DoubleWideOff);
				outStream.write(BoldOff);
				outStream.write(NewLine);
				outStream.write(NewLine);
			} else if (type == 7) {
				outStream.write(BoldOn);
				outStream.write(DoubleWideOn);
				printheaders(getAccurateText("DAMAGE/EXPIRY SUMMARY", 40, 1), false, 3);
				outStream.write(DoubleWideOff);
				outStream.write(BoldOff);
				outStream.write(NewLine);
				outStream.write(NewLine);

			} else if (type == 8) {
				outStream.write(BoldOn);
				printheaders(("CUSTOMER: " + object.getString("CUSTOMER") + ""), false, 2);
				outStream.write(NewLine);
				outStream.write(BoldOff);

				outStream.write(BoldOn);
				outStream.write(DoubleWideOn);
				//printheaders(getAccurateText("AGING ANALYSIS", 40, 1), false, 3); // sujee commented 
				printheaders(getAccurateText("CUSTOMER BALANCE", 40, 1), false, 3);
				outStream.write(DoubleWideOff);
				outStream.write(BoldOff);
				outStream.write(NewLine);
				outStream.write(NewLine);

			}else if (type == 9) {


				outStream.write(BoldOn);
				outStream.write(DoubleWideOn);
				printheaders(getAccurateText("VAN SETTELMENT REPORT", 40, 1), false, 3);
				outStream.write(DoubleWideOff);
				outStream.write(BoldOff);
				outStream.write(NewLine);
				outStream.write(NewLine);

			}

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private void printheaders(String line, boolean isArabic, int pluscount) {

		if (!isArabic) {

			try {
				outStream.write(line.getBytes());
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		} else {

			printArabic(line);
		}
		count = count + pluscount;
	}

	// Header inventory Start
	private void headerinvprint(JSONObject object, int invtype) throws JSONException {
		try {
			outStream.write(BoldOn);
			printheaders(
					getAccurateText("ROUTE: " + object.getString("ROUTE"), 40, 0) + getAccurateText(
							"DATE:" + object.getString("DOC DATE") + " (" + object.getString("TIME") + ")", 40, 2),
					true, 1);
			outStream.write(NewLine);
			printheaders(getAccurateText("SALESMAN: " + object.getString("SALESMAN") + "", 40, 0)
					+ getAccurateText("SALESMAN NO: " + object.getString("CONTACTNO"), 40, 2), false, 1);

			outStream.write(NewLine);
			try {
				printheaders(
						(getAccurateText("DOCUMENT NO: " + object.getString("DOCUMENT NO"), 40, 0)
								+ getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 40, 2)),
						false, 1);
				outStream.write(NewLine);
			} catch (Exception e) {

				e.printStackTrace();
			}
			printheaders(getAccurateText("SUPERVISOR NAME:" + object.getString("supervisorname"), 40, 0)
					+ getAccurateText("SUPERVISOR NO: " + object.getString("supervisorno"), 40, 2), true, 1);
			outStream.write(NewLine);
			printheaders(getAccurateText("TOUR ID:" + object.getString("TourID"), 80, 0), false, 2);
			outStream.write(BoldOff);
			outStream.write(NewLine);
			outStream.write(NewLine);
			outStream.write(BoldOn);
			outStream.write(DoubleWideOn);
			if (invtype == 1) {
				printheaders(getAccurateText("NEW LOAD SUMMARY - LOAD: " + object.getString("Load Number"), 40, 1),
						false, 1);
			} else if (invtype == 2) {
				printheaders(getAccurateText("LOAD TRANSFER SUMMARY", 40, 1), false, 1);
			} else if (invtype == 3) {
				printheaders(getAccurateText("END INVENTORY SUMMARY", 40, 1), false, 2);
			} else if (invtype == 5) {
				printheaders(getAccurateText("LOAD REQUEST", 40, 1), false, 1);
			} else if (invtype == 6) {
				printheaders(getAccurateText("COMPANY CREDIT SUMMARY", 40, 1), false, 1);
			}

			outStream.write(DoubleWideOff);
			outStream.write(BoldOff);
			outStream.write(NewLine);
			outStream.write(NewLine);
			if (invtype == 2) {
				JSONArray jData = object.getJSONArray("data");
				if (jData.getJSONObject(0).getJSONArray("DATA").length() > 0
						&& (jData.getJSONObject(1).getJSONArray("DATA").length() > 0
								|| jData.getJSONObject(2).getJSONArray("DATA").length() > 0)) {
					printheaders(getAccurateText("FROM & TO ROUTE: " + object.getString("TO ROUTE"), 80, 0), false, 1);
					outStream.write(NewLine);

				} else if (jData.getJSONObject(0).getJSONArray("DATA").length() > 0) {
					printheaders(getAccurateText("FROM ROUTE: " + object.getString("TO ROUTE"), 80, 0), false, 1);
					outStream.write(NewLine);

				} else if (jData.getJSONObject(1).getJSONArray("DATA").length() > 0) {
					printheaders(getAccurateText("TO ROUTE: " + object.getString("TO ROUTE"), 80, 0), false, 1);
					outStream.write(NewLine);

				} else if (jData.getJSONObject(2).getJSONArray("DATA").length() > 0) {
					printheaders(getAccurateText("TO ROUTE: " + object.getString("TO ROUTE"), 80, 0), false, 1);
					outStream.write(NewLine);

				}

			}
			if (invtype == 5) {
				// JSONArray jData = object.getJSONArray("data");
				// if (jData.getJSONObject(0).getJSONArray("DATA").length() > 0
				// && (jData.getJSONObject(1).getJSONArray("DATA").length() > 0
				// || jData.getJSONObject(2).getJSONArray("DATA").length() > 0))
				{
					printheaders(getAccurateText("Requested Delivery Date : " + object.getString("Requestdate"), 80, 0),
							false, 1);
					outStream.write(NewLine);
					outStream.write(NewLine);

				}

			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private void headervanstockprint(JSONObject object, int type) throws JSONException {
		try {
			outStream.write(BoldOn);
			printheaders(
					getAccurateText("ROUTE: " + object.getString("ROUTE"), 40, 0) + getAccurateText(
							"DATE:" + object.getString("DOC DATE") + " (" + object.getString("TIME") + ")", 40, 2),
					true, 1);
			outStream.write(NewLine);
			printheaders(getAccurateText("SALESMAN: " + object.getString("SALESMAN") + "", 40, 0)
					+ getAccurateText("SALESMAN NO: " + object.getString("CONTACTNO"), 40, 2), true, 1);

			outStream.write(NewLine);
			printheaders(getAccurateText("SUPERVISOR NAME:" + object.getString("supervisorname"), 40, 0)
					+ getAccurateText("SUPERVISOR NO: " + object.getString("supervisorno"), 40, 2), true, 1);
			outStream.write(NewLine);
			printheaders(getAccurateText("TOUR ID:" + object.getString("TourID"), 80, 0), false, 2);
			outStream.write(BoldOff);
			outStream.write(NewLine);
			outStream.write(NewLine);
			count = count + 1;
			if (type == 4) {
				outStream.write(BoldOn);
				outStream.write(DoubleWideOn);
				printheaders(getAccurateText("VAN STOCK SUMMARY ", 40, 1), false, 1);
				outStream.write(DoubleWideOff);
				outStream.write(BoldOff);
			} else if (type == 10) {
				outStream.write(BoldOn);
				outStream.write(DoubleWideOn);
				printheaders(getAccurateText("ITEM SALES SUMMARY ", 40, 1), false, 1);
				outStream.write(DoubleWideOff);
				outStream.write(BoldOff);
			} else if (type == 6) {
				outStream.write(BoldOn);
				outStream.write(DoubleWideOn);
				printheaders(getAccurateText("COMPANY CREDIT SUMMARY", 40, 1), false, 1);
				outStream.write(DoubleWideOff);
				outStream.write(BoldOff);

			} else if (type == 25) {
				outStream.write(BoldOn);
				outStream.write(DoubleWideOn);

				printheaders(getAccurateText("TEMPORARY CREDIT SUMMARY", 40, 1), false, 1);
				outStream.write(DoubleWideOff);
				outStream.write(BoldOff);
			}
			outStream.write(NewLine);
			outStream.write(NewLine);

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	private void headerRequestprint(JSONObject object) throws JSONException {
		try {
			outStream.write(BoldOn);
			outStream.write((getAccurateText("ROUTE: " + object.getString("ROUTE"), 40, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 40, 2)).getBytes());
			outStream.write((getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 40, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 40, 2)).getBytes());
			outStream.write((getAccurateText("DOCUMENT NO: " + object.getString("DOCUMENT NO"), 40, 0)
					+ getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 40, 2)).getBytes());
			outStream.write(BoldOff);
			outStream.write(NewLine);
			outStream.write(NewLine);
			outStream.write(BoldOn);
			outStream.write(DoubleWideOn);
			outStream.write(getAccurateText("LOAD REQUEST", 40, 1).getBytes());
			outStream.write(DoubleWideOff);
			outStream.write(BoldOff);
			outStream.write(NewLine);
			outStream.write(NewLine);

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	// End
	// Printing Line
	private void line(int ln) {
		for (int i = 0; i < ln; i++) {
			// if(i%2==0){
			// try {
			// Thread.sleep(1000);
			// // lp.flush()
			// } catch (InterruptedException e) {
			// // TODO Auto-generated catch block
			// e.printStackTrace();
			// }
			//
			// }
			try {
				outStream.write(NewLine);
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}

	//

	public void pairDevice(BluetoothDevice device, boolean clearSystemNotification) {
		String ACTION_PAIRING_REQUEST = "android.bluetooth.device.action.PAIRING_REQUEST";
		Intent intent = new Intent(ACTION_PAIRING_REQUEST);
		String EXTRA_DEVICE = "android.bluetooth.device.extra.DEVICE";
		intent.putExtra(EXTRA_DEVICE, device);
		String EXTRA_PAIRING_VARIANT = "android.bluetooth.device.extra.PAIRING_VARIANT";
		int PAIRING_VARIANT_PIN = 1234;
		intent.putExtra(EXTRA_PAIRING_VARIANT, PAIRING_VARIANT_PIN);
		intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		this.cordova.getActivity().startActivity(intent);
		if (clearSystemNotification) {
			clearSystemNotification();
		}

	}

	// -----------------------------------------------------------
	private BroadcastReceiver myReceiver = new BroadcastReceiver() {
		@Override
		public void onReceive(Context context, Intent intent) {
			Message msg = Message.obtain();
			String action = intent.getAction();
			if (BluetoothDevice.ACTION_FOUND.equals(action)) {
				Toast.makeText(context, "ACTION_FOUND", Toast.LENGTH_SHORT).show();

				BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);

				if (arrayListBluetoothDevices.size() < 1) // this checks if the
															// size of bluetooth
															// device is 0,then
															// add the
				{ // device to the arraylist.
					detectedAdapter.add(device.getName() + "\n" + device.getAddress());
					arrayListBluetoothDevices.add(device);
					detectedAdapter.notifyDataSetChanged();
				} else {
					boolean flag = true; // flag to indicate that particular
											// device is already in the arlist
											// or not
					for (int i = 0; i < arrayListBluetoothDevices.size(); i++) {
						if (device.getAddress().equals(arrayListBluetoothDevices.get(i).getAddress())) {
							flag = false;
						}
					}
					if (flag == true) {
						detectedAdapter.add(device.getName() + "\n" + device.getAddress());
						arrayListBluetoothDevices.add(device);
						detectedAdapter.notifyDataSetChanged();
					}
				}
			}
		}
	};
	private final BroadcastReceiver mReceiverRequiresPin = new BroadcastReceiver() {

		@Override
		public void onReceive(Context context, Intent intent) {

			try {
				BluetoothDevice newDevice = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
				Class<?> btDeviceInstance = Class.forName(BluetoothDevice.class.getCanonicalName());

				Method convert = btDeviceInstance.getMethod("convertPinToBytes", String.class);

				byte[] pin = (byte[]) convert.invoke(newDevice, "1234");

				Method setPin = btDeviceInstance.getMethod("setPin", byte[].class);
				boolean success = (Boolean) setPin.invoke(newDevice, pin);

				Log.e("Success", "success" + success);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	};
	// -----------------------------------------------------------
	private NotificationManager notificationManager = null;

	public void clearSystemNotification() {
		try {
			if (notificationManager == null) {
				notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
			}
			notificationManager.cancel(android.R.drawable.stat_sys_data_bluetooth);
		} catch (Exception e) {
		}
	}

	private NotificationManager getSystemService(String notificationService) {
		// TODO Auto-generated method stub
		return null;
	}

	private final BroadcastReceiver mPairReceiver = new BroadcastReceiver() {
		public void onReceive1(Context context, Intent intent) {
			String action = intent.getAction();

			if (BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(action)) {
				final int state = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, BluetoothDevice.ERROR);
				final int prevState = intent.getIntExtra(BluetoothDevice.EXTRA_PREVIOUS_BOND_STATE,
						BluetoothDevice.ERROR);

				if (state == BluetoothDevice.BOND_BONDED && prevState == BluetoothDevice.BOND_BONDING) {
					// showToast("Paired");
					Toast t = Toast.makeText(cordova.getActivity().getApplicationContext(), "Paired",
							Toast.LENGTH_SHORT);
					t.show();
				} else if (state == BluetoothDevice.BOND_NONE && prevState == BluetoothDevice.BOND_BONDED) {
					// showToast("Unpaired");
					Toast t = Toast.makeText(cordova.getActivity().getApplicationContext(), "Unpaired",
							Toast.LENGTH_SHORT);
					t.show();
				}

			}
		}

		@Override
		public void onReceive(Context arg0, Intent arg1) {
			// TODO Auto-generated method stub

		}
	};

	//
	private void printconnect(String... args) {
		String sMacAddr = args[0];
		try {

			// ------------Start
			// Get Mac Add

			if (sMacAddr.contains(":") == false && sMacAddr.length() == 12) {
				// If the MAC address only contains hex digits without the
				// ":" delimiter, then add ":" to the MAC address string.
				char[] cAddr = new char[17];
				for (int i = 0, j = 0; i < 12; i += 2) {
					sMacAddr.getChars(i, i + 2, cAddr, j);
					j += 2;
					if (j < 17) {
						cAddr[j++] = ':';
					}
				}

				sMacAddr = new String(cAddr);
			}

			// String sPrinterURI = "bt://00:13:E0:D6:B2:3F";
			String sResult = null;
			String sPrinterURI = "bt://" + sMacAddr;
			BluetoothDevice device = mBtAdapter.getRemoteDevice(sMacAddr);

			try {

				btSocket = device.createRfcommSocketToServiceRecord(MY_UUID);// works
																				// on
																				// lenovo
				devicename = device.getName();

			} catch (IOException e) {
				Toast t = Toast.makeText(cordova.getActivity().getApplicationContext(), "Socket create failed",
						Toast.LENGTH_SHORT);
				t.show();
				// return address[0] +"\nSocket create failed\n";
			} catch (IllegalArgumentException ioe) {
				Toast t = Toast.makeText(cordova.getActivity().getApplicationContext(),
						"is not a valid Bluetooth Address", Toast.LENGTH_SHORT);
				t.show();
				// return "is not a valid Bluetooth Address";
			}

			// btSocket =
			// device.createInsecureRfcommSocketToServiceRecord(MY_UUID); //
			// doesn't work on lenovo
			// --------
			int numtries = 0;
			int maxretry = 4;
			while (numtries < maxretry) {
				try {
					Thread.sleep(4000);
					btSocket.connect();
					if (device.getBondState() == BluetoothDevice.BOND_NONE) {
						pairDevice(mBtAdapter.getRemoteDevice(sMacAddr), true);
					}
					// final String actionPinRequested =
					// "android.bluetooth.device.action.PAIRING_REQUEST";
					// IntentFilter intentFilterPinRequested = new
					// IntentFilter(actionPinRequested);
					// this.cordova.getActivity().registerReceiver(mReceiverRequiresPin,
					// intentFilterPinRequested);
					// IntentFilter intent = new
					// IntentFilter(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
					// registerReceiver(mPairReceiver, intent);
					// Intent intent = null;
					// final String actionPinRequested =
					// "android.bluetooth.device.action.PAIRING_REQUEST";
					// IntentFilter intentFilterPinRequested = new IntentFilter(
					// actionPinRequested);

					// DotmatHelper.this.registerReceiver(mReceiverRequiresPin,
					// intentFilterPinRequested);

					outStream = btSocket.getOutputStream(); // Connects to the
															// printer
					break;
				} catch (IOException e) {
					// btSocket.close();
					numtries++;
					// Thread.sleep(2000);
					Toast t = Toast.makeText(cordova.getActivity().getApplicationContext(),
							"Error connecting to Socket", Toast.LENGTH_SHORT);
					// t.show();
					// return address[0] +"\n"+devicename+
					// "\nError connecting to Socket\n";

				}
			}
			/*
			 * if (numtries == maxretry) {
			 * 
			 * btSocket.connect(); if(device.getBondState() ==
			 * BluetoothDevice.BOND_NONE) {
			 * pairDevice(mBtAdapter.getRemoteDevice(sMacAddr),true); }
			 * outStream = btSocket.getOutputStream();
			 * 
			 * }
			 */

			// --------

		} catch (Exception e) {

			// TODO Auto-generated catch block
			// pairDevice(mBtAdapter.getRemoteDevice(sMacAddr),true);

			e.printStackTrace();
			try {

				status.put("status", false);
				status.put("isconnected", -2);
			} catch (JSONException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}

			sendUpdate(status, true);
		}
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

}
