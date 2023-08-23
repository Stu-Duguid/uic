const fs = require('fs');

const buildNote = "2023.08.a";
const statusDimension = "Status of session";

const inputFilename = process.argv[2] || 'events.csv';
const outputFilename = process.argv[3] || inputFilename.replace(/csv$/, 'json');
const siteName = process.argv[3] || inputFilename.replace(/^(?:.*\/)([^\/]+)\.csv$/, '$1');

// read in the file with the required events
const data = fs.readFileSync(inputFilename, 'utf-8');

// to hold generated events
const events = [];

// initialise the templates
const loadEvent = {
  displayName: "Load - ",
  internalName: "E_LOAD_",
  capturePersonalData: false,
  active: true,
  tags: [],
  trigger: "EveryStep",
  publish: "Immediate",
  mode: "Basic",
  javascript: "// NOTE: Do not change event name\nfunction E_LOAD_() {}",
  conditionGroup: {
    conditionOperator: "And",
    distanceOperator: "GreaterThan",
    conditions: [
      {
        leftOperand: {
          displayName: "Step - ScreenView Type",
          internalName: "STEP_SCREENVIEW_TYPE",
          type: "StepAttribute"
        },
        leftOperandValueType: "Pattern",
        method: "firstValue()",
        conditionOperator: "Equal",
        rightOperandValue: "load",
        rightOperandValueType: "TextLiteral",
        caseSensitive: false
      },
      {
        leftOperand: {
          displayName: "Step - Screenview URL",
          internalName: "STEP_SCREENVIEW_URL",
          type: "StepAttribute"
        },
        leftOperandValueType: "Pattern",
        method: "firstValue()",
        conditionOperator: "",
        rightOperandValue: "",
        rightOperandValueType: "TextLiteral",
        caseSensitive: false
      },
      {
        leftOperand: {
          displayName: "Step - ScreenView Name",
          internalName: "STEP_SCREENVIEW_NAME",
          type: "StepAttribute"
        },
        leftOperandValueType: "Pattern",
        method: "firstValue()",
        conditionOperator: "",
        rightOperandValue: "",
        rightOperandValueType: "TextLiteral",
        caseSensitive: false
      }
    ],
    lowerBound: "0.0",
    upperBound: "0.0"
  },
  referenceValueType: "Custom",
  valueType: "Text",
  storeMetrics: "Count",
  track: "AllOccurrence",
  forSupportUserOnly: false,
  buildingBlockOnly: false,
  discardSession: false,
  geoAnalyticsEnabled: false,
  dimensionGroups: {}
};

const loadEventSession = {
  displayName: "Load -  in session",
  internalName: "E_LOAD__IN_SESSION",
  capturePersonalData: false,
  active: true,
  tags: [],
  trigger: "AtSessionEnd",
  publish: "SessionEnd",
  mode: "Basic",
  javascript: "// NOTE: Do not change event name\nfunction E_LOAD__IN_SESSION() {}",
  conditionGroup: {
    conditionOperator: "And",
    conditions: [
      {
        leftOperand: {
          displayName: "Load - ",
          internalName: "E_LOAD_",
          type: "Event"
        },
        leftOperandValueType: "Fact",
        method: "existsSession",
        conditionOperator: "IsTrue",
        rightOperandValue: "",
        rightOperandValueType: "TextLiteral",
        caseSensitive: false
      }
    ],
    lowerBound: "0.0",
    upperBound: "0.0"
  },
  referenceValueType: "Custom",
  valueType: "Text",
  storeMetrics: "Count",
  track: "FirstOccurrence",
  forSupportUserOnly: false,
  buildingBlockOnly: false,
  discardSession: false,
  geoAnalyticsEnabled: false,
  dimensionGroups: {
    // "Status of session": false
  }
};

loadEventSession.dimensionGroups[statusDimension] = false;

