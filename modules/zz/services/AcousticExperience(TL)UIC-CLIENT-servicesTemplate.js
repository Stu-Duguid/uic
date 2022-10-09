/*
	====================================================================
	This Acoustic Experience Analytics (Tealeaf) 6.1.0 UICapture custom template includes the following:
	====================================================================

	Core Changes:
		none

	Optional Modules:
		Standard Ajax Listener module v1.2.2 (https://github.com/acoustic-analytics/UICaptureSDK-Modules)
		Standard Mouse Movement
		Custom DigitalData (visDetect() with "user_left_page" + setTimeout(function(){ TLT.flushAll(); }, 500);)

	Custom Queue Manipulators:
		Modify type 17 Performance message to create type 5 message supporting Description in Replay

	Custom Configuration Manipulators:
		Synchronous on UNLOAD by URL
		Alternate DOM Capture Config by URL
		Configure tlAppKey by Domain
		Alternate IE Configs
		Alternate Chrome & Safari (webkit browser) Configs
		Disable SDK by User Agent
		Disable Beacon & tune Queue settings for Mobile Devices
		
	====================================================================
	Build Date: Mar 26, 2021
	====================================================================
	
//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------- Digital Data (QueryString, visDetect)
//----------------------------------------------------------------------------------------------------------
TLT.addModule("digitalData", function (context) {
    var config = {},
    qKeys = {},
    q,
    svChange = false,
    utils = context.utils;

    function postMsg(desc, action, qKeys) {
        var jMsg = {
            "description": desc,
            "action": action,
            "value": qKeys
        };
        TLT.logCustomEvent(desc, jMsg);
    };
    //------------------------------------------------ Event & CustomEvent Polyfills for IE9-11 Browsers
    if (typeof window.CustomEvent !== 'function') {
        window.CustomEvent = function (inType, params) {
            params = params || {};
            var e = document.createEvent('CustomEvent');
            e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
            return e;
        };
        window.CustomEvent.prototype = window.Event.prototype;
    }
    if (typeof window.Event !== 'function') {
        var origEvent = window.Event;
        window.Event = function (inType, params) {
            params = params || {};
            var e = document.createEvent('Event');
            e.initEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable));
            return e;
        };
        if (origEvent) {
            for (var i in origEvent) {
                window.Event[i] = origEvent[i];
            }
        }
        window.Event.prototype = origEvent.prototype;
    }
    function dispatchEvent(type, name) {
        try {
            var e = new Event(type);
        } catch (err) {
            try {
                var e = new CustomEvent(type);
            } catch (err) {}
        }
        var s = document.getElementsByTagName("script")[0];
        var sv = name;
        var myNode = document.createElement("input");
        myNode.setAttribute("type", "button");
        myNode.setAttribute("id", sv);
        myNode.setAttribute("hidden", "true");
        s.parentNode.appendChild(myNode, s);
        document.getElementById(sv).dispatchEvent(e);
        s.parentNode.removeChild(myNode);
    }
    //------------------------------------------- Left/Returned to Browser Logging -----
    function visDetect() {
        var pageVisibility = document.visibilityState;
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState == 'hidden') {
                postMsg("Left_Page", "Retrieve", "Left_App");
                dispatchEvent('user_left_page', 'Switched_Tabs-or-Left_Browser');
            }
            if (document.visibilityState == 'visible') {
                postMsg("Returned_to_Page", "Retrieve", "Returned_To_App");
            }
        });
    }
    return {
        init: function () {
            config = context.getConfig();
        },
        destroy: function () {
            config = null;
        },
        onevent: function (webEvent) {
            switch (webEvent.type) {
            case "load":
                visDetect();
                break;
            case "user_left_page":
                setTimeout(function(){ TLT.flushAll(); }, 500);
                break;
            default:
                break;
            }
            if (typeof webEvent !== "object" || !webEvent.type) {
                return;
            }
        }
    };
});

//--------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------- Custom SSL Protocol Violation Module
//--------------------------------------------------------------------------------------------------------------
// RETIRED / new with 6.1.0:  UIC implements logging of mixed content violations when Performance Alerts is enabled. 
// Resources using the HTTP protocol on an HTTPS page will be logged using the type 20 mixed content violations message. 
// Note that most newer browsers do not allow mixed content.

//************************ End Custom Modules ************************//

