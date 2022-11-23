/*!
 * Copyright (c) 2021 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview The Behaviours module implements tracking of struggles
 * including rage clicks, dead clicks, & excessive scrolling
 * @exports behaviours
 */

/* global TLT */

TLT.addModule("behaviours", function (context) {
    "use strict";
    var moduleLoaded, moduleConfig, rageclick, deadclick, errorclick, excessscroll, thrashing;

    function initRage(event) {
        //
        // RAGE CLICKS
        //
        // more than 'clicks' without moving more that 'area' pixels high and wide in under 'time' ms
        //
        rageclick = moduleConfig.rageclick || { enable: false };
        if (rageclick.enable) {
            rageclick.clicks = moduleConfig.rageclick.clicks || 6;
            rageclick.area = moduleConfig.rageclick.area || 80;
            rageclick.time = moduleConfig.rageclick.time || 4000;
            rageclick.blocklist = moduleConfig.rageclick.blocklist || [];
            // the clicks in the rage time
            rageclick.seen = [];
            moduleLoaded = true;
        }
    }

    function checkForRage(event) {
        // sees click events and unloads

        if (event.type === 'unload') {
            rageclick.seen = [];
            return;
        }
        // ignore if on blocklist of targets
        for (var i = 0; i < rageclick.blocklist.length; i++) {
            if (event.target.id.match(rageclick.blocklist[i])) {
                return;
            }
        }
        // console.debug(`seen ${rageclick.seen.length} at (${event.position.x},${event.position.y}) diff (${event.position.x - rageclick.x},${event.position.y - rageclick.y})`);
        // save if first click and reset - also if too much distance moved, or if too much time passed
        if (rageclick.seen.length === 0 || Math.abs(event.position.x - rageclick.x) > rageclick.area || Math.abs(event.position.y - rageclick.y) > rageclick.area || event.timeStamp - rageclick.seen[0] > rageclick.time) {
            rageclick.x = event.position.x;
            rageclick.y = event.position.y;
            rageclick.seen = [event.timeStamp];
            return;
        }
        // add a click to the list at the end
        console.debug(`behaviour: potential click`);
        rageclick.seen.push(event.timeStamp);
        rageclick.x = event.position.x;
        rageclick.y = event.position.y;
        // remove clicks that were too long ago and reduce count
        while (rageclick.seen.length > 1 && event.timeStamp - rageclick.seen[0] > rageclick.time) {
            console.debug(`behaviour: remove potential click`);
            rageclick.seen.shift();
        }
        if (rageclick.seen.length === rageclick.clicks) { // yes this can trigger on the way down but very unlikely and no consequence
            // log a rage event
            console.debug(`behaviour: rage clicks seen`);
            context.post({
                type: 5,
                customEvent: {
                    name: "rageclick",
                    data: {
                        description: "Rage click - " + event.target.id,
                        value: {
                            target: event.target.id
                        }
                    }
                }
            });
            // rageclick.seen = [];
        }
    }

    function initDead(event) {
        //
        // DEAD CLICKS
        //
        // a click followed by no dom capture or unload within 'time' ms
        //
        deadclick = moduleConfig.deadclick || { enable: false };
        if (deadclick.enable) {
            deadclick.time = moduleConfig.deadclick.time || 2000;
            deadclick.blocklist = moduleConfig.deadclick.blocklist || [];
            // candidate click status
            deadclick.waitforreaction = false;
            // time of the most recent click
            deadclick.lastTime = 0;
            moduleLoaded = true;
        }
    }

    function checkForDead(event) {
        // sees click events and looks for dom captures or unloads within timeout or logs click as dead
        var timer = null;
        var observer = null;

        // when a click seen, set waitforreaction, set timeout to check flag
        if (event.type === 'click') {
            // ignore if on blocklist of targets
            for (var i = 0; i < deadclick.blocklist.length; i++) {
                if (event.target.id.match(deadclick.blocklist[i])) {
                    return;
                }
            }
            // ignore another click if already waiting
            if (timer) {
                return;
            }
            deadclick.waitforreaction = true;
            deadclick.target = event.target.id;
            
            observer = new MutationObserver(function () { deadclick.waitforreaction = false; observer.disconnect(); });
            observer.observe(document.body, { subtree: true, childList: true, attributeFilter: ["style", "class"] });

            timer = setTimeout(
                function deadTimeCheck() {
                    if (deadclick.waitforreaction) {
                        // log a rage event
                        console.debug(`behaviour: dead click seen`);
                        context.post({
                            type: 5,
                            customEvent: {
                                name: "deadclick",
                                data: {
                                    description: "Dead click - " + deadclick.target,
                                    value: {
                                        target: deadclick.target
                                    }
                                }
                            }
                        });
                    }
                    timer = null;
                    deadclick.waitforreaction = false;
                },
                deadclick.time
            );
            return;
        }
        // code here sets flag (and clears timeout) on beforeunload
        if (event.type === 'unload') {
            if (timer) {
                clearTimeout(timer);
                timer = null;
                deadclick.waitforreaction = false;
            }
        }
    }

    function initError(event) {
        //
        // ERROR CLICKS
        //
        // a script error with a click happening within 'time' ms before it
        //
        errorclick = moduleConfig.errorclick || { enable: false };
        if (errorclick.enable) {
            errorclick.time = moduleConfig.errorclick.time || 200;
            errorclick.blocklist = moduleConfig.errorclick.blocklist || [];
            // candidate error status
            errorclick.target = null;
            // time of the most recent error
            errorclick.clickTime = 0;
            moduleLoaded = true;
        }
    }

    function checkForError(event) {
        // sees click and error events only
        if (event.type === 'click') {
            errorclick.target = event.target.id;
            errorclick.clickTime = event.nativeEvent.timestamp;
            return;
        }
        if (event.type === 'error') {
            // ignore if on blocklist of error messages
            for (var i = 0; i < errorclick.blocklist.length; i++) {
                if (event.nativeEvent.message.match(errorclick.blocklist[i])) {
                    return;
                }
            }
            if (errorclick.target) {
                if (event.nativeEvent.timeStamp - errorclick.clickTime < errorclick.time) {
                    // log an error click event
                    console.debug(`behaviour: error click seen`);
                    context.post({
                        type: 5,
                        customEvent: {
                            name: "errorclick",
                            data: {
                                description: "Error click - " + errorclick.target,
                                value: {
                                    target: errorclick.target,
                                    url: event.nativeEvent.filename,
                                    line: event.nativeEvent.lineno,
                                    description: event.nativeEvent.message
                                }
                            }
                        }
                    });
                    return;
                }
                errorclick.target = null;
            }
            return;
        }
        if (event.type === 'unload') {
            errorclick.target = null;
        }
    }

    function initScroll(event) {
        //
        // EXCESSIVE SCROLLING
        //
        // total scrolled distance is more than (page-height-viewport-height)*'scale'
        //
        excessscroll = moduleConfig.excessscroll || { enable: false };
        if (excessscroll.enable) {
            excessscroll.scale = moduleConfig.excessscroll.scale || 2;
            excessscroll.blocklist = moduleConfig.excessscroll.blocklist || [];
            // cumulative scroll distance (vertical only)
            excessscroll.distance = 0;
            excessscroll.threshold = document.body.scrollHeight * excessscroll.scale;
            excessscroll.lastpos = 0;
            moduleLoaded = true;
        }
    }

    function checkForScroll(event) {
        // sees scroll events only
        // ignore if on blocklist of page urls
        for (var i = 0; i < excessscroll.blocklist.length; i++) {
            if (document.location.match(excessscroll.blocklist[i])) {
                return;
            }
        }
        if (event.type === 'scroll') {
            excessscroll.distance += Math.abs(window.scrollY - excessscroll.lastpos);
            excessscroll.lastpos = window.scrollY;
            if (excessscroll.distance > excessscroll.threshold) {
                // log an error click event
                console.debug(`behaviour: excess scroll seen`);
                context.post({
                    type: 5,
                    customEvent: {
                        name: "excessscroll",
                        data: {
                            description: "Excess scrolling",
                            value: {
                                distance: excessscroll.distance,
                                pageheight: document.body.scrollHeight,
                                viewport: window.visualViewport.height
                            }
                        }
                    }
                });
                excessscroll.distance = 0;
            }
            return;
        }
        if (event.type === 'resize' || event.type === 'orientationchange') {
            excessscroll.threshold = document.body.scrollHeight * excessscroll.scale;
            excessscroll.distance = window.scrollY;
            excessscroll.lastpos = window.scrollY;
        }
        if (event.type === 'unload') {
            excessscroll.distance = 0;
            excessscroll.lastpos = 0;
        }
    }

    function initThrash(event) {
        //
        // THRASHING
        //
        // cursor changes direction more than 10 times in under 'time' ms
        //
        thrashing = moduleConfig.thrashing || { enable: false };
        if (thrashing.enable) {
            thrashing.time = moduleConfig.thrashing.time || 4000;
            thrashing.blocklist = moduleConfig.thrashing.blocklist || [];
            thrashing.threshold = Math.PI * 10;
            // rolling window of recent deltas in mouse direction
            thrashing.moves = 0;
            thrashing.x = 0;
            thrashing.y = 0;
            thrashing.lastDirection = 0;
            thrashing.total = 0;
            thrashing.seen = [];
            moduleLoaded = true;
        }
    }

    function checkForThrash(event) {
        // sees mousemove events only
        // ignore if on blocklist of page urls
        for (var i = 0; i < thrashing.blocklist.length; i++) {
            if (document.location.match(thrashing.blocklist[i])) {
                return;
            }
        }

        if (event.type === 'mousemove') {
            // calculate the direction from the last mouse position to this one
            // sum over 10 movements to remove noise
            thrashing.x += event.nativeEvent.movementX;
            thrashing.y += event.nativeEvent.movementY;
            thrashing.moves++;
            if (thrashing.moves < 10) {
                return;
            }
            var theta = Math.atan2(thrashing.y, thrashing.x);
            thrashing.moves = 0;
            thrashing.x = 0;
            thrashing.y = 0;
            // add the magnitude of difference from the last direction to an array
            var delta = (thrashing.seen.length > 0) ? Math.abs((theta - thrashing.lastDirection) % Math.PI) : 0;
            thrashing.lastDirection = theta;
            thrashing.total += delta;
            thrashing.seen.push({ time: event.nativeEvent.timeStamp, delta: delta });
            // remove elements of the array outside the time window
            while (thrashing.seen.length > 1 && event.nativeEvent.timeStamp - thrashing.seen[0].time > thrashing.time) {
                thrashing.total -= thrashing.seen[0].delta;
                thrashing.seen.shift();
            }
            console.debug(`behaviour: thrash time ${event.nativeEvent.timeStamp}, delta ${delta}, total ${thrashing.total} length ${thrashing.seen.length}`);
            if (thrashing.total > thrashing.threshold) {
                // log a thrashing event
                console.debug(`behaviour: thrashing seen`);
                context.post({
                    type: 5,
                    customEvent: {
                        name: "thrashing",
                        data: {
                            description: "Thrashing pointer",
                            value: {
                                amount: thrashing.total
                            }
                        }
                    }
                });
                thrashing.seen = [];
                thrashing.total = 0;
            }
            return;
        }
        if (event.type === 'unload') {
            thrashing.seen = [];
            thrashing.total = 0;
            thrashing.moves = 0;
            thrashing.x = 0;
            thrashing.y = 0;
        }
    }

    return {
        init: function () {
            moduleLoaded = false;
            moduleConfig = context.getConfig();
            initRage();
            initDead();
            initError();
            initScroll();
            initThrash();
        },

        destroy: function () {
            moduleLoaded = false;
        },

        onevent: function (event) {
            if (typeof event !== "object" || !event.type || !moduleLoaded) {
                return;
            }
            if (event.type === 'click') {
                checkForRage(event);
                checkForDead(event);
                checkForError(event);
                return;
            }
            if (event.type === 'error') {
                checkForError(event);
                return;
            }
            if (event.type === 'scroll' || event.type === 'resize' || event.type === 'orientationchange') {
                checkForScroll(event);
                return;
            }
            if (event.type === 'mousemove') {
                checkForThrash(event);
                return;
            }
            if (event.type === 'unload') {
                checkForRage(event);
                checkForDead(event);
                checkForError(event);
                checkForScroll(event);
                checkForThrash(event);
                return;
            }
        },

        version: "1.0"
    };
});

// moduleConfig.core.modules
//
// behaviours: {
//     enabled: true,
//     events: [
//         { name: "change", attachToShadows: true, recurseFrames: true },
//         { name: "click", recurseFrames: true },
//         { name: "unload", target: window},
//         { name: "resize", target: window},
//         { name: "scroll", target: window},
//         { name: "mousemove", recurseFrames: true },
//         { name: "orientationchange", target: window},
//         { name: "error", target: window},
//     ]
// }

// moduleConfig.modules
//
// behaviours: {
//     rageclick: {
//         enable: false,
//         clicks: 6,
//         area: 80,
//         time: 4000,
//         blocklist: []
//     },
//     deadclick: {
//         enable: false,
//         time: 2000,
//         blocklist: []
//     },
//     errorclick: {
//         enable: false,
//         time: 200,
//         blocklist: []
//     },
//     excessscroll: {
//         enable: false,
//         scale: 2,
//         blocklist: []
//     },
//     thrashing: {
//         enable: false,
//         time: 3000,
//         blocklist: []
//     },
// }