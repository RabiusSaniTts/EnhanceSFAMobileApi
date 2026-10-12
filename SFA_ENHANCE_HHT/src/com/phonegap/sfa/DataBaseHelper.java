package com.phonegap.sfa;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.phonegap.sfa.chart.ItemMaster;
import com.phonegap.sfa.chart.PricingDetail1;
import com.phonegap.sfa.chart.ProductGroupDetail;
import com.phonegap.sfa.chart.ItemMustDetail;
import com.phonegap.sfa.chart.CustomerItemMapping;

import android.util.Log;
import java.util.Locale;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;

public class DataBaseHelper extends Plugin {
	DBHelper d1;
	JSONObject data = null;
	Logger l1 = new Logger();
	private String  callbackId="",callbackIdPricing="",callbackIdPromotion="",callbackIdCustomers="";
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
			} else if(request.equalsIgnoreCase("insertBulk")){
				this.callbackId = callbackId;
				Log.d("countFARMSFRE",""+querystring.toString());
				Log.d("countFARMSFRE",""+querystring.getJSONArray(0));
				ArrayList<ItemMaster> itemMasters = new Gson().fromJson(querystring.getJSONArray(0).toString(), new TypeToken<List<ItemMaster>>() {
		            }.getType());
				Log.d("count",""+itemMasters.size());
				insertBulk(itemMasters);
			} else if(request.equalsIgnoreCase("insertBulkPricing")){
				this.callbackIdPricing = callbackId;
				Log.d("countFARMSFRE",""+querystring.toString());
				Log.d("countFARMSFRE",""+querystring.getJSONArray(0));
				ArrayList<PricingDetail1> itemMasters = new Gson().fromJson(querystring.getJSONArray(0).toString(), new TypeToken<List<PricingDetail1>>() {
		            }.getType());
				Log.d("count",""+itemMasters.size());
				insertBulkPricing(itemMasters);
			}else if(request.equalsIgnoreCase("insertBulkGroupDetail")){
				this.callbackIdPromotion = callbackId;
				Log.d("countFARMSFRE",""+querystring.toString());
				Log.d("countFARMSFRE",""+querystring.getJSONArray(0));
				ArrayList<ProductGroupDetail> itemMasters = new Gson().fromJson(querystring.getJSONArray(0).toString(), new TypeToken<List<ProductGroupDetail>>() {
		            }.getType());
				Log.d("count",""+itemMasters.size());
				insertBulkProductGroup(itemMasters);
			}else if(request.equalsIgnoreCase("insertBulkItemList")){
				this.callbackIdPromotion = callbackId;
				Log.d("countFARMSFRE",""+querystring.toString());
				Log.d("countFARMSFRE",""+querystring.getJSONArray(0));
				ArrayList<ItemMustDetail> itemMasters = new Gson().fromJson(querystring.getJSONArray(0).toString(), new TypeToken<List<ItemMustDetail>>() {
		            }.getType());
				Log.d("count",""+itemMasters.size());
				insertBulkItemMust(itemMasters);
			}else if(request.equalsIgnoreCase("insertBulkCustomerMapping")){
				this.callbackIdPromotion = callbackId;
				Log.d("countFARMSFRE",""+querystring.toString());
				Log.d("countFARMSFRE",""+querystring.getJSONArray(0));
				ArrayList<CustomerItemMapping> itemMasters = new Gson().fromJson(querystring.getJSONArray(0).toString(), new TypeToken<List<CustomerItemMapping>>() {
		            }.getType());
				Log.d("count",""+itemMasters.size());
				insertBulkCustomerMapping(itemMasters);
			}
			
			else if (request.equalsIgnoreCase("copy2SdCard")) {
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
	
	void insertBulk(ArrayList<ItemMaster> itemMasters){
		try{
			d1.setBeginTransaction();
			d1.clearMaster(DBHelper.TABLE_ITEMMASTER);
			if (itemMasters != null && itemMasters.size() > 0)
			{
				if(d1!=null){
					
					d1.insertItemMaster(itemMasters);
				}
			}
		}catch(Exception e){
			e.printStackTrace();
		}finally{
			
			d1.setEndTransaction();
			PluginResult result = new PluginResult(PluginResult.Status.OK, "");
			result.setKeepCallback(false);
			this.success(result, this.callbackId);
		}
		
		
		
	}
	
	void insertBulkPricing(ArrayList<PricingDetail1> itemMasters){
		try{
			d1.setBeginTransaction();
			d1.clearMaster(DBHelper.TABLE_PRICINGDETAIL);
			if (itemMasters != null && itemMasters.size() > 0)
			{
				if(d1!=null){
					
					d1.insertPricingDetail1(itemMasters);
				}
			}
		}catch(Exception e){
			e.printStackTrace();
		}finally{
			
			d1.setEndTransaction();
			PluginResult result = new PluginResult(PluginResult.Status.OK, "");
			result.setKeepCallback(false);
			this.success(result, this.callbackIdPricing);
		}
	}
	
	void insertBulkProductGroup(ArrayList<ProductGroupDetail> itemMasters){
		try{
			d1.setBeginTransaction();
			d1.clearMaster(DBHelper.TABLE_PRODUCTGROUP);
			if (itemMasters != null && itemMasters.size() > 0)
			{
				if(d1!=null){
					
					d1.insertProGroupDetails(itemMasters);
				}
			}
		}catch(Exception e){
			e.printStackTrace();
		}finally{
			
			d1.setEndTransaction();
			PluginResult result = new PluginResult(PluginResult.Status.OK, "");
			result.setKeepCallback(false);
			this.success(result, this.callbackIdPromotion);
		}
		
		
	}
	
	
			void insertBulkItemMust(ArrayList<ItemMustDetail> itemMasters){
			try{
			d1.setBeginTransaction();
			d1.clearMaster(DBHelper.TABLE_ITEMMUSTDETAIL);
			if (itemMasters != null && itemMasters.size() > 0)
			{
				if(d1!=null){
					
					d1.insertItemMustDetail(itemMasters);
				}
			}
			}catch(Exception e){
			e.printStackTrace();
			}finally{
			
			d1.setEndTransaction();
			PluginResult result = new PluginResult(PluginResult.Status.OK, "");
			result.setKeepCallback(false);
			this.success(result, this.callbackIdPromotion);
			}
			
			
			}
			
			void insertBulkCustomerMapping(ArrayList<CustomerItemMapping> itemMasters){
			try{
			d1.setBeginTransaction();
			d1.clearMaster(DBHelper.TABLE_CUSTOMERMAPPING);
			if (itemMasters != null && itemMasters.size() > 0)
			{
				if(d1!=null){
					
					d1.insertCustomerItemMapping(itemMasters);
				}
			}
			}catch(Exception e){
			e.printStackTrace();
			}finally{
			
			d1.setEndTransaction();
			PluginResult result = new PluginResult(PluginResult.Status.OK, "");
			result.setKeepCallback(false);
			this.success(result, this.callbackIdPromotion);
			}
			
			
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
			String normalizedQuery = query == null ? "" : query.toLowerCase(Locale.US);
			if (normalizedQuery.contains("startendday") || normalizedQuery.contains("routemaster")) {
				LocationUpdateService.reconcileWithRouteState(
						cordova.getActivity().getApplicationContext());
			}
			
		} catch (Exception e) {
			e.printStackTrace();
			l1.appendLog(e.getStackTrace().toString());
		}

	}
	
	 
	JSONObject raju(String query) {
		
		JSONObject data = null;
		Log.e("Called", "Start of Plugin"+ query);
		
//		try {
//			l1.appendLog(""+query);
//			data = d1.execSelectQuery(query);
//			
//			
//			Log.d("size", "" + data.toString());
//
//		} catch (Exception e) {
//			e.printStackTrace();
//			l1.appendLog(e.getStackTrace().toString());
//		}
		return data;
	}

	void setBeginTransaction() {

		if (d1 != null) {

		}
	}
}
