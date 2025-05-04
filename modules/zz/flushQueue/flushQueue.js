TLT.addModule("flushQueue", function () {
    return {
        onevent: function (webEvent) {
            if (webEvent) {
                switch (webEvent.type) {
                case "visibilitychange":
                    if (TLT.utils.isiOS) TLT.flushAll();
                    break;
                default:
                    break;
                }
            }
        }
    };
});