//THis Script builds tariff JOSN files based on the TRS Provided

//Global Modules declaration
var beautify = require('js-beautify'), XLSX = require('xlsx'),
    excelbuilder = require('excel4node'),fs = require('fs'),
    prettyjson = require('prettyjson'),recursive = require('recursive-readdir'),
    mkdirp = require('mkdirp'),filePath = "D:/Kanban/Projects_Gali/ProdCat/productCatalogueData_Master/catalogueData/plan/monthly_2015/aug/",
    excelPath = "D:/Kanban/Projects_Gali/NodeAuto/NodeAutomations/ExcelInput/deviceBuild.xlsx";

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

// Read the TRS Information
var deviceDetails = [],deviceModelData;
function readDeviceInformation(){
    try{

        var workbook = XLSX.readFile(excelPath);
        var tariffRows_Min_Count = 2,tariffRows_Max_Count =2;
        var sheet_name_list = workbook.SheetNames;
        sheet_name_list.forEach(function(y) {
          if( y === "Sheet1"){
              var worksheet = workbook.Sheets[y];
              for (z in worksheet) {
                  if(tariffRows_Min_Count <= tariffRows_Max_Count){
                        if(z[0] === '!') continue;
                         var altPID = null;

                           deviceModelData = {
                              "name" : worksheet['C'+tariffRows_Min_Count].v,
                              "SKU" : worksheet['D'+tariffRows_Min_Count].v,
                              "sizes" : worksheet['E'+tariffRows_Min_Count].v,
                              "colors" : worksheet['F'+tariffRows_Min_Count].v,
                              "bluetooth" : worksheet['G'+tariffRows_Min_Count].v,
                              "removablebattery" : worksheet['H'+tariffRows_Min_Count].v,
                              "hdcamera" : worksheet['I'+tariffRows_Min_Count].v,
                              "splashproof" : worksheet['J'+tariffRows_Min_Count].v,
                              "nfc" : worksheet['K'+tariffRows_Min_Count].v,
                              "camera" : worksheet['L'+tariffRows_Min_Count].v,
                              "screen" : worksheet['M'+tariffRows_Min_Count].v,
                              "batterylife" : worksheet['N'+tariffRows_Min_Count].v,
                              "weight" : worksheet['O'+tariffRows_Min_Count].v,
                              "standbytime" : worksheet['P'+tariffRows_Min_Count].v,
                              "dimensions" : worksheet['Q'+tariffRows_Min_Count].v,
                              "frontcamera" : worksheet['R'+tariffRows_Min_Count].v
                          }
                          tariffRows_Min_Count++;
                      }
              }
          }
        });
        console.log("device information has been loaded");
        console.log(deviceModelData);
    }
    catch(e){
       console.log(".......Error in readDeviceInformation block......"+tariffRows_Min_Count);
       console.log(".......Error is....");
       console.log(e);
    }
}


var deviceJSONStructure =
{
  "id": "",
  "subType": "",
  "brand": "",
  "operatingSystem": "",
  "model": "",
  "sortOrdinal": 21,
  "sku": {
    "code": ""
  },
  "stockLimited": false,
  "includeSimInUpgradeOrder": true,
  "channelPermissions": {
    "ConsumerNew": "Buyable",
    "ConsumerUpgrade": "Buyable",
    "VoiceNew": "Buyable",
    "VoiceUpgrade": "Buyable"
  },
  "leadModelInFamily": "",
  "modelFamily": "",
  "stockInfo": {
    "stock": "InStock"
  },
  "disableClickAndCollect": false,
  "4gSupportedOnLaunch": true,
  "4gCapable": true,
  "4gEnabledBuildVersions": ["11A466", "11A470a"],
  "tac": ["35799705", "35799805", "35876105", "35876205", "35854305", "35854605", "35854705"],
  "sellingPoints": [],
  "longDescription": "",
  "images": {
    "orientation": "Portrait",
    "standard": {
      "listSingle": "",
      "details": "",
      "back": "",
      "side": "",
      "tariff": "",
      "basket": ""
    }
  },
  "keyFeatures": [],
  "techSpec": [],
  "replacementCost": "539.00",
  "costToO2": "629.99",
  "cashPrice": "629.99",
  "rrp": "539.00",
  "ccaDefaultDataAllowanceId": "",
  "relationships": [],
  "simType": "Micro",
  "fulfillmentData": {
    "productType": "HAN",
    "productName": "",
    "risk": "2",
    "otherProducts": [{
      "productType": "POS",
      "productId": "24GTRIVN",
      "productName": "Pay Monthly Triple SIM 24GTRIVN SKU"
    }, {
      "productType": "LIT",
      "productId": "O2CN1252N",
      "productName": "LIT O2 Recycle Leaflet O2CN1252N"
    }]
  },
  "promotion": {
  },
  "attachments": [],
  "classification": {
    "colour": {
      "display": "",
      "primary": ""
    },
    "memory": {
      "unit": "GB",
      "value": "",
      "display": ""
    }
  },
  "snippet": "",
  "colourGroup": "",
  "condition": "New",
  "lifecycle": {
    "status": "Active"
  },
  "alternativeDevices" : [],
  "disableClickAndCollectNow": false,
  "ccaProductInformation": "Apple iPhone 6 16GB"
}


