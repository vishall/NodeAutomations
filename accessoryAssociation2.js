/* This Script will valoidate the Device PayG and Pay Monthly Prices */
/* Please fill the below information before runing the script */

var prodCatURL = 'D:/Kanban/Projects_Gali/ProdCat/productCatalogueData_Master/catalogueData/',
    associationSheetURL = 'D:/Kanban/Projects_Gali/NodeJS/ExcelOutput/accy_Association.xlsx',
    accySKUCell = 'A', accyAssociationContainer = [], accyAssociationContainerLength;
    

/* Do not modify the below script if you are not sure about the changes*/


var fs = require('fs'), XLSX = require('xlsx'),excelbuilder = require('excel4node'),
         recursive = require('recursive-readdir'),beautify = require('js-beautify'),
         prettyjson = require('prettyjson'),modifiedFileCount =0;
var pathRegExp = /\$\{(.*?)\}/g;
var modifiedPathregExp = /\"\$\{(.*?)\"\}/g;


require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


function loadAccyAssociations(){
    try{
        var workbook = XLSX.readFile(associationSheetURL);
        var sheet_name_list = workbook.SheetNames;
        console.log("Loading Accy Comp Sheet...");
        sheet_name_list.forEach(function(sheetName) {
          if( sheetName === "Sheet1"){
              var worksheet = workbook.Sheets[sheetName];
              var accy_Sheet_SKU_Count = 1;
              for (currentSheet in worksheet) {
                  if(currentSheet[0] === '!') continue;
                  if(currentSheet[0] === 'A'){
                     var currentAccyAssociationMatrix = {
                         "accysku": worksheet[currentSheet].v,
                         "devicesku" :[]
                     }
                     accyAssociationContainer.push(currentAccyAssociationMatrix);
                  }else{
                      accyAssociationContainer[(accyAssociationContainer.length-1)]["devicesku"].push({"sku" : worksheet[currentSheet].v});
                  }
              }
              //console.log(accyAssociationContainer);
          }
              
       });
  }
  catch(e){
        console.log("Oops.......");
        console.log("Something is wrong with Accys Association Price sheet");
        console.log(e);
  }
}

function loadProdCatFiles(){
     try{
        var prodCatDeviceURL = prodCatURL+"/device/";
         accyAssociationContainerLength = accyAssociationContainer.length;
        recursive(prodCatDeviceURL, function (err, files) {
            if(!err && files.length){
                    var jsonFileCount = 0;
                    var index = 0;
                    console.log("Loading Accy JSON files.....");
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
                            index++;
                      }else{
                            var json = JSON.parse(newContent);
                            index++;   
                     }
                     
                     getDeviceFilePath(file,json);
                    if(jsonFiles.length === index) { associateAccessories();}
                     
                    });
            }else{
                    console.log("Oops.......");
                    console.log("Error in the ProdCat URL")   
            }
        });
    }
    catch(e){
        console.log("Oops.......");
        console.log("Something is wrong with ProdCat URL");
    }
}

function getDeviceFilePath(fileName,json){
         for(var accyAssociationContainerCount = 0; accyAssociationContainerCount<accyAssociationContainerLength;accyAssociationContainerCount++){
                        var deviceSKUObject = accyAssociationContainer[accyAssociationContainerCount]["devicesku"],deviceSKUObjectLength = accyAssociationContainer[accyAssociationContainerCount]["devicesku"].length;
                        for(var deviceSKUObjectCount =0;deviceSKUObjectCount<deviceSKUObjectLength ;deviceSKUObjectCount++){
                             if(deviceSKUObject[deviceSKUObjectCount]["sku"] === json["sku"]["code"]){
                               //  console.log(fileName);
                               var deviceFileName = fileName.substr((fileName.indexOf("catalogueData"))+13); 
//console.log("\\"+deviceFileName);
                               deviceFileName = deviceFileName.replace(/\\/g,'/','g');
                               deviceSKUObject[deviceSKUObjectCount]["url"] = deviceFileName; 
                             }
                        }                
         }
}

function associateAccessories(){
    try{
        var prodCatAccyURL = prodCatURL+"/accessories/";
        recursive(prodCatAccyURL, function (err, files) {
            if(!err && files.length){
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
                               var regExpCheck = new RegExp(escapeRegExp(uniqueArray[jCount]),"g"); //console.log(uniqueArray[jCount]);
                               newPathsContainer.push(uniqueArray[jCount]);
                               newContent = newContent.replace(regExpCheck,newPathValue);
                               var doubleQuoteRegEx = new RegExp(escapeRegExp('""$'),"g");
                            }
                            var json = JSON.parse(newContent);
                            index++;
                      }else{
                            var json = JSON.parse(newContent);
                            index++;   
                     }
                     
                     for(var accyAssociationContainerCount = 0; accyAssociationContainerCount<accyAssociationContainerLength;accyAssociationContainerCount++){
                        if(accyAssociationContainer[accyAssociationContainerCount]["accysku"] === json["sku"]["code"]){
                            addDeviceFilestoAccy(json,accyAssociationContainerCount,file,newPathsContainer);
                            break;
                        }
                     }
                     //if(jsonFiles.length === index)  associateAccessories();
                     
                    });
            }else{
                    console.log("Oops.......");
                    console.log("Error in the ProdCat URL")   
            }
        });
    }
    catch(e){
        console.log("Oops.......");
        console.log("Something is wrong with associateAccessories ");
    }
}

function addDeviceFilestoAccy(accyJSON,count,file,newPathsContainer){
    var devicePathsObject = accyAssociationContainer[count]["devicesku"];
    for(var devicePathsObjectCount= 0;devicePathsObjectCount<devicePathsObject.length;devicePathsObjectCount++){
        accyJSON["recommendedForPhones"].push("${linkTo('"+devicePathsObject[devicePathsObjectCount]["url"]+"')}");
       // console.log("${linkTo('"+devicePathsObject[devicePathsObjectCount]["url"]+"')}");
        newPathsContainer.push("${linkTo('"+devicePathsObject[devicePathsObjectCount]["url"]+"')}");
    }
    console.log("-------------------");
    console.log(newPathsContainer);
     var fileNewContent = JSON.stringify(accyJSON);
     convertBacktoOriginalState(fileNewContent,file,newPathsContainer);
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
    
    newContent = beautify(newContent, { indent_size: 3, "preserve_newlines": false ,"keep_array_indentation": true });
    for(var jCount =0;jCount<newPathsContainer.length;jCount++){
               var oldPathValue = '"'+newPathsContainer[jCount]+'"';  
               var regExpCheck = new RegExp(escapeRegExp(oldPathValue),"g");
               newContent = newContent.replace(regExpCheck,newPathsContainer[jCount]);
    }
    writeToFile(file,newContent);  
    
}

// Main Function for the Application
(function(){
    console.log("Application has started");
    loadAccyAssociations();
    loadProdCatFiles();
    //console.log(tariffCollectionTRS);
})();

