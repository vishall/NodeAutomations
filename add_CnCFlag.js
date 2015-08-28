var beautify = require('js-beautify');
var fs = require('fs');
var prettyjson = require('prettyjson');
var options = {
  noColor: true
};

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var recursive = require('recursive-readdir');

var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;

var deviceDetailsCol = [], modifiedFileCount =0;

recursive('D:/Kanban/Projects_Gali/ProdCat/productCatalogueData_Master/catalogueData/device/', function (err, files) {
    
    var jsonFileCount = 0, jsonFilesIndex = 0;
    var json;
    console.log(files.length);
    var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; });
    deviceDetailsCol =[];
    jsonFiles.forEach(function(file) {
        var content =  require(file);
        //console.log(file);
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
        //if(json["id"] == "8281864e-faf7-4d28-86d1-5346b64f1c7cdvsd")
        addCnCFlag(json,file,newPathsContainer);
        
    });
});

function addCnCFlag(json,file,newPathsContainer){
    var stockInfo = json["stockInfo"]["stock"];
    var endOfLife = json["lifecycle"]["status"];
    if(stockInfo == "InStock"){
        if( json["disableClickAndCollect"] != false ||  json["disableClickAndCollectNow"] != false){
            console.log(file);
            json["disableClickAndCollect"] = false;
            json["disableClickAndCollectNow"] = false;
            var fileNewContent = JSON.stringify(json);
   // convertBacktoOriginalState(fileNewContent,file,newPathsContainer);
        }
    }else if(stockInfo == "DelayedDelivery"){
       if( json["disableClickAndCollect"] != true || json["disableClickAndCollectNow"] != false){
          // console.log(file);
           json["disableClickAndCollect"] = true;
           json["disableClickAndCollectNow"] = false;
           var fileNewContent = JSON.stringify(json);
    //convertBacktoOriginalState(fileNewContent,file,newPathsContainer);
       }
    }else if(stockInfo == "OutOfStock"){
        if(json["disableClickAndCollect"] != true || json["disableClickAndCollectNow"] != false){
          // console.log(file);
            json["disableClickAndCollect"] = true;
            json["disableClickAndCollectNow"] = false;
            var fileNewContent = JSON.stringify(json);
   // convertBacktoOriginalState(fileNewContent,file,newPathsContainer);
        }
    }

    if(json["disableClickAndCollect"]  == "PreOrder"){
       if(json["disableClickAndCollect"] != false || json["disableClickAndCollectNow"] != true){
                // console.log(file);
                  json["disableClickAndCollect"] = false;
                  json["disableClickAndCollectNow"] = true;
                  var fileNewContent = JSON.stringify(json);
          convertBacktoOriginalState(fileNewContent,file,newPathsContainer);
              }
    }
    if(endOfLife == "EndOfLife"){
        json["disableClickAndCollect"] = true;
        json["disableClickAndCollectNow"] = true;
         var fileNewContent = JSON.stringify(json);
            convertBacktoOriginalState(fileNewContent,file,newPathsContainer);
    }
    
    //var fileNewContent = JSON.stringify(json);
    //convertBacktoOriginalState(fileNewContent,file,newPathsContainer); 
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
    
    newContent = beautify(newContent, { indent_size: 2 });
    for(var jCount =0;jCount<newPathsContainer.length;jCount++){
               var oldPathValue = '"'+newPathsContainer[jCount]+'"';  
               var regExpCheck = new RegExp(escapeRegExp(oldPathValue),"g");
               newContent = newContent.replace(regExpCheck,newPathsContainer[jCount]);
    }
    writeToFile(file,newContent);  
    
}

