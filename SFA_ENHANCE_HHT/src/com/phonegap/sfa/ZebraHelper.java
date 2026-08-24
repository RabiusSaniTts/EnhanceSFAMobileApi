package com.phonegap.sfa;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Set;

import org.apache.cordova.api.LOG;
import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.AlertDialog;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.DialogInterface;
import android.graphics.Color;
import android.os.Looper;
import android.util.Log;
import android.widget.Toast;

import com.zebra.android.comm.BluetoothPrinterConnection;
import com.zebra.android.comm.ZebraPrinterConnection;
import com.zebra.android.comm.ZebraPrinterConnectionException;
import com.zebra.android.printer.PrinterLanguage;
import com.zebra.android.printer.ZebraPrinter;

public class ZebraHelper extends Plugin {
	private JSONObject status;
	private ZebraPrinterConnection zebraPrinterConnection;

	private ZebraPrinter printer;
	private HashMap<String, Integer> hashValues;
	private HashMap<String, Integer> hashPositions;
	private JSONArray jArr;
	String resolution = "";
	String strFormat, strFormatBold, strFormatHeader, strFormatTitle, strPrintLeftBold, strUnderLine;
	private BluetoothAdapter mBtAdapter;
	private String callbackId = "";
	private ArrayList<DevicesData> arrData;
	private boolean isExceptionThrown = false;
	private String currentMacAddress = "";

	@Override
	public PluginResult execute(String request, JSONArray querystring, String callbackId) {
		// TODO Auto-generated method stub
		try {
			status = new JSONObject();
			status.put("status", true);
			this.jArr = querystring;
			arrData = new ArrayList<DevicesData>();
			this.callbackId = callbackId;
			strFormat = cordova.getActivity().getString(R.string.strPrint);
			strFormatBold = cordova.getActivity().getString(R.string.strPrintBold);
			strFormatHeader = cordova.getActivity().getString(R.string.strPrintHeader);
			strFormatTitle = cordova.getActivity().getString(R.string.strPrintTitle);
			strPrintLeftBold = cordova.getActivity().getString(R.string.strPrintLeftBold);
			strUnderLine = cordova.getActivity().getString(R.string.strFormatUnderLine);

			this.print();

		} catch (Exception e) {
			e.printStackTrace();
		} finally {

		}

		return new PluginResult(PluginResult.Status.OK, status);

	}

