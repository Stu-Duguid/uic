// Default configuration 
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

//------------Digital Data (QueryString, JS Exceptions, etc --------------//
TLT.addModule("digitalData", function (context) {
  var config = {},
    qKeys = {},
    q,
    svChange = false,
    utils = context.utils;

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

  function dispatchEvent() {
    try {
      var e = new Event('vis_change_left');
    } catch (err) {
      try {
        var e = new CustomEvent('vis_change_left');
      } catch (err) {}
    }
    var s = document.getElementsByTagName("script")[0];
    var sv = "DOM-Capture";
    var myNode = document.createElement("input");
    myNode.setAttribute("type", "button");
    myNode.setAttribute("id", sv);
    myNode.setAttribute("hidden", "true");
    s.parentNode.appendChild(myNode, s);
    document.getElementById(sv).dispatchEvent(e);
    s.parentNode.removeChild(myNode);
  }

  function customEvent(description, action, value) {
    var jsonMsg = {
      type: 5,
      fromWeb: true,
      customEvent: {
        data: {
          description: description,
          action: action,
          value: value
        }
      }
    };
    context.post(jsonMsg);
  }

  //----------------- Initialize Tealeaf Digital Data Objects -----//
  return {
    init: function () {
      config = context.getConfig();
    },
    destroy: function () {
      config = null;
    },
    onevent: function (webEvent) {
      if (typeof webEvent !== "object" || !webEvent.type) {
        return;
      } // Sanity check
      if (webEvent) {
        switch (webEvent.type) {
          case "load":
            try {
              customEvent("Referrer", "Retrieve", document.referrer);
              TLT.flushAll();
            } catch (e) {
              customEvent("Referrer", "Referrer Logging Error", e);
            }
            break;
          default:
            TLT.flushAll();
            break;
        }
      }
    }
  }
});