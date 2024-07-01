// function to log to Tealeaf
// - includes logic to wait for init of Tealeaf

function sendTealeafData(description, data) {
    if (window.TLT && window.TLT.isInitialized()) {
        window.TLT.logCustomEvent(description, data);
    }
    else {
      setTimeout(sendTealeafData, 200);
    }
}

// example of add to cart logging

sendTealeafData("addToCart",
    {
        // required
        description: "Add to Cart",
        productId: "XYZ1234",
        productName: "Pocket Vac",
        quantity: "1",
        price: "59.99",
        // optional
        currency: "AUD",
        category: "Cleaning",
        productURL: "https://www.some.com.au/products/pocket-vac?nosto=home-nosto-1-fallback-nosto-1",
        imageURL: "https://prod.2.amazonaws.com/productGroup/1846/Pocket_Vac_Configurator.jpg",
        size: "",
        colour: ""
    }
);

// example of order logging

sendTealeafData("orderConfirmed",
    {
        // required
        description: "Order Confirmation",
        orderId: "ABC0099",
        orderTotal: "64.99",
        // optional
        currency: "AUD",
        orderSubtotal: "59.99",
        shipping: "5.00",
        discount: "0.00",
        promo: "",
        tax: "5.99"
    }
);

// examples of identity logging

sendTealeafData("identification",
    {
        // required
        description: "Identification",
        identifierType: "email", // email, sms/phone, userId
        identifierValue: "me@gmail.com"
    }
);
