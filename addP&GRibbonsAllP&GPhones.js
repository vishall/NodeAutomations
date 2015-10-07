var fs = require('fs');
var beautify = require('js-beautify');

var excelbuilder = require('excel4node');

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var recursive = require('recursive-readdir');

var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;

var deviceDetailsCol = [],modifiedFileCount = 0;

recursive('D:/Kanban/Projects_Gali/ProdCat/productCatalogueData_Master/catalogueData/device/', function (err, files) {
    var jsonFileCount = 0, jsonFilesIndex = 0;
    var json;
    console.log("Reading JSON files.....");
    var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; });
    deviceDetailsCol =[];
    jsonFiles.forEach(function(file) {
    //console.log(file);
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
            json = JSON.parse(newContent);
        }
        else{
            json = JSON.parse(newContent);
        }
        jsonFilesIndex++;
        readdeviceDetails(json,file,newPathsContainer);
        if(jsonFiles.length === jsonFilesIndex){
           //generateExcelFile(deviceDetailsCol);
        }
    });
});

function readdeviceDetails(deviceJSON,file,newPathsContainer){

        (function(){
        var plansAssociated = deviceJSON["relationships"];
        var payMOnthlyFlag = false,payGFlag = false;

        for(var planCount=0;planCount<plansAssociated.length;planCount++){
             var plansPrices =  plansAssociated[planCount]["prices"];
             var planPathID = plansAssociated[planCount]["id"];
             if(plansAssociated[planCount]["prices"] != null) {
                if(planPathID.search("prepaySims") != -1){
                   payGFlag = true;
                   break;
                }
//                else if(planPathID.search("plan") == -1){
//                    if(plansAssociated[planCount]["prices"].length == 1){
//                      payGFlag = "true";
//                      break;
//                    }
//                }
             }
        }

        if( (payGFlag) && ( deviceJSON["subType"] == "SmartPhone" || deviceJSON["subType"] == "iPhone" || deviceJSON["subType"] == "StandardPhone") && ( deviceJSON["id"] == deviceJSON["leadModelInFamily"] ) ){
             //console.log(file);

             if(deviceJSON["promotion"]){
                var prePayPromotion = deviceJSON["promotion"];
                if( prePayPromotion["prepay"]){
                    prePayPromotion["prepay"]["ribbon"]= "50% extra data, for three months. Ends 31 Dec.";
                }
                else{
                   prePayPromotion["prepay"]= { "ribbon" : "50% extra data, for three months. Ends 31 Dec." };
                }
             }
             else{
                deviceJSON["promotion"]  = {
                   "prepay":{
                     "ribbon": "50% extra data, for three months. Ends 31 Dec."
                   }
                }
              }


             var fileNewContent = JSON.stringify(deviceJSON);
            convertBacktoOriginalState(fileNewContent,file,newPathsContainer);
         }
        })();

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

    newContent = beautify(newContent, { indent_size: 3 });
    for(var jCount =0;jCount<newPathsContainer.length;jCount++){
               var oldPathValue = '"'+newPathsContainer[jCount]+'"';
               var regExpCheck = new RegExp(escapeRegExp(oldPathValue),"g");
               newContent = newContent.replace(regExpCheck,newPathsContainer[jCount]);
    }
    writeToFile(file,newContent);

}

