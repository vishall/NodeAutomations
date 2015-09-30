/* This Script will valoidate the Device PayG and Pay Monthly Prices */
/* Please fill the below information before runing the script */

var prodCatURL = 'D:/Kanban/Projects_Gali/ProdCat/productCatalogueData_Master/catalogueData',
    merchPricesSheetURL = 'D:/Kanban/Projects_Gali/NodeAuto/NodeAutomations/ExcelOutput/prodCatPrice_Report_v2.xlsx',
    payMSKUCellColumn = 'A',payMPriceCellColumn = 'C',payGSKUCellColumn = 'A', payGPriceCellColumn = 'C',
    payMTab_Min_Count = 2,payMTab_Max_Count = 466,payGTab_Min_Count= 2,payGTab_Max_Count = 745,
    outputExcelName = "PriceValidator_11_09_2015v1.xlsx";

/* Do not modify the below script if you are not sure about the changes*/


var fs = require('fs'), XLSX = require('xlsx'),excelbuilder = require('excel4node')
         recursive = require('recursive-readdir');
var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;
var priceList = [],cashPriceCollection = [], paygPriceCollection = [];
var descrepenciesCollection = [];

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


function loadMerchPrices(){
    try{
        cashPriceCollection = [], paygPriceCollection = [];
        var workbook = XLSX.readFile(merchPricesSheetURL);
        var sheet_name_list = workbook.SheetNames;
        console.log("Loading merchandising Pricing Sheet...");
        sheet_name_list.forEach(function(y) {

          if( y === "PayM"){
              var worksheet = workbook.Sheets[y];
              for (z in worksheet) {
                  if(payMTab_Min_Count <= payMTab_Max_Count){
                      if(z[0] === '!') continue;
                      var skuCell = payMSKUCellColumn+payMTab_Min_Count;
                      var costO2Cell = payMPriceCellColumn+payMTab_Min_Count;
                      var priceDeatils = {
                         "sku": worksheet[skuCell].v,
                         "costO2": worksheet[costO2Cell].v
                      }
                      cashPriceCollection.push(priceDeatils);
                      payMTab_Min_Count++; 
                }
              }
          }

         if( y === "PayG"){
          var worksheet = workbook.Sheets[y];
          for (z in worksheet) {
              if(payGTab_Min_Count <= payGTab_Max_Count){
                  if(z[0] === '!') continue;
                  var skuCell = payGSKUCellColumn+payGTab_Min_Count;
                  var paygPrice = payGPriceCellColumn+payGTab_Min_Count;
                  var priceDeatils = {
                     "sku": worksheet[skuCell].v,
                     "payg": worksheet[paygPrice].v
                  }
                  paygPriceCollection.push(priceDeatils);
                  payGTab_Min_Count++; 
             }
          }
         }
       });
  }
  catch(e){
        console.log("Oops.......");
        console.log("Something is wrong with Merch Price sheet");
        console.log(e);
  }
}

function loadProdCatFiles(){   
    try{
        var prodCatDeviceURL = prodCatURL+"/device/";
        recursive(prodCatDeviceURL, function (err, files) {
            if(!err && files.length){
                    var jsonFileCount = 0;
                    priceList = [];
                    var index = 0;
                    console.log("Loading JSON files.....");
                    var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; })
                    jsonFiles.forEach(function(file) {
                        //console.log(file);
                        var content =  require(file);
                        var newContent = content;
                        var newSearch = newContent.match(pathRegExp);
                        var newPathsContainer = [];
                        if(newSearch != null){
                            var uniqueArray = newSearch.filter(function(elem, pos) {
                                return newSearch.indexOf(elem) == pos;
                            }); 
                            for(var jCount =0;jCount<uniqueArray.length;jCount++){
                               var newPathValue = '"'+uniqueArray[jCount]+'"';  
                               var regExpCheck = new RegExp(escapeRegExp(uniqueArray[jCount]),"g");
                               newPathsContainer.push(uniqueArray[jCount]);
                               newContent = newContent.replace(regExpCheck,newPathValue);
                               var doubleQuoteRegEx = new RegExp(escapeRegExp('""$'),"g");
                            }
                            var json = JSON.parse(newContent);
                            verifyPrices(json);
                            pushPricesToCollection(json);
                            index++;
                      }else{
                            var json = JSON.parse(newContent);
                            verifyPrices(json);
                            pushPricesToCollection(json);
                            index++;   
                     }
                     if(jsonFiles.length === index)  compareMerchPriceVsProdCatPrices();
                    });
            }else{
                    console.log("Oops.......");
                    console.log("Error in the ProdCat URL")   
            }
        });
    }
    catch(e){
        console.log("Oops.......");
        console.log("Something is wrong with ProdCat URL");
    }
}

