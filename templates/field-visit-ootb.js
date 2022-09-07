/* global $P, $F, $S, $H */

// NOTE: Do not change event name
function E_STEP_USABILITY_FORM_FIELD_VISIT() {
    var screenView = $F.getLastEventValue("TL.E_SCREENVIEW_LOAD_BB") || $S.LastScreenView;
    var allowSample = !($F.getLastHitNumber("TL.E_STEP_OVERSTAT_SAMPLING") == $H.HitNumber && $F.getLastStepNumber("TL.E_STEP_OVERSTAT_SAMPLING") == $H.StepNumber);
    if (!$S.IsBot && screenView !== "" && $P["TL.STEP_TARGET_DWELL_TIME"].patternFound() && allowSample) {
        var visitCount = parseInt($P["TL.STEP_TARGET_VISIT_COUNT"].firstValue());
        var targetType = $P["TL.STEP_TARGET_TYPE"].firstValue().toUpperCase();
        var targetTLType = $P["TL.STEP_TARGET_TL_TYPE"].firstValue().toUpperCase();
        var eventType = $P["TL.STEP_EVENT_TYPE"].firstValue().toUpperCase();
        var tlEventType = $P["TL.STEP_TL_EVENT_TYPE"].firstValue().toUpperCase();
        var matchingTargetType = false;
        var matchingEventType = false;

        var targetID = $F.getLastEventValue("TL.E_STEP_USABILITY_TARGET_ID");

        var targetName = null;
        if ($P["TL.STEP_TARGET_NAME"].patternFound()) targetName = $P["TL.STEP_TARGET_NAME"].firstValue();

        // If there is a name attribute, append it.  This is used for treating
        // all elements (such as radio buttons) as a single entity
        if (targetName) {
            targetID = targetID + "?name=" + targetName;
        }

        switch (targetType) {
            case "INPUT":
            case "TEXTAREA":
            case "SELECT":
            case "BUTTON":
                matchingTargetType = true;
                break;
        }

        // There can be other types of buttons.  Check if target is a generic tealeaf button
        if (!matchingTargetType && targetTLType == "BUTTON")
            matchingTargetType = true;

        switch (eventType) {
            case "BLUR":
            case "CHANGE":
                matchingEventType = true;
                break;
            case "CLICK":
                matchingEventType = targetType == "BUTTON" || targetTLType == "BUTTON" || targetTLType == "SUBMITBUTTON";
                break;
        }

        if (!matchingTargetType || !matchingEventType) {
            matchingTargetType = matchingEventType = false;

            switch (targetTLType) {
                case "SELECTLIST":
                case "EMAILPICKER":
                case "NUMBERPICKER":
                case "TIMEPICKER":
                case "DATEPICKER":
                case "RADIOBUTTON":
                case "TOGGLEBUTTON":
                case "BUTTON":
                case "TEXTBOX":
                case "SEARCHBOX":
                case "URL":
                    matchingTargetType = true;
                    break;
            }

            switch (tlEventType) {
                case "VALUECHANGE":
                case "TEXTCHANGE":
                case "ONFOCUSCHANGE_OUT":
                    matchingEventType = true;
                    break;
            }
        }

        var dims = { "TL.DIM_SCREENVIEW": screenView, "TL.DIM_STEP_USABILITY_TARGET_ID": targetID };
        if (matchingTargetType && matchingEventType) {
            // both first and last field logic only in this event - this code should execute on repeats as well
            // set last visited form field, with a forced target id
            $S.setCustomJSObj("TL$LAST_FORM_FIELD_VISITED", { "targetID": targetID });

            var firstField = $S.getCustomJSObj("TL$FIRST_FORM_FIELD_SINCE_LOAD");
            if (firstField) {
                $F.setFacts("TL.E_STEP_USABILITY_FIRST_FORM_FIELD_VISITED", null, dims);
                $S.setCustomJSObj("TL$FIRST_FORM_FIELD_SINCE_LOAD", false);
            }

            var dwellTime = parseFloat($P["TL.STEP_TARGET_DWELL_TIME"].firstValue());
            if (visitCount == 1 && isFinite(dwellTime) && dwellTime >= 0 && dwellTime <= 3600000) {
                $F.setFacts("TL.E_STEP_USABILITY_FORM_FIELD_VISIT", dwellTime, dims);
            }
        }
    }
}


// not bot
// type 4
// page
// target id

// set last field for this form in the page obj (auto cleared)
// this triggers on unload (?)
// if no first field set (page obj) then fire event (separate event?)
// fire event with dim platform and value of dwell