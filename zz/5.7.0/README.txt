UI Capture SDK release package contents

W3C
  Folder containing the production build of the UIC.

  Files include:
    Base SDK - "tealeaf.js" and minified "tealeaf.min.js"
    Gestures module - "tealeaf.gestures.js"
    JS for the cross-domain frame based solution - "tealeaf.frame.js"
    Web Worker for improving performance with DOM Capture payloads - "worker/tltWorker.js"

Targets
  Folder containing sample implementations of Tealeaf Target files for various
  server application platforms like ASPX, JSP and PHP.

  The sample targets are only applicable for the on-prem solution.

defaultconfiguration.js
  Default configuration file which can be used as an example or starting point.
  NOTE: The configuration, which also incorporates the TLT.init API call to
  initialize the library, must be appended or included after the base SDK.


Release Notes and related documentation is available online:
https://developer.ibm.com/customer-engagement/docs/watson-marketing/ibm-watson-customer-experience-analytics/tealeaf-ui-capture/ibm-tealeaf-ui-capture-release-notes/
