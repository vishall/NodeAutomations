/* This Script will valoidate the Device PayG and Pay Monthly Prices */
/* Please fill the below information before runing the script */
var prodCatURL = 'D:/KanBanRepo/productCatalogueData_Master/catalogueData/',
    associationSheetURL = 'D:/NodeAutomations-master/input/accyEol.xlsx',
    accySKUCell = 'A',
    accyNoMatchesContainer = [],
    newaccySKUsCollection = [],
    accySKUsCollection = [],
    accyAssociationContainerLength, payMTab_Min_Count = 1,
    payMTab_Max_Count = 23;


/* Do not modify the below script if you are not sure about the changes*/


var fs = require('fs'),
    XLSX = require('xlsx'),
    excelbuilder = require('excel4node'),
    recursive = require('recursive-readdir'),
    beautify = require('js-beautify'),
    prettyjson = require('prettyjson'),
    modifiedFileCount = 0;
var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;


require.extensions['.json'] = function(module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function loadMerchPrices() {
    try {
        cashPriceCollection = [], paygPriceCollection = [];
        var workbook = XLSX.readFile(associationSheetURL);
        var sheet_name_list = workbook.SheetNames;
        console.log("Loading merchandising Pricing Sheet...");
        sheet_name_list.forEach(function(y) {

            if (y === "Sheet1") {
                var worksheet = workbook.Sheets[y];
                for (z in worksheet) {
                    if (payMTab_Min_Count <= payMTab_Max_Count) {
                        if (z[0] === '!') continue;
                        var skuCell = accySKUCell + payMTab_Min_Count;

                        accySKUsCollection.push(worksheet[skuCell].v);
                        payMTab_Min_Count++;
                    }
                }
            }
        });
    } catch (e) {
        console.log("Oops.......");
        console.log("Something is wrong with Merch Price sheet");
        console.log(e);
    }
}
var matchCount = 0;

function loadProdCatFiles() {
    try {
        var prodCatDeviceURL = prodCatURL + "/accessories/";
        //accyAssociationContainerLength = accyAssociationContainer.length;
        newaccySKUsCollection = accySKUsCollection.slice();
        var accySKUsCollectionLength = accySKUsCollection.length;
        //console.log(accySKUsCollectionLength);
        recursive(prodCatDeviceURL, function(err, files) {
            if (!err && files.length) {
                var jsonFileCount = 0;
                var index = 0;
                console.log("Loading Accy JSON files.....");
                var jsonFiles = files.filter(function(file) {
                    jsonFileCount++;
                    return file.substr(-5) === '.json';
                })
                jsonFiles.forEach(function(file) {
                    //console.log(file);
                    var content = require(file);
                    var newContent = content;
                    var newSearch = newContent.match(pathRegExp);
                    var newPathsContainer = [];
                    if (newSearch != null) {
                        var uniqueArray = newSearch.filter(function(elem, pos) {
                            return newSearch.indexOf(elem) == pos;
                        });
                        for (var jCount = 0; jCount < uniqueArray.length; jCount++) {
                            var newPathValue = '"' + uniqueArray[jCount] + '"';
                            var regExpCheck = new RegExp(escapeRegExp(uniqueArray[jCount]), "g");
                            newPathsContainer.push(uniqueArray[jCount]);
                            newContent = newContent.replace(regExpCheck, newPathValue);
                            var doubleQuoteRegEx = new RegExp(escapeRegExp('""$'), "g");
                        }
                        var json = JSON.parse(newContent);
                        index++;
                    } else {
                        var json = JSON.parse(newContent);
                        index++;
                    }
                    (function() {
                        for (var accySKUsCollectionCount = 0; accySKUsCollectionCount < accySKUsCollectionLength; accySKUsCollectionCount++) {
                            //console.log(accySKUsCollection[accySKUsCollectionCount]);
                            //if(accySKUsCollection[accySKUsCollectionCount] == "AKOFSVBN") console.log("Got it");
                            (function() {
                                if (accySKUsCollection[accySKUsCollectionCount] == json["sku"]["code"]) {
                                    matchCount++;
                                    newaccySKUsCollection[accySKUsCollectionCount] = null;
                                    makeAccessoryEOL(json, file, newPathsContainer);
                                    //console.log(matchCount);
                                    //console.log(matchCount);
                                    // break;
                                } else if (accySKUsCollectionCount == (accySKUsCollectionLength - 1)) {
                                    accyNoMatchesContainer.push(accySKUsCollection[accySKUsCollectionCount]);

                                    /* var uniqueArray = accyNoMatchesContainer.filter(function(elem, pos,arr) {
                                                         return arr.indexOf(elem) == pos;
                                                       });*/

                                    //console.log(accySKUsCollection.length);
                                    //console.log("No match for:: "+accySKUsCollection[accySKUsCollectionCount]);
                                }
                            })();
                        }
                    })(json, file, newPathsContainer);

                });
            } else {
                console.log("Oops.......");
                console.log("Error in the ProdCat URL")
            }
        });
    } catch (e) {
        console.log("Oops.......");
        console.log("Something is wrong with ProdCat URL");
    }
}

function makeAccessoryEOL(accyJSON, file, newPathsContainer) {

    accyJSON["channelPermissions"]["ConsumerUpgrade"] = "Hidden";
    accyJSON["channelPermissions"]["VoiceNew"] = "Hidden";
    accyJSON["channelPermissions"]["VoiceUpgrade"] = "Hidden";
    accyJSON["lifecycle"]["status"] = "EndOfLife";
    accyJSON["stock"] = "OutOfStock";


    if (accyJSON["id"] == accyJSON["leadModelInFamily"]) {
        accyJSON["channelPermissions"]["ConsumerNew"] = "Buyable";
    } else {
        accyJSON["channelPermissions"]["ConsumerNew"] = "Hidden";
    }


    var fileNewContent = JSON.stringify(accyJSON);
    convertBacktoOriginalState(fileNewContent, file, newPathsContainer);
}


function writeToFile(file, content) {
    fs.writeFile(file, content, function(err) {
        if (err) {
            console.log(err);
        } else {
            modifiedFileCount++;
            console.log("Modified Files" + modifiedFileCount);
            var uniqueArray = newaccySKUsCollection.filter(function(elem, pos, arr) {
                return arr.indexOf(elem) == pos;
            });
            //console.log("..................");
            console.log(uniqueArray);
            // console.log("-----------");

        }
    });

}


function convertBacktoOriginalState(newContent, file, newPathsContainer) {
    var originalState;

    newContent = beautify(newContent, {
        indent_size: 3,
        "preserve_newlines": false,
        "keep_array_indentation": true
    });
    for (var jCount = 0; jCount < newPathsContainer.length; jCount++) {
        var oldPathValue = '"' + newPathsContainer[jCount] + '"';
        var regExpCheck = new RegExp(escapeRegExp(oldPathValue), "g");
        newContent = newContent.replace(regExpCheck, newPathsContainer[jCount]);
    }
    writeToFile(file, newContent);

}

// Main Function for the Application
(function() {
    console.log("Application has started");
    loadMerchPrices();
    loadProdCatFiles();

    //console.log(tariffCollectionTRS);
})();
