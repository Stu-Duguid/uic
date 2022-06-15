//--- INJECT SCRIPT INTO PAGE TO GET TLT ---//
var s = document.createElement("script");
s.src = chrome.runtime.getURL("script.js");
s.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);

var configuration;
var sdkVersion;
var tltExists = false;
var sdkPostData = {};
var numberOfPosts = 0;
var competitors = {};
var isIframeSetup = false;
var overstat = null;
var performance = null;
var replay = null;
var endPoint = null;
let postDataQueue = [];
let shadowDOMList = [];
let containsDynamicStyleSheets = false;

window.addEventListener("DOMContentLoaded", event => {
  console.log("The DOM has laoded, lets check for Dynamic CSS");
  let origInsertRule = window.CSSStyleSheet.prototype.insertRule;
  window.CSSStyleSheet.prototype.insertRule = function(rules, index) {
    console.log("Attempting to insert Dynamic CSS!!!!!");
    containsDynamicStyleSheets = true;
    origInsertRule(rules, index);
  };
});

//--- EVENT LISTENER FOR THE TLT OBJECT ---//
window.addEventListener(
  "TLTConfigMessage",
  function(e) {
    // e.detail contains the transferred data (can be anything, ranging
    // from JavaScript objects to strings).
    // Do something, for example:

    configuration = e.detail.sdkConfiguration;
    sdkVersion = e.detail.sdkVersionNumber;
    console.log(configuration);
    if (configuration) {
      changeToActiveIcon();
      processConfiguration(configuration, sdkVersion);
    }
  },
  false
);

//--- ANALYZE THE DOM OF THE WEBPAGE ---//
function enumerateUntrackedShadows(node) {
  var i,
    len,
    element,
    elements,
    shadowList = [];

  if (!node || !node.children) {
    return shadowList;
  }

  elements = node.children;

  for (i = 0, len = elements.length; i < len; i += 1) {
    element = elements[i];
    if (element.shadowRoot) {
      if (!element.shadowRoot.TLTListeners) {
        shadowList.push([element, element.shadowRoot]);
      }
      shadowList = shadowList.concat(
        enumerateUntrackedShadows(element.shadowRoot)
      );
    }
    shadowList = shadowList.concat(enumerateUntrackedShadows(element));
  }
  return shadowList;
}

// function doesContainDynamicStyles() {
//   let origInsertRule = CSSStyleSheet.prototype.insertRule;
//   CSSStyleSheet.prototype.insertRule = function(rules, index) {
//     containsDynamicStyleSheets = true;
//     return origInsertRule(rules, index);
//   };
// }

//--- IFRAME ---//
//Setup of iFrame to hold the extension content
var iframe = document.createElement("iframe");
function setUpIframe(iframe) {
  iframe.id = "sdkextension-display";
  iframe.style.background = "green";
  iframe.style.height = "100%";
  iframe.style.width = "0px";
  iframe.style.position = "fixed";
  iframe.style.top = "0px";
  iframe.style.right = "0px";
  iframe.style.zIndex = "9000000000000000000";
  iframe.frameBorder = "none";
  iframe.src = chrome.extension.getURL("index.html");
  document.body.appendChild(iframe);
  isIframeSetup = true;
}
//--- TOGGLE IFRAME TO APPEAR ON THE SIDE OF THE DOM ---//
function toggle() {
  if (iframe.style.width === "0px" && isIframeSetup === true) {
    iframe.style.width = "400px";
  } else {
    iframe.style.width = "0px";
  }
}
//--- LISTENER TO TOGGLE THE IFRAME IN THE PAGE ---//
chrome.runtime.onMessage.addListener(function(msg, sender) {
  if (msg === "toggle") {
    toggle();
  }
});

//--- MESSAGE LISTENER: POST COUNT, POST QUEUE, COMPETITOR DATA ---//
//Sending post count, queing the posts and competitor data
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.type) {
    case "postCount":
      numberOfPosts = request.numberOfPosts;
      sdkPostData = request;
      console.log("Number of Posts: " + numberOfPosts);
      sendResponse({ status: "success" });
      break;
    case "newJSONPost":
      console.log(
        "A post has been recieved!!!! => \n" + JSON.stringify(request.postData)
      );
      if (request.postData) {
        postDataQueue.push(request.postData);
      }
      sendResponse({ status: "success" });
      break;
    case "competitorsFound":
      competitors = request.competitorList;
      console.log("Third party data found");
      console.log(competitors);
      if (competitors)
        addIconBadge(Object.keys(JSON.parse(competitors)).length);
      sendResponse({ status: "success" });
      break;
    case "getCompetitorList":
      console.log("Sending the third party SDK information to the UI");
      console.log(competitors);
      sendResponse(competitors);
      break;
    default:
      break;
  }
});

//--- CHANGE TO ACTIVE ICON ---//
function changeToActiveIcon() {
  chrome.runtime.sendMessage({
    newIconPath: "./Logo/tealeaf-16.png"
  });
  //chrome.runtime.sendMessage({ newIconPath: "./Logo/tealeaf-16.png" });
}

//--- UPDATE ICON TO HOLD COMPETITOR COUNT ---//

function addIconBadge(competitorCount) {
  chrome.runtime.sendMessage({
    numberOfCompetitors: competitorCount
  });
}

// Method that gathers all the specific modules from the SDK configuration
// and sets an event listener that listens for any configuration requests

