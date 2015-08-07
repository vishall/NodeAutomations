// Please declare the Global  values here

var stockPotURL = "http://bau-dev-merch00.obnubilate.co.uk:8080/productService/admin/stockLevels";







var fs = require('fs'), XLSX = require('xlsx');

var excelbuilder = require('excel4node');

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};


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

