var platform = sessionStorage.getItem("platform");
var invoicedetail = {};
var invoiceheader = {};
var invoicerxddetail = {};
var promotiondetail = {};
var customerinvoice = {};
var salesorderdetail = {};
var salesorderheader = {};
var batchexpirydetail = {};
var arheader = {};
var ardetail = {};
var cashcheckdetail = {};
var invetorytransactionheader = {};
var inventorytransactiondetail = {};
var inventorysummarydetail = {};
var nonservicedcustomer = {};
var surveyauditdetail = {};
var posequipmentchangedetail = {};
var posmaster = {};
var sigcapturedata = {};
var customermaster = {};
var customeroperationscontrol = {};
var routemaster = {};
var routesequencecustomerstatus = {};
var customerinventorydetail = {};
var routegoal = {};
var nosalesheader = {};
var customer_foc_balance = {};
var enddaydetail = {};
var t_access_override_log = {};
var currentAudit="";
// skip function getstartday,orderrxddetail data to upload to table

function uploadSelection(data) {
	
	 $.mobile.showPageLoadingMsg();
	currentAudit=data;
//	alert(data);
	switch (data) {
	case 0:
		//get Start Day
		break;
	case 1:
			getinvetorytransactionheader();
		break;
	case 2:
			getinventorytransactiondetail()
		break;
	case 3:
		getinventorysummarydetail();
		break;
	case 4:
		getroutesequencecustomerstatus();
		break;
	case 5:
		getcustomeroperationcontrol();
		break;
	case 6:
		getinvoiceheader();
		break;
	case 7:
//		alert("Customer Operation Controll");
		getinvoicedetail();
		break;
	case 8:
		getinvoicerxddetail();
		break;
	case 9:
		getbatchexpirydetail();
		break;
	case 10:
		getsalesorderheader();
		break;
	case 11:
		getsalesorderdetail();
		break;
	case 12:
		//get Order Rxd detaisl
		break;
	case 13:
		getpromotiondetail();
		break;
	case 14:
		getarheader();
		break;
	case 15:
		getardetail();
		break;
	case 16:
		getcashcheckdetail();
		break;
	case 17:
		
		//get Customer Promotion Plan Details
		break;
	case 18:
		getsurveyauditdetail();
		break;
	case 19:
		getposequipmentchangedetail();
		break;
	case 20:
		getcustomerinventorydetail();
		break;
	case 21:
		getnonservicedcustomer();
		break;
	case 22:
		getnosalesheader();
		break;
		
	case 23://startDay detail
		get_t_access_override_log();
		break;
	
	
		

	}

}

// SAOH data to upload
function getsalesorderheader() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									salesorderheader[i] = result[i];
								}

							}
							salesorderheader = JSON.stringify(salesorderheader);
							getbatchexpirydetail();
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,salesmancode,orderdeliveryroutecode,orderdeliverydate,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,dexflag,splittransaction,voidflag,transmitindicator,hhcinvoicenumber,paymenttype,hhcdocumentnumber,voidreasoncode,advanceused,paymentstatus,advancebalance,mdat,advancereceived,currencycode,status,refnumber,totalfreesampleamount,deliverystatus,data,comments,actualtransactiondate,comments2,hhctransactionkey,totalpromoamount,totalbuybackfreeamount from salesorderheader where issync=0 and istemp='false'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,salesmancode,orderdeliveryroutecode,orderdeliverydate,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,dexflag,splittransaction,voidflag,transmitindicator,hhcinvoicenumber,paymenttype,hhcdocumentnumber,voidreasoncode,advanceused,paymentstatus,advancebalance,mdat,advancereceived,currencycode,status,refnumber,totalfreesampleamount,deliverystatus,data,comments,actualtransactiondate,comments2,hhctransactionkey,totalpromoamount,totalbuybackfreeamount from salesorderheader where issync=0 and istemp='false'",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									salesorderheader[i] = result.array[i];
								}

							}
							salesorderheader = JSON.stringify(salesorderheader);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}

// SAOD data to upload
function getsalesorderdetail() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									salesorderdetail[i] = result[i];
								}

							}
							salesorderdetail = JSON.stringify(salesorderdetail);
							getsalesorderheader();
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,salesprice,returnprice,stdsalesprice,stdreturnprice,coopid,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,currencycode,allocated,freegoodcases,freegoodpcs,salespcs,allocatedcases,salescases,allocatedpcs,returncases,returnpcs from salesorderdetail where issync=0 and istemp='false'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,salesprice,returnprice,stdsalesprice,stdreturnprice,coopid,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,currencycode,allocated,freegoodcases,freegoodpcs,salespcs,allocatedcases,salescases,allocatedpcs,returncases,returnpcs from salesorderdetail where issync=0 and istemp='false'",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									salesorderdetail[i] = result.array[i];
								}

							}
							salesorderdetail = JSON.stringify(salesorderdetail);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
// SADS data to upload
function getsurveyauditdetail() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									surveyauditdetail[i] = result[i];
								}

							}
							surveyauditdetail = JSON
									.stringify(surveyauditdetail);
							getposequipmentchangedetail();

						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,visitkey,surveydefkey,surveypage,surveyindex,surveyrectype,lookuptype,surveyresponse from surveyauditdetail where issync=0" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,visitkey,surveydefkey,surveypage,surveyindex,surveyrectype,lookuptype,surveyresponse from surveyauditdetail where issync=0",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									surveyauditdetail[i] = result.array[i];
								}

							}
							surveyauditdetail = JSON
									.stringify(surveyauditdetail);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}

// RSCS data to upload
function getroutesequencecustomerstatus() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									routesequencecustomerstatus[i] = result[i];
								}

							}
							routesequencecustomerstatus = JSON
									.stringify(routesequencecustomerstatus);

							getcustomerinventorydetail();
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,seqweeknumber,seqweekday,routecode,customercode,sequencenumber,schelduledflag,servicedflag,scannedflag from routesequencecustomerstatus where issync=0" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,seqweeknumber,seqweekday,routecode,customercode,sequencenumber,schelduledflag,servicedflag,scannedflag from routesequencecustomerstatus where issync=0 or issync=''",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									routesequencecustomerstatus[i] = result.array[i];
								}

							}
							routesequencecustomerstatus = JSON
									.stringify(routesequencecustomerstatus);
//							alert(routesequencecustomerstatus);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}

}
// PRMD data to upload
function getpromotiondetail() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									promotiondetail[i] = result[i];
								}

							}
							promotiondetail = JSON.stringify(promotiondetail);
							getcustomerinvoice();
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,promotiontypecode,promotionamount,promotionquantity,catchweightqty,weighted,promotionplannumber,assignmentkey,exclusionoption,promochgindicator,oldpromotionamount,performindicator,performcriteriakey,promotioncaseprice,currencycode from promotiondetail where issync=0 and istemp='false'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,promotiontypecode,promotionamount,promotionquantity,catchweightqty,weighted,promotionplannumber,assignmentkey,exclusionoption,promochgindicator,oldpromotionamount,performindicator,performcriteriakey,promotioncaseprice,currencycode from promotiondetail where issync=0 and istemp='false'",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									promotiondetail[i] = result.array[i];
								}

							}
							promotiondetail = JSON.stringify(promotiondetail);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}

