//var wsurl = "http://wjtts.fortiddns.com:8095/sfa/enhancetest/api/"; //tts test server


//var wsurl="http://enomsfa01.westeurope.cloudapp.azure.com:8095/sfa/enhance_live/api/";  // new erp oracle

//var wsurl="http://enomsfa01.westeurope.cloudapp.azure.com:8095/sfa/enhance_uat/api/";

//var wsurl="https://routepro.enhance-group.com/api/";

var wsurl="https://routeprouat.enhance-group.com/api/";

 
var invoicedetail = {};
var invoiceheader = {};
var invoicerxddetail = {};
var promotiondetail = {};
var customerinvoice = {};
var salesorderdetail = {};
var salesorderheader = {};
var orderrxddetail={};
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
var sigcapturedata = {};
var customerinventorydetail = {};
var customerinventorycheck={};
var visualsfeedback={};
var promotions_remark={};
var customerdistributioncheck={};
var customeroperationscontrol = {};
var routesequencecustomerstatus = {};
var routemaster = {};
var routegoal = {};
var customermaster = {};
var customer_foc_balance = {};
var sendroutekey = {};
var customervisitlog = {};
var batchexpirydetail={};
var routeclosed;
var routekey;
document.write('<script type="text/javascript" src="../js/sync.js"><\/script>');
document.write('<script type="text/javascript" src="../js/translations.js"><\/script>');
document.write('<script type="text/javascript" src="../js/Constants.js"><\/script>');

// Function is used for load specify xml file
function loadXMLDoc(dname) {
	if (window.XMLHttpRequest) {
		xhttp = new XMLHttpRequest();
	} else {
		xhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhttp.open("GET", dname, false);
	xhttp.send();
	return xhttp.responseXML;
}
var footerurl = '';
var curentid = '';

function footerredict(url) {

	if (url == '../settlement/managesettlement.html') {
		checkRoutetype();
		
	} else {
		footerurl = url;
		navigator.notification.confirm(getLangTextdata("Are You Sure To Cancel This Screen?"),
				onConfirmfooter);
	}

}

function checkRoutetype()
{
    if (platform == 'iPad') {
        Cordova.exec(function(result) {
                      if (result[0][0]==2) {
                     
                      }
                      
                      },
                      function(error) {
                      alert("Error in getting setup : " + error);
                      },
                      "PluginClass",
                      "GetdataMethod",
                      ["select routetype from routemaster where routecode="+sessionStorage.getItem("RouteCode")]);
    }
    else if (platform == 'Android') {
        window.plugins.DataBaseHelper.select("select routetype from routemaster where routecode="+sessionStorage.getItem("RouteCode"), function(result) 
			{
				
				sessionStorage.setItem("rtype",result.array[0].routetype); 
					
                                             if (result.array[0].routetype==2) {
                                            	 window.location = "../home/home.html";	
                                             }else{
                                            	 checkSettlement(); 
                                            	 
                                             }
                                            
                                             },
                                             function() {
                                             console.warn("Error calling plugin");
                                             });
    }
}

function onConfirmfooter(button) {
	//alert("LOG "+sessionStorage.getItem("logId"));
	if (button == 1) {
		
		//For updating customer end log...
		//Commented by Aswin - 12-06-2025 for enabling customercheckout mannandatory before next customer visit.
		/*if(sessionStorage.getItem("logId") != null)
			{
			
			   var mydate = new Date();			
	           var thehour = mydate.getHours();
	           var theminut = mydate.getMinutes();
	           var visitendtime = thehour+":"+theminut;
			   const localDateTime = getLocalDateTimeString();
	           //Query for updting customerlog.
	            var logQry = "UPDATE customervisitlog set log_enddate = date(), log_endtime = '"+localDateTime+"' where routekey=" + sessionStorage.getItem("RouteKey") + " AND log_id = " + sessionStorage.getItem("logId");
	            
	            window.plugins.DataBaseHelper.insert(logQry,function(result)
	            {
	            	sessionStorage.setItem("logId", "null"); 
	            },
	            function()
	            {
	                 console.warn("Error calling plugin");
	            });
			
			}*/
		
		window.location.href = footerurl;
		
	} else {
		var menulink = $("[data-role=navbar] a[onclick=\"footerredict('"
				+ footerurl + "')\"]");
		menulink.removeClass("ui-btn-active");
		var currenturl = $.mobile.activePage.data('url');
		console.log("cireer = " + currenturl);
		var pos = currenturl.lastIndexOf('/');
		var final = currenturl.substring(pos + 1);
		$("#" + curentid).addClass("ui-btn-active");
	}

}

 function getLocalDateTimeString() {
                const now = new Date();
                const pad = n => String(n).padStart(2, '0');

                const year = now.getFullYear();
                const month = pad(now.getMonth() + 1);
                const day = pad(now.getDate());
                const hours = pad(now.getHours());
                const minutes = pad(now.getMinutes());
                const seconds = pad(now.getSeconds());

                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

//function for batch data upload
function batchdata() {
	var startdate1 = new Date();
	var currenttime = Math.abs(startdate1.getTime());

	if (sessionStorage.getItem('batchtime') < currenttime)
		navigator.notification.confirm("Are You Want To Send Data?",
				onConfirmdata);
}
function onConfirmdata(button) {
	if (button == 1) {
		senddata('batch', '');
	}
}
function checkcustenable() {
	if (sessionStorage.getItem('syncmode') == 2) {
		batchdata();
	}
	platform = sessionStorage.getItem("platform");
	var qry = "SELECT count(*) as key from inventorytransactionheader WHERE routecode = "
			+ sessionStorage.getItem("RouteCode")
			+ " and routekey="
			+ sessionStorage.getItem("RouteKey") + " and transactiontype=3";
	console.log(qry);
	var seletqry = "select max(routekey) routekey from startendday where routecode = "
			+ sessionStorage.getItem('RouteCode')
			+ " and salesmancode = "
			+ sessionStorage.getItem('SalesmanCode') + " and routeclosed=0";
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result[0][0] != 0) {
				$("[data-role=navbar] #cust").attr("onclick", '');
				$("[data-role=navbar] #cust").removeClass("ui-btn-active");
				$("[data-role=navbar] #cust").addClass('MenuGray');
			}

		}, function(error) {
			alert("Error in getting setup : " + error);
		}, "PluginClass", "GetdataMethod", [ qry ]);
		Cordova.exec(function(result) {
			if (result[0][0] == 0 || result == '') {
				
				$("[data-role=navbar] #cust").attr("onclick", '');
				$("[data-role=navbar] #cust").removeClass("ui-btn-active");
				$("[data-role=navbar] #cust").addClass('MenuGray');

				$("[data-role=navbar] #inve").attr("onclick", '');
				$("[data-role=navbar] #inve").removeClass("ui-btn-active");
				$("[data-role=navbar] #inve").addClass('MenuGray');

				$("[data-role=navbar] #sett").attr("onclick", '');
				$("[data-role=navbar] #sett").removeClass("ui-btn-active");
				$("[data-role=navbar] #sett").addClass('MenuGray');

				$("[data-role=navbar] #expe").attr("onclick", '');
				$("[data-role=navbar] #expe").removeClass("ui-btn-active");
				$("[data-role=navbar] #expe").addClass('MenuGray');
				
				$("[data-role=navbar] #ordstatus").attr("onclick", '');
				$("[data-role=navbar] #ordstatus").removeClass("ui-btn-active");
				$("[data-role=navbar] #ordstatus").addClass('MenuGray');
			}

		}, function(error) {
			alert("Error in getting setup : " + error);
		}, "PluginClass", "GetdataMethod", [ seletqry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(qry, function(result) {
			if (result.array[0].key != 0) {
				$("[data-role=navbar] #cust").attr("onclick", '');
				$("[data-role=navbar] #cust").removeClass("ui-btn-active");
				$("[data-role=navbar] #cust").addClass('MenuGray');
			}
		}, function() {
			console.warn("Error calling plugin");
		});
		
		window.plugins.DataBaseHelper.select(seletqry, function(result) {
			if (result.array[0].routekey == 0 || result.array == undefined) {
				$("[data-role=navbar] #cust").attr("onclick", '');
				$("[data-role=navbar] #cust").removeClass("ui-btn-active");
				$("[data-role=navbar] #cust").addClass('MenuGray');

				$("[data-role=navbar] #inve").attr("onclick", '');
				$("[data-role=navbar] #inve").removeClass("ui-btn-active");
				$("[data-role=navbar] #inve").addClass('MenuGray');

				$("[data-role=navbar] #sett").attr("onclick", '');
				$("[data-role=navbar] #sett").removeClass("ui-btn-active");
				$("[data-role=navbar] #sett").addClass('MenuGray');

				$("[data-role=navbar] #expe").attr("onclick", '');
				$("[data-role=navbar] #expe").removeClass("ui-btn-active");
				$("[data-role=navbar] #expe").addClass('MenuGray');
				
				$("[data-role=navbar] #ordstatus").attr("onclick", '');
				$("[data-role=navbar] #ordstatus").removeClass("ui-btn-active");
				$("[data-role=navbar] #ordstatus").addClass('MenuGray');
				
			}
		}, function() {
			console.warn("Error calling plugin");
		});
		checkinventorymainmenu();
	}

}

function checkinventorymainmenu()
{
	
    if (platform == 'iPad') {
        Cordova.exec(function(result) {
                      if (result[0][0]==2) {
                      $("#inventorylink").attr("href","#");
                      $("#inventorylink").attr("onclick","");
                      $("#inventorylink img").attr("src","../images/icon-5.png");
                      $("#inventorylink h3").addClass('MenuGray');
                      }
                      
                      },
                      function(error) {
                      alert("Error in getting setup : " + error);
                      },
                      "PluginClass",
                      "GetdataMethod",
                      ["select routetype from routemaster where routecode="+sessionStorage.getItem("RouteCode")]);
    }
    else if (platform == 'Android') 
    {
        window.plugins.DataBaseHelper.select("select routetype from routemaster where routecode="+sessionStorage.getItem("RouteCode"), function(result) 
		{
                                             if (result.array[0].routetype==2) {
                                            	 $("[data-role=navbar] #inve").attr("onclick", '');
                                 				 $("[data-role=navbar] #inve").removeClass("ui-btn-active");
                                 				 $("[data-role=navbar] #inve").addClass('MenuGray');
                                             }
                                            
                                             },
                                             function() {
                                             console.warn("Error calling plugin");
                                             });
    }
}

// $(document).bind("mobileinit", function(){
// $.mobile.touchOverflowEnabled = true;
// });
$(document)
		.ready(
				function() {
					curentid = $(".ui-btn-active").attr("id");
					document.addEventListener("deviceready", checkcustenable,
							false);

					$(document)
							.keydown(
									function(event) {
										if (event.ctrlKey == true
												&& (event.which == '118' || event.which == '86')) {
											alert('thou. shalt. not. PASTE!');
											event.preventDefault();
										}
									});
					/* Function to Set LoadingImage for each page */
					$.mobile.showPageLoadingMsg();
					$(window).load(function() {
						$.mobile.hidePageLoadingMsg();
					});
					$('input[pattern="[0-9]*"]').keyup(function(e) {
						var val = $(this).val();
						if (isNaN(val)) {
							val = val.replace(/[^0-9\.\-]/g, '');
							if (val.split('.').length > 2)
								val = val.replace(/\.+$/, "");
						}
						$(this).val(val);
					})
					$('input').focus(function() {
						var val = $(this).val();

						if (val == 0)
							$(this).val('');
					});
				});

/* Function to set Language text */
function ChangeLanguage(XMLDOC, ELM, PageName, TAG) {
	var ELEMENT = '#' + ELM;
	if ($(ELEMENT).is('input')) {
		$(ELEMENT).val();
	} else
		$(ELEMENT).text($(XMLDOC).find("SFA " + PageName + " " + TAG).text());
	// $('#'+
	// ELM).text(XMLDOC.getElementsByTagName(TAG)[0].childNodes[0].nodeValue);
}

// function to open odometer reading popup
var linkMeter = null;
function PopupOdometer(element, linkid, html) {
	var totalheight=(eval(window.innerHeight*30)/100)+'px';
	
	var elementid = '#' + element;
	linkMeter = linkid;
	var setHTML = null;
	// alert(linkid);
	// alert(element);
	// alert(html);
	setHTML = "<table id='tblOdoMeter' border='0' cellpadding='2' cellspacing='0' width='100%;'>"
			+ html + "</table>";

	$('.ui-simpledialog-container').css({
		'display' : 'none'
	});

	$(document).delegate(elementid, 'click', function() {

		$(elementid).simpledialog({
			'mode' : 'blank',
			'prompt' : false,
			'forceInput' : false,
			'useModal' : true,
			'fullHTML' : setHTML,
			 'top':totalheight
		})
	})
}

function PopupStartdayOdometer(element, linkid, html) {
	var totalheight=(eval(window.innerHeight*30)/100)+'px';
	
	var elementid = '#' + element;
	linkMeter = linkid;
	var setHTML = null;
	// alert(linkid);
	// alert(element);
	// alert(html);
	setHTML = "<table id='tblOdoMeter' border='0' cellpadding='2' cellspacing='0' width='100%;'>"
			+ html + "</table>";

	$('.ui-simpledialog-container').css({
		'display' : 'none'
	});

	// $(document).delegate(elementid, 'click', function() {

	$(elementid).simpledialog({
		'mode' : 'blank',
		'prompt' : false,
		'forceInput' : false,
		'useModal' : true,
		'fullHTML' : setHTML,
		 'top':totalheight
	});
	// })
}

// //function to open odometer reading popup
var link = null;
var cancelLink = null;
var nextone = null;
var newelement = null;
function PopupPasswordEntry(element, linkid, html, cancellink) { 


	var elementid = '#' + element;
	link = linkid;
	cancelLink = cancellink;
	var htmlCommon = null;
	htmlCommon = "<table id='tblPassword' border='0' cellpadding='2' cellspacing='0' width='100%;'>"
			+ html + "</table>";

	var base = window.location.toString().substring(0,
			window.location.toString().lastIndexOf("/"))
			+ "/";
	var passvalue = CheckZeroPassword();
	 
	if (link == 'miscallaneous.html' || link == "miscellaneous.html"
			|| link == "utilities.html")
		passvalue = 1;

	if (passvalue == 0 || passvalue == "") {

		// if (link == 'unload_option.html' && localStorage.enableodioinput ==
		// 1) {
		// alert("test");
		// PopupOdometer(elementid, link, html);
		// updatetransactiondetail();
		// deletebatchmaster('unload_option.html');

		// updatetransactiondetail();
		// PopupOdometer(elementid, link, tblOdoMeter.innerHTML);
		// updatetransactiondetail();
		// deletebatchmaster('unload_option.html');

		// }
		// else if(link == 'unload_option.html' && localStorage.enableodioinput
		// != 1)
		if (link == 'unload_option.html') {
			// updatetransactiondetail();
			// endstockqtyupdate();
			PopupOdometer(eid, alink, html);
			//checkLoadRequest();
		} else if (link == 'startofday.html') {
			window.location = "../startofday/startofday.html";
		} else if (link == "loadtransfer.html") {
			deletebatchmaster('loadtransfer.html');
		} else if (link == "loadselection.html") {
			deletebatchmaster('loadselection.html');
		} else if (link == "customer_promotion_list.html"
				|| link == "order_promotion_list.html") {
			enforcepromotionoverride();
		}

		else if (link == "promotion_review.html") {
			window.location = 'signature.html';
		} else if (link == "../settlement/managesettlement.html") {
			CheckUnloadDone();
		} else {

			window.location = base + link;

		}
	} else {
		var totalheight=(eval(window.innerHeight*30)/100)+'px';
		$(elementid).simpledialog({
			'mode' : 'blank',
			'prompt' : false,
			'forceInput' : false,
			'useModal' : true,
			 'top':totalheight,
			'fullHTML' : htmlCommon
		})
		/*
		 * $(document).delegate(elementid, 'click', function() {
		 * $(this).simpledialog({ 'mode': 'blank', 'prompt': false,
		 * 'forceInput': false, 'useModal': true, 'fullHTML': htmlCommon }) })
		 */
	}
}
function popuppasswordgenerator(element, linkid, html, cancellink) {

	var totalheight=(eval(window.innerHeight*30)/100)+'px';
	
	
	var elementid = '#' + element;
	
	link = linkid;
	cancelLink = cancellink;
	var htmlCommon = null;
	htmlCommon = "<table id='tblPassword' border='0' cellpadding='2' cellspacing='0' width='100%;'>"
			+ html + "</table>";
	
	$(elementid).simpledialog({
		'mode' : 'blank',
		'prompt' : false,
		'forceInput' : false,
		'useModal' : true,
		'fullHTML' : htmlCommon,
	    'top':totalheight
	});
	$(document).delegate(elementid, 'click', function() {

	});
}

function popupCheckoutpasswordgenerator(element, linkid, html, cancellink) {

	var totalheight=(eval(window.innerHeight*30)/100)+'px';
	
	
	
	var elementid = '#' + element;
	
	link = linkid;
	cancelLink = cancellink;
	var htmlCommon = null;
	htmlCommon = "<table id='tblCheckOutPassword' border='0' cellpadding='2' cellspacing='0' width='100%;'>"
			+ html + "</table>";
	
	$(elementid).simpledialog({
		'mode' : 'blank',
		'prompt' : false,
		'forceInput' : false,
		'useModal' : true,
		'fullHTML' : htmlCommon,
	    'top':totalheight
	});
	$(document).delegate(elementid, 'click', function() {

	});
}

function popupEnforcepasswordgenerator(element, linkid, html, cancellink) {

	var totalheight=(eval(window.innerHeight*30)/100)+'px';
	
	
	var elementid = '#' + element;
	
	link = linkid;
	cancelLink = cancellink;
	var htmlCommon = null;
	htmlCommon = "<table id='tblEnforcePassword' border='0' cellpadding='2' cellspacing='0' width='100%;'>"
			+ html + "</table>";
	
	$(elementid).simpledialog({
		'mode' : 'blank',
		'prompt' : false,
		'forceInput' : false,
		'useModal' : true,
		'fullHTML' : htmlCommon,
	    'top':totalheight
	});
	$(document).delegate(elementid, 'click', function() {

	});
}

// Get password for start day home section security added by Mirnah
// Start------------------------------------------
// Function for get password
function getstartdayPassword() {

	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result.length > 0) {
								var i = result[0][0];
								var j = result[0][6];
								localStorage.starofdaypass = ((result[0][0] == 0) ? 0
										: result[0][i]);
								localStorage.adminpass = result[0][5];
								localStorage.settlementpass = ((result[0][6] == 0) ? 0
										: result[0][j]);
							} else {
								localStorage.starofdaypass = "";
								localStorage.adminpass = "";
								localStorage.settlementpass = "";
							}
						},
						function(error) {
							alert("Error in getting Password : " + error);
						},
						"PluginClass",
						"GetdataMethod",
						[ "select passwordarray07,password1,password2,password3,password4,password5,passwordarray09 From routemaster where routecode = "
								+ sessionStorage.getItem('RouteCode') + "" ]);

	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select(
						"select passwordarray07,password1,password2,password3,password4,password5,passwordarray09 From routemaster where routecode = "
								+ sessionStorage.getItem('RouteCode') + "",
						function(result) {
							if (result.array != undefined) {
								result = $.map(result.array, function(item,
										index) {
									return [ [ item.passwordarray07,
											item.password1, item.password2,
											item.password3, item.password4,
											item.password5,
											item.passwordarray09 ] ];
								});
								if (result.length > 0) {
									var i = result[0][0];
									var j = result[0][6];
									localStorage.starofdaypass = result[0][i];
									localStorage.adminpass = result[0][5];
									localStorage.settlementpass = ((result[0][6] == 0) ? 0
											: result[0][j]);
								}
							} else {
								localStorage.starofdaypass = "";
								localStorage.adminpass = "";
								localStorage.settlementpass = "";
							}

						}, function() {
							console.warn("Error calling plugin");
						});
	}

}
// End------------------------------------------
// Function to get Odometer last reading comment added by Mirnah
/*
 * insert into
 * startendday(routekey,routecode,salesmancode,routestartdate,routestarttime,routestartodometer)
 * values("+ data["startday"][0].routekey +","+
 * sessionStorage.getItem('RouteCode') +","+
 * sessionStorage.getItem('SalesmanCode') +",'"+
 * data["startday"][0].routestartdate +"','"+ data["startday"][0].routestarttime
 * +"',0)"
 */
