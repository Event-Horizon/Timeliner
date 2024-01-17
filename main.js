import { Temporal } from './node_modules/temporal-polyfill/dist/index.mjs'

document.addEventListener("DOMContentLoaded",main);

/**
 * Returns a new TimelineItem
 * @param {Temporal.PlainDate} date
 * @param {Temporal.PlainTime} time
 * @param {string} description 
 * @returns {TimelineItem}
 */
class TimelineItem{
    constructor(d, t, desc, dformat="en-US", tformat=12){
        this.validateTimeFormat(tformat);
        this.dateFormat=dformat??"en-US";
        this.timeFormat=tformat??12;
        this._date=d;
        this.time=t;
        this.description=desc;
    }
    set date(d){this._date=d}
    get date(){
        return this._date
    }
    validateTimeFormat(t){
        if(!(t===12||t===24)){
            throw new Error("Invalid time format.");
        }
    }
    static fromUntyped(i){
        if(!(i.date||i._date && i.time && i.description)){
            throw new Error("Invalid object provided to TimelineItem.fromUntyped static method.");
        }
        i.date=i.date||i._date;
        return new TimelineItem(i.date,i.time,i.description);
    }
}

/**
 * Returns a new Timeline
 * @param {(TimelineItem|Array)} titems
 * @returns {Timeline}
 */
class Timeline{
    constructor(...titems){
        if(titems.length){
            this.items=titems;
        }else{
            this.items=[titems];
        }
    }
    validateAndFormat(){
        for(let item of this.items){
            item=TimelineItem.fromUntyped(item);
        }
    }
    findAll(term) {
        //for each object in array, if key !== term, loop object properties to find term
        let regexTerm = new RegExp(term, "igm");
        let myCollection = Object.keys(this.items).map(function(key) {//convert key to value
            return this.items[key];
        });
        //console.log(myCollection);
        let results = myCollection.filter(function(timel) {
            let searchItem = Object.keys(timel), found = false;
            searchItem.forEach(function(siProp) {
                if (timel[siProp]&&timel[siProp].match(regexTerm)) {
                    found = true;
                }
            });
            return found;
        });
        return results;
    };
}

/**
 * Returns a new ConnectedItems object
 * @returns {ConnectedItems}
 */
function refreshConnected(){
    let result={};

    result.searchField = document.querySelector("#searchField");
    result.searchBut = document.querySelector("#searchBut");
    result.dateField = document.querySelector("#dateField");
    result.timeField = document.querySelector("#timeField");
    result.descField = document.querySelector("#descField");
    result.outputEl = document.querySelector("#output");
    result.createBut = document.querySelector("#createBut");
    result.bulkField = document.querySelector("#bulkField");
    result.bulkBut = document.querySelector("#bulkBut");
    result.alertDiv = document.querySelector("#alert");
    result.saveField = document.querySelector("#saveField");
    result.loadField = document.querySelector("#loadField");
    result.saveBut = document.querySelector("#saveBut");
    result.loadBut = document.querySelector("#loadBut");
    result.saveStringField = document.querySelector("#saveStringField");
    result.alertClose = document.querySelector("#alertClose");

    return result;
}

/**
 * Returns a new EventMap object
 * @returns {EventMap}
 */
function newEventMap(element,callback,type){
    let result={};

    result.element=element;
    result.callback=callback;
    result.type=type;

    return result;
}

/**
 * Connects events to elements
 * @param {ConnectedItems} connected
 * @param {Array} eventMappings
 * @returns {void}
*/
function mapConnectedToEvents(connected,eventMappings){
    for (const [key, value] of Object.entries(connected)) {
        for(let eventMap of eventMappings){
            // console.log(eventMap)
            if(eventMap.element === key){
                // console.log("true",key);
                connected[key].addEventListener(eventMap.type,eventMap.callback);
            }
        }
    }
}

function formatTo12hours(t){
    if(typeof t !== "string"){throw new Error("Input was not a string.");return;}
    if(!t.match(/\d{2}:\d{2}/igm)){
        throw new Error("Invalid string format given to formatTo12hours.");
        return;
    }
    let period="am";
    t=t.split(":").map((timestring)=>parseInt(timestring,10));
    if(t[0]>12){
        t[0]-=12;
        period="pm";
    }
    t=t.map((inttime)=>inttime.toString().padStart(2, '0')).join(":")+" "+period;

    return t;
}

function formatTo24Hours(t){
    if(typeof t !== "string"){throw new Error("Input was not a string.");return;}
    if(t.match(/\d{2}:\d{2}/igm)){
        throw new Error("Not enough information (no AM/PM provided).");
        return;
    }
    if(!t.match(/\d{2}:\d{2} am|pm|AM|PM/igm)){
        throw new Error("Invalid string format given to formatTo24Hours.");
        return;
    }else{
        t=t.split(" ");
        let period = t[1];
        let time = t[0].split(":").map((timestring)=>parseInt(timestring,10));
        if(period.match(/pm|PM/igm)){
            time[0]+=12;
        }
        time=time.join(":");
        t=time;
    }

    return t;
}

