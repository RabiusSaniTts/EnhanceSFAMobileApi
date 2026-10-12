var DataBaseHelper = function() {};
var dbflag=false;
DataBaseHelper.prototype.open = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'DataBaseHelper', 'open', [params]);
};
DataBaseHelper.prototype.close  = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'DataBaseHelper', 'close', [params]);
};
DataBaseHelper.prototype.insert = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'DataBaseHelper', 'insert', [params]);
};
DataBaseHelper.prototype.insertBulk = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'DataBaseHelper', 'insertBulk', [params]);
};

DataBaseHelper.prototype.insertBulkPricing = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'DataBaseHelper', 'insertBulkPricing', [params]);
};

DataBaseHelper.prototype.insertBulkGroupDetail = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'DataBaseHelper', 'insertBulkGroupDetail', [params]);
};

DataBaseHelper.prototype.insertBulkItemList = function(params, success, fail) 
{ 
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'DataBaseHelper', 'insertBulkItemList', [params]);
};

DataBaseHelper.prototype.insertBulkCustomerMapping = function(params, success, fail) 
{ 
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'DataBaseHelper', 'insertBulkCustomerMapping', [params]);
};

DataBaseHelper.prototype.copy2SdCard = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'DataBaseHelper', 'copy2SdCard', [params]);
};
DataBaseHelper.prototype.select = function(params, successCallback, failureCallback) 
{
    return cordova.exec(successCallback,failureCallback, 'DataBaseHelper', 'select', [params]);
};






/*cordova.addConstructor(function() 
{
    cordova.addPlugin('DataBaseHelper', new DataBaseHelper());
    PluginManager.addService("DataBaseHelper","com.phonegap.sfa.DataBaseHelper");
});*/


var ZebraHelper = function() {};

if(!window.plugins) {
	window.plugins = {};
}
if (!window.plugins.DataBaseHelper) {
	window.plugins.DataBaseHelper = new DataBaseHelper();
}

if (!window.plugins.PrinterHelper) {
	//window.plugins.PrinterHelper = new PrinterHelper();
	window.plugins.ZebraHelper = new ZebraHelper();	
}


/*PrinterHelper.prototype.print = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
    	//alert(args.status);
        success(args);
    }, 
    function(args) 
    {    	
        fail(args);
    }, 'PrinterHelper', '', params);
};*/

ZebraHelper.prototype.print = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
    	//alert(args.status);
        success(args);
    }, 
    function(args) 
    {    	
        fail(args);
    }, 'ZebraHelper', '', params);
};

//For dot matrix
var DotmatHelper = function() {};


DotmatHelper.prototype.print = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
    
        success(args);
    }, 
    function(args) 
    {
    	
        fail(args);
    }, 'DotmatHelper', '', params);
};



if(!window.plugins) {
    window.plugins = {};
}
if (!window.plugins.DotmatHelper) {
    window.plugins.DotmatHelper = new DotmatHelper();
}
//Pb51 Helper Class 

//For dot matrix
var PB51Helper = function() {};


PB51Helper.prototype.print = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
    
        success(args);
    }, 
    function(args) 
    {
    	
        fail(args);
    }, 'PB51Helper', '', params);
};



if(!window.plugins) {
    window.plugins = {};
}
if (!window.plugins.PB51Helper) {
    window.plugins.PB51Helper = new PB51Helper();
}








//--------Bluetood device helper
var BluetoothHelper = function() {};


BluetoothHelper.prototype.fetch = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'BluetoothHelper', params, [params]);
};



if(!window.plugins) {
    window.plugins = {};
}
if (!window.plugins.BluetoothHelper) {
    window.plugins.BluetoothHelper = new BluetoothHelper();
}


//--------download device helper
var DownloadPlugin = function() {};


DownloadPlugin.prototype.download = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'DownloadPlugin', params, [params]);
};



if(!window.plugins) {
    window.plugins = {};
}
if (!window.plugins.DownloadPlugin) {
    window.plugins.DownloadPlugin = new DownloadPlugin();
}


//------Map Helper to call MapScreen in native android


var MapHelper = function() {};


MapHelper.prototype.getMap = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'MapHelper', '', [params]);
};



if(!window.plugins) {
	window.plugins = {};
}
if (!window.plugins.MapHelper) {
	window.plugins.MapHelper = new MapHelper();
}


//------Chart Helper to call ChartScreen in native android


var ChartHelper = function() {};


ChartHelper.prototype.getChart = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'ChartHelper', '', [params]);
};



if(!window.plugins) {
	window.plugins = {};
}
if (!window.plugins.ChartHelper) {
	window.plugins.ChartHelper = new ChartHelper();
}

//Location Track Helper to start service to send location update to server

//------Chart Helper to call ChartScreen in native android


var LocationTrackHelper = function() {};


LocationTrackHelper.prototype.startservice = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'LocationTrackHelper', '', [params]);
};



if(!window.plugins) {
	window.plugins = {};
}
if (!window.plugins.LocationTrackHelper) {
	window.plugins.LocationTrackHelper = new LocationTrackHelper();
}


// ------ sujee added 


var ScreenLocker = function() {};


ScreenLocker.prototype.unlock = function(successCallback, errorCallback, timeout) 
{
	if(typeof timeout == 'undefined'){
        timeout = 0;
    }
    return cordova.exec(
            successCallback, // success callback function
            errorCallback, // error callback function
            'ScreenLocker', // mapped to our native Java class called "ScreenLocker"
            'lock', // with this action name
            [{                  // and this array of custom arguments to create our entry
                "timeout": timeout
            }]
        );
};



if(!window.plugins) {
	window.plugins = {};
}
if (!window.plugins.ScreenLocker) {
	window.plugins.ScreenLocker = new ScreenLocker();
}


//sujee added to download in excel  && Send Mail 30/10/2017 ---------- Start 
var Xls = function() {};
Xls.prototype.saveXLS = function(successCallback, errorCallback,email,tomail,custSignature,ordertotal) 
{ 
var json = email;
var parsed = JSON.parse(json);
var arr = [];
for(var x in parsed){
  arr.push(parsed[x]);
}
var excelData = JSON.stringify(arr);

//data["tomail"] = tomail;
    return cordova.exec(
            successCallback, // success callback function
            errorCallback, // error callback function
            'Xls', // mapped to our native Java class called "XLS"
            'saveXLS', // with this action name
            [{              // add  parâmetros
            	"data"       : email,// Email data 
            	"tomail"	 : tomail, //  mail id  
            	"custSignature"	 : custSignature,
            	"ordertotal" : ordertotal
            }]
        );
    
    
};

// for customer statement email & PDF
Xls.prototype.custStmt = function(successCallback, errorCallback,email,tomail) 
{ 
var json = email;
var parsed = JSON.parse(json);
var arr = [];
for(var x in parsed){
  arr.push(parsed[x]);
}
var excelData = JSON.stringify(arr);
    return cordova.exec(
            successCallback, // success callback function
            errorCallback, // error callback function
            'Xls', // mapped to our native Java class called "XLS"
            'custStmt', // with this action name
            [{              // add  parameters
            	"data"       : email,// Email data 
            	"tomail"	 : tomail //  mail id  
            }]
        );  
};

if(!window.plugins) {
	window.plugins = {};
}
if (!window.plugins.Xls) {
	window.plugins.Xls = new Xls();
}
// ------------- End 


