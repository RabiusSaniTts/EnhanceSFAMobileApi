package com.phonegap.sfa;

import java.io.IOException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.util.Log;

import org.apache.cordova.api.CordovaInterface;
import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;

public class DataBaseHelper_Bk extends Plugin {
	DBHelper d1;
	JSONObject data = null;
	Logger l1 = new Logger();

	@Override
	public PluginResult execute(String request, JSONArray querystring,
			String arg2) {
		// TODO Auto-generated method stub
		try {
			
			String pName = this.getClass().getPackage().getName();
			if (request.equalsIgnoreCase("open")) {
				this.open("sfa", "/data/data/" + pName + "/databases/");

				return new PluginResult(PluginResult.Status.OK);
			} else if (request.equalsIgnoreCase("close")) {
				this.close();
				return new PluginResult(PluginResult.Status.OK);
			} else if (request.equalsIgnoreCase("insert")) {
				this.insert(querystring.getString(0));
				return new PluginResult(PluginResult.Status.OK);
			} else if (request.equalsIgnoreCase("copy2SdCard")) {
				this.copy2SdCard(querystring.getString(0));
				return new PluginResult(PluginResult.Status.OK);
			} else if (request.equalsIgnoreCase("select")) {
				try {
					Log.d("", "" + querystring.getString(0));
					data = this.select(querystring.getString(0));
					Log.d("", "responce--" + data.toString());
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				// sendJavascript("hello");

				return new PluginResult(PluginResult.Status.OK, data);
			}

		} catch (IOException e) {
			e.printStackTrace();
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		// TODO Auto-generated method stub
		String value = "ok";
		return new PluginResult(PluginResult.Status.OK, data);

	}

	void close() {
		// TODO Auto-generated method stub
		if (d1 != null) {
			d1.close();
		}
	}

	JSONObject select(String query) {
		
		JSONObject data = null;
		try {
			l1.appendLog(""+query);
			data = d1.execSelectQuery(query);
			
			
			Log.d("size", "" + data.toString());

		} catch (Exception e) {
			e.printStackTrace();
			l1.appendLog(e.getStackTrace().toString());
		}
		return data;
	}

	void open(String file, String folder) throws IOException {

		try {
			d1 = new DBHelper(cordova.getActivity().getApplicationContext());
			l1.appendLog("Database Open");
			d1.open();
		} catch (Exception e) {
			e.printStackTrace();
		}

	}

	void copy2SdCard(String routecode) {
		try {
			d1.copy2SD(routecode);
		} catch (Exception e) {
			Log.d("ErrorDBCopy", "" + e);
		}

	}

	void insert(String query) {
		try {
			l1.appendLog(""+query);
			d1.execInsertQuery(query);
			
		} catch (Exception e) {
			e.printStackTrace();
			l1.appendLog(e.getStackTrace().toString());
		}

	}

	void setBeginTransaction() {

		if (d1 != null) {

		}
	}
}
