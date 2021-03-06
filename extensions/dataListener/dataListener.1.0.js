/*!
 * Copyright (c) 2021 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

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
  var dataLayer, dataBlocklist, dataAllowList, dataKey;
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
          dataAllowList = moduleConfig.dataAllowList || null;
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
          if (key) {
            if (!dataBlocklist || dataBlocklist.indexOf(key) === -1)
            {
              if (!dataAllowList || dataAllowList.indexOf(key) !== -1) {
                // console.log("dataListener: data log - "+JSON.stringify(dataLayer[i]))
                TLT.logDataLayer(dataLayer[i]);
                // TLT.logCustomEvent("gtm", { description: "GTM Events", value: dataLayer[i] });
              }
            }
          }
        }
        nextElem = i;
      }
    },

    version: "1.1"
  };
});
