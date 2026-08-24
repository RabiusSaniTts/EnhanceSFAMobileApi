var platform = sessionStorage.getItem("platform");
var data = {};
var ArrPrint = [];
var ArrMultiPrint = [];
var customercode = "";
var customername = "";
var alternatecode = "";
var customeraddress = "";
var customeradd1 = "";
var customeradd2 = "";
var customeradd3 = "";
var paymenttype = "";
var invoicenumber = "";
var documentnumber = "";
var totalpromoamount = 0;
var customerOutlet = 0;
var totalinvoiceamount = 0;
var itempromoamount = 0;
var returnpromoamount = 0;
var headerdiscounttaxamt = 0;
var printoutletitemcode = 0;
var headerAmount = 0;
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
var splitfree = 0;
var manualfreediscount = 0;
var totalfinalamount = 0;
var printanother = false;
var invoicepriceprint = 1;
var printbarcode = 1;
var arbcustomeraddress = "";
var printtax = 0;
var applytax = 0;
var taxregistrationnumber = 0;
var totalOrdVat = 0;
var totalOrdVat = 0;
var amountBeforeVat = 0;

var ReportName = new Object();
ReportName.OpeningLoad = "LoadSummary";
ReportName.LoadReport = "LoadSummary2";
ReportName.LoadTransfer = "Transfer_In";
ReportName.EndInventory = "EndInventory";
ReportName.Sales = "Sales";
ReportName.Order = "Order";
ReportName.Collection = "Collection";
ReportName.Deposit = "Deposit";
ReportName.SalesReport = "SalesReport";
ReportName.SalesReport = "RouteActivity";
ReportName.VanStock = "VanStock";
ReportName.LoadRequst = "LoadRequst";
ReportName.AdvancePayment = "AdvancePayment";
ReportName.Deduction = "Deduction";
ReportName.WarehouseAndLoadDetails = "WarehouseAndLoadDetails";
// ReportName.Order = "Order";
// Added for load transfer draft print
var isDraftPrint = false;
var printval = sessionStorage.getItem("printerval");
if (printval == '' || printval == 0)
	getdecimal();

