
//var wsurl = "http://wjtts.fortiddns.com:8095/sfa/enhancetest/api/"; //tts test server


//var wsurl="http://enomsfa01.westeurope.cloudapp.azure.com:8095/sfa/enhance_live/api/"; // oracle 

//var wsurl="http://enomsfa01.westeurope.cloudapp.azure.com:8095/sfa/enhance_uat/api/";

//var wsurl="https://routepro.enhance-group.com/api/";

var wsurl="https://routeprouat.enhance-group.com/api/";

var platform= sessionStorage.getItem("platform");
var invoicedetail={};
var invoiceheader={};
var orderrxddetail={};
var invoicerxddetail={};
var promotiondetail={};
var customerinvoice={};
var salesorderdetail={};
var salesorderheader={};
var batchexpirydetail={};
var arheader={};
var ardetail={};
var cashcheckdetail={};
var invetorytransactionheader={};
var inventorytransactiondetail={};
var inventorysummarydetail={};
var nonservicedcustomer={};
var surveyauditdetail={};
var posequipmentchangedetail={};
var posmaster={};
var sigcapturedata={};
var customermaster={};
var customeroperationscontrol={};
var routemaster={};
var routesequencecustomerstatus={};
var customerinventorydetail={};
var customerinventorycheck={};
var visualsfeedback={};
var promotions_remark={};
var customerdistributioncheck={};
var routegoal={};
var nosalesheader={};
var customer_foc_balance={};
var enddaydetail={};
var t_access_override_log={};
var syncflag='';
var redlink='';
var customerimages = {};
var customervisitlog={};
//var clrlog='';
function senddata(flag,url) {
    invoicedetail={};
    invoiceheader={};
    invoicerxddetail={};
    promotiondetail={};
    customerinvoice={};
    salesorderdetail={};
    orderrxddetail={}
    salesorderheader={};
    batchexpirydetail={};
    arheader={};
    ardetail={};
    cashcheckdetail={};
    invetorytransactionheader={};
    inventorytransactiondetail={};
    inventorysummarydetail={};
    nonservicedcustomer={};
    surveyauditdetail={};
    posequipmentchangedetail={};
    posmaster={};
    sigcapturedata={};
    customermaster={};
    customeroperationscontrol={};
    routemaster={};
   routesequencecustomerstatus={};
     customerinventorydetail={};
     customerinventorycheck={};
     visualsfeedback={};
     promotions_remark={};
     customerdistributioncheck={};
    routegoal={};
    nosalesheader={};
    customer_foc_balance={};
    enddaydetail={};
    t_access_override_log={};
    customerimages={};
    syncflag= flag;
    redlink = url;
     customervisitlog={};
	//clrlog=cl;
    $.mobile.showPageLoadingMsg();
    
	if(syncflag=='sale')
	{
		
    //getinvoicedetail();
    getcustomervisitlog();
	}else if(syncflag=='inv')
	{
		
	getinvetorytransactionheader();
	}else
	{
		
	getcustomervisitlog();
	}
   
}


function getcustomervisitlog()
{
	
	if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            invoicedetail[i] = result[i];
                                            
                                        }
                                        
                                    }         
                                              
                                    invoicedetail=JSON.stringify(invoicedetail);                    
                                    getinvoiceheader();                   
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,salesprice,returnprice,stdsalesprice,stdreturnprice,promoqty,salesitemexcisetax,salesitemgsttax,returnitemexcisetax,returnitemgsttax,damageditemexcisetax,damageditemgsttax,fgitemexcisetax,fgitemgsttax,promoitemexcisetax,promoitemgsttax,coopid,batchdetailkey,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,goodreturnprice,goodreturncaseprice,stdgoodreturncaseprice,stdgoodreturnprice,expiryqty,currencycode,returnfreeqty,manualfreeqty,limitedfreeqty,rebaterentqty,fixedrentqty,pricechgindicator,discountamount,discountpercentage,promoamount,replacementqty,replacementprice,replacementcaseprice,promovalue,mdat,returnpromovalue,returnpromoamount,amount,diffround,roundsalesamount from invoicedetail where issync=0"]);
    }
    else if(platform=='Android')
    {
	            var logQry = "SELECT log_id, routekey, routecode, salesmancode, customercode, log_startdate, log_starttime, log_enddate, log_endtime FROM customervisitlog";
                console.log("logQry"+logQry);
	            window.plugins.DataBaseHelper.select(logQry,function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                    	customervisitlog[i] = result.array[i];
                                    }
                                
                                
                            }
                            customervisitlog=JSON.stringify(customervisitlog);  
                            getinvoicedetail();
                         
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}

function getinvoicedetail()
{
	
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            invoicedetail[i] = result[i];
                                            
                                        }
                                        
                                    }         
                                              
                                    invoicedetail=JSON.stringify(invoicedetail);                    
                                    getinvoiceheader();                   
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,salesprice,returnprice,stdsalesprice,stdreturnprice,promoqty,salesitemexcisetax,salesitemgsttax,returnitemexcisetax,returnitemgsttax,damageditemexcisetax,damageditemgsttax,fgitemexcisetax,fgitemgsttax,promoitemexcisetax,promoitemgsttax,coopid,batchdetailkey,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,goodreturnprice,goodreturncaseprice,stdgoodreturncaseprice,stdgoodreturnprice,expiryqty,currencycode,returnfreeqty,manualfreeqty,limitedfreeqty,rebaterentqty,fixedrentqty,pricechgindicator,discountamount,discountpercentage,promoamount,replacementqty,replacementprice,replacementcaseprice,promovalue,mdat,returnpromovalue,returnpromoamount,amount,diffround,roundsalesamount from invoicedetail where issync=0"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,salesprice,returnprice,stdsalesprice,stdreturnprice,promoqty,salesitemexcisetax,salesitemgsttax,returnitemexcisetax,returnitemgsttax,damageditemexcisetax,damageditemgsttax,fgitemexcisetax,fgitemgsttax,promoitemexcisetax,promoitemgsttax,coopid,batchdetailkey,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,goodreturnprice,goodreturncaseprice,stdgoodreturncaseprice,stdgoodreturnprice,expiryqty,currencycode,returnfreeqty,manualfreeqty,limitedfreeqty,rebaterentqty,fixedrentqty,pricechgindicator,discountamount,discountpercentage,promoamount,replacementqty,replacementprice,replacementcaseprice,promovalue,mdat,returnpromovalue,returnpromoamount,amount,diffround,roundsalesamount,amount from invoicedetail where issync=0",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        invoicedetail[i] = result.array[i];
                                    }
                                
                                
                            }
                         invoicedetail=JSON.stringify(invoicedetail);
                         getinvoiceheader();
                },
                function()
                {
                	console.warn("Error calling plugin");
                });
    }
}

function getinvoiceheader()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            invoiceheader[i] = result[i];
                                        }
                                        
                                       
                                    }                    
                                    invoiceheader=JSON.stringify(invoiceheader);                    
                                    getinvoicerxddetail();             
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,salesmancode,presoldordernumber,presalesmancode,presalesroutecode,orderdeliverydate,orderdeliveryroutecode,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,totalfreesampleamount,immediatepaid,amountpaid,invoicebalance,dexflag,dexg86signature,paymenttype,splittransaction,voidflag,transmitindicator,paymentstatus,hhcinvoicenumber,totalpromoamount,gcpaymenttype,hhcdocumentnumber,inventorykey,totaltaxesamount,itemlinetaxamount,totaldiscountamount,voidreasoncode,totalexpiryamount,currencycode,totalmanualfree,totallimitedfree,totalrebaterent,totalfixedrent,actualtransactiondate,boentry,hhctransactionkey,data,comments,totaldiscdistributionamount,totalreplacementamount,comments2,totalbuybackfreeamount,diffround,roundtotalsalesamount from invoiceheader where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,salesmancode,presoldordernumber,presalesmancode,presalesroutecode,orderdeliverydate,orderdeliveryroutecode,CAST(totalinvoiceamount AS VARCHAR) as totalinvoiceamount,CAST(totalsalesamount AS VARCHAR) as totalsalesamount,totalreturnamount,totaldamagedamount,totalfreesampleamount,CAST(immediatepaid AS VARCHAR) as immediatepaid,CAST(amountpaid AS VARCHAR) as amountpaid,CAST(invoicebalance AS VARCHAR) as invoicebalance,dexflag,dexg86signature,paymenttype,splittransaction,voidflag,transmitindicator,paymentstatus,hhcinvoicenumber,totalpromoamount,gcpaymenttype,hhcdocumentnumber,inventorykey,totaltaxesamount,itemlinetaxamount,totaldiscountamount,voidreasoncode,totalexpiryamount,currencycode,totalmanualfree,totallimitedfree,totalrebaterent,totalfixedrent,actualtransactiondate,boentry,hhctransactionkey,data,comments,totaldiscdistributionamount,totalreplacementamount,comments2,totalbuybackfreeamount,diffround,roundtotalsalesamount,headerdiscounttaxamt from invoiceheader where issync=0 and istemp='false'",function(result)
                {
                	
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        invoiceheader[i] = result.array[i];
                                        
                                    }
                                
                                
                            }
                         invoiceheader=JSON.stringify(invoiceheader);
                         getinvoicerxddetail();
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getinvoicerxddetail()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            invoicerxddetail[i] = result[i];
                                        }
                                        
                                        
                                    }                    
                                   invoicerxddetail=JSON.stringify(invoicerxddetail);                     
                                           getpromotiondetail();             
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,itemtranstypeseq,reasoncode,quantity,catchweightqty,weighted,instructioncode,currencycode,expirydate,invoicenumber from invoicerxddetail where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,itemtranstypeseq,reasoncode,quantity,catchweightqty,weighted,instructioncode,currencycode,substr(expirydate, 7, 4) || '-' || substr(expirydate, 4, 2) || '-' || substr(expirydate, 1, 2)as expirydate,invoicenumber from invoicerxddetail where issync=0 and istemp='false'",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        invoicerxddetail[i] = result.array[i];
                                    }
                                
                                
                            }
                         invoicerxddetail=JSON.stringify(invoicerxddetail);
                         getpromotiondetail();
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getpromotiondetail()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            promotiondetail[i] = result[i];
                                        }
                                       
                                        
                                    }                    
                                     promotiondetail=JSON.stringify(promotiondetail);                    
                                           getcustomerinvoice();             
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,promotiontypecode,promotionamount,promotionquantity,catchweightqty,weighted,promotionplannumber,assignmentkey,exclusionoption,promochgindicator,oldpromotionamount,performindicator,performcriteriakey,promotioncaseprice,currencycode from promotiondetail where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,promotiontypecode,promotionamount,promotionquantity,catchweightqty,weighted,promotionplannumber,assignmentkey,exclusionoption,promochgindicator,oldpromotionamount,performindicator,performcriteriakey,promotioncaseprice,currencycode,memo1 from promotiondetail where issync=0 and istemp='false'",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        promotiondetail[i] = result.array[i];
                                    }
                               
                                
                            }
                          promotiondetail=JSON.stringify(promotiondetail);
                         
                         getcustomerinvoice();
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getcustomerinvoice()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            customerinvoice[i] = result[i];
                                        }
                                        
                                        
                                    }                    
                                      customerinvoice=JSON.stringify(customerinvoice);
                                   if(syncflag=='sale')
									{
										//alert("customerinv");
										getbatchexpirydetail();
									}else
									{	
                                          getsalesorderdetail(); 
                                    }										  
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select transactionkey,transactiontype,documentnumber,invoicenumber,transactiondate,transactiontime,customercode,routecode,salesmancode,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,totalfreesampleamount,immediatepaid,amountpaid,dnamountpaid,cnamountpaid,invoicebalance,paymenttype,voidflag,paymentstatus,hhcinvoicenumber,remarks1,remarks2,routestartdate,erpreferencenumber,mdat,totalpromoamount,gcpaymenttype,totaltaxesamount,itemlinetaxamount,totaldiscountamount,pdcindicator,chequecollection,totalexpiryamount,currencycode,pdcbalance,totalmanualfree,totallimitedfree,totalrebaterent,totalfixedrent,data,totaldiscdistributionamount,totalreplacementamount,pdcdate,totalbuybackfreeamount from customerinvoice where issync=0"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select transactionkey,transactiontype,documentnumber,invoicenumber,transactiondate,transactiontime,customercode,routecode,salesmancode,CAST(totalinvoiceamount AS VARCHAR) as totalinvoiceamount,CAST(totalsalesamount AS VARCHAR) as totalsalesamount,totalreturnamount,totaldamagedamount,totalfreesampleamount,CAST(immediatepaid AS VARCHAR) as immediatepaid,CAST(amountpaid AS VARCHAR) as amountpaid,dnamountpaid,cnamountpaid,CAST(invoicebalance AS VARCHAR) as invoicebalance,paymenttype,voidflag,paymentstatus,hhcinvoicenumber,remarks1,remarks2,routestartdate,erpreferencenumber,mdat,totalpromoamount,gcpaymenttype,totaltaxesamount,itemlinetaxamount,totaldiscountamount,pdcindicator,chequecollection,totalexpiryamount,currencycode,pdcbalance,totalmanualfree,totallimitedfree,totalrebaterent,totalfixedrent,data,totaldiscdistributionamount,totalreplacementamount,pdcdate,totalbuybackfreeamount,duedate from customerinvoice where issync=0",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        customerinvoice[i] = result.array[i];
                                    }
                                
                               
                            }
                         customerinvoice=JSON.stringify(customerinvoice);
						 if(syncflag=='sale')
						 {
							getbatchexpirydetail(); 
						 }else
						 {
							getsalesorderdetail();
						 }	
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getsalesorderdetail()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            salesorderdetail[i] = result[i];
                                        }
                                        
                                       
                                    }                    
                                   salesorderdetail=JSON.stringify(salesorderdetail);                     
                                                getsalesorderheader();        
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,salesprice,returnprice,stdsalesprice,stdreturnprice,coopid,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,currencycode,allocated,freegoodcases,freegoodpcs,salespcs,allocatedcases,salescases,allocatedpcs,returncases,returnpcs from salesorderdetail where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select sod.routekey,sod.visitkey,sod.transactionkey,CAST(sod.itemcode as VARCHAR)as itemcode,sod.salesqty,sod.returnqty,sod.damagedqty,sod.freesampleqty,sod.manualfreeqty,sod.salesprice,sod.returnprice,sod.stdsalesprice,sod.stdreturnprice,sod.coopid, sod.salescaseprice,sod.returncaseprice,sod.stdsalescaseprice, sod.stdreturncaseprice,sod.currencycode,sod.allocated,sod.freegoodcases,sod.freegoodpcs,sod.salespcs,sod.allocatedcases,salescases,allocatedpcs,returncases,returnpcs,promoamount,salesordervat,salesorderexcisetax,returnvat,returnexcisetax,damagedvat,damagedexcisetax,promovat,promoexcisetax,fgvat,fgexcisetax from salesorderdetail sod left join salesorderheader soh on sod.visitkey=soh.visitkey and sod.routekey=soh.routekey where soh.dexflag=0 and sod.issync=0 and sod.istemp='false'",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        salesorderdetail[i] = result.array[i];
                                    }
                               
                                
                            }
                         salesorderdetail=JSON.stringify(salesorderdetail);
                         getorderrxddetail();
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getorderrxddetail()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            invoicerxddetail[i] = result[i];
                                        }
                                        
                                        
                                    }                    
                                   invoicerxddetail=JSON.stringify(invoicerxddetail);                     
                                           getpromotiondetail();             
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,itemtranstypeseq,reasoncode,quantity,catchweightqty,weighted,instructioncode,currencycode,expirydate,invoicenumber from invoicerxddetail where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,itemtranstypeseq,reasoncode,quantity,catchweightqty,weighted,instructioncode,substr(expirydate, 7, 4) || '-' || substr(expirydate, 4, 2) || '-' || substr(expirydate, 1, 2) as expirydate from orderrxddetail where issync=0 and istemp='false'",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                    	orderrxddetail[i] = result.array[i];
                                    }
                                
                                
                            }
                         orderrxddetail=JSON.stringify(orderrxddetail);
                         getsalesorderheader();
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}


