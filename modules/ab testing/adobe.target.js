
// Tealeaf Adobe Target data capture

// needs to be inserted in Launch between "Load Target" and "Fire Global Mbox"
// or if not using Launch add code in the "Library footer" section of at.js

/* global adobe */

// adobe.target.event.REQUEST_SUCCEEDED is constant defined by Target = 'at-request-succeeded'
document.addEventListener('at-request-succeeded',
  function (e) {
    if (e && e.detail && e.detail.responseTokens && e.detail.responseTokens.length) {
      tryPost(distinct(e.detail.responseTokens));
    }

    // helper: removes duplicate objects in array - better done with a Set but IE11
    function distinct(arr) {
      var result = arr.reduce(function (acc, e) { acc[key(e)] = e; return acc; }, {});
      return Object.keys(result).map(function (k) { return result[k]; });
    }
    // helper: generates a concatenated string of object values to use as key for comparison
    function key(obj) {
      return Object.keys(obj).map(function (k) { return k+""+obj[k]; }).join("");
    }

    // send to tealeaf when available
    function tryPost(tokens) {
      if (window.TLT && window.TLT.isInitialized()) {
        tokens.forEach(function (token) {
          window.TLT.logCustomEvent("abTest", {
            description: "Adobe Target",
            experiment: token["activity.name"],
            variant: token["experience.name"]
          });
        });
      }
      else {
        setTimeout(tryPost, 200, tokens);
      }
    }
  }
);
