/**
 * A global variable that allows interaction with chrome's message-sending capability.
 */
let Messages = (function(){
    // Private

    /**
     * Sends a message to any background scripts or UI components listening.
     * @param {string} action - A string to identify the message.
     * @param {object} data - Data.
     * @param {Function} callback - A function that should be called after this message is received by the recipient.
     */
    let sendPrivate = function(action, data, callback = null){        
        chrome.runtime.sendMessage({
            action: action,
            data: data
        }, function(response){
            if (callback !== null && typeof callback === "function"){
                callback(response);
            }
        });
    };

    // Public
    return {
        send: sendPrivate
    };
})();