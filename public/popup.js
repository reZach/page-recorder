document.addEventListener("DOMContentLoaded", function (event) {

    let fireAction = function(actionName, callback){
        return chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: actionName }, function (response) {
                if (typeof callback === "function"){
                    callback();
                }                
            });
        });
    }

    let updateStatus = function(status){
        document.querySelector(".js-status").innerHTML = `${status}`;
    }
    let updateConnectorStatus = function(status){
        document.querySelector(".js-connector-status").innerHTML = `${status}`;
    }

    document.querySelector(".js-clear").addEventListener("click", function(event){
        fireAction("ClearLocalStorage", updateStatus("Reset page recording"));
    });
    document.querySelector(".js-save").addEventListener("click", function(event){
        fireAction("SaveUserStepsToFile", updateStatus("Saved page record"));
    });

    document.querySelector(".js-transaction-area").addEventListener("click", function(event){
        fireAction("SearchingForTransactionArea", updateConnectorStatus("Selecting transaction area"));
    });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    switch(message.action){        
        default:
            break;
    }

    console.log(message);
});