// PECD Data to upload
function getposequipmentchangedetail() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									posequipmentchangedetail[i] = result[i];
								}

							}
							posequipmentchangedetail = JSON
									.stringify(posequipmentchangedetail);
							getposmaster();

						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,visitkey,posaction,itemcode,quantity,serialnumber,instructioncode from posequipmentchangedetail where issync=0" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,visitkey,posaction,itemcode,quantity,serialnumber,instructioncode from posequipmentchangedetail where issync=0",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									posequipmentchangedetail[i] = result.array[i];
								}

							}
							posequipmentchangedetail = JSON
									.stringify(posequipmentchangedetail);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}

// NOSH data to upload
function getnosalesheader() {

	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									nosalesheader[i] = result[i];

								}

							}

							nosalesheader = JSON.stringify(nosalesheader);
							getcustomer_foc_balance();
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select transactionkey,routekey,visitkey,documentnumber,invoicenumber,routecode,salesmancode,transactiondate,transactiontime,nosalereasoncode,voidflag,transmitindicator,customercode,hhcdocumentnumber,hhcinvoicenumber,data from nosalesheader where issync=0" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select transactionkey,routekey,visitkey,documentnumber,invoicenumber,routecode,salesmancode,transactiondate,transactiontime,nosalereasoncode,voidflag,transmitindicator,customercode,hhcdocumentnumber,hhcinvoicenumber,data from nosalesheader where issync=0",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									nosalesheader[i] = result.array[i];
								}

							}
							nosalesheader = JSON.stringify(nosalesheader);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
// NOSC data to upload
function getnonservicedcustomer() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									nonservicedcustomer[i] = result[i];
								}

							}
							nonservicedcustomer = JSON
									.stringify(nonservicedcustomer);
							getsurveyauditdetail();

						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,customercode,reasoncode from nonservicedcustomer where issync=0" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,customercode,reasoncode from nonservicedcustomer where issync=0",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									nonservicedcustomer[i] = result.array[i];
								}

							}
							nonservicedcustomer = JSON
									.stringify(nonservicedcustomer);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}

// IVTH data to uplad
function getinvetorytransactionheader() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									invetorytransactionheader[i] = result[i];
								}

							}
							invetorytransactionheader = JSON
									.stringify(invetorytransactionheader);
							getinventorytransactiondetail();

						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select inventorykey,detailkey,routekey,transactiontype,routecode,salesmancode,transactiondate,transactiontime,documentnumber,odometerreading,transferlocationcode,referencenumber,requestdate,securitycode,transmitindicator,voidflag,hhcdocumentnumber,loadnumber,refdocumentnumber,currencycode,actualtransactiondate,inventorynumber,data from inventorytransactionheader where issync=0 and istemp='false'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select("select inventorykey,detailkey,routekey,transactiontype,routecode,salesmancode,transactiondate,transactiontime,documentnumber,odometerreading,transferlocationcode,referencenumber,requestdate,securitycode,transmitindicator,voidflag,hhcdocumentnumber,loadnumber,refdocumentnumber,currencycode,actualtransactiondate,inventorynumber,data from inventorytransactionheader where issync=0 and istemp='false'",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									invetorytransactionheader[i] = result.array[i];
								}

							}
							invetorytransactionheader = JSON
									.stringify(invetorytransactionheader);
//							alert(invetorytransactionheader);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}

// IVTD data to upload

function getinventorytransactiondetail() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									inventorytransactiondetail[i] = result[i];
								}

							}
							inventorytransactiondetail = JSON
									.stringify(inventorytransactiondetail);
							getinventorysummarydetail();
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,detailkey,transactiontypecode,itemcode,quantity,weighted,itemprice,batchdetailkey,itemcaseprice,currencycode from inventorytransactiondetail where issync=0 and istemp='false'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,detailkey,transactiontypecode,itemcode,quantity,weighted,itemprice,batchdetailkey,itemcaseprice,currencycode from inventorytransactiondetail where issync=0 and istemp='false'",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									inventorytransactiondetail[i] = result.array[i];
								}

							}
							inventorytransactiondetail = JSON
									.stringify(inventorytransactiondetail);
//							alert(inventorytransactiondetail);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
// IVSD data to upload
function getinventorysummarydetail() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									inventorysummarydetail[i] = result[i];
								}

							}
							inventorysummarydetail = JSON
									.stringify(inventorysummarydetail);
							getnonservicedcustomer();

						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select inventorykey,itemcode,routekey,weighted,beginstockqty,loadqty,loadaddqty,loadcutqty,loadreqqty,saleqty,returnqty,damagedaddqty,damagedcutqty,endstockqty,unloadqty,damagedunloadqty,freesampleqty,truckdamagedunloadqty,stdsalesprice,stdreturnprice,cashsalesqty,cashsalesvalue,tcsalesqty,tcsalesvalue,gcsalesqty,gcsalesvalue,cashdamagedqty,cashdamagedvalue,tcdamagedqty,tcdamagedvalue,gcdamagedqty,gcdamagedvalue,cashreturnqty,cashreturnvalue,tcreturnqty,tcreturnvalue,gcreturnqty,gcreturnvalue,promoqty,cashsalesitemexcisetax,cashsalesitemgsttax,cashreturnitemexcisetax,cashreturnitemgsttax,cashdamageditemexcisetax,cashdamageditemgsttax,cashfgitemexcisetax,cashfgitemgsttax,cashpromoitemexcisetax,cashpromoitemgsttax,tcsalesitemexcisetax,tcsalesitemgsttax,tcreturnitemexcisetax,tcreturnitemgsttax,tcdamageditemexcisetax,tcdamageditemgsttax,tcfgitemexcisetax,tcfgitemgsttax,tcpromoitemexcisetax,tcpromoitemgsttax,gcsalesitemexcisetax,gcsalesitemgsttax,gcreturnitemexcisetax,gcreturnitemgsttax,gcdamageditemexcisetax,gcdamageditemgsttax,gcfgitemexcisetax,gcfgitemgsttax,gcpromoitemexcisetax,gcpromoitemgsttax,batchdetailkey,stdsalescaseprice,stdreturncaseprice,expiryqty,stdgoodreturncaseprice,stdgoodreturnprice,currencycode,returnfreeqty,damageqty,expdmgfreeqty,expunloadqty,dmgunloadqty,expdmgfreeunloadqty,rentqty,mdat,freshunloadqty,emptycontainerqty,emptycontainerunloadqty from inventorysummarydetail where issync=0 and istemp='false'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select inventorykey,itemcode,routekey,weighted,beginstockqty,loadqty,loadaddqty,loadcutqty,loadreqqty,saleqty,returnqty,damagedaddqty,damagedcutqty,endstockqty,unloadqty,damagedunloadqty,freesampleqty,truckdamagedunloadqty,stdsalesprice,stdreturnprice,cashsalesqty,cashsalesvalue,tcsalesqty,tcsalesvalue,gcsalesqty,gcsalesvalue,cashdamagedqty,cashdamagedvalue,tcdamagedqty,tcdamagedvalue,gcdamagedqty,gcdamagedvalue,cashreturnqty,cashreturnvalue,tcreturnqty,tcreturnvalue,gcreturnqty,gcreturnvalue,promoqty,cashsalesitemexcisetax,cashsalesitemgsttax,cashreturnitemexcisetax,cashreturnitemgsttax,cashdamageditemexcisetax,cashdamageditemgsttax,cashfgitemexcisetax,cashfgitemgsttax,cashpromoitemexcisetax,cashpromoitemgsttax,tcsalesitemexcisetax,tcsalesitemgsttax,tcreturnitemexcisetax,tcreturnitemgsttax,tcdamageditemexcisetax,tcdamageditemgsttax,tcfgitemexcisetax,tcfgitemgsttax,tcpromoitemexcisetax,tcpromoitemgsttax,gcsalesitemexcisetax,gcsalesitemgsttax,gcreturnitemexcisetax,gcreturnitemgsttax,gcdamageditemexcisetax,gcdamageditemgsttax,gcfgitemexcisetax,gcfgitemgsttax,gcpromoitemexcisetax,gcpromoitemgsttax,batchdetailkey,stdsalescaseprice,stdreturncaseprice,expiryqty,stdgoodreturncaseprice,stdgoodreturnprice,currencycode,returnfreeqty,damageqty,expdmgfreeqty,expunloadqty,dmgunloadqty,expdmgfreeunloadqty,rentqty,mdat,freshunloadqty,emptycontainerqty,emptycontainerunloadqty from inventorysummarydetail where issync=0 and istemp='false'",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									inventorysummarydetail[i] = result.array[i];
								}

							}
							inventorysummarydetail = JSON
									.stringify(inventorysummarydetail);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
