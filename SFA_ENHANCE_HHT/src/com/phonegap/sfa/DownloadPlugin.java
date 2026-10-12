package com.phonegap.sfa;

import java.io.File;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Environment;
import android.util.Log;
import android.widget.Toast;

public class DownloadPlugin extends Plugin {
	private JSONObject status;
	private String callbackId = "";
	DownloadManager mDownloadManager;
	private String request;
	private JSONArray jArr;
	private String url = "", version = "";
	private boolean isMsg = true;
	private String filename;

	@Override
	public PluginResult execute(String request, JSONArray querystring,
			String callbackId) {
		// TODO Auto-generated method stub
		PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
		result.setKeepCallback(true);
		// cordova.getActivity().runOnUiThread(new Runnable() {
		//
		// public void run() {
		// // TODO Auto-generated method stub
		// com.appaholics.updatechecker.DownloadManager d1=new
		// com.appaholics.updatechecker.DownloadManager(cordova.getActivity(),
		// true);
		// d1.execute("http://82.178.28.172:8086/upload/apk/SFA_UAE_TEST_1.1.20.apk");
		//
		// }
		// });

		try {
			this.callbackId = callbackId;
			status = new JSONObject();
			this.request = request;
			this.jArr = querystring;

			url = querystring.getJSONObject(0).getString("url");
			version = querystring.getJSONObject(0).getString("version");
			filename = ""
					+ url.substring(url.lastIndexOf("/") + 1, url.length());

			isMsg = querystring.getJSONObject(0).getBoolean("isMsg");
			Log.d("Init called", "init");
			status.put("state", true);
			if(Float.parseFloat(version) > Float.parseFloat(cordova
					.getActivity().getString(R.string.version))) {
				if (!isMsg) {


					ConnectivityManager connManager = (ConnectivityManager) cordova
							.getActivity().getSystemService(
									Context.CONNECTIVITY_SERVICE);
					NetworkInfo mWifi = connManager
							.getNetworkInfo(ConnectivityManager.TYPE_WIFI);

					// sujee commented 
                    NetworkInfo mMobileData = connManager
							.getNetworkInfo(ConnectivityManager.TYPE_MOBILE);
							

					if (mWifi.isConnected()) {

						File myFile = new File(
								Environment
										.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
										+ "/" + filename);
						if (myFile.exists()) {
							myFile.delete();
						}
							showProgressDialog();
							this.download();
//							cordova.getActivity().runOnUiThread(new Runnable() {
//
//								public void run() {
//									// showMessage("File Already Downloaded,\nPlease go to below folder to install\n"
//									// + Environment
//									// .getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)+"/"
//									// + filename);
//									// String filepath = Environment
//									// .getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)+"/"
//									// + filename;
//									// Uri fileLoc = Uri.fromFile(new
//									// File(filepath));
//									// Intent openIntent = new
//									// Intent(Intent.ACTION_VIEW);
//									// openIntent.setDataAndType(fileLoc,
//									// "application/vnd.android.package-archive");
//									// cordova.getActivity().startActivity(openIntent);
//									
//
//								}
//							});
						

					} 
                   else if(mMobileData.isConnected()) // Added by sujee to download using mobile data 
					{
						File myFile = new File(
			 					Environment
										.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
										+ "/" + filename);
						if (myFile.exists()) {
							myFile.delete();
						}
							showProgressDialog();
					this.download();
						
					}
					else {

						cordova.getActivity().runOnUiThread(new Runnable() {
							public void run() {
								//showMessage("Wifi Network is not available,Please update version when wifi netwotk available");
								showMessage(" Network is not available,Please update the version when network is available");
							}
						});
					}

				}else {
					cordova.getActivity().runOnUiThread(new Runnable() {

						public void run() {
							showMessage("New updates available,Please Go to utitlities and click on update version");
						}
					});
				}

			} else {
				cordova.getActivity().runOnUiThread(new Runnable() {

					public void run() {
						//showMessage("You have the latest version");
					}
				});
			}

		} catch (Exception e) {

			e.printStackTrace();
		}
		return result;
	}

	@SuppressLint("NewApi")
	public void download() {
		mDownloadManager = (DownloadManager) cordova.getActivity()
				.getSystemService(Context.DOWNLOAD_SERVICE);
		cordova.getActivity().registerReceiver(onComplete,
				new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));

		Uri uri = Uri.parse(url);

		mDownloadManager.enqueue(new DownloadManager.Request(uri)
				.setAllowedOverRoaming(false)
				.setAllowedNetworkTypes(
						DownloadManager.Request.NETWORK_WIFI
								| DownloadManager.Request.NETWORK_MOBILE)
				.setTitle("New Update Available")
				.setDescription("SFA")
				.setDestinationInExternalPublicDir(
						Environment.DIRECTORY_DOWNLOADS, filename)
				.setNotificationVisibility(
						DownloadManager.Request.VISIBILITY_VISIBLE));

	}

	BroadcastReceiver onComplete = new BroadcastReceiver() {
		public void onReceive(Context ctxt, Intent intent) {
			Toast.makeText(cordova.getActivity(),
					"Download Completed" + filename, Toast.LENGTH_SHORT).show();

			dismissProgressDialog();
			showMessage("Download is completed\nPlease go to below link to install latest apk\n"
					+ Environment
							.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
					+ filename);

			cordova.getActivity().runOnUiThread(new Runnable() {

				public void run() {
					// TODO Auto-generated method stub
					String filepath = Environment
							.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
							+ "/" + filename;
					Uri fileLoc = Uri.fromFile(new File(filepath));
					Intent openIntent = new Intent(Intent.ACTION_VIEW);
					openIntent.setDataAndType(fileLoc,
							"application/vnd.android.package-archive");
					cordova.getActivity().startActivity(openIntent);
				}
			});

		}
	};
	private MyProgressDialog progressDialog;

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
						})

				.setIcon(android.R.drawable.ic_dialog_alert).show();

	}

	/**
	 * Display custom progress dialog
	 */
	public void showProgressDialog() {
		cordova.getActivity().runOnUiThread(new Runnable() {

			public void run() {
				progressDialog = new MyProgressDialog(cordova.getActivity());
			}
		});

	}

	public void dismissProgressDialog() {

		cordova.getActivity().runOnUiThread(new Runnable() {
			public void run() {
				// Log.e("Progress **:", "Progress ******");
				if (progressDialog != null && progressDialog.isShowing()) {
					progressDialog.dismiss();
					progressDialog = null;

				}
			}
		});
	}

}