function pushPricesToCollection(deviceJSON){
    try{
        var cashPrice = "NA",costToO2 = "NA", replacementCost = "NA", rRP = "NA";
        if(deviceJSON["cashPrice"] != null) cashPrice = deviceJSON["cashPrice"];
        if(deviceJSON["costToO2"] != null) costToO2 = deviceJSON["costToO2"];
        if(deviceJSON["replacementCost"] != null) replacementCost = deviceJSON["replacementCost"];
        if(deviceJSON["rrp"] != null) rRP = deviceJSON["rrp"];

         var obj = {
           "sku": deviceJSON["sku"]["code"],
           "replacementCost": replacementCost,
           "costToO2": costToO2,
           "rrp": rRP,
           "stockInfo":deviceJSON["stockInfo"]["stock"],
           "status":deviceJSON["lifecycle"]["status"],
           "cashPrice": cashPrice
        };
        priceList.push(obj); 
    }
    catch(e){
        console.log("Oops.......");
        console.log("Something is wrong with pushPricesToCollection method");
    }
}

var planIDPathCon = [
    { "id":"5eeb5c60-5e25-11e2-bcfd-0800200c9a66", "path":"/plan/mbb_plans/hotspot_prepay_A.json" },
    { "id":"c2625000-5e25-11e2-bcfd-0800200c9a66", "path":"/plan/mbb_plans/hotspot_prepay_C.json" },
    { "id":"9999-63137aad-153e-4a97-b3f1-50e099af5dd6", "path":"/plan/mbb_plans/mbb_prepay_3g_0gb_copy.json" },
    { "id":"567aecac-bcb5-4db9-a341-03babdb9e237", "path":"/plan/mbb_plans/mbb_postpay_B.json" },
    { "id":"0020-987db484-df0a-4d90-8d2e-13b454e0eef3", "path":"/plan/mbb_plans/mbb_prepay_A_copy.json" },
    { "id":"0010-1e1fcfe0-4b7e-11e2-bcfd-0800200c9a66", "path":"/plan/mbb_plans/mbb_prepay_C_copy.json" },
    { "id": '17869c0c-9d47-4421-b9e1-c982c2e74f21',"path":"/plan/mbb_plans/mbb_prepay_4g_3gb.json" },
    { "id":"0030-1b836ed5-e0f2-4187-a26b-54841565bac3", "path":"/plan/mbb_plans/tablet_prepay_0gb.json" },
    { "id":'93b06b59-397d-41d7-828e-c5f700fc9d9b',"path":"/plan/q414/24m_mbb_paym/set_1/3gb-24m-cca-25gbp.json" },
    { "id":"2e1fd383-126c-493f-be8e-1954482e4e21", "path":"/plan/q414/24m_mbb_paym/set_1/5gb-24m-cca-30gbp.json" },
    { "id":"97039794-57d2-4b31-a28a-8b0d4c35a146", "path":"/plan/q414/24m_mbb_paym/set_1/8gb-24m-cca-35gbp.json" },
    { "id":"b848be17-01c5-440a-b5a8-d562a30c0de0", "path":"/plan/q414/24m_mbb_paym/set_3/3gb-24m-cca-35gbp.json" },
    { "id":"b291781e-5f00-49b8-bd02-5c41aa683810", "path":"/plan/q414/24m_mbb_paym/set_3/5gb-24m-cca-40gbp.json" },
    { "id":"c48a5742-3ef4-410e-bc9b-21ef0d26bfd2", "path":"/plan/q414/24m_mbb_paym/set_3/8gb-24m-cca-45gbp.json" },
    { "id":"206e379a-420d-440e-93e3-433412ea1d1f", "path":"/plan/q414/24m_mbb_paym/set_2/3gb-24m-cca-30gbp.json" },
    { "id":"04c6d8ce-636e-41eb-b64f-7cb268f79378", "path":"/plan/q414/24m_mbb_paym/set_2/5gb-24m-cca-35gbp.json" },
    { "id":"d961d603-2119-4e61-919e-50b7c7a982b4", "path":"/plan/q414/24m_mbb_paym/set_2/8gb-24m-cca-40gbp.json" },
    { "id":"0010-1535acfe-16c1-4260-b2ab-8ab4030d0083", "path":"/plan/mbb_plans/tablet_prepay_3gb_4g_data.json" },
    { "id":"0020-7612b150-e014-482d-a754-762ee6a355d4", "path":"/plan/mbb_plans/tablet_prepay_1gb_3g_data.json" }
];

