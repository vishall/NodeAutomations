//THis Script builds tariff JOSN files based on the TRS Provided

//Global Modules declaration
var beautify = require('js-beautify'), XLSX = require('xlsx'),
    excelbuilder = require('excel4node'),fs = require('fs'),
    prettyjson = require('prettyjson'),recursive = require('recursive-readdir'),
    mkdirp = require('mkdirp');

var options = {
  noColor: true
};

//JSON Parsing Parser functions
var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;

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

function convertToProperJSON(file){
     try{
         var properJSONObj;
         var fileContent =  require(file);
         var fileSearchResults = fileContent.match(pathRegExp);
         var dollarPathsContainer = [];
         var convertedJSON = null; 
         if(fileSearchResults != null){
            var uniqueArray = fileSearchResults.filter(function(elem, pos) {
                return fileSearchResults.indexOf(elem) == pos;
            }); 

            for(var jCount =0;jCount<uniqueArray.length;jCount++){
               var dollarJSONPathValue = '"'+uniqueArray[jCount]+'"';  
               var regExpCheck = new RegExp(escapeRegExp(uniqueArray[jCount]),"g");
               dollarPathsContainer.push(uniqueArray[jCount]);
               fileContent = fileContent.replace(regExpCheck,dollarJSONPathValue);
               var doubleQuoteRegEx = new RegExp(escapeRegExp('""$'),"g");
            }
            convertedJSON = JSON.parse(fileContent);
        }
        else{
            convertedJSON = JSON.parse(fileContent);
        }  
        properJSONObj = {
           json : convertedJSON,
           file : file,
           pathsContainer : dollarPathsContainer
        }
       return properJSONObj;   
   }
    catch(e){
       console.log(".......Error in convertToProperJSON block......");
       console.log(".......Error is....");
       console.log(e);
    }
}
    
    
function convertBacktoOriginalState(newContent,file,newPathsContainer){
    try{
        var originalState;

        newContent = beautify(newContent, { indent_size: 1 });
        for(var jCount =0;jCount<newPathsContainer.length;jCount++){
                   var oldPathValue = '"'+newPathsContainer[jCount]+'"';  
                   var regExpCheck = new RegExp(escapeRegExp(oldPathValue),"g");
                   newContent = newContent.replace(regExpCheck,newPathsContainer[jCount]);
        }
        writeToFile(file,newContent);  
    }
    catch(e){
       console.log(".......Error in convertBacktoOriginalState block......");
       console.log(".......Error is....");
       console.log(e);
    }
}

//Writing JSON Data to File
var modifiedFileCount = 0;
function writeToFile(file,content){
  try{
      fs.writeFile(file, content, function(err) {
        if(err) {
            console.log(err);
        } else {
            modifiedFileCount++;
            //console.log("Modified Files"+modifiedFileCount);
        }
      }); 
  }
  catch(e){
      console.log(".......Error in writeToFile block......");
      console.log(".......Error is....");
      console.log(e);
    }    
}

// Reading JSON files from ProdCat
require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

function loadJSONFiles(){
    try{
        recursive('D:/Kanban/Projects/prodCataData_Trinity2Shop_March26_Q115/catalogueData/plan/q115/', function (err, files) {
            var jsonFileCount = 0;

            console.log("Reading JSON files.....");
            var jsonFiles = files.filter(function(file) {jsonFileCount++; return file.substr(-5) === '.json'; });
            jsonFiles.forEach(function(file) {
                var convertedJSONObj = convertToProperJSON(file);
                //Do the required Operation on JOSN files
                //modifyChannelPermissions(convertedJSONObj["json"],convertedJSONObj["file"],convertedJSONObj["pathsContainer"]);
            }); 
        });
    }
    catch(e){
       console.log(".......Error in loadJSONFiles block......");
       console.log(".......Error is....");
       console.log(e);
    }
}


