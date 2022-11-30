// vwo tealeaf logging

/* global TLT, _vwo_exp */

// insert via tag manager to run before VWO mod is applied

function listenToVWO() {
	if (!window.VWO) {
		setTimeout(listenToVWO(), 40);
		return;
	}
	window.VWO.push(['onVariationApplied', function (data) {
		if (!data) {
			return;
		}
		var expId = data[1], variationId = data[2];
		if (expId && variationId && window._vwo_exp && window._vwo_exp[expId] && window._vwo_exp[expId].comb_n && typeof (window._vwo_exp[expId].comb_n[variationId]) !== 'undefined') {
			tryPost(expId, variationId);
		}
	}]);
	
	function tryPost(expId, variationId) {
		if (window.TLT && window.TLT.isInitialized()) {
			window.TLT.logCustomEvent("abTest", {
				description: "VWO",
				experimentId: expId,
				experiment: window._vwo_exp[expId].name,
				variantId: variationId,
				variant: window._vwo_exp[expId].comb_n[variationId]
			});
		} else {
			setTimeout(tryPost, 200, expId, variationId);
		}
	}
}
listenToVWO();