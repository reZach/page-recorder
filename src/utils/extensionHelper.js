/* global chrome */

export function sendToContentScript(event, callback){
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, event, function (response) {
            if (typeof callback === "function"){
                callback(response);
            }                
        });
    });
}