function processConfiguration(configuration, sdkVersion) {
  overstat = getOverstatConfiguration(configuration);
  performance = getPerformanceConfiguration(configuration);
  replay = getReplayConfiguration(configuration);
  endPoint = getEndPoint(configuration);
  console.log("overstat = " + JSON.stringify(overstat));
  console.log("performance = " + JSON.stringify(performance));
  console.log("replay = " + JSON.stringify(replay));
}

//Content.js will send the overstat configuration only when the popup requests for it
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  switch (message.type) {
    case "rawConfiguration":
      sendResponse(this.configuration);
      break;
    case "getOverstatConfig":
      sendResponse(overstat);
      break;
    case "toggle":
      console.log("Browser Icon clicked!");
      shadowDOMList = enumerateUntrackedShadows(document);
      //doesContainDynamicStyles();
      if (!isIframeSetup) setUpIframe(iframe);
      toggle();
      break;
    case "getPerformanceConfig":
      sendResponse(performance);
      break;
    case "getReplayConfig":
      sendResponse(replay);
      break;
    case "getEndPoint":
      sendResponse(endPoint);
      break;
    case "getSDKVersion":
      console.log("The SDK Version is: " + sdkVersion);
      sendResponse(sdkVersion);
      break;
    case "getPostCount":
      console.log("Extension requesting for the number of posts");
      sendResponse(sdkPostData);
      break;
    case "getShadowDOM":
      console.log("Extension requested for Shadow DOMS");
      sendResponse(shadowDOMList);
      break;
    case "containsDynamicCSS":
      //console.log("Extension requested for presence of dynamic CSS.");
      sendResponse(containsDynamicStyleSheets);
      break;
    case "getPostDataQueue":
      console.log("Extension requesting for a resfresh of the post data!!");
      console.log(
        "Sending " + postDataQueue.length + " posts including the new posts!!!"
      );
      sendResponse(postDataQueue);
      postDataQueue = [];
      break;
    default:
      console.log("Unrecognised message: " + message);
      break;
  }
});

// Method that parses the SDK configuration and
// returns the Overstat specific configuration

function getOverstatConfiguration(sdkConfiguration) {
  var overstatCore = sdkConfiguration.core.modules.overstat;
  var overstatModule = sdkConfiguration.modules.overstat;
  var overstatJSON = {
    name: "Overstat",
    core: overstatCore,
    module: overstatModule
  };
  return overstatJSON;
}

// Method that parses the SDK configuration and
// returns the Performance specific configuration

function getPerformanceConfiguration(sdkConfiguration) {
  var performanceCore = sdkConfiguration.core.modules.performance;
  if (performanceCore) performanceCore.enabled = true;
  var performanceModule = sdkConfiguration.modules.performance;

  var performanceJSON = {
    name: "Performance",
    core: performanceCore,
    module: performanceModule
  };
  return performanceJSON;
}

// Method that parses the SDK configuration and
// returns the Replay specific configuration

function getReplayConfiguration(sdkConfiguration) {
  var replayCore = sdkConfiguration.core.modules.replay;
  if (replayCore) replayCore.enabled = true;
  var replayDOMCaptureModule = sdkConfiguration.core.modules.mutationDOMCapture;
  var replayModule = sdkConfiguration.modules.replay;
  var replayDOMCaptureService = sdkConfiguration.services.domCapture;
  var replayDOMCapture = {
    replayDOMDaptureModule: replayDOMCaptureModule,
    replayDOMCaptureService: replayDOMCaptureService
  };

  var replayJSON = {
    name: "Replay",
    core: replayCore,
    module: replayModule,
    replayDOMCapture: replayDOMCapture
  };
  return replayJSON;
}

// Method parses through the SDK Configuration and returns the location information
// embedded in the configuration JSON

function getEndPoint(sdkConfiguration) {
  var endPointURL = sdkConfiguration.services.queue.queues[0].endpoint;
  var endPoint = { url: endPointURL, location: "" };
  switch (endPointURL) {
    case "//collector.tealeaf.ibmcloud.com/collector/collectorPost":
    case "https://collector.tealeaf.ibmcloud.com/collector/collectorPost":
      endPoint.location = "Washington DC, United States";
      break;
    case "//uscollector.tealeaf.ibmcloud.com/collector/collectorPost":
    case "https://uscollector.tealeaf.ibmcloud.com/collector/collectorPost":
      endPoint.location = "Dallas, United States";
      break;
    case "//decollector.tealeaf.ibmcloud.com/collector/collectorPost":
    case "https://decollector.tealeaf.ibmcloud.com/collector/collectorPost":
      endPoint.location = "Frankfurt, Germany";
      break;
    case "//aucollector.tealeaf.ibmcloud.com/collector/collectorPost":
    case "https://aucollector.tealeaf.ibmcloud.com/collector/collectorPost":
      endPoint.location = "Sydney, Australia";
      break;
    default:
      if (
        endPointURL.match(
          /(https:)?\/\/[a-z]*collector\.tealeaf\.ibmcloud\.com\/collector\/collectorPost/g
        )
      ) {
        endPoint.location = "Akamai Collector";
      } else if (endPointURL == "/webapp/cxproxy") {
        endPoint.location = endPointURL;
      } else endPoint.location = "invalid";
      break;
  }
  console.log(endPoint);
  return endPoint;
}
