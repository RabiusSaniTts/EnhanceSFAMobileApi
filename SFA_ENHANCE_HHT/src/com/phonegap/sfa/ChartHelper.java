package com.phonegap.sfa;

import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;

import android.content.Intent;


import com.phonegap.sfa.chart.PieChartActivity;

public class ChartHelper extends org.apache.cordova.api.Plugin {
	private JSONObject status;
	public static final String PARAM_CHART="chart";
	private String callbackId = "";
	private JSONArray jRoutes;
	public PluginResult execute(String request, JSONArray querystring,
			String callbackId) {

		PluginResult result = new PluginResult(PluginResult.Status.NO_RESULT);
		result.setKeepCallback(true);
		try {
			this.callbackId = callbackId;
			status = new JSONObject();
			status.put("state", true);
			this.jRoutes=querystring;
			showChart();
		} catch (Exception e) {

			e.printStackTrace();
		}
		return result;
	}

	private void showChart() {
//		cordova.getActivity().startActivity(
//				new Intent(cordova.getActivity(), MapActivity.class).putExtra(PARAM_GEO, jRoutes.toString()));
		cordova.getActivity().startActivity(
				new Intent(cordova.getActivity(), PieChartActivity.class).putExtra(PARAM_CHART, jRoutes.toString()));

	}

}
