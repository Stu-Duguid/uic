// NOTE: Do not change event name
function E_RAGE_CLICK_1647907417403() {
	var threshold = 4; // set this to the number of total clicks required to be a rage event
	var timeout = 2000; // milliseconds of inactivity which resets any count
	var storageKey = "sessionObject_clickCount";
	var dimScreenview = "DIM_SCREENVIEW";
	var dimTarget = "DIM_RAGE_TARGET_1647905877010";
	var dimSessionCount = "DIM_RAGE_CLICKS_IN_SESSION_1649143087660";
	var eventType, obj, newTarget, oldTarget, now, newClicks, dims = {};

	// click rage is X or more clicks on the same item, with no pause of more than X and no intervening clicks or value changes
	//
	// capture the screenview and the item clicked (alternate identifiers?)
	// false positives ignored through dimension filtering in reports
	// could have event which user edits for these - false positive if target=x or target=y
	// assumes checking of same page is unnecessary

	eventType = $P[ "TL.STEP_TL_EVENT_TYPE" ].firstValue().toUpperCase();

	// reset on value change
	if (eventType == "VALUECHANGE") {
		$S.setCustomJSObj(storageKey, { target: 'empty', clicks: 0, recent: 0 });
		return;
	}

	// if click happened on step
	if (eventType == "CLICK" || eventType == "DBLCLICK") {
		// get previous target and click count and recency of last click
		obj = $S.getCustomJSObj(storageKey);
		if (obj === null || !obj.target || !obj.clicks || !obj.recent) {
			obj = { target: "empty", clicks: 0, recent: 0 };
		}
		
		// get this latest clicked target
		newTarget = $P[ "TL.STEP_TARGET_ID" ].firstValue().toUpperCase();
		oldTarget = obj.target.toUpperCase(); // to get a new string to compare otherwise matches incorrectly
		now = $P["TL.STEP_OFFSET"].firstValue();

		if (newTarget !== oldTarget || now - obj.recent > timeout) {
			// new item clicked OR too delayed so reset
			$S.setCustomJSObj(storageKey, { target: newTarget, clicks: 1, recent: now });
		}
		else
		{
			// conditions met for a new click in a rage click sequence
			newClicks = obj.clicks + 1;

			// check if clicks not yet reached (or over clicks so already fired)
			if (newClicks == threshold) {
				// check exclude filter event has not fired on this step
				if (!($F.getLastHitNumber("E_RAGE_CLICK_IGNORED_TARGETS_1648015738191") == $H.HitNumber && $F.getLastStepNumber("E_RAGE_CLICK_IGNORED_TARGETS_1648015738191") == $H.StepNumber)) {
					// we have reached rage level fire event
					dims = {};
					dims[ dimScreenview ] = $S.LastScreenView;
					dims[ dimTarget ] = newTarget;
					dims[ dimSessionCount ] = $F.getEventCount("E_RAGE_CLICK_1647907417403") + 1;
					$F.setFacts("E_RAGE_CLICK_1647907417403", newTarget, dims);
				}
			}
			
			// update
			$S.setCustomJSObj(storageKey, { target: newTarget, clicks: newClicks, recent: now });
		}
	}
}