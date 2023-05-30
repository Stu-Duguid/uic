/*!
 * Copyright (c) 2022 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 * @version 6.3.3
 */

var TLT = (function () {
    'use strict';

    var serviceCreators = {},
        services = {},
        isInitialized = false;

    function _init() {
        isInitialized = true;
    }

    function destroy() {
        var serviceName,
            service;

        for (serviceName in services) {
            if (services.hasOwnProperty(serviceName)) {
                service = services[serviceName];

                if (service && typeof service.destroy === "function") {
                    service.destroy();
                }

                delete services[serviceName];
            }
        }
    }

    return {
        browserApi: (function () {
            if (typeof document.addEventListener === 'function') {
                return {
                    addEventListener: function (target, eventName, handler) {
                        target.addEventListener(eventName, handler, false);
                    },
                    removeEventListener: function (target, eventName, handler) {
                        target.removeEventListener(eventName, handler, false);
                    }
                };
            }

            if (document.attachEvent) {
                return {
                    addEventListener: function (target, eventName, handler) {
                        target.attachEvent('on' + eventName, handler);
                    },
                    removeEventListener: function (target, eventName, handler) {
                        target.detachEvent('on' + eventName, handler);
                    }
                };
            }

            throw new Error("Unsupported browser");
        }()),

        addService: function (name, creator) {
            serviceCreators[name] = creator;
        },

        getService: function (name) {
            var service = null;

            if (name && serviceCreators[name]) {
                service = serviceCreators[name](this);
                services[name] = service;
                if (typeof service.init === "function") {
                    service.init();
                }
            }

            return service;
        },

        // Proxy function to parent page's TLT.getServiceConfig
        getServiceConfig: function (name) {
            var config = null;
            try {
                config = window.top.TLT.getServiceConfig(name);
            } catch (e) {
                config = null;
            }
            return config;
        },

        // Proxy function to parent page's TLT.getState
        getState: function () {
            var state;
            try {
                state = window.top.TLT.getState();
            } catch (e) {
                state = "unknown";
            }
            return state;
        },

        // Proxy object to parent page's TLT.utils
        utils: window.top.TLT ? window.top.TLT.utils : null,

        init: function () {
            if (!isInitialized) {
                this.getService("xdomain");
                _init();
            }
        },

        destroy: function () {
            if (isInitialized) {
                destroy();
            }
        }
    };
}());

(function () {
    'use strict';

    if (typeof document.addEventListener === 'function') {
        window.addEventListener("load", function () {
            TLT.init();
        }, false);
    } else if (typeof document.attachEvent !== 'undefined') {
        window.attachEvent("onload", function () {
            TLT.init();
        });
    } else {
        throw new Error("Unsupported browser");
    }
}());
/**
 * Copyright (c) 2022 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/*global TLT:true, window:true, ActiveXObject, Uint8Array */

/**
 * @name ajaxService
 * @namespace
 */
