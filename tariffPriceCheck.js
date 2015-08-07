//THis is for checking PID prices Vs Tariffs Prices in ProdCat

var fs = require('fs');

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var recursive = require('recursive-readdir');

var xters ;
var regExp = /"productID"(.*),/;
var priceRegExp = /"price"(.*),/;
var gbpRegExp = /"GBP"(.*),/;

/*module.exports = {

checkTariffPrices : function(res) {*/
   
    
recursive('D:/Kanban/Projects_Gali/prodCatData_Master_May_28_Release/catalogueData/plan/monthly_2015/may/', function (err, files) {
    var fileCount = 0;
    var index = 0;
    PriceDuplicates = [];
    var myArray = [],guid_Collection = [];
    files.filter(function(file) { return file.substr(-5) === '.json'; })
          .forEach(function(file) {
        var xters = require(file);
        myArray = xters.match(priceRegExp);
        var items = myArray[0].split(':');
        var itemPrices =  items[1].split('"');
        myArray = xters.match(regExp);
        var items = myArray[0].split('"');
        var PID = items[3];
        var pidSplit =  PID.indexOf('GBP');
        var pidGBPStr = PID.substr(pidSplit);
        var pidGBPSubStr = pidGBPStr.split(':');
        var pidPrice = null;
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
        if(pidPrice == null){
            console.log("PID Price is :"+pidPrice);
          
        }
        
        index++;
        if(myArray != null) {
            var obj = {
                  pid : PID,
                  pidPrice : pidPrice,
                  price:parseFloat(itemPrices[1])
            }
            guid_Collection.push(obj);
        } else {
            console.log("No file  match found!");
            console.log(file);
            PriceDuplicates.push("No PID found for "+file);
        }
        if(files.length === index){
            //console.log("Success");
           // console.log(guid_Collection);
           //console.log(guid_Collection.length);
            verifyPIDPrices(guid_Collection);
            PriceDuplicates.push("Thats...It");
            //console.log(that.PriceDuplicates);
            console.log("Thats...It");
            //var resultArray = PriceDuplicates.splice(0,PriceDuplicates.length);
            // res.send(PriceDuplicates);
           // console.log("gooood");
            //PriceDuplicates.splice(0,PriceDuplicates.length)
             PriceDuplicates.length = 0;
        }
    })
    
});



function verifyPIDPrices(collection){
    var collectionLength = collection.length;
       for(var i=0;i<collectionLength;i++){ //console.log(collection[i].id);
          if(collection[i].pidPrice != collection[i].price){
            console.log("Price is different for "+collection[i].pid+"--> PID price is "+collection[i].pidPrice+" Tariff Price is  "+collection[i].price);
           // console.log(collection[i].pidPrice);
           // console.log(collection[i].price) ; 
            PriceDuplicates.push("Price is different for "+collection[i].pid+"--> PID price is "+collection[i].pidPrice+" Tariff Price is  "+collection[i].price);
          }else{
            //console.log("No Duplicate Match"+i);  
          }
       }
}
    //console.log(result);
    //return result;

/*}
   
};*/