var leadModelInformation = {
  "bluetooth": true,
  "removableBattery": false,
  "hdCamera": true,
  "splashProof": false,
  "nfc": true,
  "cameraResolution": {
    "unit": "Megapixels",
    "value": "",
    "display": ""
  },
  "screenSize": {
    "unit": "Inches",
    "value": "",
    "display": ""
  },
  "batteryLife": {
    "unit": "Hours",
    "value": "",
    "display": ""
  },
  "weight": {
    "unit": "Grammes",
    "value": "",
    "display": ""
  }
  };

  var features = {
      "featuredItems": []
  }

  var imageFeatures =
  {
      "featureType": "image",
      "mediaData": {
        "url": "",
        "alignment": "left",
        "text": {
          "heading": "",
          "content": ""
        }
      }
  };

  var textFeatures = {
      "featureType": "text",
      "textData": [{
        "heading": " ",
        "content": "VainGlory is coming to the App Store this autumn. Content not available in all countries. Title availability is subject to change. <sup>1</sup>Compared with the previous generation. <sup>2</sup>Data plan required. 4G LTE is available in selected markets and through selected carriers. Speeds are based on theoretical throughput and vary based on site conditions. For details on 4G LTE support, contact your carrier and see www.apple.com/iphone/LTE. TM and &copy; 2014 Apple Inc. All rights reserved."
      }, {
        "heading": " ",
        "content": "<sup>1</sup>Data plan required. 4G LTE is available in selected markets and through selected carriers. Speeds will vary based on site conditions. For details on 4G LTE support, contact your carrier and see <sup>2</sup>Battery life varies by use and configuration."
      }]
    }

