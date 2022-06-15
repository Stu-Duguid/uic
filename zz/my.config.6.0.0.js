// tealeaf v6.0.0 - Sep 16, 2020

// tealeaf config
/**
 * Copyright (c) 2020 Acoustic, L.P. All rights reserved.
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
      blockedUserAgents: [
        // { regex: "(Google|Bing|Face|DuckDuck|Yandex|Exa)bot", flags: "i" },
        // { regex: "spider", flags: "i" },
        // { regex: "archiver", flags: "i" },
        // "PhantomJS"
      ],
      // ieExcludedLinks: ["a[href^=javascript]", "a.ignore"],
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
        ajaxListener: {
            enabled: true,
            events: [
              { name: "load", target: window },
              { name: "unload", target: window }
            ]
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
        asyncReqOnUnload: /Chrome/.test(navigator.userAgent) && /Google/.test(navigator.vendor),
        useBeacon: true,
        queues: [{
          qid: "DEFAULT",
          endpoint: "https://lib-ap-1.brilliantcollector.com/collector/collectorPost",
          // endpoint: "https://teabooster-eu.acoustic-demo.com/collector/sduguid/sydney/collectorPost",
          maxEvents: 50,
          timerInterval: 30000,
          maxSize: 300000,
          checkEndpoint: false,
          endpointCheckTimeout: 3000,
          encoder: "gzip"
        }]
      },
      message: {
        privacy: [
          {
            targets: [ "input[type=password]" ],
            "maskType": 2
          },
          {
            targets: [
              "#number", "#expiry", "#cvv", // credit cards
              { id: { regex: "(card|credit)", flags: "g" }, idType: -1 } // anything with card or credit in id
            ],
            maskType: 3
          },
          // anything email or input with email in id
          {
            targets: [ "input[type=email]", "input[id*=email]" ],
            maskType: 4, // mask the username and the initial domain name part
            maskFunction: function(value) { return value.replace(/^[^@]+(@|$)/, "#user$1").replace(/@[^\.]+/, "@#domain"); }
          },
          {
            targets: [ "input[id*=phone]", "input[name*=phone]" ], // inputs with phone in id or name
            maskType: 4,
            maskFunction: function (value) { // replace all digits with X except last 3
              return value.slice(0,-3).replace(/[0-9]/g, "X") + value.slice(-3);
            }
          }
        ],
        privacyPatterns: [
          // replace content inside tag with class pii-x with an X for each character
          {
            pattern: { regex: /(class=".*?pii-x.*?>)(.*?)</, flags: "g" },
            replacement: function(match, p1, p2) { return p1+p2.replace(/./g, 'X')+"<"; }
          },
          // replace content inside tag with class pii-f with a fixed message
          {
            pattern: { regex: /(class=".*?pii-f.*?>)(.*?)</, flags: "g" },
            replacement: function(match, p1, p2) { return p1+"#pii"+"<"; }
          },
          // to remove suggested addresses in drop down - matches complete list and replaces items
          {
            pattern: { regex: /Select your address from the results below.*?Can't find a match/, flags: "g" },
            replacement: function (fullMatch) {
              return fullMatch.replace(/<li>.*?</g, "<li>(address masked)<");
            }
          },
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
          captureFrames: false
          // captureShadowDOM: false,
          // captureStyle: true,
          // discardBase64: 20000,
          // removeScripts: true
        }
      },
      browser: {
        // normalizeTargetToParentLink: true,
        sizzleObject: "window.Sizzle",
        jQueryObject: "window.jQuery",
        // blacklist: [ "duplicateid", {regex: /snerklex/, flags: "gi"} ],
        // customid: [ "mycustomid" ]
      }
    },
    modules: {
      overstat: {
        hoverThreshold: 1000
      },
      performance: {
        calculateRenderTime: true,
        renderTimeThreshold: 600000,
        performanceAlert: {
          enabled: true,
          threshold: 1000,
          maxAlerts: 40,
          resourceTypes: ["script", "img", "xmlhttprequest", "fetch"],
          // blacklist: [/google-analytics/]
        }
      },
      replay: {
        domCapture: {
          enabled: true,
          // screenviewBlacklist:[ "/some/url", { regex: "somerRegEx", flags: "someFlag" } ],
          triggers: [
            { event: "load" },
            // { event: "load", fullDOMCapture: true, delay: 100 }
            // { event: "load", delayUntil: { selector: "html.async-hide", exists: false, timeout: 3000 }}
            { event: "click" },
            //{ event: "click", targets: ["a", "a *", "button", "button *"] },
            { event: "change" },
            { event: "visibilitychange" },
            // { event: "unload" } // usually not for production
          ]
        },
        mousemove: { enabled: true, sampleRate: 200, ignoreRadius: 3 }
      },
      gestures: { enabled: false, options: { doubleTapInterval: 300 } },
      TLCookie: {
        appCookieWhitelist: [{ regex: ".*" }],
        // secureTLTSID: true,
        // sessionIDUsesStorage, sessionIDUsesCookie
        tlAppKey: "2b5f323f11804851beb8617eee293042" // syd [austeampilots]:[stu demos]
      },
      ajaxListener: {
        filters: [
          {
            url: { regex: '^((?!(collectorPost|doubleclick|google)).)*$', flags: 'i' }, // log everything EXCEPT tealeaf calls
            //method: { }, //regex: "GET", flags: "i" },
            //url: { }, //regex: "api", flags: "i" },
            //status: { }, //regex: "4\\d\\d", flags: "" },
            log: {
              requestHeaders: true,
              requestData: true,
              responseHeaders: true,
              responseData: true
            }
          }
        ]
      }
    }
  };

  function afterInit() {
    if (TLT.getState() === "destroyed") {
      return;
    }
    if (("digitalData" in window) && (window.digitalData !== null)) {
      TLT.logCustomEvent("digitalData", {
        description: "digitalData",
        value: window.digitalData
      });
    }
    if (("dataLayer" in window) && (window.dataLayer !== null)) {
      TLT.logCustomEvent("dataLayer", {
        description: "dataLayer",
        value: window.dataLayer
      });
    }
    if (("optimizely" in window) && (window.optimizely !== null)) {
      var optim = window.optimizely.get('state').getCampaignStates({ isActive: true });
      var campaignId, campaignData;
      for (campaignId in optim) {
        campaignData = window.optimizely.get("state").getDecisionObject({ campaignId: campaignId });
        TLT.logCustomEvent("optimizely", { description: "Optimizely", value: campaignData });
      }
    }
    // add callback to alter messages (sample)
    TLT.registerBridgeCallbacks([{
      enabled: false,
      cbType: "messageRedirect",
      cbFunction: function(msg, msgObj) {
        if (msgObj) {
          if (!msgObj.screenviewDone) {
            msgObj.screenviewDone = true; // to prevent endless loop
            // add code here
            // remember to enable
          }
        }
        return msgObj;
      }
    }]);
  }

  var runTealeaf = true;
  var captureURL = window.location.pathname;
  var captureHost = window.location.hostname;

  // to not run on these pages
  if ((captureURL === "/page/to/not/capture") || (captureURL.indexOf("otherbitinpagename") > -1)) {
    runTealeaf = false;
  }

  // to change settings on these pages
  if ((captureURL === "/page/to/alter") || (captureURL.indexOf("otherbitinalterpagename") > -1)) {
    config.core.screenviewAutoDetect = false;
  }

  // to run content filters only on particular pages
  if (captureURL === "/some-page/to/filter") {
    config.services.message.privacyPatterns.push({
      pattern: { regex: "sample", flags: "g" },
      replacement: "[ $1 ] was matched"
    })
  }

  var uaMatch = /(?:iPhone|iPad|iPod).+? OS (\d+)_(\d+)/.exec(navigator.userAgent);
  if (uaMatch && uaMatch[1] + "." + uaMatch[2] < 13.0) {
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
