/**
 * @fileOverview The eventLogger module captures and logs events in a session
 * including load/click/change events
 * used as input to script to auto-generate events
 * @exports eventLogger
 */


// todo:
//
// Add text selected
// window.getSelection()
// s.type = 'Range'
// s.anchorNode.parentNode.outerHTML

/* global TLT */

// @ts-ignore
TLT.addModule("eventLogger", function (context) {
    "use strict";
    var moduleLoaded, moduleConfig, eventList;

    function logEvent (eventType, label, pagePath, pageFrag, eventTags, targetId, targetName, targetText) {
        eventList.push(`${eventType}|${label}|${pagePath}|${pageFrag}|${eventTags}|${targetId}|${targetName}|${targetText}`);
    }

    return {
        init: function () {
            moduleLoaded = true;
            moduleConfig = context.getConfig();
			console.debug(`eventLogger: init`);
            eventList = [];

            function keyListener(e) {
                // console.debug(`key pressed ${e.code}`);
                if (e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && e.code === 'KeyC') { // Home
                    navigator.clipboard.writeText(eventList.join('\n') + '\n');
                    console.debug('%c\n%s\n\n', 'color: darkgreen;', eventList.join('\n'));
                }
            }

            document.addEventListener('keydown', keyListener, true);
        },

        destroy: function () {
            moduleLoaded = false;
        },

        onevent: function (event) {
            if (typeof event !== "object" || !event.type || !moduleLoaded) {
                return;
            }
            // console.debug(`eventLogger: ${event.type} - ${event.target.id}`);

            var pagePath = window.location.pathname;
            var pageFrag = window.location.hash;
            var eventTags = "";
            
            if (event.type === 'load') {
                logEvent('load', document.title.replace(/\|/g, '-'), pagePath, pageFrag, eventTags, '', '', '');
                return;
            }
            if (event.type === 'unload') {
                navigator.clipboard.writeText(eventList.join('\n')+'\n');
                console.debug('%c\n%s\n\n', 'color: darkgreen;', eventList.join('\n'));
                return;
            }

            var targetId = event.target.id;
            var targetName = (event.target.name)? event.target.name : '';
            var targetText = (event.target.state && event.target.state.innerText)? event.target.state.innerText : '';
            var label = (event.target.ariaLabel)? event.target.ariaLabel:(targetText)? targetText:(targetName)? targetName:'';
            console.debug(`${event.type}|${label}|${pagePath}|${pageFrag}|${eventTags}|${targetId}|${targetName}|${targetText}`);
            logEvent(event.type, label, pagePath, pageFrag, eventTags, targetId, targetName, targetText);
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