// INVR data to upload
function getinvoicerxddetail() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									invoicerxddetail[i] = result[i];
								}

							}
							invoicerxddetail = JSON.stringify(invoicerxddetail);
							getpromotiondetail();
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,itemtranstypeseq,reasoncode,quantity,catchweightqty,weighted,instructioncode,currencycode from invoicerxddetail where issync=0 and istemp='false'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,itemtranstypeseq,reasoncode,quantity,catchweightqty,weighted,instructioncode,currencycode from invoicerxddetail where issync=0 and istemp='false'",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									invoicerxddetail[i] = result.array[i];
								}

							}
							invoicerxddetail = JSON.stringify(invoicerxddetail);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
// INVH data to upload
function getinvoiceheader() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									invoiceheader[i] = result[i];
								}

							}
							invoiceheader = JSON.stringify(invoiceheader);
							uploaddata();
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,salesmancode,presoldordernumber,presalesmancode,presalesroutecode,orderdeliverydate,orderdeliveryroutecode,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,totalfreesampleamount,immediatepaid,amountpaid,invoicebalance,dexflag,dexg86signature,paymenttype,splittransaction,voidflag,transmitindicator,paymentstatus,hhcinvoicenumber,totalpromoamount,gcpaymenttype,hhcdocumentnumber,inventorykey,totaltaxesamount,itemlinetaxamount,totaldiscountamount,voidreasoncode,totalexpiryamount,currencycode,totalmanualfree,totallimitedfree,totalrebaterent,totalfixedrent,actualtransactiondate,boentry,hhctransactionkey,data,comments,totaldiscdistributionamount,totalreplacementamount,comments2,totalbuybackfreeamount,diffround,roundtotalsalesamount from invoiceheader where issync=0 and istemp='false'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,salesmancode,presoldordernumber,presalesmancode,presalesroutecode,orderdeliverydate,orderdeliveryroutecode,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,totalfreesampleamount,immediatepaid,amountpaid,invoicebalance,dexflag,dexg86signature,paymenttype,splittransaction,voidflag,transmitindicator,paymentstatus,hhcinvoicenumber,totalpromoamount,gcpaymenttype,hhcdocumentnumber,inventorykey,totaltaxesamount,itemlinetaxamount,totaldiscountamount,voidreasoncode,totalexpiryamount,currencycode,totalmanualfree,totallimitedfree,totalrebaterent,totalfixedrent,actualtransactiondate,boentry,hhctransactionkey,data,comments,totaldiscdistributionamount,totalreplacementamount,comments2,totalbuybackfreeamount,diffround,roundtotalsalesamount from invoiceheader where issync=0 and istemp='false'",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									invoiceheader[i] = result.array[i];
								}

							}
							invoiceheader = JSON.stringify(invoiceheader);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}

// INVD data to upload
function getinvoicedetail() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									invoicedetail[i] = result[i];

								}

							}

							invoicedetail = JSON.stringify(invoicedetail);
							getinvoiceheader();
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,salesprice,returnprice,stdsalesprice,stdreturnprice,promoqty,salesitemexcisetax,salesitemgsttax,returnitemexcisetax,returnitemgsttax,damageditemexcisetax,damageditemgsttax,fgitemexcisetax,fgitemgsttax,promoitemexcisetax,promoitemgsttax,coopid,batchdetailkey,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,goodreturnprice,goodreturncaseprice,stdgoodreturncaseprice,stdgoodreturnprice,expiryqty,currencycode,returnfreeqty,manualfreeqty,limitedfreeqty,rebaterentqty,fixedrentqty,pricechgindicator,discountamount,discountpercentage,promoamount,replacementqty,replacementprice,replacementcaseprice,promovalue,mdat,returnpromovalue,returnpromoamount,amount,diffround,roundsalesamount from invoicedetail where issync=0" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,salesprice,returnprice,stdsalesprice,stdreturnprice,promoqty,salesitemexcisetax,salesitemgsttax,returnitemexcisetax,returnitemgsttax,damageditemexcisetax,damageditemgsttax,fgitemexcisetax,fgitemgsttax,promoitemexcisetax,promoitemgsttax,coopid,batchdetailkey,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,goodreturnprice,goodreturncaseprice,stdgoodreturncaseprice,stdgoodreturnprice,expiryqty,currencycode,returnfreeqty,manualfreeqty,limitedfreeqty,rebaterentqty,fixedrentqty,pricechgindicator,discountamount,discountpercentage,promoamount,replacementqty,replacementprice,replacementcaseprice,promovalue,mdat,returnpromovalue,returnpromoamount,amount,diffround,roundsalesamount from invoicedetail where issync=0",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									invoicedetail[i] = result.array[i];
								}

							}
							invoicedetail = JSON.stringify(invoicedetail);
