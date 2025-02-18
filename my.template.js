/*  --- buildNote: template 2024.12a --- */
/*! --- webvitals: <script src="https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js"> --- */
/*! --- tealeaf:   <script src="https://cdn.goacoustic.com/tealeaf/latest/tealeaf.min.j"> --- */
/*! --- friction:  local include --- */

/* global TLT */

/*! ---------- config ---------- */

(function () {

    var config = TLT.getDefaultConfig();

    config.core.buildNote = "template 2024.12a";
    config.core.sessionDataEnabled = true;

    config.core.modules.dataLayer.enabled = false;

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
  
    function uniqueIds() {
       var dups = [];
        Array.from(
            document.querySelectorAll("[id]"))
            .map(function (node) { return node.id })
            .forEach(
                function (elem, i, arr) {
                    if (arr.includes(elem, i+1) && !dups.includes(elem) && elem !== "")
                        dups.push(elem)
                }
            );
        return dups;
    }

	config.services.browser.blacklist = [
		{ regex: /(?:[0-9]{12,})/, flags: "g" }
    ];
    config.services.browser.blacklist = config.services.browser.blacklist.concat(uniqueIds());

    function maskXx9(value) {
        return value.replace(/[A-Z]/g, "X").replace(/[a-z]/g, "x").replace(/[0-9]/g, "9");
    };

    function maskXx9text(value, element) {
        if (element && element.innerText) {
            element.innerText = maskXx9(element.innerText);
        }
        return value;
    };

    function maskXx9htmltext(value, element) {
        if (element && element.childNodes) {
			var i, nodes = element.childNodes;
			for (i=0; i<nodes.length; i++) {
				var n = nodes[i];
				if (n.nodeType == Node.TEXT_NODE) {
					n.textContent = maskXx9(n.textContent);
				}
			}
        }
        return value;
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
                // others
                "a",
            ],
            maskType: 4, // replace all alphas with X and digits with 9
            maskFunction: maskXx9
        },
        {
            targets: [
                ".tlPrivate"
            ],
            maskType: 4,
            maskFunction: maskXx9text,
            maskAttributes: function (id, attr) {
                attr['aria-label'] = "[masked]";
                return attr;
            },
        }
    ];
    config.services.message.privacyPatterns = []; // remove defaults

    // config.modules.ajaxListener.urlBlocklist.push(
    //     {regex:"clarity",flags:"i"},
    //     {regex:"doubleclick",flags:"i"},
    //     {regex:"google",flags:"i"},
    //     {regex:"yimg",flags:"i"}
    // );
    // config.modules.ajaxListener.filters[0].log.requestData = true;
    // config.modules.ajaxListener.filters[0].log.responseData = true;

    // config.modules.dataLayer = {
    //     dataObjects: [
    //         {
    //             dataObject: "dataLayer",
    //             rules: {
    //                 includeEverything: true,
    //                 permittedProperties: [],
    //                 propertyBlocklist: [],
    //                 screenviewBlocklist: [],
    //                 filter: [{
    //                     matchProperty: 'event',
    //                     matchValue: /gtm\.(?!js|start|load|dom|timer|scrollDepth)/
    //                 }]
    //             }
    //         },
    //     ]
    // };

    // config.modules.replay.domCapture.triggers = [
    //     { event: "change" },
    //     { event: "click" },
    //     { event: "dblclick" },
    //     { event: "contextmenu" },
    //     { event: "visibilitychange" },
    //     { event: "load", delayUntil: { selector: "div.page-preloader[style='display: none;']", exists: false, timeout: 2000 } },
    // ];

    var appKey = "2b5f323f11804851beb8617eee293042";
    if (window.location.hostname === "www.prod.com" || window.location.hostname === "other.prod.com") {
        appKey = "prod appkey value"; // production
    }
    var postUrl = "https://lib-ap-1.brilliantcollector.com/collector/collectorPost";

    // initialize Tealeaf
    TLT.initLibAdv(appKey, postUrl, config, true, false, true, true, true); // addPako, addHammer, addSafariPolyfill, addAjaxListener, addRestartTLTforSPA

}());