TLT.addService("ajax", function (core) {
    "use strict";

    var utils = core.utils,
        getXHRObject,
        useBeacon = false,
        useFetch = false,
        isInitialized = false;

    /**
     * Builds an array of HTTP headers from the given object.
     * @private
     * @function
     * @name ajaxService-convertHeadersToArray
     * @param {Object} headersObj Object containing name: value pairs.
     * @returns {Array} Array containing [name, value] pairs.
     */
    function convertHeadersToArray(headersObj) {
        var header = "",
            headers = [];

        for (header in headersObj) {
            if (headersObj.hasOwnProperty(header)) {
                headers.push([header, headersObj[header]]);
            }
        }
        return headers;
    }

    /**
     * Builds a query string from the given object
     * @private
     * @function
     * @name ajaxService-convertHeadersToQuery
     * @param {Object} headersObj Object containing name: value pairs.
     * @returns {String} Query string containing name=value pairs.
     */
    function convertHeadersToQuery(headersObj) {
        var header = "",
            headers = "?";

        for (header in headersObj) {
            if (headersObj.hasOwnProperty(header)) {
                headers += encodeURIComponent(header) +
                           "=" +
                           encodeURIComponent(headersObj[header]) +
                           "&";
            }
        }

        // Return the query string after removing the last character (which would be the extra '&' from the loop)
        return headers.slice(0, -1);
    }

    /**
     * @private
     * @function
     * @name ajaxService-makeBeaconCall
     * @see browserService.sendRequest
     */
    function makeBeaconCall(message) {
        var data,
            retVal = false,
            query = convertHeadersToQuery(message.headers);

        if (typeof message.data === "string") {
            data = message.data;
        } else {
            data = message.data ? new Uint8Array(message.data) : "";
        }

        retVal = navigator.sendBeacon(message.url + query, data);

        return retVal;
    }

    /**
     * @private
     * @function
     * @name ajaxService-makeFetchRequest
     * @see browserService.sendRequest
     */
    function makeFetchRequest(message) {
        var headers = message.headers || {},
            msgId = message.id || 0,
            fetchOptions = {
                method: message.type,
                headers: headers,
                body: message.data,
                mode: message.isCrossOrigin ? "cors" : "same-origin",
                credentials: message.isCrossOrigin ? "omit" : "same-origin",
                keepalive: !message.isCrossOrigin && message.isUnloading,
                cache: "no-store"
            },
            oncomplete = message.oncomplete || function () {};

        headers["X-Requested-With"] = "fetch";

        window.fetch(message.url, fetchOptions).then(function (response) {
            var result = {
                success: response.ok,
                statusCode: response.status,
                statusText: response.statusText,
                id: msgId
            };

            if (result.success) {
                response.text().then(function (responseData) {
                    try {
                        // Parse into JSON if possible.
                        result.data = JSON.parse(responseData);
                    } catch (e) {
                        // Else send raw text
                        result.data = responseData;
                    }
                    oncomplete(result);
                })["catch"](function (e) {
                    // NOTE: YUICompressor incompatibility with .catch resolved by using ["catch"]
                    result.statusCode = 1;
                    result.statusText = e.message;
                    oncomplete(result);
                });
            } else {
                oncomplete(result);
            }
        })["catch"](function (e) {
            // NOTE: YUICompressor incompatibility with .catch resolved by using ["catch"]
            var result = {
                success: false,
                statusCode: 2,
                statusText: e.message,
                id: msgId
            };
            oncomplete(result);
        });
    }

    /**
     * This function returns a function which can be passed to the XHR object
     * as a callback handler. It will call the callback with the correct
     * ajaxResponse interface.
     * @private
     * @function
     * @name ajaxService.w3c-wrapAjaxResponse
     * @param {Function} origCallback The original callback function which
     *        should be invoked when the request finishes with a normalized
     *        result object.
     * @return {Function} A function which could be passed as a callback
     *         handler to the XHR object.
     */
    function wrapAjaxResponse(origCallback) {

        // Sanity check
        if (typeof origCallback !== "function") {
            return;
        }

        /**
         * Calls the ajax callback function and provides the ajaxResponse in the correct format.
         * This Function gets called by the XHR callback method.
         * @private
         * @function
         * @name ajaxService.w3c-wrapAjaxResponse-ajaxResponseHandler
         * @param {Object} event The DOM event object or the Ajax response object in case of a
         *        direct call to the callback function.
         */
        return function ajaxResponseHandler(event) {
            var xhr,
                status,
                success = false;

            // Sanity check
            if (!event) {
                return;
            }

            xhr = event.target;
            if (!xhr) {
                // Synthetic call to the callback function
                return origCallback(event);
            }

            status = xhr.status;
            if (status >= 200 && status < 300) {
                success = true;
            }

            // Invoke original callback method with normalized response object
            origCallback({
                headers: utils.extractResponseHeaders(xhr.getAllResponseHeaders()),
                responseText: xhr.responseText,
                statusCode: status,
                statusText: xhr.statusText,
                id: xhr.id,
                success: success
            });
        };
    }

    /**
     * @private
     * @function
     * @name ajaxService-makeAjaxCall
     * @see browserService.sendRequest
     */
    function makeAjaxCall(message) {
        var xhr = getXHRObject(),
            headers = [["X-Requested-With", "XMLHttpRequest"]],
            timeout = 0,
            async = typeof message.async !== "boolean" ? true : message.async,
            header = "",
            callbackFn = null,
            i,
            length;

        if (message.headers) {
            headers = headers.concat(convertHeadersToArray(message.headers));
        }
        if (message.contentType) {
            headers.push(["Content-Type", message.contentType]);
        }
        xhr.open(message.type.toUpperCase(), message.url, async);

        for (i = 0, length = headers.length; i < length; i += 1) {
            header = headers[i];
            if (header[0] && header[1]) {
                xhr.setRequestHeader(header[0], header[1]);
            }
        }

        if (message.error) {
            message.error = wrapAjaxResponse(message.error);
            xhr.addEventListener("error", message.error);
        }

        xhr.onreadystatechange = callbackFn = function () {
            if (xhr.readyState === 4) {
                xhr.onreadystatechange = callbackFn = function () {};
                if (message.timeout) {
                    window.clearTimeout(timeout);
                }
                message.oncomplete({
                    id: message.id,
                    headers: utils.extractResponseHeaders(xhr.getAllResponseHeaders()),
                    responseText: (xhr.responseText || null),
                    statusCode: xhr.status,
                    statusText: xhr.statusText,
                    success: (xhr.status >= 200 && xhr.status < 300)
                });
                xhr = null;
            }
        };

        xhr.send(message.data || null);
        callbackFn();

        if (message.timeout) {
            timeout = window.setTimeout(function () {
                if (!xhr) {
                    return;
                }

                xhr.onreadystatechange = function () {};
                if (xhr.readyState !== 4) {
                    xhr.abort();
                    if (typeof message.error === "function") {
                        message.error({
                            id: message.id,
                            statusCode: xhr.status,
                            statusText: "timeout",
                            success: false
                        });
                    }
                }
                // oncomplete is called after success and error callbacks
                message.oncomplete({
                    id: message.id,
                    headers: utils.extractResponseHeaders(xhr.getAllResponseHeaders()),
                    responseText: (xhr.responseText || null),
                    statusCode: xhr.status,
                    statusText: "timeout",
                    success: false
                });

                xhr = null;
            }, message.timeout);
        }
    }

    function initAjaxService() {
        var queueServiceConfig = core.getServiceConfig("queue");

        if (typeof window.XMLHttpRequest !== 'undefined') {
            getXHRObject = function () {
                return new XMLHttpRequest();
            };
        } else {
            getXHRObject = function () {
                return new ActiveXObject("Microsoft.XMLHTTP");
            };
        }

        // queueServiceConfig can be null for tealeaf.frame.js
        if (queueServiceConfig) {
            // Enable Beacon use if configured
            useBeacon = utils.getValue(queueServiceConfig, "useBeacon", true) && (typeof navigator.sendBeacon === "function");

            // Enable Fetch use if supported
            useFetch = utils.getValue(queueServiceConfig, "useFetch", true) && (typeof window.fetch === "function");
        }

        isInitialized = true;
    }

    return {
        init: function () {
            if (!isInitialized) {
                initAjaxService();
            }
        },

        /**
         * Destroys service state
         */
        destroy: function () {
            isInitialized = false;
        },

        /**
         * Makes a HTTP network request to the server.
         * @param {Object} message A request object containing all the information
         *     neccessary for making the request.
         * @param {String} [message.contentType] Set to a string to override the default
         *     content type of the request.
         * @param {String} [message.data] A string containing data to POST to the server.
         * @param {Object} [message.headers] An object whose properties represent HTTP headers.
         * @param {Function} message.oncomplete A callback function to call when the
         *     request has completed.
         * @param {Integer} [message.timeout] The number of milliseconds to wait
         *     for a response before closing the Ajax request.
         * @param {String} [message.type="POST"] Either 'GET' or 'POST',
         *     indicating the type of the request to make.
         * @param {String} message.url The URL to send the request to.
         *     This should contain any required query string parameters.
         */
        sendRequest: function (message) {
            var makeXHRRequest = true,
                retVal;

            message.type = message.type || "POST";

            // If enabled, use Beacon API instead of XHR on page unload or when sending synchronous request
            if ((message.isUnloading || !message.async) && useBeacon) {
                makeXHRRequest = false;
                retVal = makeBeaconCall(message);
                if (!retVal) {
                    // If Beacon fails, fallback to XHR
                    makeXHRRequest = true;
                }
            }

            if (makeXHRRequest) {
                if (message.async && useFetch && !message.timeout) {
                    // Use fetch instead of async XHR
                    makeFetchRequest(message);
                } else {
                    makeAjaxCall(message);
                }
            }
        }
    };
});
/**
 * Copyright (c) 2022 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/*global TLT:true, window: true */

