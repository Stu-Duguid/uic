/**
 * @fileOverview The eventLogger module captures and logs events in a session
 * including load/click/change events
 * used as input to script to auto-generate events
 * @exports eventLogger
 */

/* global TLT */

// @ts-ignore
TLT.addModule("eventLogger", function (context) {
    "use strict";
    var moduleLoaded, moduleConfig, eventList;

    function logEvent (eventType, pagePath, pageFrag, eventTags, targetId, targetName, targetText) {
        eventList.push(`${eventType}|${pagePath}|${pageFrag}|${eventTags}|${targetId}|${targetName}|${targetText}`);
    }

    return {
        init: function () {
            moduleLoaded = true;
            moduleConfig = context.getConfig();
			console.debug(`eventLogger: init`);
            eventList = [];
        },

        destroy: function () {
            moduleLoaded = false;
        },

        onevent: function (event) {
            if (typeof event !== "object" || !event.type || !moduleLoaded) {
                return;
            }
            console.debug(`eventLogger: ${event.type} - ${event.target.id}`);

            var pagePath = window.location.pathname;
            var pageFrag = window.location.hash;
            var eventTags = "recorded";
            
            if (event.type === 'load') {
                logEvent('load', pagePath, pageFrag, eventTags, '', '', '');
                return;
            }
            if (event.type === 'unload') {
                navigator.clipboard.writeText(eventList.join('\n')+'\n');
                console.debug('%c\n%s\n\n', 'color: darkgreen;', eventList.join('\n'));
                return;
            }

            var targetId = event.target.id;
            var targetName = event.target.name;
            var targetText = (event.target.state.innerText)? event.target.state.innerText : '';
            logEvent(event.type, pagePath, pageFrag, eventTags, targetId, targetName, targetText);
        },

        version: "1.0"
    };
});

// moduleConfig.core.modules
//
// eventLogger: {
//     enabled: true,
//     events: [
//         { name: "change", attachToShadows: true, recurseFrames: true },
//         { name: "click", recurseFrames: true },
//         { name: "load", target: window},
//     ]
// }

// moduleConfig.modules
//
// eventLogger: {
// }