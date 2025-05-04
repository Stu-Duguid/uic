# Tealeaf SDK-ChromeExtension

## To install and use:

1. Download the latest code.
2. Run an npm install to get the necessary packages.
3. To build first run `./node_modules/.bin/browserify ./public/background_prebundle.js -o ./public/background.js` (you will need to install browserify to run this.)
4. Then run `npm run build` - This should create a build folder which will be the root folder for the extension.
5. Go to chrome://extensions (make sure the Developer Mode icon is turned on) on your browser and click on "Load Unpacked" and upload the build folder. 
6. Once chrome installs it, you will see an icon appear which has two tealeaves.
7. When you load a site with the Tealeaf SDK, the icon will turn green.
8. Clicking on the icon will give more details about the SDK.

## Current Features:

1. Detects presence of Tealeaf SDK with changing the color of the logo.
2. Displays version of the SDK installed.
3. Displays the Data Center to which data is being sent by the SDK.
4. Displays configuration details of each module being used by the customer.
5. Displays the posts that are being sent and the contents of each post.
6. Detects the presence of Shadow DOMs and DynamicCSS on the page

## Upcoming Features:

1. Modify and inject SDK from the extension.
2. Redirecting user to the replay session of the current session being tracked.
3. Ability to copy snippets from the extension to clipboard.
4. Detect duplicate IDs.
5. Compute and display size of each post.
6. Display the size of each Shadow DOM and overall DOM of the page.



For any bugs, please raise an issue if one doesn't already exist.




