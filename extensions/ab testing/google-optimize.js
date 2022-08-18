
// google optimize tealeaf integration

if (window.google_optimize) {
	window.TLT.logGOptimize = function (val, name) {
		window.TLT.logCustomEvent("optimize", {description: "Optimize", experiment: name, variant: val});
	}
	(function () {window.dataLayer.push(arguments)}('event', 'optimize.callback', {callback: window.TLT.logGOptimize}));
}