//							alert(invoicedetail);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
// CUOC data to upload
function getcustomeroperationcontrol() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									customeroperationscontrol[i] = result[i];
								}

							}
							customeroperationscontrol = JSON
									.stringify(customeroperationscontrol);
							getroutemaster();

						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select visitkey,routekey,customercode,routecode,salesmancode,odometerreading,visitstartdate,visitstarttime,visitenddate,visitendtime,totaltransactions,addedcustomer,voidflag,scannerindicator,reasoncode,latitude,longitude,radius from customeroperationscontrol where issync=0" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select visitkey,routekey,customercode,routecode,salesmancode,odometerreading,visitstartdate,visitstarttime,visitenddate,visitendtime,totaltransactions,addedcustomer,voidflag,scannerindicator,reasoncode,latitude,longitude,radius from customeroperationscontrol where ifnull(issync, '') = '' or issync=0",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									customeroperationscontrol[i] = result.array[i];
								}

							}
							customeroperationscontrol = JSON
									.stringify(customeroperationscontrol);
//							alert(customeroperationscontrol);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}

// CUID data to upload
function getcustomerinventorydetail() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									customerinventorydetail[i] = result[i];
								}

							}
							customerinventorydetail = JSON
									.stringify(customerinventorydetail);
							getroutegoal1();

						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,visitkey,itemcode,weighted,qtyloc1case,catchweightqtyloc1,qtyloc1each,qtyloc2case,catchweightqtyloc2,qtyloc2each,qtyloc3case,catchweightqtyloc3,qtyloc3each,shelfstockcase,shelfstockcatchweightqty,shelfstockeach,oldestcode from customerinventorydetail where issync=0" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,visitkey,itemcode,weighted,qtyloc1case,catchweightqtyloc1,qtyloc1each,qtyloc2case,catchweightqtyloc2,qtyloc2each,qtyloc3case,catchweightqtyloc3,qtyloc3each,shelfstockcase,shelfstockcatchweightqty,shelfstockeach,oldestcode from customerinventorydetail where issync=0",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									customerinventorydetail[i] = result.array[i];
								}

							}
							customerinventorydetail = JSON
									.stringify(customerinventorydetail);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}

}

// CCDS data to upload
function getcashcheckdetail() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									cashcheckdetail[i] = result[i];
								}

							}
							cashcheckdetail = JSON.stringify(cashcheckdetail);
							getinvetorytransactionheader();

						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,visitkey,typecode,checknumber,amount,updateindicator,checkdate,bankcode,checkstatus,branchcode,drawercode,chequestatusindicator,sapchequestatusindicator,currencycode,hhctransactionkey,paymenttype,checktype,transactiontype from cashcheckdetail where issync=0 and istemp='false'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,visitkey,typecode,checknumber,amount,updateindicator,checkdate,bankcode,checkstatus,branchcode,drawercode,chequestatusindicator,sapchequestatusindicator,currencycode,hhctransactionkey,paymenttype,checktype,transactiontype from cashcheckdetail where issync=0 and istemp='false'",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									cashcheckdetail[i] = result.array[i];
								}

							}
							cashcheckdetail = JSON.stringify(cashcheckdetail);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}

// BAED data to upload
function getbatchexpirydetail() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									batchexpirydetail[i] = result[i];
								}

							}
							batchexpirydetail = JSON
									.stringify(batchexpirydetail);
							getarheader();
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,batchdetailkey,batchnumber,itemcode,expirydate,quantity,transactiontypecode,visitkey from batchexpirydetail where issync=0 and istemp='false'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,batchdetailkey,batchnumber,itemcode,expirydate,quantity,transactiontypecode,visitkey from batchexpirydetail where issync=0 and istemp='false'",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									batchexpirydetail[i] = result.array[i];
								}

							}
							batchexpirydetail = JSON
									.stringify(batchexpirydetail);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}

// ARHR data to upload
function getarheader() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									arheader[i] = result[i];
								}

							}
							arheader = JSON.stringify(arheader);
							getardetail();
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select transactionkey,routekey,visitkey,documentnumber,transactiondate,transactiontime,customercode,routecode,salesmancode,voidflag,splittransaction,transmitindicator,totalinvoiceamount,amountpaid,invoicebalance,invoicenumber,hhcdocumentnumber,hhcinvoicenumber,voidreasoncode,chequecollection,currencycode,hhctransactionkey,data,comments,advancepaymentflag,excesspayment,comments2 from arheader where issync=0" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select transactionkey,routekey,visitkey,documentnumber,transactiondate,transactiontime,customercode,routecode,salesmancode,voidflag,splittransaction,transmitindicator,totalinvoiceamount,amountpaid,invoicebalance,invoicenumber,hhcdocumentnumber,hhcinvoicenumber,voidreasoncode,chequecollection,currencycode,hhctransactionkey,data,comments,advancepaymentflag,excesspayment,comments2,deductionflag from arheader where issync=0",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									arheader[i] = result.array[i];
								}

							}

							arheader = JSON.stringify(arheader);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
// ARDL data to upload
function getardetail() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									ardetail[i] = result[i];
								}

							}
							ardetail = JSON.stringify(ardetail);
							getcashcheckdetail();
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,visitkey,transactionkey,invoicenumber,invoicedate,totalinvoiceamount,onacctreasoncode,amountpaid,invoicebalance,arcollectiontype,chequestatusindicator,sapchequestatusindicator,currencycode,pdcbalance,alternateinvoicenumber from ardetail where issync=0" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,visitkey,transactionkey,invoicenumber,invoicedate,totalinvoiceamount,onacctreasoncode,amountpaid,invoicebalance,arcollectiontype,chequestatusindicator,sapchequestatusindicator,currencycode,pdcbalance,alternateinvoicenumber,deductionamount from ardetail where issync=0",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									ardetail[i] = result.array[i];
								}

							}
							ardetail = JSON.stringify(ardetail);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}

// AORL data to upload
function get_t_access_override_log() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									t_access_override_log[i] = result[i];

								}

							}

							t_access_override_log = JSON
									.stringify(t_access_override_log);
							getenddaydetail();
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,visitkey,type,routecode,customercode,salesmancode,featureid,accesskey,accesstime,voidflag,validflag from t_access_override_log where issync=0" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,visitkey,type,routecode,customercode,salesmancode,featureid,accesskey,accesstime,voidflag,validflag from t_access_override_log where issync=0",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									t_access_override_log[i] = result.array[i];
								}

							}
							t_access_override_log = JSON
									.stringify(t_access_override_log);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
// get pos equipment details
function getposequipmentchangedetail() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									posequipmentchangedetail[i] = result[i];
								}

							}
							posequipmentchangedetail = JSON
									.stringify(posequipmentchangedetail);
							getposmaster();

						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,visitkey,posaction,itemcode,quantity,serialnumber,instructioncode from posequipmentchangedetail where issync=0" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,visitkey,posaction,itemcode,quantity,serialnumber,instructioncode from posequipmentchangedetail where issync=0",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									posequipmentchangedetail[i] = result.array[i];
								}

							}
							posequipmentchangedetail = JSON
									.stringify(posequipmentchangedetail);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}