function test(){
    console.log("working");
}

function updateAlert(alertElement, text, autohide) {
    // console.log("triggered, autohide:",autohide,"ALERT:",alertElement);
    autohide = autohide;
    let alertDiv = alertElement;
    let alertClose = alertDiv.querySelector(".close");
    if(alertElement.classList.contains("close")){
        // console.log(true);
        alertDiv = alertElement.parentElement; //if alertClose is the clicked element
        alertClose = alertElement;
    }

    alertDiv.lastChild.innerHTML = text || "";
    alertDiv.classList.toggle("hidden");
    if (autohide) {
        alertClose.classList.toggle("hidden");
        setTimeout(function() {
            alertClose.classList.toggle("hidden");
            alertDiv.classList.toggle("hidden");
        }, 5000);
    }
}

function search(text,timelineItemsState) {    
    // console.log(text,timelineItemsState);
    let searchResults = timelineItemsState.filter((item)=>{
        return item.description.match(text) || item.date == text || item.time == text;
    });
    return searchResults;
};

function searchTriggered(outputElement,inputElement,timelineItemsState,e){       
    let results=search.call(this,inputElement.value,timelineItemsState);
    updateOutput(outputElement,results);
    return;
}

function closeAlertClick(e){
    updateAlert.call(this, e.currentTarget, "", false);
    return;
}

function updateOutput(outputElement, timelineItemsState){    
    let dates = {};
    outputElement.innerHTML = "";//reset
    timelineItemsState.forEach(function(timelineItem) {
        // console.log(timelineItem);
        // console.log(timelineItem.date);
        if (!dates[timelineItem.date]) {
            dates[timelineItem.date] = [];
            dates[timelineItem.date].push(timelineItem);
        } else {
            dates[timelineItem.date].push(timelineItem);
        }
    });
    Object.keys(dates).forEach(function(key) {
        key = Temporal.PlainDate.from(key);
        let frag = document.createDocumentFragment(), tempDateEl = document.createElement("h3");
        let tempSpanEl = document.createElement("span");
        tempSpanEl.classList.add("glyphicon","glyphicon-calendar");
        //since we are grouping times by their date, we ignore each entries preferred date format
        //and instead we go with the app global format
        tempDateEl.append(tempSpanEl,document.createTextNode(" "+key.toLocaleString("en-US")));
        
        let tempItemEl = document.createElement("ul");
        tempItemEl.classList.add("list-group","row","mx-1");
        dates[key].forEach(function(item) {
            let tempListItemEl = document.createElement("li"), tempStrongEl=document.createElement("strong"), tempSpanEl=document.createElement("span");
            if(item.timeFormat===12){
                tempStrongEl.innerText=formatTo12hours(item.time.toString());
            }else{
                tempStrongEl.innerText=(item.time.toString());
            }

            tempStrongEl.classList.add("col-md-2");
            tempListItemEl.classList.add("list-group-item","col-md-12");
            tempSpanEl.innerText=item.description;
            tempSpanEl.classList.add("col-md-10");
            tempListItemEl.append(tempStrongEl, tempSpanEl);
            tempItemEl.appendChild(tempListItemEl);
        });

        frag.append(tempDateEl,tempItemEl);
        outputElement.appendChild(frag);
    });
}

function createItem(date, time, description, globalState) {    
    let dateValue  = Temporal.PlainDate.from(date);
    let timeValue = Temporal.PlainTime.from(time); 
    let tempTimelineItem = new TimelineItem(dateValue,timeValue,description);
    globalState.timeline.items.push(tempTimelineItem);
}

function createItemTriggered(alertElement,dateElement,timeElement,descElement,outputElement,globalState,e){
        /* 
    string format:
    "day
    listN1
    listN2"
    */
    let regexDateValidation=/\d{4}\-\d{2}\-\d{2}/igm;
    let regexTimeValidation=/\d{1,2}\:\d{2}/igm;
    let dateValue=dateElement.value;
    let timeValue=timeElement.value;
    let descValue=descElement.value;
    console.log(dateValue,timeValue,descValue);

    if(!dateValue.match(regexDateValidation)){
        updateAlert(alertElement,"Your date input did not match the format of YYYY/MM/DD");
        return;
    }
    if(!timeValue.match(regexTimeValidation)){			
        updateAlert(alertElement,"Your time input did not match the format of HH:MM AM/PM");			
        return;
    }
    //if checks were good, continue  
    createItem(dateValue,timeValue,descValue,globalState);
    updateOutput(outputElement,globalState.timeline.items);
}

