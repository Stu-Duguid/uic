/*! ---------- webvitals included from cdn or directly here ---------- */

/*! ---------- tealeaf included from cdn or directly here ---------- */

/*! ---------- frictionSigns ---------- */
TLT.addModule("frictionSigns",function(t){"use strict";function e(t,e){for(var i=0;i<e.length;i++)if("string"==typeof e[i]?-1!=t.indexOf(e[i]):t.match(e[i]))return!0;return!1}function i(t){g=p.rageclick||{enable:!0},g.enable&&(g.clicks=g.clicks||4,g.distance=g.distance||20,g.time=g.time||800,g.blocklist=g.blocklist||[],g.count=0,g.lastTime=0,m=!0)}function n(i){if("unload"!==i.type){if(!e(g.blocklist,i.target.id)){if(0===g.count||Math.abs(i.position.x-g.x)>g.distance||Math.abs(i.position.y-g.y)>g.distance||i.timestamp-g.lastTime>g.time)return g.x=i.position.x,g.y=i.position.y,g.count=1,void(g.lastTime=i.timestamp);g.count++,g.x=i.position.x,g.y=i.position.y,g.count===g.clicks&&(console.debug("frictionSigns: rage clicks seen"),t.post({type:5,customEvent:{name:"rageclick",data:{description:"Rage click - "+i.target.id,value:{target:i.target.id}}}}),g.count=0)}}else g.count=0}function o(t){v=p.deadclick||{enable:!0},v.enable&&(v.time=v.time||2e3,v.blocklist=v.blocklist||[],m=!0)}function s(i){if("click"===i.type){if("input"===i.target.type&&"button"!==i.target.subType||"select"===i.target.type||"label"===i.target.type)return;if("a"===i.target.type&&"_blank"===i.target.target)return;if(e(v.blocklist,i.target.id))return;var n=!0,o=i.target.id,s=new MutationObserver(function(){n=!1,s.disconnect()});return s.observe(document.body,{subtree:!0,childList:!0,attributeFilter:["style","class"]}),void setTimeout(function(){n&&(console.debug("frictionSigns: dead click seen"),t.post({type:5,customEvent:{name:"deadclick",data:{description:"Dead click - "+o,value:{target:o}}}}))},v.time)}}function a(t){f=p.errorclick||{enable:!0},f.enable&&(f.time=f.time||200,f.blocklist=f.blocklist||[],f.target=null,f.clickTime=0,m=!0)}function l(i){if("click"===i.type)return f.target=i.target.id,void(f.clickTime=i.timestamp);if("error"!==i.type)"unload"===i.type&&(f.target=null);else{if(e(f.blocklist,i.target.id))return;if(f.target&&i.nativeEvent.message){if(i.timestamp-f.clickTime<f.time)return console.debug("frictionSigns: error click seen"),void t.post({type:5,customEvent:{name:"errorclick",data:{description:"Error click - "+f.target,value:{target:f.target,url:i.nativeEvent.filename,line:i.nativeEvent.lineno,description:i.nativeEvent.message}}}});f.target=null}}}function c(t){b=p.excessscroll||{enable:!0},b.enable&&(b.scale=b.scale||2.4,b.blocklist=b.blocklist||[],b.distance=0,b.lastpos=0,m=!0)}function r(i){if(!e(b.blocklist,i.target.id))return"scroll"===i.type?(b.distance+=Math.abs(window.scrollY-b.lastpos),b.lastpos=window.scrollY,void(0!==document.body.scrollHeight&&b.distance>document.body.scrollHeight*b.scale&&(console.debug("frictionSigns: excess scroll seen"),t.post({type:5,customEvent:{name:"excessscroll",data:{description:"Excess scrolling",value:{distance:b.distance,pageheight:document.body.scrollHeight,viewport:window.visualViewport&&window.visualViewport.height?window.visualViewport.height:0}}}}),b.distance=0))):"orientationchange"===i.type?(b.distance=window.scrollY,void(b.lastpos=window.scrollY)):void("unload"===i.type&&(b.distance=0,b.lastpos=0))}function d(t){y=p.thrashing||{enable:!0},y.enable&&(y.time=y.time||4e3,y.blocklist=y.blocklist||[],y.threshold=10*Math.PI,y.moves=0,y.x=0,y.y=0,y.lastDirection=0,y.total=0,y.seen=[],m=!0)}function u(i){if(!e(b.blocklist,i.target.id))if("mousemove"!==i.type)"unload"===i.type&&(y.seen=[],y.total=0,y.moves=0,y.x=0,y.y=0);else{if(y.x+=i.nativeEvent.movementX,y.y+=i.nativeEvent.movementY,y.moves++,y.moves<10)return;var n=Math.atan2(y.y,y.x);y.moves=0,y.x=0,y.y=0;var o=y.seen.length>0?Math.abs((n-y.lastDirection)%Math.PI):0;for(y.lastDirection=n,y.total+=o,y.seen.push({time:i.timestamp,delta:o});y.seen.length>1&&i.timestamp-y.seen[0].time>y.time;)y.total-=y.seen[0].delta,y.seen.shift();y.total>y.threshold&&(console.debug("frictionSigns: thrashing seen"),t.post({type:5,customEvent:{name:"thrashing",data:{description:"Thrashing pointer",value:{amount:y.total}}}}),y.seen=[],y.total=0)}}var m,p,g,v,f,b,y;return{init:function(){m=!1,p=t.getConfig(),i(),o(),a(),c(),d()},destroy:function(){m=!1},onevent:function(t){if("object"==typeof t&&t.type&&m){if("click"===t.type)return n(t),s(t),void l(t);if("error"!==t.type)if("scroll"!==t.type&&"orientationchange"!==t.type){if("mousemove"!==t.type)return"unload"===t.type?(n(t),s(t),l(t),r(t),void u(t)):void 0;u(t)}else r(t);else l(t)}},version:"1.0"}});

/*! ---------- config ---------- */
const config = TLT.getDefaultConfig();

config.core.buildNote = "stu 2023.12.aa";

// config.core.modules.dataLayer.enabled = true;

config.core.modules.frictionSigns = {
	events: [
		{ name: "change", attachToShadows: true, recurseFrames: true },
		{ name: "click", recurseFrames: true },
		{ name: "unload", target: window },
		{ name: "scroll", target: window },
		{ name: "mousemove", recurseFrames: true },
		{ name: "orientationchange", target: window },
		{ name: "error", target: window },
	]
};

// config.services.message.privacy = [];
config.services.message.privacyPatterns = []; // remove defaults

var appKey = "2b5f323f11804851beb8617eee293042";
const postUrl = "https://lib-ap-1.brilliantcollector.com/collector/collectorPost";

// initialize Tealeaf
TLT.initLibAdv(appKey, postUrl, config, true, false, true, true, true); // addPako, addHammer, addSafariPolyfill, addAjaxListener, addRestartTLTforSPA
