// tealeaf v6.1.0 - Mar 24, 2021

// tealeaf config
/**
 * Copyright (c) 2021 Acoustic, L.P. All rights reserved.
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
      // This version of the UIC does not support Internet Explorer 8 or below - for IE 8 use UIC 5.2.0
      TLT.terminationReason = "Unsupported browser";
      return;
  }

  var config = {
    core: {
      buildNote: "stu-default 2021.03",
      blockedElements: [],
      // blockedUserAgents: [
        // { regex: "(Google|Bing|Face|DuckDuck|Yandex|Exa)bot", flags: "i" },
        // { regex: "spider", flags: "i" },
        // { regex: "archiver", flags: "i" },
        // "PhantomJS"
      // ],
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
        dataLayer: {
          enabled: true,
          events: [
            { name: "load", target: window },
            { name: "unload", target: window }
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
        urlFunction: function (urlOrPath) { // (urlOrPath, messageType)
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
        asyncReqOnUnload: /WebKit/i.test(navigator.userAgent),
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
          // encoder: "gzip" // enable for prod
        }]
      },
      message: {
        privacy: [
          {
            targets: [ "input[type=password]" ],
            maskType: 2
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
            maskFunction: function(value) { return value.replace(/^[^@]+(@|$)/, "#user$1").replace(/@[^.]+/, "@#domain"); }
          },
          {
            targets: [ "input[id*=phone]", "input[name*=phone]" ], // inputs with phone in id or name
            maskType: 4,
            maskFunction: function (value) { // replace all digits with X except last 3
              return value.slice(0,-3).replace(/[0-9]/g, "X") + value.slice(-3);
            }
          },
          {
            exclude: true,
            targets: [
              // every hidden field and radio and checkbox and others
              "input[type=hidden]", "input[type=radio]", "input[type=checkbox]", "input[type=submit]", "input[type=button]", "input[type=search]",
              // already mentioned so avoid twice masking
              "input[type=password]",
              "#number", "#expiry", "#cvv",
              "input[type=email]", "input[id*=email]",
              "input[id*=phone]", "input[name*=phone]",
            ], // inputs with phone in id or name
            maskType: 3
          }
        ],
        privacyPatterns: [
          // can use replacement: "$1"
          //
          // replace content inside tag with class pii-x with an X for each character
          // {
          //   pattern: { regex: /(class=".*?pii-x.*?>)(.*?)</, flags: "g" },
          //   replacement: function(match, p1, p2) { return p1+p2.replace(/./g, 'X')+"<"; }
          // },
          // replace content inside tag with class pii-f with a fixed message
          // {
          //   pattern: { regex: /(class=".*?pii-f.*?>)(.*?)</, flags: "g" },
          //   replacement: function(match, p1, p2) { return p1+"#pii"+"<"; }
          // },
          {
            // replace any innnerText inside pii tag or child tags with an X for each character
            pattern: { regex: /<([a-z]+) [^>]*?pii-mask[^>]*>(.|\n)*?<\/\1>/, flags: "g" },
            replacement: function(match) {
              function swapX(s) { return s.replace(/[^<>\s]/g, 'X'); }
              return match.replace(/>[^<]+</g, swapX);
            }
          },
          // data-piiexclude matching for spans
          // {
          //   pattern: { regex: /(<span [^>]*?data-piix[^>]*?>)([^\0]*?)(<\/span>)/, flags: "g" },
          //   replacement: function(match, p1, p2, p3) { return p1+p2.replace(/./g, 'X')+p3; }
          // },
          // data-piiexclude class matching for paragraphs
          // {
          //   pattern: { regex: /(<p [^>]*?data-piix[^>]*?>)([^\0]*?)(<\/p>)/, flags: "g" },
          //   replacement: function(match, p1, p2, p3) { return p1+p2.replace(/./g, 'X')+p3; }
          // },
          // data-piiexclude class matching for divs
          // {
          //   pattern: { regex: /(<div [^>]*?data-piix[^>]*?>)([^\0]*?)(<\/div>)/, flags: "g" },
          //   replacement: function(match, p1, p2, p3) { return p1+p2.replace(/./g, 'X')+p3; }
          // }
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
          // maxMutations: 100,
          // maxLength: 2000000,
          // captureFrames: false
          // captureShadowDOM: false,
          // captureStyle: true,
          // discardBase64: 20000,
          // removeScripts: true
        }
      },
      browser: {
        normalizeTargetToParentLink: true,
        // blacklist: [ "duplicateid", {regex: /snerklex/, flags: "gi"} ],
        customid: [ "tlf" ]
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
            { event: "click", targets: ["button#btnSubmit"], delay: 500 },
            { event: "click" },
            //{ event: "click", targets: ["a", "a *", "button", "button *"] },
            { event: "change" },
            { event: "visibilitychange" },
            { event: "unload" } // usually not for production
          ]
        },
        mousemove: { enabled: true, sampleRate: 200, ignoreRadius: 3 }
      },
      gestures: { enabled: false, options: { doubleTapInterval: 300 } },
      dataLayer: {
        dataObject: "window.dataLayer",
        // screenviewBlocklist: [ "#info", { regex: "^#search", flags: "i" } ],
        // propertyBlocklist: [ "currency", { regex: "_code$" } ]
      },
      TLCookie: {
        appCookieWhitelist: [{ regex: ".*" }],
        // secureTLTSID: true, // default is false
        // samesite: "None", // default is Strict
        // sessionIDUsesStorage, sessionIDUsesCookie
        // sessionizationCookieName for using other cookie instead of TLTSID
        tlAppKey: "2b5f323f11804851beb8617eee293042" // syd [austeampilots]:[stu demos]
        // use test appkey here as code at the bottom looks for prod domain and adds prod appkey
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
    
    function gtagtl() {window.dataLayer.push(arguments)}

    if (window.google_optimize) {
      console.debug("optimize: found");
      gtagtl('event', 'optimize.callback', {callback: optimizeLogTL});
    } else {
      console.debug("optimize: not found");
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
      cbFunction: function (_msg, msgObj) {
        if (msgObj) {
          if (!msgObj.screenviewDone) {
            msgObj.screenviewDone = true; // to prevent endless loop
            // to remove innertext on anchor targets
            if (msgObj.type === 4 && msgObj.target.type === "a" && msgObj.target.currState && msgObj.target.currState.innerText) {
              msgObj.target.currState.innerText = msgObj.target.currState.innerText.replace(/[^<>\s]/g, 'X');
            }
          }
        }
        return msgObj;
      }
    } ]);
    
    // decorate outgoing links -----------
    var destDomain = "www.seconddomain.com";
    var sessionCookieName = 'TLTSID';

    // check if in dest domain so needed
    if (location.hostname.indexOf(destDomain) === -1) {
      // get TLTSID cookie
      var sessionCookieValue = TLT.utils.getCookieValue(sessionCookieName);
      
      if (sessionCookieValue === null) {
        console.debug("addCookieToLinks: no cookie");
        return;
      }
      // add TLTSID to outgoing links in the domain service.securequote
      function addCookieToLink(e) {
        e.target.search = e.target.search + "&" + sessionCookieName + "=" + sessionCookieValue;
      }
      var outAnchors = document.querySelectorAll("a[href*='" + destDomain + "']");
      for (var i = 0; i < outAnchors.length; i++) {
        outAnchors[ i ].addEventListener('click', addCookieToLink);
      }
    }
  }

  // if TLTSID in query string, use as cookie
  var sessionCookieName = config.modules.TLCookie.sessionizationCookieName;
  var secureTLTSID = config.modules.TLCookie.secureTLTSID;
  var qsCookieValue = TLT.utils.getQueryStringValue(sessionCookieName);

  if (qsCookieValue) {
    console.debug("addCookieToLinks: set from query");
    TLT.utils.setCookie(sessionCookieName, qsCookieValue, undefined, undefined, undefined, secureTLTSID);
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
  }

  if (captureHost === "www.prod.com" || captureHost === "other.prod.com") {
    config.modules.TLCookie.tlAppKey = "xxx"; // production
  }

  // initialize Tealeaf
  if (runTealeaf) {
    TLT.init(config, afterInit);
  }
}());

// google optimize tealeaf integration -----------

function optimizeLogTL(val, name) {
  console.debug("optimize: ["+name+", "+val+"]");
  window.TLT.logCustomEvent("optimize", { description: "Optimize", experiment: name, variant: val });
}