var technicalSpecification = {
    "featuredSpecifications": [{
      "name": "Camera",
      "imageUrl": "https://www.o2.co.uk/shop/homepage/images/shop15/common/spec/ico-tech-spec-screen-camera-bp3.png",
      "description": ""
    }, {
      "name": "Battery life",
      "imageUrl": "https://www.o2.co.uk/shop/homepage/images/shop15/common/spec/ico-tech-spec-screen-battery-bp3.png",
      "description": ""
    }, {
      "name": "Weight",
      "imageUrl": "https://www.o2.co.uk/shop/homepage/images/shop15/common/spec/ico-tech-spec-screen-weight-bp3.png",
      "description": ""
    }, {
      "name": "Screen size",
      "imageUrl": "https://www.o2.co.uk/shop/homepage/images/shop15/common/spec/ico-tech-spec-screen-screen-size-bp3.png",
      "description": ""
    }],
    "techSpec": [{
      "title": "Overall Specification",
      "data": [{
        "canonicalKey": "talk-time",
        "detailsLabel": "Talk Time",
        "comparisonLabel": "Talk Time",
        "displayValue": ""
      }, {
        "canonicalKey": "standby-time",
        "detailsLabel": "Standby Time",
        "comparisonLabel": "Standby Time",
        "displayValue": ""
      }, {
        "canonicalKey": "dimensions",
        "detailsLabel": "Dimensions",
        "comparisonLabel": "Dimensions",
        "displayValue": ""
      }, {
        "canonicalKey": "weight",
        "detailsLabel": "Weight",
        "comparisonLabel": "Weight",
        "displayValue": ""
      }, {
        "canonicalKey": "screen-size",
        "detailsLabel": "Screen Size",
        "comparisonLabel": "Screen Size",
        "displayValue": ""
      }, {
        "canonicalKey": "internal-phone-memory",
        "detailsLabel": "Internal Phone Memory",
        "comparisonLabel": "Internal Phone Memory",
        "displayValue": ""
      }, {
        "canonicalKey": "email-capability",
        "detailsLabel": "Email Capability",
        "comparisonLabel": "Email Capability",
        "displayValue": "Yes"
      }, {
        "canonicalKey": "business-recommended",
        "detailsLabel": "Business Recommended",
        "comparisonLabel": "Business Recommended",
        "displayValue": "Yes"
      }, {
        "canonicalKey": "operating-system",
        "detailsLabel": "Operating System",
        "comparisonLabel": "Operating System",
        "displayValue": ""
      }, {
        "canonicalKey": "splash-proof",
        "detailsLabel": "Splash proof",
        "comparisonLabel": "Splash proof",
        "displayValue": "No"
      }]
    }, {
      "title": "Entertainment",
      "data": [{
        "canonicalKey": "back-camera",
        "detailsLabel": "Back Camera",
        "comparisonLabel": "Back Camera",
        "displayValue": ""
      }, {
        "canonicalKey": "front-camera",
        "detailsLabel": "Front Camera",
        "comparisonLabel": "Front Camera",
        "displayValue": ""
      }, {
        "canonicalKey": "video-capture",
        "detailsLabel": "Video Capture",
        "comparisonLabel": "Video Capture",
        "displayValue": ""
      }, {
        "canonicalKey": "nfc",
        "detailsLabel": "NFC",
        "comparisonLabel": "NFC",
        "displayValue": ""
      }, {
        "canonicalKey": "music-player",
        "detailsLabel": "Music Player",
        "comparisonLabel": "Music Player",
        "displayValue": ""
      }, {
        "canonicalKey": "fm-radio",
        "detailsLabel": "FM Radio",
        "comparisonLabel": "FM Radio",
        "displayValue": ""
      }]
    }, {
      "title": "Connectivity",
      "data": [{
        "canonicalKey": "data-connectivity",
        "detailsLabel": "Data Connectivity",
        "comparisonLabel": "Data Connectivity",
        "displayValue": ""
      }, {
        "canonicalKey": "band-type",
        "detailsLabel": "Band Type",
        "comparisonLabel": "Band Type",
        "displayValue": ""
      }, {
        "canonicalKey": "bluetooth",
        "detailsLabel": "Bluetooth",
        "comparisonLabel": "Bluetooth",
        "displayValue": ""
      }, {
        "canonicalKey": "stereo-bluetooth",
        "detailsLabel": "Stereo Bluetooth",
        "comparisonLabel": "Stereo Bluetooth",
        "displayValue": ""
      }, {
        "canonicalKey": "wi-fi",
        "detailsLabel": "Wi-Fi",
        "comparisonLabel": "Wi-Fi",
        "displayValue": ""
      }, {
        "canonicalKey": "gps",
        "detailsLabel": "GPS",
        "comparisonLabel": "GPS",
        "displayValue": ""
      }, {
        "canonicalKey": "3g",
        "detailsLabel": "3G",
        "comparisonLabel": "3G",
        "displayValue": ""
      }, {
        "canonicalKey": "4g",
        "detailsLabel": "4G",
        "comparisonLabel": "4G",
        "displayValue": ""
      }]
    }]
  }

var tafCount = 0;
function prepareFileName(tariffData){
    var tariffFileName = "",filePath = "D:/Kanban/Projects_Gali/ProdCat/productCatalogueData_Master/catalogueData/device/apple/";

}



function buildDevices(){


}


// Main Function for the Application
(function(){
    console.log("Application has started");
    readDeviceInformation();
    buildDevices();
    //console.log("Tariffs are available in the "+filePath+" folder now");
    //console.log("Modified files created ..."+modifiedFileCount);
})();