	public void print() {

		Looper.prepare();
		mBtAdapter = BluetoothAdapter.getDefaultAdapter();

		// Get a set of currently paired devices
		Set<BluetoothDevice> pairedDevices = mBtAdapter.getBondedDevices();
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
		Looper.loop();
		/*
		 * if (mBtAdapter.isDiscovering()) { mBtAdapter.cancelDiscovery(); } // Request
		 * discover from BluetoothAdapter mBtAdapter.startDiscovery();
		 */

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

							doConnectionTest(arrData.get(which).getAddress());

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

			PluginResult result = new PluginResult(PluginResult.Status.OK, obj);
			// result.setKeepCallback(keepCallback);
			this.success(result, this.callbackId);
		}
	}

	@Override
	public void onDestroy() {
		// TODO Auto-generated method stub
		super.onDestroy();
		if (zebraPrinterConnection != null && zebraPrinterConnection.isConnected()) {
			disconnect();
		}
	}

	private void doConnectionTest(String address) throws JSONException {
		try {
			Thread.sleep(2000);
			printer = connect(address);
		} catch (InterruptedException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

		if (printer != null) {
			// print();

			// for Load Request
			try {
				currentMacAddress = address;
				printReports();
			} catch (Exception e) {
				e.printStackTrace();
			}

		} else {

		}
	}

	public String convertStreamToString(InputStream is) throws Exception {

		BufferedReader reader = new BufferedReader(new InputStreamReader(is, "iso-8859-1"));
		StringBuilder sb = new StringBuilder();
		String line = null;
		while ((line = reader.readLine()) != null) {
			sb.append(line + "\n");
		}
		is.close();
		return sb.toString();
	}

	public ZebraPrinter connect(String address) throws JSONException {
		setStatus("Connecting...", Color.YELLOW);
		zebraPrinterConnection = null;
		zebraPrinterConnection = new BluetoothPrinterConnection(address);
		// SettingsHelper.saveBluetoothAddress(ctx, "00:22:58:02:1E:27");
		// try {
		// int port = Integer.parseInt(getTcpPortNumber());
		// zebraPrinterConnection = new TcpPrinterConnection(getTcpAddress(),
		// port);
		// SettingsHelper.saveIp(this, getTcpAddress());
		// SettingsHelper.savePort(this, getTcpPortNumber());
		// } catch (NumberFormatException e) {
		// setStatus("Port Number Is Invalid", Color.RED);
		// return null;
		// }

		try {
			zebraPrinterConnection.open();
			setStatus("Connected", Color.GREEN);
		} catch (ZebraPrinterConnectionException e) {
			setStatus("Comm Error! Disconnecting", Color.RED);
			status.put("status", false);
			status.put("isconnected", -3);
			sendUpdate(status, true);

		}

		ZebraPrinter printer = null;

		if (zebraPrinterConnection.isConnected()) {
			try {
				// printer =
				// ZebraPrinterFactory.getInstance(zebraPrinterConnection);
				printer = new com.zebra.android.printer.internal.ZebraPrinterCpcl(zebraPrinterConnection);
				setStatus("Determining Printer Language", Color.YELLOW);
				PrinterLanguage pl = printer.getPrinterControlLanguage();
				setStatus("Printer Language " + pl, Color.BLUE);
			} catch (Exception e) {
				printer = null;
				if (zebraPrinterConnection != null && zebraPrinterConnection.isConnected()) {
					disconnect();
				}
			}
			// } catch (ZebraPrinterConnectionException e) {
			// setStatus("Unknown Printer Language", Color.RED);
			// printer = null;
			//
			// //disconnect();
			// } catch (ZebraPrinterLanguageUnknownException e) {
			// setStatus("Unknown Printer Language", Color.RED);
			// // printer = null;
			//
			//
			// }
		}

		return printer;
	}

	private void setStatus(final String statusMessage, final int color) {
		Log.d("INFO ZEBRA", statusMessage);
	}

	public void disconnect() {
		try {
			Toast t = Toast.makeText(cordova.getActivity().getApplicationContext(), "Disconnect 2", Toast.LENGTH_SHORT);
			t.show();
			setStatus("Disconnecting", Color.RED);
			if (zebraPrinterConnection != null) {
				zebraPrinterConnection.close();
				Toast t1 = Toast.makeText(cordova.getActivity().getApplicationContext(), "Disconnect 1",
						Toast.LENGTH_SHORT);
				t1.show();
			}
			setStatus("Not Connected", Color.RED);
		} catch (ZebraPrinterConnectionException e) {
			Toast t2 = Toast.makeText(cordova.getActivity().getApplicationContext(), "Disconnect 3",
					Toast.LENGTH_SHORT);
			t2.show();
			setStatus("COMM Error! Disconnected", Color.RED);
		} finally {

		}
	}

	void printReports() {
		try {

			PrinterLanguage printerLanguage = printer.getPrinterControlLanguage();
			byte[] configLabel = null;
			byte[] duplicateLabel = null;
			boolean isTwice = false;
			if (printerLanguage == PrinterLanguage.ZPL) {
				configLabel = "^XA^FO17,16^GB379,371,8^FS^FT65,255^A0N,135,134^FDTEST^FS^XZ".getBytes();
			} else if (printerLanguage == PrinterLanguage.CPCL) {
				try {

					// Log.d("In printer Plugin", "Plugin");
					// InputStream isRequest = cordova.getActivity()
					// .getResources().openRawResource(R.raw.transferout);
					// String jsonString = convertStreamToString(isRequest);
					// jArr = new JSONArray(jsonString);
					for (int j = 0; j < jArr.length(); j++) {
						JSONArray jInner = jArr.getJSONArray(j);

						for (int i = 0; i < jInner.length(); i++) {

							configLabel = null;
							duplicateLabel = null;
							isTwice = false;
							JSONObject jDict = jInner.getJSONObject(i);
							String request = jDict.getString("name");
							JSONObject jsnData = jDict.getJSONObject("mainArr");
							if (request.equalsIgnoreCase("Transfer_In")) {
								// Checked
								configLabel = parseLoadTransferResponse(jsnData);
							} else if (request.equalsIgnoreCase("Transfer_Out")) {
								// Checked
								configLabel = parseLoadTransferResponse(jsnData);
							} else if (request.equalsIgnoreCase("LoadSummary")) {
								// Checked
								configLabel = parseLoadSummaryResponse(jsnData);
							} else if (request.equalsIgnoreCase("LoadSummary2")) {
								// Checked
								configLabel = parseLoadSummary2Response(jsnData);
							} else if (request.equalsIgnoreCase("Sales")) {
								int companyTaxStng = Integer.parseInt(jsnData.getString("enabletax"));

								if (companyTaxStng == 1) {

									configLabel = printSalesTaxReport(jsnData, false);
								} else {

									configLabel = printSalesReport(jsnData, false);
								}

								if (jsnData.getString("isTwice").equals("1")) {
									isTwice = true;
									/*
									 * duplicateLabel = printSalesReport(jsnData, true);
									 */
									if (companyTaxStng == 1) {

										duplicateLabel = printSalesTaxReport(jsnData, true);
									} else {

										duplicateLabel = printSalesReport(jsnData, true);
									}

								}

							} else if (request.equalsIgnoreCase("SalesReport")) {
								configLabel = printSalesSummaryReport(jsnData);
							} else if (request.equalsIgnoreCase("Deposit")) {
								configLabel = parseDepositResponse(jsnData);
							} else if (request.equalsIgnoreCase("DepositSlip")) {
								configLabel = parseDepositSlipResponse(jsnData);

							} else if (request.equalsIgnoreCase("DepositDeductionSlip")) {
								configLabel = parseDepositCashDeductionResponse(jsnData);

							} else if (request.equalsIgnoreCase("UnloadDamage")) {
								configLabel = parseUnloadResponse(jsnData);
							} else if (request.equalsIgnoreCase("Collection")) {
								configLabel = parseCollectionResponse(jsnData);
							} else if (request.equalsIgnoreCase("EndInventory")) {
								// Checked
								configLabel = parseEndInventory(jsnData);
							} else if (request.equalsIgnoreCase("RouteActivity")) {
								// Checked
								configLabel = printRouteactivityReport(jsnData);
							} else if (request.equalsIgnoreCase("RouteSummary")) {
								// Checked
								configLabel = printRouteSummaryReport(jsnData);
							} else if (request.equalsIgnoreCase("VanStock")) {
								// Checked
								configLabel = printVanStockReport(jsnData);
							} else if (request.equalsIgnoreCase("EndInventoryReport")) {
								// Checked
								configLabel = parseEndInventory(jsnData);
							} else if (request.equalsIgnoreCase("VanStockReport")) {
								// Checked
								configLabel = printVanStockReport(jsnData);
							} else if (request.equalsIgnoreCase("LoadRequst")) {
								// Checked
								configLabel = printLoadRequestReport(jsnData);
							} else if (request.equalsIgnoreCase("CreditSummary")) {
								// Checked
								configLabel = printCreditSummaryreport(jsnData, true);
							} else if (request.equalsIgnoreCase("CreditTempSummary")) {
								// Checked
								configLabel = printCreditSummaryreport(jsnData, false);
							} else if (request.equalsIgnoreCase("AdvancePayment")) {
								// Checked
								configLabel = parseAdvancePaymentResponse(jsnData);
							} else if (request.equalsIgnoreCase("AgingAnalysis")) {
								configLabel = parseAgingAnalysisResponse(jsnData);
							}

						}

						zebraPrinterConnection.write(configLabel);
						if (isTwice) {
							zebraPrinterConnection.write(duplicateLabel);
						}
					}
					Log.d("Print Report", "" + jArr.toString());

					setStatus("Sending Data", Color.BLUE);

					if (zebraPrinterConnection instanceof BluetoothPrinterConnection) {
						String friendlyName = ((BluetoothPrinterConnection) zebraPrinterConnection).getFriendlyName();
						setStatus(friendlyName, Color.MAGENTA);

					}
				} catch (ZebraPrinterConnectionException e) {
					e.printStackTrace();
				} finally {
					if (zebraPrinterConnection != null && zebraPrinterConnection.isConnected()) {
						disconnect();
						status.put("status", true);
						status.put("isconnected", 0);
						status.put("btaddress", currentMacAddress);
						sendUpdate(status, true);
					}

				}
			}

		} catch (Exception e) {
			setStatus(e.getMessage(), Color.RED);
		}

	}

	byte[] parseLoadTransferResponse1(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {

			s1.append(String.format(strFormatHeader, 0, getAccurateText("bjvbsvxbvxbvxbvmxvmxvbxmvbmxvmxvmxv", 30, 1))
					+ "\n");

			s1.append(String.format(strFormat, 60, getAccurateText(
					"bjvbsvxbvxbvxbvmxvmxvbxmvbmxvmxvmxvbmxvbmxvmxvmxvmxvmxmxbmxvbmxvmxfsfsfsjgjsbgjsbgjsbgjsgbsjgbsjgbsjgbsj",
					93, 1)) + "\n");
			s1.append(String.format(strFormatBold, 90, getAccurateText(
					"bjvbsvxbvxbvxbvmxvmxvbxmvbmxvmxvmxvbmxvbmxvmxvmxvmxvmxmxbmxvbmxvmxfsfsfsjgjsbgjsbgjsbgjsgbsjgbsjgbsjgbsj",
					53, 1)) + "\n");
			s1.append(String.format(strFormatBold, 150, getAccurateText(
					"bjvbsvxbvxbvxbvmxvmxvbxmvbmxvmxvmxvbmxvbmxvmxvmxvmxvmxmxbmxvbmxvmxfsfsfsjgjsbgjsbgjsbgjsgbsjgbsjgbsjgbsj",
					53, 1)) + "\n");
			s1.append(String.format(strFormatTitle, 180, getAccurateText(
					"bjvbsvxbvxbvxbvmxvmxvbxmvbmxvmxvmxvbmxvbmxvmxvmxvmxvmxmxbmxvbmxvmxfsfsfsjgjsbgjsbgjsbgjsgbsjgbsjgbsjgbsj",
					53, 1)) + "\n");
			s1.append("\nPRINT\n");
			// s1.insert(0,
			// "! 0 "+position+" "+position+" "+(position+10)+" 1\n");

			s1.insert(0, "! 0 200 200 210 1\n");
			Log.d("Final String", "" + String.valueOf(s1));

		} catch (Exception e) {
			e.printStackTrace();
		}

		return String.valueOf(s1).getBytes();
	}

	byte[] parseLoadTransferResponse(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Sl#", 4);
			hashValues.put("Item#", 11);
			hashValues.put("Description", 30);
			hashValues.put("UPC", 4);
			// hashValues.put("Van Qty", 9);
			hashValues.put("Transfer Qty", 14);
			hashValues.put("Qty", 13);
			/*
			 * hashValues.put("Net Qty", 7); hashValues.put("Value", 9);
			 */

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Sl#", 0);
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("UPC", 0);
			// hashPositions.put("Van Qty", 2);
			hashPositions.put("Transfer Qty", 2);
			hashPositions.put("Qty", 2);
			/*
			 * hashPositions.put("Net Qty", 2); hashPositions.put("Value", 2);
			 */

			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}

			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			s1.append(String.format(strFormat, 120, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 150, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			s1.append(
					String.format(strFormat, 180,
							getAccurateText("DOCUMENT NO: " + object.getString("DOCUMENT NO"), 47, 0)
									+ getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 46, 2))
							+ "\n");
			s1.append(String.format(strFormatTitle, 210, getAccurateText("LOAD TRANSFER SUMMARY", 30, 1)) + "\n");

			JSONArray jData = object.getJSONArray("data");

			if (jData.getJSONObject(0).getJSONArray("DATA").length() > 0
					&& (jData.getJSONObject(1).getJSONArray("DATA").length() > 0
							|| jData.getJSONObject(2).getJSONArray("DATA").length() > 0)) {

				s1.append(String.format(strFormat, 300,
						getAccurateText("FROM & TO ROUTE: " + object.getString("TO ROUTE"), 93, 0)) + "\n");

			} else if (jData.getJSONObject(0).getJSONArray("DATA").length() > 0) {
				s1.append(String.format(strFormat, 300,
						getAccurateText("FROM ROUTE: " + object.getString("TO ROUTE"), 93, 0)) + "\n");

			} else if (jData.getJSONObject(1).getJSONArray("DATA").length() > 0) {
				s1.append(String.format(strFormat, 300,
						getAccurateText("TO ROUTE: " + object.getString("TO ROUTE"), 93, 0)) + "\n");
			} else if (jData.getJSONObject(2).getJSONArray("DATA").length() > 0) {
				s1.append(String.format(strFormat, 300,
						getAccurateText("TO ROUTE: " + object.getString("TO ROUTE"), 93, 0)) + "\n");
			}

			int position = 300;
			for (int i = 0; i < jData.length(); i++) {

				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");
				if (jInnerData.length() > 0) {
					position = position + 60;
					switch (i) {
					case 0:

						s1.append(String.format(strFormatBold, position, getAccurateText("TRANSFER IN", 53, 1)) + "\n");
						break;
					case 1:

						s1.append(
								String.format(strFormatBold, position, getAccurateText("TRANSFER OUT", 53, 1)) + "\n");
						break;
					case 2:

						s1.append(String.format(strFormatBold, position, getAccurateText("DAMAGE TRANSFER OUT", 53, 1))
								+ "\n");
						break;

					default:
						break;
					}

				}
				int MAXLEngth = 93;
				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());

				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
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
					s1.append(String.format(strFormat, position + 30, strheader) + "\n");
					if (strHeaderBottom.length() > 0) {
						position = position + 60;
						s1.append(String.format(strFormat, position, strHeaderBottom) + "\n");

					}
					s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
					position = position + 30;
				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					int slno = 0;
					for (int m = 0; m < jArr.length(); m++) {
						String itemDescrion = jArr.getString(m);
						if (m == 0) {
							int sNo = slno + 1;
							itemDescrion = sNo + ".";
							slno++;
						}
						if (m == 0) {
							strData = strData + getAccurateText(itemDescrion,
									hashValues.get(headers.getString(m).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(m).toString()));
						} else {
							strData = strData + getAccurateText(jArr.getString(m),
									hashValues.get(headers.getString(m).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(m).toString()));
						}
					}
					position = position + 30;
					s1.append(String.format(strFormat, position, strData) + "\n");

				}
				if (jInnerData.length() > 0) {
					s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
					s1.append(String.format(strFormat, position + 60, strTotal) + "\n");
					position = position + 60;
				}

			}

			s1.append(String.format(strFormat, position + 60, "\n"));
			// -----------start
			s1.append(String.format(strFormatBold, position + 100,
					getAccurateText("Net Value: ", 51, 2) + getAccurateText(object.getString("netvalue"), 52, 2))
					+ "\n");
			// ----------End
			s1.append(String.format(strFormat, position + 180, getAccurateText("FROM SALESMAN", 32, 1)
					+ getAccurateText("TO SALESMAN", 30, 1) + getAccurateText("SUPERVISOR", 31, 1)) + "\n");

			s1.append(String.format(strFormat, position + 210, getAccurateText(object.getString("printstatus"), 93, 1))
					+ "\n");
			s1.append(String.format(strFormatBold, position + 240, getAccurateText(printSeprator(), 53, 1)) + "\n");
			s1.append("\nPRINT\n");
			// s1.insert(0,
			// "! 0 "+position+" "+position+" "+(position+10)+" 1\n");

			position = position + 240;
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");
			Log.d("Final String", "" + String.valueOf(s1));

		} catch (Exception e) {
			e.printStackTrace();
		}

		return String.valueOf(s1).getBytes();
	}

	/*
	 * byte[] printCreditSummaryreport(JSONObject object) { StringBuffer s1 = new
	 * StringBuffer(); try { hashValues = new HashMap<String, Integer>();
	 * hashValues.put("Customer#", 11); hashValues.put("Customer Name", 32);
	 * hashValues.put("Opening Balance", 11); hashValues.put("Sales Amount", 11);
	 * hashValues.put("Collection Amount", 11); hashValues.put("Current Balance",
	 * 11);
	 * 
	 * hashPositions = new HashMap<String, Integer>();
	 * hashPositions.put("Customer#", 0); hashPositions.put("Customer Name", 0);
	 * hashPositions.put("Opening Balance", 2); hashPositions.put("Sales Amount",
	 * 2); hashPositions.put("Collection Amount", 2);
	 * hashPositions.put("Current Balance", 2);
	 * 
	 * if (object.getString("addresssetting").equals("1")) {
	 * 
	 * s1.append(String.format(strFormatHeader, 0,
	 * getAccurateText(object.getString("companyname"), 45, 1)) + "\n");
	 * s1.append(String.format( strFormatBold, 60,
	 * getAccurateText(object.getString("companyaddress"), 75, 1)) + "\n"); if
	 * (object.has("contactinfo")) { s1.append(String.format( strFormatBold, 90,
	 * getAccurateText(object.getString("contactinfo"), 75, 1)) + "\n"); }
	 * 
	 * } else { // woosim.printBitmap("/sdcard/images/woosim.bmp"); }
	 * s1.append(String.format( strFormat, 120, getAccurateText("ROUTE: " +
	 * object.getString("ROUTE"), 47, 0) + getAccurateText( "DATE:" +
	 * object.getString("DOC DATE"), 46, 2)) + "\n"); s1.append(String.format(
	 * strFormat, 150, getAccurateText( "SALESMAN: " + object.getString("SALESMAN"),
	 * 47, 0) + getAccurateText( "TIME:" + object.getString("TIME"), 46, 2)) +
	 * "\n"); s1.append(String.format( strFormat, 180, getAccurateText(
	 * "TRIP START DATE:" + object.getString("TRIP START DATE"), 93, 0)) + "\n");
	 * s1.append(String.format(strFormatTitle, 240,
	 * getAccurateText("COMPANY CREDIT SUMMARY", 30, 1)) + "\n");
	 * 
	 * s1.append(String.format(strFormat, 270, printSeprator()) + "\n"); int
	 * position = 270;
	 * 
	 * JSONArray jInnerData = object.getJSONArray("data"); JSONArray headers =
	 * object.getJSONArray("HEADERS"); JSONArray jTotalArr =
	 * object.getJSONArray("TOTAL"); JSONObject jTotal = jTotalArr.getJSONObject(0);
	 * int MAXLEngth = 93; for (int k = 0; k < headers.length(); k++) {
	 * 
	 * MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());
	 * 
	 * } if (MAXLEngth > 0) { MAXLEngth = (int) MAXLEngth / headers.length(); }
	 * 
	 * String strheader = "", strHeaderBottom = "", strTotal = ""; for (int j = 0; j
	 * < headers.length(); j++) {
	 * 
	 * strheader = strheader + getAccurateText( (headers.getString(j).indexOf(" ")
	 * == -1) ? headers.getString(j) : headers.getString(j).substring( 0,
	 * headers.getString(j).indexOf( " ")),
	 * hashValues.get(headers.getString(j).toString()) + MAXLEngth,
	 * hashPositions.get(headers .getString(j).toString()));
	 * 
	 * strHeaderBottom = strHeaderBottom + getAccurateText(
	 * (headers.getString(j).indexOf(" ") == -1) ? "" : headers .getString(j)
	 * .substring( headers.getString(j) .indexOf(" "), headers.getString(j)
	 * .length()) .trim(), hashValues.get(headers.getString(j).toString()) +
	 * MAXLEngth, hashPositions.get(headers .getString(j).toString()));
	 * 
	 * if (jTotal.has(headers.getString(j))) { strTotal = strTotal +
	 * getAccurateText( jTotal.getString(headers.getString(j) .toString()),
	 * hashValues.get(headers.getString(j) .toString()) + MAXLEngth,
	 * hashPositions.get(headers.getString(j) .toString())); } else {
	 * 
	 * strTotal = strTotal + getAccurateText(
	 * headers.getString(j).equals("Customer#") ? "TOTAL" : "",
	 * hashValues.get(headers.getString(j)) + MAXLEngth, 1); }
	 * 
	 * } if (jInnerData.length() > 0) { s1.append(String.format(strFormat, position
	 * + 30, strheader) + "\n"); if (strHeaderBottom.length() > 0) { position =
	 * position + 60; s1.append(String.format(strFormat, position, strHeaderBottom)
	 * + "\n");
	 * 
	 * } s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
	 * position = position + 30; }
	 * 
	 * for (int l = 0; l < jInnerData.length(); l++) { JSONArray jArr =
	 * jInnerData.getJSONArray(l); String strData = ""; for (int m = 0; m <
	 * jArr.length(); m++) { strData = strData + getAccurateText( jArr.getString(m),
	 * hashValues.get(headers.getString(m) .toString()) + MAXLEngth,
	 * hashPositions.get(headers.getString(m) .toString())); } position = position +
	 * 30; s1.append(String.format(strFormat, position, strData) + "\n");
	 * 
	 * } if (jInnerData.length() > 0) { s1.append(String.format(strFormat, position
	 * + 30, printSeprator()) + "\n"); s1.append(String.format(strFormat, position +
	 * 60, strTotal) + "\n"); position = position + 60; }
	 * 
	 * s1.append(String.format(strFormat, position + 60, "\n"));
	 * 
	 * s1.append(String.format(strFormat, position + 210,
	 * "END COMPANY CREDIT SUMMARY REPORT", 93, 1) + "\n");
	 * s1.append(String.format(strFormatBold, position + 240,
	 * getAccurateText(printSeprator(), 53, 1)) + "\n"); s1.append("\nPRINT\n"); //
	 * s1.insert(0, // "! 0 "+position+" "+position+" "+(position+10)+" 1\n");
	 * 
	 * position = position + 240; LOG.d("POSITION", "" + position); s1.insert(0,
	 * "! 0 200 200 " + position + " 1\n"); Log.d("Final String", "" +
	 * String.valueOf(s1));
	 * 
	 * } catch (Exception e) { e.printStackTrace(); }
	 * 
	 * return String.valueOf(s1).getBytes(); }
	 */
	byte[] printCreditSummaryreport(JSONObject object, boolean type) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Customer#", 11);
			hashValues.put("Customer Name", 32);
			hashValues.put("Opening Balance", 11);
			hashValues.put("Sales Amount", 11);
			hashValues.put("Collection Amount", 11);
			hashValues.put("Current Balance", 11);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Customer#", 0);
			hashPositions.put("Customer Name", 0);
			hashPositions.put("Opening Balance", 2);
			hashPositions.put("Sales Amount", 2);
			hashPositions.put("Collection Amount", 2);
			hashPositions.put("Current Balance", 2);

			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}

			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			s1.append(String.format(strFormat, 120, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 150, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 180,
					getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 93, 0)) + "\n");
			Log.e("Is Credit", "" + type);
			if (type) {

				s1.append(String.format(strFormatTitle, 240, getAccurateText("COMPANY CREDIT SUMMARY", 30, 1)) + "\n");
			} else {
				s1.append(
						String.format(strFormatTitle, 240, getAccurateText("TEMPORARY CREDIT SUMMARY", 30, 1)) + "\n");

			}

			s1.append(String.format(strFormat, 270, printSeprator()) + "\n");
			int position = 270;

			JSONArray jInnerData = object.getJSONArray("data");
			JSONArray headers = object.getJSONArray("HEADERS");
			JSONArray jTotalArr = object.getJSONArray("TOTAL");
			JSONObject jTotal = jTotalArr.getJSONObject(0);
			int MAXLEngth = 93;
			for (int k = 0; k < headers.length(); k++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());

			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
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

					strTotal = strTotal + getAccurateText(headers.getString(j).equals("Customer#") ? "TOTAL" : "",
							hashValues.get(headers.getString(j)) + MAXLEngth, 1);
				}

			}
			if (jInnerData.length() > 0) {
				s1.append(String.format(strFormat, position + 30, strheader) + "\n");
				if (strHeaderBottom.length() > 0) {
					position = position + 60;
					s1.append(String.format(strFormat, position, strHeaderBottom) + "\n");

				}
				s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
				position = position + 30;
			}

			for (int l = 0; l < jInnerData.length(); l++) {
				JSONArray jArr = jInnerData.getJSONArray(l);
				String strData = "";
				for (int m = 0; m < jArr.length(); m++) {
					strData = strData + getAccurateText(jArr.getString(m),
							hashValues.get(headers.getString(m).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(m).toString()));
				}
				position = position + 30;
				s1.append(String.format(strFormat, position, strData) + "\n");

			}
			if (jInnerData.length() > 0) {
				s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
				s1.append(String.format(strFormat, position + 60, strTotal) + "\n");
				position = position + 60;
			}

			s1.append(String.format(strFormat, position + 60, "\n"));

			s1.append(String.format(strFormat, position + 210, "END COMPANY CREDIT SUMMARY REPORT", 93, 1) + "\n");
			s1.append(String.format(strFormatBold, position + 240, getAccurateText(printSeprator(), 53, 1)) + "\n");
			s1.append("\nPRINT\n");
			// s1.insert(0,
			// "! 0 "+position+" "+position+" "+(position+10)+" 1\n");

			position = position + 240;
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");
			Log.d("Final String", "" + String.valueOf(s1));

		} catch (Exception e) {
			e.printStackTrace();
		}

		return String.valueOf(s1).getBytes();
	}

	byte[] parseLoadTransferOutResponse(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
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

			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}

			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			s1.append(String.format(strFormat, 120, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 150, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			s1.append(
					String.format(strFormat, 180,
							getAccurateText("DOCUMENT NO: " + object.getString("DOCUMENT NO"), 47, 0)
									+ getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 46, 2))
							+ "\n");
			s1.append(String.format(strFormatTitle, 240, getAccurateText("LOAD TRANSFER SUMMARY", 30, 1)) + "\n");
			s1.append(String.format(strFormat, 300, getAccurateText("TO ROUTE: " + object.getString("TO ROUTE"), 93, 0))
					+ "\n");

			s1.append(String.format(strFormatBold, 330, getAccurateText("TRANSFER IN", 53, 1)) + "\n");

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "";
			int MAXLEngth = 93;
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

			s1.append(String.format(strFormat, 360, strheader) + "\n");
			s1.append(String.format(strFormat, 390, printSeprator()) + "\n");

			JSONArray jData = object.getJSONArray("data");
			int position = 390;
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					strData = strData + getAccurateText(jArr.getString(j),
							hashValues.get(headers.getString(j).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(j).toString()));
				}
				position = position + 30;
				s1.append(String.format(strFormat, position, strData) + "\n");

			}
			s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");

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

				s1.append(String.format(strFormat, position + 60, strTotal) + "\n");

			}

			s1.append(String.format(strFormat, position + 90, "\n"));
			// -----------start
			s1.append(String.format(strFormatBold, position + 120,
					getAccurateText("Net Value: ", 51, 2) + getAccurateText(object.getString("netvalue"), 52, 2))
					+ "\n");
			// ----------End
			s1.append(String.format(strFormat, position + 160, getAccurateText("FROM SALESMAN", 32, 1)
					+ getAccurateText("TO SALESMAN", 30, 1) + getAccurateText("SUPERVISOR", 31, 1)) + "\n");

			s1.append(String.format(strFormat, position + 190, getAccurateText(object.getString("printstatus"), 93, 1))
					+ "\n");
			s1.append(String.format(strFormatBold, position + 240, getAccurateText(printSeprator(), 53, 1)) + "\n");
			s1.append("\nPRINT\n");
			// s1.insert(0,
			// "! 0 "+position+" "+position+" "+(position+10)+" 1\n");

			position = position + 270;
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");
			Log.d("Final String", "" + String.valueOf(s1));

		} catch (Exception e) {
			e.printStackTrace();
		}

		return String.valueOf(s1).getBytes();
	}

	byte[] parseLoadSummary2Response(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {

			hashValues = new HashMap<String, Integer>();
			hashValues.put("Sl#", 0);
			hashValues.put("Item#", 7);
			hashValues.put("Description", 25);
			hashValues.put("UPC", 4);
			hashValues.put("Van Qty", 11);
			hashValues.put("Load Qty", 11);
			hashValues.put("Net Qty", 11);
			hashValues.put("VALUE", 11);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Sl#", 0);
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("UPC", 2);
			hashPositions.put("Van Qty", 2);
			hashPositions.put("Load Qty", 2);
			hashPositions.put("Net Qty", 2);
			hashPositions.put("VALUE", 2);

			// s1.append("! 0 200 200 50 1\n");
			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}

			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			s1.append(String.format(strFormat, 120, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 150, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			s1.append(
					String.format(strFormat, 180,
							getAccurateText("DOCUMENT NO: " + object.getString("DOCUMENT NO"), 47, 0)
									+ getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 46, 2))
							+ "\n");

			s1.append(String.format(strFormatBold, 220,
					getAccurateText("NEW LOAD SUMMARY - LOAD: " + object.getString("Load Number"), 53, 1)) + "\n");

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "";
			int MAXLEngth = 93;
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

			s1.append(String.format(strFormat, 280, strheader) + "\n");
			s1.append(String.format(strFormat, 310, printSeprator()) + "\n");

			JSONArray jData = object.getJSONArray("data");
			int position = 310;
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					if (j != 9) {
						strData = strData + getAccurateText(jArr.getString(j),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					}
				}

				position = position + 30;
				s1.append(String.format(strFormat, position, strData) + "\n");
			}
			s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");

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
				s1.append(String.format(strFormat, position + 60, strTotal) + "\n");
			}
			s1.append(String.format(strFormat, position + 90, "\n"));

			s1.append(String.format(strFormatBold, position + 120,
					getAccurateText("Net Value: ", 51, 2) + getAccurateText(object.getString("netvalue"), 52, 2))
					+ "\n");

			s1.append(String.format(strFormat, position + 180,
					getAccurateText("STORE KEEPER", 46, 1) + getAccurateText("TO SALESMAN", 46, 1)) + "\n");

			s1.append(String.format(strFormat, position + 210, getAccurateText(object.getString("printstatus"), 93, 1))
					+ "\n");
			s1.append(String.format(strFormatBold, position + 240, getAccurateText(printSeprator(), 53, 1)) + "\n");
			s1.append("\nPRINT\n");

			position = position + 270;
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			e.printStackTrace();
		}
		return String.valueOf(s1).getBytes();
	}

	byte[] parseLoadSummaryResponse(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Sl#", 0);
			hashValues.put("Item#", 8);
			hashValues.put("Description", 25);
			hashValues.put("UPC", 4);
			hashValues.put("Open Qty", 8);
			hashValues.put("Load Qty", 9);
			hashValues.put("Adjust Qty", 11);
			hashValues.put("Net Qty", 8);
			hashValues.put("VALUE", 10);

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

			// s1.append("! 0 200 200 50 1\n");
			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");

				}

			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			s1.append(String.format(strFormat, 120, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 150, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			s1.append(
					String.format(strFormat, 180,
							getAccurateText("DOCUMENT NO: " + object.getString("DOCUMENT NO"), 47, 0)
									+ getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 46, 2))
							+ "\n");

			s1.append(String.format(strFormatBold, 220,
					getAccurateText("NEW LOAD SUMMARY - LOAD: " + object.getString("Load Number"), 53, 1)) + "\n");

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "";
			int MAXLEngth = 93;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}
			for (int i = 0; i < headers.length(); i++) {
				if (i != 0) {
					strheader = strheader + getAccurateText(headers.getString(i).toString(),
							hashValues.get(headers.getString(i).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(i).toString()));
				}

			}

			s1.append(String.format(strFormat, 280, strheader) + "\n");
			s1.append(String.format(strFormat, 310, printSeprator()) + "\n");

			JSONArray jData = object.getJSONArray("data");
			int position = 310;
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					if (j != 9) {
						if (j != 0) {
							strData = strData + getAccurateText(jArr.getString(j),

									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));
						}
					}
				}
				position = position + 30;
				s1.append(String.format(strFormat, position, strData) + "\n");
			}
			s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");

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
				s1.append(String.format(strFormat, position + 60, strTotal) + "\n");
			}
			s1.append(String.format(strFormat, position + 90, "\n"));
			s1.append(String.format(strFormatBold, position + 120,
					getAccurateText("Opening Value: ", 51, 2) + getAccurateText(object.getString("OpenValue"), 52, 2))
					+ "\n");
			s1.append(String.format(strFormatBold, position + 150,
					getAccurateText("Load Value: ", 51, 2) + getAccurateText(object.getString("LoadValue"), 52, 2))
					+ "\n");
			s1.append(String.format(strFormatBold, position + 180,
					getAccurateText("Net Value: ", 51, 2) + getAccurateText(object.getString("netvalue"), 52, 2))
					+ "\n");
			s1.append(String.format(strFormat, position + 240,
					getAccurateText("STORE KEEPER", 47, 1) + getAccurateText("TO SALESMAN", 46, 1)) + "\n");

			s1.append(String.format(strFormat, position + 270, getAccurateText(object.getString("printstatus"), 93, 1))
					+ "\n");
			// s1.append(String.format(strFormatBold, position + 2,
			// getAccurateText(printSeprator(), 53, 1)) + "\n");
			s1.append("\nPRINT\n");

			position = position + 300;
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			e.printStackTrace();
		}
		return String.valueOf(s1).getBytes();
	}

	// ----------------sTART
	byte[] parseUnloadResponse(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("ITEM#", 7);
			hashValues.put("DESCRIPTION", 27);
			hashValues.put("UPC", 5);
			hashValues.put("STALES OUT/PCS", 10);
			hashValues.put("STALES T.PCS", 8);
			hashValues.put("DAMAGE OUT/PCS", 10);
			hashValues.put("DAMAGE IN PCS", 8);
			hashValues.put("OTHER OUT/PCS", 10);
			hashValues.put("OTHER T.PCS", 8);
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

			// s1.append("! 0 200 200 50 1\n");
			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");

				}

			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			s1.append(String.format(strFormat, 120, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 150, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");

			s1.append(String.format(strFormatBold, 220, getAccurateText("STALES/DAMAGE SUMMARY", 53, 1)) + "\n");

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strHeaderBottom = "";
			int MAXLEngth = 93;
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

			s1.append(String.format(strFormat, 280, strheader) + "\n");
			s1.append(String.format(strFormat, 310, strHeaderBottom) + "\n");
			s1.append(String.format(strFormat, 340, printSeprator()) + "\n");

			JSONArray jData = object.getJSONArray("data");
			int position = 340;
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					strData = strData + getAccurateText(jArr.getString(j),
							hashValues.get(headers.getString(j).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(j).toString()));
				}

				position = position + 30;
				s1.append(String.format(strFormat, position, strData) + "\n");
			}
			s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");

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
				s1.append(String.format(strFormat, position + 60, strTotal) + "\n");
			}
			s1.append(String.format(strFormat, position + 90, "\n"));
			String totalAmt = "0";
			String varAmt = "0";

			s1.append(String.format(strFormatBold, position + 110,
					getAccurateText("TOTAL EXPIRY VALUE", 77, 2) + getAccurateText(
							object.has("TOTAL_EXPIRY_VALUE") ? object.getString("TOTAL_EXPIRY_VALUE") : "0", 16, 1))
					+ "\n");

			s1.append(String.format(strFormatBold, position + 140,
					getAccurateText("TOTAL DAMAGE VALUE", 77, 2) + getAccurateText(
							object.has("TOTAL_DAMAGE_VALUE") ? object.getString("TOTAL_DAMAGE_VALUE") : "0", 16, 1))
					+ "\n");
			s1.append(String.format(strFormatBold, position + 170,
					getAccurateText("TOTAL OTHER VALUE", 77, 2) + getAccurateText(
							object.has("TOTAL_OTHER_VALUE") ? object.getString("TOTAL_OTHER_VALUE") : "0", 16, 1))
					+ "\n");

			s1.append(String.format(strFormatBold, position + 200,
					getAccurateText("UNLOADED STALES VARIANCE", 77, 2) + getAccurateText(
							object.has("TOTAL_STALES_VAR") ? object.getString("TOTAL_STALES_VAR") : "0", 16, 1))
					+ "\n");
			s1.append(
					String.format(strFormatBold, position + 230,
							getAccurateText("UNLOADED DAMAGE VARIANCE", 77, 2) + getAccurateText(
									object.has("damagevariance") ? object.getString("damagevariance") : "0", 16, 1))
							+ "\n");

			s1.append(String.format(strFormat, position + 260,
					getAccurateText("", 50, 2) + getAccurateText("SALESMAN", 43, 1)) + "\n");
			s1.append(String.format(strFormat, position + 290,
					getAccurateText(object.has("printstatus") ? object.getString("printstatus") : "", 93, 1)) + "\n");
			s1.append(String.format(strFormatBold, position + 320, getAccurateText(printSeprator(), 53, 1)) + "\n");
			s1.append("\nPRINT\n");

			position = position + 320;
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			e.printStackTrace();
		}
		return String.valueOf(s1).getBytes();
	}

	// ------------------eND

	byte[] printSalesTaxReport(JSONObject object, boolean frmWithinfnc) {
		StringBuffer s1 = new StringBuffer();
		int printoultlet = 0;
		try {

			int printtax = Integer.parseInt(object.getString("printtax"));
			if (object.getString("printoutletitemcode").length() > 0) {
				printoultlet = Integer.parseInt(object.getString("printoutletitemcode"));
			} else {
				printoultlet = 0;
			}

			JSONArray jDataNew = object.getJSONArray("data");
			double excTot = 0, vatTot = 0;
			for (int i = 0; i < jDataNew.length(); i++) {
				JSONObject mainJsonNew = jDataNew.getJSONObject(i);
				JSONObject jTotalNew = mainJsonNew.getJSONObject("TOTAL");
				excTot = excTot + Double.parseDouble(jTotalNew.getString("EXC TAX"));
				vatTot = vatTot + Double.parseDouble(jTotalNew.getString("VAT"));
			}

			if (object.getString("displayupc").equals("1")) {
				hashValues = new HashMap<String, Integer>();
				hashValues.put("SL#", 0);
				hashValues.put("ITEM#", 10); // 12

				if (printoultlet != 0) {
					hashValues.put("OUTLET CODE", 0);
					hashValues.put("BARCODE", 0);
					hashValues.put("DESCRIPTION", 25);
					hashValues.put("DISCOUNT", 5);
				} else {

					hashValues.put("OUTLET CODE", 0);
					hashValues.put("BARCODE", 0);
					hashValues.put("DESCRIPTION", 25);
					hashValues.put("DISCOUNT", 6);

				}
				hashValues.put("VAT", 0);
				hashValues.put("EXC TAX", 0);
				if (printtax > 0) {

					if (excTot > 0 || vatTot >= 0) {
						if (excTot > 0) {
							hashValues.put("AMOUNT", 8);
							hashValues.put("EXC TAX", 9);
							hashValues.put("VAT", 0);
							hashValues.put("AMOUNT AFTER VAT", 11);
							hashValues.put("GROSS AMT", 11);
						} else if (vatTot >= 0) {
							hashValues.put("AMOUNT", 8);
							hashValues.put("EXC TAX", 0);
							hashValues.put("VAT", 8);
							hashValues.put("AMOUNT AFTER VAT", 12);
							hashValues.put("GROSS AMT", 11);
						} else if (excTot > 0 && vatTot > 0) {
							hashValues.put("AMOUNT", 8);
							hashValues.put("EXC TAX", 6);
							hashValues.put("VAT", 9);
							hashValues.put("AMOUNT AFTER VAT", 10);
							hashValues.put("GROSS AMT", 10);
						}

						hashValues.put("CASE PRICE", 8);
						hashValues.put("UNIT PRICE", 8);
					} else {
						hashValues.put("CASE PRICE", 12);
						hashValues.put("UNIT PRICE", 12);
						hashValues.put("AMOUNT", 11);
						hashValues.put("AMOUNT AFTER VAT", 12);
						hashValues.put("GROSS AMT", 10);
					}

				} else {

					hashValues.put("CASE PRICE", 11);
					hashValues.put("UNIT PRICE", 11);
					hashValues.put("AMOUNT", 10);
					hashValues.put("AMOUNT AFTER VAT", 12);
					hashValues.put("GROSS AMT", 10);
				}

				hashValues.put("UPC", 5);
				hashValues.put("QTY CAS/PCS", 7);// 8
				hashValues.put("TOTAL PCS", 0); // 6
				hashValues.put("DESCRIPTION", 25);
				hashValues.put("EXC TAX", 8);
				hashValues.put("VAT", 8);

				hashPositions = new HashMap<String, Integer>();
				hashPositions.put("SL#", 0);
				hashPositions.put("ITEM#", 0);
				hashPositions.put("OUTLET CODE", 0);
				hashPositions.put("BARCODE", 0);
				hashPositions.put("DESCRIPTION", 0);
				hashPositions.put("UPC", 2);
				hashPositions.put("QTY CAS/PCS", 1);
				hashPositions.put("TOTAL PCS", 1);
				hashPositions.put("CASE PRICE", 1);
				hashPositions.put("UNIT PRICE", 0);
				hashPositions.put("DISCOUNT", 1);
				hashPositions.put("AMOUNT", 1);
				hashPositions.put("EXC TAX", 0);
				hashPositions.put("VAT", 0);
				hashPositions.put("AMOUNT AFTER VAT", 0);
				hashPositions.put("GROSS AMT", 0);
				hashPositions.put("DESCRIPTION", 0);
			} else {
				hashValues = new HashMap<String, Integer>();
				hashValues.put("SL#", 0);
				hashValues.put("ITEM#", 6);
				hashValues.put("OUTLET CODE", 0);
				hashValues.put("BARCODE", 0);
				hashValues.put("DESCRIPTION", 23);
				hashValues.put("QTY CAS/PCS", 9);
				hashValues.put("CASE PRICE", 7);
				hashValues.put("UNIT PRICE", 7);

				hashValues.put("DISCOUNT", 9);
				hashValues.put("AMOUNT", 8);
				hashValues.put("AMOUNT AFTER VAT", 8);
				hashValues.put("GROSS AMT", 8);
				hashPositions = new HashMap<String, Integer>();
				hashPositions.put("SL#", 0);
				hashPositions.put("ITEM#", 0);
				hashPositions.put("OUTLET CODE", 0);
				hashPositions.put("DESCRIPTION", 0);
				hashPositions.put("QTY CAS/PCS", 2);
				hashPositions.put("CASE PRICE", 2);
				hashPositions.put("UNIT PRICE", 2);

				hashPositions.put("DISCOUNT", 2);
				hashPositions.put("AMOUNT", 1);
				hashPositions.put("AMOUNT AFTER VAT", 0);
				hashPositions.put("GROSS AMT", 2);
			}
			// --------------End

			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");

				try {
					String[] Add = object.getString("companyaddress").split("\\$");

					s1.append(String.format(strFormatBold, 60, getAccurateText(Add[0], 75, 1)) + "\n");
					s1.append(String.format(strFormatBold, 80, getAccurateText(Add[1], 75, 1)) + "\n");
				} catch (Exception e) {

				}
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 105, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}
				if (object.has("companytaxregistrationnumber")) {
					s1.append(String.format(strFormatBold, 130,
							getAccurateText("VATIN : " + object.getString("companytaxregistrationnumber"), 80, 1))
							+ "\n");
				}
			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}

			s1.append(
					String.format(strFormatBold, 180, getAccurateText(object.getString("INVOICETYPE"), 80, 1)) + "\n");

			int paymenttype = Integer.parseInt(object.getString("ptype"));
			String modeofPayment = "";
			if (paymenttype == 0) {
				modeofPayment = "(CASH)";
			} else if (paymenttype == 1) {
				modeofPayment = "(Credit)";
			} else if (paymenttype == 2) {
				modeofPayment = "(Cash/Credit)";
			}
			s1.append(String.format(strFormatBold, 210,
					getAccurateText("Invoice No: " + object.getString("invoicenumber"), 80, 1)
							+ getAccurateText("", 70, 1))
					+ "\n");

			s1.append(String.format(strFormatBold, 240, getAccurateText(printSeprator(), 53, 1)) + "\n");

			int position = 240;
			s1.append(String.format(strFormat, position + 20,
					getAccurateText("Customer Id :" + object.getString("CUSTOMERID"), 100, 0)) + "\n");

			s1.append(String.format(strFormat, position + 50,
					getAccurateText("Name :" + object.getString("CUSTOMERNAME"), 100, 0)) + "\n");
			if (object.has("ADDRESS")) {
				s1.append(String.format(strFormat, position + 80,
						getAccurateText("Address :" + object.getString("ADDRESS"), 100, 0)) + "\n");

			}
			if (object.has("contactDetail")) {

				s1.append(String.format(strFormat, position + 110,
						getAccurateText("Contact :" + object.getString("contactDetail"), 100, 0)) + "\n");
				s1.append(String.format(strFormat, position + 140,
						getAccurateText("VATIN :" + object.getString("taxregistrationnumber"), 100, 0)) + "\n");

			} else {
				if (object.has("taxregistrationnumber")) {
					s1.append(String.format(strFormat, position + 110,
							getAccurateText("VATIN :" + object.getString("taxregistrationnumber"), 100, 0)) + "\n");

				}
			}
			s1.append(String.format(strFormatBold, position + 130, getAccurateText(printSeprator(), 53, 1)) + "\n");

			s1.append(String
					.format(strFormat, position + 150, getAccurateText("ROUTE", 5, 0) + getAccurateText(" : ", 3, 0)
							+ getAccurateText(object.getString("ROUTE"), 27, 0) + getAccurateText("INVOICE DATE", 17, 2)
							+ getAccurateText(" : ", 3, 0) + getAccurateText(
									object.getString("DOC DATE") + " (" + object.getString("TIME") + ")", 18, 2))
					+ "\n");

			s1.append(String
					.format(strFormat, position + 175, getAccurateText("SALESMAN", 5, 0) + getAccurateText(" : ", 3, 0)
							+ getAccurateText(object.getString("SALESMAN") + "-" + object.getString("CONTACTNO"), 27, 0)
							+ getAccurateText("DATE OF SUPPLY", 17, 2) + getAccurateText(" : ", 3, 0) + getAccurateText(
									object.getString("DOC DATE") + " (" + object.getString("TIME") + ")", 18, 2))
					+ "\n");

			s1.append(String.format(strFormat, position + 200,
					getAccurateText("SUPERVISOR", 10, 0) + getAccurateText(" : ", 3, 0)
							+ getAccurateText(
									object.getString("supervisorname") + "-" + object.getString("supervisorno"), 27, 0)
							+ getAccurateText("ADVANCE PAYMENT DATE: N/A", 40, 2))
					+ "\n");

			s1.append(String
					.format(strFormat, position + 225, getAccurateText("PAYMENT DUE DATE", 60, 2)
							+ getAccurateText(" : ", 3, 0) + getAccurateText(object.getString("PAYMENTDUEDATE"), 10, 2))
					+ "\n");

			s1.append(String.format(strFormatBold, position + 245, getAccurateText(printSeprator(), 53, 1)) + "\n");
			
			
			
			JSONObject data = null;
			JSONArray detailDataList;
			DBHelper d1 = new DBHelper(cordova.getActivity().getApplicationContext());
			String rebprint = "";
			String custcode = object.getString("CUSTOMERID");
			String sql="select rebateprintyn from customermaster where alternatecode = '"+custcode+"'";
			try {
				data = d1.execSelectQuery(sql);
			}catch(Exception ae)
			{
				rebprint ="";
			}
			if (data.length() > 0) 
			{
				detailDataList = data.getJSONArray("array");
				JSONObject detailDataLine = detailDataList.getJSONObject(0);
				rebprint = detailDataLine.getString("rebateprintyn");
			}
			

			/*
			 * s1.append(String.format( strFormat, 200, getAccurateText( "CONTACT NO: " +
			 * object.getString("CONTACTNO"), 47, 0) + getAccurateText("", 46, 2)) + "\n");
			 * 
			 * 
			 * 
			 * 
			 * //int position = 150; if (object.has("invheadermsg") &&
			 * object.getString("invheadermsg").length() > 0) { position = position + 60;
			 * s1.append(String .format(strFormat, position, getAccurateText(
			 * object.getString("invheadermsg"), 93, 0)) + "\n");
			 * 
			 * }
			 */
			// int position = 280;
			// need to do bold if possible
			/*
			 * s1.append(String .format(strFormatBold, position + 60, getAccurateText(
			 * object.getString("CUSTOMER"), 70, 0)) + "\n");
			 * 
			 * s1.append(String.format( strFormat, position + 90,
			 * getAccurateText("ADDRESS : " + object.getString("ADDRESS"), 93, 0)) + "\n");
			 */
			position = position + 230;
			JSONArray jData = object.getJSONArray("data");

			for (int i = 0; i < jData.length(); i++) {

				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");

				if (jInnerData.length() > 0) {
					String header = mainJson.getString("TITLE").trim();
					String HeadTitle = "";
					position = position + 60;
					if (header.equals("sales")) {
						HeadTitle = "SALES ";
						s1.append(String.format(strFormatTitle, position, getAccurateText(HeadTitle, 53, 1)) + "\n");

					} else if (header.equals("free")) {

						HeadTitle = "TRADE DEAL  ";
						s1.append(String.format(strFormatTitle, position, getAccurateText(HeadTitle, 53, 1)) + "\n");

					} else if (header.equals("bad")) {

						HeadTitle = "BAD RETURN  ";
						s1.append(String.format(strFormatTitle, position, getAccurateText(HeadTitle, 53, 1)) + "\n");

					} else if (header.equals("good")) {
						HeadTitle = "GOOD RETURN  ";
						s1.append(String.format(strFormatTitle, position, getAccurateText(HeadTitle, 53, 1)) + "\n");

					} else if (header.equals("promofree")) {

						HeadTitle = "PROMOTION FREE  ";
						s1.append(String.format(strFormatTitle, position, getAccurateText(HeadTitle, 53, 1)) + "\n");

					} else if (header.equals("buyback")) {

						HeadTitle = "BUYBACK FREE";
						s1.append(String.format(strFormatTitle, position, getAccurateText(HeadTitle, 53, 1)) + "\n");

					}

				}
				int MAXLEngth = 123; //123;
				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());

				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}

				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					if (j != 0 && j != 3 && j != 7 && j != 15) {
						String HeaderVal = "";
						HeaderVal = ArabicTEXT.getHeaderVal(headers.getString(j));
						/*
						 * if(j==10) { HeaderVal = "AMOUNT BEFORE VAT"; }
						 * 
						 * else if(j==13) { HeaderVal = "AMOUNT AFTER VAT"; }
						 */
						if (j == 5) {
							HeaderVal = "UPC";
						} else if (j == 6) {
							HeaderVal = "QTY CAS/PCS";
						} else if (j == 8) {
							HeaderVal = "CASE PRICE";
						} else if (j == 9) {
							HeaderVal = "UNIT PRICE";
						}

						else if (j == 10) {
							HeaderVal = "GROSS AMT";
						} else if (j == 11) {
							HeaderVal = "DISC.";
						} else if (j == 12) {
							HeaderVal = "AMOUNT BEF VAT";
						}

						else if (j == 13) {
							HeaderVal = "VAT";
						} else if (j == 14) {
							HeaderVal = "AMOUNT AFT VAT";
						}
						strheader = strheader + getAccurateText(
								(HeaderVal.indexOf(" ") == -1) ? HeaderVal.equals("DISCOUNT") ? "DISC." : HeaderVal
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

						if (jTotal.has(headers.getString(j))) {
							// added this condition as not to print total for enhance 22/03/2021
							if (j < 9) {
								strTotal = strTotal
										+ getAccurateText(jTotal.getString(headers.getString(j).toString()),
												hashValues.get(headers.getString(j).toString()) + MAXLEngth,
												hashPositions.get(headers.getString(j).toString()));
							} else if (j == 14) {
								strTotal = strTotal
										+ getAccurateText(jTotal.getString(headers.getString(14).toString()),
												65 + MAXLEngth, 1);
								
							}
							
							

						} else {

							strTotal = strTotal
									+ getAccurateText(headers.getString(j).equals("DESCRIPTION") ? "TOTAL" : "",
											hashValues.get(headers.getString(j)) + MAXLEngth, 1);
							
							
						}
					}
				}
				if (jInnerData.length() > 0) {
					s1.append(String.format(strFormat, position + 30, strheader) + "\n");
					if (strHeaderBottom.length() > 0) {
						position = position + 60;
						s1.append(String.format(strFormat, position, strHeaderBottom) + "\n");

					}
					s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
					position = position + 30;
				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					String ItemName = "";
					String strBolddesc = "";
					boolean isoutletdata = false;
					for (int m = 0; m < jArr.length(); m++) {
						/*
						 * if(m!=11){ strData = strData + getAccurateText( jArr.getString(m),
						 * hashValues.get(headers.getString(m) .toString()) + MAXLEngth,
						 * hashPositions.get(headers.getString(m) .toString())); }
						 */
						if (m != 0) {
							isoutletdata = false;
							if (m == 2 && printoultlet == 0) {
								isoutletdata = true;
							}

							if (!isoutletdata) {

								String itemDescrion = jArr.getString(m);
								int invoiceLength = 0;
								if (m == 0) {
									itemDescrion = (l + 1) + "";

								} else if (m == 4) {
									if (object.getString("printbarcode").equals("1")) {

										itemDescrion = " ";
									} else {

										itemDescrion = " ";
									}
									ItemName = "" + jArr.getString(3) + "";
									if (ItemName.length() >= 35) {
										strBolddesc = ItemName.substring(0, 35);
									} else {
										strBolddesc = ItemName;
									}
									// ItemName =itemDescrion;
								} else if (m == 5) {
									itemDescrion = "" + jArr.getString(4) + "";
								} else if (m == 6) {
									itemDescrion = "" + jArr.getString(5) + "";
								} else if (m == 8) {
									itemDescrion = "" + jArr.getString(7) + "";
								} else if (m == 9) {
									itemDescrion = "" + jArr.getString(8) + "";
								} // g

								else if (m == 10) {
									itemDescrion = "" + jArr.getString(14) + ""; // d
								} else if (m == 11) {
									itemDescrion = "" + jArr.getString(9) + "";
								} // v

								else if (m == 12) {
									itemDescrion = "" + jArr.getString(12) + "";
								}

								else if (m == 13) {
									itemDescrion = "" + jArr.getString(11) + "";

								} else if (m == 14) {
									itemDescrion = "" + jArr.getString(13) + "";

								}

								if (m != 15) {
									strData = strData + getAccurateText(itemDescrion,
											m == 14 ? 150 : hashValues.get(headers.getString(m).toString()) + MAXLEngth,
											hashPositions.get(headers.getString(m).toString()));
								}

								if (m == 15) {

									s1.append(String.format(strFormatBold, position + 90, //62
											getAccurateText(ItemName, 50, 0)) + "\n");

								}

							}
						}
					}
					position = position + 60;
					s1.append(String.format(strFormat, position, strData) + "\n");

				}
				if (jInnerData.length() > 0) {
					s1.append(String.format(strFormat, position + 50, printSeprator()) + "\n");
					s1.append(String.format(strFormat, position + 70, strTotal) + "\n");
					position = position + 60;
				}

			}
			
