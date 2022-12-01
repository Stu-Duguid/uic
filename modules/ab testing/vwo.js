// vwo tealeaf logging

/* global TLT, _vwo_exp */

// VWO data
var expId = window._vis_opt_experiment_id;
if (expId && expId !== 0 && window._vwo_exp && window._vwo_exp[expId]) {
	var expData = window._vwo_exp[expId];
	if (expData && expData.name && expData.combination_chosen && expData.comb_n) {
		window.TLT.logCustomEvent("abTest", {
			description: "VWO",
			experimentId: expId,
			experiment: expData.name,
			variantId: expData.combination_chosen,
			variant: expData.comb_n[expData.combination_chosen]
		});
	}
}