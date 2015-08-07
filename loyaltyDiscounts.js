var fs = require('fs'), XLSX = require('xlsx'), beautify = require('js-beautify');

var excelbuilder = require('excel4node');

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var recursive = require('recursive-readdir');

var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;


var loyaltyDiscounts12MContainer = [],loyaltyDiscounts18MContainer = [],loyaltyDiscounts24MContainer = [],modifiedFileCount = 0;

loadLoyaltyDiscountsJSON();
function loadLoyaltyDiscountsJSON(){   
    recursive('D:/Kanban/Projects_Gali/ProdCat/productCatalogueData_Master_M/catalogueData/loyaltyDiscounts/', function (err, files) {
        var jsonFileCount = 0;
        var index = 0;
        var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; })
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
                var loyaltyObj = {
                   "filename": file,
                   "json":json,
                   "modifiedpaths": newPathsContainer
                };
                if(json["discountDuration"] == "P12M") loyaltyDiscounts12MContainer.push(loyaltyObj);
                else if(json["discountDuration"] == "P18M") loyaltyDiscounts18MContainer.push(loyaltyObj);
                else if(json["discountDuration"] == "P24M")loyaltyDiscounts24MContainer.push(loyaltyObj);
                index++;
                if(jsonFiles.length === index){
                    sortLoyaltyDiscountsContainer();
                    calculateTariffDiscounts();
                 }
        }
        });

    });
}

function  sortLoyaltyDiscountsContainer(){
    loyaltyDiscounts12MContainer.sort(function(a, b) {
      var priceA = parseInt(a["json"]["price"]),
          priceB = parseInt(b["json"]["price"]);
      return priceB - priceA;
    });
    
    loyaltyDiscounts18MContainer.sort(function(a, b) {
      var priceA = parseInt(a["json"]["price"]),
          priceB = parseInt(b["json"]["price"]);
      return priceB - priceA;
    });
    
    loyaltyDiscounts24MContainer.sort(function(a, b) {
      var priceA = parseInt(a["json"]["price"]),
          priceB = parseInt(b["json"]["price"]);
      return priceB - priceA;
    });
}

function checkLoyaltyDiscountsEligibilty(tariffJSON){
    // Only 24M and 12M tariffs are eligible for Loyalty Discounts
    // 30D tariffs are not eligible for loyalty discounts
    // Only Voice tariffs are eligible for Loyalty Discounts
    // Data Tariffs ate not eligible for LOyalty Discounts

    var eligibiltyFlag = true;
    if(tariffJSON["subType"] == "Data") eligibiltyFlag = false;
    if(tariffJSON["commitmentLength"] == "P30D") eligibiltyFlag = false;    

    return eligibiltyFlag;
}

function calculateTariffDiscounts(){
    recursive('D:/Kanban/Projects_Gali/ProdCat/productCatalogueData_Master_M/catalogueData/plan/monthly_2015/july/', function (err, files) {
        var fileIndex = 0,json;
        var jsonFiles = files.filter(function(file) {return file.substr(-5) === '.json'; })
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
                json = JSON.parse(newContent);
           }
           else{
               json = JSON.parse(newContent);
           }
            var loyaltyDEligFlag = false;
            loyaltyDEligFlag = checkLoyaltyDiscountsEligibilty(json);
            fileIndex++;
            if(loyaltyDEligFlag){
                var tariffPrice = json["price"];
                var discountPrice = ((parseInt(tariffPrice)*20)/100);
                discountPrice = Math.floor(discountPrice);
                // 12M tariffs are not eligible for 18M and 24M Loyalty Discounts
                addTarifftoLoyaltyDicount(discountPrice,file,json["commitmentLength"]);
            }
            //console.log(jsonFiles.length +"..."+ fileIndex);
            if(jsonFiles.length === fileIndex){
                   updateLoyaltyDiscounts();
            }
        });

    });
}

function addTarifftoLoyaltyDicount(discountFactor,file,commitmentPeriod){
   var planIndex = file.indexOf("\plan");
   var planPath = file.substr(planIndex-1);
   planPath = planPath.replace(/\\/g,'/');
   var modiPath = "'"+planPath+"'";
   var pathOneIden = '${idOf(';
   var pathTwoIden = ')}';
   var tariffPath = pathOneIden+modiPath+pathTwoIden;
   var loyaltyEntry = {
       "id": tariffPath
   }; 
   for(var count =0; count<discountFactor;count++){
        var loyalty12MJSON = loyaltyDiscounts12MContainer[count]["json"],
            loyalty18MJSON = loyaltyDiscounts18MContainer[count]["json"],
            loyalty24MJSON = loyaltyDiscounts24MContainer[count]["json"];
            loyalty12MJSON["tariffs"].push(loyaltyEntry);
            loyaltyDiscounts12MContainer[count]["modifiedpaths"].push(loyaltyEntry["id"]);
            if(commitmentPeriod != "P12M"){
              loyalty18MJSON["tariffs"].push(loyaltyEntry);
              loyalty24MJSON["tariffs"].push(loyaltyEntry);
              loyaltyDiscounts18MContainer[count]["modifiedpaths"].push(loyaltyEntry["id"]);
              loyaltyDiscounts24MContainer[count]["modifiedpaths"].push(loyaltyEntry["id"]);
            }
   }
}

function updateLoyaltyDiscounts(){
    var length12M = loyaltyDiscounts12MContainer.length,length18M = loyaltyDiscounts18MContainer.length,length24M = loyaltyDiscounts24MContainer.length;
    //console.log(".."+length12M+".."+length18M+".."+length24M);
    for(var loyaltyCount = 0;loyaltyCount < length12M;loyaltyCount++){
        var obj = loyaltyDiscounts12MContainer[loyaltyCount];
        var newContent = JSON.stringify(obj["json"]);
        convertBacktoOriginalState(newContent,obj["filename"],obj["modifiedpaths"]);
        
        obj = loyaltyDiscounts18MContainer[loyaltyCount];
        newContent = JSON.stringify(obj["json"]);
        convertBacktoOriginalState(newContent,obj["filename"],obj["modifiedpaths"]);
        
        obj = loyaltyDiscounts24MContainer[loyaltyCount];
        newContent = JSON.stringify(obj["json"]);
        convertBacktoOriginalState(newContent,obj["filename"],obj["modifiedpaths"]);
    }
    
    /*for(var loyaltyCount = 0;loyaltyCount < length18M;loyaltyCount++){
        var obj = loyaltyDiscounts12MContainer[loyaltyCount];
        var newContent = JSON.stringify(obj["json"]);
        convertBacktoOriginalState(newContent,obj["filename"],obj["modifiedpaths"]);
    }
    
    for(var loyaltyCount = 0;loyaltyCount < length24M;loyaltyCount++){
        var obj = loyaltyDiscounts12MContainer[loyaltyCount];
        var newContent = JSON.stringify(obj["json"]);
        convertBacktoOriginalState(newContent,obj["filename"],obj["modifiedpaths"]);
    }*/
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
