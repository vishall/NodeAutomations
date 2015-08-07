var fs = require('fs'), XLSX = require('xlsx');
var beautify = require('js-beautify');
var prettyjson = require('prettyjson');

var excelbuilder = require('excel4node');

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var recursive = require('recursive-readdir');

var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;


var o2BoltonPIDContainer = [],modifiedFileCount= 0;

var O2_500Mins_Bolton = {
    "type": "bolton",
    "id": "${idOf('/boltons/500m-o2-to-o2-calls.json')}"
};

var relationships =[];
relationships.push(O2_500Mins_Bolton);

loadPIDSforO2Bolton();
loadLoyaltyDiscountsJSON();

function loadLoyaltyDiscountsJSON(){   
    var pidContainerLength = o2BoltonPIDContainer.length;
    console.log(pidContainerLength);
    recursive('D:/Kanban/Projects/productCatalogueData_Jan20/catalogueData/plan/q115/', function (err, files) {
        var jsonFileCount = 0;
        var index = 0;
        var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; });
        console.log(jsonFileCount);
        jsonFiles.forEach(function(file) {

            var content =  require(file);
            var newContent = content;
            var newSearch = newContent.match(pathRegExp);
            var newPathsContainer = [];
            var json;
            if(newSearch != null){
                var uniqueArray = newSearch.filter(function(elem, pos) {
                    return newSearch.indexOf(elem) == pos;
                }); 
                //console.log(uniqueArray[0]);
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
//console.log(newPathsContainer);
            newPathsContainer.push("${idOf('/boltons/500m-o2-to-o2-calls.json')}");
            var tariffPID = json["productID"];
            var flag = true;
            for(var tariffPIDCount = 0; tariffPIDCount < pidContainerLength ; tariffPIDCount++){
                  if(o2BoltonPIDContainer[tariffPIDCount]["pid"] == tariffPID){
                      add500O2Bolton(json,file,newPathsContainer);
                      flag = false;
                      break;
                  }
                /*else if((tariffPIDCount == (pidContainerLength-1)) && (flag)){
                    console.log("No Match");
                    console.log(o2BoltonPIDContainer[tariffPIDCount]["pid"]);
                }*/
            }
            index++;
            if(jsonFiles.length === index){
                console.log("done");
             }
        });

    });
}

function loadPIDSforO2Bolton(){
    o2BoltonPIDContainer = [];
    var workbook = XLSX.readFile('D:/Kanban/Projects/Automation/NodeJS/TRS/O2toO2_500_Mins_compat.xlsx');
    var sheet_Min_Count = 2,sheet_Max_Count = 76;
    var sheet_name_list = workbook.SheetNames;
    sheet_name_list.forEach(function(y) {
       
      if( y === "CRM Extract"){
          var worksheet = workbook.Sheets[y];
          for (z in worksheet) {
              if(sheet_Min_Count <= sheet_Max_Count){
                    if(z[0] === '!') continue;
                      var skuCell = 'B'+sheet_Min_Count;
                      
                      var pid = {
                         "pid": worksheet[skuCell].v
                      }
                     
                      o2BoltonPIDContainer.push(pid);
                      sheet_Min_Count++; 
                  }
          }
      } 
    });   
}

function add500O2Bolton(tariffJSON,file,newPathsContainer){
    if(tariffJSON["relationships"]){
       tariffJSON["relationships"].push(O2_500Mins_Bolton);
    }
    else{
      tariffJSON["relationships"] = relationships; 
    }
    var fileNewContent = JSON.stringify(tariffJSON);
    convertBacktoOriginalState(fileNewContent,file,newPathsContainer)
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
    
    newContent = beautify(newContent, { indent_size: 1 });
    for(var jCount =0;jCount<newPathsContainer.length;jCount++){
               var oldPathValue = '"'+newPathsContainer[jCount]+'"';  
               var regExpCheck = new RegExp(escapeRegExp(oldPathValue),"g");
               newContent = newContent.replace(regExpCheck,newPathsContainer[jCount]);
    }
   // newContent = newContent.replace('"${','${');
   // newContent = newContent.replace(')}"',')}');
    console.log(".........................................................");
    writeToFile(file,newContent);  
    
}
