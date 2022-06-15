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

// Default configuration
(function () {
    "use strict";
        // TLT is expected to be defined in the global scope i.e. window.TLT
    var config,
        TLT = window.TLT,
        isWebkit = /WebKit/i.test(navigator.userAgent);

    if (TLT.utils.isLegacyIE) {
        /**
         * This version of the UIC does not support Internet Explorer 8.
         * Applications requiring Internet Explorer 8 (or below) support should use UIC 5.2.0
         */
        if (console) {
            console.warn("This version of the UIC does not support Internet Explorer 8.");
            console.info("Applications requiring Internet Explorer 8 (or below) support should use UIC 5.2.0");
        }
        TLT.terminationReason = "Unsupported browser";
        return;
    }

    config =
    //***UIC CONFIGURATION***
    {
        core: {
            // [Optional] Use this to add a custom note which will be available for eventing in the session data.
            buildNote: "",

            // List of CSS selectors corresponding to elements for which no user interaction is to be reported.
            // WARNING: Since this list has to be evaluated for each event, specifying inefficient selectors can cause performance issues.
            blockedElements: [],

            // WARNING: For advanced users only. Modifying the modules section may lead to unexpected behavior and or performance issues.
            modules: {
                overstat: {
                    events: [
                        { name: "click", recurseFrames: true },
                        { name: "mousemove", recurseFrames: true },
                        { name: "mouseout", recurseFrames: true },
                        { name: "submit", recurseFrames: true }
                    ]
                },
                performance: {
                    events: [
                        { name: "load", target: window },
                        { name: "unload", target: window }
                    ]
                },
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
                        { name: "load", target: window},
                        { name: "unload", target: window},
                        { name: "resize", target: window},
                        { name: "scroll", target: window},
                        { name: "mousemove", recurseFrames: true },
                        { name: "orientationchange", target: window},
                        { name: "touchend" },
                        { name: "touchstart" },
                        { name: "error", target: window},
                        { name: "visibilitychange" }
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
                    enabled: false
                }
            },

            normalization: {
                /**
                  * User defined URL normalization function which accepts an URL, path or fragment and returns
                  * the normalized value.
                  * @param urlOrPath {String} URL, path or fragment which needs to be normalized.
                  * @param [messageType] {Integer} Indicates the message type for which the normalization
                  * is being performed, undefined otherwise.
                  * @returns {String} The normalized URL/path/fragment value.
                  */
                urlFunction: function (urlOrPath, messageType) {
                    // Normalize the URL/path/fragment here.
                    // Refer to the documentation for examples.
                    return urlOrPath;
                }
            },

            // Set the sessionDataEnabled flag to true only if it's OK to expose Tealeaf session data to 3rd party scripts.
            sessionDataEnabled: false,
            sessionData: {
                // Set this flag if the session value needs to be hashed to derive the Tealeaf session ID
                sessionValueNeedsHashing: true,

                // Specify sessionQueryName only if the session id is derived from a query parameter.
                sessionQueryName: "sessionID",
                sessionQueryDelim: ";",

                // sessionQueryName, if specified, takes precedence over sessionCookieName.
                sessionCookieName: "jsessionid"
            },
            // Automatically detect screenview changes by tracking URL path and hash change.
            screenviewAutoDetect: true,
            // list of ignored frames pointed by css selector (top level only)
            framesBlacklist: [
                "#iframe1"
            ]
        },
        services: {
            queue: {
                /**
                 * WARNING: Enabling asynchronous request on unload may result in incomplete or missing data
                 * NOTE: WebKit based browsers such as Chrome and Safari have started blocking synchronous XHR
                 * during page unload. It is expected that other browsers will implement similar restrictions.
                 */
                asyncReqOnUnload: isWebkit,
                useBeacon: true,
                queues: [
                    {
                        qid: "DEFAULT",
                        endpoint: "/TealeafTarget.php",
                        maxEvents: 50,
                        timerInterval: 300000,
                        maxSize: 300000,
                        checkEndpoint: false,
                        endpointCheckTimeout: 3000
                    }
                ]
            },
            message: {
                privacy: [
                    {
                        targets: [
                            // CSS Selector: All password input fields
                            "input[type=password]"
                        ],
                        "maskType": 3
                    }
                ],
                privacyPatterns: [
                    /**
                     * Use privacy patterns to match and replace specific patterns in the HTML.
                     *
                     * WARNING: Applying regular expressions to the HTML DOM can have a
                     * performance impact on the application. Adequate testing must be performed
                     * to ensure that pattern matching is not only working as expected but also
                     * not causing performance impact.
                     *
                     * Example illustrating blocking of SSN
                    {
                        pattern: { regex: "\\d{3}-\\d{2}-\\d{4}", flags: "g" },
                        replacement: "XXX-XX-XXXX"
                    }
                     */
                ]
            },
            encoder: {
                gzip: {
                    /**
                     * The encode function should return encoded data in an object like this:
                     * {
                     *     buffer: "encoded data"
                     * }
                     */
                    encode: "window.pako.gzip",
                    defaultEncoding: "gzip"
                }
            },
            domCapture: {
                diffEnabled: true
            },
            browser: {
                normalizeTargetToParentLink: true
            }
        },
        modules: {
            overstat: {
                hoverThreshold: 1000
            },
            performance: {
                calculateRenderTime: true,
                renderTimeThreshold: 600000
            },
            replay: {
                // DOM Capture configuration
                domCapture: {
                    /**
                     * NOTE: Enabling DOM Capture has significant implications on data transmission and infrastructure.
                     * Hence this feature should be enabled judiciously. If enabled, it requires further configuration
                     * to only perform the DOM Capture based on specific events and elements. Please refer to the
                     * documentation for more details.
                     */
                    enabled: false,
                    /**
                     * The rules for triggering DOM Snapshots are similar to the Privacy configuration.
                     * It accepts a mandatory "event" followed by one or more optional targets
                     * as well as an optional delay after which to take the DOM snapshot.
                     * 
                     * The default configuration below will capture a full DOM snapshot for each and every click,
                     * change action as well as for all screenview load and unloads. Refer to the documentation
                     * for details on fine tuning this configuration to specific elements and screenviews.
                     */
                    triggers: [
                        {
                            event: "click"
                        },
                        {
                            event: "change"
                        },
                        {
                            event: "load"
                        },
                        {
                            event: "visibilitychange"
                        }
                    ]
                },
                // Mousemove configuration
                mousemove: {
                    enabled: false,
                    sampleRate: 200,
                    ignoreRadius: 3
                }
            },
            dataLayer: {
                dataObject: ""
            },
            TLCookie: {
                appCookieWhitelist: [
                    { regex: ".*" }
                ],
                tlAppKey: ""
            }
        }
    };

    TLT.init(config);
}());