// get pos master
function getposmaster() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									posmaster[i] = result[i];
								}

							}
							posmaster = JSON.stringify(posmaster);
							getsigcapturedata();

						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select itemcode,alternatecode,itemdescription,arbitemdescription,itemvalue,inventorytype,created,cdat,modified,mdat,activestatus from posmaster where issync=0" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select itemcode,alternatecode,itemdescription,arbitemdescription,itemvalue,inventorytype,created,cdat,modified,mdat,activestatus from posmaster where issync=0",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									posmaster[i] = result.array[i];
								}

							}
							posmaster = JSON.stringify(posmaster);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
// get Customer foc balance
function getcustomer_foc_balance() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									customer_foc_balance[i] = result[i];

								}

							}

							customer_foc_balance = JSON
									.stringify(customer_foc_balance);
							get_t_access_override_log();
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select customercode,itemcode,originalqty,balanceqty,contractid,startdate from customer_foc_balance where issync=0" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select customercode,itemcode,originalqty,balanceqty,contractid,startdate from customer_foc_balance where issync=0",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									customer_foc_balance[i] = result.array[i];
								}

							}
							customer_foc_balance = JSON
									.stringify(customer_foc_balance);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
// endday details
function getenddaydetail() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									enddaydetail[i] = result[i];

								}

							}

							enddaydetail = JSON.stringify(enddaydetail);

						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,detailtypecode,listtypecode,amount,currencycode from enddaydetail where issync=0" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select routekey,detailtypecode,listtypecode,amount,currencycode from enddaydetail where issync=0",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									enddaydetail[i] = result.array[i];
								}

							}
							enddaydetail = JSON.stringify(enddaydetail);
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}