function getPlanRelativePath(planURLObj){
    var planURL = null;
    if(planURLObj.search("/")  != -1){
        planURL = planURLObj.split("'")[1]; 
        //planURL = "/"+planURL;
    }
    else{
       for(var planIDCount =0; planIDCount<planIDPathCon.length ;planIDCount++){
         if(planURLObj == planIDPathCon[planIDCount]["id"]){
             planURL =   planIDPathCon[planIDCount]["path"];
             break;
         }
         /*else if(planIDCount == (planIDPathCon.length -1)){
             console.log("No Match for "+planURLObj);  
             console.log("..................................................");   
         }*/
       }
    } 
                 
    return planURL;
}

function checkPlanCategory(planAblPath){
    try{
        
        
        var content =  require(planAblPath);
        var newContent = content;
        var newSearch = newContent.match(pathRegExp);
        var planJSONData = null;
        if(newSearch != null){
            var uniqueArray = newSearch.filter(function(elem, pos) {
                return newSearch.indexOf(elem) == pos;
            }); 
            for(var jCount =0;jCount<uniqueArray.length;jCount++){
               var newPathValue = '"'+uniqueArray[jCount]+'"';  
               var regExpCheck = new RegExp(escapeRegExp(uniqueArray[jCount]),"g");
               newContent = newContent.replace(regExpCheck,newPathValue);
               var doubleQuoteRegEx = new RegExp(escapeRegExp('""$'),"g");
            }
            planJSONData = JSON.parse(newContent);
       }else{
            planJSONData = JSON.parse(newContent);  
       }
       var prepayFlag =  false;
       if(!planJSONData["price"]){
           prepayFlag = true;
       }
    }
    catch(e){
        console.log(e);
       //console.log(planAblPath);
        //console.log(e);
    }
    finally{
      return  prepayFlag;
    }
}


