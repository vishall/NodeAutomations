var fs = require('fs');

var excelbuilder = require('excel4node');

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var recursive = require('recursive-readdir');

var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;

var deviceDetailsCol = [];
    
recursive('D:/Kanban/Projects_Gali/prodCat_Master_June/catalogueData/accessories/', function (err, files) {
    var jsonFileCount = 0, jsonFilesIndex = 0;
    var json;
    console.log("Reading JSON files.....");
    var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; });
    deviceDetailsCol =[];
    jsonFiles.forEach(function(file) {
        var content =  require(file);
       // console.log(file);
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
        //console.log(file);
        readdeviceDetails(json);
        if(jsonFiles.length === jsonFilesIndex){
            console.log(accyDeviceMapping);
            generateExcelFile2(accyDeviceMapping);
        }
    });
});

var accyDeviceMapping = [];

function pushAccytoDevices(param1,param2){
     
    if(accyDeviceMapping.length){
        for(var mapCount= 0;mapCount<accyDeviceMapping.length;mapCount++){
           if(accyDeviceMapping[mapCount]["name"] == param1)  {
              var  accyArrayObj = accyDeviceMapping[mapCount]["accy"];
              accyArrayObj.push(param2);
              break;
           }
           else if(mapCount == (accyDeviceMapping.length -1)){
                var accyArray = [];
                accyArray.push(param2);
                var obj = {
                    "name": param1,
                    "accy": accyArray
                }
                accyDeviceMapping.push(obj);
           }
        }
    }
    else{
        var accyArray = [];
        accyArray.push(param2);
        var obj = {
            "name": param1,
            "accy": accyArray
        }
        accyDeviceMapping.push(obj);
    }
}

function readdeviceDetails(deviceJSON){
    var assocDevices = [];
    if(deviceJSON["recommendedForPhones"]){
        //console.log(deviceJSON["recommendedForPhones"].length);
        var accyLength = deviceJSON["recommendedForPhones"].length;
        var accyObj = deviceJSON["recommendedForPhones"];
        for(var accCount =0; accCount<accyLength ;accCount++){
              //console.log(accyObj[accCount].split("/")[3]);
              assocDevices.push(accyObj[accCount].split("/")[3]);
              pushAccytoDevices(accyObj[accCount].split("/")[3],deviceJSON["model"]);
        }
    }
    else {
         console.log("yuppppppppppp");
    }
    
    var devicesStr = " ";
    if(assocDevices.length) devicesStr = assocDevices.toString();
   
    var deviceObj = {
                   "guid":deviceJSON["id"],
                   "brand": deviceJSON["brand"],
                   "model":deviceJSON["model"],
                   "type":deviceJSON["type"],
                   "sku": deviceJSON["sku"]["code"],
                   "StockInfo":deviceJSON["stock"],
                   "ConsumerNew": deviceJSON["channelPermissions"]["ConsumerNew"],
                   "ConsumerUpgrade": deviceJSON["channelPermissions"]["ConsumerUpgrade"],
                   "VoiceNew": deviceJSON["channelPermissions"]["VoiceNew"],
                   "VoiceUpgrade": deviceJSON["channelPermissions"]["VoiceUpgrade"],
                   "deviceinfo" : devicesStr
    };
    deviceDetailsCol.push(deviceObj);
}


function generateExcelFile2(collection){
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
    var ws2 = wb.WorkSheet('accessories', wsOpts);
    ws.Cell(1,1).String('Device Name');
    ws.Cell(1,2).String('Accy List');
    
    for(var skuCountLength = 0;skuCountLength < collection.length;skuCountLength++){
        var row = skuCountLength + 2;
        ws.Cell(row,1).String(collection[skuCountLength]["name"]);
        ws.Cell(row,2).String(collection[skuCountLength]["accy"].toString());
        
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
    
    wb.write("ExcelOutput/Accessories_Details_v7.xlsx",function(err){ 
        console.log("God");
    });
        
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
    var ws2 = wb.WorkSheet('accessories', wsOpts);
    ws.Cell(1,1).String('GUID');
    ws.Cell(1,2).String('Brand');
    ws.Cell(1,3).String('Model');
    ws.Cell(1,4).String('Type');
    ws.Cell(1,5).String('SKU');
    ws.Cell(1,6).String('StockInfo');
    ws.Cell(1,7).String('ConsumerNew');
    ws.Cell(1,8).String('ConsumerUpgrade');
    ws.Cell(1,9).String('VoiceNew');
    ws.Cell(1,10).String('VoiceUpgrade');
    ws.Cell(1,11).String('Device Details');
    for(var skuCountLength = 0;skuCountLength < collection.length;skuCountLength++){
        var row = skuCountLength + 2;
        ws.Cell(row,1).String(collection[skuCountLength]["guid"]);
        ws.Cell(row,2).String(collection[skuCountLength]["brand"]);
        ws.Cell(row,3).String(collection[skuCountLength]["model"]);
        ws.Cell(row,4).String(collection[skuCountLength]["type"]);
        ws.Cell(row,5).String(collection[skuCountLength]["sku"]);
        ws.Cell(row,6).String(collection[skuCountLength]["StockInfo"]);
        ws.Cell(row,7).String(collection[skuCountLength]["ConsumerNew"]);
        ws.Cell(row,8).String(collection[skuCountLength]["ConsumerUpgrade"]);
        ws.Cell(row,9).String(collection[skuCountLength]["VoiceNew"]);
        ws.Cell(row,10).String(collection[skuCountLength]["VoiceUpgrade"]);
        ws.Cell(row,11).String(collection[skuCountLength]["deviceinfo"]);
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
    wb.write("ExcelOutput/Accessories_Details_v4.xlsx",function(err){ 
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

