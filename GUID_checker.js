//THis is for checking Duplicates GUIDs

var fs = require('fs');

require.extensions['.json'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var recursive = require('recursive-readdir');
var guid_Collection = [],guIDDupliactes =[];
var xters ;
var regExp = /"id"(((\s*)(:|=)(\s*)))(((.|\n)[^,\r](?!((.+?)(:|=))))+)/;


/*module.exports = {

checkDupGUID : function(res) {*/
    
recursive('D:/Kanban/Projects_Gali/ProdCat/productCatalogueData_Master/catalogueData/plan/monthly_2015/aug/', function (err, files) {
    var fileCount = 0;
    var index = 0;
    var myArray = [];
    guid_Collection = [],PriceDuplicates = [];
    files.filter(function(file) { return file.substr(-5) === '.json'; })
          .forEach(function(file) {
        var xters = require(file);
        myArray = xters.match(regExp);
        index++;
        if(myArray != null) {
            var obj = {
                  name: file,
                  id: myArray[0]
            }
            guid_Collection.push(myArray[0]);
        } else {
            console.log("No file  match found!");
            console.log(file);
        }
        if(files.length === index){
            //console.log("Success");
            //console.log(guid_Collection);
            verifyGUIDEntry();
            guIDDupliactes.push("Thats...It");
            console.log("Thats...it");
            console.log(guIDDupliactes);
            // res.send(guIDDupliactes);
             guIDDupliactes.length = 0;
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
            guIDDupliactes.push("Duplicate GUID for "+guid);
              console.log(guIDDupliactes);
              console.log(collection[i]);
          }else{
            //console.log("No Duplicate Match"+i);  
          }
       }
}
    
/*}
    
}*/
