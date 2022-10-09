
(function () {
	function withinScrollableElem(el) {
			if (!el || el === document) { return false; }
			while (true) {
					el = el.parentNode;
					if (el === document) { return false; }
					if (el.scrollHeight > el.clientHeight && window.getComputedStyle(el).overflowY.indexOf('hidden') === -1) {
							return true;
					}
			}
	};
	var id = document.getElementById('tealeaf_hl_id').textContent,
		idType = document.getElementById('tealeaf_hl_idtype').textContent;
	if (id && idType) {
		var currentNode = TeaLeaf_Client_tlGetNodeFromXPath_v2(id, idType);
		if (currentNode && withinScrollableElem(currentNode)) {
			currentNode.scrollIntoView({ block: 'nearest' });
			var circle = document.getElementById('tealCircle');
			var newHeight = window.visualViewport.height - 50; // hard-coded offset from the bottom
			circle.style.top = newHeight + 'px';
		}
	}
})();
		
// put all on one line
(function () { function withinScrollableElem(el) { if (!el || el === document) { return false; } while (true) { el = el.parentNode; if (el === document) { return false; } if (el.scrollHeight > el.clientHeight && window.getComputedStyle(el).overflowY.indexOf('hidden') === -1) { return true; } } }; var id = document.getElementById('tealeaf_hl_id').textContent, idType = document.getElementById('tealeaf_hl_idtype').textContent; if (id && idType) { var currentNode = TeaLeaf_Client_tlGetNodeFromXPath_v2(id, idType); if (currentNode && withinScrollableElem(currentNode)) { currentNode.scrollIntoView({ block: 'nearest' }); var circle = document.getElementById('tealCircle'); var newHeight = window.visualViewport.height - 50; circle.style.top = newHeight + 'px'; } } })();
