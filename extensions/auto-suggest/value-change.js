// NOTE: Do not change event name
function E_VALUE_CHANGE_IN_AUTO_SUGGEST_1656746528707()
{
    if ($P["TL.STEP_EVENT_TYPE"].firstValue().toUpperCase() == "CHANGE")
    {
        var config = $S.getCustomJSObj("autoSuggest");
        if (config !== null && config.fields)
        {
            var url = $F.getLastEventValue("E_CURRENT_URL_1656843415530");
            var target = $P["TL.STEP_TARGET_ID"].firstValue();
            
            for (var i = 0; i < config.fields.length; i++)
            {
                var f = config.fields[i];
                
                // check if a matching page & fragment & target
                if (target === f.targetId && url === f.url)
                {
                    // reset counters and save
                    config.count.changes = config.count.changes+1;
                    // config.count.calls = 0;
                    // config.count.choices = 0;
                    $S.setCustomJSObj("autoSuggest", config);

                    // fire once per page
                    if (config.count.changes === 1)
                    {
                        // set dimension to field description and fire event
                        var dims = {};
                        dims["DIM_AUTO_SUGGEST_FIELD_1656823918689"] = f.description;
                        $F.setFacts("E_VALUE_CHANGE_IN_AUTO_SUGGEST_1656746528707", f.description, dims);
                    }
                }
            }
        }
    }
}