function uploaddata() {
	console.log(routegoal);
	console.log(nosalesheader);
	var routecode = sessionStorage.getItem("RouteCode");
	var userid = sessionStorage.getItem("SalesmanCode");
	var deviceid = sessionStorage.getItem("DeviceID");
	var routekey = sessionStorage.getItem("RouteKey");

	if (routekey == '')
		routekey = 0;
	if (routeclosed == '' || routeclosed == undefined)
		routeclosed = 0;
	
	
//	alert(JSON.stringify(inventorytransactiondetail));
	

	$
			.ajax({
				type : "post",
				url : wsurl + "sync/senddata",
				cache : false,
				timeout : 60000,
				data : {
					invoicedetail : invoicedetail,
					invoiceheader : invoiceheader,
					invoicerxddetail : invoicerxddetail,
					promotiondetail : promotiondetail,
					customerinvoice : customerinvoice,
					salesorderheader : salesorderheader,
					salesorderdetail : salesorderdetail,
					batchexpirydetail : batchexpirydetail,
					arheader : arheader,
					ardetail : ardetail,
					cashcheckdetail : cashcheckdetail,
					inventorytransactionheader : invetorytransactionheader,
					inventorytransactiondetail : inventorytransactiondetail,
					inventorysummarydetail : inventorysummarydetail,
					nonservicedcustomer : nonservicedcustomer,
					surveyauditdetail : surveyauditdetail,
					posequipmentchangedetail : posequipmentchangedetail,
					posmaster : posmaster,
					sigcapturedata : sigcapturedata,
					customermaster : customermaster,
					customeroperationscontrol : customeroperationscontrol,
					routemaster : routemaster,
					customerinventorydetail : customerinventorydetail,
					routesequencecustomerstatus : routesequencecustomerstatus,
					routegoal : routegoal,
					nosalesheader : nosalesheader,
					routekey : routekey,
					routecode : routecode,
					routeclosed : routeclosed,
					userid : userid,
					customer_foc_balance : customer_foc_balance,
					enddaydetail : enddaydetail,
					t_access_override_log : t_access_override_log
				},

				success : function(data) {

					// alert(data);
					// console.log("data : " + data);
					data = JSON.parse(data);
//					alert(JSON.stringify(data));
					var invoicedetaildata = data.invoicedetail;
					var invoiceheaderdata = data.invoiceheader;
					var invoicerxddetaildata = data.invoicerxddetail;
					var promotiondetaildata = data.promotiondetail;
					var customerinvoicedata = data.customerinvoice;
					var salesorderdetaildata = data.salesorderdetail;
					var salesorderheaderdata = data.salesorderheader;
					var batchexpirydetaildata = data.batchexpirydetail;
					var arheaderdata = data.arheader;
					var ardetaildata = data.ardetail;
					var cashcheckdetaildata = data.cashcheckdetail;
					var invetorytransactionheaderdata = data.inventorytransactionheader;
					var inventorytransactiondetaildata = data.inventorytransactiondetail;
					var inventorysummarydetaildata = data.inventorysummarydetail;
					var nonservicedcustomerdata = data.nonservicedcustomer;
					var surveyauditdetaildata = data.surveyauditdetail;
					var posequipmentchangedetaildata = data.posequipmentchangedetail;
					var posmasterdata = data.posmaster;
					var sigcapturedata = data.sigcapturedata;
					var customermasterdata = data.customermaster;
					var customeroperationscontrol = data.customeroperationscontrol;
					var routemaster = data.routemaster;
					var customerinventorydetail = data.customerinventorydetail;
					var routesequencecustomerstatus = data.routesequencecustomerstatus;
					var nosalesheader = data.nosalesheader;
					var routegoal = data.routegoal;
					var customer_foc_balance = data.customer_foc_balance;
					var enddaydetail = data.enddaydetail;
					var t_access_override_log = data.t_access_override_log;

					if (invoicedetaildata != null
							&& invoicedetaildata.length > 0) {
						for (i = 0; i < invoicedetaildata.length; i++) {
							updateinvoicedetail(invoicedetaildata, i);
						}
					}
					if (invoiceheaderdata != null
							&& invoiceheaderdata.length > 0) {
						for (j = 0; j < invoiceheaderdata.length; j++) {
							updateinvoiceheader(invoiceheaderdata, j);
						}
					}
					if (invoicerxddetaildata != null
							&& invoicerxddetaildata.length > 0) {
						for (k = 0; k < invoicerxddetaildata.length; k++) {
							updateinvoicerxddetail(invoicerxddetaildata, k);
						}
					}

					if (promotiondetaildata != null
							&& promotiondetaildata.length > 0) {

						for (a = 0; a < promotiondetaildata.length; a++) {
							updatepromotiondetail(promotiondetaildata, a);
						}

					}
					if (customerinvoicedata != null
							&& customerinvoicedata.length > 0) {
						for (b = 0; b < customerinvoicedata.length; b++) {
							updatecustomerinvoice(customerinvoicedata, b);
						}
					}
					if (salesorderdetaildata != null
							&& salesorderdetaildata.length > 0) {
						for (c = 0; c < salesorderdetaildata.length; c++) {
							updatesalesorderdetail(salesorderdetaildata, c);
						}
					}

					if (salesorderheaderdata != null
							&& salesorderheaderdata.length > 0) {
						for (d = 0; d < salesorderheaderdata.length; d++) {
							updatesalesorderheader(salesorderheaderdata, d);
						}
					}
					if (batchexpirydetaildata != null
							&& batchexpirydetaildata.length > 0) {

						for (e = 0; e < batchexpirydetaildata.length; e++) {
							updatebatchexpirydetail(batchexpirydetaildata, e);
						}
					}
					if (arheaderdata != null && arheaderdata.length > 0) {
						for (f = 0; f < arheaderdata.length; f++) {
							updatearheader(arheaderdata, f);
						}
					}
					if (ardetaildata != null && ardetaildata.length > 0) {
						for (g = 0; g < ardetaildata.length; g++) {
							updateardetail(ardetaildata, g);
						}
					}
					if (cashcheckdetaildata != null
							&& cashcheckdetaildata.length > 0) {
						for (h = 0; h < cashcheckdetaildata.length; h++) {
							updatecashcheckdetail(cashcheckdetaildata, h);
						}
					}
					if (invetorytransactionheaderdata != null
							&& invetorytransactionheaderdata.length > 0) {
						for (k = 0; k < invetorytransactionheaderdata.length; k++) {
							updateinvetorytransactionheader(
									invetorytransactionheaderdata, k);
						}
					}
					if (inventorytransactiondetaildata != null
							&& inventorytransactiondetaildata.length > 0) {
						for (l = 0; l < inventorytransactiondetaildata.length; l++) {
							updateinventorytransactiondetail(
									inventorytransactiondetaildata, l);
						}
					}
					if (inventorysummarydetaildata != null
							&& inventorysummarydetaildata.length > 0) {
						for (m = 0; m < inventorysummarydetaildata.length; m++) {
							updateinventorysummarydetail(
									inventorysummarydetaildata, m);
						}
					}
					if (nonservicedcustomerdata != null
							&& nonservicedcustomerdata.length > 0) {
						for (n = 0; n < nonservicedcustomerdata.length; n++) {
							updatenonservicedcustomerdata(
									nonservicedcustomerdata, n);
						}
					}
					if (surveyauditdetaildata != null
							&& surveyauditdetaildata.length > 0) {
						for (o = 0; o < surveyauditdetaildata.length; o++) {
							updatesurveyauditdetail(surveyauditdetaildata, o);
						}
					}
					if (posequipmentchangedetaildata != null
							&& posequipmentchangedetaildata.length > 0) {
						for (p = 0; p < posequipmentchangedetaildata.length; p++) {
							updateposequipmentchangedetail(
									posequipmentchangedetaildata, p);
						}
					}
					if (posmasterdata != null && posmasterdata.length > 0) {
						for (q = 0; q < posmasterdata.length; q++) {
							updateposmaster(posmasterdata, q);
						}
					}
					if (sigcapturedata != null && sigcapturedata.length > 0) {
						for (r = 0; r < sigcapturedata.length; r++) {
							updatesigcapturedata(sigcapturedata, r);
						}
					}
					if (customermasterdata != null
							&& customermasterdata.length > 0) {
						for (s = 0; s < customermasterdata.length; s++) {
							updatecustomermaster(customermasterdata, s);
						}
					}
					if (customeroperationscontrol != null
							&& customeroperationscontrol.length > 0) {
						for (t = 0; t < customeroperationscontrol.length; t++) {
							updatecustomeroperationscontrol(
									customeroperationscontrol, t);
						}
					}
					if (customerinventorydetail != null
							&& customerinventorydetail.length > 0) {
						for (i = 0; i < customerinventorydetail.length; i++) {
							updatecustomerinventorydetail(
									customerinventorydetail, i);
						}
					}
					if (routesequencecustomerstatus != null
							&& routesequencecustomerstatus.length > 0) {
						for (i = 0; i < routesequencecustomerstatus.length; i++) {
							updateroutesequencecustomerstatus(
									routesequencecustomerstatus, i);
						}
					}
					if (routegoal != null && routegoal.length > 0) {
						for (i = 0; i < routegoal.length; i++) {
							updateroutegoal(routegoal, i);
						}
					}
					if (nosalesheader != null && nosalesheader.length > 0) {
						for (i = 0; i < nosalesheader.length; i++) {
							updatenosalesheader(nosalesheader, i);
						}
					}
					if (customer_foc_balance != null
							&& customer_foc_balance.length > 0) {
						for (j = 0; j < customer_foc_balance.length; j++) {
							updatecustomer_foc_balance(customer_foc_balance, j);
						}
					}
					if (enddaydetail != null && enddaydetail.length > 0) {
						for (k = 0; k < enddaydetail.length; k++) {
							updateenddaydetail(enddaydetail, k);
						}
					}
					if (t_access_override_log != null
							&& t_access_override_log.length > 0) {
						for (l = 0; l < t_access_override_log.length; l++) {
							updatt_access_override_log(t_access_override_log, l);
						}
					}
					$.mobile.hidePageLoadingMsg();
					refreshAudit(false);
					navigator.notification.alert("Data Sent Successfully.");

				},
				error : function(qXHR, textStatus, errorThrown) {
					$.mobile.hidePageLoadingMsg();
					refreshAudit(true);
					navigator.notification
							.alert("Connection Error! Acknowledgement Not Received.");

				}
			});

}

