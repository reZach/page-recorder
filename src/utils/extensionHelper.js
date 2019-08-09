/* global chrome */

export function sendToContentScript(action, data = {}, callback = null){    
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {        
        chrome.tabs.sendMessage(tabs[0].id, {
            action: action,
            data: data
        }, function (response) {            
            if (callback !== null && typeof callback === "function"){
                callback(response);
            }
        });
    });
}