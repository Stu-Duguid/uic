# DataListener Tealeaf Module

## Purpose

To observe and report back via data layer posts the contents of "dynamic" data layers. These have an array where events are added as the page is used. The most common example of this is when GA events are pushed into the GTM object 'window.datalayer'. This module will capture any GA events as the default setting but has configuration to work with other data.

So that the data can be easily consumed, each array entry is separately posted to Tealeaf using the data layer logging API (to take advantage of the recursive check).

The module will look for new entries in the array when Tealeaf processes events like a click, change, unload, or visibility change.

If a property name includes an '.' or a '-' it will be replaced with an underscore. If a property is a digit or begins with a digit it will be prefixed with an underscore. This is a workaround for the issue in Tealeaf where JavaScript bracket notation (object['property']) cannot be used in a step attribute definitions.

## Configuration

Under core.modules:

```
dataListener: {
    enabled: true,
    events: [
        { name: "change", attachToShadows: true, recurseFrames: true },
        { name: "click", recurseFrames: true },
        { name: "hashchange", target: window },
        { name: "load", target: window },
        { name: "unload", target: window },
        { name: "error", target: window },
        { name: "visibilitychange" }
    ]
},
```

Under modules:

```
dataListener: {

    // the JavaScript array object to watch for new events
    dataObject: "dataLayer",

    // defaults to event if not specified
    dataKey: "event",

    // items not to log (optional these settings are a good start)
    dataBlocklist: ["gtm.js", "gtm.start", "gtm.load", "gtm.dom", "gtm.timer", "gtm.scrollDepth"]

    // only items to log (optional - applied after blocklist  )
    dataBlocklist: [],

    // properties of the logged data which should not be logged (optional - mostly PII, applied after block and allow lists)
    dataPropBlocklist: []

},
```