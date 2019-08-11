/**
 * A global variable that allows interaction with chrome's localstorage.
 */
let Localstorage = (function(){
    // Private    
    
    /**
     * Retrieves a value based on a key.
     * @param {string|Array} keys 
     * @param {Function} callback 
     */
    let privateGet = function(keys, callback){
        if (callback === null || typeof callback !== "function") throw "Must pass callback to Localstorage.get().";

        chrome.storage.local.get(keys, callback);
    };
    /**
     * Saves information contained in the object.
     * @param {object} object 
     * @param {Function} callback 
     */
    let privateSet = function(object, callback){        
        if (callback !== null && typeof callback === "function"){
            chrome.storage.local.set(object, callback);
        } else {
            chrome.storage.local.set(object);
        }
    };
    /**
     * Removes a given key-value pair from localstorage.
     * @param {string|Array} keys 
     * @param {Function} callback 
     */
    let privateRemove = function(keys, callback){
        if (callback !== null && typeof callback === "function"){
            chrome.storage.local.remove(keys, callback);
        } else {
            chrome.storage.local.remove(keys);
        }
    };
    /**
     * Removes all data from localstorage.
     * @param {Function} callback 
     */
    let privateClear = function(callback){
        if (callback !== null && typeof callback === "function"){
            chrome.storage.local.clear(callback);
        } else {
            chrome.storage.local.clear();
        }    
    };

    // Public
    return {        
        get: privateGet,
        set: privateSet,
        remove: privateRemove,
        clear: privateClear
    };
})();