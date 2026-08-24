package com.phonegap.sfa;

import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;



public class LocationTrackHelper  extends org.apache.cordova.api.Plugin{
	private String callbackId = "";
	private JSONObject status;
	public PluginResult execute(String request, JSONArray querystring,
			String callbackId) {
		PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
		result.setKeepCallback(true);
		try {
			this.callbackId = callbackId;
			status = new JSONObject();
			Log.d("Init called", "init");
			status.put("state", true);
			//startservice();

		} catch (Exception e) {

			e.printStackTrace();
		}
		return result;
	}
	
	private void startservice(){
		
		Utility.scheduleLTService(cordova.getActivity());
		try {
			status.put("state", true);
			status.put("message", "Location fetched");
			sendUpdate(status,true);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		
	}
	private void sendUpdate(JSONObject obj, boolean keepCallback) {
		if (callbackId != null) {

			PluginResult result = new PluginResult(PluginResult.Status.OK, obj);
			success(result, this.callbackId);
		}
	}

}
