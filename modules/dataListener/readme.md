# DataListener Tealeaf Module

## Purpose

To observe and report back via data layer posts the contents of "dynamic" data layers. These have an array where events are added as the page is used. The most common example of this is when GA events are pushed into the GTM object 'window.datalayer'. This module will capture any GA events as the default setting but has configuration to work with other data.

So that the data can be easily consumed, each array entry is separately posted to Tealeaf using the data layer logging API (to take advantage of the recursive check).

The module will look for new entries in the array when Tealeaf processes events like a click, change, unload, or visibility change.

## Configuration

` ``
dataListener: {
    dataObject: "dataLayer", // the JavaScript array object to watch for new events
    dataKey: "event", // defaults to event if not specified
    dataBlocklist: ["gtm.js", "gtm.start", "gtm.load", "gtm.dom", "gtm.timer", "gtm.scrollDepth"] // items not to log (optional these settings are a good start)
    dataBlocklist: [], // only items to log (optional - applied after blocklist  )
    dataPropBlocklist: [] // properties of the logged data which should not be logged (optional - mostly PII, applied after block and allow lists)
},
` ``