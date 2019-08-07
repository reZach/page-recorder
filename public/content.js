let persistentData = {
    "lastTargetedElement": "",    
    "PRCount": 1,
    "searchingForTransactionAreaActive": true
}


let persistent = {
    "recording": false
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
    while (levels > 0){
        selector = generateElementSelector(element);        
        if (document.querySelectorAll(selector).length !== 1){
            
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
    if (originalElement.getAttribute("data-pr") !== null){
        console.error(`Element ${originalSelector} already has a 'data-pr' attribute, cannot add attribute!`);
    } else {
        originalElement.setAttribute("data-pr", persistentData.PRCount);
        persistentData.PRCount++;
    }
    
    return generateElementSelector(originalElement);
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
        _query += `#${_id}`;
    }
    if (_class.length > 0){
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

let buildMessage = function(element){
    return {
        url: window.location.href,
        selector: element
    };
}

let sendMessage = function(message, callback){
    chrome.runtime.sendMessage(message, function(response){
        if (typeof callback === "function"){
            callback(response);
        }        
    });
}

let addMessageToLocalStorage = function(message){
    chrome.storage.local.get(["data"], function(result){        
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



document.addEventListener("click", function(event){    
    let bestParent = eventFindBestParent(event);
    if (bestParent === false){
        console.error("Could not find parent for click!");
        return;
    }

    let selector = createBetterSelector(bestParent);

    if (persistent.recording){
        let message = buildMessage(selector);
        addMessageToLocalStorage(message);
        sendMessage({
            action: "userAction",
            data: message
        });
    }

    if (!persistentData.searchingForTransactionAreaActive){
        let message = buildMessage(selector);
        addMessageToLocalStorage(message);    
    } else {
        persistentData.searchingForTransactionAreaActive = false;
        chrome.runtime.sendMessage({
            msg: "something_completed", 
            data: {
                subject: "Loading",
                content: "Just completed!"
            }
        });        
    }    
});

document.addEventListener("mousemove", function(event){
    if (!persistentData.searchingForTransactionAreaActive) return;

    // Get hovered element
    event = event || window.event;
    let x = event.clientX;
    let y = event.clientY;
    let hoveredElement = document.elementFromPoint(x, y);
    if (hoveredElement === null) return;

    // Get better, targeted elements if we can
    let selector = createBetterSelector(hoveredElement);
    console.log(`${selector} - "${getElementTextContent(hoveredElement)}"`);

    if (selector !== persistentData.lastTargetedElement){
        // Reset old element
        if (persistentData.lastTargetedElement.length > 0){
            let element = document.querySelector(persistentData.lastTargetedElement);
    
            if (element !== null){
                element.style.opacity = null;
                element.style.backgroundColor = null;
            }
        }
            
        // Style element
        persistentData.lastTargetedElement = selector;
        
        hoveredElement.style.opacity = "0.5";
        hoveredElement.style.backgroundColor = "#c0cbef"; 
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){      
    switch (message.action){
        case "clear":
            clearLocalStorage();
            break;
        case "record":
            persistent.recording = true;
            break;

        
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
        case "SearchingForTransactionArea":
            if (!persistentData.searchingForTransactionAreaActive){
                persistentData.searchingForTransactionAreaActive = true;
            }
            break;
        default:
            break;
    }
});