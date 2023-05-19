# FrictionSigns Tealeaf Module

## Purpose

To observe and report back behaviours showing signs of 'friction' or struggle. These include:
- Rage clicks
    - repeated clicks in the same area indicating frustration or something broken
- Dead clicks
    - clicks which do not result in the page contents or the page changing so something is not working or the user has clicked somewhere that is not designed to be clicked
- Error clicks
    - clicks which are immediately before a JavaScript error being seen and so are likely triggering the error
- Thrashing cursor
    - when the cursor is moving repeatedly either round-and-round or back-and-forth within a short period of time
- Excessive scrolling
    - when the page is scrolled up and down an amount which seems excessive given the length of the page

## Configuration

See the config.js file for a sample configuration.

Each type of friction has a flag to enable it (default: true). There is also a common parameter "blocklist" which is an array of targets to ignore for this type of friction. These target identifiers can be fixed strings or regular expressions.

Rage clicking can be configured for the number of clicks needed to indicate rage (6), the area within which the clicks must occur (80px), and the maximum time between each click (4000ms).

Dead clicks can be configured to indicate the maximum time between a click and the expected change resulting from a click (2000ms).

Error clicks can be configured to indicate the maximum time between a click and an air condition for them to be considered as correlated (200ms).

Excess scrolling can be configured with a scale factor (2) which indicates the  multiplier to use when comparing the measured distance scrolled to the normal distance to scroll to the end of the page. If the amount scrolled exceeds this multiple of the normal distance, then an excess scrolling post is triggered.

Thrashing cursor can be configured with a time period (3000ms) over which to measure the total change in direction of the cursor. A longer time period is more sensitive.