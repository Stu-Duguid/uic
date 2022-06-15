//log alerts
(function() {
	var old_alert = window.alert;
	window.alert = function(msg) {
		console.log("Alert - " + msg);
		TLT.logCustomEvent("Alert", msg);
		old_alert.apply(window, arguments);
	};
})();

//log confirms
(function() {
	var old_confirm = window.confirm;
	window.confirm = function(msg) {
		var result = old_confirm.call(window, msg);
		console.log("Confirm - " + msg);
		console.log("Result - " + (result ? 'yes' : 'no'));
		TLT.logCustomEvent("Confirm",
			{
				data : {
					msg : msg,
					result : (result ? 'yes' : 'no')
				}
			}
		);
		return result;
	};
})();