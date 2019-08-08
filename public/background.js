chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse){
        switch(message.action){
            case "save":
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
                } finally {
                    return true;
                }
            break;
            default:
                break;
        }        
        
        return true; // makes this async
    }
);