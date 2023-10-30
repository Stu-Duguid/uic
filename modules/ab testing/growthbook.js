function sendTealeafData(experiment, result) {
    if (window.TLT && window.TLT.isInitialized()) {
        window.TLT.logCustomEvent("abTest", {
            description: "GrowthBook",
            experimentId: experiment.key,
            experiment: experiment.name,
            variantId: result.variationId,
            variant: result.name
        });
    }
    else {
      setTimeout(sendTealeafData, 200);
    }
}
sendTealeafData();

// example of where to put it

const gb = new GrowthBook({
    apiHost: "https://cdn.growthbook.io",
    clientKey: "sdk-abc123",
    //
    // ...
    //
    // Only required for A/B testing
    // Called every time a user is put into an experiment
    trackingCallback: sendTealeafData,
  });