// Read the TRS Information
var tariffCollectionTRS = [];
function readTRSInformation(){ 
    try{
        
        var workbook = XLSX.readFile('D:/Kanban/Projects_Gali/Tariffs/July/Copy of v1 3 July Tariff Drop TRS.xlsx');
        var tariffRows_Min_Count = 2,tariffRows_Max_Count =15;
        var sheet_name_list = workbook.SheetNames;
        sheet_name_list.forEach(function(y) {

          if( y === "2. NEW Tariffs"){
              var worksheet = workbook.Sheets[y];
              for (z in worksheet) {
                  if(tariffRows_Min_Count <= tariffRows_Max_Count){
                        if(z[0] === '!') continue;
                         var altPID = null;
                         if(worksheet['FB'+tariffRows_Min_Count]) altPID = worksheet['FB'+tariffRows_Min_Count].v;
                          var tariffRow = {
                              "tariffType" : worksheet['D'+tariffRows_Min_Count].v,
                              "set" : worksheet['G'+tariffRows_Min_Count].v,
                              "sharingType" : worksheet['J'+tariffRows_Min_Count].v,
                              "duration" : worksheet['K'+tariffRows_Min_Count].v,
                              "voiceOrData" : worksheet['L'+tariffRows_Min_Count].v,
                              "cost" : worksheet['N'+tariffRows_Min_Count].v,
                              "minutes" : worksheet['R'+tariffRows_Min_Count].v,
                              "texts" : worksheet['U'+tariffRows_Min_Count].v,
                              "data" : worksheet['W'+tariffRows_Min_Count].v,
                              "MB/GB" : worksheet['X'+tariffRows_Min_Count].v,
                              "4G" : worksheet['AD'+tariffRows_Min_Count].v,
                              "productName" : worksheet['AK'+tariffRows_Min_Count].v,
                              "CFA" : worksheet['AZ'+tariffRows_Min_Count].v,
                              "AFA" : worksheet['BA'+tariffRows_Min_Count].v,
                              "CFU" : worksheet['BB'+tariffRows_Min_Count].v,
                              "AFU" : worksheet['BC'+tariffRows_Min_Count].v,
                              "guid" : worksheet['EZ'+tariffRows_Min_Count].v,
                              "pid" : worksheet['FA'+tariffRows_Min_Count].v,
                              "altPID" : altPID
                          }
                          tariffCollectionTRS.push(tariffRow);
                          tariffRows_Min_Count++; 
                      }
              }
          } 
        }); 
    }
    catch(e){
       console.log(".......Error in readTRSInformation block......");
       console.log(".......Error is....");
       console.log(e);
    }
}


var tariffStructure = {
  "id": "",
  "type": "",
  "subType": "",
  "productID": "",
  "commitmentLength": "",
  "fourGCapable": "",
  "price": "",
  "texts": "",
  "channelPermissions": {
    "ConsumerNew": "Hidden",
    "ConsumerUpgrade": "Hidden",
    "VoiceNew": "Hidden",
    "VoiceUpgrade": "Hidden"
  },
  "fulfillmentData": {
    "productType": "POT",
    "productName": ""
  },
  "relationships": []
}

var tafCount = 0;
function prepareFileName(tariffData){
    var filePath = "D:/Kanban/Projects_Gali/NodeJS/tariffs" ,tariffFileName = "";
    if(tariffData["tariffType"] == "Standard Handset") filePath = filePath+ "/" +tariffData["duration"]+"_"+"standard";
    else filePath = filePath+"/" +tariffData["duration"]+"_"+tariffData["tariffType"];
    
    if(tariffData["voiceOrData"] == "Data Only") filePath = filePath+"_"+"data";
    else filePath = filePath+"_"+"voice";
    
    if(tariffData["sharingType"] == "Non Sharing") filePath = filePath +"/"+"non_sharing";
    else filePath = filePath + "/"+tariffData["sharingType"];
    
    filePath = filePath + "/set"+tariffData["set"];
    
    if(tariffData["voiceOrData"] == "Data Only"){
        if(tariffData["tariffType"] == "Standard Handset") 
             tariffFileName = tariffData["data"]+tariffData["MB/GB"]+"-"+tariffData["duration"]+"-mbb"+"-"+parseFloat(tariffData["cost"]).toFixed(2)+"gbp";
        else
             tariffFileName = tariffData["data"]+tariffData["MB/GB"]+"-"+tariffData["duration"]+"-"+tariffData["tariffType"]+"-"+parseFloat(tariffData["cost"]).toFixed(2)+"gbp";
    }
    else{
        if(tariffData["minutes"] == "Unlimited") tariffFileName = "unltd-";
        else   tariffFileName = tariffData["minutes"]+"m";
            
        if(tariffData["tariffType"] == "Standard Handset") 
             tariffFileName = tariffFileName + "-"+tariffData["duration"]+"-"+ tariffData["data"]+tariffData["MB/GB"]+"-mbb"+"-"+parseFloat(tariffData["cost"]).toFixed(2)+"gbp";
        else
             tariffFileName = tariffFileName + "-"+tariffData["duration"]+"-"+ tariffData["data"]+tariffData["MB/GB"]+"-"+tariffData["tariffType"]+"-"+parseFloat(tariffData["cost"]).toFixed(2)+"gbp";
    }
    
    tariffFileName = tariffFileName.replace(".","-");
    tariffFileName = tariffFileName.toLocaleLowerCase();
   // console.log(tariffFileName);
    tafCount++;
    return { 
            "folderPath" : filePath.toLocaleLowerCase(),
            "fileName" : tariffFileName
    };
    
}

