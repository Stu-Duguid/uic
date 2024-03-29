/*!
 * Copyright (c) 2021 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 * @version 6.1.0.1989
 * @flags w3c,NDEBUG
 */
if (window.TLT) {
  throw "Attempting to recreate TLT. Library may be included more than once on the page.";
}
window.TLT = (function () {
  var d,
    n,
    a,
    m,
    H,
    B,
    r,
    c,
    k,
    D,
    z,
    v = false,
    P;
  function q(R) {
    if (window.TLT && R.persisted) {
      TLT.terminationReason = "";
      TLT.init();
    }
  }
  function f(Y, R, S, Z) {
    var W = null,
      aa = null,
      U = TLT.getModule("replay"),
      X = TLT.getModule("TLCookie"),
      ab = TLT.getModule("performance"),
      T = null,
      V = P.getOriginAndPath();
    if (!R || typeof R !== "string") {
      return;
    }
    if (!S || typeof S !== "string") {
      S = "";
    }
    aa = {
      type: 2,
      screenview: {
        type: Y,
        name: R,
        originalUrl: V.path,
        url: TLT.normalizeUrl("", V.path, 2),
        host: V.origin,
        referrer: S,
        title: document.title,
        queryParams: V.queryParams,
      },
    };
    if (Y === "LOAD") {
      T = { type: "screenview_load", name: R };
    } else {
      if (Y === "UNLOAD") {
        T = { type: "screenview_unload", name: R };
      }
    }
    if (T && U) {
      W = U.onevent(T);
    }
    if (W) {
      aa.dcid = W;
    }
    if (Y === "LOAD" || Y === "UNLOAD") {
      B.post("", aa);
    }
    if (T && X) {
      X.onevent(T);
    }
    if (T && ab) {
      ab.onevent(T);
    }
    if (T && c) {
      c.onevent(T);
    }
  }
  var i = new Date().getTime(),
    y,
    G,
    I = {},
    u = {},
    o = {},
    l = false,
    Q = null,
    w = (function () {
      var R,
        T = [];
      function S(Y) {
        var V = k.framesBlacklist,
          X,
          W;
        R = R || [];
        Y = Y || null;
        if (typeof V !== "undefined" && V.length > 0) {
          for (W = 0; W < V.length; W += 1) {
            X = a.queryAll(V[W], Y);
            if (X && X.length > 0) {
              R = R.concat(X);
            }
          }
          T = T.concat(a.queryAll("iframe", Y));
        }
      }
      function U(V) {
        if (P.indexOf(T, V) < 0) {
          S(V.ownerDocument);
        }
        return P.indexOf(R, V) > -1;
      }
      U.clearCache = function () {
        R = null;
      };
      return U;
    })(),
    K = null,
    g = {
      config: [
        "getConfig",
        "updateConfig",
        "getCoreConfig",
        "updateCoreConfig",
        "getModuleConfig",
        "updateModuleConfig",
        "getServiceConfig",
        "updateServiceConfig",
      ],
      queue: ["post", "setAutoFlush", "flushAll"],
      browserBase: ["getXPathFromNode", "processDOMEvent"],
    },
    E = (function () {
      var R = {};
      return {
        normalizeModuleEvents: function (W, U, Y, T) {
          var S = R[W],
            X = false,
            V = false;
          Y = Y || t._getLocalTop();
          if (S) {
            return;
          }
          R[W] = { loadFired: false, pageHideFired: false };
          P.forEach(U, function (Z) {
            switch (Z.name) {
              case "load":
                X = true;
                U.push(P.mixin(P.mixin({}, Z), { name: "pageshow" }));
                break;
              case "unload":
                V = true;
                U.push(P.mixin(P.mixin({}, Z), { name: "pagehide" }));
                U.push(P.mixin(P.mixin({}, Z), { name: "beforeunload" }));
                break;
              case "change":
                if (P.isLegacyIE && t.getFlavor() === "w3c") {
                  U.push(P.mixin(P.mixin({}, Z), { name: "propertychange" }));
                }
                break;
            }
          });
          if (!X && !V) {
            delete R[W];
            return;
          }
          R[W].silentLoad = !X;
          R[W].silentUnload = !V;
          if (!X) {
            U.push({ name: "load", target: Y });
          }
          if (!V) {
            U.push({ name: "unload", target: Y });
          }
        },
        canPublish: function (S, U) {
          var T;
          if (R.hasOwnProperty(S) === false) {
            return true;
          }
          T = R[S];
          switch (U.type) {
            case "load":
              T.pageHideFired = false;
              T.loadFired = true;
              return !T.silentLoad;
            case "pageshow":
              T.pageHideFired = false;
              U.type = "load";
              return !T.loadFired && !T.silentLoad;
            case "pagehide":
              U.type = "unload";
              T.loadFired = false;
              T.pageHideFired = true;
              return !T.silentUnload;
            case "unload":
            case "beforeunload":
              U.type = "unload";
              T.loadFired = false;
              return !T.pageHideFired && !T.silentUnload;
          }
          return true;
        },
        isUnload: function (S) {
          return typeof S === "object"
            ? S.type === "unload" ||
                S.type === "beforeunload" ||
                S.type === "pagehide"
            : false;
        },
      };
    })(),
    O = {},
    s = {},
    b = {},
    F = [],
    L = function () {},
    j = null,
    A = true,
    p = function () {},
    x = false,
    M = (function () {
      var R = window.location,
        T = R.pathname,
        S = R.hash,
        U = "";
      return function () {
        var X = R.pathname,
          V = R.hash,
          W = U;
        if (X !== T) {
          W = TLT.normalizeUrl("", X + V, 2);
        } else {
          if (V !== S) {
            W = TLT.normalizeUrl("", V, 2);
          }
        }
        if (W !== U) {
          if (U) {
            f("UNLOAD", U);
          }
          f("LOAD", W);
          U = W;
          T = X;
          S = V;
        }
      };
    })(),
    C = function (Y, W) {
      var V,
        R,
        T,
        X,
        S,
        U = null;
      if (!Y || !W) {
        return U;
      }
      for (V = 0, R = Y.length; V < R; V += 1) {
        T = Y[V];
        switch (typeof T) {
          case "object":
            X = new RegExp(T.regex, T.flags);
            S = X.exec(W);
            if (S) {
              U = S[0];
            }
            break;
          case "string":
            if (W.indexOf(T) !== -1) {
              U = T;
            }
            break;
          default:
            break;
        }
      }
      return U;
    },
    N = function (T, aa) {
      var U,
        S,
        V,
        Z = false,
        R = k.blockedElements,
        X,
        Y,
        W;
      if (!R || !R.length) {
        N = function () {
          return false;
        };
        return Z;
      }
      if (!T || !T.nodeType) {
        return Z;
      }
      aa = aa || P.getDocument(T);
      for (U = 0, V = R.length; U < V && !Z; U += 1) {
        Y = a.queryAll(R[U], aa);
        for (S = 0, W = Y.length; S < W && !Z; S += 1) {
          X = Y[S];
          Z = X.contains ? X.contains(T) : X === T;
        }
      }
      return Z;
    },
    J = function (S) {
      var R = false,
        T = ["intent:", "mailto:", "sms:", "tel:"];
      if (S && P.getTagName(S) === "a" && T.indexOf(S.protocol) !== -1) {
        R = true;
      }
      return R;
    },
    e = function () {
      var R = null,
        T = "tltTabId";
      try {
        R = sessionStorage.getItem(T);
        if (!R) {
          R = P.getRandomString(4);
          sessionStorage.setItem(T, R);
        }
      } catch (S) {}
      return R;
    },
    t = {
      getTLTSessionCookieInfo: function () {
        return I;
      },
      _loadGlobalsForUnitTesting: function (R) {
        P = R.utils;
        d = R.getService("ajax");
        n = R.getService("browserBase");
        a = R.getService("browser");
        m = R.getService("config");
        H = R.getService("domCapture");
        B = R.getService("queue");
        r = R.getService("serializer");
        c = R.getModule("dataLayer");
        k = m ? m.getCoreConfig() : null;
      },
      getStartTime: function () {
        return i;
      },
      getPageId: function () {
        return y || "#";
      },
      getTabId: function () {
        return G;
      },
      isMousemovementDetected: function () {
        return v;
      },
      setSessionCookieInfo: function (R, T, S) {
        I.tltCookieName = T;
        I.tltCookieValue = S;
      },
      getLibraryVersion: function () {
        return "6.1.0.1989";
      },
      getCurrentWebEvent: function () {
        return O;
      },
      normalizeUrl: function (U, T, V) {
        var S, R;
        S = this.getCoreConfig();
        if (S.normalization && S.normalization.urlFunction) {
          R = S.normalization.urlFunction;
          if (typeof R === "string") {
            R = P.access(R);
          }
          try {
            T = R(T, V);
          } catch (W) {}
        }
        return T;
      },
      getCurrentOffset: function () {
        return this.getService("message").getCurrentOffset();
      },
      init: function (S, T) {
        var R;
        P = this.utils;
        if (P.isLegacyIE) {
          return;
        }
        j = T;
        if (!A) {
          throw "init must only be called once!";
        }
        if (!S && !this.config) {
          throw "missing configuration.";
        }
        S = S || this.config;
        this.config = S;
        A = false;
        y = "P." + P.getRandomString(28);
        G = e();
        R = function (U) {
          U = U || window.event || {};
          if (U.type === "load" || document.readyState !== "loading") {
            if (document.removeEventListener) {
              document.removeEventListener("DOMContentLoaded", R, false);
              window.removeEventListener("load", R, false);
            } else {
              document.detachEvent("onreadystatechange", R);
              window.detachEvent("onload", R);
            }
            L(S, T);
          }
        };
        if (
          document.readyState === "complete" ||
          (document.readyState === "interactive" && !P.isIE)
        ) {
          setTimeout(R);
        } else {
          if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", R, false);
            window.addEventListener("load", R, false);
          } else {
            document.attachEvent("onreadystatechange", R);
            window.attachEvent("onload", R);
          }
        }
      },
      isInitialized: function () {
        return l;
      },
      getState: function () {
        return Q;
      },
      destroy: function (T, R) {
        var S = "",
          U = "",
          W = null,
          X = null,
          V = null,
          aa = false;
        if (A) {
          return false;
        }
        this.stopAll();
        if (!T) {
          for (S in s) {
            if (s.hasOwnProperty(S)) {
              U = S.split("|")[0];
              W = s[S].target;
              aa = s[S].delegateTarget || undefined;
              a.unsubscribe(U, W, this._publishEvent, aa);
            }
          }
          if (z) {
            a.unsubscribe("mousemove", document, z);
            z = null;
          }
        }
        for (X in o) {
          if (o.hasOwnProperty(X)) {
            V = o[X].instance;
            if (V && typeof V.destroy === "function") {
              V.destroy();
            }
            o[X].instance = null;
          }
        }
        w.clearCache();
        s = {};
        O = {};
        F = [];
        l = false;
        A = true;
        Q = "destroyed";
        TLT.terminationReason = R || Q;
        try {
          sessionStorage.setItem("tl.TR", TLT.terminationReason);
          sessionStorage.setItem("tl.PU", this.normalizeUrl("", location.href));
        } catch (Z) {}
        if (typeof j === "function") {
          try {
            j("destroyed");
          } catch (Y) {}
        }
        if (!D) {
          window.addEventListener("pageshow", q);
          D = true;
        }
      },
      _updateModules: function (T) {
        var V = null,
          S = null,
          R = true;
        if (k && k.modules) {
          try {
            for (S in k.modules) {
              if (k.modules.hasOwnProperty(S)) {
                V = k.modules[S];
                if (u.hasOwnProperty(S)) {
                  if (V.enabled === false) {
                    this.stop(S);
                    continue;
                  }
                  this.start(S);
                  if (V.events) {
                    this._registerModuleEvents(S, V.events, T);
                  }
                }
              }
            }
            this._registerModuleEvents.clearCache();
          } catch (U) {
            t.destroy(false, "_updateModules: " + U.message);
            R = false;
          }
        } else {
          R = false;
        }
        return R;
      },
      rebind: function (R) {
        t._updateModules(R);
      },
      getSessionData: function () {
        if (!t.isInitialized()) {
          return;
        }
        var V = null,
          R = null,
          T,
          U,
          S;
        if (!k || !k.sessionDataEnabled) {
          return null;
        }
        R = k.sessionData || {};
        T = R.sessionQueryName;
        if (T) {
          U = P.getQueryStringValue(T, R.sessionQueryDelim);
        } else {
          T = R.sessionCookieName;
          if (T) {
            U = P.getCookieValue(T);
          } else {
            S = TLT.getTLTSessionCookieInfo();
            T = S.tltCookieName;
            U = S.tltCookieValue;
          }
        }
        if (T && U) {
          V = V || {};
          V.tltSCN = T;
          V.tltSCV = U;
          V.tltSCVNeedsHashing = !!R.sessionValueNeedsHashing;
        }
        return V;
      },
      logGeolocation: function (R) {
        var S;
        if (!t.isInitialized()) {
          return;
        }
        if (!R || !R.coords) {
          return;
        }
        S = {
          type: 13,
          geolocation: {
            lat: P.getValue(R, "coords.latitude", 0),
            long: P.getValue(R, "coords.longitude", 0),
            accuracy: Math.ceil(P.getValue(R, "coords.accuracy", 0)),
          },
        };
        B.post("", S);
      },
      logCustomEvent: function (T, R) {
        if (!t.isInitialized()) {
          return;
        }
        var S = null;
        if (!T || typeof T !== "string") {
          T = "CUSTOM";
        }
        R = R || {};
        S = { type: 5, customEvent: { name: T, data: R } };
        B.post("", S);
      },
      logExceptionEvent: function (U, S, R) {
        if (!t.isInitialized()) {
          return;
        }
        var T = null;
        if (!U || typeof U !== "string") {
          return;
        }
        if (S) {
          S = t.normalizeUrl("", S, 6);
        }
        S = S || "";
        R = R || -1;
        T = { type: 6, exception: { description: U, url: S, line: R } };
        B.post("", T);
      },
      logFormCompletion: function (R, T) {
        if (!t.isInitialized()) {
          return;
        }
        var S = {
          type: 15,
          formCompletion: {
            submitted: !!R,
            valid: typeof T === "boolean" ? T : null,
          },
        };
        B.post("", S);
      },
      logDataLayer: function (R) {
        var S;
        if (!t.isInitialized()) {
          return;
        }
        if (c) {
          if (!R || typeof R === "object") {
            S = { type: "logDataLayer", data: R };
            c.onevent(S);
          }
        } else {
          return;
        }
      },
      logScreenviewLoad: function (T, S, R) {
        if (!t.isInitialized()) {
          return;
        }
        f("LOAD", T, S, R);
      },
      logScreenviewUnload: function (R) {
        if (!t.isInitialized()) {
          return;
        }
        f("UNLOAD", R);
      },
      logDOMCapture: function (R, U) {
        var V = null,
          T,
          S,
          W;
        if (!this.isInitialized()) {
          return V;
        }
        if (P.isLegacyIE) {
          return V;
        }
        if (H) {
          R = R || window.document;
          S = this.getServiceConfig("domCapture");
          U = P.mixin({}, S.options, U);
          T = H.captureDOM(R, U);
          if (T) {
            V =
              U.dcid ||
              "dcid-" + P.getSerialNumber() + "." + new Date().getTime();
            T.dcid = V;
            T.eventOn = !!U.eventOn;
            W = { type: 12, domCapture: T };
            if (U.timeoutExpired) {
              W.domCapture.timeout = true;
            }
            B.post("", W);
            if (U.qffd !== false && !x && W.domCapture.fullDOM) {
              B.flush();
              x = true;
            }
          }
        }
        return V;
      },
      performDOMCapture: function (T, R, S) {
        return this.logDOMCapture(R, S);
      },
      performFormCompletion: function (S, R, T) {
        return this.logFormCompletion(R, T);
      },
      _bridgeCallback: function (S) {
        var R = b[S];
        if (R && R.enabled) {
          return R;
        }
        return null;
      },
      logScreenCapture: function () {
        if (!t.isInitialized()) {
          return;
        }
        var R = t._bridgeCallback("screenCapture");
        if (R !== null) {
          R.cbFunction();
        }
      },
      enableTealeafFramework: function () {
        if (!t.isInitialized()) {
          return;
        }
        var R = t._bridgeCallback("enableTealeafFramework");
        if (R !== null) {
          R.cbFunction();
        }
      },
      disableTealeafFramework: function () {
        if (!t.isInitialized()) {
          return;
        }
        var R = t._bridgeCallback("disableTealeafFramework");
        if (R !== null) {
          R.cbFunction();
        }
      },
      startNewTLFSession: function () {
        if (!t.isInitialized()) {
          return;
        }
        var R = t._bridgeCallback("startNewTLFSession");
        if (R !== null) {
          R.cbFunction();
        }
      },
      currentSessionId: function () {
        if (!t.isInitialized()) {
          return;
        }
        var S,
          R = t._bridgeCallback("currentSessionId");
        if (R !== null) {
          S = R.cbFunction();
        }
        return S;
      },
      defaultValueForConfigurableItem: function (R) {
        if (!t.isInitialized()) {
          return;
        }
        var T,
          S = t._bridgeCallback("defaultValueForConfigurableItem");
        if (S !== null) {
          T = S.cbFunction(R);
        }
        return T;
      },
      valueForConfigurableItem: function (R) {
        if (!t.isInitialized()) {
          return;
        }
        var T,
          S = t._bridgeCallback("valueForConfigurableItem");
        if (S !== null) {
          T = S.cbFunction(R);
        }
        return T;
      },
      setConfigurableItem: function (S, U) {
        if (!t.isInitialized()) {
          return;
        }
        var R = false,
          T = t._bridgeCallback("setConfigurableItem");
        if (T !== null) {
          R = T.cbFunction(S, U);
        }
        return R;
      },
      addAdditionalHttpHeader: function (S, U) {
        if (!t.isInitialized()) {
          return;
        }
        var R = false,
          T = t._bridgeCallback("addAdditionalHttpHeader");
        if (T !== null) {
          R = T.cbFunction(S, U);
        }
        return R;
      },
      logCustomEventBridge: function (T, U, S) {
        if (!t.isInitialized()) {
          return;
        }
        var R = false,
          V = t._bridgeCallback("logCustomEventBridge");
        if (V !== null) {
          R = V.cbFunction(T, U, S);
        }
        return R;
      },
      registerBridgeCallbacks: function (Z) {
        var W,
          U,
          X,
          T = null,
          V,
          ab,
          S,
          R,
          aa = TLT.utils;
        if (!Z) {
          return false;
        }
        if (Z.length === 0) {
          b = {};
          return false;
        }
        try {
          for (W = 0, X = Z.length; W < X; W += 1) {
            T = Z[W];
            if (typeof T === "object" && T.cbType && T.cbFunction) {
              V = {
                enabled: T.enabled,
                cbFunction: T.cbFunction,
                cbOrder: T.order || 0,
              };
              if (aa.isUndefOrNull(b[T.cbType])) {
                if (V.enabled) {
                  b[T.cbType] = V;
                }
              } else {
                if (!aa.isArray(b[T.cbType])) {
                  b[T.cbType] = [b[T.cbType]];
                }
                ab = b[T.cbType];
                for (U = 0, R = false, S = ab.length; U < S; U += 1) {
                  if (
                    ab[U].cbOrder === V.cbOrder &&
                    ab[U].cbFunction === V.cbFunction
                  ) {
                    R = true;
                    if (!V.enabled) {
                      ab.splice(U, 1);
                      if (!ab.length) {
                        delete b[T.cbType];
                      }
                    }
                  } else {
                    if (ab[U].cbOrder > V.cbOrder) {
                      break;
                    }
                  }
                }
                if (!R) {
                  if (V.enabled) {
                    ab.splice(U, 0, V);
                  }
                }
              }
            }
          }
        } catch (Y) {
          return false;
        }
        return true;
      },
      registerMutationCallback: function (R, T) {
        var S;
        if (!R || typeof R !== "function") {
          return false;
        }
        if (T) {
          S = F.indexOf(R);
          if (S === -1) {
            F.push(R);
          }
        } else {
          S = F.indexOf(R);
          if (S !== -1) {
            F.splice(S, 1);
          }
        }
        return true;
      },
      invokeMutationCallbacks: function (T) {
        var U,
          R,
          Y,
          X,
          W,
          V = [],
          S = [];
        if (F.length === 0) {
          return;
        }
        if (Map) {
          W = new Map();
        } else {
          W = new P.WeakMap();
        }
        for (U = 0; U < T.length; U++) {
          X = T[U].target;
          if (X) {
            Y = P.getDocument(X);
            if (W.get(Y) === undefined) {
              if (Y.host) {
                S.push(Y);
              } else {
                V.push(Y);
              }
              W.set(Y, true);
            }
          }
        }
        W.clear();
        for (U = 0; U < F.length; U++) {
          R = F[U];
          R(T, V, S);
        }
      },
      redirectQueue: function (U) {
        var X, W, T, S, R, Y, V;
        if (!U || !U.length) {
          return U;
        }
        S = b.messageRedirect;
        if (!S) {
          return U;
        }
        if (!P.isArray(S)) {
          R = [S];
        } else {
          R = S;
        }
        for (W = 0, Y = R.length; W < Y; W += 1) {
          S = R[W];
          if (S && S.enabled) {
            for (X = 0, T = U.length; X < T; X += 1) {
              V = S.cbFunction(r.serialize(U[X]), U[X]);
              if (V && typeof V === "object") {
                U[X] = V;
              } else {
                U.splice(X, 1);
                X -= 1;
                T = U.length;
              }
            }
          }
        }
        return U;
      },
      _hasSameOrigin: function (S) {
        var R = false;
        try {
          R =
            S.document.location.host === document.location.host &&
            S.document.location.protocol === document.location.protocol;
          if (!R) {
            R = S.document.domain === document.domain;
          }
          return R;
        } catch (T) {}
        return false;
      },
      provideRequestHeaders: function () {
        var S = null,
          R = b.addRequestHeaders;
        if (R && R.enabled) {
          S = R.cbFunction();
        }
        return S;
      },
      _registerModuleEvents: (function () {
        var T,
          V = 0,
          U = function (Z, Y, X) {
            if (Z === "window") {
              return Y;
            }
            if (Z === "document") {
              return X;
            }
            return Z;
          };
        function W(X, ad, af) {
          var ae = P.getDocument(af),
            Z = t._getLocalTop(),
            Y = P.isIFrameDescendant(af),
            ac,
            ab,
            aa;
          af = af || ae;
          E.normalizeModuleEvents(X, ad, Z, ae);
          if (Y) {
            ac = n.ElementData.prototype.examineID(af).id;
            if (typeof ac === "string") {
              ac = ac.slice(0, ac.length - 1);
              for (ab in s) {
                if (s.hasOwnProperty(ab)) {
                  for (aa = 0; aa < s[ab].length; aa += 1) {
                    if (X === s[ab][aa]) {
                      if (ab.indexOf(ac) !== -1) {
                        delete s[ab];
                        break;
                      }
                    }
                  }
                }
              }
            }
          }
          P.forEach(ad, function (ag) {
            var ai = U(ag.target, Z, ae) || ae,
              ah = "";
            if (ag.recurseFrames !== true && Y) {
              return;
            }
            if (typeof ai === "string") {
              P.forEach(a.queryAll(ai, af), function (aj) {
                var ak = T.get(aj);
                if (!ak) {
                  ak = n.ElementData.prototype.examineID(aj);
                  T.set(aj, ak);
                }
                ah = ag.name + "|" + ak.id + ak.idType;
                if (P.indexOf(s[ah], X) !== -1) {
                  return;
                }
                s[ah] = s[ah] || [];
                s[ah].push(X);
                s[ah].target = aj;
                a.subscribe(ag.name, aj, t._publishEvent);
              });
            } else {
              ah = t._buildToken4bubbleTarget(
                ag.name,
                ai,
                typeof ag.target === "undefined"
              );
              if (!s.hasOwnProperty(ah)) {
                s[ah] = [X];
                a.subscribe(ag.name, ai, t._publishEvent);
              } else {
                if (P.indexOf(s[ah], X) === -1) {
                  s[ah].push(X);
                }
              }
            }
            if (ah !== "") {
              if (typeof ai !== "string") {
                s[ah].target = ai;
              }
            }
          });
        }
        function S(X) {
          var Y = P.getIFrameWindow(X);
          return (
            Y !== null &&
            t._hasSameOrigin(Y) &&
            Y.document !== null &&
            Y.document.readyState === "complete" &&
            Y.document.body.innerHTML !== ""
          );
        }
        function R(aa, Y, ae) {
          ae = ae || t._getLocalTop().document;
          T = T || new P.WeakMap();
          W(aa, Y, ae);
          if (aa !== "performance") {
            var ad = null,
              Z = null,
              X = a.queryAll("iframe, frame", ae),
              ac,
              ab;
            for (ac = 0, ab = X.length; ac < ab; ac += 1) {
              ad = X[ac];
              if (w(ad)) {
                continue;
              }
              if (S(ad)) {
                Z = P.getIFrameWindow(ad);
                t._registerModuleEvents(aa, Y, Z.document);
                H.observeWindow(Z);
                continue;
              }
              V += 1;
              (function (ah, ag, ai) {
                var af = null,
                  aj = {
                    moduleName: ah,
                    moduleEvents: ag,
                    hIFrame: ai,
                    _registerModuleEventsDelayed: function () {
                      var ak = null;
                      if (!w(ai)) {
                        ak = P.getIFrameWindow(ai);
                        if (t._hasSameOrigin(ak)) {
                          t._registerModuleEvents(ah, ag, ak.document);
                          H.observeWindow(ak);
                        }
                      }
                      V -= 1;
                      if (!V) {
                        t._publishEvent({
                          type: "loadWithFrames",
                          custom: true,
                        });
                      }
                    },
                  };
                P.addEventListener(ai, "load", function () {
                  aj._registerModuleEventsDelayed();
                });
                if (P.isLegacyIE && S(ai)) {
                  af = P.getIFrameWindow(ai);
                  P.addEventListener(
                    af.document,
                    "readystatechange",
                    function () {
                      aj._registerModuleEventsDelayed();
                    }
                  );
                }
              })(aa, Y, ad);
            }
          }
        }
        R.clearCache = function () {
          if (T) {
            T.clear();
            T = null;
          }
        };
        return R;
      })(),
      _buildToken4currentTarget: function (S) {
        var T = S.nativeEvent ? S.nativeEvent.currentTarget : null,
          R = T
            ? n.ElementData.prototype.examineID(T)
            : {
                id: S.target ? S.target.id : null,
                idType: S.target ? S.target.idType : -1,
              };
        return S.type + "|" + R.id + R.idType;
      },
      _buildToken4delegateTarget: function (R, T, S) {
        return R + "|" + T + "|" + S;
      },
      _buildToken4bubbleTarget: function (S, X, W, aa) {
        var V = t._getLocalTop(),
          R,
          ab = function (ac) {
            var ad = null;
            if (t._hasSameOrigin(R.parent)) {
              P.forEach(
                a.queryAll("iframe, frame", R.parent.document),
                function (ae) {
                  var af = null;
                  if (!w(ae)) {
                    af = P.getIFrameWindow(ae);
                    if (t._hasSameOrigin(af) && af.document === ac) {
                      ad = ae;
                    }
                  }
                }
              );
            }
            return ad;
          },
          Y = P.getDocument(X),
          Z = null,
          U,
          T = S;
        if (Y) {
          R = Y.defaultView || Y.parentWindow;
        }
        if (X === window || X === window.window) {
          T += "|null-2|window";
        } else {
          if (
            W &&
            R &&
            t._hasSameOrigin(R.parent) &&
            typeof Y !== "undefined" &&
            V.document !== Y
          ) {
            Z = ab(Y);
            if (Z) {
              U = n.ElementData.prototype.examineID(Z);
              T += "|" + U.xPath + "-2";
            }
          } else {
            T += "|null-2|document";
          }
        }
        return T;
      },
      _reinitConfig: function () {
        t._updateModules();
      },
      _publishEvent: function (R) {
        var S = null,
          U = null,
          X =
            R.delegateTarget && R.data
              ? R.data
              : t._buildToken4currentTarget(R),
          V = null,
          Y,
          Z,
          aa,
          T = null,
          ab = false,
          ac = false,
          ae = R.delegateTarget || null,
          ad,
          W;
        O = R;
        if (R.type.match(/^(click|change|blur|mouse|touch)/)) {
          p();
          B.resetFlushTimer();
        }
        ad = P.getValue(k, "screenviewAutoDetect", true);
        if (ad) {
          M();
        }
        if (
          (R.type === "load" || R.type === "pageshow") &&
          !R.nativeEvent.customLoad
        ) {
          O = {};
          return;
        }
        if (R.type === "click") {
          K = R.target.element;
        }
        if (R.type === "beforeunload") {
          ab = false;
          W = P.getTagName(K) === "a" ? K : document.activeElement;
          if (W) {
            if (J(W)) {
              ab = true;
            } else {
              P.forEach(k.ieExcludedLinks, function (af) {
                var ah,
                  ag,
                  ai = a.queryAll(af);
                for (ah = 0, ag = ai ? ai.length : 0; ah < ag; ah += 1) {
                  if (ai[ah] && ai[ah] === K) {
                    ab = true;
                    break;
                  }
                }
              });
            }
          }
          if (ab) {
            O = {};
            return;
          }
        }
        if (E.isUnload(R)) {
          Q = "unloading";
        }
        if (
          R.type === "change" &&
          P.isLegacyIE &&
          t.getFlavor() === "w3c" &&
          (R.target.element.type === "checkbox" ||
            R.target.element.type === "radio")
        ) {
          O = {};
          return;
        }
        if (R.type === "propertychange") {
          if (
            R.nativeEvent.propertyName === "checked" &&
            (R.target.element.type === "checkbox" ||
              (R.target.element.type === "radio" && R.target.element.checked))
          ) {
            R.type = "change";
            R.target.type = "INPUT";
          } else {
            O = {};
            return;
          }
        }
        if (R.target && N(R.target.element)) {
          O = {};
          return;
        }
        if (!s.hasOwnProperty(X)) {
          if (R.hasOwnProperty("nativeEvent")) {
            aa = R.nativeEvent.currentTarget || R.nativeEvent.target;
          }
          X = t._buildToken4bubbleTarget(R.type, aa, true, ae);
        }
        if (s.hasOwnProperty(X)) {
          V = s[X];
          for (Y = 0, Z = V.length; Y < Z; Y += 1) {
            S = V[Y];
            U = t.getModule(S);
            T = P.mixin({}, R);
            if (U && t.isStarted(S) && typeof U.onevent === "function") {
              ac = E.canPublish(S, T);
              if (ac) {
                U.onevent(T);
              }
            }
          }
        }
        if (T && T.type === "unload" && ac) {
          t.destroy(false, T.type);
        }
        O = {};
      },
      _getLocalTop: function () {
        return window.window;
      },
      addModule: function (R, S) {
        u[R] = { creator: S, instance: null, context: null, messages: [] };
        if (this.isInitialized()) {
          this.start(R);
        }
      },
      getModule: function (R) {
        if (u[R] && u[R].instance) {
          return u[R].instance;
        }
        return null;
      },
      removeModule: function (R) {
        this.stop(R);
        delete u[R];
      },
      isStarted: function (R) {
        return u.hasOwnProperty(R) && u[R].instance !== null;
      },
      start: function (S) {
        var T = u[S],
          R = null;
        if (T && T.instance === null) {
          T.context = new TLT.ModuleContext(S, this);
          R = T.instance = T.creator(T.context);
          if (typeof R.init === "function") {
            R.init();
          }
        }
      },
      startAll: function () {
        var R = null;
        for (R in u) {
          if (u.hasOwnProperty(R)) {
            this.start(R);
          }
        }
      },
      stop: function (S) {
        var T = u[S],
          R = null;
        if (T && T.instance !== null) {
          R = T.instance;
          if (typeof R.destroy === "function") {
            R.destroy();
          }
          T.instance = T.context = null;
        }
      },
      stopAll: function () {
        var R = null;
        for (R in u) {
          if (u.hasOwnProperty(R)) {
            this.stop(R);
          }
        }
      },
      addService: function (S, R) {
        o[S] = { creator: R, instance: null };
      },
      getService: function (R) {
        if (o.hasOwnProperty(R)) {
          if (!o[R].instance) {
            try {
              o[R].instance = o[R].creator(this);
              if (typeof o[R].instance.init === "function") {
                o[R].instance.init();
              }
            } catch (S) {
              P.clog(
                "UIC terminated due to error when instanciating the " +
                  R +
                  " service."
              );
              throw S;
            }
            if (typeof o[R].instance.getServiceName !== "function") {
              o[R].instance.getServiceName = function () {
                return R;
              };
            }
          }
          return o[R].instance;
        }
        return null;
      },
      removeService: function (R) {
        delete o[R];
      },
      broadcast: function (S) {
        var T, R;
        if (S && typeof S === "object") {
          for (T in u) {
            if (u.hasOwnProperty(T)) {
              R = u[T];
              if (P.indexOf(R.messages, S.type) > -1) {
                if (typeof R.instance.onmessage === "function") {
                  R.instance.onmessage(S);
                }
              }
            }
          }
        }
      },
      listen: function (R, T) {
        var S = null;
        if (this.isStarted(R)) {
          S = u[R];
          if (P.indexOf(S.messages, T) === -1) {
            S.messages.push(T);
          }
        }
      },
      fail: function (T, S, R) {
        T = "UIC FAILED. " + T;
        try {
          t.destroy(!!R, T);
        } catch (U) {
          P.clog(T);
        }
        throw new t.UICError(T, S);
      },
      UICError: (function () {
        function R(S, T) {
          this.message = S;
          this.code = T;
        }
        R.prototype = new Error();
        R.prototype.name = "UICError";
        R.prototype.constructor = R;
        return R;
      })(),
      getFlavor: function () {
        return "w3c";
      },
      isCrossOrigin: function (T, S) {
        var U = false,
          V,
          R;
        S = S || window.location.origin;
        if (!T || !S) {
          return U;
        }
        R = T.match(/^\/\//);
        if (T.match(/^\//) && !R) {
          U = false;
        } else {
          if (R || T.indexOf("://") !== -1) {
            if (R) {
              V = S.indexOf("://");
              if (V !== -1) {
                S = S.substring(V + 1);
              }
            }
            if (T.length < S.length) {
              U = true;
            } else {
              U =
                S !== T.substring(0, S.length) ||
                (T.length > S.length && T.charAt(S.length) !== "/");
            }
          } else {
            U = false;
          }
        }
        return U;
      },
    };
  p = function () {
    var T = null,
      S = P.getValue(k, "inactivityTimeout", 600000);
    if (!S) {
      p = function () {};
      return;
    }
    function R() {
      t.destroy(false, "inactivity");
    }
    p = function () {
      if (T) {
        clearTimeout(T);
        T = null;
      }
      T = setTimeout(R, S);
    };
    p();
  };
  function h(V) {
    var R, S, U, T;
    if (!localStorage || !V) {
      return;
    }
    U = localStorage.getItem(V);
    if (U) {
      S = U.split("|");
      R = parseInt(S[0], 10);
      if (Date.now() > R) {
        localStorage.removeItem(V);
      } else {
        T = S[1];
      }
    }
    return T;
  }
  L = function (S, ag) {
    var T,
      ad,
      Y,
      U,
      ah,
      R,
      W,
      af = null,
      X,
      V,
      Z,
      ae,
      aa;
    if (l) {
      return;
    }
    if (TLT && TLT.replay) {
      return;
    }
    m = t.getService("config");
    m.updateConfig(S);
    k = m.getCoreConfig();
    V = C(k.blockedUserAgents, navigator.userAgent);
    if (V) {
      TLT.terminationReason = "blockedUA: " + V;
      return;
    }
    d = t.getService("ajax");
    P.browserBaseService = n = t.getService("browserBase");
    P.browserService = a = t.getService("browser");
    H = t.getService("domCapture");
    B = t.getService("queue");
    r = t.getService("serializer");
    T = m.getModuleConfig("TLCookie") || {};
    U = T.sessionizationCookieName || "TLTSID";
    ah = P.getCookieValue("TLTSID");
    if (ah === "DND") {
      if (Q !== "destroyed") {
        t.destroy(false, "killswitch");
      }
      return;
    }
    ah = P.getCookieValue(U) || h(U);
    if (!ah) {
      U = T.wcxCookieName || "WCXSID";
      ah = P.getCookieValue(U);
    }
    if (!t._updateModules()) {
      if (Q !== "destroyed") {
        t.destroy(false, "modules init");
      }
      return;
    }
    c = t.getModule("dataLayer");
    if (m.subscribe) {
      m.subscribe("configupdated", t._reinitConfig);
    }
    l = true;
    Q = "loaded";
    try {
      if (typeof TLFExtensionNotify === "function") {
        TLFExtensionNotify("Initialized");
      }
    } catch (ac) {}
    ad = t.getServiceConfig("queue");
    Y = ad.queues || [];
    if (P.isLegacyIE || P.isIE9) {
      af = P.getOriginAndPath().origin;
    }
    for (X = 0; X < Y.length; X += 1) {
      if (af && t.isCrossOrigin(Y[X].endpoint, af)) {
        t.setAutoFlush(false);
        t.destroy(false, "CORS not supported");
        return;
      }
      if (!ah && T.tlAppKey) {
        R = Y[X].endpoint;
        W =
          Y[X].killswitchURL ||
          (R.match("collectorPost")
            ? R.replace("collectorPost", "switch/" + T.tlAppKey)
            : null);
        if (W) {
          d.sendRequest({
            type: "GET",
            url: W,
            async: true,
            timeout: 5000,
            oncomplete: function (ai) {
              if (ai.responseText === "0" || ai.data === 0) {
                t.setAutoFlush(false);
                P.setCookie("TLTSID", "DND");
                t.destroy(false, "killswitch");
              }
            },
          });
        }
      }
      if (Y[X].checkEndpoint && !ad.asyncReqOnUnload) {
        ad.asyncReqOnUnload = true;
        d.sendRequest({
          oncomplete: function (ai) {
            if (ai.success) {
              ad.asyncReqOnUnload = false;
            }
          },
          timeout: Y[X].endpointCheckTimeout || 3000,
          url: Y[X].endpoint,
          headers: {
            "X-PageId": y,
            "X-Tealeaf-SaaS-AppKey": T.tlAppKey,
            "X-Tealeaf-EndpointCheck": true,
          },
          async: true,
          error: function (ai) {
            if (ai.success) {
              return;
            }
            ad.endpointCheckFailed = true;
          },
        });
      }
    }
    aa = function (ak) {
      var aj, ai;
      aj = {
        type: "load",
        target: window.window,
        srcElement: window.window,
        currentTarget: window.window,
        bubbles: true,
        cancelBubble: false,
        cancelable: true,
        timeStamp: +new Date(),
        customLoad: true,
      };
      ai = new n.WebEvent(aj);
      t._publishEvent(ai);
      if (ak) {
        a.unsubscribe(Z, ae, aa);
      }
    };
    if (k.screenviewLoadEvent) {
      Z = k.screenviewLoadEvent.name;
      ae = k.screenviewLoadEvent.target || window;
      a.subscribe(Z, ae, aa);
    } else {
      aa();
    }
    if (t.isInitialized()) {
      Q = "initialized";
      p();
      z = function (ai) {
        if (ai.type === "mousemove") {
          v = true;
        }
        a.unsubscribe("mousemove", document, z);
        z = null;
      };
      a.subscribe("mousemove", document, z, { once: true });
    }
    if (typeof j === "function") {
      try {
        j(Q);
      } catch (ab) {
        P.clog("Error in callback.", ab);
      }
    }
  };
  (function () {
    var S = null,
      T,
      R;
    for (S in g) {
      if (g.hasOwnProperty(S)) {
        for (T = 0, R = g[S].length; T < R; T += 1) {
          (function (V, U) {
            t[U] = function () {
              var W = this.getService(V);
              if (W) {
                return W[U].apply(W, arguments);
              }
            };
          })(S, g[S][T]);
        }
      }
    }
  })();
  return t;
})();
(function () {
  var a = window.navigator.userAgent.toLowerCase(),
    k = a.indexOf("msie") !== -1 || a.indexOf("trident") !== -1,
    b = (function () {
      var l = !!window.performance;
      return k && (!l || document.documentMode < 9);
    })(),
    e = (function () {
      return k && document.documentMode === 9;
    })(),
    f = a.indexOf("android") !== -1,
    h = /(ipad|iphone|ipod)/.test(a),
    c = a.indexOf("opera mini") !== -1,
    g = a.indexOf("chrome") === -1 && a.indexOf("safari") !== -1,
    j = 1,
    d = {
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
      "textarea:textarea": "textBox",
    },
    i = {
      isIE: k,
      isLegacyIE: b,
      isIE9: e,
      isAndroid: f,
      isLandscapeZeroDegrees: false,
      isiOS: h,
      isOperaMini: c,
      isSafari: g,
      isUndefOrNull: function (l) {
        return typeof l === "undefined" || l === null;
      },
      isArray: function (l) {
        return !!(l && Object.prototype.toString.call(l) === "[object Array]");
      },
      getSerialNumber: function () {
        var l;
        l = j;
        j += 1;
        return l;
      },
      getRandomString: function (q, p) {
        var o,
          n,
          l = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
          m = "";
        if (!q) {
          return m;
        }
        if (typeof p !== "string") {
          p = l;
        }
        for (o = 0, n = p.length; o < q; o += 1) {
          m += p.charAt(Math.floor(Math.random() * n));
        }
        return m;
      },
      getValue: function (q, p, m) {
        var o, l, n;
        m = typeof m === "undefined" ? null : m;
        if (!q || typeof q !== "object" || typeof p !== "string") {
          return m;
        }
        n = p.split(".");
        for (o = 0, l = n.length; o < l; o += 1) {
          if (this.isUndefOrNull(q) || typeof q[n[o]] === "undefined") {
            return m;
          }
          q = q[n[o]];
        }
        return q;
      },
      indexOf: function (o, n) {
        var m, l;
        if (o && o.indexOf) {
          return o.indexOf(n);
        }
        if (o && o instanceof Array) {
          for (m = 0, l = o.length; m < l; m += 1) {
            if (o[m] === n) {
              return m;
            }
          }
        }
        return -1;
      },
      forEach: function (p, o, n) {
        var m, l;
        if (!p || !p.length || !o || !o.call) {
          return;
        }
        for (m = 0, l = p.length; m < l; m += 1) {
          o.call(n, p[m], m, p);
        }
      },
      some: function (p, o) {
        var m,
          l,
          n = false;
        for (m = 0, l = p.length; m < l; m += 1) {
          n = o(p[m], m, p);
          if (n) {
            return n;
          }
        }
        return n;
      },
      convertToArray: function (n) {
        var o = 0,
          m = n.length,
          l = [];
        while (o < m) {
          l.push(n[o]);
          o += 1;
        }
        return l;
      },
      mixin: function (p) {
        var o, n, m, l;
        for (m = 1, l = arguments.length; m < l; m += 1) {
          n = arguments[m];
          for (o in n) {
            if (Object.prototype.hasOwnProperty.call(n, o)) {
              p[o] = n[o];
            }
          }
        }
        return p;
      },
      extend: function (l, m, n) {
        var o = "";
        for (o in n) {
          if (Object.prototype.hasOwnProperty.call(n, o)) {
            if (
              l &&
              Object.prototype.toString.call(n[o]) === "[object Object]"
            ) {
              if (typeof m[o] === "undefined") {
                m[o] = {};
              }
              this.extend(l, m[o], n[o]);
            } else {
              m[o] = n[o];
            }
          }
        }
        return m;
      },
      clone: function (m) {
        var n, l;
        if (null === m || "object" !== typeof m) {
          return m;
        }
        if (m instanceof Object) {
          n = Object.prototype.toString.call(m) === "[object Array]" ? [] : {};
          for (l in m) {
            if (Object.prototype.hasOwnProperty.call(m, l)) {
              n[l] = this.clone(m[l]);
            }
          }
          return n;
        }
      },
      parseVersion: function (n) {
        var o,
          l,
          m = [];
        if (!n || !n.length) {
          return m;
        }
        m = n.split(".");
        for (o = 0, l = m.length; o < l; o += 1) {
          m[o] = /^[0-9]+$/.test(m[o]) ? parseInt(m[o], 10) : m[o];
        }
        return m;
      },
      isEqual: function (n, m) {
        var o, p, r, q, l;
        if (n === m) {
          return true;
        }
        if (typeof n !== typeof m) {
          return false;
        }
        if (n instanceof Object && m instanceof Object) {
          if (
            Object.prototype.toString.call(n) === "[object Array]" &&
            Object.prototype.toString.call(m) === "[object Array]"
          ) {
            if (n.length !== m.length) {
              return false;
            }
            for (o = 0, l = n.length; o < l; o += 1) {
              if (!this.isEqual(n[o], m[o])) {
                return false;
              }
            }
            return true;
          }
          if (
            Object.prototype.toString.call(n) === "[object Object]" &&
            Object.prototype.toString.call(m) === "[object Object]"
          ) {
            for (o = 0; o < 2; o += 1) {
              for (r in n) {
                if (n.hasOwnProperty(r)) {
                  if (!m.hasOwnProperty(r)) {
                    return false;
                  }
                  p = this.isEqual(n[r], m[r]);
                  if (!p) {
                    return false;
                  }
                }
              }
              q = n;
              n = m;
              m = q;
            }
            return true;
          }
        }
        return false;
      },
      calculateRelativeXY: function (n) {
        if (
          i.isUndefOrNull(n) ||
          i.isUndefOrNull(n.x) ||
          i.isUndefOrNull(n.y) ||
          i.isUndefOrNull(n.width) ||
          i.isUndefOrNull(n.height)
        ) {
          return "0.5,0.5";
        }
        var m = Math.abs(n.x / n.width).toFixed(4),
          l = Math.abs(n.y / n.height).toFixed(4);
        m = m > 1 || m < 0 ? 0.5 : m;
        l = l > 1 || l < 0 ? 0.5 : l;
        return m + "," + l;
      },
      createObject: (function () {
        var l = null,
          m = null;
        if (typeof Object.create === "function") {
          l = Object.create;
        } else {
          m = function () {};
          l = function (n) {
            if (typeof n !== "object" && typeof n !== "function") {
              throw new TypeError("Object prototype need to be an object!");
            }
            m.prototype = n;
            return new m();
          };
        }
        return l;
      })(),
      access: function (q, o) {
        var p = o || window,
          m,
          n,
          l;
        if (typeof q !== "string" || typeof p !== "object") {
          return;
        }
        m = q.split(".");
        for (n = 0, l = m.length; n < l; n += 1) {
          if (n === 0 && m[n] === "window") {
            continue;
          }
          if (!Object.prototype.hasOwnProperty.call(p, m[n])) {
            return;
          }
          p = p[m[n]];
          if (n < l - 1 && !(p instanceof Object)) {
            return;
          }
        }
        return p;
      },
      isNumeric: function (l) {
        var m = false;
        if (i.isUndefOrNull(l) || !/\S/.test(l)) {
          return m;
        }
        m = !isNaN(l * 2);
        return m;
      },
      isUpperCase: function (l) {
        return l === l.toUpperCase() && l !== l.toLowerCase();
      },
      isLowerCase: function (l) {
        return l === l.toLowerCase() && l !== l.toUpperCase();
      },
      extractResponseHeaders: function (n) {
        var p = {},
          m,
          l,
          o = null;
        if (!n || !n.length) {
          n = [];
        } else {
          n = n.split("\n");
        }
        for (m = 0, l = n.length; m < l; m += 1) {
          o = n[m].split(": ");
          if (o.length === 2) {
            p[o[0]] = o[1];
          }
        }
        return p;
      },
      getTargetState: function (s) {
        var q = {
            a: ["innerText", "href"],
            input: {
              range: ["maxValue:max", "value"],
              checkbox: ["value", "checked"],
              radio: ["value", "checked"],
              image: ["src"],
            },
            select: ["value"],
            button: ["value", "innerText"],
            textarea: ["value"],
          },
          o = this.getTagName(s),
          n = q[o] || null,
          p = null,
          r = null,
          m = null,
          l = "";
        if (n !== null) {
          if (Object.prototype.toString.call(n) === "[object Object]") {
            n = n[s.type] || ["value"];
          }
          r = {};
          for (l in n) {
            if (n.hasOwnProperty(l)) {
              if (n[l].indexOf(":") !== -1) {
                m = n[l].split(":");
                r[m[0]] = s[m[1]];
              } else {
                if (n[l] === "innerText") {
                  r[n[l]] = this.trim(s.innerText || s.textContent);
                } else {
                  r[n[l]] = s[n[l]];
                }
              }
            }
          }
        }
        if (o === "select" && s.options && !isNaN(s.selectedIndex)) {
          r = r || {};
          r.index = s.selectedIndex;
          if (r.index >= 0 && r.index < s.options.length) {
            p = s.options[s.selectedIndex];
            r.value =
              p.getAttribute("value") ||
              p.getAttribute("label") ||
              p.text ||
              p.innerText;
            r.text = p.text || p.innerText;
          }
        }
        if (r && s.disabled) {
          r.disabled = true;
        }
        return r;
      },
      getDocument: function (l) {
        var m = l;
        if (l && l.nodeType !== 9) {
          if (l.getRootNode) {
            m = l.getRootNode();
          } else {
            m = l.ownerDocument || l.document;
          }
        }
        return m;
      },
      getWindow: function (m) {
        try {
          if (m.self !== m) {
            var l = i.getDocument(m);
            return !i.isUndefOrNull(l.defaultView)
              ? l.defaultView
              : l.parentWindow;
          }
        } catch (n) {
          m = null;
        }
        return m;
      },
      getOriginAndPath: function (t) {
        var o = {},
          v,
          w,
          r,
          u,
          s,
          l = [],
          m = {},
          p,
          n;
        t = t || window.location;
        if (t.origin) {
          o.origin = t.origin;
        } else {
          o.origin = (t.protocol || "") + "//" + (t.host || "");
        }
        o.path = (t.pathname || "").split(";", 1)[0];
        if (o.origin.indexOf("file://") > -1 || (i.isiOS && window.Ionic)) {
          v = o.path.match(/(.*)(\/.*app.*)/);
          if (v !== null) {
            o.path = v[2];
            o.origin = "file://";
          }
        }
        w = t.search || "";
        try {
          r = new URLSearchParams(w);
          r.forEach(function (x, y) {
            m[y] = x;
          });
        } catch (q) {
          if (w.length > 1 && w.charAt(0) === "?") {
            l = decodeURIComponent(w).substring(1).split("&");
          }
          for (p = 0; p < l.length; p += 1) {
            n = l[p].indexOf("=");
            if (n > -1) {
              u = l[p].substring(0, n);
              s = l[p].substring(n + 1);
              m[u] = s;
            }
          }
        }
        o.queryParams = m;
        return o;
      },
      getIFrameWindow: function (n) {
        var l = null;
        if (!n) {
          return l;
        }
        try {
          l =
            n.contentWindow ||
            (n.contentDocument ? n.contentDocument.parentWindow : null);
        } catch (m) {}
        return l;
      },
      getTagName: function (m) {
        var l = "";
        if (i.isUndefOrNull(m)) {
          return l;
        }
        if (m === document || m.nodeType === 9) {
          l = "document";
        } else {
          if (m === window || m === window.window) {
            l = "window";
          } else {
            if (typeof m === "string") {
              l = m.toLowerCase();
            } else {
              l = (m.tagName || m.nodeName || "").toLowerCase();
            }
          }
        }
        return l;
      },
      getTlType: function (n) {
        var l,
          m,
          o = "";
        if (i.isUndefOrNull(n) || !n.type) {
          return o;
        }
        l = n.type.toLowerCase();
        m = l + ":";
        if (n.subType) {
          m += n.subType.toLowerCase();
        }
        o = d[m] || l;
        return o;
      },
      isIFrameDescendant: function (m) {
        var l = i.getWindow(m);
        return l ? l != TLT._getLocalTop() : false;
      },
      getOrientationMode: function (l) {
        var m = "INVALID";
        if (typeof l !== "number") {
          return m;
        }
        switch (l) {
          case 0:
          case 180:
          case 360:
            m = "PORTRAIT";
            break;
          case 90:
          case -90:
          case 270:
            m = "LANDSCAPE";
            break;
          default:
            m = "UNKNOWN";
            break;
        }
        return m;
      },
      getOrientationAngle: function () {
        if (typeof window.orientation === "number") {
          return window.orientation;
        }
        var l = (screen.orientation || {}).angle;
        if (typeof l !== "number") {
          switch (screen.mozOrientation || screen.msOrientation) {
            case "landscape-primary":
            case "landscape-secondary":
              l = 90;
              break;
            default:
              l = 0;
              break;
          }
        }
        return l;
      },
      clog: (function (l) {
        return function () {};
      })(window),
      trim: function (l) {
        if (!l || !l.toString) {
          return l;
        }
        return l.toString().replace(/^\s+|\s+$/g, "");
      },
      ltrim: function (l) {
        if (!l || !l.toString) {
          return l;
        }
        return l.toString().replace(/^\s+/, "");
      },
      rtrim: function (l) {
        if (!l || !l.toString) {
          return l;
        }
        return l.toString().replace(/\s+$/, "");
      },
      setCookie: function (w, m, u, z, q, l, t) {
        var r,
          s,
          p,
          o,
          n = "",
          y,
          v,
          x;
        if (t === "None") {
          l = true;
        } else {
          if (t !== "Lax") {
            t = "Strict";
          }
        }
        x = ";SameSite=" + t;
        v = l ? ";Secure" : "";
        if (!w) {
          return;
        }
        w = encodeURIComponent(w);
        m = encodeURIComponent(m);
        p = (q || location.hostname).split(".");
        y = ";Path=" + (z || "/");
        if (typeof u === "number") {
          if (this.isIE) {
            o = new Date();
            o.setTime(o.getTime() + u * 1000);
            n = ";Expires=" + o.toUTCString();
          } else {
            n = ";Max-Age=" + u;
          }
        }
        for (s = p.length, r = s === 1 ? 1 : 2; r <= s; r += 1) {
          document.cookie =
            w + "=" + m + ";Domain=" + p.slice(-r).join(".") + y + n + v + x;
          if (this.getCookieValue(w) === m) {
            break;
          }
          if (s === 1) {
            document.cookie = w + "=" + m + y + n + v + x;
          }
        }
      },
      getCookieValue: function (r, t) {
        var o,
          p,
          n,
          s,
          m = null,
          l;
        try {
          t = t || document.cookie;
          if (!r || !r.toString) {
            return null;
          }
          r += "=";
          l = r.length;
          s = t.split(";");
          for (o = 0, p = s.length; o < p; o += 1) {
            n = s[o];
            n = i.ltrim(n);
            if (n.indexOf(r) === 0) {
              m = n.substring(l, n.length);
              break;
            }
          }
        } catch (q) {
          m = null;
        }
        return m;
      },
      getQueryStringValue: function (p, s, l) {
        var o,
          n,
          t,
          m = null,
          q;
        try {
          l = l || window.location.search;
          t = l.length;
          if (!p || !p.toString || !t) {
            return null;
          }
          s = s || "&";
          l = s + l.substring(1);
          p = s + p + "=";
          o = l.indexOf(p);
          if (o !== -1) {
            q = o + p.length;
            n = l.indexOf(s, q);
            if (n === -1) {
              n = t;
            }
            m = decodeURIComponent(l.substring(q, n));
          }
        } catch (r) {}
        return m;
      },
      addEventListener: (function () {
        if (window.addEventListener) {
          return function (m, l, n) {
            m.addEventListener(l, n, false);
          };
        }
        return function (m, l, n) {
          m.attachEvent("on" + l, n);
        };
      })(),
      matchTarget: function (v, r) {
        var p,
          n,
          o,
          u = -1,
          t,
          l,
          m,
          q,
          s,
          w = document;
        if (!v || !r) {
          return u;
        }
        if (!this.browserService || !this.browserBaseService) {
          this.browserService = TLT.getService("browser");
          this.browserBaseService = TLT.getService("browserBase");
        }
        if (r.idType === -2) {
          o = this.browserBaseService.getNodeFromID(r.id, r.idType);
          w = this.getDocument(o);
        }
        for (p = 0, q = v.length; p < q && u === -1; p += 1) {
          s = v[p];
          if (typeof s === "string") {
            t = this.browserService.queryAll(s, w);
            for (n = 0, l = t ? t.length : 0; n < l; n += 1) {
              if (t[n]) {
                m = this.browserBaseService.ElementData.prototype.examineID(
                  t[n]
                );
                if (m.idType === r.idType && m.id === r.id) {
                  u = p;
                  break;
                }
              }
            }
          } else {
            if (
              s &&
              s.id &&
              s.idType &&
              r.idType &&
              r.idType.toString() === s.idType.toString()
            ) {
              switch (typeof s.id) {
                case "string":
                  if (s.id === r.id) {
                    u = p;
                  }
                  break;
                case "object":
                  if (!s.cRegex) {
                    s.cRegex = new RegExp(s.id.regex, s.id.flags);
                  }
                  s.cRegex.lastIndex = 0;
                  if (s.cRegex.test(r.id)) {
                    u = p;
                  }
                  break;
              }
            }
          }
        }
        return u;
      },
      WeakMap: (function () {
        function l(p, o) {
          var n, m;
          p = p || [];
          for (n = 0, m = p.length; n < m; n += 1) {
            if (p[n][0] === o) {
              return n;
            }
          }
          return -1;
        }
        return function () {
          var m = [];
          this.set = function (o, p) {
            var n = l(m, o);
            m[n > -1 ? n : m.length] = [o, p];
          };
          this.get = function (o) {
            var n = m[l(m, o)];
            return n ? n[1] : undefined;
          };
          this.clear = function () {
            m = [];
          };
          this.has = function (n) {
            return l(m, n) >= 0;
          };
          this.remove = function (o) {
            var n = l(m, o);
            if (n >= 0) {
              m.splice(n, 1);
            }
          };
          this["delete"] = this.remove;
        };
      })(),
    };
  if (typeof TLT === "undefined" || !TLT) {
    window.TLT = {};
  }
  TLT.utils = i;
})();
(function () {
  TLT.EventTarget = function () {
    this._handlers = {};
  };
  TLT.EventTarget.prototype = {
    constructor: TLT.EventTarget,
    publish: function (c, f) {
      var d = 0,
        a = 0,
        b = this._handlers[c],
        e = { type: c, data: f };
      if (typeof b !== "undefined") {
        for (a = b.length; d < a; d += 1) {
          b[d](e);
        }
      }
    },
    subscribe: function (a, b) {
      if (!this._handlers.hasOwnProperty(a)) {
        this._handlers[a] = [];
      }
      this._handlers[a].push(b);
    },
    unsubscribe: function (c, e) {
      var d = 0,
        a = 0,
        b = this._handlers[c];
      if (b) {
        for (a = b.length; d < a; d += 1) {
          if (b[d] === e) {
            b.splice(d, 1);
            return;
          }
        }
      }
    },
  };
})();
TLT.ModuleContext = (function () {
  var a = [
    "broadcast",
    "getConfig:getModuleConfig",
    "listen",
    "post",
    "getXPathFromNode",
    "performDOMCapture",
    "performFormCompletion",
    "isInitialized",
    "getStartTime",
    "normalizeUrl",
    "getCurrentOffset",
    "getTabId",
    "setSessionCookieInfo",
  ];
  return function (f, d) {
    var h = {},
      g,
      b,
      j = null,
      e = null,
      c = null;
    for (g = 0, b = a.length; g < b; g += 1) {
      j = a[g].split(":");
      if (j.length > 1) {
        c = j[0];
        e = j[1];
      } else {
        c = j[0];
        e = j[0];
      }
      h[c] = (function (i) {
        return function () {
          var k = d.utils.convertToArray(arguments);
          k.unshift(f);
          return d[i].apply(d, k);
        };
      })(e);
    }
    h.utils = d.utils;
    return h;
  };
})();
TLT.addService("config", function (a) {
  function d(f, e) {
    a.utils.extend(true, f, e);
    c.publish("configupdated", c.getConfig());
  }
  var b = { core: {}, modules: {}, services: {} },
    c = a.utils.extend(false, a.utils.createObject(new TLT.EventTarget()), {
      getConfig: function () {
        return b;
      },
      updateConfig: function (e) {
        d(b, e);
      },
      getCoreConfig: function () {
        return b.core;
      },
      updateCoreConfig: function (e) {
        d(b.core, e);
      },
      getServiceConfig: function (e) {
        return b.services[e] || {};
      },
      updateServiceConfig: function (f, e) {
        if (typeof b.services[f] === "undefined") {
          b.services[f] = {};
        }
        d(b.services[f], e);
      },
      getModuleConfig: function (e) {
        return b.modules[e] || {};
      },
      updateModuleConfig: function (f, e) {
        if (typeof b.modules[f] === "undefined") {
          b.modules[f] = {};
        }
        d(b.modules[f], e);
      },
      destroy: function () {
        b = { core: {}, modules: {}, services: {} };
      },
    });
  return c;
});
TLT.addService("queue", function (r) {
  var M = r.utils,
    k = null,
    i = {},
    G = 600000,
    p = r.getService("ajax"),
    c = r.getService("browser"),
    e = r.getService("encoder"),
    v = r.getService("serializer"),
    E = r.getService("config"),
    s = r.getService("message"),
    A = null,
    m = {},
    J = true,
    h = true,
    z = { 5: { limit: 300, count: 0 }, 6: { limit: 400, count: 0 } },
    d = [],
    C = false,
    q = true,
    I = true,
    u = (function () {
      var S = {};
      function V(W) {
        return typeof S[W] !== "undefined";
      }
      function O(W, X) {
        if (!V(W)) {
          S[W] = {
            lastOffset: 0,
            data: [],
            queueId: W,
            url: X.url,
            eventThreshold: X.eventThreshold,
            sizeThreshold: X.sizeThreshold || 0,
            timerInterval: X.timerInterval,
            size: -1,
            serializer: X.serializer,
            encoder: X.encoder,
            crossDomainEnabled: !!X.crossDomainEnabled,
            crossDomainIFrame: X.crossDomainIFrame,
          };
        }
        return S[W];
      }
      function Q(W) {
        if (V(W)) {
          delete S[W];
        }
      }
      function T(W) {
        if (V(W)) {
          return S[W];
        }
        return null;
      }
      function R(X) {
        var W = T(X);
        if (W !== null) {
          W.data = [];
        }
      }
      function U(W) {
        var X = null;
        if (V(W)) {
          X = T(W).data;
          R(W);
        }
        return X;
      }
      function P(Y, aa) {
        var W = null,
          Z = null,
          ac = window.tlBridge,
          X = window.iOSJSONShuttle;
        try {
          Z = v.serialize(aa);
        } catch (ab) {
          Z =
            "Serialization failed: " +
            (ab.name ? ab.name + " - " : "") +
            ab.message;
          aa = { error: Z };
        }
        if (typeof ac !== "undefined" && typeof ac.addMessage === "function") {
          ac.addMessage(Z);
        } else {
          if (typeof X !== "undefined" && typeof X === "function") {
            X(Z);
          } else {
            if (V(Y)) {
              W = T(Y);
              W.data.push(aa);
              W.data = r.redirectQueue(W.data);
              if (W.sizeThreshold) {
                Z = v.serialize(W.data);
                W.size = Z.length;
              }
              return W.data.length;
            }
          }
        }
        return 0;
      }
      return {
        exists: V,
        add: O,
        remove: Q,
        reset: function () {
          S = {};
        },
        get: T,
        clear: R,
        flush: U,
        push: P,
      };
    })();
  function n(O) {
    if (q) {
      I = true;
    }
    if (O && O.id) {
      M.extend(true, d[O.id - 1], {
        rspEnd: s.getCurrentOffset(),
        success: O.success,
        statusCode: O.statusCode,
        statusText: O.statusText,
      });
    }
  }
  function x() {
    var O = M.getOriginAndPath(window.location);
    return r.normalizeUrl("", O.path);
  }
  function B(Q, U, R, T) {
    var O = u.get(Q),
      S = { name: U, value: R },
      P = null;
    if (typeof U !== "string" || typeof R !== "string") {
      return;
    }
    if (!O.headers) {
      O.headers = { once: [], always: [] };
    }
    P = !!T ? O.headers.always : O.headers.once;
    P.push(S);
  }
  function g(Q, T) {
    var S,
      P,
      O = u.get(Q),
      U = O.headers,
      R = null;
    T = T || {};
    function V(W, Z) {
      var Y,
        X,
        aa = null;
      for (Y = 0, X = W.length; Y < X; Y += 1) {
        aa = W[Y];
        Z[aa.name] = aa.value;
      }
    }
    if (U) {
      R = [U.always, U.once];
      for (S = 0, P = R.length; S < P; S += 1) {
        V(R[S], T);
      }
    }
    return T;
  }
  function o(P) {
    var O = null,
      Q = null;
    if (!u.exists(P)) {
      throw new Error("Queue: " + P + " does not exist!");
    }
    O = u.get(P);
    Q = O ? O.headers : null;
    if (Q) {
      Q.once = [];
    }
  }
  function l() {
    var P = 0,
      O,
      R,
      Q = r.provideRequestHeaders();
    if (Q && Q.length) {
      for (P = 0, O = Q.length; P < O; P += 1) {
        R = Q[P];
        B("DEFAULT", R.name, R.value, R.recurring);
      }
    }
    return P;
  }
  function L(S) {
    var R,
      O,
      Q = [],
      P = "";
    if (!S || !S.length) {
      return P;
    }
    for (R = 0, O = S.length; R < O; R += 1) {
      Q[S[R].type] = true;
    }
    for (R = 0, O = Q.length; R < O; R += 1) {
      if (Q[R]) {
        if (P) {
          P += ",";
        }
        P += R;
      }
    }
    return P;
  }
  function j(af, U) {
    var Y = u.get(af),
      ah = Y.url ? u.flush(af) : null,
      R = ah ? ah.length : 0,
      T = {
        "Content-Type": "application/json",
        "X-PageId": r.getPageId(),
        "X-Tealeaf": "device (UIC) Lib/6.1.0.1989",
        "X-TealeafType": "GUI",
        "X-TeaLeaf-Page-Url": x(),
        "X-Tealeaf-SyncXHR": (!!U).toString(),
      },
      S = null,
      O = s.getCurrentOffset(),
      ad = Y.serializer || "json",
      P = Y.encoder,
      ab,
      V,
      X,
      W = k.tltWorker,
      ag = r.getState() === "unloading",
      aa = M.getOriginAndPath().origin,
      Q = r.isCrossOrigin(Y.url, aa),
      Z,
      ae = null;
    if (!R || !Y) {
      return;
    }
    X = O - ah[R - 1].offset;
    if (G && X > G + 60000) {
      return;
    }
    I = false;
    Y.lastOffset = ah[R - 1].offset;
    T["X-Tealeaf-MessageTypes"] = L(ah);
    ah = s.wrapMessages(ah);
    S = ah.serialNumber;
    d[S - 1] = { serialNumber: S, reqStart: O };
    ah.log = { requests: d };
    if (k.endpointCheckFailed) {
      ah.log.endpointCheckFailed = true;
    }
    l();
    g(af, T);
    if (W && !(U || ag)) {
      W.onmessage = function (aj) {
        var ai;
        ai = aj.data;
        n(ai);
      };
      Z = {
        id: S,
        url: Y.url,
        headers: T,
        data: ah,
        isUnloading: ag,
        isCrossOrigin: Q,
      };
      W.postMessage(Z);
    } else {
      if (ad) {
        ah = v.serialize(ah, ad);
      }
      if (P) {
        V = e.encode(ah, P);
        if (V) {
          if (V.data && !V.error) {
            if (!(V.data instanceof window.ArrayBuffer)) {
              V.error = "Encoder did not apply " + P + " encoding.";
            } else {
              if (V.data.byteLength < ah.length) {
                ah = V.data;
                T["Content-Encoding"] = V.encoding;
              } else {
                V.error =
                  P +
                  " encoder did not reduce payload (" +
                  V.data.byteLength +
                  ") compared to original data (" +
                  ah.length +
                  ")";
              }
            }
          }
          if (V.error) {
            r.logExceptionEvent("EncoderError: " + V.error, "UIC", -1);
          }
        }
      }
      if (Y.crossDomainEnabled) {
        ae = M.getIFrameWindow(Y.crossDomainIFrame);
        if (!ae) {
          return;
        }
        ab = {
          request: { id: S, url: Y.url, async: !U, headers: T, data: ah },
        };
        if (typeof window.postMessage === "function") {
          ae.postMessage(ab, Y.crossDomainIFrame.src);
        } else {
          try {
            ae.sendMessage(ab);
          } catch (ac) {
            return;
          }
        }
        I = true;
      } else {
        p.sendRequest({
          id: S,
          oncomplete: n,
          url: Y.url,
          async: !U,
          isUnloading: ag,
          isCrossOrigin: Q,
          headers: T,
          data: ah,
        });
      }
    }
    o(af);
  }
  function K(R) {
    var O = null,
      Q = k.queues,
      P;
    for (P = 0; P < Q.length; P += 1) {
      O = Q[P];
      j(O.qid, R);
    }
    return true;
  }
  function N(R, T) {
    var Q,
      P,
      U = s.createMessage(T),
      O = u.get(R),
      S,
      V;
    P = O.data.length;
    if (P) {
      V = U.offset - O.data[P - 1].offset;
      if (G && V > G) {
        r.setAutoFlush(false);
        r.destroy(false, "inactivity(2)");
        return;
      }
    }
    P = u.push(R, U);
    S = O.size;
    if (q && !I) {
      return;
    }
    if (
      (P >= O.eventThreshold || S >= O.sizeThreshold) &&
      J &&
      r.getState() !== "unloading"
    ) {
      Q = r.getCurrentWebEvent();
      if (Q.type === "click" && !k.ddfoc) {
        if (h) {
          h = false;
          window.setTimeout(function () {
            if (u.exists(R)) {
              j(R);
              h = true;
            }
          }, 500);
        }
      } else {
        j(R);
      }
    }
  }
  function a(Q) {
    var O,
      P = false;
    if (!Q || !Q.type) {
      return true;
    }
    O = z[Q.type];
    if (O) {
      O.count += 1;
      if (O.count > O.limit) {
        P = true;
        if (O.count === O.limit + 1) {
          N("DEFAULT", {
            type: 16,
            dataLimit: { messageType: Q.type, maxCount: O.limit },
          });
        }
      }
    }
    return P;
  }
  function H(Q) {
    var S,
      P,
      O = null,
      T = k.queues,
      R = "",
      V,
      U;
    for (S = 0, V = T.length; S < V; S += 1) {
      O = T[S];
      if (O && O.modules) {
        for (P = 0, U = O.modules.length; P < U; P += 1) {
          R = O.modules[P];
          if (R === Q) {
            return O.qid;
          }
        }
      }
    }
    return A.qid;
  }
  function y(Q, O) {
    m[Q] = window.setTimeout(function P() {
      if (J && (!q || (q && I))) {
        j(Q);
      }
      m[Q] = window.setTimeout(P, O);
    }, O);
  }
  function f(P) {
    var O = false;
    if (P && m[P]) {
      window.clearTimeout(m[P]);
      delete m[P];
      O = true;
    }
    return O;
  }
  function w() {
    var O = 0;
    for (O in m) {
      if (m.hasOwnProperty(O)) {
        f(O);
      }
    }
    m = {};
  }
  function b(P) {
    var O;
    if (!P) {
      return;
    }
    if (f(P)) {
      O = u.get(P);
      if (O.timerInterval) {
        y(P, O.timerInterval);
      }
    }
  }
  function F(O) {}
  function t(O) {
    k = O;
    i = r.getCoreConfig();
    G = M.getValue(i, "inactivityTimeout", 600000);
    q = M.getValue(k, "serializePost", true);
    M.forEach(k.queues, function (P, Q) {
      var R = null;
      if (P.qid === "DEFAULT") {
        A = P;
      }
      if (P.crossDomainEnabled) {
        R = c.query(P.crossDomainFrameSelector);
        if (!R) {
          r.fail("Cross domain iframe not found");
        }
      }
      u.add(P.qid, {
        url: P.endpoint,
        eventThreshold: P.maxEvents,
        sizeThreshold: P.maxSize || 0,
        serializer: P.serializer,
        encoder: P.encoder,
        timerInterval: P.timerInterval || 0,
        crossDomainEnabled: P.crossDomainEnabled || false,
        crossDomainIFrame: R,
      });
      if (typeof P.timerInterval !== "undefined" && P.timerInterval > 0) {
        y(P.qid, P.timerInterval);
      }
    });
    E.subscribe("configupdated", F);
    C = true;
  }
  function D() {
    if (J) {
      K(!k.asyncReqOnUnload);
    }
    E.unsubscribe("configupdated", F);
    w();
    u.reset();
    k = null;
    A = null;
    C = false;
  }
  return {
    init: function () {
      if (!C) {
        t(E.getServiceConfig("queue") || {});
      } else {
      }
    },
    destroy: function () {
      D();
    },
    _getQueue: function (O) {
      return u.get(O).data;
    },
    setAutoFlush: function (O) {
      if (O === true) {
        J = true;
      } else {
        J = false;
      }
    },
    flush: function (O) {
      O = O || A.qid;
      if (!u.exists(O)) {
        throw new Error("Queue: " + O + " does not exist!");
      }
      j(O);
    },
    flushAll: function (O) {
      return K(!!O);
    },
    post: function (P, Q, O) {
      if (!r.isInitialized()) {
        return;
      }
      O = O || H(P);
      if (!u.exists(O)) {
        return;
      }
      if (!a(Q)) {
        N(O, Q);
      }
    },
    resetFlushTimer: function (O) {
      O = O || A.qid;
      if (!u.exists(O)) {
        return;
      }
      b(O);
    },
  };
});
TLT.addService("browserBase", function (s) {
  var h,
    M = s.utils,
    j = { optgroup: true, option: true, nobr: true },
    q = {},
    f,
    n = null,
    B,
    x,
    g,
    d,
    r,
    G = false;
  function t() {
    f = s.getService("config");
    n = s.getService("serializer");
    B = f ? f.getServiceConfig("browser") : {};
    x = B.blacklist || [];
    g = B.customid || [];
    d = M.getValue(B, "normalizeTargetToParentLink", true);
  }
  function b() {
    t();
    if (f) {
      f.subscribe("configupdated", t);
    }
    G = true;
  }
  function H() {
    if (f) {
      f.unsubscribe("configupdated", t);
    }
    G = false;
  }
  function w(P, R) {
    var O, N, Q;
    if (!P) {
      return null;
    }
    if (typeof R !== "undefined") {
      Q = R;
    } else {
      Q = P.id;
    }
    if (!Q || typeof Q !== "string") {
      return null;
    }
    for (O = 0, N = x.length; O < N; O += 1) {
      if (typeof x[O] === "string") {
        if (Q === x[O]) {
          return null;
        }
      } else {
        if (typeof x[O] === "object") {
          if (!x[O].cRegex) {
            x[O].cRegex = new RegExp(x[O].regex, x[O].flags);
          }
          x[O].cRegex.lastIndex = 0;
          if (x[O].cRegex.test(Q)) {
            return null;
          }
        }
      }
    }
    return Q;
  }
  function p(P, Q) {
    var N = { type: null, subType: null },
      O;
    if (!P) {
      return N;
    }
    O = P.type;
    switch (O) {
      case "focusin":
        O = "focus";
        break;
      case "focusout":
        O = "blur";
        break;
      default:
        break;
    }
    N.type = O;
    return N;
  }
  function z(O) {
    var N = { type: null, subType: null };
    if (!O) {
      return N;
    }
    N.type = M.getTagName(O);
    N.subType = O.type || null;
    return N;
  }
  function c(N, P, O) {
    var T = { HTML_ID: "-1", XPATH_ID: "-2", ATTRIBUTE_ID: "-3" },
      S,
      Q = null,
      R;
    if (!N || !P) {
      return Q;
    }
    S = O || window.document;
    P = P.toString();
    if (P === T.HTML_ID) {
      if (S.getElementById) {
        Q = S.getElementById(N);
      } else {
        if (S.querySelector) {
          Q = S.querySelector("#" + N);
        }
      }
    } else {
      if (P === T.ATTRIBUTE_ID) {
        R = N.split("=");
        if (S.querySelector) {
          Q = S.querySelector("[" + R[0] + '="' + R[1] + '"]');
        }
      } else {
        if (P === T.XPATH_ID) {
          Q = q.xpath(N, S);
        }
      }
    }
    return Q;
  }
  r = (function () {
    var N = { nobr: true };
    return function (V, S, aa, P) {
      var W,
        ad = document.documentElement,
        R,
        ac = null,
        U = null,
        Z = null,
        ab = [],
        O,
        Y = true,
        T = s._getLocalTop(),
        Q = "",
        X = false,
        ae;
      if (!V || !V.nodeType) {
        return ab;
      }
      if (V.nodeType === 11) {
        V = V.host;
        if (V) {
          X = true;
        } else {
          return ab;
        }
      }
      while (Y) {
        Y = false;
        Q = M.getTagName(V);
        if (Q === "window") {
          continue;
        }
        if (Q && !X) {
          if (N[Q]) {
            V = V.parentNode;
            Y = true;
            continue;
          }
        }
        for (
          R = w(V, P);
          V &&
          (V.nodeType === 1 || V.nodeType === 9) &&
          V !== document &&
          (S || !R);
          R = w(V)
        ) {
          Z = V.parentNode;
          if (!Z) {
            U = M.getWindow(V);
            if (!U || aa) {
              O = [Q, 0];
              ab[ab.length] = O;
              return ab.reverse();
            }
            if (U === T) {
              return ab.reverse();
            }
            V = U.frameElement;
            Q = M.getTagName(V);
            Z = V.parentNode;
            continue;
          }
          ac = Z.firstChild;
          if (!ac) {
            ab.push(["XPath Error(1)"]);
            V = null;
            break;
          }
          for (W = 0; ac; ac = ac.nextSibling) {
            if (ac.nodeType === 1 && M.getTagName(ac) === Q) {
              if (ac === V) {
                O = [Q, W];
                if (X) {
                  O.push("h");
                  X = false;
                }
                ab[ab.length] = O;
                break;
              }
              W += 1;
            }
          }
          if (Z.nodeType === 11) {
            V = Z.host;
            X = true;
          } else {
            V = Z;
          }
          Q = M.getTagName(V);
        }
        if (R && !S) {
          O = [R];
          if (X) {
            O.push("h");
            X = false;
          }
          ab[ab.length] = O;
          if (M.isIFrameDescendant(V)) {
            Y = true;
            V = M.getWindow(V).frameElement;
          } else {
            if (!aa && !ad.contains(V)) {
              if (V.getRootNode) {
                ae = V.getRootNode();
                if (ae) {
                  V = ae.host;
                  X = true;
                  Y = true;
                }
              }
            }
          }
        }
        P = undefined;
      }
      return ab.reverse();
    };
  })();
  function D(N) {
    var O = "null";
    if (!N || !N.length) {
      return O;
    }
    O = n.serialize(N, "json");
    return O;
  }
  function v(Q, O, S, P) {
    var R, N;
    N = r(Q, !!O, !!P);
    if (S) {
      R = N;
    } else {
      R = D(N);
    }
    return R;
  }
  function L(O) {
    var P = { left: -1, top: -1 },
      N;
    O = O || document;
    N = O.documentElement || O.body.parentNode || O.body;
    P.left = Math.round(
      typeof window.pageXOffset === "number" ? window.pageXOffset : N.scrollLeft
    );
    P.top = Math.round(
      typeof window.pageYOffset === "number" ? window.pageYOffset : N.scrollTop
    );
    return P;
  }
  function K(N) {
    return (
      N &&
      typeof N.originalEvent !== "undefined" &&
      typeof N.isDefaultPrevented !== "undefined" &&
      !N.isSimulated
    );
  }
  function k(N) {
    if (!N) {
      return null;
    }
    if (N.type && N.type.indexOf("touch") === 0) {
      if (K(N)) {
        N = N.originalEvent;
      }
      if (N.type === "touchstart") {
        N = N.touches[N.touches.length - 1];
      } else {
        if (N.type === "touchend") {
          N = N.changedTouches[0];
        }
      }
    }
    return N;
  }
  function u(O) {
    var T = O || window.event,
      R,
      U = document.documentElement,
      S = document.body,
      V = false,
      N = null,
      P,
      Q;
    if (K(T)) {
      T = T.originalEvent;
    }
    if (typeof O === "undefined" || typeof T.target === "undefined") {
      T.target = T.srcElement || window.window;
      T.timeStamp = Number(new Date());
      if (T.pageX === null || typeof T.pageX === "undefined") {
        T.pageX =
          T.clientX +
          ((U && U.scrollLeft) || (S && S.scrollLeft) || 0) -
          ((U && U.clientLeft) || (S && S.clientLeft) || 0);
        T.pageY =
          T.clientY +
          ((U && U.scrollTop) || (S && S.scrollTop) || 0) -
          ((U && U.clientTop) || (S && S.clientTop) || 0);
      }
      T.preventDefault = function () {
        this.returnValue = false;
      };
      T.stopPropagation = function () {
        this.cancelBubble = true;
      };
    }
    if (T.type === "click") {
      R = T.composedPath ? T.composedPath() : [];
      for (Q = 0; Q < R.length; Q += 1) {
        P = M.getTagName(R[Q]);
        if (P === "button") {
          V = true;
          N = R[Q];
          break;
        }
      }
      if (V) {
        return {
          originalEvent: T,
          target: N,
          srcElement: N,
          type: T.type,
          pageX: T.pageX,
          pageY: T.pageY,
        };
      }
    }
    return T;
  }
  function y(P) {
    var O,
      N,
      Q,
      R = null;
    if (!P || !P.type) {
      return null;
    }
    if (P.type.indexOf("touch") === 0) {
      R = k(P).target;
    } else {
      if (typeof P.composedPath === "function") {
        Q = P.composedPath();
        if (Q && Q.length) {
          R = Q[0];
          if (d) {
            for (O = 0, N = Q.length; O < N; O += 1) {
              if (M.getTagName(Q[O]) === "a") {
                R = Q[O];
                break;
              }
            }
          }
        } else {
          R = P.target || window.window;
        }
      } else {
        if (P.srcElement) {
          R = P.srcElement;
        } else {
          R = P.target;
        }
      }
    }
    while (R && j[M.getTagName(R)]) {
      if (R.parentElement) {
        R = R.parentElement;
      } else {
        break;
      }
    }
    if (R.nodeType === 9 && R.documentElement) {
      R = R.documentElement;
    }
    return R;
  }
  function J(O) {
    var R = 0,
      Q = 0,
      P = document.documentElement,
      N = document.body;
    O = k(O);
    if (O) {
      if (O.pageX || O.pageY) {
        R = O.pageX;
        Q = O.pageY;
      } else {
        if (O.clientX || O.clientY) {
          R =
            O.clientX +
            (P ? P.scrollLeft : N ? N.scrollLeft : 0) -
            (P ? P.clientLeft : N ? N.clientLeft : 0);
          Q =
            O.clientY +
            (P ? P.scrollTop : N ? N.scrollTop : 0) -
            (P ? P.clientTop : N ? N.clientTop : 0);
        }
      }
    }
    return { x: R, y: Q };
  }
  q.xpath = function (V, X) {
    var T = null,
      O,
      U = null,
      Y = false,
      N,
      R,
      Q,
      P,
      S,
      W;
    if (!V) {
      return null;
    }
    T = n.parse(V);
    X = X || document;
    O = X;
    if (!T) {
      return null;
    }
    for (R = 0, S = T.length; R < S && O; R += 1) {
      U = T[R];
      Y = U.length > 1 && U[U.length - 1] === "h";
      if (U.length === 1 || (U.length === 2 && Y)) {
        if (X.getElementById) {
          O = X.getElementById(U[0]);
        } else {
          if (X.querySelector) {
            O = X.querySelector("#" + U[0]);
          } else {
            O = null;
          }
        }
      } else {
        for (Q = 0, P = -1, W = O.childNodes.length; Q < W; Q += 1) {
          if (
            O.childNodes[Q].nodeType === 1 &&
            M.getTagName(O.childNodes[Q]) === U[0].toLowerCase()
          ) {
            P += 1;
            if (P === U[1]) {
              O = O.childNodes[Q];
              break;
            }
          }
        }
        if (P !== U[1]) {
          return null;
        }
      }
      if (!O) {
        return null;
      }
      if (Y) {
        if (R < S - 1) {
          if (!O.shadowRoot) {
            return null;
          }
          O = O.shadowRoot;
          X = O;
        }
      }
      N = M.getTagName(O);
      if ((N === "frame" || N === "iframe") && R < S - 1) {
        O = M.getIFrameWindow(O).document;
        X = O;
      }
    }
    return O === X || !O ? null : O;
  };
  function m(N, O) {
    this.x = Math.round(N || 0);
    this.y = Math.round(O || 0);
  }
  function a(O, N) {
    this.width = Math.round(O || 0);
    this.height = Math.round(N || 0);
  }
  function e(O, P) {
    var R, N, Q;
    P = y(O);
    R = this.examineID(P);
    N = z(P);
    Q = this.examinePosition(O, P);
    this.element = P;
    this.id = R.id;
    this.idType = R.idType;
    this.type = N.type;
    this.subType = N.subType;
    this.state = this.examineState(P);
    this.position = new m(Q.x, Q.y);
    this.position.relXY = Q.relXY;
    this.size = new a(Q.width, Q.height);
    this.xPath = R.xPath;
    this.name = R.name;
  }
  e.HTML_ID = -1;
  e.XPATH_ID = -2;
  e.ATTRIBUTE_ID = -3;
  e.prototype.examineID = function (U, P) {
    var S = { id: "", idType: 0, xPath: "", name: "" },
      O = g.length,
      R,
      N,
      Q = document.documentElement;
    if (!U) {
      return S;
    }
    S.xPath = v(U, false, false, P);
    S.name = U.name;
    try {
      N = typeof Q.contains === "function" ? Q.contains(U) : true;
      if ((P || N) && (!M.getWindow(U) || !M.isIFrameDescendant(U))) {
        if (w(U)) {
          S.id = U.id;
          S.idType = e.HTML_ID;
        } else {
          if (g.length && U.attributes) {
            while (O) {
              O -= 1;
              R = U.attributes[g[O]];
              if (typeof R !== "undefined") {
                S.id = g[O] + "=" + (R.value || R);
                S.idType = e.ATTRIBUTE_ID;
              }
            }
          }
        }
      }
    } catch (T) {}
    if (!S.id) {
      S.id = S.xPath;
      if (S.id !== "null") {
        S.idType = e.XPATH_ID;
      }
    }
    return S;
  };
  e.prototype.examineState = function (N) {
    return M.getTargetState(N);
  };
  function F() {
    var O = 1,
      P,
      R,
      N;
    if (document.body.getBoundingClientRect) {
      try {
        P = document.body.getBoundingClientRect();
      } catch (Q) {
        return O;
      }
      R = P.right - P.left;
      N = document.body.offsetWidth;
      O = Math.round((R / N) * 100) / 100;
    }
    return O;
  }
  function o(O) {
    var Q, N, P, S;
    if (!O || !O.getBoundingClientRect) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    try {
      Q = O.getBoundingClientRect();
      S = L(document);
    } catch (R) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    N = {
      x: Q.left + S.left,
      y: Q.top + S.top,
      width: Q.right - Q.left,
      height: Q.bottom - Q.top,
    };
    if (M.isIE) {
      N.x -= document.documentElement.clientLeft;
      N.y -= document.documentElement.clientTop;
      P = F();
      if (P !== 1) {
        N.x = Math.round(N.x / P);
        N.y = Math.round(N.y / P);
        N.width = Math.round(N.width / P);
        N.height = Math.round(N.height / P);
      }
    }
    return N;
  }
  e.prototype.examinePosition = function (O, P) {
    var Q = J(O),
      N = o(P);
    N.x = Q.x || Q.y ? Math.round(Math.abs(Q.x - N.x)) : N.width / 2;
    N.y = Q.x || Q.y ? Math.round(Math.abs(Q.y - N.y)) : N.height / 2;
    N.relXY = M.calculateRelativeXY(N);
    return N;
  };
  function I() {
    var N = M.getOrientationAngle();
    if (M.isLandscapeZeroDegrees) {
      if (Math.abs(N) === 180 || Math.abs(N) === 0) {
        N = 90;
      } else {
        if (Math.abs(N) === 90 || Math.abs(N) === 270) {
          N = 0;
        }
      }
    }
    return N;
  }
  function C(T) {
    var Q, N, S, R, P, O;
    if (T) {
      return T;
    }
    S = s.getCoreConfig() || {};
    P = S.modules;
    T = {};
    for (O in P) {
      if (P.hasOwnProperty(O) && P[O].events) {
        for (Q = 0, N = P[O].events.length; Q < N; Q += 1) {
          R = P[O].events[Q];
          if (R.state) {
            T[R.name] = R.state;
          }
        }
      }
    }
    return T;
  }
  function i(N) {
    var O;
    h = C(h);
    if (h[N.type]) {
      O = M.getValue(N, h[N.type], null);
    }
    return O;
  }
  function l(O) {
    var Q, N, P;
    this.data = O.data || null;
    this.delegateTarget = O.delegateTarget || null;
    if (O.gesture || (O.originalEvent && O.originalEvent.gesture)) {
      this.gesture = O.gesture || O.originalEvent.gesture;
      this.gesture.idType = new e(this.gesture, this.gesture.target).idType;
    }
    O = u(O);
    Q = J(O);
    this.custom = false;
    this.nativeEvent = this.custom === true ? null : O;
    this.position = new m(Q.x, Q.y);
    this.target = new e(O, O.target);
    this.orientation = I();
    P = i(O);
    if (P) {
      this.target.state = P;
    }
    this.timestamp = new Date().getTime();
    N = p(O, this.target);
    this.type = N.type;
    this.subType = N.subType;
  }
  function E(N) {
    if (s.isInitialized()) {
      s._publishEvent(new l(N));
    } else {
    }
  }
  function A(S, R, T) {
    var O = [],
      N,
      Q,
      P = [];
    if (!(this instanceof A)) {
      return null;
    }
    if (typeof S !== "object" || !S.nodeType) {
      this.fullXpath = "";
      this.xpath = "";
      this.fullXpathList = [];
      this.xpathList = [];
      return;
    }
    if (S.nodeType === 3) {
      S = S.parentElement;
    }
    P = r(S, false, R, T);
    N = P[0];
    if (P.length && (N.length === 1 || (N.length === 2 && N[1] === "h"))) {
      O = r(S, true, R);
    } else {
      O = M.clone(P);
    }
    this.xpath = D(P);
    this.xpathList = P;
    this.fullXpath = D(O);
    this.fullXpathList = O;
    Q = O[O.length - 1];
    this.isShadowHost = Q ? Q[Q.length - 1] === "h" : false;
    this.applyPrefix = function (W) {
      var U, V;
      if (!(W instanceof A) || !W.fullXpathList.length) {
        return;
      }
      V = W.fullXpathList[W.fullXpathList.length - 1];
      U = this.fullXpathList.shift();
      if (M.isEqual(U[0], V[0])) {
        this.fullXpathList = W.fullXpathList.concat(this.fullXpathList);
      } else {
        this.fullXpathList.unshift(U);
        return;
      }
      this.fullXpath = D(this.fullXpathList);
      U = this.xpathList.shift();
      if (U.length === 1) {
        this.xpathList.unshift(U);
        return;
      }
      this.xpathList = W.xpathList.concat(this.xpathList);
      this.xpath = D(this.xpathList);
    };
    this.compare = function (U) {
      if (!(U instanceof A)) {
        return 0;
      }
      return this.fullXpathList.length - U.fullXpathList.length;
    };
    this.isSame = function (U) {
      var V = false;
      if (!(U instanceof A)) {
        return V;
      }
      if (this.compare(U) === 0) {
        V = this.fullXpath === U.fullXpath;
      }
      return V;
    };
    this.containedIn = function (W, V) {
      var Y, X, U, Z;
      if (!(W instanceof A)) {
        return false;
      }
      if (W.fullXpathList.length > this.fullXpathList.length) {
        return false;
      }
      for (Y = 0, U = W.fullXpathList.length; Y < U; Y += 1) {
        if (!M.isEqual(W.fullXpathList[Y], this.fullXpathList[Y])) {
          return false;
        }
      }
      if (!V) {
        for (X = Y, U = this.fullXpathList.length; X < U; X += 1) {
          Z = this.fullXpathList[X];
          if (Z[Z.length - 1] === "h") {
            return false;
          }
        }
      }
      return true;
    };
  }
  A.prototype = (function () {
    return {};
  })();
  return {
    init: function () {
      if (!G) {
        b();
      } else {
      }
    },
    destroy: function () {
      H();
    },
    WebEvent: l,
    ElementData: e,
    Xpath: A,
    processDOMEvent: E,
    getNormalizedOrientation: I,
    getXPathFromNode: function (O, Q, N, R, P) {
      return v(Q, N, R, P);
    },
    getNodeFromID: c,
    queryDom: q,
  };
});
TLT.addService("browser", function (f) {
  var o = f.utils,
    j = f.getService("config"),
    h = f.getService("browserBase"),
    i = null,
    e = null,
    m = j ? j.getServiceConfig("browser") : {},
    d = o.getValue(m, "useCapture", true),
    c = o.getValue(m, "usePassive", true),
    n = false,
    g = { NO_QUERY_SELECTOR: "NOQUERYSELECTOR" },
    q = function (r) {
      return function (t) {
        var s = new h.WebEvent(t);
        if (t.type === "resize" || t.type === "hashchange") {
          setTimeout(function () {
            r(s);
          }, 5);
        } else {
          r(s);
        }
      };
    },
    b = {
      list2Array: function (t) {
        var s = t.length,
          r = [],
          u;
        if (typeof t.length === "undefined") {
          return [t];
        }
        for (u = 0; u < s; u += 1) {
          r[u] = t[u];
        }
        return r;
      },
      find: function (t, s, r) {
        r = r || "css";
        return this.list2Array(this[r](t, s));
      },
      css: function (s, r) {
        r = r || document;
        return r.querySelectorAll(s);
      },
    },
    p = (function () {
      var r = new o.WeakMap();
      return {
        add: function (s) {
          var t = r.get(s) || [q(s), 0];
          t[1] += 1;
          r.set(s, t);
          return t[0];
        },
        find: function (s) {
          var t = r.get(s);
          return t ? t[0] : null;
        },
        remove: function (s) {
          var t = r.get(s);
          if (t) {
            t[1] -= 1;
            if (t[1] <= 0) {
              r.remove(s);
            }
          }
        },
      };
    })();
  function l() {
    if (!document.querySelectorAll) {
      f.fail("querySelectorAll does not exist!", g.NO_QUERY_SELECTOR);
    }
  }
  function a(s) {
    var r = { capture: d, passive: c };
    if (o.isIE) {
      return d;
    }
    return o.mixin(r, s);
  }
  function k() {
    b.xpath = h.queryDom.xpath;
    l();
    if (typeof document.addEventListener === "function") {
      i = function (u, r, t, s) {
        s = a(s);
        u.addEventListener(r, t, s);
      };
      e = function (u, r, t, s) {
        s = a(s);
        u.removeEventListener(r, t, s);
      };
    } else {
      if (typeof document.attachEvent !== "undefined") {
        i = function (t, r, s) {
          t.attachEvent("on" + r, s);
        };
        e = function (t, r, s) {
          t.detachEvent("on" + r, s);
        };
      } else {
        throw new Error("Unsupported browser");
      }
    }
    n = true;
  }
  return {
    init: function () {
      if (!n) {
        k();
      } else {
      }
    },
    destroy: function () {
      n = false;
    },
    getServiceName: function () {
      return "W3C";
    },
    query: function (u, s, r) {
      try {
        return b.find(u, s, r)[0] || null;
      } catch (t) {
        return [];
      }
    },
    queryAll: function (u, s, r) {
      try {
        return b.find(u, s, r);
      } catch (t) {
        return [];
      }
    },
    subscribe: function (r, v, t, s) {
      var u = p.add(t);
      i(v, r, u, s);
    },
    unsubscribe: function (r, w, t, s) {
      var u = p.find(t);
      if (u) {
        try {
          e(w, r, u, s);
        } catch (v) {}
        p.remove(t);
      }
    },
  };
});
TLT.addService("ajax", function (e) {
  var k = e.utils,
    i,
    m = false,
    b = false,
    j = false;
  function g(p) {
    var o = "",
      n = [];
    for (o in p) {
      if (p.hasOwnProperty(o)) {
        n.push([o, p[o]]);
      }
    }
    return n;
  }
  function h(p) {
    var o = "",
      n = "?";
    for (o in p) {
      if (p.hasOwnProperty(o)) {
        n += encodeURIComponent(o) + "=" + encodeURIComponent(p[o]) + "&";
      }
    }
    return n.slice(0, -1);
  }
  function l(n) {
    var p,
      q = false,
      o = h(n.headers);
    if (typeof n.data === "string") {
      p = n.data;
    } else {
      p = n.data ? new Uint8Array(n.data) : "";
    }
    q = navigator.sendBeacon(n.url + o, p);
    return q;
  }
  function f(o) {
    var r = o.headers || {},
      q = o.id || 0,
      p = {
        method: o.type,
        headers: r,
        body: o.data,
        mode: o.isCrossOrigin ? "cors" : "same-origin",
        credentials: o.isCrossOrigin ? "omit" : "same-origin",
        keepalive: !o.isCrossOrigin && o.isUnloading,
        cache: "no-store",
      },
      n = o.oncomplete || function () {};
    r["X-Requested-With"] = "fetch";
    window
      .fetch(o.url, p)
      .then(function (t) {
        var s = {
          success: t.ok,
          statusCode: t.status,
          statusText: t.statusText,
          id: q,
        };
        if (s.success) {
          t.text()
            .then(function (u) {
              try {
                s.data = JSON.parse(u);
              } catch (v) {
                s.data = u;
              }
              n(s);
            })
            ["catch"](function (u) {
              s.statusCode = 1;
              s.statusText = u.message;
              n(s);
            });
        } else {
          n(s);
        }
      })
      ["catch"](function (t) {
        var s = { success: false, statusCode: 2, statusText: t.message, id: q };
        n(s);
      });
  }
  function a(o) {
    if (typeof o !== "function") {
      return;
    }
    return function n(q) {
      var s,
        p,
        r = false;
      if (!q) {
        return;
      }
      s = q.target;
      if (!s) {
        return o(q);
      }
      p = s.status;
      if (p >= 200 && p < 300) {
        r = true;
      }
      o({
        headers: k.extractResponseHeaders(s.getAllResponseHeaders()),
        responseText: s.responseText,
        statusCode: p,
        statusText: s.statusText,
        id: s.id,
        success: r,
      });
    };
  }
  function d(v) {
    var u = i(),
      o = [["X-Requested-With", "XMLHttpRequest"]],
      t = 0,
      p = typeof v.async !== "boolean" ? true : v.async,
      r = "",
      s = null,
      q,
      n;
    if (v.headers) {
      o = o.concat(g(v.headers));
    }
    if (v.contentType) {
      o.push(["Content-Type", v.contentType]);
    }
    u.open(v.type.toUpperCase(), v.url, p);
    for (q = 0, n = o.length; q < n; q += 1) {
      r = o[q];
      if (r[0] && r[1]) {
        u.setRequestHeader(r[0], r[1]);
      }
    }
    if (v.error) {
      v.error = a(v.error);
      u.addEventListener("error", v.error);
    }
    u.onreadystatechange = s = function () {
      if (u.readyState === 4) {
        u.onreadystatechange = s = function () {};
        if (v.timeout) {
          window.clearTimeout(t);
        }
        v.oncomplete({
          id: v.id,
          headers: k.extractResponseHeaders(u.getAllResponseHeaders()),
          responseText: u.responseText || null,
          statusCode: u.status,
          statusText: u.statusText,
          success: u.status >= 200 && u.status < 300,
        });
        u = null;
      }
    };
    u.send(v.data || null);
    s();
    if (v.timeout) {
      t = window.setTimeout(function () {
        if (!u) {
          return;
        }
        u.onreadystatechange = function () {};
        if (u.readyState !== 4) {
          u.abort();
          if (typeof v.error === "function") {
            v.error({
              id: v.id,
              statusCode: u.status,
              statusText: "timeout",
              success: false,
            });
          }
        }
        v.oncomplete({
          id: v.id,
          headers: k.extractResponseHeaders(u.getAllResponseHeaders()),
          responseText: u.responseText || null,
          statusCode: u.status,
          statusText: "timeout",
          success: false,
        });
        u = null;
      }, v.timeout);
    }
  }
  function c() {
    var n = e.getServiceConfig("queue");
    if (typeof window.XMLHttpRequest !== "undefined") {
      i = function () {
        return new XMLHttpRequest();
      };
    } else {
      i = function () {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }
    if (n) {
      m =
        k.getValue(n, "useBeacon", true) &&
        typeof navigator.sendBeacon === "function";
      b = k.getValue(n, "useFetch", true) && typeof window.fetch === "function";
    }
    j = true;
  }
  return {
    init: function () {
      if (!j) {
        c();
      }
    },
    destroy: function () {
      j = false;
    },
    sendRequest: function (n) {
      var p = true,
        o;
      n.type = n.type || "POST";
      if ((n.isUnloading || !n.async) && m) {
        p = false;
        o = l(n);
        if (!o) {
          p = true;
        }
      }
      if (p) {
        if (n.async && b && !n.timeout) {
          f(n);
        } else {
          d(n);
        }
      }
    },
  };
});
TLT.addService("domCapture", function (B) {
  var i = B.getService("config"),
    j = B.getService("browserBase"),
    d = B.getService("browser"),
    x,
    h,
    f = {
      maxMutations: 100,
      maxLength: 1000000,
      captureShadowDOM: false,
      captureFrames: false,
      removeScripts: true,
      removeComments: true,
      captureStyle: true,
    },
    ab = {
      childList: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      subtree: true,
    },
    a = typeof window.MutationObserver !== "undefined",
    z,
    J = ab,
    Q = [],
    L = [],
    y = [],
    ac = [],
    w = [],
    A = 0,
    H = 100,
    c = false,
    r = false,
    R = false,
    t = function () {},
    v = function () {},
    D = function () {},
    M = B._publishEvent,
    o = false,
    ah = B.utils;
  function I() {
    ac = [];
    w = [];
    A = 0;
    c = false;
  }
  function X(al) {
    var ak, aj, ai;
    if (!al || !al.length) {
      return;
    }
    al = al.sort(function (an, am) {
      return an.compare(am);
    });
    for (ak = 0; ak < al.length; ak += 1) {
      ai = al[ak];
      for (aj = ak + 1; aj < al.length; aj += 0) {
        if (al[aj].containedIn(ai)) {
          al.splice(aj, 1);
        } else {
          aj += 1;
        }
      }
    }
  }
  function s(ak) {
    var aj, ai;
    if (ak) {
      for (aj = 0, ai = ak.length; aj < ai; aj += 1) {
        delete ak[aj].oldValue;
      }
    }
    return ak;
  }
  function T(am, ak) {
    var aj,
      ai,
      al = -1;
    if (!am || !ak) {
      return al;
    }
    for (aj = 0, ai = am.length; aj < ai; aj += 1) {
      if (am[aj].name === ak) {
        al = aj;
        break;
      }
    }
    return al;
  }
  function C(al, an) {
    var ak, aj, ai, am;
    for (ak = 0, aj = al.length, am = false; ak < aj; ak += 1) {
      ai = al[ak];
      if (ai.name === an.name) {
        if (ai.oldValue === an.value) {
          al.splice(ak, 1);
        } else {
          ai.value = an.value;
        }
        am = true;
        break;
      }
    }
    if (!am) {
      al.push(an);
    }
    return al;
  }
  function P(ao, ai) {
    var an,
      al,
      ak,
      ap,
      ar,
      aq,
      am,
      aj = 0;
    ao.removedNodes = ai.removedNodes.length;
    ao.addedNodes = ah.convertToArray(ai.addedNodes);
    for (an = 0, ap = ac.length; an < ap; an += 1) {
      aq = ac[an];
      if (ao.isSame(aq)) {
        if (ao.removedNodes) {
          for (al = 0; al < ai.removedNodes.length; al += 1) {
            ak = aq.addedNodes.indexOf(ai.removedNodes[al]);
            if (ak !== -1) {
              aq.addedNodes.splice(ak, 1);
              ao.removedNodes -= 1;
            }
          }
        }
        aq.removedNodes += ao.removedNodes;
        aq.addedNodes.concat(ao.addedNodes);
        if (!aq.removedNodes && !aq.addedNodes.length) {
          am = false;
          for (al = 0; al < ac.length; al += 1) {
            if (aq !== ac[al] && ac[al].containedIn(aq)) {
              am = true;
              break;
            }
          }
          if (!am) {
            ac.splice(an, 1);
            aj = -1;
          }
        }
        ar = true;
        break;
      }
    }
    if (!ar) {
      ac.push(ao);
      aj = 1;
    }
    return aj;
  }
  function Y(aj, an) {
    var al,
      ak,
      ai,
      ao = false,
      am,
      ap;
    for (al = 0, ai = ac.length; !ao && al < ai; al += 1) {
      ap = ac[al];
      if (aj.containedIn(ap)) {
        am = ap.addedNodes;
        for (ak = 0; ak < am.length; ak += 1) {
          if (am[ak].contains && am[ak].contains(an)) {
            ao = true;
            break;
          }
        }
      }
    }
    return ao;
  }
  function G(am, ai) {
    var ak,
      an,
      ap,
      al,
      aq,
      ao = null,
      aj = 0;
    ap = ai.attributeName;
    if (ap === "checked" || ap === "selected") {
      ao = j.ElementData.prototype.examineID(ai.target);
      if (x.isPrivacyMatched(ao)) {
        return aj;
      }
      ao = null;
    }
    if (ap === "value") {
      ao = j.ElementData.prototype.examineID(ai.target);
      ao.currState = ah.getTargetState(ai.target) || {};
      if (ao.currState.value) {
        x.applyPrivacyToTarget(ao);
      } else {
        ao = null;
      }
    }
    am.attributes = [
      {
        name: ap,
        oldValue: ai.oldValue,
        value: ao ? ao.currState.value : ai.target.getAttribute(ap),
      },
    ];
    al = am.attributes[0];
    if (al.oldValue === al.value) {
      return aj;
    }
    for (ak = 0, an = w.length, aq = false; ak < an; ak += 1) {
      ao = w[ak];
      if (am.isSame(ao)) {
        ao.attributes = C(ao.attributes, al);
        if (!ao.attributes.length) {
          w.splice(ak, 1);
          aj = -1;
        } else {
          if (Y(am, ai.target)) {
            w.splice(ak, 1);
            aj = -1;
          }
        }
        aq = true;
        break;
      }
    }
    if (!aq && !Y(am, ai.target)) {
      w.push(am);
      aj = 1;
    }
    return aj;
  }
  function n(al) {
    var an, ai, am, aj, ak;
    if (!al || !al.length) {
      return;
    }
    if (c) {
      A += al.length;
      return;
    }
    for (an = 0, ai = al.length; an < ai && A < H; an += 1) {
      aj = al[an];
      ak = new j.Xpath(aj.target);
      if (ak) {
        am = ak.fullXpathList;
        if (am.length && am[0][0] === "html") {
          switch (aj.type) {
            case "characterData":
            case "childList":
              A += P(ak, aj);
              break;
            case "attributes":
              A += G(ak, aj);
              break;
            default:
              ah.clog("Unknown mutation type: " + aj.type);
              break;
          }
        }
      }
    }
    if (A >= H) {
      c = true;
      A += ai - an;
    }
  }
  function u() {
    var ai;
    ai = new window.MutationObserver(function (aj) {
      if (aj) {
        n(aj);
        ah.clog("Processed [" + aj.length + "] mutation records.");
        B.invokeMutationCallbacks(aj);
      }
    });
    return ai;
  }
  function K() {
    var ai = Element.prototype.attachShadow;
    if (!z) {
      return null;
    }
    z.observe(window.document, J);
    if (ah.getValue(h, "options.captureShadowDOM", false)) {
      Element.prototype.attachShadow = function (ak) {
        var aj = ai.call(this, ak);
        if (this.shadowRoot) {
          z.observe(this.shadowRoot, J);
        }
        return aj;
      };
    }
    o = true;
    return z;
  }
  function k(ak) {
    var am,
      ai,
      al,
      ap,
      ao,
      aj,
      an = i.getCoreConfig();
    i.subscribe("configupdated", D);
    x = B.getService("message");
    h = ak;
    h.options = ah.mixin({}, f, h.options);
    a = a && ah.getValue(h, "diffEnabled", true);
    H = ah.getValue(h.options, "maxMutations", 100);
    if (a) {
      J = ah.getValue(h, "diffObserverConfig", ab);
      z = u();
      Q.push(window);
    }
    aj = h.options.captureShadowDOM;
    if (
      aj &&
      !(window.ShadyDOM && window.ShadyDOM.inUse) &&
      (Element.prototype.attachShadow || "")
        .toString()
        .indexOf("[native code]") < 0
    ) {
      h.options.captureShadowDOM = false;
      aj = false;
    }
    if (aj) {
      for (al in an.modules) {
        if (an.modules.hasOwnProperty(al)) {
          ao = an.modules[al].events || [];
          for (am = 0, ai = ao.length; am < ai; am += 1) {
            if (ao[am].attachToShadows) {
              ap = ao[am].name;
              if (ah.indexOf(y, ap) === -1) {
                y.push(ap);
              }
            }
          }
        }
      }
    }
    K();
    R = true;
  }
  function V() {
    i.unsubscribe("configupdated", D);
    if (z) {
      z.disconnect();
    }
    R = false;
  }
  function p() {
    var ai;
    ai = "tlt-" + ah.getSerialNumber();
    return ai;
  }
  function W(ak, aj, ai) {
    var am,
      ao,
      an,
      al,
      aq,
      ap = [];
    if (!ak || !ak.getElementsByTagName || !aj) {
      return ap;
    }
    if (ai && ai.length === 2) {
      ao = ai[0];
      an = ai[1];
    }
    al = ak.getElementsByTagName(aj);
    if (al && al.length) {
      for (am = al.length - 1; am >= 0; am -= 1) {
        aq = al[am];
        if (!ao) {
          ap.push(aq);
        } else {
          if (aq[ao] === an) {
            ap.push(aq);
          }
        }
      }
    }
    return ap;
  }
  function g(am, ak, al) {
    var aj, ai, an;
    an = W(am, ak, al);
    for (aj = an.length - 1; aj >= 0; aj -= 1) {
      ai = an[aj];
      ai.parentNode.removeChild(ai);
    }
    return am;
  }
  function ag(al, aj) {
    var ak,
      ai,
      an = W(al, "img"),
      am = new RegExp("^data:image/(.*?);base64");
    for (ak = 0; ak < an.length; ak++) {
      ai = an[ak];
      if (am.test(ai.src) && ai.src.length > aj) {
        ai.src = "";
        ai.setAttribute("removedByUIC", true);
      }
    }
    return al;
  }
  function O(ak, ai) {
    var aj, al;
    for (aj = 0; ak.hasChildNodes() && aj < ak.childNodes.length; aj += 1) {
      al = ak.childNodes[aj];
      if (al.nodeType === ai) {
        ak.removeChild(al);
        aj -= 1;
      } else {
        if (al.hasChildNodes()) {
          O(al, ai);
        }
      }
    }
    return ak;
  }
  function aa(ak) {
    var al,
      aj,
      ai = null;
    if (!ak) {
      return ai;
    }
    switch (ak.nodeType) {
      case 1:
        al = ak.ownerDocument;
        if (al && al.documentElement === ak) {
          aj = al.doctype;
        }
        break;
      case 9:
        aj = ak.doctype;
        break;
      default:
        break;
    }
    if (aj) {
      ai =
        "<!DOCTYPE " +
        aj.name +
        (aj.publicId ? ' PUBLIC "' + aj.publicId + '"' : "") +
        (!aj.publicId && aj.systemId ? " SYSTEM" : "") +
        (aj.systemId ? ' "' + aj.systemId + '"' : "") +
        ">";
    }
    return ai;
  }
  function Z(ao, ap) {
    var an, ak, am, al, aj, ai;
    if (!ap) {
      return;
    }
    al = ao.getElementsByTagName("input");
    aj = ap.getElementsByTagName("input");
    if (aj) {
      for (an = 0, ai = aj.length; an < ai; an += 1) {
        ak = al[an];
        am = aj[an];
        switch (am.type) {
          case "checkbox":
          case "radio":
            if (ah.isIE ? ak.checked : am.checked) {
              am.setAttribute("checked", "checked");
            } else {
              am.removeAttribute("checked");
            }
            break;
          default:
            am.setAttribute("value", am.value);
            if (!am.getAttribute("type")) {
              am.setAttribute("type", "text");
            }
            break;
        }
      }
    }
  }
  function l(ao, ap) {
    var al, ai, an, aj, ak, am;
    if (!ao || !ao.getElementsByTagName || !ap || !ap.getElementsByTagName) {
      return;
    }
    aj = ao.getElementsByTagName("textarea");
    am = ap.getElementsByTagName("textarea");
    if (aj && am) {
      for (al = 0, ai = aj.length; al < ai; al += 1) {
        an = aj[al];
        ak = am[al];
        ak.setAttribute("value", an.value);
        ak.value = ak.textContent = an.value;
      }
    }
  }
  function S(ai, an) {
    var aj, ap, ao, aq, al, ak, am;
    if (!ai || !ai.getElementsByTagName || !an || !an.getElementsByTagName) {
      return;
    }
    ap = ai.getElementsByTagName("select");
    aq = an.getElementsByTagName("select");
    if (ap) {
      for (al = 0, am = ap.length; al < am; al += 1) {
        aj = ap[al];
        ao = aq[al];
        for (ak = 0; ak < aj.options.length; ak += 1) {
          if (ak === aj.selectedIndex || aj.options[ak].selected) {
            ao.options[ak].setAttribute("selected", "selected");
          } else {
            ao.options[ak].removeAttribute("selected");
          }
        }
      }
    }
  }
  function E(aj) {
    var ai,
      ak = null;
    if (aj) {
      ai = aj.nodeType || -1;
      switch (ai) {
        case 11:
          ak = aj.innerHTML;
          break;
        case 9:
          ak = aj.documentElement ? aj.documentElement.outerHTML : "";
          break;
        case 1:
          ak = aj.outerHTML;
          break;
        default:
          ak = null;
          break;
      }
    }
    return ak;
  }
  function af(ak) {
    var ai,
      aj = false;
    if (ak && typeof ak === "object") {
      ai = ak.nodeType || -1;
      switch (ai) {
        case 9:
        case 1:
          aj = true;
          break;
        default:
          aj = false;
          break;
      }
    }
    return aj;
  }
  function b(ap, az, aj) {
    var at,
      ar,
      au,
      aA,
      aq = ["iframe", "frame"],
      ay,
      ak,
      an,
      ax,
      al,
      aw,
      am = { frames: [] },
      aB,
      ao,
      ai;
    for (ar = 0; ar < aq.length; ar += 1) {
      aA = aq[ar];
      aB = ap.getElementsByTagName(aA);
      ao = az.getElementsByTagName(aA);
      if (aB) {
        for (at = 0, au = aB.length; at < au; at += 1) {
          try {
            ay = aB[at];
            ak = ah.getIFrameWindow(ay);
            if (ak && ak.document && ak.location.href !== "about:blank") {
              an = ak.document;
              ax = v(an, an, "", aj);
              al = p();
              ao[at].setAttribute("tltid", al);
              ax.tltid = al;
              ao[at].removeAttribute("srcdoc");
              ai = ah.getOriginAndPath(an.location);
              ax.host = ai.origin;
              ax.url = B.normalizeUrl("", ai.path, 12);
              ax.charset = an.characterSet || an.charset;
              aw = ao[at].getAttribute("src");
              if (!aw) {
                aw = ak.location.href;
                ao[at].setAttribute("src", aw);
              }
              if (!ax.root) {
                ax.root = "<html></html>";
              }
              am.frames = am.frames.concat(ax.frames);
              delete ax.frames;
              am.frames.push(ax);
            }
          } catch (av) {}
        }
      }
    }
    return am;
  }
  function ad(aj) {
    var ak, ai, al;
    aj.TLTListeners = aj.TLTListeners || {};
    for (ak = 0, ai = y.length; ak < ai; ak += 1) {
      al = y[ak];
      if (!aj.TLTListeners[al]) {
        d.subscribe(al, aj, M);
        aj.TLTListeners[al] = true;
      }
    }
  }
  function e(aj, at, au, am) {
    var an,
      aq,
      ak,
      ao,
      ai,
      al,
      ap = { shadows: [] };
    if (!aj || (!am && !aj.children)) {
      return ap;
    }
    if (am) {
      ai = [aj];
    } else {
      ai = aj.children;
    }
    for (an = 0, aq = ai.length; an < aq; an += 1) {
      ao = ai[an];
      if (ao.shadowRoot) {
        al = new j.Xpath(ao);
        ak = v(ao.ownerDocument, ao.shadowRoot, "", au);
        ap.shadows.push({
          root: ak.root,
          originalSize: ak.originalSize,
          xpath: al.xpath,
        });
        ap.shadows = ap.shadows.concat(ak.shadows);
        ad(ao.shadowRoot);
        if (a) {
          try {
            z.observe(ao.shadowRoot, J);
            ao.shadowRoot.TLTListeners.mutation = true;
            if (ah.indexOf(L, ao) === -1) {
              L.push(ao);
            }
          } catch (ar) {
            ah.clog("Failed to observe shadow root.", ar, ao);
          }
        }
      }
      ak = e(ao, null, au);
      ap.shadows = ap.shadows.concat(ak.shadows);
    }
    return ap;
  }
  function ae(ao) {
    var am,
      ak,
      ai,
      al,
      aj,
      an,
      ap = 0;
    if (!ao) {
      return ap;
    }
    if (ao.root) {
      ap += ao.root.length;
      if (ao.frames) {
        for (am = 0, ai = ao.frames.length; am < ai; am += 1) {
          if (ao.frames[am].root) {
            ap += ao.frames[am].root.length;
          }
        }
      }
    } else {
      if (ao.diffs) {
        for (am = 0, ai = ao.diffs.length; am < ai; am += 1) {
          an = ao.diffs[am];
          ap += an.xpath.length;
          if (an.root) {
            ap += an.root.length;
          } else {
            if (an.attributes) {
              for (ak = 0, al = an.attributes.length; ak < al; ak += 1) {
                aj = an.attributes[ak];
                ap += aj.name.length;
                if (aj.value) {
                  ap += aj.value.length;
                }
              }
            }
          }
        }
      }
    }
    return ap;
  }
  function U() {
    var al, ak, ai, aj;
    for (al = 0, ai = ac.length; al < ai && w.length; al += 1) {
      aj = ac[al];
      for (ak = 0; ak < w.length; ak += 1) {
        if (w[ak].containedIn(aj)) {
          w.splice(ak, 1);
          ak -= 1;
        }
      }
    }
  }
  function m(al) {
    var ak,
      ai,
      aj,
      am,
      an = [];
    if (!al || !al.children) {
      return an;
    }
    am = al.children;
    for (ak = 0, ai = am.length; ak < ai; ak += 1) {
      aj = am[ak];
      if (aj.shadowRoot) {
        if (!aj.shadowRoot.TLTListeners) {
          an.push([aj, aj.shadowRoot]);
        }
        an = an.concat(m(aj.shadowRoot));
      }
      an = an.concat(m(aj));
    }
    return an;
  }
  function F(ao, ak) {
    var al, ai, am, an, aj;
    if (!ao || !ak) {
      return;
    }
    if (!ak.captureShadowDOM) {
      return;
    }
    aj = m(ao);
    for (al = 0, ai = aj.length, am = []; al < ai; al += 1) {
      an = e(aj[al][0], null, ak, true);
      am = am.concat(an.shadows);
    }
    return am;
  }
  function q(an, ak) {
    var ao, aj, am, al, ai;
    ao = v(an, an, null, ak);
    if (!ao) {
      ao = {};
    }
    ao.charset = an.characterSet || an.charset;
    aj = ah.getOriginAndPath(an.location);
    ao.host = aj.origin;
    ao.url = B.normalizeUrl("", aj.path, 12);
    return ao;
  }
  function N(ax) {
    var an,
      ap,
      av = { fullDOM: false, diffs: [], attributeDiffs: {} },
      au,
      aw,
      at,
      ao,
      ak,
      aq,
      aj,
      am,
      ar = new RegExp("^data:image/(.*?);base64");
    X(ac);
    U();
    ao = ax.captureShadowDOM;
    ax.captureShadowDOM = false;
    for (an = 0, ap = ac.length; an < ap; an += 1) {
      aj = ac[an];
      aq = j.getNodeFromID(aj.xpath, -2);
      if (!aq) {
        continue;
      }
      if (aj.isShadowHost) {
        aq = aq.shadowRoot;
        if (!aq.TLTListeners) {
          continue;
        }
      }
      if (
        aq === window.document.body ||
        aq === window.document.documentElement
      ) {
        ax.captureShadowDOM = ao;
        return q(window.document, ax);
      }
      au = v(window.document, aq, aj, ax);
      delete au.originalSize;
      if (au.shadows && au.shadows.length === 0) {
        delete au.shadows;
      }
      if (au.frames && au.frames.length === 0) {
        delete au.frames;
      }
      au.xpath = aj.xpath;
      av.diffs.push(au);
    }
    function al(az, ay) {
      if (!az || !az.name) {
        return;
      }
      av.attributeDiffs[au.xpath][az.name] = { value: az.value };
    }
    function ai(aB) {
      var az, ay, aA;
      for (az = 0, aA = aB.length; az < aA; az += 1) {
        ay = aB[az];
        if (
          ay.name === "src" &&
          ar.test(ay.value) &&
          ay.value.length > ax.discardBase64
        ) {
          ay.value = "";
          aB.push({ name: "removedByUIC", value: true });
          break;
        }
      }
      return aB;
    }
    for (an = 0, ap = w.length; an < ap; an += 1) {
      aj = w[an];
      aw = T(aj.attributes, "id");
      if (aw > -1) {
        aq = j.getNodeFromID(aj.xpath, -2);
        at = new j.Xpath(aq, false, aj.attributes[aw].oldValue);
        aj.xpath = at.xpath;
      }
      am = s(aj.attributes);
      if (ax.hasOwnProperty("discardBase64")) {
        aq = j.getNodeFromID(aj.xpath, -2);
        if (aq && aq.tagName.toLowerCase() === "img" && am) {
          am = ai(am);
        }
      }
      au = { xpath: aj.xpath, attributes: am };
      av.diffs.push(au);
      av.attributeDiffs[au.xpath] = {};
      ah.forEach(au.attributes, al);
    }
    ax.captureShadowDOM = ao;
    ak = F(window.document, ax);
    if (ak && ak.length) {
      av.shadows = ak;
    }
    return av;
  }
  t = function (ai) {
    var aj = null;
    if (af(ai)) {
      aj = ai.cloneNode(true);
      if (!aj && ai.documentElement) {
        aj = ai.documentElement.cloneNode(true);
      }
    }
    return aj;
  };
  v = function (aq, ao, am, at) {
    var ak = true,
      ai,
      ar,
      aj,
      ap,
      al = {},
      an;
    if (!aq || !ao) {
      return al;
    }
    ar = E(ao);
    if (ar) {
      al.originalSize = ar.length;
    }
    ai = t(ao, aq);
    if (!ai && ao.host) {
      ak = false;
    } else {
      if (!ai) {
        return al;
      }
    }
    if (ak) {
      if (!!at.removeScripts) {
        g(ai, "script");
        g(ai, "noscript");
      }
      if (!at.keepImports) {
        g(ai, "link", ["rel", "import"]);
      }
      if (!!at.removeComments) {
        O(ai, 8);
      }
      if (!at.captureStyle) {
        g(ai, "style");
      }
      if (at.hasOwnProperty("discardBase64")) {
        ag(ai, at.discardBase64);
      }
      S(ao, ai);
      Z(ao, ai);
      l(ao, ai);
      ai = x.applyPrivacyToNode(ai, am, aq);
      if (!!at.captureFrames) {
        aj = b(ao, ai, at);
      }
    }
    if (!!at.captureShadowDOM) {
      ap = e(ao, ai, at);
    }
    if (aj) {
      al = ah.mixin(al, aj);
    }
    if (ap) {
      al = ah.mixin(al, ap);
    }
    an = (aa(ao) || "") + E(ai || ao);
    al.root = x.applyPrivacyPatterns(an);
    return al;
  };
  D = function () {
    i = B.getService("config");
    k(i.getServiceConfig("domCapture") || {});
  };
  return {
    init: function () {
      i = B.getService("config");
      if (!R) {
        k(i.getServiceConfig("domCapture") || {});
      } else {
      }
    },
    destroy: function () {
      V();
    },
    observeWindow: function (ai) {
      if (!ai) {
        return;
      }
      if (!ah.getValue(h, "options.captureFrames", false) && !(ai === window)) {
        return;
      }
      if (ah.indexOf(Q, ai) === -1) {
        Q.push(ai);
        if (z && o) {
          z.observe(ai.document, J);
        }
      }
    },
    captureDOM: function (aj, ak) {
      var al,
        ai,
        ao = null,
        am,
        ap = 0;
      if (!R || (ah.isIE && document.documentMode < 10)) {
        return ao;
      }
      ak = ah.mixin({}, h.options, ak);
      aj = aj || window.document;
      if (!r || !a || c || ak.forceFullDOM) {
        if (z) {
          z.disconnect();
        }
        ao = q(aj, ak);
        ao.fullDOM = true;
        ao.forced = !!(c || ak.forceFullDOM);
        r = true;
        if (z) {
          for (al = 0, ai = Q.length; al < ai; al += 1) {
            am = Q[al];
            try {
              z.observe(am.document, J);
            } catch (an) {
              Q.splice(al, 1);
              ai = Q.length;
              al -= 1;
            }
          }
        }
      } else {
        ao = N(ak);
        ao.fullDOM = ao.diffs ? false : true;
      }
      if (a) {
        ao.mutationCount = A;
      }
      I();
      if (ak.maxLength) {
        ap = ae(ao);
        if (ap > ak.maxLength) {
          ao = {
            errorCode: 101,
            error:
              "Captured length (" +
              ap +
              ") exceeded limit (" +
              ak.maxLength +
              ").",
          };
        }
      }
      return ao;
    },
  };
});
TLT.addService("encoder", function (a) {
  var f = {},
    g = null,
    b = null,
    d = false;
  function e(j) {
    var i = null;
    if (!j) {
      return i;
    }
    i = f[j];
    if (i && typeof i.encode === "string") {
      i.encode = a.utils.access(i.encode);
    }
    return i;
  }
  function h(i) {
    f = i;
    g.subscribe("configupdated", b);
    d = true;
  }
  function c() {
    g.unsubscribe("configupdated", b);
    d = false;
  }
  b = function () {
    g = a.getService("config");
    h(g.getServiceConfig("encoder") || {});
  };
  return {
    init: function () {
      g = a.getService("config");
      if (!d) {
        h(g.getServiceConfig("encoder") || {});
      } else {
      }
    },
    destroy: function () {
      c();
    },
    encode: function (m, l) {
      var k,
        i,
        j = { data: null, encoding: null, error: null };
      if ((typeof m !== "string" && !m) || !l) {
        j.error = "Invalid " + (!m ? "data" : "type") + " parameter.";
        return j;
      }
      k = e(l);
      if (!k) {
        j.error = "Specified encoder (" + l + ") not found.";
        return j;
      }
      if (typeof k.encode !== "function") {
        j.error =
          "Configured encoder (" + l + ") 'encode' method is not a function.";
        return j;
      }
      try {
        i = k.encode(m);
      } catch (n) {
        j.error =
          "Exception " + (n.name ? n.name + " - " : "") + (n.message || n);
        return j;
      }
      if (!i || a.utils.getValue(i, "buffer", null) === null) {
        j.error = "Encoder (" + l + ") returned an invalid result.";
        return j;
      }
      j.data = i.buffer;
      j.encoding = k.defaultEncoding;
      return j;
    },
  };
});
TLT.addService("message", function (y) {
  var W = y.utils,
    Q = y.getTabId(),
    c = [],
    M = 0,
    n = 0,
    h =
      window.performance && performance.timeOrigin
        ? Math.round(performance.timeOrigin)
        : y.getStartTime(),
    G = new Date().getTimezoneOffset(),
    m = y.getService("browserBase"),
    b = y.getService("browser"),
    l = y.getService("config"),
    i = l.getCoreConfig(),
    D = l.getServiceConfig("message") || {},
    r = y.normalizeUrl("", window.location.href),
    S = window.location.hostname,
    f,
    x,
    X = D.hasOwnProperty("privacy") ? D.privacy : [],
    d,
    J = {},
    T = { lower: "x", upper: "X", numeric: "9", symbol: "@" },
    j = parseFloat((window.devicePixelRatio || 1).toFixed(2)),
    k = window.screen || {},
    a = k.width || 0,
    B = k.height || 0,
    U = m.getNormalizedOrientation(),
    o = !W.isiOS ? a : Math.abs(U) === 90 ? B : a,
    H = !W.isiOS ? B : Math.abs(U) === 90 ? a : B,
    P = window.screen ? window.screen.height - window.screen.availHeight : 0,
    O = window.innerWidth || document.documentElement.clientWidth,
    s = window.innerHeight || document.documentElement.clientHeight,
    L = false,
    A = {},
    q = false;
  function V() {
    var Y =
      window.performance && performance.now
        ? Math.round(performance.now())
        : new Date().getTime() - h;
    return Y;
  }
  function g(Z) {
    var Y = "";
    delete Z.timestamp;
    this.type = Z.type;
    this.offset = V();
    if (Z.type === 2 && Z.screenview.type === "LOAD") {
      c.push(V());
      this.screenviewOffset = 0;
    } else {
      if (c.length) {
        this.screenviewOffset = V() - c[c.length - 1];
        if (Z.type === 2 && Z.screenview.type === "UNLOAD") {
          c.pop();
        }
      } else {
        this.screenviewOffset = 0;
      }
    }
    if (!this.type) {
      return;
    }
    this.count = n += 1;
    this.fromWeb = true;
    for (Y in Z) {
      if (Z.hasOwnProperty(Y)) {
        this[Y] = Z[Y];
      }
    }
  }
  J.PVC_MASK_EMPTY = function (Y) {
    return "";
  };
  J.PVC_MASK_BASIC = function (Z) {
    var Y = "XXXXX";
    if (typeof Z !== "string") {
      return "";
    }
    return Z.length ? Y : "";
  };
  J.PVC_MASK_TYPE = function (ac) {
    var Z,
      ab,
      Y,
      aa = "";
    if (typeof ac !== "string") {
      return aa;
    }
    Z = ac.split("");
    for (ab = 0, Y = Z.length; ab < Y; ab += 1) {
      if (W.isNumeric(Z[ab])) {
        aa += T.numeric;
      } else {
        if (W.isUpperCase(Z[ab])) {
          aa += T.upper;
        } else {
          if (W.isLowerCase(Z[ab])) {
            aa += T.lower;
          } else {
            aa += T.symbol;
          }
        }
      }
    }
    return aa;
  };
  J.PVC_MASK_EMPTY.maskType = 1;
  J.PVC_MASK_BASIC.maskType = 2;
  J.PVC_MASK_TYPE.maskType = 3;
  J.PVC_MASK_CUSTOM = { maskType: 4 };
  function e(Y, aa) {
    var Z = J.PVC_MASK_BASIC;
    if (typeof aa !== "string") {
      return aa;
    }
    if (!Y) {
      Z = J.PVC_MASK_BASIC;
    } else {
      if (Y.maskType === J.PVC_MASK_EMPTY.maskType) {
        Z = J.PVC_MASK_EMPTY;
      } else {
        if (Y.maskType === J.PVC_MASK_BASIC.maskType) {
          Z = J.PVC_MASK_BASIC;
        } else {
          if (Y.maskType === J.PVC_MASK_TYPE.maskType) {
            Z = J.PVC_MASK_TYPE;
          } else {
            if (Y.maskType === J.PVC_MASK_CUSTOM.maskType) {
              if (typeof Y.maskFunction === "string") {
                Z = W.access(Y.maskFunction);
              } else {
                Z = Y.maskFunction;
              }
              if (typeof Z !== "function") {
                Z = J.PVC_MASK_BASIC;
              }
            }
          }
        }
      }
    }
    return Z(aa);
  }
  function F(Y, Z) {
    var aa;
    if (!Y || !Z) {
      return;
    }
    for (aa in Z) {
      if (Z.hasOwnProperty(aa)) {
        if (aa === "value") {
          Z[aa] = e(Y, Z[aa]);
        } else {
          delete Z[aa];
        }
      }
    }
  }
  function R(Y, Z) {
    return W.matchTarget(Y, Z) !== -1;
  }
  function K(ad) {
    var Z, Y, aa, ac, ab;
    if (!ad) {
      return "";
    }
    for (Z = 0, Y = d.length; Z < Y; Z += 1) {
      ab = d[Z];
      ab.cRegex.lastIndex = 0;
      ad = ad.replace(ab.cRegex, ab.replacement);
    }
    return ad;
  }
  function I(af) {
    var ac,
      Y,
      ab,
      Z,
      ae = false,
      ad,
      aa;
    if (!af || (!af.currState && !af.prevState) || !af.id) {
      return af;
    }
    ad = af.prevState;
    aa = af.currState;
    for (ac = 0, Y = X.length; ac < Y; ac += 1) {
      Z = X[ac];
      ab = W.getValue(Z, "exclude", false);
      if (R(Z.targets, af) !== ab) {
        if (ad && ad.hasOwnProperty("value")) {
          F(Z, ad);
        }
        if (aa && aa.hasOwnProperty("value")) {
          F(Z, aa);
        }
        ae = true;
        break;
      }
    }
    if (!ae) {
      if (ad && ad.value) {
        ad.value = K(ad.value);
      }
      if (aa && aa.value) {
        aa.value = K(aa.value);
      }
    }
    return af;
  }
  function t(Y) {
    if (!Y || !Y.target) {
      return Y;
    }
    I(Y.target);
    return Y;
  }
  function p(ab, Z) {
    var aa, Y, ad, ac;
    if (!Z || !ab) {
      return;
    }
    if (ab.value) {
      ad = e(Z, ab.value);
      ab.setAttribute("value", ad);
      ab.value = ad;
    }
    if (ab.checked) {
      ab.removeAttribute("checked");
    }
    if (W.getTagName(ab) === "select") {
      ab.selectedIndex = -1;
      for (aa = 0, Y = ab.options.length; aa < Y; aa += 1) {
        ac = ab.options[aa];
        ac.removeAttribute("selected");
        ac.selected = false;
      }
    } else {
      if (W.getTagName(ab) === "textarea") {
        ab.textContent = ab.value;
      }
    }
  }
  function w(aj, ag, ak, ap, ad, af) {
    var al,
      ai,
      ah,
      am,
      aa,
      ab,
      ae = [],
      an,
      Y,
      ac,
      ao,
      Z;
    if (!aj.length && !ad.length && !af) {
      return [];
    }
    Z = b.queryAll("input, select, textarea", ag);
    if (!Z || !Z.length) {
      return [];
    }
    for (al = 0, am = ad.length; al < am; al += 1) {
      ai = Z.indexOf(ad[al]);
      if (ai !== -1) {
        Z.splice(ai, 1);
      }
    }
    if (aj.length) {
      for (al = 0, am = Z.length, ae = []; al < am; al += 1) {
        if (Z[al].value) {
          ab = m.ElementData.prototype.examineID(Z[al], true);
          if (ab.idType === -2) {
            an = new m.Xpath(Z[al], true);
            an.applyPrefix(ak);
            ab.id = an.xpath;
          }
          ae.push({ id: ab.id, idType: ab.idType, element: Z[al] });
        }
      }
    }
    for (al = 0, am = aj.length; al < am; al += 1) {
      ac = X[aj[al].ruleIndex];
      Y = W.getValue(ac, "exclude", false);
      ao = ac.targets[aj[al].targetIndex];
      if (typeof ao.id === "string" && ao.idType === -2) {
        for (ai = 0; ai < ae.length; ai += 1) {
          if (ae[ai].idType === ao.idType && ae[ai].id === ao.id) {
            if (!Y) {
              aa = ae[ai].element;
              p(aa, ac);
            } else {
              ah = Z.indexOf(aa);
              Z.splice(ah, 1);
            }
          }
        }
      } else {
        for (ai = 0; ai < ae.length; ai += 1) {
          ao.cRegex.lastIndex = 0;
          if (ae[ai].idType === ao.idType && ao.cRegex.test(ae[ai].id)) {
            aa = ae[ai].element;
            if (!Y) {
              p(aa, ac);
            } else {
              ah = Z.indexOf(aa);
              Z.splice(ah, 1);
            }
          }
        }
      }
    }
    if (af) {
      for (al = 0, am = Z.length; al < am; al += 1) {
        p(Z[al], af);
      }
    }
  }
  function u(ae, aj, ap) {
    var ak,
      ag,
      af,
      aa,
      Y,
      ab = [],
      ad,
      al,
      ah,
      Z,
      am,
      ai = [],
      ao,
      an,
      ac;
    if (!ae || !ap) {
      return null;
    }
    for (ak = 0, al = X.length; ak < al; ak += 1) {
      ah = X[ak];
      Y = W.getValue(ah, "exclude", false);
      if (Y) {
        ad = ah;
      }
      an = ah.targets;
      for (ag = 0, ac = an.length; ag < ac; ag += 1) {
        ao = an[ag];
        if (typeof ao === "string") {
          Z = b.queryAll(ao, ae);
          if (!Y) {
            for (af = 0, am = Z.length; af < am; af += 1) {
              aa = Z[af];
              p(aa, ah);
            }
          } else {
            ab = ab.concat(Z);
          }
        } else {
          if (typeof ao.id === "string") {
            switch (ao.idType) {
              case -1:
              case -3:
                aa = m.getNodeFromID(ao.id, ao.idType, ae);
                if (!Y) {
                  p(aa, ah);
                } else {
                  ab.push(aa);
                }
                break;
              case -2:
                ai.push({ ruleIndex: ak, targetIndex: ag, exclude: Y });
                break;
              default:
                break;
            }
          } else {
            ai.push({ ruleIndex: ak, targetIndex: ag, exclude: Y });
          }
        }
      }
    }
    w(ai, ae, aj, ap, ab, ad);
    return ae;
  }
  function v(ac) {
    var aa,
      Y,
      Z,
      ab = false;
    if (!ac) {
      return ab;
    }
    for (aa = 0, Y = X.length; aa < Y; aa += 1) {
      Z = X[aa];
      if (R(Z.targets, ac)) {
        ab = true;
        break;
      }
    }
    return ab;
  }
  function z() {
    var ab, aa, Y, ae, af, ad, Z, ac;
    l = y.getService("config");
    D = l.getServiceConfig("message") || {};
    i = l.getCoreConfig();
    X = D.privacy || [];
    d = D.privacyPatterns || [];
    q = D.shadowDomCacheEnabled || false;
    for (ab = 0, af = X.length; ab < af; ab += 1) {
      ae = X[ab];
      Z = ae.targets;
      for (aa = 0, ac = Z.length; aa < ac; aa += 1) {
        ad = Z[aa];
        if (typeof ad === "object") {
          if (typeof ad.idType === "string") {
            ad.idType = +ad.idType;
          }
          if (typeof ad.id === "object") {
            ad.cRegex = new RegExp(ad.id.regex, ad.id.flags);
          }
        }
      }
    }
    for (Y = d.length, ab = Y - 1; ab >= 0; ab -= 1) {
      ae = d[ab];
      if (typeof ae.pattern === "object") {
        ae.cRegex = new RegExp(ae.pattern.regex, ae.pattern.flags);
      } else {
        d.splice(ab, 1);
      }
    }
  }
  function C() {
    if (l.subscribe) {
      l.subscribe("configupdated", z);
    }
    z();
    L = true;
  }
  function N() {
    l.unsubscribe("configupdated", z);
    L = false;
  }
  function E(ag) {
    var ad = ag.dcid,
      aa = ag.shadows || [],
      ac = ag.fullDOM,
      ah = 1,
      ab,
      ae,
      af,
      Z,
      Y;
    if (aa.length === 0 || !ac) {
      return;
    }
    for (af in A) {
      if (A.hasOwnProperty(af)) {
        A[af].age += 1;
      }
    }
    for (ab = 0, ae = aa.length; ab < ae; ab += 1) {
      Z = aa[ab];
      Y = A[Z.xpath];
      if (Y && Y.root === Z.root) {
        Y.hitCount += 1;
        Y.age -= 1;
        Z.cacheDCID = Y.dcid;
        delete Z.root;
      } else {
        A[Z.xpath] = { root: Z.root, dcid: ad, hitCount: 0, age: 0 };
      }
    }
    for (af in A) {
      if (A.hasOwnProperty(af)) {
        Y = A[af];
        if (Y.age > Y.hitCount + ah) {
          delete A[af];
        }
      }
    }
  }
  return {
    init: function () {
      if (!L) {
        C();
        try {
          f = sessionStorage.getItem("tl.TR");
          x = sessionStorage.getItem("tl.PU");
          sessionStorage.removeItem("tl.TR");
          sessionStorage.removeItem("tl.PU");
        } catch (Y) {
          f = null;
        }
      } else {
      }
    },
    destroy: function () {
      N();
    },
    applyPrivacyToNode: u,
    applyPrivacyToMessage: t,
    applyPrivacyToTarget: I,
    applyPrivacyPatterns: K,
    isPrivacyMatched: v,
    createMessage: function (Y) {
      if (typeof Y.type === "undefined") {
        throw new TypeError("Invalid queueEvent given!");
      }
      if (Y.type === 12 && q) {
        E(Y.domCapture);
      }
      return t(new g(Y));
    },
    wrapMessages: function (Z) {
      var Y = {
          messageVersion: "13.0.0.0",
          serialNumber: (M += 1),
          sessions: [
            {
              id: y.getPageId(),
              tabId: Q,
              startTime: h,
              timezoneOffset: G,
              messages: Z,
              clientEnvironment: {
                webEnvironment: {
                  libVersion: "6.1.0.1989",
                  buildNote: i.buildNote || "",
                  domain: S,
                  page: r,
                  referrer: document.referrer,
                  mouseMovement: y.isMousemovementDetected(),
                  screen: {
                    devicePixelRatio: j,
                    deviceWidth: o,
                    deviceHeight: H,
                    deviceToolbarHeight: P,
                    width: O,
                    height: s,
                    orientation: U,
                  },
                },
              },
            },
          ],
        },
        aa = Y.sessions[0].clientEnvironment.webEnvironment;
      aa.screen.orientationMode = W.getOrientationMode(aa.screen.orientation);
      if (f) {
        aa.priorPage = { page: x, terminationReason: f };
      }
      return Y;
    },
    getCurrentOffset: V,
  };
});
TLT.addService("serializer", function (b) {
  var d = b.getService("config"),
    j = {},
    c = {},
    k = {
      json: (function () {
        if (typeof window.JSON !== "undefined") {
          return { serialize: window.JSON.stringify, parse: window.JSON.parse };
        }
        return {};
      })(),
    },
    f = null,
    i = false;
  function e(q, o, m) {
    var n, l, p;
    q = q || [];
    for (n = 0, l = q.length; n < l; n += 1) {
      p = q[n];
      if (typeof p === "string") {
        p = b.utils.access(p);
      }
      if (typeof p === "function") {
        o[m] = p;
        break;
      }
    }
  }
  function h() {
    var l;
    if (typeof j.json !== "function" || typeof c.json !== "function") {
      l = true;
    } else {
      if (typeof c.json('{"foo": "bar"}') === "undefined") {
        l = true;
      } else {
        l = c.json('{"foo": "bar"}').foo !== "bar";
      }
      if (typeof c.json("[1, 2]") === "undefined") {
        l = true;
      } else {
        l = l || c.json("[1, 2]")[0] !== 1;
        l = l || c.json("[1,2]")[1] !== 2;
      }
      l = l || j.json({ foo: "bar" }) !== '{"foo":"bar"}';
      l = l || j.json([1, 2]) !== "[1,2]";
    }
    return l;
  }
  function a(l) {
    var m;
    for (m in l) {
      if (l.hasOwnProperty(m)) {
        e(l[m].stringifiers, j, m);
        e(l[m].parsers, c, m);
      }
    }
    j.json = j.json || k.json.serialize;
    c.json = c.json || k.json.parse;
    if (typeof j.json !== "function" || typeof c.json !== "function") {
      b.fail(
        "JSON parser and/or serializer not provided in the UIC config. Can't continue."
      );
    }
    if (h()) {
      b.fail("JSON stringification and parsing are not working as expected");
    }
    if (d) {
      d.subscribe("configupdated", f);
    }
    i = true;
  }
  function g() {
    j = {};
    c = {};
    if (d) {
      d.unsubscribe("configupdated", f);
    }
    i = false;
  }
  f = function () {
    d = b.getService("config");
    a(d.getServiceConfig("serializer"));
  };
  return {
    init: function () {
      var l;
      if (!i) {
        l = d ? d.getServiceConfig("serializer") : {};
        a(l);
      } else {
      }
    },
    destroy: function () {
      g();
    },
    parse: function (m, l) {
      l = l || "json";
      return c[l](m);
    },
    serialize: function (n, m) {
      var l;
      m = m || "json";
      l = j[m](n);
      return l;
    },
  };
});
TLT.addModule("TLCookie", function (d) {
  var l = {},
    i = [],
    k = 0,
    f = true,
    p = false,
    h = "WCXSID",
    o = "TLTSID",
    b = "CoreID6",
    s,
    q,
    c = null,
    r,
    t = d.utils;
  function a() {
    var y = "123456789",
      x = t.getRandomString(1, y) + t.getRandomString(31, y + "0");
    return x;
  }
  function m() {
    var z = a(),
      y = !!l.secureTLTSID,
      x = l.samesite;
    t.setCookie(o, z, undefined, undefined, undefined, y, x);
    return t.getCookieValue(o);
  }
  function n() {
    if (c || !window.cmRetrieveUserID) {
      return;
    }
    try {
      window.cmRetrieveUserID(function (y) {
        c = y;
      });
    } catch (x) {
      c = null;
    }
  }
  function g(B) {
    var x, y, A, z;
    if (!localStorage || !B) {
      return;
    }
    A = localStorage.getItem(B);
    if (A) {
      y = A.split("|");
      x = parseInt(y[0], 10);
      if (Date.now() > x) {
        localStorage.removeItem(B);
      } else {
        z = y[1];
      }
    }
    return z;
  }
  function w(z, y) {
    var x;
    if (!localStorage || !z) {
      return;
    }
    y = y || a();
    x = Date.now() + k;
    localStorage.setItem(z, x + "|" + y);
    return g(z);
  }
  function j() {
    return i;
  }
  function e(x) {
    i = [];
    f = t.getValue(x, "sessionIDUsesCookie", true);
    p = t.getValue(x, "sessionIDUsesStorage", false);
    if (x.tlAppKey) {
      r = x.tlAppKey;
      i.push({ name: "X-Tealeaf-SaaS-AppKey", value: r });
    }
    if (x.visitorCookieName) {
      b = x.visitorCookieName;
    }
    if (x.wcxCookieName) {
      h = x.wcxCookieName;
    }
    s = t.getCookieValue(h);
    if (s) {
      i.push({ name: "X-WCXSID", value: s });
    }
    if (x.sessionizationCookieName) {
      o = x.sessionizationCookieName;
    }
    if (p) {
      k = t.getValue(x, "sessionIDStorageTTL", 600000);
      try {
        q = g(o);
      } catch (z) {
        p = false;
      }
    }
    if (!q && f) {
      q = t.getCookieValue(o);
    }
    if (!q) {
      if (s) {
        o = h;
        q = s;
      } else {
        if (p) {
          try {
            q = w(o);
          } catch (y) {
            p = false;
          }
        }
        if (!q && f) {
          q = m();
        }
      }
    }
    d.setSessionCookieInfo(o, q);
    if (!q) {
      q = "Check7UIC7Cookie7Configuration77";
    }
    i.push({ name: "X-Tealeaf-SaaS-TLTSID", value: q });
    if (i.length) {
      TLT.registerBridgeCallbacks([
        { enabled: true, cbType: "addRequestHeaders", cbFunction: j },
      ]);
    }
  }
  function u(C) {
    var z,
      y,
      x = false,
      B,
      A = l.appCookieWhitelist;
    if (!A || !A.length) {
      return x;
    }
    for (z = 0, y = A.length; z < y && !x; z += 1) {
      B = A[z];
      if (B.regex) {
        if (!B.cRegex) {
          B.cRegex = new RegExp(B.regex, B.flags);
        }
        B.cRegex.lastIndex = 0;
        x = B.cRegex.test(C);
      } else {
        x = B === C;
      }
    }
    return x;
  }
  function v() {
    var B,
      A,
      C,
      D = {},
      y,
      H = document.cookie,
      z = [],
      G = "",
      x = "";
    if (!H) {
      return;
    }
    z = H.split("; ");
    for (B = 0, C = z.length; B < C; B += 1) {
      y = z[B];
      A = y.indexOf("=");
      if (A >= 0) {
        try {
          G = decodeURIComponent(y.substr(0, A));
        } catch (F) {
          G = y.substr(0, A);
        }
      }
      x = y.substr(A + 1);
      if (u(G)) {
        try {
          D[G] = decodeURIComponent(x);
        } catch (E) {
          D[G] = x;
        }
      }
    }
    if (c && !D[b]) {
      D[b] = c;
    }
    d.post({ type: 14, cookies: D });
  }
  return {
    init: function () {
      l = d.getConfig() || {};
      e(l);
      n();
    },
    destroy: function () {
      if (p) {
        w(o, q);
      }
      window.setTimeout(function () {
        TLT.registerBridgeCallbacks([
          { enabled: false, cbType: "addRequestHeaders", cbFunction: j },
        ]);
      });
    },
    onevent: function (x) {
      switch (x.type) {
        case "screenview_load":
          if (t.getValue(l, "appCookieWhitelist.length", 0)) {
            n();
            v();
          }
          break;
        default:
          break;
      }
    },
  };
});
TLT.addModule("dataLayer", function (b) {
  var c = false,
    m,
    l = b.utils,
    f,
    k,
    n,
    e;
  function a() {
    var o = null;
    if (!m.dataObject) {
      return o;
    }
    switch (typeof m.dataObject) {
      case "object":
        o = m.dataObject;
        break;
      case "function":
        try {
          o = m.dataObject();
        } catch (p) {}
        break;
      default:
        break;
    }
    return o;
  }
  function d(s, t) {
    var p,
      o,
      r,
      q = -1;
    if (!s || !t) {
      return q;
    }
    for (p = 0, o = t.length; p < o && q === -1; p += 1) {
      r = t[p];
      switch (typeof r) {
        case "string":
          if (s === r) {
            q = p;
          }
          break;
        case "object":
          if (!r.cRegex) {
            r.cRegex = new RegExp(r.regex, r.flags);
          }
          r.cRegex.lastIndex = 0;
          if (r.cRegex.test(s)) {
            q = p;
          }
          break;
        default:
          break;
      }
    }
    return q;
  }
  function j(o, p) {
    p = p || k;
    return d(o, p) >= 0;
  }
  function g(o, p) {
    p = p || n;
    return d(o, p) >= 0;
  }
  function i(p) {
    var r,
      o,
      q = {};
    if (!p) {
      return null;
    }
    for (r in p) {
      if (Object.prototype.hasOwnProperty.call(p, r)) {
        if (!j(r)) {
          switch (typeof p[r]) {
            case "object":
              try {
                o = JSON.stringify(p[r]);
                q[r] = i(p[r]);
              } catch (s) {
                q[r] = "Serialization error: " + s.message;
              }
              break;
            case "function":
              break;
            case "undefined":
              break;
            default:
              q[r] = p[r];
              break;
          }
        } else {
        }
      }
    }
    return q;
  }
  function h(p) {
    var o = { type: 19, dataLayer: {} };
    if (!c) {
      return;
    }
    p = p || a();
    if (!p) {
      return;
    }
    o.dataLayer = i(p);
    b.post(o);
    if (e) {
      clearTimeout(e);
      e = null;
    }
  }
  return {
    init: function () {
      m = b.getConfig();
      k = m.propertyBlocklist || [];
      n = m.screenviewBlocklist || [];
      f = l.getValue(m, "logDelay", 500);
      if (typeof m.dataObject === "string") {
        m.dataObject = l.access(m.dataObject);
      }
      e = null;
      c = true;
    },
    destroy: function () {
      m = null;
      if (e) {
        clearTimeout(e);
        e = null;
      }
      c = false;
    },
    onevent: function (o) {
      if (typeof o !== "object" || !o.type) {
        return;
      }
      switch (o.type) {
        case "load":
          e = null;
          break;
        case "screenview_load":
          if (!g(o.name) && !e) {
            e = setTimeout(h, f);
          }
          break;
        case "logDataLayer":
          if (!o.data || typeof o.data === "object") {
            h(o.data);
          }
          break;
        case "unload":
          if (e) {
            h();
          }
          break;
        default:
          break;
      }
    },
    onmessage: function (o) {},
  };
});
if (TLT && typeof TLT.addModule === "function") {
  TLT.addModule("overstat", function (e) {
    var y = e.utils,
      p = {},
      A = {
        updateInterval: 250,
        hoverThreshold: 1000,
        hoverThresholdMax: 2 * 60 * 1000,
        gridCellMaxX: 10,
        gridCellMaxY: 10,
        gridCellMinWidth: 20,
        gridCellMinHeight: 20,
      },
      d = 50;
    function x(F) {
      var G = e.getConfig() || {},
        H = G[F];
      return typeof H === "number" ? H : A[F];
    }
    function E(L, F) {
      var K = y.getValue(L, "webEvent.target", {}),
        G = y.getValue(K, "element.tagName") || "",
        H = G.toLowerCase() === "input" ? y.getValue(K, "element.type") : "",
        J = y.getTlType(K),
        I = {
          type: 9,
          event: {
            hoverDuration: L.hoverDuration,
            hoverToClick: y.getValue(F, "hoverToClick"),
          },
          target: {
            id: K.id || "",
            idType: K.idType || "",
            name: K.name || "",
            tlType: J,
            type: G,
            subType: H,
            position: {
              width: y.getValue(K, "element.offsetWidth", 0),
              height: y.getValue(K, "element.offsetHeight", 0),
              relXY: L.relXY,
            },
          },
        };
      if (!I.target.id) {
        return;
      }
      e.post(I);
    }
    function i(F) {
      if (F && !F.nodeType && F.element) {
        F = F.element;
      }
      return F;
    }
    function s(F) {
      F = i(F);
      return !F || F === document.body || F === document.html || F === document;
    }
    function j(F) {
      F = i(F);
      if (!F) {
        return null;
      }
      return F.parentNode;
    }
    function n(F) {
      F = i(F);
      if (!F) {
        return null;
      }
      return F.offsetParent || F.parentElement || j(F);
    }
    function v(G, H) {
      var F = 0;
      if (!H || H === G) {
        return false;
      }
      H = j(H);
      while (!s(H) && F++ < d) {
        if (H === G) {
          return true;
        }
        H = j(H);
      }
      if (F >= d) {
        y.clog("Overstat isChildOf() hit iterations limit");
      }
      return false;
    }
    function C(F) {
      if (F.nativeEvent) {
        F = F.nativeEvent;
      }
      return F;
    }
    function h(F) {
      F = i(F);
      if (!F) {
        return -1;
      }
      return F.nodeType || -1;
    }
    function B(F) {
      F = i(F);
      if (!F) {
        return "";
      }
      return F.tagName ? F.tagName.toUpperCase() : "";
    }
    function m(G) {
      var F = B(G);
      return h(G) !== 1 || F === "TR" || F === "TBODY" || F === "THEAD";
    }
    function g(F) {
      if (!F) {
        return "";
      }
      if (F.xPath) {
        return F.xPath;
      }
      F = i(F);
      return e.getXPathFromNode(F);
    }
    function z(G, F) {
      var H = p[G];
      if (H && H[F]) {
        return H[F]();
      }
    }
    function u(G, I, H, F) {
      this.xPath = G !== null ? g(G) : "";
      this.domNode = G;
      this.hoverDuration = 0;
      this.hoverUpdateTime = 0;
      this.gridX = Math.max(I, 0);
      this.gridY = Math.max(H, 0);
      this.parentKey = "";
      this.updateTimer = -1;
      this.disposed = false;
      this.childKeys = {};
      this.webEvent = F;
      this.getKey = function () {
        return this.xPath + ":" + this.gridX + "," + this.gridY;
      };
      this.update = function () {
        var K = new Date().getTime(),
          J = this.getKey();
        if (this.hoverUpdateTime !== 0) {
          this.hoverDuration += K - this.hoverUpdateTime;
        }
        this.hoverUpdateTime = K;
        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(function () {
          z(J, "update");
        }, x("updateInterval"));
      };
      this.dispose = function (J) {
        clearTimeout(this.updateTimer);
        delete p[this.getKey()];
        this.disposed = true;
        if (J) {
          var K = this.clone();
          p[K.getKey()] = K;
          K.update();
        }
      };
      this.process = function (M) {
        clearTimeout(this.updateTimer);
        if (this.disposed) {
          return false;
        }
        var K = false,
          L = this,
          J = 0;
        if (this.hoverDuration >= x("hoverThreshold")) {
          this.hoverDuration = Math.min(
            this.hoverDuration,
            x("hoverThresholdMax")
          );
          K = true;
          E(this, { hoverToClick: !!M });
          while (typeof L !== "undefined" && J++ < d) {
            L.dispose(M);
            L = p[L.parentKey];
          }
          if (J >= d) {
            y.clog("Overstat process() hit iterations limit");
          }
        } else {
          this.dispose(M);
        }
        return K;
      };
      this.clone = function () {
        var J = new u(this.domNode, this.gridX, this.gridY);
        J.parentKey = this.parentKey;
        return J;
      };
    }
    function D(H, F, I, G) {
      return new u(H, F, I, G);
    }
    function r(H) {
      if (H && H.position) {
        return { x: H.position.x, y: H.position.y };
      }
      H = i(H);
      var F = H && H.getBoundingClientRect ? H.getBoundingClientRect() : null,
        L = F ? F.left : H ? H.offsetLeft : 0,
        K = F ? F.top : H ? H.offsetHeight : 0,
        N = L,
        M = K,
        I = 0,
        G = 0,
        J = n(H),
        O = 0;
      while (J && O++ < d) {
        if (s(J)) {
          break;
        }
        I = J.offsetLeft - (J.scrollLeft || 0);
        G = J.offsetTop - (J.scrollTop || 0);
        if (I !== N || G !== M) {
          L += I;
          K += G;
          N = I;
          M = G;
        }
        J = n(J);
      }
      if (O >= d) {
        y.clog("Overstat calculateNodeOffset() hit iterations limit");
      }
      if (isNaN(L)) {
        L = 0;
      }
      if (isNaN(K)) {
        K = 0;
      }
      return { x: L, y: K };
    }
    function a(J, H, G) {
      J = i(J);
      var I = r(J),
        F = H - I.x,
        K = G - I.y;
      if (!isFinite(F)) {
        F = 0;
      }
      if (!isFinite(K)) {
        K = 0;
      }
      return { x: F, y: K };
    }
    function w(F, G) {
      F = Math.floor(Math.min(Math.max(F, 0), 1) * 10000) / 10000;
      G = Math.floor(Math.min(Math.max(G, 0), 1) * 10000) / 10000;
      return F + "," + G;
    }
    function f(J, M, L) {
      J = i(J);
      var H = J.getBoundingClientRect ? J.getBoundingClientRect() : null,
        R = H ? H.width : J.offsetWidth,
        I = H ? H.height : J.offsetHeight,
        K =
          R && R > 0
            ? Math.max(R / x("gridCellMaxX"), x("gridCellMinWidth"))
            : x("gridCellMinWidth"),
        O =
          I && I > 0
            ? Math.max(I / x("gridCellMaxY"), x("gridCellMinHeight"))
            : x("gridCellMinHeight"),
        G = Math.min(Math.floor(M / K), x("gridCellMaxX")),
        F = Math.min(Math.floor(L / O), x("gridCellMaxY")),
        Q = R > 0 ? M / R : 0,
        N = I > 0 ? L / I : 0,
        P = "";
      if (!isFinite(G)) {
        G = 0;
      }
      if (!isFinite(F)) {
        F = 0;
      }
      P = w(Q, N);
      return { x: G, y: F, relXY: P };
    }
    function c(J) {
      var K = J,
        L = J.getKey(),
        G = {},
        H = null,
        I = false,
        F = 0;
      G[L] = true;
      while (typeof K !== "undefined" && F++ < d) {
        G[K.parentKey] = true;
        if (K.parentKey === "" || K.parentKey === K.getKey()) {
          break;
        }
        if (F >= d) {
          y.clog("Overstat cleanupHoverEvents() hit iterations limit");
        }
        K = p[K.parentKey];
      }
      for (H in p) {
        if (p.hasOwnProperty(H) && !G[H]) {
          K = p[H];
          if (K) {
            if (!I) {
              I = K.process();
            } else {
              K.dispose();
            }
          }
        }
      }
    }
    function t(G, I) {
      var J = null,
        F = null,
        H = false;
      for (F in p) {
        if (p.hasOwnProperty(F)) {
          J = p[F];
          if (J && J.domNode === G && J.getKey() !== I) {
            if (!H) {
              H = J.process();
            } else {
              J.dispose();
            }
          }
        }
      }
    }
    function b(J, H, I) {
      if (!H) {
        H = J.target;
      }
      if (s(H)) {
        return null;
      }
      if (y.isiOS || y.isAndroid) {
        return null;
      }
      var F, O, K, N, L, M, G;
      if (!m(H)) {
        F = a(H, J.position.x, J.position.y);
        O = f(H, F.x, F.y);
        K = new u(H, O.x, O.y, J);
        K.relXY = O.relXY;
        N = K.getKey();
        if (p[N]) {
          K = p[N];
        } else {
          p[N] = K;
        }
        K.update();
        if (!I) {
          G = n(H);
          if (G) {
            M = b(J, G, true);
            if (M !== null) {
              L = M.getKey();
              N = K.getKey();
              if (N !== L) {
                K.parentKey = L;
              }
            }
          }
          c(K);
        }
      } else {
        K = b(J, n(H), I);
      }
      return K;
    }
    function q(F) {
      F = C(F);
      if (v(F.target, F.relatedTarget)) {
        return;
      }
      t(F.target);
    }
    function l(H) {
      var I = null,
        F = null,
        G = false;
      for (F in p) {
        if (p.hasOwnProperty(F)) {
          I = p[F];
          if (I) {
            if (!G) {
              G = I.process(true);
            } else {
              I.dispose();
            }
          }
        }
      }
    }
    function o(F) {
      e.performFormCompletion(true);
    }
    function k(G) {
      var F = y.getValue(G, "target.id");
      if (!F) {
        return;
      }
      switch (G.type) {
        case "mousemove":
          b(G);
          break;
        case "mouseout":
          q(G);
          break;
        case "click":
          l(G);
          break;
        case "submit":
          o(G);
          break;
        default:
          break;
      }
    }
    return {
      init: function () {},
      destroy: function () {
        var F;
        for (F in p) {
          if (p.hasOwnProperty(F)) {
            p[F].dispose();
            delete p[F];
          }
        }
      },
      onevent: function (F) {
        if (typeof F !== "object" || !F.type) {
          return;
        }
        k(F);
      },
      onmessage: function (F) {},
      createHoverEvent: D,
      cleanupHoverEvents: c,
      eventMap: p,
    };
  });
} else {
}
if (TLT && typeof TLT.addModule === "function") {
  TLT.addModule("performance", function (b) {
    var i = {
        loadReceived: false,
        unloadReceived: false,
        perfEventSent: false,
      },
      d = null,
      g = 0,
      q,
      n = b.utils,
      j = window.location.protocol === "https:",
      f = [],
      o,
      e = 0,
      h,
      m = { enabled: false, resourceTypes: [], blacklist: [] };
    function s(u) {
      var w = 0,
        t = {},
        x = "",
        v = 0;
      if (!u || typeof u !== "object" || !u.navigationStart) {
        return {};
      }
      w = u.navigationStart;
      for (x in u) {
        if (
          Object.prototype.hasOwnProperty.call(u, x) ||
          typeof u[x] === "number"
        ) {
          v = u[x];
          if (typeof v === "number" && v && x !== "navigationStart") {
            t[x] = v - w;
          } else {
            t[x] = v;
          }
        }
      }
      return t;
    }
    function c(v) {
      var w = 0,
        u,
        t;
      if (v) {
        u =
          v.responseEnd > 0 && v.responseEnd < v.domLoading
            ? v.responseEnd
            : v.domLoading;
        t = v.loadEventStart;
        if (n.isNumeric(u) && n.isNumeric(t) && t > u) {
          w = t - u;
        }
      }
      return w;
    }
    function a(u) {
      var t = b.getStartTime();
      if (u.timestamp > t && !g) {
        g = u.timestamp - t;
      }
    }
    function k(w, x) {
      var u,
        y = { type: 7, performance: {} },
        t,
        z,
        v;
      if (!w || i.perfEventSent) {
        return;
      }
      z = w.performance || {};
      v = z.timing;
      t = z.navigation;
      if (v) {
        if (!v.loadEventStart && !x) {
          return;
        }
        y.performance.timing = s(v);
        y.performance.timing.renderTime = c(v);
      } else {
        if (q.calculateRenderTime) {
          y.performance.timing = { renderTime: g, calculated: true };
        } else {
          return;
        }
      }
      if (
        q.renderTimeThreshold &&
        y.performance.timing.renderTime > q.renderTimeThreshold
      ) {
        y.performance.timing.invalidRenderTime =
          y.performance.timing.renderTime;
        delete y.performance.timing.renderTime;
      }
      if (t) {
        switch (t.type) {
          case 0:
            u = "NAVIGATE";
            break;
          case 1:
            u = "RELOAD";
            break;
          case 2:
            u = "BACKFORWARD";
            break;
          default:
            u = "UNKNOWN";
            break;
        }
        y.performance.navigation = { type: u, redirectCount: t.redirectCount };
      }
      b.post(y);
      i.perfEventSent = true;
      if (d) {
        clearInterval(d);
        d = null;
      }
    }
    function p(v) {
      var u = { type: 20, violations: {} },
        t = u.violations;
      if (!v || !v.length) {
        return;
      }
      t.total = v.length;
      v.splice(10);
      t.urls = v;
      b.post(u);
    }
    function l(z) {
      var w,
        v,
        x,
        u = h.blacklist,
        t,
        y,
        A;
      if (!z || !z.name) {
        return;
      }
      v = z.name;
      x = z.initiatorType;
      if (j && v.indexOf("http:") === 0) {
        f.push(v);
      }
      if (h.hasOwnProperty("maxAlerts") && e >= h.maxAlerts) {
        return;
      }
      if (h.hasOwnProperty("threshold") && z.duration < h.threshold) {
        return;
      }
      if (
        (z.transferSize && z.transferSize < z.encodedBodySize) ||
        z.responseStart === z.responseEnd
      ) {
        return;
      }
      if (h.resourceTypes.length > 0 && h.resourceTypes.indexOf(x) === -1) {
        return;
      }
      y = false;
      for (w = 0; w < u.length; w += 1) {
        t = u[w];
        switch (typeof t) {
          case "object":
            if (!t.cRegex) {
              t.cRegex = new RegExp(t.regex, t.flags);
            }
            t.cRegex.lastIndex = 0;
            if (t.cRegex.test(v)) {
              y = true;
            }
            break;
          case "string":
            if (v.indexOf(t) !== -1) {
              y = true;
            }
            break;
          default:
            break;
        }
      }
      if (!y) {
        e += 1;
        A = {
          urlNormalized: b.normalizeUrl(v, 17),
          url: v,
          initiator: x,
          duration: Math.round(z.duration),
          responseEnd: Math.round(z.responseEnd),
        };
        if (typeof z.transferSize !== "undefined") {
          A.transferSize = z.transferSize;
          if (z.duration) {
            A.bps = Math.round((z.transferSize / z.duration) * 1000);
          }
        }
        b.post({ type: 17, resourceData: A });
      }
    }
    function r() {
      var t;
      if (!h.enabled || typeof window.PerformanceObserver !== "function") {
        return;
      }
      o = new window.PerformanceObserver(function (u, v) {
        n.forEach(u.getEntries(), l);
      });
      t = window.performance.getEntriesByType("resource");
      setTimeout(function () {
        n.forEach(t, l);
      });
      o.observe({ entryTypes: ["resource"] });
    }
    return {
      init: function () {
        q = b.getConfig();
        h = n.mixin({}, m, q.performanceAlert);
      },
      destroy: function () {
        if (d) {
          clearInterval(d);
          d = null;
          k(window, true);
        }
        if (o) {
          o.disconnect();
        }
        if (j) {
          p(f);
          f = [];
        }
        q = null;
      },
      onevent: function (t) {
        if (typeof t !== "object" || !t.type) {
          return;
        }
        switch (t.type) {
          case "load":
            i.loadReceived = true;
            a(t);
            if (!i.perfEventSent && !d) {
              d = setInterval(function () {
                if (b.isInitialized()) {
                  k(window);
                }
              }, n.getValue(q, "delay", 2000));
            }
            r();
            break;
          case "screenview_load":
            if (!i.perfEventSent) {
              k(window);
            }
            break;
          case "unload":
            i.unloadReceived = true;
            if (!i.perfEventSent) {
              k(window);
            }
            break;
          default:
            break;
        }
      },
      onmessage: function (t) {},
    };
  });
} else {
}
TLT.addModule("replay", function (aj) {
  var ab = aj.utils,
    O = 0,
    ao = { scale: 0, timestamp: 0 },
    aE = {},
    az = null,
    D = [],
    U = 0,
    Y = true,
    X = null,
    an = null,
    v = 0,
    ac = "",
    au = "",
    o = null,
    W = new Date().getTime(),
    t = 0,
    aw = null,
    r = "root",
    ae,
    I = null,
    ai = null,
    ap = null,
    Z = null,
    P = null,
    f = { inFocus: false },
    ay = null,
    K = aj.getConfig() || {},
    i = ab.getValue(K, "viewPortWidthHeightLimit", 10000),
    m = 1,
    Q = 1,
    S,
    g = {},
    u = ab.getValue(K, "mousemove") || {},
    ah = u.sampleRate,
    L = u.ignoreRadius,
    J = null,
    h = [],
    w = [],
    b = {},
    n = 0,
    H = 1000,
    d = 0,
    ax = [],
    x = [],
    C = document.visibilityState === "visible" ? true : false;
  function aa() {
    var aF;
    for (aF in aE) {
      if (aE.hasOwnProperty(aF)) {
        aE[aF].visitedCount = 0;
      }
    }
  }
  function aD(aH) {
    var aF = false,
      aG = "|button|image|submit|reset|",
      aI = null;
    if (typeof aH !== "object" || !aH.type) {
      return aF;
    }
    switch (aH.type.toLowerCase()) {
      case "input":
        aI = "|" + (aH.subType || "") + "|";
        aF = aG.indexOf(aI.toLowerCase()) !== -1;
        break;
      case "select":
      case "textarea":
        aF = false;
        break;
      default:
        aF = true;
        break;
    }
    return aF;
  }
  function av(aG) {
    var aF = [];
    aG = aG.parentNode;
    while (aG) {
      aF.push(aG);
      aG = aG.parentNode;
    }
    return aF;
  }
  function l(aF) {
    return ab.some(aF, function (aH) {
      var aG = ab.getTagName(aH);
      if (aG === "a" || aG === "button") {
        return aH;
      }
      return null;
    });
  }
  function F(aF) {
    var aG = aF.type,
      aH = aF.target;
    if (typeof aG === "string") {
      aG = aG.toLowerCase();
    } else {
      aG = "unknown";
    }
    if (aG === "blur") {
      aG = "focusout";
    }
    if (aG === "change") {
      if (aH.type === "INPUT") {
        switch (aH.subType) {
          case "text":
          case "date":
          case "time":
            aG = aH.subType + "Change";
            break;
          default:
            aG = "valueChange";
            break;
        }
      } else {
        if (aH.type === "TEXTAREA") {
          aG = "textChange";
        } else {
          aG = "valueChange";
        }
      }
    }
    return aG;
  }
  function ar(aF, aJ, aG) {
    var aH, aI, aK;
    if (document.querySelector(aF)) {
      return true;
    }
    for (aH = 0; aH < aJ.length; aH++) {
      aK = aJ[aH];
      if (aK.querySelector(aF)) {
        return true;
      }
    }
    for (aH = 0; aH < aG.length; aH++) {
      aI = aG[aH];
      if (aI.querySelector(aF)) {
        return true;
      }
    }
    return false;
  }
  function aq(aJ, aO, aG) {
    var aM, aK, aP, aI, aQ, aF, aN, aH, aL;
    for (aM = 0; aM < x.length; aM++) {
      aN = x[aM];
      aK = aN.delayUntil.selector;
      aP = ab.getValue(aN.delayUntil, "exists", true);
      aI = aN.delayUntil.dualSnapshot || false;
      aQ = ar(aK, aO, aG);
      aF = aN.lastStatus || false;
      aH = aN.config || {};
      aL = aN.timerId;
      if (
        (aP === true && aQ === true && aF === false) ||
        (aP === false && aQ === false && aF === true) ||
        (aI === true && aQ === true && aF === false) ||
        (aI === true && aQ === false && aF === true)
      ) {
        aj.performDOMCapture(document, aH);
        if (!aI || aQ === false) {
          x.splice(aM--, 1);
          if (x.length === 0) {
            TLT.registerMutationCallback(aq, false);
          }
          if (aL) {
            clearTimeout(aL);
          }
        }
      }
      aN.lastStatus = aQ;
    }
  }
  function A(aI) {
    var aH, aF, aG;
    for (aH = 0; aH < x.length; aH += 1) {
      aF = x[aH];
      aG = aF.config || {};
      if (aG.dcid === aI) {
        aG.timeoutExpired = true;
        aj.performDOMCapture(document, aG);
        x.splice(aH--, 1);
        if (x.length === 0) {
          TLT.registerMutationCallback(aq, false);
        }
      }
    }
  }
  function k(aF, aH, aG) {
    var aJ = null,
      aI;
    if (!aF) {
      return aJ;
    }
    aH = aH || {};
    aH.eventOn = Y;
    Y = false;
    if (aG) {
      aJ = "dcid-" + ab.getSerialNumber() + "." + new Date().getTime() + "s";
      if (typeof aG === "object") {
        aH.dcid = aJ;
        aI = { config: aH, delayUntil: aG, lastStatus: false };
        x.push(aI);
        TLT.registerMutationCallback(aq, true);
        if (typeof aG.timeout !== "undefined" && aG.timeout >= 0) {
          aI.timerId = window.setTimeout(function () {
            A(aJ);
          }, aG.timeout);
        }
      } else {
        window.setTimeout(function () {
          aH.dcid = aJ;
          aj.performDOMCapture(aF, aH);
        }, aG);
      }
    } else {
      delete aH.dcid;
      aJ = aj.performDOMCapture(aF, aH);
    }
    return aJ;
  }
  function T(aG, aI) {
    var aH, aF, aJ, aK;
    for (aH = 0, aF = aG.length; aH < aF; aH += 1) {
      aJ = aG[aH];
      if (aI && aI.indexOf("#") === 0) {
        aK = location.pathname + aI;
      } else {
        if (typeof aI === "undefined" || aI === r) {
          aK = location.pathname + location.hash;
        } else {
          aK = aI;
        }
      }
      aK = aj.normalizeUrl(aK, 2);
      switch (typeof aJ) {
        case "object":
          if (!aJ.cRegex) {
            aJ.cRegex = new RegExp(aJ.regex, aJ.flags);
          }
          aJ.cRegex.lastIndex = 0;
          if (aJ.cRegex.test(aK)) {
            return true;
          }
          break;
        case "string":
          if (aJ === aK) {
            return true;
          }
          break;
        default:
          break;
      }
    }
    return false;
  }
  function ak() {
    var aF = false,
      aG;
    if (!u.enabled || window.hasOwnProperty("ontouchstart")) {
      return;
    }
    if (h.length === 0) {
      return;
    }
    if (n >= H) {
      aF = true;
    }
    aG = {
      type: 18,
      mousemove: {
        elements: w.slice(0),
        data: h.slice(0),
        config: { ignoreRadius: u.ignoreRadius, sampleRate: u.sampleRate },
        limitReached: aF,
        maxInactivity: d,
      },
    };
    aj.post(aG);
    w.length = 0;
    h.length = 0;
    b = {};
    d = 0;
    return aG;
  }
  function aB(aG, aS, aH) {
    var aN,
      aL,
      aV = false,
      aI = {},
      aU = false,
      aK,
      aP,
      aR = null,
      aM = 0,
      aQ,
      aO,
      aF,
      aJ,
      aT;
    if (!aG || (!aS && !aH)) {
      return aR;
    }
    if (!aS && !(aG === "load" || aG === "unload")) {
      return aR;
    }
    K = aj.getConfig() || {};
    aU = ab.getValue(K, "domCapture.enabled", false);
    if (!aU || ab.isLegacyIE) {
      return aR;
    }
    aT = ab.getValue(K, "domCapture.screenviewBlacklist", []);
    if (T(aT, aH)) {
      return aR;
    }
    aP = ab.getValue(K, "domCapture.triggers") || [];
    for (aN = 0, aQ = aP.length; !aV && aN < aQ; aN += 1) {
      aK = aP[aN];
      if (aK.event === aG) {
        if (aG === "load" || aG === "unload") {
          if (aK.screenviews) {
            aF = aK.screenviews;
            for (aL = 0, aJ = aF.length; !aV && aL < aJ; aL += 1) {
              aO = aF[aL];
              switch (typeof aO) {
                case "object":
                  if (!aO.cRegex) {
                    aO.cRegex = new RegExp(aO.regex, aO.flags);
                  }
                  aO.cRegex.lastIndex = 0;
                  aV = aO.cRegex.test(aH);
                  break;
                case "string":
                  aV = aO === aH;
                  break;
                default:
                  break;
              }
            }
          } else {
            aV = true;
          }
        } else {
          if (aK.targets) {
            aV = -1 !== ab.matchTarget(aK.targets, aS);
          } else {
            aV = true;
          }
        }
      }
      if (aK.event === "change" && aK.delayUntil) {
        ax = ax.concat(aK.targets);
      }
    }
    if (aV) {
      aM = aK.delay || aK.delayUntil || (aK.event === "load" ? 7 : 0);
      aI.forceFullDOM = !!aK.fullDOMCapture;
      aR = k(window.document, aI, aM);
      if (aR) {
        ak();
      }
    }
    return aR;
  }
  function at(aN) {
    var aH,
      aI = ab.getValue(aN, "webEvent.target", {}),
      aF = aI.type,
      aJ = aI.subType || "",
      aG = ab.getTlType(aI),
      aK = av(ab.getValue(aI, "element")),
      aM = null,
      aL = ab.getValue(aN, "webEvent.subType", null);
    aH = {
      timestamp: ab.getValue(aN, "webEvent.timestamp", 0),
      type: 4,
      target: {
        id: aI.id || "",
        idType: aI.idType,
        name: aI.name,
        tlType: aG,
        type: aF,
        position: {
          width: ab.getValue(aI, "size.width"),
          height: ab.getValue(aI, "size.height"),
        },
        currState: aN.currState || null,
      },
      event: {
        tlEvent: F(ab.getValue(aN, "webEvent")),
        type: ab.getValue(aN, "webEvent.type", "UNKNOWN"),
      },
    };
    if (aJ) {
      aH.target.subType = aJ;
    }
    if (typeof aN.dwell === "number" && aN.dwell > 0) {
      aH.target.dwell = aN.dwell;
    }
    if (typeof aN.visitedCount === "number") {
      aH.target.visitedCount = aN.visitedCount;
    }
    if (typeof aN.prevState !== "undefined") {
      aH.prevState = aN.prevState;
    }
    if (aL) {
      aH.event.subType = aL;
    }
    aM = l(aK);
    aH.target.isParentLink = !!aM;
    if (aM) {
      if (aM.href) {
        aH.target.currState = aH.target.currState || {};
        aH.target.currState.href = aH.target.currState.href || aM.href;
      }
      if (aM.value) {
        aH.target.currState = aH.target.currState || {};
        aH.target.currState.value = aH.target.currState.value || aM.value;
      }
      if (aM.innerText || aM.textContent) {
        aH.target.currState = aH.target.currState || {};
        aH.target.currState.innerText = ab.trim(
          aH.target.currState.innerText || aM.innerText || aM.textContent
        );
      }
    }
    if (ab.isUndefOrNull(aH.target.currState)) {
      delete aH.target.currState;
    }
    if (ab.isUndefOrNull(aH.target.name)) {
      delete aH.target.name;
    }
    return aH;
  }
  function ag(aF) {
    aj.post(aF);
  }
  function aC(aJ) {
    var aH,
      aF,
      aK = aJ.length,
      aM,
      aL,
      aI,
      aN = { mouseout: true, mouseover: true },
      aG = [];
    for (aH = 0; aH < aK; aH += 1) {
      aM = aJ[aH];
      if (!aM) {
        continue;
      }
      if (aN[aM.event.type]) {
        aG.push(aM);
      } else {
        for (aF = aH + 1; aF < aK && aJ[aF]; aF += 1) {
          if (!aN[aJ[aF].event.type]) {
            break;
          }
        }
        if (aF < aK) {
          aL = aJ[aF];
          if (
            aL &&
            aM.target.id === aL.target.id &&
            aM.event.type !== aL.event.type
          ) {
            if (aM.event.type === "click") {
              aI = aM;
              aM = aL;
              aL = aI;
            }
            if (aL.event.type === "click") {
              aM.target.position = aL.target.position;
              aH += 1;
            } else {
              if (aL.event.type === "blur") {
                aM.target.dwell = aL.target.dwell;
                aM.target.visitedCount = aL.target.visitedCount;
                aM.focusInOffset = aL.focusInOffset;
                aM.target.position = aL.target.position;
                aH += 1;
              }
            }
            aJ[aF] = null;
            aJ[aH] = aM;
          }
        }
        aG.push(aJ[aH]);
      }
    }
    for (aM = aG.shift(); aM; aM = aG.shift()) {
      aj.post(aM);
    }
    aJ.splice(0, aJ.length);
  }
  function aA(aG) {
    var aI = null,
      aJ,
      aL = ab.getValue(aG, "nativeEvent.message"),
      aH = ab.getValue(aG, "nativeEvent.filename", ""),
      aF = ab.getValue(aG, "nativeEvent.lineno", -1),
      aK = ab.getValue(aG, "nativeEvent.error");
    if (typeof aL !== "string") {
      return;
    }
    if (aH) {
      aH = aj.normalizeUrl(aH, 6);
    }
    if (aK && aK.stack) {
      aJ = aK.stack.toString();
    } else {
      aJ = (aL + " " + aH + " " + aF).toString();
    }
    if (g[aJ]) {
      g[aJ].exception.repeats = g[aJ].exception.repeats + 1;
    } else {
      aI = { type: 6, exception: { description: aL, url: aH, line: aF } };
      aj.post(aI);
      g[aJ] = { exception: { description: aL, url: aH, line: aF, repeats: 1 } };
    }
    v += 1;
  }
  function G(aF, aG) {
    D.push(
      at({ webEvent: aF, id: aG, currState: ab.getValue(aF, "target.state") })
    );
  }
  function ad(aL, aG, aI) {
    var aH = false,
      aK,
      aF,
      aJ;
    if (!aL) {
      return;
    }
    if (D.length === 0) {
      return;
    }
    aG = aG || (aE[aL] ? aE[aL].webEvent : {});
    if (aG.type === "blur" || aG.type === "change") {
      aJ = ab.getValue(aG, "target.state", {});
    } else {
      if (aG.target) {
        aJ = ab.getTargetState(aG.target.element) || {};
      } else {
        aJ = {};
      }
    }
    if (aJ && aJ.disabled) {
      aI = true;
    }
    aF = D[D.length - 1];
    if (aE[aL]) {
      aF.focusInOffset = aE[aL].focusInOffset;
      aF.target.visitedCount = aE[aL].visitedCount;
      if (aE[aL].focus) {
        aE[aL].dwell = Number(new Date()) - aE[aL].focus;
        aF.target.dwell = aE[aL].dwell;
      }
      if (!aE[aL].processedChange && aE[aL].prevState && !aI) {
        if (!ab.isEqual(aE[aL].prevState, aJ)) {
          aG.type = "change";
          aF.event.type = aG.type;
          aF.event.tlEvent = F(aG);
          aF.target.prevState = aE[aL].prevState;
          aF.target.currState = aJ;
        }
      }
    } else {
      aE[aL] = {};
    }
    if (aF.event.type === "click") {
      if (!aD(aF.target)) {
        aF.target.currState = aJ;
        aH = true;
      }
    } else {
      if (aF.event.type === "focus") {
        aH = true;
      }
    }
    if (aH && !aI) {
      aF.event.type = "blur";
      aF.event.tlEvent = "focusout";
    }
    if (!aF.dcid) {
      aK = aB(aF.event.type, aG.target);
      if (aK) {
        aF.dcid = aK;
      }
    }
    if (!aI) {
      f.inFocus = false;
    }
    aE[aL].prevState = aJ ? ab.mixin({}, aJ) : aJ;
    aC(D);
  }
  function j(aI, aG) {
    var aH = D.length,
      aF = aH ? D[aH - 1] : null;
    if (f.inFocus && f.target.id === aI) {
      if (!aF || aF.target.id !== aI) {
        G(aG, aI);
        aE[aI].processedChange = false;
        aE[aI].processedClick = false;
      }
      return;
    }
    if (f.inFocus) {
      ad(f.target.id, f);
    }
    f = aG;
    f.inFocus = true;
    if (!aE[aI]) {
      aE[aI] = {};
    }
    aE[aI].focus = f.dwellStart = Number(new Date());
    aE[aI].focusInOffset = ai ? f.dwellStart - Number(ai) : -1;
    if (aG.type === "focus") {
      aE[aI].prevState = ab.getValue(aG, "target.state");
    } else {
      if (aG.type === "click" && !aE[aI].prevState) {
        aE[aI].prevState = ab.getValue(aG, "target.state");
        if (
          aE[aI].prevState &&
          (aG.target.subType === "checkbox" || aG.target.subType === "radio")
        ) {
          aE[aI].prevState.checked = !aE[aI].prevState.checked;
        }
      }
    }
    aE[aI].visitedCount = aE[aI].visitedCount + 1 || 1;
    aE[aI].webEvent = aG;
    aE[aI].processedChange = false;
    aE[aI].processedClick = false;
    G(aG, aI);
  }
  function N(aK, aH) {
    var aG = false,
      aI,
      aJ = D.length,
      aF = aJ ? D[aJ - 1] : null;
    if (!aF) {
      return aG;
    }
    aI = aF.target.id;
    if (aI !== aK && aF.target.tltype !== "selectList") {
      if (
        aH.type === "focus" ||
        aH.type === "click" ||
        aH.type === "change" ||
        aH.type === "blur" ||
        aH.type === "unload"
      ) {
        ad(aI);
        aG = true;
      }
    }
    if (
      aI === aK &&
      ((aH.type === "click" && aE[aK].processedClick) ||
        (aH.type === "change" && aE[aK].processedChange) ||
        (aH.type === "pointerup" &&
          aE[aK].processedClick &&
          ab.getValue(aH.target, "state.disabled", false)))
    ) {
      ad(aI, null, true);
      aG = true;
    }
    return aG;
  }
  function B(aH, aG) {
    var aF;
    j(aH, aG);
    aF = D[D.length - 1];
    aF.event.type = "change";
    aF.event.tlEvent = F(aG);
    aF.target.currState = aG.target.state;
    if (aE[aH].prevState) {
      aF.target.prevState = aE[aH].prevState;
    }
    aE[aH].webEvent = aG;
    aE[aH].processedChange = true;
    if (ab.matchTarget(ax, aG.target) !== -1) {
      ad(aH, aG);
    }
  }
  function M(aI, aH) {
    var aG, aF;
    if (aH.target.type === "select" && ay && ay.target.id === aI) {
      ay = null;
      return;
    }
    j(aI, aH);
    aG = D[D.length - 1];
    if (aG.event.type === "focus") {
      aG.event.type = "click";
      aG.event.tlEvent = F(aH);
    }
    aF = aH.nativeEvent;
    if (
      aF &&
      (!window.MouseEvent ||
        !(aF instanceof MouseEvent && aF.detail === 0) ||
        (window.PointerEvent &&
          aF instanceof PointerEvent &&
          aF.pointerType !== ""))
    ) {
      aG.target.position.relXY = ab.getValue(aH, "target.position.relXY");
    }
    if (!aE[aI].processedChange) {
      aE[aI].webEvent = aH;
    }
    aE[aI].processedClick = true;
    if (aD(aH.target)) {
      ad(aI, aH, true);
    }
    ay = aH;
  }
  function R(aH, aG) {
    var aF = aH;
    if (!ab.getValue(aG, "target.element.disabled", false)) {
      return;
    }
    switch (aG.type) {
      case "pointerdown":
        o = aF;
        break;
      case "pointerup":
        if (aF === o) {
          aG.type = "click";
          M(aH, aG);
        }
        o = null;
        break;
    }
  }
  function c(aJ) {
    var aH,
      aN = 0,
      aF = 0,
      aI,
      aG,
      aL,
      aM,
      aK;
    if (!u.enabled || window.hasOwnProperty("ontouchstart")) {
      return;
    }
    if (n >= H) {
      return;
    }
    aH = {
      element: { id: aJ.target.id, idType: aJ.target.idType },
      x: aJ.position.x,
      y: aJ.position.y,
      offset: aj.getCurrentOffset(),
    };
    if (J !== null) {
      aN = aH.offset - J.offset;
      if (ah && aN < ah) {
        return;
      }
      aM = Math.abs(aH.x - J.x);
      aK = Math.abs(aH.y - J.y);
      aF = aM > aK ? aM : aK;
      if (L && aF < L) {
        return;
      }
      if (aN > d) {
        d = aN;
      }
    }
    aI = JSON.stringify(aH.element);
    aG = b[aI];
    if (typeof aG === "undefined") {
      w.push(aH.element);
      aG = w.length - 1;
      b[aI] = aG;
    }
    aL = ab.getValue(aJ, "target.position.relXY").split(",");
    h.push([aG, aL[0], aL[1], aH.offset]);
    n += 1;
    J = aH;
  }
  function a(aG) {
    var aF = aG.orientation,
      aH = {
        type: 4,
        event: { type: "orientationchange" },
        target: {
          prevState: {
            orientation: O,
            orientationMode: ab.getOrientationMode(O),
          },
          currState: {
            orientation: aF,
            orientationMode: ab.getOrientationMode(aF),
          },
        },
      };
    ag(aH);
    O = aF;
  }
  function s(aF) {
    var aI = document.visibilityState === "visible" ? true : false,
      aH = {
        type: 4,
        event: { type: "visibilitychange" },
        target: { prevState: { visible: C }, currState: { visible: aI } },
      },
      aG;
    aG = aB(aF.type, aF.target);
    if (aG) {
      aH.dcid = aG;
    }
    ag(aH);
    C = aI;
  }
  function e(aG) {
    var aF = false;
    if (!aG) {
      return aF;
    }
    aF =
      ao.scale === aG.scale &&
      Math.abs(new Date().getTime() - ao.timestamp) < 500;
    return aF;
  }
  function V(aF) {
    ao.scale = aF.scale;
    ao.rotation = aF.rotation;
    ao.timestamp = new Date().getTime();
  }
  function E() {
    var aF, aG;
    aF = m - Q;
    if (isNaN(aF)) {
      aG = "INVALID";
    } else {
      if (aF < 0) {
        aG = "CLOSE";
      } else {
        if (aF > 0) {
          aG = "OPEN";
        } else {
          aG = "NONE";
        }
      }
    }
    return aG;
  }
  function y(aJ) {
    var aO = document.documentElement || {},
      aL = document.body || {},
      aP = window.screen,
      aG = aP.width,
      aH = aP.height,
      aK = ab.getValue(aJ, "orientation", 0),
      aM = !ab.isiOS ? aG : Math.abs(aK) === 90 ? aH : aG,
      aI = {
        type: 1,
        clientState: {
          pageWidth: Math.max(
            aL.clientWidth || 0,
            aO.offsetWidth || 0,
            aO.scrollWidth || 0
          ),
          pageHeight: Math.max(
            aL.clientHeight || 0,
            aO.offsetHeight || 0,
            aO.scrollHeight || 0
          ),
          viewPortWidth: window.innerWidth || aO.clientWidth,
          viewPortHeight: window.innerHeight || aO.clientHeight,
          viewPortX: Math.round(
            window.pageXOffset || (aO || aL).scrollLeft || 0
          ),
          viewPortY: Math.round(
            window.pageYOffset || (aO || aL).scrollTop || 0
          ),
          deviceOrientation: aK,
          event: ab.getValue(aJ, "type"),
        },
      },
      aN = aI.clientState,
      aF;
    an = an || aI;
    if (
      aN.event === "unload" &&
      aN.viewPortHeight === aN.pageHeight &&
      aN.viewPortWidth === aN.pageWidth
    ) {
      if (an.clientState.viewPortHeight < aN.viewPortHeight) {
        aN.viewPortHeight = an.clientState.viewPortHeight;
        aN.viewPortWidth = an.clientState.viewPortWidth;
      }
    }
    if (aN.viewPortY + aN.viewPortHeight > aN.pageHeight) {
      aN.viewPortY = aN.pageHeight - aN.viewPortHeight;
    }
    if (aN.viewPortY < 0) {
      aN.viewPortY = 0;
    }
    aF = !aN.viewPortWidth ? 1 : aM / aN.viewPortWidth;
    aN.deviceScale = aF.toFixed(3);
    aN.viewTime = 0;
    if (ap && Z) {
      aN.viewTime = Z.getTime() - ap.getTime();
    }
    if (aJ.type === "scroll") {
      aN.viewPortXStart = an.clientState.viewPortX;
      aN.viewPortYStart = an.clientState.viewPortY;
    }
    return aI;
  }
  function af() {
    var aF;
    if (X) {
      aF = X.clientState;
      if (
        aF.viewPortHeight > 0 &&
        aF.viewPortHeight < i &&
        aF.viewPortWidth > 0 &&
        aF.viewPortWidth < i
      ) {
        ag(X);
      }
      an = X;
      X = null;
      ap = P || ap;
      Z = null;
    }
    af.timeoutId = 0;
  }
  function z(aF) {
    var aG = null;
    if (ab.isOperaMini) {
      return;
    }
    X = y(aF);
    if (aF.type === "scroll" || aF.type === "resize") {
      if (af.timeoutId) {
        window.clearTimeout(af.timeoutId);
      }
      af.timeoutId = window.setTimeout(
        af,
        ab.getValue(K, "scrollTimeout", 2000)
      );
    } else {
      if (aF.type === "touchstart" || aF.type === "load") {
        if (X) {
          Q = parseFloat(X.clientState.deviceScale);
        }
      } else {
        if (aF.type === "touchend") {
          if (X) {
            m = parseFloat(X.clientState.deviceScale);
            af();
          }
        }
      }
    }
    if (aF.type === "load" || aF.type === "unload") {
      if (aF.type === "unload" && W) {
        aG = ab.clone(X);
        aG.clientState.event = "attention";
        aG.clientState.viewTime = new Date().getTime() - W;
      }
      af();
      if (aG) {
        X = aG;
        af();
      }
    }
    return X;
  }
  function am(aG) {
    var aF = ab.getValue(aG, "nativeEvent.touches.length", 0);
    if (aF === 2) {
      z(aG);
    }
  }
  function q(aI) {
    var aH,
      aG = {},
      aJ =
        ab.getValue(aI, "nativeEvent.rotation", 0) ||
        ab.getValue(aI, "nativeEvent.touches[0].webkitRotationAngle", 0),
      aF = null,
      aK = {
        type: 4,
        event: { type: "touchend" },
        target: {
          id: ab.getValue(aI, "target.id"),
          idType: ab.getValue(aI, "target.idType"),
        },
      };
    aH =
      ab.getValue(aI, "nativeEvent.changedTouches.length", 0) +
      ab.getValue(aI, "nativeEvent.touches.length", 0);
    if (aH !== 2) {
      return;
    }
    z(aI);
    aF = { rotation: aJ ? aJ.toFixed(2) : 0, scale: m ? m.toFixed(2) : 1 };
    aF.pinch = E();
    aG.scale = Q ? Q.toFixed(2) : 1;
    aK.target.prevState = aG;
    aK.target.currState = aF;
    ag(aK);
  }
  function al(aP, aI) {
    var aM = ["type", "name", "target.id"],
      aH = null,
      aJ,
      aL,
      aK = true,
      aN = 10,
      aG = 0,
      aO = 0,
      aF = 0;
    if (!aP || !aI || typeof aP !== "object" || typeof aI !== "object") {
      return false;
    }
    for (aJ = 0, aL = aM.length; aK && aJ < aL; aJ += 1) {
      aH = aM[aJ];
      if (ab.getValue(aP, aH) !== ab.getValue(aI, aH)) {
        aK = false;
        break;
      }
    }
    if (aK) {
      aO = ab.getValue(aP, "timestamp");
      aF = ab.getValue(aI, "timestamp");
      if (!(isNaN(aO) && isNaN(aF))) {
        aG = Math.abs(
          ab.getValue(aP, "timestamp") - ab.getValue(aI, "timestamp")
        );
        if (isNaN(aG) || aG > aN) {
          aK = false;
        }
      }
    }
    return aK;
  }
  function p(aF) {
    var aH = {
        type: 4,
        event: { tlEvent: F(aF), type: aF.type },
        target: {
          id: ab.getValue(aF, "target.id"),
          idType: ab.getValue(aF, "target.idType"),
          currState: ab.getValue(aF, "target.state"),
        },
      },
      aG;
    aG = aB(aF.type, aF.target);
    if (aG) {
      aH.dcid = aG;
    }
    ag(aH);
  }
  return {
    init: function () {
      D = [];
    },
    destroy: function () {
      ad(az);
      D = [];
      if (af.timeoutId) {
        window.clearTimeout(af.timeoutId);
        af.timeoutId = 0;
      }
    },
    onevent: function (aG) {
      var aM = null,
        aJ = null,
        aF,
        aK,
        aL,
        aI,
        aH = null;
      if (typeof aG !== "object" || !aG.type) {
        return;
      }
      if (al(aG, aw)) {
        aw = aG;
        return;
      }
      aw = aG;
      aM = ab.getValue(aG, "target.id");
      if (!aE[aM]) {
        aE[aM] = {};
      }
      N(aM, aG);
      switch (aG.type) {
        case "hashchange":
          break;
        case "focus":
          j(aM, aG);
          break;
        case "blur":
          ad(aM, aG);
          break;
        case "pointerdown":
          R(aM, aG);
          break;
        case "pointerup":
          R(aM, aG);
          break;
        case "click":
          M(aM, aG);
          break;
        case "change":
          B(aM, aG);
          break;
        case "orientationchange":
          a(aG);
          break;
        case "touchstart":
          am(aG);
          break;
        case "touchend":
          q(aG);
          break;
        case "loadWithFrames":
          TLT.logScreenviewLoad("rootWithFrames");
          break;
        case "load":
          O = aG.orientation;
          ap = new Date();
          if (typeof ab.getOrientationAngle() !== "number" || ab.isAndroid) {
            aK = window.screen.width > window.screen.height ? 90 : 0;
            aF = ab.getOrientationAngle();
            if (
              Math.abs(aF) !== aK &&
              !(aF === 180 && aK === 0) &&
              !(aF === 270 && aK === 90)
            ) {
              ab.isLandscapeZeroDegrees = true;
              if (Math.abs(aF) === 180 || Math.abs(aF) === 0) {
                O = 90;
              } else {
                if (Math.abs(aF) === 90 || Math.abs(aF) === 270) {
                  O = 0;
                }
              }
            }
          }
          setTimeout(function () {
            if (aj.isInitialized()) {
              z(aG);
            }
          }, 100);
          if (ab.getValue(K, "forceRootScreenview", false)) {
            ae = r;
          } else {
            ae = aj.normalizeUrl(location.hash, 2) || r;
          }
          TLT.logScreenviewLoad(ae);
          break;
        case "screenview_load":
          ai = new Date();
          aa();
          aJ = aB("load", null, aG.name);
          break;
        case "screenview_unload":
          aJ = aB("unload", null, aG.name);
          break;
        case "resize":
        case "scroll":
          if (!Z) {
            Z = new Date();
          }
          P = new Date();
          z(aG);
          break;
        case "unload":
          for (aL in g) {
            if (g.hasOwnProperty(aL)) {
              aI = g[aL].exception;
              if (aI.repeats > 1) {
                aH = { type: 6, exception: aI };
                aj.post(aH);
              }
            }
          }
          if (D) {
            aC(D);
          }
          Z = new Date();
          z(aG);
          if (ae === r || aj.normalizeUrl(location.hash, 2) === ae) {
            TLT.logScreenviewUnload(ae);
          }
          break;
        case "mousemove":
          c(aG);
          break;
        case "error":
          aA(aG);
          break;
        case "visibilitychange":
          s(aG);
          break;
        default:
          p(aG);
          break;
      }
      az = aM;
      return aJ;
    },
    onmessage: function () {},
  };
});
