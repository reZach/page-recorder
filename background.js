chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){         
        try {
            var blob = new Blob([JSON.stringify(request)], {type: "application/json"});
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
        
        return true; // makes this async
    }
);