//THis Script builds tariff JOSN files based on the TRS Provided

//Global Modules declaration
var beautify = require('js-beautify'), XLSX = require('xlsx'),
    excelbuilder = require('excel4node'),fs = require('fs'),
    prettyjson = require('prettyjson'),recursive = require('recursive-readdir'),
    mkdirp = require('mkdirp'),filePath = "D:/Kanban/Projects_Gali/ProdCat/productCatalogueData_Master/catalogueData/plan/monthly_2015/Oct/",
    trsPath = "D:/Kanban/Projects_Gali/Tariffs/Oct/v1.0 October Tariff Drop TRS BASELINE.xlsx";

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
    
    
function convertBacktoOriginalState(tariffFileName, tariffFileContent){
    try{
        var boltonRelationsCon = tariffFileContent["relationships"];
        var tariffContent = beautify(JSON.stringify(tariffFileContent), { indent_size: 2 });
        (function(){
        for(var boltonRelationsConCount=0; boltonRelationsConCount < boltonRelationsCon.length ; boltonRelationsConCount++){
            var boltonRelObj = boltonRelationsCon[boltonRelationsConCount]["id"];
            boltonRelObj = '"'+boltonRelObj+'"';
            boltonRelPath = boltonRelObj.split('"')[1];
            var regExpCheck = new RegExp(escapeRegExp(boltonRelObj),"g");
            tariffContent = tariffContent.replace(regExpCheck,boltonRelPath);
        }
        //console.log("Writing tariff content to files");
        writeToFile(tariffFileName,tariffContent);
        })();
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
        
        var workbook = XLSX.readFile(trsPath);
        var tariffRows_Min_Count = 2,tariffRows_Max_Count =37;
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
                              "productName" : worksheet['BM'+tariffRows_Min_Count].v,
                              "CFA" : worksheet['AZ'+tariffRows_Min_Count].v,
                              "AFA" : worksheet['BA'+tariffRows_Min_Count].v,
                              "CFU" : worksheet['BB'+tariffRows_Min_Count].v,
                              "AFU" : worksheet['BC'+tariffRows_Min_Count].v,
                              "guid" : worksheet['FA'+tariffRows_Min_Count].v,
                              "pid" : worksheet['EZ'+tariffRows_Min_Count].v,
                              "altPID" : altPID
                          }
                          tariffCollectionTRS.push(tariffRow);
                          tariffRows_Min_Count++; 
                      }
              }
          } 
        });
        console.log("TRS information has been loaded");
    }
    catch(e){
       console.log(".......Error in readTRSInformation block......"+tariffRows_Min_Count);
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
  "fourGCapable": true,
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
    var tariffFileName = "",filePath = "D:/Kanban/Projects_Gali/ProdCat/productCatalogueData_Master/catalogueData/plan/monthly_2015/Oct/";
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
        else   tariffFileName = tariffData["minutes"]+"m-";
            
        if(tariffData["tariffType"] == "Standard Handset") 
             tariffFileName = tariffFileName + ""+tariffData["duration"]+"-"+ tariffData["data"]+tariffData["MB/GB"]+"-mbb"+"-"+parseFloat(tariffData["cost"]).toFixed(2)+"gbp";
        else
             tariffFileName = tariffFileName + ""+tariffData["duration"]+"-"+ tariffData["data"]+tariffData["MB/GB"]+"-"+tariffData["tariffType"]+"-"+parseFloat(tariffData["cost"]).toFixed(2)+"gbp";
    }



    tariffFileName = tariffFileName.replace(".","-");
    tariffFileName = tariffFileName.toLocaleLowerCase();
        if(tariffData["data"] == "sharing data"){
             tariffFileName = tariffFileName.replace("sharing datagb","shared-data");
              tariffFileName = tariffFileName.replace("sharing datamb","shared-data");
        }
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
    else if(trsRowData["4G"] == "N/A") newTariffJSON["fourGCapable"] = true;
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
           newFinalTariffJSON = generateRefreshDataTariff(trsRowData,newTariffJSON);
       }else{
           newFinalTariffJSON = generateRefreshVoiceTariff(trsRowData,newTariffJSON);
       }
    }
    else if(trsRowData["tariffType"] == "Standard Handset"){
        if(trsRowData["voiceOrData"] == "Data Only"){
           newFinalTariffJSON = generateStandardDataTariff(trsRowData,newTariffJSON);
       }else{
           newFinalTariffJSON = generateStandardVoiceTariff(trsRowData,newTariffJSON);
       }
    }
    return newFinalTariffJSON;
    
}

