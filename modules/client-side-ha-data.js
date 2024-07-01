// a sample of a privacyPattern that does the equivalent of a hit attribute but in the script
// use-cases include
// - getting data that requires DOM capture now, but without the expense of DOM capture
// - computationaly expensive hit attributes on the server can be done without issue on the client
//    e.g. find "something went wrong" text and then find the surrounding error message context
config.services.message.privacyPatterns = [
    {
        pattern: { regex: /data-testid="my-cart_product_price".*?<\/div>/, flags: "gis" },
        replacement: function (found) {
            let cart = found.match(/>\$(\d+\.\d\d)</);
            if (cart) {
                TLT.logCustomEvent("client side hit", {
                    description: "cart value",
                    url: window.location,
                    match: cart[1]
                });
            }
            return (match+' now');
        }
    }
];

// a sample privacy rule to supplement the data in a click/change json interaction with related data from another node
// uses a relative position on the page using JavaScript methods
// the result is an extra attribute 'data' in the info sent by tealeaf with exactly the context needed (e.g. product sku/title)
// can be repeated for multiple data points needed
var privacyRuleExample = {
    targets: [
        {
            id: "[[\"collection-container\"],[\"div\",0],[\"div\",3],[\"div\",1],[\"div\",0],[\"button\",0]]",
            idType: -2
        },
    ],
    maskType: 4,
    maskFunction: function (value) {
        return 'rule matched';
    },
    maskAttributes: function (id, attr) {
        attr['innerText'] = "add to whatever";
        attr['data'] = TLT.getService("browserBase").getNodeFromID(id, '-2')?.parentNode.parentNode.parentNode.parentNode.parentNode?.childNodes[0]?.innerText;
        return attr;
    },
};