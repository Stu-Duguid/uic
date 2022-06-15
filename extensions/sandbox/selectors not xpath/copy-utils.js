var ua = window.navigator.userAgent.toLowerCase();

var utils = {};

/**
 * Indicates if browser is IE.
 */
utils.isIE = (ua.indexOf("msie") !== -1 || ua.indexOf("trident") !== -1);

/**
 * Indicates if browser is IE<9 or IE 9+ running in
 * compatibility mode.
 */
utils.isLegacyIE = (function () {
  // W3 Navigation timing spec. supported from IE 9 onwards.
  var isNavTimingSupported = !!window.performance;
  return (utils.isIE && (!isNavTimingSupported || document.documentMode < 9));
}());

/**
 * Indicates if browser is IE 9.
 */
var isIE9 = (function () {
  return (utils.isIE && document.documentMode === 9);
}());

/**
 * Indicates if the browser is based on an Android platform device.
 */
utils.isAndroid = (ua.indexOf("android") !== -1);

/**
 * Indicates if the device considers zero degrees to be landscape and 90 degrees to be portrait
 */
utils.isLandscapeZeroDegrees = false;

/**
 * Indicates if the browser is based on an iOS platform device.
 */
utils.isiOS = /(ipad|iphone|ipod)/.test(ua);

/**
 * Indicates if the browser is Opera Mini.
 */
utils.isOperaMini = (ua.indexOf("opera mini") !== -1);

/**
 * Indicates if the browser is Safari.
 */
utils.isSafari = (ua.indexOf("chrome") === -1) && (ua.indexOf("safari") !== -1);

/**
 * Checks whether given parameter is null or undefined
 * @param {*} obj Any value
 * @returns {boolean} True if obj is null or undefined; false otherwise
 */
utils.isUndefOrNull = function (obj) {
  return typeof obj === "undefined" || obj === null;
};

/**
 * Checks if the given parameter is an Array.
 * @param {*} obj Any value
 * @returns {boolean} True if obj is an Array; false otherwise.
 */
utils.isArray = function (obj) {
  return !!(obj && Object.prototype.toString.call(obj) === "[object Array]");
};

/**
 * Returns a unique serial number
 * @returns {int} A number that can be used as a unique identifier.
 */
utils.getSerialNumber = function () {
  var id;

  id = tltUniqueIndex;
  tltUniqueIndex += 1;

  return id;
};

/**
 * Generates a random string of specified length and comprised of
 * characters from the specified data set or any alphanumeric.
 * @param {integer} length The required length of the random string.
 * @param {string}  [dataSet] Optional string specifying the set of characters
 *                  to be used for generating the random string.
 * @returns {String} A randomly generated string of specified length.
 */
utils.getRandomString = function (length, dataSet) {
  var i,
    dataSetLength,
    defaultDataSet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
    randomString = "";

  // Sanity check
  if (!length) {
    return randomString;
  }

  if (typeof dataSet !== "string") {
    dataSet = defaultDataSet;
  }

  for (i = 0, dataSetLength = dataSet.length; i < length; i += 1) {
    // AppScan: IGNORE (false flag) - Math.random is not used in a cryptographical context.
    randomString += dataSet.charAt(Math.floor(Math.random() * dataSetLength));
  }

  return randomString;
};

/**
 * Used to test and get value from an object.
 * @private
 * @function
 * @name core.utils.getValue
 * @param {object} parentObj An object you want to get a value from.
 * @param {string} propertyAsStr A string that represents dot notation to get a value from object.
 * @param {object|String|Number} [defaultValue] The default value to be returned if the property is not found.
 * @return {object} If object is found, if not then default value will be returned. If the default value is
 * not defined then null will be returned.
 */
utils.getValue = function (parentObj, propertyAsStr, defaultValue) {
  var i,
    len,
    properties;

  defaultValue = typeof defaultValue === "undefined" ? null : defaultValue;

  // Sanity check
  if (!parentObj || typeof parentObj !== "object" || typeof propertyAsStr !== "string") {
    return defaultValue;
  }

  properties = propertyAsStr.split(".");
  for (i = 0, len = properties.length; i < len; i += 1) {
    if (this.isUndefOrNull(parentObj) || typeof parentObj[properties[i]] === "undefined") {
      return defaultValue;
    }
    parentObj = parentObj[properties[i]];
  }
  return parentObj;
};

