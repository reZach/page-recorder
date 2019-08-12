let persistent = {
    "PRCount": 1,
    "recording": false,
    "lastTargetedElement": "",
    "dataPoint": ""
}


let eventFindBestParent = function(event){
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

let createBetterSelector = function(element){
    
    // A selector is no good if it is not unique!
    // Traverse up the DOM to find a better selector for
    // our element
    let levels = 5;
    let selector;
    let originalElement = element;
    let originalSelector = generateElementSelector(element);
    let queryResult;    
    while (levels > 0){
        selector = generateElementSelector(element);
        
        try {            
            queryResult = document.querySelectorAll(selector); // may break here
        } catch (e) {
            return null;
        }
        
        if (queryResult.length !== 1){
            
            if (element.parentElement !== null){
                element = element.parentElement;
            } else {
                // Can't find any more parent elements!
                break;
            }
        } else {            
            if (selector !== originalSelector){
                selector = `${selector} ${originalSelector}`;                
            } else {
                selector = originalSelector;
            }

            // Check one last time, just to be safe
            if (document.querySelectorAll(selector).length === 1){
                return selector;
            } else {
                if (element.parentElement !== null){
                    element = element.parentElement;
                } else {
                    // Can't find any more parent elements!
                    break; 
                }
            }
        }
        
        levels--;
    }

    // If we can't find a nice css selector,
    // we will force an attribute on the element
    // so we can select it
    // if (originalElement.getAttribute("data-pr") !== null){
    //     console.error(`Element ${originalSelector} already has a 'data-pr' attribute, cannot add attribute!`);
    // } else {
    //     originalElement.setAttribute("data-pr", persistent.PRCount);
    //     persistent.PRCount++;
    // }
    
    // return generateElementSelector(originalElement);

    return originalSelector;
}

// Creates a css selector for the given element
// based on the attributes of that DOM element
let generateElementSelector = function(element){
    if (element === null || typeof element === "undefined") return "";

    let _tag = element.tagName;
    let _id = element.id;
    let _class = element.className;
    let _pr = element.getAttribute("data-pr");    
    
    let _query = `${_tag.toLowerCase()}`;
    if (_id.length > 0){
        // Can't select with id beginning with a number
        _query += `[id='${_id}']`;
    }
    if (_class.length > 0){
        _class = _class.replace("pr-hover", "");
        _class = _class.trim().replace(/\s{1,}/g, " ");        
        _query += `.${_class.replace(new RegExp(" ", "g"), ".")}`;
    }
    if (_pr !== null && _pr.length > 0){
        _query += `[data-pr="${_pr}"]`;
    }

    // Tag-specific selectors
    if (_tag === "A"){
        let _href = element.getAttribute("href");
        _query += `[href="${_href}"]`;
    }
    return _query;
}

let getElementTextContent = function(element){
    // https://stackoverflow.com/a/6744068/1837080
    return element.innerText || element.textContent;
}

let buildUserAction = function(element){
    return {
        url: window.location.href,
        selector: element,
        textContent: getElementTextContent(document.querySelector(element))
    };
}

let clearLastTargetedElement = function(){
    // Reset old element
    if (persistent.lastTargetedElement.length > 0){
        let element = document.querySelector(persistent.lastTargetedElement);

        if (element !== null){
            element.classList.remove("pr-hover");
            // element.style.opacity = null;
            // element.style.backgroundColor = null;
        }
    }
}

let sendAllDataPointsToPopup = function(){
    Localstorage.get(null, function(response){
        console.log(`dataPointAll response ${JSON.stringify(response)}`);
        let toSend = {};
        let keys = Object.keys(response);
        for (var i = 0; i < keys.length; i++){
            if (keys[i].indexOf("dataPoint") === 0){
                toSend[`${keys[i]}`] = response[keys[i]];
            }
        };

        if (Object.keys(toSend).length > 0){
            Messages.send("dataPointAll", toSend);
        }
    });
}



document.addEventListener("click", function(event){    
    let bestParent = eventFindBestParent(event);
    if (bestParent === false){
        console.error("Could not find parent for click!");
        return;
    }

    let selector = createBetterSelector(bestParent);
    if (selector === null) return;

    if (persistent.recording){
        let userAction = buildUserAction(selector);
        
        let storage = Localstorage.get("userActions", function(response){
            if (Object.keys(response).length === 0){                
                response = [userAction];
                Localstorage.set({"userActions": response});
            } else {
                response["userActions"].push(userAction);
                Localstorage.set(response);
            }
            
            // Save to localstorage so popup can use this
            Localstorage.set({"lastAction": userAction}, function(response){
                Messages.send("lastAction", userAction);
            });
            console.log(`Sent lastAction: ${userAction}`);
        });
    } else if (persistent.dataPoint.length > 0){        
        let userAction = buildUserAction(selector);        
        let dataPointKey = `dataPoint_${persistent.dataPoint}`;
        
        let storage = Localstorage.get(dataPointKey, function(response){
            if (Object.keys(response).length === 0){                
                let toSet = {};
                toSet[`${dataPointKey}`] = userAction;
                Localstorage.set(toSet);
            } else {
                response[`${dataPointKey}`] = userAction;
                Localstorage.set(response);
            }

            // Send message to popup
            sendAllDataPointsToPopup();

            // Reset
            persistent.dataPoint = "";
            clearLastTargetedElement();
        });
    }
});

document.addEventListener("mousemove", function(event){    
    if (!(persistent.recording || persistent.dataPoint !== "")) return;

    // Get hovered element
    event = event || window.event;
    let x = event.clientX;
    let y = event.clientY;
    let hoveredElement = document.elementFromPoint(x, y);
    if (hoveredElement === null) return;

    // Get better, targeted elements if we can
    let selector = createBetterSelector(hoveredElement);
    //console.log(`${selector} - "${getElementTextContent(hoveredElement)}"`);

    if (selector === null) return;

    if (selector !== persistent.lastTargetedElement){
        // Reset old element
        clearLastTargetedElement();
            
        // Style element
        persistent.lastTargetedElement = selector;
        
        hoveredElement.classList.add("pr-hover");
        // hoveredElement.style.opacity = "0.5";
        // hoveredElement.style.backgroundColor = "#c0cbef"; 
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    clearLastTargetedElement();

    console.log(`content.js addListener: ${JSON.stringify(message)}`);
    switch (message.action){
        case "clear":
            persistent.recording = false;
            Localstorage.remove("userActions");
            Localstorage.remove("dataPointKey");
            Localstorage.clear(); // only for debugging
            break;
        case "record":
            persistent.recording = true;
            break;
        case "save":
            Localstorage.get("userActions", function(response){
                if (Object.keys(response).length === 0) return;

                // Send message to background thread, 
                // as only the background thread has access to chrome downloads
                Messages.send("saveBackground", response["userActions"], function(response){
                    persistent.recording = false;
                    Localstorage.remove("userActions");
                });
            });
            break;
        case "lastAction":
            Localstorage.get("lastAction", function(response){
                let toSend = {};
                if (Object.keys(response).length !== 0){
                    toSend = response["lastAction"];
                }

                Messages.send("lastActionPopup", toSend);
            });
        case "dataPointAll":
            sendAllDataPointsToPopup();
            break;
        case "dataPoint_date":
            persistent.dataPoint = "date";
            break;
        case "dataPoint_amount":
            persistent.dataPoint = "amount";
            break;
        case "dataPoint_category":
            persistent.dataPoint = "category";
            break;
        case "dataPoint_subcategory":
            persistent.dataPoint = "subcategory";
            break;
        case "dataPoint_note":
            persistent.dataPoint = "note";
            break;
        default:
            break;
    }
    
    sendResponse({});
    return true;
});