function getsalesorderheader()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            salesorderheader[i] = result[i];
                                        }
                                        
                                        
                                    }                    
                                    salesorderheader=JSON.stringify(salesorderheader);                    
                                   getbatchexpirydetail();                     
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,CAST(salesmancode AS VARCHAR) salesmancode,orderdeliveryroutecode,orderdeliverydate,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,dexflag,splittransaction,voidflag,transmitindicator,hhcinvoicenumber,paymenttype,hhcdocumentnumber,voidreasoncode,advanceused,paymentstatus,advancebalance,mdat,advancereceived,currencycode,status,refnumber,totalfreesampleamount,deliverystatus,data,comments,actualtransactiondate,comments2,hhctransactionkey,totalpromoamount,totalbuybackfreeamount from salesorderheader where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,CAST(salesmancode AS VARCHAR) salesmancode,orderdeliveryroutecode,orderdeliverydate,CAST(totalinvoiceamount AS VARCHAR) as totalinvoiceamount,CAST(totalsalesamount AS VARCHAR) as totalsalesamount,totalreturnamount,totaldamagedamount,dexflag,splittransaction,voidflag,transmitindicator,hhcinvoicenumber,paymenttype,hhcdocumentnumber,voidreasoncode,advanceused,paymentstatus,advancebalance,mdat,advancereceived,currencycode,status,refnumber,totalfreesampleamount,deliverystatus,data,comments,actualtransactiondate,comments2,hhctransactionkey,totalpromoamount,totalbuybackfreeamount,totallineitemtax from salesorderheader where issync=0 and istemp='false' and dexflag=0 and confirmorder = 1",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        salesorderheader[i] = result.array[i];
                                    }
                                
                                
                            }
                         salesorderheader=JSON.stringify(salesorderheader);
                         getbatchexpirydetail();
                },
                function()
                {
                	console.warn("Error calling plugin");
                });
    }
}
function getbatchexpirydetail()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            batchexpirydetail[i] = result[i];
                                        }
                                        
                                        
                                    }                    
                                   batchexpirydetail=JSON.stringify(batchexpirydetail);                     
                                             getarheader();            
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,batchdetailkey,batchnumber,itemcode,expirydate,quantity,transactiontypecode,visitkey from batchexpirydetail where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,batchdetailkey,batchnumber,itemcode,expirydate,quantity,transactiontypecode,visitkey from batchexpirydetail where issync=0 and istemp='false'",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        batchexpirydetail[i] = result.array[i];
                                    }
                                
                                
                            }
                         batchexpirydetail=JSON.stringify(batchexpirydetail);
                      
						 if(syncflag=='inv')
						 {
						 //alert("batch");
						
						 
							if(sessionStorage.getItem("havevariance")!='1')
							{
							
								 uploaddata();
							}
						else
							{ 
							//alert("there is varinace");
							variance_getcustomeroperationcontrol();
							
							}
						 
						 
						 
						 
						 }else
						 {
                          getarheader();
						 }
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getarheader()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            arheader[i] = result[i];
                                        }
                                        
                                       
                                    }                    
                                    arheader=JSON.stringify(arheader);                    
                                        getardetail();                
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select transactionkey,routekey,visitkey,documentnumber,transactiondate,transactiontime,customercode,routecode,salesmancode,voidflag,splittransaction,transmitindicator,totalinvoiceamount,amountpaid,invoicebalance,invoicenumber,hhcdocumentnumber,hhcinvoicenumber,voidreasoncode,chequecollection,currencycode,hhctransactionkey,data,comments,advancepaymentflag,excesspayment,comments2 from arheader where issync=0"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select transactionkey,routekey,visitkey,documentnumber,transactiondate,transactiontime,customercode,routecode,salesmancode,voidflag,splittransaction,transmitindicator,CAST(totalinvoiceamount AS VARCHAR) as totalinvoiceamount,CAST(amountpaid AS VARCHAR) as amountpaid,CAST(invoicebalance AS VARCHAR) as invoicebalance,invoicenumber,hhcdocumentnumber,hhcinvoicenumber,voidreasoncode,chequecollection,currencycode,hhctransactionkey,data,comments,advancepaymentflag,excesspayment,comments2,deductionflag from arheader where issync=0 and istemp='false' and invoicenumber>0",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        arheader[i] = result.array[i];
                                    }
                                
                                
                            }
                         
                         arheader=JSON.stringify(arheader);
                         
                       
                         getardetail();
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getardetail()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            ardetail[i] = result[i];
                                        }
                                       
                                        
                                    }                    
                                      ardetail=JSON.stringify(ardetail);                   
                                    getcashcheckdetail();              
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,visitkey,transactionkey,invoicenumber,invoicedate,totalinvoiceamount,onacctreasoncode,amountpaid,invoicebalance,arcollectiontype,chequestatusindicator,sapchequestatusindicator,currencycode,pdcbalance,alternateinvoicenumber from ardetail where issync=0"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,visitkey,transactionkey,invoicenumber,invoicedate,CAST(totalinvoiceamount AS VARCHAR) as totalinvoiceamount,onacctreasoncode,CAST(amountpaid AS VARCHAR) as amountpaid,CAST(invoicebalance AS VARCHAR) as invoicebalance,arcollectiontype,chequestatusindicator,sapchequestatusindicator,currencycode,pdcbalance,alternateinvoicenumber,deductionamount from ardetail where issync=0",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        ardetail[i] = result.array[i];
                                    }
                              
                                
                            }
                           ardetail=JSON.stringify(ardetail);
                        getcashcheckdetail();
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getcashcheckdetail()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            cashcheckdetail[i] = result[i];
                                        }
                                        
                                        
                                    } 
                                    cashcheckdetail=JSON.stringify(cashcheckdetail);                   
                                      getinvetorytransactionheader();              
                                                        
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,visitkey,typecode,checknumber,amount,updateindicator,checkdate,bankcode,checkstatus,branchcode,drawercode,chequestatusindicator,sapchequestatusindicator,currencycode,hhctransactionkey,paymenttype,checktype,transactiontype from cashcheckdetail where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,visitkey,typecode,checknumber,CAST(amount AS VARCHAR) as amount,updateindicator,checkdate,bankcode,checkstatus,branchcode,drawercode,chequestatusindicator,sapchequestatusindicator,currencycode,hhctransactionkey,paymenttype,checktype,transactiontype from cashcheckdetail where issync=0 and istemp='false'",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        cashcheckdetail[i] = result.array[i];
                                    }
                                
                                
                            }
                            cashcheckdetail=JSON.stringify(cashcheckdetail);
							if(syncflag=='sale')
							{
							//alert("cashchk");
							getinventorysummarydetail(); 
							}
							else
							{
							getinvetorytransactionheader();
							}
                         
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getinvetorytransactionheader()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            invetorytransactionheader[i] = result[i];
                                        }
                                        
                                        
                                    } 
                                    invetorytransactionheader=JSON.stringify(invetorytransactionheader);                   
                                       getinventorytransactiondetail();           
                                                        
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select inventorykey,detailkey,routekey,transactiontype,routecode,salesmancode,transactiondate,transactiontime,documentnumber,odometerreading,transferlocationcode,referencenumber,requestdate,securitycode,transmitindicator,voidflag,hhcdocumentnumber,loadnumber,refdocumentnumber,currencycode,actualtransactiondate,inventorynumber,data from inventorytransactionheader where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select inventorykey,detailkey,routekey,transactiontype,routecode,CAST(salesmancode AS VARCHAR) salesmancode,transactiondate,transactiontime,documentnumber,odometerreading,transferlocationcode,referencenumber,requestdate,securitycode,transmitindicator,voidflag,CAST(hhcdocumentnumber AS VARCHAR) hhcdocumentnumber,loadnumber,refdocumentnumber,currencycode,actualtransactiondate,inventorynumber,data,isurgent from inventorytransactionheader where issync=0 and istemp='false'",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        invetorytransactionheader[i] = result.array[i];
                                    }
                                
                                
                            }
                            invetorytransactionheader=JSON.stringify(invetorytransactionheader);
                            getinventorytransactiondetail();
                         
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}

