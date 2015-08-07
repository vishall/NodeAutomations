var beautify = require('js-beautify');
var fs = require('fs');
var prettyjson = require('prettyjson');
var options = {
  noColor: true
};

var excelbuilder = require('excel4node');



require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var recursive = require('recursive-readdir');

var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;

var leafLet = {"productType" : "LIT","productId" : "LDSV25SN","productName" : "ACCESSORY SHOP 25 PERCENT OFF LEAFLET"};
var otherProducts = [];
otherProducts.push(leafLet);
/*module.exports = {

getPricesSkus : function(res) {*/
   
if (!String.prototype.format) { console.log("Noooo");
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}
   
recursive('D:/Kanban/Projects_Gali/ProdCat/productCatalogueData_Master/catalogueData/plan/', function (err, files) {
    var jsonFileCount = 0;
    
    console.log("Reading JSON files.....");
    var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; });
    console.log(jsonFileCount);
    jsonFiles.forEach(function(file) {
       // console.log(file);
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
           //if(json["type"] == "SimOnly")
           addLeafLet(json,file,newPathsContainer);
    }
        else{
            var json = JSON.parse(newContent);
            //if(json["type"] == "SimOnly")
            addLeafLet(json,file,newPathsContainer);
        }
    });
    
});

var noCount = 0;

function addLeafLet(json,file,newPathsContainer){
    var fullfillmentData = json["fulfillmentData"];
    if(fullfillmentData["otherProducts"]){
        var extrasLength = fullfillmentData["otherProducts"].length;
        var otherProducts = fullfillmentData["otherProducts"];
        for(var i=0;i<extrasLength;i++){
           if(otherProducts[i]["productId"] == "O2WP263N"){
             //  console.log(otherProducts[(extrasLength-1)]["productId"]);
               if(otherProducts[(extrasLength-1)]["productId"] == "O2WP263N"){
                 noCount++;
                    fullfillmentData["otherProducts"].length = (fullfillmentData["otherProducts"].length-1);
                     var fileNewContent = JSON.stringify(json);
    convertBacktoOriginalState(fileNewContent,file,newPathsContainer); 
               }else{
                   console.log(file);
                  console.log("Wrong Condition");   
               }
            // fullfillmentData["otherProducts"].length = (fullfillmentData["otherProducts"].length-1);
            
               break;
           }
        }
        //console.log("1");
        //console.log(fullfillmentData["otherProducts"].length);
       // fullfillmentData["otherProducts"].push(leafLet);
        //var fileNewContent = JSON.stringify(json);
   // convertBacktoOriginalState(fileNewContent,file,newPathsContainer); 
    }else{
        //console.log("No OtherProducts Data");
        //console.log(json["sku"]);
        //console.log("2");
       //  json["fulfillmentData"]["otherProducts"] = otherProducts;
    }
    
    
}



function writeToFile(file,content){
  fs.writeFile(file, content, function(err) {
    if(err) {
        console.log(err);
    } else {
        //console.log("The file was saved!");
    }
});
     
}


function convertBacktoOriginalState(newContent,file,newPathsContainer){
    var originalState;
    newContent = beautify(newContent, { indent_size: 2 });
    for(var jCount =0;jCount<newPathsContainer.length;jCount++){
               var oldPathValue = '"'+newPathsContainer[jCount]+'"';  
               var regExpCheck = new RegExp(escapeRegExp(oldPathValue),"g");
               newContent = newContent.replace(regExpCheck,newPathsContainer[jCount]);
    }
    writeToFile(file,newContent);  
    
}

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

/*
}
   
};
*/
