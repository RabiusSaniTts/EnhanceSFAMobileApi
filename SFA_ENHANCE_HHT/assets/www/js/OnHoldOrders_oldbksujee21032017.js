var OnHoldOrders = (function() {
	var platform;
	var onHoldOrders=new Object();
	var transactionKeys=[];
	var visitKeys=[];
	function initPage() {
		platform = sessionStorage.getItem("platform");
		bindEvents();
		resizeOrientationWindow();
		resizeWindow();
		sessionStorage.setItem("referrer","");
	}
	/* Function to bind events for controls */
	function bindEvents() {
		document.addEventListener("deviceready", onDeviceReady, false);
		$("#saveOrderBtn").click(saveSelectedOrders);
		$("#cancelOrderBtn").click(cancelSelectedOrders);
		$("#editBtn").click(editSelectedOrder);
		$("#tblContent tr").live('click', function() {
			if ($(this).hasClass("clicked")) {
				$(this).removeClass('clicked');
			} else {
				$(this).addClass('clicked');
			}
		});
		$("#exitBtn").click(exitOnHoldOrdersScreen)
	}	
	/*
	 * @method onDeviceReady event triggered on device ready
	 */
	function onDeviceReady() {
		sessionStorage.setItem("referrer","");
		getOnHoldOrders();

	}
	/*
	 *@method getOnHoldOrders
	 *Function to get all the on hold orders 
	 */
	function getOnHoldOrders(){
		
		
		var Qry="select invoicenumber ,cm.customercode,customername,transactionkey,visitkey,"
			+"(SELECT CASE usealternatecodes WHEN 1 THEN cm.alternatecode ELSE cm.customercode END FROM routemaster WHERE routecode="+ sessionStorage.getItem("RouteCode")+") AS displaycode" 
			+" from salesorderheader soh inner join customermaster cm on soh.customercode=cm.customercode where soh.issync=0 "
			+" and soh.istemp='false' and dexflag=1 and COALESCE(voidflag,0)<>1";
		if (platform == "Android") {
			window.plugins.DataBaseHelper.select(Qry, function(result) {

				if (!$.isEmptyObject(result)) {
					createTable(result);
				}else{
					ClearTable('tblContent');
				}
				$.mobile.hidePageLoadingMsg();
			}, function() {
				console.warn("Error calling plugin");
			});

		}
	}

	/*
	 * @method createTable Function to create table of on hold orders
	 * @param {data}
	 */
	function createTable(data) {

		ClearTable('tblContent');

		$.map(data.array, function(item, index) {

			/** *Local Caching for Customer Details** */
			var onHoldOrder = new Object();
			onHoldOrder.invoicenumber = item.invoicenumber;
			onHoldOrder.customercode = item.customercode;
			onHoldOrder.displaycode=item.onHoldOrder;
			onHoldOrder.customername = item.customername;
			onHoldOrder.transactionkey = item.transactionkey;
			onHoldOrder.visitkey = item.visitkey;
			onHoldOrders[item.invoicenumber] = onHoldOrder;
			/** **Local Caching ENDS*** */
			
			var row = "<tr class='contentFontBlack'>";

			var cell = "<td class='leftAlign'>" + item.invoicenumber + "</td>";
			cell += "<td class='leftAlign'>" + item.displaycode + "</td>";
			cell += "<td class='leftAlign'>" + item.customername + "</td>";
			
			row += cell;
			row += "</tr>";
			$('#tblContent tbody').append(row);
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
	 * @method saveSelectedOrders
	 * Function to save the selected orders 
	 */
	function saveSelectedOrders(){
		var count = $("tr.clicked").length;
		if(count==0){
			navigator.notification.alert("Please select order.");
		}else{
			$.mobile.showPageLoadingMsg();
			$("tr.clicked").each(
				function(index) {
					$this = $(this);
					var orderNumber = $(this).find("td:first").html();
					var selectedOrder = onHoldOrders[orderNumber];
					
					if(transactionKeys.indexOf(selectedOrder.transactionkey)==-1){
						transactionKeys.push(selectedOrder.transactionkey);
					}
					if(visitKeys.indexOf(selectedOrder.visitkey)==-1){
						visitKeys.push(selectedOrder.visitkey);
					}
					
					saveOnHoldOrder(selectedOrder,index,count);

				});
		}
	}
	
	/*
	 * @method saveOnHoldOrder
	 * Function to update the order in DB
	 * @param{order}
	 * @param{index}
	 * @param{count}
	 */
	function saveOnHoldOrder(order,index,count){
		
		var Qry="UPDATE salesorderheader set dexflag=0  where invoicenumber="+order.invoicenumber;
		if (platform == "Android") {
			window.plugins.DataBaseHelper.insert(Qry, function(result) {
				if(index==(count-1)){
					getOnHoldOrders();
					
				}
			}, function() {
				console.warn("Error calling plugin");
			});
	}
	}
	
	/*
	 * @mrethod cancelSelectedOrders
	 * Function to cancel the selected orders
	 */
	function cancelSelectedOrders(){
		var count = $("tr.clicked").length;
		if(count==0){
			navigator.notification.alert("Please select order.");
		}else{
			$.mobile.showPageLoadingMsg();
			$("tr.clicked").each(
				function(index) {
					$this = $(this);
					var orderNumber = $(this).find("td:first").html();
					var selectedOrder = onHoldOrders[orderNumber];
				
					if(transactionKeys.indexOf(selectedOrder.transactionkey)==-1){
						transactionKeys.push(selectedOrder.transactionkey);
					}
					if(visitKeys.indexOf(selectedOrder.visitkey)==-1){
						visitKeys.push(selectedOrder.visitkey);
					}
					
					cancelOnHoldOrder(selectedOrder,index,count);

				});
		}
	}
	
	/*
	 * @method cancelOnHoldOrder
	 * Function to cancel on hold order
	 * @param{order}
	 * @param{index}
	 * @param{count}
	 * */
	function cancelOnHoldOrder(order,index,count){
		var Qry="UPDATE salesorderheader set voidflag=1 where invoicenumber="+order.invoicenumber;
		if (platform == "Android") {
			window.plugins.DataBaseHelper.insert(Qry, function(result) {
				if(index==(count-1)){
					getOnHoldOrders();
					
				}
			}, function() {
				console.warn("Error calling plugin");
			});
	}
	}
	/*
	 * @method exitOnHoldOrdersScreen
	 * Function to upload the canceled/saved orders when exit the screen
	 * */
	function exitOnHoldOrdersScreen(){
		var Qry="select invoicenumber ,transactionkey,visitkey from salesorderheader soh where soh.issync=0 and  (voidflag=1 or dexflag=0)";
		if (platform == "Android") {
			window.plugins.DataBaseHelper.select(Qry, function(result) {
				if(result.array){
				$.map(result.array, function(item, index) {
					if(transactionKeys.indexOf(item.transactionkey)==-1){
						transactionKeys.push(item.transactionkey);
					}
					if(visitKeys.indexOf(item.visitkey)==-1){
						visitKeys.push(item.visitkey);
					}
				});
				
				
				var dataRouteString=sessionStorage.getItem("RouteKey");
				var dataTransString= transactionKeys.toString();
				var datavisitString=visitKeys.toString();
				
				if(transactionKeys.length>0 || visitKeys.length>0){
					sessionStorage.setItem("referrer","../inventory/onholdorders.html");
				     SimulateFunction(dataRouteString,transactionKeys,visitKeys,'order');
				
				//Sales order detail data
		      /*  getSendData(dataRouteString,dataTransString,"","salesorderdetail",false);
		        
		        //Sales order header data
		        getSendData(dataRouteString,dataTransString,"","salesorderheader",false);
		        
		        //promotiondetail data
		        getSendData(dataRouteString,datavisitString,"","promotiondetail",false);
		        
		        //signature data
		        getSendData(dataRouteString,datavisitString,"","sigcapturedata",false);
		        
		         //customerinventorydetail
		        getSendData(dataRouteString,datavisitString,"","customeroperationscontrol",false);
		        
		        //routesequencecustomerstatus
		        getSendData(dataRouteString,"","","routesequencecustomerstatus",false);
		        
		        //customermaster data
		        getSendData("","","","customermaster",true);*/
		        
					transactionKeys=[];
					datavisitString=[];
		        
				}else{
				 window.location=sessionStorage.getItem("backScreen");
				}
				
				}
				else{
				 window.location=sessionStorage.getItem("backScreen");
				}
			}, function() {
				console.warn("Error calling plugin");
			});
			}
		
		
	}
	/*
	 * @method editSelectedOrder
	 * Function to edit the selected order
	 * */
	function editSelectedOrder(){
		var count = $("tr.clicked").length;
		if(count==0){
			navigator.notification.alert("Please select order.");
		}else if(count>1){
			navigator.notification.alert("Please select one order at a time to Edit.");
		}
		else{
			$.mobile.showPageLoadingMsg();
			$("tr.clicked").each(
				function(index) {
					$this = $(this);
					var orderNumber = $(this).find("td:first").html();
					var selectedOrder = onHoldOrders[orderNumber];
					sessionStorage.setItem("customerid",selectedOrder.customercode);
					sessionStorage.setItem("onHoldOrderInvoice",selectedOrder.invoicenumber);
					sessionStorage.setItem("referrer","../inventory/onholdorders.html");
					window.location="../customer_opt/orderRequest.html";
					
				});
		}
	}
	/*
	 * @method refreshTable
	 * Call back function afetr uploading data to server
	 * Clears the variable for visitkeys and transaction keys
	 * */
	function refreshTable()
    {
	    transactionKeys=[];
		datavisitString=[];
		window.location=sessionStorage.getItem("backScreen");
    }
	return {
		initPage : initPage
	};
})();