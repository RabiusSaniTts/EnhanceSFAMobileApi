var PrintHelper = function() {};


PrintHelper.prototype.intialize = function(params, success, fail) 
{
    return cordova.exec(function(args) 
    {
        success(args);
    }, 
    function(args) 
    {
        fail(args);
    }, 'PrintHelper', 'intialize', [params]);
};



cordova.addConstructor(function() 
{
    cordova.addPlugin('PrintHelper', new PrintHelper());
    PluginManager.addService("PrintHelper","com.phonegap.sfa.PrintHelper");
});
