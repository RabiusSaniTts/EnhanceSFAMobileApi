/**
 * 
 */
var NoSaleReasons = (function() {
	var platform;
	var nonServicedCustomers;
	function initPage() {
		platform = sessionStorage.getItem("platform");
		bindEvents();
		resizeOrientationWindow();
		resizeWindow();

	}
	/* Function to bind events for controls */
	function bindEvents() {
		document.addEventListener("deviceready", onDeviceReady, false);
		$("#saveReasonLink ").click(saveReasonForNoSale);

		$("#tblContent tr").live('click', function() {
			if ($(this).hasClass("clicked")) {
				$(this).removeClass('clicked');
			} else {
				$(this).addClass('clicked');
			}
		});
	}

	/*
	 * @method onDeviceReady event triggered on device ready
	 */
	function onDeviceReady() {
		getReasons();

		// if($.isEmptyObject(getNonServicedCustomers())){
		getNoSaleCustomersFromDb();
		// }else{
		// createTableWithReasons(getNonServicedCustomers()); // create table
		// from local data
		// }

	}

	/*
	 * @method getNonServicedCustomers Function to get non serviced customers
	 * saved in the object @return nonServicedCustomers
	 */
	function getNonServicedCustomers() {
		if (nonServicedCustomers) {
			return nonServicedCustomers;
		} else {
			nonServicedCustomers = new Object();
			return nonServicedCustomers;
		}
	}
	/*
	 * @method getNoSaleCustomersFromDb function to get all non serviced
	 * customers from the data base
	 */
	function getNoSaleCustomersFromDb() {
		var routestartdate = sessionStorage.getItem("routestartdate");
		var startDate = new Date(routestartdate).getDay() == 0 ? 7 : new Date(
				routestartdate).getDay();
		var currentDate = new Date().getDay() == 0 ? 7 : new Date().getDay();

		var rp32weeknumber = sessionStorage.getItem("rp32weeknumber");
		var callDays = "";

		if (startDate == currentDate) {
			callDays="callrestrictiondays" + startDate + "=1 and ";
		} 
		else if (startDate>currentDate){
        	
    		for(var i=startDate;i<=7;i++){
    			if (i == startDate)
					callDays = "(";
					callDays += "callrestrictiondays" + i + "=1 OR "
			
    		}
    		for(var i=0;i<=currentDate;i++){
    			if (i != currentDate) {
					callDays += "callrestrictiondays" + i + "=1 OR "
				} else {
					callDays += "callrestrictiondays" + i + "=1) and "
				}
    		}
    	
    	}
		else {
			for (var i = startDate; i <= currentDate; i++) {
				if (i == startDate)
					callDays = "(";
				if (i != currentDate) {
					callDays += "callrestrictiondays" + i + "=1 OR "
				} else {
					callDays += "callrestrictiondays" + i + "=1) and "
				}
			}
		}
		var Qry = "SELECT DISTINCT c.customercode, customername,case when callrestrictiondays1=1 then "
				+ "'1' when callrestrictiondays2=1 then '2'"
				+ " when callrestrictiondays3=1 then '3'  when callrestrictiondays4=1"
				+ " then '4' when callrestrictiondays5=1 then '5'"
				+ " when callrestrictiondays6=1 then '6' when callrestrictiondays7=1"
				+ " then '7' end  as seqweekday,r.rp32weeknumber,"
				+"(SELECT CASE usealternatecodes WHEN 1 THEN c.alternatecode ELSE c.customercode END FROM routemaster WHERE routecode="+ sessionStorage.getItem("RouteCode")+") AS displaycode "
				+" FROM customermaster c JOIN routesequence"
				+ " AS r ON r.customercode=c.customercode  WHERE "
				+ callDays
				+ " c.customercode NOT IN "
				+ "(SELECT customercode from routesequencecustomerstatus where routekey="
				+ sessionStorage.getItem("RouteKey")
				+ ") AND  c.customercode NOT IN (SELECT customercode from "
				+ "nonservicedcustomer where routekey="
				+ sessionStorage.getItem("RouteKey") + ") "

		console.log(Qry)

		if (platform == "Android") {
			window.plugins.DataBaseHelper.select(Qry, function(result) {

				if (!$.isEmptyObject(result)) {
					createTable(result);
				}else{
					ClearTable('tblContent');
				}
			}, function() {
				console.warn("Error calling plugin");
			});

		}
	}

	/*
	 * @method getReasons Function to get the reasons for non service
	 */
	function getReasons() {

		var Qry = "Select CASE WHEN '" + sessionStorage.getItem('Language')
				+ "'='en' then description else "
				+ "arbdescription end as description,code from nonservreasons";

		if (platform == "Android") {
			window.plugins.DataBaseHelper.select(Qry, function(result) {
				if (!$.isEmptyObject(result)) {
					fillReasons(result);
				}
			}, function() {
				console.warn("Error calling plugin");
			});

		}

	}

	/*
	 * @method fillReasons Function to fill the reasons combo @param {data}
	 */
	function fillReasons(data) {
		$("#ddlOrderChangeReason").empty();
		$("<option />", {
			value : "0",
			text : getLangTextdata("-- SELECT --")
		}).appendTo($("#ddlNonServiceReason"));
		$.map(data.array, function(item, index) {
			var code = item.code;
			var description = item.description;

			$("<option />", {
				value : code,
				text : description
			}).appendTo($("#ddlNonServiceReason"));

		});
		$("#ddlNonServiceReason").selectmenu("refresh");

	}

	/*
	 * @method createTable Function to create table of non serviced customers
	 * @param {data}
	 */
	function createTable(data) {

		ClearTable('tblContent');

		$.map(data.array, function(item, index) {

			/** *Local Caching for Customer Details** */
			var customerDetails = new Object();
			customerDetails.customerCode = eval(item.customercode);
			customerDetails.name = item.customername;
			customerDetails.seqweekday = item.seqweekday;
			customerDetails.seqweeknumber = item.rp32weeknumber;
			customerDetails.displaycode = item.displaycode;
			getNonServicedCustomers()[item.customercode] = customerDetails;
			/** **Local Caching ENDS*** */

			var row = "<tr class='contentFontBlack'>";

			var cell = "<td class='leftAlign'>" + item.displaycode + "</td>";
			cell += "<td class='leftAlign'>" + item.customername + "</td>";
			cell+= "<td class='leftAlign'>"+ item.customercode + "</td>";
			row += cell;
			row += "</tr>";
			$('#tblContent tbody').append(row);
		});
	}

	/*
	 * @method createTableWithReasons Function to create table after reason is
	 * selected for customer Table created from locally cached data
	 */
	function createTableWithReasons(data) {

	}
	/*
	 * @method saveReasonForNoSale function called when the save button is
	 * clicked
	 */
	function saveReasonForNoSale() {

		var count = $("tr.clicked").length; // count of selected customers

		if (count == 0) {
			navigator.notification.alert("Please select customer.");
		} else if ($("#ddlNonServiceReason").get(0).selectedIndex == 0
				|| eval($('select#ddlNonServiceReason option').length) == 0) {
			navigator.notification.alert("Please select reason.");
		} else {
			$("tr.clicked")
					.each(
							function(index) {
								$this = $(this);
								var customerCode = $(this).find("td:eq(2)")
										.html();
								var selectedCustomer = getNonServicedCustomers()[customerCode];
								saveRouteSequenceCustomerStatus(
										selectedCustomer, index, count);

							});

		}

	}
	/*
	 * @method saveRouteSequenceCustomerStatus Function to save entry in
	 * routesequencecustomerstatus table @param{customer} @param{index}currently
	 * selected customer @param{count} total count of selected customers
	 */
	function saveRouteSequenceCustomerStatus(customer, index, count) {

		var seduleflag = 1;
		var servicedflag = 0;
		var scannedflag = 0;

		var Qry = "insert into routesequencecustomerstatus('routekey','seqweeknumber','seqweekday','routecode','customercode','sequencenumber',"
				+ "'schelduledflag','servicedflag','scannedflag','issync') values("
				+ sessionStorage.getItem("RouteKey")
				+ ",'"
				+ customer.seqweeknumber
				+ "','"
				+ customer.seqweekday
				+ "','"
				+ sessionStorage.getItem("RouteCode")
				+ "','"
				+ customer.customerCode
				+ "','0','"
				+ seduleflag
				+ "','"
				+ servicedflag + "','" + scannedflag + "',0)";
		if (platform == 'Android') {
			window.plugins.DataBaseHelper.insert(Qry, function(result) {
				saveNonServiceReasons(customer);
				if (index == (count - 1)) {
					getNoSaleCustomersFromDb();
				}

			}, function() {
				console.warn("Error calling plugin");
			});
		}
	}

	/*
	 * @method saveNonServiceReasons Function to save data to
	 * nonservicedcustomer table @param{customer}
	 */
	function saveNonServiceReasons(customer) {
		var reason = $("#ddlNonServiceReason").val();
		var Qry = "insert into nonservicedcustomer('routekey','customercode','reasoncode','issync') values ("
				+ sessionStorage.getItem("RouteKey")
				+ ","
				+ customer.customerCode + "," + reason + ",0)";
		if (platform == 'Android') {
			window.plugins.DataBaseHelper.insert(Qry, function(result) {
			}, function() {
				console.warn("Error calling plugin");
			});
		}
	}

	/*
	 * @method ClearTable Function to clear data from table @param{TBL} id of
	 * the table
	 */
	function ClearTable(TBL) {
		
		$("#" + TBL + " tr").removeClass("clicked");
		$("#" + TBL + " tr:gt(0)").remove();
	}
	return {
		initPage : initPage
	};
})();