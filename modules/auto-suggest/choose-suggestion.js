// NOTE: Do not change event name
function E_CHOOSE_SUGGESTION_FOR_AUTO_SUGGEST_1656840610854()
{
    if ($P["TL.STEP_EVENT_TYPE"].firstValue().toUpperCase() == "CLICK")
    {
        var config = $S.getCustomJSObj("autoSuggest");
        if (config !== null && config.fields)
        {
            var url = $F.getLastEventValue("E_CURRENT_URL_1656843415530");
            var target = $P["TL.STEP_TARGET_ID"].firstValue();
            
            for (var i = 0; i < config.fields.length; i++)
            {
                var f = config.fields[i];
                
                // check if a matching page & fragment & dataUrl
                if (url === f.url)
                {
                    for (var j = 0; j < f.dataTargetIds.length; j++)
                    {
                        if (f.dataTargetIds[j] === target)
                        {
                            // reset counters and save
                            // config.count.changes = 0;
                            // config.count.calls = 0;
                            config.count.choices = config.count.choices+1;
                            $S.setCustomJSObj("autoSuggest", config);
                            
                            // fire once per page
                            if (config.count.choices === 1)
                            {
                                // set dimension to field description and fire event
                                var dims = {};
                                dims["DIM_AUTO_SUGGEST_FIELD_1656823918689"] = f.description;
                                $F.setFacts("E_CHOOSE_SUGGESTION_FOR_AUTO_SUGGEST_1656840610854", f.description, dims);
                            }
                        }
                    }
                }
            }
        }
    }
}