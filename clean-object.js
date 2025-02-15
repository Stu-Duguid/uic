TLT.registerBridgeCallbacks([{
    enabled: true,
    cbType: "messageRedirect",
    cbFunction: function (_msg, msgObj) {
        if (msgObj) {
            if (!msgObj.screenviewDone) {
                msgObj.screenviewDone = true; // to prevent endless loop
                
                /**
                 * Rename the properties that cannot be addressed with dot notation and require [] notation
                 * Also turn arrays into strings
                 * @param {Object} object the object to be cleaned
                 * @returns {Object} a copy of the object after cleaning
                */
               function cleanObject(object) {
                   if (typeof object !== "object") {
                       return object;
                    }
                    // if an array, convert to a string
                    if (Array.isArray(object)) {
                        return JSON.stringify(object);
                    }
                    // operate on a copy to not alter original
                    var prop, copy = {};
                    // object so iterate through properties and recursively clean them of objects
                    for (prop in object) {
                        copy[prop.replace(/(\.|-)/g, '_').replace(/^(\d)/, '_$1')] = cleanObject(object[prop]);
                    }
                    return copy;
                }
                if (msgObj.type === 5) {
                    msgObj.customEvent.data = cleanObject(msgObj.customEvent.data);
                }
                if (msgObj.type === 19) {
                    msgObj.dataLayer = cleanObject(msgObj.dataLayer);
                }
            }
        }
        return msgObj;
    }
}]);