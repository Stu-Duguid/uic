/*!
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 * @version 6.4.40
 * @flags NDEBUG
 */

/**
 * @fileOverview Defines the core of the system, namely the TLT object.
 * @exports TLT
 */
/*global window,TLT,TLFExtensionNotify*/
/*jshint loopfunc:true*/
/**
 * TLT (short for Tealeaf Technology) is the top-level object for the system. All
 * objects and functions live under TLT to prevent polluting the global
 * scope. This object also manages the modules and services on the page,
 * controlling their lifecycle, manages inter-module communication.
 * @namespace
 */
// Sanity check
if (window.TLT) {
    throw new Error("Attempting to recreate TLT. Library may be included more than once on the page.");
}
window.TLT = (function () {

    "use strict";

    /**
     * Cached services, utils and configuration references. These will be set in _init
     */
    let ajaxService,
        browserBaseService,
        browserService,
        configService,
        domCaptureService,
        queueService,
        serializerService,
        dataLayerModule,
        coreConfig,
        registeredPageshowListener,
        mousemoveDetectHandler,
        mousemoveDetected = false,
        utils,
        defaultConfig;

    /**
     * Event listener registered when library is destroyed to observe any
     * subsequent pageshow event on a return to the persisted page.
     * Invokes TLT.init to initialize the library in case of a subsequent
     * return to the persisted page due to BACK/FORWARD navigation.
     * @param {DOMEvent} event The "pageshow" DOM event.
     * @returns {undefined}
     */
    function pageshowListener(event) {
        if (window.TLT && event.persisted) {
            // Reset the prior termination reason (if any)
            TLT.terminationReason = "";
            // Initialize using prior cached configuration.
            TLT.init();
        }
    }

    /**
     * Create and add a screenview message to the default queue. Also
     * notifies any listeners of the screenview load/unload event.
     * @param {Enum} type "LOAD" or "UNLOAD" indicating the type
     * of screenview event.
     * @param {string} name User friendly name of the screenview.
     * @param {string} [referrerName] Name of the previous screenview that
     * is being replaced.
     * @param {object} [root] DOMNode which represents the root or
     * parent of this screenview. Usually this is a div container.
     * @returns {void}
     */
    function logScreenview(type, name, referrerName, root) {
        let dcid = null,
            screenviewMsg = null,
            replay = TLT.getModule("replay"),
            cookieModule = TLT.getModule("TLCookie"),
            performanceModule = TLT.getModule("performance"),
            webEvent = null,
            urlInfo = utils.getOriginAndPath();

        // Sanity checks
        if (!name || typeof name !== "string") {
            return;
        }
        if (!referrerName || typeof referrerName !== "string") {
            referrerName = "";
        }

        screenviewMsg = {
            type: 2,
            screenview: {
                type: type,
                name: name,
                originalUrl: urlInfo.path,
                url: TLT.normalizeUrl("", urlInfo.path, 2),
                host: urlInfo.origin,
                referrer: referrerName,
                title: document.title,
                queryParams: urlInfo.queryParams
            }
        };

        // TODO: Send a fully populated WebEvent object.
        // Ideally, want to use the publishEvent to route this to the correct modules.
        if (type === "LOAD") {
            webEvent = {
                type: "screenview_load",
                name: name
            };
        } else if (type === "UNLOAD") {
            webEvent = {
                type: "screenview_unload",
                name: name
            };
        }

        if (webEvent && replay) {
            dcid = replay.onevent(webEvent);
        }

        // If DOM Capture was triggered for this add it to the screenview message.
        if (dcid) {
            screenviewMsg.dcid = dcid;
        }

        if (type === "LOAD" || type === "UNLOAD") {
            queueService.post("", screenviewMsg);
        }

        if (webEvent && cookieModule) {
            cookieModule.onevent(webEvent);
        }

        if (webEvent && performanceModule) {
            performanceModule.onevent(webEvent);
        }

        if (webEvent && dataLayerModule) {
            dataLayerModule.onevent(webEvent);
        }
    }

    let tltStartTime = (new Date()).getTime(),
        tltPageId,

        tltTabId,

        tltSessionCookieInfo = {},

        /**
         * A collection of module information. The keys in this object are the
         * module names and the values are an object consisting of three pieces
         * of information: the creator function, the instance, and context object
         * for that module.
         * @private
         */
        modules = {},

        /**
         * A collection of service information. The keys in this object are the
         * service names and the values are an object consisting of two pieces
         * of information: the creator function and the service object.
         * @private
         */
        services = {},

        /**
         * Indicates if the core has been initialized or not.
         * @private
         */
        initialized = false,
        state = null,

        /**
         * Checks whether given frame is blacklisted (in the config) or not.
         * @function
         * @private
         * @param {DOMElement} iframe an element to examine
         * @return {boolean} true if given iframe is blacklisted, false otherwise
         */
        isFrameBlacklisted = (function () {
            let blacklistedFrames,
                checkedFrames = [];

            function prepareBlacklistedFrames(scope) {
                let blacklist = coreConfig.framesBlacklist,
                    foundFrames,
                    i;
                blacklistedFrames = blacklistedFrames || [];
                scope = scope || null;
                if (typeof blacklist !== "undefined" && blacklist.length > 0) {
                    for (i = 0; i < blacklist.length; i += 1) {
                        foundFrames = browserService.queryAll(blacklist[i], scope);
                        if (foundFrames && foundFrames.length > 0) {
                            blacklistedFrames = blacklistedFrames.concat(foundFrames);
                        }
                    }
                    checkedFrames = checkedFrames.concat(browserService.queryAll('iframe', scope));
                }
            }

            function _isFrameBlacklisted(iframe) {
                if (utils.indexOf(checkedFrames, iframe) < 0) {
                    prepareBlacklistedFrames(iframe.ownerDocument);
                }
                return utils.indexOf(blacklistedFrames, iframe) > -1;
            }

            _isFrameBlacklisted.clearCache = function () {
                blacklistedFrames = null;
            };

            return _isFrameBlacklisted;
        }()),

        /**
         * Last clicked element, needed for IE and 'beforeunload'
         * @private
         */
        lastClickedElement = null,

        /**
         * List of service passthroughs. These are methods that are called
         * from TLT and simply pass through to the given service without
         * changing the arguments. Doing this dynamically keeps the code
         * smaller and easier to update.
         * @private
         */
        servicePassthroughs = {

            "config": [

                /**
                 * Returns the global configuration object (the one passed to init()).
                 * @name getConfig
                 * @memberOf TLT
                 * @function
                 * @returns {Object} The global configuration object.
                 */
                "getConfig",

                /**
                 * Returns the base default global configuration object.
                 * @name getDefaultConfig
                 * @memberOf TLT
                 * @function
                 * @returns {Object} The base default global configuration object.
                 */
                "getDefaultConfig",

                /**
                 * Updates the global configuration object (the one passed to init()).
                 * @name updateConfig
                 * @memberOf TLT
                 * @function
                 * @returns {void}
                 */
                "updateConfig",

                /**
                 * Returns the core configuration object.
                 * @name getCoreConfig
                 * @memberOf TLT
                 * @function
                 * @returns {Object} The core configuration object.
                 */
                "getCoreConfig",

                /**
                 * Updates the core configuration object.
                 * @name updateCoreConfig
                 * @memberOf TLT
                 * @function
                 * @param {Object} config The updated configuration object.
                 * @returns {void}
                 */
                "updateCoreConfig",

                /**
                 * Returns the configuration object for a module.
                 * @name getModuleConfig
                 * @memberOf TLT
                 * @function
                 * @param {String} moduleName The name of the module to retrieve config data for.
                 * @returns {Object} The configuration object for the given module.
                 */
                "getModuleConfig",

                /**
                 * Updates a configuration object for a module.
                 * @name updateModuleConfig
                 * @memberOf TLT
                 * @function
                 * @param {String} moduleName The name of the module to retrieve config data for.
                 * @param {Object} config The updated configuration object.
                 * @returns {void}
                 */
                "updateModuleConfig",

                /**
                 * Returns a configuration object for a service.
                 * @name getServiceConfig
                 * @memberOf TLT
                 * @function
                 * @param {String} serviceName The name of the service to retrieve config data for.
                 * @returns {Object} The configuration object for the given module.
                 */
                "getServiceConfig",

                /**
                 * Updates a configuration object for a service.
                 * @name updateServiceConfig
                 * @memberOf TLT
                 * @function
                 * @param {String} serviceName The name of the service to retrieve config data for.
                 * @param {Object} config The updated configuration object.
                 * @returns {void}
                 */
                "updateServiceConfig"

            ],

            "queue": [
                /**
                 * Send event information to the module's default queue.
                 * This doesn't necessarily force the event data to be sent to the server,
                 * as this behavior is defined by the queue itself.
                 * @name post
                 * @memberOf TLT
                 * @function
                 * @param  {String} moduleName The name of the module saving the event.
                 * @param  {Object} queueEvent The event information to be saved to the queue.
                 * @param  {String} [queueId]    Specifies the ID of the queue to receive the event.
                 * @returns {void}
                 */
                "post",
                /**
                 * Enable/disable the automatic flushing of all queues.
                 * Either periodically by a timer or whenever the queue threshold is reached.
                 * @name setAutoFlush
                 * @memberOf TLT
                 * @function
                 * @param {Boolean} flag Set this to false to disable flushing
                 *                 or set it to true to enable automatic flushing (default)
                 * @returns {void}
                 */
                "setAutoFlush",
                /**
                 * Forces all queues to send their data to the server.
                 * @name flushAll
                 * @memberOf TLT
                 * @function
                 */
                "flushAll",
                /**
                 * Enables/disables XHR Logging
                 * @name setXHRLog
                 * @memberOf TLT
                 * @function
                 */
                "setXHRLog"

            ],

            "browserBase": [
                /**
                 * Calculates the xpath of the given DOM Node.
                 * @name getXPathFromNode
                 * @memberOf TLT
                 * @function
                 * @param {DOMElement} node The DOM node who's xpath is to be calculated.
                 * @returns {String} The calculated xpath.
                 */
                "getXPathFromNode",

                /**
                 * Let the UIC library process a DOM event, which was prevented
                 * from bubbling by the application.
                 * @name processDOMEvent
                 * @memberOf TLT
                 * @function
                 * @param {Object} event The browsers event object which was prevented.
                 */
                "processDOMEvent"
            ]
        },

        /**
         * Provides methods for handling load/unload events to make sure that this
         * kind of events will be handled independently to browser caching mechanism
         * @namespace
         * @private
         */
        loadUnloadHandler = (function () {
            let status = {};

            return {

                /**
                 * Normalizes the events specified in the configuration in the following ways:
                 * - For each load/unload module event adds corresponding pageshow/pagehide event.
                 * - Adds beforeunload
                 * - Adds propertychange if W3C service is being used for correct operation on legacy IE.
                 * @param {String} moduleName Name of the module
                 * @param {Array} moduleEvents An array of module event configs
                 * @param {object} [localTop] Local window element
                 * @param {object} [documentScope] document element
                 */
                normalizeModuleEvents: function (moduleName, moduleEvents, localTop, documentScope) {
                    let modStatus = status[moduleName],
                        load = false,
                        unload = false;

                    localTop = localTop || core._getLocalTop();

                    if (modStatus) {
                        // Normalization has already occurred. This could be a call from rebind.
                        return;
                    }

                    status[moduleName] = {
                        loadFired: false,
                        pageHideFired: false
                    };

                    utils.forEach(moduleEvents, function (eventConfig) {
                        switch (eventConfig.name) {
                        case "load":
                            load = true;
                            moduleEvents.push(utils.mixin(utils.mixin({}, eventConfig), {
                                name: "pageshow"
                            }));
                            break;

                        case "unload":
                            unload = true;
                            moduleEvents.push(utils.mixin(utils.mixin({}, eventConfig), {
                                name: "pagehide"
                            }));
                            moduleEvents.push(utils.mixin(utils.mixin({}, eventConfig), {
                                name: "beforeunload"
                            }));
                            break;

                        // IE6, IE7 and IE8 - catching 'onpropertychange' event to
                        // simulate correct 'change' events on radio and checkbox.
                        case "change":
                            if (utils.isLegacyIE && core.getFlavor() === "w3c") {
                                moduleEvents.push(utils.mixin(utils.mixin({}, eventConfig), {
                                    name: "propertychange"
                                }));
                            }
                            break;
                        }
                    });
                    if (!load && !unload) {
                        delete status[moduleName];
                        return;
                    }
                    status[moduleName].silentLoad = !load;
                    status[moduleName].silentUnload = !unload;
                    if (!load) {
                        moduleEvents.push({name: "load", target: localTop});
                    }
                    if (!unload) {
                        moduleEvents.push({name: "unload", target: localTop});
                    }
                },

                /**
                 * Checks if event can be published for the module(s) or not.
                 * The negative case can take place for load/unload events only, to avoid
                 * redundancy in handler execution. If as example load event was handled
                 * properly, the pageshow event will be ignored.
                 * @param {string} moduleName Name of the module
                 * @param {WebEvent} event An instance of WebEvent
                 * @return {boolean}
                 */
                canPublish: function (moduleName, event) {
                    let mod;
                    if (status.hasOwnProperty(moduleName) === false) {
                        return true;
                    }
                    mod = status[moduleName];
                    switch (event.type) {
                    case "load":
                        mod.pageHideFired = false;
                        mod.loadFired = true;
                        return !mod.silentLoad;
                    case "pageshow":
                        mod.pageHideFired = false;
                        event.type = "load";
                        return !mod.loadFired && !mod.silentLoad;
                    case "pagehide":
                        event.type = "unload";
                        mod.loadFired = false;
                        mod.pageHideFired = true;
                        return !mod.silentUnload;
                    case "unload":
                    case "beforeunload":
                        event.type = "unload";
                        mod.loadFired = false;
                        return !mod.pageHideFired && !mod.silentUnload;
                    }
                    return true;
                },

                /**
                 * Checks if event indicates the core context is unloading.
                 * @param {WebEvent} event An instance of WebEvent
                 * @return {boolean}
                 */
                isUnload: function (event) {
                    return typeof event === "object" ?
                            (event.type === "unload" || event.type === "beforeunload" || event.type === "pagehide") :
                            false;
                }
            };

        }()),

        /**
         * The WebEvent object being handled in publishEvent.
         * @private
         */
        currentWebEvent = {},

        /**
         * Keeps track of the events being handled.
         * @private
         */
        events = {},

        /**
         * Keeps track of callback functions registered by the iOS and Android native libraries.
         * These are used for communication with the native library.
         */
        bridgeCallbacks = {},

        mutationCallbacks = [],

        /**
         * init implementation (defined later)
         * @private
         */
        _init = function () {},
        _callback = null,

        /**
         * Flag to track if TLT.init API can been called.
         * @private
         */
        okToCallInit = true,

        // Placeholder for the inactivity timeout setup function, defined after core.
        resetInactivityTimer = function () {},

        // Keeps track if the queue was flushed after the 1st full DOM capture.
        fullDOMFlushed = false,

        /**
         * Keeps track of the URL path and hash. If either value changes,
         * then logs the appropriate screenview unload/load message.
         */
        detectScreenviewChange = (function () {
            let location = window.location,
                prevPathname = location.pathname,
                prevHash = location.hash,
                prevScreenview = "";

            return function () {
                var currPathname = location.pathname,
                    currHash = location.hash,
                    currScreenview = prevScreenview;

                // Check if pathname or hash do not match previously saved values
                if (currPathname !== prevPathname) {
                    currScreenview = TLT.normalizeUrl("", currPathname + currHash, 2);
                } else if (currHash !== prevHash) {
                    currScreenview = TLT.normalizeUrl("", currHash, 2);
                }

                // Has the screenview changed?
                if (currScreenview !== prevScreenview) {
                    if (prevScreenview) {
                        // log UNLOAD of previous screenview
                        logScreenview("UNLOAD", prevScreenview);
                    }
                    // log LOAD of the current screenview
                    logScreenview("LOAD", currScreenview);
                    prevScreenview = currScreenview;
                    prevPathname = currPathname;
                    prevHash = currHash;
                }
            };
        }()),

        /**
         * Checks if the user-agent matches with any entry in the list of blocked user-agents.
         * @param {Array} blockList The list of blocked user-agents. Can contain a regex pattern or a string.
         * @param {String} ua The user agent string.
         * @returns {String|null} Matched value or null if no match.
         */
        getBlockedUA = function (blockList, ua) {
            var i,
                len,
                blockListItem,
                regex,
                matchResult,
                matchValue = null;

            // Sanity check
            if (!blockList || !ua) {
                return matchValue;
            }

            for (i = 0, len = blockList.length; i < len; i += 1) {
                blockListItem = blockList[i];
                switch (typeof blockListItem) {
                case "object":
                    // Regex
                    regex = new RegExp(blockListItem.regex, blockListItem.flags);
                    matchResult = regex.exec(ua);
                    if (matchResult) {
                        matchValue = matchResult[0];
                    }
                    break;
                case "string":
                    if (ua.indexOf(blockListItem) !== -1) {
                        matchValue = blockListItem;
                    }
                    break;
                default:
                    break;
                }
            }

            return matchValue;
        },

        /**
         * Checks if the element is on the list of blocked elements.
         * @param {DOMElement} element The element to be checked.
         * @param {DOMElement} [scope] Optional scope for evaluating the CSS selectors in the block list.
         * @returns {Boolean} true if the element is on the list of blocked elements, false otherwise.
         */
        isElementBlocked = function (element, scope) {
            var i, j,
                len,
                isBlocked = false,
                blockedList = coreConfig.blockedElements,
                blockedElem,
                blockedElems,
                blockedElemsLen;

            // Sanity check
            if (!blockedList || !blockedList.length) {
                // Self-rewrite to optimize for next time
                isElementBlocked = function () { return false; };
                return isBlocked;
            }

            // Sanity check
            if (!element || !element.nodeType) {
                return isBlocked;
            }

            scope = scope || utils.getDocument(element);
            for (i = 0, len = blockedList.length; i < len && !isBlocked; i += 1) {
                blockedElems = browserService.queryAll(blockedList[i], scope);
                for (j = 0, blockedElemsLen = blockedElems.length; j < blockedElemsLen && !isBlocked; j += 1) {
                    blockedElem = blockedElems[j];
                    isBlocked = blockedElem.contains ? blockedElem.contains(element) : blockedElem === element;
                }
            }

            return isBlocked;
        },

        /**
         * Checks if link has one of the blacklisted protocols.
         */
        hasExcludedProtocol = function (element) {
            var hasExcluded = false,
                list = ["intent:", "mailto:", "sms:", "tel:"];

            if (element && utils.getTagName(element) === "a" && list.indexOf(element.protocol) !== -1) {
                hasExcluded = true;
            }
            return hasExcluded;
        },

        /**
         * Returns the tab id from session storage if it exists.
         * If not, creates a tab id and stores it in session storage.
         * Returns null if session storage is not accessible.
         */
        getTabIndex = function () {
            var tabId = null,
                tabIdKey = "tltTabId";

            try {
                // Get the current tab id from session storage.
                tabId = sessionStorage.getItem(tabIdKey);
                if (!tabId) {
                    // Create a new tab id since one doesn't already exist.
                    tabId = utils.getRandomString(4);
                    sessionStorage.setItem(tabIdKey, tabId);
                }
            } catch (e) {
            }
            return tabId;
        },

        // main interface for the core
        core = /**@lends TLT*/ {


            /**
             * @returns Returns tltSessionCookieInfo set by TLCookie module.
             */
            getTLTSessionCookieInfo: function () {
                return tltSessionCookieInfo;
            },

            /**
             * Load cached vars for unit tests.
             */
            _loadGlobalsForUnitTesting: function (global) {
                utils = global.utils;
                ajaxService = global.getService("ajax");
                browserBaseService = global.getService("browserBase");
                browserService = global.getService("browser");
                configService = global.getService("config");
                domCaptureService = global.getService("domCapture");
                queueService = global.getService("queue");
                serializerService = global.getService("serializer");
                dataLayerModule = global.getModule("dataLayer");
                coreConfig = configService ? configService.getCoreConfig() : null;
            },

            /**
             * @returns {integer} Returns the recorded timestamp in milliseconds corresponding to when the TLT object was created.
             */
            getStartTime: function () {
                return tltStartTime;
            },

            /**
             * @returns {String} Returns the unique page id corresponding to this page instance.
             */
            getPageId: function () {
                return tltPageId || "#";
            },

            /**
             * @returns {integer} Returns the tab id.
             */
            getTabId: function () {
                return tltTabId;
            },

            /**
             * @returns {Boolean} Returns true if the mousemove event was triggered, false otherwise.
             */
            isMousemovementDetected: function () {
                return mousemoveDetected;
            },

            /**
             * Determines tltSessionCookieInfo set by TLCookie module.
             * @param {String} moduleName
             * @param {String} cookieName
             * @param {String} cookieValue
             * @returns {void}
             */
            setSessionCookieInfo: function (moduleName, cookieName, cookieValue) {
                tltSessionCookieInfo.tltCookieName = cookieName;
                tltSessionCookieInfo.tltCookieValue = cookieValue;
            },

            /**
             * @returns {String} The library version string.
             */
            getLibraryVersion: function () {
                return "6.4.40";
            },

            /**
             * @returns {Object} Returns the WebEvent object currently being handled by _publishEvent
             */
            getCurrentWebEvent: function () {
                return currentWebEvent;
            },

            normalizeUrl: function (moduleName, url, messageType) {
                var config,
                    urlFunction;

                config = this.getCoreConfig();
                if (config.normalization && config.normalization.urlFunction) {
                    urlFunction = config.normalization.urlFunction;
                    if (typeof urlFunction === "string") {
                        urlFunction = utils.access(urlFunction);
                    }

                    try {
                        url = urlFunction(url, messageType);
                    } catch (e) {
                    }
                }
                return url;
            },

            /**
             * @returns {Number} Returns the offset from page startTime.
             */
            getCurrentOffset: function () {
                return this.getService("message").getCurrentOffset();
            },

            //---------------------------------------------------------------------
            // Core Lifecycle
            //---------------------------------------------------------------------

            /**
             * Initializes the system. The default configuration information is passed to the
             * config service to manage it. All modules are started and web events
             * are hooked up.
             * @param {String} [appKey] The application key from SaaS organization.
             * @param {String} [postUrl] The collector url to post data.
             * @returns {void}
             */
            initLib: function (appKey, postUrl) {
                return this.initLibAdv(appKey, postUrl, {}, true, true, true, true, true);
            },

            /**
             * Initializes the system based on configuration information is passed to the
             * config service to manage it. All modules are started and web events
             * are hooked up. There are also options to add extra libaries needed for Tealeaf.
             * 
             * @param {String} [appKey] The application key from SaaS organization.
             * @param {String} [postUrl] The collector url to post data.
             * @param {Object} [newConfig] Configuration object to use without application key and post url.
             * @param {Boolean} [addPako] Whether to add pako.
             * @param {Boolean} [addHammer] Whether to add HammerJS.
             * @param {Boolean} [addSafariPolyFill] Whether to add construct-style-sheets-polyfill 3.1.0 to Safari browser to help with dynamic styles.
             * @param {Boolean} [addAjaxListener] Whether to add ajax listener.
             * @param {Boolean} [addRestartTLTforSPA] Whether to add Restart TLT for SPA helper.
             * @returns {Object} Configuration object used.
             */
            initLibAdv: function (appKey, postUrl, newConfig, addPako, addHammer, addSafariPolyFill, addAjaxListener, addRestartTLTforSPA) {
                if (typeof pako === "object" && pako !== undefined && pako.deflate !== undefined && pako.Deflate !== undefined) {
                    if (console) {
                        console.info("Pako is already loaded.");
                    }
                } else if (addPako === true) {
                    /*!
                     * pako deflate
                     * @version 1.0.11 with Dojo/ReactJS fix
                     */
                    !function(t){window.pako=t()}(function(){return function i(s,h,l){function o(e,t){if(!h[e]){if(!s[e]){var a="function"==typeof require&&require;if(!t&&a)return a(e,!0);if(_)return _(e,!0);var n=new Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}var r=h[e]={exports:{}};s[e][0].call(r.exports,function(t){return o(s[e][1][t]||t)},r,r.exports,i,s,h,l)}return h[e].exports}for(var _="function"==typeof require&&require,t=0;t<l.length;t++)o(l[t]);return o}({1:[function(t,e,a){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;a.assign=function(t){for(var e,a,n=Array.prototype.slice.call(arguments,1);n.length;){var r=n.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var i in r)e=r,a=i,Object.prototype.hasOwnProperty.call(e,a)&&(t[i]=r[i])}}return t},a.shrinkBuf=function(t,e){return t.length===e?t:t.subarray?t.subarray(0,e):(t.length=e,t)};var r={arraySet:function(t,e,a,n,r){if(e.subarray&&t.subarray)t.set(e.subarray(a,a+n),r);else for(var i=0;i<n;i++)t[r+i]=e[a+i]},flattenChunks:function(t){var e,a,n,r,i,s;for(e=n=0,a=t.length;e<a;e++)n+=t[e].length;for(s=new Uint8Array(n),e=r=0,a=t.length;e<a;e++)i=t[e],s.set(i,r),r+=i.length;return s}},i={arraySet:function(t,e,a,n,r){for(var i=0;i<n;i++)t[r+i]=e[a+i]},flattenChunks:function(t){return[].concat.apply([],t)}};a.setTyped=function(t){t?(a.Buf8=Uint8Array,a.Buf16=Uint16Array,a.Buf32=Int32Array,a.assign(a,r)):(a.Buf8=Array,a.Buf16=Array,a.Buf32=Array,a.assign(a,i))},a.setTyped(n)},{}],2:[function(t,e,a){"use strict";var l=t("./common"),r=!0,i=!0;try{String.fromCharCode.apply(null,[0])}catch(t){r=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(t){i=!1}for(var o=new l.Buf8(256),n=0;n<256;n++)o[n]=252<=n?6:248<=n?5:240<=n?4:224<=n?3:192<=n?2:1;function _(t,e){if(e<65534&&(t.subarray&&i||!t.subarray&&r))return String.fromCharCode.apply(null,l.shrinkBuf(t,e));for(var a="",n=0;n<e;n++)a+=String.fromCharCode(t[n]);return a}o[254]=o[254]=1,a.string2buf=function(t){var e,a,n,r,i,s=t.length,h=0;for(r=0;r<s;r++)55296==(64512&(a=t.charCodeAt(r)))&&r+1<s&&56320==(64512&(n=t.charCodeAt(r+1)))&&(a=65536+(a-55296<<10)+(n-56320),r++),h+=a<128?1:a<2048?2:a<65536?3:4;for(e=new l.Buf8(h),r=i=0;i<h;r++)55296==(64512&(a=t.charCodeAt(r)))&&r+1<s&&56320==(64512&(n=t.charCodeAt(r+1)))&&(a=65536+(a-55296<<10)+(n-56320),r++),a<128?e[i++]=a:(a<2048?e[i++]=192|a>>>6:(a<65536?e[i++]=224|a>>>12:(e[i++]=240|a>>>18,e[i++]=128|a>>>12&63),e[i++]=128|a>>>6&63),e[i++]=128|63&a);return e},a.buf2binstring=function(t){return _(t,t.length)},a.binstring2buf=function(t){for(var e=new l.Buf8(t.length),a=0,n=e.length;a<n;a++)e[a]=t.charCodeAt(a);return e},a.buf2string=function(t,e){var a,n,r,i,s=e||t.length,h=new Array(2*s);for(a=n=0;a<s;)if((r=t[a++])<128)h[n++]=r;else if(4<(i=o[r]))h[n++]=65533,a+=i-1;else{for(r&=2===i?31:3===i?15:7;1<i&&a<s;)r=r<<6|63&t[a++],i--;1<i?h[n++]=65533:r<65536?h[n++]=r:(r-=65536,h[n++]=55296|r>>10&1023,h[n++]=56320|1023&r)}return _(h,n)},a.utf8border=function(t,e){var a;for((e=e||t.length)>t.length&&(e=t.length),a=e-1;0<=a&&128==(192&t[a]);)a--;return a<0?e:0===a?e:a+o[t[a]]>e?a:e}},{"./common":1}],3:[function(t,e,a){"use strict";e.exports=function(t,e,a,n){for(var r=65535&t|0,i=t>>>16&65535|0,s=0;0!==a;){for(a-=s=2e3<a?2e3:a;i=i+(r=r+e[n++]|0)|0,--s;);r%=65521,i%=65521}return r|i<<16|0}},{}],4:[function(t,e,a){"use strict";var h=function(){for(var t,e=[],a=0;a<256;a++){t=a;for(var n=0;n<8;n++)t=1&t?3988292384^t>>>1:t>>>1;e[a]=t}return e}();e.exports=function(t,e,a,n){var r=h,i=n+a;t^=-1;for(var s=n;s<i;s++)t=t>>>8^r[255&(t^e[s])];return-1^t}},{}],5:[function(t,e,a){"use strict";var l,u=t("../utils/common"),o=t("./trees"),f=t("./adler32"),c=t("./crc32"),n=t("./messages"),_=0,d=4,p=0,g=-2,m=-1,b=4,r=2,v=8,w=9,i=286,s=30,h=19,y=2*i+1,k=15,z=3,x=258,B=x+z+1,A=42,C=113,S=1,j=2,E=3,U=4;function D(t,e){return t.msg=n[e],e}function I(t){return(t<<1)-(4<t?9:0)}function O(t){for(var e=t.length;0<=--e;)t[e]=0}function q(t){var e=t.state,a=e.pending;a>t.avail_out&&(a=t.avail_out),0!==a&&(u.arraySet(t.output,e.pending_buf,e.pending_out,a,t.next_out),t.next_out+=a,e.pending_out+=a,t.total_out+=a,t.avail_out-=a,e.pending-=a,0===e.pending&&(e.pending_out=0))}function T(t,e){o._tr_flush_block(t,0<=t.block_start?t.block_start:-1,t.strstart-t.block_start,e),t.block_start=t.strstart,q(t.strm)}function L(t,e){t.pending_buf[t.pending++]=e}function N(t,e){t.pending_buf[t.pending++]=e>>>8&255,t.pending_buf[t.pending++]=255&e}function R(t,e){var a,n,r=t.max_chain_length,i=t.strstart,s=t.prev_length,h=t.nice_match,l=t.strstart>t.w_size-B?t.strstart-(t.w_size-B):0,o=t.window,_=t.w_mask,d=t.prev,u=t.strstart+x,f=o[i+s-1],c=o[i+s];t.prev_length>=t.good_match&&(r>>=2),h>t.lookahead&&(h=t.lookahead);do{if(o[(a=e)+s]===c&&o[a+s-1]===f&&o[a]===o[i]&&o[++a]===o[i+1]){i+=2,a++;do{}while(o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&i<u);if(n=x-(u-i),i=u-x,s<n){if(t.match_start=e,h<=(s=n))break;f=o[i+s-1],c=o[i+s]}}}while((e=d[e&_])>l&&0!=--r);return s<=t.lookahead?s:t.lookahead}function H(t){var e,a,n,r,i,s,h,l,o,_,d=t.w_size;do{if(r=t.window_size-t.lookahead-t.strstart,t.strstart>=d+(d-B)){for(u.arraySet(t.window,t.window,d,d,0),t.match_start-=d,t.strstart-=d,t.block_start-=d,e=a=t.hash_size;n=t.head[--e],t.head[e]=d<=n?n-d:0,--a;);for(e=a=d;n=t.prev[--e],t.prev[e]=d<=n?n-d:0,--a;);r+=d}if(0===t.strm.avail_in)break;if(s=t.strm,h=t.window,l=t.strstart+t.lookahead,o=r,_=void 0,_=s.avail_in,o<_&&(_=o),a=0===_?0:(s.avail_in-=_,u.arraySet(h,s.input,s.next_in,_,l),1===s.state.wrap?s.adler=f(s.adler,h,_,l):2===s.state.wrap&&(s.adler=c(s.adler,h,_,l)),s.next_in+=_,s.total_in+=_,_),t.lookahead+=a,t.lookahead+t.insert>=z)for(i=t.strstart-t.insert,t.ins_h=t.window[i],t.ins_h=(t.ins_h<<t.hash_shift^t.window[i+1])&t.hash_mask;t.insert&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[i+z-1])&t.hash_mask,t.prev[i&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=i,i++,t.insert--,!(t.lookahead+t.insert<z)););}while(t.lookahead<B&&0!==t.strm.avail_in)}function F(t,e){for(var a,n;;){if(t.lookahead<B){if(H(t),t.lookahead<B&&e===_)return S;if(0===t.lookahead)break}if(a=0,t.lookahead>=z&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+z-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!==a&&t.strstart-a<=t.w_size-B&&(t.match_length=R(t,a)),t.match_length>=z)if(n=o._tr_tally(t,t.strstart-t.match_start,t.match_length-z),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=z){for(t.match_length--;t.strstart++,t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+z-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart,0!=--t.match_length;);t.strstart++}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+1])&t.hash_mask;else n=o._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(n&&(T(t,!1),0===t.strm.avail_out))return S}return t.insert=t.strstart<z-1?t.strstart:z-1,e===d?(T(t,!0),0===t.strm.avail_out?E:U):t.last_lit&&(T(t,!1),0===t.strm.avail_out)?S:j}function K(t,e){for(var a,n,r;;){if(t.lookahead<B){if(H(t),t.lookahead<B&&e===_)return S;if(0===t.lookahead)break}if(a=0,t.lookahead>=z&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+z-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=z-1,0!==a&&t.prev_length<t.max_lazy_match&&t.strstart-a<=t.w_size-B&&(t.match_length=R(t,a),t.match_length<=5&&(1===t.strategy||t.match_length===z&&4096<t.strstart-t.match_start)&&(t.match_length=z-1)),t.prev_length>=z&&t.match_length<=t.prev_length){for(r=t.strstart+t.lookahead-z,n=o._tr_tally(t,t.strstart-1-t.prev_match,t.prev_length-z),t.lookahead-=t.prev_length-1,t.prev_length-=2;++t.strstart<=r&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+z-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!=--t.prev_length;);if(t.match_available=0,t.match_length=z-1,t.strstart++,n&&(T(t,!1),0===t.strm.avail_out))return S}else if(t.match_available){if((n=o._tr_tally(t,0,t.window[t.strstart-1]))&&T(t,!1),t.strstart++,t.lookahead--,0===t.strm.avail_out)return S}else t.match_available=1,t.strstart++,t.lookahead--}return t.match_available&&(n=o._tr_tally(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<z-1?t.strstart:z-1,e===d?(T(t,!0),0===t.strm.avail_out?E:U):t.last_lit&&(T(t,!1),0===t.strm.avail_out)?S:j}function M(t,e,a,n,r){this.good_length=t,this.max_lazy=e,this.nice_length=a,this.max_chain=n,this.func=r}function P(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=v,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new u.Buf16(2*y),this.dyn_dtree=new u.Buf16(2*(2*s+1)),this.bl_tree=new u.Buf16(2*(2*h+1)),O(this.dyn_ltree),O(this.dyn_dtree),O(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new u.Buf16(k+1),this.heap=new u.Buf16(2*i+1),O(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new u.Buf16(2*i+1),O(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function G(t){var e;return t&&t.state?(t.total_in=t.total_out=0,t.data_type=r,(e=t.state).pending=0,e.pending_out=0,e.wrap<0&&(e.wrap=-e.wrap),e.status=e.wrap?A:C,t.adler=2===e.wrap?0:1,e.last_flush=_,o._tr_init(e),p):D(t,g)}function J(t){var e,a=G(t);return a===p&&((e=t.state).window_size=2*e.w_size,O(e.head),e.max_lazy_match=l[e.level].max_lazy,e.good_match=l[e.level].good_length,e.nice_match=l[e.level].nice_length,e.max_chain_length=l[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=z-1,e.match_available=0,e.ins_h=0),a}function Q(t,e,a,n,r,i){if(!t)return g;var s=1;if(e===m&&(e=6),n<0?(s=0,n=-n):15<n&&(s=2,n-=16),r<1||w<r||a!==v||n<8||15<n||e<0||9<e||i<0||b<i)return D(t,g);8===n&&(n=9);var h=new P;return(t.state=h).strm=t,h.wrap=s,h.gzhead=null,h.w_bits=n,h.w_size=1<<h.w_bits,h.w_mask=h.w_size-1,h.hash_bits=r+7,h.hash_size=1<<h.hash_bits,h.hash_mask=h.hash_size-1,h.hash_shift=~~((h.hash_bits+z-1)/z),h.window=new u.Buf8(2*h.w_size),h.head=new u.Buf16(h.hash_size),h.prev=new u.Buf16(h.w_size),h.lit_bufsize=1<<r+6,h.pending_buf_size=4*h.lit_bufsize,h.pending_buf=new u.Buf8(h.pending_buf_size),h.d_buf=1*h.lit_bufsize,h.l_buf=3*h.lit_bufsize,h.level=e,h.strategy=i,h.method=a,J(t)}l=[new M(0,0,0,0,function(t,e){var a=65535;for(a>t.pending_buf_size-5&&(a=t.pending_buf_size-5);;){if(t.lookahead<=1){if(H(t),0===t.lookahead&&e===_)return S;if(0===t.lookahead)break}t.strstart+=t.lookahead,t.lookahead=0;var n=t.block_start+a;if((0===t.strstart||t.strstart>=n)&&(t.lookahead=t.strstart-n,t.strstart=n,T(t,!1),0===t.strm.avail_out))return S;if(t.strstart-t.block_start>=t.w_size-B&&(T(t,!1),0===t.strm.avail_out))return S}return t.insert=0,e===d?(T(t,!0),0===t.strm.avail_out?E:U):(t.strstart>t.block_start&&(T(t,!1),t.strm.avail_out),S)}),new M(4,4,8,4,F),new M(4,5,16,8,F),new M(4,6,32,32,F),new M(4,4,16,16,K),new M(8,16,32,32,K),new M(8,16,128,128,K),new M(8,32,128,256,K),new M(32,128,258,1024,K),new M(32,258,258,4096,K)],a.deflateInit=function(t,e){return Q(t,e,v,15,8,0)},a.deflateInit2=Q,a.deflateReset=J,a.deflateResetKeep=G,a.deflateSetHeader=function(t,e){return t&&t.state?2!==t.state.wrap?g:(t.state.gzhead=e,p):g},a.deflate=function(t,e){var a,n,r,i;if(!t||!t.state||5<e||e<0)return t?D(t,g):g;if(n=t.state,!t.output||!t.input&&0!==t.avail_in||666===n.status&&e!==d)return D(t,0===t.avail_out?-5:g);if(n.strm=t,a=n.last_flush,n.last_flush=e,n.status===A)if(2===n.wrap)t.adler=0,L(n,31),L(n,139),L(n,8),n.gzhead?(L(n,(n.gzhead.text?1:0)+(n.gzhead.hcrc?2:0)+(n.gzhead.extra?4:0)+(n.gzhead.name?8:0)+(n.gzhead.comment?16:0)),L(n,255&n.gzhead.time),L(n,n.gzhead.time>>8&255),L(n,n.gzhead.time>>16&255),L(n,n.gzhead.time>>24&255),L(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),L(n,255&n.gzhead.os),n.gzhead.extra&&n.gzhead.extra.length&&(L(n,255&n.gzhead.extra.length),L(n,n.gzhead.extra.length>>8&255)),n.gzhead.hcrc&&(t.adler=c(t.adler,n.pending_buf,n.pending,0)),n.gzindex=0,n.status=69):(L(n,0),L(n,0),L(n,0),L(n,0),L(n,0),L(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),L(n,3),n.status=C);else{var s=v+(n.w_bits-8<<4)<<8;s|=(2<=n.strategy||n.level<2?0:n.level<6?1:6===n.level?2:3)<<6,0!==n.strstart&&(s|=32),s+=31-s%31,n.status=C,N(n,s),0!==n.strstart&&(N(n,t.adler>>>16),N(n,65535&t.adler)),t.adler=1}if(69===n.status)if(n.gzhead.extra){for(r=n.pending;n.gzindex<(65535&n.gzhead.extra.length)&&(n.pending!==n.pending_buf_size||(n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),q(t),r=n.pending,n.pending!==n.pending_buf_size));)L(n,255&n.gzhead.extra[n.gzindex]),n.gzindex++;n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),n.gzindex===n.gzhead.extra.length&&(n.gzindex=0,n.status=73)}else n.status=73;if(73===n.status)if(n.gzhead.name){r=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),q(t),r=n.pending,n.pending===n.pending_buf_size)){i=1;break}L(n,i=n.gzindex<n.gzhead.name.length?255&n.gzhead.name.charCodeAt(n.gzindex++):0)}while(0!==i);n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),0===i&&(n.gzindex=0,n.status=91)}else n.status=91;if(91===n.status)if(n.gzhead.comment){r=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),q(t),r=n.pending,n.pending===n.pending_buf_size)){i=1;break}L(n,i=n.gzindex<n.gzhead.comment.length?255&n.gzhead.comment.charCodeAt(n.gzindex++):0)}while(0!==i);n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),0===i&&(n.status=103)}else n.status=103;if(103===n.status&&(n.gzhead.hcrc?(n.pending+2>n.pending_buf_size&&q(t),n.pending+2<=n.pending_buf_size&&(L(n,255&t.adler),L(n,t.adler>>8&255),t.adler=0,n.status=C)):n.status=C),0!==n.pending){if(q(t),0===t.avail_out)return n.last_flush=-1,p}else if(0===t.avail_in&&I(e)<=I(a)&&e!==d)return D(t,-5);if(666===n.status&&0!==t.avail_in)return D(t,-5);if(0!==t.avail_in||0!==n.lookahead||e!==_&&666!==n.status){var h=2===n.strategy?function(t,e){for(var a;;){if(0===t.lookahead&&(H(t),0===t.lookahead)){if(e===_)return S;break}if(t.match_length=0,a=o._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++,a&&(T(t,!1),0===t.strm.avail_out))return S}return t.insert=0,e===d?(T(t,!0),0===t.strm.avail_out?E:U):t.last_lit&&(T(t,!1),0===t.strm.avail_out)?S:j}(n,e):3===n.strategy?function(t,e){for(var a,n,r,i,s=t.window;;){if(t.lookahead<=x){if(H(t),t.lookahead<=x&&e===_)return S;if(0===t.lookahead)break}if(t.match_length=0,t.lookahead>=z&&0<t.strstart&&(n=s[r=t.strstart-1])===s[++r]&&n===s[++r]&&n===s[++r]){i=t.strstart+x;do{}while(n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&r<i);t.match_length=x-(i-r),t.match_length>t.lookahead&&(t.match_length=t.lookahead)}if(t.match_length>=z?(a=o._tr_tally(t,1,t.match_length-z),t.lookahead-=t.match_length,t.strstart+=t.match_length,t.match_length=0):(a=o._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++),a&&(T(t,!1),0===t.strm.avail_out))return S}return t.insert=0,e===d?(T(t,!0),0===t.strm.avail_out?E:U):t.last_lit&&(T(t,!1),0===t.strm.avail_out)?S:j}(n,e):l[n.level].func(n,e);if(h!==E&&h!==U||(n.status=666),h===S||h===E)return 0===t.avail_out&&(n.last_flush=-1),p;if(h===j&&(1===e?o._tr_align(n):5!==e&&(o._tr_stored_block(n,0,0,!1),3===e&&(O(n.head),0===n.lookahead&&(n.strstart=0,n.block_start=0,n.insert=0))),q(t),0===t.avail_out))return n.last_flush=-1,p}return e!==d?p:n.wrap<=0?1:(2===n.wrap?(L(n,255&t.adler),L(n,t.adler>>8&255),L(n,t.adler>>16&255),L(n,t.adler>>24&255),L(n,255&t.total_in),L(n,t.total_in>>8&255),L(n,t.total_in>>16&255),L(n,t.total_in>>24&255)):(N(n,t.adler>>>16),N(n,65535&t.adler)),q(t),0<n.wrap&&(n.wrap=-n.wrap),0!==n.pending?p:1)},a.deflateEnd=function(t){var e;return t&&t.state?(e=t.state.status)!==A&&69!==e&&73!==e&&91!==e&&103!==e&&e!==C&&666!==e?D(t,g):(t.state=null,e===C?D(t,-3):p):g},a.deflateSetDictionary=function(t,e){var a,n,r,i,s,h,l,o,_=e.length;if(!t||!t.state)return g;if(2===(i=(a=t.state).wrap)||1===i&&a.status!==A||a.lookahead)return g;for(1===i&&(t.adler=f(t.adler,e,_,0)),a.wrap=0,_>=a.w_size&&(0===i&&(O(a.head),a.strstart=0,a.block_start=0,a.insert=0),o=new u.Buf8(a.w_size),u.arraySet(o,e,_-a.w_size,a.w_size,0),e=o,_=a.w_size),s=t.avail_in,h=t.next_in,l=t.input,t.avail_in=_,t.next_in=0,t.input=e,H(a);a.lookahead>=z;){for(n=a.strstart,r=a.lookahead-(z-1);a.ins_h=(a.ins_h<<a.hash_shift^a.window[n+z-1])&a.hash_mask,a.prev[n&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=n,n++,--r;);a.strstart=n,a.lookahead=z-1,H(a)}return a.strstart+=a.lookahead,a.block_start=a.strstart,a.insert=a.lookahead,a.lookahead=0,a.match_length=a.prev_length=z-1,a.match_available=0,t.next_in=h,t.input=l,t.avail_in=s,a.wrap=i,p},a.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":1,"./adler32":3,"./crc32":4,"./messages":6,"./trees":7}],6:[function(t,e,a){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],7:[function(t,e,a){"use strict";var l=t("../utils/common"),h=0,o=1;function n(t){for(var e=t.length;0<=--e;)t[e]=0}var _=0,s=29,d=256,u=d+1+s,f=30,c=19,g=2*u+1,m=15,r=16,p=7,b=256,v=16,w=17,y=18,k=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],z=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],x=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],B=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],A=new Array(2*(u+2));n(A);var C=new Array(2*f);n(C);var S=new Array(512);n(S);var j=new Array(256);n(j);var E=new Array(s);n(E);var U,D,I,O=new Array(f);function q(t,e,a,n,r){this.static_tree=t,this.extra_bits=e,this.extra_base=a,this.elems=n,this.max_length=r,this.has_stree=t&&t.length}function i(t,e){this.dyn_tree=t,this.max_code=0,this.stat_desc=e}function T(t){return t<256?S[t]:S[256+(t>>>7)]}function L(t,e){t.pending_buf[t.pending++]=255&e,t.pending_buf[t.pending++]=e>>>8&255}function N(t,e,a){t.bi_valid>r-a?(t.bi_buf|=e<<t.bi_valid&65535,L(t,t.bi_buf),t.bi_buf=e>>r-t.bi_valid,t.bi_valid+=a-r):(t.bi_buf|=e<<t.bi_valid&65535,t.bi_valid+=a)}function R(t,e,a){N(t,a[2*e],a[2*e+1])}function H(t,e){for(var a=0;a|=1&t,t>>>=1,a<<=1,0<--e;);return a>>>1}function F(t,e,a){var n,r,i=new Array(m+1),s=0;for(n=1;n<=m;n++)i[n]=s=s+a[n-1]<<1;for(r=0;r<=e;r++){var h=t[2*r+1];0!==h&&(t[2*r]=H(i[h]++,h))}}function K(t){var e;for(e=0;e<u;e++)t.dyn_ltree[2*e]=0;for(e=0;e<f;e++)t.dyn_dtree[2*e]=0;for(e=0;e<c;e++)t.bl_tree[2*e]=0;t.dyn_ltree[2*b]=1,t.opt_len=t.static_len=0,t.last_lit=t.matches=0}function M(t){8<t.bi_valid?L(t,t.bi_buf):0<t.bi_valid&&(t.pending_buf[t.pending++]=t.bi_buf),t.bi_buf=0,t.bi_valid=0}function P(t,e,a,n){var r=2*e,i=2*a;return t[r]<t[i]||t[r]===t[i]&&n[e]<=n[a]}function G(t,e,a){for(var n=t.heap[a],r=a<<1;r<=t.heap_len&&(r<t.heap_len&&P(e,t.heap[r+1],t.heap[r],t.depth)&&r++,!P(e,n,t.heap[r],t.depth));)t.heap[a]=t.heap[r],a=r,r<<=1;t.heap[a]=n}function J(t,e,a){var n,r,i,s,h=0;if(0!==t.last_lit)for(;n=t.pending_buf[t.d_buf+2*h]<<8|t.pending_buf[t.d_buf+2*h+1],r=t.pending_buf[t.l_buf+h],h++,0===n?R(t,r,e):(R(t,(i=j[r])+d+1,e),0!==(s=k[i])&&N(t,r-=E[i],s),R(t,i=T(--n),a),0!==(s=z[i])&&N(t,n-=O[i],s)),h<t.last_lit;);R(t,b,e)}function Q(t,e){var a,n,r,i=e.dyn_tree,s=e.stat_desc.static_tree,h=e.stat_desc.has_stree,l=e.stat_desc.elems,o=-1;for(t.heap_len=0,t.heap_max=g,a=0;a<l;a++)0!==i[2*a]?(t.heap[++t.heap_len]=o=a,t.depth[a]=0):i[2*a+1]=0;for(;t.heap_len<2;)i[2*(r=t.heap[++t.heap_len]=o<2?++o:0)]=1,t.depth[r]=0,t.opt_len--,h&&(t.static_len-=s[2*r+1]);for(e.max_code=o,a=t.heap_len>>1;1<=a;a--)G(t,i,a);for(r=l;a=t.heap[1],t.heap[1]=t.heap[t.heap_len--],G(t,i,1),n=t.heap[1],t.heap[--t.heap_max]=a,t.heap[--t.heap_max]=n,i[2*r]=i[2*a]+i[2*n],t.depth[r]=(t.depth[a]>=t.depth[n]?t.depth[a]:t.depth[n])+1,i[2*a+1]=i[2*n+1]=r,t.heap[1]=r++,G(t,i,1),2<=t.heap_len;);t.heap[--t.heap_max]=t.heap[1],function(t,e){var a,n,r,i,s,h,l=e.dyn_tree,o=e.max_code,_=e.stat_desc.static_tree,d=e.stat_desc.has_stree,u=e.stat_desc.extra_bits,f=e.stat_desc.extra_base,c=e.stat_desc.max_length,p=0;for(i=0;i<=m;i++)t.bl_count[i]=0;for(l[2*t.heap[t.heap_max]+1]=0,a=t.heap_max+1;a<g;a++)c<(i=l[2*l[2*(n=t.heap[a])+1]+1]+1)&&(i=c,p++),l[2*n+1]=i,o<n||(t.bl_count[i]++,s=0,f<=n&&(s=u[n-f]),h=l[2*n],t.opt_len+=h*(i+s),d&&(t.static_len+=h*(_[2*n+1]+s)));if(0!==p){do{for(i=c-1;0===t.bl_count[i];)i--;t.bl_count[i]--,t.bl_count[i+1]+=2,t.bl_count[c]--,p-=2}while(0<p);for(i=c;0!==i;i--)for(n=t.bl_count[i];0!==n;)o<(r=t.heap[--a])||(l[2*r+1]!==i&&(t.opt_len+=(i-l[2*r+1])*l[2*r],l[2*r+1]=i),n--)}}(t,e),F(i,o,t.bl_count)}function V(t,e,a){var n,r,i=-1,s=e[1],h=0,l=7,o=4;for(0===s&&(l=138,o=3),e[2*(a+1)+1]=65535,n=0;n<=a;n++)r=s,s=e[2*(n+1)+1],++h<l&&r===s||(h<o?t.bl_tree[2*r]+=h:0!==r?(r!==i&&t.bl_tree[2*r]++,t.bl_tree[2*v]++):h<=10?t.bl_tree[2*w]++:t.bl_tree[2*y]++,i=r,(h=0)===s?(l=138,o=3):r===s?(l=6,o=3):(l=7,o=4))}function W(t,e,a){var n,r,i=-1,s=e[1],h=0,l=7,o=4;for(0===s&&(l=138,o=3),n=0;n<=a;n++)if(r=s,s=e[2*(n+1)+1],!(++h<l&&r===s)){if(h<o)for(;R(t,r,t.bl_tree),0!=--h;);else 0!==r?(r!==i&&(R(t,r,t.bl_tree),h--),R(t,v,t.bl_tree),N(t,h-3,2)):h<=10?(R(t,w,t.bl_tree),N(t,h-3,3)):(R(t,y,t.bl_tree),N(t,h-11,7));i=r,(h=0)===s?(l=138,o=3):r===s?(l=6,o=3):(l=7,o=4)}}n(O);var X=!1;function Y(t,e,a,n){var r,i,s,h;N(t,(_<<1)+(n?1:0),3),i=e,s=a,h=!0,M(r=t),h&&(L(r,s),L(r,~s)),l.arraySet(r.pending_buf,r.window,i,s,r.pending),r.pending+=s}a._tr_init=function(t){X||(function(){var t,e,a,n,r,i=new Array(m+1);for(n=a=0;n<s-1;n++)for(E[n]=a,t=0;t<1<<k[n];t++)j[a++]=n;for(j[a-1]=n,n=r=0;n<16;n++)for(O[n]=r,t=0;t<1<<z[n];t++)S[r++]=n;for(r>>=7;n<f;n++)for(O[n]=r<<7,t=0;t<1<<z[n]-7;t++)S[256+r++]=n;for(e=0;e<=m;e++)i[e]=0;for(t=0;t<=143;)A[2*t+1]=8,t++,i[8]++;for(;t<=255;)A[2*t+1]=9,t++,i[9]++;for(;t<=279;)A[2*t+1]=7,t++,i[7]++;for(;t<=287;)A[2*t+1]=8,t++,i[8]++;for(F(A,u+1,i),t=0;t<f;t++)C[2*t+1]=5,C[2*t]=H(t,5);U=new q(A,k,d+1,u,m),D=new q(C,z,0,f,m),I=new q(new Array(0),x,0,c,p)}(),X=!0),t.l_desc=new i(t.dyn_ltree,U),t.d_desc=new i(t.dyn_dtree,D),t.bl_desc=new i(t.bl_tree,I),t.bi_buf=0,t.bi_valid=0,K(t)},a._tr_stored_block=Y,a._tr_flush_block=function(t,e,a,n){var r,i,s=0;0<t.level?(2===t.strm.data_type&&(t.strm.data_type=function(t){var e,a=4093624447;for(e=0;e<=31;e++,a>>>=1)if(1&a&&0!==t.dyn_ltree[2*e])return h;if(0!==t.dyn_ltree[18]||0!==t.dyn_ltree[20]||0!==t.dyn_ltree[26])return o;for(e=32;e<d;e++)if(0!==t.dyn_ltree[2*e])return o;return h}(t)),Q(t,t.l_desc),Q(t,t.d_desc),s=function(t){var e;for(V(t,t.dyn_ltree,t.l_desc.max_code),V(t,t.dyn_dtree,t.d_desc.max_code),Q(t,t.bl_desc),e=c-1;3<=e&&0===t.bl_tree[2*B[e]+1];e--);return t.opt_len+=3*(e+1)+5+5+4,e}(t),r=t.opt_len+3+7>>>3,(i=t.static_len+3+7>>>3)<=r&&(r=i)):r=i=a+5,a+4<=r&&-1!==e?Y(t,e,a,n):4===t.strategy||i===r?(N(t,2+(n?1:0),3),J(t,A,C)):(N(t,4+(n?1:0),3),function(t,e,a,n){var r;for(N(t,e-257,5),N(t,a-1,5),N(t,n-4,4),r=0;r<n;r++)N(t,t.bl_tree[2*B[r]+1],3);W(t,t.dyn_ltree,e-1),W(t,t.dyn_dtree,a-1)}(t,t.l_desc.max_code+1,t.d_desc.max_code+1,s+1),J(t,t.dyn_ltree,t.dyn_dtree)),K(t),n&&M(t)},a._tr_tally=function(t,e,a){return t.pending_buf[t.d_buf+2*t.last_lit]=e>>>8&255,t.pending_buf[t.d_buf+2*t.last_lit+1]=255&e,t.pending_buf[t.l_buf+t.last_lit]=255&a,t.last_lit++,0===e?t.dyn_ltree[2*a]++:(t.matches++,e--,t.dyn_ltree[2*(j[a]+d+1)]++,t.dyn_dtree[2*T(e)]++),t.last_lit===t.lit_bufsize-1},a._tr_align=function(t){var e;N(t,2,3),R(t,b,A),16===(e=t).bi_valid?(L(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):8<=e.bi_valid&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}},{"../utils/common":1}],8:[function(t,e,a){"use strict";e.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],"/lib/deflate.js":[function(t,e,a){"use strict";var s=t("./zlib/deflate"),h=t("./utils/common"),l=t("./utils/strings"),r=t("./zlib/messages"),i=t("./zlib/zstream"),o=Object.prototype.toString,_=0,d=-1,u=0,f=8;function c(t){if(!(this instanceof c))return new c(t);this.options=h.assign({level:d,method:f,chunkSize:16384,windowBits:15,memLevel:8,strategy:u,to:""},t||{});var e=this.options;e.raw&&0<e.windowBits?e.windowBits=-e.windowBits:e.gzip&&0<e.windowBits&&e.windowBits<16&&(e.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new i,this.strm.avail_out=0;var a=s.deflateInit2(this.strm,e.level,e.method,e.windowBits,e.memLevel,e.strategy);if(a!==_)throw new Error(r[a]);if(e.header&&s.deflateSetHeader(this.strm,e.header),e.dictionary){var n;if(n="string"==typeof e.dictionary?l.string2buf(e.dictionary):"[object ArrayBuffer]"===o.call(e.dictionary)?new Uint8Array(e.dictionary):e.dictionary,(a=s.deflateSetDictionary(this.strm,n))!==_)throw new Error(r[a]);this._dict_set=!0}}function n(t,e){var a=new c(e);if(a.push(t,!0),a.err)throw a.msg||r[a.err];return a.result}c.prototype.push=function(t,e){var a,n,r=this.strm,i=this.options.chunkSize;if(this.ended)return!1;n=e===~~e?e:!0===e?4:0,"string"==typeof t?r.input=l.string2buf(t):"[object ArrayBuffer]"===o.call(t)?r.input=new Uint8Array(t):r.input=t,r.next_in=0,r.avail_in=r.input.length;do{if(0===r.avail_out&&(r.output=new h.Buf8(i),r.next_out=0,r.avail_out=i),1!==(a=s.deflate(r,n))&&a!==_)return this.onEnd(a),!(this.ended=!0);0!==r.avail_out&&(0!==r.avail_in||4!==n&&2!==n)||("string"===this.options.to?this.onData(l.buf2binstring(h.shrinkBuf(r.output,r.next_out))):this.onData(h.shrinkBuf(r.output,r.next_out)))}while((0<r.avail_in||0===r.avail_out)&&1!==a);return 4===n?(a=s.deflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===_):2!==n||(this.onEnd(_),!(r.avail_out=0))},c.prototype.onData=function(t){this.chunks.push(t)},c.prototype.onEnd=function(t){t===_&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=h.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},a.Deflate=c,a.deflate=n,a.deflateRaw=function(t,e){return(e=e||{}).raw=!0,n(t,e)},a.gzip=function(t,e){return(e=e||{}).gzip=!0,n(t,e)}},{"./utils/common":1,"./utils/strings":2,"./zlib/deflate":5,"./zlib/messages":6,"./zlib/zstream":8}]},{},[])("/lib/deflate.js")}); // eslint-disable-line // NOSONAR
                }

                // Check and add Hammer.JS
                if (typeof Hammer === "function" && Hammer !== undefined) {
                    if (console) {
                        console.info("Hammer:" + Hammer.VERSION + " is already loaded. But you need 1.1.3.");
                    }
                } else if (addHammer === true) {
                    /*!
                     * Hammer.JS - v1.1.3
                     */
                    !function(a,b){"use strict";function c(){d.READY||(s.determineEventTypes(),r.each(d.gestures,function(a){u.register(a)}),s.onTouch(d.DOCUMENT,n,u.detect),s.onTouch(d.DOCUMENT,o,u.detect),d.READY=!0)}var d=function v(a,b){return new v.Instance(a,b||{})};d.VERSION="1.1.3",d.defaults={behavior:{userSelect:"none",touchAction:"pan-y",touchCallout:"none",contentZooming:"none",userDrag:"none",tapHighlightColor:"rgba(0,0,0,0)"}},d.DOCUMENT=document,d.HAS_POINTEREVENTS=navigator.pointerEnabled||navigator.msPointerEnabled,d.HAS_TOUCHEVENTS="ontouchstart"in a,d.IS_MOBILE=/mobile|tablet|ip(ad|hone|od)|android|silk/i.test(navigator.userAgent),d.NO_MOUSEEVENTS=d.HAS_TOUCHEVENTS&&d.IS_MOBILE||d.HAS_POINTEREVENTS,d.CALCULATE_INTERVAL=25;var e={},f=d.DIRECTION_DOWN="down",g=d.DIRECTION_LEFT="left",h=d.DIRECTION_UP="up",i=d.DIRECTION_RIGHT="right",j=d.POINTER_MOUSE="mouse",k=d.POINTER_TOUCH="touch",l=d.POINTER_PEN="pen",m=d.EVENT_START="start",n=d.EVENT_MOVE="move",o=d.EVENT_END="end",p=d.EVENT_RELEASE="release",q=d.EVENT_TOUCH="touch";d.READY=!1,d.plugins=d.plugins||{},d.gestures=d.gestures||{};var r=d.utils={extend:function(a,c,d){for(var e in c)!c.hasOwnProperty(e)||a[e]!==b&&d||(a[e]=c[e]);return a},on:function(a,b,c){a.addEventListener(b,c,!1)},off:function(a,b,c){a.removeEventListener(b,c,!1)},each:function(a,c,d){var e,f;if("forEach"in a)a.forEach(c,d);else if(a.length!==b){for(e=0,f=a.length;f>e;e++)if(c.call(d,a[e],e,a)===!1)return}else for(e in a)if(a.hasOwnProperty(e)&&c.call(d,a[e],e,a)===!1)return},inStr:function(a,b){return a.indexOf(b)>-1},inArray:function(a,b){if(a.indexOf){var c=a.indexOf(b);return-1===c?!1:c}for(var d=0,e=a.length;e>d;d++)if(a[d]===b)return d;return!1},toArray:function(a){return Array.prototype.slice.call(a,0)},hasParent:function(a,b){for(;a;){if(a==b)return!0;a=a.parentNode}return!1},getCenter:function(a){var b=[],c=[],d=[],e=[],f=Math.min,g=Math.max;return 1===a.length?{pageX:a[0].pageX,pageY:a[0].pageY,clientX:a[0].clientX,clientY:a[0].clientY}:(r.each(a,function(a){b.push(a.pageX),c.push(a.pageY),d.push(a.clientX),e.push(a.clientY)}),{pageX:(f.apply(Math,b)+g.apply(Math,b))/2,pageY:(f.apply(Math,c)+g.apply(Math,c))/2,clientX:(f.apply(Math,d)+g.apply(Math,d))/2,clientY:(f.apply(Math,e)+g.apply(Math,e))/2})},getVelocity:function(a,b,c){return{x:Math.abs(b/a)||0,y:Math.abs(c/a)||0}},getAngle:function(a,b){var c=b.clientX-a.clientX,d=b.clientY-a.clientY;return 180*Math.atan2(d,c)/Math.PI},getDirection:function(a,b){var c=Math.abs(a.clientX-b.clientX),d=Math.abs(a.clientY-b.clientY);return c>=d?a.clientX-b.clientX>0?g:i:a.clientY-b.clientY>0?h:f},getDistance:function(a,b){var c=b.clientX-a.clientX,d=b.clientY-a.clientY;return Math.sqrt(c*c+d*d)},getScale:function(a,b){return a.length>=2&&b.length>=2?this.getDistance(b[0],b[1])/this.getDistance(a[0],a[1]):1},getRotation:function(a,b){return a.length>=2&&b.length>=2?this.getAngle(b[1],b[0])-this.getAngle(a[1],a[0]):0},isVertical:function(a){return a==h||a==f},setPrefixedCss:function(a,b,c,d){var e=["","Webkit","Moz","O","ms"];b=r.toCamelCase(b);for(var f=0;f<e.length;f++){var g=b;if(e[f]&&(g=e[f]+g.slice(0,1).toUpperCase()+g.slice(1)),g in a.style){a.style[g]=(null==d||d)&&c||"";break}}},toggleBehavior:function(a,b,c){if(b&&a&&a.style){r.each(b,function(b,d){r.setPrefixedCss(a,d,b,c)});var d=c&&function(){return!1};"none"==b.userSelect&&(a.onselectstart=d),"none"==b.userDrag&&(a.ondragstart=d)}},toCamelCase:function(a){return a.replace(/[_-]([a-z])/g,function(a){return a[1].toUpperCase()})}},s=d.event={preventMouseEvents:!1,started:!1,shouldDetect:!1,on:function(a,b,c,d){var e=b.split(" ");r.each(e,function(b){r.on(a,b,c),d&&d(b)})},off:function(a,b,c,d){var e=b.split(" ");r.each(e,function(b){r.off(a,b,c),d&&d(b)})},onTouch:function(a,b,c){var f=this,g=function(e){var g,h=e.type.toLowerCase(),i=d.HAS_POINTEREVENTS,j=r.inStr(h,"mouse");j&&f.preventMouseEvents||(j&&b==m&&0===e.button?(f.preventMouseEvents=!1,f.shouldDetect=!0):i&&b==m?f.shouldDetect=1===e.buttons||t.matchType(k,e):j||b!=m||(f.preventMouseEvents=!0,f.shouldDetect=!0),i&&b!=o&&t.updatePointer(b,e),f.shouldDetect&&(g=f.doDetect.call(f,e,b,a,c)),g==o&&(f.preventMouseEvents=!1,f.shouldDetect=!1,t.reset()),i&&b==o&&t.updatePointer(b,e))};return this.on(a,e[b],g),g},doDetect:function(a,b,c,d){var e=this.getTouchList(a,b),f=e.length,g=b,h=e.trigger,i=f;b==m?h=q:b==o&&(h=p,i=e.length-(a.changedTouches?a.changedTouches.length:1)),i>0&&this.started&&(g=n),this.started=!0;var j=this.collectEventData(c,g,e,a);return b!=o&&d.call(u,j),h&&(j.changedLength=i,j.eventType=h,d.call(u,j),j.eventType=g,delete j.changedLength),g==o&&(d.call(u,j),this.started=!1),g},determineEventTypes:function(){var b;return b=d.HAS_POINTEREVENTS?a.PointerEvent?["pointerdown","pointermove","pointerup pointercancel lostpointercapture"]:["MSPointerDown","MSPointerMove","MSPointerUp MSPointerCancel MSLostPointerCapture"]:d.NO_MOUSEEVENTS?["touchstart","touchmove","touchend touchcancel"]:["touchstart mousedown","touchmove mousemove","touchend touchcancel mouseup"],e[m]=b[0],e[n]=b[1],e[o]=b[2],e},getTouchList:function(a,b){if(d.HAS_POINTEREVENTS)return t.getTouchList();if(a.touches){if(b==n)return a.touches;var c=[],e=[].concat(r.toArray(a.touches),r.toArray(a.changedTouches)),f=[];return r.each(e,function(a){r.inArray(c,a.identifier)===!1&&f.push(a),c.push(a.identifier)}),f}return a.identifier=1,[a]},collectEventData:function(a,b,c,d){var e=k;return r.inStr(d.type,"mouse")||t.matchType(j,d)?e=j:t.matchType(l,d)&&(e=l),{center:r.getCenter(c),timeStamp:Date.now(),target:d.target,touches:c,eventType:b,pointerType:e,srcEvent:d,preventDefault:function(){var a=this.srcEvent;a.preventManipulation&&a.preventManipulation(),a.preventDefault&&a.preventDefault()},stopPropagation:function(){this.srcEvent.stopPropagation()},stopDetect:function(){return u.stopDetect()}}}},t=d.PointerEvent={pointers:{},getTouchList:function(){var a=[];return r.each(this.pointers,function(b){a.push(b)}),a},updatePointer:function(a,b){a==o?delete this.pointers[b.pointerId]:(b.identifier=b.pointerId,this.pointers[b.pointerId]=b)},matchType:function(a,b){if(!b.pointerType)return!1;var c=b.pointerType,d={};return d[j]=c===(b.MSPOINTER_TYPE_MOUSE||j),d[k]=c===(b.MSPOINTER_TYPE_TOUCH||k),d[l]=c===(b.MSPOINTER_TYPE_PEN||l),d[a]},reset:function(){this.pointers={}}},u=d.detection={gestures:[],current:null,previous:null,stopped:!1,startDetect:function(a,b){this.current||(this.stopped=!1,this.current={inst:a,startEvent:r.extend({},b),lastEvent:!1,lastCalcEvent:!1,futureCalcEvent:!1,lastCalcData:{},name:""},this.detect(b))},detect:function(a){if(this.current&&!this.stopped){a=this.extendEventData(a);var b=this.current.inst,c=b.options;return r.each(this.gestures,function(d){!this.stopped&&b.enabled&&c[d.name]&&d.handler.call(d,a,b)},this),this.current&&(this.current.lastEvent=a),a.eventType==o&&this.stopDetect(),a}},stopDetect:function(){this.previous=r.extend({},this.current),this.current=null,this.stopped=!0},getCalculatedData:function(a,b,c,e,f){var g=this.current,h=!1,i=g.lastCalcEvent,j=g.lastCalcData;i&&a.timeStamp-i.timeStamp>d.CALCULATE_INTERVAL&&(b=i.center,c=a.timeStamp-i.timeStamp,e=a.center.clientX-i.center.clientX,f=a.center.clientY-i.center.clientY,h=!0),(a.eventType==q||a.eventType==p)&&(g.futureCalcEvent=a),(!g.lastCalcEvent||h)&&(j.velocity=r.getVelocity(c,e,f),j.angle=r.getAngle(b,a.center),j.direction=r.getDirection(b,a.center),g.lastCalcEvent=g.futureCalcEvent||a,g.futureCalcEvent=a),a.velocityX=j.velocity.x,a.velocityY=j.velocity.y,a.interimAngle=j.angle,a.interimDirection=j.direction},extendEventData:function(a){var b=this.current,c=b.startEvent,d=b.lastEvent||c;(a.eventType==q||a.eventType==p)&&(c.touches=[],r.each(a.touches,function(a){c.touches.push({clientX:a.clientX,clientY:a.clientY})}));var e=a.timeStamp-c.timeStamp,f=a.center.clientX-c.center.clientX,g=a.center.clientY-c.center.clientY;return this.getCalculatedData(a,d.center,e,f,g),r.extend(a,{startEvent:c,deltaTime:e,deltaX:f,deltaY:g,distance:r.getDistance(c.center,a.center),angle:r.getAngle(c.center,a.center),direction:r.getDirection(c.center,a.center),scale:r.getScale(c.touches,a.touches),rotation:r.getRotation(c.touches,a.touches)}),a},register:function(a){var c=a.defaults||{};return c[a.name]===b&&(c[a.name]=!0),r.extend(d.defaults,c,!0),a.index=a.index||1e3,this.gestures.push(a),this.gestures.sort(function(a,b){return a.index<b.index?-1:a.index>b.index?1:0}),this.gestures}};d.Instance=function(a,b){var e=this;c(),this.element=a,this.enabled=!0,r.each(b,function(a,c){delete b[c],b[r.toCamelCase(c)]=a}),this.options=r.extend(r.extend({},d.defaults),b||{}),this.options.behavior&&r.toggleBehavior(this.element,this.options.behavior,!0),this.eventStartHandler=s.onTouch(a,m,function(a){e.enabled&&a.eventType==m?u.startDetect(e,a):a.eventType==q&&u.detect(a)}),this.eventHandlers=[]},d.Instance.prototype={on:function(a,b){var c=this;return s.on(c.element,a,b,function(a){c.eventHandlers.push({gesture:a,handler:b})}),c},off:function(a,b){var c=this;return s.off(c.element,a,b,function(a){var d=r.inArray({gesture:a,handler:b});d!==!1&&c.eventHandlers.splice(d,1)}),c},trigger:function(a,b){b||(b={});var c=d.DOCUMENT.createEvent("Event");c.initEvent(a,!0,!0),c.gesture=b;var e=this.element;return r.hasParent(b.target,e)&&(e=b.target),e.dispatchEvent(c),this},enable:function(a){return this.enabled=a,this},dispose:function(){var a,b;for(r.toggleBehavior(this.element,this.options.behavior,!1),a=-1;b=this.eventHandlers[++a];)r.off(this.element,b.gesture,b.handler);return this.eventHandlers=[],s.off(this.element,e[m],this.eventStartHandler),null}},function(a){function b(b,d){var e=u.current;if(!(d.options.dragMaxTouches>0&&b.touches.length>d.options.dragMaxTouches))switch(b.eventType){case m:c=!1;break;case n:if(b.distance<d.options.dragMinDistance&&e.name!=a)return;var j=e.startEvent.center;if(e.name!=a&&(e.name=a,d.options.dragDistanceCorrection&&b.distance>0)){var k=Math.abs(d.options.dragMinDistance/b.distance);j.pageX+=b.deltaX*k,j.pageY+=b.deltaY*k,j.clientX+=b.deltaX*k,j.clientY+=b.deltaY*k,b=u.extendEventData(b)}(e.lastEvent.dragLockToAxis||d.options.dragLockToAxis&&d.options.dragLockMinDistance<=b.distance)&&(b.dragLockToAxis=!0);var l=e.lastEvent.direction;b.dragLockToAxis&&l!==b.direction&&(b.direction=r.isVertical(l)?b.deltaY<0?h:f:b.deltaX<0?g:i),c||(d.trigger(a+"start",b),c=!0),d.trigger(a,b),d.trigger(a+b.direction,b);var q=r.isVertical(b.direction);(d.options.dragBlockVertical&&q||d.options.dragBlockHorizontal&&!q)&&b.preventDefault();break;case p:c&&b.changedLength<=d.options.dragMaxTouches&&(d.trigger(a+"end",b),c=!1);break;case o:c=!1}}var c=!1;d.gestures.Drag={name:a,index:50,handler:b,defaults:{dragMinDistance:10,dragDistanceCorrection:!0,dragMaxTouches:1,dragBlockHorizontal:!1,dragBlockVertical:!1,dragLockToAxis:!1,dragLockMinDistance:25}}}("drag"),d.gestures.Gesture={name:"gesture",index:1337,handler:function(a,b){b.trigger(this.name,a)}},function(a){function b(b,d){var e=d.options,f=u.current;switch(b.eventType){case m:clearTimeout(c),f.name=a,c=setTimeout(function(){f&&f.name==a&&d.trigger(a,b)},e.holdTimeout);break;case n:b.distance>e.holdThreshold&&clearTimeout(c);break;case p:clearTimeout(c)}}var c;d.gestures.Hold={name:a,index:10,defaults:{holdTimeout:500,holdThreshold:2},handler:b}}("hold"),d.gestures.Release={name:"release",index:1/0,handler:function(a,b){a.eventType==p&&b.trigger(this.name,a)}},d.gestures.Swipe={name:"swipe",index:40,defaults:{swipeMinTouches:1,swipeMaxTouches:1,swipeVelocityX:.6,swipeVelocityY:.6},handler:function(a,b){if(a.eventType==p){var c=a.touches.length,d=b.options;if(c<d.swipeMinTouches||c>d.swipeMaxTouches)return;(a.velocityX>d.swipeVelocityX||a.velocityY>d.swipeVelocityY)&&(b.trigger(this.name,a),b.trigger(this.name+a.direction,a))}}},function(a){function b(b,d){var e,f,g=d.options,h=u.current,i=u.previous;switch(b.eventType){case m:c=!1;break;case n:c=c||b.distance>g.tapMaxDistance;break;case o:!r.inStr(b.srcEvent.type,"cancel")&&b.deltaTime<g.tapMaxTime&&!c&&(e=i&&i.lastEvent&&b.timeStamp-i.lastEvent.timeStamp,f=!1,i&&i.name==a&&e&&e<g.doubleTapInterval&&b.distance<g.doubleTapDistance&&(d.trigger("doubletap",b),f=!0),(!f||g.tapAlways)&&(h.name=a,d.trigger(h.name,b)))}}var c=!1;d.gestures.Tap={name:a,index:100,handler:b,defaults:{tapMaxTime:250,tapMaxDistance:10,tapAlways:!0,doubleTapDistance:20,doubleTapInterval:300}}}("tap"),d.gestures.Touch={name:"touch",index:-1/0,defaults:{preventDefault:!1,preventMouse:!1},handler:function(a,b){return b.options.preventMouse&&a.pointerType==j?void a.stopDetect():(b.options.preventDefault&&a.preventDefault(),void(a.eventType==q&&b.trigger("touch",a)))}},function(a){function b(b,d){switch(b.eventType){case m:c=!1;break;case n:if(b.touches.length<2)return;var e=Math.abs(1-b.scale),f=Math.abs(b.rotation);if(e<d.options.transformMinScale&&f<d.options.transformMinRotation)return;u.current.name=a,c||(d.trigger(a+"start",b),c=!0),d.trigger(a,b),f>d.options.transformMinRotation&&d.trigger("rotate",b),e>d.options.transformMinScale&&(d.trigger("pinch",b),d.trigger("pinch"+(b.scale<1?"in":"out"),b));break;case p:c&&b.changedLength<2&&(d.trigger(a+"end",b),c=!1)}}var c=!1;d.gestures.Transform={name:a,index:45,defaults:{transformMinScale:.01,transformMinRotation:1},handler:b}}("transform"),"function"==typeof define&&define.amd?define(function(){return d}):"undefined"!=typeof module&&module.exports?module.exports=d:a.Hammer=d}(window); // eslint-disable-line // NOSONAR
                }

                // Add gestures if correct Hammer is loaded
                if (typeof Hammer === "function" && Hammer !== undefined && Hammer && Hammer.VERSION == '1.1.3') {
                    TLT.addModule("gestures",(function(e){"use strict";var t,n,a,r,i={"input:radio":"radioButton","input:checkbox":"checkBox","input:text":"textBox","input:password":"textBox","input:file":"fileInput","input:button":"button","input:submit":"submitButton","input:reset":"resetButton","input:image":"image","input:color":"color","input:date":"date","input:datetime":"datetime","input:datetime-local":"datetime-local","input:number":"number","input:email":"email","input:tel":"tel","input:search":"search","input:url":"url","input:time":"time","input:week":"week","input:month":"month","textarea:":"textBox","select:":"selectList","select:select-one":"selectList","button:":"button","a:":"link"},o=e.utils,s=[],u=0,p=!0,l=function(){},c={swipeAfterPinchInterval:300,doubleTapInterval:300,preventMouse:!0,dragMinDistance:10},d=[],g=[];function f(t){e.post(t)}function v(e){for(var t=e.gesture.srcEvent.target,n=0,a=0;t&&"BODY"!==t.tagName;)n+=t.offsetTop,a+=t.offsetLeft,t=t.offsetParent;return{topLeftX:a,topLeftY:n}}function m(e,t){"radioButton"===t&&delete e.control.position.relXY,null!==e.control.name&&void 0!==e.control.name&&""!==e.control.name||delete e.control.name,null!==e.control.subType&&void 0!==e.control.subType&&""!==e.control.subType||delete e.control.subType}function h(t){var r,u,p,l,c,d,g,f,h,w=(f=o.getValue(t,"webEvent"),"string"==typeof(h="drag"===f.type?"swipe":"hold"===f.type?"tapHold":f.type)?h.toLowerCase():"unknown"),b=o.getValue(t,"webEvent.gesture.srcEvent.target",document.body),y=o.getTagName(b)||"body",E=o.getValue(b,"type",""),T=i[y.toLowerCase()+":"+E.toLowerCase()]||y,L=o.getValue(t,"webEvent.target.subtype"),H=[];for("1"===a?(u=t.webEvent.gesture.touches,p="webEvent.gesture.touches.",l="swipe"===w&&!(void 0!==n&&"swipe"===n.event.tlEvent)||"pinch"===w&&!(void 0!==n&&"pinch"===n.event.tlEvent),c="swipe"===w||"pinch"===w):(u=t.webEvent.gesture.pointers,p="webEvent.gesture.pointers.",l="first"===o.getValue(t,"webEvent.gesture.firstOrLastSwipeEvent")||"first"===o.getValue(t,"webEvent.gesture.firstOrLastPinchEvent"),c="last"===o.getValue(t,"webEvent.gesture.firstOrLastSwipeEvent")||"last"===o.getValue(t,"webEvent.gesture.firstOrLastPinchEvent")),g=0;g<u.length;g+=1)d={x:o.getValue(t,p+g+".pageX")-v(t.webEvent).topLeftX,y:o.getValue(t,p+g+".pageY")-v(t.webEvent).topLeftY,width:o.getValue(t,"webEvent.gesture.srcEvent.target.offsetWidth"),height:o.getValue(t,"webEvent.gesture.srcEvent.target.offsetHeight")},H.push([{position:{y:Math.round(o.getValue(t,p+g+".pageY")),x:Math.round(o.getValue(t,p+g+".pageX"))},control:{position:{width:Math.round(o.getValue(t,p+g+".target.offsetWidth")),height:Math.round(o.getValue(t,p+g+".target.offsetHeight")),relXY:o.calculateRelativeXY(d),scrollX:Math.round(document.documentElement.scrollLeft||document.body.scrollLeft),scrollY:Math.round(document.documentElement.scrollTop||document.body.scrollTop)},id:o.getValue(t,p+g+".target.id")||e.getXPathFromNode(o.getValue(t,p+g+".target")),idType:o.getValue(t,"webEvent.gesture.idType"),name:o.getValue(t,p+g+".target.name"),tlType:T,type:y,subType:E}}]),m(H[g][0],T);if(l)for(g=0;g<u.length;g+=1)s.push(H[g][0]);if(c)for(g=0;g<u.length;g+=1)H[g].unshift(s[g]);return r={type:11,event:{tlEvent:w,type:w},touches:H},"swipe"===w&&(r.velocityX=t.webEvent.gesture.velocityX,r.velocityY=t.webEvent.gesture.velocityY),"swipe"===w&&(r.direction=t.webEvent.gesture.direction,2===r.direction&&(r.direction="left"),4===r.direction&&(r.direction="right"),8===r.direction&&(r.direction="up"),16===r.direction&&(r.direction="down")),"pinch"===w&&(t.webEvent.gesture.scale>1?r.direction="open":t.webEvent.gesture.scale<1&&(r.direction="close")),null!=L&&(r.event.subType=L),r}function w(e,t){"1"===a?"doubletap"===t.type||"hold"===t.type||"tap"===t.type?f(h({webEvent:t,id:e,currState:o.getValue(t,"target.state")})):"release"!==t.type||void 0===n||"swipe"!==n.event.tlEvent&&"pinch"!==n.event.tlEvent?"drag"!==t.type&&"pinch"!==t.type||(n=h({webEvent:t,id:e,currState:o.getValue(t,"target.state")})):(f(n),n=void 0,s=[]):"doubletap"===t.type||"tapHold"===t.type||"tap"===t.type?f(h({webEvent:t,id:e,currState:o.getValue(t,"target.state")})):"last"===t.gesture.firstOrLastSwipeEvent||"last"===t.gesture.firstOrLastPinchEvent?(f(h({webEvent:t,id:e,currState:o.getValue(t,"target.state")})),s=[]):"first"!==t.gesture.firstOrLastSwipeEvent&&"first"!==t.gesture.firstOrLastPinchEvent||h({webEvent:t,id:e,currState:o.getValue(t,"target.state")})}function b(e,n){var a=c.doubleTapInterval;1===(u+=1)?(l=function(e,t){var n=e,a=t;return function(){w(n,a),u=0}}(e,n),t=setTimeout((function(){l(),l=function(){}}),a)):(clearTimeout(t),n.type="doubletap",w(e,n),l=function(){},u=0)}function y(e,n){var a=c.swipeAfterPinchInterval;!p||"swipe"!==n.type&&"drag"!==n.type||w(e,n),"pinch"===n.type&&(w(e,n),p=!1,t=setTimeout((function(){p=!0}),a))}function E(e){var t;return document.createEvent?((t=document.createEvent("HTMLEvents")).initEvent(e.type,!0,!0),t.gesture=e):((t=document.createEventObject()).eventType=e.type,t.gesture=e),t}function T(e,t){void 0!==t&&(document.createEvent?t.dispatchEvent(e):t.fireEvent("on"+e.eventType,e))}function L(e){var t=e.type,n=e.target;"tap"===t?(T(E(e),n),r=void 0):"press"===t?(e.type="tapHold",T(E(e),n),r=void 0):"panstart"===t?(e.type="swipe",e.firstOrLastSwipeEvent="first",T(E(e),n),r=n):"panend"===t?(e.type="swipe",e.firstOrLastSwipeEvent="last",T(E(e),r),r=void 0):"pinchstart"===t?(e.type="pinch",e.firstOrLastPinchEvent="first",T(E(e),n),r=n):"pinchend"===t&&(e.type="pinch",e.firstOrLastPinchEvent="last",T(E(e),r),r=void 0)}return{init:function(){var t,n,i,s,u,p,l,f=[],v=TLT.getCoreConfig().modules.gestures.events,m="";if("function"==typeof Hammer){for("1"===(a=Hammer.VERSION.split(".")[0])&&(Hammer.defaults.behavior.userSelect="auto",Hammer.defaults.behavior.userDrag="auto",Hammer.defaults.behavior.contentZooming="auto",Hammer.defaults.behavior.touchCallout="default",Hammer.defaults.behavior.touchAction="auto"),e.getConfig()&&e.getConfig().options&&o.extend(!0,c,e.getConfig().options),t=0;t<v.length;t+=1)if("tap"===(l=v[t].name)&&(m+="tap "),"swipe"===l&&(m+="panstart panend "),"tapHold"===l&&(m+="press "),"pinch"===l&&(m+="pinchstart pinchend"),(s=v[t].target)===window||"window"===s)"1"===a&&d.push(new Hammer(window,c));else if(null!=u)for(u=s.split(", "),n=0;n<u.length;n+=1)for(f=TLT.getService("browser").queryAll(u[n],document),i=0;i<f.length;i+=1)-1===o.indexOf(g,f[i])&&(g.push(f[i]),1);if("1"===a)for(t=0;t<g.length;t+=1)d.push(new Hammer(g[t],c));else if(0!==g.length)for(t=0;t<g.length;t+=1)(p=new Hammer.Manager(g[t])).add(new Hammer.Tap({event:"tap"})),p.add(new Hammer.Pan({direction:Hammer.DIRECTION_ALL})),p.add(new Hammer.Press),p.add(new Hammer.Pinch({enable:!0})),p.on(m,(function(e){(("panend"===e.type||"pinchend"===e.type)&&g.indexOf(r)>-1||g.indexOf(e.target)>-1)&&L(e)})),d.push(p);else void 0===window.style&&(window.style=[]),(p=new Hammer.Manager(window)).add(new Hammer.Tap({event:"tap"})),p.add(new Hammer.Pan({direction:Hammer.DIRECTION_ALL})),p.add(new Hammer.Press),p.add(new Hammer.Pinch({enable:!0})),p.on(m,(function(e){L(e)})),d.push(p)}},destroy:function(){var e;if(null!=d)for(e=0;e<d.length;e+=1)d[e].off("tap press pinchstart pinchend panstart panend"),d[e].enabled=!1;d=[],g=[]},onevent:function(e){var n;if("object"==typeof e&&e.type&&(e.gesture||"unload"===e.type)&&e.target&&("unload"===e.type||"mouse"!==e.gesture.pointerType||!c.preventMouse))switch(n=o.getValue(e,"target.id"),e.type){case"tap":b(n,e);break;case"swipe":case"pinch":case"drag":y(n,e);break;case"tapHold":case"hold":case"release":w(n,e);break;case"unload":clearTimeout(t),l()}}}})); // eslint-disable-line // NOSONAR
                } else {
                    if (console) {
                        console.info("Could not load TL.Gestures.");
                    }
                }

                // Add construct-style-sheets-polyfill 3.1.0 if Safari
                if (window.TLT.utils.isiOS && addSafariPolyFill) {
                    !function(){"use strict";if("undefined"!=typeof document&&!("adoptedStyleSheets"in document)){var e="ShadyCSS"in window&&!ShadyCSS.nativeShadow,t=document.implementation.createHTMLDocument(""),n=new WeakMap,o="object"==typeof DOMException?Error:DOMException,r=Object.defineProperty,c=Array.prototype.forEach,i=/@import.+?;?$/gm,a=CSSStyleSheet.prototype;a.replace=function(){return Promise.reject(new o("Can't call replace on non-constructed CSSStyleSheets."))},a.replaceSync=function(){throw new o("Failed to execute 'replaceSync' on 'CSSStyleSheet': Can't call replaceSync on non-constructed CSSStyleSheets.")};var s=new WeakMap,u=new WeakMap,d=new WeakMap,l=new WeakMap,f=W.prototype;f.replace=function(e){try{return this.replaceSync(e),Promise.resolve(this)}catch(e){return Promise.reject(e)}},f.replaceSync=function(e){if(F(this),"string"==typeof e){var t=this;s.get(t).textContent=function(e){var t=e.replace(i,"");return t!==e&&console.warn("@import rules are not allowed here. See https://github.com/WICG/construct-stylesheets/issues/119#issuecomment-588352418"),t.trim()}(e),l.set(t,[]),u.get(t).forEach((function(e){e.isConnected()&&R(t,M(t,e))}))}},r(f,"cssRules",{configurable:!0,enumerable:!0,get:function(){return F(this),s.get(this).sheet.cssRules}}),r(f,"media",{configurable:!0,enumerable:!0,get:function(){return F(this),s.get(this).sheet.media}}),["addRule","deleteRule","insertRule","removeRule"].forEach((function(e){f[e]=function(){var t=this;F(t);var n=arguments;l.get(t).push({method:e,args:n}),u.get(t).forEach((function(o){if(o.isConnected()){var r=M(t,o).sheet;r[e].apply(r,n)}}));var o=s.get(t).sheet;return o[e].apply(o,n)}})),r(W,Symbol.hasInstance,{configurable:!0,value:C});var h={childList:!0,subtree:!0},p=new WeakMap,y=new WeakMap,S=new WeakMap,m=new WeakMap;if(N.prototype={isConnected:function(){var e=y.get(this);return e instanceof Document?"loading"!==e.readyState:function(e){return"isConnected"in e?e.isConnected:document.contains(e)}(e.host)},connect:function(){var e=x(this);m.get(this).observe(e,h),S.get(this).length>0&&D(this),k(e,(function(e){O(e).connect()}))},disconnect:function(){m.get(this).disconnect()},update:function(e){var t=this,n=y.get(t)===document?"Document":"ShadowRoot";if(!Array.isArray(e))throw new TypeError("Failed to set the 'adoptedStyleSheets' property on "+n+": Iterator getter is not callable.");if(!e.every(C))throw new TypeError("Failed to set the 'adoptedStyleSheets' property on "+n+": Failed to convert value to 'CSSStyleSheet'");if(e.some(b))throw new TypeError("Failed to set the 'adoptedStyleSheets' property on "+n+": Can't adopt non-constructed stylesheets");t.sheets=e;var o,r,c=S.get(t),i=(o=e).filter((function(e,t){return o.indexOf(e)===t}));(r=i,c.filter((function(e){return-1===r.indexOf(e)}))).forEach((function(e){var n;(n=M(e,t)).parentNode.removeChild(n),function(e,t){d.get(e).delete(t),u.set(e,u.get(e).filter((function(e){return e!==t})))}(e,t)})),S.set(t,i),t.isConnected()&&i.length>0&&D(t)}},window.CSSStyleSheet=W,T(Document),"ShadowRoot"in window){T(ShadowRoot);var g=Element.prototype,v=g.attachShadow;g.attachShadow=function(e){var t=v.call(this,e);return"closed"===e.mode&&n.set(this,t),t}}var w=O(document);w.isConnected()?w.connect():document.addEventListener("DOMContentLoaded",w.connect.bind(w))}function E(e){return e.shadowRoot||n.get(e)}function C(e){return"object"==typeof e&&(f.isPrototypeOf(e)||a.isPrototypeOf(e))}function b(e){return"object"==typeof e&&a.isPrototypeOf(e)}function M(e,t){return d.get(e).get(t)}function R(e,t){requestAnimationFrame((function(){t.textContent=s.get(e).textContent,l.get(e).forEach((function(e){return t.sheet[e.method].apply(t.sheet,e.args)}))}))}function F(e){if(!s.has(e))throw new TypeError("Illegal invocation")}function W(){var e=document.createElement("style");t.body.appendChild(e),s.set(this,e),u.set(this,[]),d.set(this,new WeakMap),l.set(this,[])}function O(e){var t=p.get(e);return t||(t=new N(e),p.set(e,t)),t}function T(e){r(e.prototype,"adoptedStyleSheets",{configurable:!0,enumerable:!0,get:function(){return O(this).sheets},set:function(e){O(this).update(e)}})}function k(e,t){for(var n=document.createNodeIterator(e,NodeFilter.SHOW_ELEMENT,(function(e){return E(e)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}),null,!1),o=void 0;o=n.nextNode();)t(E(o))}function x(e){var t=y.get(e);return t instanceof Document?t.body:t}function D(e){var t=document.createDocumentFragment(),n=S.get(e),o=m.get(e),r=x(e);o.disconnect(),n.forEach((function(n){t.appendChild(M(n,e)||function(e,t){var n=document.createElement("style");return d.get(e).set(t,n),u.get(e).push(t),n}(n,e))})),r.insertBefore(t,null),o.observe(r,h),n.forEach((function(t){R(t,M(t,e))}))}function N(t){var n=this;n.sheets=[],y.set(n,t),S.set(n,[]),m.set(n,new MutationObserver((function(t,o){document?t.forEach((function(t){e||c.call(t.addedNodes,(function(e){e instanceof Element&&k(e,(function(e){O(e).connect()}))})),c.call(t.removedNodes,(function(t){t instanceof Element&&(function(e,t){return t instanceof HTMLStyleElement&&S.get(e).some((function(t){return M(t,e)}))}(n,t)&&D(n),e||k(t,(function(e){O(e).disconnect()})))}))})):o.disconnect()})))}}()
                }
                
                // Add ajaxListener
                if (addAjaxListener === true) {
                    TLT.addModule("ajaxListener",function(c){var m={},i=false,k,q,B,l,v=c.utils;function r(E){var G,C,H,F=false,D=m.urlBlocklist;if(!E||!D){return F}for(G=0,C=D.length;!F&&G<C;G+=1){H=D[G];F=H.cRegex.test(E)}return F}function g(E,J,D){var G,C,H={},I=m.filters,F;if(!I||!I.length){return H}for(G=0,C=I.length,F=false;!F&&G<C;G+=1){H=I[G];F=true;if(H.url){F=H.url.cRegex.test(E)}if(F&&H.method){F=H.method.cRegex.test(J)}if(F&&H.status){F=H.status.cRegex.test(D)}}if(!F){H=null}return H}function p(G){var I={},E,C,H,D,F;G=G.split(/[\r\n]+/);for(E=0,C=G.length;E<C;E+=1){H=G[E].split(": ");D=H[0];F=v.rtrim(H[1]);if(D&&D.length){I[D]=F}}return I}function n(J,F){var I={type:5,customEvent:{name:"ajaxListener",data:{interfaceType:"XHR"}}},E,D=I.customEvent.data,C;if(!J){return}E=document.createElement("a");E.href=J.tListener.url;D.originalURL=E.host+(E.pathname[0]==="/"?"":"/")+E.pathname;D.requestURL=c.normalizeUrl?c.normalizeUrl(D.originalURL,3):D.originalURL;D.description="Full Ajax Monitor "+D.requestURL;D.method=J.tListener.method;D.status=J.status;D.statusText=J.statusText||"";D.async=J.tListener.async;D.ajaxResponseTime=J.tListener.end-J.tListener.start;D.locationHref=c.normalizeUrl(document.location.href,3);D.queryParams=f(J.tListener.url);if(F.requestHeaders){D.requestHeaders=J.tListener.reqHeaders}if(F.requestData&&typeof J.tListener.reqData==="string"&&!J.tListener.isSystemXHR){try{D.request=JSON.parse(J.tListener.reqData)}catch(H){D.request=J.tListener.reqData}}if(F.responseHeaders){D.responseHeaders=p(J.getAllResponseHeaders())}if(F.responseData){if(typeof J.responseType==="undefined"){C=J.responseText}else{if(J.responseType===""||J.responseType==="text"){C=J.response}else{if(J.responseType==="json"){D.response=J.response}else{D.response=typeof J.response}}}if(C){try{D.response=JSON.parse(C)}catch(G){D.response=C}}if(J.responseType){D.responseType=J.responseType}}c.post(I)}function s(E){var G,F={},D=E.entries(),C=D.next();while(!C.done){G=C.value;F[G[0]]=G[1];C=D.next()}return F}function h(C){return s(C)}function f(D){var H=D.indexOf("?");if(H<0){return{}}var I=D.substring(H+1);var G=new URLSearchParams(I);var C={};var E=G.entries();for(var F in E){C[E[F][0]]=E[F][1]}return C}function b(C){var E=C;if(!C){return E}if(typeof C==="object"&&C.toString().indexOf("FormData")!==-1){E=s(C)}else{if(typeof C==="string"){try{E=JSON.parse(C)}catch(D){E=C}}}return E}function t(C,F,G){var H={type:5,customEvent:{name:"ajaxListener",data:{interfaceType:"fetch"}}},E,D=H.customEvent.data,I;E=document.createElement("a");E.href=C.url;D.originalURL=E.host+(E.pathname[0]==="/"?"":"/")+E.pathname;D.requestURL=c.normalizeUrl?c.normalizeUrl(D.originalURL,3):D.originalURL;D.description="Full Ajax Monitor "+D.requestURL;D.method=C.initData.method;D.status=F.status;D.statusText=F.statusText||"";D.async=true;D.ajaxResponseTime=C.end-C.start;D.responseType=F.type;D.locationHref=c.normalizeUrl(document.location.href,3);D.queryParams=f(C.url);if(G.requestHeaders){if(C.initData.headers&&C.initData.headers.toString().indexOf("Headers")!==-1){D.requestHeaders=h(C.initData.headers)}else{D.requestHeaders=C.initData.headers||""}}if(G.requestData&&typeof C.body!=="undefined"&&!C.isSystemXHR){D.request=b(C.body)}if(G.responseHeaders){D.responseHeaders=h(F.headers)}if(G.responseData){I=F.headers.get("content-type");if(I&&I.indexOf("application/json")!==-1){F.clone().json().then(function(J){D.response=J;c.post(H)});return}if(I&&(I.indexOf("text")!==-1||I.indexOf("xml")!==-1)){F.clone().text().then(function(J){D.response=J;c.post(H)});return}D.response="Not logging unsupported response content: "+I}c.post(H)}function o(G){var E,D=G.tListener.url,H=G.tListener.method,C=G.status.toString(),F={requestHeaders:false,requestData:false,responseHeaders:false,responseData:false};E=g(D,H,C);if(E){if(E.log){F=E.log}n(G,F)}}function a(C,G){var F,E=C.url,I=C.initData.method,D=G.status.toString(),H={requestHeaders:false,requestData:false,responseHeaders:false,responseData:false};if(r(E)){return}F=g(E,I,D);if(F){if(F.log){H=F.log}t(C,G,H)}}function y(D){var E,C;if(!D||!D.target){return}E=D.target;C=E.readyState;if(C===4){E.removeEventListener("readystatechange",y);E.tListener.end=Date.now();o(E)}}function u(D){var C=D.setRequestHeader;D.setRequestHeader=function(H,F){var G=this,E=G.tListener;if(H&&H.length){E.reqHeaders[H]=F}return C.apply(G,arguments)}}function A(C){var D=C.send;C.send=function(F){var G=this,E=G.tListener;if(F){E.reqData=F}E.start=Date.now();return D.apply(G,arguments)}}function w(D){var E,C,F;C=TLT.getServiceConfig("queue");F=C.queues||[];for(E=0;E<F.length;E+=1){if(F[E].endpoint&&D.indexOf(F[E].endpoint)!==-1){return true}}return false}function x(F,C,D){var E=this;if(i&&!r(C)){E.addEventListener("readystatechange",y);E.tListener={method:F,url:C,async:(typeof D==="undefined")?true:!!D,reqHeaders:{},isSystemXHR:w(C)};u(E);A(E)}return k.apply(E,arguments)}function z(){if(XMLHttpRequest){k=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=x}}function j(){q=window.fetch;window.fetch=function(E,D){var C={},F;if(E instanceof Request){C.initData=E;C.url=E.url;C.initData.clone().text().then(function(G){if(G.length>0){C.body=G}})}else{C.initData=D||{};C.url=E.toString();if(D&&D.body){C.body=D.body}}C.isSystemXHR=w(C.url);C.start=Date.now();F=q.apply(this,arguments);return F.then(function(G){C.end=Date.now();a(C,G);return G})}}function d(C){if(C&&C.regex){C.cRegex=new RegExp(C.regex,C.flags)}}function e(E){var F,C,G,H=[],D=v.getValue(E,"skipSafetyCheck",false);if(E&&E.filters){H=E.filters}for(F=0,C=H.length;F<C;F+=1){G=H[F];v.forEach([G.url,G.method,G.status],d)}if(E&&E.urlBlocklist){v.forEach(E.urlBlocklist,d)}B=v.getValue(E,"xhrEnabled",true)&&window.XMLHttpRequest;if(B&&!D&&(XMLHttpRequest.toString().indexOf("[native code]")===-1||XMLHttpRequest.toString().indexOf("XMLHttpRequest")===-1)){B=false}l=v.getValue(E,"fetchEnabled",true)&&window.fetch;if(l&&!D&&window.fetch.toString().indexOf("[native code]")===-1){l=false}}return{init:function(){m=c.getConfig();e(m)},destroy:function(){i=false},onevent:function(C){switch(C.type){case"load":if(B){z()}if(l){j()}i=true;break;case"unload":i=false;break;default:break}},version:"1.3.0"}}); // eslint-disable-line // NOSONAR
                }

                // --------------------------------------------------------------------------------------
                // flushQueue custom module -------------------------------------------------------------
                // --------------------------------------------------------------------------------------
                // Triggers TLT.flushAll on visibilitychange. Used in conjunction with iOS tuning at end of config.
                TLT.addModule("flushQueue", function () {
                    return {
                        onevent: function (webEvent) {
                            if (webEvent) {
                                switch (webEvent.type) {
                                case "visibilitychange":
                                    TLT.flushAll();
                                    break;
                                default:
                                    break;
                                }
                            }
                        }
                    };
                });

                //***UIC CONFIGURATION***
                if (!newConfig) {
                    defaultConfig = window.TLT.getDefaultConfig();
                } else if (newConfig &&
                    Object.keys(newConfig).length === 0 &&
                    Object.getPrototypeOf(newConfig) === Object.prototype) {
                    defaultConfig = window.TLT.getDefaultConfig();
                } else {
                    defaultConfig = newConfig;
                }

                // update settings
                if (defaultConfig !== undefined &&
                    defaultConfig.services !== undefined &&
                    defaultConfig.services.queue !== undefined &&
                    defaultConfig.services.queue.queues[0] !== undefined) {
                        defaultConfig.services.queue.queues[0].endpoint = postUrl;
                } else {
                    if (console) {
                        console.warn("Not able to update defaultConfig.services.queue.queues[0].endpoint");
                    }
                }

                if (defaultConfig !== undefined &&
                    defaultConfig.modules !== undefined &&
                    defaultConfig.modules.TLCookie !== undefined) {
                    defaultConfig.modules.TLCookie.tlAppKey = appKey;
                } else {
                    if (console) {
                        console.warn("Not able to update defaultConfig.modules.TLCookie.tlAppKey");
                    }
                }
                
                if (window.TLT.utils.isLegacyIE) {
                    /**
                     * This version of the UIC does not support Internet Explorer 8.
                     * Applications requiring Internet Explorer 8 (or below) support should use UIC 5.2.0
                     */
                    if (console) {
                        console.warn("This version of the UIC does not support Internet Explorer 9.");
                        console.info("Applications requiring Internet Explorer 8 (or below) support should use UIC 5.2.0");
                    }
                    window.TLT.terminationReason = "Unsupported browser";
                    return;
                }

                window.TLT.init(defaultConfig, function (state) {
                    if (console) {
                        console.info("TLT.initLib has " + state + " with the following settings below:");
                        console.info(defaultConfig);
                    }
                });

                // --------------------------------------------------------------------------------------
                // Restart TLT for SPA
                // --------------------------------------------------------------------------------------
                if (addRestartTLTforSPA === true) {
                    (function () {
                        var origDestroy = window.TLT.destroy,
                            prevConfig;
                        // Check if document is active (visible and focused)
                        function checkVisibility() {
                            if (document.visibilityState === "visible" && document.hasFocus()) {
                                if (prevConfig && window.TLT && !TLT.isInitialized()) {
                                    console.log("Restarting TLT");
                                    TLT.init(prevConfig);
                                    prevConfig = null;
                                }
                                window.removeEventListener("visibilitychange", checkVisibility);
                                window.removeEventListener("focus", checkVisibility);
                            }
                        }
                        // If termination reason was inactivity, set listener for active document
                        window.TLT.destroy = function (se, tr) {
                            if (tr === "inactivity") {
                                prevConfig = TLT.getConfig();
                                window.addEventListener("visibilitychange", checkVisibility);
                                window.addEventListener("focus", checkVisibility);
                            }
                            origDestroy.call(window.TLT, se, tr);
                        };
                    }());
                }
                return defaultConfig;
            },

            /**
             * Initializes the system. The configuration information is passed to the
             * config service to manage it. All modules are started (unless their
             * configuration information indicates they should be disabled), and web events
             * are hooked up.
             * @param {Object} [config] The global configuration object. This will be saved
             *      for future invocations of TLT.init where there is no configuration object.
             * @param {function} [callback] function executed after initialization and destroy
                    the callback function takes one parameter which describes UIC state;
                    its value can be set to "initialized" or "destroyed"
             * @returns {void}
             */
            init: function (config, callback) {
                var timeoutCallback;

                // Setup utils to reference TLT.utils
                utils = this.utils;

                // Legacy IE (IE 8 and below) not supported.
                if (utils.isLegacyIE) {
                    return;
                }

                _callback = callback;
                if (!okToCallInit) {
                    throw new Error("init must only be called once!");
                }

                // Check for config
                if (!config && !this.config) {
                    throw new Error("missing configuration.");
                }
                config = config || this.config;
                this.config = config;

                okToCallInit = false;

                // Set the page id.
                tltPageId = "P." + utils.getRandomString(28);

                // Set the tab id.
                tltTabId = getTabIndex();

                timeoutCallback = function (event) {
                    event = event || window.event || {};
                    if (event.type === "load" || document.readyState !== "loading") {
                        if (document.removeEventListener) {
                            document.removeEventListener("DOMContentLoaded", timeoutCallback, false);
                            window.removeEventListener("load", timeoutCallback, false);
                        } else {
                            document.detachEvent("onreadystatechange", timeoutCallback);
                            window.detachEvent("onload", timeoutCallback);
                        }
                        _init(config, callback);
                    }
                };

                // case when DOM already loaded (lazy-loaded UIC)
                if (document.readyState === "complete" || (document.readyState === "interactive" && !utils.isIE)) {
                    // Lets the current browser cycle to complete before calling init
                    setTimeout(timeoutCallback);
                } else if (document.addEventListener) {
                    document.addEventListener("DOMContentLoaded", timeoutCallback, false);
                    // A fallback in case DOMContentLoaded is not supported
                    window.addEventListener("load", timeoutCallback, false);
                } else {
                    document.attachEvent("onreadystatechange", timeoutCallback);
                    // A fallback in case onreadystatechange is not supported
                    window.attachEvent("onload", timeoutCallback);
                }
            },

            /**
             * Indicates if the system has been initialized.
             * @returns {Boolean} True if init() has been called, false if not.
             */
            isInitialized: function () {
                return initialized;
            },

            getState: function () {
                return state;
            },

            /**
             * Shuts down the system. All modules are stopped and all web events
             * are unsubscribed.
             * @param {Boolean} [skipEvents] Whether to skip unregistering events.
             * @param {String} [terminationReason] Optional string describing reason for invoking destroy()
             * @returns {void}
             */
            destroy: function (skipEvents, terminationReason) {

                var token = "",
                    eventName = "",
                    target = null,
                    serviceName = null,
                    service = null,
                    delegateTarget = false;

                if (okToCallInit) { //nothing to do
                    return false;
                }

                this.stopAll();

                if (!skipEvents) {
                    // Unregister events
                    for (token in events) {
                        if (events.hasOwnProperty(token)) {
                            eventName = token.split("|")[0];
                            target = events[token].target;
                            delegateTarget = events[token].delegateTarget || undefined;
                            if (browserService) {
                                browserService.unsubscribe(eventName, target, this._publishEvent, delegateTarget);
                            }
                        }
                    }

                    if (mousemoveDetectHandler) {
                        browserService.unsubscribe("mousemove", document, mousemoveDetectHandler);
                        mousemoveDetectHandler = null;
                    }
                }

                // call destroy on services that have it
                for (serviceName in services) {
                    if (services.hasOwnProperty(serviceName)) {
                        service = services[serviceName].instance;

                        if (service && typeof service.destroy === "function") {
                            service.destroy();
                        }

                        services[serviceName].instance = null;
                    }
                }

                // Reset globals
                isFrameBlacklisted.clearCache();
                events = {};
                currentWebEvent = {};
                mutationCallbacks = [];

                initialized = false;

                // Reset to allow re-initialization.
                okToCallInit = true;

                state = "destroyed";

                // Set termination reason
                TLT.terminationReason = terminationReason || state;

                // Store termination reason in session storage for subsequent retrieval during init
                try {
                    sessionStorage.setItem("tl.TR", TLT.terminationReason);
                    sessionStorage.setItem("tl.PU", this.normalizeUrl("", location.href));
                } catch (e1) {
                    // Do nothing
                }

                if (typeof _callback === "function") {
                    // Protect against unexpected exceptions since _callback is 3rd party code.
                    try {
                        _callback("destroyed");
                    } catch (e2) {
                        // Do nothing!
                    }
                }

                // Setup a pageshow listener (if one hasn't been setup previously) to help
                // reinitialize the SDK on persisted pages.
                if (!registeredPageshowListener) {
                    window.addEventListener("pageshow", pageshowListener);
                    registeredPageshowListener = true;
                }
            },

            /**
             * Iterates over each module and starts or stops it according to
             * configuration information.
             * @returns {Boolean} true if modules were successfully initialized, false otherwise.
             * @private
             */
            _updateModules: function (scope) {

                var moduleConfig = null,
                    moduleName = null,
                    result = true;

                if (coreConfig && coreConfig.modules) {
                    try {
                        for (moduleName in coreConfig.modules) {
                            if (coreConfig.modules.hasOwnProperty(moduleName)) {
                                moduleConfig = coreConfig.modules[moduleName];

                                if (modules.hasOwnProperty(moduleName)) {
                                    if (moduleConfig.enabled === false) {
                                        this.stop(moduleName);
                                        continue;
                                    }

                                    this.start(moduleName);

                                    // If the module has specified events in the configuration
                                    // register event handlers for them.
                                    if (moduleConfig.events) {
                                        this._registerModuleEvents(moduleName, moduleConfig.events, scope);
                                    }
                                }
                            }
                        }
                        this._registerModuleEvents.clearCache();
                    } catch (e) {
                        core.destroy(false, "_updateModules: " + e.message);
                        result = false;
                    }
                } else {
                    result = false;
                }
                return result;
            },

            /**
             * Registers event handlers for all modules in a specific scope.
             * E.g. if the application changed the DOM via ajax and want to let
             * us rebind event handlers in this scope.
             * @param  {Object} scope A DOM element as a scope.
             */
            rebind: function (scope) {
                core._updateModules(scope);
            },

            /**
             * Public API which returns the Tealeaf session data that has been
             * configured to be shared with 3rd party scripts.
             * @returns {object} JSON object containing the session data as
             * name-value pairs. If no data is available then returns null.
             */
            getSessionData: function () {

                if (!core.isInitialized()) {
                    return;
                }

                var rv = null,
                    sessionData = null,
                    scName,
                    scValue,
                    info;

                if (!coreConfig || !coreConfig.sessionDataEnabled) {
                    return null;
                }

                sessionData = coreConfig.sessionData || {};

                // Add any session ID data
                scName = sessionData.sessionQueryName;
                if (scName) {
                    scValue = utils.getQueryStringValue(scName, sessionData.sessionQueryDelim);
                } else {
                    // Either the cookie name is configured or the default is assumed.
                    scName = sessionData.sessionCookieName;
                    if (scName) {
                        scValue = utils.getCookieValue(scName);
                    } else {
                        info = TLT.getTLTSessionCookieInfo();
                        scName = info.tltCookieName;
                        scValue = info.tltCookieValue;
                    }
                }

                if (scName && scValue) {
                    rv = rv || {};
                    rv.tltSCN = scName;
                    rv.tltSCV = scValue;
                    rv.tltSCVNeedsHashing = !!sessionData.sessionValueNeedsHashing;
                }

                return rv;
            },

            /**
             * Public API to create and add a geolocation message to the default
             * queue. This API accepts a position object which is defined
             * by the W3C Geolocation API. If no position object is specified then
             * this API will return without logging any message.
             * @param {object} position W3C Geolocation API position object.
             * @returns {void}
             */
            logGeolocation: function (position) {
                var geolocationMsg;

                if (!core.isInitialized()) {
                    return;
                }

                if (!position || !position.coords) {
                    return;
                }

                geolocationMsg = {
                    type: 13,
                    geolocation: {
                        "lat": utils.getValue(position, "coords.latitude", 0),
                        "long": utils.getValue(position, "coords.longitude", 0),
                        "accuracy": Math.ceil(utils.getValue(position, "coords.accuracy", 0))
                    }
                };

                queueService.post("", geolocationMsg);
            },

            /**
             * Public API to create and add a custom event message to the default
             * queue.
             * @param {string} name Name of the custom event.
             * @param {object} customObj Custom object which will be serialized
             * to JSON and included with the custom message.
             * @returns {void}
             */
            logCustomEvent: function (name, customMsgObj) {

                if (!core.isInitialized()) {
                    return;
                }

                var customMsg = null;

                // Sanity checks
                if (!name || typeof name !== "string") {
                    name = "CUSTOM";
                }
                customMsgObj = customMsgObj || {};

                customMsg = {
                    type: 5,
                    customEvent: {
                        name: name,
                        data: customMsgObj
                    }
                };
                queueService.post("", customMsg);
            },

            /**
             * Public API to create and add an exception event message to the
             * default queue.
             * @param {string} msg Description of the error or exception.
             * @param {string} [url] URL related to the error or exception.
             * @param {integer} [line] Line number associated with the error or exception.
             * @returns {void}
             */
            logExceptionEvent: function (msg, url, line) {

                if (!core.isInitialized()) {
                    return;
                }

                var exceptionMsg = null;

                // Sanity checks
                if (!msg || typeof msg !== "string") {
                    return;
                }
                // Normalize the URL
                if (url) {
                    url = core.normalizeUrl("", url, 6);
                }
                url = url || "";
                line = line || -1;

                exceptionMsg = {
                    type: 6,
                    exception: {
                        description: msg,
                        url: url,
                        line: line
                    }
                };

                queueService.post("", exceptionMsg);
            },

            /**
             * Public API to create and add a form completion message. Form completion indicates
             * if the user submitted a form (or form equivalent) and if the form was validated.
             * @param {boolean} submitted Indicates if the form (or form equivalent) was submitted.
             * For a standard form element this would be when the submit event is triggered.
             * For applications that use AJAX, a submission is defined as per the business logic.
             * @param {boolean} [valid] Indicates if the form fields were validated and the result
             * of the validation. True if validation was performed and successful, false if validation
             * was performed but failed.
             * @returns {void}
             */
            logFormCompletion: function (submitted, valid) {

                if (!core.isInitialized()) {
                    return;
                }

                var formCompletionMsg = {
                        type: 15,
                        formCompletion: {
                            submitted: !!submitted,
                            valid: (typeof valid === "boolean" ? valid : null)
                        }
                    };

                queueService.post("", formCompletionMsg);
            },

            /**
             * Public API to log the data layer.
             * @param {object} [dataLayerObject] Optional data layer object. If not specified,
             * the object specified in the UIC configuration will be logged.
             * @returns {void}
             */
            logDataLayer: function (dataLayerObject) {
                var logDataLayerEvent;

                if (!core.isInitialized()) {
                    return;
                }

                if (dataLayerModule) {
                    if (!dataLayerObject || typeof dataLayerObject === "object") {
                        logDataLayerEvent = {
                            type: "logDataLayer",
                            data: dataLayerObject
                        };
                        dataLayerModule.onevent(logDataLayerEvent);
                    }
                } else {
                    return;
                }
            },

            /**
             * Public API to create and add a screenview LOAD message to the
             * default queue.
             * @param {string} name User friendly name of the screenview that is
             * being loaded. Note: The same name must be used when the screenview
             * UNLOAD API is called.
             * @param {string} [referrerName] Name of the previous screenview that
             * is being replaced.
             * @param {object} [root] DOMNode which represents the root or
             * parent of this screenview. Usually this is a div container.
             * @returns {void}
             */
            logScreenviewLoad: function (name, referrerName, root) {

                if (!core.isInitialized()) {
                    return;
                }

                logScreenview("LOAD", name, referrerName, root);
            },

            /**
             * Public API to create and add a screenview UNLOAD message to the
             * default queue.
             * @param {string} name User friendly name of the screenview that is
             * unloaded. Note: This should be the same name used in the screenview
             * LOAD API.
             * @returns {void}
             */
            logScreenviewUnload: function (name) {

                if (!core.isInitialized()) {
                    return;
                }

                logScreenview("UNLOAD", name);
            },

            /**
             * Public API to log a DOM Capture message to the default queue.
             * @param {DOMElement} [root] Parent element from which to start the capture.
             * @param {Object} [config] DOM Capture configuration options.
             * @returns {String} The unique string representing the DOM Capture id.
             * null if DOM Capture failed.
             */
            logDOMCapture: function (root, config) {
                var dcid = null,
                    domCaptureData,
                    domCaptureServiceConfig,
                    msg;

                if (!this.isInitialized()) {
                    return dcid;
                }

                // DOM Capture is not supported on IE 8 and below
                if (utils.isLegacyIE) {
                    return dcid;
                }

                if (domCaptureService) {
                    root = root || window.document;
                    domCaptureServiceConfig = this.getServiceConfig("domCapture");
                    config = utils.mixin({}, domCaptureServiceConfig.options, config);
                    domCaptureData = domCaptureService.captureDOM(root, config);
                    if (domCaptureData) {
                        // Add the unique id for this DOM Capture message
                        dcid = config.dcid || ("dcid-" + utils.getSerialNumber() + "." + (new Date()).getTime());
                        domCaptureData.dcid = dcid;
                        // Copy the eventOn flag
                        domCaptureData.eventOn = !!config.eventOn;
                        // Create the message
                        msg = {
                            "type": 12,
                            "domCapture": domCaptureData
                        };
                        if (config.timeoutExpired) {
                            // Add timeout expiration indicator
                            msg.domCapture.timeout = true;
                        }
                        // POST it to the queue
                        queueService.post("", msg);
                        if (config.qffd !== false && !fullDOMFlushed && msg.domCapture.fullDOM) {
                            // Flush queue on 1st full DOM
                            queueService.flush();
                            fullDOMFlushed = true;
                        }
                    }
                }
                return dcid;
            },

            /**
             * Function invoked by modules to log a DOM Capture message to the default queue.
             * @param {String} moduleName Name of the module which invoked this function.
             * @param {DOMElement} [root] Parent element from which to start the capture.
             * @param {Object} [config] DOM Capture configuration options.
             * @returns {String} The unique string representing the DOM Capture id.
             * null if DOM Capture failed.
             */
            performDOMCapture: function (moduleName, root, config) {
                return this.logDOMCapture(root, config);
            },

            /**
             * Function invoked by modules to log a Form Completion message.
             * @param {String} moduleName Name of the module which invoked this function.
             * @param {boolean} submitted Indicates if the form (or form equivalent) was submitted.
             * For a standard form element this would be when the submit event is triggered.
             * @param {boolean} [valid] Indicates if the form fields were validated and the result
             * of the validation. True if validation was performed and successful, false if validation
             * was performed but failed.
             * @see logFormCompletion
             */
            performFormCompletion: function (moduleName, submitted, valid) {
                return this.logFormCompletion(submitted, valid);
            },

            /**
             * Helper function for registerBridgeCallbacks
             * It checks if the call back type is valid and enabled.
             * @function
             * @private
             * @param {String}
             * @returns {boolean} Whether callback type is enabled.
             */
            _bridgeCallback: function (cbType) {
                var callBackType = bridgeCallbacks[cbType];

                if (callBackType && callBackType.enabled) {
                    return callBackType;
                }
                return null;
            },

            /**
             * Public API to add a screenshot capture. This needs to be
             * implemented and registered (see registerBridgeCallbacks)
             * If no callback has been registered, then a call to this API
             * does nothing.
             * @returns {void}
             */
            logScreenCapture: function () {
                if (!core.isInitialized()) {
                    return;
                }
                var bridgeCallback = core._bridgeCallback("screenCapture");
                if (bridgeCallback !== null) {
                    bridgeCallback.cbFunction();
                }
            },

            /**
             * Public API to enable Tealeaf framework. This needs to be
             * implemented and registered (see registerBridgeCallbacks)
             * If no callback has been registered, then a call to this API
             * does nothing.
             * @returns {void}
             */
            enableTealeafFramework: function () {
                if (!core.isInitialized()) {
                    return;
                }
                var bridgeCallback = core._bridgeCallback("enableTealeafFramework");

                if (bridgeCallback !== null) {
                    bridgeCallback.cbFunction();
                }
            },

            /**
             * Public API to disable Tealeaf framework. This needs to be
             * implemented and registered (see registerBridgeCallbacks)
             * If no callback has been registered, then a call to this API
             * does nothing.
             * @returns {void}
             */
            disableTealeafFramework: function () {
                if (!core.isInitialized()) {
                    return;
                }
                var bridgeCallback = core._bridgeCallback("disableTealeafFramework");

                if (bridgeCallback !== null) {
                    bridgeCallback.cbFunction();
                }
            },

            /**
             * Public API to start a new Tealeaf session. This needs to be
             * implemented and registered (see registerBridgeCallbacks)
             * If no callback has been registered, then a call to this API
             * does nothing.
             * @returns {void}
             */
            startNewTLFSession: function () {
                if (!core.isInitialized()) {
                    return;
                }
                var bridgeCallback = core._bridgeCallback("startNewTLFSession");

                if (bridgeCallback !== null) {
                    bridgeCallback.cbFunction();
                }
            },

            /**
             * Public API to start get current Tealeaf session Id. This needs to be
             * implemented and registered (see registerBridgeCallbacks)
             * If no callback has been registered, then a call to this API
             * does nothing.
             * @returns {String} Current session Id
             */
            currentSessionId: function () {
                if (!core.isInitialized()) {
                    return;
                }
                var sessionId,
                    bridgeCallback = core._bridgeCallback("currentSessionId");

                if (bridgeCallback !== null) {
                    sessionId = bridgeCallback.cbFunction();
                }
                return sessionId;
            },

            /**
             * Public API to get default value of a configurable item in
             * TLFConfigurableItems.properties file.  This needs to be
             * implemented and registered (see registerBridgeCallbacks)
             * If no callback has been registered, then a call to this API
             * does nothing.
             * @param {String} configItem This is the name of the configurable item.
             * @returns {String} The value for the item.
             */
            defaultValueForConfigurableItem: function (configItem) {
                if (!core.isInitialized()) {
                    return;
                }
                var value,
                    bridgeCallback = core._bridgeCallback("defaultValueForConfigurableItem");

                if (bridgeCallback !== null) {
                    value = bridgeCallback.cbFunction(configItem);
                }
                return value;
            },

            /**
             * Public API to get the value of a configurable item either from TLFConfigurableItems.properties file
             * or in memory data structure. This needs to be implemented and registered (see registerBridgeCallbacks)
             * If no callback has been registered, then a call to this API
             * does nothing.
             * @param {String} configItem This is the name of the configurable item.
             * @returns {String} The value for the item.
             */
            valueForConfigurableItem: function (configItem) {
                if (!core.isInitialized()) {
                    return;
                }
                var value,
                    bridgeCallback = core._bridgeCallback("valueForConfigurableItem");

                if (bridgeCallback !== null) {
                    value = bridgeCallback.cbFunction(configItem);
                }
                return value;
            },

            /**
             * Public API to set the value of a configurable item in TLFConfigurableItems.properties file.
             * This updates only in the memory value. This needs to be
             * implemented and registered (see registerBridgeCallbacks)
             * If no callback has been registered, then a call to this API
             * does nothing.
             * @param {String} configItem This is the name of the configurable item.
             * @param {String} value The value assign to the configItem.
             * @returns {boolean} Whether item was set.
             */
            setConfigurableItem: function (configItem, value) {
                if (!core.isInitialized()) {
                    return;
                }
                var result = false,
                    bridgeCallback = core._bridgeCallback("setConfigurableItem");

                if (bridgeCallback !== null) {
                    result = bridgeCallback.cbFunction(configItem, value);
                }
                return result;
            },

            /**
             * Public API to add additional http header.
             * This needs to be implemented and registered (see registerBridgeCallbacks)
             * If no callback has been registered, then a call to this API
             * does nothing.
             * @param {String} key This is the key of the configurable item.
             * @param {String} value The value assign to the configItem.
             * @returns {boolean} Whether item was set.
             */
            addAdditionalHttpHeader: function (key, value) {
                if (!core.isInitialized()) {
                    return;
                }
                var result = false,
                    bridgeCallback = core._bridgeCallback("addAdditionalHttpHeader");

                if (bridgeCallback !== null) {
                    result = bridgeCallback.cbFunction(key, value);
                }
                return result;
            },

            /**
             * Public API to log custom event.
             * This needs to be implemented and registered (see registerBridgeCallbacks)
             * If no callback has been registered, then a call to this API
             * does nothing.
             * @param {String} eventName A custom event name.
             * @param {String} jsonData JSON data string.
             * @param {int} logLevel Tealeaf library logging level for the event.
             * @returns {boolean} Whether item was set.
             */
            logCustomEventBridge: function (eventName, jsonData, logLevel) {
                if (!core.isInitialized()) {
                    return;
                }
                var result = false,
                    bridgeCallback = core._bridgeCallback("logCustomEventBridge");

                if (bridgeCallback !== null) {
                    result = bridgeCallback.cbFunction(eventName, jsonData, logLevel);
                }
                return result;
            },

            /**
             * Public API to allow registration of callback functions
             * These callback types are supported currently:
             * 1. screenCapture: Registering this type enables ability to
             *    take screenshots from script.
             * 2. messageRedirect: Registering this type will allow the
             *    callback function to process (and consume) the message
             *    instead of being handled by the default queue.
             * 3. addRequestHeaders: Registering this type will allow the
             *    callback function to return an array of HTTP request headers
             *    that will be set by the UIC in it's requests to the target.
             * @param {Array} callbacks Array of callback objects. Each object
             *                is of the format: {
             *                    {boolean}  enabled
             *                    {string}   cbType
             *                    {function} cbFunction
             *                    {integer}  [order]
             *                }
             *                If the callbacks array is empty then any previously
             *                registered callbacks would be removed.
             *                If the enabled flag is set to false then the matching
             *                callback entry (if any) will be removed.
             * @returns {boolean} true if callbacks were registered. false otherwise.
             */
            registerBridgeCallbacks: function (callbacks) {
                var i, j,
                    len,
                    cb = null,
                    cbEntry,
                    cbList,
                    cbListLen,
                    matched,
                    utils = TLT.utils;

                // Sanity check
                if (!callbacks) {
                    return false;
                }
                if (callbacks.length === 0) {
                    // Reset any previously registered callbacks.
                    bridgeCallbacks = {};
                    return false;
                }
                try {
                    for (i = 0, len = callbacks.length; i < len; i += 1) {
                        cb = callbacks[i];
                        if (typeof cb === "object" && cb.cbType && cb.cbFunction) {
                            cbEntry = {
                                enabled: cb.enabled,
                                cbFunction: cb.cbFunction,
                                cbOrder: cb.order || 0
                            };

                            if (utils.isUndefOrNull(bridgeCallbacks[cb.cbType])) {
                                if (cbEntry.enabled) {
                                    // If this is the first callback then directly save it as an object.
                                    bridgeCallbacks[cb.cbType] = cbEntry;
                                }
                            } else {
                                // If multiple callbacks of the same type are being registered then switch
                                // to using an array and storing them in the specified order.
                                if (!utils.isArray(bridgeCallbacks[cb.cbType])) {
                                    bridgeCallbacks[cb.cbType] = [ bridgeCallbacks[cb.cbType] ];
                                }
                                cbList = bridgeCallbacks[cb.cbType];
                                for (j = 0, matched = false, cbListLen = cbList.length; j < cbListLen; j += 1) {
                                    if (cbList[j].cbOrder === cbEntry.cbOrder && cbList[j].cbFunction === cbEntry.cbFunction) {
                                        matched = true;
                                        // Matching callback already exists
                                        if (!cbEntry.enabled) {
                                            // Delete the callback
                                            cbList.splice(j, 1);
                                            if (!cbList.length) {
                                                delete bridgeCallbacks[cb.cbType];
                                            }
                                        }
                                    } else if (cbList[j].cbOrder > cbEntry.cbOrder) {
                                        break;
                                    }
                                }
                                if (!matched) {
                                    if (cbEntry.enabled) {
                                        // Add to callbacks list
                                        cbList.splice(j, 0, cbEntry);
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                    return false;
                }
                return true;
            },

            /**
             * Public API for registering a mutation callback function.
             * @param {object} cb Callback function.
             * @param {boolean} register Register the callback if true.  Unregister if false.
             * @returns {boolean} true if callback is registered, false otherwise.
             */
            registerMutationCallback: function (cb, register) {
                var i;

                // Sanity check
                if (!cb || typeof cb !== "function") {
                    return false;
                }

                // If true, add callback if it was not added before.  Otherwise remove callback.
                if (register) {
                    i = mutationCallbacks.indexOf(cb);
                    if (i === -1) {
                        mutationCallbacks.push(cb);
                    }
                } else {
                    // Remove callback if found.
                    i = mutationCallbacks.indexOf(cb);
                    if (i !== -1) {
                        mutationCallbacks.splice(i, 1);
                    }
                }
                return true;
            },

            /**
             * Gets the mutated documents and nodes from the records
             * and invokes the registered callback functions.
             * @param {Array} records List of mutation record objects.
             */
            invokeMutationCallbacks: function (records) {
                var i,
                    cb,
                    doc,
                    target,
                    map,
                    documents = [],
                    nodes = [];

                // Sanity check
                if (mutationCallbacks.length === 0) {
                    return;
                }
                // Use map keys to avoid duplicates
                if (Map) {
                    map = new Map();
                } else {
                    map = new utils.WeakMap();
                }
                // Get mutated documents and nodes
                for (i = 0; i < records.length; i++) {
                    target = records[i].target;
                    if (target) {
                        doc = utils.getDocument(target);

                        // If doc was not seen before, add it
                        if (map.get(doc) === undefined) {
                            if (doc.host) {
                                nodes.push(doc);
                            } else {
                                documents.push(doc);
                            }
                            map.set(doc, true);
                        }
                    }
                }
                map.clear();

                // Invoke callbacks
                for (i = 0; i < mutationCallbacks.length; i++) {
                    cb = mutationCallbacks[i];
                    cb(records, documents, nodes);
                }
            },

            /**
             * Core function which is invoked by the queue service to allow
             * for the queue to be redirected if a messageRedirect callback
             * has been registered. (see registerBridgeCallbacks)
             * @param {array} queue The queue array containing the individual
             *                message objects.
             * @returns {array} The array that should replace the previously
             *                  passed queue.
             */
            redirectQueue: function (queue) {
                var i, j,
                    len,
                    cb,
                    cbList,
                    cbListLen,
                    retval;

                // Sanity check
                if (!queue || !queue.length) {
                    return queue;
                }

                cb = bridgeCallbacks.messageRedirect;
                if (!cb) {
                    return queue;
                }

                if (!utils.isArray(cb)) {
                    cbList = [cb];
                } else {
                    cbList = cb;
                }

                for (j = 0, cbListLen = cbList.length; j < cbListLen; j += 1) {
                    cb = cbList[j];
                    if (cb && cb.enabled) {
                        for (i = 0, len = queue.length; i < len; i += 1) {
                            retval = cb.cbFunction(serializerService.serialize(queue[i]), queue[i]);
                            if (retval && typeof retval === "object") {
                                queue[i] = retval;
                            } else {
                                queue.splice(i, 1);
                                i -= 1;
                                len = queue.length;
                            }
                        }
                    }
                }
                return queue;
            },

            _hasSameOrigin: function (iframe) {
                var hasSameOrigin = false;

                try {
                    hasSameOrigin = iframe.document.location.host === document.location.host && iframe.document.location.protocol === document.location.protocol;

                    //in case that host domain does not match, check if document.domain matches or not
                    //e.g. a page loads an iframe page with sub-domain address
                    if (!hasSameOrigin) {
                        hasSameOrigin = iframe.document.domain === document.domain;
                    }

                    return hasSameOrigin;
                } catch (e) {
                    // to be ignored. Error when iframe from different domain
                    //TODO add debug log
                }
                return false;
            },

            /**
             * Core function which is invoked by the queue service to allow
             * for the addRequestHeaders callback (if registered) to be invoked.
             * (see registerBridgeCallbacks)
             * @returns {array} The array of request headers to be set. Each
             *                  object is of the format:
             *                  {
             *                      name: "header name",
             *                      value: "header value",
             *                      recurring: true
             *                  }
             */
            provideRequestHeaders: function () {
                var headers = null,
                    addHeadersCB = bridgeCallbacks.addRequestHeaders;

                if (addHeadersCB && addHeadersCB.enabled) {
                    headers = addHeadersCB.cbFunction();
                }

                return headers;
            },

            /**
             * Utility function used by core._updateModules.
             * It registers event listeners according to module configuration.
             * @name core._registerModuleEvents
             * @function
             * @param {string} moduleName name of the module
             * @param {Array} moduleEvents an array of all module-specific events (from UIC configuration)
             * @param {object} scope DOM element where event will be registered; points either to a main window
             *                 object or to IFrame's content window
             */
            _registerModuleEvents: (function () {

                /**
                 * An instance of TLT.utils.WeakMap us as a cache for mapping DOM elements with their IDs.
                 * Introduced to reduce number of expensive browserBase.ElementData.prototype.examineID calls.
                 * Object initialization in _registerModuleEvents function
                 * @private
                 * @type {object}
                 */
                var idCache,
                    /**
                     * Tracks the pending frame loads in order to trigger the loadWithFrames event.
                     */
                    frameLoadPending = 0,
                    /**
                     * Helper function that returns the localTop or documentScope object if the
                     * specified prop is "window" or "document" respectively.
                     * @private
                     * @function
                     * @param {string|object} prop
                     * @param {object} localTop
                     * @param {object} documentScope
                     * @returns {string|object} localTop if prop value is "window",
                     *                          documentScope if prop value is "document" else
                     *                          returns the prop value itself
                     */
                    normalizeToObject = function (prop, localTop, documentScope) {
                        if (prop === "window") {
                            return localTop;
                        }
                        if (prop === "document") {
                            return documentScope;
                        }
                        return prop;
                    };

                /**
                 * Helper function for core._registerModuleEvents
                 * It does actual event listeners registration, while the main function manages the scopes.
                 * @function
                 * @private
                 */
                function _registerModuleEventsOnScope(moduleName, moduleEvents, scope) {
                    var documentScope = utils.getDocument(scope),
                        localTop = core._getLocalTop(),
                        isFrame = utils.isIFrameDescendant(scope),
                        frameId,
                        e,
                        i;

                    scope = scope || documentScope;
                    loadUnloadHandler.normalizeModuleEvents(moduleName, moduleEvents, localTop, documentScope);

                    if (isFrame) {
                        frameId = browserBaseService.ElementData.prototype.examineID(scope).id;
                        // remove one closing ']'
                        if (typeof frameId === "string") {
                            frameId = frameId.slice(0, frameId.length - 1);
                            for (e in events) {
                                if (events.hasOwnProperty(e)) {
                                    for (i = 0; i < events[e].length; i += 1) {
                                        if (moduleName === events[e][i]) {
                                            if (e.indexOf(frameId) !== -1) {
                                                delete events[e];
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    utils.forEach(moduleEvents, function (eventConfig) {
                        var target = normalizeToObject(eventConfig.target, localTop, documentScope) || documentScope,
                            token = "";

                        if (eventConfig.recurseFrames !== true && isFrame) {
                            return;
                        }

                        // If the target is a string it is a CSS query selector, specified in the config.
                        if (typeof target === "string") {
                            utils.forEach(browserService.queryAll(target, scope), function (element) {
                                var idData = idCache.get(element);
                                if (!idData) {
                                    idData = browserBaseService.ElementData.prototype.examineID(element);
                                    idCache.set(element, idData);
                                }
                                token = eventConfig.name + "|" + idData.id + idData.idType;
                                // If the token already exists, do nothing
                                if (utils.indexOf(events[token], moduleName) !== -1) {
                                    return;
                                }
                                events[token] = events[token] || [];
                                events[token].push(moduleName);
                                // Save a reference to the tokens target to be able to unregister it later.
                                events[token].target = element;
                                browserService.subscribe(eventConfig.name, element, core._publishEvent);
                            });
                        // Else: The target, specified in the config, is an object or empty
                        // (defaults to document), generate a token for events which bubble up
                        // (to the window or document object).
                        } else {
                            token = core._buildToken4bubbleTarget(eventConfig.name, target, typeof eventConfig.target === "undefined");
                            if (!events.hasOwnProperty(token)) {
                                events[token] = [moduleName];
                                browserService.subscribe(eventConfig.name, target, core._publishEvent);
                            } else {
                                /* XXX: Only add if module entry doesn't exist. */
                                if (utils.indexOf(events[token], moduleName) === -1) {
                                    events[token].push(moduleName);
                                }
                            }
                        }

                        if (token !== "") {
                            if (typeof target !== "string") {
                                events[token].target = target;
                            }
                        }
                    });
                }

                /**
                 * Helper function for core._registerModuleEvents. Checks load status of iframes.
                 * @function
                 * @private
                 * @returns {boolean} true when given frame is completely loaded; false otherwise
                 */
                function _isFrameLoaded(hIFrame) {
                    var iFrameWindow = utils.getIFrameWindow(hIFrame);
                    return (iFrameWindow !== null) &&
                            core._hasSameOrigin(iFrameWindow) &&
                            (iFrameWindow.document !== null) &&
                            iFrameWindow.document.readyState === "complete" &&
                            iFrameWindow.document.body.innerHTML !== "";
                }

                // actual implementation of core._registerModuleEvents
                function registerModuleEvents(moduleName, moduleEvents, scope) {
                    scope = scope || core._getLocalTop().document;
                    idCache = idCache || new utils.WeakMap();

                    _registerModuleEventsOnScope(moduleName, moduleEvents, scope);
                    if (moduleName !== "performance") {
                        var hIFrame = null,
                            hIFrameWindow = null,
                            cIFrames = browserService.queryAll("iframe, frame", scope),
                            i,
                            iLength;

                        for (i = 0, iLength = cIFrames.length; i < iLength; i += 1) {
                            hIFrame = cIFrames[i];
                            if (isFrameBlacklisted(hIFrame)) {
                                continue;
                            }
                            if (_isFrameLoaded(hIFrame)) {
                                hIFrameWindow = utils.getIFrameWindow(hIFrame);
                                core._registerModuleEvents(moduleName, moduleEvents, hIFrameWindow.document);
                                // Notify the domCapture service to observe this frame window
                                domCaptureService.observeWindow(hIFrameWindow);
                                continue;
                            }

                            // Frame is not loaded
                            frameLoadPending += 1;

                            (function (_moduleName, _moduleEvents, _hIFrame) {
                                var _hIFrameWindow = null,
                                    _iframeContext = {
                                        moduleName: _moduleName,
                                        moduleEvents: _moduleEvents,
                                        hIFrame: _hIFrame,

                                        _registerModuleEventsDelayed: function () {
                                            var __hIFrameWindow = null;

                                            if (!isFrameBlacklisted(_hIFrame)) {
                                                __hIFrameWindow = utils.getIFrameWindow(_hIFrame);
                                                if (core._hasSameOrigin(__hIFrameWindow)) {
                                                    core._registerModuleEvents(_moduleName, _moduleEvents, __hIFrameWindow.document);
                                                    // Notify the domCapture service to observe this frame window
                                                    domCaptureService.observeWindow(__hIFrameWindow);
                                                }
                                            }
                                            frameLoadPending -= 1;
                                            if (!frameLoadPending) {
                                                // Trigger the loadWithFrames event
                                                core._publishEvent({
                                                    type: "loadWithFrames",
                                                    custom: true
                                                });
                                            }
                                        }
                                    };

                                utils.addEventListener(_hIFrame, "load", function () {
                                    _iframeContext._registerModuleEventsDelayed();
                                });

                                if (utils.isLegacyIE && _isFrameLoaded(_hIFrame)) {
                                    _hIFrameWindow = utils.getIFrameWindow(_hIFrame);
                                    utils.addEventListener(_hIFrameWindow.document, "readystatechange", function () {
                                        _iframeContext._registerModuleEventsDelayed();
                                    });
                                }

                            }(moduleName, moduleEvents, hIFrame));
                        }
                    }
                }

                registerModuleEvents.clearCache = function () {
                    if (idCache) {
                        idCache.clear();
                        idCache = null;
                    }
                };

                return registerModuleEvents;
            }()), // end of _registerModuleEvents factory


            /**
             * Build the token for an event using the currentTarget of the event
             * (only if the current browser supports currenTarget) Otherwise uses
             * the event.target
             * @param  {Object} event The WebEvent
             * @return {String}       Returns the token as a string, consist of:
             *         eventType | target id target idtype
             */
            _buildToken4currentTarget: function (event) {
                var target = event.nativeEvent ? event.nativeEvent.currentTarget : null,
                    idData = target ? browserBaseService.ElementData.prototype.examineID(target) :
                            {
                                id: event.target ? event.target.id : null,
                                idType: event.target ? event.target.idType : -1
                            };
                return event.type + "|" + idData.id + idData.idType;
            },

            /**
             * Build the token for delegate targets
             * @param  {String} eventType The event.type property of the WebEvent
             * @param  {Object} target    The target or currentTarget of the event.
             * @param  {Object} delegateTarget    The delegated target of the event.
             * @return {String}           Returns the token as a string, consist of:
             *            eventType | target | delegateTarget
             */
            _buildToken4delegateTarget: function (eventType, target, delegateTarget) {
                return eventType + "|" + target + "|" + delegateTarget;
            },

            /**
             * Build the token for bubble targets (either window or document)
             * @param  {String} eventType The event.type property of the WebEvent
             * @param  {Object} target    The target or currentTarget of the event.
             * @param  {Object} delegateTarget    The delegated target of the event.
             * @return {String}           Returns the token as a string, consist of:
             *            eventType | null-2 | window or document
             */
            _buildToken4bubbleTarget: function (eventType, target, checkIframe, delegateTarget) {
                var localTop = core._getLocalTop(),
                    localWindow,
                    _getIframeElement = function (_documentScope) {
                        var _retVal = null;

                        if (core._hasSameOrigin(localWindow.parent)) {
                            utils.forEach(browserService.queryAll("iframe, frame", localWindow.parent.document), function (iframe) {
                                var iFrameWindow = null;

                                if (!isFrameBlacklisted(iframe)) {
                                    iFrameWindow = utils.getIFrameWindow(iframe);
                                    if (core._hasSameOrigin(iFrameWindow) && iFrameWindow.document === _documentScope) {
                                        _retVal = iframe;
                                    }
                                }
                            });
                        }
                        return _retVal;
                    },
                    documentScope = utils.getDocument(target),
                    iframeElement = null,
                    tmpTarget,
                    retVal = eventType;

                if (documentScope) {
                    localWindow = documentScope.defaultView || documentScope.parentWindow;
                }

                if (target === window || target === window.window) {
                    retVal += "|null-2|window";
                } else {
                    if (checkIframe && localWindow && core._hasSameOrigin(localWindow.parent) && typeof documentScope !== "undefined" && localTop.document !== documentScope) {
                        iframeElement = _getIframeElement(documentScope);
                        if (iframeElement) {
                            tmpTarget = browserBaseService.ElementData.prototype.examineID(iframeElement);
                            retVal += "|" + tmpTarget.xPath + "-2";
                        }
                    } else {
                        retVal += "|null-2|document";
                    }
                }

                return retVal;
            },

            /**
             * Event handler for when configuration gets updated.
             * @returns {void}
             * @private
             */
            _reinitConfig: function () {

                // NOTE: Don't use "this" in this method, only use "core" to preserve context.
                core._updateModules();
            },

            /**
             * Iterates over each module delivers the event object if the module
             * is interested in that event.
             * @param {Event} event An event object published by the browser service.
             * @returns {void}
             * @private
             */
            _publishEvent: function (event) {

                // NOTE: Don't use "this" in this method, only use "core" to preserve context.

                var moduleName = null,
                    module = null,
                    // generate the explicit token for the element which received the event
                    // if event is delegated it will have event.data set to the token
                    token = (event.delegateTarget && event.data) ? event.data : core._buildToken4currentTarget(event),
                    _modules = null,
                    i,
                    len,
                    target,
                    modEvent = null,
                    canIgnore = false,
                    canPublish = false,
                    delegateTarget = event.delegateTarget || null,
                    screenviewAutoDetect,
                    clickedEl;

                // Set the current WebEvent being handled in _publishEvent
                currentWebEvent = event;

                // Only click, change, mouse* and touch* events reset the inactivity timer.
                if (event.type.match(/^(click|change|blur|mouse|touch)/)) {
                    resetInactivityTimer();
                    queueService.resetFlushTimer();
                }

                screenviewAutoDetect = utils.getValue(coreConfig, "screenviewAutoDetect", true);
                if (screenviewAutoDetect) {
                    // auto detect screenview changes on each event handling cycle
                    detectScreenviewChange();
                }

                // ignore native browser 'load' events
                if ((event.type === "load" || event.type === "pageshow") && !event.nativeEvent.customLoad) {
                    currentWebEvent = {};
                    return;
                }

                // ignore 'beforeunload' fired by link placed in blacklist of excluded links
                if (event.type === "click") {
                    lastClickedElement = event.target.element;
                }
                if (event.type === "beforeunload") {
                    canIgnore = false;

                    // Chrome, FF, IE has anchor element on document.activeElement
                    // Safari has anchor element on lastClickedElement
                    clickedEl = (utils.getTagName(lastClickedElement) === "a") ? lastClickedElement : document.activeElement;

                    if (clickedEl) {
                        if (hasExcludedProtocol(clickedEl)) {
                            canIgnore = true;
                        } else {
                            utils.forEach(coreConfig.ieExcludedLinks, function (selector) {
                                var j,
                                    elLen,
                                    el = browserService.queryAll(selector);

                                for (j = 0, elLen = el ? el.length : 0; j < elLen; j += 1) {
                                    if (el[j] && el[j] === lastClickedElement) {
                                        // Last clicked element was in the blacklist. Set the ignore flag.
                                        canIgnore = true;
                                        break;
                                    }
                                }
                            });
                        }
                    }
                    if (canIgnore) {
                        // The beforeunload can be ignored.
                        currentWebEvent = {};
                        return;
                    }
                }

                // if an unload event is triggered update the core's internal state to "unloading"
                if (loadUnloadHandler.isUnload(event)) {
                    state = "unloading";
                }

                // ignore native browser 'change' events on IE<9/W3C for radio buttons and checkboxes
                if (event.type === "change" && utils.isLegacyIE && core.getFlavor() === "w3c" &&
                        (event.target.element.type === "checkbox" || event.target.element.type === "radio")) {
                    currentWebEvent = {};
                    return;
                }

                // use 'propertychange' event in IE<9 to simulate 'change' event on radio and checkbox
                if (event.type === "propertychange") {
                    if (event.nativeEvent.propertyName === "checked" && (event.target.element.type === "checkbox" || (event.target.element.type === "radio" && event.target.element.checked))) {
                        event.type = "change";
                        event.target.type = "INPUT";
                    } else {
                        currentWebEvent = {};
                        return;
                    }
                }

                // Is the target element in the blocked list?
                if (event.target && isElementBlocked(event.target.element)) {
                    currentWebEvent = {};
                    return;
                }

                // No module has registered the event for the currentTarget,
                // build token for bubble target (document or window)
                if (!events.hasOwnProperty(token)) {
                    if (event.hasOwnProperty("nativeEvent")) {
                        target = event.nativeEvent.currentTarget || event.nativeEvent.target;
                    }
                    token = core._buildToken4bubbleTarget(event.type, target, true, delegateTarget);
                }

                if (events.hasOwnProperty(token)) {
                    _modules = events[token];
                    for (i = 0, len = _modules.length; i < len; i += 1) {
                        moduleName = _modules[i];
                        module = core.getModule(moduleName);
                        modEvent = utils.mixin({}, event);
                        if (module && core.isStarted(moduleName) && typeof module.onevent === "function") {
                            canPublish = loadUnloadHandler.canPublish(moduleName, modEvent);
                            if (canPublish) {
                                try {
                                    module.onevent(modEvent);
                                } catch (e) {
                                }
                            }
                        }
                    }
                }

                if (modEvent && modEvent.type === "unload" && canPublish) {
                    core.destroy(false, modEvent.type);
                }

                currentWebEvent = {};
            },

            _getLocalTop: function () {
                // Return window.window instead of window due to an IE quirk where (window == top) is true but (window === top) is false
                // In such cases, (window.window == top) is true and so is (window.window === top)  Hence window.window is more reliable
                // to compare to see if the library is included in the top window.
                return window.window;
            },

            //---------------------------------------------------------------------
            // Module Registration and Lifecycle
            //---------------------------------------------------------------------

            /**
             * Registers a module creator with TLT.
             * @param {String} moduleName The name of the module that is created using
             *      the creator.
             * @param {Function} creator The function to call to create the module.
             * @returns {void}
             */
            addModule: function (moduleName, creator) {

                modules[moduleName] = {
                    creator: creator,
                    instance: null,
                    context: null,
                    messages: []
                };

                // If the core is initialized, then this module has been dynamically loaded. Start it.
                if (this.isInitialized()) {
                    this.start(moduleName);
                }
            },

            /**
             * Returns the module instance of the given module.
             * @param {String} moduleName The name of the module to retrieve.
             * @returns {Object} The module instance if it exists, null otherwise.
             */
            getModule: function (moduleName) {
                if (modules[moduleName] && modules[moduleName].instance) {
                    return modules[moduleName].instance;
                }
                return null;
            },


            /**
             * Unregisters a module and stops and destroys its instance.
             * @param {String} moduleName The name of the module to remove.
             * @returns {void}
             */
            removeModule: function (moduleName) {

                this.stop(moduleName);
                delete modules[moduleName];
            },

            /**
             * Determines if a module is started by looking for the instance.
             * @param {String} moduleName The name of the module to check.
             * @returns {void}
             */
            isStarted: function (moduleName) {
                return modules.hasOwnProperty(moduleName) && modules[moduleName].instance !== null;
            },

            /**
             * Creates a new module instance and calls it's init() method.
             * @param {String} moduleName The name of the module to start.
             * @returns {void}
             */
            start: function (moduleName) {

                var moduleData = modules[moduleName],
                    instance = null;


                // Only continue if the module data exists and there's not already an instance
                if (moduleData && moduleData.instance === null) {

                    // create the context and instance
                    moduleData.context = new TLT.ModuleContext(moduleName, this);
                    instance = moduleData.instance = moduleData.creator(moduleData.context);

                    // allow module to initialize itself
                    if (typeof instance.init === "function") {
                        instance.init();
                    }

                }
            },

            /**
             * Starts all registered modules, creating an instance and calling their
             * init() methods.
             * @returns {void}
             */
            startAll: function () {

                var moduleName = null;

                for (moduleName in modules) {
                    if (modules.hasOwnProperty(moduleName)) {
                        this.start(moduleName);
                    }
                }
            },

            /**
             * Stops a module, calls it's destroy() method, and deletes the instance.
             * @param {String} moduleName The name of the module to stop.
             * @returns {void}
             */
            stop: function (moduleName) {

                var moduleData = modules[moduleName],
                    instance = null;

                // Only continue if the module instance exists
                if (moduleData && moduleData.instance !== null) {

                    instance = moduleData.instance;

                    // allow module to clean up after itself
                    if (typeof instance.destroy === "function") {
                        instance.destroy();
                    }

                    moduleData.instance = moduleData.context = null;

                }
            },

            /**
             * Stops all registered modules, calling their destroy() methods,
             * and removing their instances.
             * @returns {void}
             */
            stopAll: function () {

                var moduleName = null;

                for (moduleName in modules) {
                    if (modules.hasOwnProperty(moduleName)) {
                        this.stop(moduleName);
                    }
                }
            },

            //---------------------------------------------------------------------
            // Service Registration and Lifecycle
            //---------------------------------------------------------------------

            /**
             * Registers a service creator with TLT.
             * @param {String} serviceName The name of the service that is created using
             *      the creator.
             * @param {Function} creator The function to call to create the service.
             * @returns {void}
             */
            addService: function (serviceName, creator) {


                services[serviceName] = {
                    creator: creator,
                    instance: null
                };
            },

            /**
             * Retrieves a service instance, creating it if one doesn't already exist.
             * @param {String} serviceName The name of the service to retrieve.
             * @returns {Object} The service object as returned from the service
             * creator or null if the service doesn't exist.
             */
            getService: function (serviceName) {
                if (services.hasOwnProperty(serviceName)) {
                    if (!services[serviceName].instance) {
                        // If you want to have a separate ServiceContext, pass it here instead of "this"
                        try {
                            services[serviceName].instance = services[serviceName].creator(this);
                            if (typeof services[serviceName].instance.init === "function") {
                                services[serviceName].instance.init();
                            }
                        } catch (e) {
                            // shut the library down if a service cannot be instanciated
                            utils.clog("UIC terminated due to error when instanciating the " + serviceName + " service.");
                            throw new Error(e);
                        }
                        if (typeof services[serviceName].instance.getServiceName !== "function") {
                            services[serviceName].instance.getServiceName = function () {
                                return serviceName;
                            };
                        }
                    }
                    return services[serviceName].instance;
                }
                return null;
            },

            /**
             * Unregisters a service and destroys its instance.
             * @param {String} serviceName The name of the service to remove.
             * @returns {void}
             */
            removeService: function (serviceName) {
                delete services[serviceName];
            },

            //---------------------------------------------------------------------
            // Intermodule Communication
            //---------------------------------------------------------------------

            /**
             * Broadcasts a message throughout the system to all modules who are
             * interested.
             * @param {Object} message An object containing at least a type property
             *      indicating the message type.
             * @returns {void}
             */
            broadcast: function (message) {
                var prop,
                    module;

                if (message && typeof message === "object") {


                    for (prop in modules) {
                        if (modules.hasOwnProperty(prop)) {
                            module = modules[prop];

                            if (utils.indexOf(module.messages, message.type) > -1) {
                                if (typeof module.instance.onmessage === "function") {
                                    module.instance.onmessage(message);
                                }
                            }
                        }
                    }
                }
            },

            /**
             * Instructs a module to listen for a particular type of message.
             * @param {String} moduleName The module that's interested in the message.
             * @param {String} messageType The type of message to listen for.
             * @returns {void}
             */
            listen: function (moduleName, messageType) {
                var module = null;

                if (this.isStarted(moduleName)) {
                    module = modules[moduleName];

                    if (utils.indexOf(module.messages, messageType) === -1) {
                        module.messages.push(messageType);
                    }
                }
            },
            /**
             * Stops UIC and throws an error.
             * @function
             * @throws {UICError}
             */
            fail: function (message, failcode, skipEvents) {
                message = "UIC FAILED. " + message;
                try {
                    core.destroy(!!skipEvents, message);
                } catch (e) {
                    utils.clog(message);
                }
                throw new core.UICError(message, failcode);
            },

            /**
             * @constructor
             */
            UICError: (function () {
                function UICError(message, errorCode) {
                    this.message = message;
                    this.code = errorCode;
                }
                UICError.prototype = new Error();
                UICError.prototype.name = "UICError";
                UICError.prototype.constructor = UICError;
                return UICError;
            }()),


            /**
             * Return the name of UIC flavor ("w3c")
             * @function
             * @deprecated
             */
            getFlavor: function () {
                return "w3c";
            },

            /**
             * Determines if a url is cross-origin
             * @param {String} url The URL that needs to be checked.
             * @param {String} [origin] Optional origin against which to perform the check. If not specified, defaults to window.location.origin
             * @returns {boolean} true if the url is cross-origin.
             */
            isCrossOrigin: function (url, origin) {
                var isCrossOrigin = false,
                    protocolIndex,
                    urlSlashSlash;

                origin = origin || window.location.origin;

                // Sanity check
                if (!url || !origin) {
                    return isCrossOrigin;
                }

                // URL starts with "//" e.g. "//collector.cloud.com/collector/collectorPost"
                urlSlashSlash = url.match(/^\/\//);

                if (url.match(/^\//) && !urlSlashSlash) {
                    // URL starts with "/" and therefore is a relative path i.e. same-origin
                    isCrossOrigin = false;
                } else if (urlSlashSlash || url.indexOf("://") !== -1) {
                    // URL starts with "//" or has a protocol e.g. file://... http://... etc
                    if (urlSlashSlash) {
                        // If URL starts with "//", compare with origin after removing the protocol from the origin
                        protocolIndex = origin.indexOf("://");
                        if (protocolIndex !== -1) {
                            // Remove protocol from the origin (including the ":")
                            origin = origin.substring(protocolIndex + 1);
                        }
                    }

                    if (url.length < origin.length) {
                        isCrossOrigin = true;
                    } else {
                        // Check if the URL starts with the same origin prefix
                        isCrossOrigin = (origin !== url.substring(0, origin.length)) || (url.length > origin.length && url.charAt(origin.length) !== '/');
                    }
                } else {
                    // URL does not begin with "//" nor does it have any protocol, therefore it is a relative url.
                    isCrossOrigin = false;
                }

                return isCrossOrigin;
            }
        };  // End of "core"


    /**
     * Inactivity timeout implementation.
     * We perform a one time initialization to setup the timeout value from the configuration and
     * define the callback function. The resetInactivityTimer() function is then re-written.
     */
    resetInactivityTimer = function () {
        // One time initialization
        var inactivityTimerId = null,
            // If no inactivityTimeout is configured, the built-in default is 10 minutes (600000 milliseconds)
            inactivityTimeout = utils.getValue(coreConfig, "inactivityTimeout", 600000);

        if (!inactivityTimeout) {
            // An inactivityTimeout value of 0 disables this feature.
            resetInactivityTimer = function () {};
            return;
        }

        /**
         * Inactivity timeout handler function. When the timer expires,
         * log a message on the console indicating the timeout and shutdown.
         * @private
         */
        function inactivityTimeoutHandler() {
            core.destroy(false, "inactivity");
        }

        /**
         * Actual implementation of resetInactivityTimer
         */
        resetInactivityTimer = function () {
            // Clear the pending inactivity timer (if any)
            if (inactivityTimerId) {
                clearTimeout(inactivityTimerId);
                inactivityTimerId = null;
            }

            inactivityTimerId = setTimeout(inactivityTimeoutHandler, inactivityTimeout);
        };

        resetInactivityTimer();
    };

    /**
     * Parse and return the session id value from localStorage.
     * @function
     * @private
     * @param {String} sidKey The session id key.
     * @return {String}|undefined Returns the session id value if found, else returns undefined.
     */
    function getSIDFromStorage(sidKey) {
        var expires,
            items,
            itemVal,
            sidValue;

        // Sanity check
        if (!localStorage || !sidKey) {
            return;
        }

        itemVal = localStorage.getItem(sidKey);
        if (itemVal) {
            items = itemVal.split("|");
            expires = parseInt(items[0], 10);
            if (Date.now() > expires) {
                localStorage.removeItem(sidKey);
            } else {
                sidValue = items[1];
            }
        }

        return sidValue;
    }

    /**
     * Actual init function called from TLT.init when the DOM is ready.
     * @private
     * @see TLT.init
     */
    _init = function (config, callback) {
        var cookieModuleConfig,
            queueServiceConfig,
            queues,
            sessionCookieName,
            sessionCookieValue,
            endpointURL,
            killswitchURL,
            pageURL = null,
            i,
            blockedUA,
            eventName,
            eventTarget,
            screenviewLoadHandler;

        // Sanity check
        if (initialized) {
            return;
        }

        // Do not initialize if replay is enabled.
        if (TLT && TLT.replay) {
            return;
        }

        configService = core.getService("config");
        configService.updateConfig(config);
        coreConfig = configService.getCoreConfig();

        // Check for any bot match
        blockedUA = getBlockedUA(coreConfig.blockedUserAgents, navigator.userAgent);
        if (blockedUA) {
            TLT.terminationReason = "blockedUA: " + blockedUA;
            return;
        }

        // Setup cached service references
        ajaxService = core.getService("ajax");
        utils.browserBaseService = browserBaseService = core.getService("browserBase");
        utils.browserService = browserService = core.getService("browser");
        domCaptureService = core.getService("domCapture");
        queueService = core.getService("queue");
        serializerService = core.getService("serializer");

        cookieModuleConfig = configService.getModuleConfig("TLCookie") || {};
        sessionCookieName = cookieModuleConfig.sessionizationCookieName || "TLTSID";
        // Check if TLTSID cookie value is "DND" indicating kill switch is enabled.
        sessionCookieValue = utils.getCookieValue("TLTSID");
        if (sessionCookieValue === "DND") {
            if (state !== "destroyed") {
                core.destroy(false, "killswitch");
            }
            return;
        }
        sessionCookieValue = utils.getCookieValue(sessionCookieName) || getSIDFromStorage(sessionCookieName);
        if (!sessionCookieValue) {
            sessionCookieName = cookieModuleConfig.wcxCookieName || "WCXSID";
            sessionCookieValue = utils.getCookieValue(sessionCookieName);
        }

        // Enable modules
        if (!core._updateModules()) {
            if (state !== "destroyed") {
                core.destroy(false, "modules init");
            }
            return;
        }

        // Set global
        dataLayerModule = core.getModule("dataLayer");

        if (configService.subscribe) {
            configService.subscribe("configupdated", core._reinitConfig);
        }

        initialized = true;
        state = "loaded";

        // Invoke the Overstat Snapshot Extension callback (if any)
        try {
            if (typeof TLFExtensionNotify === "function") {
                TLFExtensionNotify("Initialized");
            }
        } catch (e1) {
        }

        queueServiceConfig = core.getServiceConfig("queue");
        queues = queueServiceConfig.queues || [];

        if (utils.isLegacyIE || utils.isIE9) {
            pageURL = utils.getOriginAndPath().origin;
        }
        for (i = 0; i < queues.length; i += 1) {
            if (pageURL && core.isCrossOrigin(queues[i].endpoint, pageURL)) {
                core.setAutoFlush(false);
                core.destroy(false, "CORS not supported");
                return;
            }
            // Killswitch check only if session is being newly created. i.e. no prior sessionCookieValue
            // TODO: UIC could be configured to use storage for session value
            if (!sessionCookieValue && cookieModuleConfig.tlAppKey) {
                endpointURL = queues[i].endpoint;
                killswitchURL = queues[i].killswitchURL || (endpointURL.match("collectorPost") ?
                        endpointURL.replace("collectorPost", "switch/" + cookieModuleConfig.tlAppKey) : null);
                if (killswitchURL) {
                    ajaxService.sendRequest({
                        type: "GET",
                        url: killswitchURL,
                        async: true,
                        timeout: 5000,
                        oncomplete: function (result) {
                            if (result.responseText === "0" || result.data === 0) {
                                core.setAutoFlush(false);
                                utils.setCookie("TLTSID", "DND");
                                core.destroy(false, "killswitch");
                            }
                        }
                    });
                }
            }
            // Endpoint check if sync on unload is enabled.
            if (queues[i].checkEndpoint && !queueServiceConfig.asyncReqOnUnload) {
                queueServiceConfig.asyncReqOnUnload = true;

                ajaxService.sendRequest({
                    oncomplete: function (result) {
                        if (result.success) {
                            // Switch to asyncReqOnUnload setting specified in the configuration
                            queueServiceConfig.asyncReqOnUnload = false;
                        }
                    },
                    timeout: queues[i].endpointCheckTimeout || 3000,
                    url: queues[i].endpoint,
                    headers: {
                        "X-PageId": tltPageId,
                        "X-Tealeaf-SaaS-AppKey": cookieModuleConfig.tlAppKey,
                        "X-Tealeaf-EndpointCheck": true
                    },
                    async: true,
                    error: function (result) {
                        if (result.success) {
                            return;
                        }
                        // Help the queue service remember if the endpoint check has failed.
                        queueServiceConfig.endpointCheckFailed = true;
                    }
                });
            }
        }

        screenviewLoadHandler = function (e) {
            var event, webEvent;

            event = {
                type: 'load',
                target: window.window,
                srcElement: window.window,
                currentTarget: window.window,
                bubbles: true,
                cancelBubble: false,
                cancelable: true,
                timeStamp: +new Date(),
                customLoad: true
            };

            webEvent = new browserBaseService.WebEvent(event);
            core._publishEvent(webEvent);

            if (e) {
                browserService.unsubscribe(eventName, eventTarget, screenviewLoadHandler);
            }
        };

        //generate fake load event to send for modules
        if (coreConfig.screenviewLoadEvent) {
            eventName = coreConfig.screenviewLoadEvent.name;
            eventTarget = coreConfig.screenviewLoadEvent.target || window;
            browserService.subscribe(eventName, eventTarget, screenviewLoadHandler);
        } else {
            screenviewLoadHandler();
        }

        // Set state and inactivity timer on successful initialization
        if (core.isInitialized()) {
            state = "initialized";
            resetInactivityTimer();

            // Setup a one-time handler for mousemove detection
            mousemoveDetectHandler = function (e) {
                if (e.type === "mousemove") {
                    mousemoveDetected = true;
                }
                browserService.unsubscribe("mousemove", document, mousemoveDetectHandler);
                mousemoveDetectHandler = null;
            };
            browserService.subscribe("mousemove", document, mousemoveDetectHandler, { once: true });
        }

        // Notify callback function if any...
        if (typeof _callback === "function") {
            // Protect against unexpected exceptions since _callback is 3rd party code.
            try {
                _callback(state);
            } catch (e2) {
                utils.clog("Error in callback.", e2);
            }
        }
    };

    // Add methods that passthrough to services
    (function () {

        var name = null,
            i,
            len;

        for (name in servicePassthroughs) {
            if (servicePassthroughs.hasOwnProperty(name)) {
                for (i = 0, len = servicePassthroughs[name].length; i < len; i += 1) {
                    (function (serviceName, methodName) {
                        core[methodName] = function () {
                            var service = this.getService(serviceName);
                            if (service) {
                                return service[methodName].apply(service, arguments);
                            }
                        };
                    }(name, servicePassthroughs[name][i]));

                }
            }
        }

    }());

    return core;
}());


/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview Defines utility functions available to all modules via context object or as TLT.utils
 * @exports TLT.utils
 */

/*global TLT, window, URLSearchParams*/
/*jshint loopfunc:true*/

(function () {

    "use strict";

    var ua = window.navigator.userAgent.toLowerCase(),

        // IE user-agent strings contain "MSIE" and/or "Trident" (code name for IE's rendering engine)
        _isIE = (ua.indexOf("msie") !== -1 || ua.indexOf("trident") !== -1),

        _isLegacyIE = (function () {
            // W3 Navigation timing spec. supported from IE 9 onwards.
            var isNavTimingSupported = !!window.performance;
            return (_isIE && (!isNavTimingSupported || document.documentMode < 9));
        }()),

        _isIE9 = (function () {
            return (_isIE && document.documentMode === 9);
        }()),

        _isAndroid = (ua.indexOf("android") !== -1),

        _isiOS = /(ipad|iphone|ipod)/.test(ua),

        _isOperaMini = (ua.indexOf("opera mini") !== -1),

        _isSafari = (ua.indexOf("chrome") === -1) && (ua.indexOf("safari") !== -1),

        tltUniqueIndex = 1,

        tlTypes = {
            // Keep these sorted for readability.
            "a:": "link",
            "button:button": "button",
            "button:submit": "button",
            "input:button": "button",
            "input:checkbox": "checkBox",
            "input:color": "colorPicker",
            "input:date": "datePicker",
            "input:datetime": "datetimePicker",
            "input:datetime-local": "datetime-local",
            "input:email": "emailInput",
            "input:file": "fileInput",
            "input:image": "button",
            "input:month": "month",
            "input:number": "numberPicker",
            "input:password": "textBox",
            "input:radio": "radioButton",
            "input:range": "slider",
            "input:reset": "button",
            "input:search": "searchBox",
            "input:submit": "button",
            "input:tel": "tel",
            "input:text": "textBox",
            "input:time": "timePicker",
            "input:url": "urlBox",
            "input:week": "week",
            "select:": "selectList",
            "select:select-one": "selectList",
            "textarea:": "textBox",
            "textarea:textarea": "textBox"
        },

        utils = {
            /**
             * Indicates if browser is IE.
             */
            isIE: _isIE,

            /**
             * Indicates if browser is IE<9 or IE 9+ running in
             * compatibility mode.
             */
            isLegacyIE: _isLegacyIE,

            /**
             * Indicates if browser is IE 9.
             */
            isIE9: _isIE9,

            /**
             * Indicates if the browser is based on an Android platform device.
             */
            isAndroid: _isAndroid,

            /**
             * Indicates if the device considers zero degrees to be landscape and 90 degrees to be portrait
             */
            isLandscapeZeroDegrees: false,

            /**
             * Indicates if the browser is based on an iOS platform device.
             */
            isiOS: _isiOS,

            /**
             * Indicates if the browser is Opera Mini.
             */
            isOperaMini: _isOperaMini,

            /**
             * Indicates if the browser is Safari.
             */
            isSafari: _isSafari,

            /**
             * Checks whether given parameter is null or undefined
             * @param {*} obj Any value
             * @returns {boolean} True if obj is null or undefined; false otherwise
             */
            isUndefOrNull: function (obj) {
                return typeof obj === "undefined" || obj === null;
            },

            /**
             * Checks if the given parameter is an Array.
             * @param {*} obj Any value
             * @returns {boolean} True if obj is an Array; false otherwise.
             */
            isArray: function (obj) {
                return !!(obj && Object.prototype.toString.call(obj) === "[object Array]");
            },

            /**
             * Returns a unique serial number
             * @returns {int} A number that can be used as a unique identifier.
             */
            getSerialNumber: function () {
                var id;

                id = tltUniqueIndex;
                tltUniqueIndex += 1;

                return id;
            },

            /**
             * Generates a random string of specified length and comprised of
             * characters from the specified data set or any alphanumeric.
             * @param {integer} length The required length of the random string.
             * @param {string}  [dataSet] Optional string specifying the set of characters
             *                  to be used for generating the random string.
             * @returns {String} A randomly generated string of specified length.
             */
            getRandomString: function (length, dataSet) {
                var i,
                    dataSetLength,
                    defaultDataSet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
                    randomString = "";

                // Sanity check
                if (!length) {
                    return randomString;
                }

                if (typeof dataSet !== "string") {
                    dataSet = defaultDataSet;
                }

                for (i = 0, dataSetLength = dataSet.length; i < length; i += 1) {
                    // AppScan: IGNORE (false flag) - Math.random is not used in a cryptographical context.
                    randomString += dataSet.charAt(Math.floor(Math.random() * dataSetLength));
                }

                return randomString;
            },

            /**
             * Used to test and get value from an object.
             * @private
             * @function
             * @name core.utils.getValue
             * @param {object} parentObj An object you want to get a value from.
             * @param {string} propertyAsStr A string that represents dot notation to get a value from object.
             * @param {object|String|Number} [defaultValue] The default value to be returned if the property is not found.
             * @return {object} If object is found, if not then default value will be returned. If the default value is
             * not defined then null will be returned.
             */
            getValue: function (parentObj, propertyAsStr, defaultValue) {
                var i,
                    len,
                    properties;

                defaultValue = typeof defaultValue === "undefined" ? null : defaultValue;

                // Sanity check
                if (!parentObj || typeof parentObj !== "object" || typeof propertyAsStr !== "string") {
                    return defaultValue;
                }

                properties = propertyAsStr.split(".");
                for (i = 0, len = properties.length; i < len; i += 1) {
                    if (!parentObj || parentObj[properties[i]] === undefined) {
                        return defaultValue;
                    }
                    parentObj = parentObj[properties[i]];
                }
                return parentObj;
            },

            /**
             * Helper function to find an item in an array.
             * @param {Array} array The array to search.
             * @param {String} item The item to search for.
             * @returns {int} The index of the item if found, -1 if not.
             */
            indexOf: function (array, item) {
                var i,
                    len;

                if (array && array.indexOf) {
                    return array.indexOf(item);
                }

                return -1;
            },

            /**
             * Invokes callback for each element of an array.
             * @param {Array} array The array (or any indexable object) to walk through
             * @param {function} callback Callback function
             * @param {object} [context] context object; if not provided global object will be considered
             * @returns {int} Whether if callback is called 1 for true, 0 if not.
             */
            forEach: function (array, callback, context) {
                var i,
                    len;

                // Sanity checks
                if (!array || !array.length || !callback || !callback.call) {
                    return 0;
                }

                for (i = 0, len = array.length; i < len; i += 1) {
                    callback.call(context, array[i], i, array);
                }
                return 1;
            },

            /**
             * Returns true if callback returns true at least once. Callback is
             * called for each array element unless it reaches end of array or
             * returns true.
             * @param {object} array An Array or any indexable object to walk through
             * @param {function} callback A callback function
             * @returns {boolean} True if callback returned true at least once; false otherwise
             */
            some: function (array, callback) {
                var i,
                    len,
                    val = false;

                for (i = 0, len = array.length; i < len; i += 1) {
                    val = callback(array[i], i, array);
                    if (val) {
                        return val;
                    }
                }
                return val;
            },

            /**
             * Converts an arguments object into an array. This is used to augment
             * the arguments passed to the TLT methods used by the Module Context.
             * @param {Arguments} items An array-like collection.
             * @return {Array} An array containing the same items as the collection.
             */
            convertToArray: function (items) {
                var i = 0,
                    len = items.length,
                    result = [];

                while (i < len) {
                    result.push(items[i]);
                    i += 1;
                }

                return result;
            },

            mixin: function (dst) {
                var prop,
                    src,
                    srcId,
                    len;

                for (srcId = 1, len = arguments.length; srcId < len; srcId += 1) {
                    src = arguments[srcId];
                    for (prop in src) {
                        if (Object.prototype.hasOwnProperty.call(src, prop)) {
                            dst[prop] = src[prop];
                        }
                    }
                }
                return dst;
            },

            extend: function (deep, target, src) {
                var prop = "";

                for (prop in src) {
                    if (Object.prototype.hasOwnProperty.call(src, prop)) {
                        if (deep && Object.prototype.toString.call(src[prop]) === "[object Object]") {
                            if (typeof target[prop] === "undefined") {
                                target[prop] = {};
                            }
                            this.extend(deep, target[prop], src[prop]);
                        } else {
                            target[prop] = src[prop];
                        }
                    }
                }
                return target;
            },

            /**
             * Makes copy of an object.
             * @function
             * @name core.utils.clone
             * @param {object} obj A object that will be cloned.
             * @return {object} Object cloned.
             */
            clone: function (obj) {
                var copy,
                    attr;

                if (null === obj || "object" !== typeof obj) {
                    return obj;
                }

                if (obj instanceof Object) {
                    copy = (Object.prototype.toString.call(obj) === "[object Array]") ? [] : {};
                    for (attr in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, attr)) {
                            copy[attr] = this.clone(obj[attr]);
                        }
                    }
                    return copy;
                }
            },

            /**
             * Parses a version string of format e.g. "5.1.0" and returns an array
             * with individual version components [5, 1, 0]
             * @function
             * @param {String} version The version string
             * @returns {Array} The version components parsed as integers.
             */
            parseVersion: function (version) {
                var i,
                    len,
                    retval = [];

                // Sanity check
                if (!version || !version.length) {
                    return retval;
                }

                retval = version.split(".");
                for (i = 0, len = retval.length; i < len; i += 1) {
                    retval[i] = /^[0-9]+$/.test(retval[i]) ? parseInt(retval[i], 10) : retval[i];
                }

                return retval;
            },

            /**
             *
             */
            isEqual: function (a, b) {
                var i,
                    isEqual,
                    prop,
                    swap,
                    len;

                if (a === b) {
                    return true;
                }
                if (typeof a !== typeof b) {
                    return false;
                }
                if (a instanceof Object && b instanceof Object) {
                    // Array
                    if (Object.prototype.toString.call(a) === "[object Array]" &&
                            Object.prototype.toString.call(b) === "[object Array]") {
                        if (a.length !== b.length) {
                            return false;
                        }
                        for (i = 0, len = a.length; i < len; i += 1) {
                            if (!this.isEqual(a[i], b[i])) {
                                return false;
                            }
                        }
                        return true;
                    }
                    // Object
                    if (Object.prototype.toString.call(a) === "[object Object]" &&
                            Object.prototype.toString.call(b) === "[object Object]") {
                        for (i = 0; i < 2; i += 1) {
                            for (prop in a) {
                                if (a.hasOwnProperty(prop)) {
                                    if (!b.hasOwnProperty(prop)) {
                                        return false;
                                    }
                                    isEqual = this.isEqual(a[prop], b[prop]);
                                    if (!isEqual) {
                                        return false;
                                    }
                                }
                            }
                            swap = a;
                            a = b;
                            b = swap;
                        }
                        return true;
                    }
                }
                return false;
            },

            /**
             * Calculates and returns the normalized (X, Y) values of the mouse/touch position relative to the
             * target elements (top, left) position.
             * @function
             * @param {Object} info object {x: val, y: val, width: val, height: val}
             * containing event x, y relative to element topLeft, width and height of element
             * @return String value of relative X & Y. Default in case of error or negative values is "0.5,0.5"
             */
            calculateRelativeXY: function (info) {
                if (utils.isUndefOrNull(info) || utils.isUndefOrNull(info.x) || utils.isUndefOrNull(info.y) || utils.isUndefOrNull(info.width) || utils.isUndefOrNull(info.height)) {
                    return "0.5,0.5";
                }
                var relX = Math.abs(info.x / info.width).toFixed(4),
                    relY = Math.abs(info.y / info.height).toFixed(4);

                relX = relX > 1 || relX < 0 ? 0.5 : relX;
                relY = relY > 1 || relY < 0 ? 0.5 : relY;

                return relX + "," + relY;
            },


            /**
             *
             */
            createObject: (function () {
                var fn = null,
                    F = null;
                if (typeof Object.create === "function") {
                    fn = Object.create;
                } else {
                    F = function () {};
                    fn = function (o) {
                        if (typeof o !== "object" && typeof o !== "function") {
                            throw new TypeError("Object prototype need to be an object!");
                        }
                        F.prototype = o;
                        return new F();
                    };
                }
                return fn;
            }()),

            /**
             * Method access the object element based on a string. By default it searches starting from window object.
             * @function
             * @example core.utils.access("document.getElementById");
             * @example core.utils.access("address.city", person);
             * @param {string} path Path to object element. Currently on dot separators are supported (no [] notation support)
             * @param {object} [rootObj=window] Root object where there search starts. window by default
             * @return {*} Object element or undefined if the path is not valid
             */
            access: function (path, rootObj) {
                var obj = rootObj || window,
                    arr,
                    i,
                    len;

                // Sanity check
                if (typeof path !== "string" || typeof obj !== "object") {
                    return;
                }
                arr = path.split(".");
                for (i = 0, len = arr.length; i < len; i += 1) {
                    if (i === 0 && arr[i] === "window") {
                        continue;
                    }
                    if (!Object.prototype.hasOwnProperty.call(obj, arr[i])) {
                        return;
                    }
                    obj = obj[arr[i]];
                    if (i < (len - 1) && !(obj instanceof Object)) {
                        return;
                    }
                }
                return obj;
            },

            /**
             * Checks if a given character is numeric.
             * @param  {String}  character The character to test.
             * @return {Boolean} Returns true if the given character is a number.
             */
            isNumeric: function (character) {
                var retVal = false;

                // Sanity check
                if (utils.isUndefOrNull(character) || !(/\S/.test(character))) {
                    return retVal;
                }

                retVal = !isNaN(character * 2);
                return retVal;
            },

            /**
             * Checks if a given character is uppercase.
             * @param  {String}  character The character to test.
             * @return {Boolean} Returns true if the character is uppercase.
             *                   Otherwise false.
             */
            isUpperCase: function (character) {
                return character === character.toUpperCase() &&
                        character !== character.toLowerCase();
            },

            /**
             * Checks if a given character is lowercase.
             * @param  {String}  character The character to test.
             * @return {Boolean} Returns true if the character is lowercase.
             *                   Otherwise false.
             */
            isLowerCase: function (character) {
                return character === character.toLowerCase() &&
                        character !== character.toUpperCase();
            },

            /**
             * Builds an object of key => value pairs of HTTP headers from a string.
             * @param {String} headers The string of HTTP headers separated by newlines
             * (i.e.: "Content-Type: text/html\nLast-Modified: ..")
             * @return {Object} Returns an object where every key is a header and
             * every value it's corresponding value.
             */
            extractResponseHeaders: function (headers) {
                var headersObj = {},
                    i,
                    len,
                    header = null;

                // Sanity check
                if (!headers || !headers.length) {
                    headers = [];
                } else {
                    headers = headers.split('\n');
                }

                for (i = 0, len = headers.length; i < len; i += 1) {
                    header = headers[i].split(': ');
                    if (header.length === 2) {
                        headersObj[header[0]] = header[1];
                    }
                }
                return headersObj;
            },

            /**
             *
             */
            getTargetState: function (target) {
                var tagnames = {
                        "a": ["innerText", "href"],
                        "input": {
                            "range": ["maxValue:max", "value"],
                            "checkbox": ["value", "checked"],
                            "radio": ["value", "checked"],
                            "image": ["src"]
                        },
                        "select": ["value"],
                        "button": ["value", "innerText"],
                        "textarea": ["value"]
                    },
                    tagName = this.getTagName(target),
                    properties = tagnames[tagName] || null,
                    selectedOption = null,
                    state = null,
                    alias = null,
                    key = "";

                if (properties !== null) {
                    // For input elements, another level of indirection is required
                    if (Object.prototype.toString.call(properties) === "[object Object]") {
                        // default state for input elements is represented by the "value" property
                        properties = properties[target.type] || ["value"];
                    }
                    state = {};
                    for (key in properties) {
                        if (properties.hasOwnProperty(key)) {
                            if (properties[key].indexOf(":") !== -1) {
                                alias = properties[key].split(":");
                                state[alias[0]] = target[alias[1]];
                            } else if (properties[key] === "innerText") {
                                state[properties[key]] = this.trim(target.innerText || target.textContent);
                            } else {
                                state[properties[key]] = target[properties[key]];
                            }
                        }
                    }
                }

                // Special processing for select lists
                if (tagName === "select" && target.options && !isNaN(target.selectedIndex)) {
                    state = state || {};
                    state.index = target.selectedIndex;
                    if (state.index >= 0 && state.index < target.options.length) {
                        selectedOption = target.options[target.selectedIndex];
                        /* Select list value is derived from the selected option's properties
                         * in the following order:
                         * 1. value
                         * 2. label
                         * 3. text
                         * 4. innerText
                         */
                        state.value = selectedOption.getAttribute("value") || selectedOption.getAttribute("label") || selectedOption.text || selectedOption.innerText;
                        state.text = selectedOption.text || selectedOption.innerText;
                    }
                }

                // Indicate if any element is disabled
                if (state && target.disabled) {
                    state.disabled = true;
                }

                return state;
            },

            getDocument: function (node) {
                var doc = node;
                if (node && node.nodeType !== 9) {
                    if (node.getRootNode) {
                        doc = node.getRootNode();
                    } else {
                        doc = node.ownerDocument || node.document;
                    }
                }
                return doc;
            },

            getWindow: function (node) {
                try {
                    if (node.self !== node) {
                        var ownerDocument = utils.getDocument(node);
                        return (!utils.isUndefOrNull(ownerDocument.defaultView)) ? (ownerDocument.defaultView) : (ownerDocument.parentWindow);
                    }
                } catch (e) {
                    // node or it's ownerDocument may not be associated with any window
                    node = null;
                }
                return node;
            },

            /**
             * Given a window.location or document.location object, extract and return the
             * origin and pathname.
             * @param {Object} location The window.location or document.location Object
             * @return {Object} Return an object containing the normalized origin and the pathname.
             */
            getOriginAndPath: function (location) {
                var retObj = {},
                    temp,
                    search,
                    searchParams,
                    key,
                    value,
                    queryArray = [],
                    queryParamsTmp = {},
                    i,
                    j;

                location = location || window.location;

                if (location.origin) {
                    retObj.origin = location.origin;
                } else {
                    retObj.origin = (location.protocol || "") + "//" + (location.host || "");
                }

                // Account for some applications using the ";" as the query separator
                retObj.path = (location.pathname || "").split(";", 1)[0];

                // This is needed for Native hybrid replay to get file path of webview assets used.
                if (retObj.origin.indexOf("file://") > -1 || (utils.isiOS && window.Ionic)) {
                    temp = retObj.path.match(/(.*)(\/.*app.*)/);
                    if (temp !== null) {
                        retObj.path = temp[2];
                        // Set host to fix replay images for Ionic app only
                        retObj.origin = "file://";
                    }
                }

                // Analyze query params from url
                search = location.search || "";
                try {
                    searchParams = new URLSearchParams(search);
                    searchParams.forEach(function (_value, _key) {
                        queryParamsTmp[_key] = _value;
                    });
                } catch (e) {
                    // URLSearchParams is not supported, parse queries manually
                    if (search.length > 1 && search.charAt(0) === '?') {
                        queryArray = decodeURIComponent(search).substring(1).split("&");
                    }
                    for (i = 0; i < queryArray.length; i += 1) {
                        j = queryArray[i].indexOf("=");
                        if (j > -1) {
                            key = queryArray[i].substring(0, j);
                            value = queryArray[i].substring(j + 1);
                            queryParamsTmp[key] = value;
                        }
                    }
                }
                retObj.queryParams = queryParamsTmp;

                return retObj;
            },

            /**
             * Given a HTML frame element, returns the window object of the frame. Tries the contentWindow property
             * first. If contentWindow is not accessible, tries the contentDocument.parentWindow property instead.
             * @param {Object} iFrameElement The HTML frame element object.
             * @return {Object} Returns the window object of the frame element or null.
             */
            getIFrameWindow: function (iFrameElement) {
                var contentWindow = null;

                if (!iFrameElement) {
                    return contentWindow;
                }

                try {
                    contentWindow = iFrameElement.contentWindow ||
                        (iFrameElement.contentDocument ? iFrameElement.contentDocument.parentWindow : null);
                } catch (e) {
                    // Do nothing.
                }

                return contentWindow;
            },

            /**
             * Returns the tagName of the element in lowercase.
             * @param {Element} node DOM element
             * @return {String} The tagName of the element in lowercase.
             */
            getTagName: function (node) {
                var tagName = "";

                // Sanity check
                if (utils.isUndefOrNull(node)) {
                    return tagName;
                }

                if (node == document || node.nodeType === 9) {
                    tagName = "document";
                } else if (node == window || node == window.window) {
                    tagName = "window";
                } else if (typeof node === "string") {
                    tagName = node.toLowerCase();
                } else {
                    tagName = (node.tagName || node.nodeName || "").toLowerCase();
                }
                return tagName;
            },

            /**
             * Returns the normalized type of the element.
             * @param {Element} node DOM element
             * @return {String} The normalized type of the element.
             */
            getTlType: function (node) {
                var elementType,
                    key,
                    tlType = "";

                // Sanity check
                if (utils.isUndefOrNull(node) || !node.type) {
                    return tlType;
                }

                elementType = node.type.toLowerCase();
                key = elementType + ":";
                if (node.subType) {
                    key += node.subType.toLowerCase();
                }

                tlType = tlTypes[key] || elementType;

                return tlType;
            },

            /**
             * Returns true if given node is element from a frame
             * @param {Element} node DOM element
             * @return {boolean} true if input element is element from a frame; false otherwise
             */
            isIFrameDescendant: function (node) {
                var nodeWindow = utils.getWindow(node);

                /*jshint eqeqeq:false, eqnull: false */
                /* The != operator below is on purpose due to legacy IE issues, where:
                   window === top returns false, but window == top returns true */
                return (nodeWindow ? (nodeWindow != TLT._getLocalTop()) : false);
            },

            /**
             * Takes the orientation in degrees and returns the orientation mode as a
             * text string. 0, 180 and 360 correspond to portrait mode while 90, -90
             * and 270 correspond to landscape.
             * @function
             * @name core.utils.getOrientationMode
             * @param {number} orientation A normalized orientation value such as
             *          0, -90, 90, 180, 270, 360.
             * @return {string} "PORTRAIT" or "LANDSCAPE" for known orientation values.
             * "UNKNOWN" for unrecognized values. "INVALID" in case of error.
             */
            getOrientationMode: function (orientation) {
                var mode = "INVALID";

                if (typeof orientation !== "number") {
                    return mode;
                }

                switch (orientation) {
                case 0:
                case 180:
                case 360:
                    mode = "PORTRAIT";
                    break;
                case 90:
                case -90:
                case 270:
                    mode = "LANDSCAPE";
                    break;
                default:
                    mode = "UNKNOWN";
                    break;
                }

                return mode;
            },

            /**
             * Get orientation in degrees.
             * @function
             * @name core.utils.getOrientationAngle
             * @return {number} An orientation value such as
             *          0, -90, 90, 180, 270, 360.
             */
            getOrientationAngle: function () {
                if (typeof window.orientation === "number") {
                    return window.orientation;
                }

                var angle = (screen.orientation || {}).angle;
                if (typeof angle !== "number") {
                    switch (screen.mozOrientation || screen.msOrientation) {
                    case "landscape-primary":
                    case "landscape-secondary":
                        angle = 90;
                        break;
                    default:
                        angle = 0;
                        break;
                    }
                }
                return angle;
            },

            clog: (function (window) {
                return function () {
                    // Do nothing!
                };
            }(window)),

            /**
             * Trims any whitespace and returns the trimmed string.
             * @function
             * @name core.utils.trim
             * @param {string} str The string to be trimmed.
             * @return {string} The trimmed string.
             */
            trim: function (str) {
                // Sanity check.
                if (!str || !str.toString) {
                    return str;
                }

                if (str.trim) {
                    // Use the native implementation if available
                    return str.trim();
                }
                return str.toString().replace(/^\s+|\s+$/g, "");
            },

            /**
             * Trims any whitespace at the beginning of the string and returns the
             * trimmed string.
             * @function
             * @name core.utils.ltrim
             * @param {string} str The string to be trimmed.
             * @return {string} The trimmed string.
             */
            ltrim: function (str) {
                // Sanity check.
                if (!str || !str.toString) {
                    return str;
                }

                if (str.trimStart) {
                    // Use the native implementation if available
                    return str.trimStart();
                }
                return str.toString().replace(/^\s+/, "");
            },

            /**
             * Trims any whitespace at the end of the string and returns the
             * trimmed string.
             * @function
             * @name core.utils.rtrim
             * @param {string} str The string to be trimmed.
             * @return {string} The trimmed string.
             */
            rtrim: function (str) {
                // Sanity check.
                if (!str || !str.toString) {
                    return str;
                }

                if (str.trimEnd) {
                    // Use the native implementation if available
                    return str.trimEnd();
                }
                return str.toString().replace(/\s+$/, "");
            },

            /**
             * Sets the specified cookie.
             * @function
             * @param {string} cookieName The name of the cookie.
             * @param {string} cookieValue The value of the cookie.
             * @param {integer} [maxAge] The max age of the cookie in seconds. If none is specified, defaults to creating a session cookie.
             * @param {string} [path] The absolute path. If none is specified, defaults to "/"
             * @param {string} [domain] The domain on which to set the cookie. If none is specified, defaults to location.hostname
             * @param {Boolean} [secure] If the secure flag should be set for this cookie.
             * @param {String} [samesite] The samesite setting that should be set for this cookie. Default is "Strict"
             */
            setCookie: function (cookieName, cookieValue, maxAge, path, domain, secure, samesite) {
                var i,
                    len,
                    domainArray,
                    expiry,
                    maxAgeStr = "",
                    pathStr,
                    secureStr,
                    samesiteStr;

                // Browsers require secure attribute be set when samesite is "None"
                if (samesite === "None") {
                    secure = true;
                } else if (samesite !== "Lax") {
                    // "Strict" is the default setting.
                    samesite = "Strict";
                }
                samesiteStr = ";SameSite=" + samesite;

                secureStr = secure ? ";Secure" : "";

                // Sanity check
                if (!cookieName) {
                    return;
                }

                // Cookie name and value cannot contain unescaped whitespace, comma, semi-colon etc.
                cookieName = encodeURIComponent(cookieName);
                cookieValue = encodeURIComponent(cookieValue);

                domainArray = (domain || location.hostname).split('.');
                pathStr = ";Path=" + (path || "/");
                if (typeof maxAge === "number") {
                    if (this.isIE) {
                        expiry = new Date();
                        expiry.setTime(expiry.getTime() + (maxAge * 1000));
                        // IE does not support max-age but instead uses Expires
                        maxAgeStr = ";Expires=" + expiry.toUTCString();
                    } else {
                        maxAgeStr = ";Max-Age=" + maxAge;
                    }
                }

                // Try to set the cookie with two domain components. e.g. "foo.com".
                // If not successful try with three domain components, e.g. "foo.co.uk" and so on.
                for (len = domainArray.length, i = (len === 1 ? 1 : 2); i <= len; i += 1) {
                    document.cookie = cookieName + "=" + cookieValue + ";Domain=" + domainArray.slice(-i).join('.') + pathStr + maxAgeStr + secureStr + samesiteStr;
                    if (this.getCookieValue(cookieName) === cookieValue) {
                        break;
                    }
                    if (len === 1) {
                        // Special case when trying to set cookie on single component domain fails.
                        // Try to set the cookie without explicitly specifying the domain.
                        document.cookie = cookieName + "=" + cookieValue + pathStr + maxAgeStr + secureStr + samesiteStr;
                    }
                }
            },

            /**
             * Finds and returns the named cookie's value.
             * @function
             * @name core.utils.getCookieValue
             * @param {string} cookieName The name of the cookie.
             * @param {string} [cookieString] Optional cookie string in which to search for cookieName.
             * If none is specified, then document.cookie is used by default.
             * @return {string} The cookie value if a match is found or null.
             */
            getCookieValue: function (cookieName, cookieString) {
                var i,
                    len,
                    cookie,
                    cookies,
                    cookieValue = null,
                    cookieNameLen;

                try {
                    cookieString = cookieString || document.cookie;

                    // Sanity check.
                    if (!cookieName || !cookieName.toString) {
                        return null;
                    }

                    // Append an '=' to the cookie name
                    cookieName += "=";
                    cookieNameLen = cookieName.length;

                    // Get the individual cookies into an array and look for a match
                    cookies = cookieString.split(';');
                    for (i = 0, len = cookies.length; i < len; i += 1) {
                        cookie = cookies[i];
                        cookie = utils.ltrim(cookie);

                        // Check if cookieName matches the current cookie prefix.
                        if (cookie.indexOf(cookieName) === 0) {
                            // Match found! Get the value (i.e. RHS of "=" sign)
                            cookieValue = cookie.substring(cookieNameLen, cookie.length);
                            break;
                        }
                    }
                } catch (e) {
                    cookieValue = null;
                }

                return cookieValue;
            },

            /**
             * Finds and returns the query parameter's value.
             * @function
             * @name core.utils.getQueryStringValue
             * @param {string} paramName The name of the query parameter.
             * @param {string} [queryDelim] The query string delimiter. Either ";" or "&"
             * @param {string} [queryString] Optional query string in which to search for the query parameter.
             * If none is specified, then document.location.search is used by default.
             * @return {string} The query parameter value if a match is found or null.
             */
            getQueryStringValue: function (paramName, queryDelim, queryString) {
                var i,
                    j,
                    queryStringLen,
                    paramValue = null,
                    valueStartIndex;

                try {
                    queryString = queryString || window.location.search;
                    queryStringLen = queryString.length;

                    // Sanity check.
                    if (!paramName || !paramName.toString || !queryStringLen) {
                        return null;
                    }

                    // Default delimiter is &
                    queryDelim = queryDelim || "&";
                    // Normalize for easy searching by replacing initial '?' with the delimiter
                    queryString = queryDelim + queryString.substring(1);
                    // Modify the parameter name to prefix the delimiter and append an '='
                    paramName = queryDelim + paramName + "=";

                    i = queryString.indexOf(paramName);
                    if (i !== -1) {
                        valueStartIndex = i + paramName.length;
                        // Match found! Get the value (i.e. RHS of "=" sign upto the delim or end of string)
                        j = queryString.indexOf(queryDelim, valueStartIndex);
                        if (j === -1) {
                            j = queryStringLen;
                        }
                        paramValue = decodeURIComponent(queryString.substring(valueStartIndex, j));
                    }
                } catch (e) {
                    // Do nothing!
                }

                return paramValue;
            },

            /**
             * Quick wrapper for addEventL:istener/attachEvent. Mainly to be used for core, before UIC is fully
             * initialized
             * @function
             * @name core.util.addEventListener
             */
            addEventListener: (function () {
                if (window.addEventListener) {
                    return function (element, eventName, listener) {
                        element.addEventListener(eventName, listener, false);
                    };
                }
                return function (element, eventName, listener) {
                    element.attachEvent("on" + eventName, listener);
                };
            }()),

            /**
             * Returns the index of the rule that is matched by the target object.
             * @function
             * @name core.utils.matchTarget
             * @param {Array} rules An array of match rules containing objects such as
             * {id, idType} or { { regex }, idType } or a string representing "CSS Selectors"
             * @param {Object} target  The normalized target object of the message.
             * @return {int} Returns the index of the matching rule. If none of the rules match then returns -1.
             */
            matchTarget: function (rules, target) {
                var i,
                    j,
                    domElement,
                    matchIndex = -1,
                    qr,
                    qrLen,
                    qrTarget,
                    len,
                    rule,
                    scope = document;

                // Sanity check
                if (!rules || !target) {
                    return matchIndex;
                }

                // Check if services have been previouly cached
                if (!this.browserService || !this.browserBaseService) {
                    this.browserService = TLT.getService("browser");
                    this.browserBaseService = TLT.getService("browserBase");
                }

                if (target.idType === -2) {
                    // Get the document scope of xpath ids since the elements could be inside a frame/iframe
                    domElement = this.browserBaseService.getNodeFromID(target.id, target.idType);
                    scope = this.getDocument(domElement);
                }

                for (i = 0, len = rules.length; i < len && matchIndex === -1; i += 1) {
                    rule = rules[i];

                    // Check if rule is a selector string.
                    if (typeof rule === "string") {
                        qr = this.browserService.queryAll(rule, scope);
                        for (j = 0, qrLen = qr ? qr.length : 0; j < qrLen; j += 1) {
                            if (qr[j]) {
                                qrTarget = this.browserBaseService.ElementData.prototype.examineID(qr[j]);
                                if (qrTarget.idType === target.idType && qrTarget.id === target.id) {
                                    matchIndex = i;
                                    break;
                                }
                            }
                        }
                    } else if (rule && rule.id && rule.idType && target.idType && target.idType.toString() === rule.idType.toString()) {
                        // Note: idType provided by wizard is a string so convert both to strings before comparing.

                        // An id in the rules list could be a direct match, in which case it will be a string OR
                        // it could be a regular expression in which case it would be an object like this:
                        // {regex: ".+private$", flags: "i"}
                        switch (typeof rule.id) {
                        case "string":
                            if (rule.id === target.id) {
                                matchIndex = i;
                            }
                            break;
                        case "object":
                            if (!rule.cRegex) {
                                // Cache the RegExp object for future use.
                                rule.cRegex = new RegExp(rule.id.regex, rule.id.flags);
                            }
                            // Reset and test
                            rule.cRegex.lastIndex = 0;
                            if (rule.cRegex.test(target.id)) {
                                matchIndex = i;
                            }
                            break;
                        }
                    }
                }
                return matchIndex;
            },

            /**
             * Performs privacy pattern matching and replacement on the provided string.
             * @param {String} str Input string to which privacy pattern matching and
             *                     replacement is to be applied
             * 
             * @return {String} Output string with privacy pattern replacement applied.
             */
            applyPrivacyPatterns: function (str, privacyPatterns) {
                let i,
                    len,
                    begin,
                    duration,
                    rule;

                // Sanity check
                if (!str) {
                    return "";
                }

                if (typeof str === 'number') {
                    return str;
                }

                privacyPatterns = privacyPatterns || []

                for (i = 0, len = privacyPatterns.length; i < len; i += 1) {
                    rule = privacyPatterns[i];
                    rule.cRegex.lastIndex = 0;
                    str = str.replace(rule.cRegex, rule.replacement);
                }

                return str;
            },

            /**
             * Basic WeakMap implementation - a map which can be indexed with objects.
             * In comparison to the original API 'delete' method has been replaced with 'remove'
             * due to compatibility with legacy IE
             * @constructor
             * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/WeakMap
             */
            WeakMap: (function () {
                function index(data, key) {
                    var i,
                        len;
                    data = data || [];
                    for (i = 0, len = data.length; i < len; i += 1) {
                        if (data[i][0] === key) {
                            return i;
                        }
                    }
                    return -1;
                }
                return function () {
                    var data = [];
                    this.set = function (key, val) {
                        var idx = index(data, key);
                        data[idx > -1 ? idx : data.length] = [key, val];
                    };
                    this.get = function (key) {
                        var arr = data[index(data, key)];
                        return (arr ? arr[1] : undefined);
                    };
                    this.clear = function () {
                        data = [];
                    };
                    this.has = function (key) {
                        return (index(data, key) >= 0);
                    };
                    this.remove = function (key) {
                        var idx = index(data, key);
                        if (idx >= 0) {
                            data.splice(idx, 1);
                        }
                    };
                    this["delete"] = this.remove;
                };
            }())
        };


    if (typeof TLT === "undefined" || !TLT) {
        window.TLT = {};
    }

    TLT.utils = utils;


}());


/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview Defines a simple event target interface that can be inherited
 *      from by other parts of the system.
 * @exports TLT.EventTarget
 */
/*global TLT*/

(function () {

    "use strict";

    /**
     * Abstract type that implements basic event handling capabilities.
     * Other types may inherit from this in order to provide custom
     * events.
     * @constructor
     */
    TLT.EventTarget = function () {

        /**
         * Holds all registered event handlers. Each property represents
         * a specific event, each property value is an array containing
         * the event handlers for that event.
         * @type Object
         */
        this._handlers = {};

    };

    TLT.EventTarget.prototype = {

        /**
         * Restores the constructor to the correct value.
         * @private
         */
        constructor: TLT.EventTarget,

        /**
         * Publishes an event with the given name, which causes all
         * event handlers for that event to be called.
         * @param {String} name The name of the event to publish.
         * @param {Variant} [data] The data to provide for the event.
         * @returns {void}
         */
        publish: function (name, data) {

            var i = 0,
                len = 0,
                handlers = this._handlers[name],
                event = {
                    type: name,
                    data: data
                };

            if (typeof handlers !== "undefined") {
                for (len = handlers.length; i < len; i += 1) {
                    handlers[i](event);
                }
            }

        },

        /**
         * Registers an event handler for the given event.
         * @param {String} name The name of the event to subscribe to.
         * @param {Function} handler The function to call when the event occurs.
         * @returns {void}
         */
        subscribe: function (name, handler) {

            if (!this._handlers.hasOwnProperty(name)) {
                this._handlers[name] = [];
            }


            this._handlers[name].push(handler);
        },

        /**
         * Unregisters an event handler for the given event.
         * @param {String} name The name of the event to unsubscribe from.
         * @param {Function} handler The event handler to remove.
         * @returns {void}
         */
        unsubscribe: function (name, handler) {

            var i = 0,
                len = 0,
                handlers = this._handlers[name];

            if (handlers) {
                for (len = handlers.length; i < len; i += 1) {
                    if (handlers[i] === handler) {
                        handlers.splice(i, 1);
                        return;
                    }
                }
            }
        }

    };

}());

/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview Defines ModuleContext, which is used by all modules.
 * @exports TLT.ModuleContext
 */

/*global TLT*/
/*jshint loopfunc:true*/

/**
 * A layer that abstracts core functionality for each modules. Modules interact
 * with a ModuleContext object to ensure that they're not doing anything
 * they're not allowed to do.
 * @class
 * @param {String} moduleName The name of the module that will use this context.
 * @param {TLT} core The core object. This must be passed in to enable easier
 *        testing.
 */

TLT.ModuleContext = (function () {

    "use strict";

    /**
     * Methods to be exposed from the Core to ModuleContext. ModuleContext
     * simply passes through these methods to the Core. By listing the
     * methods here, the ModuleContext object can be dynamically created
     * to keep the code as small as possible. You can easily add new methods
     * to ModuleContext by adding them to this array. Just make sure the
     * method also exists on TLT and that the first argument for the method
     * on TLT is always the module name.
     *
     * If the method name on ModuleContext is different than on TLT, you can
     * specify that via "contextMethodName:coreMethodName", where contextMethodName
     * is the name of the method on ModuleContext and coreMethodName is
     * the name of the method on TLT.
     *
     * Because the methods aren't actually defined in the traditional sense,
     * the documentation comments are included within the array for proper
     * context.
     * @private
     * @type String[]
     */
    var methodsToExpose = [

        /**
         * Broadcasts a message to the entire system.
         * @name broadcast
         * @memberOf TLT.ModuleContext#
         * @function
         * @param {String} messageName The name of the message to send.
         * @param {Variant} data The data to send along with the message.
         * @returns {void}
         */
        "broadcast",

        /**
         * Returns the configuration object for the module.
         * @name getConfig
         * @memberOf TLT.ModuleContext#
         * @function
         * @returns {Object} The configuration object for the module.
         */
        "getConfig:getModuleConfig",

        /**
         * Tells the system that the module wants to know when a particular
         * message occurs.
         * @name listen
         * @memberOf TLT.ModuleContext#
         * @function
         * @param {String} messageName The name of the message to listen for.
         * @returns {void}
         */
        "listen",


        /**
         * Posts an event to the module's queue.
         * @name post
         * @memberOf TLT.ModuleContext#
         * @function
         * @param {Object} event The event to put into the queue.
         * @param {String} [queueId] The ID of the queue to add the event to.
         * @returns {void}
         */
        "post",

        /**
         * Calculates the xpath of the given DOM Node.
         * @name getXPathFromNode
         * @memberOf TLT.ModuleContext#
         * @function
         * @param {DOMElement} node The DOM node who's xpath is to be calculated.
         * @returns {String} The calculated xpath.
         */
        "getXPathFromNode",

        /**
         * Log a DOM Capture message to the default queue.
         * @name performDOMCapture
         * @memberOf TLT.ModuleContext#
         * @function
         * @param {String} moduleName Name of the module which invoked this function.
         * @param {DOMElement} [root] Parent element from which to start the capture.
         * @param {Object} [config] DOM Capture configuration options.
         * @returns {String} The unique string representing the DOM Capture id.
         * null if DOM Capture failed.
         * @see logDOMCapture
         */
        "performDOMCapture",

        /**
         * Log a Form Completion message to the default queue.
         * @name performFormCompletion
         * @memberOf TLT.ModuleContext#
         * @function
         * @param {String} moduleName Name of the module which invoked this function.
         * @param {boolean} submitted Indicates if the form (or form equivalent) was submitted.
         * For a standard form element this would be when the submit event is triggered.
         * @param {boolean} [valid] Indicates if the form fields were validated and the result
         * of the validation. True if validation was performed and successful, false if validation
         * was performed but failed.
         * @see logFormCompletion
         */
        "performFormCompletion",

        /**
         * @name isInitialized
         * @memberOf TLT.ModuleContext#
         * @function
         * @returns {Boolean} Returns true if library is successfully initialized, false otherwise.
         */
        "isInitialized",

        /**
         * @name getStartTime
         * @memberOf TLT.ModuleContext#
         * @function
         * @returns {integer} Returns the recorded timestamp in milliseconds corresponding to when the TLT object was created.
         */
        "getStartTime",

        /**
         * @name normalizeUrl
         * @memberOf TLT.ModuleContext#
         * @function
         * @returns {String} Returns normalized url of custom function provided by config.
         */
        "normalizeUrl",

        /**
         * @name getCurrentOffset
         * @memberOf TLT.ModuleContext#
         * @function
         * @returns {Number} Returns the current offset (in milliseconds) since page start.
         */
        "getCurrentOffset",

        /**
         * @name getTabId
         * @memberOf TLT.ModuleContext#
         * @function
         * @returns {object} Returns tab id.
         */
        "getTabId",

        /**
         * @name setSessionCookieInfo
         * @memberOf TLT.ModuleContext#
         * @function
         * @returns {void}
         */
        "setSessionCookieInfo"
    ];

    /**
     * Creates a new ModuleContext object. This function ends up at TLT.ModuleContext.
     * @private
     * @param {String} moduleName The name of the module that will use this context.
     * @param {TLT} core The core object. This must be passed in to enable easier
     *        testing.
     */
    return function (moduleName, core) {

        // If you want to add methods that aren't directly mapped from TLT, do it here
        var context = {},
            i,
            len,
            parts = null,
            coreMethod = null,
            contextMethod = null;

        // Copy over all methods onto the context object
        for (i = 0, len = methodsToExpose.length; i < len; i += 1) {

            // Check to see if the method names are the same or not
            parts = methodsToExpose[i].split(":");
            if (parts.length > 1) {
                contextMethod = parts[0];
                coreMethod = parts[1];
            } else {
                contextMethod = parts[0];
                coreMethod = parts[0];
            }

            context[contextMethod] = (function (_coreMethod) {

                return function () {

                    // Gather arguments and put moduleName as the first one
                    var args = core.utils.convertToArray(arguments);
                    args.unshift(moduleName);


                    // Pass through to the Core
                    return core[_coreMethod].apply(core, args);
                };

            }(coreMethod));
        }

        context.utils = core.utils;

        return context;
    };

}());


/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview The ConfigService is responsible for managing global configuration settings.
 * This may include receiving dynamic configuration updates from the server at regular intervals.
 * The ConfigService fires a configupdated event when it receives updated configuration information.
 * @exports configService
 */

/*global TLT:true */

/**
 * @name configService
 * @namespace
 */
TLT.addService("config", function (core) {
    "use strict";

    /**
     * Merges a new configuration object/diff into the existing configuration by doing a deep copy.
     * @name configService-mergeConfig
     * @function
     * @private
     * @param  {Object} oldConf Existing configuration object.
     * @param  {Object} newConf New configuration object.
     */
    function mergeConfig(oldConf, newConf) {
        core.utils.extend(true, oldConf, newConf);
        configService.publish("configupdated", configService.getConfig());
    }

    /**
     * Holds the config for core and all services and modules.
     * @private
     * @name configService-config
     * @type {Object}
     */
    var config = {
            core: {},
            modules: {},
            services: {}
        },
        configService = core.utils.extend(false, core.utils.createObject(new TLT.EventTarget()), {
            /**
             * Returns the global configuration object.
             * @return {Object} The global configuration object.
             */
            getConfig: function () {
                return config;
            },
            /**
             * Returns the base default global configuration object.
             * @return {Object} The base default global configuration object.
             */
            getDefaultConfig: function () {
                //***UIC CONFIGURATION***
                var defaultConfig = {
                    core: {
                        // Parameterize - customer name and implementation date
                        buildNote: "Acoustic Tealeaf UIC " + window.TLT.getLibraryVersion(),
                        blockedElements: [],
                        ieExcludedLinks: ["a[href*=\"javascript:void\"]", "input[onclick*='javascript:']"],
                        blockedUserAgents: [
                            { regex: "(Google|Bing|Face|DuckDuck|Yandex|Exa)bot|spider|archiver", flags: "i" },
                            "PhantomJS"
                        ],
                        inactivityTimeout: 1000 * 60 * 29, // 29 minutes, just under default 30 min app timeout

                        modules: {
                            replay: {
                                events: [
                                    { name: "change", attachToShadows: true, recurseFrames: true },
                                    { name: "click", recurseFrames: true },
                                    { name: "dblclick", recurseFrames: true },
                                    { name: "contextmenu", recurseFrames: true },
                                    { name: "pointerdown", recurseFrames: true },
                                    { name: "pointerup", recurseFrames: true },
                                    { name: "hashchange", target: window },
                                    { name: "focus", recurseFrames: true },
                                    { name: "blur", recurseFrames: true },
                                    { name: "load", target: window },
                                    { name: "unload", target: window },
                                    { name: "resize", target: window },
                                    { name: "scroll", target: window },
                                    { name: "mousemove", recurseFrames: true },
                                    { name: "orientationchange", target: window },
                                    { name: "touchend" },
                                    { name: "touchstart" },
                                    { name: "error", target: window },
                                    { name: "visibilitychange" }
                                ]
                            },
                            flushQueue: {
                                events: [] // Populated by custom logic below for iOS sessions
                            },
                            overstat: {
                                enabled: true,
                                events: [
                                    { name: "click", recurseFrames: true },
                                    { name: "mousemove", recurseFrames: true },
                                    { name: "mouseout", recurseFrames: true },
                                    { name: "submit", recurseFrames: true }
                                ]
                            },
                            performance: {
                                enabled: true,
                                events: [
                                    { name: "load", target: window },
                                    { name: "unload", target: window }
                                ]
                            },
                            ajaxListener: {
                                enabled: true,
                                events: [
                                    { name: "load", target: window },
                                    { name: "unload", target: window }
                                ]
                            },
                            gestures: {
                                /* This replay rule must also be added to replay gestures events in Tealeaf SaaS
                                    <HostProfile name="www.sample.com">
                                        <SimulateUIEvents value=".*" uiEvents="gestures,resize,valuechange,click,mouseup,scroll"/>
                                    </HostProfile>
                                */
                                enabled: true,
                                events: [
                                    { name: "tap", target: window },
                                    { name: "hold", target: window },
                                    { name: "drag", target: window },
                                    { name: "release", target: window },
                                    { name: "pinch", target: window }
                                ]
                            },
                            dataLayer: {
                                enabled: false,
                                events: [
                                    { name: "load", target: window },
                                    { name: "unload", target: window }
                                ]
                            },
                            TLCookie: {
                                enabled: true
                            }
                        },

                        // OPTIONAL - Normalize URL, path, or fragment
                        // normalization: {},

                        // OPTIONAL - share session identifier with other libraries
                        // sessionData: {},

                        screenviewAutoDetect: true,
                        framesBlacklist: []
                    },
                    services: {
                        queue: {
                            asyncReqOnUnload: true,
                            useBeacon: true,
                            useFetch: true,
                            xhrEnabled: true,
                            queues: [{
                                qid: "DEFAULT",
                                endpoint: "",
                                // Parameterize
                                maxEvents: 30,
                                timerInterval: 60000,
                                maxSize: 300000,
                                checkEndpoint: true,
                                endpointCheckTimeout: 4000,
                                encoder: "gzip"
                            }]
                        },
                        message: {
                            privacy: [
                                {
                                    targets: ["input[type=password]"],
                                    maskType: 2
                                },
                                {
                                    targets: ["input[id*=phone]", "input[name*=phone]"],
                                    maskType: 4, // replace all digits with X except last 3
                                    maskFunction: function (value) {
                                        return value.slice(0, -3).replace(/[0-9]/g, "X") + value.slice(-3);
                                    }
                                },
                                {
                                    // Whitelist privacy, un-masking only elements not containing PII
                                    exclude: true,
                                    targets: [
                                        // Parameterize - need to be able to dynamically extend/modify this list
                                        "input[type=hidden]",
                                        "input[type=radio]",
                                        "input[type=checkbox]",
                                        "input[type=submit]",
                                        "input[type=button]",
                                        "input[type=search]"
                                    ],
                                    maskType: 4, // replace all alphas with X and digits with 9
                                    maskFunction: function (value) {
                                        return value.replace(/[a-z]/gi, "X").replace(/[0-9]/g, "9");
                                    }
                                }
                            ],
                            privacyPatterns: [
                                // Preemptively block SSN numbers in response
                                {
                                    pattern: {
                                        regex: "\\d{3}-\\d{2}-\\d{4}",
                                        flags: "g"
                                    },
                                    replacement: "XXX-XX-XXXX"
                                },
                                // Uncomment to block elements with .tlPrivate class
                                {
                                    pattern: {
                                        regex: "<div[^<]*tlPrivate[^<]*>(.+?)</div>",
                                        flags: "g"
                                    },
                                    replacement: function (fullMatch, group1) {
                                        var retVal;
                                        if (group1.length > 0) {
                                            retVal = fullMatch.replace(group1, "xxxxxx");
                                            return retVal;
                                        }
                                        return undefined;
                                    }
                                },
                                {
                                    pattern: {
                                        regex: "<span[^<]*tlPrivate[^<]*>(.+?)</span>",
                                        flags: "g"
                                    },
                                    replacement: function (fullMatch, group1) {
                                        var retVal;
                                        if (group1.length > 0) {
                                            retVal = fullMatch.replace(group1, "xxxxxx");
                                            return retVal;
                                        }
                                        return undefined;
                                    }
                                },
                                {
                                    pattern: {
                                        regex: "<p[^<]*tlPrivate[^<]*>(.+?)</p>",
                                        flags: "g"
                                    },
                                    replacement: function (fullMatch, group1) {
                                        var retVal;
                                        if (group1.length > 0) {
                                            retVal = fullMatch.replace(group1, "xxxxxx");
                                            return retVal;
                                        }
                                        return undefined;
                                    }
                                }
                                ]
                        },
                        encoder: {
                            gzip: {
                                encode: "window.pako.gzip",
                                defaultEncoding: "gzip"
                            }
                        },
                        domCapture: {
                            // Parameterize
                            diffEnabled: true,
                            // Options are set to these defaults:
                            //
                            // maxMutations: 100           // If this threshold is reached, the full DOM is captured instead of a diff
                            // maxLength: 1000000          // If this threshold is reached, the DOM snapshot will not be sent
                            // captureShadowDOM: false     // Enable ONLY if app is using shadown DOM. Also set allowHitSplit to false in org properties.
                            // captureFrames: false        // Enable ONLY if child frames/iframes need to be captured for replay
                            // captureDynamicStyles: false // Enable ONLY if dynamic/constructable/CSSOM styles are present
                            // captureHREFStyles: false    // Enable ONLY if all styles need to be inserted inline (e.g if CSS files unreachable)
                            // removeScripts: true         // Disable ONLY if script tags need to be preserved
                            // removeComments: true        // Disable ONLY if comments need to be preserved
                            // discardBase64: 0            // Not present by default! Discard all base64 encoded inline image data that exceeds N characters.
                            // captureStyle: true          // Disable to remove inline CSS. Reduces the size of the DOM snapshots, but may affect replay.
                            // keepImports: false          // Enable to honor the "import" link type, a now deprecated and Chrome specific feature
                            //
                            // Override as needed below:
                            options: {
                                maxLength: 10000000,
                                captureShadowDOM: true,
                                captureDynamicStyles: true,
                                captureFrames: true
                            }
                        },
                        browser: {
                            normalizeTargetToParentLink: true,
                        }
                },
                    modules: {
                        overstat: {
                            hoverThreshold: 3000
                        },
                        performance: {
                            calculateRenderTime: true,
                            renderTimeThreshold: 600000,
                            performanceAlert: {
                                enabled: true,
                                threshold: 3000,
                                maxAlerts: 100,
                                // resourceTypes: [], // Capture everything
                                blacklist: []
                            },
                        },
                        replay: {
                            domCapture: {
                                enabled: true,
                                screenviewBlacklist: [],
                                triggers: [
                                    // Parameterize - need to be able to modify triggers
                                    { event: "change" },
                                    { event: "click" },
                                    { event: "dblclick" },
                                    { event: "contextmenu" },
                                    { event: "visibilitychange" },
                                    {
                                        event: "load",
                                        fullDOMCapture: true,
                                        delay: 300
                                    }
                                ]
                            },
                            mousemove: {
                                enabled: true,
                                sampleRate: 200,
                                ignoreRadius: 3
                            }
                        },
                        ajaxListener: {
                            urlBlocklist: [
                                // Parameterize
                                { regex: "brilliantcollector\\.com" }
                            ],
                            // Parameterize
                            filters: [
                                {
                                    log: {
                                        requestHeaders: true,
                                        requestData: false,
                                        responseHeaders: true,
                                        responseData: false
                                    }
                                }
                            ]
                        },
                        dataLayer: {
                            dataObjects: [
                                {
                                    dataObject: "window.dataLayer",
                                    rules: {
                                        screenviewBlocklist: [],
                                        propertyBlocklist: [],
                                        permittedProperties: [],
                                        includeEverything: true // default: true
                                    }
                                }
                            ],
                        },
                        TLCookie: {
                            // Parameterize
                            appCookieWhitelist: [{ regex: ".*" }],
                            tlAppKey: ""
                        }
                    }
                };

                // ----------------------------------------------------------------------------------
                // Alternate IE Configs -------------------------------------------------------------
                // ----------------------------------------------------------------------------------
                if (window.TLT.utils.isIE) {
                    // Disable DOM Capture and Ajax Monitor in IE9
                    if (document.documentMode === 9) {
                        defaultConfig.modules.replay.domCapture.enabled = false;
                        defaultConfig.modules.ajaxListener.enabled = false;
                    }
                    // Disable DOM Diff, limit DOM Capture triggers in IE10
                    if (document.documentMode === 10) {
                        defaultConfig.services.domCapture.diffEnabled = false;
                        defaultConfig.modules.replay.domCapture.triggers = [
                            { event: "click", targets: ["a", "a *", "button", "button *"] },
                            { event: "change" },
                            { event: "load", delay: 300 }
                        ];
                    }
                }

                // ----------------------------------------------------------------------------------
                // Android and iOS Tuning -----------------------------------------------------------
                // ----------------------------------------------------------------------------------
                if (window.TLT.utils.isiOS || window.TLT.utils.isAndroid) {
                    (function () {
                        var uaMatch;

                        // Reduce batch size, increase frequency, increase endpoint timeout
                        defaultConfig.services.queue.queues[0].maxEvents = 10;
                        defaultConfig.services.queue.queues[0].maxSize = 10000;
                        defaultConfig.services.queue.queues[0].timerInterval = 10000;
                        defaultConfig.services.queue.queues[0].endpointCheckTimeout = 10000;

                        if (window.TLT.utils.isiOS) {
                            // Disable Beacon in iOS 12 and earlier due to Safari on iOS bug
                            uaMatch = window.navigator.userAgent.match(/OS (\d+)_/);
                            if (uaMatch && uaMatch[1] < 13) {
                                defaultConfig.services.queue.useBeacon = false;
                            }
                            // Flush queue on visibilitychange as unload is not a reliable trigger in iOS.
                            // Requires flushQueue (or digitalData) module and entry in core.modules section.
                            if (defaultConfig.core.modules.flushQueue && defaultConfig.core.modules.flushQueue.events) {
                                defaultConfig.core.modules.flushQueue.events.push({ name: "visibilitychange" });
                            } else {
                                console.log("Tealeaf Error: include the flushQueue module!");
                            }
                        }
                    }());
                }
                return defaultConfig;
            },
            /**
             * Assigns the global configuration for the system.
             * This is first called when Core.init() is called and also may be called later if new
             * configuration settings are returned from the server. After initial configuration is set,
             * all further calls are assumed to be diffs of settings that should be changed rather than
             * an entirely new configuration object.
             * @param  {Object} newConf The global configuration object.
             */
            updateConfig: function (newConf) {
                mergeConfig(config, newConf);
            },
            /**
             * Returns the configuration object for the core.
             * @return {Object} The core configuration object.
             */
            getCoreConfig: function () {
                return config.core;
            },
            /**
             * Assigns the configuration for the core. All calls are assumed to be diffs
             * of settings that should be changed rather than an entirely new configuration object.
             * @param  {Object} newConf     A partial or complete core configuration object.
             */
            updateCoreConfig: function (newConf) {
                mergeConfig(config.core, newConf);
            },
            /**
             * Returns the configuration object for a given service.
             * @param {String} serviceName The name of the service to retrieve configuration information for.
             * @return {Object} The service configuration object or an empty object if the named service doesn't exist.
             */
            getServiceConfig: function (serviceName) {
                return config.services[serviceName] || {};
            },
            /**
             * Assigns the configuration for the named service. All calls are assumed to be diffs
             * of settings that should be changed rather than an entirely new configuration object.
             * @param  {String} serviceName The name of the service to update configuration information for.
             * @param  {Object} newConf     A partial or complete service configuration object.
             */
            updateServiceConfig: function (serviceName, newConf) {
                if (typeof config.services[serviceName] === "undefined") {
                    config.services[serviceName] = {};
                }
                mergeConfig(config.services[serviceName], newConf);
            },
            /**
             * Returns the configuration object for a given module.
             * @param {String} moduleName The name of the module to retrieve configuration information for.
             * @return {Object} The module configuration object or empty object if the named module doesn't exist.
             */
            getModuleConfig: function (moduleName) {
                return config.modules[moduleName] || {};
            },
            /**
             * Assigns the configuration for the named module. All calls are assumed to be diffs
             * of settings that should be changed rather than an entirely new configuration object.
             * @param  {String} moduleName The name of the module to update configuration information for.
             * @param  {Object} newConf     A partial or complete module configuration object.
             */
            updateModuleConfig: function (moduleName, newConf) {
                if (typeof config.modules[moduleName] === "undefined") {
                    config.modules[moduleName] = {};
                }
                mergeConfig(config.modules[moduleName], newConf);
            },
            destroy: function () {
                config = {
                    core: {},
                    modules: {},
                    services: {}
                };
            }
        });

    return configService;
});

/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview The QueueService manages all queues in the system.
 * @exports queueService
 */

/*global TLT:true */

/**
 * @name queueService
 * @namespace
 */
TLT.addService("queue", function (core) {
    "use strict";

    /**
     * queueMananger
     * @private
     * @static
     * @name queueService-queueManager
     * @namespace
     */
    var utils = core.utils,
        CONFIG       = null,    // queue configuration
        coreConfig   = {},
        inactivityTimeout = 600000,
        aS           = core.getService("ajax"),          // ajaxService
        bS           = core.getService("browser"),       // browserService
        eS           = core.getService("encoder"),       // encoderService
        sS           = core.getService("serializer"),    // serializerService
        cS           = core.getService("config"),        // configService
        mS           = core.getService("message"),       // messageService
        defaultQueue = null,    // config object for default queue
        queueTimers  = {},      // timer id for the queueTick
        autoFlushing = true,    // Bool, indicates whether to flush queues when
                                // threshold is reached or let the application control flushing.
        delayFlushOnClick = true,  // Delay flushing incase it is the final click on the page before unload.
        msgCounter   = {
            5: {
                limit: 300,
                count: 0
            },
            6: {
                limit: 400,
                count: 0
            }
        },
        xhrLog       = [],
        xhrLogging = true,
        isInitialized = false,
        isSerializedPost = true,
        isLastPostComplete = true,
        queueManager = (function () {
            var queues = {};

            /**
             * Checks if the specified queue exists.
             * @function
             * @name queueService-queueManager.exists
             * @param  {String} queueId The id of the queue to check for existence.
             * @return {Boolean}         Returns true if the queue exists, otherwise false.
             */
            function queueExists(queueId) {
                return typeof queues[queueId] !== "undefined";
            }

            /**
             * Adds a queue to the system.
             * @function
             * @name queueService-queueManager.add
             * @param {String} queueId The id of the queue to add.
             * @param {Object} opts    Some additional configuration options for this queue.
             * @param {String} opts.url  The endpoint URL to which the queue should be flushed.
             * @param {Number} opts.eventThreshold The maximal amount of messages to store
             * in the queue before it gets flushed.
             * @param {Number} opts.sizeThreshold The maximal size of the serialized queue before
             * it gets flushed.
             * @param {String} opts.serialzer The serializer which should be used to serialize
             * the data in the queue when sending it to the server.
             * @return {Object} Returns the newly created queue.
             */
            function addQueue(queueId, opts) {
                if (!queueExists(queueId)) {
                    queues[queueId] = {
                        lastOffset: 0,
                        data: [],
                        queueId: queueId,
                        url: opts.url,
                        eventThreshold: opts.eventThreshold,
                        sizeThreshold: opts.sizeThreshold || 0,
                        timerInterval: opts.timerInterval,
                        // Set the size to -1 so it doesn't trigger a flush if no sizeThreshold is specified
                        size: -1,
                        serializer: opts.serializer,
                        encoder: opts.encoder,
                        crossDomainEnabled: !!opts.crossDomainEnabled,
                        crossDomainIFrame: opts.crossDomainIFrame
                    };
                }
                return queues[queueId];
            }

            /**
             * Removes a queue from the system.
             * @function
             * @name queueService-queueManager.remove
             * @param  {String} queueId The id of the queue which should be deleted.
             */
            function removeQueue(queueId) {
                if (queueExists(queueId)) {
                    delete queues[queueId];
                }
            }

            /**
             * Returns the queue object associated with the given queueId.
             * @function
             * @name queueService-queueManager.get
             * @param  {String} queueId The id of the queue to return.
             * @return {Object}         Returns the queue object for the given id.
             */
            function getQueue(queueId) {
                if (queueExists(queueId)) {
                    return queues[queueId];
                }
                return null;
            }

            /**
             * Clears all items in the queue specified by the queue id.
             * @function
             * @name queueService-queueManager.clear
             * @param  {String} queueId The id of the queue which should be cleared.
             */
            function clearQueue(queueId) {
                var queue = getQueue(queueId);
                if (queue !== null) {
                    queue.data = [];
                }
            }

            /**
             * Returns the queue data and clears the queue.
             * @function
             * @name queueService-queueManager.flush
             * @param  {String} queueId The id of the queue to be flushed.
             * @return {Array}         Returns all items which were stored in the queue.
             */
            function flushQueue(queueId) {
                var data = null;
                if (queueExists(queueId)) {
                    data = getQueue(queueId).data;
                    clearQueue(queueId);
                }
                return data;
            }

            /**
             * Adds an item to a specific queue. Updates the queue size with the serialized value of the data.
             * @function
             * @name queueService-queueManager.push
             * @param  {String} queueId The id of the queue to which the item should be added.
             * @param  {Object} data    The message object which should be stored in the queue.
             * @return {Number}         Returns the current length of the queue.
             */
            function pushToQueue(queueId, data) {
                var queue = null,
                    dataStr = null,
                    bridgeAndroid = window.tlBridge,
                    bridgeiOS = window.iOSJSONShuttle;

                // Sanity check
                try {
                    dataStr = sS.serialize(data);
                } catch (e) {
                    dataStr = "Serialization failed: " + (e.name ? e.name + " - " : "") + e.message;
                    data = {
                        error: dataStr
                    };
                }

                // Send to Native Android Bridge
                if ((typeof bridgeAndroid !== "undefined") &&
                        (typeof bridgeAndroid.addMessage === "function")) {
                    bridgeAndroid.addMessage(dataStr);
                // Send to Native iOS Bridge
                } else if ((typeof bridgeiOS !== "undefined") &&
                        (typeof bridgeiOS === "function")) {
                    bridgeiOS(dataStr);
                // Send to normal library queue
                } else {
                    if (queueExists(queueId)) {
                        queue = getQueue(queueId);
                        queue.data.push(data);
                        /* Redirect the queue so any registered callback function
                         * can optionally modify it.
                         */
                        queue.data = core.redirectQueue(queue.data);

                        // Only measure and update the queue size if a non-zero sizeThreshold is set
                        if (queue.sizeThreshold) {
                            // Update the size of the queue with the length of the serialized data.
                            dataStr = sS.serialize(queue.data);
                            queue.size = dataStr.length;
                        }

                        // Return the number of entries in the queue (length)
                        return queue.data.length;
                    }
                }
                return 0;
            }

            /**
             * @scope queueManager
             */
            return {
                exists: queueExists,
                add: addQueue,
                remove: removeQueue,
                reset: function () {
                    // Delete all queues
                    queues = {};
                },
                get: getQueue,
                clear: clearQueue,
                flush: flushQueue,
                push: pushToQueue
            };

        }());


    /**
     * Handles the xhr response of the server call.
     * @function
     * @private
     * @name queueService-handleXhrCallback
     */
    function handleXhrCallback(result) {
        if (isSerializedPost) {
            isLastPostComplete = true;
        }

        if (result && result.id) {
            // Diagnostic logging
            utils.extend(true, xhrLog[result.id - 1], {
                rspEnd: mS.getCurrentOffset(),
                success: result.success,
                statusCode: result.statusCode,
                statusText: result.statusText
            });
        }
    }

    /**
     * Get the URL path.
     * @addon
     */
    function getUrlPath() {
        var urlInfo = utils.getOriginAndPath(window.location);
        return core.normalizeUrl("", urlInfo.path);
    }

    /**
     * Adds a HTTP header (name,value) pair to the specified queue.
     * @function
     * @private
     * @name queueService-addHeaderToQueue
     * @param  {String} queueId The id of the queue which should be flushed.
     * @param  {String} headerName The name of the header to be added.
     * @param  {String} headerValue The value of the header to be added.
     * @param  {Boolean} [recurring] Flag specifying if header should be sent
     *                   once (false) or always (true). Default behavior is to
     *                   send the header once.
     */
    function addHeaderToQueue(queueId, headerName, headerValue, recurring) {
        var queue = queueManager.get(queueId),
            header = {
                name: headerName,
                value: headerValue
            },
            qHeadersList = null;

        // Sanity check
        if (typeof headerName !== "string" || typeof headerValue !== "string") {
            return;
        }

        if (!queue.headers) {
            // TODO: Add prototype functions to help add/copy/remove headers
            queue.headers = {
                once: [],
                always: []
            };
        }

        qHeadersList = !!recurring ? queue.headers.always : queue.headers.once;
        qHeadersList.push(header);
    }

    /**
     * Copies HTTP headers {name,value} from the specified queue to an
     * object.
     * @function
     * @private
     * @name queueService-copyHeaders
     * @param  {String} queueId The id of the queue whose headers are copied.
     * @param  {Object} [headerObj] The object to which headers are added. If no
     * object is specified then a new one is created.
     * @return {Object} The object containing the copied headers.
     */
    function copyHeaders(queueId, headerObj) {
        var i,
            len,
            queue = queueManager.get(queueId),
            qHeaders = queue.headers,
            headersList = null;

        headerObj = headerObj || {};

        function copy(l, o) {
            var j,
                listLen,
                header = null;

            for (j = 0, listLen = l.length; j < listLen; j += 1) {
                header = l[j];
                o[header.name] = header.value;
            }
        }

        if (qHeaders) {
            headersList = [qHeaders.always, qHeaders.once];

            for (i = 0, len = headersList.length; i < len; i += 1) {
                copy(headersList[i], headerObj);
            }
        }

        return headerObj;
    }

    /**
     * Clear HTTP headers {name,value} from the specified queue. Only headers
     * that are to be sent once are cleared.
     * @function
     * @private
     * @name queueService-clearHeaders
     * @param  {String} queueId The id of the queue whose headers are cleared.
     */
    function clearHeaders(queueId) {
        var queue = null,
            qHeaders = null;

        if (!queueManager.exists(queueId)) {
            throw new Error("Queue: " + queueId + " does not exist!");
        }

        queue = queueManager.get(queueId);
        qHeaders = queue ? queue.headers : null;
        if (qHeaders) {
            // Only reset headers that are sent once.
            qHeaders.once = [];
        }
    }

    /**
     * Invoke the core function to get any HTTP request headers from
     * external scripts and add these headers to the default queue.
     * @function
     * @private
     * @returns The number of external headers added to the queue.
     */
    function getExternalRequestHeaders() {
        var i = 0,
            len,
            header,
            headers = core.provideRequestHeaders();

        if (headers && headers.length) {
            for (i = 0, len = headers.length; i < len; i += 1) {
                header = headers[i];
                addHeaderToQueue("DEFAULT", header.name, header.value, header.recurring);
            }
        }
        return i;
    }

    /**
     * Takes the messages array and extracts the unique message types
     * which are returned as a comma separated list.
     * @function
     * @private
     * @param {Array} data An array of message objects with the "type" property.
     * @returns {String} CSV representing the different message types.
     */
    function getMessageTypes(data) {
        var i,
            len,
            types = [],
            typesString = "";

        // Sanity check
        if (!data || !data.length) {
            return typesString;
        }

        // Scan the messages and note the detected type values
        for (i = 0, len = data.length; i < len; i += 1) {
            types[data[i].type] = true;
        }

        // Translate the detected type values to a CSV string
        for (i = 0, len = types.length; i < len; i += 1) {
            if (types[i]) {
                if (typesString) {
                    typesString += ",";
                }
                typesString += i;
            }
        }

        return typesString;
    }

    /**
     * Clears a specific queue and sends its serialized content to the server.
     * @function
     * @private
     * @name queueService-flushQueue
     * @param  {String} queueId The id of the queue to be flushed.
     */
    function flushQueue(queueId, sync) {
        const queue = queueManager.get(queueId)

        if (!queue) {
            return;
        }

        var data = queue.url ? queueManager.flush(queueId) : null,
            count = data ? data.length : 0,
            httpHeaders = {
                "Content-Type": "application/json",
                "X-PageId": core.getPageId(),
                "X-Tealeaf": "device (UIC) Lib/6.4.40",
                "X-TealeafType": "GUI",
                "X-TeaLeaf-Page-Url": getUrlPath(),
                "X-Tealeaf-SyncXHR": (!!sync).toString()
            },
            messageId = null,
            currOffset = mS.getCurrentOffset(),
            serializer = queue.serializer || "json",
            contentEncoder = queue.encoder,
            requestData,
            retObj,
            timeDiff,
            tltWorker = CONFIG.tltWorker,
            unloading = core.getState() === "unloading",
            pageOrigin = utils.getOriginAndPath().origin,
            crossOriginRequest = core.isCrossOrigin(queue.url, pageOrigin),
            workerMsg,
            xdomainFrameWindow = null;

        if (!count || !queue) {
            return;
        }

        // Safety check to ensure the data to be sent is not stale beyond the inactivity timeout
        timeDiff = currOffset - data[count - 1].offset;
        if (inactivityTimeout && timeDiff > (inactivityTimeout + 60000)) {
            return;
        }

        isLastPostComplete = false;

        queue.lastOffset = data[count - 1].offset;

        // Summarize all the message types in the data
        httpHeaders["X-Tealeaf-MessageTypes"] = getMessageTypes(data);

        // Wrap the messages with the header
        data = mS.wrapMessages(data);

        // Set the XHR message id to the same as the serialNumber of this message
        messageId = data.serialNumber;

            // Diagnostic logging
            xhrLog[messageId - 1] = {
                serialNumber: messageId,
                reqStart: currOffset
            };

        // Checks if XHR Logging is enabled
        if (xhrLogging) {
            // Send the xhr log as part of the message
            data.log = {
                requests: xhrLog
            };
        }

        // Log if endpoint check failed
        if (CONFIG.endpointCheckFailed) {
            data.log.endpointCheckFailed = true;
        }

        getExternalRequestHeaders();
        copyHeaders(queueId, httpHeaders);

        // Check if the TLT Web Worker is available and we are not trying to make a sync request or unloading
        if (tltWorker && !(sync || unloading)) {
            tltWorker.onmessage = function (event) {
                var result;
                result = event.data;
                // XHR Logging update
                handleXhrCallback(result);
            };
            workerMsg = {
                id: messageId,
                url: queue.url,
                headers: httpHeaders,
                data: data,
                isUnloading: unloading,
                isCrossOrigin: crossOriginRequest
            };
            tltWorker.postMessage(workerMsg);
        } else {
            // Serialize the data
            if (serializer) {
                data = sS.serialize(data, serializer);
            }

            // Encode if specified
            if (contentEncoder) {
                retObj = eS.encode(data, contentEncoder);
                if (retObj) {
                    if (retObj.data && !retObj.error) {
                        if (!(retObj.data instanceof window.ArrayBuffer)) {
                            retObj.error = "Encoder did not apply " + contentEncoder + " encoding.";
                        } else {
                            if (retObj.data.byteLength < data.length) {
                                data = retObj.data;
                                httpHeaders["Content-Encoding"] = retObj.encoding;
                            } else {
                                // Encoder succeeded but resulting size was the same or greater than original payload
                                retObj.error = contentEncoder + " encoder did not reduce payload (" + retObj.data.byteLength + ") compared to original data (" + data.length + ")";
                            }
                        }
                    }

                    // Log encoder error as an exception message
                    if (retObj.error) {
                        core.logExceptionEvent("EncoderError: " + retObj.error, "UIC", -1);
                    }
                }
            }

            if (queue.crossDomainEnabled) {
                xdomainFrameWindow = utils.getIFrameWindow(queue.crossDomainIFrame);
                if (!xdomainFrameWindow) {
                    return;
                }
                requestData = {
                    request: {
                        id: messageId,
                        url: queue.url,
                        async: !sync,
                        headers: httpHeaders,
                        data: data
                    }
                };

                if (typeof window.postMessage === "function") {
                    xdomainFrameWindow.postMessage(requestData, queue.crossDomainIFrame.src);
                } else {
                    try {
                        xdomainFrameWindow.sendMessage(requestData);
                    } catch (e) {
                        return;
                    }
                }
                isLastPostComplete = true;
            } else {
                aS.sendRequest({
                    id: messageId,
                    oncomplete: handleXhrCallback,
                    url: queue.url,
                    async: !sync,
                    isUnloading: unloading,
                    isCrossOrigin: crossOriginRequest,
                    headers: httpHeaders,
                    data: data
                });
            }
        }
        clearHeaders(queueId);
    }

    /**
     * Iterates over all queues and sends their contents to the servers.
     * @function
     * @private
     * @name queueServive-flushAll
     */
    function flushAll(sync) {
        var conf = null,
            queues = CONFIG.queues,
            i;
        for (i = 0; i < queues.length; i += 1) {
            conf = queues[i];
            flushQueue(conf.qid, sync);
        }
        return true;
    }


    /**
     * Adds a message event to the specified queue.
     * If the queue threshold is reached the queue gets flushed.
     * @function
     * @private
     * @name queueService-addToQueue
     * @param {String} queueId The id of the queue which should be flushed.
     * @param {Object} data    The message event which should be stored in the queue.
     */
    function addToQueue(queueId, data) {
        var currWebEvent,
            len,
            msg = mS.createMessage(data),
            queue = queueManager.get(queueId),
            size,
            timeDiff;

        // Safety check to ensure the data to be added is not stale beyond the inactivity timeout
        len = queue.data.length;
        if (len) {
            timeDiff = msg.offset - queue.data[len - 1].offset;
            if (inactivityTimeout && timeDiff > inactivityTimeout) {
                core.setAutoFlush(false);
                core.destroy(false, "inactivity(2)");
                return;
            }
        }

        len = queueManager.push(queueId, msg);
        size = queue.size;

        // enable serialized post from client
        if (isSerializedPost && !isLastPostComplete) {
            return;
        }

        if ((len >= queue.eventThreshold || size >= queue.sizeThreshold) &&
                autoFlushing && core.getState() !== "unloading") {
            currWebEvent = core.getCurrentWebEvent();
            if (currWebEvent.type === "click" && !CONFIG.ddfoc) {
                // set the timer if a delayed flush has not already been scheduled
                if (delayFlushOnClick) {
                    delayFlushOnClick = false;
                    window.setTimeout(function () {
                        if (queueManager.exists(queueId)) {
                            flushQueue(queueId);
                            delayFlushOnClick = true;
                        }
                    }, 500);
                }
            } else {
                flushQueue(queueId);
            }
        }
    }

    function isMsgLimitReached(e) {
        var counter,
            retVal = false;

        // Sanity check
        if (!e || !e.type) {
            return true;
        }

        counter = msgCounter[e.type];
        if (counter) {
            counter.count += 1;
            if (counter.count > counter.limit) {
                retVal = true;
                if (counter.count === counter.limit + 1) {
                    // Log a message when limit is exceeded for the first time.
                    addToQueue("DEFAULT", {
                        type: 16,
                        dataLimit: {
                            messageType: e.type,
                            maxCount: counter.limit
                        }
                    });
                }
            }
        }

        return retVal;
    }

    /**
     * Returns the queue id for the queue which is responsible for the given module.
     * @function
     * @private
     * @name queueService-getQueueId
     * @param  {String} moduleName The name of the module for which the id should get looked up.
     * @return {String}            Returns the queue id for the corresponding queue or the default queue id.
     */
    function getQueueId(moduleName) {
        var i, j,
            conf = null,
            queues = CONFIG.queues,
            module = "",
            qLen,
            modulesLen;

        for (i = 0, qLen = queues.length; i < qLen; i += 1) {
            conf = queues[i];
            if (conf && conf.modules) {
                for (j = 0, modulesLen = conf.modules.length; j < modulesLen; j += 1) {
                    module = conf.modules[j];
                    if (module === moduleName) {
                        return conf.qid;
                    }
                }
            }
        }
        return defaultQueue.qid;
    }


    function setFlushTimer(qid, interval) {
        queueTimers[qid] = window.setTimeout(function tick() {
            if (autoFlushing && (!isSerializedPost || (isSerializedPost && isLastPostComplete))) {
                flushQueue(qid);
            }
            queueTimers[qid] = window.setTimeout(tick, interval);
        }, interval);
    }

    function clearFlushTimer(qid) {
        var cleared = false;

        if (qid && queueTimers[qid]) {
            window.clearTimeout(queueTimers[qid]);
            delete queueTimers[qid];
            cleared = true;
        }
        return cleared;
    }

    function clearAllFlushTimers() {
        var key = 0;

        for (key in queueTimers) {
            if (queueTimers.hasOwnProperty(key)) {
                clearFlushTimer(key);
            }
        }

        queueTimers = {};
    }

    function resetFlushTimer(qid) {
        var queue;

        if (!qid) {
            return;
        }

        if (clearFlushTimer(qid)) {
            queue = queueManager.get(qid);
            if (queue.timerInterval) {
                setFlushTimer(qid, queue.timerInterval);
            }
        }
    }

    /**
     * Handles the configupdated event from the configService and reinitialize all queues.
     * @function
     * @private
     * @name queueService-handleConfigUpdated
     * @param  {Object} newConf The new configuration object diff.
     */
    function handleConfigUpdated(newConf) {
        // TODO: merge config
    }



    /**
     * Sets up all the needed queues and event handlers and start the queueTick.
     * @function
     * @private
     * @param  {Object} config The queueService configuration object.
     */
    function initQueueService(config) {
        CONFIG = config;
        coreConfig = core.getCoreConfig();
        inactivityTimeout = utils.getValue(coreConfig, "inactivityTimeout", 600000);
        isSerializedPost = utils.getValue(CONFIG, "serializePost", true);

        utils.forEach(CONFIG.queues, function (conf, i) {
            var crossDomainIFrame = null;
            if (conf.qid === "DEFAULT") {
                defaultQueue = conf;
            }
            if (conf.crossDomainEnabled) {
                crossDomainIFrame = bS.query(conf.crossDomainFrameSelector);
                if (!crossDomainIFrame) {
                    core.fail("Cross domain iframe not found");
                }
            }

            queueManager.add(conf.qid, {
                url: conf.endpoint,
                eventThreshold: conf.maxEvents,
                sizeThreshold: conf.maxSize || 0,
                serializer: conf.serializer,
                encoder: conf.encoder,
                timerInterval: conf.timerInterval || 0,
                crossDomainEnabled: conf.crossDomainEnabled || false,
                crossDomainIFrame: crossDomainIFrame
            });

            if (typeof conf.timerInterval !== "undefined" && conf.timerInterval > 0) {
                setFlushTimer(conf.qid, conf.timerInterval);
            }
        });

        cS.subscribe("configupdated", handleConfigUpdated);

        isInitialized = true;
    }

    function destroy() {
        if (autoFlushing) {
            flushAll(!CONFIG.asyncReqOnUnload);
        }
        cS.unsubscribe("configupdated", handleConfigUpdated);

        clearAllFlushTimers();
        queueManager.reset();

        CONFIG = null;
        defaultQueue = null;
        isInitialized = false;
    }

    /**
     * @scope queueService
     */
    return {
        init: function () {
            if (!isInitialized) {
                initQueueService(cS.getServiceConfig("queue") || {});
            } else {
            }
        },

        /**
         * Get's called when the core shut's down.
         * Clean up everything.
         */
        destroy: function () {
            destroy();
        },

        // TODO: Need to expose for selenium functional tests
        _getQueue: function (qid) { return queueManager.get(qid).data; },


        /**
         * Enables/disables automatic flushing of queues so that the application
         * could decide on their own when to flush by calling flushAll.
         * @param {Boolean} flag Could be either true or false to enable or disable
         *                  auto flushing respectively.
         */
        setAutoFlush: function (flag) {
            if (flag === true) {
                autoFlushing = true;
            } else {
                autoFlushing = false;
            }
        },

        /**
         * Forces a particular queue to be flushed, sending its information to the server.
         * @param  {String} queueId The ID of the queue to be flushed.
         */
        flush: function (queueId) {
            queueId = queueId || defaultQueue.qid;
            if (!queueManager.exists(queueId)) {
                throw new Error("Queue: " + queueId + " does not exist!");
            }
            flushQueue(queueId);
        },

        /**
         * Forces all queues to be flushed, sending all queue information to the server.
         */
        flushAll: function (sync) {
            return flushAll(!!sync);
        },

        /**
         * Send event information to the module's default queue.
         * This doesn't necessarily force the event data to be sent to the server,
         * as this behavior is defined by the queue itself.
         * @param  {String} moduleName The name of the module saving the event.
         * @param  {Object} queueEvent The event information to be saved to the queue.
         * @param  {String} [queueId]    Specifies the ID of the queue to receive the event.
         */
        post: function (moduleName, queueEvent, queueId) {
            if (!core.isInitialized()) {
                return;
            }

            queueId = queueId || getQueueId(moduleName);

            if (!queueManager.exists(queueId)) {
                return;
            }
            if (!isMsgLimitReached(queueEvent)) {
                addToQueue(queueId, queueEvent);
            }
        },

        /**
         * Resets the flush timer of the specified queue.
         * @param {String} queueId The ID of the queue
         */
        resetFlushTimer: function (queueId) {
            queueId = queueId || defaultQueue.qid;
            if (!queueManager.exists(queueId)) {
                return;
            }
            resetFlushTimer(queueId);
        },

        /**
         * Enables/disables XHR Logging
         */
        setXHRLog: function () {
          xhrLogging = !xhrLogging;
        }
    };
});


/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview The browserService implements some low-level methods for
 * modifying / accessing the DOM.
 * @exports browserService
 */

/*global TLT, XPathResult, document, ActiveXObject */

/**
 * @name browserService
 * @namespace
 */
TLT.addService("browserBase", function (core) {
    "use strict";

    var customEventList,
        utils = core.utils,
        nonClickableTags = {
            optgroup: true,
            option: true,
            nobr: true
        },
        queryDom = {},
        configService,
        serializerService = null,
        config,
        blacklist,
        customid,
        normalizeTargetToParentLink,
        attributesToBeLoggedList,
        getXPathListFromNode,
        isInitialized = false,
        MAX_ATTRIBUTES = 5,
        MAX_ATTRIBUTE_VALUE_LENGTH = 60;

    function updateConfig() {
        configService = core.getService("config");
        serializerService = core.getService("serializer");
        // Need to check for configService in unit testing scenario
        config = configService ? configService.getServiceConfig("browser") : {};
        blacklist = config.blacklist || [];
        customid = config.customid || [];
        normalizeTargetToParentLink = utils.getValue(config, "normalizeTargetToParentLink", true);
        // Optional additional attributes to be logged
        attributesToBeLoggedList = utils.getValue(config, "logAttributes", []);
    }

    function initBrowserBase() {
        updateConfig();
        if (configService) {
            // Need to check for configService in unit testing scenario
            configService.subscribe("configupdated", updateConfig);
        }
        isInitialized = true;
    }

    function destroy() {
        if (configService) {
            // Need to check for configService in unit testing scenario
            configService.unsubscribe("configupdated", updateConfig);
        }
        isInitialized = false;
    }

    /**
     * Returns an object containing the element attributes to be logged.
     * Limits the number of attributes up to MAX_ATTRIBUTES.
     * Limits the length of each attribute value up to MAX_ATTRIBUTE_VALUE_LENGTH.
     * @function
     * @param {DOMElement} target The target element whose attributes need to be logged.
     * @return {Object} An object containing the attributes of the target element.
     */
    function getAttributesToBeLogged(target) {
        var i, len,
            attrName,
            attrVal,
            attrCount,
            attributes = {};

        // Sanity check
        if (!target || !target.hasAttribute) {
            return attributes;
        }

        // Log upto MAX_ATTRIBUTES attributes.
        for (i = 0, len = attributesToBeLoggedList.length, attrCount = 0; i < len && attrCount < MAX_ATTRIBUTES; i += 1) {
            attrName = attributesToBeLoggedList[i];
            if (target.hasAttribute(attrName)) {
                attrVal = target.getAttribute(attrName) || "";
                attributes[attrName] = attrVal.slice(0, MAX_ATTRIBUTE_VALUE_LENGTH);
                attrCount += 1;
            }
        }

        return attributes;
    }

    function checkId(node, oldId) {
        var i,
            len,
            nodeId;

        // Sanity check
        if (!node) {
            return null;
        }

        if (typeof oldId !== "undefined") {
            // Check the oldId instead of the node's current id.
            nodeId = oldId;
        } else {
            nodeId = node.id;
        }

        if (!nodeId || typeof nodeId !== "string") {
            return null;
        }

        for (i = 0, len = blacklist.length; i < len; i += 1) {
            if (typeof blacklist[i] === "string") {
                if (nodeId === blacklist[i]) {
                    return null;
                }
            } else if (typeof blacklist[i] === "object") {
                // Cache the RegExp object
                if (!blacklist[i].cRegex) {
                    blacklist[i].cRegex = new RegExp(blacklist[i].regex, blacklist[i].flags);
                }
                // Reset and test
                blacklist[i].cRegex.lastIndex = 0;
                if (blacklist[i].cRegex.test(nodeId)) {
                    return null;
                }
            }
        }
        return nodeId;
    }

    function getEventType(event, target) {
        var returnObj = {
                type: null,
                // Event subtype is not used in the UIC
                subType: null
            },
            type;

        // Sanity check
        if (!event) {
            return returnObj;
        }

        // Normalize event type for jQuery events focusin, focusout
        type = event.type;
        switch (type) {
        case "focusin":
            type = "focus";
            break;
        case "focusout":
            type = "blur";
            break;
        default:
            break;
        }
        returnObj.type = type;

        return returnObj;
    }

    /**
     * Examines the type and subType of the target.
     * @function
     * @name browserService-getElementType
     * @param  {Object} element The normalized target element.
     * @return {Object} Returns an object which contains the type and subType of the target element.
     */
    function getElementType(element) {
        var returnObj = {
                type: null,
                subType: null
            };

        // Sanity check
        if (!element) {
            return returnObj;
        }

        returnObj.type = utils.getTagName(element);
        returnObj.subType = element.type || null;

        return returnObj;
    }

    /**
     * Returns an element by it's id and idType where id could be either an HTML id,
     *     attribute ID or XPath selector.
     * @param  {String} selector The selector. Either a single HTML ID or an attribute ID
     *                  example: "myid=customid" or a tealeaf XPath string.
     * @param  {Number} type     A number, indicating the type of the query
     *                           as in the object 'idTypes' below.
     *                           -1 for HTML ID, -2 for XPath and -3 for attribute ID.
     * @return {Object}          Returns the node, if found. Otherwise null.
     */
    function getNodeFromID(selector, type, scope) {
        var idTypes = {
                HTML_ID: "-1",
                XPATH_ID: "-2",
                ATTRIBUTE_ID: "-3"
            },
            doc,
            node = null,
            parts;

        // Sanity check
        if (!selector || !type) {
            return node;
        }

        doc = scope || window.document;
        type = type.toString();
        if (type == idTypes.HTML_ID) {
            if (doc.getElementById) {
                node = doc.getElementById(selector);
            } else if (doc.querySelector) {
                node = doc.querySelector("#" + selector);
            }
        } else if (type == idTypes.ATTRIBUTE_ID) {
            parts = selector.split("=");
            if (doc.querySelector) {
                node = doc.querySelector("[" + parts[0] + "=\"" + parts[1] + "\"]");
            }
        } else if (type == idTypes.XPATH_ID) {
            node = queryDom.xpath(selector, doc);
        }
        return node;
    }

    /**
     * Generates an XPath for a given node
     * @function
     */
    getXPathListFromNode = (function () {

        var specialChildNodes = {
                "nobr": true
            };

        /**
         * Returns Xpath array for a node
         * @private
         * @param {Element} node DOM element
         * @param {Boolean} wantFullPath Return full xpath or truncate at parent with HTML ID.
         * @param {Boolean} notInDocument Indicates if the node is part of a cloned subtree not attached to the document.
         * @param {String} [oldId] Optional id value to be used instead of elements current id.
         * @return {Array} xpath array
         */
        return function (node, wantFullPath, notInDocument, oldId) {
            var j,
                documentElement = document.documentElement,
                nodeId,
                tmpChild = null,
                parentWindow = null,
                parentNode = null,
                xpath = [],
                xpathComponent,
                loop = true,
                localTop = core._getLocalTop(),
                tagName = "",
                setHost = false,
                shadowRoot;

            // Sanity check
            if (!node || !node.nodeType) {
                return xpath;
            }

            // Calculate xpath of the host element for document-fragment nodes.
            if (node.nodeType === 11) {
                node = node.host;
                if (node) {
                    setHost = true;
                } else {
                    return xpath;
                }
            }

            while (loop) {
                // Need to continue the loop incase of elements in frame/iframe and shadow trees.
                loop = false;

                tagName = utils.getTagName(node);
                if (tagName === "window") {
                    continue;
                }

                if (tagName && !setHost) {
                    // Fix to handle tags that are not normally visual elements
                    if (specialChildNodes[tagName]) {
                        node = node.parentNode;
                        loop = true;
                        continue;
                    }
                }

                // Get xpath for node or iframe
                for (nodeId = checkId(node, oldId);
                        node && (node.nodeType === 1 || node.nodeType === 9) && node != document && (wantFullPath || !nodeId);
                        nodeId = checkId(node)) {
                    parentNode = node.parentNode;

                    // If the node has no parent, check if it is a frame element
                    if (!parentNode) {
                        parentWindow = utils.getWindow(node);
                        if (!parentWindow || notInDocument) {
                            // node is not attached to any window
                            xpathComponent = [tagName, 0];
                            xpath[xpath.length] = xpathComponent;
                            return xpath.reverse();
                        }
                        if (parentWindow === localTop) {
                            // node is attached to top window but doesn't have a parent.
                            return xpath.reverse();
                        }
                        // node is a frame/iframe
                        node = parentWindow.frameElement;
                        tagName = utils.getTagName(node);
                        parentNode = node.parentNode;
                        continue;
                    }

                    tmpChild = parentNode.firstChild;
                    // Sanity check: Parent has no children?
                    if (!tmpChild) {
                        xpath.push(["XPath Error(1)"]);
                        node = null;
                        break;
                    }

                    // Calculate the index of the node amongst its siblings
                    for (j = 0; tmpChild; tmpChild = tmpChild.nextSibling) {
                        if (tmpChild.nodeType === 1 && utils.getTagName(tmpChild) === tagName) {
                            if (tmpChild === node) {
                                xpathComponent = [tagName, j];
                                if (setHost) {
                                    xpathComponent.push("h");
                                    setHost = false;
                                }
                                xpath[xpath.length] = xpathComponent;
                                break;
                            }
                            j += 1;
                        }
                    }

                    if (parentNode.nodeType === 11) {
                        node = parentNode.host;
                        setHost = true;
                    } else {
                        node = parentNode;
                    }

                    tagName = utils.getTagName(node);
                }

                if (nodeId && !wantFullPath) {
                    xpathComponent = [nodeId];
                    if (setHost) {
                        xpathComponent.push("h");
                        setHost = false;
                    }
                    xpath[xpath.length] = xpathComponent;
                    // For elements within a frame/iframe continue the loop after resetting node to the frame element in the parent DOM
                    if (utils.isIFrameDescendant(node)) {
                        loop = true;
                        node = utils.getWindow(node).frameElement;
                    } else if (!notInDocument && !documentElement.contains(node)) {
                        // The node is not inside the document, check if it could be in Shadow DOM
                        if (node.getRootNode) {
                            shadowRoot = node.getRootNode();
                            if (shadowRoot) {
                                // For elements within a Shadow DOM tree, continue the loop after resetting node to the shadow host element.
                                node = shadowRoot.host;
                                setHost = true;
                                loop = true;
                            }
                        }
                    }
                }
                oldId = undefined;
            }

            return xpath.reverse();
        };
    }());

    /**
     *
     */
    function xpathListToString(list) {
        var str = "null";

        // Sanity check
        if (!list || !list.length) {
            return str;
        }

        str = serializerService.serialize(list, "json");

        return str;
    }

    /**
     * Returns the Xpath for a node.
     * @private
     * @param {Element} node DOM element
     * @param {Boolean} [wantFullPath] Return full xpath or truncate at parent with HTML ID.
     * @param {Boolean} [wantObject] Return xpath as a JS object or as a string.
     * @param {Boolean} [notInDocument] Indicates if the node is part of a cloned subtree not attached to the document.
     * @return {String} Returns the xpath of the node.
     */
    function getXPathFromNode(node, wantFullPath, wantObject, notInDocument) {
        var retVal,
            xpath;

        xpath = getXPathListFromNode(node, !!wantFullPath, !!notInDocument);

        if (wantObject) {
            retVal = xpath;
        } else {
            retVal = xpathListToString(xpath);
        }

        return retVal;
    }

    /**
     * Returns the scroll position (left, top) of the document
     * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Window.scrollX
     * @private
     * @param {DOMObject} doc The document object.
     * @return {Object} An object specifying the document's scroll offset position {left, top}
     */
    function getDocScrollPosition(doc) {
        var scrollPos = {
                left: -1,
                top: -1
            },
            docElement;

        doc = doc || document;
        // Get the scrollLeft, scrollTop from documentElement or body.parentNode or body in that order.
        docElement = doc.documentElement || doc.body.parentNode || doc.body;

        // If window.pageXOffset exists, use it. Otherwise fallback to getting the scrollLeft position.
        scrollPos.left = Math.round((typeof window.pageXOffset === "number") ? window.pageXOffset : docElement.scrollLeft);
        scrollPos.top = Math.round((typeof window.pageYOffset === "number") ? window.pageYOffset : docElement.scrollTop);

        return scrollPos;
    }

    /**
     * Returns true if an event is a jQuery event wrpper object.
     * @private
     * @param {UIEvent} event Browser event to examine
     * @return {boolean} true if given event is jQuery event
     */
    function isJQueryEvent(event) {
        return event && typeof event.originalEvent !== "undefined" &&
            typeof event.isDefaultPrevented !== "undefined"  &&
            !event.isSimulated;
    }


    /**
     * Looks for event details. Usually it returns an event itself, but for touch events
     * function returns an element from one of the touch arrays.
     * @private
     * @param {UIEvent} event Browser event. If skipped function will look for window.event
     * @return {UIEvent} latest touch details for touch event or original event object
     *          for all other cases
     */
    function getEventDetails(event) {
        if (!event) {
            return null;
        }
        if (event.type && event.type.indexOf("touch") === 0) {
            if (isJQueryEvent(event)) {
                event = event.originalEvent;
            }
            if (event.type === "touchstart") {
                event = event.touches[event.touches.length - 1];
            } else if (event.type === "touchend") {
                event = event.changedTouches[0];
            }
        }
        return event;
    }


    /**
     * Normalizes the event object for InternetExplorer older than 9.
     * @return {HttpEvent} normalized event object
     */
    function normalizeEvent(event) {
        var e = event || window.event,
            eventPath,
            doc = document.documentElement,
            body = document.body,
            found = false,
            foundElement = null,
            tagName,
            i;

        // skip jQuery event wrapper
        if (isJQueryEvent(e)) {
            e = e.originalEvent;
        }

        // IE case
        if (typeof event === 'undefined' || typeof e.target === 'undefined') {
            e.target = e.srcElement || window.window;
            e.timeStamp = Number(new Date());
            if (e.pageX === null || typeof e.pageX === "undefined") {
                e.pageX = e.clientX + ((doc && doc.scrollLeft) || (body && body.scrollLeft) || 0) -
                    ((doc && doc.clientLeft) || (body && body.clientLeft) || 0);
                e.pageY = e.clientY + ((doc && doc.scrollTop)  || (body && body.scrollTop)  || 0) -
                    ((doc && doc.clientTop)  || (body && body.clientTop)  || 0);
            }
            e.preventDefault = function () {
                this.returnValue = false;
            };
            e.stopPropagation = function () {
                this.cancelBubble = true;
            };
        }

        // ???: Chrome case getting blur for inner elements sending click
        if (e.type === "click") {
            eventPath = e.composedPath ? e.composedPath() : [];
            for (i = 0; i < eventPath.length; i += 1) {
                tagName = utils.getTagName(eventPath[i]);
                if (tagName === "button") {
                    found = true;
                    foundElement = eventPath[i];
                    break;
                }
            }
            if (found) {
                return {
                    originalEvent: e,
                    target: foundElement,
                    srcElement: foundElement,
                    type: e.type,
                    pageX: e.pageX,
                    pageY: e.pageY
                };
            }
        }

        return e;
    }

    /**
     * Normalizes target element. In case of touch event the target is considered to be an
     * element on which the last touch action took place.
     * @private
     * @param {UIEvent} event browser event
     * @return {Element} Normalized target element
     */
    function normalizeTarget(event) {
        var i, len,
            eventPath,
            target = null;

        // Sanity check
        if (!event || !event.type) {
            return null;
        }

        // Special handling for touchXXX events
        if (event.type.indexOf("touch") === 0) {
            target = getEventDetails(event).target;
        } else if (typeof event.composedPath === "function") {
            // Event.composedPath() returns the full path including shadow trees (if any)
            eventPath = event.composedPath();
            if (eventPath && eventPath.length) {
                target = eventPath[0];
                if (normalizeTargetToParentLink) {
                    // Switch target to the link element in the path (if any)
                    for (i = 0, len = eventPath.length; i < len; i += 1) {
                        if (utils.getTagName(eventPath[i]) === "a") {
                            target = eventPath[i];
                            break;
                        }
                    }
                }
            } else {
                target = event.target || window.window;
            }
        } else if (event.srcElement) {
            // IE
            target = event.srcElement;
        } else {
            // W3C
            target = event.target;
        }

        while (target && nonClickableTags[utils.getTagName(target)]) {
            if (target.parentElement) {
                target = target.parentElement;
            } else {
                break;
            }
        }

        // If target is a document then retarget to its documentElement
        if (target.nodeType === 9 && target.documentElement) {
            target = target.documentElement;
        }

        return target;
    }


    /**
     * Returns event position independently to the event type.
     * In case of touch event the position of last action will be returned.
     * @private
     * @param {UIEvent} event Browser event
     * @return {Object} object containing x and y properties
     */
    function getEventPosition(event) {
        var posX = 0,
            posY = 0,
            doc = document.documentElement,
            body = document.body;

        event = getEventDetails(event);

        if (event) {
            if (event.pageX || event.pageY) {
                posX = event.pageX;
                posY = event.pageY;
            } else if (event.clientX || event.clientY) {
                posX = event.clientX + (doc ? doc.scrollLeft : (body ? body.scrollLeft : 0)) -
                                       (doc ? doc.clientLeft : (body ? body.clientLeft : 0));
                posY = event.clientY + (doc ? doc.scrollTop : (body ? body.scrollTop : 0)) -
                                       (doc ? doc.clientTop : (body ? body.clientTop : 0));
            }
        }

        return {
            x: posX,
            y: posY
        };
    }

    /**
     * Find one or more elements using a XPath selector.
     * @function
     * @name browserService-queryDom.xpath
     * @param  {String} query The XPath query to search for.
     * @param  {Object} [scope="document"] The DOM subtree to run the query in.
     * @return {Object}       Returns the DOM element matching the XPath.
     */
    queryDom.xpath = function (query, scope) {
        var xpath = null,
            elem,
            pathElem = null,
            pathElemIsHost = false,
            tagName,
            i,
            j,
            k,
            len,
            jlen;

        // Sanity check
        if (!query) {
            return null;
        }

        xpath = serializerService.parse(query);
        scope = scope || document;
        elem = scope;

        if (!xpath) {
            return null;
        }

        for (i = 0, len = xpath.length; i < len && elem; i += 1) {
            pathElem = xpath[i];
            pathElemIsHost = pathElem.length > 1 && pathElem[pathElem.length - 1] === "h";
            if (pathElem.length === 1 || (pathElem.length === 2 && pathElemIsHost)) {
                // HTML ID component
                if (scope.getElementById) {
                    elem = scope.getElementById(pathElem[0]);
                } else if (scope.querySelector) {
                    elem = scope.querySelector("#" + pathElem[0]);
                } else {
                    elem = null;
                }
            } else {
                // Search in children
                for (j = 0, k = -1, jlen = elem.childNodes.length; j < jlen; j += 1) {
                    if (elem.childNodes[j].nodeType === 1 && utils.getTagName(elem.childNodes[j]) === pathElem[0].toLowerCase()) {
                        k += 1;
                        if (k === pathElem[1]) {
                            elem = elem.childNodes[j];
                            break;
                        }
                    }
                }
                if (k !== pathElem[1]) {
                    return null;
                }
            }

            if (!elem) {
                return null;
            }

            if (pathElemIsHost) {
                if (i < len - 1) {
                    if (!elem.shadowRoot) {
                        return null;
                    }
                    elem = elem.shadowRoot;
                    // The scope for the subsequent xpath changes to that of the shadow root document fragment.
                    scope = elem;
                }
            }

            // If elem is a frame or iframe and is not the last component of the xpath, then point to it's document element for further traversal.
            tagName = utils.getTagName(elem);
            if ((tagName === "frame" || tagName === "iframe") && i < len - 1) {
                elem = utils.getIFrameWindow(elem).document;
                // The scope for the subsequent xpath also changes to that of the frame/iframe document.
                scope = elem;
            }
        }

        return (elem === scope || !elem) ? null : elem;
    };


    /**
     * The Point interface represents a point on the page to
     *     x- and y-coordinates.
     * @constructor
     * @private
     * @name browserService-Point
     * @param {Integer} x The x-coordinate of the point.
     * @param {Integer} y The y-coordinate of the point.
     */
    function Point(x, y) {
        this.x = Math.round(x || 0);
        this.y = Math.round(y || 0);
    }


    /**
     * The Size  interface represents the width and height of an element
     *     on the page.
     * @constructor
     * @private
     * @name browserService-Size
     * @param {Integer} width  Width of the element that received the event.
     * @param {Integer} height Height of the element that received the event.
     */
    function Size(width, height) {
        this.width = Math.round(width || 0);
        this.height = Math.round(height || 0);
    }


    /**
     * The ElementData interface represents a normalized browser event object.
     * @constructor
     * @private
     * @name browserService-ElementData
     * @param {Object} event  The browser event.
     * @param {Object} target The HTML element which received the event.
     */
    function ElementData(event, target) {
        var id,
            accessibilityId,
            elementType,
            pos;

        target = normalizeTarget(event);
        id = this.examineID(target);
        elementType = getElementType(target);
        pos = this.examinePosition(event, target);
        accessibilityId = target && target.getAttribute ? target.getAttribute("aria-label") : null;
        if (accessibilityId) {
            this.accessibility = {
                id: accessibilityId
            };
        }

        this.attributes = getAttributesToBeLogged(target);
        // innerText is logged by default
        if (target && target.innerText) {
            this.attributes.innerText = utils.trim(target.innerText).slice(0, MAX_ATTRIBUTE_VALUE_LENGTH);
        }

        this.element = target;
        this.id = id.id;
        this.idType = id.idType;
        this.type = elementType.type;
        this.subType = elementType.subType;
        this.state = this.examineState(target);
        this.position = new Point(pos.x, pos.y);
        this.position.relXY = pos.relXY;
        this.size = new Size(pos.width, pos.height);
        this.xPath = id.xPath;
        this.name = id.name;
    }

    /**#@+
     * @constant
     * @enum {Number}
     * @fieldOf browserService-ElementData
     */
    ElementData.HTML_ID = -1;
    ElementData.XPATH_ID = -2;
    ElementData.ATTRIBUTE_ID = -3;
    /**#@-*/

    /**
     * Examines how to specify the target element
     *     (either by css selectors or xpath)
     *     and returns an object with the properties id and type.
     * @function
     * @name browserService-ElementData.examineID
     * @param  {Object} target The HTML element which received the event.
     * @param {Boolean} [notInDocument] Indicates if the node is part of a cloned subtree not attached to the document.
     * @return {Object} Returns an object with the properties id and type.
     *      id contains either a css or xpath selector.
     *      type contains a reference to either ElementData.HTML_ID, ElementData.XPATH_ID or ElementData.ATTRIBUTE_ID
     */
    ElementData.prototype.examineID = function (target, notInDocument) {
        var retObj = {
                id: "",
                idType: 0,
                xPath: "",
                name: ""
            },
            i = customid.length,
            attrib,
            contained,
            documentElement = document.documentElement;

        // Sanity check
        if (!target) {
            return retObj;
        }

        retObj.xPath = getXPathFromNode(target, false, false, notInDocument);
        retObj.name = target.name;

        try {
            contained = typeof documentElement.contains === "function" ? documentElement.contains(target) : true;
            // Check if node belongs to a Shadow DOM tree or Frame/Iframe since such nodes always get Xpath IDs
            if ((notInDocument || contained) && (!utils.getWindow(target) || !utils.isIFrameDescendant(target))) {
                if (checkId(target)) {
                    retObj.id = target.id;
                    retObj.idType = ElementData.HTML_ID;
                } else if (customid.length && target.attributes) {
                    while (i) {
                        i -= 1;
                        attrib = target.attributes[customid[i]];
                        if (typeof attrib !== "undefined") {
                            retObj.id = customid[i] + "=" + (attrib.value || attrib);
                            retObj.idType = ElementData.ATTRIBUTE_ID;
                        }
                    }
                }
            }
        } catch (e) { }

        if (!retObj.id) {
            retObj.id = retObj.xPath;
            if (retObj.id !== "null") {
                retObj.idType = ElementData.XPATH_ID;
            }
        }

        return retObj;
    };


    /**
     * Examines the current state of the HTML element if it's an input/ui element.
     * @function
     * @name browserService-ElementData.examineState
     * @param  {Object} target The HTML element which received the event.
     * @return {Object}        Returns an object which contains all properties
     *     to describe the state.
     */
    ElementData.prototype.examineState = function (target) {
        return utils.getTargetState(target);
    };


    /**
     * Gets the current zoom value of the browser with 1 being equivalent to 100%.
     * @function
     * @name getZoomValue
     * @return {int}        Returns zoom value of the browser.
     */
    function getZoomValue() {
        var factor = 1,
            rect,
            physicalW,
            logicalW;

        if (document.body.getBoundingClientRect) {
            // rect is only in physical pixel size in IE before version 8
            // CS-8780: getBoundingClientRect() can throw an exception in certain instances. Observed
            // on IE 9
            try {
                rect = document.body.getBoundingClientRect();
            } catch (e) {
                return factor;
            }
            physicalW = rect.right - rect.left;
            logicalW = document.body.offsetWidth;

            // the zoom level is always an integer percent value
            factor = Math.round((physicalW / logicalW) * 100) / 100;
        }
        return factor;
    }

    /**
     * Gets BoundingClientRect value from a HTML element.
     * @function
     * @name getBoundingClientRectNormalized
     * @param  {Object} element The HTML element.
     * @return {Object} An object with x, y, width, and height.
     */
    function getBoundingClientRectNormalized(element) {
        var rect,
            rectangle,
            zoom,
            scrollPos;

        if (!element || !element.getBoundingClientRect) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        // CS-8780: getBoundingClientRect() can throw an exception in certain instances. Observed
        // on IE 9
        try {
            rect = element.getBoundingClientRect();
            scrollPos = getDocScrollPosition(document);
        } catch (e) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        rectangle = {
            // Normalize viewport-relative left & top with scroll values to get left-x & top-y relative to the document
            x: rect.left + scrollPos.left,
            y: rect.top + scrollPos.top,
            width: rect.right - rect.left,
            height: rect.bottom - rect.top
        };
        if (utils.isIE) {
            // IE ONLY: the bounding rectangle include the top and left borders of the client area
            rectangle.x -= document.documentElement.clientLeft;
            rectangle.y -= document.documentElement.clientTop;

            zoom = getZoomValue();
            if (zoom !== 1) {  // IE 7 at non-default zoom level
                rectangle.x = Math.round(rectangle.x / zoom);
                rectangle.y = Math.round(rectangle.y / zoom);
                rectangle.width = Math.round(rectangle.width / zoom);
                rectangle.height = Math.round(rectangle.height / zoom);
            }
        }
        return rectangle;
    }

    /**
     * Examines the position of the event relative to the HTML element which
     * received the event on the page. The top left corner of the element is 0,0
     * and bottom right corner of the element is equal to it's width, height.
     * @function
     * @name browserService-ElementData.examinePosition
     * @param  {Object} target The HTML element which received the event.
     * @return {Point}        Returns a Point object.
     */
    ElementData.prototype.examinePosition = function (event, target) {
        var posOnDoc = getEventPosition(event),
            elPos = getBoundingClientRectNormalized(target);

        elPos.x = (posOnDoc.x || posOnDoc.y) ? Math.round(Math.abs(posOnDoc.x - elPos.x)) : elPos.width / 2;
        elPos.y = (posOnDoc.x || posOnDoc.y) ? Math.round(Math.abs(posOnDoc.y - elPos.y)) : elPos.height / 2;

        elPos.relXY = utils.calculateRelativeXY(elPos);

        return elPos;
    };

    /**
     * Returns the normalized orientation in degrees. Normalized values are measured
     * from the default portrait position which has an orientation of 0. From this
     * position the respective values are as follows:
     * 0   - Portrait orientation. Default
     * -90 - Landscape orientation with screen turned clockwise.
     * 90  - Landscape orientation with screen turned counterclockwise.
     * 180 - Portrait orientation with screen turned upside down.
     * @private
     * @function
     * @name browserService-getNormalizedOrientation
     * @return {integer} The normalized orientation value.
     */
    function getNormalizedOrientation() {
        var orientation = utils.getOrientationAngle();

        /*
         * Special handling for Android based on screen width/height since
         * certain Android devices do not adhere to the standards.
         * e.g. Some tablets report portrait orientation = 90 and landscape = 0
         */
        if (utils.isLandscapeZeroDegrees) {
            if (Math.abs(orientation) === 180 || Math.abs(orientation) === 0) {
                orientation = 90;
            } else if (Math.abs(orientation) === 90 || Math.abs(orientation) === 270) {
                orientation = 0;
            }
        }

        return orientation;
    }

    /**
     * Scans through the core configuration and creates the list of
     * custom event state properties.
     * @private
     * @function
     * @name browserService-initCustomEventList
     * @param {Object} [list] An object containing any custom event state configuration
     * @return {Object} An object containing any custom event state configuration
     */
    function initCustomEventList(list) {
        var i,
            len,
            coreConfig,
            event,
            modules,
            moduleName;

        if (list) {
            return list;
        }

        coreConfig = core.getCoreConfig() || {};
        modules = coreConfig.modules;
        list = {};

        for (moduleName in modules) {
            if (modules.hasOwnProperty(moduleName) && modules[moduleName].events) {
                for (i = 0, len = modules[moduleName].events.length; i < len; i += 1) {
                    event = modules[moduleName].events[i];
                    if (event.state) {
                        list[event.name] = event.state;
                    }
                }
            }
        }

        return list;
    }

    /**
     * Checks if any custom state is configured for the specified
     * event and return it's value.
     * @private
     * @function
     * @name browserService-getCustomState
     * @param {Object} event The native browser event.
     * @return {Object} The state object if any or null.
     */
    function getCustomState(event) {
        var state;

        // Initialize the global custom event state
        customEventList = initCustomEventList(customEventList);

        if (customEventList[event.type]) {
            // Get the state information as per the object specified in the event configuration
            state = utils.getValue(event, customEventList[event.type], null);
        }

        return state;
    }

    /**
     * The WebEvent  interface represents a normalized browser event object.
     *     When an event occurs, the BrowserService wraps the native event
     *     object in a WebEvent.
     * @constructor
     * @private
     * @name browserService-WebEvent
     * @param {Object} event The native browser event.
     */
    function WebEvent(event) {
        var pos,
            eventType,
            state;

        this.data = event.data || null;
        this.delegateTarget = event.delegateTarget || null;

        //add the gesture event data to the webevent if it exists.
        if (event.gesture || (event.originalEvent && event.originalEvent.gesture)) {
            this.gesture = event.gesture || event.originalEvent.gesture;
            //Set the idType for the gesture target. Normal processing will set the idType of this.target which is not necessarily the same as the gesture target.
            this.gesture.idType = (new ElementData(this.gesture, this.gesture.target)).idType;
        }

        event = normalizeEvent(event);
        pos = getEventPosition(event);
        this.custom = false;    // @TODO: how to determine if it's a custom event?
        this.nativeEvent = this.custom === true ? null : event;
        this.position = new Point(pos.x, pos.y);
        this.target = new ElementData(event, event.target);
        this.orientation = getNormalizedOrientation();

        // For custom events the state is determined by the "state" property specified
        // in the event configuration
        state = getCustomState(event);
        if (state) {
            this.target.state = state;
        }

        // Do not rely on browser provided event.timeStamp since FF sets
        // incorrect values. Refer to Mozilla Bug 238041
        this.timestamp = (new Date()).getTime();

        eventType = getEventType(event, this.target);
        this.type = eventType.type;
        this.subType = eventType.subType;
    }

    /**
     * 
     */
    function processDOMEvent(event) {
        if (core.isInitialized()) {
            core._publishEvent(new WebEvent(event));
        } else {
        }
    }

    /**
     * Constructor
     * @param {DOMElement} node DOM element.
     * @param {Boolean} [notInDocument] Indicates if the node is part of a cloned subtree not attached to the document.
     * @param {String} [oldId] If specified, indicates to use the elements old id instead of the current value.
     */
    function Xpath(node, notInDocument, oldId) {
        var fullXpathList = [],
            topElem,
            lastElem,
            xpathList = [];

        // Sanity check
        if (!(this instanceof Xpath)) {
            return null;
        }

        // Sanity check
        if (!node || !node.nodeType) {
            this.fullXpath = "";
            this.xpath = "";
            this.fullXpathList = [];
            this.xpathList = [];
            return;
        }

        // Text nodes are promoted to their parent element
        if (node.nodeType === 3) {
            node = node.parentElement;
        }

        // Calculate xpath list from DOM node
        xpathList = getXPathListFromNode(node, false, notInDocument, oldId);

        // Check if the topmost xpath element is an HTML ID. If so, we need to compute the full xpath.
        topElem = xpathList[0];
        if (xpathList.length && (topElem.length === 1 || (topElem.length === 2 && topElem[1] === "h"))) {
            fullXpathList = getXPathListFromNode(node, true, notInDocument);
        } else {
            fullXpathList = utils.clone(xpathList);
        }

        this.xpath = xpathListToString(xpathList);
        this.xpathList = xpathList;

        this.fullXpath = xpathListToString(fullXpathList);
        this.fullXpathList = fullXpathList;

        lastElem = fullXpathList[fullXpathList.length - 1];
        // Is this xpath pointing to a host node?
        this.isShadowHost = lastElem ? lastElem[lastElem.length - 1] === "h" : false;

        /**
         *
         */
        this.applyPrefix = function (prefix) {
            var part,
                lastPrefixPart;

            // Sanity check
            if (!(prefix instanceof Xpath) || !prefix.fullXpathList.length) {
                return;
            }

            // Process the full xpath first.
            lastPrefixPart = prefix.fullXpathList[prefix.fullXpathList.length - 1];
            part = this.fullXpathList.shift();

            // Check if they share a common element tag
            if (utils.isEqual(part[0], lastPrefixPart[0])) {
                // Concatenate
                this.fullXpathList = prefix.fullXpathList.concat(this.fullXpathList);
            } else {
                // Revert
                this.fullXpathList.unshift(part);
                return;
            }

            // Recreate the xpath string
            this.fullXpath = xpathListToString(this.fullXpathList);

            // Next, deal with the regular xpath.
            part = this.xpathList.shift();
            if (part.length === 1) {
                // The regular xpath begins with a HTML ID and cannot be prefixed.
                this.xpathList.unshift(part);
                return;
            }
            this.xpathList = prefix.xpathList.concat(this.xpathList);
            this.xpath = xpathListToString(this.xpathList);
        };

        /**
         *
         */
        this.compare = function (xpathB) {
            // Sanity check
            if (!(xpathB instanceof Xpath)) {
                return 0;
            }
            return (this.fullXpathList.length - xpathB.fullXpathList.length);
        };

        this.isSame = function (xpathB) {
            var isEqual = false;

            // Sanity check
            if (!(xpathB instanceof Xpath)) {
                return isEqual;
            }

            if (this.compare(xpathB) === 0) {
                // Check if the fullXPath matches
                isEqual = (this.fullXpath === xpathB.fullXpath);
            }

            return isEqual;
        };

        /**
         * Checks to see if the node defined by this xpath is a child of the given parent xpath.
         * @function
         * @param {Object} parentXpath Parent node XPath object
         * @param {Boolean} [ignoreShadows] Optional flag indicating if the containment check should consider
         *        xpaths as contained within a parent even though the child is in a Shadow DOM.
         * @returns {Boolean} Returns true if the xpath is contained within the parent xpath, false otherwise.
         */
        this.containedIn = function (parentXpath, ignoreShadows) {
            var i, j, len,
                tmpNode;

            // Sanity check
            if (!(parentXpath instanceof Xpath)) {
                return false;
            }

            if (parentXpath.fullXpathList.length > this.fullXpathList.length) {
                return false;
            }

            for (i = 0, len = parentXpath.fullXpathList.length; i < len; i += 1) {
                if (!utils.isEqual(parentXpath.fullXpathList[i], this.fullXpathList[i])) {
                    return false;
                }
            }

            if (!ignoreShadows) {
                // Check if the remainder of the node is within a Shadow DOM in which case
                // it is not directly contained in the DOM of the parent.
                for (j = i, len = this.fullXpathList.length; j < len; j += 1) {
                    tmpNode = this.fullXpathList[j];
                    if (tmpNode[tmpNode.length - 1] === "h") {
                        return false;
                    }
                }
            }

            return true;
        };
    }

    /**
     *
     */
    Xpath.prototype = (function () {
        // Private variables and functions

        // XPath Prototype object
        return {};
    }());

    return {
        init: function () {
            if (!isInitialized) {
                initBrowserBase();
            } else {
            }
        },
        destroy: function () {
            destroy();
        },
        WebEvent: WebEvent,
        ElementData: ElementData,
        Xpath: Xpath,
        processDOMEvent: processDOMEvent,
        getNormalizedOrientation: getNormalizedOrientation,

        getXPathFromNode: function (moduleName, node, wantFullPath, wantObject, notInDocument) {
            return getXPathFromNode(node, wantFullPath, wantObject, notInDocument);
        },
        getNodeFromID: getNodeFromID,
        queryDom: queryDom
    };
});

/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview The browserService implements some low-level methods for
 * modifying / accessing the DOM.
 * @exports browserService
 */

/*global TLT, XPathResult, document */
/*global console: false */

/**
 * @name browserService
 * @namespace
 */
TLT.addService("browser", function (core) {
    "use strict";

    var utils = core.utils,
        configService = core.getService("config"),
        browserBaseService = core.getService('browserBase'),
        addEventListener = null,
        removeEventListener = null,
        // Need to test for configService in unit testing scenario
        serviceConfig = configService ? configService.getServiceConfig("browser") : {},
        useCapture = utils.getValue(serviceConfig, "useCapture", true),
        usePassive = utils.getValue(serviceConfig, "usePassive", true),
        isInitialized = false,
        errorCodes = {
            NO_QUERY_SELECTOR: "NOQUERYSELECTOR"
        },

        /**
         * Returns a new function which will be used in the subscribe method and which calls the
         * handler function with the normalized WebEvent.
         * @private
         * @function
         * @name browserService-wrapWebEvent
         * @param  {Function} handler The handler which was passed to the browserService's subscribe method.
         * @return {Function}         Returns a new function which, when called, passes a WebEvent to the handler.
         */
        wrapWebEvent = function (handler) {
            return function (event) {
                /* IE8 only allows access to event attributes in the context of an Event.
                 * We need to instantiate our event in a local variable here before passing it 
                 * into the setTimeout handler.
                 */
                var webEvent = new browserBaseService.WebEvent(event);
                if (event.type === "resize" || event.type === "hashchange") {
                    /* Certain events like resize & hashchange need to be processed after their triggering events
                     * e.g. orientationchange could trigger a resize or a click handler could trigger a hashchange etc.
                     * To account for these cases, process these events after giving a chance for the triggering event
                     * to be processed first.
                     */
                    setTimeout(function () {
                        handler(webEvent);
                    }, 5);
                } else {
                    handler(webEvent);
                }
            };
        },

        queryDom = {
            /**
             * Helper function to transform a nodelist into an array.
             * @function
             * @name browserService-queryDom.list2Array
             * @param  {List} nodeList Pass in a DOM NodeList
             * @return {Array}          Returns an array.
             */
            list2Array: function (nodeList) {
                var len = nodeList.length,
                    result = [],
                    i;
                if (typeof nodeList.length === "undefined") {
                    return [nodeList];
                }
                for (i = 0; i < len; i += 1) {
                    result[i] = nodeList[i];
                }
                return result;
            },
            /**
             * Finds one or more elements in the DOM using a CSS or XPath selector
             * and returns an array instead of a NodeList.
             * @function
             * @name browserService-queryDom.find
             * @param  {String} query Pass in a CSS or XPath selector query.
             * @param  {Object} [scope="document"]  The DOM subtree to run the query in.
             *      If not provided, document is used.
             * @param  {String} [type="css"]  The type of query. Either "css' (default)
             *      or 'xpath' to allow XPath queries.
             * @return {Array}       Returns an array of nodes that matches the particular query.
             */
            find: function (query, scope, type) {
                type = type || "css";
                return this.list2Array(this[type](query, scope));
            },
            /**
             * Find one or more elements using a CSS selector.
             * @function
             * @name browserService-queryDom.css
             * @param  {String} query The CSS selector query.
             * @param  {Object} [scope="document"] The DOM subtree to run the query in.
             * @return {Array} Returns an array of nodes that matches the particular query.
             */
            css: function (query, scope) {
                scope = scope || document;
                return scope.querySelectorAll(query);
            }
        },
        // store handler functions which got passed to subscribe/unsubscribe.
        handlerMappings = (function () {
            var data = new utils.WeakMap();

            return {
                add: function (originalHandler) {
                    var handlers = data.get(originalHandler) || [wrapWebEvent(originalHandler), 0];

                    handlers[1] += 1;
                    data.set(originalHandler, handlers);
                    return handlers[0];
                },

                find: function (originalHandler) {
                    var handlers = data.get(originalHandler);
                    return handlers ? handlers[0] : null;
                },

                remove: function (originalHandler) {
                    var handlers = data.get(originalHandler);
                    if (handlers) {
                        handlers[1] -= 1;
                        if (handlers[1] <= 0) {
                            data.remove(originalHandler);
                        }
                    }
                }
            };
        }());

    /**
     * Check if required browser APIs are available.
     */
    function verifyPrerequisites() {
        if (!document.querySelectorAll) {
            core.fail("querySelectorAll does not exist!", errorCodes.NO_QUERY_SELECTOR);
        }
    }

    /**
     * Merges the optional properties with built-in defaults.
     * @param {Object} [options] The optional properties to be merged with the built-in defaults.
     * @returns {Object} The merged options object.
     * Boolean (useCapture) in case of IE since IE does not support the options object.
     */
    function mergeOptions(options) {
        var defaultOptions = {
            capture: useCapture,
            passive: usePassive
        };

        if (utils.isIE) {
            // IE only supports useCapture
            return useCapture;
        }

        return utils.mixin(defaultOptions, options);
    }

    /**
     * Initialization function
     * @function
     */
    function initBrowserServiceW3C() {
        queryDom.xpath = browserBaseService.queryDom.xpath;

        // Check if dependencies exist.
        verifyPrerequisites();

        if (typeof document.addEventListener === 'function') {
            addEventListener = function (target, eventName, handler, options) {
                options = mergeOptions(options);
                target.addEventListener(eventName, handler, options);
            };
            removeEventListener = function (target, eventName, handler, options) {
                options = mergeOptions(options);
                target.removeEventListener(eventName, handler, options);
            };
        } else if (typeof document.attachEvent !== 'undefined') {
            addEventListener = function (target, eventName, handler) {
                target.attachEvent('on' + eventName, handler);
            };
            removeEventListener = function (target, eventName, handler) {
                target.detachEvent('on' + eventName, handler);
            };
        } else {
            throw new Error("Unsupported browser");
        }

        isInitialized = true;
    }


    /**
     * @scope browserService
     */
    return {

        init: function () {
            if (!isInitialized) {
                initBrowserServiceW3C();
            } else {
            }
        },

        destroy: function () {
            isInitialized = false;
        },

        getServiceName: function () {
            return "W3C";
        },

        /**
         * Find a single element in the DOM mathing a particular query.
         * @param  {String} query Either a CSS or XPath query.
         * @param {Object} [scope="document"] The DOM subtree to run the query in.
         *     If not provided document is used.
         * @param  {String} [type="css"]  The type of the query. Either 'css' (default)
         *     or 'xpath' to allow XPath queries.
         * @return {Object|null}       The first matching HTML element or null if not found.
         */
        query: function (query, scope, type) {
            try {
				return queryDom.find(query, scope, type)[0] || null;
			} catch (err) {
				return [];
			}
        },

        /**
         * Find all elements in the DOM mathing a particular query.
         * @param  {String} query Either a CSS or XPath query.
         * @param {Object} [scope="document"] The DOM subtree to run the query in.
         *     If not provided document is used.
         * @param  {String} [type="css"]  The type of the query. Either 'css' (default)
         *     or 'xpath' to allow XPath queries.
         * @return {Object[]|Array}       An array of HTML elements matching the query
         *     or and empty array if no elements are matching.
         */
		queryAll: function (query, scope, type) {
            try {
				return queryDom.find(query, scope, type);
			} catch (err) {
				return [];
			}
        },

        /**
         * Tests if the element would be matched by the selector.
         * @param {String} query CSS selector.
         * @param {Object} target DOM Element.
         * @return {Boolean} True if the element would be selected by the selector.
         */
		matches: function (selector, target) {
            var result = false;
            try {
                if (target && selector) {
                    if (target.matches) {
                        result = target.matches(selector);
                    } else if (target.msMatchesSelector) {
                        // IE9
                        result = target.msMatchesSelector(selector);
                    }
                }
			} catch (err) {
			}
            return result;
        },

        /**
         * Subscribes an event handler to be called when a particular event occurs.
         * @param  {String} eventName The name of the event to listen for.
         * @param  {Object} target    The object on which the event will fire.
         * @param  {Function} handler   The function to call when the event occurs.
         *     The browserServices passes a WebEvent object to this handler.
         * @param  {Object} [options] Options such as capture, once, passive etc.
         */
        subscribe: function (eventName, target, handler, options) {
            var wrappedHandler = handlerMappings.add(handler);
            addEventListener(target, eventName, wrappedHandler, options);
        },

        /**
         * Unsubscribes an event handler from a particular event.
         * @param  {String} eventName The name of the event for which the handler was subscribed.
         * @param  {Object} target    The object on which the event fires.
         * @param  {Function} handler   The function to remove as an event handler.
         * @param  {Object} [options] Options such as capture, once, passive etc.
         */
        unsubscribe: function (eventName, target, handler, options) {
            var wrappedHandler = handlerMappings.find(handler);
            if (wrappedHandler) {
                try {
                    removeEventListener(target, eventName,  wrappedHandler, options);
                } catch (e) {
                }
                handlerMappings.remove(handler);
            }
        }
    };
});

/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
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
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview The DOM Capture Service provides the ability to capture a snapshot of
 * the DOM as a HTML snippet.
 * @exports domCaptureService
 */

/*global TLT:true, window: true, Node:true, performance:true, Element */
/*global console: false */

/**
 * @name domCaptureService
 * @namespace
 */
TLT.addService("domCapture", function (core) {
    "use strict";

    var configService = core.getService("config"),
        browserBaseService = core.getService("browserBase"),
        browserService = core.getService("browser"),
        messageService = core.getService("message"),
        dcServiceConfig,
        dcDefaultOptions = {
            maxMutations: 100,
            maxLength: 1000000,
            captureShadowDOM: false,
            captureDynamicStyles: false,
            captureHREFStyles: false,
            captureFrames: false,
            removeScripts: true,
            removeComments: true,
            captureStyle: true
        },
        defaultDiffObserverConfig = {
            childList: true,
            attributes: true,
            attributeOldValue: true,
            characterData: true,
            subtree: true
        },
        diffEnabled = (typeof window.MutationObserver !== "undefined"),
        diffObserver,
        diffObserverConfig = defaultDiffObserverConfig,
        observedWindowList = [],
        observedShadowHostList = [],
        origAttachShadow,
        shadowEventList = [],
        mutatedTargets = [],
      mutatedStyles = [],
        mutatedAttrTargets = [],
        mutationCount = 0,
        mutationThreshold = 100,
        forceFullDOM = false,
        fullDOMSent = false,
        isInitialized = false,
        dupNode = function () {},
        getDOMCapture = function () {},
        updateConfig = function () {},
        publishEvent = core._publishEvent,
        lazyload = false,
        utils = core.utils,
        originalShadowAdoptedStyleSheetsDescriptor,
      originalShadowStyleSheetsDescriptor,
      originalDocumentStyleSheetDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'styleSheets'),
      originalDocumentAdoptedStyleSheetsDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'adoptedStyleSheets'),
        updateOwners = {},
      roots = {},
        stylesCache = {},
        removeInnerHTMLRegex;

    /**
     * Process CSS rules from style elements contained in the node and apply them
     * to the nodeCopy.
     * @private
     * @function
     * @param {DOMNode} node Element or document from which the styles are to be parsed.
     * @param {DOMNode} nodeCopy A copy of the node to which the styles are added.
     */
    function fixStyles(node, nodeCopy) {
        var i, j,
            rules,
            rulesLen,
            rulesText,
            style,
            styles,
            stylesCopy,
            stylesLen;

        // Sanity check
        if (!node || !nodeCopy || !nodeCopy.querySelectorAll) {
            return;
        }

        styles = node.querySelectorAll("style");
        stylesCopy = nodeCopy.querySelectorAll("style");
        for (i = 0, stylesLen = styles.length; i < stylesLen; i += 1) {
            style = styles[i];
            if (style.sheet) {
                rules = style.sheet.cssRules;
                for (j = 0, rulesLen = rules.length, rulesText = []; j < rulesLen; j += 1) {
                    rulesText.push(rules[j].cssText);
                }

                if (rulesText.length) {
                    // Serialize the rules into the copy of the style tag.
                    stylesCopy[i].innerHTML = rulesText.join("\n");
                }
            }
        }
    }

    /**
     * Clear the global lists which are tracking mutated nodes and attributes.
     * @private
     * @function
     */
    function clearMutationRecords() {
        mutatedTargets = [];
        mutatedAttrTargets = [];
        mutatedStyles = [];
        mutationCount = 0;
        forceFullDOM = false;
    }

    /**
     * Consolidate mutated nodes by eliminating any children nodes whose parents
     * are already in the mutated list.
     * @private
     * @function
     * @param {object} mutatedTargets List of mutated targets to be consolidated.
     */
    function consolidateTargets(mutatedTargets) {
        var i, j,
            parentTarget;

        if (!mutatedTargets || !mutatedTargets.length) {
            return;
        }

        // Sort the targets list
        mutatedTargets = mutatedTargets.sort(function (xpathA, xpathB) {
            return xpathA.compare(xpathB);
        });

        // Eliminate any children contained within the parent node
        for (i = 0; i < mutatedTargets.length; i += 1) {
            parentTarget = mutatedTargets[i];
            // Search and eliminate any possible children contained within the parent
            for (j = i + 1; j < mutatedTargets.length; j += 0) {
                if (mutatedTargets[j].containedIn(parentTarget)) {
                    // Remove the child
                    mutatedTargets.splice(j, 1);
                } else {
                    j += 1;
                }
            }
        }
    }

    /**
     * Given a list of attribute records, removes "oldValue" from each entry in the list.
     * @private
     * @function
     * @param {Array} attrList List of attribute records.
     * @returns {Array} The list of attribute records where each record has been modified to remove the "oldValue" property.
     */
    function removeOldAttrValues(attrList) {
        var i,
            len;

        if (attrList) {
            for (i = 0, len = attrList.length; i < len; i += 1) {
                delete attrList[i].oldValue;
            }
        }

        return attrList;
    }

    /**
     * Given a list of attribute records and an attribute name, returns the index of the entry if
     * it finds a match in the list.
     * @private
     * @function
     * @param {Array} attrList List of attribute records
     * @param {String} attrName Attribute name to be searched
     * @returns {Integer} Index if the attribute is found in the list, -1 otherwise.
     */
    function getAttr(attrList, attrName) {
        var i,
            len,
            found = -1;

        // Sanity check
        if (!attrList || !attrName) {
            return found;
        }

        for (i = 0, len = attrList.length; i < len; i += 1) {
            if (attrList[i].name === attrName) {
                found = i;
                break;
            }
        }

        return found;
    }

    /**
     * Merge a mutated attribute by checking if there is an existing entry for the attribute
     * in the current list. If there is no existing entry for the attribute then one is created.
     * @private
     * @function
     * @param {object} currAttrList List of current attribute mutations.
     * @param {object} newAttr New attribute mutation containing the attribute name & value.
     * @returns {object} The merged attribute list.
     */
    function mergeAttributeChanges(currAttrList, newAttr) {
        var i,
            len,
            attr,
            found;

        // Check if new attribute name already exists
        for (i = 0, len = currAttrList.length, found = false; i < len; i += 1) {
            attr = currAttrList[i];
            if (attr.name === newAttr.name) {
                if (attr.oldValue === newAttr.value) {
                    // If the newAttr value matches the oldValue of attr then it is a redundant change
                    // Remove the attribute entry in that case
                    currAttrList.splice(i, 1);
                } else {
                    // Update the attribute value to the latest new value
                    attr.value = newAttr.value;
                }
                found = true;
                break;
            }
        }

        if (!found) {
            // Add to the current attributes
            currAttrList.push(newAttr);
        }

        return currAttrList;
    }

    /**
     * Add the mutation record to the list of mutated nodes. If the node
     * is already in the mutated list then merge the mutation.
     * @private
     * @function
     * @param {object} xpath The XPath of the mutated node
     * @param {object} mutationRecord The DOM Mutation Record object.
     * @returns {Integer} Number of added records.
     */
    function addToMutatedTargets(xpath, mutationRecord) {
        var i, j, k,
            len,
            found,
            target,
            isParent,
            retVal = 0;

        // For removals, we only track the number of removed nodes
        xpath.removedNodes = mutationRecord.removedNodes.length;
        xpath.addedNodes = utils.convertToArray(mutationRecord.addedNodes);

        // Check if xpath already exists in the mutatedTargets
        for (i = 0, len = mutatedTargets.length; i < len; i += 1) {
            target = mutatedTargets[i];
            if (xpath.isSame(target)) {
                // The xpaths are the same, merge the node mutations
                if (xpath.removedNodes) {
                    for (j = 0; j < mutationRecord.removedNodes.length; j += 1) {
                        k = target.addedNodes.indexOf(mutationRecord.removedNodes[j]);
                        if (k !== -1) {
                            // Match found, remove it from target's addedNodes & decrement the removedNodes count from current xpath
                            target.addedNodes.splice(k, 1);
                            xpath.removedNodes -= 1;
                        }
                    }
                }

                target.removedNodes += xpath.removedNodes;
                target.addedNodes.concat(xpath.addedNodes);

                // Remove the target xpath entry if there are no mutations to keep track of.
                if (!target.removedNodes && !target.addedNodes.length) {
                    isParent = false;
                    for (j = 0;  j < mutatedTargets.length; j += 1) {
                        if (target !== mutatedTargets[j] && mutatedTargets[j].containedIn(target)) {
                            isParent  = true;
                            break;
                        }
                    }

                    if (!isParent) {
                        mutatedTargets.splice(i, 1);
                        retVal = -1;
                    }
                }

                found = true;
                break;
            }
        }

        if (!found) {
            // Add a new entry to the mutatedTargets list
            mutatedTargets.push(xpath);
            retVal = 1;
        }

        return retVal;
    }

    /**
     * Checks if the node is a child of existing nodes that have been added.
     * @private
     * @function
     * @param {object} xpath The XPath of the mutated node
     * @param {object} node The DOM node.
     * @returns {boolean} True if the node is a child of previously added nodes.
     */
    function isNodePartOfMutatedTargets(xpath, node) {
        var i, j,
            len,
            found = false,
            mutatedNodes,
            target;

        for (i = 0, len = mutatedTargets.length; !found && i < len; i += 1) {
            target = mutatedTargets[i];
            if (xpath.containedIn(target)) {
                // Xpath indicates node is a child but is it contained within the mutated nodes?
                mutatedNodes = target.addedNodes;
                for (j = 0; j < mutatedNodes.length; j += 1) {
                    // Check if Node.contains exists before using because Node.contains is not
                    // implemented in IE for all node types.
                    // See https://connect.microsoft.com/IE/Feedback/Details/785343
                    if (mutatedNodes[j].contains && mutatedNodes[j].contains(node)) {
                        found = true;
                        break;
                    }
                }
            }
        }

        return found;
    }

    /**
     * Adds the attribute mutation to the list of mutated attribute targets.
     * @private
     * @function
     * @param {object} xpath The XPath of the mutated node.
     * @param {object} mutationRecord The DOM Mutation record.
     * @returns {Integer} Number of new records created.
     */
    function addToMutatedAttributeTargets(xpath, mutationRecord) {
        var i,
            len,
            attributeName,
            currAttributes,
            found,
            target = null,
            retVal = 0;

        attributeName = mutationRecord.attributeName;

        // If the attribute is "checked" or "selected" then ignore if element is privacy masked
        if (attributeName === "checked" || attributeName === "selected") {
            target = browserBaseService.ElementData.prototype.examineID(mutationRecord.target);
            if (messageService.isPrivacyMatched(target)) {
                return retVal;
            }
            target = null;
        }

        // If the attribute is "value" check if privacy masking needs to be applied
        if (attributeName === "value") {
            target = browserBaseService.ElementData.prototype.examineID(mutationRecord.target);
            target.currState = utils.getTargetState(mutationRecord.target) || {};
            if (target.currState.value) {
                messageService.applyPrivacyToTarget(target);
            } else {
                target = null;
            }
        }

        xpath.attributes = [
            {
                name: attributeName,
                oldValue: mutationRecord.oldValue,
                // New value
                value: target ? target.currState.value : mutationRecord.target.getAttribute(attributeName)
            }
        ];

        currAttributes = xpath.attributes[0];
        if (currAttributes.oldValue === currAttributes.value) {
            return retVal;
        }

        // Check if xpath already exists in the mutatedAttrTargets
        for (i = 0, len = mutatedAttrTargets.length, found = false; i < len; i += 1) {
            target = mutatedAttrTargets[i];
            if (xpath.isSame(target)) {
                // The xpaths are the same, merge the attributes
                target.attributes = mergeAttributeChanges(target.attributes, currAttributes);
                if (!target.attributes.length) {
                    // The attribute changes cancelled each other out, delete the entry
                    mutatedAttrTargets.splice(i, 1);
                    retVal = -1;
                } else {
                    // If the node is part of the mutated nodes then ignore as the mutation record will capture the attribute as well.
                    if (isNodePartOfMutatedTargets(xpath, mutationRecord.target)) {
                        mutatedAttrTargets.splice(i, 1);
                        retVal = -1;
                    }
                }
                found = true;
                break;
            }
        }

        if (!found && !isNodePartOfMutatedTargets(xpath, mutationRecord.target)) {
            // Add a new entry to the mutatedAttrTargets list
            mutatedAttrTargets.push(xpath);
            retVal = 1;
        }
        return retVal;
    }

    /**
     * Process DOM mutation records.
     * @param {object} records
     */
    function processMutationRecords(records) {
        var i,
            len,
            fullXpathList,
            record,
            xpath;

        // Sanity check
        if (!records || !records.length) {
            return;
        }

        // No need to process records for a full DOM snapshot.
        if (forceFullDOM) {
            mutationCount += records.length;
            return;
        }

        // Process each record as per it's type
        for (i = 0, len = records.length; i < len && mutationCount < mutationThreshold; i += 1) {
            record = records[i];
            // calculate xpath of the target element
            xpath = new browserBaseService.Xpath(record.target);
            if (xpath) {
                fullXpathList = xpath.fullXpathList;
                if (fullXpathList.length && fullXpathList[0][0] === "html") {
                    switch (record.type) {
                    case "characterData":
                    case "childList":
                        // Push xpath to mutatedTargets list
                        mutationCount += addToMutatedTargets(xpath, record);
                        break;
                    case "attributes":
                        mutationCount += addToMutatedAttributeTargets(xpath, record);
                        break;
                    default:
                        utils.clog("Unknown mutation type: " + record.type);
                        break;
                    }
                }
            }
        }

        // Check if mutationCount exceeds safety threshold
        if (mutationCount >= mutationThreshold) {
            forceFullDOM = true;
            // Add the unprocessed record count to the mutation count
            mutationCount += len - i;
        }
    }

    /**
     * Initialize the DOM Mutation Observer.
     * @private
     * @returns {object} The observer object.
     */
    function initDOMDiffObserver() {
        var observer;

        observer = new window.MutationObserver(function (records) {
            if (records) {
                processMutationRecords(records);
                utils.clog("Processed [" + records.length + "] mutation records.");
                core.invokeMutationCallbacks(records);
            }
        });

        return observer;
    }

    /**
     * Proxy for Element.prototype.attachShadow
     */
    function tltAttachShadow(option) {
        /*jshint validthis:true */
        var sRoot = origAttachShadow.call(this, option);

        if (diffObserver && sRoot) {
            diffObserver.observe(sRoot, diffObserverConfig);
        }
        return sRoot;
    }

    /**
     * Starts the observer.
     */
    function startObserver() {
        if (!diffObserver) {
            return null;
        }
        // Observe main window
        diffObserver.observe(window.document, diffObserverConfig);

        // Observe for new shadow dom creation
        if (!origAttachShadow && utils.getValue(dcServiceConfig, "options.captureShadowDOM", false)) {
            origAttachShadow = Element.prototype.attachShadow;
            Element.prototype.attachShadow = tltAttachShadow;
        }

        // Set flag to start observing frame windows
        lazyload = true;

        return diffObserver;
    }
    /**
     * Creates an Id for the DOM and shadows.
     * @private
     * @function
     */
    function createId() {
        return Math.random().toString(16).slice(2);
    }

    /**
     * Proxy Function for the insertRule method on the CSSStyleSheet Prototype.
     * @private
     * @function
     * @param {string} rule A string containing the rule to be inserted.
     * @param {Number} index A positive integer less than or equal to stylesheet.cssRules.length,
     * representing the newly inserted rule's position.
     * @returns {Number} The newly inserted rule's index within the stylesheet's rule-list.
     */
    function insertRuleProxy(rule, index) {
        this.updateOwner();
        return this.insertRuleOriginal(rule, index);
    }

    /**
     * Proxy Function for the deleteRule method on the CSSStyleSheet Prototype.
     * @private
     * @function
     * @param {Number} index  The index into the stylesheet's CSSRuleList indicating the rule to be removed.
     */
    function deleteRuleProxy(index) {
        this.deleteRuleOriginal(index);
        this.updateOwner();
    }
    /**
     * Proxy Function for the replaceSync method on the CSSStyleSheet Prototype.
     * @private
     * @function
     * @param {string} text A string containing the style rules to replace the content of the stylesheet.
     */
    function replaceSyncProxy(text) {
        this.updateOwner();
        this.replaceSyncOriginal(text);
    }

    /**
     * Proxy Function for the replace method on the CSSStyleSheet Prototype.
     * @private
     * @function
     * @param {string} text A string containing the style rules to replace the content of the stylesheet.
     */
    function replaceProxy(text) {
        this.updateOwner();
        return this.replaceOriginal(text);
    }

    /**
     * Updates the owner of the stylesheet if modified.
     * @private
     * @function
     */
    function updateOwner() {
        if (this.ownersReference) {
            var ownersId = Object.keys(this.ownersReference);
            for (var i = 0; i < ownersId.length; i += 1) {
                var id = ownersId[i];
                if (!updateOwners[id]) {
                    mutatedStyles.push(id);
                    updateOwners[id] = true;
                }

            }
        }
    }

    /**
     * Adds the DOM or a shadow as owner of the StyleSheet. A single StyleSheet can contain multiple owners.
     * @private
     * @function
     * @param {string} ownerDOMId A string containing the DOMId of the owner of a stylesheet.
     */
    function publishOwnership(ownerDOMId) {
        if (!this.ownersReference) this.ownersReference = {};
        this.ownersReference[ownerDOMId] = true;
        updateOwners[ownerDOMId] = true;
    }

    /**
     * Removes the DOM or a shadow as owner of the StyleSheet.
     * @private
     * @function
     * @param {string} ownerDOMId A string containing the DOMId of the owner of a stylesheet.
     */
    function removeOwnership(ownerDOMId) {
        if (this.ownersReference) {
            delete this.ownersReference[ownerDOMId];
        }
    }

    /**
     * Add properties to the DOM or shadows for the capture of dynamic styles.
     * @private
     * @function
     *
     */
    function initializeDOMRoot(root) {
        root.domId = createId();
        roots[root.domId] = root;
        updateOwners[root.domId] = true;
        var sheets = [].concat.apply([], root.adoptedStyleSheets);
            sheets = sheets.concat.apply(sheets, root.styleSheets);

        if (sheets) {
            for (var i = 0; i < sheets.length; i += 1) {
                var sheet = sheets[i];
                if (!sheet.ownersReference) {
                    sheet.ownersReference = {};
                }
                sheet.ownersReference[root.domId] = true;
            }
        }
    }

    function modifyContextWindow(contextWindow) {

        if (contextWindow && contextWindow.alreadyModified) {
            return;
        }
        contextWindow.alreadyModified = true;
        /*
            * Fetches the original descriptor for the adoptedStyleSheets and styleSheets properties from the
            * Document.prototype.
            */
        var originalDOMAdoptedStyleSheetsDescriptor = Object.getOwnPropertyDescriptor(contextWindow.Document.prototype, 'adoptedStyleSheets');
        var originalDOMStyleSheetsDescriptor = Object.getOwnPropertyDescriptor(contextWindow.Document.prototype, 'styleSheets');

        /*
        * Defines a new adoptedStylesheets and styleSheets properties to allow the SDK to listen for changes
        * in the style of the DOM. This allows the SDK to only iterate through the CSSStyleSheets of the DOM if a change
        * has been detected.
         */
        return (function () {
            Object.defineProperty(contextWindow.Document.prototype, 'adoptedStyleSheets', {
                set: function (arr) {
                    var index,
                      sheet,
                      sheets;

                    if (!this.domId) {
                        initializeDOMRoot(this);
                    }

                    sheets = this.adoptedStyleSheets;
                    if (sheets.length > 0) {
                        for (index = 0; index < sheets.length; index += 1) {
                            sheet = sheets[index];
                            sheet.removeOwnership(this.domId);
                        }
                    }

                    for (index = 0; index < arr.length; index += 1) {
                        sheet = arr[index];
                        sheet.publishOwnership(this.domId);
                    }

                    originalDOMAdoptedStyleSheetsDescriptor.set.call(this, arr);
                }
            });

            Object.defineProperty(contextWindow.Document.prototype, 'styleSheets', {
                get: function () {
                    var index,
                      sheet,
                      sheets;

                    sheets = originalDOMStyleSheetsDescriptor.get.call(this);

                    if (!this.domId) {
                        initializeDOMRoot(this);
                    }

                    for (index = 0; index < sheets.length; index += 1) {
                        sheet = sheets[index];
                        sheet.publishOwnership(this.domId);
                    }

                    return sheets;
                }
            });

            contextWindow.CSSStyleSheet.prototype.insertRuleOriginal = contextWindow.CSSStyleSheet.prototype.insertRule;
            contextWindow.CSSStyleSheet.prototype.deleteRuleOriginal = contextWindow.CSSStyleSheet.prototype.deleteRule;
            contextWindow.CSSStyleSheet.prototype.insertRule = insertRuleProxy;
            contextWindow.CSSStyleSheet.prototype.deleteRule = deleteRuleProxy;

            contextWindow.CSSStyleSheet.prototype.replaceSyncOriginal = contextWindow.CSSStyleSheet.prototype.replaceSync;
            contextWindow.CSSStyleSheet.prototype.replaceOriginal = contextWindow.CSSStyleSheet.prototype.replace;
            contextWindow.CSSStyleSheet.prototype.replaceSync = replaceSyncProxy;
            contextWindow.CSSStyleSheet.prototype.replace = replaceProxy;

            contextWindow.CSSStyleSheet.prototype.publishOwnership = publishOwnership;
            contextWindow.CSSStyleSheet.prototype.removeOwnership = removeOwnership;

            contextWindow.CSSStyleSheet.prototype.updateOwner = updateOwner;
        })();
    }
    /**
     * Initialization of the service. Subscribe with config service for
     * the configupdated message.
     * @private
     * @function
     * @param {object} config
     */
    function initDOMCaptureService(config) {
        var i, len,
            module,
            event,
            eventList,
            isCaptureShadowDOMEnabled,
            isCaptureDynamicStylesEnabled,
            coreConfig = configService.getCoreConfig();

        configService.subscribe("configupdated", updateConfig);
        messageService = core.getService("message");

        dcServiceConfig = config;
        dcServiceConfig.options = utils.mixin({}, dcDefaultOptions, dcServiceConfig.options);

        removeInnerHTMLRegex = utils.getValue(dcServiceConfig.options, "removeInnerHTMLRegex");

        diffEnabled = diffEnabled && utils.getValue(dcServiceConfig, "diffEnabled", true);
        mutationThreshold = utils.getValue(dcServiceConfig.options, "maxMutations", 100);

        if (diffEnabled) {
            // Initialize DOM Diff observer
            diffObserverConfig = utils.getValue(dcServiceConfig, "diffObserverConfig", defaultDiffObserverConfig);
            diffObserver = initDOMDiffObserver();
            // Add the main window to be observed.
            observedWindowList.push(window);
        }

        isCaptureShadowDOMEnabled = dcServiceConfig.options.captureShadowDOM && Element.prototype.attachShadow;
        // Only browsers having native Shadow DOM support could work with Shadow DOM Capture and DOM Diff technology.
        // Disable Shadow DOM Capture if browser doesn't have such support.
        if (isCaptureShadowDOMEnabled && window.ShadyDOM && window.ShadyDOM.inUse) {
            dcServiceConfig.options.captureShadowDOM = false;
            isCaptureShadowDOMEnabled = false;
        }

        if (isCaptureShadowDOMEnabled) {
            // Populate the shadowEventList
            for (module in coreConfig.modules) {
                if (coreConfig.modules.hasOwnProperty(module)) {
                    eventList = coreConfig.modules[module].events || [];
                    for (i = 0, len = eventList.length; i < len; i += 1) {
                        if (eventList[i].attachToShadows) {
                            event = eventList[i].name;
                            if (utils.indexOf(shadowEventList, event) === -1) {
                                shadowEventList.push(event);
                            }
                        }
                    }
                }
            }
        }
        // Only browsers having full support for constructable StyleSheets could work with the Dynamic Styles technology.
        isCaptureDynamicStylesEnabled = dcServiceConfig.options.captureDynamicStyles && document.adoptedStyleSheets;
        if (isCaptureDynamicStylesEnabled) {

            modifyContextWindow(window);

            // Checks if the capture of shadows is enabled
            if (isCaptureShadowDOMEnabled) {
                //Fetches the original descriptor for the adoptedStyleSheets property from theShadowRoot.prototype.
                originalShadowAdoptedStyleSheetsDescriptor = Object.getOwnPropertyDescriptor(ShadowRoot.prototype, 'adoptedStyleSheets');
                originalShadowStyleSheetsDescriptor = Object.getOwnPropertyDescriptor(ShadowRoot.prototype, 'styleSheets');
                /*
                * Defines a new adoptedStylesheets property to allow the SDK to listen for changes
                * in the style of all open Shadow DOMs. This allows the SDK to only iterate through
                * the CSSStyleSheets of a Shadow if a change has been detected.
                */
                Object.defineProperty(ShadowRoot.prototype, 'adoptedStyleSheets', {
                    set: function (arr) {
                        var index,
                            sheet,
                            sheets;

                        if (!this.domId) {
                            initializeDOMRoot(this);
                        }

                        sheets = this.adoptedStyleSheets;
                        if (sheets.length > 0) {
                            for (index = 0; index < sheets.length; index += 1) {
                                sheet = sheets[index];
                                sheet.removeOwnership(this.domId);
                            }
                        }

                        for (index = 0; index < arr.length; index += 1) {
                            sheet = arr[index];
                            sheet.publishOwnership(this.domId);
                        }
                        originalShadowAdoptedStyleSheetsDescriptor.set.call(this, arr);
                    }
                });

                Object.defineProperty(ShadowRoot.prototype, 'styleSheets', {
                    get: function () {
                        var index,
                          sheet,
                          sheets;

                        sheets = originalShadowStyleSheetsDescriptor.get.call(this);

                        if (!this.domId) {
                            initializeDOMRoot(this);
                        }

                        for (index = 0; index < sheets.length; index += 1) {
                            sheet = sheets[index];
                            sheet.publishOwnership(this.domId);
                        }

                        return sheets;
                    }
                });
            }

            // Initialize the DOM to listen for changes in style.
            initializeDOMRoot(document);
        }

        startObserver();

        isInitialized = true;
    }

    /**
     * Destroy the service. Unsubscribe from the configupdated message.
     * @private
     * @function
     */
    function destroyDOMCaptureService() {
        configService.unsubscribe("configupdated", updateConfig);
        if (diffObserver) {
            diffObserver.disconnect();
            diffObserver = null;
        }
        if (origAttachShadow && Element.prototype.attachShadow === tltAttachShadow) {
            // Restore original prototype method.
            Element.prototype.attachShadow = origAttachShadow;
            origAttachShadow = null;
        }
        isInitialized = false;

        if (originalDocumentAdoptedStyleSheetsDescriptor) {
            Object.defineProperty(Document.prototype, 'adoptedStyleSheets', originalDocumentAdoptedStyleSheetsDescriptor);
        }
        if (originalDocumentStyleSheetDescriptor) {
            Object.defineProperty(Document.prototype, 'styleSheets', originalDocumentStyleSheetDescriptor);
        }
        if (originalShadowAdoptedStyleSheetsDescriptor) {
            Object.defineProperty(ShadowRoot.prototype, 'adoptedStyleSheets', originalShadowAdoptedStyleSheetsDescriptor);
        }

        if (originalShadowStyleSheetsDescriptor) {
            Object.defineProperty(ShadowRoot.prototype, 'styleSheets', originalShadowStyleSheetsDescriptor);
        }

        if (CSSStyleSheet.prototype.insertRuleOriginal) {
            CSSStyleSheet.prototype.insertRule = CSSStyleSheet.prototype.insertRuleOriginal;
        }
        if (CSSStyleSheet.prototype.deleteRuleOriginal) {
            CSSStyleSheet.prototype.deleteRule = CSSStyleSheet.prototype.deleteRuleOriginal;
        }

        if (CSSStyleSheet.prototype.replaceSyncOriginal) {
            CSSStyleSheet.prototype.replaceSync = CSSStyleSheet.prototype.replaceSyncOriginal;
        }
        if (CSSStyleSheet.prototype.replaceOriginal) {
            CSSStyleSheet.prototype.replace = CSSStyleSheet.prototype.replaceOriginal;
        }

        if (CSSStyleSheet.prototype.publishOwnership) {
            delete CSSStyleSheet.prototype.publishOwnership;
        }
        if (CSSStyleSheet.prototype.removeOwnership) {
            delete CSSStyleSheet.prototype.removeOwnership;
        }
        if (CSSStyleSheet.prototype.updateOwner) {
            delete CSSStyleSheet.prototype.updateOwner;
        }
    }

    /**
     * Returns a unique identifier string.
     * @private
     * @function
     * @returns {String} A string that can be used as a unique identifier.
     */
    function getUniqueID() {
        var id;

        id = "tlt-" + utils.getSerialNumber();

        return id;
    }

    /**
     * Get all child nodes matching the tag name from the node.
     * @private
     * @function
     * @param {DOMNode} node The root or parent DOM Node element
     * @param {String}  tagName The tag to be removed
     * @param {Array}  [attribute] Optional name, value pair to match the tag on.
     * @returns List of nodes matching tagName
     */
    function getTagList(node, tagName, attribute) {
        var i,
            attrName,
            attrValue,
            nodeList,
            tag,
            tagList = [];

        // Sanity check
        if (!node || !tagName) {
            return tagList;
        }

        if (attribute && attribute.length === 2) {
            attrName = attribute[0];
            attrValue = attribute[1];
        }

        nodeList = node.querySelectorAll(tagName);
        if (nodeList && nodeList.length) {
            for (i = nodeList.length - 1; i >= 0; i -= 1) {
                tag = nodeList[i];
                if (!attrName) {
                    tagList.push(tag);
                } else {
                    if (tag[attrName] === attrValue) {
                        tagList.push(tag);
                    }
                }
            }
        }

        return tagList;
    }

    /**
     * Remove child nodes matching the tag name from the node.
     * @private
     * @function
     * @param {DOMNode} node The root or parent DOM Node element
     * @param {String}  tagName The tag to be removed
     * @param {Array}  [attribute] Optional name, value pair to match the tag on.
     * @returns The node without any tags matching tagName
     */
    function removeTags(node, tagName, attribute) {
        var i,
            tag,
            tagList;

        tagList = getTagList(node, tagName, attribute);

        for (i = tagList.length - 1; i >= 0; i -= 1) {
            tag = tagList[i];
            tag.parentNode.removeChild(tag);
        }

        return node;
    }

    /**
     * Remove base64 nodes which has size larger than the limit.
     * @private
     * @function
     * @param {DOMNode} node The root or parent DOM Node element
     * @param {Number}  sizelimit The threshold to discard base64 images
     * @returns The node with base64 images' src removed based on condition
     */
    function removeBase64Src(node, sizeLimit) {
        var i,
            tag,
            tagList = getTagList(node, "img"),
            pattern = new RegExp("^data:image\/(.*?);base64");

        for (i = 0; i < tagList.length; i++) {
            tag = tagList[i];
            if (pattern.test(tag.src) && (tag.src.length > sizeLimit)) {
                tag.src = "";
                tag.setAttribute("removedByUIC", true);
            }
        }

        return node;
    }

    /**
     * Remove child nodes matching the nodeType from the node.
     * @private
     * @function
     * @param {DOMNode} node The root or parent DOM Node element
     * @param {Integer} nodeType The integer code of the node type to be removed.
     *                           e.g. 1 = Element, 8 = comment etc.
     * @returns The node without any tags matching tagName
     */
    function removeNodes(node, nodeType) {
        var i,
            child;

        for (i = 0; node.hasChildNodes() && i < node.childNodes.length; i += 1) {
            child = node.childNodes[i];
            if (child.nodeType === nodeType) {
                node.removeChild(child);
                // Since we removed the child node, decrement the index to negate the loop increment
                i -= 1;
            } else if (child.hasChildNodes()) {
                // Check if child node itself contains nodeType nodes.
                removeNodes(child, nodeType);
            }
        }

        return node;
    }

    /**
     * Returns the DOCTYPE of the document as a formatted string.
     * @private
     * @function
     * @param {DOMNode} node A document node or a documentElement node.
     * @returns {String} The formatted doctype or null.
     */
    function getDoctypeAsString(node) {
        var doc,
            doctype,
            doctypeStr = null;

        // Sanity check
        if (!node) {
            return doctypeStr;
        }

        switch (node.nodeType) {
        case 1:
        // ELEMENT
            doc = node.ownerDocument;
            // Get doctype from the owner document of a document element node.
            if (doc && doc.documentElement === node) {
                doctype = doc.doctype;
            }
            break;
        case 9:
        // DOCUMENT
            doctype = node.doctype;
            break;
        default:
            break;
        }

        if (doctype) {
            doctypeStr = "<!DOCTYPE " + doctype.name +
                         (doctype.publicId ? ' PUBLIC "' + doctype.publicId + '"' : "") +
                         (!doctype.publicId && doctype.systemId ? ' SYSTEM' : "") +
                         (doctype.systemId ? ' "' + doctype.systemId + '"' : "") +
                         ">";
        }

        return doctypeStr;
    }

    /**
     * Fix child input nodes and set attributes such as value & checked.
     * @private
     * @function
     * @param {DOMNode} source The original root or parent DOM node element.
     * @param {DOMNode} target The copy of the root or parent DOM Node element.
     */
    function fixInputs(source, target) {
        var i,
            sourceInputElement,
            targetInputElement,
            sourceInputList,
            targetInputList,
            len;

        // Sanity check
        if (!target) {
            return;
        }

        sourceInputList = source.querySelectorAll("input");
        targetInputList = target.querySelectorAll("input");
        if (targetInputList) {
            for (i = 0, len = targetInputList.length; i < len; i += 1) {
                sourceInputElement = sourceInputList[i];
                targetInputElement = targetInputList[i];
                switch (targetInputElement.type) {
                case "checkbox":
                case "radio":
                    if (sourceInputElement.checked) {
                        targetInputElement.setAttribute("checked", "checked");
                    } else {
                        targetInputElement.removeAttribute("checked");
                    }
                    break;
                default:
                    targetInputElement.setAttribute("value", sourceInputElement.value);
                    if (!targetInputElement.getAttribute("type")) {
                        // For input elements that do not have an explicit "type" attribute set.
                        targetInputElement.setAttribute("type", "text");
                    }
                    break;
                }
            }
        }
    }

    /**
     * Set the value attribute of the child textarea nodes.
     * @private
     * @function
     * @param {DOMNode} source The original DOM Node element
     * @param {DOMNode} target The target DOM Node element that is a copy of the source
     */
    function fixTextareas(source, target) {
        var i,
            len,
            sourceTextareaElement,
            sourceTextareaList,
            targetTextareaElement,
            targetTextareaList;

        // Sanity check
        if (!source || !target) {
            return;
        }

        sourceTextareaList = source.querySelectorAll("textarea");
        targetTextareaList = target.querySelectorAll("textarea");

        if (sourceTextareaList && targetTextareaList) {
            for (i = 0, len = sourceTextareaList.length; i < len; i += 1) {
                sourceTextareaElement = sourceTextareaList[i];
                targetTextareaElement = targetTextareaList[i];
                targetTextareaElement.setAttribute("value", sourceTextareaElement.value);
                targetTextareaElement.value = targetTextareaElement.textContent = sourceTextareaElement.value;
            }
        }
    }

    /**
     * Fix the child select lists by setting the selected attribute on the option elements of
     * the lists in the target node.
     * @private
     * @function
     * @param {DOMNode} source The original or source DOM Node element
     * @param {DOMNode} target The target DOM Node element that is a copy of the source
     */
    function fixSelectLists(source, target) {
        var sourceElem,
            sourceList,
            targetElem,
            targetList,
            i,
            j,
            len;

        // Sanity check
        if (!source || !target) {
            return;
        }

        sourceList = source.querySelectorAll("select");
        targetList = target.querySelectorAll("select");

        if (sourceList) {
            for (i = 0, len = sourceList.length; i < len; i += 1) {
                sourceElem = sourceList[i];
                targetElem = targetList[i];
                for (j = 0; j < sourceElem.options.length; j += 1) {
                    if (j === sourceElem.selectedIndex || sourceElem.options[j].selected) {
                        targetElem.options[j].setAttribute("selected", "selected");
                    } else {
                        targetElem.options[j].removeAttribute("selected");
                    }
                }
            }
        }
    }

    /**
     * Return the outer HTML of the document or element.
     * @private
     * @function
     * @param {DOMNode} node The DOM Node element
     * @param {Boolean} getInnerHTML If true, returns the inner HTML of the element.
     * @returns {String} The HTML text of the document or element. If the node is not
     * a document or element type then return null.
     */
    function getHTMLText(node, getInnerHTML) {
        var nodeType,
            htmlText = null;

        if (node) {
            nodeType = node.nodeType || -1;
            switch (nodeType) {
            case 11:
                // DOCUMENT_FRAGMENT
                htmlText = node.innerHTML;
                break;
            case 9:
                // DOCUMENT_NODE
                htmlText = node.documentElement ? node.documentElement.outerHTML : "";
                break;
            case 1:
                // ELEMENT_NODE
                htmlText = getInnerHTML ? node.innerHTML : node.outerHTML;
                break;
            default:
                htmlText = null;
                break;
            }
        }
        return htmlText;
    }

    /**
     * Checks if the DOM node is allowed for capture. Only document and element
     * node types are allowed for capture.
     * @private
     * @function
     * @param {DOMNode} node The DOM Node element to be checked
     * @returns {Boolean} Returns true if the node is allowed for DOM capture.
     */
    function isNodeValidForCapture(node) {
        var nodeType,
            valid = false;

        // Only DOCUMENT (9) & ELEMENT (1) nodes are valid for capturing
        if (node && typeof node === "object") {
            nodeType = node.nodeType || -1;
            switch (nodeType) {
            case 9:
            case 1:
                valid = true;
                break;
            default:
                valid = false;
                break;
            }
        }
        return valid;
    }

    /**
     * Capture the frames from the source and add the unique token to the frame element
     * in the target.
     * @private
     * @function
     * @param {DOMNode} source The source element
     * @param {DOMNode} target The target element duplicated from the source.
     * @param {Object}  options The capture options object
     * @returns {Object} Returns the captured frame/iframe elements as per the enabled options.
     */
    function getFrames(source, target, options) {
        var i, j,
            len,
            frameTag,
            frameTags = [ "iframe", "frame" ],
            sourceIframe,
            iframeWindow,
            iframeDoc,
            iframeCapture,
            iframeID,
            iframeSrc,
            returnObject = {
                frames: []
            },
            sourceIframeList,
            targetIframeList,
            urlInfo;

        for (j = 0; j < frameTags.length; j += 1) {
            frameTag = frameTags[j];
            // Get the frames in the original DOM
            sourceIframeList = source.querySelectorAll(frameTag);

            // Get the cloned frames - the content is not copied here - these will be
            // used to add an attribute to specify which item in the frames collection
            // contains the content for this frame
            targetIframeList = target.querySelectorAll(frameTag);

            if (sourceIframeList) {
                for (i = 0, len = sourceIframeList.length; i < len; i += 1) {
                    try {
                        sourceIframe = sourceIframeList[i];
                        iframeWindow = utils.getIFrameWindow(sourceIframe);
                        if (iframeWindow && iframeWindow.document && (options.captureAboutBlankFrames || iframeWindow.location.href !== "about:blank")) {
                            iframeDoc = iframeWindow.document;
                            // Add the proxy methods for Document and CSSStyleSheet in the context window for this iFrame
                            // if it's the first time we encounter the frame
                            if (!iframeDoc.isDocumentFromIframe) {
                                modifyContextWindow(iframeWindow);
                                iframeDoc.isDocumentFromIframe = true;
                            }

                            /**
                             * Use the document instead of the documentElement because of Chrome bug
                             * https://bugs.chromium.org/p/chromium/issues/detail?id=1042089
                             */
                            iframeCapture = getDOMCapture(iframeDoc, iframeDoc, "", options);
                            iframeID = getUniqueID();

                            // Set the tltid for this frame in the target DOM
                            targetIframeList[i].setAttribute("tltid", iframeID);
                            iframeCapture.tltid = iframeID;

                            // Remove srcdoc attribute from the iframe element
                            targetIframeList[i].removeAttribute("srcdoc");

                            // Add the host and url path
                            urlInfo = utils.getOriginAndPath(iframeDoc.location);
                            iframeCapture.host = urlInfo.origin;
                            iframeCapture.url = core.normalizeUrl("", urlInfo.path, 12);

                            // Add the charset
                            iframeCapture.charset = iframeDoc.characterSet || iframeDoc.charset;

                            // Set the src attribute on the frame tag if one doesn't already exist (to aid replay)
                            iframeSrc = targetIframeList[i].getAttribute("src");
                            if (!iframeSrc) {
                                iframeSrc = iframeWindow.location.href;
                                targetIframeList[i].setAttribute("src", iframeSrc);
                            }

                            // Replace empty root element with empty document
                            if (!iframeCapture.root) {
                                iframeCapture.root = "<html></html>";
                            }

                            // Merge this frame's captured DOM into the return object
                            returnObject.frames = returnObject.frames.concat(iframeCapture.frames);
                            delete iframeCapture.frames;

                            returnObject.frames.push(iframeCapture);
                        }
                    } catch (e) {
                        // Do nothing!
                    }
                }
            }
        }
        return returnObject;
    }

    /**
     * Attach event listeners identified in the shadowEventList to the shadowRoot.
     * @private
     * @function
     * @param {DOMNode} root The shadow root document-fragment
     */
    function attachEventListeners(root) {
        var i, len,
            event;

        root.TLTListeners = root.TLTListeners || {};
        for (i = 0, len = shadowEventList.length; i < len; i += 1) {
            event = shadowEventList[i];
            if (!root.TLTListeners[event]) {
                browserService.subscribe(event, root, publishEvent);
                root.TLTListeners[event] = true;
            }
        }
    }

    /**
     * Capture Shadow DOM trees from the source and add the unique token to the host element
     * in the target.
     * @private
     * @function
     * @param {DOMNode} source The source element
     * @param {DOMNode} target The target element duplicated from the source.
     * @param {Object}  options The capture options object
     * @returns {Object} Returns the captured Shadow DOM as per the enabled options.
     */
    function getShadowDOM(source, target, options, thisSource) {
        var i,
            len,
            captures,
            element,
            elements,
            hostXpath,
            returnObject = {
                shadows: []
            };

        // Sanity check
        if (!source || (!thisSource && !source.children)) {
            return returnObject;
        }

        if (thisSource) {
            elements = [ source ];
        } else {
            elements = source.children;
        }

        for (i = 0, len = elements.length; i < len; i += 1) {
            element = elements[i];
            if (element.shadowRoot) {
                hostXpath = new browserBaseService.Xpath(element);
                captures = getDOMCapture(element.ownerDocument, element.shadowRoot, "", options);
                const capturedShadow = {
                    root: captures.root,
                    originalSize: captures.originalSize,
                    xpath: hostXpath.xpath,
                };
                if (captures.frames && captures.frames.length > 0) {
                    capturedShadow.frames = captures.frames;
                }
                returnObject.shadows.push(capturedShadow);
                returnObject.shadows = returnObject.shadows.concat(captures.shadows);

                // Attach event listeners
                attachEventListeners(element.shadowRoot);
                // Observe Diffs
                if (diffEnabled) {
                    try {
                        diffObserver.observe(element.shadowRoot, diffObserverConfig);
                        element.shadowRoot.TLTListeners.mutation = true;
                        // Add element to list of observed Shadow hosts.
                        if (utils.indexOf(observedShadowHostList, element) === -1) {
                            observedShadowHostList.push(element);
                        }
                    } catch (e) {
                        utils.clog("Failed to observe shadow root.", e, element);
                    }
                }
            }
            captures = getShadowDOM(element, null, options);
            returnObject.shadows = returnObject.shadows.concat(captures.shadows);
        }
        return returnObject;
    }

    /**
     * Calculate the total length of the HTML in the captured object.
     * @private
     * @function
     * @param {Object} captureObj The DOM capture object containing the serialized HTML.
     * @returns {Number} Returns the total length of the serialized object.
     */
    function getCapturedLength(captureObj) {
        var i, j,
            len,
            attrLen,
            attrRecord,
            diffRecord,
            frames,
            shadows,
            totalLength = 0;

        if (!captureObj) {
            return totalLength;
        }

        if (captureObj.root) {
            totalLength += captureObj.root.length;
            if (captureObj.frames) {
                frames = captureObj.frames;
                for (i = 0, len = frames.length; i < len; i += 1) {
                    if (frames[i].root) {
                        totalLength += frames[i].root.length;
                    }
                }
            }
        } else if (captureObj.diffs) {
            for (i = 0, len = captureObj.diffs.length; i < len; i += 1) {
                diffRecord = captureObj.diffs[i];
                totalLength += diffRecord.xpath.length;
                if (diffRecord.root) {
                    totalLength += diffRecord.root.length;
                } else if (diffRecord.attributes) {
                    for (j = 0, attrLen = diffRecord.attributes.length; j < attrLen; j += 1) {
                        attrRecord = diffRecord.attributes[j];
                        totalLength += attrRecord.name.length;
                        if (attrRecord.value) {
                            totalLength += attrRecord.value.length;
                        }
                    }
                }
            }
        }

        if (captureObj.shadows) {
            shadows = captureObj.shadows;
            for (i = 0, len = shadows.length; i < len; i += 1) {
                if (shadows[i].root) {
                    totalLength += shadows[i].root.length;
                }
            }
        }

        return totalLength;
    }

    /**
     * Consolidates the DOM node mutation records and attribute mutation records. Removes
     * any attribute mutation records that are contained within any mutated target.
     * @private
     * @function
     */
    function consolidateMutationsWithAttributeChanges() {
        var i, j,
            len,
            parentTarget;

        for (i = 0, len = mutatedTargets.length; i < len && mutatedAttrTargets.length; i += 1) {
            parentTarget = mutatedTargets[i];
            // Search and eliminate any possible children contained within the parent
            for (j = 0; j < mutatedAttrTargets.length; j += 1) {
                if (mutatedAttrTargets[j].containedIn(parentTarget)) {
                    // Remove the child
                    mutatedAttrTargets.splice(j, 1);
                    // Decrement the array index to account for removal of the current entry
                    // The index will get auto incremented as part of the for-loop.
                    j -= 1;
                }
            }
        }
    }

    function enumerateUntrackedShadows(node) {
        var i, len,
            element,
            elements,
            shadowList = [];

        if (!node || !node.children) {
            return shadowList;
        }

        elements = node.children;

        for (i = 0, len = elements.length; i < len; i += 1) {
            element = elements[i];
            if (element.shadowRoot) {
                if (!element.shadowRoot.TLTListeners) {
                    shadowList.push([element, element.shadowRoot]);
                }
                shadowList = shadowList.concat(enumerateUntrackedShadows(element.shadowRoot));
            }
            shadowList = shadowList.concat(enumerateUntrackedShadows(element));
        }
        return shadowList;
    }

    function getUntrackedShadows(doc, options) {
        var i, len,
            shadows,
            retObj,
            untrackedShadowList;

        // Sanity check
        if (!doc || !options) {
            return;
        }

        if (!options.captureShadowDOM) {
            return;
        }

        untrackedShadowList = enumerateUntrackedShadows(doc);
        for (i = 0, len = untrackedShadowList.length, shadows = []; i < len; i += 1) {
            retObj = getShadowDOM(untrackedShadowList[i][0], null, options, true);
            shadows = shadows.concat(retObj.shadows);
        }
        return shadows;
    }


    /**
     * Capture the full DOM starting at the root element as per the provided configuration options.
     * @private
     * @function
     * @param {DOMNode} doc The document element that needs to be captured.
     * @param {Object}  options The capture options object.
     * @returns {Object} Returns the object containing the captured and serialized DOM.
     */
    function getFullDOM(doc, options) {
        let captureObj,
            urlInfo,
            shadowRoots,
            startTime,
            endTime;


        /**
         * Use the document instead of the documentElement because of Chrome bug
         * https://bugs.chromium.org/p/chromium/issues/detail?id=1042089
         */
        captureObj = getDOMCapture(doc, doc, null, options);
        if (!captureObj) {
            captureObj = {};
        }


        // Set the document charset
        captureObj.charset = doc.characterSet || doc.charset;

        // Add the host and url path
        urlInfo = utils.getOriginAndPath(doc.location);
        captureObj.host = urlInfo.origin;
        captureObj.url = core.normalizeUrl("", urlInfo.path, 12);

        return captureObj;
    }

    /**
     * Returns the DOM Diff object based on the consolidated mutation records. The Diff object
     * consists of the serialized HTML of added/removed nodes along with any attribute changes
     * on existing nodes.
     * @private
     * @function
     * @param {Object} options The capture options object.
     * @returns {Object} Returns the object containing the captured and serialized DOM Diff(s).
     */
    function getDOMDiff(options) {
        var i,
            len,
            returnObj = {
                fullDOM: false,
                diffs: [],
                attributeDiffs: {}
            },
            diff,
            idIndex,
          domId,
          root,
          rootXpath,
          style,
            oldXpath,
            captureShadowDOM,
            untrackedShadows,
            target,
            targetXpath,
            attributes,
            pattern = new RegExp("^data:image\/(.*?);base64");

        // Consolidate the DOM Node mutations
        consolidateTargets(mutatedTargets);
        // Consolidate the DOM Node mutations with the attribute mutations
        consolidateMutationsWithAttributeChanges();

        // Do not capture full Shadow DOM as part of the diff, any untracked Shadow roots will be captured subsequently
        captureShadowDOM = options.captureShadowDOM;
        options.captureShadowDOM = false;

        // Add the DOM Node mutations
        for (i = 0, len = mutatedTargets.length; i < len; i += 1) {
            targetXpath = mutatedTargets[i];
            target = browserBaseService.getNodeFromID(targetXpath.xpath, -2);
            if (!target) {
                // Target element no longer exists in the DOM, skip it.
                continue;
            }
            // If the target xpath is pointing to a shadow host
            if (targetXpath.isShadowHost) {
                target = target.shadowRoot;
                if (!target.TLTListeners) {
                    // This is a new shadow root which will be added to the shadows list subsequently. Skip it in the mutated list.
                    continue;
                }
            }
            if (target === window.document.body || target === window.document.documentElement) {
                // If diff includes the document body or documentElement, then send the full DOM instead.
                options.captureShadowDOM = captureShadowDOM;
                return getFullDOM(window.document, options);
            }
            diff = getDOMCapture(window.document, target, targetXpath, options);
            delete diff.originalSize;
            if (diff.shadows && diff.shadows.length === 0) {
                delete diff.shadows;
            }
            if (diff.frames && diff.frames.length === 0) {
                delete diff.frames;
            }
            diff.xpath = targetXpath.xpath;
            returnObj.diffs.push(diff);
        }

        for (i = 0; i < mutatedStyles.length; i += 1) {
            domId = mutatedStyles[i];
            root = roots[domId];

            style = getDynamicStyles(root);

            rootXpath = new browserBaseService.Xpath(root);

            if (rootXpath && rootXpath.xpath !== 'null') {
                rootXpath = rootXpath.xpath.slice(0, -1);
                rootXpath += ',[\"' + domId + '\"]]';
            } else {
                rootXpath = '[[\"' + domId + '\"]]'
            }

            diff = {
                root: style,
                xpath: rootXpath,
            };

            updateOwners[domId] = false;

            returnObj.diffs.push(diff);
        }
        // Helper function to add attribute diffs.
        function addAttributeDiffs(attribute, index) {
            // Sanity check
            if (!attribute || !attribute.name) {
                return;
            }
            returnObj.attributeDiffs[diff.xpath][attribute.name] = { value: attribute.value };
        }

        // Helper function to remove base64 src string
        function removeBase64SrcValue(attrList) {
            var j,
                attr,
                attrListLen;

            for (j = 0, attrListLen = attrList.length; j < attrListLen; j += 1) {
                attr = attrList[j];
                if (attr.name === "src" && pattern.test(attr.value) && attr.value.length > options.discardBase64) {
                    attr.value = "";
                    attrList.push({name: "removedByUIC", value: true});
                    break;
                }
            }

            return attrList;
        }

        // Add the attribute mutations
        for (i = 0, len = mutatedAttrTargets.length; i < len; i += 1) {
            targetXpath = mutatedAttrTargets[i];
            idIndex = getAttr(targetXpath.attributes, "id");
            if (idIndex > -1) {
                // Special processing when the HTML ID attribute has mutated
                // 1. Check that we can get to the target element using the full xpath.
                target = browserBaseService.getNodeFromID(targetXpath.fullXpath, -2);
                if (target) {
                    // 2. If the full xpath is valid, then use that as the xpath
                    targetXpath.xpath = targetXpath.fullXpath;
                }
            }
            attributes = removeOldAttrValues(targetXpath.attributes);

            if (options.hasOwnProperty("discardBase64")) {
                target = browserBaseService.getNodeFromID(targetXpath.xpath, -2);
                if (!target) {
                    // Try to get the target element using the full xpath.
                    target = browserBaseService.getNodeFromID(targetXpath.fullXpath, -2);
                }
                if (target && target.tagName.toLowerCase() === "img" && attributes) {
                    attributes = removeBase64SrcValue(attributes);
                }
            }

            diff = {
                xpath: targetXpath.xpath,
                attributes: attributes
            };
            returnObj.diffs.push(diff);

            // Add to the attributeDiffs object
            returnObj.attributeDiffs[diff.xpath] = {};
            utils.forEach(diff.attributes, addAttributeDiffs);
        }

        // Add newly created Shadow DOM roots not being tracked
        options.captureShadowDOM = captureShadowDOM;
        untrackedShadows = getUntrackedShadows(window.document, options);
        if (untrackedShadows && untrackedShadows.length) {
            returnObj.shadows = untrackedShadows;
        }

        return returnObj;
    }

    /**
     * Clone the provided document or element node.
     * @private
     * @function
     * @param {DOMNode} node The element to be duplicated.
     * @returns {DOMNode} Returns the duplicated node.
     */
    dupNode = function (node) {
        var dup = null;

        if (isNodeValidForCapture(node)) {
            dup = node.cloneNode(true);
            if (!dup && node.documentElement) {
                // Fix for Android and Safari bug which returns null when cloneNode is called on the document element.
                dup = node.documentElement.cloneNode(true);
            }
        }

        return dup;
    };

    /**
     * Capture the DOM starting at the root element as per the provided configuration options.
     * This function makes a copy of the root element and then applies various modifications to
     * the copy of the root such as removing script tags, removing comment nodes, applying input
     * textarea and select elements value attribute. Finally, the privacy rules are applied (by
     * invoking the message service's applyPrivacyToNode API)
     * @private
     * @function
     * @param {DOMNode} doc The document element.
     * @param {DOMNode} root The root element that needs to be captured. For a full DOM capture
     *                       this would be the same as the document element.
     * @param {Xpath}   rootXpath The root element's Xpath object.
     * @param {Object}  options The capture options object.
     * @returns {Object} Returns the object containing the captured and serialized DOM.
     */
    getDOMCapture = function (doc, root, rootXpath, options) {
        var cloned = true,
            rootCopy,
            rootHTML,
            frameCaptureObj,
            shadowDOMObj,
            captureObj = {},
            serializedDOM,
            placeholderDiv,
            captureDynamicStyles = dcServiceConfig.options.captureDynamicStyles,
            style,
            innerHTMLString;

        // Sanity check
        if (!doc || !root) {
            return captureObj;
        }

        // Record the original size of the HTML
        rootHTML = getHTMLText(root);
        if (rootHTML) {
            captureObj.originalSize = rootHTML.length;
        }

        // Make a copy of the root because we will be modifying it.
        rootCopy = dupNode(root, doc);
        if (!rootCopy && root.host) {
            // A shadow root cannot be cloned
            cloned = false;
            // Setup a temporary rootCopy using a placeholder div
            placeholderDiv = document.createElement("div");
            placeholderDiv.id = "srph-" + Date.now();
            innerHTMLString = getHTMLText(root);
            if (removeInnerHTMLRegex) {
                innerHTMLString = innerHTMLString.replace(removeInnerHTMLRegex, '');
            }
            placeholderDiv.innerHTML = innerHTMLString;
            rootCopy = placeholderDiv;
        } else if (!rootCopy) {
            // Could not copy the root node
            return captureObj;
        }

        if (rootCopy) {
            // Remove script tags
            if (!!options.removeScripts) {
                removeTags(rootCopy, "script");
                removeTags(rootCopy, "noscript");
            }

            // Remove link imports
            if (!options.keepImports) {
                removeTags(rootCopy, "link", ["rel", "import"]);
            }

            // Remove comment nodes
            if (!!options.removeComments) {
                removeNodes(rootCopy, 8);
            }

            // Remove inline style
            if (!options.captureStyle) {
                removeTags(rootCopy, "style");
            } else {
                if (options.useACS) {
                    // Add dynamic CSS - will be optimized by the ACS
                    fixStyles(root, rootCopy);
                }
            }

            // Remove base64 images, set "discardBase64: 0" to discard all base64 images
            if (options.hasOwnProperty("discardBase64")) {
                removeBase64Src(rootCopy, options.discardBase64);
            }

            // Set "selected" attribute on select list elements
            fixSelectLists(root, rootCopy);

            // Set attributes on input elements.
            fixInputs(root, rootCopy);

            // Set attributes on textarea elements.
            fixTextareas(root, rootCopy);

            // Apply privacy
            rootCopy = messageService.applyPrivacyToNode(rootCopy, rootXpath, doc);

            // Optionally capture any frames
            if (!!options.captureFrames) {
                // Get the iframes
                frameCaptureObj = getFrames(root, rootCopy, options);
            }
        }

        // Capture any shadow DOM trees
        if (!!options.captureShadowDOM) {
            shadowDOMObj = getShadowDOM(root, cloned ? rootCopy : null, options);
        }

        // Add all the captured data to the capture object
        if (frameCaptureObj) {
            captureObj = utils.mixin(captureObj, frameCaptureObj);
        }
        if (shadowDOMObj) {
            captureObj = utils.mixin(captureObj, shadowDOMObj);
        }

        serializedDOM = (getDoctypeAsString(root) || "") + getHTMLText(rootCopy || root, !cloned);

        // Apply privacy patterns to the serialized DOM
        captureObj.root = utils.applyPrivacyPatterns(serializedDOM);


        if (captureDynamicStyles && document.adoptedStyleSheets
          && (root instanceof Document || root instanceof ShadowRoot || root.isDocumentFromIframe
            || (root.nodeName === 'BODY' && root.ownerDocument.isDocumentFromIframe))) {

            // Checks if the root object is the body of an iFrame and swaps for the main document to be able to gather
            // all styles there and place them into the body. This avoids DOM diffs only sending the body content without the styles
            if (root.nodeName === 'BODY') {
                root = root.ownerDocument;
            }

            if (!root.domId) {
                initializeDOMRoot(root);
            }

            /* Checks if the owner of the StyleSheets needs to update the styles and
            * captures all the CSS rules for the DOM and every open Shadow. If not,
            * grabs all the known styles from the stylesCache.
            */

            style = getDynamicStyles(root);

            if (style) {
                // If the root is a shadow, add the styles at the beginning, otherwise look for the closing head tag in the DOM.
                if (root instanceof ShadowRoot) {
                    captureObj.root += style;
                } else {
                    captureObj.root = captureObj.root.replace('</body>', style + '</body>');
                }
            }
        }

        return captureObj;
    };

    function getDynamicStyles(root) {
        var ruleTextArr,
          style,
          rules,
          sheets,
        sheet,
          captureHREFStyles = dcServiceConfig.options.captureHREFStyles,
          i,
          j

        if (!updateOwners[root.domId]) return stylesCache[root.domId];

        sheets = [].concat.apply([], root.adoptedStyleSheets);
        sheets = sheets.concat.apply(sheets, root.styleSheets);


        if (sheets && sheets.length > 0) {
            ruleTextArr = [];
            for (i = 0; i < sheets.length; i += 1) {
                sheet = sheets[i];
                // Checks if the StyleSheet is from a link, so it only captures its rules if the captureHREFStyles flag is enabled.
                // It also checks if the StyleSheet comes from a style tag, if so, it always skips it because it is always being captured unless explicitly told no.
                if ((!captureHREFStyles && !root.isDocumentFromIframe && sheet.href) || (sheet.ownerNode && sheet.ownerNode.textContent)) continue;
                // Checks if the CSSStyleSheet is accessible and catch any error.
                try {
                    rules = sheet.cssRules;
                } catch (e) {
                    continue;
                }


                for (j = 0; j < rules.length; j += 1) {
                    ruleTextArr.push(rules[j].cssText);
                }
            }
            if (ruleTextArr.length > 0) {
                style = '<style id="' + root.domId + '">' + ruleTextArr.join(" ") + '</style>';
                stylesCache[root.domId] = style;
            }
        }
            // After capturing all the styles, sets the owner as updated to avoid iterate again over the same styles.
        updateOwners[root.domId] = false;

        return style;
    }

    /**
     * Callback function which receives notification from config service when
     * the configuration is updated.
     * @private
     * @function
     */
    updateConfig = function () {
        configService = core.getService("config");
        // TODO: reinit only if config changed.
        initDOMCaptureService(configService.getServiceConfig("domCapture") || {});
    };

    /**
     * @scope domCaptureService
     */
    return {
        /**
         * Callback function invoked by the core to initialize the DOM Capture service.
         * @private
         * @function
         */
        init: function () {
            configService = core.getService("config");
            if (!isInitialized) {
                initDOMCaptureService(configService.getServiceConfig("domCapture") || {});
            } else {
            }
        },

        /**
         * Callback function invoked by the core to destroy the DOM Capture service.
         * @private
         * @function
         */
        destroy: function () {
            destroyDOMCaptureService();
        },

        /**
         * Adds the specified window object to the list of windows to be observed.
         * @param  {DOMWindow} win The window object to be added.
         */
        observeWindow: function (win) {
            if (!win) {
                return;
            }

            if (!utils.getValue(dcServiceConfig, "options.captureFrames", false) && !(win === window)) {
                // Do not observe any frame/iframe windows if the option is not enabled
                return;
            }

            if (utils.indexOf(observedWindowList, win) === -1) {
                observedWindowList.push(win);

                if (diffObserver && lazyload) {
                    diffObserver.observe(win.document, diffObserverConfig);
                }
            }
        },

        /**
         * API function exposed by the DOM Capture service. Accepts the root element and
         * DOM capture options object.
         * @param  {DOMNode} root The root element for the DOM capture.
         * @param  {Object}  options The configuration options for performing the DOM capture.
         * @return {Object} An object containing the captured DOM.
         */
        captureDOM: function (root, options) {
            var i,
                len,
                captureObj = null,
                observedWindow,
                totalLength = 0;

            // Sanity check - DOM Capture is not supported on IE 9 and below
            if (!isInitialized || (utils.isIE && document.documentMode < 10)) {
                return captureObj;
            }

            // Merge user configured options with built-in configuration options
            options = utils.mixin({}, dcServiceConfig.options, options);

            root = root || window.document;

            if (!fullDOMSent || !diffEnabled || forceFullDOM || options.forceFullDOM) {
                if (diffObserver) {
                    // Stop observing
                    diffObserver.disconnect();
                }
                // Capture full DOM
                captureObj = getFullDOM(root, options);

                // Set flags indicating this is a fullDOM and if it was forced.
                captureObj.fullDOM = true;
                captureObj.forced = !!(forceFullDOM || options.forceFullDOM);

                // Remember a full DOM has been sent for later.
                fullDOMSent = true;

                if (diffObserver) {
                    // Start observing for diffs from the recently captured full DOM
                    for (i = 0, len = observedWindowList.length; i < len; i += 1) {
                        observedWindow = observedWindowList[i];
                        try {
                            diffObserver.observe(observedWindow.document, diffObserverConfig);
                        } catch (e) {
                            // The observed window is no longer valid.
                            observedWindowList.splice(i, 1);
                            len = observedWindowList.length;
                            i -= 1;
                        }
                    }
                }
            } else {
                captureObj = getDOMDiff(options);
                // Set fullDOM to false or true depending on if diffs are present
                captureObj.fullDOM = captureObj.diffs ? false : true;
            }

            if (diffEnabled) {
                // Add the number of mutations that were processed.
                captureObj.mutationCount = mutationCount;
            }

            // Clean the slate of any mutation records.
            clearMutationRecords();

            // Check if the capture meets the length threshold (if any)
            if (options.maxLength) {
                totalLength = getCapturedLength(captureObj);
                if (totalLength > options.maxLength) {
                    captureObj = {
                        errorCode: 101,
                        error: "Captured length (" + totalLength + ") exceeded limit (" + options.maxLength + ")."
                    };
                }
            }

            return captureObj;
        }
    };
});


/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview The EncoderService provides the ability to extend the library with various data encodings.
 * @exports encoderService
 */

/*global TLT:true, window: true */
/*global console: false */

/**
 * @name encoderService
 * @namespace
 */
TLT.addService("encoder", function (core) {
    "use strict";

    var encoderServiceConfig = {},
        configService = null,
        handleConfigUpdated = null,
        isInitialized = false;

    /**
     * Returns the encoder object for the specified encoder type.
     * @private
     * @function
     * @param {String} type The type of encoder object. e.g. "gzip"
     * @returns {Object} The encoder object or null if not found.
     */
    function getEncoder(type) {
        var encoder = null;

        // Sanity check
        if (!type) {
            return encoder;
        }
        encoder = encoderServiceConfig[type];
        if (encoder && typeof encoder.encode === "string") {
            encoder.encode = core.utils.access(encoder.encode);
        }

        return encoder;
    }

    /**
     * Initializes the encoder service.
     * @private
     * @function
     * @param {Object} config The configuration object for this service
     */
    function initEncoderService(config) {
        encoderServiceConfig = config;

        configService.subscribe("configupdated", handleConfigUpdated);
        isInitialized = true;
    }

    /**
     * Destroys the encoder service.
     * @private
     * @function
     */
    function destroy() {
        configService.unsubscribe("configupdated", handleConfigUpdated);

        isInitialized = false;
    }

    /**
     * Callback handler for the configupdated event. Refreshes the service configuration to the latest.
     * @private
     * @function
     */
    handleConfigUpdated = function () {
        configService = core.getService("config");
        // TODO: reinit only if config changed.
        initEncoderService(configService.getServiceConfig("encoder") || {});
    };

    /**
     * @scope serializerService
     */
    return {

        init: function () {
            configService = core.getService("config");
            if (!isInitialized) {
                initEncoderService(configService.getServiceConfig("encoder") || {});
            } else {
            }
        },

        destroy: function () {
            destroy();
        },

        /**
         * Encodes data using specified encoder.
         * @param  {String} data The data to encode.
         * @param  {String} type The name of the encoder to use.
         * @return {Object} An object containing the encoded data or error message.
         */
        encode: function (data, type) {
            var encoder,
                result,
                returnObj = {
                    data: null,
                    encoding: null,
                    error: null
                };

            // Sanity check
            if ((typeof data !== "string" && !data) || !type) {
                returnObj.error = "Invalid " + (!data ? "data" : "type") + " parameter.";
                return returnObj;
            }

            // Get the specified encoder
            encoder = getEncoder(type);
            if (!encoder) {
                returnObj.error = "Specified encoder (" + type + ") not found.";
                return returnObj;
            }

            // Sanity check
            if (typeof encoder.encode !== "function") {
                returnObj.error = "Configured encoder (" + type + ") 'encode' method is not a function.";
                return returnObj;
            }

            try {
                // Invoke the encode method of the encoder and return the result.
                result = encoder.encode(data);
            } catch (e) {
                returnObj.error = "Exception " + (e.name ? e.name + " - " : "") + (e.message || e);
                return returnObj;
            }

            if (!result || core.utils.getValue(result, "buffer", null) === null) {
                returnObj.error = "Encoder (" + type + ") returned an invalid result.";
                return returnObj;
            }

            returnObj.data = result.buffer;
            returnObj.encoding = encoder.defaultEncoding;

            return returnObj;
        }
    };
});



/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview The MessageService creates messages in the correct format to be transmitted to the server.
 * @exports messageService
 */

/*global TLT:true,performance */

/**
 * @name messageService
 * @namespace
 */
TLT.addService("message", function (core) {
    "use strict";

    var utils = core.utils,
        tabId = core.getTabId(),
        screenviewOffsetList = [],
        count             = 0,
        messageCount      = 0,
        coreStartTime     = core.getStartTime(),
        pageStartTime     = window.performance && performance.timeOrigin && performance.timeOrigin < coreStartTime ? Math.round(performance.timeOrigin) : coreStartTime,
        maxTimeDiff       = 10 + (Date.now() - pageStartTime),
        timezoneOffset    = (new Date()).getTimezoneOffset(),
        browserBaseService = core.getService("browserBase"),
        browserService    = core.getService("browser"),
        configService     = core.getService("config"),
        coreConfig        = configService.getCoreConfig(),
        config            = configService.getServiceConfig("message") || {},
        windowHref        = core.normalizeUrl("", window.location.href),
        windowHostname    = window.location.hostname,
        priorPageTerminationReason,
        priorPageUrl,
        privacy           = config.hasOwnProperty("privacy") ? config.privacy : [],
        privacyPatterns,
        privacyMasks      = {},
        maskingCharacters = {
            lower: "x",
            upper: "X",
            numeric: "9",
            symbol: "@"
        },

        devicePixelRatio = parseFloat((window.devicePixelRatio || 1).toFixed(2)),
        screen = window.screen || {},
        screenWidth = screen.width || 0,
        screenHeight = screen.height || 0,
        deviceOrientation = browserBaseService.getNormalizedOrientation(),
        // iOS Safari reports constant width/height irrespective of orientation, so we have to swap manually
        deviceWidth = !utils.isiOS ? screenWidth : Math.abs(deviceOrientation) === 90 ? screenHeight : screenWidth,
        deviceHeight = !utils.isiOS ? screenHeight : Math.abs(deviceOrientation) === 90 ? screenWidth : screenHeight,
        deviceToolbarHeight = (window.screen ? window.screen.height - window.screen.availHeight : 0),
        startWidth = window.innerWidth || document.documentElement.clientWidth,
        startHeight = window.innerHeight || document.documentElement.clientHeight,
        isInitialized = false,
        shadowMessageCache = {},
        isShadowDomCacheEnabled = false;

    /**
     * @returns Returns the offset (in milliseconds) from page start time.
     */
    function getCurrentOffset() {
        var dateOffset = Date.now() - pageStartTime,
            offset = window.performance && performance.now ? Math.round(performance.now()) : dateOffset;

        if (dateOffset - offset > maxTimeDiff) {
            // Performance.now has drifted from Date.now, revert to using Date.now
            offset = dateOffset;
        }

        return offset;
    }

    /**
     * Base structure for a message object.
     * @constructor
     * @private
     * @name messageService-Message
     * @param {Object} event The QueueEvent to transform into a message object.
     */
    function Message(event) {
        var key = '';

        delete event.timestamp;

        /**
         * The message type.
         * @type {Number}
         * @see browserService-Message.TYPES
         */
        this.type          = event.type;
        /**
         * The offset from the beginning of the session.
         * @type {Number}
         */
        this.offset        = getCurrentOffset();

        if (event.type === 2 && event.screenview.type === "LOAD") {
            screenviewOffsetList.push(getCurrentOffset());
            this.screenviewOffset = 0;
        } else if (screenviewOffsetList.length) {
            /**
             * The offset from the most recent screenview load
             * @type {Number}
             */
            this.screenviewOffset = getCurrentOffset() - screenviewOffsetList[screenviewOffsetList.length - 1];
            if (event.type === 2 && event.screenview.type === "UNLOAD") {
                screenviewOffsetList.pop();
            }
        } else {
            this.screenviewOffset = 0;
        }

        // If message type is 0 it is a dummy request to obtain current offsets.
        if (!this.type) {
            return;
        }

        /**
         * The count of the overall messages until now.
         * @type {Number}
         */
        this.count         = (messageCount += 1);

        /**
         * To indicate that user action came from the web.
         * @type {Boolean}
         */
        this.fromWeb       = true;

        // iterate over the properties in the queueEvent and add all the objects to the message.
        for (key in event) {
            if (event.hasOwnProperty(key)) {
                this[key] = event[key];
            }
        }
    }

    /**
     * Empty filter. Returns an empty string which would be used as value.
     * @param  {String} value The value of the input/control.
     * @return {String}       Returns an empty string.
     */
    privacyMasks.PVC_MASK_EMPTY = function (value) {
        return "";
    };

    /**
     * Basic filter. Returns a predefined string for every value.
     * @param  {String} value The value of the input/control.
     * @return {String}       Returns a predefined mask/string.
     */
    privacyMasks.PVC_MASK_BASIC = function (value) {
        var retMask = "XXXXX";

        // Sanity check
        if (typeof value !== "string") {
            return "";
        }
        return (value.length ? retMask : "");
    };

    /**
     * Type filter. Returns predefined values for uppercase/lowercase
     *                         and numeric values.
     * @param  {String} value The value of the input/control.
     * @return {String}       Returns a string/mask which uses predefined
     *                        characters to mask the value.
     */
    privacyMasks.PVC_MASK_TYPE = function (value) {
        var characters,
            i,
            len,
            retMask = "";

        // Sanity check
        if (typeof value !== "string") {
            return retMask;
        }

        characters = value.split("");

        for (i = 0, len = characters.length; i < len; i += 1) {
            if (utils.isNumeric(characters[i])) {
                retMask += maskingCharacters.numeric;
            } else if (utils.isUpperCase(characters[i])) {
                retMask += maskingCharacters.upper;
            } else if (utils.isLowerCase(characters[i])) {
                retMask += maskingCharacters.lower;
            } else {
                retMask += maskingCharacters.symbol;
            }
        }
        return retMask;
    };

    privacyMasks.PVC_MASK_EMPTY.maskType = 1; // reported value is empty string.
    privacyMasks.PVC_MASK_BASIC.maskType = 2; // reported value is fixed string "XXXXX".
    privacyMasks.PVC_MASK_TYPE.maskType = 3;  // reported value is a mask according to character type
                                              // as per configuration, e.g. "HelloWorld123" becomes "XxxxxXxxxx999".
    privacyMasks.PVC_MASK_CUSTOM = {
        maskType: 4 // reported value is return value of custom function provided by config.
    };

    /**
     * Checks which mask should be used to replace the value and applies
     * it to the string. If an invalid mask is specified,
     * the BASIC mask will be applied.
     * @param  {Object} mask The privacy object.
     * @param  {String} str  The string to be masked.
     * @param  {DOMElement} [element] The element object to which privacy is being applied.
     * @return {String} The masked value.
     */
    function maskStr(mask, str, element) {
        var filter = privacyMasks.PVC_MASK_BASIC;

        // Sanity check
        if (typeof str !== "string") {
            return str;
        }

        if (!mask) {
            // Default
            filter = privacyMasks.PVC_MASK_BASIC;
        } else if (mask.maskType === privacyMasks.PVC_MASK_EMPTY.maskType) {
            filter = privacyMasks.PVC_MASK_EMPTY;
        } else if (mask.maskType === privacyMasks.PVC_MASK_BASIC.maskType) {
            filter = privacyMasks.PVC_MASK_BASIC;
        } else if (mask.maskType === privacyMasks.PVC_MASK_TYPE.maskType) {
            filter = privacyMasks.PVC_MASK_TYPE;
        } else if (mask.maskType === privacyMasks.PVC_MASK_CUSTOM.maskType) {
            if (typeof mask.maskFunction === "string") {
                filter = utils.access(mask.maskFunction);
            } else {
                filter = mask.maskFunction;
            }
            if (typeof filter !== "function") {
                // Reset to default
                filter = privacyMasks.PVC_MASK_BASIC;
            }
        }
        return filter(str, element);
    }

    /**
     * Checks which mask should be used to replace the value and applies
     * it on the message object. By default, if an invalid mask is specified,
     * the BASIC mask will be applied.
     * @param  {Object} mask  The privacy object.
     * @param  {Object} state The prevState or currState state object.
     */
    function applyMask(mask, state) {
        var prop;

        // Sanity check
        if (!mask || !state) {
            return;
        }

        for (prop in state) {
            if (state.hasOwnProperty(prop)) {
                if (prop === "value") {
                    // Mask the value
                    state[prop] = maskStr(mask, state[prop]);
                } else {
                    // Remove all other state information as it could compromise privacy.
                    delete state[prop];
                }
            }
        }
    }

    /**
     * Checks whether one of the privacy targets matches the target
     * of the current message.
     * @param  {Array} targets An array of objects as defined in the
     *                         privacy configuration.
     * @param  {Object} target  The target object of the message.
     * @return {Boolean}         Returns true if one of the targets match.
     *                           Otherwise false.
     */
    function matchesTarget(targets, target) {
        return (utils.matchTarget(targets, target) !== -1);
    }

    /**
     * Applies the privacy mask to the attributes in the target.
     * @param  {Object} mask The privacy object containing the attribute mask type or function.
     * @param  {Object} target The target object.
     * @return {Object} Object with masked attributes.
     */
    function applyAttributeMask(mask, target) {
        var attr,
            retVal = null;

        // Sanity check
        if (!mask || !mask.maskAttributes || !target || !target.attributes) {
            return retVal;
        }

        if (typeof mask.maskAttributes === "function") {
            try {
                retVal = mask.maskAttributes(target.id, target.attributes);
            } catch (e) {
                // Do nothing.
            }
        } else {
            retVal = target.attributes;
            for (attr in target.attributes) {
                if (target.attributes.hasOwnProperty(attr)) {
                    retVal[attr] = maskStr(mask, target.attributes[attr]);
                }
            }
        }
        return retVal;
    }

    /**
     * Runs through all privacy rules and checks if any rule matches the
     * target object. If yes, applies privacy mask to the target currState
     * and prevState.
     * @param  {Object} target  The target object.
     * @return {Object}         The target, either with replaced values
     *                          if a target of the privacy configuration
     *                          matched or the original target if the
     *                          configuration didn't match.
     */
    function privacyFilter(target) {
        var i,
            len,
            exclude,
            mask,
            maskApplied = false,
            prevState,
            currState;

        // Sanity check
        if (!target || (!target.currState && !target.prevState && !target.attributes) || !target.id) {
            return target;
        }

        prevState = target.prevState;
        currState = target.currState;

        for (i = 0, len = privacy.length; i < len; i += 1) {
            mask = privacy[i];
            exclude = utils.getValue(mask, "exclude", false);
            if (matchesTarget(mask.targets, target) !== exclude) {
                if (prevState && prevState.hasOwnProperty("value")) {
                    applyMask(mask, prevState);
                }
                if (currState && currState.hasOwnProperty("value")) {
                    applyMask(mask, currState);
                }
                if (mask.maskAttributes && target.attributes) {
                    target.attributes = applyAttributeMask(mask, target);
                }
                maskApplied = true;
                break;
            }
        }

        if (!maskApplied) {
            // Apply privacy patterns
            if (prevState && prevState.value) {
                prevState.value = utils.applyPrivacyPatterns(prevState.value, privacyPatterns);
            }
            if (currState && currState.value) {
                currState.value = utils.applyPrivacyPatterns(currState.value, privacyPatterns);
            }
        }

        return target;
    }

    /**
     * Runs through all the privacy rules and checks if any rule matches
     * the target of the message object.
     * @param  {Object} message The message object.
     * @return {Object}         The message, either with replaced values
     *                          if a target of the privacy configuration
     *                          matched or the original values if the
     *                          target didn't match.
     */
    function applyPrivacyToMessage(message) {
        // Sanity check
        if (!message || !message.target) {
            return message;
        }

        privacyFilter(message.target);
        return message;
    }

    /**
     * Replaces actual value attribute with a masked value as per the specified masking rule.
     * For select list elements it also sets the selectedIndex property to -1
     * and removes the selected attribute from its option elements.
     * @param {Element} element DOM element
     * @param {Object} mask The masking rule
     */
    function maskElement(element, mask) {
        var i,
            len,
            maskedValue,
            option;

        // Sanity check
        if (!mask || !element) {
            return;
        }

        if (element.value) {
            maskedValue = maskStr(mask, element.value, element);
            element.setAttribute("value", maskedValue);
            element.value = maskedValue;
        } else if (mask.maskType === privacyMasks.PVC_MASK_CUSTOM.maskType) {
            // Invoke custom masking function even if the element has no value.
            maskStr(mask, "", element);
        }

        if (element.checked) {
            element.removeAttribute("checked");
        }

        // Special handling for select element
        if (utils.getTagName(element) === "select") {
            element.selectedIndex = -1;
            for (i = 0, len = element.options.length; i < len; i += 1) {
                option = element.options[i];
                option.removeAttribute("selected");
                option.selected = false;
            }
        } else if (utils.getTagName(element) === "textarea") {
            // Special handling for textarea element
            element.textContent = element.value;
        }
    }

    /**
     * This function accepts a list of privacy rules containing regex and xpath targets.
     * It tests each of these rules with all the input, textarea and select elements in
     * the scope of the root node. Elements that match the rule are privacy masked or
     * excluded from privacy masking as per the configuration.
     * @param {Array} regexAndXpathRules List containing privacy rules with regex and xpath targets.
     * @param {DOMNode} root Node subtree to which privacy is to be applied.
     * @param {Array} rootXpath The full xpath of the root node.
     * @param {DOMNode} doc The document object associated with the root node.
     * @param {Array} excludedElements List containing elements to be excluded from privacy masking.
     * @param {Object} excludeMask Object specifying the privacy mask to be applied to any remaining non-excluded elements.
     */
    function applyRegexAndXpathPrivacyRules(regexAndXpathRules, root, rootXpath, doc, excludedElements, excludeMask) {
        var i, j, k,
            len,
            element,
            elementInfo,
            elements = [],
            elementXpath,
            exclude,
            rule,
            target,
            qr;

        // Check if there are any privacy rules to be applied based on regex or xpath targets
        if (!regexAndXpathRules.length && !excludedElements.length && !excludeMask) {
            return [];
        }

        // Identify all eligible input, select and textarea elements from the DOM subtree
        qr = browserService.queryAll("input, select, textarea", root);
        if (!qr || !qr.length) {
            return [];
        }

        // Remove excluded elements (if any)
        for (i = 0, len = excludedElements.length; i < len; i += 1) {
            j = qr.indexOf(excludedElements[i]);
            if (j !== -1) {
                qr.splice(j, 1);
            }
        }

        // Only calculate element xpaths if there are regex or xpath rules
        if (regexAndXpathRules.length) {
            // Calculate the id & idType of each element
            for (i = 0, len = qr.length, elements = []; i < len; i += 1) {
                if (qr[i].value) {
                    elementInfo = browserBaseService.ElementData.prototype.examineID(qr[i], true);

                    // Xpath needs additional processing
                    if (elementInfo.idType === -2) {
                        // Element xpath needs to be prefixed with the rootXpath
                        elementXpath = new browserBaseService.Xpath(qr[i], true);
                        elementXpath.applyPrefix(rootXpath);
                        elementInfo.id = elementXpath.xpath;
                    }

                    elements.push({
                        id: elementInfo.id,
                        idType: elementInfo.idType,
                        element: qr[i]
                    });
                }
            }
        }

        // Test each element against the regex and xpath rules
        for (i = 0, len = regexAndXpathRules.length; i < len; i += 1) {
            rule = privacy[regexAndXpathRules[i].ruleIndex];
            exclude = utils.getValue(rule, "exclude", false);
            target = rule.targets[regexAndXpathRules[i].targetIndex];
            if (typeof target.id === "string" && target.idType === -2) {
                // Normal Xpath id
                for (j = 0; j < elements.length; j += 1) {
                    if (elements[j].idType === target.idType && elements[j].id === target.id) {
                        if (!exclude) {
                            // Apply the mask
                            element = elements[j].element;
                            maskElement(element, rule);
                        } else {
                            k = qr.indexOf(element);
                            qr.splice(k, 1);
                        }
                    }
                }
            } else {
                // Regex
                for (j = 0; j < elements.length; j += 1) {
                    target.cRegex.lastIndex = 0;
                    if (elements[j].idType === target.idType && target.cRegex.test(elements[j].id)) {
                        element = elements[j].element;
                        if (!exclude) {
                            // Apply the mask
                            maskElement(element, rule);
                        } else {
                            k = qr.indexOf(element);
                            qr.splice(k, 1);
                        }
                    }
                }
            }
        }

        if (excludeMask) {
            // Apply privacy mask to any remaining non-excluded elements
            for (i = 0, len = qr.length; i < len; i += 1) {
                maskElement(qr[i], excludeMask);
            }
        }
    }

    /**
     * Applies the privacy configuration to all the matching elements
     * of the specified DOM object.
     * @param  {DOMNode} root The DOM node to which the privacy rules need to be applied.
     * @param  {Xpath} rootXpath The root node's Xpath object.
     * @return {DOMNode} The document object to which the privacy rules have been applied.
     */
    function applyPrivacyToNode(root, rootXpath, doc) {
        var i, j, k,
            element,
            exclude,
            excludedElements = [],
            excludeMask,
            len,
            mask,
            qr,
            qrLen,
            regexAndXpathRules = [],
            target,
            targets,
            targetsLen;

        // Sanity check
        if (!root || !doc) {
            return null;
        }

        // Go through each privacy rule
        for (i = 0, len = privacy.length; i < len; i += 1) {
            mask = privacy[i];
            exclude = utils.getValue(mask, "exclude", false);
            if (exclude) {
                excludeMask = mask;
            }
            targets = mask.targets;
            // Go through each target
            for (j = 0, targetsLen = targets.length; j < targetsLen; j += 1) {
                target = targets[j];
                if (typeof target === "string") {
                    // CSS selector
                    if (!(root.id && /srph-\d{13}/.test(root.id)) && browserService.matches(target, root)) {
                        // Selector matches the root element
                        if (!exclude) {
                            maskElement(root, mask);
                        } else {
                            excludedElements.push(root);
                        }
                    }

                    qr = browserService.queryAll(target, root);
                    if (!exclude) {
                        for (k = 0, qrLen = qr.length; k < qrLen; k += 1) {
                            element = qr[k];
                            maskElement(element, mask);
                        }
                    } else {
                        excludedElements = excludedElements.concat(qr);
                    }
                } else {
                    if (typeof target.id === "string") {
                        switch (target.idType) {
                        case -1:
                        case -3:
                            element = browserBaseService.getNodeFromID(target.id, target.idType, root);
                            if (!exclude) {
                                maskElement(element, mask);
                            } else {
                                excludedElements.push(element);
                            }
                            break;
                        case -2:
                            // Handle the case where the target.id is XPath
                            regexAndXpathRules.push({
                                ruleIndex: i,
                                targetIndex: j,
                                exclude: exclude
                            });
                            break;
                        default:
                            break;
                        }
                    } else {
                        // Handle the case where the target.id is a regex.
                        regexAndXpathRules.push({
                            ruleIndex: i,
                            targetIndex: j,
                            exclude: exclude
                        });
                    }
                }
            }
        }

        applyRegexAndXpathPrivacyRules(regexAndXpathRules, root, rootXpath, doc, excludedElements, excludeMask);

        return root;
    }

    /**
     * Returns true if the target matches a privacy rule.
     * @param {Object} target The target object.
     * @return {Boolean} True if the target matched with a privacy rule, false otherwise.
     */
    function isPrivacyMatched(target) {
        var i,
            len,
            mask,
            retVal = false;

        if (!target) {
            return retVal;
        }

        for (i = 0, len = privacy.length; i < len; i += 1) {
            mask = privacy[i];
            if (matchesTarget(mask.targets, target)) {
                retVal = true;
                break;
            }
        }
        return retVal;
    }

    /**
     * Gets called when the configserver fires configupdated event.
     */
    function updateConfig() {
        var i, j,
            len,
            rule,
            rulesLen,
            target,
            targets,
            targetsLen;

        configService = core.getService("config");
        config = configService.getServiceConfig("message") || {};
        coreConfig = configService.getCoreConfig();
        privacy = config.privacy || [];
        privacyPatterns = config.privacyPatterns || [];
        isShadowDomCacheEnabled = utils.getValue(config, "shadowDOMCacheEnabled", true);

        // Fix idType to integers and setup regex targets (if any)
        for (i = 0, rulesLen = privacy.length; i < rulesLen; i += 1) {
            rule = privacy[i];
            targets = rule.targets;
            for (j = 0, targetsLen = targets.length; j < targetsLen; j += 1) {
                target = targets[j];
                if (typeof target === "object") {
                    if (typeof target.idType === "string") {
                        // Force idType conversion to a Number
                        target.idType = +target.idType;
                    }
                    if (typeof target.id === "object") {
                        // Regex target
                        target.cRegex = new RegExp(target.id.regex, target.id.flags);
                    }
                }
            }
        }

        // Validate privacy patterns and cache the regex.
        for (len = privacyPatterns.length, i = len - 1; i >= 0; i -= 1) {
            rule = privacyPatterns[i];
            if (typeof rule.pattern === "object") {
                rule.cRegex = new RegExp(rule.pattern.regex, rule.pattern.flags);
            } else {
                privacyPatterns.splice(i, 1);
            }
        }
    }

    function initMessageService() {
        if (configService.subscribe) {
            configService.subscribe("configupdated", updateConfig);
        }

        updateConfig();

        isInitialized = true;
    }

    function destroy() {
        configService.unsubscribe("configupdated", updateConfig);

        isInitialized = false;
    }

    /**
     * This function will will optimize the dom capture message by
     * replacing content with cached dcids if content matching is found.
     * @param {Object} domCapture The dom capture message object.
     */
    function optimizeDOMCaptureMessage(domCapture) {
        var dcid = domCapture.dcid,
            shadows = domCapture.shadows || [],
            isFullDom = domCapture.fullDOM,
            ageThreshold = 1,
            i,
            len,
            key,
            shadowNode,
            cachedNode;

        if (shadows.length === 0 || !isFullDom) {
            return;
        }

        for (key in shadowMessageCache) {
            if (shadowMessageCache.hasOwnProperty(key)) {
                shadowMessageCache[key].age += 1;
            }
        }

        for (i = 0, len = shadows.length; i < len; i += 1) {
            shadowNode = shadows[i];
            cachedNode = shadowMessageCache[shadowNode.xpath];

            if (cachedNode && cachedNode.root === shadowNode.root) {
                cachedNode.hitCount += 1;
                cachedNode.age -= 1;
                shadowNode.cacheDCID = cachedNode.dcid;
                delete shadowNode.root;
            } else {
                // add or update xpath to cache
                shadowMessageCache[shadowNode.xpath] = {
                    root: shadowNode.root,
                    dcid: dcid,
                    hitCount: 0,
                    age: 0
                };
            }
        }

        //clear obsolete xpath
        for (key in shadowMessageCache) {
            if (shadowMessageCache.hasOwnProperty(key)) {
                cachedNode = shadowMessageCache[key];
                if (cachedNode.age > cachedNode.hitCount + ageThreshold) {
                    delete shadowMessageCache[key];
                }
            }
        }
    }


    /**
     * @scope messageService
     */
    return {

        init: function () {
            if (!isInitialized) {
                initMessageService();
                try {
                    priorPageTerminationReason = sessionStorage.getItem("tl.TR");
                    priorPageUrl = sessionStorage.getItem("tl.PU");
                    sessionStorage.removeItem("tl.TR");
                    sessionStorage.removeItem("tl.PU");
                } catch (e) {
                    priorPageTerminationReason = null;
                }
            } else {
            }
        },

        destroy: function () {
            destroy();
        },

        applyPrivacyToNode: applyPrivacyToNode,

        applyPrivacyToMessage: applyPrivacyToMessage,

        applyPrivacyToTarget: privacyFilter,

        isPrivacyMatched: isPrivacyMatched,

        /**
         * Accepts a simple queue event  and wraps it into a complete message that the server can understand.
         * @param  {Object} event The simple event information
         * @return {Object}       A complete message that is ready for transmission to the server.
         */
        createMessage: function (event) {
            if (typeof event.type === "undefined") {
                throw new TypeError("Invalid queueEvent given!");
            }

            if (event.type === 12 && isShadowDomCacheEnabled) {
                optimizeDOMCaptureMessage(event.domCapture);
            }

            return applyPrivacyToMessage(new Message(event));
        },

        /**
         * Function to create a JSON structure around messages before sending to server.
         * @param  {Array} messages An array of messages
         * @return {Object}          Returns a JavaScript object which can be serialized to JSON
         *      and send to the server.
         */
        wrapMessages: function (messages) {
            var messagePackage = {
                messageVersion: "13.0.0.0",
                serialNumber: (count += 1),
                sessions: [{
                    id: core.getPageId(),
                    tabId: tabId,
                    startTime: pageStartTime,
                    timezoneOffset: timezoneOffset,
                    messages: messages,
                    clientEnvironment: {
                        webEnvironment: {
                            libVersion: "6.4.40",
                            buildNote: coreConfig.buildNote || "",
                            domain: windowHostname,
                            page: windowHref,
                            referrer: document.referrer,
                            mouseMovement: core.isMousemovementDetected(),
                            screen: {
                                devicePixelRatio: devicePixelRatio,
                                deviceWidth: deviceWidth,
                                deviceHeight: deviceHeight,
                                deviceToolbarHeight: deviceToolbarHeight,
                                width: startWidth,
                                height: startHeight,
                                orientation: deviceOrientation
                            }
                        }
                    }
                }]
            },
                webEnv = messagePackage.sessions[0].clientEnvironment.webEnvironment;

            webEnv.screen.orientationMode = utils.getOrientationMode(webEnv.screen.orientation);

            if (priorPageTerminationReason) {
                webEnv.priorPage = {
                    page: priorPageUrl,
                    terminationReason: priorPageTerminationReason
                };
            }

            return messagePackage;
        },
        getCurrentOffset: getCurrentOffset
    };
});

/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview The SerializerService provides the ability to serialize
 * data into one or more string formats.
 * @exports serializerService
 */

/*global TLT:true, window: true */
/*global console: false */

/**
 * @name serializerService
 * @namespace
 */
TLT.addService("serializer", function (core) {
    "use strict";

    /**
     * Serializer / Parser implementations
     * @type {Object}
     */
    var configService = core.getService("config"),
        serialize = {},
        parse = {},
        defaultSerializer = {
            json: (function () {
                if (typeof window.JSON !== "undefined") {
                    return {
                        serialize: window.JSON.stringify,
                        parse: window.JSON.parse
                    };
                }

                // No native JSON support.
                return {};
            }())
        },
        updateConfig = null,
        isInitialized = false;

    function addObjectIfExist(paths, rootObj, propertyName) {
        var i,
            len,
            obj;

        paths = paths || [];
        for (i = 0, len = paths.length; i < len; i += 1) {
            obj = paths[i];
            if (typeof obj === "string") {
                obj = core.utils.access(obj);
            }
            if (typeof obj === "function") {
                rootObj[propertyName] = obj;
                break;
            }
        }
    }
	function checkParserAndSerializer() {
		var isParserAndSerializerInvalid;
        if (typeof serialize.json !== "function" || typeof parse.json !== "function") {
			isParserAndSerializerInvalid = true;
        } else {
			if (typeof parse.json('{"foo": "bar"}') === "undefined") {
				isParserAndSerializerInvalid = true;
			} else {
				isParserAndSerializerInvalid = parse.json('{"foo": "bar"}').foo !== "bar";
			}
			if (typeof parse.json("[1, 2]") === "undefined") {
				isParserAndSerializerInvalid = true;
			} else {
				isParserAndSerializerInvalid = isParserAndSerializerInvalid || parse.json("[1, 2]")[0] !== 1;
				isParserAndSerializerInvalid = isParserAndSerializerInvalid || parse.json("[1,2]")[1] !== 2;
			}
			isParserAndSerializerInvalid = isParserAndSerializerInvalid || serialize.json({"foo": "bar"}) !== '{"foo":"bar"}';
			isParserAndSerializerInvalid = isParserAndSerializerInvalid || serialize.json([1, 2]) !== "[1,2]";
		}
		return isParserAndSerializerInvalid;
	}

    function initSerializerService(config) {
        var format;
        for (format in config) {
            if (config.hasOwnProperty(format)) {
                addObjectIfExist(config[format].stringifiers, serialize, format);
                addObjectIfExist(config[format].parsers, parse, format);
            }
        }

        serialize.json = serialize.json || defaultSerializer.json.serialize;
        parse.json = parse.json || defaultSerializer.json.parse;

        // Sanity check
        if (typeof serialize.json !== "function" || typeof parse.json !== "function") {
            core.fail("JSON parser and/or serializer not provided in the UIC config. Can't continue.");
        }
		if (checkParserAndSerializer()) {
			core.fail("JSON stringification and parsing are not working as expected");
		}

        if (configService) {
            configService.subscribe("configupdated", updateConfig);
        }

        isInitialized = true;
    }


    function destroy() {
        serialize = {};
        parse = {};

        if (configService) {
            configService.unsubscribe("configupdated", updateConfig);
        }

        isInitialized = false;
    }

    updateConfig = function () {
        configService = core.getService("config");
        // TODO: reinit only if config changed. Verify initSerializerService is idempotent
        initSerializerService(configService.getServiceConfig("serializer"));
    };

    /**
     * @scope serializerService
     */
    return {
        init: function () {
            var ssConfig;

            if (!isInitialized) {
                ssConfig = configService ? configService.getServiceConfig("serializer") : {};
                initSerializerService(ssConfig);
            } else {
            }
        },

        destroy: function () {
            destroy();
        },

        /**
         * Parses a string into a JavaScript object.
         * @param  {String} data The string to parse.
         * @param  {String} [type="json"] The format of the data.
         * @return {Object}      An object representing the string data.
         */
        parse: function (data, type) {
            type = type || "json";
            return parse[type](data);
        },

        /**
         * Serializes object data into a string using the format specified.
         * @param  {Object} data The data to serialize.
         * @param  {String} [type="json"] The format to serialize the data into.
         * @return {String}      A string containing the serialization of the data.
         */
        serialize: function (data, type) {
            var serializedData;

            type = type || "json";

            serializedData = serialize[type](data);

            return serializedData;
        }
    };
});

/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview The TLCookie module implements the functionality related to reading, setting and transmitting cookies and tokens.
 * @exports TLCookie
 */

/*global TLT:true */

TLT.addModule("TLCookie", function (context) {
    "use strict";

    let moduleConfig = {},
        reqHeaders = [],
        sessionIDStorageTTL = 0,
        sessionIDUsesCookie = true,
        sessionIDUsesStorage = false,
        wcxCookieValue,
        tltCookieValue,
        visitorCookieValue = null,
        tlAppKey,
        cookieValue,
        visitorCookieName = "CoreID6",
        wcxCookieName = "WCXSID",
        tltCookieName = "TLTSID",
        utils = context.utils;
    const cookieName = "TLTDID",
        cookieMaxAge = 60*60*24*365, // 1 year
        cookieSecure = false,
        cookieSamesite = "Lax";

    /**
     * Return a random 32 digit string.
     * @function
     * @private
     * @return {String} A randomly generated 32 digit string.
     */
    function generateTLTSID() {
        let dataSet = "123456789",
            tltsid = utils.getRandomString(1, dataSet) + utils.getRandomString(31, dataSet + "0");

        return tltsid;
    }

    /**
     * Create a TLTSID cookie using a randomly generated 32 character length string.
     * This is a session cookie i.e. no expires or max-age.
     * @function
     * @private
     * @return {String} The session cookie value or null if the cookie could not be set.
     */
    function createTLTSIDCookie() {
        let cookieValue = generateTLTSID(),
            secure = !!moduleConfig.secureTLTSID,
            samesite = moduleConfig.samesite;

        // Set the session cookie
        utils.setCookie(tltCookieName, cookieValue, undefined, undefined, undefined, secure, samesite);

        return utils.getCookieValue(tltCookieName);
    }

    /**
     * Get DA visitor cookie (CoreID6) and store it in visitorCookieValue.
     * @function
     * @private
     */
    function getVisitorCookie() {
        if (visitorCookieValue || !window.cmRetrieveUserID) {
            return;
        }

        try {
            window.cmRetrieveUserID(function (id) {
                visitorCookieValue = id;
            });
        } catch (e) {
            visitorCookieValue = null;
        }
    }

    /**
     * Parse and return the session id value from localStorage.
     * @function
     * @private
     * @param {String} sidKey The session id key.
     * @return {String}|undefined Returns the session id value if found, else returns undefined.
     */
    function getSIDFromStorage(sidKey) {
        let expires,
            items,
            itemVal,
            sidValue;

        // Sanity check
        if (!localStorage || !sidKey) {
            return;
        }

        itemVal = localStorage.getItem(sidKey);
        if (itemVal) {
            items = itemVal.split("|");
            expires = parseInt(items[0], 10);
            if (Date.now() > expires) {
                localStorage.removeItem(sidKey);
            } else {
                sidValue = items[1];
            }
        }

        return sidValue;
    }

    /**
     * Set the session id value in localStorage along with the expiration time.
     * @function
     * @private
     * @param {String} sidKey The session id key.
     * @param {String} sidValue The session id value.
     * @return {String}|undefined Returns the session id value if set, else returns undefined.
     */
    function setSIDInStorage(sidKey, sidValue) {
        let expires;

        // Sanity check
        if (!localStorage || !sidKey) {
            return;
        }

        sidValue = sidValue || generateTLTSID();
        expires = Date.now() + sessionIDStorageTTL;
        localStorage.setItem(sidKey, expires + "|" + sidValue);

        return getSIDFromStorage(sidKey);
    }

    /**
     * Callback function
     * @function
     * @private
     * @returns {Array} List of request headers in { name, value } pairs.
     */
    function addReqHeaders() {
        return reqHeaders;
    }

    /**
     * Process the module configuration and setup the corresponding cookies and tokens.
     * Setup the callback to add the respective headers when the library POSTs.
     * @function
     * @private
     * @param {object} config The module configuration.
     */
    function processConfig(config) {
        reqHeaders = [];

        sessionIDUsesCookie = utils.getValue(config, "sessionIDUsesCookie", true);
        sessionIDUsesStorage = utils.getValue(config, "sessionIDUsesStorage", false);

        // Check if the tlAppKey is specified
        if (config.tlAppKey) {
            tlAppKey = config.tlAppKey;
            reqHeaders.push(
                {
                    name: "X-Tealeaf-SaaS-AppKey",
                    value: tlAppKey
                }
            );
        }

        if (config.visitorCookieName) {
            visitorCookieName = config.visitorCookieName;
        }

        /**
         * WCX session cookie processing
         */
        if (config.wcxCookieName) {
            wcxCookieName = config.wcxCookieName;
        }
        wcxCookieValue = utils.getCookieValue(wcxCookieName);
        if (wcxCookieValue) {
            reqHeaders.push(
                {
                    name: "X-WCXSID",
                    value: wcxCookieValue
                }
            );
        }

        /**
         * TLTSID processing
         */
        if (config.sessionizationCookieName) {
            tltCookieName = config.sessionizationCookieName;
        }

        // Storing the session value in Storage is preferred over cookie when both are enabled.
        // Hence, check localStorage for session id before checking cookie.
        if (sessionIDUsesStorage) {
            sessionIDStorageTTL = utils.getValue(config, "sessionIDStorageTTL", 600000);
            // localStorage may not be available.
            try {
                tltCookieValue = getSIDFromStorage(tltCookieName);
            } catch (e) {
                sessionIDUsesStorage = false;
            }
        }
        if (!tltCookieValue && sessionIDUsesCookie) {
            tltCookieValue = utils.getCookieValue(tltCookieName);
        }

        // A new session id needs to be created. Check for WCXSID before creating a new TLTSID.
        if (!tltCookieValue) {
            if (wcxCookieValue) {
                tltCookieName = wcxCookieName;
                tltCookieValue = wcxCookieValue;
            } else {
                if (sessionIDUsesStorage) {
                    // localStorage may not be available.
                    try {
                        tltCookieValue = setSIDInStorage(tltCookieName);
                    } catch (e2) {
                        sessionIDUsesStorage = false;
                    }
                }
                if (!tltCookieValue && sessionIDUsesCookie) {
                    // Create the TLTSID session cookie
                    tltCookieValue = createTLTSIDCookie();
                }
            }
        }
        context.setSessionCookieInfo(tltCookieName, tltCookieValue);

        // Add device cookie
        cookieValue = utils.getCookieValue(cookieName);
        if (!cookieValue || cookieValue === undefined) {
            cookieValue = generateTLTSID();
        }
        utils.setCookie(cookieName, cookieValue, cookieMaxAge, undefined, undefined, cookieSecure, cookieSamesite);

        // Session id could not be created in either Storage or Cookie!
        if (!tltCookieValue) {
            tltCookieValue = "Check7UIC7Cookie7Configuration77";
        }
        reqHeaders.push(
            {
                name: "X-Tealeaf-SaaS-TLTSID",
                value: tltCookieValue
            }
        );
        reqHeaders.push(
            {
                name: "X-Tealeaf-SaaS-TLTDID",
                value: cookieValue
            }
        );

        if (reqHeaders.length) {
            // Register the callback function to pass the X-Tealeaf headers
            TLT.registerBridgeCallbacks([
                {
                    enabled: true,
                    cbType: "addRequestHeaders",
                    cbFunction: addReqHeaders
                }
            ]);
        }
    }

    /**
     * Check if the cookie name is whitelisted
     * @function
     * @private
     * @param {String} cookieName The cookie name.
     * @returns {Boolean} true if name is whitelisted, false otherwise.
     */
    function isCookieWhitelisted(cookieName) {
        let i, len,
            result = false,
            rule,
            whitelist = moduleConfig.appCookieWhitelist;

        // Sanity check
        if (!whitelist || !whitelist.length) {
            return result;
        }

        for (i = 0, len = whitelist.length; i < len && !result; i += 1) {
            rule = whitelist[i];
            if (rule.regex) {
                // Create the RegExp object once
                if (!rule.cRegex) {
                    rule.cRegex = new RegExp(rule.regex, rule.flags);
                }
                // Reset and test
                rule.cRegex.lastIndex = 0;
                result = rule.cRegex.test(cookieName);
            } else {
                result = (rule === cookieName);
            }
        }

        return result;
    }

    /**
     * Read the document level cookies, filter them as per the configured whitelist,
     * and record them in a type 14 message.
     * @function
     * @private
     */
    function postAppCookies() {
        let i, j, len,
            appCookies = {},
            cookie,
            cookies = document.cookie,
            cookieList = [],
            cookieName = "",
            cookieValue = "";

        if (!cookies) {
            return;
        }

        cookieList = cookies.split("; ");
        for (i = 0, len = cookieList.length; i < len; i += 1) {
            cookie = cookieList[i];
            j = cookie.indexOf("=");
            // Handle edge case where cookie has no name i.e. j == -1
            if (j >= 0) {
                try {
                    cookieName = decodeURIComponent(cookie.substring(0, j));
                } catch (e1) {
                    cookieName = cookie.substring(0, j);
                }
            }
            cookieValue = cookie.substring(j + 1);
            // Check if this cookie is whitelisted
            if (isCookieWhitelisted(cookieName)) {
                try {
                    appCookies[cookieName] = decodeURIComponent(cookieValue);
                } catch (e2) {
                    appCookies[cookieName] = cookieValue;
                }
            }
        }

        // Add in the visitor cookie if not already present
        if (visitorCookieValue && !appCookies[visitorCookieName]) {
            appCookies[visitorCookieName] = visitorCookieValue;
        }

        context.post({
            type: 14,
            cookies: appCookies
        });
    }

    // Return the module's interface object. This contains callback functions which
    // will be invoked by the UIC core.
    return {
        init: function () {
            moduleConfig = context.getConfig() || {};
            processConfig(moduleConfig);

            getVisitorCookie();
        },

        destroy: function () {
            if (sessionIDUsesStorage) {
                // Reset the expiry of the storage session id
                setSIDInStorage(tltCookieName, tltCookieValue);
            }
            // Unregister previously registered callback after termination
            window.setTimeout(function () {
                TLT.registerBridgeCallbacks([
                    {
                        enabled: false,
                        cbType: "addRequestHeaders",
                        cbFunction: addReqHeaders
                    }
                ]);
            });
        },

        onevent: function (webEvent) {
            switch (webEvent.type) {
            case "screenview_load":
                if (utils.getValue(moduleConfig, "appCookieWhitelist.length", 0)) {
                    getVisitorCookie();
                    postAppCookies();
                }
                break;
            }
        }
    };
});


/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview The Data Layer module implements the logic for monitoring and
 * reporting various data layer objects.
 * @exports dataLayer
 */

/*global TLT:true,Node,Window */
// Sanity check
if (TLT && typeof TLT.addModule === "function") {
    /**
     * @name dataLayer
     * @namespace
     */
    TLT.addModule("dataLayer", function (context) {
    "use strict";

    let initialized = false,
        moduleConfig,
        utils = context.utils,
        MAXNESTLIMIT = 10,
        includeEverything = true,
        currentScreenView = '',
        dataObjects = [],
        dlTimer = 0,
        dlWaitTime = 25,
        dlInterval = 300,
        dlTimeout = 50000,
        dlArrIndex = 0,
        dlMyTimeout,
        dlObjPostedSet = new Set();

    /**
     * Returns the index of the rule, if the given string matches the blocklist.
     * @private
     * @function
     * @name dataLayer-getMatchIndex
     * @param {string} str The string to be checked.
     * @param {array} blocklist List of rules to match against. Each entry in the list can be a string or an object { regex, flags }
     * @returns {integer} -1 if there is no match. The index of the blocklist rule in case of a match.
     */
    function getMatchIndex(str, blocklist) {
        let i,
            len,
            rule,
            retVal = -1;

        // Sanity check
        if (!str || !blocklist) {
            return retVal;
        }

        for (i = 0, len = blocklist.length; i < len && retVal === -1; i += 1) {
            rule = blocklist[i];
            switch (typeof rule) {
            case "string":
                if (str === rule) {
                    retVal = i;
                }
                break;
            case "object":
                if (!rule.cRegex) {
                    // Cache the regex object.
                    rule.cRegex = new RegExp(rule.regex, rule.flags);
                }
                rule.cRegex.lastIndex = 0;
                if (rule.cRegex.test(str)) {
                    retVal = i;
                }
                break;
            }
        }

        return retVal;
    }

    /**
     * Check if the property name matches the blocklist.
     * @private
     * @function
     * @name dataLayer-isPropertyBlocked
     * @param {string} propertyName The name of the property to be checked.
     * @param {array} [blocklist] List of rules to match against.
     * @returns {boolean} True if the property is on the blocklist.
     */
    function isPropertyBlocked(propertyName, blocklist) {
        return (getMatchIndex(propertyName, blocklist) >= 0);
    }

    /**
     * Check if the screenview name matches the blocklist.
     * @private
     * @function
     * @name dataLayer-isScreenviewBlocked
     * @param {string} screenviewName The screenview name to be checked.
     * @param {array} [blocklist] List of rules to match against.
     * @returns {boolean} True if the screenview is on the blocklist.
     */
    function isScreenviewBlocked(screenviewName, blocklist) {
        return (getMatchIndex(screenviewName, blocklist) >= 0);
    }

    /**
     * Apply blocklist and return the final data object to be logged.
     * @private
     * @function
     * @name dataLayer-processDataLayerObject
     * @param {Object} dataObject The data layer object.
     * @param {Number} [nestLevel] The nesting level of the data object.
     * @param {Object} [rules] The different rules for block and / or capture specific properties
     * @param {string} [rootProp] The property in the path to look for a permittedProperty
     * A nesting level of 1 is assumed if none is specified.
     * @returns {Object} The processed data layer object with blocklist applied.
     */
    function processDataLayerObject(dataObject, nestLevel, rules, rootProp) {
        let property,
            value,
            retObj = {},
            propertyBlocklist = (rules && rules.propertyBlocklist) ? rules.propertyBlocklist : [],
            rootProperties = (rules && rules.rootProperties) ? rules.rootProperties : {};

        // Sanity check
        if (!dataObject) {
            return null;
        }

        // Nesting level check
        if (!nestLevel) {
            nestLevel = 1;
        } else {
            nestLevel += 1;
            if ((nestLevel > 5 && !rootProp) || nestLevel > MAXNESTLIMIT) {
                return "Serialization error: Exceeds nesting limit (5) or (10) for a permitted property.";
            }
        }

        for (property in dataObject) {
            if (Object.prototype.hasOwnProperty.call(dataObject, property)) {
                // Blocklist check
                if (!isPropertyBlocked(property, propertyBlocklist)) {
                    if (nestLevel === 1) {
                        rootProp = '';
                        if (property in rootProperties) {
                            rootProp = property
                        }
                    }
                    if ((!includeEverything && !rootProp)
                        || (nestLevel > 5 && rootProp && property !== rootProperties[rootProp][nestLevel - 1] && !!rules.rootProperties[rootProp][nestLevel - 1])) {
                        continue;
                    }

                    value = dataObject[property];
                    // Copy only relevant properties while ignoring functions and undefined values.
                    switch (typeof value) {
                    case "object":
                        // Check if it is a DOM node
                        if (value instanceof Node) {
                            // Log the nodeName and id (if any)
                            if (value.nodeName) {
                                retObj[property] = value.nodeName.toLowerCase();
                                if (value.id) {
                                    retObj[property] += "#" + value.id;
                                }
                            } else {
                                retObj[property] = "DOMNode: unknown";
                            }
                        } else if (value instanceof Window) {
                            retObj[property] = "DOMWindow: " + value.location.href;
                        } else {
                            // Check if the object can be serialized
                            try {
                                // Process arrays as objects.
                                retObj[property] = processDataLayerObject(value, nestLevel, rules, rootProp);
                            } catch (e) {
                                retObj[property] = "Serialization error: " + e.message;
                            }
                        }
                        break;
                    case "function":
                    case "undefined":
                        // skip functions or undefined
                        break;
                    default:
                         // mask string value
                        if (rules && rules.privacyPatterns) {
                            value = utils.applyPrivacyPatterns(value, rules.privacyPatterns);
                        }
                        retObj[property] = value;
                        break;
                    }
                }
            }
        }
        return retObj;
    }   

    /**
     * Retrieves the data layer object from the configuration.
     * @private
     * @function
     * @name dataLayer-getDataLayerObject
     * @return {Object} The data layer object or null.
     */
    function getDataLayerObject(dataObject) {
        let dataObj = null;

        // Sanity check
        if (!dataObject) {
            return dataObj;
        }

        switch (typeof dataObject) {
        case "string":
            dataObj = utils.access(dataObject);
            break;
        case "object":
            dataObj = dataObject;
            break;
        case "function":
            try {
              dataObj = dataObject();
            } catch (e) {
            }
            break;
        }
        return dataObj;
    }

    /**
     * Iterates through all the dataLayer objects to capture.
     * @private
     * @function
     * @name dataLayer-logDataLayers
     * @param {Object} [screenviewName] The name of the screen view that triggered the capture of the data layer.
     */
    function logDataLayers() {
        let screenviewBlocklist,
            i;
        // Sanity checks
        if (!initialized) {
            return;
        }

        for (i = 0; i < dataObjects.length; i += 1) {
            screenviewBlocklist = dataObjects[i].rules ? dataObjects[i].rules.screenviewBlocklist : [];
            if (!isScreenviewBlocked(currentScreenView, screenviewBlocklist)) {
                let dataObject = getDataLayerObject(dataObjects[i].dataObject);

                if (!dataObject) {
                    // Nothing to log or unable to retrieve the data object.
                    return;
                }
                let rules = dataObjects[i].rules

                if (rules) {
                    includeEverything = rules.includeEverything !== undefined ? rules.includeEverything : true;

                    if (rules.privacyPatterns) {
                        // Validate privacy patterns
                        for (let len = rules.privacyPatterns.length, i = len - 1; i >= 0; i -= 1) {
                            const rule = rules.privacyPatterns[i];
                            if (typeof rule.pattern === 'object') {
                                rule.cRegex = new RegExp(rule.pattern.regex, rule.pattern.flags);
                            } else {
                                rules.privacyPatterns.splice(i, 1);
                            }
                        }
                    }
                }

                if (dataObject instanceof Array) {
                    dataObject = dataObject.filter(item => {
                        if (rules && rules.filter) {
                            for (const propToFilter of rules.filter) {
                                let itemProp;
                                let itemVal;
                                let matchProp = propToFilter.matchProperty;
                                let matchVal = propToFilter.matchValue;
                                let hasArguments = false;
                                if (Object.prototype.toString.call( item ) === '[object Arguments]') {
                                    itemProp = item[0];
                                    itemVal = item[1];
                                    hasArguments = true;
                                } else {
                                    itemProp = item[propToFilter.matchProperty];
                                    itemVal = propToFilter.matchValue;
                                }
                                return testValue(item, itemProp, itemVal, matchProp, matchVal, hasArguments);
                            }
                        }
                        return true;
                    }).map(item => processDataLayerObject(item, 0, rules));

                    dataObject.forEach(function (dataObjectItem) {
                        postDL(dataObjectItem);
                    });
                } else {
                    postDL(processDataLayerObject(dataObject, 0, rules));
                }

                // reset back to true
                includeEverything = true;
            }
        }
    }

    function testValue(obj, prop, value, matchProp, matchVal, hasArguments) {
        if (!hasArguments) {
            if (typeof prop === 'string' && typeof value === 'string' && prop === value) {
                return true;
            } else if (typeof prop === 'string' && typeof matchProp === 'string' && typeof obj === 'object' &&
                        (value === null || value === '' || value === undefined) &&
                        (matchVal === null || matchVal === '' || matchVal === undefined) && obj.hasOwnProperty(matchProp)) {
                return true;
            } else if (typeof prop === 'string' && typeof matchProp === 'string' && typeof obj === 'object' && typeof matchVal === 'object') {
                let valueRegex = new RegExp(matchVal);
                return valueRegex.test(obj[matchProp]);
            } else if (typeof matchProp === 'object' && typeof obj === 'object' && (matchVal === null || matchVal === '' || matchVal === undefined)) {
                const keys = Object.keys(obj);
                for (const key of keys) {
                    const valueRegex = new RegExp(matchProp)
                    if (valueRegex.test(key)) {
                        return true
                    }
                }
            }
        } else {
            if (typeof prop === 'string' && typeof matchProp === 'string' && typeof value === 'string' && typeof matchVal === 'string' && prop === matchProp && value === matchVal) {
                return true;
            } else if (typeof prop === 'string' && typeof matchProp === 'string' && typeof value === 'object' && (matchVal === null || matchVal === '' || matchVal === undefined) && prop === matchProp) {
                return true;
            } else if (typeof prop === 'string' && typeof matchProp === 'string' && typeof value === 'string' && typeof matchVal === 'object' && typeof matchVal === 'object') {
                let valueRegex = new RegExp(matchVal);
                return valueRegex.test(value);
            } else if (typeof prop === 'string' && typeof matchProp === 'object' && typeof prop === 'string' && (matchVal === null || matchVal === '' || matchVal === undefined)) {
                let valueRegex = new RegExp(matchProp);
                return valueRegex.test(prop);
            }
        }
        return false;
    }

    function postDL(dataObject) {
        if (!dataObject) {
            return;
        } 
        let key 
        try {
            key = JSON.stringify(dataObject);
        } catch (error) {
            key = Object.keys(dataObject).map(key => `${key}=${dataObject[key]}`).join("_");
        }
        if (dlObjPostedSet.has(key)) {
            return;
        } else {
            if (key) {
                dlObjPostedSet.add(key);
            }
        }

        const dataLayerMsg = {
            type: 19,
            dataLayer: dataObject
        }
        // Invoke the context API to post the message.
        context.post(dataLayerMsg);
    }

    function waitDataLog(delayTime, arr) {
        return setTimeout(function() {
            if (dlArrIndex >= arr.length - 1) {
                logDataLayers();
            } else {
                dlArrIndex = arr.length;
                waitDataLog(delayTime, arr);
            }
        }, delayTime)
    }

    function waitForObject(trackObj) {
        let trackObjStr
        if (trackObj && trackObj.dataObject && typeof trackObj.dataObject === 'string') {
            trackObjStr = trackObj.dataObject.replace(/\window\./,"");
            let trackObjFound = window[trackObjStr];
            if (!trackObjFound) {
                dlTimer += dlInterval;
                if (dlTimer > dlTimeout) {
                    return;
                }
                setTimeout(function() {
                    waitForObject(trackObj);
                }, dlInterval)
            } else {
                waitForObjectHelper(trackObjFound, "window['" + trackObj + "']")
            }
        } else if (trackObj && (Array.isArray(trackObj.dataObject) || typeof trackObj.dataObject === 'object')) {
            waitForObjectHelper(trackObj, "trackObj as object");
        } else {
            return;
        }
    }

    function waitForObjectHelper(tObj, conmsg) {
        if (!tObj) {
            return;
        }

        if (Array.isArray(tObj)) {
            tObj.oldPush = Array.prototype.push;
            tObj.push = function(obj) {
                tObj.onPush(obj);
                tObj.oldPush(obj);
            };
            tObj.onPush = function(obj){
                dlArrIndex = tObj.length - 1;

                if (dlMyTimeout) {
                    clearTimeout(dlMyTimeout);
                }
                dlMyTimeout = setTimeout(function() {
                        waitDataLog(dlWaitTime, tObj);
                }, dlInterval);
            };
        } else if (typeof tObj === 'object' &&
                   !Array.isArray(tObj) &&
                   tObj !== null) {
            const validObjectUpdate = {
                set: function(target, key, value) {
                    logDataLayers();
                    return true;
                }
            };
            const store = new Proxy(tObj, validObjectUpdate);
            if (store) {
                logDataLayers();
            }
        }
    }

    // Module interface.
    /**
     * @scope dataLayer
     */
    return {
        /**
         * Initialize the dataLayer module.
         */
        init: function () {
            moduleConfig = context.getConfig();
            initialized = true;

            dataObjects = [];

            if (moduleConfig.dataObjects) {
                dataObjects = moduleConfig.dataObjects;
                for (const dataSet of dataObjects) {
                    if (dataSet.rules && dataSet.rules.permittedProperties) {
                        const permittedProperties = dataSet.rules.permittedProperties;
                        dataSet.rules.rootProperties = {};
                        for (let j = 0; j < permittedProperties.length; j += 1) {
                            if (typeof permittedProperties[j] === "string") {
                                permittedProperties[j] = permittedProperties[j].split('.');
                                dataSet.rules.rootProperties[permittedProperties[j][0]] = permittedProperties[j];
                            }
                        }
                    }
                }
            }
        },

        /**
         * Terminate the dataLayer module.
         */
        destroy: function () {
            moduleConfig = null;
            initialized = false;
        },

        /**
         * Handle events subscribed by the dataLayer module.
         * @param  {Object} event The normalized data extracted from a browser event object.
         */
        onevent: function (event) {
            // Sanity check
            if (!event || typeof event !== "object" || !event.type) {
                return;
            }

            switch (event.type) {
            case "load":
                currentScreenView = '';
                break;
            case "screenview_load":
                // Log the data layer if the screenview isn't blocked and a prior log request isn't already pending.
                currentScreenView = event.name;
                if (dataObjects) {
                    dataObjects.forEach(function (dataObjectItem) {
                        waitForObject(dataObjectItem);
                    });
                }
                break;
            case "click":
            case "pointerdown":
                break;
            case "logDataLayers":
                if (!event.data || typeof event.data === "object") {
                    // Explicitly log the data layer.
                    logDataLayers();
                }
                break;
            case "unload":
                break;
            }
        },

        /**
         * Handle system messages subscribed by the module.
         * @param  {Object} msg An object containing the message information.
         */
        onmessage: function (msg) {

        }
    };
})}

/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview The Overstat module implements the logic for collecting
 * data for cxOverstat. The current uses are for the Hover Event and
 * Hover To Click event.
 * @exports overstat
 */

/*global TLT:true */
// Sanity check
if (TLT && typeof TLT.addModule === "function") {
    /**
     * @name overstat
     * @namespace
     */
    TLT.addModule("overstat", function (context) {
        "use strict";

        var utils = context.utils,
            eventMap = {},
            configDefaults = {
                updateInterval : 250,
                hoverThreshold : 1000,
                hoverThresholdMax : 2 * 60 * 1000,
                gridCellMaxX : 10,
                gridCellMaxY : 10,
                gridCellMinWidth : 20,
                gridCellMinHeight : 20
            },
            MAX_ITERATIONS = 50;

        function getConfigValue(key) {
            var overstatConfig = context.getConfig() || {},
                value = overstatConfig[key];
            return typeof value === "number" ? value : configDefaults[key];
        }

        function postUIEvent(hoverEvent, options) {
            var target = utils.getValue(hoverEvent, "webEvent.target", {}),
                tagName = utils.getValue(target, "element.tagName") || "",
                type = tagName.toLowerCase() === "input" ? utils.getValue(target, "element.type") : "",
                tlType = utils.getTlType(target),
                uiEvent = {
                    type: 9,
                    event: {
                        hoverDuration: hoverEvent.hoverDuration,
                        hoverToClick: utils.getValue(options, "hoverToClick")
                    },
                    target: {
                        id: target.id || "",
                        idType: target.idType || "",
                        name: target.name || "",
                        tlType: tlType,
                        type: tagName,
                        subType: type,
                        position: {
                            width: utils.getValue(target, "element.offsetWidth", 0),
                            height: utils.getValue(target, "element.offsetHeight", 0),
                            relXY: hoverEvent.relXY
                        }
                    }
                };

            // if id is null or empty, what are we firing on? it can't be replayed anyway
            if (!uiEvent.target.id) {
                return;
            }

            if (target.accessibility) {
                uiEvent.target.accessibility = target.accessibility;
            }

            if (target.attributes) {
                uiEvent.target.attributes = target.attributes;
            }

            context.post(uiEvent);
        }

        function getNativeNode(node) {
            if (node && !node.nodeType && node.element) { node = node.element; }
            return node;
        }

        function stopNode(node) {
            node = getNativeNode(node);
            return !node || node === document.body || node === document.html || node === document;
        }

        function getParent(node) {
            node = getNativeNode(node);
            if (!node) { return null; }
            return node.parentNode;
        }

        function getOffsetParent(node) {
            node = getNativeNode(node);
            if (!node) { return null; }
            return node.offsetParent || node.parentElement || getParent(node);
        }

        /*
         * for when mouseout is called - if you have moved over a child element, mouseout is fired for the parent element
         * @private
         * @function
         * @name overstat-isChildOf
         * @return {boolean} Returns whether node is a child of root
         */
        function isChildOf(root, node) {
            var idx = 0;
            if (!node || node === root) { return false; }
            node = getParent(node);

            while (!stopNode(node) && idx++ < MAX_ITERATIONS) {
                if (node === root) { return true; }
                node = getParent(node);
            }

            if (idx >= MAX_ITERATIONS) {
                utils.clog("Overstat isChildOf() hit iterations limit");
            }

            return false;
        }

        function getNativeEvent(e) {
            if (e.nativeEvent) { e = e.nativeEvent; }
            return e;
        }

        function getNodeType(node) {
            node = getNativeNode(node);
            if (!node) { return -1; }
            return node.nodeType || -1;
        }

        function getNodeTagName(node) {
            node = getNativeNode(node);
            if (!node) { return ""; }
            return node.tagName ? node.tagName.toUpperCase() : "";
        }

        function ignoreNode(node) {
            var tagName = getNodeTagName(node);
            return getNodeType(node) !== 1 || tagName === "TR" || tagName === "TBODY" || tagName === "THEAD";
        }

        /**
         * Generates an XPath for a given node, stub method until the real one is available
         * @function
         */
        function getXPathFromNode(node) {
            if (!node) { return ""; }
            if (node.xPath) { return node.xPath; }
            node = getNativeNode(node);
            return context.getXPathFromNode(node);
        }

        /*
         * replacement for lang.hitch(), setTimeout loses all scope
         * @private
         * @function
         * @name overstat-callHoverEventMethod
         * @return {object} Returns the value of the called method
         */
        function callHoverEventMethod(key, methodName) {
            var hEvent = eventMap[key];
            if (hEvent && hEvent[methodName]) { return hEvent[methodName](); }
        }

        function HoverEvent(dm, gx, gy, webEvent) {
            this.xPath = dm !== null ? getXPathFromNode(dm) : "";
            this.domNode = dm;
            this.hoverDuration = 0;
            this.hoverUpdateTime = 0;
            this.gridX = Math.max(gx, 0);
            this.gridY = Math.max(gy, 0);
            this.parentKey = "";
            this.updateTimer = -1;
            this.disposed = false;
            this.childKeys = {};
            this.webEvent = webEvent;

            /*
             * @public
             * @function
             * @name overstat-HoverEvent.getKey
             * @return {string} Returns the string unique key of this event
             */
            this.getKey = function () {
                return this.xPath + ":" + this.gridX + "," + this.gridY;
            };

            /*
             * update hoverTime, set timer to update again
             * @public
             * @function
             * @name overstat-HoverEvent.update
             */
            this.update = function () {
                var curTime = new Date().getTime(),
                    key = this.getKey();

                if (this.hoverUpdateTime !== 0) {
                    this.hoverDuration += curTime - this.hoverUpdateTime;
                }

                this.hoverUpdateTime = curTime;

                clearTimeout(this.updateTimer);
                this.updateTimer = setTimeout(function () { callHoverEventMethod(key, "update"); }, getConfigValue("updateInterval"));
            };

            /*
             * leaveClone is true if you want to get rid of an event but leave a new one in it's place.
             * usually this will happen due to a click, where the hover ends, but you want a new hover to
             * begin in the same place
             * @public
             * @function
             * @name overstat-HoverEvent.dispose
             */
            this.dispose = function (leaveClone) {
                clearTimeout(this.updateTimer);
                delete eventMap[this.getKey()];
                this.disposed = true;

                if (leaveClone) {
                    var cloneEvt = this.clone();
                    eventMap[cloneEvt.getKey()] = cloneEvt;
                    cloneEvt.update();
                }
            };

            /*
             * clear update timer, add to hover events queue if threshold is reached, dispose in any case
             * @public
             * @function
             * @name overstat-HoverEvent.process
             * @return {boolean} Returns whether or not the event met the threshold requirements and was added to the queue
             */
            this.process = function (wasClicked) {
                clearTimeout(this.updateTimer);
                if (this.disposed) { return false; }

                var addedToQueue = false,
                    hEvent = this,
                    idx = 0;
                if (this.hoverDuration >= getConfigValue("hoverThreshold")) {
                    this.hoverDuration = Math.min(this.hoverDuration, getConfigValue("hoverThresholdMax"));
                    // add to ui event queue here
                    addedToQueue = true;
                    postUIEvent(this, { hoverToClick : !!wasClicked });

                    while (typeof hEvent !== "undefined" && idx++ < MAX_ITERATIONS) {
                        hEvent.dispose(wasClicked);
                        hEvent = eventMap[hEvent.parentKey];
                    }

                    if (idx >= MAX_ITERATIONS) {
                        utils.clog("Overstat process() hit iterations limit");
                    }
                } else {
                    this.dispose(wasClicked);
                }

                return addedToQueue;
            };

            /*
             * return a fresh copy of this event
             * @public
             * @function
             * @name overstat-HoverEvent.clone
             * @return {HoverTest} Returns a copy of this event with a reset hover time
             */
            this.clone = function () {
                var cloneEvent = new HoverEvent(this.domNode, this.gridX, this.gridY);
                cloneEvent.parentKey = this.parentKey;

                return cloneEvent;
            };
        }

        function createHoverEvent(node, x, y, webEvt) {
            return new HoverEvent(node, x, y, webEvt);
        }

        /*
         * get element offset according to the top left of the document
         * @private
         * @function
         * @name overstat-calculateNodeOffset
         * @return {object} Returns an object with x and y offsets
         */
        function calculateNodeOffset(node) {
            if (node && node.position) { return { x: node.position.x, y: node.position.y }; }
            node = getNativeNode(node);
            var boundingRect = node && node.getBoundingClientRect ? node.getBoundingClientRect() : null,
                offsetX =  boundingRect ? boundingRect.left : (node ? node.offsetLeft : 0),
                offsetY = boundingRect ? boundingRect.top : (node ? node.offsetHeight : 0),
                lastOffsetX = offsetX,
                lastOffsetY = offsetY,
                offsetDiffX = 0,
                offsetDiffY = 0,
                curNode = getOffsetParent(node),
                idx = 0;

            while (curNode && idx++ < MAX_ITERATIONS) {
                if (stopNode(curNode)) { break; }

                offsetDiffX = curNode.offsetLeft - (curNode.scrollLeft || 0);
                offsetDiffY = curNode.offsetTop - (curNode.scrollTop || 0);

                if (offsetDiffX !== lastOffsetX || offsetDiffY !== lastOffsetY) {
                    offsetX += offsetDiffX;
                    offsetY += offsetDiffY;

                    lastOffsetX = offsetDiffX;
                    lastOffsetY = offsetDiffY;
                }

                curNode = getOffsetParent(curNode);
            }

            if (idx >= MAX_ITERATIONS) {
                utils.clog("Overstat calculateNodeOffset() hit iterations limit");
            }

            if (isNaN(offsetX)) { offsetX = 0; }
            if (isNaN(offsetY)) { offsetY = 0; }
            return { x: offsetX, y: offsetY };
        }

        /*
         * calculate position relative to top left corner of element
         * @private
         * @function
         * @name overstat-calculateRelativeCursorPos
         * @return {object} Returns an object with x and y offsets
         */
        function calculateRelativeCursorPos(node, cursorX, cursorY) {
            node = getNativeNode(node);
            var nodeOffset = calculateNodeOffset(node),
                offsetX = cursorX - nodeOffset.x,
                offsetY = cursorY - nodeOffset.y;

            if (!isFinite(offsetX)) { offsetX = 0; }
            if (!isFinite(offsetY)) { offsetY = 0; }
            return { x: offsetX, y: offsetY };
        }

        /*
         * format relXY coords into two decimal 0<x<1 values
         * @private
         * @function
         * @name overstat-formatRelXY
         * @return {object} Formats the x and y location
         */
        function formatRelXY(x, y) {
            x = Math.floor(Math.min(Math.max(x, 0), 1) * 10000) / 10000;
            y = Math.floor(Math.min(Math.max(y, 0), 1) * 10000) / 10000;

            return x +  "," + y;
        }

        /*
         * determine grid cell dimensions based on the constants
         * @private
         * @function
         * @name overstat-calculateGridCell
         * @return {object} Returns the x and y grid location
         */
        function calculateGridCell(node, offsetX, offsetY) {
            node = getNativeNode(node);
            var boundingRect = node.getBoundingClientRect ? node.getBoundingClientRect() : null,
                oWidth =  boundingRect ? boundingRect.width : node.offsetWidth,
                oHeight = boundingRect ? boundingRect.height : node.offsetHeight,
                cellWidth = oWidth && oWidth > 0 ? Math.max(oWidth / getConfigValue("gridCellMaxX"), getConfigValue("gridCellMinWidth")) : getConfigValue("gridCellMinWidth"),
                cellHeight = oHeight && oHeight > 0 ? Math.max(oHeight / getConfigValue("gridCellMaxY"), getConfigValue("gridCellMinHeight")) : getConfigValue("gridCellMinHeight"),

                cellX = Math.min(Math.floor(offsetX / cellWidth), getConfigValue("gridCellMaxX")),
                cellY = Math.min(Math.floor(offsetY / cellHeight), getConfigValue("gridCellMaxY")),
                xVal = oWidth > 0 ? offsetX / oWidth : 0,
                yVal = oHeight > 0 ? offsetY / oHeight : 0,
                relXYVal = "";

            if (!isFinite(cellX)) { cellX = 0; }
            if (!isFinite(cellY)) { cellY = 0; }
            relXYVal = formatRelXY(xVal, yVal);

            return { x: cellX, y: cellY, relXY: relXYVal };
        }

        /*
         * called when a hover event fires - processes all unrelated hover events from the queue.
         * events are related if they are the calling event, or any parent events
         * @private
         * @function
         * @name overstat-cleanupHoverEvents
         */
        function cleanupHoverEvents(curEvent) {
            var hEvent = curEvent,
                curKey = curEvent.getKey(),
                allowedKeyMap = {},
                key = null,
                addedToQueue = false,
                idx = 0;

            allowedKeyMap[curKey] = true;

            while (typeof hEvent !== "undefined" && idx++ < MAX_ITERATIONS) {
                allowedKeyMap[hEvent.parentKey] = true;
                if (hEvent.parentKey === "" || hEvent.parentKey === hEvent.getKey()) {
                    break;
                }

                if (idx >= MAX_ITERATIONS) {
                    utils.clog("Overstat cleanupHoverEvents() hit iterations limit");
                }

                hEvent = eventMap[hEvent.parentKey];
            }

            for (key in eventMap) {
                if (eventMap.hasOwnProperty(key) && !allowedKeyMap[key]) {
                    hEvent = eventMap[key];
                    if (hEvent) {
                        if (!addedToQueue) {
                            addedToQueue = hEvent.process();
                        } else {
                            hEvent.dispose();
                        }
                    }
                }
            }
        }

        /*
         * similar to cleanupHoverEvents, this will process all events within a domNode (fired on mouseout)
         * @private
         * @function
         * @name overstat-processEventsByDomNode
         */
        function processEventsByDomNode(eventNode, keyToIgnore) {
            var hEvent = null,
                key = null,
                addedToQueue = false;

            for (key in eventMap) {
                if (eventMap.hasOwnProperty(key)) {
                    hEvent = eventMap[key];
                    if (hEvent && hEvent.domNode === eventNode && hEvent.getKey() !== keyToIgnore) {
                        if (!addedToQueue) {
                            addedToQueue = hEvent.process();
                        } else {
                            hEvent.dispose();
                        }
                    }
                }
            }
        }

        /*
         * 1) determine element and grid position for event
         * 2) find existing matching event if possible
         * 3) update event hover time
         * 4) bubble to parent node, for linking purposes
         * within the UI SDK framework, this should be called for each node in the heirarchy (box model)
         * going top down. so the parent (if the calculation is correct) should already exist, and have
         * it's own parent link, which helps during cleanupHoverEvents
         * @private
         * @function
         * @name overstat-hoverHandler
         * @return {HoverEvent} Returns the relevant HoverEvent object (either found or created)
         */
        function hoverHandler(e, node, isParent) {
            if (!node) { node = e.target; }
            if (stopNode(node)) { return null; }
            if (utils.isiOS || utils.isAndroid) { return null; }

            var rPos, gPos, hEvent, key, parentKey, parentEvent, offsetParent;

            if (!ignoreNode(node)) {
                rPos = calculateRelativeCursorPos(node, e.position.x, e.position.y);
                gPos = calculateGridCell(node, rPos.x, rPos.y);
                hEvent = new HoverEvent(node, gPos.x, gPos.y, e);
                hEvent.relXY = gPos.relXY;
                key = hEvent.getKey();

                if (eventMap[key]) {
                    hEvent = eventMap[key];
                } else {
                    eventMap[key] = hEvent;
                }

                hEvent.update();

                // link parent, but in the case that it refers to itself (sometimes with frames) make sure the parentKey
                // is not the same as the current key
                if (!isParent) {
                    offsetParent = getOffsetParent(node);
                    if (offsetParent) {
                        parentEvent = hoverHandler(e, offsetParent, true);
                        if (parentEvent !== null) {
                            parentKey = parentEvent.getKey();
                            key = hEvent.getKey();
                            if (key !== parentKey) {
                                hEvent.parentKey = parentKey;
                            }
                        }
                    }

                    cleanupHoverEvents(hEvent);
                }
            } else {
                hEvent = hoverHandler(e, getOffsetParent(node), isParent);
            }

            return hEvent;
        }

        /*
         * process all events related to the event target, as hovering stops when leaving the element
         * @private
         * @function
         * @name overstat-leaveHandler
         */
        function leaveHandler(e) {
            e = getNativeEvent(e);
            if (isChildOf(e.target, e.relatedTarget)) {
                return;
            }

            processEventsByDomNode(e.target);
        }

        /*
         * on click, resolve current hover events, and reset hover count
         * @private
         * @function
         * @name overstat-clickHandler
         */
        function clickHandler(e) {
            var hEvent = null,
                key = null,
                addedToQueue = false;

            for (key in eventMap) {
                if (eventMap.hasOwnProperty(key)) {
                    hEvent = eventMap[key];
                    if (hEvent) {
                        if (!addedToQueue) {
                            addedToQueue = hEvent.process(true);
                        } else {
                            hEvent.dispose();
                        }
                    }
                }
            }
        }

        function submitHandler(e) {
            context.performFormCompletion(true);
        }

        /*
         * switches on window event type and routes it appropriately
         * @private
         * @function
         * @name overstat-handleEvent
         */
        function handleEvent(e) {
            var targetId = utils.getValue(e, "target.id");

            // Sanity check
            if (!targetId) {
                return;
            }

            switch (e.type) {
            case "mousemove":
                hoverHandler(e);
                break;
            case "mouseout":
                leaveHandler(e);
                break;
            case "click":
                clickHandler(e);
                break;
            case "submit":
                submitHandler(e);
                break;
            default:
                break;
            }
        }

        // Module interface.
        /**
         * @scope performance
         */
        return {


            /**
             * Initialize the overstat module.
             */
            init: function () {
            },

            /**
             * Terminate the overstat module.
             */
            destroy: function () {
                var key;
                for (key in eventMap) {
                    if (eventMap.hasOwnProperty(key)) {
                        eventMap[key].dispose();
                        delete eventMap[key];
                    }
                }
            },

            /**
             * Handle events subscribed by the overstat module.
             * @param  {Object} event The normalized data extracted from a browser event object.
             */
            onevent: function (event) {
                // Sanity check
                if (typeof event !== "object" || !event.type) {
                    return;
                }

                handleEvent(event);
            },

            /**
             * Handle system messages subscribed by the overstat module.
             * @param  {Object} msg An object containing the message information.
             */
            onmessage: function (msg) {

            },

            createHoverEvent: createHoverEvent,
            cleanupHoverEvents: cleanupHoverEvents,
            eventMap: eventMap
        };
    });  // End of TLT.addModule
} else {
}


/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview The Performance module implements the logic for monitoring and
 * reporting performance data such as the W3C Navigation Timing.
 * @exports performance
 */

/*global TLT:true, webVitals */
// Sanity check
if (TLT && typeof TLT.addModule === "function") {
    /**
     * @name performance
     * @namespace
     */
    TLT.addModule("performance", function (context) {
        "use strict";

        var moduleState = {
                loadReceived: false,
                unloadReceived: false,
                perfEventSent: false
            },
            perfTimerId = null,
            pageExpTimerId = null,
            vitals = {},
            calculatedRenderTime = 0,
            config,
            utils = context.utils,
            mixedModeCheck = window.location.protocol === "https:",
            mixedModeUrls = [],
            performanceObserver,
            alertCount = 0,
            performanceAlertCfg,
            performanceAlertDefaultOptions = {
                enabled: false,
                // use resourceTypes to specify type of resource to monitor
                // by default, sdk monitors all resources, e.g. "script", "link", "img", "xmlhttprequest", "iframe" ...
                resourceTypes: [],
                // use blacklist to skip monitoring of certain resources by matching the resource name
                blacklist: []
                // non-default options 
                // threshold: 2000     --> threshold (milliseconds) to log only slow performance resources
                // maxAlerts: 100      --> maximum # of alerts to be logged
            };

        /**
         * Returns the normalized timing object. Normalized values are offsets measured
         * from the "navigationStart" timestamp which serves as the epoch.
         * @private
         * @function
         * @name performance-parseTiming
         * @param {object} timing An object implementing the W3C PerformanceTiming
         * interface.
         * @return {object} The normalized timing properties.
         */
        function parseTiming(timing) {
            var epoch = 0,
                normalizedTiming = {},
                prop = "",
                value = 0;

            // Sanity checks
            if (!timing || typeof timing !== "object" || !timing.navigationStart) {
                return {};
            }

            epoch = timing.navigationStart;
            for (prop in timing) {
                // IE_COMPAT, FF_COMPAT: timing.hasOwnProperty(prop) returns false for
                // performance timing members in IE 9 and Firefox 14.0.1.

                // IE_COMPAT: timing.hasOwnProperty does not exist in IE8 and lower for
                // host objects. Legacy IE does not support hasOwnProperty on hosted objects.
                if (Object.prototype.hasOwnProperty.call(timing, prop) || typeof timing[prop] === "number") {
                    value = timing[prop];
                    if (typeof value === "number" && value && prop !== "navigationStart") {
                        normalizedTiming[prop] = value - epoch;
                    } else {
                        normalizedTiming[prop] = value;
                    }
                }
            }

            return normalizedTiming;
        }

        /**
         * Calculates the render time from the given timing object.
         * @private
         * @function
         * @name performance-getRenderTime
         * @param {object} timing An object implementing the W3C PerformanceTiming
         * interface.
         * @return {integer} The calculated render time or 0.
         */
        function getRenderTime(timing) {
            var renderTime = 0,
                startTime,
                endTime;

            if (timing) {
                // Use the lesser of domLoading or responseEnd as the start of render, see data in CS-8915
                startTime = (timing.responseEnd > 0 && timing.responseEnd < timing.domLoading) ? timing.responseEnd : timing.domLoading;
                endTime = timing.loadEventStart;
                if (utils.isNumeric(startTime) && utils.isNumeric(endTime) && endTime > startTime) {
                    renderTime = endTime - startTime;
                }
            }

            return renderTime;
        }

        /**
         * Calculates the render time by measuring the difference between when the
         * library core was loaded and when the page load event occurs.
         * @private
         * @function
         * @name performance-processLoadEvent
         * @param  {Object} event The normalized data extracted from a browser event object.
         */
        function processLoadEvent(event) {
            var startTime = context.getStartTime();
            if (event.timestamp > startTime && !calculatedRenderTime) {
                // Calculate the render time
                calculatedRenderTime = event.timestamp - startTime;
            }
        }

        /**
         * Posts the performance event.
         * @private
         * @function
         * @name performance-postPerformanceEvent
         * @param {object} window The DOM window
         * @param {Boolean} [force] If true, the performance event should be posted even if the load event hasn't fired (i.e. loadEventStart == 0)
         */
        function postPerformanceEvent(window, force) {
            var i, len,
                navType,
                queueEvent = {
                    type: 7,
                    performance: {}
                },
                qTiming,
                navigation,
                performance,
                paintEntries,
                paintEntry,
                timing;

            // Sanity checks
            if (!window || moduleState.perfEventSent) {
                return;
            }

            performance = window.performance || {};
            timing = performance.timing;
            navigation = performance.navigation;

            if (timing) {
                // Cannot calculate if the Load event has not occurred yet.
                if (!timing.loadEventStart && !force) {
                    return;
                }
                queueEvent.performance.timing = parseTiming(timing);
                queueEvent.performance.timing.renderTime = getRenderTime(timing);
            } else if (config.calculateRenderTime) {
                queueEvent.performance.timing = {
                    renderTime: calculatedRenderTime,
                    calculated: true
                };
            } else {
                // Nothing to report.
                return;
            }

            qTiming = queueEvent.performance.timing;

            // Do not include renderTime if it is over the threshold.
            if (config.renderTimeThreshold && qTiming.renderTime > config.renderTimeThreshold) {
                qTiming.invalidRenderTime = qTiming.renderTime;
                delete qTiming.renderTime;
            }

            // Add "paint" timing
            if (performance.getEntriesByType) {
                paintEntries = performance.getEntriesByType("paint");
                for (i = 0, len = paintEntries.length; i < len; i += 1) {
                    paintEntry = paintEntries[i];
                    if (paintEntry.startTime > 0) {
                        qTiming[paintEntry.name] = Math.round(paintEntry.startTime);
                    }
                }
            }

            if (!qTiming["first-paint"] && qTiming.msFirstPaint) {
                // MSIE reports first-paint as msFirstPaint
                qTiming["first-paint"] = qTiming.msFirstPaint;
                delete qTiming.msFirstPaint;
            }

            if (navigation) {
                switch (navigation.type) {
                case 0:
                    navType = "NAVIGATE";
                    break;
                case 1:
                    navType = "RELOAD";
                    break;
                case 2:
                    navType = "BACKFORWARD";
                    break;
                default:
                    navType = "UNKNOWN";
                    break;
                }
                queueEvent.performance.navigation = {
                    type: navType,
                    redirectCount: navigation.redirectCount
                };
            }

            // Invoke the context API to post this event
            context.post(queueEvent);
            // Set the state
            moduleState.perfEventSent = true;
            // Clear the timer interval
            if (perfTimerId) {
                clearInterval(perfTimerId);
                perfTimerId = null;
            }
        }

        function postMixedModeViolations(urls) {
            var queueEvent = {
                    type: 20,
                    violations: {}
                },
                violations = queueEvent.violations;

            if (!urls || !urls.length) {
                return;
            }
            violations.total = urls.length;
            // Only report initial 10 urls
            urls.splice(10);
            violations.urls = urls;

            context.post(queueEvent);
        }

        /**
         * Logs performance data of a resource 
         * @private
         * @function
         * @name performance-processPerformanceEntry
         * @name {object} The performance entry
         */
        function processPerformanceEntry(entry) {
            var i,
                name,
                type,
                blacklist = performanceAlertCfg.blacklist,
                blacklistItem,
                isBlacklisted,
                resourceData;

            // Sanity check
            if (!entry || !entry.name) {
                return;
            }

            name = entry.name;
            type = entry.initiatorType;

            // Mixed mode check
            if (mixedModeCheck && name.indexOf("http:") === 0) {
                mixedModeUrls.push(name);
            }

            if (performanceAlertCfg.hasOwnProperty("maxAlerts") && alertCount >= performanceAlertCfg.maxAlerts) {
                return;
            }

            if (performanceAlertCfg.hasOwnProperty("threshold") && entry.duration < performanceAlertCfg.threshold) {
                return;
            }

            //check if resource is loaded from cache
            if ((entry.transferSize && entry.transferSize < entry.encodedBodySize) || entry.responseStart === entry.responseEnd) {
                return;
            }

            if (performanceAlertCfg.resourceTypes.length > 0 && performanceAlertCfg.resourceTypes.indexOf(type) === -1) {
                return;
            }

            isBlacklisted = false;

            for (i = 0; i < blacklist.length; i += 1) {
                blacklistItem = blacklist[i];
                switch (typeof blacklistItem) {
                case "object":
                    if (!blacklistItem.cRegex) {
                        blacklistItem.cRegex = new RegExp(blacklistItem.regex, blacklistItem.flags);
                    }
                    blacklistItem.cRegex.lastIndex = 0;
                    if (blacklistItem.cRegex.test(name)) {
                        isBlacklisted = true;
                    }
                    break;
                case "string":
                    if (name.indexOf(blacklistItem) !== -1) {
                        isBlacklisted = true;
                    }
                    break;
                default:
                    break;
                }
            }

            if (!isBlacklisted) {
                alertCount += 1;

                resourceData = {
                    urlNormalized: context.normalizeUrl(name, 17),
                    url: name,
                    initiator: type,
                    duration: Math.round(entry.duration),
                    responseEnd: Math.round(entry.responseEnd)
                };

                if (typeof entry.transferSize !== "undefined") {
                    //transferSize represents the size in octets - (8-bits)
                    resourceData.transferSize = entry.transferSize;
                    if (entry.duration) {
                        resourceData.bps = Math.round(entry.transferSize / entry.duration * 1000);
                    }
                }

                context.post({
                    type: 17,
                    resourceData: resourceData
                });
            }
        }

        /**
         * Starts monitoring performance of requested resources
         * @private
         * @function
         * @name performance-startPerformanceObserver
         */
        function startPerformanceObserver() {
            var oldEntries;

            if (!performanceAlertCfg.enabled || (typeof window.PerformanceObserver !== "function")) {
                return;
            }

            performanceObserver = new window.PerformanceObserver(function (list, obs) {
                utils.forEach(list.getEntries(), processPerformanceEntry);
            });

            oldEntries = window.performance.getEntriesByType("resource");
            setTimeout(function () {
                utils.forEach(oldEntries, processPerformanceEntry);
            });

            performanceObserver.observe({entryTypes: ["resource"]});
        }

        /**
         * Clear previously captured Web Vitals metrics. Clear any pending timeout.
         * @private
         * @function
         * @name performance-clearVitals
         */
        function clearVitals() {
            vitals = {};
            if (pageExpTimerId) {
                clearTimeout(pageExpTimerId);
                pageExpTimerId = null;
            }
        }

        /**
         * Post the page experience message to the queue.
         * @private
         * @function
         * @name performance-postPageExperienceMsg
         */
        function postPageExperienceMsg() {
            var peMsg = {
                type: 20,
                pageExperience: utils.clone(vitals)
            };

            // Sanity check
            if (!vitals.fid && !vitals.lcp && !vitals.cls) {
                return;
            }

            peMsg.pageExperience.https = window.location.protocol === "https:";
            context.post(peMsg);
            clearVitals();
        }

        /**
         * Callback function to collect and process Web Vitals metrics.
         * @private
         * @function
         * @name performance-collectVitals
         * @param {object} metric Object containing Web Vitals metric.
         */
        function collectVitals(metric) {
            // Sanity check
            if (!metric || !metric.name) {
                return;
            }

            switch (metric.name) {
            case "FID":
                // milliseconds
                vitals.fid = Math.round(metric.value);
                break;
            case "LCP":
                // milliseconds
                vitals.lcp = Math.round(metric.value);
                break;
            case "CLS":
                vitals.cls = Number(metric.value.toFixed(2));
                break;
            default:
                break;
            }

            // Immediately post message if all vitals have been collected.
            if (typeof vitals.fid !== "undefined" && typeof vitals.lcp !== "undefined" && typeof vitals.cls !== "undefined") {
                postPageExperienceMsg();
            }
        }

        /**
         * Initiate the collection (asynchronous) of Web Vitals for posting
         * the page experience message.
         * @private
         * @function
         * @name performance-logPageExperience
         */
        function logPageExperience() {
            var api;

            // Sanity check
            if (!config || !config.pageExperience || !config.pageExperience.enabled) {
                return;
            }

            // Clear prior metrics.
            clearVitals();
            // Get Web Vitals metrics.
            api = config.pageExperience.api;
            api.getCLS(collectVitals);
            api.getLCP(collectVitals);
            api.getFID(collectVitals);
            // Schedule a timeout to post the page experience message.
            pageExpTimerId = setTimeout(postPageExperienceMsg, 300000);
        }

        /**
         * Initialize API for the collection of Web Vitals
         * @private
         * @function
         * @name performance-initPageExperience
         */
        function initPageExperience() {
            var api,
                pageExperienceConfig;

            // Sanity check
            if (!config || !utils.getValue(config, "pageExperience.enabled", true)) {
                return;
            }

            config.pageExperience = config.pageExperience || {};
            pageExperienceConfig = config.pageExperience;
            if (!pageExperienceConfig.api && window.webVitals) {
                pageExperienceConfig.api = {
                    getCLS: webVitals.getCLS,
                    getLCP: webVitals.getLCP,
                    getFID: webVitals.getFID
                };
            }

            if (pageExperienceConfig.api) {
                pageExperienceConfig.enabled = true;
            } else {
                pageExperienceConfig.enabled = false;
            }
        }

        // Module interface.
        /**
         * @scope performance
         */
        return {


            /**
             * Initialize the performance module.
             */
            init: function () {
                config = context.getConfig();
                performanceAlertCfg = utils.mixin({}, performanceAlertDefaultOptions, config.performanceAlert);
                initPageExperience();
            },

            /**
             * Terminate the performance module.
             */
            destroy: function () {
                // Post any pending Page Experience message.
                postPageExperienceMsg();
                if (perfTimerId) {
                    clearInterval(perfTimerId);
                    perfTimerId = null;
                    // Force the performance event to be sent if it hasn't been sent already.
                    postPerformanceEvent(window, true);
                }

                if (performanceObserver) {
                    performanceObserver.disconnect();
                }

                if (mixedModeCheck) {
                    postMixedModeViolations(mixedModeUrls);
                    mixedModeUrls = [];
                }

                config = null;
            },

            /**
             * Handle events subscribed by the performance module.
             * @param  {Object} event The normalized data extracted from a browser event object.
             */
            onevent: function (event) {
                // Sanity check
                if (typeof event !== "object" || !event.type) {
                    return;
                }

                switch (event.type) {
                case "load":
                    moduleState.loadReceived = true;
                    processLoadEvent(event);
                    // Post the type 7 performance message if not already sent
                    if (!moduleState.perfEventSent && !perfTimerId) {
                        perfTimerId = setInterval(function () {
                            if (context.isInitialized()) {
                                postPerformanceEvent(window);
                            }
                        }, utils.getValue(config, "delay", 2000));
                    }

                    startPerformanceObserver();
                    break;
                case "screenview_load":
                    logPageExperience();
                    if (!moduleState.perfEventSent) {
                        postPerformanceEvent(window);
                    }
                    break;
                case "screenview_unload":
                    break;
                case "unload":
                    moduleState.unloadReceived = true;
                    // Post any pending Page Experience message.
                    postPageExperienceMsg();
                    // Force the performance data to be posted (if it hasn't been done already.)
                    if (!moduleState.perfEventSent) {
                        postPerformanceEvent(window);
                    }
                    break;
                default:
                    break;
                }
            },

            /**
             * Handle system messages subscribed by the performance module.
             * @param  {Object} msg An object containing the message information.
             */
            onmessage: function (msg) {

            }
        };
    });  // End of TLT.addModule
} else {
}



/**
 * Copyright (c) 2023 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview The Replay module implements the logic for monitoring and
 * reporting user interaction data used for replay and usability.
 * @exports replay
 */
/* global TLT:true, MouseEvent, PointerEvent */

// Sanity check
TLT.addModule("replay", function (context) {
    "use strict";

    var utils = context.utils,
        currOrientation = 0,
        savedTouch = {
            scale: 0,
            timestamp: 0
        },
        pastEvents = {},
        lastEventId = null,
        tmpQueue = [],
        eventCounter = 0,
        firstDOMCaptureEventFlag = true,
        curClientState = null,
        pastClientState = null,
        errorCount = 0,
        visitOrder = "",
        lastVisit = "",
        lastPointerDownTarget = null,
        pageLoadTime = (new Date()).getTime(),
        pageDwellTime = 0,
        prevWebEvent = null,
        defaultRootScreenName = "root",
        rootScreenviewName,
        viewEventStart = null,
        viewTimeStart = null,
        scrollViewStart = null,
        scrollViewEnd = null,
        nextScrollViewStart = null,
        lastFocusEvent = { inFocus: false },
        lastClickEvent = null,
        replayConfig = context.getConfig() || {},
        viewPortWidthHeightLimit = utils.getValue(replayConfig, "viewPortWidthHeightLimit", 10000),
        deviceScale = 1,
        previousDeviceScale = 1,
        extendGetItem,
        loggedExceptions = {},
        mousemoveConfig = utils.getValue(replayConfig, "mousemove") || {},
        sampleRate = mousemoveConfig.sampleRate,
        ignoreRadius = mousemoveConfig.ignoreRadius,
        lastMouseEvent = null,
        mousemoveQueue = [],
        mousemoveElements = [],
        elMap = {},
        mousemoveCount = 0,
        mousemoveLimit = 1000,
        maxInactivity = 0,
        lazyloadingEl = [],
        pendingQueue = [],
        currVisibility = document.visibilityState === "visible" ? true : false;

    /**
     * Resets the visitedCount of all controls recorded in pastEvents.
     * @private
     */
    function resetVisitedCounts() {
        var control;
        for (control in pastEvents) {
            if (pastEvents.hasOwnProperty(control)) {
                pastEvents[control].visitedCount = 0;
            }
        }
    }

    /**
     * Returns true if the click event changes the target state or is otherwise
     * relevant for the target.
     * @private
     * @param {WebEvent.target} target Webevent target
     * @return {boolean} true if the click event is relevant for the target, false otherwise.
     */
    function isTargetClickable(target) {
        var clickable = false,
            clickableInputTypes = "|button|image|submit|reset|",
            subType = null;

        if (typeof target !== "object" || !target.type) {
            return clickable;
        }

        switch (target.type.toLowerCase()) {
        case "input":
            // Clicks are relevant for button type inputs only.
            subType = "|" + (target.subType || "") + "|";
            clickable = (clickableInputTypes.indexOf(subType.toLowerCase()) !== -1);
            break;
        case "select":
        case "textarea":
            clickable = false;
            break;
        default:
            // By default, clicks are relevant for all targets.
            clickable = true;
            break;
        }

        return clickable;
    }

    function parentElements(node) {
        var parents = [];
        node = node.parentNode;
        while (node) {
            parents.push(node);
            node = node.parentNode;
        }
        return parents;
    }

    function getParentLink(parents) {
        return utils.some(parents, function (node) {
            var tagName = utils.getTagName(node);

            // Either links or buttons could have content
            if (tagName === "a" || tagName === "button") {
                return node;
            }
            return null;
        });
    }

    /**
     * Get the normalized tlEvent from the underlying DOM event and target.
     * @private
     * @param {object} webEvent The normalized webEvent with event and target (control.)
     * @return {string} The normalized value for the tlEvent as per the JSON Logging Data Format.
     */
    function getTlEvent(webEvent) {
        var tlEvent = webEvent.type,
            target = webEvent.target;

        if (typeof tlEvent === "string") {
            tlEvent = tlEvent.toLowerCase();
        } else {
            tlEvent = "unknown";
        }

        if (tlEvent === "blur") {
            tlEvent = "focusout";
        }

        if (tlEvent === "change") {
            if (target.type === "INPUT") {
                switch (target.subType) {
                case "text":
                case "date":
                case "time":
                    // tlEvent is textChange, dateChange or timeChange respectively.
                    tlEvent = target.subType + "Change";
                    break;
                default:
                    // For all other input fields the tlEvent is valueChange.
                    tlEvent = "valueChange";
                    break;
                }
            } else if (target.type === "TEXTAREA") {
                tlEvent = "textChange";
            } else {
                tlEvent = "valueChange";
            }
        }

        return tlEvent;
    }

    /**
     * Search for css selector.
     * @private
     * @function
     * @param {String} selector The selector to search for.
     * @param {Array} documents List of mutated document objects.
     * @param {Array} nodes List of mutated document fragment nodes.
     * @returns {boolean} true if found, otherwise false.
     */
    function findSelector(selector, documents, nodes) {
        var i,
            el,
            doc;

        if (document.querySelector(selector)) {
            return true;
        }
        for (i = 0; i < documents.length; i++) {
            doc = documents[i];
            if (doc.querySelector(selector)) {
                return true;
            }
        }
        for (i = 0; i < nodes.length; i++) {
            el = nodes[i];
            if (el.querySelector(selector)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Checks pending queue to see if dom capture should be triggered for this mutation.
     * @private
     * @function
     * @param {Array} records List of mutation record objects.
     * @param {Array} documents List of documents.
     * @param {Array} nodes List of mutated document fragment nodes.
     * @returns {}
     */
    function mutationDomCapture(records, documents, nodes) {
        var i,
            selector,
            exists,
            dualSnapshot,
            queryStatus,
            lastStatus,
            pendingEvent,
            config,
            timerId;

        for (i = 0; i < pendingQueue.length; i++) {
            pendingEvent = pendingQueue[i];

            selector = pendingEvent.delayUntil.selector;
            exists = utils.getValue(pendingEvent.delayUntil, "exists", true);
            dualSnapshot = pendingEvent.delayUntil.dualSnapshot || false;
            queryStatus = findSelector(selector, documents, nodes);
            lastStatus = pendingEvent.lastStatus || false;
            config = pendingEvent.config || {};
            timerId = pendingEvent.timerId;

            // If exists is true, capture dom only when selector appears.  If false, capture only when it disappears.
            // If dualSnapshot is true, capture dom when selector both appears and disappears.
            if ((exists === true && queryStatus === true && lastStatus === false) ||
                    (exists === false && queryStatus === false && lastStatus === true) ||
                    (dualSnapshot === true && queryStatus === true && lastStatus === false) ||
                    (dualSnapshot === true && queryStatus === false && lastStatus === true)) {

                context.performDOMCapture(document, config);

                if (!dualSnapshot || queryStatus === false) {
                    pendingQueue.splice(i--, 1);

                    if (pendingQueue.length === 0) {
                        TLT.registerMutationCallback(mutationDomCapture, false);
                    }
                    // Snapshot already taken, clear active timer.
                    if (timerId) {
                        clearTimeout(timerId);
                    }
                }
            }
            pendingEvent.lastStatus = queryStatus;
        }
    }

    /**
     * Force dom capture if mutation did not occur.
     * @private
     * @function
     * @param {String} dcid to force.
     */
    function onMutationTimeout(dcid) {
        var i,
            pendingEvent,
            config;

        // Search queue for dcid
        for (i = 0; i < pendingQueue.length; i += 1) {
            pendingEvent = pendingQueue[i];
            config = pendingEvent.config || {};

            if (config.dcid === dcid) {
                config.timeoutExpired = true;
                context.performDOMCapture(document, config);

                pendingQueue.splice(i--, 1);
                if (pendingQueue.length === 0) {
                    TLT.registerMutationCallback(mutationDomCapture, false);
                }
            }
        }
    }

    /**
     * Invoke the core API to take the DOM capture. If a delay is specified, then
     * schedule a DOM capture.
     * @private
     * @param {DOMElement} root Root element from which the DOM capture snapshot should be taken.
     * @param {object} [config] Configuration options for the capture.
     * @param {Number} [delay] Milliseconds after which to take the DOM snapshot.
     * @return {string} Returns the unique DOM Capture id.
     */
    function scheduleDOMCapture(root, config, delay) {
        var dcid = null,
            event;

        // Sanity check
        if (!root) {
            return dcid;
        }
        config = config || {};

        // Set the eventOn property (true for the 1st DOM Capture)
        config.eventOn = firstDOMCaptureEventFlag;
        firstDOMCaptureEventFlag = false;

        if (delay) {
            dcid = "dcid-" + utils.getSerialNumber() + "." + (new Date()).getTime() + "s";
            if (typeof delay === "object") {
                // Queue event until css selector occurs before capturing dom.
                config.dcid = dcid;
                event = {config: config, delayUntil: delay, lastStatus: false};
                pendingQueue.push(event);

                TLT.registerMutationCallback(mutationDomCapture, true);

                // If a delay until timeout is specified, set timeout.
                if (typeof delay.timeout !== "undefined" && delay.timeout >= 0) {
                    event.timerId = window.setTimeout(function () {
                        onMutationTimeout(dcid);
                    }, delay.timeout);
                }
            } else {
                window.setTimeout(function () {
                    config.dcid = dcid;
                    context.performDOMCapture(root, config);
                }, delay);
            }
        } else {
            delete config.dcid;
            dcid = context.performDOMCapture(root, config);
        }
        return dcid;
    }

    /**
     * check the target screenview is in the blacklist or not.
     * @private
     * @param {Array} dcScreenviewBlacklist, a list of blacklisted screenview names
     * @param {string} screenviewName, target screenview name
     * @return {boolean} true if a match is found
     */
    function isScreenviewBlacklisted(dcScreenviewBlacklist, screenviewName) {
        var i, len,
            screenview,
            targetScreenview;

        for (i = 0, len = dcScreenviewBlacklist.length; i < len; i += 1) {
            screenview = dcScreenviewBlacklist[i];
            if (screenviewName && screenviewName.indexOf("#") === 0) {
                //in case of hash change
                targetScreenview = location.pathname + screenviewName;
            } else if (typeof screenviewName === "undefined" || screenviewName === defaultRootScreenName) {
                //in case of no screenview name
                targetScreenview = location.pathname + location.hash;
            } else {
                targetScreenview = screenviewName;
            }
            targetScreenview = context.normalizeUrl(targetScreenview, 2);
            switch (typeof screenview) {
            case "object":
                if (!screenview.cRegex) {
                    screenview.cRegex = new RegExp(screenview.regex, screenview.flags);
                }
                screenview.cRegex.lastIndex = 0;
                if (screenview.cRegex.test(targetScreenview)) {
                    return true;
                }
                break;
            case "string":
                if (screenview === targetScreenview) {
                    return true;
                }
                break;
            default:
                break;
            }
        }

        return false;
    }

    /**
     * Posts all mousemove events from a queue to the message service.
     * The array is cleared on exit from the function.
     * @private
     * @return void
     */
    function logMousemove() {
        var limitReached = false,
            msg;

        // If mousemove is not enabled, or if this is a touch device, do not log.
        if (!mousemoveConfig.enabled || window.hasOwnProperty("ontouchstart")) {
            return;
        }
        if (mousemoveQueue.length === 0) {
            return;
        }
        if (mousemoveCount >= mousemoveLimit) {
            limitReached = true;
        }
        msg = {
            type: 18,
            mousemove: {
                elements: mousemoveElements.slice(0),
                data: mousemoveQueue.slice(0),
                config: {
                    ignoreRadius: mousemoveConfig.ignoreRadius,
                    sampleRate: mousemoveConfig.sampleRate
                },
                limitReached: limitReached,
                maxInactivity: maxInactivity
            }
        };
        context.post(msg);

        mousemoveElements.length = 0;
        mousemoveQueue.length = 0;
        elMap = {};
        maxInactivity = 0;

        return msg;
    }

    /**
     * Check the DOM capture rules to see if DOM capture should be triggered for this combination
     * of event, target, screenview as applicable.
     * @private
     * @param {String} eventType Name of the event e.g. click, change, load, unload
     * @param {DOMElement} target The target element of the event. Some events (such as load/unload) may not
     * have a target in which case it would be null.
     * @param {String} [screenviewName] The screenview name for load and unload events.
     * @returns {String} Returns the unique DOM Capture id or null.
     */
    function addDOMCapture(eventType, target, screenviewName) {
        var i, j,
            capture = false,
            captureConfig = {},
            dcEnabled = false,
            dcTrigger,
            dcTriggerList,
            dcid = null,
            delay = 0,
            len,
            screenview,
            screenviews,
            screenviewsLen,
            dcScreenviewBlacklist;

        // Sanity check
        if (!eventType || (!target && !screenviewName)) {
            return dcid;
        }
        if (!target && !(eventType === "load" || eventType === "unload")) {
            return dcid;
        }

        replayConfig = context.getConfig() || {};
        dcEnabled = utils.getValue(replayConfig, "domCapture.enabled", false);
        if (!dcEnabled || utils.isLegacyIE) {
            // DOM Capture is not supported for IE8 and below
            return dcid;
        }

        dcScreenviewBlacklist = utils.getValue(replayConfig, "domCapture.screenviewBlacklist", []);
        if (isScreenviewBlacklisted(dcScreenviewBlacklist, screenviewName)) {
            //screen view matches blacklist
            return dcid;
        }

        dcTriggerList = utils.getValue(replayConfig, "domCapture.triggers") || [];
        for (i = 0, len = dcTriggerList.length; !capture && i < len; i += 1) {
            dcTrigger = dcTriggerList[i];
            if (dcTrigger.event === eventType) {
                if (eventType === "load" || eventType === "unload") {
                    if (dcTrigger.screenviews) {
                        screenviews = dcTrigger.screenviews;
                        // Screenview match
                        for (j = 0, screenviewsLen = screenviews.length; !capture && j < screenviewsLen; j += 1) {
                            screenview = screenviews[j];
                            switch (typeof screenview) {
                            case "object":
                                // Regex match
                                if (!screenview.cRegex) {
                                    // Cache the regex object for future
                                    screenview.cRegex = new RegExp(screenview.regex, screenview.flags);
                                }
                                // Reset and test
                                screenview.cRegex.lastIndex = 0;
                                capture = screenview.cRegex.test(screenviewName);
                                break;
                            case "string":
                                capture = (screenview === screenviewName);
                                break;
                            default:
                                break;
                            }
                        }
                    } else {
                        capture = true;
                    }
                } else {
                    if (dcTrigger.targets) {
                        capture = (-1 !== utils.matchTarget(dcTrigger.targets, target));
                    } else {
                        capture = true;
                    }
                }
            }
            if (dcTrigger.event === "change" && dcTrigger.delayUntil) {
                lazyloadingEl = lazyloadingEl.concat(dcTrigger.targets);
            }
        }

        if (capture) {
            // Immediate or delayed?
            delay = dcTrigger.delay || dcTrigger.delayUntil || (dcTrigger.event === "load" ? 7 : 0);
            // Force full DOM snapshot?
            captureConfig.forceFullDOM = !!dcTrigger.fullDOMCapture;

            dcid = scheduleDOMCapture(window.document, captureConfig, delay);
            if (dcid) {
                logMousemove();
            }
        }

        return dcid;
    }

    /**
     * Used to create a control object from a webEvent.
     * @private
     * @function
     * @name replay-createQueueEvent
     * @param {object} options An object with the following properties:
     *                 webEvent A webEvent that will created into a control.
     *                 id Id of the object.
     *                 prevState Previous state of the object.
     *                 currState Current state of the object.
     *                 visitedCount Visited count of the object.
     *                 dwell Dwell time on the object.
     *                 focusInOffset When you first focused on the object.
     * @return {object} Control object.
     */
    function createQueueEvent(options) {
        var control,
            target        = utils.getValue(options, "webEvent.target", {}),
            targetType    = target.type,
            targetSubtype = target.subType || "",
            tlType        = utils.getTlType(target),
            parents       = parentElements(utils.getValue(target, "element")),
            parentLinkNode = null,
            eventSubtype  = utils.getValue(options, "webEvent.subType", null);

        control = {
            timestamp: utils.getValue(options, "webEvent.timestamp", 0),
            type: 4,
            target: {
                id: target.id || "",
                idType: target.idType,
                name: target.name,
                tlType: tlType,
                type: targetType,
                position: {
                    width: utils.getValue(target, "size.width"),
                    height: utils.getValue(target, "size.height")
                },
                currState: options.currState || null
            },
            event: {
                tlEvent: getTlEvent(utils.getValue(options, "webEvent")),
                type: utils.getValue(options, "webEvent.type", "UNKNOWN")
            }
        };

        if (target.accessibility) {
            control.target.accessibility = target.accessibility;
        }

        if (target.attributes) {
            control.target.attributes = target.attributes;
        }

        if (targetSubtype) {
            control.target.subType = targetSubtype;
        }

        if (typeof options.dwell === "number" && options.dwell > 0) {
            control.target.dwell = options.dwell;
        }

        if (typeof options.visitedCount === "number") {
            control.target.visitedCount = options.visitedCount;
        }

        if (typeof options.prevState !== "undefined") {
            control.prevState = options.prevState;
        }

        if (eventSubtype) {
            control.event.subType = eventSubtype;
        }

        // Add usability to config settings
        parentLinkNode = getParentLink(parents);
        control.target.isParentLink = !!parentLinkNode;
        if (parentLinkNode) {
            // Add the parent's href, value and innerText if the actual target doesn't
            // support these properties
            if (parentLinkNode.href) {
                control.target.currState = control.target.currState || {};
                control.target.currState.href = control.target.currState.href || parentLinkNode.href;
            }
            if (parentLinkNode.value) {
                control.target.currState = control.target.currState || {};
                control.target.currState.value = control.target.currState.value || parentLinkNode.value;
            }
            if (parentLinkNode.innerText || parentLinkNode.textContent) {
                control.target.currState = control.target.currState || {};
                control.target.currState.innerText = utils.trim(control.target.currState.innerText || parentLinkNode.innerText || parentLinkNode.textContent);
            }
        }

        if (utils.isUndefOrNull(control.target.currState)) {
            delete control.target.currState;
        }
        if (utils.isUndefOrNull(control.target.name)) {
            delete control.target.name;
        }

        return control;
    }

    function postUIEvent(queueEvent) {
        context.post(queueEvent);
    }


    /**
     * Posts all events from given array to the message service. The input
     * array is cleared on exit from the function.
     * Function additionally consolidates events fired on the same DOM element
     * TODO: Explain the consolidation process. Needs to be refactored!
     * @private
     * @param {Array} queue An array of QueueEvents
     * @return void
     */
    function postEventQueue(queue) {
        var i, j,
            len = queue.length,
            e1,
            e2,
            tmp,
            ignoredEvents = {
                mouseout: true,
                mouseover: true
            },
            results = [];

        for (i = 0; i < len; i += 1) {
            e1 = queue[i];
            if (!e1) {
                continue;
            }
            if (ignoredEvents[e1.event.type]) {
                results.push(e1);
            } else {
                for (j = i + 1; j < len && queue[j]; j += 1) {
                    if (!ignoredEvents[queue[j].event.type]) {
                        break;
                    }
                }
                if (j < len) {
                    e2 = queue[j];
                    if (e2 && e1.target.id === e2.target.id && e1.event.type !== e2.event.type) {
                        if (e1.event.type === "click") {
                            tmp = e1;
                            e1 = e2;
                            e2 = tmp;
                        }
                        if (e2.event.type === "click") {
                            e1.target.position = e2.target.position;
                            i += 1;
                        } else if (e2.event.type === "blur") {
                            e1.target.dwell = e2.target.dwell;
                            e1.target.visitedCount = e2.target.visitedCount;
                            e1.focusInOffset = e2.focusInOffset;
                            e1.target.position = e2.target.position;
                            i += 1;
                        }
                        queue[j] = null;
                        queue[i] = e1;
                    }
                }
                results.push(queue[i]);
            }
        }

        for (e1 = results.shift(); e1; e1 = results.shift()) {
            context.post(e1);
        }
        queue.splice(0, queue.length);
    }


    function handleError(webEvent) {
        var errorMessage = null,
            i,
            msg = utils.getValue(webEvent, "nativeEvent.message"),
            url = utils.getValue(webEvent, "nativeEvent.filename", ""),
            line = utils.getValue(webEvent, "nativeEvent.lineno", -1),
            errorObject = utils.getValue(webEvent, "nativeEvent.error");

        if (typeof msg !== "string") {
            return;
        }

        // Normalize the URL
        if (url) {
            url = context.normalizeUrl(url, 6);
        }

        if (errorObject && errorObject.stack) {
            i = errorObject.stack.toString();
        } else {
            i = (msg + " " + url + " " + line).toString();
        }

        if (loggedExceptions[i]) {
            loggedExceptions[i].exception.repeats = loggedExceptions[i].exception.repeats + 1;
        } else {
            errorMessage = {
                type: 6,
                exception: {
                    description: msg,
                    url: url,
                    line: line
                }
            };
            context.post(errorMessage);

            loggedExceptions[i] = {
                exception: {
                    description: msg,
                    url: url,
                    line: line,
                    repeats: 1
                }
            };
        }

        errorCount += 1;
    }

    /**
     * Create and add value that will be posted to queue.
     * @private
     * @param {string} id ID of an elment
     * @param {WebEvent} webEvent Normalized browser event
     * @return void
     */
    function addToTmpQueue(webEvent, id) {
        tmpQueue.push(createQueueEvent({
            webEvent: webEvent,
            id: id,
            currState: utils.getValue(webEvent, "target.state")
        }));
    }

    /**
     * Handles blur events. It is invoked when browser blur events fires or from the
     * handleFocus method (only when browser 'blur' event didn't take place).
     * In the first case it's called with current event details, in the second one -
     * with lastFocusEvent. Method posts the tmpQueue of events. If during the same
     * focus time change event was fired the focus data will be combined together with
     * the last change event from the tmpQueue.
     * @private
     * @param {string} id ID of an elment
     * @param {WebEvent} [webEvent] Normalized browser event
     * @param {Boolean} [doNotConvert] true if event should be posted as-is without converting to "change" or "blur"
     * @return void
     */
    function handleBlur(id, webEvent, doNotConvert) {
        var convertToBlur = false,
            dcid,
            lastQueueEvent,
            targetState;

        // Sanity check
        if (!id) {
            return;
        }

        if (tmpQueue.length === 0) {
            // Empty tmpQueue means there are no pending messages to handle
            return;
        }

        webEvent = webEvent || (pastEvents[id] ? pastEvents[id].webEvent : {});
        if (!webEvent) {
            // No past event to process into a blur.
            return;
        }

        if (webEvent.type === "blur" || webEvent.type === "change") {
            targetState = utils.getValue(webEvent, "target.state", {});
        } else if (webEvent.target) {
            targetState = utils.getTargetState(webEvent.target.element) || {};
        } else {
            targetState = {};
        }

        // Do not convert event to change/blur on a disabled element
        if (targetState && targetState.disabled) {
            doNotConvert = true;
        }

        lastQueueEvent = tmpQueue[tmpQueue.length - 1];

        if (pastEvents[id]) {
            lastQueueEvent.focusInOffset = pastEvents[id].focusInOffset;
            lastQueueEvent.target.visitedCount = pastEvents[id].visitedCount;

            if (pastEvents[id].focus) {
                pastEvents[id].dwell = Number(new Date()) - pastEvents[id].focus;
                lastQueueEvent.target.dwell = pastEvents[id].dwell;
            }

            if (!pastEvents[id].processedChange && pastEvents[id].prevState && !doNotConvert) {
                // Should this blur be converted to a change event?
                if (!utils.isEqual(pastEvents[id].prevState, targetState)) {
                    webEvent.type = "change";
                    lastQueueEvent.event.type = webEvent.type;
                    lastQueueEvent.event.tlEvent = getTlEvent(webEvent);
                    lastQueueEvent.target.prevState = pastEvents[id].prevState;
                    lastQueueEvent.target.currState = targetState;
                }
            }
        } else {
            // Blur without any record of a prior event on this control.
            pastEvents[id] = {};
        }

        // if the click (without generating change event) fires on an
        // input element for which it's not relevant - report event as a blur and update the currState
        if (lastQueueEvent.event.type === "click") {
            if (!isTargetClickable(lastQueueEvent.target)) {
                lastQueueEvent.target.currState = targetState;
                convertToBlur = true;
            }
        } else if (lastQueueEvent.event.type === "focus") {
            convertToBlur = true;
        }

        if (convertToBlur && !doNotConvert) {
            lastQueueEvent.event.type = "blur";
            lastQueueEvent.event.tlEvent = "focusout";
        }

        if (!lastQueueEvent.dcid) {
            // Check if DOM Capture needs to be triggered for this message.
            dcid = addDOMCapture(lastQueueEvent.event.type, webEvent.target);
            if (dcid) {
                lastQueueEvent.dcid = dcid;
            }
        }

        if (!doNotConvert) {
            // Reset the inFocus state of the lastFocusEvent
            lastFocusEvent.inFocus = false;
        }

        // Save current target state as future prevState
        pastEvents[id].prevState = targetState ? utils.mixin({}, targetState) : targetState;

        postEventQueue(tmpQueue);
    }

    /**
     * Handles the focus events. It is fired either when the real focus event take place
     * or right after the click event on an element (only when browser focus event was not fired)
     * @private
     * @param {string} id ID of an elment
     * @param {WebEvent} webEvent Normalized browser event
     * @return void
     */
    function handleFocus(id, webEvent) {
        var tmpQueueLength = tmpQueue.length,
            tmpQueueEvent = tmpQueueLength ? tmpQueue[tmpQueueLength - 1] : null;

        // Check if target is already in focus
        if (lastFocusEvent.inFocus && lastFocusEvent.target.id === id) {
            if (!tmpQueueEvent || tmpQueueEvent.target.id !== id) {
                // Target is already in focus but the event is not added to tmpQueue yet
                addToTmpQueue(webEvent, id);
                // Reset prior change & click processing states.
                pastEvents[id].processedChange = false;
                pastEvents[id].processedClick = false;
            }
            return;
        }

        if (lastFocusEvent.inFocus) {
            // Synthetic blur on the previously in-focus element
            handleBlur(lastFocusEvent.target.id, lastFocusEvent);
        }

        lastFocusEvent = webEvent;
        lastFocusEvent.inFocus = true;
        if (!pastEvents[id]) {
            pastEvents[id] = {};
        }

        pastEvents[id].focus = lastFocusEvent.dwellStart = Number(new Date());
        pastEvents[id].focusInOffset = viewTimeStart ? lastFocusEvent.dwellStart - Number(viewTimeStart) : -1;
        // prevState is derived on focus or prior blur (if any). If neither of these is available then prevState is derived from the click event.
        if (webEvent.type === "focus") {
            pastEvents[id].prevState = utils.getValue(webEvent, "target.state");
        } else if (webEvent.type === "click" && !pastEvents[id].prevState) {
            pastEvents[id].prevState = utils.getValue(webEvent, "target.state");
            // Set attribute opposite of the current state
            if (pastEvents[id].prevState && (webEvent.target.subType === "checkbox" || webEvent.target.subType === "radio")) {
                pastEvents[id].prevState.checked = !pastEvents[id].prevState.checked;
            }
        }
        pastEvents[id].visitedCount = pastEvents[id].visitedCount + 1 || 1;
        pastEvents[id].webEvent = webEvent;
        pastEvents[id].processedChange = false;
        pastEvents[id].processedClick = false;

        addToTmpQueue(webEvent, id);
    }

    /**
     * Checks the tmpQueue for any prior/pending interaction that needs to be posted.
     * @private
     * @param {string} id ID of the current element being interacted with.
     * @param {WebEvent} webEvent Normalized browser event of the current interaction.
     * @return {Boolean} True if there was a pending interaction that has been posted, false otherwise.
     */
    function checkQueue(id, webEvent) {
        var pendingInteractionPosted = false,
            prevID,
            tmpQueueLength = tmpQueue.length,
            tmpQueueEvent = tmpQueueLength ? tmpQueue[tmpQueueLength - 1] : null;

        // Return immediately if there is nothing pending in the tmpQueue
        if (!tmpQueueEvent) {
            return pendingInteractionPosted;
        }

        prevID = tmpQueueEvent.target.id;

        // Check if there is a focus, click or change on a different element than one in the tmpQueue
        // Select lists are an exception because the option element can be selected
        if (prevID !== id && tmpQueueEvent.target.tltype !== "selectList") {
            // Is there is a focus, click or change event on another element
            if (webEvent.type === "focus" || webEvent.type === "click" || webEvent.type === "change" || webEvent.type === "blur" || webEvent.type === "unload") {
                // Synthetic blur on the previous element
                handleBlur(prevID);
                pendingInteractionPosted = true;
            }
        }

        // Check if there is a repeating click/change on the same input element.
        if (prevID === id &&
                ((webEvent.type === "click" && pastEvents[id].processedClick) ||
                (webEvent.type === "change" && pastEvents[id].processedChange) ||
                (webEvent.type === "pointerup" && pastEvents[id].processedClick && utils.getValue(webEvent.target, "state.disabled", false)))) {
            // Post the prior click or change
            handleBlur(prevID, null, true);
            pendingInteractionPosted = true;
        }

        return pendingInteractionPosted;
    }

    /**
     * Handles change events. Its called when the browser 'change' event fires.
     * @private
     * @param {string} id ID of an elment
     * @param {WebEvent} webEvent Normalized browser event
     * @return void
     */
    function handleChange(id, webEvent) {
        var tmpQueueEvent;

        // Ensure focus is processed for the target element
        handleFocus(id, webEvent);

        tmpQueueEvent = tmpQueue[tmpQueue.length - 1];
        tmpQueueEvent.event.type = "change";
        tmpQueueEvent.event.tlEvent = getTlEvent(webEvent);
        tmpQueueEvent.target.currState = webEvent.target.state;
        if (pastEvents[id].prevState) {
            tmpQueueEvent.target.prevState = pastEvents[id].prevState;
            if (typeof tmpQueueEvent.target.currState.checked === "boolean") {
                tmpQueueEvent.target.prevState.checked = !tmpQueueEvent.target.currState.checked;
            }
        }

        pastEvents[id].webEvent = webEvent;
        pastEvents[id].processedChange = true;

        // If this is a lazyloading element, do snapshot before or after css selector.
        if (utils.matchTarget(lazyloadingEl, webEvent.target) !== -1) {
            handleBlur(id, webEvent);
        }
    }


    /**
     * Handles click events. Additionally it recognizes situations when browser didn't
     * fire the focus event and in such case it invokes 'handleFocus' method.
     * @private
     * @param {string} id ID of an elment
     * @param {WebEvent} webEvent Normalized browser event
     * @return void
     */
    function handleClick(id, webEvent) {
        var tmpQueueEvent,
            nativeEvent;

        if (webEvent.target.type === "select" && lastClickEvent && lastClickEvent.target.id === id) {
            lastClickEvent = null;
            return;
        }

        // Ensure focus is registered for the element being clicked
        handleFocus(id, webEvent);

        // Update the existing queue entry with relXY info. from the click event
        tmpQueueEvent = tmpQueue[tmpQueue.length - 1];
        if (tmpQueueEvent.event.type === "focus") {
            tmpQueueEvent.event.type = "click";
            tmpQueueEvent.event.tlEvent = getTlEvent(webEvent);
        }
        nativeEvent = webEvent.nativeEvent;
        // relXY shouldn't be contained when there is no mouse click.
        if (nativeEvent && (!window.MouseEvent || !(nativeEvent instanceof MouseEvent && nativeEvent.detail === 0) ||
            (window.PointerEvent && nativeEvent instanceof PointerEvent && nativeEvent.pointerType !== ""))) {
            tmpQueueEvent.target.position.relXY = utils.getValue(webEvent, "target.position.relXY");
        }

        // MSIE/Edge can trigger "change" before "click" for the same user action on checkbox/radio
        // in which case do not overwrite the stored change event.
        if (!pastEvents[id].processedChange) {
            pastEvents[id].webEvent = webEvent;
        }
        pastEvents[id].processedClick = true;

        // For clickable targets, process and post the click right away
        if (isTargetClickable(webEvent.target)) {
            // Do not convert to change or blur
            handleBlur(id, webEvent, true);
        }

        lastClickEvent = webEvent;
    }

    /**
     * Handles pointerdown and pointerup events. Interprets a pointerdown
     * followed by a pointerup on a disabled element as a "click"
     * @private
     * @param {string} id ID of an elment
     * @param {WebEvent} webEvent Normalized browser event
     * @return void
     */
    function handlePointerClick(id, webEvent) {
        var currPointerTarget = id;

        if (!utils.getValue(webEvent, "target.element.disabled", false)) {
            // Only infer clicks on disabled elements.
            return;
        }

        switch (webEvent.type) {
        case "pointerdown":
            // Save the current target
            lastPointerDownTarget = currPointerTarget;
            break;
        case "pointerup":
            // Is the current pointerup target same as the previous pointerdown target?
            if (currPointerTarget === lastPointerDownTarget) {
                // Convert to click
                webEvent.type = "click";
                handleClick(id, webEvent);
            }
            lastPointerDownTarget = null;
            break;
        }
    }

    /**
     * Handles the mousemove event and posts the appropriate message to the
     * replay module's queue
     * @private
     * @function
     * @name replay-handleMousemove
     * @param {object} webEvent A normalized event object per the WebEvent
     * interface definition.
     */
    function handleMousemove(webEvent) {
        var currentEvent,
            diff = 0,
            distance = 0,
            el,
            id,
            relXY,
            x,
            y;

        // If mousemove is not enabled, or if this is a touch device, do not record event.
        if (!mousemoveConfig.enabled || window.hasOwnProperty("ontouchstart")) {
            return;
        }

        if (mousemoveCount >= mousemoveLimit) {
            return;
        }

        currentEvent = {
            element: {
                id: webEvent.target.id,
                idType: webEvent.target.idType
            },
            x: webEvent.position.x,
            y: webEvent.position.y,
            offset: context.getCurrentOffset()
        };

        if (lastMouseEvent !== null) {
            diff = currentEvent.offset - lastMouseEvent.offset;
            if (sampleRate && diff < sampleRate) {
                return;
            }
            x = Math.abs(currentEvent.x - lastMouseEvent.x);
            y = Math.abs(currentEvent.y - lastMouseEvent.y);
            distance = (x > y) ? x : y;
            if (ignoreRadius && distance < ignoreRadius) {
                return;
            }
            if (diff > maxInactivity) {
                maxInactivity = diff;
            }
        }

        el = JSON.stringify(currentEvent.element);
        id = elMap[el];
        if (typeof id === "undefined") {
            mousemoveElements.push(currentEvent.element);
            id = mousemoveElements.length - 1;
            elMap[el] = id;
        }

        // Get relative x y from webEvent
        relXY = utils.getValue(webEvent, "target.position.relXY").split(",");

        // Push event
        mousemoveQueue.push([id, relXY[0], relXY[1], currentEvent.offset]);

        mousemoveCount += 1;

        lastMouseEvent = currentEvent;
    }

    /**
     * Handles the "orientationchange" event and posts the appropriate message
     * to the replay module's queue.
     * @private
     * @function
     * @name replay-handleOrientationChange
     * @param {object} webEvent A normalized event object per the WebEvent
     * interface definition.
     */
    function handleOrientationChange(webEvent) {
        var newOrientation = webEvent.orientation,
            orientationChangeEvent = {
                type: 4,
                event: {
                    type: "orientationchange"
                },
                target: {
                    prevState: {
                        orientation: currOrientation,
                        orientationMode: utils.getOrientationMode(currOrientation)
                    },
                    currState: {
                        orientation: newOrientation,
                        orientationMode: utils.getOrientationMode(newOrientation)
                    }
                }
            };

        postUIEvent(orientationChangeEvent);
        currOrientation = newOrientation;
    }

    /**
     * Handles the "visibilitychange" event.
     * It is invoked when the document becomes visible or hidden
     * then logs the visibility state of the current tab.
     * @private
     * @function
     * @name replay-handleVisibilityChange
     * @param {object} webEvent A normalized event object per the WebEvent
     * interface definition.
     */
    function handleVisibilityChange(webEvent) {
        var newVisibility = document.visibilityState === "visible" ? true : false,
            msg = {
                type: 4,
                event: {
                    type: "visibilitychange"
                },
                target: {
                    prevState: {
                        visible: currVisibility
                    },
                    currState: {
                        visible: newVisibility
                    }
                }
            },
            dcid;

        // Add DOM Capture message if configured
        dcid = addDOMCapture(webEvent.type, webEvent.target);
        if (dcid) {
            msg.dcid = dcid;
        }
        postUIEvent(msg);
        currVisibility = newVisibility;
    }

    /* TODO: Refactor this to use a well-defined touchState object */
    function isDuplicateTouch(touchState) {
        var result = false;

        if (!touchState) {
            return result;
        }

        result = (savedTouch.scale === touchState.scale &&
                Math.abs((new Date()).getTime() - savedTouch.timestamp) < 500);

        return result;
    }

    function saveTouchState(touchState) {
        savedTouch.scale = touchState.scale;
        savedTouch.rotation = touchState.rotation;
        savedTouch.timestamp = (new Date()).getTime();
    }

    /**
     * Takes the scale factor and returns the pinch mode as a text string.
     * Values less than 1 correspond to a pinch close gesture. Values greater
     * than 1 correspond to a pinch open gesture.
     * @private
     * @function
     * @name replay-getPinchType
     * @return {String} "CLOSE", "OPEN" or "NONE" for valid scale values.
     * "INVALID" in case of error.
     */
    function getPinchType() {
        var s,
            pinchType;

        s = deviceScale - previousDeviceScale;
        if (isNaN(s)) {
            pinchType = "INVALID";
        } else if (s < 0) {
            pinchType = "CLOSE";
        } else if (s > 0) {
            pinchType = "OPEN";
        } else {
            pinchType = "NONE";
        }

        return pinchType;
    }


    /**
     * Used to create the client state message from a webEvent.
     * @private
     * @function
     * @name replay-getClientStateMessage
     * @param {object} webEvent A webEvent that will be used to create the clientState.
     * @return {object} Client state message object.
     */
    function getClientStateMessage(webEvent) {
        var documentElement = document.documentElement || {},
            documentBody = document.body || {},
            screen = window.screen,
            screenWidth = screen.width,
            screenHeight = screen.height,
            deviceOrientation = utils.getValue(webEvent, "orientation", 0),
            // iOS Safari always reports the screen width of the portrait mode
            normalizedScreenWidth = !utils.isiOS ? screenWidth : Math.abs(deviceOrientation) === 90 ? screenHeight : screenWidth,
            msg = {
                type: 1,
                clientState: {
                    pageWidth: Math.max(documentBody.clientWidth || 0, documentElement.offsetWidth || 0, documentElement.scrollWidth || 0),
                    pageHeight: Math.max(documentBody.clientHeight || 0, documentElement.offsetHeight || 0, documentElement.scrollHeight || 0),
                    viewPortWidth: window.innerWidth || documentElement.clientWidth,
                    viewPortHeight: window.innerHeight || documentElement.clientHeight,
                    viewPortX: Math.round(window.pageXOffset || (documentElement || documentBody).scrollLeft || 0),
                    viewPortY: Math.round(window.pageYOffset || (documentElement || documentBody).scrollTop || 0),
                    deviceOrientation: deviceOrientation,
                    event: utils.getValue(webEvent, "type")
                }
            },
            clientState = msg.clientState,
            scaleWidth;

        pastClientState = pastClientState || msg;

        // Workaround for browser/webviews that give incorrect values for innerWidth & innerHeight during unload
        if (clientState.event === "unload" &&
                clientState.viewPortHeight === clientState.pageHeight &&
                clientState.viewPortWidth === clientState.pageWidth) {
            if (pastClientState.clientState.viewPortHeight < clientState.viewPortHeight) {
                // Use viewport values from the previous clientState event.
                clientState.viewPortHeight = pastClientState.clientState.viewPortHeight;
                clientState.viewPortWidth = pastClientState.clientState.viewPortWidth;
            }
        }

        if ((clientState.viewPortY + clientState.viewPortHeight) > clientState.pageHeight) {
            // Scroll beyond the bottom of the page results in viewPortY overshooting the rendered pageHeight. Cap it at the pageHeight.
            clientState.viewPortY = clientState.pageHeight - clientState.viewPortHeight;
        }

        // Normalize the viewPortY values to account for any scrolls beyond the page boundaries
        if (clientState.viewPortY < 0) {
            // Scroll beyond the top of the page results in negative viewPortY. Cap it at 0.
            clientState.viewPortY = 0;
        }

        // Calculate the scale based on the ratio between the screen width and viewport width
        scaleWidth = !clientState.viewPortWidth ? 1 : (normalizedScreenWidth / clientState.viewPortWidth);
        clientState.deviceScale = scaleWidth.toFixed(3);

        // Set the viewTime for this client state
        clientState.viewTime = 0;
        if (scrollViewStart && scrollViewEnd) {
            clientState.viewTime = scrollViewEnd.getTime() - scrollViewStart.getTime();
        }

        if (webEvent.type === "scroll") {
            clientState.viewPortXStart = pastClientState.clientState.viewPortX;
            clientState.viewPortYStart = pastClientState.clientState.viewPortY;
        }

        return msg;
    }

    /**
     * Post the current client state and also record it as pastClientState.
     * Reset the scrollViewStart/End values.
     * @private
     * @function
     * @name replay-sendClientState
     */
    function sendClientState() {
        var cs;

        if (curClientState) {
            cs = curClientState.clientState;
            // Sanity checks: These are needed since we have observed some unexplained instances
            // of negative values in the viewPortHeight.
            if (cs.viewPortHeight > 0 && cs.viewPortHeight < viewPortWidthHeightLimit &&
                    cs.viewPortWidth > 0 && cs.viewPortWidth < viewPortWidthHeightLimit) {
                postUIEvent(curClientState);
            }
            pastClientState = curClientState;
            curClientState = null;
            scrollViewStart = nextScrollViewStart || scrollViewStart;
            scrollViewEnd = null;
        }
        sendClientState.timeoutId = 0;
    }

    /**
     * Used to create client state from a webEvent.
     * @private
     * @function
     * @name replay-handleClientState
     * @param {object} webEvent A webEvent that will created into a clientState and saved for previous and current client state.
     * @return {object} Client state object.
     */
    function handleClientState(webEvent) {
        var attentionMsg = null;

        // Opera Mini has a faulty implementation and produces incorrect data. Do not send incorrect data.
        if (utils.isOperaMini) {
            return;
        }

        curClientState = getClientStateMessage(webEvent);

        // TODO: Change these if-else to a switch statement
        if (webEvent.type === "scroll" || webEvent.type === "resize") {
            // Set the interval timeout so we can collect related scroll / resize events in one batch
            if (sendClientState.timeoutId) {
                window.clearTimeout(sendClientState.timeoutId);
            }
            sendClientState.timeoutId = window.setTimeout(sendClientState, utils.getValue(replayConfig, "scrollTimeout", 2000));
        } else if (webEvent.type === "touchstart" || webEvent.type === "load") {
            if (curClientState) {
                // set the initial device scale which is used to determine what type of pinch happened
                previousDeviceScale = parseFloat(curClientState.clientState.deviceScale);
            }
        } else if (webEvent.type === "touchend") {
            if (curClientState) {
                // used to determine what type of pinch happened
                deviceScale = parseFloat(curClientState.clientState.deviceScale);
                // Send client state on touchend
                sendClientState();
            }
        }

        if (webEvent.type === "load" || webEvent.type === "unload") {
            // The "Attention" event is deprecated
            if (webEvent.type === "unload" && pageLoadTime) {
                // Save the "attention" event which is essentially a dup of the unload with viewTime starting from page load.
                attentionMsg = utils.clone(curClientState);
                attentionMsg.clientState.event = "attention";
                attentionMsg.clientState.viewTime = (new Date()).getTime() - pageLoadTime;
            }

            sendClientState();

            if (attentionMsg) {
                // send the attentionMsg
                curClientState = attentionMsg;
                sendClientState();
            }
        }

        return curClientState;
    }

    /**
     * Handles the "touchstart" event, which is only used to get the deviceScale before a pinch
     * @private
     * @function
     * @name replay-handleTouchStart
     * @param {object} webEvent A normalized event object per the WebEvent
     * interface definition.
     */
    function handleTouchStart(webEvent) {
        var fingerCount = utils.getValue(webEvent, "nativeEvent.touches.length", 0);

        if (fingerCount === 2) {
            handleClientState(webEvent);
        }
    }

    /**
     * Handles the "touchend" event and posts the appropriate message to the
     * replay module's queue.
     * @private
     * @function
     * @name replay-handleTouchEnd
     * @param {object} webEvent A normalized event object per the WebEvent
     * interface definition.
     */
    function handleTouchEnd(webEvent) {
        var fingerCount,
            prevTouchState = {},
            // Rotation angle for android devices does not work for all devices/browsers
            rotation = utils.getValue(webEvent, "nativeEvent.rotation", 0) || utils.getValue(webEvent, "nativeEvent.touches[0].webkitRotationAngle", 0),
            touchState = null,
            touchEndEvent = {
                type: 4,
                event: {
                    type: "touchend"
                },
                target: {
                    id: utils.getValue(webEvent, "target.id"),
                    idType: utils.getValue(webEvent, "target.idType")
                }
            };

        // count the number of fingers placed on the screen
        fingerCount = utils.getValue(webEvent, "nativeEvent.changedTouches.length", 0) + utils.getValue(webEvent, "nativeEvent.touches.length", 0);
        if (fingerCount !== 2) {
            return;
        }

        // 1st handle the client state change. This will update the device scale information.
        handleClientState(webEvent);

        // Only post when there are two fingers reported by the touchend event object
        // create the current touchstate
        touchState = {
            rotation: rotation ? rotation.toFixed(2) : 0,
            scale: deviceScale ? deviceScale.toFixed(2) : 1
        };
        touchState.pinch = getPinchType();

        // create the prev touch state
        prevTouchState.scale = previousDeviceScale ? previousDeviceScale.toFixed(2) : 1;

        // Set the curr and prev states
        touchEndEvent.target.prevState = prevTouchState;
        touchEndEvent.target.currState = touchState;

        postUIEvent(touchEndEvent);
    }

    /**
     * Compares two WebEvent's to determine if they are duplicates. Examines
     * the event type, target id and the timestamp to make this determination.
     * XXX - Push this into the browser service or core?!?
     * @private
     * @function
     * @name replay-isDuplicateEvent
     * @param {object} curr A WebEvent object
     * @param {object} prev A WebEvent object
     * @return {boolean} Returns true if the WebEvents are duplicates.
     */
    function isDuplicateEvent(curr, prev) {
        var propsToCompare = ["type", "name", "target.id"],
            prop = null,
            i,
            len,
            duplicate = true,
            DUPLICATE_EVENT_THRESHOLD_TIME = 10,
            timeDiff = 0,
            currTimeStamp = 0,
            prevTimeStamp = 0;

        // Sanity check
        if (!curr || !prev || typeof curr !== "object" || typeof prev !== "object") {
            return false;
        }

        // Compare WebEvent properties
        for (i = 0, len = propsToCompare.length; duplicate && i < len; i += 1) {
            prop = propsToCompare[i];
            if (utils.getValue(curr, prop) !== utils.getValue(prev, prop)) {
                duplicate = false;
                break;
            }
        }

        if (duplicate) {
            currTimeStamp = utils.getValue(curr, "timestamp");
            prevTimeStamp = utils.getValue(prev, "timestamp");
            // Don't compare if neither objects have a timestamp
            if (!(isNaN(currTimeStamp) && isNaN(prevTimeStamp))) {
                // Check if the event timestamps are within the predefined threshold
                timeDiff = Math.abs(utils.getValue(curr, "timestamp") - utils.getValue(prev, "timestamp"));
                if (isNaN(timeDiff) || timeDiff > DUPLICATE_EVENT_THRESHOLD_TIME) {
                    duplicate = false;
                }
            }
        }

        return duplicate;
    }


    /**
     * Default handler for event types that are not being processed by the module.
     * @private
     * @function
     * @param {object} webEvent A WebEvent object
     * @name replay-defaultEventHandler
     */
    function defaultEventHandler(webEvent) {
        var msg = {
                type: 4,
                event: {
                    tlEvent: getTlEvent(webEvent),
                    type: webEvent.type
                },
                target: {
                    id: utils.getValue(webEvent, "target.id"),
                    idType: utils.getValue(webEvent, "target.idType"),
                    currState: utils.getValue(webEvent, "target.state")
                }
            },
            dcid;

        // Add DOM Capture message if configured
        dcid = addDOMCapture(webEvent.type, webEvent.target);
        if (dcid) {
            msg.dcid = dcid;
        }

        postUIEvent(msg);
    }

    return {
        init: function () {
            tmpQueue = [];
        },
        destroy: function () {
            handleBlur(lastEventId);
            tmpQueue = [];

            // Clear out any pending clientState timeout
            if (sendClientState.timeoutId) {
                window.clearTimeout(sendClientState.timeoutId);
                sendClientState.timeoutId = 0;
            }
        },
        onevent: function (webEvent) {
            var id = null,
                returnObj = null,
                orientation,
                screenOrientation,
                loggedException,
                exception,
                errorMessage = null;

            // Sanity checks
            if (typeof webEvent !== "object" || !webEvent.type) {
                return;
            }

            if (isDuplicateEvent(webEvent, prevWebEvent)) {
                prevWebEvent = webEvent;
                return;
            }

            prevWebEvent = webEvent;


            id = utils.getValue(webEvent, "target.id");

            if (!pastEvents[id]) {
                pastEvents[id] = {};
            }

            checkQueue(id, webEvent);

            switch (webEvent.type) {
            case "hashchange":
                // These are handled in core-detectScreenviewChange()
                break;
            case "focus":
                handleFocus(id, webEvent);
                break;
            case "blur":
                handleBlur(id, webEvent);
                break;
            case "pointerdown":
                handlePointerClick(id, webEvent);
                break;
            case "pointerup":
                handlePointerClick(id, webEvent);
                break;
            case "click":
                // Normal click processing
                handleClick(id, webEvent);
                break;
            case "change":
                handleChange(id, webEvent);
                break;
            case "orientationchange":
                handleOrientationChange(webEvent);
                break;
            case "touchstart":
                handleTouchStart(webEvent);
                break;
            case "touchend":
                handleTouchEnd(webEvent);
                break;
            case "loadWithFrames":
                TLT.logScreenviewLoad("rootWithFrames");
                break;
            case "load":
                // initialize the orientation
                currOrientation = webEvent.orientation;

                // initialize the start time for the scrolled view
                scrollViewStart = new Date();

                /*
                * Special handling for Android based on screen width/height since
                * certain Android devices do not adhere to the standards.
                * e.g. Some tablets report portrait orientation = 90 and landscape = 0
                */
                if (typeof utils.getOrientationAngle() !== "number" || utils.isAndroid) {
                    // Use screen.width/height to determine orientation if utils.getOrientationAngle() does not match
                    screenOrientation = (window.screen.width > window.screen.height ? 90 : 0);
                    orientation = utils.getOrientationAngle();
                    if (Math.abs(orientation) !== screenOrientation && !(orientation === 180 && screenOrientation === 0) && !(orientation === 270 && screenOrientation === 90)) {
                        utils.isLandscapeZeroDegrees = true;
                        if (Math.abs(orientation) === 180 || Math.abs(orientation) === 0) {
                            currOrientation = 90;
                        } else if (Math.abs(orientation) === 90 || Math.abs(orientation) === 270) {
                            currOrientation = 0;
                        }
                    }
                }

                // send initial clientstate after a slight delay as some browsers need time to provide correct viewport values
                setTimeout(function () {
                    if (context.isInitialized()) {
                        handleClientState(webEvent);
                    }
                }, 100);

                // Use "root" or location.hash depending on configuration. Default is to use location.hash if it exists.
                if (utils.getValue(replayConfig, "forceRootScreenview", false)) {
                    rootScreenviewName = defaultRootScreenName;
                } else {
                    rootScreenviewName = context.normalizeUrl(location.hash, 2) || defaultRootScreenName;
                }
                TLT.logScreenviewLoad(rootScreenviewName);

                break;
            case "screenview_load":
                // starts screenview time used for calculating the offset
                viewTimeStart = new Date();

                // Reset visited counts
                resetVisitedCounts();

                // Check and add DOM Capture
                returnObj = addDOMCapture("load", null, webEvent.name);

                break;
            case "screenview_unload":
                // Check and add DOM Capture
                returnObj = addDOMCapture("unload", null, webEvent.name);

                break;
            case "resize":
            case "scroll":
                if (!scrollViewEnd) {
                    scrollViewEnd = new Date();
                }
                nextScrollViewStart = new Date();

                handleClientState(webEvent);

                break;
            case "unload":
                for (loggedException in loggedExceptions) {
                    if (loggedExceptions.hasOwnProperty(loggedException)) {
                        exception = loggedExceptions[loggedException].exception;
                        if (exception.repeats > 1) {
                            errorMessage = {
                                type: 6,
                                exception: exception
                            };
                            context.post(errorMessage);
                        }
                    }
                }

                // Flush any saved control
                if (tmpQueue) {
                    postEventQueue(tmpQueue);
                }

                // set the final timestamp of this scrolled view.
                scrollViewEnd = new Date();

                // send final clientstate
                handleClientState(webEvent);

                // If the root screenview was the default or the current location.hash is
                // the same as during page load then log the page level screenview unload.
                if (rootScreenviewName === defaultRootScreenName ||
                        context.normalizeUrl(location.hash, 2) === rootScreenviewName) {
                    TLT.logScreenviewUnload(rootScreenviewName);
                }
                break;
            case "mousemove":
                handleMousemove(webEvent);
                break;
            case "error":
                handleError(webEvent);
                break;
            case "visibilitychange":
                handleVisibilityChange(webEvent);
                break;
            default:
                // Call the default handler for all other DOM events
                defaultEventHandler(webEvent);
                break;
            }

            lastEventId = id;
            return returnObj;
        },
        onmessage: function () {
        }
    };
});
