/* global chrome */

export function sendToContentScript(event /*,callback*/){
    console.log("sendToContentScript");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log("tabs.query")
        chrome.tabs.sendMessage(tabs[0].id, event, function (response) {
            console.log("sending message");
            // if (typeof callback === "function"){
            //     callback(response);
            // }                
        });
    });
}