function createTariffs(){
    
    var trsRowsLength = tariffCollectionTRS.length;
    console.log("Creating tariff files now.."+trsRowsLength);
    for(var rowsCount = 0; rowsCount < trsRowsLength; rowsCount++){
            var folderObj = prepareFileName(tariffCollectionTRS[rowsCount]);
            var newTariffGen = generateTariff(tariffCollectionTRS[rowsCount]);
            (function(folderPath,tariffFileName,tariffContentData){
                mkdirp(folderPath, function(err) {
                    var tfNmae = folderPath+"/"+tariffFileName+".json";
                    convertBacktoOriginalState(tfNmae, tariffContentData);

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
   }, {
     "id": "${idOf('/boltons/retention-200-mins.json')}"
   },{
     "id": "${idOf('/boltons/europe-my-europe-extra.json')}"
    },{
         "id": "${idOf('/billCredits/150.json')}"
  }];

function boltonsMapRelGen(boltonRelMappingArray){
    var boltonsRelArray = [];
    for(var boltonRelMappingArrayCount =0;boltonRelMappingArrayCount<boltonRelMappingArray.length;boltonRelMappingArrayCount++){

        var boltonIndex = boltonRelMappingArray[boltonRelMappingArrayCount];
        if(boltonIndex !=14)
            boltonsRelArray.push({ "type": "bolton","id":tariffBoltonRelationShipCon[boltonIndex]["id"]});
        else
            boltonsRelArray.push({ "type": "billcredit","id":tariffBoltonRelationShipCon[boltonIndex]["id"]});
    }
    return boltonsRelArray;
}

function generateSIMOVoiceTariff(trsTariffData,tariffStructureJSON){
    
    var tariffProduct = tariffStructureJSON,boltonRelMapping = [];
    tariffProduct["type"] = "SimOnly";
    tariffProduct["subType"] = "Voice";
    tariffProduct["family"] = "Standard";
    var minutesString = trsTariffData["minutes"].toString();
    tariffProduct["callTime"] = {
          "value"  :  minutesString,
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
            }]
    };
    
    if(trsTariffData["sharingType"] != "Secondary"){
         var dataCapacity = trsTariffData["data"];
                switch(dataCapacity){
                     case 100:
                     case 200:
                     case 300:
                        boltonRelMapping = [0,1,11,10,6,4,3,5,7,8,9,2];
                        break;
                     case 500:
                        boltonRelMapping = [11,10,6,4,3,5,7,12,8,9,2];
                        break;
                     case 1:
                     case 2:
                     case 3:
                     case 4:
                     case 5:
                     case 6:
                     case 7:
                       boltonRelMapping = [10,6,4,3,5,2];
                       break;
                     case 8:
                     case 9:
                     case 10:
                     case 15:
                     case 20:
                      boltonRelMapping = [10,6,13,4,3,5,2];
                      break;
                      default:
                        boltonRelMapping = [10,6,13,4,3,5,2];
                        break;
                }
        var boltonsMapRelObj = boltonsMapRelGen(boltonRelMapping);
        tariffProduct["relationships"] = boltonsMapRelObj;
    }else{
        boltonRelMapping = [1,6,4,3,5];
        var sharedGuideObj = {
              "productType": "LIT",
              "productId": "O2CN1579N",
              "productName": "Sharer plan set up guide"
        };
        tariffProduct["fulfillmentData"]["otherProducts"].push(sharedGuideObj);
        tariffProduct["extraInformation"] = "Member Sharer Plan "+trsTariffData["productName"];
        var boltonsMapRelObj = boltonsMapRelGen(boltonRelMapping);
        tariffProduct["relationships"] = boltonsMapRelObj;
    }
    return tariffProduct;
}

function generateSIMODataTariff(trsTariffData,tariffStructureJSON){


    var tariffProduct = tariffStructureJSON,boltonRelMapping = [];
    tariffProduct["type"] = "SimOnly";
    tariffProduct["subType"] = "Data";
    tariffProduct["texts"] = trsTariffData["texts"];
    tariffProduct["data"] = trsTariffData["data"]+trsTariffData["MB/GB"];
    tariffProduct["fulfillmentData"] = {
            "productType": "POT",
            "productName": trsTariffData["productName"],
            "productID": trsTariffData["pid"],
            "otherProducts": [{
              "productType": "POS",
              "productId": "24GTRIVN",
              "productName": "Pay Monthly Triple SIM"
            }]
    };

    if(trsTariffData["sharingType"] != "Secondary"){

    }else{
        boltonRelMapping = [];
        var sharedGuideObj = {
              "productType": "LIT",
              "productId": "O2CN1579N",
              "productName": "Sharer plan set up guide"
        };
        tariffProduct["fulfillmentData"]["otherProducts"].push(sharedGuideObj);
        tariffProduct["extraInformation"] = "Member Sharer Plan "+trsTariffData["productName"];
        tariffProduct["data"] = "Shared Data";
    }
    return tariffProduct;
}


function generateRefreshVoiceTariff(trsTariffData,tariffStructureJSON){


    var tariffProduct = tariffStructureJSON,boltonRelMapping = [];
    tariffProduct["type"] = "Refresh";
    tariffProduct["subType"] = "Voice";
    tariffProduct["family"] = "O2Refresh";
    tariffProduct["alternativeProductID"] = trsTariffData["altPID"];
    var minutesString = trsTariffData["minutes"].toString();
    tariffProduct["callTime"] = {
          "value"  :  minutesString,
          "unit"   : "minutes"
    };
    tariffProduct["texts"] = trsTariffData["texts"];

    tariffProduct["fulfillmentData"] = {
            "productType": "POT",
            "productName": trsTariffData["productName"]
    };

    if(trsTariffData["sharingType"] != "Secondary"){
         var dataCapacity = trsTariffData["data"];
                switch(dataCapacity){
                     case 100:
                     case 200:
                     case 300:
                        boltonRelMapping = [0,1,11,10,6,4,3,5,7,8,9,2];
                        break;
                     case 500:
                        boltonRelMapping = [11,10,6,4,3,5,12,7,8,9,2];
                        break;
                     case 1:
                     case 2:
                     case 3:
                     case 4:
                     case 5:
                     case 6:
                     case 7:
                     case 8:
                     case 9:
                     case 10:
                     case 15:
                     case 20:
                       boltonRelMapping = [10,6,4,3,5,2];
                       break;
                      default:
                        boltonRelMapping = [10,6,4,3,5,2];
                        break;
                }
        var boltonsMapRelObj = boltonsMapRelGen(boltonRelMapping);
        tariffProduct["relationships"] = boltonsMapRelObj;
    }else{
        boltonRelMapping = [6,4,3,5];
        var sharedGuideObj = {
              "productType": "LIT",
              "productId": "O2CN1579N",
              "productName": "Sharer plan set up guide"
        };
        tariffProduct["fulfillmentData"]["otherProducts"] = [];
        tariffProduct["fulfillmentData"]["otherProducts"].push(sharedGuideObj);
        var boltonsMapRelObj = boltonsMapRelGen(boltonRelMapping);
        tariffProduct["relationships"] = boltonsMapRelObj;
        tariffProduct["extraInformation"] = "Member Sharer Plan "+trsTariffData["productName"];
    }

    return tariffProduct;
}


function generateRefreshDataTariff(trsTariffData,tariffStructureJSON){


    var tariffProduct = tariffStructureJSON,boltonRelMapping = [];
    tariffProduct["type"] = "Refresh";
    tariffProduct["subType"] = "Data";
    tariffProduct["callTime"] = {
          "value"  :  trsTariffData["minutes"],
          "unit"   : "minutes"
    };
    tariffProduct["texts"] = trsTariffData["texts"];
    tariffProduct["data"] = trsTariffData["data"]+trsTariffData["MB/GB"];
    tariffProduct["alternativeProductID"] = trsTariffData["altPID"];
    tariffProduct["fulfillmentData"] = {
            "productType": "POT",
            "productName": trsTariffData["productName"]
    };

    if(trsTariffData["sharingType"] != "Secondary"){

    }else{
        boltonRelMapping = [0,3];
        var sharedGuideObj = {
              "productType": "LIT",
              "productId": "O2CN1579N",
              "productName": "Sharer plan set up guide"
        };
        tariffProduct["fulfillmentData"]["otherProducts"] = [];
        tariffProduct["fulfillmentData"]["otherProducts"].push(sharedGuideObj);
        var boltonsMapRelObj = boltonsMapRelGen(boltonRelMapping);
        tariffProduct["relationships"] = boltonsMapRelObj;
        tariffProduct["data"] = "Shared Data";
        tariffProduct["extraInformation"] = "Member Sharer Plan "+trsTariffData["productName"];
    }
    return tariffProduct;
}


function generateStandardVoiceTariff(trsTariffData,tariffStructureJSON){



    var tariffProduct = tariffStructureJSON,boltonRelMapping = [];
    tariffProduct["type"] = "Standard";
    tariffProduct["subType"] = "Voice";
    tariffProduct["family"] = "Standard";
    var minutesString = trsTariffData["minutes"].toString();
    tariffProduct["callTime"] = {
          "value"  :  minutesString,
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
            }]
    };

    if(trsTariffData["sharingType"] != "Secondary"){
         var dataCapacity = trsTariffData["data"];
                switch(dataCapacity){
                     case 100:
                     case 200:
                     case 300:
                        boltonRelMapping = [0,1,11,10,6,4,3,5,7,8,9,2,14];
                        break;
                     case 500:
                        boltonRelMapping = [11,10,6,4,3,5,12,7,8,9,2,14];
                        break;
                     case 1:
                     case 2:
                     case 3:
                     case 4:
                     case 5:
                     case 6:
                     case 7:
                       boltonRelMapping = [10,6,4,3,5,2,14];
                       break;
                     case 8:
                     case 9:
                     case 10:
                     case 15:
                     case 20:
                     case 30:
                       boltonRelMapping = [10,6,13,4,3,5,2,14];
                      break;
                     default:
                        boltonRelMapping = [10,6,13,4,3,5,2,14];
                        break;
                }
        var boltonsMapRelObj = boltonsMapRelGen(boltonRelMapping);
        tariffProduct["relationships"] = boltonsMapRelObj;
    }else{
        boltonRelMapping = [];
        var sharedGuideObj = {
              "productType": "LIT",
              "productId": "O2CN1579N",
              "productName": "Sharer plan set up guide"
        };
        tariffProduct["fulfillmentData"]["otherProducts"] = [];
        tariffProduct["fulfillmentData"]["otherProducts"].push(sharedGuideObj);
       // var boltonsMapRelObj = boltonsMapRelGen(boltonRelMapping);
        //tariffProduct["relationships"] = boltonsMapRelObj;
        tariffProduct["extraInformation"] = "Member Sharer Plan "+trsTariffData["productName"];
    }
    return tariffProduct;
}


