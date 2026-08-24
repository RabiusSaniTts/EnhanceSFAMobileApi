var OnHoldOrders = (function() {
	var platform;
	var onHoldOrders=new Object();
	var transactionKeys=[];
	var visitKeys=[];
	var hhttransactionkeys = [];
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
		var delFlag = sessionStorage.getItem("Deleteflag");

			
		$("#saveOrderBtn").click(saveSelectedOrders);
		$("#cancelOrderBtn").click(cancelSelectedOrders);
		if(delFlag ==1){
			 	 $('#editBtn').addClass('MenuGray');  
			 	 $('#editBtn').addClass('MenuGray');
	             $('#editimg').attr('src','../images/info-6_g.png');
	             $('#editBtn').attr('href','');
	             $('#editBtn').attr('onclick','');
		}else {
		$("#editBtn").click(editSelectedOrder);
		}
		$("#tblContent tr").live('click', function() {
			if ($(this).hasClass("clicked")) {
				$(this).removeClass('clicked');
			} else {
				$(this).addClass('clicked');
			}
		});
		$("#exitBtn").click(exitOnHoldOrdersScreen)
		$("#newBtn").click(newOrdersScreen);
	}	
	/*
	 * @method onDeviceReady event triggered on device ready
	 */
	function onDeviceReady() {
		sessionStorage.setItem("referrer","");
		var delFlag = sessionStorage.getItem("Deleteflag");
		getOnHoldOrders();

	}
	/*
	 *@method getOnHoldOrders
	 *Function to get all the on hold orders 
	 */
	function getOnHoldOrders(){ //alert("getOnHoldOrders");
		var tt =sessionStorage.setItem("onHoldOrderInvoice",0);
		sessionStorage.setItem("onHoldOrderInvoice",0);
		var delFlag = sessionStorage.getItem("Deleteflag");
		var holddays = sessionStorage.getItem("orderholddays");
		//alert('tt' +tt);
		//alert("getOnHoldOrders");
		// org qry suje commented 18/08/2019  added order amount 
		/*var Qry="select invoicenumber ,cm.customercode,customername,transactionkey,"
			+"(SELECT CASE usealternatecodes WHEN 1 THEN cm.alternatecode ELSE cm.customercode END FROM routemaster WHERE routecode="+ sessionStorage.getItem("RouteCode")+") AS displaycode" 
			+" from pendingorderheader soh inner join customermaster cm on soh.customercode=cm.customercode where soh.issync=0 "
			+" and soh.istemp='false' and COALESCE(voidflag,0)<>1";
		
		*/
		//localStorage.po ='orderrequest'
		//alert(localStorage.po)
		var dayinterval = holddays +" day";
		//alert(dayinterval);
		
		
		if(localStorage.po == 'orderrequest'){
			   var Qry="select invoicenumber ,cm.customercode,customername,transactionkey,"
					+"(SELECT CASE usealternatecodes WHEN 1 THEN cm.alternatecode ELSE cm.customercode END FROM routemaster WHERE routecode="+ sessionStorage.getItem("RouteCode")+") AS displaycode,soh.totalsalesamount as orderamt, soh.transactiondate, soh.hhctransactionkey" 
					+" from pendingorderheader soh inner join customermaster cm on soh.customercode=cm.customercode where soh.issync=0 "
					+" and soh.istemp='false' and soh.customercode = "+sessionStorage.getItem("customerid")+" and  COALESCE(voidflag,0)<>1";
					console.log("orderrequest "+Qry);
		   }
		   else {
			   if(delFlag == 1){
				   var Qry="select invoicenumber ,cm.customercode,customername,transactionkey,"
						+"(SELECT CASE usealternatecodes WHEN 1 THEN cm.alternatecode ELSE cm.customercode END FROM routemaster WHERE routecode="+ sessionStorage.getItem("RouteCode")+") AS displaycode,soh.totalsalesamount as orderamt, soh.transactiondate, soh.hhctransactionkey" 
						+" from pendingorderheader soh inner join customermaster cm on soh.customercode=cm.customercode where soh.issync=0 "
						+" and soh.istemp='false' and date(soh.transactiondate, '"+dayinterval+"' )  < date('now') and  COALESCE(voidflag,0)<>1";
				   Qry = " SELECT invoicenumber, customercode, customername, transactionkey, displaycode, orderamt, transactiondate FROM( select invoicenumber ,cm.customercode,customername, transactionkey,(SELECT CASE usealternatecodes WHEN 1 THEN cm.alternatecode ELSE cm.customercode END FROM routemaster WHERE routecode= "+ sessionStorage.getItem("RouteCode")+" ) AS displaycode,soh.totalsalesamount as orderamt, soh.transactiondate, round(julianday('now') - julianday(transactiondate),0) days from pendingorderheader soh inner join customermaster cm on soh.customercode=cm.customercode where soh.issync=0  and soh.istemp='false' ) WHERE days >2 ";
				   console.log("DELQRY"+Qry);
			   } else {
				   var Qry="select invoicenumber ,cm.customercode,customername,transactionkey,"
						+"(SELECT CASE usealternatecodes WHEN 1 THEN cm.alternatecode ELSE cm.customercode END FROM routemaster WHERE routecode="+ sessionStorage.getItem("RouteCode")+") AS displaycode,soh.totalsalesamount as orderamt, soh.transactiondate, soh.hhctransactionkey" 
						+" from pendingorderheader soh inner join customermaster cm on soh.customercode=cm.customercode where soh.issync=0 "
						+" and soh.istemp='false' and COALESCE(voidflag,0)<>1";
						console.log("HOLDQRY"+Qry);
			   }
				
		   	}
		
		//alert(Qry);
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
			onHoldOrder.hhctransactionkey = item.hhctransactionkey; // sujee commented 
			onHoldOrders[item.invoicenumber] = onHoldOrder;
			/** **Local Caching ENDS*** */
			
			var row = "<tr class='contentFontBlack'>";

			var cell = "<td class='leftAlign'>" + item.invoicenumber + "</td>";
			cell += "<td class='leftAlign'>" + item.transactiondate + "</td>";
			cell += "<td class='leftAlign'>" + item.displaycode + "</td>";
			cell += "<td class='leftAlign'>" + item.customername + "</td>";   
			cell += "<td class='leftAlign'>" + item.orderamt + "</td>"; 
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
		
		// sujee commented  org qry
		//var Qry="UPDATE salesorderheader set dexflag=0  where invoicenumber="+order.invoicenumber;
	
	   var Qry="UPDATE salesorderheader set dexflag=0,confirmorder=1  where invoicenumber="+order.invoicenumber;
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
					
					
					 if (confirm('Do You Want To Delete This Order?')) 
                     { 
						 cancelOnHoldOrder(selectedOrder,index,count);
                     } else 
                     { 
                    	 $.mobile.hidePageLoadingMsg();
                     }
					

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
		//var Qry="UPDATE salesorderheader set voidflag=1 where invoicenumber="+order.invoicenumber;
	  var Qry="Delete from pendingorderdetail  where transactionkey in(select transactionkey from pendingorderheader where invoicenumber in("+order.invoicenumber+"))";
	  console.log(Qry);
	 // alert(Qry);
		if (platform == "Android") {
			window.plugins.DataBaseHelper.insert(Qry, function(result) {
				cancelOnHoldheader(order,index,count);
				/*if(index==(count-1)){
					getOnHoldOrders();
					
				}*/
			}, function() {
				console.warn("Error calling plugin");
			});
	}
	}
	
	function cancelOnHoldheader(order,index,count)
	{
		 var Qry="Delete from pendingorderheader  where invoicenumber in("+order.invoicenumber+")";
		console.log(Qry);
		 // alert(Qry);
			if (platform == "Android") {
				window.plugins.DataBaseHelper.insert(Qry, function(result) {
					
					
					updateSalesOrderHeader(order,index,count);
				}, function() {
					console.warn("Error calling plugin");
				});
		}
	}
	
	
	function updateSalesOrderHeader(order,index,count){
		var Qry = "update salesorderheader set voidflag = 1 where hhctransactionkey in('"+order.hhctransactionkey+"')";

		console.log(Qry);
		 
			if (platform == "Android") {
				window.plugins.DataBaseHelper.insert(Qry, function(result) {
					
				}, function() {
					console.warn("Error calling plugin");
				});
				if(index==(count-1)){
					getOnHoldOrders();
					
				}
		}
	}
	
	
	/*
	 * @method exitOnHoldOrdersScreen
	 * Function to upload the canceled/saved orders when exit the screen
	 * */
	
	
	// sujee commented nop need to send directly from this screen 
	//-----------------------Start------------------------------------------
	/*function exitOnHoldOrdersScreen(){ 
		// sujee commented org qry
	//	var Qry="select invoicenumber ,transactionkey,visitkey from salesorderheader soh where soh.issync=0 and  (voidflag=1 or dexflag=0)";
		
	    
		var Qry="select invoicenumber ,transactionkey from pendingorderheader soh where soh.issync=0";
		console.log(Qry);
		alert(Qry);
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
		
		
	}*/
	// ------------------------------------------- End -----------------------------------------
	/*
	 * @method editSelectedOrder
	 * Function to edit the selected order
	 * */
	
	// newly added to navigate next screen 
	function exitOnHoldOrdersScreen()
	{
		window.location=sessionStorage.getItem("backScreen");
		 //window.location='../home/home.html';
	}
	
	function newOrdersScreen()
	{
		alert("newOrdersScreen");
		
		$("tr.clicked").each(
				function(index) {
					$this = $(this);
					var orderNumber = $(this).find("td:first").html();
					var selectedOrder = onHoldOrders[orderNumber];
					
					sessionStorage.setItem("InsertorderFlag",0);   
					sessionStorage.setItem("editpendingorder",0); 
					sessionStorage.setItem("customerid",selectedOrder.customercode);  
			
					sessionStorage.setItem("neworder",1); 
					window.location="../customer_opt/cust_opt.html";
					
					sessionStorage.setItem("referrer","../inventory/onholdorders.html");
					window.location="../customer_opt/cust_opt.html";
					

				
					
				});
		
	
	}
	
	
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
					
					sessionStorage.setItem("InsertorderFlag",1);   // sujee added 
					sessionStorage.setItem("editpendingorder",1); 
					sessionStorage.setItem("customercode",selectedOrder.customercode);
					sessionStorage.setItem("customername",selectedOrder.customername);
				//	sessionStorage.setItem("customerid",selectedOrder.customercode);
					sessionStorage.setItem("onHoldOrderInvoice",selectedOrder.invoicenumber);
					sessionStorage.setItem("onHoldinv",selectedOrder.invoicenumber);
					
					sessionStorage.setItem("referrer","../inventory/onholdorders.html");
					//window.location="../customer_opt/orderRequest.html"; // org line sujee commented 
					window.location="../customer_opt/cust_opt.html";
					
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