// -------
function updateinvoicedetail(invoicedetaildata, i) {

	console.log("update invoicedetail set issync=1 where routekey='"
			+ invoicedetaildata[i].routekey + "' and visitkey='"
			+ invoicedetaildata[i].visitkey + "' and itemcode="
			+ invoicedetaildata[i].itemcode);
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update invoicedetail set issync=1 where routekey='"
						+ invoicedetaildata[i].routekey + "' and visitkey='"
						+ invoicedetaildata[i].visitkey + "' and itemcode="
						+ invoicedetaildata[i].itemcode ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update invoicedetail set issync=1 where routekey='"
						+ invoicedetaildata[i].routekey + "' and visitkey='"
						+ invoicedetaildata[i].visitkey + "' and itemcode="
						+ invoicedetaildata[i].itemcode, function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updateinvoiceheader(invoiceheaderdata, i) {
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update invoiceheader set issync=1 where routekey='"
						+ invoiceheaderdata[i].routekey + "' and visitkey='"
						+ invoiceheaderdata[i].visitkey + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update invoiceheader set issync=1 where routekey='"
						+ invoiceheaderdata[i].routekey + "' and visitkey='"
						+ invoiceheaderdata[i].visitkey + "'",
				function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updateinvoicerxddetail(invoicerxddetaildata, i) {
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update invoicerxddetail set issync=1 where routekey='"
						+ invoicerxddetaildata[i].routekey + "' and visitkey='"
						+ invoicerxddetaildata[i].visitkey + "' and itemcode='"
						+ invoicerxddetaildata[i].itemcode + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update invoicerxddetail set issync=1 where routekey='"
						+ invoicerxddetaildata[i].routekey + "' and visitkey='"
						+ invoicerxddetaildata[i].visitkey + "' and itemcode='"
						+ invoicerxddetaildata[i].itemcode + "'", function(
						result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}

function updatepromotiondetail(promotiondetaildata, i) {
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update promotiondetail set issync=1 where routekey='"
						+ promotiondetaildata[i].routekey + "' and visitkey='"
						+ promotiondetaildata[i].visitkey + "' and itemcode='"
						+ promotiondetaildata[i].itemcode + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update promotiondetail set issync=1 where routekey='"
						+ promotiondetaildata[i].routekey + "' and visitkey='"
						+ promotiondetaildata[i].visitkey + "' and itemcode='"
						+ promotiondetaildata[i].itemcode + "'", function(
						result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updatecustomerinvoice(customerinvoicedata, i) {
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update customerinvoice set issync=1 where transactionkey='"
						+ customerinvoicedata[i].transactionkey + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update customerinvoice set issync=1 where transactionkey='"
						+ customerinvoicedata[i].transactionkey + "'",
				function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updatesalesorderdetail(salesorderdetaildata, i) {
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update salesorderdetail set issync=1 where routekey='"
						+ salesorderdetaildata[i].routekey + "' and visitkey='"
						+ salesorderdetaildata[i].visitkey + "' and itemcode='"
						+ salesorderdetaildata[i].itemcode + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update salesorderdetail set issync=1 where routekey='"
						+ salesorderdetaildata[i].routekey + "' and visitkey='"
						+ salesorderdetaildata[i].visitkey + "' and itemcode='"
						+ salesorderdetaildata[i].itemcode + "'", function(
						result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updatesalesorderheader(salesorderheaderdata, i) {
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update salesorderheader set issync=1 where routekey='"
						+ salesorderheaderdata[i].routekey + "' and visitkey='"
						+ salesorderheaderdata[i].visitkey + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update salesorderheader set issync=1 where routekey='"
						+ salesorderheaderdata[i].routekey + "' and visitkey='"
						+ salesorderheaderdata[i].visitkey + "'", function(
						result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updatebatchexpirydetail(batchdetaildata, i) {
	console.log("update batchexpirydetail set issync=1 where routekey='"
			+ batchdetaildata[i].routekey + "' and visitkey='"
			+ batchdetaildata[i].visitkey + "' and batchdetailkey='"
			+ batchdetaildata[i].batchdetailkey + "'");
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update batchexpirydetail set issync=1 where routekey='"
						+ batchdetaildata[i].routekey + "' and visitkey='"
						+ batchdetaildata[i].visitkey
						+ "' and batchdetailkey='"
						+ batchdetaildata[i].batchdetailkey + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update batchexpirydetail set issync=1 where routekey='"
						+ batchdetaildata[i].routekey + "' and visitkey='"
						+ batchdetaildata[i].visitkey
						+ "' and batchdetailkey='"
						+ batchdetaildata[i].batchdetailkey + "'", function(
						result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updatearheader(arheaderdata, i) {
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update arheader set issync=1 where routekey='"
						+ arheaderdata[i].routekey + "' and visitkey='"
						+ arheaderdata[i].visitkey + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update arheader set issync=1 where routekey='"
						+ arheaderdata[i].routekey + "' and visitkey='"
						+ arheaderdata[i].visitkey + "'", function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updateardetail(ardetaildata, i) {
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update ardetail set issync=1 where routekey='"
						+ ardetaildata[i].routekey + "' and visitkey='"
						+ ardetaildata[i].visitkey + "' and transactionkey='"
						+ ardetaildata[i].transactionkey + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update ardetail set issync=1 where routekey='"
						+ ardetaildata[i].routekey + "' and visitkey='"
						+ ardetaildata[i].visitkey + "' and transactionkey='"
						+ ardetaildata[i].transactionkey + "'",
				function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updatecashcheckdetail(cashcheckdetaildata, i) {
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update cashcheckdetail set issync=1 where routekey='"
						+ cashcheckdetaildata[i].routekey + "' and visitkey='"
						+ cashcheckdetaildata[i].visitkey + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update cashcheckdetail set issync=1 where routekey='"
						+ cashcheckdetaildata[i].routekey + "' and visitkey='"
						+ cashcheckdetaildata[i].visitkey + "'", function(
						result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updateinvetorytransactionheader(invetorytransactionheaderdata, i) {
	if (platform == 'iPad') {
		return abc = Cordova
				.exec(
						function(result) {
							// alert(result);
							return true;
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"InsertUpdateMethod",
						[ "update inventorytransactionheader set issync=1 where routekey='"
								+ invetorytransactionheaderdata[i].routekey
								+ "' and detailkey='"
								+ invetorytransactionheaderdata[i].detailkey
								+ "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update inventorytransactionheader set issync=1 where routekey='"
						+ invetorytransactionheaderdata[i].routekey
						+ "' and detailkey='"
						+ invetorytransactionheaderdata[i].detailkey + "'",
				function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updateinventorytransactiondetail(inventorytransactiondetaildata, i) {
	if (platform == 'iPad') {
		return abc = Cordova
				.exec(
						function(result) {
							// alert(result);
							return true;
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"InsertUpdateMethod",
						[ "update inventorytransactiondetail set issync=1 where routekey='"
								+ inventorytransactiondetaildata[i].routekey
								+ "' and detailkey='"
								+ inventorytransactiondetaildata[i].detailkey
								+ "' and itemcode='"
								+ inventorytransactiondetaildata[i].itemcode
								+ "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update inventorytransactiondetail set issync=1 where routekey='"
						+ inventorytransactiondetaildata[i].routekey
						+ "' and detailkey='"
						+ inventorytransactiondetaildata[i].detailkey
						+ "' and itemcode='"
						+ inventorytransactiondetaildata[i].itemcode + "'",
				function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updateinventorysummarydetail(inventorysummarydetaildata, i) {
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update inventorysummarydetail set issync=1 where routekey='"
						+ inventorysummarydetaildata[i].routekey
						+ "' and itemcode='"
						+ inventorysummarydetaildata[i].itemcode
						+ "' and inventorykey='"
						+ inventorysummarydetaildata[i].inventorykey + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update inventorysummarydetail set issync=1 where routekey='"
						+ inventorysummarydetaildata[i].routekey
						+ "' and itemcode='"
						+ inventorysummarydetaildata[i].itemcode
						+ "' and inventorykey='"
						+ inventorysummarydetaildata[i].inventorykey + "'",
				function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updatenonservicedcustomerdata(nonservicedcustomerdata, i) {
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update nonservicedcustomer set issync=1 where routekey='"
						+ nonservicedcustomerdata[i].routekey
						+ "' and customercode='"
						+ nonservicedcustomerdata[i].customercode + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update nonservicedcustomer set issync=1 where routekey='"
						+ nonservicedcustomerdata[i].routekey
						+ "' and customercode='"
						+ nonservicedcustomerdata[i].customercode + "'",
				function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updatesurveyauditdetail(surveyauditdetaildata, i) {
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update surveyauditdetail set issync=1 where routekey='"
						+ surveyauditdetaildata[i].routekey
						+ "' and visitkey='"
						+ surveyauditdetaildata[i].visitkey
						+ "' and surveydefkey='"
						+ surveyauditdetaildata[i].surveydefkey + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update surveyauditdetail set issync=1 where routekey='"
						+ surveyauditdetaildata[i].routekey
						+ "' and visitkey='"
						+ surveyauditdetaildata[i].visitkey
						+ "' and surveydefkey='"
						+ surveyauditdetaildata[i].surveydefkey + "'",
				function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updateposequipmentchangedetail(posequipmentchangedetaildata, p) {
	if (platform == 'iPad') {
		return abc = Cordova
				.exec(
						function(result) {
							// alert(result);
							return true;
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"InsertUpdateMethod",
						[ "update posequipmentchangedetail set issync=1 where routekey='"
								+ posequipmentchangedetaildata[i].routekey
								+ "' and visitkey='"
								+ posequipmentchangedetaildata[i].visitkey
								+ "' and itemcode='"
								+ posequipmentchangedetaildata[i].itemcode
								+ "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update posequipmentchangedetail set issync=1 where routekey='"
						+ posequipmentchangedetaildata[i].routekey
						+ "' and visitkey='"
						+ posequipmentchangedetaildata[i].visitkey
						+ "' and itemcode='"
						+ posequipmentchangedetaildata[i].itemcode + "'",
				function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updateposmaster(posmasterdata, i) {
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update posmaster set issync=1 where itemcode='"
						+ posmasterdata[i].itemcode + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update posmaster set issync=1 where itemcode='"
						+ posmasterdata[i].itemcode + "'", function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updatesigcapturedata(sigcapturedata, i) {
	if (platform == 'iPad') {
		return abc = Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update sigcapturedata set issync=1 where transactionkey='"
						+ sigcapturedata[i].transactionkey + "' and routekey='"
						+ sigcapturedata[i].routekey + "' and visitkey='"
						+ sigcapturedata[i].visitkey + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update sigcapturedata set issync=1 where transactionkey='"
						+ sigcapturedata[i].transactionkey + "' and routekey='"
						+ sigcapturedata[i].routekey + "' and visitkey='"
						+ sigcapturedata[i].visitkey + "'", function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updatecustomermaster(customermasterdata, i) {
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update customermaster set issync=1 where customercode='"
						+ customermasterdata[i].customercode + "'" ]);
	} else if (platform == 'Android') {
		console.log("customermaster update");
		console.log("update customermaster set issync=1 where customercode='"
				+ customermasterdata[i].customercode + "'");
		window.plugins.DataBaseHelper.insert(
				"update customermaster set issync=1 where customercode='"
						+ customermasterdata[i].customercode + "'", function(
						result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updatecustomeroperationscontrol(customeroperationscontrol, i) {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							// alert(result);
							return true;
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"InsertUpdateMethod",
						[ "update customeroperationscontrol set issync=1 where visitkey='"
								+ customeroperationscontrol[i].visitkey
								+ "' and routekey='"
								+ customeroperationscontrol[i].routekey + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update customeroperationscontrol set issync=1 where visitkey='"
						+ customeroperationscontrol[i].visitkey
						+ "' and routekey='"
						+ customeroperationscontrol[i].routekey + "'",
				function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updatecustomerinventorydetail(customerinventorydetail, i) {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							// alert(result);
							return true;
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"InsertUpdateMethod",
						[ "update customerinventorydetail set issync=1 where visitkey='"
								+ customerinventorydetail[i].visitkey
								+ "' and routekey='"
								+ customerinventorydetail[i].routekey
								+ "' and itemcode='"
								+ customerinventorydetail[i].itemcode + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update customerinventorydetail set issync=1 where visitkey='"
						+ customerinventorydetail[i].visitkey
						+ "' and routekey='"
						+ customerinventorydetail[i].routekey
						+ "' and itemcode='"
						+ customerinventorydetail[i].itemcode + "'", function(
						result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updateroutesequencecustomerstatus(routesequencecustomerstatus, i) {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							// alert(result);
							return true;
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"InsertUpdateMethod",
						[ "update routesequencecustomerstatus set issync=1 where customercode='"
								+ routesequencecustomerstatus[i].customercode
								+ "' and routekey='"
								+ routesequencecustomerstatus[i].routekey + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update routesequencecustomerstatus set issync=1 where customercode='"
						+ routesequencecustomerstatus[i].customercode
						+ "' and routekey='"
						+ routesequencecustomerstatus[i].routekey + "'",
				function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updateroutegoal(routegoal, i) {
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update routegoal set issync=1 where primary_key='"
						+ routegoal[i].primary_key + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update routegoal set issync=1 where primary_key='"
						+ routegoal[i].primary_key + "'", function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updatenosalesheader(nosalesheader, i) {
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update nosalesheader set issync=1 where transactionkey='"
						+ nosalesheader[i].transactionkey + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update nosalesheader set issync=1 where transactionkey='"
						+ nosalesheader[i].transactionkey + "'", function(
						result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updatecustomer_foc_balance(customer_foc_balance, i) {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							// alert(result);
							return true;
						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"InsertUpdateMethod",
						[ "update customer_foc_balance set issync=1 where customercode='"
								+ customer_foc_balance[i].customercode
								+ "' and itemcode="
								+ customer_foc_balance[i].itemcode ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update customer_foc_balance set issync=1 where customercode='"
						+ customer_foc_balance[i].customercode
						+ "' and itemcode=" + customer_foc_balance[i].itemcode,
				function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updateenddaydetail(enddaydata, i) {
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update enddaydetail set issync=1 where routekey='"
						+ enddaydata[i].routekey + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update enddaydetail set issync=1 where routekey='"
						+ enddaydata[i].routekey + "'", function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function updatt_access_override_log(logdata, i) {
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod",
				[ "update t_access_override_log set issync=1 where routekey='"
						+ logdata[i].routekey + "' and visitkey='"
						+ logdata[i].visitkey + "' and featureid='"
						+ logdata[i].featureid + "'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(
				"update t_access_override_log set issync=1 where routekey='"
						+ logdata[i].routekey + "' and visitkey='"
						+ logdata[i].visitkey + "' and featureid='"
						+ logdata[i].featureid + "'", function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
