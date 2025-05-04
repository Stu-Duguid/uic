/ example generated JSON:
//TLTSID: "33042981568610968492097459058284"
//hostName: "https://api.tealeaf.ibmcloud.com"
//orgKey: "101506631532-503629734"
//replayURL: "https://api.tealeaf.ibmcloud.com/v1/replay?sid=33042981568610968492097459058284&tltsid=33042981568610968492097459058284&orgKey=101506631532-503629734&redirect=true"
//sessionDate: "2019-09-09T16:00:49"
// new from Dukeenergy (manually unminified/deobfuscated)
function TealeafVOCAPI(injestKey, injestData) {
  if (typeof TLT !== "undefined") {
    new Date;
    if (TLTSID = window.localStorage.getItem("TLTSID"), // localStorage
      // if (TLTSID = TLT.utils.getCookieValue("TLTSID"), // cookie
      hostURL = "https://api.tealeaf.ibmcloud.com",
      orgKey = "101506631532-503629734", // client-specific, from Tealeaf settings 'Org key'
      sessionDate = (new Date).toISOString().substr(0, 19),
      // use if localStorage
      "string" == typeof TLTSID) {
      var T = TLTSID.indexOf("|");
      T >= 0 && (TLTSID = TLTSID.substring(T + 1))
    }
    var replayURL = hostURL + "/v1/replay?sid=" + TLTSID +
      // replayURL seems to be missing "&sessionDate=" parameter specified in the documentation, but doesn't seem to be needed (?):
      // "&sessionDate=" + sessionDate +
      "&tltsid=" + TLTSID + // this parameter is not specified in the documentation, but doesn't seem to cause any issue (ignored?):
      "&orgKey=" + orgKey + "&redirect=true";
    // - manually-corrected URL also works OK, so I guess &tltsid= is simply ignored and &sessionDate= is optional:
    // https://api.tealeaf.ibmcloud.com/v1/replay?sid=33042981568610968492097459058284&sessionDate=2019-09-09T16:00:49&orgKey=101506631532-503629734&redirect=true
    // - however, sessionDate= 2019-09-09_16:00:49 formatted per the documentation does NOT work:
    // https://api.tealeaf.ibmcloud.com/v1/replay?sid=33042981568610968492097459058284&sessionDate=2019-09-09_16:00:49&orgKey=101506631532-503629734&redirect=true
    // - using 'T' instead of the documented "_" value between date and time string DOES WORK.
    // action: consider correcting function to remove &tltsid= and &sessionDate= with "T" instead of "_".
    var VOCData = {
      hostName: hostURL,
      orgKey: orgKey,
      replayURL: replayURL,
      sessionDate: sessionDate,
      TLTSID: TLTSID
    };
    if (injestKey && injestData) {
      try {
        injestData.description = injestKey
      } catch (injestKey) {}
      try {
        TLT.logCustomEvent(injestKey, injestData)
      } catch (injestKey) {
        VOCData.TLTlogFailure = injestKey
      }
    }
    return VOCData
  }
  return "Tealeaf SaaS - TLT not initialied"
}
