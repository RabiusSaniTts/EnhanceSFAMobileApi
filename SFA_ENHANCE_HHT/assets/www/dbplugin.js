var dbplugin = function() {};


dbplugin.prototype.execSelectQuery = function(sql,successCallback, failureCallback) {

 return Cordova.exec(    successCallback,    //Success callback from the plugin
      failureCallback,     //Error callback from the plugin
      'dbplugin',  //Tell PhoneGap to run "DirectoryListingPlugin" Plugin
      'execSelectQuery',              //Tell plugin, which action we want to perform
      [sql]);        //Passing list of args to the plugin
};
			

PhoneGap.addConstructor(function() {
	PhoneGap.addPlugin('dbplugin', new DbHelper());	 
});



