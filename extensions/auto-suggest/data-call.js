// NOTE: Do not change event name
function E_DATA_CALL_FOR_AUTO_SUGGEST_1656756800078()
{
    if ($P["P_STEP_CUSTOM_EVENT_NAME_1656756337510"].firstValue().toUpperCase() == "AJAXLISTENER")
    {
        var config = $S.getCustomJSObj("autoSuggest");
        if (config !== null && config.fields)
        {
            var url = $F.getLastEventValue("E_CURRENT_URL_1656843415530");
            var dataUrl = $P["TL.STEP_API_REQUEST_URL"].firstValue();
            
            for (var i = 0; i < config.fields.length; i++)
            {
                var f = config.fields[i];
                
                // check if a matching page & fragment & dataUrl
                if (dataUrl === f.dataUrl && url === f.url)
                {
                    // reset counters and save
                    // config.count.changes = 0;
                    config.count.calls = config.count.calls+1;
                    // config.count.choices = 0;
                    $S.setCustomJSObj("autoSuggest", config);

                    // fire once per page
                    if (config.count.calls === 1)
                    {
                        // set dimension to field description and fire event
                        var dims = {};
                        dims["DIM_AUTO_SUGGEST_FIELD_1656823918689"] = f.description;
                        $F.setFacts("E_DATA_CALL_FOR_AUTO_SUGGEST_1656756800078", f.description, dims);
                    }
                }
            }
        }
    }
}