
  (function () {
    var destDomain = "service.securehost";
    var sessionCookieName = 'TLTSID';

    // check if in dest domain so not needed
    if (location.hostname.indexOf(destDomain) !== -1) {
      return;
    }
    // get TLTSID cookie
    var sessionCookieValue = TLT.utils.getCookieValue(sessionCookieName);
    
    if (sessionCookieValue === null) {
      console.debug("addCookieToLink: no cookie");
      return;
    }
    // add TLTSID to outgoing links in the domain service.securequote

    function addCookieToLink(e) {
      e.target.href += "&"+sessionCookieName+"="+sessionCookieValue;
    }
    
    var outAnchors = document.querySelectorAll("a[href*='"+destDomain+"']");
    
    for (var i=0; i<outAnchors.length; i++) {
      outAnchors[i].addEventListener('click', addCookieToLink);
    }
  })();

