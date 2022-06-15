
// google optimize tealeaf integration

function gtagtl() {window.dataLayer.push(arguments)}

if (window.google_optimize) {
	console.debug("optimize: found");
	gtagtl('event', 'optimize.callback', {callback: optimizeLogTL});
} else {
	console.debug("optimize: not found");
}

//put this in global scope
function optimizeLogTL(val, name) {
  console.debug("optimize: ["+name+", "+val+"]");
  window.TLT.logCustomEvent("optimize", { description: "Optimize", experiment: name, variant: val });
}