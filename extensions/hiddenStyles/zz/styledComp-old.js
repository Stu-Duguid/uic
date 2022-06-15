// original done for optus

// add in callback

// check if dom capture
if (msgObj.type == 12) {
	var t, ruleList, rule, ruleText = "";
	var tags = document.querySelectorAll("style[data-styled=active]");
	for (t = 0; t < tags.length; t++) {
		ruleList = tags[t].sheet.cssRules;
		for (rule = 0; rule < ruleList.length; rule++) {
			ruleText += ruleList[rule].cssText + "\n";
		}
	}
	var regex = /<style data-styled="active" data-styled-version=".*?"><\/style>/i;
	if (msgObj.domCapture) {
		var newRoot;
		if (msgObj.domCapture.root) {
			newRoot = msgObj.domCapture.root.replace(regex,
				"<style data-styled=\"active\" data-styled-version=\"replaced\">" + ruleText + "</style>\n");
			msgObj.domCapture.root = newRoot;
		} else if (msgObj.domCapture.diffs) {
			var d;
			for (d = 0; d < msgObj.domCapture.diffs.length; d++) {
				if (msgObj.domCapture.diffs[d].root) {
					newRoot = msgObj.domCapture.diffs[d].root.replace(regex,
						"<style data-styled=\"active\" data-styled-version=\"replaced\">" + ruleText + "</style>\n");
					msgObj.domCapture.diffs[d].root = newRoot;
				}
			}
		}
	}
}
