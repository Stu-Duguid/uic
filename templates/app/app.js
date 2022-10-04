// on load, check the storage and initialise

let siteJSON = localStorage.getItem('site');
let site = siteJSON ? JSON.parse(siteJSON) : { sitename: '', sitecode: '', sitehost: '', sitedesc: '' };

const sitePanel = document.getElementById('sitePanel');
const pagePanel = document.getElementById('pagePanel');
const compPanel = document.getElementById('compPanel');

// Site panel

const sitePanelText = document.getElementById('sitePanelText');
sitePanelText.innerText = site.sitename;

const sitename = document.getElementById('sitename');
const sitecode = document.getElementById('sitecode');
const sitehost = document.getElementById('sitehost');
const sitedesc = document.getElementById('sitedesc');

sitename.value = site.sitename;
sitecode.value = site.sitecode;
sitehost.value = site.sitehost;
sitedesc.value = site.sitedesc;

sitePanel.addEventListener('change', (e) => {
    switch (e.target.id) {
        case 'sitecode':
            pagePanel.style.opacity = (e.target.value === '') ? 0.4 : 1;
        case 'sitename':
        case 'sitehost':
        case 'sitedesc':
            site[e.target.id] = e.target.value;
            sitePanelText.innerText = site.sitename;
            localStorage.setItem('site', JSON.stringify(site));
            break;
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