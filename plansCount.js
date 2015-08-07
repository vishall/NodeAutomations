var beautify = require('js-beautify'), XLSX = require('xlsx');
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

var tariffCollection = [],matchCount=0, modifiedFileCount =0;
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
   
recursive('D:/Kanban/Projects_Gali/prodCatData_Master_May_28_Release/catalogueData/plan/', function (err, files) {
    var jsonFileCount = 0;
    console.log("Error is ..");
    console.log(err);
    console.log("Reading JSON files.....");
    var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; });
    console.log(jsonFiles.length);
   
    });
    


recursive('D:/Kanban/Projects_Gali/prodCatData_Master_May_28_Release/catalogueData/prepaySims/', function (err, files) {
    var jsonFileCount = 0;
    console.log("Error is ..");
    console.log(err);
    console.log("Reading JSON files.....");
    var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; });
    console.log(jsonFiles.length);
   
    });
    



function modifyChannelPermissions(planJSON,file,newPathsContainer){
    var  tariffCollectionLength = tariffCollection.length;
    var loopMatchCount = 0;
    for(var tariffCount = 0;tariffCount<tariffCollectionLength;tariffCount++){
          if(tariffCollection[tariffCount]["pid"] == planJSON["productID"]){ 
              if(tariffCollection[tariffCount]["ConsumerNew"] == "Y"){
                  planJSON["channelPermissions"]["ConsumerNew"] = "Buyable";
              }
              else { planJSON["channelPermissions"]["ConsumerNew"] = "Hidden"; }
              if(tariffCollection[tariffCount]["ConsumerUpgrade"] == "Y") planJSON["channelPermissions"]["ConsumerUpgrade"] = "Buyable";
              else planJSON["channelPermissions"]["ConsumerUpgrade"] = "Hidden";
              if(tariffCollection[tariffCount]["VoiceNew"] == "Y") planJSON["channelPermissions"]["VoiceNew"] = "Buyable";
              else planJSON["channelPermissions"]["VoiceNew"] = "Hidden";
              if(tariffCollection[tariffCount]["VoiceUpgrade"] == "Y") planJSON["channelPermissions"]["VoiceUpgrade"] = "Buyable";
              else planJSON["channelPermissions"]["VoiceUpgrade"] = "Hidden";
              matchCount++;
              loopMatchCount++;
              if(tariffCollection[tariffCount]["pid"] == "T:CR6468:24M:10GB:CCA:DATAONLY:GBP26:S1") console.log("Got it");
              (function(fileP,newPathsContainerP,planJSONP){   
                   var fileNewContentP = JSON.stringify(planJSONP);
                   convertBacktoOriginalState(fileNewContentP,fileP,newPathsContainerP); 
              })(file,newPathsContainer,planJSON);
             
              break;
          }
          else if(tariffCount == (tariffCollectionLength-1)){ 
              //console.log("No Match"+tariffCount);
              //console.log("TRS PID Value::"+planJSON["productID"]);   
          }
    }
    
}

function readTRSInformation(){ 
    tariffCollection = [];
    var workbook = XLSX.readFile('D:/Kanban/Projects_Gali/Tariffs/May_Release/v1.3 May Tariff Drop TRS.xlsx');
    var tariffRows_Min_Count = 2,tariffRows_Max_Count = 14;
    var sheet_name_list = workbook.SheetNames;
    sheet_name_list.forEach(function(y) {
       
      if( y === "3. UPDATE Tariffs"){
          var worksheet = workbook.Sheets[y];
          for (z in worksheet) {
              if(tariffRows_Min_Count <= tariffRows_Max_Count){
                    if(z[0] === '!') continue;
                      var pidCell = 'B'+tariffRows_Min_Count;
                      var consumerNewCell = 'BA'+tariffRows_Min_Count;
                      var consumerUpgradeCell = 'BC'+tariffRows_Min_Count;
                      var voiceNewCell = 'BB'+tariffRows_Min_Count;
                      var voiceUpgradeCell = 'BD'+tariffRows_Min_Count;
                      var tariffDetails = {
                         "pid": worksheet[pidCell].v,
                         "ConsumerNew": worksheet[consumerNewCell].v,
                         "ConsumerUpgrade": worksheet[consumerUpgradeCell].v,
                         "VoiceNew": worksheet[voiceNewCell].v,
                         "VoiceUpgrade": worksheet[voiceUpgradeCell].v,
                      }
                      tariffCollection.push(tariffDetails);
                      tariffRows_Min_Count++; 
                  }
          }
      } 
    });     
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
    writeToFile(file,newContent);  
    
}

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}



/*
}
   
};
*/