function generateStandardDataTariff(trsTariffData,tariffStructureJSON){


    var tariffProduct = tariffStructureJSON,boltonRelMapping = [];
    tariffProduct["type"] = "Standard";
    tariffProduct["subType"] = "Data";
    tariffProduct["data"] = trsTariffData["data"]+trsTariffData["MB/GB"];
    tariffProduct["texts"] = trsTariffData["texts"];

    tariffProduct["fulfillmentData"] = {
            "productType": "POT",
            "productName": trsTariffData["productName"],
            "productID": trsTariffData["pid"],
            "otherProducts": [{
              "productType": "POS",
              "productId": "24GTRIVN",
              "productName": "Pay Monthly Triple SIM"
            }]
    };

    if(trsTariffData["sharingType"] != "Secondary"){

    }else{
        boltonRelMapping = [];
        var sharedGuideObj = {
              "productType": "LIT",
              "productId": "O2CN1579N",
              "productName": "Sharer plan set up guide"
        };
        tariffProduct["fulfillmentData"]["otherProducts"].push(sharedGuideObj);
        //var boltonsMapRelObj = boltonsMapRelGen(boltonRelMapping);
        //tariffProduct["relationships"] = boltonsMapRelObj;
        tariffProduct["extraInformation"] = "Member Sharer Plan "+trsTariffData["productName"];
        tariffProduct["data"] = "Shared Data";
    }
    return tariffProduct;
}

// Main Function for the Application
(function(){
    console.log("Application has started");
    readTRSInformation();
    createTariffs();
    console.log("Tariffs are available in the "+filePath+" folder now");
    //console.log("Modified files created ..."+modifiedFileCount);
})();
