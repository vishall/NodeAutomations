//THis is for checking Duplicates PIDs

var fs = require('fs');

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var recursive = require('recursive-readdir');
var guid_Collection = [],pidDupliactes =[];
var xters ;
var regExp = /"productID"(.*),/;
/*
module.exports = {

checkDupPID : function(res) {*/
    
recursive('D:/Kanban/Projects/prodCat_Trinity2Shop_Q1_Backup_04_03_2015/catalogueData/plan/q115/', function (err, files) {
    var fileCount = 0;
    var index = 0;
    var myArray = [];
     guid_Collection = [],pidDupliactes = [];
    files.filter(function(file) { return file.substr(-5) === '.json'; })
          .forEach(function(file) { 
        var xters = require(file);
        myArray = xters.match(regExp);
        
        
        var items = myArray[0].split('"');
        str = items[3];
        index++;
        if(myArray != null) {
            var obj = {
                  name: file,
                  id: myArray[0]
            }
            guid_Collection.push(str);
        } else {
            console.log("No file  match found!");
            console.log(file);
        }
        if(files.length === index){
             
             verifyGUIDEntry();
            console.log();
             //pidDupliactes.push("Thats...It");
             //res.send(pidDupliactes);
             pidDupliactes.length = 0;
        }
    })
    
});


function verifyGUIDEntry(){ 
     var guid_CollectionDup = guid_Collection;
    var length = guid_Collection.length;
     for(var i=0;i<length;i++){ 
          var guid = guid_Collection[i];
         // console.log(guid);
          guid_CollectionDup =  guid_Collection.slice(++i);
          checkGUIDDuplicates(guid,guid_CollectionDup);   
     }
}

function checkGUIDDuplicates(guid,collection){
    var collectionLength = collection.length;
       for(var i=0;i<collectionLength;i++){ //console.log(collection[i].id);
          if(guid == collection[i]){
            console.log("Duplicate Match");
            pidDupliactes.push("Duplicate PID for "+guid);
            console.log(guid);
            console.log(collection[i]);
          }else{
            //console.log("No Duplicate Match"+i);  
          }
       }
}
    
/*}
    
}*/
