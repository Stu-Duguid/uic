{
    // change storage text, pattern name, and event name
    const store = "text_xxx";
    var prev = $S.getCustomJSObj(store) || { timestamp: 0 };

    if ($P["P_TEXT_XXX"].patternFound() && prev.timestamp < $F.getLastHitTime("TL.E_SCREENVIEW_LOAD_BB"))
    {
        prev.timestamp = $S.LastHitEpoch;
        $S.setCustomJSObj(store, prev);
        $F.setFacts("E_TEXT_XXX");
    }
}