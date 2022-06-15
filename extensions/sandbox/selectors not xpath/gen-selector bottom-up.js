// create CSS selector for node

function getNodeSelector (node) {
  var t0 = performance.now();
  var s = makeSelector(node, "");
  var t1 = performance.now();
  console.log("makeSelector took " + (t1 - t0) + " milliseconds.");
  return s;
}

function makeSelector (node, tail) {

  const ignoredTags = [ 'SCRIPT', 'NOSCRIPT', 'STYLE', 'META', 'LINK', 'defs', 'path' ];
  const ignoredAttrs = [ 'id', 'value', 'autocomplete', 'autofocus', 'checked', 'style', 'class', 'tabindex', 'xlink:href', 'href', 'src', 'srcset', 'data-src', 'data-srcset', 'disabled', 'editable', 'height', 'width', 'maxlength', 'minlength', 'maxwidth', 'minwidth', 'span', 'aria- checked', 'disabled', 'grabbed', 'hidden' ];
  // const ignoredClasses = [];

  
  // id
  if (node.id) {
    return ('#'+node.id+tail);
  }
  
  // tag
  var nodesWithTag;
  if (!ignoredTags.includes(node.tagName)) {
    nodesWithTag = document.getElementsByTagName(node.tagName);
    if (nodesWithTag.length === 1) {
      return (node.tagName+tail);
    }
  }

  function uniqueInTagNodes(attr, attrValue, className) {
    var i, count = 0;

    if (attr !== null && attrValue === null && className === null) {
      for (var i = 0; i < nodesWithTag.length; i++) {
        if (nodesWithTag.item(i).hasAttribute(attr)) { // looking for [attr]
          count++;
        }
      }
    } else if (attr !== null && attrValue !== null && className === null) {
      for (var i = 0; i < nodesWithTag.length; i++) {
        if (nodesWithTag.item(i).getAttribute(attr) === attrValue) { // looking for [attr=val]
          count++;
        }
      }
    } else if (attr === null && className !== null) {
      for (var i = 0; i < nodesWithTag.length; i++) {
        if (nodesWithTag.item(i).className.indexOf(className) !== -1) { // looking for .class
          count++;
        }
      }
    } else if (attr !== null && attrValue === null && className !== null) {
      for (var i = 0; i < nodesWithTag.length; i++) {
        if (nodesWithTag.item(i).hasAttribute(attr) && nodesWithTag.item(i).className.indexOf(className) !== -1) { // looking for [attr].class
          count++;
        }
      }
    } else if (attr !== null && attrValue !== null && className !== null) {
      for (var i = 0; i < nodesWithTag.length; i++)
      if (nodesWithTag.item(i).getAttribute(attr) === attrValue && nodesWithTag.item(i).className.indexOf(className) !== -1) // looking for [attr=val].class
          count++;
    }
    return (count === 1);
  }
  var attrList, a, sel;
  for (attrList = node.attributes, i = 0; i < attrList.length; i++) {
    a = attrList.item(i);
    if (!ignoredAttrs.includes(a.name)) {
      // [attr]
      sel = "["+a.name+"]";
      if (document.querySelectorAll(sel).length === 1) {
        return (sel+tail);
      }
      // [attr=val]
      sel = "["+a.name+"='"+a.value+"']";
      if (document.querySelectorAll(sel).length === 1) {
        return (sel+tail);
      }
      // tag[attr]
      sel = node.tagName+"["+a.name+"]";
      if (uniqueInTagNodes(a.name, null, null)) {
        return (sel+tail);
      }
      // tag[attr=val]
      sel = node.tagName+"["+a.name+"='"+a.value+"']";
      if (uniqueInTagNodes(a.name, a.value, null)) {
        return (sel+tail);
      }
    }
  }
  
  var classList, className;
  for (classList = node.classList, i = 0; i < classList.length; i++) {
    className = classList.item(i);
    // if a unique .class
    sel = '.'+className;
    if (document.querySelectorAll(sel).length === 1) {
      return (sel+tail);
    }
    // tag.class
    sel = node.tagName+'.'+className;
    if (uniqueInTagNodes(null, null, className)) {
      return (sel+tail);
    }
    for (attrList = node.attributes, i = 0; i < attrList.length; i++) {
      a = attrList.item(i);
      if (!ignoredAttrs.includes(a.name)) {
        // tag[attr].class
        sel = node.tagName+"["+a.name+"]."+className;
        if (uniqueInTagNodes(a.name, null, className)) {
          return (sel+tail);
        }
        // tag[attr=val].class
        sel = node.tagName+"["+a.name+"='"+a.value+"']."+className;
        if (uniqueInTagNodes(a.name, a.value, className)) {
          return (sel+tail);
        }
      }
    }
  };
  
  var parent = node.parentElement;
  var children = parent.children;
  var tag = node.tagName;
  var index = Array.prototype.indexOf.call(children, node);
  for (var i = index - 1; i >= 0; --i) {
    if (children[i].tagName !== tag) {
      index--;
    }
  }
  if (index > 0) {
    // see if attr ((not class)) can be used instead of nth-child
    for (var a, i = 0; i < node.attributes.length; i++) {
      a= node.attributes.item(i);
      if (!ignoredAttrs.includes(a.name)) {
        if (parent.querySelectorAll('['+a.name+"='"+a.value+"'").length === 1) {
          return makeSelector(node.parentElement, " "+tag+"["+a.name+"='"+a.value+"']"+tail);
        }
      }
    }

    return makeSelector(node.parentElement, " "+tag+":nth-of-type("+index+")"+tail);
  }
  return makeSelector(node.parentElement, " "+tag+tail);
}