// Start ------------------------------------------------
function getlastOdometer() {
	var platform = sessionStorage.getItem("platform");
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							console
									.log("select routestartodometer From startendday where routekey = "
											+ sessionStorage
													.getItem("RouteKey") + "");
							if (result != '') {
								// var i = result[0][0];
								localStorage.lastreading = parseInt(result[0][0]);

								// localStorage.adminpass = result[0][5];

							} else {
								localStorage.lastreading = 0;
								// localStorage.adminpass = "";
							}
							// alert(localStorage.lastreading);
							$("#lastreading").text(
									parseInt(localStorage.lastreading));
						},
						function(error) {
							alert("Error in getting Odometer : " + error);
						},
						"PluginClass",
						"GetdataMethod",
						[ "select routestartodometer From startendday where routekey = "
								+ sessionStorage.getItem("RouteKey") + "" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(
				"select routestartodometer From startendday where routekey = "
						+ sessionStorage.getItem("RouteKey") + "", function(
						result) {
					if (result.array != undefined) {
						result = $.map(result.array, function(item, index) {

							return [ [ item.routestartodometer ] ];
						});
						if (result != '') {
							// var i = result[0][0];
							localStorage.lastreading = parseInt(result[0][0]);

							// localStorage.adminpass = result[0][5];

						} else
							localStorage.lastreading = 0;
					} else {
						localStorage.lastreading = 0;
						// localStorage.adminpass = "";
					}

					$("#lastreading").text(parseInt(localStorage.lastreading));
				}, function() {
					console.warn("Error calling plugin");
				});
	}

}
function getlastOdometerstart() {
	console.log("SELECT routeendodometer FROM startendday WHERE routecode="
			+ sessionStorage.getItem("RouteCode") + " and routekey!="
			+ sessionStorage.getItem("RouteKey")
			+ " order by routekey desc limit 0,1");
	var platform = sessionStorage.getItem("platform");
	if (platform == 'iPad') {
		Cordova.exec(function(result) {

			if (result != '') {
				// var i = result[0][0];
				localStorage.lastreading = parseInt(result[0][0]);
				// localStorage.adminpass = result[0][5];

			} else {
				localStorage.lastreading = 0;
				// localStorage.adminpass = "";
			}
			// alert(localStorage.lastreading);
		}, function(error) {
			alert("Error in getting Odometer : " + error);
		}, "PluginClass", "GetdataMethod",
				[ "SELECT routeendodometer FROM startendday WHERE routecode="
						+ sessionStorage.getItem("RouteCode")
						+ " order by routekey desc limit 0,1" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(
				"SELECT routeendodometer FROM startendday WHERE routecode="
						+ sessionStorage.getItem("RouteCode")
						+ " order by routekey desc limit 0,1",
				function(result) {
					if (result.array != undefined) {
						result = $.map(result.array, function(item, index) {

							return [ [ item.routeendodometer ] ];
						});

						if (result != '') {

							// var i = result[0][0];
							localStorage.lastreading = parseInt(result[0][0]);

							// localStorage.adminpass = result[0][5];

						} else
							localStorage.lastreading = 0;
					} else {
						localStorage.lastreading = 0;
						// localStorage.adminpass = "";
					}

				}, function() {
					console.warn("Error calling plugin");
				});
	}

}

function getLastOdometerRouteMaster() {

	var platform = sessionStorage.getItem("platform");
	if (platform == 'iPad') {
		Cordova.exec(function(result) {

			if (result != '') {
				// var i = result[0][0];
				localStorage.lastreading = parseInt(result[0][0]);
				// localStorage.adminpass = result[0][5];

			} else {
				localStorage.lastreading = 0;
				// localStorage.adminpass = "";
			}
			// alert(localStorage.lastreading);
		}, function(error) {
			alert("Error in getting Odometer : " + error);
		}, "PluginClass", "GetdataMethod",
				[ "SELECT routeendodometer FROM startendday WHERE routecode="
						+ sessionStorage.getItem("RouteCode")
						+ " order by routekey desc limit 0,1" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(
				"select vehicleodometer from routemaster WHERE routecode="
						+ sessionStorage.getItem("RouteCode"),
				function(result) {
					// alert(JSON.stringify(result));
					if (result.array != undefined) {
						result = $.map(result.array, function(item, index) {

							return [ [ item.vehicleodometer ] ];
						});

						if (result != '') {

							// var i = result[0][0];
							localStorage.lastreading = parseInt(result[0][0]);
							// alert(localStorage.lastreading);
							// localStorage.adminpass = result[0][5];

						} else
							localStorage.lastreading = 0;
					} else {
						localStorage.lastreading = 0;
						// localStorage.adminpass = "";
					}

				}, function() {
					console.warn("Error calling plugin");
				});
	}

}
// End -------------------------------------------------

function SetOdometer() {
	sessionStorage.setItem("OdometerRead", "1");
	var base = window.location.toString().substring(0,
			window.location.toString().lastIndexOf("/"))
			+ "/";
	window.location = base + linkMeter;
}

// This function used for start of day odometer
function SetStartofDayOdometer() { //alert("SetStartofDayOdometer"); alert('end meter' +localStorage.endodometer);
   //Sujee added  Odometer validation for Enhance
	if(localStorage.endodometer == null || localStorage.endodometer== undefined)
	   {
		localStorage.setItem("endodometer",0);
	   }
	if ($(".ui-simpledialog-container #txtDay1").val() == 0) {
		navigator.notification.alert("Please enter value greater than zero");
	} 
	else if ($(".ui-simpledialog-container #txtDay1").val() < localStorage.endodometer){
		navigator.notification.alert("Please enter value greater than last reading");
	}
	else {

		$('#simplestring').simpledialog('close');
		$.mobile.showPageLoadingMsg();
		sessionStorage.setItem("OdometerValue", $(
				".ui-simpledialog-container #txtDay1").val());
		removeFile();
		var mydate = new Date();

		var thehour = mydate.getHours();
		var theminut = mydate.getMinutes();
		var thesecond = mydate.getSeconds();

		var time = thehour + ":" + theminut + ":" + thesecond;
		var data = {};
		data["routecode"] = sessionStorage.getItem('RouteCode');
		data["salesmancode"] = sessionStorage.getItem('SalesmanCode');
		data["routestartodometer"] = $(".ui-simpledialog-container #txtDay1")
				.val();
		data["startdate"] = getTabletDate();
		data["starttime"] = time;
		data["deviceid"] = sessionStorage.getItem("DeviceID");
		data["ver"] = '8.1.2';
		data = JSON.stringify(data);
		// alert(data);
		// console.log(wsurl + "ws/senddata?startday=[" + data + "]");
		// url: wsurl + "ws/senddata?startday=[" + data + "]",
		// url: wsurl + "ws/senddata?strtday=[" + data + "]"
		$.ajax({
			type : "get",
			url : wsurl + "ws/senddata?startday=[" + data + "]",
			data : "{}",
			cache : false,
			timeout : 60000,
			crossDomain : true,
			success : function(data) {
				console.log(data);

				if (data.length > 0) {
					data = JSON.parse(data);
					 //alert(JSON.stringify(data));
					 //alert(data["startday"][0].status);
					if (data["startday"][0].status == 0) {
						insertOdometer(data, linkMeter);  
					}
					/* sujee added to check device date with server date  validation----*/
					else if (data["startday"][0].status == 2) {
						$.mobile.hidePageLoadingMsg();
						navigator.notification
								.alert("Please Check Your Device Date.");
					} 
					else {
						$.mobile.hidePageLoadingMsg();
						navigator.notification
								.alert("Start Of Day Already Done.");
					}
				}

			},
			error : function(qXHR, textStatus, errorThrown) {
				$.mobile.hidePageLoadingMsg();
				$("#simplestring").attr("onclick",
						"displayPrompt('simplestring')");
				$("#simplestring").css('cursor', 'text');
				$("#textBeginDay").removeClass('MenuGray');

				alert("Start day failure: " + qXHR.status + ":" + textStatus
						+ " " + errorThrown);
			}
		});
	}
}

function ClearOdometer(url) {
	var base = window.location.toString().substring(0,
			window.location.toString().lastIndexOf("/"))
			+ "/";
	if (linkMeter == 'startofday.html') {
		window.location = base + url;
	} else
		window.location = base + url;
}
function VerifyPassword1(eid, alink, html) {
	var base = window.location.toString().substring(0,
			window.location.toString().lastIndexOf("/"))
			+ "/";
	textVal = $(".ui-simpledialog-container #txtPassword").val();
	keyVal = $(".ui-simpledialog-container #passkey").text();
	if(alink=='salesinvoice' || alink == 'next'){
		
		keyVal=decodeFinancePwd(keyVal);
		
	}

	var pass = colName(keyVal);
	console.log(pass);
	//alert(pass);
	// window.location = base + alink;
	if (pass == textVal) {
		if (alink == 'next') {
			insertlog(4, '', textVal);
			SetNextPage();
		} else if(alink=='salesinvoice'){
			insertlog(4, '', textVal);
			window.location = "salesinvoice.html";
			
		} else if (alink == 'cashcollection') {
			insertlog(4, '', textVal);
			window.location = "../review/printoption.html";
		}else if (alink == 'route_sequence_detail') {
			redirect();
		} else if (alink == 'routesequence_gpscheck') {
			insertlog(1, '', textVal);
			if (sessionStorage.getItem("latitude") == 0
					|| sessionStorage.getItem("longitude") == 0) {
				ConfirmToRedirect();
			} else { //alert("here");
				updatemastercordinate();
			}

		} else if (alink == 'customerselection')
			checkcustomermsg();
		else if (alink == 'customerselectionscan') {
			insertlog(3, '', textVal);
			ShowOdoMeter();
		} else if (alink == 'void_customer.html') {
			insertlog(6, 'void_customer.html', textVal);
		} else if (alink == 'customerselection.html') {
			insertlog(2, 'customerselection.html', textVal);
		} else if (alink == 'salesinvoice_option.html') {
			insertlog(5, 'salesinvoice_option.html', textVal);
		} else if (alink == 'salesinvoice_option') {
			insertlog(4, 'salesinvoice_option.html', textVal);
		} else if(alink == 'return_goodcheck') {
			checkreturnentry('salesgoodreturn.html');
		}else if(alink == 'return_badcheck') {
			checkreturnentry('salesbadreturn.html');
		}else if(alink == 'enforce_check') {
			showCustomerEnforceList();
		}
		else
			window.location = base + alink;
	} else {
		navigator.notification.alert(getLangTextdata("Incorrect Password."));
	}
}
function verifyEnforcePassword(eid, alink, html){
	var base = window.location.toString().substring(0,
			window.location.toString().lastIndexOf("/"))
			+ "/";
	textVal = $(".ui-simpledialog-container #txtPassword1").val();
	keyVal = $(".ui-simpledialog-container #passkey1").text();
	// alert(keyVal);
	var pass = colName(keyVal);
	// window.location = base + alink;
	if (pass == textVal) {
		if(alink == 'enforce_check') {
			insertlog(2, '', textVal);
			showCustomerEnforceList();
		}
		else{
			window.location = base + alink;
		}
	}
	else 
	{
		navigator.notification.alert(getLangTextdata("Incorrect Password."));
	}
	
	
	
}

function verifyCheckoutPassword(){
	
	
	textVal = $(".ui-simpledialog-container #txtPassword1").val();
	keyVal = $(".ui-simpledialog-container #passkey1").text();
	
		
	//keyVal=decodeFinancePwd(keyVal);
		
	

	var pass = colName(keyVal);
	console.log("pass "+pass);
	console.log("textVal "+textVal);
	
	if(pass == textVal)
	{
		//navigator.notification.alert(getLangTextdata("Correct Password."));
		$(".ui-simpledialog-container #txtPassword1").val("");                     
        $(document).undelegate("MenuList","click");
        $('#MenuList').simpledialog('close');  
     
        progressBars(0,60000);
        $.mobile.hidePageLoadingMsg();
		checkInvoiceImageCaptured('exit');
	}
	else
		{
		navigator.notification.alert(getLangTextdata("Incorrect Password."));
		}
	
	
	
}

function insertlog(typeid, redirecturl, textVal) {
	// var insertquery = "insert into
	// t_access_override_log(routekey,visitkey,routecode,salesmancode,customercode,type,featureid,accesskey,accesstime,voidflag,validflag,issync)
	// values(" + sessionStorage.getItem('RouteKey') + ",0," +
	// sessionStorage.getItem('RouteCode') + "," +
	// sessionStorage.getItem('SalesmanCode') + "," +
	// sessionStorage.getItem('customerid') +
	// ",2,"+typeid+",'"+textVal+"',datetime('now','localtime'),0,0,0)";
	if (typeid == '1') {
		var insertquery = "insert into t_access_override_log(routekey,visitkey,routecode,salesmancode,customercode,type,featureid,accesskey,accesstime,voidflag,validflag,issync,lat,long) values("
				+ sessionStorage.getItem('RouteKey')
				+ ",0,"
				+ sessionStorage.getItem('RouteCode')
				+ ","
				+ sessionStorage.getItem('SalesmanCode')
				+ ","
				+ sessionStorage.getItem('customerid')
				+ ",2,"
				+ typeid
				+ ",'"
				+ textVal
				+ "',datetime('now','localtime'),0,0,0,"
				+ sessionStorage.getItem('latitude')
				+ ","
				+ sessionStorage.getItem('longitude') + ")";
		// console.log(insertquery);

	} else {
		var insertquery = "insert into t_access_override_log(routekey,visitkey,routecode,salesmancode,customercode,type,featureid,accesskey,accesstime,voidflag,validflag,issync) values("
				+ sessionStorage.getItem('RouteKey')
				+ ",0,"
				+ sessionStorage.getItem('RouteCode')
				+ ","
				+ sessionStorage.getItem('SalesmanCode')
				+ ","
				+ sessionStorage.getItem('customerid')
				+ ",2,"
				+ typeid
				+ ",'"
				+ textVal + "',datetime('now','localtime'),0,0,0)";
		// console.log(insertquery);

	}
	console.log(insertquery);
	// alert(insertquery);
	var base = window.location.toString().substring(0,
			window.location.toString().lastIndexOf("/"))
			+ "/";
	if (platform == 'iPad') {

		Cordova.exec(function(result) {

			if (redirecturl != '')
				window.location = base + redirecturl;

		}, function(error) {
			navigator.notification.alert("Error in insert start end day : "
					+ error);
		}, "PluginClass", "InsertUpdateMethod", [ insertquery ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(insertquery, function(result) {
			if (redirecturl != '')
				window.location = base + redirecturl;

		}, function() {
			console.warn("Error calling plugin");
		});
	}
}
function VerifyPassword(eid, alink, html) {
	var textVal = null;
	var password = null;
	var password2 = null;
	textVal = $(".ui-simpledialog-container #txtPassword").val();
	var base = window.location.toString().substring(0,
			window.location.toString().lastIndexOf("/"))+ "/";
	if (link == "loadselection.html") {
		password = localStorage.LoadPassword;
		password2 = localStorage.LoadPassword2;
	} else if (link == "adjustload.html") {
		password = localStorage.AdjustLoadPassword;
		password2 = localStorage.AdjustLoadPassword;
	} else if (link == "unload_option.html") {
		password = localStorage.UnloadPassword;
		password2 = localStorage.LoadPassword2;
	} else if (link == "loadtransfer.html") {
		password = localStorage.TransferPassword;
		password2 = localStorage.LoadPassword2;
	}
	// Commented by Mirnah becasue still start day change password is pending
	/*
	 * else if (link == "startofday.html") {
	 * 
	 * password = localStorage.editpass; password2 = localStorage.LoadPassword2; }
	 */
	else if (link == "startofday.html") {
		password = localStorage.starofdaypass;
		password2 = localStorage.adminpass;
		sessionStorage.startdaykey = "";

		// localStorage.starofdaypass = "";
		// localStorage.adminpass = "";
	} else if (link == "requestselection.html") {
		password = localStorage.LoadRequestPassword;
		password2 = localStorage.LoadPassword2;
	} else if (link == "routeinventory.html") {
		password = localStorage.VanStockPassword;
		password2 = localStorage.LoadPassword2;
	} else if (link == "customer_promotion_list.html"
			|| link == "order_promotion_list.html") {
		password = localStorage.PromotionPassword;
		password2 = localStorage.LoadPassword2;
	} else if (link == "promotion_review.html"
			|| link == "../customer/signature.html"
			|| link == "orderdetail.html") {
		password = localStorage.PromotionPassword;
		password2 = localStorage.LoadPassword2;
	} else if (link == "../settlement/managesettlement.html") {
		password = localStorage.settlementpass;
		password2 = localStorage.adminpass;
	} else if (link == "miscallaneous.html" || link == "miscellaneous.html"
			|| link == "utilities.html") {

		password2 = localStorage.adminpass;
	} else {
		password = "";
		password2 = "";
	}

	if (textVal == password || textVal == password2) {
		// if (link == 'unload_option.html' && localStorage.enableodioinput ==
		// 1) {
		// PopupOdometer(eid, alink, html);
		// }
		// else if(link == 'unload_option.html' && localStorage.enableodioinput
		// != 1) {
		if (link == 'unload_option.html') {
			// updatetransactiondetail();
			// endstockqtyupdate();
			 PopupOdometer(eid, alink, html);
			//checkLoadRequest();
		} else if (link == 'startofday.html') {
			window.location = "../startofday/startofday.html";
		} else if (link == "loadtransfer.html") {
			deletebatchmaster('loadtransfer.html');
		} else if (link == "loadselection.html") {
			deletebatchmaster('loadselection.html');
		} else if (link == "customer_promotion_list.html"
				|| link == "order_promotion_list.html") {
			enforcepromotionoverride();
		} else if (link == "miscallaneous.html" || link == "miscellaneous.html") {
			cleardata();
		} else if (link == "utilities.html" || link == "utilities.html") {
			copy();
		} else if (link == "promotion_review.html") {
			window.location = 'signature.html';
		} else if (link == "../settlement/managesettlement.html"
				&& localStorage.enableodioinput == 1) {
			//PopupOdometer(eid, alink, html);
			 CheckUnloadDone();
		} else if (link == "../settlement/managesettlement.html"
				&& localStorage.enableodioinput != 1) {

			
			//CheckUnloadDone(); // org line sujee commented
			
			//------- Added for Enhance
			
			var rotype =sessionStorage.getItem("rtype");
			
			if(rotype == 2 || rotype == 4)
				{
				 PopupOdometer(eid, alink, html);
				 
				}
			else {
				
		         CheckUnloadDone();
			    }
			
			// ---------------- end-----------
			
		} else {

			window.location = base + link;

		}
	} else {
			getLangText("Enter Correct Password");
		// navigator.notification.alert("Enter Correct Password");
	}
}

function CheckZeroPassword() {
	var password = null;
	if (link == "loadselection.html")
		password = localStorage.LoadPassword;
	else if (link == "adjustload.html")
		password = localStorage.AdjustLoadPassword;
	else if (link == "unload_option.html")
		password = localStorage.UnloadPassword;
	else if (link == "loadtransfer.html")
		password = localStorage.TransferPassword;
	else if (link == "startofday.html") {
		password = localStorage.starofdaypass;
		sessionStorage.startdaykey = "";
	} else if (link == "requestselection.html")
		password = localStorage.LoadRequestPassword;
	else if (link == "routeinventory.html")
		password = localStorage.VanStockPassword;
	else if (link == "customer_promotion_list.html"
			|| link == "order_promotion_list.html")
		password = localStorage.PromotionPassword;
	else if (link == "promotion_review.html"
			|| link == "../customer/signature.html"
			|| link == "orderdetail.html")
		password = localStorage.PromotionPassword;
	else if (link == "../settlement/managesettlement.html")
		password = localStorage.settlementpass;
	else if (link == "../settlement/managesettlement.html")
		password = localStorage.settlementpass;
	else if (link == "pricechange")
		password = 1; // 0 Condition already checked from page so assigning by
						// default 1 to allow popup.
	else {
		password = "";
		password2 = "";
	}

	return password;

}

function ClearPassword() {
	 document.getElementById('txtPassword').value = '';
	$(".ui-simpledialog-container #txtPassword").val("")
	var base = window.location.toString().substring(0,
			window.location.toString().lastIndexOf("/"))
			+ "/";
	window.location = base + cancelLink;
	
}

function getCurrentDate() {
	var cDate = new Date();

	var month = new Array(12);
	month[0] = "January";
	month[1] = "February";
	month[2] = "March";
	month[3] = "April";
	month[4] = "May";
	month[5] = "June";
	month[6] = "July";
	month[7] = "August";
	month[8] = "September";
	month[9] = "October";
	month[10] = "November";
	month[11] = "December";

	var today = cDate.getDate() + '  ' + month[cDate.getMonth()] + '  '
			+ cDate.getFullYear();

	return today;
}
// Function used for check current date with datbase date
function getTabletDate() {
	var cDate = new Date();
	var tDate = cDate.getFullYear() + '-'
			+ ("0" + (cDate.getMonth() + 1)).slice(-2) + '-'
			+ ("0" + cDate.getDate()).slice(-2); // Change after merge js
													// file

	return tDate;
}

function getTodayDate() {
	var cDate = new Date();

	var tDate = ("0" + cDate.getDate()).slice(-2) + '-'
			+ ("0" + (cDate.getMonth() + 1)).slice(-2) + '-'
			+ cDate.getFullYear(); // Change after merge js file

	return tDate;
}
function getHHMMSStime(){
	
	var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    // add a zero in front of numbers<10
    m = checkTime(m);
    s = checkTime(s);
	var ttime=h + ":" + m + ":" + s;
	
	
	return ttime;
	
}
function getFullDate(){
	var cDate = new Date();
	var tDate = cDate.getFullYear() + '-'
			+ ("0" + (cDate.getMonth() + 1)).slice(-2) + '-'
			+ ("0" + cDate.getDate()).slice(-2);
	 var h = cDate.getHours();
     var m = cDate.getMinutes();
     var s = cDate.getSeconds();
     // add a zero in front of numbers<10
     m = checkTime(m);
     s = checkTime(s);
	 var ttime=h + ":" + m + ":" + s;
	return tDate+" "+ttime;
}
function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function getTodayMMMDate() {
	var cDate = new Date();
	var month = new Array(12);
	month[0] = "Jan";
	month[1] = "Feb";
	month[2] = "Mar";
	month[3] = "Apr";
	month[4] = "May";
	month[5] = "Jun";
	month[6] = "Jul";
	month[7] = "Aug";
	month[8] = "Sep";
	month[9] = "Oct";
	month[10] = "Nov";
	month[11] = "Dec";
	var tDate = ("0" + cDate.getDate()).slice(-2) + '-'
		+ ("0" + (cDate.getMonth() + 1)).slice(-2) + '-'
		+ cDate.getFullYear(); // Change after merge js file // Change after merge js file

	return tDate;
}
function longDisplayDate() {
	var cDate = new Date();

	var month = new Array(12);
	month[0] = "Jan";
	month[1] = "Feb";
	month[2] = "Mar";
	month[3] = "Apr";
	month[4] = "May";
	month[5] = "Jun";
	month[6] = "Jul";
	month[7] = "Aug";
	month[8] = "Sep";
	month[9] = "Oct";
	month[10] = "Nov";
	month[11] = "Dec";

	var weekday = new Array(7);
	weekday[0] = "Sunday";
	weekday[1] = "Monday";
	weekday[2] = "Tuesday";
	weekday[3] = "Wednesday";
	weekday[4] = "Thursday";
	weekday[5] = "Friday";
	weekday[6] = "Saturday";

	var today = weekday[cDate.getDay()] + '  ' + month[cDate.getMonth()] + '  '
			+ cDate.getFullYear();

	return today;
}

function longDate_Day() {
	var cDate = new Date();

	var month = new Array(12);
	month[0] = "Jan";
	month[1] = "Feb";
	month[2] = "Mar";
	month[3] = "Apr";
	month[4] = "May";
	month[5] = "Jun";
	month[6] = "Jul";
	month[7] = "Aug";
	month[8] = "Sep";
	month[9] = "Oct";
	month[10] = "Nov";
	month[11] = "Dec";

	var weekday = new Array(7);
	weekday[0] = "Sunday";
	weekday[1] = "Monday";
	weekday[2] = "Tuesday";
	weekday[3] = "Wednesday";
	weekday[4] = "Thursday";
	weekday[5] = "Friday";
	weekday[6] = "Saturday";

	var today = weekday[cDate.getDay()] + '  ' + cDate.getDate() + '-'
			+ month[cDate.getMonth()] + '-' + cDate.getFullYear();

	return today;
}
function SetSubTitle(value) {
	document.getElementById('tblSubTitle').innerHTML = value;
}

function CheckConnection() {
	var networkState = navigator.network.connection.type;

	var states = {};
	states[Connection.UNKNOWN] = 'Unknown connection';
	states[Connection.ETHERNET] = 'Ethernet connection';
	states[Connection.WIFI] = 'WiFi connection';
	states[Connection.CELL_2G] = 'Cell 2G connection';
	states[Connection.CELL_3G] = 'Cell 3G connection';
	states[Connection.CELL_4G] = 'Cell 4G connection';
	states[Connection.NONE] = 'None';

	if (states[networkState] == 'None'
			|| states[networkState] == 'Unknown connection')
		return false;
	else
		return true;

}

function ValidateNumericText(obj) {
	$(obj).blur(function() {
		if ($(obj).val() != "") {
			if (isNaN($(this.val()))) {
				alert("Numeric Inputs Only");
				$(obj).val('');
				return false;
			} else {
				return true;
			}
		} else
			return true;
	});
}

function ValidateGridCaseUnit(obj) {
	if ($(obj).val() != "") {
		if ($(obj).val() < 0) {
			alert("Positive Inputs Only");
			$(obj).parent().text(0);
			return false;
		} else {
			return true;
		}
	} else
		return true;
}

function SetNumberMaxLength(obj, len) {
	if ($(obj).val().length > 4) {
		$(obj).val($(obj).val().slice(0, 4));
	}
}
$.fn.ForceNumericOnly = function() {
	/*
	 * return this.each(function() { $(this).keydown(function(e) { var key =
	 * e.charCode || e.keyCode || 0; // allow backspace, tab, delete, arrows,
	 * numbers and keypad numbers ONLY return ( key == 8 || key == 9 || key ==
	 * 46 || key == 110 || (key >= 37 && key <= 40) || (key >= 48 && key <= 57) ||
	 * (key >= 96 && key <= 105)); }); });
	 */
	return true;
};

function getTodayTime() {
	var cDate = new Date();

	var hours = cDate.getHours() > 12 ? ("0" + cDate.getHours() - 12) : (cDate
			.getHours() < 10 ? "0" + cDate.getHours() : cDate.getHours());

	var minutes = cDate.getMinutes() < 10 ? "0" + cDate.getMinutes() : cDate
			.getMinutes();

	var curMeridiem = cDate.getHours() > 12 ? "PM" : "AM";

	return hours + ":" + minutes + " " + curMeridiem;
}

// Function is used for return date that passed as a input number of days to add
function getAddDate(noofdays) {
	var cDate = new Date();

	cDate.setDate(cDate.getDate() + noofdays);

	var tDate = ("0" + cDate.getDate()).slice(-2) + '-'
			+ ("0" + (cDate.getMonth() + 1)).slice(-2) + '-'
			+ cDate.getFullYear(); // Change after merge js file

	return tDate;
}

// Function is used return short date
function getShortDate() {
	var cDate = new Date();

	var weekday = new Array(7);
	weekday[0] = "Sunday";
	weekday[1] = "Monday";
	weekday[2] = "Tuesday";
	weekday[3] = "Wednesday";
	weekday[4] = "Thursday";
	weekday[5] = "Friday";
	weekday[6] = "Saturday";
	// Comment added by Mirnah
	// var tDate = ("0" + cDate.getDate()).slice(-2) + ',' +
	// weekday[cDate.getDay()]; //Change after merge js file
	var tDate = weekday[cDate.getDay()];
	return tDate;
}
// Function used for get data from table.
function getSendData(routekey, transactionkey, itemcode, tableName, flag) {
	// var platform = sessionStorage.getItem("platform");
	// var platform='iPad';
	var platform = sessionStorage.getItem("platform");
	var tablequery = '';
	var tabledata = {};
	
	sendroutekey = routekey;
	$.mobile.showPageLoadingMsg();

	// Required route key and transaction key as a parameter
	if (tableName == "invoicedetail") {
		tablequery = "select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,salesprice,returnprice,stdsalesprice,stdreturnprice,promoqty,salesitemexcisetax,salesitemgsttax,returnitemexcisetax,returnitemgsttax,damageditemexcisetax,damageditemgsttax,fgitemexcisetax,fgitemgsttax,promoitemexcisetax,promoitemgsttax,coopid,batchdetailkey,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,goodreturnprice,goodreturncaseprice,stdgoodreturncaseprice,stdgoodreturnprice,expiryqty,currencycode,returnfreeqty,manualfreeqty,limitedfreeqty,rebaterentqty,fixedrentqty,pricechgindicator,discountamount,discountpercentage,promoamount,replacementqty,replacementprice,replacementcaseprice,promovalue,mdat,returnpromovalue,returnpromoamount,diffround,roundsalesamount,amount from invoicedetail where issync=0 and istemp='false' and routekey in ("
				+ routekey + ") and transactionkey in (" + transactionkey + ")";
		// alert(tablequery);

	}
	
	// Required transaction key as a parameter
	else if (tableName == "invoiceheader") {
		tablequery = "select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,salesmancode,presoldordernumber,presalesmancode,presalesroutecode,orderdeliverydate,orderdeliveryroutecode,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,totalfreesampleamount,immediatepaid,amountpaid,invoicebalance,dexflag,dexg86signature,paymenttype,splittransaction,voidflag,transmitindicator,paymentstatus,hhcinvoicenumber,totalpromoamount,gcpaymenttype,hhcdocumentnumber,inventorykey,totaltaxesamount,itemlinetaxamount,totaldiscountamount,voidreasoncode,totalexpiryamount,currencycode,totalmanualfree,totallimitedfree,totalrebaterent,totalfixedrent,actualtransactiondate,boentry,hhctransactionkey,data,comments,totaldiscdistributionamount,totalreplacementamount,comments2,totalbuybackfreeamount,diffround,roundtotalsalesamount,headerdiscounttaxamt from invoiceheader where issync=0 and istemp='false' and transactionkey in ("
				+ transactionkey + ")";
		// alert(tablequery);

	}

	// Required route key and transaction key as a parameter
	else if (tableName == "invoicerxddetail") {
		tablequery = "select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,itemtranstypeseq,reasoncode,quantity,catchweightqty,weighted,instructioncode,currencycode,substr(expirydate, 7, 4) || '-' || substr(expirydate, 4, 2) || '-' || substr(expirydate, 1, 2) as expirydate,invoicenumber from invoicerxddetail where issync=0 and istemp='false' and routekey in ("
				+ routekey + ") and transactionkey in (" + transactionkey + ")";
	}

	// Required route key and transaction key as a parameter
	else if (tableName == "promotiondetail") {
		tablequery = "select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,promotiontypecode,promotionamount,promotionquantity,catchweightqty,weighted,promotionplannumber,assignmentkey,exclusionoption,promochgindicator,oldpromotionamount,performindicator,performcriteriakey,promotioncaseprice,currencycode,memo1 from promotiondetail where issync=0 and istemp='false' and routekey in ("
				+ routekey + ") and visitkey in (" + transactionkey + ")";
	}

	// Required transaction key as a parameter
	else if (tableName == "customerinvoice") {
		tablequery = "select transactionkey,transactiontype,documentnumber,invoicenumber,transactiondate,transactiontime,customercode,routecode,salesmancode,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,totalfreesampleamount,immediatepaid,amountpaid,dnamountpaid,cnamountpaid,invoicebalance,paymenttype,voidflag,paymentstatus,hhcinvoicenumber,remarks1,remarks2,routestartdate,erpreferencenumber,mdat,totalpromoamount,gcpaymenttype,totaltaxesamount,itemlinetaxamount,totaldiscountamount,pdcindicator,chequecollection,totalexpiryamount,currencycode,pdcbalance,totalmanualfree,totallimitedfree,totalrebaterent,totalfixedrent,data,totaldiscdistributionamount,totalreplacementamount,pdcdate,totalbuybackfreeamount,duedate from customerinvoice where issync=0 and transactionkey in ("
				+ transactionkey + ")";
	}

	// Required route key and transaction key as a parameter
	else if (tableName == "salesorderdetail") {
		tablequery = "select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,manualfreeqty,salesprice,returnprice,stdsalesprice,stdreturnprice,coopid,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,currencycode,allocated,freegoodcases,freegoodpcs,salespcs,allocatedcases,salescases,allocatedpcs,returncases,returnpcs,promoamount,salesordervat,salesorderexcisetax,returnvat,returnexcisetax,damagedvat,damagedexcisetax,promovat,promoexcisetax,fgvat,fgexcisetax from salesorderdetail where issync=0 and istemp='false' and routekey in ("
				+ routekey + ") and transactionkey in (" + transactionkey + ")";
	}

	// Required route key and transaction key as a parameter
	else if (tableName == "salesorderheader") {
		tablequery = "select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,CAST(salesmancode AS VARCHAR) salesmancode,orderdeliveryroutecode,orderdeliverydate,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,dexflag,splittransaction,voidflag,transmitindicator,hhcinvoicenumber,paymenttype,hhcdocumentnumber,voidreasoncode,advanceused,paymentstatus,advancebalance,mdat,advancereceived,currencycode,status,refnumber,totalfreesampleamount,deliverystatus,data,comments,actualtransactiondate,comments2,hhctransactionkey,totalpromoamount,totalbuybackfreeamount,totallineitemtax from salesorderheader where issync=0 and istemp='false' and dexflag=0 and confirmorder = 1  and routekey in ("
				+ routekey + ") and transactionkey in (" + transactionkey + ")";
	}
	else if (tableName == "orderrxddetail") {
		tablequery = "select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,itemtranstypeseq,reasoncode,quantity,catchweightqty,weighted,instructioncode,substr(expirydate, 7, 4) || '-' || substr(expirydate, 4, 2) || '-' || substr(expirydate, 1, 2) as expirydate from orderrxddetail where issync=0 and istemp='false' and routekey in ("
				+ routekey + ") and transactionkey in (" + transactionkey + ")";
	}

	// Required batchdetailkey = transactionkey key as a parameter
	else if (tableName == "batchexpirydetail") {
		tablequery = "select routekey,batchdetailkey,batchnumber,itemcode,expirydate,quantity,transactiontypecode,visitkey from batchexpirydetail where issync=0 and istemp='false' and routekey in ("
				+ routekey + ") and visitkey in (" + transactionkey + ")";
	}

	// Required transaction key as a parameter
	else if (tableName == "arheader") {
		tablequery = "select transactionkey,routekey,visitkey,documentnumber,transactiondate,transactiontime,customercode,routecode,salesmancode,voidflag,splittransaction,transmitindicator,totalinvoiceamount,amountpaid,invoicebalance,invoicenumber,hhcdocumentnumber,hhcinvoicenumber,voidreasoncode,chequecollection,currencycode,hhctransactionkey,data,comments,advancepaymentflag,excesspayment,comments2,deductionflag from arheader where issync=0 and transactionkey in ("
				+ transactionkey + ")";
	}

	// Required route key and transaction key as a parameter
	else if (tableName == "ardetail") {
		tablequery = "select routekey,visitkey,transactionkey,invoicenumber,invoicedate,totalinvoiceamount,onacctreasoncode,amountpaid,invoicebalance,arcollectiontype,chequestatusindicator,sapchequestatusindicator,currencycode,pdcbalance,alternateinvoicenumber,deductionamount from ardetail where issync=0 and routekey in ("
				+ routekey + ") and transactionkey in (" + transactionkey + ")";
	}

	// Required route key and transaction key as a parameter
	else if (tableName == "cashcheckdetail") {
		tablequery = "select routekey,visitkey,typecode,checknumber,amount,updateindicator,checkdate,bankcode,checkstatus,branchcode,drawercode,chequestatusindicator,sapchequestatusindicator,currencycode,hhctransactionkey,transactiontype from cashcheckdetail where issync=0 and istemp='false' and routekey in ("
				+ routekey + ") and visitkey in (" + transactionkey + ")";
	}

	// Required detailkey = transaction key as a parameter
	else if (tableName == "inventorytransactionheader") {
		tablequery = "select inventorykey,detailkey,routekey,transactiontype,routecode,CAST(salesmancode AS VARCHAR) salesmancode,transactiondate,transactiontime,documentnumber,odometerreading,transferlocationcode,referencenumber,requestdate,securitycode,transmitindicator,voidflag,CAST(hhcdocumentnumber AS VARCHAR) hhcdocumentnumber,loadnumber,refdocumentnumber,currencycode,actualtransactiondate,inventorynumber,data,isurgent from inventorytransactionheader where issync=0 and istemp='false' and detailkey in ("
				+ transactionkey + ")";
	}

	// Required detailkey = transaction key as a parameter
	else if (tableName == "inventorytransactiondetail") {
		tablequery = "select routekey,detailkey,transactiontypecode,itemcode,quantity,weighted,itemprice,batchdetailkey,itemcaseprice,currencycode,reasoncode,substr(expirydate, 7, 4) || '-' || substr(expirydate, 4, 2) || '-' || substr(expirydate, 1, 2)as expirydate from inventorytransactiondetail where issync=0 and istemp='false' and routekey in ("
				+ routekey + ") and detailkey in (" + transactionkey + ")";
	}

	// Required inventorykey = transaction key and item code as a parameter
	else if (tableName == "inventorysummarydetail") {
		tablequery = "select inventorykey,itemcode,routekey,weighted,beginstockqty,loadqty,loadadjustqty,loadaddqty,loadcutqty,loadreqqty,saleqty,returnqty,damagedaddqty,damagedcutqty,endstockqty,unloadqty,damagedunloadqty,freesampleqty,truckdamagedunloadqty,stdsalesprice,stdreturnprice,cashsalesqty,cashsalesvalue,tcsalesqty,tcsalesvalue,gcsalesqty,gcsalesvalue,cashdamagedqty,cashdamagedvalue,tcdamagedqty,tcdamagedvalue,gcdamagedqty,gcdamagedvalue,cashreturnqty,cashreturnvalue,tcreturnqty,tcreturnvalue,gcreturnqty,gcreturnvalue,promoqty,cashsalesitemexcisetax,cashsalesitemgsttax,cashreturnitemexcisetax,cashreturnitemgsttax,cashdamageditemexcisetax,cashdamageditemgsttax,cashfgitemexcisetax,cashfgitemgsttax,cashpromoitemexcisetax,cashpromoitemgsttax,tcsalesitemexcisetax,tcsalesitemgsttax,tcreturnitemexcisetax,tcreturnitemgsttax,tcdamageditemexcisetax,tcdamageditemgsttax,tcfgitemexcisetax,tcfgitemgsttax,tcpromoitemexcisetax,tcpromoitemgsttax,gcsalesitemexcisetax,gcsalesitemgsttax,gcreturnitemexcisetax,gcreturnitemgsttax,gcdamageditemexcisetax,gcdamageditemgsttax,gcfgitemexcisetax,gcfgitemgsttax,gcpromoitemexcisetax,gcpromoitemgsttax,batchdetailkey,stdsalescaseprice,stdreturncaseprice,expiryqty,stdgoodreturncaseprice,stdgoodreturnprice,currencycode,returnfreeqty,damageqty,expdmgfreeqty,expunloadqty,dmgunloadqty,expdmgfreeunloadqty,rentqty,mdat,freshunloadqty,emptycontainerqty,emptycontainerunloadqty from inventorysummarydetail where issync=0 and istemp='false' and routekey in ("
				+ routekey + ")";
	}

	// Required customercode = transaction key as a parameter
	else if (tableName == "nonservicedcustomer") {
		tablequery = "select routekey,customercode,reasoncode from nonservicedcustomer where issync=0 and routekey in ("
				+ routekey + ") and customercode in (" + transactionkey + ")";
	}
	// Required visitkey = transaction key as a parameter
	else if (tableName == "sigcapturedata") {
		tablequery = "select routekey,visitkey,transactionkey,customercode,documentnumber,transactiondate,transactiontime,balancedueamount,signaturedata,transaction_type from sigcapturedata where issync=0 and routekey in ("
				+ routekey + ") and visitkey in (" + transactionkey + ")";
	} else if (tableName == "customerinventorydetail") {
		tablequery = "select routekey,visitkey,itemcode,weighted,qtyloc1case,catchweightqtyloc1,qtyloc1each,qtyloc2case,catchweightqtyloc2,qtyloc2each,qtyloc3case,catchweightqtyloc3,qtyloc3each,shelfstockcase,shelfstockcatchweightqty,shelfstockeach,oldestcode,expirydate from customerinventorydetail where issync=0 and istemp='false' and routekey in ("
				+ routekey + ") and visitkey in (" + transactionkey + ")";
	}
	else if(tableName == "customerinventorycheck")
    	{
		// org line sujee commented for expirydate 13/03/2019
		//tablequery = "select routekey,visitkey,CAST(itemcode AS VARCHAR) itemcode,weighted,qtyloc1case,catchweightqtyloc1,qtyloc1each,qtyloc2case,catchweightqtyloc2,qtyloc2each,qtyloc3case,catchweightqtyloc3,qtyloc3each,shelfstockcase,shelfstockcatchweightqty,shelfstockeach,oldestcode,substr(expiry_date, 7, 4) || '-' || substr(expiry_date, 4, 2) || '-' || substr(expiry_date, 1, 2)as expiry_date from customerinventorycheck where issync=0 and istemp='false' and routekey in (" + routekey + ") and visitkey in (" + transactionkey + ")";
		
		tablequery = "select routekey,visitkey,CAST(itemcode AS VARCHAR) itemcode,weighted,qtyloc1case,catchweightqtyloc1,qtyloc1each,qtyloc2case,catchweightqtyloc2,qtyloc2each,qtyloc3case,catchweightqtyloc3,qtyloc3each,shelfstockcase,shelfstockcatchweightqty,shelfstockeach,oldestcode,expiry_date as expiry_date from customerinventorycheck where issync=0 and istemp='false' and routekey in (" + routekey + ") and visitkey in (" + transactionkey + ")";
    	}
    	else if(tableName == "visualsfeedback")
    	{
		tablequery = "select routekey,visitkey,customercode,visualdetail_id,visualcode,remarks from visualsfeedback where issync=0 and routekey in (" + routekey + ") and visitkey in (" + transactionkey + ")";
    	}
    	else if(tableName == "promotions_remark")
    	{
		tablequery = "select routekey,customercode,promotionkey,remarks from promotions_remark where issync=0 and routekey in (" + routekey + ")";
    	}
    	else if(tableName == "customerdistributioncheck")
    	{
		tablequery = "select routekey,visitkey,customercode,itemcode,qty,distributionkey from customerdistributioncheck where issync=0 and routekey in (" + routekey + ") and visitkey in (" + transactionkey + ")";
    	}
	// Required visitkey = transaction key as a parameter
	else if (tableName == "surveyauditdetail") {
		tablequery = "select routekey,visitkey,surveydefkey,surveypage,surveyindex,surveyrectype,lookuptype,surveyresponse from surveyauditdetail where issync=0 and routekey in ("
				+ routekey + ") and visitkey in (" + transactionkey + ")";
	}

	// Required visitkey = transaction key as a parameter
	else if (tableName == "posequipmentchangedetail") {
		tablequery = "select routekey,visitkey,posaction,itemcode,quantity,serialnumber,instructioncode from posequipmentchangedetail where issync=0 and routekey in ("
				+ routekey + ") and visitkey in (" + transactionkey + ")";
	}

	// Required itemcode = transaction key as a parameter
	else if (tableName == "posmaster") {
		tablequery = "select itemcode,alternatecode,itemdescription,arbitemdescription,itemvalue,inventorytype,created,cdat,modified,mdat,activestatus from posmaster where issync=0 and itemcode in ("
				+ transactionkey + ")";
	}

	else if (tableName == "customeroperationscontrol") {
		tablequery = "select visitkey,routekey,customercode,routecode,salesmancode,odometerreading,visitstartdate,visitstarttime,visitenddate,visitendtime,totaltransactions,addedcustomer,voidflag,scannerindicator,reasoncode,CAST(latitude AS VARCHAR) as latitude,CAST(longitude AS VARCHAR) as longitude,radius,log_id from customeroperationscontrol where issync=0 and routekey in ("
				+ routekey + ") and visitkey in (" + transactionkey + ")";
	} else if (tableName == "routesequencecustomerstatus") {
		tablequery = "select routekey,seqweeknumber,seqweekday,routecode,customercode,sequencenumber,schelduledflag,servicedflag,scannedflag from routesequencecustomerstatus where issync=0 and routekey in ("
				+ routekey + ")";
	} else if (tableName == "routemaster") {
		tablequery = "select routecode,routename,arbroutename,subareacode,salesmancode,created,cdat,modified,mdat,memo1,memo2,hhcordseq,hhcinvseq,hhccshseq,hhcivtseq,bodocseq,boinvseq,vehiclenumber,vehicleodometer,enablescanneruse,password1,password2,password3,password4,password5,passwordarray01,passwordarray02,passwordarray03,passwordarray04,passwordarray05,passwordarray06,passwordarray07,passwordarray08,passwordarray09,passwordarray10,passwordarray11,passwordarray12,passwordarray13,passwordarray14,passwordarray15,passwordarray16,enabledelayprint,promptodominput,enableeodexpenses,enableeodadjchecks,enableeodaddchecks,reqeoddepositreport,reqeodsalesreport,reqeodrteactivreport,reqeodrtestlmtreport,reqeodroutereviewrpt,reqeodrtnexchreport,reqeodplacementsrpt,reqeodprcchgreport,reqeodpromosreport,reqeodnosalereport,reqeodnondelreport,reqeodexceptionrpt,reqeodunauthbalance,reqeodroasummary,inventorycaseinput,loadreqreportformat,includeloadrequest,loadoutadjustments,autocalculateloadin,requireloadin,loadsheetreport,inventoryvariance,invenoversell,enablenosale,enablepostvoid,cashbalance,amountdecimaldigits,unloadoversellmessage,displayinvsummary,alternateroutecode,enabledamagedtrxn,defaultdeliverydays,reqeodnonscannedreport,reqeododomlogreport,inventoryvalueprint,loadaccessafterunload,creditlimit,routebalance,depotrouteflag,routeinventoryvariance,allowpopulateload,allowroutestartdayflag,enableaddcustomer,allowgctocash,usesalesdateflag,enablestartdaydatetimeedit,newcustomerseqnumber,enableloadtransfer,loadreqmethod,loadreqrolluporders,routeprinter,depotprinter,routetype,enablescancustomer,enforcecallsequence,enablefoclimit,enablemiddaytelecom,printdocumentnumber,activestatus,enablecashonlydiscount,eodreportcontrol,pdcthreshold,itemcodedisplay,routeitemgrpcode,itemdescriptiondisplay,lastcustomersequence,loadsecurityflag,routecatcode,usealternatecodes,enabledraftcopy,boarseq,boordseq,hhcarseq,hhcloadseq,boloadseq,deliveryroute,presalesorder,hhcappversion,usesequenceflag,customerseq,routeseqno,allowbalcheck,allowedradius,cmpycode,regionmstcode,expirylimit,runningvalue,maximumgpsallowed,transactionnoseq,routetmpl,templatename,enablestockicon,generatehhcseqfromboflag,tlockstatus,enablefreereason,inventoryreportcontrol,enablestartdayrtewkdayedit from routemaster where routecode="
				+ sessionStorage.getItem("RouteCode");
	} else if (tableName == "routegoal") {
		tablequery = "select primary_key,routecode,salesmancode,packagenumber,todaysgoal,todaysachieve,quotadesckey1,quotagoal1,quotaachieve1,quotareset1,quotadesckey2,quotagoal2,quotaachieve2,quotareset2,quotadesckey3,quotagoal3,quotaachieve3,quotareset3,created,cdat,modified,mdat,mmonth from routegoal where issync=0";
	} else if (tableName == "nosalesheader") {
		tablequery = "select transactionkey,routekey,visitkey,documentnumber,invoicenumber,routecode,salesmancode,transactiondate,transactiontime,nosalereasoncode,voidflag,transmitindicator,customercode,hhcdocumentnumber,hhcinvoicenumber,data from nosalesheader where issync=0 and routekey in ("
				+ routekey + ") and customercode in (" + transactionkey + ")";

	} else if (tableName == "customermaster") {
		tablequery = "select customercode,type,headofficecode,routecode,streetcode,districtcode,locationcode,customersequence,customername,customeraddress1,customeraddress2,customerphone,balance,customercategory,pricingkey,promotionkey,authorizeditemgrpkey,messagekey1,messagekey2,invoicepaymentterms,invoiceretailoption,invoicepriceoverride,invoiceretailoverride,invoiceformatoption,invoiceextensionopt,invoicedsdpromptopt,invoicecopies,salesinputoprion,returnsinputoption,invoiceinputstyle,onhandspromptopt,inventoryselectopt,invencontaineropt,queuedreportoption,surveykey,contactname,customertype,callfrequency,routenumber,arbcustomernameshort,arbcustomername,arbcustomeraddress1,arbcustomeraddress2,hhccustomernameshort,hhccustomername,hhccustomeraddress1,hhccustomeraddress2,allowbeyondlimit,tclimit,activecustomer,creditlimitdays,created,cdat,modified,mdat,forcehand,renteddisplay,installedchiller,monthlydepreciation,typeofgiveaway,giveawayflag,lastvisiteddate,memo1,memo2,tcsubtype,rentperc,customeraddress3,customercity,customerstate,customerzip,authorizeditemlistctl,invoicepriceprint,messagekey3,messagekey4,messagekey5,messagekey6,orderformat,enableupcprint,enabledelayprint,printsequence,enablepriceeditinvs,enablesellprevious,enablesuggestsales,enableautofillreturns,enableautofilldamaged,enablesigcapture,enablereturnstrxn,enableexchangetrxn,enabledamagedreturns,enablearcollection,enablesurveyaudit,enabledelivinstruct,enableinvoicecomment,invoicedetailentry,orderdetailentry,forcestockcapture,enablepromotrxn,alternatecode,creditlimit,allowcashoncreditexceed,arbcustomeraddress3,templateindicator,templatename,arbcontactname,printlanguageflag,quantumno,lostplacementdelivs,newplacementdelivs,currencycode,histmaxdeliveries,arcustomertype,custtaxkey1,custtaxkey2,custtaxkey3,customertaxid,customertaxidoptions,outletsubtype,volume,enablegovtaxnote,forwardcoverfactor,enablepromoeditinvs,enableaddlpromoinvs,badcreditcustomer,enableduplicateprinting,numoutstandinginv,enablefocprinting,promooptions,groupcode,forceposcheck,ancustomercode,printoutletitemcode,reportprintcontrol,invoicelimiter,exclusiveopmode,returnpromotionkey,invoiceformat,liquorlicprint,enablepromoeditords,enableaddlpromoords,enableaddlpromoinvoices,enableposequipment,enablesalestrxn,enableadvancepayment,printcheckdetails,tcspecialdiscount,spldiscountdays,arabiccustomercity,threshholdlimit,discountkey,enforcepromotion,gpcustcode,cashonlypromo,roundnetamount,partialcollection,transactiontype,enabledraftcopy,enablebuybackfree,enablecpd,enablepaymentsel,gpsdata,fixedlatitude,fixedlongitude,rentkey,startdate,enddate,definitionvalue,runningvalue,rentcontrol,disablebalanceupdate,enablecreditlimit,autosettlecollection,enableinvoicecopy,pobox,shoptelephonenumber,shopfaxnumber,ownername,ownerlandlinenumber,ownermobilenumber,contactpersonlandlinenumber,contactpersonmobilenumber,contactpersonemail,purchasemanagername,purchasemanagerlandlinenumber,purchasemanagermobilenumber,purchasemanageremail,warehousemanagername,warehousemanagerlandlinenumber,warehousemanagermobilenumber,warehousemanageremail,expirylimit,exprunningvalue,distributionkey,gpssavecount,graceperiod,reportcustcode,enablerental from customermaster where issync=0";
	} else if (tableName == "customer_foc_balance") {
		tablequery = "select customercode,itemcode,originalqty,balanceqty,contractid,startdate from customer_foc_balance where issync=0";
	} else if (tableName = "customervisitlog"){
		tablequery = "SELECT log_id, routekey, routecode, salesmancode, customercode, log_startdate, log_starttime, log_enddate, log_endtime FROM customervisitlog WHERE log_enddate != '' and issync = 0"
	}
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result != '') {
				for (i = 0; i < result.length; i++) {
					tabledata[i] = result[i];
				}

			}

			tabledata = JSON.stringify(tabledata);

			if (tableName == "invoicedetail") {
				invoicedetail = tabledata;
			}

			else if (tableName == "invoiceheader") {
				invoiceheader = tabledata;

			} else if (tableName == "invoicerxddetail") {
				invoicerxddetail = tabledata;
			}

			else if (tableName == "promotiondetail") {
				promotiondetail = tabledata;
			}

			else if (tableName == "customerinvoice") {
				customerinvoice = tabledata;
			} else if (tableName == "salesorderdetail") {
				salesorderdetail = tabledata;
			} else if (tableName == "salesorderheader") {
				salesorderheader = tabledata;
			}
			else if (tableName == "orderrxddetail") {
				orderrxddetail = tabledata;
			}
			else if (tableName == "batchexpirydetail") {
				batchdetail = tabledata;
			}

			else if (tableName == "arheader") {
				arheader = tabledata;
			}

			else if (tableName == "ardetail") {
				ardetail = tabledata;
			}

			else if (tableName == "cashcheckdetail") {
				cashcheckdetail = tabledata;
			}

			else if (tableName == "inventorytransactionheader") {
				inventorytransactionheader = tabledata;
			}

			else if (tableName == "inventorytransactiondetail") {
				inventorytransactiondetail = tabledata;
			}

			else if (tableName == "inventorysummarydetail") {
				inventorysummarydetail = tabledata;
			}

			else if (tableName == "nonservicedcustomer") {
				nonservicedcustomer = tabledata;
			}

			else if (tableName == "surveyauditdetail") {
				surveyauditdetail = tabledata;
			}

			else if (tableName == "posequipmentchangedetail") {
				posequipmentchangedetail = tabledata;
			}

			else if (tableName == "posmaster") {
				posmaster = tabledata;
			} else if (tableName == "sigcapturedata") {
				sigcapturedata = tabledata;
			} 
			else if(tableName == "customerinventorycheck")
			{
				customerinventorycheck=tabledata;
			}
			else if(tableName == "visualsfeedback")
			{
				visualsfeedback=tabledata;
			}
			else if(tableName == "promotions_remark")
			{
				promotions_remark=tabledata;
			}
			else if(tableName == "customerdistributioncheck")
			{
				customerdistributioncheck=tabledata;
			}
			else if (tableName == "customerinventorydetail") {
				customerinventorydetail = tabledata;
			} else if (tableName == "customeroperationscontrol") {
				customeroperationscontrol = tabledata;
			} else if (tableName == "routesequencecustomerstatus") {
				routesequencecustomerstatus = tabledata;
			} else if (tableName == "routemaster") {
				routemaster = tabledata;
			} else if (tableName == "routegoal") {
				routegoal = tabledata;
			} else if (tableName == "nosalesheader") {
				nosalesheader = tabledata;
			} else if (tableName == "customermaster") {
				customermaster = tabledata;
			} else if (tableName == "customer_foc_balance") {
				customer_foc_balance = tabledata;
			}
			// Upload data to server
			// uploadJsonData(tableName,tabledata);
			if (flag == true) {
				uploadServerData();
			}
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetfielddataMethod", [ tablequery ]);
	} else if (platform == 'Android') {
		
		console.log("tablequery "+tablequery);
		window.plugins.DataBaseHelper.select(tablequery, function(result) {
			if (!$.isEmptyObject(result)) {
				for (i = 0; i < result.array.length; i++) {
					tabledata[i] = result.array[i];
				}
			}
			// alert(tabledata);
			tabledata = JSON.stringify(tabledata);

			if (tableName == "invoicedetail") {
				invoicedetail = tabledata;
			}

			else if (tableName == "invoiceheader") {
				invoiceheader = tabledata;
			} else if (tableName == "invoicerxddetail") {
				invoicerxddetail = tabledata;
			}

			else if (tableName == "promotiondetail") {
				promotiondetail = tabledata;
			}

			else if (tableName == "customerinvoice") {
				customerinvoice = tabledata;
			} else if (tableName == "salesorderdetail") {
				salesorderdetail = tabledata;
			} else if (tableName == "salesorderheader") {
				salesorderheader = tabledata;
			} else if (tableName == "orderrxddetail") {
				orderrxddetail = tabledata;
			}

			else if (tableName == "batchexpirydetail") {
				batchdetail = tabledata;
			}

			else if (tableName == "arheader") {
				arheader = tabledata;
			}

			else if (tableName == "ardetail") {
				ardetail = tabledata;
			}

			else if (tableName == "cashcheckdetail") {
				cashcheckdetail = tabledata;
			}

			else if (tableName == "inventorytransactionheader") {
				inventorytransactionheader = tabledata;
			}

			else if (tableName == "inventorytransactiondetail") {
				inventorytransactiondetail = tabledata;
			}

			else if (tableName == "inventorysummarydetail") {
				inventorysummarydetail = tabledata;
			}

			else if (tableName == "nonservicedcustomer") {
				nonservicedcustomer = tabledata;
			}

			else if (tableName == "surveyauditdetail") {
				surveyauditdetail = tabledata;
			}

			else if (tableName == "posequipmentchangedetail") {
				posequipmentchangedetail = tabledata;
			}

			else if (tableName == "posmaster") {
				posmaster = tabledata;
			} else if (tableName == "sigcapturedata") {
				sigcapturedata = tabledata;
			} else if (tableName == "customerinventorydetail") {
				customerinventorydetail = tabledata;
			} else if(tableName == "customerinventorycheck")
		    	{
				customerinventorycheck=tabledata;
		    	}
		    	else if(tableName == "visualsfeedback")
		    	{
				visualsfeedback=tabledata;
		   	 }
		    	else if(tableName == "promotions_remark")
		    	{
				promotions_remark=tabledata;
		    	}
		    	else if(tableName == "customerdistributioncheck")
		    	{
				customerdistributioncheck=tabledata;
		    	} 
			else if (tableName == "customeroperationscontrol") {
				customeroperationscontrol = tabledata;
			} else if (tableName == "routesequencecustomerstatus") {
				routesequencecustomerstatus = tabledata;
			} else if (tableName == "routemaster") {
				routemaster = tabledata;
			} else if (tableName == "routegoal") {
				routegoal = tabledata;
			} else if (tableName == "nosalesheader") {
				nosalesheader = tabledata;
			} else if (tableName == "customermaster") {
				customermaster = tabledata;
			} else if (tableName == "customer_foc_balance") {
				customer_foc_balance = tabledata;
			} else if (tableName == "customervisitlog") {
				customervisitlog = tabledata;
			}
			// Upload data to server
			// uploadJsonData(tableName,tabledata);

			if (flag == true) {
				uploadServerData();
			} else if (flag == false && tableName == "invoicedetail"){
				uploadInvoicedetail();
			} else if (flag == false && tableName == "ardetail"){
				uploadArdetail();
			}

		}, function() {
			console.warn("Error calling plugin");
		});

	}
}

// Function used for upload json data to server
function uploadJsonData(tableName, tabledata) {
	// alert("Called Upload Data");
	// //url: wsurl + "sync/senddata",
	var datapost = tableName + "=" + tabledata;
	// alert(datapost);
	$.ajax({
		type : "post",
		url : wsurl + "sync/senddata",
		data : datapost,
		cache : false,
		timeout : 10000,
		success : function(data) {
			// alert("upload :" + data);
			data = JSON.parse(data);

			var tabledata = data.invoicedetail;

			for (i = 0; i < tabledata.length; i++) {
				updateSyncData(tableName, tabledata, i);
			}
			// alert("settt");
			// if(cl=='clr')
			// {
			// alert("sssscommn2s");
			// }
			navigator.notification.alert(getLangTextdata("Data Sent Successfully."));

		},
		error : function(qXHR, textStatus, errorThrown) {
			alert("failure: " + qXHR.status + ":" + textStatus + errorThrown);
		}
	});
}

// Function used for upload json data to server
function uploadServerData() {

	var dataarray = [ "invoicedetail", "invoiceheader", "invoicerxddetail", "promotiondetail", "customerinvoice", "salesorderdetail", "salesorderheader", "batchexpirydetail", "arheader", "ardetail", "cashcheckdetail", "inventorytransactionheader", "inventorytransactiondetail", "inventorysummarydetail", "nonservicedcustomer", "surveyauditdetail", "posequipmentchangedetail", "posmaster", "sigcapturedata", "customerinventorydetail","customerinventorycheck","visualsfeedback","promotions_remark","customeroperationscontrol", "routesequencecustomerstatus", "routemaster", "routegoal","customerdistributioncheck"];
	
	var uploaddata = {routesequencecustomerstatus:routesequencecustomerstatus,routekey:sendroutekey,customervisitlog:customervisitlog,
			cashcheckdetail:cashcheckdetail,invoicedetail:invoicedetail,ardetail:ardetail,customeroperationscontrol:customeroperationscontrol};
	console.log("dataarray "+JSON.stringify(uploaddata));
	JSON.stringify(nonservicedcustomer)
	// url: wsurl + "sync/senddata",
	$.ajax({
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
			orderrxddetail:orderrxddetail,
			batchexpirydetail : batchdetail,
			arheader : arheader,
			ardetail : ardetail,
			cashcheckdetail : cashcheckdetail,
			inventorytransactionheader : inventorytransactionheader,
			inventorytransactiondetail : inventorytransactiondetail,
			inventorysummarydetail : inventorysummarydetail,
			nonservicedcustomer : nonservicedcustomer,
			surveyauditdetail : surveyauditdetail,
			posequipmentchangedetail : posequipmentchangedetail,
			posmaster : posmaster,
			sigcapturedata : sigcapturedata,
			customerinventorydetail : customerinventorydetail,
			customeroperationscontrol : customeroperationscontrol,
			routesequencecustomerstatus : routesequencecustomerstatus,
			routemaster : routemaster,
			routegoal : routegoal,
			customermaster : customermaster,
			nosalesheader : nosalesheader,
			customer_foc_balance : customer_foc_balance,
			customerinventorycheck:customerinventorycheck,
			visualsfeedback:visualsfeedback,
			promotions_remark:promotions_remark,
			customerdistributioncheck:customerdistributioncheck,
			routekey:sendroutekey,
			customervisitlog:customervisitlog,
		},
		success : function(data) {

			console.log("DATA1 : " + data);
			data = JSON.parse(data);
			console.log("DATA : " + data);
			console.log("DATA : " + JSON.stringify(data));
			for ( var key in data) {

				// alert(key);
				var tabledata;

				if (key == "invoicedetail") {
					tabledata = data.invoicedetail;
				} else if (key == "invoiceheader") {
					tabledata = data.invoiceheader;
				} else if (key == "invoicerxddetail") {
					tabledata = data.invoicerxddetail;
				} else if (key == "promotiondetail") {
					tabledata = data.promotiondetail;
				} else if (key == "customerinvoice") {
					tabledata = data.customerinvoice;
				} else if (key == "salesorderheader") {
					tabledata = data.salesorderheader;

				} else if (key == "salesorderdetail") {
					tabledata = data.salesorderdetail;

					// alert("sales detail");
				} else if (key == "orderrxddetail") {
					tabledata = data.orderrxddetail;
				} else if (key == "batchexpirydetail") {
					tabledata = data.batchexpirydetail;
				}

				else if (key == "arheader") {
					tabledata = data.arheader;
				} else if (key == "ardetail") {
					tabledata = data.ardetail;

				} else if (key == "cashcheckdetail") {
					tabledata = data.cashcheckdetail;
				} else if (key == "inventorytransactionheader") {
					tabledata = data.inventorytransactionheader;
				} else if (key == "inventorytransactiondetail") {
					tabledata = data.inventorytransactiondetail;
				} else if (key == "inventorysummarydetail") {
					tabledata = data.inventorysummarydetail;
				} else if (key == "nonservicedcustomer") {
					tabledata = data.nonservicedcustomer;
				} else if (key == "surveyauditdetail") {
					tabledata = data.surveyauditdetail;
				} else if (key == "posequipmentchangedetail") {
					tabledata = data.posequipmentchangedetail;
				} else if (key == "posmaster") {
					tabledata = data.posmaster;
				} else if (key == "sigcapturedata") {
					tabledata = data.sigcapturedata;
				} else if (key == "customerinventorydetail") {
					tabledata = data.customerinventorydetail;
				}
				else if(key == "customerinventorycheck")
				{
				    tabledata = data.customerinventorycheck;
				}
				else if(key == "visualsfeedback")
				{
				    tabledata = data.visualsfeedback;
				}
				else if(key == "promotions_remark")
				{
				    tabledata = data.promotions_remark;
				}
				else if(key == "customerdistributioncheck")
				{
				    tabledata = data.customerdistributioncheck;
				    
				} else if (key == "customeroperationscontrol") {
					tabledata = data.customeroperationscontrol;
				} else if (key == "routesequencecustomerstatus") {
					tabledata = data.routesequencecustomerstatus;
				} else if (key == "routemaster") {
					tabledata = data.routemaster;
				} else if (key == "nosalesheader") {
					tabledata = data.nosalesheader;
				} else if (key == "routegoal") {
					tabledata = data.routegoal;
				} else if (key == "customermaster") {
					tabledata = data.customermaster;
				} else if (key == "customer_foc_balance") {
					tabledata = data.customer_foc_balance;
				} else if (key == "customervisitlog") {
					tabledata = data.customervisitlog;
				}
				for (i = 0; i < tabledata.length; i++) {
					updateSyncData(key, tabledata, i);
				}

			}

			/*
			 * for (j = 0; j < dataarray.length; j++) {
			 * 
			 * var tabledata;
			 * 
			 * if (dataarray[j] == "invoicedetail") { tabledata =
			 * data.invoicedetail; } else if (dataarray[j] == "invoiceheader") {
			 * tabledata = data.invoiceheader; } else if (dataarray[j] ==
			 * "invoicerxddetail") { tabledata = data.invoicerxddetail; } else
			 * if (dataarray[j] == "promotiondetail") { tabledata =
			 * data.promotiondetail; } else if (dataarray[j] ==
			 * "customerinvoice") { tabledata = data.customerinvoice; } else if
			 * (dataarray[j] == "salesorderheader") { tabledata =
			 * data.salesorderheader; } else if (dataarray[j] ==
			 * "salesorderdetail") { tabledata = data.salesorderdetail; } else
			 * if (dataarray[j] == "batchdetail") { tabledata =
			 * data.batchdetail; } else if (dataarray[j] == "arheader") {
			 * tabledata = data.arheader; } else if (dataarray[j] == "ardetail") {
			 * tabledata = data.ardetail; } else if (dataarray[j] ==
			 * "cashcheckdetail") { tabledata = data.cashcheckdetail; } else if
			 * (dataarray[j] == "inventorytransactionheader") { tabledata =
			 * data.inventorytransactionheader; } else if (dataarray[j] ==
			 * "inventorytransactiondetail") { tabledata =
			 * data.inventorytransactiondetail; } else if (dataarray[j] ==
			 * "inventorysummarydetail") { tabledata =
			 * data.inventorysummarydetail; } else if (dataarray[j] ==
			 * "nonservicedcustomer") { tabledata = data.nonservicedcustomer; }
			 * else if (dataarray[j] == "surveyauditdetail") { tabledata =
			 * data.surveyauditdetail; } else if (dataarray[j] ==
			 * "posequipmentchangedetail") { tabledata =
			 * data.posequipmentchangedetail; } else if (dataarray[j] ==
			 * "posmaster") { tabledata = data.posmaster; }
			 * 
			 * for (i = 0; i < tabledata.length; i++) {
			 * updateSyncData(dataarray[j], tabledata, i); }
			 * 
			 * 
			 * $.mobile.hidePageLoadingMsg();
			 *  }
			 */

			$.mobile.hidePageLoadingMsg();
			// if(cl=='clr')
			// {
			// alert("ssssscomman");
			// }

			getLangText("Data Sent Successfully.");

			invoicedetail = {};
			invoiceheader = {};
			invoicerxddetail = {};
			promotiondetail = {};
			customerinvoice = {};
			salesorderdetail = {};
			salesorderheader = {};
			orderrxddetail={};
			batchdetail = {};
			arheader = {};
			ardetail = {};
			cashcheckdetail = {};
			inventorytransactionheader = {};
			inventorytransactiondetail = {};
			inventorysummarydetail = {};
			nonservicedcustomer = {};
			surveyauditdetail = {};
			posequipmentchangedetail = {};
			customerinventorydetail = {};
			customerinventorycheck={};
	    		visualsfeedback={};
	    		promotions_remark={};
	    		customerdistributioncheck={};
			customeroperationscontrol = {};
			sigcapturedata = {};
			posmaster = {};
			routemaster = {};
			nosalesheader = {};
			customermaster = {};
			routesequencecustomerstatus = {};
			customeroperationscontrol = {};
			customer_foc_balance = {};
			dataRoutekey = new Array();
			dataTranskey = new Array();
			dataVisitkey = new Array();
			countRecord = 0;
			
			
			if(sessionStorage.getItem("backScreen")!==""){
			window.location=sessionStorage.getItem("backScreen");
			}else{
				getTransactionList();
			}
			
		},
		error : function(qXHR, textStatus, errorThrown) {
			alert("failure: " + qXHR.status + ":" + textStatus + errorThrown);
			$.mobile.hidePageLoadingMsg();
		}
	});
}

function uploadInvoicedetail() {

	var dataarray = [ "invoicedetail"];
	
	var uploaddata = {invoicedetail:invoicedetail};
	console.log("dataarray "+JSON.stringify(uploaddata));
	JSON.stringify(nonservicedcustomer)
	// url: wsurl + "sync/senddata",
	$.ajax({
		type : "post",
		url : wsurl + "sync/invtxndetail",
		cache : false,
		timeout : 60000,
		data : {
			invoicedetail : invoicedetail,
			
		},
		success : function(data) {

			console.log("DATA1 : " + data);
			data = JSON.parse(data);
			console.log("DATA : " + data);
			console.log("DATA : " + JSON.stringify(data));
			for ( var key in data) {

				// alert(key);
				var tabledata;

				if (key == "invoicedetail") {
					tabledata = data.invoicedetail;
				} 
				for (i = 0; i < tabledata.length; i++) {
					updateSyncData(key, tabledata, i);
				}

			}

			

			$.mobile.hidePageLoadingMsg();
			// if(cl=='clr')
			// {
			// alert("ssssscomman");
			// }

			getLangText("Data Sent Successfully.");

			invoicedetail = {};
			
			if(sessionStorage.getItem("backScreen")!==""){
			window.location=sessionStorage.getItem("backScreen");
			}else{
				getTransactionList();
			}
			
		},
		error : function(qXHR, textStatus, errorThrown) {
			
			alert("failure: " + qXHR.status + ":" + textStatus + errorThrown);
			$.mobile.hidePageLoadingMsg();
		}
	});
}

function uploadArdetail() {

	var dataarray = [ "ardetail"];
	
	var uploaddata = {ardetail:ardetail};
	console.log("dataarray "+JSON.stringify(uploaddata));
	JSON.stringify(nonservicedcustomer)
	// url: wsurl + "sync/senddata",
	$.ajax({
		type : "post",
		url : wsurl + "sync/artxndetail",
		cache : false,
		timeout : 60000,
		data : {
			ardetail : ardetail,
			
		},
		success : function(data) {

			console.log("DATA1 : " + data);
			data = JSON.parse(data);
			console.log("DATA : " + data);
			console.log("DATA : " + JSON.stringify(data));
			for ( var key in data) {

				// alert(key);
				var tabledata;

				if (key == "ardetail") {
					tabledata = data.ardetail;
				} 
				for (i = 0; i < tabledata.length; i++) {
					updateSyncData(key, tabledata, i);
				}

			}

			

			$.mobile.hidePageLoadingMsg();
			// if(cl=='clr')
			// {
			// alert("ssssscomman");
			// }

			getLangText("Data Sent Successfully.");

			ardetail = {};
			
			if(sessionStorage.getItem("backScreen")!==""){
			window.location=sessionStorage.getItem("backScreen");
			}else{
				getTransactionList();
			}
			
		},
		error : function(qXHR, textStatus, errorThrown) {
			alert("failure: " + qXHR.status + ":" + textStatus + errorThrown);
			$.mobile.hidePageLoadingMsg();
		}
	});
}



// Function used for update offline data after sync
function updateSyncData(tableName, tabledata, i) {

	var updatequery = '';

	if (tableName == "invoicedetail") {
		updatequery = "update invoicedetail set issync=1 where routekey='"
				+ tabledata[i].routekey + "' and visitkey='"
				+ tabledata[i].visitkey + "' and itemcode="
				+ tabledata[i].itemcode;
		// alert(updatequery);
	} else if (tableName == "invoiceheader") {

		updatequery = "update invoiceheader set issync=1 where routekey='"
				+ tabledata[i].routekey + "' and visitkey='"
				+ tabledata[i].visitkey + "'";
		// alert(updatequery);
	} else if (tableName == "invoicerxddetail") {
		updatequery = "update invoicerxddetail set issync=1 where routekey='"
				+ tabledata[i].routekey + "' and visitkey='"
				+ tabledata[i].visitkey + "' and itemcode='"
				+ tabledata[i].itemcode + "'";
		// alert(updatequery);
	}

	else if (tableName == "promotiondetail") {
		updatequery = "update promotiondetail set issync=1 where routekey='"
				+ tabledata[i].routekey + "' and visitkey='"
				+ tabledata[i].visitkey + "' and itemcode='"
				+ tabledata[i].itemcode + "'";
	}

	else if (tableName == "customerinvoice") {
		updatequery = "update customerinvoice set issync=1 where transactionkey='"
				+ tabledata[i].transactionkey + "'";
	} else if (tableName == "salesorderdetail") {
		updatequery = "update salesorderdetail set issync=1 where routekey='"
				+ tabledata[i].routekey + "' and visitkey='"
				+ tabledata[i].visitkey + "' and itemcode='"
				+ tabledata[i].itemcode + "'";
	} else if (tableName == "salesorderheader") {
		updatequery = "update salesorderheader set issync=1 where routekey='"
				+ tabledata[i].routekey + "' and visitkey='"
				+ tabledata[i].visitkey + "'";
	}else if (tableName == "orderrxddetail") {
		updatequery = "update orderrxddetail set issync=1 where routekey='"
			+ tabledata[i].routekey + "' and visitkey='"
			+ tabledata[i].visitkey + "' and itemcode='"
			+ tabledata[i].itemcode + "'";
	// alert(updatequery);
	} else if (tableName == "batchexpirydetail") {
		updatequery = "update batchdetail set issync=1 where routekey='"
				+ tabledata[i].routekey + "' and visitkey='"
				+ tabledata[i].visitkey + "' and batchdetailkey='"
				+ tabledata[i].batchdetailkey + "'";
	} else if (tableName == "arheader") {
		updatequery = "update arheader set issync=1 where routekey='"
				+ tabledata[i].routekey + "' and visitkey='"
				+ tabledata[i].visitkey + "'";
	} else if (tableName == "ardetail") {
		updatequery = "update ardetail set issync=1 where routekey='"
				+ tabledata[i].routekey + "' and visitkey='"
				+ tabledata[i].visitkey + "' and transactionkey='"
				+ tabledata[i].transactionkey + "'";
	} else if (tableName == "cashcheckdetail") {
		updatequery = "update cashcheckdetail set issync=1 where routekey='"
				+ tabledata[i].routekey + "' and visitkey='"
				+ tabledata[i].visitkey + "'";
	}

	else if (tableName == "inventorytransactionheader") {
		updatequery = "update inventorytransactionheader set issync=1 where routekey='"
				+ tabledata[i].routekey
				+ "' and detailkey='"
				+ tabledata[i].detailkey + "'";
	}

	else if (tableName == "inventorytransactiondetail") {
		updatequery = "update inventorytransactiondetail set issync=1 where routekey='"
				+ tabledata[i].routekey
				+ "' and detailkey='"
				+ tabledata[i].detailkey
				+ "' and itemcode='"
				+ tabledata[i].itemcode + "'";
	}

	else if (tableName == "inventorysummarydetail") {
		updatequery = "update inventorysummarydetail set issync=1 where routekey='"
				+ tabledata[i].routekey
				+ "' and itemcode='"
				+ tabledata[i].itemcode
				+ "' and inventorykey='"
				+ tabledata[i].inventorykey + "'";
	}

	else if (tableName == "nonservicedcustomer") {
		updatequery = "update nonservicedcustomer set issync=1 where routekey='"
				+ tabledata[i].routekey
				+ "' and customercode='"
				+ tabledata[i].customercode + "'";
	} else if (tableName == "nosalesheader") {
		updatequery = "update nosalesheader set issync=1 where routekey='"
				+ nosalesheader[i].routekey + "' and customercode='"
				+ tabledata[i].customercode + "'";
	} else if (tableName == "surveyauditdetail") {
		updatequery = "update surveyauditdetail set issync=1 where routekey='"
				+ tabledata[i].routekey + "' and visitkey='"
				+ tabledata[i].visitkey + "' and surveydefkey='"
				+ tabledata[i].surveydefkey + "'";
	}

	else if (tableName == "posequipmentchangedetail") {
		updatequery = "update posequipmentchangedetail set issync=1 where routekey='"
				+ tabledata[i].routekey
				+ "' and visitkey='"
				+ tabledata[i].visitkey
				+ "' and itemcode='"
				+ tabledata[i].itemcode + "'";
	}

	else if (tableName == "posmaster") {
		updatequery = "update posmaster set issync=1 where itemcode='"
				+ tabledata[i].itemcode + "'";
	} else if (tableName == "sigcapturedata") {
		updatequery = "update sigcapturedata set issync=1 where routekey='"
				+ tabledata[i].routekey + "' and visitkey='"
				+ tabledata[i].visitkey + "'";
	} else if (tableName == "customerinventorydetail") {
		updatequery = "update customerinventorydetail set issync=1 where routekey='"
				+ tabledata[i].routekey
				+ "' and visitkey='"
				+ tabledata[i].visitkey
				+ "' and itemcode='"
				+ tabledata[i].itemcode + "'";
	}
	else if(tableName =="customerinventorycheck")
    	{
		updatequery = "update customerinventorycheck set issync=1 where routekey='" + tabledata[i].routekey + "' and visitkey='" + tabledata[i].visitkey + "' and itemcode='" + tabledata[i].itemcode + "' and expiry_date='" + tabledata[i].expiry_date + "'";
    	}
    	else if(tableName =="visualsfeedback")
    	{	
		updatequery = "update visualsfeedback set issync=1 where routekey='" + tabledata[i].routekey + "' and visitkey='" + tabledata[i].visitkey + "' and visualdetail_id='" + tabledata[i].visualdetail_id + "'";
    	}
    	else if(tableName =="promotions_remark")
    	{
		updatequery = "update promotions_remark set issync=1 where routekey='"+tabledata[i].routekey+"' and customercode='"+tabledata[i].customercode+"' and promotionkey='"+tabledata[i].promotionkey+"'";
    	}
    	else if(tableName =="customerdistributioncheck")
    	{
		updatequery = "update customerdistributioncheck set issync=1 where routekey='"+tabledata[i].routekey+"' and customercode='"+tabledata[i].customercode+"' and itemcode='"+tabledata[i].itemcode+"' and visitkey='"+tabledata[i].visitkey+"'";
    	}     
	else if (tableName == "customeroperationscontrol") {
		updatequery = "update customeroperationscontrol set issync=1 where routekey='"
				+ tabledata[i].routekey
				+ "' and visitkey='"
				+ tabledata[i].visitkey + "'";
	} else if (tableName == "routesequencecustomerstatus") {
		updatequery = "update routesequencecustomerstatus set issync=1 where routekey='"
				+ tabledata[i].routekey
				+ "' and customercode='"
				+ tabledata[i].customercode + "'";
	} else if (tableName == "customermaster") {
		updatequery = "update customermaster set issync=1 where customercode='"
				+ tabledata[i].customercode + "'";
	} else if (tableName == "customer_foc_balance") {
		updatequery = "update customer_foc_balance set issync=1 where customercode='"
				+ tabledata[i].customercode
				+ "' and itemcode="
				+ tabledata[i].itemcode;
	} else if (tableName == "customervisitlog") {
		updatequery = "update customervisitlog set issync=1 where customercode='"
			+ tabledata[i].customercode
			+ "' and log_id="
			+ tabledata[i].log_id;
	}
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			// alert(result);
			return true;
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod", [ updatequery ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(updatequery, function(result) {
			return true;
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

// Function used for update odometer setting
function insertOdometer(data, redirectlink) {
	
	var mydate = new Date();
	var thehour = mydate.getHours();
	var theminut = mydate.getMinutes();
	var thesecond = mydate.getSeconds();

	var time = thehour + ":" + theminut + ":" + thesecond;
	
	var insertquery = '';
	sessionStorage.setItem("RouteKey", data["startday"][0].routekey);
	insertquery = "insert into startendday(routekey,routecode,salesmancode,routestartdate,routestarttime,routestartodometer,routeclosed) values("
			+ data["startday"][0].routekey
			+ ","
			+ sessionStorage.getItem('RouteCode')
			+ ","
			+ sessionStorage.getItem('SalesmanCode')
			+ ",'"
			+ getTabletDate()
			+ "','"
			+ time
			+ "',"
			+ sessionStorage.getItem('OdometerValue') + ",0)";

	if (platform == 'iPad') {

		Cordova.exec(function(result) {

			sessionStorage.setItem("beginday", 1);

			/*
			 * var base = window.location.toString().substring(0,
			 * window.location.toString().lastIndexOf("/")) + "/";
			 * 
			 * window.location = base + redirectlink;
			 */
			Checkbatch(data["startday"][0].routekey);

		}, function(error) {
			navigator.notification.alert("Error in insert start end day : "
					+ error);
		}, "PluginClass", "InsertUpdateMethod", [ insertquery ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(insertquery, function(result) {
			sessionStorage.setItem("beginday", 1);
			/*
			 * var base = window.location.toString().substring(0,
			 * window.location.toString().lastIndexOf("/")) + "/";
			 * 
			 * window.location = base + redirectlink;
			 */
			Checkbatch(data["startday"][0].routekey);

		}, function() {
			console.warn("Error calling plugin");
		});
	}

}
function Checkbatch(routekey) {
	var QrySelect = "select batchnumber from batchexpirydetail where transactiontypecode=12";
	console.log(QrySelect);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result.length > 0)
				Updatebatch(0, result, routekey);
			else
				CheckOpeningQty(routekey);
		}, function(error) {
			navigator.notification.alert("Error in insert start end day : "
					+ error);
		}, "PluginClass", "GetdataMethod", [ QrySelect ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(QrySelect, function(result) {
			if (result.array != undefined)
				Updatebatch(0, result, routekey);
			else
				CheckOpeningQty(routekey);
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}
function Updatebatch(i, data, routekey) {
	var Qrydel = "delete from batchmaster";
	var QryInsert = "INSERT INTO batchmaster(quantity,batchdetailkey,batchnumber,expirydate,itemcode) SELECT quantity,batchdetailkey,batchnumber,expirydate,itemcode FROM batchexpirydetail WHERE transactiontypecode=12";
	if (platform == "iPad") {
		Cordova.exec(function(result) {
			Cordova.exec(function(result) {
				CheckOpeningQty(routekey);
			}, function(error) {
				alert(error);
			}, "PluginClass", "InsertUpdateMethod", [ QryInsert ]);
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod", [ Qrydel ]);

	} else if (platform == 'Android') {

		window.plugins.DataBaseHelper.insert(Qrydel, function(result) {
			window.plugins.DataBaseHelper.insert(QryInsert, function(result) {
				CheckOpeningQty(routekey);
			}, function() {
				console.warn("Error calling plugin");
			});
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}
function CheckOpeningQty(routekey) {
	// var QrySelect = "SELECT itemcode,quantity FROM inventorytransactiondetail
	// WHERE transactiontypecode = 12";
	var QrySelect = "SELECT itemcode,quantity FROM inventorytransactiondetail WHERE transactiontypecode = 5";
	console.log(QrySelect);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (result.length > 0)
				UpdateInventoySummary(0, result, routekey);
			else
				cleartransdata();
		}, function(error) {
			navigator.notification.alert("Error in insert start end day : "
					+ error);
		}, "PluginClass", "GetdataMethod", [ QrySelect ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.select(QrySelect, function(result) {
			if (result.array != undefined) {
				result = $.map(result.array, function(item, index) {
					return [ [ item.itemcode, item.quantity ] ];
				});
				if (result.length > 0){
//					UpdateInventoySummary(0, result, routekey);
					UpdateInventoySummary(routekey);
				}else{
					cleartransdata();
				}
					
			} else
				cleartransdata();
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function UpdateInventoySummary(routekey) {
	
	var QryInsert = "INSERT INTO inventorysummarydetail(inventorykey,routekey,itemcode,beginstockqty,istemp,issync,stdsalesprice,stdsalescaseprice,stdreturnprice,stdreturncaseprice)  SELECT "+routekey+","+routekey+",itemcode,quantity,'false',0,itemprice,itemcaseprice,itemprice,itemcaseprice FROM inventorytransactiondetail WHERE transactiontypecode=5";
	if (platform == "iPad") {
		Cordova.exec(function(result) {
				GetInvoiceAndDocNumber();
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod", [ QryInsert ]);
	} else if (platform == "Android") {
		window.plugins.DataBaseHelper.insert(QryInsert, function(result) {
				GetInvoiceAndDocNumber();
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}


//function UpdateInventoySummary(i, data, routekey) {
//	var itemcode = data[i][0];
//	var quantity = data[i][1];
//	var Qry = "SELECT COUNT(*) as cnt FROM inventorysummarydetail WHERE itemcode = "
//			+ itemcode + " AND routekey= " + routekey;
//	var QryInsert = "INSERT INTO inventorysummarydetail(inventorykey,routekey,itemcode,beginstockqty,istemp,issync,stdsalesprice,stdsalescaseprice,stdreturnprice,stdreturncaseprice) SELECT "
//			+ routekey
//			+ ","
//			+ routekey
//			+ ","
//			+ itemcode
//			+ ","
//			+ quantity
//			+ ",'false',0,defaultsalesprice,caseprice,defaultreturnprice,returncaseprice FROM itemmaster WHERE actualitemcode="
//			+ itemcode;
//	var QryUpdate = "UPDATE inventorysummarydetail set beginstockqty = ("
//			+ eval(quantity) + "),issync=0 where routekey=" + routekey
//			+ " and itemcode=" + itemcode;
//	var QryNew = "";
//	if (platform == "iPad") {
//		Cordova.exec(function(result) {
//			if (result.length > 0) {
//				if (eval(result) > 0)
//					QryNew = QryUpdate;
//				else
//					QryNew = QryInsert;
//				console.log(QryNew);
//				Cordova.exec(function(result) {
//					if (i + 1 < data.length)
//						UpdateInventoySummary(i + 1, data, routekey);
//
//					if (i == (data.length - 1))
//						GetInvoiceAndDocNumber();
//				}, function(error) {
//					alert(error);
//				}, "PluginClass", "InsertUpdateMethod", [ QryNew ]);
//			}
//		}, function(error) {
//			alert(error);
//		}, "PluginClass", "GetdataMethod", [ Qry ]);
//	} else if (platform == "Android") {
//		window.plugins.DataBaseHelper.select(Qry, function(result) {
//			if (result.array != undefined) {
//				if (result.array[0].cnt > 0)
//					QryNew = QryUpdate;
//				else
//					QryNew = QryInsert;
//				console.log(QryNew);
//				window.plugins.DataBaseHelper.insert(QryNew, function(result) {
//					if (i + 1 < data.length)
//						UpdateInventoySummary(i + 1, data, routekey);
//
//					if (i == (data.length - 1))
//						GetInvoiceAndDocNumber();
//				}, function() {
//					console.warn("Error calling plugin");
//				});
//			}
//		}, function() {
//			console.warn("Error calling plugin");
//		});
//	}
//}

function GetInvoiceAndDocNumber() {
	var Qry = "SELECT CASE WHEN MAX(bodocseq) IS NULL OR MAX(bodocseq) <=0 OR MAX(bodocseq) = '' OR MAX(bodocseq) = 'null' THEN 0 ELSE bodocseq END AS documentnumber,CASE WHEN MAX(hhcivtseq) IS NULL OR MAX(hhcivtseq) <=0 OR MAX(hhcivtseq) = '' OR MAX(hhcivtseq) = 'null' THEN 0 ELSE hhcivtseq END AS invoicenumber  FROM routemaster WHERE routecode="
			+ sessionStorage.getItem("RouteCode");
	console.log(Qry);
	if (platform == "iPad") {
		Cordova.exec(function(result) {
			if (result.length > 0) {
				var DocPrefix = sessionStorage.getItem("RouteCode").toString();
				DocumentNumber = DocPrefix.toString()
						+ (eval(result[0][0]) + 1).toString().lpad("0", 6);

				var InvoicePrefix = sessionStorage.getItem("RouteCode")
						.toString()
						+ '4';
				InvoiceNumber = InvoicePrefix.toString()
						+ (eval(result[0][1]) + 1).toString().lpad("0", 6);

				UpdateInventoryTransactionAndHeader(DocumentNumber,
						InvoiceNumber);
			}
		}, function(error) {
			alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == "Android") {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				var DocPrefix = sessionStorage.getItem("RouteCode").toString();
				DocumentNumber = DocPrefix.toString()
						+ (eval(result.array[0].documentnumber) + 1).toString()
								.lpad("0", 6);

				var InvoicePrefix = sessionStorage.getItem("RouteCode")
						.toString()
						+ '4';
				InvoiceNumber = InvoicePrefix.toString()
						+ (eval(result.array[0].invoicenumber) + 1).toString()
								.lpad("0", 6);

				UpdateInventoryTransactionAndHeader(DocumentNumber,
						InvoiceNumber);
			}
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function UpdateInventoryTransactionAndHeader(DocumentNumber, InvoiceNumber) {
	var transactiontypecode = 12;
	var endinginvtypecode = 5;
	var inventorytransactiontype = 1 // For inventorytransactionheader
	QryTransactiondetail = "INSERT INTO inventorytransactiondetail(routekey,transactiontypecode,itemcode,quantity,itemprice,itemcaseprice,istemp,issync) SELECT "
			+ sessionStorage.getItem("RouteKey")
			+ ","
			+ transactiontypecode
			+ ",itemcode,quantity,itemprice,itemcaseprice,'false',0 FROM inventorytransactiondetail WHERE transactiontypecode = "
			+ endinginvtypecode;
	QryTransactionHeader = "INSERT INTO inventorytransactionheader(inventorykey,routekey,transactiontype,routecode,salesmancode,transactiondate,transactiontime,documentnumber,odometerreading,transferlocationcode,referencenumber,securitycode,transmitindicator,voidflag,hhcdocumentnumber,loadnumber,refdocumentnumber,currencycode,actualtransactiondate,inventorynumber,data,issync,istemp) VALUES("
			+ sessionStorage.getItem("RouteKey")
			+ ","
			+ sessionStorage.getItem("RouteKey")
			+ ","
			+ inventorytransactiontype
			+ ","
			+ sessionStorage.getItem("RouteCode")
			+ ","
			+ sessionStorage.getItem("SalesmanCode")
			+ ",date('now', 'localtime'),time('now', 'localtime'),"
			+ DocumentNumber
			+ ",0,0,0,0,0,0,"
			+ InvoiceNumber
			+ ",0,0,0,date(),0,0,0,'false')";
	QryUpdateTransDetailKey = "UPDATE inventorytransactiondetail SET detailkey = (SELECT MAX(detailkey) FROM inventorytransactionheader) WHERE routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND transactiontypecode = " + transactiontypecode;
	if (platform == "iPad") {
		console.log(QryTransactiondetail);
		Cordova.exec(function(result) {
			console.log(QryTransactionHeader);

			Cordova.exec(function(result) {
				console.log(QryUpdateTransDetailKey);
				Cordova.exec(function(result) {
					UpdateDocumentNumber();
				}, function(error) {
					alert(error);
				}, "PluginClass", "InsertUpdateMethod",
						[ QryUpdateTransDetailKey ]);
			}, function(error) {
				alert(error);
			}, "PluginClass", "InsertUpdateMethod", [ QryTransactionHeader ]);
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod", [ QryTransactiondetail ]);
	} else if (platform == "Android") {
		window.plugins.DataBaseHelper.insert(QryTransactiondetail, function(
				result) {
			window.plugins.DataBaseHelper.insert(QryTransactionHeader,
					function(result) {
						window.plugins.DataBaseHelper.insert(
								QryUpdateTransDetailKey, function(result) {
									UpdateDocumentNumber();
								}, function() {
									console.warn("Error calling plugin");
								});
					}, function() {
						console.warn("Error calling plugin");
					});
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function UpdateDocumentNumber() {
	var Qry = "UPDATE routemaster SET bodocseq = (ifnull(bodocseq,0) + 1),hhcivtseq = (ifnull(hhcivtseq,0) + 1) WHERE routecode="
			+ sessionStorage.getItem("RouteCode");
	console.log(Qry);
	if (platform == "iPad") {
		console.log(QryTransactiondetail);
		Cordova.exec(function(result) {
			cleartransdata();
		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod", [ Qry ]);
	} else if (platform == "Android") {
		window.plugins.DataBaseHelper.insert(Qry, function(result) {
			cleartransdata();
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

// -------Update routemaster
function UpdateMacaddress() {
	var Qry = "UPDATE routemaster SET memo1 = " + macadd + " WHERE routecode="
			+ sessionStorage.getItem("RouteCode");
	console.log(Qry);
	if (platform == "iPad") {
		console.log(QryTransactiondetail);
		Cordova.exec(function(result) {

		}, function(error) {
			alert(error);
		}, "PluginClass", "InsertUpdateMethod", [ Qry ]);
	} else if (platform == "Android") {
		window.plugins.DataBaseHelper.insert(Qry, function(result) {

		}, function() {
			console.warn("Error calling plugin");
		});
	}
}
// -----------

String.prototype.lpad = function(padString, length) {
	var str = this;
	while (str.length < length)
		str = padString + str;
	return str;
}
// developed by nidhi - for rounding amount
function customrounding(valAmt, roundingPoints) {
	if (roundingPoints == 0 || roundingPoints == '')
		return valAmt;
	// Upper Rounding
	if (roundingPoints > 0) {
		if (valAmt > 0)
			return Math.ceil(Math.abs(valAmt)
					* (100 / (Math.abs(roundingPoints) * 100)))
					/ (100 / (Math.abs(roundingPoints) * 100));
		else
			return -Math.ceil(Math.abs(valAmt)
					* (100 / (Math.abs(roundingPoints) * 100)))
					/ (100 / (Math.abs(roundingPoints) * 100));
	}
	// Lower Rounding
	else {
		if (valAmt > 0)
			return Math.floor(Math.abs(valAmt)
					* (100 / (Math.abs(roundingPoints) * 100)))
					/ (100 / (Math.abs(roundingPoints) * 100));
		else
			return -Math.floor(Math.abs(valAmt)
					* (100 / (Math.abs(roundingPoints) * 100)))
					/ (100 / (Math.abs(roundingPoints) * 100));

	}

}
function encodeStr(uncoded) {
	var key = "SXGWLZPDOKFIVUHJYTQBNMACERxswgzldpkoifuvjhtybqmncare";

	uncoded = uncoded.toUpperCase().replace(/^\s+|\s+$/g, "");
	var coded = "";
	var chr;
	for ( var i = uncoded.length - 1; i >= 0; i--) {
		chr = uncoded.charCodeAt(i);
		coded += (chr >= 65 && chr <= 90) ? key.charAt(chr - 65 + 26
				* Math.floor(Math.random() * 2)) : String.fromCharCode(chr);
	}
	return encodeURIComponent(coded);
}

function decodeStr(coded) {
	coded = decodeURIComponent(coded);
	var uncoded = "";
	var chr;
	for ( var i = coded.length - 1; i >= 0; i--) {
		chr = coded.charAt(i);
		uncoded += (chr >= "a" && chr <= "z" || chr >= "A" && chr <= "Z") ? String
				.fromCharCode(65 + key.indexOf(chr) % 26)
				: chr;
	}
	return uncoded;
}
function decodeFinancePwd(n){
	var newkey="";
	var array=n.match(/.{1,2}/g);
	for(var i=0;i<array.length;i++){
		var upt_val=(100-eval(array[i]));
	  
		newkey=newkey+upt_val;
		if(i==array.length-1){
			newkey=newkey.split("").reverse().join("");
			return newkey;
	  }
	}
	
}

function colName(n) {

	if (n.length < 8)
		n = n + eval('123');
	var s = "";

	while (n >= 0) {
		s = String.fromCharCode(n % 26 + 97) + s;
		n = Math.floor(n / 26) - 1;
	}

	return num_char(s);
}
function num_char(input){

	var inputlength = input.length;
	input = input.toLowerCase();
	var numberchar = "";
	for (i = 0; i < inputlength; i++) {
		var character = input.charAt(i);

		switch (character) {
		case '0':
			numberchar += "0";
			break;
		case '1':
			numberchar += "1";
			break;
		case '2':
			numberchar += "2";
			break;
		case '3':
			numberchar += "3";
			break;
		case '4':
			numberchar += "4";
			break;
		case '5':
			numberchar += "5";
			break;
		case '6':
			numberchar += "6";
			break;
		case '7':
			numberchar += "7";
			break;
		case '8':
			numberchar += "8";
			break;
		case '9':
			numberchar += "9";
			break;
		case '-':
			numberchar += "-";
			break;
		case 'a':
		case 'b':
		case 'c':
			numberchar += "2";
			break;
		case 'd':
		case 'e':
		case 'f':
			numberchar += "3";
			break;
		case 'g':
		case 'h':
		case 'i':
			numberchar += "4";
			break;
		case 'j':
		case 'k':
		case 'l':
			numberchar += "5";
			break;
		case 'm':
		case 'n':
		case 'o':
			numberchar += "6";
			break;
		case 'p':
		case 'q':
		case 'r':
		case 's':
			numberchar += "7";
			break;
		case 't':
		case 'u':
		case 'v':
			numberchar += "8";
			break;
		case 'w':
		case 'x':
		case 'y':
		case 'z':
			numberchar += "9";
			break;
		}
	}

	return numberchar;
}
function cleartransdata() {
	var Tbls = [ 'salesorderheader', 'batchexpirydetail', 'arheader',
			'ardetail', 'cashcheckdetail', 'inventorytransactiondetail',
			'inventorytransactionheader', 'inventorysummarydetail',
			'surveyauditdetail', 'posequipmentchangedetail', 'sigcapturedata',
			'customeroperationscontrol', 'routesequencecustomerstatus',
			'customerinventorydetail', 'nosalesheader', 'invoicedetail',
			'invoiceheader', 'invoicerxddetail', 'promotiondetail',
			'salesorderdetail', 'enddaydetail' ];
	if (platform == 'iPad') {

		for (i = 0; i < Tbls.length; i++) {

			if (Tbls[i] == 'inventorysummarydetail'
					|| Tbls[i] == 'inventorytransactiondetail'
					|| Tbls[i] == 'inventorytransactionheader') {
				var Qry = "DELETE FROM " + Tbls[i] + " where routekey!="
						+ sessionStorage.getItem("RouteKey");
			} else
				var Qry = "DELETE FROM " + Tbls[i];

			console.log(Qry);
			Cordova.exec(function(result) {

			}, function(error) {
				alert(error);
			}, "PluginClass", "InsertUpdateMethod", [ Qry ]);
			if (i == Tbls.length - 1)
				window.location = "../home/home.html";
		}

	} else if (platform == 'Android') {

		for (i = 0; i < Tbls.length; i++) {
			if (Tbls[i] == 'inventorysummarydetail'
					|| Tbls[i] == 'inventorytransactiondetail'
					|| Tbls[i] == 'inventorytransactionheader') {
				var Qry = "DELETE FROM " + Tbls[i] + " where routekey!="
						+ sessionStorage.getItem("RouteKey");
			} else
				var Qry = "DELETE FROM " + Tbls[i];

			console.log(Qry);
			window.plugins.DataBaseHelper.insert(Qry, function(result) {
				

			}, function() {
				console.warn("Error calling plugin");
			});
			if (i == Tbls.length - 1)
				{
				//  sujee added function to insert into routesequencecustomerstatus for DSR Report 17/07/2017
				  Insertroutesequncestatus(); 
				// org line sujee commented 
				  //window.location = "../home/home.html"; 
				}
		}

	}
}

function Insertroutesequncestatus()
{
	//alert("Insertroutesequncestatus");
	callindex = new Date().getDay() == 0 ? 7 : new Date().getDay();
	var seduleflag=1;
	var d = new Date();
    var n = d.getDay();
	var array = ['sunseq','monseq','tueseq','wedseq','thuseq','friseq','satseq'];
    var callarray=['callrestrictiondays7','callrestrictiondays1','callrestrictiondays2','callrestrictiondays3','callrestrictiondays4','callrestrictiondays5','callrestrictiondays6'];
    var days = array[n];
    var calldays = callarray[n];
	var Qry="Insert into routesequencecustomerstatus(routekey,seqweeknumber,seqweekday,routecode,customercode,sequencenumber,schelduledflag,servicedflag,scannedflag,issync) SELECT  "+sessionStorage.getItem("RouteKey")+",rp32weeknumber,"+callindex+",routecode,customercode,"+days+","+seduleflag+",0,0,0 from routesequence where "+calldays+"=1";
	console.log(Qry);

	//alert(Qry);

	if(platform == 'iPad')
		{
		
		}
	   else if (platform == 'Android') {
		   window.plugins.DataBaseHelper.insert(Qry, function(result) {
				
				 window.location = "../home/home.html";
			}, function() {
				console.warn("Error calling plugin");
			});
		
	   }
	
}

function PopupImage(element, html) {
	var elementid = '#' + element;
	var htmlCommon = null;
	
	htmlCommon = "<table id='tblPassword' border='0' cellpadding='2' cellspacing='0' width='400px' align='center'>"
			+ html + "</table>";
	$(document).delegate(elementid, 'click', function() {
		$(this).simpledialog({
			'mode' : 'blank',
			'prompt' : false,
			'forceInput' : false,
			'useModal' : true,
			'fullHTML' : htmlCommon
		});
		
		
	});
}

function PopupSelect(element, html) {
	var elementid = '#' + element;
	var htmlCommon = null;

	htmlCommon = "<table id='tblPassword' border='0' cellpadding='2' cellspacing='0' width='100%' align='center'>"
			+ html + "</table>";
	$(document).delegate(elementid, 'click', function() {
		$(this).simpledialog({
			'mode' : 'blank',
			'prompt' : false,
			'forceInput' : false,
			'useModal' : true,
			'fullHTML' : htmlCommon
		});
	});
}

Number.prototype.toRad = function() {
	return this * Math.PI / 180;
}
function toRad(value) {
	return value * Math.PI / 180;
}
function distanceFromCurrent(Radius) {
	var currLat = sessionStorage.getItem("latitude");
	var currLon = sessionStorage.getItem("longitude");
	// navigator.notification.alert("--curlat---"+currLat+"---curlong--"+currLon);
	var pointLat = parseFloat(customerlat);
	var pointLon = parseFloat(customerlon);
	// navigator.notification.alert("Master Cordinate \n Latitude
	// :"+pointLat+"Longitude :"+pointLon);

	console.log("--pointLat---" + pointLat + "---pointLon--" + pointLon);
	var R = 6371; // Radius of the earth in Km
	// var R = 6378;
	var dLat = (pointLat - currLat).toRad(); // delta (difference between)
												// latitude in radians
	var dLon = (pointLon - currLon).toRad(); // delta (difference between)
												// longitude in radians
	console.log(dLat);
	console.log(dLon);

	currLat = toRad(currLat); // conversion to radians

	pointLat = toRad(pointLat);

	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2)
			* Math.sin(dLon / 2) * Math.cos(currLat) * Math.cos(pointLat);

	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // must use atan2 as
															// simple arctan
															// cannot
															// differentiate 1/1
															// and -1/-1

	var distance = R * c; // sets the distance
	// navigator.notification.alert(distance);
	// distance = Math.round(distance*10)/10; //rounds number to closest 0.1 km
	console.log(distance);
	//alert(distance);
	return distance; // returns the distance
}

function getRoundinginvoice() {
	var Qry = "SELECT status,flagvalue FROM controlpanel WHERE flagid=75";
	if (platform == "iPad") {
		Cordova.exec(function(result) {
			if (result.length > 0) {
				// if(result[0][0] ==1)
				// {
				// applyroundinginvoice(result[0][1]);
				UpdateTotalInvoiceAmount(result[0][1], result[0][0]);
				// }
			}

		}, function(error) {
			alert("Error in binding Bank Name : " + error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == "Android") {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				result = $.map(result.array, function(item, index) {
					return [ [ item.status, item.flagvalue ] ];
				});
				if (result.length > 0) {
					// if(result[0][0] ==1)
					// {
					// applyroundinginvoice(result[0][1]);
					//alert("Invoice Header Level Round"+result[0][1]);
						UpdateTotalInvoiceAmount(result[0][1], result[0][0]);
					// }
				}
			}

		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function UpdateTotalInvoiceAmount(roundamount, status) { 
	var decimalplace = sessionStorage.getItem("decimalplace");
	/*  sujee commeted for tax 
	var QryUpdate = "Update invoiceheader set totalinvoiceamount =(ifnull(totalsalesamount,0)-ifnull(totalreturnamount,0)-ifnull(totalpromoamount,0)-ifnull(totaldamagedamount,0)-ifnull(totaldiscountamount,0)) WHERE routekey="
			+ sessionStorage.getItem("RouteKey")
			+ "  and visitkey="
			+ sessionStorage.getItem("VisitKey");
	*/
//	var QryUpdate = "Update invoiceheader set totalinvoiceamount =CASE WHEN (ifnull(totalsalesamount,0)-ifnull(totalreturnamount,0)-ifnull(totaldamagedamount,0)) >0 THEN (CASE WHEN ifnull(totalmanualfree,0)>0 THEN ROUND((ifnull(totalsalesamount,0)-ifnull(totalreturnamount,0)-ifnull(totalpromoamount,0) - ifnull(headerdiscounttaxamt,0) -ifnull(totaldamagedamount,0)-ifnull(totaldiscountamount,0)+ifnull(itemlinetaxamount,0)+ifnull(totaltaxesamount,0)),"+decimalplace+")ELSE  ROUND((ifnull(totalsalesamount,0)-ifnull(totalreturnamount,0)-ifnull(totalpromoamount,0)-ifnull(headerdiscounttaxamt,0) -ifnull(totaldamagedamount,0)-ifnull(totaldiscountamount,0)+ifnull(itemlinetaxamount,0)+ifnull(totaltaxesamount,0)),"+decimalplace+") END) ELSE (CASE WHEN ifnull(totalmanualfree,0)>0 THEN ROUND((ifnull(totalsalesamount,0)-ifnull(totalreturnamount,0)-ifnull(totalpromoamount,0)-ifnull(headerdiscounttaxamt,0) -ifnull(totaldamagedamount,0)-ifnull(totaldiscountamount,0)+ifnull(itemlinetaxamount,0)+ifnull(totaltaxesamount,0)),"+decimalplace+")ELSE  ROUND((ifnull(totalsalesamount,0)-ifnull(totalreturnamount,0)-ifnull(totalpromoamount,0)-ifnull(headerdiscounttaxamt,0)-ifnull(totaldamagedamount,0)-ifnull(totaldiscountamount,0)+ifnull(itemlinetaxamount,0)+ifnull(totaltaxesamount,0)),"+decimalplace+") END) END   WHERE routekey="
//		+ sessionStorage.getItem("RouteKey")
//		+ "  and visitkey="
//		+ sessionStorage.getItem("VisitKey");
	
	var QryUpdate = "Update invoiceheader set totalinvoiceamount =CASE WHEN (ifnull(totalsalesamount,0)-ifnull(totalreturnamount,0)-ifnull(totaldamagedamount,0)) >0 THEN (CASE WHEN ifnull(totalmanualfree,0)>0 THEN ROUND((ifnull(totalsalesamount,0)-ifnull(totalreturnamount,0)-ifnull(totalpromoamount,0) - ifnull(headerdiscounttaxamt,0) -ifnull(totaldamagedamount,0)-ifnull(totaldiscountamount,0)+ifnull(itemlinetaxamount,0)+ifnull(totaltaxesamount,0)),"+decimalplace+")ELSE  ROUND((ifnull(totalsalesamount,0)-ifnull(totalreturnamount,0)-ifnull(totalpromoamount,0)-ifnull(headerdiscounttaxamt,0) -ifnull(totaldamagedamount,0)-ifnull(totaldiscountamount,0)+ifnull(itemlinetaxamount,0)+ifnull(totaltaxesamount,0)),"+decimalplace+") END) ELSE (CASE WHEN ifnull(totalmanualfree,0)>0 THEN ROUND((ifnull(totalsalesamount,0)-ifnull(totalreturnamount,0)-ifnull(totalpromoamount,0)-ifnull(headerdiscounttaxamt,0) -ifnull(totaldamagedamount,0)-ifnull(totaldiscountamount,0)+ifnull(itemlinetaxamount,0)+ifnull(totaltaxesamount,0)),"+decimalplace+")ELSE  ROUND((ifnull(totalsalesamount,0)-ifnull(totalreturnamount,0)+ifnull(totalpromoamount,0)+ifnull(headerdiscounttaxamt,0)-ifnull(totaldamagedamount,0)-ifnull(totaldiscountamount,0)+ifnull(itemlinetaxamount,0)+ifnull(totaltaxesamount,0)),"+decimalplace+") END) END   WHERE routekey="
	+ sessionStorage.getItem("RouteKey")
	+ "  and visitkey="
	+ sessionStorage.getItem("VisitKey");

	
	
	//alert(QryUpdate);
	if (platform == "iPad") {
		Cordova.exec(function(result) {
			if (status == 1)
				applyroundinginvoice(roundamount);
			else
				redirect_rounding();
		}, function(error) {
			alert("Error in binding Bank Name : " + error);
		}, "PluginClass", "InsertUpdateMethod", [ QryUpdate ]);
	} else if (platform == "Android") {
		window.plugins.DataBaseHelper.insert(QryUpdate, function(result) {
			if (status == 1)
				applyroundinginvoice(roundamount);
			else
				redirect_rounding();
				
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}
function getSaleAmount1(){
	
	var Qry = "select totalinvoiceamount from invoiceheader where visitkey="+ sessionStorage.getItem("VisitKey");
		// alert(Qry);
		console.log(Qry);
		if (platform == "iPad") {
			Cordova.exec(function(result) {
				
		
			}, function(error) {
				alert("Error in binding Bank Name : " + error);
			}, "PluginClass", "GetdataMethod", [ Qry ]);
		} else if (platform == "Android") {
			window.plugins.DataBaseHelper.select(Qry, function(result) {
				if (result.array != undefined) {
					result = $.map(result.array, function(item, index) {
						return [ [ item.totalinvoiceamount] ];
					});
					if (result.length > 0) {
						alert(result[0][0]);
						redirect_rounding();
					}
				}
		
			}, function() {
				console.warn("Error calling plugin");
			});
		}

	
}
function applyroundinginvoice(roundamount) {

	var Qry = "SELECT totalinvoiceamount,totalpromoamount FROM invoiceheader WHERE routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND visitkey="
			+ sessionStorage.getItem("VisitKey");
	//alert(Qry);
	if (platform == "iPad") {
		Cordova.exec(function(result) {
			if (result.length > 0) {
				var finalamount = eval(result[0][0]);
				var finalamount1 = customrounding(finalamount, roundamount);
				var diffround = eval(finalamount1) - eval(finalamount);
				updateinvoicelevelround(finalamount1, diffround);
			}

		}, function(error) {
			alert("Error in binding Bank Name : " + error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == "Android") {
		
		window.plugins.DataBaseHelper.select(Qry,
				function(result) {
					if (result.array != undefined) {
						result = $.map(result.array, function(item, index) {
							return [ [ item.totalinvoiceamount,
									item.totalpromoamount ] ];
						});
						if (result.length > 0) {
							var finalamount = eval(result[0][0]);
							var finalamount1;
							var value=finalamount.toString().split(".")[0];
							var decimal=finalamount.toString().split(".")[1];
							if(decimal!=null && decimal!=undefined && decimal!=0){
								
								var decimal=eval("."+decimal);
								var Qry = "select CAST(result AS VARCHAR) result from roundingvals where "+decimal+">=minval and  "+decimal+"<= maxval";
								console.log(Qry);
								if (platform == "iPad") {
									Cordova.exec(function(result) {
										if (result.length > 0) {
											
										}
								
									}, function(error) {
										alert("Error in binding Bank Name : " + error);
									}, "PluginClass", "GetdataMethod", [ Qry ]);
								} else if (platform == "Android") {
									window.plugins.DataBaseHelper.select(Qry, function(result) {
										if (result.array != undefined) {
											var result = $.map(result.array, function(item, index) {
												return [ [ item.result] ];
											});
											if (result.length > 0) {
												
												var roundingoffvalue=sessionStorage.getItem("roundingoffvalue")?sessionStorage.getItem("roundingoffvalue"):0;
												
												if(eval(roundingoffvalue)==0){ //normal rounding based on Roundingvals table
													finalamount1=eval(value)+eval(result[0][0]);
												}else if(eval(roundingoffvalue)==1){ //downward rounding
													
													if(eval(result[0][0])>decimal){
														finalamount1=eval(value)+eval(result[0][0])-(0.25);
													}else{
														finalamount1=eval(value)+eval(result[0][0]);
													}
													
												}else if(eval(roundingoffvalue)==2){//upward rounding
													
													if(eval(result[0][0])<decimal){
														finalamount1=eval(value)+eval(result[0][0])+(0.25);
													}else{
														finalamount1=eval(value)+eval(result[0][0]);
													}
													
												}
											}else{
												finalamount1=finalamount;
											}
											var diffround = eval(finalamount1)
											- eval(finalamount);
											updateinvoicelevelround(finalamount1, diffround);
										}
								
									}, function() {
										console.warn("Error calling plugin");
									});
								}
							}else{
								var diffround=0;
								finalamount1=finalamount;
								updateinvoicelevelround(finalamount1, diffround);
								
							}
						
						}
					}

				}, function() {
					console.warn("Error calling plugin");
				});
	}
}
function getRoundingline() {
	

	var Qry = "SELECT roundnetamount,roundingoffvalue FROM customermaster WHERE customercode="
			+ sessionStorage.getItem("customerid");
	// alert(Qry);
	console.log(Qry);
	if (platform == "iPad") {
		Cordova.exec(function(result) {
			if (result.length > 0) {
				if (result[0][0] == 1) {
					applyrounding(result[0][1]);
				} else
					getRoundinginvoice();
			}

		}, function(error) {
			alert("Error in binding Bank Name : " + error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == "Android") {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			if (result.array != undefined) {
				result = $.map(result.array, function(item, index) {
					return [ [ item.roundnetamount, item.roundingoffvalue ] ];
				});
				if (result.length > 0) {
					if (result[0][0] == 1) {
						applyrounding(result[0][1]);
					} 
					else if(result[0][0] == 2){
						UpdateTotalInvoiceAmount(0,1);
					}
					else
					{
						UpdateTotalInvoiceAmount(0,0);
						//redirect_rounding();
						
					}	
						
				}
			}

		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function applyrounding(roundingamount,flag) {
	var Qry = "SELECT salesqty,invoicedetail.salesprice,invoicedetail.salescaseprice,unitspercase,ifnull(invoicedetail.promoamount,0) promoamount,invoicedetail.itemcode FROM invoicedetail join itemmaster on itemmaster.actualitemcode=invoicedetail.itemcode WHERE routekey="
			+ sessionStorage.getItem("RouteKey")
			+ " AND visitkey="
			+ sessionStorage.getItem("VisitKey");
	if (platform == "iPad") {
		Cordova.exec(
				function(result) {
					if (result.length > 0) {
						for (i = 0; i < result.length; i++) {
							var units = parseInt(eval(result[0][0])
									% eval(result[0][3]));
							var cases = parseInt(eval(result[0][0])
									/ eval(result[0][3]));
							var salesamount = eval(cases * eval(result[0][2]))
									+ eval(units * eval(result[0][1]));
							var promoamount = eval(result[0][4]);
							var finalamount = eval(salesamount)
									- eval(promoamount);
							var finalamount1 = customrounding(finalamount,
									roundingamount);
							console.log("finalamount1" + finalamount1);
							var diffround = eval(finalamount1)
									- eval(finalamount);

							console.log("diffround" + diffround);
							var itemcode = eval(result[0][5]);
							if (i == result.length - 1)
								flag = true;
							else
								flag = false;
							updateinvoiceround(finalamount1, itemcode,
									diffround, flag);
						}

					}

				}, function(error) {
					alert("Error in binding Bank Name : " + error);
				}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == "Android") {
		window.plugins.DataBaseHelper.select(Qry,
				function(result) {
					if (result.array != undefined) {
						result = $.map(result.array, function(item, index) {
							return [ [ item.salesqty, item.salesprice,
									item.salescaseprice, item.unitspercase,
									item.promoamount, item.itemcode ] ];
						});
						getRoundingForInvoiceDetail(result,roundingamount);
					}
				}, function() {
					console.warn("Error calling plugin");
				});
	}
}

function getRoundingForInvoiceDetail(resultData,roundingamount){
	
	var result=resultData.shift();
	var units = parseInt(eval(result[0])
			% eval(result[3]));
	var cases = parseInt(eval(result[0])
			/ eval(result[3]));
	var salesamount = eval(cases
			* eval(result[2]))
			+ eval(units * eval(result[1]));
	var promoamount = eval(result[4]);
	var finalamount = eval(salesamount)
			- eval(promoamount);
	var finalamount1;
	
	var itemcode = eval(result[5]);
	var value=finalamount.toString().split(".")[0];
	var decimal=finalamount.toString().split(".")[1];
	
	if(decimal!=null && decimal!=undefined && decimal!=0){
		var decimal=eval("."+decimal);
		
		var Qry = "select CAST(result AS VARCHAR) result from roundingvals where "+decimal+">=minval and  "+decimal+"<= maxval";
		console.log(Qry);
		if (platform == "iPad") {
			Cordova.exec(function(result) {
				if (result.length > 0) {
					
				}
		
			}, function(error) {
				alert("Error in binding Bank Name : " + error);
			}, "PluginClass", "GetdataMethod", [ Qry ]);
		} else if (platform == "Android") {
			window.plugins.DataBaseHelper.select(Qry, function(result) {
				if (result.array != undefined) {
					var result = $.map(result.array, function(item, index) {
						return [ [ item.result] ];
					});
					if (result.length > 0) {
						var roundingoffvalue=sessionStorage.getItem("roundingoffvalue")?sessionStorage.getItem("roundingoffvalue"):0;
						
						if(eval(roundingoffvalue)==0){ //normal rounding based on Roundingvals table
							finalamount1=eval(value)+eval(result[0][0]);
						}else if(eval(roundingoffvalue)==1){ //downward rounding
							
							if(eval(result[0][0])>decimal){
								finalamount1=eval(value)+eval(result[0][0])-(0.25);
							}else{
								finalamount1=eval(value)+eval(result[0][0]);
							}
							
						}else if(eval(roundingoffvalue)==2){//upward rounding
							
							if(eval(result[0][0])<decimal){
								finalamount1=eval(value)+eval(result[0][0])+(0.25);
							}else{
								finalamount1=eval(value)+eval(result[0][0]);
							}
							
						}
					}else{
						finalamount1=finalamount;
					}
					
					var diffround = eval(finalamount1)
					- eval(finalamount);
					updateinvoiceround(finalamount1, itemcode,
					diffround, resultData,roundingamount);
				}
		
			}, function() {
				console.warn("Error calling plugin");
			});
		}
	}else{
		
		var diffround=0;
		finalamount1=finalamount;
		updateinvoiceround(finalamount1, itemcode,
				diffround, resultData,roundingamount);
		
		
	}
	
}

function updateinvoiceround(amount, itemcode, diffround, resultData,roundingamount) {
	diffround=eval(diffround).toFixed(sessionStorage.getItem("decimalplace"));
	var updateqry = "update invoicedetail set amount=" + amount
			+ ",diffround=" + diffround + " where itemcode=" + itemcode
			+ " and routekey=" + sessionStorage.getItem("RouteKey")
			+ " AND visitkey=" + sessionStorage.getItem("VisitKey");
	//alert(updateqry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if(resultData.length>0){
				getRoundingForInvoiceDetail(resultData);
			}else{
				getRoundinginvoice();
			}
			// navigator.notification.alert("Insert record successfully");

		}, function(error) {
			navigator.notification
					.alert("Error insert record in sigcapturedata");
		}, "PluginClass", "InsertUpdateMethod", [ updateqry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(updateqry, function(result) {
			if(resultData.length>0){
				getRoundingForInvoiceDetail(resultData,roundingamount);
			}else{
				updateTotalSalesAmount();
				
			}
			
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}

function updateTotalSalesAmount(){
			var updateqry = "UPDATE invoiceheader set totalsalesamount=(select sum(amount+ifnull(promoamount,0)) from invoicedetail where visitkey="+ sessionStorage.getItem("VisitKey")+") where visitkey="+ sessionStorage.getItem("VisitKey");
			//alert(updateqry);
			if (platform == 'iPad') {
				Cordova.exec(function(result) {
			
					redirect_rounding();
		
			}, function(error) {
				navigator.notification
						.alert("Error insert record in sigcapturedata");
			}, "PluginClass", "InsertUpdateMethod", [ updateqry ]);
		} else if (platform == 'Android') {
			window.plugins.DataBaseHelper.insert(updateqry, function(result) {
				//getRoundinginvoice();
				UpdateTotalInvoiceAmount(0,0); 
			}, function() {
			console.warn("Error calling plugin");
			});
		}
	
}


function getSaleAmount(){
	
	var Qry = "select totalinvoiceamount from invoiceheader where visitkey="+ sessionStorage.getItem("VisitKey");
		// alert(Qry);
		console.log(Qry);
		if (platform == "iPad") {
			Cordova.exec(function(result) {
				
		
			}, function(error) {
				alert("Error in binding Bank Name : " + error);
			}, "PluginClass", "GetdataMethod", [ Qry ]);
		} else if (platform == "Android") {
			window.plugins.DataBaseHelper.select(Qry, function(result) {
				if (result.array != undefined) {
					result = $.map(result.array, function(item, index) {
						return [ [ item.totalinvoiceamount] ];
					});
					if (result.length > 0) {
						alert(result[0][0]);
							
					}
				}
		
			}, function() {
				console.warn("Error calling plugin");
			});
		}

	
}


function updateinvoicelevelround(amount, diffround) {
	diffround=eval(diffround).toFixed(sessionStorage.getItem("decimalplace"));
	var updateqry = "update invoiceheader set totalinvoiceamount=" + amount
			+ ",diffround=" + diffround + " where routekey="
			+ sessionStorage.getItem("RouteKey") + " AND visitkey="
			+ sessionStorage.getItem("VisitKey");
	//alert(updateqry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			/*
			 * var redire = localStorage.getItem("roundredirect"); if(redire ==
			 * 'signature') getSignature(); else if(redire == 'cash')
			 * getrecord()
			 */
			redirect_rounding();

		}, function(error) {
			navigator.notification
					.alert("Error insert record in sigcapturedata");
		}, "PluginClass", "InsertUpdateMethod", [ updateqry ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper.insert(updateqry, function(result) {
			/*
			 * var redire = localStorage.getItem("roundredirect"); if(redire ==
			 * 'signature') getSignature(); else if(redire == 'cash')
			 * getrecord()
			 */
			redirect_rounding();
		}, function() {
			console.warn("Error calling plugin");
		});
	}
}


function checkSettlement() {
	var requireloadin;
	var unloaddone;
	var Qry = "SELECT COUNT(*) AS cnt,(SELECT requireloadin FROM routemaster WHERE routecode = "
			+ sessionStorage.getItem("RouteCode")
			+ " AND routetype IS NOT 2) requireloadin FROM inventorytransactiondetail itd JOIN inventorytransactionheader ith ON ith.detailkey = itd.detailkey AND ith.routekey = itd.routekey AND ith.routecode = "
			+ sessionStorage.getItem("RouteCode")
			+ " AND ith.salesmancode = "
			+ sessionStorage.getItem("SalesmanCode")
			+ " WHERE itd.routekey = "
			+ sessionStorage.getItem("RouteKey")
			+ " AND itd.transactiontypecode IN(5,6,7)";
	console.log(Qry);
	if (platform == 'iPad') {
		Cordova.exec(function(result) {
			if (eval(result[0][0]) > 0)
				unloaddone = true;
			else
				unloaddone = false;

			if (unloaddone == false) {
				navigator.notification
						.alert("Unload Not Done. Can't Do Settlement.");
			} else
				window.location = "../home/home.html";

		}, function(error) {
			navigator.notification.alert(error);
		}, "PluginClass", "GetdataMethod", [ Qry ]);
	} else if (platform == "Android") {
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			// alert(result.array);
			// alert(result.array[0].cnt);
			// alert(result.array[0].reuqireloadin);
			if (eval(result.array[0].cnt) > 0)
				unloaddone = true;
			else
				unloaddone = false;

			if (unloaddone == false) {
				navigator.notification
						.alert("Unload Not Done. Can't Do Settlement.");
			} else
				window.location = "../home/home.html";
			
			
		}, function() {
			console.warn("Error calling plugin");
		});
	}

}

// ---------------

// ---------------
function redirect_rounding() {

	var redire = localStorage.getItem("roundredirect");
	if (redire == 'signature'){
		getSignature();
	}
	else if (redire == 'cash')
	{
		getrecord();
	}else if(redire == 'print_option'){
		
		DeleteSalesTempData();
	} 
		
}

function disablebackkey() {
	/*
	 * document.addEventListener("backbutton", function(e){
	 * if($.mobile.activePage.is('#homepage')){ e.preventDefault();
	 * navigator.app.exitApp(); } else { navigator.app.backHistory() } },
	 * false);
	 */

	document.addEventListener("backbutton", function(e) {
		e.preventDefault();
	}, false);
}

function getDeviceDimention() {
    console.log("Device Dimention using PhoneGap");
    console.log("Width = " + window.innerWidth);
    console.log("Height = " + window.innerHeight);
}

function resizeWindow()
{	
	
//	if(window.innerwidth>=790)
//	{
	//wsurl=window.localStorage.getItem("wsurl");
	$(".ui-content").height(0);
	var screen =window.innerHeight;

	var header = $(".ui-header").hasClass("ui-header-fixed") ? $(".ui-header").outerHeight()  - 1 : $(".ui-header").outerHeight();

	var footer = $(".ui-footer").hasClass("ui-footer-fixed") ? $(".ui-footer").outerHeight() - 1 : $(".ui-footer").outerHeight();

	
	var contentCurrent = $(".ui-content").outerHeight() - $(".ui-content").height();
	var content;
	if(eval(screen)<750){
		 content = screen - header - footer - contentCurrent-$("#f1").outerHeight()-$("#f2").outerHeight()-20;
		
	}else{
		 content = screen - header - footer - contentCurrent-$("#f1").outerHeight()-$("#f2").outerHeight()-30;
		
	}

	$(".ui-content").height(content);
	$(".ui-content").css('width','90%');
	$(".ui-content").css('margin-left','auto');
	$(".ui-content").css('margin-right','auto');
//	  $('table tr th:contains("Cases"),table tr td:contains("Cases")').text("Outers");
//    $('table tr th:contains("Units"),table tr td:contains("Units")').text("Pieces");
//    $('table tr th:contains("Case Price"),table tr td:contains("Case Price")').text("Outer Price");
//    $('table tr th:contains("Unit Price"),table tr td:contains("Unit Price")').text("Piece Price");
//    $('table tr th:contains("UPC"),table tr td:contains("UPC")').text("UPO");
}



function resizeOrientationWindow()
{
	window.addEventListener("orientationchange",function() {
		window.setTimeout(function() {
				resizeWindow();  
			}, 500);
		    
	}, false);

}



function getLangText(text){
	
	if(sessionStorage.getItem("Language")=='AR'){
		if(transaltions[text]==undefined){
			navigator.notification.alert(text);
		}else{
			navigator.notification.alert(transaltions[text]);
		}
	}else{
		navigator.notification.alert(text);
	}
	
	
}
function getLangTextdata(text){
	
	if(sessionStorage.getItem("Language")=='AR'){
		if(transaltions[text]==undefined){
			return text;
		}else{
			return transaltions[text];
		}
	}else{
		
		return text;
	}
	
	
}

function CheckLoadMessage(url,checkLoad){ 
	var routeCode=sessionStorage.getItem("RouteCode");
	var Qry="select (select Distinct loadperiodnumber From startingloaddetail where routecode=" + routeCode + " and status = 1 order by loadperiodnumber) usedload,(select Distinct loadperiodnumber From startingloaddetail where routecode=" + routeCode + " and status = 0 order by loadperiodnumber Limit 1) nextload"
	
	console.log(Qry);
    if(platform == "iPad")
    {
            Cordova.exec(function(result) {
               if(result.length > 0)
                {
                   
                          
                }                       
              
            },
            function(error) {
                navigator.notification.alert(error);
            },
            "PluginClass",
            "GetdataMethod",
            [Qry]);
    }
    else if(platform == "Android")
    {   
    	window.plugins.DataBaseHelper.select(Qry, function(result) {     
        	if(result.array != undefined)
        	{
                result = $.map(result.array, function(item, index) {
                    return [[item.usedload, item.nextload]];
                });    

                if (result.length > 0) { 
						
                	if(eval(result[0][1])>0 && checkLoad)
                	{
                		
                		 getLangText("New Load Is Available , Please Process It To Continue.");
                		
                	}else{
                		//alert('url' +url);
                		if(url=='inventory')
                			checkLoadRequest();
                		else	
                		//	checkTripStart(url); // added to Check date if changed manually
                			window.location=url; // org line sujee commented 
                	}
                }
            }  
        
        
        },
        function() {
            console.warn("Error calling plugin");
        });
    }
	
}


function checkTripStart(url) {   
    
    var qry = "select routestartdate as startdate from startendday where routecode="+sessionStorage.getItem("RouteCode");
    var tdate =  getTabletDate();
    
    
    window.plugins.DataBaseHelper.select(qry,function(result)
					{
					 	 result = $.map(result.array, function (item, index) {
          
          				return [[item.startdate]];
      				});
		                 		
		                 		 
		                 	/*	 not needed don;tuse this function 
		                 	 * if(tdate != result[0][0])
		                 			 {
		                 			     getLangText("Please Check Your Device Date.");
		                 			    
		                 			 }
		                 		  else 
		                 			  {
		                 			     window.location = url;
		                 			  }
		                 		*/
		                 		 window.location = url;
					},
					function()
					{
				   	 console.warn("Error calling plugin");
					});
    

}

function daydiff(first, second) {
	return Math.round((second-first)/(1000*60*60*24));
}
/*
 * @method disableBottomNavBar
 * Function to disable the bottom navigation bars
 * */
function disableBottomNavBar(){
	$(".ui-navbar ul li a").each(function(index,item){
		$("#"+item.id+"").attr("onclick","");
		});
}


/*
*@method updateItemLevelTax
*Function to update the item level tax for each item
*@param{url}
*/
function updateItemLevelTax(url){ //alert("updateItemLevelTax");
	
	var Qry="UPDATE invoicedetail  SET "
    	+"salesitemexcisetax=(CASE WHEN "+sessionStorage.getItem("applytax")+" = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.salesqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.salesqty,0))/ im.unitspercase) as int)*sd.salescaseprice) + (((COALESCE(sd.salesqty,0))% im.unitspercase)*sd.salesprice))*(tm.taxpercentage/100) "
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.salesqty,0)))*sd.salesprice)*tm.taxpercentage/100 END"
			+" as salesexcisetax FROM invoicedetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey1 WHERE sd.itemcode=invoicedetail.itemcode) END),"				
					
		+" returnitemexcisetax=(CASE WHEN "+sessionStorage.getItem("applytax")+" = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.returnqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.returnqty,0))/ im.unitspercase) as int)*sd.goodreturncaseprice) + (((COALESCE(sd.returnqty,0))% im.unitspercase)*sd.goodreturnprice))*(tm.taxpercentage/100) "
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.returnqty,0)))*sd.goodreturnprice)*tm.taxpercentage/100 END"
			+" as returnexcisetax FROM invoicedetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey1 WHERE sd.itemcode=invoicedetail.itemcode) END),"
					
		+"damageditemexcisetax=(CASE WHEN "+sessionStorage.getItem("applytax")+" = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.damagedqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.damagedqty,0))/ im.unitspercase) as int)*sd.returncaseprice) + (((COALESCE(sd.damagedqty,0))% im.unitspercase)*sd.returnprice))*(tm.taxpercentage/100)"
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.damagedqty,0)))*sd.returnprice)*tm.taxpercentage/100 END"
			+" as damagedexcisetax FROM invoicedetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey1 WHERE sd.itemcode=invoicedetail.itemcode) END),"
			
		+"promoitemexcisetax=(CASE WHEN 0 = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.freesampleqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.freesampleqty,0))/ im.unitspercase) as int)*sd.salescaseprice) + (((COALESCE(sd.freesampleqty,0))% im.unitspercase)*sd.salesprice))*(tm.taxpercentage/100)"
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.freesampleqty,0)))*sd.salesprice)*tm.taxpercentage/100 END "
			+"as promofreeexcisetax FROM invoicedetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey1 WHERE sd.itemcode=invoicedetail.itemcode) END),"
			
		+"fgitemexcisetax=(CASE WHEN 0 = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN(COALESCE(sd.manualfreeqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.manualfreeqty,0))/ im.unitspercase) as int)*sd.salescaseprice) + (((COALESCE(sd.manualfreeqty,0))% im.unitspercase)*sd.salesprice))*(tm.taxpercentage/100) "
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.manualfreeqty,0)))*sd.salesprice)*tm.taxpercentage/100 END "
			+" as focexcisetax FROM invoicedetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey1 WHERE sd.itemcode=invoicedetail.itemcode) END),"
		
		 +"buybackexcisetax=(CASE WHEN 0 = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN(COALESCE(sd.returnfreeqty,0))*tm.taxpercentage/100 "
				+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.returnfreeqty,0))/ im.unitspercase) as int)*sd.goodreturncaseprice) + (((COALESCE(sd.returnfreeqty,0))% im.unitspercase)*sd.goodreturnprice))*(tm.taxpercentage/100) "
				+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.returnfreeqty,0)))*sd.goodreturnprice)*tm.taxpercentage/100 END "
				+" as buybackexcisetax FROM invoicedetail sd INNER JOIN itemmaster im ON "
				+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
				+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey1 WHERE sd.itemcode=invoicedetail.itemcode) END),"
			
		+"salesitemgsttax=(CASE WHEN "+sessionStorage.getItem("applytax")+" = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.salesqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN (((cast(((COALESCE(sd.salesqty,0))/ im.unitspercase)as int)*sd.salescaseprice +(((COALESCE(sd.salesqty,0)))% im.unitspercase)*sd.salesprice))-coalesce(sd.promovalue,0))*tm.taxpercentage/100  "
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((((COALESCE(sd.salesqty,0)))*sd.salesprice))-coalesce(sd.promovalue,0))*tm.taxpercentage/100 END"
			+" as salesitemgsttax FROM invoicedetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey2 WHERE sd.itemcode=invoicedetail.itemcode) END),"				
					
		+" returnitemgsttax=(CASE WHEN "+sessionStorage.getItem("applytax")+" = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.returnqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN  (CASE WHEN COALESCE(sd.returnqty,0)=0 THEN (cast(((COALESCE(sd.returnqty,0))/ im.unitspercase)as int)*sd.goodreturncaseprice +((COALESCE(sd.returnqty,0))% im.unitspercase)*sd.goodreturnprice) ELSE ((cast(((COALESCE(sd.returnqty,0))/ im.unitspercase)as int)*sd.goodreturncaseprice +((COALESCE(sd.returnqty,0))% im.unitspercase)*sd.goodreturnprice)-coalesce(sd.returnpromovalue,0))END)*tm.taxpercentage/100   "
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (CASE WHEN COALESCE(sd.returnqty,0)=0 THEN ((COALESCE(sd.returnqty,0))*sd.goodreturnprice) ELSE (((COALESCE(sd.returnqty,0))*sd.goodreturnprice)-coalesce(sd.returnpromovalue,0))END)*tm.taxpercentage/100 END"
			+" as returnitemgsttax FROM invoicedetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey2 WHERE sd.itemcode=invoicedetail.itemcode) END),"
					
		+"damageditemgsttax=(CASE WHEN "+sessionStorage.getItem("applytax")+" = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.damagedqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN (CASE WHEN COALESCE(sd.damagedqty,0)=0 THEN (cast(((COALESCE(sd.damagedqty,0))/ im.unitspercase)as int)*sd.returncaseprice +((COALESCE(sd.damagedqty,0))% im.unitspercase)*sd.returnprice) ELSE ((cast(((COALESCE(sd.damagedqty,0))/ im.unitspercase)as int)*sd.returncaseprice +((COALESCE(sd.damagedqty,0))% im.unitspercase)*sd.returnprice)-coalesce(sd.returnpromovalue,0))END)*tm.taxpercentage/100   "
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (CASE WHEN COALESCE(sd.damagedqty,0)=0 THEN ((COALESCE(sd.damagedqty,0))*sd.returnprice) ELSE (((COALESCE(sd.damagedqty,0))*sd.returnprice)-coalesce(sd.returnpromovalue,0))END)*tm.taxpercentage/100 END"
			+" as damageditemgsttax FROM invoicedetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey2 WHERE sd.itemcode=invoicedetail.itemcode) END),"
			
		+"promoitemgsttax=(CASE WHEN 0 = 0 THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.freesampleqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN (((cast(((COALESCE(sd.freesampleqty,0))/ im.unitspercase)as int)*sd.salescaseprice +(((COALESCE(sd.freesampleqty,0)))% im.unitspercase)*sd.salesprice))-coalesce(sd.promovalue,0))*tm.taxpercentage/100  "
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((((COALESCE(sd.freesampleqty,0)))*sd.salesprice))-coalesce(sd.promovalue,0))*tm.taxpercentage/100 END"
			+" as promoitemgsttax FROM invoicedetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey2 WHERE sd.itemcode=invoicedetail.itemcode) END),"				
			
		+"fgitemgsttax=(CASE WHEN 0 = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.manualfreeqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN (((cast(((COALESCE(sd.manualfreeqty,0))/ im.unitspercase)as int)*sd.salescaseprice +(((COALESCE(sd.manualfreeqty,0)))% im.unitspercase)*sd.salesprice))-coalesce(sd.promovalue,0))*tm.taxpercentage/100  "
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((((COALESCE(sd.manualfreeqty,0)))*sd.salesprice))-coalesce(sd.promovalue,0))*tm.taxpercentage/100 END"
			+" as fgitemgsttax FROM invoicedetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey2 WHERE sd.itemcode=invoicedetail.itemcode) END),"				
			
		+"buybackgsttax=(CASE WHEN 0 = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.returnfreeqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN (((cast(((COALESCE(sd.returnfreeqty,0))/ im.unitspercase)as int)*sd.salescaseprice +(((COALESCE(sd.returnfreeqty,0)))% im.unitspercase)*sd.salesprice))-coalesce(sd.promovalue,0))*tm.taxpercentage/100  "
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((((COALESCE(sd.returnfreeqty,0)))*sd.salesprice))-coalesce(sd.promovalue,0))*tm.taxpercentage/100 END"
			+" as buybackgsttax FROM invoicedetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey2 WHERE sd.itemcode=invoicedetail.itemcode) END)"		
			
			+" where visitkey = "+sessionStorage.getItem('VisitKey')+" and routekey = " + sessionStorage.getItem('RouteKey') + "";
			
	console.log("Qry%%%%%"+Qry);	
	if (platform == 'Android') 
 {
     window.plugins.DataBaseHelper.select(Qry, function(result) {       
     	//updateTotalLineItemTax(url);
    	 updateRoundingInvoiceDetails(url);
       
     },
		function() {
		    console.warn("Error calling plugin");
		});
 }
}

function updateRoundingInvoiceDetails(url){
	
	 var decimalplace = sessionStorage.getItem("decimalplace");
	 if(decimalplace==null || decimalplace==undefined){
		 decimalplace=3;
	 }
	 $.mobile.hidePageLoadingMsg();  
	 $.mobile.showPageLoadingMsg(); 
	try{
		var Qry="select CAST(itemcode AS VARCHAR) itemcode,ifnull(salesitemgsttax,0) salesitemgsttax,ifnull(salesitemexcisetax,0) salesitemexcisetax,ifnull(returnitemexcisetax,0) returnitemexcisetax,ifnull(returnitemgsttax,0) returnitemgsttax,ifnull(damageditemexcisetax,0) damageditemexcisetax,ifnull(damageditemgsttax,0) damageditemgsttax,ifnull(fgitemexcisetax,0) fgitemexcisetax,ifnull(fgitemgsttax,0) fgitemgsttax,ifnull(promoitemexcisetax,0) promoitemexcisetax,ifnull(promoitemgsttax,0) promoitemgsttax from invoicedetail where visitkey="+sessionStorage.getItem("VisitKey");
		window.plugins.DataBaseHelper.select(Qry, function(result) {
	         
	         if(!$.isEmptyObject(result))
	         {
	        	 $.each(result.array, function(index, item) {
	        		
	        		 
	        		 //eval((Math.round(num * 100) / 100)).toFixed(2)
	        		 var salesitemexcisetax=eval((Math.round(item.salesitemexcisetax * 100) / 100)).toFixed(decimalplace);
	        		 var salesitemgsttax=eval((Math.round(item.salesitemgsttax * 100) / 100)).toFixed(decimalplace);
	        		 var returnitemexcisetax=eval((Math.round(item.returnitemexcisetax * 100) / 100)).toFixed(decimalplace);
	        		 var returnitemgsttax=eval((Math.round(item.returnitemgsttax * 100) / 100)).toFixed(decimalplace);
	        		 var damageditemexcisetax=eval((Math.round(item.damageditemexcisetax * 100) / 100)).toFixed(decimalplace);
	        		 var damageditemgsttax=eval((Math.round(item.damageditemgsttax * 100) / 100)).toFixed(decimalplace);
	        		
	        		 var fgitemexcisetax=eval((Math.round(item.fgitemexcisetax * 100) / 100)).toFixed(decimalplace);
	        		 var fgitemgsttax=eval((Math.round(item.fgitemgsttax * 100) / 100)).toFixed(decimalplace);
	        		 var promoitemexcisetax=eval((Math.round(item.promoitemexcisetax * 100) / 100)).toFixed(decimalplace);
	        		 var promoitemgsttax=eval((Math.round(item.promoitemgsttax * 100) / 100)).toFixed(decimalplace);
	        		 var itemcode=item.itemcode;
	        		 var QryUpdate="UPDATE invoicedetail set salesitemexcisetax='"+salesitemexcisetax+"',salesitemgsttax='"+salesitemgsttax+"',returnitemexcisetax='"+returnitemexcisetax+"',returnitemgsttax='"+returnitemgsttax+"',damageditemexcisetax='"+damageditemexcisetax+"',damageditemgsttax='"+damageditemgsttax+"',fgitemexcisetax='"+fgitemexcisetax+"',fgitemgsttax='"+fgitemgsttax+"',promoitemexcisetax='"+promoitemexcisetax+"',promoitemgsttax='"+promoitemgsttax+"' where visitkey="+sessionStorage.getItem("VisitKey")+" and itemcode="+itemcode; 
	        			 		
	    			window.plugins.DataBaseHelper.insert(QryUpdate, function(result1) {
	    				
	    				if(index==(result.array.length-1)){
	    					$.mobile.hidePageLoadingMsg();  
	    					updateTotalLineItemTax(url);
	    				}
	    				
	    		    },
	    		    function() {
	    		    console.warn("Error calling plugin");
	    		    });
	        		 
	        		 
	        		 	
	        	 });
	         }
	     	},
			function() {
			    console.warn("Error calling plugin");
			});
		
		
		
	}catch(e){
		$.mobile.hidePageLoadingMsg();  
		updateTotalLineItemTax(url);
	} 
	
	
	
}

/*
*@method updateTotalLineItemTax
*Function to update invoiceheader table itemlinetaxamount field with total line tax amount
*@param{url}
*/
function updateTotalLineItemTax(url){
	console.log("jibin: updateTotalLineItemTax");
	 var decimalplace = sessionStorage.getItem("decimalplace");
	 if(decimalplace==null || decimalplace==undefined){
		 decimalplace=3;
	 }
	/*var Qry="UPDATE invoiceheader set itemlinetaxamount =ROUND(((Select COALESCE(SUM(salesitemexcisetax),0) +COALESCE(SUM(salesitemgsttax),0)-COALESCE(SUM(returnitemexcisetax),0) -COALESCE(SUM(returnitemgsttax),0) -COALESCE(SUM(damageditemexcisetax),0)-COALESCE(SUM(damageditemgsttax),0) + COALESCE(SUM(fgitemexcisetax),0) +COALESCE(SUM(fgitemgsttax),0) +COALESCE(SUM(promoitemexcisetax),0) +COALESCE(SUM(promoitemgsttax),0) -COALESCE(SUM(buybackexcisetax),0) -COALESCE(SUM(buybackgsttax),0)  from invoicedetail "
			+"where invoicedetail.routekey="+sessionStorage.getItem('RouteKey')
			+" and invoicedetail.visitkey="+sessionStorage.getItem('VisitKey')+")),"+decimalplace+")"
			+"where routekey="+sessionStorage.getItem('RouteKey')+" and visitkey="+sessionStorage.getItem('VisitKey');
	*/
	 var Qry="UPDATE invoiceheader set itemlinetaxamount =ROUND(((Select COALESCE(SUM(ROUND(salesitemexcisetax,"+decimalplace+")),0) +COALESCE(SUM(ROUND(salesitemgsttax,"+decimalplace+")),0)-COALESCE(SUM(ROUND(returnitemexcisetax,"+decimalplace+")),0) -COALESCE(SUM(ROUND(returnitemgsttax,"+decimalplace+")),0) -COALESCE(SUM(ROUND(damageditemexcisetax,"+decimalplace+")),0)-COALESCE(SUM(ROUND(damageditemgsttax,"+decimalplace+")),0) + COALESCE(SUM(ROUND(fgitemexcisetax,"+decimalplace+")),0) +COALESCE(SUM(ROUND(fgitemgsttax,"+decimalplace+")),0) +COALESCE(SUM(ROUND(promoitemexcisetax,"+decimalplace+")),0) +COALESCE(SUM(ROUND(promoitemgsttax,"+decimalplace+")),0) -COALESCE(SUM(ROUND(buybackexcisetax,"+decimalplace+")),0) -COALESCE(SUM(ROUND(buybackgsttax,"+decimalplace+")),0)  from invoicedetail "
	 				+"where invoicedetail.routekey="+sessionStorage.getItem('RouteKey')
	 				+" and invoicedetail.visitkey="+sessionStorage.getItem('VisitKey')+")),"+decimalplace+")"
	 				+"where routekey="+sessionStorage.getItem('RouteKey')+" and visitkey="+sessionStorage.getItem('VisitKey');
	 		
	 
	if (platform == 'Android') 
 {
     window.plugins.DataBaseHelper.select(Qry, function(result) {    
    	updateInvoiceLevelTax(url);
       
     },
		function() {
		    console.warn("Error calling plugin");
		});
 }
}

/*
*@method updateInvoiceLevelTax
*Function to check and update invoice level tax
*@param{url}
*/
function updateInvoiceLevelTax(url){
	
	var Qry="UPDATE invoiceheader set totaltaxesamount= (select taxAmount from "
	+"(select cm.custtaxkey1,tm.taxtype,tm.taxpercentage,case when tm.taxtype=1 then "
	+" ( (COALESCE(ih.totalsalesamount,0)-COALESCE(ih.totalpromoamount,0)+COALESCE(ih.itemlinetaxamount,0) +COALESCE(ih.diffround,0))*tm.taxpercentage/100)  else 0 END taxAmount " 
	+"from customermaster cm inner join taxmaster  tm on cm.custtaxkey1=tm.taxcode "
	+"inner join invoiceheader ih on routekey="+sessionStorage.getItem('RouteKey')
	+" and visitkey="+sessionStorage.getItem('VisitKey')+" where  cm.customercode="+sessionStorage.getItem('customerid')
	+") where routekey="+sessionStorage.getItem('RouteKey')+" and visitkey="+sessionStorage.getItem('VisitKey')+")";
	
	if (platform == 'Android') 
 {
     window.plugins.DataBaseHelper.select(Qry, function(result) {     
    	 window.location = url;
     },
		function() {
		    console.warn("Error calling plugin");
		});
 }
}

/*
 * @method updateExciseTaxAndVatForOrderDetail
 * Function to update the excise tax and vat in salesorder detail
 * Excise Tax is (OrderQty+returnqty+damagedqty.freesampleqty+manualfreeqty)*TaxPercentage/100 from taxmaster , where taxbase = 2 and taxkey1
 * Vat is calculated as percentage from taxmaster vat% where taxcode=itemtaxkey2
 * (salesprice*(OrderQty+returnqty+damagedqty+freesampleqty+manualfreeqty)-discount)*tax percentage as vat
 * promofreeexcisetax,focexcisetax,promofreevat,focvat - columns used for printing only.holds the taxes for free items
 * @param{url} the url to which , screen navigates after applying tax
 * */
function updateExciseTaxAndVatForOrderDetail(url){alert("updateExciseTaxAndVatForOrderDetail");
	
	var Qry="UPDATE salesorderdetail  SET "
    	+"salesorderexcisetax=(CASE WHEN "+sessionStorage.getItem("applytax")+" = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.salesqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.salesqty,0))/ im.unitspercase) as int)*sd.salescaseprice) + (((COALESCE(sd.salesqty,0))% im.unitspercase)*sd.salesprice))*(tm.taxpercentage/100) "
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.salesqty,0)))*sd.salesprice)*tm.taxpercentage/100 END"
			+" as salesorderexcisetax FROM salesorderdetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey1 WHERE sd.itemcode=salesorderdetail.itemcode) END),"				
					
		+" returnexcisetax=(CASE WHEN "+sessionStorage.getItem("applytax")+" = 0 THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.returnqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.returnqty,0))/ im.unitspercase) as int)*sd.goodreturncaseprice) + (((COALESCE(sd.returnqty,0))% im.unitspercase)*sd.goodreturnprice))*(tm.taxpercentage/100) "
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.returnqty,0)))*sd.goodreturnprice)*tm.taxpercentage/100 END"
			+" as returnexcisetax FROM salesorderdetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey1 WHERE sd.itemcode=salesorderdetail.itemcode) END),"
					
		+"damagedexcisetax=(CASE WHEN "+sessionStorage.getItem("applytax")+" = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.damagedqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.damagedqty,0))/ im.unitspercase) as int)*sd.returncaseprice) + (((COALESCE(sd.damagedqty,0))% im.unitspercase)*sd.returnprice))*(tm.taxpercentage/100) "
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.damagedqty,0)))*sd.returnprice)*tm.taxpercentage/100 END"
			+" as damagedexcisetax FROM salesorderdetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey1 WHERE sd.itemcode=salesorderdetail.itemcode) END),"
			
		+"promoexcisetax=(CASE WHEN 0 = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.freesampleqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.freesampleqty,0))/ im.unitspercase) as int)*sd.salescaseprice) + (((COALESCE(sd.freesampleqty,0))% im.unitspercase)*sd.salesprice))*(tm.taxpercentage/100)"
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.freesampleqty,0)))*sd.salesprice)*tm.taxpercentage/100 END "
			+"as promoexcisetax FROM salesorderdetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey1 WHERE sd.itemcode=salesorderdetail.itemcode) END),"
			
		+"fgexcisetax=(CASE WHEN 0 = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN(COALESCE(sd.manualfreeqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.manualfreeqty,0))/ im.unitspercase) as int)*sd.salescaseprice) + (((COALESCE(sd.manualfreeqty,0))% im.unitspercase)*sd.salesprice))*(tm.taxpercentage/100) "
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.manualfreeqty,0)))*sd.salesprice)*tm.taxpercentage/100 END "
			+" as focexcisetax FROM salesorderdetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey1 WHERE sd.itemcode=salesorderdetail.itemcode) END),"
			
			
		+"salesordervat=(CASE WHEN "+sessionStorage.getItem("applytax")+" = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.salesqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.salesqty,0))/ im.unitspercase) as int)*sd.salescaseprice) + (((COALESCE(sd.salesqty,0))% im.unitspercase)*sd.salesprice)-coalesce(sd.promoamount,0))*(tm.taxpercentage/100)"
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.salesqty,0)))*sd.salesprice)*tm.taxpercentage/100 END"
			+" as salesordervat FROM salesorderdetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey2 WHERE sd.itemcode=salesorderdetail.itemcode) END),"				
					
		+" returnvat=(CASE WHEN "+sessionStorage.getItem("applytax")+" = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.returnqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.returnqty,0))/ im.unitspercase) as int)*sd.goodreturncaseprice) + (((COALESCE(sd.returnqty,0))% im.unitspercase)*sd.goodreturnprice))*(tm.taxpercentage/100) "
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.returnqty,0)))*sd.goodreturnprice)*tm.taxpercentage/100 END"
			+" as returnvat FROM salesorderdetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey2 WHERE sd.itemcode=salesorderdetail.itemcode) END),"
					
		+"damagedvat=(CASE WHEN "+sessionStorage.getItem("applytax")+" = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.damagedqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.damagedqty,0))/ im.unitspercase) as int)*sd.returncaseprice) + (((COALESCE(sd.damagedqty,0))% im.unitspercase)*sd.returnprice))*(tm.taxpercentage/100) "
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.damagedqty,0)))*sd.returnprice)*tm.taxpercentage/100 END"
			+" as damagedvat FROM salesorderdetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey2 WHERE sd.itemcode=salesorderdetail.itemcode) END),"
			
		+"promovat=(CASE WHEN 0 = 0  THEN 0  ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.freesampleqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.freesampleqty,0))/ im.unitspercase) as int)*sd.salescaseprice) + (((COALESCE(sd.freesampleqty,0))% im.unitspercase)*sd.salesprice))*(tm.taxpercentage/100)"
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.freesampleqty,0)))*sd.salesprice)*tm.taxpercentage/100 END"
			+" as promovat FROM salesorderdetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey2 WHERE sd.itemcode=salesorderdetail.itemcode) END),"	
			
       +"fgvat=(CASE WHEN 0 = 0  THEN 0 ELSE (SELECT CASE WHEN COALESCE(im.defaultsalesprice,0)>0 and tm.taxbase = 2 THEN (COALESCE(sd.manualfreeqty,0))*tm.taxpercentage/100 "
			+"WHEN im.unitspercase>1 and tm.taxbase = 1 THEN ( ( cast(( (COALESCE(sd.manualfreeqty,0))/ im.unitspercase) as int)*sd.salescaseprice) + (((COALESCE(sd.manualfreeqty,0))% im.unitspercase)*sd.salesprice))*(tm.taxpercentage/100)"
			+" WHEN im.unitspercase<=1 and tm.taxbase = 1 THEN (((COALESCE(sd.manualfreeqty,0)))*sd.salesprice)*tm.taxpercentage/100 END"
			+" as fgvat FROM salesorderdetail sd INNER JOIN itemmaster im ON "
			+"sd.itemcode=im.actualitemcode AND sd.visitkey="+sessionStorage.getItem('VisitKey')
			+" inner join taxmaster tm on tm.taxcode=im.itemtaxkey2 WHERE sd.itemcode=salesorderdetail.itemcode) END) where visitkey = "+sessionStorage.getItem('VisitKey')+" and routekey = " + sessionStorage.getItem('RouteKey') + "";
			
			
	
        console.log(Qry);
	
	
	window.plugins.DataBaseHelper.insert(Qry, function(result) {
		//updateExciseTaxAndVatForOrderHeader(url);
		updateRoundingDetails(url);
    },
    function() {
    console.warn("Error calling plugin");
    });
}

