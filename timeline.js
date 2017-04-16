/*
IDEAS:

save timelines to localstorage
share timelines with links
*/

/**
 * Timeline Class, creates a timeline object and manages a collection of timeline items.
 * 
 * @returns timeline object
 */
function timeline() {
    var self = {};
    self.collection = [];
    self.create = (function(str) {
        /*	str format:
         *		"day\nlistN1\nlistN2"
         */
        //convert to array
        strArr = str.split("\n");
        var day = strArr.shift(); //collection key
        //convert array items to objects
        strArr = strArr.map(function(e) {
            e = e.split("|");
            return {
                day: day,
                time: e[0],
                desc: e[1]
            }
        });
        strArr.map(function(obj) {
            self.collection.push(obj);
        });
        return self.collection;
    });
    self.findAll = (function(term) {
        //for each object in array, if key !== term, loop object properties to find term
        var myTerm = new RegExp(term, "igm");
        var myCollection = Object.keys(self.collection).map(function(key) {
            return self.collection[key];
        });
        var results = myCollection.filter(function(timel) {
            var searchItem = Object.keys(timel),
                found = false;
            searchItem.forEach(function(siProp, siInd, siArr) {
                if (timel[siProp]&&timel[siProp].match(myTerm)) {
                    found = true;
                }
            });
            return found;
        });
        return results;
    });
    self.saveTimeline = (function() {});
    self.loadTimeline = (function() {});
    return self;
}
var myTimeline = new timeline();
//MANAGE UI
document.addEventListener("DOMContentLoaded", function() {
    var searchField = document.getElementById("searchField"),
        searchBut = document.getElementById("searchBut"),
        dateField = document.getElementById("dateField"),
        timeField = document.getElementById("timeField"),
        descField = document.getElementById("descField"),
        outputEl = document.getElementById("output"),
        createBut = document.getElementById("createBut"),
        bulkField = document.getElementById("bulkField"),
        bulkBut = document.getElementById("bulkBut"),
        alertDiv = document.getElementById("alert"),
        saveField = document.getElementById("saveField"),
        loadField = document.getElementById("loadField"),
        saveBut = document.getElementById("saveBut"),
        loadBut = document.getElementById("loadBut"),
        saveStringField = document.getElementById("saveStringField"),
        alertClose = document.getElementById("alertClose");
    //UI HELPERS
    var updateOutputAll = (function(modCollection) {
        var dates = {},
            frag;
        outputEl.innerHTML = "";
        modCollection.forEach(function(item, ind, arr) {
            if (!dates[item.day]) {
                dates[item.day] = [];
                dates[item.day].push(item);
            } else {
                dates[item.day].push(item);
            }
        });
        Object.keys(dates).forEach(function(key) {
            var frag = document.createDocumentFragment();
            var myDateEl = document.createElement("h3");
            myDateEl.innerHTML = "<span class='glyphicon glyphicon-calendar'></span> " + key;
            frag.appendChild(myDateEl);
            var myItemEl = document.createElement("ul");
            myItemEl.classList.add("list-group");
            dates[key].forEach(function(item) {
                var myItemLiEl = document.createElement("li");
                myItemLiEl.classList.add("list-group-item");
                myItemLiEl.innerHTML = "<strong>" + item.time + "</strong> " + item.desc;
                myItemEl.appendChild(myItemLiEl);
            });
            frag.appendChild(myItemEl);
            outputEl.appendChild(frag);
        });
    });
    var updateOutputOne = (function(timelineObj) {
        outputEl.innerHTML = "";
        var frag = document.createDocumentFragment();
        var myDateEl = document.createElement("h3");
        myDateEl.innerHTML = timelineObj.day;
        frag.appendChild(myDateEl);
        var myItemEl = document.createElement("div");
        myItemEl.innerHTML = timelineObj.time + " " + timelineObj.desc;
        frag.appendChild(myItemEl);
        outputEl.appendChild(frag);
    });
    updateOutputAll(myTimeline.collection);

    function updateAlert(txt, autohide) {
        console.log("updateAlert run");
        autohide = autohide;
        alertDiv.classList.toggle("hidden");
        alertDiv.lastChild.innerHTML = txt || "";
        if (autohide) {
            alertClose.classList.toggle("hidden");
            setTimeout(function() {
                alertClose.classList.toggle("hidden");
                alertDiv.classList.toggle("hidden");
            }, 5000);
        }
    }
    alertClose.addEventListener("click", updateAlert.bind(this, "", false));
    updateAlert("No items in timeline yet.", false);
    //SEARCH TAB
    var searchButPress = (function() {
        var searchResults = myTimeline.findAll(searchField.value);
        updateOutputAll(searchResults);
    });
    searchBut.addEventListener("click", searchButPress);
    searchField.addEventListener("keyup", function(e) {
            if (e.keyCode === 13) {
                searchButPress();
            }
        })
        //CREATE TAB
    createBut.addEventListener("click", function() {
		var createCheckDate=/\d{2}\/\d{2}\/\d{4}/igm;
		if(dateField.value.match(createCheckDate)){
			var day = dateField.value;
		}else{
			updateAlert("Your date input did not match the format of MM/DD/YYYY");
			return false;
		}
		var createCheckTime=/\d{1,2}\:\d{2}\s(?:pm|am)/igm;
		if(timeField.value.match(createCheckTime)){			
			var time = function() {
				var myTime = timeField.value.split(":"); // 05:55 AM becomes myTime[0]="05" and myTime[1]="55 AM"
				myTime=[myTime[0],myTime[1].split(" ")[0],myTime[1].split(" ")[1]];
				return myTime[0] + ":" + myTime[1] + " " + myTime[2];
			}();
		}else{
			updateAlert("Your time input did not match the format of HH:MM AM/PM");			
			return false;
		}
        myTimeline.create(day + "\n" + time + " | " + descField.value);
        updateOutputAll(myTimeline.collection);
    });
    //BULK TAB
    bulkBut.addEventListener("click", function() {
        var bulkCheck = /\d{2}\/\d{2}\/\d{4}\n(?:\d{1,2}\:\d{2}\s(?:pm|am)\s\|\s.+(?:\W|$))+/igm;
        if (bulkField.value.match(bulkCheck)) {
            myTimeline.create(bulkField.value);
        } else {
            updateAlert("Your input did not match the format, be wary of whitespace.");
			return false;
        }
        var bulkCreateCollection = bulkField.value.split("\n");
		bulkCreateCollection.forEach(function(item,ind,arr){
			if(item && item.match(/\|/igm)){
				arr[ind]=item.split(" | ");
			}
		});
		bulkCreateCollection=bulkCreateCollection.reduce(function(a,b){
			return a.concat(b);
		},[]);
        var bulkResults = myTimeline.findAll(bulkCreateCollection.shift());
        updateOutputAll(bulkResults);
    });
    //SAVELOAD TAB
    saveBut.addEventListener("click", function() {
        var saveName = saveField.value;
        (saveName) ? myTimeline.saveTimeline(saveName): updateAlert("No name, not saved, string generated.", false);
        saveStringField.innerHTML = JSON.stringify(myTimeline.collection);
    });
    loadBut.addEventListener("click", function() {
        try {
            var loadString = JSON.parse(loadField.value);
        } catch (e) {
            //handled later
        }
        (loadString) ? myTimeline.collection = loadString: updateAlert("Error load string not parsing.", false);
        myTimeline.saveTimeline("default");
    });
});