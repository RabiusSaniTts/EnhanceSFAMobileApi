package com.phonegap.sfa;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.itextpdf.text.List;

//import com.itextpdf.text.pdf.PdfStructTreeController.returnType;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.support.v4.content.FileProvider;
import android.util.Log;
import jxl.write.Boolean;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.Console;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * 
 * @author ion.pruteanu this is the cordova plugin java part that will send
 *         intent to the wizzit payment app the .js file related to this java
 *         part can be founded: ..\sfa_test\assets\www\js\WizzitIndent.js
 */
public class WizzitIndent extends CordovaPlugin {
	public static String TAG = "WIZZIT APP2APP";

	public static final String CONFIGURE = "CONFIGURE";
	public static final String PAYMENT = "PAYMENT";
	public static final String VIEWPROMO = "VIEWPROMO";
	public static final String VIEWPROMOORD = "VIEWPROMOORD";
	public static final String SYNC = "SYNC";
	public static final String UPLOAD = "UPLOAD";
	public static final String UPDATE = "UPDATE";
	public static final String TABLEUPDATE = "TABLEUPDATE";

	public static final Integer REQUEST_CODE_CONFIG = 1001;
	public static final Integer REQUEST_CODE_PAY = 1002;

	private CallbackContext callbackContext;

	// here the js calls are treated
	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
		try {

			this.callbackContext = callbackContext;
			int visitkey = args.getInt(0);
			String selpromoList = args.getString(1);
			String freeItemList = args.getString(2);
			String sql = "";
			int promoType = 0;
			int qualitype = 0;
			int qualigroup = 0;
			int assigngroup = 0;		 	   
			double promoRuleAmt = 0;
			double promoVal = 0;
			int itemCode = 0;
			int itemQty = 0;
			int invItemQty = 0;
			int planNo = 0;
			double itemSaleAmt = 0;
			double itemRetAmt = 0;			 
			double headPromoVal = 0;
			double headPromoVat = 0;
			double currentHeadPromoVal = 0;
			int promoenforce = 0;
			int itemsalesqty = 0;
			int itemretqty = 0;
			double itemsalesamt = 0;
			double itemretamt = 0;
			int customerCode = 0;
			int applyTax = 0;
			
			
			String msg = "";
			JSONObject countdata = null;
			JSONObject data = null;
			JSONArray detailDataList;
			JSONArray detailDataList1;
			JSONArray CustomerDataList;
			JSONArray CustomerTax;
			
			//String baseAddr = "http://enomsfa01.westeurope.cloudapp.azure.com:8095/sfa/enhance_live/";
			
		    // String baseAddr = "http://wjtts.fortiddns.com:8095/sfa/enhancetest/";
			
	        //String baseAddr = "http://enomsfa01.westeurope.cloudapp.azure.com:8095/sfa/enhance_uat/";
			//String baseAddr = "https://routepro.enhance-group.com/";
			String baseAddr = "https://routeprouat.enhance-group.com/";
			DBHelper d1 = new DBHelper(cordova.getActivity().getApplicationContext());

			if (action.equals(SYNC)) {
				String datasync = "";
				int rCode = visitkey;
				InputStream iStream = null;
				HttpURLConnection urlConnection = null;
				JSONObject cmData;
				String cCode = "", cName = "";
					
							 
					  
						
				;
				try {
					// URL url = new
					// URL("http://enomsfa01.westeurope.cloudapp.azure.com:8095/sfa/enhancetest/api/index/getsyncdata1/routeid/"+rCode+"/userid/-1/deviceid/0/mdate/2024-05-25/table/4");
					// URL url = new
					// URL("http://enomsfa01.westeurope.cloudapp.azure.com:8095/sfa/enhance_live/api/index/getsyncdata1/routeid/"+rCode+"/userid/-1/deviceid/0/mdate/2024-05-25/table/4");
					URL url = new URL(baseAddr + "api/index/getsyncdata1/routeid/" + rCode
							+ "/userid/-1/deviceid/0/mdate/2024-05-25/table/4");

					urlConnection = (HttpURLConnection) url.openConnection();
					urlConnection.connect();
					iStream = urlConnection.getInputStream();
					BufferedReader br = new BufferedReader(new InputStreamReader(
							iStream));
					StringBuffer sb = new StringBuffer();
					String line = "";
					while ((line = br.readLine()) != null) {
						sb.append(line);
					}
					datasync = sb.toString();

					JSONObject jsonObject = new JSONObject(datasync);

					JSONArray cp = jsonObject.getJSONArray("ControlPanel");
					JSONArray sp = jsonObject.getJSONArray("Setup");
					JSONArray cmp = jsonObject.getJSONArray("companydetail");
					JSONArray sm = jsonObject.getJSONArray("SalesmanMaster");
					JSONArray rm = jsonObject.getJSONArray("RouteMaster");
					JSONArray sed = jsonObject.getJSONArray("startendday");
					JSONArray st = jsonObject.getJSONArray("synctime");
					JSONArray cur = jsonObject.getJSONArray("CurrencyMaster");
																						  
					JSONArray itmsth = jsonObject.getJSONArray("itemmustheader");
					JSONArray itmstd = jsonObject.getJSONArray("itemmustdetail");
					JSONArray itgrp = jsonObject.getJSONArray("itemgroup");
					JSONArray im = jsonObject.getJSONArray("ItemMaster");
					JSONArray ipkg = jsonObject.getJSONArray("itempackagemaster");
					JSONArray rgoal = jsonObject.getJSONArray("routegoal");
					JSONArray avgqty = jsonObject.getJSONArray("avgsalesqty");
					JSONArray outlet = jsonObject.getJSONArray("outletitemcodes");
					JSONArray tax = jsonObject.getJSONArray("taxmaster");
					JSONArray sld = jsonObject.getJSONArray("startingloaddetail");
					JSONArray invsum = jsonObject.getJSONArray("inventorysummarydetail");
					JSONArray cm = jsonObject.getJSONArray("CustomerMaster");
					JSONArray cal = jsonObject.getJSONArray("salescalender");
					JSONArray seq = jsonObject.getJSONArray("routesequence");
					JSONArray custinv = jsonObject.getJSONArray("customerinvoice");
					JSONArray disckeyh = jsonObject.getJSONArray("discountkeyheader");
					JSONArray disckeyd = jsonObject.getJSONArray("discountkeydetail");
					JSONArray distri = jsonObject.getJSONArray("distributionkeydetails");
					JSONArray prdgrph = jsonObject.getJSONArray("productgroupheader");
					JSONArray prdgrpd = jsonObject.getJSONArray("productgroupdetail");
					JSONArray promokh = jsonObject.getJSONArray("promokeyheader");
					JSONArray promokd = jsonObject.getJSONArray("promokeydetail");
					JSONArray promoph = jsonObject.getJSONArray("promoplanheader");
					JSONArray promopd = jsonObject.getJSONArray("promoplandetail");
					JSONArray promoassd = jsonObject.getJSONArray("promotionassignmentadvanced");
					JSONArray prc1 = jsonObject.getJSONArray("customerpricing1");
					JSONArray prcd = jsonObject.getJSONArray("pricingdetail1");
					JSONArray pos = jsonObject.getJSONArray("POSmaster");
					JSONArray posinv = jsonObject.getJSONArray("customerposinventory");
					JSONArray poslmt = jsonObject.getJSONArray("customerposlimit");
					JSONArray posinstr = jsonObject.getJSONArray("posinstructions");
					JSONArray srvpln = jsonObject.getJSONArray("customersurveyplan");
					JSONArray srvkeyp = jsonObject.getJSONArray("customersurveykeyplan");
					JSONArray srvkey = jsonObject.getJSONArray("customersurveykey");
					JSONArray srvdef = jsonObject.getJSONArray("customersurveydefinition");
					JSONArray srvass = jsonObject.getJSONArray("customersurveydefassign");
					JSONArray look = jsonObject.getJSONArray("lookupindexdetail");
					JSONArray nonsrv = jsonObject.getJSONArray("nonservreasons");
					JSONArray expr = jsonObject.getJSONArray("expreasons");
					JSONArray expretr = jsonObject.getJSONArray("expiryreturnreasons");
					JSONArray retr = jsonObject.getJSONArray("retitmreasons");
					JSONArray freer = jsonObject.getJSONArray("freegoodreasons");
					JSONArray voidr = jsonObject.getJSONArray("voidreasons");
					JSONArray rbook = jsonObject.getJSONArray("routebook");
					JSONArray trend = jsonObject.getJSONArray("salestrend");
					JSONArray tempinv = jsonObject.getJSONArray("tempcustinventory");
					JSONArray cmsg = jsonObject.getJSONArray("customermessages");
					JSONArray smsg = jsonObject.getJSONArray("salesmanmessages");
					JSONArray van = jsonObject.getJSONArray("vanmaster");
					JSONArray bank = jsonObject.getJSONArray("bankmaster");
					JSONArray cash = jsonObject.getJSONArray("cashdesc");
					JSONArray invloc = jsonObject.getJSONArray("inventorylocation");
					JSONArray ordh = jsonObject.getJSONArray("salesorderheader");
					JSONArray ordd = jsonObject.getJSONArray("salesorderdetail");
					JSONArray sugg = jsonObject.getJSONArray("suggestedsalesinvoice");
					JSONArray invtxn = jsonObject.getJSONArray("inventorytransactiondetail");
					JSONArray focb = jsonObject.getJSONArray("customer_foc_balance");
					JSONArray focd = jsonObject.getJSONArray("customer_foc_detail");
					JSONArray jp = jsonObject.getJSONArray("journeyplancreditlimit");
					JSONArray batch = jsonObject.getJSONArray("batchexpirydetail");
					JSONArray cfoc = jsonObject.getJSONArray("customer_foc");
					JSONArray inrp = jsonObject.getJSONArray("itemnrp");
					JSONArray cnrp = jsonObject.getJSONArray("custnrp");
					JSONArray cmdel = jsonObject.getJSONArray("deletemaster");
					JSONArray citgrp = jsonObject.getJSONArray("customeritemgrp");
					JSONArray citmap = jsonObject.getJSONArray("customeritemmap");
					br.close();

					// Control Panel
					sql = "DELETE FROM CONTROLPANEL";
					d1.execInsertQuery(sql);
					for (int i = 0, size = cp.length(); i < size; i++) {
						JSONObject cpi = cp.getJSONObject(i);
						sql = "INSERT INTO CONTROLPANEL(flagvalue, flagid, formid, flagname, status) VALUES ("
								+ "'" + cpi.getString("flagvalue") + "',"
								+ "'" + cpi.getString("flagid") + "',"
								+ "'" + cpi.getString("formid") + "',"
								+ "'" + cpi.getString("flagname") + "',"
								+ "'" + cpi.getString("status") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}

					}

					// Setup
					sql = "DELETE FROM SETUP";
					d1.execInsertQuery(sql);
					for (int i = 0, size = sp.length(); i < size; i++) {
						JSONObject cpi = sp.getJSONObject(i);
						sql = "INSERT INTO SETUP(setupid,cutofdate,currencycode,currencysymbol,arbcurrencysymbol,conversionrate,decimalplaces,previousdayuploadflag,salesentryflag,returnentryflag,buybackentryflag,freegoodentryflag,buybackfreeentryflag,replacemententryflag,rententryflag,importfilespath,downloadfilespath,exportfilespath,backupfilespath,uploadfilespath,databasebackuppath,dailystdpricelistflag,allowcontrolonpreparefilesflag,allownormalgccollectionhhcflag,creditcontrolflag,allowpreparefilesafterupload,alloweditinvoicesequence,erpimportfilespath,erpexportfilespath,erpbackupfilespath,dataconimportfilespath,dataconexportfilespath,dataconbackupfilespath,isheadofficeflag,reopendayondepotflag,reopendayonrouteflag,datatransfereddate,dataconserverfilespath,allowtoopenfuturedayflag,transferinventoryflag,journeyplanflag,enableloadrequesttoloadout,downloadcompanyheaderflag,defaultsonpreparefilesflag,resenddatatoerpallowed,allowcashinvoiceoncreditcust,callrestrictiondaysflag,routesequenceplanflag,dataconfileformat,weekstartday,allowmorethanonesalesman,offtakeparameter,downloadoutletitemcodes,importprocess6920,versionid,docprefix,invprefix,cashinvprefix,orderprefix,arprefix,cashinvoiceseq,salesorderseq,arseq,cashinvoiceseqfullpay,nooforderdays,returninvoiceseq,cashinvoiceseqfullpaygc,returninvprefix,creditinvoiceseq,restrictpreparefile,defaultdepot,costpricepercentage,multidaypostingdate,synctimeinterval,tabletsyncmode) VALUES ("
								+ "'" + cpi.getString("setupid") + "',"
								+ "'" + cpi.getString("cutofdate") + "',"
								+ "'" + cpi.getString("currencycode") + "',"
								+ "'" + cpi.getString("currencysymbol") + "',"
								+ "'" + cpi.getString("arbcurrencysymbol") + "',"
								+ "'" + cpi.getString("conversionrate") + "',"
								+ "'" + cpi.getString("decimalplaces") + "',"
								+ "'" + cpi.getString("previousdayuploadflag") + "',"
								+ "'" + cpi.getString("salesentryflag") + "',"
								+ "'" + cpi.getString("returnentryflag") + "',"
								+ "'" + cpi.getString("buybackentryflag") + "',"
								+ "'" + cpi.getString("freegoodentryflag") + "',"
								+ "'" + cpi.getString("buybackfreeentryflag") + "',"
								+ "'" + cpi.getString("replacemententryflag") + "',"
								+ "'" + cpi.getString("rententryflag") + "',"
								+ "'" + cpi.getString("importfilespath") + "',"
								+ "'" + cpi.getString("downloadfilespath") + "',"
								+ "'" + cpi.getString("exportfilespath") + "',"
								+ "'" + cpi.getString("backupfilespath") + "',"
								+ "'" + cpi.getString("uploadfilespath") + "',"
								+ "'" + cpi.getString("databasebackuppath") + "',"
								+ "'" + cpi.getString("dailystdpricelistflag") + "',"
								+ "'" + cpi.getString("allowcontrolonpreparefilesflag") + "',"
								+ "'" + cpi.getString("allownormalgccollectionhhcflag") + "',"
								+ "'" + cpi.getString("creditcontrolflag") + "',"
								+ "'" + cpi.getString("allowpreparefilesafterupload") + "',"
								+ "'" + cpi.getString("alloweditinvoicesequence") + "',"
								+ "'" + cpi.getString("erpimportfilespath") + "',"
								+ "'" + cpi.getString("erpexportfilespath") + "',"
								+ "'" + cpi.getString("erpbackupfilespath") + "',"
								+ "'" + cpi.getString("dataconimportfilespath") + "',"
								+ "'" + cpi.getString("dataconexportfilespath") + "',"
								+ "'" + cpi.getString("dataconbackupfilespath") + "',"
								+ "'" + cpi.getString("isheadofficeflag") + "',"
								+ "'" + cpi.getString("reopendayondepotflag") + "',"
								+ "'" + cpi.getString("reopendayonrouteflag") + "',"
								+ "'" + cpi.getString("datatransfereddate") + "',"
								+ "'" + cpi.getString("dataconserverfilespath") + "',"
								+ "'" + cpi.getString("allowtoopenfuturedayflag") + "',"
								+ "'" + cpi.getString("transferinventoryflag") + "',"
								+ "'" + cpi.getString("journeyplanflag") + "',"
								+ "'" + cpi.getString("enableloadrequesttoloadout") + "',"
								+ "'" + cpi.getString("downloadcompanyheaderflag") + "',"
								+ "'" + cpi.getString("defaultsonpreparefilesflag") + "',"
								+ "'" + cpi.getString("resenddatatoerpallowed") + "',"
								+ "'" + cpi.getString("allowcashinvoiceoncreditcust") + "',"
								+ "'" + cpi.getString("callrestrictiondaysflag") + "',"
								+ "'" + cpi.getString("routesequenceplanflag") + "',"
								+ "'" + cpi.getString("dataconfileformat") + "',"
								+ "'" + cpi.getString("weekstartday") + "',"
								+ "'" + cpi.getString("allowmorethanonesalesman") + "',"
								+ "'" + cpi.getString("offtakeparameter") + "',"
								+ "'" + cpi.getString("downloadoutletitemcodes") + "',"
								+ "'" + cpi.getString("importprocess6920") + "',"
								+ "'" + cpi.getString("versionid") + "',"
								+ "'" + cpi.getString("docprefix") + "',"
								+ "'" + cpi.getString("invprefix") + "',"
								+ "'" + cpi.getString("cashinvprefix") + "',"
								+ "'" + cpi.getString("orderprefix") + "',"
								+ "'" + cpi.getString("arprefix") + "',"
								+ "'" + cpi.getString("cashinvoiceseq") + "',"
								+ "'" + cpi.getString("salesorderseq") + "',"
								+ "'" + cpi.getString("arseq") + "',"
								+ "'" + cpi.getString("cashinvoiceseqfullpay") + "',"
								+ "'" + cpi.getString("nooforderdays") + "',"
								+ "'" + cpi.getString("returninvoiceseq") + "',"
								+ "'" + cpi.getString("cashinvoiceseqfullpaygc") + "',"
								+ "'" + cpi.getString("returninvprefix") + "',"
								+ "'" + cpi.getString("creditinvoiceseq") + "',"
								+ "'" + cpi.getString("restrictpreparefile") + "',"
								+ "'" + cpi.getString("defaultdepot") + "',"
								+ "'" + cpi.getString("costpricepercentage") + "',"
								+ "'" + cpi.getString("multidaypostingdate") + "',"
								+ "'" + cpi.getString("synctimeinterval") + "',"
								+ "'" + cpi.getString("tabletsyncmode") + "'"

								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}

					}

					// Company
					sql = "DELETE FROM COMPANY";
					d1.execInsertQuery(sql);
					for (int i = 0, size = cmp.length(); i < size; i++) {
						JSONObject cmpi = cmp.getJSONObject(i);
						sql = "insert into company(cmpycode,name, address, telephone,fax,nationalsalesmanagercode,contactname,city,country,arbcompanyname,alternatecmpycode,created,cdat, modified, mdat,zipcode, countrycode,countryname,arbcountryname,distributorcode1, distributorcode2,activestatus,parentcompany,txreg_number,enfooternote,arbfooternote,enlabelfooternote,arblabelfooternote) values ("
								+ "'" + cmpi.getString("cmpycode") + "',"
								+ "'" + cmpi.getString("name") + "',"
								+ "'" + cmpi.getString("address") + "',"
								+ "'" + cmpi.getString("telephone") + "',"
								+ "'" + cmpi.getString("fax") + "',"
								+ "'" + cmpi.getString("nationalsalesmanagercode") + "',"
								+ "'" + cmpi.getString("contactname") + "',"
								+ "'" + cmpi.getString("city") + "',"
								+ "'" + cmpi.getString("country") + "',"
								+ "'" + cmpi.getString("arbcompanyname") + "',"
								+ "'" + cmpi.getString("alternatecmpycode") + "',"
								+ "'" + cmpi.getString("created") + "',"
								+ "'" + cmpi.getString("cdat") + "',"
								+ "'" + cmpi.getString("modified") + "',"
								+ "'" + cmpi.getString("mdat") + "',"
								+ "'" + cmpi.getString("zipcode") + "',"
								+ "'" + cmpi.getString("countrycode") + "',"
								+ "'" + cmpi.getString("countryname") + "',"
								+ "'" + cmpi.getString("arbcountryname") + "',"
								+ "'" + cmpi.getString("distributorcode1") + "',"
								+ "'" + cmpi.getString("distributorcode2") + "',"
								+ "'" + cmpi.getString("activestatus") + "',"
								+ "'" + cmpi.getString("parentcompany") + "',"
								+ "'" + cmpi.getString("txreg_number") + "',"
								+ "'" + cmpi.getString("enfooternote") + "',"
								+ "'" + cmpi.getString("arbfooternote") + "',"
								+ "'" + cmpi.getString("enlabelfooternote") + "',"
								+ "'" + cmpi.getString("arblabelfooternote") + "'"
								+ ")";

						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// Salesman
					sql = "DELETE FROM salesman";
					d1.execInsertQuery(sql);
					for (int i = 0, size = sm.length(); i < size; i++) {
						JSONObject cmpi = sm.getJSONObject(i);
						sql = "insert into salesman(salesmancode, salesmanname1, salesmanname2, arbsalesmanname1, messagekey, "
								+ "pricingkey,created, cdat, modified, mdat, memo1, memo2, alternatesalesmancode, "
								+ "type, activestatus, parentcompany, ansalesmancode, username, userpassword) values ("
								+ "'" + cmpi.getString("salesmancode") + "',"
								+ "'" + cmpi.getString("salesmanname1") + "',"
								+ "'" + cmpi.getString("salesmanname2") + "',"
								+ "'" + cmpi.getString("arbsalesmanname1") + "',"
								+ "'" + cmpi.getString("messagekey") + "',"
								+ "'" + cmpi.getString("pricingkey") + "',"
								+ "'" + cmpi.getString("created") + "',"
								+ "'" + cmpi.getString("cdat") + "',"
								+ "'" + cmpi.getString("modified") + "',"
								+ "'" + cmpi.getString("mdat") + "',"
								+ "'" + cmpi.getString("memo1") + "',"
								+ "'" + cmpi.getString("memo2") + "',"
								+ "'" + cmpi.getString("alternatesalesmancode") + "',"
								+ "'" + cmpi.getString("type") + "',"
								+ "'" + cmpi.getString("activestatus") + "',"
								+ "'" + cmpi.getString("parentcompany") + "',"
								+ "'" + cmpi.getString("ansalesmancode") + "',"
								+ "'" + cmpi.getString("username") + "',"
								+ "'" + cmpi.getString("userpassword") + "'"
								+ ")";

						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// Route Master
					sql = "DELETE FROM ROUTEMASTER";
					d1.execInsertQuery(sql);
					for (int i = 0, size = rm.length(); i < size; i++) {
						JSONObject cpi = rm.getJSONObject(i);
						try {
							sql = "insert into ROUTEMASTER(routecode,routename,arbroutename,subareacode,salesmancode,created,cdat,modified,mdat,memo1,memo2,hhcordseq,hhcinvseq,hhccshseq,hhcivtseq,bodocseq,boinvseq,vehiclenumber,vehicleodometer,enablescanneruse,password1,password2,password3,password4,password5,passwordarray01,passwordarray02,passwordarray03,passwordarray04,passwordarray05,passwordarray06,passwordarray07,passwordarray08,passwordarray09,passwordarray10,passwordarray11,passwordarray12,passwordarray13,passwordarray14,passwordarray15,passwordarray16,enabledelayprint,promptodominput,enableeodexpenses,enableeodadjchecks,enableeodaddchecks,reqeoddepositreport,reqeodsalesreport,reqeodrteactivreport,reqeodrtestlmtreport,reqeodroutereviewrpt,reqeodrtnexchreport,reqeodplacementsrpt,reqeodprcchgreport,reqeodpromosreport,reqeodnosalereport,reqeodnondelreport,reqeodexceptionrpt,reqeodunauthbalance,reqeodroasummary,inventorycaseinput,loadreqreportformat,includeloadrequest,loadoutadjustments,autocalculateloadin,requireloadin,loadsheetreport,inventoryvariance,invenoversell,enablenosale,enablepostvoid,cashbalance,amountdecimaldigits,unloadoversellmessage,displayinvsummary,alternateroutecode,enabledamagedtrxn,defaultdeliverydays,reqeodnonscannedreport,reqeododomlogreport,inventoryvalueprint,loadaccessafterunload,routebalance,depotrouteflag,routeinventoryvariance,allowpopulateload,enableaddcustomer,allowgctocash,usesalesdateflag,enablestartdaydatetimeedit,newcustomerseqnumber,enableloadtransfer,loadreqmethod,loadreqrolluporders,routeprinter,depotprinter,routetype,enablescancustomer,enforcecallsequence,enablefoclimit,enablemiddaytelecom,printdocumentnumber,activestatus,enablecashonlydiscount,eodreportcontrol,pdcthreshold,itemcodedisplay,routeitemgrpcode,itemdescriptiondisplay,lastcustomersequence,loadsecurityflag,routecatcode,usealternatecodes,enabledraftcopy,boarseq,boordseq,hhcarseq,hhcloadseq,boloadseq,deliveryroute,presalesorder,hhcappversion,usesequenceflag,customerseq,routeseqno,allowbalcheck,allowedradius,cmpycode,regionmstcode,expirylimit,runningvalue,transactionnoseq,enablefreereason,maximumgpsallowed,defaultrequestdays,salesmantargetdays,hhcinvretseq,enableautopostingaccount,variancecustomercode,forcesettlementdays,routecreditcheck,routecreditlimit,routecreditlimitdays,itemmustkey,inventoryreportcontrol,enablestockicon,enablegps,enforcegps,updategps,divisioncode,viewdeductionflag,saleslimitflag,minsaleslimit,maxsaleslimit,maxorderholddays,enforcegeocheckout,enablefss,enablegpstracking,enablearcollection) values ("
									+ "'" + cpi.getString("routecode") + "',"
									+ "'" + cpi.getString("routename") + "',"
									+ "'" + cpi.getString("arbroutename") + "',"
									+ "'" + cpi.getString("subareacode") + "',"
									+ "'" + cpi.getString("salesmancode") + "',"
									+ "'" + cpi.getString("created") + "',"
									+ "'" + cpi.getString("cdat") + "',"
									+ "'" + cpi.getString("modified") + "',"
									+ "'" + cpi.getString("mdat") + "',"
									+ "'" + cpi.getString("memo1") + "',"
									+ "'" + cpi.getString("memo2") + "',"
									+ "'" + cpi.getString("hhcordseq") + "',"
									+ "'" + cpi.getString("hhcinvseq") + "',"
									+ "'" + cpi.getString("hhccshseq") + "',"
									+ "'" + cpi.getString("hhcivtseq") + "',"
									+ "'" + cpi.getString("bodocseq") + "',"
									+ "'" + cpi.getString("boinvseq") + "',"
									+ "'" + cpi.getString("vehiclenumber") + "',"
									+ "'" + cpi.getString("vehicleodometer") + "',"
									+ "'" + cpi.getString("enablescanneruse") + "',"
									+ "'" + cpi.getString("password1") + "',"
									+ "'" + cpi.getString("password2") + "',"
									+ "'" + cpi.getString("password3") + "',"
									+ "'" + cpi.getString("password4") + "',"
									+ "'" + cpi.getString("password5") + "',"
									+ "'" + cpi.getString("passwordarray01") + "',"
									+ "'" + cpi.getString("passwordarray02") + "',"
									+ "'" + cpi.getString("passwordarray03") + "',"
									+ "'" + cpi.getString("passwordarray04") + "',"
									+ "'" + cpi.getString("passwordarray05") + "',"
									+ "'" + cpi.getString("passwordarray06") + "',"
									+ "'" + cpi.getString("passwordarray07") + "',"
									+ "'" + cpi.getString("passwordarray08") + "',"
									+ "'" + cpi.getString("passwordarray09") + "',"
									+ "'" + cpi.getString("passwordarray10") + "',"
									+ "'" + cpi.getString("passwordarray11") + "',"
									+ "'" + cpi.getString("passwordarray12") + "',"
									+ "'" + cpi.getString("passwordarray13") + "',"
									+ "'" + cpi.getString("passwordarray14") + "',"
									+ "'" + cpi.getString("passwordarray15") + "',"
									+ "'" + cpi.getString("passwordarray16") + "',"
									+ "'" + cpi.getString("enabledelayprint") + "',"
									+ "'" + cpi.getString("promptodominput") + "',"
									+ "'" + cpi.getString("enableeodexpenses") + "',"
									+ "'" + cpi.getString("enableeodadjchecks") + "',"
									+ "'" + cpi.getString("enableeodaddchecks") + "',"
									+ "'" + cpi.getString("reqeoddepositreport") + "',"
									+ "'" + cpi.getString("reqeodsalesreport") + "',"
									+ "'" + cpi.getString("reqeodrteactivreport") + "',"
									+ "'" + cpi.getString("reqeodrtestlmtreport") + "',"
									+ "'" + cpi.getString("reqeodroutereviewrpt") + "',"
									+ "'" + cpi.getString("reqeodrtnexchreport") + "',"
									+ "'" + cpi.getString("reqeodplacementsrpt") + "',"
									+ "'" + cpi.getString("reqeodprcchgreport") + "',"
									+ "'" + cpi.getString("reqeodpromosreport") + "',"
									+ "'" + cpi.getString("reqeodnosalereport") + "',"
									+ "'" + cpi.getString("reqeodnondelreport") + "',"
									+ "'" + cpi.getString("reqeodexceptionrpt") + "',"
									+ "'" + cpi.getString("reqeodunauthbalance") + "',"
									+ "'" + cpi.getString("reqeodroasummary") + "',"
									+ "'" + cpi.getString("inventorycaseinput") + "',"
									+ "'" + cpi.getString("loadreqreportformat") + "',"
									+ "'" + cpi.getString("includeloadrequest") + "',"
									+ "'" + cpi.getString("loadoutadjustments") + "',"
									+ "'" + cpi.getString("autocalculateloadin") + "',"
									+ "'" + cpi.getString("requireloadin") + "',"
									+ "'" + cpi.getString("loadsheetreport") + "',"
									+ "'" + cpi.getString("inventoryvariance") + "',"
									+ "'" + cpi.getString("invenoversell") + "',"
									+ "'" + cpi.getString("enablenosale") + "',"
									+ "'" + cpi.getString("enablepostvoid") + "',"
									+ "'" + cpi.getString("cashbalance") + "',"
									+ "'" + cpi.getString("amountdecimaldigits") + "',"
									+ "'" + cpi.getString("unloadoversellmessage") + "',"
									+ "'" + cpi.getString("displayinvsummary") + "',"
									+ "'" + cpi.getString("alternateroutecode") + "',"
									+ "'" + cpi.getString("enabledamagedtrxn") + "',"
									+ "'" + cpi.getString("defaultdeliverydays") + "',"
									+ "'" + cpi.getString("reqeodnonscannedreport") + "',"
									+ "'" + cpi.getString("reqeododomlogreport") + "',"
									+ "'" + cpi.getString("inventoryvalueprint") + "',"
									+ "'" + cpi.getString("loadaccessafterunload") + "',"
									+ "'" + cpi.getString("routebalance") + "',"
									+ "'" + cpi.getString("depotrouteflag") + "',"
									+ "'" + cpi.getString("routeinventoryvariance") + "',"
									+ "'" + cpi.getString("allowpopulateload") + "',"
									+ "'" + cpi.getString("enableaddcustomer") + "',"
									+ "'" + cpi.getString("allowgctocash") + "',"
									+ "'" + cpi.getString("usesalesdateflag") + "',"
									+ "'" + cpi.getString("enablestartdaydatetimeedit") + "',"
									+ "'" + cpi.getString("newcustomerseqnumber") + "',"
									+ "'" + cpi.getString("enableloadtransfer") + "',"
									+ "'" + cpi.getString("loadreqmethod") + "',"
									+ "'" + cpi.getString("loadreqrolluporders") + "',"
									+ "'" + cpi.getString("routeprinter") + "',"
									+ "'" + cpi.getString("depotprinter") + "',"
									+ "'" + cpi.getString("routetype") + "',"
									+ "'" + cpi.getString("enablescancustomer") + "',"
									+ "'" + cpi.getString("enforcecallsequence") + "',"
									+ "'" + cpi.getString("enablefoclimit") + "',"
									+ "'" + cpi.getString("enablemiddaytelecom") + "',"
									+ "'" + cpi.getString("printdocumentnumber") + "',"
									+ "'" + cpi.getString("activestatus") + "',"
									+ "'" + cpi.getString("enablecashonlydiscount") + "',"
									+ "'" + cpi.getString("eodreportcontrol") + "',"
									+ "'" + cpi.getString("pdcthreshold") + "',"
									+ "'" + cpi.getString("itemcodedisplay") + "',"
									+ "'" + cpi.getString("routeitemgrpcode") + "',"
									+ "'" + cpi.getString("itemdescriptiondisplay") + "',"
									+ "'" + cpi.getString("lastcustomersequence") + "',"
									+ "'" + cpi.getString("loadsecurityflag") + "',"
									+ "'" + cpi.getString("routecatcode") + "',"
									+ "'" + cpi.getString("usealternatecodes") + "',"
									+ "'" + cpi.getString("enabledraftcopy") + "',"
									+ "'" + cpi.getString("boarseq") + "',"
									+ "'" + cpi.getString("boordseq") + "',"
									+ "'" + cpi.getString("hhcarseq") + "',"
									+ "'" + cpi.getString("hhcloadseq") + "',"
									+ "'" + cpi.getString("boloadseq") + "',"
									+ "'" + cpi.getString("deliveryroute") + "',"
									+ "'" + cpi.getString("presalesorder") + "',"
									+ "'" + cpi.getString("hhcappversion") + "',"
									+ "'" + cpi.getString("usesequenceflag") + "',"
									+ "'" + cpi.getString("customerseq") + "',"
									+ "'" + cpi.getString("routeseqno") + "',"
									+ "'" + cpi.getString("allowbalcheck") + "',"
									+ "'" + cpi.getString("allowedradius") + "',"
									+ "'" + cpi.getString("cmpycode") + "',"
									+ "'" + cpi.getString("regionmstcode") + "',"
									+ "'" + cpi.getString("expirylimit") + "',"
									+ "'" + cpi.getString("runningvalue") + "',"
									+ "'" + cpi.getString("transactionnoseq") + "',"
									+ "'" + cpi.getString("enablefreereason") + "',"
									+ "'" + cpi.getString("maximumgpsallowed") + "',"
									+ "'" + cpi.getString("defaultrequestdays") + "',"
									+ "'" + cpi.getString("salesmantargetdays") + "',"
									+ "'" + cpi.getString("hhcinvretseq") + "',"
									+ "'" + cpi.getString("enableautopostingaccount") + "',"
									+ "'" + cpi.getString("variancecustomercode") + "',"
									+ "'" + cpi.getString("forcesettlementdays") + "',"
									+ "'" + cpi.getString("routecreditcheck") + "',"
									+ "'" + cpi.getString("routecreditlimit") + "',"
									+ "'" + cpi.getString("routecreditlimitdays") + "',"
									+ "'" + cpi.getString("itemmustkey") + "',"
									+ "'" + cpi.getString("inventoryreportcontrol") + "',"
									+ "'" + cpi.getString("enablestockicon") + "',"
									+ "'" + cpi.getString("enablegps") + "',"
									+ "'" + cpi.getString("enforcegps") + "',"
									+ "'" + cpi.getString("updategps") + "',"
									+ "'" + cpi.getString("divisioncode") + "',"
									+ "'" + cpi.getString("viewdeductionflag") + "',"
									+ "'" + cpi.getString("saleslimitflag") + "',"
									+ "'" + cpi.getString("minsaleslimit") + "',"
									+ "'" + cpi.getString("maxsaleslimit") + "',"
									+ "'" + cpi.getString("maxorderholddays") + "',"
									+ "'" + cpi.getString("enforcegeocheckout") + "',"
									+ "'" + cpi.getString("enablefss") + "',"
									+ "'" + cpi.getString("enablegpstracking") + "',"
									+ "'" + cpi.getString("enablearcollection") + "'"
									
									+ ")";
						} catch (Exception ae) {
							String err = ae.toString();
							int ii = 0;
						}
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					/*
					 * //Startendday
					 * sql="DELETE FROM STARTENDDAY";
					 * d1.execInsertQuery(sql);
					 * for (int i = 0, size = sed.length(); i < size; i++)
					 * {
					 * JSONObject csi = sed.getJSONObject(i);
					 * 
					 * sql="INSERT INTO STARTENDDAY(routekey,routecode,salesmancode,routestartdate,routestarttime,routeenddate,routeendtime,routestartodometer,routeendodometer,totaldocuments,totalcash,totalchecks,totalcheckrequests,totalorderamount,totalinvoiceamount,totalchargesales,totalcashsales,totalacctsreceivable,totalexpenses,inventoryvariance,totalfullservicesales,totalfullservicecash,routeclosed,cashvariance,modifieddate,modifiedtime,subareacode,supervisorcode,areacode,areamanagercode,depotcode,branchmanagercode,cmpycode,nationalsalesmanagercode,dataconrefnumber,exportedflag,routesequence,currencycode,routejourneyid,data) VALUES ("
					 * +"'"+csi.getString("routekey")+"',"
					 * +"'"+csi.getString("routecode")+"',"
					 * +"'"+csi.getString("salesmancode")+"',"
					 * +"'"+csi.getString("routestartdate")+"',"
					 * +"'"+csi.getString("routestarttime")+"',"
					 * +"'"+csi.getString("routeenddate")+"',"
					 * +"'"+csi.getString("routeendtime")+"',"
					 * +"'"+csi.getString("routestartodometer")+"',"
					 * +"'"+csi.getString("routeendodometer")+"',"
					 * +"'"+csi.getString("totaldocuments")+"',"
					 * +"'"+csi.getString("totalcash")+"',"
					 * +"'"+csi.getString("totalchecks")+"',"
					 * +"'"+csi.getString("totalcheckrequests")+"',"
					 * +"'"+csi.getString("totalorderamount")+"',"
					 * +"'"+csi.getString("totalinvoiceamount")+"',"
					 * +"'"+csi.getString("totalchargesales")+"',"
					 * +"'"+csi.getString("totalcashsales")+"',"
					 * +"'"+csi.getString("totalacctsreceivable")+"',"
					 * +"'"+csi.getString("totalexpenses")+"',"
					 * +"'"+csi.getString("inventoryvariance")+"',"
					 * +"'"+csi.getString("totalfullservicesales")+"',"
					 * +"'"+csi.getString("totalfullservicecash")+"',"
					 * +"'"+csi.getString("routeclosed")+"',"
					 * +"'"+csi.getString("cashvariance")+"',"
					 * +"'"+csi.getString("modifieddate")+"',"
					 * +"'"+csi.getString("modifiedtime")+"',"
					 * +"'"+csi.getString("subareacode")+"',"
					 * +"'"+csi.getString("supervisorcode")+"',"
					 * +"'"+csi.getString("areacode")+"',"
					 * +"'"+csi.getString("areamanagercode")+"',"
					 * +"'"+csi.getString("depotcode")+"',"
					 * +"'"+csi.getString("branchmanagercode")+"',"
					 * +"'"+csi.getString("cmpycode")+"',"
					 * +"'"+csi.getString("nationalsalesmanagercode")+"',"
					 * +"'"+csi.getString("dataconrefnumber")+"',"
					 * +"'"+csi.getString("exportedflag")+"',"
					 * +"'"+csi.getString("routesequence")+"',"
					 * +"'"+csi.getString("currencycode")+"',"
					 * +"'"+csi.getString("routejourneyid")+"',"
					 * +"'"+csi.getString("data")+"'"
					 * + ")";
					 * try
					 * {
					 * d1.execInsertQuery(sql);
					 * }
					 * catch(Exception ar)
					 * {
					 * int ee = 1;
					 * }
					 * }
					 */
					// Currency Master

					sql = "DELETE FROM CURRENCYMASTER";
					d1.execInsertQuery(sql);
					for (int i = 0, size = cur.length(); i < size; i++) {
						JSONObject csi = cur.getJSONObject(i);

						sql = "INSERT INTO CURRENCYMASTER(currencycode,currencyname, arbcurrencyname, currencysymbol, arbcurrencysymbol, decimalplaces,startdate,enddate, created, cdat, modified, mdat, defaultcurrency) VALUES ("
								+ "'" + csi.getString("currencycode") + "',"
								+ "'" + csi.getString("currencyname") + "',"
								+ "'" + csi.getString("arbcurrencyname") + "',"
								+ "'" + csi.getString("currencysymbol") + "',"
								+ "'" + csi.getString("arbcurrencysymbol") + "',"
								+ "'" + csi.getString("decimalplaces") + "',"
								+ "'" + csi.getString("startdate") + "',"
								+ "'" + csi.getString("enddate") + "',"
								+ "'" + csi.getString("created") + "',"
								+ "'" + csi.getString("cdat") + "',"
								+ "'" + csi.getString("modified") + "',"
								+ "'" + csi.getString("mdat") + "',"
								+ "'" + csi.getString("defaultcurrency") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}
					
					//Item Must Header
					sql="delete from itemmustheader";
					d1.execInsertQuery(sql);
					for (int i = 0, size = itmsth.length(); i < size; i++)
					{
						JSONObject csi = itmsth.getJSONObject(i);
					      sql="INSERT INTO itemmustheader(itemmustcode,itemmustdescription,arbitemmustdescription,created,cdat,modified,mdat) VALUES ("
					    		  +"'"+csi.getString("itemmustcode")+"',"
					    		  +"'"+csi.getString("itemmustdescription")+"',"
					    		  +"'"+csi.getString("arbitemmustdescription")+"',"
					    		  +"'"+csi.getString("created")+"',"
					    		  +"'"+csi.getString("cdat")+"',"
					    		  +"'"+csi.getString("modified")+"',"
					    		  +"'"+csi.getString("mdat")+"'"				    		  		    		  
								+ ")";
								try
								{
									d1.execInsertQuery(sql);
								}
							    catch(Exception ar)
							    {
							    	int ee = 1;
							    }
					}
					
					//Item Must Detail
					sql="delete from itemmustdetail";
					d1.execInsertQuery(sql);
					for (int i = 0, size = itmstd.length(); i < size; i++)
					{
						JSONObject csi = itmstd.getJSONObject(i);
					      sql="INSERT INTO itemmustdetail(primary_key,itemmustcode,itemcode,quantity,mdat,active,mslqty) VALUES ("
					    		  +"'"+csi.getString("primary_key")+"',"
					    		  +"'"+csi.getString("itemmustcode")+"',"
					    		  +"'"+csi.getString("itemcode")+"',"
					    		  +"'"+csi.getString("quantity")+"',"
					    		  +"'"+csi.getString("mdat")+"',"
					    		  +"'"+csi.getString("active")+"',"					    		 
					    		  +"'"+csi.getString("max_quantity")+"'"				    		  		    		  
								+ ")";
								try
								{
									d1.execInsertQuery(sql);
								}
							    catch(Exception ar)
							    {
							    	int ee = 1;
							    }
					}
	 

					// Item Group
					sql = "DELETE FROM itemgroup";
					d1.execInsertQuery(sql);
					for (int i = 0, size = itgrp.length(); i < size; i++) {
						JSONObject csi = itgrp.getJSONObject(i);

						sql = "INSERT INTO itemgroup(itemgroupcode, submajorcategorycode, itemgroupname, arbitemgroup, activestatus) VALUES ("
								+ "'" + csi.getString("itemgroupcode") + "',"
								+ "'" + csi.getString("submajorcategorycode") + "',"
								+ "'" + csi.getString("itemgroupname") + "',"
								+ "'" + csi.getString("arbitemgroup") + "',"
								+ "'" + csi.getString("activestatus") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// iTEM mASTER
					sql = "DELETE FROM ITEMMASTER";
					d1.execInsertQuery(sql);
					for (int i = 0, size = im.length(); i < size; i++) {
						JSONObject csi = im.getJSONObject(i);

						sql = "INSERT INTO ITEMMASTER(actualitemcode, itemgroupcode, itemtype, itemshortdescription, itemdescription, unitspercase, defaultsalesprice, defaultreturnprice, arbitemshortdescription, arbitemdescription, activeitem, caseprice, returncaseprice, alternatecode, memo1, memo2, tcallowed, printsequenceroute, printsequencecust, packagecode, warehousestock, defaultgoodreturnprice, defaultgoodreturncaseprice, allowbatchentry, barcode1, barcode2, barcode3, majorcategorycode, majorcategorydesciption, submajorcategorycode, submajorcategorydesciption, companygroupcode, companygroupname, itemgroupname, enabletax, itemtaxkey1, itemtaxkey2, itemtaxkey3, nrp_flag, div_nrp_flag) VALUES ("
								+ "'" + csi.getString("actualitemcode") + "',"
								+ "'" + csi.getString("itemgroupcode") + "',"
								+ "'" + csi.getString("itemtype") + "',"
								+ "'" + csi.getString("itemshortdescription") + "',"
								+ "'" + csi.getString("itemdescription") + "',"
								+ "'" + csi.getString("unitspercase") + "',"
								+ "'" + csi.getString("defaultsalesprice") + "',"
								+ "'" + csi.getString("defaultreturnprice") + "',"
								+ "'" + csi.getString("arbitemshortdescription") + "',"
								+ "'" + csi.getString("arbitemdescription") + "',"
								+ "'" + csi.getString("activeitem") + "',"
								+ "'" + csi.getString("caseprice") + "',"
								+ "'" + csi.getString("returncaseprice") + "',"
								+ "'" + csi.getString("alternatecode") + "',"
								+ "'" + csi.getString("memo1") + "',"
								+ "'" + csi.getString("memo2") + "',"
								+ "'" + csi.getString("tcallowed") + "',"
								+ "'" + csi.getString("printsequenceroute") + "',"
								+ "'" + csi.getString("printsequencecust") + "',"
								+ "'" + csi.getString("packagecode") + "',"
								+ "'" + csi.getString("warehousestock") + "',"
								+ "'" + csi.getString("defaultgoodreturnprice") + "',"
								+ "'" + csi.getString("defaultgoodreturncaseprice") + "',"
								+ "'" + csi.getString("allowbatchentry") + "',"
								+ "'" + csi.getString("barcode1") + "',"
								+ "'" + csi.getString("barcode2") + "',"
								+ "'" + csi.getString("barcode3") + "',"
								+ "'" + csi.getString("majorcategorycode") + "',"
								+ "'" + csi.getString("majorcategorydesciption") + "',"
								+ "'" + csi.getString("submajorcategorycode") + "',"
								+ "'" + csi.getString("submajorcategorydesciption") + "',"
								+ "'" + csi.getString("companygroupcode") + "',"
								+ "'" + csi.getString("companygroupname") + "',"
								+ "'" + csi.getString("itemgroupname") + "',"
								+ "'" + csi.getString("enabletax") + "',"
								+ "'" + csi.getString("itemtaxkey1") + "',"
								+ "'" + csi.getString("itemtaxkey2") + "',"
								+ "'" + csi.getString("itemtaxkey3") + "',"
								+ "'" + csi.getString("nrp_flag") + "',"
								+ "'" + csi.getString("div_nrp_flag") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// Item Package Master
					sql = "DELETE FROM ITEMPACKAGEMASTER";
					d1.execInsertQuery(sql);
					for (int i = 0, size = ipkg.length(); i < size; i++) {
						JSONObject csi = ipkg.getJSONObject(i);

						sql = "INSERT INTO ITEMPACKAGEMASTER(packagecode, packagedescription, arbpackagedescription, activestatus) VALUES ("
								+ "'" + csi.getString("packagecode") + "',"
								+ "'" + csi.getString("packagedescription") + "',"
								+ "'" + csi.getString("arbpackagedescription") + "',"
								+ "'" + csi.getString("activestatus") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// rOUTE GOAL
					sql = "DELETE FROM ROUTEGOAL";
					d1.execInsertQuery(sql);
					for (int i = 0, size = rgoal.length(); i < size; i++) {
						JSONObject csi = rgoal.getJSONObject(i);

						sql = "INSERT INTO ROUTEGOAL(routecode,salesmancode,packagenumber,todaysgoal,todaysachieve,quotadesckey1,quotagoal1,quotaachieve1,quotareset1,quotadesckey2,quotagoal2,quotaachieve2,quotareset2,quotadesckey3,quotagoal3,quotaachieve3,quotareset3,created,cdat,modified,mdat,mmonth,fromdate,todate,quantity,achievequantity,targettype,primary_key,dailytarget,dailyvalue,mtdtarget,mtdvalue,progressivetarget,progressivevalue,asontarget,asonvalue) VALUES  ("
								+ "'" + csi.getString("routecode") + "',"
								+ "'" + csi.getString("salesmancode") + "',"
								+ "'" + csi.getString("packagenumber") + "',"
								+ "'" + csi.getString("todaysgoal") + "',"
								+ "'" + csi.getString("todaysachieve") + "',"
								+ "'" + csi.getString("quotadesckey1") + "',"
								+ "'" + csi.getString("quotagoal1") + "',"
								+ "'" + csi.getString("quotaachieve1") + "',"
								+ "'" + csi.getString("quotareset1") + "',"
								+ "'" + csi.getString("quotadesckey2") + "',"
								+ "'" + csi.getString("quotagoal2") + "',"
								+ "'" + csi.getString("quotaachieve2") + "',"
								+ "'" + csi.getString("quotareset2") + "',"
								+ "'" + csi.getString("quotadesckey3") + "',"
								+ "'" + csi.getString("quotagoal3") + "',"
								+ "'" + csi.getString("quotareset3") + "',"
								+ "'" + csi.getString("created") + "',"
								+ "'" + csi.getString("cdat") + "',"
								+ "'" + csi.getString("modified") + "',"
								+ "'" + csi.getString("mdat") + "',"
								+ "'" + csi.getString("mmonth") + "',"
								+ "'" + csi.getString("fromdate") + "',"
								+ "'" + csi.getString("todate") + "',"
								+ "'" + csi.getString("quantity") + "',"
								+ "'" + csi.getString("achievequantity") + "',"
								+ "'" + csi.getString("targettype") + "',"
								+ "'" + csi.getString("primary_key") + "',"
								+ "'" + csi.getString("dailytarget") + "',"
								+ "'" + csi.getString("dailyvalue") + "',"
								+ "'" + csi.getString("mtdtarget") + "',"
								+ "'" + csi.getString("mtdvalue") + "',"
								+ "'" + csi.getString("progressivetarget") + "',"
								+ "'" + csi.getString("progressivevalue") + "',"
								+ "'" + csi.getString("asontarget") + "',"
								+ "'" + csi.getString("asonvalue") + "'"								
								+ ")";
						try {
							 d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// AVG SALE QTY
					sql = "DELETE FROM AVERAGESALESQTY";
					d1.execInsertQuery(sql);
					for (int i = 0, size = avgqty.length(); i < size; i++) {
						JSONObject csi = avgqty.getJSONObject(i);

						sql = "INSERT INTO AVERAGESALESQTY(table_id, itemcode, routecode, itemqty) VALUES ( "
								+ "'" + csi.getString("table_id") + "',"
								+ "'" + csi.getString("itemcode") + "',"
								+ "'" + csi.getString("routecode") + "',"
								+ "'" + csi.getString("itemqty") + "'"
								+ ")";
						try {
							 d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// OUTLET ITEM CODES
					sql = "DELETE FROM OUTLETITEMCODES";
					d1.execInsertQuery(sql);
					for (int i = 0, size = outlet.length(); i < size; i++) {
						JSONObject csi = outlet.getJSONObject(i);

						sql = "INSERT INTO OUTLETITEMCODES(groupcode, itemcode, outletitemcode, customercode) VALUES ( "
								+ "'" + csi.getString("groupcode") + "',"
								+ "'" + csi.getString("itemcode") + "',"
								+ "'" + csi.getString("outletitemcode") + "',"
								+ "'" + csi.getString("customercode") + "'"
								+ ")";
						try {
							 d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// TAX MASTER
					sql = "DELETE FROM TAXMASTER";
					d1.execInsertQuery(sql);
					for (int i = 0, size = tax.length(); i < size; i++) {
						JSONObject csi = tax.getJSONObject(i);

						sql = "INSERT INTO TAXMASTER(taxcode, taxdescription, arbtaxdescription, taxtype, taxpercentage, taxbase) VALUES ( "
								+ "'" + csi.getString("taxcode") + "',"
								+ "'" + csi.getString("taxdescription") + "',"
								+ "'" + csi.getString("arbtaxdescription") + "',"
								+ "'" + csi.getString("taxtype") + "',"
								+ "'" + csi.getString("taxpercentage") + "',"
								+ "'" + csi.getString("taxbase") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// starting Load
					for (int i = 0, size = sld.length(); i < size; i++) {
						JSONObject csi = sld.getJSONObject(i);

						sql = "INSERT INTO startingloaddetail(itemcode, routecode, ddate, caseprice, loadperiodnumber, cases, units, totunits, suggtotunits,rcvdtotunits, upc, loadtime, salesmancode, salesprice, returnprice, status, transactiondate, erpreferencenumber, currencycode,batchnumber, expirydate, warehouse, warehousestock, mdat) VALUES ( "
								+ "'" + csi.getString("itemcode") + "',"
								+ "'" + csi.getString("routecode") + "',"
								+ "'" + csi.getString("ddate") + "',"
								+ "'" + csi.getString("caseprice") + "',"
								+ "'" + csi.getString("loadperiodnumber") + "',"
								+ "'" + csi.getString("cases") + "',"
								+ "'" + csi.getString("units") + "',"
								+ "'" + csi.getString("totunits") + "',"
								+ "'" + csi.getString("suggtotunits") + "',"
								+ "'" + csi.getString("rcvdtotunits") + "',"
								+ "'" + csi.getString("upc") + "',"
								+ "'" + csi.getString("loadtime") + "',"
								+ "'" + csi.getString("salesmancode") + "',"
								+ "'" + csi.getString("salesprice") + "',"
								+ "'" + csi.getString("returnprice") + "',"
								+ "'" + csi.getString("status") + "',"
								+ "'" + csi.getString("transactiondate") + "',"
								+ "'" + csi.getString("erpreferencenumber") + "',"
								+ "'" + csi.getString("currencycode") + "',"
								+ "'" + csi.getString("batchnumber") + "',"
								+ "'" + csi.getString("expirydate") + "',"
								+ "'" + csi.getString("warehouse") + "',"
								+ "'" + csi.getString("warehousestock") + "',"
								+ "'" + csi.getString("mdat") + "'"
								+ ") ";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// Customer Master
					sql = "DELETE FROM customermaster ";
					d1.execInsertQuery(sql);
					for (int i = 0, size = cm.length(); i < size; i++) {
						JSONObject cmi = cm.getJSONObject(i);
						cmData = cmi;

						sql = " INSERT INTO customermaster (barcode,roundingoffvalue,enablebatchselection,templatename,customercode,type,headofficecode,routecode,streetcode,districtcode,locationcode,customersequence,customername,customeraddress1,customeraddress2,customerphone,balance,customercategory,pricingkey,promotionkey,authorizeditemgrpkey,messagekey1,messagekey2,invoicepaymentterms,invoiceretailoption,invoicepriceoverride,invoiceretailoverride,invoiceformatoption,invoiceextensionopt,invoicedsdpromptopt,invoicecopies,salesinputoprion,returnsinputoption,invoiceinputstyle,onhandspromptopt,inventoryselectopt,invencontaineropt,queuedreportoption,surveykey,contactname,customertype,callfrequency,routenumber,arbcustomernameshort,arbcustomername,arbcustomeraddress1,arbcustomeraddress2,hhccustomernameshort,hhccustomername,hhccustomeraddress1,hhccustomeraddress2,allowbeyondlimit,tclimit,activecustomer,creditlimitdays,created,cdat,modified,mdat,forcehand,renteddisplay,installedchiller,monthlydepreciation,typeofgiveaway,giveawayflag,lastvisiteddate,memo1,memo2,tcsubtype,rentperc,customeraddress3,customercity,customerstate,customerzip,authorizeditemlistctl,invoicepriceprint,messagekey3,messagekey4,messagekey5,messagekey6,orderformat,enableupcprint,enabledelayprint,printsequence,enablepriceeditinvs,enablesellprevious,enablesuggestsales,enableautofillreturns,enableautofilldamaged,enablesigcapture,enablereturnstrxn,enableexchangetrxn,enabledamagedreturns,enablearcollection,enablesurveyaudit,enabledelivinstruct,enableinvoicecomment,invoicedetailentry,orderdetailentry,forcestockcapture,enablepromotrxn,alternatecode,creditlimit,allowcashoncreditexceed,arbcustomeraddress3,templateindicator,arbcontactname,printlanguageflag,quantumno,lostplacementdelivs,newplacementdelivs,currencycode,histmaxdeliveries,arcustomertype,custtaxkey1,custtaxkey2,custtaxkey3,customertaxid,customertaxidoptions,outletsubtype,volume,enablegovtaxnote,forwardcoverfactor,enablepromoeditinvs,enableaddlpromoinvs,badcreditcustomer,enableduplicateprinting,numoutstandinginv,enablefocprinting,promooptions,groupcode,forceposcheck,ancustomercode,printoutletitemcode,reportprintcontrol,invoicelimiter,exclusiveopmode,returnpromotionkey,invoiceformat,liquorlicprint,enablepromoeditords,enableaddlpromoords,enableaddlpromoinvoices,enableposequipment,enablesalestrxn,printcheckdetails,tcspecialdiscount,spldiscountdays,arabiccustomercity,threshholdlimit,discountkey,enforcepromotion,gpcustcode,cashonlypromo,roundnetamount,partialcollection,transactiontype,enabledraftcopy,enablebuybackfree,enablecpd,enablepaymentsel,gpsdata,fixedlatitude,fixedlongitude,rentkey,startdate,enddate,definitionvalue,runningvalue,rentcontrol,disablebalanceupdate,enablecreditlimit,autosettlecollection,enableinvoicecopy,pobox,shoptelephonenumber,shopfaxnumber,ownername,ownerlandlinenumber,ownermobilenumber,contactpersonlandlinenumber,contactpersonmobilenumber,contactpersonemail,purchasemanagername,purchasemanagerlandlinenumber,purchasemanagermobilenumber,purchasemanageremail,warehousemanagername,warehousemanagerlandlinenumber,warehousemanagermobilenumber,warehousemanageremail,expirylimit,exprunningvalue,distributionkey,gpssavecount,graceperiod,reportcustcode,enableadvancepayment,enablerental,itemmustkey,gracelimit,splitfree,visualcode,distribution_check_id,enablertnpwd,statementdays,itemmapkey,enforcemsl,custemail,applytax,traname,tranamearabic,taxregistrationnumber,anpflag,CreditTerms,taxcardno,crno,nrp_flag,saleslimitflag,minsaleslimit,maxsaleslimit,invpromoyn,invpromoplan,combopromoyn, combopromoplan, rebateprintyn) VALUES ( "
								+ "'" + cmData.getString("barcode") + "',"
								+ "'" + cmData.getString("roundingoffvalue") + "',"
								+ "'" + cmData.getString("enablebatchselection") + "',"
								+ "'" + cmData.getString("templatename") + "',"
								+ "'" + cmData.getString("customercode") + "',"
								+ "'" + cmData.getString("type") + "',"
								+ "'" + cmData.getString("headofficecode") + "',"
								+ "'" + cmData.getString("routecode") + "',"
								+ "'" + cmData.getString("streetcode") + "',"
								+ "'" + cmData.getString("districtcode") + "',"
								+ "'" + cmData.getString("locationcode") + "',"
								+ "'" + cmData.getString("customersequence") + "',"
								+ "'" + cmData.getString("customername") + "',"
								+ "'" + cmData.getString("customeraddress1") + "',"
								+ "'" + cmData.getString("customeraddress2") + "',"
								+ "'" + cmData.getString("customerphone") + "',"
								+ "'" + cmData.getString("balance") + "',"
								+ "'" + cmData.getString("customercategory") + "',"
								+ "'" + cmData.getString("pricingkey") + "',"
								+ "'" + cmData.getString("promotionkey") + "',"
								+ "'" + cmData.getString("authorizeditemgrpkey") + "',"
								+ "'" + cmData.getString("messagekey1") + "',"
								+ "'" + cmData.getString("messagekey2") + "',"
								+ "'" + cmData.getString("invoicepaymentterms") + "',"
								+ "'" + cmData.getString("invoiceretailoption") + "',"
								+ "'" + cmData.getString("invoicepriceoverride") + "',"
								+ "'" + cmData.getString("invoiceretailoverride") + "',"
								+ "'" + cmData.getString("invoiceformatoption") + "',"
								+ "'" + cmData.getString("invoiceextensionopt") + "',"
								+ "'" + cmData.getString("invoicedsdpromptopt") + "',"
								+ "'" + cmData.getString("invoicecopies") + "',"
								+ "'" + cmData.getString("salesinputoprion") + "',"
								+ "'" + cmData.getString("returnsinputoption") + "',"
								+ "'" + cmData.getString("invoiceinputstyle") + "',"
								+ "'" + cmData.getString("onhandspromptopt") + "',"
								+ "'" + cmData.getString("inventoryselectopt") + "',"
								+ "'" + cmData.getString("invencontaineropt") + "',"
								+ "'" + cmData.getString("queuedreportoption") + "',"
								+ "'" + cmData.getString("surveykey") + "',"
								+ "'" + cmData.getString("contactname") + "',"
								+ "'" + cmData.getString("customertype") + "',"
								+ "'" + cmData.getString("callfrequency") + "',"
								+ "'" + cmData.getString("routenumber") + "',"
								+ "'" + cmData.getString("arbcustomernameshort") + "',"
								+ "'" + cmData.getString("arbcustomername") + "',"
								+ "'" + cmData.getString("arbcustomeraddress1") + "',"
								+ "'" + cmData.getString("arbcustomeraddress2") + "',"
								+ "'" + cmData.getString("hhccustomernameshort") + "',"
								+ "'" + cmData.getString("hhccustomername") + "',"
								+ "'" + cmData.getString("hhccustomeraddress1") + "',"
								+ "'" + cmData.getString("hhccustomeraddress2") + "',"
								+ "'" + cmData.getString("allowbeyondlimit") + "',"
								+ "'" + cmData.getString("tclimit") + "',"
								+ "'" + cmData.getString("activecustomer") + "',"
								+ "'" + cmData.getString("creditlimitdays") + "',"
								+ "'" + cmData.getString("created") + "',"
								+ "'" + cmData.getString("cdat") + "',"
								+ "'" + cmData.getString("modified") + "',"
								+ "'" + cmData.getString("mdat") + "',"
								+ "'" + cmData.getString("forcehand") + "',"
								+ "'" + cmData.getString("renteddisplay") + "',"
								+ "'" + cmData.getString("installedchiller") + "',"
								+ "'" + cmData.getString("monthlydepreciation") + "',"
								+ "'" + cmData.getString("typeofgiveaway") + "',"
								+ "'" + cmData.getString("giveawayflag") + "',"
								+ "'" + cmData.getString("lastvisiteddate") + "',"
								+ "'" + cmData.getString("memo1") + "',"
								+ "'" + cmData.getString("memo2") + "',"
								+ "'" + cmData.getString("tcsubtype") + "',"
								+ "'" + cmData.getString("rentperc") + "',"
								+ "'" + cmData.getString("customeraddress3") + "',"
								+ "'" + cmData.getString("customercity") + "',"
								+ "'" + cmData.getString("customerstate") + "',"
								+ "'" + cmData.getString("customerzip") + "',"
								+ "'" + cmData.getString("authorizeditemlistctl") + "',"
								+ "'" + cmData.getString("invoicepriceprint") + "',"
								+ "'" + cmData.getString("messagekey3") + "',"
								+ "'" + cmData.getString("messagekey4") + "',"
								+ "'" + cmData.getString("messagekey5") + "',"
								+ "'" + cmData.getString("messagekey6") + "',"
								+ "'" + cmData.getString("orderformat") + "',"
								+ "'" + cmData.getString("enableupcprint") + "',"
								+ "'" + cmData.getString("enabledelayprint") + "',"
								+ "'" + cmData.getString("printsequence") + "',"
								+ "'" + cmData.getString("enablepriceeditinvs") + "',"
								+ "'" + cmData.getString("enablesellprevious") + "',"
								+ "'" + cmData.getString("enablesuggestsales") + "',"
								+ "'" + cmData.getString("enableautofillreturns") + "',"
								+ "'" + cmData.getString("enableautofilldamaged") + "',"
								+ "'" + cmData.getString("enablesigcapture") + "',"
								+ "'" + cmData.getString("enablereturnstrxn") + "',"
								+ "'" + cmData.getString("enableexchangetrxn") + "',"
								+ "'" + cmData.getString("enabledamagedreturns") + "',"
								+ "'" + cmData.getString("enablearcollection") + "',"
								+ "'" + cmData.getString("enablesurveyaudit") + "',"
								+ "'" + cmData.getString("enabledelivinstruct") + "',"
								+ "'" + cmData.getString("enableinvoicecomment") + "',"
								+ "'" + cmData.getString("invoicedetailentry") + "',"
								+ "'" + cmData.getString("orderdetailentry") + "',"
								+ "'" + cmData.getString("forcestockcapture") + "',"
								+ "'" + cmData.getString("enablepromotrxn") + "',"
								+ "'" + cmData.getString("alternatecode") + "',"
								+ "'" + cmData.getString("creditlimit") + "',"
								+ "'" + cmData.getString("allowcashoncreditexceed") + "',"
								+ "'" + cmData.getString("arbcustomeraddress3") + "',"
								+ "'" + cmData.getString("templateindicator") + "',"
								+ "'" + cmData.getString("arbcontactname") + "',"
								+ "'" + cmData.getString("printlanguageflag") + "',"
								+ "'" + cmData.getString("quantumno") + "',"
								+ "'" + cmData.getString("lostplacementdelivs") + "',"
								+ "'" + cmData.getString("newplacementdelivs") + "',"
								+ "'" + cmData.getString("currencycode") + "',"
								+ "'" + cmData.getString("histmaxdeliveries") + "',"
								+ "'" + cmData.getString("arcustomertype") + "',"
								+ "'" + cmData.getString("custtaxkey1") + "',"
								+ "'" + cmData.getString("custtaxkey2") + "',"
								+ "'" + cmData.getString("custtaxkey3") + "',"
								+ "'" + cmData.getString("customertaxid") + "',"
								+ "'" + cmData.getString("customertaxidoptions") + "',"
								+ "'" + cmData.getString("outletsubtype") + "',"
								+ "'" + cmData.getString("volume") + "',"
								+ "'" + cmData.getString("enablegovtaxnote") + "',"
								+ "'" + cmData.getString("forwardcoverfactor") + "',"
								+ "'" + cmData.getString("enablepromoeditinvs") + "',"
								+ "'" + cmData.getString("enableaddlpromoinvs") + "',"
								+ "'" + cmData.getString("badcreditcustomer") + "',"
								+ "'" + cmData.getString("enableduplicateprinting") + "',"
								+ "'" + cmData.getString("numoutstandinginv") + "',"
								+ "'" + cmData.getString("enablefocprinting") + "',"
								+ "'" + cmData.getString("promooptions") + "',"
								+ "'" + cmData.getString("groupcode") + "',"
								+ "'" + cmData.getString("forceposcheck") + "',"
								+ "'" + cmData.getString("ancustomercode") + "',"
								+ "'" + cmData.getString("printoutletitemcode") + "',"
								+ "'" + cmData.getString("reportprintcontrol") + "',"
								+ "'" + cmData.getString("invoicelimiter") + "',"
								+ "'" + cmData.getString("exclusiveopmode") + "',"
								+ "'" + cmData.getString("returnpromotionkey") + "',"
								+ "'" + cmData.getString("invoiceformat") + "',"
								+ "'" + cmData.getString("liquorlicprint") + "',"
								+ "'" + cmData.getString("enablepromoeditords") + "',"
								+ "'" + cmData.getString("enableaddlpromoords") + "',"
								+ "'" + cmData.getString("enableaddlpromoinvoices") + "',"
								+ "'" + cmData.getString("enableposequipment") + "',"
								+ "'" + cmData.getString("enablesalestrxn") + "',"
								+ "'" + cmData.getString("printcheckdetails") + "',"
								+ "'" + cmData.getString("tcspecialdiscount") + "',"
								+ "'" + cmData.getString("spldiscountdays") + "',"
								+ "'" + cmData.getString("arabiccustomercity") + "',"
								+ "'" + cmData.getString("threshholdlimit") + "',"
								+ "'" + cmData.getString("discountkey") + "',"
								+ "'" + cmData.getString("enforcepromotion") + "',"
								+ "'" + cmData.getString("gpcustcode") + "',"
								+ "'" + cmData.getString("cashonlypromo") + "',"
								+ "'" + cmData.getString("roundnetamount") + "',"
								+ "'" + cmData.getString("partialcollection") + "',"
								+ "'" + cmData.getString("transactiontype") + "',"
								+ "'" + cmData.getString("enabledraftcopy") + "',"
								+ "'" + cmData.getString("enablebuybackfree") + "',"
								+ "'" + cmData.getString("enablecpd") + "',"
								+ "'" + cmData.getString("enablepaymentsel") + "',"
								+ "'" + cmData.getString("gpsdata") + "',"
								+ "'" + cmData.getString("fixedlatitude") + "',"
								+ "'" + cmData.getString("fixedlongitude") + "',"
								+ "'" + cmData.getString("rentkey") + "',"
								+ "'" + cmData.getString("startdate") + "',"
								+ "'" + cmData.getString("enddate") + "',"
								+ "'" + cmData.getString("definitionvalue") + "',"
								+ "'" + cmData.getString("runningvalue") + "',"
								+ "'" + cmData.getString("rentcontrol") + "',"
								+ "'" + cmData.getString("disablebalanceupdate") + "',"
								+ "'" + cmData.getString("enablecreditlimit") + "',"
								+ "'" + cmData.getString("autosettlecollection") + "',"
								+ "'" + cmData.getString("enableinvoicecopy") + "',"
								+ "'" + cmData.getString("pobox") + "',"
								+ "'" + cmData.getString("shoptelephonenumber") + "',"
								+ "'" + cmData.getString("shopfaxnumber") + "',"
								+ "'" + cmData.getString("ownername") + "',"
								+ "'" + cmData.getString("ownerlandlinenumber") + "',"
								+ "'" + cmData.getString("ownermobilenumber") + "',"
								+ "'" + cmData.getString("contactpersonlandlinenumber") + "',"
								+ "'" + cmData.getString("contactpersonmobilenumber") + "',"
								+ "'" + cmData.getString("contactpersonemail") + "',"
								+ "'" + cmData.getString("purchasemanagername") + "',"
								+ "'" + cmData.getString("purchasemanagerlandlinenumber") + "',"
								+ "'" + cmData.getString("purchasemanagermobilenumber") + "',"
								+ "'" + cmData.getString("purchasemanageremail") + "',"
								+ "'" + cmData.getString("warehousemanagername") + "',"
								+ "'" + cmData.getString("warehousemanagerlandlinenumber") + "',"
								+ "'" + cmData.getString("warehousemanagermobilenumber") + "',"
								+ "'" + cmData.getString("warehousemanageremail") + "',"
								+ "'" + cmData.getString("expirylimit") + "',"
								+ "'" + cmData.getString("exprunningvalue") + "',"
								+ "'" + cmData.getString("distributionkey") + "',"
								+ "'" + cmData.getString("gpssavecount") + "',"
								+ "'" + cmData.getString("graceperiod") + "',"
								+ "'" + cmData.getString("reportcustcode") + "',"
								+ "'" + cmData.getString("enableadvancepayment") + "',"
								+ "'" + cmData.getString("enablerental") + "',"
								+ "'" + cmData.getString("itemmustkey") + "',"
								+ "'" + cmData.getString("gracelimit") + "',"
								+ "'" + cmData.getString("splitfree") + "',"
								+ "'" + cmData.getString("visualcode") + "',"
								+ "'" + cmData.getString("distribution_check_id") + "',"
								+ "'" + cmData.getString("enablereturnpassword") + "',"
								+ "'" + cmData.getString("statementdays") + "',"
								+ "'" + cmData.getString("itemmapkey") + "',"
								+ "'" + cmData.getString("enforcemsl") + "',"
								+ "'" + cmData.getString("custemail") + "',"
								+ "'" + cmData.getString("applytax") + "',"
								+ "'" + cmData.getString("traname") + "',"
								+ "'" + cmData.getString("tranamearabic") + "',"
								+ "'" + cmData.getString("taxregistrationnumber") + "',"
								+ "'" + cmData.getString("anpflag") + "',"
								+ "'" + cmData.getString("CreditTerms") + "',"
								+ "'" + cmData.getString("taxcardno") + "',"
								+ "'" + cmData.getString("crno") + "',"
								+ "'" + cmData.getString("nrp_flag") + "',"
								+ "'" + cmData.getString("saleslimitflag") + "',"
								+ "'" + cmData.getString("minsaleslimit") + "',"
								+ "'" + cmData.getString("maxsaleslimit") + "',"
								+ "'" + cmData.getString("invpromoyn") + "',"
								+ "'" + cmData.getString("invpromoplan") + "',"
								+ "'" + cmData.getString("combopromoyn") + "',"
								+ "'" + cmData.getString("combopromoplan") + "',"
								+ "'" + cmData.getString("rebateprintyn") + "'"
								+ " )";

						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}

					}

					// sales calender
					sql = "DELETE FROM SALESCALENDER";
					d1.execInsertQuery(sql);
					for (int i = 0, size = cal.length(); i < size; i++) {
						JSONObject csi = cal.getJSONObject(i);

						sql = "INSERT INTO SALESCALENDER(salesyear, weeknumber, weekstartdate, weekenddate, rp32weeknumber, salesperiod) VALUES ( "
								+ "'" + csi.getString("salesyear") + "',"
								+ "'" + csi.getString("weeknumber") + "',"
								+ "'" + csi.getString("weekstartdate") + "',"
								+ "'" + csi.getString("weekenddate") + "',"
								+ "'" + csi.getString("rp32weeknumber") + "',"
								+ "'" + csi.getString("salesperiod") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// rOUTE SEQUENCE
					sql = "DELETE FROM ROUTESEQUENCE";
					d1.execInsertQuery(sql);
					for (int i = 0, size = seq.length(); i < size; i++) {
						JSONObject csi = seq.getJSONObject(i);

						sql = "INSERT INTO ROUTESEQUENCE(rp32weeknumber, routecode, customercode, callrestrictiondays1, callrestrictiondays2, callrestrictiondays3, callrestrictiondays4, callrestrictiondays5, callrestrictiondays6, callrestrictiondays7, monseq, tueseq, wedseq, thuseq, friseq, satseq, sunseq) VALUES ( "
								+ "'" + csi.getString("rp32weeknumber") + "',"
								+ "'" + csi.getString("routecode") + "',"
								+ "'" + csi.getString("customercode") + "',"
								+ "'" + csi.getString("callrestrictiondays1") + "',"
								+ "'" + csi.getString("callrestrictiondays2") + "',"
								+ "'" + csi.getString("callrestrictiondays3") + "',"
								+ "'" + csi.getString("callrestrictiondays4") + "',"
								+ "'" + csi.getString("callrestrictiondays5") + "',"
								+ "'" + csi.getString("callrestrictiondays6") + "',"
								+ "'" + csi.getString("callrestrictiondays7") + "',"
								+ "'" + csi.getString("monseq") + "',"
								+ "'" + csi.getString("tueseq") + "',"
								+ "'" + csi.getString("wedseq") + "',"
								+ "'" + csi.getString("thuseq") + "',"
								+ "'" + csi.getString("friseq") + "',"
								+ "'" + csi.getString("satseq") + "',"
								+ "'" + csi.getString("sunseq") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// CUSTOMER INVOICE
					sql = "DELETE FROM CUSTOMERINVOICE WHERE INVOICENUMBER NOT IN (SELECT INVOICENUMBER FROM ARDETAIL)";
					d1.execInsertQuery(sql);
					for (int i = 0, size = custinv.length(); i < size; i++) {
						JSONObject csi = custinv.getJSONObject(i);

						sql = "INSERT INTO CUSTOMERINVOICE(transactionkey,transactiontype,documentnumber,invoicenumber,transactiondate,transactiontime,customercode,routecode,salesmancode,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,totalfreesampleamount,immediatepaid,amountpaid,dnamountpaid,cnamountpaid,invoicebalance,paymenttype,voidflag,paymentstatus,hhcinvoicenumber,remarks1,remarks2,routestartdate,erpreferencenumber,mdat,totalpromoamount,gcpaymenttype,totaltaxesamount,itemlinetaxamount,totaldiscountamount,pdcindicator,chequecollection,totalexpiryamount,currencycode,pdcbalance,totalmanualfree,totallimitedfree,totalrebaterent,totalfixedrent,data,totaldiscdistributionamount,totalreplacementamount,pdcdate,totalbuybackfreeamount,duedate) VALUES ( "
								+ "'" + csi.getString("transactionkey") + "',"
								+ "'" + csi.getString("transactiontype") + "',"
								+ "'" + csi.getString("documentnumber") + "',"
								+ "'" + csi.getString("invoicenumber") + "',"
								+ "'" + csi.getString("transactiondate") + "',"
								+ "'" + csi.getString("transactiontime") + "',"
								+ "'" + csi.getString("customercode") + "',"
								+ "'" + csi.getString("routecode") + "',"
								+ "'" + csi.getString("salesmancode") + "',"
								+ "'" + csi.getString("totalinvoiceamount") + "',"
								+ "'" + csi.getString("totalsalesamount") + "',"
								+ "'" + csi.getString("totalreturnamount") + "',"
								+ "'" + csi.getString("totaldamagedamount") + "',"
								+ "'" + csi.getString("totalfreesampleamount") + "',"
								+ "'" + csi.getString("immediatepaid") + "',"
								+ "'" + csi.getString("amountpaid") + "',"
								+ "'" + csi.getString("dnamountpaid") + "',"
								+ "'" + csi.getString("cnamountpaid") + "',"
								+ "'" + csi.getString("invoicebalance") + "',"
								+ "'" + csi.getString("paymenttype") + "',"
								+ "'" + csi.getString("voidflag") + "',"
								+ "'" + csi.getString("paymentstatus") + "',"
								+ "'" + csi.getString("hhcinvoicenumber") + "',"
								+ "'" + csi.getString("remarks1") + "',"
								+ "'" + csi.getString("remarks2") + "',"
								+ "'" + csi.getString("routestartdate") + "',"
								+ "'" + csi.getString("erpreferencenumber") + "',"
								+ "'" + csi.getString("mdat") + "',"
								+ "'" + csi.getString("totalpromoamount") + "',"
								+ "'" + csi.getString("gcpaymenttype") + "',"
								+ "'" + csi.getString("totaltaxesamount") + "',"
								+ "'" + csi.getString("itemlinetaxamount") + "',"
								+ "'" + csi.getString("totaldiscountamount") + "',"
								+ "'" + csi.getString("pdcindicator") + "',"
								+ "'" + csi.getString("chequecollection") + "',"
								+ "'" + csi.getString("totalexpiryamount") + "',"
								+ "'" + csi.getString("currencycode") + "',"
								+ "'" + csi.getString("pdcbalance") + "',"
								+ "'" + csi.getString("totalmanualfree") + "',"
								+ "'" + csi.getString("totallimitedfree") + "',"
								+ "'" + csi.getString("totalrebaterent") + "',"
								+ "'" + csi.getString("totalfixedrent") + "',"
								+ "'" + csi.getString("data") + "',"
								+ "'" + csi.getString("totaldiscdistributionamount") + "',"
								+ "'" + csi.getString("totalreplacementamount") + "',"
								+ "'" + csi.getString("pdcdate") + "',"
								+ "'" + csi.getString("totalbuybackfreeamount") + "',"
								+ "'" + csi.getString("duedate") + "'"
								+ ") ";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// PRODUCT GROUP HEADER
					sql = "DELETE FROM PRODUCTGROUPHEADER";
					d1.execInsertQuery(sql);
					for (int i = 0, size = prdgrph.length(); i < size; i++) {
						JSONObject csi = prdgrph.getJSONObject(i);

						sql = "INSERT INTO PRODUCTGROUPHEADER(groupnumber,groupdescription, arbgroupdescription,grouptype) VALUES ( "
								+ "'" + csi.getString("groupnumber") + "',"
								+ "'" + csi.getString("groupdescription") + "',"
								+ "'" + csi.getString("arbgroupdescription") + "',"
								+ "'" + csi.getString("grouptype") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// PRODUCT GROUP DETAIL
					sql = "DELETE FROM PRODUCTGROUPDETAIL";
					d1.execInsertQuery(sql);
					for (int i = 0, size = prdgrpd.length(); i < size; i++) {
						JSONObject csi = prdgrpd.getJSONObject(i);

						sql = "INSERT INTO PRODUCTGROUPDETAIL(groupnumber,itemcode,itemqty,promopcprice,promocaseprice) VALUES ( "
								+ "'" + csi.getString("groupnumber") + "',"
								+ "'" + csi.getString("itemcode") + "',"
								+ "'" + csi.getString("itemqty") + "',"
								+ "'" + csi.getString("promopcprice") + "',"
								+ "'" + csi.getString("promocaseprice") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// PROMO KEY HEADER
					sql = "DELETE FROM PROMOKEYHEADER";
					d1.execInsertQuery(sql);
					for (int i = 0, size = promokh.length(); i < size; i++) {
						JSONObject csi = promokh.getJSONObject(i);

						sql = "INSERT INTO PROMOKEYHEADER(promotionkey,description,arbdescription,activeindicator,type) VALUES ( "
								+ "'" + csi.getString("promotionkey") + "',"
								+ "'" + csi.getString("description") + "',"
								+ "'" + csi.getString("arbdescription") + "',"
								+ "'" + csi.getString("activeindicator") + "',"
								+ "'" + csi.getString("type") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// PROMO KEY DETAIL
					sql = "DELETE FROM PROMOKEYDETAIL";
					d1.execInsertQuery(sql);
					for (int i = 0, size = promokd.length(); i < size; i++) {
						JSONObject csi = promokd.getJSONObject(i);

						sql = "INSERT INTO PROMOKEYDETAIL(primary_key,plannumber,promotionkey,startdate,enddate,promotiontypecode,qualificationgroup,assignmentgroup,assignmentnumber,performcriteriakey,rangebasis,amountbasis,exclusionoption,active,iscase) VALUES ( "
								+ "'" + csi.getString("primary_key") + "',"
								+ "'" + csi.getString("plannumber") + "',"
								+ "'" + csi.getString("promotionkey") + "',"
								+ "'" + csi.getString("startdate") + "',"
								+ "'" + csi.getString("enddate") + "',"
								+ "'" + csi.getString("promotiontypecode") + "',"
								+ "'" + csi.getString("qualificationgroup") + "',"
								+ "'" + csi.getString("assignmentgroup") + "',"
								+ "'" + csi.getString("assignmentnumber") + "',"
								+ "'" + csi.getString("performcriteriakey") + "',"
								+ "'" + csi.getString("rangebasis") + "',"
								+ "'" + csi.getString("amountbasis") + "',"
								+ "'" + csi.getString("exclusionoption") + "',"
								+ "'" + csi.getString("active") + "',"
								+ "'" + csi.getString("iscase") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// PROMO PLAN HEAD
					sql = "DELETE FROM PROMOPLANHEADER";
					d1.execInsertQuery(sql);
					for (int i = 0, size = promoph.length(); i < size; i++) {
						JSONObject csi = promoph.getJSONObject(i);

						sql = "INSERT INTO PROMOPLANHEADER(plannumber,plandescription,arbplandescription,plantypecode,activeindicator) VALUES ( "
								+ "'" + csi.getString("plannumber") + "',"
								+ "'" + csi.getString("plandescription") + "',"
								+ "'" + csi.getString("arbplandescription") + "',"
								+ "'" + csi.getString("plantypecode") + "',"
								+ "'" + csi.getString("activeindicator") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// PROMO PLAN DETAIL
					sql = "DELETE FROM PROMOPLANDETAIL";
					d1.execInsertQuery(sql);
					for (int i = 0, size = promopd.length(); i < size; i++) {
						JSONObject csi = promopd.getJSONObject(i);

						sql = "INSERT INTO PROMOPLANDETAIL(plannumber,qualificationgroup,assignmentgroup,performcriteriakey,rangebasis,amountbasis,exclusionoption,assignmentnumber,plandescription,arbplandescription,promotiontypecode,rentindicator,iscase,onetimeuse,enforcepromotion) VALUES ( "
								+ "'" + csi.getString("plannumber") + "',"
								+ "'" + csi.getString("qualificationgroup") + "',"
								+ "'" + csi.getString("assignmentgroup") + "',"
								+ "'" + csi.getString("performcriteriakey") + "',"
								+ "'" + csi.getString("rangebasis") + "',"
								+ "'" + csi.getString("amountbasis") + "',"
								+ "'" + csi.getString("exclusionoption") + "',"
								+ "'" + csi.getString("assignmentnumber") + "',"
								+ "'" + csi.getString("plandescription") + "',"
								+ "'" + csi.getString("arbplandescription") + "',"
								+ "'" + csi.getString("promotiontypecode") + "',"
								+ "'" + csi.getString("rentindicator") + "',"
								+ "'" + csi.getString("iscase") + "',"
								+ "'" + csi.getString("onetimeuse") + "',"
								+ "'" + csi.getString("enforcepromotion") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// PROMOTION ASSIGNMENT ADVANCED
					sql = "DELETE FROM PROMOTIONASSIGNMENTADVANCED";
					d1.execInsertQuery(sql);
					for (int i = 0, size = promoassd.length(); i < size; i++) {
						JSONObject csi = promoassd.getJSONObject(i);

						sql = "INSERT INTO PROMOTIONASSIGNMENTADVANCED(range_id,plannumber,assignmentnumber,rangelow,rangehigh,repeatingrange,promotionamount) VALUES ( "
								+ "'" + csi.getString("range_id") + "',"
								+ "'" + csi.getString("plannumber") + "',"
								+ "'" + csi.getString("assignmentnumber") + "',"
								+ "'" + csi.getString("rangelow") + "',"
								+ "'" + csi.getString("rangehigh") + "',"
								+ "'" + csi.getString("repeatingrange") + "',"
								+ "'" + csi.getString("promotionamount") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// CUSTOMER PRICING 1
					sql = "DELETE FROM CUSTOMERPRICING1";
					d1.execInsertQuery(sql);
					for (int i = 0, size = prc1.length(); i < size; i++) {
						JSONObject csi = prc1.getJSONObject(i);

						sql = "INSERT INTO CUSTOMERPRICING1(PRICINGPLANKEY, CUSTOMERPRICINGKEY, DESCRIPTION, STARTDATE, ENDDATE, ARBDESCRIPTION, CONTRACTNO, ACTIVE, SEQUENCECODE, PRIMARY_KEY) VALUES ( "
								+ "'" + csi.getString("pricingplankey") + "',"
								+ "'" + csi.getString("customerpricingkey") + "',"
								+ "'" + csi.getString("description") + "',"
								+ "'" + csi.getString("startdate") + "',"
								+ "'" + csi.getString("enddate") + "',"
								+ "'" + csi.getString("arbdescription") + "',"
								+ "'" + csi.getString("contractno") + "',"
								+ "'" + csi.getString("active") + "',"
								+ "'" + csi.getString("sequencecode") + "',"
								+ "'" + csi.getString("primary_key") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// pricig detail 1
					sql = "DELETE FROM pricingdetail1";
					d1.execInsertQuery(sql);
					for (int i = 0, size = prcd.length(); i < size; i++) {
						JSONObject csi = prcd.getJSONObject(i);

						sql = "INSERT INTO pricingdetail1(primary_key, customerpricingkey, itemcode, salesprice, returnprice, retailprice, salescaseprice, returncaseprice, unitspercase,stdsalesunitprice, stdreturnunitprice, stdsalescaseprice, stdreturncaseprice) VALUES ( "
								+ "'" + csi.getString("primary_key") + "',"
								+ "'" + csi.getString("customerpricingkey") + "',"
								+ "'" + csi.getString("itemcode") + "',"
								+ "'" + csi.getString("salesprice") + "',"
								+ "'" + csi.getString("returnprice") + "',"
								+ "'" + csi.getString("retailprice") + "',"
								+ "'" + csi.getString("salescaseprice") + "',"
								+ "'" + csi.getString("returncaseprice") + "',"
								+ "'" + csi.getString("unitspercase") + "',"
								+ "'" + csi.getString("stdsalesunitprice") + "',"
								+ "'" + csi.getString("stdreturnunitprice") + "',"
								+ "'" + csi.getString("stdsalescaseprice") + "',"
								+ "'" + csi.getString("stdreturncaseprice") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// POS MASTER
					sql = "DELETE FROM POSMASTER";
					d1.execInsertQuery(sql);
					for (int i = 0, size = pos.length(); i < size; i++) {
						JSONObject csi = pos.getJSONObject(i);

						sql = "INSERT INTO POSMASTER(itemcode,alternatecode,itemdescription,arbitemdescription,itemvalue,inventorytype,created,cdat,modified,mdat,activestatus) VALUES ( "
								+ "'" + csi.getString("itemcode") + "',"
								+ "'" + csi.getString("alternatecode") + "',"
								+ "'" + csi.getString("itemdescription") + "',"
								+ "'" + csi.getString("arbitemdescription") + "',"
								+ "'" + csi.getString("itemvalue") + "',"
								+ "'" + csi.getString("inventorytype") + "',"
								+ "'" + csi.getString("created") + "',"
								+ "'" + csi.getString("cdat") + "',"
								+ "'" + csi.getString("modified") + "',"
								+ "'" + csi.getString("mdat") + "',"
								+ "'" + csi.getString("activestatus") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// POS INVENTORY
					sql = "DELETE FROM CUSTOMERPOSINVENTORY";
					d1.execInsertQuery(sql);
					for (int i = 0, size = posinv.length(); i < size; i++) {
						JSONObject csi = posinv.getJSONObject(i);

						sql = "INSERT INTO CUSTOMERPOSINVENTORY(customercode,itemcode,quantity,serialnumber) VALUES ( "
								+ "'" + csi.getString("customercode") + "',"
								+ "'" + csi.getString("itemcode") + "',"
								+ "'" + csi.getString("quantity") + "',"
								+ "'" + csi.getString("serialnumber") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// POS LIMIT
					sql = "DELETE FROM CUSTOMERPOSLIMIT";
					d1.execInsertQuery(sql);
					for (int i = 0, size = poslmt.length(); i < size; i++) {
						JSONObject csi = poslmt.getJSONObject(i);

						sql = "INSERT INTO CUSTOMERPOSLIMIT(customercode,poslimit,posbalance) VALUES ( "
								+ "'" + csi.getString("customercode") + "',"
								+ "'" + csi.getString("poslimit") + "',"
								+ "'" + csi.getString("posbalance") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// POS INSTRUCTIONS
					sql = "DELETE FROM POSINSTRUCTIONS";
					d1.execInsertQuery(sql);
					for (int i = 0, size = posinstr.length(); i < size; i++) {
						JSONObject csi = posinstr.getJSONObject(i);

						sql = "INSERT INTO POSINSTRUCTIONS(posinstructioncode,posinstructionname,arbposinstructionname,created,cdat,modified,mdat) VALUES ( "
								+ "'" + csi.getString("posinstructioncode") + "',"
								+ "'" + csi.getString("posinstructionname") + "',"
								+ "'" + csi.getString("arbposinstructionname") + "',"
								+ "'" + csi.getString("created") + "',"
								+ "'" + csi.getString("cdat") + "',"
								+ "'" + csi.getString("modified") + "',"
								+ "'" + csi.getString("mdat") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// CUST SURVEY PLAN
					sql = "DELETE FROM CUSTOMERSURVEYPLAN";
					d1.execInsertQuery(sql);
					for (int i = 0, size = srvpln.length(); i < size; i++) {
						JSONObject csi = srvpln.getJSONObject(i);

						sql = "INSERT INTO CUSTOMERSURVEYPLAN(surveyplankey,surveysequencenumber,surveymandatory,surveydescription,arbsurveydescription) VALUES ( "
								+ "'" + csi.getString("surveyplankey") + "',"
								+ "'" + csi.getString("surveysequencenumber") + "',"
								+ "'" + csi.getString("surveymandatory") + "',"
								+ "'" + csi.getString("surveydescription") + "',"
								+ "'" + csi.getString("arbsurveydescription") + "'"
								+ ")";
						try {
							 d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// CUST SURVEY KEY PLAN
					sql = "DELETE FROM CUSTOMERSURVEYKEYPLAN";
					d1.execInsertQuery(sql);
					for (int i = 0, size = srvkeyp.length(); i < size; i++) {
						JSONObject csi = srvkeyp.getJSONObject(i);

						sql = "INSERT INTO CUSTOMERSURVEYKEYPLAN(primary_key,surveyplankey,surveykey) VALUES ( "
								+ "'" + csi.getString("primary_key") + "',"
								+ "'" + csi.getString("surveyplankey") + "',"
								+ "'" + csi.getString("surveykey") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// CUST SURVEY KEY
					sql = "DELETE FROM CUSTOMERSURVEYKEY";
					d1.execInsertQuery(sql);
					for (int i = 0, size = srvkey.length(); i < size; i++) {
						JSONObject csi = srvkey.getJSONObject(i);

						sql = "INSERT INTO CUSTOMERSURVEYKEY(surveykey,surveydescription,arbsurveydescription,surveyplankey,created,cdat,modified,mdat,activestatus) VALUES ( "
								+ "'" + csi.getString("surveykey") + "',"
								+ "'" + csi.getString("surveydescription") + "',"
								+ "'" + csi.getString("arbsurveydescription") + "',"
								+ "'" + csi.getString("surveyplankey") + "',"
								+ "'" + csi.getString("created") + "',"
								+ "'" + csi.getString("cdat") + "',"
								+ "'" + csi.getString("modified") + "',"
								+ "'" + csi.getString("mdat") + "',"
								+ "'" + csi.getString("activestatus") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// CUST SURVEY DEFINITION
					sql = "DELETE FROM CUSTOMERSURVEYDEFINITION";
					d1.execInsertQuery(sql);
					for (int i = 0, size = srvdef.length(); i < size; i++) {
						JSONObject csi = srvdef.getJSONObject(i);

						sql = "INSERT INTO CUSTOMERSURVEYDEFINITION(surveydefkey,surveyindex,lineindex,surveyrectype,surveyprompt,arbsurveyprompt,responselength,responsedecimalpos,lookuptype,lookupindex,retainvalue,activestatus) VALUES ( "
								+ "'" + csi.getString("surveydefkey") + "',"
								+ "'" + csi.getString("surveyindex") + "',"
								+ "'" + csi.getString("lineindex") + "',"
								+ "'" + csi.getString("surveyrectype") + "',"
								+ "'" + csi.getString("surveyprompt") + "',"
								+ "'" + csi.getString("arbsurveyprompt") + "',"
								+ "'" + csi.getString("responselength") + "',"
								+ "'" + csi.getString("responsedecimalpos") + "',"
								+ "'" + csi.getString("lookuptype") + "',"
								+ "'" + csi.getString("lookupindex") + "',"
								+ "'" + csi.getString("retainvalue") + "',"
								+ "'" + csi.getString("activestatus") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// CUST SURVEY DEF ASSIGN
					sql = "DELETE FROM CUSTOMERSURVEYDEFASSIGN";
					d1.execInsertQuery(sql);
					for (int i = 0, size = srvass.length(); i < size; i++) {
						JSONObject csi = srvass.getJSONObject(i);

						sql = "INSERT INTO CUSTOMERSURVEYDEFASSIGN(surveyplankey,surveydefkey) VALUES ( "
								+ "'" + csi.getString("surveyplankey") + "',"
								+ "'" + csi.getString("surveydefkey") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// LOOKUP INDEX DETAIL
					sql = "DELETE FROM LOOKUPINDEXDETAIL";
					d1.execInsertQuery(sql);
					for (int i = 0, size = look.length(); i < size; i++) {
						JSONObject csi = look.getJSONObject(i);

						sql = "INSERT INTO LOOKUPINDEXDETAIL(primary_key,transactionkey,description,arbdescription) VALUES ( "
								+ "'" + csi.getString("primary_key") + "',"
								+ "'" + csi.getString("transactionkey") + "',"
								+ "'" + csi.getString("description") + "',"
								+ "'" + csi.getString("arbdescription") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// NON SERVICE REASON
					sql = "DELETE FROM NONSERVREASONS";
					d1.execInsertQuery(sql);
					for (int i = 0, size = nonsrv.length(); i < size; i++) {
						JSONObject csi = nonsrv.getJSONObject(i);

						sql = "INSERT INTO NONSERVREASONS(code,alternatecode,description,arbdescription,hhcdescription,created,cdat,modified,mdat) VALUES ( "
								+ "'" + csi.getString("code") + "',"
								+ "'" + csi.getString("alternatecode") + "',"
								+ "'" + csi.getString("description") + "',"
								+ "'" + csi.getString("arbdescription") + "',"
								+ "'" + csi.getString("hhcdescription") + "',"
								+ "'" + csi.getString("created") + "',"
								+ "'" + csi.getString("cdat") + "',"
								+ "'" + csi.getString("modified") + "',"
								+ "'" + csi.getString("mdat") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// EXP REASON
					sql = "DELETE FROM EXPREASONS";
					d1.execInsertQuery(sql);
					for (int i = 0, size = expr.length(); i < size; i++) {
						JSONObject csi = expr.getJSONObject(i);

						sql = "INSERT INTO EXPREASONS(code, alternatecode, description, arbdescription, hhcdescription, created, cdat, modified, mdat) VALUES ( "
								+ "'" + csi.getString("code") + "',"
								+ "'" + csi.getString("alternatecode") + "',"
								+ "'" + csi.getString("description") + "',"
								+ "'" + csi.getString("arbdescription") + "',"
								+ "'" + csi.getString("hhcdescription") + "',"
								+ "'" + csi.getString("created") + "',"
								+ "'" + csi.getString("cdat") + "',"
								+ "'" + csi.getString("modified") + "',"
								+ "'" + csi.getString("mdat") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// EXP RETURN REASON
					sql = "DELETE FROM EXPIRYRETURNREASONS";
					d1.execInsertQuery(sql);
					for (int i = 0, size = expretr.length(); i < size; i++) {
						JSONObject csi = expretr.getJSONObject(i);

						sql = "INSERT INTO EXPIRYRETURNREASONS(code, alternatecode, description, arbdescription, hhcdescription, created, cdat, modified, mdat) VALUES ( "
								+ "'" + csi.getString("code") + "',"
								+ "'" + csi.getString("alternatecode") + "',"
								+ "'" + csi.getString("description") + "',"
								+ "'" + csi.getString("arbdescription") + "',"
								+ "'" + csi.getString("hhcdescription") + "',"
								+ "'" + csi.getString("created") + "',"
								+ "'" + csi.getString("cdat") + "',"
								+ "'" + csi.getString("modified") + "',"
								+ "'" + csi.getString("mdat") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// EXP RETURN REASON
					sql = "DELETE FROM RETITMREASONS";
					d1.execInsertQuery(sql);
					for (int i = 0, size = retr.length(); i < size; i++) {
						JSONObject csi = retr.getJSONObject(i);

						sql = "INSERT INTO RETITMREASONS(code, alternatecode, description, arbdescription, hhcdescription, created, cdat, modified, mdat) VALUES ( "
								+ "'" + csi.getString("code") + "',"
								+ "'" + csi.getString("alternatecode") + "',"
								+ "'" + csi.getString("description") + "',"
								+ "'" + csi.getString("arbdescription") + "',"
								+ "'" + csi.getString("hhcdescription") + "',"
								+ "'" + csi.getString("created") + "',"
								+ "'" + csi.getString("cdat") + "',"
								+ "'" + csi.getString("modified") + "',"
								+ "'" + csi.getString("mdat") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// free GOOD REASON
					sql = "DELETE FROM FREEGOODREASONS";
					d1.execInsertQuery(sql);
					for (int i = 0, size = freer.length(); i < size; i++) {
						JSONObject csi = freer.getJSONObject(i);

						sql = "INSERT INTO FREEGOODREASONS(reason_code, alternatereasoncode, reason_desc, reason_arb_desc) VALUES ( "
								+ "'" + csi.getString("reason_code") + "',"
								+ "'" + csi.getString("alternatereasoncode") + "',"
								+ "'" + csi.getString("reason_desc") + "',"
								+ "'" + csi.getString("reason_arb_desc") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// VOID REASON
					sql = "DELETE FROM VOIDREASONS";
					d1.execInsertQuery(sql);
					for (int i = 0, size = voidr.length(); i < size; i++) {
						JSONObject csi = voidr.getJSONObject(i);

						sql = "INSERT INTO VOIDREASONS(code, alternatecode, description, arbdescription, hhcdescription, created, cdat, modified, mdat) VALUES ( "
								+ "'" + csi.getString("code") + "',"
								+ "'" + csi.getString("alternatecode") + "',"
								+ "'" + csi.getString("description") + "',"
								+ "'" + csi.getString("arbdescription") + "',"
								+ "'" + csi.getString("hhcdescription") + "',"
								+ "'" + csi.getString("created") + "',"
								+ "'" + csi.getString("cdat") + "',"
								+ "'" + csi.getString("modified") + "',"
								+ "'" + csi.getString("mdat") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// SALESMAN MESSAGE
					sql = "DELETE FROM SALESMANMESSAGES";
					d1.execInsertQuery(sql);
					for (int i = 0, size = smsg.length(); i < size; i++) {
						JSONObject csi = smsg.getJSONObject(i);

						sql = "INSERT INTO SALESMANMESSAGES(messagekey,messagedescription,message1,message2,message3,message4,arbmessageline1,arbmessageline2,arbmessageline3,arbmessageline4,created,cdat,modified,mdat,activestatus) VALUES ( "
								+ "'" + csi.getString("messagekey") + "',"
								+ "'" + csi.getString("messagedescription") + "',"
								+ "'" + csi.getString("message1") + "',"
								+ "'" + csi.getString("message2") + "',"
								+ "'" + csi.getString("message3") + "',"
								+ "'" + csi.getString("message4") + "',"
								+ "'" + csi.getString("arbmessageline1") + "',"
								+ "'" + csi.getString("arbmessageline2") + "',"
								+ "'" + csi.getString("arbmessageline3") + "',"
								+ "'" + csi.getString("arbmessageline4") + "',"
								+ "'" + csi.getString("created") + "',"
								+ "'" + csi.getString("cdat") + "',"
								+ "'" + csi.getString("modified") + "',"
								+ "'" + csi.getString("mdat") + "',"
								+ "'" + csi.getString("activestatus") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// VAN MASTER
					sql = "DELETE FROM VANMASTER";
					d1.execInsertQuery(sql);
					for (int i = 0, size = van.length(); i < size; i++) {
						JSONObject csi = van.getJSONObject(i);

						sql = "INSERT INTO VANMASTER(vancode,vandescription,arbvandescription,activestatus,vanregno,vanmodel,vantype) VALUES ( "
								+ "'" + csi.getString("vancode") + "',"
								+ "'" + csi.getString("vandescription") + "',"
								+ "'" + csi.getString("arbvandescription") + "',"
								+ "'" + csi.getString("vanregno") + "',"
								+ "'" + csi.getString("vanmodel") + "',"
								+ "'" + csi.getString("vantype") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// BANK MASTER
					sql = "DELETE FROM BANKMASTER";
					d1.execInsertQuery(sql);
					for (int i = 0, size = bank.length(); i < size; i++) {
						JSONObject csi = bank.getJSONObject(i);

						sql = "INSERT INTO BANKMASTER(bankcode,bankname,arbbankname,bankbalance,created,cdat,modified,mdat,activestatus,alternatecode,type,acnumber) VALUES ( "
								+ "'" + csi.getString("bankcode") + "',"
								+ "'" + csi.getString("bankname") + "',"
								+ "'" + csi.getString("arbbankname") + "',"
								+ "'" + csi.getString("bankbalance") + "',"
								+ "'" + csi.getString("created") + "',"
								+ "'" + csi.getString("cdat") + "',"
								+ "'" + csi.getString("modified") + "',"
								+ "'" + csi.getString("mdat") + "',"
								+ "'" + csi.getString("activestatus") + "',"
								+ "'" + csi.getString("alternatecode") + "',"
								+ "'" + csi.getString("type") + "',"
								+ "'" + csi.getString("acnumber") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// CASH DESCRIPTION
					sql = "DELETE FROM CASHDESC";
					d1.execInsertQuery(sql);
					for (int i = 0, size = cash.length(); i < size; i++) {
						JSONObject csi = cash.getJSONObject(i);

						sql = "INSERT INTO CASHDESC(code,alternatecode,description,arbdescription,hhcdescription,created,cdat,modified,mdat) VALUES ( "
								+ "'" + csi.getString("code") + "',"
								+ "'" + csi.getString("alternatecode") + "',"
								+ "'" + csi.getString("description") + "',"
								+ "'" + csi.getString("arbdescription") + "',"
								+ "'" + csi.getString("hhcdescription") + "',"
								+ "'" + csi.getString("created") + "',"
								+ "'" + csi.getString("cdat") + "',"
								+ "'" + csi.getString("modified") + "',"
								+ "'" + csi.getString("mdat") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// INV LOCATION
					sql = "DELETE FROM INVENTORYLOCATION";
					d1.execInsertQuery(sql);
					for (int i = 0, size = invloc.length(); i < size; i++) {
						JSONObject csi = invloc.getJSONObject(i);

						sql = "INSERT INTO INVENTORYLOCATION(code,alternatecode,description,arbdescription,hhcdescription) VALUES ( "
								+ "'" + csi.getString("code") + "',"
								+ "'" + csi.getString("alternatecode") + "',"
								+ "'" + csi.getString("description") + "',"
								+ "'" + csi.getString("arbdescription") + "',"
								+ "'" + csi.getString("hhcdescription") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// CUST FOC BALANCE
					sql = "DELETE FROM CUSTOMER_FOC_BALANCE";
					d1.execInsertQuery(sql);
					for (int i = 0, size = focb.length(); i < size; i++) {
						JSONObject csi = focb.getJSONObject(i);

						sql = "INSERT INTO CUSTOMER_FOC_BALANCE(customercode,itemcode,originalqty,balanceqty,contractid,startdate) VALUES ( "
								+ "'" + csi.getString("customercode") + "',"
								+ "'" + csi.getString("itemcode") + "',"
								+ "'" + csi.getString("originalqty") + "',"
								+ "'" + csi.getString("balanceqty") + "',"
								+ "'" + csi.getString("contractid") + "',"
								+ "'" + csi.getString("startdate") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

					// Customer Item Gorp
					sql = "DELETE FROM customeritemgrp";
					d1.execInsertQuery(sql);
					for (int i = 0, size = citgrp.length(); i < size; i++) {
						JSONObject cpi = citgrp.getJSONObject(i);
						sql = "INSERT INTO customeritemgrp(customeritemgrpcode,categoryid,itemgroupcode,description,created,cdat,modified,mdat,transferstatus) VALUES ("
								+ "'" + cpi.getString("customeritemgrpcode") + "',"
								+ "'" + cpi.getString("categoryid") + "',"
								+ "'" + cpi.getString("itemgroupcode") + "',"
								+ "'" + cpi.getString("description") + "',"
								+ "'" + cpi.getString("created") + "',"
								+ "'" + cpi.getString("cdat") + "',"
								+ "'" + cpi.getString("modified") + "',"
								+ "'" + cpi.getString("mdat") + "',"
								+ "'" + cpi.getString("transferstatus") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}

					}

					// Customer Item Mapping
					sql = "DELETE FROM CUSTOMERITEMMAPPING";
					d1.execInsertQuery(sql);
					for (int i = 0, size = citmap.length(); i < size; i++) {
						JSONObject cpi = citmap.getJSONObject(i);
						sql = "INSERT INTO CUSTOMERITEMMAPPING(customeritemgrpcode, itemcode, transferstatus) VALUES ("
								+ "'" + cpi.getString("customeritemgrpcode") + "',"
								+ "'" + cpi.getString("itemcode") + "',"
								+ "'" + cpi.getString("transferstatus") + "'"
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}
					
					
					// suggestedsalesinvoice
					sql = "DELETE FROM suggestedsalesinvoice";
					d1.execInsertQuery(sql);
					for (int i = 0, size = sugg.length(); i < size; i++) {
						JSONObject sug = sugg.getJSONObject(i);
						sql = "INSERT INTO suggestedsalesinvoice(routecode, customercode, transactiondate, itemcode, transactiontype, lastvisitshelfstock, lastvisitsales, currentvisitshelfstock, currentvisitsales, offtakeqty, currentvisitgsales, currentvisitreturns, currentvisitsecondarysales) VALUES ("
								+ "'" + sug.getString("routecode") + "',"
								+ "'" + sug.getString("customercode") + "',"
								+ "'" + sug.getString("transactiondate") + "',"
								+ "'" + sug.getString("itemcode") + "',"
								+ "'" + sug.getString("transactiontype") + "',"
								+ "'" + sug.getString("lastvisitshelfstock") + "',"
								+ "'" + sug.getString("lastvisitsales") + "',"
								+ "'" + sug.getString("currentvisitshelfstock") + "',"
								+ "'" + sug.getString("currentvisitsales") + "',"
								+ "'" + sug.getString("offtakeqty") + "',"
								+ "'" + sug.getString("currentvisitgsales") + "',"
								+ "'" + sug.getString("currentvisitreturns") + "',"
								+ "'" + sug.getString("currentvisitsecondarysales") + "'"												
								+ ")";
						try {
							d1.execInsertQuery(sql);
						} catch (Exception ar) {
							int ee = 1;
						}
					}

				} catch (Exception e) {
					Log.d("Exception while reading url", e.toString());
				} finally {
					if (iStream != null) {
						try {
							iStream.close();
						} catch (IOException closeError) {
							Log.d("SYNC", "Unable to close input stream", closeError);
						}
					}
					if (urlConnection != null) urlConnection.disconnect();

					// ROUTEMASTER is refreshed directly during sync, bypassing
					// DataBaseHelper.insert(). Re-evaluate the open route and its
					// enablegpstracking flag after the refreshed data is available.
					RouteTrackingFileLogger.write(
							"SYNC_COMPLETED reconciling GPS tracking state");
					LocationUpdateService.reconcileWithRouteState(
							cordova.getActivity().getApplicationContext());
				}

	

			}

			if (action.equals(UPDATE)) {
				appupdateWizzitIndent(args);
																											 
			}
			
			if( action.equals(TABLEUPDATE) )
			{
				String sqltablecreate= "CREATE TABLE IF NOT EXISTS location_logs (" + 
						"id INTEGER PRIMARY KEY AUTOINCREMENT, " + 
						"latitude REAL, " + 
						"longitude REAL," + 
						"timestamp TEXT," + 
						"is_synced INTEGER DEFAULT 0)";
				d1.execInsertQuery(sqltablecreate);
			}

			if (action.equals(UPLOAD)) {
				// CODE FOR UPLOADIND TO SERVER
				String datasync = "";
				int rCode = visitkey;
				InputStream iStream = null;
				OutputStream os = null;
				HttpURLConnection urlConnection = null;
				JSONObject cmData;
				String inputstr = "{'key1':'val1'}";
				String cCode = "", cName = "";
				;
				String dataSring = "";
				ArrayList<String> exampleList = new ArrayList<String>();
				try {

					sql = "  select routekey, seqweeknumber, seqweekday, routecode, customercode, sequencenumber, schelduledflag, servicedflag, scannedflag from  routesequencecustomerstatus ";

					data = d1.execSelectQuery(sql);

					if (data.length() > 0) {
						detailDataList = data.getJSONArray("array");
						dataSring = detailDataList.toString();
					}

					// URL obj = new
					// URL("http://enomsfa01.westeurope.cloudapp.azure.com:8095/sfa/enhancetest/api/sync/custseq");
					URL obj = new URL(baseAddr + "api/sync/custseq");
					HttpURLConnection con = (HttpURLConnection) obj.openConnection();
					con.setRequestMethod("POST");
					con.setRequestProperty("Content-Type", "application/json");
					con.setDoOutput(true);

					DataOutputStream wr = new DataOutputStream(con.getOutputStream());
					wr.writeBytes(dataSring);

					wr.flush();
					wr.close();

					// int responseCode = con.getResponseCode();
					// int k = responseCode;
					BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
					String inputLine;
					StringBuffer response = new StringBuffer();

					while ((inputLine = in.readLine()) != null) {
						response.append(inputLine);
					}
					in.close();

				} catch (Exception e) {
					String a = e.getMessage();
					String b = a;
				}
			}

			if (action.equals(VIEWPROMO)) 
			{
				sql = "DELETE FROM PROMOTIONDETAIL_TEMP ";
				d1.execInsertQuery(sql);
				// Remove all promotions from promotiondetail for the current visit key
				sql = "DELETE FROM PROMOTIONDETAIL WHERE VISITKEY = " + visitkey + " ";
				d1.execInsertQuery(sql);	
				
				sql = " update invoicedetail set upc = ( select unitspercase from itemmaster where invoicedetail.itemcode = itemmaster.actualitemcode ) where visitkey = "
						+ visitkey + " ";
				d1.execInsertQuery(sql);
 
				sql = " update invoicedetail set salesqtycse = ifnull(cast(salesqty/upc as int),0), salesqtypcs = ifnull(salesqty%upc,0), returnqtycse = ifnull(cast(returnqty/upc as int),0), returnqtypcs = ifnull(returnqty%upc,0), damagedqtycse = ifnull(cast(damagedqty/upc as int),0), damagedqtypcs = ifnull(damagedqty%upc,0), expiryqtycse = ifnull(cast(expiryqty/upc as int),0), expiryqtypcs = ifnull(expiryqty%upc,0) where visitkey = "
						+ visitkey + " ";
				d1.execInsertQuery(sql);
 
				sql = " update invoicedetail set salesgross = ifnull(salesqtycse,0) * ifnull(salescaseprice,0) + ifnull(salesqtypcs,0) * ifnull(salesprice,0),returngross = ifnull(returnqtycse,0) * ifnull(returncaseprice,0) + ifnull(returnqtypcs,0) * ifnull(returnprice,0), damagedgross = ifnull(damagedqtycse,0) * ifnull(returncaseprice,0) + ifnull(damagedqtypcs,0) * ifnull(returnprice,0), expirygross = ifnull(expiryqtycse,0) * ifnull(returncaseprice,0) + ifnull(expiryqtypcs,0) * ifnull(returnprice,0) where visitkey = "
						+ visitkey + " ";
				d1.execInsertQuery(sql);
 
				sql = " update invoicedetail set totalgross = salesgross - returngross - damagedgross - expirygross where visitkey = "
						+ visitkey + " ";
				d1.execInsertQuery(sql);
 
				sql = " update invoicedetail set totalqty = ifnull(salesqty,0) - ifnull(returnqty,0) - ifnull(damagedqty,0) - ifnull(expiryqty,0) where visitkey ="
						+ visitkey + " ";
				d1.execInsertQuery(sql);
				
				
				
				sql = " SELECT PLANNUMBER AS PLANNUMBER, 0 ITEMCODE, totqty QTY, totamt AMT,salesqty,salesamt, retqty, retamt, promotiontypecode PROMOTYPE,rangebasis qualitype,qualificationgroup,assignmentgroup, round(CASE WHEN repeatingrange = 0 THEN promotionamount WHEN repeatingrange = 1 THEN CAST(rangeval / rangelow AS int) * promotionamount END,3) AS PROMOVAL, CASE WHEN repeatingrange = 0 THEN promorule WHEN repeatingrange = 1 THEN CAST(rangeval / rangelow AS int) * promorule END AS PROMOAMT, (SELECT enforcepromotion FROM promoplandetail p5 WHERE p5.plannumber = b.plannumber) ENFORCE FROM (SELECT a.plannumber, a.rangelow, a.rangehigh, a.promotiontypecode, a.rangebasis, a.qualificationgroup , a.assignmentgroup , a.repeatingrange, promotionamount AS promorule, CASE WHEN promotiontypecode IN (1, 5) THEN a.promotionamount WHEN promotiontypecode IN (2, 6) THEN a.promotionamount * a.totamt / 100 END AS promotionamount, a.totqty, a.totamt,a.salesqty, a.retqty, a.salesamt, a.retamt, CASE WHEN a.rangebasis = 1 THEN a.totqty WHEN a.rangebasis = 2 THEN a.totamt END rangeval FROM (SELECT p.plannumber, p3.rangelow, p3.rangehigh, p.promotiontypecode, p.rangebasis, p.qualificationgroup , p.assignmentgroup , p3.repeatingrange, p3.promotionamount, sum(i2.totalqty) totqty, sum(i2.totalgross) totamt,sum(ifnull(salesqty,0)) salesqty, sum( ifnull(returnqty,0) + ifnull(damagedqty,0) + ifnull(expiryqty,0) ) retqty, sum(salesgross) salesamt, sum( returngross + damagedgross + expirygross ) retamt FROM invoiceheader i INNER JOIN invoicedetail i2 ON i.visitkey = i2.visitkey INNER JOIN customermaster c ON i.customercode = c.customercode INNER JOIN promokeydetail p ON p.promotionkey = c.promotionkey INNER JOIN productgroupdetail p2 ON p.qualificationgroup = p2.groupnumber AND i2.itemcode = p2.itemcode INNER JOIN promotionassignmentadvanced p3 ON p.plannumber = p3.assignmentnumber INNER JOIN itemmaster i3 on i2.itemcode = i3.actualitemcode WHERE i.visitkey = "
						+ visitkey
						+ " GROUP BY p.plannumber , p3.rangelow, p3.rangehigh, p.promotiontypecode, p.rangebasis, p.qualificationgroup , p.assignmentgroup, p3.repeatingrange , p3.promotionamount ) a WHERE CASE WHEN repeatingrange = 0 THEN CASE WHEN rangebasis = 1 THEN abs(totqty) BETWEEN rangelow AND rangehigh WHEN rangebasis = 2 THEN abs(totamt) BETWEEN rangelow AND rangehigh END WHEN repeatingrange = 1 THEN CASE WHEN rangebasis = 1 THEN abs(totqty) >= rangelow WHEN rangebasis = 2 THEN abs(totamt) >= rangelow END END ) b WHERE promotiontypecode IN (1, 2, 5, 6, 7) ORDER BY plannumber  ";
				data = d1.execSelectQuery(sql);
				if (data.length() > 0) {
					detailDataList = data.getJSONArray("array");

					for (int i = 0; i < detailDataList.length(); i++) 
					{
						JSONObject detailDataLine = detailDataList.getJSONObject(i);
						planNo = Integer.parseInt(detailDataLine.getString("PLANNUMBER"));
						itemCode = Integer.parseInt(detailDataLine.getString("ITEMCODE"));
						itemQty = Integer.parseInt(detailDataLine.getString("QTY"));
						itemSaleAmt = Double.parseDouble(detailDataLine.getString("AMT"));
						promoType = Integer.parseInt(detailDataLine.getString("PROMOTYPE"));
						qualitype = Integer.parseInt(detailDataLine.getString("qualitype"));	//Qualification type of plan
						qualigroup = Integer.parseInt(detailDataLine.getString("qualificationgroup"));	//Qualification Group of plan
						assigngroup = Integer.parseInt(detailDataLine.getString("assignmentgroup"));						 
						promoVal = Double.parseDouble(detailDataLine.getString("PROMOVAL"));
						promoRuleAmt = Double.parseDouble(detailDataLine.getString("PROMOAMT"));
						promoenforce = Integer.parseInt(detailDataLine.getString("ENFORCE"));
						
						itemsalesqty = Integer.parseInt(detailDataLine.getString("salesqty")); 	//total Sale Qty in the inv againt promo items
						itemretqty = Integer.parseInt(detailDataLine.getString("retqty"));		//total ret qty in the inv againt promo items
						itemsalesamt = Double.parseDouble(detailDataLine.getString("salesamt"));	//total sale amount in the inv againt promo items
						itemretamt = Double.parseDouble(detailDataLine.getString("retamt"));		//total ret amount in the inv againt promo items
						
						sql = " insert into PROMOTIONDETAIL_TEMP(routekey, visitkey, transactionkey, itemcode, promotiontypecode, promotionamount, promotionplannumber,totalamount,totalqty, oldpromotionamount,exclusionoption,salesamount,salesqty,returnamount,returnqty, qualificationtypecode, qualigroup, assigngroup ) "
								+ "select routekey, visitkey, transactionkey, " + itemCode + ", " + promoType + ", "
								+ promoRuleAmt + ", " + planNo + ", " + itemSaleAmt + "," + itemQty + ", " + promoVal + ", "
								+ promoenforce + ", "+itemsalesamt+", "+itemsalesqty+", "+itemretamt+","+itemretqty+", "+qualitype+", "+qualigroup+", "+assigngroup+" from invoiceheader where visitkey = " + visitkey + " ";
						d1.execInsertQuery(sql);
												
						
					}
				}
				// check for INV LEVEL PROMOTION				

				sql = " SELECT PLANNUMBER AS PLANNUMBER, 0 ITEMCODE, totqty QTY, totamt AMT,salesqty,salesamt, retqty, retamt, promotiontypecode PROMOTYPE,rangebasis qualitype,qualificationgroup,assignmentgroup, round(CASE WHEN repeatingrange = 0 THEN promotionamount WHEN repeatingrange = 1 THEN CAST(rangeval / rangelow AS int) * promotionamount END,3) AS PROMOVAL, CASE WHEN repeatingrange = 0 THEN promorule WHEN repeatingrange = 1 THEN CAST(rangeval / rangelow AS int) * promorule END AS PROMOAMT, (SELECT enforcepromotion FROM promoplandetail p5 WHERE p5.plannumber = b.plannumber) ENFORCE FROM (SELECT a.plannumber, a.rangelow, a.rangehigh, a.promotiontypecode, a.rangebasis, a.qualificationgroup , a.assignmentgroup , a.repeatingrange, promotionamount AS promorule, CASE WHEN promotiontypecode IN (1, 5) THEN a.promotionamount WHEN promotiontypecode IN (2, 6) THEN a.promotionamount * a.totamt / 100 END AS promotionamount, a.totqty, a.totamt,a.salesqty, a.retqty, a.salesamt, a.retamt, CASE WHEN a.rangebasis = 1 THEN a.totqty WHEN a.rangebasis = 2 THEN a.totamt END rangeval FROM (SELECT p.plannumber, p3.rangelow, p3.rangehigh, p.promotiontypecode, p.rangebasis, p.qualificationgroup , p.assignmentgroup , p3.repeatingrange, p3.promotionamount, sum(i2.totalqty) totqty, sum(i2.totalgross) totamt,sum(ifnull(salesqty,0)) salesqty, sum( ifnull(returnqty,0) + ifnull(damagedqty,0) + ifnull(expiryqty,0) ) retqty, sum(salesgross) salesamt, sum( returngross + damagedgross + expirygross ) retamt FROM invoiceheader i INNER JOIN invoicedetail i2 ON i.visitkey = i2.visitkey INNER JOIN customermaster c ON i.customercode = c.customercode INNER JOIN promokeydetail p ON p.promotionkey = c.promotionkey and p.qualificationgroup = 1 INNER JOIN promotionassignmentadvanced p3 ON p.plannumber = p3.assignmentnumber INNER JOIN itemmaster i3 on i2.itemcode = i3.actualitemcode WHERE i.visitkey = "
						+ visitkey
						+ " GROUP BY p.plannumber , p3.rangelow, p3.rangehigh, p.promotiontypecode, p.rangebasis, p.qualificationgroup , p.assignmentgroup, p3.repeatingrange , p3.promotionamount ) a WHERE CASE WHEN repeatingrange = 0 THEN CASE WHEN rangebasis = 1 THEN abs(totqty) BETWEEN rangelow AND rangehigh WHEN rangebasis = 2 THEN abs(totamt) BETWEEN rangelow AND rangehigh END WHEN repeatingrange = 1 THEN CASE WHEN rangebasis = 1 THEN abs(totqty) >= rangelow WHEN rangebasis = 2 THEN abs(totamt) >= rangelow END END ) b WHERE promotiontypecode IN (1, 2, 5, 6, 7) ORDER BY plannumber  ";																																				
																 		
				data = d1.execSelectQuery(sql);
				if (data.length() > 0) 
				{
					detailDataList = data.getJSONArray("array");
					
					for (int i = 0; i < detailDataList.length(); i++)
					{
						JSONObject detailDataLine = detailDataList.getJSONObject(i);
						planNo = Integer.parseInt(detailDataLine.getString("PLANNUMBER"));
						itemCode = 0;
						itemQty = Integer.parseInt(detailDataLine.getString("QTY"));
						itemSaleAmt = Double.parseDouble(detailDataLine.getString("AMT"));
						promoType = Integer.parseInt(detailDataLine.getString("PROMOTYPE"));
						promoVal = Double.parseDouble(detailDataLine.getString("PROMOVAL"));
						promoRuleAmt = Double.parseDouble(detailDataLine.getString("PROMOAMT"));
						promoenforce = Integer.parseInt(detailDataLine.getString("ENFORCE"));
						if (promoType == 5 || promoType == 6) // Promotion on Invoice
						{
							if (promoVal != 0)
							{
								if (itemQty > 0)
									headPromoVal += promoVal;
								if (itemQty < 0)
									headPromoVal -= promoVal;
								sql = " insert into PROMOTIONDETAIL_TEMP(routekey, visitkey, transactionkey, itemcode, promotiontypecode, promotionamount, promotionplannumber,salesamount, oldpromotionamount,exclusionoption) select routekey, visitkey, transactionkey, "
										+ itemCode + ", " + promoType + ", " + promoRuleAmt + ", " + planNo + ", "
										+ itemSaleAmt + ", " + promoVal + ", " + promoenforce
										+ " from invoiceheader where visitkey = " + visitkey + " ";
								d1.execInsertQuery(sql);
							}							
						}	
					}
				}
				// end of check for INV LEVEL PROMOTION
				
				// check for COMBO PROMOTION
				sql = "SELECT 	PLANNUMBER AS PLANNUMBER, 	0 ITEMCODE, 	totqty QTY, 	totamt AMT, 	salesqty, 	salesamt, 	retqty, 	retamt, 	promotiontypecode PROMOTYPE, 	rangebasis qualitype, 	qualificationgroup, 	assignmentgroup, 	round(CASE WHEN repeatingrange = 0 THEN promotionamount WHEN repeatingrange = 1 THEN CAST(rangeval / rangelow AS int) * promotionamount END, 3) AS PROMOVAL, 	CASE 		WHEN repeatingrange = 0 THEN promorule 		WHEN repeatingrange = 1 THEN CAST(rangeval / rangelow AS int) * promorule 	END AS PROMOAMT, 	( 	SELECT 		enforcepromotion 	FROM 		promoplandetail p5 	WHERE 		p5.plannumber = b.plannumber) ENFORCE FROM 	( 	SELECT 		a.plannumber, 		a.rangelow, 		a.rangehigh, 		a.promotiontypecode, 		a.rangebasis, 		a.qualificationgroup , 		a.assignmentgroup , 		a.repeatingrange, 		promotionamount AS promorule, 		CASE 			WHEN promotiontypecode IN (1, 5) THEN a.promotionamount 			WHEN promotiontypecode IN (2, 6, 8) THEN a.promotionamount * a.totamt / 100 		END AS promotionamount, 		a.totqty, 		a.totamt, 		a.salesqty, 		a.retqty, 		a.salesamt, 		a.retamt, 		CASE 			WHEN a.rangebasis = 1 THEN a.totqty 			WHEN a.rangebasis = 2 THEN a.totamt 		END rangeval 	FROM 		( 		SELECT 			p.plannumber, 			p3.rangelow, 			p3.rangehigh, 			p.promotiontypecode, 			p.rangebasis, 			p.qualificationgroup , 			p.assignmentgroup , 			p3.repeatingrange, 			p3.promotionamount, 			count(distinct i2.itemcode) totqty, 			sum(i2.totalgross) totamt, 			sum(ifnull(salesqty, 0)) salesqty, 			sum( ifnull(returnqty, 0) + ifnull(damagedqty, 0) + ifnull(expiryqty, 0) ) retqty, 			sum(salesgross) salesamt, 			sum( returngross + damagedgross + expirygross ) retamt 		FROM 			invoiceheader i 		INNER JOIN invoicedetail i2 ON 			i.visitkey = i2.visitkey 		INNER JOIN customermaster c ON 			i.customercode = c.customercode 		INNER JOIN promokeydetail p ON 			p.promotionkey = c.promotionkey 		INNER JOIN productgroupdetail p2 ON 			p.qualificationgroup = p2.groupnumber 			AND i2.itemcode = p2.itemcode 		INNER JOIN promotionassignmentadvanced p3 ON 			p.plannumber = p3.assignmentnumber 		INNER JOIN itemmaster i3 on 			i2.itemcode = i3.actualitemcode 		WHERE 			i.visitkey = " + visitkey + " 		GROUP BY 			p.plannumber , 			p3.rangelow, 			p3.rangehigh, 			p.promotiontypecode, 			p.rangebasis, 			p.qualificationgroup , 			p.assignmentgroup, 			p3.repeatingrange , 			p3.promotionamount ) a 	WHERE 		CASE 			WHEN repeatingrange = 0 THEN CASE 	WHEN rangebasis = 1 THEN abs(totqty) BETWEEN rangelow AND rangehigh	WHEN rangebasis = 2 THEN abs(totamt) BETWEEN rangelow AND rangehigh 	END WHEN repeatingrange = 1 THEN CASE WHEN rangebasis = 1 THEN abs(totqty) >= rangelow 	WHEN rangebasis = 2 THEN abs(totamt) >= rangelow END END ) b WHERE promotiontypecode IN (8) ORDER BY 	plannumber  ";
				data = d1.execSelectQuery(sql);
				if (data.length() > 0) 
				{
					detailDataList = data.getJSONArray("array");
					JSONObject detailDataLine = detailDataList.getJSONObject(0);
					planNo = Integer.parseInt(detailDataLine.getString("PLANNUMBER"));
					itemCode = 0;
					itemSaleAmt = Double.parseDouble(detailDataLine.getString("AMT"));
					promoType = Integer.parseInt(detailDataLine.getString("PROMOTYPE"));
					promoVal = Double.parseDouble(detailDataLine.getString("PROMOVAL"));
					promoRuleAmt = Double.parseDouble(detailDataLine.getString("PROMOAMT"));
					promoenforce = Integer.parseInt(detailDataLine.getString("ENFORCE"));
					if (promoVal != 0) {
						sql = " insert into PROMOTIONDETAIL_TEMP(routekey, visitkey, transactionkey, itemcode, promotiontypecode, promotionamount, promotionplannumber,salesamount, oldpromotionamount,exclusionoption) select routekey, visitkey, transactionkey, "
								+ itemCode + ", " + promoType + ", " + promoRuleAmt + ", " + planNo + ", " + itemSaleAmt
								+ ", " + promoVal + ", " + promoenforce + " from invoiceheader where visitkey = " + visitkey + " ";
						 
						d1.execInsertQuery(sql);

						headPromoVal += promoVal;
					}
				}
				// end of check for COMBO PROMOTION
			}

			if (action.equals(VIEWPROMOORD)) // TEMP FOR ORDER
			{
				sql = "DELETE FROM PROMOTIONDETAIL_TEMP ";
				d1.execInsertQuery(sql);
				// Remove all promotions from promotiondetail for the current visit key
				sql = "DELETE FROM PROMOTIONDETAIL WHERE VISITKEY = " + visitkey + " ";
				d1.execInsertQuery(sql);

				sql = " update salesorderdetail set upc = ( select unitspercase from itemmaster where salesorderdetail.itemcode = itemmaster.actualitemcode ) where visitkey = "
						+ visitkey + " ";
				d1.execInsertQuery(sql);
 
				sql = " update salesorderdetail set salesqtycse = ifnull(cast(salesqty/upc as int),0), salesqtypcs = ifnull(salesqty%upc,0), returnqtycse = ifnull(cast(returnqty/upc as int),0), returnqtypcs = ifnull(returnqty%upc,0), damagedqtycse = ifnull(cast(damagedqty/upc as int),0), damagedqtypcs = ifnull(damagedqty%upc,0), expiryqtycse = ifnull(cast(expiryqty/upc as int),0), expiryqtypcs = ifnull(expiryqty%upc,0) where visitkey = "
						+ visitkey + " ";
				d1.execInsertQuery(sql);
 
				sql = " update salesorderdetail set salesgross = ifnull(salesqtycse,0) * ifnull(salescaseprice,0) + ifnull(salesqtypcs,0) * ifnull(salesprice,0),returngross = ifnull(returnqtycse,0) * ifnull(returncaseprice,0) + ifnull(returnqtypcs,0) * ifnull(returnprice,0), damagedgross = ifnull(damagedqtycse,0) * ifnull(returncaseprice,0) + ifnull(damagedqtypcs,0) * ifnull(returnprice,0), expirygross = ifnull(expiryqtycse,0) * ifnull(returncaseprice,0) + ifnull(expiryqtypcs,0) * ifnull(returnprice,0) where visitkey = "
						+ visitkey + " ";
				d1.execInsertQuery(sql);
 
				sql = " update salesorderdetail set totalgross = salesgross - returngross - damagedgross - expirygross where visitkey = "
						+ visitkey + " ";
				d1.execInsertQuery(sql);
 
				sql = " update salesorderdetail set totalqty = ifnull(salesqty,0) - ifnull(returnqty,0) - ifnull(damagedqty,0) - ifnull(expiryqty,0) where visitkey ="
						+ visitkey + " ";
				d1.execInsertQuery(sql);
				
				
				sql = " SELECT 	PLANNUMBER AS PLANNUMBER, 	0 ITEMCODE, 	totqty QTY, 	totamt AMT, 	promotiontypecode PROMOTYPE, 	CASE 		WHEN repeatingrange = 0 THEN promotionamount 		WHEN repeatingrange = 1 THEN cast(rangeval / rangelow AS int) * promotionamount 	END AS PROMOVAL, 	CASE 		WHEN repeatingrange = 0 THEN promorule 		WHEN repeatingrange = 1 THEN cast(rangeval / rangelow AS int) * promorule 	END AS PROMOAMT, 	( 	SELECT 		enforcepromotion 	FROM 		promoplandetail p5 	WHERE 		p5.plannumber = b.plannumber) ENFORCE FROM 	( 	SELECT 		a.plannumber, 		a.rangelow, 		a.rangehigh, 		a.promotiontypecode, 		a.rangebasis, 		a.qualificationgroup , 		a.assignmentgroup , 		a.repeatingrange, 		promotionamount AS promorule, 		CASE 			WHEN promotiontypecode IN (1, 5) THEN a.promotionamount 			WHEN promotiontypecode IN (2, 6) THEN a.promotionamount * a.totamt / 100 		END AS promotionamount, 		a.totqty, 		a.totamt, 		CASE 			WHEN a.rangebasis = 1 THEN a.totqty 			WHEN a.rangebasis = 2 THEN a.totamt 		END rangeval 	FROM 		( 		SELECT 			p.plannumber, 			p3.rangelow, 			p3.rangehigh, 			p.promotiontypecode, 			p.rangebasis, 			p.qualificationgroup , 			p.assignmentgroup , 			p3.repeatingrange, 			p3.promotionamount, 			sum(i2.salesqty) totqty, 			sum(i2.salesqty * salesprice) totamt 		FROM 			salesorderheader i 		INNER JOIN salesorderdetail i2 ON 			i.visitkey = i2.visitkey 		INNER JOIN customermaster c ON 			i.customercode = c.customercode 		INNER JOIN promokeydetail p ON 			p.promotionkey = c.promotionkey 		INNER JOIN productgroupdetail p2 ON 			p.qualificationgroup = p2.groupnumber 			AND i2.itemcode = p2.itemcode 		INNER JOIN promotionassignmentadvanced p3 ON 			p.plannumber = p3.assignmentnumber 		WHERE 			i.visitkey = "
						+ visitkey
						+ " 		GROUP BY 			p.plannumber , 			p3.rangelow, 			p3.rangehigh, 			p.promotiontypecode, 			p.rangebasis, 			p.qualificationgroup , 			p.assignmentgroup, 			p3.repeatingrange , 			p3.promotionamount ) a 	WHERE 		CASE 			WHEN repeatingrange = 0 THEN CASE 				WHEN rangebasis = 1 THEN totqty BETWEEN rangelow AND rangehigh 				WHEN rangebasis = 2 THEN totamt BETWEEN rangelow AND rangehigh 			END 			WHEN repeatingrange = 1 THEN CASE 				WHEN rangebasis = 1 THEN totqty >= rangelow 				WHEN rangebasis = 2 THEN totamt >= rangelow 			END 		END ) b WHERE promotiontypecode IN (1, 2, 5, 6, 7) ORDER BY  	plannumber ";
				data = d1.execSelectQuery(sql);
				if (data.length() > 0) {
					detailDataList = data.getJSONArray("array");

					for (int i = 0; i < detailDataList.length(); i++) {
						JSONObject detailDataLine = detailDataList.getJSONObject(i);
						planNo = Integer.parseInt(detailDataLine.getString("PLANNUMBER"));
						itemCode = Integer.parseInt(detailDataLine.getString("ITEMCODE"));
						itemQty = Integer.parseInt(detailDataLine.getString("QTY"));
						itemSaleAmt = Double.parseDouble(detailDataLine.getString("AMT"));
						promoType = Integer.parseInt(detailDataLine.getString("PROMOTYPE"));
						promoVal = Double.parseDouble(detailDataLine.getString("PROMOVAL"));
						promoRuleAmt = Double.parseDouble(detailDataLine.getString("PROMOAMT"));
						promoenforce = Integer.parseInt(detailDataLine.getString("ENFORCE"));

						sql = " insert into PROMOTIONDETAIL_TEMP(routekey, visitkey, transactionkey, itemcode, promotiontypecode, promotionamount, promotionplannumber,salesamount, oldpromotionamount,exclusionoption) "
								+ "select routekey, visitkey, transactionkey, "
								+ itemCode + ", " + promoType + ", " + promoRuleAmt + ", " + planNo + ", " + itemSaleAmt
								+ ", " + promoVal + ", " + promoenforce + " from salesorderheader where visitkey = "
								+ visitkey + " ";
						d1.execInsertQuery(sql);
					}
				}
				// check for INV LEVEL PROMOTION

//					sql = " SELECT PLANNUMBER AS PLANNUMBER, 	0 ITEMCODE, 	totqty QTY, 	totamt AMT, 	promotiontypecode PROMOTYPE, 	CASE 		WHEN repeatingrange = 0 THEN promotionamount 		WHEN repeatingrange = 1 THEN cast(rangeval / rangelow as int) * promotionamount 	END AS PROMOVAL, 	CASE 		WHEN repeatingrange = 0 THEN promorule 		WHEN repeatingrange = 1 THEN cast(rangeval / rangelow as int) * promorule 	END AS PROMOAMT, 	( 	SELECT 		enforcepromotion 	FROM 		promoplandetail p5 	WHERE 		p5.plannumber = b.plannumber) ENFORCE FROM 	( 	SELECT 		a.plannumber, 		a.rangelow, 		a.rangehigh, 		a.promotiontypecode, 		a.rangebasis, 		a.qualificationgroup , 		a.assignmentgroup , 		a.repeatingrange, 		promotionamount AS promorule, 		CASE 			WHEN promotiontypecode IN (1, 5) THEN a.promotionamount 			WHEN promotiontypecode IN (2, 6) THEN a.promotionamount * a.totamt / 100 		END AS promotionamount, 		a.totqty, 		a.totamt, 		CASE 			WHEN a.rangebasis = 1 THEN a.totqty 			WHEN a.rangebasis = 2 THEN a.totamt 		END rangeval 	FROM 		( 		SELECT 			p.plannumber, 			p3.rangelow, 			p3.rangehigh, 			p.promotiontypecode, 			p.rangebasis, 			p.qualificationgroup , 			p.assignmentgroup , 			p3.repeatingrange, 			p3.promotionamount, 			sum(i2.salesqty) totqty, 			sum(i2.salesqty * salesprice) totamt 		FROM 			salesorderheader i 		INNER JOIN salesorderdetail i2 ON 			i.visitkey = i2.visitkey 		INNER JOIN customermaster c ON 			i.customercode = c.customercode 		INNER JOIN promokeydetail p ON 			p.plannumber = c.invpromoplan 		INNER JOIN promotionassignmentadvanced p3 ON 			p.plannumber = p3.assignmentnumber 		WHERE 			i.visitkey = "
//						+ visitkey
//						+ " 		GROUP BY 			p.plannumber , 			p3.rangelow, 			p3.rangehigh, 			p.promotiontypecode, 			p.rangebasis, 			p.qualificationgroup , 			p.assignmentgroup, 			p3.repeatingrange , 			p3.promotionamount ) a 	WHERE 		CASE 			WHEN repeatingrange = 0 THEN CASE 				WHEN rangebasis = 1 THEN totqty BETWEEN rangelow AND rangehigh 				WHEN rangebasis = 2 THEN totamt BETWEEN rangelow AND rangehigh 			END 			WHEN repeatingrange = 1 THEN CASE 				WHEN rangebasis = 1 THEN totqty >= rangelow 				WHEN rangebasis = 2 THEN totamt >= rangelow 			END 		END ) b ORDER BY 	plannumber ";
				
					sql = " SELECT PLANNUMBER AS PLANNUMBER, 0 ITEMCODE, totqty QTY, totamt AMT, promotiontypecode PROMOTYPE, CASE 	WHEN repeatingrange = 0 THEN promotionamount WHEN repeatingrange = 1 THEN cast(rangeval / rangelow as int) * promotionamount 	END AS PROMOVAL, CASE WHEN repeatingrange = 0 THEN promorule WHEN repeatingrange = 1 THEN cast(rangeval / rangelow as int) * promorule 	END AS PROMOAMT, ( 	SELECT 	enforcepromotion FROM 	promoplandetail p5 	WHERE 	p5.plannumber = b.plannumber) ENFORCE FROM 	( SELECT a.plannumber, 	a.rangelow, a.rangehigh, a.promotiontypecode, a.rangebasis, a.qualificationgroup , 	a.assignmentgroup , a.repeatingrange, promotionamount AS promorule, CASE WHEN promotiontypecode IN (1, 5) THEN a.promotionamount WHEN promotiontypecode IN (2, 6) THEN a.promotionamount * a.totamt / 100 	END AS promotionamount, a.totqty, 	a.totamt, 	CASE WHEN a.rangebasis = 1 THEN a.totqty WHEN a.rangebasis = 2 THEN a.totamt END rangeval 	FROM 	( SELECT 	p.plannumber, 	p3.rangelow, 	p3.rangehigh, 	p.promotiontypecode, p.rangebasis, 	p.qualificationgroup , 	p.assignmentgroup , p3.repeatingrange, 	p3.promotionamount, sum(i2.salesqty) totqty, sum(i2.salesqty * salesprice) totamt FROM 	salesorderheader i 	INNER JOIN salesorderdetail i2 ON 	i.visitkey = i2.visitkey and i2.totalqty > 0 INNER JOIN customermaster c ON i.customercode = c.customercode INNER JOIN promokeydetail p ON 	p.promotionkey = c.promotionkey and p.qualificationgroup = 1 INNER JOIN promotionassignmentadvanced p3 ON 	p.plannumber = p3.assignmentnumber 	INNER JOIN itemmaster i3 on i2.itemcode = i3.actualitemcode	WHERE 	i.visitkey = "
							+ visitkey
							+ " GROUP BY p.plannumber , p3.rangelow, p3.rangehigh,p.promotiontypecode, p.rangebasis,p.qualificationgroup , p.assignmentgroup, p3.repeatingrange , p3.promotionamount ) a WHERE 	CASE WHEN repeatingrange = 0 THEN CASE 	WHEN rangebasis = 1 THEN totqty BETWEEN rangelow AND rangehigh 	WHEN rangebasis = 2 THEN totamt BETWEEN rangelow AND rangehigh 	END WHEN repeatingrange = 1 THEN CASE 	WHEN rangebasis = 1 THEN totqty >= rangelow 	WHEN rangebasis = 2 THEN totamt >= rangelow END END ) b WHERE promotiontypecode IN (1, 2, 5, 6, 7) ORDER BY plannumber ";
					
					data = d1.execSelectQuery(sql);
				if (data.length() > 0) {
					detailDataList = data.getJSONArray("array");

					for (int i = 0; i < detailDataList.length(); i++) {
						JSONObject detailDataLine = detailDataList.getJSONObject(i);
						planNo = Integer.parseInt(detailDataLine.getString("PLANNUMBER"));
						itemCode = 0;
						itemQty = Integer.parseInt(detailDataLine.getString("QTY"));
						itemSaleAmt = Double.parseDouble(detailDataLine.getString("AMT"));
						promoType = Integer.parseInt(detailDataLine.getString("PROMOTYPE"));
						promoVal = Double.parseDouble(detailDataLine.getString("PROMOVAL"));
						promoRuleAmt = Double.parseDouble(detailDataLine.getString("PROMOAMT"));
						promoenforce = Integer.parseInt(detailDataLine.getString("ENFORCE"));
						if (promoType == 5 || promoType == 6) // Promotion on Invoice
						{
							if (promoVal != 0) {
								if (itemQty > 0)
									headPromoVal += promoVal;
								if (itemQty < 0)
									headPromoVal -= promoVal;
								sql = " insert into PROMOTIONDETAIL_TEMP(routekey, visitkey, transactionkey, itemcode, promotiontypecode, promotionamount, promotionplannumber,salesamount, oldpromotionamount,exclusionoption) select routekey, visitkey, transactionkey, "
										+ itemCode + ", " + promoType + ", " + promoRuleAmt + ", " + planNo + ", "
										+ itemSaleAmt
										+ ", " + promoVal + ", " + promoenforce
										+ " from salesorderheader where visitkey = " + visitkey + " ";
								d1.execInsertQuery(sql);
							}
						}
					}
				}
				// end of check for INV LEVEL PROMOTION

				// check for COMBO PROMOTION
//				sql = " SELECT visitkey, plannumber PLANNUMBER, promotiontypecode PROMOTIONTYPECODE, promotionamount PROMOAMT, saleamt SALEAMT, saleamt * promotionamount/100 PROMOVAL, enforce from( SELECT a.VISITKEY, a.plannumber, a.promotiontypecode, p3.promotionamount,ENFORCEPROMOTION AS ENFORCE, (SELECT IFNULL(TOTALSALESAMOUNT,0) - IFNULL(totalreturnamount,0) - IFNULL(totaldamagedamount,0) FROM SALESORDERheader i WHERE visitkey = "
//						+ visitkey
//						+ " ) saleamt FROM ( SELECT i.visitkey, p.plannumber,p.PROMOTIONTYPECODE,p.ENFORCEPROMOTION, count(DISTINCT i2.itemcode) icnt FROM salesorderheader i INNER JOIN salesorderdetail i2 ON i.visitkey = i2.visitkey INNER JOIN customermaster c ON i.customercode = c.customercode INNER JOIN promoplandetail p ON p.plannumber = c.combopromoplan INNER JOIN productgroupdetail p2 ON p2.groupnumber = p.qualificationgroup AND i2.itemcode = p2.itemcode WHERE i.visitkey = "
//						+ visitkey
//						+ " GROUP BY i.visitkey, p.plannumber, p.PROMOTIONTYPECODE ) a INNER JOIN promotionassignmentadvanced p3 ON a.plannumber = p3.plannumber AND ( CASE WHEN p3.rangehigh  = 0 THEN a.icnt >= p3.rangelow ELSE a.icnt BETWEEN p3.rangelow AND p3.rangehigh END ) ) b; ";
//				
//				sql = " SELECT visitkey, plannumber PLANNUMBER, promotiontypecode PROMOTIONTYPECODE, promotionamount PROMOAMT, saleamt SALEAMT, saleamt * promotionamount/100 PROMOVAL, ( 	SELECT 		enforcepromotion 	FROM 		promoplandetail p5 	WHERE 		p5.plannumber = b.plannumber) ENFORCE from( SELECT a.VISITKEY, a.plannumber, a.promotiontypecode, p3.promotionamount, (SELECT IFNULL(TOTALSALESAMOUNT,0) - IFNULL(totalreturnamount,0) - IFNULL(totaldamagedamount,0) FROM SALESORDERheader i WHERE visitkey = "
//						+ visitkey
//						+ " ) saleamt FROM ( SELECT i.visitkey, p.plannumber,p.PROMOTIONTYPECODE, count(DISTINCT i2.itemcode) icnt FROM salesorderheader i INNER JOIN salesorderdetail i2 ON i.visitkey = i2.visitkey INNER JOIN customermaster c ON i.customercode = c.customercode INNER JOIN promokeydetail p ON p.promotionkey = c.promotionkey  INNER JOIN productgroupdetail p2 ON p2.groupnumber = p.qualificationgroup AND i2.itemcode = p2.itemcode WHERE i.visitkey = "
//						+ visitkey
//						+ " GROUP BY i.visitkey, p.plannumber, p.PROMOTIONTYPECODE ) a INNER JOIN promotionassignmentadvanced p3 ON a.plannumber = p3.plannumber AND ( CASE WHEN p3.rangehigh  = 0 THEN a.icnt >= p3.rangelow ELSE a.icnt BETWEEN p3.rangelow AND p3.rangehigh END ) ) b WHERE promotiontypecode IN (8) ORDER BY 	plannumber ";
//				
				
				sql = " SELECT visitkey, plannumber PLANNUMBER, promotiontypecode PROMOTIONTYPECODE, promotionamount PROMOAMT, saleamt SALEAMT, saleamt * promotionamount / 100 PROMOVAL, enforce FROM (SELECT a.VISITKEY, a.plannumber, a.promotiontypecode, p3.promotionamount, ENFORCEPROMOTION AS ENFORCE, iamt saleamt FROM (SELECT i.visitkey, p.plannumber, p.PROMOTIONTYPECODE, p.ENFORCEPROMOTION, count(DISTINCT i2.itemcode) icnt, sum(i2.salesqty * salesprice) iamt FROM salesorderheader i INNER JOIN salesorderdetail i2 ON i.visitkey = i2.visitkey and i2.totalqty!=0 INNER JOIN customermaster c ON i.customercode = c.customercode INNER JOIN promoplandetail p ON p.plannumber = c.combopromoplan INNER JOIN productgroupdetail p2 ON p2.groupnumber = p.qualificationgroup AND i2.itemcode = p2.itemcode WHERE i.visitkey = " + visitkey +" GROUP BY i.visitkey, p.plannumber, p.PROMOTIONTYPECODE) a INNER JOIN promotionassignmentadvanced p3 ON a.plannumber = p3.plannumber AND (CASE WHEN p3.rangehigh = 0 THEN abs(a.icnt) >= p3.rangelow ELSE abs(a.icnt) BETWEEN p3.rangelow AND p3.rangehigh END)) b";
			    
			    		data = d1.execSelectQuery(sql);
				if (data.length() > 0) {
					detailDataList = data.getJSONArray("array");
					JSONObject detailDataLine = detailDataList.getJSONObject(0);
					planNo = Integer.parseInt(detailDataLine.getString("PLANNUMBER"));
					itemCode = 0;
					itemSaleAmt = Double.parseDouble(detailDataLine.getString("SALEAMT"));
					promoType = Integer.parseInt(detailDataLine.getString("PROMOTIONTYPECODE"));
					promoVal = Double.parseDouble(detailDataLine.getString("PROMOVAL"));
					promoRuleAmt = Double.parseDouble(detailDataLine.getString("PROMOAMT"));
					promoenforce = Integer.parseInt(detailDataLine.getString("ENFORCE"));
					if (promoVal != 0) {
						sql = " insert into PROMOTIONDETAIL_TEMP(routekey, visitkey, transactionkey, itemcode, promotiontypecode, promotionamount, promotionplannumber,salesamount, oldpromotionamount,exclusionoption) select routekey, visitkey, transactionkey, "
								+ itemCode + ", " + promoType + ", " + promoRuleAmt + ", " + planNo + ", " + itemSaleAmt
								+ ", " + promoVal + ", " + promoenforce + " from SALESORDERHEADER where visitkey = "
								+ visitkey + " ";
						d1.execInsertQuery(sql);

						headPromoVal += promoVal;
					}
				}
				// end of check for COMBO PROMOTION
			}

			if (action.equals(PAYMENT)) {
				Double promo_val_upd = 0.0;
				Double amtpromoval = 0.0;
				int promoitemcount = 0;
				double promoitemamount = 0;			   
				// Update Invoice dETAIL
				sql = "UPDATE INVOICEDETAIL SET PROMOAMOUNT =0, RETURNPROMOAMOUNT = 0 WHERE VISITKEY = " + visitkey
						+ "  ";
				d1.execInsertQuery(sql);

				String sql2 = " SELECT promotionplannumber,itemcode,salesamount,returnamount, promotiontypecode,qualificationtypecode, assigngroup,oldpromotionamount,promotionamount,(SELECT sum(d.totalqty) FROM invoicedetail d WHERE p.visitkey = d.visitkey ) invqty,(SELECT sum(d.totalqty) FROM invoicedetail d INNER JOIN invoiceheader s ON d.visitkey = s.visitkey INNER JOIN customermaster c ON s.customercode = c.customercode INNER JOIN productgroupdetail pgd ON d.itemcode = pgd.itemcode INNER JOIN promokeydetail pkd ON pkd.qualificationgroup = pgd.groupnumber AND pkd.promotionkey = c.promotionkey WHERE d.visitkey = "
						+ visitkey
						+ " AND pkd.plannumber = p.promotionplannumber ) qty FROM PROMOTIONDETAIL_TEMP p WHERE VISITKEY = "
						+ visitkey + " and rowid in (" + selpromoList + ") ";

				data = d1.execSelectQuery(sql2);
				if (data.length() > 0) {
					detailDataList = data.getJSONArray("array");

					for (int i = 0; i < detailDataList.length(); i++) {
						promo_val_upd = 0.0;
						promoitemcount = 0;
						amtpromoval = 0.0;

						JSONObject detailDataLine = detailDataList.getJSONObject(i);

						planNo = Integer.parseInt(detailDataLine.getString("promotionplannumber"));
						itemCode = Integer.parseInt(detailDataLine.getString("itemcode"));
						itemQty = Integer.parseInt(detailDataLine.getString("qty"));
						invItemQty = Integer.parseInt(detailDataLine.getString("invqty"));
						itemSaleAmt = Double.parseDouble(detailDataLine.getString("salesamount"));
						itemRetAmt = Double.parseDouble(detailDataLine.getString("returnamount"));
						promoType = Integer.parseInt(detailDataLine.getString("promotiontypecode"));
						qualitype = Integer.parseInt(detailDataLine.getString("qualificationtypecode"));
						assigngroup = Integer.parseInt(detailDataLine.getString("assigngroup"));		
						promoVal = Double.parseDouble(detailDataLine.getString("oldpromotionamount"));
						promoRuleAmt = Double.parseDouble(detailDataLine.getString("promotionamount"));

						sql = " select count(*) iCount, abs(sum(salesgross-returngross-damagedgross-expirygross)) promoinvosamt from invoicedetail where visitkey = " + visitkey
								+ " itemcode in (select itemcode from productgroupdetail where groupnumber = (select assignmentgroup from promokeydetail where plannumber = "
								+ planNo + " )) ";
						data = d1.execSelectQuery(sql);
						if (data.length() > 0) {
							detailDataList1 = data.getJSONArray("array");
							JSONObject detailDataLine1 = detailDataList1.getJSONObject(0);
							promoitemcount = Integer.parseInt(detailDataLine1.getString("iCount"));
							promoitemamount = Integer.parseInt(detailDataLine1.getString("promoinvosamt"));							
						}
	  
	  
						//promoType =1 --> Amount on Item
						//promoType =2 --> %age on Item
						
						//qualitype =1 -> On Qty
						//qualitype =2 -> On Amount			   
									 
	  
						
						if (promoType == 1 || promoType == 2) {
							if(promoType ==1)		//Amount on Item
							{
								sql=" update invoicedetail set PROMOAMOUNT = "+promoRuleAmt+" * salesgross / "+promoitemamount+" where visitkey = "+visitkey+" and itemcode in (select itemcode from productgroupdetail where groupnumber = "+assigngroup+") ";
								d1.execInsertQuery(sql);
								sql=" update invoicedetail set returnpromoamount = "+promoRuleAmt+" * returngross / "+promoitemamount+" where visitkey = "+visitkey+" and itemcode in (select itemcode from productgroupdetail where groupnumber = "+assigngroup+") ";
								d1.execInsertQuery(sql);
								sql=" update invoicedetail set damagedpromoamount = "+promoRuleAmt+" * damagedgross / "+promoitemamount+" where visitkey = "+visitkey+" and itemcode in (select itemcode from productgroupdetail where groupnumber = "+assigngroup+") ";
								d1.execInsertQuery(sql);
								sql=" update invoicedetail set expirypromoamount = "+promoRuleAmt+" * expirygross / "+promoitemamount+" where visitkey = "+visitkey+" and itemcode in (select itemcode from productgroupdetail where groupnumber = "+assigngroup+") ";
								d1.execInsertQuery(sql);
							 
							}
							
							if(promoType ==2) //%age on Item
							{
								sql=" update invoicedetail set PROMOAMOUNT = "+promoRuleAmt+" * salesgross / 100 where visitkey = "+visitkey+" and itemcode in (select itemcode from productgroupdetail where groupnumber = "+assigngroup+") ";
								d1.execInsertQuery(sql);
								sql=" update invoicedetail set returnpromoamount = "+promoRuleAmt+" * returngross / 100 where visitkey = "+visitkey+" and itemcode in (select itemcode from productgroupdetail where groupnumber = "+assigngroup+") ";
								d1.execInsertQuery(sql);
								sql=" update invoicedetail set damagedpromoamount = "+promoRuleAmt+" * damagedgross / 100 where visitkey = "+visitkey+" and itemcode in (select itemcode from productgroupdetail where groupnumber = "+assigngroup+") ";
								d1.execInsertQuery(sql);
								sql=" update invoicedetail set expirypromoamount = "+promoRuleAmt+" * expirygross / 100 where visitkey = "+visitkey+" and itemcode in (select itemcode from productgroupdetail where groupnumber = "+assigngroup+") ";
								d1.execInsertQuery(sql);
							}
	  
	  
	  
	  }
											   
		
						if (promoType == 5 || promoType == 6 || promoType == 8) {
							if (invItemQty > 0) {
								headPromoVal += promoVal;
							}
							if (invItemQty < 0) {
								headPromoVal -= promoVal;
							}
						}

						sql = " insert into promotiondetail(routekey, visitkey, transactionkey, itemcode, promotiontypecode, promotionamount, promotionplannumber,salesamount, oldpromotionamount) "
								+ "select routekey, visitkey, transactionkey, "
								+ itemCode + ", " + promoType + ", " + promoRuleAmt + ", " + planNo + ", " + itemSaleAmt
								+ ", " + promoVal + " from invoiceheader where visitkey = " + visitkey + " ";
						d1.execInsertQuery(sql);

					}
				}

				// PROCESS FREE ITEMS
				JSONArray freeList = new JSONArray(freeItemList);
				for (int i = 0, size = freeList.length(); i < size; i++) {
					int ins = 0;
					JSONObject cpi = freeList.getJSONObject(i);
					sql = " SELECT COUNT(*) icount FROM INVOICEDETAIL WHERE VISITKEY = " + visitkey
							+ " and itemcode = (select actualitemcode from itemmaster where alternatecode="
							+ cpi.getString("iCode") + ") ";
					data = d1.execSelectQuery(sql);
					if (data.length() > 0) {
						detailDataList = data.getJSONArray("array");
						JSONObject detailDataLine = detailDataList.getJSONObject(0);
						ins = Integer.parseInt(detailDataLine.getString("icount"));
					}
					if (ins == 0) {
						sql = " INSERT INTO invoicedetail(itemcode,routekey,transactionkey,visitkey,freesampleqty,istemp,salesprice,issync,salescaseprice,stdsalesprice,stdsalescaseprice,stdreturnprice,stdreturncaseprice,returnprice,returncaseprice,goodreturnprice,goodreturncaseprice,promoqty)  select (select actualitemcode from itemmaster where alternatecode="
								+ cpi.getString("iCode")
								+ "),(SELECT routekey FROM startendday LIMIT 1),(select transactionkey from salesorderheader where visitkey = "
								+ visitkey + " limit 1)," + visitkey + "," + cpi.getString("iQty")
								+ ",'true',defaultsalesprice,0,caseprice,defaultsalesprice,caseprice,defaultreturnprice,returncaseprice,defaultreturnprice,returncaseprice,defaultgoodreturnprice,defaultgoodreturncaseprice,"
								+ cpi.getString("iQty") + "  from itemmaster where alternatecode= "
								+ cpi.getString("iCode") + "  ";
					}
					if (ins > 0) {
						sql = " UPDATE invoicedetail SET freesampleqty = " + cpi.getString("iQty") + ",promoqty= "
								+ cpi.getString("iQty") + ",mdat = datetime(),issync=0 WHERE visitkey = " + visitkey
								+ " AND itemcode = (select actualitemcode from itemmaster where alternatecode="
								+ cpi.getString("iCode") + ") ";
					}

					try {
						d1.execInsertQuery(sql);
					} catch (Exception ar) {
						int ee = 1;
					}
				}
				
				sql = "select customercode from invoiceheader where visitkey = " + visitkey + " ";
				data = d1.execSelectQuery(sql);
				if(data.length() > 0) {
					CustomerDataList = data.getJSONArray("array");
					JSONObject CustomerData = CustomerDataList.getJSONObject(0);
					customerCode = Integer.parseInt(CustomerData.getString("customercode"));
				}
				
				sql = "select ifnull(applytax,0) applytax from customermaster where customercode = "+customerCode+" ";
				data = d1.execSelectQuery(sql);
				if(data.length() > 0) {
					CustomerTax = data.getJSONArray("array");
					JSONObject CutomerApplytax = CustomerTax.getJSONObject(0);
					applyTax = Integer.parseInt(CutomerApplytax.getString("applytax"));
				}
				
				if(applyTax == 2) {
					sql = "UPDATE INVOICEDETAIL SET " +
						      "SALESITEMGSTTAX = (((IFNULL(salesqty,0)*salesprice) - IFNULL(promoamount,0))/100.0) * " +
						      "(SELECT t.taxpercentage FROM taxmaster t JOIN itemmaster i ON i.itemtaxkey2 = t.taxcode WHERE i.actualitemcode = INVOICEDETAIL.itemcode LIMIT 1), " +

						      "returnitemgsttax = (((IFNULL(returnqty,0)*returnprice) - IFNULL(returnpromoamount,0))/100.0) * " +
						      "(SELECT t.taxpercentage FROM taxmaster t JOIN itemmaster i ON i.itemtaxkey2 = t.taxcode WHERE i.actualitemcode = INVOICEDETAIL.itemcode LIMIT 1), " +

						      "damageditemgsttax = (((IFNULL(damagedqty,0)*salesprice) - IFNULL(returnpromoamount,0))/100.0) * " +
						      "(SELECT t.taxpercentage FROM taxmaster t JOIN itemmaster i ON i.itemtaxkey2 = t.taxcode WHERE i.actualitemcode = INVOICEDETAIL.itemcode LIMIT 1) " +

						      "WHERE visitkey = " + visitkey;
					d1.execInsertQuery(sql);
				}
				
				
				sql = " UPDATE INVOICEDETAIL SET salesafeterdisc = SALESGROSS - PROMOAMOUNT, returnafeterdisc= returngross - ABS(returnpromoamount), damagedafeterdisc = DAMAGEDGROSS - ABS(DAMAGEDPROMOAMOUNT), expiryafeterdisc= expirygross - ABS(expirypromoamount) WHERE VISITKEY = "+visitkey+"  ";
				d1.execInsertQuery(sql);
				
				sql = " UPDATE INVOICEDETAIL SET salesafetertax = salesafeterdisc + salesitemgsttax , returnafetertax = returnafeterdisc  + ABS(returnitemgsttax ),  damagedafetertax = damagedafeterdisc + ABS(damageditemgsttax ), expiryafetertax = expiryafeterdisc  + ABS(expiryitemgsttax ) WHERE visitkey = "+visitkey+" ";
				d1.execInsertQuery(sql);
				
				sql = " UPDATE INVOICEDETAIL SET totalitemamount = ifnull(salesafetertax,0) - ifnull(returnafetertax,0) - ifnull(damagedafetertax,0) - ifnull(expiryafetertax,0) where visitkey = "+visitkey+"  ";
				d1.execInsertQuery(sql);
				
	
				sql = " update invoiceheader set itemlinetaxamount = (select sum(ifnull(SALESITEMGSTTAX,0)) - sum(ifnull(returnitemgsttax,0)) - sum(ifnull(damageditemgsttax,0)) from invoicedetail where visitkey = "
						+ visitkey + " )  where visitkey = " + visitkey + "  ";
				d1.execInsertQuery(sql);

				sql = " update invoiceheader set totalpromoamount = abs((select sum(abs(ifnull(PROMOAMOUNT,0))) - sum(abs(ifnull(RETURNPROMOAMOUNT,0))) - sum(abs(ifnull(damagedpromoamount,0))) from invoicedetail where visitkey = "
						+ visitkey + " )) + " + Math.abs( headPromoVal )+ " where visitkey =" + visitkey + "  ";
				d1.execInsertQuery(sql);

				sql = " select case when ifnull(itemlinetaxamount,0) = 0 then 0 else ifnull(totalpromoamount,0) - abs((select sum(abs(ifnull(PROMOAMOUNT,0))) - sum(abs(ifnull(RETURNPROMOAMOUNT,0))) - sum(abs(ifnull(damagedpromoamount,0))) from invoicedetail where visitkey = "
						+ visitkey + " )) end as headerpromoval from invoiceheader where visitkey = " + visitkey + " ";
				data = d1.execSelectQuery(sql);
				if (data.length() > 0) {
					detailDataList = data.getJSONArray("array");
					JSONObject detailDataLine = detailDataList.getJSONObject(0);
					currentHeadPromoVal = Double.parseDouble(detailDataLine.getString("headerpromoval"));
					if (currentHeadPromoVal < 0) {
						currentHeadPromoVal = 0;
					}
				} else {
					currentHeadPromoVal = 0;
				}

				headPromoVat = currentHeadPromoVal * 5 / 100;
				sql = " update invoiceheader set headerdiscounttaxamt = " + headPromoVat + " where visitkey ="
						+ visitkey;
				d1.execInsertQuery(sql);

				sql = "UPDATE invoiceheader SET totalinvoiceamount = " +
					      "(SELECT IFNULL(SUM(totalitemamount),0) FROM invoicedetail WHERE visitkey = " + visitkey + ") " +
					      " - " + currentHeadPromoVal + " - " + headPromoVat +
					      " WHERE visitkey = " + visitkey;
				d1.execInsertQuery(sql);

			}
			if (action.equals(CONFIGURE)) {
				Double amtpromoval = 0.0;
				int promoitemcount = 0;
				// Update Invoice dETAIL
				sql = "UPDATE SALESORDERDETAIL SET PROMOAMOUNT =0 WHERE VISITKEY = " + visitkey
						+ "  ";
				d1.execInsertQuery(sql);

				sql = " SELECT promotionplannumber, itemcode,salesamount,promotiontypecode,oldpromotionamount,promotionamount,(SELECT	sum((IFNULL(D.SALESQTY, 0)-IFNULL(D.RETURNQTY,0)-IFNULL(D.damagedqty,0))) FROM salesorderdetail d WHERE	p.visitkey = d.visitkey ) invqty, ( SELECT sum((IFNULL(D.SALESQTY,0)-IFNULL(D.RETURNQTY,0)-IFNULL(D.damagedqty,0))) FROM salesorderdetail d WHERE d.visitkey = "
						+ visitkey
						+ " AND d.itemcode IN(( SELECT itemcode FROM productgroupdetail WHERE groupnumber = ( SELECT qualificationgroup FROM promokeydetail WHERE plannumber = promotionplannumber ))) ) qty FROM PROMOTIONDETAIL_TEMP p WHERE VISITKEY = "
						+ visitkey + " and rowid in (" + selpromoList + ") ";
				sql = "  SELECT promotionplannumber, itemcode,salesamount,promotiontypecode,oldpromotionamount,promotionamount, (SELECT sum((IFNULL(D.SALESQTY,0)-IFNULL(D.RETURNQTY,0)-IFNULL(D.damagedqty,0))) FROM salesorderdetail d WHERE p.visitkey = d.visitkey ) invqty,(SELECT sum((IFNULL(D.SALESQTY,0)-IFNULL(D.RETURNQTY,0)-IFNULL(D.damagedqty,0))) FROM salesorderdetail d  INNER JOIN salesorderheader s ON d.visitkey = s.visitkey INNER JOIN customermaster c ON s.customercode = c.customercode INNER JOIN productgroupdetail pgd ON d.itemcode = pgd.itemcode INNER JOIN promokeydetail pkd ON pkd.qualificationgroup = pgd.groupnumber AND pkd.promotionkey = c.promotionkey WHERE d.visitkey = "
						+ visitkey
						+ " AND pkd.plannumber = p.promotionplannumber ) qty FROM PROMOTIONDETAIL_TEMP p WHERE VISITKEY = "
						+ visitkey + " and rowid in (" + selpromoList + ") ";
				data = d1.execSelectQuery(sql);
				if (data.length() > 0) {
					detailDataList = data.getJSONArray("array");

					for (int i = 0; i < detailDataList.length(); i++) {
						JSONObject detailDataLine = detailDataList.getJSONObject(i);
						promoitemcount = 0;
						amtpromoval = 0.0;
						planNo = Integer.parseInt(detailDataLine.getString("promotionplannumber"));
						itemCode = Integer.parseInt(detailDataLine.getString("itemcode"));
						itemQty = Integer.parseInt(detailDataLine.getString("qty"));
						invItemQty = Integer.parseInt(detailDataLine.getString("invqty"));
						itemSaleAmt = Double.parseDouble(detailDataLine.getString("salesamount"));
						promoType = Integer.parseInt(detailDataLine.getString("promotiontypecode"));
						promoVal = Double.parseDouble(detailDataLine.getString("oldpromotionamount"));
						promoRuleAmt = Double.parseDouble(detailDataLine.getString("promotionamount"));

						sql = " select count(*) iCount from salesorderdetail where visitkey = " + visitkey
								+ " and itemcode in (select itemcode from productgroupdetail where groupnumber = (select assignmentgroup from promokeydetail where plannumber = "
								+ planNo + " )) ";
						data = d1.execSelectQuery(sql);
						if (data.length() > 0) {
							detailDataList1 = data.getJSONArray("array");
							JSONObject detailDataLine1 = detailDataList1.getJSONObject(0);
							promoitemcount = Integer.parseInt(detailDataLine1.getString("iCount"));
						}

						if (promoType == 1 || promoType == 2) {
							if (promoType == 1 && itemQty > 0) {
								if (promoitemcount == 0) {
									amtpromoval = 0.0;
								} else {
									amtpromoval = promoRuleAmt / promoitemcount;
								}
								sql = " update salesorderdetail set PROMOAMOUNT = " + amtpromoval + ", PROMOVALUE= "
										+ amtpromoval + " where  visitkey  = " + visitkey
										+ " and itemcode in ( select itemcode from productgroupdetail where groupnumber = (select assignmentgroup from promokeydetail where plannumber = "
										+ planNo + " ))  ";
							}
							if (promoType == 2 && itemQty > 0) {
								sql = " update salesorderdetail set PROMOAMOUNT = " + promoRuleAmt
										+ " * ( ( ifnull(salesqty,0)*salesprice - ifnull(returnqty,0)* returnprice - ifnull(damagedqty,0)*returnprice ) )/100, PROMOVALUE= "
										+ promoRuleAmt
										+ " * ( ( ifnull(salesqty,0)*salesprice - ifnull(returnqty,0)* returnprice - ifnull(damagedqty,0)*returnprice ) )/100 where  visitkey  = "
										+ visitkey
										+ " and itemcode in ( select itemcode from productgroupdetail where groupnumber = (select assignmentgroup from promokeydetail where plannumber = "
										+ planNo + " ))  ";
							}

							d1.execInsertQuery(sql);
						}

						if (promoType == 5 || promoType == 6 || promoType == 8) {
							if (invItemQty > 0) {
								headPromoVal += promoVal;
							}
							if (invItemQty < 0) {
								headPromoVal -= promoVal;
							}
						}

						sql = " insert into promotiondetail(routekey, visitkey, transactionkey, itemcode, promotiontypecode, promotionamount, promotionplannumber,salesamount, oldpromotionamount) "
								+ "select routekey, visitkey, transactionkey, "
								+ itemCode + ", " + promoType + ", " + promoRuleAmt + ", " + planNo + ", " + itemSaleAmt
								+ ", " + promoVal + " from invoiceheader where visitkey = " + visitkey + " ";
						d1.execInsertQuery(sql);
					}
				}

				// PROCESS FREE ITEMS
				JSONArray freeList = new JSONArray(freeItemList);
				for (int i = 0, size = freeList.length(); i < size; i++) {
					JSONObject cpi = freeList.getJSONObject(i);
					int ins = 0;

					sql = " SELECT COUNT(*) icount FROM salesorderdetail WHERE VISITKEY = " + visitkey
							+ " and itemcode = (select actualitemcode from itemmaster where alternatecode="
							+ cpi.getString("iCode") + ") ";
					data = d1.execSelectQuery(sql);
					if (data.length() > 0) {
						detailDataList = data.getJSONArray("array");
						JSONObject detailDataLine = detailDataList.getJSONObject(0);
						ins = Integer.parseInt(detailDataLine.getString("icount"));
					}
					if (ins == 0) {
						sql = " INSERT INTO salesorderdetail(itemcode,routekey,transactionkey,visitkey,freesampleqty,istemp,salesprice,issync,salescaseprice,stdsalesprice,stdsalescaseprice,stdreturnprice,stdreturncaseprice,returnprice,returncaseprice,goodreturnprice,goodreturncaseprice,promoqty)  select (select actualitemcode from itemmaster where alternatecode="
								+ cpi.getString("iCode")
								+ "),(SELECT routekey FROM startendday LIMIT 1),(select transactionkey from salesorderheader where visitkey = "
								+ visitkey + " limit 1)," + visitkey + "," + cpi.getString("iQty")
								+ ",'true',defaultsalesprice,0,caseprice,defaultsalesprice,caseprice,defaultreturnprice,returncaseprice,defaultreturnprice,returncaseprice,defaultgoodreturnprice,defaultgoodreturncaseprice,"
								+ cpi.getString("iQty") + "  from itemmaster where alternatecode= "
								+ cpi.getString("iCode") + "  ";
					}
					if (ins > 0) {
						sql = " UPDATE salesorderdetail SET freesampleqty = " + cpi.getString("iQty") + ",promoqty= "
								+ cpi.getString("iQty") + ",mdat = datetime(),issync=0 WHERE visitkey = " + visitkey
								+ " AND itemcode = (select actualitemcode from itemmaster where alternatecode="
								+ cpi.getString("iCode") + ") ";
					}

					// sql=" INSERT INTO
					// salesorderdetail(itemcode,routekey,transactionkey,visitkey,freesampleqty,istemp,salesprice,issync,salescaseprice,stdsalesprice,stdsalescaseprice,stdreturnprice,stdreturncaseprice,returnprice,returncaseprice,goodreturnprice,goodreturncaseprice,promoqty)
					// select (select actualitemcode from itemmaster where
					// alternatecode="+cpi.getString("iCode")+"),(SELECT routekey FROM startendday
					// LIMIT 1),(select transactionkey from salesorderheader where visitkey =
					// "+visitkey+" limit
					// 1),"+visitkey+","+cpi.getString("iQty")+",'true',defaultsalesprice,0,caseprice,defaultsalesprice,caseprice,defaultreturnprice,returncaseprice,defaultreturnprice,returncaseprice,defaultgoodreturnprice,defaultgoodreturncaseprice,"+cpi.getString("iQty")+"
					// from itemmaster where alternatecode= "+cpi.getString("iCode")+" ON CONFLICT
					// do UPDATE SET freesampleqty = "+cpi.getString("iQty")+",promoqty=
					// "+cpi.getString("iQty")+",mdat = datetime(),issync=0 WHERE visitkey =
					// "+visitkey+" AND itemcode = (select actualitemcode from itemmaster where
					// alternatecode="+cpi.getString("iCode")+") ";

					try {
						d1.execInsertQuery(sql);
					} catch (Exception ar) {
						int ee = 1;
					}
				}
				
				sql = "select customercode from salesorderheader where visitkey = " + visitkey + " ";
				data = d1.execSelectQuery(sql);
				if(data.length() > 0) {
					CustomerDataList = data.getJSONArray("array");
					JSONObject CustomerData = CustomerDataList.getJSONObject(0);
					customerCode = Integer.parseInt(CustomerData.getString("customercode"));
				}
				
				sql = "select ifnull(applytax,0) applytax from customermaster where customercode = "+customerCode+" ";
				data = d1.execSelectQuery(sql);
				if(data.length() > 0) {
					CustomerTax = data.getJSONArray("array");
					JSONObject CutomerApplytax = CustomerTax.getJSONObject(0);
					applyTax = Integer.parseInt(CutomerApplytax.getString("applytax"));
				}
				
				if(applyTax == 2) {
					sql = " update salesorderdetail as d set salesordervat = ((ifnull(salesqty,0)*salesprice) - ifnull(promoamount ,0) )/100 * ( select taxpercentage from taxmaster t join itemmaster i on i.itemtaxkey2=t.taxcode where i.actualitemcode = d.itemcode ),returnvat = ((ifnull(returnqty,0)*returnprice) )/100 * ( select taxpercentage from taxmaster t join itemmaster i on i.itemtaxkey2=t.taxcode where i.actualitemcode = d.itemcode ), damagedvat = ((ifnull(damagedqty,0)*salesprice) )/100 * ( select taxpercentage from taxmaster t join itemmaster i on i.itemtaxkey2=t.taxcode where i.actualitemcode = d.itemcode ) where visitkey = "
							+ visitkey + " ";
					d1.execInsertQuery(sql);

					sql = " update salesorderheader set totallineitemtax = (select sum(ifnull(salesordervat,0)) - sum(ifnull(returnvat,0)) - sum(ifnull(damagedvat,0)) from salesorderdetail where visitkey = "
							+ visitkey + " )  where visitkey = " + visitkey + "  ";
					d1.execInsertQuery(sql);
				}
				

				sql = " update salesorderheader set totalpromoamount = "
						+ "(select sum(ifnull(PROMOAMOUNT,0)) from salesorderdetail where visitkey = " + visitkey
						+ " ) "
						+ "+ " + headPromoVal + " "
						+ "where visitkey =" + visitkey + "  ";
				d1.execInsertQuery(sql);

				sql = " update salesorderheader as h set totalinvoiceamount = ( select SUM( ifnull(totalgross,0) ) from  salesorderdetail D where visitkey = "
						+ visitkey + " ) - ifnull(totalpromoamount,0) + ifnull(totallineitemtax,0) where visitkey = "
						+ visitkey + " ";
				d1.execInsertQuery(sql);
			}

			// if (action.equals(PAYMENT)) {
			// // start the pay logic
			// payWizzitIndent(args);
			// }

			// payWizzitIndent(args);

		} catch (Exception e) {
			e.printStackTrace();
			callbackContext.error("Error " + e.getMessage());
			return true;
		}
		return true;

	}

	
	
	public void appupdateWizzitIndent(JSONArray args) throws JSONException {
		
		float latsetversion = Float.parseFloat(args.getString(0));
		float cVersion = Float.parseFloat(args.getString(1));
		String apkUrl = args.getString(2);
		String msgdownload = "";
		String filePath = "";
		Context context = this.cordova.getActivity().getApplicationContext();
		
		try {
			
			URL urldownload = new URL(apkUrl);
			HttpURLConnection connection = (HttpURLConnection) urldownload.openConnection();
			connection.setReadTimeout(15000); // Set read timeout to 15 seconds
			connection.setConnectTimeout(15000); // Set connection timeout to 15 seconds
			connection.connect();
			
			// Check if the response code is 200 (HTTP_OK)
			int responseCode = connection.getResponseCode();
			if (responseCode == HttpURLConnection.HTTP_OK) {
				
				//System.out.println("Connection established. Response Code: " + responseCode);

				int contentLength = connection.getContentLength();
				//System.out.println("Content Length: " + contentLength + " bytes");

				InputStream input = new BufferedInputStream(connection.getInputStream());
				File apkFile = new File(
						Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
						"updateapk.apk");

				if (apkFile.exists()) {
					apkFile.delete();
				}

				FileOutputStream output = new FileOutputStream(apkFile);

				byte[] datadownload = new byte[16384]; // 16KB buffer size
				int count;
				long totaldownload = 0;
				while ((count = input.read(datadownload)) != -1) {
					totaldownload += count;
					output.write(datadownload, 0, count);
					// Log the progress
					msgdownload = "Downloaded " + totaldownload + " bytes";
				}

				output.flush();
				output.close();
				input.close();
				filePath = apkFile.getAbsolutePath();
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("status","1");
				
				callbackContext.success(jsonObject.toString());
				//System.out.println("Download completed. Total size: " + totaldownload + " bytes");
			} else {
				
				JSONObject jsonObject = new JSONObject();
				jsonObject.put("status","0");
				callbackContext.error(jsonObject.toString());
				//System.out.println("Failed to download file: HTTP response code " + responseCode);
			}

			connection.disconnect(); // Close the connection
		
		} catch (Exception ex) {
			callbackContext.error(ex.getMessage());
		}
		
		try {
			
			File apkFile = new File("/storage/emulated/0/Download/updateapk.apk");
			Uri apkUri = android.support.v4.content.FileProvider.getUriForFile(context, "com.phonegap.sfa.provider", apkFile);

			Intent intent = new Intent(Intent.ACTION_VIEW);
			intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
			intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
			context.startActivity(intent);
			
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("status","2");
			callbackContext.success(jsonObject.toString());
			
		} catch (ActivityNotFoundException ex1) {
			JSONObject jsonObject = new JSONObject();
			jsonObject.put("status","0");
			callbackContext.error(jsonObject.toString());
		} catch (Exception ex) {
			callbackContext.error(ex.getMessage());
		}
		
	}

	public void configWizzitIndent() {
		Log.e(TAG, CONFIGURE);
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("currencyCode", "0710"); // ISO 3166 Country Code South Africa
		map.put("currencyCode", "0710"); // ISO 4217 Currency Code South Africa
		map.put("currencyExponent", 2); // Number of decimal places when major currency units
		map.put("readerLimit", 100.00); // Reader limit in major currency units - PIN will be requested over limit
		map.put("enforcePINCVM", false); // If this set to true, PIN will always be requested
		map.put("mockStatusCode", "00"); // For the functional testing version of the Payment App, sets the payment
											// status returned by the mock server
		try {
			Intent intent = new Intent("com.wizzitdigital.emv.sdk.oab.EMVCONFIG");

			intent = prepareIntentData(map, intent);

			if (checkIntentAvailability(intent))
				cordova.startActivityForResult(this, intent, REQUEST_CODE_CONFIG);
		} catch (ActivityNotFoundException ex1) {
			callbackContext.error("Activity Not Found");
		} catch (Exception ex) {
			callbackContext.error(ex.getMessage());
		}
	}

	public void payWizzitIndent(JSONArray args) {
		Log.e(TAG, PAYMENT);
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			map.put("amount", args.getInt(0));
			map.put("transactionType", "00");
			// Optional. Amount to pay in minor currency units (cents). If not provided,
			// payment app will ask for amount
			// map.put("tip", args.getInt(1)); // Optional. Tip amount (if any) in minor
			// currency units (cents)
			// map.put("acquireTip", false); // Optional. Ignored if tip is provided,
			// otherwise tells payment app whether
			// it should ask for tip amount
			// map.put("ref_id", 1001); // The reference number for the tx to be forwarded
			// to the bank, will generally
			// be the value returned as "rrn" in the transaction result
			// map.put("table", "Table 1001"); // Optional. Arbitrary additional fields like
			// "table" forwarded as metadata
			// with transaction, will only be processed by backend switch by specific
			// arrangement with implementer
		} catch (JSONException e) {
			callbackContext.error("Missing Payment Data");
			return;
		}

		try {
			Intent intent = new Intent("com.wizzitdigital.emv.sdk.oab.EMVTX");

			intent = prepareIntentData(map, intent);

			if (checkIntentAvailability(intent))
				cordova.startActivityForResult(this, intent, REQUEST_CODE_PAY);
		} catch (ActivityNotFoundException ex1) {
			ex1.printStackTrace();
			callbackContext.error("Activity Not Found");
		} catch (Exception ex) {
			callbackContext.error(ex.getMessage());
		}
	}

	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
		super.onActivityResult(requestCode, resultCode, data);

		Log.e(TAG, "onActivityResult: " + requestCode + " " + resultCode + " " + data.toString());

		Bundle bundle = data.getExtras();
		// show all bundle extras data. delete if not needed
		if (bundle != null) {
			Log.e(TAG, "Bundle has extras");
			for (String key : bundle.keySet()) {
				Object value = bundle.get(key);
				Log.d(TAG, key + ": " + value.toString());
			}
		}

		if (requestCode == REQUEST_CODE_CONFIG) {
			if (resultCode == Activity.RESULT_OK) {
				if (data.getBooleanExtra("success", false)) {
					callbackContext.success("Configure Success");
				} else {
					callbackContext.error("Configure Fail");
				}
			} else {
				callbackContext.error("Configure Canceled");
			}
		}

		if (requestCode == REQUEST_CODE_PAY) {
			if (resultCode == Activity.RESULT_OK) {
				if (data.getBooleanExtra("isSuccessful", false)) {
					callbackContext.success("Pay Success");
				} else {
					callbackContext.error("Pay Fail " + data.getStringExtra("reason"));
				}
			} else {
				callbackContext.error("Pay Canceled");
			}
		}
	}

	public Intent prepareIntentData(Map<String, Object> map, Intent intent) {
		for (Map.Entry<String, Object> entry : map.entrySet()) {
			String key = entry.getKey();
			Object value = entry.getValue();

		}

		return intent;
	}

	private boolean checkIntentAvailability(Intent intent) {
		PackageManager packageManager = cordova.getActivity().getPackageManager();

		ResolveInfo resolveInfo = packageManager.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY);

		if (resolveInfo == null) {
			callbackContext.error("Payment App Not Installed");
			return false;
		}

		return true;
	}
}