function getinventorytransactiondetail()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            inventorytransactiondetail[i] = result[i];
                                        }
                                        
                                        
                                    } 
                                    inventorytransactiondetail=JSON.stringify(inventorytransactiondetail);                   
                                    getinventorysummarydetail();            
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,detailkey,transactiontypecode,itemcode,quantity,weighted,itemprice,batchdetailkey,itemcaseprice,currencycode from inventorytransactiondetail where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,detailkey,transactiontypecode,itemcode,quantity,weighted,itemprice,batchdetailkey,itemcaseprice,currencycode,reasoncode,substr(expirydate, 7, 4) || '-' || substr(expirydate, 4, 2) || '-' || substr(expirydate, 1, 2)as expirydate from inventorytransactiondetail where issync=0 and istemp='false'",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        inventorytransactiondetail[i] = result.array[i];
                                    }
                                
                                
                            }
                            inventorytransactiondetail=JSON.stringify(inventorytransactiondetail);
                         getinventorysummarydetail();
                         
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getinventorysummarydetail()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            inventorysummarydetail[i] = result[i];
                                        }
                                        
                                        
                                    } 
                                    inventorysummarydetail=JSON.stringify(inventorysummarydetail);                   
                                      getnonservicedcustomer();                
                                                        
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select inventorykey,itemcode,routekey,weighted,beginstockqty,loadqty,loadaddqty,loadcutqty,loadreqqty,saleqty,returnqty,damagedaddqty,damagedcutqty,endstockqty,unloadqty,damagedunloadqty,freesampleqty,truckdamagedunloadqty,stdsalesprice,stdreturnprice,cashsalesqty,cashsalesvalue,tcsalesqty,tcsalesvalue,gcsalesqty,gcsalesvalue,cashdamagedqty,cashdamagedvalue,tcdamagedqty,tcdamagedvalue,gcdamagedqty,gcdamagedvalue,cashreturnqty,cashreturnvalue,tcreturnqty,tcreturnvalue,gcreturnqty,gcreturnvalue,promoqty,cashsalesitemexcisetax,cashsalesitemgsttax,cashreturnitemexcisetax,cashreturnitemgsttax,cashdamageditemexcisetax,cashdamageditemgsttax,cashfgitemexcisetax,cashfgitemgsttax,cashpromoitemexcisetax,cashpromoitemgsttax,tcsalesitemexcisetax,tcsalesitemgsttax,tcreturnitemexcisetax,tcreturnitemgsttax,tcdamageditemexcisetax,tcdamageditemgsttax,tcfgitemexcisetax,tcfgitemgsttax,tcpromoitemexcisetax,tcpromoitemgsttax,gcsalesitemexcisetax,gcsalesitemgsttax,gcreturnitemexcisetax,gcreturnitemgsttax,gcdamageditemexcisetax,gcdamageditemgsttax,gcfgitemexcisetax,gcfgitemgsttax,gcpromoitemexcisetax,gcpromoitemgsttax,batchdetailkey,stdsalescaseprice,stdreturncaseprice,expiryqty,stdgoodreturncaseprice,stdgoodreturnprice,currencycode,returnfreeqty,damageqty,expdmgfreeqty,expunloadqty,dmgunloadqty,expdmgfreeunloadqty,rentqty,mdat,freshunloadqty,emptycontainerqty,emptycontainerunloadqty from inventorysummarydetail where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select inventorykey,itemcode,routekey,weighted,beginstockqty,loadqty,loadaddqty,loadcutqty,loadreqqty,saleqty,returnqty,damagedaddqty,damagedcutqty,endstockqty,unloadqty,damagedunloadqty,freesampleqty,truckdamagedunloadqty,stdsalesprice,stdreturnprice,cashsalesqty,cashsalesvalue,tcsalesqty,tcsalesvalue,gcsalesqty,gcsalesvalue,cashdamagedqty,cashdamagedvalue,tcdamagedqty,tcdamagedvalue,gcdamagedqty,gcdamagedvalue,cashreturnqty,cashreturnvalue,tcreturnqty,tcreturnvalue,gcreturnqty,gcreturnvalue,promoqty,cashsalesitemexcisetax,cashsalesitemgsttax,cashreturnitemexcisetax,cashreturnitemgsttax,cashdamageditemexcisetax,cashdamageditemgsttax,cashfgitemexcisetax,cashfgitemgsttax,cashpromoitemexcisetax,cashpromoitemgsttax,tcsalesitemexcisetax,tcsalesitemgsttax,tcreturnitemexcisetax,tcreturnitemgsttax,tcdamageditemexcisetax,tcdamageditemgsttax,tcfgitemexcisetax,tcfgitemgsttax,tcpromoitemexcisetax,tcpromoitemgsttax,gcsalesitemexcisetax,gcsalesitemgsttax,gcreturnitemexcisetax,gcreturnitemgsttax,gcdamageditemexcisetax,gcdamageditemgsttax,gcfgitemexcisetax,gcfgitemgsttax,gcpromoitemexcisetax,gcpromoitemgsttax,batchdetailkey,stdsalescaseprice,stdreturncaseprice,expiryqty,stdgoodreturncaseprice,stdgoodreturnprice,currencycode,returnfreeqty,damageqty,expdmgfreeqty,expunloadqty,dmgunloadqty,expdmgfreeunloadqty,rentqty,mdat,freshunloadqty,emptycontainerqty,emptycontainerunloadqty from inventorysummarydetail where issync=0 and istemp='false'",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        inventorysummarydetail[i] = result.array[i];
                                    }
                                
                                
                            }
                            inventorysummarydetail=JSON.stringify(inventorysummarydetail);
						
                         if(syncflag=='sale')
						 {
						 
                        	 getroutesequencecustomerstatus();     
						 }else  if(syncflag=='inv')
						 {
						   getbatchexpirydetail();						
						 }else
						 {
						  getnonservicedcustomer();
						 
						 }
                         
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getnonservicedcustomer()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            nonservicedcustomer[i] = result[i];
                                        }
                                        
                                        
                                    } 
                                    nonservicedcustomer=JSON.stringify(nonservicedcustomer);                   
                                    getsurveyauditdetail();                 
                                                        
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,customercode,reasoncode from nonservicedcustomer where issync=0"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,customercode,reasoncode from nonservicedcustomer where issync=0",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        nonservicedcustomer[i] = result.array[i];
                                        
                                    }
                                
                                
                            }
                            nonservicedcustomer=JSON.stringify(nonservicedcustomer);
                            //alert(nonservicedcustomer);
                        getsurveyauditdetail();
                         
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getsurveyauditdetail()
{
     if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            surveyauditdetail[i] = result[i];
                                        }
                                        
                                        
                                    } 
                                    surveyauditdetail=JSON.stringify(surveyauditdetail);                   
                                            getposequipmentchangedetail();       
                                                        
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,visitkey,surveydefkey,surveypage,surveyindex,surveyrectype,lookuptype,surveyresponse from surveyauditdetail where issync=0"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,visitkey,surveydefkey,surveypage,surveyindex,surveyrectype,lookuptype,surveyresponse from surveyauditdetail where issync=0",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        surveyauditdetail[i] = result.array[i];
                                    }
                                
                                
                            }
                            surveyauditdetail=JSON.stringify(surveyauditdetail);
                        getposequipmentchangedetail();
                         
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getposequipmentchangedetail()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            posequipmentchangedetail[i] = result[i];
                                        }
                                        
                                        
                                    } 
                                    posequipmentchangedetail=JSON.stringify(posequipmentchangedetail);                   
                                    getposmaster();              
                                                        
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,visitkey,posaction,itemcode,quantity,serialnumber,instructioncode from posequipmentchangedetail where issync=0"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,visitkey,posaction,itemcode,quantity,serialnumber,instructioncode from posequipmentchangedetail where issync=0",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        posequipmentchangedetail[i] = result.array[i];
                                    }
                                
                                
                            }
                            posequipmentchangedetail=JSON.stringify(posequipmentchangedetail);
                            getposmaster();
                         
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getposmaster()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            posmaster[i] = result[i];
                                        }
                                        
                                        
                                    } 
                                    posmaster=JSON.stringify(posmaster);                   
                                    getsigcapturedata();                 
                                                        
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select itemcode,alternatecode,itemdescription,arbitemdescription,itemvalue,inventorytype,created,cdat,modified,mdat,activestatus from posmaster where issync=0"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select itemcode,alternatecode,itemdescription,arbitemdescription,itemvalue,inventorytype,created,cdat,modified,mdat,activestatus from posmaster where issync=0",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        posmaster[i] = result.array[i];
                                    }
                                
                                
                            }
                            posmaster=JSON.stringify(posmaster);
                         getsigcapturedata();
                         
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getsigcapturedata()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            sigcapturedata[i] = result[i];
                                        }
                                        
                                        
                                    } 
                                    sigcapturedata=JSON.stringify(sigcapturedata);                   
                                    getcustomermaster();               
                                                        
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,visitkey,transactionkey,customercode,documentnumber,transactiondate,transactiontime,balancedueamount,signaturedata,transaction_type from sigcapturedata where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,visitkey,transactionkey,customercode,documentnumber,transactiondate,transactiontime,balancedueamount,signaturedata,transaction_type from sigcapturedata where issync=0 and istemp='false'",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        sigcapturedata[i] = result.array[i];
                                    }
                                
                                
                            }
                            sigcapturedata=JSON.stringify(sigcapturedata);
                         getcustomermaster();
                         
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function getcustomermaster()
{
	
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            customermaster[i] = result[i];
                                        }
                                        
                                        
                                    } 
                                    customermaster=JSON.stringify(customermaster);                   
                                    getcustomeroperationcontrol();                 
                                                        
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select customercode,type,headofficecode,routecode,streetcode,districtcode,locationcode,customersequence,customername,customeraddress1,customeraddress2,customerphone,balance,customercategory,pricingkey,promotionkey,authorizeditemgrpkey,messagekey1,messagekey2,invoicepaymentterms,invoiceretailoption,invoicepriceoverride,invoiceretailoverride,invoiceformatoption,invoiceextensionopt,invoicedsdpromptopt,invoicecopies,salesinputoprion,returnsinputoption,invoiceinputstyle,onhandspromptopt,inventoryselectopt,invencontaineropt,queuedreportoption,surveykey,contactname,customertype,callfrequency,routenumber,arbcustomernameshort,arbcustomername,arbcustomeraddress1,arbcustomeraddress2,hhccustomernameshort,hhccustomername,hhccustomeraddress1,hhccustomeraddress2,allowbeyondlimit,tclimit,activecustomer,creditlimitdays,created,cdat,modified,mdat,forcehand,renteddisplay,installedchiller,monthlydepreciation,typeofgiveaway,giveawayflag,lastvisiteddate,memo1,memo2,tcsubtype,rentperc,customeraddress3,customercity,customerstate,customerzip,authorizeditemlistctl,invoicepriceprint,messagekey3,messagekey4,messagekey5,messagekey6,orderformat,enableupcprint,enabledelayprint,printsequence,enablepriceeditinvs,enablesellprevious,enablesuggestsales,enableautofillreturns,enableautofilldamaged,enablesigcapture,enablereturnstrxn,enableexchangetrxn,enabledamagedreturns,enablearcollection,enablesurveyaudit,enabledelivinstruct,enableinvoicecomment,invoicedetailentry,orderdetailentry,forcestockcapture,enablepromotrxn,alternatecode,creditlimit,allowcashoncreditexceed,arbcustomeraddress3,templateindicator,templatename,arbcontactname,printlanguageflag,quantumno,lostplacementdelivs,newplacementdelivs,currencycode,histmaxdeliveries,arcustomertype,custtaxkey1,custtaxkey2,custtaxkey3,customertaxid,customertaxidoptions,outletsubtype,volume,enablegovtaxnote,forwardcoverfactor,enablepromoeditinvs,enableaddlpromoinvs,badcreditcustomer,enableduplicateprinting,numoutstandinginv,enablefocprinting,promooptions,groupcode,forceposcheck,ancustomercode,printoutletitemcode,reportprintcontrol,invoicelimiter,exclusiveopmode,returnpromotionkey,invoiceformat,liquorlicprint,enablepromoeditords,enableaddlpromoords,enableaddlpromoinvoices,enableposequipment,enablesalestrxn,enableadvancepayment,printcheckdetails,tcspecialdiscount,spldiscountdays,arabiccustomercity,threshholdlimit,discountkey,enforcepromotion,gpcustcode,cashonlypromo,roundnetamount,partialcollection,transactiontype,enabledraftcopy,enablebuybackfree,enablecpd,enablepaymentsel,gpsdata,fixedlatitude,fixedlongitude,rentkey,startdate,enddate,definitionvalue,runningvalue,rentcontrol,disablebalanceupdate,enablecreditlimit,autosettlecollection,enableinvoicecopy,pobox,shoptelephonenumber,shopfaxnumber,ownername,ownerlandlinenumber,ownermobilenumber,contactpersonlandlinenumber,contactpersonmobilenumber,contactpersonemail,purchasemanagername,purchasemanagerlandlinenumber,purchasemanagermobilenumber,purchasemanageremail,warehousemanagername,warehousemanagerlandlinenumber,warehousemanagermobilenumber,warehousemanageremail,expirylimit,exprunningvalue,distributionkey,gpssavecount,graceperiod,reportcustcode,enablerental from customermaster where issync=0"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select customercode,type,headofficecode,routecode,streetcode,districtcode,locationcode,customersequence,customername,customeraddress1,customeraddress2,customerphone,balance,customercategory,pricingkey,promotionkey,authorizeditemgrpkey,messagekey1,messagekey2,invoicepaymentterms,invoiceretailoption,invoicepriceoverride,invoiceretailoverride,invoiceformatoption,invoiceextensionopt,invoicedsdpromptopt,invoicecopies,salesinputoprion,returnsinputoption,invoiceinputstyle,onhandspromptopt,inventoryselectopt,invencontaineropt,queuedreportoption,surveykey,contactname,customertype,callfrequency,routenumber,arbcustomernameshort,arbcustomername,arbcustomeraddress1,arbcustomeraddress2,hhccustomernameshort,hhccustomername,hhccustomeraddress1,hhccustomeraddress2,allowbeyondlimit,tclimit,activecustomer,creditlimitdays,created,cdat,modified,mdat,forcehand,renteddisplay,installedchiller,monthlydepreciation,typeofgiveaway,giveawayflag,lastvisiteddate,memo1,memo2,tcsubtype,rentperc,customeraddress3,customercity,customerstate,customerzip,authorizeditemlistctl,invoicepriceprint,messagekey3,messagekey4,messagekey5,messagekey6,orderformat,enableupcprint,enabledelayprint,printsequence,enablepriceeditinvs,enablesellprevious,enablesuggestsales,enableautofillreturns,enableautofilldamaged,enablesigcapture,enablereturnstrxn,enableexchangetrxn,enabledamagedreturns,enablearcollection,enablesurveyaudit,enabledelivinstruct,enableinvoicecomment,invoicedetailentry,orderdetailentry,forcestockcapture,enablepromotrxn,alternatecode,creditlimit,allowcashoncreditexceed,arbcustomeraddress3,templateindicator,templatename,arbcontactname,printlanguageflag,quantumno,lostplacementdelivs,newplacementdelivs,currencycode,histmaxdeliveries,arcustomertype,custtaxkey1,custtaxkey2,custtaxkey3,customertaxid,customertaxidoptions,outletsubtype,volume,enablegovtaxnote,forwardcoverfactor,enablepromoeditinvs,enableaddlpromoinvs,badcreditcustomer,enableduplicateprinting,numoutstandinginv,enablefocprinting,promooptions,groupcode,forceposcheck,ancustomercode,printoutletitemcode,reportprintcontrol,invoicelimiter,exclusiveopmode,returnpromotionkey,invoiceformat,liquorlicprint,enablepromoeditords,enableaddlpromoords,enableaddlpromoinvoices,enableposequipment,enablesalestrxn,enableadvancepayment,printcheckdetails,tcspecialdiscount,spldiscountdays,arabiccustomercity,threshholdlimit,discountkey,enforcepromotion,gpcustcode,cashonlypromo,roundnetamount,partialcollection,transactiontype,enabledraftcopy,enablebuybackfree,enablecpd,enablepaymentsel,gpsdata,fixedlatitude,fixedlongitude,rentkey,startdate,enddate,definitionvalue,runningvalue,rentcontrol,disablebalanceupdate,enablecreditlimit,autosettlecollection,enableinvoicecopy,pobox,shoptelephonenumber,shopfaxnumber,ownername,ownerlandlinenumber,ownermobilenumber,contactpersonlandlinenumber,contactpersonmobilenumber,contactpersonemail,purchasemanagername,purchasemanagerlandlinenumber,purchasemanagermobilenumber,purchasemanageremail,warehousemanagername,warehousemanagerlandlinenumber,warehousemanagermobilenumber,warehousemanageremail,expirylimit,exprunningvalue,distributionkey,gpssavecount,graceperiod,reportcustcode,enablerental from customermaster where issync=0",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        customermaster[i] = result.array[i];
                                    }
                                
                                
                            }
                            customermaster=JSON.stringify(customermaster);
                            getcustomeroperationcontrol();
                         
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}

function getcustomeroperationcontrol()
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
                      if(result!='')
                      {
                          for(i=0;i<result.length;i++)
                          {
                          customeroperationscontrol[i] = result[i];
                          }
                      
                      
                      } 
                      customeroperationscontrol=JSON.stringify(customeroperationscontrol);                   
                      getroutemaster();
                      
                      },
                      function(error) {
                      alert(error);},
                      "PluginClass", 
                      "GetfielddataMethod", 
                      ["select visitkey,routekey,customercode,routecode,salesmancode,odometerreading,visitstartdate,visitstarttime,visitenddate,visitendtime,totaltransactions,addedcustomer,voidflag,scannerindicator,reasoncode,latitude,longitude,radius from customeroperationscontrol where issync=0"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.select("select visitkey,routekey,customercode,routecode,salesmancode,odometerreading,visitstartdate,visitstarttime,visitenddate,visitendtime,totaltransactions,addedcustomer,voidflag,scannerindicator,reasoncode,CAST(latitude AS VARCHAR) as latitude,CAST(longitude AS VARCHAR) as longitude,radius,log_id from customeroperationscontrol where issync=0",function(result)
                                             {
                                             if(!$.isEmptyObject(result))
                                             {
                                                 for(i=0;i<result.array.length;i++)
                                                 {
                                                 customeroperationscontrol[i] = result.array[i];
                                                 }
                                                 
                                             }
                                             customeroperationscontrol=JSON.stringify(customeroperationscontrol);
                                            // console.log(customeroperationscontrol);
                                             //alert(customeroperationscontrol);
											 if(syncflag=='sale')
											 {
												get_t_access_override_log_for_sales();
												
												
											 }else
											 {
											 getroutemaster();
											 }											 
                                             
                                             },
                                             function()
                                             {
                                             console.warn("Error calling plugin");
                                             });
    }
}