const clickEvent = {
  displayName: "Click - ",
  internalName: "E_CLICK_",
  capturePersonalData: false,
  active: true,
  tags: [],
  trigger: "EveryStep",
  publish: "Immediate",
  mode: "Basic",
  javascript: "// NOTE: Do not change event name\nfunction E_CLICK_() {}",
  conditionGroup: {
    conditionOperator: "And",
    distanceOperator: "GreaterThan",
    conditions: [
      {
        leftOperand: {
          displayName: "Step - Event Type",
          internalName: "STEP_EVENT_TYPE",
          type: "StepAttribute"
        },
        leftOperandValueType: "Pattern",
        method: "firstValue()",
        conditionOperator: "Equal",
        rightOperandValue: "click",
        rightOperandValueType: "TextLiteral",
        caseSensitive: false
      },
      {
        leftOperand: {
          displayName: "Step - Target ID",
          internalName: "STEP_TARGET_ID",
          type: "StepAttribute"
        },
        leftOperandValueType: "Pattern",
        method: "firstValue()",
        conditionOperator: "",
        rightOperandValue: "",
        rightOperandValueType: "TextLiteral",
        caseSensitive: false
      },
      {
        leftOperand: {
          displayName: "Step - Target Name",
          internalName: "STEP_TARGET_NAME",
          type: "StepAttribute"
        },
        leftOperandValueType: "Pattern",
        method: "firstValue()",
        conditionOperator: "",
        rightOperandValue: "",
        rightOperandValueType: "TextLiteral",
        caseSensitive: false
      },
      {
        leftOperand: {
          displayName: "Step - Target Attributes InnerText",
          internalName: "P_STEP_TARGET_ATTRIBUTES_INNERTEXT_666",
          type: "StepAttribute"
        },
        leftOperandValueType: "Pattern",
        method: "firstValue()",
        conditionOperator: "",
        rightOperandValue: "",
        rightOperandValueType: "TextLiteral",
        caseSensitive: false
      },
      {
        leftOperand: {
          displayName: "Web Path#Fragment",
          internalName: "E_WEB_PATH_FRAGMENT",
          type: "Event"
        },
        leftOperandValueType: "Fact",
        method: "Value",
        conditionOperator: "",
        rightOperandValue: "",
        rightOperandValueType: "TextLiteral",
        caseSensitive: false
      }
    ],
    lowerBound: "0.0",
    upperBound: "0.0"
  },
  referenceValueType: "Custom",
  valueType: "Text",
  storeMetrics: "Count",
  track: "AllOccurrence",
  forSupportUserOnly: false,
  buildingBlockOnly: false,
  discardSession: false,
  geoAnalyticsEnabled: false,
  dimensionGroups: {}
};

const clickEventSession = {
  displayName: "Click -  in session",
  internalName: "E_CLICK__IN_SESSION",
  capturePersonalData: false,
  active: true,
  tags: [],
  trigger: "AtSessionEnd",
  publish: "SessionEnd",
  mode: "Basic",
  javascript: "// NOTE: Do not change event name\nfunction E_CLICK__IN_SESSION() {}",
  conditionGroup: {
    conditionOperator: "And",
    conditions: [
      {
        leftOperand: {
          displayName: "Load - ",
          internalName: "E_LOAD_",
          type: "Event"
        },
        leftOperandValueType: "Fact",
        method: "existsSession",
        conditionOperator: "IsTrue",
        rightOperandValue: "",
        rightOperandValueType: "TextLiteral",
        caseSensitive: false
      }
    ],
    lowerBound: "0.0",
    upperBound: "0.0"
  },
  referenceValueType: "Custom",
  valueType: "Text",
  storeMetrics: "Count",
  track: "FirstOccurrence",
  forSupportUserOnly: false,
  buildingBlockOnly: false,
  discardSession: false,
  geoAnalyticsEnabled: false,
  dimensionGroups: {
    // "Status of session": false
  }
};

clickEventSession.dimensionGroups[statusDimension] = false;

const changeEvent = {
  displayName: "Change - ",
  internalName: "E_CHANGE_",
  capturePersonalData: false,
  active: true,
  tags: [],
  trigger: "EveryStep",
  publish: "Immediate",
  mode: "Basic",
  javascript: "// NOTE: Do not change event name\nfunction E_CHANGE_() {}",
  conditionGroup: {
    conditionOperator: "And",
    distanceOperator: "GreaterThan",
    conditions: [
      {
        leftOperand: {
          displayName: "Step - Event Type",
          internalName: "STEP_EVENT_TYPE",
          type: "StepAttribute"
        },
        leftOperandValueType: "Pattern",
        method: "firstValue()",
        conditionOperator: "Equal",
        rightOperandValue: "change",
        rightOperandValueType: "TextLiteral",
        caseSensitive: false
      },
      {
        leftOperand: {
          displayName: "Step - Target ID",
          internalName: "STEP_TARGET_ID",
          type: "StepAttribute"
        },
        leftOperandValueType: "Pattern",
        method: "firstValue()",
        conditionOperator: "Equal",
        rightOperandValue: "",
        rightOperandValueType: "TextLiteral",
        caseSensitive: false
      },
      {
        leftOperand: {
          displayName: "Step - Target Name",
          internalName: "STEP_TARGET_NAME",
          type: "StepAttribute"
        },
        leftOperandValueType: "Pattern",
        method: "firstValue()",
        conditionOperator: "Equal",
        rightOperandValue: "",
        rightOperandValueType: "TextLiteral",
        caseSensitive: false
      },
      {
        leftOperand: {
          displayName: "Web Path#Fragment",
          internalName: "E_WEB_PATH_FRAGMENT",
          type: "Event"
        },
        leftOperandValueType: "Fact",
        method: "Value",
        conditionOperator: "Equal",
        rightOperandValue: "",
        rightOperandValueType: "TextLiteral",
        caseSensitive: false
      }
    ],
    lowerBound: "0.0",
    upperBound: "0.0"
  },
  referenceValueType: "Custom",
  valueType: "Text",
  storeMetrics: "Count",
  track: "AllOccurrence",
  forSupportUserOnly: false,
  buildingBlockOnly: false,
  discardSession: false,
  geoAnalyticsEnabled: false,
  dimensionGroups: {}
};

