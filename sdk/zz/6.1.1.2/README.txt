FIXES
-----
- An issue was fixed where the browser would display the following error message on the
console: "Uncaught TypeError: Cannot read property 'type' of undefined"

- An issue was fixed where the browser would display the following error message on the
console: "Uncaught RangeError: Maximum call stack size exceeded"

FILES
-----
This hotfix contains the following files:

1. tealeaf.js
Unminified UIC SDK.

2. tealeaf.min.js
Minified UIC SDK.

INSTRUCTIONS
------------
This hotfix should be used with the UICapture 6.1.0 Release.

Replace the tealeaf.js and tealeaf.min.js in the UICapture 6.1.0 Release package with the
corresponding files in this package.

After deploying the UIC, verify the version in the X-Tealeaf request header is as follows:
"device (UIC) Lib/6.1.1.1991"

WARNINGS
--------
This hotfix should only be applied if encountering the issue(s) described in the FIXES section.