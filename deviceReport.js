var fs = require('fs');

var excelbuilder = require('excel4node');

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var recursive = require('recursive-readdir');

var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;

var deviceDetailsCol = [];
    
recursive('D:/Kanban/Projects/14th_May_Branch/catalogueData/device/', function (err, files) {
    var jsonFileCount = 0, jsonFilesIndex = 0;
    var json;
    console.log("Reading JSON files.....");
    var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; });
    deviceDetailsCol =[];
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
            json = JSON.parse(newContent);
        }
        else{
            json = JSON.parse(newContent);
        }
        jsonFilesIndex++;
        readdeviceDetails(json);
        if(jsonFiles.length === jsonFilesIndex){
           generateExcelFile(deviceDetailsCol);
        }
    });
});

function readdeviceDetails(deviceJSON){
    
        var plansAssociated = deviceJSON["relationships"];
        var payMOnthlyFlag = "false",payGFlag = "false"; 
        for(var planCount=0;planCount<plansAssociated.length;planCount++){ 
        var planPathID = plansAssociated[planCount]["id"];
         if(plansAssociated[planCount]["prices"] != null) { 
             if(plansAssociated[planCount]["prices"].length >1){
                 payMOnthlyFlag = "true";
                 break;
              }
              else if((planPathID.search("prepaySims") == -1 ) && (planPathID.search("plan") != -1 )){
                 payMOnthlyFlag = "true";
                 break;  
              }
          }
        }
    
        for(var planCount=0;planCount<plansAssociated.length;planCount++){ 
             var plansPrices =  plansAssociated[planCount]["prices"];
             var planPathID = plansAssociated[planCount]["id"];
             if(plansAssociated[planCount]["prices"] != null) { 
                if(planPathID.search("prepaySims") != -1){
                   payGFlag = "true";
                   break;
                }
                else if(planPathID.search("plan") == -1){
                    if(plansAssociated[planCount]["prices"].length == 1){
                      payGFlag = "true";
                      break;
                    }
                }
             }
        }
   // var onStockPots = "yes";
    var deviceObj = {
                   "guid":deviceJSON["id"],
                   "sku": deviceJSON["sku"]["code"],
                   "model": deviceJSON["model"],
                   "status": deviceJSON["lifecycle"]["status"],
                   "ConsumerNew": deviceJSON["channelPermissions"]["ConsumerNew"],
                   "ConsumerUpgrade": deviceJSON["channelPermissions"]["ConsumerUpgrade"],
                   "VoiceNew": deviceJSON["channelPermissions"]["VoiceNew"],
                   "VoiceUpgrade": deviceJSON["channelPermissions"]["VoiceUpgrade"],
                   "payGo": payGFlag,
                   "PayMonthly": payMOnthlyFlag,
                   "StockInfo":deviceJSON["stockInfo"]["stock"],
                   "OnStockPots": ""+deviceJSON["stockLimited"]
    };
    deviceDetailsCol.push(deviceObj);
}

function generateExcelFile(collection){
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
    ws.Cell(1,1).String('GUID');
    ws.Cell(1,2).String('SKU');
    ws.Cell(1,3).String('Model');
    ws.Cell(1,4).String('Status');
    ws.Cell(1,5).String('ConsumerNew');
    ws.Cell(1,6).String('ConsumerUpgrade');
    ws.Cell(1,7).String('VoiceNew');
    ws.Cell(1,8).String('VoiceUpgrade');
    ws.Cell(1,9).String('Pay&Go');
    ws.Cell(1,10).String('PayMonthly');
    ws.Cell(1,11).String('StockInfo');
    ws.Cell(1,12).String('OnStockPots');
    for(var skuCountLength = 0;skuCountLength < collection.length;skuCountLength++){
        var row = skuCountLength + 2;
        ws.Cell(row,1).String(collection[skuCountLength]["guid"]);
        ws.Cell(row,2).String(collection[skuCountLength]["sku"]);
        ws.Cell(row,3).String(collection[skuCountLength]["model"]);
        ws.Cell(row,4).String(collection[skuCountLength]["status"]);
        ws.Cell(row,5).String(collection[skuCountLength]["ConsumerNew"]);
        ws.Cell(row,6).String(collection[skuCountLength]["ConsumerUpgrade"]);
        ws.Cell(row,7).String(collection[skuCountLength]["VoiceNew"]);
        ws.Cell(row,8).String(collection[skuCountLength]["VoiceUpgrade"]);
        ws.Cell(row,9).String(collection[skuCountLength]["payGo"]);
        ws.Cell(row,10).String(collection[skuCountLength]["PayMonthly"]);
        ws.Cell(row,11).String(collection[skuCountLength]["StockInfo"]);
        ws.Cell(row,12).String(collection[skuCountLength]["OnStockPots"]);
    }
    ws.Row(1).Height(30);
    ws.Column(1).Width(50);
    var myStyle = wb.Style();
    myStyle.Font.Bold();
    myStyle.Font.Italics();
    myStyle.Font.Family('Times New Roman');
    myStyle.Font.Color('FF0000');
    myStyle.Fill.Color('CCCCCC');
    ws.Cell(1,1).Style(myStyle);
    ws.Cell(1,2).Style(myStyle);
    ws.Cell(1,3).Style(myStyle);
    ws.Cell(1,4).Style(myStyle);
    ws.Cell(1,5).Style(myStyle);
    ws.Cell(1,6).Style(myStyle);
    ws.Cell(1,7).Style(myStyle);
    ws.Cell(1,8).Style(myStyle);
    ws.Cell(1,9).Style(myStyle);
    ws.Cell(1,10).Style(myStyle);
    ws.Cell(1,11).Style(myStyle);
    ws.Cell(1,12).Style(myStyle);
    wb.write("ExcelOutput/deviceDetails_Report_v1.xlsx",function(err){ 
        console.log("done");
    });
        
}

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function writeToFile(file,content){
  fs.writeFile(file, content, function(err) {
    if(err) {
        console.log(err);
    } else {
        modifiedFileCount++;
        console.log("Modified Files"+modifiedFileCount);
        
    }
});
     
}


function convertBacktoOriginalState(newContent,file,newPathsContainer){
    var originalState;
    
    newContent = beautify(newContent, { indent_size: 3 });
    for(var jCount =0;jCount<newPathsContainer.length;jCount++){
               var oldPathValue = '"'+newPathsContainer[jCount]+'"';  
               var regExpCheck = new RegExp(escapeRegExp(oldPathValue),"g");
               newContent = newContent.replace(regExpCheck,newPathsContainer[jCount]);
    }
    writeToFile(file,newContent);  
    
}