/**
 * Helper function to find an item in an array.
 * @param {Array} array The array to search.
 * @param {String} item The item to search for.
 * @returns {int} The index of the item if found, -1 if not.
 */
utils.indexOf = function (array, item) {
  var i,
    len;

  if (array && array.indexOf) {
    return array.indexOf(item);
  }

  if (array && array instanceof Array) {
    for (i = 0, len = array.length; i < len; i += 1) {
      if (array[i] === item) {
        return i;
      }
    }
  }

  return -1;
};

/**
 * Invokes callback for each element of an array.
 * @param {Array} array The array (or any indexable object) to walk through
 * @param {function} callback Callback function
 * @param {object} [context] context object; if not provided global object will be considered
 */
utils.forEach = function (array, callback, context) {
  var i,
    len;

  // Sanity checks
  if (!array || !array.length || !callback || !callback.call) {
    return;
  }

  for (i = 0, len = array.length; i < len; i += 1) {
    callback.call(context, array[i], i, array);
  }
};

/**
 * Returns true if callback returns true at least once. Callback is
 * called for each array element unless it reaches end of array or
 * returns true.
 * @param {object} array An Array or any indexable object to walk through
 * @param {function} callback A callback function
 * @returns {boolean} True if callback returned true at least once; false otherwise
 */
utils.some = function (array, callback) {
  var i,
    len,
    val = false;

  for (i = 0, len = array.length; i < len; i += 1) {
    val = callback(array[i], i, array);
    if (val) {
      return val;
    }
  }
  return val;
};

/**
 * Converts an arguments object into an array. This is used to augment
 * the arguments passed to the TLT methods used by the Module Context.
 * @param {Arguments} items An array-like collection.
 * @return {Array} An array containing the same items as the collection.
 */
utils.convertToArray = function (items) {
  var i = 0,
    len = items.length,
    result = [];

  while (i < len) {
    result.push(items[i]);
    i += 1;
  }

  return result;
};

utils.mixin = function (dst) {
  var prop,
    src,
    srcId,
    len;

  for (srcId = 1, len = arguments.length; srcId < len; srcId += 1) {
    src = arguments[srcId];
    for (prop in src) {
      if (Object.prototype.hasOwnProperty.call(src, prop)) {
        dst[prop] = src[prop];
      }
    }
  }
  return dst;
};

utils.extend = function (deep, target, src) {
  var prop = "";

  for (prop in src) {
    if (Object.prototype.hasOwnProperty.call(src, prop)) {
      if (deep && Object.prototype.toString.call(src[prop]) === "[object Object]") {
        if (typeof target[prop] === "undefined") {
          target[prop] = {};
        }
        this.extend(deep, target[prop], src[prop]);
      } else {
        target[prop] = src[prop];
      }
    }
  }
  return target;
};

/**
 * Makes copy of an object.
 * @function
 * @name core.utils.clone
 * @param {object} obj A object that will be cloned.
 * @return {object} Object cloned.
 */
utils.clone = function (obj) {
  var copy,
    attr;

  if (null === obj || "object" !== typeof obj) {
    return obj;
  }

  if (obj instanceof Object) {
    copy = (Object.prototype.toString.call(obj) === "[object Array]") ? [] : {};
    for (attr in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, attr)) {
        copy[attr] = this.clone(obj[attr]);
      }
    }
    return copy;
  }
};

/**
 * Parses a version string of format e.g. "5.1.0" and returns an array
 * with individual version components [5, 1, 0]
 * @function
 * @param {String} version The version string
 * @returns {Array} The version components parsed as integers.
 */
utils.parseVersion = function (version) {
  var i,
    len,
    retval = [];

  // Sanity check
  if (!version || !version.length) {
    return retval;
  }

  retval = version.split(".");
  for (i = 0, len = retval.length; i < len; i += 1) {
    retval[i] = /^[0-9]+$/.test(retval[i]) ? parseInt(retval[i], 10) : retval[i];
  }

  return retval;
};

/**
 *
 */