const changeEventSession = {
  displayName: "Change - in session",
  internalName: "E_CHANGE__IN_SESSION",
  capturePersonalData: false,
  active: true,
  tags: [],
  trigger: "AtSessionEnd",
  publish: "SessionEnd",
  mode: "Basic",
  javascript: "// NOTE: Do not change event name\nfunction E_CHANGE__IN_SESSION() {}",
  conditionGroup: {
    conditionOperator: "And",
    conditions: [
      {
        leftOperand: {
          displayName: "Load - ",
          internalName: "E_LOAD_",
          type: "Event"
        },
        leftOperandValueType: "Fact",
        method: "existsSession",
        conditionOperator: "IsTrue",
        rightOperandValue: "",
        rightOperandValueType: "TextLiteral",
        caseSensitive: false
      }
    ],
    lowerBound: "0.0",
    upperBound: "0.0"
  },
  referenceValueType: "Custom",
  valueType: "Text",
  storeMetrics: "Count",
  track: "FirstOccurrence",
  forSupportUserOnly: false,
  buildingBlockOnly: false,
  discardSession: false,
  geoAnalyticsEnabled: false,
  dimensionGroups: {
    "Status of session": false
  }
};

changeEventSession.dimensionGroups[statusDimension] = false;

// loop through each line of the input
const lines = data.split('\n');
for (const lineNum in lines) {
  console.log('processing line: ', lines[lineNum])
  const values = lines[lineNum].split('|');
  if (values.length > 2) {
    const [type, label, path, frag, tagList, target, name, innertext] = values;
    const tags = (tagList === "")? []:tagList.split(':').map((x) => x+' ['+siteName+']');
    tags.push('['+siteName+']');
    let id = "", internalName = "";

    switch (type) {
      case 'type':
        // header line to show column names
        break;
      case 'load':
        id = (label)? label:path + frag;
        if (id === '/') id = 'Home';
        internalName = (id + '_' + siteName).toUpperCase().replace(/[^A-Z0-9_#]/g, '').replace(/#/, '_');

        loadEvent.displayName = "Load - " + id + " [" + siteName + "]";
        loadEvent.internalName = "E_LOAD_" + internalName;
        loadEvent.tags = tags;
        loadEvent.javascript = "// NOTE: Do not change event name\nfunction E_LOAD_" + internalName + "() {}";
        // screenview url
        if (path === '') {
          loadEvent.conditionGroup.conditions[1].method = 'patternFound()';
          loadEvent.conditionGroup.conditions[1].conditionOperator = 'IsTrue';
          loadEvent.conditionGroup.conditions[1].rightOperandValue = '';
        } else if (path[path.length-1] === '*') {
          loadEvent.conditionGroup.conditions[1].method = 'firstValue()';
          loadEvent.conditionGroup.conditions[1].conditionOperator = 'Includes';
          loadEvent.conditionGroup.conditions[1].rightOperandValue = path.replace(/\*/, '');
        } else {
          loadEvent.conditionGroup.conditions[1].method = 'firstValue()';
          loadEvent.conditionGroup.conditions[1].conditionOperator = 'Equal';
          loadEvent.conditionGroup.conditions[1].rightOperandValue = path;
        }
        // screenview name
        if (frag === '') {
          loadEvent.conditionGroup.conditions[2].method = 'patternFound()';
          loadEvent.conditionGroup.conditions[2].conditionOperator = 'IsTrue';
          loadEvent.conditionGroup.conditions[2].rightOperandValue = '';
        } else if (frag[frag.length-1] === '*') {
          loadEvent.conditionGroup.conditions[2].method = 'firstValue()';
          loadEvent.conditionGroup.conditions[2].conditionOperator = 'Includes';
          loadEvent.conditionGroup.conditions[2].rightOperandValue = frag.replace(/\*/, '');
        } else {
          loadEvent.conditionGroup.conditions[2].method = 'firstValue()';
          loadEvent.conditionGroup.conditions[2].conditionOperator = 'Equal';
          loadEvent.conditionGroup.conditions[2].rightOperandValue = frag;
        }
        events.push(JSON.parse(JSON.stringify(loadEvent)));

        loadEventSession.displayName = "Load - " + id + " in session [" + siteName + "]";
        loadEventSession.internalName = "E_LOAD_" + internalName + "_IN_SESSION";
        loadEventSession.tags = tags;
        loadEventSession.javascript = "// NOTE: Do not change event name\nfunction E_LOAD_" + internalName + "_IN_SESSION() {}";
        // event found in session
        loadEventSession.conditionGroup.conditions[0].leftOperand.displayName = loadEvent.displayName;
        loadEventSession.conditionGroup.conditions[0].leftOperand.internalName = loadEvent.internalName;
        events.push(JSON.parse(JSON.stringify(loadEventSession)));
        break;

      case 'click':
        id = (label)? label:(innertext)? innertext:(name)? name:target;
        internalName = (id + '_' + siteName).toUpperCase().replace(/[^A-Z0-9_#]/g, '').replace(/#/, '_');

        clickEvent.displayName = "Click - " + id + " [" + siteName + "]";
        clickEvent.internalName = "E_CLICK_" + internalName;
        clickEvent.tags = tags;
        clickEvent.javascript = "// NOTE: Do not change event name\nfunction E_CLICK_" + internalName + "() {}";
        // step target id
        if (target === "") {
          clickEvent.conditionGroup.conditions[1].conditionOperator = 'NotEqual';
          clickEvent.conditionGroup.conditions[1].rightOperandValue = '[not used]';
        } else if (target[target.length-1] === '*') {
          clickEvent.conditionGroup.conditions[1].conditionOperator = 'Includes';
          clickEvent.conditionGroup.conditions[1].rightOperandValue = target.replace(/\*/, '');
        } else {
          clickEvent.conditionGroup.conditions[1].conditionOperator = 'Equal';
          clickEvent.conditionGroup.conditions[1].rightOperandValue = target;
        }
        // step target name
        if (name === "") {
          clickEvent.conditionGroup.conditions[2].conditionOperator = 'NotEqual';
          clickEvent.conditionGroup.conditions[2].rightOperandValue = '[not used]';
        } else if (name[name.length-1] === '*') {
          clickEvent.conditionGroup.conditions[2].conditionOperator = 'Includes';
          clickEvent.conditionGroup.conditions[2].rightOperandValue = name.replace(/\*/, '');
        } else {
          clickEvent.conditionGroup.conditions[2].conditionOperator = 'Equal';
          clickEvent.conditionGroup.conditions[2].rightOperandValue = name;
        }
        // step target current innertext
        if (innertext === "") {
          clickEvent.conditionGroup.conditions[3].conditionOperator = 'NotEqual';
          clickEvent.conditionGroup.conditions[3].rightOperandValue = '[not used]';
        } else if (innertext[innertext.length-1] === '*') {
          clickEvent.conditionGroup.conditions[3].conditionOperator = 'Includes';
          clickEvent.conditionGroup.conditions[3].rightOperandValue = innertext.replace(/\*/, '');
        } else {
          clickEvent.conditionGroup.conditions[3].conditionOperator = 'Equal';
          clickEvent.conditionGroup.conditions[3].rightOperandValue = innertext;
        }
        // web path#frag
        if (path === '' && frag === '') {
          clickEvent.conditionGroup.conditions[4].conditionOperator = 'NotEqual';
          clickEvent.conditionGroup.conditions[4].rightOperandValue = '[not used]';
        } else if (path === '' || path[path.length-1] === '*' || frag[frag.length-1] === '*') {
          clickEvent.conditionGroup.conditions[4].conditionOperator = 'Includes';
          clickEvent.conditionGroup.conditions[4].rightOperandValue = (path + frag).replace(/\*/, '');
        } else {
          clickEvent.conditionGroup.conditions[4].conditionOperator = 'Equal';
          clickEvent.conditionGroup.conditions[4].rightOperandValue = path + frag;
        }
        // dims
        if (path === '' && frag === '' || path.indexOf('*') !== -1 || frag.indexOf('*') !== -1) clickEvent.dimensionGroups["Navigation context"] = false;
        events.push(JSON.parse(JSON.stringify(clickEvent)));

        clickEventSession.displayName = "Click - " + id + " in session [" + siteName + "]";
        clickEventSession.internalName = "E_CLICK_" + internalName + "_IN_SESSION";
        clickEventSession.tags = tags;
        clickEventSession.javascript = "// NOTE: Do not change event name\nfunction E_CLICK_" + internalName + "_IN_SESSION() {}";
        // event found in session
        clickEventSession.conditionGroup.conditions[0].leftOperand.displayName = clickEvent.displayName;
        clickEventSession.conditionGroup.conditions[0].leftOperand.internalName = clickEvent.internalName;
        events.push(JSON.parse(JSON.stringify(clickEventSession)));
        break;
      case 'change':
        id = (label)? label:(innertext)? innertext:(name)? name:target;
        internalName = (id + '_' + siteName).toUpperCase().replace(/[^A-Z0-9_#]/g, '').replace(/#/, '_');

        changeEvent.displayName = "Change - " + id + " [" + siteName + "]";
        changeEvent.internalName = "E_CHANGE_" + internalName;
        changeEvent.tags = tags;
        changeEvent.javascript = "// NOTE: Do not change event name\nfunction E_CHANGE_" + internalName + "() {}";
        // step target id
        if (target === "") {
          changeEvent.conditionGroup.conditions[1].conditionOperator = 'NotEqual';
          changeEvent.conditionGroup.conditions[1].rightOperandValue = '[not used]';
        } else if (target[target.length-1] === '*') {
          changeEvent.conditionGroup.conditions[1].conditionOperator = 'Includes';
          changeEvent.conditionGroup.conditions[1].rightOperandValue = target.replace(/\*/, '');
        } else {
          changeEvent.conditionGroup.conditions[1].conditionOperator = 'Equal';
          changeEvent.conditionGroup.conditions[1].rightOperandValue = target;
        }
        // step target name
        if (name === "") {
          changeEvent.conditionGroup.conditions[2].conditionOperator = 'NotEqual';
          changeEvent.conditionGroup.conditions[2].rightOperandValue = '[not used]';
        } else if (name[name.length-1] === '*') {
          changeEvent.conditionGroup.conditions[2].conditionOperator = 'Includes';
          changeEvent.conditionGroup.conditions[2].rightOperandValue = name.replace(/\*/, '');
        } else {
          changeEvent.conditionGroup.conditions[2].conditionOperator = 'Equal';
          changeEvent.conditionGroup.conditions[2].rightOperandValue = name;
        }
        // web path#frag
        if (path === '' && frag === '') {
          changeEvent.conditionGroup.conditions[3].conditionOperator = 'NotEqual';
          changeEvent.conditionGroup.conditions[3].rightOperandValue = '[not used]';
        } else if (path === '' || path[path.length-1] === '*' || frag[frag.length-1] === '*') {
          changeEvent.conditionGroup.conditions[3].conditionOperator = 'Includes';
          changeEvent.conditionGroup.conditions[3].rightOperandValue = (path + frag).replace(/\*/, '');
        } else {
          changeEvent.conditionGroup.conditions[3].conditionOperator = 'Equal';
          changeEvent.conditionGroup.conditions[3].rightOperandValue = path + frag;
        }
        // dims
        if (path === '' && frag === '' || path.indexOf('*') !== -1 || frag.indexOf('*') !== -1) clickEvent.dimensionGroups["Navigation context"] = false;
        events.push(JSON.parse(JSON.stringify(changeEvent)));

        changeEventSession.displayName = "Change - " + id + " in session [" + siteName + "]";
        changeEventSession.internalName = "E_CHANGE_" + internalName + "_IN_SESSION";
        changeEventSession.tags = tags;
        changeEventSession.javascript = "// NOTE: Do not change event name\nfunction E_CHANGE_" + internalName + "_IN_SESSION() {}";
        // event found in session
        changeEventSession.conditionGroup.conditions[0].leftOperand.displayName = changeEvent.displayName;
        changeEventSession.conditionGroup.conditions[0].leftOperand.internalName = changeEvent.internalName;
        events.push(JSON.parse(JSON.stringify(changeEventSession)));
        break;
      case 'text':
        // tbd
        break;
    }
  }
}

// add output footer
const output = {
  events: events,
  dimensions : [ ],
  dimensionGroups : [ ],
  sessionAttributes : [ ],
  hitAttributes : [ ],
  stepAttributes : [ ]
};

fs.writeFileSync(outputFilename, JSON.stringify(output));

// end
