function E_EVENTNAME() {
{
    // change storage text, pattern name, and event name
    const store = "text_xxx";
    var prev = $S.getCustomJSObj(store) || { timestamp: 0 };

    if ($P["P_TEXT_XXX"].patternFound() && prev.timestamp < $F.getLastHitTime("TL.E_SCREENVIEW_LOAD_BB"))
    {
        prev.timestamp = $S.LastHitEpoch;
        $S.setCustomJSObj(store, prev);
        $F.setFacts("E_EVENTNAME");
    }
}


// tested using lookup on the last instance of itself

function E_EVENTNAME() {
    if ($P["P_PATTERN"].patternFound()) {
        var load = $F.getLastHitTime("TL.E_ALL_PAGE_LOADS");
        var prev = $F.getLastHitTime("E_EVENTNAME");

        if (prev < load) {
            $F.setFacts("E_EVENTNAME");
        }
    }
}