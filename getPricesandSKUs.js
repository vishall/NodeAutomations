var fs = require('fs');

var excelbuilder = require('excel4node');

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var recursive = require('recursive-readdir');

var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;

var deviceDetailsCol = [],payMonthlyPriceCollection = [], payGPriceCollection = [];;
    
recursive('D:/Kanban/Projects/productCat_ThuRelease/catalogueData/device/', function (err, files) {
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
           generateExcelFile(payMonthlyPriceCollection,payGPriceCollection);
        }
    });
});

function readdeviceDetails(deviceJSON){
    
    if(deviceJSON["cashPrice"]) {
        var payMPriceObj = {
                       "sku": deviceJSON["sku"]["code"],
                       "name": deviceJSON["model"],
                       "PayMonthly": deviceJSON["cashPrice"]
        };
        payMonthlyPriceCollection.push(payMPriceObj);
    }
    
    if(deviceJSON["replacementCost"]){
        var payGPriceObj = {
                       "sku": deviceJSON["sku"]["code"],
                       "name": deviceJSON["model"],
                       "payGo": deviceJSON["replacementCost"]
        };

        payGPriceCollection.push(payGPriceObj);
    }
}

function generateExcelFile(payMCollection,payGCollection){
    var wb = new excelbuilder.WorkBook();
    var wbOpts = {
        jszip:{
            compression:'DEFLATE'
        }
    }
    var wb2 = new excelbuilder.WorkBook(wbOpts);
    var ws = wb.WorkSheet('PayM');
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
    var ws2 = wb.WorkSheet('PayG', wsOpts);
    ws.Cell(1,1).String('GUID');
    ws.Cell(1,2).String('SKU');
    ws.Cell(1,2).String('Name');
    for(var skuCountLength = 0;skuCountLength < payMCollection.length;skuCountLength++){
        var row = skuCountLength + 2;
        ws.Cell(row,1).String(payMCollection[skuCountLength]["sku"]);
        ws.Cell(row,2).String(payMCollection[skuCountLength]["name"]);
        ws.Cell(row,3).String(payMCollection[skuCountLength]["PayMonthly"]);
    }
    
    for(var skuCountLength = 0;skuCountLength < payGCollection.length;skuCountLength++){
        var row = skuCountLength + 2;
        ws2.Cell(row,1).String(payGCollection[skuCountLength]["sku"]);
        ws2.Cell(row,2).String(payGCollection[skuCountLength]["name"]);
        ws2.Cell(row,3).String(payGCollection[skuCountLength]["payGo"]);
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
    wb.write("ExcelOutput/prodCatPrice_Report_v1.xlsx",function(err){ 
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

