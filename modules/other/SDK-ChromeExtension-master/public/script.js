// setTimeout(function() {
//   /* Example: Send data from the page to your Chrome extension */
//   document.dispatchEvent(
//     new CustomEvent("TLTConfigMessage", {
//       detail: TLT // Some variable from Gmail.
//     })
//   );
// }, 0);
// debugger;
var sdkInitializationInterval = window.setTimeout(getConfiguration, 5000);
var sdkConfiguration = null;
var sdkVersion = null;

function getConfiguration() {
  if (window.TLT) {
    sdkConfiguration = window.TLT.getConfig();
    sdkVersion = window.TLT.getLibraryVersion();

    var sdkJSON = JSON.stringify(sdkConfiguration, function(key, value) {
      if (key == "target" && value) {
        if (value.hasOwnProperty("dt")) return value.dt;
      } else {
        return value;
      }
    });
    sdkConfiguration = JSON.parse(sdkJSON);
    //window.clearInterval(sdkInitializationInterval);
    var event = new CustomEvent("TLTConfigMessage", {
      detail: {
        sdkConfiguration: sdkConfiguration,
        sdkVersionNumber: sdkVersion
      }
    });
    window.dispatchEvent(event);
  } else {
    //if (sdkConfiguration) window.clearInterval(sdkInitializationInterval);
    console.log(
      "Tealeaf SDK taking more than 5 seconds to initialize. Check if your page has other scripts loading before Tealeaf."
    );
  }
}
