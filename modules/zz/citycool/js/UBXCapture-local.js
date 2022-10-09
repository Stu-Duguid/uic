/*
 * Licensed Materials - Property of IBM
 *
 * $$Id$$
 * $$Revision$$
 * $$LastChangedBy$$
 * $$LastChangedDate$$
 *
 * (C) Copyright IBM Corporation ${year}. U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP ScheduleContract with IBM Corp.
 */

if (typeof(ubxCapture)=="undefined"){ubxCapture={};}
ubxCapture.providers=[];
ubxCapture.reqQueue=[];
ubxCapture.kaTimeout=ubxCapture.kaTimeout || 600;
ubxCapture.keepAliveCount=false;
ubxCapture.cSessionTimeout= ubxCapture.cSessionTimeout || 1800;
ubxCapture.cid="66666666";

//Allow override of 30 minute timeout for session id
if (!ubxCapture.timeout || ubxCapture.timeout == null) {
	ubxCapture.timeout = 30;
}

ubxCapture.setGlobalIDCookie=function (value,expires){
	if (!expires){
		var a = new Date();
		a.setTime(a.getTime() + (473040000));
		minutes=a.toGMTString()
	} else {
		minutes=expires;
	}
	if (!value){
		function b(f) {
			var e = Math.random();
			if (e == 0) {
				e = Math.random()
			}
			return e.toString().substr(2, f)
		}
		var c = b(2) + b(10) + new Date().getTime()
				, a = c.length
				, d = 23;
		if (a < d) {
			c = c + c.substr(a - (d - a))
		}
		if (a > d) {
			c = c.substr(0, d)
		}
		ubxCapture.createCookie("WCXUID",c,minutes);//0.4539366183189062
	} else {
		ubxCapture.createCookie("WCXUID",value,minutes);
	}
}
function createCORSRequest(method, url) {
	var xhr = new XMLHttpRequest();
	if ("withCredentials" in xhr) {
		// XHR for Chrome/Firefox/Opera/Safari.
		xhr.open(method, url, false);
	} else if (typeof XDomainRequest != "undefined") {
		// XDomainRequest for IE.
		xhr = new XDomainRequest();
		xhr.open(method, url,false);
	} else {
		// CORS not supported.
		xhr = null;
	}
	return xhr;
}

// Helper method to parse the title tag from the response.
function getTitle(text) {
	return text.match('<title>(.*)?</title>')[1];
}

ubxCapture.createCookie=function (name,value,minutes,path) {
	var expires = "",cPath;
	if (path){
		cPath=";path="+path;
	} else {
		cPath=";path=/";
	}
	if (!minutes){
		expires="";
	} else {
		if (minutes>=0) {
			var date = new Date();
			date.setTime(date.getTime() + (minutes*60*1000));
			expires = "; expires=" + date.toUTCString();
		} else {
			expires=-1;
		}
	}

	document.cookie = name + "=" + value + expires + cPath;
	console.log(name+" cookie created");
};

ubxCapture.readCookie=function (name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) {
			console.log(name+" cookie read");
			return c.substring(nameEQ.length,c.length);
		}
	}
	console.log(name+" cookie not found");
	return null;
};

ubxCapture.eraseCookie=function (name) {
	document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	console.log(name+" cookie deleted");
};

