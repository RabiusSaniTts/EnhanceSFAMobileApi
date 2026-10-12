platform= sessionStorage.getItem("platform");
function selectbatchdata()
{
    if(transactiontypecode > 14)
    {
        var selectqry = "select CASE WHEN count(batchdetailkey)>0 THEN batchdetailkey ELSE (select max(batchdetailkey)+1 from batchexpirydetail) END as batchdetailkey from batchexpirydetail where visitkey="+sessionStorage.getItem('VisitKey')+"";
    }
    else if(transactiontypecode == 2 || transactiontypecode==3 || transactiontypecode==4)
    {
    var selectqry = "select CASE WHEN count(batchdetailkey)>0 THEN batchdetailkey ELSE (select max(batchdetailkey)+1 from batchexpirydetail) END as batchdetailkey from batchexpirydetail where (transactiontypecode=2 or transactiontypecode=3 or transactiontypecode=4) and istemp='true'";
    }
    else if(transactiontypecode >4 && transactiontypecode <15)
    {
    var selectqry = "select CASE WHEN count(batchdetailkey)>0 THEN batchdetailkey ELSE (select max(batchdetailkey)+1 from batchexpirydetail) END as batchdetailkey from batchexpirydetail where (transactiontypecode > 4 and  transactiontypecode<15) and istemp='true'";
    }
    else if(transactiontypecode==1)
    {
        var selectqry = "select CASE WHEN count(batchdetailkey)>0 THEN batchdetailkey ELSE (select max(batchdetailkey)+1 from batchexpirydetail) END as batchdetailkey from batchexpirydetail where transactiontypecode=1 and istemp='true'";
    }
   else if(transactiontypecode==23)
    {
        var selectqry = "select CASE WHEN count(batchdetailkey)>0 THEN batchdetailkey ELSE (select max(batchdetailkey)+1 from batchexpirydetail) END as batchdetailkey from batchexpirydetail where transactiontypecode=23 and istemp='true'";
    }
     else if(transactiontypecode==25)
    {
        var selectqry = "select CASE WHEN count(batchdetailkey)>0 THEN batchdetailkey ELSE (select max(batchdetailkey)+1 from batchexpirydetail) END as batchdetailkey from batchexpirydetail where transactiontypecode=25 and istemp='true'";
    }
    console.log(selectqry);
    if(platform=='iPad')
    {
         Cordova.exec(function(result) {
            if(result=='' || result[0][0]==0)
            key=1;
            else
            key = result[0][0];
            
            
        },
        function(error) {
            alert(error);},
        "PluginClass", 
        "GetdataMethod", 
        [selectqry]);
    }
    else if(platform=='Android')
    {
        window.plugins.DataBaseHelper.select(selectqry,function(result)
        {
            
            result = $.map(result.array, function (item, index) {
                
                return [[item.batchdetailkey]];
            });
            if(result=='' || result[0][0]==0)
            key=1;
            else
            key = result[0][0];
            
            
        },
        function()
        {
            console.warn("Error calling plugin");
        });
    } 
}
function deletebatchexpiry(ItemCode,RouteKey,VisitKey, CurrQty,transactiontypecode,batchqty)
{
   var selectqry = "select batchnumber from batchexpirydetail where routekey="+RouteKey+" and visitkey="+VisitKey+" and itemcode="+ItemCode+" and transactiontypecode="+transactiontypecode;
    var Qry = "delete from batchexpirydetail where routekey="+RouteKey+" and visitkey="+VisitKey+" and itemcode="+ItemCode+" and istemp='true' and transactiontypecode="+transactiontypecode;
    console.log(Qry);
    if(platform == "iPad")
    {
        Cordova.exec(function(result) {
                      
                      if(result.length > 0)
                      {
                      for(i=0;i<result.length;i++)
                      {
                      updatebatchmastertemp(ItemCode,RouteKey,VisitKey, CurrQty,transactiontypecode,batchqty,result[i][0]);
                      }
                      Cordova.exec(function(result) {
                                    
                                    insertbatchexpiry(ItemCode,RouteKey,VisitKey, CurrQty,transactiontypecode,batchqty);
                                    },
                                    function(error) {
                                    navigator.notification.alert(error);
                                    },
                                    "PluginClass",
                                    "InsertUpdateMethod",
                                    [Qry]);
                      }
                      else
                      {
                      checkbatchavailable(ItemCode,RouteKey,VisitKey, CurrQty,transactiontypecode,batchqty);
                      }
                      },
                      function(error) {
                      navigator.notification.alert("Error save promtion detail record");
                      },
                      "PluginClass",
                      "GetdataMethod",
                      [selectqry]);
    }
    else if(platform == "Android")
    {
        window.plugins.DataBaseHelper.select(selectqry, function(result) {
                                              
                                             if(!$.isEmptyObject(result))
                                             {
                                                result = $.map(result.array, function (item, index) {
                
                return [[item.batchnumber]];
            });
                                             for(i=0;i<result.length;i++)
                                             {
                                             updatebatchmastertemp(ItemCode,RouteKey,VisitKey, CurrQty,transactiontypecode,batchqty,result[i][0]);
                                             }
                                             window.plugins.DataBaseHelper.insert(Qry, function(result) {
                                                                                  insertbatchexpiry(ItemCode,RouteKey,VisitKey, CurrQty,transactiontypecode,batchqty);
                                                                                  
                                                                                  
                                                                                  },
                                                                                  function() {
                                                                                  console.warn("Error calling plugin");
                                                                                  });
                                             }
                                             else
                                             {
                                             checkbatchavailable(ItemCode,RouteKey,VisitKey, CurrQty,transactiontypecode,batchqty);
                                             }
                                             },
                                             function() {
                                             console.warn("Error calling plugin");
                                             });
    }
    
    
   
}
function updatebatchmastertemp(ItemCode,RouteKey,VisitKey, CurrQty,transactiontypecode,batchqty,batchnumber)
{
    var updateqry = "update batchmaster_temp set "+batchqty+"=0 where itemcode="+ItemCode+" and batchnumber='"+batchnumber+"'";
    console.log(updateqry);
    if(platform == "iPad"){
        Cordova.exec(function(result) {
                     
                      },
                      function(error) {
                      navigator.notification.alert(error);
                      },
                      "PluginClass",
                      "InsertUpdateMethod",
                      [updateqry]);
    }
    else if (platform == "Android") {
        window.plugins.DataBaseHelper.insert(updateqry, function(result) {
                                             
                                             },
                                             function() {
                                             console.warn("Error calling plugin");
                                             });
    }
}
function checkbatchavailable(ItemCode,RouteKey,VisitKey, CurrQty,transactiontypecode,batchqty)
{
    var Qry = "select count(*) as cnt from batchmaster_temp where itemcode="+ItemCode+" order by expirydate";
    console.log(Qry);
    if (platform == 'iPad') {
        Cordova.exec(function(result) {
                      if(result[0][0] > 0)
                      insertbatchexpiry(ItemCode,RouteKey,VisitKey, CurrQty,transactiontypecode,batchqty);
                      else
                      insertnonebatch(ItemCode,RouteKey,VisitKey, CurrQty,transactiontypecode,batchqty);
                      
                      },
                      function(error) {
                      navigator.notification.alert(error);
                      },
                      "PluginClass",
                      "GetdataMethod",
                      [Qry]);
    }
    else if (platform == 'Android') {
        window.plugins.DataBaseHelper.select(Qry, function(result) {
                                              result = $.map(result.array, function(item, index) {
                                                                return [[item.cnt]];
                                                                });
                                             
                                             if(result[0][0] > 0)
                                             insertbatchexpiry(ItemCode,RouteKey,VisitKey, CurrQty,transactiontypecode,batchqty);
                                             else
                                             insertnonebatch(ItemCode,RouteKey,VisitKey, CurrQty,transactiontypecode,batchqty);
                                             
                                             },
                                             function() {
                                             console.warn("Error calling plugin");
                                             });
    }
}
function insertnonebatch(ItemCode,RouteKey,VisitKey, CurrQty,transactiontypecode,batchqty)
{
    var insertqry = "INSERT INTO `batchexpirydetail` ('batchdetailkey','batchnumber','itemcode','expirydate','quantity','transactiontypecode','routekey','visitkey','issync','istemp') VALUES ("+key+",'NONE','"+ItemCode +"','2099-12-31','"+CurrQty +"',"+transactiontypecode+"," + RouteKey + "," + VisitKey + ",0,'true')";
    console.log(insertqry);
    var insertbatch="insert into batchmaster_temp('batchdetailkey','batchnumber','itemcode','quantity','expirydate','"+batchqty+"') values('"+key+"','NONE','"+ItemCode+"','0','2099-12-31','"+CurrQty+"')";
   if (platform == 'iPad') {
    Cordova.exec(function(result) {
                  Cordova.exec(function(result) {
                                
                                },
                                function(error) {
                                navigator.notification.alert(error);
                                },
                                "PluginClass",
                                "InsertUpdateMethod",
                                [insertbatch]);
                  },
                  function(error) {
                  navigator.notification.alert(error);
                  },
                  "PluginClass",
                  "InsertUpdateMethod",
                  [insertqry]);
   }
    else if (platform == 'Android') {
        window.plugins.DataBaseHelper.insert(insertqry, function(result) {
                                             window.plugins.DataBaseHelper.insert(insertbatch, function(result) {
                                                                                  
                                                                                  },
                                                                                  function() {
                                                                                  console.warn("Error calling plugin");
                                                                                  });
                                             },
                                             function() {
                                             console.warn("Error calling plugin");
                                             });
    }
}
function insertbatchexpiry(ItemCode,RouteKey,VisitKey, CurrQty,transactiontypecode,batchqty)
{
    if(transactiontypecode==5 || transactiontypecode==11 || transactiontypecode==14)
       {
       var batchqty2 = "ifnull(quantity,0)-ifnull(salesqty,0)-ifnull(freeqty,0)+ifnull(returnqty,0)+ifnull(buybackqty,0)-ifnull(rentalqty,0)-ifnull(promoqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)-ifnull(truckdamageunloadqty,0)-ifnull(freshunloadqty,0)-ifnull(endinvqty,0)";
       }
       else if(transactiontypecode==4)
       {
       var batchqty2 ="ifnull(badquantity,0)+ifnull(expiryqty,0)+ifnull(damageqty,0)-ifnull(damageoutqty,0)";
       }
       else if(transactiontypecode==7)
       {
       var batchqty2 ="ifnull(badquantity,0)-ifnull(damageoutqty,0)-ifnull(damageunloadqty,0)";
       }
       else
       {
    var batchqty2 = "ifnull(quantity,0)-ifnull(salesqty,0)-ifnull(freeqty,0)+ifnull(returnqty,0)+ifnull(buybackqty,0)-ifnull(rentalqty,0)-ifnull(promoqty,0)+ifnull(loadaddqty,0)-ifnull(loadcutqty,0)";
       }
    var Qry = "select batchnumber,"+batchqty2+" as qty,expirydate from batchmaster_temp where itemcode="+ItemCode+" and "+batchqty2+" > 0 order by expirydate";
    console.log(Qry);
    if (platform == 'iPad') {
        Cordova.exec(function(result) {
            if(result == '' || result[0][0]=='NONE')
            {
                var insertqry = "INSERT INTO `batchexpirydetail` ('batchdetailkey','batchnumber','itemcode','expirydate','quantity','transactiontypecode','routekey','visitkey','issync','istemp') VALUES ("+key+",'NONE','"+ItemCode +"','2099-12-31','"+CurrQty +"',"+transactiontypecode+"," + RouteKey + "," + VisitKey + ",0,'true')";
                console.log(insertqry);
                updatebatchmaster(ItemCode,'NONE',CurrQty,transactiontypecode,batchqty);
                Cordova.exec(function(result) {
                    
                },
                function(error) {
                    navigator.notification.alert(error);
                },
                "PluginClass",
                "InsertUpdateMethod",
                [insertqry]);
            }
            else
            {
            var i = 0;
                      
            var batchquantity = CurrQty;
                      console.log(batchquantity);
            if(transactiontypecode==18 || transactiontypecode==19 || transactiontypecode==20 || transactiontypecode==21)
            {
                var insertqry = "INSERT INTO `batchexpirydetail` ('batchdetailkey','batchnumber','itemcode','expirydate','quantity','transactiontypecode','routekey','visitkey','issync','istemp') VALUES ("+key+",'"+result[i][0] +"','"+ItemCode +"','"+result[i][2] +"','"+CurrQty +"',"+transactiontypecode+"," + RouteKey + "," + VisitKey + ",0,'true')";
                console.log(insertqry);
                updatebatchmaster(ItemCode,result[i][0],CurrQty,transactiontypecode,batchqty);
                Cordova.exec(function(result) {
                    
                },
                function(error) {
                    navigator.notification.alert(error);
                },
                "PluginClass",
                "InsertUpdateMethod",
                [insertqry]);
            }
            else
            {
            while(batchquantity > 0)
            {
                console.log(batchquantity);
                if(eval(result[i][1]) > batchquantity)
                {
                    var assignqty = eval(batchquantity);
                    batchquantity = 0;
                      var j=i;
                }
                else
                {
                    var assignqty = eval(result[i][1]);
                     
                    batchquantity= batchquantity - eval(assignqty);
                      var j=i;
                    i=i+1;
                }
                
                      console.log(batchquantity);
                console.log("key="+key);
                var insertqry = "INSERT INTO `batchexpirydetail` ('batchdetailkey','batchnumber','itemcode','expirydate','quantity','transactiontypecode','routekey','visitkey','issync','istemp') VALUES ("+key+",'"+result[j][0] +"','"+ItemCode +"','"+result[j][2] +"','"+assignqty +"',"+transactiontypecode+"," + RouteKey + "," + VisitKey + ",0,'true')";
                      console.log(insertqry);
                updatebatchmaster(ItemCode,result[j][0],assignqty,transactiontypecode,batchqty);
                Cordova.exec(function(result) {
                    
                },
                function(error) {
                    navigator.notification.alert(error);
                },
                "PluginClass",
                "InsertUpdateMethod",
                [insertqry]);
                
            }
            }
            }
        },
        function(error) {
            navigator.notification.alert(error);
        },
        "PluginClass",
        "GetdataMethod",
        [Qry]);
    }
    else if (platform == 'Android') {
        window.plugins.DataBaseHelper.select(Qry, function(result) {
             result = $.map(result.array, function(item, index) {
                return [[item.batchnumber,item.qty,item.expirydate]];
            });
            if(result == '')
            {
                var insertqry = "INSERT INTO `batchexpirydetail` ('batchdetailkey','batchnumber','itemcode','expirydate','quantity','transactiontypecode','routekey','visitkey','issync','istemp') VALUES ("+key+",'NONE','"+ItemCode +"','2099-12-31','"+CurrQty +"',"+transactiontypecode+"," + RouteKey + "," + VisitKey + ",0,'true')";
                console.log(insertqry);
                updatebatchmaster(ItemCode,'NONE',CurrQty,transactiontypecode,batchqty);
                window.plugins.DataBaseHelper.insert(insertqry, function(result) {
                    
                },
                function() {
                    console.warn("Error calling plugin");
                });
            }
            else
            {
            var i = 0;
                      
            var batchquantity = CurrQty;
                      console.log(batchquantity);
            if(transactiontypecode==18 || transactiontypecode==19 || transactiontypecode==20 || transactiontypecode==21)
            {
                var insertqry = "INSERT INTO `batchexpirydetail` ('batchdetailkey','batchnumber','itemcode','expirydate','quantity','transactiontypecode','routekey','visitkey','issync','istemp') VALUES ("+key+",'"+result[i][0] +"','"+ItemCode +"','"+result[i][2] +"','"+CurrQty +"',"+transactiontypecode+"," + RouteKey + "," + VisitKey + ",0,'true')";
                console.log(insertqry);
                updatebatchmaster(ItemCode,result[i][0],CurrQty,transactiontypecode,batchqty);
                window.plugins.DataBaseHelper.insert(insertqry, function(result) {
                    
                },
                function() {
                    console.warn("Error calling plugin");
                });
            }
            else
            {
            while(batchquantity > 0)
            {
                console.log(batchquantity);
                if(eval(result[i][1]) > batchquantity)
                {
                    var assignqty = eval(batchquantity);
                    batchquantity = 0;
                      var j=i;
                }
                else
                {
                    var assignqty = eval(result[i][1]);
                     
                    batchquantity= batchquantity - eval(assignqty);
                      var j=i;
                    i=i+1;
                }
                
                      console.log(batchquantity);
                console.log("key="+key);
                var insertqry = "INSERT INTO `batchexpirydetail` ('batchdetailkey','batchnumber','itemcode','expirydate','quantity','transactiontypecode','routekey','visitkey','issync','istemp') VALUES ("+key+",'"+result[j][0] +"','"+ItemCode +"','"+result[j][2] +"','"+assignqty +"',"+transactiontypecode+"," + RouteKey + "," + VisitKey + ",0,'true')";
                      console.log(insertqry);
                updatebatchmaster(ItemCode,result[j][0],assignqty,transactiontypecode,batchqty);
                window.plugins.DataBaseHelper.insert(insertqry, function(result) {
                    
                },
                function() {
                    console.warn("Error calling plugin");
                });
                
            }
            }
            }
            
        },
        function() {
            console.warn("Error calling plugin");
        });
    }
    
}
function updatebatchmaster(itemcode,batchnumber,quantity,transactiontypecode,batchqty)
{
    var updateqry = "update batchmaster_temp set "+batchqty+"="+quantity+" where itemcode="+itemcode+" and batchnumber='"+batchnumber+"'";
    console.log(updateqry);
    if (platform == 'iPad') {
        Cordova.exec(function(result) {
            
        },
        function(error) {
            navigator.notification.alert(error);
        },
        "PluginClass",
        "InsertUpdateMethod",
        [updateqry]);
    }
    else if (platform == 'Android') {
        window.plugins.DataBaseHelper.insert(updateqry, function(result) {
            
        },
        function() {
            console.warn("Error calling plugin");
        });
    }
    
}