function generateTariff(trsRowData){
    var newTariffJSON = JSON.parse(JSON.stringify(tariffStructure));
    var newFinalTariffJSON= null;
    newTariffJSON["id"] = trsRowData["guid"];
    newTariffJSON["productID"] = trsRowData["pid"];
    newTariffJSON["commitmentLength"] = "P"+trsRowData["duration"];
    
    if(trsRowData["4G"] == "4G") newTariffJSON["fourGCapable"] = true;
    else newTariffJSON["fourGCapable"] = false;
    
    newTariffJSON["price"] = parseFloat(trsRowData["cost"]).toFixed(2);
    newTariffJSON["texts"] = trsRowData["texts"];
    newTariffJSON["fulfillmentData"]["productName"] = trsRowData["productName"];
    
    if(trsRowData["CFA"] == "Y")  newTariffJSON["channelPermissions"]["ConsumerNew"] = "Buyable";
    else  newTariffJSON["channelPermissions"]["ConsumerNew"] = "Hidden"; 
    
    if(trsRowData["CFU"] == "Y") newTariffJSON["channelPermissions"]["ConsumerUpgrade"] = "Buyable";
    else newTariffJSON["channelPermissions"]["ConsumerUpgrade"] = "Hidden";
    
    if(trsRowData["AFA"] == "Y") newTariffJSON["channelPermissions"]["VoiceNew"] = "Buyable";
    else newTariffJSON["channelPermissions"]["VoiceNew"] = "Hidden";
    
    if(trsRowData["AFU"] == "Y") newTariffJSON["channelPermissions"]["VoiceUpgrade"] = "Buyable";
    else newTariffJSON["channelPermissions"]["VoiceUpgrade"] = "Hidden";
    
   // console.log(trsRowData);
    
    if(trsRowData["tariffType"] == "SIMO"){
       if(trsRowData["voiceOrData"] == "Data Only"){
           newFinalTariffJSON = generateSIMODataTariff(trsRowData,newTariffJSON);
       }else{
           newFinalTariffJSON = generateSIMOVoiceTariff(trsRowData,newTariffJSON);
       }
    }
    else if(trsRowData["tariffType"] == "Refresh"){
       if(trsRowData["voiceOrData"] == "Data Only"){
           newFinalTariffJSON = generateSIMODataTariff(trsRowData,newTariffJSON);
       }else{
           newFinalTariffJSON = generateSIMODataTariff(trsRowData,newTariffJSON);
       }
    }
    else if(trsRowData["tariffType"] == "Standard Handset"){
        if(trsRowData["voiceOrData"] == "Data Only"){
           newFinalTariffJSON = generateSIMODataTariff(trsRowData,newTariffJSON);
       }else{
           newFinalTariffJSON = generateSIMODataTariff(trsRowData,newTariffJSON);
       }
    }
    return newFinalTariffJSON;
    
}

function createTariffs(){
    
    var trsRowsLength = tariffCollectionTRS.length;
    
    for(var rowsCount = 0; rowsCount < trsRowsLength; rowsCount++){
            var folderObj = prepareFileName(tariffCollectionTRS[rowsCount]);
            var newTariffGen = generateTariff(tariffCollectionTRS[rowsCount]);
            (function(folderPath,tariffFileName,tariffContentData){   
                mkdirp(folderPath, function(err) { 
                    var tfNmae = folderPath+"/"+tariffFileName+".json"; 
                    var tariffContent = beautify(JSON.stringify(tariffContentData), { indent_size: 2 });
                    
                    writeToFile(tfNmae, tariffContent);
                });
            })(folderObj["folderPath"],folderObj["fileName"],newTariffGen);
           
    }
}

