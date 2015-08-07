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


var classificationObj = {
    "colour" : {
      "display" : "Black",
      "primary" : "#383D46"
    },
    "memory" : {
      "unit" : "GB",
      "value" : "16",
      "display" : "16GB"
    }
  };



   
if (!String.prototype.format) { 
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

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
   
recursive('D:/Kanban/Projects/productCat_ThuRelease/catalogueData/accessories/', function (err, files) {
    var jsonFileCount = 0;
    
    console.log("Reading JSON files.....");
    var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; });
    console.log(jsonFileCount);
    jsonFiles.forEach(function(file) {
        console.log(file);
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
       }
        else{
            var json = JSON.parse(newContent);
        }
        addJSONObj(json,file,newPathsContainer);
    });
    
});

function addJSONObj(json,file,newPathsContainer){
    
    //json["classification"] = classificationObj;
   // json["colourGroup"] = "black";
    //json["compatibilityList"] = [ ];
    var fileNewContent = JSON.stringify(json);
    convertBacktoOriginalState(fileNewContent,file,newPathsContainer); 
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
    newContent = beautify(newContent, { indent_size: 3, "preserve_newlines": true ,"keep_array_indentation": false });
    for(var jCount =0;jCount<newPathsContainer.length;jCount++){
               var oldPathValue = '"'+newPathsContainer[jCount]+'"';  
               var regExpCheck = new RegExp(escapeRegExp(oldPathValue),"g");
               newContent = newContent.replace(regExpCheck,newPathsContainer[jCount]);
    }
    writeToFile(file,newContent);  
    
}




