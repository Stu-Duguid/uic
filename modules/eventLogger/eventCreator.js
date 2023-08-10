const fs = require('fs');

const tag = 'tag';
const inputFilename = 'events.csv';
const outputFilename = 'events.json';

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
  tags: [""],
  trigger: "EveryStep",
  publish: "Immediate",
  mode: "Basic",
  javascript: "// NOTE: Do not change event name\\nfunction E_LOAD_() {}",
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
          internalName: "P_STEP_SCREENVIEW_URL_1595831779522",
          type: "StepAttribute"
        },
        leftOperandValueType: "Pattern",
        method: "firstValue()", //patternFound() ----------------------------
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
    lowerBound: 0.0,
    upperBound: 0.0
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
  tags: [""],
  trigger: "AtSessionEnd",
  publish: "SessionEnd",
  mode: "Basic",
  javascript: "// NOTE: Do not change event name\\nfunction E_LOAD__IN_SESSION() {}",
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
    lowerBound: 0.0,
    upperBound: 0.0
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
    Status: false
  }
};

const clickEvent = {
  displayName: "Click - ",
  internalName: "E_CLICK_",
  capturePersonalData: false,
  active: true,
  tags: [""],
  trigger: "EveryStep",
  publish: "Immediate",
  mode: "Basic",
  javascript: "// NOTE: Do not change event name\\nfunction E_CLICK_() {}",
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
          displayName: "Step - Target Current InnerText",
          internalName: "P_STEP_TARGET_CURRENT_INNERTEXT_666",
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
    lowerBound: 0.0,
    upperBound: 0.0
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
  tags: [""],
  trigger: "AtSessionEnd",
  publish: "SessionEnd",
  mode: "Basic",
  javascript: "// NOTE: Do not change event name\\nfunction E_CLICK__IN_SESSION() {}",
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
    lowerBound: 0.0,
    upperBound: 0.0
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
    Status: false
  }
};

const changeEvent = {
  displayName: "Change - ",
  internalName: "E_CHANGE_",
  capturePersonalData: false,
  active: true,
  tags: ["recorded"],
  trigger: "EveryStep",
  publish: "Immediate",
  mode: "Basic",
  javascript: "// NOTE: Do not change event name\\nfunction E_CHANGE_() {}",
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
          displayName: "Step - Target Current InnerText",
          internalName: "P_STEP_TARGET_CURRENT_INNERTEXT_666",
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
    lowerBound: 0.0,
    upperBound: 0.0
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
  tags: ["recorded"],
  trigger: "AtSessionEnd",
  publish: "SessionEnd",
  mode: "Basic",
  javascript: "// NOTE: Do not change event name\\nfunction E_CHANGE__IN_SESSION() {}",
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
    lowerBound: 0.0,
    upperBound: 0.0
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
    Status: false
  }
};

