// NOTE: Do not change event name
function E_PATH_STONE_1615618648559()
{
    // check if new stone found
    var stone = $S.getCustomVar("SSV_1042"); // Path Stone Found
    if (stone !== "")
    {
        // blank found flag event
        $S.setCustomVar("SSV_1042", "");
        $S.setCustomVar("SSV_1041", stone); // Path Stone
    
        // set path
        var pathObj = $S.getCustomJSObj("path") || { msgs: [] };
        pathObj.msgs.push(stone);
        $S.setCustomJSObj("path", pathObj);
        // set session path object
        $S.setCustomVar("SSV_1040", pathObj.msgs.join(" > ")); // Path
    
        // check if previous stone
        var lastStone, lastStoneTime;
        if ($F.getEventCount("E_PATH_STONE_1615618648559") === 0)
        {
            // first stone in path
            lastStone = "empty";
            lastStoneTime = 0;
        }
        else
        {
            lastStone = $F.getLastEventValue("E_PATH_STONE_1615618648559");
            lastStoneTime = Math.round(($S.LastHitEpoch - $F.getLastHitTime("E_PATH_STONE_1615618648559"))/1000);
            // separate event to get time as numeric value
            $F.setFacts("E_PATH_TIME_1615618745280", lastStoneTime, { "DIM_PATH_STONE_1615619521345": lastStone, "DIM_PATH_STONE_TIME_1615619612227": lastStoneTime });
        }
    
        // set event with value=stone, dim=lastStone+timing
        $F.setFacts("E_PATH_STONE_1615618648559", stone, { "DIM_PATH_STONE_1615619521345": lastStone, "DIM_PATH_STONE_TIME_1615619612227": lastStoneTime });
    }
}
