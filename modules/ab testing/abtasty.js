
// ABTasty integration
if ('ABTasty' in window) {
    var abTastyTests = window.ABTasty.getTestsOnPage();
    for (var abTasteTest in abTastyTests) {
        var abExp = abTastyTests[abTasteTest];
        window.TLT.logCustomEvent("abTest", {
            description: "ABTasty",
            experimentId: abTasteTest,
            experiment: abExp.name,
            variantId: abExp.variationID,
            variant: abExp.variationName
        });
    }
}