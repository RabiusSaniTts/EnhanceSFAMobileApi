var LocationHelper = function() {};


LocationHelper.prototype.getLocation = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'LocationHelper', '', [params]);
};



if(!window.plugins) {
	window.plugins = {};
}
if (!window.plugins.LocationHelper) {
	window.plugins.LocationHelper = new LocationHelper();
}
