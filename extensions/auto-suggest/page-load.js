// NOTE: Do not change event name
function E_PAGE_LOADED_WITH_AUTO_SUGGEST_1656740992036()
{
    if ($P["TL.STEP_SCREENVIEW_TYPE"].firstValue().toUpperCase() == "LOAD")
    {
        var config = $S.getCustomJSObj("autoSuggest");
        if (config !== null && config.fields)
        {
            var url = $F.getLastEventValue("E_CURRENT_URL_1656843415530");
            
            for (var i = 0; i < config.fields.length; i++)
            {
                var f = config.fields[i];
                
                // check if a matching page & fragment
                if (url === f.url)
                {
                    // set dimension to field description and fire event
                    var dims = {};
                    dims["DIM_AUTO_SUGGEST_FIELD_1656823918689"] = f.description;
                    $F.setFacts("E_PAGE_LOADED_WITH_AUTO_SUGGEST_1656740992036", f.description, dims);
                    
                    // reset counters and save
                    config.count.changes = 0;
                    config.count.calls = 0;
                    config.count.choices = 0;
                    $S.setCustomJSObj("autoSuggest", config);
                }
            }
        }
    }
}