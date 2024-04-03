/* ---------- webvitals from cdn -- https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js ---------- */
/* ---------- tealeaf from cdn -- https://cdn.goacoustic.com/tealeaf/latest/tealeaf.min.js ---------- */

/* global TLT */

/*! ---------- webvitals ---------- */
/*! ---------- tealeaf ---------- */
/*! ---------- frictionSigns ---------- */

/*! ---------- config ---------- */
const config = TLT.getDefaultConfig();

config.core.buildNote = "stu 2024.03.aa";
config.core.sessionDataEnabled = true;

config.core.modules.dataLayer.enabled = true;

config.core.modules.dataListener = {
    events: [
        { name: "change", attachToShadows: true, recurseFrames: true },
        { name: "click", recurseFrames: true },
        { name: "hashchange", target: window },
        { name: "load", target: window },
        { name: "unload", target: window },
        { name: "error", target: window },
        { name: "visibilitychange" }
    ]
};

config.core.modules.frictionSigns = {
	events: [
		{ name: "change", attachToShadows: true, recurseFrames: true },
		{ name: "click", recurseFrames: true },
		{ name: "unload", target: window },
		{ name: "scroll", target: window },
		{ name: "mousemove", recurseFrames: true },
		{ name: "orientationchange", target: window },
		{ name: "error", target: window },
	]
};

config.services.message.privacy = [
    {
        targets: ["input[type=password]"],
        maskType: 2
    },
    {
        exclude: true,
        targets: [
            "input[type=hidden]", "input[type=radio]", "input[type=checkbox]", "input[type=submit]", "input[type=button]", "input[type=search]",
            // already mentioned so avoid twice masking
            "input[type=password]",
        ],
        maskType: 4, // replace all alphas with X and digits with 9
        maskFunction: function (value) {
            return value.replace(/[A-Z]/g, "X").replace(/[a-z]/g, "x").replace(/[0-9]/g, "9");
        }
    },
    {
        targets: [
            ".tlPrivate"
        ],
        maskType: 4,
        maskFunction: function (value, element) {
            if (element && element.innerText) {
                element.innerText = element.innerText.replace(/[A-Z]/g, 'X').replace(/[a-z]/g, "x").replace(/[0-9]/g, "9");
            }
            return value;
        },
        maskAttributes: function (id, attr) {
            attr['aria-label'] = "[masked]";
            return attr;
        },
    }
];
config.services.message.privacyPatterns = []; // remove defaults

var appKey = "test appkey value";
if (window.location.hostname === "www.prod.com" || window.location.hostname === "other.prod.com") {
    appKey = "prod appkey valuexxx"; // production
}
const postUrl = "https://lib-ap-1.brilliantcollector.com/collector/collectorPost";

// initialize Tealeaf
TLT.initLibAdv(appKey, postUrl, config, true, false, true, true, true); // addPako, addHammer, addSafariPolyfill, addAjaxListener, addRestartTLTforSPA
