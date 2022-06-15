
// Tealeaf Adobe Target data capture

console.log("Tealeaf Adobe Target data capture: start");

/* global adobe */
document.addEventListener(adobe.target.event.REQUEST_SUCCEEDED, function (e) {

  var tokens = e.detail.responseTokens;

	if (tokens && tokens.length & tokens.length > 0) {
		console.log("Tealeaf Adobe Target data capture: found tokens = ");
    tryPost(distinct(tokens));
  }
	else {
		console.log("Tealeaf Adobe Target data capture: no tokens");
	}

  // helper functions 

  function key(obj) {
    return Object.keys(obj)
      .map(function (k) {
        return k + "" + obj[k];
      })
      .join("");
  }

  function distinct(arr) {
    var result = arr.reduce(function (acc, e) {
      acc[key(e)] = e;
      return acc;
    }, {});
    return Object.keys(result)
      .map(function (k) {
        return result[k];
      });
  }

  function tryPost(tokens) {
    if (window.TLT && window.TLT.isInitialized()) {
			console.log("Tealeaf Adobe Target data capture: sending");
      tokens.forEach(function (token) {
        window.TLT.logCustomEvent("abTest", {
            description: "Adobe Target",
            experiment: token["activity.name"],
            variant: token["experience.name"]
          });
				console.log("Tealeaf Adobe Target data capture: token = "+token["activity.name"]+" --- "+token["experience.name"]);
      });
    }
    else {
			console.log("Tealeaf Adobe Target data capture: waiting");
      var waitMoreTimer = setTimeout(tryPost, 200, tokens);
    }
  }
});
