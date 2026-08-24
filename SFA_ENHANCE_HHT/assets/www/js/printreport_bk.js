var platform = sessionStorage.getItem("platform");
var data = {};
var customercode = "";
var customername = "";
var customeraddress = "";
var paymenttype = "";
var invoicenumber = "";
var documentnumber = "";
var totalpromoamount = 0;
var customerOutlet=0;
var totalinvoiceamount = 0;
var itempromoamount = 0;
var loadperiodnumber = 0;
var comments = "";
var decimalplace = sessionStorage.getItem("decimalplace");
if (decimalplace == '' || decimalplace == 0)
	getdecimal();
var printstatus = 0;
var invheadermsg = "";
var invtrailormsg = "";
var excesspayment = "";
var netinvalue = 0;
var netoutvalue = 0;
var tcamount = 0;
var invoicepaymentterms = "";
var tranferflag = 0;
var ReportName = new Object();
ReportName.OpeningLoad = "LoadSummary";
ReportName.LoadReport = "LoadSummary2";
ReportName.LoadTransfer = "Transfer_In";
ReportName.EndInventory = "EndInventory";
ReportName.Sales = "Sales";
ReportName.Collection = "Collection";
ReportName.Deposit = "Deposit";
ReportName.SalesReport = "SalesReport";
ReportName.SalesReport = "RouteActivity";
ReportName.VanStock = "VanStock";
ReportName.LoadRequst = "LoadRequst";

var printval = sessionStorage.getItem("printerval");
if (printval == '' || printval == 0)
	getdecimal();