function updateRoundingDetails(url){
	
	 var decimalplace = sessionStorage.getItem("decimalplace");
	 if(decimalplace==null || decimalplace==undefined){
		 decimalplace=2;
	 }

	var Qry="select CAST(itemcode AS VARCHAR) itemcode,ifnull(salesordervat,0) salesordervat,ifnull(returnvat,0) returnvat,ifnull(damagedvat,0) damagedvat,ifnull(promovat,0) promovat,ifnull(fgvat,0) fgvat from salesorderdetail where visitkey="+sessionStorage.getItem("VisitKey");
	window.plugins.DataBaseHelper.select(Qry, function(result) {
       
       if(!$.isEmptyObject(result))
       {
      	 $.each(result.array, function(index, item) {
      		 
      	//eval((Math.round(num * 100) / 100)).toFixed(2)
      		 var salesordervat=eval((Math.round(item.salesordervat * 100) / 100)).toFixed(decimalplace);
      		 var returnvat=eval((Math.round(item.returnvat * 100) / 100)).toFixed(decimalplace);
      		 var damagedvat=eval((Math.round(item.damagedvat * 100) / 100)).toFixed(decimalplace);
      		 var promovat=eval((Math.round(item.promovat * 100) / 100)).toFixed(decimalplace);
      		 var fgvat=eval((Math.round(item.fgvat * 100) / 100)).toFixed(decimalplace);
      		 var itemcode=item.itemcode;
      		 var QryUpdate="UPDATE salesorderdetail set salesordervat='"+salesordervat+"',returnvat='"+returnvat+"',damagedvat='"+damagedvat+"',promovat='"+promovat+"',fgvat='"+fgvat+"' where visitkey="+sessionStorage.getItem("VisitKey")+" and itemcode="+itemcode; 
      			 		
  			window.plugins.DataBaseHelper.insert(QryUpdate, function(result1) {
  				
  				if(index==(result.array.length-1)){
  					
  					updateExciseTaxAndVatForOrderHeader(url);
  				}
  				
  		    },
  		    function() {
  		    console.warn("Error calling plugin");
  		    });
      		 
      		 
      		 	
      	 });
       }
   	},
		function() {
		    console.warn("Error calling plugin");
		});
	
	
}


