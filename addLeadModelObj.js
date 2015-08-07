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
   
recursive('D:/Kanban/Projects_Gali/prodCat_Master_June_Accy_Rel/catalogueData/device/', function (err, files) {
    var jsonFileCount = 0;
    
    console.log("Reading JSON files.....");
    var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; });
    console.log(jsonFileCount);
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
            addLeafLet(json,file,newPathsContainer);
    }
        else{
            var json = JSON.parse(newContent);
            addLeafLet(json,file,newPathsContainer);
        }
    });
    
});

function addLeafLet(json,file,newPathsContainer){
    
 /*   var leadModelInFamily = json["leadModelInFamily"];
    var modelFamily = json["modelFamily"];
    if(leadModelInFamily && modelFamily){
        
        //fullfillmentData["otherProducts"].push(leafLet);
    }else{
        //console.log(file);
        json["leadModelInFamily"] = json["id"] ;
        json["modelFamily"] = json["model"];
        console.log(".....................................................................................................")
        //console.log(json);
        var fileNewContent = JSON.stringify(json);
        convertBacktoOriginalState(fileNewContent,file,newPathsContainer); 
    }*/
    if(json["modelFamily"] == "Base comms"){ 
        console.log(file);
    }
    
}



function writeToFile(file,content){
  fs.writeFile(file, content, function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
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
