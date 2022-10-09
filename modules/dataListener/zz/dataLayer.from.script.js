/**
 * Copyright (c) 2021 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 */

/**
 * @fileOverview The Data Layer module implements the logic for monitoring and
 * reporting various data layer objects.
 * @exports dataLayer
 */

/*global TLT:true */

/**
 * @name dataLayer
 * @namespace
 */
TLT.addModule("dataLayer", function (context) {
	"use strict";

	var initialized = false,
		moduleConfig,
		utils = context.utils,
		logDelay,
		propertyBlocklist,
		screenviewBlocklist,
		timerId;

	/**
	 * Retrieves the data layer object from the configuration.
	 * @private
	 * @function
	 * @name dataLayer-getDataLayerObject
	 * @return {Object} The data layer object or null.
	 */
	function getDataLayerObject() {
		var dataObj = null;

		// Sanity check
		if (!moduleConfig.dataObject) {
			return dataObj;
		}

		switch (typeof moduleConfig.dataObject) {
			case "object":
				dataObj = moduleConfig.dataObject;
				break;
			case "function":
				try {
					dataObj = moduleConfig.dataObject();
				} catch (e) {
				}
				break;
			default:
				break;
		}
		return dataObj;
	}

	/**
	 * Returns the index of the rule, if the given string matches the blocklist.
	 * @private
	 * @function
	 * @name dataLayer-getMatchIndex
	 * @param {string} str The string to be checked.
	 * @param {array} blocklist List of rules to match against. Each entry in the list can be a string or an object { regex, flags }
	 * @returns {integer} -1 if there is no match. The index of the blocklist rule in case of a match.
	 */
	function getMatchIndex(str, blocklist) {
		var i,
			len,
			rule,
			retVal = -1;

		// Sanity check
		if (!str || !blocklist) {
			return retVal;
		}

		for (i = 0, len = blocklist.length; i < len && retVal === -1; i += 1) {
			rule = blocklist[ i ];
			switch (typeof rule) {
				case "string":
					if (str === rule) {
						retVal = i;
					}
					break;
				case "object":
					if (!rule.cRegex) {
						// Cache the regex object.
						rule.cRegex = new RegExp(rule.regex, rule.flags);
					}
					rule.cRegex.lastIndex = 0;
					if (rule.cRegex.test(str)) {
						retVal = i;
					}
					break;
				default:
					break;
			}
		}

		return retVal;
	}

	/**
	 * Check if the property name matches the blocklist.
	 * @private
	 * @function
	 * @name dataLayer-isPropertyBlocked
	 * @param {string} propertyName The name of the property to be checked.
	 * @param {array} [blocklist] List of rules to match against.
	 * @returns {boolean} True if the property is on the blocklist.
	 */
	function isPropertyBlocked(propertyName, blocklist) {
		blocklist = blocklist || propertyBlocklist;
		return (getMatchIndex(propertyName, blocklist) >= 0);
	}

	/**
	 * Check if the screenview name matches the blocklist.
	 * @private
	 * @function
	 * @name dataLayer-isScreenviewBlocked
	 * @param {string} screenviewName The screenview name to be checked.
	 * @param {array} [blocklist] List of rules to match against.
	 * @returns {boolean} True if the screenview is on the blocklist.
	 */
	function isScreenviewBlocked(screenviewName, blocklist) {
		blocklist = blocklist || screenviewBlocklist;
		return (getMatchIndex(screenviewName, blocklist) >= 0);
	}

	/**
	 * Apply blocklist and return the final data object to be logged.
	 * @private
	 * @function
	 * @name dataLayer-processDataLayerObject
	 * @param  {Object} dataObject The data layer object.
	 * @returns {Object} The processed data layer object with blocklist applied.
	 */
	function processDataLayerObject(dataObject) {
		var property,
			testStr,
			retObj = {};

		// Sanity check
		if (!dataObject) {
			return null;
		}

		for (property in dataObject) {
			if (Object.prototype.hasOwnProperty.call(dataObject, property)) {
				// Blocklist check
				if (!isPropertyBlocked(property)) {
					// Copy only relevant properties while ignoring functions and undefined values.
					switch (typeof dataObject[ property ]) {
						case "object":
							// Check if the object can be serialized
							try {
								testStr = JSON.stringify(dataObject[ property ]);
								// Process arrays as objects.
								retObj[ property ] = processDataLayerObject(dataObject[ property ]);
							} catch (e) {
								retObj[ property ] = "Serialization error: " + e.message;
							}
							break;
						case "function":
							// skip functions
							break;
						case "undefined":
							// skip undefined
							break;
						default:
							retObj[ property ] = dataObject[ property ];
							break;
					}
				} else {
				}
			}
		}
		return retObj;
	}

	/**
	 * Posts the data layer object after applying any blocklist rules.
	 * @private
	 * @function
	 * @name dataLayer-logDataLayer
	 * @param {Object} [dataObject] Optional data layer object to be logged.
	 * If one is not explicitly specified then the data layer specified in the
	 * configuration will be used.
	 */
	function logDataLayer(dataObject) {
		var dataLayerMsg = {
			type: 19,
			dataLayer: {}
		};

		// Sanity checks
		if (!initialized) {
			return;
		}

		dataObject = dataObject || getDataLayerObject();
		if (!dataObject) {
			// Nothing to log or unable to retrieve the data object.
			return;
		}

		dataLayerMsg.dataLayer = processDataLayerObject(dataObject);

		// Invoke the context API to post the message.
		context.post(dataLayerMsg);

		// Clear any pending timer
		if (timerId) {
			clearTimeout(timerId);
			timerId = null;
		}
	}


	// Module interface.
	/**
	 * @scope dataLayer
	 */
	return {


		/**
		 * Initialize the dataLayer module.
		 */
		init: function () {
			moduleConfig = context.getConfig();
			propertyBlocklist = moduleConfig.propertyBlocklist || [];
			screenviewBlocklist = moduleConfig.screenviewBlocklist || [];
			logDelay = utils.getValue(moduleConfig, "logDelay", 500);
			if (typeof moduleConfig.dataObject === "string") {
				// Access the actual data object or function
				moduleConfig.dataObject = utils.access(moduleConfig.dataObject);
			}
			timerId = null;
			initialized = true;
		},

		/**
		 * Terminate the dataLayer module.
		 */
		destroy: function () {
			moduleConfig = null;

			if (timerId) {
				clearTimeout(timerId);
				timerId = null;
			}
			initialized = false;
		},

		/**
		 * Handle events subscribed by the dataLayer module.
		 * @param  {Object} event The normalized data extracted from a browser event object.
		 */
		onevent: function (event) {
			// Sanity check
			if (typeof event !== "object" || !event.type) {
				return;
			}

			switch (event.type) {
				case "load":
					timerId = null;
					break;
				case "screenview_load":
					// Log the data layer if the screenview isn't blocked and a prior log request isn't already pending.
					if (!isScreenviewBlocked(event.name) && !timerId) {
						timerId = setTimeout(logDataLayer, logDelay);
					}
					break;
				case "logDataLayer":
					if (!event.data || typeof event.data === "object") {
						// Explicitly log the data layer.
						logDataLayer(event.data);
					}
					break;
				case "unload":
					// If a data layer log is pending, do it now.
					if (timerId) {
						logDataLayer();
					}
					break;
				default:
					break;
			}
		},

		/**
		 * Handle system messages subscribed by the module.
		 * @param  {Object} msg An object containing the message information.
		 */
		onmessage: function (msg) {

		}
	};
});  // End of TLT.addModule