/*
 * @method updateExciseTaxAndVatForOrderHeader
 * Function to update the TAX in salesorder header
 * @param{url}
 * */
function updateExciseTaxAndVatForOrderHeader(url){
	var Qry="UPDATE salesorderheader set " 
		+"totallineitemtax=(SELECT SUM(COALESCE(salesorderexcisetax,0))+SUM(COALESCE(salesordervat,0))-SUM(COALESCE(returnvat,0))-SUM(COALESCE(returnexcisetax,0))-SUM(COALESCE(damagedvat,0))-SUM(COALESCE(damagedexcisetax,0))+SUM(COALESCE(promovat,0))+SUM(COALESCE(promoexcisetax,0))+SUM(COALESCE(fgvat,0))+SUM(COALESCE(fgexcisetax,0)) from salesorderdetail where visitkey="+sessionStorage.getItem("VisitKey")+") "
		+"WHERE visitkey="+sessionStorage.getItem("VisitKey"); 
	 		console.log(Qry);
	 		alert(Qry);
	window.plugins.DataBaseHelper.insert(Qry, function(result) {
		 window.location = url;
		alert("updated tax value");
    },
    function() {
    console.warn("Error calling plugin");
    });
}

function checkPreviousCustomerCheckout(){
	$.mobile.showPageLoadingMsg();
	var log_id = "";
	
	//commented by AswinSuresh on 2025-08-12 .
	//var Qry1 = "select customercode,log_id from customervisitlog where log_enddate is null and log_endtime is null";
	var Qry1 = "select customercode,log_id,time(log_starttime) starttime from customervisitlog where  log_endtime is null";
	
	window.plugins.DataBaseHelper.select(Qry1,function(result)
            {
                if(result.array != undefined)
                	{
                	result = $.map(result.array, function (item, index) {
                        return [[item.customercode,item.log_id,item.starttime]];
                    });
                    
                    console.log("TAGY  "+JSON.stringify(result));
                    //alert(result.length);
                    
                    log_id = result[0][1];
                    //starttime = result[0][2];
                    //sessionStorage.setItem("starttime",starttime);
                    
                    if(result.length > 0){
                    	//alert("CHECK OUT NOT DONE");
                    	
                    	var qry2 = "select DISTINCT c.customercode,customername,pobox,alternatecode,ancustomercode,customeraddress1," +
                    			   "customeraddress2,customerphone,invoicepaymentterms,enablesigcapture,customeraddress3,0, fixedlatitude," +
                    			   "fixedlongitude, MAX(IFNULL(visitkey,0)) AS visitkey, IFNULL(creditlimitdays,0) creditlimitdays, " +
                    			   "IFNULL(creditlimit,0) creditlimit,  (select IFNULL(SUM(ROUND(invoicebalance,3)),0) balance " +
                    			   "from customerinvoice where customercode=c.customercode) as  balance, MIN(duedate) duedate," +
                    			   "totaltransactions,reportprintcontrol,(SELECT  date('now', 'localtime') > date(MIN(duedate)," +
                    			   "'+'||ifnull(cm.graceperiod,0)||' days','+'||ifnull(cm.creditlimitdays,0)||' days') " +
                    			   "FROM customerinvoice ci INNER JOIN customermaster cm ON cm.customercode = ci.customercode " +
                    			   "WHERE ci.customercode = c.customercode  and ROUND(ci.invoicebalance,5) > 0) as creditdayscnt," +
                    			   "ifnull(invpromoplan,0) as invpromoplan,ifnull(combopromoplan,0) as combopromoplan FROM customermaster c " +
                    			   "LEFT JOIN customeroperationscontrol co ON co.customercode = c.customercode LEFT JOIN customerinvoice ci " +
                    			   "ON ci.customercode = c.customercode AND ROUND(ci.invoicebalance,3) > 0 WHERE 1 AND " +
                    			   "COALESCE(templateindicator,0) = 0 and c.customercode = '"+result[0][0]+"' ";
                    	
                    	console.log(qry2);
                    	
                    	window.plugins.DataBaseHelper.select(qry2, function(result1)
                                {
                                	   if(result1.array != undefined)
                                       {
                                		   if (confirm("Customer CheckOut is not done for "+result1.array[0].alternatecode+" "+result1.array[0].customername+" . Please do Check Out for Next Customer Visit.")) {
                                			   //setCustomerSettings(result1, log_id);
                                			   deleteunendedActivity(result1, log_id);
                                		    } else {
                                		    	$.mobile.hidePageLoadingMsg(); 
                                		    	navigator.notification.alert("Action cancelled.");
                                		        
                                		    }
                                		   
                                       }else{
                                    	   $.mobile.hidePageLoadingMsg(); 
                                    	   navigator.notification.alert("Failed to fetch data. Please Retry.");
                                    	   
                                       }
                                 },
                                 function()
                                 {
                                 console.warn("Error calling plugin");
                                 });
                    	
                    	
                    } else 
                    	{
                    	CheckLoadMessage('ListCustomers.html',true);
                    	}
                	}
                else
                	{
                	CheckLoadMessage('ListCustomers.html',true);
                	}
		        
                

                
            },
            function()
            {
                console.warn("Error calling plugin");
            });
	
}


