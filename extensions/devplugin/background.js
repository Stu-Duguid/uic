// runs in background

/* global browser */

// listens for tealeaf posts and stores data from them in local storage

console.debug("adding listener for posts")
browser.webRequest.onBeforeSendHeaders.addListener(
	postListener,
	{urls: ["https://lib-ap-1.brilliantcollector.com/collector/collectorPost"]},
	["requestHeaders"]
);

function postListener(details) {
	console.debug("running postListener")
	const tabInfo = {};
	details.requestHeaders.forEach(header => {
		switch (header.name) {
			case "Content-Encoding":
				tabInfo.compression = header.value;
				break;
			case "Content-Length":
				tabInfo.contentLength = header.value;
				break;
			case "Host":
				tabInfo.host = header.value;
				break;
			case "X-Tealeaf":
				tabInfo.version = header.value;
				break;
			case "X-Tealeaf-MessageTypes":
				tabInfo.messages = header.value;
				break;
			case "X-Tealeaf-SaaS-AppKey":
				tabInfo.appKey = header.value;
				break;
			case "X-Tealeaf-SaaS-TLTSID":
				tabInfo.sessionId = header.value;
		}
	});
	if (tabInfo.version) {
		const store = {};
		store[details.tabId] = tabInfo;
		console.debug(store);
		browser.storage.local.set(store);
	}
}
 
// listens for tealeaf app details list and stores data in local storage

console.debug("adding listener for apps")
browser.webRequest.onBeforeRequest.addListener(
	appListener,
	{
		urls: [
			"https://tealeaf-ap-1.goacoustic.com/webapp/api/orgs/*/apps?*",
			"https://tealeaf-ap-1.goacoustic.com/webapp/api/orgs/timeZone?*"
		]
	},
	["blocking"]
);

function appListener(details) {
	console.debug("running appListener")
	let filter = browser.webRequest.filterResponseData(details.requestId);
	let decoder = new TextDecoder("utf-8");
	let encoder = new TextEncoder();

	let data = [];
	filter.ondata = (event) => {
		console.debug("apps ondata");

		data.push(event.data);
	};

	filter.onstop = (event) => {
		console.debug("apps onstop");
		let str = "";
		if (data.length === 1) {
			str = decoder.decode(data[0]);
		}
		else {
			for (let i = 0; i < data.length; i++) {
				let stream = (i == data.length - 1) ? false : true;
				str += decoder.decode(data[i], {stream});
			}
		}
		filter.write(encoder.encode(str));
		filter.close();
		
		console.debug("parsing apps " + details.url);
		const response = JSON.parse(str);
		if (response.appList !== undefined) {
			console.debug("found appList");
			const store = {};
			for (const n in response.appList) {
				const app = response.appList[n].app;
				const appInfo = {
					appName: app.appName,
					orgCode: app.orgCode,
					active: app.active,
					disabled: app.disabled
				}
				store[app.appKey] = appInfo;
			}
			console.debug(store);
			browser.storage.local.set(store);
		} else if (response.orgInfo !== undefined) {
			console.debug("found orgName");
			const store = {};
			store[response.orgInfo.orgCode] = { orgName: response.orgInfo.displayName }
			console.debug(store);
			browser.storage.local.set(store);
		}
	};
}
