// ==UserScript==
// @name         salesforce tech tasks
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  autofill tech tasks.
// @author       You
//
// @match        https://acoustic.lightning.force.com/lightning/*
//
// @noframes
// @grant        none
//
// ==/UserScript==

/* eslint parserOptions: [ecmaVersion: 8] */

(function() {
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async function run() {
    var menu, tab, fields;

    // click on "tech task" tab
    tab = document.querySelector('a[data-tab-name="Opportunity.Tech_Task"]');
    //if (tab === null) { console.log("tt: no tab"); return;}
    tab.dispatchEvent(new MouseEvent('click'));
    
    await sleep(1000);

    // get all fields
    fields = document.querySelectorAll(".slds-is-editing a.select");
    if (fields.length === 0) { console.log("tt: no fields"); return;}
    
    // click on "Status" drop down
    // fields[0].dispatchEvent(new MouseEvent('click'));
    // await sleep(2000);
    // click on "Status" menu "Completed"
    menu = document.querySelectorAll("li.uiMenuItem a");
    if (menu.length === 0) { console.log("tt: no menu items"); return;}
    menu[3].dispatchEvent(new MouseEvent('click'));
    await sleep(2000);
    menu[6].dispatchEvent(new MouseEvent('click'));
    await sleep(2000);
    menu[22].dispatchEvent(new MouseEvent('click'));
    await sleep(2000);
    menu[30].dispatchEvent(new MouseEvent('click'));
    await sleep(2000);
    menu[33].dispatchEvent(new MouseEvent('click'));
    await sleep(2000);
    menu[37].dispatchEvent(new MouseEvent('click'));
    // await sleep(2000);

    // click on "Priority" drop down
    // fields[1].dispatchEvent(new MouseEvent('click'));
    // await sleep(2000);
    // click on "Priority" menu "Normal"
    // menu = document.querySelectorAll("li.uiMenuItem a");
    // if (menu.length === 0) { console.log("tt: no menu items"); return;}
    // menu[1].dispatchEvent(new MouseEvent('click'));
  };
  run();
}());