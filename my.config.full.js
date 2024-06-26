// stu config for tealeaf

// @ts-check

(function () {
	"use strict";
	var TLT = window.TLT;

	if (TLT.utils.isLegacyIE) {
		// This version of the UIC does not support Internet Explorer 8 or below - for IE 8 use UIC 5.2.0
		TLT.terminationReason = "Unsupported browser";
		return;
	}

	var config = {
		core: {
			buildNote: "stu 2023.03",
			// blockedElements: [], // default []
			// blockedUserAgents: [
			// { regex: "(Google|Bing|Face|DuckDuck|Yandex|Exa)bot", flags: "i" },
			// { regex: "spider", flags: "i" },
			// { regex: "archiver", flags: "i" },
			// "PhantomJS"
			// ],
			// ieExcludedLinks: ["a[href^=javascript]", "a.ignore"],
			// inactivityTimeout: 0,
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
				TLCookie: {
					enabled: true
				},
				dataLayer: {
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
				dataListener: {
					enabled: true,
					events: [
						{ name: "change", attachToShadows: true, recurseFrames: true },
						{ name: "click", recurseFrames: true },
						{ name: "hashchange", target: window },
						{ name: "load", target: window },
						{ name: "unload", target: window },
						{ name: "error", target: window },
						{ name: "visibilitychange" }
					]
				},
				flushQueue: {
					events: [
						{ name: "visibilitychange" }
					]
				},
				frictionSigns: {
					enabled: true,
					events: [
						{ name: "change", attachToShadows: true, recurseFrames: true },
						{ name: "click", recurseFrames: true },
						{ name: "unload", target: window },
						{ name: "scroll", target: window },
						{ name: "mousemove", recurseFrames: true },
						{ name: "orientationchange", target: window },
						{ name: "error", target: window },
					]
				},
				// hiddenStyles: {
					// enabled: true
				// },
			},
			// normalization: { urlFunction: function (urlOrPath, messageType) { return urlOrPath; }
			// sessionDataEnabled: false, // defaults as false and data defaults as empty
			// sessionData: { sessionValueNeedsHashing: true, sessionQueryName: "sessionID", sessionQueryDelim: ";", sessionCookieName: "jsessionid" },
			// screenviewAutoDetect: true, // default true
			// framesBlacklist: [ "#iframe1" ] // default []
		},
		services: {
			queue: {
				// tltWorker: null, // default not used
				asyncReqOnUnload: true,  // /WebKit/i.test(navigator.userAgent),
				xhrLogging: false, // default true
				// useBeacon: true, // default true
				// useFetch: true, // default true
				queues: [{
					qid: "DEFAULT",
					endpoint: "https://lib-ap-1.brilliantcollector.com/collector/collectorPost",
					// endpoint: "https://teabooster-eu.acoustic-demo.com/collector/sduguid/sydney/collectorPost",
					maxEvents: 10,
					timerInterval: 10000, // default 0
					maxSize: 100000, // default 0
					checkEndpoint: false,
					// endpointCheckTimeout: 3000, // default 3000
					encoder: "gzip" // enable for prod
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
						exclude: true,
						targets: [
							"input[type=hidden]", "input[type=radio]", "input[type=checkbox]", "input[type=submit]", "input[type=button]", "input[type=search]",
							// already mentioned so avoid twice masking
							"input[type=password]",
							"input[id*=phone]", "input[name*=phone]",
						],
						maskType: 4, // replace all alphas with X and digits with 9
						maskFunction: function (value) {
							return value.replace(/[A-Z]/g, "X").replace(/[a-z]/g, "x").replace(/[0-9]/g, "9");
						}
					},
					{
						targets: [
							".tlPrivate"
						],
						maskType: 4,
						maskFunction: function (value, element) {
							if (element && element.innerText) {
								element.innerText = element.innerText.replace(/[A-Z]/g, 'X').replace(/[a-z]/g, "x").replace(/[0-9]/g, "9");
								// element.innerText = element.innerText.replace(/[A-Z]/g, 'X').replace(/[a-z]/g, "x").replace(/[0-9]/g, "9").replace(/(?=[^a-zA-Z])\p{Alphabetic}/gu, 'U');
							}
							return value;
						}
					}
				],
				privacyPatterns: [
					// {
					// 	pattern: { regex: /(<div id="xxx.*?)>.*?</, flags: "g" },
					// 	replacement: "$1>[masked]<"
					// }
				]
			},
			encoder: {
				gzip: {encode: "window.pako.gzip", defaultEncoding: "gzip"}
			},
			domCapture: {
				// diffEnabled: true, // default true
				options: {
					// maxMutations: 200, // default 100
					maxLength: 2000000, // default 1000000
					// captureFrames: true // default false
					// captureShadowDOM: true, // default false
					// captureStyle: false, // default true
					// discardBase64: 20000, // default true
					// removeScripts: false, // default true
					// removeComments: false, // default true
					captureDynamicStyles: true, // default false
					// captureHREFStyles: true, // default false
				}
			},
			browser: {
				// normalizeTargetToParentLink: true, // default true
				// blacklist: [ "duplicateid", {regex: /snerklex/, flags: "gi"} ],
				// customid: [ "tlf" ] // default []
			}
		},
		modules: {
			performance: {
				calculateRenderTime: true, // default false
				renderTimeThreshold: 600000,
				performanceAlert: {
					enabled: true, // default false
					threshold: 1000,
					maxAlerts: 40,
					resourceTypes: ["script", "img", "xmlhttprequest", "fetch"], // default []
					// blacklist: [/google-analytics/] // default []
				}
			},
			replay: {
				domCapture: {
					enabled: true,
					// screenviewBlacklist:[ "/some/url", { regex: "somerRegEx", flags: "someFlag" } ],
					triggers: [
						{ event: "load" },
						// { event: "load", fullDOMCapture: true, delay: 100 },
						// { event: "load", delayUntil: { selector: "html.async-hide", exists: false, timeout: 3000 } },
						// { event: "click", targets: ["button#btnSubmit"], delay: 500 },
						{ event: "click" },
						{ event: "change" },
						{ event: "visibilitychange" },
						{ event: "unload" } // usually not for production
					]
				},
				mousemove: { enabled: true, sampleRate: 200, ignoreRadius: 3 } // default {}
			},
			// gestures: { enabled: false, options: { doubleTapInterval: 300 } },
			dataLayer: {
				dataObject: "window.digitalData",
				// screenviewBlocklist: [ "#info", { regex: "^#search", flags: "i" } ],
				// propertyBlocklist: [ "currency", { regex: "_code$" } ]
			},
			TLCookie: {
				appCookieWhitelist: [{ regex: ".*" }],
				// secureTLTSID: true, // default is false
				// samesite: "None", // default is Strict
				// sessionIDUsesStorage, sessionIDUsesCookie
				// sessionizationCookieName for using other cookie instead of TLTSID
				tlAppKey: "set below"
			},
			ajaxListener: {
				urlBlocklist: [
					{ regex: "clarity", flags: "i" },
					{ regex: "collectorpost", flags: "i" },
					{ regex: "crazyegg", flags: "i" },
					{ regex: "doubleclick", flags: "i" },
					{ regex: "google", flags: "i" },
					{ regex: "yimg", flags: "i" },
				],
				filters: [
					{
						//method: { regex: "GET", flags: "i" },
						//url: { regex: "api", flags: "i" },
						//status: { regex: "4\\d\\d", flags: "" },
						log: { requestHeaders: true, requestData: true, responseHeaders: true, responseData: true }
					}
				]
			},
			dataListener: {
				dataObject: "dataLayer",
				dataBlocklist: ["gtm.js", "gtm.start", "gtm.load", "gtm.dom", "gtm.timer", "gtm.scrollDepth"]
			},
			frictionSigns: {
				rageclick: {
					enable: true, // clicks: 4, // distance: 20, // time: 800, // blocklist: []
				},
				deadclick: {
					enable: true, // time: 2000,
					blocklist: ['[["html",0],["body",0]]']
				},
				errorclick: {
					enable: true, // time: 200, // blocklist: []
				},
				excessscroll: {
					enable: true, // scale: 2.4, // blocklist: []
				},
				thrashing: {
					enable: true, // time: 3000, // blocklist: []
				}
			}
		}
	};

	function afterInit() {
		if (TLT.getState() === "destroyed") {return;}

		if (window.google_optimize) {
			window.TLT.logGOptimize = function (val, name) {
				window.TLT.logCustomEvent("abTest", {description: "Optimize", experiment: name, variant: val});
			}
			(function () {window.dataLayer.push(arguments)}('event', 'optimize.callback', {callback: window.TLT.logGOptimize}));
		}

		if (("optimizely" in window) && window.optimizely !== null && typeof window.optimizely.get === 'function') {
			var optim = window.optimizely.get('state').getCampaignStates({isActive: true});
			var campaignId, campaignData;
			for (campaignId in optim) {
				campaignData = window.optimizely.get("state").getDecisionObject({campaignId: campaignId});
				TLT.logCustomEvent("abTest", {description: "Optimizely", value: campaignData});
			}
		}
		
		if (("ABTasty" in window) && (window.ABTasty !== null)) {
			var abtests = window.ABTasty.getTestsOnPage();
			for (var abtest in abtests) {
				TLT.logCustomEvent("abTest", {description: "ABTasty", value: { experiment: abtests[abtest].name, experimentId: abtest, variant: abtests[abtest].variationName, variantId: abtests[abtest].variationID }});
			}
		}

		var expId = window._vis_opt_experiment_id;
		if (expId && expId !== 0 && window._vwo_exp && window._vwo_exp[expId]) {
			var expData = window._vwo_exp[expId];
			if (expData && expData.name && expData.combination_chosen && expData.comb_n) {
				window.TLT.logCustomEvent("abTest", {
					description: "VWO",
					experimentId: expId,
					experiment: expData.name,
					variantId: expData.combination_chosen,
					variant: expData.comb_n[expData.combination_chosen]
				});
			}
		}

		// add callback to alter messages (sample)
		// TLT.registerBridgeCallbacks([{
		// 	enabled: false,
		// 	cbType: "messageRedirect",
		// 	cbFunction: function (_msg, msgObj) {
		// 		if (msgObj) {
		// 			if (!msgObj.screenviewDone) {
		// 				msgObj.screenviewDone = true; // to prevent endless loop
		// 				// to remove innertext on anchor targets
		// 				if (msgObj.type === 4 && msgObj.target.type === "a" && msgObj.target.currState && msgObj.target.currState.innerText) {
		// 					msgObj.target.currState.innerText = msgObj.target.currState.innerText.replace(/[^<>\s]/g, 'X');
		// 				}
		// 			}
		// 		}
		// 		return msgObj;
		// 	}
		// }]);

		// session stitching --- outgoing links
		var destDomain = "www.seconddomain.com";
		var sessionCookieName = "TLTSID";

		if (location.hostname.indexOf(destDomain) === -1) {
			var sessionCookieValue = TLT.utils.getCookieValue(sessionCookieName);
			if (sessionCookieValue !== null) {
				var outAnchors = document.querySelectorAll("a[href*='" + destDomain + "']");
				for (var i = 0; i < outAnchors.length; i++) {
					outAnchors[i].search = outAnchors[i].search + "&" + sessionCookieName + "=" + sessionCookieValue;
				}
			}
		}
	}

	// session stitching --- incoming query string value
	var sessionCookieName = "TLTSID";
	var secureTLTSID = config.modules.TLCookie.secureTLTSID;
	var queryCookieValue = TLT.utils.getQueryStringValue(sessionCookieName);
	if (queryCookieValue) {
		TLT.utils.setCookie(sessionCookieName, queryCookieValue, undefined, undefined, undefined, secureTLTSID);
	}
	
	// turn off options for old IE
	if (document.documentMode) {
		config.services.queue.useFetch = false;
		config.services.queue.useBeacon = false;
		config.services.queue.useWorker = false;
		if (document.documentMode === 10) {
			config.services.domCapture.diffEnabled = false;
			config.modules.replay.domCapture.triggers.unshift({event: "click", targets: ['a', 'a *', 'button', 'button *']});
		} else if (document.documentMode === 9) {
			config.modules.replay.domCapture.enabled = false;
			config.services.domCapture.diffEnabled = false;
			config.modules.ajaxListener.enabled = false;
		}
	}
	
	// turn off beacon for old safari
	if (TLT.utils.isiOS) {
		var iOSVersion = / OS (\d+)_(\d+)/.exec(navigator.userAgent);
		// disable Beacon in iOS 12 and earlier due to Safari on iOS bug
		config.services.queue.useBeacon = iOSVersion && parseFloat(iOSVersion[1] + "." + iOSVersion[2]) >= 12.2;
	}

	if (window.location.hostname === "www.prod.com" || window.location.hostname === "other.prod.com") {
		config.modules.TLCookie.tlAppKey = "xxx"; // production
	} else {
		config.modules.TLCookie.tlAppKey = "2b5f323f11804851beb8617eee293042";
	}

	// initialize Tealeaf
	TLT.init(config, afterInit);
}());