var tariffBoltonRelationShipCon = [{
    "id": "${idOf('/boltons/4g-access-low-end-foc.json')}"
  }, {
    "id": "${idOf('/boltons/4g-access-low-end-gbp5.json')}"
  }, {
    "id": "${idOf('/boltons/your-family-bolt-on.json')}"
  }, {
    "id": "${idOf('/boltons/mms-50.json')}"
  }, {
    "id": "${idOf('/boltons/international-favourites-3.json')}"
  }, {
    "id": "${idOf('/boltons/international-favourites-5.json')}"
  }, {
    "id": "${idOf('/boltons/data-abroad-std.json')}"
  }, {
    "id": "${idOf('/boltons/retention-unlimited-o2-to-o2-calls.json')}"
  }, {
    "id": "${idOf('/boltons/retention-unlimited-landline-calls.json')}"
  }, {
    "id": "${idOf('/boltons/retention-unlimited-weekend-calls.json')}"
  }, {
    "id": "${idOf('/boltons/afu-mms-50-foc.json')}"
  }, {
    "id": "${idOf('/boltons/500m-o2-to-o2-calls.json')}"
  }];

function boltonsMapRelGen(xxxx){
    var boltonsRelArray = [];
    boltonsRelArray.push({"id":tariffBoltonRelationShipCon[0]["id"]});
    boltonsRelArray.push({"id":tariffBoltonRelationShipCon[1]["id"]});
    boltonsRelArray.push({"id":tariffBoltonRelationShipCon[2]["id"]});
    boltonsRelArray.push({"id":tariffBoltonRelationShipCon[3]["id"]});
    boltonsRelArray.push({"id":tariffBoltonRelationShipCon[4]["id"]});
    boltonsRelArray.push({"id":tariffBoltonRelationShipCon[5]["id"]});
    boltonsRelArray.push({"id":tariffBoltonRelationShipCon[6]["id"]});
    
    return boltonsRelArray;
}

function generateSIMOVoiceTariff(trsTariffData,tariffStructureJSON){
    
    var tariffProduct = tariffStructureJSON,boltonRelMapping = [];
    tariffProduct["type"] = "SimOnly";
    tariffProduct["subType"] = "Voice";
    tariffProduct["family"] = "Standard";
    tariffProduct["callTime"] = {
          "value"  :  trsTariffData["minutes"],
          "unit"   : "minutes" 
    };
    tariffProduct["texts"] = trsTariffData["texts"];
    
    tariffProduct["fulfillmentData"] = {
            "productType": "POT",
            "productName": trsTariffData["productName"],
            "productID": trsTariffData["pid"],
            "otherProducts": [{
              "productType": "POS",
              "productId": "24GTRIVN",
              "productName": "Pay Monthly Triple SIM"
            }, {
              "productType": "LIT",
              "productId": "O2WP263N",
              "productName": "Online Welcome Pack"
            }]
    };
    
    if(trsTariffData["sharingType"] != "Secondary"){
         
        var boltonsMapRelObj = boltonsMapRelGen(boltonRelMapping);
        tariffProduct["relationships"] = boltonsMapRelObj;
    }else{
        boltonRelMapping = [0,3,4,5,6];
        var sharedGuideObj = {
              "productType": "LIT",
              "productId": "O2CN1579N",
              "productName": "Sharer plan set up guide"
        };
        tariffProduct["fulfillmentData"]["otherProducts"].push(sharedGuideObj);
        var boltonsMapRelObj = boltonsMapRelGen(boltonRelMapping);
        tariffProduct["relationships"] = boltonsMapRelObj;
        
    }
    return tariffProduct;
}

function generateSIMODataTariff(trsTariffData,tariffStructureJSON){
    var tariffProduct = tariffStructureJSON;
    
    return tariffProduct;
}

// Main Function for the Application
(function(){
    console.log("Application has started");
    readTRSInformation();
    createTariffs();
    //console.log(tariffCollectionTRS);
})();
