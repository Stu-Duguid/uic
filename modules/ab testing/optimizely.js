// Optimizely

if (("optimizely" in window) && window.optimizely !== null && typeof window.optimizely.get === 'function') {
	var optim = window.optimizely.get('state').getCampaignStates({ isActive: true });
	var campaignId, campaignData;
	for (campaignId in optim) {
		campaignData = window.optimizely.get("state").getDecisionObject({ campaignId: campaignId });
		TLT.logCustomEvent("optimizely", { description: "Optimizely", value: campaignData });
	}
}