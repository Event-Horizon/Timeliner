function timeline(){
	var self={};
  self.collection={};
  self.create=(function(str){
  	/*	str format:
    *		"day\nlistN1\nlistN2"
    */
    //convert to array
    str=str.split("\n");
    var day=str.shift();//collection key
    //convert array items to objects
    str=str.map(function(e){e=e.split("|");return {time:e[0],desc:e[1]}});
    //convert collection[day] to array
    if(!self.collection[day]){
    	self.collection[day]=[];
    }
    self.collection[day]=self.collection[day].concat(str);
    return self.collection;
  });
  self.findAll=(function(term){
      var myTerm=new RegExp(term,"igm");
      var myCollection=Object.keys(self.collection).map(function(key){
          return self.collection[key];
      });
      console.log(myCollection);
      var results=myCollection.filter(function(tItem){
          console.log(tItem);
          if(tItem.match(term)){
              return true;
          }
      });      
      return results;
  });
  return self;
}
var myTimeline=new timeline();
myTimeline.create("01/01/2016\n7:16AM|Ate a Cake\n8:14AM|Ate a banana");
myTimeline.create("01/02/2016\n7:16AM|Ate a Cake\n8:14AM|Ate a banana");
console.log(myTimeline.findAll("banana"));