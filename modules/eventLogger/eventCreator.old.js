const fs = require('fs');

const tag = 'tag';
const inputFilename = 'events.csv';
const outputFilename = 'events.json';

// read in the file with the required events
const data = fs.readFileSync(inputFilename, 'utf-8');

// add output header
const outputHeader = `
{
  "events": [`;
fs.appendFileSync(outputFilename, outputHeader);

// loop through each line of the input
const lines = data.split('\n');

for (const lineNum in lines) {
    console.log('processing line: ', lines[lineNum])
    const values = lines[lineNum].split('|');
    if (values.length > 2) {
      const type = values[0];
      const path = values[1];
      const frag = values[2];
      const tags = values[3].replace(/:/g, '","');
        const target = values[4].replace(/"/g, "'");
        const name = values[5].replace(/"/g, '\\"');
        const innertext = values[6].replace(/"/g, '\\"');
        // write out, appending to output
        var addedComma = (lineNum < lines.length-1)? ',':'';
        switch (type) {
            case 'load':
                fs.appendFileSync(outputFilename, loadEvent(path, frag, tags));
                break;
            case 'click':
                fs.appendFileSync(outputFilename, clickEvent(path, frag, tags, target, name, innertext));
                break;
            case 'change':
                fs.appendFileSync(outputFilename, changeEvent(path, frag, tags, target, name, innertext));
                break;
        }
    }
}

// add output footer
const outputFooter = `
  ],
  "dimensions" : [ ],
  "dimensionGroups" : [ ],
  "sessionAttributes" : [ ],
  "hitAttributes" : [ ],
  "stepAttributes" : [ ]
}
`;
fs.appendFileSync(outputFilename, outputFooter);

// end

// initialise the templates
function loadEvent(path, frag, tags) {
    const id = path+frag;
    const internalName = id.toUpperCase().replace(/(\*|\/)/g, '').replace(/\#/, '_');
    return String.raw`
    {
      "displayName": "Load - ${id}",
      "internalName": "E_LOAD_${internalName}",
      "capturePersonalData": false,
      "active": true,
      "tags": [ "${tags}" ],
      "trigger": "EveryStep",
      "publish": "Immediate",
      "mode": "Basic",
      "javascript": "// NOTE: Do not change event name\\nfunction E_LOAD_${internalName}() {}",
      "conditionGroup": {
        "conditionOperator": "And",
        "distanceOperator": "GreaterThan",
        "conditions": [
          {
            "leftOperand": {
              "displayName": "Step - ScreenView Type",
              "internalName": "STEP_SCREENVIEW_TYPE",
              "type": "StepAttribute"
            },
            "leftOperandValueType": "Pattern",
            "method": "firstValue()",
            "conditionOperator": "Equal",
            "rightOperandValue": "load",
            "rightOperandValueType": "TextLiteral",
            "caseSensitive": false
          },
          {
            "leftOperand": {
              "displayName": "Step - Screenview URL",
              "internalName": "P_STEP_SCREENVIEW_URL_1595831779522",
              "type": "StepAttribute"
            },
            "leftOperandValueType": "Pattern",
            "method": "firstValue()", patternFound() ----------------------------
            "conditionOperator": "${(path === '')? 'IsTrue':(path[path.length-1] === '*')? 'Includes':'Equal'}",
            "rightOperandValue": "${path.replace(/\*/, '')}",
            "rightOperandValueType": "TextLiteral",
            "caseSensitive": false
          },
          {
            "leftOperand": {
              "displayName": "Step - ScreenView Name",
              "internalName": "STEP_SCREENVIEW_NAME",
              "type": "StepAttribute"
            },
            "leftOperandValueType": "Pattern",
            "method": "firstValue()",
            "conditionOperator": "${(frag === '')? 'IsTrue':(frag[frag.length-1] === '*')? 'Includes':'Equal'}",
            "rightOperandValue": "${frag.replace(/\*/, '')}",
            "rightOperandValueType": "TextLiteral",
            "caseSensitive": false
          }
        ],
        "lowerBound": 0.0,
        "upperBound": 0.0
      },
      "referenceValueType": "Custom",
      "valueType": "Text",
      "storeMetrics": "Count",
      "track": "AllOccurrence",
      "forSupportUserOnly": false,
      "buildingBlockOnly": false,
      "discardSession": false,
      "geoAnalyticsEnabled": false,
      "dimensionGroups": {}
  },
  {
    "displayName": "Load - ${id} in session",
    "internalName": "E_LOAD_${internalName}_IN_SESSION",
    "capturePersonalData": false,
    "active": true,
    "tags": [ "${tags}" ],
    "trigger": "AtSessionEnd",
    "publish": "SessionEnd",
    "mode": "Basic",
    "javascript": "// NOTE: Do not change event name\\nfunction E_LOAD_${internalName}_IN_SESSION() {}",
    "conditionGroup": {
      "conditionOperator": "And",
      "conditions": [
        {
          "leftOperand": {
            "displayName": "Load - ${id}",
            "internalName": "E_LOAD_${internalName}",
            "type": "Event"
          },
          "leftOperandValueType": "Fact",
          "method": "existsSession",
          "conditionOperator": "IsTrue",
          "rightOperandValue": "",
          "rightOperandValueType": "TextLiteral",
          "caseSensitive": false
        }
      ],
      "lowerBound": 0.0,
      "upperBound": 0.0
    },
    "referenceValueType": "Custom",
    "valueType": "Text",
    "storeMetrics": "Count",
    "track": "FirstOccurrence",
    "forSupportUserOnly": false,
    "buildingBlockOnly": false,
    "discardSession": false,
    "geoAnalyticsEnabled": false,
    "dimensionGroups": {
      "Status": false
    }
  }`;
};

function clickEvent(path, frag, tags, target, name, innertext) {
    const id = (innertext)? innertext:(name)? name:target;
    const internalName = id.toUpperCase().replace(/(\s|'|"|\*|\/)/g, '');
    return String.raw`
    {
      "displayName": "Click - ${id}",
      "internalName": "E_CLICK_${internalName}",
      "capturePersonalData": false,
      "active": true,
      "tags": [ "${tags}" ],
      "trigger": "EveryStep",
      "publish": "Immediate",
      "mode": "Basic",
      "javascript": "// NOTE: Do not change event name\\nfunction E_CLICK_${internalName}() {}",
      "conditionGroup": {
        "conditionOperator": "And",
        "distanceOperator": "GreaterThan",
        "conditions": [
          {
            "leftOperand": {
              "displayName": "Step - Event Type",
              "internalName": "STEP_EVENT_TYPE",
              "type": "StepAttribute"
            },
            "leftOperandValueType": "Pattern",
            "method": "firstValue()",
            "conditionOperator": "Equal",
            "rightOperandValue": "click",
            "rightOperandValueType": "TextLiteral",
            "caseSensitive": false
          },
          {
            "leftOperand": {
              "displayName": "Step - Target ID",
              "internalName": "STEP_TARGET_ID",
              "type": "StepAttribute"
            },
            "leftOperandValueType": "Pattern",
            "method": "firstValue()",
            "conditionOperator": "${(target === '')? 'IsTrue':(target[target.length-1] === '*')? 'Includes':'Equal'}",
            "rightOperandValue": "${target.replace(/\*/, '')}",
            "rightOperandValueType": "TextLiteral",
            "caseSensitive": false
          },
          {
            "leftOperand": {
              "displayName": "Step - Target Name",
              "internalName": "STEP_TARGET_NAME",
              "type": "StepAttribute"
            },
            "leftOperandValueType": "Pattern",
            "method": "firstValue()",
            "conditionOperator": "${(name === '')? 'IsTrue':(name[name.length-1] === '*')? 'Includes':'Equal'}",
            "rightOperandValue": "${name.replace(/\*/, '')}",
            "rightOperandValueType": "TextLiteral",
            "caseSensitive": false
          },
          {
            "leftOperand": {
              "displayName": "Step - Target Current InnerText",
              "internalName": "P_STEP_TARGET_CURRENT_INNERTEXT_666",
              "type": "StepAttribute"
            },
            "leftOperandValueType": "Pattern",
            "method": "firstValue()",
            "conditionOperator": "${(innertext === '')? 'IsTrue':(innertext[innertext.length-1] === '*')? 'Includes':'Equal'}",
            "rightOperandValue": "${innertext.replace(/\*/, '')}",
            "rightOperandValueType": "TextLiteral",
            "caseSensitive": false
          },
          {
              "leftOperand": {
                "displayName": "Web Path#Fragment",
                "internalName": "E_WEB_PATH_FRAGMENT",
                "type": "Event"
              },
              "leftOperandValueType": "Fact",
              "method": "Value",
              "conditionOperator": "${(path === '' || path[path.length-1] === '*' || frag[frag.length-1] === '*')? 'Includes':'Equal'}",
              "rightOperandValue": "${path}${frag}",
              "rightOperandValueType": "TextLiteral",
              "caseSensitive": false
          }
        ],
        "lowerBound": 0.0,
        "upperBound": 0.0
      },
      "referenceValueType": "Custom",
      "valueType": "Text",
      "storeMetrics": "Count",
      "track": "AllOccurrence",
      "forSupportUserOnly": false,
      "buildingBlockOnly": false,
      "discardSession": false,
      "geoAnalyticsEnabled": false,
      "dimensionGroups": {}
  },
  {
    "displayName": "Click - ${id} in session",
    "internalName": "E_CLICK_${internalName}_IN_SESSION",
    "capturePersonalData": false,
    "active": true,
    "tags": [ "${tags}" ],
    "trigger": "AtSessionEnd",
    "publish": "SessionEnd",
    "mode": "Basic",
    "javascript": "// NOTE: Do not change event name\\nfunction E_CLICK_${internalName}_IN_SESSION() {}",
    "conditionGroup": {
      "conditionOperator": "And",
      "conditions": [
        {
          "leftOperand": {
            "displayName": "Click - ${id}",
            "internalName": "E_CLICK_${internalName}",
            "type": "Event"
          },
          "leftOperandValueType": "Fact",
          "method": "existsSession",
          "conditionOperator": "IsTrue",
          "rightOperandValue": "",
          "rightOperandValueType": "TextLiteral",
          "caseSensitive": false
        }
      ],
      "lowerBound": 0.0,
      "upperBound": 0.0
    },
    "referenceValueType": "Custom",
    "valueType": "Text",
    "storeMetrics": "Count",
    "track": "FirstOccurrence",
    "forSupportUserOnly": false,
    "buildingBlockOnly": false,
    "discardSession": false,
    "geoAnalyticsEnabled": false,
    "dimensionGroups": {
      "Status": false
    }
  }`;
}

function changeEvent(path, frag, tags, target, name, innertext) {
    const id = (innertext)? innertext:(name)? name:target;
    const internalName = id.toUpperCase().replace(/(\s|'|"|\*|\/)/g, '');
    return String.raw`
    {
      "displayName": "Change - ${id}",
      "internalName": "E_CHANGE_${internalName}",
      "capturePersonalData": false,
      "active": true,
      "tags": [ "${tags}" ],
      "trigger": "EveryStep",
      "publish": "Immediate",
      "mode": "Basic",
      "javascript": "// NOTE: Do not change event name\\nfunction E_CHANGE_${internalName}() {}",
      "conditionGroup": {
        "conditionOperator": "And",
        "distanceOperator": "GreaterThan",
        "conditions": [
          {
            "leftOperand": {
              "displayName": "Step - Event Type",
              "internalName": "STEP_EVENT_TYPE",
              "type": "StepAttribute"
            },
            "leftOperandValueType": "Pattern",
            "method": "firstValue()",
            "conditionOperator": "Equal",
            "rightOperandValue": "change",
            "rightOperandValueType": "TextLiteral",
            "caseSensitive": false
          },
          {
            "leftOperand": {
              "displayName": "Step - Target ID",
              "internalName": "STEP_TARGET_ID",
              "type": "StepAttribute"
            },
            "leftOperandValueType": "Pattern",
            "method": "firstValue()",
            "conditionOperator": "${(target === '')? 'IsTrue':(target[target.length-1] === '*')? 'Includes':'Equal'}",
            "rightOperandValue": "${target.replace(/\*/, '')}",
            "rightOperandValueType": "TextLiteral",
            "caseSensitive": false
          },
          {
            "leftOperand": {
              "displayName": "Step - Target Name",
              "internalName": "STEP_TARGET_NAME",
              "type": "StepAttribute"
            },
            "leftOperandValueType": "Pattern",
            "method": "firstValue()",
            "conditionOperator": "${(name === '')? 'IsTrue':(name[name.length-1] === '*')? 'Includes':'Equal'}",
            "rightOperandValue": "${name.replace(/\*/, '')}",
            "rightOperandValueType": "TextLiteral",
            "caseSensitive": false
          },
          {
            "leftOperand": {
              "displayName": "Step - Target Current InnerText",
              "internalName": "P_STEP_TARGET_CURRENT_INNERTEXT_666",
              "type": "StepAttribute"
            },
            "leftOperandValueType": "Pattern",
            "method": "firstValue()",
            "conditionOperator": "${(innertext === '')? 'IsTrue':(innertext[innertext.length-1] === '*')? 'Includes':'Equal'}",
            "rightOperandValue": "${innertext.replace(/\*/, '')}",
            "rightOperandValueType": "TextLiteral",
            "caseSensitive": false
          },
          {
              "leftOperand": {
                "displayName": "Web Path#Fragment",
                "internalName": "E_WEB_PATH_FRAGMENT",
                "type": "Event"
              },
              "leftOperandValueType": "Fact",
              "method": "Value",
              "conditionOperator": "${(path === '' || path[path.length-1] === '*' || frag[frag.length-1] === '*')? 'Includes':'Equal'}",
              "rightOperandValue": "${path}${frag}",
              "rightOperandValueType": "TextLiteral",
              "caseSensitive": false}
        ],
        "lowerBound": 0.0,
        "upperBound": 0.0
      },
      "referenceValueType": "Custom",
      "valueType": "Text",
      "storeMetrics": "Count",
      "track": "AllOccurrence",
      "forSupportUserOnly": false,
      "buildingBlockOnly": false,
      "discardSession": false,
      "geoAnalyticsEnabled": false,
      "dimensionGroups": {}
  },
  {
    "displayName": "Change - ${id} in session",
    "internalName": "E_CHANGE_${internalName}_IN_SESSION",
    "capturePersonalData": false,
    "active": true,
    "tags": [ "${tags}" ],
    "trigger": "AtSessionEnd",
    "publish": "SessionEnd",
    "mode": "Basic",
    "javascript": "// NOTE: Do not change event name\\nfunction E_CHANGE_${internalName}_IN_SESSION() {}",
    "conditionGroup": {
      "conditionOperator": "And",
      "conditions": [
        {
          "leftOperand": {
            "displayName": "Load - ${id}",
            "internalName": "E_LOAD_${internalName}",
            "type": "Event"
          },
          "leftOperandValueType": "Fact",
          "method": "existsSession",
          "conditionOperator": "IsTrue",
          "rightOperandValue": "",
          "rightOperandValueType": "TextLiteral",
          "caseSensitive": false
        }
      ],
      "lowerBound": 0.0,
      "upperBound": 0.0
    },
    "referenceValueType": "Custom",
    "valueType": "Text",
    "storeMetrics": "Count",
    "track": "FirstOccurrence",
    "forSupportUserOnly": false,
    "buildingBlockOnly": false,
    "discardSession": false,
    "geoAnalyticsEnabled": false,
    "dimensionGroups": {
      "Status": false
    }
  }`;
}
