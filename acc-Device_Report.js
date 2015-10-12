var fs = require('fs');

var excelbuilder = require('excel4node');

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var recursive = require('recursive-readdir');

var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;

var deviceDetailsCol = [];

recursive('D:/Kanban/Projects_Gali/ProdCat/productCatalogueData_Master/catalogueData/accessories/', function (err, files) {
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
            //console.log(accyDeviceMapping);
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
                var uniqueArray = accyArray.filter(function(elem, pos,arr) {
                    return arr.indexOf(elem) == pos;
                  });
                var obj = {
                    "name": param1,
                    "accy": uniqueArray
                }
                accyDeviceMapping.push(obj);
           }
        }
    }
    else{
        var accyArray = [];
        accyArray.push(param2);
            var uniqueArray = accyArray.filter(function(elem, pos,arr) {
                                return arr.indexOf(elem) == pos;
                              });

                  var obj = {
                              "name": param1,
                              "accy": uniqueArray
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
              var accModelSku = deviceJSON["model"]+":-"+ deviceJSON["sku"]["code"];
               pushAccytoDevices(accyObj[accCount].split("/")[3],accModelSku);
            //    console.log(deviceJSON);
        }
    }
    else {
         console.log("yup");
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
    var ws = wb.WorkSheet('accessories');
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
    ws.Cell(1,1).String('Device Name');
    ws.Cell(1,2).String('Acc1');


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

    wb.write("ExcelOutput/Accessories_Device_RelationB0.1.xlsx",function(err){
        console.log("Done");
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

