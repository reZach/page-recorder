let persistentData = {
    "lastTargetedElement": "",
    "lastTargetedElementBGC": "",
    "opacity": 0.3
}


let findBestParent = function(event){
    // Skip these tags,
    // as they usually don't hold good identifiers
    let skip = [
        "path",
        "svg"
    ];

    let cursor = event;
    while(cursor !== false){                        

        if (skip.indexOf(cursor.tagName) >= 0){
            if (typeof cursor.parentNode !== "undefined" && cursor.parentNode !== null){
                cursor = cursor.parentNode;
            } else {
                cursor = false;
            }
        } else {
            // Good element!
            if (cursor.target !== null){
                cursor = cursor.target;
                break;
            } else {
                cursor = false;
            }
        }
    }    

    return cursor;
}

let findBestDOMParent = function(element){

    // Sometimes we don't have a good element
    // if there are multiple elements with the
    // same selector on the page. If there are,
    // we iterate 


    let parent = element.parentElement;



    // If element only has a inner text node,
    // and no elements that are not included in the "ignore" list,
    // use the passed-in element as the best DOM parent
    let childNodes = element.childNodes;
    let keys = Object.keys(childNodes); // childNodes is an object not an array :/
    let ignore = ["IMG", "#text"];
    let onlyOneText = false;
    let bad = false;
    for (var i = 0; i < keys.length; i++){
        let nodeName = childNodes[`${keys[i]}`].nodeName;
        if (ignore.indexOf(nodeName) < 0){
            bad = true;
        }
        if (nodeName === "#text"){
            if (!onlyOneText){
                onlyOneText = true;
            } else {
                bad = true;
            }
        }
    }
    if (!bad) return element;

    // Look up one level if this element's
    // parent has an "id" property. If true,
    // this element's parent is the best DOM parent
    if (element.childNodes.length > 0 &&
        typeof parent !== "undefined" && 
        parent !== null &&
        typeof parent.id !== "undefined"){
        return parent;
    } else {
        return element;
    }
}

let createElementSelector = function(element){
    if (element === null) return "";

    let _tag = element.tagName;
    let _id = element.id;
    let _class = element.className;    
    
    let _query = `${_tag.toLowerCase()}`;
    if (_id.length > 0){
        _query += `#${_id}`;
    }
    if (_class.length > 0){
        _query += `.${_class.replace(new RegExp(" ", "g"), ".")}`;
    }
    return _query;
}

let buildMessage = function(element){
    return {
        url: window.location.href,
        selector: element
    };
}

let addMessageToLocalStorage = function(message){
    let existing = chrome.storage.local.get(["data"], function(result){        
        if (typeof result["data"] === "undefined"){
            result["data"] = [];
        }

        result["data"].push(message);
        chrome.storage.local.set(result, function(result){
            console.log("Saved to local storage");
        });
    });
}

let clearLocalStorage = function(){
    chrome.storage.local.set({"data": []}, function(result){});
}

let getBackgroundColor = function(element){
    try {
        let color = window.getComputedStyle ? window.getComputedStyle(element, null).getPropertyValue("background-color") : element.style.backgroundColor;
        return `${color}`;
    } catch (e) {
        console.error(`element is ${element}`);
    }
    
}

let resetOldElement = function(selector){
    if (selector.length > 0){
        try {
            let element = document.querySelector(selector);
            element.style.opacity = 1;
            element.style.backgroundColor = `${persistentData.lastTargetedElementBGC}`;
            
            //console.log(`Resetting ${selector}`);
        } catch (e){

        }
    }
}

setInterval(() => {        
    if (persistentData.lastTargetedElement !== ""){
        try {
            persistentData.opacity = persistentData.opacity === 0.3 ? 0.8 : 0.3;
            let element = document.querySelector(persistentData.lastTargetedElement);
            element.style.opacity = persistentData.opacity;
            element.style.backgroundColor = "#c0cbef"; 
        } catch (e){

        }     
    }        
}, 500
);

document.addEventListener("click", function(event){    
    let bestParent = findBestParent(event);
    if (bestParent === false){
        console.warn("Could not find parent for click!");
        return;
    }

    let element = createElementSelector(bestParent);
    //console.log(`${element}`);

    let message = buildMessage(element);
    addMessageToLocalStorage(message);    
});

document.addEventListener("mousemove", function(event){



    
    event = event || window.event;
    let x = event.clientX;
    let y = event.clientY;
    let hoveredElement = document.elementsFromPoint(x, y)[1];
    if (hoveredElement === null) return;

    // Get better, targeted elements if we can;
    // similar to findBestParent, but with DOM elements
    hoveredElement = findBestDOMParent(hoveredElement);
    let selector = createElementSelector(hoveredElement);
    
    if (selector !== persistentData.lastTargetedElement){
        resetOldElement(persistentData.lastTargetedElement);

        // Save new element
        persistentData.lastTargetedElement = selector;
        persistentData.lastTargetedElementBGC = getBackgroundColor(hoveredElement);
        //console.log(`Saving ${selector}`);
    }
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){      
    switch (msg.action){
        case "ClearLocalStorage":
            clearLocalStorage();
            break;
        case "SaveUserStepsToFile":
            chrome.storage.local.get(["data"], function(result){
                if (typeof result === "undefined" || result === null){
                    return;
                }
        
                chrome.runtime.sendMessage(result, function(response){                    
                    clearLocalStorage();
                });
            });
        break;
        default:
            break;
    }
});