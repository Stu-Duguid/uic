
// ABTasty integration
function sendABTastyData() {
    window.TLT.abtTries = window.TLT.abtTries || 0;
    window.TLT.abtTries++;
    // console.debug(`tealeaf abtasty: try ${window.TLT.abtTries}`)
    if ('ABTasty' in window && window.ABTasty.getTestsOnPage && typeof window.ABTasty.getTestsOnPage === 'function') {
        // console.debug('tealeaf abtasty: found');
        var abTastyTests = window.ABTasty.getTestsOnPage();
        for (var abTasteTest in abTastyTests) {
            // console.debug('tealeaf abtasty: ', abTasteTest);
            var abExp = abTastyTests[abTasteTest];
            // console.debug('tealeaf abtasty: ', abTasteTest, abExp.name, abExp.variationID, abExp.variationName);
            window.TLT.logCustomEvent("abTest", {
                description: "ABTasty",
                experimentId: abTasteTest,
                experiment: abExp.name,
                variantId: abExp.variationID,
                variant: abExp.variationName
            });
            // console.debug('tealeaf abtasty: ', abTasteTest, abExp.name, abExp.variationID, abExp.variationName);
        }
    } else {
        if (window.TLT.abtTries < 40)
            setTimeout(sendABTastyData, 500);
    }
}
setTimeout(sendABTastyData, 4000);