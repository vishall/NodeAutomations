//THis is for checking PIDs in TDS with pids in ProdCat

var fs = require('fs'), XLSX = require('xlsx');

var excelbuilder = require('excel4node');

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var recursive = require('recursive-readdir');

//var regExp = /"productID"(.*),/;
var pidRegExp = /"productID"(.*),/;
var tariffPIDCollection = [], tdsPidCollection = [];
var matchCheckCount = 0;
/*module.exports = {

getPricesSkus : function(res) {*/
   
    
recursive('D:/Kanban/Projects_Gali/prodCatData_Master_May_28_Release/catalogueData/plan/monthly_2015/may/', function (err, files) {
    var index = 0,jsonFileCount = 0,matchCheckCount = 0;;
    replacementCost = 0, costToO2 = 0,rrp = 0,cashPrice = 0;
    var myArray = [],guid_Collection = [];
    console.log("Reading PIDs from ProdCat.....");
    console.log("..............................");
    var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; })
    jsonFiles.forEach(function(file) {
                var content = require(file);
                var searchResults = content.match(pidRegExp);
                var items = searchResults[0].split('"');
                str = items[3];
                index++;
                if(myArray != null) {
                    /*var obj = {
                          name: file,
                          id: myArray[0]
                    }*/
                    tariffPIDCollection.push(str);
                if(jsonFiles.length === index){
                     console.log("Reading PIDs from TDS.......");
                     console.log("............................");
                     readPIDsfromExcel();
                     compareTDSvsTariffsPIDs();
                     
                }
        }
        else{
             console.log("PID not foind for "+file);
        }
    })
    
});

function readPIDsfromExcel(){
    var workbook = XLSX.readFile('D:/Kanban/Projects_Gali/Tariffs/May_Release/CTDSv01.xlsx');
    var countRow = 9;
    var sheet_name_list = workbook.SheetNames;
    
    sheet_name_list.forEach(function(y) {
       
      if( y === "Online Shops"){
          var worksheet = workbook.Sheets[y];
          for (z in worksheet) {
              if(countRow <= 505){
                    if(z[0] === '!') continue;
                      var pidCell = 'D'+countRow;
                      //console.log(countRow);
                      if(worksheet[pidCell] != null || worksheet[pidCell] != undefined){
                         // console.log(y + "!" + z + "=" + JSON.stringify(worksheet[pidCell].v));
                          var tdsPID = {
                             "pid": worksheet[pidCell].v,
                             "row": countRow
                          }
                          tdsPidCollection.push(tdsPID);
                      }
                      else{
                         console.log("Empty PID for row "+countRow+" in TDS");   
                      }
                      countRow++; 
                  }
          }
          console.log("Total Rows in TDS is "+tdsPidCollection.length);
      }
    });
}


function compareTDSvsTariffsPIDs(){
    var tdsPIDCount = tdsPidCollection.length;
    var tariffPIDCount = tariffPIDCollection.length;
    var notMtachCount = 0;
    for(var count=0;count<tdsPIDCount;count++){
        var tdsCurrentPID = tdsPidCollection[count];
      
      var pidFlag = false;
      for(var innerCount =0;innerCount<tariffPIDCount;innerCount++){
            var tariffCurrentPID = tariffPIDCollection[innerCount];
            //console.log(innerCount+"::::"+tdsPIDCount);
            if(tdsCurrentPID["pid"] == tariffCurrentPID)   {
               matchCheckCount = matchCheckCount + 1;
               break;
            }
            else if((innerCount === (tariffPIDCount-1))){
               ++notMtachCount;
               console.log("Tariff not found for::  "+tdsCurrentPID["pid"]);   
            }
        }
    }
    console.log("Final no match Count is::"+notMtachCount);
    console.log("Final Match Count is::"+matchCheckCount);
}

/*
}
   
};
*/
