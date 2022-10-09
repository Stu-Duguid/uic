// tealeaf reader

if (!"TLT" in window.wrappedJSObject) {
    console.log("Tealeaf not found.");
} else {
    console.log("Tealeaf on page.");
    console.log("Tealeaf SDK version: " + window.wrappedJSObject.TLT.getLibraryVersion());
    console.log("Tealeaf collector: "+ window.wrappedJSObject.TLT.getServiceConfig("queue").queues[0].endpoint);
    console.log("Tealeaf TLTSID: "+ window.wrappedJSObject.cookie;
    
//    const teareader = window.wrappedJSObject.TLT;

    if (window.wrappedJSObject.TLT.isInitialised()) {
        console.log("Tealeaf stopped.");
    } else {
        console.log("Tealeaf running.");
        
        console.log("Tealeaf SDK version: "+ window.wrappedJSObject.TLT.getLibraryVersion());
        
        //var teaqueueconfig = teareader.getServiceConfig("queue");
        //console.log("Tealeaf collector: "+ teaqueueconfig.queues[0].endpoint);
    }
}





