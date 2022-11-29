/* ABTasty.getTestsOnPage() */

var r = {
    "915403":  //----------
        "name": "Christmas Gift Guide 2022", //----------
        "type": "subsegment",
        "status": "accepted",
        "variationID": 1141534 //----------,
        "variationName": "Variation 1" //----------,
        "targetings": {
            "targetPages": {
                "url_scope": {
                    "conditions": [
                        {
                            "include": true,
                            "condition": 10,
                            "value": "globalshop.com.au/"
                        },
                        {
                            "include": false,
                            "condition": 10,
                            "value": "globalshop.com.au/purchase/cart"
                        },
                        {
                            "include": false,
                            "condition": 10,
                            "value": "globalshop.com.au/purchase/checkout"
                        },
                        {
                            "include": false,
                            "condition": 10,
                            "value": "globalshop.com.au/categories/christmas-gifts"
                        },
                        {
                            "include": false,
                            "condition": 10,
                            "value": "globalshop.com.au/content"
                        },
                        {
                            "include": false,
                            "condition": 10,
                            "value": "globalshop.com.au/products"
                        },
                        {
                            "include": false,
                            "condition": 10,
                            "value": "admin.prod.globalshop.com.au"
                        }
                    ],
                    "success": true
                }
            },
            "qaParameters": {},
            "segment": [
                {
                    "success": true,
                    "conditions": [
                        {
                            "id": "d1e50c69-ee3d-4af1-bc91-544b95bd3996",
                            "code_country": "AU",
                            "code_least_specific_subdivision": null,
                            "code_most_specific_subdivision": null,
                            "code_city": null,
                            "is_segment_type": true,
                            "include": true
                        }
                    ],
                    "targeting_type": 19,
                    "operator": "auto",
                    "name": "GEOLOCATION",
                    "group": 0
                },
                {
                    "success": true,
                    "conditions": [
                        {
                            "id": "c0f8824a-fbfe-4a9f-a6f1-31fdbf878970",
                            "value": 3,
                            "is_segment_type": true,
                            "include": true
                        }
                    ],
                    "targeting_type": 17,
                    "operator": "auto",
                    "name": "DEVICE",
                    "group": 0
                }
            ]
        },
        "testDatas": {
            "name": "Christmas Gift Guide 2022",
            "traffic": 100,
            "type": "subsegment",
            "parentID": 915402,
            "targetingMode": "noajax",
            "dynamicTrafficModulation": 50,
            "dynamicTestedTraffic": 100,
            "priority": 0,
            "size": 7,
            "mutationObserverEnabled": false,
            "codeOnDomReady": true,
            "scopes": {
                "urlScope": [
                    {
                        "include": true,
                        "condition": 10,
                        "value": "globalshop.com.au/"
                    },
                    {
                        "include": false,
                        "condition": 10,
                        "value": "globalshop.com.au/purchase/cart"
                    },
                    {
                        "include": false,
                        "condition": 10,
                        "value": "globalshop.com.au/purchase/checkout"
                    },
                    {
                        "include": false,
                        "condition": 10,
                        "value": "globalshop.com.au/categories/christmas-gifts"
                    },
                    {
                        "include": false,
                        "condition": 10,
                        "value": "globalshop.com.au/content"
                    },
                    {
                        "include": false,
                        "condition": 10,
                        "value": "globalshop.com.au/products"
                    },
                    {
                        "include": false,
                        "condition": 10,
                        "value": "admin.prod.globalshop.com.au"
                    }
                ],
                "testId": 915403
            },
            "analytics": [
                {
                    "name": "Google Analytics",
                    "wave": "",
                    "tracker": "gtm5",
                    "implementation": null,
                    "functionName": null
                }
            ],
            "actionTrackings": {
                "mousedown": [
                    {
                        "name": "Clicks on Xmas 22 Banner Desktop",
                        "selector": "div[id^=\"ab_widget_container_popin-image_\"][id*=\"_915403\"] a div img"
                    }
                ]
            },
            "audienceSegment": {
                "name": "Desktop Devices - Australia",
                "id": "3d3c0611-35b7-431c-8b56-5770a5a27755",
                "targeting_groups": [
                    {
                        "position": 0,
                        "id": "623ade72-21b5-44fe-b40a-8547e1f2b196",
                        "targetings": [
                            {
                                "id": "c21b3510-3a94-423d-be53-0575c5a463e4",
                                "operator": "auto",
                                "position": 0,
                                "conditions": [
                                    {
                                        "id": "d1e50c69-ee3d-4af1-bc91-544b95bd3996",
                                        "code_country": "AU",
                                        "code_least_specific_subdivision": null,
                                        "code_most_specific_subdivision": null,
                                        "code_city": null,
                                        "is_segment_type": true,
                                        "include": true
                                    }
                                ],
                                "targeting_type": 19,
                                "success": true
                            },
                            {
                                "id": "c39fc8c3-32b0-4d01-a2e2-f71719d34186",
                                "operator": "auto",
                                "position": 1,
                                "conditions": [
                                    {
                                        "id": "c0f8824a-fbfe-4a9f-a6f1-31fdbf878970",
                                        "value": 3,
                                        "is_segment_type": true,
                                        "include": true
                                    }
                                ],
                                "targeting_type": 17,
                                "success": true
                            }
                        ]
                    }
                ],
                "is_segment": true
            },
            "campaignHash": "54b7b0c59d8f95b77575e84343319a78",
            "id": 915403,
            "additionalType": "",
            "isAsync": true,
            "asyncVariationInfoById": {
                "1141534": {
                    "id": 1141534,
                    "traffic": 100,
                    "name": "Variation 1"
                }
            },
            "status": "accepted",
            "variations": {
                "1141534": {
                    "id": 1141534,
                    "name": "Variation 1",
                    "widgets": [
                        {
                            "id": "0aa2ad21-e470-42a7-b34b-c2ae84fc101f",
                            "version": "1.3",
                            "config": "{\"layout\":\"popin\",\"contentLayout\":\"imageOnly\",\"popinPosition\":[{\"x\":1,\"y\":0}],\"textImageRatio\":77,\"autoWidth\":true,\"popinPercentWidth\":50,\"popinPixelsWidth\":720,\"widthUnit\":\"vw\",\"autoHeight\":true,\"popinPercentHeight\":50,\"popinPixelsHeight\":352,\"heightUnit\":\"vh\",\"zindex\":\"9999\",\"zindexCustom\":1,\"image\":\"https://editor-assets.abtasty.com/49498/636adcde1bf161667947742.jpg\",\"isTitle\":true,\"title\":\"Your title goes here\",\"textContent\":\"Your message goes here. Keep it short and to the point. Make short sentences. Invite your users to consider your idea.\\n\\nYou can do multi-line messages.\",\"linkType\":\"widget\",\"buttonText\":\"Your call to action\",\"redirectionUrl\":\"https://www.globalshop.com.au/categories/christmas-gifts\",\"openInNewTab\":\"\",\"secondLink\":\"\",\"secondLinkType\":\"button\",\"secondLinkText\":\"Second button action\",\"secondLinkURL\":\"https://globalshop.com.au\",\"secondLinkOpenInNewTab\":\"\",\"titleTextAlign\":\"center\",\"titleTextColor\":\"rgba(0, 127, 145, 0)\",\"titleFontName\":\"inherit\",\"titleFontStyle\":\"font-style: normal !important; font-weight: normal;\",\"titleFontSize\":14,\"textAlign\":\"center\",\"textColor\":\"rgba(57, 57, 57, 0)\",\"fontName\":\"inherit\",\"fontStyle\":\"font-style: normal !important; font-weight: normal;\",\"fontSize\":14,\"buttonsBorderWidth\":1,\"buttonsBorderColor\":\"rgba(87, 184, 199, 1)\",\"buttonsBorderRadius\":4,\"buttonsBackgroundColor\":\"rgba(0, 127, 145, 1)\",\"buttonsTextColor\":\"rgba(247, 247, 247, 1)\",\"buttonsAlign\":\"center\",\"buttonsFontName\":\"inherit\",\"buttonsFontStyle\":\"font-style: normal !important; font-weight: normal;\",\"buttonsFontSize\":14,\"secondLinkBorderWidth\":1,\"secondLinkBorderColor\":\"rgba(87, 184, 199, 1)\",\"secondLinkBorderRadius\":4,\"secondLinkBackgroundColor\":\"rgba(0, 127, 145, 1)\",\"secondLinkTextColor\":\"rgba(247, 247, 247, 1)\",\"secondLinkFontName\":\"inherit\",\"secondLinkFontStyle\":\"font-style: normal !important; font-weight: normal;\",\"secondLinkFontSize\":14,\"containerMargin\":[{\"top\":0,\"left\":0,\"bottom\":0,\"right\":0}],\"containerPadding\":[{\"top\":0,\"right\":0,\"bottom\":0,\"left\":0}],\"backgroundColor\":\"rgba(255, 0, 0, 0)\",\"isBackgroundImage\":\"\",\"backgroundImage\":\"https://widgets-images.abtasty.com/widgets-default-image.png\",\"backgroundSize\":\"cover\",\"backgroundPosition\":\"center\",\"backgroundRepeat\":\"\",\"dropShadow\":false,\"dropShadowColor\":\"rgba(57, 57, 57, 0.25);\",\"dropShadowBlur\":10,\"borderWidth\":0,\"borderColor\":\"rgba(0, 127, 145, 1)\",\"borderRadius\":0,\"overlay\":false,\"overlayColor\":\"rgba(0, 0, 0, 0.6)\",\"overlayClickable\":true,\"closeButton\":true,\"closeButtonPosition\":\"in\",\"closeButtonSize\":20,\"closeButtonColor\":\"rgba(255, 255, 255, 1)\",\"closeButtonBackgroundColor\":\"rgba(255, 255, 255, 0)\",\"closeButtonBorderRadius\":0,\"closeButtonBorderWidth\":0,\"closeButtonBorderColor\":\"rgba(57, 57, 57, 1)\",\"triggerEvent\":\"pageLoad\",\"triggerEventClick\":\"body\",\"triggerEventElementVisible\":\"body\",\"triggerEventCustomScript\":\"/* In this example snippet, the widget will be triggered as soon as any scroll is detected.\\nCreate your own by resolving resolve() with true (which does trigger) or false (which doesn't trigger) */\\n\\nfunction launchIfScroll() {\\n\\treturn new Promise(resolve => {\\n\\t\\tdocument.addEventListener('scroll', () => resolve(true), {once: true});\\n\\t});\\n}\\n\\nconst result = await launchIfScroll();\\nreturn resolve(result);\",\"triggerEventHover\":\"body\",\"triggerEventScrollPercent\":50,\"triggerEventRageClickQuantity\":3,\"triggerEventRageClickDelay\":750,\"triggerEventMinPagesViewed\":3,\"triggerEventTrackingSent\":\"\",\"isOncePerPageTrigger\":true,\"triggerEventReengageDelay\":10,\"triggerEventDelay\":0,\"autoHide\":false,\"timeHide\":2,\"displayRecurrence\":\"everytime\",\"displayRecurrence_day\":5,\"displayRecurrence_week\":2,\"displayRecurrence_month\":1,\"closingRecurrence\":\"session\",\"closingRecurrence_day\":5,\"closingRecurrence_week\":2,\"closingRecurrence_month\":1,\"validationRecurrence\":\"everytime\",\"validationRecurrence_day\":5,\"validationRecurrence_week\":2,\"validationRecurrence_month\":1,\"animation\":\"none\",\"animationDuration\":500,\"animationBehaviour\":\"ease\",\"animationSlideDirection\":\"left\"}",
                            "name": "@abtasty/popin-image"
                        }
                    ],
                    "_tagInfo": "/* Created: 2022/11/28 10:27:47 GMT+00:00 version: next */",
                    "masterVariationId": 0
                }
            }
        }
    },
    "917069": {
        "name": "Xmas Tab Navigation",
        "type": "subsegment",
        "status": "accepted",
        "variationID": 1143478,
        "variationName": "Variation 1",
        "targetings": {
            "targetPages": {
                "url_scope": {
                    "conditions": [
                        {
                            "include": true,
                            "condition": 10,
                            "value": "globalshop.com.au"
                        },
                        {
                            "include": false,
                            "condition": 10,
                            "value": "globalshop.com.au/purchase/cart"
                        },
                        {
                            "include": false,
                            "condition": 10,
                            "value": "globalshop.com.au/purchase/checkout"
                        },
                        {
                            "include": false,
                            "condition": 10,
                            "value": "globalshop.com.au/purchase/offers"
                        }
                    ],
                    "success": true
                }
            },
            "qaParameters": {},
            "segment": [
                {
                    "success": true,
                    "conditions": [
                        {
                            "id": "9a61d950-856c-4c40-ae8f-81622bda341d",
                            "code_country": "AU",
                            "code_least_specific_subdivision": null,
                            "code_most_specific_subdivision": null,
                            "code_city": null,
                            "is_segment_type": true,
                            "include": true
                        }
                    ],
                    "targeting_type": 19,
                    "operator": "auto",
                    "name": "GEOLOCATION",
                    "group": 0
                }
            ]
        },
        "testDatas": {
            "name": "Xmas Tab Navigation",
            "traffic": 100,
            "type": "subsegment",
            "parentID": 917068,
            "targetingMode": "noajax",
            "dynamicTrafficModulation": 50,
            "dynamicTestedTraffic": 100,
            "priority": 0,
            "size": 2,
            "mutationObserverEnabled": false,
            "codeOnDomReady": true,
            "scopes": {
                "urlScope": [
                    {
                        "include": true,
                        "condition": 10,
                        "value": "globalshop.com.au"
                    },
                    {
                        "include": false,
                        "condition": 10,
                        "value": "globalshop.com.au/purchase/cart"
                    },
                    {
                        "include": false,
                        "condition": 10,
                        "value": "globalshop.com.au/purchase/checkout"
                    },
                    {
                        "include": false,
                        "condition": 10,
                        "value": "globalshop.com.au/purchase/offers"
                    }
                ],
                "testId": 917069
            },
            "analytics": [
                {
                    "name": "Google Analytics",
                    "wave": "",
                    "tracker": "gtm5",
                    "implementation": null,
                    "functionName": null
                }
            ],
            "actionTrackings": {
                "mousedown": [
                    {
                        "name": "Xmas Tab Clicks",
                        "selector": "#navbarFixed li.menu-item:nth-child(12) a"
                    }
                ]
            },
            "audienceSegment": {
                "name": "Australian Users",
                "id": "f3003619-16e3-4400-a2a0-80bf0350f440",
                "targeting_groups": [
                    {
                        "position": 0,
                        "id": "3740c20c-d3d8-4a79-aed7-f00fc0f2e94c",
                        "targetings": [
                            {
                                "id": "2b60c1ac-9be3-485a-9f00-dc2acdfdea81",
                                "operator": "auto",
                                "position": 0,
                                "conditions": [
                                    {
                                        "id": "9a61d950-856c-4c40-ae8f-81622bda341d",
                                        "code_country": "AU",
                                        "code_least_specific_subdivision": null,
                                        "code_most_specific_subdivision": null,
                                        "code_city": null,
                                        "is_segment_type": true,
                                        "include": true
                                    }
                                ],
                                "targeting_type": 19,
                                "success": true
                            }
                        ]
                    }
                ],
                "is_segment": true
            },
            "id": 917069,
            "additionalType": "",
            "isAsync": false,
            "variations": {
                "1143478": {
                    "id": 1143478,
                    "name": "Variation 1",
                    "traffic": 100,
                    "masterVariationId": 1143477,
                    "modifications": [
                        {
                            "id": 4093743,
                            "selector": "#navbarFixed li.menu-item:nth-child(12) a",
                            "type": "editStyleCSS",
                            "value": {
                                "background-color": "rgba(130,16,36,255)!important"
                            }
                        }
                    ]
                }
            },
            "status": "accepted"
        }
    }
}