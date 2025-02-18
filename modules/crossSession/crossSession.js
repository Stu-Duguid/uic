/* global TLT:writable */

//
// crossSession reporting module
//
// to answer:
//   'how many sessions before when I see a purchase'
//   'time from first session until purchase'
// data kept in local storage
//

/*
	data format

	window.localstorage.TLTdata: {
		sessions: [
			{
				tltsid: 0,
				startTime: 0, // epoch time
				duration: 0, // length of session in minutes
				events: [ 'a', 'b', '🚩', '✅'],
				referrer: ''
			},
			{ ... }
		],
		timestamp: 0,

		// extended for Nova
		listens: [
			{
				station: 'x',
				duration: 0,
			},
			{ ... }
		],
	}
*/

TLT.addModule("crossSession", function (context) {

	const storageKey = "TLTdata";
	const inactivityTimeout = 1000 * 60 * 29;
	const maxSessionsStored = 100;

	let enabled = false;
	let sessions = []
	let timestamp = 0;
	let listens = [];
	let newSession = false;
	
	function shorthandDuration(d) {
		const aMinuteInSec = 60;
		const anHourInSec = aMinuteInSec*60;
		const aDayInSec = anHourInSec*24;

		if (d < aMinuteInSec) {
			return d + ' sec';
		}
		if (d < anHourInSec) {
			return Math.floor(d / aMinuteInSec) + ' min';
		}
		if (d < aDayInSec) {
			return Math.floor(d / anHourInSec) + ' hr';
		}
		return Math.floor(d / aDayInSec) + ' days';
	}

	function updateAndSaveData(post) {
		let current, sessions;
		
		// update current session times
		timestamp = Math.floor(Date.now()/1000);
		current = sessions[0];
		current.duration = timestamp - current.startTime;
		
		// update time since session occurred for each in list
		sessions.forEach(function (s) {
			s.timeSince = shorthandDuration(timestamp - s.startTime);
		});
		
		// update localstorage
		let persistedData = {
			sessions: sessions,
			timestamp: timestamp,
			listens: listens
		};
		window.localStorage.setItem(storageKey, JSON.stringify(persistedData));

		if (post) {
			context.post({ type: 5, customEvent: { name: "crossSession", description: "Past session data", data: persistedData } });
		}
	}


	// ---------------------------------------------------

	return {
		init:
			function () {
				function storageAvailable(type) {
					let storage;
					try {
						storage = window[type];
						const x = "__storage_test__";
						storage.setItem(x, x);
						storage.removeItem(x);
						return true;
					} catch (e) {
						console.debug("Tealeaf: cannot write to localstorage");
						return false;
					}
				}
				  
				enabled = storageAvailable("localStorage");
				if (!enabled)
					return;

				// initialise data from storage or blank
				try {
					let jsonStr = localStorage.getItem(storageKey);
					if (jsonStr) {
						let data = JSON.parse(jsonStr);
						sessions = data.sessions || [];
						timestamp = data.timestamp || 0;
						listens = data.listens || [];
					} else {
						sessions = [];
						timestamp = 0;
						listens = [];
					}
				} catch (e) {
					enabled = false;
					return;
				}

				let cookeInfo = TLT.getTLTSessionCookieInfo();
				let sessionCookieValue = (cookeInfo)? cookeInfo.tltCookieValue : '';

				// add entry on first page of new session only - is the list empty, or the endTime within 30 min, or the session ID different
				if (sessions.length == 0 || Date.now() - timestamp > inactivityTimeout || sessionCookieValue !== sessions[0].tltsid) {
					// new session
					newSession = true;
					sessions.unshift( // add newest session to the front of the array of sessions
						{
							tltsid: sessionCookieValue,
							startTime: Math.floor(context.getStartTime()/1000),
							duration: 0,
							events: [],
							referrer: ""
						}
					);
					// prevent storage from getting too big
					if (sessions.length > maxSessionsStored) {
						sessions.pop();
					}
				}
				updateAndSaveData(false);
			},
		onevent:
			function (event) {
				if (!enabled)
					return;
				let post = false;
				switch (event.type) {
					case "load":
						if (newSession) {
							newSession = false;
							post = true;
						}
						// no break
					case "visibilitychange":
					case "pagehide":
					case "unload":
						updateAndSaveData(post);
						break;
					default:
						break;
				}
			},
		version: "2.0"
	};
}); // End of TLT.addModule "crossSession"

// sample config
//
// crossSession: {
// 					enabled: true,
//					events: [
// 						{ name: "load", target: window },
// 						{ name: "unload", target: window },
//           			{ name: "visibilitychange" }
// 					]
// 				}
