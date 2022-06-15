/* global TLT:writable */

//
// crossSession reporting module
//
// to answer:
//   'how many sessions before when I see a purchase'
//   'time from first session until purchase'
// data kept in persistent 1st party cookie (or local storage?)
//
// TBD - support local storage and other data like client-side events
//

/*
	data post format

	{
		tltpid: '...', // 'sid' is session, 'pid' is persistent, 'uid' is user
		user: {
			idtype: idvalue,
			email: 'a@b.com', ... // use config to spec ID and events to collect
		}
		sessions: [
      {
        tltsid: 0, // to manually search for session if needed
				startTime: 0, // machine time used for timeSince below
        timeSince: '02 days', // recalculated on each save as human readable time since this session
        duration: 0, // length of session
        // TBD maybe
        events: [ 'a', 'b', '🚩', '✅'], // coded into script not in event engine
        referrer: '' // used to understand attribution
			},
			{ ... }
		],
		sessionCount: 0, // count of sessions seen for easy access and as array may get truncated
		recentActivity: 0 // timestamp since last interaction used to gauge if new session
	}

  // note data can be grabbed for easier parsing from cookie value

*/

TLT.addModule("crossSession", function (context) {
  "use strict";

  // var useCookies = true;
  // var useStorage = false;
  var inactivityTimeout = 1000*60*30; // more than 30 min inactivity
  var cookieName = "TLTPID"; // persistent cookie
  var cookieMaxAge = 60*60*24*100; // 100 days
	var cookieSecure = false;
	var cookieSamesite = "Lax";
	var cookie;
	var newSession;

  function shorthandDuration(d) {
		if (d < 1000) {
			return d + ' ms';
		}
		if (d < 60*1000) {
			return Math.floor(d/1000) + ' sec';
		}
		if (d < 60*60*1000) {
			return Math.floor(d/(60*1000)) + ' min';
		}
		if (d < 24*60*60*1000) {
			return Math.floor(d/(60*60*1000)) + ' hr';
		}
		return Math.floor(d/(24*60*60*1000)) + ' days';
  }

	function updateAndSaveCookie() {
		var current, now, sessions;

		// update current session times
		now = Date.now();
		sessions = cookie.sessions;
		current = sessions[sessions.length-1];
		current.duration = Math.floor((now - current.startTime)/1000);

		// update time since session occurred for each in list
		sessions.forEach(function (s) {
			s.timeSince = shorthandDuration(Date.now() - s.startTime);
		});

		cookie.recentActivity = now;

		// set updated cookie
		context.utils.setCookie(cookieName, JSON.stringify(cookie), cookieMaxAge, undefined, undefined, cookieSecure, cookieSamesite);
	}

	function postMsg(descr) {
		context.post({ type: 5, customEvent: { name: "crossSession", description: descr, data: cookie }});
	}

  // ---------------------------------------------------

  return {
    init: 
			function () {
				var prevSession, sessions;
				var sessionCookieInfo, sessionCookieName, sessionCookieValue;
				var cookieStr;
				
				// cookies
				sessionCookieInfo = TLT.getTLTSessionCookieInfo();
				sessionCookieName = sessionCookieInfo.tltCookieName;
				sessionCookieValue = sessionCookieInfo.tltCookieValue;
			
				// get persistent cookie value or default
				cookieStr = context.utils.getCookieValue(cookieName);
				if (cookieStr === null) {
					cookie = {
						tltpid: sessionCookieValue,
						// user: {},
						sessions: [],
						sessionCount: 0,
						recentActivity: 0
					};
				} else {
					cookie = JSON.parse(decodeURIComponent(cookieStr));
				}

				// create on first page of new session only - is the list empty, or the endTime within 30 min, or the session ID different
				newSession = false;
				sessions = cookie.sessions;
				if (cookie.sessionCount == 0 || Date.now() - cookie.recentActivity > inactivityTimeout || sessionCookieValue !== sessions[sessions.length-1].tltsid) {
					// new session
					newSession = true;
					cookie.sessions.push(
						{
							tltsid: sessionCookieValue,
							// start: Date(),
							startTime: context.getStartTime(),
							// referrer: "empty",
							// events: ""
						}
					);
					// prevent cookie getting too big
					if (cookie.sessions.length > 10) {
						cookie.sessions.shift();
					}
					// separately still keep count
					cookie.sessionCount++;
				}
				updateAndSaveCookie();
			},
    destroy: 
			function () {},
    onevent:
			function (event) {
				updateAndSaveCookie();
				switch (event.type) {
					case "load":
						if (newSession) {
							newSession = false;
							postMsg("Session History");
						}
						break;
					default:
						break;
				}
			},
		version: "1.0"
  };
}); // End of TLT.addModule "crossSession"

// sample config
//
// crossSession: {
// 					enabled: true,
//           events: [
// 					{ name: "load", target: window },
// 					{ name: "unload", target: window },
//           { name: "visibilitychange" }
// 					]
// 				}
