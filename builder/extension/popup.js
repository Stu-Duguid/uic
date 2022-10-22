// tealeaf event builder
// popup script

// get current active tab
async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

// settings to reload

const settingsIcon = document.getElementById('settings');

settingsIcon.addEventListener('click', () => { })

const pagePanel = document.getElementById('pagePanel');
const pagePanelText = document.getElementById('pagePanelText');
const compPanel = document.getElementById('compPanel');
const compPanelText = document.getElementById('compPanelText');
const hostnameInput = document.getElementById('hostname');
const sitecodeInput = document.getElementById('sitecode');
const pagepathRow = document.getElementById('pagepathRow');
const pagecodeRow = document.getElementById('pagecodeRow');
const pagepathinput = document.getElementById('pagepath');
const pagecodeInput = document.getElementById('pagecode');

let hostname;
let pathname;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.hostname) {
        hostname = request.hostname;
        pathname = request.pathname;
        console.debug(`got msg ${request.hostname}${request.pathname}`)
    }
    if (request.eventtype) {
        console.debug(`got msg ${request.eventtype}:${request.id}`)
    }
});

// on load, check the storage and initialise
let configJSON = localStorage.getItem(hostname);
let config = (configJSON)? JSON.parse(configJSON) : { sitecode: '', pages:{} };

hostnameInput.innerText = hostname;

// disable fields and panels until sitecode set
if (config.sitecode === '') {
    pagePanel.open = true;
    pagepathRow.style.opacity = 0.4;
    pagecodeRow.style.opacity = 0.4;
    compPanel.style.opacity = 0.4;
} else {
    sitecodeInput.value = config.sitecode;
    pagePanelText.innerText = sitecodeInput.value + '/' + pagecodeInput.value;
}

// listen for changes in the sitecode to enable fields and panels and prevent a zero value

sitecodeInput.addEventListener('change', (e) => {
    if (sitecodeInput.value !== '') {
        pagepathRow.style.opacity = 1;
        pagecodeRow.style.opacity = 1;
        pagePanelText.innerText = sitecodeInput.value + '/' + pagecodeInput.value;
        config.sitecode = sitecodeInput.value;
        localStorage.setItem(hostname, JSON.stringify(config));
    } else {
        sitecodeInput.value = pagePanelText.innerText.split('/')[0];
        // pagepathRow.style.opacity = 0.4;
        // pagecodeRow.style.opacity = 0.4;
        // compPanel.style.opacity = 0.4;
    }
});

// check if page config exists and set fields

let untrackedPage = true;
let savedpath;

for (savedpath in config.pages) {
    if (pathname.match(savedpath.replaceAll('*', '.*'))) {
        untrackedPage = false;
        break;
    }
}
if (untrackedPage) {
    pagepathinput.value = pathname;
    compPanel.style.opacity = 0.4;
} else {
    pagepathinput.value = savedpath;
    pagecodeInput.value = config.pages[savedpath];
    pagePanelText.innerText = sitecodeInput.value + '/' + pagecodeInput.value;
    compPanel.style.opacity = 1;
}

pagecodeInput.addEventListener('change', (e) => {
    if (pagecodeInput.value !== '') {
        compPanel.style.opacity = 1;
        pagePanelText.innerText = sitecodeInput.value + '/' + pagecodeInput.value;
        config.pages[pagepathinput.value] = pagecodeInput.value;
        localStorage.setItem(hostname, JSON.stringify(config));
    } else {
        pagecodeInput.value = pagePanelText.innerText.split('/')[1];
        // compPanel.style.opacity = 0.4;
    }
});

const deleteSite = document.getElementById('deleteSite');
const deletePage = document.getElementById('deletePage');

deleteSite.addEventListener('click', () => {
    if (sitecodeInput.value !== '' && window.confirm("Do you really want to delete ALL config for this site and pages?")) {
        localStorage.removeItem(hostname);
        window.location.reload();
    }
})

deletePage.addEventListener('click', () => {
    if (pagecodeInput.value !== '' && window.confirm("Do you really want to delete ALL config for this page?")) {
        delete config.pages[pagepathinput.value];
        localStorage.setItem(hostname, JSON.stringify(config));
        pagecodeInput.value = '';
    }
})


// chrome.action.setBadgeText(
//     {
//       text: getTabBadge(tabId),
//       tabId: getTabId(),
//     },
//     () => { ... }
//   );
// chrome.action.setBadgeBackgroundColor(
//     {color: [0, 255, 0, 0]},  // Green
//     () => { /* ... */ },
//   );

// chrome.tabs.sendMessage(
//     tabId: number,
//     message: any,
//     options?: object,
//     callback?: function,
//   )

// chrome.tabs.onUpdated.addListener(
//     callback: function,
// )
// (tabId: number, changeInfo: object, tab: Tab) => void

// chrome.storage.local.set({key: value}, function() {
//     console.log('Value is set to ' + value);
//   });
  
//   chrome.storage.local.get(['key'], function(result) {
//     console.log('Value currently is ' + result.key);
//   });

// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
//       console.log(response.farewell);
//     });
// });
  
// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//       console.log(sender.tab ?
//                   "from a content script:" + sender.tab.url :
//                   "from the extension");
//       if (request.greeting === "hello")
//         sendResponse({farewell: "goodbye"});
//     }
// );
