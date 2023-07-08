/**
 * @fileOverview The Data Listener module implements listening and logging changes
 * in a data layer object when user interactions occur. 
 * It checks the object is an array with new data added at the end.
 * @exports dataListener
 */

/*global TLT:true */

TLT.addModule("dataListener", function (context) {
  "use strict";

  var moduleConfig = {};
  var moduleLoaded = false;
  var dataLayer, dataBlocklist, dataAllowlist, dataPropBlocklist, dataKey;
  var nextElem = 0;

  return {
    init: function () {
      moduleConfig = context.getConfig();
      //console.log("dataListener: init - "+moduleConfig.dataObject);
      if (moduleConfig.dataObject) {
        dataLayer = window[moduleConfig.dataObject];
        //console.log("dataListener: dataLayer - "+JSON.stringify(dataLayer));
        if (dataLayer && Array.isArray(dataLayer)) {
          //console.log("dataListener: module loaded");
          moduleLoaded = true;
          dataBlocklist = moduleConfig.dataBlocklist || null;
          dataAllowlist = moduleConfig.dataAllowlist || null;
          dataPropBlocklist = moduleConfig.dataPropBlocklist || null;
          dataKey = moduleConfig.dataKey || "event";
        }
      }
    },

    destroy: function () {
      moduleLoaded = false;
    },

    onevent: function (webEvent) {
      if (moduleLoaded) {
        //console.log("dataListener: webevent type - "+webEvent.type)
        for (var i = nextElem; dataLayer.length > i; i++) {
          var key = dataLayer[i][dataKey];
          // todo: add option to log if no key
          if (key) {
            if (!dataBlocklist || dataBlocklist.indexOf(key) === -1)
            {
              if (!dataAllowlist || dataAllowlist.indexOf(key) !== -1) {
                var sendData = {};
                for (var prop in dataLayer[i]) {
                  if (!dataPropBlocklist || dataPropBlocklist.indexOf(prop) === -1)
                  {
                    sendData[prop.replace(/(\.|-)/, '_').replace(/^(\d)/, '_$1')] = dataLayer[i][prop];
                  }
                }
                TLT.logDataLayer(sendData);
                // TLT.logCustomEvent("gtm", { description: "GTM Events", value: sendData });
              }
            }
          }
        }
        nextElem = i;
      }
    },

    version: "1.3" // added rename of elements with dot in name 
  };
});
