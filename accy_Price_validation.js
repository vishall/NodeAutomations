/* This Script will valoidate the Device PayG and Pay Monthly Prices */
/* Please fill the below information before runing the script */

var prodCatURL = 'D:/Kanban/Projects_Gali/prodCat_Master_June/catalogueData',
    merchPricesSheetURL = 'D:/Kanban/Projects_Gali/NodeJS/PricesSheet/Accy_Merch_Price_sheet_11_06_2015.xlsx',
    payMSKUCellColumn = 'B',payMPriceCellColumn = 'D',
    payMTab_Min_Count = 3,payMTab_Max_Count = 228,
    outputExcelName = "Accys_PriceValidator_11_06_2015v5.xlsx";

/* Do not modify the below script if you are not sure about the changes*/


var fs = require('fs'), XLSX = require('xlsx'),excelbuilder = require('excel4node')
         recursive = require('recursive-readdir');
var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;
var priceList = [],cashPriceCollection = [], discrepenciesCollection = [],missedAccysCollection = [], comparedAccysCount =0;

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


function loadMerchPrices(){
    try{
        cashPriceCollection = [];
        var workbook = XLSX.readFile(merchPricesSheetURL);
        var sheet_name_list = workbook.SheetNames;
        console.log("Loading merchandising Pricing Sheet...");
        sheet_name_list.forEach(function(y) {

          if( y === "Hard Coded April"){
              var worksheet = workbook.Sheets[y];
              for (z in worksheet) {
                  var priceCell = payMPriceCellColumn+payMTab_Min_Count;
                  var skuCell = payMSKUCellColumn +payMTab_Min_Count;
                  
                  if(worksheet[skuCell]){
                      //if(z[0] === '!') continue;
                      var skuCell = payMSKUCellColumn+payMTab_Min_Count;
                      var costO2Cell = payMPriceCellColumn+payMTab_Min_Count;
                      var priceDeatils = {
                         "price": worksheet[priceCell].v,
                         "sku": worksheet[skuCell].v
                      }
                      cashPriceCollection.push(priceDeatils);
                      payMTab_Min_Count++; 
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
        var prodCatDeviceURL = prodCatURL+"/accessories/";
        recursive(prodCatDeviceURL, function (err, files) { console.log(err); console.log(files);
            if(!err && files.length){
                    var jsonFileCount = 0;
                    priceList = [];
                    var index = 0;
                    console.log("Loading JSON files.....");
                    var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; })
                    jsonFiles.forEach(function(file) { 
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
                            pushPricesToCollection(json);
                            index++;
                      }else{
                            var json = JSON.parse(newContent);
                            pushPricesToCollection(json);
                            index++;   
                     }
                     if(jsonFiles.length === index)  {
                         compareMerchPriceVsProdCatPrices();
                     }
                    });
            }else{
                    console.log("Oops.......");
                    console.log("Error in the ProdCat URL");
                    console.log(prodCatDeviceURL);
            }
        });
    }
    catch(e){
        console.log("Oops.......");
        console.log("Something is wrong with ProdCat URL");
        console.log(e);
    }
}

function pushPricesToCollection(deviceJSON){
    try{
        var cashPrice = "NA";
        if(deviceJSON["price"] != null) cashPrice = deviceJSON["price"];

         var obj = {
           "sku": deviceJSON["sku"]["code"],
           "model": deviceJSON["model"],
           "stockInfo":deviceJSON["stock"],
           "status":deviceJSON["lifecycle"]["status"],
           "consumerNew" : deviceJSON["channelPermissions"]["ConsumerNew"],
           "consumerUpgrade" : deviceJSON["channelPermissions"]["ConsumerUpgrade"],
           "voiceNew" : deviceJSON["channelPermissions"]["VoiceNew"],
           "voiceUpgrade" : deviceJSON["channelPermissions"]["VoiceUpgrade"],
           "cashPrice": cashPrice
        };
        priceList.push(obj); 
    }
    catch(e){
        console.log("Oops.......");
        console.log("Something is wrong with pushPricesToCollection method");
        console.log(e);
    }
}

function compareMerchPriceVsProdCatPrices(){
    try{
        console.log("Comapring Merchandising Pricing Sheet Prices with ProdCat Prices........");
        //var cashPriceCollection,priceList
        for(var accysCount =0; accysCount<priceList.length;accysCount++){
            for(var merchAccysCount =0;merchAccysCount<cashPriceCollection.length;merchAccysCount++){  
                if(priceList[accysCount]["sku"].toUpperCase() == cashPriceCollection[merchAccysCount]["sku"].toUpperCase()){ 
                    comparedAccysCount++;
                    if(priceList[accysCount]["cashPrice"] != cashPriceCollection[merchAccysCount]["price"]){ 
                      var disObj ={
                          "sku" : priceList[accysCount]["sku"],
                          "merchPrice" : cashPriceCollection[merchAccysCount]["price"],
                          "ProdCatPrice" : priceList[accysCount]["cashPrice"],
                          "stock": priceList[accysCount]["stockInfo"],
                          "lifeCycle": priceList[accysCount]["status"],
                          "voiceNew": priceList[accysCount]["voiceNew"],
                          "voiceUpgrade": priceList[accysCount]["voiceUpgrade"],
                          "consumerNew": priceList[accysCount]["consumerNew"],
                          "consumerUpgrade": priceList[accysCount]["consumerUpgrade"]  
                      };
                      
                      discrepenciesCollection.push(disObj);  
                    }
                    break;
                }
                else if(merchAccysCount == (cashPriceCollection.length-1)){
                     console.log("Unable find the entry for SKU::"+priceList[accysCount]["sku"]+" in Merch Accy Price sheet");
                     missedAccysCollection.push({"sku":priceList[accysCount]["sku"],
                                                  "name":priceList[accysCount]["model"],
                                                  "lifecycle" : priceList[accysCount]["status"],
                                                  "stock" : priceList[accysCount]["stockInfo"],
                                                  "voiceNew": priceList[accysCount]["voiceNew"],
                                                  "voiceUpgrade": priceList[accysCount]["voiceUpgrade"],
                                                  "consumerNew": priceList[accysCount]["consumerNew"],
                                                  "consumerUpgrade": priceList[accysCount]["consumerUpgrade"]  
                                                });
                    comparedAccysCount++;
                }
            }
        }
        console.log("Compared Accys length is "+comparedAccysCount);
        console.log("Total Accys in ProdCat is "+priceList.length);
        generateExcelFile(discrepenciesCollection);
        generateExcelFileMissed(missedAccysCollection);
    }
    catch(e){
        console.log("Oops.......");
        console.log("Something is wrong with compareMerchPriceVsProdCatPrices method");
        console.log(e);
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
        ws.Cell(1,2).String('ProdCat Price');
        ws.Cell(1,3).String('Merch Price');
        ws.Cell(1,4).String('Stock Info');
        ws.Cell(1,5).String('Status');
        ws.Cell(1,6).String('Consumer New');
        ws.Cell(1,7).String('Consumer Upgrade');
        ws.Cell(1,8).String('Voice New');
        ws.Cell(1,9).String('Voice Upgrade');
        for(var skuCountLength = 0;skuCountLength < collection.length;skuCountLength++){
            var row = skuCountLength + 2;
            ws.Cell(row,1).String(collection[skuCountLength]["sku"].toString());
            ws.Cell(row,2).String(collection[skuCountLength]["ProdCatPrice"] != undefined ? collection[skuCountLength]["ProdCatPrice"].toString() : "NA");
            ws.Cell(row,3).String(collection[skuCountLength]["merchPrice"].toString());
            ws.Cell(row,4).String(collection[skuCountLength]["stock"].toString());
            ws.Cell(row,5).String(collection[skuCountLength]["lifeCycle"].toString());  
            ws.Cell(row,6).String(collection[skuCountLength]["consumerNew"].toString()); 
            ws.Cell(row,7).String(collection[skuCountLength]["consumerUpgrade"].toString()); 
            ws.Cell(row,8).String(collection[skuCountLength]["voiceNew"].toString()); 
            ws.Cell(row,9).String(collection[skuCountLength]["voiceUpgrade"].toString()); 
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
        console.log(e);
    }    
}

function generateExcelFileMissed(collection){
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
        ws.Cell(1,2).String('Name');
        ws.Cell(1,3).String('LifeCycle');
        ws.Cell(1,4).String('Stock');
        ws.Cell(1,5).String('Voice New');
        ws.Cell(1,6).String('Voice Upgrade');
        ws.Cell(1,7).String('Consumer New');
        ws.Cell(1,8).String('Consumer Upgrade');
            
        for(var skuCountLength = 0;skuCountLength < collection.length;skuCountLength++){
            var row = skuCountLength + 2;
            ws.Cell(row,1).String(collection[skuCountLength]["sku"].toString());
            ws.Cell(row,2).String(collection[skuCountLength]["name"] != undefined ? collection[skuCountLength]["name"].toString() : "NA");
            ws.Cell(row,3).String(collection[skuCountLength]["lifecycle"]!= undefined ? collection[skuCountLength]["lifecycle"].toString() : "NA");
            ws.Cell(row,4).String(collection[skuCountLength]["stock"]!= undefined ? collection[skuCountLength]["stock"].toString() : "NA");
            ws.Cell(row,5).String(collection[skuCountLength]["voiceNew"]!= undefined ? collection[skuCountLength]["voiceNew"].toString() : "NA");
            ws.Cell(row,6).String(collection[skuCountLength]["voiceUpgrade"]!= undefined ? collection[skuCountLength]["voiceUpgrade"].toString() : "NA");
            ws.Cell(row,7).String(collection[skuCountLength]["consumerNew"]!= undefined ? collection[skuCountLength]["consumerNew"].toString() : "NA");
            ws.Cell(row,8).String(collection[skuCountLength]["consumerUpgrade"]!= undefined ? collection[skuCountLength]["consumerUpgrade"].toString() : "NA");
        }
        ws.Row(1).Height(30);
        ws.Column(1).Width(10);
        ws.Column(2).Width(20);
        ws.Column(6).Width(30);
        wb.write("PricesSheet/missedAccysv4.xlsx",function(err){ 
         console.log("Generated missedAccys sheet PricesSheet folder");
        });
    }
    catch(e){
        console.log("Oops.......");
        console.log("Something is wrong while generating Excel Sheet");
        console.log(e);
    }
}


// Main Function for the Application
(function(){
    console.log("Application has started");
    loadMerchPrices();
    loadProdCatFiles();
    //console.log(tariffCollectionTRS);
})();

