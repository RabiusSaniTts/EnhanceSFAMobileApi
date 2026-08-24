var TrackOrders = (function() {

	var orderDetails = new Object();
	function initPage() {
		platform = sessionStorage.getItem("platform");
		bindEvents();
		resizeOrientationWindow();
		resizeWindow();

	}
	/* Function to bind events for controls */
	function bindEvents() {
		document.addEventListener("deviceready", onDeviceReady, false);
	
		$("#searchOrder").click(searchOrder);

		$("#orderDetails").click(checkSelectedOrders)

		$("#tblContent tr").live('click', function() {
			$(this).addClass('clicked');
			$(this).siblings().removeClass('clicked');
		});

	}

	/*
	 * @method onDeviceReady event triggered on device ready
	 */
	function onDeviceReady() {
			getRecord();
	}
	/*
	 * @method searchOrder Function to search order based on search criteria
	 */
	function searchOrder() {
		ClearTable('tblContent');
		deleteDeliveryData();
		
		var customerCode = $("#customerCode").val();
		var orderNo = $("#orderNo").val();
		var lpoNo = "";
		var orderDate = "";
		var data = {};
		data["customercode"] = customerCode;
		data["orderdate"] = orderDate;
		data["orderno"] = orderNo;
		data["lpono"] = lpoNo;
		data["routecode"] = sessionStorage.getItem("RouteCode");
		data = JSON.stringify(data);
		 $.mobile.showPageLoadingMsg();
		$.ajax({
			type : "get",
			url : wsurl + "ws/getdelivery?delivery=[" + data + "]",
			data : "{}",
			cache : false,
			timeout : 10000,
			crossDomain : true,
			success : function(data) {
				if (data.length > 0) {
					data = JSON.parse(data);
					parseOrderData(data);
				}else{
					$.mobile.hidePageLoadingMsg();
				}

			},
			error : function(qXHR, textStatus, errorThrown) {
				alert("Connection error : " + qXHR.status + ":"
						+ textStatus + " " + errorThrown);
				$.mobile.hidePageLoadingMsg();
			}
		});

	}

	/*
	 * @method parseOrderData Function to parse search result @param{result}
	 */
	function parseOrderData(result) {
		for ( var key in result) {
			switch (key) {
			case "deliveryheader":
				var deliveryheader = result[key];
				if (deliveryheader.length > 0) {
					getDeliveryHeader(deliveryheader, 0, deliveryheader.length,0);
					showOrderTable(deliveryheader);
				}
				break;
			case "deliverydetail":
				var deliverydetail = result[key];
				if (deliverydetail.length > 0) {
					getDeliveryDetails(deliverydetail, 0,
							deliverydetail.length, 0);
				}
				break;
			}
		}
		$.mobile.hidePageLoadingMsg();
	}

	function getDeliveryHeader(itemdata, i, total, alltotal) {

		console.log("delivery header--- " + i);

		if (platform == 'iPad') {

		} else {

					insert_deliveryHeader(itemdata, i, "insert");
		
				if (i + 1 < total) {
					getDeliveryHeader(itemdata, i + 1, total, alltotal);
				} 

		}
	}
	function insert_deliveryHeader(deliveryHeaderData, i, flag) {
		var platform = sessionStorage.getItem("platform");
		if (flag == "insert") {
			if (platform == 'iPad') {

			} else if (platform == 'Android') {
				var Qry = "INSERT INTO deliveryheader ('deliveryno','orderno','customercode','deliveryroute'"
						+ ",'deliverydate'"
						+ ",'loadsheetnumber','reference','totalamount') values("
						+ deliveryHeaderData[i].deliveryno
						+ ","
						+ deliveryHeaderData[i].orderno
						+ ","
						+ deliveryHeaderData[i].customercode
						+ ","
						+ deliveryHeaderData[i].deliveryroute
						+ ","
						+ deliveryHeaderData[i].deliverydate
						+ ",'"
						+ deliveryHeaderData[i].loadsheetnumber
						+ "','"
						+ deliveryHeaderData[i].reference 
						+ "',"
						+ deliveryHeaderData[i].totalamount +")";

				window.plugins.DataBaseHelper.insert(Qry, function(result) {
					return true;
				}, function() {
					console.warn("Error calling plugin");
				});
			}
		} 

	}

	function getDeliveryDetails(itemdata, i, total, alltotal) {
		console.log("delivery detail--- " + i);
		if (platform == 'iPad') {

		} else if (platform == 'Android') {

					insert_deliveryDetail(itemdata, i, "insert");
		
				if (i + 1 < total) {

					getDeliveryDetails(itemdata, i + 1, total, alltotal);
				} 

		}
	}

	function insert_deliveryDetail(deliveryDetails, i, flag) {

		if (flag = "insert") {
			if (platform == 'ipad') {

			} else if (platform == 'Android') {

				var Qry = "INSERT into deliverydetail ('deliveryno','itemcode','caseprice','salesprice',"
						+ "'unitspercase','salesqty','returnqty','focqty','promotionamount','deliveredqty',"
						+ "'deliveredfoc')values("
						+ deliveryDetails[i].deliveryno
						+ ","
						+ deliveryDetails[i].itemcode
						+ ","
						+ deliveryDetails[i].caseprice
						+ ","
						+ deliveryDetails[i].salesprice
						+ ","
						+ deliveryDetails[i].unitspercase
						+ ","
						+ deliveryDetails[i].salesqty
						+ ","
						+ deliveryDetails[i].returnqty
						+ ","
						+ deliveryDetails[i].focqty
						+ ","
						+ deliveryDetails[i].promotionamount
						+ ","
						+ deliveryDetails[i].deliveredqty
						+ ","
						+ deliveryDetails[i].deliveredfoc + ")";

				console.log(Qry)

				window.plugins.DataBaseHelper.insert(Qry, function(result) {

					return true;
				}, function() {

					console.warn("Error calling plugin");
				});
			}
		} 
	}

	/*
	 * @method showOrderTable Function to show the delivery table
	 * @param{deliveryheader} data to be populated in the table
	 */
	function showOrderTable(deliveryheader) {

		ClearTable('tblContent');
		
		$.each(deliveryheader, function(index, item) {
			var row = "<tr class='contentFontBlack'>";

			var cell = "<td class='leftAlign'>" + item.deliveryno + "</td>";
			cell += "<td class='leftAlign'>" + item.orderno + "</td>";
			cell += "<td class='leftAlign'>" + item.reference + "</td>";
			cell += "<td class='leftAlign'>" + item.deliverydate + "</td>";
			cell += "<td class='leftAlign'>" + eval(item.totalamount).toFixed(2) + "</td>";
			cell += "<td class='leftAlign'>" + item.loadsheetnumber + "</td>";
			row += cell;
			row += "</tr>";
			$('#tblContent tbody').append(row);
		});
	}

	/*
	 * @method checkSelectedOrders Function called when details button is
	 * clicked
	 */
	function checkSelectedOrders() {
		var count = $("tr.clicked").length;
		if (count == 0) {
			navigator.notification.alert("Please select order.");
		} else {
			$("tr.clicked").each(function(index) {
				$this = $(this);
				var deliverNo = $(this).find("td:first").html();
				sessionStorage.setItem("deliveryId", deliverNo);
				window.location = "orderDetails.html";

			});
		}
	}
	
	function deleteDeliveryData(){
		  var Tbls = ['deliverydetail','deliveryheader'];
		  if(platform=='Android')
          {
              for(i=0;i<Tbls.length;i++)
              {
                  
                  var Qry = "DELETE FROM " + Tbls[i];                    
                  console.log(Qry);
                  window.plugins.DataBaseHelper.insert(Qry,function(result)
                                                       {
                                                       
                                                       },
                                                       function()
                                                       {
                                                       console.warn("Error calling plugin");
                                                       });
              }
            
              
          }
	}
	function getRecord(){
		var Qry="select * from deliveryheader";
		window.plugins.DataBaseHelper.select(Qry, function(result) {
			 if(!$.isEmptyObject(result)){
				 var data=result.array;
				// alert(JSON.stringify(data))
				 showOrderTable(data)
       		 }
		},function (){
			console.warn("Error calling plugin")
		});
		
	}
	/*
	 * @method ClearTable Function to clear data from table @param{TBL} id of
	 * the table
	 */
	function ClearTable(TBL) {
		
		$("#" + TBL + " tr").removeClass("clicked");
		$("#" + TBL + " tr:gt(0)").remove();
	}

	/*
	 * @method parseDate Function to parse date from date picker @param{str}
	 * date string
	 */
	function parseDate(str) {
		var mdy = str.split('-');
		var year = mdy[2];

		var month = parseInt(mdy[1], 10);
		if (month <= 9)
			month = '0' + month;

		var day = parseInt(mdy[0], 10);
		if (day <= 9)
			day = '0' + day;

		return year + '-' + month + '-' + day;
	}

	return {
		initPage : initPage
	};

})();