
function setCookieFromGA () {
	/* global TLT */
	const sessionCookieName = 'TLTSID';
	const gaCookieName = 'GA_clientId';
	const secureTLTSID = true;
	var cookie, zeros;

	// get TLTSID cookie
	if (TLT.utils.getCookieValue(sessionCookieName) !== null) {
		return;
	}
	// get _ga cookie value
	if ((cookie = TLT.utils.getCookieValue(gaCookieName)) === null) {
		return;
	}
	// convert _ga format to 32 characters
	cookie = cookie.replace(/[a-z\.-]/gi, '0');
	zeros = 32 - cookie.length;
	if (zeros > 0) {
		cookie = Array(zeros+1).join('0') + cookie;
	}
	// set TLTSID cookie from _ga
	TLT.utils.setCookie(sessionCookieName, cookie, undefined, undefined, undefined, secureTLTSID);
};