// loop through each line of the input
const lines = data.split('\n');
for (const lineNum in lines) {
  console.log('processing line: ', lines[lineNum])
  const values = lines[lineNum].split('|');
  if (values.length > 2) {
    const type = values[0];
    const path = values[1];
    const frag = values[2];
    const tags = values[3].split(':');
    const target = values[4];
    const name = values[5];
    const innertext = values[6];
    // write out, appending to output
    var addedComma = (lineNum < lines.length - 1) ? ',' : '';
    let id = "", internalName = "";
    let event = {}, sessionEvent = {};

    switch (type) {
      case 'load':
        id = path+frag;
        if (id === '/') id = "Home";
        internalName = id.toUpperCase().replace(/(\*|\/)/g, '').replace(/\#/, '_');

        loadEvent.displayName = "Load - " + id;
        loadEvent.internalName = "E_LOAD_" + internalName;
        loadEvent.tags = tags;
        loadEvent.javascript = "// NOTE: Do not change event name\\nfunction E_LOAD_" + internalName + "() {}";
        loadEvent.conditionGroup.conditions[1].conditions.conditionOperator = (path === '')? 'IsTrue':(path[path.length-1] === '*')? 'Includes':'Equal';
        loadEvent.conditionGroup.conditions[1].conditions.rightOperandValue = path.replace(/\*/, '');
        loadEvent.conditionGroup.conditions[2].conditions.conditionOperator = (frag === '')? 'IsTrue':(frag[frag.length-1] === '*')? 'Includes':'Equal';
        loadEvent.conditionGroup.conditions[2].conditions.rightOperandValue = frag.replace(/\*/, '');
        events.push(JSON.parse(JSON.stringify(loadEvent)));

        loadEventSession.displayName = "Load - " + id + " in session";
        loadEventSession.internalName = "E_LOAD_" + internalName + "_IN_SESSION";
        loadEventSession.tags = tags;
        loadEventSession.javascript = "// NOTE: Do not change event name\\nfunction E_LOAD_" + internalName + "_IN_SESSION() {}";
        loadEventSession.conditionGroup.conditions[0].leftOperand.displayName = loadEvent.displayName;
        loadEventSession.conditionGroup.conditions[0].leftOperand.internalName = loadEvent.internalName;
        events.push(JSON.parse(JSON.stringify(loadEventSession)));
        break;

      case 'click':
        id = (innertext)? innertext:(name)? name:target;
        internalName = id.toUpperCase().replace(/(\s|'|"|\*|\/)/g, '');

        clickEvent.displayName = "Click - " + id;
        clickEvent.internalName = "E_CLICK_" + internalName;
        clickEvent.tags = tags;
        clickEvent.javascript = "// NOTE: Do not change event name\\nfunction E_CLICK_" + internalName + "() {}";
        clickEvent.conditionGroup.conditions[1].conditionOperator = (target === '')? 'IsTrue':(target[target.length-1] === '*')? 'Includes':'Equal';
        clickEvent.conditionGroup.conditions[1].rightOperandValue = target.replace(/\*/, '');
        clickEvent.conditionGroup.conditions[2].conditionOperator = (name === '')? 'IsTrue':(name[name.length-1] === '*')? 'Includes':'Equal';
        clickEvent.conditionGroup.conditions[2].rightOperandValue = name.replace(/\*/, '');
        clickEvent.conditionGroup.conditions[3].conditionOperator = (innertext === '')? 'IsTrue':(innertext[innertext.length-1] === '*')? 'Includes':'Equal';
        clickEvent.conditionGroup.conditions[3].rightOperandValue = innertext.replace(/\*/, '');
        clickEvent.conditionGroup.conditions[4].conditionOperator = (path === '' || path[path.length-1] === '*' || frag[frag.length-1] === '*')? 'Includes':'Equal';
        clickEvent.conditionGroup.conditions[4].rightOperandValue = path + frag;
        events.push(JSON.parse(JSON.stringify(clickEvent)));

        clickEventSession.displayName = "Click - " + id + " in session";
        clickEventSession.internalName = "E_CLICK_" + internalName + "_IN_SESSION";
        clickEventSession.tags = tags;
        clickEventSession.javascript = "// NOTE: Do not change event name\\nfunction E_CLICK_" + internalName + "_IN_SESSION() {}";
        clickEventSession.conditionGroup.conditions[0].leftOperand.displayName = clickEvent.displayName;
        clickEventSession.conditionGroup.conditions[0].leftOperand.internalName = clickEvent.internalName;
        events.push(JSON.parse(JSON.stringify(clickEventSession)));
        break;
      case 'change':
        id = (innertext)? innertext:(name)? name:target;
        internalName = id.toUpperCase().replace(/(\s|'|"|\*|\/)/g, '');

        changeEvent.displayName = "Change - " + id;
        changeEvent.internalName = "E_CHANGE_" + internalName;
        changeEvent.tags = [ tags ];
        changeEvent.javascript = "// NOTE: Do not change event name\\nfunction E_CHANGE_" + internalName + "() {}";
        changeEvent.conditionGroup.conditions[1].conditionOperator = (target === '')? 'IsTrue':(target[target.length-1] === '*')? 'Includes':'Equal';
        changeEvent.conditionGroup.conditions[1].rightOperandValue = target.replace(/\*/, '');
        changeEvent.conditionGroup.conditions[2].conditionOperator = (name === '')? 'IsTrue':(name[name.length-1] === '*')? 'Includes':'Equal';
        changeEvent.conditionGroup.conditions[2].rightOperandValue = name.replace(/\*/, '');
        changeEvent.conditionGroup.conditions[3].conditionOperator = (innertext === '')? 'IsTrue':(innertext[innertext.length-1] === '*')? 'Includes':'Equal';
        changeEvent.conditionGroup.conditions[3].rightOperandValue = innertext.replace(/\*/, '');
        changeEvent.conditionGroup.conditions[4].conditionOperator = (path === '' || path[path.length-1] === '*' || frag[frag.length-1] === '*')? 'Includes':'Equal';
        changeEvent.conditionGroup.conditions[4].rightOperandValue = path + frag;
        events.push(JSON.parse(JSON.stringify(changeEvent)));

        changeEventSession.displayName = "Change - " + id + " in session";
        changeEventSession.internalName = "E_CHANGE_" + internalName + "_IN_SESSION";
        changeEventSession.tags = [ tags ];
        changeEventSession.javascript = "// NOTE: Do not change event name\\nfunction E_CHANGE_" + internalName + "_IN_SESSION() {}";
        changeEventSession.conditionGroup.conditions[0].leftOperand.displayName = changeEvent.displayName;
        changeEventSession.conditionGroup.conditions[0].leftOperand.internalName = changeEvent.internalName;
        events.push(JSON.parse(JSON.stringify(changeEventSession)));
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

fs.appendFileSync(outputFilename, JSON.stringify(output));

// end