function get_t_access_override_log_for_sales()
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            if(result!='')
            {
                for(i=0;i<result.length;i++)
                {
                    t_access_override_log[i] = result[i];
                    
                }
                
                
            }         
            
            t_access_override_log=JSON.stringify(t_access_override_log);                    
            getenddaydetail();
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "GetfielddataMethod", 
        ["select routekey,visitkey,type,routecode,customercode,salesmancode,featureid,accesskey,accesstime,voidflag,validflag from t_access_override_log where issync=0"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.select("select routekey,visitkey,type,routecode,customercode,salesmancode,featureid,accesskey,accesstime,voidflag,validflag from t_access_override_log where issync=0",function(result)
        {
            if(!$.isEmptyObject(result))
            {
                for(i=0;i<result.array.length;i++)
                {
                    t_access_override_log[i] = result.array[i];
                }
                
                
            }
            t_access_override_log=JSON.stringify(t_access_override_log);
            getSalessigcapturedata(); 
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}


//Second Sig Capture functionn to upload data

function getSalessigcapturedata() {
	if (platform == 'iPad') {
		Cordova
				.exec(
						function(result) {
							if (result != '') {
								for (i = 0; i < result.length; i++) {
									sigcapturedata[i] = result[i];
								}

							}
							sigcapturedata = JSON.stringify(sigcapturedata);
							getcustomermaster();

						},
						function(error) {
							alert(error);
						},
						"PluginClass",
						"GetfielddataMethod",
						[ "select routekey,visitkey,transactionkey,customercode,documentnumber,transactiondate,transactiontime,balancedueamount,signaturedata,transaction_type from sigcapturedata where issync=0 and istemp='false'" ]);
	} else if (platform == 'Android') {
		window.plugins.DataBaseHelper
				.select("select routekey,visitkey,transactionkey,customercode,documentnumber,transactiondate,transactiontime,balancedueamount,signaturedata,transaction_type from sigcapturedata where issync=0 and istemp='false'", function(result) {
							if (!$.isEmptyObject(result)) {
								for (i = 0; i < result.array.length; i++) {
									sigcapturedata[i] = result.array[i];
								}

							}
							sigcapturedata = JSON.stringify(sigcapturedata);
							uploaddata();

						}, function() {
							console.warn("Error calling plugin");
						});
	}
}


function getroutemaster()
{//alert("getroutemaster");
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
                      if(result!='')
                      {
                      for(i=0;i<result.length;i++)
                      {
                      routemaster[i] = result[i];
                      }
                      
                      
                      } 
                      routemaster=JSON.stringify(routemaster);                   
                     getroutesequencecustomerstatus();
                      
                      },
                      function(error) {
                      alert(error);},
                      "PluginClass", 
                      "GetfielddataMethod", 
                      ["select routecode,routename,arbroutename,subareacode,salesmancode,created,cdat,modified,mdat,memo1,memo2,hhcordseq,hhcinvseq,hhccshseq,hhcivtseq,bodocseq,boinvseq,vehiclenumber,vehicleodometer,enablescanneruse,password1,password2,password3,password4,password5,passwordarray01,passwordarray02,passwordarray03,passwordarray04,passwordarray05,passwordarray06,passwordarray07,passwordarray08,passwordarray09,passwordarray10,passwordarray11,passwordarray12,passwordarray13,passwordarray14,passwordarray15,passwordarray16,enabledelayprint,promptodominput,enableeodexpenses,enableeodadjchecks,enableeodaddchecks,reqeoddepositreport,reqeodsalesreport,reqeodrteactivreport,reqeodrtestlmtreport,reqeodroutereviewrpt,reqeodrtnexchreport,reqeodplacementsrpt,reqeodprcchgreport,reqeodpromosreport,reqeodnosalereport,reqeodnondelreport,reqeodexceptionrpt,reqeodunauthbalance,reqeodroasummary,inventorycaseinput,loadreqreportformat,includeloadrequest,loadoutadjustments,autocalculateloadin,requireloadin,loadsheetreport,inventoryvariance,invenoversell,enablenosale,enablepostvoid,cashbalance,amountdecimaldigits,unloadoversellmessage,displayinvsummary,alternateroutecode,enabledamagedtrxn,defaultdeliverydays,reqeodnonscannedreport,reqeododomlogreport,inventoryvalueprint,loadaccessafterunload,creditlimit,routebalance,depotrouteflag,routeinventoryvariance,allowpopulateload,allowroutestartdayflag,enableaddcustomer,allowgctocash,usesalesdateflag,enablestartdaydatetimeedit,newcustomerseqnumber,enableloadtransfer,loadreqmethod,loadreqrolluporders,routeprinter,depotprinter,routetype,enablescancustomer,enforcecallsequence,enablefoclimit,enablemiddaytelecom,printdocumentnumber,activestatus,enablecashonlydiscount,eodreportcontrol,pdcthreshold,itemcodedisplay,routeitemgrpcode,itemdescriptiondisplay,lastcustomersequence,loadsecurityflag,routecatcode,usealternatecodes,enabledraftcopy,boarseq,boordseq,hhcarseq,hhcloadseq,boloadseq,deliveryroute,presalesorder,hhcappversion,usesequenceflag,customerseq,routeseqno,allowbalcheck,allowedradius,cmpycode,regionmstcode,expirylimit,runningvalue,maximumgpsallowed,transactionnoseq,routetmpl,templatename,enablestockicon,generatehhcseqfromboflag,tlockstatus,enablefreereason,inventoryreportcontrol,enablestartdayrtewkdayedit from routemaster where routecode="+sessionStorage.getItem("RouteCode")]);
    }
    else if(platform=='Android')
    {
    
        window.plugins.DataBaseHelper.select("select routecode,routename,arbroutename,subareacode,salesmancode,created,cdat,modified,mdat,memo1,memo2,hhcordseq,hhcinvseq,hhccshseq,hhcivtseq,bodocseq,boinvseq,vehiclenumber,vehicleodometer,enablescanneruse,password1,password2,password3,password4,password5,passwordarray01,passwordarray02,passwordarray03,passwordarray04,passwordarray05,passwordarray06,passwordarray07,passwordarray08,passwordarray09,passwordarray10,passwordarray11,passwordarray12,passwordarray13,passwordarray14,passwordarray15,passwordarray16,enabledelayprint,promptodominput,enableeodexpenses,enableeodadjchecks,enableeodaddchecks,reqeoddepositreport,reqeodsalesreport,reqeodrteactivreport,reqeodrtestlmtreport,reqeodroutereviewrpt,reqeodrtnexchreport,reqeodplacementsrpt,reqeodprcchgreport,reqeodpromosreport,reqeodnosalereport,reqeodnondelreport,reqeodexceptionrpt,reqeodunauthbalance,reqeodroasummary,inventorycaseinput,loadreqreportformat,includeloadrequest,loadoutadjustments,autocalculateloadin,requireloadin,loadsheetreport,inventoryvariance,invenoversell,enablenosale,enablepostvoid,cashbalance,amountdecimaldigits,unloadoversellmessage,displayinvsummary,alternateroutecode,enabledamagedtrxn,defaultdeliverydays,reqeodnonscannedreport,reqeododomlogreport,inventoryvalueprint,loadaccessafterunload,creditlimit,routebalance,depotrouteflag,routeinventoryvariance,allowpopulateload,allowroutestartdayflag,enableaddcustomer,allowgctocash,usesalesdateflag,enablestartdaydatetimeedit,newcustomerseqnumber,enableloadtransfer,loadreqmethod,loadreqrolluporders,routeprinter,depotprinter,routetype,enablescancustomer,enforcecallsequence,enablefoclimit,enablemiddaytelecom,printdocumentnumber,activestatus,enablecashonlydiscount,eodreportcontrol,pdcthreshold,itemcodedisplay,routeitemgrpcode,itemdescriptiondisplay,lastcustomersequence,loadsecurityflag,routecatcode,usealternatecodes,enabledraftcopy,boarseq,boordseq,hhcarseq,hhcloadseq,boloadseq,deliveryroute,presalesorder,hhcappversion,usesequenceflag,customerseq,routeseqno,allowbalcheck,allowedradius,cmpycode,regionmstcode,expirylimit,runningvalue,maximumgpsallowed,transactionnoseq,routetmpl,templatename,enablestockicon,generatehhcseqfromboflag,tlockstatus,enablefreereason,inventoryreportcontrol,enablestartdayrtewkdayedit from routemaster where routecode="+sessionStorage.getItem("RouteCode"),function(result)
                                             {
                                             if(!$.isEmptyObject(result))
                                             {
                                                 for(i=0;i<result.array.length;i++)
                                                 {
                                                 routemaster[i] = result.array[i];
                                                 }
                                                                                          
                                             }
                                             routemaster=JSON.stringify(routemaster);
                                           //  alert(JSON.stringify(routemaster));
                                             getroutesequencecustomerstatus();
                                             
                                             },
                                             function()
                                             {
                                             console.warn("Error calling plugin");
                                             });
    }

}
function getroutesequencecustomerstatus()
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            if(result!='')
            {
                for(i=0;i<result.length;i++)
                {
                    routesequencecustomerstatus[i] = result[i];
                }
                
                
            } 
            routesequencecustomerstatus=JSON.stringify(routesequencecustomerstatus);                   
           
            getcustomerinventorydetail();
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "GetfielddataMethod", 
        ["select routekey,seqweeknumber,seqweekday,routecode,customercode,sequencenumber,schelduledflag,servicedflag,scannedflag from routesequencecustomerstatus where issync=0"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.select("select routekey,seqweeknumber,seqweekday,routecode,customercode,sequencenumber,schelduledflag,servicedflag,scannedflag from routesequencecustomerstatus where issync=0",function(result)
        {
            if(!$.isEmptyObject(result))
            {
                for(i=0;i<result.array.length;i++)
                {
                    routesequencecustomerstatus[i] = result.array[i];
                }          
            }
            routesequencecustomerstatus=JSON.stringify(routesequencecustomerstatus);
          
            getcustomerinventorydetail();
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
    
}
function getcustomerinventorydetail()
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            if(result!='')
            {
                for(i=0;i<result.length;i++)
                {
                    customerinventorydetail[i] = result[i];
                }
                
                
            } 
            customerinventorydetail=JSON.stringify(customerinventorydetail);  
						
            
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "GetfielddataMethod", 
        ["select routekey,visitkey,itemcode,weighted,qtyloc1case,catchweightqtyloc1,qtyloc1each,qtyloc2case,catchweightqtyloc2,qtyloc2each,qtyloc3case,catchweightqtyloc3,qtyloc3each,shelfstockcase,shelfstockcatchweightqty,shelfstockeach,oldestcode from customerinventorydetail where issync=0"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.select("select routekey,visitkey,itemcode,weighted,qtyloc1case,catchweightqtyloc1,qtyloc1each,qtyloc2case,catchweightqtyloc2,qtyloc2each,qtyloc3case,catchweightqtyloc3,qtyloc3each,shelfstockcase,shelfstockcatchweightqty,shelfstockeach,oldestcode,expirydate from customerinventorydetail where issync=0",function(result)
        {
            if(!$.isEmptyObject(result))
            {
                for(i=0;i<result.array.length;i++)
                {
                    customerinventorydetail[i] = result.array[i];
                }
                
                
            }
            customerinventorydetail=JSON.stringify(customerinventorydetail);
           
			if(syncflag=='sale')
			{		
				getcustomermaster();
				//getcustomeroperationcontrol();
			}else
			{	
				
					getcustomerinventorycheck();
					
				
			}
            
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
    
}

function variance_getcustomeroperationcontrol()
{
     window.plugins.DataBaseHelper.select("select visitkey,routekey,customercode,routecode,salesmancode,odometerreading,visitstartdate,visitstarttime,visitenddate,visitendtime,totaltransactions,addedcustomer,voidflag,scannerindicator,reasoncode,CAST(latitude AS VARCHAR) as latitude,CAST(longitude AS VARCHAR) as longitude,radius,log_id from customeroperationscontrol where issync=0",function(result)
                                             {
                                             if(!$.isEmptyObject(result))
                                             {
                                                 for(i=0;i<result.array.length;i++)
                                                 {
                                                 customeroperationscontrol[i] = result.array[i];
                                                 }
                                                 
                                             }
                                             customeroperationscontrol=JSON.stringify(customeroperationscontrol);
                                            // console.log(customeroperationscontrol);
                                             //alert(customeroperationscontrol);
											
                                             variance_getinvoicedetail();
												
																					 
                                             
                                             },
                                             function()
                                             {
                                             console.warn("Error calling plugin");
                                             });
    
}




function variance_getinvoicedetail()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            invoicedetail[i] = result[i];
                                            
                                        }
                                        
                                    }         
                                              
                                    invoicedetail=JSON.stringify(invoicedetail);                    
                                    getinvoiceheader();                   
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,salesprice,returnprice,stdsalesprice,stdreturnprice,promoqty,salesitemexcisetax,salesitemgsttax,returnitemexcisetax,returnitemgsttax,damageditemexcisetax,damageditemgsttax,fgitemexcisetax,fgitemgsttax,promoitemexcisetax,promoitemgsttax,coopid,batchdetailkey,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,goodreturnprice,goodreturncaseprice,stdgoodreturncaseprice,stdgoodreturnprice,expiryqty,currencycode,returnfreeqty,manualfreeqty,limitedfreeqty,rebaterentqty,fixedrentqty,pricechgindicator,discountamount,discountpercentage,promoamount,replacementqty,replacementprice,replacementcaseprice,promovalue,mdat,returnpromovalue,returnpromoamount,amount,diffround,roundsalesamount from invoicedetail where issync=0"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,salesprice,returnprice,stdsalesprice,stdreturnprice,promoqty,salesitemexcisetax,salesitemgsttax,returnitemexcisetax,returnitemgsttax,damageditemexcisetax,damageditemgsttax,fgitemexcisetax,fgitemgsttax,promoitemexcisetax,promoitemgsttax,coopid,batchdetailkey,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,goodreturnprice,goodreturncaseprice,stdgoodreturncaseprice,stdgoodreturnprice,expiryqty,currencycode,returnfreeqty,manualfreeqty,limitedfreeqty,rebaterentqty,fixedrentqty,pricechgindicator,discountamount,discountpercentage,promoamount,replacementqty,replacementprice,replacementcaseprice,promovalue,mdat,returnpromovalue,returnpromoamount,amount,diffround,roundsalesamount,amount from invoicedetail where issync=0",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        invoicedetail[i] = result.array[i];
                                    }
                                
                                
                            }
                         invoicedetail=JSON.stringify(invoicedetail);
                         variance_getinvoiceheader();
                },
                function()
                {
                	console.warn("Error calling plugin");
                });
    }
}

function variance_getinvoiceheader()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            invoiceheader[i] = result[i];
                                        }
                                        
                                       
                                    }                    
                                    invoiceheader=JSON.stringify(invoiceheader);                    
                                    getinvoicerxddetail();             
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,salesmancode,presoldordernumber,presalesmancode,presalesroutecode,orderdeliverydate,orderdeliveryroutecode,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,totalfreesampleamount,immediatepaid,amountpaid,invoicebalance,dexflag,dexg86signature,paymenttype,splittransaction,voidflag,transmitindicator,paymentstatus,hhcinvoicenumber,totalpromoamount,gcpaymenttype,hhcdocumentnumber,inventorykey,totaltaxesamount,itemlinetaxamount,totaldiscountamount,voidreasoncode,totalexpiryamount,currencycode,totalmanualfree,totallimitedfree,totalrebaterent,totalfixedrent,actualtransactiondate,boentry,hhctransactionkey,data,comments,totaldiscdistributionamount,totalreplacementamount,comments2,totalbuybackfreeamount,diffround,roundtotalsalesamount from invoiceheader where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,salesmancode,presoldordernumber,presalesmancode,presalesroutecode,orderdeliverydate,orderdeliveryroutecode,CAST(totalinvoiceamount AS VARCHAR) as totalinvoiceamount,CAST(totalsalesamount AS VARCHAR) as totalsalesamount,totalreturnamount,totaldamagedamount,totalfreesampleamount,CAST(immediatepaid AS VARCHAR) as immediatepaid,CAST(amountpaid AS VARCHAR) as amountpaid,CAST(invoicebalance AS VARCHAR) as invoicebalance,dexflag,dexg86signature,paymenttype,splittransaction,voidflag,transmitindicator,paymentstatus,hhcinvoicenumber,totalpromoamount,gcpaymenttype,hhcdocumentnumber,inventorykey,totaltaxesamount,itemlinetaxamount,totaldiscountamount,voidreasoncode,totalexpiryamount,currencycode,totalmanualfree,totallimitedfree,totalrebaterent,totalfixedrent,actualtransactiondate,boentry,hhctransactionkey,data,comments,totaldiscdistributionamount,totalreplacementamount,comments2,totalbuybackfreeamount,diffround,roundtotalsalesamount,headerdiscounttaxamt from invoiceheader where issync=0 and istemp='false'",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        invoiceheader[i] = result.array[i];
                                    }
                                
                                
                            }
                         invoiceheader=JSON.stringify(invoiceheader);
                         variance_getinvoicerxddetail();
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}
function variance_getinvoicerxddetail()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            invoicerxddetail[i] = result[i];
                                        }
                                        
                                        
                                    }                    
                                   invoicerxddetail=JSON.stringify(invoicerxddetail);                     
                                           getpromotiondetail();             
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,itemtranstypeseq,reasoncode,quantity,catchweightqty,weighted,instructioncode,currencycode,expirydate,invoicenumber from invoicerxddetail where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,itemtranstypeseq,reasoncode,quantity,catchweightqty,weighted,instructioncode,currencycode,substr(expirydate, 7, 4) || '-' || substr(expirydate, 4, 2) || '-' || substr(expirydate, 1, 2)as expirydate,invoicenumber from invoicerxddetail where issync=0 and istemp='false'",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        invoicerxddetail[i] = result.array[i];
                                    }
                                
                                
                            }
                         invoicerxddetail=JSON.stringify(invoicerxddetail);
                         variance_getcashcheckdetail();
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}