function createBulkTriggered(alertElement,inputElement,outputElement,globalState,e){
    let regexDateValidation=/\d{4}\-\d{2}\-\d{2}/igm;
    let regexTimeValidation=/\d{1,2}\:\d{2}/igm;
    let text=inputElement.value;
    let dateValue=text.split("\n")[0];
    text=text.split("\n").toSpliced(0,1).join("\n");//remove date from start of text    
    console.log(text);
    let timeItemList=text.split("\n").map((item)=>{
        let tempItem=item.split(" | ");
        let tempTime=tempItem[0].split(" ");
        let tempNumbers=tempTime[0].split(":");
        if(tempTime[1].match("pm|PM")){
            tempNumbers[0]=(parseInt(tempNumbers[0])+12).toString();        
        }
        tempTime=tempNumbers.join(":");
        return {time:tempTime,description:tempItem[1]};
    });

    if(!dateValue.match(regexDateValidation)){
        updateAlert(alertElement,"Your date input did not match the format of YYYY/MM/DD");
        return;
    }

    for(let timeItem of timeItemList){
        if(!timeItem.time.match(regexTimeValidation)){			
            updateAlert(alertElement,"Your time input did not match the format of HH:MM AM/PM");			
            return;
        }
        createItem(dateValue,timeItem.time,timeItem.description,globalState);
    }
    updateOutput(outputElement,globalState.timeline.items);
}

function saveTriggered(saveInputElement,saveOutputElement,alertElement,globalState){
    let saveName = saveInputElement.value;
    if(!saveName){
        updateAlert(alertElement,"No name, not saved, string generated.", false);
    }
    saveOutputElement.innerHTML = JSON.stringify(globalState.timeline.items);
}

function loadTriggered(loadInputField,outputElement,alertElement,globalState){
    let loadString = null;    
    try {
        loadString = JSON.parse(loadInputField.value);
        globalState.timeline.items=[];        
    } catch (e) {//handled later
    }    

    (loadString) ? globalState.timeline.items = loadString: updateAlert(alertElement,"Error load string not parsing.", false);
    globalState.timeline.validateAndFormat();
    updateOutput(outputElement,globalState.timeline.items);
}

function main(){

    const theDate = Temporal.Now.plainDateISO();
    const theTime = Temporal.Now.plainTimeISO();
    const theDate2 = Temporal.PlainDate.from('1969-07-20');
    const theTime2 = Temporal.PlainTime.from('T01:17Z');

    window.appState={
        timeline:new Timeline(
            new TimelineItem(theDate,theTime,"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Amet commodo nulla facilisi nullam vehicula. Ornare arcu dui vivamus arcu felis. Quis blandit turpis cursus in hac habitasse platea dictumst. At in tellus integer feugiat scelerisque varius. Vitae nunc sed velit dignissim sodales. Justo donec enim diam vulputate ut pharetra sit. Posuere morbi leo urna molestie at elementum eu facilisis sed. Justo nec ultrices dui sapien eget mi. Nunc consequat interdum varius sit amet mattis.","en-US",24),
            new TimelineItem(theDate,theTime,"Testing2"),
            new TimelineItem(theDate,theTime,"Testing3"),
            new TimelineItem(theDate2,theTime2,"Testing4"),
            new TimelineItem(theDate2,theTime2,"Testing5"),
            new TimelineItem(theDate2,theTime2,"Testing6"),
        )
    };

    console.log(appState);

    let guiElements=refreshConnected();

    guiElements.searchField.addEventListener("keyup",searchTriggered.bind(this,guiElements.outputEl,guiElements.searchField,appState.timeline.items));
    guiElements.searchBut.addEventListener("click",searchTriggered.bind(this,guiElements.outputEl,guiElements.searchField,appState.timeline.items));
    guiElements.alertClose.addEventListener("click",closeAlertClick);
    guiElements.createBut.addEventListener("click",createItemTriggered.bind(this,guiElements.alertDiv,guiElements.dateField,guiElements.timeField,guiElements.descField,guiElements.outputEl,appState));
    guiElements.bulkBut.addEventListener("click",createBulkTriggered.bind(this,guiElements.alertDiv,guiElements.bulkField,guiElements.outputEl,appState));
    guiElements.saveBut.addEventListener("click",saveTriggered.bind(this,guiElements.saveField,guiElements.saveStringField,guiElements.alertDiv,appState));
    guiElements.loadBut.addEventListener("click",loadTriggered.bind(this,guiElements.loadField,guiElements.outputEl,guiElements.alertDiv,appState));

    updateOutput(guiElements.outputEl, appState.timeline.items);
    updateAlert(guiElements.alertClose, "No items in timeline yet.", true);


}