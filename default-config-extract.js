var config = {
    core: {
        // Parameterize - customer name and implementation date
        buildNote: "Acoustic Tealeaf UIC " + window.TLT.getLibraryVersion(),
        blockedElements: [],
        ieExcludedLinks: ["a[href*=\"javascript:void\"]", "input[onclick*='javascript:']"],
        blockedUserAgents: [
            {
                regex: "(Google|Bing|Face|DuckDuck|Yandex|Exa)bot|spider|archiver",
                flags: "i"
            },
            "PhantomJS"
        ],
        inactivityTimeout: 1000 * 60 * 29, // 29 minutes, just under default 30 min app timeout

        modules: {
            replay: {
                events: [
                    {
                        name: "change",
                        attachToShadows: true,
                        recurseFrames: true
                    },
                    {
                        name: "click",
                        recurseFrames: true
                    },
                    {
                        name: "dblclick",
                        recurseFrames: true
                    },
                    {
                        name: "contextmenu",
                        recurseFrames: true
                    },
                    {
                        name: "pointerdown",
                        recurseFrames: true
                    },
                    {
                        name: "pointerup",
                        recurseFrames: true
                    },
                    {
                        name: "hashchange",
                        target: window
                    },
                    {
                        name: "focus",
                        recurseFrames: true
                    },
                    {
                        name: "blur",
                        recurseFrames: true
                    },
                    {
                        name: "load",
                        target: window
                    },
                    {
                        name: "unload",
                        target: window
                    },
                    {
                        name: "resize",
                        target: window
                    },
                    {
                        name: "scroll",
                        target: window
                    },
                    {
                        name: "mousemove",
                        recurseFrames: true
                    },
                    {
                        name: "orientationchange",
                        target: window
                    },
                    {
                        name: "touchend"
                    },
                    {
                        name: "touchstart"
                    },
                    {
                        name: "error",
                        target: window
                    },
                    {
                        name: "visibilitychange"
                    }
                ]
            },
            flushQueue: {
                events: [] // Populated by custom logic below for iOS sessions
            },
            overstat: {
                enabled: true,
                events: [
                    {
                        name: "click",
                        recurseFrames: true
                    },
                    {
                        name: "mousemove",
                        recurseFrames: true
                    },
                    {
                        name: "mouseout",
                        recurseFrames: true
                    },
                    {
                        name: "submit",
                        recurseFrames: true
                    }
                ]
            },
            performance: {
                enabled: true,
                events: [
                    {
                        name: "load",
                        target: window
                    },
                    {
                        name: "unload",
                        target: window
                    }
                ]
            },
            ajaxListener: {
                enabled: true,
                events: [
                    {
                        name: "load",
                        target: window
                    },
                    {
                        name: "unload",
                        target: window
                    }
                ]
            },
            gestures: {
                /* This replay rule must also be added to replay gestures events in Tealeaf SaaS
                    <HostProfile name="www.sample.com">
                        <SimulateUIEvents value=".*" uiEvents="gestures,resize,valuechange,click,mouseup,scroll"/>
                    </HostProfile>
                */
                enabled: true,
                events: [
                    {
                        name: "tap",
                        target: window
                    },
                    {
                        name: "hold",
                        target: window
                    },
                    {
                        name: "drag",
                        target: window
                    },
                    {
                        name: "release",
                        target: window
                    },
                    {
                        name: "pinch",
                        target: window
                    }
                ]
            },
            dataLayer: {
                enabled: false,
                events: [
                    {
                        name: "load",
                        target: window
                    },
                    {
                        name: "unload",
                        target: window
                    }
                ]
            },
            TLCookie: {
                enabled: true
            }
        },

        // OPTIONAL - Normalize URL, path, or fragment
        // normalization: {},

        // OPTIONAL - share session identifier with other libraries
        // sessionData: {},

        screenviewAutoDetect: true,
        framesBlacklist: []
    },
    services: {
        queue: {
            asyncReqOnUnload: true,
            useBeacon: true,
            useFetch: true,
            xhrEnabled: true,
            queues: [{
                qid: "DEFAULT",
                endpoint: "",
                // Parameterize
                maxEvents: 30,
                timerInterval: 60000,
                maxSize: 300000,
                checkEndpoint: true,
                endpointCheckTimeout: 4000,
                encoder: "gzip"
            }]
        },
        message: {
            privacy: [
                {
                    targets: ["input[type=password]"],
                    maskType: 2
                },
                {
                    targets: ["input[id*=phone]", "input[name*=phone]"],
                    maskType: 4, // replace all digits with X except last 3
                    maskFunction: function(value) {
                        return value.slice(0, -3).replace(/\d/g, "X") + value.slice(-3);
                    }
                },
                {
                    // Whitelist privacy, un-masking only elements not containing PII
                    exclude: true,
                    targets: [
                        // Parameterize - need to be able to dynamically extend/modify this list
                        "input[type=hidden]",
                        "input[type=radio]",
                        "input[type=checkbox]",
                        "input[type=submit]",
                        "input[type=button]",
                        "input[type=search]"
                    ],
                    maskType: 4, // replace all alphas with X and digits with 9
                    maskFunction: function(value) {
                        return value.replace(/[a-z]/gi, "X").replace(/\d/g, "9");
                    }
                }
            ],
            privacyPatterns: [
                // Preemptively block SSN numbers in response
                {
                    pattern: {
                        regex: "\\d{3}-\\d{2}-\\d{4}",
                        flags: "g"
                    },
                    replacement: "XXX-XX-XXXX"
                },
                // Uncomment to block elements with .tlPrivate class
                {
                    pattern: {
                        regex: "<div[^<]*tlPrivate[^<]*>(.+?)</div>",
                        flags: "g"
                    },
                    replacement: function(fullMatch, group1) {
                        let retVal;
                        if (group1.length > 0) {
                            retVal = fullMatch.replace(group1, "xxxxxx");
                            return retVal;
                        }
                        return undefined;
                    }
                },
                {
                    pattern: {
                        regex: "<span[^<]*tlPrivate[^<]*>(.+?)</span>",
                        flags: "g"
                    },
                    replacement: replacementFun
                },
                {
                    pattern: {
                        regex: "<p[^<]*tlPrivate[^<]*>(.+?)</p>",
                        flags: "g"
                    },
                    replacement: replacementFun
                }
                ]
        },
        encoder: {
            gzip: {
                encode: "window.pako.gzip",
                defaultEncoding: "gzip"
            }
        },
        domCapture: {
            // Parameterize
            diffEnabled: true,
            // Options are set to these defaults:
            //
            // maxMutations: 100           // If this threshold is reached, the full DOM is captured instead of a diff
            // maxLength: 1000000          // If this threshold is reached, the DOM snapshot will not be sent
            // captureShadowDOM: false     // Enable ONLY if app is using shadown DOM. Also set allowHitSplit to false in org properties.
            // captureFrames: false        // Enable ONLY if child frames/iframes need to be captured for replay
            // captureDynamicStyles: false // Enable ONLY if dynamic/constructable/CSSOM styles are present
            // captureHREFStyles: false    // Enable ONLY if all styles need to be inserted inline (e.g if CSS files unreachable)
            // removeScripts: true         // Disable ONLY if script tags need to be preserved
            // removeComments: true        // Disable ONLY if comments need to be preserved
            // discardBase64: 0            // Not present by default! Discard all base64 encoded inline image data that exceeds N characters.
            // captureStyle: true          // Disable to remove inline CSS. Reduces the size of the DOM snapshots, but may affect replay.
            // keepImports: false          // Enable to honor the "import" link type, a now deprecated and Chrome specific feature
            //
            // Override as needed below:
            options: {
                maxLength: 10000000,
                captureShadowDOM: true,
                captureDynamicStyles: true,
                captureFrames: true
            }
        },
        browser: {
            normalizeTargetToParentLink: true
        }
    },
    modules: {
        overstat: {
            hoverThreshold: 3000
        },
        performance: {
            calculateRenderTime: true,
            renderTimeThreshold: 600000,
            performanceAlert: {
                enabled: true,
                threshold: 3000,
                maxAlerts: 100,
                // resourceTypes: [], // Capture everything
                blacklist: []
            }
        },
        replay: {
            tab: false,
            domCapture: {
                enabled: true,
                screenviewBlacklist: [],
                triggers: [
                    // Parameterize - need to be able to modify triggers
                    {
                        event: "change"
                    },
                    {
                        event: "click"
                    },
                    {
                        event: "dblclick"
                    },
                    {
                        event: "contextmenu"
                    },
                    {
                        event: "visibilitychange"
                    },
                    {
                        event: "load",
                        fullDOMCapture: true,
                        delay: 300
                    }
                ]
            },
            mousemove: {
                enabled: true,
                sampleRate: 200,
                ignoreRadius: 3
            }
        },
        ajaxListener: {
            urlBlocklist: [
                // Parameterize
                {
                    regex: "brilliantcollector\\.com"
                }
            ],
            // Parameterize
            filters: [
                {
                    log: {
                        requestHeaders: true,
                        requestData: false,
                        responseHeaders: true,
                        responseData: false
                    }
                }
            ]
        },
        dataLayer: {
            dataObjects: [
                {
                    dataObject: "window.dataLayer",
                    rules: {
                        screenviewBlocklist: [],
                        propertyBlocklist: [],
                        permittedProperties: [],
                        includeEverything: true // default: true
                    }
                }
            ]
        },
        TLCookie: {
            // Parameterize
            appCookieWhitelist: [{
                regex: ".*"
            }],
            tlAppKey: "",
            disableTLTDID: false
        }
    }
};