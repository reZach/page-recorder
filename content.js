
var findBestParent = function(event){
    // Skip these tags,
    // as they usually don't hold good identifiers
    var skip = [
        "path",
        "svg"
    ];

    var cursor = event;
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

var createElementSelector = function(element){
    var _tag = element.tagName;
    var _id = element.id;
    var _class = element.className;    
    
    var _query = `${_tag.toLowerCase()}`;
    if (_id.length > 0){
        _query += `#${_id}`;
    }
    if (_class.length > 0){
        _query += `.${_class.replace(new RegExp(" ", "g"), ".")}`;
    }
    return _query;
}

var buildMessage = function(element){
    return {
        url: window.location.href,
        selector: element
    };
}


document.addEventListener("click", function(event){    
    var bestParent = findBestParent(event);
    if (bestParent === false){
        console.warn("Could not find parent for click!");
        return;
    }

    var element = createElementSelector(bestParent);
    console.log(`${element}`);

    chrome.runtime.sendMessage(buildMessage(element), function(response){        
        console.log(response);
    });
});