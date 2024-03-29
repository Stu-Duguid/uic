/*
	====================================================================
	This Acoustic Experience Analytics (Tealeaf) 6.0.0 UICapture custom template includes the following:
	====================================================================

	Core Changes:
		none

	Standard and Custom Modules:
		Standard Ajax Listener module v1.2.2 (https://github.com/ibm-watson-cxa/UICaptureSDK-Modules/)
		Standard Mouse Movement
		Custom DigitalData Logging (visDetect, iOS<12.2 TLT.flushAll();)
		Custom SSL Protocol Violation Module (11/20/2020)

	Custom Queue Manipulators:
		Custom Third Party Data Logging (6/20/2019)

	Custom Configuration Manipulators:
		Synchronous on UNLOAD by URL
		Alternate DOM triggers by URL
		Configure tlAppKey by Domain
		Alternate IE Configurations
		Alternate Chrome Configs (2021/02/09)
		Disable SDK by User Agent
		Disable Beacon & tune Queue settings for Apple iOS<12.2

	Custom Modules:
		Not in use/removed 2020/02/09:  Custom Mutation DOM capture
		- replaced by https://developer.goacoustic.com/acoustic-exp-analytics/docs/configuring-uic-for-lazy-load
		Custom Tab monitoring v1.3 (8/19/2019)
		Custom Client Side performance monitor V5 (8/19/2019)
		
	====================================================================
	Build Date: February 9, 2021
	1) update UIC core to v6.0.0
	2) update ajaxlistener from 1.2.1 to 1.2.2 (still commented out per EF-14415)
	3) update Customer SSL Protocol Violation Module
	4) add Alternate Chrome Configs
	5) update delayUntil with timeout feature (still commented out)
	6) deleted legacy/unused mutationDOMCapture (replaced by delayUntil feature)
	====================================================================
*/
/*!
	pako 1.0.10 nodeca/pako with Dojo/AMD/RequireJS fix

	Copyright (C) 2014-2017 by Vitaly Puzrin and Andrei Tuputcyn

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/
// Dojo/AMD/RequireJS fix:  https://confluence.acoustic.co/display/EAS/Pako+conflict+with+some+AMD+module+loaders
!function(t){window.pako=t()}(function(){return function i(s,h,l){function o(e,t){if(!h[e]){if(!s[e]){var a="function"==typeof require&&require;if(!t&&a)return a(e,!0);if(_)return _(e,!0);var n=new Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}var r=h[e]={exports:{}};s[e][0].call(r.exports,function(t){return o(s[e][1][t]||t)},r,r.exports,i,s,h,l)}return h[e].exports}for(var _="function"==typeof require&&require,t=0;t<l.length;t++)o(l[t]);return o}({1:[function(t,e,a){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;a.assign=function(t){for(var e,a,n=Array.prototype.slice.call(arguments,1);n.length;){var r=n.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var i in r)e=r,a=i,Object.prototype.hasOwnProperty.call(e,a)&&(t[i]=r[i])}}return t},a.shrinkBuf=function(t,e){return t.length===e?t:t.subarray?t.subarray(0,e):(t.length=e,t)};var r={arraySet:function(t,e,a,n,r){if(e.subarray&&t.subarray)t.set(e.subarray(a,a+n),r);else for(var i=0;i<n;i++)t[r+i]=e[a+i]},flattenChunks:function(t){var e,a,n,r,i,s;for(e=n=0,a=t.length;e<a;e++)n+=t[e].length;for(s=new Uint8Array(n),e=r=0,a=t.length;e<a;e++)i=t[e],s.set(i,r),r+=i.length;return s}},i={arraySet:function(t,e,a,n,r){for(var i=0;i<n;i++)t[r+i]=e[a+i]},flattenChunks:function(t){return[].concat.apply([],t)}};a.setTyped=function(t){t?(a.Buf8=Uint8Array,a.Buf16=Uint16Array,a.Buf32=Int32Array,a.assign(a,r)):(a.Buf8=Array,a.Buf16=Array,a.Buf32=Array,a.assign(a,i))},a.setTyped(n)},{}],2:[function(t,e,a){"use strict";var l=t("./common"),r=!0,i=!0;try{String.fromCharCode.apply(null,[0])}catch(t){r=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(t){i=!1}for(var o=new l.Buf8(256),n=0;n<256;n++)o[n]=252<=n?6:248<=n?5:240<=n?4:224<=n?3:192<=n?2:1;function _(t,e){if(e<65534&&(t.subarray&&i||!t.subarray&&r))return String.fromCharCode.apply(null,l.shrinkBuf(t,e));for(var a="",n=0;n<e;n++)a+=String.fromCharCode(t[n]);return a}o[254]=o[254]=1,a.string2buf=function(t){var e,a,n,r,i,s=t.length,h=0;for(r=0;r<s;r++)55296==(64512&(a=t.charCodeAt(r)))&&r+1<s&&56320==(64512&(n=t.charCodeAt(r+1)))&&(a=65536+(a-55296<<10)+(n-56320),r++),h+=a<128?1:a<2048?2:a<65536?3:4;for(e=new l.Buf8(h),r=i=0;i<h;r++)55296==(64512&(a=t.charCodeAt(r)))&&r+1<s&&56320==(64512&(n=t.charCodeAt(r+1)))&&(a=65536+(a-55296<<10)+(n-56320),r++),a<128?e[i++]=a:(a<2048?e[i++]=192|a>>>6:(a<65536?e[i++]=224|a>>>12:(e[i++]=240|a>>>18,e[i++]=128|a>>>12&63),e[i++]=128|a>>>6&63),e[i++]=128|63&a);return e},a.buf2binstring=function(t){return _(t,t.length)},a.binstring2buf=function(t){for(var e=new l.Buf8(t.length),a=0,n=e.length;a<n;a++)e[a]=t.charCodeAt(a);return e},a.buf2string=function(t,e){var a,n,r,i,s=e||t.length,h=new Array(2*s);for(a=n=0;a<s;)if((r=t[a++])<128)h[n++]=r;else if(4<(i=o[r]))h[n++]=65533,a+=i-1;else{for(r&=2===i?31:3===i?15:7;1<i&&a<s;)r=r<<6|63&t[a++],i--;1<i?h[n++]=65533:r<65536?h[n++]=r:(r-=65536,h[n++]=55296|r>>10&1023,h[n++]=56320|1023&r)}return _(h,n)},a.utf8border=function(t,e){var a;for((e=e||t.length)>t.length&&(e=t.length),a=e-1;0<=a&&128==(192&t[a]);)a--;return a<0?e:0===a?e:a+o[t[a]]>e?a:e}},{"./common":1}],3:[function(t,e,a){"use strict";e.exports=function(t,e,a,n){for(var r=65535&t|0,i=t>>>16&65535|0,s=0;0!==a;){for(a-=s=2e3<a?2e3:a;i=i+(r=r+e[n++]|0)|0,--s;);r%=65521,i%=65521}return r|i<<16|0}},{}],4:[function(t,e,a){"use strict";var h=function(){for(var t,e=[],a=0;a<256;a++){t=a;for(var n=0;n<8;n++)t=1&t?3988292384^t>>>1:t>>>1;e[a]=t}return e}();e.exports=function(t,e,a,n){var r=h,i=n+a;t^=-1;for(var s=n;s<i;s++)t=t>>>8^r[255&(t^e[s])];return-1^t}},{}],5:[function(t,e,a){"use strict";var l,u=t("../utils/common"),o=t("./trees"),f=t("./adler32"),c=t("./crc32"),n=t("./messages"),_=0,d=4,p=0,g=-2,m=-1,b=4,r=2,v=8,w=9,i=286,s=30,h=19,y=2*i+1,k=15,z=3,x=258,B=x+z+1,A=42,C=113,S=1,j=2,E=3,U=4;function D(t,e){return t.msg=n[e],e}function I(t){return(t<<1)-(4<t?9:0)}function O(t){for(var e=t.length;0<=--e;)t[e]=0}function q(t){var e=t.state,a=e.pending;a>t.avail_out&&(a=t.avail_out),0!==a&&(u.arraySet(t.output,e.pending_buf,e.pending_out,a,t.next_out),t.next_out+=a,e.pending_out+=a,t.total_out+=a,t.avail_out-=a,e.pending-=a,0===e.pending&&(e.pending_out=0))}function T(t,e){o._tr_flush_block(t,0<=t.block_start?t.block_start:-1,t.strstart-t.block_start,e),t.block_start=t.strstart,q(t.strm)}function L(t,e){t.pending_buf[t.pending++]=e}function N(t,e){t.pending_buf[t.pending++]=e>>>8&255,t.pending_buf[t.pending++]=255&e}function R(t,e){var a,n,r=t.max_chain_length,i=t.strstart,s=t.prev_length,h=t.nice_match,l=t.strstart>t.w_size-B?t.strstart-(t.w_size-B):0,o=t.window,_=t.w_mask,d=t.prev,u=t.strstart+x,f=o[i+s-1],c=o[i+s];t.prev_length>=t.good_match&&(r>>=2),h>t.lookahead&&(h=t.lookahead);do{if(o[(a=e)+s]===c&&o[a+s-1]===f&&o[a]===o[i]&&o[++a]===o[i+1]){i+=2,a++;do{}while(o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&i<u);if(n=x-(u-i),i=u-x,s<n){if(t.match_start=e,h<=(s=n))break;f=o[i+s-1],c=o[i+s]}}}while((e=d[e&_])>l&&0!=--r);return s<=t.lookahead?s:t.lookahead}function H(t){var e,a,n,r,i,s,h,l,o,_,d=t.w_size;do{if(r=t.window_size-t.lookahead-t.strstart,t.strstart>=d+(d-B)){for(u.arraySet(t.window,t.window,d,d,0),t.match_start-=d,t.strstart-=d,t.block_start-=d,e=a=t.hash_size;n=t.head[--e],t.head[e]=d<=n?n-d:0,--a;);for(e=a=d;n=t.prev[--e],t.prev[e]=d<=n?n-d:0,--a;);r+=d}if(0===t.strm.avail_in)break;if(s=t.strm,h=t.window,l=t.strstart+t.lookahead,o=r,_=void 0,_=s.avail_in,o<_&&(_=o),a=0===_?0:(s.avail_in-=_,u.arraySet(h,s.input,s.next_in,_,l),1===s.state.wrap?s.adler=f(s.adler,h,_,l):2===s.state.wrap&&(s.adler=c(s.adler,h,_,l)),s.next_in+=_,s.total_in+=_,_),t.lookahead+=a,t.lookahead+t.insert>=z)for(i=t.strstart-t.insert,t.ins_h=t.window[i],t.ins_h=(t.ins_h<<t.hash_shift^t.window[i+1])&t.hash_mask;t.insert&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[i+z-1])&t.hash_mask,t.prev[i&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=i,i++,t.insert--,!(t.lookahead+t.insert<z)););}while(t.lookahead<B&&0!==t.strm.avail_in)}function F(t,e){for(var a,n;;){if(t.lookahead<B){if(H(t),t.lookahead<B&&e===_)return S;if(0===t.lookahead)break}if(a=0,t.lookahead>=z&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+z-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!==a&&t.strstart-a<=t.w_size-B&&(t.match_length=R(t,a)),t.match_length>=z)if(n=o._tr_tally(t,t.strstart-t.match_start,t.match_length-z),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=z){for(t.match_length--;t.strstart++,t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+z-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart,0!=--t.match_length;);t.strstart++}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+1])&t.hash_mask;else n=o._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(n&&(T(t,!1),0===t.strm.avail_out))return S}return t.insert=t.strstart<z-1?t.strstart:z-1,e===d?(T(t,!0),0===t.strm.avail_out?E:U):t.last_lit&&(T(t,!1),0===t.strm.avail_out)?S:j}function K(t,e){for(var a,n,r;;){if(t.lookahead<B){if(H(t),t.lookahead<B&&e===_)return S;if(0===t.lookahead)break}if(a=0,t.lookahead>=z&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+z-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=z-1,0!==a&&t.prev_length<t.max_lazy_match&&t.strstart-a<=t.w_size-B&&(t.match_length=R(t,a),t.match_length<=5&&(1===t.strategy||t.match_length===z&&4096<t.strstart-t.match_start)&&(t.match_length=z-1)),t.prev_length>=z&&t.match_length<=t.prev_length){for(r=t.strstart+t.lookahead-z,n=o._tr_tally(t,t.strstart-1-t.prev_match,t.prev_length-z),t.lookahead-=t.prev_length-1,t.prev_length-=2;++t.strstart<=r&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+z-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!=--t.prev_length;);if(t.match_available=0,t.match_length=z-1,t.strstart++,n&&(T(t,!1),0===t.strm.avail_out))return S}else if(t.match_available){if((n=o._tr_tally(t,0,t.window[t.strstart-1]))&&T(t,!1),t.strstart++,t.lookahead--,0===t.strm.avail_out)return S}else t.match_available=1,t.strstart++,t.lookahead--}return t.match_available&&(n=o._tr_tally(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<z-1?t.strstart:z-1,e===d?(T(t,!0),0===t.strm.avail_out?E:U):t.last_lit&&(T(t,!1),0===t.strm.avail_out)?S:j}function M(t,e,a,n,r){this.good_length=t,this.max_lazy=e,this.nice_length=a,this.max_chain=n,this.func=r}function P(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=v,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new u.Buf16(2*y),this.dyn_dtree=new u.Buf16(2*(2*s+1)),this.bl_tree=new u.Buf16(2*(2*h+1)),O(this.dyn_ltree),O(this.dyn_dtree),O(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new u.Buf16(k+1),this.heap=new u.Buf16(2*i+1),O(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new u.Buf16(2*i+1),O(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function G(t){var e;return t&&t.state?(t.total_in=t.total_out=0,t.data_type=r,(e=t.state).pending=0,e.pending_out=0,e.wrap<0&&(e.wrap=-e.wrap),e.status=e.wrap?A:C,t.adler=2===e.wrap?0:1,e.last_flush=_,o._tr_init(e),p):D(t,g)}function J(t){var e,a=G(t);return a===p&&((e=t.state).window_size=2*e.w_size,O(e.head),e.max_lazy_match=l[e.level].max_lazy,e.good_match=l[e.level].good_length,e.nice_match=l[e.level].nice_length,e.max_chain_length=l[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=z-1,e.match_available=0,e.ins_h=0),a}function Q(t,e,a,n,r,i){if(!t)return g;var s=1;if(e===m&&(e=6),n<0?(s=0,n=-n):15<n&&(s=2,n-=16),r<1||w<r||a!==v||n<8||15<n||e<0||9<e||i<0||b<i)return D(t,g);8===n&&(n=9);var h=new P;return(t.state=h).strm=t,h.wrap=s,h.gzhead=null,h.w_bits=n,h.w_size=1<<h.w_bits,h.w_mask=h.w_size-1,h.hash_bits=r+7,h.hash_size=1<<h.hash_bits,h.hash_mask=h.hash_size-1,h.hash_shift=~~((h.hash_bits+z-1)/z),h.window=new u.Buf8(2*h.w_size),h.head=new u.Buf16(h.hash_size),h.prev=new u.Buf16(h.w_size),h.lit_bufsize=1<<r+6,h.pending_buf_size=4*h.lit_bufsize,h.pending_buf=new u.Buf8(h.pending_buf_size),h.d_buf=1*h.lit_bufsize,h.l_buf=3*h.lit_bufsize,h.level=e,h.strategy=i,h.method=a,J(t)}l=[new M(0,0,0,0,function(t,e){var a=65535;for(a>t.pending_buf_size-5&&(a=t.pending_buf_size-5);;){if(t.lookahead<=1){if(H(t),0===t.lookahead&&e===_)return S;if(0===t.lookahead)break}t.strstart+=t.lookahead,t.lookahead=0;var n=t.block_start+a;if((0===t.strstart||t.strstart>=n)&&(t.lookahead=t.strstart-n,t.strstart=n,T(t,!1),0===t.strm.avail_out))return S;if(t.strstart-t.block_start>=t.w_size-B&&(T(t,!1),0===t.strm.avail_out))return S}return t.insert=0,e===d?(T(t,!0),0===t.strm.avail_out?E:U):(t.strstart>t.block_start&&(T(t,!1),t.strm.avail_out),S)}),new M(4,4,8,4,F),new M(4,5,16,8,F),new M(4,6,32,32,F),new M(4,4,16,16,K),new M(8,16,32,32,K),new M(8,16,128,128,K),new M(8,32,128,256,K),new M(32,128,258,1024,K),new M(32,258,258,4096,K)],a.deflateInit=function(t,e){return Q(t,e,v,15,8,0)},a.deflateInit2=Q,a.deflateReset=J,a.deflateResetKeep=G,a.deflateSetHeader=function(t,e){return t&&t.state?2!==t.state.wrap?g:(t.state.gzhead=e,p):g},a.deflate=function(t,e){var a,n,r,i;if(!t||!t.state||5<e||e<0)return t?D(t,g):g;if(n=t.state,!t.output||!t.input&&0!==t.avail_in||666===n.status&&e!==d)return D(t,0===t.avail_out?-5:g);if(n.strm=t,a=n.last_flush,n.last_flush=e,n.status===A)if(2===n.wrap)t.adler=0,L(n,31),L(n,139),L(n,8),n.gzhead?(L(n,(n.gzhead.text?1:0)+(n.gzhead.hcrc?2:0)+(n.gzhead.extra?4:0)+(n.gzhead.name?8:0)+(n.gzhead.comment?16:0)),L(n,255&n.gzhead.time),L(n,n.gzhead.time>>8&255),L(n,n.gzhead.time>>16&255),L(n,n.gzhead.time>>24&255),L(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),L(n,255&n.gzhead.os),n.gzhead.extra&&n.gzhead.extra.length&&(L(n,255&n.gzhead.extra.length),L(n,n.gzhead.extra.length>>8&255)),n.gzhead.hcrc&&(t.adler=c(t.adler,n.pending_buf,n.pending,0)),n.gzindex=0,n.status=69):(L(n,0),L(n,0),L(n,0),L(n,0),L(n,0),L(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),L(n,3),n.status=C);else{var s=v+(n.w_bits-8<<4)<<8;s|=(2<=n.strategy||n.level<2?0:n.level<6?1:6===n.level?2:3)<<6,0!==n.strstart&&(s|=32),s+=31-s%31,n.status=C,N(n,s),0!==n.strstart&&(N(n,t.adler>>>16),N(n,65535&t.adler)),t.adler=1}if(69===n.status)if(n.gzhead.extra){for(r=n.pending;n.gzindex<(65535&n.gzhead.extra.length)&&(n.pending!==n.pending_buf_size||(n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),q(t),r=n.pending,n.pending!==n.pending_buf_size));)L(n,255&n.gzhead.extra[n.gzindex]),n.gzindex++;n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),n.gzindex===n.gzhead.extra.length&&(n.gzindex=0,n.status=73)}else n.status=73;if(73===n.status)if(n.gzhead.name){r=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),q(t),r=n.pending,n.pending===n.pending_buf_size)){i=1;break}L(n,i=n.gzindex<n.gzhead.name.length?255&n.gzhead.name.charCodeAt(n.gzindex++):0)}while(0!==i);n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),0===i&&(n.gzindex=0,n.status=91)}else n.status=91;if(91===n.status)if(n.gzhead.comment){r=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),q(t),r=n.pending,n.pending===n.pending_buf_size)){i=1;break}L(n,i=n.gzindex<n.gzhead.comment.length?255&n.gzhead.comment.charCodeAt(n.gzindex++):0)}while(0!==i);n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),0===i&&(n.status=103)}else n.status=103;if(103===n.status&&(n.gzhead.hcrc?(n.pending+2>n.pending_buf_size&&q(t),n.pending+2<=n.pending_buf_size&&(L(n,255&t.adler),L(n,t.adler>>8&255),t.adler=0,n.status=C)):n.status=C),0!==n.pending){if(q(t),0===t.avail_out)return n.last_flush=-1,p}else if(0===t.avail_in&&I(e)<=I(a)&&e!==d)return D(t,-5);if(666===n.status&&0!==t.avail_in)return D(t,-5);if(0!==t.avail_in||0!==n.lookahead||e!==_&&666!==n.status){var h=2===n.strategy?function(t,e){for(var a;;){if(0===t.lookahead&&(H(t),0===t.lookahead)){if(e===_)return S;break}if(t.match_length=0,a=o._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++,a&&(T(t,!1),0===t.strm.avail_out))return S}return t.insert=0,e===d?(T(t,!0),0===t.strm.avail_out?E:U):t.last_lit&&(T(t,!1),0===t.strm.avail_out)?S:j}(n,e):3===n.strategy?function(t,e){for(var a,n,r,i,s=t.window;;){if(t.lookahead<=x){if(H(t),t.lookahead<=x&&e===_)return S;if(0===t.lookahead)break}if(t.match_length=0,t.lookahead>=z&&0<t.strstart&&(n=s[r=t.strstart-1])===s[++r]&&n===s[++r]&&n===s[++r]){i=t.strstart+x;do{}while(n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&r<i);t.match_length=x-(i-r),t.match_length>t.lookahead&&(t.match_length=t.lookahead)}if(t.match_length>=z?(a=o._tr_tally(t,1,t.match_length-z),t.lookahead-=t.match_length,t.strstart+=t.match_length,t.match_length=0):(a=o._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++),a&&(T(t,!1),0===t.strm.avail_out))return S}return t.insert=0,e===d?(T(t,!0),0===t.strm.avail_out?E:U):t.last_lit&&(T(t,!1),0===t.strm.avail_out)?S:j}(n,e):l[n.level].func(n,e);if(h!==E&&h!==U||(n.status=666),h===S||h===E)return 0===t.avail_out&&(n.last_flush=-1),p;if(h===j&&(1===e?o._tr_align(n):5!==e&&(o._tr_stored_block(n,0,0,!1),3===e&&(O(n.head),0===n.lookahead&&(n.strstart=0,n.block_start=0,n.insert=0))),q(t),0===t.avail_out))return n.last_flush=-1,p}return e!==d?p:n.wrap<=0?1:(2===n.wrap?(L(n,255&t.adler),L(n,t.adler>>8&255),L(n,t.adler>>16&255),L(n,t.adler>>24&255),L(n,255&t.total_in),L(n,t.total_in>>8&255),L(n,t.total_in>>16&255),L(n,t.total_in>>24&255)):(N(n,t.adler>>>16),N(n,65535&t.adler)),q(t),0<n.wrap&&(n.wrap=-n.wrap),0!==n.pending?p:1)},a.deflateEnd=function(t){var e;return t&&t.state?(e=t.state.status)!==A&&69!==e&&73!==e&&91!==e&&103!==e&&e!==C&&666!==e?D(t,g):(t.state=null,e===C?D(t,-3):p):g},a.deflateSetDictionary=function(t,e){var a,n,r,i,s,h,l,o,_=e.length;if(!t||!t.state)return g;if(2===(i=(a=t.state).wrap)||1===i&&a.status!==A||a.lookahead)return g;for(1===i&&(t.adler=f(t.adler,e,_,0)),a.wrap=0,_>=a.w_size&&(0===i&&(O(a.head),a.strstart=0,a.block_start=0,a.insert=0),o=new u.Buf8(a.w_size),u.arraySet(o,e,_-a.w_size,a.w_size,0),e=o,_=a.w_size),s=t.avail_in,h=t.next_in,l=t.input,t.avail_in=_,t.next_in=0,t.input=e,H(a);a.lookahead>=z;){for(n=a.strstart,r=a.lookahead-(z-1);a.ins_h=(a.ins_h<<a.hash_shift^a.window[n+z-1])&a.hash_mask,a.prev[n&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=n,n++,--r;);a.strstart=n,a.lookahead=z-1,H(a)}return a.strstart+=a.lookahead,a.block_start=a.strstart,a.insert=a.lookahead,a.lookahead=0,a.match_length=a.prev_length=z-1,a.match_available=0,t.next_in=h,t.input=l,t.avail_in=s,a.wrap=i,p},a.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":1,"./adler32":3,"./crc32":4,"./messages":6,"./trees":7}],6:[function(t,e,a){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],7:[function(t,e,a){"use strict";var l=t("../utils/common"),h=0,o=1;function n(t){for(var e=t.length;0<=--e;)t[e]=0}var _=0,s=29,d=256,u=d+1+s,f=30,c=19,g=2*u+1,m=15,r=16,p=7,b=256,v=16,w=17,y=18,k=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],z=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],x=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],B=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],A=new Array(2*(u+2));n(A);var C=new Array(2*f);n(C);var S=new Array(512);n(S);var j=new Array(256);n(j);var E=new Array(s);n(E);var U,D,I,O=new Array(f);function q(t,e,a,n,r){this.static_tree=t,this.extra_bits=e,this.extra_base=a,this.elems=n,this.max_length=r,this.has_stree=t&&t.length}function i(t,e){this.dyn_tree=t,this.max_code=0,this.stat_desc=e}function T(t){return t<256?S[t]:S[256+(t>>>7)]}function L(t,e){t.pending_buf[t.pending++]=255&e,t.pending_buf[t.pending++]=e>>>8&255}function N(t,e,a){t.bi_valid>r-a?(t.bi_buf|=e<<t.bi_valid&65535,L(t,t.bi_buf),t.bi_buf=e>>r-t.bi_valid,t.bi_valid+=a-r):(t.bi_buf|=e<<t.bi_valid&65535,t.bi_valid+=a)}function R(t,e,a){N(t,a[2*e],a[2*e+1])}function H(t,e){for(var a=0;a|=1&t,t>>>=1,a<<=1,0<--e;);return a>>>1}function F(t,e,a){var n,r,i=new Array(m+1),s=0;for(n=1;n<=m;n++)i[n]=s=s+a[n-1]<<1;for(r=0;r<=e;r++){var h=t[2*r+1];0!==h&&(t[2*r]=H(i[h]++,h))}}function K(t){var e;for(e=0;e<u;e++)t.dyn_ltree[2*e]=0;for(e=0;e<f;e++)t.dyn_dtree[2*e]=0;for(e=0;e<c;e++)t.bl_tree[2*e]=0;t.dyn_ltree[2*b]=1,t.opt_len=t.static_len=0,t.last_lit=t.matches=0}function M(t){8<t.bi_valid?L(t,t.bi_buf):0<t.bi_valid&&(t.pending_buf[t.pending++]=t.bi_buf),t.bi_buf=0,t.bi_valid=0}function P(t,e,a,n){var r=2*e,i=2*a;return t[r]<t[i]||t[r]===t[i]&&n[e]<=n[a]}function G(t,e,a){for(var n=t.heap[a],r=a<<1;r<=t.heap_len&&(r<t.heap_len&&P(e,t.heap[r+1],t.heap[r],t.depth)&&r++,!P(e,n,t.heap[r],t.depth));)t.heap[a]=t.heap[r],a=r,r<<=1;t.heap[a]=n}function J(t,e,a){var n,r,i,s,h=0;if(0!==t.last_lit)for(;n=t.pending_buf[t.d_buf+2*h]<<8|t.pending_buf[t.d_buf+2*h+1],r=t.pending_buf[t.l_buf+h],h++,0===n?R(t,r,e):(R(t,(i=j[r])+d+1,e),0!==(s=k[i])&&N(t,r-=E[i],s),R(t,i=T(--n),a),0!==(s=z[i])&&N(t,n-=O[i],s)),h<t.last_lit;);R(t,b,e)}function Q(t,e){var a,n,r,i=e.dyn_tree,s=e.stat_desc.static_tree,h=e.stat_desc.has_stree,l=e.stat_desc.elems,o=-1;for(t.heap_len=0,t.heap_max=g,a=0;a<l;a++)0!==i[2*a]?(t.heap[++t.heap_len]=o=a,t.depth[a]=0):i[2*a+1]=0;for(;t.heap_len<2;)i[2*(r=t.heap[++t.heap_len]=o<2?++o:0)]=1,t.depth[r]=0,t.opt_len--,h&&(t.static_len-=s[2*r+1]);for(e.max_code=o,a=t.heap_len>>1;1<=a;a--)G(t,i,a);for(r=l;a=t.heap[1],t.heap[1]=t.heap[t.heap_len--],G(t,i,1),n=t.heap[1],t.heap[--t.heap_max]=a,t.heap[--t.heap_max]=n,i[2*r]=i[2*a]+i[2*n],t.depth[r]=(t.depth[a]>=t.depth[n]?t.depth[a]:t.depth[n])+1,i[2*a+1]=i[2*n+1]=r,t.heap[1]=r++,G(t,i,1),2<=t.heap_len;);t.heap[--t.heap_max]=t.heap[1],function(t,e){var a,n,r,i,s,h,l=e.dyn_tree,o=e.max_code,_=e.stat_desc.static_tree,d=e.stat_desc.has_stree,u=e.stat_desc.extra_bits,f=e.stat_desc.extra_base,c=e.stat_desc.max_length,p=0;for(i=0;i<=m;i++)t.bl_count[i]=0;for(l[2*t.heap[t.heap_max]+1]=0,a=t.heap_max+1;a<g;a++)c<(i=l[2*l[2*(n=t.heap[a])+1]+1]+1)&&(i=c,p++),l[2*n+1]=i,o<n||(t.bl_count[i]++,s=0,f<=n&&(s=u[n-f]),h=l[2*n],t.opt_len+=h*(i+s),d&&(t.static_len+=h*(_[2*n+1]+s)));if(0!==p){do{for(i=c-1;0===t.bl_count[i];)i--;t.bl_count[i]--,t.bl_count[i+1]+=2,t.bl_count[c]--,p-=2}while(0<p);for(i=c;0!==i;i--)for(n=t.bl_count[i];0!==n;)o<(r=t.heap[--a])||(l[2*r+1]!==i&&(t.opt_len+=(i-l[2*r+1])*l[2*r],l[2*r+1]=i),n--)}}(t,e),F(i,o,t.bl_count)}function V(t,e,a){var n,r,i=-1,s=e[1],h=0,l=7,o=4;for(0===s&&(l=138,o=3),e[2*(a+1)+1]=65535,n=0;n<=a;n++)r=s,s=e[2*(n+1)+1],++h<l&&r===s||(h<o?t.bl_tree[2*r]+=h:0!==r?(r!==i&&t.bl_tree[2*r]++,t.bl_tree[2*v]++):h<=10?t.bl_tree[2*w]++:t.bl_tree[2*y]++,i=r,(h=0)===s?(l=138,o=3):r===s?(l=6,o=3):(l=7,o=4))}function W(t,e,a){var n,r,i=-1,s=e[1],h=0,l=7,o=4;for(0===s&&(l=138,o=3),n=0;n<=a;n++)if(r=s,s=e[2*(n+1)+1],!(++h<l&&r===s)){if(h<o)for(;R(t,r,t.bl_tree),0!=--h;);else 0!==r?(r!==i&&(R(t,r,t.bl_tree),h--),R(t,v,t.bl_tree),N(t,h-3,2)):h<=10?(R(t,w,t.bl_tree),N(t,h-3,3)):(R(t,y,t.bl_tree),N(t,h-11,7));i=r,(h=0)===s?(l=138,o=3):r===s?(l=6,o=3):(l=7,o=4)}}n(O);var X=!1;function Y(t,e,a,n){var r,i,s,h;N(t,(_<<1)+(n?1:0),3),i=e,s=a,h=!0,M(r=t),h&&(L(r,s),L(r,~s)),l.arraySet(r.pending_buf,r.window,i,s,r.pending),r.pending+=s}a._tr_init=function(t){X||(function(){var t,e,a,n,r,i=new Array(m+1);for(n=a=0;n<s-1;n++)for(E[n]=a,t=0;t<1<<k[n];t++)j[a++]=n;for(j[a-1]=n,n=r=0;n<16;n++)for(O[n]=r,t=0;t<1<<z[n];t++)S[r++]=n;for(r>>=7;n<f;n++)for(O[n]=r<<7,t=0;t<1<<z[n]-7;t++)S[256+r++]=n;for(e=0;e<=m;e++)i[e]=0;for(t=0;t<=143;)A[2*t+1]=8,t++,i[8]++;for(;t<=255;)A[2*t+1]=9,t++,i[9]++;for(;t<=279;)A[2*t+1]=7,t++,i[7]++;for(;t<=287;)A[2*t+1]=8,t++,i[8]++;for(F(A,u+1,i),t=0;t<f;t++)C[2*t+1]=5,C[2*t]=H(t,5);U=new q(A,k,d+1,u,m),D=new q(C,z,0,f,m),I=new q(new Array(0),x,0,c,p)}(),X=!0),t.l_desc=new i(t.dyn_ltree,U),t.d_desc=new i(t.dyn_dtree,D),t.bl_desc=new i(t.bl_tree,I),t.bi_buf=0,t.bi_valid=0,K(t)},a._tr_stored_block=Y,a._tr_flush_block=function(t,e,a,n){var r,i,s=0;0<t.level?(2===t.strm.data_type&&(t.strm.data_type=function(t){var e,a=4093624447;for(e=0;e<=31;e++,a>>>=1)if(1&a&&0!==t.dyn_ltree[2*e])return h;if(0!==t.dyn_ltree[18]||0!==t.dyn_ltree[20]||0!==t.dyn_ltree[26])return o;for(e=32;e<d;e++)if(0!==t.dyn_ltree[2*e])return o;return h}(t)),Q(t,t.l_desc),Q(t,t.d_desc),s=function(t){var e;for(V(t,t.dyn_ltree,t.l_desc.max_code),V(t,t.dyn_dtree,t.d_desc.max_code),Q(t,t.bl_desc),e=c-1;3<=e&&0===t.bl_tree[2*B[e]+1];e--);return t.opt_len+=3*(e+1)+5+5+4,e}(t),r=t.opt_len+3+7>>>3,(i=t.static_len+3+7>>>3)<=r&&(r=i)):r=i=a+5,a+4<=r&&-1!==e?Y(t,e,a,n):4===t.strategy||i===r?(N(t,2+(n?1:0),3),J(t,A,C)):(N(t,4+(n?1:0),3),function(t,e,a,n){var r;for(N(t,e-257,5),N(t,a-1,5),N(t,n-4,4),r=0;r<n;r++)N(t,t.bl_tree[2*B[r]+1],3);W(t,t.dyn_ltree,e-1),W(t,t.dyn_dtree,a-1)}(t,t.l_desc.max_code+1,t.d_desc.max_code+1,s+1),J(t,t.dyn_ltree,t.dyn_dtree)),K(t),n&&M(t)},a._tr_tally=function(t,e,a){return t.pending_buf[t.d_buf+2*t.last_lit]=e>>>8&255,t.pending_buf[t.d_buf+2*t.last_lit+1]=255&e,t.pending_buf[t.l_buf+t.last_lit]=255&a,t.last_lit++,0===e?t.dyn_ltree[2*a]++:(t.matches++,e--,t.dyn_ltree[2*(j[a]+d+1)]++,t.dyn_dtree[2*T(e)]++),t.last_lit===t.lit_bufsize-1},a._tr_align=function(t){var e;N(t,2,3),R(t,b,A),16===(e=t).bi_valid?(L(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):8<=e.bi_valid&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}},{"../utils/common":1}],8:[function(t,e,a){"use strict";e.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],"/lib/deflate.js":[function(t,e,a){"use strict";var s=t("./zlib/deflate"),h=t("./utils/common"),l=t("./utils/strings"),r=t("./zlib/messages"),i=t("./zlib/zstream"),o=Object.prototype.toString,_=0,d=-1,u=0,f=8;function c(t){if(!(this instanceof c))return new c(t);this.options=h.assign({level:d,method:f,chunkSize:16384,windowBits:15,memLevel:8,strategy:u,to:""},t||{});var e=this.options;e.raw&&0<e.windowBits?e.windowBits=-e.windowBits:e.gzip&&0<e.windowBits&&e.windowBits<16&&(e.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new i,this.strm.avail_out=0;var a=s.deflateInit2(this.strm,e.level,e.method,e.windowBits,e.memLevel,e.strategy);if(a!==_)throw new Error(r[a]);if(e.header&&s.deflateSetHeader(this.strm,e.header),e.dictionary){var n;if(n="string"==typeof e.dictionary?l.string2buf(e.dictionary):"[object ArrayBuffer]"===o.call(e.dictionary)?new Uint8Array(e.dictionary):e.dictionary,(a=s.deflateSetDictionary(this.strm,n))!==_)throw new Error(r[a]);this._dict_set=!0}}function n(t,e){var a=new c(e);if(a.push(t,!0),a.err)throw a.msg||r[a.err];return a.result}c.prototype.push=function(t,e){var a,n,r=this.strm,i=this.options.chunkSize;if(this.ended)return!1;n=e===~~e?e:!0===e?4:0,"string"==typeof t?r.input=l.string2buf(t):"[object ArrayBuffer]"===o.call(t)?r.input=new Uint8Array(t):r.input=t,r.next_in=0,r.avail_in=r.input.length;do{if(0===r.avail_out&&(r.output=new h.Buf8(i),r.next_out=0,r.avail_out=i),1!==(a=s.deflate(r,n))&&a!==_)return this.onEnd(a),!(this.ended=!0);0!==r.avail_out&&(0!==r.avail_in||4!==n&&2!==n)||("string"===this.options.to?this.onData(l.buf2binstring(h.shrinkBuf(r.output,r.next_out))):this.onData(h.shrinkBuf(r.output,r.next_out)))}while((0<r.avail_in||0===r.avail_out)&&1!==a);return 4===n?(a=s.deflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===_):2!==n||(this.onEnd(_),!(r.avail_out=0))},c.prototype.onData=function(t){this.chunks.push(t)},c.prototype.onEnd=function(t){t===_&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=h.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},a.Deflate=c,a.deflate=n,a.deflateRaw=function(t,e){return(e=e||{}).raw=!0,n(t,e)},a.gzip=function(t,e){return(e=e||{}).gzip=!0,n(t,e)}},{"./utils/common":1,"./utils/strings":2,"./zlib/deflate":5,"./zlib/messages":6,"./zlib/zstream":8}]},{},[])("/lib/deflate.js")});
/*!
 * Copyright (c) 2020 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 * @version 6.0.0.1960
 * @flags w3c,NDEBUG
 */
