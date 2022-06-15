
function TealeafVOCAPI (injestKey, injestData) {
	if (typeof TLT !== "undefined") {
		//------------------------------------------------ Create Necessary Data for VOC Integration
		var date = new Date();
			TLTSID = TLT.utils.getCookieValue("TLTSID"),
			hostName = "api.tealeaf.ibmcloud.com",
			orgKey = "10221354564-501849399" // TLT.getConfig().modules.TLCookie.tlAppKey;
			sessionDate = date.getFullYear() + "-" +
						  ("0" + date.getMonth()).slice(-2) + "-" +
						  ("0" + date.getDay()).slice(-2) + "_" +
						  ("0" + date.getHours()).slice(-2) + ":" +
						  ("0" + date.getMinutes()).slice(-2) + ":" +
						  ("0" + date.getSeconds()).slice(-2);
		var replayURL = "https://api.tealeaf.ibmcloud.com/v1/replay?sid=" + TLTSID +
						"&sessionDate=" + sessionDate +
						"&orgKey=" + orgKey + "&redirect=true";
		var VOCData = {
			"hostName" : hostName,
			"orgKey" : orgKey,
			"replayURL" : replayURL,
			"sessionDate" : sessionDate,
			"TLTSID" : TLTSID
		}
		//------------------------------------------------ Log Custom Data for Tealeaf Reporting
		if (injestKey && injestData) {
			TLT.logCustomEvent (injestKey, injestData);
		}
		//------------------------------------------------ Return JSON Data to VOC
		return VOCData;
	} else {
		return "FAILED";
	}
}
