/* global TLT:writable */

TLT.addModule("hiddenStyles", function (context) {
  "use strict";

  const HiddenStylesMarker = "tealeaf-styles";
  const InsertedStylesBegin = "/* tealeaf-styles-begin";
  const InsertedStylesEnd = "tealeaf-styles-end */";
  var hiddenStylesIndex = 0;
  
  function getDestfromSourceTag(source) {
    var dest, id;

    // get id from node to find matching style tag
    // create if not found - using incremented counter to be unique
    if (source.hasAttribute(HiddenStylesMarker)) {
      id = source.getAttribute(HiddenStylesMarker);
    } else {
      id = HiddenStylesMarker+'-'+hiddenStylesIndex;
      hiddenStylesIndex++;
      source.setAttribute(HiddenStylesMarker, id);
    }
    // check for destination style tag by id
    dest = document.getElementById(id);
    // also check (nested) shadow dom for fixed elements only at this stage 
    //
    // ToDo: make generic by going through all known shadow DOM and if not found look for more and add to known list
    //
    // if (!dest) {
    //   var dcoApp = document.querySelector("[x-app-id]");
    //   if (dcoApp) {
    //     dest = dcoApp.shadowRoot.getElementById(id);
    //     if (!dest) {
    //       var digformsApp = dcoApp.querySelector("[x-app-id]");
    //       if (digformsApp) {
    //         dest = digformsApp.shadowRoot.getElementById(id);
    //       }
    //     }
    //   }
    // }
    // if not found then create style tag with linked id
    if (!dest) {
      dest = document.createElement('style');
      dest.id = id;
      // start with comment to keep text out of parsing engine and not cause reflow
      appendRuleToTag(dest, InsertedStylesBegin);
      // add matching closing comment
      appendRuleToTag(dest, InsertedStylesEnd);
      // put copied rules in style tag just after source tag and linked by id reference
      source.insertAdjacentElement('afterend', dest);
    }
    return dest;
  }

  function appendRuleToTag(dest, rule) {
    dest.appendChild(document.createTextNode(rule+"\n"));
  }

  function insertRuleInTag(dest, rule, index) {
    // min dest.length = 2 for opening and closing comments
    // 0 => 1; 1 => 2; null => error
    if (index == null) {
      index = dest.childNodes.length-1;
    } else {
      index++;
    }
    dest.insertBefore(document.createTextNode(rule+"\n"), dest.childNodes[index]);
  }

  function deleteRuleInTag(dest, index) {
    // min dest.length = 2 for opening and closing comments
    // 0 => 1; 1 => 2; null => error
    if (index == null) {
      return;
    }
    index++;
    if (dest.childNodes.length > index) {
      dest.removeChild(dest.childNodes[index]);
    }
  }

  function copyExistingRules(source) {
    // get/create copied rules destination style tag
    var dest = getDestfromSourceTag(source);
    // loop through rules and copy to destination
    var rules = source.sheet.cssRules;
    for (var r = 0; r < rules.length; r++) {
      insertRuleInTag(dest, rules[r].cssText, null);
    }
  }

  function insertRuleProxy(rule, index) {
    // proxied action
    var newIndex = this.insertRuleOriginal(rule, index);
    // console.debug("proxy: insertRule: type=["+this.cssRules[newIndex].type+"] index=["+index+"], "+rule);
    // get dest
    var dest = getDestfromSourceTag(this.ownerNode);
    // insertRuleInTag(dest, rule, index);
    insertRuleInTag(dest, this.cssRules[newIndex].cssText, index);
  }

  function deleteRuleProxy(index) {
    // proxied action
    this.deleteRuleOriginal(index);
    // console.debug("proxy: deleteRule: ["+index+"]");
    // get dest
    var dest = getDestfromSourceTag(this.ownerNode);
    deleteRuleInTag(dest, index);
  }

  // ---------------------------------------------------

  return {
    init: function () {
      // get all elements that have hidden styles
      for (var s = 0; s < document.styleSheets.length; s++) {
        var sheet = document.styleSheets[s];
        // test if hidden cssom rules
        if (sheet.href === null && sheet.ownerNode.innerText == "" && sheet.cssRules.length > 0)
        {
          // create copies
          copyExistingRules(sheet.ownerNode);
        }
      }
      // backup original methods to alter rules
      CSSStyleSheet.prototype.insertRuleOriginal = CSSStyleSheet.prototype.insertRule;
      CSSStyleSheet.prototype.deleteRuleOriginal = CSSStyleSheet.prototype.deleteRule;
      // insert proxies
      CSSStyleSheet.prototype.insertRule = insertRuleProxy;
      CSSStyleSheet.prototype.deleteRule = deleteRuleProxy;
    },
    destroy: function () {
      // remove proxies and restore originals
      if ('insertRuleOriginal' in CSSStyleSheet.prototype) {
        CSSStyleSheet.prototype.insertRule = CSSStyleSheet.prototype.insertRuleOriginal;
      }
      if ('deleteRuleOriginal' in CSSStyleSheet.prototype) {
        CSSStyleSheet.prototype.deleteRule = CSSStyleSheet.prototype.deleteRuleOriginal;
      }
      // remove inserted rule text (static list)
      var styleNodes = document.querySelectorAll('[style^='+HiddenStylesMarker+'-]');
      for (var i = 0; i < styleNodes.length; i++) {
        styleNodes[i].parentNode.removeChild(styleNodes[i]);
      }  
    },
    onevent: function (event) {
        // Sanity check
        if (typeof event !== "object" || !event.type) {
            return;
        }
        switch (event.type) {
          case "load":
          case "screenview_load":
          case "click":
          case "change":
          case "unload":
            break;
          default:
            break;
        }
    },
    onmessage: function (msg) {}
  };
}); // End of TLT.addModule

// config.core.modules
//
// hiddenStyles: {
//   enabled: true
// }