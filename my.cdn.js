<script src="https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js"></script>
<script src="https://cdn.goacoustic.com/tealeaf/latest/tealeaf.min.js"></script>>

<script>
    /*! ---------- frictionSigns ---------- */
    TLT.addModule("frictionSigns",(function(t){"use strict";var e,i,n,o,s,l,a;function c(t,e){for(var i=0;i<e.length;i++)if("string"==typeof e[i]?-1!=t.indexOf(e[i]):t.match(e[i]))return!0;return!1}function r(t){(n=i.rageclick||{enable:!0}).enable&&(n.clicks=n.clicks||4,n.distance=n.distance||20,n.time=n.time||800,n.blocklist=n.blocklist||[],n.count=0,n.lastTime=0,e=!0)}function d(e){if("unload"!==e.type){if(!c(n.blocklist,e.target.id)){if(0===n.count||Math.abs(e.position.x-n.x)>n.distance||Math.abs(e.position.y-n.y)>n.distance||e.timestamp-n.lastTime>n.time)return n.x=e.position.x,n.y=e.position.y,n.count=1,void(n.lastTime=e.timestamp);n.count++,n.x=e.position.x,n.y=e.position.y,n.count===n.clicks&&(console.debug("frictionSigns: rage clicks seen"),t.post({type:5,customEvent:{name:"rageclick",data:{description:"Rage click - "+e.target.id,value:{target:e.target.id}}}}),n.count=0)}}else n.count=0}function u(t){(o=i.deadclick||{enable:!0}).enable&&(o.time=o.time||2e3,o.blocklist=o.blocklist||[],e=!0)}function m(e){if("click"===e.type){if("input"===e.target.type&&"button"!==e.target.subType||"select"===e.target.type||"label"===e.target.type)return;if(c(o.blocklist,e.target.id))return;var i=!0,n=e.target.id,s=new MutationObserver((function(){i=!1,s.disconnect()}));return s.observe(document.body,{subtree:!0,childList:!0,attributeFilter:["style","class"]}),void setTimeout((function e(){i&&(console.debug("frictionSigns: dead click seen"),t.post({type:5,customEvent:{name:"deadclick",data:{description:"Dead click - "+n,value:{target:n}}}}))}),o.time)}}function p(t){(s=i.errorclick||{enable:!0}).enable&&(s.time=s.time||200,s.blocklist=s.blocklist||[],s.target=null,s.clickTime=0,e=!0)}function g(e){if("click"===e.type)return s.target=e.target.id,void(s.clickTime=e.timestamp);if("error"!==e.type)"unload"===e.type&&(s.target=null);else{if(c(s.blocklist,e.target.id))return;if(s.target&&e.nativeEvent.message){if(e.timestamp-s.clickTime<s.time)return console.debug("frictionSigns: error click seen"),void t.post({type:5,customEvent:{name:"errorclick",data:{description:"Error click - "+s.target,value:{target:s.target,url:e.nativeEvent.filename,line:e.nativeEvent.lineno,description:e.nativeEvent.message}}}});s.target=null}}}function v(t){(l=i.excessscroll||{enable:!0}).enable&&(l.scale=l.scale||2.4,l.blocklist=l.blocklist||[],l.distance=0,l.lastpos=0,e=!0)}function f(e){if(!c(l.blocklist,e.target.id))return"scroll"===e.type?(l.distance+=Math.abs(window.scrollY-l.lastpos),l.lastpos=window.scrollY,void(l.distance>document.body.scrollHeight*l.scale&&(console.debug("frictionSigns: excess scroll seen"),t.post({type:5,customEvent:{name:"excessscroll",data:{description:"Excess scrolling",value:{distance:l.distance,pageheight:document.body.scrollHeight,viewport:window.visualViewport&&window.visualViewport.height?window.visualViewport.height:0}}}}),l.distance=0))):"orientationchange"===e.type?(l.distance=window.scrollY,void(l.lastpos=window.scrollY)):void("unload"===e.type&&(l.distance=0,l.lastpos=0))}function b(t){(a=i.thrashing||{enable:!0}).enable&&(a.time=a.time||4e3,a.blocklist=a.blocklist||[],a.threshold=10*Math.PI,a.moves=0,a.x=0,a.y=0,a.lastDirection=0,a.total=0,a.seen=[],e=!0)}function y(e){if(!c(l.blocklist,e.target.id))if("mousemove"!==e.type)"unload"===e.type&&(a.seen=[],a.total=0,a.moves=0,a.x=0,a.y=0);else{if(a.x+=e.nativeEvent.movementX,a.y+=e.nativeEvent.movementY,a.moves++,a.moves<10)return;var i=Math.atan2(a.y,a.x);a.moves=0,a.x=0,a.y=0;var n=a.seen.length>0?Math.abs((i-a.lastDirection)%Math.PI):0;for(a.lastDirection=i,a.total+=n,a.seen.push({time:e.timestamp,delta:n});a.seen.length>1&&e.timestamp-a.seen[0].time>a.time;)a.total-=a.seen[0].delta,a.seen.shift();a.total>a.threshold&&(console.debug("frictionSigns: thrashing seen"),t.post({type:5,customEvent:{name:"thrashing",data:{description:"Thrashing pointer",value:{amount:a.total}}}}),a.seen=[],a.total=0)}}return{init:function(){e=!1,i=t.getConfig(),r(),u(),p(),v(),b()},destroy:function(){e=!1},onevent:function(t){if("object"==typeof t&&t.type&&e){if("click"===t.type)return d(t),m(t),void g(t);if("error"!==t.type)if("scroll"!==t.type&&"orientationchange"!==t.type){if("mousemove"!==t.type)return"unload"===t.type?(d(t),m(t),g(t),f(t),void y(t)):void 0;y(t)}else f(t);else g(t)}},version:"1.0"}}));
    
    /*! ---------- config ---------- */
    const config = TLT.getDefaultConfig();

    config.core.buildNote = "stu 2023.08.aa";

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
    TLT.initLibAdv(appKey, postUrl, config, true, true, true, true, true); // Pako, Hammer, SafariPolyfill, AjaxListener, RestartTLTforSPA

</script>