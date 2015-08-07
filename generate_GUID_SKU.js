var fs = require('fs'), XLSX = require('xlsx');

var excelbuilder = require('excel4node');

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var recursive = require('recursive-readdir');


var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;
var priceList = [],cashPriceCollection = [], paygPriceCollection = [];
var descrepenciesCollection = [];
 
   
recursive('D:/Kanban/Projects/prodCatData_Trinity2Shop_Jan20/catalogueData/device/', function (err, files) {
    var jsonFileCount = 0;
    priceList = [];
    var index = 0;
    console.log("........................................................................");
    console.log("Reading JSON files.....");
    console.log("........................................................................");
    console.log("........................................................................");
    console.log("Comaparing Cash/Replacement Prices with Plan OneOff Prices.........");
    console.log("........................................................................");
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
            index++;
            var deviceObj = {
                 "guid": json["id"],
                 "sku":json["sku"]["code"],
                 "model":json["model"]
            }
            descrepenciesCollection.push(deviceObj);
            if(jsonFiles.length === index){
                generateExcelFile(descrepenciesCollection);
                //console.log(priceList )
             }
    }
    });
    
});

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}



function generateExcelFile(collection){
 // console.log(collection);
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
    ws.Cell(1,2).String('ID');
    ws.Cell(1,3).String('Model');
    for(var skuCountLength = 0;skuCountLength < collection.length;skuCountLength++){
        var row = skuCountLength + 2;
        ws.Cell(row,1).String(collection[skuCountLength]["sku"].toString());
        ws.Cell(row,2).String(collection[skuCountLength]["guid"].toString());
        ws.Cell(row,3).String(collection[skuCountLength]["model"].toString());  
    }
    ws.Row(1).Height(30);
    ws.Column(1).Width(20);
    ws.Column(2).Width(50);
     ws.Column(3).Width(30);
    wb.write("PricesSheet/DeviceInfo.xls",function(err){ 
     console.log("Generated DeviceInfo.xls sheet in PricesSheet Folder");
    });
        
}