if(window.TLT){throw"Attempting to recreate TLT. Library may be included more than once on the page."}window.TLT=(function(){var c,m,a,l,E,y,q,j,z,M;function p(O){if(window.TLT&&O.persisted){TLT.terminationReason="";TLT.init()}}function e(V,O,P,W){var T=null,X=null,R=TLT.getModule("replay"),U=TLT.getModule("TLCookie"),Y=TLT.getModule("performance"),Q=null,S=M.getOriginAndPath();if(!O||typeof O!=="string"){return}if(!P||typeof P!=="string"){P=""}X={type:2,screenview:{type:V,name:O,originalUrl:S.path,url:TLT.normalizeUrl(S.path),host:S.origin,referrer:P,title:document.title,queryParams:S.queryParams}};if(V==="LOAD"){Q={type:"screenview_load",name:O}}else{if(V==="UNLOAD"){Q={type:"screenview_unload",name:O}}}if(Q&&R){T=R.onevent(Q)}if(T){X.dcid=T}if(V==="LOAD"||V==="UNLOAD"){y.post("",X)}if(Q&&U){U.onevent(Q)}if(Q&&Y){Y.onevent(Q)}}var h=(new Date()).getTime(),w,D,F={},t={},n={},k=false,N=null,u=(function(){var O,Q=[];function P(V){var S=j.framesBlacklist,U,T;O=O||[];V=V||null;if(typeof S!=="undefined"&&S.length>0){for(T=0;T<S.length;T+=1){U=a.queryAll(S[T],V);if(U&&U.length>0){O=O.concat(U)}}Q=Q.concat(a.queryAll("iframe",V))}}function R(S){if(M.indexOf(Q,S)<0){P(S.ownerDocument)}return M.indexOf(O,S)>-1}R.clearCache=function(){O=null};return R}()),H=null,f={config:["getConfig","updateConfig","getCoreConfig","updateCoreConfig","getModuleConfig","updateModuleConfig","getServiceConfig","updateServiceConfig"],queue:["post","setAutoFlush","flushAll"],browserBase:["getXPathFromNode","processDOMEvent"]},A=(function(){var O={};return{normalizeModuleEvents:function(T,R,V,Q){var P=O[T],U=false,S=false;V=V||s._getLocalTop();if(P){return}O[T]={loadFired:false,pageHideFired:false};M.forEach(R,function(W){switch(W.name){case"load":U=true;R.push(M.mixin(M.mixin({},W),{name:"pageshow"}));break;case"unload":S=true;R.push(M.mixin(M.mixin({},W),{name:"pagehide"}));R.push(M.mixin(M.mixin({},W),{name:"beforeunload"}));break;case"change":if(M.isLegacyIE&&s.getFlavor()==="w3c"){R.push(M.mixin(M.mixin({},W),{name:"propertychange"}))}break}});if(!U&&!S){delete O[T];return}O[T].silentLoad=!U;O[T].silentUnload=!S;if(!U){R.push({name:"load",target:V})}if(!S){R.push({name:"unload",target:V})}},canPublish:function(P,R){var Q;if(O.hasOwnProperty(P)===false){return true}Q=O[P];switch(R.type){case"load":Q.pageHideFired=false;Q.loadFired=true;return !Q.silentLoad;case"pageshow":Q.pageHideFired=false;R.type="load";return !Q.loadFired&&!Q.silentLoad;case"pagehide":R.type="unload";Q.loadFired=false;Q.pageHideFired=true;return !Q.silentUnload;case"unload":case"beforeunload":R.type="unload";Q.loadFired=false;return !Q.pageHideFired&&!Q.silentUnload}return true},isUnload:function(P){return typeof P==="object"?(P.type==="unload"||P.type==="beforeunload"||P.type==="pagehide"):false}}}()),L={},r={},b={},C=[],I=function(){},i=null,x=true,o=function(){},v=false,J=(function(){var O=window.location,Q=O.pathname,P=O.hash,R="";return function(){var U=O.pathname,S=O.hash,T=R;if(U!==Q){T=TLT.normalizeUrl(U+S)}else{if(S!==P){T=TLT.normalizeUrl(S)}}if(T!==R){if(R){e("UNLOAD",R)}e("LOAD",T);R=T;Q=U;P=S}}}()),B=function(V,T){var S,O,Q,U,P,R=null;if(!V||!T){return R}for(S=0,O=V.length;S<O;S+=1){Q=V[S];switch(typeof Q){case"object":U=new RegExp(Q.regex,Q.flags);P=U.exec(T);if(P){R=P[0]}break;case"string":if(T.indexOf(Q)!==-1){R=Q}break;default:break}}return R},K=function(Q,X){var R,P,S,W=false,O=j.blockedElements,U,V,T;if(!O||!O.length){K=function(){return false};return W}if(!Q||!Q.nodeType){return W}X=X||M.getDocument(Q);for(R=0,S=O.length;R<S&&!W;R+=1){V=a.queryAll(O[R],X);for(P=0,T=V.length;P<T&&!W;P+=1){U=V[P];W=U.contains?U.contains(Q):U===Q}}return W},G=function(P){var O=false,Q=["intent:","mailto:","sms:","tel:"];if(P&&M.getTagName(P)==="a"&&Q.indexOf(P.protocol)!==-1){O=true}return O},d=function(){var O=null,Q="tltTabId";try{O=sessionStorage.getItem(Q);if(!O){O=M.getRandomString(4);sessionStorage.setItem(Q,O)}}catch(P){}return O},s={getTLTSessionCookieInfo:function(){return F},_loadGlobalsForUnitTesting:function(O){M=O.utils;c=O.getService("ajax");m=O.getService("browserBase");a=O.getService("browser");l=O.getService("config");E=O.getService("domCapture");y=O.getService("queue");q=O.getService("serializer");j=l?l.getCoreConfig():null},getStartTime:function(){return h},getPageId:function(){return w||"#"},getTabId:function(){return D},setSessionCookieInfo:function(O,Q,P){F.tltCookieName=Q;F.tltCookieValue=P},getLibraryVersion:function(){return"6.0.0.1960"},getCurrentWebEvent:function(){return L},normalizeUrl:function(R,Q){var P,O;if(typeof Q==="undefined"){Q=R}P=this.getCoreConfig();if(P.normalization&&P.normalization.urlFunction){O=P.normalization.urlFunction;if(typeof O==="string"){O=M.access(O)}return O(Q)}return Q},getSessionStart:function(){return this.getService("message").getSessionStart()},init:function(P,Q){var O;M=this.utils;if(M.isLegacyIE){return}i=Q;if(!x){throw"init must only be called once!"}if(!P&&!this.config){throw"missing configuration."}P=P||this.config;this.config=P;x=false;w="P."+M.getRandomString(28);D=d();O=function(R){R=R||window.event||{};if(R.type==="load"||document.readyState!=="loading"){if(document.removeEventListener){document.removeEventListener("DOMContentLoaded",O,false);window.removeEventListener("load",O,false)}else{document.detachEvent("onreadystatechange",O);window.detachEvent("onload",O)}I(P,Q)}};if(document.readyState==="complete"||(document.readyState==="interactive"&&!M.isIE)){setTimeout(O)}else{if(document.addEventListener){document.addEventListener("DOMContentLoaded",O,false);window.addEventListener("load",O,false)}else{document.attachEvent("onreadystatechange",O);window.attachEvent("onload",O)}}},isInitialized:function(){return k},getState:function(){return N},destroy:function(Q,O){var P="",R="",U=null,V=null,S=null,W=false;if(x){return false}this.stopAll();if(!Q){for(P in r){if(r.hasOwnProperty(P)){R=P.split("|")[0];U=r[P].target;W=r[P].delegateTarget||undefined;a.unsubscribe(R,U,this._publishEvent,W)}}}for(V in n){if(n.hasOwnProperty(V)){S=n[V].instance;if(S&&typeof S.destroy==="function"){S.destroy()}n[V].instance=null}}u.clearCache();r={};L={};C=[];k=false;x=true;N="destroyed";TLT.terminationReason=O||N;if(typeof i==="function"){try{i("destroyed")}catch(T){}}if(!z){window.addEventListener("pageshow",p);z=true}},_updateModules:function(Q){var S=null,P=null,O=true;if(j&&j.modules){try{for(P in j.modules){if(j.modules.hasOwnProperty(P)){S=j.modules[P];if(t.hasOwnProperty(P)){if(S.enabled===false){this.stop(P);continue}this.start(P);if(S.events){this._registerModuleEvents(P,S.events,Q)}}}}this._registerModuleEvents.clearCache()}catch(R){s.destroy(false,"_updateModules: "+R.message);O=false}}else{O=false}return O},rebind:function(O){s._updateModules(O)},getSessionData:function(){if(!s.isInitialized()){return}var S=null,O=null,Q,R,P;if(!j||!j.sessionDataEnabled){return null}O=j.sessionData||{};Q=O.sessionQueryName;if(Q){R=M.getQueryStringValue(Q,O.sessionQueryDelim)}else{Q=O.sessionCookieName;if(Q){R=M.getCookieValue(Q)}else{P=TLT.getTLTSessionCookieInfo();Q=P.tltCookieName;R=P.tltCookieValue}}if(Q&&R){S=S||{};S.tltSCN=Q;S.tltSCV=R;S.tltSCVNeedsHashing=!!O.sessionValueNeedsHashing}return S},logGeolocation:function(O){var P;if(!s.isInitialized()){return}if(!O||!O.coords){return}P={type:13,geolocation:{lat:M.getValue(O,"coords.latitude",0),"long":M.getValue(O,"coords.longitude",0),accuracy:Math.ceil(M.getValue(O,"coords.accuracy",0))}};y.post("",P)},logCustomEvent:function(Q,O){if(!s.isInitialized()){return}var P=null;if(!Q||typeof Q!=="string"){Q="CUSTOM"}O=O||{};P={type:5,customEvent:{name:Q,data:O}};y.post("",P)},logExceptionEvent:function(R,P,O){if(!s.isInitialized()){return}var Q=null;if(!R||typeof R!=="string"){return}P=P||"";O=O||"";Q={type:6,exception:{description:R,url:P,line:O}};y.post("",Q)},logFormCompletion:function(O,Q){if(!s.isInitialized()){return}var P={type:15,formCompletion:{submitted:!!O,valid:(typeof Q==="boolean"?Q:null)}};y.post("",P)},logScreenviewLoad:function(Q,P,O){if(!s.isInitialized()){return}e("LOAD",Q,P,O)},logScreenviewUnload:function(O){if(!s.isInitialized()){return}e("UNLOAD",O)},logDOMCapture:function(O,R){var S=null,Q,P,T;if(!this.isInitialized()){return S}if(M.isLegacyIE){return S}if(E){O=O||window.document;P=this.getServiceConfig("domCapture");R=M.mixin({},P.options,R);Q=E.captureDOM(O,R);if(Q){S=R.dcid||("dcid-"+M.getSerialNumber()+"."+(new Date()).getTime());Q.dcid=S;Q.eventOn=!!R.eventOn;T={type:12,domCapture:Q};y.post("",T);if(R.qffd!==false&&!v&&T.domCapture.fullDOM){y.flush();v=true}}}return S},performDOMCapture:function(Q,O,P){return this.logDOMCapture(O,P)},performFormCompletion:function(P,O,Q){return this.logFormCompletion(O,Q)},_bridgeCallback:function(P){var O=b[P];if(O&&O.enabled){return O}return null},logScreenCapture:function(){if(!s.isInitialized()){return}var O=s._bridgeCallback("screenCapture");if(O!==null){O.cbFunction()}},enableTealeafFramework:function(){if(!s.isInitialized()){return}var O=s._bridgeCallback("enableTealeafFramework");if(O!==null){O.cbFunction()}},disableTealeafFramework:function(){if(!s.isInitialized()){return}var O=s._bridgeCallback("disableTealeafFramework");if(O!==null){O.cbFunction()}},startNewTLFSession:function(){if(!s.isInitialized()){return}var O=s._bridgeCallback("startNewTLFSession");if(O!==null){O.cbFunction()}},currentSessionId:function(){if(!s.isInitialized()){return}var P,O=s._bridgeCallback("currentSessionId");if(O!==null){P=O.cbFunction()}return P},defaultValueForConfigurableItem:function(O){if(!s.isInitialized()){return}var Q,P=s._bridgeCallback("defaultValueForConfigurableItem");if(P!==null){Q=P.cbFunction(O)}return Q},valueForConfigurableItem:function(O){if(!s.isInitialized()){return}var Q,P=s._bridgeCallback("valueForConfigurableItem");if(P!==null){Q=P.cbFunction(O)}return Q},setConfigurableItem:function(P,R){if(!s.isInitialized()){return}var O=false,Q=s._bridgeCallback("setConfigurableItem");if(Q!==null){O=Q.cbFunction(P,R)}return O},addAdditionalHttpHeader:function(P,R){if(!s.isInitialized()){return}var O=false,Q=s._bridgeCallback("addAdditionalHttpHeader");if(Q!==null){O=Q.cbFunction(P,R)}return O},logCustomEventBridge:function(Q,R,P){if(!s.isInitialized()){return}var O=false,S=s._bridgeCallback("logCustomEventBridge");if(S!==null){O=S.cbFunction(Q,R,P)}return O},registerBridgeCallbacks:function(W){var T,R,U,Q=null,S,Y,P,O,X=TLT.utils;if(!W){return false}if(W.length===0){b={};return false}try{for(T=0,U=W.length;T<U;T+=1){Q=W[T];if(typeof Q==="object"&&Q.cbType&&Q.cbFunction){S={enabled:Q.enabled,cbFunction:Q.cbFunction,cbOrder:Q.order||0};if(X.isUndefOrNull(b[Q.cbType])){if(S.enabled){b[Q.cbType]=S}}else{if(!X.isArray(b[Q.cbType])){b[Q.cbType]=[b[Q.cbType]]}Y=b[Q.cbType];for(R=0,O=false,P=Y.length;R<P;R+=1){if(Y[R].cbOrder===S.cbOrder&&Y[R].cbFunction===S.cbFunction){O=true;if(!S.enabled){Y.splice(R,1);if(!Y.length){delete b[Q.cbType]}}}else{if(Y[R].cbOrder>S.cbOrder){break}}}if(!O){if(S.enabled){Y.splice(R,0,S)}}}}}}catch(V){return false}return true},registerMutationCallback:function(O,Q){var P;if(!O||typeof O!=="function"){return false}if(Q){P=C.indexOf(O);if(P===-1){C.push(O)}}else{P=C.indexOf(O);if(P!==-1){C.splice(P,1)}}return true},invokeMutationCallbacks:function(Q){var R,O,V,U,T,S=[],P=[];if(C.length===0){return}if(Map){T=new Map()}else{T=new M.WeakMap()}for(R=0;R<Q.length;R++){U=Q[R].target;if(U){V=M.getDocument(U);if(T.get(V)===undefined){if(V.host){P.push(V)}else{S.push(V)}T.set(V,true)}}}T.clear();for(R=0;R<C.length;R++){O=C[R];O(Q,S,P)}},redirectQueue:function(R){var U,T,Q,P,O,V,S;if(!R||!R.length){return R}P=b.messageRedirect;if(!P){return R}if(!M.isArray(P)){O=[P]}else{O=P}for(T=0,V=O.length;T<V;T+=1){P=O[T];if(P&&P.enabled){for(U=0,Q=R.length;U<Q;U+=1){S=P.cbFunction(q.serialize(R[U]),R[U]);if(S&&typeof S==="object"){R[U]=S}else{R.splice(U,1);U-=1;Q=R.length}}}}return R},_hasSameOrigin:function(P){var O=false;try{O=P.document.location.host===document.location.host&&P.document.location.protocol===document.location.protocol;if(!O){O=P.document.domain===document.domain}return O}catch(Q){}return false},provideRequestHeaders:function(){var P=null,O=b.addRequestHeaders;if(O&&O.enabled){P=O.cbFunction()}return P},_registerModuleEvents:(function(){var Q,S=0,R=function(W,V,U){if(W==="window"){return V}if(W==="document"){return U}return W};function T(U,aa,ac){var ab=M.getDocument(ac),W=s._getLocalTop(),V=M.isIFrameDescendant(ac),Z,Y,X;ac=ac||ab;A.normalizeModuleEvents(U,aa,W,ab);if(V){Z=m.ElementData.prototype.examineID(ac).id;if(typeof Z==="string"){Z=Z.slice(0,Z.length-1);for(Y in r){if(r.hasOwnProperty(Y)){for(X=0;X<r[Y].length;X+=1){if(U===r[Y][X]){if(Y.indexOf(Z)!==-1){delete r[Y];break}}}}}}}M.forEach(aa,function(ad){var ag=R(ad.target,W,ab)||ab,af=R(ad.delegateTarget,W,ab),ae="";if(ad.recurseFrames!==true&&V){return}if(typeof ag==="string"){if(ad.delegateTarget&&s.getFlavor()==="jQuery"){ae=s._buildToken4delegateTarget(ad.name,ag,ad.delegateTarget);if(!r.hasOwnProperty(ae)){r[ae]=[U];r[ae].target=ag;r[ae].delegateTarget=af;a.subscribe(ad.name,ag,s._publishEvent,af,ae)}else{r[ae].push(U)}}else{M.forEach(a.queryAll(ag,ac),function(ah){var ai=Q.get(ah);if(!ai){ai=m.ElementData.prototype.examineID(ah);Q.set(ah,ai)}ae=ad.name+"|"+ai.id+ai.idType;if(M.indexOf(r[ae],U)!==-1){return}r[ae]=r[ae]||[];r[ae].push(U);r[ae].target=ah;a.subscribe(ad.name,ah,s._publishEvent)})}}else{ae=s._buildToken4bubbleTarget(ad.name,ag,typeof ad.target==="undefined");if(!r.hasOwnProperty(ae)){r[ae]=[U];a.subscribe(ad.name,ag,s._publishEvent)}else{if(M.indexOf(r[ae],U)===-1){r[ae].push(U)}}}if(ae!==""){if(typeof ag!=="string"){r[ae].target=ag}}})}function P(U){var V=M.getIFrameWindow(U);return(V!==null)&&s._hasSameOrigin(V)&&(V.document!==null)&&V.document.readyState==="complete"&&V.document.body.innerHTML!==""}function O(X,V,ab){ab=ab||s._getLocalTop().document;Q=Q||new M.WeakMap();T(X,V,ab);if(X!=="performance"){var aa=null,W=null,U=a.queryAll("iframe, frame",ab),Z,Y;for(Z=0,Y=U.length;Z<Y;Z+=1){aa=U[Z];if(u(aa)){continue}if(P(aa)){W=M.getIFrameWindow(aa);s._registerModuleEvents(X,V,W.document);E.observeWindow(W);continue}S+=1;(function(ae,ad,af){var ac=null,ag={moduleName:ae,moduleEvents:ad,hIFrame:af,_registerModuleEventsDelayed:function(){var ah=null;if(!u(af)){ah=M.getIFrameWindow(af);if(s._hasSameOrigin(ah)){s._registerModuleEvents(ae,ad,ah.document);E.observeWindow(ah)}}S-=1;if(!S){s._publishEvent({type:"loadWithFrames",custom:true})}}};M.addEventListener(af,"load",function(){ag._registerModuleEventsDelayed()});if(M.isLegacyIE&&P(af)){ac=M.getIFrameWindow(af);M.addEventListener(ac.document,"readystatechange",function(){ag._registerModuleEventsDelayed()})}}(X,V,aa))}}}O.clearCache=function(){if(Q){Q.clear();Q=null}};return O}()),_buildToken4currentTarget:function(P){var Q=P.nativeEvent?P.nativeEvent.currentTarget:null,O=Q?m.ElementData.prototype.examineID(Q):{id:P.target?P.target.id:null,idType:P.target?P.target.idType:-1};return P.type+"|"+O.id+O.idType},_buildToken4delegateTarget:function(O,Q,P){return O+"|"+Q+"|"+P},_buildToken4bubbleTarget:function(P,U,T,X){var S=s._getLocalTop(),O,Y=function(Z){var aa=null;if(s._hasSameOrigin(O.parent)){M.forEach(a.queryAll("iframe, frame",O.parent.document),function(ab){var ac=null;if(!u(ab)){ac=M.getIFrameWindow(ab);if(s._hasSameOrigin(ac)&&ac.document===Z){aa=ab}}})}return aa},V=M.getDocument(U),W=null,R,Q=P;if(V){O=V.defaultView||V.parentWindow}if(U===window||U===window.window){Q+="|null-2|window"}else{if(T&&O&&s._hasSameOrigin(O.parent)&&typeof V!=="undefined"&&S.document!==V){W=Y(V);if(W){R=m.ElementData.prototype.examineID(W);Q+="|"+R.xPath+"-2"}}else{if(X&&X!==document&&s.getFlavor()==="jQuery"){Q+="|null-2|"+M.getTagName(U)+"|"+M.getTagName(X)}else{Q+="|null-2|document"}}}return Q},_reinitConfig:function(){s._updateModules()},_publishEvent:function(O){var P=null,R=null,U=(O.delegateTarget&&O.data)?O.data:s._buildToken4currentTarget(O),S=null,V,W,X,Q=null,Y=false,Z=false,ab=O.delegateTarget||null,aa,T;L=O;if(O.type.match(/^(click|change|blur|mouse|touch)/)){o();y.resetFlushTimer()}aa=M.getValue(j,"screenviewAutoDetect",true);if(aa){J()}if((O.type==="load"||O.type==="pageshow")&&!O.nativeEvent.customLoad){L={};return}if(O.type==="click"){H=O.target.element}if(O.type==="beforeunload"){Y=false;T=(M.getTagName(H)==="a")?H:document.activeElement;if(T){if(G(T)){Y=true}else{M.forEach(j.ieExcludedLinks,function(ac){var ae,ad,af=a.queryAll(ac);for(ae=0,ad=af?af.length:0;ae<ad;ae+=1){if(af[ae]&&af[ae]===H){Y=true;break}}})}}if(Y){L={};return}}if(A.isUnload(O)){N="unloading"}if(O.type==="change"&&M.isLegacyIE&&s.getFlavor()==="w3c"&&(O.target.element.type==="checkbox"||O.target.element.type==="radio")){L={};return}if(O.type==="propertychange"){if(O.nativeEvent.propertyName==="checked"&&(O.target.element.type==="checkbox"||(O.target.element.type==="radio"&&O.target.element.checked))){O.type="change";O.target.type="INPUT"}else{L={};return}}if(O.target&&K(O.target.element)){L={};return}if(!r.hasOwnProperty(U)){if(O.hasOwnProperty("nativeEvent")){X=O.nativeEvent.currentTarget||O.nativeEvent.target}U=s._buildToken4bubbleTarget(O.type,X,true,ab)}if(r.hasOwnProperty(U)){S=r[U];for(V=0,W=S.length;V<W;V+=1){P=S[V];R=s.getModule(P);Q=M.mixin({},O);if(R&&s.isStarted(P)&&typeof R.onevent==="function"){Z=A.canPublish(P,Q);if(Z){R.onevent(Q)}}}}if(Q&&Q.type==="unload"&&Z){s.destroy(false,Q.type)}L={}},_getLocalTop:function(){return window.window},addModule:function(O,P){t[O]={creator:P,instance:null,context:null,messages:[]};if(this.isInitialized()){this.start(O)}},getModule:function(O){if(t[O]&&t[O].instance){return t[O].instance}return null},removeModule:function(O){this.stop(O);delete t[O]},isStarted:function(O){return t.hasOwnProperty(O)&&t[O].instance!==null},start:function(P){var Q=t[P],O=null;if(Q&&Q.instance===null){Q.context=new TLT.ModuleContext(P,this);O=Q.instance=Q.creator(Q.context);if(typeof O.init==="function"){O.init()}}},startAll:function(){var O=null;for(O in t){if(t.hasOwnProperty(O)){this.start(O)}}},stop:function(P){var Q=t[P],O=null;if(Q&&Q.instance!==null){O=Q.instance;if(typeof O.destroy==="function"){O.destroy()}Q.instance=Q.context=null}},stopAll:function(){var O=null;for(O in t){if(t.hasOwnProperty(O)){this.stop(O)}}},addService:function(P,O){n[P]={creator:O,instance:null}},getService:function(O){if(n.hasOwnProperty(O)){if(!n[O].instance){try{n[O].instance=n[O].creator(this);if(typeof n[O].instance.init==="function"){n[O].instance.init()}}catch(P){M.clog("UIC terminated due to error when instanciating the "+O+" service.");throw P}if(typeof n[O].instance.getServiceName!=="function"){n[O].instance.getServiceName=function(){return O}}}return n[O].instance}return null},removeService:function(O){delete n[O]},broadcast:function(P){var Q,O;if(P&&typeof P==="object"){for(Q in t){if(t.hasOwnProperty(Q)){O=t[Q];if(M.indexOf(O.messages,P.type)>-1){if(typeof O.instance.onmessage==="function"){O.instance.onmessage(P)}}}}}},listen:function(O,Q){var P=null;if(this.isStarted(O)){P=t[O];if(M.indexOf(P.messages,Q)===-1){P.messages.push(Q)}}},fail:function(Q,P,O){Q="UIC FAILED. "+Q;try{s.destroy(!!O,Q)}catch(R){M.clog(Q)}throw new s.UICError(Q,P)},UICError:(function(){function O(P,Q){this.message=P;this.code=Q}O.prototype=new Error();O.prototype.name="UICError";O.prototype.constructor=O;return O}()),getFlavor:function(){return"w3c"},isCrossOrigin:function(Q,P){var R=false,S,O;P=P||window.location.origin;if(!Q||!P){return R}O=Q.match(/^\/\//);if(Q.match(/^\//)&&!O){R=false}else{if(O||Q.indexOf("://")!==-1){if(O){S=P.indexOf("://");if(S!==-1){P=P.substring(S+1)}}if(Q.length<P.length){R=true}else{R=(P!==Q.substring(0,P.length))||(Q.length>P.length&&Q.charAt(P.length)!=="/")}}else{R=false}}return R}};o=function(){var Q=null,P=M.getValue(j,"inactivityTimeout",600000);if(!P){o=function(){};return}function O(){s.destroy(false,"inactivity")}o=function(){if(Q){clearTimeout(Q);Q=null}Q=setTimeout(O,P)};o()};function g(S){var O,P,R,Q;if(!localStorage||!S){return}R=localStorage.getItem(S);if(R){P=R.split("|");O=parseInt(P[0],10);if(Date.now()>O){localStorage.removeItem(S)}else{Q=P[1]}}return Q}I=function(P,ad){var Q,aa,V,R,ae,O,T,ac=null,U,S,W,ab,X;if(k){return}if(TLT&&TLT.replay){return}l=s.getService("config");l.updateConfig(P);j=l.getCoreConfig();S=B(j.blockedUserAgents,navigator.userAgent);if(S){TLT.terminationReason="blockedUA: "+S;return}c=s.getService("ajax");M.browserBaseService=m=s.getService("browserBase");M.browserService=a=s.getService("browser");E=s.getService("domCapture");y=s.getService("queue");q=s.getService("serializer");Q=l.getModuleConfig("TLCookie")||{};R=Q.sessionizationCookieName||"TLTSID";ae=M.getCookieValue("TLTSID");if(ae==="DND"){if(N!=="destroyed"){s.destroy(false,"killswitch")}return}ae=M.getCookieValue(R)||g(R);if(!ae){R=Q.wcxCookieName||"WCXSID";ae=M.getCookieValue(R)}if(!s._updateModules()){if(N!=="destroyed"){s.destroy(false,"modules init")}return}if(l.subscribe){l.subscribe("configupdated",s._reinitConfig)}k=true;N="loaded";try{if(typeof TLFExtensionNotify==="function"){TLFExtensionNotify("Initialized")}}catch(Z){}aa=s.getServiceConfig("queue");V=aa.queues||[];if(M.isLegacyIE||M.isIE9){ac=M.getOriginAndPath().origin}for(U=0;U<V.length;U+=1){if(ac&&s.isCrossOrigin(V[U].endpoint,ac)){s.setAutoFlush(false);s.destroy(false,"CORS not supported");return}if(!ae&&Q.tlAppKey){O=V[U].endpoint;T=V[U].killswitchURL||(O.match("collectorPost")?O.replace("collectorPost","switch/"+Q.tlAppKey):null);if(T){c.sendRequest({type:"GET",url:T,async:true,timeout:5000,oncomplete:function(af){if(af.responseText==="0"||af.data===0){s.setAutoFlush(false);M.setCookie("TLTSID","DND");s.destroy(false,"killswitch")}}})}}if(V[U].checkEndpoint&&!aa.asyncReqOnUnload){aa.asyncReqOnUnload=true;c.sendRequest({oncomplete:function(af){if(af.success){aa.asyncReqOnUnload=false}},timeout:V[U].endpointCheckTimeout||3000,url:V[U].endpoint,headers:{"X-PageId":w,"X-Tealeaf-SaaS-AppKey":Q.tlAppKey,"X-Tealeaf-EndpointCheck":true},async:true,error:function(af){if(af.success){return}aa.endpointCheckFailed=true}})}}X=function(ah){var ag,af;ag={type:"load",target:window.window,srcElement:window.window,currentTarget:window.window,bubbles:true,cancelBubble:false,cancelable:true,timeStamp:+new Date(),customLoad:true};af=new m.WebEvent(ag);s._publishEvent(af);if(ah){a.unsubscribe(W,ab,X)}};if(j.screenviewLoadEvent){W=j.screenviewLoadEvent.name;ab=j.screenviewLoadEvent.target||window;a.subscribe(W,ab,X)}else{X()}if(s.isInitialized()){N="initialized";o()}if(typeof i==="function"){try{i(N)}catch(Y){M.clog("Error in callback.",Y)}}};(function(){var P=null,Q,O;for(P in f){if(f.hasOwnProperty(P)){for(Q=0,O=f[P].length;Q<O;Q+=1){(function(S,R){s[R]=function(){var T=this.getService(S);if(T){return T[R].apply(T,arguments)}}}(P,f[P][Q]))}}}}());return s}());(function(){var a=window.navigator.userAgent.toLowerCase(),k=(a.indexOf("msie")!==-1||a.indexOf("trident")!==-1),b=(function(){var l=!!window.performance;return(k&&(!l||document.documentMode<9))}()),e=(function(){return(k&&document.documentMode===9)}()),f=(a.indexOf("android")!==-1),h=/(ipad|iphone|ipod)/.test(a),c=(a.indexOf("opera mini")!==-1),g=(a.indexOf("chrome")===-1)&&(a.indexOf("safari")!==-1),j=1,d={"a:":"link","button:button":"button","button:submit":"button","input:button":"button","input:checkbox":"checkBox","input:color":"colorPicker","input:date":"datePicker","input:datetime":"datetimePicker","input:datetime-local":"datetime-local","input:email":"emailInput","input:file":"fileInput","input:image":"button","input:month":"month","input:number":"numberPicker","input:password":"textBox","input:radio":"radioButton","input:range":"slider","input:reset":"button","input:search":"searchBox","input:submit":"button","input:tel":"tel","input:text":"textBox","input:time":"timePicker","input:url":"urlBox","input:week":"week","select:":"selectList","select:select-one":"selectList","textarea:":"textBox","textarea:textarea":"textBox"},i={isIE:k,isLegacyIE:b,isIE9:e,isAndroid:f,isLandscapeZeroDegrees:false,isiOS:h,isOperaMini:c,isSafari:g,isUndefOrNull:function(l){return typeof l==="undefined"||l===null},isArray:function(l){return !!(l&&Object.prototype.toString.call(l)==="[object Array]")},getSerialNumber:function(){var l;l=j;j+=1;return l},getRandomString:function(q,p){var o,n,l="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",m="";if(!q){return m}if(typeof p!=="string"){p=l}for(o=0,n=p.length;o<q;o+=1){m+=p.charAt(Math.floor(Math.random()*n))}return m},getValue:function(q,p,m){var o,l,n;m=typeof m==="undefined"?null:m;if(!q||typeof q!=="object"||typeof p!=="string"){return m}n=p.split(".");for(o=0,l=n.length;o<l;o+=1){if(this.isUndefOrNull(q)||typeof q[n[o]]==="undefined"){return m}q=q[n[o]]}return q},indexOf:function(o,n){var m,l;if(o&&o.indexOf){return o.indexOf(n)}if(o&&o instanceof Array){for(m=0,l=o.length;m<l;m+=1){if(o[m]===n){return m}}}return -1},forEach:function(p,o,n){var m,l;if(!p||!p.length||!o||!o.call){return}for(m=0,l=p.length;m<l;m+=1){o.call(n,p[m],m,p)}},some:function(p,o){var m,l,n=false;for(m=0,l=p.length;m<l;m+=1){n=o(p[m],m,p);if(n){return n}}return n},convertToArray:function(n){var o=0,m=n.length,l=[];while(o<m){l.push(n[o]);o+=1}return l},mixin:function(p){var o,n,m,l;for(m=1,l=arguments.length;m<l;m+=1){n=arguments[m];for(o in n){if(Object.prototype.hasOwnProperty.call(n,o)){p[o]=n[o]}}}return p},extend:function(l,m,n){var o="";for(o in n){if(Object.prototype.hasOwnProperty.call(n,o)){if(l&&Object.prototype.toString.call(n[o])==="[object Object]"){if(typeof m[o]==="undefined"){m[o]={}}this.extend(l,m[o],n[o])}else{m[o]=n[o]}}}return m},clone:function(m){var n,l;if(null===m||"object"!==typeof m){return m}if(m instanceof Object){n=(Object.prototype.toString.call(m)==="[object Array]")?[]:{};for(l in m){if(Object.prototype.hasOwnProperty.call(m,l)){n[l]=this.clone(m[l])}}return n}},parseVersion:function(n){var o,l,m=[];if(!n||!n.length){return m}m=n.split(".");for(o=0,l=m.length;o<l;o+=1){m[o]=/^[0-9]+$/.test(m[o])?parseInt(m[o],10):m[o]}return m},isEqual:function(n,m){var o,p,r,q,l;if(n===m){return true}if(typeof n!==typeof m){return false}if(n instanceof Object&&m instanceof Object){if(Object.prototype.toString.call(n)==="[object Array]"&&Object.prototype.toString.call(m)==="[object Array]"){if(n.length!==m.length){return false}for(o=0,l=n.length;o<l;o+=1){if(!this.isEqual(n[o],m[o])){return false}}return true}if(Object.prototype.toString.call(n)==="[object Object]"&&Object.prototype.toString.call(m)==="[object Object]"){for(o=0;o<2;o+=1){for(r in n){if(n.hasOwnProperty(r)){if(!m.hasOwnProperty(r)){return false}p=this.isEqual(n[r],m[r]);if(!p){return false}}}q=n;n=m;m=q}return true}}return false},calculateRelativeXY:function(n){if(i.isUndefOrNull(n)||i.isUndefOrNull(n.x)||i.isUndefOrNull(n.y)||i.isUndefOrNull(n.width)||i.isUndefOrNull(n.height)){return"0.5,0.5"}var m=Math.abs(n.x/n.width).toFixed(4),l=Math.abs(n.y/n.height).toFixed(4);m=m>1||m<0?0.5:m;l=l>1||l<0?0.5:l;return m+","+l},createObject:(function(){var l=null,m=null;if(typeof Object.create==="function"){l=Object.create}else{m=function(){};l=function(n){if(typeof n!=="object"&&typeof n!=="function"){throw new TypeError("Object prototype need to be an object!")}m.prototype=n;return new m()}}return l}()),access:function(q,o){var p=o||window,m,n,l;if(typeof q!=="string"||typeof p!=="object"){return}m=q.split(".");for(n=0,l=m.length;n<l;n+=1){if(n===0&&m[n]==="window"){continue}if(!Object.prototype.hasOwnProperty.call(p,m[n])){return}p=p[m[n]];if(n<(l-1)&&!(p instanceof Object)){return}}return p},isNumeric:function(l){var m=false;if(i.isUndefOrNull(l)||!(/\S/.test(l))){return m}m=!isNaN(l*2);return m},isUpperCase:function(l){return l===l.toUpperCase()&&l!==l.toLowerCase()},isLowerCase:function(l){return l===l.toLowerCase()&&l!==l.toUpperCase()},extractResponseHeaders:function(n){var p={},m,l,o=null;if(!n||!n.length){n=[]}else{n=n.split("\n")}for(m=0,l=n.length;m<l;m+=1){o=n[m].split(": ");if(o.length===2){p[o[0]]=o[1]}}return p},getTargetState:function(s){var q={a:["innerText","href"],input:{range:["maxValue:max","value"],checkbox:["value","checked"],radio:["value","checked"],image:["src"]},select:["value"],button:["value","innerText"],textarea:["value"]},o=this.getTagName(s),n=q[o]||null,p=null,r=null,m=null,l="";if(n!==null){if(Object.prototype.toString.call(n)==="[object Object]"){n=n[s.type]||["value"]}r={};for(l in n){if(n.hasOwnProperty(l)){if(n[l].indexOf(":")!==-1){m=n[l].split(":");r[m[0]]=s[m[1]]}else{if(n[l]==="innerText"){r[n[l]]=this.trim(s.innerText||s.textContent)}else{r[n[l]]=s[n[l]]}}}}}if(o==="select"&&s.options&&!isNaN(s.selectedIndex)){r=r||{};r.index=s.selectedIndex;if(r.index>=0&&r.index<s.options.length){p=s.options[s.selectedIndex];r.value=p.getAttribute("value")||p.getAttribute("label")||p.text||p.innerText;r.text=p.text||p.innerText}}if(r&&s.disabled){r.disabled=true}return r},getDocument:function(l){var m=l;if(l&&l.nodeType!==9){if(l.getRootNode){m=l.getRootNode()}else{m=l.ownerDocument||l.document}}return m},getWindow:function(m){try{if(m.self!==m){var l=i.getDocument(m);return(!i.isUndefOrNull(l.defaultView))?(l.defaultView):(l.parentWindow)}}catch(n){m=null}return m},getOriginAndPath:function(t){var o={},v,w,r,u,s,l=[],m={},p,n;t=t||window.location;if(t.origin){o.origin=t.origin}else{o.origin=(t.protocol||"")+"//"+(t.host||"")}o.path=(t.pathname||"").split(";",1)[0];if(o.origin.indexOf("file://")>-1||(i.isiOS&&window.Ionic)){v=o.path.match(/(.*)(\/.*app.*)/);if(v!==null){o.path=v[2];o.origin="file://"}}w=t.search||"";try{r=new URLSearchParams(w);r.forEach(function(x,y){m[y]=x})}catch(q){if(w.length>1&&w.charAt(0)==="?"){l=decodeURIComponent(w).substring(1).split("&")}for(p=0;p<l.length;p+=1){n=l[p].indexOf("=");if(n>-1){u=l[p].substring(0,n);s=l[p].substring(n+1);m[u]=s}}}o.queryParams=m;return o},getIFrameWindow:function(n){var l=null;if(!n){return l}try{l=n.contentWindow||(n.contentDocument?n.contentDocument.parentWindow:null)}catch(m){}return l},getTagName:function(m){var l="";if(i.isUndefOrNull(m)){return l}if(m===document||m.nodeType===9){l="document"}else{if(m===window||m===window.window){l="window"}else{if(typeof m==="string"){l=m.toLowerCase()}else{l=(m.tagName||m.nodeName||"").toLowerCase()}}}return l},getTlType:function(n){var l,m,o="";if(i.isUndefOrNull(n)||!n.type){return o}l=n.type.toLowerCase();m=l+":";if(n.subType){m+=n.subType.toLowerCase()}o=d[m]||l;return o},isIFrameDescendant:function(m){var l=i.getWindow(m);return(l?(l!=TLT._getLocalTop()):false)},getOrientationMode:function(l){var m="INVALID";if(typeof l!=="number"){return m}switch(l){case 0:case 180:case 360:m="PORTRAIT";break;case 90:case -90:case 270:m="LANDSCAPE";break;default:m="UNKNOWN";break}return m},getOrientationAngle:function(){if(typeof window.orientation==="number"){return window.orientation}var l=(screen.orientation||{}).angle;if(typeof l!=="number"){switch(screen.mozOrientation||screen.msOrientation){case"landscape-primary":case"landscape-secondary":l=90;break;default:l=0;break}}return l},clog:(function(l){return function(){}}(window)),trim:function(l){if(!l||!l.toString){return l}return l.toString().replace(/^\s+|\s+$/g,"")},ltrim:function(l){if(!l||!l.toString){return l}return l.toString().replace(/^\s+/,"")},rtrim:function(l){if(!l||!l.toString){return l}return l.toString().replace(/\s+$/,"")},setCookie:function(w,m,u,z,q,l,t){var r,s,p,o,n="",y,v,x;if(t==="None"){l=true}else{if(t!=="Lax"){t="Strict"}}x=";SameSite="+t;v=l?";Secure":"";if(!w){return}w=encodeURIComponent(w);m=encodeURIComponent(m);p=(q||location.hostname).split(".");y=";Path="+(z||"/");if(typeof u==="number"){if(this.isIE){o=new Date();o.setTime(o.getTime()+(u*1000));n=";Expires="+o.toUTCString()}else{n=";Max-Age="+u}}for(s=p.length,r=(s===1?1:2);r<=s;r+=1){document.cookie=w+"="+m+";Domain="+p.slice(-r).join(".")+y+n+v+x;if(this.getCookieValue(w)===m){break}if(s===1){document.cookie=w+"="+m+y+n+v+x}}},getCookieValue:function(r,t){var o,p,n,s,m=null,l;try{t=t||document.cookie;if(!r||!r.toString){return null}r+="=";l=r.length;s=t.split(";");for(o=0,p=s.length;o<p;o+=1){n=s[o];n=i.ltrim(n);if(n.indexOf(r)===0){m=n.substring(l,n.length);break}}}catch(q){m=null}return m},getQueryStringValue:function(p,s,l){var o,n,t,m=null,q;try{l=l||window.location.search;t=l.length;if(!p||!p.toString||!t){return null}s=s||"&";l=s+l.substring(1);p=s+p+"=";o=l.indexOf(p);if(o!==-1){q=o+p.length;n=l.indexOf(s,q);if(n===-1){n=t}m=decodeURIComponent(l.substring(q,n))}}catch(r){}return m},addEventListener:(function(){if(window.addEventListener){return function(m,l,n){m.addEventListener(l,n,false)}}return function(m,l,n){m.attachEvent("on"+l,n)}}()),matchTarget:function(v,r){var p,n,o,u=-1,t,l,m,q,s,w=document;if(!v||!r){return u}if(!this.browserService||!this.browserBaseService){this.browserService=TLT.getService("browser");this.browserBaseService=TLT.getService("browserBase")}if(r.idType===-2){o=this.browserBaseService.getNodeFromID(r.id,r.idType);w=this.getDocument(o)}for(p=0,q=v.length;p<q&&u===-1;p+=1){s=v[p];if(typeof s==="string"){t=this.browserService.queryAll(s,w);for(n=0,l=t?t.length:0;n<l;n+=1){if(t[n]){m=this.browserBaseService.ElementData.prototype.examineID(t[n]);if(m.idType===r.idType&&m.id===r.id){u=p;break}}}}else{if(s&&s.id&&s.idType&&r.idType&&r.idType.toString()===s.idType.toString()){switch(typeof s.id){case"string":if(s.id===r.id){u=p}break;case"object":if(!s.cRegex){s.cRegex=new RegExp(s.id.regex,s.id.flags)}s.cRegex.lastIndex=0;if(s.cRegex.test(r.id)){u=p}break}}}}return u},WeakMap:(function(){function l(p,o){var n,m;p=p||[];for(n=0,m=p.length;n<m;n+=1){if(p[n][0]===o){return n}}return -1}return function(){var m=[];this.set=function(o,p){var n=l(m,o);m[n>-1?n:m.length]=[o,p]};this.get=function(o){var n=m[l(m,o)];return(n?n[1]:undefined)};this.clear=function(){m=[]};this.has=function(n){return(l(m,n)>=0)};this.remove=function(o){var n=l(m,o);if(n>=0){m.splice(n,1)}};this["delete"]=this.remove}}())};if(typeof TLT==="undefined"||!TLT){window.TLT={}}TLT.utils=i}());(function(){TLT.EventTarget=function(){this._handlers={}};TLT.EventTarget.prototype={constructor:TLT.EventTarget,publish:function(c,f){var d=0,a=0,b=this._handlers[c],e={type:c,data:f};if(typeof b!=="undefined"){for(a=b.length;d<a;d+=1){b[d](e)}}},subscribe:function(a,b){if(!this._handlers.hasOwnProperty(a)){this._handlers[a]=[]}this._handlers[a].push(b)},unsubscribe:function(c,e){var d=0,a=0,b=this._handlers[c];if(b){for(a=b.length;d<a;d+=1){if(b[d]===e){b.splice(d,1);return}}}}}}());TLT.ModuleContext=(function(){var a=["broadcast","getConfig:getModuleConfig","listen","post","getXPathFromNode","performDOMCapture","performFormCompletion","isInitialized","getStartTime","normalizeUrl","getSessionStart","getTabId","setSessionCookieInfo"];return function(f,d){var h={},g,b,j=null,e=null,c=null;for(g=0,b=a.length;g<b;g+=1){j=a[g].split(":");if(j.length>1){c=j[0];e=j[1]}else{c=j[0];e=j[0]}h[c]=(function(i){return function(){var k=d.utils.convertToArray(arguments);k.unshift(f);return d[i].apply(d,k)}}(e))}h.utils=d.utils;return h}}());TLT.addService("config",function(a){function d(f,e){a.utils.extend(true,f,e);c.publish("configupdated",c.getConfig())}var b={core:{},modules:{},services:{}},c=a.utils.extend(false,a.utils.createObject(new TLT.EventTarget()),{getConfig:function(){return b},updateConfig:function(e){d(b,e)},getCoreConfig:function(){return b.core},updateCoreConfig:function(e){d(b.core,e)},getServiceConfig:function(e){return b.services[e]||{}},updateServiceConfig:function(f,e){if(typeof b.services[f]==="undefined"){b.services[f]={}}d(b.services[f],e)},getModuleConfig:function(e){return b.modules[e]||{}},updateModuleConfig:function(f,e){if(typeof b.modules[f]==="undefined"){b.modules[f]={}}d(b.modules[f],e)},destroy:function(){b={core:{},modules:{},services:{}}}});return c});TLT.addService("queue",function(r){var M=r.utils,k=null,i={},G=600000,p=r.getService("ajax"),c=r.getService("browser"),e=r.getService("encoder"),v=r.getService("serializer"),E=r.getService("config"),s=r.getService("message"),A=null,m={},J=true,h=true,z={5:{limit:300,count:0},6:{limit:400,count:0}},d=[],C=false,q=true,I=true,u=(function(){var S={};function V(W){return typeof S[W]!=="undefined"}function O(W,X){if(!V(W)){S[W]={lastOffset:0,data:[],queueId:W,url:X.url,eventThreshold:X.eventThreshold,sizeThreshold:X.sizeThreshold||0,timerInterval:X.timerInterval,size:-1,serializer:X.serializer,encoder:X.encoder,crossDomainEnabled:!!X.crossDomainEnabled,crossDomainIFrame:X.crossDomainIFrame}}return S[W]}function Q(W){if(V(W)){delete S[W]}}function T(W){if(V(W)){return S[W]}return null}function R(X){var W=T(X);if(W!==null){W.data=[]}}function U(W){var X=null;if(V(W)){X=T(W).data;R(W)}return X}function P(Y,aa){var W=null,Z=null,ac=window.tlBridge,X=window.iOSJSONShuttle;try{Z=v.serialize(aa)}catch(ab){Z="Serialization failed: "+(ab.name?ab.name+" - ":"")+ab.message;aa={error:Z}}if((typeof ac!=="undefined")&&(typeof ac.addMessage==="function")){ac.addMessage(Z)}else{if((typeof X!=="undefined")&&(typeof X==="function")){X(Z)}else{if(V(Y)){W=T(Y);W.data.push(aa);W.data=r.redirectQueue(W.data);if(W.sizeThreshold){Z=v.serialize(W.data);W.size=Z.length}return W.data.length}}}return 0}return{exists:V,add:O,remove:Q,reset:function(){S={}},get:T,clear:R,flush:U,push:P}}());function n(O){if(q){I=true}if(O&&O.id){M.extend(true,d[O.id-1],{rspEnd:s.createMessage({type:0}).offset,success:O.success,statusCode:O.statusCode,statusText:O.statusText})}}function x(){var O=M.getOriginAndPath(window.location);return r.normalizeUrl(O.path)}function B(Q,U,R,T){var O=u.get(Q),S={name:U,value:R},P=null;if(typeof U!=="string"||typeof R!=="string"){return}if(!O.headers){O.headers={once:[],always:[]}}P=!!T?O.headers.always:O.headers.once;P.push(S)}function g(Q,T){var S,P,O=u.get(Q),U=O.headers,R=null;T=T||{};function V(X,Z){var Y,W,aa=null;for(Y=0,W=X.length;Y<W;Y+=1){aa=X[Y];Z[aa.name]=aa.value}}if(U){R=[U.always,U.once];for(S=0,P=R.length;S<P;S+=1){V(R[S],T)}}return T}function o(P){var O=null,Q=null;if(!u.exists(P)){throw new Error("Queue: "+P+" does not exist!")}O=u.get(P);Q=O?O.headers:null;if(Q){Q.once=[]}}function l(){var P=0,O,R,Q=r.provideRequestHeaders();if(Q&&Q.length){for(P=0,O=Q.length;P<O;P+=1){R=Q[P];B("DEFAULT",R.name,R.value,R.recurring)}}return P}function L(S){var R,O,Q=[],P="";if(!S||!S.length){return P}for(R=0,O=S.length;R<O;R+=1){Q[S[R].type]=true}for(R=0,O=Q.length;R<O;R+=1){if(Q[R]){if(P){P+=","}P+=R}}return P}function j(af,U){var Y=u.get(af),ah=Y.url?u.flush(af):null,R=ah?ah.length:0,T={"Content-Type":"application/json","X-PageId":r.getPageId(),"X-Tealeaf":"device (UIC) Lib/6.0.0.1960","X-TealeafType":"GUI","X-TeaLeaf-Page-Url":x(),"X-Tealeaf-SyncXHR":(!!U).toString()},S=null,O=s.createMessage({type:0}).offset,ad=Y.serializer||"json",P=Y.encoder,ab,V,X,W=k.tltWorker,ag=r.getState()==="unloading",aa=M.getOriginAndPath().origin,Q=r.isCrossOrigin(Y.url,aa),Z,ae=null;if(!R||!Y){return}X=O-ah[R-1].offset;if(G&&X>(G+60000)){return}I=false;Y.lastOffset=ah[R-1].offset;T["X-Tealeaf-MessageTypes"]=L(ah);ah=s.wrapMessages(ah);S=ah.serialNumber;d[S-1]={serialNumber:S,reqStart:O};ah.log={requests:d};if(k.endpointCheckFailed){ah.log.endpointCheckFailed=true}l();g(af,T);if(W&&!(U||ag)){W.onmessage=function(aj){var ai;ai=aj.data;n(ai)};Z={id:S,url:Y.url,headers:T,data:ah,isUnloading:ag,isCrossOrigin:Q};W.postMessage(Z)}else{if(ad){ah=v.serialize(ah,ad)}if(P){V=e.encode(ah,P);if(V){if(V.data&&!V.error){if(!(V.data instanceof window.ArrayBuffer)){V.error="Encoder did not apply "+P+" encoding."}else{if(V.data.byteLength<ah.length){ah=V.data;T["Content-Encoding"]=V.encoding}else{V.error=P+" encoder did not reduce payload ("+V.data.byteLength+") compared to original data ("+ah.length+")"}}}if(V.error){r.logExceptionEvent("EncoderError: "+V.error,"UIC",-1)}}}if(Y.crossDomainEnabled){ae=M.getIFrameWindow(Y.crossDomainIFrame);if(!ae){return}ab={request:{id:S,url:Y.url,async:!U,headers:T,data:ah}};if(typeof window.postMessage==="function"){ae.postMessage(ab,Y.crossDomainIFrame.src)}else{try{ae.sendMessage(ab)}catch(ac){return}}I=true}else{p.sendRequest({id:S,oncomplete:n,url:Y.url,async:!U,isUnloading:ag,isCrossOrigin:Q,headers:T,data:ah})}}o(af)}function K(R){var O=null,Q=k.queues,P;for(P=0;P<Q.length;P+=1){O=Q[P];j(O.qid,R)}return true}function N(R,T){var Q,P,U=s.createMessage(T),O=u.get(R),S,V;P=O.data.length;if(P){V=U.offset-O.data[P-1].offset;if(G&&V>G){r.setAutoFlush(false);r.destroy(false,"inactivity(2)");return}}P=u.push(R,U);S=O.size;if(q&&!I){return}if((P>=O.eventThreshold||S>=O.sizeThreshold)&&J&&r.getState()!=="unloading"){Q=r.getCurrentWebEvent();if(Q.type==="click"&&!k.ddfoc){if(h){h=false;window.setTimeout(function(){if(u.exists(R)){j(R);h=true}},500)}}else{j(R)}}}function a(Q){var O,P=false;if(!Q||!Q.type){return true}O=z[Q.type];if(O){O.count+=1;if(O.count>O.limit){P=true;if(O.count===O.limit+1){N("DEFAULT",{type:16,dataLimit:{messageType:Q.type,maxCount:O.limit}})}}}return P}function H(Q){var S,P,O=null,T=k.queues,R="",V,U;for(S=0,V=T.length;S<V;S+=1){O=T[S];if(O&&O.modules){for(P=0,U=O.modules.length;P<U;P+=1){R=O.modules[P];if(R===Q){return O.qid}}}}return A.qid}function y(Q,O){m[Q]=window.setTimeout(function P(){if(J&&(!q||(q&&I))){j(Q)}m[Q]=window.setTimeout(P,O)},O)}function f(P){var O=false;if(P&&m[P]){window.clearTimeout(m[P]);delete m[P];O=true}return O}function w(){var O=0;for(O in m){if(m.hasOwnProperty(O)){f(O)}}m={}}function b(P){var O;if(!P){return}if(f(P)){O=u.get(P);if(O.timerInterval){y(P,O.timerInterval)}}}function F(O){}function t(O){k=O;i=r.getCoreConfig();G=M.getValue(i,"inactivityTimeout",600000);q=M.getValue(k,"serializePost",true);M.forEach(k.queues,function(P,Q){var R=null;if(P.qid==="DEFAULT"){A=P}if(P.crossDomainEnabled){R=c.query(P.crossDomainFrameSelector);if(!R){r.fail("Cross domain iframe not found")}}u.add(P.qid,{url:P.endpoint,eventThreshold:P.maxEvents,sizeThreshold:P.maxSize||0,serializer:P.serializer,encoder:P.encoder,timerInterval:P.timerInterval||0,crossDomainEnabled:P.crossDomainEnabled||false,crossDomainIFrame:R});if(typeof P.timerInterval!=="undefined"&&P.timerInterval>0){y(P.qid,P.timerInterval)}});E.subscribe("configupdated",F);C=true}function D(){if(J){K(!k.asyncReqOnUnload)}E.unsubscribe("configupdated",F);w();u.reset();k=null;A=null;C=false}return{init:function(){if(!C){t(E.getServiceConfig("queue")||{})}else{}},destroy:function(){D()},_getQueue:function(O){return u.get(O).data},setAutoFlush:function(O){if(O===true){J=true}else{J=false}},flush:function(O){O=O||A.qid;if(!u.exists(O)){throw new Error("Queue: "+O+" does not exist!")}j(O)},flushAll:function(O){return K(!!O)},post:function(P,Q,O){if(!r.isInitialized()){return}O=O||H(P);if(!u.exists(O)){return}if(!a(Q)){N(O,Q)}},resetFlushTimer:function(O){O=O||A.qid;if(!u.exists(O)){return}b(O)}}});TLT.addService("browserBase",function(s){var h,M=s.utils,j={optgroup:true,option:true,nobr:true},q={},f,n=null,B,x,g,d,r,G=false;function t(){f=s.getService("config");n=s.getService("serializer");B=f?f.getServiceConfig("browser"):{};x=B.blacklist||[];g=B.customid||[];d=M.getValue(B,"normalizeTargetToParentLink",true)}function b(){t();if(f){f.subscribe("configupdated",t)}G=true}function H(){if(f){f.unsubscribe("configupdated",t)}G=false}function w(P){var O,N;if(!P||!P.id||typeof P.id!=="string"){return false}for(O=0,N=x.length;O<N;O+=1){if(typeof x[O]==="string"){if(P.id===x[O]){return false}}else{if(typeof x[O]==="object"){if(!x[O].cRegex){x[O].cRegex=new RegExp(x[O].regex,x[O].flags)}x[O].cRegex.lastIndex=0;if(x[O].cRegex.test(P.id)){return false}}}}return true}function p(P,Q){var N={type:null,subType:null},O;if(!P){return N}O=P.type;switch(O){case"focusin":O="focus";break;case"focusout":O="blur";break;default:break}N.type=O;return N}function z(O){var N={type:null,subType:null};if(!O){return N}N.type=M.getTagName(O);N.subType=O.type||null;return N}function c(N,P,O){var T={HTML_ID:"-1",XPATH_ID:"-2",ATTRIBUTE_ID:"-3"},S,Q=null,R;if(!N||!P){return Q}S=O||window.document;P=P.toString();if(P===T.HTML_ID){if(S.getElementById){Q=S.getElementById(N)}else{if(S.querySelector){Q=S.querySelector("#"+N)}}}else{if(P===T.ATTRIBUTE_ID){R=N.split("=");if(S.querySelector){Q=S.querySelector("["+R[0]+'="'+R[1]+'"]')}}else{if(P===T.XPATH_ID){Q=q.xpath(N,S)}}}return Q}r=(function(){var N={nobr:true};return function(T,Q,Z){var U,ac=document.documentElement,V=false,ab=null,S=null,Y=null,aa=[],O,X=true,R=s._getLocalTop(),P="",W=false,ad;if(!T||!T.nodeType){return aa}if(T.nodeType===11){T=T.host;if(T){W=true}else{return aa}}while(X){X=false;P=M.getTagName(T);if(P==="window"){continue}if(P&&!W){if(N[P]){T=T.parentNode;X=true;continue}}for(V=w(T);T&&(T.nodeType===1||T.nodeType===9)&&T!==document&&(Q||!V);V=w(T)){Y=T.parentNode;if(!Y){S=M.getWindow(T);if(!S||Z){O=[P,0];aa[aa.length]=O;return aa.reverse()}if(S===R){return aa.reverse()}T=S.frameElement;P=M.getTagName(T);Y=T.parentNode;continue}ab=Y.firstChild;if(!ab){aa.push(["XPath Error(1)"]);T=null;break}for(U=0;ab;ab=ab.nextSibling){if(ab.nodeType===1&&M.getTagName(ab)===P){if(ab===T){O=[P,U];if(W){O.push("h");W=false}aa[aa.length]=O;break}U+=1}}if(Y.nodeType===11){T=Y.host;W=true}else{T=Y}P=M.getTagName(T)}if(V&&!Q){O=[T.id];if(W){O.push("h");W=false}aa[aa.length]=O;if(M.isIFrameDescendant(T)){X=true;T=M.getWindow(T).frameElement}else{if(!Z&&!ac.contains(T)){if(T.getRootNode){ad=T.getRootNode();if(ad){T=ad.host;W=true;X=true}}}}}}return aa.reverse()}}());function D(N){var O="null";if(!N||!N.length){return O}O=n.serialize(N,"json");return O}function v(Q,O,S,P){var R,N;N=r(Q,!!O,!!P);if(S){R=N}else{R=D(N)}return R}function L(O){var P={left:-1,top:-1},N;O=O||document;N=O.documentElement||O.body.parentNode||O.body;P.left=Math.round((typeof window.pageXOffset==="number")?window.pageXOffset:N.scrollLeft);P.top=Math.round((typeof window.pageYOffset==="number")?window.pageYOffset:N.scrollTop);return P}function K(N){return N&&typeof N.originalEvent!=="undefined"&&typeof N.isDefaultPrevented!=="undefined"&&!N.isSimulated}function k(N){if(!N){return null}if(N.type&&N.type.indexOf("touch")===0){if(K(N)){N=N.originalEvent}if(N.type==="touchstart"){N=N.touches[N.touches.length-1]}else{if(N.type==="touchend"){N=N.changedTouches[0]}}}return N}function u(O){var T=O||window.event,R,U=document.documentElement,S=document.body,V=false,N=null,P,Q;if(K(T)){T=T.originalEvent}if(typeof O==="undefined"||typeof T.target==="undefined"){T.target=T.srcElement||window.window;T.timeStamp=Number(new Date());if(T.pageX===null||typeof T.pageX==="undefined"){T.pageX=T.clientX+((U&&U.scrollLeft)||(S&&S.scrollLeft)||0)-((U&&U.clientLeft)||(S&&S.clientLeft)||0);T.pageY=T.clientY+((U&&U.scrollTop)||(S&&S.scrollTop)||0)-((U&&U.clientTop)||(S&&S.clientTop)||0)}T.preventDefault=function(){this.returnValue=false};T.stopPropagation=function(){this.cancelBubble=true}}if(T.type==="click"){R=T.composedPath?T.composedPath():[];for(Q=0;Q<R.length;Q+=1){P=M.getTagName(R[Q]);if(P==="button"){V=true;N=R[Q];break}}if(V){return{originalEvent:T,target:N,srcElement:N,type:T.type,pageX:T.pageX,pageY:T.pageY}}}return T}function y(P){var O,N,Q,R=null;if(!P||!P.type){return null}if(P.type.indexOf("touch")===0){R=k(P).target}else{if(typeof P.composedPath==="function"){Q=P.composedPath();if(Q&&Q.length){R=Q[0];if(d){for(O=0,N=Q.length;O<N;O+=1){if(M.getTagName(Q[O])==="a"){R=Q[O];break}}}}else{R=P.target||window.window}}else{if(P.srcElement){R=P.srcElement}else{R=P.target}}}while(R&&j[M.getTagName(R)]){if(R.parentElement){R=R.parentElement}else{break}}if(R.nodeType===9&&R.documentElement){R=R.documentElement}return R}function J(O){var R=0,Q=0,P=document.documentElement,N=document.body;O=k(O);if(O){if(O.pageX||O.pageY){R=O.pageX;Q=O.pageY}else{if(O.clientX||O.clientY){R=O.clientX+(P?P.scrollLeft:(N?N.scrollLeft:0))-(P?P.clientLeft:(N?N.clientLeft:0));Q=O.clientY+(P?P.scrollTop:(N?N.scrollTop:0))-(P?P.clientTop:(N?N.clientTop:0))}}}return{x:R,y:Q}}q.xpath=function(V,X){var T=null,O,U=null,Y=false,N,R,Q,P,S,W;if(!V){return null}T=n.parse(V);X=X||document;O=X;if(!T){return null}for(R=0,S=T.length;R<S&&O;R+=1){U=T[R];Y=U.length>1&&U[U.length-1]==="h";if(U.length===1||(U.length===2&&Y)){if(X.getElementById){O=X.getElementById(U[0])}else{if(X.querySelector){O=X.querySelector("#"+U[0])}else{O=null}}}else{for(Q=0,P=-1,W=O.childNodes.length;Q<W;Q+=1){if(O.childNodes[Q].nodeType===1&&M.getTagName(O.childNodes[Q])===U[0].toLowerCase()){P+=1;if(P===U[1]){O=O.childNodes[Q];break}}}if(P!==U[1]){return null}}if(!O){return null}if(Y){if(R<S-1){if(!O.shadowRoot){return null}O=O.shadowRoot;X=O}}N=M.getTagName(O);if(N==="frame"||N==="iframe"){O=M.getIFrameWindow(O).document;X=O}}return(O===X||!O)?null:O};function m(N,O){this.x=Math.round(N||0);this.y=Math.round(O||0)}function a(O,N){this.width=Math.round(O||0);this.height=Math.round(N||0)}function e(O,P){var R,N,Q;P=y(O);R=this.examineID(P);N=z(P);Q=this.examinePosition(O,P);this.element=P;this.id=R.id;this.idType=R.idType;this.type=N.type;this.subType=N.subType;this.state=this.examineState(P);this.position=new m(Q.x,Q.y);this.position.relXY=Q.relXY;this.size=new a(Q.width,Q.height);this.xPath=R.xPath;this.name=R.name}e.HTML_ID=-1;e.XPATH_ID=-2;e.ATTRIBUTE_ID=-3;e.prototype.examineID=function(U,P){var S={id:"",idType:0,xPath:"",name:""},O=g.length,R,N,Q=document.documentElement;if(!U){return S}S.xPath=v(U,false,false,P);S.name=U.name;try{N=typeof Q.contains==="function"?Q.contains(U):true;if((P||N)&&(!M.getWindow(U)||!M.isIFrameDescendant(U))){if(w(U)){S.id=U.id;S.idType=e.HTML_ID}else{if(g.length&&U.attributes){while(O){O-=1;R=U.attributes[g[O]];if(typeof R!=="undefined"){S.id=g[O]+"="+(R.value||R);S.idType=e.ATTRIBUTE_ID}}}}}}catch(T){}if(!S.id){S.id=S.xPath;if(S.id!=="null"){S.idType=e.XPATH_ID}}return S};e.prototype.examineState=function(N){return M.getTargetState(N)};function F(){var O=1,P,R,N;if(document.body.getBoundingClientRect){try{P=document.body.getBoundingClientRect()}catch(Q){return O}R=P.right-P.left;N=document.body.offsetWidth;O=Math.round((R/N)*100)/100}return O}function o(O){var Q,N,P,S;if(!O||!O.getBoundingClientRect){return{x:0,y:0,width:0,height:0}}try{Q=O.getBoundingClientRect();S=L(document)}catch(R){return{x:0,y:0,width:0,height:0}}N={x:Q.left+S.left,y:Q.top+S.top,width:Q.right-Q.left,height:Q.bottom-Q.top};if(M.isIE){N.x-=document.documentElement.clientLeft;N.y-=document.documentElement.clientTop;P=F();if(P!==1){N.x=Math.round(N.x/P);N.y=Math.round(N.y/P);N.width=Math.round(N.width/P);N.height=Math.round(N.height/P)}}return N}e.prototype.examinePosition=function(O,P){var Q=J(O),N=o(P);N.x=(Q.x||Q.y)?Math.round(Math.abs(Q.x-N.x)):N.width/2;N.y=(Q.x||Q.y)?Math.round(Math.abs(Q.y-N.y)):N.height/2;N.relXY=M.calculateRelativeXY(N);return N};function I(){var N=M.getOrientationAngle();if(M.isLandscapeZeroDegrees){if(Math.abs(N)===180||Math.abs(N)===0){N=90}else{if(Math.abs(N)===90||Math.abs(N)===270){N=0}}}return N}function C(T){var Q,N,S,R,P,O;if(T){return T}S=s.getCoreConfig()||{};P=S.modules;T={};for(O in P){if(P.hasOwnProperty(O)&&P[O].events){for(Q=0,N=P[O].events.length;Q<N;Q+=1){R=P[O].events[Q];if(R.state){T[R.name]=R.state}}}}return T}function i(N){var O;h=C(h);if(h[N.type]){O=M.getValue(N,h[N.type],null)}return O}function l(O){var Q,N,P;this.data=O.data||null;this.delegateTarget=O.delegateTarget||null;if(O.gesture||(O.originalEvent&&O.originalEvent.gesture)){this.gesture=O.gesture||O.originalEvent.gesture;this.gesture.idType=(new e(this.gesture,this.gesture.target)).idType}O=u(O);Q=J(O);this.custom=false;this.nativeEvent=this.custom===true?null:O;this.position=new m(Q.x,Q.y);this.target=new e(O,O.target);this.orientation=I();P=i(O);if(P){this.target.state=P}this.timestamp=(new Date()).getTime();N=p(O,this.target);this.type=N.type;this.subType=N.subType}function E(N){if(s.isInitialized()){s._publishEvent(new l(N))}else{}}function A(S,R){var O=[],N,Q,P=[];if(!(this instanceof A)){return null}if(typeof S!=="object"||!S.nodeType){this.fullXpath="";this.xpath="";this.fullXpathList=[];this.xpathList=[];return}if(S.nodeType===3){S=S.parentElement}P=r(S,false,R);N=P[0];if(P.length&&(N.length===1||(N.length===2&&N[1]==="h"))){O=r(S,true,R)}else{O=M.clone(P)}this.xpath=D(P);this.xpathList=P;this.fullXpath=D(O);this.fullXpathList=O;Q=O[O.length-1];this.isShadowHost=Q?Q[Q.length-1]==="h":false;this.applyPrefix=function(V){var T,U;if(!(V instanceof A)||!V.fullXpathList.length){return}U=V.fullXpathList[V.fullXpathList.length-1];T=this.fullXpathList.shift();if(M.isEqual(T[0],U[0])){this.fullXpathList=V.fullXpathList.concat(this.fullXpathList)}else{this.fullXpathList.unshift(T);return}this.fullXpath=D(this.fullXpathList);T=this.xpathList.shift();if(T.length===1){this.xpathList.unshift(T);return}this.xpathList=V.xpathList.concat(this.xpathList);this.xpath=D(this.xpathList)};this.compare=function(T){if(!(T instanceof A)){return 0}return(this.fullXpathList.length-T.fullXpathList.length)};this.isSame=function(T){var U=false;if(!(T instanceof A)){return U}if(this.compare(T)===0){U=(this.fullXpath===T.fullXpath)}return U};this.containedIn=function(V,U){var X,W,T,Y;if(!(V instanceof A)){return false}if(V.fullXpathList.length>this.fullXpathList.length){return false}for(X=0,T=V.fullXpathList.length;X<T;X+=1){if(!M.isEqual(V.fullXpathList[X],this.fullXpathList[X])){return false}}if(!U){for(W=X,T=this.fullXpathList.length;W<T;W+=1){Y=this.fullXpathList[W];if(Y[Y.length-1]==="h"){return false}}}return true}}A.prototype=(function(){return{}}());return{init:function(){if(!G){b()}else{}},destroy:function(){H()},WebEvent:l,ElementData:e,Xpath:A,processDOMEvent:E,getNormalizedOrientation:I,getXPathFromNode:function(O,Q,N,R,P){return v(Q,N,R,P)},getNodeFromID:c,queryDom:q}});TLT.addService("browser",function(d){var m=d.utils,h=d.getService("config"),f=d.getService("browserBase"),g=null,c=null,k=h?h.getServiceConfig("browser"):{},b=m.getValue(k,"useCapture",true),l=false,e={NO_QUERY_SELECTOR:"NOQUERYSELECTOR"},o=function(p){return function(r){var q=new f.WebEvent(r);if(r.type==="resize"||r.type==="hashchange"){setTimeout(function(){p(q)},5)}else{p(q)}}},a={list2Array:function(r){var q=r.length,p=[],s;if(typeof r.length==="undefined"){return[r]}for(s=0;s<q;s+=1){p[s]=r[s]}return p},find:function(r,q,p){p=p||"css";return this.list2Array(this[p](r,q))},css:function(s,r){var q=this,p=document.getElementsByTagName("body")[0],v=k.jQueryObject?m.access(k.jQueryObject):window.jQuery,u=k.sizzleObject?m.access(k.sizzleObject):window.Sizzle;if(typeof document.querySelectorAll==="undefined"){q.css=function(y,x){x=x||document;return q.Sizzle(y,x)};if(typeof q.Sizzle==="undefined"){try{if(p===u("html > body",document)[0]){q.Sizzle=u}}catch(w){try{if(p===v(document).find("html > body").get()[0]){q.Sizzle=function(y,x){return v(x).find(y).get()}}}catch(t){d.fail("Neither querySelectorAll nor Sizzle was found.",e.NO_QUERY_SELECTOR)}}}}else{q.css=function(y,x){x=x||document;return x.querySelectorAll(y)}}return q.css(s,r)}},n=(function(){var p=new m.WeakMap();return{add:function(q){var r=p.get(q)||[o(q),0];r[1]+=1;p.set(q,r);return r[0]},find:function(q){var r=p.get(q);return r?r[0]:null},remove:function(q){var r=p.get(q);if(r){r[1]-=1;if(r[1]<=0){p.remove(q)}}}}}());function j(){var q=k.jQueryObject?m.access(k.jQueryObject):window.jQuery,p=k.sizzleObject?m.access(k.sizzleObject):window.Sizzle;if(!document.querySelectorAll&&!q&&!p){d.fail("querySelectorAll does not exist!",e.NO_QUERY_SELECTOR)}}function i(){a.xpath=f.queryDom.xpath;j();if(typeof document.addEventListener==="function"){g=function(r,p,q){r.addEventListener(p,q,b)};c=function(r,p,q){r.removeEventListener(p,q,b)}}else{if(typeof document.attachEvent!=="undefined"){g=function(r,p,q){r.attachEvent("on"+p,q)};c=function(r,p,q){r.detachEvent("on"+p,q)}}else{throw new Error("Unsupported browser")}}l=true}return{init:function(){if(!l){i()}else{}},destroy:function(){l=false},getServiceName:function(){return"W3C"},query:function(s,q,p){try{return a.find(s,q,p)[0]||null}catch(r){return[]}},queryAll:function(s,q,p){try{return a.find(s,q,p)}catch(r){return[]}},subscribe:function(p,s,q){var r=n.add(q);g(s,p,r)},unsubscribe:function(p,t,q){var r=n.find(q);if(r){try{c(t,p,r)}catch(s){}n.remove(q)}}}});TLT.addService("ajax",function(e){var k=e.utils,i,m=false,b=false,j=false;function g(p){var o="",n=[];for(o in p){if(p.hasOwnProperty(o)){n.push([o,p[o]])}}return n}function h(p){var o="",n="?";for(o in p){if(p.hasOwnProperty(o)){n+=encodeURIComponent(o)+"="+encodeURIComponent(p[o])+"&"}}return n.slice(0,-1)}function l(n){var p,q=false,o=h(n.headers);if(typeof n.data==="string"){p=n.data}else{p=n.data?new Uint8Array(n.data):""}q=navigator.sendBeacon(n.url+o,p);return q}function f(o){var r=o.headers||{},q=o.id||0,p={method:o.type,headers:r,body:o.data,mode:o.isCrossOrigin?"cors":"same-origin",credentials:o.isCrossOrigin?"omit":"same-origin",keepalive:!o.isCrossOrigin&&o.isUnloading,cache:"no-store"},n=o.oncomplete||function(){};r["X-Requested-With"]="fetch";window.fetch(o.url,p).then(function(t){var s={success:t.ok,statusCode:t.status,statusText:t.statusText,id:q};if(s.success){t.text().then(function(u){try{s.data=JSON.parse(u)}catch(v){s.data=u}n(s)})["catch"](function(u){s.statusCode=1;s.statusText=u.message;n(s)})}else{n(s)}})["catch"](function(t){var s={success:false,statusCode:2,statusText:t.message,id:q};n(s)})}function a(o){if(typeof o!=="function"){return}return function n(q){var s,p,r=false;if(!q){return}s=q.target;if(!s){return o(q)}p=s.status;if(p>=200&&p<300){r=true}o({headers:k.extractResponseHeaders(s.getAllResponseHeaders()),responseText:s.responseText,statusCode:p,statusText:s.statusText,id:s.id,success:r})}}function d(v){var u=i(),o=[["X-Requested-With","XMLHttpRequest"]],t=0,p=typeof v.async!=="boolean"?true:v.async,r="",s=null,q,n;if(v.headers){o=o.concat(g(v.headers))}if(v.contentType){o.push(["Content-Type",v.contentType])}u.open(v.type.toUpperCase(),v.url,p);for(q=0,n=o.length;q<n;q+=1){r=o[q];if(r[0]&&r[1]){u.setRequestHeader(r[0],r[1])}}if(v.error){v.error=a(v.error);u.addEventListener("error",v.error)}u.onreadystatechange=s=function(){if(u.readyState===4){u.onreadystatechange=s=function(){};if(v.timeout){window.clearTimeout(t)}v.oncomplete({id:v.id,headers:k.extractResponseHeaders(u.getAllResponseHeaders()),responseText:(u.responseText||null),statusCode:u.status,statusText:u.statusText,success:(u.status>=200&&u.status<300)});u=null}};u.send(v.data||null);s();if(v.timeout){t=window.setTimeout(function(){if(!u){return}u.onreadystatechange=function(){};if(u.readyState!==4){u.abort();if(typeof v.error==="function"){v.error({id:v.id,statusCode:u.status,statusText:"timeout",success:false})}}v.oncomplete({id:v.id,headers:k.extractResponseHeaders(u.getAllResponseHeaders()),responseText:(u.responseText||null),statusCode:u.status,statusText:"timeout",success:false});u=null},v.timeout)}}function c(){var n=e.getServiceConfig("queue");if(typeof window.XMLHttpRequest!=="undefined"){i=function(){return new XMLHttpRequest()}}else{i=function(){return new ActiveXObject("Microsoft.XMLHTTP")}}if(n){m=k.getValue(n,"useBeacon",true)&&(typeof navigator.sendBeacon==="function");b=k.getValue(n,"useFetch",true)&&(typeof window.fetch==="function")}j=true}return{init:function(){if(!j){c()}},destroy:function(){j=false},sendRequest:function(n){var p=true,o;n.type=n.type||"POST";if((n.isUnloading||!n.async)&&m){p=false;o=l(n);if(!o){p=true}}if(p){if(n.async&&b&&!n.timeout){f(n)}else{d(n)}}}}});TLT.addService("domCapture",function(C){var j=C.getService("config"),k=C.getService("browserBase"),d=C.getService("browser"),y,i,g={maxMutations:100,maxLength:1000000,captureShadowDOM:false,captureFrames:false,removeScripts:true,removeComments:true,captureStyle:true},ab={childList:true,attributes:true,attributeOldValue:true,characterData:true,subtree:true},a=(typeof window.MutationObserver!=="undefined"),A,K=ab,R=[],M=[],z=[],ac=[],x=[],B=0,I=100,c=false,s=false,S=false,u=function(){},w=function(){},E=function(){},N=C._publishEvent,p=false,ah=C.utils;function J(){ac=[];x=[];B=0;c=false}function X(al){var ak,aj,ai;if(!al||!al.length){return}al=al.sort(function(an,am){return an.compare(am)});for(ak=0;ak<al.length;ak+=1){ai=al[ak];for(aj=ak+1;aj<al.length;aj+=0){if(al[aj].containedIn(ai)){al.splice(aj,1)}else{aj+=1}}}}function t(ak){var aj,ai;if(ak){for(aj=0,ai=ak.length;aj<ai;aj+=1){delete ak[aj].oldValue}}return ak}function e(am,ak){var aj,ai,al=false;if(!am||!ak){return al}for(aj=0,ai=am.length;aj<ai;aj+=1){if(am[aj].name===ak){al=true;break}}return al}function D(al,an){var ak,aj,ai,am;for(ak=0,aj=al.length,am=false;ak<aj;ak+=1){ai=al[ak];if(ai.name===an.name){if(ai.oldValue===an.value){al.splice(ak,1)}else{ai.value=an.value}am=true;break}}if(!am){al.push(an)}return al}function Q(an,ai){var am,ak,aj,ao,aq,ap,al;an.removedNodes=ai.removedNodes.length;an.addedNodes=ah.convertToArray(ai.addedNodes);for(am=0,ao=ac.length;am<ao;am+=1){ap=ac[am];if(an.isSame(ap)){if(an.removedNodes){for(ak=0;ak<ai.removedNodes.length;ak+=1){aj=ap.addedNodes.indexOf(ai.removedNodes[ak]);if(aj!==-1){ap.addedNodes.splice(aj,1);an.removedNodes-=1}}}ap.removedNodes+=an.removedNodes;ap.addedNodes.concat(an.addedNodes);if(!ap.removedNodes&&!ap.addedNodes.length){al=false;for(ak=0;ak<ac.length;ak+=1){if(ap!==ac[ak]&&ac[ak].containedIn(ap)){al=true;break}}if(!al){ac.splice(am,1)}}aq=true;break}}if(!aq){ac.push(an)}}function Y(aj,an){var al,ak,ai,ao=false,am,ap;for(al=0,ai=ac.length;!ao&&al<ai;al+=1){ap=ac[al];if(aj.containedIn(ap)){am=ap.addedNodes;for(ak=0;ak<am.length;ak+=1){if(am[ak].contains&&am[ak].contains(an)){ao=true;break}}}}return ao}function H(ak,aj){var an,ai,am,al,ao,ap=null;am=aj.attributeName;if(am==="checked"||am==="selected"){ap=k.ElementData.prototype.examineID(aj.target);if(y.isPrivacyMatched(ap)){return}ap=null}if(am==="value"){ap=k.ElementData.prototype.examineID(aj.target);ap.currState=ah.getTargetState(aj.target)||{};if(ap.currState.value){y.applyPrivacyToTarget(ap)}else{ap=null}}ak.attributes=[{name:am,oldValue:aj.oldValue,value:ap?ap.currState.value:aj.target.getAttribute(am)}];al=ak.attributes[0];if(al.oldValue===al.value){return}for(an=0,ai=x.length,ao=false;an<ai;an+=1){ap=x[an];if(ak.isSame(ap)){ap.attributes=D(ap.attributes,al);if(!ap.attributes.length){x.splice(an,1)}else{if(Y(ak,aj.target)){x.splice(an,1)}}ao=true;break}}if(!ao&&!Y(ak,aj.target)){x.push(ak)}}function o(al){var an,ai,am,aj,ak;if(!al||!al.length){return}B+=al.length;if(B>=I){if(!c){c=true}return}for(an=0,ai=al.length;an<ai;an+=1){aj=al[an];ak=new k.Xpath(aj.target);if(ak){am=ak.fullXpathList;if(am.length&&am[0][0]==="html"){switch(aj.type){case"characterData":case"childList":Q(ak,aj);break;case"attributes":H(ak,aj);break;default:ah.clog("Unknown mutation type: "+aj.type);break}}}}}function v(){var ai;ai=new window.MutationObserver(function(aj){if(aj){o(aj);ah.clog("Processed ["+aj.length+"] mutation records.");C.invokeMutationCallbacks(aj)}});return ai}function L(){var ai=Element.prototype.attachShadow;if(!A){return null}A.observe(window.document,K);if(ah.getValue(i,"options.captureShadowDOM",false)){Element.prototype.attachShadow=function(ak){var aj=ai.call(this,ak);if(this.shadowRoot){A.observe(this.shadowRoot,K)}return aj}}p=true;return A}function l(ak){var am,ai,al,ap,ao,aj,an=j.getCoreConfig();j.subscribe("configupdated",E);y=C.getService("message");i=ak;i.options=ah.mixin({},g,i.options);a=a&&ah.getValue(i,"diffEnabled",true);I=ah.getValue(i.options,"maxMutations",100);if(a){K=ah.getValue(i,"diffObserverConfig",ab);A=v();R.push(window)}aj=i.options.captureShadowDOM;if(aj&&!(window.ShadyDOM&&window.ShadyDOM.inUse)&&(Element.prototype.attachShadow||"").toString().indexOf("[native code]")<0){i.options.captureShadowDOM=false;aj=false}if(aj){for(al in an.modules){if(an.modules.hasOwnProperty(al)){ao=an.modules[al].events||[];for(am=0,ai=ao.length;am<ai;am+=1){if(ao[am].attachToShadows){ap=ao[am].name;if(ah.indexOf(z,ap)===-1){z.push(ap)}}}}}}L();S=true}function V(){j.unsubscribe("configupdated",E);if(A){A.disconnect()}S=false}function q(){var ai;ai="tlt-"+ah.getSerialNumber();return ai}function W(ak,aj,ai){var am,ao,an,al,aq,ap=[];if(!ak||!ak.getElementsByTagName||!aj){return ap}if(ai&&ai.length===2){ao=ai[0];an=ai[1]}al=ak.getElementsByTagName(aj);if(al&&al.length){for(am=al.length-1;am>=0;am-=1){aq=al[am];if(!ao){ap.push(aq)}else{if(aq[ao]===an){ap.push(aq)}}}}return ap}function h(am,ak,al){var aj,ai,an;an=W(am,ak,al);for(aj=an.length-1;aj>=0;aj-=1){ai=an[aj];ai.parentNode.removeChild(ai)}return am}function ag(al,aj){var ak,ai,an=W(al,"img"),am=new RegExp("^data:image/(.*?);base64");for(ak=0;ak<an.length;ak++){ai=an[ak];if(am.test(ai.src)&&(ai.src.length>aj)){ai.src="";ai.setAttribute("removedByUIC",true)}}return al}function P(ak,ai){var aj,al;for(aj=0;ak.hasChildNodes()&&aj<ak.childNodes.length;aj+=1){al=ak.childNodes[aj];if(al.nodeType===ai){ak.removeChild(al);aj-=1}else{if(al.hasChildNodes()){P(al,ai)}}}return ak}function aa(ak){var al,aj,ai=null;if(!ak){return ai}switch(ak.nodeType){case 1:al=ak.ownerDocument;if(al&&al.documentElement===ak){aj=al.doctype}break;case 9:aj=ak.doctype;break;default:break}if(aj){ai="<!DOCTYPE "+aj.name+(aj.publicId?' PUBLIC "'+aj.publicId+'"':"")+(!aj.publicId&&aj.systemId?" SYSTEM":"")+(aj.systemId?' "'+aj.systemId+'"':"")+">"}return ai}function Z(ao,ap){var an,ak,am,al,aj,ai;if(!ap){return}al=ao.getElementsByTagName("input");aj=ap.getElementsByTagName("input");if(aj){for(an=0,ai=aj.length;an<ai;an+=1){ak=al[an];am=aj[an];switch(am.type){case"checkbox":case"radio":if(ah.isIE?ak.checked:am.checked){am.setAttribute("checked","checked")}else{am.removeAttribute("checked")}break;default:am.setAttribute("value",am.value);if(!am.getAttribute("type")){am.setAttribute("type","text")}break}}}}function m(ao,ap){var al,ai,an,aj,ak,am;if(!ao||!ao.getElementsByTagName||!ap||!ap.getElementsByTagName){return}aj=ao.getElementsByTagName("textarea");am=ap.getElementsByTagName("textarea");if(aj&&am){for(al=0,ai=aj.length;al<ai;al+=1){an=aj[al];ak=am[al];ak.setAttribute("value",an.value);ak.value=ak.textContent=an.value}}}function T(ai,an){var aj,ap,ao,aq,al,ak,am;if(!ai||!ai.getElementsByTagName||!an||!an.getElementsByTagName){return}ap=ai.getElementsByTagName("select");aq=an.getElementsByTagName("select");if(ap){for(al=0,am=ap.length;al<am;al+=1){aj=ap[al];ao=aq[al];for(ak=0;ak<aj.options.length;ak+=1){if(ak===aj.selectedIndex||aj.options[ak].selected){ao.options[ak].setAttribute("selected","selected")}else{ao.options[ak].removeAttribute("selected")}}}}}function F(aj){var ai,ak=null;if(aj){ai=aj.nodeType||-1;switch(ai){case 11:ak=aj.innerHTML;break;case 9:ak=aj.documentElement?aj.documentElement.outerHTML:"";break;case 1:ak=aj.outerHTML;break;default:ak=null;break}}return ak}function af(ak){var ai,aj=false;if(ak&&typeof ak==="object"){ai=ak.nodeType||-1;switch(ai){case 9:case 1:aj=true;break;default:aj=false;break}}return aj}function b(ap,az,aj){var at,ar,au,aA,aq=["iframe","frame"],ay,ak,an,ax,al,aw,am={frames:[]},aB,ao,ai;for(ar=0;ar<aq.length;ar+=1){aA=aq[ar];aB=ap.getElementsByTagName(aA);ao=az.getElementsByTagName(aA);if(aB){for(at=0,au=aB.length;at<au;at+=1){try{ay=aB[at];ak=ah.getIFrameWindow(ay);if(ak&&ak.document&&ak.location.href!=="about:blank"){an=ak.document;ax=w(an,an,"",aj);al=q();ao[at].setAttribute("tltid",al);ax.tltid=al;ai=ah.getOriginAndPath(an.location);ax.host=ai.origin;ax.url=ai.path;ax.charset=an.characterSet||an.charset;aw=ao[at].getAttribute("src");if(!aw){aw=ak.location.href;ao[at].setAttribute("src",aw)}am.frames=am.frames.concat(ax.frames);delete ax.frames;am.frames.push(ax)}}catch(av){}}}}return am}function ad(aj){var ak,ai,al;aj.TLTListeners=aj.TLTListeners||{};for(ak=0,ai=z.length;ak<ai;ak+=1){al=z[ak];if(!aj.TLTListeners[al]){d.subscribe(al,aj,N);aj.TLTListeners[al]=true}}}function f(aj,at,au,am){var an,aq,ak,ao,ai,al,ap={shadows:[]};if(!aj||(!am&&!aj.children)){return ap}if(am){ai=[aj]}else{ai=aj.children}for(an=0,aq=ai.length;an<aq;an+=1){ao=ai[an];if(ao.shadowRoot){al=new k.Xpath(ao);ak=w(ao.ownerDocument,ao.shadowRoot,"",au);ap.shadows.push({root:ak.root,xpath:al.xpath});ap.shadows=ap.shadows.concat(ak.shadows);ad(ao.shadowRoot);if(a){try{A.observe(ao.shadowRoot,K);ao.shadowRoot.TLTListeners.mutation=true;if(ah.indexOf(M,ao)===-1){M.push(ao)}}catch(ar){ah.clog("Failed to observe shadow root.",ar,ao)}}}ak=f(ao,null,au);ap.shadows=ap.shadows.concat(ak.shadows)}return ap}function ae(ao){var am,ak,ai,al,aj,an,ap=0;if(!ao){return ap}if(ao.root){ap+=ao.root.length;if(ao.frames){for(am=0,ai=ao.frames.length;am<ai;am+=1){if(ao.frames[am].root){ap+=ao.frames[am].root.length}}}}else{if(ao.diffs){for(am=0,ai=ao.diffs.length;am<ai;am+=1){an=ao.diffs[am];ap+=an.xpath.length;if(an.root){ap+=an.root.length}else{if(an.attributes){for(ak=0,al=an.attributes.length;ak<al;ak+=1){aj=an.attributes[ak];ap+=aj.name.length;if(aj.value){ap+=aj.value.length}}}}}}}return ap}function U(){var al,ak,ai,aj;for(al=0,ai=ac.length;al<ai&&x.length;al+=1){aj=ac[al];for(ak=0;ak<x.length;ak+=1){if(x[ak].containedIn(aj)){x.splice(ak,1);ak-=1}}}}function n(al){var ak,ai,aj,am,an=[];if(!al||!al.children){return an}am=al.children;for(ak=0,ai=am.length;ak<ai;ak+=1){aj=am[ak];if(aj.shadowRoot){if(!aj.shadowRoot.TLTListeners){an.push([aj,aj.shadowRoot])}an=an.concat(n(aj.shadowRoot))}an=an.concat(n(aj))}return an}function G(ao,ak){var al,ai,am,an,aj;if(!ao||!ak){return}if(!ak.captureShadowDOM){return}aj=n(ao);for(al=0,ai=aj.length,am=[];al<ai;al+=1){an=f(aj[al][0],null,ak,true);am=am.concat(an.shadows)}return am}function r(an,ak){var ao,aj,am,al,ai;ao=w(an,an,null,ak);if(!ao){ao={}}ao.charset=an.characterSet||an.charset;aj=ah.getOriginAndPath(an.location);ao.host=aj.origin;ao.url=aj.path;return ao}function O(av){var an,ap,au={fullDOM:false,diffs:[],attributeDiffs:{}},at,ao,ak,aq,aj,am,ar=new RegExp("^data:image/(.*?);base64");X(ac);U();ao=av.captureShadowDOM;av.captureShadowDOM=false;for(an=0,ap=ac.length;an<ap;an+=1){aj=ac[an];aq=k.getNodeFromID(aj.xpath,-2);if(aj.isShadowHost){aq=aq.shadowRoot}if(aq===window.document.body){av.captureShadowDOM=ao;return r(window.document,av)}at=w(window.document,aq,aj,av);if(at.shadows&&at.shadows.length===0){delete at.shadows}if(at.frames&&at.frames.length===0){delete at.frames}at.xpath=aj.xpath;au.diffs.push(at)}function al(ax,aw){if(!ax||!ax.name){return}au.attributeDiffs[at.xpath][ax.name]={value:ax.value}}function ai(ay){var ax,aw;for(ax=0,aw=ay.length;ax<aw;ax+=1){if(ay[ax].name==="src"&&ar.test(ay[ax].value)&&ay[ax].value.length>av.discardBase64){ay[ax].value="";ay.push({name:"removedByUIC",value:true});break}}return ay}for(an=0,ap=x.length;an<ap;an+=1){aj=x[an];am=t(aj.attributes);if(av.hasOwnProperty("discardBase64")){aq=k.getNodeFromID(aj.xpath,-2);if(aq&&aq.tagName.toLowerCase()==="img"&&am){am=ai(am)}}at={xpath:e(aj.attributes,"id")?aj.fullXpath:aj.xpath,attributes:am};au.diffs.push(at);au.attributeDiffs[at.xpath]={};ah.forEach(at.attributes,al)}av.captureShadowDOM=ao;ak=G(window.document,av);if(ak&&ak.length){au.shadows=ak}return au}u=function(ai){var aj=null;if(af(ai)){aj=ai.cloneNode(true);if(!aj&&ai.documentElement){aj=ai.documentElement.cloneNode(true)}}return aj};w=function(aq,ao,am,ar){var ak=true,ai,aj,ap,al={},an;if(!aq||!ao){return al}ai=u(ao,aq);if(!ai&&ao.host){ak=false}else{if(!ai){return al}}if(ak){if(!!ar.removeScripts){h(ai,"script");h(ai,"noscript")}if(!ar.keepImports){h(ai,"link",["rel","import"])}if(!!ar.removeComments){P(ai,8)}if(!ar.captureStyle){h(ai,"style")}if(ar.hasOwnProperty("discardBase64")){ag(ai,ar.discardBase64)}T(ao,ai);Z(ao,ai);m(ao,ai);ai=y.applyPrivacyToNode(ai,am,aq);if(!!ar.captureFrames){aj=b(ao,ai,ar)}}if(!!ar.captureShadowDOM){ap=f(ao,ai,ar)}if(aj){al=ah.mixin(al,aj)}if(ap){al=ah.mixin(al,ap)}an=(aa(ao)||"")+F(ai||ao);al.root=y.applyPrivacyPatterns(an);return al};E=function(){j=C.getService("config");l(j.getServiceConfig("domCapture")||{})};return{init:function(){j=C.getService("config");if(!S){l(j.getServiceConfig("domCapture")||{})}else{}},destroy:function(){V()},observeWindow:function(ai){if(!ai){return}if(!ah.getValue(i,"options.captureFrames",false)&&!(ai===window)){return}if(ah.indexOf(R,ai)===-1){R.push(ai);if(A&&p){A.observe(ai.document,K)}}},captureDOM:function(aj,ak){var al,ai,ao=null,am,ap=0;if(!S||(ah.isIE&&document.documentMode<10)){return ao}ak=ah.mixin({},i.options,ak);aj=aj||window.document;if(!s||!a||c||ak.forceFullDOM){if(A){A.disconnect()}ao=r(aj,ak);ao.fullDOM=true;ao.forced=!!(c||ak.forceFullDOM);s=true;if(A){for(al=0,ai=R.length;al<ai;al+=1){am=R[al];try{A.observe(am.document,K)}catch(an){R.splice(al,1);ai=R.length;al-=1}}}}else{ao=O(ak);ao.fullDOM=ao.diffs?false:true}if(a){ao.mutationCount=B}J();if(ak.maxLength){ap=ae(ao);if(ap>ak.maxLength){ao={errorCode:101,error:"Captured length ("+ap+") exceeded limit ("+ak.maxLength+")."}}}return ao}}});TLT.addService("encoder",function(a){var f={},g=null,b=null,d=false;function e(j){var i=null;if(!j){return i}i=f[j];if(i&&typeof i.encode==="string"){i.encode=a.utils.access(i.encode)}return i}function h(i){f=i;g.subscribe("configupdated",b);d=true}function c(){g.unsubscribe("configupdated",b);d=false}b=function(){g=a.getService("config");h(g.getServiceConfig("encoder")||{})};return{init:function(){g=a.getService("config");if(!d){h(g.getServiceConfig("encoder")||{})}else{}},destroy:function(){c()},encode:function(m,l){var k,i,j={data:null,encoding:null,error:null};if((typeof m!=="string"&&!m)||!l){j.error="Invalid "+(!m?"data":"type")+" parameter.";return j}k=e(l);if(!k){j.error="Specified encoder ("+l+") not found.";return j}if(typeof k.encode!=="function"){j.error="Configured encoder ("+l+") 'encode' method is not a function.";return j}try{i=k.encode(m)}catch(n){j.error="Exception "+(n.name?n.name+" - ":"")+(n.message||n);return j}if(!i||a.utils.getValue(i,"buffer",null)===null){j.error="Encoder ("+l+") returned an invalid result.";return j}j.data=i.buffer;j.encoding=k.defaultEncoding;return j}}});TLT.addService("message",function(w){var S=w.utils,N=w.getTabId(),r=0,t=0,J=0,j=0,s=new Date(),i=w.getService("browserBase"),b=w.getService("browser"),h=w.getService("config"),B=h.getServiceConfig("message")||{},n=w.normalizeUrl(window.location.href),P=window.location.hostname,T=B.hasOwnProperty("privacy")?B.privacy:[],c,G={},Q={lower:"x",upper:"X",numeric:"9",symbol:"@"},f=parseFloat((window.devicePixelRatio||1).toFixed(2)),g=window.screen||{},a=g.width||0,z=g.height||0,R=i.getNormalizedOrientation(),k=!S.isiOS?a:Math.abs(R)===90?z:a,E=!S.isiOS?z:Math.abs(R)===90?a:z,M=(window.screen?window.screen.height-window.screen.availHeight:0),L=window.innerWidth||document.documentElement.clientWidth,o=window.innerHeight||document.documentElement.clientHeight,I=false,y={},m=false;function e(V){var U="",W=V.timestamp||(new Date()).getTime();delete V.timestamp;this.type=V.type;this.offset=W-s.getTime();this.screenviewOffset=0;if(V.type===2){r=t;t=W;if(V.screenview.type==="UNLOAD"){this.screenviewOffset=W-(r||s.getTime())}}else{if(t){this.screenviewOffset=W-t}}if(!this.type){return}this.count=(j+=1);this.fromWeb=true;for(U in V){if(V.hasOwnProperty(U)){this[U]=V[U]}}}G.PVC_MASK_EMPTY=function(U){return""};G.PVC_MASK_BASIC=function(V){var U="XXXXX";if(typeof V!=="string"){return""}return(V.length?U:"")};G.PVC_MASK_TYPE=function(Y){var V,X,U,W="";if(typeof Y!=="string"){return W}V=Y.split("");for(X=0,U=V.length;X<U;X+=1){if(S.isNumeric(V[X])){W+=Q.numeric}else{if(S.isUpperCase(V[X])){W+=Q.upper}else{if(S.isLowerCase(V[X])){W+=Q.lower}else{W+=Q.symbol}}}}return W};G.PVC_MASK_EMPTY.maskType=1;G.PVC_MASK_BASIC.maskType=2;G.PVC_MASK_TYPE.maskType=3;G.PVC_MASK_CUSTOM={maskType:4};function d(U,W){var V=G.PVC_MASK_BASIC;if(typeof W!=="string"){return W}if(!U){V=G.PVC_MASK_BASIC}else{if(U.maskType===G.PVC_MASK_EMPTY.maskType){V=G.PVC_MASK_EMPTY}else{if(U.maskType===G.PVC_MASK_BASIC.maskType){V=G.PVC_MASK_BASIC}else{if(U.maskType===G.PVC_MASK_TYPE.maskType){V=G.PVC_MASK_TYPE}else{if(U.maskType===G.PVC_MASK_CUSTOM.maskType){if(typeof U.maskFunction==="string"){V=S.access(U.maskFunction)}else{V=U.maskFunction}if(typeof V!=="function"){V=G.PVC_MASK_BASIC}}}}}}return V(W)}function D(U,V){var W;if(!U||!V){return}for(W in V){if(V.hasOwnProperty(W)){if(W==="value"){V[W]=d(U,V[W])}else{delete V[W]}}}}function O(U,V){return(S.matchTarget(U,V)!==-1)}function H(Z){var V,U,W,Y,X;if(!Z){return""}for(V=0,U=c.length;V<U;V+=1){X=c[V];X.cRegex.lastIndex=0;Z=Z.replace(X.cRegex,X.replacement)}return Z}function F(ab){var Y,U,X,V,aa=false,Z,W;if(!ab||(!ab.currState&&!ab.prevState)||!ab.id){return ab}Z=ab.prevState;W=ab.currState;for(Y=0,U=T.length;Y<U;Y+=1){V=T[Y];X=S.getValue(V,"exclude",false);if(O(V.targets,ab)!==X){if(Z&&Z.hasOwnProperty("value")){D(V,Z)}if(W&&W.hasOwnProperty("value")){D(V,W)}aa=true;break}}if(!aa){if(Z&&Z.value){Z.value=H(Z.value)}if(W&&W.value){W.value=H(W.value)}}return ab}function p(U){if(!U||!U.target){return U}F(U.target);return U}function l(X,V){var W,U,Z,Y;if(!V||!X){return}if(X.value){Z=d(V,X.value);X.setAttribute("value",Z);X.value=Z}if(X.checked){X.removeAttribute("checked")}if(S.getTagName(X)==="select"){X.selectedIndex=-1;for(W=0,U=X.options.length;W<U;W+=1){Y=X.options[W];Y.removeAttribute("selected");Y.selected=false}}else{if(S.getTagName(X)==="textarea"){X.textContent=X.value}}}function v(af,ac,ag,al,Z,ab){var ah,ae,ad,ai,W,X,aa=[],aj,U,Y,ak,V;if(!af.length&&!Z.length&&!ab){return[]}V=b.queryAll("input, select, textarea",ac);if(!V||!V.length){return[]}for(ah=0,ai=Z.length;ah<ai;ah+=1){ae=V.indexOf(Z[ah]);if(ae!==-1){V.splice(ae,1)}}if(af.length){for(ah=0,ai=V.length,aa=[];ah<ai;ah+=1){if(V[ah].value){X=i.ElementData.prototype.examineID(V[ah],true);if(X.idType===-2){aj=new i.Xpath(V[ah],true);aj.applyPrefix(ag);X.id=aj.xpath}aa.push({id:X.id,idType:X.idType,element:V[ah]})}}}for(ah=0,ai=af.length;ah<ai;ah+=1){Y=T[af[ah].ruleIndex];U=S.getValue(Y,"exclude",false);ak=Y.targets[af[ah].targetIndex];if(typeof ak.id==="string"&&ak.idType===-2){for(ae=0;ae<aa.length;ae+=1){if(aa[ae].idType===ak.idType&&aa[ae].id===ak.id){if(!U){W=aa[ae].element;l(W,Y)}else{ad=V.indexOf(W);V.splice(ad,1)}}}}else{for(ae=0;ae<aa.length;ae+=1){ak.cRegex.lastIndex=0;if(aa[ae].idType===ak.idType&&ak.cRegex.test(aa[ae].id)){W=aa[ae].element;if(!U){l(W,Y)}else{ad=V.indexOf(W);V.splice(ad,1)}}}}}if(ab){for(ah=0,ai=V.length;ah<ai;ah+=1){l(V[ah],ab)}}}function q(aa,af,al){var ag,ac,ab,W,U,X=[],Z,ah,ad,V,ai,ae=[],ak,aj,Y;if(!aa||!al){return null}for(ag=0,ah=T.length;ag<ah;ag+=1){ad=T[ag];U=S.getValue(ad,"exclude",false);if(U){Z=ad}aj=ad.targets;for(ac=0,Y=aj.length;ac<Y;ac+=1){ak=aj[ac];if(typeof ak==="string"){V=b.queryAll(ak,aa);if(!U){for(ab=0,ai=V.length;ab<ai;ab+=1){W=V[ab];l(W,ad)}}else{X=X.concat(V)}}else{if(typeof ak.id==="string"){switch(ak.idType){case -1:case -3:W=i.getNodeFromID(ak.id,ak.idType,aa);if(!U){l(W,ad)}else{X.push(W)}break;case -2:ae.push({ruleIndex:ag,targetIndex:ac,exclude:U});break;default:break}}else{ae.push({ruleIndex:ag,targetIndex:ac,exclude:U})}}}}v(ae,aa,af,al,X,Z);return aa}function u(Y){var W,U,V,X=false;if(!Y){return X}for(W=0,U=T.length;W<U;W+=1){V=T[W];if(O(V.targets,Y)){X=true;break}}return X}function x(){var X,W,U,aa,ab,Z,V,Y;h=w.getService("config");B=h.getServiceConfig("message")||{};T=B.privacy||[];c=B.privacyPatterns||[];m=B.shadowDomCacheEnabled||false;for(X=0,ab=T.length;X<ab;X+=1){aa=T[X];V=aa.targets;for(W=0,Y=V.length;W<Y;W+=1){Z=V[W];if(typeof Z==="object"){if(typeof Z.idType==="string"){Z.idType=+Z.idType}if(typeof Z.id==="object"){Z.cRegex=new RegExp(Z.id.regex,Z.id.flags)}}}}for(U=c.length,X=U-1;X>=0;X-=1){aa=c[X];if(typeof aa.pattern==="object"){aa.cRegex=new RegExp(aa.pattern.regex,aa.pattern.flags)}else{c.splice(X,1)}}}function A(){if(h.subscribe){h.subscribe("configupdated",x)}x();I=true}function K(){h.unsubscribe("configupdated",x);I=false}function C(ac){var Z=ac.dcid,W=ac.shadows||[],Y=ac.fullDOM,ad=1,X,aa,ab,V,U;if(W.length===0||!Y){return}for(ab in y){if(y.hasOwnProperty(ab)){y[ab].age+=1}}for(X=0,aa=W.length;X<aa;X+=1){V=W[X];U=y[V.xpath];if(U&&U.root===V.root){U.hitCount+=1;U.age-=1;V.cacheDCID=U.dcid;delete V.root}else{y[V.xpath]={root:V.root,dcid:Z,hitCount:0,age:0}}}for(ab in y){if(y.hasOwnProperty(ab)){U=y[ab];if(U.age>U.hitCount+ad){delete y[ab]}}}}return{init:function(){if(!I){A()}else{}},destroy:function(){K()},applyPrivacyToNode:q,applyPrivacyToMessage:p,applyPrivacyToTarget:F,applyPrivacyPatterns:H,isPrivacyMatched:u,createMessage:function(U){if(typeof U.type==="undefined"){throw new TypeError("Invalid queueEvent given!")}if(U.type===12&&m){C(U.domCapture)}return p(new e(U))},wrapMessages:function(V){var U={messageVersion:"12.0.0.0",serialNumber:(J+=1),sessions:[{id:w.getPageId(),tabId:N,startTime:s.getTime(),timezoneOffset:s.getTimezoneOffset(),messages:V,clientEnvironment:{webEnvironment:{libVersion:"6.0.0.1960",domain:P,page:n,referrer:document.referrer,screen:{devicePixelRatio:f,deviceWidth:k,deviceHeight:E,deviceToolbarHeight:M,width:L,height:o,orientation:R}}}}]},W=U.sessions[0].clientEnvironment.webEnvironment.screen;W.orientationMode=S.getOrientationMode(W.orientation);return U},getSessionStart:function(){return s}}});TLT.addService("serializer",function(b){var d=b.getService("config"),j={},c={},k={json:(function(){if(typeof window.JSON!=="undefined"){return{serialize:window.JSON.stringify,parse:window.JSON.parse}}return{}}())},f=null,i=false;function e(q,o,m){var n,l,p;q=q||[];for(n=0,l=q.length;n<l;n+=1){p=q[n];if(typeof p==="string"){p=b.utils.access(p)}if(typeof p==="function"){o[m]=p;break}}}function h(){var l;if(typeof j.json!=="function"||typeof c.json!=="function"){l=true}else{if(typeof c.json('{"foo": "bar"}')==="undefined"){l=true}else{l=c.json('{"foo": "bar"}').foo!=="bar"}if(typeof c.json("[1, 2]")==="undefined"){l=true}else{l=l||c.json("[1, 2]")[0]!==1;l=l||c.json("[1,2]")[1]!==2}l=l||j.json({foo:"bar"})!=='{"foo":"bar"}';l=l||j.json([1,2])!=="[1,2]"}return l}function a(l){var m;for(m in l){if(l.hasOwnProperty(m)){e(l[m].stringifiers,j,m);e(l[m].parsers,c,m)}}j.json=j.json||k.json.serialize;c.json=c.json||k.json.parse;if(typeof j.json!=="function"||typeof c.json!=="function"){b.fail("JSON parser and/or serializer not provided in the UIC config. Can't continue.")}if(h()){b.fail("JSON stringification and parsing are not working as expected")}if(d){d.subscribe("configupdated",f)}i=true}function g(){j={};c={};if(d){d.unsubscribe("configupdated",f)}i=false}f=function(){d=b.getService("config");a(d.getServiceConfig("serializer"))};return{init:function(){var l;if(!i){l=d?d.getServiceConfig("serializer"):{};a(l)}else{}},destroy:function(){g()},parse:function(m,l){l=l||"json";return c[l](m)},serialize:function(n,m){var l;m=m||"json";l=j[m](n);return l}}});TLT.addModule("TLCookie",function(d){var l={},i=[],k=0,f=true,p=false,h="WCXSID",o="TLTSID",b="CoreID6",s,q,c=null,r,t=d.utils;function a(){var y="123456789",x=t.getRandomString(1,y)+t.getRandomString(31,y+"0");return x}function m(){var y=a(),x=!!l.secureTLTSID;t.setCookie(o,y,undefined,undefined,undefined,x);return t.getCookieValue(o)}function n(){if(c||!window.cmRetrieveUserID){return}try{window.cmRetrieveUserID(function(y){c=y})}catch(x){c=null}}function g(B){var x,y,A,z;if(!localStorage||!B){return}A=localStorage.getItem(B);if(A){y=A.split("|");x=parseInt(y[0],10);if(Date.now()>x){localStorage.removeItem(B)}else{z=y[1]}}return z}function w(z,y){var x;if(!localStorage||!z){return}y=y||a();x=Date.now()+k;localStorage.setItem(z,x+"|"+y);return g(z)}function j(){return i}function e(x){i=[];f=t.getValue(x,"sessionIDUsesCookie",true);p=t.getValue(x,"sessionIDUsesStorage",false);if(x.tlAppKey){r=x.tlAppKey;i.push({name:"X-Tealeaf-SaaS-AppKey",value:r})}if(x.visitorCookieName){b=x.visitorCookieName}if(x.wcxCookieName){h=x.wcxCookieName}s=t.getCookieValue(h);if(s){i.push({name:"X-WCXSID",value:s})}if(x.sessionizationCookieName){o=x.sessionizationCookieName}if(p){k=t.getValue(x,"sessionIDStorageTTL",600000);try{q=g(o)}catch(z){p=false}}if(!q&&f){q=t.getCookieValue(o)}if(!q){if(s){o=h;q=s}else{if(p){try{q=w(o)}catch(y){p=false}}if(!q&&f){q=m()}}}d.setSessionCookieInfo(o,q);if(!q){q="Check7UIC7Cookie7Configuration77"}i.push({name:"X-Tealeaf-SaaS-TLTSID",value:q});if(i.length){TLT.registerBridgeCallbacks([{enabled:true,cbType:"addRequestHeaders",cbFunction:j}])}}function u(C){var z,y,x=false,B,A=l.appCookieWhitelist;if(!A||!A.length){return x}for(z=0,y=A.length;z<y&&!x;z+=1){B=A[z];if(B.regex){if(!B.cRegex){B.cRegex=new RegExp(B.regex,B.flags)}B.cRegex.lastIndex=0;x=B.cRegex.test(C)}else{x=(B===C)}}return x}function v(){var B,A,C,D={},y,H=document.cookie,z=[],G="",x="";if(!H){return}z=H.split("; ");for(B=0,C=z.length;B<C;B+=1){y=z[B];A=y.indexOf("=");if(A>=0){try{G=decodeURIComponent(y.substr(0,A))}catch(F){G=y.substr(0,A)}}x=y.substr(A+1);if(u(G)){try{D[G]=decodeURIComponent(x)}catch(E){D[G]=x}}}if(c&&!D[b]){D[b]=c}d.post({type:14,cookies:D})}return{init:function(){l=d.getConfig()||{};e(l);n()},destroy:function(){if(p){w(o,q)}window.setTimeout(function(){TLT.registerBridgeCallbacks([{enabled:false,cbType:"addRequestHeaders",cbFunction:j}])})},onevent:function(x){switch(x.type){case"screenview_load":if(t.getValue(l,"appCookieWhitelist.length",0)){n();v()}break;default:break}}}});if(TLT&&typeof TLT.addModule==="function"){TLT.addModule("overstat",function(e){var y=e.utils,p={},A={updateInterval:250,hoverThreshold:1000,hoverThresholdMax:2*60*1000,gridCellMaxX:10,gridCellMaxY:10,gridCellMinWidth:20,gridCellMinHeight:20},d=50;function x(F){var G=e.getConfig()||{},H=G[F];return typeof H==="number"?H:A[F]}function E(L,F){var K=y.getValue(L,"webEvent.target",{}),G=y.getValue(K,"element.tagName")||"",H=G.toLowerCase()==="input"?y.getValue(K,"element.type"):"",J=y.getTlType(K),I={type:9,event:{hoverDuration:L.hoverDuration,hoverToClick:y.getValue(F,"hoverToClick")},target:{id:K.id||"",idType:K.idType||"",name:K.name||"",tlType:J,type:G,subType:H,position:{width:y.getValue(K,"element.offsetWidth",0),height:y.getValue(K,"element.offsetHeight",0),relXY:L.relXY}}};if(!I.target.id){return}e.post(I)}function i(F){if(F&&!F.nodeType&&F.element){F=F.element}return F}function s(F){F=i(F);return !F||F===document.body||F===document.html||F===document}function j(F){F=i(F);if(!F){return null}return F.parentNode}function n(F){F=i(F);if(!F){return null}return F.offsetParent||F.parentElement||j(F)}function v(G,H){var F=0;if(!H||H===G){return false}H=j(H);while(!s(H)&&F++<d){if(H===G){return true}H=j(H)}if(F>=d){y.clog("Overstat isChildOf() hit iterations limit")}return false}function C(F){if(F.nativeEvent){F=F.nativeEvent}return F}function h(F){F=i(F);if(!F){return -1}return F.nodeType||-1}function B(F){F=i(F);if(!F){return""}return F.tagName?F.tagName.toUpperCase():""}function m(G){var F=B(G);return h(G)!==1||F==="TR"||F==="TBODY"||F==="THEAD"}function g(F){if(!F){return""}if(F.xPath){return F.xPath}F=i(F);return e.getXPathFromNode(F)}function z(G,F){var H=p[G];if(H&&H[F]){return H[F]()}}function u(G,I,H,F){this.xPath=G!==null?g(G):"";this.domNode=G;this.hoverDuration=0;this.hoverUpdateTime=0;this.gridX=Math.max(I,0);this.gridY=Math.max(H,0);this.parentKey="";this.updateTimer=-1;this.disposed=false;this.childKeys={};this.webEvent=F;this.getKey=function(){return this.xPath+":"+this.gridX+","+this.gridY};this.update=function(){var K=new Date().getTime(),J=this.getKey();if(this.hoverUpdateTime!==0){this.hoverDuration+=K-this.hoverUpdateTime}this.hoverUpdateTime=K;clearTimeout(this.updateTimer);this.updateTimer=setTimeout(function(){z(J,"update")},x("updateInterval"))};this.dispose=function(J){clearTimeout(this.updateTimer);delete p[this.getKey()];this.disposed=true;if(J){var K=this.clone();p[K.getKey()]=K;K.update()}};this.process=function(M){clearTimeout(this.updateTimer);if(this.disposed){return false}var K=false,L=this,J=0;if(this.hoverDuration>=x("hoverThreshold")){this.hoverDuration=Math.min(this.hoverDuration,x("hoverThresholdMax"));K=true;E(this,{hoverToClick:!!M});while(typeof L!=="undefined"&&J++<d){L.dispose(M);L=p[L.parentKey]}if(J>=d){y.clog("Overstat process() hit iterations limit")}}else{this.dispose(M)}return K};this.clone=function(){var J=new u(this.domNode,this.gridX,this.gridY);J.parentKey=this.parentKey;return J}}function D(H,F,I,G){return new u(H,F,I,G)}function r(H){if(H&&H.position){return{x:H.position.x,y:H.position.y}}H=i(H);var F=H&&H.getBoundingClientRect?H.getBoundingClientRect():null,L=F?F.left:(H?H.offsetLeft:0),K=F?F.top:(H?H.offsetHeight:0),N=L,M=K,I=0,G=0,J=n(H),O=0;while(J&&O++<d){if(s(J)){break}I=J.offsetLeft-(J.scrollLeft||0);G=J.offsetTop-(J.scrollTop||0);if(I!==N||G!==M){L+=I;K+=G;N=I;M=G}J=n(J)}if(O>=d){y.clog("Overstat calculateNodeOffset() hit iterations limit")}if(isNaN(L)){L=0}if(isNaN(K)){K=0}return{x:L,y:K}}function a(J,H,G){J=i(J);var I=r(J),F=H-I.x,K=G-I.y;if(!isFinite(F)){F=0}if(!isFinite(K)){K=0}return{x:F,y:K}}function w(F,G){F=Math.floor(Math.min(Math.max(F,0),1)*10000)/10000;G=Math.floor(Math.min(Math.max(G,0),1)*10000)/10000;return F+","+G}function f(J,M,L){J=i(J);var H=J.getBoundingClientRect?J.getBoundingClientRect():null,R=H?H.width:J.offsetWidth,I=H?H.height:J.offsetHeight,K=R&&R>0?Math.max(R/x("gridCellMaxX"),x("gridCellMinWidth")):x("gridCellMinWidth"),O=I&&I>0?Math.max(I/x("gridCellMaxY"),x("gridCellMinHeight")):x("gridCellMinHeight"),G=Math.min(Math.floor(M/K),x("gridCellMaxX")),F=Math.min(Math.floor(L/O),x("gridCellMaxY")),Q=R>0?M/R:0,N=I>0?L/I:0,P="";if(!isFinite(G)){G=0}if(!isFinite(F)){F=0}P=w(Q,N);return{x:G,y:F,relXY:P}}function c(J){var K=J,L=J.getKey(),G={},H=null,I=false,F=0;G[L]=true;while(typeof K!=="undefined"&&F++<d){G[K.parentKey]=true;if(K.parentKey===""||K.parentKey===K.getKey()){break}if(F>=d){y.clog("Overstat cleanupHoverEvents() hit iterations limit")}K=p[K.parentKey]}for(H in p){if(p.hasOwnProperty(H)&&!G[H]){K=p[H];if(K){if(!I){I=K.process()}else{K.dispose()}}}}}function t(G,I){var J=null,F=null,H=false;for(F in p){if(p.hasOwnProperty(F)){J=p[F];if(J&&J.domNode===G&&J.getKey()!==I){if(!H){H=J.process()}else{J.dispose()}}}}}function b(J,H,I){if(!H){H=J.target}if(s(H)){return null}if(y.isiOS||y.isAndroid){return null}var F,O,K,N,L,M,G;if(!m(H)){F=a(H,J.position.x,J.position.y);O=f(H,F.x,F.y);K=new u(H,O.x,O.y,J);K.relXY=O.relXY;N=K.getKey();if(p[N]){K=p[N]}else{p[N]=K}K.update();if(!I){G=n(H);if(G){M=b(J,G,true);if(M!==null){L=M.getKey();N=K.getKey();if(N!==L){K.parentKey=L}}}c(K)}}else{K=b(J,n(H),I)}return K}function q(F){F=C(F);if(v(F.target,F.relatedTarget)){return}t(F.target)}function l(H){var I=null,F=null,G=false;for(F in p){if(p.hasOwnProperty(F)){I=p[F];if(I){if(!G){G=I.process(true)}else{I.dispose()}}}}}function o(F){e.performFormCompletion(true)}function k(G){var F=y.getValue(G,"target.id");if(!F){return}switch(G.type){case"mousemove":b(G);break;case"mouseout":q(G);break;case"click":l(G);break;case"submit":o(G);break;default:break}}return{init:function(){},destroy:function(){var F;for(F in p){if(p.hasOwnProperty(F)){p[F].dispose();delete p[F]}}},onevent:function(F){if(typeof F!=="object"||!F.type){return}k(F)},onmessage:function(F){},createHoverEvent:D,cleanupHoverEvents:c,eventMap:p}})}else{}if(TLT&&typeof TLT.addModule==="function"){TLT.addModule("performance",function(b){var k={loadReceived:false,unloadReceived:false,perfEventSent:false},h=null,g=0,f,m=b.utils,j,c=0,o,a={enabled:false,resourceTypes:[],blacklist:[]};function e(r){var t=0,q={},u="",s=0;if(!r||typeof r!=="object"||!r.navigationStart){return{}}t=r.navigationStart;for(u in r){if(Object.prototype.hasOwnProperty.call(r,u)||typeof r[u]==="number"){s=r[u];if(typeof s==="number"&&s&&u!=="navigationStart"){q[u]=s-t}else{q[u]=s}}}return q}function d(s){var t=0,r,q;if(s){r=(s.responseEnd>0&&s.responseEnd<s.domLoading)?s.responseEnd:s.domLoading;q=s.loadEventStart;if(m.isNumeric(r)&&m.isNumeric(q)&&q>r){t=q-r}}return t}function n(r){var q=b.getStartTime();if(r.timestamp>q&&!g){g=r.timestamp-q}}function p(t){var r,u={type:7,performance:{}},q,v,s;if(!t||k.perfEventSent){return}v=t.performance||{};s=v.timing;q=v.navigation;if(s){if(!s.loadEventStart&&!(m.isSafari&&q.type===2)){return}u.performance.timing=e(s);u.performance.timing.renderTime=d(s)}else{if(f.calculateRenderTime){u.performance.timing={renderTime:g,calculated:true}}else{return}}if(f.renderTimeThreshold&&u.performance.timing.renderTime>f.renderTimeThreshold){u.performance.timing.invalidRenderTime=u.performance.timing.renderTime;delete u.performance.timing.renderTime}if(q){switch(q.type){case 0:r="NAVIGATE";break;case 1:r="RELOAD";break;case 2:r="BACKFORWARD";break;default:r="UNKNOWN";break}u.performance.navigation={type:r,redirectCount:q.redirectCount}}b.post(u);k.perfEventSent=true;if(h){clearInterval(h);h=null}}function i(w){var t,s=w.name,u=w.initiatorType,r=o.blacklist,q,v,x;if(o.hasOwnProperty("maxAlerts")&&c>=o.maxAlerts){return}if(o.hasOwnProperty("threshold")&&w.duration<o.threshold){return}if((w.transferSize&&w.transferSize<w.encodedBodySize)||w.responseStart===w.responseEnd){return}if(o.resourceTypes.length>0&&o.resourceTypes.indexOf(u)===-1){return}v=false;for(t=0;t<r.length;t+=1){q=r[t];switch(typeof q){case"object":if(!q.cRegex){q.cRegex=new RegExp(q.regex,q.flags)}q.cRegex.lastIndex=0;if(q.cRegex.test(s)){v=true}break;case"string":if(s.indexOf(q)!==-1){v=true}break;default:break}}if(!v){c+=1;x={urlNormalized:(b.normalizeUrl?b.normalizeUrl(s):s),url:s,initiator:u,duration:Math.round(w.duration),responseEnd:Math.round(w.responseEnd)};if(typeof w.transferSize!=="undefined"){x.transferSize=w.transferSize;x.bps=Math.round(w.transferSize/w.duration*1000)}b.post({type:17,resourceData:x})}}function l(){var q;if(!o.enabled||(typeof window.PerformanceObserver!=="function")){return}j=new window.PerformanceObserver(function(r,s){m.forEach(r.getEntries(),i)});q=window.performance.getEntriesByType("resource");setTimeout(function(){m.forEach(q,i)});j.observe({entryTypes:["resource"]})}return{init:function(){f=b.getConfig();o=m.mixin({},a,f.performanceAlert)},destroy:function(){f=null;if(h){clearInterval(h);h=null}if(j){j.disconnect()}},onevent:function(q){if(typeof q!=="object"||!q.type){return}switch(q.type){case"load":k.loadReceived=true;n(q);if(!k.perfEventSent&&!h){h=setInterval(function(){if(b.isInitialized()){p(window)}},m.getValue(f,"delay",2000))}l();break;case"screenview_load":if(!k.perfEventSent){p(window)}break;case"unload":k.unloadReceived=true;if(!k.perfEventSent){p(window)}break;default:break}},onmessage:function(q){}}})}else{}TLT.addModule("replay",function(aj){var ab=aj.utils,O=0,ap={scale:0,timestamp:0},aF={},aA=null,D=[],U=0,Y=true,X=null,ao=null,v=0,ac="",av="",o=null,W=(new Date()).getTime(),t=0,ax=null,r="root",ae,I=null,ai=null,aq=null,Z=null,P=null,f={inFocus:false},az=null,K=aj.getConfig()||{},i=ab.getValue(K,"viewPortWidthHeightLimit",10000),m=1,Q=1,S,g={},u=ab.getValue(K,"mousemove")||{},ak=aj.getSessionStart(),ah=u.sampleRate,L=u.ignoreRadius,J=null,h=[],w=[],b={},n=0,H=1000,d=0,ay=[],x=[],C=document.visibilityState==="visible"?true:false;function aa(){var aG;for(aG in aF){if(aF.hasOwnProperty(aG)){aF[aG].visitedCount=0}}}function aE(aI){var aG=false,aH="|button|image|submit|reset|",aJ=null;if(typeof aI!=="object"||!aI.type){return aG}switch(aI.type.toLowerCase()){case"input":aJ="|"+(aI.subType||"")+"|";aG=(aH.indexOf(aJ.toLowerCase())!==-1);break;case"select":case"textarea":aG=false;break;default:aG=true;break}return aG}function aw(aH){var aG=[];aH=aH.parentNode;while(aH){aG.push(aH);aH=aH.parentNode}return aG}function l(aG){return ab.some(aG,function(aI){var aH=ab.getTagName(aI);if(aH==="a"||aH==="button"){return aI}return null})}function F(aG){var aH=aG.type,aI=aG.target;if(typeof aH==="string"){aH=aH.toLowerCase()}else{aH="unknown"}if(aH==="blur"){aH="focusout"}if(aH==="change"){if(aI.type==="INPUT"){switch(aI.subType){case"text":case"date":case"time":aH=aI.subType+"Change";break;default:aH="valueChange";break}}else{if(aI.type==="TEXTAREA"){aH="textChange"}else{aH="valueChange"}}}return aH}function at(aG,aK,aH){var aI,aJ,aL;if(document.querySelector(aG)){return true}for(aI=0;aI<aK.length;aI++){aL=aK[aI];if(aL.querySelector(aG)){return true}}for(aI=0;aI<aH.length;aI++){aJ=aH[aI];if(aJ.querySelector(aG)){return true}}return false}function ar(aK,aP,aH){var aN,aL,aQ,aJ,aR,aG,aO,aI,aM;for(aN=0;aN<x.length;aN++){aO=x[aN];aL=aO.delayUntil.selector;aQ=ab.getValue(aO.delayUntil,"exists",true);aJ=aO.delayUntil.dualSnapshot||false;aR=at(aL,aP,aH);aG=aO.lastStatus||false;aI=aO.config||{};aM=aO.timerId;if((aQ===true&&aR===true&&aG===false)||(aQ===false&&aR===false&&aG===true)||(aJ===true&&aR===true&&aG===false)||(aJ===true&&aR===false&&aG===true)){aj.performDOMCapture(document,aI);if(!aJ||aR===false){x.splice(aN--,1);if(x.length===0){TLT.registerMutationCallback(ar,false)}if(aM){clearTimeout(aM)}}}aO.lastStatus=aR}}function A(aJ){var aI,aG,aH;for(aI=0;aI<x.length;aI+=1){aG=x[aI];aH=aG.config||{};if(aH.dcid===aJ){aj.performDOMCapture(document,aH);x.splice(aI--,1);if(x.length===0){TLT.registerMutationCallback(ar,false)}}}}function k(aG,aI,aH){var aK=null,aJ;if(!aG){return aK}aI=aI||{};aI.eventOn=Y;Y=false;if(aH){aK="dcid-"+ab.getSerialNumber()+"."+(new Date()).getTime()+"s";if(typeof aH==="object"){aI.dcid=aK;aJ={config:aI,delayUntil:aH,lastStatus:false};x.push(aJ);TLT.registerMutationCallback(ar,true);if(typeof aH.timeout!=="undefined"&&aH.timeout>=0){aJ.timerId=window.setTimeout(function(){A(aK)},aH.timeout)}}else{window.setTimeout(function(){aI.dcid=aK;aj.performDOMCapture(aG,aI)},aH)}}else{delete aI.dcid;aK=aj.performDOMCapture(aG,aI)}return aK}function T(aH,aJ){var aI,aG,aK,aL;for(aI=0,aG=aH.length;aI<aG;aI+=1){aK=aH[aI];if(aJ&&aJ.indexOf("#")===0){aL=location.pathname+aJ}else{if(typeof aJ==="undefined"||aJ===r){aL=location.pathname+location.hash}else{aL=aJ}}aL=aj.normalizeUrl(aL);switch(typeof aK){case"object":if(!aK.cRegex){aK.cRegex=new RegExp(aK.regex,aK.flags)}aK.cRegex.lastIndex=0;if(aK.cRegex.test(aL)){return true}break;case"string":if(aK===aL){return true}break;default:break}}return false}function al(){var aG=false,aH;if(!u.enabled||window.hasOwnProperty("ontouchstart")){return}if(h.length===0){return}if(n>=H){aG=true}aH={type:18,mousemove:{elements:w.slice(0),data:h.slice(0),config:{ignoreRadius:u.ignoreRadius,sampleRate:u.sampleRate},limitReached:aG,maxInactivity:d}};aj.post(aH);w.length=0;h.length=0;b={};d=0;return aH}function aC(aH,aT,aI){var aO,aM,aW=false,aJ={},aV=false,aL,aQ,aS=null,aN=0,aR,aP,aG,aK,aU;if(!aH||(!aT&&!aI)){return aS}if(!aT&&!(aH==="load"||aH==="unload")){return aS}K=aj.getConfig()||{};aV=ab.getValue(K,"domCapture.enabled",false);if(!aV||ab.isLegacyIE){return aS}aU=ab.getValue(K,"domCapture.screenviewBlacklist",[]);if(T(aU,aI)){return aS}aQ=ab.getValue(K,"domCapture.triggers")||[];for(aO=0,aR=aQ.length;!aW&&aO<aR;aO+=1){aL=aQ[aO];if(aL.event===aH){if(aH==="load"||aH==="unload"){if(aL.screenviews){aG=aL.screenviews;for(aM=0,aK=aG.length;!aW&&aM<aK;aM+=1){aP=aG[aM];switch(typeof aP){case"object":if(!aP.cRegex){aP.cRegex=new RegExp(aP.regex,aP.flags)}aP.cRegex.lastIndex=0;aW=aP.cRegex.test(aI);break;case"string":aW=(aP===aI);break;default:break}}}else{aW=true}}else{if(aL.targets){aW=(-1!==ab.matchTarget(aL.targets,aT))}else{aW=true}}}if(aL.event==="change"&&aL.delayUntil){ay=ay.concat(aL.targets)}}if(aW){aN=aL.delay||aL.delayUntil||(aL.event==="load"?7:0);aJ.forceFullDOM=!!aL.fullDOMCapture;aS=k(window.document,aJ,aN);if(aS){al()}}return aS}function au(aO){var aI,aJ=ab.getValue(aO,"webEvent.target",{}),aG=aJ.type,aK=aJ.subType||"",aH=ab.getTlType(aJ),aL=aw(ab.getValue(aJ,"element")),aN=null,aM=ab.getValue(aO,"webEvent.subType",null);aI={timestamp:ab.getValue(aO,"webEvent.timestamp",0),type:4,target:{id:aJ.id||"",idType:aJ.idType,name:aJ.name,tlType:aH,type:aG,position:{width:ab.getValue(aJ,"size.width"),height:ab.getValue(aJ,"size.height")},currState:aO.currState||null},event:{tlEvent:F(ab.getValue(aO,"webEvent")),type:ab.getValue(aO,"webEvent.type","UNKNOWN")}};if(aK){aI.target.subType=aK}if(typeof aO.dwell==="number"&&aO.dwell>0){aI.target.dwell=aO.dwell}if(typeof aO.visitedCount==="number"){aI.target.visitedCount=aO.visitedCount}if(typeof aO.prevState!=="undefined"){aI.prevState=aO.prevState}if(aM){aI.event.subType=aM}aN=l(aL);aI.target.isParentLink=!!aN;if(aN){if(aN.href){aI.target.currState=aI.target.currState||{};aI.target.currState.href=aI.target.currState.href||aN.href}if(aN.value){aI.target.currState=aI.target.currState||{};aI.target.currState.value=aI.target.currState.value||aN.value}if(aN.innerText||aN.textContent){aI.target.currState=aI.target.currState||{};aI.target.currState.innerText=ab.trim(aI.target.currState.innerText||aN.innerText||aN.textContent)}}if(ab.isUndefOrNull(aI.target.currState)){delete aI.target.currState}if(ab.isUndefOrNull(aI.target.name)){delete aI.target.name}return aI}function ag(aG){aj.post(aG)}function aD(aK){var aI,aG,aL=aK.length,aN,aM,aJ,aO={mouseout:true,mouseover:true},aH=[];for(aI=0;aI<aL;aI+=1){aN=aK[aI];if(!aN){continue}if(aO[aN.event.type]){aH.push(aN)}else{for(aG=aI+1;aG<aL&&aK[aG];aG+=1){if(!aO[aK[aG].event.type]){break}}if(aG<aL){aM=aK[aG];if(aM&&aN.target.id===aM.target.id&&aN.event.type!==aM.event.type){if(aN.event.type==="click"){aJ=aN;aN=aM;aM=aJ}if(aM.event.type==="click"){aN.target.position=aM.target.position;aI+=1}else{if(aM.event.type==="blur"){aN.target.dwell=aM.target.dwell;aN.target.visitedCount=aM.target.visitedCount;aN.focusInOffset=aM.focusInOffset;aN.target.position=aM.target.position;aI+=1}}aK[aG]=null;aK[aI]=aN}}aH.push(aK[aI])}}for(aN=aH.shift();aN;aN=aH.shift()){aj.post(aN)}aK.splice(0,aK.length)}function aB(aH){var aJ=null,aK,aM=ab.getValue(aH,"nativeEvent.message"),aI=ab.getValue(aH,"nativeEvent.filename"),aG=ab.getValue(aH,"nativeEvent.lineno"),aL=ab.getValue(aH,"nativeEvent.error");if(typeof aM!=="string"){return}aG=aG||-1;if(aL&&aL.stack){aK=aL.stack.toString()}else{aK=(aM+" "+aI+" "+aG).toString()}if(g[aK]){g[aK].exception.repeats=g[aK].exception.repeats+1}else{aJ={type:6,exception:{description:aM,url:aI,line:aG}};aj.post(aJ);g[aK]={exception:{description:aM,url:aI,line:aG,repeats:1}}}v+=1}function G(aG,aH){D.push(au({webEvent:aG,id:aH,currState:ab.getValue(aG,"target.state")}))}function ad(aM,aH,aJ){var aI=false,aL,aG,aK;if(!aM){return}if(D.length===0){return}aH=aH||(aF[aM]?aF[aM].webEvent:{});if(aH.type==="blur"||aH.type==="change"){aK=ab.getValue(aH,"target.state",{})}else{if(aH.target){aK=ab.getTargetState(aH.target.element)||{}}else{aK={}}}if(aK&&aK.disabled){aJ=true}aG=D[D.length-1];if(aF[aM]){aG.focusInOffset=aF[aM].focusInOffset;aG.target.visitedCount=aF[aM].visitedCount;if(aF[aM].focus){aF[aM].dwell=Number(new Date())-aF[aM].focus;aG.target.dwell=aF[aM].dwell}if(!aF[aM].processedChange&&aF[aM].prevState&&!aJ){if(!ab.isEqual(aF[aM].prevState,aK)){aH.type="change";aG.event.type=aH.type;aG.event.tlEvent=F(aH);aG.target.prevState=aF[aM].prevState;aG.target.currState=aK}}}else{aF[aM]={}}if(aG.event.type==="click"){if(!aE(aG.target)){aG.target.currState=aK;aI=true}}else{if(aG.event.type==="focus"){aI=true}}if(aI&&!aJ){aG.event.type="blur";aG.event.tlEvent="focusout"}if(!aG.dcid){aL=aC(aG.event.type,aH.target);if(aL){aG.dcid=aL}}if(!aJ){f.inFocus=false}aF[aM].prevState=aK?ab.mixin({},aK):aK;aD(D)}function j(aJ,aH){var aI=D.length,aG=aI?D[aI-1]:null;if(f.inFocus&&f.target.id===aJ){if(!aG||aG.target.id!==aJ){G(aH,aJ);aF[aJ].processedChange=false;aF[aJ].processedClick=false}return}if(f.inFocus){ad(f.target.id,f)}f=aH;f.inFocus=true;if(!aF[aJ]){aF[aJ]={}}aF[aJ].focus=f.dwellStart=Number(new Date());aF[aJ].focusInOffset=ai?f.dwellStart-Number(ai):-1;if(aH.type==="focus"){aF[aJ].prevState=ab.getValue(aH,"target.state")}else{if(aH.type==="click"&&!aF[aJ].prevState){aF[aJ].prevState=ab.getValue(aH,"target.state");if(aF[aJ].prevState&&(aH.target.subType==="checkbox"||aH.target.subType==="radio")){aF[aJ].prevState.checked=!aF[aJ].prevState.checked}}}aF[aJ].visitedCount=aF[aJ].visitedCount+1||1;aF[aJ].webEvent=aH;aF[aJ].processedChange=false;aF[aJ].processedClick=false;G(aH,aJ)}function N(aL,aI){var aH=false,aJ,aK=D.length,aG=aK?D[aK-1]:null;if(!aG){return aH}aJ=aG.target.id;if(aJ!==aL&&aG.target.tltype!=="selectList"){if(aI.type==="focus"||aI.type==="click"||aI.type==="change"||aI.type==="blur"||aI.type==="unload"){ad(aJ);aH=true}}if(aJ===aL&&((aI.type==="click"&&aF[aL].processedClick)||(aI.type==="change"&&aF[aL].processedChange)||(aI.type==="pointerup"&&aF[aL].processedClick&&ab.getValue(aI.target,"state.disabled",false)))){ad(aJ,null,true);aH=true}return aH}function B(aI,aH){var aG;j(aI,aH);aG=D[D.length-1];aG.event.type="change";aG.event.tlEvent=F(aH);aG.target.currState=aH.target.state;if(aF[aI].prevState){aG.target.prevState=aF[aI].prevState}aF[aI].webEvent=aH;aF[aI].processedChange=true;if(ab.matchTarget(ay,aH.target)!==-1){ad(aI,aH)}}function M(aJ,aI){var aH,aG;if(aI.target.type==="select"&&az&&az.target.id===aJ){az=null;return}j(aJ,aI);aH=D[D.length-1];if(aH.event.type==="focus"){aH.event.type="click";aH.event.tlEvent=F(aI)}aG=aI.nativeEvent;if(aG&&(!window.MouseEvent||!(aG instanceof MouseEvent&&aG.detail===0)||(window.PointerEvent&&aG instanceof PointerEvent&&aG.pointerType!==""))){aH.target.position.relXY=ab.getValue(aI,"target.position.relXY")}if(!aF[aJ].processedChange){aF[aJ].webEvent=aI}aF[aJ].processedClick=true;if(aE(aI.target)){ad(aJ,aI)}az=aI}function R(aI,aH){var aG=aI;if(!ab.getValue(aH,"target.element.disabled",false)){return}switch(aH.type){case"pointerdown":o=aG;break;case"pointerup":if(aG===o){aH.type="click";M(aI,aH)}o=null;break}}function c(aK){var aI,aO=0,aG=0,aJ,aH,aM,aN,aL;if(!u.enabled||window.hasOwnProperty("ontouchstart")){return}if(n>=H){return}aI={element:{id:aK.target.id,idType:aK.target.idType},x:aK.position.x,y:aK.position.y,offset:aK.timestamp-ak};if(J!==null){aO=aI.offset-J.offset;if(ah&&aO<ah){return}aN=Math.abs(aI.x-J.x);aL=Math.abs(aI.y-J.y);aG=(aN>aL)?aN:aL;if(L&&aG<L){return}if(aO>d){d=aO}}aJ=JSON.stringify(aI.element);aH=b[aJ];if(typeof aH==="undefined"){w.push(aI.element);aH=w.length-1;b[aJ]=aH}aM=ab.getValue(aK,"target.position.relXY").split(",");h.push([aH,aM[0],aM[1],aI.offset]);n+=1;J=aI}function a(aH){var aG=aH.orientation,aI={type:4,event:{type:"orientationchange"},target:{prevState:{orientation:O,orientationMode:ab.getOrientationMode(O)},currState:{orientation:aG,orientationMode:ab.getOrientationMode(aG)}}};ag(aI);O=aG}function s(aG){var aJ=document.visibilityState==="visible"?true:false,aI={type:4,event:{type:"visibilitychange"},target:{prevState:{visible:C},currState:{visible:aJ}}},aH;aH=aC(aG.type,aG.target);if(aH){aI.dcid=aH}ag(aI);C=aJ}function e(aH){var aG=false;if(!aH){return aG}aG=(ap.scale===aH.scale&&Math.abs((new Date()).getTime()-ap.timestamp)<500);return aG}function V(aG){ap.scale=aG.scale;ap.rotation=aG.rotation;ap.timestamp=(new Date()).getTime()}function E(){var aG,aH;aG=m-Q;if(isNaN(aG)){aH="INVALID"}else{if(aG<0){aH="CLOSE"}else{if(aG>0){aH="OPEN"}else{aH="NONE"}}}return aH}function y(aK){var aP=document.documentElement||{},aM=document.body||{},aQ=window.screen,aH=aQ.width,aI=aQ.height,aL=ab.getValue(aK,"orientation",0),aN=!ab.isiOS?aH:Math.abs(aL)===90?aI:aH,aJ={type:1,clientState:{pageWidth:Math.max(aM.clientWidth||0,aP.offsetWidth||0,aP.scrollWidth||0),pageHeight:Math.max(aM.clientHeight||0,aP.offsetHeight||0,aP.scrollHeight||0),viewPortWidth:window.innerWidth||aP.clientWidth,viewPortHeight:window.innerHeight||aP.clientHeight,viewPortX:Math.round(window.pageXOffset||(aP||aM).scrollLeft||0),viewPortY:Math.round(window.pageYOffset||(aP||aM).scrollTop||0),deviceOrientation:aL,event:ab.getValue(aK,"type")}},aO=aJ.clientState,aG;ao=ao||aJ;if(aO.event==="unload"&&aO.viewPortHeight===aO.pageHeight&&aO.viewPortWidth===aO.pageWidth){if(ao.clientState.viewPortHeight<aO.viewPortHeight){aO.viewPortHeight=ao.clientState.viewPortHeight;aO.viewPortWidth=ao.clientState.viewPortWidth}}if((aO.viewPortY+aO.viewPortHeight)>aO.pageHeight){aO.viewPortY=aO.pageHeight-aO.viewPortHeight}if(aO.viewPortY<0){aO.viewPortY=0}aG=!aO.viewPortWidth?1:(aN/aO.viewPortWidth);aO.deviceScale=aG.toFixed(3);aO.viewTime=0;if(aq&&Z){aO.viewTime=Z.getTime()-aq.getTime()}if(aK.type==="scroll"){aO.viewPortXStart=ao.clientState.viewPortX;aO.viewPortYStart=ao.clientState.viewPortY}return aJ}function af(){var aG;if(X){aG=X.clientState;if(aG.viewPortHeight>0&&aG.viewPortHeight<i&&aG.viewPortWidth>0&&aG.viewPortWidth<i){ag(X)}ao=X;X=null;aq=P||aq;Z=null}af.timeoutId=0}function z(aG){var aH=null;if(ab.isOperaMini){return}X=y(aG);if(aG.type==="scroll"||aG.type==="resize"){if(af.timeoutId){window.clearTimeout(af.timeoutId)}af.timeoutId=window.setTimeout(af,ab.getValue(K,"scrollTimeout",2000))}else{if(aG.type==="touchstart"||aG.type==="load"){if(X){Q=parseFloat(X.clientState.deviceScale)}}else{if(aG.type==="touchend"){if(X){m=parseFloat(X.clientState.deviceScale);af()}}}}if(aG.type==="load"||aG.type==="unload"){if(aG.type==="unload"&&W){aH=ab.clone(X);aH.clientState.event="attention";aH.clientState.viewTime=(new Date()).getTime()-W}af();if(aH){X=aH;af()}}return X}function an(aH){var aG=ab.getValue(aH,"nativeEvent.touches.length",0);if(aG===2){z(aH)}}function q(aJ){var aI,aH={},aK=ab.getValue(aJ,"nativeEvent.rotation",0)||ab.getValue(aJ,"nativeEvent.touches[0].webkitRotationAngle",0),aG=null,aL={type:4,event:{type:"touchend"},target:{id:ab.getValue(aJ,"target.id"),idType:ab.getValue(aJ,"target.idType")}};aI=ab.getValue(aJ,"nativeEvent.changedTouches.length",0)+ab.getValue(aJ,"nativeEvent.touches.length",0);if(aI!==2){return}z(aJ);aG={rotation:aK?aK.toFixed(2):0,scale:m?m.toFixed(2):1};aG.pinch=E();aH.scale=Q?Q.toFixed(2):1;aL.target.prevState=aH;aL.target.currState=aG;ag(aL)}function am(aQ,aJ){var aN=["type","name","target.id"],aI=null,aK,aM,aL=true,aO=10,aH=0,aP=0,aG=0;if(!aQ||!aJ||typeof aQ!=="object"||typeof aJ!=="object"){return false}for(aK=0,aM=aN.length;aL&&aK<aM;aK+=1){aI=aN[aK];if(ab.getValue(aQ,aI)!==ab.getValue(aJ,aI)){aL=false;break}}if(aL){aP=ab.getValue(aQ,"timestamp");aG=ab.getValue(aJ,"timestamp");if(!(isNaN(aP)&&isNaN(aG))){aH=Math.abs(ab.getValue(aQ,"timestamp")-ab.getValue(aJ,"timestamp"));if(isNaN(aH)||aH>aO){aL=false}}}return aL}function p(aG){var aI={type:4,event:{type:aG.type},target:{id:ab.getValue(aG,"target.id"),idType:ab.getValue(aG,"target.idType"),currState:ab.getValue(aG,"target.state")}},aH;aH=aC(aG.type,aG.target);if(aH){aI.dcid=aH}ag(aI)}return{init:function(){D=[]},destroy:function(){ad(aA);D=[];if(af.timeoutId){window.clearTimeout(af.timeoutId);af.timeoutId=0}},onevent:function(aH){var aN=null,aK=null,aG,aL,aM,aJ,aI=null;if(typeof aH!=="object"||!aH.type){return}if(am(aH,ax)){ax=aH;return}ax=aH;aN=ab.getValue(aH,"target.id");if(!aF[aN]){aF[aN]={}}N(aN,aH);switch(aH.type){case"hashchange":break;case"focus":j(aN,aH);break;case"blur":ad(aN,aH);break;case"pointerdown":R(aN,aH);break;case"pointerup":R(aN,aH);break;case"click":M(aN,aH);break;case"change":B(aN,aH);break;case"orientationchange":a(aH);break;case"touchstart":an(aH);break;case"touchend":q(aH);break;case"loadWithFrames":TLT.logScreenviewLoad("rootWithFrames");break;case"load":O=aH.orientation;aq=new Date();if(typeof ab.getOrientationAngle()!=="number"||ab.isAndroid){aL=(window.screen.width>window.screen.height?90:0);aG=ab.getOrientationAngle();if(Math.abs(aG)!==aL&&!(aG===180&&aL===0)&&!(aG===270&&aL===90)){ab.isLandscapeZeroDegrees=true;if(Math.abs(aG)===180||Math.abs(aG)===0){O=90}else{if(Math.abs(aG)===90||Math.abs(aG)===270){O=0}}}}setTimeout(function(){if(aj.isInitialized()){z(aH)}},100);if(ab.getValue(K,"forceRootScreenview",false)){ae=r}else{ae=TLT.normalizeUrl(location.hash)||r}TLT.logScreenviewLoad(ae);break;case"screenview_load":ai=new Date();aa();aK=aC("load",null,aH.name);break;case"screenview_unload":aK=aC("unload",null,aH.name);break;case"resize":case"scroll":if(!Z){Z=new Date()}P=new Date();z(aH);break;case"unload":for(aM in g){if(g.hasOwnProperty(aM)){aJ=g[aM].exception;if(aJ.repeats>1){aI={type:6,exception:aJ};aj.post(aI)}}}if(D){aD(D)}Z=new Date();z(aH);if(ae===r||TLT.normalizeUrl(location.hash)===ae){TLT.logScreenviewUnload(ae)}break;case"mousemove":c(aH);break;case"error":aB(aH);break;case"visibilitychange":s(aH);break;default:p(aH);break}aA=aN;return aK},onmessage:function(){}}});
/*!
 * Copyright (c) 2020 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 * README
 * https://github.com/ibm-watson-cxa/UICaptureSDK-Modules/tree/master/AjaxListener/README.md
 */
// v1.2.2
// Disable ajaxListener module EF-14415 line 83
// TLT.addModule("ajaxListener",function(c){var l={},h=false,j,p,z,k,t=c.utils;function f(C,H,B){var E,A,F={},G=l.filters,D;if(!G||!G.length){return F}for(E=0,A=G.length,D=false;!D&&E<A;E+=1){F=G[E];D=true;if(F.url){D=F.url.cRegex.test(C)}if(D&&F.method){D=F.method.cRegex.test(H)}if(D&&F.status){D=F.status.cRegex.test(B)}}if(!D){F=null}return F}function o(E){var G={},C,A,F,B,D;E=E.split(/[\r\n]+/);for(C=0,A=E.length;C<A;C+=1){F=E[C].split(": ");B=F[0];D=t.rtrim(F[1]);if(B&&B.length){G[B]=D}}return G}function m(H,D){var G={type:5,customEvent:{name:"ajaxListener",data:{interfaceType:"XHR"}}},C,B=G.customEvent.data,A;if(!H){return}C=document.createElement("a");C.href=H.tListener.url;B.originalURL=C.host+(C.pathname[0]==="/"?"":"/")+C.pathname;B.requestURL=c.normalizeUrl?c.normalizeUrl(B.originalURL):B.originalURL;B.description="Full Ajax Monitor "+B.requestURL;B.method=H.tListener.method;B.status=H.status;B.statusText=H.statusText||"";B.async=H.tListener.async;B.ajaxResponseTime=H.tListener.end-H.tListener.start;if(D.requestHeaders){B.requestHeaders=H.tListener.reqHeaders}if(D.requestData&&typeof H.tListener.reqData==="string"&&!H.tListener.isSystemXHR){try{B.request=JSON.parse(H.tListener.reqData)}catch(F){B.request=H.tListener.reqData}}if(D.responseHeaders){B.responseHeaders=o(H.getAllResponseHeaders())}if(D.responseData){if(typeof H.responseType==="undefined"){A=H.responseText}else{if(H.responseType===""||H.responseType==="text"){A=H.response}else{if(H.responseType==="json"){B.response=H.response}else{B.response=typeof H.response}}}if(A){try{B.response=JSON.parse(A)}catch(E){B.response=A}}if(H.responseType){B.responseType=H.responseType}}c.post(G)}function q(C){var E,D={},B=C.entries(),A=B.next();while(!A.done){E=A.value;D[E[0]]=E[1];A=B.next()}return D}function g(A){return q(A)}function b(A){if(typeof A==="object"&&A.toString().indexOf("FormData")!==-1){return q(A)}return A}function r(A,E,F){var G={type:5,customEvent:{name:"ajaxListener",data:{interfaceType:"fetch"}}},D,C=G.customEvent.data,B,H;D=document.createElement("a");D.href=A.url;C.originalURL=D.host+(D.pathname[0]==="/"?"":"/")+D.pathname;C.requestURL=c.normalizeUrl?c.normalizeUrl(C.originalURL):C.originalURL;C.description="Full Ajax Monitor "+C.requestURL;C.method=A.initData.method;C.status=E.status;C.statusText=E.statusText||"";C.async=true;C.ajaxResponseTime=A.end-A.start;C.responseType=E.type;if(F.requestHeaders){if(A.initData.headers&&A.initData.headers.toString().indexOf("Headers")!==-1){C.requestHeaders=g(A.initData.headers)}else{C.requestHeaders=A.initData.headers||""}}if(F.requestData&&typeof A.body!=="undefined"&&!A.isSystemXHR){C.request=b(A.body)}if(F.responseHeaders){C.responseHeaders=g(E.headers)}if(F.responseData){H=E.headers.get("content-type");if(H&&H.indexOf("application/json")!==-1){E.clone().json().then(function(I){C.response=I;c.post(G)});return}if(H&&(H.indexOf("text")!==-1||H.indexOf("xml")!==-1)){E.clone().text().then(function(I){C.response=I;c.post(G)});return}C.response="Not logging unsupported response content: "+H}c.post(G)}function n(E){var C,B=E.tListener.url,F=E.tListener.method,A=E.status.toString(),D={requestHeaders:false,requestData:false,responseHeaders:false,responseData:false};C=f(B,F,A);if(C){if(C.log){D=C.log}m(E,D)}}function a(A,E){var D,C=A.url,G=A.initData.method,B=E.status.toString(),F={requestHeaders:false,requestData:false,responseHeaders:false,responseData:false};D=f(C,G,B);if(D){if(D.log){F=D.log}r(A,E,F)}}function w(B){var C,A;if(!B||!B.target){return}C=B.target;A=C.readyState;if(A===4){C.removeEventListener("readystatechange",w);C.tListener.end=Date.now();n(C)}}function s(B){var A=B.setRequestHeader;B.setRequestHeader=function(F,D){var E=this,C=E.tListener;if(F&&F.length){C.reqHeaders[F]=D}return A.apply(E,arguments)}}function y(A){var B=A.send;A.send=function(D){var E=this,C=E.tListener;if(D){C.reqData=D}C.start=Date.now();return B.apply(E,arguments)}}function u(B){var C,A,D;A=TLT.getServiceConfig("queue");D=A.queues||[];for(C=0;C<D.length;C+=1){if(D[C].endpoint&&B.indexOf(D[C].endpoint)!==-1){return true}}return false}function v(D,A,B){var C=this;if(h){C.addEventListener("readystatechange",w);C.tListener={method:D,url:A,async:(typeof B==="undefined")?true:!!B,reqHeaders:{},isSystemXHR:u(A)};s(C);y(C)}return j.apply(C,arguments)}function x(){if(XMLHttpRequest){j=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=v}}function i(){p=window.fetch;window.fetch=function(C,B){var A={},D;if(typeof C==="object"){A.initData=C;A.url=C.url;A.initData.clone().text().then(function(E){if(E.length>0){A.body=E}})}else{A.initData=B||{};A.url=C;if(B&&B.body){A.body=B.body}}A.isSystemXHR=u(A.url);A.start=Date.now();D=p.apply(this,arguments);return D.then(function(E){A.end=Date.now();a(A,E);return E})}}function d(A){if(A&&A.regex){A.cRegex=new RegExp(A.regex,A.flags)}}function e(B){var C,A,D,E=[];if(B&&B.filters){E=B.filters}for(C=0,A=E.length;C<A;C+=1){D=E[C];t.forEach([D.url,D.method,D.status],d)}z=t.getValue(B,"xhrEnabled",true);if(XMLHttpRequest&&(XMLHttpRequest.toString().indexOf("[native code]")===-1||XMLHttpRequest.toString().indexOf("XMLHttpRequest")===-1)){z=false}k=t.getValue(B,"fetchEnabled",true)&&(typeof window.fetch==="function");if(k&&window.fetch.toString().indexOf("[native code]")===-1){k=false}}return{init:function(){l=c.getConfig();e(l)},destroy:function(){h=false},onevent:function(A){switch(A.type){case"load":if(z){x()}if(k){i()}h=true;break;case"unload":h=false;break;default:break}},version:"1.2.2"}});

//************************ Begin Custom Modules ************************//

//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------------- Digital Data (QueryString, visDetect)
//----------------------------------------------------------------------------------------------------------
TLT.addModule("digitalData", function(context) {
	var config = {},
		qKeys = {},
		q,
		svChange = false,
		utils = context.utils;

	function postMsg(desc, action, qKeys) {
		var jMsg = {"description":desc, "action":action, "value":qKeys};
		TLT.logCustomEvent(desc, jMsg);
	};
	//------------------------------------------------------- Query String Logging -----
	// new with 5.6.0:  no longer needed, UIC now logs query parameters in the type 2 screenview message.
	  function parseQueryString() {
        q = (location.search.length > 1 ? location.search.substring(1).split("&") : []);
        for (var i = 0; i < q.length; i++) {
            qKeys[q[i].match(/^[^=^,^.^%^-^20]+/)] = q[i].replace(/^[^=^,^.^%^-^20]+=?/, "");
        };
        if (i > 0) {
            postMsg("QueryString Values", "Retrieve", qKeys)
        };
    };
	//------------------------------------------------ Unhandled Exception Logging -----
	// new with 5.6.0:  error logging no longer needed, included as standard type 6 exception message.
    function logExceptions() {
        window.onerror = function(errorMsg, url, lineNumber) {
            postMsg("Error: " + errorMsg, "Captured", {
                url: url,
                lineNumber: lineNumber,
                errorMsg: errorMsg
            })
        };
    } 
	//------------------------------------------- Left/Returned to Browser Logging -----
    function visDetect(){
        // query current page visibility state: prerender, visible, hidden
        var pageVisibility = document.visibilityState;
        if (pageVisibility == 'hidden') {
            postMsg("Vis_State_Change", "Retrieve", "Left_App");
            TLT.flushAll();
        }
        // fires when app transitions from prerender, user returns to the app / tab.
        if (pageVisibility == 'visible') {
            postMsg("Vis_State_Change", "Retrieve", "Returned_To_App");
        }
	};
    //--------------------------------------------------- Tag Manager Data Logging ----- 
    function getTagManagerData() {
        if (typeof(TagManagerObject) !== "undefined") {
            var utagd = JSON.parse(JSON.stringify(TagManagerObject));
            var jMsg = {
                "description": "TagManagerObject",
                "action": "retrieved",
                "value": utagd
            };
            TLT.logCustomEvent("UTAG DATA", jMsg);
        }
    };

    return {
        init: function () {
            config = context.getConfig();
        },
        destroy: function () {
            config = null;
        },
        onevent: function (webEvent) {
            if (typeof webEvent !== "object" || !webEvent.type) {
                return;
            }
            if (webEvent) {
                switch (webEvent.type) {
				case "load":
					parseQueryString();
					logExceptions();
					getTagManagerData();
					visDetect();
					break;
				case "unload":
					getTagManagerData();
					break;
                case "click":
                    TLT.flushAll();
                    break;
                case "visibilitychange":
                    visDetect();
					break;
				case "event-view-start":
					getTagManagerData();
					break;
                default:
                    break;
                }
            }
        }
    };
});
// REPLACED BY 5.7.0:  UIC adds support for detecting multiple browser tabs/windows within the context of a session.
// A new property called tabId which contains a numeric identifier is added to the JSON.  (set in localStorage if available)
// Hits containing the same tabId originate from pages that were opened in the same browser window/tab. 
// Hits containing different tabId values originated from a different browser window/tab.
//----------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------- Tab Monitoring v1.3
//----------------------------------------------------------------------------------------------------------
TLT.addModule("tabMonitoring", function (context) {
    function tabStateMonitor() {
        if (typeof window.sessionStorage !== "undefined" && typeof window.localStorage !== "undefined" &&
            window.sessionStorage && window.localStorage) { // Sanity Check
            var tlDate = new Date(),
            tlTimer = tlDate.getTime(),
            referrer = document.referrer,
            tlReferrer = window.sessionStorage.tlReferrer,
            tlLastTimer = parseInt(window.localStorage.tlLastTimer),
            tlHitNumber = parseInt(window.localStorage.tlHitNumber),
            tlTabTotal = parseInt(window.localStorage.tlTabTotal),
            tlTabCurrent = parseInt(window.sessionStorage.tlTabCurrent);
            if (tlLastTimer) {
                if (tlTimer - 30 * 60 * 1000 > tlLastTimer) { // Reset session after 30 minutes of inactivity
                    tlHitNumber = 0;
                }
            }
            if (!tlHitNumber) {
                tlHitNumber = 0;
                tlTabTotal = 0;
                tlTabCurrent = 0;
            }
            if (!tlTabCurrent) { // Skip this section if user is navigating inside same tab
                if (!referrer || !tlReferrer || tlHitNumber == 0) { // New tab detected
                    if (tlHitNumber == 0) { // First hit of session means the user is in the primary tab
                        tlTabTotal = 1;
                    } else { // Anything else means the user has opened an additional tab
                        tlTabTotal = parseInt(tlTabTotal) + 1
                    }
                    tlTabCurrent = tlTabTotal; // Maintain state
                    window.sessionStorage.tlTabCurrent = tlTabCurrent; // Save state
                    window.localStorage.tlTabTotal = tlTabTotal; // Save total # of tabs
                }
            }
            tlHitNumber = tlHitNumber + 1; // Increment hit number
            window.localStorage.tlHitNumber = tlHitNumber; // Save current hit number
            window.sessionStorage.tlReferrer = referrer; // Save referrer value for tab detection
            window.localStorage.tlLastTimer = tlTimer; // Save current load timer for session expiration
        }
    }
    return {
        init: function () {},
        destroy: function () {},
        onevent: function (webEvent) {
            if (typeof webEvent !== "object" || !webEvent.type) {
                return;
            } // Sanity check
            if (webEvent) {
                tabStateMonitor();
            }
        }
    };
});
// REPLACED BY 5.7.0: Performance Alert msg (type 17): https://developer.ibm.com/customer-engagement/docs/25642-2/
//----------------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------- Client Side Performance Monitoring V5
//----------------------------------------------------------------------------------------------------------
TLT.addModule("performanceData", function (context) {
	var epFilter,
	perfDur = TLT.getCoreConfig().modules.performanceData.responseTime,
	logJS = TLT.getCoreConfig().modules.performanceData.monitorJS,
	logCSS = TLT.getCoreConfig().modules.performanceData.monitorCSS,
	logImages = TLT.getCoreConfig().modules.performanceData.monitorImages,
	logXHR = TLT.getCoreConfig().modules.performanceData.monitorXHR,
	blacklist = TLT.getCoreConfig().modules.performanceData.blacklist;

	function postMsg(description, urlNormalized, urlFull, initiator, responseTime, totalTime, size) {
		var jMsg = {
			"description": description,
			"urlNormalized": urlNormalized,
			"urlFull": urlFull,
			"initiator": initiator,
			"response_time": responseTime,
			"total_time": totalTime,
			"size(kBytes)": size
		};
		TLT.logCustomEvent("Performance Data", jMsg);
	};

	function getPerfObject() {
		if (typeof window.location.host != "undefined") {
			calculate_load_times();
		}
	}

	function blacklistURL(blURL) {
		for (var index = 0; index < blacklist.length; ++index) {
			epFilter = blacklist[index];
			if (blURL.indexOf(epFilter) > -1) {
				return true;
			}
		}
		return false;
	};

	function calculate_load_times() {
		if (performance !== undefined) {
			var resources = performance.getEntriesByType("resource");
			for (var i = 0; i < resources.length; i++) {
				if ((resources[i].initiatorType.indexOf('script') > -1 && logJS) ||
					(resources[i].initiatorType.indexOf('css') > -1 && logCSS) ||
					(resources[i].initiatorType.indexOf('img') > -1 && logImages) ||
					(resources[i].initiatorType.indexOf('xmlhttprequest') > -1 && logXHR)) {
					var URL = resources[i].name;
					if (!blacklistURL(URL)) {
						var totalTime = (resources[i].responseEnd).toFixed(2);
						var responseTime = (resources[i].responseEnd - resources[i].startTime).toFixed(2);
						var size = (resources[i].transferSize / 1024).toFixed(2);
						if (URL.indexOf('?') > -1) {
							URL = URL.substr(0, URL.indexOf('?'))
						}
						if (responseTime > perfDur) {
							postMsg("Slow Resource - " + resources[i].initiatorType + " (" + (responseTime / 1000).toFixed(2) + " secs)",
								URL,
								resources[i].name,
								resources[i].initiatorType,
								responseTime,
								totalTime,
								size);
						}
					}
				}
			}
		}
	}

	return {
		init: function () {},
		destroy: function () {},
		onevent: function (webEvent) {
			if (typeof webEvent !== "object" || !webEvent.type) {
				return;
			} // Sanity check
			if (webEvent) {
				if (navigator.vendor.indexOf("Apple") >-1 ){
					setTimeout(function() {
						if (document.readyState === "complete"){
							getPerfObject();
						};
					}, 300);
				} else {
					getPerfObject();
				}
			}
		}
	};
});

//--------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------- Custom SSL Protocol Violation Module
//--------------------------------------------------------------------------------------------------------------
TLT.addModule("sslcheck", function (context) {

    function postMsg(description, payload) {
        var jMsg = {
            "description": description,
            "violations": payload
        };
        TLT.logCustomEvent(description, jMsg);
    };
    function sslCheck() {
        if (performance !== undefined) {
            var pe = performance.getEntries(),
            urlIndex = 0;
            payload = {};
            payload.urls = [];
            if (location.protocol === 'https:') {
                // Check for SSL
                payload.protocol = "SSL";
                for (var i = 0; i < pe.length; i++) {
                    if (pe[i].name.indexOf("http://") > -1) {
                        payload.urls[urlIndex] = {};
                        payload.urls[urlIndex] = pe[i].name;
                        urlIndex++;
                    }
                }
            }
            if (urlIndex) {
                postMsg("SSL Violations", payload);
            }
        }
    }

    return {
        init: function () {},
        destroy: function () {},
        onevent: function (webEvent) {
            if (typeof webEvent !== "object" || !webEvent.type) {
                return;
            }
            // Sanity check
            if (webEvent) {
                sslCheck();
            }
        }
    };
});

//************************ End Custom Modules ************************//

//----------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------ Tealeaf Configuration
//----------------------------------------------------------------------------------------------------------
(function () {
    "use strict";
        // TLT is expected to be defined in the global scope i.e. window.TLT
    var TLT = window.TLT,
		uicUserAgent = navigator.userAgent.toLowerCase(),
		disableSDK = false;

    if (TLT.utils.isLegacyIE) {
        /**
         * This version of the UIC does not support Internet Explorer 8.
         * Applications requiring Internet Explorer 8 (or below) support should use UIC 5.2.0
         */
        return;
    }

	var config = {
		core: {
			inactivityTimeout: 1000 * 60 * 30, /* 30 minutes before SDK timeout and shutdown */
			// List of CSS selectors corresponding to elements for which no user interaction is to be reported.
			// WARNING: Since this list has to be evaluated for each event, specifying inefficient selectors can cause performance issues.
			blockedElements: ["header[class=main-header] input"],
// new with 5.7.0:  Custom events to trigger logging of load events
// The SDK triggers �load� events on initialization. You can use custom events to trigger logging of load events by adding �screenviewLoadEvent� in the core configuration.
// In some cases, the SDK triggers the load event before the page is fully rendered, which produces an incomplete initial DOM capture. 
// To solve this problem, configure a custom event that triggers the load event at an appropriate time.
//			screenviewLoadEvent: {
//				name: "click",   //This could be any custom event, or DOM event.      
//				target: window         
//			},
			// WARNING: For advanced users only. Modifying the modules section may lead to unexpected behavior and or performance issues.
			modules: {
				replay: {
					events: [
						{name: "change",attachToShadows: true,recurseFrames: true},
						{name: "click",recurseFrames: true},
                        {name: "pointerdown",recurseFrames: true },
                        {name: "pointerup",recurseFrames: true },
						{name: "hashchange",target: window},
						{name: "focus",target: "input, select, textarea, button",recurseFrames: true},
						{name: "blur",target: "input, select, textarea, button",recurseFrames: true},
						{name: "load",target: window},
						{name: "unload",target: window},
						{name: "resize",target: window},
						{name: "scroll",target: window},
                        {name: "mousemove", recurseFrames: true },  // new with 5.6.0
						{name: "orientationchange",target: window},
						{name: "touchstart"},
						{name: "touchend"},
						{name: "ngOnInit"},
						{name: "event-view-start"},
						{name: "event-view-end"},
                        {name: "error", target: window},  // new with 5.6.0: improved type 6 exception messages
						{name: "visibilitychange" }   // for custom visDetect module
					]
				},
// Disable ajaxListener module EF-14415 line 83				
/*				ajaxListener: {
					xhrEnabled: true,
					fetchEnabled: true, // Capturing fetch data is enabled by default. This function will be automatically turned off in browsers which do not support Fetch API.
					events: [
						{ name: "load", target: window},
						{ name: "unload", target: window}
					]
				},*/
                digitalData: { // Add custom data logging (visDetect, iOS<12.2 TLT.flushAll();)
                    enabled: true,
                    events: [
						{ name: "load", target: window },
						{ name: "unload", target: window },
						{ name: "visibilitychange", target: document },
						{ name: "ngOnInit", target: window },
						{ name: "event-view-start"}
                    ]
                },
				// replaced by 5.7.0:  new property 'tabId' added to msg JSON tabId containing a numeric identifier. 
				tabMonitoring: {  
					enabled: true,
					events: [
						{ name: "load", target: window }
					]
				},
				// replaced by 5.7.0:  Performance Alert message (Type 17)
				performanceData : {
					enabled : true,
					responseTime : 3000, // Time in ms to log slow static content - Recommended 2000+
					monitorJS: true,
					monitorCSS: true,
					monitorImages: true,
					monitorXHR: true,
					blacklist: [
						"twitter.com", "bam.nr", "google"
					],
					events: [
						{ name: "load", target: window }
					]
				},
				sslcheck : {
					enabled : true,
					events : [
						{ name : "load", "target" : window }
					]
				},
                gestures: {  // Standard / optional tealeaf.gestures.js library not included in this template
                    enabled: false,
                    events: [
                        { name: "tap", target: window },
                        { name: "hold", target: window },
                        { name: "drag", target: window },
                        { name: "release", target: window },
                        { name: "pinch", target: window }
                    ]
                },
				overstat: {
					enabled: true,
					events: [
						{ name: "click", recurseFrames: true },
						{ name: "mousemove", recurseFrames: true },
						{ name: "mouseout", recurseFrames: true },
						{ name: "submit", recurseFrames: true }
					]
				},
				performance: {
					enabled: true,
					events: [
						{ name: "load", target: window },
						{ name: "unload", target: window }
					]
				},
				TLCookie: {
					enabled: true
				}
			},

            normalization: {  // new with 5.6.0
                /**
                  * User defined URL normalization function which accepts an URL or path and returns
                  * the normalized URL or normalized path.
                  * @param url {String} URL or Path which needs to be normalized.
                  * @returns {String} The normalized URL or Path.
                  */
                urlFunction: function (url) {
                    // Normalize the input URL or path here.
                    // Refer to the documentation for an example to normalize the URL path or URL query parameters.
					if (typeof url !== "undefined") {
						if (url.length > 0) {
							if (url.indexOf("/SampleURL") > -1) {
								url = "/URLNORMALIZED";
							} else if (url.indexOf("store/home") > -1) {
								url = "/XXXXXstore/home";
							} else if (url.indexOf("store/shop/textbooks-and-course-materials") > -1) {
								url = "/XXXXXstore/shop/textbooks-and-course-materials";
							} else if (url.indexOf("store/course-materials-results") > -1) {
								url = "/XXXXXstore/course-materials-results";
							} else if (url.indexOf("store/product") > -1) {
								url = "/XXXXXstore/product";
							} else if (url.indexOf("store/search/keyword") > -1) {
								url = "/XXXXXstore/search/keyword";
							} else if ((url.indexOf("store/bag") > -1) && (url.indexOf("store/bag/") < 0)) {
								url = "/XXXXXstore/bag";
							} else if (url.indexOf("store/bag/checkout") > -1) {
								url = "/XXXXXstore/bag/checkout";
							} else if (url.indexOf("store/bag/order-confirmation") > -1) {
								url = "/XXXXXstore/bag/order-confirmation";
							}
						}
					}
					return url;
                }
            },
			// Set the sessionDataEnabled flag to true only if it's OK to expose Tealeaf session data to 3rd party scripts.
			sessionDataEnabled: false,
			sessionData: {
				sessionValueNeedsHashing: false,
				//sessionQueryName: "sessionID",
				//sessionQueryDelim: ";",
				sessionCookieName: "TLTSID"
			},
			// Automatically detect screenview changes by tracking URL path and hash change.
			screenviewAutoDetect: true,
			// list of ignored frames pointed by css selector (top level only)
			framesBlacklist: [
				//"#iframe1"
			]
		},
		services: {
			queue: {
				// WARNING: Enabling asynchronous request on unload may result in incomplete or missing data
				asyncReqOnUnload: true,
// Beacon has a size limit of 64kb PER PAGE, so if some customer data is lost onUnload, check that 1) some other application is not using beacon on the same page and 2) any TL unload beacon post is less than 64kb.
				useBeacon: true,  // set to false if v9 onprem or earlier (v10 OK). If usefetch:true, sent in onUnload post only.
//				useFetch: false,   // new with 5.6.0: useFetch:true is the new default if supported by browser
// new with 5.6.0 for use with tltWorker.js. Only initialized on browsers supporting the fetch API
//				web worker docs:  https://developer.goacoustic.com/acoustic-exp-analytics/docs/implementing-the-acoustic-tealeaf-web-worker-script
//				must uncomment mode: "same-origin" and keepalive: true, in tltWorker if onprem + asynchReqOnUnload = true (chrome80)
//				tltWorker: window.fetch && window.Worker ? new Worker("tltWorker.js") : null,  // update URL as needed
				xhrLogging: true,  // for debugging: provides confirmation of receipt by endpoint. Example: [RequestBody] ��,"log":{"xhr":[{"xhrReqStart":111,"serialNumber":1}]},"messageVersion":"11.0.0.0"}

				queues: [
					{
						qid: "DEFAULT",
						endpoint: "https://lib-us-2.brilliantcollector.com/collector/collectorPost",
						maxEvents: 15, // 15 events in queue triggers post
						timerInterval: 30000, // 60 seconds of user inactivity triggers post
						maxSize: 300000, // 300KB uncompressed queue size triggers post
						checkEndpoint: true,
						endpointCheckTimeout: 3000, // new with 5.6.0: If the endpoint check fails, UIC now switches to an asynchronous request on page unload.
						encoder: "gzip"
					}
				]
			},
            message: {
                privacy: [{
//					exclude: true,  // switch to whitelist instead of default blacklist
					targets: [  // blacklist if exclude:false
						"input[type=password]", //---------------------------------------- Mask all password fields
						"input[name=password]", //---------------------------------------- Mask all fields named password
						".tlPrivate", //-------------------------------------------------- Mask input by CLASS=tlPrivate
						"form[id^=campusCardNonEpaySection] input", //-------------------- Mask all inputs in a form
						"input[name=samplename]", //-------------------------------------- Mask input by name
						"input[name^=account_]", //--------------------------------------- Mask input by name beginning with account_
						{ id : "sampleid", idType : -1 }, //------------------------------ Mask input by ID
						{ id : { regex: "security[0-9]|answer[0-9]" }, idType : -1 }, //-- Mask input by ID using RegEx
						{ id : { regex: "account_.*" }, idType : -1 }, //----------------- Mask input by ID beginning with account_ using RegEx
						{ id : "[\"dwfrm_singleshipping_shippingAddress\"]", "idType": -2 }, // Mask by Xpath, get Xpath from replay raw data view
						{ id: "privacy=yes", idType: -3 } //------------------------------ Mask elements by a specified custom attribute
					],
						"maskType": 3  // mask with matching data type & case (a4ghRW = x9xxXX)
					}
				],
				privacyPatterns: [
					/**
					 * Use privacy patterns to match and replace specific patterns in the HTML.
					 *
					 * WARNING: Applying regular expressions to the HTML DOM can have a
					 * performance impact on the application. Adequate testing must be performed
					 * to ensure that pattern matching is not only working as expected but also
					 * not causing performance impact.
					 *
					 * Example illustrating blocking of SSN
					{
						pattern: { regex: "\\d{3}-\\d{2}-\\d{4}", flags: "g" },
						replacement: "XXX-XX-XXXX"
					}
					 */
				]
			},
			encoder: {
				gzip: {
					encode: "window.pako.gzip",
					defaultEncoding: "gzip"
				}
			},
            domCapture: {
                diffEnabled: true,
                // DOM Capture options
                options: {
                    maxMutations: 300,   // If this threshold is met or exceeded, a full DOM is captured instead of a diff.
                    maxLength: 5000000, // If this threshold is exceeded, the snapshot will not be sent
					captureFrames: false,    // Should child frames/iframes be captured (ONLY IF NECESSARY)
					removeScripts: true,     // Should script tags be removed from the captured snapshot (YES!)
					removeComments: true,     // Should comments be removed from the captured snapshot (YES!)
					captureShadowDOM: false	// new for 5.7.0: adds support for capturing Shadow DOM content. 
				}
            },
			browser: {
				useCapture: true,
				// When a click occurs on a descendant of a link element the UIC will retarget the click to the parent link element. 
				// To preserve the original target set the normalizeTargetToParentLink property to false in the Browser service configuration.
				normalizeTargetToParentLink: true,
				sizzleObject: "window.Sizzle",
				jQueryObject: "window.jQuery",
				customid: ["name"]           // Optional fall back to name when ID is missing
			}
		},
		modules: {
            performance: {
                calculateRenderTime: true,
                renderTimeThreshold: 600000,
				performanceAlert: {  // new with 5.7.0: https://developer.ibm.com/customer-engagement/docs/25642-2/
					/* required
					 * boolean
					 */
					enabled: true,
					/* required
					 * measured in ms
					 * capture the data if resources loading time exceeds threshold
					 */
					threshold: 3000,
					/* optional
					 * array of strings
					 * specify the resource type to monitor, monitor all resources by default
					 * possible values are "script", "link", "img", "xmlhttprequest", "iframe", etc
					 */
					resourceTypes: ["script", "img", "css", "xmlhttprequest"],  // 
					/* optional
					 * array of a string or regex object
					 * used to blacklist certain resources by matching the resource name (url)
					 */
					blacklist: ["twitter.com", "sample1", "sample2"]
				},
                filter: {
                    navigationStart: false,
                    unloadEventStart: false,
                    unloadEventEnd: false,
                    redirectStart: false,
                    redirectEnd: false,
                    fetchStart: false,
                    domainLookupStart: false,
                    domainLookupEnd: false,
                    connectStart: false,
                    connectEnd: false,
                    secureConnectionStart: false,
                    responseStart: false,
                    domLoading: false,
                    domInteractive: false,
                    domContentLoadedEventStart: false,
                    domContentLoadedEventEnd: false,
                    domComplete: false,
                    loadEventEnd: false
                }
            },
			replay: {
				// Geolocation configuration for use with optional tealeaf.gestures.js (not included in this template)
				geolocation: {
					enabled: false,
					triggers: [{
							event: "load"
					}]
				},
				// DOM Capture configuration
				domCapture: {
					enabled: true,
 					screenviewBlacklist: [  // new with 5.6.0. Blocks domCapture only (will not appear in Replay view, but events will appear in other views)
					// support for blacklisting DOM Capture based on screenview name. 
					// Use the screenviewBlacklist property in the DOM Capture configuration to prevent the UIC from taking DOM snapshots for the specified screenviews.
						{regex: "#Screen[A,C]"}
					],
					triggers: [
						{
							event: "click",
							targets: [
								"input[id^=purchase-option-]"
							],
							fullDOMCapture: true,
							delay: 200 // ms
						},
						{event: "click"},
						{event: "change"},
						{event: "visibilitychange"},
						{event: "ngOnInit"},
						{event: "event-view-start",	fullDOMCapture: true, delay: 1000},
						{event: "load", 
							fullDOMCapture: true, 
							delay: 100    // overrides delayUntil, if both set on same page. Also see screenviewLoadEvent configuration above.
// new with 5.7.0: https://developer.goacoustic.com/acoustic-exp-analytics/docs/configuring-uic-for-lazy-load
// delayUntil notes:  
// 1) cannot be used in combination with delay on same page; 
// 2) will prevent default load event on pages where #selector doesn't exist.
//							delayUntil: {  
//								selector: "#testspinner",  // HTML example: <img src="loading.png" id="testspinner"/>
//								exists: false,
//								timeout: 6000  // new for v6.0: capture snapshot after X ms in case selector does not exist
//							}
						}
					],
				},
                mousemove: {  // new with 5.6.0: only included with unload event. Not available for onprem 9.0.2 (targeting v10.2).
					enabled: true,
					sampleRate: 200,
					ignoreRadius: 3
				}
			},
			overstat: {
                hoverThreshold: 2000
            },
// Disable ajaxListener module EF-14415 line 83				
/*			ajaxListener: {
				// readme: https://github.com/ibm-watson-cxa/UICaptureSDK-Modules/tree/master/AjaxListener
				// The same filtering configuration is applicable to both XHR and Fetch data capture.
				filters: [
					{  // suggested base standard: only log 4xx and 5xx messages (Headers and Data)
//						url: { regex: "^((?!(ibmcloud\\.com|TealeafTarget\\.jsp)).)*$", flags: "i" }, // exclude tealeaf requests
						url: { regex: "^((?!(brilliantcollector\\.com)).)*$", flags: "i" }, // exclude tealeaf requests
//						status: { regex: "4\\d\\d|5\\d\\d", flags: "" }, // log 4xx and 5xx status messages
						log: {requestHeaders: false,
							requestData: false,
							responseHeaders: false,
							responseData: false
						}
					}
//					{  // example of URL filter
//						url: { regex: "somedocument\.jsp", flags: "i" } // for this URL, log existence but no Headers or Data
//					}
				]
			},*/
            gestures: {
                options: {
                    doubleTapInterval: 300
                }
            },
			TLCookie: {
                appCookieWhitelist: [{ regex: ".*" }],
                enabled: "true",
//				sessionIDUsesStorage: true, // Use local storage for TLTSID
//				sessionIDUsesCookie: true, // Fall back to cookie if local storage fails
//				secureTLTSID: true,  // new with 5.6.0. For use only in web sites that are 100% https.
                sessionizationCookieName: "TLTSID"
			}
		}
	}

    //----------------------------------------------------------------------------------------------------------
    //-------------------------------------------------------------------- Automatic tlAppKey using document.URL
    //----------------------------------------------------------------------------------------------------------
    if (typeof window.location.hostname !== "undefined" && window.location.hostname !== "") {
        var getHostname = window.location.hostname;
    } else {
        var getLocation = function(href) {
            var getURL = document.createElement("a");
            getURL.href = href;
            return getURL;
        }
        getHostname = getLocation();
    }
    if (getHostname === "content.bkstr.com" ||
        getHostname === "www.bkstr.com" ||
        getHostname === "svc.bkstr.com" ||
        getHostname === "wc-ts.bkstr.com") {
        config.modules.TLCookie.tlAppKey = "7d868a34ce244d95b1f13cf42e805aff"; // Production 
    } else if (getHostname === "content.ecpr.bkstr.com" ||
        getHostname === "ecpr.bkstr.com" ||
        getHostname === "svc.ecpr.bkstr.com" ||
        getHostname === "wc-ts.ecpr.bkstr.com") {
        config.modules.TLCookie.tlAppKey = "7f3138da81314275a4fb4d59ba5006a8"; // pre-golive Production 
    } else {
        config.modules.TLCookie.tlAppKey = "82dd2916e00642339f7593b55d15c8f5"; // Test/QA1
    }

	//----------------------------------------------------------------------------------------------------------
	//------------------------------------------------- Disable Beacon & tune Queue settings for Apple iOS <12.2
	//----------------------------------------------------------------------------------------------------------
    if (TLT.utils.isiOS) {
        var iOSVer =+(navigator.userAgent).match(/OS (\d)?\d_\d(_\d)?/i)[0].replace("_",".").replace("_","").replace("OS ","");
        if (iOSVer && iOSVer < 12.2){
            config.services.queue.asyncReqOnUnload = true,
            config.services.queue.useBeacon = false,
            config.services.queue.useFetch = true,
            config.services.queue.queues = [{
                qid: "DEFAULT",
                endpoint: "https://lib-us-2.brilliantcollector.com/collector/collectorPost",
                maxEvents: 10,
                maxSize: 10000,
                timerinterval: 10000,
                checkEndpoint: true,
                endPointCheckTimeout: 10000,
                encoder: "gzip"
            }],
            //list places clients commonly transition from one page to another with clicks
            config.core.modules.digitalData.events = [
				{ name: "load",	target: window },
				{ name: "click", target: "[type=button]", recurseFrames: true }, // flushAll on a button click
				{ name: "click", target: "[type=submit]", recurseFrames: true }, // flushAll on a submit click
				{ name: "click", target: "[href*='\/']", recurseFrames: true }, // flushAll on any link containing a slash
				{ name: "click", target: "#someid", recurseFrames: true }, // flushAll on specific Element ID
				{ name: "click", target: ".someclass", recurseFrames: true },
				{ name: "visibilitychange" },
				{ name: "click", targets: [{"id": "[[\"dwfrm_singleshipping_shippingAddress\"],[\"a\",0]]", "idType": -2}]} // if all else fails, xpath...look in raw data and copy from there
			]        
        }
    };

	//----------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------- Disable Fetch for FireFox
	//----------------------------------------------------------------------------------------------------------
	if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
		config.services.queue.useBeacon = true,
		config.services.queue.useFetch = false
	}
	//----------------------------------------------------------------------------------------------------------
	//---------------------------------------------------------------------- Alternate DOM Capture Config by URL
	//----------------------------------------------------------------------------------------------------------
//	var captureURL = window.location.pathname;
//	if (captureURL === "/sample-confirmation-page1" ||
//		captureURL === "/sample-confirmation-page2") {
//		config.modules.replay.domCapture.triggers = [
//			{ event: "click" },
//			{ event: "change" },
//			{ event: "lazyload", delay: 200 },
//			{ event: "load", delay: 100, fullDOMCapture: true },
//			{ event: "unload" } // Add DOM trigger to UNLOAD event on confirmation pages
//		];
//	}
// new with 5.7.0: https://developer.goacoustic.com/acoustic-exp-analytics/docs/configuring-uic-for-lazy-load
//	if (captureURL === "/page-with-ajax-loaded-content-1" ||
//		captureURL === "/page-with-ajax-loaded-content-2") {
//	    config.modules.replay.domCapture.triggers = [
//			{ event: "load", fullDOMCapture: true, delayUntil: {selector: "#testspinner", exists: false }
//		];
//	}
	//----------------------------------------------------------------------------------------------------------
	//------------------------------------------------------------------ Enable Synchronous XHR on Unload by URL
	//----------------------------------------------------------------------------------------------------------
//	var captureURL = window.location.pathname;
//	if (captureURL.indexOf("/sampleURL1") > -1 || // Insert list of confirmation and other important pages
//		captureURL.indexOf("/sampleURL2") > -1 ||
//		captureURL === "/sampleURL3" ||
//		captureURL === "/sampleURL4") {
//		config.services.queue.asyncReqOnUnload = false,
//		config.services.queue.useBeacon = false,
//		config.services.queue.useFetch = false
//	}
    //------------------------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------- Alternate IE Configs
    //------------------------------------------------------------------------------------------------------
    if (document.documentMode === 9) { //-- Disable DOM for IE9 (IE8 not supported by 5.6.0)
        config.modules.replay.domCapture.enabled = false;
        config.services.domCapture.diffEnabled = false;
    }
    if (document.documentMode === 10) { //-------------------------------- Alternate config for IE10 (possible with IE9 if needed)
        config.modules.replay.domCapture.enabled = true;
        config.services.domCapture.diffEnabled = false;
        config.modules.replay.domCapture.triggers = [
            { event: "click", targets: ["a", "a *", "button", "button *"] },
            { event: "change" },
            { event: "load", delay: 200 }
        ];
    }
	// ---------------------------------------------------------------------------------------------------------
	// -------------------------------------------------------------------------------- Alternate Chrome Configs
	// ---------------------------------------------------------------------------------------------------------
	if (uicUserAgent.indexOf('chrome') !== -1) {
		config.services.queue.asyncReqOnUnload = true; // this disables sync posting as chrome blocks it now
	}
	//----------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------- Disable SDK by User Agent
	//----------------------------------------------------------------------------------------------------------

	/*var userAgent = navigator.userAgent.toLowerCase();
	if (userAgent.indexOf("google web preview") > -1 ||
		userAgent.indexOf("bing") > -1 ||
		userAgent.indexOf("phantomjs") > -1) {
		disableSDK = true;
	}*/

    if (typeof window.TLT !== "undefined" && typeof window.TLT.isInitialized === "function" && !(TLT.isInitialized()) && typeof config === "object" && disableSDK === false) {
        window.TLT.init(config);
    }

}());

/* Custom message redirect callback configuration(s) */
//------------------------------------------------------------------------------------------
// Third Party Data Logging - Logs whitelist data into LOAD event on each screen view change
//------------------------------------------------------------------------------------------
var whitelist = [
	"product_name",
	"channel",
	"confirmation",
	"dom.pathname",
	"dom.referrer",
	"dom.title",
	"error_id",
	"event_name",
	"login_method",
	"page_name",
	"server",
	"site_country",
	"site_currency",
	"site_indicator",
	"site_language",
	"tealium_environment",
	"tealium_profile"
];
TLT.registerBridgeCallbacks([{
	enabled: false,
	cbType: "messageRedirect",
	cbFunction: function (msg, msgObj) {
		if (msgObj && msgObj.type === 2 && msgObj.screenview.type === "LOAD") {
			if (typeof utag_data !== "undefined" && !msgObj.hasOwnProperty("UTAG Data")) {
				try {
					msgObj["UTAG Data"] = JSON.parse(JSON.stringify(utag_data, whitelist));
				} catch (e) {}
			}
		}
		return msgObj;
	}
}]);

// REPLACED BY 5.7.0: adds support for detecting multiple browser tabs/windows within the context of a session. 
// A new property called tabId which contains a numeric identifier is added to the JSON.  (set in localStorage if available)
// Hits containing the same tabId originate from pages that were opened in the same browser window/tab. 
// Hits containing different tabId values originated from a different browser window/tab.
//-------------------------------------------------------------------------------------
// Tab Monitoring v1.3 - Inject tabIndex into all events & tabReferrer into LOAD events
//-------------------------------------------------------------------------------------
TLT.registerBridgeCallbacks([{
	enabled: true,
	cbType: "messageRedirect",
	cbFunction: function (msg, msgObj) {
		if (typeof window.sessionStorage !== "undefined" && typeof window.localStorage !== "undefined" &&
			window.sessionStorage && window.localStorage) { // Sanity Check
			if (msg && msgObj.type) {
				var tabIndex = window.sessionStorage.tlTabCurrent,
				tlReferrer = window.sessionStorage.tlReferrer
				if (tabIndex) {
					if (msgObj.type === 2) {
						msgObj["tabIndex"] = parseInt(tabIndex);
						msgObj["tabReferrer"] = tlReferrer;
					} else {
						msgObj["tabIndex"] = parseInt(tabIndex);
					}
					if (msgObj.type === 4){
						if (msgObj.event.type.indexOf("tabswitch") >-1) {
							var e = { event: "tabswitch"};
							msgObj["clientState"] = e;
							msgObj.target.id = "Tab Number:"+parseInt(tabIndex);
						}
					}
				}
			}
		} else {
			if (msg && msgObj.type) {
				msgObj["tabDetect"] = "FAILED";
			}
		}
		return msgObj;
	}
}]);