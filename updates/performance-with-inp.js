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
#if defined(DEBUG) || defined(NDEBUG)
// Sanity check
if (TLT && typeof TLT.addModule === "function") {
    /**
     * @name performance
     * @namespace
     */
    TLT.addModule("performance", function (context) {
#endif
#if defined(TEST)
const _performanceModule = function (context) {
#endif
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
            if (!vitals.fid && !vitals.lcp && !vitals.cls && !vitals.inp && !vitals.fcp) {
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
                vitals.fidRating = metric.rating;
                break;
            case "LCP":
                // milliseconds
                vitals.lcp = Math.round(metric.value);
                vitals.lcpRating = metric.rating;
                break;
            case "CLS":
                vitals.cls = Number(metric.value.toFixed(2));
                vitals.clsRating = metric.rating;
                break;
            case "INP":
                vitals.inp = Number(metric.value);
                vitals.inpRating = metric.rating;
                break;
            case "FCP":
                vitals.fcp = Number(metric.value);
                vitals.fcpRating = metric.rating;
                break;
            default:
                break;
            }

            // Immediately post message if all vitals have been collected.
            if (typeof vitals.fid !== "undefined" && typeof vitals.lcp !== "undefined" && typeof vitals.cls !== "undefined" && typeof vitals.inp !== "undefined" && typeof vitals.fcp !== "undefined") {
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
            api.onCLS(collectVitals);
            api.onLCP(collectVitals);
            api.onFID(collectVitals);
            api.onINP(collectVitals);
            api.onFCP(collectVitals);
            // Schedule a timeout to post the page experience message.
#if defined(DEBUG) || defined(NDEBUG)
            pageExpTimerId = setTimeout(postPageExperienceMsg, 300000);
#endif
#if defined(TEST)
            postPageExperienceMsg();
#endif
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
                    getCLS: webVitals.onCLS,
                    getLCP: webVitals.onLCP,
                    getFID: webVitals.onFID,
                    getINP: webVitals.onINP,
                    getFCP: webVitals.onFCP
                };
            }

            if (pageExperienceConfig.api) {
                pageExperienceConfig.enabled = true;
            } else {
                pageExperienceConfig.enabled = false;
#if defined(DEBUG) || defined(TEST)
                utils.clog("Performance Module: Web Vitals JS not found. Page Experience Signals will not be logged.");
#endif
            }
        }

        // Module interface.
        /**
         * @scope performance
         */
        return {

#if defined(DEBUG) || defined(TEST)
            // Expose private functions for unit testing
            parseTiming: parseTiming,
            getRenderTime: getRenderTime,
            postPerformanceEvent: postPerformanceEvent,
            postMixedModeViolations: postMixedModeViolations,
            processPerformanceEntry: processPerformanceEntry,
            initPageExperience: initPageExperience,
            logPageExperience: logPageExperience,
            collectVitals: collectVitals,
            postPageExperienceMsg: postPageExperienceMsg,
#endif

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
#if defined(DEBUG) || defined(TEST)
                    utils.clog("Invalid event object passed to onevent: ", event);
#endif
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
#if defined(DEBUG) || defined(NDEBUG)
    });  // End of TLT.addModule
} else {
#endif
#ifdef DEBUG
    // Only throw an error in DEBUG mode.
    throw new Error("Performance module included but TLT is not defined!!!");
#endif
#if defined(DEBUG) || defined(NDEBUG)
}
#endif

#ifdef TEST
    }

module.exports = {
    _performanceModule
}
#endif