ubxCapture.loadScript=function (url, sLocation,callback){

	var oScript = document.createElement("script")
	oScript.type = "text/javascript";

	if (oScript.readyState){  //IE
		oScript.onreadystatechange = function(){
			if (oScript.readyState == "loaded" ||
					oScript.readyState == "complete"){
				oScript.onreadystatechange = null;
				if (typeof(callback)!="undefined"){
					callback();
				}
			}
		};
	} else {  //Others
		oScript.onload = function(){
			if (typeof(callback)!="undefined"){
				callback();
			}
		};
	}
	url=url.replace(/^https?\:\/\//i, "");
	url=url.replace(/\/\//g,"");
	url="//"+url;
	oScript.src = url;
	document.getElementsByTagName(sLocation)[0].appendChild(oScript);
}
ubxCapture.calcSessionID=function (digits) {
    if (!digits){digits=20};
    var
        cSessionTime = new Date().getTime(),
        cSessionExpTime = ""+(cSessionTime +ubxCapture.cSessionTimeout*1000),
        cTimeoutStr = ""+cSessionTime,
        sPad=(Math.random()*100000000000000000).toString().slice(0,digits-cTimeoutStr.length);
    cTimeoutStr=sPad+cTimeoutStr;
    return cTimeoutStr = cTimeoutStr.substring(0, digits);
}
ubxCapture.reSetSession=function(){
	var path="/",pl,url,cmTimeoutStr,sCid;
	if (typeof(cm_ClientID)!="undefined"){sCid=cm_ClientID} else {sCid=ubxCapture.cid;}
    value="0000"+ubxCapture.calcSessionID()+sCid;

	ubxCapture.createCookie("WCXSID",value,null,"/");
	ubxCapture.eraseCookie("TLTSID");
	if (typeof(TLT)!="undefined"){
		if (typeof(TLT.init)!="undefined"){
			TLT.utils.setCookie("TLTSID", value);
			TLT.init;
		}
	}
	ubxCapture.createCookie("WCXSID_expiry",Date.now(),null,"/");
}
ubxCapture.updateExpiry=function(){
	var pl,url,expValue,kaValue;
    expValue=Date.now()+ubxCapture.cSessionTimeout;
	if (ubxCapture.readCookie("WCXSID_expiry")){
		if (ubxCapture.readCookie("WCXSID_expiry")>expValue){
			ubxCapture.reSetSession();
			return;
		}
	}
	ubxCapture.createCookie("WCXSID_expiry",Date.now(),null,"/");
}
ubxCapture.fireKeepAlive=function(provider) {
	if ((typeof(ubxCapture.providers) != "undefined") && ubxCapture.readCookie("WCXSID") && ubxCapture.readCookie("WCXSID_expiry")) {
		//ubxCapture.keepAliveCount = true;
		expValue=Date.now()+ubxCapture.kaTimeout;
		if (ubxCapture.readCookie("WCXSID_expiry")>expValue){
			for (pl = 0; pl < ubxCapture.providers.length; pl++) {
				if (provider && provider!=ubxCapture.providers[pl].provide){continue;}
				kaImage = new Image;
				url = ibm_ubx.daHost.replace(/^https?\:\/\//i, "");
				url = url.replace(/\/\//g, "");
				url = "//" + url;
				kaImage.src = url + "/cm?tid=99&ci=" + ubxCapture.cid + "&namespace=DART&version=1&channel=Web&provider=" + ubxCapture.providers[pl].provider + "&authkey=" + ubxCapture.providers[pl].authKey + "&code0=$SESSIONOPEN$&attribute0=interactionId-_-" + ubxCapture.readCookie("WCXSID") + "-_-string&cjsid=" + ubxCapture.readCookie("WCXSID").substr(4, 20) + "&cjen=1&rn=" + Math.floor(Math.random() * 9000000000000);
			}
		}
	}
}
ubxCapture.runSDK=function(){  //loads SDK code per ubxCapture JSON object on client CDN folder
    if (!ubxCapture.readCookie("WCXUID")){
        ubxCapture.setGlobalIDCookie();
    }
	//get config
	if (typeof(ubxCapture.enabledOfferings)=="object"){
		if (typeof(ubxCapture.enabledOfferings.DA)=="object"){
			var cmKey;
			Object.keys(ubxCapture.enabledOfferings.DA).forEach(function(key,index) {  //loop through DA instances
				if (ubxCapture.enabledOfferings.DA[key].activated){
					if (typeof(ubxCapture.offerings)!="undefined"){
						if (ubxCapture.offerings.indexOf("DA")==-1){
							ubxCapture.offerings+="DA|";
						}
					} else {
						ubxCapture.offerings="DA|";
					}
					if (typeof(cmcid)=="string" && cmcid==ubxCapture.enabledOfferings.DA[key].config.cid){  //if DA cid value set in cmcid, find matching instance and use that
						cmKey=key;
					} else {   //take first enabled instance and use that one
						//if cmKey is null, set cmKey.  That way only the first instance will be used
						if (cmKey==null){
							cmKey=key;
						}
					}
				}
			})

			if (cmKey!=null){

				ubxCapture.cid=ubxCapture.enabledOfferings.DA[cmKey].config.cid;

                if (!ubxCapture.readCookie("WCXSID")){
                    ubxCapture.reSetSession();
                }
				window.cm_HOST = ubxCapture.enabledOfferings.DA[cmKey].config.dcd;
				window.cm_JSFEnabled=ubxCapture.enabledOfferings.DA[cmKey].config.dcm;

				if (ubxCapture.enabledOfferings.DA[cmKey].config.sdkURL.indexOf("htt")<0 && ubxCapture.enabledOfferings.DA[cmKey].config.sdkURL.indexOf("//")<0){
					document.write("<script type='text/javascript' src='//"+ubxCapture.enabledOfferings.DA[cmKey].config.sdkURL+"'><\/script>");
				} else {
					document.write("<script type='text/javascript' src='"+ubxCapture.enabledOfferings.DA[cmKey].config.sdkURL+"'><\/script>");
				}

				document.write("<script>cmSetClientID('"+ubxCapture.enabledOfferings.DA[cmKey].config.cid+"',"+ubxCapture.enabledOfferings.DA[cmKey].config.dcm+",'"+ubxCapture.enabledOfferings.DA[cmKey].config.dcd+"',location.host);</scri"+"pt>");
				window.cm_ClientID=ubxCapture.enabledOfferings.DA[cmKey].config.cid;
			}
		} else {
			if (!ubxCapture.readCookie("WCXSID")){
				ubxCapture.reSetSession();
			}
		}

		if (typeof(ubxCapture.enabledOfferings.Tealeaf)=="object"){
			if (ubxCapture.readCookie("TLTSID")){
				if (ubxCapture.readCookie("WCXSID")!=ubxCapture.readCookie("TLTSID")){
					ubxCapture.eraseCookie("TLTSID");
				}
			}
			Object.keys(ubxCapture.enabledOfferings.Tealeaf).forEach(
					function(key,index) {
						if (ubxCapture.enabledOfferings.Tealeaf[key].activated){
							ubxCapture.loadScript(ubxCapture.enabledOfferings.Tealeaf[key].config.sdkURL,"head");
							if (typeof(ubxCapture.offerings)!="undefined"){
								if (ubxCapture.offerings.indexOf("TL")==-1){
									ubxCapture.offerings+="TL|";
								}
							} else {
								ubxCapture.offerings="TL|";
							}
						}
					});
		}
		if (typeof(ubxCapture.enabledOfferings.UBXIdSync)=="object"){
			Object.keys(ubxCapture.enabledOfferings.UBXIdSync).forEach(
					function(key,index) {
						if (ubxCapture.enabledOfferings.UBXIdSync[key].activated){
							ubxCapture.loadScript(ubxCapture.enabledOfferings.UBXIdSync[key].config.sdkURL,"head",function(){ibm_ubx.idSync.enableUBXIdSync(ubxCapture.enabledOfferings.UBXIdSync[key].config)});
							if (typeof(ubxCapture.offerings)!="undefined"){
								if (ubxCapture.offerings.indexOf("ID")==-1){
									ubxCapture.offerings+="ID|";
								}
							} else {
								ubxCapture.offerings="ID|";
							}
						} else {
							ubxCapture.ubxIntCheck=0;
							var ubxChecker=setInterval(function(){
								ubxCapture.ubxIntCheck++;
								if (ubxCapture.ubxIntCheck>20){clearInterval(ubxChecker);}
								ubxCapture.loadScript(ubxCapture.enabledOfferings.UBXIdSync[key].config.sdkURL,"head",function(){ibm_ubx.idSync.enableUBXIdSync(ubxCapture.enabledOfferings.UBXIdSync[key].config)});
								if (typeof(ubxCapture.offerings)!="undefined"){
									if (ubxCapture.offerings.indexOf("ID")==-1){
										ubxCapture.offerings+="ID|";
									}
								} else {
									ubxCapture.offerings="ID|";
								}
								if (typeof(ibm_ubx.idSync.enableUBXIdSync)=="function"){
									clearInterval(ubxChecker);
								}

							},300);
						}
					});
		}

		if (typeof(ubxCapture.enabledOfferings.UBXEvent)=="object"){
			Object.keys(ubxCapture.enabledOfferings.UBXEvent).forEach(
					function(key,index) {
						if (ubxCapture.enabledOfferings.UBXEvent[key].activated){
							if (typeof(ibm_ubx)=="undefined"){ibm_ubx={};}
							//Step 1  To revert to force payloads to be sent by POST directly to UBX uncomment the line below
							//ibm_ubx.requestType="POST";
							//Step 2  To revert to force payloads to be sent by POST directly to UBX comment out the line below
							ibm_ubx.requestType=ubxCapture.enabledOfferings.UBXEvent[key].config.requestType;
							ibm_ubx.daHost=ubxCapture.enabledOfferings.UBXEvent[key].config.ubxHostName;
							if (ubxCapture.enabledOfferings.UBXEvent[key].config.source == "Google Analytics"){
								google_ubx = {};
								google_ubx.host = ubxCapture.enabledOfferings.UBXEvent[key].config.ubxHostName;
								google_ubx.authKey =ubxCapture.enabledOfferings.UBXEvent[key].config.ubxAuthKey;
								ubxCapture.providers.push({provider:"GOOGLEANALYTICS",authKey:google_ubx.authKey});
								ubxCapture.fireKeepAlive("GOOGLEANALYTICS");
								if (typeof(ubxCapture.offerings)!="undefined"){
									if (ubxCapture.offerings.indexOf("GA")==-1){
										ubxCapture.offerings+="GA|";
									}
								} else {
									ubxCapture.offerings="GA|";
								}
							}
							if (ubxCapture.enabledOfferings.UBXEvent[key].config.source == "Adobe Analytics"){
								adobe_ubx = {};
								adobe_ubx.host = ubxCapture.enabledOfferings.UBXEvent[key].config.ubxHostName;
								adobe_ubx.authKey =ubxCapture.enabledOfferings.UBXEvent[key].config.ubxAuthKey;
								ubxCapture.providers.push({provider:"ADOBEANALYTICS",authKey:adobe_ubx.authKey});
								ubxCapture.fireKeepAlive("ADOBEANALYTICS");
								if (typeof(ubxCapture.offerings)!="undefined"){
									if (ubxCapture.offerings.indexOf("AA")==-1){
										ubxCapture.offerings+="AA|";
									}
								} else {
									ubxCapture.offerings="AA|";
								}
							}
							//first check to see if UBX.js is already loaded by another event
                            if (typeof(ubxCapture.ubxLoaded)=="undefined"){
								//ubx.js has not been loaded so load it now
								ubxCapture.loadScript(ubxCapture.enabledOfferings.UBXEvent[key].config.sdkURL,"head");
								ubxCapture.ubxLoaded=ubxCapture.enabledOfferings.UBXEvent[key].config.sdkURL;
							}
							ubxCapture.loadScript(ubxCapture.enabledOfferings.UBXEvent[key].config.mapperFileURL,"head");
						}
					});
		}
        if (typeof(ubxCapture.enabledOfferings.UBXWRTP)=="object"){
            Object.keys(ubxCapture.enabledOfferings.UBXWRTP).forEach(
                function(key,index) {
                    if (ubxCapture.enabledOfferings.UBXWRTP[key].activated){
                        if (typeof(ubxCapture.ubxLoaded)=="undefined"){
                            //ubx.js has not been loaded so load it now
                            ubxCapture.loadScript(ubxCapture.enabledOfferings.UBXWRTP[key].config.ubxEventSDKURL,"head");
                            ubxCapture.ubxLoaded=ubxCapture.enabledOfferings.UBXWRTP[key].config.ubxEventSDKURL;
                        }
                        if (typeof(ubxCapture.wrtpLoaded)=="undefined"){
							ubxCapture.loadScript(ubxCapture.enabledOfferings.UBXWRTP[key].config.sdkURL = "http://localhost:8080/js/wrtp-ole.umd.js", "head");
							ubxCapture.wrtpLoaded=true;
                        }
                    }
                });
        }
	}
};
ubxCapture.setID=function(cid) {

	var url = '//commercelibs.ibm.com/config/'+cid+'/'+cid+'.json';

	var xhr = createCORSRequest('GET', url);
	if (!xhr) {
		console.warning('CORS not supported');
		return;
	}
	// Response handlers.
	xhr.onload = function() {
		var text = xhr.responseText;
		try {
			ubxCapture.enabledOfferings=JSON.parse(text);
		}
		catch(e){
			console.error("Check Client ID, JSON not found.");
			return false;
		}

		var title = "later"; //getTitle(text);
		console.log('JSON read successfullly');
		ubxCapture.runSDK();
	};

	xhr.onerror = function() {
		console.error('Woops, there was an error making the request.');
	};

	xhr.send();
};
