var competitorSDKDetector = (function() {
  let regexGlassBox = /report-tf.glassboxcloud.com/g; // https://report-tf.glassboxcloud.com/glassbox/WMF_reporting/cls_report?_cls_s=d3886842-aee7-48fb-8b78-2c366fd7dfbd%3A0&_cls_v=5c88ff54-ea08-4013-9fdc-12f7ad6c6f31
  let regexQuantumMetric = /quantum/g;
  let regexFullStory = /fullstory/g;
  let regexHotjar = /hotjar.com/g;
  let regexForeSee = /analytics.foresee.com/g;
  let regexUserReplay = /userreplay.net/g;
  let regexAppDynamics = /appdynamics.com/g;
  let regexClickTale = /clicktale.net/g;
  let regexInspectlet = /inspectlet.com/g;
  let regexSmartlook = /smartlook.com/g;
  let regexGoogleAnalytics = /google-analytics.com/g;
  let regexDynatrace = /dynatrace.com/g;
  let regexNewRelic = /newrelic.com/g;
  function sniff(url) {
    if (url.match(regexGlassBox)) {
      return {
        GlassBox: true
      };
    } else if (url.match(regexFullStory)) {
      return {
        FullStory: true
      };
    } else if (url.match(regexHotjar)) {
      return {
        Hotjar: true
      };
    } else if (url.match(regexQuantumMetric)) {
      return {
        Quantum: true
      };
    } else if (url.match(regexForeSee)) {
      return {
        ForeSee: true
      };
    } else if (url.match(regexUserReplay)) {
      return {
        UserReplay: true
      };
    } else if (url.match(regexAppDynamics)) {
      return {
        AppDynamics: true
      };
    } else if (url.match(regexClickTale)) {
      return {
        ClickTale: true
      };
    } else if (url.match(regexInspectlet)) {
      return {
        Inspectlet: true
      };
    } else if (url.match(regexSmartlook)) {
      return {
        Smartlook: true
      };
    } else if (url.match(regexGoogleAnalytics)) {
      return {
        GoogleAnalytics: true
      };
    } else if (url.match(regexDynatrace)) {
      return {
        Dynatrace: true
      };
    } else if (url.match(regexNewRelic)) {
      return {
        NewRelic: true
      };
    }
  }
  return {
    sniff: sniff
  };
})();
