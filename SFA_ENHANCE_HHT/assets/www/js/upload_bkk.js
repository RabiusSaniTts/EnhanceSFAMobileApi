//Function is used for load specify xml file

var platform= sessionStorage.getItem("platform");
var invoicedetail={};
var invoiceheader={};
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
var routegoal={};
var nosalesheader={};
var customer_foc_balance={};
var enddaydetail={};
var t_access_override_log={};
var syncflag='';
var redlink='';
var routekey="";
var transactionkey="";
var visitkey="";
//var clrlog='';
function sendmanualdata(rkey,tkey,vkey,flag) {

	

//alert("test");
//alert(cl);
    //alert(flag);
    //alert(url);
    invoicedetail={};
    invoiceheader={};
    invoicerxddetail={};
    promotiondetail={};
    customerinvoice={};
    salesorderdetail={};
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
    routegoal={};
    nosalesheader={};
    customer_foc_balance={};
    enddaydetail={};
    t_access_override_log={};
   // syncflag= flag;
    //redlink = url;
	//clrlog=cl;
    $.mobile.showPageLoadingMsg();
	if(flag=='1')
	{
	alert("sss");
    getinvoicedetail();
	}
   // getinvoiceheader();
   // getinvoicerxddetail();
   // getpromotiondetail();
   // getcustomerinvoice();
   // getsalesorderdetail();
   // getsalesorderheader();
   // getbatchexpirydetail();
   // getarheader();
   // getardetail();
   // getcashcheckdetail();
   // getinvetorytransactionheader();
   // getinventorytransactiondetail();
   // getinventorysummarydetail();
   // getnonservicedcustomer();
   // getsurveyauditdetail();
   // getposequipmentchangedetail();
   // getposmaster();
   // getsigcapturedata();
   // getcustomermaster();
   // getcustomeroperationcontrol();
   // getroutemaster();
   // getroutesequencecustomerstatus();
   // getcustomerinventorydetail();
   //  getroutegoal1();
   // getnosalesheader();
   //getcustomer_foc_balance();
   //getenddaydetail();
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
		var qry="select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,salesprice,returnprice,stdsalesprice,stdreturnprice,promoqty,salesitemexcisetax,salesitemgsttax,returnitemexcisetax,returnitemgsttax,damageditemexcisetax,damageditemgsttax,fgitemexcisetax,fgitemgsttax,promoitemexcisetax,promoitemgsttax,coopid,batchdetailkey,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,goodreturnprice,goodreturncaseprice,stdgoodreturncaseprice,stdgoodreturnprice,expiryqty,currencycode,returnfreeqty,manualfreeqty,limitedfreeqty,rebaterentqty,fixedrentqty,pricechgindicator,discountamount,discountpercentage,promoamount,replacementqty,replacementprice,replacementcaseprice,promovalue,mdat,returnpromovalue,returnpromoamount,amount,diffround,roundsalesamount from invoicedetail where issync=0 and istemp='false' and routekey in (" + routekey + ") and transactionkey in (" + transactionkey + ")";
		alert(qry);
                window.plugins.DataBaseHelper.select("select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,salesprice,returnprice,stdsalesprice,stdreturnprice,promoqty,salesitemexcisetax,salesitemgsttax,returnitemexcisetax,returnitemgsttax,damageditemexcisetax,damageditemgsttax,fgitemexcisetax,fgitemgsttax,promoitemexcisetax,promoitemgsttax,coopid,batchdetailkey,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,goodreturnprice,goodreturncaseprice,stdgoodreturncaseprice,stdgoodreturnprice,expiryqty,currencycode,returnfreeqty,manualfreeqty,limitedfreeqty,rebaterentqty,fixedrentqty,pricechgindicator,discountamount,discountpercentage,promoamount,replacementqty,replacementprice,replacementcaseprice,promovalue,mdat,returnpromovalue,returnpromoamount,amount,diffround,roundsalesamount from invoicedetail where issync=0 and istemp='false' and routekey in (" + routekey + ") and transactionkey in (" + transactionkey + ")",function(result)
				
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        invoicedetail[i] = result.array[i];
                                    }
                                
                                
                            }
							alert(JSON.stringify(invoicedetail));
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
                window.plugins.DataBaseHelper.select("select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,salesmancode,presoldordernumber,presalesmancode,presalesroutecode,orderdeliverydate,orderdeliveryroutecode,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,totalfreesampleamount,immediatepaid,amountpaid,invoicebalance,dexflag,dexg86signature,paymenttype,splittransaction,voidflag,transmitindicator,paymentstatus,hhcinvoicenumber,totalpromoamount,gcpaymenttype,hhcdocumentnumber,inventorykey,totaltaxesamount,itemlinetaxamount,totaldiscountamount,voidreasoncode,totalexpiryamount,currencycode,totalmanualfree,totallimitedfree,totalrebaterent,totalfixedrent,actualtransactiondate,boentry,hhctransactionkey,data,comments,totaldiscdistributionamount,totalreplacementamount,comments2,totalbuybackfreeamount,diffround,roundtotalsalesamount from invoiceheader where issync=0 and istemp='false' and transactionkey in (" + transactionkey + ")",function(result)
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
                                ["select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,itemtranstypeseq,reasoncode,quantity,catchweightqty,weighted,instructioncode,currencycode from invoicerxddetail where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,itemtranstypeseq,reasoncode,quantity,catchweightqty,weighted,instructioncode,currencycode from invoicerxddetail where issync=0 and istemp='false' and routekey in (" + routekey + ") and transactionkey in (" + transactionkey + ")",function(result)
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
                window.plugins.DataBaseHelper.select("select routekey,visitkey,transactionkey,itemtransactiontype,itemcode,promotiontypecode,promotionamount,promotionquantity,catchweightqty,weighted,promotionplannumber,assignmentkey,exclusionoption,promochgindicator,oldpromotionamount,performindicator,performcriteriakey,promotioncaseprice,currencycode from promotiondetail where issync=0 and istemp='false' and routekey in (" + routekey + ") and transactionkey in (" + transactionkey + ")",function(result)
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
						// uploaddata();
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
                                          getsalesorderdetail();              
                                },
                                function(error) {
                                alert(error);},
                                "PluginClass", 
                                "GetfielddataMethod", 
                                ["select transactionkey,transactiontype,documentnumber,invoicenumber,transactiondate,transactiontime,customercode,routecode,salesmancode,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,totalfreesampleamount,immediatepaid,amountpaid,dnamountpaid,cnamountpaid,invoicebalance,paymenttype,voidflag,paymentstatus,hhcinvoicenumber,remarks1,remarks2,routestartdate,erpreferencenumber,mdat,totalpromoamount,gcpaymenttype,totaltaxesamount,itemlinetaxamount,totaldiscountamount,pdcindicator,chequecollection,totalexpiryamount,currencycode,pdcbalance,totalmanualfree,totallimitedfree,totalrebaterent,totalfixedrent,data,totaldiscdistributionamount,totalreplacementamount,pdcdate,totalbuybackfreeamount from customerinvoice where issync=0"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select transactionkey,transactiontype,documentnumber,invoicenumber,transactiondate,transactiontime,customercode,routecode,salesmancode,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,totalfreesampleamount,immediatepaid,amountpaid,dnamountpaid,cnamountpaid,invoicebalance,paymenttype,voidflag,paymentstatus,hhcinvoicenumber,remarks1,remarks2,routestartdate,erpreferencenumber,mdat,totalpromoamount,gcpaymenttype,totaltaxesamount,itemlinetaxamount,totaldiscountamount,pdcindicator,chequecollection,totalexpiryamount,currencycode,pdcbalance,totalmanualfree,totallimitedfree,totalrebaterent,totalfixedrent,data,totaldiscdistributionamount,totalreplacementamount,pdcdate,totalbuybackfreeamount from customerinvoice where issync=0 and transactionkey in (" + transactionkey + ")",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        customerinvoice[i] = result.array[i];
                                    }
                                
                               
                            }
                         customerinvoice=JSON.stringify(customerinvoice);
                         getsalesorderdetail();
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
                window.plugins.DataBaseHelper.select("select routekey,visitkey,transactionkey,itemcode,salesqty,returnqty,damagedqty,freesampleqty,salesprice,returnprice,stdsalesprice,stdreturnprice,coopid,salescaseprice,returncaseprice,stdsalescaseprice,stdreturncaseprice,currencycode,allocated,freegoodcases,freegoodpcs,salespcs,allocatedcases,salescases,allocatedpcs,returncases,returnpcs from salesorderdetail where issync=0 and istemp='false' and routekey in (" + routekey + ") and transactionkey in (" + transactionkey + ")",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        salesorderdetail[i] = result.array[i];
                                    }
                               
                                
                            }
                          salesorderdetail=JSON.stringify(salesorderdetail);
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
                                ["select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,salesmancode,orderdeliveryroutecode,orderdeliverydate,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,dexflag,splittransaction,voidflag,transmitindicator,hhcinvoicenumber,paymenttype,hhcdocumentnumber,voidreasoncode,advanceused,paymentstatus,advancebalance,mdat,advancereceived,currencycode,status,refnumber,totalfreesampleamount,deliverystatus,data,comments,actualtransactiondate,comments2,hhctransactionkey,totalpromoamount,totalbuybackfreeamount from salesorderheader where issync=0 and istemp='false'"]);
    }
    else if(platform=='Android')
    {
                window.plugins.DataBaseHelper.select("select transactionkey,routekey,visitkey,documentnumber,invoicenumber,transactiondate,transactiontime,dsdnumber,ponumber,customercode,routecode,salesmancode,orderdeliveryroutecode,orderdeliverydate,totalinvoiceamount,totalsalesamount,totalreturnamount,totaldamagedamount,dexflag,splittransaction,voidflag,transmitindicator,hhcinvoicenumber,paymenttype,hhcdocumentnumber,voidreasoncode,advanceused,paymentstatus,advancebalance,mdat,advancereceived,currencycode,status,refnumber,totalfreesampleamount,deliverystatus,data,comments,actualtransactiondate,comments2,hhctransactionkey,totalpromoamount,totalbuybackfreeamount from salesorderheader where issync=0 and istemp='false' and routekey in (" + routekey + ") and transactionkey in (" + transactionkey + ")",function(result)
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
                window.plugins.DataBaseHelper.select("select routekey,batchdetailkey,batchnumber,itemcode,expirydate,quantity,transactiontypecode,visitkey from batchexpirydetail where issync=0 and istemp='false' and routekey in (" + routekey + ") and visitkey in (" + transactionkey + ")",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        batchexpirydetail[i] = result.array[i];
                                    }
                                
                                
                            }
                         batchexpirydetail=JSON.stringify(batchexpirydetail);
                          getarheader();
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
                window.plugins.DataBaseHelper.select("select transactionkey,routekey,visitkey,documentnumber,transactiondate,transactiontime,customercode,routecode,salesmancode,voidflag,splittransaction,transmitindicator,totalinvoiceamount,amountpaid,invoicebalance,invoicenumber,hhcdocumentnumber,hhcinvoicenumber,voidreasoncode,chequecollection,currencycode,hhctransactionkey,data,comments,advancepaymentflag,excesspayment,comments2 from arheader where issync=0 and transactionkey in (" + transactionkey + ")",function(result)
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
                window.plugins.DataBaseHelper.select("select routekey,visitkey,transactionkey,invoicenumber,invoicedate,totalinvoiceamount,onacctreasoncode,amountpaid,invoicebalance,arcollectiontype,chequestatusindicator,sapchequestatusindicator,currencycode,pdcbalance,alternateinvoicenumber from ardetail where issync=0 and routekey in (" + routekey + ") and transactionkey in (" + transactionkey + ")",function(result)
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
                window.plugins.DataBaseHelper.select("select routekey,visitkey,typecode,checknumber,amount,updateindicator,checkdate,bankcode,checkstatus,branchcode,drawercode,chequestatusindicator,sapchequestatusindicator,currencycode,hhctransactionkey,paymenttype,checktype,transactiontype from cashcheckdetail where issync=0 and istemp='false' and routekey in (" + routekey + ") and visitkey in (" + visitkey + ")",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        cashcheckdetail[i] = result.array[i];
                                    }
                                
                                
                            }
                            cashcheckdetail=JSON.stringify(cashcheckdetail);
							//uploaddata();
							//getcustomeroperationcontrol();
                        getinvetorytransactionheader();
                         
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
                window.plugins.DataBaseHelper.select("select inventorykey,detailkey,routekey,transactiontype,routecode,salesmancode,transactiondate,transactiontime,documentnumber,odometerreading,transferlocationcode,referencenumber,requestdate,securitycode,transmitindicator,voidflag,hhcdocumentnumber,loadnumber,refdocumentnumber,currencycode,actualtransactiondate,inventorynumber,data from inventorytransactionheader where issync=0 and istemp='false' and detailkey in (" + transactionkey + ")",function(result)
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
                window.plugins.DataBaseHelper.select("select routekey,detailkey,transactiontypecode,itemcode,quantity,weighted,itemprice,batchdetailkey,itemcaseprice,currencycode from inventorytransactiondetail where issync=0 and istemp='false' and routekey in (" + routekey + ") and detailkey in (" + transactionkey + ")",function(result)
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
                window.plugins.DataBaseHelper.select("select inventorykey,itemcode,routekey,weighted,beginstockqty,loadqty,loadaddqty,loadcutqty,loadreqqty,saleqty,returnqty,damagedaddqty,damagedcutqty,endstockqty,unloadqty,damagedunloadqty,freesampleqty,truckdamagedunloadqty,stdsalesprice,stdreturnprice,cashsalesqty,cashsalesvalue,tcsalesqty,tcsalesvalue,gcsalesqty,gcsalesvalue,cashdamagedqty,cashdamagedvalue,tcdamagedqty,tcdamagedvalue,gcdamagedqty,gcdamagedvalue,cashreturnqty,cashreturnvalue,tcreturnqty,tcreturnvalue,gcreturnqty,gcreturnvalue,promoqty,cashsalesitemexcisetax,cashsalesitemgsttax,cashreturnitemexcisetax,cashreturnitemgsttax,cashdamageditemexcisetax,cashdamageditemgsttax,cashfgitemexcisetax,cashfgitemgsttax,cashpromoitemexcisetax,cashpromoitemgsttax,tcsalesitemexcisetax,tcsalesitemgsttax,tcreturnitemexcisetax,tcreturnitemgsttax,tcdamageditemexcisetax,tcdamageditemgsttax,tcfgitemexcisetax,tcfgitemgsttax,tcpromoitemexcisetax,tcpromoitemgsttax,gcsalesitemexcisetax,gcsalesitemgsttax,gcreturnitemexcisetax,gcreturnitemgsttax,gcdamageditemexcisetax,gcdamageditemgsttax,gcfgitemexcisetax,gcfgitemgsttax,gcpromoitemexcisetax,gcpromoitemgsttax,batchdetailkey,stdsalescaseprice,stdreturncaseprice,expiryqty,stdgoodreturncaseprice,stdgoodreturnprice,currencycode,returnfreeqty,damageqty,expdmgfreeqty,expunloadqty,dmgunloadqty,expdmgfreeunloadqty,rentqty,mdat,freshunloadqty,emptycontainerqty,emptycontainerunloadqty from inventorysummarydetail where issync=0 and istemp='false' and routekey in (" + routekey + ")",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        inventorysummarydetail[i] = result.array[i];
                                    }
                                
                                
                            }
                            inventorysummarydetail=JSON.stringify(inventorysummarydetail);
                         /*if(syncflag=='print')
						 {
						 getsurveyauditdetail();     
						 }else
						 {*/
						 getnonservicedcustomer();
						 //}
                         
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
                window.plugins.DataBaseHelper.select("select routekey,customercode,reasoncode from nonservicedcustomer where issync=0 and routekey in (" + routekey + ") and customercode in (" + transactionkey + ")",function(result)
                {
                            if(!$.isEmptyObject(result))
                            {
                                    for(i=0;i<result.array.length;i++)
                                    {
                                        nonservicedcustomer[i] = result.array[i];
                                    }
                                
                                
                            }
                            nonservicedcustomer=JSON.stringify(nonservicedcustomer);
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
                window.plugins.DataBaseHelper.select("select routekey,visitkey,surveydefkey,surveypage,surveyindex,surveyrectype,lookuptype,surveyresponse from surveyauditdetail where issync=0 and routekey in (" + routekey + ") and visitkey in (" + visitkey + ")",function(result)
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
                window.plugins.DataBaseHelper.select("select routekey,visitkey,posaction,itemcode,quantity,serialnumber,instructioncode from posequipmentchangedetail where issync=0 and routekey in (" + routekey + ") and visitkey in (" + visitkey + ")",function(result)
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
                window.plugins.DataBaseHelper.select("select routekey,visitkey,transactionkey,customercode,documentnumber,transactiondate,transactiontime,balancedueamount,signaturedata,transaction_type from sigcapturedata where issync=0 and istemp='false' and routekey in (" + routekey + ") and visitkey in (" + visitkey + ")",function(result)
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
        window.plugins.DataBaseHelper.select("select visitkey,routekey,customercode,routecode,salesmancode,odometerreading,visitstartdate,visitstarttime,visitenddate,visitendtime,totaltransactions,addedcustomer,voidflag,scannerindicator,reasoncode,latitude,longitude,radius from customeroperationscontrol where issync=0 and routekey in (" + routekey + ") and visitkey in (" + transactionkey + ")",function(result)
                                             {
                                             if(!$.isEmptyObject(result))
                                             {
                                                 for(i=0;i<result.array.length;i++)
                                                 {
                                                 customeroperationscontrol[i] = result.array[i];
                                                 }
                                                 
                                             }
                                             customeroperationscontrol=JSON.stringify(customeroperationscontrol);
                                             getroutemaster();
												//uploaddata();
                                             },
                                             function()
                                             {
                                             console.warn("Error calling plugin");
                                             });
    }
}
function getroutemaster()
{
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
        window.plugins.DataBaseHelper.select("select routekey,seqweeknumber,seqweekday,routecode,customercode,sequencenumber,schelduledflag,servicedflag,scannedflag from routesequencecustomerstatus where issync=0 and routekey in (" + routekey + ")",function(result)
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
            getroutegoal1();
            
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "GetfielddataMethod", 
        ["select routekey,visitkey,itemcode,weighted,qtyloc1case,catchweightqtyloc1,qtyloc1each,qtyloc2case,catchweightqtyloc2,qtyloc2each,qtyloc3case,catchweightqtyloc3,qtyloc3each,shelfstockcase,shelfstockcatchweightqty,shelfstockeach,oldestcode from customerinventorydetail where issync=0"]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.select("select routekey,visitkey,itemcode,weighted,qtyloc1case,catchweightqtyloc1,qtyloc1each,qtyloc2case,catchweightqtyloc2,qtyloc2each,qtyloc3case,catchweightqtyloc3,qtyloc3each,shelfstockcase,shelfstockcatchweightqty,shelfstockeach,oldestcode from customerinventorydetail where issync=0 and routekey in (" + routekey + ") and visitkey in (" + visitkey + ")",function(result)
        {
            if(!$.isEmptyObject(result))
            {
                for(i=0;i<result.array.length;i++)
                {
                    customerinventorydetail[i] = result.array[i];
                }
                
                
            }
            customerinventorydetail=JSON.stringify(customerinventorydetail);
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
        window.plugins.DataBaseHelper.select("select transactionkey,routekey,visitkey,documentnumber,invoicenumber,routecode,salesmancode,transactiondate,transactiontime,nosalereasoncode,voidflag,transmitindicator,customercode,hhcdocumentnumber,hhcinvoicenumber,data from nosalesheader where issync=0 and routekey in (" + routekey + ")",function(result)
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
function getImages()
{                
    var Qry = "SELECT imagename,imagepath FROM customerimages WHERE routecode=" + sessionStorage.getItem("RouteCode");
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
	//ft.upload(filePath, "http://23.21.226.54/php/sfaweb/sfa_client/api/image/upload", win, fail, options);   
	//ft.upload(filePath, "http://82.178.28.172:8081/sfa/ver11/api/image/upload", win, fail, options);
	//ft.upload(filePath, "http://82.178.28.172:8085/sfa/smb/api/image/upload", win, fail, options);
	//ft.upload(filePath, "http://82.178.28.172:8085/sfa/sfa_test/api/image/upload", win, fail, options);
	//ft.upload(filePath, "http://82.178.28.172:8086/sfa/sfa_uae/api/image/upload", win, fail, options);
	//ft.upload(filePath, "http://82.178.28.172:8086/sfa/sfa_ksa/api/image/upload", win, fail, options);
	ft.upload(filePath, "http://82.178.28.172:8086/sfa/sfa_test/api/image/upload", win, fail, options);
	//  ft.upload(filePath, "http://82.178.28.172:8086/sfa/uae_pilot/api/image/upload", win, fail, options);
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
	console.log("error uploading images " + err);
}

var tblcustomerimage = {};
function UpdateImageSuccess()
{	
    if(cntupload == 0)
    {        
        var qry = "SELECT imagename,customercode,imageno,imagepath,routecode,routekey,transactiondate,transactiontime,visitkey,issync FROM customerimages WHERE issync = 1";
        if(platform == "iPad")
        {                    	
        	Cordova.exec(function(result) {
        		if(result != '')
        			tblcustomerimage = result;
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
	                    tblcustomerimage[i] = result.array[i];
	                }
	            }
	            tblcustomerimage = JSON.stringify(tblcustomerimage);    
	            console.log("customerimage : " + tblcustomerimage);
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
    
      
    
  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail1);
    
            $.ajax({
                   type: "post",
                   url:wsurl+"sync/senddata",
                   cache: false,
                    timeout: 60000,
                data:{invoicedetail:invoicedetail,invoiceheader:invoiceheader,invoicerxddetail:invoicerxddetail,promotiondetail:promotiondetail,customerinvoice:customerinvoice,salesorderheader:salesorderheader,salesorderdetail:salesorderdetail,batchexpirydetail:batchexpirydetail,arheader:arheader,ardetail:ardetail,cashcheckdetail:cashcheckdetail,inventorytransactionheader:invetorytransactionheader,inventorytransactiondetail:inventorytransactiondetail,inventorysummarydetail:inventorysummarydetail,nonservicedcustomer:nonservicedcustomer,surveyauditdetail:surveyauditdetail,posequipmentchangedetail:posequipmentchangedetail,posmaster:posmaster,sigcapturedata:sigcapturedata,customermaster:customermaster,customeroperationscontrol:customeroperationscontrol,routemaster:routemaster,customerinventorydetail:customerinventorydetail,routesequencecustomerstatus:routesequencecustomerstatus,routegoal:routegoal,nosalesheader:nosalesheader,routekey:routekey,routecode:routecode,routeclosed:routeclosed,userid:userid,customer_foc_balance:customer_foc_balance,enddaydetail:enddaydetail,t_access_override_log:t_access_override_log},
               
                   success: function(data) {

                     alert(data);
                       //console.log("data : " + data);
                     data = JSON.parse(data);
                     
                   var invoicedetaildata = data.invoicedetail;
                   var invoiceheaderdata = data.invoiceheader;
                   var invoicerxddetaildata = data.invoicerxddetail;
                   var promotiondetaildata = data.promotiondetail;
                   var customerinvoicedata = data.customerinvoice;
                   var salesorderdetaildata = data.salesorderdetail;
                   var salesorderheaderdata = data.salesorderheader;
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
                    for(i=0;i<invoicedetaildata.length;i++)
                   {
                        updateinvoicedetail(invoicedetaildata,i);
                   }
                   for(j=0;j<invoiceheaderdata.length;j++)
                   {
                        updateinvoiceheader(invoiceheaderdata,j);
                   }
                   for(k=0;k<invoicerxddetaildata.length;k++)
                   {
                        updateinvoicerxddetail(invoicerxddetaildata,k);
                   }
                   for(a=0;a<promotiondetaildata.length;a++)
                   {
                        updatepromotiondetail(promotiondetaildata,a);
                   }
                   for(b=0;b<customerinvoicedata.length;b++)
                   {
                        updatecustomerinvoice(customerinvoicedata,b);
                   }
                   for(c=0;c<salesorderdetaildata.length;c++)
                   {
                        updatesalesorderdetail(salesorderdetaildata,c);
                   }
                   for(d=0;d<salesorderheaderdata.length;d++)
                   {
                        updatesalesorderheader(salesorderheaderdata,d);
                   }
                  
                   for(e=0;e<batchexpirydetaildata.length;e++)
                   {
                        updatebatchexpirydetail(batchexpirydetaildata,e);
                   }
                   for(f=0;f<arheaderdata.length;f++)
                   {
                        updatearheader(arheaderdata,f);
                   }
                   for(g=0;g<ardetaildata.length;g++)
                   {
                        updateardetail(ardetaildata,g);
                   }
                   for(h=0;h<cashcheckdetaildata.length;h++)
                   {
                        updatecashcheckdetail(cashcheckdetaildata,h);
                   }
                  /* for(k=0;k<invetorytransactionheaderdata.length;k++)
                   {
                        updateinvetorytransactionheader(invetorytransactionheaderdata,k);
                   }
                   for(l=0;l<inventorytransactiondetaildata.length;l++)
                   {
                        updateinventorytransactiondetail(inventorytransactiondetaildata,l);
                   }
                   for(m=0;m<inventorysummarydetaildata.length;m++)
                   {
                        updateinventorysummarydetail(inventorysummarydetaildata,m);
                   }
                   for(n=0;n<nonservicedcustomerdata.length;n++)
                   {
                        updatenonservicedcustomerdata(nonservicedcustomerdata,n);
                   }
                   for(o=0;o<surveyauditdetaildata.length;o++)
                   {
                        updatesurveyauditdetail(surveyauditdetaildata,o);
                   }
                   for(p=0;p<posequipmentchangedetaildata.length;p++)
                   {
                        updateposequipmentchangedetail(posequipmentchangedetaildata,p);
                   }
                   for(q=0;q<posmasterdata.length;q++)
                   {
                        updateposmaster(posmasterdata,q);
                   }
                   for(r=0;r<sigcapturedata.length;r++)
                   {
                    updatesigcapturedata(sigcapturedata,r);
                   }
                   for(s=0;s<customermasterdata.length;s++)
                   {
                    updatecustomermaster(customermasterdata,s);
                   }
                   for(t=0;t<customeroperationscontrol.length;t++)
                   {
                   updatecustomeroperationscontrol(customeroperationscontrol,t);
                   }
                   for(i=0;i<customerinventorydetail.length;i++)
                    {
                        updatecustomerinventorydetail(customerinventorydetail,i);
                    }
                    for(i=0;i<routesequencecustomerstatus.length;i++)
                    {
                         updateroutesequencecustomerstatus(routesequencecustomerstatus,i);
                    }
                    for(i=0;i<routegoal.length;i++)
                    {
                        updateroutegoal(routegoal,i);
                    }  
                    for(i=0;i<nosalesheader.length;i++)
                    {
                        updatenosalesheader(nosalesheader,i);
                    }
                    for(j=0;j<customer_foc_balance.length;j++)
                    {
                         updatecustomer_foc_balance(customer_foc_balance,j);
                    }
                    for(k=0;k<enddaydetail.length;k++)
                    {
                          updateenddaydetail(enddaydetail,k);
                     }
                     for(l=0;l<t_access_override_log.length;l++)
                     {
                          updatt_access_override_log(t_access_override_log,l);
                     }*/
                     $.mobile.hidePageLoadingMsg();
					
                     navigator.notification.alert("Data Sent Successfully.");
                       
                       
                   if(syncflag=='batch')
                   {
                   var startdate = new Date();
                   var syncinvtime = sessionStorage.getItem('synctimeint');
                   var settime = Math.abs(startdate.getTime())+(eval(syncinvtime)*60);
                   sessionStorage.setItem('batchtime',settime); 
                   }
                   else if(syncflag=='print')
                   {
                   window.location.href=redlink;
                   }
                   else
                   {
				  refreshTable();
				    //SaveEndDay();
                   //window.location.href="uploaddata.html";
                   }
                   },
                   error: function(qXHR, textStatus, errorThrown) {
                    $.mobile.hidePageLoadingMsg();
                    navigator.notification.alert("Connection Error! Acknowledgement Not Received.");
                    
				   
				   refreshTable();
                   //window.location.href="home/home.html";
                   
                  // alert("failure: " + qXHR.status + ":" + textStatus + errorThrown);
                                                        $('#lblexit').removeClass('MenuGray');
                                                        $('#imgexit').attr('src','images/icn-exit.png');
                                                        $('#exitlink').attr('href', 'home/home.html');
                   }
                   });
                
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
                                                                    window.plugins.DataBaseHelper.insert("update ardetail set issync=1 where routekey='"+ardetaildata[i].routekey+"' and visitkey='"+ardetaildata[i].visitkey+"' and transactionkey='"+ardetaildata[i].transactionkey+"'",function(result)
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
                                           ["update posequipmentchangedetail set issync=1 where routekey='"+posequipmentchangedetaildata[i].routekey+"' and visitkey='"+posequipmentchangedetaildata[i].visitkey+"' and itemcode='"+posequipmentchangedetaildata[i].itemcode+"'"]);
            }
            else if(platform=='Android')
            {
                                                                    window.plugins.DataBaseHelper.insert("update posequipmentchangedetail set issync=1 where routekey='"+posequipmentchangedetaildata[i].routekey+"' and visitkey='"+posequipmentchangedetaildata[i].visitkey+"' and itemcode='"+posequipmentchangedetaildata[i].itemcode+"'",function(result)
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