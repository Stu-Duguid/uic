// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// "use strict";

var urlRegEx = /https:\/\/[a-z]*collector\.tealeaf\.ibmcloud\.com\/collector\/collectorPost/g;
var proxyURLForTLOnTL = /\/webapp\/cxproxy/g;

var competitorSDKList = {};
var pako = require("pako");

//Cick Handler - Extension Icon
chrome.browserAction.onClicked.addListener(function(tab) {
  console.log("Clicked on the extension icon!");
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        type: "toggle",
        message: "Run Toggle!"
      },
      function(response) {}
    );
  });
});

//Update Icon on SDK enabled
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // read `newIconPath` from request and read `tab.id` from sender
  if (request.newIconPath) {
    chrome.browserAction.setIcon({
      path: request.newIconPath,
      tabId: sender.tab.id
    });
  }

  if (request.numberOfCompetitors > 0) {
    chrome.browserAction.setBadgeText({
      text: request.numberOfCompetitors.toString()
    });
  } else if (request.numberOfCompetitors === 0) {
    chrome.browserAction.setBadgeText({ text: "" });
  }
  sendResponse();
});

var requestFilter = {
  urls: ["<all_urls>"],
  types: ["xmlhttprequest"]
};

chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab) {
    y = tab.url;
    console.log("you are here: " + y);
  });
});

//Checking if a currentTab was refreshed and resetting the post count and the competitor list
chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  console.log("Change Object: " + JSON.stringify(change));

  if (tab.active && change.url === undefined && change.status === "loading") {
    console.log("Page refreshed!!");
    competitorSDKList = {};

    let checkStorageTabKey = tabId + "_" + tab.url;
    let defaultValue = {};
    chrome.storage.local.get({ [checkStorageTabKey]: defaultValue }, function(
      data
    ) {
      if (
        Object.entries(data[checkStorageTabKey]).length !== 0 &&
        data[checkStorageTabKey].constructor === Object
      ) {
        console.log("Data before refresh: " + JSON.stringify(data));
        let postCountRefreshObject = { currentPostCount: 0 };
        chrome.storage.local.set({
          [checkStorageTabKey]: postCountRefreshObject
        });
      }
    });
    console.log("New URL: " + change.url);
  } else if (change.url && tab.active && change.status === "loading") {
    competitorSDKList = {};
    console.log("New URL used!");
    console.log("Change Object: " + JSON.stringify(change));
  }
});

//Analyzing the headers when each request is sent out
chrome.webRequest.onSendHeaders.addListener(
  function(e) {
    //Filtering TL requests
    if (
      e.method === "POST" &&
      (e.url.match(urlRegEx) || e.url.match(proxyURLForTLOnTL))
    ) {
      var numberOfPosts = 0;
      var defaultValue = {};
      var currentTabStorageKey = e.tabId + "_" + e.initiator;

      console.log(e);

      //Getting the number of posts from Chrome storage to update
      chrome.storage.local.get(
        { [currentTabStorageKey]: defaultValue },
        function(data) {
          console.log("Fetched from Chrome Storage:" + JSON.stringify(data));
          if (
            Object.entries(data[currentTabStorageKey]).length === 0 &&
            data[currentTabStorageKey].constructor === Object
          ) {
            numberOfPosts = 1;
          } else {
            numberOfPosts = data[currentTabStorageKey].currentPostCount;
            numberOfPosts++;
          }
          let postCountObject = { currentPostCount: numberOfPosts };
          chrome.storage.local.set({ [currentTabStorageKey]: postCountObject });
        }
      );

      //Save the post count
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var countOfPosts = -1;
        chrome.storage.local.get([currentTabStorageKey], function(data) {
          if (data[currentTabStorageKey] == undefined) {
            countOfPosts = 0;
            console.log(data[currentTabStorageKey].currentPostCount);
          } else {
            countOfPosts = data[currentTabStorageKey].currentPostCount;
            console.log(JSON.stringify(data));
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                type: "postCount",
                numberOfPosts: countOfPosts,
                internalTabTrackerID: currentTabStorageKey,
                lastPost: e
              },
              function(response) {
                console.log(response);
              }
            );
          }
        });
      });
    }

    // Filtering 3rd party requests
    competitorSDKList = {
      ...competitorSDKList,
      ...competitorSDKDetector.sniff(e.url)
    };
    //Sending a message with the 3rd party found object
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      console.log(
        "The data being sent is: " + JSON.stringify(competitorSDKList)
      );
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          type: "competitorsFound",
          competitorList: JSON.stringify(competitorSDKList)
        },
        function(response) {
          console.log("The Competitor SDKs status: " + response.status);
        }
      );
    });
  },
  requestFilter,
  ["requestHeaders"]
);

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (details.method == "POST" && details.url.match(urlRegEx)) {
      console.log("Attempting to get the request body of each post!");
      var requestDataCompressed = details.requestBody;
      var dataArray = requestDataCompressed.raw[0].bytes;
      var data = pako.inflate(dataArray);
      var postString = "";
      for (var i = 0; i < data.length; i++) {
        postString += String.fromCharCode(parseInt(data[i]));
      }
      //Converting data to JSON and sending to the front-end
      var jsonPostData = JSON.parse(postString);
      // console.log(
      //   "The data posted by the SDK is: " + JSON.stringify(jsonPostData)
      // );
      //jsonPostDataQueue.push(jsonPostData);

      //endJSONPostData(jsonPostData);
    }

    if (jsonPostData) {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        console.log(
          "The json data being sent is: " + JSON.stringify(jsonPostData)
        );

        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            type: "newJSONPost",
            postData: jsonPostData
          },
          function(response) {
            console.log(
              "The JSON Data was sent to the front end: " + response.status
            );
          }
        );
      });
    }
  },
  requestFilter,
  ["requestBody"]
);
