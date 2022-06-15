// vwo tealeaf logging

/* global TLT, _vwo_exp */

// must check to run before callback needed
// and wait for TLT

window.VWO.push(['onVariationApplied', function(data) {
      if (!data) {
        return;
      }
      var expId = data[1], variationId = data[2];
      if (typeof(_vwo_exp[expId].comb_n[variationId]) !== 'undefined') {
        TLT.logCustomEvent("vwo",
					{
						description: "VWO", 
						experimentId: expId,
						experiment: _vwo_exp[expId].name,
						variantId: variationId,
						variant: _vwo_exp[expId].comb_n[variationId]
					}
				);
      }
    }
	]
);