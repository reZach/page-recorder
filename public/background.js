chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse){
        console.log("background");
        switch(message.action){
            case "generateConnectorPopup":
                try {
                    var blob = new Blob([message.data], {type: "application/javascript"});
                    var url = URL.createObjectURL(blob);
                    
                    chrome.downloads.download({
                        url: url,
                        filename: "mybudgetconnector.js"
                    });
            
                    sendResponse({
                        success: true
                    });
                } catch (error){
                    sendResponse({
                        success: false
                    });
                }
            break;
            
            default:
                break;
        }        
        
        return true; // makes this async
    }
);