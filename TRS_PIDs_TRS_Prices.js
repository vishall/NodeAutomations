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
   
/*recursive('D:/Kanban/Projects/prodCat_Trinity2Shop_Q1_Backup_04_03_2015/catalogueData/plan/q115/', function (err, files) {
    var jsonFileCount = 0;
    
    console.log("Reading JSON files.....");
    var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; });
    console.log(jsonFiles.length);
    
});*/

readTRSInformation(); 
    checkTRSPDSvsPrices();



function readTRSInformation(){ 
    tariffCollection = [];
    var workbook = XLSX.readFile('D:/Kanban/Projects/Automation/PG_24_12_2014/wip/TRS/PCR9_1.xlsx');
    var tariffRows_Min_Count = 2,tariffRows_Max_Count = 388;
    var sheet_name_list = workbook.SheetNames;
    sheet_name_list.forEach(function(y) {
       
      if( y === "2.Tariff"){
          var worksheet = workbook.Sheets[y];
          for (z in worksheet) {
              if(tariffRows_Min_Count <= tariffRows_Max_Count){
                    if(z[0] === '!') continue;
                      var pidCell = 'AF'+tariffRows_Min_Count;
                      var priceCell = 'N'+tariffRows_Min_Count;
                      var consumerNewCell = 'AZ'+tariffRows_Min_Count;
                      var consumerUpgradeCell = 'BB'+tariffRows_Min_Count;
                      var voiceNewCell = 'BA'+tariffRows_Min_Count;
                      var voiceUpgradeCell = 'BC'+tariffRows_Min_Count;
                      var tariffDetails = {
                         "pid": worksheet[pidCell].v,
                         "price": worksheet[priceCell].v,
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


function checkTRSPDSvsPrices(){
   var  tariffCollectionLength = tariffCollection.length;
    var loopMatchCount = 0;
    for(var tariffCount = 0;tariffCount<tariffCollectionLength;tariffCount++){
        var tariffPrice = tariffCollection[tariffCount]["price"];
        var PID = tariffCollection[tariffCount]["pid"];
        var pidSplit =  PID.indexOf('GBP');
        var pidGBPStr = PID.substr(pidSplit);
        var pidPrice = null;
        var pidGBPSubStr = pidGBPStr.split(':');
          if(pidGBPSubStr.length === 2){
           //console.log(pidGBPSubStr[0]);
           pidPrice = pidGBPSubStr[0].substr(3);
            
        }else if(pidGBPSubStr.length === 3){
          // console.log(pidGBPSubStr[1]);
            if(pidGBPSubStr[2] == "CCA"){
                pidPrice = pidGBPSubStr[0].substr(3);
            }else{  
                pidPrice = pidGBPSubStr[1];
            }
            //console.log(pidGBPSubStr);
        }else if(pidGBPSubStr.length === 1){
            pidPrice = pidGBPSubStr[0].substr(3);
        }
        /*console.log(pidPrice);
       
        console.log(tariffPrice);*/
        // console.log("......");
        if(pidPrice == null){
            console.log("PID Price is :"+pidPrice);
          
        }else{
        
          if(pidPrice != parseFloat(tariffPrice)){ 
              console.log("Mismatch for ::"+PID);
          }
          
        }
    }   
}




/*
}
   
};
*/