function getdecimal()
{
	platform = sessionStorage.getItem("platform");
	var qry = "SELECT currencymaster.decimalplaces,routemaster.routeprinter FROM routemaster INNER JOIN currencymaster ON routemaster.amountdecimaldigits = currencymaster.currencycode WHERE routemaster.routecode = "
			+ sessionStorage.getItem("RouteCode");

	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			if (result.length > 0)
			{
				decimalplace = result[0][0];
				printval = result[0][1];
				sessionStorage.setItem("decimalplace", result[0][0]);
				sessionStorage.setItem("printerval", result[0][1]);// ADded for
				// printer
				// value by
				// mirnah

			} else
			{
				decimalplace = 0;
				printval = 0;
				sessionStorage.setItem("decimalplace", 0);
				sessionStorage.setItem("printerval", 0);// ADded for printer
				// value by mirnah
			}
		}, function(error)
		{
			alert("Error in getting setup : " + error);
		}, "PluginClass", "GetdataMethod", [qry]);
	} else if (platform == 'Android')
	{
		window.plugins.DataBaseHelper.select(qry, function(result)
		{

			if (result.array != undefined)
			{
				decimalplace = result.array[0].decimalplaces;
				printval = result.array[0].routeprinter;
				sessionStorage.setItem("decimalplace",
						result.array[0].decimalplaces);
				sessionStorage.setItem("printerval",
						result.array[0].routeprinter);// ADded for printer
				// value by mirnah
			} else
			{
				decimalplace = 0;
				printval = 0;
				sessionStorage.setItem("decimalplace", 0);
				sessionStorage.setItem("printerval", 0);// ADded for printer
				// value by mirnah
			}
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}
function getLoadInfo()
{
	var Qry = "SELECT documentnumber,printstatus FROM inventorytransactionheader WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 1 AND istemp = 'false')";
	console.log(Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			if (result.length > 0)
			{
				documentnumber = parseInt(eval(result[0][0]));
				printstatus = result[0][1];
			}
			PrintLoad();
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				documentnumber = parseInt(result.array[0].documentnumber);
				printstatus = result.array[0].printstatus;
			}
			data["DOCUMENT NO"] = documentnumber;
			PrintLoad();
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function PrintLoad()
{
	loadperiodnumber = localStorage.getItem("LoadPeriod");
	var Qry = ""
	data["Load Number"] = loadperiodnumber.toString();
	Printvalue()
	/*
	 * if(loadperiodnumber.toString() == "1") { //Print Load 1 With Opening
	 * Stock And Adjust Qty PrintOpeningLoad(); } else { PrintCurrentLoad(); }
	 */
}
//
function Printvalue()
{
	// alert("tst");
	// var QryInv = "SELECT loadnumber,documentnumber,printstatus FROM
	// inventorytransactionheader WHERE hhcdocumentnumber=" + invoicenumber;
	// var QryInv = "SELECT DISTINCT CASE WHEN '"
	// + sessionStorage.getItem("CheckCode")
	// + "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END
	// AS 'itemcode',CAST((((IFNULL(beginstockqty/im.unitspercase, 0)) *
	// im.caseprice) + (IFNULL(beginstockqty % im.unitspercase, 0) *
	// im.defaultsalesprice)) AS INT )as
	// openingvalue,CAST((((IFNULL(loadqty/im.unitspercase, 0)) * im.caseprice)
	// + (IFNULL(loadqty % im.unitspercase, 0) * im.defaultsalesprice)) AS INT
	// )as loadvalue,CAST((((IFNULL(loadadjustqty/im.unitspercase, 0)) *
	// im.caseprice) + (IFNULL(loadadjustqty % im.unitspercase, 0) *
	// im.defaultsalesprice)) AS INT )as
	// adjustqtyvalue,CAST(((CAST((IFNULL((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))/im.unitspercase,
	// 0)) AS INT) * im.caseprice) +
	// (IFNULL((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))
	// % im.unitspercase, 0) * im.defaultsalesprice)) AS FLOAT )as netvalue FROM
	// inventorytransactionheader invth JOIN inventorytransactiondetail invtd ON
	// invtd.detailkey = invth.detailkey JOIN inventorysummarydetail invsum ON
	// invsum.itemcode = invtd.itemcode JOIN itemmaster im ON im.actualitemcode
	// = invsum.itemcode WHERE invth.loadnumber="
	// + loadperiodnumber + " or invth.loadnumber=0 order by itemcode"
	var QryInv = "SELECT DISTINCT im.actualitemcode,(CAST((COALESCE(beginstockqty, 0)/im.unitspercase) AS INT) * im.caseprice) + ((COALESCE(beginstockqty, 0) % im.unitspercase) * im.defaultsalesprice) AS openingvalue,(CAST((COALESCE(quantity, 0)/im.unitspercase) AS INT) * im.caseprice) + ((COALESCE(quantity, 0) % im.unitspercase) * im.defaultsalesprice) AS loadvalue,(CAST((COALESCE(loadadjustqty, 0)/im.unitspercase) AS INT) * im.caseprice) + ((COALESCE(loadadjustqty, 0) % im.unitspercase) * im.defaultsalesprice) AS adjustqtyvalue,((CAST((COALESCE(beginstockqty, 0)+COALESCE(loadqty, 0)+COALESCE(loadadjustqty, 0)) AS INT) / im.unitspercase)* im.caseprice) + (((COALESCE(beginstockqty, 0)+COALESCE(loadqty, 0)+COALESCE(loadadjustqty, 0)) % im.unitspercase)* im.defaultsalesprice) AS netvalue FROM inventorytransactionheader invth JOIN inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey JOIN inventorysummarydetail invsum ON invsum.itemcode = invtd.itemcode JOIN itemmaster im ON im.actualitemcode = invsum.itemcode WHERE invth.loadnumber="
			+ loadperiodnumber + "  order by actualitemcode";

	if (platform == "iPad")
	{
		Cordova.exec(function(result)
		{
			if (result.length > 0)
			{
				loadperiodnumber = result[0][0];
				documentnumber = parseInt(eval(result[0][1]));
				printstatus = result[0][2];

				if (loadperiodnumber.toString() == "1")
				{
					// Print Load 1 With Opening Stock And Adjust Qty
					PrintOpeningLoad();
				} else
				{
					PrintCurrentLoad();
				}
			}
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [QryInv]);
	} else if (platform == "Android")
	{
		var openingvalue = 0;
		var loadvalue = 0;
		var adjustvalue = 0;
		var netvalue = 0;
		window.plugins.DataBaseHelper
				.select(
						QryInv,
						function(result)
						{
							if (result.array != undefined)
							{
								try
								{
									result = $.map(result.array, function(item,
											index)
									{
										return [[item.actualitemcode,
												item.openingvalue,
												item.loadvalue,
												item.adjustqtyvalue,
												item.netvalue]];
									});
									for (i = 0; i < result.length; i++)
									{
										for (j = 0; j < result[i].length; j++)
										{

											if (j == 4)
											{
												result[i][j] = (eval(result[i][j]))
														.toFixed(decimalplace);

												netvalue = (eval(netvalue) + eval(result[i][j]))
														.toFixed(decimalplace);
											}

											if (j == 1)
											{
												result[i][j] = (eval(result[i][1]))
														.toFixed(decimalplace);
												openingvalue = (eval(openingvalue) + eval(result[i][j]))
														.toFixed(decimalplace);

											}
											if (j == 2)
											{
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

									if (loadperiodnumber.toString() == "1")
									{
										// Print Load 1 With Opening Stock And
										// Adjust Qty
										PrintOpeningLoad();
									} else
									{
										PrintCurrentLoad();
									}
								} catch (ex)
								{
									alert(ex);
								}
							}
						}, function()
						{
							console.warn("Error calling plugin");
						});
	}
}
//
function PrintOpeningLoad()
{
	// alert("test");
	// getroutedate();
	// Qry = "SELECT DISTINCT CASE WHEN '"+ sessionStorage.getItem("CheckCode")+
	// "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS
	// 'itemcode',itemdescription AS 'description',im.unitspercase AS
	// UPC,(IFNULL(CAST((beginstockqty/unitspercase) AS INT),0) || '/' ||
	// IFNULL(CAST((beginstockqty%unitspercase) AS INT),0)) AS
	// 'openqty',(IFNULL(CAST((loadqty/unitspercase) AS INT),0) || '/' ||
	// IFNULL(CAST((loadqty%unitspercase) AS INT),0)) AS
	// 'loadqty',(IFNULL(CAST((loadadjustqty/unitspercase) AS INT),0) || '/' ||
	// IFNULL(CAST((loadadjustqty%unitspercase) AS INT),0)) AS 'adjustqty',
	// (CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))/unitspercase)
	// AS INT) || '/' ||
	// CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))%unitspercase)
	// AS INT)) AS 'netqty',((CAST((COALESCE(beginstockqty, 0)+COALESCE(loadqty,
	// 0)+COALESCE(loadadjustqty, 0)) AS INT) / im.unitspercase)* im.caseprice)
	// + (((COALESCE(beginstockqty, 0)+COALESCE(loadqty,
	// 0)+COALESCE(loadadjustqty, 0)) % im.unitspercase)* im.defaultsalesprice)
	// AS 'netvalue' FROM inventorytransactionheader invth JOIN
	// inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey
	// JOIN inventorysummarydetail invsum ON invsum.itemcode = invtd.itemcode
	// JOIN itemmaster im ON im.actualitemcode = invsum.itemcode WHERE
	// invth.loadnumber="+ loadperiodnumber + " or invth.loadnumber=0 order by
	// itemcode";
	// Qry = "SELECT DISTINCT CASE WHEN '"+ sessionStorage.getItem("CheckCode")+
	// "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS
	// 'itemcode',itemdescription AS 'description',im.unitspercase AS
	// UPC,(IFNULL(CAST((beginstockqty/unitspercase) AS INT),0) || '/' ||
	// IFNULL(CAST((beginstockqty%unitspercase) AS INT),0)) AS
	// 'openqty',(IFNULL(CAST((loadqty/unitspercase) AS INT),0) || '/' ||
	// IFNULL(CAST((loadqty%unitspercase) AS INT),0)) AS
	// 'loadqty',(IFNULL(CAST((loadadjustqty/unitspercase) AS INT),0) || '/' ||
	// IFNULL(CAST((loadadjustqty%unitspercase) AS INT),0)) AS 'adjustqty',
	// (CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))/unitspercase)
	// AS INT) || '/' ||
	// CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))%unitspercase)
	// AS INT)) AS 'netqty',((CAST(COALESCE(loadqty, 0) AS INT) /
	// im.unitspercase)* im.caseprice) + ((COALESCE(loadqty, 0) %
	// im.unitspercase)* im.defaultsalesprice) AS 'netvalue',0 as sl FROM
	// inventorytransactionheader invth JOIN inventorytransactiondetail invtd ON
	// invtd.detailkey = invth.detailkey JOIN inventorysummarydetail invsum ON
	// invsum.itemcode = invtd.itemcode JOIN itemmaster im ON im.actualitemcode
	// = invsum.itemcode WHERE invth.loadnumber="+ loadperiodnumber + " or
	// invth.loadnumber=0 order by itemcode";

	// Qry="SELECT DISTINCT CASE WHEN '"+ sessionStorage.getItem("CheckCode")+
	// "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS
	// 'itemcode',itemdescription AS 'description',im.unitspercase AS
	// UPC,(IFNULL(CAST((beginstockqty/unitspercase) AS INT),0) || '/' ||
	// IFNULL(CAST((beginstockqty%unitspercase) AS INT),0)) AS
	// 'openqty',(IFNULL(CAST((quantity/unitspercase) AS INT),0) || '/' ||
	// IFNULL(CAST((quantity%unitspercase) AS INT),0)) AS
	// 'loadqty',(IFNULL(CAST((loadadjustqty/unitspercase) AS INT),0) || '/' ||
	// IFNULL(CAST((loadadjustqty%unitspercase) AS INT),0)) AS 'adjustqty',
	// (CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))/unitspercase)
	// AS INT) || '/' ||
	// CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))%unitspercase)
	// AS INT)) AS 'netqty',((CAST(COALESCE(quantity, 0) AS INT) /
	// im.unitspercase)* im.caseprice) + ((COALESCE(quantity, 0) %
	// im.unitspercase)* im.defaultsalesprice) AS 'netvalue',0 as sl FROM
	// inventorytransactionheader invth JOIN inventorytransactiondetail invtd ON
	// invtd.detailkey = invth.detailkey JOIN inventorysummarydetail invsum ON
	// invsum.itemcode = invtd.itemcode JOIN itemmaster im ON im.actualitemcode
	// = invsum.itemcode WHERE invth.loadnumber="+ loadperiodnumber + " order by
	// itemcode"
	Qry = "SELECT DISTINCT CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',itemdescription AS 'description',arbitemshortdescription AS 'arbitemdescription',im.unitspercase AS UPC,CASE WHEN unitspercase=1 THEN 0 ||  '/' || IFNULL(CAST((beginstockqty) AS INT),0) ELSE (IFNULL(CAST((beginstockqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((beginstockqty%unitspercase) AS INT),0)) END AS 'openqty',CASE WHEN unitspercase=1 THEN (0 ||  '/' || IFNULL(CAST((quantity) AS INT),0)) ELSE (IFNULL(CAST((quantity/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((quantity%unitspercase) AS INT),0)) END AS 'loadqty',CASE WHEN unitspercase=1 THEN (0 ||  '/' || IFNULL(CAST((loadadjustqty) AS INT),0)) ELSE (IFNULL(CAST((loadadjustqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((loadadjustqty%unitspercase) AS INT),0)) END AS 'adjustqty', CASE WHEN unitspercase=1 THEN 0 ||  '/' || CAST(IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0) AS INT) ELSE (CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))/unitspercase) AS INT) ||  '/' || CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))%unitspercase) AS INT)) END AS 'netqty',((CAST(COALESCE(quantity, 0) AS INT) / im.unitspercase)* im.caseprice) + ((COALESCE(quantity, 0) % im.unitspercase)* im.defaultsalesprice) AS 'netvalue',0 as sl FROM inventorytransactionheader invth JOIN inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey JOIN inventorysummarydetail invsum ON invsum.itemcode = invtd.itemcode JOIN itemmaster im ON im.actualitemcode = invsum.itemcode WHERE invth.loadnumber="
			+ loadperiodnumber + " order by itemcode";
	console.log("Load " + Qry);
	if (platform == "iPad")
	{
		Cordova.exec(function(result)
		{
			if (result.length < 0)
				result = []
			ProcessOpeningLoad(result);
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == "Android")
	{
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				// alert("test2");
				result = $.map(result.array, function(item, index)
				{
					return [[item.sl, item.itemcode, item.description,
							item.UPC, item.openqty, item.loadqty,
							item.adjustqty, item.netqty, item.netvalue,
							item.arbitemdescription]];

					/*
					 * return [ [item.sl,item.itemcode,
					 * item.description,item.UPC, item.openqty, item.loadqty,
					 * item.adjustqty, item.netqty,item.netvalue] ];
					 */
				});
			} else
				result = [];
			ProcessOpeningLoad(result);
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function ProcessOpeningLoad(result)
{
	// alert("Ts");

	var Headers = ["Sl#", "Item#", "Description", "UPC", "Open Qty",
			"Load Qty", "Adjust Qty", "Net Qty", "VALUE"];
	var Total = {
		"Open Qty" : "0/0",
		"Load Qty" : "0/0",
		"Adjust Qty" : "0/0",
		"Net Qty" : "0/0",
		"VALUE" : "0"
	}

	var TotalAmount = 0;
	for (i = 0; i < result.length; i++)
	{
		for (j = 0; j < result[i].length; j++)
		{
			if (j == 1)
			{

				if (sessionStorage.getItem("CheckCode") == 'ancode'
						&& !isNaN(result[i][j]))
					result[i][j] = parseInt(result[i][j], 10);

				result[i][j] = (result[i][j]).toString();

			}
			if (j >= 4 && j <= 7)
			{
				var qtykey = "";
				if (j == 4)
					qtykey = "Open Qty";
				if (j == 5)
					qtykey = "Load Qty";
				if (j == 6)
					qtykey = "Adjust Qty";
				if (j == 7)
					qtykey = "Net Qty";

				QuantityTotal(Total, qtykey, result[i][j]);
			}

			if (j == 8)
			{

				result[i][j] = eval(result[i][j]).toFixed(decimalplace);
				TotalAmount = (eval(TotalAmount) + eval(result[i][j]))
						.toFixed(decimalplace);
			}

		}
	}
	TotalAmount = eval(parseFloat(TotalAmount)).toFixed(decimalplace);
	Total["VALUE"] = TotalAmount.toString();
	data["HEADERS"] = Headers;
	data["TOTAL"] = [Total];
	data["printstatus"] = getPrintStatus();
	data["data"] = result;
	getCommonData();
	console.log("JSONDATA" + JSON.stringify(data));
	PrintReport(ReportName.OpeningLoad, data);
}

function PrintCurrentLoad()
{
	// getroutedate();
	// Qry = "SELECT DISTINCT CASE WHEN '"
	// + sessionStorage.getItem("CheckCode")
	// + "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END
	// AS 'itemcode',itemdescription AS 'description',im.unitspercase AS
	// UPC,(IFNULL(CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0)-IFNULL(invtd.quantity,0))/unitspercase)
	// AS INT),0) || '/' ||
	// IFNULL(CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0)-IFNULL(invtd.quantity,0))%unitspercase)
	// AS INT),0)) AS 'vanqty',(IFNULL(CAST((invtd.quantity/unitspercase) AS
	// INT),0) || '/' || IFNULL(CAST((invtd.quantity%unitspercase) AS INT),0))
	// AS
	// 'loadqty',(CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))/unitspercase)
	// AS INT) || '/' ||
	// CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))%unitspercase)
	// AS INT)) AS 'netqty',((CAST((COALESCE(beginstockqty, 0)+COALESCE(loadqty,
	// 0)+COALESCE(loadadjustqty, 0)) AS INT) / im.unitspercase)* im.caseprice)
	// + (((COALESCE(beginstockqty, 0)+COALESCE(loadqty,
	// 0)+COALESCE(loadadjustqty, 0)) % im.unitspercase)* im.defaultsalesprice)
	// AS 'netvalue' FROM inventorytransactionheader invth JOIN
	// inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey
	// JOIN inventorysummarydetail invsum ON invsum.itemcode = invtd.itemcode
	// and invsum.routekey = invtd.routekey JOIN itemmaster im ON
	// im.actualitemcode = invsum.itemcode WHERE invth.routekey="
	// + sessionStorage.getItem("RouteKey") + " and invth.loadnumber="
	// + loadperiodnumber + " order by itemcode";

	// Qry = "SELECT DISTINCT CASE WHEN '"
	// + sessionStorage.getItem("CheckCode")
	// + "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END
	// AS 'itemcode',CASE WHEN '" + sessionStorage.getItem("Language") + "' =
	// 'en' THEN itemdescription ELSE arbitemdescription END AS
	// 'description',im.unitspercase AS
	// UPC,(IFNULL(CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0)-IFNULL(invtd.quantity,0))/unitspercase)
	// AS INT),0) || '/' ||
	// IFNULL(CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0)-IFNULL(invtd.quantity,0))%unitspercase)
	// AS INT),0)) AS 'vanqty',(IFNULL(CAST((invtd.quantity/unitspercase) AS
	// INT),0) || '/' || IFNULL(CAST((invtd.quantity%unitspercase) AS INT),0))
	// AS
	// 'loadqty',(CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))/unitspercase)
	// AS INT) || '/' ||
	// CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))%unitspercase)
	// AS INT)) AS 'netqty',((CAST(COALESCE(invtd.quantity, 0) AS INT) /
	// im.unitspercase)* im.caseprice) + ((COALESCE(invtd.quantity, 0) %
	// im.unitspercase)* im.defaultsalesprice) AS 'netvalue',0 as sl FROM
	// inventorytransactionheader invth JOIN inventorytransactiondetail invtd ON
	// invtd.detailkey = invth.detailkey JOIN inventorysummarydetail invsum ON
	// invsum.itemcode = invtd.itemcode and invsum.routekey = invtd.routekey
	// JOIN itemmaster im ON im.actualitemcode = invsum.itemcode WHERE
	// invth.routekey="
	// + sessionStorage.getItem("RouteKey") + " and invth.loadnumber="
	// + loadperiodnumber + " order by itemcode";

	Qry = "SELECT DISTINCT CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',itemdescription AS 'description',arbitemshortdescription AS 'arbitemdescription',im.unitspercase AS UPC,CASE WHEN unitspercase=1 THEN (0 ||  '/' || IFNULL(CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0)-IFNULL(invtd.quantity,0))) AS INT),0)) ELSE (IFNULL(CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0)-IFNULL(invtd.quantity,0))/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0)-IFNULL(invtd.quantity,0))%unitspercase) AS INT),0)) END AS 'vanqty',CASE WHEN unitspercase=1 THEN (0 ||  '/' || IFNULL(CAST((invtd.quantity) AS INT),0)) ELSE (IFNULL(CAST((invtd.quantity/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((invtd.quantity%unitspercase) AS INT),0)) END AS 'loadqty',CASE WHEN unitspercase=1 THEN (0 ||  '/' || CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))) AS INT)) ELSE (CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))/unitspercase) AS INT) ||  '/' || CAST(((IFNULL(beginstockqty,0)+IFNULL(loadqty,0)+IFNULL(loadadjustqty,0))%unitspercase) AS INT)) END AS 'netqty',((CAST(COALESCE(invtd.quantity, 0) AS INT) / im.unitspercase)* im.caseprice) + ((COALESCE(invtd.quantity, 0) % im.unitspercase)* im.defaultsalesprice) AS 'netvalue',0 as sl FROM inventorytransactionheader invth JOIN inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey JOIN inventorysummarydetail invsum ON invsum.itemcode = invtd.itemcode and invsum.routekey = invtd.routekey JOIN itemmaster im ON im.actualitemcode = invsum.itemcode WHERE invth.routekey="
			+ sessionStorage.getItem("RouteKey") + " and invth.loadnumber="
			+ loadperiodnumber + " order by itemcode";
	console.log("Currentload" + Qry);
	if (platform == "iPad")
	{
		Cordova.exec(function(result)
		{
			if (result.length < 0)
				result = []
			ProcessCurrentLoad(result);
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == "Android")
	{
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				result = $.map(result.array, function(item, index)
				{
					return [[item.sl, item.itemcode, item.description,
							item.UPC, item.vanqty, item.loadqty, item.netqty,
							item.netvalue, item.arbitemdescription]];
					// return [[item.sl,item.itemcode,
					// item.description,item.UPC, item.vanqty, item.loadqty,
					// item.netqty,item.netvalue]];
				});
			} else
				result = [];
			ProcessCurrentLoad(result);
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function ProcessCurrentLoad(result)
{
	var Headers = ["Sl#", "Item#", "Description", "UPC", "Van Qty", "Load Qty",
			"Net Qty", "VALUE"];
	var Total = {
		"Van Qty" : "0/0",
		"Load Qty" : "0/0",
		"Net Qty" : "0/0",
		"VALUE" : "0"
	};

	var TotalAmount = 0;
	for (i = 0; i < result.length; i++)
	{
		for (j = 0; j < result[i].length; j++)
		{
			if (j == 1)
			{
				if (sessionStorage.getItem("CheckCode") == 'ancode'
						&& !isNaN(result[i][j]))
					result[i][j] = parseInt(result[i][j], 10);

				result[i][j] = (result[i][j]).toString();
			}
			if (j >= 4 && j <= 6)
			{
				var qtykey = "";
				if (j == 4)
					qtykey = "Van Qty";
				if (j == 5)
					qtykey = "Load Qty";
				if (j == 6)
					qtykey = "Net Qty";
				QuantityTotal(Total, qtykey, result[i][j]);
			}
			if (j == 7)
			{
				result[i][j] = eval(result[i][j]).toFixed(decimalplace);
				TotalAmount = (eval(TotalAmount) + eval(result[i][j]))
						.toFixed(decimalplace);
			}

		}
	}
	TotalAmount = eval(parseFloat(TotalAmount)).toFixed(decimalplace);
	Total["VALUE"] = TotalAmount.toString();
	data["HEADERS"] = Headers;
	data["TOTAL"] = [Total];
	data["printstatus"] = getPrintStatus();
	data["data"] = result;
	getCommonData();
	console.log("JSON " + JSON.stringify(data));
	PrintReport(ReportName.LoadReport, data);
}

function getLoadTransferInfo(isDraftPrintinfo)
{
	data = {};
	var Qry = "SELECT documentnumber,printstatus,transferlocationcode FROM inventorytransactionheader WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false')";
	console.log(Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			if (result.length > 0)
			{
				documentnumber = parseInt(eval(result[0][0]));
				printstatus = result[0][1];
				transferroutecode = parseInt(eval(result[0][2]));
			}
			gettransferrouteinfo(transferroutecode);
			PrintLoadTransfer('transferin');
			// PrintLoadTransferValue('transferin');
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{
		window.plugins.DataBaseHelper
				.select(
						Qry,
						function(result)
						{
							if (result.array != undefined)
							{
								documentnumber = parseInt(eval(result.array[0].documentnumber));
								printstatus = result.array[0].printstatus;
								transferroutecode = parseInt(eval(result.array[0].transferlocationcode));
							}
							if (isDraftPrintinfo)
							{
								documentnumber = eval("0000");
								transferroutecode = parseInt(eval(sessionStorage
										.getItem("RouteCode")));

							}
							gettransferrouteinfo(transferroutecode);

							isDraftPrint = isDraftPrintinfo;
							PrintLoadTransfer('transferin');

						}, function()
						{
							console.warn("Error calling plugin");
						});
	}
}
// ------------------
function PrintLoadTransferValue(type)
{

	if (type == "transferin")
	{
		if (isDraftPrint)
		{
			var Qry = "SELECT itemcode,CAST(((CAST((IFNULL(transferinqty/unitspercase, 0)) AS INT) * caseprice) + (IFNULL((transferinqty) % unitspercase, 0) * defaultsalesprice)) AS FLOAT )as netvalue FROM (SELECT CASE WHEN '"
					+ sessionStorage.getItem("CheckCode")
					+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE  transactiontypecode = 3 AND istemp = 'true' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE transactiontypecode = 2 AND istemp = 'true' AND itemcode = invsum.itemcode),0) transferoutqty,im.unitspercase AS 'unitspercase',im.caseprice as 'caseprice',im.defaultsalesprice as 'defaultsalesprice' FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE transferinqty > 0 order by itemcode";
		} else
		{
			var Qry = "SELECT itemcode,CAST(((CAST((IFNULL(transferinqty/unitspercase, 0)) AS INT) * caseprice) + (IFNULL((transferinqty) % unitspercase, 0) * defaultsalesprice)) AS FLOAT )as netvalue FROM (SELECT CASE WHEN '"
					+ sessionStorage.getItem("CheckCode")
					+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 3 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferoutqty,im.unitspercase AS 'unitspercase',im.caseprice as 'caseprice',im.defaultsalesprice as 'defaultsalesprice' FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE transferinqty > 0 order by itemcode";

		}
	} else if (type == "transferout")
	{
		if (isDraftPrint)
		{
			var Qry = "SELECT itemcode,CAST(((CAST((IFNULL((transferoutqty)/unitspercase, 0)) AS INT) * caseprice) + (IFNULL((transferoutqty) % unitspercase, 0) * defaultsalesprice)) AS FLOAT )as netvalue FROM (SELECT CASE WHEN '"
					+ sessionStorage.getItem("CheckCode")
					+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE  transactiontypecode = 3 AND istemp = 'true' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE  transactiontypecode = 2 AND istemp = 'true' AND itemcode = invsum.itemcode),0) transferoutqty,im.unitspercase AS 'unitspercase',im.caseprice as 'caseprice',im.defaultsalesprice as 'defaultsalesprice' FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE transferoutqty > 0 order by itemcode";
		} else
		{
			var Qry = "SELECT itemcode,CAST(((CAST((IFNULL((transferoutqty)/unitspercase, 0)) AS INT) * caseprice) + (IFNULL((transferoutqty) % unitspercase, 0) * defaultsalesprice)) AS FLOAT )as netvalue FROM (SELECT CASE WHEN '"
					+ sessionStorage.getItem("CheckCode")
					+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 3 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferoutqty,im.unitspercase AS 'unitspercase',im.caseprice as 'caseprice',im.defaultsalesprice as 'defaultsalesprice' FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE transferoutqty > 0 order by itemcode";

		}
	} else if (type == "damage")
		var Qry = "SELECT itemcode,CAST(((CAST((IFNULL((damagetransferoutqty)/unitspercase, 0)) AS INT) * caseprice) + (IFNULL((damagetransferoutqty) % unitspercase, 0) * defaultsalesprice)) AS FLOAT )as netvalue FROM (SELECT CASE WHEN '"
				+ sessionStorage.getItem("CheckCode")
				+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 3 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferoutqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 4 AND istemp = 'false' AND itemcode = invsum.itemcode),0) damagetransferoutqty,im.unitspercase AS 'unitspercase',im.caseprice as 'caseprice',im.defaultsalesprice as 'defaultsalesprice' FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE damagetransferoutqty > 0 order by itemcode";
	console.log(Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			if (result.length <= 0)
				result = [];

		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{

		window.plugins.DataBaseHelper
				.select(
						Qry,
						function(result)
						{
							if (result.array != undefined)
							{
								result = $.map(result.array, function(item,
										index)
								{
									return [[item.itemcode, item.netvalue]];
								});
								for (i = 0; i < result.length; i++)
								{
									for (j = 0; j < result[i].length; j++)
									{
										if (j == 1)
										{
											result[i][j] = (eval(result[i][j]))
													.toFixed(decimalplace);
											if (type == "transferin")
											{
												netinvalue = (eval(netinvalue) + eval(result[i][j]))
														.toFixed(decimalplace);
											} else if (type == "transferout")
											{
												netoutvalue = (eval(netoutvalue) + eval(result[i][j]))
														.toFixed(decimalplace);
											}

										}

									}
								}

							} else
								result = [];

						}, function()
						{
							console.warn("Error calling plugin");
						});
	}
}
// ----------------
function gettransferrouteinfo(transferroutecode)
{
	var Qry = "SELECT routecode,routename FROM routemaster WHERE routecode = "
			+ transferroutecode;
	console.log(Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			if (result.length > 0)
			{
				routecode = parseInt(eval(result[0][0]));
				routename = result[0][1];

			}
			tranferflag = 1;
			data["TO ROUTE"] = routecode + "-" + routename;
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				routecode = parseInt(eval(result.array[0].routecode));
				routename = result.array[0].routename;
			}
			tranferflag = 1;
			data["TO ROUTE"] = routecode + "-" + routename;
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function PrintLoadTransfer(type)
{

	// need to change
	PrintLoadTransferValue(type);

	if (type == "transferin")
	{
		if (isDraftPrint)
		{
			var Qry = "SELECT 0 as sl,itemcode, description,unitspercase,(CASE WHEN unitspercase=1 THEN ( 0 || '/' || CAST(transferinqty AS INT))  ELSE (CAST(transferinqty/unitspercase AS INT) || '/' || CAST(transferinqty%unitspercase AS INT)) END) as transferqty, CAST(transferinqty AS INT) AS transftertotalqty, (CAST((vanqty - (transferinqty - transferoutqty) + transferinqty)/unitspercase AS INT) || '/' || CAST((vanqty -(transferinqty - transferoutqty)+transferinqty)%unitspercase AS INT)) netqty, CAST(((CAST((IFNULL(transferinqty/unitspercase, 0)) AS INT) * caseprice) + (IFNULL((transferinqty) % unitspercase, 0) * defaultsalesprice)) AS FLOAT )as value,reasoncode,expirydate FROM (SELECT CASE WHEN 'alternatecode' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty, IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE  transactiontypecode = 3 AND istemp = 'true' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE  transactiontypecode = 2 AND istemp = 'true' AND itemcode = invsum.itemcode),0) transferoutqty,unitspercase AS 'unitspercase',caseprice,defaultsalesprice,IFNULL((SELECT reasoncode FROM inventorytransactiondetail WHERE transactiontypecode = 3 AND istemp = 'true' AND itemcode = invsum.itemcode),0) as reasoncode,IFNULL((SELECT expirydate FROM inventorytransactiondetail WHERE transactiontypecode = 3 AND istemp = 'true' AND itemcode = invsum.itemcode),0) as expirydate FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE transferinqty > 0 order by itemcode";
		} else
		{
			var Qry = "SELECT 0 as sl,itemcode, description,unitspercase,(CASE WHEN unitspercase=1 THEN ( 0 || '/' || CAST(transferinqty AS INT))  ELSE (CAST(transferinqty/unitspercase AS INT) || '/' || CAST(transferinqty%unitspercase AS INT)) END) as transferqty, CAST(transferinqty AS INT) AS transftertotalqty, (CAST((vanqty - (transferinqty - transferoutqty) + transferinqty)/unitspercase AS INT) || '/' || CAST((vanqty -(transferinqty - transferoutqty)+transferinqty)%unitspercase AS INT)) netqty, CAST(((CAST((IFNULL(transferinqty/unitspercase, 0)) AS INT) * caseprice) + (IFNULL((transferinqty) % unitspercase, 0) * defaultsalesprice)) AS FLOAT )as value,reasoncode,expirydate FROM (SELECT CASE WHEN 'alternatecode' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty, IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 3 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferoutqty,unitspercase AS 'unitspercase',caseprice,defaultsalesprice,IFNULL((SELECT reasoncode FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 3 AND istemp = 'false' AND itemcode = invsum.itemcode),0) as reasoncode,IFNULL((SELECT expirydate FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 3 AND istemp = 'false' AND itemcode = invsum.itemcode),0) as expirydate FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE transferinqty > 0 order by itemcode";
		}

	} else if (type == "transferout")
	{
		if (isDraftPrint)
		{
			var Qry = "SELECT 0 as sl,itemcode,description,unitspercase,(CASE WHEN unitspercase=1 THEN ( 0 || '/' || CAST(transferoutqty AS INT)) ELSE (CAST(transferoutqty/unitspercase AS INT) || '/' || CAST(transferoutqty%unitspercase AS INT)) END) as transferqty,CAST(transferoutqty AS INT) AS transftertotalqty,(CAST((vanqty - (transferinqty - transferoutqty) - transferoutqty)/unitspercase AS INT) || '/' || CAST((vanqty -(transferinqty - transferoutqty)-transferoutqty)%unitspercase AS INT)) netqty,CAST(((CAST((IFNULL((transferoutqty)/unitspercase, 0)) AS INT) * caseprice) + (IFNULL((transferoutqty) % unitspercase, 0) * defaultsalesprice)) AS FLOAT )as value,reasoncode,expirydate FROM (SELECT CASE WHEN '"
					+ sessionStorage.getItem("CheckCode")
					+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE  transactiontypecode = 3 AND istemp = 'true' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE  transactiontypecode = 2 AND istemp = 'true' AND itemcode = invsum.itemcode),0) transferoutqty,unitspercase AS 'unitspercase',caseprice,defaultsalesprice,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE  transactiontypecode = 2 AND istemp = 'true' AND itemcode = invsum.itemcode),0) transferoutqty,IFNULL((SELECT rm.description as reasoncode FROM inventorytransactiondetail ird join retitmreasons rm on rm.code=ird.reasoncode WHERE  transactiontypecode = 2 AND istemp = 'true' AND itemcode = invsum.itemcode),0) reasoncode,IFNULL((SELECT expirydate FROM inventorytransactiondetail WHERE  transactiontypecode = 2 AND istemp = 'true' AND itemcode = invsum.itemcode),0) expirydate FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE transferoutqty > 0 order by itemcode";
		} else
		{
			var Qry = "SELECT 0 as sl,itemcode,description,unitspercase,(CASE WHEN unitspercase=1 THEN ( 0 || '/' || CAST(transferoutqty AS INT)) ELSE (CAST(transferoutqty/unitspercase AS INT) || '/' || CAST(transferoutqty%unitspercase AS INT)) END) as transferqty,CAST(transferoutqty AS INT) AS transftertotalqty,(CAST((vanqty - (transferinqty - transferoutqty) - transferoutqty)/unitspercase AS INT) || '/' || CAST((vanqty -(transferinqty - transferoutqty)-transferoutqty)%unitspercase AS INT)) netqty,CAST(((CAST((IFNULL((transferoutqty)/unitspercase, 0)) AS INT) * caseprice) + (IFNULL((transferoutqty) % unitspercase, 0) * defaultsalesprice)) AS FLOAT )as value,reasoncode,expirydate FROM (SELECT CASE WHEN '"
					+ sessionStorage.getItem("CheckCode")
					+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 3 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferoutqty,unitspercase AS 'unitspercase',caseprice,defaultsalesprice,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferoutqty,IFNULL((SELECT rm.description as reasoncode FROM inventorytransactiondetail ird join retitmreasons rm on rm.code=ird.reasoncode WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp = 'false' AND itemcode = invsum.itemcode),0) reasoncode,IFNULL((SELECT expirydate FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp = 'false' AND itemcode = invsum.itemcode),0) expirydate FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE transferoutqty > 0 order by itemcode";
		}

	} else if (type == "damage")
	{
		var Qry = "SELECT 0 as sl,itemcode,description,unitspercase,(CAST(damagetransferoutqty/unitspercase AS INT) || '/' || CAST(damagetransferoutqty%unitspercase AS INT)) transferqty,CAST(damagetransferoutqty AS INT) AS transftertotalqty,(CAST((vanqty - (transferinqty - transferoutqty) - damagetransferoutqty)/unitspercase AS INT) || '/' || CAST((vanqty -(transferinqty - transferoutqty)-damagetransferoutqty)%unitspercase AS INT)) netqty,CAST(((CAST((IFNULL((damagetransferoutqty)/unitspercase, 0)) AS INT) * caseprice) + (IFNULL((damagetransferoutqty) % unitspercase, 0) * defaultsalesprice)) AS FLOAT )as value FROM (SELECT CASE WHEN '"
				+ sessionStorage.getItem("CheckCode")
				+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,itemdescription as description,((ifnull(loadqty,0)+ifnull(loadadjustqty,0)+ifnull(beginstockqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(saleqty,0)+ifnull(returnqty,0)+ifnull(returnfreeqty,0)-ifnull(freesampleqty,0))) AS vanqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 3 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferinqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 2 AND istemp = 'false' AND itemcode = invsum.itemcode),0) transferoutqty,IFNULL((SELECT quantity FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 4 AND istemp = 'false' AND itemcode = invsum.itemcode),0) damagetransferoutqty,unitspercase AS 'unitspercase',caseprice,defaultsalesprice,IFNULL((SELECT reasoncode FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 4 AND istemp = 'false' AND itemcode = invsum.itemcode),0) reasoncode,IFNULL((SELECT expirydate FROM inventorytransactiondetail WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 2 AND istemp = 'false') AND transactiontypecode = 4 AND istemp = 'false' AND itemcode = invsum.itemcode),0) expirydate FROM inventorysummarydetail invsum JOIN itemmaster im on im.actualitemcode = invsum.itemcode) WHERE damagetransferoutqty > 0 order by itemcode";
	}

	console.log(Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			if (result.length <= 0)
				result = [];
			ProcessTransferData(result, type);
			if (type == "transferin")
				PrintLoadTransfer("transferout");
			else if (type == "transferout")
				PrintLoadTransfer("damage");
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				result = $.map(result.array,
						function(item, index)
						{

							if (type == "transferout")
								return [[item.sl, item.itemcode,
										item.description, item.unitspercase,
										item.transferqty,
										item.transftertotalqty,
										item.reasoncode, item.expirydate]];
							else
								return [[item.sl, item.itemcode,
										item.description, item.unitspercase,
										item.transferqty,
										item.transftertotalqty, item.netqty,
										item.value]];

						});
			} else
				result = [];
			ProcessTransferData(result, type);
			if (type == "transferin")
				PrintLoadTransfer("transferout");
			else if (type == "transferout")
				PrintLoadTransfer("damage");
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function ProcessTransferData(result, type)
{

	// getCommonData();
	var Header;
	if (type == "transferout")
	{

		data["HEADERS"] = ["Sl#", "Item#", "Description", "UPC",
				"Transfer Qty", "Qty", "Reason", "Expiry Date"];
		Header = ["Sl#", "Item#", "Description", "UPC", "Transfer Qty", "Qty",
				"Reason", "Expiry Date"];
	} else
	{
		Header = ["Sl#", "Item#", "Description", "UPC", "Transfer Qty", "Qty",
				"Net Qty", "Value"];
		data["HEADERS"] = ["Sl#", "Item#", "Description", "UPC",
				"Transfer Qty", "Qty", "Net Qty", "Value"];

	}

	var total = {
		"Transfer Qty" : "0/0",
		"Qty" : "0",
		"Net Qty" : "0/0",
		"Value" : "0"
	};
	var totalQty = 0, TotalAmount = 0;
	for (i = 0; i < result.length; i++)
	{
		for (j = 0; j < result[i].length; j++)
		{

			if (j == 1)
			{
				if (sessionStorage.getItem("CheckCode") == 'ancode'
						&& !isNaN(result[i][j]))
					result[i][j] = parseInt(result[i][j]);

				result[i][j] = (result[i][j]).toString();
			}
			if (j == 4 || j == 6)
			{
				var qtykey = "";

				if (j == 4)
				{
					qtykey = "Transfer Qty";
					QuantityTotal(total, qtykey, result[i][j]);
				}

				if (j == 6 && type == "transferin")
				{
					qtykey = "Net Qty";
					QuantityTotal(total, qtykey, result[i][j]);
				}

			}
			if (j == 5 || j == 7)
			{

				if (j == 5)
					totalQty = (eval(totalQty) + eval(result[i][j]));
				if (j == 7 && type == "transferin")
					TotalAmount = (eval(TotalAmount) + eval(result[i][j]))
							.toFixed(decimalplace);
			}
		}
	}
	totalQty = eval(parseFloat(totalQty));
	TotalAmount = eval(parseFloat(TotalAmount)).toFixed(decimalplace);
	total["Qty"] = totalQty.toString();

	if (TotalAmount != undefined)
		total["Value"] = TotalAmount.toString();

	if (data["data"] == undefined)
		data["data"] = [];
	data["data"].push({
		"DATA" : result,
		"HEADERS" : Header,
		"TOTAL" : total
	});

	if (type == "damage")
	{
		getCommonData();
		if (isDraftPrint)
		{
			data["printstatus"] = "DRAFT COPY";
		} else
		{
			data["printstatus"] = getPrintStatus();
		}

		data["DOCUMENT NO"] = documentnumber;
		data["netvalue"] = eval(eval(netinvalue) - eval(netoutvalue)).toFixed(
				decimalplace);
		// data["data"] = result;
		// data["netvalue"] = '0';
		data["TOTAL"] = [total];

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

function getSalesOrderInfo()
{
	// alert("getSalesOrderInfo");
	ArrPrint = [];
	data = {};
	getOrderInfo()
}

function getOrderInfo()
{
	// alert("getOrderInfo");

	var Qry = " SELECT cm.customercode,customername  || '-' || arbcustomername  AS 'customername',customeraddress1  AS 'address',soh.paymenttype,  IFNULL(totalpromoamount,0) totalpromoamount,(CAST(IFNULL(totalsalesamount,0) - IFNULL(totalreturnamount,0)-IFNULL(totaldamagedamount,0) AS VARCHAR)) totalinvoiceamount,documentnumber,invoicenumber,comments,printstatus = "
			+ sessionStorage.getItem("printstatus")
			+ ",(SELECT CASE cm.messagekey5 WHEN 0 THEN '' ELSE messageline1 || messageline2 || messageline3 || messageline4 END FROM customermessages WHERE messagekey = messagekey5) AS invheadermsg,(SELECT CASE cm.messagekey6 WHEN 0 THEN '' ELSE messageline1 || messageline2 || messageline3 || messageline4 END FROM customermessages WHERE messagekey = messagekey6) AS invtrailormsg,(SELECT IFNULL(sum(IFNULL(promoamount,0)),0) from salesorderdetail sod where sod.visitkey="
			+ sessionStorage.getItem("VisitKey")
			+ " AND sod.routekey = "
			+ sessionStorage.getItem("RouteKey")
			+ ") as promoamount,cm.invoicepaymentterms,cm.outletsubtype,CAST(soh.totalinvoiceamount AS VARCHAR) as headerAmount,customeraddress2,customeraddress3,printoutletitemcode,cm.alternatecode,1 as splitfree,soh.totalfreesampleamount as totalfreesampleamount,arbcustomeraddress1,arbcustomeraddress2,arbcustomeraddress3,CAST(IFNULL(totalsalesamount,0) AS VARCHAR) tsalesamt,CAST(IFNULL(totalreturnamount,0) AS VARCHAR) treturnsamt,CAST(IFNULL(totaldamagedamount,0) AS VARCHAR) tdamagesamt,cm.invoicepriceprint as invoicepriceprint FROM customermaster cm JOIN salesorderheader soh ON cm.customercode = soh.customercode AND soh.visitkey= "
			+ sessionStorage.getItem("VisitKey")
			+ " AND soh.routekey="
			+ sessionStorage.getItem("RouteKey")
	console.log(Qry);
	// alert(Qry);

	if (platform == 'iPad')
	{

		// Need to develop
	} else if (platform == 'Android')
	{
		// alert("android");
		window.plugins.DataBaseHelper.select(Qry,
				function(result)
				{
					if (result.array != undefined)
					{
						result = $.map(result.array, function(item, index)
						{
							return [[item.customercode, item.customername,
									item.address, item.paymenttype,
									item.totalpromoamount,
									item.totalinvoiceamount,
									item.documentnumber, item.invoicenumber,
									item.comments, item.printstatus,
									item.invheadermsg, item.invtrailormsg,
									item.promoamount, item.invoicepaymentterms,
									item.outletsubtype, item.headerAmount,
									item.customeraddress2,
									item.customeraddress3,
									item.printoutletitemcode,
									item.alternatecode, item.splitfree,
									item.arbcustomeraddress1,
									item.arbcustomeraddress2,
									item.arbcustomeraddress3, item.tsalesamt,
									item.treturnsamt, item.tdamagesamt,
									item.invoicepriceprint,
									item.totalfreesampleamount]];
						});

						// alert(JSON.stringify(result));
						customercode = result[0][0];
						customername = result[0][1];
						customeraddress1 = result[0][2];
						paymenttype = result[0][3];
						totalpromoamount = eval(result[0][4]).toFixed(
								decimalplace);
						totalinvoiceamount = eval(result[0][5]).toFixed(
								decimalplace);
						// alert('totalinvoiceamount' +totalinvoiceamount);
						documentnumber = parseInt(eval(result[0][6]));
						invoicenumber = parseInt(eval(result[0][7]));
						comments = result[0][8];
						// printstatus = sessionStorage.getItem("printstatus");
						printstatus = result[0][9];
						// alert('printstatus11' +printstatus);
						invheadermsg = result[0][10];
						invtrailormsg = result[0][11];
						itempromoamount = eval(eval(result[0][12])).toFixed(
								decimalplace);

						invoicepaymentterms = result[0][13];
						customerOutlet = result[0][14];
						headerAmount = result[0][15];
						customeraddress2 = result[0][16];
						customeraddress3 = result[0][17];
						printoutletitemcode = result[0][18];
						alternatecode = result[0][19];
						// alert('alternatecode' +alternatecode);

						if (customerOutlet == null || customerOutlet == ''
								|| customerOutlet == undefined)
						{

							customerOutlet = 0;

						}
						splitfree = result[0][20];
						// var manualfree=result[0][26];
						// manualfreediscount=eval(result[0][27]);
						customeraddress = customeraddress1;
						if (customeraddress2 != '')
							customeraddress = customeraddress + ", "
									+ customeraddress2;
						if (customeraddress3 != '')
							customeraddress = customeraddress + ", "
									+ customeraddress3;

						var arbcustomeraddress1 = result[0][21];
						var arbcustomeraddress2 = result[0][22];
						var arbcustomeraddress3 = result[0][23];
						totalfinalamount = eval(result[0][24])
								- eval(result[0][25]) - eval(result[0][26]);
						// alert('totalfinalamount' +totalfinalamount);
						invoicepriceprint = eval(result[0][27]);
						totalfreesampleamount = eval(result[0][28]);
						arbcustomeraddress = arbcustomeraddress1;

						if (arbcustomeraddress2 != '')
							arbcustomeraddress = arbcustomeraddress + ", "
									+ arbcustomeraddress2;
						if (arbcustomeraddress3 != '')
							arbcustomeraddress = arbcustomeraddress + ", "
									+ arbcustomeraddress3;

						// GetOrderData('SalesOrder');
						checkOrderHeader('SalesOrder', '1',
								totalfreesampleamount, splitfree);

					}
				}, function()
				{
					console.warn("Error calling plugin");
				});

	}
}

function checkOrderHeader(trans, val, totalfreesampleamount, splitfree)
{
	// alert("checkOrderHeader");
	// alert('trans' +trans);
	// alert('splitfree' +splitfree);
	if (eval(totalfreesampleamount) > 0 && splitfree == '1')
	{

		GetOrderData('SalesOrder', '1', true);
		// alert("true");
	} else
	{

		GetOrderData('SalesOrder', '1', false);
		// alert("false");
	}
}

function GetOrderData(trans, val, isFree)
{
	// alert("GetOrderData");
	// alert('isFree' +isFree);
	// alert('trans' +trans);
	// var customerid = sessionStorage.getItem("customerid");
	// alert('customerid' +customerid);
	if (val == '1')
	{
		var total = {
			"QTY CAS/PCS" : "0/0",
			"TOTAL PCS" : "0",
			"DISCOUNT" : "0",
			"AMOUNT" : "0"
		};
		var Header = ["SL#", "ITEM#", "OUTLET CODE", "DESCRIPTION", "UPO",
				"QTY CAS/PCS", "TOTAL PCS", "CASE PRICE", "UNIT PRICE",
				"DISCOUNT", "AMOUNT"];
		// alert(Header);
	} else
	{
		var total = {
			"QTY CAS/PCS" : "0/0",
			"DISCOUNT" : "0",
			"AMOUNT" : "0"
		};
		var Header = ["SL#", "ITEM#", "OUTLET CODE", "DESCRIPTION",
				"QTY CAS/PCS", "TOTAL PCS", "CASE PRICE", "UNIT PRICE",
				"DISCOUNT", "AMOUNT"];

	}

	var HeaderFree = ["SL#", "ITEM#", "OUTLET CODE", "DESCRIPTION", "UPO",
			"QTY CAS/PCS", "TOTAL PCS", "CASE PRICE", "UNIT PRICE", "DISCOUNT",
			"AMOUNT"]

	// Removed o as discount
	// var QryOrder = "SELECT 0 as sl,CASE WHEN '"
	// + sessionStorage.getItem("CheckCode")
	// + "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END
	// AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS
	// 'outletcode',itemdescription AS 'description',unitspercase as upc,CASE
	// WHEN unitspercase ='1' THEN '0/' || IFNULL(CAST((salesqty/unitspercase)
	// AS INT),0) ELSE (IFNULL(CAST((salesqty/unitspercase) AS INT),0) || '/' ||
	// IFNULL(CAST((salesqty%unitspercase) AS INT),0)) END AS
	// 'quantity',salesqty AS 'tqty',IFNULL(salescaseprice,0) AS
	// caseprice,IFNULL(salesprice,0) AS unitprice,IFNULL(promoamount,0),0 AS
	// 'discount',(((IFNULL(CAST((salesqty/unitspercase) AS INT),0) *
	// IFNULL(salescaseprice,0)) + (IFNULL(CAST((salesqty%unitspercase) AS
	// INT),0)) * IFNULL(salesprice,0)) -
	// IFNULL(promoamount,0)),arbitemshortdescription AS arbdescription FROM
	// salesorderdetail sod JOIN itemmaster im ON im.actualitemcode =
	// sod.itemcode and sod.salesqty > 0 JOIN salesorderheader soh ON
	// soh.visitkey = sod.visitkey AND soh.customercode = "
	// + sessionStorage.getItem("customerid")
	// + " LEFT JOIN outletitemcodes ocode on ocode.itemcode=sod.itemcode and
	// ocode.groupcode= '" +customerOutlet+ " ' WHERE sod.routekey="
	// + sessionStorage.getItem("RouteKey")
	// + " AND sod.visitkey = "
	// + sessionStorage.getItem("VisitKey")
	// + " and im.itemtype=1 order by CASE printsequencecust WHEN 0 THEN 100000
	// ELSE printsequencecust END";

	// sujee added dataentry
	// var QryOrder = "SELECT 0 as sl,CASE WHEN '"
	// + sessionStorage.getItem("CheckCode")
	// + "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END
	// AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS
	// 'outletcode',itemdescription AS 'description',unitspercase as upc,CASE
	// WHEN unitspercase ='1' THEN '0/' || IFNULL(CAST((salesqty/unitspercase)
	// AS INT),0) ELSE (IFNULL(CAST((salesqty/unitspercase) AS INT),0) || '/' ||
	// IFNULL(CAST((salesqty%unitspercase) AS INT),0)) END AS
	// 'quantity',salesqty AS 'tqty',IFNULL(salescaseprice,0) AS
	// caseprice,IFNULL(salesprice,0) AS unitprice,IFNULL(promoamount,0) AS
	// 'discount',(((IFNULL(CAST((salesqty/unitspercase) AS INT),0) *
	// IFNULL(salescaseprice,0)) + (IFNULL(CAST((salesqty%unitspercase) AS
	// INT),0)) * IFNULL(salesprice,0)) - IFNULL(promoamount,0)) AS
	// 'amount',arbitemshortdescription AS arbdescription FROM salesorderdetail
	// sod JOIN itemmaster im ON im.actualitemcode = sod.itemcode and
	// sod.salesqty > 0 JOIN salesorderheader soh ON soh.visitkey = sod.visitkey
	// AND soh.customercode = "
	// + sessionStorage.getItem("customerid")
	// + " LEFT JOIN outletitemcodes ocode on ocode.itemcode=sod.itemcode and
	// ocode.groupcode= '" +customerOutlet+ " ' WHERE sod.routekey="
	// + sessionStorage.getItem("RouteKey")
	// + " AND sod.visitkey = "
	// + sessionStorage.getItem("VisitKey")
	// + " and im.itemtype=1 order by CASE printsequencecust WHEN 0 THEN 100000
	// ELSE printsequencecust END";

	var QryOrder = "SELECT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((salesqty/unitspercase) AS INT),0) ELSE (IFNULL(CAST((salesqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((salesqty%unitspercase) AS INT),0)) END AS 'quantity',salesqty AS 'tqty',IFNULL(salescaseprice,0) AS caseprice,IFNULL(salesprice,0) AS unitprice,IFNULL(promoamount,0) AS 'discount',(((IFNULL(CAST((salesqty/unitspercase) AS INT),0) * IFNULL(salescaseprice,0)) + (IFNULL(CAST((salesqty%unitspercase) AS INT),0)) * IFNULL(salesprice,0)) - IFNULL(promoamount,0))  AS 'amount',arbitemshortdescription AS arbdescription FROM salesorderdetail sod JOIN itemmaster im ON im.actualitemcode = sod.itemcode and sod.salesqty > 0 JOIN salesorderheader soh ON soh.visitkey = sod.visitkey AND soh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=sod.itemcode and ocode.groupcode= '"
			+ customerOutlet + " '  WHERE sod.routekey="
			+ sessionStorage.getItem("RouteKey") + " AND sod.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1  order by im.dataentry";

	var QryFree = "SELECT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((manualfreeqty/unitspercase) AS INT),0)  ELSE (IFNULL(CAST((manualfreeqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((manualfreeqty%unitspercase) AS INT),0)) END AS 'quantity',manualfreeqty AS 'tqty',0 AS caseprice,0 AS unitprice,0 AS 'amount',arbitemshortdescription AS arbdescription FROM salesorderdetail sod JOIN itemmaster im ON im.actualitemcode = sod.itemcode and sod.manualfreeqty > 0 JOIN salesorderheader soh ON soh.visitkey = sod.visitkey AND soh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=sod.itemcode and ocode.groupcode="
			+ customerOutlet
			+ " WHERE sod.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND sod.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1 order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";

	var QryPromoFree = "SELECT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription  AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((freesampleqty/unitspercase) AS INT),0)  ELSE (IFNULL(CAST((freesampleqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((freesampleqty%unitspercase) AS INT),0)) END AS 'quantity',freesampleqty AS 'tqty',IFNULL(salescaseprice,0) AS caseprice,IFNULL(salesprice,0) AS unitprice,0 AS 'discount',0 AS 'amount',arbitemshortdescription AS arbdescription FROM salesorderdetail sod JOIN itemmaster im ON im.actualitemcode = sod.itemcode and freesampleqty > 0 JOIN salesorderheader soh ON soh.visitkey = sod.visitkey AND soh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=sod.itemcode and ocode.groupcode="
			+ customerOutlet
			+ " WHERE sod.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND sod.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";

	var QryGood = "SELECT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((returnqty/unitspercase) AS INT),0)  ELSE (IFNULL(CAST((returnqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((returnqty%unitspercase) AS INT),0)) END AS 'quantity',returnqty AS 'tqty',IFNULL(goodreturncaseprice,0) AS caseprice,IFNULL(goodreturnprice,0) AS unitprice,IFNULL(promoamount,0) AS 'discount',(((IFNULL(CAST((returnqty/unitspercase) AS INT),0) * IFNULL(goodreturncaseprice,0)) + (IFNULL(CAST((returnqty%unitspercase) AS INT),0)) * IFNULL(goodreturnprice,0))) AS 'amount',arbitemshortdescription AS arbdescription FROM salesorderdetail sod JOIN itemmaster im ON im.actualitemcode = sod.itemcode and sod.returnqty > 0 JOIN salesorderheader soh ON soh.visitkey = sod.visitkey AND soh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=sod.itemcode and ocode.groupcode="
			+ customerOutlet
			+ " WHERE sod.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND sod.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1  order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";

	var QryBad = "SELECT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((damagedqty/unitspercase) AS INT),0)  ELSE (IFNULL(CAST((damagedqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((damagedqty%unitspercase) AS INT),0)) END AS 'quantity',damagedqty AS 'tqty',IFNULL(sod.returncaseprice,0) AS caseprice,IFNULL(sod.returnprice,0) AS unitprice,IFNULL(promoamount,0) AS 'discount',(((IFNULL(CAST((damagedqty/unitspercase) AS INT),0) * IFNULL(sod.returncaseprice,0)) + (IFNULL(CAST((damagedqty%unitspercase) AS INT),0)) * IFNULL(sod.returnprice,0))) AS 'amount',arbitemshortdescription AS arbdescription FROM salesorderdetail sod JOIN itemmaster im ON im.actualitemcode = sod.itemcode and sod.damagedqty > 0 JOIN salesorderheader soh ON soh.visitkey = sod.visitkey AND soh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=sod.itemcode and ocode.groupcode="
			+ customerOutlet
			+ " WHERE sod.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND sod.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1  order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";

	var Qry;

	if (trans == 'SalesOrder')
	{
		Qry = QryOrder;
		console.log(Qry);
		// alert(Qry);
	} else if (trans == 'free')
	{
		Qry = QryFree;
		Header = HeaderFree;
		delete total["Discount"];
	} else if (trans == 'promofree')
	{
		Qry = QryPromoFree;
		Header = HeaderFree;
		delete total["Discount"];
	} else if (trans == 'good')
	{
		Qry = QryGood;
	} else if (trans == 'bad')
	{
		Qry = QryBad;
	}

	console.log("nidhi----" + Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			SetSalesTransaction(trans, result, Header, total);
			if (trans == 'SalesOrder')
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
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{

		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				if (trans == 'free' || trans == 'promofree')
				{
					result = $.map(result.array,
							function(item, index)
							{
								return [[item.sl, item.itemcode,
										item.outletcode, item.description,
										item.upc, item.quantity, item.tqty,
										item.caseprice, item.unitprice,
										item.discount, item.amount,
										item.arbdescription]];
							});
				} else
				{
					result = $.map(result.array, function(item, index)
					{
						// Start for display UPC or Discount
						// if (val == '1') {
						if (trans == 'SalesOrder')
						{ // alert("called here");
							return [[item.sl, item.itemcode, item.outletcode,
									item.description, item.upc, item.quantity,
									item.tqty, item.caseprice, item.unitprice,
									item.discount, item.amount,
									item.arbdescription]];
						} else
						{
							return [[item.sl, item.itemcode, item.outletcode,
									item.description, item.quantity, item.tqty,
									item.caseprice, item.unitprice,
									item.discount, item.amount,
									item.arbdescription]];
						}
						// End
						// return [[item.itemcode,item.description,
						// item.quantity, item.caseprice,
						// item.unitprice,item.discount,item.amount]];
					});
				}
			} else
				result = [];

			SetOrderTransaction(trans, result, Header, total, isFree);
			if (trans == 'SalesOrder')
				// GetSalesData('free');
				GetOrderData('good', '1', isFree); // Added for display UPC
			if (trans == 'good')
				// GetSalesData('bad');
				GetOrderData('bad', '1', isFree); // Added for display UPC
			if (trans == 'bad')
				// GetSalesData('promofree');
				GetOrderData('promofree', '1', isFree); // Added for display UPC

			if (trans == 'promofree' && !isFree)
				// GetSalesData('good');
				GetOrderData('free', '1', isFree); // Added for display UPC

		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function SetOrderTransaction(trans, result, Header, Total, isFree)
{ // alert("SetOrderTransaction"); alert('trans' +trans);
	for (i = 0; i < result.length; i++)
	{
		for (j = 0; j < result[i].length; j++)
		{
			// alert('decimalplace' +decimalplace);
			if (j == 1)
			{
				if (sessionStorage.getItem("CheckCode") == 'ancode'
						&& !isNaN(result[i][j]))
				{
					result[i][j] = parseInt(result[i][j], 10);
				}
				result[i][j] = (result[i][j]).toString();
			}
			if (j == 2)
			{
				if (!isNaN(result[i][j]) && result[i][j] != '-')
				{
					result[i][j] = parseInt(eval(result[i][j]));
					result[i][j] = (result[i][j]).toString();
				} else
				{
					result[i][j] = ("  ").toString();
				}

			}
			if (j == 5)
			{
				var qtykey = "QTY CAS/PCS";
				QuantityTotal(Total, qtykey, result[i][j]);
			}
			if (j == 6)
			{
				var qtykey = "TOTAL PCS";
				QTotal(Total, qtykey, result[i][j]);
			}
			// commented by sujee temp
			else if (j == 9 && trans != 'free' && trans != 'promofree')
			{
				result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
				Total.DISCOUNT = (eval(Total.DISCOUNT) + eval(result[i][j]))
						.toString();
				// alert('Total.DISCOUNT' +Total.DISCOUNT);
			} else if (j == 9 && (trans == 'free'))
				Total.AMOUNT = (eval(Total.AMOUNT) + eval(result[i][j]))
			else if (j == 10 && trans != 'free')
			{
				Total.AMOUNT = (eval(Total.AMOUNT) + eval(result[i][j]))

			}
			if (j > 6 && j <= 10)
			{

				result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
				// result[i][j] = (eval(result[i][j]));
				// alert('result[i][j]' +result[i][j]);
			}
		}
	}

	// alert('Total.AMOUNT' +Total.AMOUNT);
	if (isNaN(Total.DISCOUNT))
		Total.DISCOUNT = 0;
	if (isNaN(Total.AMOUNT))
		Total.AMOUNT = 0;

	Total.DISCOUNT = eval(parseFloat(Total.DISCOUNT)).toFixed(decimalplace);
	Total.AMOUNT = eval(parseFloat(Total.AMOUNT)).toFixed(decimalplace);
	// alert('Total.AMOUNT' +Total.AMOUNT);
	// Total.AMOUNT = eval(parseFloat(Total.AMOUNT));
	// alert('Total.AMOUNT' +Total.AMOUNT);
	// console.log("TOTALQTY : " + Total.QUANTITY);
	// alert('Total.QUANTITY' +Total.QUANTITY);
	// SetData(trans,result,Header,total);
	if (data["data"] == undefined)
		data["data"] = [];
	data["data"].push({
		"TITLE" : trans,
		"DATA" : result,
		"HEADERS" : Header,
		"TOTAL" : Total
	});
	// alert(JSON.stringify(data["data"]));
	if ((isFree && trans == "promofree") || trans == "free")
	{
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

		// if (invoicepaymentterms == 0 || invoicepaymentterms == 1)
		// invoicetype = "CASH INVOICE: " + invoicenumber;
		// else if (invoicepaymentterms == 3 || invoicepaymentterms == 4)
		// invoicetype = "CASH/TC INVOICE: " + invoicenumber;
		// else if (invoicepaymentterms == 2)
		// invoicetype = "CREDIT INVOICE: " + invoicenumber;

		if (eval(headerAmount) >= 0)
		{
			invoicetype = "SALES ORDER " + invoicenumber;

		}// else{
		// invoicetype = "CREDIT NOTE " + invoicenumber;

		// }

		data["invoicepaymentterms"] = invoicepaymentterms;
		data["invoicenumber"] = invoicenumber;
		data["INVOICETYPE"] = invoicetype;

		// sujee commented For Enahcne GRP 21/05/2018
		data["CUSTOMER"] = alternatecode + "   " + customername + ""; // "5416-SWITZ
		// MASTER BAKERS
		// (Cr)";

		// data["CUSTOMER"] = alternatecode;

		data["ADDRESS"] = customeraddress; // "Suite 808, Burjuman Business
		// Tower";
		data["ARBADDRESS"] = arbcustomeraddress; // "Suite 808, Burjuman
		// Business Tower";
		data["invoicepriceprint"] = invoicepriceprint;

		if (comments == 0 || comments == "0")
			comments = "";
		data["comments"] = unescape(comments);
		data["printstatus"] = getPrintStatus();
		console.log("itempromoamount-----nidhi" + itempromoamount);
		// data["SUB TOTAL"] = eval(headerAmount).toFixed(
		// decimalplace).toString();

		// sujee commented 01/06/2018
		/*
		 * data["SUB TOTAL"] = eval(totalfinalamount).toFixed(
		 * decimalplace).toString();
		 */

		data["SUB TOTAL"] = (eval(totalfinalamount) - eval(itempromoamount))
				.toFixed(decimalplace).toString();

		data["printoutletitemcode"] = printoutletitemcode;

		// alert('totalpromoamount' +totalpromoamount);
		// alert('itempromoamount' +itempromoamount);
		// alert('eval(manualfreediscount)' +eval(manualfreediscount));

		data["INVOICE DISCOUNT"] = (totalpromoamount - itempromoamount + eval(manualfreediscount))
				.toFixed(decimalplace).toString();

		/*
		 * data["INVOICE DISCOUNT"] = (totalpromoamount +
		 * eval(manualfreediscount));
		 */

		data["NET SALES"] = eval(headerAmount).toFixed(decimalplace).toString();
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

		if (paymenttype == 0)
		{
			data["PaymentType"] = "0";
		} else if (paymenttype == 4)
		{
			data["PaymentType"] = "1";
		} else if (paymenttype == 1)
		{
			data["PaymentType"] = "2";
		} else
			data["PaymentType"] = "0";

		if (invoicepaymentterms > 2)
			data["TCALLOWED"] = "1";
		else
			data["TCALLOWED"] = "0";
		console.log(JSON.stringify(data));

		ArrPrint.push([{
			"mainArr" : data,
			"name" : ReportName.Order
		}]);

		if (isFree && trans == 'promofree')
		{
			var paymentdata = {};
			// paymentdata["Cash"]=data["Cash"];
			// paymentdata["Cheque"]=data["Cheque"];

			// data={};
			// data["Cash"]=paymentdata["Cash"];
			// data["Cheque"]=paymentdata["Cheque"];
			// paymentdata={};
			GetOrderData('free', '1', isFree);

		}
		if (trans == "free")
		{
			PrintReportArray(printstatus);

		}

	}
}

function PrintSales(printagain)
{
	// GetSalesData('sales');
	printanother = printagain;
	ArrPrint = [];
	data = {};
	getInvoiceInfo();
}

function getInvoiceInfo()
{

	

	var Qry = "SELECT cm.customercode,customername  || '-' || arbcustomername  AS 'customername',customeraddress1  AS 'address',cm.roundnetamount,inv.paymenttype,IFNULL(totalpromoamount,0) totalpromoamount,(CAST(IFNULL(totalsalesamount,0) - IFNULL(totalreturnamount,0)-IFNULL(totaldamagedamount,0) AS VARCHAR)+(select IFNULL(sum(diffround),0) from invoicedetail where visitkey="
			+ sessionStorage.getItem("VisitKey")
			+ ")) totalinvoiceamount,documentnumber,invoicenumber,comments,printstatus,(SELECT CASE cm.messagekey5 WHEN 0 THEN '' ELSE messageline1 || messageline2 || messageline3 || messageline4 END FROM customermessages WHERE messagekey = messagekey5) AS invheadermsg,(SELECT CASE cm.messagekey6 WHEN 0 THEN '' ELSE messageline1 || messageline2 || messageline3 || messageline4 END FROM customermessages WHERE messagekey = messagekey6) AS invtrailormsg,(SELECT IFNULL(sum(IFNULL(promoamount,0)),0) from invoicedetail invt where invt.visitkey="
			+ sessionStorage.getItem("VisitKey")
			+ " AND invt.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ ") as promoamount,(SELECT IFNULL(sum(IFNULL(returnpromoamount,0)),0) from invoicedetail invt where invt.visitkey="
			+ sessionStorage.getItem("VisitKey")
			+ " AND invt.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ ") as returnpromoamount,(SELECT (IFNULL(sum(amount),0) - IFNULL(sum(promoamount),0)) from invoicedetail invt where invt.visitkey="
			+ sessionStorage.getItem("VisitKey")
			+ " AND invt.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ ") as tcamount,cm.invoicepaymentterms,CAST(IFNULL(amount,0) AS VARCHAR) as amount,bankname,checkdate,checknumber,cm.outletsubtype,CAST(inv.totalinvoiceamount AS VARCHAR) as headerAmount,customeraddress2,customeraddress3,printoutletitemcode,cm.alternatecode,splitfree,inv.totalmanualfree as totalmanualfree,inv.totaldiscountamount as totaldiscountamount,arbcustomeraddress1,arbcustomeraddress2,arbcustomeraddress3,CAST(IFNULL(totalsalesamount,0) AS VARCHAR) tsalesamt,CAST(IFNULL(totalreturnamount,0) AS VARCHAR) treturnsamt,CAST(IFNULL(totaldamagedamount,0) AS VARCHAR) tdamagesamt,(select IFNULL(sum(diffround),0) from invoicedetail where visitkey="
			+ sessionStorage.getItem("VisitKey")
			+ ") AS diffround,cm.invoicepriceprint as invoicepriceprint,itemlinetaxamount,totaltaxesamount,ifnull(cm.customertaxidoptions,0) printtax,ifnull(cm.applytax,0) applytax,ifnull(cm.taxregistrationnumber,0) taxregistrationnumber,(select sum(COALESCE(salesitemexcisetax,0)+COALESCE(salesitemgsttax,0)) from invoicedetail invt where invt.transactionkey = inv.transactionkey) as salestax,(select sum(COALESCE(returnitemexcisetax,0)+COALESCE(returnitemgsttax,0)) from invoicedetail invt where invt.transactionkey = inv.transactionkey) as returntax,(select sum(COALESCE(damageditemexcisetax,0)+COALESCE(damageditemgsttax,0)) from invoicedetail invt where invt.transactionkey = inv.transactionkey) as damagetax,(select sum(COALESCE(fgitemexcisetax,0)+ COALESCE(fgitemgsttax,0)) from invoicedetail invt where invt.transactionkey = inv.transactionkey) as freetax,(select sum(COALESCE(salesitemexcisetax,0)-COALESCE(returnitemexcisetax,0)-COALESCE(damageditemexcisetax,0)+COALESCE(fgitemexcisetax,0)+COALESCE(promoitemexcisetax,0)-COALESCE(buybackexcisetax,0)) from invoicedetail invt where invt.transactionkey = inv.transactionkey) as totExcTax,(select sum(COALESCE(salesitemgsttax,0)-COALESCE(returnitemgsttax,0)-COALESCE(damageditemgsttax,0)+COALESCE(fgitemgsttax,0)+COALESCE(promoitemgsttax,0)-COALESCE(buybackgsttax,0)) from invoicedetail invt where invt.transactionkey = inv.transactionkey) as totVatTax,ifnull((select amount from cashcheckdetail where routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " and visitkey=inv.visitkey and typecode=0),0) cashamt,ifnull((select amount from cashcheckdetail where routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " and visitkey=inv.visitkey and typecode=1),0) chequeamt,inv.transactiondate as invdate,cm.creditlimitdays as creditdays,cm.CreditTerms as creditterms,inv.headerdiscounttaxamt as headerdiscounttaxamt,ifnull(cm.taxcardno,' ') as taxcard,ifnull(cm.crno,' ') as crno  FROM customermaster cm JOIN invoiceheader inv ON cm.customercode = inv.customercode AND inv.visitkey="
			+ sessionStorage.getItem("VisitKey")
			+ " AND inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " LEFT JOIN cashcheckdetail ccd ON ccd.visitkey = inv.visitkey AND ccd.routekey = inv.routekey LEFT JOIN bankmaster bm ON bm.bankcode = ccd.bankcode";

	console.log("getInvoiceInfo" + Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			if (result.length > 0)
			{
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

				invoicepaymentterms = result[0][14];
				customerOutlet = result[0][19];
				data["Cash"] = {
					"Amount" : result[0][15]
				};
				if (result[0][17] != '')
				{
					var d = new Date(result[0][17]);
					result[0][17] = (d.getDate() + "/" + (d.getMonth() + 1)
							+ "/" + d.getFullYear());
				}
				data["Cheque"] = [{
					"Cheque Date" : (result[0][17]).toString(),
					"Cheque No" : (result[0][18]),
					"Bank" : result[0][16],
					"Amount" : (result[0][15]).toString()
				}];
				GetSalesData('sales', '1');
			}
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{
		window.plugins.DataBaseHelper
				.select(Qry,
						function(result)
						{
							if (result.array != undefined)
							{
								result = $.map(result.array, function(item,
										index)
								{
									return [[item.customercode,
											item.customername, item.address,
											item.paymenttype,
											item.totalpromoamount,
											item.totalinvoiceamount,
											item.documentnumber,
											item.invoicenumber, item.comments,
											item.printstatus,
											item.invheadermsg,
											item.invtrailormsg,
											item.promoamount, item.tcamount,
											item.invoicepaymentterms,
											item.amount, item.bankname,
											item.checkdate, item.checknumber,
											item.outletsubtype,
											item.headerAmount,
											item.customeraddress2,
											item.customeraddress3,
											item.printoutletitemcode,
											item.alternatecode, item.splitfree,
											item.totalmanualfree,
											item.totaldiscountamount,
											item.arbcustomeraddress1,
											item.arbcustomeraddress2,
											item.arbcustomeraddress3,
											item.tsalesamt, item.treturnsamt,
											item.tdamagesamt, item.diffround,
											item.invoicepriceprint,
											item.roundnetamount,
											/* 37 */item.itemlinetaxamount,
											item.totaltaxesamount,
											item.printtax, item.applytax,
											item.taxregistrationnumber,
											item.salestax, item.returntax,
											item.damagetax, item.freetax,
											item.totExcTax, item.totVatTax,
											item.cashamt, item.chequeamt,
											item.invdate, item.creditdays,
											item.creditterms,
											item.headerdiscounttaxamt,
											item.taxcard, item.crno,
											item.returnpromoamount]];
								});
								// alert(JSON.stringify(result));
								customercode = result[0][0];
								customername = result[0][1];
								customeraddress1 = result[0][2];
								paymenttype = result[0][3];
								totalpromoamount = eval(result[0][4]).toFixed(
										decimalplace);
								totalinvoiceamount = eval(result[0][5])
										.toFixed(decimalplace);
								documentnumber = parseInt(eval(result[0][6]));
								invoicenumber = parseInt(eval(result[0][7]));
								comments = result[0][8];
								printstatus = result[0][9];
								invheadermsg = result[0][10];
								invtrailormsg = result[0][11];
								itempromoamount = eval(eval(result[0][12]))
										.toFixed(decimalplace);

								returnpromoamount = eval(eval(result[0][56]))
										.toFixed(decimalplace);

								tcamount = eval(result[0][13]).toFixed(
										decimalplace)
										- eval(result[0][15]).toFixed(
												decimalplace);
								invoicepaymentterms = result[0][14];
								data["Cash"] = {
									"Amount" : eval(result[0][15]).toFixed(
											decimalplace)
								};
								if (result[0][17] != '')
								{
									var d = new Date(result[0][17]);
									result[0][17] = (d.getDate() + "/"
											+ (d.getMonth() + 1) + "/" + d
											.getFullYear());
								}
								data["Cheque"] = [{
									"Cheque Date" : (result[0][17]).toString(),
									"Cheque No" : (result[0][18]),
									"Bank" : result[0][16],
									"Amount" : (eval(result[0][15])
											.toFixed(decimalplace))
								}];
								customerOutlet = result[0][19];
								headerAmount = result[0][20];
								customeraddress2 = result[0][21];
								customeraddress3 = result[0][22];
								printoutletitemcode = result[0][23];
								alternatecode = result[0][24];

								if (customerOutlet == null
										|| customerOutlet == ''
										|| customerOutlet == undefined)
								{

									customerOutlet = 0;

								}
								splitfree = result[0][25];
								var manualfree = result[0][26];
								manualfreediscount = eval(result[0][27]);
								customeraddress = customeraddress1;
								customeradd1 = customeraddress1;

								if (customeraddress2 != '')
									customeraddress = customeraddress + ", "
											+ customeraddress2;
								customeradd2 = customeraddress2;
								if (customeraddress3 != '')
									customeraddress = customeraddress + ", "
											+ customeraddress3;
								customeradd3 = customeraddress3;

								var arbcustomeraddress1 = result[0][30];
								var arbcustomeraddress2 = result[0][29];
								var arbcustomeraddress3 = result[0][28];
								if (eval(result[0][36]) == 1)
								{
									totalfinalamount = eval(result[0][31])
											- eval(result[0][32])
											- eval(result[0][33])
											- eval(result[0][34]);
								} else
								{
									totalfinalamount = eval(result[0][31])
											- eval(result[0][32])
											- eval(result[0][33]);
								}

								invoicepriceprint = eval(result[0][35]);
								arbcustomeraddress = arbcustomeraddress1;

								if (arbcustomeraddress2 != '')
									arbcustomeraddress = arbcustomeraddress
											+ ", " + arbcustomeraddress2;
								if (arbcustomeraddress3 != '')
									arbcustomeraddress = arbcustomeraddress
											+ ", " + arbcustomeraddress3;

								printtax = eval(result[0][39]);
								applytax = eval(result[0][40]);
								taxregistrationnumber = result[0][41];

								if (result[0][39] == null
										|| result[0][39] == ''
										|| result[0][39] == undefined)
								{
									printtax = 0;
								}
								if (result[0][40] == null
										|| result[0][40] == ''
										|| result[0][40] == undefined)
								{
									applytax = 0;
								}
								if (result[0][41] == null
										|| result[0][41] == ''
										|| result[0][41] == undefined)
								{
									taxregistrationnumber = 0;
								}

								data["SALESTAX"] = eval(result[0][42]).toFixed(
										decimalplace);
								data["RETURNTAX"] = eval(result[0][43])
										.toFixed(decimalplace);
								data["DAMAGEDTAX"] = eval(result[0][44])
										.toFixed(decimalplace);
								data["FREETAX"] = eval(result[0][45]).toFixed(
										decimalplace);

								data["TOTEXC"] = eval(result[0][46]).toFixed(
										decimalplace);
								// data["TOTVAT"]=eval(result[0][47]).toFixed(decimalplace);

								data["TOTVAT"] = eval(
										result[0][47] - result[0][53]).toFixed(
										decimalplace);

								var cashamt = eval(result[0][48]).toFixed(
										decimalplace);

								data["Cash"] = {
									"Amount" : eval(result[0][15]).toFixed(
											decimalplace)
								};
								// alert('data["Cash"]' +data["Cash"]);

								var chequeamt = eval(result[0][49]).toFixed(
										decimalplace);
								if (cashamt == 0)
								{

									data["ptype"] = 1;
								} else if (chequeamt == 0)
								{
									data["ptype"] = 0;

								} else if (cashamt > 0 && chequeamt > 0)
								{
									data["ptype"] = 2;

								}
								// var
								// paymentduedate=addDaysToDate(getTabletDate(),eval(result[0][51]));
								var dfscustomer = result[0][52];
								// alert('paymentduedate' +paymentduedate);
								if (dfscustomer === 'DFS')
								{
									var date = new Date();
									var time = new Date(date.getTime());
									time.setMonth(date.getMonth() + 1);
									time.setDate(0);
									var days = time.getDate() > date.getDate()
											? time.getDate() - date.getDate()
											: 0;

									var caldays = eval(result[0][51]) + days;

									var paymentduedate = addDaysToDate(
											getTabletDate(), caldays);

								} else
								{
									var paymentduedate = addDaysToDate(
											getTabletDate(),
											eval(result[0][51]));
								}

								data["PAYMENTDUEDATE"] = paymentduedate;

								headerdiscounttaxamt = eval(result[0][53])
										.toFixed(decimalplace);

								data["TAXCARDNO"] = result[0][54];
								data["CRNO"] = result[0][55];

								// GetSalesData('sales');
								// 0 For display Discount and 1 For Report have
								// UPC
								checkInvoiceHeader('sales', '1', manualfree,
										splitfree);
							}
						}, function()
						{
							console.warn("Error calling plugin");
						});
	}
}

function checkInvoiceHeader(trans, val, manualfree, splitfree)
{

	if (eval(manualfree) > 0 && splitfree == '1')
	{

		GetSalesData('sales', '1', true);
	} else
	{

		GetSalesData('sales', '1', false);
	}

}

function GetSalesData(trans, val, isFree)
{

	// alert("GetSalesData");
	// getroutedate();
	if (val == '1')
	{
		/*
		 * var total = { "QTY CAS/PCS" : "0/0", "TOTAL PCS" : "0", "DISCOUNT" :
		 * "0", "AMOUNT" : "0" }; var Header = ["SL#","ITEM#","OUTLET CODE",
		 * "DESCRIPTION", "UPC", "QTY CAS/PCS", "TOTAL PCS", "CASE PRICE", "UNIT
		 * PRICE","DISCOUNT", "AMOUNT"];
		 */

		var total = {
			"QTY CAS/PCS" : "0/0",
			"TOTAL PCS" : "0",
			"DISCOUNT" : "0",
			"TAX" : "0",
			"AMOUNT" : "0",
			"AMOUNT AFTER VAT" : "0"
		};
		var Header = ["SL#", "ITEM#", "OUTLET CODE", "BARCODE", "DESCRIPTION",
				"UPC", "QTY CAS/PCS", "TOTAL PCS", "CASE PRICE", "UNIT PRICE",
				"DISCOUNT", "AMOUNT", "EXC TAX", "VAT", "AMOUNT AFTER VAT",
				"GROSS AMT"];

	} else
	{
		/*
		 * var total = { "QTY CAS/PCS" : "0/0", "DISCOUNT" : "0", "AMOUNT" : "0" };
		 * var Header = ["SL#", "ITEM#","OUTLET CODE", "DESCRIPTION", "QTY
		 * CAS/PCS", "TOTAL PCS", "CASE PRICE", "UNIT PRICE", "DISCOUNT",
		 * "AMOUNT"];
		 */
		var total = {
			"QTY CAS/PC" : "0/0",
			"DISCOUNT" : "0",
			"TAX" : "0",
			"AMOUNT" : "0",
			"AMOUNT AFTER VAT" : "0"
		};
		var Header = ["SL#", "ITEM#", "OUTLET CODE", "BARCODE", "DESCRIPTION",
				"QTY CAS/PCS", "TOTAL PCS", "CASE PRICE", "UNIT PRICE",
				"DISCOUNT", "AMOUNT", "EXC TAX", "VAT", "AMOUNT AFTER VAT",
				"GROSS AMT"];
	}
	total["EXC TAX"] = "0.00";
	total["VAT"] = "0.00";

	/*
	 * var HeaderFree = ["SL#", "ITEM#","OUTLET CODE", "DESCRIPTION", "UPC",
	 * "QTY CAS/PCS", "TOTAL PCS", "CASE PRICE", "UNIT PRICE","DISCOUNT",
	 * "AMOUNT"]
	 */
	var HeaderFree = ["SL#", "ITEM#", "OUTLET CODE", "BARCODE", "DESCRIPTION",
			"UPC", "QTY CAS/PCS", "TOTAL PCS", "CASE PRICE", "UNIT PRICE",
			"DISCOUNT", "AMOUNT", "EXC TAX", "VAT", "AMOUNT AFTER VAT",
			"GROSS AMT"]
	
	var QrySales = "SELECT DISTINCT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((salesqty/unitspercase) AS INT),0) ELSE (IFNULL(CAST((salesqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((salesqty%unitspercase) AS INT),0)) END AS 'quantity',salesqty AS 'tqty',IFNULL(salescaseprice,0) AS caseprice,IFNULL(salesprice,0) AS unitprice,IFNULL(promoamount,0) as discount,(((IFNULL(CAST((salesqty/unitspercase) AS INT),0) * IFNULL(salescaseprice,0)) + (IFNULL(CAST((salesqty%unitspercase) AS INT),0)) * IFNULL(salesprice,0)) - IFNULL(promoamount,0)) +  IFNULL(inv.diffround,0) AS 'amount',arbitemshortdescription AS arbdescription,barcode1 as barcode,COALESCE(salesitemexcisetax,0) as excisetax, COALESCE(salesitemgsttax,0) as  vat,(((IFNULL(CAST((salesqty/unitspercase) AS INT),0) * IFNULL(salescaseprice,0)) + (IFNULL(CAST((salesqty%unitspercase) AS INT),0)) * IFNULL(salesprice,0)) - IFNULL(promoamount,0) +IFNULL(inv.diffround,0) + IFNULL(inv.salesitemgsttax,0)) AS 'amountav',(((IFNULL(CAST((salesqty/unitspercase) AS INT),0) * IFNULL(salescaseprice,0)) + (IFNULL(CAST((salesqty%unitspercase) AS INT),0)) * IFNULL(salesprice,0)) +IFNULL(inv.diffround,0)) AS 'grossamount' FROM invoicedetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and inv.salesqty > 0 JOIN invoiceheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="
			+ customerOutlet
			+ "  left join taxmaster tm on tm.taxcode=im.itemtaxkey2  WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1  order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";

	var QryFree = "SELECT DISTINCT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((manualfreeqty/unitspercase) AS INT),0)  ELSE (IFNULL(CAST((manualfreeqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((manualfreeqty%unitspercase) AS INT),0)) END AS 'quantity',manualfreeqty AS 'tqty',0 AS caseprice,0 AS unitprice,0 AS 'discount',0 AS 'amount',arbitemshortdescription AS arbdescription,barcode1 as barcode,COALESCE(fgitemexcisetax,0)as excisetax,COALESCE(fgitemgsttax,0)  as vat,0 AS 'amountav',0 as grossamount FROM invoicedetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and inv.manualfreeqty > 0 JOIN invoiceheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="
			+ customerOutlet
			+ "   left join taxmaster tm on tm.taxcode=im.itemtaxkey2  WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1 order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";

	var QryPromoFree = "SELECT DISTINCT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription  AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((freesampleqty/unitspercase) AS INT),0)  ELSE (IFNULL(CAST((freesampleqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((freesampleqty%unitspercase) AS INT),0)) END AS 'quantity',freesampleqty AS 'tqty',IFNULL(salescaseprice,0) AS caseprice,IFNULL(salesprice,0) AS unitprice,0 AS 'discount',0 AS 'amount',arbitemshortdescription AS arbdescription,barcode1 as barcode,COALESCE(promoitemexcisetax,0)as excisetax,CASE WHEN tm.taxpercentage IS NULL THEN 0 ELSE  CAST(tm.taxpercentage  AS INT)   END  as vat,0 AS 'amountav' FROM invoicedetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and freesampleqty > 0 JOIN invoiceheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="
			+ customerOutlet
			+ " left join taxmaster tm on tm.taxcode=im.itemtaxkey2  WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";

	var QryGood = "SELECT DISTINCT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((returnqty/unitspercase) AS INT),0)  ELSE (IFNULL(CAST((returnqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((returnqty%unitspercase) AS INT),0)) END AS 'quantity',returnqty AS 'tqty',IFNULL(goodreturncaseprice,0) AS caseprice,IFNULL(goodreturnprice,0) AS unitprice,IFNULL(case when returnpromoamount = 0 then 0 else ( (ifnull(returnqty,0) * 100 ) / ( ifnull(returnqty,0) + ifnull(damagedqty,0) + ifnull(expiryqty,0) ) ) * returnpromoamount / 100 end,0) as discount,(((IFNULL(CAST((returnqty/unitspercase) AS INT),0) * IFNULL(goodreturncaseprice,0)) + (IFNULL(CAST((returnqty%unitspercase) AS INT),0)) * IFNULL(goodreturnprice,0)) - IFNULL(case when returnpromoamount = 0 then 0 else ( (ifnull(returnqty,0) * 100 ) / ( ifnull(returnqty,0) + ifnull(damagedqty,0) + ifnull(expiryqty,0) ) ) * returnpromoamount / 100 end,0) - IFNULL(roundsalesamount,0) + IFNULL(inv.diffround,0)) AS 'amount',arbitemshortdescription AS arbdescription,barcode1 as barcode,ABS(COALESCE(returnitemexcisetax,0))as excisetax,ABS(COALESCE(returnitemgsttax,0))  as vat,(((IFNULL(CAST((returnqty/unitspercase) AS INT),0) * IFNULL(goodreturncaseprice,0)) + (IFNULL(CAST((returnqty%unitspercase) AS INT),0)) * IFNULL(goodreturnprice,0)) - IFNULL(case when returnpromoamount = 0 then 0 else ( (ifnull(returnqty,0) * 100 ) / ( ifnull(returnqty,0) + ifnull(damagedqty,0) + ifnull(expiryqty,0) ) ) * returnpromoamount / 100 end,0) - IFNULL(roundsalesamount,0)+  IFNULL(inv.diffround,0) + ABS(COALESCE(returnitemgsttax,0))) AS 'amountav',(((IFNULL(CAST((returnqty/unitspercase) AS INT),0) * IFNULL(goodreturncaseprice,0)) + (IFNULL(CAST((returnqty%unitspercase) AS INT),0)) * IFNULL(goodreturnprice,0)) +  IFNULL(inv.diffround,0)) AS 'grossamount'  FROM invoicedetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and inv.returnqty > 0 JOIN invoiceheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="
			+ customerOutlet
			+ "  left join taxmaster tm on tm.taxcode=im.itemtaxkey2 WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1  order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";

	

	var QryBuyback = "SELECT DISTINCT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((returnfreeqty/unitspercase) AS INT),0)  ELSE (IFNULL(CAST((returnfreeqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((returnfreeqty%unitspercase) AS INT),0)) END AS 'quantity',returnfreeqty AS 'tqty',IFNULL(goodreturncaseprice,0) AS caseprice,IFNULL(goodreturnprice,0) AS unitprice,IFNULL(returnpromoamount,0) as discount,0 AS 'amount',arbitemshortdescription AS arbdescription,barcode1 as barcode,ABS(COALESCE(buybackexcisetax,0))as excisetax,ABS(COALESCE(buybackgsttax,0))  as vat,0 AS 'amountav' , 0 as grossamount  FROM invoicedetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and inv.returnfreeqty > 0 JOIN invoiceheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="
			+ customerOutlet
			+ "  left join taxmaster tm on tm.taxcode=im.itemtaxkey2  WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1  order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";

	

	var QryBad = "SELECT DISTINCT  0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((damagedqty/unitspercase) AS INT),0)  ELSE (IFNULL(CAST((damagedqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((damagedqty%unitspercase) AS INT),0)) END AS 'quantity',damagedqty AS 'tqty',IFNULL(inv.returncaseprice,0) AS caseprice,IFNULL(inv.returnprice,0) AS unitprice,IFNULL(case when returnpromoamount = 0 then 0 else ( (ifnull(damagedqty,0) * 100 ) / ( ifnull(returnqty,0) + ifnull(damagedqty,0) + ifnull(expiryqty,0) ) ) * returnpromoamount / 100 end,0) as discount,(((IFNULL(CAST((damagedqty/unitspercase) AS INT),0) * IFNULL(inv.returncaseprice,0)) + (IFNULL(CAST((damagedqty%unitspercase) AS INT),0)) * IFNULL(inv.returnprice,0)) - IFNULL(case when returnpromoamount = 0 then 0 else ( (ifnull(damagedqty,0) * 100 ) / ( ifnull(returnqty,0) + ifnull(damagedqty,0) + ifnull(expiryqty,0) ) ) * returnpromoamount / 100 end,0) - IFNULL(roundsalesamount,0) + IFNULL(inv.diffround,0)) AS 'amount',arbitemshortdescription AS arbdescription,barcode1 as barcode,ABS(COALESCE(damageditemexcisetax,0))as excisetax,ABS(COALESCE(damageditemgsttax,0))  as vat,(((IFNULL(CAST((damagedqty/unitspercase) AS INT),0) * IFNULL(inv.returncaseprice,0)) + (IFNULL(CAST((damagedqty%unitspercase) AS INT),0)) * IFNULL(inv.returnprice,0)) - IFNULL(case when returnpromoamount = 0 then 0 else ( (ifnull(damagedqty,0) * 100 ) / ( ifnull(returnqty,0) + ifnull(damagedqty,0) + ifnull(expiryqty,0) ) ) * returnpromoamount / 100 end,0) - IFNULL(roundsalesamount,0)+  IFNULL(inv.diffround,0) + ABS(COALESCE(damageditemgsttax,0))) AS 'amountav',(((IFNULL(CAST((damagedqty/unitspercase) AS INT),0) * IFNULL(inv.returncaseprice,0)) + (IFNULL(CAST((damagedqty%unitspercase) AS INT),0)) * IFNULL(inv.returnprice,0))  +  IFNULL(inv.diffround,0)) AS 'grossamount' FROM invoicedetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and inv.damagedqty > 0 JOIN invoiceheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="
			+ customerOutlet
			+ "  left join taxmaster tm on tm.taxcode=im.itemtaxkey2 WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1  order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";

	

	console.log("nidhi2----" + QryBad);
	var Qry;
	if (trans == 'sales')
		Qry = QrySales;
	else if (trans == 'free')
	{
		Qry = QryFree;
		Header = HeaderFree;
		delete total["Discount"];
	} else if (trans == 'promofree')
	{
		Qry = QryPromoFree;
		Header = HeaderFree;
		delete total["Discount"];
	} else if (trans == 'good')
	{
		Qry = QryGood;
	} else if (trans == 'buyback')
	{
		Qry = QryBuyback;
	} else if (trans == 'bad')
	{
		Qry = QryBad;
	}

	console.log("nidhi1----" + Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
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
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{

		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				if (trans == 'free' || trans == 'promofree')
				{

					if (eval(printbarcode) == 1)
					{
						result = $.map(result.array, function(item, index)
						{
							return [[item.sl, item.itemcode, item.outletcode,
									item.description, item.upc, item.quantity,
									item.tqty, item.caseprice, item.unitprice,
									item.discount, item.excisetax, item.vat,
									item.amount, item.amountav,
									item.grossamount, item.barcode]];
						});
					} else
					{
						result = $.map(result.array, function(item, index)
						{
							return [[item.sl, item.itemcode, item.outletcode,
									item.description, item.upc, item.quantity,
									item.tqty, item.caseprice, item.unitprice,
									item.discount, item.excisetax, item.vat,
									item.amount, item.amountav,
									item.grossamount, item.arbdescription,
									item.barcode]];
						});
					}

				} else
				{

					if (eval(printbarcode) == 1)
					{
						result = $.map(result.array, function(item, index)
						{
							// Start for display UPC or Discount

							if (val == '1')
							{
								return [[item.sl, item.itemcode,
										item.outletcode, item.description,
										item.upc, item.quantity, item.tqty,
										item.caseprice, item.unitprice,
										item.discount, item.excisetax,
										item.vat, item.amount, item.amountav,
										item.grossamount, item.barcode]];
							} else
							{
								return [[item.sl, item.itemcode,
										item.outletcode, item.description,
										item.quantity, item.tqty,
										item.caseprice, item.unitprice,
										item.discount, item.excisetax,
										item.vat, item.amount, item.amountav,
										item.grossamount, item.barcode]];
							}

						});
					} else
					{

						result = $.map(result.array, function(item, index)
						{
							// Start for display UPC or Discount

							if (val == '1')
							{
								return [[item.sl, item.itemcode,
										item.outletcode, item.description,
										item.upc, item.quantity, item.tqty,
										item.caseprice, item.unitprice,
										item.discount, item.excisetax,
										item.vat, item.amount, item.amountav,
										item.grossamount, item.arbdescription,
										item.barcode]];
							} else
							{
								return [[item.sl, item.itemcode,
										item.outletcode, item.description,
										item.quantity, item.tqty,
										item.caseprice, item.unitprice,
										item.discount, item.excisetax,
										item.vat, item.amount, item.amountav,
										item.grossamount, item.arbdescription,
										item.barcode]];
							}

						});

					}
				}
			} else
				result = [];
			// alert(JSON.stringify(result));
			SetSalesTransaction(trans, result, Header, total, isFree);
			if (trans == 'sales')
				// GetSalesData('free');
				GetSalesData('good', '1', isFree); // Added for display UPC
			if (trans == 'good')
				// GetSalesData('bad');
				GetSalesData('buyback', '1', isFree); // Added for display UPC
			if (trans == 'buyback')
				// GetSalesData('bad');
				GetSalesData('bad', '1', isFree); // Added for display UPC

			if (trans == 'bad')
				// GetSalesData('promofree');
				GetSalesData('promofree', '1', isFree); // Added for display UPC

			if (trans == 'promofree' && !isFree)
				// GetSalesData('good');
				GetSalesData('free', '1', isFree); // Added for display UPC

		}, function()
		{
			console.warn("Error calling plugin");
		});
	}

	// //}

}

function SetSalesTransaction(trans, result, Header, Total, isFree)
{
	// alert(JSON.stringify(result));
	for (i = 0; i < result.length; i++)
	{
		for (j = 0; j < result[i].length; j++)
		{
			if (j == 1)
			{
				if (sessionStorage.getItem("CheckCode") == 'ancode'
						&& !isNaN(result[i][j]))
				{
					result[i][j] = parseInt(result[i][j], 10);
				}
				result[i][j] = (result[i][j]).toString();
			}
			if (j == 2)
			{
				if (!isNaN(result[i][j]) && result[i][j] != '-')
				{
					result[i][j] = parseInt(eval(result[i][j]));
					result[i][j] = (result[i][j]).toString();
				} else
				{
					result[i][j] = ("  ").toString();
				}

			}
			if (j == 5)
			{
				var qtykey = "QTY CAS/PCS";
				QuantityTotal(Total, qtykey, result[i][j]);
			}
			if (j == 6)
			{
				var qtykey = "TOTAL PCS";
				QTotal(Total, qtykey, result[i][j]);
			}

			else if (j == 9 && trans != 'free' && trans != 'promofree')
			{
				result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
				Total.DISCOUNT = (eval(Total.DISCOUNT) + eval(result[i][j]))
						.toString();
			} else if (j == 9 && (trans == 'free'))
				Total.AMOUNT = (eval(Total.AMOUNT) + eval(result[i][j]))
				/*
				 * else if (j == 10 && trans != 'free') Total.AMOUNT =
				 * (eval(Total.AMOUNT) + eval(result[i][j]))
				 */
			else if (j == 10)
			{
				result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
				Total.TAX = (eval(Total.TAX) + eval(result[i][j])).toString();
				Total["EXC TAX"] = (eval(Total["EXC TAX"]) + eval(result[i][j]));
			} else if (j == 11)
			{
				/*
				 * result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
				 * Total.TAX = (eval(Total.TAX) + eval(result[i][j]))
				 * .toString(); Total["VAT"] = (eval(Total["VAT"]) +
				 * eval(result[i][j]));
				 */
				if (result[i][j].indexOf("(") != -1)
				{
					var tax = result[i][j].substring(0, result[i][j]
							.indexOf("("));
					var vatrate = result[i][j].substring(result[i][j]
							.indexOf("("), result[i][j].length);
					console.log("ARUN1 " + tax);
					console.log("ARUN2 " + vatrate);
					tax = (eval(tax).toFixed(decimalplace));
					result[i][j] = tax + vatrate;
					console.log("ARUN3 " + result[i][j]);
					Total.TAX = (eval(Total.TAX) + eval(tax)).toString();
					Total["VAT"] = (eval(Total["VAT"]) + eval(tax));
				} else
				{
					result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
					Total.TAX = (eval(Total.TAX) + eval(result[i][j]))
							.toString();
					Total["VAT"] = (eval(Total["VAT"]) + eval(result[i][j]));
				}
			} else if (j == 12 && trans != 'free')
			{
				Total.AMOUNT = (eval(Total.AMOUNT) + eval(result[i][j]))
						.toFixed(decimalplace).toString();

			} else if (j == 12 && trans == 'free')
			{
				Total.AMOUNT = (eval(Total.AMOUNT) + eval(result[i][j]))
						.toFixed(decimalplace).toString();

			} else if (j == 13)
			{

				Total["AMOUNT AFTER VAT"] = (eval(Total["AMOUNT AFTER VAT"]) + eval(result[i][j]))
						.toFixed(decimalplace).toString();

			}

			if (j > 6 && j <= 14)
			{
				// result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
				if (j != 11)
				{
					if (result[i][j] != undefined)
					{
						result[i][j] = (eval(result[i][j]))
								.toFixed(decimalplace);
					} else
					{
						result[i][j] = 0.000;
					}

				}
			}
		}
	}

	if (isNaN(Total.DISCOUNT))
		Total.DISCOUNT = 0;
	if (isNaN(Total.AMOUNT))
		Total.AMOUNT = 0;
	Total.DISCOUNT = eval(parseFloat(Total.DISCOUNT)).toFixed(decimalplace);
	Total.AMOUNT = eval(parseFloat(Total.AMOUNT)).toFixed(decimalplace);
	Total["AMOUNT AFTER VAT"] = eval(parseFloat(Total["AMOUNT AFTER VAT"]))
			.toFixed(decimalplace);
	console.log("TOTALQTY : " + Total.QUANTITY);
	Total["VAT"] = eval(Total["VAT"]).toFixed(decimalplace);
	// SetData(trans,result,Header,total);
	if (data["data"] == undefined)
		data["data"] = [];
	data["data"].push({
		"TITLE" : trans,
		"DATA" : result,
		"HEADERS" : Header,
		"TOTAL" : Total
	});

	if ((isFree && trans == "promofree") || trans == "free")
	{

		// alert(1);
		getCommonData();
		var invoicetype = ""
		var companyTaxStng = sessionStorage.getItem("enabletax");
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

		// if (invoicepaymentterms == 0 || invoicepaymentterms == 1)
		// invoicetype = "CASH INVOICE: " + invoicenumber;
		// else if (invoicepaymentterms == 3 || invoicepaymentterms == 4)
		// invoicetype = "CASH/TC INVOICE: " + invoicenumber;
		// else if (invoicepaymentterms == 2)
		// invoicetype = "CREDIT INVOICE: " + invoicenumber;

		/*
		 * sujee commented 29/07/2018 to shw cash/credit invoice on header
		 * if(eval(headerAmount)>=0){ invoicetype = "SALES INVOICE " +
		 * invoicenumber;
		 * 
		 * }else{ invoicetype = "CREDIT NOTE " + invoicenumber; }
		 */

		if (companyTaxStng == 1)
		{
			// alert(eval(headerAmount));
			if (eval(headerAmount) >= 0)
			{
				invoicetype = "TAX INVOICE ";
			} else
			{
				invoicetype = "TAX CREDIT NOTE ";
			}
		} else
		{

			if (invoicepaymentterms == 0 || invoicepaymentterms == 1)
			{
				if (eval(headerAmount) >= 0)
				{
					invoicetype = "CASH INVOICE: " + invoicenumber;
				} else
				{
					invoicetype = "CASH NOTE: " + invoicenumber;
				}

			} else if (invoicepaymentterms == 3 || invoicepaymentterms == 4)

			{
				if (eval(headerAmount) >= 0)
				{
					invoicetype = "CASH/TC INVOICE: " + invoicenumber;
				} else
				{
					invoicetype = "CASH/TC NOTE: " + invoicenumber;
				}

			} else if (invoicepaymentterms == 2)
			{
				if (eval(headerAmount) >= 0)
				{
					invoicetype = "CREDIT INVOICE: " + invoicenumber;
				} else
				{
					invoicetype = "CREDIT NOTE: " + invoicenumber;
				}
			}

		}
		data["enabletax"] = sessionStorage.getItem("enabletax");
		data["companytaxregistrationnumber"] = sessionStorage
				.getItem("companytaxregistrationnumber");
		data["invoicepaymentterms"] = invoicepaymentterms;

		data["invoicepaymentterms"] = invoicepaymentterms;
		data["invoicenumber"] = invoicenumber;
		data["INVOICETYPE"] = invoicetype;

		// sujee commented For Enahcne Grp 21/05/2018
		data["CUSTOMER"] = alternatecode + "   " + customername + ""; // "5416-SWITZ
		// MASTER BAKERS
		// (Cr)";
		data["CUSTOMERID"] = alternatecode + "";
		data["CUSTOMERNAME"] = customername + "";

		// data["CUSTOMER"] = alternatecode;

		data["ADDRESS"] = customeraddress; // "Suite 808, Burjuman Business
		// Tower";

		data["ADDRESS1"] = customeradd1;
		data["ADDRESS2"] = customeradd2;
		data["ADDRESS3"] = customeradd3;

		data["ARBADDRESS"] = arbcustomeraddress; // "Suite 808, Burjuman
		// Business Tower";
		data["invoicepriceprint"] = invoicepriceprint;

		data["printtax"] = printtax;
		data["applytax"] = applytax;
		data["taxregistrationnumber"] = taxregistrationnumber;

		if (comments == 0 || comments == "0")
			comments = "";
		data["comments"] = unescape(comments);
		data["printstatus"] = getPrintStatus();
		console.log("itempromoamount-----nidhi" + itempromoamount);
		// data["SUB TOTAL"] = eval(headerAmount).toFixed(
		// decimalplace).toString();

		// sujee commented 01/06/2018
		/*
		 * data["SUB TOTAL"] = eval(totalfinalamount).toFixed(
		 * decimalplace).toString();
		 */

		// data["SUB TOTAL"] = (eval(totalfinalamount) -
		// eval(itempromoamount)).toFixed(decimalplace).toString();
		data["GROSS AMOUNT"] = (eval(Math.abs(totalinvoiceamount))).toFixed(decimalplace).toString();

		var invoiceheaderdiscount = eval(Math.abs(totalpromoamount)) - eval(Math.abs(itempromoamount)) - eval(Math.abs(returnpromoamount));
    
		data["AMOUNT BEFORE VAT"] = (eval(Math.abs(totalfinalamount)) - eval(Math.abs(invoiceheaderdiscount)) - eval(Math.abs(itempromoamount)) - eval(Math.abs(returnpromoamount))).toFixed(decimalplace).toString();
		
		data["SUB TOTAL"] = eval(headerAmount).toFixed(decimalplace).toString();

		data["printoutletitemcode"] = printoutletitemcode;

		/*
		 * data["INVOICE DISCOUNT"] = (totalpromoamount - itempromoamount+
		 * eval(manualfreediscount)) .toFixed(decimalplace).toString();
		 */

		// commented on 29-01-2023
		// data["INVOICE DISCOUNT"] = (eval(itempromoamount) +
		// eval(manualfreediscount)).toFixed(decimalplace).toString();
		data["INVOICE DISCOUNT"] = Math.abs((eval(Math.abs(itempromoamount)) + eval(Math.abs(manualfreediscount)) - eval(Math.abs(returnpromoamount)))).toFixed(decimalplace).toString();
		// end-----

		// data["INVOICE HEADER DISCOUNT"] =
		// (eval(totalpromoamount)).toFixed(decimalplace).toString();
		// commented on 29-01-2023
		// data["INVOICE HEADER DISCOUNT"] = (eval(totalpromoamount) -
		// eval(itempromoamount)).toFixed(decimalplace).toString();
		var finalpromoamount = eval(itempromoamount) - eval(returnpromoamount);
		data["INVOICE HEADER DISCOUNT"] = (eval(Math.abs(totalpromoamount)) - eval(Math.abs(finalpromoamount))).toFixed(decimalplace).toString();
		// end-----
		data["VAT CASH DISCOUNT"] = (eval(headerdiscounttaxamt)).toFixed(
				decimalplace).toString();

		data["printbarcode"] = eval(printbarcode);
		// data["NET SALES"]
		// =eval(headerAmount).toFixed(decimalplace).toString();
		// var netsales= eval(headerAmount)- eval(headerdiscounttaxamt);
		// //eval(totalfinalamount)-eval(itempromoamount);
		// data["NET SALES"] =eval(netsales).toFixed(decimalplace).toString();
		var netsales = eval(totalfinalamount) - eval(itempromoamount);
		data["NET SALES"] = eval(netsales).toFixed(decimalplace).toString();

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
		data["TCCHARGED"] = (tcamount - totalpromoamount).toFixed(decimalplace)
				.toString();

		if (paymenttype == 0)
		{
			data["PaymentType"] = "0";
		} else if (paymenttype == 4)
		{
			data["PaymentType"] = "1";
		} else if (paymenttype == 1)
		{
			data["PaymentType"] = "2";
		} else
			data["PaymentType"] = "0";

		if (invoicepaymentterms > 2)
			data["TCALLOWED"] = "1";
		else
			data["TCALLOWED"] = "0";
		console.log(JSON.stringify(data));

		ArrPrint.push([{
			"mainArr" : data,
			"name" : ReportName.Sales
		}]);

		if (isFree && trans == 'promofree')
		{
			var paymentdata = {};
			paymentdata["Cash"] = data["Cash"];
			paymentdata["Cheque"] = data["Cheque"];

			data = {};
			data["Cash"] = paymentdata["Cash"];
			data["Cheque"] = paymentdata["Cheque"];
			paymentdata = {};
			GetSalesData('free', '1', isFree);

		}
		if (trans == "free")
		{
			PrintReportArray();

		}

	}
}

function alertpromo()
{
	var Qry = "SELECT promoamount FROM invoicedetail WHERE itemcode IN(21,35) AND routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND visitkey="
			+ sessionStorage.getItem("VisitKey");
	window.plugins.DataBaseHelper.select(Qry, function(result)
	{
		if (result.array != undefined)
		{
			console.log(JSON.stringify(result.array));
			alert('promoamount');
		}
	}, function()
	{
		console.warn("Error calling plugin");
	});
}

function getAPInfo()
{
	data = {};
	var Qry = "SELECT cm.customercode,customername,customeraddress1 as address,typecode,CAST(amount AS VARCHAR) amount,bankname,checkdate,checknumber,invoicenumber,comments,printstatus,(SELECT CASE cm.messagekey5 WHEN 0 THEN '' ELSE messageline1 || messageline2 || messageline3 || messageline4 END FROM customermessages WHERE messagekey = messagekey5) AS invheadermsg,cm.alternatecode,(SELECT sum(ci.invoicebalance) FROM customerinvoice ci WHERE ci.customercode=arh.customercode and ci.invoicebalance>0 ) as custbalance FROM dcarheader arh JOIN customermaster cm ON cm.customercode = arh.customercode JOIN dcarcashcheckdetail ccd ON ccd.visitkey = arh.visitkey LEFT JOIN bankmaster bm ON bm.bankcode = ccd.bankcode WHERE arh.visitkey = "
			+ sessionStorage.getItem("VisitKey");
	console.log(Qry);
	// alert(Qry);
	if (platform == 'Android')
	{
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				result = $.map(result.array, function(item, index)
				{
					return [[item.customercode, item.customername,
							item.address, item.typecode, item.amount,
							item.bankname, item.checkdate, item.checknumber,
							item.invoicenumber, item.comments,
							item.printstatus, item.invheadermsg,
							item.alternatecode, item.custbalance]];
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
				if (result[0][6] != '')
				{
					var d = new Date(result[0][6]);
					result[0][6] = (d.getDate() + "/" + (d.getMonth() + 1)
							+ "/" + d.getFullYear());
				}
				data["Cheque"] = [{
					"Cheque Date" : (result[0][6]).toString(),
					"Cheque No" : (result[0][7]).toString(),
					"Bank" : result[0][5].toString(),
					"Amount" : (amount).toString()
				}];
				invoicenumber = (result[0][8]).toString();
				comments = result[0][9];
				printstatus = result[0][10];
				invheadermsg = result[0][11];
				alternatecode = result[0][12];
				data["CustBalance"] = result[0][13]; // sujee added
				// 27/06/2018
				getAPCollection();
			}
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function getAPCollection()
{

	var Qry = "SELECT CASE WHEN '"
			+ localStorage.getItem("alternatepending")
			+ "' = '1' THEN ard.alternateinvoicenumber ELSE ard.invoicenumber END as invoicenumber,(SELECT STRFTIME('%d/%m/%Y',transactiondate) FROM customerinvoice WHERE invoicenumber=ard.invoicenumber)  AS invoicedate,ard.totalinvoiceamount,(ard.invoicebalance+ard.amountpaid) as previousbalance,ard.amountpaid,(ard.invoicebalance) AS invoicebalance FROM dcardetail ard JOIN dcarheader arh ON ard.transactionkey = arh.transactionkey WHERE arh.invoicenumber ="
			+ invoicenumber;
	console.log(Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			if (result.length <= 0)
				result = [];
			ProcessCollection(result);
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				result = $.map(result.array, function(item, index)
				{
					return [[item.invoicenumber, item.invoicedate,
							item.totalinvoiceamount, item.previousbalance,
							item.amountpaid, item.invoicebalance]];
				});
			} else
				result = [];

			ProcessAPCollection(result);
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function ProcessAPCollection(result)
{
	getCommonData();
	data["RECEIPT"] = invoicenumber;
	data["CUSTOMER"] = alternatecode + "   " + customername;

	data["ADDRESS"] = customeraddress;
	if (comments == 0 || comments == "0")
		comments = "";
	data["comments"] = unescape(comments);
	data["HEADERS"] = ["Invoice#", "Due Date", "Invoice Amount",
			"Previous Balance", "Amount Paid", "Invoice Balance"];
	var totalamount = 0;
	for (i = 0; i < result.length; i++)
	{
		for (j = 0; j < result[i].length; j++)
		{
			if (j == 0)
			{

				result[i][j] = (result[i][j]).toString();
			}
			if (j == 4 || j == 7 || j == 8 || j == 3 || j == 2)
			{
				if (result[i][j] != "")
					result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
			}

			if (j == 4)
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

	data["data"] = result;
	console.log(JSON.stringify(data));
	PrintReport(ReportName.Deduction, data);
}

function getCollectionInfo()
{
	data = {};
	var Qry = "SELECT cm.customercode,customername,customeraddress1 as address,typecode,CAST(amount AS VARCHAR) amount,bankname,checkdate,checknumber,invoicenumber,comments,printstatus,(SELECT CASE cm.messagekey5 WHEN 0 THEN '' ELSE messageline1 || messageline2 || messageline3 || messageline4 END FROM customermessages WHERE messagekey = messagekey5) AS invheadermsg,IFNULL(excesspayment,'') AS excesspayment,cm.alternatecode,(SELECT sum(ci.invoicebalance) FROM customerinvoice ci WHERE ci.customercode=arh.customercode and ci.invoicebalance>0 ) as custbalance FROM arheader arh JOIN customermaster cm ON cm.customercode = arh.customercode JOIN cashcheckdetail ccd ON ccd.visitkey = arh.visitkey LEFT JOIN bankmaster bm ON bm.bankcode = ccd.bankcode WHERE arh.visitkey = "
			+ sessionStorage.getItem("VisitKey");
	console.log(Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			if (result.length > 0)
			{
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
				if (result[0][6] != '')
				{
					var d = new Date(result[0][6]);
					result[0][6] = (d.getDate() + "/" + (d.getMonth() + 1)
							+ "/" + d.getFullYear());
				}
				data["Cheque"] = [{
					"Cheque Date" : (result[0][6]).toString(),
					"Cheque No" : (result[0][7]).toString(),
					"Bank" : result[0][5].toString(),
					"Amount" : (amount).toString()
				}];
				invoicenumber = (result[0][8]).toString();
				comments = result[0][9];
				printstatus = result[0][10];
				invheadermsg = result[0][11];
				excesspayment = result[0][12];
				getCollection();
			}
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				result = $.map(result.array, function(item, index)
				{
					return [[item.customercode, item.customername,
							item.address, item.typecode, item.amount,
							item.bankname, item.checkdate, item.checknumber,
							item.invoicenumber, item.comments,
							item.printstatus, item.invheadermsg,
							item.excesspayment, item.alternatecode,
							item.custbalance]];
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
				if (result[0][6] != '')
				{
					var d = new Date(result[0][6]);
					result[0][6] = (d.getDate() + "/" + (d.getMonth() + 1)
							+ "/" + d.getFullYear());
				}
				data["Cheque"] = [{
					"Cheque Date" : (result[0][6]).toString(),
					"Cheque No" : (result[0][7]).toString(),
					"Bank" : result[0][5].toString(),
					"Amount" : (amount).toString()
				}];
				invoicenumber = (result[0][8]).toString();
				comments = result[0][9];
				printstatus = result[0][10];
				invheadermsg = result[0][11];
				excesspayment = result[0][12];
				alternatecode = result[0][13];
				data["CustBalance"] = result[0][14]; // sujee added
				// 27/06/2018
				getCollection();
			}
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function getCollection()
{
	// getroutedate();
	// var Qry = "SELECT ard.invoicenumber AS
	// invoicenumber,STRFTIME('%d/%m/%Y',invoicedate) AS
	// invoicedate,ard.totalinvoiceamount,ard.amountpaid,(ard.invoicebalance) AS
	// invoicebalance FROM ardetail ard JOIN arheader arh ON ard.transactionkey
	// = arh.transactionkey WHERE arh.invoicenumber = " + invoicenumber;

	// org qry sujee commented
	/*
	 * var Qry = "SELECT CASE WHEN '" + localStorage.getItem("alternatepending") + "' =
	 * '1' THEN ard.alternateinvoicenumber ELSE ard.invoicenumber END as
	 * invoicenumber,(SELECT STRFTIME('%d/%m/%Y',transactiondate) FROM
	 * customerinvoice WHERE invoicenumber=ard.invoicenumber) AS
	 * invoicedate,ard.totalinvoiceamount,ard.amountpaid,(ard.invoicebalance) AS
	 * invoicebalance FROM ardetail ard JOIN arheader arh ON ard.transactionkey =
	 * arh.transactionkey WHERE arh.invoicenumber =" + invoicenumber;
	 */

	// sujee added previous balance field fro ENHANCE
	/*
	 * var Qry = "SELECT CASE WHEN '" + localStorage.getItem("alternatepending") + "' =
	 * '1' THEN ard.alternateinvoicenumber ELSE ard.invoicenumber END as
	 * invoicenumber,(SELECT STRFTIME('%d/%m/%Y',transactiondate) FROM
	 * customerinvoice WHERE invoicenumber=ard.invoicenumber) AS
	 * invoicedate,ard.totalinvoiceamount,(ard.invoicebalance+ard.amountpaid) as
	 * previousbalance,ard.amountpaid,(ard.invoicebalance) AS invoicebalance
	 * FROM ardetail ard JOIN arheader arh ON ard.transactionkey =
	 * arh.transactionkey WHERE arh.invoicenumber =" + invoicenumber;
	 */

	var Qry = "SELECT CASE WHEN '"
			+ localStorage.getItem("alternatepending")
			+ "' = '1' THEN ard.alternateinvoicenumber ELSE ard.invoicenumber END as invoicenumber,(SELECT STRFTIME('%d/%m/%Y',transactiondate) FROM customerinvoice WHERE invoicenumber=ard.invoicenumber)  AS invoicedate,ard.totalinvoiceamount,(ard.invoicebalance+ard.amountpaid+ard.deductionamount) as previousbalance,ard.amountpaid,(ard.invoicebalance) AS invoicebalance,(ard.deductionamount) AS deductionamount  FROM ardetail ard JOIN arheader arh ON ard.transactionkey = arh.transactionkey WHERE arh.invoicenumber ="
			+ invoicenumber;

	console.log(Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			if (result.length <= 0)
				result = [];
			ProcessCollection(result);
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				result = $.map(result.array, function(item, index)
				{
					return [[item.invoicenumber, item.invoicedate,
							item.totalinvoiceamount, item.previousbalance,
							item.amountpaid, item.invoicebalance,
							item.deductionamount]];
				});
			} else
				result = [];

			console.log("RESULT1" + result);
			ProcessCollection(result);
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function ProcessCollection(result)
{
	getCommonData();
	data["RECEIPT"] = invoicenumber;
	// sujee commented for Enhacne Grp 21/05/2018
	data["CUSTOMER"] = alternatecode + "   " + customername;
	// data["CUSTOMER"] = alternatecode;

	data["ADDRESS"] = customeraddress;
	if (comments == 0 || comments == "0")
		comments = "";
	data["comments"] = unescape(comments);
	data["HEADERS"] = ["Invoice#", "Due Date", "Invoice Amount",
			"Previous Balance", "Amount Paid", "Invoice Balance"];
	var totalamount = 0;
	for (i = 0; i < result.length; i++)
	{
		for (j = 0; j < result[i].length; j++)
		{
			if (j == 0)
			{
				// result[i][j] = parseInt(eval(result[i][j]));
				result[i][j] = (result[i][j]).toString();
			}
			if (j == 4 || j == 7 || j == 8 || j == 3 || j == 2 || j == 6
					|| j == 5)
			{
				if (result[i][j] != "")
					result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
			}

			if (j == 4) // changed 3 to 4 28/08/2019
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
	if (excesspayment != "")
		data["expayment"] = eval(excesspayment).toFixed(decimalplace);
	else
		data["expayment"] = excesspayment

	data["data"] = result;
	console.log(JSON.stringify(data));
	PrintReport(ReportName.Collection, data);
}

function getAdvancePaymentInfo()
{
	data = {};
	var Qry = "SELECT cm.customercode,customername,customeraddress1 as address,typecode,CAST(ifnull(amount,0) AS VARCHAR) as amount,bankname,checkdate,checknumber,invoicenumber,comments,printstatus,(SELECT CASE cm.messagekey5 WHEN 0 THEN '' ELSE messageline1 || messageline2 || messageline3 || messageline4 END FROM customermessages WHERE messagekey = messagekey5) AS invheadermsg,IFNULL(excesspayment,'') AS excesspayment,cm.alternatecode FROM arheader arh JOIN customermaster cm ON cm.customercode = arh.customercode JOIN cashcheckdetail ccd ON ccd.visitkey = arh.visitkey LEFT JOIN bankmaster bm ON bm.bankcode = ccd.bankcode WHERE arh.visitkey = "
			+ sessionStorage.getItem("VisitKey");
	console.log(Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{

		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				result = $.map(result.array, function(item, index)
				{
					return [[item.customercode, item.customername,
							item.address, item.typecode, item.amount,
							item.bankname, item.checkdate, item.checknumber,
							item.invoicenumber, item.comments,
							item.printstatus, item.invheadermsg,
							item.excesspayment, item.alternatecode]];
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
				if (result[0][6] != '')
				{
					var d = new Date(result[0][6]);
					result[0][6] = (d.getDate() + "/" + (d.getMonth() + 1)
							+ "/" + d.getFullYear());
				}
				data["Cheque"] = [{
					"Cheque Date" : (result[0][6]).toString(),
					"Cheque No" : (result[0][7]).toString(),
					"Bank" : result[0][5].toString(),
					"Amount" : (amount).toString()
				}];
				invoicenumber = (result[0][8]).toString();
				comments = result[0][9];
				printstatus = result[0][10];
				invheadermsg = result[0][11];
				excesspayment = result[0][12];
				alternatecode = result[0][13];
				getAdvanceePayment();
			}
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function getAdvanceePayment()
{
	// getroutedate();
	// var Qry = "SELECT ard.invoicenumber AS
	// invoicenumber,STRFTIME('%d/%m/%Y',invoicedate) AS
	// invoicedate,ard.totalinvoiceamount,ard.amountpaid,(ard.invoicebalance) AS
	// invoicebalance FROM ardetail ard JOIN arheader arh ON ard.transactionkey
	// = arh.transactionkey WHERE arh.invoicenumber = " + invoicenumber;
	var Qry = "SELECT CASE WHEN '"
			+ localStorage.getItem("alternatepending")
			+ "' = '1' THEN ard.alternateinvoicenumber ELSE ard.invoicenumber END as invoicenumber,(SELECT STRFTIME('%d/%m/%Y',transactiondate) FROM customerinvoice WHERE invoicenumber=ard.invoicenumber)  AS invoicedate,ard.totalinvoiceamount,ard.amountpaid,(ard.invoicebalance) AS invoicebalance FROM ardetail ard JOIN arheader arh ON ard.visitkey = arh.visitkey WHERE arh.invoicenumber ="
			+ invoicenumber;
	console.log(Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{

		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				result = $.map(result.array, function(item, index)
				{
					return [[item.invoicenumber, item.invoicedate,
							item.totalinvoiceamount]];
				});
			} else
				result = [];

			ProcessAdvancePayemnt(result);
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function ProcessAdvancePayemnt(result)
{
	getCommonData();
	data["RECEIPT"] = invoicenumber;
	// sujee commented fro Enhance Grp 21/05/2018
	data["CUSTOMER"] = alternatecode + "   " + customername;

	// data["CUSTOMER"] = alternatecode;
	data["ADDRESS"] = customeraddress;
	if (comments == 0 || comments == "0")
		comments = "";
	data["comments"] = unescape(comments);
	data["HEADERS"] = ["Invoice#", "Invoice Date", "Invoice Amount"];
	var totalamount = 0;
	for (i = 0; i < result.length; i++)
	{
		for (j = 0; j < result[i].length; j++)
		{
			if (j == 0)
			{
				// result[i][j] = parseInt(eval(result[i][j]));
				result[i][j] = (result[i][j]).toString();
			}
			if (j == 2)
			{
				if (result[i][j] != "")
					result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
			}

			if (j == 2)
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
	if (excesspayment != "")
		data["expayment"] = eval(excesspayment).toFixed(decimalplace);
	else
		data["expayment"] = excesspayment

	data["data"] = result;
	console.log(JSON.stringify(data));
	PrintReport(ReportName.AdvancePayment, data);
}

function QuantityTotal(obj, qtykey, Qty)
{
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
function QTotal(obj, qtykey, Qty)
{

	try
	{
		var oldqty = obj[qtykey];
		var currqty = Qty;
		var newqty = (eval(oldqty) + eval(currqty));
		obj[qtykey] = newqty;

	} catch (ex)
	{
		alert(ex);
	}
	/*
	 * console.log("showing qty....."); console.log(oldqty[0] + "&" + oldqty[1] + " : " +
	 * currqty[0] + "&" + currqty[1] + " : " + newqty);
	 */
}
function getCommonData()
{
	// alert(sessionStorage.getItem("contactno"));
	var d = new Date();
	var dt = (d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear());
	data["companyname"] = sessionStorage.getItem("CompanyName");
	data["arbcompanyname"] = sessionStorage.getItem("ARBCompanyName");
	data["companyaddress"] = sessionStorage.getItem("CompanyAddress");
	data["contactinfo"] = sessionStorage.getItem("ContactInfo");
	data["companylogo"] = "/images/logo.jpg";
	data["addresssetting"] = "1";
	data["TourID"] = sessionStorage.getItem("TourID");
	data["displayupc"] = "1"; // For want to display UPC or not in sales
	// report
	if (sessionStorage.getItem("Language") == 'en')
	{
		data["ROUTE"] = sessionStorage.getItem("RouteCode") + "-"
				+ sessionStorage.getItem("RouteName");
	} else
	{
		data["ROUTE"] = sessionStorage.getItem("RouteCode") + "-"
				+ sessionStorage.getItem("ARBRouteName") + "";

	}
	if (sessionStorage.getItem("Language") == 'en')
	{
		data["SALESMAN"] = sessionStorage.getItem("ALTSalesmanCode") + "-"
				+ sessionStorage.getItem("SalesmanName"); // "104-NEW MTS
		// SALESMAN";
	} else
	{
		data["SALESMAN"] = sessionStorage.getItem("SalesmanCode") + "-"
				+ sessionStorage.getItem("SalesmanName") + ""; // "104-NEW MTS
		// SALESMAN";
	}
	data["CONTACTNO"] = sessionStorage.getItem("contactno");
	data["DOC DATE"] = dt // "12/03/2012";
	data["DATE"] = dt;
	data["TIME"] = getTime(); // (d.getHours() + ":" + d.getMinutes());
	// data["DOCUMENT NO"] = "1000000021";
	var tripdate = sessionStorage.getItem("TripDate");
	if (tripdate != '' && tripdate != null && tripdate != undefined)
	{
		data["TRIP START DATE"] = tripdate;
	} else
	{
		data["TRIP START DATE"] = dt;

	}

	data["LANG"] = sessionStorage.getItem("Language");
	data["supervisorname"] = sessionStorage.getItem("supervisorname");
	data["supervisorno"] = sessionStorage.getItem("supervisorphone");
	data["LANG"] = sessionStorage.getItem("Language");
	if (tranferflag == 0)
	{
		if (sessionStorage.getItem("Language") == 'en')
		{
			data["TO ROUTE"] = sessionStorage.getItem("RouteCode") + "-"
					+ sessionStorage.getItem("RouteName");
		} else
		{
			data["TO ROUTE"] = sessionStorage.getItem("RouteCode") + "-"
					+ sessionStorage.getItem("ARBRouteName") + "";

		}
	}
	data["footeraddress1"] = sessionStorage.getItem("footeraddress1");
	data["footeraddress2"] = sessionStorage.getItem("footeraddress2");
	// sujee added to print 21/01/2018
	data["division"] = sessionStorage.getItem("Division");
	// Added for footernotelabel printing by Aswin Suresh 2025-09-11
	data["enfooternote"] = sessionStorage.getItem("enfooternote");
	data["arbfooternote"] = sessionStorage.getItem("arbfooternote");
	data["enlabelfooternote"] = sessionStorage.getItem("enlabelfooternote");
	data["arblabelfooternote"] = sessionStorage.getItem("arblabelfooternote");
}

function getroutedate()
{
	var qry = "select strftime('%d/%m/%Y',routestartdate) as routestartdate from startendday where routekey="
			+ sessionStorage.getItem("RouteKey");
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			var startdate = result[0][0];
			data["TRIP START DATE"] = startdate;

		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [qry]);
	} else if (platform == 'Android')
	{
		window.plugins.DataBaseHelper.select(qry, function(result)
		{
			if (result.array != undefined)
			{
				result = $.map(result.array, function(item, index)
				{
					return [[item.routestartdate]];
				});
				var startdate = result[0][0];
				data["TRIP START DATE"] = startdate;
			}

		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}
function getTime()
{
	var d = new Date();
	var H = d.getHours();
	var M = d.getMinutes();
	H = (H < 9) ? ('0' + H) : H;
	M = (M < 9) ? ('0' + M) : M;
	return (H + ":" + M);
}

function getPrintStatus()
{

	if (printanother)
	{
		return "DUPLICATE COPY";

	} else
	{
		if (printstatus == 0 || printstatus == 2)
			return "ORIGINAL COPY";
		else if (printstatus == 1)
			return "DRAFT COPY";
		else
			return "N/A";
	}
}

// ---------Start Van Stock By Sujitv 9/1/2014
function getVanInfo()
{
	var Qry = "SELECT documentnumber,printstatus FROM inventorytransactionheader WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 1 AND istemp = 'false')";
	console.log(Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			if (result.length > 0)
			{
				documentnumber = parseInt(eval(result[0][0]));
				printstatus = result[0][1];
			}
			PrintVanStock();
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				documentnumber = parseInt(result.array[0].documentnumber);
				printstatus = result.array[0].printstatus;
			}
			PrintVanStock();
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function PrintVanStock()
{
	// alert("Test");
	// getroutedate();
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
	// var Qry = "SELECT itemcode,description,(CAST(loadedqty/unitspercase AS
	// INT) || '/' || CAST(loadedqty%unitspercase AS INT)) AS
	// loadedqty,(CAST(transferqty/unitspercase AS INT) || '/' ||
	// CAST(transferqty%unitspercase AS INT)) AS
	// transferqty,(CAST(invoicedqty/unitspercase AS INT) || '/' ||
	// CAST(invoicedqty%unitspercase AS INT)) AS saleqty
	// ,(CAST(returnqty/unitspercase AS INT) || '/' ||
	// CAST(returnqty%unitspercase AS INT)) as returnqty,(CAST(vanstock
	// /unitspercase AS INT) || '/' || CAST(vanstock %unitspercase AS INT)) AS
	// vanstock FROM ( SELECT CASE WHEN '"
	// + sessionStorage.getItem("CheckCode")
	// + "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END
	// AS itemcode,itemdescription AS
	// description,unitspercase,IFNULL((IFNULL(isd.beginstockqty,0)+IFNULL(isd.loadqty,0)),0)
	// AS loadedqty,IFNULL((IFNULL(isd.loadaddqty,0) -
	// IFNULL(isd.loadcutqty,0)),0) AS transferqty,IFNULL((IFNULL(isd.saleqty,0)
	// + IFNULL(isd.freesampleqty,0)),0) AS
	// invoicedqty,IFNULL((IFNULL(isd.returnqty,0) +
	// IFNULL(isd.returnfreeqty,0)),0) AS
	// returnqty,IFNULL((IFNULL(isd.beginstockqty,0) + IFNULL(isd.loadqty,0) +
	// IFNULL(isd.loadaddqty,0) + IFNULL(isd.returnqty,0) +
	// IFNULL(isd.returnfreeqty,0)),0) -IFNULL((IFNULL(isd.loadcutqty,0) +
	// IFNULL(isd.saleqty,0) + IFNULL(isd.freesampleqty,0)),0) AS vanstock FROM
	// inventorysummarydetail isd INNER JOIN itemmaster im ON im.actualitemcode
	// = isd.itemcode where routekey = "
	// + sessionStorage.getItem("RouteKey") + ") order by itemcode";

	// var Qry="SELECT itemcode,description,CASE WHEN unitspercase=1 THEN (0 ||
	// '/' || CAST(loadedqty AS INT)) ELSE (CAST(loadedqty/unitspercase AS INT)
	// || '/' || CAST(loadedqty%unitspercase AS INT)) END AS loadedqty,CASE WHEN
	// unitspercase=1 THEN (0 || '/' || CAST(transferqty AS INT)) ELSE
	// (CAST(transferqty/unitspercase AS INT) || '/' ||
	// CAST(transferqty%unitspercase AS INT)) END AS transferqty,CASE WHEN
	// unitspercase=1 THEN (0 || '/' || CAST(invoicedqty AS INT)) ELSE
	// (CAST(invoicedqty/unitspercase AS INT) || '/' ||
	// CAST(invoicedqty%unitspercase AS INT)) END AS saleqty ,CASE WHEN
	// unitspercase=1 THEN (0 || '/' || CAST(returnqty AS INT)) ELSE
	// (CAST(returnqty/unitspercase AS INT) || '/' ||
	// CAST(returnqty%unitspercase AS INT)) END as returnqty,CASE WHEN
	// unitspercase=1 THEN (0 || '/' || CAST(vanstock AS INT)) ELSE
	// (CAST(vanstock /unitspercase AS INT) || '/' || CAST(vanstock
	// %unitspercase AS INT)) END AS vanstock,((CAST(vanstock /unitspercase AS
	// INT)*caseprice)+ (CAST(vanstock %unitspercase AS INT)*defaultsalesprice))
	// AS total FROM ( SELECT CASE WHEN '"+ sessionStorage.getItem("CheckCode")+
	// "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS
	// itemcode,CASE WHEN '" + sessionStorage.getItem("Language") + "' = 'en'
	// THEN im.itemdescription ELSE im.arbitemshortdescription END AS
	// 'description',unitspercase,IFNULL((IFNULL(isd.beginstockqty,0)+IFNULL(isd.loadqty,0)),0)
	// AS loadedqty,IFNULL((IFNULL(isd.loadaddqty,0) -
	// IFNULL(isd.loadcutqty,0)),0) AS transferqty,IFNULL((IFNULL(isd.saleqty,0)
	// + IFNULL(isd.freesampleqty,0)),0) AS
	// invoicedqty,IFNULL((IFNULL(isd.returnqty,0) +
	// IFNULL(isd.returnfreeqty,0)),0) AS
	// returnqty,IFNULL((IFNULL(isd.beginstockqty,0) + IFNULL(isd.loadqty,0) +
	// IFNULL(isd.loadaddqty,0) + IFNULL(isd.returnqty,0) +
	// IFNULL(isd.returnfreeqty,0)),0) -IFNULL((IFNULL(isd.loadcutqty,0) +
	// IFNULL(isd.saleqty,0) + IFNULL(isd.freesampleqty,0)),0) AS
	// vanstock,im.caseprice as caseprice,im.defaultsalesprice as
	// defaultsalesprice FROM inventorysummarydetail isd INNER JOIN itemmaster
	// im ON im.actualitemcode = isd.itemcode where routekey ="+
	// sessionStorage.getItem("RouteKey") + " and vanstock>0) order by
	// itemcode";
	var Qry = "SELECT itemcode,description,'' as arbitemdescription,CASE WHEN unitspercase=1 THEN (0 || '/' || CAST(loadedqty AS INT)) ELSE (CAST(loadedqty/unitspercase AS INT) || '/' || CAST(loadedqty%unitspercase AS INT)) END AS loadedqty,CASE WHEN unitspercase=1 THEN (0 || '/' || CAST(transferqty AS INT)) ELSE (CAST(transferqty/unitspercase AS INT) || '/' || CAST(transferqty%unitspercase AS INT)) END AS transferqty,CASE WHEN unitspercase=1 THEN (0 || '/' || CAST(invoicedqty AS INT)) ELSE (CAST(invoicedqty/unitspercase AS INT) || '/' || CAST(invoicedqty%unitspercase AS INT)) END AS saleqty ,CASE WHEN unitspercase=1 THEN (0 || '/' || CAST(returnqty AS INT)) ELSE (CAST(returnqty/unitspercase AS INT) || '/' || CAST(returnqty%unitspercase AS INT)) END as returnqty,CASE WHEN unitspercase=1 THEN (0 || '/' || CAST(vanstock AS INT)) ELSE (CAST(vanstock /unitspercase AS INT) || '/' || CAST(vanstock %unitspercase AS INT)) END AS vanstock,((CAST(vanstock /unitspercase AS INT)*caseprice)+  (CAST(vanstock %unitspercase AS INT)*defaultsalesprice)) AS total FROM ( SELECT CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,im.itemdescription  AS 'description',''  AS 'arbitemdescription',unitspercase,IFNULL((IFNULL(isd.beginstockqty,0)+IFNULL(isd.loadqty,0)),0) AS loadedqty,IFNULL((IFNULL(isd.loadaddqty,0) - IFNULL(isd.loadcutqty,0)),0) AS transferqty,IFNULL((IFNULL(isd.saleqty,0) + IFNULL(isd.freesampleqty,0)),0) AS invoicedqty,IFNULL((IFNULL(isd.returnqty,0) + IFNULL(isd.returnfreeqty,0)),0) AS returnqty,IFNULL((IFNULL(isd.beginstockqty,0) + IFNULL(isd.loadqty,0) + IFNULL(isd.loadaddqty,0) + IFNULL(isd.returnqty,0) + IFNULL(isd.returnfreeqty,0)),0) -IFNULL((IFNULL(isd.loadcutqty,0) + IFNULL(isd.saleqty,0) + IFNULL(isd.freesampleqty,0)),0) AS vanstock,im.caseprice as caseprice,im.defaultsalesprice as defaultsalesprice FROM inventorysummarydetail isd INNER JOIN itemmaster im ON im.actualitemcode = isd.itemcode where routekey ="
			+ sessionStorage.getItem("RouteKey")
			+ " and vanstock>0) order by itemcode";
	console.log(Qry);
	if (platform == "iPad")
	{
		Cordova.exec(function(result)
		{
			if (result.length < 0)
				result = []
			ProcessVanStock(result);
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == "Android")
	{
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				result = $.map(result.array,
						function(item, index)
						{
							// return
							// [[item.itemcode,item.description,item.upc,item.avlqty,item.caseprice,item.defaultsalesprice]];
							return [[item.itemcode, item.description,
									item.loadedqty, item.transferqty,
									item.saleqty, item.returnqty,
									item.vanstock, item.total,
									item.arbitemdescription]];

						});
			} else
				result = [];
			ProcessVanStock(result);
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function ProcessVanStock(result)
{
	// alert(result);
	/*
	 * var Headers = ["Item#", "Description", "UPC", "Available Qty", "Case
	 * Price", "Unit Price"] var Total = {"Available Qty": "0/0"}
	 */
	var Headers = ["Item#", "Description", "Loaded Qty", "Transfer Qty",
			"Sale Qty", "Return Qty", "Truck Stock", "Total"];
	var Total = {
		"Loaded Qty" : "0/0",
		"Transfer Qty" : "0/0",
		"Sale Qty" : "0/0",
		"Return Qty" : "0/0",
		"Truck Stock" : "0/0",
		"Total" : "0"
	};
	for (i = 0; i < result.length; i++)
	{
		for (j = 0; j < result[i].length; j++)
		{
			if (j == 0)
			{
				if (sessionStorage.getItem("CheckCode") == 'ancode'
						&& !isNaN(result[i][j]))
					result[i][j] = parseInt(result[i][j]);

				result[i][j] = (result[i][j]).toString();
			}
			if (j >= 2 && j <= 7)
			{
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
				if (j == 7)
				{

					result[i][j] = eval(result[i][j]).toFixed(decimalplace);
					Total.Total = (eval(Total.Total) + eval(result[i][j]))
							.toFixed(decimalplace);
				}

				if (j != 7)
					QuantityTotal(Total, qtykey, result[i][j]);

			}

		}
	}
	// data["Load Number"] = loadperiodnumber.toString();
	// data["DOCUMENT NO"] = documentnumber;
	data["HEADERS"] = Headers;
	data["TOTAL"] = [Total];
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
function getRequestInfo()
{
	var Qry = "SELECT documentnumber,printstatus,requestdate FROM inventorytransactionheader WHERE detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 4 AND istemp = 'false')";
	console.log(Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			if (result.length > 0)
			{
				documentnumber = parseInt(eval(result[0][0]));
				printstatus = result[0][1];
				requestdate = result[0][2];
			}
			PrintLoadReqValue();
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
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

		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

//
function PrintLoadReqValue()
{

	var Qry = "SELECT  itemcode,CAST(((CAST((IFNULL((invtd.quantity)/unitspercase, 0)) AS INT) * caseprice) + (IFNULL((invtd.quantity) % unitspercase, 0) * defaultsalesprice)) AS FLOAT )as netvalue FROM inventorytransactionheader invth JOIN inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey JOIN itemmaster im ON im.actualitemcode = invtd.itemcode WHERE invth.transactiontype = 4 AND invth.detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 4 AND istemp = 'false')";
	console.log(Qry);
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			if (result.length <= 0)
				result = [];

		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == 'Android')
	{
		var netvalue = 0;
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				result = $.map(result.array, function(item, index)
				{
					return [[item.itemcode, item.netvalue]];
				});
				for (i = 0; i < result.length; i++)
				{
					for (j = 0; j < result[i].length; j++)
					{
						if (j == 1)
						{
							result[i][j] = (eval(result[i][j]))
									.toFixed(decimalplace);

							netvalue = (eval(netvalue) + eval(result[i][j]))
									.toFixed(decimalplace);

						}

					}
				}
				data["netvalue"] = netvalue;
				getTripDate();

			} else
				result = [];

		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function getTripDate()
{

	var qry = "select strftime('%d/%m/%Y',routestartdate) as routestartdate from startendday where routekey="
			+ sessionStorage.getItem("RouteKey");
	if (platform == 'iPad')
	{
		Cordova.exec(function(result)
		{
			var startdate = result[0][0];
			data["TRIP START DATE"] = startdate;

		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [qry]);
	} else if (platform == 'Android')
	{
		window.plugins.DataBaseHelper.select(qry, function(result)
		{
			if (result.array != undefined)
			{
				result = $.map(result.array, function(item, index)
				{
					return [[item.routestartdate]];
				});
				var startdate = result[0][0];
				data["TRIP START DATE"] = startdate;
			}
			PrintRequestStock();
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}

}

function PrintWarehouseAndLoadDetails() {

    var routeKey =
        sessionStorage.getItem("RouteKey");

    /*
     * Clear previous report data.
     */
    data = {};
    ArrMultiPrint = [];

    var Qry =
        "SELECT " +

            /*
             * Item code.
             */
            "im.actualitemcode AS itemcode, " +

            /*
             * Item name.
             */
            "im.itemdescription AS itemname, " +

            /*
             * Van stock.
             */
            "IFNULL(van.vancases, 0) || '/' || " +
            "IFNULL(van.vanunits, 0) AS vanstock, " +

            /*
             * Warehouse stock.
             */
            "CASE " +
                "WHEN im.unitspercase = 1 THEN " +
                    "'0/' || CAST(" +
                        "IFNULL(wh.unitqty, 0) " +
                    "AS INTEGER) " +
                "ELSE " +
                    "CAST(" +
                        "IFNULL(wh.caseqty, 0) " +
                    "AS INTEGER) || '/' || " +
                    "CAST(" +
                        "IFNULL(wh.unitqty, 0) " +
                    "AS INTEGER) " +
            "END AS warehousestock " +

        "FROM itemmaster AS im " +

        /*
         * Warehouse stock.
         */
        "LEFT JOIN (" +

            "SELECT " +
                "itemcode, " +
                "SUM(IFNULL(caseqty, 0)) AS caseqty, " +
                "SUM(IFNULL(unitqty, 0)) AS unitqty " +

            "FROM warehousestock " +

            "GROUP BY itemcode" +

        ") AS wh " +
            "ON wh.itemcode = im.actualitemcode " +

        /*
         * Van stock.
         */
        "LEFT JOIN (" +

            "SELECT " +
                "isd.itemcode, " +

                /*
                 * Van cases.
                 */
                "CASE " +
                    "WHEN im2.unitspercase = 1 THEN 0 " +
                    "ELSE CAST(" +
                        "SUM(" +
                            "IFNULL(isd.loadqty, 0) " +
                            "+ IFNULL(isd.loadadjustqty, 0) " +
                            "+ IFNULL(isd.beginstockqty, 0) " +
                            "+ IFNULL(isd.loadaddqty, 0) " +
                            "- IFNULL(isd.loadcutqty, 0) " +
                            "- IFNULL(isd.saleqty, 0) " +
                            "+ IFNULL(isd.returnqty, 0) " +
                            "+ IFNULL(isd.returnfreeqty, 0) " +
                            "- IFNULL(isd.freesampleqty, 0)" +
                        ") / im2.unitspercase " +
                    "AS INTEGER) " +
                "END AS vancases, " +

                /*
                 * Van units.
                 */
                "CASE " +
                    "WHEN im2.unitspercase = 1 THEN " +
                        "SUM(" +
                            "IFNULL(isd.loadqty, 0) " +
                            "+ IFNULL(isd.loadadjustqty, 0) " +
                            "+ IFNULL(isd.beginstockqty, 0) " +
                            "+ IFNULL(isd.loadaddqty, 0) " +
                            "- IFNULL(isd.loadcutqty, 0) " +
                            "- IFNULL(isd.saleqty, 0) " +
                            "+ IFNULL(isd.returnqty, 0) " +
                            "+ IFNULL(isd.returnfreeqty, 0) " +
                            "- IFNULL(isd.freesampleqty, 0)" +
                        ") " +
                    "ELSE CAST(" +
                        "SUM(" +
                            "IFNULL(isd.loadqty, 0) " +
                            "+ IFNULL(isd.loadadjustqty, 0) " +
                            "+ IFNULL(isd.beginstockqty, 0) " +
                            "+ IFNULL(isd.loadaddqty, 0) " +
                            "- IFNULL(isd.loadcutqty, 0) " +
                            "- IFNULL(isd.saleqty, 0) " +
                            "+ IFNULL(isd.returnqty, 0) " +
                            "+ IFNULL(isd.returnfreeqty, 0) " +
                            "- IFNULL(isd.freesampleqty, 0)" +
                        ") % im2.unitspercase " +
                    "AS INTEGER) " +
                "END AS vanunits " +

            "FROM inventorysummarydetail AS isd " +

            "INNER JOIN itemmaster AS im2 " +
                "ON im2.actualitemcode = isd.itemcode " +

            /*
             * Important: current route only.
             */
            "WHERE isd.routekey = " +
                routeKey + " " +

            "GROUP BY " +
                "isd.itemcode, " +
                "im2.unitspercase" +

        ") AS van " +
            "ON van.itemcode = im.actualitemcode " +

        /*
         * Print only warehouse-stock items.
         */
        "WHERE wh.itemcode IS NOT NULL " +

        "ORDER BY im.actualitemcode";

    console.log(
        "Warehouse print query:",
        Qry
    );

    window.plugins.DataBaseHelper.select(
        Qry,

        function (result) {

            if (
                !result ||
                !result.array ||
                result.array.length === 0
            ) {
                navigator.notification.alert(
                    "No data available for printing."
                );

                return;
            }

            var printRows = [];

            for ( var i = 0; i < result.array.length; i++ ) {
                var item = result.array[i];
                printRows.push([
                    String(item.itemcode || "" ),
                    String(item.itemname || ""),
                    String(item.vanstock || "0/0"),
                    String(item.warehousestock || "0/0")
                ]);
            }

            data = {};

            data["DOCUMENT NO"] = "";

            data["HEADERS"] = [
                "Item Code",
                "Item Name",
                "Van Stock",
                "WH Stock"
            ];

            data["TOTAL"] = [{
                "Van Stock": "0/0",
                "WH Stock": "0/0"
            }];

            data["printstatus"] =
                getPrintStatus();

            data["data"] =
                printRows;

            getCommonData();

            console.log(
                "Warehouse print payload:",
                JSON.stringify(data)
            );

            /*
             * Test using existing report.
             */
            PrintReport(
                ReportName.WarehouseAndLoadDetails,
                data
            );
        },

        function (error) {

            console.warn(
                "Warehouse print query failed:",
                error
            );

            navigator.notification.alert(
                "Unable to prepare print data."
            );
        }
    );
}

//
function PrintRequestStock()
{
	// alert("Test");

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
	// var Qry = "SELECT CASE WHEN '"
	// + sessionStorage.getItem("CheckCode")
	// + "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END
	// AS itemcode,itemdescription AS
	// description,unitspercase,caseprice,defaultsalesprice,(CAST(invtd.quantity/unitspercase
	// AS INT) || '/' || CAST(invtd.quantity%unitspercase AS INT)) AS
	// reqstockqty,0 as Sl FROM inventorytransactionheader invth JOIN
	// inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey
	// JOIN itemmaster im ON im.actualitemcode = invtd.itemcode WHERE
	// invth.transactiontype = 4 AND invth.detailkey = (SELECT MAX(detailkey)
	// FROM inventorytransactionheader WHERE transactiontype = 4 AND istemp =
	// 'false')";

	var Qry = "SELECT CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS itemcode,CASE WHEN '"
			+ sessionStorage.getItem("Language")
			+ "' = 'en' THEN itemdescription ELSE arbitemshortdescription END AS 'description',unitspercase,caseprice,defaultsalesprice,(CASE WHEN unitspercase=1 THEN 0 ELSE CAST(invtd.quantity/unitspercase AS INT) END) || '/' || (CASE WHEN unitspercase=1 THEN CAST(invtd.quantity AS INT) ELSE CAST(invtd.quantity%unitspercase AS INT) END) AS reqstockqty,0 as Sl FROM inventorytransactionheader invth JOIN inventorytransactiondetail invtd ON invtd.detailkey = invth.detailkey JOIN itemmaster im ON im.actualitemcode = invtd.itemcode WHERE invth.transactiontype = 4 AND invth.detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader WHERE transactiontype = 4 AND istemp = 'false')";
	console.log(Qry);
	if (platform == "iPad")
	{
		Cordova.exec(function(result)
		{
			if (result.length < 0)
				result = []
			ProcessRequestStock(result);
		}, function(error)
		{
			alert(error);
		}, "PluginClass", "GetdataMethod", [Qry]);
	} else if (platform == "Android")
	{
		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				result = $.map(result.array, function(item, index)
				{
					// return
					// [[item.itemcode,item.description,item.upc,item.avlqty,item.caseprice,item.defaultsalesprice]];
					return [[item.sl, item.itemcode, item.description,
							item.unitspercase, item.caseprice,
							item.defaultsalesprice, item.reqstockqty]];

				});
			} else
				result = [];
			ProcessRequestStock(result);
		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}

function ProcessRequestStock(result)
{

	var Headers = ["Sl#", "Item#", "Description", "UPC", "Case Price",
			"Unit Price", "Request Qty"];
	var Total = {
		"Request Qty" : "0/0"
	};
	for (i = 0; i < result.length; i++)
	{

		for (j = 0; j < result[i].length; j++)
		{
			if (j == 1)
			{
				if (sessionStorage.getItem("CheckCode") == 'ancode'
						&& !isNaN(result[i][j]))
					result[i][j] = parseInt(result[i][j]);
				if (result[i][j] != undefined)
					result[i][j] = (result[i][j]).toString();
				else
					result[i][j] = '';
			}
			if (j == 4 || j == 5)
			{
				if (result[i][j] != "")
					result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
			}
			if (j == 6)
			{
				var qtykey = "";
				// if(j == 2)
				qtykey = "Request Qty";

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
	data["TOTAL"] = [Total];

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
function PrintReport(report_name, dic)
{
	// alert("test");
	var printdevice = true;
	ArrMultiPrint = [];
	// data["TwiceSigCapture"]="0";
	if (printdevice)
	{
		// dic = [{"data" : dic, "name" : report_name}];
		if (platform == "iPad")
		{
			Cordova.exec(function nativePluginResultHandler(result)
			{
				// alert("SUCCESS: \r\n"+result );
				PrintDone();
			}, function nativePluginErrorHandler(error)
			{
				// alert("ERROR: \r\n"+error );
				PrintDone();
			}, "PrintClass", "nativeFunction", [[[{
				"data" : dic,
				"name" : report_name
			}]]]);
		} else
		{

			if (printval == '')
				getdecimal();

			if (printval == 3)
			{

				window.plugins.DotmatHelper.print([[{
					"mainArr" : dic,
					"name" : report_name
				}]], function(data)
				{
					// alert(data.status);
					// alert(data.isconnected);
					if (data.status && data.isconnected == 0)
						PrintDone(1);
					else
					{
						alert("Error In Printing");
						PrintDone(2);
					}
					console.warn("SUCCESS");
				}, function()
				{
					navigator.notification.alert("Error In Printing");
					PrintDone(2);
					console.warn("Error");
				});

			} else if (printval == 2)
			{
				// alert(data.status);
				// alert(data.isconnected);
				window.plugins.PB51Helper.print([[{
					"mainArr" : dic,
					"name" : report_name
				}]], function(data)
				{
					if (data.status && data.isconnected == 0)
						PrintDone(1);
					else
					{
						alert("Error In Printing");
						PrintDone(2);
					}
					console.warn("SUCCESS");
				}, function()
				{
					navigator.notification.alert("Error In Printing");
					PrintDone(2);
					console.warn("Error");
				});
			} else if (printval == 1)
			{

				window.plugins.ZebraHelper.print([[{
					"mainArr" : dic,
					"name" : report_name
				}]], function(data)
				{

					// alert(data.status);
					// alert(data.isconnected);
					if (data.status && data.isconnected == 0)
						PrintDone(1);
					else
					{
						alert("Error In Printing");
						PrintDone(2);
					}
					console.warn("SUCCESS");
				}, function()
				{
					navigator.notification.alert("Error In Printing");
					PrintDone(2);
					console.warn("Error");
				});
			} else if (printval == 0)
			{

				ArrMultiPrint.push([{
					"mainArr" : dic,
					"name" : report_name
				}]);
				navigator.notification.confirm('Please Select Your Printer',
						callBackFunction, 'Printer Selection', ['A4 Printer',
								'4 Inch Printer']);

			}

		}
	} else
	{
		PrintDone();
	}

}
function callBackFunction(b)
{
	if (b == 1)
	{
		window.plugins.DotmatHelper.print(ArrMultiPrint, function(data)
		{

			if (data.status && data.isconnected == 0)
				PrintDone(1);
			else
			{
				alert("Error In Printing");
				PrintDone(2);
			}
			console.warn("SUCCESS");
		}, function()
		{
			navigator.notification.alert("Error In Printing");
			PrintDone(2);
			console.warn("Error");
		});

	} else
	{

		window.plugins.PB51Helper.print(ArrMultiPrint, function(data)
		{
			if (data.status && data.isconnected == 0)
				PrintDone(1);
			else
			{
				alert("Error In Printing");
				PrintDone(2);
			}
			console.warn("SUCCESS");
		}, function()
		{
			navigator.notification.alert("Error In Printing");
			PrintDone(2);
			console.warn("Error");
		});

	}
}
function PrintReportArray()
{
	// alert("test");
	var printdevice = true;
	ArrMultiPrint = [];

	if (printdevice)
	{
		// dic = [{"data" : dic, "name" : report_name}];
		if (platform == "iPad")
		{
			Cordova.exec(function nativePluginResultHandler(result)
			{
				// alert("SUCCESS: \r\n"+result );
				PrintDone();
			}, function nativePluginErrorHandler(error)
			{
				// alert("ERROR: \r\n"+error );
				PrintDone();
			}, "PrintClass", "nativeFunction", [[[{
				"data" : dic,
				"name" : report_name
			}]]]);
		} else
		{
			// alert(report_name);
			// Start

			if (printval == '')
				getdecimal();
			if (printval == 3)
			{

				window.plugins.DotmatHelper.print(ArrPrint, function(data)
				{
					// alert(data.status);
					// alert(data.isconnected);
					if (data.status && data.isconnected == 0)
						PrintDone(1);
					else
					{
						getLangText("Error In Printing");
						PrintDone(2);
					}
					console.warn("SUCCESS");
				}, function()
				{
					navigator.notification.alert("Error In Printing");
					PrintDone(2);
					console.warn("Error");
				});

			} else if (printval == 2)
			{
				// alert(data.status);
				// alert(data.isconnected);
				window.plugins.PB51Helper.print(ArrPrint, function(data)
				{
					if (data.status && data.isconnected == 0)
						PrintDone(1);
					else
					{
						getLangText("Error In Printing");
						PrintDone(2);
					}
					console.warn("SUCCESS");
				}, function()
				{
					navigator.notification.alert("Error In Printing");
					PrintDone(2);
					console.warn("Error");
				});
			} else if (printval == 1)
			{

				window.plugins.ZebraHelper.print(ArrPrint, function(data)
				{

					// alert(data.status);
					// alert(data.isconnected);
					if (data.status && data.isconnected == 0)
						PrintDone(1);
					else
					{
						getLangText("Error In Printing");
						PrintDone(2);
					}
					console.warn("SUCCESS");
				}, function()
				{
					navigator.notification.alert("Error In Printing");
					PrintDone(2);
					console.warn("Error");
				});
			} else if (printval == 0)
			{

				ArrMultiPrint = ArrPrint;
				navigator.notification.confirm("Please Select Your Printer",
						callBackFunction, 'Printer Selection', ["A4 Printer",
								"4 inch Printer"]);

			}

		}
	} else
	{
		PrintDone();
	}

}
function PrintOrder(printagain)
{
	printanother = printagain;
	ArrPrint = [];
	data = {};

	getOrderInfo()
}

function getOrderInfo()
{

	var routeKey = sessionStorage.getItem("RouteKey");
	var visitKey = sessionStorage.getItem("VisitKey");

	// sujee commented org qry
	/*
	 * var Qry = "SELECT cm.customercode,customername || '-' || arbcustomername
	 * AS 'customername',"+ "customeraddress1 AS
	 * 'address',inv.paymenttype,IFNULL(totalpromoamount,0) totalpromoamount, "+
	 * "(CAST(IFNULL(totalsalesamount,0) -
	 * IFNULL(totalreturnamount,0)-IFNULL(totaldamagedamount,0) AS"+ " VARCHAR)) "+
	 * "totalinvoiceamount,documentnumber,invoicenumber,comments,comments2,printstatus,(SELECT
	 * CASE cm.messagekey5"+ " WHEN 0 THEN '' ELSE messageline1 || messageline2 ||
	 * messageline3 || messageline4 END FROM "+ "customermessages WHERE
	 * messagekey = messagekey5) AS invheadermsg,(SELECT CASE cm.messagekey6 "+
	 * "WHEN 0 THEN '' ELSE messageline1 || messageline2 || messageline3 ||
	 * messageline4 END FROM "+ "customermessages WHERE messagekey =
	 * messagekey6) AS invtrailormsg,(SELECT IFNULL(sum(IFNULL"+
	 * "(promoamount,0)),0) from salesorderdetail invt where
	 * invt.visitkey="+visitKey+" AND invt.routekey="+routeKey+") "+ "as
	 * promoamount,(SELECT (IFNULL(sum(amount),0) - IFNULL(sum(promoamount),0))
	 * from salesorderdetail"+ " invt where invt.visitkey="+visitKey+" AND
	 * invt.routekey="+routeKey+") as tcamount, cm.invoicepaymentterms,CAST"+
	 * "(IFNULL(amount,0) AS VARCHAR) as amount,ifnull(checkdate,0) as
	 * checkdate,checknumber,"+ "cm.outletsubtype,CAST(inv.totalinvoiceamount AS
	 * VARCHAR) as headerAmount, customeraddress2,"+
	 * "customeraddress3,printoutletitemcode,cm.alternatecode,splitfree,0 as
	 * totaldiscountamount,"+ "arbcustomeraddress1,arbcustomeraddress2, "+
	 * "arbcustomeraddress3,CAST(IFNULL(totalsalesamount,0) AS VARCHAR)
	 * tsalesamt,CAST(IFNULL"+ "(totalreturnamount,0) AS VARCHAR)
	 * treturnsamt,CAST(IFNULL(totaldamagedamount,0) AS VARCHAR)"+ "
	 * tdamagesamt,"+ "cm.invoicepriceprint as invoicepriceprint,ifnull((select
	 * amount from cashcheckdetail where routekey="+routeKey+ " and
	 * visitkey="+visitKey+" and typecode=0),0) cashamt,ifnull((select amount
	 * from cashcheckdetail where "+ "routekey="+routeKey+" and
	 * visitkey="+visitKey+" and typecode=1),0) chequeamt FROM customermaster cm
	 * JOIN "+ "salesorderheader inv ON cm.customercode = inv.customercode AND
	 * inv.visitkey="+visitKey+" AND inv.routekey="+routeKey+ " LEFT JOIN
	 * cashcheckdetail ccd ON ccd.visitkey = inv.visitkey AND ccd.routekey =
	 * inv.routekey";
	 * 
	 */

	var Qry = "SELECT cm.customercode,customername  || '-' || arbcustomername  AS 'customername',"
			+ "customeraddress1  AS 'address',inv.paymenttype,IFNULL(totalpromoamount,0) totalpromoamount, "
			+ "(CAST(IFNULL(totalsalesamount,0) - IFNULL(totalreturnamount,0)-IFNULL(totaldamagedamount,0) AS"
			+ " VARCHAR))  "
			+ "totalinvoiceamount,documentnumber,invoicenumber,comments,comments2,printstatus,(SELECT CASE cm.messagekey5"
			+ " WHEN 0 THEN '' ELSE messageline1 || messageline2 || messageline3 || messageline4  END FROM "
			+ "customermessages WHERE messagekey = messagekey5) AS invheadermsg,(SELECT CASE cm.messagekey6 "
			+ "WHEN 0 THEN '' ELSE messageline1 || messageline2 || messageline3 ||  messageline4 END FROM "
			+ "customermessages WHERE messagekey = messagekey6) AS invtrailormsg,(SELECT IFNULL(sum(IFNULL"
			+ "(promoamount,0)),0) from salesorderdetail invt where invt.visitkey="
			+ visitKey
			+ "  AND invt.routekey="
			+ routeKey
			+ ") "
			+ "as promoamount,(SELECT (IFNULL(sum(amount),0) - IFNULL(sum(promoamount),0)) from salesorderdetail"
			+ " invt where invt.visitkey="
			+ visitKey
			+ " AND invt.routekey="
			+ routeKey
			+ ") as tcamount,  cm.invoicepaymentterms,CAST"
			+ "(IFNULL(amount,0) AS VARCHAR) as amount,ifnull(checkdate,0) as checkdate,checknumber,"
			+ "cm.outletsubtype,CAST(inv.totalinvoiceamount AS VARCHAR) as headerAmount,  customeraddress2,"
			+ "customeraddress3,printoutletitemcode,cm.alternatecode,splitfree,0 as totaldiscountamount,"
			+ "arbcustomeraddress1,arbcustomeraddress2,  "
			+ "arbcustomeraddress3,CAST(IFNULL(totalsalesamount,0) AS VARCHAR) tsalesamt,CAST(IFNULL"
			+ "(totalreturnamount,0) AS VARCHAR) treturnsamt,CAST(IFNULL(totaldamagedamount,0) AS VARCHAR)"
			+ "  tdamagesamt,"
			+ "cm.invoicepriceprint as invoicepriceprint,ifnull((select amount from cashcheckdetail where  routekey="
			+ routeKey
			+ " and visitkey="
			+ visitKey
			+ "  and typecode=0),0) cashamt,ifnull((select amount from cashcheckdetail where "
			+ "routekey="
			+ routeKey
			+ " and visitkey="
			+ visitKey
			+ "  and typecode=1),0) chequeamt,(select sig.signaturedata from sigcapturedata sig where sig.routekey=inv.routekey and sig.visitkey=inv.visitkey) as sigdata, inv.totallineitemtax as taxdata  FROM  customermaster cm JOIN "
			+ "salesorderheader inv ON cm.customercode = inv.customercode AND inv.visitkey="
			+ visitKey
			+ "  AND inv.routekey="
			+ routeKey
			+ " LEFT JOIN cashcheckdetail ccd ON ccd.visitkey = inv.visitkey  AND ccd.routekey = inv.routekey";
	console.log(Qry + " -------------");
	if (platform == 'Android')
	{
		window.plugins.DataBaseHelper.select(Qry,
				function(result)
				{

					if (result.array != undefined)
					{
						result = $.map(result.array, function(item, index)
						{
							return [[item.customercode, item.customername,
									item.address, item.paymenttype,
									item.totalpromoamount,
									item.totalinvoiceamount,
									item.documentnumber, item.invoicenumber,
									item.comments, item.printstatus,
									item.invheadermsg, item.invtrailormsg,
									item.promoamount, item.tcamount,
									item.invoicepaymentterms, item.amount,
									item.bankname, item.checkdate,
									item.checknumber, item.outletsubtype,
									item.headerAmount, item.customeraddress2,
									item.customeraddress3,
									item.printoutletitemcode,
									item.alternatecode, item.splitfree,
									item.totalmanualfree,
									item.totaldiscountamount,
									item.arbcustomeraddress1,
									item.arbcustomeraddress2,
									item.arbcustomeraddress3, item.tsalesamt,
									item.treturnsamt, item.tdamagesamt,
									item.diffround, item.invoicepriceprint,
									item.cashamt, item.chequeamt,
									item.comments2, item.sigdata, item.taxdata]];
						});

						customercode = result[0][0];
						customername = result[0][1];
						customeraddress1 = result[0][2];
						paymenttype = result[0][3];
						totalpromoamount = eval(result[0][4]).toFixed(
								decimalplace);
						totalinvoiceamount = eval(result[0][5]).toFixed(
								decimalplace);
						documentnumber = parseInt(eval(result[0][6]));
						invoicenumber = parseInt(eval(result[0][7]));
						comments = result[0][8];
						lpoNumber = result[0][38];
						printstatus = result[0][9];
						invheadermsg = result[0][10];
						invtrailormsg = result[0][11];
						itempromoamount = eval(eval(result[0][12])).toFixed(
								decimalplace);
						tcamount = eval(result[0][13]).toFixed(decimalplace)
								- eval(result[0][15]).toFixed(decimalplace);
						invoicepaymentterms = result[0][14];
						data["Cash"] = {
							"Amount" : eval(result[0][15])
									.toFixed(decimalplace)
						};
						if (result[0][17] != '')
						{
							var d = new Date(result[0][17]);
							result[0][17] = (d.getDate() + "/"
									+ (d.getMonth() + 1) + "/" + d
									.getFullYear());
						}

						customerOutlet = result[0][19];
						headerAmount = result[0][20];
						customeraddress2 = result[0][21];
						customeraddress3 = result[0][22];
						printoutletitemcode = result[0][23];
						alternatecode = result[0][24];

						if (customerOutlet == null || customerOutlet == ''
								|| customerOutlet == undefined)
						{

							customerOutlet = 0;

						}
						splitfree = result[0][25];
						var manualfree = result[0][26];
						manualfreediscount = eval(result[0][27]);
						customeraddress = customeraddress1;
						if (customeraddress2 != '')
							customeraddress = customeraddress + ", "
									+ customeraddress2;
						if (customeraddress3 != '')
							customeraddress = customeraddress + ", "
									+ customeraddress3;

						var arbcustomeraddress1 = result[0][30];
						var arbcustomeraddress2 = result[0][29];
						var arbcustomeraddress3 = result[0][28];
						
						amountBeforeVat = eval(result[0][31])- eval(result[0][32]) - eval(result[0][33]);
						
						totalfinalamount = eval(result[0][31])- eval(result[0][32]) - eval(result[0][33]) + eval(result[0][40]);
						
						
								
						totalOrdVat = eval(result[0][40]);
						invoicepriceprint = eval(result[0][35]);
						arbcustomeraddress = arbcustomeraddress1;

						if (arbcustomeraddress2 != '')
							arbcustomeraddress = arbcustomeraddress + ", "
									+ arbcustomeraddress2;
						if (arbcustomeraddress3 != '')
							arbcustomeraddress = arbcustomeraddress + ", "
									+ arbcustomeraddress3;

						var cashamt = eval(result[0][36]);
						var chequeamt = eval(result[0][37]);
						if (cashamt == 0)
						{

							data["ptype"] = 1;
						} else if (chequeamt == 0)
						{
							data["ptype"] = 0;

						} else if (cashamt > 0 && chequeamt > 0)
						{
							data["ptype"] = 2;

						}
						// sujee added for signature print
						// sigcapture = localStorage.getItem("custsignature");
						sigcapture = result[0][39];
						// alert('sigcapture' +sigcapture);
						data["sigcapture"] = sigcapture;

						// GetSalesData('sales');
						// 0 For display Discount and 1 For Report have UPC
						checkSalesOrderHeader('order', '1', manualfree,
								splitfree);
					}
				}, function()
				{
					console.warn("Error calling plugin");
				});
	}
}

function checkSalesOrderHeader(trans, val, manualfree, splitfree)
{

	if (eval(manualfree) > 0 && splitfree == '1')
	{

		GetOrderData('order', '1', true);
	} else
	{

		GetOrderData('order', '1', false);
	}

}

function GetOrderData(trans, val, isFree)
{

	if (val == '1')
	{
		var total = {
			"QTY CAS/PCS" : "0/0",
			"TOTAL PCS" : "0",
			"DISCOUNT" : "0",
			"AMOUNT" : "0"
		};
		var Header = ["SL#", "ITEM#", "OUTLET CODE", "DESCRIPTION", "UPC",
				"QTY CAS/PCS", "TOTAL PCS", "CASE PRICE", "UNIT PRICE",
				"DISCOUNT", "AMOUNT"];

	} else
	{
		var total = {
			"QTY CAS/PCS" : "0/0",
			"DISCOUNT" : "0",
			"AMOUNT" : "0"
		};
		var Header = ["SL#", "ITEM#", "OUTLET CODE", "DESCRIPTION",
				"QTY CAS/PCS", "TOTAL PCS", "CASE PRICE", "UNIT PRICE",
				"DISCOUNT", "AMOUNT"];

	}

	var HeaderFree = ["SL#", "ITEM#", "OUTLET CODE", "DESCRIPTION", "UPC",
			"QTY CAS/PCS", "TOTAL PCS", "CASE PRICE", "UNIT PRICE", "DISCOUNT",
			"AMOUNT"]
	var QryOrder = "SELECT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',"
			+ "IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase "
			+ "as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((salesqty/unitspercase) AS INT),0) "
			+ "ELSE (IFNULL(CAST((salesqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((salesqty%unitspercase)"
			+ " AS INT),0)) END AS 'quantity',salesqty AS 'tqty',IFNULL(salescaseprice,0) AS caseprice,"
			+ "IFNULL(salesprice,0) AS unitprice,IFNULL(promoamount,0) as discount,"
			+ "(((IFNULL(CAST((salesqty/unitspercase) AS INT),0) * IFNULL(salescaseprice,0)) + "
			+ "(IFNULL(CAST((salesqty%unitspercase) AS INT),0)) * IFNULL(salesprice,0)) - IFNULL(promoamount,0))"
			+ "  AS 'amount',arbitemshortdescription AS arbdescription,im.barcode1 "
			+ "as barcode FROM salesorderdetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and "
			+ "inv.salesqty > 0 JOIN salesorderheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="
			+ customerOutlet
			+ "  WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1  order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";

	var QryFree = "SELECT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((manualfreeqty/unitspercase) AS INT),0)  ELSE (IFNULL(CAST((manualfreeqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((manualfreeqty%unitspercase) AS INT),0)) END AS 'quantity',manualfreeqty AS 'tqty',0 AS caseprice,0 AS unitprice,0 AS 'discount',0 AS 'amount',arbitemshortdescription AS arbdescription,im.barcode1 as barcode FROM salesorderdetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and inv.manualfreeqty > 0 JOIN salesorderheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="
			+ customerOutlet
			+ " WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1 order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";

	var QryPromoFree = "SELECT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription  AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((freesampleqty/unitspercase) AS INT),0)  ELSE (IFNULL(CAST((freesampleqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((freesampleqty%unitspercase) AS INT),0)) END AS 'quantity',freesampleqty AS 'tqty',IFNULL(salescaseprice,0) AS caseprice,IFNULL(salesprice,0) AS unitprice,0 AS 'discount',0 AS 'amount',arbitemshortdescription AS arbdescription,im.barcode1 as barcode FROM salesorderdetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and freesampleqty > 0 JOIN salesorderheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="
			+ customerOutlet
			+ " WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";
	var QryGood = "SELECT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((returnqty/unitspercase) AS INT),0)  ELSE (IFNULL(CAST((returnqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((returnqty%unitspercase) AS INT),0)) END AS 'quantity',returnqty AS 'tqty',IFNULL(goodreturncaseprice,0) AS caseprice,IFNULL(goodreturnprice,0) AS unitprice,IFNULL(promoamount,0) as discount,(((IFNULL(CAST((returnqty/unitspercase) AS INT),0) * IFNULL(goodreturncaseprice,0)) + (IFNULL(CAST((returnqty%unitspercase) AS INT),0)) * IFNULL(goodreturnprice,0))) AS 'amount',arbitemshortdescription AS arbdescription,im.barcode1 as barcode FROM salesorderdetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and inv.returnqty > 0 JOIN salesorderheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="
			+ customerOutlet
			+ " WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1  order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";
	var QryBuyback = "SELECT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((returnfreeqty/unitspercase) AS INT),0)  ELSE (IFNULL(CAST((returnfreeqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((returnfreeqty%unitspercase) AS INT),0)) END AS 'quantity',returnfreeqty AS 'tqty',IFNULL(goodreturncaseprice,0) AS caseprice,IFNULL(goodreturnprice,0) AS unitprice,IFNULL(promoamount,0)+IFNULL(returnpromoamount,0) as discount,0 AS 'amount',arbitemshortdescription AS arbdescription,im.barcode1 as barcode FROM invoicedetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and inv.returnfreeqty > 0 JOIN invoiceheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="
			+ customerOutlet
			+ " WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1  order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";

	var QryBad = "SELECT 0 as sl,CASE WHEN '"
			+ sessionStorage.getItem("CheckCode")
			+ "' = 'alternatecode' THEN im.alternatecode ELSE im.actualitemcode END AS 'itemcode',IFNULL(ocode.outletitemcode,'-') AS 'outletcode',itemdescription AS 'description',unitspercase as upc,CASE WHEN unitspercase ='1' THEN  '0/' || IFNULL(CAST((damagedqty/unitspercase) AS INT),0)  ELSE (IFNULL(CAST((damagedqty/unitspercase) AS INT),0) ||  '/' || IFNULL(CAST((damagedqty%unitspercase) AS INT),0)) END AS 'quantity',damagedqty AS 'tqty',IFNULL(inv.returncaseprice,0) AS caseprice,IFNULL(inv.returnprice,0) AS unitprice,IFNULL(promoamount,0) as discount,(((IFNULL(CAST((damagedqty/unitspercase) AS INT),0) * IFNULL(inv.returncaseprice,0)) + (IFNULL(CAST((damagedqty%unitspercase) AS INT),0)) * IFNULL(inv.returnprice,0))) AS 'amount',arbitemshortdescription AS arbdescription,im.barcode1 as barcode FROM salesorderdetail inv JOIN itemmaster im ON im.actualitemcode = inv.itemcode and inv.damagedqty > 0 JOIN salesorderheader invh ON invh.visitkey = inv.visitkey AND invh.customercode = "
			+ sessionStorage.getItem("customerid")
			+ " LEFT JOIN outletitemcodes ocode on ocode.itemcode=inv.itemcode and ocode.groupcode="
			+ customerOutlet
			+ " WHERE inv.routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND inv.visitkey = "
			+ sessionStorage.getItem("VisitKey")
			+ " and im.itemtype=1  order by CASE printsequencecust WHEN 0 THEN 100000 ELSE printsequencecust END";
	var Qry;
	if (trans == 'order')
		Qry = QryOrder;
	else if (trans == 'free')
	{
		Qry = QryFree;
		Header = HeaderFree;
		delete total["Discount"];
	} else if (trans == 'promofree')
	{
		Qry = QryPromoFree;
		Header = HeaderFree;
		delete total["Discount"];
	} else if (trans == 'good')
	{
		Qry = QryGood;
	} else if (trans == 'buyback')
	{
		Qry = QryBuyback;
	} else if (trans == 'bad')
		Qry = QryBad;
	console.log("nidhi----" + Qry);
	// alert(Qry);
	if (platform == 'iPad')
	{

	} else if (platform == 'Android')
	{

		window.plugins.DataBaseHelper.select(Qry, function(result)
		{
			if (result.array != undefined)
			{
				if (trans == 'free' || trans == 'promofree')
				{
					if (eval(printbarcode) == 1)
					{
						result = $.map(result.array, function(item, index)
						{
							return [[item.sl, item.itemcode, item.outletcode,
									item.description, item.upc, item.quantity,
									item.tqty, item.caseprice, item.unitprice,
									item.discount, item.amount, item.barcode]];
						});
					} else
					{
						result = $.map(result.array, function(item, index)
						{

							return [[item.sl, item.itemcode, item.outletcode,
									item.description, item.upc, item.quantity,
									item.tqty, item.caseprice, item.unitprice,
									item.discount, item.amount,
									item.arbdescription]];
						});
					}

				} else
				{

					if (eval(printbarcode) == 1)
					{
						result = $.map(result.array, function(item, index)
						{
							// Start for display UPC or Discount

							if (val == '1')
							{
								return [[item.sl, item.itemcode,
										item.outletcode, item.description,
										item.upc, item.quantity, item.tqty,
										item.caseprice, item.unitprice,
										item.discount, item.amount,
										item.barcode]];
							} else
							{
								return [[item.sl, item.itemcode,
										item.outletcode, item.description,
										item.quantity, item.tqty,
										item.caseprice, item.unitprice,
										item.discount, item.amount,
										item.barcode]];
							}

						});
					} else
					{

						result = $.map(result.array, function(item, index)
						{
							// Start for display UPC or Discount
							if (val == '1')
							{
								return [[item.sl, item.itemcode,
										item.outletcode, item.description,
										item.upc, item.quantity, item.tqty,
										item.caseprice, item.unitprice,
										item.discount, item.amount,
										item.arbdescription]];
							} else
							{
								return [[item.sl, item.itemcode,
										item.outletcode, item.description,
										item.quantity, item.tqty,
										item.caseprice, item.unitprice,
										item.discount, item.amount,
										item.arbdescription]];
							}

						});

					}
				}
			} else
				result = [];

			SetOrderTransaction(trans, result, Header, total, isFree);
			if (trans == 'order')
				GetOrderData('good', '1', isFree); // Added for display UPC
			if (trans == 'good')
				GetOrderData('buyback', '1', isFree); // Added for display UPC
			if (trans == 'buyback')
				GetOrderData('bad', '1', isFree); // Added for display UPC

			if (trans == 'bad')
				GetOrderData('promofree', '1', isFree); // Added for display UPC

			if (trans == 'promofree' && !isFree)
				GetOrderData('free', '1', isFree); // Added for display UPC

		}, function()
		{
			console.warn("Error calling plugin");
		});
	}
}
function SetOrderTransaction(trans, result, Header, Total, isFree)
{
	for (i = 0; i < result.length; i++)
	{
		for (j = 0; j < result[i].length; j++)
		{
			if (j == 1)
			{
				if (sessionStorage.getItem("CheckCode") == 'ancode'
						&& !isNaN(result[i][j]))
				{
					result[i][j] = parseInt(result[i][j], 10);
				}
				result[i][j] = (result[i][j]).toString();
			}
			if (j == 2)
			{
				if (!isNaN(result[i][j]) && result[i][j] != '-')
				{
					result[i][j] = parseInt(eval(result[i][j]));
					result[i][j] = (result[i][j]).toString();
				} else
				{
					result[i][j] = ("  ").toString();
				}

			}
			if (j == 5)
			{
				var qtykey = "QTY CAS/PCS";
				QuantityTotal(Total, qtykey, result[i][j]);
			}
			if (j == 6)
			{
				var qtykey = "TOTAL PCS";
				QTotal(Total, qtykey, result[i][j]);
			}

			else if (j == 9 && trans != 'free' && trans != 'promofree')
			{
				result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
				Total.DISCOUNT = (eval(Total.DISCOUNT) + eval(result[i][j]))
						.toString();
			} else if (j == 9 && (trans == 'free'))
				Total.AMOUNT = (eval(Total.AMOUNT) + eval(result[i][j]))
			else if (j == 10 && trans != 'free')
				Total.AMOUNT = (eval(Total.AMOUNT) + eval(result[i][j]))
			if (j > 6 && j <= 10)
			{
				result[i][j] = (eval(result[i][j])).toFixed(decimalplace);
			}
		}
	}

	if (isNaN(Total.DISCOUNT))
		Total.DISCOUNT = 0;
	if (isNaN(Total.AMOUNT))
		Total.AMOUNT = 0;
	Total.DISCOUNT = eval(parseFloat(Total.DISCOUNT)).toFixed(decimalplace);
	Total.AMOUNT = eval(parseFloat(Total.AMOUNT)).toFixed(decimalplace);
	// console.log("TOTALQTY : " + Total.QUANTITY);
	// SetData(trans,result,Header,total);
	if (data["data"] == undefined)
		data["data"] = [];
	data["data"].push({
		"TITLE" : trans,
		"DATA" : result,
		"HEADERS" : Header,
		"TOTAL" : Total
	});

	if ((isFree && trans == "promofree") || trans == "free")
	{
		getCommonData();
		var invoicetype = ""

		// if(eval(headerAmount)>=0){
		invoicetype = "ORDER " + invoicenumber;

		// }else{
		// invoicetype = "CREDIT NOTE " + invoicenumber;

		// }

		data["invoicepaymentterms"] = invoicepaymentterms;
		data["invoicenumber"] = invoicenumber;
		data["INVOICETYPE"] = invoicetype;
		// sujee commented for Enahcne Grp 21/05/2018
		data["CUSTOMER"] = alternatecode + "   " + customername + ""; // "5416-SWITZ
		// MASTER BAKERS
		// (Cr)";

		// data["CUSTOMER"] = alternatecode;

		data["ADDRESS"] = customeraddress; // "Suite 808, Burjuman Business
		// Tower";
		data["ARBADDRESS"] = arbcustomeraddress; // "Suite 808, Burjuman
		// Business Tower";
		data["invoicepriceprint"] = invoicepriceprint;

		if (comments == 0 || comments == "0")
			comments = "";
		data["comments"] = unescape(comments);
		if (lpoNumber != 0 && lpoNumber != "" && lpoNumber != null
				&& lpoNumber != undefined)
		{
			data["lpoNumber"] = lpoNumber;
		}
		data["printstatus"] = getPrintStatus();

		/*
		 * data["SUB TOTAL"] = eval(totalfinalamount).toFixed(
		 * decimalplace).toString();
		 * 
		 */
		
		data['ITEM DISCOUNT'] = eval(itempromoamount).toFixed(decimalplace).toString();
		
		data['HEADER DISCOUNT'] = (totalpromoamount - itempromoamount + eval(manualfreediscount)).toFixed(decimalplace).toString();
		
		data['AMOUNT BEFORE VAT'] = (eval(amountBeforeVat) - eval(totalpromoamount)).toFixed(decimalplace).toString();
		
		data["TOTVAT"] = totalOrdVat.toFixed(decimalplace).toString();
		
		
		
		data["SUB TOTAL"] = (eval(totalfinalamount) - eval(totalpromoamount))
				.toFixed(decimalplace).toString();

		data["printoutletitemcode"] = printoutletitemcode;
		

		data["printbarcode"] = eval(printbarcode);
		data["NET AMOUNT"] = eval(headerAmount).toFixed(decimalplace)
				.toString();
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
		data["TCCHARGED"] = (tcamount - totalpromoamount).toFixed(decimalplace)
				.toString();

		if (invoicepaymentterms > 2)
			data["TCALLOWED"] = "1";
		else
			data["TCALLOWED"] = "0";
		console.log(JSON.stringify(data));

		ArrPrint.push([{
			"mainArr" : data,
			"name" : ReportName.Order
		}]);

		if (isFree && trans == 'promofree')
		{
			var paymentdata = {};
			paymentdata["Cash"] = data["Cash"];
			paymentdata["Cheque"] = data["Cheque"];

			data = {};
			data["Cash"] = paymentdata["Cash"];
			data["Cheque"] = paymentdata["Cheque"];
			paymentdata = {};
			GetOrderData('free', '1', isFree);

		}
		if (trans == "free")
		{
			PrintReportArray();

		}

	}
}

function addDaysToDate(date, days)
{
	var curDate = new Date(date);
	var newdate = new Date(curDate);
	newdate.setDate(newdate.getDate() + days);

	var currentDate = new Date();

	if (newdate < currentDate)
	{
		newdate = currentDate;
	}

	var dd = newdate.getDate();
	var mm = newdate.getMonth() + 1;
	var y = newdate.getFullYear();

	var formatedDate = dd + '/' + mm + '/' + y;

	return formatedDate;

}
