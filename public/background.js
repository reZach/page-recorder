chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse){
        console.log("background");
        switch(message.action){
            case "saveBackground":
                try {
                    var blob = new Blob([JSON.stringify(message.data)], {type: "application/json"});
                    var url = URL.createObjectURL(blob);
                    
                    chrome.downloads.download({
                        url: url
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