function getdecimal() {
	platform = sessionStorage.getItem("platform");
	var qry = "SELECT currencymaster.decimalplaces,routemaster.routeprinter FROM routemaster INNER JOIN currencymaster ON routemaster.amountdecimaldigits = currencymaster.currencycode WHERE routemaster.routecode = "
			+ sessionStorage.getItem("RouteCode");

	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result.length > 0) {
				decimalplace = result[0][0];
				printerval = result[0][1];
				sessionStorage.setItem("decimalplace", result[0][0]);
				sessionStorage.setItem("printerval", result[0][1]);// ADded for
																	// printer
																	// value by
																	// mirnah

			} else {
				decimalplace = 0;
				printerval = 0;
				sessionStorage.setItem("decimalplace", 0);
				sessionStorage.setItem("printerval", 0);// ADded for printer
														// value by mirnah
			}
		}, function(error) {
			alert("Error in getting setup : " + error);
		}, "PluginClass", "GetdataMethod", [ qry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(qry, function(result) {

			if (result.array != undefined) {
				decimalplace = result.array[0].decimalplaces;
				printerval = result.array[0].routeprinter;
				sessionStorage.setItem("decimalplace",
						result.array[0].decimalplaces);
				sessionStorage.setItem("printerval",
						result.array[0].routeprinter);// ADded for printer
														// value by mirnah
			} else {
				decimalplace = 0;
				printerval = 0;
				sessionStorage.setItem("decimalplace", 0);
				sessionStorage.setItem("printerval", 0);// ADded for printer
														// value by mirnah
			}
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}
function getLoadInfo() {
	var Qry = "SELECT documentnumber,printstatus FROM inventorytransactionheader WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 1 AND istemp = 'false')";
	console.log(Qry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result.length > 0) {
				documentnumber = parseInt(eval(result[0][0]));
				printstatus = result[0][1];
			}
			PrintLoad();
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				documentnumber = parseInt(result.array[0].documentnumber);
				printstatus = result.array[0].printstatus;
			}
			PrintLoad();
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function PrintLoad() {
	loadperiodnumber = localStorage.getItem("LoadPeriod");
	var Qry = ""
	Printvalue()
	/*
	 * if(loadperiodnumber.toString() == "1") { //Print Load 1 With Opening
	 * Stock And Adjust Qty PrintOpeningLoad(); } else { PrintCurrentLoad(); }
	 */
}
//
function Printvalue() {
	// alert("tst");
	// var QryInv = "SELECT loadnumber,documentnumber,printstatus FROM
	// inventorytransactionheader WHERE hhcdocumentnumber=" + invoicenumber;
	//var QryInv = "SELECT DISTINCT CASE WHEN '"
		//	+ sessionStorage.getItem("CheckCode")
			//+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',CAST((((IFNULL(beginstockqty/im.unitspercase, 0)) * im.caseprice) + (IFNULL(beginstockqty % im.unitspercase, 0) * im.defaultsalesprice)) AS INT )as openingvalue,CAST((((IFNULL(loadqty/im.unitspercase, 0)) * im.caseprice) + (IFNULL(loadqty % im.unitspercase, 0) * im.defaultsalesprice)) AS INT )as loadvalue,CAST((((IFNULL(loadadjustqty/im.unitspercase, 0)) * im.caseprice) + (IFNULL(loadadjustqty % im.unitspercase, 0) * im.defaultsalesprice)) AS INT )as adjustqtyvalue,CAST(((CAST((IFNULL((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))/im.unitspercase, 0)) AS INT) * im.caseprice) + (IFNULL((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0)) % im.unitspercase, 0) * im.defaultsalesprice)) AS FLOAT )as netvalue FROM inventorytransactionheader invth JOIN inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey JOIN inventorysummarydetail invsum ON invsum.itemcode = invtd.itemcode JOIN itemmaster im ON im.actualitemcode = invsum.itemcode WHERE invth.loadnumber="
			//+ loadperiodnumber + " or invth.loadnumber=0 order by itemcode"
	var QryInv="SELECT DISTINCT im.actualitemcode,(CAST((COALESCE(beginstockqty, 0)/im.unitspercase) AS INT) * im.caseprice) + ((COALESCE(beginstockqty, 0) % im.unitspercase) * im.defaultsalesprice) AS openingvalue,(CAST((COALESCE(loadqty, 0)/im.unitspercase) AS INT) * im.caseprice) + ((COALESCE(loadqty, 0) % im.unitspercase) * im.defaultsalesprice) AS loadvalue,(CAST((COALESCE(loadadjustqty, 0)/im.unitspercase) AS INT) * im.caseprice) + ((COALESCE(loadadjustqty, 0) % im.unitspercase) * im.defaultsalesprice) AS adjustqtyvalue,((CAST((COALESCE(beginstockqty, 0)+COALESCE(loadqty, 0)+COALESCE(loadadjustqty, 0)) AS INT) / im.unitspercase)* im.caseprice) + (((COALESCE(beginstockqty, 0)+COALESCE(loadqty, 0)+COALESCE(loadadjustqty, 0)) % im.unitspercase)* im.defaultsalesprice) AS netvalue FROM inventorytransactionheader invth JOIN inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey JOIN inventorysummarydetail invsum ON invsum.itemcode = invtd.itemcode JOIN itemmaster im ON im.actualitemcode = invsum.itemcode WHERE invth.loadnumber=" + loadperiodnumber+" or invth.loadnumber=0 order by actualitemcode";		
			
	if (platform == "iPad") {
		Cordova.exec(function(result) {
			if (result.length > 0) {
				loadperiodnumber = result[0][0];
				documentnumber = parseInt(eval(result[0][1]));
				printstatus = result[0][2];

				if (loadperiodnumber.toString() == "1") {
					// Print Load 1 With Opening Stock And Adjust Qty
					PrintOpeningLoad();
				} else {
					PrintCurrentLoad();
				}
			}
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ QryInv ]);
	} else if (platform == "Android") {
		var openingvalue = 0;
		var loadvalue = 0;
		var adjustvalue = 0;
		var netvalue = 0;
		window.plugins.DataBaseHelper
				.select(
						QryInv,
						function(result) {
							if (result.array != undefined) {
								try {
									result = $.map(result.array, function(item,
											index) {
										return [ [ item.actualitemcode,
												item.openingvalue,
												item.loadvalue,
												item.adjustqtyvalue,
												item.netvalue ] ];
									});
									for (i = 0; i < result.length; i++) {
										for (j = 0; j < result[i].length; j++) {

											if (j == 4) {
												result[i][j] = (eval(result[i][j]))
														.toFixed(decimalplace);

												netvalue = (eval(netvalue) + eval(result[i][j]))
														.toFixed(decimalplace);
											}

											if (j == 1) {
												result[i][j] = (eval(result[i][1]))
														.toFixed(decimalplace);
												openingvalue = (eval(openingvalue) + eval(result[i][j]))
														.toFixed(decimalplace);

											}
											if (j == 2) {
												result[i][j] = (eval(result[i][2]))
														.toFixed(decimalplace);
												loadvalue = (eval(loadvalue) + eval(result[i][j]))
														.toFixed(decimalplace);

											}

										}
									}

									data["OpenValue"] = openingvalue.toString();
									data["LoadValue"] = loadvalue.toString();
									data["adjustvalue"] = adjustvalue
											.toString();
									data["netvalue"] = netvalue.toString();
									// data["DOCUMENT NO"] = documentnumber;
									// data["Load Number"] =
									// loadperiodnumber.toString();
									if (loadperiodnumber.toString() == "1") {
										// Print Load 1 With Opening Stock And
										// Adjust Qty
										PrintOpeningLoad();
									} else {
										PrintCurrentLoad();
									}
								} catch (ex) {
									alert(ex);
								}
							}
						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
//
function PrintOpeningLoad() {
	// alert("test");
	getroutedate();
	Qry = "SELECT DISTINCT CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',itemdescription AS 'description',(IFNULL(CAST((beginstockqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((beginstockqty%unitspercase) AS INT),0)) AS 'openqty',(IFNULL(CAST((loadqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((loadqty%unitspercase) AS INT),0)) AS 'loadqty',(IFNULL(CAST((loadadjustqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((loadadjustqty%unitspercase) AS INT),0)) AS 'adjustqty', (CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))/unitspercase) AS INT) ||  '/' || CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))%unitspercase) AS INT)) AS 'netqty' FROM inventorytransactionheader invth JOIN inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey JOIN inventorysummarydetail invsum ON invsum.itemcode = invtd.itemcode JOIN itemmaster im ON im.actualitemcode = invsum.itemcode WHERE invth.loadnumber="
			+ loadperiodnumber + " or invth.loadnumber=0 order by itemcode";
	console.log(Qry);
	if (platform == "iPad") {
		Cordova.exec(function(result) {
			if (result.length < 0)
				result = []
			ProcessOpeningLoad(result);
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == "Android") {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				// alert("test2");
				result = $.map(result.array, function(item, index) {
					return [ [ item.itemcode, item.description, item.openqty,
							item.loadqty, item.adjustqty, item.netqty ] ];
				});
			} else
				result = [];
			ProcessOpeningLoad(result);
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function ProcessOpeningLoad(result) {
	// alert("Ts");
	var Headers = [ "Item#", "Description", "Open Qty", "Load Qty",
			"Adjust Qty", "Net Qty" ]
	var Total = {
		"Open Qty" : "0/0",
		"Load Qty" : "0/0",
		"Adjust Qty" : "0/0",
		"Net Qty" : "0/0"
	}
	for (i = 0; i < result.length; i++) {
		// alert("Ts2");
		for (j = 0; j < result[i].length; j++) {
			if (j == 0) {
				if (!isNaN(result[i][j]))
					result[i][j] = parseInt(result[i][j]);
				result[i][j] = (result[i][j]).toString();
			}
			if (j >= 2 && j <= 5) {
				var qtykey = "";
				if (j == 2)
					qtykey = "Open Qty";
				if (j == 3)
					qtykey = "Load Qty";
				if (j == 4)
					qtykey = "Adjust Qty";
				if (j == 5)
					qtykey = "Net Qty";
				QuantityTotal(Total, qtykey, result[i][j]);
			}
		}
	}
	data["Load Number"] = loadperiodnumber.toString();
	data["DOCUMENT NO"] = documentnumber;
	data["HEADERS"] = Headers;
	data["TOTAL"] = [ Total ];
	data["printstatus"] = getPrintStatus();
	data["data"] = result;
	getCommonData();
	console.log(JSON.stringify(data));
	PrintReport(ReportName.OpeningLoad, data);
}

function PrintCurrentLoad() {
	getroutedate();
	Qry = "SELECT DISTINCT CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',itemdescription AS 'description',(IFNULL(CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0)-IFNULL(invtd.quantity,0))/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0)-IFNULL(invtd.quantity,0))%unitspercase) AS INT),0)) AS 'vanqty',(IFNULL(CAST((invtd.quantity/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((invtd.quantity%unitspercase) AS INT),0)) AS 'loadqty',(CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))/unitspercase) AS INT) ||  '/' || CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))%unitspercase) AS INT)) AS 'netqty' FROM inventorytransactionheader invth JOIN inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey JOIN inventorysummarydetail invsum ON invsum.itemcode = invtd.itemcode and invsum.routekey = invtd.routekey JOIN itemmaster im ON im.actualitemcode = invsum.itemcode WHERE invth.routekey="
			+ sessionStorage.getItem("RouteKey") + " and invth.loadnumber="
			+ loadperiodnumber + " order by itemcode";
	console.log(Qry);
	if (platform == "iPad") {
		Cordova.exec(function(result) {
			if (result.length < 0)
				result = []
			ProcessCurrentLoad(result);
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == "Android") {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				result = $.map(result.array, function(item, index) {
					return [ [ item.itemcode, item.description, item.vanqty,
							item.loadqty, item.netqty ] ];
				});
			} else
				result = [];
			ProcessCurrentLoad(result);
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function ProcessCurrentLoad(result) {
	var Headers = [ "Item#", "Description", "Van Qty", "Load Qty", "Net Qty" ];
	var Total = {
		"Van Qty" : "0/0",
		"Load Qty" : "0/0",
		"Net Qty" : "0/0"
	};
	for (i = 0; i < result.length; i++) {
		for (j = 0; j < result[i].length; j++) {
			if (j == 0) {
				if (!isNaN(result[i][j]))
					result[i][j] = parseInt(result[i][j]);
				result[i][j] = (result[i][j]).toString();
			}
			if (j >= 2 && j <= 4) {
				var qtykey = "";
				if (j == 2)
					qtykey = "Van Qty";
				if (j == 3)
					qtykey = "Load Qty";
				if (j == 4)
					qtykey = "Net Qty";
				QuantityTotal(Total, qtykey, result[i][j]);
			}
		}
	}
	data["Load Number"] = loadperiodnumber.toString();
	data["DOCUMENT NO"] = documentnumber;
	data["HEADERS"] = Headers;
	data["TOTAL"] = [ Total ];
	data["printstatus"] = getPrintStatus();
	data["data"] = result;
	getCommonData();
	console.log(JSON.stringify(data));
	PrintReport(ReportName.LoadReport, data);
}

function getLoadTransferInfo() {
	var Qry = "SELECT documentnumber,printstatus,transferlocationcode FROM inventorytransactionheader WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false')";
	console.log(Qry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result.length > 0) {
				documentnumber = parseInt(eval(result[0][0]));
				printstatus = result[0][1];
				transferroutecode = parseInt(eval(result[0][2]));
			}
			gettransferrouteinfo(transferroutecode);
			PrintLoadTransfer('transferin');
			// PrintLoadTransferValue('transferin');
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						Qry,
						function(result) {
							if (result.array != undefined) {
								documentnumber = parseInt(eval(result.array[0].documentnumber));
								printstatus = result.array[0].printstatus;
								transferroutecode = parseInt(eval(result.array[0].transferlocationcode));
							}
							gettransferrouteinfo(transferroutecode);
							PrintLoadTransfer('transferin');
							// PrintLoadTransferValue('transferin');

						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
// ------------------
function PrintLoadTransferValue(type) {

	if (type == "transferin")
		var Qry = "SELECT itemcode,CAST(((CAST((IFNULL(transferinqty/unitspercase, 0)) AS INT) * caseprice) + (IFNULL((transferinqty) % unitspercase, 0) * defaultsalesprice)) AS FLOAT )as netvalue FROM (SELECT CASE WHEN '"
				+ sessionStorage.getItem("CheckCode")
				+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 3 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferoutqty,im.unitspercase AS 'unitspercase',im.caseprice as 'caseprice',im.defaultsalesprice as 'defaultsalesprice' FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE transferinqty > 0 order by itemcode";
	else if (type == "transferout")
		var Qry = "SELECT itemcode,CAST(((CAST((IFNULL((transferoutqty)/unitspercase, 0)) AS INT) * caseprice) + (IFNULL((transferoutqty) % unitspercase, 0) * defaultsalesprice)) AS FLOAT )as netvalue FROM (SELECT CASE WHEN '"
				+ sessionStorage.getItem("CheckCode")
				+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 3 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferoutqty,im.unitspercase AS 'unitspercase',im.caseprice as 'caseprice',im.defaultsalesprice as 'defaultsalesprice' FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE transferoutqty > 0 order by itemcode";
	else if (type == "damage")
		var Qry = "SELECT itemcode,CAST(((CAST((IFNULL((damagetransferoutqty)/unitspercase, 0)) AS INT) * caseprice) + (IFNULL((damagetransferoutqty) % unitspercase, 0) * defaultsalesprice)) AS FLOAT )as netvalue FROM (SELECT CASE WHEN '"
				+ sessionStorage.getItem("CheckCode")
				+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 3 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferoutqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 4 AND istemp = 'false' AND itemcode = invsum.itemcode),0) damagetransferoutqty,im.unitspercase AS 'unitspercase',im.caseprice as 'caseprice',im.defaultsalesprice as 'defaultsalesprice' FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE damagetransferoutqty > 0 order by itemcode";
	console.log(Qry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result.length <= 0)
				result = [];

		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == 'Android') {

		window.plugins.DataBaseHelper
				.select(
						Qry,
						function(result) {
							if (result.array != undefined) {
								result = $.map(result.array,
										function(item, index) {
											return [ [ item.itemcode,
													item.netvalue ] ];
										});
								for (i = 0; i < result.length; i++) {
									for (j = 0; j < result[i].length; j++) {
										if (j == 1) {
											result[i][j] = (eval(result[i][j]))
													.toFixed(decimalplace);
											if (type == "transferin") {
												netinvalue = (eval(netinvalue) + eval(result[i][j]))
														.toFixed(decimalplace);
											} else if (type == "transferout") {
												netoutvalue = (eval(netoutvalue) + eval(result[i][j]))
														.toFixed(decimalplace);
											}

										}

									}
								}

							} else
								result = [];

						}, function() {
							console.warn("Error calling plugin");
						});
	}
}
// ----------------
function gettransferrouteinfo(transferroutecode) {
	var Qry = "SELECT routecode,routename FROM routemaster WHERE routecode = "
			+ transferroutecode;
	console.log(Qry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result.length > 0) {
				routecode = parseInt(eval(result[0][0]));
				routename = result[0][1];

			}
			tranferflag = 1;
			data["TO ROUTE"] = routecode + "-" + routename;
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				routecode = parseInt(eval(result.array[0].routecode));
				routename = result.array[0].routename;
			}
			tranferflag = 1;
			data["TO ROUTE"] = routecode + "-" + routename;
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}
//
//
function PrintLoadTransfer(type) {
	PrintLoadTransferValue(type);
	getroutedate();
	if (type == "transferin")
		// var Qry = "SELECT itemcode,description,(CAST((vanqty - (transferinqty
		// - transferoutqty))/unitspercase AS INT) || '/' || CAST((vanqty
		// -(transferinqty - transferoutqty))%unitspercase AS INT)) AS vanqty,
		// (CAST(transferinqty/unitspercase AS INT) || '/' ||
		// CAST(transferinqty%unitspercase AS INT)) transferqty,(CAST((vanqty -
		// (transferinqty - transferoutqty) + transferinqty)/unitspercase AS
		// INT) || '/' || CAST((vanqty -(transferinqty -
		// transferoutqty)+transferinqty)%unitspercase AS INT)) netqty FROM
		// (SELECT CASE WHEN '" + sessionStorage.getItem("CheckCode") + "' =
		// 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS
		// itemcode,itemdescription as
		// description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0)))
		// AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail
		// WHERE detailkey = (SELECT MAX(detailkey) FROM
		// inventorytransactionheader WHERE transactiontype = 2 AND istemp =
		// 'false') AND transactiontypecode = 3 AND istemp = 'false' AND
		// itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity
		// FROM inventorytransactiondetail WHERE detailkey = (SELECT
		// MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype
		// = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp =
		// 'false' AND itemcode = invsum.itemcode),0)
		// transferoutqty,unitspercase AS
		// 'unitspercase',caseprice,defaultsalesprice FROM
		// inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode
		// = invsum.itemcode) WHERE transferinqty > 0 order by itemcode";
		var Qry = "SELECT itemcode,description,(CAST(transferinqty/unitspercase AS INT) || '/' || CAST(transferinqty%unitspercase AS INT)) transferqty,(CAST((vanqty - (transferinqty - transferoutqty) + transferinqty)/unitspercase AS INT) || '/' || CAST((vanqty -(transferinqty - transferoutqty)+transferinqty)%unitspercase AS INT)) netqty FROM (SELECT CASE WHEN '"
				+ sessionStorage.getItem("CheckCode")
				+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 3 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferoutqty,unitspercase AS 'unitspercase',caseprice,defaultsalesprice FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE transferinqty > 0 order by itemcode";
	else if (type == "transferout")
		// var Qry = "SELECT itemcode,description,(CAST((vanqty - (transferinqty
		// - transferoutqty))/unitspercase AS INT) || '/' || CAST((vanqty
		// -(transferinqty - transferoutqty))%unitspercase AS INT)) AS vanqty,
		// (CAST(transferoutqty/unitspercase AS INT) || '/' ||
		// CAST(transferoutqty%unitspercase AS INT)) transferqty,(CAST((vanqty -
		// (transferinqty - transferoutqty) - transferoutqty)/unitspercase AS
		// INT) || '/' || CAST((vanqty -(transferinqty -
		// transferoutqty)-transferoutqty)%unitspercase AS INT)) netqty FROM
		// (SELECT CASE WHEN '" + sessionStorage.getItem("CheckCode") + "' =
		// 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS
		// itemcode,itemdescription as
		// description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0)))
		// AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail
		// WHERE detailkey = (SELECT MAX(detailkey) FROM
		// inventorytransactionheader WHERE transactiontype = 2 AND istemp =
		// 'false') AND transactiontypecode = 3 AND istemp = 'false' AND
		// itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity
		// FROM inventorytransactiondetail WHERE detailkey = (SELECT
		// MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype
		// = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp =
		// 'false' AND itemcode = invsum.itemcode),0)
		// transferoutqty,unitspercase AS
		// 'unitspercase',caseprice,defaultsalesprice FROM
		// inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode
		// = invsum.itemcode) WHERE transferoutqty > 0 order by itemcode";
		var Qry = "SELECT itemcode,description,(CAST(transferoutqty/unitspercase AS INT) || '/' || CAST(transferoutqty%unitspercase AS INT)) transferqty,(CAST((vanqty - (transferinqty - transferoutqty) - transferoutqty)/unitspercase AS INT) || '/' || CAST((vanqty -(transferinqty - transferoutqty)-transferoutqty)%unitspercase AS INT)) netqty FROM (SELECT CASE WHEN '"
				+ sessionStorage.getItem("CheckCode")
				+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 3 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferoutqty,unitspercase AS 'unitspercase',caseprice,defaultsalesprice FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE transferoutqty > 0 order by itemcode";
	else if (type == "damage")
		// var Qry = "SELECT itemcode,description,(CAST((vanqty - (transferinqty
		// - transferoutqty))/unitspercase AS INT) || '/' || CAST((vanqty
		// -(transferinqty - transferoutqty))%unitspercase AS INT)) AS vanqty,
		// (CAST(damagetransferoutqty/unitspercase AS INT) || '/' ||
		// CAST(damagetransferoutqty%unitspercase AS INT))
		// transferqty,(CAST((vanqty - (transferinqty - transferoutqty) -
		// damagetransferoutqty)/unitspercase AS INT) || '/' || CAST((vanqty
		// -(transferinqty - transferoutqty)-damagetransferoutqty)%unitspercase
		// AS INT)) netqty FROM (SELECT CASE WHEN '" +
		// sessionStorage.getItem("CheckCode") + "' = 'alternatecode' THEN
		// im.alternatecode ELSE im.actualitemcode END AS
		// itemcode,itemdescription as
		// description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0)))
		// AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail
		// WHERE detailkey = (SELECT MAX(detailkey) FROM
		// inventorytransactionheader WHERE transactiontype = 2 AND istemp =
		// 'false') AND transactiontypecode = 3 AND istemp = 'false' AND
		// itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity
		// FROM inventorytransactiondetail WHERE detailkey = (SELECT
		// MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype
		// = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp =
		// 'false' AND itemcode = invsum.itemcode),0)
		// transferoutqty,IFNULL((SELECT quantity FROM
		// inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey)
		// FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp
		// = 'false') AND transactiontypecode = 4 AND istemp = 'false' AND
		// itemcode = invsum.itemcode),0) damagetransferoutqty,unitspercase AS
		// 'unitspercase',caseprice,defaultsalesprice FROM
		// inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode
		// = invsum.itemcode) WHERE damagetransferoutqty > 0 order by itemcode";
		var Qry = "SELECT itemcode,description,(CAST(damagetransferoutqty/unitspercase AS INT) || '/' || CAST(damagetransferoutqty%unitspercase AS INT)) transferqty,(CAST((vanqty - (transferinqty - transferoutqty) - damagetransferoutqty)/unitspercase AS INT) || '/' || CAST((vanqty -(transferinqty - transferoutqty)-damagetransferoutqty)%unitspercase AS INT)) netqty FROM (SELECT CASE WHEN '"
				+ sessionStorage.getItem("CheckCode")
				+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 3 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferoutqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 4 AND istemp = 'false' AND itemcode = invsum.itemcode),0) damagetransferoutqty,unitspercase AS 'unitspercase',caseprice,defaultsalesprice FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE damagetransferoutqty > 0 order by itemcode";
	console.log(Qry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result.length <= 0)
				result = [];
			ProcessTransferData(result, type);
			if (type == "transferin")
				PrintLoadTransfer("transferout");
			else if (type == "transferout")
				PrintLoadTransfer("damage");
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				result = $.map(result.array, function(item, index) {
					return [ [ item.itemcode, item.description,
							item.transferqty, item.netqty ] ];
				});
			} else
				result = [];
			ProcessTransferData(result, type);
			if (type == "transferin")
				PrintLoadTransfer("transferout");
			else if (type == "transferout")
				PrintLoadTransfer("damage");
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function ProcessTransferData(result, type) {

	// getCommonData();
	var Header = [ "Item#", "Description", "Transfer Qty", "Net Qty" ];
	data["HEADERS"] = [ "Item#", "Description", "Transfer Qty", "Net Qty" ];
	var total = {
		"Transfer Qty" : "0/0",
		"Net Qty" : "0/0"
	};
	for (i = 0; i < result.length; i++) {
		for (j = 0; j < result[i].length; j++) {
			if (j == 0) {
				if (!isNaN(result[i][j]))
					result[i][j] = parseInt(result[i][j]);
				result[i][j] = (result[i][j]).toString();
			}
			if (j == 2 || j == 3) {
				var qtykey = "";
				if (j == 2)
					qtykey = "Transfer Qty";
				if (j == 3)
					qtykey = "Net Qty";
				QuantityTotal(total, qtykey, result[i][j]);
			}
		}
	}

	if (data["data"] == undefined)
		data["data"] = [];
	data["data"].push({
		"DATA" : result,
		"HEADERS" : Header,
		"TOTAL" : total
	});

	if (type == "damage") {
		getCommonData();
		data["printstatus"] = getPrintStatus();
		data["DOCUMENT NO"] = documentnumber;
		data["netvalue"] = eval(eval(netinvalue) - eval(netoutvalue)).toFixed(
				decimalplace);
		// data["data"] = result;
		// data["netvalue"] = '0';
		data["TOTAL"] = [ total ];

		console.log(JSON.stringify(data));
		PrintReport(ReportName.LoadTransfer, data);
	}
}

/*
 * function getEndInventoryInfo() { var Qry = "SELECT documentnumber,printstatus
 * FROM inventorytransactionheader WHERE detailkey = (SELECT
 * MAX(invth.detailkey) FROM inventorytransactionheader invth JOIN
 * inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey AND
 * invtd.transactiontypecode IN(5,6) WHERE invth.istemp = 'false')";
 * console.log(Qry); if (platform == 'iPad') { Cordova.exec(function(result) {
 * if(result.length > 0) { documentnumber = parseInt(eval(result[0][0]));
 * printstatus = result[0][1]; } PrintEndInventory(); }, function(error) {
 * alert(error); }, "PluginClass", "GetdataMethod", [Qry]); } else if (platform ==
 * 'Android') { window.plugins.DataBaseHelper.select(Qry, function(result) {
 * if(result.array != undefined) { documentnumber =
 * parseInt(eval(result.array[0].documentnumber)); printstatus =
 * result.array[0].printstatus; } PrintEndInventory(); }, function() {
 * console.warn("Error calling plugin"); }); } }
 * 
 * function PrintEndInventory() { getroutedate(); var autoload =
 * sessionStorage.getItem("autoload"); if(autoload == 3 || autoload == 4) var
 * field ="endstockqty"; else var field ="unloadqty"; var Qry = "SELECT
 * itemcode,description,(CAST(vanqty/unitspercase AS INT) || '/' ||
 * CAST(vanqty%unitspercase AS INT)) AS
 * truckstockqty,(CAST(freshunloadqty/unitspercase AS INT) || '/' ||
 * CAST(freshunloadqty%unitspercase AS INT)) AS
 * freshunloadqty,(CAST(truckdamageqty/unitspercase AS INT) || '/' ||
 * CAST(truckdamageqty%unitspercase AS INT)) AS
 * truckdamageqty,(CAST(("+field+")/unitspercase AS INT) || '/' ||
 * CAST(("+field+")%unitspercase AS INT)) as
 * closingstock,(CAST((vanqty-freshunloadqty-truckdamageqty-"+field+")/unitspercase
 * AS INT) || '/' ||
 * CAST((vanqty-freshunloadqty-truckdamageqty-"+field+")%unitspercase AS INT))
 * AS varianceqty FROM (SELECT CASE WHEN '" +
 * sessionStorage.getItem("CheckCode") + "' = 'alternatecode' THEN
 * im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription AS
 * description,unitspercase,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0)))
 * AS vanqty,IFNULL(freshunloadqty,0) as
 * freshunloadqty,IFNULL(truckdamagedunloadqty,0) as
 * truckdamageqty,IFNULL(unloadqty,0) as unloadqty,IFNULL(endstockqty,0) as
 * endstockqty FROM inventorytransactionheader invth JOIN
 * inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey JOIN
 * inventorysummarydetail invsum ON invsum.itemcode = invtd.itemcode JOIN
 * itemmaster im ON im.actualitemcode = invsum.itemcode WHERE
 * invtd.transactiontypecode IN(5,6)) order by itemcode"; console.log(Qry); if
 * (platform == 'iPad') { Cordova.exec(function(result) { if(result.length <= 0)
 * result = []; ProcessEndInventory(result); }, function(error) { alert(error); },
 * "PluginClass", "GetdataMethod", [Qry]); } else if (platform == 'Android') {
 * window.plugins.DataBaseHelper.select(Qry, function(result) { if(result.array !=
 * undefined) { result = $.map(result.array, function(item, index) { return
 * [[item.itemcode,item.description, item.truckstockqty, item.freshunloadqty,
 * item.truckdamageqty,item.closingstock,item.varianceqty]]; }); } else result =
 * []; ProcessEndInventory(result); }, function() { console.warn("Error calling
 * plugin"); }); } }
 * 
 * function ProcessEndInventory(result) { data["HEADERS"] =
 * ["Item#","Description","Truck Stock","Fresh Unload","Truck Damage","Closing
 * Stock","Variance Qty"]; var total = {"Truck Stock" : "0/0","Fresh Unload" :
 * "0/0", "Truck Damage" : "0/0", "Closing Stock" : "0/0","Variance Qty" :
 * "0/0"}; for(i=0;i<result.length;i++) { for(j=0;j<result[i].length;j++) {
 * if(j == 0) { result[i][j] = (result[i][j]); result[i][j] =
 * (result[i][j]).toString(); } if(j >= 2 && j<=6) { var qtykey = ""; if(j ==
 * 2) qtykey = "Truck Stock"; if(j == 3) qtykey = "Fresh Unload"; if(j == 4)
 * qtykey = "Truck Damage"; if(j == 5) qtykey = "Closing Stock"; if(j == 6)
 * qtykey = "Variance Qty"; QuantityTotal(total,qtykey,result[i][j]); } } }
 * getCommonData(); data["printstatus"] = getPrintStatus(); data["DOCUMENT NO"] =
 * documentnumber; data["data"] = result; data["TOTAL"] = [total];
 * console.log(JSON.stringify(data)); PrintReport(ReportName.EndInventory,data); }
 */
function PrintSales() {
	// GetSalesData('sales');
	data = {};
	getInvoiceInfo()
}

function getInvoiceInfo() {
	// var Qry = "SELECT cm.customercode,customername,customeraddress1 as
	// address,paymenttype,IFNULL(totalpromoamount,0)
	// totalpromoamount,(IFNULL(totalsalesamount,0) -
	// IFNULL(totalreturnamount,0)-IFNULL(totaldamagedamount,0))
	// totalinvoiceamount,documentnumber,invoicenumber,comments,printstatus,(SELECT
	// CASE cm.messagekey5 WHEN 0 THEN '' ELSE messagedescription END FROM
	// customermessages WHERE messagekey = messagekey5) AS invheadermsg,(SELECT
	// CASE cm.messagekey6 WHEN 0 THEN '' ELSE messagedescription END FROM
	// customermessages WHERE messagekey = messagekey6) AS invtrailormsg,(SELECT
	// sum(promoamount) from invoicedetail invt where invt.visitkey=" +
	// sessionStorage.getItem("VisitKey")+" AND invt.routekey=" +
	// sessionStorage.getItem("RouteKey")+") as promoamount FROM customermaster
	// cm JOIN invoiceheader inv ON cm.customercode = inv.customercode AND
	// inv.visitkey=" + sessionStorage.getItem("VisitKey")+" AND inv.routekey="
	// + sessionStorage.getItem("RouteKey")+"";
	var Qry = "SELECT cm.customercode,customername,customeraddress1 as address,inv.paymenttype,IFNULL(totalpromoamount,0) totalpromoamount,(IFNULL(totalsalesamount,0) - IFNULL(totalreturnamount,0)-IFNULL(totaldamagedamount,0)) totalinvoiceamount,documentnumber,invoicenumber,comments,printstatus,(SELECT CASE cm.messagekey5 WHEN 0 THEN '' ELSE messageline1 || messageline2 || messageline3 || messageline4 END FROM customermessages WHERE messagekey = messagekey5) AS invheadermsg,(SELECT CASE cm.messagekey6 WHEN 0 THEN '' ELSE messageline1 || messageline2 || messageline3 || messageline4 END FROM customermessages WHERE messagekey = messagekey6) AS invtrailormsg,(SELECT IFNULL(sum(IFNULL(promoamount,0)),0) from invoicedetail invt where invt.visitkey="
			+ sessionStorage.getItem("VisitKey")
			+ " AND invt.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ ") as promoamount,(SELECT (IFNULL(sum(amount),0) - IFNULL(sum(promoamount),0)) from invoicedetail invt where invt.visitkey="
			+ sessionStorage.getItem("VisitKey")
			+ " AND invt.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ ") as tcamount,cm.invoicepaymentterms,IFNULL(amount,0) as amount,bankname,checkdate,checknumber,cm.outletsubtype FROM customermaster cm JOIN invoiceheader inv ON cm.customercode = inv.customercode AND inv.visitkey="
			+ sessionStorage.getItem("VisitKey")
			+ " AND inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " LEFT JOIN cashcheckdetail ccd ON ccd.visitkey = inv.visitkey AND ccd.routekey = inv.routekey LEFT JOIN bankmaster bm ON bm.bankcode = ccd.bankcode";
	console.log(Qry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result.length > 0) {
				customercode = result[0][0];
				customername = result[0][1];
				customeraddress = result[0][2];
				paymenttype = result[0][3];
				totalpromoamount = eval(result[0][4]).toFixed(decimalplace);
				totalinvoiceamount = eval(result[0][5]).toFixed(decimalplace);
				documentnumber = parseInt(eval(result[0][6]));
				invoicenumber = parseInt(eval(result[0][7]));

				comments = result[0][8];
				printstatus = result[0][9];
				invheadermsg = result[0][10];
				invtrailormsg = result[0][11];
				itempromoamount = (eval(result[0][12])).toFixed(decimalplace);
				tcamount = eval(result[0][13]).toFixed(decimalplace)
						- eval(result[0][15]).toFixed(decimalplace);
				;
				invoicepaymentterms = result[0][14];
				customerOutlet=result[0][19];
				data["Cash"] = {
					"Amount" : result[0][15]
				};
				if (result[0][17] != '') {
					var d = new Date(result[0][17]);
					result[0][17] = (d.getDate() + "/" + (d.getMonth() + 1)
							+ "/" + d.getFullYear());
				}
				data["Cheque"] = [ {
					"Cheque Date" : (result[0][17]).toString(),
					"Cheque No" : (result[0][18]),
					"Bank" : result[0][16],
					"Amount" : (result[0][15]).toString()
				} ];
				GetSalesData('sales', '1');
			}
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				result = $.map(result.array, function(item, index) {
					return [ [ item.customercode, item.customername,
							item.address, item.paymenttype,
							item.totalpromoamount, item.totalinvoiceamount,
							item.documentnumber, item.invoicenumber,
							item.comments, item.printstatus, item.invheadermsg,
							item.invtrailormsg, item.promoamount,
							item.tcamount, item.invoicepaymentterms,
							item.amount, item.bankname, item.checkdate,
							item.checknumber,item.outletsubtype ] ];
				});
				customercode = result[0][0];
				customername = result[0][1];
				customeraddress = result[0][2];
				paymenttype = result[0][3];
				totalpromoamount = eval(result[0][4]).toFixed(decimalplace);
				totalinvoiceamount = eval(result[0][5]).toFixed(decimalplace);
				documentnumber = parseInt(eval(result[0][6]));
				invoicenumber = parseInt(eval(result[0][7]));
				comments = result[0][8];
				printstatus = result[0][9];
				invheadermsg = result[0][10];
				invtrailormsg = result[0][11];
				itempromoamount = eval(eval(result[0][12])).toFixed(
						decimalplace);
				tcamount = eval(result[0][13]).toFixed(decimalplace)
						- eval(result[0][15]).toFixed(decimalplace);
				invoicepaymentterms = result[0][14];
				data["Cash"] = {
					"Amount" : eval(result[0][15]).toFixed(decimalplace)
				};
				if (result[0][17] != '') {
					var d = new Date(result[0][17]);
					result[0][17] = (d.getDate() + "/" + (d.getMonth() + 1)
							+ "/" + d.getFullYear());
				}
				data["Cheque"] = [ {
					"Cheque Date" : (result[0][17]).toString(),
					"Cheque No" : (result[0][18]),
					"Bank" : result[0][16],
					"Amount" : (eval(result[0][15]).toFixed(decimalplace))
				} ];
				customerOutlet=result[0][19];
				
				if(customerOutlet==null || customerOutlet=='' || customerOutlet==undefined){
					
					customerOutlet=0;
					
				}
				
				// GetSalesData('sales');
				// 0 For display Discount and 1 For Report have UPC
				GetSalesData('sales', '1');
			}
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function GetSalesData(trans, val) {
	getroutedate();
	if (val == '1') {
		var total = {
			"QTY CAS/PCS" : "0/0",
			"Total PCS" : "0",
			"Amount" : "0"
		};
		var Header = [ "Item#","Outlet Code", "Description", "UPC", "QTY CAS/PCS",
				"Total PCS", "Case Price", "Unit Price", "Amount" ];

	} else {
		var total = {
			"QTY CAS/PCS" : "0/0",
			"Discount" : "0",
			"Amount" : "0"
		};
		var Header = [ "Item#","Outlet Code", "Description", "QTY CAS/PCS", "Total PCS",
				"Case Price", "Unit Price", "Discount", "Amount" ];

	}
	// var total = {"Quantity" : "0/0","Discount" : "0","Amount" : "0" };
	// var Header = ["Item#","Description","Quantity","Case Price","Unit
	// Price","Discount","Amount"];
	var HeaderFree = [ "Item#","Outlet Code", "Description", "UPC", "QTY CAS/PCS",
			"Total PCS", "Case Price", "Unit Price", "Amount" ]
	var QrySales = "SELECT CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,(IFNULL(CAST((salesqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((salesqty%unitspercase) AS INT),0)) AS 'quantity',salesqty AS 'tqty',IFNULL(salescaseprice,0) AS caseprice,IFNULL(salesprice,0) AS unitprice,IFNULL(promoamount,0) as discount,(((IFNULL(CAST((salesqty/unitspercase) AS INT),0) * IFNULL(salescaseprice,0)) + (IFNULL(CAST((salesqty%unitspercase) AS INT),0)) * IFNULL(salesprice,0)) - IFNULL(promoamount,0)) AS 'amount' FROM invoicedetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and inv.salesqty > 0 JOIN invoiceheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="+customerOutlet+"  WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1  order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";
	

	// var QryFree = "SELECT CASE WHEN '" + sessionStorage.getItem("CheckCode")
	// + "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END
	// AS 'itemcode',itemdescription AS
	// 'description',(IFNULL(CAST((manualfreeqty/unitspercase) AS INT),0) || '/'
	// || IFNULL(CAST((manualfreeqty%unitspercase) AS INT),0)) AS
	// 'quantity',IFNULL(salescaseprice,0) AS caseprice,IFNULL(salesprice,0) AS
	// unitprice,((IFNULL(CAST((manualfreeqty/unitspercase) AS INT),0) *
	// IFNULL(salescaseprice,0)) + (IFNULL(CAST((manualfreeqty%unitspercase) AS
	// INT),0)) * IFNULL(salesprice,0)) AS 'amount' FROM invoicedetail inv JOIN
	// itemmaster im ON im.actualitemcode = inv.itemcode and inv.manualfreeqty >
	// 0 JOIN invoiceheader invh ON invh.visitkey = inv.visitkey AND
	// invh.customercode = " + sessionStorage.getItem("customerid") + " WHERE
	// inv.routekey=" + sessionStorage.getItem("RouteKey") + " AND inv.visitkey
	// = " + sessionStorage.getItem("VisitKey");
	var QryFree = "SELECT CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,(IFNULL(CAST((manualfreeqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((manualfreeqty%unitspercase) AS INT),0)) AS 'quantity',manualfreeqty AS 'tqty',IFNULL(salescaseprice,0) AS caseprice,IFNULL(salesprice,0) AS unitprice,0 AS 'amount' FROM invoicedetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and inv.manualfreeqty > 0 JOIN invoiceheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="+customerOutlet+" WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1 order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";
	// var QryPromoFree = "SELECT CASE WHEN '" +
	// sessionStorage.getItem("CheckCode") + "' = 'alternatecode' THEN
	// im.alternatecode ELSE im.actualitemcode END AS 'itemcode',itemdescription
	// AS 'description',(IFNULL(CAST((freesampleqty/unitspercase) AS INT),0) ||
	// '/' || IFNULL(CAST((freesampleqty%unitspercase) AS INT),0)) AS
	// 'quantity',IFNULL(salescaseprice,0) AS caseprice,IFNULL(salesprice,0) AS
	// unitprice,((IFNULL(CAST((freesampleqty/unitspercase) AS INT),0) *
	// IFNULL(salescaseprice,0)) + (IFNULL(CAST((freesampleqty%unitspercase) AS
	// INT),0)) * IFNULL(salesprice,0)) AS 'amount' FROM invoicedetail inv JOIN
	// itemmaster im ON im.actualitemcode = inv.itemcode and freesampleqty > 0
	// JOIN invoiceheader invh ON invh.visitkey = inv.visitkey AND
	// invh.customercode = " + sessionStorage.getItem("customerid") + " WHERE
	// inv.routekey=" + sessionStorage.getItem("RouteKey") + " AND inv.visitkey
	// = " + sessionStorage.getItem("VisitKey");
	var QryPromoFree = "SELECT CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,(IFNULL(CAST((freesampleqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((freesampleqty%unitspercase) AS INT),0)) AS 'quantity',freesampleqty AS 'tqty',IFNULL(salescaseprice,0) AS caseprice,IFNULL(salesprice,0) AS unitprice,0 AS 'amount' FROM invoicedetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and freesampleqty > 0 JOIN invoiceheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="+customerOutlet+" WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";
	var QryGood = "SELECT CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,(IFNULL(CAST((returnqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((returnqty%unitspercase) AS INT),0)) AS 'quantity',returnqty AS 'tqty',IFNULL(goodreturncaseprice,0) AS caseprice,IFNULL(goodreturnprice,0) AS unitprice,IFNULL(promoamount,0) as discount,(((IFNULL(CAST((returnqty/unitspercase) AS INT),0) * IFNULL(goodreturncaseprice,0)) + (IFNULL(CAST((returnqty%unitspercase) AS INT),0)) * IFNULL(goodreturnprice,0)) - IFNULL(returnpromoamount,0) - IFNULL(roundsalesamount,0)) AS 'amount' FROM invoicedetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and inv.returnqty > 0 JOIN invoiceheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="+customerOutlet+" WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1  order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";
	var QryBad = "SELECT CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,(IFNULL(CAST((damagedqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((damagedqty%unitspercase) AS INT),0)) AS 'quantity',damagedqty AS 'tqty',IFNULL(inv.returncaseprice,0) AS caseprice,IFNULL(inv.returnprice,0) AS unitprice,IFNULL(promoamount,0) as discount,(((IFNULL(CAST((damagedqty/unitspercase) AS INT),0) * IFNULL(inv.returncaseprice,0)) + (IFNULL(CAST((damagedqty%unitspercase) AS INT),0)) * IFNULL(inv.returnprice,0)) - IFNULL(returnpromoamount,0) - IFNULL(roundsalesamount,0)) AS 'amount' FROM invoicedetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and inv.damagedqty > 0 JOIN invoiceheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="+customerOutlet+" WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1  order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";
	var Qry;
	if (trans == 'sales')
		Qry = QrySales;
	else if (trans == 'free') {
		Qry = QryFree;
		Header = HeaderFree;
		delete total["Discount"];
	} else if (trans == 'promofree') {
		Qry = QryPromoFree;
		Header = HeaderFree;
		delete total["Discount"];
	} else if (trans == 'good')
		Qry = QryGood;
	else if (trans == 'bad')
		Qry = QryBad;
	console.log("nidhi----" + Qry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			SetSalesTransaction(trans, result, Header, total);
			if (trans == 'sales')
				// GetSalesData('free');
				GetSalesData('free', '1'); // Added for display UPC
			if (trans == 'free')
				// GetSalesData('promofree');
				GetSalesData('promofree', '1'); // Added for display UPC
			if (trans == 'promofree')
				// GetSalesData('good');
				GetSalesData('good', '1'); // Added for display UPC
			if (trans == 'good')
				// GetSalesData('bad');
				GetSalesData('bad', '1'); // Added for display UPC
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				if (trans == 'free' || trans == 'promofree') {
					result = $.map(result.array, function(item, index) {
						return [ [ item.itemcode,item.outletcode, item.description, item.upc,
								item.quantity, item.tqty, item.caseprice,
								item.unitprice, item.amount ] ];
					});
				} else {
					result = $.map(result.array,
							function(item, index) {
								// Start for display UPC or Discount
								if (val == '1') {
									return [ [ item.itemcode,item.outletcode, item.description,
											item.upc, item.quantity, item.tqty,
											item.caseprice, item.unitprice,
											item.amount ] ];
								} else {
									return [ [ item.itemcode,item.outletcode, item.description,
											item.quantity, item.tqty,
											item.caseprice, item.unitprice,
											item.discount, item.amount ] ];
								}
								// End
								// return [[item.itemcode,item.description,
								// item.quantity, item.caseprice,
								// item.unitprice,item.discount,item.amount]];
							});
				}
			} else
				result = [];

			SetSalesTransaction(trans, result, Header, total);
			if (trans == 'sales')
				// GetSalesData('free');
				GetSalesData('free', '1'); // Added for display UPC
			if (trans == 'free')
				// GetSalesData('promofree');
				GetSalesData('promofree', '1'); // Added for display UPC
			if (trans == 'promofree')
				// GetSalesData('good');
				GetSalesData('good', '1'); // Added for display UPC
			if (trans == 'good')
				// GetSalesData('bad');
				GetSalesData('bad', '1'); // Added for display UPC
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function SetSalesTransaction(trans, result, Header, Total) {
	for (i = 0; i < result.length; i++) {
		for (j = 0; j < result[i].length; j++) {
			if (j == 0) {
				if (!isNaN(result[i][j])) {
					result[i][j] = parseInt(eval(result[i][j]));
					result[i][j] = (result[i][j]).toString();
				}
			}
			 if(j==1){
             	if(!isNaN(result[i][j]) && result[i][j]!='-')
             	{
             		result[i][j] = parseInt(eval(result[i][j]));
             		result[i][j] = (result[i][j]).toString();
                 }
             	else
                 {
             		result[i][j] = ("---").toString();
                 }
             	
             }
			if (j == 4) {
				var qtykey = "QTY CAS/PCS";
				QuantityTotal(Total, qtykey, result[i][j]);
			}
			if (j == 5) {
				var qtykey = "Total PCS";
				QTotal(Total, qtykey, result[i][j]);
			}
			
			else if (j == 7 && trans != 'free' && trans != 'promofree') {
				result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
				Total.Discount = (eval(Total.Discount) + eval(result[i][j]))
						.toString();
			} else if (j == 7 && (trans == 'free'))
				Total.Amount = (eval(Total.Amount) + eval(result[i][j]))
						.toFixed(decimalplace).toString();
			else if (j == 8 && trans != 'free')
				Total.Amount = (eval(Total.Amount) + eval(result[i][j]))
						.toFixed(decimalplace).toString();
			if (j > 5) {
				result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
			}
		}
	}

	if (isNaN(Total.Discount))
		Total.Discount = 0;
	if (isNaN(Total.Amount))
		Total.Amount = 0;
	Total.Discount = eval(parseFloat(Total.Discount)).toFixed(decimalplace);
	Total.Amount = eval(parseFloat(Total.Amount)).toFixed(decimalplace);
	console.log("TOTALQTY : " + Total.Quantity);
	// SetData(trans,result,Header,total);
	if (data["data"] == undefined)
		data["data"] = [];
	data["data"].push({
		"DATA" : result,
		"HEADERS" : Header,
		"TOTAL" : Total
	});
	if (trans == "bad") {
		getCommonData();
		var invoicetype = ""
		// if(paymenttype == 0)
		// {
		// if(invoicepaymentterms > 2)
		// invoicetype = "CASH/TC INVOICE: " + invoicenumber;
		// else
		// invoicetype = "CASH INVOICE: " + invoicenumber;
		// }
		// else if(paymenttype == 4)
		// invoicetype = "CASH/TC INVOICE: " + invoicenumber;
		// else if(paymenttype == 1)
		// invoicetype = "CREDIT INVOICE: " + invoicenumber;

		if (invoicepaymentterms == 0 || invoicepaymentterms == 1)
			invoicetype = "CASH INVOICE: " + invoicenumber;
		else if (invoicepaymentterms == 3 || invoicepaymentterms == 4)
			invoicetype = "CASH/TC INVOICE: " + invoicenumber;
		else if (invoicepaymentterms == 2)
			invoicetype = "CREDIT INVOICE: " + invoicenumber;
		data["INVOICETYPE"] = invoicetype;
		data["CUSTOMER"] = customercode + "-" + customername; // "5416-SWITZ
																// MASTER BAKERS
																// (Cr)";
		data["ADDRESS"] = customeraddress; // "Suite 808, Burjuman Business
											// Tower";
		if (comments == 0 || comments == "0")
			comments = "";
		data["comments"] = unescape(comments);
		data["printstatus"] = getPrintStatus();
		console.log("itempromoamount-----nidhi" + itempromoamount);
		data["SUB TOTAL"] = (totalinvoiceamount - itempromoamount).toFixed(
				decimalplace).toString();
		// data["SUB TOTAL"] = eval(totalinvoiceamount) +
		// eval(totalpromoamount);
		data["INVOICE DISCOUNT"] = (totalpromoamount - itempromoamount)
				.toFixed(decimalplace).toString();
		data["NET SALES"] = (totalinvoiceamount - totalpromoamount).toFixed(
				decimalplace).toString();
		// data["NET SALES"] = totalinvoiceamount;
		data["DOCUMENT NO"] = documentnumber;
		if (invheadermsg == 0 || invheadermsg == "0")
			invheadermsg = "";
		data["invheadermsg"] = invheadermsg;
		if (invtrailormsg == 0 || invtrailormsg == "0")
			invtrailormsg = "";
		data["invtrailormsg"] = invtrailormsg;
		if (sessionStorage.getItem("invoicetwise") == 1)
			data["isTwice"] = "1";
		else
			data["isTwice"] = "0";

		data["TCCHARGED"] = (tcamount).toFixed(decimalplace).toString();
		if (paymenttype == 0) {
			data["PaymentType"] = "0";
		} else if (paymenttype == 4) {
			data["PaymentType"] = "1";
		} else if (paymenttype == 1) {
			data["PaymentType"] = "2";
		} else
			data["PaymentType"] = "0";

		if (invoicepaymentterms > 2)
			data["TCALLOWED"] = "1";
		else
			data["TCALLOWED"] = "0";
		console.log(JSON.stringify(data));
		// delet();
		// deviceall();
		// setTimeout(function() { PrintReport(ReportName.Sales,data); }, 2000);
		PrintReport(ReportName.Sales, data);
		// alertpromo();
	}
}

function alertpromo() {
	var Qry = "SELECT promoamount FROM invoicedetail WHERE itemcode IN(21,35) AND routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND visitkey="
			+ sessionStorage.getItem("VisitKey");
	window.plugins.DataBaseHelper.select(Qry, function(result) {
		if (result.array != undefined) {
			console.log(JSON.stringify(result.array));
			alert('promoamount');
		}
	}, function() {
		console.warn("Error calling plugin");
	});
}

function getCollectionInfo() {
	data = {};
	var Qry = "SELECT cm.customercode,customername,customeraddress1 as address,typecode,amount,bankname,checkdate,checknumber,invoicenumber,comments,printstatus,(SELECT CASE cm.messagekey5 WHEN 0 THEN '' ELSE messageline1 || messageline2 || messageline3 || messageline4 END FROM customermessages WHERE messagekey = messagekey5) AS invheadermsg,IFNULL(excesspayment,'') AS excesspayment FROM arheader arh JOIN customermaster cm ON cm.customercode = arh.customercode JOIN cashcheckdetail ccd ON ccd.visitkey = arh.visitkey LEFT JOIN bankmaster bm ON bm.bankcode = ccd.bankcode WHERE arh.visitkey = "
			+ sessionStorage.getItem("VisitKey");
	console.log(Qry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result.length > 0) {
				customercode = (result[0][0]).toString();
				customername = (result[0][1]).toString();
				customeraddress = (result[0][2]).toString();
				data["PaymentType"] = (result[0][3]).toString();
				// var amount = (result[0][4]).toString();
				var amount = eval(parseFloat(result[0][4])).toFixed(
						decimalplace);
				data["Cash"] = {
					"Amount" : amount
				};
				if (result[0][6] != '') {
					var d = new Date(result[0][6]);
					result[0][6] = (d.getDate() + "/" + (d.getMonth() + 1)
							+ "/" + d.getFullYear());
				}
				data["Cheque"] = [ {
					"Cheque Date" : (result[0][6]).toString(),
					"Cheque No" : (result[0][7]).toString(),
					"Bank" : result[0][5].toString(),
					"Amount" : (amount).toString()
				} ];
				invoicenumber = (result[0][8]).toString();
				comments = result[0][9];
				printstatus = result[0][10];
				invheadermsg = result[0][11];
				excesspayment = result[0][12];
				getCollection();
			}
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				result = $.map(result.array, function(item, index) {
					return [ [ item.customercode, item.customername,
							item.address, item.typecode, item.amount,
							item.bankname, item.checkdate, item.checknumber,
							item.invoicenumber, item.comments,
							item.printstatus, item.invheadermsg,
							item.excesspayment ] ];
				});
				customercode = (result[0][0]).toString();
				customername = (result[0][1]).toString();
				customeraddress = (result[0][2]).toString();
				data["PaymentType"] = (result[0][3]).toString();
				// var amount = (result[0][4]).toString();
				var amount = eval(parseFloat(result[0][4])).toFixed(
						decimalplace);
				data["Cash"] = {
					"Amount" : amount
				};
				if (result[0][6] != '') {
					var d = new Date(result[0][6]);
					result[0][6] = (d.getDate() + "/" + (d.getMonth() + 1)
							+ "/" + d.getFullYear());
				}
				data["Cheque"] = [ {
					"Cheque Date" : (result[0][6]).toString(),
					"Cheque No" : (result[0][7]).toString(),
					"Bank" : result[0][5].toString(),
					"Amount" : (amount).toString()
				} ];
				invoicenumber = (result[0][8]).toString();
				comments = result[0][9];
				printstatus = result[0][10];
				invheadermsg = result[0][11];
				excesspayment = result[0][12];
				getCollection();
			}
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function getCollection() {
	getroutedate();
	// var Qry = "SELECT ard.invoicenumber AS
	// invoicenumber,STRFTIME('%d/%m/%Y',invoicedate) AS
	// invoicedate,ard.totalinvoiceamount,ard.amountpaid,(ard.invoicebalance) AS
	// invoicebalance FROM ardetail ard JOIN arheader arh ON ard.transactionkey
	// = arh.transactionkey WHERE arh.invoicenumber = " + invoicenumber;
	var Qry = "SELECT ard.invoicenumber AS invoicenumber,(SELECT STRFTIME('%d/%m/%Y',transactiondate) FROM customerinvoice WHERE invoicenumber=ard.invoicenumber)  AS invoicedate,ard.totalinvoiceamount,ard.amountpaid,(ard.invoicebalance) AS invoicebalance FROM ardetail ard JOIN arheader arh ON ard.transactionkey = arh.transactionkey WHERE arh.invoicenumber = "
			+ invoicenumber;
	console.log(Qry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result.length <= 0)
				result = [];
			ProcessCollection(result);
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				result = $.map(result.array, function(item, index) {
					return [ [ item.invoicenumber, item.invoicedate,
							item.totalinvoiceamount, item.amountpaid,
							item.invoicebalance ] ];
				});
			} else
				result = [];

			ProcessCollection(result);
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function ProcessCollection(result) {
	getCommonData();
	data["RECEIPT"] = invoicenumber;
	data["CUSTOMER"] = customercode + "-" + customername;
	data["ADDRESS"] = customeraddress;
	if (comments == 0 || comments == "0")
		comments = "";
	data["comments"] = unescape(comments);
	data["HEADERS"] = [ "Invoice#", "Invoice Date", "Invoice Amount",
			"Amount Paid", "Invoice Balance" ];
	var totalamount = 0;
	for (i = 0; i < result.length; i++) {
		for (j = 0; j < result[i].length; j++) {
			if (j == 0) {
				result[i][j] = parseInt(eval(result[i][j]));
				result[i][j] = (result[i][j]).toString();
			}
			if (j == 4 || j == 7 || j == 8 || j == 3 || j == 2) {
				if (result[i][j] != "")
					result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
			}

			if (j == 3)
				totalamount += eval(result[i][j]);
		}
	}
	if (isNaN(totalamount))
		totalamount = 0;
	totalamount = eval(parseFloat(totalamount)).toFixed(decimalplace);
	data["TOTAL"] = {
		"Amount Paid" : totalamount
	};
	data["printstatus"] = getPrintStatus();
	if (invheadermsg == 0 || invheadermsg == "0")
		invheadermsg = "";
	data["invheadermsg"] = invheadermsg;
	if (excesspayment == 0 || excesspayment == "0")
		excesspayment = "";
	data["expayment"] = excesspayment;
	data["data"] = result;
	console.log(JSON.stringify(data));
	PrintReport(ReportName.Collection, data);
}

function QuantityTotal(obj, qtykey, Qty) {
	var oldqty = obj[qtykey].toString().split("/");
	var currqty = Qty.toString().split("/");
	var newqty = (eval(oldqty[0]) + eval(currqty[0])) + "/"
			+ (eval(oldqty[1]) + eval(currqty[1]))
	obj[qtykey] = newqty;
	/*
	 * console.log("showing qty....."); console.log(oldqty[0] + "&" + oldqty[1] + " : " +
	 * currqty[0] + "&" + currqty[1] + " : " + newqty);
	 */
}
function QTotal(obj, qtykey, Qty) {

	try {
		var oldqty = obj[qtykey];
		var currqty = Qty;
		var newqty = (eval(oldqty) + eval(currqty));
		obj[qtykey] = newqty;

	} catch (ex) {
		alert(ex);
	}
	/*
	 * console.log("showing qty....."); console.log(oldqty[0] + "&" + oldqty[1] + " : " +
	 * currqty[0] + "&" + currqty[1] + " : " + newqty);
	 */
}
function getCommonData() {
	// alert(sessionStorage.getItem("contactno"));
	var d = new Date();
	var dt = (d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear());
	data["companyname"] = sessionStorage.getItem("CompanyName");
	data["companyaddress"] = sessionStorage.getItem("CompanyAddress");
	data["contactinfo"] = sessionStorage.getItem("ContactInfo");
	data["companylogo"] = "/images/logo.jpg";
	data["addresssetting"] = "1";
	data["displayupc"] = "1"; // For want to display UPC or not in sales
								// report
	data["ROUTE"] = sessionStorage.getItem("RouteCode") + "-"
			+ sessionStorage.getItem("RouteName"); // "110-NEWMTS";
	data["SALESMAN"] = sessionStorage.getItem("SalesmanCode") + "-"
			+ sessionStorage.getItem("SalesmanName"); // "104-NEW MTS
														// SALESMAN";
	data["CONTACTNO"] = sessionStorage.getItem("contactno");
	data["DOC DATE"] = dt // "12/03/2012";
	data["DATE"] = dt;
	data["TIME"] = getTime(); // (d.getHours() + ":" + d.getMinutes());
	// data["DOCUMENT NO"] = "1000000021";
	// data["TRIP START DATE"] = dt;
	if (tranferflag == 0)
		data["TO ROUTE"] = sessionStorage.getItem("RouteCode") + "-"
				+ sessionStorage.getItem("RouteName");
}
function getroutedate() {
	var qry = "select strftime('%d/%m/%Y',routestartdate) as routestartdate from startendday where routekey="
			+ sessionStorage.getItem("RouteKey");
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			var startdate = result[0][0];
			data["TRIP START DATE"] = startdate;

		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ qry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(qry, function(result) {
			if (result.array != undefined) {
				result = $.map(result.array, function(item, index) {
					return [ [ item.routestartdate ] ];
				});
				var startdate = result[0][0];
				data["TRIP START DATE"] = startdate;
			}

		}, function() {
			console.warn("Error calling plugin");
		});
	}
}
function getTime() {
	var d = new Date();
	var H = d.getHours();
	var M = d.getMinutes();
	H = (H < 9) ? ('0' + H) : H;
	M = (M < 9) ? ('0' + M) : M;
	return (H + ":" + M);
}

function getPrintStatus() {
	if (printstatus == 0 || printstatus == 2)
		return "ORIGINAL COPY";
	else if (printstatus == 1)
		return "DRAFT COPY";
	else
		return "N/A";
}

// ---------Start Van Stock By Sujitv 9/1/2014
function getVanInfo() {
	var Qry = "SELECT documentnumber,printstatus FROM inventorytransactionheader WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 1 AND istemp = 'false')";
	console.log(Qry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result.length > 0) {
				documentnumber = parseInt(eval(result[0][0]));
				printstatus = result[0][1];
			}
			PrintVanStock();
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				documentnumber = parseInt(result.array[0].documentnumber);
				printstatus = result.array[0].printstatus;
			}
			PrintVanStock();
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function PrintVanStock() {
	// alert("Test");
	getroutedate();
	var routekey = sessionStorage.getItem("RouteKey");
	// var
	// availqty="ifnull(inventorysummarydetail.loadqty,0)+ifnull(inventorysummarydetail.loadadjustqty,0)+ifnull(inventorysummarydetail.beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0)";
	// Qry = "SELECT DISTINCT CASE WHEN '" + sessionStorage.getItem("CheckCode")
	// + "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END
	// AS 'itemcode',itemdescription AS
	// 'description',(IFNULL(CAST((loadqty/unitspercase) AS INT),0) || '/' ||
	// IFNULL(CAST((loadqty%unitspercase) AS INT),0)) AS
	// 'loadqty',(IFNULL(CAST((loadadjustqty/unitspercase) AS INT),0) || '/' ||
	// IFNULL(CAST((loadadjustqty%unitspercase) AS INT),0)) AS 'soldqty',
	// (CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))/unitspercase)
	// AS INT) || '/' ||
	// CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))%unitspercase)
	// AS INT)) AS 'avlqty' FROM inventorytransactionheader invth JOIN
	// inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey
	// JOIN inventorysummarydetail invsum ON invsum.itemcode = invtd.itemcode
	// JOIN itemmaster im ON im.actualitemcode = invsum.itemcode WHERE
	// invth.loadnumber=" + loadperiodnumber+" or invth.loadnumber=0" ;
	// Qry="select CASE WHEN '" + sessionStorage.getItem("CheckCode") + "' =
	// 'alternatecode' THEN itemmaster.alternatecode ELSE
	// itemmaster.actualitemcode END as itemcode,CASE WHEN '" +
	// sessionStorage.getItem("Language") + "' = 'en' THEN itemdescription ELSE
	// arbitemdescription END AS
	// 'description',(IFNULL(CAST((("+availqty+")/unitspercase) AS INT),0) ||
	// '/' || IFNULL(CAST((("+availqty+")%unitspercase) AS INT),0)) AS
	// 'avlqty',caseprice,defaultsalesprice,unitspercase as
	// upc,itemmaster.actualitemcode from itemmaster left join
	// inventorysummarydetail on
	// itemmaster.actualitemcode=inventorysummarydetail.itemcode where
	// routekey="+routekey+" and ("+availqty+") > 0 order by CASE
	// printsequenceroute WHEN 0 THEN 100000 ELSE printsequenceroute END";
	var Qry = "SELECT itemcode,description,(CAST(loadedqty/unitspercase AS INT) || '/' || CAST(loadedqty%unitspercase AS INT)) AS loadedqty,(CAST(transferqty/unitspercase AS INT) || '/' || CAST(transferqty%unitspercase AS INT)) AS transferqty,(CAST(invoicedqty/unitspercase AS INT) || '/' || CAST(invoicedqty%unitspercase AS INT)) AS saleqty ,(CAST(returnqty/unitspercase AS INT) || '/' || CAST(returnqty%unitspercase AS INT)) as returnqty,(CAST(vanstock /unitspercase AS INT) || '/' || CAST(vanstock %unitspercase AS INT)) AS vanstock FROM ( SELECT CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription AS description,unitspercase,IFNULL((IFNULL(isd.beginstockqty,0)+IFNULL(isd.loadqty,0)),0) AS loadedqty,IFNULL((IFNULL(isd.loadaddqty,0) - IFNULL(isd.loadcutqty,0)),0) AS transferqty,IFNULL((IFNULL(isd.saleqty,0) + IFNULL(isd.freesampleqty,0)),0) AS invoicedqty,IFNULL((IFNULL(isd.returnqty,0) + IFNULL(isd.returnfreeqty,0)),0) AS returnqty,IFNULL((IFNULL(isd.beginstockqty,0) + IFNULL(isd.loadqty,0) + IFNULL(isd.loadaddqty,0) + IFNULL(isd.returnqty,0) + IFNULL(isd.returnfreeqty,0)),0) -IFNULL((IFNULL(isd.loadcutqty,0) + IFNULL(isd.saleqty,0) + IFNULL(isd.freesampleqty,0)),0) AS vanstock FROM inventorysummarydetail isd INNER JOIN itemmaster im ON im.actualitemcode = isd.itemcode where routekey = "
			+ sessionStorage.getItem("RouteKey") + ") order by itemcode";
	console.log(Qry);
	if (platform == "iPad") {
		Cordova.exec(function(result) {
			if (result.length < 0)
				result = []
			ProcessVanStock(result);
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == "Android") {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				result = $.map(result.array, function(item, index) {
					// return
					// [[item.itemcode,item.description,item.upc,item.avlqty,item.caseprice,item.defaultsalesprice]];
					return [ [ item.itemcode, item.description, item.loadedqty,
							item.transferqty, item.saleqty, item.returnqty,
							item.vanstock ] ];

				});
			} else
				result = [];
			ProcessVanStock(result);
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function ProcessVanStock(result) {
	// alert(result);
	/*
	 * var Headers = ["Item#", "Description", "UPC", "Available Qty", "Case
	 * Price", "Unit Price"] var Total = {"Available Qty": "0/0"}
	 */
	var Headers = [ "Item#", "Description", "Loaded Qty", "Transfer Qty",
			"Sale Qty", "Return Qty", "Truck Stock" ];
	var Total = {
		"Loaded Qty" : "0/0",
		"Transfer Qty" : "0/0",
		"Sale Qty" : "0/0",
		"Return Qty" : "0/0",
		"Truck Stock" : "0/0"
	};
	for (i = 0; i < result.length; i++) {
		for (j = 0; j < result[i].length; j++) {
			if (j == 0) {
				if (!isNaN(result[i][j]))
					result[i][j] = parseInt(result[i][j]);
				result[i][j] = (result[i][j]).toString();
			}
			if (j >= 2 && j <= 6) {
				var qtykey = "";
				if (j == 2)
					qtykey = "Loaded Qty";
				if (j == 3)
					qtykey = "Transfer Qty";
				if (j == 4)
					qtykey = "Sale Qty";
				if (j == 5)
					qtykey = "Return Qty";
				if (j == 6)
					qtykey = "Truck Stock";

				QuantityTotal(Total, qtykey, result[i][j]);

			}

		}
	}
	// data["Load Number"] = loadperiodnumber.toString();
	// data["DOCUMENT NO"] = documentnumber;
	data["HEADERS"] = Headers;
	data["TOTAL"] = [ Total ];
	// data["printstatus"] = getPrintStatus();
	data["data"] = result;
	getCommonData();
	console.log(JSON.stringify(data));
	// alert(ReportName.VanStock);
	PrintReport(ReportName.VanStock, data);
}

// ---------End Van Stock
// --------------Start Load Request
// ---------Start Van Stock By Sujitv 9/1/2014
function getRequestInfo() {
	var Qry = "SELECT documentnumber,printstatus,requestdate FROM inventorytransactionheader WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 4 AND istemp = 'false')";
	console.log(Qry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result.length > 0) {
				documentnumber = parseInt(eval(result[0][0]));
				printstatus = result[0][1];
				requestdate = result[0][2];
			}
			PrintLoadReqValue();
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				documentnumber = parseInt(result.array[0].documentnumber);
				printstatus = result.array[0].printstatus;
				requestdate = result.array[0].requestdate;
			}
			var mystring = requestdate;
			var splits = mystring.split("-");
			/*
			 * var month = splits[1].length > 1 ? splits[1] : '0' + splits[1];
			 * var day = splits[2].length > 1 ? splits[2] : '0' + splits[2]; var
			 * year = splits[0];
			 */
			// alert(splits[0]);
			// alert(splits[1]);
			// alert(splits[2]);
			// rdate =
			//
			var day = splits[2];
			var month = splits[1];
			var year = splits[0];
			var dt1 = day + "/" + month + "/" + year;
			data["Requestdate"] = dt1;
			PrintLoadReqValue();

		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

//
function PrintLoadReqValue() {

	var Qry = "SELECT  itemcode,CAST(((CAST((IFNULL((invtd.quantity)/unitspercase, 0)) AS INT) * caseprice) + (IFNULL((invtd.quantity) % unitspercase, 0) * defaultsalesprice)) AS FLOAT )as netvalue FROM inventorytransactionheader invth JOIN inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey JOIN itemmaster im ON im.actualitemcode = invtd.itemcode WHERE invth.transactiontype = 4 AND invth.detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 4 AND istemp = 'false')";
	console.log(Qry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result.length <= 0)
				result = [];

		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == 'Android') {
		var netvalue = 0;
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				result = $.map(result.array, function(item, index) {
					return [ [ item.itemcode, item.netvalue ] ];
				});
				for (i = 0; i < result.length; i++) {
					for (j = 0; j < result[i].length; j++) {
						if (j == 1) {
							result[i][j] = (eval(result[i][j]))
									.toFixed(decimalplace);

							netvalue = (eval(netvalue) + eval(result[i][j]))
									.toFixed(decimalplace);

						}

					}
				}
				data["netvalue"] = netvalue;
				PrintRequestStock();
			} else
				result = [];

		}, function() {
			console.warn("Error calling plugin");
		});
	}
}
//
function PrintRequestStock() {
	// alert("Test");
	getroutedate();
	var routekey = sessionStorage.getItem("RouteKey");
	// var
	// availqty="ifnull(inventorysummarydetail.loadqty,0)+ifnull(inventorysummarydetail.loadadjustqty,0)+ifnull(inventorysummarydetail.beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0)";
	// Qry = "SELECT DISTINCT CASE WHEN '" + sessionStorage.getItem("CheckCode")
	// + "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END
	// AS 'itemcode',itemdescription AS
	// 'description',(IFNULL(CAST((loadqty/unitspercase) AS INT),0) || '/' ||
	// IFNULL(CAST((loadqty%unitspercase) AS INT),0)) AS
	// 'loadqty',(IFNULL(CAST((loadadjustqty/unitspercase) AS INT),0) || '/' ||
	// IFNULL(CAST((loadadjustqty%unitspercase) AS INT),0)) AS 'soldqty',
	// (CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))/unitspercase)
	// AS INT) || '/' ||
	// CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))%unitspercase)
	// AS INT)) AS 'avlqty' FROM inventorytransactionheader invth JOIN
	// inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey
	// JOIN inventorysummarydetail invsum ON invsum.itemcode = invtd.itemcode
	// JOIN itemmaster im ON im.actualitemcode = invsum.itemcode WHERE
	// invth.loadnumber=" + loadperiodnumber+" or invth.loadnumber=0" ;
	// Qry="select CASE WHEN '" + sessionStorage.getItem("CheckCode") + "' =
	// 'alternatecode' THEN itemmaster.alternatecode ELSE
	// itemmaster.actualitemcode END as itemcode,CASE WHEN '" +
	// sessionStorage.getItem("Language") + "' = 'en' THEN itemdescription ELSE
	// arbitemdescription END AS
	// 'description',(IFNULL(CAST((("+availqty+")/unitspercase) AS INT),0) ||
	// '/' || IFNULL(CAST((("+availqty+")%unitspercase) AS INT),0)) AS
	// 'avlqty',caseprice,defaultsalesprice,unitspercase as
	// upc,itemmaster.actualitemcode from itemmaster left join
	// inventorysummarydetail on
	// itemmaster.actualitemcode=inventorysummarydetail.itemcode where
	// routekey="+routekey+" and ("+availqty+") > 0 order by CASE
	// printsequenceroute WHEN 0 THEN 100000 ELSE printsequenceroute END";
	var Qry = "SELECT CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription AS description,unitspercase,caseprice,defaultsalesprice,(CAST(invtd.quantity/unitspercase AS INT) || '/' || CAST(invtd.quantity%unitspercase AS INT)) AS reqstockqty FROM inventorytransactionheader invth JOIN inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey JOIN itemmaster im ON im.actualitemcode = invtd.itemcode WHERE invth.transactiontype = 4 AND invth.detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 4 AND istemp = 'false')";
	console.log(Qry);
	if (platform == "iPad") {
		Cordova.exec(function(result) {
			if (result.length < 0)
				result = []
			ProcessRequestStock(result);
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == "Android") {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				result = $.map(result.array, function(item, index) {
					// return
					// [[item.itemcode,item.description,item.upc,item.avlqty,item.caseprice,item.defaultsalesprice]];
					return [ [ item.itemcode, item.description,
							item.unitspercase, item.caseprice,
							item.defaultsalesprice, item.reqstockqty ] ];

				});
			} else
				result = [];
			ProcessRequestStock(result);
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function ProcessRequestStock(result) {

	var Headers = [ "Item#", "Description", "UPC", "Case Price", "Unit Price",
			"Requested Qty" ];
	var Total = {
		"Requested Qty" : "0/0"
	};
	for (i = 0; i < result.length; i++) {

		for (j = 0; j < result[i].length; j++) {
			if (j == 0) {
				if (!isNaN(result[i][j]))
					result[i][j] = parseInt(result[i][j]);
				result[i][j] = (result[i][j]).toString();
			}
			if (j == 3 || j == 4) {
				if (result[i][j] != "")
					result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
			}
			if (j == 5) {
				var qtykey = "";
				// if(j == 2)
				qtykey = "Requested Qty";

				QuantityTotal(Total, qtykey, result[i][j]);

			}

		}
	}
	// data["Load Number"] = loadperiodnumber.toString();
	data["DOCUMENT NO"] = documentnumber;
	// var date = Date.parse(requestdate);
	// var sDate = Date.parse(requestdate, "MM/dd/yyyy");
	// data["Requestdate"] = requestdate;
	data["HEADERS"] = Headers;
	data["TOTAL"] = [ Total ];

	data["printstatus"] = getPrintStatus();
	data["data"] = result;
	getCommonData();
	console.log(JSON.stringify(data));
	// alert(ReportName.VanStock);
	PrintReport(ReportName.LoadRequst, data);
}

// ---------End Van Stock
// -------------------End Load Request

// -----Checking Paired Devices-------

// ----End Update Route master

// ----------End---------------
function PrintReport(report_name, dic) {
	// alert("test");
	var printdevice = true;
	if (printdevice) {
		// dic = [{"data" : dic, "name" : report_name}];
		if (platform == "iPad") {
			Cordova.exec(function nativePluginResultHandler(result) {
				// alert("SUCCESS: \r\n"+result );
				PrintDone();
			}, function nativePluginErrorHandler(error) {
				// alert("ERROR: \r\n"+error );
				PrintDone();
			}, "PrintClass", "nativeFunction", [ [ [ {
				"data" : dic,
				"name" : report_name
			} ] ] ]);
		} else {
			// alert(printval);
			// alert(report_name);
			// Start
			
			if (printval == '' || printval == 0)
				getdecimal();
			if (printval == 3) {

				window.plugins.DotmatHelper.print([ [ {
					"mainArr" : dic,
					"name" : report_name
				} ] ], function(data) {
					// alert(data.status);
					// alert(data.isconnected);
					if (data.status && data.isconnected == 0)
						PrintDone(1);
					else {
						alert("Error In Printing");
						PrintDone(2);
					}
					console.warn("SUCCESS");
				}, function() {
					navigator.notification.alert("Error In Printing");
					PrintDone(2);
					console.warn("Error");
				});

			} else if (printval == 2) {
				// alert(data.status);
				// alert(data.isconnected);
				window.plugins.DotmatHelper.print([ [ {
					"mainArr" : dic,
					"name" : report_name
				} ] ], function(data) {
					if (data.status && data.isconnected == 0)
						PrintDone(1);
					else {
						alert("Error In Printing");
						PrintDone(2);
					}
					console.warn("SUCCESS");
				}, function() {
					navigator.notification.alert("Error In Printing");
					PrintDone(2);
					console.warn("Error");
				});
			} else if (printval == 1) {

				window.plugins.ZebraHelper.print([ [ {
					"mainArr" : dic,
					"name" : report_name
				} ] ], function(data) {

					// alert(data.status);
					// alert(data.isconnected);
					if (data.status && data.isconnected == 0)
						PrintDone(1);
					else {
						alert("Error In Printing");
						PrintDone(2);
					}
					console.warn("SUCCESS");
				}, function() {
					navigator.notification.alert("Error In Printing");
					PrintDone(2);
					console.warn("Error");
				});
			}
			// End
			/*
			 * console.log(JSON.stringify([{"mainArr" : dic, "name" :
			 * report_name}])); window.plugins.ZebraHelper.print([[{"mainArr" :
			 * dic, "name" : report_name}]],function(data) { if(data.status &&
			 * data.isconnected == 0) PrintDone(); else { alert("Error In
			 * Printing"); PrintDone(); } console.warn("SUCCESS"); }, function() {
			 * navigator.notification.alert("Error In Printing"); PrintDone();
			 * console.warn("Error"); });
			 */
		}
	} else
		PrintDone();
}
