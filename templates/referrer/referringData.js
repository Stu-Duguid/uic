// regexes external to function to reduce compilation
var removeQuery = /\?.*$/;
var extractHost = /^(?:https?:\/\/)?([^/]+).*$/i;
var searchHost = /google|bing|duckduck|yahoo/i;

/* global $P, $F */

// NOTE: Do not change event name
function E_REFERRING_DATA_1651650179393()
{
	if ($P["TL.STEP_SCREENVIEW_TYPE"].firstValue().toUpperCase() == "LOAD")
	{
		var channel, campaign, host, url;
		var dims = {};
		var gclid = $P["P_STEP_GOOGLE_CLICK_IDENTIFIER_1651647207595"].patternFound();
		var dclid = $P["P_STEP_GOOGLE_DISPLAY_CLICK_IDENTIFIER_1651648254833"].patternFound();
		var campaignid = $P["P_STEP_GOOGLE_CAMPAIGN_IDENTIFIER_1651647296961"].firstValue();
		var utmSource = $P["P_STEP_UTM_SOURCE_1651647563106"].firstValue().toUpperCase();
		var utmMedium = $P["P_STEP_UTM_MEDIUM_1651647535866"].firstValue().toUpperCase();
		var utmCampaign = $P["P_STEP_UTM_CAMPAIGN_1651647515242"].firstValue().toUpperCase();
		
		channel = "Direct";
		campaign = utmCampaign;
		url = $F.getLastEventValue("E_SESSION_REFERRER_1651649956291").replace(removeQuery, "");
		host = url.replace(extractHost, "$1");

		if (gclid && campaignid !== "") {
			channel = "Paid Search";
			campaign = "Google";
		}
		else if (utmSource == "BING" && utmMedium == "CPC") {
			channel = "Paid Search";
			campaign = "Bing: "+utmCampaign;
		}
		else if (gclid && dclid) {
			channel = "Display";
			campaign = "Google";
		}
		else if (utmSource == "FACEBOOK" && utmMedium == "SOCIAL") {
			channel = "Social";
			campaign = "Facebook: "+utmCampaign;
		}
		else if (utmSource == "FACEBOOK" && utmMedium == "SOCIAL_DISPLAY") {
			channel = "Display";
			campaign = "Facebook: "+utmCampaign;
		}
		else if (utmMedium.indexOf("EMAIL") !== -1) {
			channel = "Email";
		}
		else if (host.match(searchHost)) {
			channel = "Organic Search";
		}

		dims["DIM_REFERRING_CHANNEL_1651651323542"] = channel;
		dims["DIM_REFERRING_CAMPAIGN_1651651377023"] = campaign;
		dims["DIM_REFERRING_HOST_1651651515185"] = host;
		dims["DIM_REFERRING_URL_1651651600888"] = url;

		$F.setFacts("E_REFERRING_DATA_1651650179393", null, dims);
	}
}