function verifyPrices(deviceJSON){
    try{
         var cashPrice = null,costToO2 = null, replacementCost = null, rRP = null;
         if(deviceJSON["cashPrice"] != null) cashPrice = deviceJSON["cashPrice"];
         if(deviceJSON["costToO2"] != null) costToO2 = deviceJSON["costToO2"];
         if(deviceJSON["replacementCost"] != null) replacementCost = deviceJSON["replacementCost"];
         if(deviceJSON["rrp"] != null) rRP = deviceJSON["rrp"];

         var plansAssociated = deviceJSON["relationships"];
         //Checking Cash Price Vs CostO2
         if(cashPrice && costToO2){
            if(cashPrice != costToO2) {  
               var descObj = {
                   "sku": deviceJSON["sku"]["code"],
                   "cashPrice":deviceJSON["cashPrice"],
                   "rrpPrice":deviceJSON["rrp"],
                   "stockInfo":deviceJSON["stockInfo"]["stock"],
                   "status":deviceJSON["lifecycle"]["status"],
                   "Remarks": "Cash Price and Costo2 Prices are not equal",
                   "tariffOneOffPrice": "NA"

               };
               descrepenciesCollection.push(descObj);
              }
         }

         //Checking RRP Price Vs ReplacementCost
         if(replacementCost && rRP){
            if(replacementCost != rRP) { 
               var descObj = {
                   "sku": deviceJSON["sku"]["code"],
                   "cashPrice":deviceJSON["cashPrice"],
                   "rrpPrice":deviceJSON["rrp"],
                   "stockInfo":deviceJSON["stockInfo"]["stock"],
                   "status":deviceJSON["lifecycle"]["status"],
                   "Remarks": "Replacement Price and RRP Prices are not equal",
                   "tariffOneOffPrice": "NA"

               };
               descrepenciesCollection.push(descObj);
               }
         }

         for(var planCount=0;planCount<plansAssociated.length;planCount++){ 
             if(plansAssociated[planCount]["prices"] != null) { 
             // Checking Pay As you Go OneOff Prices with Cash price
             if(plansAssociated[planCount]["prices"].length >1){
                 var plansPrices =  plansAssociated[planCount]["prices"];
                  for(var planPricesCount = 0;planPricesCount<plansPrices.length;planPricesCount++){
                    if(plansPrices[planPricesCount]["monthly"] == "0.00"){
                          var oneOffPrice = plansPrices[planPricesCount]["oneOff"];
                          if(cashPrice != null){
                             if(oneOffPrice != cashPrice) {
                                 var descObj = {
                                           "sku": deviceJSON["sku"]["code"],
                                           "cashPrice":deviceJSON["cashPrice"],
                                           "rrpPrice":deviceJSON["rrp"],
                                           "stockInfo":deviceJSON["stockInfo"]["stock"],
                                           "status":deviceJSON["lifecycle"]["status"],
                                           "Remarks": "Cash Price is not equal to Oneoff Price1",
                                           "tariffOneOffPrice": oneOffPrice   
                                };
                                descrepenciesCollection.push(descObj);
                             }
                          }

                    }
                  }
              }
             else{ 
                   // Checking Pay n  Go OneOff Prices with ReplacementCost
                   var plansPrices =  plansAssociated[planCount]["prices"];
                   var planPathID = plansAssociated[planCount]["id"];
                   var planPathVal =  getPlanRelativePath(planPathID);
                   var planCompletePath = prodCatURL+planPathVal;
                   var prepayPlanFlag = checkPlanCategory(planCompletePath);
                   if(prepayPlanFlag){
                       if(plansPrices[0]["oneOff"] != null){
                          var oneOffPrice = plansPrices[0]["oneOff"];
                          if(replacementCost != null){
                             if(oneOffPrice != replacementCost) {
                                 var descObj = {
                                           "sku": deviceJSON["sku"]["code"],
                                           "cashPrice":deviceJSON["cashPrice"],
                                           "rrpPrice":deviceJSON["rrp"],
                                           "stockInfo":deviceJSON["stockInfo"]["stock"],
                                           "status":deviceJSON["lifecycle"]["status"],
                                           "Remarks": "Replacement Price is not equal to Oneoff Price",
                                           "tariffOneOffPrice": oneOffPrice
                                 };
                                 descrepenciesCollection.push(descObj);
                           }
                         }
                       }
                     }
                    /*else if(planPathID.search("mbb_refresh")){
                        if(plansPrices[0]["oneOff"] != null){
                          var oneOffPrice = plansPrices[0]["oneOff"];
                          if(replacementCost != null){
                             if(oneOffPrice != replacementCost) {
                                 var descObj = {
                                           "sku": deviceJSON["sku"]["code"],
                                           "cashPrice":deviceJSON["cashPrice"],
                                           "rrpPrice":deviceJSON["rrp"],
                                           "stockInfo":deviceJSON["stockInfo"]["stock"],
                                           "status":deviceJSON["lifecycle"]["status"],
                                           "Remarks": "Cash Price is not equal to Oneoff Price2",
                                           "tariffOneOffPrice": oneOffPrice
                                 };
                                 descrepenciesCollection.push(descObj);
                           }
                         }
                       }
                     }*/
                     else {
                        //console.log(planPathID);
                       // console.log(deviceJSON["sku"]["code"])
                     }
                  }
               }
           }
    }
    catch(e){
        console.log("Oops.......");
        console.log("Something is wrong with verifyPrices method");
        console.log(e);
    }    
}

