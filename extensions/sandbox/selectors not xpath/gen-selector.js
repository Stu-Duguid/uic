
// create CSS selector for node

function getNodeSelector (node) {
  if (!window.frequentBits) {
    var t0 = performance.now();
    window.frequentBits = generateFrequencies();
    var t1 = performance.now();
    console.log("generateFrequencies took " + (t1 - t0) + " milliseconds.");
  }
  t0 = performance.now();
  var s = makeSelector(node, "");
  t1 = performance.now();
  console.log("makeSelector took " + (t1 - t0) + " milliseconds.");
  return s;
}

function makeSelector (node, tail) {
  // if id, then return id+tail
  if (node.id) {
    return ('#'+node.id+tail);
  }

    // if unique tag name
  var tags = window.frequentBits.tags;
  var tagFreq = tags[node.tagName];
  if (tagFreq === 1) {
    // console.log('matched tag: '+node.tagName);
    return (node.tagName+tail);
  }
  
  // if unique attribute alone or with tag
  var attrs = window.frequentBits.attrs;
  var attrFreq, attrList, a, key, sel;
  for (attrList = node.attributes, i = 0; i < attrList.length; i++) {
    a = attrList.item(i);
    key = a.name+"="+a.value; // no quotes
    sel = "["+a.name+"='"+a.value+"']"; // quotes
    attrFreq = attrs[key];
    if (attrFreq === 1) {
      // console.log('matched attr: '+ap);
      return (sel+tail);
    } else {
      // check if unique tag[attr]
      if (attrFreq !== 0 && attrFreq < 10) { // not a bad attr or freq attr
        if (document.querySelectorAll(node.tagName+sel).length === 1) {
          console.log('matched tag[attr=val]: '+node.tagName+sel);
          return (node.tagName+sel+tail);
        }
      }
    }
  }
  
  // if a unique class alone or with tag or with attr
  var classes = window.frequentBits.classes;
  var classFreq, classList, className;
  for (classList = node.classList, i = 0; i < classList.length; i++) {
    className = classList.item(i);
    classFreq = classes[className];
    if (classFreq == 1) {
      // console.log('matched class: '+c.item(i));
      return ('.'+className+tail);
    } else if (classFreq !== 0 && classFreq < 10) {
      sel = node.tagName+'.'+className;
      if (document.querySelectorAll(sel).length === 1) { // if unique tag.class
        console.log('matched tag.class: '+sel);
        return (sel+tail);
      }
    } else {
      // if unique tag[attr=val].class
      for (attrList = node.attributes, i = 0; i < attrList.length; i++) {
        a = attrList.item(i);
        key = a.name+"="+a.value; // no quotes
        sel = node.tagName+"["+a.name+"='"+a.value+"']."+className; // quotes
        attrFreq = attrs[key];
        if (attrFreq !== 0 && attrFreq < 10) {
          if (document.querySelectorAll(sel).length === 1) {
            console.log('matched tag[attr=val].class: '+sel);
            return (sel+tail);
          }
        }
      }
    }
  };

  // if unique tag[attr].class
  
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
    // see if attr or class can be used instead of nth-child
    for (a = node.attributes, i = 0; i < a.length; i++) {
      av = a.item(i);
      ap = av.name+"="+av.value;
      if (parent.querySelectorAll('['+av.name+"='"+av.value+"'").length === 1) {
        console.log('matched attr for child: '+ap);
        return makeSelector(node.parentElement, " "+tag+"["+av.name+"='"+av.value+"']"+tail);
      }
    }

    return makeSelector(node.parentElement, " "+tag+"["+index+"]"+tail);
  }
  return makeSelector(node.parentElement, " "+tag+tail);
}

// supply whitelist of unique-ish class, tag, attr names

function generateFrequencies() {
  // make object saving tag freq with freq=0 meaning ignore this value

  var allNodes = document.body.querySelectorAll('*');
  var allTags = { 'SCRIPT':0, 'NOSCRIPT':0, 'STYLE':0, 'META':0, 'LINK':0, 'defs':0, 'path':0};
  var allAttrs = { 'id':0, 'value':0, 'autocomplete':0, 'autofocus':0, 'checked':0, 'style':0, 'class':0, 'tabindex':0, 'xlink:href':0, 'href':0, 'src':0, 'srcset':0, 'data-src':0, 'data-srcset':0 };
  // disabled, editable, height, width, maxlength, minlength, maxwidth, minwidth, span
  // aria- checked, disabled, grabbed, hidden
  var allClasses = {};
  
  allNodes.forEach(function (n) {
    var name, count;

    name = n.tagName;
    count = allTags[name];
    if (count !== 0) {
      allTags[name] = (count === undefined)? 1 : count + 1;
    };

    // make obj saving attr freq
    var attrList, a;
    for (var attrList = n.attributes, i = 0; i < attrList.length; i++) {
      a = attrList.item(i);
      name = a.name+"="+a.value;
      count = allAttrs[name];
      if (allAttrs[a.name] !== 0) {
        allAttrs[name] = (count === undefined)? 1 : count + 1;
      }
    }

    // make attr saving class freq
    n.classList.forEach(function(name) {
      count = allClasses[name];
      if (count !== 0) {
        allClasses[name] = (count === undefined)? 1 : count + 1;
      }
    });
  });

  console.log('tags: '+JSON.stringify(allTags));
  console.log('attributes: '+JSON.stringify(allAttrs));
  console.log('classes: '+JSON.stringify(allClasses));

  return { 'tags': allTags, 'attrs': allAttrs, 'classes': allClasses };
};
