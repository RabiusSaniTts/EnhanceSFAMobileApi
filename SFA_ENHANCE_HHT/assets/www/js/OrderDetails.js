var OrderDetails=(function() {
	function initPage() {
		platform = sessionStorage.getItem("platform");
		bindEvents();
		resizeOrientationWindow();
		resizeWindow();

	}
	/* Function to bind events for controls */
	function bindEvents(){
		document.addEventListener("deviceready", onDeviceReady, false);

	}
	/*
	 * @method onDeviceReady event triggered on device ready
	 */
	function onDeviceReady(){
		getRecords();
	}
	
	function getRecords(){
		var Qry="SELECT im.actualitemcode as itemcode ,im.itemdescription,dd.salesqty,dd.deliveredqty,"
			+" dd.focqty,dd.deliveredfoc from"
			+" deliverydetail dd inner join itemmaster im on im.actualitemcode=dd.itemcode"
			+" where dd.deliveryno="+sessionStorage.getItem("deliveryId");
		if(platform =='Android'){
       	 window.plugins.DataBaseHelper.select(Qry,function(result){
       		 if(!$.isEmptyObject(result)){
       			 createOrderDetailsTable(result);
       		 }
    	 },function (){
    		 console.warn("Error calling plugin");
    	 });
		}
		
	}
	function createOrderDetailsTable(data){
		$.map(data.array, function(item, index) {


			var row = "<tr class='contentFontBlack'>";

			var cell = "<td class='leftAlign'>" + item.itemcode + "</td>";
			cell += "<td class='leftAlign'>" + item.itemdescription + "</td>";
			cell += "<td class='leftAlign'>" + item.salesqty + "</td>";
			cell += "<td class='leftAlign'>" + item.deliveredqty + "</td>";
			cell += "<td class='leftAlign'>" + item.focqty + "</td>";
			cell += "<td class='leftAlign'>" + item.deliveredfoc + "</td>";
			// cell+= "<td class='leftAlign'></td>";
			row += cell;
			row += "</tr>";
			$('#tblContent tbody').append(row);
		});
	}
	return {
		initPage : initPage
	};
	
})();