//			s1.append(String.format(strFormat, position + 60, getAccurateText("ENDING ODOMETER READING", 50, 2)
//					+ getAccurateText(object.getString("endreading"), 10, 2)) + "\n");
//			s1.append(String.format(strFormat, position + 90, getAccurateText("STARTING ODOMETER READING", 50, 2)
//					+ getAccurateText(object.getString("startreading"), 10, 2)) + "\n");

			s1.append(String.format(strFormatBold, position + 60, getAccurateText("GROSS AMOUNT: ", 50, 0)
					+ getAccurateText(object.getString("GROSS AMOUNT"), 10, 0)) + "\n");
			
			//if (object.has("INVOICE DISCOUNT") && object.getString("INVOICE DISCOUNT").toString().length() > 0) {
				//double invoice = Double.parseDouble(object.getString("INVOICE DISCOUNT"));

				//if (invoice > 0) {
					position = position + 90;
					s1.append(String.format(strFormatBold, position, getAccurateText("INVOICE DISCOUNT: ", 50, 0)
							+ getAccurateText(object.getString("INVOICE DISCOUNT"), 15, 0)) + "\n");
				//} 
                // else { position = position - 30; }
					 
			//}

			
			//if (object.has("INVOICE HEADER DISCOUNT")
			//		&& object.getString("INVOICE HEADER DISCOUNT").toString().length() > 0) {
				//double invoiceheader = Double.parseDouble(object.getString("INVOICE HEADER DISCOUNT"));

				//if (invoiceheader > 0) {
					position = position + 30;
					s1.append(
							String.format(strFormatBold, position,
									getAccurateText("INVOICE HEADER DISCOUNT: ", 45, 0)
											+ getAccurateText(object.getString("INVOICE HEADER DISCOUNT"), 20, 0))
									+ "\n");
				//} 
             //	else { position = position - 30; }
				
			//}
			
			if (object.has("VAT CASH DISCOUNT") && object.getString("VAT CASH DISCOUNT").toString().length() > 0) {
				double invoice = Double.parseDouble(object.getString("VAT CASH DISCOUNT"));

				if (invoice > 0) {
					position = position + 60;
					s1.append(
							String.format(strFormatBold, position,
									getAccurateText("VAT CASH DISCOUNT: ", 50, 0)
											+ getAccurateText("-" + object.getString("VAT CASH DISCOUNT"), 20, 0))
									+ "\n");
				} 
            //else { position = position - 30; }
					 
			}
			
			Double ABV = Double.parseDouble(object.getString("AMOUNT BEFORE VAT")) ;

			String S1 = String.format("%.3f", ABV);
			
			s1.append(String.format(strFormatBold, position + 30, getAccurateText("AMOUNT BEFORE VAT: ", 50, 0)
					+ getAccurateText(S1, 17, 0)) + "\n");

			

			
			

			if (object.has("TOTVAT")) {
				//if (Double.parseDouble(object.getString("TOTVAT")) != 0) {
				//	int companyTaxStng = Integer.parseInt(object.getString("enabletax"));
				//	if (companyTaxStng == 1) {
						s1.append(String.format(strFormatBold, position + 60, getAccurateText("VAT AMOUNT : ", 50, 0)
								+ getAccurateText(object.getString("TOTVAT"), 7, 0)) + "\n");
				//	}
				//}
			}

			s1.append(String.format(strFormatBold, position + 90, getAccurateText("AMOUNT AFTER VAT: ", 50, 0)
					+ getAccurateText(object.getString("SUB TOTAL"), 15, 0)) + "\n");

			if (object.has("TCALLOWED") && object.getString("TCALLOWED").toString().trim().length() > 0
					&& object.getString("TCALLOWED").equals("1")) {
				s1.append(String.format(strFormat, position + 180,
						getAccurateText("TC CHARGED: ", 46, 0) + getAccurateText(object.getString("TCCHARGED"), 47, 0))
						+ "\n");
				position = position + 200;
			} else {
				position = position + 150;
			}
			
			if (rebprint != "" && rebprint != "0" && !rebprint.equals("0")) 
			{
				position = position + 30;
				s1.append(String.format(strFormat, position,
						getAccurateText(rebprint, 93, 0)) + "\n");
			}

			if (object.has("PaymentType") && Integer.parseInt(object.getString("PaymentType")) < 2) {
				position = position + 80;
				s1.append(String.format(strFormatTitle, position, getAccurateText("PAYMENT DETAILS", 53, 1)) + "\n");

				JSONArray jCheques = object.has("Cheque") ? object.getJSONArray("Cheque") : null;
				JSONObject jCash = object.has("Cash") ? object.getJSONObject("Cash") : null;

				switch (Integer.parseInt(object.getString("PaymentType"))) {
				case 0:

					s1.append(String.format(strFormatTitle, position + 30,
							getAccurateText("CASH:" + jCash.getString("Amount"), 53, 1)) + "\n");
					position = position + 30;
					break;
				case 1:

					s1.append(String.format(strFormatBold, position + 30, getAccurateText("CHEQUE", 53, 1)) + "\n");
					s1.append(
							String.format(strFormat, position + 60,
									getAccurateText("Cheque Date:", 24, 0) + getAccurateText("Cheque No:", 23, 0)
											+ getAccurateText("Bank:", 23, 0) + getAccurateText("Amount:", 23, 2))
									+ "\n");
					s1.append(String.format(strFormat, position + 90, printSeprator()) + "\n");
					position = position + 90;
					for (int j = 0; j < jCheques.length(); j++) {
						JSONObject jChequeDetails = jCheques.getJSONObject(j);
						position = position + 30;
						s1.append(String.format(strFormat, position,
								getAccurateText(jChequeDetails.getString("Cheque Date"), 24, 0)
										+ getAccurateText(jChequeDetails.getString("Cheque No"), 23, 0)
										+ getAccurateText(jChequeDetails.getString("Bank"), 23, 0)
										+ getAccurateText(jChequeDetails.getString("Amount"), 23, 2))
								+ "\n");

					}
					s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
					position = position + 30;

					break;
				default:
					break;
				}
			}
			if (object.getString("comments").toString().length() > 0) {
				position = position + 30;
				s1.append(String.format(strFormat, position,
						getAccurateText("Comments:" + object.getString("comments"), 93, 0)) + "\n");
			}
			
			
			
			
			if (object.getString("invtrailormsg").toString().length() > 0) {
				position = position + 30;
				s1.append(String.format(strFormat, position, getAccurateText(object.getString("invtrailormsg"), 93, 0))
						+ "\n");
			}

			s1.append(
					String.format(strFormat, position + 80, getAccurateText("CUSTOMER SIGN ...................", 46, 1)
							+ getAccurateText("................... SALESMAN SIGN", 47, 1)) + "\n");
			s1.append(String.format(strFormat, position + 120,
					getAccurateText((frmWithinfnc) ? "DUPLICATE COPY" : object.getString("printstatus"), 93, 1))
					+ "\n");
			s1.append(String.format(strFormatBold, position + 150, getAccurateText(printSeprator(), 53, 1)) + "\n");
			s1.append("\nPRINT\n");

			position = position + 180;
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			LOG.d("ERROR", "" + e);
			e.printStackTrace();
		} finally {

		}

		return String.valueOf(s1).getBytes();
	}

	byte[] printSalesReport(JSONObject object, boolean frmWithinfnc) {
		StringBuffer s1 = new StringBuffer();
		try {
			/*
			 * hashValues = new HashMap<String, Integer>(); hashValues.put("Item#", 6);
			 * hashValues.put("Description", 23); hashValues.put("Quantity", 9);
			 * hashValues.put("Case Price", 7); hashValues.put("Unit Price", 7);
			 * hashValues.put("Discount", 9); hashValues.put("Amount", 8); hashPositions =
			 * new HashMap<String, Integer>(); hashPositions.put("Item#", 0);
			 * hashPositions.put("Description", 0); hashPositions.put("Quantity", 2);
			 * hashPositions.put("Case Price", 2); hashPositions.put("Unit Price", 2);
			 * hashPositions.put("Discount", 2); hashPositions.put("Amount", 2);
			 */
			// --------------Start
			if (object.getString("displayupc").equals("1")) {
				hashValues = new HashMap<String, Integer>();
				hashValues.put("SL#", 0);
				hashValues.put("ITEM#", 10); // 12
				hashValues.put("OUTLET CODE", 0);
				hashValues.put("DESCRIPTION", 26); // 30
				hashValues.put("UPC", 4);
				hashValues.put("QTY CAS/PCS", 7);// 8
				hashValues.put("TOTAL PCS", 6); // 6
				hashValues.put("CASE PRICE", 10);
				hashValues.put("UNIT PRICE", 10);
				hashValues.put("DISCOUNT", 9);
				/*
				 * hashValues.put("EXC TAX", 0); hashValues.put("VAT(5%)", 0);
				 */
				hashValues.put("AMOUNT", 8); // 12
				hashPositions = new HashMap<String, Integer>();
				hashPositions.put("SL#", 0);
				hashPositions.put("ITEM#", 0);
				hashPositions.put("OUTLET CODE", 0);
				hashPositions.put("DESCRIPTION", 0);
				hashPositions.put("UPC", 2);
				hashPositions.put("QTY CAS/PCS", 1);
				hashPositions.put("TOTAL PCS", 2);
				hashPositions.put("CASE PRICE", 2);
				hashPositions.put("UNIT PRICE", 2);
				hashPositions.put("DISCOUNT", 2);
				/*
				 * hashPositions.put("EXC TAX", 2); hashPositions.put("VAT(5%)", 2);
				 */
				hashPositions.put("AMOUNT", 2);
			} else {
				hashValues = new HashMap<String, Integer>();
				hashValues.put("SL#", 0);
				hashValues.put("ITEM#", 6);
				hashValues.put("OUTLET CODE", 0);
				hashValues.put("OUTLET CODE", 0);
				hashValues.put("DESCRIPTION", 23);
				hashValues.put("QTY CAS/PCS", 9);
				hashValues.put("CASE PRICE", 7);
				hashValues.put("UNIT PRICE", 7);
				/*
				 * hashValues.put("EXC TAX", 0); hashValues.put("VAT(5%)", 0);
				 */
				hashValues.put("DISCOUNT", 9);
				hashValues.put("AMOUNT", 8);
				hashPositions = new HashMap<String, Integer>();
				hashPositions.put("SL#", 0);
				hashPositions.put("ITEM#", 0);
				hashPositions.put("OUTLET CODE", 0);
				hashPositions.put("DESCRIPTION", 0);
				hashPositions.put("QTY CAS/PCS", 2);
				hashPositions.put("CASE PRICE", 2);
				hashPositions.put("UNIT PRICE", 2);
				/*
				 * hashPositions.put("EXC TAX", 2); hashPositions.put("VAT(5%)", 2);
				 */
				hashPositions.put("DISCOUNT", 2);
				hashPositions.put("AMOUNT", 2);
			}
			// --------------End

			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}
			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			s1.append(String.format(strFormat, 120, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 150, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 180,
					getAccurateText("CONTACT NO: " + object.getString("CONTACTNO"), 47, 0) + getAccurateText("", 46, 2))
					+ "\n");
			int position = 180;

			// int position = 150;
			if (object.has("invheadermsg") && object.getString("invheadermsg").length() > 0) {
				position = position + 60;
				s1.append(String.format(strFormat, position, getAccurateText(object.getString("invheadermsg"), 93, 0))
						+ "\n");

			}
			s1.append(String.format(strFormatTitle, position + 30,
					getAccurateText(object.getString("INVOICETYPE"), 53, 1)) + "\n");

			// need to do bold if possible
			s1.append(String.format(strFormatBold, position + 60, getAccurateText(object.getString("CUSTOMER"), 70, 0))
					+ "\n");

			s1.append(String.format(strFormat, position + 90,
					getAccurateText("ADDRESS : " + object.getString("ADDRESS"), 93, 0)) + "\n");
			position = position + 90;
			JSONArray jData = object.getJSONArray("data");

			for (int i = 0; i < jData.length(); i++) {

				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");

				if (jInnerData.length() > 0) {
					String header = mainJson.getString("TITLE").trim();
					String HeadTitle = "";
					position = position + 60;
					if (header.equals("sales")) {
						HeadTitle = "SALES ";
						s1.append(String.format(strFormatTitle, position, getAccurateText(HeadTitle, 53, 1)) + "\n");

					} else if (header.equals("free")) {

						HeadTitle = "TRADE DEAL  ";
						s1.append(String.format(strFormatTitle, position, getAccurateText(HeadTitle, 53, 1)) + "\n");

					} else if (header.equals("bad")) {

						HeadTitle = "BAD RETURN  ";
						s1.append(String.format(strFormatTitle, position, getAccurateText(HeadTitle, 53, 1)) + "\n");

					} else if (header.equals("good")) {
						HeadTitle = "GOOD RETURN  ";
						s1.append(String.format(strFormatTitle, position, getAccurateText(HeadTitle, 53, 1)) + "\n");

					} else if (header.equals("promofree")) {

						HeadTitle = "PROMOTION FREE  ";
						s1.append(String.format(strFormatTitle, position, getAccurateText(HeadTitle, 53, 1)) + "\n");

					} else if (header.equals("buyback")) {

						HeadTitle = "BUYBACK FREE";
						s1.append(String.format(strFormatTitle, position, getAccurateText(HeadTitle, 53, 1)) + "\n");

					}

					/*
					 * switch (i) { case 0:
					 * 
					 * s1.append(String.format(strFormatTitle, position, getAccurateText("SALES",
					 * 53, 1)) + "\n"); break; case 1:
					 * 
					 * s1.append(String.format(strFormatTitle, position,
					 * getAccurateText("TRADE DEAL", 53, 1)) + "\n"); break; case 2:
					 * 
					 * s1.append(String.format(strFormatTitle, position,
					 * getAccurateText("PROMOTION FREE", 53, 1)) + "\n"); break; case 3:
					 * 
					 * s1.append(String.format(strFormatTitle, position,
					 * getAccurateText("GOOD RETURN", 53, 1)) + "\n"); break; case 4:
					 * s1.append(String.format(strFormatTitle, position,
					 * getAccurateText("BAD RETURN", 53, 1)) + "\n"); break;
					 * 
					 * default: break; }
					 */

				}
				int MAXLEngth = 93;
				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());

				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}

				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					// if(j!=0){
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
					// }

					if (jTotal.has(headers.getString(j))) {
						strTotal = strTotal + getAccurateText(jTotal.getString(headers.getString(j).toString()),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					} else {

						strTotal = strTotal + getAccurateText(headers.getString(j).equals("DESCRIPTION") ? "TOTAL" : "",
								hashValues.get(headers.getString(j)) + MAXLEngth, 1);
					}

				}
				if (jInnerData.length() > 0) {
					s1.append(String.format(strFormat, position + 30, strheader) + "\n");
					if (strHeaderBottom.length() > 0) {
						position = position + 60;
						s1.append(String.format(strFormat, position, strHeaderBottom) + "\n");

					}
					s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
					position = position + 30;
				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					for (int m = 0; m < jArr.length(); m++) {
						if (m != 11) {
							strData = strData + getAccurateText(jArr.getString(m),
									hashValues.get(headers.getString(m).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(m).toString()));
						}
					}
					position = position + 30;
					s1.append(String.format(strFormat, position, strData) + "\n");

				}
				if (jInnerData.length() > 0) {
					s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
					s1.append(String.format(strFormat, position + 60, strTotal) + "\n");
					position = position + 60;
				}

			}

			s1.append(String.format(strFormatBold, position + 60,
					getAccurateText("SUB TOTAL: ", 51, 0) + getAccurateText(object.getString("SUB TOTAL"), 52, 0))
					+ "\n");
			if (object.has("INVOICE DISCOUNT") && object.getString("INVOICE DISCOUNT").toString().length() > 0) {
				double invoice = Double.parseDouble(object.getString("INVOICE DISCOUNT"));

				if (invoice > 0) {
					position = position + 30;
					s1.append(String.format(strFormatBold, position, getAccurateText("INVOICE DISCOUNT: ", 51, 0)
							+ getAccurateText(object.getString("INVOICE DISCOUNT"), 52, 0)) + "\n");
				} else {
					position = position - 30;
				}
			}
			s1.append(String.format(strFormatBold, position + 120,
					getAccurateText("NET SALES: ", 51, 0) + getAccurateText(object.getString("NET SALES"), 52, 0))
					+ "\n");

			if (object.has("TCALLOWED") && object.getString("TCALLOWED").toString().trim().length() > 0
					&& object.getString("TCALLOWED").equals("1")) {
				s1.append(String.format(strFormat, position + 150,
						getAccurateText("TC CHARGED: ", 46, 0) + getAccurateText(object.getString("TCCHARGED"), 47, 0))
						+ "\n");
				position = position + 150;
			} else {
				position = position + 120;
			}

			if (object.has("PaymentType") && Integer.parseInt(object.getString("PaymentType")) < 2) {
				position = position + 60;
				s1.append(String.format(strFormatTitle, position, getAccurateText("PAYMENT DETAILS", 53, 1)) + "\n");

				JSONArray jCheques = object.has("Cheque") ? object.getJSONArray("Cheque") : null;
				JSONObject jCash = object.has("Cash") ? object.getJSONObject("Cash") : null;

				switch (Integer.parseInt(object.getString("PaymentType"))) {
				case 0:

					s1.append(String.format(strFormatTitle, position + 30,
							getAccurateText("CASH:" + jCash.getString("Amount"), 53, 1)) + "\n");
					position = position + 30;
					break;
				case 1:

					s1.append(String.format(strFormatBold, position + 30, getAccurateText("CHEQUE", 53, 1)) + "\n");
					s1.append(
							String.format(strFormat, position + 60,
									getAccurateText("Cheque Date:", 24, 0) + getAccurateText("Cheque No:", 23, 0)
											+ getAccurateText("Bank:", 23, 0) + getAccurateText("Amount:", 23, 2))
									+ "\n");
					s1.append(String.format(strFormat, position + 90, printSeprator()) + "\n");
					position = position + 90;
					for (int j = 0; j < jCheques.length(); j++) {
						JSONObject jChequeDetails = jCheques.getJSONObject(j);
						position = position + 30;
						s1.append(String.format(strFormat, position,
								getAccurateText(jChequeDetails.getString("Cheque Date"), 24, 0)
										+ getAccurateText(jChequeDetails.getString("Cheque No"), 23, 0)
										+ getAccurateText(jChequeDetails.getString("Bank"), 23, 0)
										+ getAccurateText(jChequeDetails.getString("Amount"), 23, 2))
								+ "\n");

					}
					s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
					position = position + 30;

					break;
				default:
					break;
				}
			}
			if (object.getString("comments").toString().length() > 0) {
				position = position + 30;
				s1.append(String.format(strFormat, position,
						getAccurateText("Comments:" + object.getString("comments"), 93, 0)) + "\n");
			}
			if (object.getString("invtrailormsg").toString().length() > 0) {
				position = position + 30;
				s1.append(String.format(strFormat, position, getAccurateText(object.getString("invtrailormsg"), 93, 0))
						+ "\n");
			}
			s1.append(
					String.format(strFormat, position + 60, getAccurateText("CUSTOMER SIGN ...................", 46, 1)
							+ getAccurateText("................... SALESMAN SIGN", 47, 1)) + "\n");
			s1.append(String.format(strFormat, position + 120,
					getAccurateText((frmWithinfnc) ? "DUPLICATE COPY" : object.getString("printstatus"), 93, 1))
					+ "\n");
			s1.append(String.format(strFormatBold, position + 150, getAccurateText(printSeprator(), 53, 1)) + "\n");
			s1.append("\nPRINT\n");

			position = position + 180;
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			LOG.d("ERROR", "" + e);
			e.printStackTrace();
		} finally {

		}

		return String.valueOf(s1).getBytes();
	}

	private String printSeprator() {
		String seprator = "";
		for (int i = 0; i < 93; i++) {
			seprator = seprator + "-";
		}
		return seprator;
	}

	byte[] parseAgingAnalysisResponse(JSONObject object) {
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

			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}
			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}

			s1.append(String.format(strFormat, 150, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 180, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			int position = 180;
			if (object.has("invheadermsg") && object.getString("invheadermsg").length() > 0) {
				position = position + 30;
				s1.append(String.format(strFormat, position, getAccurateText(object.getString("invheadermsg"), 93, 0))
						+ "\n");

			}

			// need to do bold if possible
			s1.append(String.format(strFormatBold, position + 60, getAccurateText(object.getString("CUSTOMER"), 78, 0))
					+ "\n");

			// ///////

//			s1.append(String.format(
//					strFormat,
//					position + 90,
//					getAccurateText("ADDRESS :" + object.getString("ADDRESS"),
//							93, 0))
//					+ "\n");
//			

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strTotal = "", strHeaderBottom = "";
			int MAXLEngth = 93;

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

					strTotal = strTotal + getAccurateText(headers.getString(i).equals("Due Amount") ? "TOTAL" : "",
							hashValues.get(headers.getString(i)) + MAXLEngth, 1);
				}
			}

			s1.append(String.format(strFormat, position + 120, strheader) + "\n");
			s1.append(String.format(strFormat, position + 150, strHeaderBottom) + "\n");
			s1.append(String.format(strFormat, position + 180, printSeprator()) + "\n");
			position = position + 180;
			JSONArray jData = object.getJSONArray("data");

			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					strData = strData + getAccurateText(jArr.getString(j),
							hashValues.get(headers.getString(j).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(j).toString()));
				}
				position = position + 30;

				s1.append(String.format(strFormat, position, strData) + "\n");

			}

			s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");

			s1.append(
					String.format(strFormat, position + 120, getAccurateText("CUSTOMER SIGN ...................", 46, 1)
							+ getAccurateText("................... SALESMAN SIGN", 47, 1)) + "\n");
			/*
			 * s1.append(String.format(strFormat, position + 180,
			 * getAccurateText(object.getString("printstatus"), 93, 1)) + "\n");
			 */
			s1.append(String.format(strFormatBold, position + 210, getAccurateText(printSeprator(), 53, 1)) + "\n");
			position = position + 240;
			s1.append("\nPRINT\n");
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			e.printStackTrace();
		}

		return String.valueOf(s1).getBytes();
	}

	byte[] parseAdvancePaymentResponse(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Invoice#", 30);
			hashValues.put("Invoice Date", 30);
			hashValues.put("Invoice Amount", 30);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Invoice#", 0);
			hashPositions.put("Invoice Date", 0);
			hashPositions.put("Invoice Amount", 2);

			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}
			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			s1.append(String.format(strFormat, 150, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 180, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			int position = 180;
			if (object.has("invheadermsg") && object.getString("invheadermsg").length() > 0) {
				position = position + 30;
				s1.append(String.format(strFormat, position, getAccurateText(object.getString("invheadermsg"), 93, 0))
						+ "\n");

			}
			s1.append(String.format(strFormatTitle, position + 30,
					getAccurateText("ADVANCE PAYMENT: " + object.getString("RECEIPT"), 53, 1)) + "\n");

			// need to do bold if possible
			s1.append(String.format(strFormatBold, position + 60, getAccurateText(object.getString("CUSTOMER"), 78, 0))
					+ "\n");

			// ///////

			s1.append(String.format(strFormat, position + 90,
					getAccurateText("ADDRESS :" + object.getString("ADDRESS"), 93, 0)) + "\n");

			// sujee commented as not to print no invoice details entered

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strTotal = "", strHeaderBottom = "";
			int MAXLEngth = 93;
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

					strTotal = strTotal + getAccurateText(headers.getString(i).equals("Invoice Amount") ? "TOTAL" : "",
							hashValues.get(headers.getString(i)) + MAXLEngth, 1);
				}
			}

			s1.append(String.format(strFormat, position + 120, strheader) + "\n");
			s1.append(String.format(strFormat, position + 150, strHeaderBottom) + "\n");
			s1.append(String.format(strFormat, position + 180, printSeprator()) + "\n");
			position = position + 180;
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					strData = strData + getAccurateText(jArr.getString(j),
							hashValues.get(headers.getString(j).toString()) + MAXLEngth,
							hashPositions.get(headers.getString(j).toString()));
				}
				position = position + 30;

				s1.append(String.format(strFormat, position, strData) + "\n");

			}

			s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
			s1.append(String.format(strFormat, position + 60, strTotal) + "\n");
			s1.append(String.format(strFormatTitle, position + 120, getAccurateText("PAYMENT DETAILS", 53, 1)) + "\n");

			position = position + 120;

			JSONArray jCheques = object.has("Cheque") ? object.getJSONArray("Cheque") : null;
			JSONObject jCash = object.has("Cash") ? object.getJSONObject("Cash") : null;

			switch (Integer.parseInt(object.getString("PaymentType"))) {
			case 0:

				s1.append(String.format(strFormatTitle, position + 30,
						getAccurateText("CASH:" + jCash.getString("Amount"), 53, 1)) + "\n");
				position = position + 30;
				break;
			case 1:

				s1.append(String.format(strFormatBold, position + 30, getAccurateText("CHEQUE", 53, 1)) + "\n");
				s1.append(String.format(strFormat, position + 60,
						getAccurateText("Cheque Date:", 24, 0) + getAccurateText("Cheque No:", 23, 0)
								+ getAccurateText("Bank:", 23, 0) + getAccurateText("Amount:", 23, 2))
						+ "\n");
				s1.append(String.format(strFormat, position + 90, printSeprator()) + "\n");
				position = position + 90;
				for (int j = 0; j < jCheques.length(); j++) {
					JSONObject jChequeDetails = jCheques.getJSONObject(j);
					position = position + 30;
					s1.append(String.format(strFormat, position,
							getAccurateText(jChequeDetails.getString("Cheque Date"), 24, 0)
									+ getAccurateText(jChequeDetails.getString("Cheque No"), 23, 0)
									+ getAccurateText(jChequeDetails.getString("Bank"), 23, 0)
									+ getAccurateText(jChequeDetails.getString("Amount"), 23, 2))
							+ "\n");

				}
				s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
				position = position + 30;

				break;
			case 2:

				position = position + 30;
				s1.append(String.format(strFormatTitle, position,
						getAccurateText("CASH:" + jCash.getString("Amount"), 53, 1)) + "\n");
				s1.append(String.format(strFormatBold, position + 30, getAccurateText("CHEQUE", 53, 1)) + "\n");
				s1.append(String.format(strFormat, position + 60,
						getAccurateText("Cheque Date:", 24, 0) + getAccurateText("Cheque No:", 23, 0)
								+ getAccurateText("Bank:", 23, 0) + getAccurateText("Amount:", 23, 2))
						+ "\n");
				s1.append(String.format(strFormat, position + 90, printSeprator()) + "\n");
				position = position + 90;
				for (int j = 0; j < jCheques.length(); j++) {
					JSONObject jChequeDetails = jCheques.getJSONObject(j);
					position = position + 30;
					s1.append(String.format(strFormat, position,
							getAccurateText(jChequeDetails.getString("Cheque Date"), 24, 0)
									+ getAccurateText(jChequeDetails.getString("Cheque No"), 23, 0)
									+ getAccurateText(jChequeDetails.getString("Bank"), 23, 0)
									+ getAccurateText(jChequeDetails.getString("Amount"), 23, 2))
							+ "\n");

				}
				s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
				position = position + 30;
				break;

			default:
				break;
			}

			String exPayment = object.has("expayment") ? object.getString("expayment") : "";

			if (exPayment != null && exPayment.toString().trim().length() > 0) {
				s1.append(
						String.format(strFormat, position + 30, getAccurateText("Excess Payment: " + exPayment, 93, 0))
								+ "\n");
			}
			if (object.getString("comments").toString().length() > 0) {
				s1.append(String.format(strFormat, position + 60,
						getAccurateText("Comments: " + object.getString("comments"), 93, 0)) + "\n");
			} else {
				position = position - 60;
			}
			s1.append(
					String.format(strFormat, position + 120, getAccurateText("CUSTOMER SIGN ...................", 46, 1)
							+ getAccurateText("................... SALESMAN SIGN", 47, 1)) + "\n");
			s1.append(String.format(strFormat, position + 180, getAccurateText(object.getString("printstatus"), 93, 1))
					+ "\n");
			s1.append(String.format(strFormatBold, position + 210, getAccurateText(printSeprator(), 53, 1)) + "\n");
			position = position + 240;
			s1.append("\nPRINT\n");
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			e.printStackTrace();
		}

		return String.valueOf(s1).getBytes();

	}

	byte[] parseCollectionResponse(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Invoice#", 14);// 18
			hashValues.put("Due Date", 10);// 18
			hashValues.put("Invoice Amount", 19);
			hashValues.put("Previous Balance", 12);// 10
			hashValues.put("Invoice Balance", 0);
			hashValues.put("Amount Paid", 19);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Invoice#", 0);
			hashPositions.put("Due Date", 1);
			hashPositions.put("Invoice Amount", 2);
			hashPositions.put("Previous Balance", 2);
			hashPositions.put("Invoice Balance", 0);
			hashPositions.put("Amount Paid", 2);

			String DedAmount = "";
			String s_dedamt = "";
			int w_dedamt = 0;
			boolean ded_flag = false;

			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}
			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}

			s1.append(String.format(strFormat, 150, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 180, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			int position = 180;
			if (object.has("invheadermsg") && object.getString("invheadermsg").length() > 0) {
				position = position + 30;
				s1.append(String.format(strFormat, position, getAccurateText(object.getString("invheadermsg"), 93, 0))
						+ "\n");

			}
			s1.append(String.format(strFormatTitle, position + 30,
					getAccurateText("RECEIPT: " + object.getString("RECEIPT"), 53, 1)) + "\n");

			// need to do bold if possible
			s1.append(String.format(strFormatBold, position + 60, getAccurateText(object.getString("CUSTOMER"), 78, 0))
					+ "\n");

			// ///////

			s1.append(String.format(strFormat, position + 90,
					getAccurateText("ADDRESS :" + object.getString("ADDRESS"), 93, 0)) + "\n");

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strTotal = "", strHeaderBottom = "";
			int MAXLEngth = 93;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}

			JSONObject jTOBject = object.getJSONObject("TOTAL");
			for (int i = 0; i < headers.length(); i++) {
				if (i != 5) {
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

						strTotal = strTotal + getAccurateText(headers.getString(i).equals("Due Date") ? "TOTAL" : "",
								hashValues.get(headers.getString(i)) + MAXLEngth, 1);
					}
				}
			}

			s1.append(String.format(strFormat, position + 120, strheader) + "\n");
			s1.append(String.format(strFormat, position + 150, strHeaderBottom) + "\n");
			s1.append(String.format(strFormat, position + 180, printSeprator()) + "\n");
			position = position + 180;
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";

				for (int j = 0; j < jArr.length(); j++) {
					if (j != 6 && j != 5) {

						if (j == 0) {
							String invno = jArr.getString(j).substring(0, jArr.getString(j).indexOf("_") + 1);
							if (invno.equals("")) {
								invno = jArr.getString(j);
							}
							String result = invno;
							strData = strData + getAccurateText(result,
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));
						} else if (j == 4) {

							s_dedamt = jArr.getString(6);
							// w_dedamt = Integer.parseInt(s_dedamt);
							if (s_dedamt.equals("0.000")) {
								strData = strData + getAccurateText(jArr.getString(j),
										hashValues.get(headers.getString(j).toString()) + MAXLEngth,
										hashPositions.get(headers.getString(j).toString()));
							} else {
								strData = strData + getAccurateText("    " + jArr.getString(j) + "*",
										hashValues.get(headers.getString(j).toString()) + MAXLEngth,
										hashPositions.get(headers.getString(j).toString()));
							}

						} else {
							strData = strData + getAccurateText(jArr.getString(j),
									hashValues.get(headers.getString(j).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(j).toString()));
						}

					}
					if (j == 6) {
						s_dedamt = jArr.getString(j);
						// w_dedamt = Integer.parseInt(s_dedamt);
						if (s_dedamt.equals("0.000")) {
						} else {
							ded_flag = true;
							DedAmount += s_dedamt + ", ";
						}

					}
				}

				position = position + 30;

				s1.append(String.format(strFormat, position, strData) + "\n");

			}

			s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
			s1.append(String.format(strFormat, position + 60, strTotal) + "\n");
			s1.append(String.format(strFormatTitle, position + 120,
					getAccurateText("###############PAYMENT DETAILS###############", 53, 1)) + "\n");
			// 0 Check only
			// 1 Cash Only
			// 2 Both

			position = position + 120;

			JSONArray jCheques = object.has("Cheque") ? object.getJSONArray("Cheque") : null;
			JSONObject jCash = object.has("Cash") ? object.getJSONObject("Cash") : null;

			switch (Integer.parseInt(object.getString("PaymentType"))) {
			case 0:

				s1.append(String.format(strFormatTitle, position + 30,
						getAccurateText("CASH:" + jCash.getString("Amount"), 53, 1)) + "\n");
				position = position + 30;
				break;
			case 1:

				s1.append(String.format(strFormatBold, position + 30, getAccurateText("CHEQUE", 53, 1)) + "\n");
				s1.append(String.format(strFormat, position + 60,
						getAccurateText("Cheque payments are subject to the Accounts clearance", 93, 0)) + "\n");
				/*
				 * s1.append(String.format( strFormat, position + 90,
				 * getAccurateText("ADDRESS :" + object.getString("ADDRESS"), 93, 0)) + "\n");
				 */ s1.append(String.format(strFormat, position + 90,
						getAccurateText("Cheque Date:", 24, 0) + getAccurateText("Cheque No:", 23, 0)
								+ getAccurateText("Bank:", 23, 0) + getAccurateText("Amount:", 23, 2))
						+ "\n");
				s1.append(String.format(strFormat, position + 110, printSeprator()) + "\n");
				position = position + 90;
				for (int j = 0; j < jCheques.length(); j++) {
					JSONObject jChequeDetails = jCheques.getJSONObject(j);
					position = position + 50;
					s1.append(String.format(strFormat, position,
							getAccurateText(jChequeDetails.getString("Cheque Date"), 24, 0)
									+ getAccurateText(jChequeDetails.getString("Cheque No"), 23, 0)
									+ getAccurateText(jChequeDetails.getString("Bank"), 23, 0)
									+ getAccurateText(jChequeDetails.getString("Amount"), 23, 2))
							+ "\n");

				}
				s1.append(String.format(strFormat, position + 40, printSeprator()) + "\n");
				position = position + 30;

				break;
			case 2:

				position = position + 30;
				s1.append(String.format(strFormatTitle, position,
						getAccurateText("CASH:" + jCash.getString("Amount"), 53, 1)) + "\n");
				s1.append(String.format(strFormatBold, position + 30, getAccurateText("CHEQUE", 53, 1)) + "\n");
				s1.append(String.format(strFormat, position + 60,
						getAccurateText("Cheque payments are subject to the Accounts clearance", 53, 1)) + "\n");
				s1.append(String.format(strFormat, position + 80,
						getAccurateText("Cheque Date:", 24, 0) + getAccurateText("Cheque No:", 23, 0)
								+ getAccurateText("Bank:", 23, 0) + getAccurateText("Amount:", 23, 2))
						+ "\n");
				s1.append(String.format(strFormat, position + 90, printSeprator()) + "\n");
				position = position + 90;
				for (int j = 0; j < jCheques.length(); j++) {
					JSONObject jChequeDetails = jCheques.getJSONObject(j);
					position = position + 30;
					s1.append(String.format(strFormat, position,
							getAccurateText(jChequeDetails.getString("Cheque Date"), 24, 0)
									+ getAccurateText(jChequeDetails.getString("Cheque No"), 23, 0)
									+ getAccurateText(jChequeDetails.getString("Bank"), 23, 0)
									+ getAccurateText(jChequeDetails.getString("Amount"), 23, 2))
							+ "\n");

				}
				s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
				position = position + 30;
				break;

			default:
				break;
			}

			String exPayment = object.has("expayment") ? object.getString("expayment") : "";

			if (exPayment != null && exPayment.toString().trim().length() > 0) {
				s1.append(
						String.format(strFormat, position + 30, getAccurateText("Excess Payment: " + exPayment, 93, 0))
								+ "\n");
			}
			if (object.getString("comments").toString().length() > 0) {
				s1.append(String.format(strFormatBold, position + 30,
						getAccurateText("##################COMMENTS##################", 53, 1)) + "\n");
				s1.append(String.format(strFormat, position + 70,
						getAccurateText("" + object.getString("comments"), 93, 0)) + "\n");
				if (ded_flag == true) {
					s1.append(String.format(strFormat, position + 100,
							getAccurateText("*Deductions made by the customer are ", 93, 0)) + "\n");
					s1.append(
							String.format(strFormat, position + 130, getAccurateText("(RO " + DedAmount + ");", 93, 0))
									+ "\n");
					s1.append(String.format(strFormat, position + 160,
							getAccurateText("and they are subject to Accounts clearance.", 93, 0)) + "\n");
				}
			} else {

				if (ded_flag == true) {
					s1.append(String.format(strFormatBold, position + 30,
							getAccurateText("##################COMMENTS##################", 53, 1)) + "\n");
					s1.append(String.format(strFormat, position + 80,
							getAccurateText("*Deductions made by the customer are ", 93, 0)) + "\n");
					s1.append(
							String.format(strFormat, position + 110, getAccurateText("(RO " + DedAmount + ");", 93, 0))
									+ "\n");
					s1.append(String.format(strFormat, position + 140,
							getAccurateText("and they are subject to Accounts clearance.", 93, 0)) + "\n");
				}
			}
			s1.append(String.format(strFormat, position + 190,
					getAccurateText("...................", 46, 1) + getAccurateText("...................", 47, 1))
					+ "\n");
			s1.append(String.format(strFormat, position + 220,
					getAccurateText("CUSTOMER SIGN", 46, 1) + getAccurateText("SALESMAN SIGN", 47, 1)) + "\n");
			s1.append(String.format(strFormat, position + 240, getAccurateText(object.getString("printstatus"), 93, 1))
					+ "\n");
			s1.append(String.format(strFormatBold, position + 260, getAccurateText(printSeprator(), 53, 1)) + "\n");
			position = position + 280;
			s1.append("\nPRINT\n");
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			e.printStackTrace();
		}

		return String.valueOf(s1).getBytes();
	}

	byte[] parseEndInventory(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			// hashValues.put("Sl#", 0);
			hashValues.put("Item#", 6);
			hashValues.put("Description", 24);
			hashValues.put("UPC", 4);
			hashValues.put("Truck Stock", 7);
			hashValues.put("Fresh Unload", 8);
			hashValues.put("Closing Stock", 8);
			hashValues.put("Variance Qty", 8);
			hashValues.put("Sales Qty", 7);
			hashValues.put("Return Qty", 7);
			hashValues.put("Damage Qty", 7);
			hashValues.put("FOC Qty", 7);

			// hashValues.put("Total Value",9);
			hashPositions = new HashMap<String, Integer>();
			// hashPositions.put("Sl#", 0);
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("UPC", 2);
			hashPositions.put("Truck Stock", 2);
			hashPositions.put("Fresh Unload", 2);
			hashPositions.put("Closing Stock", 2);
			hashPositions.put("Variance Qty", 2);
			hashPositions.put("Sales Qty", 2);
			hashPositions.put("Return Qty", 2);
			hashPositions.put("Damage Qty", 2);
			hashPositions.put("FOC Qty", 2);

			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}
			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}

			s1.append(String.format(strFormat, 150, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 180, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			s1.append(
					String.format(strFormat, 210,
							getAccurateText("DOCUMENT NO: " + object.getString("DOCUMENT NO"), 47, 0)
									+ getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 46, 2))
							+ "\n");
			s1.append(String.format(strFormatTitle, 270, getAccurateText("END INVENTORY SUMMARY", 53, 1)) + "\n");

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "", strHeaderBottom = "";
			int MAXLEngth = 93;
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
			s1.append(String.format(strFormat, 300, strheader) + "\n");
			s1.append(String.format(strFormat, 330, strHeaderBottom) + "\n");
			s1.append(String.format(strFormat, 360, printSeprator()) + "\n");

			int position = 360;
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					if (j != 11) {
						strData = strData + getAccurateText(jArr.getString(j),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					}
				}
				position = position + 30;
				s1.append(String.format(strFormat, position, strData) + "\n");

			}

			s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
			s1.append(String.format(strFormat, position + 60, strTotal) + "\n");
			// -----------start
			s1.append(String.format(strFormatBold, position + 120, getAccurateText("END INVENTORY VALUE : ", 31, 2) // 51
					+ getAccurateText(object.getString("closevalue"), 32, 2)) // 52
					+ "\n");
			s1.append(String.format(strFormat, position + 180, getAccurateText("Available Inventory : ", 40, 2)
					+ getAccurateText(object.getString("availvalue"), 30, 1)) + "\n");
			s1.append(String.format(strFormat, position + 210, getAccurateText("Unload Inventory : ", 40, 2)
					+ getAccurateText(object.getString("unloadvalue"), 30, 1)) + "\n");
			s1.append(String.format(strFormat, position + 240, getAccurateText("Calculated Inventory : ", 40, 2)
					+ getAccurateText(object.getString("closevalue"), 30, 1)) + "\n");
			s1.append(String.format(strFormat, position + 270, "") + "\n");
			// ----------End
			s1.append(String.format(strFormat, position + 300,
					getAccurateText("STORE KEEPER", 46, 1) + getAccurateText("SALESMAN", 47, 1)) + "\n");
			s1.append(String.format(strFormat, position + 330,
					getAccurateText(object.has("printstatus") ? object.getString("printstatus") : "", 93, 1)) + "\n");
			s1.append(String.format(strFormatBold, position + 360, getAccurateText(printSeprator(), 53, 1)) + "\n");
			position = position + 360;
			s1.append("\nPRINT\n");
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {

		}

		return String.valueOf(s1).getBytes();
	}

	byte[] parseDepositResponse(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {
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

			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}

			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}

			s1.append(String.format(strFormat, 150, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 180, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 210,
					getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 93, 0)) + "\n");
			s1.append(String.format(strFormatTitle, 240, getAccurateText("DEPOSIT SUMMARY", 53, 1)) + "\n");

			int position = 240;
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");

				if (jInnerData.length() > 0) {
					position = position + 30;
					switch (i) {
					case 0:
						s1.append(String.format(strFormatBold, position, getAccurateText("CASH", 53, 1)) + "\n");

						break;
					case 1:
						s1.append(String.format(strFormatBold, position, getAccurateText("CHEQUE", 53, 1)) + "\n");
						break;
					default:
						break;
					}
				}
				int MAXLEngth = 110;
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
								headers.getString(j).equals(i == 0 ? "Customer Code" : "Cheque Date") ? "SUB TOTAL"
										: "",
								hashValues.get(headers.getString(j)) + MAXLEngth, 1);
					}

				}

				if (jInnerData.length() > 0) {
					s1.append(String.format(strFormat, position + 30, strheader) + "\n");
					s1.append(String.format(strFormat, position + 60, strHeaderBottom) + "\n");
					s1.append(String.format(strFormat, position + 90, printSeprator()) + "\n");
					position = position + 90;
				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					for (int m = 0; m < jArr.length(); m++) {
						strData = strData + getAccurateText(jArr.getString(m),
								hashValues.get(headers.getString(m).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(m).toString()));
					}
					position = position + 30;

					s1.append(String.format(strFormat, position, strData) + "\n");

				}

				if (jInnerData.length() > 0) {

					s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");

					s1.append(String.format(strFormat, position + 60, strTotal) + "\n");
					position = position + 60;
				}

			}

			String totalAmt = object.getString("TOTAL DEPOSIT AMOUNT");
			String varAmt = object.getString("totalvaramount");
			s1.append(String.format(strFormatBold, position + 60,
					getAccurateText("TOTAL DEPOSIT AMOUNT", 77, 2) + getAccurateText(totalAmt, 16, 1)) + "\n");
			s1.append(String.format(strFormatBold, position + 90,
					getAccurateText("TOTAL VARIENCE AMOUNT", 77, 2) + getAccurateText(varAmt, 16, 1)) + "\n");

			if (totalAmt.length() > 0 && varAmt.length() > 0) {
				float totalCount = Float.parseFloat(totalAmt) + Float.parseFloat(varAmt);

				int decimal_count = totalAmt.substring(totalAmt.indexOf(".") + 1, totalAmt.length()).length();
				s1.append(String.format(strFormatBold, position + 120,
						getAccurateText("NET DUE AMOUNT", 90, 2)
								+ getAccurateText(String.format("%." + decimal_count + "f", totalCount), 16, 1))
						+ "\n");
			}
			s1.append(String.format(strFormat, position + 180,
					getAccurateText("SALES REP______________", 26, 0)
							+ getAccurateText("SUPERVISOR______________", 26, 0)
							+ getAccurateText("ACCOUNTANT______________", 26, 0))
					+ "\n");
			s1.append(String.format(strFormat, position + 210,
					getAccurateText(object.has("printstatus") ? object.getString("printstatus") : "", 93, 1)) + "\n");

			s1.append(String.format(strFormatBold, position + 240, getAccurateText(printSeprator(), 53, 1)) + "\n");

			position = position + 270;
			s1.append("\nPRINT\n");
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			e.printStackTrace();
		}

		return String.valueOf(s1).getBytes();
	}

	// -------------Cash Slip
	byte[] parseDepositSlipResponse(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Transaction Number", 12);
			hashValues.put("Customer Code", 12);
			hashValues.put("Customer Name", 12);
			hashValues.put("Cheque No", 12);
			hashValues.put("Cheque Date", 11);
			hashValues.put("Bank Name", 12);
			hashValues.put("Cheque Amount", 10);
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

			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}

			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}

			s1.append(String.format(strFormat, 150, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 180, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 210,
					getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 93, 0)) + "\n");
			s1.append(String.format(strFormatTitle, 240, getAccurateText("DEPOSIT SUMMARY", 53, 1)) + "\n");

			int position = 380;// 240
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");

				if (jInnerData.length() > 0) {
					position = position + 30;
					switch (i) {
					case 0:
						position = 240;
						position = position + 30;
						s1.append(String.format(strFormatBold, position, getAccurateText("CASH", 53, 1)) + "\n");

						break;
					case 1:
						position = position + 10;
						s1.append(String.format(strFormatBold, position, getAccurateText("CHEQUE", 53, 1)) + "\n");
						break;
					default:
						break;
					}
				}

				int MAXLEngth = 93;
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
				// if (i != 0) {
				if (jInnerData.length() > 0) {
					s1.append(String.format(strFormat, position + 30, strheader) + "\n");
					s1.append(String.format(strFormat, position + 60, strHeaderBottom) + "\n");
					s1.append(String.format(strFormat, position + 90, printSeprator()) + "\n");
					position = position + 90;
				}
				// }
				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					for (int m = 0; m < jArr.length(); m++) {
						strData = strData + getAccurateText(jArr.getString(m),
								hashValues.get(headers.getString(m).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(m).toString()));
					}
					position = position + 30;
					// if (i != 0) {
					s1.append(String.format(strFormat, position, strData) + "\n");
					// }

				}

				if (jInnerData.length() > 0) {
					// if (i != 0) {
					s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
					s1.append(String.format(strFormatBold, position + 60, strTotal) + "\n");
					position = position + 60;
//					} else {
//						s1.append(String.format(strFormatBold, 320, strTotal)
//								+ "\n");
//						position = 380; // 350
//					}
				}

			}

			String totalAmt = object.getString("TOTAL DEPOSIT AMOUNT");
			String varAmt = object.getString("totalvaramount");
			s1.append(String.format(strFormatBold, position + 60,
					getAccurateText(" TOTAL  DEPOSIT AMOUNT", 77, 2) + getAccurateText(totalAmt, 16, 2)) + "\n");
			s1.append(String.format(strFormatBold, position + 90,
					getAccurateText("TOTAL VARIENCE AMOUNT", 77, 2) + getAccurateText(varAmt, 16, 2)) + "\n");

			if (totalAmt.length() > 0 && varAmt.length() > 0) {
				float totalCount = Float.parseFloat(totalAmt) + Float.parseFloat(varAmt);

				int decimal_count = totalAmt.substring(totalAmt.indexOf(".") + 1, totalAmt.length()).length();
				s1.append(String.format(strFormatBold, position + 120,
						getAccurateText("NET DUE AMOUNT", 90, 2)
								+ getAccurateText(String.format("%." + decimal_count + "f", totalCount), 16, 2))
						+ "\n");
			}

			/* cash denomination */
			s1.append(String.format(strFormatBold, position + 150, getAccurateText("CASH DENOMINATION", 26, 0)) + "\n");

			s1.append(String.format(strFormatBold, position + 170,
					getAccurateText("OMR 50", 26, 1) + getAccurateText("x", 5, 2)
							+ getAccurateText(object.getString("OMR50AMT"), 5, 2) + getAccurateText("=", 5, 2)
							+ getAccurateText(object.getString("Amount50AMT"), 5, 2))
					+ "\n");

			s1.append(String.format(strFormatBold, position + 190,
					getAccurateText("OMR 20", 26, 1) + getAccurateText("x", 5, 2)
							+ getAccurateText(object.getString("OMR20AMT"), 5, 2) + getAccurateText("=", 5, 2)
							+ getAccurateText(object.getString("Amount20AMT"), 5, 2))
					+ "\n");

			s1.append(String.format(strFormatBold, position + 210,
					getAccurateText("OMR 10", 26, 1) + getAccurateText("x", 5, 2)
							+ getAccurateText(object.getString("OMR10AMT"), 5, 2) + getAccurateText("=", 5, 2)
							+ getAccurateText(object.getString("Amount10AMT"), 5, 2))
					+ "\n");

			s1.append(String.format(strFormatBold, position + 230,
					getAccurateText("OMR 5", 26, 1) + getAccurateText("x", 5, 2)
							+ getAccurateText(object.getString("OMR5AMT"), 5, 2) + getAccurateText("=", 5, 2)
							+ getAccurateText(object.getString("Amount5AMT"), 5, 2))
					+ "\n");

			s1.append(String.format(strFormatBold, position + 250,
					getAccurateText("OMR 1", 26, 1) + getAccurateText("x", 5, 2)
							+ getAccurateText(object.getString("OMR1AMT"), 5, 2) + getAccurateText("=", 5, 2)
							+ getAccurateText(object.getString("Amount1AMT"), 5, 2))
					+ "\n");

			s1.append(String.format(strFormatBold, position + 270,
					getAccurateText("OMR 0.500", 22, 1) + getAccurateText("x", 5, 2)
							+ getAccurateText(object.getString("OMR500PAISA"), 5, 2) + getAccurateText("=", 5, 2)
							+ getAccurateText(object.getString("Amount500PAISA"), 5, 2))
					+ "\n");

			s1.append(String.format(strFormatBold, position + 290,
					getAccurateText("OMR 0.100", 22, 1) + getAccurateText("x", 5, 2)
							+ getAccurateText(object.getString("OMR100PAISA"), 5, 2) + getAccurateText("=", 5, 2)
							+ getAccurateText(object.getString("Amount100PAISA"), 5, 2))
					+ "\n");

			s1.append(String.format(strFormatBold, position + 310,
					getAccurateText("OMR COINS", 19, 1) + getAccurateText("x", 5, 2)
							+ getAccurateText(object.getString("COIN"), 5, 2) + getAccurateText("=", 5, 2)
							+ getAccurateText(object.getString("AmountCOIN"), 5, 2))
					+ "\n");

			s1.append(String.format(strFormat, position + 340,
					getAccurateText("SALES REP______________", 26, 0)
							+ getAccurateText("SUPERVISOR______________", 26, 0)
							+ getAccurateText("ACCOUNTANT______________", 26, 0))
					+ "\n");

			s1.append(String.format(strFormat, position + 340,
					getAccurateText(object.has("printstatus") ? object.getString("printstatus") : "", 93, 1)) + "\n");

			/*
			 * s1.append(String.format( strFormat, position + 180,
			 * getAccurateText("SALES REP______________", 26,
			 * 0)+getAccurateText("SUPERVISOR______________", 26,
			 * 0)+getAccurateText("ACCOUNTANT______________", 26, 0)) + "\n");
			 * s1.append(String.format( strFormat, position + 210, getAccurateText(
			 * object.has("printstatus") ? object .getString("printstatus") : "", 93, 1)) +
			 * "\n");
			 * 
			 * s1.append(String.format(strFormatBold, position + 240,
			 * getAccurateText(printSeprator(), 53, 1)) + "\n");
			 */
			position = position + 380; // 270
			s1.append("\nPRINT\n");
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			e.printStackTrace();
		}

		return String.valueOf(s1).getBytes();
	}

	// -------------Deduction Slip
	byte[] parseDepositCashDeductionResponse(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Transaction Number", 10);
			hashValues.put("Customer Code", 10);
			hashValues.put("Customer Name", 20);
			hashValues.put("Cheque No", 11);
			hashValues.put("Cheque Date", 11);
			hashValues.put("Bank Name", 14);
			hashValues.put("Cheque Amount", 12);
			hashValues.put("Amount", 10);
			hashValues.put("Deduction Amount", 10);
			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Transaction Number", 0);
			hashPositions.put("Customer Code", 0);
			hashPositions.put("Customer Name", 0);
			hashPositions.put("Cheque No", 0);
			hashPositions.put("Cheque Date", 0);
			hashPositions.put("Bank Name", 0);
			hashPositions.put("Cheque Amount", 2);
			hashPositions.put("Amount", 2);
			hashPositions.put("Deduction Amount", 2);

			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}

			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}

			s1.append(String.format(strFormat, 150, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 180, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 210,
					getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 93, 0)) + "\n");
			s1.append(String.format(strFormatTitle, 240, getAccurateText("DEDUCTION SUMMARY", 53, 1)) + "\n");

			int position = 240;// 240
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");

				if (jInnerData.length() > 0) {
					position = position + 30;
					switch (i) {
					case 0:
						position = 240;
						position = position + 30;
//							s1.append(String.format(strFormatBold, position,
//									getAccurateText("CASH", 53, 1)) + "\n");

						break;
					case 1:
						position = position + 10;
//							s1.append(String.format(strFormatBold, position,
//									getAccurateText("CHEQUE", 53, 1)) + "\n");
						break;
					default:
						break;
					}
				}

				int MAXLEngth = 93;
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
				// if (i != 0) {
				if (jInnerData.length() > 0) {
					s1.append(String.format(strFormat, position + 30, strheader) + "\n");
					s1.append(String.format(strFormat, position + 60, strHeaderBottom) + "\n");
					s1.append(String.format(strFormat, position + 90, printSeprator()) + "\n");
					position = position + 90;
				}
				// }
				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					for (int m = 0; m < jArr.length(); m++) {
						strData = strData + getAccurateText(jArr.getString(m),
								hashValues.get(headers.getString(m).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(m).toString()));
					}
					position = position + 30;
					// if (i != 0) {
					s1.append(String.format(strFormat, position, strData) + "\n");
					// }

				}

				if (jInnerData.length() > 0) {
					// if (i != 0) {
					s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
					s1.append(String.format(strFormatBold, position + 60, strTotal) + "\n");
					s1.append(String.format(strFormat, +90, printSeprator()) + "\n");
					position = position + 90;
//						} else {
//							s1.append(String.format(strFormatBold, 320, strTotal)
//									+ "\n");
//							position = 380; // 350
//						}
				}

			}

			String totalAmt = object.getString("TOTAL DEPOSIT AMOUNT");
			/*
			 * String varAmt = object.getString("totalvaramount");
			 * s1.append(String.format(strFormatBold, position + 60,
			 * getAccurateText(" TOTAL  DEPOSIT AMOUNT", 77, 2) + getAccurateText(totalAmt,
			 * 16, 2)) + "\n"); s1.append(String.format(strFormatBold, position + 90,
			 * getAccurateText("TOTAL VARIENCE AMOUNT", 77, 2) + getAccurateText(varAmt, 16,
			 * 2)) + "\n");
			 */

			/*
			 * if (totalAmt.length() > 0 && varAmt.length() > 0) { float totalCount =
			 * Float.parseFloat(totalAmt) + Float.parseFloat(varAmt);
			 * 
			 * int decimal_count = totalAmt.substring( totalAmt.indexOf(".") + 1,
			 * totalAmt.length()).length(); s1.append(String.format( strFormatBold, position
			 * + 120, getAccurateText("NET DUE AMOUNT", 90, 2) + getAccurateText(
			 * String.format("%." + decimal_count + "f", totalCount), 16, 2)) + "\n"); }
			 */

			/* cash denomination */
			/*
			 * s1.append(String.format( strFormatBold, position + 150,
			 * getAccurateText("CASH DENOMINATION", 26, 0)) + "\n");
			 * 
			 * s1.append(String.format( strFormatBold, position + 170,
			 * getAccurateText("OMR 50", 26, 1) + getAccurateText("x", 5, 2) +
			 * getAccurateText(object.getString("OMR50AMT"),5, 2) + getAccurateText("=", 5,
			 * 2) + getAccurateText(object.getString("Amount50AMT"),5, 2)) + "\n");
			 * 
			 * s1.append(String.format( strFormatBold, position + 190,
			 * getAccurateText("OMR 20", 26, 1) + getAccurateText("x", 5, 2) +
			 * getAccurateText(object.getString("OMR20AMT"),5, 2) + getAccurateText("=", 5,
			 * 2) + getAccurateText(object.getString("Amount20AMT"),5, 2)) + "\n");
			 * 
			 * s1.append(String.format( strFormatBold, position + 210,
			 * getAccurateText("OMR 10", 26, 1) + getAccurateText("x", 5, 2) +
			 * getAccurateText(object.getString("OMR10AMT"),5, 2) + getAccurateText("=", 5,
			 * 2) + getAccurateText(object.getString("Amount10AMT"),5, 2)) + "\n");
			 * 
			 * s1.append(String.format( strFormatBold, position + 230,
			 * getAccurateText("OMR 5", 26, 1) + getAccurateText("x", 5, 2) +
			 * getAccurateText(object.getString("OMR5AMT"),5, 2) + getAccurateText("=", 5,
			 * 2) + getAccurateText(object.getString("Amount5AMT"),5, 2)) + "\n");
			 * 
			 * s1.append(String.format( strFormatBold, position + 250,
			 * getAccurateText("OMR 1", 26, 1) + getAccurateText("x", 5, 2) +
			 * getAccurateText(object.getString("OMR1AMT"),5, 2) + getAccurateText("=", 5,
			 * 2) + getAccurateText(object.getString("Amount1AMT"),5, 2)) + "\n");
			 * 
			 * s1.append(String.format( strFormatBold, position + 270,
			 * getAccurateText("OMR 0.500", 22, 1) + getAccurateText("x", 5, 2) +
			 * getAccurateText(object.getString("OMR500PAISA"),5, 2) + getAccurateText("=",
			 * 5, 2) + getAccurateText(object.getString("Amount500PAISA"),5, 2)) + "\n");
			 * 
			 * s1.append(String.format( strFormatBold, position + 290,
			 * getAccurateText("OMR 0.100", 22, 1) + getAccurateText("x", 5, 2) +
			 * getAccurateText(object.getString("OMR100PAISA"),5, 2) + getAccurateText("=",
			 * 5, 2) + getAccurateText(object.getString("Amount100PAISA"),5, 2)) + "\n");
			 * 
			 * s1.append(String.format( strFormatBold, position + 310,
			 * getAccurateText("OMR COINS", 19, 1) + getAccurateText("x", 5, 2) +
			 * getAccurateText(object.getString("COIN"),5, 2) + getAccurateText("=", 5, 2) +
			 * getAccurateText(object.getString("AmountCOIN"),5, 2)) + "\n");
			 */

			s1.append(String.format(strFormat, position + 120,
					getAccurateText("SALES REP______________", 26, 0)
							+ getAccurateText("SUPERVISOR______________", 26, 0)
							+ getAccurateText("ACCOUNTANT______________", 26, 0))
					+ "\n");

			s1.append(String.format(strFormat, position + 150,
					getAccurateText(object.has("printstatus") ? object.getString("printstatus") : "", 93, 1)) + "\n");

			/*
			 * s1.append(String.format( strFormat, position + 180,
			 * getAccurateText("SALES REP______________", 26,
			 * 0)+getAccurateText("SUPERVISOR______________", 26,
			 * 0)+getAccurateText("ACCOUNTANT______________", 26, 0)) + "\n");
			 * s1.append(String.format( strFormat, position + 210, getAccurateText(
			 * object.has("printstatus") ? object .getString("printstatus") : "", 93, 1)) +
			 * "\n");
			 * 
			 * s1.append(String.format(strFormatBold, position + 240,
			 * getAccurateText(printSeprator(), 53, 1)) + "\n");
			 */
			position = position + 380; // 270
			s1.append("\nPRINT\n");
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			e.printStackTrace();
		}

		return String.valueOf(s1).getBytes();
	}

	// =============
	byte[] printSalesSummaryReport(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Transaction Number", 11);
			hashValues.put("Customer Code", 15);
			hashValues.put("Customer Name", 0);
			hashValues.put("Sales Amount", 8);
			hashValues.put("G.Return Amount", 8);
			hashValues.put("D.Return Amount", 8);
			hashValues.put("Invoice Discount", 8);
			hashValues.put("Total Amount", 9);
			hashValues.put("Check Number", 11);
			hashValues.put("Check Date", 11);
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

			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}
			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}

			s1.append(String.format(strFormat, 150, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 180, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 210,
					getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 93, 0)) + "\n");
			s1.append(String.format(strFormatTitle, 240, getAccurateText("SALES SUMMARY", 53, 1)) + "\n");

			int position = 240;
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {
				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");

				if (jInnerData.length() > 0) {

					switch (i) {
					case 0:
						position = position + 60;
						s1.append(
								String.format(strFormatBold, position, getAccurateText("CASH INVOICE", 53, 1)) + "\n");
						break;
					case 1:
						position = position + 60;
						s1.append(String.format(strFormatBold, position, getAccurateText("CREDIT INVOICE", 53, 1))
								+ "\n");
						break;
					case 2:
						position = position + 60;
						s1.append(String.format(strFormatBold, position, getAccurateText("TC INVOICE", 53, 1)) + "\n");
						break;
					case 3:
						position = position + 60;
						s1.append(String.format(strFormatBold, position, getAccurateText("COLLECTION", 53, 1)) + "\n");
						break;
					default:
						break;
					}
				}
				int MAXLEngth = 93;
				for (int k = 0; k < headers.length(); k++) {

					MAXLEngth = MAXLEngth - hashValues.get(headers.getString(k).toString());
				}
				if (MAXLEngth > 0) {
					MAXLEngth = (int) MAXLEngth / headers.length();
				}

				String strheader = "", strHeaderBottom = "", strTotal = "";
				for (int j = 0; j < headers.length(); j++) {

					if (!headers.getString(j).equals("Customer Name")) {
						strheader = strheader
								+ getAccurateText(
										(headers.getString(j).indexOf(" ") == -1) ? headers.getString(j)
												: headers.getString(j).substring(0, headers.getString(j).indexOf(" "))
														.trim(),
										hashValues.get(headers.getString(j).toString()) + MAXLEngth,
										hashPositions.get(headers.getString(j).toString()));

						strHeaderBottom = strHeaderBottom + getAccurateText(
								(headers.getString(j).indexOf(" ") == -1) ? ""
										: headers.getString(j)
												.substring(headers.getString(j).indexOf(" "),
														headers.getString(j).length())
												.trim(),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					}

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
					s1.append(String.format(strFormat, position + 30, strheader) + "\n");

					s1.append(String.format(strFormat, position + 60, strHeaderBottom) + "\n");

					s1.append(String.format(strFormat, position + 90, printSeprator()) + "\n");
					position = position + 90;
				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					for (int m = 0; m < jArr.length(); m++) {
						if (m != 2) {
							strData = strData + getAccurateText(jArr.getString(m),
									hashValues.get(headers.getString(m).toString()) + MAXLEngth,
									hashPositions.get(headers.getString(m).toString()));
						}
					}
					position = position + 30;
					s1.append(String.format(strFormat, position, strData) + "\n");
				}
				if (jInnerData.length() > 0) {
					s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
					s1.append(String.format(strFormat, position + 60, strTotal) + "\n");
					position = position + 60;
				}

			}

			s1.append(String.format(strFormat, position + 30,
					getAccurateText("", 50, 2) + getAccurateText("SALESMAN", 43, 1)) + "\n");
			s1.append(String.format(strFormat, position + 90,
					getAccurateText(object.has("printstatus") ? object.getString("printstatus") : "", 93, 1)) + "\n");

			s1.append(String.format(strFormat, position + 120, "\n"));

			s1.append(String.format(strFormat, position + 150, getAccurateText(printSeprator(), 93, 1)) + "\n");
			position = position + 180;
			s1.append("\nPRINT\n");
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			e.printStackTrace();

		}

		return String.valueOf(s1).getBytes();
	}

	// -------------start Route Activity Developer By Sujitv 5/1/2014
	byte[] printRouteactivityReport(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {

			hashValues = new HashMap<String, Integer>();
			hashValues.put("Transaction No", 20);
			hashValues.put("Time In", 10);
			hashValues.put("Time Out", 10);
			hashValues.put("Customer Code", 22);
			hashValues.put("Customer Name", 0);
			hashValues.put("Transaction Type", 20);
			hashValues.put("Total Amount", 11);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Transaction No", 0);
			hashPositions.put("Time In", 0);
			hashPositions.put("Time Out", 2);
			hashPositions.put("Customer Code", 2);
			hashPositions.put("Customer Name", 0);
			hashPositions.put("Transaction Type", 2);
			hashPositions.put("Total Amount", 2);

			/*
			 * hashValues = new HashMap<String, Integer>();
			 * hashValues.put("Transaction Number", 11); hashValues.put("Time In", 6);
			 * hashValues.put("Time Out", 6); hashValues.put("Customer Code", 10);
			 * hashValues.put("Transaction Type", 14); hashValues.put("Amount", 8);
			 * 
			 * hashPositions = new HashMap<String, Integer>();
			 * hashValues.put("Transaction Number",0); hashValues.put("Time In",0);
			 * hashValues.put("Time Out",0); hashValues.put("Customer Code",0);
			 * hashValues.put("Transaction Type",0); hashValues.put("Amount", 2);
			 */

			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}
			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}

			s1.append(String.format(strFormat, 150, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 180, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 210,
					getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 93, 0)) + "\n");
			s1.append(String.format(strFormatTitle, 240, getAccurateText("ROUTE ACTIVITY LOG", 53, 1)) + "\n");

			int position = 240;
			JSONArray jData = object.getJSONArray("data");
			for (int i = 0; i < jData.length(); i++) {

				JSONObject mainJson = jData.getJSONObject(i);
				JSONArray jInnerData = mainJson.getJSONArray("DATA");
				JSONArray headers = mainJson.getJSONArray("HEADERS");
				JSONObject jTotal = mainJson.getJSONObject("TOTAL");

				/*
				 * if (jInnerData.length() > 0) {
				 * 
				 * switch (i) { case 0: position = position + 60;
				 * s1.append(String.format(strFormatBold, position,
				 * getAccurateText("CASH INVOICE", 53, 1)) + "\n"); break; case 1: position =
				 * position + 60; s1.append(String.format(strFormatBold, position,
				 * getAccurateText("CREDIT INVOICE", 53, 1)) + "\n"); break; case 2: position =
				 * position + 60; s1.append(String.format(strFormatBold, position,
				 * getAccurateText("TC INVOICE", 53, 1)) + "\n"); break; case 3: position =
				 * position + 60; s1.append(String.format(strFormatBold, position,
				 * getAccurateText("COLLECTION", 53, 1)) + "\n"); break; default: break; } }
				 */
				position = position + 30;

				int MAXLEngth = 93;
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
								headers.getString(j).equals("Transaction Type") ? "TOTAL SALES & RECEIPT" : "",
								hashValues.get(headers.getString(j)) + MAXLEngth, 1);
						/*
						 * strTotal2 = strTotal2 + getAccurateText( headers.getString(j).equals(
						 * "Customer Code") ? " ENDING ODOMETER READING" : "",
						 * hashValues.get(headers.getString(j)) + MAXLEngth, 1); strTotal3 = strTotal3 +
						 * getAccurateText( headers.getString(j).equals( "Customer Code") ?
						 * " STARTING ODOMETER READING" : "", hashValues.get(headers.getString(j)) +
						 * MAXLEngth, 1);
						 */
					}

				}
				if (jInnerData.length() > 0) {
					s1.append(String.format(strFormat, position + 30, strheader) + "\n");

					s1.append(String.format(strFormat, position + 60, strHeaderBottom) + "\n");

					s1.append(String.format(strFormat, position + 90, printSeprator()) + "\n");
					position = position + 90;
				}

				for (int l = 0; l < jInnerData.length(); l++) {
					JSONArray jArr = jInnerData.getJSONArray(l);
					String strData = "";
					for (int m = 0; m < jArr.length(); m++) {
						strData = strData + getAccurateText(jArr.getString(m),
								hashValues.get(headers.getString(m).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(m).toString()));
					}
					position = position + 30;
					s1.append(String.format(strFormat, position, strData) + "\n");
				}
				if (jInnerData.length() > 0) {
					s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");
					s1.append(String.format(strFormat, position + 60, strTotal) + "\n");

				}
				if (jInnerData.length() > 0) {

					s1.append(String.format(strFormat, position + 90, printSeprator()) + "\n");
					position = position + 60;
				}

			}
			s1.append(String.format(strFormat, position + 60, getAccurateText("ENDING ODOMETER READING", 50, 2)
					+ getAccurateText(object.getString("endreading"), 10, 2)) + "\n");
			s1.append(String.format(strFormat, position + 90, getAccurateText("STARTING ODOMETER READING", 50, 2)
					+ getAccurateText(object.getString("startreading"), 10, 2)) + "\n");

			s1.append(String.format(strFormat, position + 120,
					getAccurateText("TOTAL KILOMETRS", 50, 2) + getAccurateText(object.getString("totalkm"), 10, 2))
					+ "\n");

			s1.append(String.format(strFormat, position + 180,
					getAccurateText("", 50, 2) + getAccurateText("SALESMAN", 43, 1)) + "\n");
			s1.append(String.format(strFormat, position + 240,
					getAccurateText(object.has("printstatus") ? object.getString("printstatus") : "", 93, 1)) + "\n");

			s1.append(String.format(strFormatBold, position + 260, getAccurateText(printSeprator(), 53, 1)) + "\n");
			position = position + 280;
			s1.append("\nPRINT\n");
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			e.printStackTrace();

		}

		return String.valueOf(s1).getBytes();
	}

	// ---------End
	// -------------start Route Summary Report Developed By Sujitv 7/1/2014
	byte[] printRouteSummaryReport(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {

			if (object.getString("addresssetting").equals("1")) {

				// String path = "my.png";
				// printer = new
				// com.zebra.android.printer.internal.ZebraPrinterCpcl
				// printer
				//
				// zebraPrinterConnection.write("! U1 JOURNAL\r\n! U1 SETFF 50
				// 2\r\n".getBytes());
				// printer.getGraphicsUtil().printImage("/sdcard/Switz.png",
				// 140, 10, -1, -1, false);

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");

				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");
				}
			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}

			s1.append(String.format(strFormat, 150, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 180, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 210,
					getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 93, 0)) + "\n");
			s1.append(String.format(strFormatTitle, 240, getAccurateText("ROUTE SUMMARY", 53, 1)) + "\n");

			int position = 230;
			// JSONArray jData = object.getJSONArray("data");
			s1.append(String.format(strFormatBold, position + 50, getAccurateText("VISIT DETAIL", 108, 0)) + "\n");

			s1.append(String.format(strFormat, position + 80,
					getAccurateText("SCANNED CUSTOMERS: ", 30, 0)
							+ getAccurateText(object.getString("ScannedCustomers"), 10, 0)
							+ getAccurateText("PLANNED CALLS:", 30, 0)
							+ getAccurateText(object.getString("PlannedCalls"), 10, 0))
					+ "\n");

			s1.append(String.format(strFormat, position + 110,
					getAccurateText("NON SCANNED CUSTOMER", 30, 0)
							+ getAccurateText(object.getString("NonScannedCustomers"), 10, 0)
							+ getAccurateText("CALLS MADE(PLANNED)", 30, 0)
							+ getAccurateText(object.getString("CallsMadePlanned"), 10, 0))
					+ "\n");

			s1.append(String.format(strFormat, position + 140,
					getAccurateText("NON SCANNED CUSTOMER", 30, 0)
							+ getAccurateText(object.getString("NonScannedCustomers"), 10, 0)
							+ getAccurateText("CALLS MADE(PLANNED)", 30, 0)
							+ getAccurateText(object.getString("CallsMadePlanned"), 10, 0))
					+ "\n");

			s1.append(String.format(strFormat, position + 170,
					getAccurateText("VOID INVOICES", 30, 0) + getAccurateText(object.getString("VoidInvoices"), 10, 0)
							+ getAccurateText("ACTUAL CALLS MADE", 30, 0)
							+ getAccurateText(object.getString("ActualCallsMade"), 10, 0))
					+ "\n");

			s1.append(String.format(strFormat, position + 200,
					getAccurateText("START TIME", 30, 0) + getAccurateText(object.getString("StartTime"), 10, 0)
							+ getAccurateText("INVOICED CALLS", 30, 0)
							+ getAccurateText(object.getString("InvoicedCalls"), 10, 0))
					+ "\n");
			s1.append(String.format(strFormat, position + 230,
					getAccurateText("END TIME", 30, 0) + getAccurateText(object.getString("EndTime"), 10, 0)
							+ getAccurateText("PRODUCTIVE CALLS", 30, 0)
							+ getAccurateText(object.getString("ProductiveCalls") + "%", 10, 0))
					+ "\n");
			s1.append(String.format(strFormat, position + 260,
					getAccurateText("TOTAL KMS RUN", 30, 0) + getAccurateText(object.getString("TotalKmsRun"), 10, 0)
							+ getAccurateText("COVERAGE", 30, 0)
							+ getAccurateText(object.getString("CoverageCalls") + "%", 10, 0))
					+ "\n");

			// s1.append(String.format(strFormat, position + 80,
			// getAccurateText("SHEDULED CUSTOMERS", 93, 0)) + "\n");
			//
			//
			//
			// s1.append(String.format(strFormat, position + 80,
			// getAccurateText(object.getString("SHEDULEDCUSTOMERS"), 35, 0)) +
			// "\n");
			// s1.append(String.format(strFormat, position + 110,
			// getAccurateText("CUSTOMER'S SERVICED", 93, 0)) + "\n");
			// s1.append(String.format(strFormat, position + 110,
			// getAccurateText(object.getString("CUSTOMERSERVICED"), 35, 0)) +
			// "\n");
			// s1.append(String.format(strFormat, position + 140,
			// getAccurateText("UNSHEDULED VISITS", 93, 0)) + "\n");
			// s1.append(String.format(strFormat, position + 140,
			// getAccurateText(object.getString("UNSHEDULEDVISITS"), 35, 0)) +
			// "\n");
			// s1.append(String.format(strFormat, position + 170,
			// getAccurateText("CUSTOMER'S NOT SERVICED", 93, 0)) + "\n");
			// s1.append(String.format(strFormat, position + 170,
			// getAccurateText(object.getString("CUSTOMERNOTSERVICED"), 35, 0))
			// + "\n");
			/*
			 * s1.append(String.format(strFormat, position + 200,
			 * getAccurateText("NON - SCANNED CUSTOMERS", 93, 0)) + "\n");
			 * s1.append(String.format(strFormat, position + 200,
			 * getAccurateText(object.getString("NONSCANNEDCUSTOMERS"), 35, 0)) + "\n");
			 */
			position = position + 80;
			s1.append(String.format(strFormatBold, position + 220, getAccurateText("INVENTORY - OVER/SHORT ", 88, 0))
					+ "\n");

			s1.append(String.format(strFormat, position + 250, getAccurateText("OPENING", 93, 0)) + "\n");
			s1.append(String.format(strFormat, position + 250, getAccurateText(object.getString("Opening"), 10, 2))
					+ "\n");
			s1.append(String.format(strFormat, position + 280, getAccurateText("LOADED", 93, 0)) + "\n");
			s1.append(String.format(strFormat, position + 280, getAccurateText(object.getString("Loaded"), 10, 2))
					+ "\n");
			s1.append(String.format(strFormat, position + 310, getAccurateText("TRANSFERED IN", 93, 0)) + "\n");
			s1.append(String.format(strFormat, position + 310, getAccurateText(object.getString("Transferin"), 10, 2))
					+ "\n");
			s1.append(String.format(strFormat, position + 340, getAccurateText("TRANSFERED OUT", 93, 0)) + "\n");
			s1.append(String.format(strFormat, position + 340, getAccurateText(object.getString("Transferout"), 35, 2))
					+ "\n");
			s1.append(String.format(strFormat, position + 370, getAccurateText("SALES & FREE", 93, 0)) + "\n");
			s1.append(String.format(strFormat, position + 370, getAccurateText(object.getString("salesfree"), 35, 2))
					+ "\n");
			/*
			 * s1.append(String.format(strFormat, position + 400,
			 * getAccurateText("DISCOUNT GIVEN", 93, 0)) + "\n");
			 * s1.append(String.format(strFormat, position + 400,
			 * getAccurateText(object.getString("discountgiven"), 35, 2)) + "\n");
			 */
			s1.append(String.format(strFormat, position + 430, getAccurateText("FRESH UNLOAD", 93, 0)) + "\n");
			s1.append(String.format(strFormat, position + 430, getAccurateText(object.getString("freshunload"), 35, 2))
					+ "\n");
			s1.append(String.format(strFormat, position + 460, getAccurateText("TRUCK DAMAGES", 93, 0)) + "\n");
			s1.append(String.format(strFormat, position + 460, getAccurateText(object.getString("truckdamage"), 35, 2))
					+ "\n");
			s1.append(String.format(strFormat, position + 490, getAccurateText("BAD RETURN", 93, 0)) + "\n");
			s1.append(String.format(strFormat, position + 490, getAccurateText(object.getString("badreturn"), 35, 2))
					+ "\n");
			s1.append(String.format(strFormat, position + 520, getAccurateText("BAD RETURN VARIENCE", 93, 0)) + "\n");
			s1.append(String.format(strFormat, position + 520,
					getAccurateText(object.getString("calculatedunload"), 55, 2)) + "\n");
			s1.append(String.format(strFormat, position + 550, getAccurateText("UNLOAD", 93, 0)) + "\n");
			s1.append(String.format(strFormat, position + 550, getAccurateText(object.getString("unload"), 55, 2))
					+ "\n");
			s1.append(String.format(strFormat, position + 580, getAccurateText("UNLOAD VARIENCE", 93, 0)) + "\n");
			s1.append(
					String.format(strFormat, position + 580, getAccurateText(object.getString("unloadvariance"), 55, 2))
							+ "\n");
			/*
			 * s1.append(String.format(strFormat, position + 550,
			 * getAccurateText("CALCULATED BAD RETURN", 93, 0)) + "\n");
			 * s1.append(String.format(strFormat, position + 550,
			 * getAccurateText(object.getString("calculatedunload"), 55, 2)) + "\n");
			 * s1.append(String.format(strFormat, position + 580,
			 * getAccurateText("UNLOADED BAD RETURN", 93, 0)) + "\n");
			 * s1.append(String.format(strFormat, position + 580,
			 * getAccurateText(object.getString("unloadbadreturn"), 55, 2)) + "\n");
			 * s1.append(String.format(strFormat, position + 610,
			 * getAccurateText("RETURN VARIANCE", 93, 0)) + "\n");
			 * s1.append(String.format(strFormat, position + 610,
			 * getAccurateText(object.getString("returnvarinace"), 55, 2)) + "\n");
			 */
			s1.append(String.format(strFormat, position + 630, getAccurateText("TOTAL INVENTORY VARIANCE", 93, 0))
					+ "\n");
			s1.append(String.format(strFormat, position + 630,
					getAccurateText(object.getString("Totalinvvarince"), 55, 2)) + "\n");
			s1.append(
					String.format(strFormatBold, position + 660, getAccurateText("CASH - OVER/SHORT ", 98, 0)) + "\n");
			s1.append(String.format(strFormat, position + 690, getAccurateText("TODAYS SALES", 93, 0)) + "\n");
			s1.append(String.format(strFormat, position + 690, getAccurateText(object.getString("todaysales"), 35, 2))
					+ "\n");
			s1.append(String.format(strFormat, position + 720, getAccurateText("CASH SALES", 65, 0)) + "\n");
			s1.append(String.format(strFormat, position + 720, getAccurateText(object.getString("cashsales"), 10, 2))
					+ "\n");
			s1.append(String.format(strFormat, position + 750, getAccurateText("CREDIT SALES", 65, 0)) + "\n");
			s1.append(String.format(strFormat, position + 750, getAccurateText(object.getString("creditsales"), 10, 2))
					+ "\n");
			s1.append(String.format(strFormat, position + 780, getAccurateText("TC SALES", 65, 0)) + "\n");
			s1.append(String.format(strFormat, position + 780, getAccurateText(object.getString("tcsales"), 10, 2))
					+ "\n");

			s1.append(String.format(strFormat, position + 810, getAccurateText("COLLECTIONS", 93, 0)) + "\n");
			s1.append(String.format(strFormat, position + 810, getAccurateText(object.getString("collection"), 35, 2))
					+ "\n");
			s1.append(String.format(strFormat, position + 840, getAccurateText("CASH", 65, 0)) + "\n");
			s1.append(
					String.format(strFormat, position + 840, getAccurateText(object.getString("cash"), 10, 2)) + "\n");
			s1.append(String.format(strFormat, position + 870, getAccurateText("CHEQUE", 65, 0)) + "\n");
			s1.append(String.format(strFormat, position + 870, getAccurateText(object.getString("cheque"), 10, 2))
					+ "\n");
			/*
			 * s1.append(String.format(strFormat, position + 930,
			 * getAccurateText("EXPENSES", 93, 0)) + "\n");
			 * s1.append(String.format(strFormat, position + 930,
			 * getAccurateText(object.getString("expense"), 35, 2)) + "\n");
			 * s1.append(String.format(strFormat, position + 960,
			 * getAccurateText("CASH ADJUSTMENT", 93, 0)) + "\n");
			 * s1.append(String.format(strFormat, position + 960,
			 * getAccurateText(object.getString("cashadj"), 10, 2)) + "\n");
			 * s1.append(String.format(strFormat, position + 990,
			 * getAccurateText("CHEQUE ADJUSTMENT", 93, 0)) + "\n");
			 * s1.append(String.format(strFormat, position + 990,
			 * getAccurateText(object.getString("chkadj"), 10, 2)) + "\n");
			 * s1.append(String.format(strFormat, position + 1020,
			 * getAccurateText("CALCULATED CASH DUE", 93, 0)) + "\n");
			 * s1.append(String.format(strFormat, position + 1020,
			 * getAccurateText(object.getString("calculatedcashdue"),55, 2)) + "\n");
			 * s1.append(String.format(strFormat, position + 1050,
			 * getAccurateText("CASH VARIANCE", 93, 0)) + "\n");
			 * s1.append(String.format(strFormat, position + 1050,
			 * getAccurateText(object.getString("cashvariance"), 55, 2)) + "\n");
			 * s1.append(String.format(strFormat, position + 1080,
			 * getAccurateText("NET CASH DUE", 93, 0)) + "\n");
			 * s1.append(String.format(strFormat, position + 1080,
			 * getAccurateText(object.getString("netcashdue"), 55,2)) + "\n");
			 */

			s1.append(String.format(strFormat, position + 920,
					getAccurateText("", 50, 2) + getAccurateText("SALESMAN", 43, 1)) + "\n");
			s1.append(String.format(strFormat, position + 960,
					getAccurateText(object.has("printstatus") ? object.getString("printstatus") : "", 93, 1)) + "\n");

			s1.append(String.format(strFormatBold, position + 1000, getAccurateText(printSeprator(), 53, 1)) + "\n");
			position = position + 1020;
			s1.append("\nPRINT\n");
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			e.printStackTrace();

		}

		return String.valueOf(s1).getBytes();
	}

	// ---------End
	// ----------Start Vanstock By Sujitv 9/1/2104
	byte[] printVanStockReport(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Item#", 9);
			hashValues.put("Description", 30);
			hashValues.put("Loaded Qty", 8);
			hashValues.put("Transfer Qty", 8);
			hashValues.put("Sale Qty", 8);
			hashValues.put("Return Qty", 9);
			hashValues.put("Truck Stock", 11);
			hashValues.put("Total", 6);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("Loaded Qty", 1);
			hashPositions.put("Transfer Qty", 1);
			hashPositions.put("Sale Qty", 1);
			hashPositions.put("Return Qty", 1);
			hashPositions.put("Truck Stock", 1);
			hashPositions.put("Total", 1);

			// s1.append("! 0 200 200 50 1\n");
			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");

				}

			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			s1.append(String.format(strFormat, 120, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 150, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			/*
			 * s1.append(String .format(strFormat, 180, getAccurateText( "DOCUMENT NO: " +
			 * object.getString("DOCUMENT NO"), 47, 0) + getAccurateText( "TRIP START DATE:"
			 * + object.getString("TRIP START DATE"), 46, 2)) + "\n");
			 */

			s1.append(String.format(strFormatBold, 220, getAccurateText("VAN STOCK SUMMARY " + (""), 53, 1)) + "\n");

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "";
			int MAXLEngth = 93;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}
			//
			String strHeaderBottom = "";
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

			}
			//
			/*
			 * for (int i = 0; i < headers.length(); i++) {
			 * 
			 * strheader = strheader + getAccurateText(headers.getString(i).toString(),
			 * hashValues.get(headers.getString(i).toString()) + MAXLEngth,
			 * hashPositions.get(headers .getString(i).toString()));
			 * 
			 * }
			 */

			s1.append(String.format(strFormat, 280, strheader) + "\n");
			if (strHeaderBottom.length() > 0) {
				s1.append(String.format(strFormat, 310, strHeaderBottom) + "\n");
			}
			s1.append(String.format(strFormat, 340, printSeprator()) + "\n");

			JSONArray jData = object.getJSONArray("data");
			int position = 340;
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					if (j != 8) {
						strData = strData + getAccurateText(jArr.getString(j),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					}
				}

				position = position + 30;
				s1.append(String.format(strFormat, position, strData) + "\n");
			}
			s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");

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
				s1.append(String.format(strFormat, position + 60, strTotal) + "\n");
			}
			s1.append(String.format(strFormat, position + 90, "\n"));
			/*
			 * s1.append(String.format( strFormat, position + 120,
			 * getAccurateText("STORE KEEPER", 47, 1) + getAccurateText("TO SALESMAN", 46,
			 * 1)) + "\n");
			 * 
			 * s1.append(String.format(strFormat, position + 150,
			 * getAccurateText(object.getString("printstatus"), 93, 1)) + "\n");
			 */
			s1.append(String.format(strFormatBold, position + 180, getAccurateText(printSeprator(), 53, 1)) + "\n");
			s1.append("\nPRINT\n");

			position = position + 210;
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			e.printStackTrace();
		}
		return String.valueOf(s1).getBytes();
	}

	// ---------End Vanstock Report

	// ----------Start Load Request By Sujitv 9/1/2104
	byte[] printLoadRequestReport(JSONObject object) {
		StringBuffer s1 = new StringBuffer();
		try {
			hashValues = new HashMap<String, Integer>();
			hashValues.put("Sl#", 2);
			hashValues.put("Item#", 10);
			hashValues.put("Description", 30);
			hashValues.put("UPC", 8);
			hashValues.put("Case Price", 8);
			hashValues.put("Unit Price", 9);
			hashValues.put("Request Qty", 10);

			// hashValues.put("Truck Stock", 11);

			hashPositions = new HashMap<String, Integer>();
			hashPositions.put("Sl#", 0);
			hashPositions.put("Item#", 0);
			hashPositions.put("Description", 0);
			hashPositions.put("UPC", 1);
			hashPositions.put("Case Price", 1);
			hashPositions.put("Unit Price", 1);
			hashPositions.put("Request Qty", 1);

			// hashPositions.put("Truck Stock", 1);

			// s1.append("! 0 200 200 50 1\n");
			if (object.getString("addresssetting").equals("1")) {

				s1.append(String.format(strFormatHeader, 0, getAccurateText(object.getString("companyname"), 45, 1))
						+ "\n");
				s1.append(String.format(strFormatBold, 60, getAccurateText(object.getString("companyaddress"), 75, 1))
						+ "\n");
				if (object.has("contactinfo")) {
					s1.append(String.format(strFormatBold, 90, getAccurateText(object.getString("contactinfo"), 75, 1))
							+ "\n");

				}

			} else {
				// woosim.printBitmap("/sdcard/images/woosim.bmp");
			}
			s1.append(String.format(strFormat, 120, getAccurateText("ROUTE: " + object.getString("ROUTE"), 47, 0)
					+ getAccurateText("DATE:" + object.getString("DOC DATE"), 46, 2)) + "\n");
			s1.append(String.format(strFormat, 150, getAccurateText("SALESMAN: " + object.getString("SALESMAN"), 47, 0)
					+ getAccurateText("TIME:" + object.getString("TIME"), 46, 2)) + "\n");
			s1.append(
					String.format(strFormat, 180,
							getAccurateText("DOCUMENT NO: " + object.getString("DOCUMENT NO"), 47, 0)
									+ getAccurateText("TRIP START DATE:" + object.getString("TRIP START DATE"), 46, 2))
							+ "\n");

			s1.append(String.format(strFormatBold, 220, getAccurateText("LOAD REQUEST" + (""), 53, 1)) + "\n");
			s1.append(String.format(strFormat, 300,
					getAccurateText("Requested Delivery Date : " + object.getString("Requestdate"), 47, 0)
							+ getAccurateText("", 46, 2))
					+ "\n");

			JSONArray headers = object.getJSONArray("HEADERS");
			String strheader = "";
			int MAXLEngth = 93;
			for (int i = 0; i < headers.length(); i++) {

				MAXLEngth = MAXLEngth - hashValues.get(headers.getString(i).toString());
			}
			if (MAXLEngth > 0) {
				MAXLEngth = (int) MAXLEngth / headers.length();
			}
			//
			String strHeaderBottom = "";
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

			}
			//
			/*
			 * for (int i = 0; i < headers.length(); i++) {
			 * 
			 * strheader = strheader + getAccurateText(headers.getString(i).toString(),
			 * hashValues.get(headers.getString(i).toString()) + MAXLEngth,
			 * hashPositions.get(headers .getString(i).toString()));
			 * 
			 * }
			 */

			s1.append(String.format(strFormat, 360, strheader) + "\n");
			if (strHeaderBottom.length() > 0) {
				s1.append(String.format(strFormat, 390, strHeaderBottom) + "\n");
			}
			s1.append(String.format(strFormat, 410, printSeprator()) + "\n");

			JSONArray jData = object.getJSONArray("data");
			int position = 440;
			int slno = 0;
			for (int i = 0; i < jData.length(); i++) {
				JSONArray jArr = jData.getJSONArray(i);
				String strData = "";
				for (int j = 0; j < jArr.length(); j++) {
					String itemDescrion = jArr.getString(j);
					if (j == 0) {
						int sNo = slno + 1;
						itemDescrion = sNo + ".";
						slno++;

					}
					if (j == 0) {
						strData = strData + getAccurateText(itemDescrion,
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					} else {
						strData = strData + getAccurateText(jArr.getString(j),
								hashValues.get(headers.getString(j).toString()) + MAXLEngth,
								hashPositions.get(headers.getString(j).toString()));
					}
				}

				position = position + 30;
				s1.append(String.format(strFormat, position, strData) + "\n");
			}
			s1.append(String.format(strFormat, position + 30, printSeprator()) + "\n");

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
				s1.append(String.format(strFormat, position + 60, strTotal) + "\n");
			}
			s1.append(String.format(strFormat, position + 90, "\n"));

			s1.append(String.format(strFormatBold, position + 120,
					getAccurateText("Net Value: ", 51, 2) + getAccurateText(object.getString("netvalue"), 52, 2))
					+ "\n");

			s1.append(String.format(strFormat, position + 180,
					getAccurateText("STORE KEEPER", 46, 1) + getAccurateText("TO SALESMAN", 46, 1)) + "\n");
			/*
			 * s1.append(String.format( strFormat, position + 120,
			 * getAccurateText("STORE KEEPER", 47, 1) + getAccurateText("TO SALESMAN", 46,
			 * 1)) + "\n");
			 * 
			 * s1.append(String.format(strFormat, position + 150,
			 * getAccurateText(object.getString("printstatus"), 93, 1)) + "\n");
			 */
			s1.append(String.format(strFormatBold, position + 210, getAccurateText(printSeprator(), 53, 1)) + "\n");
			s1.append("\nPRINT\n");

			position = position + 240;
			LOG.d("POSITION", "" + position);
			s1.insert(0, "! 0 200 200 " + position + " 1\n");

		} catch (Exception e) {
			e.printStackTrace();
		}
		return String.valueOf(s1).getBytes();
	}

	// ---------End LoadRequest Report
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
