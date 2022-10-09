var myExtObject = (function() {
  return {
    //custom wrtp event send request
  sendCustomEvent: function(jsonStr,authKey){
    ibm_ubx.sendEvent(jsonStr,ibm_ubx.daHost,authKey,"WRTP Client"); 
     },
       
    ibmproductView: function(productName, productPrice, brand) {
      ga('ec:addProduct', {
        id: '57b9d',
        name: productName,
        price: productPrice,
        brand: brand,
        category: 'T-Shirts',
        variant: 'red',
        dimension1: 'M',
        quantity: 1
      });
      ga('ec:setAction', 'detail');
    },
    wroteReview: function() {
      ga('send', 'event', 'Ecommerce', 'wroteReview', { nonInteraction: 1 });
    },
    providedRating: function() {
      ga('send', 'event', 'Ecommerce', 'providedRating', { nonInteraction: 1 });
    }
  };
})(myExtObject || {});

function getCookieValue(a) {
  var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
  return b ? b.pop() : '';
}