utils.isEqual = function (a, b) {
  var i,
    isEqual,
    prop,
    swap,
    len;

  if (a === b) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (a instanceof Object && b instanceof Object) {
    // Array
    if (Object.prototype.toString.call(a) === "[object Array]" &&
      Object.prototype.toString.call(b) === "[object Array]") {
      if (a.length !== b.length) {
        return false;
      }
      for (i = 0, len = a.length; i < len; i += 1) {
        if (!this.isEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
    // Object
    if (Object.prototype.toString.call(a) === "[object Object]" &&
      Object.prototype.toString.call(b) === "[object Object]") {
      for (i = 0; i < 2; i += 1) {
        for (prop in a) {
          if (a.hasOwnProperty(prop)) {
            if (!b.hasOwnProperty(prop)) {
              return false;
            }
            isEqual = this.isEqual(a[prop], b[prop]);
            if (!isEqual) {
              return false;
            }
          }
        }
        swap = a;
        a = b;
        b = swap;
      }
      return true;
    }
  }
  return false;
};

/**
 * Calculates and returns the normalized (X, Y) values of the mouse/touch position relative to the
 * target elements (top, left) position.
 * @function
 * @param {Object} info object {x: val, y: val, width: val, height: val}
 * containing event x, y relative to element topLeft, width and height of element
 * @return String value of relative X & Y. Default in case of error or negative values is "0.5,0.5"
 */
utils.calculateRelativeXY = function (info) {
  if (utils.isUndefOrNull(info) || utils.isUndefOrNull(info.x) || utils.isUndefOrNull(info.y) || utils.isUndefOrNull(info.width) || utils.isUndefOrNull(info.height)) {
    return "0.5,0.5";
  }
  var relX = Math.abs(info.x / info.width).toFixed(4),
    relY = Math.abs(info.y / info.height).toFixed(4);

  relX = relX > 1 || relX < 0 ? 0.5 : relX;
  relY = relY > 1 || relY < 0 ? 0.5 : relY;

  return relX + "," + relY;
};


/**
 *
 */
utils.createObject = (function () {
  var fn = null,
    F = null;
  if (typeof Object.create === "function") {
    fn = Object.create;
  } else {
    F = function () {};
    fn = function (o) {
      if (typeof o !== "object" && typeof o !== "function") {
        throw new TypeError("Object prototype need to be an object!");
      }
      F.prototype = o;
      return new F();
    };
  }
  return fn;
}());

/**
 * Method access the object element based on a string. By default it searches starting from window object.
 * @function
 * @example core.utils.access("document.getElementById");
 * @example core.utils.access("address.city", person);
 * @param {string} path Path to object element. Currently on dot separators are supported (no [] notation support)
 * @param {object} [rootObj=window] Root object where there search starts. window by default
 * @return {*} Object element or undefined if the path is not valid
 */
utils.access = function (path, rootObj) {
  var obj = rootObj || window,
    arr,
    i,
    len;

  // Sanity check
  if (typeof path !== "string" || typeof obj !== "object") {
    return;
  }
  arr = path.split(".");
  for (i = 0, len = arr.length; i < len; i += 1) {
    if (i === 0 && arr[i] === "window") {
      continue;
    }
    if (!Object.prototype.hasOwnProperty.call(obj, arr[i])) {
      return;
    }
    obj = obj[arr[i]];
    if (i < (len - 1) && !(obj instanceof Object)) {
      return;
    }
  }
  return obj;
};

/**
 * Checks if a given character is numeric.
 * @param  {String}  character The character to test.
 * @return {Boolean} Returns true if the given character is a number.
 */
utils.isNumeric = function (character) {
  var retVal = false;

  // Sanity check
  if (utils.isUndefOrNull(character) || !(/\S/.test(character))) {
    return retVal;
  }

  retVal = !isNaN(character * 2);
  return retVal;
};

/**
 * Checks if a given character is uppercase.
 * @param  {String}  character The character to test.
 * @return {Boolean} Returns true if the character is uppercase.
 *                   Otherwise false.
 */
utils.isUpperCase = function (character) {
  return character === character.toUpperCase() &&
    character !== character.toLowerCase();
};

/**
 * Checks if a given character is lowercase.
 * @param  {String}  character The character to test.
 * @return {Boolean} Returns true if the character is lowercase.
 *                   Otherwise false.
 */
utils.isLowerCase = function (character) {
  return character === character.toLowerCase() &&
    character !== character.toUpperCase();
};

/**
 * Builds an object of key => value pairs of HTTP headers from a string.
 * @param {String} headers The string of HTTP headers separated by newlines
 * (i.e.: "Content-Type: text/html\nLast-Modified: ..")
 * @return {Object} Returns an object where every key is a header and
 * every value it's corresponding value.
 */
utils.extractResponseHeaders = function (headers) {
  var headersObj = {},
    i,
    len,
    header = null;

  // Sanity check
  if (!headers || !headers.length) {
    headers = [];
  } else {
    headers = headers.split('\n');
  }

  for (i = 0, len = headers.length; i < len; i += 1) {
    header = headers[i].split(': ');
    if (header.length === 2) {
      headersObj[header[0]] = header[1];
    }
  }
  return headersObj;
};

/**
 *
 */
utils.getTargetState = function (target) {
  var tagnames = {
      "a": ["innerText", "href"],
      "input": {
        "range": ["maxValue:max", "value"],
        "checkbox": ["value", "checked"],
        "radio": ["value", "checked"],
        "image": ["src"]
      },
      "select": ["value"],
      "button": ["value", "innerText"],
      "textarea": ["value"]
    },
    tagName = this.getTagName(target),
    properties = tagnames[tagName] || null,
    selectedOption = null,
    state = null,
    alias = null,
    key = "";

  if (properties !== null) {
    // For input elements, another level of indirection is required
    if (Object.prototype.toString.call(properties) === "[object Object]") {
      // default state for input elements is represented by the "value" property
      properties = properties[target.type] || ["value"];
    }
    state = {};
    for (key in properties) {
      if (properties.hasOwnProperty(key)) {
        if (properties[key].indexOf(":") !== -1) {
          alias = properties[key].split(":");
          state[alias[0]] = target[alias[1]];
        } else if (properties[key] === "innerText") {
          state[properties[key]] = this.trim(target.innerText || target.textContent);
        } else {
          state[properties[key]] = target[properties[key]];
        }
      }
    }
  }

  // Special processing for select lists
  if (tagName === "select" && target.options && !isNaN(target.selectedIndex)) {
    state = state || {};
    state.index = target.selectedIndex;
    if (state.index >= 0 && state.index < target.options.length) {
      selectedOption = target.options[target.selectedIndex];
      /* Select list value is derived from the selected option's properties
       * in the following order:
       * 1. value
       * 2. label
       * 3. text
       * 4. innerText
       */
      state.value = selectedOption.getAttribute("value") || selectedOption.getAttribute("label") || selectedOption.text || selectedOption.innerText;
      state.text = selectedOption.text || selectedOption.innerText;
    }
  }

  // Indicate if any element is disabled
  if (state && target.disabled) {
    state.disabled = true;
  }

  return state;
};

utils.getDocument = function (node) {
  var doc = node;
  if (node && node.nodeType !== 9) {
    if (node.getRootNode) {
      doc = node.getRootNode();
    } else {
      doc = node.ownerDocument || node.document;
    }
  }
  return doc;
};

utils.getWindow = function (node) {
  try {
    if (node.self !== node) {
      var ownerDocument = utils.getDocument(node);
      return (!utils.isUndefOrNull(ownerDocument.defaultView)) ? (ownerDocument.defaultView) : (ownerDocument.parentWindow);
    }
  } catch (e) {
    // node or it's ownerDocument may not be associated with any window
    node = null;
  }
  return node;
};

/**
 * Given a window.location or document.location object, extract and return the
 * origin and pathname.
 * @param {Object} location The window.location or document.location Object
 * @return {Object} Return an object containing the normalized origin and the pathname.
 */
utils.getOriginAndPath = function (location) {
  var retObj = {},
    temp,
    search,
    searchParams,
    key,
    value,
    queryArray = [],
    queryParamsTmp = {},
    i,
    j;

  location = location || window.location;

  if (location.origin) {
    retObj.origin = location.origin;
  } else {
    retObj.origin = (location.protocol || "") + "//" + (location.host || "");
  }

  // Account for some applications using the ";" as the query separator
  retObj.path = (location.pathname || "").split(";", 1)[0];

  // This is needed for Native hybrid replay to get file path of webview assets used.
  if (retObj.origin.indexOf("file://") > -1 || (utils.isiOS && window.Ionic)) {
    temp = retObj.path.match(/(.*)(\/.*app.*)/);
    if (temp !== null) {
      retObj.path = temp[2];
      // Set host to fix replay images for Ionic app only
      retObj.origin = "file://";
    }
  }

  // Analyze query params from url
  search = location.search || "";
  try {
    searchParams = new URLSearchParams(search);
    searchParams.forEach(function (_value, _key) {
      queryParamsTmp[_key] = _value;
    });
  } catch (e) {
    // URLSearchParams is not supported, parse queries manually
    if (search.length > 1 && search.charAt(0) === '?') {
      queryArray = decodeURIComponent(search).substring(1).split("&");
    }
    for (i = 0; i < queryArray.length; i += 1) {
      j = queryArray[i].indexOf("=");
      if (j > -1) {
        key = queryArray[i].substring(0, j);
        value = queryArray[i].substring(j + 1);
        queryParamsTmp[key] = value;
      }
    }
  }
  retObj.queryParams = queryParamsTmp;

  return retObj;
};

/**
 * Given a HTML frame element, returns the window object of the frame. Tries the contentWindow property
 * first. If contentWindow is not accessible, tries the contentDocument.parentWindow property instead.
 * @param {Object} iFrameElement The HTML frame element object.
 * @return {Object} Returns the window object of the frame element or null.
 */
utils.getIFrameWindow = function (iFrameElement) {
  var contentWindow = null;

  if (!iFrameElement) {
    return contentWindow;
  }

  try {
    contentWindow = iFrameElement.contentWindow ||
      (iFrameElement.contentDocument ? iFrameElement.contentDocument.parentWindow : null);
  } catch (e) {
    // Do nothing.
  }

  return contentWindow;
};

/**
 * Returns the tagName of the element in lowercase.
 * @param {Element} node DOM element
 * @return {String} The tagName of the element in lowercase.
 */
utils.getTagName = function (node) {
  var tagName = "";

  // Sanity check
  if (utils.isUndefOrNull(node)) {
    return tagName;
  }

  if (node === document || node.nodeType === 9) {
    tagName = "document";
  } else if (node === window || node === window.window) {
    tagName = "window";
  } else if (typeof node === "string") {
    tagName = node.toLowerCase();
  } else {
    tagName = (node.tagName || node.nodeName || "").toLowerCase();
  }
  return tagName;
};

/**
 * Returns the normalized type of the element.
 * @param {Element} node DOM element
 * @return {String} The normalized type of the element.
 */
utils.getTlType = function (node) {
  var elementType,
    key,
    tlType = "";

  // Sanity check
  if (utils.isUndefOrNull(node) || !node.type) {
    return tlType;
  }

  elementType = node.type.toLowerCase();
  key = elementType + ":";
  if (node.subType) {
    key += node.subType.toLowerCase();
  }

  tlType = tlTypes[key] || elementType;

  return tlType;
};

/**
 * Returns true if given node is element from a frame
 * @param {Element} node DOM element
 * @return {boolean} true if input element is element from a frame; false otherwise
 */
utils.isIFrameDescendant = function (node) {
  var nodeWindow = utils.getWindow(node);

  /*jshint eqeqeq:false, eqnull: false */
  /* The != operator below is on purpose due to legacy IE issues, where:
      window === top returns false, but window == top returns true */
  return (nodeWindow ? (nodeWindow != window) : false);
};

/**
 * Takes the orientation in degrees and returns the orientation mode as a
 * text string. 0, 180 and 360 correspond to portrait mode while 90, -90
 * and 270 correspond to landscape.
 * @function
 * @name core.utils.getOrientationMode
 * @param {number} orientation A normalized orientation value such as
 *          0, -90, 90, 180, 270, 360.
 * @return {string} "PORTRAIT" or "LANDSCAPE" for known orientation values.
 * "UNKNOWN" for unrecognized values. "INVALID" in case of error.
 */
utils.getOrientationMode = function (orientation) {
  var mode = "INVALID";

  if (typeof orientation !== "number") {
    return mode;
  }

  switch (orientation) {
    case 0:
    case 180:
    case 360:
      mode = "PORTRAIT";
      break;
    case 90:
    case -90:
    case 270:
      mode = "LANDSCAPE";
      break;
    default:
      mode = "UNKNOWN";
      break;
  }

  return mode;
};

/**
 * Get orientation in degrees.
 * @function
 * @name core.utils.getOrientationAngle
 * @return {number} An orientation value such as
 *          0, -90, 90, 180, 270, 360.
 */
utils.getOrientationAngle = function () {
  if (typeof window.orientation === "number") {
    return window.orientation;
  }

  var angle = (screen.orientation || {}).angle;
  if (typeof angle !== "number") {
    switch (screen.mozOrientation || screen.msOrientation) {
      case "landscape-primary":
      case "landscape-secondary":
        angle = 90;
        break;
      default:
        angle = 0;
        break;
    }
  }
  return angle;
};

utils.clog = (function (window) {
  return function () {
    // Do nothing!
  };
}(window));

/**
 * Trims any whitespace and returns the trimmed string.
 * @function
 * @name core.utils.trim
 * @param {string} str The string to be trimmed.
 * @return {string} The trimmed string.
 */
utils.trim = function (str) {
  // Sanity check.
  if (!str || !str.toString) {
    return str;
  }
  return str.toString().replace(/^\s+|\s+$/g, "");
};

/**
 * Trims any whitespace at the beginning of the string and returns the
 * trimmed string.
 * @function
 * @name core.utils.ltrim
 * @param {string} str The string to be trimmed.
 * @return {string} The trimmed string.
 */
utils.ltrim = function (str) {
  // Sanity check.
  if (!str || !str.toString) {
    return str;
  }
  return str.toString().replace(/^\s+/, "");
};

/**
 * Trims any whitespace at the end of the string and returns the
 * trimmed string.
 * @function
 * @name core.utils.rtrim
 * @param {string} str The string to be trimmed.
 * @return {string} The trimmed string.
 */
utils.rtrim = function (str) {
  // Sanity check.
  if (!str || !str.toString) {
    return str;
  }
  return str.toString().replace(/\s+$/, "");
};

/**
 * Sets the specified cookie.
 * @function
 * @param {string} cookieName The name of the cookie.
 * @param {string} cookieValue The value of the cookie.
 * @param {integer} [maxAge] The max age of the cookie in seconds. If none is specified, defaults to creating a session cookie.
 * @param {string} [path] The absolute path. If none is specified, defaults to "/"
 * @param {string} [domain] The domain on which to set the cookie. If none is specified, defaults to location.hostname
 * @param {Boolean} [secure] If the secure flag should be set for this cookie.
 * @param {String} [samesite] The samesite setting that should be set for this cookie. Default is "Strict"
 */
utils.setCookie = function (cookieName, cookieValue, maxAge, path, domain, secure, samesite) {
  var i,
    len,
    domainArray,
    expiry,
    maxAgeStr = "",
    pathStr,
    secureStr,
    samesiteStr;

  // Browsers require secure attribute be set when samesite is "None"
  if (samesite === "None") {
    secure = true;
  } else if (samesite !== "Lax") {
    // "Strict" is the default setting.
    samesite = "Strict";
  }
  samesiteStr = ";SameSite=" + samesite;

  secureStr = secure ? ";Secure" : "";

  // Sanity check
  if (!cookieName) {
    return;
  }

  // Cookie name and value cannot contain unescaped whitespace, comma, semi-colon etc.
  cookieName = encodeURIComponent(cookieName);
  cookieValue = encodeURIComponent(cookieValue);

  domainArray = (domain || location.hostname).split('.');
  pathStr = ";Path=" + (path || "/");
  if (typeof maxAge === "number") {
    if (this.isIE) {
      expiry = new Date();
      expiry.setTime(expiry.getTime() + (maxAge * 1000));
      // IE does not support max-age but instead uses Expires
      maxAgeStr = ";Expires=" + expiry.toUTCString();
    } else {
      maxAgeStr = ";Max-Age=" + maxAge;
    }
  }

  // Try to set the cookie with two domain components. e.g. "foo.com".
  // If not successful try with three domain components, e.g. "foo.co.uk" and so on.
  for (len = domainArray.length, i = (len === 1 ? 1 : 2); i <= len; i += 1) {
    document.cookie = cookieName + "=" + cookieValue + ";Domain=" + domainArray.slice(-i).join('.') + pathStr + maxAgeStr + secureStr + samesiteStr;
    if (this.getCookieValue(cookieName) === cookieValue) {
      break;
    }
    if (len === 1) {
      // Special case when trying to set cookie on single component domain fails.
      // Try to set the cookie without explicitly specifying the domain.
      document.cookie = cookieName + "=" + cookieValue + pathStr + maxAgeStr + secureStr + samesiteStr;
    }
  }
};

/**
 * Finds and returns the named cookie's value.
 * @function
 * @name core.utils.getCookieValue
 * @param {string} cookieName The name of the cookie.
 * @param {string} [cookieString] Optional cookie string in which to search for cookieName.
 * If none is specified, then document.cookie is used by default.
 * @return {string} The cookie value if a match is found or null.
 */
utils.getCookieValue = function (cookieName, cookieString) {
  var i,
    len,
    cookie,
    cookies,
    cookieValue = null,
    cookieNameLen;

  try {
    cookieString = cookieString || document.cookie;

    // Sanity check.
    if (!cookieName || !cookieName.toString) {
      return null;
    }

    // Append an '=' to the cookie name
    cookieName += "=";
    cookieNameLen = cookieName.length;

    // Get the individual cookies into an array and look for a match
    cookies = cookieString.split(';');
    for (i = 0, len = cookies.length; i < len; i += 1) {
      cookie = cookies[i];
      cookie = utils.ltrim(cookie);

      // Check if cookieName matches the current cookie prefix.
      if (cookie.indexOf(cookieName) === 0) {
        // Match found! Get the value (i.e. RHS of "=" sign)
        cookieValue = cookie.substring(cookieNameLen, cookie.length);
        break;
      }
    }
  } catch (e) {
    cookieValue = null;
  }

  return cookieValue;
};

/**
 * Finds and returns the query parameter's value.
 * @function
 * @name core.utils.getQueryStringValue
 * @param {string} paramName The name of the query parameter.
 * @param {string} [queryDelim] The query string delimiter. Either ";" or "&"
 * @param {string} [queryString] Optional query string in which to search for the query parameter.
 * If none is specified, then document.location.search is used by default.
 * @return {string} The query parameter value if a match is found or null.
 */
utils.getQueryStringValue = function (paramName, queryDelim, queryString) {
  var i,
    j,
    queryStringLen,
    paramValue = null,
    valueStartIndex;

  try {
    queryString = queryString || window.location.search;
    queryStringLen = queryString.length;

    // Sanity check.
    if (!paramName || !paramName.toString || !queryStringLen) {
      return null;
    }

    // Default delimiter is &
    queryDelim = queryDelim || "&";
    // Normalize for easy searching by replacing initial '?' with the delimiter
    queryString = queryDelim + queryString.substring(1);
    // Modify the parameter name to prefix the delimiter and append an '='
    paramName = queryDelim + paramName + "=";

    i = queryString.indexOf(paramName);
    if (i !== -1) {
      valueStartIndex = i + paramName.length;
      // Match found! Get the value (i.e. RHS of "=" sign upto the delim or end of string)
      j = queryString.indexOf(queryDelim, valueStartIndex);
      if (j === -1) {
        j = queryStringLen;
      }
      paramValue = decodeURIComponent(queryString.substring(valueStartIndex, j));
    }
  } catch (e) {
    // Do nothing!
  }

  return paramValue;
};

/**
 * Quick wrapper for addEventL:istener/attachEvent. Mainly to be used for core, before UIC is fully
 * initialized
 * @function
 * @name core.util.addEventListener
 */
utils.addEventListener = (function () {
    if (window.addEventListener) {
      return function (element, eventName, listener) {
        element.addEventListener(eventName, listener, false);
      };
    }
    return function (element, eventName, listener) {
      element.attachEvent("on" + eventName, listener);
    };
  }()),

  /**
   * Returns the index of the rule that is matched by the target object.
   * @function
   * @name core.utils.matchTarget
   * @param {Array} rules An array of match rules containing objects such as
   * {id, idType} or { { regex }, idType } or a string representing "CSS Selectors"
   * @param {Object} target  The normalized target object of the message.
   * @return {int} Returns the index of the matching rule. If none of the rules match then returns -1.
   */
  utils.matchTarget = function (rules, target) {
    var i,
      j,
      domElement,
      matchIndex = -1,
      qr,
      qrLen,
      qrTarget,
      len,
      rule,
      scope = document;

    // Sanity check
    if (!rules || !target) {
      return matchIndex;
    }

    // Check if services have been previouly cached
    if (!this.browserService || !this.browserBaseService) {
      this.browserService = TLT.getService("browser");
      this.browserBaseService = TLT.getService("browserBase");
    }

    if (target.idType === -2) {
      // Get the document scope of xpath ids since the elements could be inside a frame/iframe
      domElement = this.browserBaseService.getNodeFromID(target.id, target.idType);
      scope = this.getDocument(domElement);
    }

    for (i = 0, len = rules.length; i < len && matchIndex === -1; i += 1) {
      rule = rules[i];

      // Check if rule is a selector string.
      if (typeof rule === "string") {
        qr = this.browserService.queryAll(rule, scope);
        for (j = 0, qrLen = qr ? qr.length : 0; j < qrLen; j += 1) {
          if (qr[j]) {
            qrTarget = this.browserBaseService.ElementData.prototype.examineID(qr[j]);
            if (qrTarget.idType === target.idType && qrTarget.id === target.id) {
              matchIndex = i;
              break;
            }
          }
        }
      } else if (rule && rule.id && rule.idType && target.idType && target.idType.toString() === rule.idType.toString()) {
        // Note: idType provided by wizard is a string so convert both to strings before comparing.

        // An id in the rules list could be a direct match, in which case it will be a string OR
        // it could be a regular expression in which case it would be an object like this:
        // {regex: ".+private$", flags: "i"}
        switch (typeof rule.id) {
          case "string":
            if (rule.id === target.id) {
              matchIndex = i;
            }
            break;
          case "object":
            if (!rule.cRegex) {
              // Cache the RegExp object for future use.
              rule.cRegex = new RegExp(rule.id.regex, rule.id.flags);
            }
            // Reset and test
            rule.cRegex.lastIndex = 0;
            if (rule.cRegex.test(target.id)) {
              matchIndex = i;
            }
            break;
        }
      }
    }
    return matchIndex;
  };

/**
 * Basic WeakMap implementation - a map which can be indexed with objects.
 * In comparison to the original API 'delete' method has been replaced with 'remove'
 * due to compatibility with legacy IE
 * @constructor
 * @see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/WeakMap
 */
utils.WeakMap = (function () {
  function index(data, key) {
    var i,
      len;
    data = data || [];
    for (i = 0, len = data.length; i < len; i += 1) {
      if (data[i][0] === key) {
        return i;
      }
    }
    return -1;
  }
  return function () {
    var data = [];
    this.set = function (key, val) {
      var idx = index(data, key);
      data[idx > -1 ? idx : data.length] = [key, val];
    };
    this.get = function (key) {
      var arr = data[index(data, key)];
      return (arr ? arr[1] : undefined);
    };
    this.clear = function () {
      data = [];
    };
    this.has = function (key) {
      return (index(data, key) >= 0);
    };
    this.remove = function (key) {
      var idx = index(data, key);
      if (idx >= 0) {
        data.splice(idx, 1);
      }
    };
    this["delete"] = this.remove;
  };
});


function checkId(node, oldId) {
  var i,
      len,
      nodeId;

  // Sanity check
  if (!node) {
      return null;
  }

  if (typeof oldId !== "undefined") {
      // Check the oldId instead of the node's current id.
      nodeId = oldId;
  } else {
      nodeId = node.id;
  }

  if (!nodeId || typeof nodeId !== "string") {
      return null;
  }

  for (i = 0, len = blacklist.length; i < len; i += 1) {
      if (typeof blacklist[i] === "string") {
          if (nodeId === blacklist[i]) {
              return null;
          }
      } else if (typeof blacklist[i] === "object") {
          // Cache the RegExp object
          if (!blacklist[i].cRegex) {
              blacklist[i].cRegex = new RegExp(blacklist[i].regex, blacklist[i].flags);
          }
          // Reset and test
          blacklist[i].cRegex.lastIndex = 0;
          if (blacklist[i].cRegex.test(nodeId)) {
              return null;
          }
      }
  }
  return nodeId;
}

var blacklist = [];