// tealeaf v5.6.0 - Jan 14, 2020

// tealeaf config
/**
 * Copyright (c) 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

(function () {
    "use strict";
    var TLT = window.TLT;

    if (TLT.utils.isLegacyIE) {
        return;
    }

    var config = {
        core: {
            blockedElements: [],
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
                        { name: "change", recurseFrames: true },
                        { name: "click", recurseFrames: true },
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
                        { name: "error", target: window}
                    ]
                },
                TLCookie: {
                    enabled: true
                }
            },
            normalization: {
                urlFunction: function (urlOrPath) {
                    return urlOrPath;
                }
            },
            sessionDataEnabled: false,
            sessionData: {
                sessionValueNeedsHashing: true,
                sessionQueryName: "sessionID",
                sessionQueryDelim: ";",
                sessionCookieName: "jsessionid"
            },
            screenviewAutoDetect: true,
            framesBlacklist: [ "#iframe1" ]
        },
        services: {
            queue: {
                tltWorker: null,
                asyncReqOnUnload: false,
                useBeacon: true,
                xhrLogging: true,
                queues: [
                    {
                        qid: "DEFAULT",
                        endpoint: "https://aucollector.tealeaf.ibmcloud.com/collector/collectorPost",
                        maxEvents: 50,
                        timerInterval: 3000,
                        maxSize: 0,
                        checkEndpoint: false,
                        endpointCheckTimeout: 3000,
                        encoder: "gzip"
                    }
                ]
            },
            message: {
                privacy: [
                    {
                        targets: [
                            "input[type=password]"
                        ],
                        "maskType": 2
                    },
                    {
                        targets: [
                            "#number","#expiry","#cvv", // credit cards
                            { id: { regex: "(card|credit)", flags: "g" }, idType: -1 } // anything with card or credit in id
                        ],
                        maskType: 3
                    },
                    {
                        targets: [
                            { id: { regex: "email", flags: "g" }, idType: -1 } // anything with email in id
                        ],
                        maskType: 4,
                        maskFunction: function (value) { // if not 'gmail', mask the name and the initial domain
                            var bits = value.split('@');
                            if (bits.length < 2) { return "(name)"; }
                            var domain = bits[1].split('.');
                            if (domain[0] === "gmail") { return value; }
                            domain[0] = "(domain)";
                            return "(name)@"+domain.join('.');
                        }
                    }
                ],
                privacyPatterns: [
                    {
                        pattern: { regex: /[^@\s"'>]+@[^@\s<]+?(\.[^@\s"'<]+)+/, flags: "g" },
                        replacement: "(name)@(domain)$1"
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
                diffEnabled: true,
                options: {
                    maxMutations: 100,
                    maxLength: 2000000,
                    captureFrames: false,
                    removeScripts: true
                },
                screenviewBlacklist: [ { regex: "#Screenname[A,C]" } ]
            },
            browser: {
                sizzleObject: "window.Sizzle",
                jQueryObject: "window.jQuery"
            }
        },
        modules: {
            overstat: {
                hoverThreshold: 1000
            },
            performance: {
                calculateRenderTime: true,
                renderTimeThreshold: 600000,
                filter: {
                    navigationStart: true,
                    unloadEventStart: true,
                    unloadEventEnd: true,
                    redirectStart: true,
                    redirectEnd: true,
                    fetchStart: true,
                    domainLookupStart: true,
                    domainLookupEnd: true,
                    connectStart: true,
                    connectEnd: true,
                    secureConnectionStart: true,
                    responseStart: true,
                    domLoading: true,
                    domContentLoadedEventStart: true,
                    domContentLoadedEventEnd: true,
                    domComplete: true,
                    loadEventEnd: true
                }
            },
            replay: {
                domCapture: {
                    enabled: true,
                    triggers: [
                        { event: "click" },
                        { event: "change" },
                        { event: "load" }
                    ]
                },
                mousemove: {
                    enabled: true,
                    sampleRate: 200,
                    ignoreRadius: 3
                }
            },
            gestures: {
                enabled: false,
                options: {
                    doubleTapInterval: 300
                }
            },
            TLCookie: {
                appCookieWhitelist: [
                    { regex: ".*" }
                ],
                tlAppKey: "2b5f323f11804851beb8617eee293042" // syd [austeampilots]:[stu demos]
            }
        }
    };

    function afterInit() {
        if (TLT.getState() === "destroyed") {
            return;
        }
        if (("digitalData" in window) && (window.digitalData !== null)) {
            TLT.logCustomEvent("digitalData", { description: "digitalData", value: window.digitalData });
        }
        if (("dataLayer" in window) && (window.dataLayer !== null)) {
            TLT.logCustomEvent("dataLayer", { description: "dataLayer", value: window.dataLayer });
        }
    }

    var runTealeaf = true;
    var captureURL = window.location.pathname;
    var captureHost = window.location.hostname;

    // to not run on these pages
    if ((captureURL === "/page/to/not/capture") || (captureURL.indexOf("otherbitinpagename") > -1)) {
        runTealeaf = false;
    }

    // to change settings on these pages
    if ((captureURL === "/page/to/alter") || (captureURL.indexOf("otherbitinalterpagename") > -1)
       ) {
        config.core.screenviewAutoDetect = false;
    }

    // to run content filters only on particular pages
    if (captureURL === "/some-page/to/filter") {
        config.services.message.privacyPatterns.push(
            {pattern: { regex: "sample", flags: "g" }, replacement: "[ $1 ] was matched"})
    }

    var uaMatch=/(?:iPhone|iPad|iPod).+? OS (\d+)_(\d+)/.exec(navigator.userAgent);
    if (uaMatch&&uaMatch[1]+"."+uaMatch[2]<13.0) {
        config.services.queue.useBeacon = false;
    };

	if (captureHost === "www.prod.com" || captureHost === "other.prod.com") {
		config.modules.TLCookie.tlAppKey = "xxx"; // production
	}

    // initialize Tealeaf
    if (runTealeaf) {
        TLT.init(config, afterInit);
    }
}());