//----------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------ Tealeaf Configuration
//----------------------------------------------------------------------------------------------------------
(function () {
    "use strict";
	// new collection domains effective 4/1/2020:
	// lib-us-1.brilliantcollector.com
	// lib-us-2.brilliantcollector.com
	// lib-eu-1.brilliantcollector.com
	// lib-ap-1.brilliantcollector.com
	var globalEndpoint = "https://lib-us-1.brilliantcollector.com/collector/collectorPost",
	globalAppKey = "2508cb55cf0a4b94be3d2679275b1c61",  // us collector 'Tealeaf' / 'WBird Test'
	isWebkit = /WebKit/i.test(navigator.userAgent),
	disableSDK = false, 
	captureURL = window.location.pathname,
        // TLT is expected to be defined in the global scope i.e. window.TLT
    TLT = window.TLT;
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

	var config = {
		core: {
			inactivityTimeout: 1000 * 60 * 30, /* 30 minutes before SDK timeout and shutdown */
			// List of CSS selectors corresponding to elements for which no user interaction is to be reported.
			// WARNING: Since this list has to be evaluated for each event, specifying inefficient selectors can cause performance issues.
			blockedUserAgents: [
				{ regex: "(Google|Bing|Face|DuckDuck|Yandex|Exa)bot", flags: "i" },
				{ regex: "spider", flags: "i" },
				{ regex: "archiver", flags: "i"	},
				"PhantomJS"
			],
			blockedElements: [],
// new with 5.7.0:  Custom events to trigger logging of load events
// The SDK triggers �load� events on initialization. You can use custom events to trigger logging of load events by adding �screenviewLoadEvent� in the core configuration.
// In some cases the UIC triggers domcapture upon DOMContentLoaded event.  This can result in capturing incomplete fullDOMCapture if some elements aren't loaded/rendered yet. 
// To solve this problem, configure a custom event that triggers the load event at an appropriate time, or specify name: "load" to collect AFTER everything is rendered (css, images, etc)
//			screenviewLoadEvent: {
//				name: "click",   //This could be any custom event or DOM event, such as "load" in cases where standard load event is collecting a blank page.      
//				target: window         
//			},
// By default, UIC will log a type 2 screenview load with the URL #fragment as the screenview name by default.
// If you set the forceRootScreenview option to true, the UIC will always log the initial screenview as "root" irrespective of the location.hash value.
// https://developer.goacoustic.com/acoustic-exp-analytics/docs/json-message-type-schemas-and-examples-for-ui-captures#section-type-2-screenview-message
// https://developer.goacoustic.com/acoustic-exp-analytics/docs/ui-capture-reference#section-screenview-loads-are-associated-with-the-url-fragment-for-page-loads-with-fragment-appended-to-the-url
			// WARNING: For advanced users only. Modifying the modules section may lead to unexpected behavior and or performance issues.
			modules: {
				replay: {
					events: [
						{name: "change",attachToShadows: true,recurseFrames: true},
						{name: "click",recurseFrames: true},
						{name: "dblclick", recurseFrames: true },
						{name: "contextmenu", recurseFrames: true },
                        {name: "pointerdown",recurseFrames: true },
                        {name: "pointerup",recurseFrames: true },
						{name: "hashchange",target: window},
						{name: "focus",target: "input, select, textarea, button",recurseFrames: true},
						{name: "blur",target: "input, select, textarea, button",recurseFrames: true},
						{name: "load",target: window},
						{name: "unload",target: window},
						{name: "resize",target: window},
						{name: "scroll",target: window},
                        {name: "mousemove", recurseFrames: true },  // new with 5.6.0
						{name: "orientationchange",target: window},
						{name: "touchend"},  // Optional feature / tealeaf.gestures.js library not included in this template
						{name: "touchstart"},  // Optional feature / tealeaf.gestures.js library not included in this template
                        {name: "error", target: window},  // new with 5.6.0: improved type 6 exception messages
						{name: "user_left_page" }   // for custom visDetect module and DOM capture when visitor leaves a page
					]
				},
				ajaxListener: {
					xhrEnabled: true,
					fetchEnabled: true, // Capturing fetch data is enabled by default. This function will be automatically turned off in browsers which do not support Fetch API.
					events: [
						{ name: "load", target: window},
						{ name: "unload", target: window}
					]
				},
                digitalData: {
                    enabled: true,
                    events: [
                        { name: "load", target: window },
						{ name: "unload", target: window},
						{ name: "user_left_page", target: window}
                    ]
                },
				sslcheck : {
					enabled : false,
					events : [
						{ name : "load", "target" : window }
					]
				},
                gestures: {  
				// Optional feature / tealeaf.gestures.js and 3rd party hammer.js not included in this template
				// https://developer.goacoustic.com/acoustic-exp-analytics/docs/gestures-configuration-for-ui-capture
				// https://github.com/hammerjs/hammer.js/tree/1.1.x
                    enabled: false,
                    events: [
                        { name: "tap", target: window },
                        { name: "hold", target: window },
                        { name: "drag", target: window },
                        { name: "release", target: window },
                        { name: "pinch", target: window }
                    ]
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
					// https://developer.goacoustic.com/acoustic-exp-analytics/docs/ui-capture-reference#section-performance
					enabled: true,
					events: [
						{ name: "load", target: window },
						{ name: "unload", target: window }
					]
				},
				TLCookie: {
					enabled: true
				}
			},

            normalization: {  // normalize collected URLs if needed for Overstat reporting
                /**
                  * User defined URL normalization function which accepts an URL or path and returns
                  * the normalized URL or normalized path.
                  * @param urlOrPath {String} URL or Path which needs to be normalized.
                  * @returns {String} The normalized URL or Path.
                  */
                urlFunction: function (urlOrPath) {
                    // Normalize the input URL or path here.
                    // Refer to the documentation for an example to normalize the URL path or URL query parameters.
					// https://developer.goacoustic.com/acoustic-exp-analytics/docs/url-normalization
                    return urlOrPath;
                }
            },
			// Automatically detect screenview changes by tracking URL path and hash change.
			screenviewAutoDetect: true,
			// list of ignored frames pointed by css selector (top level only)
			framesBlacklist: [
				"#iframe123"
			]
		},
		services: {
			queue: {
				// WARNING: Enabling asynchronous request on unload may result in incomplete or missing data
				asyncReqOnUnload: true,
				// Beacon has a size limit of 64kb PER PAGE, so if some customer data is lost onUnload, check 1-2 below.
				// 1) some other application is not using beacon on the same page
				// 2) TL unload beacon posts are less than 64kb.
				useBeacon: true,  // set to false if v9 onprem or earlier (v10 OK). If usefetch:true, sent in onUnload post only.
// new with 5.6.0 for use with tltWorker.js. Only initialized on browsers supporting the fetch API
//				web worker docs:  https://developer.goacoustic.com/acoustic-exp-analytics/docs/implementing-the-acoustic-tealeaf-web-worker-script
//				must uncomment mode: "same-origin" and keepalive: true, in tltWorker if onprem + asynchReqOnUnload = true (chrome80)
//				tltWorker: window.fetch && window.Worker ? new Worker("AcousticExperience-tltWorker-CLIENT-servicesTemplate.js") : null,  // update URL as needed
				xhrLogging: true,  // for debugging: provides confirmation of receipt by endpoint. Example: [RequestBody] ��,"log":{"xhr":[{"xhrReqStart":111,"serialNumber":1}]},"messageVersion":"11.0.0.0"}

				queues: [
					{
						qid: "DEFAULT",
						endpoint: globalEndpoint,
						maxEvents: 15, // 15 events in queue triggers post
						timerInterval: 60000, // 60 seconds of user inactivity triggers post
						maxSize: 300000, // 300KB uncompressed queue size triggers post
						checkEndpoint: true,
						endpointCheckTimeout: 3000, // new with 5.6.0: If the endpoint check fails, UIC now switches to an asynchronous request on page unload.
						encoder: "gzip"
					}
				]
			},
            message: {
				// https://developer.goacoustic.com/acoustic-exp-analytics/docs/privacy-masking-and-blocking-sensitive-data
                privacy: [{
//					exclude: true,  // switch to whitelist instead of default blacklist
					targets: [  // blacklist if exclude:false
						".tlPrivate", //-------------------------------------------------- Mask input by CLASS=tlPrivate
						"input[name=samplename]", //-------------------------------------- Mask input by name
						"input[name^=account_]", //--------------------------------------- Mask input by name beginning with account_
						{ id : "sampleid", idType : -1 }, //------------------------------ Mask input by ID
						{ id : { regex: "security[0-9]|answer[0-9]" }, idType : -1 }, //-- Mask input by ID using RegEx
						{ id : { regex: "account_.*" }, idType : -1 }, //----------------- Mask input by ID beginning with account_ using RegEx
						{ id : "[\"dwfrm_singleshipping_shippingAddress\"]", "idType": -2 }, // Mask by Xpath, get Xpath from replay raw data view
						{ id: "privacy=yes", idType: -3 } //------------------------------ Mask elements by a specified custom attribute
					],
						"maskType": 3  // mask with matching data type & case (a4ghRW = x9xxXX)
					},{
					targets: [
						"input[type=password]" //----- Mask all password fields
						],
						"maskType": 2  // mask with fixed value "XXXXX"
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
					encode: "window.pako.gzip",
					defaultEncoding: "gzip"
				}
			},
            domCapture: {
                diffEnabled: true,
                // DOM Capture options
                options: {
                    maxMutations: 1000,			// If this threshold is met or exceeded, a full DOM is captured instead of a diff.
                    maxLength: 4000000,			// If this threshold is exceeded, the snapshot will not be sent
                    captureFrames: false,		// Should child frames/iframes be captured (ONLY IF NECESSARY)
					captureShadowDOM: false,	// new for 5.7.0: adds support for capturing Shadow DOM content.
                    removeScripts: true,		// Should script tags be removed from the captured snapshot (YES!)
                    removeComments: true,		// Should comments be removed from the captured snapshot (YES!)
					captureStyle: false			// Set this to false to remove interior style so as to reduce the size of the DOM capture message.
//					discardBase64: 20000		// 0 discards everything. Non-zero value discards image if img src length exceeds the value.
				}
            },
			browser: {
				useCapture: true,
				// When a click occurs on a descendant of a link element the UIC will retarget the click to the parent link element. 
				// To preserve the original target set the normalizeTargetToParentLink property to false in the Browser service configuration.
				normalizeTargetToParentLink: true,          
                sizzleObject: "window.Sizzle",
                jQueryObject: "window.jQuery",
				blacklist: [ "duplicateid", {regex: "/password|pass|pin|tan/", flags: "gi"} ],
				customid:["data-label2","myAttribute2"]	// one or more optional attributes to identify events when id= is missing. These can be any standard attribute like name= or any custom attribute.
			}
		},
		modules: {
            performance: {
			// https://developer.goacoustic.com/acoustic-exp-analytics/docs/ui-capture-reference#section-performance
                calculateRenderTime: true,
                renderTimeThreshold: 600000,
				// https://developer.goacoustic.com/acoustic-exp-analytics/docs/ui-capture-reference#section-performance-alert
				performanceAlert: {
					/* required
					 * boolean
					 */
					enabled: true,
					/* required
					 * measured in ms
					 * capture the data if resources loading time exceeds threshold
					 */
					threshold: 3000,
					/* optional
					 * array of strings
					 * specify the resource type to monitor, monitor all resources by default
					 * possible values are "script", "link", "img", "xmlhttprequest", "iframe", etc
					 */
					resourceTypes: ["script", "img", "css", "xmlhttprequest"],  // 
					/* optional
					 * array of a string or regex object
					 * used to blacklist certain resources by matching the resource name (url)
					 */
					blacklist: [".tiff", ".jpg", "twitter.com", "bam.nr", "google", {regex: "collectorPost"}, {regex: "tealeaf"}, {regex: "switch"}]
				}
            },
			replay: {
				// Geolocation configuration for use with optional tealeaf.gestures.js (not included in this template)
				geolocation: {
					enabled: false,
					triggers: [{
							event: "load"
					}]
				},
				// DOM Capture configuration
				domCapture: {
					enabled: true,
 					screenviewBlacklist: [  // new with 5.6.0. Blocks domCapture only (will not appear in Replay view, but events will appear in other views)
// support for blacklisting DOM Capture based on screenview name. 
// Use the screenviewBlacklist property in the DOM Capture configuration to prevent the UIC from taking DOM snapshots for the specified screenviews.
						{regex: "#Screen[A,C]"}
					],
					triggers: [
						{event: "click"},
						{event: "dblclick" },
						{event: "contextmenu" }, 
						{event: "change"},
						{event: "user_left_page" },
//						{event: "load",	fullDOMCapture: true, delay: 100}
						{event: "load", 
							fullDOMCapture: true, 
							delay: 100  // overrides delayUntil, if both set on same page. Also see screenviewLoadEvent configuration above.
// new with 5.7.0: https://developer.goacoustic.com/acoustic-exp-analytics/docs/configuring-uic-for-lazy-load
// delayUntil notes:  
// 1) cannot be used in combination with delay on same page; 
// 2) will prevent default load event on pages where #selector doesn't exist.
//							delayUntil: {  
//								selector: "#testspinner",  // HTML example: <img src="loading.png" id="testspinner"/>
//								exists: false,
//								timeout: 6000  // new for v6.0: capture snapshot after X ms in case selector does not exist
//							}
						}
					],
				},
                mousemove: {  // new with 5.6.0: only included with unload event. Not available for onprem 9.0.2 (targeting v10.2).
					enabled: true,
					sampleRate: 200,
					ignoreRadius: 3
				}
			},
			overstat: {
                hoverThreshold: 3000
            },
			ajaxListener: {
				// readme: https://github.com/acoustic-analytics/UICaptureSDK-Modules/blob/master/AjaxListener/README.md
				// The same filtering configuration is applicable to both XHR and Fetch data capture.
				filters: [
					{  // suggested base standard: only log 4xx and 5xx messages (Headers and Data)
//						url: { regex: "^((?!(brilliantcollector\\.com|TealeafTarget\\.jsp)).)*$", flags: "i" }, // exclude tealeaf requests
						status: { regex: "4\\d\\d|5\\d\\d", flags: "" }, // log 4xx and 5xx status messages
						log: {requestHeaders: true,
							requestData: true,
							responseHeaders: true,
							responseData: true
						}
					}
//					{  // example of URL filter
//						url: { regex: "somedocument\.jsp", flags: "i" } // for this URL, log existence but no Headers or Data
//					}
				]
			},
            gestures: {
                options: {
                    doubleTapInterval: 300
                }
            },
			TLCookie: {
                appCookieWhitelist: [{ regex: ".*" }],
                enabled: "true",
//				secureTLTSID: true,  // new with 5.6.0. For use only in web sites that are 100% https.
//				sessionIDUsesStorage: true, // Use local storage for TLTSID
//				sessionIDUsesCookie: true, // Fall back to cookie if local storage fails
                tlAppKey: globalAppKey,  // "2508cb55cf0a4b94be3d2679275b1c61",  // us collector 'Tealeaf' / 'WBird Test'
                sessionizationCookieName: "TLTSID"
			}
		}
	}

	//----------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------- Automatic tlAppKey using document.URL
	//----------------------------------------------------------------------------------------------------------
	if ((window.location.hostname === "www.site1.com")  // send data to prod appkeys
		|| (window.location.hostname === "www.site2.com")
		|| (window.location.hostname === "site2.com")) {
		if (window.location.hostname === "www.site1.com") {  
			config.modules.TLCookie.tlAppKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // appkey1
		} else if ((window.location.hostname === "www.site2.com")
			|| (window.location.hostname === "site2.com")) { 
			config.modules.TLCookie.tlAppKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // appkey2
		}
	} else {   // send data to test appkeys or unknown-sites appkeys
		if ((window.location.hostname.indexOf("test.site1.com") > -1) 
			|| (window.location.hostname === "test.site2.com"))  {  
			config.modules.TLCookie.tlAppKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // test appkey 1
		} else if (window.location.hostname.indexOf("site2test.com") > -1)  {  
			config.modules.TLCookie.tlAppKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // test appkey 2
		} else { // other unexpected domains (test or production)
			config.modules.TLCookie.tlAppKey = "2508cb55cf0a4b94be3d2679275b1c61"  // us collector 'Tealeaf' / 'WBird Test'
		}
	}

	//----------------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------- Alternate DOM Capture Config by URL
	//----------------------------------------------------------------------------------------------------------
//	var captureURL = window.location.pathname;
//	if (captureURL === "/sample-confirmation-page1" ||
//		captureURL === "/sample-confirmation-page2") {
//		config.modules.replay.domCapture.triggers = [
//			{ event: "click" },
//			{ event: "dblclick" },
//			{ event: "contextmenu" }, 
//			{ event: "change" },
//			{ event: "user_left_page" }, 
//			{ event: "load", delay: 100, fullDOMCapture: true },
//			{ event: "unload" } // Add DOM trigger to UNLOAD event on confirmation pages
//		];
//	}
// new with 5.7.0: delayUntil:  https://developer.goacoustic.com/acoustic-exp-analytics/docs/configuring-uic-for-lazy-load
//	if (captureURL === "/page-with-ajax-loaded-content-1" ||
//		captureURL === "/page-with-ajax-loaded-content-2") {
//	    config.modules.replay.domCapture.triggers = [
//			{ event: "click"},
//			{ event: "dblclick" },
//			{ event: "contextmenu" }, 
//			{ event: "change"},
//			{ event: "user_left_page" }, 
//			{ event: "load", fullDOMCapture: true, delayUntil: {selector: "#testspinner", exists: false }
//		];
//	}
// delayUntil example for click on specific anchor in a specfic URL
//	if (captureURL === "/shippinginfopage") {
//		config.modules.replay.domCapture.triggers = [
//			{ event: "click", targets: [{"id": {"regex": ".*dwfrm_billing_billingAddress.*", "flags": "i"}, "idType": "-2"} ], delayUntil: { selector: ".place-order-button", exists: true}},
//			{ event: "click"},
//			{ event: "dblclick" },
//			{ event: "contextmenu" }, 
//			{ event: "change"},
//			{ event: "user_left_page" }, 
//			{ event: "load", delay: 100, fullDOMCapture: true}
// push additional/new privacy pattern for a specific URL (cc# example)
//	if (window.location.href.indexOf("/path123/") > -1) {
//		config.services.message.privacyPatterns.push(
//			{  // ADD masking of CC# attrolvalue="9999 9999 9999 9999" 
//				pattern : { regex: "\\d{4}\\s\\d{4}\\s\\d{4}\\s\\d{4}", flags: "gi"},
//				replacement : "9999 9999 9999 9999"
//			}
//		);
//	}
	//----------------------------------------------------------------------------------------------------------
	//------------------------------------------------------------------ Enable Synchronous XHR on Unload by URL
	//----------------------------------------------------------------------------------------------------------
//	var captureURL = window.location.pathname;
//	if (captureURL.indexOf("/sampleURL1") > -1 || // Insert list of confirmation and other important pages
//		captureURL.indexOf("/sampleURL2") > -1 ||
//		captureURL === "/sampleURL3" ||
//		captureURL === "/sampleURL4") {
//		config.services.queue.asyncReqOnUnload = false,
//		config.services.queue.useBeacon = false,
//		config.services.queue.useFetch = false
//	}
    //------------------------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------- Alternate IE Configs
    //------------------------------------------------------------------------------------------------------
	if (document.documentMode === 9) { //----------------------- Alternate config for IE9 (No Diff/GZIP Support)
		config.services.queue.fetch = false;
		config.services.queue.beacon = false;
		config.services.queue.tltWorker = false;
		config.modules.replay.domCapture.enabled = false;
		config.core.modules.ajaxListener.enabled = false;
		config.services.domCapture.diffEnabled = false;
	}
	if (document.documentMode === 10) { //-------------------------- Alternate config for IE10 (No Diff Support)
		config.services.queue.fetch = false;
		config.services.queue.beacon = false;
		config.services.queue.tltWorker = false;
		config.services.domCapture.diffEnabled = false;
		config.core.modules.ajaxListener.fetchEnabled = false;
		config.modules.replay.domCapture.triggers = [
			{ event: 'click', targets: ['a', 'a *', 'button', 'button *'] },
			{ event: "change" },
			{ event: "load", delay: 500 }
		];
	}
	if (document.documentMode === 11) { //-------------------------------------------- Alternate config for IE11
		config.services.queue.fetch = false;
		config.services.queue.beacon = false;
		config.services.queue.tltWorker = false;
		config.services.message.privacyPatterns = [];
	}
	// ---------------------------------------------------------------------------------------------------------
	// ------------------------------------------------------ Alternate Chrome & Safari (webkit browser) Configs
	// ---------------------------------------------------------------------------------------------------------
	if (isWebkit) {
		config.services.queue.asyncReqOnUnload = true; // disable sync posting as chrome & Safari blocks it now
	}
    //----------------------------------------------------------------------------------------------------------
    //-------------------------------------------------- Disable Beacon & tune Queue settings for Mobile Devices
    //----------------------------------------------------------------------------------------------------------
    if (TLT.utils.isiOS || TLT.utils.isAndroid) {
        config.services.queue.queues = [{
                qid: "DEFAULT",
				endpoint: globalEndpoint,
                maxEvents: 10,
                maxSize: 100000,
                timerinterval: 10000,
                checkEndpoint: true,
                endPointCheckTimeout: 10000,
                encoder: "gzip"
            }
        ]
    };

    if (typeof window.TLT !== "undefined" && typeof window.TLT.isInitialized === "function" && !(TLT.isInitialized()) && typeof config === "object" && disableSDK === false) {
        window.TLT.init(config);
    }

	if (typeof window.TLT.registerBridgeCallbacks === "function") {
		TLT.registerBridgeCallbacks([{
			enabled: true,
			cbType: "messageRedirect",
			cbFunction: function (msg, msgObj) {
				//----------------------------------------- Modify Performance message to support custom Description in Replay
				if (msg && msgObj.type === 17) {
					var cEvent = {};
					cEvent = { name: "perfData", data:{ description:"Perf data: " + msgObj.resourceData.urlNormalized }};
					msgObj.customEvent = cEvent;
					msgObj.type = '5';
				}  
				return msgObj;
			}
		}]);
	}
}());