function variance_getcashcheckdetail()
{
    if(platform=='iPad')
    {
                Cordova.exec(function(result) {
                                    if(result!='')
                                    {
                                        for(i=0;i<result.length;i++)
                                        {
                                            cashcheckdetail[i] = result[i];
                                        }
                                        
                                        
                                    } 
                                    cashcheckdetail=JSON.stringify(cashcheckdetail);                   
                                      getinvetorytransactionheader();              
                                                        
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select routekey,visitkey,typecode,checknumber,amount,updateindicator,checkdate,bankcode,checkstatus,branchcode,drawercode,chequestatusindicator,sapchequestatusindicator,currencycode,hhctransactionkey,paymenttype,checktype,transactiontype from cashcheckdetail where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,visitkey,typecode,checknumber,CAST(amount AS VARCHAR) as amount,updateindicator,checkdate,bankcode,checkstatus,branchcode,drawercode,chequestatusindicator,sapchequestatusindicator,currencycode,hhctransactionkey,paymenttype,checktype,transactiontype from cashcheckdetail where issync=0 and istemp='false'",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        cashcheckdetail[i] = result.array[i];
                                    }
                                
                                
                            }
                            cashcheckdetail=JSON.stringify(cashcheckdetail);
                          // alert("now uploading"); 
                           uploaddata();
                         
                },
                function()
                {
                console.warn("Error calling plugin");
                });
    }
}