function compareMerchPriceVsProdCatPrices(){
    try{
        console.log("Comapring Merchandising Pricing Sheet Prices with ProdCat Prices........");
        var priceListLength = priceList.length, cashPriceCollectionLength = cashPriceCollection.length,paygPriceCollectionLength = paygPriceCollection.length,
            cashPriceMatchCount = 0, paygPriceMatchCount = 0;
        for(var cashPriceLoopCount =0;cashPriceLoopCount<cashPriceCollectionLength;cashPriceLoopCount++){
            var currentObj =   cashPriceCollection[cashPriceLoopCount];
             for(var priceListLoopCount=0;priceListLoopCount<priceListLength;priceListLoopCount++)
             {
                if(currentObj["sku"] == priceList[priceListLoopCount]["sku"])  {
                    cashPriceMatchCount++;
                    if(currentObj["costO2"] != priceList[priceListLoopCount]["cashPrice"])  {
                       var descObj = {
                           "sku": priceList[priceListLoopCount]["sku"],
                           "cashPrice":priceList[priceListLoopCount]["cashPrice"],
                           "rrpPrice":priceList[priceListLoopCount]["rrp"],
                           "stockInfo": priceList[priceListLoopCount]["stockInfo"],
                           "status":priceList[priceListLoopCount]["status"],
                           "Remarks": "Cash Price is not matching with Merch Cash Price",
                           "tariffOneOffPrice": "NA"

                       };
                       descrepenciesCollection.push(descObj);  
                    }
                    break;
                }
             }

        }

        for(var paygPriceLoopCount =0;paygPriceLoopCount<paygPriceCollectionLength;paygPriceLoopCount++){
            var currentObj =   paygPriceCollection[paygPriceLoopCount];
             for(var priceListLoopCount=0;priceListLoopCount<priceListLength;priceListLoopCount++)
             {
                if(currentObj["sku"] == priceList[priceListLoopCount]["sku"])  {
                    paygPriceMatchCount++;
                    if(currentObj["payg"] != priceList[priceListLoopCount]["replacementCost"] || currentObj["payg"] != priceList[priceListLoopCount]["rrp"] )  {
                        var descObj = {
                           "sku": priceList[priceListLoopCount]["sku"],
                           "cashPrice":priceList[priceListLoopCount]["cashPrice"],
                           "rrpPrice":priceList[priceListLoopCount]["rrp"],
                           "stockInfo": priceList[priceListLoopCount]["stockInfo"],
                           "status":priceList[priceListLoopCount]["status"],
                           "Remarks": "Replacement Price is not matching with Merch Cash Price",
                           "tariffOneOffPrice": "NA"

                       };
                       descrepenciesCollection.push(descObj)
                    }
                    break;
                }
             }                
        }
        console.log("Total Devices verified for Paym is "+cashPriceMatchCount+" and PAYG Price is "+paygPriceMatchCount);
        generateExcelFile(descrepenciesCollection);
    }
    catch(e){
        console.log("Oops.......");
        console.log("Something is wrong with compareMerchPriceVsProdCatPrices method");
    }
}

function generateExcelFile(collection){
    try{ 
        var wb = new excelbuilder.WorkBook();
        var wbOpts = {
            jszip:{
                compression:'DEFLATE'
            }
        }
        var wb2 = new excelbuilder.WorkBook(wbOpts);
        var ws = wb.WorkSheet('New Worksheet');
        var wsOpts = {
            margins:{
                left : .75,
                right : .75,
                top : 1.0,
                bottom : 1.0,
                footer : .5,
                header : .5
            },
            printOptions:{
                centerHorizontal : true,
                centerVertical : false
            },
            view:{
                zoom : 100
            },
            outline:{
                summaryBelow : true
            }
        }
        var ws2 = wb.WorkSheet('New Worksheet', wsOpts);
        ws.Cell(1,1).String('SKU');
        ws.Cell(1,2).String('cash Price');
        ws.Cell(1,3).String('RRP Price');
        ws.Cell(1,4).String('Tariff OneOff Price');
        ws.Cell(1,5).String('Status');
        ws.Cell(1,6).String('Stock Info');
        ws.Cell(1,7).String('Remarks');
        for(var skuCountLength = 0;skuCountLength < collection.length;skuCountLength++){
            var row = skuCountLength + 2;
            ws.Cell(row,1).String(collection[skuCountLength]["sku"].toString());
            ws.Cell(row,2).String(collection[skuCountLength]["cashPrice"] != undefined?collection[skuCountLength]["cashPrice"].toString():"NA");
            ws.Cell(row,3).String(collection[skuCountLength]["rrpPrice"].toString());
            ws.Cell(row,4).String(collection[skuCountLength]["tariffOneOffPrice"].toString());
            ws.Cell(row,5).String(collection[skuCountLength]["status"].toString());  
            ws.Cell(row,6).String(collection[skuCountLength]["stockInfo"].toString()); 
            ws.Cell(row,7).String(collection[skuCountLength]["Remarks"].toString()); 
        }
        ws.Row(1).Height(30);
        ws.Column(1).Width(10);
        ws.Column(2).Width(20);
        ws.Column(6).Width(30);
        wb.write("PricesSheet/"+outputExcelName,function(err){ 
         console.log("Generated "+outputExcelName+" sheet PricesSheet folder");
        });
    }
    catch(e){
        console.log("Oops.......");
        console.log("Something is wrong while generating Excel Sheet");
    }    
}


// Main Function for the Application
(function(){
    console.log("Application has started");
    loadMerchPrices();
    loadProdCatFiles();
    //console.log(tariffCollectionTRS);
})();