function setCustomerSettings(data, log_id){
	var result = [];
	result = data;
	sessionStorage.setItem("customerid", result.array[0].customercode);
	sessionStorage.setItem("customername",result.array[0].customername);
	sessionStorage.setItem("reportprintcontrol",result.array[0].reportprintcontrol);
	
	localStorage.setItem("customerBalanceSync",false);
	sessionStorage.setItem("customercode",result.array[0].customercode);
	sessionStorage.setItem("logId", log_id);
	console.log("logId "+ log_id);
	$.mobile.hidePageLoadingMsg(); 
	
	window.location = '../customer_opt/cust_opt.html';
}

function deleteunendedActivity(data, log_id){
	$.mobile.showPageLoadingMsg();
	var selectqry="select ifnull(max(visitkey),0) as VisitKey,totaltransactions,reasoncode from customeroperationscontrol where routekey = " + sessionStorage.getItem("RouteKey");
    console.log(selectqry);
    var platform= sessionStorage.getItem("platform");
    if(platform=='Android')
    {
        
    	window.plugins.DataBaseHelper.select(selectqry,function(result)
                                             {
    										 
                                             if(eval(result.array[0].totaltransactions) > 0 || eval(result.array[0].reasoncode) > 0)
                                             {
                                            	 
                                            	 $.mobile.hidePageLoadingMsg();
                                            	 setCustomerSettings(data, log_id);
                                             }
                                             else
                                             {
                                            	 
                                            	 
                                            	 var VisitKey = result.array[0].VisitKey;
                                            	 
                                                 var deleteqry="delete from customeroperationscontrol where routekey = " + sessionStorage.getItem("RouteKey")+" and visitkey="+VisitKey;
                                                 if(platform=='Android')
                                                 {
                                                	 
                                                	 window.plugins.DataBaseHelper.insert(deleteqry,function(result)
                                                                                          {
                                                                                          var Tbls = ["invoicedetail","promotiondetail","invoicerxddetail","cashcheckdetail","invoiceheader","inventorytransactionheader","inventorytransactiondetail","inventorysummarydetail","batchexpirydetail","salesorderdetail","salesorderheader","posequipmentchangedetail","surveyauditdetail","arheader","ardetail","customerinventorydetail","orderrxddetail"];
                                                                                          for(i=0;i<Tbls.length;i++)
                                                                                          {
                                                                                          if(i == 5 || i == 6 || i == 7)
                                                                                          {
                                                                                          var Qry = "DELETE FROM " + Tbls[i] + " WHERE istemp='true' and transactiontypecode!=07 and routekey=" + sessionStorage.getItem("RouteKey");
                                                                                          }
                                                                                          else if(i == 11 || i == 12 || i==15)
                                                                                          {
                                                                                          var Qry = "DELETE FROM " + Tbls[i] + " WHERE routekey=" + sessionStorage.getItem("RouteKey") + " and visitkey=" + VisitKey;
                                                                                          }
                                                                                          else
                                                                                          {            
                                                                                          var Qry = "DELETE FROM " + Tbls[i] + " WHERE istemp='true' and routekey=" + sessionStorage.getItem("RouteKey") + " and visitkey=" + VisitKey;
                                                                                          }
                                                                                          console.log(Qry);
                                                                                          window.plugins.DataBaseHelper.insert(Qry,function(result)
                                                                                                                               {
                                                                                        	                                   
                                                                                                                               },
                                                                                                                               function()
                                                                                                                               {
                                                                                                                               console.warn("Error calling plugin");
                                                                                                                               });
                                                                                          }
                                                                                          $.mobile.hidePageLoadingMsg();
                                                                                          setCustomerSettings(data, log_id);
                                                                                          },
                                                                                          function()
                                                                                          {
                                                                                          console.warn("Error calling plugin");
                                                                                          });
                                 		      		                                      $.mobile.hidePageLoadingMsg();
                                                 }    
                                             }
                                                 
                                             },
                                             function()
                                             {
                                             console.warn("Error calling plugin");
                                             });
    }
}