/**
 * @name xdomainService
 * @namespace
 */
TLT.addService("xdomain", function (core) {
    "use strict";

    var isInitialized = false,
        ajaxService = core.getService("ajax");

    function receiveMessage(event) {
        var request;

        if (typeof event !== "undefined" && typeof event.data !== "undefined" && typeof event.data.request !== "undefined") {
            request = event.data.request;

            if (typeof request.url !== "undefined" && typeof request.async !== "undefined" && typeof request.headers !== "undefined" && typeof request.data !== "undefined") {
                ajaxService.sendRequest({
                    oncomplete: function () {},
                    url: request.url,
                    async: request.async,
                    headers: request.headers,
                    data: request.data
                });
            }
        }
    }

    function initXDomainService() {
        var isIE = false;
        /*@cc_on
            isIE = true;
        @*/

        if (!isIE && typeof window.postMessage === "function") {
            core.browserApi.addEventListener(window, "message", receiveMessage);
        } else {
            window.sendMessage = function (event) {
                if (event) {
                    receiveMessage({
                        data: event
                    });
                }
            };
        }
    }

    function destroy() {
        core.browserApi.removeEventListener(window, "message", receiveMessage);
    }

    return {
        init: function () {
            if (!isInitialized) {
                initXDomainService();
            }
        },

        /**
         * Destroys service state
         */
        destroy: function () {
            destroy();
            isInitialized = false;
        }
    };
});
