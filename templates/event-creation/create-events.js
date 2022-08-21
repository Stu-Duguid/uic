// code to support the create events page

const dataTypes = ["events", "dimensions", "dimensionGroups", "stepAttributes", "hitAttributes", "sessionAttributes"];
const fields = {};

for (let dataType of dataTypes) {
    fields[dataType] = document.getElementById(dataType)
}
const prefixElem = document.getElementById("prefix");
const bracesElem = document.getElementById("braces");
const dataElem = document.getElementById("data");

function populateData() {
    // get the contents of the data (JSON) and parse it into fields
    let data;
    try {
        data = JSON.parse(dataElem.value);
    } catch (e) {
        alert("bad data: fails JSON.parse");
        return;
    }
    for (let dataType of dataTypes) {
        for (let d of data[dataType]) {
            fields[dataType].value += d.displayName + '\n';
        }
    }
}

function generateData() {
    // read the fields and generate empty event definitions in the data field
    let prefix = prefixElem.value.trim();
    let braces = bracesElem.value.trim();
    braces = (braces === '') ? "[]" : braces;
    let prefixInt = prefix.replace(/[^a-z0-9]/gi, '_').toUpperCase();
    let tag = `${braces[0]}${prefix}${braces[1]}`;
    let data = {
        "events": [],
        "dimensions": [],
        "dimensionGroups": [],
        "stepAttributes": [],
        "hitAttributes": [],
        "sessionAttributes": [],
    };
    for (let dataType of dataTypes) {
        let list = fields[dataType].value.split('\n');
        for (let entry of list) {
            entry = entry.trim();
            if (entry !== '') {
                console.debug(`dataType ${dataType}, entry ${entry}`);
                let displayName = `${braces[0]}${prefix} ${entry}${braces[1]}`;
                let internalName = `${prefixInt}_${entry.replace(/[^a-z0-9]/gi, '_').toUpperCase()}`;
                switch (dataType) {
                    case "events":
                        internalName = `E_${internalName}`;
                        data.events.push(
                            {
                                "displayName": displayName,
                                "internalName": internalName,
                                "capturePersonalData": false,
                                "active": false,
                                "tags": [ tag, "#import-empty-defs#" ],
                                "trigger": "EveryStep",
                                "publish": "Immediate",
                                "mode": "Basic",
                                "javascript": `function ${internalName}(){ return; }`,
                                "conditionGroup": {
                                    "conditionOperator": "And",
                                    "distanceOperator": "GreaterThan",
                                    "conditions": [],
                                    "lowerBound": 0.0,
                                    "upperBound": 0.0
                                },
                                "referenceValueType": "Custom",
                                "valueType": "Text",
                                "storeMetrics": "Count",
                                "track": "FirstOccurrence",
                                "forSupportUserOnly": true,
                                "buildingBlockOnly": true,
                                "discardSession": false,
                                "geoAnalyticsEnabled": false,
                                "dimensionGroups": {}
                            }
                        );
                        break;
                    case "dimensions":
                        data.dimensions.push(
                            {
                                "displayName": displayName,
                                "internalName": `DIM_${internalName}`,
                                "tags": [ tag, "#import-empty-defs#" ],
                                "active": false,
                                "capturePersonalData": false,
                                "populatedBy": {
                                    "displayName": "{event-template}",
                                    "internalName": "E_EVENT_TEMPLATE",
                                    "type": "Event"
                                },
                                "populateWith": "FirstValueInSession",
                                "defaultValue": "TLT$OTHERS",
                                "publish": "Immediate",
                                "whiteList": [],
                                "valueToRecord": "JustWhiteList",
                                "maxObservedValues": 1000,
                                "turnOnLogging": false
                            }
                        );
                        break;
                    case "dimensionGroups":
                        data.dimensionGroups.push(
                            {
                                "displayName": displayName,
                                "internalName": `DG_DIMENSION_GROUP_${internalName}`,
                                "tags": [ tag, "#import-empty-defs#" ],
                                "active": false,
                                "dimensions": [ ]
                            }
                        );
                        break;
                    case "stepAttributes":
                        data.stepAttributes.push(
                            {
                                "displayName": displayName,
                                "internalName": `P_STEP_ATTRIBUTE_${internalName}`,
                                "tags": [ tag, "#import-empty-defs#" ],
                                "active": false,
                                "stepPatternPath": "zzz",
                                "useRegex": false,
                                "displayCase": "NoChange"
                            }
                        );
                        break;
                    case "hitAttributes":
                        data.hitAttributes.push(
                            {
                                "displayName": displayName,
                                "internalName": `P_HIT_ATTRIBUTE_${internalName}`,
                                "tags": [ tag, "#import-empty-defs#" ],
                                "active": false,
                                "match": "Request",
                                "use": "ExactMatch",
                                "pattern": "zzzz",
                                "useRegex": false,
                                "blockReplace": false,
                                "displayCase": "NoChange"
                            }
                        );
                        break;
                    case "sessionAttributes":
                        data.sessionAttributes.push(
                            {
                                "displayName": displayName,
                                "internalName": `SSV_${internalName}`,
                                "tags": [ tag, "#import-empty-defs#" ],
                                "active": false,
                                "capturePersonalData": false,
                                "populatedBy": [ ],
                                "identityType": "None"
                            }
                        );
                }
            }
        }
    }
    console.dir(data);
    dataElem.value = JSON.stringify(data);
}