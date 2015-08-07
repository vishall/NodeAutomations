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


/*module.exports = {

getPricesSkus : function(res) {*/
   
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
   
recursive('D:/Kanban/Projects_Gali/prodCat_Trinity2Shop_1405_revert_rollback/catalogueData/device/', function (err, files) {
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
            getTechSpec(json,file,newPathsContainer);
    }
        else{
            var json = JSON.parse(newContent);
            getTechSpec(json,file,newPathsContainer);
        }
    });
    
});

function getTechSpec(json,file,newPathsContainer){
    var oldTechSpec = null,ccaProductInformation =null;
    if(json["technicalSpecification"]){
        oldTechSpec = json["technicalSpecification"]["techSpec"];
        
    }else{
       // console.log(json["sku"]["code"]);   
        oldTechSpec = null;
        
    }
    
    if(json["ccaProductInformation"] ) {
        ccaProductInformation = json["ccaProductInformation"];
    }
    else{ console.log(json["sku"]["code"]);   
        ccaProductInformation = null;
        }
  //  if(oldTechSpec != null){
        var jsonPath = file.split('prodCat_Trinity2Shop_1405_revert_rollback');
        var newJSONPath = 'D:\\Kanban\\Projects_Gali\\14th_May_Branch'+jsonPath[1];
        load14MayJSONFile(newJSONPath,oldTechSpec,ccaProductInformation); 
  //  }
    

}

function load14MayJSONFile(newJSONPath,oldTechSpec,ccaProductInformation){
    
        var content =  require(newJSONPath);
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
            var jsonData = JSON.parse(newContent);
            changeTechSpec(jsonData,newJSONPath,newPathsContainer,oldTechSpec,ccaProductInformation);
        }
        else{
            var jsonData = JSON.parse(newContent);
            changeTechSpec(jsonData,newJSONPath,newPathsContainer,oldTechSpec,ccaProductInformation);
        }
}

function changeTechSpec(jsonData,newJSONPath,newPathsContainer,oldTechSpec,ccaProductInformation){
      if(jsonData["technicalSpecification"]){
            if(oldTechSpec) jsonData["technicalSpecification"]["techSpec"] = oldTechSpec;
            else console.log("Tech Spec Null for "+newJSONPath);
      }
    
          
            if(ccaProductInformation) jsonData["ccaProductInformation"] = ccaProductInformation;
            else console.log("CCA Null for "+newJSONPath);
          
            var fileNewContent = JSON.stringify(jsonData);
            convertBacktoOriginalState(fileNewContent,newJSONPath,newPathsContainer); 
      
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
