const DataProvider = {
  /* global chrome */

  getOverstatConfiguration: function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: "getOverstatConfig" },
        function(overstat) {
          console.log("In the DataProvider Method:" + overstat);
          if (overstat) return overstat;
        }
      );
    });
  }

  //const overstatConfiguration = getOverstatConfiguration();

  // return {
  //   getOverstatConfiguration: getOverstatConfiguration
  // };
};

export default DataProvider;
