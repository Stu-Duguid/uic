//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------- Trigger DOM Capture based on DOM Mutation 07/18/2018
//----------------------------------------------------------------------------------------------------------
TLT.addModule("mutationDOMCapture", function (context) {
	var mdcFilters = TLT.getCoreConfig().modules.mutationDOMCapture.filters;
	function mutationDOMCapture(childObj) {
		var child = childObj.selector,
		//console.log("XXXXXXXXXXXx Child Object "+child);
		useDocTitleName = childObj.useDocTitleName,
		useSelectorName = childObj.useSelectorName,
		useCustomName = childObj.useCustomName,
		useCustomPrefix = childObj.useCustomPrefix,
		useCustomEvent = childObj.useCustomEvent,
		onAdd = childObj.onAdd,
		onRemove = childObj.onRemove,
		showStatus = childObj.showStatus,
		simulateClick = childObj.simulateClick,
		simulateCustom = childObj.simulateCustom,
		fireMultiple = childObj.fireMultiple,
		lazyLoad = childObj.lazyLoad,
		logAttribute = childObj.logAttribute,
		dupeTimer = childObj.dupeTimer,
		flushQueue = childObj.flushQueue,
		timeThis = 0,
		target = document,
		lastCheck = document.querySelectorAll(child).length;

		//------------------------------------------------ Event & CustomEvent Polyfills for IE9-11 Browsers
		if (typeof window.CustomEvent !== 'function') {
			window.CustomEvent = function (inType, params) {
				params = params || {};
				var e = document.createEvent('CustomEvent');
				e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
				return e;
			};
			window.CustomEvent.prototype = window.Event.prototype;
		}
		if (typeof window.Event !== 'function') {
			var origEvent = window.Event;
			window.Event = function (inType, params) {
				params = params || {};
				var e = document.createEvent('Event');
				e.initEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable));
				return e;
			};
			if (origEvent) {
				for (var i in origEvent) {
					window.Event[i] = origEvent[i];
				}
			}
			window.Event.prototype = origEvent.prototype;
		}

		var observer = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					var childStatus = document.querySelectorAll(child).length;
					if ((childStatus > lastCheck) || (childStatus === 1 && lastCheck === 0)) {
						var svName = useCustomPrefix;
						if (useDocTitleName) {
							svName = svName + document.title;
						} else if (useSelectorName) {
							svName = svName + child;
						} else if (useCustomName) {
							svName = svName + useCustomName;
						}
						if (svName === "") {
							svName = "DEFAULT";
						}
						if (simulateCustom) {
							console.log("XXXXXXXXXXXXX Logging Lazy Load XXXXXXXX");
							try {
								var e = new Event(useCustomEvent);
							} catch (err) {
								try {
									var e = new CustomEvent(useCustomEvent);
								} catch (err) {}
							}
						}
					
						if (onAdd) {
							if (lazyLoad) {
								if (showStatus && onAdd && onRemove) {
									svName = svName + " -Shown-"
								}
								if (dupeTimer == 0 || (dupeTimer > 0 && timeThis < new Date().getTime())) {
									if (simulateClick || simulateCustom) {
										var s = document.getElementsByTagName("script")[0];
										var sv = svName.replace(/[`~!@#$%^&*()|+=?;'",<>\ \{\}\[\]\\\/]/gi, "");
										var myNode = document.createElement("input");
										myNode.setAttribute("type", "button");
										myNode.setAttribute("id", sv);
										myNode.setAttribute("hidden", "true");
										if (logAttribute) {
											try {
												myNode.setAttribute("value", document.querySelector(child).getAttribute(logAttribute));
											} catch (e) {};
										}
										s.parentNode.appendChild(myNode, s);
										if (simulateClick) {
											document.getElementById(sv).click();
										}
										if (simulateCustom) {
											document.getElementById(sv).dispatchEvent(e);
										}
										s.parentNode.removeChild(myNode);
									} else {
										TLT.logScreenviewLoad(svName);
									}
									if (!fireMultiple) {
										observer.disconnect();
									}
									if (dupeTimer) {
										timeThis = new Date().getTime() + dupeTimer;
									}
									if (flushQueue) {
										TLT.flushAll();
									}
								}
							}
						}
						if (onRemove) {
							if (lazyLoad) {
								if (showStatus && onAdd && onRemove) {
									svName = svName + " -Hidden-"
								}
								if (dupeTimer == 0 || (dupeTimer > 0 && timeThis < new Date().getTime())) {
									if (simulateClick || simulateCustom) {
										var s = document.getElementsByTagName("script")[0];
										var sv = svName.replace(/[`~!@#$%^&*()|+=?;'",<>\ \{\}\[\]\\\/]/gi, "");
										var myNode = document.createElement("input");
										myNode.setAttribute("type", "button");
										myNode.setAttribute("id", sv);
										myNode.setAttribute("hidden", "true");
										if (logAttribute) {
											try {
												myNode.setAttribute("value", document.querySelector(child).getAttribute(logAttribute));
											} catch (e) {};
										}
										s.parentNode.appendChild(myNode, s);
										if (simulateClick) {
											document.getElementById(sv).click();
										}
										if (simulateCustom) {
											document.getElementById(sv).dispatchEvent(e);
										}
										s.parentNode.removeChild(myNode);
									} else {
										TLT.logScreenviewLoad(svName);
									}
									if (!fireMultiple) {
										observer.disconnect();
									}
									if (dupeTimer) {
										timeThis = new Date().getTime() + dupeTimer;
									}
									if (flushQueue) {
										TLT.flushAll();
									}
								}
							}
						}
					}
					lastCheck = document.querySelectorAll(child).length;
				});
			});

		var config = {
			attributes: true,
			childList: true,
			characterData: true,
			subtree: true
		};
		observer.observe(target, config);
	};

	return {
		init: function () {},
		destroy: function () {},
		onevent: function (webEvent) {
			if (typeof webEvent !== "object" || !webEvent.type) {
				return;
			} // Sanity check
			if (webEvent) {
				for (index = 0; index < mdcFilters.children.length; ++index) {
					var mdcObject = TLT.getCoreConfig().modules.mutationDOMCapture.filters.children[index];
					for (i = 0; i < mdcObject.enabledURLS.length; ++i) {
						var hash = window.location.pathname;
						if (hash.indexOf(mdcObject.enabledURLS[i]) > -1) {
							try {
								mutationDOMCapture(mdcObject);
							} catch (ex) {}
							break;
						}
					}
				}
			}
		}
	};
});

			modules: {
				mutationDOMCapture: {
					enabled: true,
					events: [
						{ name: "load", target: window },
						{ name: "unload", target: window }
					],
					filters: {
						children: [{
								selector: '.tl-loading-mask[style*="display: none;"]', // CSS selector to trigger DOM capture
								useDocTitleName: false, // log title using document.title
								useSelectorName: false, // log title as selector
								useCustomName: "Preloader", // log title as custom text
								useCustomPrefix: "DOM-", // prefix screen view logging with custom text
								useCustomEvent: "lazyload", // specified when not using LOAD or CLICK event
								onAdd: true, // trigger when selector added to DOM
								onRemove: false, // trigger when selector removed from DOM
								showStatus: true, // log status as (Shown) or (Hidden)
								simulateClick: false, // simulate click event
								simulateCustom: true, // simulate custom event (must specify in Replay & DOM config)
								fireMultiple: true, // allow trigger to fire multiple times
								lazyLoad: true, // allow lazy loading of duplicates to trigger DOM
								logAttribute: "", // log custom data when trigger fires (optional)
								enabledURLS: ["webapp"], // exclude partial URL to limit trigger (optional)
								dupeTimer: 500, // ms to prevent duplicate triggers
								flushQueue: false // flush queue to help prevent data loss on confirmation pages
							}
						]
					}
				},
