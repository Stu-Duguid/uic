const sitePanel = document.getElementById('sitePanel');
const pagePanel = document.getElementById('pagePanel');
const compPanel = document.getElementById('compPanel');

// Site panel

// on load, check the storage and initialise
let sitesJSON = localStorage.getItem('sites');
let sites = sitesJSON ? JSON.parse(sitesJSON) : {};
let currentsitecode = '';
let currenthostname = '';

const sitePanelText = document.getElementById('sitePanelText');
const sitecodeElem = document.getElementById('sitecode');
const sitehostElem = document.getElementById('sitehost');

// iterate through known site hosts/patterns looking for a match to the current page
for (const hostkey in sites) {
    if (hostkey === window.location.hostname || window.location.hostname.match(hostkey.replaceAll('*', '.*'))) {
        currentsitecode = sites[hostkey];
        currenthostname = hostkey;
        sitecodeElem.value = currentsitecode;
        sitehostElem.value = currenthostname;
        sitePanelText.innerText = currentsitecode;
        pagePanel.style.opacity = 1;
        break;
    }
}

sitePanel.addEventListener('change', (e) => {
    if (e.target.id === 'sitecode' || e.target.id === 'sitehost') {
        if (sitecodeElem.value !== '' && sitehostElem.value !== '') {
            
        }
        pagePanel.style.opacity = (e.target.value === '') ? 0.4 : 1;
        localStorage.setItem('site', JSON.stringify(site));
    }
});

// Page panel

let page = { pagename: '', pagecode: '', pagepath: '', pagedesc: '' };
pagePanel.style.opacity = (site.sitecode === '') ? 0.4 : 1;

const pagePanelText = document.getElementById('pagePanelText');
pagePanelText.innerText = page.pagename;

const pagename = document.getElementById('pagename');
const pagecode = document.getElementById('pagecode');
const pagepath = document.getElementById('pagepath');
const pagedesc = document.getElementById('pagedesc');

pagePanel.addEventListener('change', (e) => {
    switch (e.target.id) {
        case 'pagecode':
            compPanel.style.opacity = (e.target.value === '') ? 0.4 : 1;
        case 'pagename':
        case 'pagepath':
        case 'pagedesc':
            page[e.target.id] = e.target.value;
            pagePanelText.innerText = page.pagename;
            // localStorage.setItem('page', JSON.stringify(page));
            break;
    }
});

// Component panel

let comp = {};
compPanel.style.opacity = (page.pagecode === '') ? 0.4 : 1;

const compPanelText = document.getElementById('compPanelText');

// Frame

const showSiteButton = document.getElementById('showSiteButton');
const showPageButton = document.getElementById('showPageButton');
const showFrame = document.getElementById('showFrame');

showSiteButton.addEventListener('click', () => {
    window.open('http://'+site.sitehost, 'showframe', 'popup,left=600,top=400,width=800,height=600');
});