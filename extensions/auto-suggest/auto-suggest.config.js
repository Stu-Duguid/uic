// NOTE: Do not change event name
function E_AUTO_SUGGEST_CONFIG_1656819656547()
{
    // config for auto-suggest field reporting

    // fields should contain an object for each field
    //   the description is the short name used in reports
    //   urlPath is the 'Step - Screenview URL' from the page load
    //   urlFragment is the 'Step - ScreenView name' from the page load (can be empty if root)
    //   targetId is the 'Step - Target ID' from the value change event
    //   dataUrl is the 'Step - API Request URL' from the AJAX call (.sessions[0].message.customEvent.data.requestURL - step attribute created by performance dashboard)
    //   dataTargetIds is a regex to match the target Id of the click to choose a value
    //   manualTargetIds is an array of the fields (in order) that are filled out in a manual response

    var fields = [
        {
            description: "address finder",
            url: "https://secure.state.co.nz/home/Comprehensive#/your_details",
            targetId: "addressFinder",
            dataUrl: "secure.state.co.nz/premiumestimates/api/location/situationsOfRisk",
            dataTargetIds: [
                "[[\"ui-id-0\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-1\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-2\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-3\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-4\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-5\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-6\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-7\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-8\"],[\"li\",0],[\"a\",0]]",
            ],
            manualTargetIds: []
        },
        {
            description: "mailing address finder",
            url: "https://secure.state.co.nz/home/Comprehensive#/more_information",
            targetId: "mailingAddress",
            dataUrl: "secure.state.co.nz/premiumestimates/api/location/Addresses",
            dataTargetIds: [
                "[[\"ui-id-0\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-1\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-2\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-3\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-4\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-5\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-6\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-7\"],[\"li\",0],[\"a\",0]]",
                "[[\"ui-id-8\"],[\"li\",0],[\"a\",0]]",
            ],
            manualTargetIds: []
        }
    ];
    
    var config = {
        fields: fields,
        count: {
            changes: 0,
            calls: 0,
            choices: 0
        }
    }
    
    $S.setCustomJSObj("autoSuggest", config);
}