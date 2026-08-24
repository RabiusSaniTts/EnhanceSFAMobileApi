//Function is used for load specify xml file

var platform = sessionStorage.getItem("platform");
var invoicedetail = {};
var invoiceheader = {};
var invoicerxddetail = {};
var promotiondetail = {};
var customerinvoice = {};
var salesorderdetail = {};      
var salesorderheader = {};
var batchdetail = {};
var arheader = {};
var ardetail = {};
var cashcheckdetail = {};
var inventorytransactionheader = {};
var inventorytransactiondetail = {};
var inventorysummarydetail = {};
var nonservicedcustomer = {};
var surveyauditdetail = {};
var posequipmentchangedetail = {};
var posmaster = {};
var sigcapturedata={};
var customerinventorydetail={};
var customeroperationscontrol={};
var routesequencecustomerstatus={};
var routemaster={};
var routegoal={};
var customermaster={};
var customer_foc_balance={};
var routekey = "";
var transactionkey = "";
var visitkey = "";
// var clrlog='';
function sendmanualdata(rkey, tkey, vkey, flag) {

	routekey = rkey;
	visitkey = vkey;
	transactionkey = tkey;
	alert(routekey);
	alert(visitkey);
	alert(transactionkey);
	$.mobile.showPageLoadingMsg();
	invoicedetail = {};
	invoiceheader = {};
	invoicerxddetail = {};
	promotiondetail = {};
	invoicedetail={};
    invoiceheader={};
    invoicerxddetail={};
    promotiondetail={};
    customerinvoice={};
    salesorderdetail={};
    salesorderheader={};
    batchexpirydetail={};
   arheader={};
    ardetail={};
    cashcheckdetail={};
    invetorytransactionheader={};
    inventorytransactiondetail={};
    inventorysummarydetail={};
    nonservicedcustomer={};
    surveyauditdetail={};
    posequipmentchangedetail={};
    posmaster={};
    sigcapturedata={};
    customermaster={};
    customeroperationscontrol={};
    routemaster={};
   routesequencecustomerstatus={};
     customerinventorydetail={};
    routegoal={};
    nosalesheader={};
    customer_foc_balance={};
    enddaydetail={};
	$.mobile.showPageLoadingMsg();
	if(flag=='1')
	{
	alert("sss");
    getinvoicedetail();
	}

}
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

		alert("Routekey" + routekey);
		alert("transaction" + transactionkey);
		window.plugins.DataBaseHelper
				.select(
						"select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,salesprice,returnprice,stdsalesprice,stdreturnprice,promoqty,salesitemexcisetax,salesitemgsttax,returnitemexcisetax,returnitemgsttax,damageditemexcisetax,damageditemgsttax,fgitemexcisetax,fgitemgsttax,promoitemexcisetax,promoitemgsttax,coopid,batchdetailkey,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,goodreturnprice,goodreturncaseprice,stdgoodreturncaseprice,stdgoodreturnprice,expiryqty,currencycode,returnfreeqty,manualfreeqty,limitedfreeqty,rebaterentqty,fixedrentqty,pricechgindicator,discountamount,discountpercentage,promoamount,replacementqty,replacementprice,replacementcaseprice,promovalue,mdat,returnpromovalue,returnpromoamount,amount,diffround,roundsalesamount from invoicedetail where issync=0 and istemp='false' and routekey in ("
								+ routekey
								+ ") and transactionkey in ("
								+ transactionkey + ")", function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									invoicedetail[i] = result.array[i];
								}

							}
							invoicedetail = JSON.stringify(invoicedetail);
							alert("invoice Detail"
									+ JSON.stringify(invoicedetail));
							getinvoiceheader();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}

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
							getinvoicerxddetail();
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
						"select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,salesmancode,presoldordernumber,presalesmancode,presalesroutecode,orderdeliverydate,orderdeliveryroutecode,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,totalfreesampleamount,immediatepaid,amountpaid,invoicebalance,dexflag,dexg86signature,paymenttype,splittransaction,voidflag,transmitindicator,paymentstatus,hhcinvoicenumber,totalpromoamount,gcpaymenttype,hhcdocumentnumber,inventorykey,totaltaxesamount,itemlinetaxamount,totaldiscountamount,voidreasoncode,totalexpiryamount,currencycode,totalmanualfree,totallimitedfree,totalrebaterent,totalfixedrent,actualtransactiondate,boentry,hhctransactionkey,data,comments,totaldiscdistributionamount,totalreplacementamount,comments2,totalbuybackfreeamount,diffround,roundtotalsalesamount from invoiceheader where issync=0 and istemp='false' and transactionkey in ("
								+ transactionkey + ")", function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									invoiceheader[i] = result.array[i];
								}

							}
							invoiceheader = JSON.stringify(invoiceheader);
							alert("Invoice data" + invoiceheader);
							getinvoicerxddetail();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
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
						"select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,itemtranstypeseq,reasoncode,quantity,catchweightqty,weighted,instructioncode,currencycode from invoicerxddetail where issync=0 and istemp='false' and routekey in ("
								+ routekey
								+ ") and transactionkey in ("
								+ transactionkey + ")",
						function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									invoicerxddetail[i] = result.array[i];
								}

							}
							invoicerxddetail = JSON.stringify(invoicerxddetail);
							alert("Invoice data" + invoicerxddetail);

							getpromotiondetail();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
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
						"select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,promotiontypecode,promotionamount,promotionquantity,catchweightqty,weighted,promotionplannumber,assignmentkey,exclusionoption,promochgindicator,oldpromotionamount,performindicator,performcriteriakey,promotioncaseprice,currencycode from promotiondetail where issync=0 and istemp='false' and routekey in ("
								+ routekey
								+ ") and transactionkey in ("
								+ transactionkey + ")", function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									promotiondetail[i] = result.array[i];
								}

							}
							promotiondetail = JSON.stringify(promotiondetail);
							alert("Invoice data" + promotiondetail);
							// getcustomerinvoice();
							uploaddata();
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
function uploaddata() {
	var routecode = sessionStorage.getItem("RouteCode");
	var userid = sessionStorage.getItem("SalesmanCode");
	var deviceid = sessionStorage.getItem("DeviceID");
	 var routecode= sessionStorage.getItem("RouteCode");
    var userid= sessionStorage.getItem("SalesmanCode");
    var deviceid= sessionStorage.getItem("DeviceID");
    var routekey=sessionStorage.getItem("RouteKey");
  
    if(routekey=='')
    routekey=0;
    if(routeclosed=='' || routeclosed==undefined)
    routeclosed=0;
	
	//window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail1);
	
	alert("Invoice Detail in Upload"+JSON.stringify({ invoicedetail: invoicedetail, invoiceheader: invoiceheader, invoicerxddetail: invoicerxddetail, promotiondetail: promotiondetail, customerinvoice: customerinvoice, salesorderheader: salesorderheader, salesorderdetail: salesorderdetail, batchexpirydetail: batchdetail, arheader: arheader, ardetail: ardetail, cashcheckdetail: cashcheckdetail, inventorytransactionheader: inventorytransactionheader, inventorytransactiondetail: inventorytransactiondetail, inventorysummarydetail: inventorysummarydetail, nonservicedcustomer: nonservicedcustomer, surveyauditdetail: surveyauditdetail, posequipmentchangedetail: posequipmentchangedetail, posmaster: posmaster,sigcapturedata:sigcapturedata,customerinventorydetail:customerinventorydetail,customeroperationscontrol:customeroperationscontrol,routesequencecustomerstatus:routesequencecustomerstatus,routemaster:routemaster,routegoal:routegoal,customermaster:customermaster,nosalesheader:nosalesheader,customer_foc_balance:customer_foc_balance }));
	
	
	 $.ajax({
	        type: "post",
	        url: wsurl + "sync/senddata",
	        cache: false,
	        timeout:60000,
	        data: { invoicedetail: invoicedetail, invoiceheader: invoiceheader, invoicerxddetail: invoicerxddetail, promotiondetail: promotiondetail, customerinvoice: customerinvoice, salesorderheader: salesorderheader, salesorderdetail: salesorderdetail, batchexpirydetail: batchdetail, arheader: arheader, ardetail: ardetail, cashcheckdetail: cashcheckdetail, inventorytransactionheader: inventorytransactionheader, inventorytransactiondetail: inventorytransactiondetail, inventorysummarydetail: inventorysummarydetail, nonservicedcustomer: nonservicedcustomer, surveyauditdetail: surveyauditdetail, posequipmentchangedetail: posequipmentchangedetail, posmaster: posmaster,sigcapturedata:sigcapturedata,customerinventorydetail:customerinventorydetail,customeroperationscontrol:customeroperationscontrol,routesequencecustomerstatus:routesequencecustomerstatus,routemaster:routemaster,routegoal:routegoal,customermaster:customermaster,nosalesheader:nosalesheader,customer_foc_balance:customer_foc_balance},
	        success : function(data) {

					// alert(data);
					// console.log("data : " + data);
					data = JSON.parse(data);
					alert("Server Dara" + JSON.stringify(data));
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
                   var invetorytransactionheaderdata= data.inventorytransactionheader;
                   var inventorytransactiondetaildata = data.inventorytransactiondetail;
                   var inventorysummarydetaildata = data.inventorysummarydetail;
                   var nonservicedcustomerdata = data.nonservicedcustomer;
                   var surveyauditdetaildata = data.surveyauditdetail;
                   var posequipmentchangedetaildata = data.posequipmentchangedetail;
                   var posmasterdata = data.posmaster;
                   var sigcapturedata = data.sigcapturedata;
                   var customermasterdata = data.customermaster;
                   var customeroperationscontrol=data.customeroperationscontrol;
                   var routemaster=data.routemaster;
                       var customerinventorydetail=data.customerinventorydetail;
                       var routesequencecustomerstatus=data.routesequencecustomerstatus;
                       var nosalesheader=data.nosalesheader;
                       var routegoal=data.routegoal;
                   var customer_foc_balance=data.customer_foc_balance;
                   var enddaydetail = data.enddaydetail;
                   var t_access_override_log = data.t_access_override_log;  
					
					for (i = 0; i < invoicedetaildata.length; i++) {
						updateinvoicedetail(invoicedetaildata, i);
					}
					for (j = 0; j < invoiceheaderdata.length; j++) {
						updateinvoiceheader(invoiceheaderdata, j);
					}
					for (k = 0; k < invoicerxddetaildata.length; k++) {
						updateinvoicerxddetail(invoicerxddetaildata, k);
					}
					for (a = 0; a < promotiondetaildata.length; a++) {
						updatepromotiondetail(promotiondetaildata, a);
					}
					$.mobile.hidePageLoadingMsg();

					navigator.notification.alert("Data Sent Successfully.");

					
				},
				error : function(qXHR, textStatus, errorThrown) {
					$.mobile.hidePageLoadingMsg();
					navigator.notification
							.alert("Connection Error! Acknowledgement Not Received.");

					
					
				}
			});

}
// ---------Data field set
function SaveEndDay() {
	var Qry = "UPDATE startendday SET data = 1 WHERE routekey = "
			+ sessionStorage.getItem("RouteKey");
	console.log(Qry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {

		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod", [ Qry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(Qry, function(result) {
			copy();
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

// -------------------------
//
function copy() {
	$.mobile.showPageLoadingMsg();
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {

							if (result[0][0] != 0) {

								$('#lblupload11').addClass('MenuGray');
								$('#imgupload1').attr('src',
										'../images/upload-data-grey.png');
								$('#linkupload1').attr('href', '');

							}

							// addbatchdata();
						},
						function(error) {
							alert("Error in getting Password : " + error);
						},
						"PluginClass",
						"GetdataMethod",
						[ "select max(routekey) routekey from startendday where routecode = '"
								+ sessionStorage.getItem('RouteCode')
								+ "' and salesmancode = '"
								+ sessionStorage.getItem('SalesmanCode')
								+ "' and routeclosed=0" ]);
	} else if (platform == 'Android') {
		var routecode = sessionStorage.getItem('RouteCode');
		var routekey = sessionStorage.getItem('RouteKey');
		var paramval = routekey + "_" + routecode;
		// window.plugins.DataBaseHelper.copy2SdCard("",function(result)
		window.plugins.DataBaseHelper.copy2SdCard(paramval, function(result) {

			sessionStorage.clear();
			localStorage.clear();
			window.location = "./index.html";
		}, function() {

			navigator.notification.alert("Archive Failed,Try Again");
			sessionStorage.clear();
			localStorage.clear();
			window.location = "../index.html";
			console.warn("Error calling plugin");
		});
	}
}
// ----

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