function getcustomerinventorycheck()
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            if(result!='')
            {
                for(i=0;i<result.length;i++)
                {
                    customerinventorycheck[i] = result[i];
                }
                
                
            } 
            customerinventorycheck=JSON.stringify(customerinventorycheck);
            getvisualsfeedback();
            
            
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "GetfielddataMethod", 
        ["select routekey,visitkey,itemcode,weighted,qtyloc1case,catchweightqtyloc1,qtyloc1each,qtyloc2case,catchweightqtyloc2,qtyloc2each,qtyloc3case,catchweightqtyloc3,qtyloc3each,shelfstockcase,shelfstockcatchweightqty,shelfstockeach,oldestcode,expiry_date from customerinventorycheck where issync=0"]);
    }
    else if(platform=='Android')
    {
    	// org line sujee commented 13/03/2019 for expirydate 
       // window.plugins.DataBaseHelper.select("select routekey,visitkey,itemcode,weighted,qtyloc1case,catchweightqtyloc1,qtyloc1each,qtyloc2case,catchweightqtyloc2,qtyloc2each,qtyloc3case,catchweightqtyloc3,qtyloc3each,shelfstockcase,shelfstockcatchweightqty,shelfstockeach,oldestcode,substr(expiry_date, 7, 4) || '-' || substr(expiry_date, 4, 2) || '-' || substr(expiry_date, 1, 2)as expiry_date from customerinventorycheck where issync=0",function(result)
        window.plugins.DataBaseHelper.select("select routekey,visitkey,itemcode,weighted,qtyloc1case,catchweightqtyloc1,qtyloc1each,qtyloc2case,catchweightqtyloc2,qtyloc2each,qtyloc3case,catchweightqtyloc3,qtyloc3each,shelfstockcase,shelfstockcatchweightqty,shelfstockeach,oldestcode,expiry_date as expiry_date from customerinventorycheck where issync=0",function(result)
        {
            if(!$.isEmptyObject(result))
            {
                for(i=0;i<result.array.length;i++)
                {
                    customerinventorycheck[i] = result.array[i];
                }
                
                
            }
            customerinventorycheck=JSON.stringify(customerinventorycheck);
            getvisualsfeedback();
            
            
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
    
}
function getvisualsfeedback()
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            if(result!='')
            {
                for(i=0;i<result.length;i++)
                {
                    visualsfeedback[i] = result[i];
                }
                
                
            } 
            visualsfeedback=JSON.stringify(visualsfeedback);
           getpromotions_remark();
           
            
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "GetfielddataMethod", 
        ["select routekey,visitkey,customercode,visualdetail_id,visualcode,remarks from visualsfeedback where issync=0"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.select("select routekey,visitkey,customercode,visualdetail_id,visualcode,remarks from visualsfeedback where issync=0",function(result)
        {
            if(!$.isEmptyObject(result))
            {
                for(i=0;i<result.array.length;i++)
                {
                    visualsfeedback[i] = result.array[i];
                }
                
                
            }
            visualsfeedback=JSON.stringify(visualsfeedback);
            
             getpromotions_remark();
            
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
    
}
function getpromotions_remark()
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            if(result!='')
            {
                for(i=0;i<result.length;i++)
                {
                    promotions_remark[i] = result[i];
                }
                
                
            } 
            promotions_remark=JSON.stringify(promotions_remark);
          
            
            getcustomerdistributioncheck();
            
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "GetfielddataMethod", 
        ["select routekey,customercode,promotionkey,remarks from promotions_remark where issync=0"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.select("select routekey,customercode,promotionkey,remarks from promotions_remark where issync=0",function(result)
        {
            if(!$.isEmptyObject(result))
            {
                for(i=0;i<result.array.length;i++)
                {
                    promotions_remark[i] = result.array[i];
                }
                
                
            }
            promotions_remark=JSON.stringify(promotions_remark);
            
            
            getcustomerdistributioncheck();
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}
function getcustomerdistributioncheck()
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            if(result!='')
            {
                for(i=0;i<result.length;i++)
                {
                    customerdistributioncheck[i] = result[i];
                }
                
                
            } 
            customerdistributioncheck=JSON.stringify(customerdistributioncheck);
          
            getroutegoal1();
           
            
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "GetfielddataMethod", 
        ["select routekey,visitkey,customercode,itemcode,qty,distributionkey from customerdistributioncheck where issync=0"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.select("select routekey,visitkey,customercode,itemcode,qty,distributionkey from customerdistributioncheck where issync=0",function(result)
        {
            if(!$.isEmptyObject(result))
            {
                for(i=0;i<result.array.length;i++)
                {
                    customerdistributioncheck[i] = result.array[i];
                }
                
                
            }
            customerdistributioncheck=JSON.stringify(customerdistributioncheck);
            
            getroutegoal1();
            
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}


function getroutegoal1()
{
    
    
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            if(result!='')
            {
                for(i=0;i<result.length;i++)
                {
                    routegoal[i] = result[i];
                    
                }
                
                
            }         
            
            routegoal=JSON.stringify(routegoal);                    
            getnosalesheader();
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "GetfielddataMethod", 
        ["select primary_key,routecode,salesmancode,packagenumber,todaysgoal,todaysachieve,quotadesckey1,quotagoal1,quotaachieve1,quotareset1,quotadesckey2,quotagoal2,quotaachieve2,quotareset2,quotadesckey3,quotagoal3,quotaachieve3,quotareset3,created,cdat,modified,mdat,mmonth,fromdate,todate,quantity,achievequantity from routegoal where issync=0"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.select("select primary_key,routecode,salesmancode,packagenumber,todaysgoal,todaysachieve,quotadesckey1,quotagoal1,quotaachieve1,quotareset1,quotadesckey2,quotagoal2,quotaachieve2,quotareset2,quotadesckey3,quotagoal3,quotaachieve3,quotareset3,created,cdat,modified,mdat,mmonth,fromdate,todate,quantity,achievequantity from routegoal where issync=0",function(result)
        {
            if(!$.isEmptyObject(result))
            {
                for(i=0;i<result.array.length;i++)
                {
                    routegoal[i] = result.array[i];
                }
                
                
            }
            routegoal=JSON.stringify(routegoal);
            getnosalesheader();
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}
function getnosalesheader()
{
    
    
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            if(result!='')
            {
                for(i=0;i<result.length;i++)
                {
                    nosalesheader[i] = result[i];
                    
                }
                
                
            }         
            
            nosalesheader=JSON.stringify(nosalesheader);                    
            getcustomer_foc_balance();
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "GetfielddataMethod", 
        ["select transactionkey,routekey,visitkey,documentnumber,invoicenumber,routecode,salesmancode,transactiondate,transactiontime,nosalereasoncode,voidflag,transmitindicator,customercode,hhcdocumentnumber,hhcinvoicenumber,data from nosalesheader where issync=0"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.select("select transactionkey,routekey,visitkey,documentnumber,invoicenumber,routecode,salesmancode,transactiondate,transactiontime,nosalereasoncode,voidflag,transmitindicator,customercode,hhcdocumentnumber,hhcinvoicenumber,data from nosalesheader where issync=0",function(result)
        {
            if(!$.isEmptyObject(result))
            {
                for(i=0;i<result.array.length;i++)
                {
                    nosalesheader[i] = result.array[i];
                }
                
                
            }
            nosalesheader=JSON.stringify(nosalesheader);
            getcustomer_foc_balance();
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}
function getcustomer_foc_balance()
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            if(result!='')
            {
                for(i=0;i<result.length;i++)
                {
                    customer_foc_balance[i] = result[i];
                    
                }
                
                
            }         
            
            customer_foc_balance=JSON.stringify(customer_foc_balance);                    
            get_t_access_override_log();
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "GetfielddataMethod", 
        ["select customercode,itemcode,originalqty,balanceqty,contractid,startdate from customer_foc_balance where issync=0"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.select("select customercode,itemcode,originalqty,balanceqty,contractid,startdate from customer_foc_balance where issync=0",function(result)
        {
            if(!$.isEmptyObject(result))
            {
                for(i=0;i<result.array.length;i++)
                {
                    customer_foc_balance[i] = result.array[i];
                }
                                
            }
            customer_foc_balance=JSON.stringify(customer_foc_balance);
            get_t_access_override_log();
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}
function get_t_access_override_log()
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            if(result!='')
            {
                for(i=0;i<result.length;i++)
                {
                    t_access_override_log[i] = result[i];
                    
                }
                
                
            }         
            
            t_access_override_log=JSON.stringify(t_access_override_log);                    
            getenddaydetail();
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "GetfielddataMethod", 
        ["select routekey,visitkey,type,routecode,customercode,salesmancode,featureid,accesskey,accesstime,voidflag,validflag from t_access_override_log where issync=0"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.select("select routekey,visitkey,type,routecode,customercode,salesmancode,featureid,accesskey,accesstime,voidflag,validflag from t_access_override_log where issync=0",function(result)
        {
            if(!$.isEmptyObject(result))
            {
                for(i=0;i<result.array.length;i++)
                {
                    t_access_override_log[i] = result.array[i];
                }
                
                
            }
            t_access_override_log=JSON.stringify(t_access_override_log);
            getenddaydetail();
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}
function getenddaydetail()
{
if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            if(result!='')
            {
                for(i=0;i<result.length;i++)
                {
                    enddaydetail[i] = result[i];
                    
                }
                
                
            }         
            
            enddaydetail=JSON.stringify(enddaydetail);                    
            uploaddata();
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "GetfielddataMethod", 
        ["select routekey,detailtypecode,listtypecode,amount,currencycode from enddaydetail where issync=0"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.select("select routekey,detailtypecode,listtypecode,amount,currencycode from enddaydetail where issync=0",function(result)
        {
            if(!$.isEmptyObject(result))
            {
                for(i=0;i<result.array.length;i++)
                {
                    enddaydetail[i] = result.array[i];
                }
                
                
            }
            enddaydetail=JSON.stringify(enddaydetail);
			/*if(clrlog=='clr')
			{
				uploaddata(clrlog);
			}else
			{*/
				uploaddata();
			//}
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}

var imgdata,curridx,cntupload;
function getImages(url,flag)
{                
	redlink=url;
	syncflag=flag;
    var Qry = "SELECT imagename,imagepath FROM customerimages WHERE routecode=" + sessionStorage.getItem("RouteCode")+" and issync=0";
    console.log(Qry);
    if(platform == "iPad")
    {
        Cordova.exec(function(result) {        
            if(result.length > 0)
            {
            	imgdata = result;
            	getImagesToUpload();
            }
            else
            	uploaddata();            
        },
        function(error) {
            navigator.notification.alert("Error in binding Images : " + error);
        },
        "PluginClass",
        "GetdataMethod",
        [Qry]);
    }
    else if(platform == "Android")
    {
        window.plugins.DataBaseHelper.select(Qry,function(result)
        {
        	if(result.array != undefined)
        	{
            	var array = $.map(result.array, function(item, index) {
                	return [[item.imagename,item.imagepath]];
            	});
            	imgdata = array;    
            	getImagesToUpload();        	
            }
            else
            	uploaddata();            
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}

function getImagesToUpload()
{            	
    try
    {
    	if(imgdata != null && imgdata.length > 0)
    	{            
            curridx = 0;
            cntupload = 0;                            
            cntupload = imgdata.length-1;               
            CallImageUpload();            
        }        
    }
    catch(ex)
    {
        alert(ex);
    }
}

function CallImageUpload()
{	
    var fileName = imgdata[curridx][0];
    var filePath = imgdata[curridx][1];
    filePath2=filePath;
    UploadImages(fileName,filePath);
}

function UploadImages(fileName,filePath)
{   
    console.log("filepath : " + filePath);
    currfilename = fileName;
    var options = new FileUploadOptions();
	options.fileKey="file";
	options.fileName=fileName;
	options.mimeType="image/jpeg";

	var params = new Object();
	params.value1 = "test";
	params.value2 = "param";

	//   options.params = params;
	options.chunkedMode=false;
	var ft = new FileTransfer();
	var url=wsurl+"image/upload";
	ft.upload(filePath, url, win, fail, options,true);
    //ft.upload(filePath, "https://rp-bo-qa.alghanim.com/sfa/routepro_qlty/api/image/upload", win, fail, options,true);
	   
}

function win(r) 
{
	console.log("Code = " + r.responseCode);
	console.log("Response = " + r.response);
	console.log("Sent = " + r.bytesSent);

	var Qry = "UPDATE customerimages SET issync= 1 WHERE imagename = '" + currfilename + "'";
	if(platform == "iPad")
	{
		Cordova.exec(function(result) {
			UpdateImageSuccess();
	    },
	    function(error) {
	        navigator.notification.alert(error);
	    },
	    "PluginClass",
	    "InsertUpdateMethod",
	    [Qry]);
	}
	else if(platform == "Android")
	{
		window.plugins.DataBaseHelper.insert(Qry, function(result) {
	    	UpdateImageSuccess();
	    },
	    function() {
	        console.warn("Error calling plugin");
	    });
	}
}

function fail(err)
{
	navigator.notification.alert("error uploading images " );
	$.mobile.hidePageLoadingMsg();
}


function UpdateImageSuccess()
{	  

    if(cntupload == 0)
    {        
        var qry = "SELECT imagename,customercode,imageno,imagepath,routecode,routekey,transactiondate,transactiontime,visitkey,issync FROM customerimages WHERE issync = 1";
        if(platform == "iPad")
        {                    	
        	Cordova.exec(function(result) {
        		if(result != '')
        			customerimages = result;
        		uploaddata()
            },
            function(error) {
                navigator.notification.alert(error);
            },
            "PluginClass",
            "GetfielddataMethod",
            [qry]);
        }
        else if(platform == "Android")
        {
        	window.plugins.DataBaseHelper.select(qry, function(result) {
				if (!$.isEmptyObject(result)) {
	                for (i = 0; i < result.array.length; i++) {
	                	customerimages[i] = result.array[i];
	                }
	            }
				customerimages = JSON.stringify(customerimages);    
	            console.log("customerimages : " + customerimages);
	           // alert(customerimages);
	            uploaddata();                		
            },
            function() {
                console.warn("Error calling plugin");
            });
        }
    }
    else
    {
        if(curridx < imgdata.length - 1)
        {
        	cntupload = cntupload - 1;
        	curridx = curridx + 1;
        	CallImageUpload();
        }
    }
}
function createFile(){
var object = new ActiveXObject("Scripting.FileSystemObject");

 var txtFile = fso.OpenTextFile("C:\\Temp\\myFolder\\file.txt", 8, true, 0);
file.WriteLine('Hello World');
file.WriteLine('Hope is a thing with feathers, that perches on the soul.'); 
file.Close();
}
function gotFS(fileSystem) {
        fileSystem.root.getFile("readme.txt", {create: true, exclusive: false}, gotFileEntry, fail1);
    }

    function gotFileEntry(fileEntry) {
        fileEntry.createWriter(gotFileWriter, fail1);
    }

    function gotFileWriter(writer) {
         console.log("write start ");
         
         
        //writer.onwriteend = function(evt) {
           
            writer.seek(writer.length);
            var routecode= sessionStorage.getItem("RouteCode");
    var userid= sessionStorage.getItem("SalesmanCode");
    var deviceid= sessionStorage.getItem("DeviceID");
    var routekey=sessionStorage.getItem("RouteKey");
  
    if(routekey=='')
    routekey=0;
    if(routeclosed=='' || routeclosed==undefined)
    routeclosed=0;
                data12 = {invoicedetail:invoicedetail,invoiceheader:invoiceheader,invoicerxddetail:invoicerxddetail,promotiondetail:promotiondetail,customerinvoice:customerinvoice,salesorderheader:salesorderheader,salesorderdetail:salesorderdetail,batchexpirydetail:batchexpirydetail,arheader:arheader,ardetail:ardetail,cashcheckdetail:cashcheckdetail,inventorytransactionheader:invetorytransactionheader,inventorytransactiondetail:inventorytransactiondetail,inventorysummarydetail:inventorysummarydetail,nonservicedcustomer:nonservicedcustomer,surveyauditdetail:surveyauditdetail,posequipmentchangedetail:posequipmentchangedetail,posmaster:posmaster,sigcapturedata:sigcapturedata,customermaster:customermaster,customeroperationscontrol:customeroperationscontrol,routemaster:routemaster,customerinventorydetail:customerinventorydetail,routesequencecustomerstatus:routesequencecustomerstatus,routegoal:routegoal,nosalesheader:nosalesheader,routekey:routekey,routecode:routecode,routeclosed:routeclosed,userid:userid,customer_foc_balance:customer_foc_balance,enddaydetail:enddaydetail};
   
   
                writer.write(JSON.stringify(data12));
               
       // };
        
    }

    function fail1(error) {
        console.log("writer error ------------- "+error.code);
    }
function uploaddata()
{ 
   console.log(routegoal);
   console.log(nosalesheader);
    var routecode= sessionStorage.getItem("RouteCode");
    var userid= sessionStorage.getItem("SalesmanCode");
    var deviceid= sessionStorage.getItem("DeviceID");
    var routekey=sessionStorage.getItem("RouteKey");
  
    if(routekey=='')
    routekey=0;
    if(routeclosed=='' || routeclosed==undefined)
    routeclosed=0;
   
   
    var uploadddata={invoicedetail:invoicedetail,invoiceheader:invoiceheader,invoicerxddetail:invoicerxddetail,promotiondetail:promotiondetail,customerinvoice:customerinvoice,salesorderheader:salesorderheader,salesorderdetail:salesorderdetail,batchexpirydetail:batchexpirydetail,arheader:arheader,ardetail:ardetail,cashcheckdetail:cashcheckdetail,inventorytransactionheader:invetorytransactionheader,inventorytransactiondetail:inventorytransactiondetail,inventorysummarydetail:inventorysummarydetail,nonservicedcustomer:nonservicedcustomer,surveyauditdetail:surveyauditdetail,posequipmentchangedetail:posequipmentchangedetail,posmaster:posmaster,sigcapturedata:sigcapturedata,customermaster:customermaster,customeroperationscontrol:customeroperationscontrol,routemaster:routemaster,customerinventorydetail:customerinventorydetail,routesequencecustomerstatus:routesequencecustomerstatus,routegoal:routegoal,nosalesheader:nosalesheader,routekey:routekey,routecode:routecode,routeclosed:routeclosed,userid:userid,customer_foc_balance:customer_foc_balance,enddaydetail:enddaydetail,t_access_override_log:t_access_override_log,customerinventorycheck:customerinventorycheck,customerimages:customerimages,customervisitlog:customervisitlog};
    console.log("uploadddata : " + uploadddata);
    console.log("uploadddata - routesequencecustomerstatus : " + JSON.stringify(routesequencecustomerstatus));


  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail1);
    
            $.ajax({
                   type: "post",
                   url:wsurl+"sync/senddata",
                   cache: false,
                    timeout: 60000,
                    data:{invoicedetail:invoicedetail,invoiceheader:invoiceheader,invoicerxddetail:invoicerxddetail,promotiondetail:promotiondetail,customerinvoice:customerinvoice,salesorderheader:salesorderheader,salesorderdetail:salesorderdetail,orderrxddetail:orderrxddetail,batchexpirydetail:batchexpirydetail,arheader:arheader,ardetail:ardetail,cashcheckdetail:cashcheckdetail,inventorytransactionheader:invetorytransactionheader,inventorytransactiondetail:inventorytransactiondetail,inventorysummarydetail:inventorysummarydetail,nonservicedcustomer:nonservicedcustomer,surveyauditdetail:surveyauditdetail,posequipmentchangedetail:posequipmentchangedetail,posmaster:posmaster,sigcapturedata:sigcapturedata,customermaster:customermaster,customeroperationscontrol:customeroperationscontrol,routemaster:routemaster,customerinventorydetail:customerinventorydetail,routesequencecustomerstatus:routesequencecustomerstatus,routegoal:routegoal,nosalesheader:nosalesheader,routekey:routekey,routecode:routecode,routeclosed:routeclosed,userid:userid,customer_foc_balance:customer_foc_balance,enddaydetail:enddaydetail,t_access_override_log:t_access_override_log,customerinventorycheck:customerinventorycheck,customerimages:customerimages,customervisitlog:customervisitlog},
               
                    success: function(data) { 
                   //  alert(data);
                     console.log("data : " + data);
                     data = JSON.parse(data);
                     
                   var invoicedetaildata = data.invoicedetail;
                   var invoiceheaderdata = data.invoiceheader;
                   var invoicerxddetaildata = data.invoicerxddetail;
                   var promotiondetaildata = data.promotiondetail;
                   var customerinvoicedata = data.customerinvoice;
                   var salesorderdetaildata = data.salesorderdetail;
                   var salesorderheaderdata = data.salesorderheader;
                   var orderrxddetaildata = data.orderrxddetail;
                   var batchexpirydetaildata = data.batchexpirydetail;
                   var arheaderdata = data.arheader;
                   var ardetaildata = data.ardetail;
                   var cashcheckdetaildata = data.cashcheckdetail;
                   var invetorytransactionheaderdata= data.inventorytransactionheader;
                   var inventorytransactiondetaildata = data.inventorytransactiondetail;
                   var inventorysummarydetaildata = data.inventorysummarydetail;
                   var nonservicedcustomerdata = data.nonservicedcustomer;
                   var surveyauditdetaildata = data.surveyauditdetail;
                   var posequipmentchangedetaildata = data.posequipmentchangedetail;
                   var posmasterdata = data.posmaster;
                   var sigcapturedata = data.sigcapturedata;
                   var customermasterdata = data.customermaster;
                   var customeroperationscontrol=data.customeroperationscontrol;
                   var routemaster=data.routemaster;
                   var customerinventorydetail=data.customerinventorydetail;
                   var routesequencecustomerstatus=data.routesequencecustomerstatus;
                   var nosalesheader=data.nosalesheader;
                   var routegoal=data.routegoal;
                   var customer_foc_balance=data.customer_foc_balance;
                   var enddaydetail = data.enddaydetail;
                   var t_access_override_log = data.t_access_override_log;
                   var customerinventorycheck = data.customerinventorycheck;
                   var visualsfeedback = data.visualsfeedback;
                   var promotions_remark=data.promotions_remark;
                   var customerdistributioncheck = data.customerdistributioncheck;
                   var customervisitlogdata = data.customervisitlog;
                 
               
                   if(customervisitlogdata!= null && customervisitlogdata.length!=0)
				   {
						for(i=0;i<customervisitlogdata.length;i++)
					   {
							updatecustomervisitlog(customervisitlogdata,i);
					   }
				   }
                   
				  if(invoicedetaildata!= null && invoicedetaildata.length!=0)
				   {
						for(i=0;i<invoicedetaildata.length;i++)
					   {
							updateinvoicedetail(invoicedetaildata,i);
					   }
				   }
				   if(invoiceheaderdata!= null && invoiceheaderdata.length!=0)
				   {
					   for(j=0;j<invoiceheaderdata.length;j++)
					   {
							updateinvoiceheader(invoiceheaderdata,j);
					   }
				   }
				   if(invoicerxddetaildata!= null && invoicerxddetaildata.length!=0)
				   {
					   for(k=0;k<invoicerxddetaildata.length;k++)
					   {
							updateinvoicerxddetail(invoicerxddetaildata,k);
					   }
					} 
					if(promotiondetaildata!= null && promotiondetaildata.length!=0)
				   {	
					   for(a=0;a<promotiondetaildata.length;a++)
					   {
							updatepromotiondetail(promotiondetaildata,a);
					   }
				  }  
					if(customerinvoicedata!= null && customerinvoicedata.length!=0)
				   {
					   for(b=0;b<customerinvoicedata.length;b++)
					   {
							updatecustomerinvoice(customerinvoicedata,b);
					   }
					} 
					if(salesorderdetaildata!= null && salesorderdetaildata.length!=0)
					{	
					   for(c=0;c<salesorderdetaildata.length;c++)
					   {
							updatesalesorderdetail(salesorderdetaildata,c);
					   }
					}   
					if(salesorderheaderdata!= null && salesorderheaderdata.length!=0)
					{
						for(d=0;d<salesorderheaderdata.length;d++)
					   {
							updatesalesorderheader(salesorderheaderdata,d);
					   }
					}
					if(orderrxddetaildata!= null && orderrxddetaildata.length!=0)
					   {
						   for(k=0;k<orderrxddetaildata.length;k++)
						   {
								updateorderrxddetail(orderrxddetaildata,k);
						   }
						}
                  if(batchexpirydetaildata!= null && batchexpirydetaildata.length!=0)
				  {
					   for(e=0;e<batchexpirydetaildata.length;e++)
					   {
							updatebatchexpirydetail(batchexpirydetaildata,e);
					   }
				  }
				  if(arheaderdata!= null && arheaderdata.length!=0)
				  {
					   for(f=0;f<arheaderdata.length;f++)
					   {
							updatearheader(arheaderdata,f);
					   }
				  } 
				  if(ardetaildata!= null && ardetaildata.length!=0)
				  {
					   for(g=0;g<ardetaildata.length;g++)
					   {
							updateardetail(ardetaildata,g);
					   }
				   }
				   if(cashcheckdetaildata!= null && cashcheckdetaildata.length!=0)
				  {
					   for(h=0;h<cashcheckdetaildata.length;h++)
					   {
							updatecashcheckdetail(cashcheckdetaildata,h);
					   }
				  }   
				  if(invetorytransactionheaderdata!= null && invetorytransactionheaderdata.length!=0)
				  {
					   for(k=0;k<invetorytransactionheaderdata.length;k++)
					   {
							updateinvetorytransactionheader(invetorytransactionheaderdata,k);
					   }
				   }
				   if(inventorytransactiondetaildata!= null && inventorytransactiondetaildata.length!=0)
				   {
					   for(l=0;l<inventorytransactiondetaildata.length;l++)
					   {
							updateinventorytransactiondetail(inventorytransactiondetaildata,l);
					   }
				   }  
				  if(inventorysummarydetaildata!= null && inventorysummarydetaildata.length!=0)
				  {
					   for(m=0;m<inventorysummarydetaildata.length;m++)
					   {
							updateinventorysummarydetail(inventorysummarydetaildata,m);
					   }
				  } 
				   if(nonservicedcustomerdata!= null && nonservicedcustomerdata.length!=0)
				   {
                   for(n=0;n<nonservicedcustomerdata.length;n++)
                   {
                        updatenonservicedcustomerdata(nonservicedcustomerdata,n);
                   }
				   }
				   if(surveyauditdetaildata!= null && surveyauditdetaildata.length!=0)
				   {
					   for(o=0;o<surveyauditdetaildata.length;o++)
					   {
							updatesurveyauditdetail(surveyauditdetaildata,o);
					   }
				   }
				   if(posequipmentchangedetaildata!= null && posequipmentchangedetaildata.length!=0)
				   {
					   for(p=0;p<posequipmentchangedetaildata.length;p++)
					   {
							updateposequipmentchangedetail(posequipmentchangedetaildata,p);
					   }
				   }
					if(posmasterdata!= null && posmasterdata.length!=0)
				   {
					   for(q=0;q<posmasterdata.length;q++)
					   {
							updateposmaster(posmasterdata,q);
					   }
				   }
				   if(sigcapturedata!= null && sigcapturedata.length!=0)
				   {
					   for(r=0;r<sigcapturedata.length;r++)
					   {
						updatesigcapturedata(sigcapturedata,r);
					   }
				   }  
					if(customermasterdata!= null && customermasterdata.length!=0)
				   {
					   for(s=0;s<customermasterdata.length;s++)
					   {
						updatecustomermaster(customermasterdata,s);
					   }
				   }	
					if(customeroperationscontrol!= null && customeroperationscontrol.length!=0)
					{
					   for(t=0;t<customeroperationscontrol.length;t++)
					   {
					   updatecustomeroperationscontrol(customeroperationscontrol,t);
					   }
					}  
					if(customerinventorydetail!= null && customerinventorydetail.length!=0)
                   {					
					   for(i=0;i<customerinventorydetail.length;i++)
						{
							updatecustomerinventorydetail(customerinventorydetail,i);
						}
				   }
				   if(routesequencecustomerstatus!= null && routesequencecustomerstatus.length!=0)
					{
						for(i=0;i<routesequencecustomerstatus.length;i++)
						{
							 updateroutesequencecustomerstatus(routesequencecustomerstatus,i);
						}
					}
					if(routegoal!= null && routegoal.length!=0)
					{
						for(i=0;i<routegoal.length;i++)
						{
							updateroutegoal(routegoal,i);
						}
                    }
					if(nosalesheader!= null && nosalesheader.length!=0) 
					{						
						for(i=0;i<nosalesheader.length;i++)
						{
							updatenosalesheader(nosalesheader,i);
						}
					}
					if(customer_foc_balance!= null && customer_foc_balance.length!=0) 
					{	
						for(j=0;j<customer_foc_balance.length;j++)
						{
							 updatecustomer_foc_balance(customer_foc_balance,j);
						}
					}
					if(enddaydetail!= null && enddaydetail.length!=0) 
					{	
						for(k=0;k<enddaydetail.length;k++)
						{
							  updateenddaydetail(enddaydetail,k);
						 }
					}	
					if(t_access_override_log!= null && t_access_override_log.length!=0) 
					{	
                     for(l=0;l<t_access_override_log.length;l++)
                     {
                          updatt_access_override_log(t_access_override_log,l);
                     }
					}
					if(customerinventorycheck!= null && customerinventorycheck.length!=0) 
					{
					 for(k=0;k<customerinventorycheck.length;k++)
                     {
                        updatt_customerinventorycheck(customerinventorycheck,k);
                     }
					}
					if(visualsfeedback!= null && visualsfeedback.length!=0) 
					{
                     for(k=0;k<visualsfeedback.length;k++)
                     {
                        updatt_visualsfeedback(visualsfeedback,k);
                     }
					}
					if(promotions_remark!= null && promotions_remark.length!=0) 
					{
                     for(n=0;n<promotions_remark.length;n++)
                     {
                        updatt_promotions_remark(promotions_remark,n);
                     }
					}
					if(customerdistributioncheck!= null && customerdistributioncheck.length!=0) 
					{
                     for(n=0;n<customerdistributioncheck.length;n++)
                     {
                        updatt_customerdistributioncheck(customerdistributioncheck,n);
                     }
					}
					
					
                     	$.mobile.hidePageLoadingMsg();
                     	var pendingFlag= sessionStorage.getItem('PendingOrdermessage');
                        var autouploadFlag = sessionStorage.getItem('autouploaddata');
                     	//alert('pendingFlag' +pendingFlag);
                     	//alert('syncflag' +syncflag);
                     	// sujee added to display the hold message 
                     	// ---------------- start 
                        if(autouploadFlag == 1)
                        {
                            navigator.notification.alert("Data Sent Successfully");
                            sessionStorage.setItem("autouploaddata","0");
                            $.mobile.hidePageLoadingMsg();
                        } 
                        else{
                     	if(pendingFlag == 1 )
                     	{
                     		navigator.notification.alert("Order Hold Successfully");
                     	// sujee added clear session storage 20/08/2019
                     		sessionStorage.setItem("onHoldinv",0);
                        	sessionStorage.setItem("editpendingorder",0);
                        	//
                     		 /*if(sessionStorage.getItem("referrer")=="../inventory/onholdorders.html"){
		                		   window.location.href="../inventory/onholdorders.html";
		             		  }else{
		             			 window.location.href=redlink;
		             		  }*/
                     		window.location.href=redlink;
                     	}else{    // ----------- end  
                     		
                     		
						navigator.notification.alert(getLangTextdata("Data Sent Successfully..."),function(){
							sessionStorage.setItem("onHoldOrderInvoice",0); 
		                       
			                   if(syncflag=='batch')
			                   {
			                   var startdate = new Date();
			                   var syncinvtime = sessionStorage.getItem('synctimeint');
			                   var settime = Math.abs(startdate.getTime())+(eval(syncinvtime)*60);
			                   sessionStorage.setItem('batchtime',settime); 
			                   }
			                   else if(syncflag=='print')
			                   {
			                	   if(sessionStorage.getItem("referrer")=="../inventory/onholdorders.html"){
			                		   window.location.href="../inventory/onholdorders.html";
			             		  }else{
			             			 window.location.href=redlink;
			             		  }
			                   
			                   }
							   else if(syncflag=='inv')
			                   {
								   window.location.href=redlink;
			                   }
							   else if(syncflag=='sale')
			                   {
								  // org line sujee commented if necessary eenable capture invoice 
								   //checkInvoiceImageCaptured(redlink)
			                   window.location.href=redlink;
			                   }else if(syncflag=='img'){
			                	   window.location.href=redlink;
			                   }
			                   else
			                   {
							    SaveEndDay();
			                  // window.location.href="home/home.html";
			                   }
						});
                     	}
                        }
                   },
                   error: function(qXHR, textStatus, errorThrown) {
                    $.mobile.hidePageLoadingMsg();
                    // sujee added clear session storage 20/08/2019
                    sessionStorage.setItem("onHoldinv",0);
                	sessionStorage.setItem("editpendingorder",0);
                    var autouploadFlag = sessionStorage.getItem('autouploaddata');
                	// 
                    navigator.notification.alert(getLangTextdata("Connection Error! Acknowledgement Not Received."),function(){	
                    	if(autouploadFlag == 1)
                        {
                            sessionStorage.setItem("autouploaddata","0");
                            $.mobile.hidePageLoadingMsg();
                        } else {
                            if(syncflag=='batch')
                            {
                            var startdate = new Date();
                            var syncinvtime = sessionStorage.getItem('synctimeint');
                            var settime = Math.abs(startdate.getTime())+(eval(syncinvtime)*60);
                            sessionStorage.setItem('batchtime',settime); 
                            }
                            else if(syncflag=='print')
                            {
                            if(sessionStorage.getItem("referrer")=="../inventory/onholdorders.html"){
                                window.location.href="../inventory/onholdorders.html";
                            }else{
                                window.location.href=redlink;
                            }
                            }
                            else if(syncflag=='inv')
                                {
                                window.location.href=redlink;
                                }
                            else if(syncflag=='sale')
                            {
                            // or line sujee commented if necessary eenable capture invoice 
                            //checkInvoiceImageCaptured(redlink)
                            window.location.href=redlink;
                            }
                            else
                            {
                            window.location.href="home/home.html";
                            }
                        
                            $('#lblexit').removeClass('MenuGray');
                            $('#imgexit').attr('src','images/icn-exit.png');
                            $('#exitlink').attr('href', 'home/home.html');
                        }

                    });
                    
                    
                   }
                   });
                
}

/*
 *@method checkInvoiceImageCaptured
 *Function to check whether the image for the completed invoice is captured
 *@param{url}
 */         
 function checkInvoiceImageCaptured(url){
	 
	 if(sessionStorage.getItem("reportprintcontrol")>0){
	 
	 var Qry="SELECT COUNT(*) as cnt from invoiceheader where visitkey=(select COALESCE(max(visitkey),0) from customeroperationscontrol)";
	 if(platform=="Android"){
		 window.plugins.DataBaseHelper.select(Qry,function(result)
					{   
                    if(result.array){
                    	if(result.array[0].cnt>0){
                    		   navigator.notification.alert("Please Capture the Invoice Image.",function(button){
                    			   window.location="../customer_opt/imagecapture.html";
       				   });
                    		
                    	}else{
                    		window.location.href=url;
                    	}
                    }
					},
					function()
					{
				   	 console.warn("Error calling plugin");
					});
	 }
	 }else{
		 window.location.href=url;
	 }
 }

//---------Data field set
function SaveEndDay()
            {
                var Qry = "UPDATE startendday SET data = 1 WHERE routekey = " + sessionStorage.getItem("RouteKey");
                console.log(Qry);
                if(platform=='iPad')
                { 
                    Cordova.exec(function(result) {
                      
                    },
                    function(error) {
                        alert(error);
                    },
                    "PluginClass",
                    "InsertUpdateMethod",
                    [Qry]);  
                }
                else if(platform=='Android')
           		{
	           		window.plugins.DataBaseHelper.insert(Qry,function(result)
					{   
                        copy();
					},
					function()
					{
				   	 console.warn("Error calling plugin");
					});
           		}
            }
            
//-------------------------
//
function copy()
        {
            $.mobile.showPageLoadingMsg();
            if(platform=='iPad')
            {
                Cordova.exec(function(result) {                                             
                             
                             if (result[0][0]!= 0) 
                             {
                             
                              $('#lblupload11').addClass('MenuGray');
                                $('#imgupload1').attr('src','../images/upload-data-grey.png');
                                $('#linkupload1').attr('href','');
                             
                             }
                             
                             //addbatchdata();
                             },
                             function(error) {
                             alert("Error in getting Password : " + error);
                             },
                             "PluginClass", 
                             "GetdataMethod", 
                             ["select max(routekey) routekey from startendday where routecode = '" + sessionStorage.getItem('RouteCode') + "' and salesmancode = '" + sessionStorage.getItem('SalesmanCode') + "' and routeclosed=0"]);         
            }
            else if(platform=='Android')
            {
                var routecode=sessionStorage.getItem('RouteCode');
                var routekey=sessionStorage.getItem('RouteKey');
                var paramval=routekey+"_"+routecode;
               // window.plugins.DataBaseHelper.copy2SdCard("",function(result)
                window.plugins.DataBaseHelper.copy2SdCard(paramval,function(result)
                                                     {
                                                                           
															sessionStorage.clear();
															localStorage.clear();
															window.location = "./index.html";
                                                     },
                                                     function()
                                                     {
                                                        
                                                         navigator.notification.alert("Archive Failed,Try Again");
                                                         sessionStorage.clear();
															localStorage.clear();
															window.location = "../index.html";
                                                     console.warn("Error calling plugin");
                                                     });
            } 
        }
//----

//-------
function updatecustomervisitlog(customervisitlogdata,i)
{
    
   
    console.log("update customervisitlog set issync=1 where routekey='"+customervisitlogdata[i].routekey+"' and log_id='"+customervisitlogdata[i].log_id+"' and customercode="+customervisitlogdata[i].customercode);
    
	    if(platform=='iPad')
	    {
	            return abc = Cordova.exec(function(result) {
	                                       //alert(result);
	                                       return true;
	                                       },
	                                       function(error) {
	                                       alert(error);},
	                                       "PluginClass", 
	                                       "InsertUpdateMethod", 
	                                       ["update invoicedetail set issync=1 where routekey='"+invoicedetaildata[i].routekey+"' and visitkey='"+invoicedetaildata[i].visitkey+"' and itemcode="+invoicedetaildata[i].itemcode]);
	    }
        else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update customervisitlog set issync=1 where routekey='"+customervisitlogdata[i].routekey+"' and log_id='"+customervisitlogdata[i].log_id+"' and customercode="+customervisitlogdata[i].customercode,function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}

function updateinvoicedetail(invoicedetaildata,i)
{
    
   
    console.log("update invoicedetail set issync=1 where routekey='"+invoicedetaildata[i].routekey+"' and visitkey='"+invoicedetaildata[i].visitkey+"' and itemcode="+invoicedetaildata[i].itemcode);
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update invoicedetail set issync=1 where routekey='"+invoicedetaildata[i].routekey+"' and visitkey='"+invoicedetaildata[i].visitkey+"' and itemcode="+invoicedetaildata[i].itemcode]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update invoicedetail set issync=1 where routekey='"+invoicedetaildata[i].routekey+"' and visitkey='"+invoicedetaildata[i].visitkey+"' and itemcode="+invoicedetaildata[i].itemcode,function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updateinvoiceheader(invoiceheaderdata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update invoiceheader set issync=1 where routekey='"+invoiceheaderdata[i].routekey+"' and visitkey='"+invoiceheaderdata[i].visitkey+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update invoiceheader set issync=1 where routekey='"+invoiceheaderdata[i].routekey+"' and visitkey='"+invoiceheaderdata[i].visitkey+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updateinvoicerxddetail(invoicerxddetaildata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update invoicerxddetail set issync=1 where routekey='"+invoicerxddetaildata[i].routekey+"' and visitkey='"+invoicerxddetaildata[i].visitkey+"' and itemcode='"+invoicerxddetaildata[i].itemcode+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update invoicerxddetail set issync=1 where routekey='"+invoicerxddetaildata[i].routekey+"' and visitkey='"+invoicerxddetaildata[i].visitkey+"' and itemcode='"+invoicerxddetaildata[i].itemcode+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updateorderrxddetail(orderrxddetaildata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update invoicerxddetail set issync=1 where routekey='"+invoicerxddetaildata[i].routekey+"' and visitkey='"+invoicerxddetaildata[i].visitkey+"' and itemcode='"+invoicerxddetaildata[i].itemcode+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update orderrxddetail set issync=1 where routekey='"+orderrxddetaildata[i].routekey+"' and visitkey='"+orderrxddetaildata[i].visitkey+"' and itemcode='"+orderrxddetaildata[i].itemcode+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}

function updatepromotiondetail(promotiondetaildata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update promotiondetail set issync=1 where routekey='"+promotiondetaildata[i].routekey+"' and visitkey='"+promotiondetaildata[i].visitkey+"' and itemcode='"+promotiondetaildata[i].itemcode+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update promotiondetail set issync=1 where routekey='"+promotiondetaildata[i].routekey+"' and visitkey='"+promotiondetaildata[i].visitkey+"' and itemcode='"+promotiondetaildata[i].itemcode+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updatecustomerinvoice(customerinvoicedata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update customerinvoice set issync=1 where transactionkey='"+customerinvoicedata[i].transactionkey+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update customerinvoice set issync=1 where transactionkey='"+customerinvoicedata[i].transactionkey+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updatesalesorderdetail(salesorderdetaildata,i)
{
            if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update salesorderdetail set issync=1 where routekey='"+salesorderdetaildata[i].routekey+"' and visitkey='"+salesorderdetaildata[i].visitkey+"' and itemcode='"+salesorderdetaildata[i].itemcode+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update salesorderdetail set issync=1 where routekey='"+salesorderdetaildata[i].routekey+"' and visitkey='"+salesorderdetaildata[i].visitkey+"' and itemcode='"+salesorderdetaildata[i].itemcode+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updatesalesorderheader(salesorderheaderdata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update salesorderheader set issync=1 where routekey='"+salesorderheaderdata[i].routekey+"' and visitkey='"+salesorderheaderdata[i].visitkey+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update salesorderheader set issync=1 where routekey='"+salesorderheaderdata[i].routekey+"' and visitkey='"+salesorderheaderdata[i].visitkey+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updatebatchexpirydetail(batchdetaildata,i)
{
    console.log("update batchexpirydetail set issync=1 where routekey='"+batchdetaildata[i].routekey+"' and visitkey='"+batchdetaildata[i].visitkey+"' and batchdetailkey='"+batchdetaildata[i].batchdetailkey+"'");
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update batchexpirydetail set issync=1 where routekey='"+batchdetaildata[i].routekey+"' and visitkey='"+batchdetaildata[i].visitkey+"' and batchdetailkey='"+batchdetaildata[i].batchdetailkey+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update batchexpirydetail set issync=1 where routekey='"+batchdetaildata[i].routekey+"' and visitkey='"+batchdetaildata[i].visitkey+"' and batchdetailkey='"+batchdetaildata[i].batchdetailkey+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updatearheader(arheaderdata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update arheader set issync=1 where routekey='"+arheaderdata[i].routekey+"' and visitkey='"+arheaderdata[i].visitkey+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update arheader set issync=1 where routekey='"+arheaderdata[i].routekey+"' and visitkey='"+arheaderdata[i].visitkey+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updateardetail(ardetaildata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update ardetail set issync=1 where routekey='"+ardetaildata[i].routekey+"' and visitkey='"+ardetaildata[i].visitkey+"' and transactionkey='"+ardetaildata[i].transactionkey+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update ardetail set issync=1 where routekey='"+ardetaildata[i].routekey+"' and visitkey='"+ardetaildata[i].visitkey+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updatecashcheckdetail(cashcheckdetaildata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update cashcheckdetail set issync=1 where routekey='"+cashcheckdetaildata[i].routekey+"' and visitkey='"+cashcheckdetaildata[i].visitkey+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update cashcheckdetail set issync=1 where routekey='"+cashcheckdetaildata[i].routekey+"' and visitkey='"+cashcheckdetaildata[i].visitkey+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updateinvetorytransactionheader(invetorytransactionheaderdata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update inventorytransactionheader set issync=1 where routekey='"+invetorytransactionheaderdata[i].routekey+"' and detailkey='"+invetorytransactionheaderdata[i].detailkey+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update inventorytransactionheader set issync=1 where routekey='"+invetorytransactionheaderdata[i].routekey+"' and detailkey='"+invetorytransactionheaderdata[i].detailkey+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updateinventorytransactiondetail(inventorytransactiondetaildata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update inventorytransactiondetail set issync=1 where routekey='"+inventorytransactiondetaildata[i].routekey+"' and detailkey='"+inventorytransactiondetaildata[i].detailkey+"' and itemcode='"+inventorytransactiondetaildata[i].itemcode+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update inventorytransactiondetail set issync=1 where routekey='"+inventorytransactiondetaildata[i].routekey+"' and detailkey='"+inventorytransactiondetaildata[i].detailkey+"' and itemcode='"+inventorytransactiondetaildata[i].itemcode+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updateinventorysummarydetail(inventorysummarydetaildata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update inventorysummarydetail set issync=1 where routekey='"+inventorysummarydetaildata[i].routekey+"' and itemcode='"+inventorysummarydetaildata[i].itemcode+"' and inventorykey='"+inventorysummarydetaildata[i].inventorykey+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update inventorysummarydetail set issync=1 where routekey='"+inventorysummarydetaildata[i].routekey+"' and itemcode='"+inventorysummarydetaildata[i].itemcode+"' and inventorykey='"+inventorysummarydetaildata[i].inventorykey+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updatenonservicedcustomerdata(nonservicedcustomerdata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update nonservicedcustomer set issync=1 where routekey='"+nonservicedcustomerdata[i].routekey+"' and customercode='"+nonservicedcustomerdata[i].customercode+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update nonservicedcustomer set issync=1 where routekey='"+nonservicedcustomerdata[i].routekey+"' and customercode='"+nonservicedcustomerdata[i].customercode+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updatesurveyauditdetail(surveyauditdetaildata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update surveyauditdetail set issync=1 where routekey='"+surveyauditdetaildata[i].routekey+"' and visitkey='"+surveyauditdetaildata[i].visitkey+"' and surveydefkey='"+surveyauditdetaildata[i].surveydefkey+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update surveyauditdetail set issync=1 where routekey='"+surveyauditdetaildata[i].routekey+"' and visitkey='"+surveyauditdetaildata[i].visitkey+"' and surveydefkey='"+surveyauditdetaildata[i].surveydefkey+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updateposequipmentchangedetail(posequipmentchangedetaildata,p)
{  //console.log(JSON.stringify(posequipmentchangedetaildata));
	//alert(JSON.stringify(posequipmentchangedetaildata));
	//alert(posequipmentchangedetaildata[0].routekey);
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update posequipmentchangedetail set issync=1 where routekey='"+posequipmentchangedetaildata[i].routekey+"' and visitkey='"+posequipmentchangedetaildata[i].visitkey+"' and itemcode='"+posequipmentchangedetaildata[i].itemcode+"'"]);
            }
            else if(platform=='Android')
            {
            	//var cc="update posequipmentchangedetail set issync=1 where routekey='"+posequipmentchangedetaildata[0].routekey+"' and visitkey='"+posequipmentchangedetaildata[0].visitkey+"' and itemcode='"+posequipmentchangedetaildata[0].itemcode+"'";
            	//console.log(cc);
            	//alert(cc);
                                                                    window.plugins.DataBaseHelper.insert("update posequipmentchangedetail set issync=1 where routekey='"+posequipmentchangedetaildata[0].routekey+"' and visitkey='"+posequipmentchangedetaildata[0].visitkey+"' and itemcode='"+posequipmentchangedetaildata[0].itemcode+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updateposmaster(posmasterdata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update posmaster set issync=1 where itemcode='"+posmasterdata[i].itemcode+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update posmaster set issync=1 where itemcode='"+posmasterdata[i].itemcode+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updatesigcapturedata(sigcapturedata,i)
{
    if(platform=='iPad')
	    {
                return abc = Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update sigcapturedata set issync=1 where transactionkey='"+sigcapturedata[i].transactionkey+"' and routekey='"+sigcapturedata[i].routekey+"' and visitkey='"+sigcapturedata[i].visitkey+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update sigcapturedata set issync=1 where transactionkey='"+sigcapturedata[i].transactionkey+"' and routekey='"+sigcapturedata[i].routekey+"' and visitkey='"+sigcapturedata[i].visitkey+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updatecustomermaster(customermasterdata,i)
{
    if(platform=='iPad')
	    {
                Cordova.exec(function(result) {
                                           //alert(result);
                                           return true;
                                           },
                                           function(error) {
                                           alert(error);},
                                           "PluginClass", 
                                           "InsertUpdateMethod", 
                                           ["update customermaster set issync=1 where customercode='"+customermasterdata[i].customercode+"'"]);
            }
            else if(platform=='Android')
            {
            	console.log("customermaster update");
            	console.log("update customermaster set issync=1 where customercode='"+customermasterdata[i].customercode+"'");
                                                                    window.plugins.DataBaseHelper.insert("update customermaster set issync=1 where customercode='"+customermasterdata[i].customercode+"'",function(result)
                                                                                    {
                                                                                     return true;
                                                                                    },
                                                                                    function()
                                                                                    {
                                                                                     console.warn("Error calling plugin");
                                                                                    });
            }
}
function updatecustomeroperationscontrol(customeroperationscontrol,i)
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
                      //alert(result);
                      return true;
                      },
                      function(error) {
                      alert(error);},
                      "PluginClass", 
                      "InsertUpdateMethod", 
                      ["update customeroperationscontrol set issync=1 where visitkey='"+customeroperationscontrol[i].visitkey+"' and routekey='"+customeroperationscontrol[i].routekey+"'"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.insert("update customeroperationscontrol set issync=1 where visitkey='"+customeroperationscontrol[i].visitkey+"' and routekey='"+customeroperationscontrol[i].routekey+"'",function(result)
                                             {
                                             return true;
                                             },
                                             function()
                                             {
                                             console.warn("Error calling plugin");
                                             });
    }
}
function updatecustomerinventorydetail(customerinventorydetail,i)
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            //alert(result);
            return true;
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "InsertUpdateMethod", 
        ["update customerinventorydetail set issync=1 where visitkey='"+customerinventorydetail[i].visitkey+"' and routekey='"+customerinventorydetail[i].routekey+"' and itemcode='"+customerinventorydetail[i].itemcode+"'"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.insert("update customerinventorydetail set issync=1 where visitkey='"+customerinventorydetail[i].visitkey+"' and routekey='"+customerinventorydetail[i].routekey+"' and itemcode='"+customerinventorydetail[i].itemcode+"'",function(result)
        {
            return true;
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}
function updateroutesequencecustomerstatus(routesequencecustomerstatus,i)
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            //alert(result);
            return true;
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "InsertUpdateMethod", 
        ["update routesequencecustomerstatus set issync=1 where customercode='"+routesequencecustomerstatus[i].customercode+"' and routekey='"+routesequencecustomerstatus[i].routekey+"'"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.insert("update routesequencecustomerstatus set issync=1 where customercode='"+routesequencecustomerstatus[i].customercode+"' and routekey='"+routesequencecustomerstatus[i].routekey+"'",function(result)
        {
            return true;
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}
function updateroutegoal(routegoal,i)
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            //alert(result);
            return true;
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "InsertUpdateMethod", 
        ["update routegoal set issync=1 where primary_key='"+routegoal[i].primary_key+"'"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.insert("update routegoal set issync=1 where primary_key='"+routegoal[i].primary_key+"'",function(result)
        {
            return true;
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}
function updatenosalesheader(nosalesheader,i)
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            //alert(result);
            return true;
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "InsertUpdateMethod", 
        ["update nosalesheader set issync=1 where transactionkey='"+nosalesheader[i].transactionkey+"'"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.insert("update nosalesheader set issync=1 where transactionkey='"+nosalesheader[i].transactionkey+"'",function(result)
        {
            return true;
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}
function updatecustomer_foc_balance(customer_foc_balance,i)
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            //alert(result);
            return true;
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "InsertUpdateMethod", 
        ["update customer_foc_balance set issync=1 where customercode='"+customer_foc_balance[i].customercode+"' and itemcode="+customer_foc_balance[i].itemcode]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.insert("update customer_foc_balance set issync=1 where customercode='"+customer_foc_balance[i].customercode+"' and itemcode="+customer_foc_balance[i].itemcode,function(result)
        {
            return true;
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}
function updateenddaydetail(enddaydata,i)
{
if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            //alert(result);
            return true;
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "InsertUpdateMethod", 
        ["update enddaydetail set issync=1 where routekey='"+enddaydata[i].routekey+"'"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.insert("update enddaydetail set issync=1 where routekey='"+enddaydata[i].routekey+"'",function(result)
        {
            return true;
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}
function updatt_access_override_log(logdata,i)
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            //alert(result);
            return true;
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "InsertUpdateMethod", 
        ["update t_access_override_log set issync=1 where routekey='"+logdata[i].routekey+"' and visitkey='"+logdata[i].visitkey+"' and featureid='"+logdata[i].featureid+"'"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.insert("update t_access_override_log set issync=1 where routekey='"+logdata[i].routekey+"' and visitkey='"+logdata[i].visitkey+"' and featureid='"+logdata[i].featureid+"'",function(result)
        {
            return true;
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}

function updatt_customerinventorycheck(logdata,i)
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            //alert(result);
            return true;
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "InsertUpdateMethod", 
        ["update customerinventorycheck set issync=1 where routekey='"+logdata[i].routekey+"' and visitkey='"+logdata[i].visitkey+"' and itemcode='"+logdata[i].itemcode+"' and expiry_date='"+logdata[i].expiry_date+"'"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.insert("update customerinventorycheck set issync=1 where routekey='"+logdata[i].routekey+"' and visitkey='"+logdata[i].visitkey+"' and itemcode='"+logdata[i].itemcode+"' and expiry_date='"+logdata[i].expiry_date+"'",function(result)
        {
            return true;
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}
function updatt_visualsfeedback(logdata,i)
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            //alert(result);
            return true;
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "InsertUpdateMethod", 
        ["update visualsfeedback set issync=1 where routekey='"+logdata[i].routekey+"' and visitkey='"+logdata[i].visitkey+"' and visualdetail_id='"+logdata[i].visualdetail_id+"'"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.insert("update visualsfeedback set issync=1 where routekey='"+logdata[i].routekey+"' and visitkey='"+logdata[i].visitkey+"' and visualdetail_id='"+logdata[i].visualdetail_id+"'",function(result)
        {
            return true;
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}
function updatt_promotions_remark(logdata,i)
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            //alert(result);
            return true;
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "InsertUpdateMethod", 
        ["update promotions_remark set issync=1 where routekey='"+logdata[i].routekey+"' and customercode='"+logdata[i].customercode+"' and promotionkey='"+logdata[i].promotionkey+"'"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.insert("update promotions_remark set issync=1 where routekey='"+logdata[i].routekey+"' and customercode='"+logdata[i].customercode+"' and promotionkey='"+logdata[i].promotionkey+"'",function(result)
        {
            return true;
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}
function updatt_customerdistributioncheck(logdata,i)
{
    if(platform=='iPad')
    {
        Cordova.exec(function(result) {
            //alert(result);
            return true;
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "InsertUpdateMethod", 
        ["update customerdistributioncheck set issync=1 where routekey='"+logdata[i].routekey+"' and customercode='"+logdata[i].customercode+"' and itemcode='"+logdata[i].itemcode+"' and visitkey='"+logdata[i].visitkey+"'"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.insert("update customerdistributioncheck set issync=1 where routekey='"+logdata[i].routekey+"' and customercode='"+logdata[i].customercode+"' and itemcode='"+logdata[i].itemcode+"' and visitkey='"+logdata[i].visitkey+"'",function(result)
        {
            return true;
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    }
}
