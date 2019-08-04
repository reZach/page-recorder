
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

let createElementSelector = function(element){
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

document.addEventListener("click", function(event){    
    let bestParent = findBestParent(event);
    if (bestParent === false){
        console.warn("Could not find parent for click!");
        return;
    }

    let element = createElementSelector(bestParent);
    console.log(`${element}`);

    let message = buildMessage(element);
    addMessageToLocalStorage(message);    
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