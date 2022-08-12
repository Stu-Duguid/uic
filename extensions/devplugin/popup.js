// included in popup page

/* global browser */

// look in storage for details of tealeaf then update popup ui
showTealeafStatus();

function showTealeafStatus() {
	const orgNameElem = document.querySelector('#orgName');
	const sessionIdElem = document.querySelector('#sessionId');
	const sessionIdCopyElem = document.querySelector('#sessionIdCopy');
	const appNameElem = document.querySelector('#appName');
	const versionElem = document.querySelector('#version');
	const messagesElem = document.querySelector('#messages');
	const contentLengthElem = document.querySelector('#contentLength');
	
	let tabId, postInfo, appInfo, orgInfo;
	const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
	
	browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
		tabId = tabs[0].id;

		browser.storage.local.get({[tabId.toString()]: {}}).then(tabVal => {
			postInfo = tabVal[tabId];
			console.debug('postInfo.appKey ' + postInfo.appKey);
			
			if (!postInfo.appKey) {
				const statusElem = document.querySelector('#status');
				const notFoundElem = document.querySelector('#notFound');
				statusElem.style.display = "none";
				notFoundElem.style.display = "block";
				return;
			}
			sessionIdCopyElem.onclick = function () {navigator.clipboard.writeText(postInfo.sessionId)};
			versionElem.textContent = postInfo.version;
			messagesElem.textContent = postInfo.messages;
			contentLengthElem.textContent = Math.floor(postInfo.contentLength) / 1000;
	
			browser.storage.local.get({[postInfo.appKey]: {}}).then(postVal => {
				appInfo = postVal[postInfo.appKey];
				console.debug('appInfo.orgCode ' + appInfo.orgCode);

				if (!appInfo.orgCode) {
					orgNameElem.textContent = "[Get org name by visiting app page]";
					orgNameElem.href = `https://tealeaf-ap-1.goacoustic.com/webapp/home#/admin/apps`;
					appNameElem.textContent = postInfo.appKey + " [Get app names by visiting app page]";
					appNameElem.href = `https://tealeaf-ap-1.goacoustic.com/webapp/home#/admin/apps`;
					sessionIdElem.href = "";
					sessionIdElem.textContent = "[Need org info to get replay]";
					return;
				}
				orgNameElem.href = `https://tealeaf-ap-1.goacoustic.com/webapp/home#/home?org=${appInfo.orgCode}`;
				appNameElem.textContent = appInfo.appName;
				appNameElem.href = `https://tealeaf-ap-1.goacoustic.com/webapp/home#/admin/${appInfo.orgCode}/apps`;
				sessionIdElem.href = `https://api-tealeaf.goacoustic.com/v1/replay?sid=${postInfo.sessionId}&sessionDate=${today}&orgKey=103${appInfo.orgCode}&redirect=true`;

				browser.storage.local.get({[appInfo.orgCode]: {}}).then(orgVal => {
					orgInfo = orgVal[appInfo.orgCode];
					console.debug('orgInfo.orgName ' + orgInfo.orgName);

					orgNameElem.innerHTML = (orgInfo.orgName) ? orgInfo.orgName : appInfo.orgCode + "<br>[Get org name]";
				}).catch(err => {console.error(err);});
			}).catch(err => {console.error(err);});
		}).catch(err => {console.error(err);});
	}).catch(err => {console.error(err);});

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
