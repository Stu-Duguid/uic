//----------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------- Tab Monitoring v1.2
//----------------------------------------------------------------------------------------------------------
TLT.addModule("tabMonitoring", function (context) {
	function tabStateMonitor() {
		if (typeof window.sessionStorage !== "undefined" && typeof window.localStorage !== "undefined" &&
			window.sessionStorage && window.localStorage) { // Sanity Check
			var tlDate = new Date(),
			tlTimer = tlDate.getTime(),
			referrer = document.referrer,
			tlReferrer = window.sessionStorage.tlReferrer,
			tlLastTimer = parseInt(window.localStorage.tlLastTimer),
			tlHitNumber = parseInt(window.localStorage.tlHitNumber),
			tlTabTotal = parseInt(window.localStorage.tlTabTotal),
			tlTabCurrent = parseInt(window.sessionStorage.tlTabCurrent);
			if (tlLastTimer) {
				if (tlTimer - 30 * 60 * 1000 > tlLastTimer) { // Reset session after 30 minutes of inactivity
					tlHitNumber = 0;
				}
			}
			if (!tlHitNumber) {
				tlHitNumber = 0;
				tlTabTotal = 0;
				tlTabCurrent = 0;
			}
			if (!tlTabCurrent) { // Skip this section if user is navigating inside same tab
				if (!referrer || !tlReferrer || tlHitNumber == 0) { // New tab detected
					if (tlHitNumber == 0) { // First hit of session means the user is in the primary tab
						tlTabTotal = 1;
					} else { // Anything else means the user has opened an additional tab
						tlTabTotal = parseInt(tlTabTotal) + 1
					}
					tlTabCurrent = tlTabTotal; // Maintain state
					window.sessionStorage.tlTabCurrent = tlTabCurrent; // Save state
					window.localStorage.tlTabTotal = tlTabTotal; // Save total # of tabs
				}
			}
			tlHitNumber = tlHitNumber + 1; // Increment hit number
			window.localStorage.tlHitNumber = tlHitNumber; // Save current hit number
			window.sessionStorage.tlReferrer = referrer; // Save referrer value for tab detection
			window.localStorage.tlLastTimer = tlTimer; // Save current load timer for session expiration
		}
	}
	return {
		init: function () {},
		destroy: function () {},
		onevent: function (webEvent) {
			if (typeof webEvent !== "object" || !webEvent.type) {
				return;
			} // Sanity check
			if (webEvent) {
				tabStateMonitor();
			}
		}
	};
});



			modules: {
				tabMonitoring: {
					// Add tabIndex and tabReferrer to LOAD events
					enabled: true,
					events: [{
							name: "load",
							target: window
						}
					]
				},



	//-------------------------------------------------------------------------------------
	// Tab Monitoring v1.2 - Inject tabIndex into all events & tabReferrer into LOAD events
	//-------------------------------------------------------------------------------------
	TLT.registerBridgeCallbacks([{
				enabled: true,
				cbType: "messageRedirect",
				cbFunction: function (msg, msgObj) {
					if (typeof window.sessionStorage !== "undefined" && typeof window.localStorage !== "undefined" && window.sessionStorage && window.localStorage) {
						// Sanity Check
						if (msg && msgObj.type) {
							var tabIndex = window.sessionStorage.tlTabCurrent,
							tlReferrer = window.sessionStorage.tlReferrer
								if (tabIndex) {
									if (msgObj.type === 2) {
										msgObj["tabIndex"] = parseInt(tabIndex);
										msgObj["tabReferrer"] = tlReferrer;
									} else {
										msgObj["tabIndex"] = parseInt(tabIndex);
									}
								}
						}
					} else {
						if (msg && msgObj.type) {
							msgObj["tabDetect"] = "FAILED";
						}
					}
					return msgObj;
				}
			}
		]);
