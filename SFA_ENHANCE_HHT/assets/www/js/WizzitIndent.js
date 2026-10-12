var WizzitIndent = function() {};

var tag = 'WizzitIndentJSTag:';

//  the cordova plugin class name .java. used to call configure and pay events
var ANDROID_TAG = 'WizzitIndent';

var CONFIGURE = 'CONFIGURE';
var PAYMENT = 'PAYMENT';
var VIEWPROMO = 'VIEWPROMO';
var SYNC = 'SYNC';
var VIEWPROMOORD = 'VIEWPROMOORD';
var UPLOAD = 'UPLOAD';
var UPDATE = 'UPDATE';
var TABLEUPDATE = 'TABLEUPDATE';

var eventCallback = function (successParams) {
	console.log(tag + ' Call Success ' + successParams);	
	
	var jsontext = JSON.parse(successParams);
	var status = jsontext.status;
	
	if(status == 1){
		//$('.ui-loader h1').text("Please Click Update Button ..!"); 
		$.mobile.hidePageLoadingMsg();
	} else if(status == 2){
		//$('.ui-loader h1').text("App Updated Successfully!"); 
		$.mobile.hidePageLoadingMsg();
	} 
	

    //document.getElementById("msg").textContent = ' Success -> ' + successParams;
};
var errorCallback = function (errorParams) { 
	console.log(tag + ' Errorrrrr ' + errorParams);

    //document.getElementById("msg").textContent = ' Errorrr -> ' + errorParams;
};

function onLoad() {
    document.addEventListener("deviceready", onDeviceReady, false);
}

// device APIs are available
//
function onDeviceReady() {
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
}

function onPause() {
    // Handle the pause event
}

function onResume() {
    // Handle the resume event
}

WizzitIndent.prototype.setCallbacks = function (event, error) {
    eventCallback = event;
    errorCallback = error;
};

// used to call configure part from the java
WizzitIndent.prototype.configure = function (amount, tips, fr) {
    cordova.exec(
        eventCallback,
        errorCallback,
        ANDROID_TAG,
        CONFIGURE,
        [amount, tips,fr]
    );
};

// used to call pay part from the java
WizzitIndent.prototype.pay = function (amount, tips,fr) {
    cordova.exec(
        eventCallback,
        errorCallback,
        ANDROID_TAG,
        PAYMENT,
        [amount, tips,fr]
    );
};

//used to call pay part from the java
WizzitIndent.prototype.viewpromo = function (amount, tips,fr) {
    cordova.exec(
        eventCallback,
        errorCallback,
        ANDROID_TAG,
        VIEWPROMO,
        [amount, tips,fr]
    );
};

WizzitIndent.prototype.viewpromoord = function (amount, tips, fr) {
    cordova.exec(
        eventCallback,
        errorCallback,
        ANDROID_TAG,
        VIEWPROMOORD,
        [amount, tips, fr]
    );
};

WizzitIndent.prototype.sync = function (amount, tips,fr) {
    cordova.exec(
        eventCallback,
        errorCallback,
        ANDROID_TAG,
        SYNC,
        [amount, tips,fr]
    );
};

WizzitIndent.prototype.upload = function (amount, tips,fr) {
    cordova.exec(
        eventCallback,
        errorCallback,
        ANDROID_TAG,
        UPLOAD,
        [amount, tips,fr]
    );
};

WizzitIndent.prototype.update = function (amount, tips,fr) {
	
    cordova.exec(
        eventCallback,
        errorCallback,
        ANDROID_TAG,
        UPDATE,
        [amount, tips,fr]
    );
};

WizzitIndent.prototype.tableupdate = function (amount, tips,fr) {
    cordova.exec(
        eventCallback,
        errorCallback,
        ANDROID_TAG,
        TABLEUPDATE,
        [amount, tips,fr]
    );
};

if(!window.plugins) {
	window.plugins = {};
}
if (!window.plugins.WizzitIndent) {
	window.plugins.WizzitIndent = new WizzitIndent();
}

