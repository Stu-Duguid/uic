// included in popup page

/* global browser */

// look in storage for details of tealeaf then update popup ui
showTealeafStatus();

function showTealeafStatus() {
	let appKey, appInfo;
	// statusIcon
	// appKey
	browser.storage.local.get("appKey").then(val => {
		appKey = val.appKey;
		document.querySelector('#appKey').textContent = appKey;
		// orgName : appName
		browser.storage.local.get(appKey).then(val => {
			appInfo = val[appKey];
			const org = document.querySelector('#orgName');
			org.textContent = appInfo.orgCode;
			org.href = "https://tealeaf-ap-1.goacoustic.com/webapp/home#/home?org=" + appInfo.orgCode;
			document.querySelector('#appName').textContent = appInfo.appName;
		});
	});
	// sessionId
	browser.storage.local.get("sessionId").then(val => {
		const sessionId = document.querySelector('#sessionId');
		sessionId.textContent = val.sessionId;
		sessionId.href = "https://api-tealeaf.goacoustic.com/v1/replay?sid="+val.sessionId+"&sessionDate=2021-07-312&orgKey=103"+appInfo.orgCode+"&redirect=true";
	});
	// version
	browser.storage.local.get("version").then(val => {
		document.querySelector('#version').textContent = val.version;
	});
	// messages
	browser.storage.local.get("messages").then(val => {
		document.querySelector('#messages').textContent = val.messages;
	});
	// contentLength
	browser.storage.local.get("contentLength").then(val => {
		document.querySelector('#contentLength').textContent = Math.floor(val.contentLength)/1000;
	});

	// 	browser.browserAction.setIcon({path: "icons/" + icon});
}

function showAppkeys() {
	// store values

	// hide status and show found info
	const statusElem = document.querySelector('#status');
	const orgappsElem = document.querySelector('#orgapps');
	const foundOrgNameElem = document.querySelector('#foundOrgName');
	const foundOrgCodeElem = document.querySelector('#foundOrgCode');
	const foundNoneElem = document.querySelector('#foundNone');

	statusElem.style.display = "none";
	orgappsElem.style.display = null;
	foundOrgNameElem.textContent = 'found org name';
	foundOrgCodeElem.textContent = 'found org code';
	foundNoneElem.display = "none";
}

// var fullURL = browser.extension.getURL('popup/images/' + imgName + '.png');
// browser.tabs.sendMessage(tabs[0].id, {image: fullURL});
// browser.cookies.set({ url: tabs[0].url, name: "bgpicker", value: JSON.stringify(cookieVal)
