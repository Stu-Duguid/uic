/*
	====================================================================
	THIS TEALEAF 5.6.0 UI CAPTURE CUSTOM TEMPLATE INCLUDES THE FOLLOWING
	====================================================================

	Core Changes:
		none

	Custom and Standard Modules:
		Standard Ajax Listener module v1.1.3 (https://github.com/ibm-watson-cxa/UICaptureSDK-Modules/)
		Standard Mouse Movement
		Custom Mutation DOM capture (10/3/2019)
		Custom DigitalData Logging (visDetect, iOS<12.2 TLT.flushAll();)
		Custom Tab monitoring v1.3 (8/19/2019)
		Custom Client Side performance monitor V5 (8/19/2019)
        Custom SSL Protocol Violation Module (6/20/2019)

	Custom Queue Manipulators:
		Custom Tab monitoring data insertion (index & referrer)
		Custom Third Party Data Logging (6/20/2019)

	Custom Configuration Manipulators:
		Synchronous on UNLOAD by URL
		Alternate DOM triggers by URL
		Configure tlAppKey by Domain
		Alternate IE Configurations
		Disable SDK by User Agent
		Disable Beacon & tune Queue settings for Apple iOS<12.2

	====================================================================
	Build Date: October 3, 2019
	====================================================================
*/
/*!
	pako 1.0.4 nodeca/pako with Dojo/AMD/RequireJS fix

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
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.pako=t()}}(function(){return function t(e,a,n){function r(s,h){if(!a[s]){if(!e[s]){var l="function"==typeof require&&require;if(!h&&l)return l(s,!0);if(i)return i(s,!0);var o=new Error("Cannot find module '"+s+"'");throw o.code="MODULE_NOT_FOUND",o}var _=a[s]={exports:{}};e[s][0].call(_.exports,function(t){var a=e[s][1][t];return r(a?a:t)},_,_.exports,t,e,a,n)}return a[s].exports}for(var i="function"==typeof require&&require,s=0;s<n.length;s++)r(n[s]);return r}({1:[function(t,e,a){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;a.assign=function(t){for(var e=Array.prototype.slice.call(arguments,1);e.length;){var a=e.shift();if(a){if("object"!=typeof a)throw new TypeError(a+"must be non-object");for(var n in a)a.hasOwnProperty(n)&&(t[n]=a[n])}}return t},a.shrinkBuf=function(t,e){return t.length===e?t:t.subarray?t.subarray(0,e):(t.length=e,t)};var r={arraySet:function(t,e,a,n,r){if(e.subarray&&t.subarray)return void t.set(e.subarray(a,a+n),r);for(var i=0;i<n;i++)t[r+i]=e[a+i]},flattenChunks:function(t){var e,a,n,r,i,s;for(n=0,e=0,a=t.length;e<a;e++)n+=t[e].length;for(s=new Uint8Array(n),r=0,e=0,a=t.length;e<a;e++)i=t[e],s.set(i,r),r+=i.length;return s}},i={arraySet:function(t,e,a,n,r){for(var i=0;i<n;i++)t[r+i]=e[a+i]},flattenChunks:function(t){return[].concat.apply([],t)}};a.setTyped=function(t){t?(a.Buf8=Uint8Array,a.Buf16=Uint16Array,a.Buf32=Int32Array,a.assign(a,r)):(a.Buf8=Array,a.Buf16=Array,a.Buf32=Array,a.assign(a,i))},a.setTyped(n)},{}],2:[function(t,e,a){"use strict";function n(t,e){if(e<65537&&(t.subarray&&s||!t.subarray&&i))return String.fromCharCode.apply(null,r.shrinkBuf(t,e));for(var a="",n=0;n<e;n++)a+=String.fromCharCode(t[n]);return a}var r=t("./common"),i=!0,s=!0;try{String.fromCharCode.apply(null,[0])}catch(t){i=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(t){s=!1}for(var h=new r.Buf8(256),l=0;l<256;l++)h[l]=l>=252?6:l>=248?5:l>=240?4:l>=224?3:l>=192?2:1;h[254]=h[254]=1,a.string2buf=function(t){var e,a,n,i,s,h=t.length,l=0;for(i=0;i<h;i++)a=t.charCodeAt(i),55296===(64512&a)&&i+1<h&&(n=t.charCodeAt(i+1),56320===(64512&n)&&(a=65536+(a-55296<<10)+(n-56320),i++)),l+=a<128?1:a<2048?2:a<65536?3:4;for(e=new r.Buf8(l),s=0,i=0;s<l;i++)a=t.charCodeAt(i),55296===(64512&a)&&i+1<h&&(n=t.charCodeAt(i+1),56320===(64512&n)&&(a=65536+(a-55296<<10)+(n-56320),i++)),a<128?e[s++]=a:a<2048?(e[s++]=192|a>>>6,e[s++]=128|63&a):a<65536?(e[s++]=224|a>>>12,e[s++]=128|a>>>6&63,e[s++]=128|63&a):(e[s++]=240|a>>>18,e[s++]=128|a>>>12&63,e[s++]=128|a>>>6&63,e[s++]=128|63&a);return e},a.buf2binstring=function(t){return n(t,t.length)},a.binstring2buf=function(t){for(var e=new r.Buf8(t.length),a=0,n=e.length;a<n;a++)e[a]=t.charCodeAt(a);return e},a.buf2string=function(t,e){var a,r,i,s,l=e||t.length,o=new Array(2*l);for(r=0,a=0;a<l;)if(i=t[a++],i<128)o[r++]=i;else if(s=h[i],s>4)o[r++]=65533,a+=s-1;else{for(i&=2===s?31:3===s?15:7;s>1&&a<l;)i=i<<6|63&t[a++],s--;s>1?o[r++]=65533:i<65536?o[r++]=i:(i-=65536,o[r++]=55296|i>>10&1023,o[r++]=56320|1023&i)}return n(o,r)},a.utf8border=function(t,e){var a;for(e=e||t.length,e>t.length&&(e=t.length),a=e-1;a>=0&&128===(192&t[a]);)a--;return a<0?e:0===a?e:a+h[t[a]]>e?a:e}},{"./common":1}],3:[function(t,e,a){"use strict";function n(t,e,a,n){for(var r=65535&t|0,i=t>>>16&65535|0,s=0;0!==a;){s=a>2e3?2e3:a,a-=s;do r=r+e[n++]|0,i=i+r|0;while(--s);r%=65521,i%=65521}return r|i<<16|0}e.exports=n},{}],4:[function(t,e,a){"use strict";function n(){for(var t,e=[],a=0;a<256;a++){t=a;for(var n=0;n<8;n++)t=1&t?3988292384^t>>>1:t>>>1;e[a]=t}return e}function r(t,e,a,n){var r=i,s=n+a;t^=-1;for(var h=n;h<s;h++)t=t>>>8^r[255&(t^e[h])];return t^-1}var i=n();e.exports=r},{}],5:[function(t,e,a){"use strict";function n(t,e){return t.msg=O[e],e}function r(t){return(t<<1)-(t>4?9:0)}function i(t){for(var e=t.length;--e>=0;)t[e]=0}function s(t){var e=t.state,a=e.pending;a>t.avail_out&&(a=t.avail_out),0!==a&&(j.arraySet(t.output,e.pending_buf,e.pending_out,a,t.next_out),t.next_out+=a,e.pending_out+=a,t.total_out+=a,t.avail_out-=a,e.pending-=a,0===e.pending&&(e.pending_out=0))}function h(t,e){U._tr_flush_block(t,t.block_start>=0?t.block_start:-1,t.strstart-t.block_start,e),t.block_start=t.strstart,s(t.strm)}function l(t,e){t.pending_buf[t.pending++]=e}function o(t,e){t.pending_buf[t.pending++]=e>>>8&255,t.pending_buf[t.pending++]=255&e}function _(t,e,a,n){var r=t.avail_in;return r>n&&(r=n),0===r?0:(t.avail_in-=r,j.arraySet(e,t.input,t.next_in,r,a),1===t.state.wrap?t.adler=D(t.adler,e,r,a):2===t.state.wrap&&(t.adler=I(t.adler,e,r,a)),t.next_in+=r,t.total_in+=r,r)}function d(t,e){var a,n,r=t.max_chain_length,i=t.strstart,s=t.prev_length,h=t.nice_match,l=t.strstart>t.w_size-dt?t.strstart-(t.w_size-dt):0,o=t.window,_=t.w_mask,d=t.prev,u=t.strstart+_t,f=o[i+s-1],c=o[i+s];t.prev_length>=t.good_match&&(r>>=2),h>t.lookahead&&(h=t.lookahead);do if(a=e,o[a+s]===c&&o[a+s-1]===f&&o[a]===o[i]&&o[++a]===o[i+1]){i+=2,a++;do;while(o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&i<u);if(n=_t-(u-i),i=u-_t,n>s){if(t.match_start=e,s=n,n>=h)break;f=o[i+s-1],c=o[i+s]}}while((e=d[e&_])>l&&0!==--r);return s<=t.lookahead?s:t.lookahead}function u(t){var e,a,n,r,i,s=t.w_size;do{if(r=t.window_size-t.lookahead-t.strstart,t.strstart>=s+(s-dt)){j.arraySet(t.window,t.window,s,s,0),t.match_start-=s,t.strstart-=s,t.block_start-=s,a=t.hash_size,e=a;do n=t.head[--e],t.head[e]=n>=s?n-s:0;while(--a);a=s,e=a;do n=t.prev[--e],t.prev[e]=n>=s?n-s:0;while(--a);r+=s}if(0===t.strm.avail_in)break;if(a=_(t.strm,t.window,t.strstart+t.lookahead,r),t.lookahead+=a,t.lookahead+t.insert>=ot)for(i=t.strstart-t.insert,t.ins_h=t.window[i],t.ins_h=(t.ins_h<<t.hash_shift^t.window[i+1])&t.hash_mask;t.insert&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[i+ot-1])&t.hash_mask,t.prev[i&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=i,i++,t.insert--,!(t.lookahead+t.insert<ot)););}while(t.lookahead<dt&&0!==t.strm.avail_in)}function f(t,e){var a=65535;for(a>t.pending_buf_size-5&&(a=t.pending_buf_size-5);;){if(t.lookahead<=1){if(u(t),0===t.lookahead&&e===q)return vt;if(0===t.lookahead)break}t.strstart+=t.lookahead,t.lookahead=0;var n=t.block_start+a;if((0===t.strstart||t.strstart>=n)&&(t.lookahead=t.strstart-n,t.strstart=n,h(t,!1),0===t.strm.avail_out))return vt;if(t.strstart-t.block_start>=t.w_size-dt&&(h(t,!1),0===t.strm.avail_out))return vt}return t.insert=0,e===N?(h(t,!0),0===t.strm.avail_out?kt:zt):t.strstart>t.block_start&&(h(t,!1),0===t.strm.avail_out)?vt:vt}function c(t,e){for(var a,n;;){if(t.lookahead<dt){if(u(t),t.lookahead<dt&&e===q)return vt;if(0===t.lookahead)break}if(a=0,t.lookahead>=ot&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+ot-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!==a&&t.strstart-a<=t.w_size-dt&&(t.match_length=d(t,a)),t.match_length>=ot)if(n=U._tr_tally(t,t.strstart-t.match_start,t.match_length-ot),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=ot){t.match_length--;do t.strstart++,t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+ot-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart;while(0!==--t.match_length);t.strstart++}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+1])&t.hash_mask;else n=U._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(n&&(h(t,!1),0===t.strm.avail_out))return vt}return t.insert=t.strstart<ot-1?t.strstart:ot-1,e===N?(h(t,!0),0===t.strm.avail_out?kt:zt):t.last_lit&&(h(t,!1),0===t.strm.avail_out)?vt:yt}function p(t,e){for(var a,n,r;;){if(t.lookahead<dt){if(u(t),t.lookahead<dt&&e===q)return vt;if(0===t.lookahead)break}if(a=0,t.lookahead>=ot&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+ot-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=ot-1,0!==a&&t.prev_length<t.max_lazy_match&&t.strstart-a<=t.w_size-dt&&(t.match_length=d(t,a),t.match_length<=5&&(t.strategy===J||t.match_length===ot&&t.strstart-t.match_start>4096)&&(t.match_length=ot-1)),t.prev_length>=ot&&t.match_length<=t.prev_length){r=t.strstart+t.lookahead-ot,n=U._tr_tally(t,t.strstart-1-t.prev_match,t.prev_length-ot),t.lookahead-=t.prev_length-1,t.prev_length-=2;do++t.strstart<=r&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+ot-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart);while(0!==--t.prev_length);if(t.match_available=0,t.match_length=ot-1,t.strstart++,n&&(h(t,!1),0===t.strm.avail_out))return vt}else if(t.match_available){if(n=U._tr_tally(t,0,t.window[t.strstart-1]),n&&h(t,!1),t.strstart++,t.lookahead--,0===t.strm.avail_out)return vt}else t.match_available=1,t.strstart++,t.lookahead--}return t.match_available&&(n=U._tr_tally(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<ot-1?t.strstart:ot-1,e===N?(h(t,!0),0===t.strm.avail_out?kt:zt):t.last_lit&&(h(t,!1),0===t.strm.avail_out)?vt:yt}function g(t,e){for(var a,n,r,i,s=t.window;;){if(t.lookahead<=_t){if(u(t),t.lookahead<=_t&&e===q)return vt;if(0===t.lookahead)break}if(t.match_length=0,t.lookahead>=ot&&t.strstart>0&&(r=t.strstart-1,n=s[r],n===s[++r]&&n===s[++r]&&n===s[++r])){i=t.strstart+_t;do;while(n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&r<i);t.match_length=_t-(i-r),t.match_length>t.lookahead&&(t.match_length=t.lookahead)}if(t.match_length>=ot?(a=U._tr_tally(t,1,t.match_length-ot),t.lookahead-=t.match_length,t.strstart+=t.match_length,t.match_length=0):(a=U._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++),a&&(h(t,!1),0===t.strm.avail_out))return vt}return t.insert=0,e===N?(h(t,!0),0===t.strm.avail_out?kt:zt):t.last_lit&&(h(t,!1),0===t.strm.avail_out)?vt:yt}function m(t,e){for(var a;;){if(0===t.lookahead&&(u(t),0===t.lookahead)){if(e===q)return vt;break}if(t.match_length=0,a=U._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++,a&&(h(t,!1),0===t.strm.avail_out))return vt}return t.insert=0,e===N?(h(t,!0),0===t.strm.avail_out?kt:zt):t.last_lit&&(h(t,!1),0===t.strm.avail_out)?vt:yt}function b(t,e,a,n,r){this.good_length=t,this.max_lazy=e,this.nice_length=a,this.max_chain=n,this.func=r}function w(t){t.window_size=2*t.w_size,i(t.head),t.max_lazy_match=E[t.level].max_lazy,t.good_match=E[t.level].good_length,t.nice_match=E[t.level].nice_length,t.max_chain_length=E[t.level].max_chain,t.strstart=0,t.block_start=0,t.lookahead=0,t.insert=0,t.match_length=t.prev_length=ot-1,t.match_available=0,t.ins_h=0}function v(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=Z,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new j.Buf16(2*ht),this.dyn_dtree=new j.Buf16(2*(2*it+1)),this.bl_tree=new j.Buf16(2*(2*st+1)),i(this.dyn_ltree),i(this.dyn_dtree),i(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new j.Buf16(lt+1),this.heap=new j.Buf16(2*rt+1),i(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new j.Buf16(2*rt+1),i(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function y(t){var e;return t&&t.state?(t.total_in=t.total_out=0,t.data_type=Y,e=t.state,e.pending=0,e.pending_out=0,e.wrap<0&&(e.wrap=-e.wrap),e.status=e.wrap?ft:bt,t.adler=2===e.wrap?0:1,e.last_flush=q,U._tr_init(e),H):n(t,K)}function k(t){var e=y(t);return e===H&&w(t.state),e}function z(t,e){return t&&t.state?2!==t.state.wrap?K:(t.state.gzhead=e,H):K}function x(t,e,a,r,i,s){if(!t)return K;var h=1;if(e===G&&(e=6),r<0?(h=0,r=-r):r>15&&(h=2,r-=16),i<1||i>$||a!==Z||r<8||r>15||e<0||e>9||s<0||s>W)return n(t,K);8===r&&(r=9);var l=new v;return t.state=l,l.strm=t,l.wrap=h,l.gzhead=null,l.w_bits=r,l.w_size=1<<l.w_bits,l.w_mask=l.w_size-1,l.hash_bits=i+7,l.hash_size=1<<l.hash_bits,l.hash_mask=l.hash_size-1,l.hash_shift=~~((l.hash_bits+ot-1)/ot),l.window=new j.Buf8(2*l.w_size),l.head=new j.Buf16(l.hash_size),l.prev=new j.Buf16(l.w_size),l.lit_bufsize=1<<i+6,l.pending_buf_size=4*l.lit_bufsize,l.pending_buf=new j.Buf8(l.pending_buf_size),l.d_buf=1*l.lit_bufsize,l.l_buf=3*l.lit_bufsize,l.level=e,l.strategy=s,l.method=a,k(t)}function B(t,e){return x(t,e,Z,tt,et,X)}function A(t,e){var a,h,_,d;if(!t||!t.state||e>R||e<0)return t?n(t,K):K;if(h=t.state,!t.output||!t.input&&0!==t.avail_in||h.status===wt&&e!==N)return n(t,0===t.avail_out?P:K);if(h.strm=t,a=h.last_flush,h.last_flush=e,h.status===ft)if(2===h.wrap)t.adler=0,l(h,31),l(h,139),l(h,8),h.gzhead?(l(h,(h.gzhead.text?1:0)+(h.gzhead.hcrc?2:0)+(h.gzhead.extra?4:0)+(h.gzhead.name?8:0)+(h.gzhead.comment?16:0)),l(h,255&h.gzhead.time),l(h,h.gzhead.time>>8&255),l(h,h.gzhead.time>>16&255),l(h,h.gzhead.time>>24&255),l(h,9===h.level?2:h.strategy>=Q||h.level<2?4:0),l(h,255&h.gzhead.os),h.gzhead.extra&&h.gzhead.extra.length&&(l(h,255&h.gzhead.extra.length),l(h,h.gzhead.extra.length>>8&255)),h.gzhead.hcrc&&(t.adler=I(t.adler,h.pending_buf,h.pending,0)),h.gzindex=0,h.status=ct):(l(h,0),l(h,0),l(h,0),l(h,0),l(h,0),l(h,9===h.level?2:h.strategy>=Q||h.level<2?4:0),l(h,xt),h.status=bt);else{var u=Z+(h.w_bits-8<<4)<<8,f=-1;f=h.strategy>=Q||h.level<2?0:h.level<6?1:6===h.level?2:3,u|=f<<6,0!==h.strstart&&(u|=ut),u+=31-u%31,h.status=bt,o(h,u),0!==h.strstart&&(o(h,t.adler>>>16),o(h,65535&t.adler)),t.adler=1}if(h.status===ct)if(h.gzhead.extra){for(_=h.pending;h.gzindex<(65535&h.gzhead.extra.length)&&(h.pending!==h.pending_buf_size||(h.gzhead.hcrc&&h.pending>_&&(t.adler=I(t.adler,h.pending_buf,h.pending-_,_)),s(t),_=h.pending,h.pending!==h.pending_buf_size));)l(h,255&h.gzhead.extra[h.gzindex]),h.gzindex++;h.gzhead.hcrc&&h.pending>_&&(t.adler=I(t.adler,h.pending_buf,h.pending-_,_)),h.gzindex===h.gzhead.extra.length&&(h.gzindex=0,h.status=pt)}else h.status=pt;if(h.status===pt)if(h.gzhead.name){_=h.pending;do{if(h.pending===h.pending_buf_size&&(h.gzhead.hcrc&&h.pending>_&&(t.adler=I(t.adler,h.pending_buf,h.pending-_,_)),s(t),_=h.pending,h.pending===h.pending_buf_size)){d=1;break}d=h.gzindex<h.gzhead.name.length?255&h.gzhead.name.charCodeAt(h.gzindex++):0,l(h,d)}while(0!==d);h.gzhead.hcrc&&h.pending>_&&(t.adler=I(t.adler,h.pending_buf,h.pending-_,_)),0===d&&(h.gzindex=0,h.status=gt)}else h.status=gt;if(h.status===gt)if(h.gzhead.comment){_=h.pending;do{if(h.pending===h.pending_buf_size&&(h.gzhead.hcrc&&h.pending>_&&(t.adler=I(t.adler,h.pending_buf,h.pending-_,_)),s(t),_=h.pending,h.pending===h.pending_buf_size)){d=1;break}d=h.gzindex<h.gzhead.comment.length?255&h.gzhead.comment.charCodeAt(h.gzindex++):0,l(h,d)}while(0!==d);h.gzhead.hcrc&&h.pending>_&&(t.adler=I(t.adler,h.pending_buf,h.pending-_,_)),0===d&&(h.status=mt)}else h.status=mt;if(h.status===mt&&(h.gzhead.hcrc?(h.pending+2>h.pending_buf_size&&s(t),h.pending+2<=h.pending_buf_size&&(l(h,255&t.adler),l(h,t.adler>>8&255),t.adler=0,h.status=bt)):h.status=bt),0!==h.pending){if(s(t),0===t.avail_out)return h.last_flush=-1,H}else if(0===t.avail_in&&r(e)<=r(a)&&e!==N)return n(t,P);if(h.status===wt&&0!==t.avail_in)return n(t,P);if(0!==t.avail_in||0!==h.lookahead||e!==q&&h.status!==wt){var c=h.strategy===Q?m(h,e):h.strategy===V?g(h,e):E[h.level].func(h,e);if(c!==kt&&c!==zt||(h.status=wt),c===vt||c===kt)return 0===t.avail_out&&(h.last_flush=-1),H;if(c===yt&&(e===T?U._tr_align(h):e!==R&&(U._tr_stored_block(h,0,0,!1),e===L&&(i(h.head),0===h.lookahead&&(h.strstart=0,h.block_start=0,h.insert=0))),s(t),0===t.avail_out))return h.last_flush=-1,H}return e!==N?H:h.wrap<=0?F:(2===h.wrap?(l(h,255&t.adler),l(h,t.adler>>8&255),l(h,t.adler>>16&255),l(h,t.adler>>24&255),l(h,255&t.total_in),l(h,t.total_in>>8&255),l(h,t.total_in>>16&255),l(h,t.total_in>>24&255)):(o(h,t.adler>>>16),o(h,65535&t.adler)),s(t),h.wrap>0&&(h.wrap=-h.wrap),0!==h.pending?H:F)}function C(t){var e;return t&&t.state?(e=t.state.status,e!==ft&&e!==ct&&e!==pt&&e!==gt&&e!==mt&&e!==bt&&e!==wt?n(t,K):(t.state=null,e===bt?n(t,M):H)):K}function S(t,e){var a,n,r,s,h,l,o,_,d=e.length;if(!t||!t.state)return K;if(a=t.state,s=a.wrap,2===s||1===s&&a.status!==ft||a.lookahead)return K;for(1===s&&(t.adler=D(t.adler,e,d,0)),a.wrap=0,d>=a.w_size&&(0===s&&(i(a.head),a.strstart=0,a.block_start=0,a.insert=0),_=new j.Buf8(a.w_size),j.arraySet(_,e,d-a.w_size,a.w_size,0),e=_,d=a.w_size),h=t.avail_in,l=t.next_in,o=t.input,t.avail_in=d,t.next_in=0,t.input=e,u(a);a.lookahead>=ot;){n=a.strstart,r=a.lookahead-(ot-1);do a.ins_h=(a.ins_h<<a.hash_shift^a.window[n+ot-1])&a.hash_mask,a.prev[n&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=n,n++;while(--r);a.strstart=n,a.lookahead=ot-1,u(a)}return a.strstart+=a.lookahead,a.block_start=a.strstart,a.insert=a.lookahead,a.lookahead=0,a.match_length=a.prev_length=ot-1,a.match_available=0,t.next_in=l,t.input=o,t.avail_in=h,a.wrap=s,H}var E,j=t("../utils/common"),U=t("./trees"),D=t("./adler32"),I=t("./crc32"),O=t("./messages"),q=0,T=1,L=3,N=4,R=5,H=0,F=1,K=-2,M=-3,P=-5,G=-1,J=1,Q=2,V=3,W=4,X=0,Y=2,Z=8,$=9,tt=15,et=8,at=29,nt=256,rt=nt+1+at,it=30,st=19,ht=2*rt+1,lt=15,ot=3,_t=258,dt=_t+ot+1,ut=32,ft=42,ct=69,pt=73,gt=91,mt=103,bt=113,wt=666,vt=1,yt=2,kt=3,zt=4,xt=3;E=[new b(0,0,0,0,f),new b(4,4,8,4,c),new b(4,5,16,8,c),new b(4,6,32,32,c),new b(4,4,16,16,p),new b(8,16,32,32,p),new b(8,16,128,128,p),new b(8,32,128,256,p),new b(32,128,258,1024,p),new b(32,258,258,4096,p)],a.deflateInit=B,a.deflateInit2=x,a.deflateReset=k,a.deflateResetKeep=y,a.deflateSetHeader=z,a.deflate=A,a.deflateEnd=C,a.deflateSetDictionary=S,a.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":1,"./adler32":3,"./crc32":4,"./messages":6,"./trees":7}],6:[function(t,e,a){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],7:[function(t,e,a){"use strict";function n(t){for(var e=t.length;--e>=0;)t[e]=0}function r(t,e,a,n,r){this.static_tree=t,this.extra_bits=e,this.extra_base=a,this.elems=n,this.max_length=r,this.has_stree=t&&t.length}function i(t,e){this.dyn_tree=t,this.max_code=0,this.stat_desc=e}function s(t){return t<256?lt[t]:lt[256+(t>>>7)]}function h(t,e){t.pending_buf[t.pending++]=255&e,t.pending_buf[t.pending++]=e>>>8&255}function l(t,e,a){t.bi_valid>W-a?(t.bi_buf|=e<<t.bi_valid&65535,h(t,t.bi_buf),t.bi_buf=e>>W-t.bi_valid,t.bi_valid+=a-W):(t.bi_buf|=e<<t.bi_valid&65535,t.bi_valid+=a)}function o(t,e,a){l(t,a[2*e],a[2*e+1])}function _(t,e){var a=0;do a|=1&t,t>>>=1,a<<=1;while(--e>0);return a>>>1}function d(t){16===t.bi_valid?(h(t,t.bi_buf),t.bi_buf=0,t.bi_valid=0):t.bi_valid>=8&&(t.pending_buf[t.pending++]=255&t.bi_buf,t.bi_buf>>=8,t.bi_valid-=8)}function u(t,e){var a,n,r,i,s,h,l=e.dyn_tree,o=e.max_code,_=e.stat_desc.static_tree,d=e.stat_desc.has_stree,u=e.stat_desc.extra_bits,f=e.stat_desc.extra_base,c=e.stat_desc.max_length,p=0;for(i=0;i<=V;i++)t.bl_count[i]=0;for(l[2*t.heap[t.heap_max]+1]=0,a=t.heap_max+1;a<Q;a++)n=t.heap[a],i=l[2*l[2*n+1]+1]+1,i>c&&(i=c,p++),l[2*n+1]=i,n>o||(t.bl_count[i]++,s=0,n>=f&&(s=u[n-f]),h=l[2*n],t.opt_len+=h*(i+s),d&&(t.static_len+=h*(_[2*n+1]+s)));if(0!==p){do{for(i=c-1;0===t.bl_count[i];)i--;t.bl_count[i]--,t.bl_count[i+1]+=2,t.bl_count[c]--,p-=2}while(p>0);for(i=c;0!==i;i--)for(n=t.bl_count[i];0!==n;)r=t.heap[--a],r>o||(l[2*r+1]!==i&&(t.opt_len+=(i-l[2*r+1])*l[2*r],l[2*r+1]=i),n--)}}function f(t,e,a){var n,r,i=new Array(V+1),s=0;for(n=1;n<=V;n++)i[n]=s=s+a[n-1]<<1;for(r=0;r<=e;r++){var h=t[2*r+1];0!==h&&(t[2*r]=_(i[h]++,h))}}function c(){var t,e,a,n,i,s=new Array(V+1);for(a=0,n=0;n<K-1;n++)for(_t[n]=a,t=0;t<1<<et[n];t++)ot[a++]=n;for(ot[a-1]=n,i=0,n=0;n<16;n++)for(dt[n]=i,t=0;t<1<<at[n];t++)lt[i++]=n;for(i>>=7;n<G;n++)for(dt[n]=i<<7,t=0;t<1<<at[n]-7;t++)lt[256+i++]=n;for(e=0;e<=V;e++)s[e]=0;for(t=0;t<=143;)st[2*t+1]=8,t++,s[8]++;for(;t<=255;)st[2*t+1]=9,t++,s[9]++;for(;t<=279;)st[2*t+1]=7,t++,s[7]++;for(;t<=287;)st[2*t+1]=8,t++,s[8]++;for(f(st,P+1,s),t=0;t<G;t++)ht[2*t+1]=5,ht[2*t]=_(t,5);ut=new r(st,et,M+1,P,V),ft=new r(ht,at,0,G,V),ct=new r(new Array(0),nt,0,J,X)}function p(t){var e;for(e=0;e<P;e++)t.dyn_ltree[2*e]=0;for(e=0;e<G;e++)t.dyn_dtree[2*e]=0;for(e=0;e<J;e++)t.bl_tree[2*e]=0;t.dyn_ltree[2*Y]=1,t.opt_len=t.static_len=0,t.last_lit=t.matches=0}function g(t){t.bi_valid>8?h(t,t.bi_buf):t.bi_valid>0&&(t.pending_buf[t.pending++]=t.bi_buf),t.bi_buf=0,t.bi_valid=0}function m(t,e,a,n){g(t),n&&(h(t,a),h(t,~a)),D.arraySet(t.pending_buf,t.window,e,a,t.pending),t.pending+=a}function b(t,e,a,n){var r=2*e,i=2*a;return t[r]<t[i]||t[r]===t[i]&&n[e]<=n[a]}function w(t,e,a){for(var n=t.heap[a],r=a<<1;r<=t.heap_len&&(r<t.heap_len&&b(e,t.heap[r+1],t.heap[r],t.depth)&&r++,!b(e,n,t.heap[r],t.depth));)t.heap[a]=t.heap[r],a=r,r<<=1;t.heap[a]=n}function v(t,e,a){var n,r,i,h,_=0;if(0!==t.last_lit)do n=t.pending_buf[t.d_buf+2*_]<<8|t.pending_buf[t.d_buf+2*_+1],r=t.pending_buf[t.l_buf+_],_++,0===n?o(t,r,e):(i=ot[r],o(t,i+M+1,e),h=et[i],0!==h&&(r-=_t[i],l(t,r,h)),n--,i=s(n),o(t,i,a),h=at[i],0!==h&&(n-=dt[i],l(t,n,h)));while(_<t.last_lit);o(t,Y,e)}function y(t,e){var a,n,r,i=e.dyn_tree,s=e.stat_desc.static_tree,h=e.stat_desc.has_stree,l=e.stat_desc.elems,o=-1;for(t.heap_len=0,t.heap_max=Q,a=0;a<l;a++)0!==i[2*a]?(t.heap[++t.heap_len]=o=a,t.depth[a]=0):i[2*a+1]=0;for(;t.heap_len<2;)r=t.heap[++t.heap_len]=o<2?++o:0,i[2*r]=1,t.depth[r]=0,t.opt_len--,h&&(t.static_len-=s[2*r+1]);for(e.max_code=o,a=t.heap_len>>1;a>=1;a--)w(t,i,a);r=l;do a=t.heap[1],t.heap[1]=t.heap[t.heap_len--],w(t,i,1),n=t.heap[1],t.heap[--t.heap_max]=a,t.heap[--t.heap_max]=n,i[2*r]=i[2*a]+i[2*n],t.depth[r]=(t.depth[a]>=t.depth[n]?t.depth[a]:t.depth[n])+1,i[2*a+1]=i[2*n+1]=r,t.heap[1]=r++,w(t,i,1);while(t.heap_len>=2);t.heap[--t.heap_max]=t.heap[1],u(t,e),f(i,o,t.bl_count)}function k(t,e,a){var n,r,i=-1,s=e[1],h=0,l=7,o=4;for(0===s&&(l=138,o=3),e[2*(a+1)+1]=65535,n=0;n<=a;n++)r=s,s=e[2*(n+1)+1],++h<l&&r===s||(h<o?t.bl_tree[2*r]+=h:0!==r?(r!==i&&t.bl_tree[2*r]++,t.bl_tree[2*Z]++):h<=10?t.bl_tree[2*$]++:t.bl_tree[2*tt]++,h=0,i=r,0===s?(l=138,o=3):r===s?(l=6,o=3):(l=7,o=4))}function z(t,e,a){var n,r,i=-1,s=e[1],h=0,_=7,d=4;for(0===s&&(_=138,d=3),n=0;n<=a;n++)if(r=s,s=e[2*(n+1)+1],!(++h<_&&r===s)){if(h<d){do o(t,r,t.bl_tree);while(0!==--h)}else 0!==r?(r!==i&&(o(t,r,t.bl_tree),h--),o(t,Z,t.bl_tree),l(t,h-3,2)):h<=10?(o(t,$,t.bl_tree),l(t,h-3,3)):(o(t,tt,t.bl_tree),l(t,h-11,7));h=0,i=r,0===s?(_=138,d=3):r===s?(_=6,d=3):(_=7,d=4)}}function x(t){var e;for(k(t,t.dyn_ltree,t.l_desc.max_code),k(t,t.dyn_dtree,t.d_desc.max_code),y(t,t.bl_desc),e=J-1;e>=3&&0===t.bl_tree[2*rt[e]+1];e--);return t.opt_len+=3*(e+1)+5+5+4,e}function B(t,e,a,n){var r;for(l(t,e-257,5),l(t,a-1,5),l(t,n-4,4),r=0;r<n;r++)l(t,t.bl_tree[2*rt[r]+1],3);z(t,t.dyn_ltree,e-1),z(t,t.dyn_dtree,a-1)}function A(t){var e,a=4093624447;for(e=0;e<=31;e++,a>>>=1)if(1&a&&0!==t.dyn_ltree[2*e])return O;if(0!==t.dyn_ltree[18]||0!==t.dyn_ltree[20]||0!==t.dyn_ltree[26])return q;for(e=32;e<M;e++)if(0!==t.dyn_ltree[2*e])return q;return O}function C(t){pt||(c(),pt=!0),t.l_desc=new i(t.dyn_ltree,ut),t.d_desc=new i(t.dyn_dtree,ft),t.bl_desc=new i(t.bl_tree,ct),t.bi_buf=0,t.bi_valid=0,p(t)}function S(t,e,a,n){l(t,(L<<1)+(n?1:0),3),m(t,e,a,!0)}function E(t){l(t,N<<1,3),o(t,Y,st),d(t)}function j(t,e,a,n){var r,i,s=0;t.level>0?(t.strm.data_type===T&&(t.strm.data_type=A(t)),y(t,t.l_desc),y(t,t.d_desc),s=x(t),r=t.opt_len+3+7>>>3,i=t.static_len+3+7>>>3,i<=r&&(r=i)):r=i=a+5,a+4<=r&&e!==-1?S(t,e,a,n):t.strategy===I||i===r?(l(t,(N<<1)+(n?1:0),3),v(t,st,ht)):(l(t,(R<<1)+(n?1:0),3),B(t,t.l_desc.max_code+1,t.d_desc.max_code+1,s+1),v(t,t.dyn_ltree,t.dyn_dtree)),p(t),n&&g(t)}function U(t,e,a){return t.pending_buf[t.d_buf+2*t.last_lit]=e>>>8&255,t.pending_buf[t.d_buf+2*t.last_lit+1]=255&e,t.pending_buf[t.l_buf+t.last_lit]=255&a,t.last_lit++,0===e?t.dyn_ltree[2*a]++:(t.matches++,e--,t.dyn_ltree[2*(ot[a]+M+1)]++,t.dyn_dtree[2*s(e)]++),t.last_lit===t.lit_bufsize-1}var D=t("../utils/common"),I=4,O=0,q=1,T=2,L=0,N=1,R=2,H=3,F=258,K=29,M=256,P=M+1+K,G=30,J=19,Q=2*P+1,V=15,W=16,X=7,Y=256,Z=16,$=17,tt=18,et=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],at=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],nt=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],rt=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],it=512,st=new Array(2*(P+2));n(st);var ht=new Array(2*G);n(ht);var lt=new Array(it);n(lt);var ot=new Array(F-H+1);n(ot);var _t=new Array(K);n(_t);var dt=new Array(G);n(dt);var ut,ft,ct,pt=!1;a._tr_init=C,a._tr_stored_block=S,a._tr_flush_block=j,a._tr_tally=U,a._tr_align=E},{"../utils/common":1}],8:[function(t,e,a){"use strict";function n(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}e.exports=n},{}],"/lib/deflate.js":[function(t,e,a){"use strict";function n(t){if(!(this instanceof n))return new n(t);this.options=l.assign({level:b,method:v,chunkSize:16384,windowBits:15,memLevel:8,strategy:w,to:""},t||{});var e=this.options;e.raw&&e.windowBits>0?e.windowBits=-e.windowBits:e.gzip&&e.windowBits>0&&e.windowBits<16&&(e.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new d,this.strm.avail_out=0;var a=h.deflateInit2(this.strm,e.level,e.method,e.windowBits,e.memLevel,e.strategy);if(a!==p)throw new Error(_[a]);if(e.header&&h.deflateSetHeader(this.strm,e.header),e.dictionary){var r;if(r="string"==typeof e.dictionary?o.string2buf(e.dictionary):"[object ArrayBuffer]"===u.call(e.dictionary)?new Uint8Array(e.dictionary):e.dictionary,a=h.deflateSetDictionary(this.strm,r),a!==p)throw new Error(_[a]);this._dict_set=!0}}function r(t,e){var a=new n(e);if(a.push(t,!0),a.err)throw a.msg||_[a.err];return a.result}function i(t,e){return e=e||{},e.raw=!0,r(t,e)}function s(t,e){return e=e||{},e.gzip=!0,r(t,e)}var h=t("./zlib/deflate"),l=t("./utils/common"),o=t("./utils/strings"),_=t("./zlib/messages"),d=t("./zlib/zstream"),u=Object.prototype.toString,f=0,c=4,p=0,g=1,m=2,b=-1,w=0,v=8;n.prototype.push=function(t,e){var a,n,r=this.strm,i=this.options.chunkSize;if(this.ended)return!1;n=e===~~e?e:e===!0?c:f,"string"==typeof t?r.input=o.string2buf(t):"[object ArrayBuffer]"===u.call(t)?r.input=new Uint8Array(t):r.input=t,r.next_in=0,r.avail_in=r.input.length;do{if(0===r.avail_out&&(r.output=new l.Buf8(i),r.next_out=0,r.avail_out=i),a=h.deflate(r,n),a!==g&&a!==p)return this.onEnd(a),this.ended=!0,!1;0!==r.avail_out&&(0!==r.avail_in||n!==c&&n!==m)||("string"===this.options.to?this.onData(o.buf2binstring(l.shrinkBuf(r.output,r.next_out))):this.onData(l.shrinkBuf(r.output,r.next_out)))}while((r.avail_in>0||0===r.avail_out)&&a!==g);return n===c?(a=h.deflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===p):n!==m||(this.onEnd(p),r.avail_out=0,!0)},n.prototype.onData=function(t){this.chunks.push(t)},n.prototype.onEnd=function(t){t===p&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=l.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},a.Deflate=n,a.deflate=r,a.deflateRaw=i,a.gzip=s},{"./utils/common":1,"./utils/strings":2,"./zlib/deflate":5,"./zlib/messages":6,"./zlib/zstream":8}]},{},[])("/lib/deflate.js")});
/*!
 * Copyright (c) 2019 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 * @version 5.6.0.1875
 * @flags w3c,NDEBUG
 */
if(window.TLT){throw"Attempting to recreate TLT. Library may be included more than once on the page."}window.TLT=(function(){var u,p,x,E,m,A,d,e,B;function v(N,G,H,O){var L=null,P=null,J=TLT.getModule("replay"),M=TLT.getModule("TLCookie"),Q=TLT.getModule("performance"),I=null,K=B.getOriginAndPath();if(!G||typeof G!=="string"){return}if(!H||typeof H!=="string"){H=""}P={type:2,screenview:{type:N,name:G,originalUrl:K.path,url:TLT.normalizeUrl(K.path),host:K.origin,referrer:H,title:document.title,queryParams:K.queryParams}};if(N==="LOAD"){I={type:"screenview_load",name:G}}else{if(N==="UNLOAD"){I={type:"screenview_unload",name:G}}}if(I&&J){L=J.onevent(I)}if(L){P.dcid=L}if(N==="LOAD"||N==="UNLOAD"){A.post("",P)}if(I&&M){M.onevent(I)}if(I&&Q){Q.onevent(I)}}var z=(new Date()).getTime(),t,C={},b={},g=false,i=null,r=(function(){var H,J=[];function I(N){var K=e.framesBlacklist,M,L;H=H||[];N=N||null;if(typeof K!=="undefined"&&K.length>0){for(L=0;L<K.length;L+=1){M=x.queryAll(K[L],N);if(M&&M.length>0){H=H.concat(M)}}J=J.concat(x.queryAll("iframe",N))}}function G(K){if(B.indexOf(J,K)<0){I(K.ownerDocument)}return B.indexOf(H,K)>-1}G.clearCache=function(){H=null};return G}()),s=null,j={config:["getConfig","updateConfig","getCoreConfig","updateCoreConfig","getModuleConfig","updateModuleConfig","getServiceConfig","updateServiceConfig"],queue:["post","setAutoFlush","flushAll"],browserBase:["getXPathFromNode","processDOMEvent"]},w=(function(){var G={};return{normalizeModuleEvents:function(L,J,N,I){var H=G[L],M=false,K=false;N=N||y._getLocalTop();I=I||N.document;if(H){return}G[L]={loadFired:false,pageHideFired:false};B.forEach(J,function(O){switch(O.name){case"load":M=true;J.push(B.mixin(B.mixin({},O),{name:"pageshow"}));break;case"unload":K=true;J.push(B.mixin(B.mixin({},O),{name:"pagehide"}));J.push(B.mixin(B.mixin({},O),{name:"beforeunload"}));break;case"change":if(B.isLegacyIE&&y.getFlavor()==="w3c"){J.push(B.mixin(B.mixin({},O),{name:"propertychange"}))}break}});if(!M&&!K){delete G[L];return}G[L].silentLoad=!M;G[L].silentUnload=!K;if(!M){J.push({name:"load",target:N})}if(!K){J.push({name:"unload",target:N})}},canPublish:function(H,J){var I;if(G.hasOwnProperty(H)===false){return true}I=G[H];switch(J.type){case"load":I.pageHideFired=false;I.loadFired=true;return !I.silentLoad;case"pageshow":I.pageHideFired=false;J.type="load";return !I.loadFired&&!I.silentLoad;case"pagehide":J.type="unload";I.loadFired=false;I.pageHideFired=true;return !I.silentUnload;case"unload":case"beforeunload":J.type="unload";I.loadFired=false;return !I.pageHideFired&&!I.silentUnload}return true},isUnload:function(H){return typeof H==="object"?(H.type==="unload"||H.type==="beforeunload"||H.type==="pagehide"):false}}}()),D={},c={},a={},l=function(){},o=null,n=true,f=function(){},k=false,q=(function(){var G=window.location,I=G.pathname,H=G.hash,J="";return function(){var M=G.pathname,K=G.hash,L=J;if(M!==I){L=TLT.normalizeUrl(M+K)}else{if(K!==H){L=TLT.normalizeUrl(K)}}if(L!==J){if(J){v("UNLOAD",J)}v("LOAD",L);J=L;I=M;H=K}}}()),h=function(I,P){var J,H,K,O=false,G=e.blockedElements,M,N,L;if(!G||!G.length){h=function(){return false};return O}if(!I||!I.nodeType){return O}P=P||B.getDocument(I);for(J=0,K=G.length;J<K&&!O;J+=1){N=x.queryAll(G[J],P);for(H=0,L=N.length;H<L&&!O;H+=1){M=N[H];O=M.contains?M.contains(I):M===I}}return O},F=function(H){var G=false,I=["intent:","mailto:","sms:","tel:"];if(H&&B.getTagName(H)==="a"&&I.indexOf(H.protocol)!==-1){G=true}return G},y={_loadGlobalsForUnitTesting:function(G){B=G.utils;u=G.getService("ajax");p=G.getService("browserBase");x=G.getService("browser");E=G.getService("config");m=G.getService("domCapture");A=G.getService("queue");d=G.getService("serializer");e=E?E.getCoreConfig():null},getStartTime:function(){return z},getPageId:function(){return t||"#"},getLibraryVersion:function(){return"5.6.0.1875"},getCurrentWebEvent:function(){return D},normalizeUrl:function(J,I){var H,G;if(typeof I==="undefined"){I=J}H=this.getCoreConfig();if(H.normalization&&H.normalization.urlFunction){G=H.normalization.urlFunction;if(typeof G==="string"){G=B.access(G)}return G(I)}return I},getSessionStart:function(){return this.getService("message").getSessionStart()},init:function(H,I){var G;B=this.utils;if(B.isLegacyIE){return}o=I;if(!n){throw"init must only be called once!"}t="P."+B.getRandomString(28);n=false;G=function(J){J=J||window.event||{};if(J.type==="load"||document.readyState!=="loading"){if(document.removeEventListener){document.removeEventListener("DOMContentLoaded",G,false);window.removeEventListener("load",G,false)}else{document.detachEvent("onreadystatechange",G);window.detachEvent("onload",G)}l(H,I)}};if(document.readyState==="complete"||(document.readyState==="interactive"&&!B.isIE)){setTimeout(G)}else{if(document.addEventListener){document.addEventListener("DOMContentLoaded",G,false);window.addEventListener("load",G,false)}else{document.attachEvent("onreadystatechange",G);window.attachEvent("onload",G)}}},isInitialized:function(){return g},getState:function(){return i},destroy:function(I){var J="",H="",N=null,K=null,G=null,L=false;if(n){return false}this.stopAll();if(!I){for(J in c){if(c.hasOwnProperty(J)){H=J.split("|")[0];N=c[J].target;L=c[J].delegateTarget||undefined;x.unsubscribe(H,N,this._publishEvent,L)}}}for(K in b){if(b.hasOwnProperty(K)){G=b[K].instance;if(G&&typeof G.destroy==="function"){G.destroy()}b[K].instance=null}}r.clearCache();c={};g=false;n=true;i="destroyed";if(typeof o==="function"){try{o("destroyed")}catch(M){}}},_updateModules:function(I){var K=null,H=null,G=true;if(e&&e.modules){try{for(H in e.modules){if(e.modules.hasOwnProperty(H)){K=e.modules[H];if(C.hasOwnProperty(H)){if(K.enabled===false){this.stop(H);continue}this.start(H);if(K.events){this._registerModuleEvents(H,K.events,I)}}}}this._registerModuleEvents.clearCache()}catch(J){y.destroy();G=false}}else{G=false}return G},rebind:function(G){y._updateModules(G)},getSessionData:function(){if(!y.isInitialized()){return}var J=null,G=null,H,I;if(!e||!e.sessionDataEnabled){return null}G=e.sessionData||{};H=G.sessionQueryName;if(H){I=B.getQueryStringValue(H,G.sessionQueryDelim)}else{H=G.sessionCookieName||"TLTSID";I=B.getCookieValue(H)}if(H&&I){J=J||{};J.tltSCN=H;J.tltSCV=I;J.tltSCVNeedsHashing=!!G.sessionValueNeedsHashing}return J},logGeolocation:function(G){var H;if(!y.isInitialized()){return}if(!G||!G.coords){return}H={type:13,geolocation:{lat:B.getValue(G,"coords.latitude",0),"long":B.getValue(G,"coords.longitude",0),accuracy:Math.ceil(B.getValue(G,"coords.accuracy",0))}};A.post("",H)},logCustomEvent:function(I,G){if(!y.isInitialized()){return}var H=null;if(!I||typeof I!=="string"){I="CUSTOM"}G=G||{};H={type:5,customEvent:{name:I,data:G}};A.post("",H)},logExceptionEvent:function(J,H,G){if(!y.isInitialized()){return}var I=null;if(!J||typeof J!=="string"){return}H=H||"";G=G||"";I={type:6,exception:{description:J,url:H,line:G}};A.post("",I)},logFormCompletion:function(G,I){if(!y.isInitialized()){return}var H={type:15,formCompletion:{submitted:!!G,valid:(typeof I==="boolean"?I:null)}};A.post("",H)},logScreenviewLoad:function(I,H,G){if(!y.isInitialized()){return}v("LOAD",I,H,G)},logScreenviewUnload:function(G){if(!y.isInitialized()){return}v("UNLOAD",G)},logDOMCapture:function(G,J){var K=null,I,H,L;if(!this.isInitialized()){return K}if(B.isLegacyIE){return K}if(m){G=G||window.document;H=this.getServiceConfig("domCapture");J=B.mixin({},H.options,J);I=m.captureDOM(G,J);if(I){K=J.dcid||("dcid-"+B.getSerialNumber()+"."+(new Date()).getTime());I.dcid=K;I.eventOn=!!J.eventOn;L={type:12,domCapture:I};A.post("",L);if(J.qffd!==false&&!k&&L.domCapture.fullDOM){A.flush();k=true}}else{K=null}}return K},performDOMCapture:function(I,G,H){return this.logDOMCapture(G,H)},performFormCompletion:function(H,G,I){return this.logFormCompletion(G,I)},_bridgeCallback:function(H){var G=a[H];if(G&&G.enabled){return G}return null},logScreenCapture:function(){if(!y.isInitialized()){return}var G=y._bridgeCallback("screenCapture");if(G!==null){G.cbFunction()}},enableTealeafFramework:function(){if(!y.isInitialized()){return}var G=y._bridgeCallback("enableTealeafFramework");if(G!==null){G.cbFunction()}},disableTealeafFramework:function(){if(!y.isInitialized()){return}var G=y._bridgeCallback("disableTealeafFramework");if(G!==null){G.cbFunction()}},startNewTLFSession:function(){if(!y.isInitialized()){return}var G=y._bridgeCallback("startNewTLFSession");if(G!==null){G.cbFunction()}},currentSessionId:function(){if(!y.isInitialized()){return}var H,G=y._bridgeCallback("currentSessionId");if(G!==null){H=G.cbFunction()}return H},defaultValueForConfigurableItem:function(G){if(!y.isInitialized()){return}var I,H=y._bridgeCallback("defaultValueForConfigurableItem");if(H!==null){I=H.cbFunction(G)}return I},valueForConfigurableItem:function(G){if(!y.isInitialized()){return}var I,H=y._bridgeCallback("valueForConfigurableItem");if(H!==null){I=H.cbFunction(G)}return I},setConfigurableItem:function(H,J){if(!y.isInitialized()){return}var G=false,I=y._bridgeCallback("setConfigurableItem");if(I!==null){G=I.cbFunction(H,J)}return G},addAdditionalHttpHeader:function(H,J){if(!y.isInitialized()){return}var G=false,I=y._bridgeCallback("addAdditionalHttpHeader");if(I!==null){G=I.cbFunction(H,J)}return G},logCustomEventBridge:function(I,J,H){if(!y.isInitialized()){return}var G=false,K=y._bridgeCallback("logCustomEventBridge");if(K!==null){G=K.cbFunction(I,J,H)}return G},registerBridgeCallbacks:function(N){var K,I,L,H=null,J,O,G;if(!N){return false}if(N.length===0){a={};return false}try{for(K=0,L=N.length;K<L;K+=1){H=N[K];if(typeof H==="object"&&H.cbType&&H.cbFunction){J={enabled:H.enabled,cbFunction:H.cbFunction,cbOrder:H.order||0};if(B.isUndefOrNull(a[H.cbType])){a[H.cbType]=J}else{if(!B.isArray(a[H.cbType])){a[H.cbType]=[a[H.cbType]]}O=a[H.cbType];for(I=0,G=O.length;I<G;I+=1){if(O[I].cbOrder>J.cbOrder){break}}O.splice(I,0,J)}}}}catch(M){return false}return true},redirectQueue:function(J){var M,L,I,H,G,N,K;if(!J||!J.length){return J}H=a.messageRedirect;if(!H){return J}if(!B.isArray(H)){G=[H]}else{G=H}for(L=0,N=G.length;L<N;L+=1){H=G[L];if(H&&H.enabled){for(M=0,I=J.length;M<I;M+=1){K=H.cbFunction(d.serialize(J[M]),J[M]);if(K&&typeof K==="object"){J[M]=K}else{J.splice(M,1);M-=1;I=J.length}}}}return J},_hasSameOrigin:function(G){try{return G.document.location.host===document.location.host&&G.document.location.protocol===document.location.protocol}catch(H){}return false},provideRequestHeaders:function(){var H=null,G=a.addRequestHeaders;if(G&&G.enabled){H=G.cbFunction()}return H},_registerModuleEvents:(function(){var I,K=0,J=function(O,N,M){if(O==="window"){return N}if(O==="document"){return M}return O};function L(M,S,U){var T=B.getDocument(U),O=y._getLocalTop(),N=B.isIFrameDescendant(U),R,Q,P;U=U||T;w.normalizeModuleEvents(M,S,O,T);if(N){R=p.ElementData.prototype.examineID(U).id;if(typeof R==="string"){R=R.slice(0,R.length-1);for(Q in c){if(c.hasOwnProperty(Q)){for(P=0;P<c[Q].length;P+=1){if(M===c[Q][P]){if(Q.indexOf(R)!==-1){delete c[Q];break}}}}}}}B.forEach(S,function(V){var Y=J(V.target,O,T)||T,X=J(V.delegateTarget,O,T),W="";if(V.recurseFrames!==true&&N){return}if(typeof Y==="string"){if(V.delegateTarget&&y.getFlavor()==="jQuery"){W=y._buildToken4delegateTarget(V.name,Y,V.delegateTarget);if(!c.hasOwnProperty(W)){c[W]=[M];c[W].target=Y;c[W].delegateTarget=X;x.subscribe(V.name,Y,y._publishEvent,X,W)}else{c[W].push(M)}}else{B.forEach(x.queryAll(Y,U),function(Z){var aa=I.get(Z);if(!aa){aa=p.ElementData.prototype.examineID(Z);I.set(Z,aa)}W=V.name+"|"+aa.id+aa.idType;if(B.indexOf(c[W],M)!==-1){return}c[W]=c[W]||[];c[W].push(M);c[W].target=Z;x.subscribe(V.name,Z,y._publishEvent)})}}else{W=y._buildToken4bubbleTarget(V.name,Y,typeof V.target==="undefined");if(!c.hasOwnProperty(W)){c[W]=[M];x.subscribe(V.name,Y,y._publishEvent)}else{if(B.indexOf(c[W],M)===-1){c[W].push(M)}}}if(W!==""){if(typeof Y!=="string"){c[W].target=Y}}})}function H(M){var N=B.getIFrameWindow(M);return(N!==null)&&y._hasSameOrigin(N)&&(N.document!==null)&&N.document.readyState==="complete"}function G(P,N,T){T=T||y._getLocalTop().document;I=I||new B.WeakMap();L(P,N,T);if(P!=="performance"){var S=null,O=null,M=x.queryAll("iframe, frame",T),R,Q;for(R=0,Q=M.length;R<Q;R+=1){S=M[R];if(r(S)){continue}if(H(S)){O=B.getIFrameWindow(S);y._registerModuleEvents(P,N,O.document);m.observeWindow(O);continue}K+=1;(function(W,U,X){var V=null,Y={moduleName:W,moduleEvents:U,hIFrame:X,_registerModuleEventsDelayed:function(){var Z=null;if(!r(X)){Z=B.getIFrameWindow(X);if(y._hasSameOrigin(Z)){y._registerModuleEvents(W,U,Z.document);m.observeWindow(Z)}}K-=1;if(!K){y._publishEvent({type:"loadWithFrames",custom:true})}}};B.addEventListener(X,"load",function(){Y._registerModuleEventsDelayed()});if(B.isLegacyIE&&H(X)){V=B.getIFrameWindow(X);B.addEventListener(V.document,"readystatechange",function(){Y._registerModuleEventsDelayed()})}}(P,N,S))}}}G.clearCache=function(){if(I){I.clear();I=null}};return G}()),_buildToken4currentTarget:function(H){var I=H.nativeEvent?H.nativeEvent.currentTarget:null,G=I?p.ElementData.prototype.examineID(I):{id:H.target?H.target.id:null,idType:H.target?H.target.idType:-1};return H.type+"|"+G.id+G.idType},_buildToken4delegateTarget:function(G,I,H){return G+"|"+I+"|"+H},_buildToken4bubbleTarget:function(H,N,M,Q){var K=y._getLocalTop(),G,R=function(S){var T=null;if(y._hasSameOrigin(G.parent)){B.forEach(x.queryAll("iframe, frame",G.parent.document),function(U){var V=null;if(!r(U)){V=B.getIFrameWindow(U);if(y._hasSameOrigin(V)&&V.document===S){T=U}}})}return T},O=B.getDocument(N),P=null,J,I=H,L;if(O){G=O.defaultView||O.parentWindow}if(N===window||N===window.window){I+="|null-2|window"}else{if(M&&G&&y._hasSameOrigin(G.parent)&&typeof O!=="undefined"&&K.document!==O){P=R(O);if(P){J=p.ElementData.prototype.examineID(P);I+="|"+J.xPath+"-2"}}else{if(Q&&Q!==document&&y.getFlavor()==="jQuery"){I+="|null-2|"+B.getTagName(N)+"|"+B.getTagName(Q)}else{I+="|null-2|document"}}}return I},_reinitConfig:function(){y._updateModules()},_publishEvent:function(G){var H=null,J=null,L=(G.delegateTarget&&G.data)?G.data:y._buildToken4currentTarget(G),M=null,N,O,P,I=null,Q=false,R=false,T=G.delegateTarget||null,S,K;D=G;if(G.type.match(/^(click|change|blur|mouse|touch)/)){f();A.resetFlushTimer()}S=B.getValue(e,"screenviewAutoDetect",true);if(S){q()}if((G.type==="load"||G.type==="pageshow")&&!G.nativeEvent.customLoad){D={};return}if(G.type==="click"){s=G.target.element}if(G.type==="beforeunload"){Q=false;K=(B.getTagName(s)==="a")?s:document.activeElement;if(K){if(F(K)){Q=true}else{B.forEach(e.ieExcludedLinks,function(V){var W,U,X=x.queryAll(V);for(W=0,U=X?X.length:0;W<U;W+=1){if(typeof X[W]!==undefined&&X[W]===s){Q=true;D={};return}}})}}if(Q){D={};return}}if(w.isUnload(G)){i="unloading"}if(G.type==="change"&&B.isLegacyIE&&y.getFlavor()==="w3c"&&(G.target.element.type==="checkbox"||G.target.element.type==="radio")){D={};return}if(G.type==="propertychange"){if(G.nativeEvent.propertyName==="checked"&&(G.target.element.type==="checkbox"||(G.target.element.type==="radio"&&G.target.element.checked))){G.type="change";G.target.type="INPUT"}else{D={};return}}if(G.target&&h(G.target.element)){D={};return}if(!c.hasOwnProperty(L)){if(G.hasOwnProperty("nativeEvent")){P=G.nativeEvent.currentTarget||G.nativeEvent.target}L=y._buildToken4bubbleTarget(G.type,P,true,T)}if(c.hasOwnProperty(L)){M=c[L];for(N=0,O=M.length;N<O;N+=1){H=M[N];J=y.getModule(H);I=B.mixin({},G);if(J&&y.isStarted(H)&&typeof J.onevent==="function"){R=w.canPublish(H,I);if(R){J.onevent(I)}}}}if(I&&I.type==="unload"&&R){y.destroy()}D={}},_getLocalTop:function(){return window.window},addModule:function(G,H){C[G]={creator:H,instance:null,context:null,messages:[]};if(this.isInitialized()){this.start(G)}},getModule:function(G){if(C[G]&&C[G].instance){return C[G].instance}return null},removeModule:function(G){this.stop(G);delete C[G]},isStarted:function(G){return C.hasOwnProperty(G)&&C[G].instance!==null},start:function(H){var I=C[H],G=null;if(I&&I.instance===null){I.context=new TLT.ModuleContext(H,this);G=I.instance=I.creator(I.context);if(typeof G.init==="function"){G.init()}}},startAll:function(){var G=null;for(G in C){if(C.hasOwnProperty(G)){this.start(G)}}},stop:function(H){var I=C[H],G=null;if(I&&I.instance!==null){G=I.instance;if(typeof G.destroy==="function"){G.destroy()}I.instance=I.context=null}},stopAll:function(){var G=null;for(G in C){if(C.hasOwnProperty(G)){this.stop(G)}}},addService:function(H,G){b[H]={creator:G,instance:null}},getService:function(G){if(b.hasOwnProperty(G)){if(!b[G].instance){try{b[G].instance=b[G].creator(this);if(typeof b[G].instance.init==="function"){b[G].instance.init()}}catch(H){B.clog("UIC terminated due to error when instanciating the "+G+" service.");throw H}if(typeof b[G].instance.getServiceName!=="function"){b[G].instance.getServiceName=function(){return G}}}return b[G].instance}return null},removeService:function(G){delete b[G]},broadcast:function(J){var I=0,G=0,K=null,H=null;if(J&&typeof J==="object"){for(K in C){if(C.hasOwnProperty(K)){H=C[K];if(B.indexOf(H.messages,J.type)>-1){if(typeof H.instance.onmessage==="function"){H.instance.onmessage(J)}}}}}},listen:function(G,I){var H=null;if(this.isStarted(G)){H=C[G];if(B.indexOf(H.messages,I)===-1){H.messages.push(I)}}},fail:function(I,H,G){I="UIC FAILED. "+I;try{y.destroy(!!G)}finally{B.clog(I);throw new y.UICError(I,H)}},UICError:(function(){function G(H,I){this.message=H;this.code=I}G.prototype=new Error();G.prototype.name="UICError";G.prototype.constructor=G;return G}()),getFlavor:function(){return"w3c"},isCrossOrigin:function(K,J){var I,H,G=[];if(J){G=J.split("//")}H=G.length>1?G[1]:J;if(H){H=H.split(":")[0]}if(K&&H&&(K.match(/^\s*http/)||K.match(/^\s*\/\//))&&!(K.match(H))){I=true}else{I=false}return I}};f=function(){var I=null,H=B.getValue(e,"inactivityTimeout",600000);if(!H){f=function(){};return}function G(){B.clog("UIC self-terminated due to inactivity timeout.");y.destroy()}f=function(){if(I){clearTimeout(I);I=null}I=setTimeout(G,H)};f()};l=function(I,U){var G,L,J,R,O,K,T,H,M,S=null,N;if(g){B.clog("TLT.init() called more than once. Ignoring.");return}if(TLT&&TLT.replay){return}E=y.getService("config");E.updateConfig(I);u=y.getService("ajax");p=y.getService("browserBase");x=y.getService("browser");m=y.getService("domCapture");A=y.getService("queue");d=y.getService("serializer");e=E.getCoreConfig();J=E.getModuleConfig("TLCookie")||{};K=J.sessionizationCookieName||"TLTSID";T=B.getCookieValue(K);if(T==="DND"){if(i!=="destroyed"){y.destroy()}return}if(!y._updateModules()){if(i!=="destroyed"){y.destroy()}return}if(E.subscribe){E.subscribe("configupdated",y._reinitConfig)}g=true;i="loaded";try{if(typeof TLFExtensionNotify==="function"){TLFExtensionNotify("Initialized")}}catch(Q){}R=y.getServiceConfig("queue");O=R.queues||[];if(B.isLegacyIE||B.isIE9){S=B.getOriginAndPath().origin}for(N=0;N<O.length;N+=1){if(S&&y.isCrossOrigin(O[N].endpoint,S)){B.clog("UIC terminated because IE 9 and below doesn't support cross-origin XHR");y.setAutoFlush(false);y.destroy();return}if(!T&&J.tlAppKey){H=O[N].endpoint;M=O[N].killswitchURL||(H.match("collectorPost")?H.replace("collectorPost","switch/"+J.tlAppKey):null);if(M){u.sendRequest({type:"GET",url:M,async:true,timeout:5000,oncomplete:function(V){if(V.responseText==="0"||V.data===0){y.setAutoFlush(false);B.setCookie(K,"DND");y.destroy()}}})}}if(O[N].checkEndpoint&&!R.asyncReqOnUnload){R.asyncReqOnUnload=true;u.sendRequest({oncomplete:function(V){if(V.success){R.asyncReqOnUnload=false}},timeout:O[N].endpointCheckTimeout||3000,url:O[N].endpoint,headers:{"X-PageId":t,"X-Tealeaf-SaaS-AppKey":J.tlAppKey,"X-Tealeaf-EndpointCheck":true},async:true,error:function(V){if(V.success){return}R.endpointCheckFailed=true}})}}G={type:"load",target:window.window,srcElement:window.window,currentTarget:window.window,bubbles:true,cancelBubble:false,cancelable:true,timeStamp:+new Date(),customLoad:true};L=new p.WebEvent(G);y._publishEvent(L);if(typeof o==="function"){try{o("initialized")}catch(P){}}};(function(){var H=null,I,G;for(H in j){if(j.hasOwnProperty(H)){for(I=0,G=j[H].length;I<G;I+=1){(function(K,J){y[J]=function(){var L=this.getService(K);if(L){return L[J].apply(L,arguments)}}}(H,j[H][I]))}}}}());return y}());(function(){var a=window.navigator.userAgent.toLowerCase(),j=(a.indexOf("msie")!==-1||a.indexOf("trident")!==-1),b=(function(){var k=!!window.performance;return(j&&(!k||document.documentMode<9))}()),e=(function(){return(j&&document.documentMode===9)}()),f=(a.indexOf("android")!==-1),g=/(ipad|iphone|ipod)/.test(a),c=(a.indexOf("opera mini")!==-1),i=1,d={"a:":"link","button:button":"button","button:submit":"button","input:button":"button","input:checkbox":"checkBox","input:color":"colorPicker","input:date":"datePicker","input:datetime":"datetimePicker","input:datetime-local":"datetime-local","input:email":"emailInput","input:file":"fileInput","input:image":"button","input:month":"month","input:number":"numberPicker","input:password":"textBox","input:radio":"radioButton","input:range":"slider","input:reset":"button","input:search":"searchBox","input:submit":"button","input:tel":"tel","input:text":"textBox","input:time":"timePicker","input:url":"urlBox","input:week":"week","select:":"selectList","select:select-one":"selectList","textarea:":"textBox","textarea:textarea":"textBox"},h={isIE:j,isLegacyIE:b,isIE9:e,isAndroid:f,isLandscapeZeroDegrees:false,isiOS:g,isOperaMini:c,isUndefOrNull:function(k){return typeof k==="undefined"||k===null},isArray:function(k){return !!(k&&Object.prototype.toString.call(k)==="[object Array]")},getSerialNumber:function(){var k;k=i;i+=1;return k},getRandomString:function(p,o){var n,m,k="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",l="";if(!p){return l}if(typeof o!=="string"){o=k}for(n=0,m=o.length;n<p;n+=1){l+=o.charAt(Math.floor(Math.random()*m))}return l},getValue:function(p,o,l){var n,k,m;l=typeof l==="undefined"?null:l;if(!p||typeof p!=="object"||typeof o!=="string"){return l}m=o.split(".");for(n=0,k=m.length;n<k;n+=1){if(this.isUndefOrNull(p)||typeof p[m[n]]==="undefined"){return l}p=p[m[n]]}return p},indexOf:function(n,m){var l,k;if(n&&n.indexOf){return n.indexOf(m)}if(n&&n instanceof Array){for(l=0,k=n.length;l<k;l+=1){if(n[l]===m){return l}}}return -1},forEach:function(o,n,m){var l,k;if(!o||!o.length||!n||!n.call){return}for(l=0,k=o.length;l<k;l+=1){n.call(m,o[l],l,o)}},some:function(o,n){var l,k,m=false;for(l=0,k=o.length;l<k;l+=1){m=n(o[l],l,o);if(m){return m}}return m},convertToArray:function(m){var n=0,l=m.length,k=[];while(n<l){k.push(m[n]);n+=1}return k},mixin:function(o){var n,m,l,k;for(l=1,k=arguments.length;l<k;l+=1){m=arguments[l];for(n in m){if(Object.prototype.hasOwnProperty.call(m,n)){o[n]=m[n]}}}return o},extend:function(k,l,m){var n="";for(n in m){if(Object.prototype.hasOwnProperty.call(m,n)){if(k&&Object.prototype.toString.call(m[n])==="[object Object]"){if(typeof l[n]==="undefined"){l[n]={}}this.extend(k,l[n],m[n])}else{l[n]=m[n]}}}return l},clone:function(l){var m,k;if(null===l||"object"!==typeof l){return l}if(l instanceof Object){m=(Object.prototype.toString.call(l)==="[object Array]")?[]:{};for(k in l){if(Object.prototype.hasOwnProperty.call(l,k)){m[k]=this.clone(l[k])}}return m}},parseVersion:function(m){var n,k,l=[];if(!m||!m.length){return l}l=m.split(".");for(n=0,k=l.length;n<k;n+=1){l[n]=/^[0-9]+$/.test(l[n])?parseInt(l[n],10):l[n]}return l},isEqual:function(m,l){var n,o,q,p,k;if(m===l){return true}if(typeof m!==typeof l){return false}if(m instanceof Object&&l instanceof Object){if(Object.prototype.toString.call(m)==="[object Array]"&&Object.prototype.toString.call(l)==="[object Array]"){if(m.length!==l.length){return false}for(n=0,k=m.length;n<k;n+=1){if(!this.isEqual(m[n],l[n])){return false}}return true}if(Object.prototype.toString.call(m)==="[object Object]"&&Object.prototype.toString.call(l)==="[object Object]"){for(n=0;n<2;n+=1){for(q in m){if(m.hasOwnProperty(q)){if(!l.hasOwnProperty(q)){return false}o=this.isEqual(m[q],l[q]);if(!o){return false}}}p=m;m=l;l=p}return true}}return false},calculateRelativeXY:function(m){if(h.isUndefOrNull(m)||h.isUndefOrNull(m.x)||h.isUndefOrNull(m.y)||h.isUndefOrNull(m.width)||h.isUndefOrNull(m.height)){return"0.5,0.5"}var l=Math.abs(m.x/m.width).toFixed(4),k=Math.abs(m.y/m.height).toFixed(4);l=l>1||l<0?0.5:l;k=k>1||k<0?0.5:k;return l+","+k},createObject:(function(){var k=null,l=null;if(typeof Object.create==="function"){k=Object.create}else{l=function(){};k=function(m){if(typeof m!=="object"&&typeof m!=="function"){throw new TypeError("Object prototype need to be an object!")}l.prototype=m;return new l()}}return k}()),access:function(p,n){var o=n||window,l,m,k;if(typeof p!=="string"||(typeof o!=="object"&&o!==null)){return}l=p.split(".");for(m=0,k=l.length;m<k;m+=1){if(m===0&&l[m]==="window"){continue}if(!Object.prototype.hasOwnProperty.call(o,l[m])){return}o=o[l[m]];if(m<(k-1)&&!(o instanceof Object)){return}}return o},isNumeric:function(k){var l=false;if(h.isUndefOrNull(k)||!(/\S/.test(k))){return l}l=!isNaN(k*2);return l},isUpperCase:function(k){return k===k.toUpperCase()&&k!==k.toLowerCase()},isLowerCase:function(k){return k===k.toLowerCase()&&k!==k.toUpperCase()},extractResponseHeaders:function(m){var o={},l,k,n=null;if(!m||!m.length){m=[]}else{m=m.split("\n")}for(l=0,k=m.length;l<k;l+=1){n=m[l].split(": ");if(n.length===2){o[n[0]]=n[1]}}return o},getTargetState:function(r){var k={a:["innerText","href"],input:{range:["maxValue:max","value"],checkbox:["value","checked"],radio:["value","checked"],image:["src"]},select:["value"],button:["value","innerText"],textarea:["value"]},m=this.getTagName(r),s=k[m]||null,n=null,l=null,o=0,q=0,p=null,t="";if(s!==null){if(Object.prototype.toString.call(s)==="[object Object]"){s=s[r.type]||["value"]}l={};for(t in s){if(s.hasOwnProperty(t)){if(s[t].indexOf(":")!==-1){p=s[t].split(":");l[p[0]]=r[p[1]]}else{if(s[t]==="innerText"){l[s[t]]=this.trim(r.innerText||r.textContent)}else{l[s[t]]=r[s[t]]}}}}}if(m==="select"&&r.options&&!isNaN(r.selectedIndex)){l.index=r.selectedIndex;if(l.index>=0&&l.index<r.options.length){n=r.options[r.selectedIndex];l.value=n.getAttribute("value")||n.getAttribute("label")||n.text||n.innerText;l.text=n.text||n.innerText}}return l},getDocument:function(k){var l=k;if(k&&k.nodeType!==9){if(k.getRootNode){l=k.getRootNode()}else{l=k.ownerDocument||k.document}}return l},getWindow:function(l){try{if(l.self!==l){var k=h.getDocument(l);return(!h.isUndefOrNull(k.defaultView))?(k.defaultView):(k.parentWindow)}}catch(m){l=null}return l},getOriginAndPath:function(t){var o={},v,w,r,k=true,u,s,l=[],m={},p,n;t=t||window.location;if(t.origin){o.origin=t.origin}else{o.origin=(t.protocol||"")+"//"+(t.host||"")}o.path=(t.pathname||"").split(";",1)[0];if(o.origin.indexOf("file://")>-1){v=o.path.match(/(.*)(\/.*app.*)/);if(v!==null){o.path=v[2]}}w=t.search||"";try{r=new URLSearchParams(w)}catch(q){k=false}if(k){r.forEach(function(y,x){m[x]=y})}else{if(w.length>1&&w.charAt(0)==="?"){l=decodeURIComponent(w).substring(1).split("&")}for(p=0;p<l.length;p+=1){n=l[p].indexOf("=");if(n>-1){u=l[p].substring(0,n);s=l[p].substring(n+1);m[u]=s}}}o.queryParams=m;return o},getIFrameWindow:function(m){var k=null;if(!m){return k}try{k=m.contentWindow||(m.contentDocument?m.contentDocument.parentWindow:null)}catch(l){}return k},getTagName:function(l){var k="";if(h.isUndefOrNull(l)){return k}if(l===document||l.nodeType===9){k="document"}else{if(l===window||l===window.window){k="window"}else{if(typeof l==="string"){k=l.toLowerCase()}else{if(l.tagName){k=l.tagName.toLowerCase()}else{if(l.nodeName){k=l.nodeName.toLowerCase()}else{k=""}}}}}return k},getTlType:function(m){var k,l,n="";if(h.isUndefOrNull(m)||!m.type){return n}k=m.type.toLowerCase();l=k+":";if(m.subType){l+=m.subType.toLowerCase()}n=d[l]||k;return n},isIFrameDescendant:function(l){var k=h.getWindow(l);return(k?(k!=TLT._getLocalTop()):false)},getOrientationMode:function(k){var l="INVALID";if(typeof k!=="number"){return l}switch(k){case 0:case 180:case 360:l="PORTRAIT";break;case 90:case -90:case 270:l="LANDSCAPE";break;default:l="UNKNOWN";break}return l},clog:(function(k){return function(){}}(window)),trim:function(k){if(!k||!k.toString){return k}return k.toString().replace(/^\s+|\s+$/g,"")},ltrim:function(k){if(!k||!k.toString){return k}return k.toString().replace(/^\s+/,"")},rtrim:function(k){if(!k||!k.toString){return k}return k.toString().replace(/\s+$/,"")},setCookie:function(u,l,s,w,p,k){var q,r,o,n,m="",v,t=k?";secure":"";if(!u){return}u=encodeURIComponent(u);l=encodeURIComponent(l);o=(p||location.hostname).split(".");v=";path="+(w||"/");if(typeof s==="number"){if(this.isIE){n=new Date();n.setTime(n.getTime()+(s*1000));m=";expires="+n.toUTCString()}else{m=";max-age="+s}}for(r=o.length,q=(r===1?1:2);q<=r;q+=1){document.cookie=u+"="+l+";domain="+o.slice(-q).join(".")+v+m+t;if(this.getCookieValue(u)===l){break}if(r===1){document.cookie=u+"="+l+v+m+t}}},getCookieValue:function(q,s){var n,o,m,r,l=null,k;try{s=s||document.cookie;if(!q||!q.toString){return null}q+="=";k=q.length;r=s.split(";");for(n=0,o=r.length;n<o;n+=1){m=r[n];m=h.ltrim(m);if(m.indexOf(q)===0){l=m.substring(k,m.length);break}}}catch(p){l=null}return l},getQueryStringValue:function(o,r,k){var n,m,s,l=null,p;try{k=k||window.location.search;s=k.length;if(!o||!o.toString||!s){return null}r=r||"&";k=r+k.substring(1);o=r+o+"=";n=k.indexOf(o);if(n!==-1){p=n+o.length;m=k.indexOf(r,p);if(m===-1){m=s}l=decodeURIComponent(k.substring(p,m))}}catch(q){}return l},addEventListener:(function(){if(window.addEventListener){return function(l,k,m){l.addEventListener(k,m,false)}}return function(l,k,m){l.attachEvent("on"+k,m)}}()),matchTarget:function(u,q){var o,m,n,t=-1,s,k,l,p,r,v=document;if(!u||!q){return t}if(!this.browserService||!this.browserBaseService){this.browserService=TLT.getService("browser");this.browserBaseService=TLT.getService("browserBase")}if(q.idType===-2){n=this.browserBaseService.getNodeFromID(q.id,q.idType);v=this.getDocument(n)}for(o=0,p=u.length;o<p&&t===-1;o+=1){r=u[o];if(typeof r==="string"){s=this.browserService.queryAll(r,v);for(m=0,k=s?s.length:0;m<k;m+=1){if(s[m]){l=this.browserBaseService.ElementData.prototype.examineID(s[m]);if(l.idType===q.idType&&l.id===q.id){t=o;break}}}}else{if(r&&r.id&&r.idType&&q.idType&&q.idType.toString()===r.idType.toString()){switch(typeof r.id){case"string":if(r.id===q.id){t=o}break;case"object":if(!r.cRegex){r.cRegex=new RegExp(r.id.regex,r.id.flags)}r.cRegex.lastIndex=0;if(r.cRegex.test(q.id)){t=o}break}}}}return t},WeakMap:(function(){function k(o,n){var m,l;o=o||[];for(m=0,l=o.length;m<l;m+=1){if(o[m][0]===n){return m}}return -1}return function(){var l=[];this.set=function(n,o){var m=k(l,n);l[m>-1?m:l.length]=[n,o]};this.get=function(n){var m=l[k(l,n)];return(m?m[1]:undefined)};this.clear=function(){l=[]};this.has=function(m){return(k(l,m)>=0)};this.remove=function(n){var m=k(l,n);if(m>=0){l.splice(m,1)}};this["delete"]=this.remove}}())};if(typeof TLT==="undefined"||!TLT){window.TLT={}}TLT.utils=h}());(function(){TLT.EventTarget=function(){this._handlers={}};TLT.EventTarget.prototype={constructor:TLT.EventTarget,publish:function(c,f){var d=0,a=0,b=this._handlers[c],e={type:c,data:f};if(typeof b!=="undefined"){for(a=b.length;d<a;d+=1){b[d](e)}}},subscribe:function(a,b){if(!this._handlers.hasOwnProperty(a)){this._handlers[a]=[]}this._handlers[a].push(b)},unsubscribe:function(c,e){var d=0,a=0,b=this._handlers[c];if(b){for(a=b.length;d<a;d+=1){if(b[d]===e){b.splice(d,1);return}}}}}}());TLT.ModuleContext=(function(){var a=["broadcast","getConfig:getModuleConfig","listen","post","getXPathFromNode","performDOMCapture","performFormCompletion","isInitialized","getStartTime","normalizeUrl","getSessionStart"];return function(f,d){var h={},g=0,b=a.length,j=null,e=null,c=null;for(g=0;g<b;g+=1){j=a[g].split(":");if(j.length>1){c=j[0];e=j[1]}else{c=j[0];e=j[0]}h[c]=(function(i){return function(){var k=d.utils.convertToArray(arguments);k.unshift(f);return d[i].apply(d,k)}}(e))}h.utils=d.utils;return h}}());TLT.addService("config",function(a){function d(f,e){a.utils.extend(true,f,e);c.publish("configupdated",c.getConfig())}var b={core:{},modules:{},services:{}},c=a.utils.extend(false,a.utils.createObject(new TLT.EventTarget()),{getConfig:function(){return b},updateConfig:function(e){d(b,e)},getCoreConfig:function(){return b.core},updateCoreConfig:function(e){d(b.core,e)},getServiceConfig:function(e){return b.services[e]||{}},updateServiceConfig:function(f,e){if(typeof b.services[f]==="undefined"){b.services[f]={}}d(b.services[f],e)},getModuleConfig:function(e){return b.modules[e]||{}},updateModuleConfig:function(f,e){if(typeof b.modules[f]==="undefined"){b.modules[f]={}}d(b.modules[f],e)},destroy:function(){b={core:{},modules:{},services:{}}}});return c});TLT.addService("queue",function(q){var K=q.utils,k=null,i={},F=600000,p=q.getService("ajax"),c=q.getService("browser"),e=q.getService("encoder"),u=q.getService("serializer"),D=q.getService("config"),r=q.getService("message"),z=null,m={},H=true,h=true,y={5:{limit:300,count:0},6:{limit:400,count:0}},d=[],B=false,t=(function(){var Q={};function T(U){return typeof Q[U]!=="undefined"}function M(U,V){if(!T(U)){Q[U]={lastOffset:0,data:[],queueId:U,url:V.url,eventThreshold:V.eventThreshold,sizeThreshold:V.sizeThreshold||0,timerInterval:V.timerInterval,size:-1,serializer:V.serializer,encoder:V.encoder,crossDomainEnabled:!!V.crossDomainEnabled,crossDomainIFrame:V.crossDomainIFrame}}return Q[U]}function O(U){if(T(U)){delete Q[U]}}function R(U){if(T(U)){return Q[U]}return null}function P(V){var U=R(V);if(U!==null){U.data=[]}}function S(U){var V=null;if(T(U)){V=R(U).data;P(U)}return V}function N(W,Y){var U=null,X=null,aa=window.tlBridge,V=window.iOSJSONShuttle;try{X=u.serialize(Y)}catch(Z){X="Serialization failed: "+(Z.name?Z.name+" - ":"")+Z.message;Y={error:X}}if((typeof aa!=="undefined")&&(typeof aa.addMessage==="function")){aa.addMessage(X)}else{if((typeof V!=="undefined")&&(typeof V==="function")){V(X)}else{if(T(W)){U=R(W);U.data.push(Y);U.data=q.redirectQueue(U.data);if(U.sizeThreshold){X=u.serialize(U.data);U.size=X.length}return U.data.length}}}return 0}return{exists:T,add:M,remove:O,reset:function(){Q={}},get:R,clear:P,flush:S,push:N}}());function n(M){if(M&&M.id){K.extend(true,d[M.id-1],{xhrRspEnd:r.createMessage({type:0}).offset,success:M.success,statusCode:M.statusCode,statusText:M.statusText})}}function w(){return window.location.pathname}function A(O,S,P,R){var M=t.get(O),Q={name:S,value:P},N=null;if(typeof S!=="string"||typeof P!=="string"){return}if(!M.headers){M.headers={once:[],always:[]}}N=!!R?M.headers.always:M.headers.once;N.push(Q)}function g(O,R){var Q=0,N=0,M=t.get(O),S=M.headers,P=null;R=R||{};function T(V,X){var W=0,U=0,Y=null;for(W=0,U=V.length;W<U;W+=1){Y=V[W];X[Y.name]=Y.value}}if(S){P=[S.always,S.once];for(Q=0,N=P.length;Q<N;Q+=1){T(P[Q],R)}}return R}function o(N){var M=null,O=null;if(!t.exists(N)){throw new Error("Queue: "+N+" does not exist!")}M=t.get(N);O=M?M.headers:null;if(O){O.once=[]}}function l(){var N=0,M,P,O=q.provideRequestHeaders();if(O&&O.length){for(N=0,M=O.length;N<M;N+=1){P=O[N];A("DEFAULT",P.name,P.value,P.recurring)}}return N}function J(Q){var P,M,O=[],N="";if(!Q||!Q.length){return N}for(P=0,M=Q.length;P<M;P+=1){O[Q[P].type]=true}for(P=0,M=O.length;P<M;P+=1){if(O[P]){if(N){N+=","}N+=P}}return N}function j(O,aa){var V=t.get(O),U=V.url?t.flush(O):null,W=U?U.length:0,Q={"Content-Type":"application/json","X-PageId":q.getPageId(),"X-Tealeaf":"device (UIC) Lib/5.6.0.1875","X-TealeafType":"GUI","X-TeaLeaf-Page-Url":w(),"X-Tealeaf-SyncXHR":(!!aa).toString()},Y=null,S=r.createMessage({type:0}).offset,ab=V.serializer||"json",N=V.encoder,R,T,M,P=k.tltWorker,ac,Z=null;if(!W||!V){return}M=S-U[W-1].offset;if(M>(F+60000)){return}V.lastOffset=U[W-1].offset;Q["X-Tealeaf-MessageTypes"]=J(U);U=r.wrapMessages(U);if(k.xhrLogging){Y=U.serialNumber;d[Y-1]={serialNumber:Y,xhrReqStart:S};U.log={xhr:d};if(k.endpointCheckFailed){U.log.endpointCheckFailed=true}}l();g(O,Q);if(P&&!aa){P.onmessage=function(ae){var ad;ad=ae.data;n(ad)};ac={id:Y,url:V.url,headers:Q,data:U};P.postMessage(ac)}else{if(ab){U=u.serialize(U,ab)}if(N){T=e.encode(U,N);if(T){if(T.data&&!T.error){U=T.data;Q["Content-Encoding"]=T.encoding}else{U=T.error}}}if(V.crossDomainEnabled){Z=K.getIFrameWindow(V.crossDomainIFrame);if(!Z){return}R={request:{id:Y,url:V.url,async:!aa,headers:Q,data:U}};if(typeof window.postMessage==="function"){Z.postMessage(R,V.crossDomainIFrame.src)}else{try{Z.sendMessage(R)}catch(X){return}}}else{p.sendRequest({id:Y,oncomplete:n,url:V.url,async:!aa,headers:Q,data:U})}}o(O)}function I(P){var M=null,O=k.queues,N=0;for(N=0;N<O.length;N+=1){M=O[N];j(M.qid,P)}return true}function L(P,R){var O,N,S=r.createMessage(R),M=t.get(P),Q,T;N=M.data.length;if(N){T=S.offset-M.data[N-1].offset;if(T>F){t.flush(P);q.destroy();return}}N=t.push(P,S);Q=M.size;if((N>=M.eventThreshold||Q>=M.sizeThreshold)&&H&&q.getState()!=="unloading"){O=q.getCurrentWebEvent();if(O.type==="click"&&!k.ddfoc){if(h){h=false;window.setTimeout(function(){if(t.exists(P)){j(P);h=true}},500)}}else{j(P)}}}function a(O){var M,N=false;if(!O||!O.type){return true}M=y[O.type];if(M){M.count+=1;if(M.count>M.limit){N=true;if(M.count===M.limit+1){L("DEFAULT",{type:16,dataLimit:{messageType:O.type,maxCount:M.limit}})}}}return N}function G(O){var N=null,R=k.queues,Q="",P=0,M=0;for(P=0;P<R.length;P+=1){N=R[P];if(N&&N.modules){for(M=0;M<N.modules.length;M+=1){Q=N.modules[M];if(Q===O){return N.qid}}}}return z.qid}function x(O,M){m[O]=window.setTimeout(function N(){if(H){j(O)}m[O]=window.setTimeout(N,M)},M)}function f(N){var M=false;if(N&&m[N]){window.clearTimeout(m[N]);delete m[N];M=true}return M}function v(){var M=0;for(M in m){if(m.hasOwnProperty(M)){f(M)}}m={}}function b(N){var M;if(!N){return}if(f(N)){M=t.get(N);if(M.timerInterval){x(N,M.timerInterval)}}}function E(M){}function s(M){k=M;i=q.getCoreConfig();F=K.getValue(i,"inactivityTimeout",600000);K.forEach(k.queues,function(N,O){var P=null;if(N.qid==="DEFAULT"){z=N}if(N.crossDomainEnabled){P=c.query(N.crossDomainFrameSelector);if(!P){q.fail("Cross domain iframe not found")}}t.add(N.qid,{url:N.endpoint,eventThreshold:N.maxEvents,sizeThreshold:N.maxSize||0,serializer:N.serializer,encoder:N.encoder,timerInterval:N.timerInterval||0,crossDomainEnabled:N.crossDomainEnabled||false,crossDomainIFrame:P});if(typeof N.timerInterval!=="undefined"&&N.timerInterval>0){x(N.qid,N.timerInterval)}});D.subscribe("configupdated",E);B=true}function C(){if(H){I(!k.asyncReqOnUnload)}D.unsubscribe("configupdated",E);v();t.reset();k=null;z=null;B=false}return{init:function(){if(!B){s(D.getServiceConfig("queue")||{})}else{}},destroy:function(){C()},_getQueue:function(M){return t.get(M).data},setAutoFlush:function(M){if(M===true){H=true}else{H=false}},flush:function(M){M=M||z.qid;if(!t.exists(M)){throw new Error("Queue: "+M+" does not exist!")}j(M)},flushAll:function(M){return I(!!M)},post:function(N,O,M){if(!q.isInitialized()){return}M=M||G(N);if(!t.exists(M)){return}if(!a(O)){L(M,O)}},resetFlushTimer:function(M){M=M||z.qid;if(!t.exists(M)){return}b(M)}}});TLT.addService("browserBase",function(r){var g,L=r.utils,h={optgroup:true,option:true,nobr:true},p={},e,m=null,A,w,f,q,F=false;function s(){e=r.getService("config");m=r.getService("serializer");A=e?e.getServiceConfig("browser"):{};w=A.hasOwnProperty("blacklist")?A.blacklist:[];f=A.hasOwnProperty("customid")?A.customid:[]}function b(){s();if(e){e.subscribe("configupdated",s)}F=true}function G(){if(e){e.unsubscribe("configupdated",s)}F=false}function v(P){var N,M,O;if(!P||!P.id||typeof P.id!=="string"){return false}for(N=0,M=w.length;N<M;N+=1){if(typeof w[N]==="string"){if(P.id===w[N]){return false}}else{if(typeof w[N]==="object"){if(!w[N].cRegex){w[N].cRegex=new RegExp(w[N].regex,w[N].flags)}w[N].cRegex.lastIndex=0;if(w[N].cRegex.test(P.id)){return false}}}}return true}function o(O,P){var M={type:null,subType:null},N;if(!O){return M}N=O.type;switch(N){case"focusin":N="focus";break;case"focusout":N="blur";break;default:break}M.type=N;return M}function y(N){var M={type:null,subType:null};if(!N){return M}M.type=L.getTagName(N);M.subType=N.type||null;return M}function c(M,O,N){var S={HTML_ID:"-1",XPATH_ID:"-2",ATTRIBUTE_ID:"-3"},R,P=null,Q;if(!M||!O){return P}R=N||window.document;O=O.toString();if(O===S.HTML_ID){if(R.getElementById){P=R.getElementById(M)}else{if(R.querySelector){P=R.querySelector("#"+M)}}}else{if(O===S.ATTRIBUTE_ID){Q=M.split("=");if(R.querySelector){P=R.querySelector("["+Q[0]+'="'+Q[1]+'"]')}}else{if(O===S.XPATH_ID){P=p.xpath(M,R)}}}return P}q=(function(){var M={nobr:true,p:true};return function(S,P,Z){var V,T,ac=document.documentElement,U=false,ab=null,R=null,Y=null,aa=[],N,X=true,Q=r._getLocalTop(),O="",W=false,ad;while(X){X=false;O=L.getTagName(S);if(O&&!W){if(M[O]){S=S.parentNode;X=true;continue}}for(U=v(S);S&&(S.nodeType===1||S.nodeType===9)&&S!==document&&(P||!U);U=v(S)){Y=S.parentNode;if(!Y){R=L.getWindow(S);if(!R||Z){N=[O,0];aa[aa.length]=N;return aa.reverse()}if(R===Q){return aa.reverse()}S=R.frameElement;O=L.getTagName(S);Y=S.parentNode;continue}ab=Y.firstChild;if(!ab){aa.push(["XPath Error(1)"]);S=null;break}for(T=0;ab;ab=ab.nextSibling){if(ab.nodeType===1&&L.getTagName(ab)===O){if(ab===S){N=[O,T];if(W){N.push("h");W=false}aa[aa.length]=N;break}T+=1}}if(Y.nodeType===11){S=Y.host;W=true}else{S=Y}O=L.getTagName(S)}if(U&&!P){N=[S.id];if(W){N.push("h");W=false}aa[aa.length]=N;if(L.isIFrameDescendant(S)){X=true;S=L.getWindow(S).frameElement}else{if(!Z&&!ac.contains(S)){X=true;ad=S.getRootNode();S=ad.host;W=true}}}}return aa.reverse()}}());function C(M){var N="null";if(!M||!M.length){return N}N=m.serialize(M,"json");return N}function u(P,N,R,O){var Q,M;M=q(P,!!N,!!O);if(R){Q=M}else{Q=C(M)}return Q}function K(N){var O={left:-1,top:-1},M;N=N||document;M=N.documentElement||N.body.parentNode||N.body;O.left=Math.round((typeof window.pageXOffset==="number")?window.pageXOffset:M.scrollLeft);O.top=Math.round((typeof window.pageYOffset==="number")?window.pageYOffset:M.scrollTop);return O}function J(M){return M&&typeof M.originalEvent!=="undefined"&&typeof M.isDefaultPrevented!=="undefined"&&!M.isSimulated}function j(M){if(!M){return null}if(M.type&&M.type.indexOf("touch")===0){if(J(M)){M=M.originalEvent}if(M.type==="touchstart"){M=M.touches[M.touches.length-1]}else{if(M.type==="touchend"){M=M.changedTouches[0]}}}return M}function t(N){var S=N||window.event,Q,T=document.documentElement,R=document.body,U=false,M=null,O,P=0;if(J(S)){S=S.originalEvent}if(typeof N==="undefined"||typeof S.target==="undefined"){S.target=S.srcElement||window.window;S.timeStamp=Number(new Date());if(S.pageX===null||typeof S.pageX==="undefined"){S.pageX=S.clientX+((T&&T.scrollLeft)||(R&&R.scrollLeft)||0)-((T&&T.clientLeft)||(R&&R.clientLeft)||0);S.pageY=S.clientY+((T&&T.scrollTop)||(R&&R.scrollTop)||0)-((T&&T.clientTop)||(R&&R.clientTop)||0)}S.preventDefault=function(){this.returnValue=false};S.stopPropagation=function(){this.cancelBubble=true}}if(S.type==="click"){Q=S.composedPath?S.composedPath():[];for(P=0;P<Q.length;P+=1){O=L.getTagName(Q[P]);if(O==="button"){U=true;M=Q[P];break}}if(U){return{originalEvent:S,target:M,srcElement:M,type:S.type,pageX:S.pageX,pageY:S.pageY}}}return S}function x(O){var N,M,P,Q=null;if(!O||!O.type){return null}if(O.type.indexOf("touch")===0){Q=j(O).target}else{if(typeof O.composedPath==="function"){P=O.composedPath();if(P&&P.length){Q=P[0];if(A.normalizeTargetToNearestLink){for(N=0,M=P.length;N<M;N+=1){if(L.getTagName(P[N])==="a"){Q=P[N];break}}}}else{Q=O.target||window.window}}else{if(O.srcElement){Q=O.srcElement}else{Q=O.target}}}while(Q&&h[L.getTagName(Q)]){if(Q.parentElement){Q=Q.parentElement}else{break}}if(Q.nodeType===9&&Q.documentElement){Q=Q.documentElement}return Q}function I(N){var Q=0,P=0,O=document.documentElement,M=document.body;N=j(N);if(N){if(N.pageX||N.pageY){Q=N.pageX;P=N.pageY}else{if(N.clientX||N.clientY){Q=N.clientX+(O?O.scrollLeft:(M?M.scrollLeft:0))-(O?O.clientLeft:(M?M.clientLeft:0));P=N.clientY+(O?O.scrollTop:(M?M.scrollTop:0))-(O?O.clientTop:(M?M.clientTop:0))}}}return{x:Q,y:P}}p.xpath=function(U,W){var S=null,N,T=null,X=false,M,Q,P,O,R,V;if(!U){return null}S=m.parse(U);W=W||document;N=W;if(!S){return null}for(Q=0,R=S.length;Q<R&&N;Q+=1){T=S[Q];X=T.length>1&&T[T.length-1]==="h";if(T.length===1||(T.length===2&&X)){if(W.getElementById){N=W.getElementById(T[0])}else{if(W.querySelector){N=W.querySelector("#"+T[0])}else{N=null}}}else{for(P=0,O=-1,V=N.childNodes.length;P<V;P+=1){if(N.childNodes[P].nodeType===1&&L.getTagName(N.childNodes[P])===T[0].toLowerCase()){O+=1;if(O===T[1]){N=N.childNodes[P];break}}}if(O!==T[1]){return null}}if(!N){return null}if(X){if(Q<R-1){if(!N.shadowRoot){return null}N=N.shadowRoot;W=N}}M=L.getTagName(N);if(M==="frame"||M==="iframe"){N=L.getIFrameWindow(N).document;W=N}}return(N===W||!N)?null:N};function l(M,N){this.x=Math.round(M||0);this.y=Math.round(N||0)}function a(N,M){this.width=Math.round(N||0);this.height=Math.round(M||0)}function d(N,O){var Q,M,P;O=x(N);Q=this.examineID(O);M=y(O);P=this.examinePosition(N,O);this.element=O;this.id=Q.id;this.idType=Q.idType;this.type=M.type;this.subType=M.subType;this.state=this.examineState(O);this.position=new l(P.x,P.y);this.position.relXY=P.relXY;this.size=new a(P.width,P.height);this.xPath=Q.xPath;this.name=Q.name}d.HTML_ID=-1;d.XPATH_ID=-2;d.ATTRIBUTE_ID=-3;d.prototype.examineID=function(T,O){var R={id:"",idType:0,xPath:"",name:""},N=f.length,Q,M,P=document.documentElement;if(!T){return R}R.xPath=u(T,false,false,O);R.name=T.name;try{M=typeof P.contains==="function"?P.contains(T):true;if((O||M)&&(!L.getWindow(T)||!L.isIFrameDescendant(T))){if(v(T)){R.id=T.id;R.idType=d.HTML_ID}else{if(f.length&&T.attributes){while(N){N-=1;Q=T.attributes[f[N]];if(typeof Q!=="undefined"){R.id=f[N]+"="+(Q.value||Q);R.idType=d.ATTRIBUTE_ID}}}}}}catch(S){}if(!R.id){R.id=R.xPath;if(R.id!=="null"){R.idType=d.XPATH_ID}}return R};d.prototype.examineState=function(M){return L.getTargetState(M)};function E(){var N=1,O,Q,M;if(document.body.getBoundingClientRect){try{O=document.body.getBoundingClientRect()}catch(P){return N}Q=O.right-O.left;M=document.body.offsetWidth;N=Math.round((Q/M)*100)/100}return N}function n(N){var P,M,O,R;if(!N||!N.getBoundingClientRect){return{x:0,y:0,width:0,height:0}}try{P=N.getBoundingClientRect();R=K(document)}catch(Q){return{x:0,y:0,width:0,height:0}}M={x:P.left+R.left,y:P.top+R.top,width:P.right-P.left,height:P.bottom-P.top};if(L.isIE){M.x-=document.documentElement.clientLeft;M.y-=document.documentElement.clientTop;O=E();if(O!==1){M.x=Math.round(M.x/O);M.y=Math.round(M.y/O);M.width=Math.round(M.width/O);M.height=Math.round(M.height/O)}}return M}d.prototype.examinePosition=function(N,O){var P=I(N),M=n(O);M.x=(P.x||P.y)?Math.round(Math.abs(P.x-M.x)):M.width/2;M.y=(P.x||P.y)?Math.round(Math.abs(P.y-M.y)):M.height/2;M.relXY=L.calculateRelativeXY(M);return M};function H(){var M=(typeof window.orientation==="number")?window.orientation:0;if(L.isLandscapeZeroDegrees){if(Math.abs(M)===180||Math.abs(M)===0){M=90}else{if(Math.abs(M)===90){M=0}}}return M}function B(S){var P,M,R,Q,O,N;if(S){return S}R=r.getCoreConfig()||{};O=R.modules;S={};for(N in O){if(O.hasOwnProperty(N)&&O[N].events){for(P=0,M=O[N].events.length;P<M;P+=1){Q=O[N].events[P];if(Q.state){S[Q.name]=Q.state}}}}return S}function i(M){var N;g=B(g);if(g[M.type]){N=L.getValue(M,g[M.type],null)}return N}function k(N){var P,M,O;this.data=N.data||null;this.delegateTarget=N.delegateTarget||null;if(N.gesture||(N.originalEvent&&N.originalEvent.gesture)){this.gesture=N.gesture||N.originalEvent.gesture;this.gesture.idType=(new d(this.gesture,this.gesture.target)).idType}N=t(N);P=I(N);this.custom=false;this.nativeEvent=this.custom===true?null:N;this.position=new l(P.x,P.y);this.target=new d(N,N.target);this.orientation=H();O=i(N);if(O){this.target.state=O}this.timestamp=(new Date()).getTime();M=o(N,this.target);this.type=M.type;this.subType=M.subType}function D(M){if(r.isInitialized()){r._publishEvent(new k(M))}else{}}function z(S,R){var Q="",O=[],N,M="",P=[];if(!(this instanceof z)){return null}if(typeof S!=="object"||!S.nodeType){this.fullXpath="";this.xpath="";this.fullXpathList=[];this.xpathList=[];return}if(S.nodeType===3){S=S.parentElement}P=q(S,false,R);N=P[0];if(P.length&&(N.length===1||(N.length===2&&N[1]==="h"))){O=q(S,true,R)}else{O=L.clone(P)}this.xpath=C(P);this.xpathList=P;this.fullXpath=C(O);this.fullXpathList=O;this.applyPrefix=function(V){var T,U;if(!(V instanceof z)||!V.fullXpathList.length){return}U=V.fullXpathList[V.fullXpathList.length-1];T=this.fullXpathList.shift();if(L.isEqual(T[0],U[0])){this.fullXpathList=V.fullXpathList.concat(this.fullXpathList)}else{this.fullXpathList.unshift(T);return}this.fullXpath=C(this.fullXpathList);T=this.xpathList.shift();if(T.length===1){this.xpathList.unshift(T);return}this.xpathList=V.xpathList.concat(this.xpathList);this.xpath=C(this.xpathList)};this.compare=function(T){if(!(T instanceof z)){return 0}return(this.fullXpathList.length-T.fullXpathList.length)};this.isSame=function(T){var U=false;if(!(T instanceof z)){return U}if(this.compare(T)===0){U=(this.fullXpath===T.fullXpath)}return U};this.containedIn=function(V,U){var X,W,T,Y;if(!(V instanceof z)){return false}if(V.fullXpathList.length>this.fullXpathList.length){return false}for(X=0,T=V.fullXpathList.length;X<T;X+=1){if(!L.isEqual(V.fullXpathList[X],this.fullXpathList[X])){return false}}if(!U){for(W=X,T=this.fullXpathList.length;W<T;W+=1){Y=this.fullXpathList[W];if(Y[Y.length-1]==="h"){return false}}}return true}}z.prototype=(function(){return{}}());return{init:function(){if(!F){b()}else{}},destroy:function(){G()},WebEvent:k,ElementData:d,Xpath:z,processDOMEvent:D,getNormalizedOrientation:H,getXPathFromNode:function(N,P,M,Q,O){return u(P,M,Q,O)},getNodeFromID:c,queryDom:p}});TLT.addService("browser",function(d){var m=d.utils,h=d.getService("config"),f=d.getService("browserBase"),n=d.getService("ajax"),g=null,c=null,k=h?h.getServiceConfig("browser"):{},b=m.getValue(k,"useCapture",true),l=false,e={NO_QUERY_SELECTOR:"NOQUERYSELECTOR"},p=function(q){return function(s){var r=new f.WebEvent(s);if(s.type==="resize"||s.type==="hashchange"){setTimeout(function(){q(r)},5)}else{q(r)}}},a={list2Array:function(s){var r=s.length,q=[],t;if(typeof s.length==="undefined"){return[s]}for(t=0;t<r;t+=1){q[t]=s[t]}return q},find:function(s,r,q){q=q||"css";return this.list2Array(this[q](s,r))},css:function(r,u){var v=this,y=null,w=document.getElementsByTagName("body")[0],x=k.jQueryObject?m.access(k.jQueryObject):window.jQuery,t=k.sizzleObject?m.access(k.sizzleObject):window.Sizzle;if(typeof document.querySelectorAll==="undefined"){v.css=function(A,z){z=z||document;return v.Sizzle(A,z)};if(typeof v.Sizzle==="undefined"){try{if(w===t("html > body",document)[0]){v.Sizzle=t}}catch(s){try{if(w===x(document).find("html > body").get()[0]){v.Sizzle=function(A,z){return x(z).find(A).get()}}}catch(q){d.fail("Neither querySelectorAll nor Sizzle was found.",e.NO_QUERY_SELECTOR)}}}}else{v.css=function(A,z){z=z||document;return z.querySelectorAll(A)}}return v.css(r,u)}},o=(function(){var q=new m.WeakMap();return{add:function(r){var s=q.get(r)||[p(r),0];s[1]+=1;q.set(r,s);return s[0]},find:function(r){var s=q.get(r);return s?s[0]:null},remove:function(r){var s=q.get(r);if(s){s[1]-=1;if(s[1]<=0){q.remove(r)}}}}}());function j(){var r=k.jQueryObject?m.access(k.jQueryObject):window.jQuery,q=k.sizzleObject?m.access(k.sizzleObject):window.Sizzle;if(!document.querySelectorAll&&!r&&!q){d.fail("querySelectorAll does not exist!",e.NO_QUERY_SELECTOR)}}function i(){a.xpath=f.queryDom.xpath;j();if(typeof document.addEventListener==="function"){g=function(s,q,r){s.addEventListener(q,r,b)};c=function(s,q,r){s.removeEventListener(q,r,b)}}else{if(typeof document.attachEvent!=="undefined"){g=function(s,q,r){s.attachEvent("on"+q,r)};c=function(s,q,r){s.detachEvent("on"+q,r)}}else{throw new Error("Unsupported browser")}}l=true}return{init:function(){if(!l){i()}else{}},destroy:function(){l=false},getServiceName:function(){return"W3C"},query:function(t,r,q){try{return a.find(t,r,q)[0]||null}catch(s){return[]}},queryAll:function(t,r,q){try{return a.find(t,r,q)}catch(s){return[]}},subscribe:function(q,t,r){var s=o.add(r);g(t,q,s)},unsubscribe:function(q,u,r){var s=o.find(r);if(s){try{c(u,q,s)}catch(t){}o.remove(r)}}}});TLT.addService("ajax",function(e){var k=e.utils,i,m=false,b=false,j=false;function g(p){var o="",n=[];for(o in p){if(p.hasOwnProperty(o)){n.push([o,p[o]])}}return n}function h(p){var o="",n="?";for(o in p){if(p.hasOwnProperty(o)){n+=encodeURIComponent(o)+"="+encodeURIComponent(p[o])+"&"}}return n.slice(0,-1)}function l(n){var p,q=false,o=h(n.headers);if(typeof n.data==="string"){p=n.data}else{p=n.data?new Uint8Array(n.data):""}q=navigator.sendBeacon(n.url+o,p);return q}function f(o){var q=o.headers||{},p=o.id||0,n=o.oncomplete||function(){};q["X-Requested-With"]="fetch";window.fetch(o.url,{method:o.type,headers:q,body:o.data,mode:"cors",cache:"no-store"}).then(function(s){var r={success:s.ok,statusCode:s.status,statusText:s.statusText,id:p};if(r.success){s.json().then(function(t){r.data=t;n(r)})["catch"](function(t){r.statusCode=1;r.statusText=t.message;n(r)})}})["catch"](function(s){var r={success:false,statusCode:2,statusText:s.message,id:p};n(r)})}function a(o){if(typeof o!=="function"){return}return function n(q){var s,p,r=false;if(!q){return}s=q.target;if(!s){return o(q)}p=s.status;if(p>=200&&p<300){r=true}o({headers:k.extractResponseHeaders(s.getAllResponseHeaders()),responseText:s.responseText,statusCode:p,statusText:s.statusText,id:s.id,success:r})}}function d(v){var u=i(),o=[["X-Requested-With","XMLHttpRequest"]],t=0,p=typeof v.async!=="boolean"?true:v.async,r="",s=null,q,n;if(v.headers){o=o.concat(g(v.headers))}if(v.contentType){o.push(["Content-Type",v.contentType])}u.open(v.type.toUpperCase(),v.url,p);for(q=0,n=o.length;q<n;q+=1){r=o[q];if(r[0]&&r[1]){u.setRequestHeader(r[0],r[1])}}if(v.error){v.error=a(v.error);u.addEventListener("error",v.error)}u.onreadystatechange=s=function(){if(u.readyState===4){u.onreadystatechange=s=function(){};if(v.timeout){window.clearTimeout(t)}v.oncomplete({id:v.id,headers:k.extractResponseHeaders(u.getAllResponseHeaders()),responseText:(u.responseText||null),statusCode:u.status,statusText:u.statusText,success:(u.status>=200&&u.status<300)});u=null}};u.send(v.data||null);s();if(v.timeout){t=window.setTimeout(function(){if(!u){return}u.onreadystatechange=function(){};if(u.readyState!==4){u.abort();if(typeof v.error==="function"){v.error({id:v.id,statusCode:u.status,statusText:"timeout",success:false})}}v.oncomplete({id:v.id,headers:k.extractResponseHeaders(u.getAllResponseHeaders()),responseText:(u.responseText||null),statusCode:u.status,statusText:"timeout",success:false});u=null},v.timeout)}}function c(){var n=e.getServiceConfig("queue");if(typeof window.XMLHttpRequest!=="undefined"){i=function(){return new XMLHttpRequest()}}else{i=function(){return new ActiveXObject("Microsoft.XMLHTTP")}}if(n){m=k.getValue(n,"useBeacon",true)&&(typeof navigator.sendBeacon==="function");b=k.getValue(n,"useFetch",true)&&(typeof window.fetch==="function")}j=true}return{init:function(){if(!j){c()}},destroy:function(){j=false},sendRequest:function(n){var p=e.getState()==="unloading",q=true,o;n.type=n.type||"POST";if((p||!n.async)&&m){q=false;o=l(n);if(!o){q=true}}if(q){if(n.async&&b&&!n.timeout){f(n)}else{d(n)}}}}});TLT.addService("domCapture",function(B){var j=B.getService("config"),k=B.getService("browserBase"),d=B.getService("browser"),x,i,g={maxMutations:100,maxLength:1000000,captureShadowDOM:false,captureFrames:false,removeScripts:true,removeComments:true},Z={childList:true,attributes:true,attributeOldValue:true,characterData:true,subtree:true},a=(typeof window.MutationObserver!=="undefined"),z,J=Z,Q=[],L=[],y=[],aa=[],w=[],A=0,H=100,c=false,r=false,R=false,K=1,t=function(){},v=function(){},D=function(){},M=B._publishEvent,ae=B.utils;function I(){aa=[];w=[];A=0;c=false}function V(ai){var ah,ag,af;if(!ai||!ai.length){return}ai=ai.sort(function(ak,aj){return ak.compare(aj)});for(ah=0;ah<ai.length;ah+=1){af=ai[ah];for(ag=ah+1;ag<ai.length;ag+=0){if(ai[ag].containedIn(af)){ai.splice(ag,1)}else{ag+=1}}}}function s(ah){var ag,af;if(!ah){return ah}for(ag=0,af=ah.length;ag<af;ag+=1){delete ah[ag].oldValue}return ah}function e(aj,ah){var ag,af,ai=false;if(!aj||!ah){return ai}for(ag=0,af=aj.length;ag<af;ag+=1){if(aj[ag].name===ah){ai=true;break}}return ai}function C(ai,ak){var ah,ag,af,aj;for(ah=0,ag=ai.length,aj=false;ah<ag;ah+=1){af=ai[ah];if(af.name===ak.name){if(af.oldValue===ak.value){ai.splice(ah,1)}else{af.value=ak.value}aj=true;break}}if(!aj){ai.push(ak)}return ai}function P(ak,af){var aj,ah,ag,al,an,am,ai;ak.removedNodes=af.removedNodes.length;ak.addedNodes=ae.convertToArray(af.addedNodes);for(aj=0,al=aa.length;aj<al;aj+=1){am=aa[aj];if(ak.isSame(am)){if(ak.removedNodes){for(ah=0;ah<af.removedNodes.length;ah+=1){ag=am.addedNodes.indexOf(af.removedNodes[ah]);if(ag!==-1){am.addedNodes.splice(ag,1);ak.removedNodes-=1}}}am.removedNodes+=ak.removedNodes;am.addedNodes.concat(ak.addedNodes);if(!am.removedNodes&&!am.addedNodes.length){ai=false;for(ah=0;ah<aa.length;ah+=1){if(am!==aa[ah]&&aa[ah].containedIn(am)){ai=true;break}}if(!ai){aa.splice(aj,1)}}an=true;break}}if(!an){aa.push(ak)}}function W(ag,ak){var ai,ah,af,al=false,aj,am;for(ai=0,af=aa.length;!al&&ai<af;ai+=1){am=aa[ai];if(ag.containedIn(am)){aj=am.addedNodes;for(ah=0;ah<aj.length;ah+=1){if(aj[ah].contains&&aj[ah].contains(ak)){al=true;break}}}}return al}function G(ah,ag){var ak,af,aj,ai,al,am=null;aj=ag.attributeName;if(aj==="checked"||aj==="selected"){am=k.ElementData.prototype.examineID(ag.target);if(x.isPrivacyMatched(am)){return}am=null}if(aj==="value"){am=k.ElementData.prototype.examineID(ag.target);am.currState=ae.getTargetState(ag.target)||{};if(am.currState.value){x.applyPrivacyToTarget(am)}else{am=null}}ah.attributes=[{name:aj,oldValue:ag.oldValue,value:am?am.currState.value:ag.target.getAttribute(aj)}];ai=ah.attributes[0];if(ai.oldValue===ai.value){return}for(ak=0,af=w.length,al=false;ak<af;ak+=1){am=w[ak];if(ah.isSame(am)){am.attributes=C(am.attributes,ai);if(!am.attributes.length){w.splice(ak,1)}else{if(W(ah,ag.target)){w.splice(ak,1)}}al=true;break}}if(!al&&!W(ah,ag.target)){w.push(ah)}}function o(ai){var ak,af,aj,ag,ah;if(!ai||!ai.length){return}A+=ai.length;if(A>=H){if(!c){c=true}return}for(ak=0,af=ai.length;ak<af;ak+=1){ag=ai[ak];ah=new k.Xpath(ag.target);if(ah){aj=ah.fullXpathList;if(aj.length&&aj[0][0]==="html"){switch(ag.type){case"characterData":case"childList":P(ah,ag);break;case"attributes":G(ah,ag);break;default:ae.clog("Unknown mutation type: "+ag.type);break}}}}}function u(){var af;af=new window.MutationObserver(function(ag){if(ag){o(ag);ae.clog("Processed ["+ag.length+"] mutation records.")}});return af}function l(ah){var aj,af,ai,am,al,ag,ak=j.getCoreConfig();j.subscribe("configupdated",D);x=B.getService("message");i=ah;i.options=ae.mixin({},g,i.options);a=a&&ae.getValue(i,"diffEnabled",true);H=ae.getValue(i.options,"maxMutations",100);if(a){J=ae.getValue(i,"diffObserverConfig",Z);z=u();Q.push(window)}ag=i.options.captureShadowDOM=false;if(ag&&(Element.prototype.attachShadow||"").toString().indexOf("[native code]")<0){i.options.captureShadowDOM=false}if(ag){for(ai in ak.modules){if(ak.modules.hasOwnProperty(ai)){al=ak.modules[ai].events||[];for(aj=0,af=al.length;aj<af;aj+=1){if(al[aj].attachToShadows){am=al[aj].name;if(ae.indexOf(y,am)===-1){y.push(am)}}}}}}R=true}function U(){j.unsubscribe("configupdated",D);if(z){z.disconnect()}R=false}function p(){var af;af="tlt-"+ae.getSerialNumber();return af}function h(al,aj,ak){var ai,ah,am,ag,af;if(!al||!al.getElementsByTagName||!aj){return}if(ak&&ak.length===2){ah=ak[0];am=ak[1]}ag=al.getElementsByTagName(aj);if(ag&&ag.length){for(ai=ag.length-1;ai>=0;ai-=1){af=ag[ai];if(!ah){af.parentNode.removeChild(af)}else{if(af[ah]===am){af.parentNode.removeChild(af)}}}}return al}function O(ah,af){var ag,ai;for(ag=0;ah.hasChildNodes()&&ag<ah.childNodes.length;ag+=1){ai=ah.childNodes[ag];if(ai.nodeType===af){ah.removeChild(ai);ag-=1}else{if(ai.hasChildNodes()){O(ai,af)}}}return ah}function Y(ah){var ai,ag,af=null;if(!ah){return af}switch(ah.nodeType){case 1:ai=ah.ownerDocument;if(ai&&ai.documentElement===ah){ag=ai.doctype}break;case 9:ag=ah.doctype;break;default:break}if(ag){af="<!DOCTYPE "+ag.name+(ag.publicId?' PUBLIC "'+ag.publicId+'"':"")+(!ag.publicId&&ag.systemId?" SYSTEM":"")+(ag.systemId?' "'+ag.systemId+'"':"")+">"}return af}function X(al,am){var ak,ah,aj,ai,ag,af;if(!am){return}ai=al.getElementsByTagName("input");ag=am.getElementsByTagName("input");if(ag){for(ak=0,af=ag.length;ak<af;ak+=1){ah=ai[ak];aj=ag[ak];switch(aj.type){case"checkbox":case"radio":if(ae.isIE?ah.checked:aj.checked){aj.setAttribute("checked","checked")}else{aj.removeAttribute("checked")}break;default:aj.setAttribute("value",aj.value);if(!aj.getAttribute("type")){aj.setAttribute("type","text")}break}}}}function m(al,am){var ai,af,ak,ag,ah,aj;if(!al||!al.getElementsByTagName||!am||!am.getElementsByTagName){return}ag=al.getElementsByTagName("textarea");aj=am.getElementsByTagName("textarea");if(ag&&aj){for(ai=0,af=ag.length;ai<af;ai+=1){ak=ag[ai];ah=aj[ai];ah.setAttribute("value",ak.value);ah.value=ah.textContent=ak.value}}}function S(af,ak){var ag,am,al,an,ai,ah,aj;if(!af||!af.getElementsByTagName||!ak||!ak.getElementsByTagName){return}am=af.getElementsByTagName("select");an=ak.getElementsByTagName("select");if(am){for(ai=0,aj=am.length;ai<aj;ai+=1){ag=am[ai];al=an[ai];for(ah=0;ah<ag.options.length;ah+=1){if(ah===ag.selectedIndex||ag.options[ah].selected){al.options[ah].setAttribute("selected","selected")}else{al.options[ah].removeAttribute("selected")}}}}}function E(ag){var af,ah=null;if(ag){af=ag.nodeType||-1;switch(af){case 11:ah=ag.innerHTML;break;case 9:ah=ag.documentElement?ag.documentElement.outerHTML:"";break;case 1:ah=ag.outerHTML;break;default:ah=null;break}}return ah}function ad(ah){var af,ag=false;if(ah&&typeof ah==="object"){af=ah.nodeType||-1;switch(af){case 9:case 1:ag=true;break;default:ag=false;break}}return ag}function b(am,aw,ag){var ap,ao,aq,ax,an=["iframe","frame"],av,ah,ak,au,ai,at,aj={frames:[]},ay,al,af;for(ao=0;ao<an.length;ao+=1){ax=an[ao];ay=am.getElementsByTagName(ax);al=aw.getElementsByTagName(ax);if(ay){for(ap=0,aq=ay.length;ap<aq;ap+=1){try{av=ay[ap];ah=ae.getIFrameWindow(av);if(ah&&ah.document&&ah.location.href!=="about:blank"){ak=ah.document;au=v(ak,ak.documentElement||ak,"",ag);ai=p();al[ap].setAttribute("tltid",ai);au.tltid=ai;af=ae.getOriginAndPath(ak.location);au.host=af.origin;au.url=af.path;au.charset=ak.characterSet||ak.charset;at=al[ap].getAttribute("src");if(!at){at=ah.location.href;al[ap].setAttribute("src",at)}aj.frames=aj.frames.concat(au.frames);delete au.frames;aj.frames.push(au)}}catch(ar){}}}}return aj}function ab(ag){var ah,af,ai;ag.TLTListeners=ag.TLTListeners||{};for(ah=0,af=y.length;ah<af;ah+=1){ai=y[ah];if(!ag.TLTListeners[ai]){d.subscribe(ai,ag,M);ag.TLTListeners[ai]=true}}}function f(ag,ap,aq,aj){var ak,an,ah,al,af,ai,am={shadows:[]};if(!ag||(!aj&&!ag.children)){return am}if(aj){af=[ag]}else{af=ag.children}for(ak=0,an=af.length;ak<an;ak+=1){al=af[ak];if(al.shadowRoot){ai=new k.Xpath(al);ah=v(al.ownerDocument,al.shadowRoot,"",aq);am.shadows.push({root:ah.root,xpath:ai.xpath});am.shadows=am.shadows.concat(ah.shadows);ab(al.shadowRoot);if(a){try{z.observe(al.shadowRoot,J);al.shadowRoot.TLTListeners.mutation=true;if(ae.indexOf(L,al)===-1){L.push(al)}}catch(ao){ae.clog("Failed to observe shadow root.",ao,al)}}}ah=f(al,null,aq);am.shadows=am.shadows.concat(ah.shadows)}return am}function ac(al){var aj,ah,af,ai,ag,ak,am=0;if(!al){return am}if(al.root){am+=al.root.length;if(al.frames){for(aj=0,af=al.frames.length;aj<af;aj+=1){if(al.frames[aj].root){am+=al.frames[aj].root.length}}}}else{if(al.diffs){for(aj=0,af=al.diffs.length;aj<af;aj+=1){ak=al.diffs[aj];am+=ak.xpath.length;if(ak.root){am+=ak.root.length}else{if(ak.attributes){for(ah=0,ai=ak.attributes.length;ah<ai;ah+=1){ag=ak.attributes[ah];am+=ag.name.length;if(ag.value){am+=ag.value.length}}}}}}}return am}function T(){var ai,ah,af,ag;for(ai=0,af=aa.length;ai<af&&w.length;ai+=1){ag=aa[ai];for(ah=0;ah<w.length;ah+=1){if(w[ah].containedIn(ag)){w.splice(ah,1);ah-=1}}}}function n(ai){var ah,af,ag,aj,ak=[];if(!ai||!ai.children){return ak}aj=ai.children;for(ah=0,af=aj.length;ah<af;ah+=1){ag=aj[ah];if(ag.shadowRoot){if(!ag.shadowRoot.TLTListeners){ak.push([ag,ag.shadowRoot])}ak=ak.concat(n(ag.shadowRoot))}ak=ak.concat(n(ag))}return ak}function F(al,ah){var ai,af,aj,ak,ag;if(!al||!ah){return}if(!ah.captureShadowDOM){return}ag=n(al,ah);for(ai=0,af=ag.length,aj=[];ai<af;ai+=1){ak=f(ag[ai][0],null,ah,true);aj=aj.concat(ak.shadows)}return aj}function q(ak,ah){var al,ag,aj,ai,af;al=v(ak,ak.documentElement||ak,null,ah);if(!al){al={}}al.charset=ak.characterSet||ak.charset;ag=ae.getOriginAndPath(ak.location);al.host=ag.origin;al.url=ag.path;return al}function N(ao){var ai,ak,an={fullDOM:false,diffs:[],attributeDiffs:{}},am,aj,ag,al,af;V(aa);T();aj=ao.captureShadowDOM;ao.captureShadowDOM=false;for(ai=0,ak=aa.length;ai<ak;ai+=1){af=aa[ai];al=k.getNodeFromID(af.xpath,-2);if(al===window.document.body){ao.captureShadowDOM=aj;return q(window.document,ao)}am=v(window.document,al,af,ao);if(am.shadows&&am.shadows.length===0){delete am.shadows}if(am.frames&&am.frames.length===0){delete am.frames}am.xpath=af.xpath;an.diffs.push(am)}function ah(aq,ap){if(!aq||!aq.name){return}an.attributeDiffs[am.xpath][aq.name]={value:aq.value}}for(ai=0,ak=w.length;ai<ak;ai+=1){af=w[ai];am={xpath:e(af.attributes,"id")?af.fullXpath:af.xpath,attributes:s(af.attributes)};an.diffs.push(am);an.attributeDiffs[am.xpath]={};ae.forEach(am.attributes,ah)}ao.captureShadowDOM=aj;ag=F(window.document,ao);if(ag&&ag.length){an.shadows=ag}return an}t=function(af){var ag=null;if(ad(af)){ag=af.cloneNode(true);if(!ag&&af.documentElement){ag=af.documentElement.cloneNode(true)}}return ag};v=function(ao,am,ak,ap){var ah=true,af,ag,an,aj={},al,ai;if(!ao||!am){return aj}af=t(am,ao);if(!af&&am.host){ah=false}else{if(!af){return aj}}if(ah){if(!!ap.removeScripts){h(af,"script");h(af,"noscript")}if(!ap.keepImports){h(af,"link",["rel","import"])}if(!!ap.removeComments){O(af,8)}S(am,af);X(am,af);m(am,af);af=x.applyPrivacyToNode(af,ak,ao);if(!!ap.captureFrames){ag=b(am,af,ap)}}if(0&&!!ap.captureShadowDOM){an=f(am,af,ap)}if(ag){aj=ae.mixin(aj,ag)}if(an){aj=ae.mixin(aj,an)}al=(Y(am)||"")+E(af||am);aj.root=x.applyPrivacyPatterns(al);return aj};D=function(){j=B.getService("config");l(j.getServiceConfig("domCapture")||{})};return{init:function(){j=B.getService("config");if(!R){l(j.getServiceConfig("domCapture")||{})}else{}},destroy:function(){U()},observeWindow:function(ah){var ag,af;if(!ah){return}if(!ae.getValue(i,"options.captureFrames",false)&&!(ah===window)){return}if(ae.indexOf(Q,ah)===-1){Q.push(ah)}},captureDOM:function(ag,ah){var ai,af,al=null,aj,am=0;if(!R||(ae.isIE&&document.documentMode<10)){return al}ah=ae.mixin({},i.options,ah);ag=ag||window.document;if(!r||!a||c||ah.forceFullDOM){if(z){z.disconnect()}al=q(ag,ah);al.fullDOM=true;al.forced=!!(c||ah.forceFullDOM);r=true;if(z){for(ai=0,af=Q.length;ai<af;ai+=1){aj=Q[ai];try{z.observe(aj.document,J)}catch(ak){Q.splice(ai,1);af=Q.length;ai-=1}}}}else{al=N(ah);al.fullDOM=al.diffs?false:true}if(a){al.mutationCount=A}I();if(ah.maxLength){am=ac(al);if(am>ah.maxLength){al={errorCode:101,error:"Captured length ("+am+") exceeded limit ("+ah.maxLength+")."}}}return al}}});TLT.addService("encoder",function(a){var f={},g=null,b=null,d=false;function e(j){var i=null;if(!j){return i}i=f[j];if(i&&typeof i.encode==="string"){i.encode=a.utils.access(i.encode)}return i}function h(i){f=i;g.subscribe("configupdated",b);d=true}function c(){g.unsubscribe("configupdated",b);d=false}b=function(){g=a.getService("config");h(g.getServiceConfig("encoder")||{})};return{init:function(){g=a.getService("config");if(!d){h(g.getServiceConfig("encoder")||{})}else{}},destroy:function(){c()},encode:function(m,l){var k,i,j={data:null,encoding:null,error:null};if((typeof m!=="string"&&!m)||!l){j.error="Invalid "+(!m?"data":"type")+" parameter.";return j}k=e(l);if(!k){j.error="Specified encoder ("+l+") not found.";return j}if(typeof k.encode!=="function"){j.error="Configured encoder ("+l+") encode method is not a function.";return j}try{i=k.encode(m)}catch(n){j.error="Encoding failed: "+(n.name?n.name+" - ":"")+n.message;return j}if(!i||a.utils.getValue(i,"buffer",null)===null){j.error="Encoder ("+l+") returned an invalid result.";return j}j.data=i.buffer;j.encoding=k.defaultEncoding;return j}}});TLT.addService("message",function(v){var Q=v.utils,q=0,s=0,I=0,j=0,r=new Date(),i=v.getService("browserBase"),b=v.getService("browser"),h=v.getService("config"),A=h.getServiceConfig("message")||{},m=v.normalizeUrl(window.location.href),N=window.location.hostname,R=A.hasOwnProperty("privacy")?A.privacy:[],c,E={},O={lower:"x",upper:"X",numeric:"9",symbol:"@"},f=parseFloat((window.devicePixelRatio||1).toFixed(2)),g=window.screen||{},a=g.width||0,y=g.height||0,P=i.getNormalizedOrientation(),k=!Q.isiOS?a:Math.abs(P)===90?y:a,D=!Q.isiOS?y:Math.abs(P)===90?a:y,L=(window.screen?window.screen.height-window.screen.availHeight:0),K=window.innerWidth||document.documentElement.clientWidth,n=window.innerHeight||document.documentElement.clientHeight,H=false,x={};function e(T){var S="",U=T.timestamp||(new Date()).getTime();delete T.timestamp;this.type=T.type;this.offset=U-r.getTime();this.screenviewOffset=0;if(T.type===2){q=s;s=U;if(T.screenview.type==="UNLOAD"){this.screenviewOffset=U-(q||r.getTime())}}else{if(s){this.screenviewOffset=U-s}}if(!this.type){return}this.count=(j+=1);this.fromWeb=true;for(S in T){if(T.hasOwnProperty(S)){this[S]=T[S]}}}E.PVC_MASK_EMPTY=function(S){return""};E.PVC_MASK_BASIC=function(T){var S="XXXXX";if(typeof T!=="string"){return""}return(T.length?S:"")};E.PVC_MASK_TYPE=function(W){var T,V=0,S=0,U="";if(typeof W!=="string"){return U}T=W.split("");for(V=0,S=T.length;V<S;V+=1){if(Q.isNumeric(T[V])){U+=O.numeric}else{if(Q.isUpperCase(T[V])){U+=O.upper}else{if(Q.isLowerCase(T[V])){U+=O.lower}else{U+=O.symbol}}}}return U};E.PVC_MASK_EMPTY.maskType=1;E.PVC_MASK_BASIC.maskType=2;E.PVC_MASK_TYPE.maskType=3;E.PVC_MASK_CUSTOM={maskType:4};function d(S,U){var T=E.PVC_MASK_BASIC;if(typeof U!=="string"){return U}if(!S){T=E.PVC_MASK_BASIC}else{if(S.maskType===E.PVC_MASK_EMPTY.maskType){T=E.PVC_MASK_EMPTY}else{if(S.maskType===E.PVC_MASK_BASIC.maskType){T=E.PVC_MASK_BASIC}else{if(S.maskType===E.PVC_MASK_TYPE.maskType){T=E.PVC_MASK_TYPE}else{if(S.maskType===E.PVC_MASK_CUSTOM.maskType){if(typeof S.maskFunction==="string"){T=Q.access(S.maskFunction)}else{T=S.maskFunction}if(typeof T!=="function"){T=E.PVC_MASK_BASIC}}}}}}return T(U)}function C(S,T){var U;if(!S||!T){return}for(U in T){if(T.hasOwnProperty(U)){if(U==="value"){T[U]=d(S,T[U])}else{delete T[U]}}}}function M(S,T){return(Q.matchTarget(S,T)!==-1)}function G(X){var T,S,U,W,V;if(!X){return""}for(T=0,S=c.length;T<S;T+=1){V=c[T];V.cRegex.lastIndex=0;X=X.replace(V.cRegex,V.replacement)}return X}function F(Z){var W,S,V,T,Y=false,X,U;if(!Z||(!Z.currState&&!Z.prevState)){return Z}X=Z.prevState;U=Z.currState;for(W=0,S=R.length;W<S;W+=1){T=R[W];V=Q.getValue(T,"exclude",false);if(M(T.targets,Z)!==V){C(T,X);C(T,U);Y=true;break}}if(!Y){if(X&&X.value){X.value=G(X.value)}if(U&&U.value){U.value=G(U.value)}}return Z}function o(S){if(!S||!S.target){return S}F(S.target);return S}function l(V,T){var U,S,X,W;if(!T||!V){return}if(V.value){X=d(T,V.value);V.setAttribute("value",X);V.value=X}if(V.checked){V.removeAttribute("checked")}if(Q.getTagName(V)==="select"){V.selectedIndex=-1;for(U=0,S=V.options.length;U<S;U+=1){W=V.options[U];W.removeAttribute("selected");W.selected=false}}else{if(Q.getTagName(V)==="textarea"){V.textContent=V.value}}}function u(ae,ab,af,ak,X,aa){var ag,ad,ac,ah,U,V,Z=[],ai,S,Y,W,aj,T;if(!ae.length&&!X.length&&!aa){return[]}T=b.queryAll("input, select, textarea",ab);if(!T||!T.length){return[]}for(ag=0,ah=X.length;ag<ah;ag+=1){ad=T.indexOf(X[ag]);if(ad!==-1){T.splice(ad,1)}}if(ae.length){for(ag=0,ah=T.length,Z=[];ag<ah;ag+=1){if(T[ag].value){V=i.ElementData.prototype.examineID(T[ag],true);if(V.idType===-2){ai=new i.Xpath(T[ag],true);ai.applyPrefix(af);V.id=ai.xpath}Z.push({id:V.id,idType:V.idType,element:T[ag]})}}}for(ag=0,ah=ae.length;ag<ah;ag+=1){W=R[ae[ag].ruleIndex];S=Q.getValue(W,"exclude",false);aj=W.targets[ae[ag].targetIndex];if(typeof aj.id==="string"&&aj.idType===-2){for(ad=0;ad<Z.length;ad+=1){if(Z[ad].idType===aj.idType&&Z[ad].id===aj.id){if(!S){U=Z[ad].element;l(U,W)}else{ac=T.indexOf(U);T.splice(ac,1)}}}}else{for(ad=0;ad<Z.length;ad+=1){aj.cRegex.lastIndex=0;if(Z[ad].idType===aj.idType&&aj.cRegex.test(Z[ad].id)){U=Z[ad].element;if(!S){l(U,W)}else{ac=T.indexOf(U);T.splice(ac,1)}}}}}if(aa){for(ag=0,ah=T.length;ag<ah;ag+=1){l(T[ag],aa)}}}function p(Z,ae,ak){var af,ab,aa,U,S,V=[],Y,ag,ac,W,T,ah,ad=[],aj,ai,X;if(!Z||!ak){return null}for(af=0,ag=R.length;af<ag;af+=1){ac=R[af];S=Q.getValue(ac,"exclude",false);if(S){Y=ac}ai=ac.targets;for(ab=0,X=ai.length;ab<X;ab+=1){aj=ai[ab];if(typeof aj==="string"){T=b.queryAll(aj,Z);if(!S){for(aa=0,ah=T.length;aa<ah;aa+=1){U=T[aa];l(U,ac)}}else{V=V.concat(T)}}else{if(typeof aj.id==="string"){switch(aj.idType){case -1:case -3:U=i.getNodeFromID(aj.id,aj.idType,Z);if(!S){l(U,ac)}else{V.push(U)}break;case -2:ad.push({ruleIndex:af,targetIndex:ab,exclude:S});break;default:break}}else{ad.push({ruleIndex:af,targetIndex:ab,exclude:S})}}}}u(ad,Z,ae,ak,V,Y);return Z}function t(W){var U,S,T,V=false;if(!W){return V}for(U=0,S=R.length;U<S;U+=1){T=R[U];if(M(T.targets,W)){V=true;break}}return V}function w(){var V,U,S,Y,Z,X,T,W;h=v.getService("config");A=h.getServiceConfig("message")||{};R=A.privacy||[];c=A.privacyPatterns||[];for(V=0,Z=R.length;V<Z;V+=1){Y=R[V];T=Y.targets;for(U=0,W=T.length;U<W;U+=1){X=T[U];if(typeof X==="object"){if(typeof X.idType==="string"){X.idType=+X.idType}if(typeof X.id==="object"){X.cRegex=new RegExp(X.id.regex,X.id.flags)}}}}for(S=c.length,V=S-1;V>=0;V-=1){Y=c[V];if(typeof Y.pattern==="object"){Y.cRegex=new RegExp(Y.pattern.regex,Y.pattern.flags)}else{c.splice(V,1)}}}function z(){if(h.subscribe){h.subscribe("configupdated",w)}w();H=true}function J(){h.unsubscribe("configupdated",w);H=false}function B(aa){var X=aa.dcid,U=aa.shadows||[],W=aa.fullDOM,ab=1,V,Y,Z,T,S;if(U.length===0||!W){return}for(Z in x){if(x.hasOwnProperty(Z)){x[Z].age+=1}}for(V=0,Y=U.length;V<Y;V+=1){T=U[V];S=x[T.xpath];if(S&&S.root===T.root){S.hitCount+=1;S.age-=1;T.cacheDCID=S.dcid;delete T.root}else{x[T.xpath]={root:T.root,dcid:X,hitCount:0,age:0}}}for(Z in x){if(x.hasOwnProperty(Z)){S=x[Z];if(S.age>S.hitCount+ab){delete x[Z]}}}}return{init:function(){if(!H){z()}else{}},destroy:function(){J()},applyPrivacyToNode:p,applyPrivacyToMessage:o,applyPrivacyToTarget:F,applyPrivacyPatterns:G,isPrivacyMatched:t,createMessage:function(S){if(typeof S.type==="undefined"){throw new TypeError("Invalid queueEvent given!")}if(S.type===12){B(S.domCapture)}return o(new e(S))},wrapMessages:function(T){var S={messageVersion:"10.0.0.0",serialNumber:(I+=1),sessions:[{id:v.getPageId(),startTime:r.getTime(),timezoneOffset:r.getTimezoneOffset(),messages:T,clientEnvironment:{webEnvironment:{libVersion:"5.6.0.1875",domain:N,page:m,referrer:document.referrer,screen:{devicePixelRatio:f,deviceWidth:k,deviceHeight:D,deviceToolbarHeight:L,width:K,height:n,orientation:P}}}}]},U=S.sessions[0].clientEnvironment.webEnvironment.screen;U.orientationMode=Q.getOrientationMode(U.orientation);return S},getSessionStart:function(){return r}}});TLT.addService("serializer",function(b){var d=b.getService("config"),j={},c={},k={json:(function(){if(typeof window.JSON!=="undefined"){return{serialize:window.JSON.stringify,parse:window.JSON.parse}}return{}}())},f=null,i=false;function e(q,o,m){var n,l,p;q=q||[];for(n=0,l=q.length;n<l;n+=1){p=q[n];if(typeof p==="string"){p=b.utils.access(p)}if(typeof p==="function"){o[m]=p;break}}}function h(){var l;if(typeof j.json!=="function"||typeof c.json!=="function"){l=true}else{if(typeof c.json('{"foo": "bar"}')==="undefined"){l=true}else{l=c.json('{"foo": "bar"}').foo!=="bar"}if(typeof c.json("[1, 2]")==="undefined"){l=true}else{l=l||c.json("[1, 2]")[0]!==1;l=l||c.json("[1,2]")[1]!==2}l=l||j.json({foo:"bar"})!=='{"foo":"bar"}';l=l||j.json([1,2])!=="[1,2]"}return l}function a(l){var m;for(m in l){if(l.hasOwnProperty(m)){e(l[m].stringifiers,j,m);e(l[m].parsers,c,m)}}j.json=j.json||k.json.serialize;c.json=c.json||k.json.parse;if(typeof j.json!=="function"||typeof c.json!=="function"){b.fail("JSON parser and/or serializer not provided in the UIC config. Can't continue.")}if(h()){b.fail("JSON stringification and parsing are not working as expected")}if(d){d.subscribe("configupdated",f)}i=true}function g(){j={};c={};if(d){d.unsubscribe("configupdated",f)}i=false}f=function(){d=b.getService("config");a(d.getServiceConfig("serializer"))};return{init:function(){var l;if(!i){l=d?d.getServiceConfig("serializer"):{};a(l)}else{}},destroy:function(){g()},parse:function(m,l){l=l||"json";return c[l](m)},serialize:function(n,m){var l;m=m||"json";l=j[m](n);return l}}});TLT.addModule("TLCookie",function(d){var i={},h=0,g="WCXSID",l="TLTSID",b="CoreID6",o,m,c=null,n,p=d.utils;function a(){var u="123456789",t=p.getRandomString(1,u)+p.getRandomString(31,u+"0");return t}function j(){var v=a(),t=!!i.secureTLTSID,u;p.setCookie(l,v,u,u,u,t);return p.getCookieValue(l)}function k(){if(c||!window.cmRetrieveUserID){return}try{window.cmRetrieveUserID(function(u){c=u})}catch(t){c=null}}function f(x){var t,u,w,v;if(!localStorage||!x){return}w=localStorage.getItem(x);if(w){u=w.split("|");t=parseInt(u[0],10);if(Date.now()>t){localStorage.removeItem(x)}else{v=u[1]}}return v}function s(v,u){var t;if(!localStorage||!v){return}u=u||a();t=Date.now()+h;localStorage.setItem(v,t+"|"+u);return f(v)}function e(t){var w=[],v=p.getValue(t,"sessionIDUsesCookie",true),u=p.getValue(t,"sessionIDUsesStorage",false);if(t.tlAppKey){n=t.tlAppKey;w.push({name:"X-Tealeaf-SaaS-AppKey",value:n})}if(t.visitorCookieName){b=t.visitorCookieName}if(t.wcxCookieName){g=t.wcxCookieName}o=p.getCookieValue(g);if(o){w.push({name:"X-WCXSID",value:o})}if(t.sessionizationCookieName){l=t.sessionizationCookieName}if(u){h=p.getValue(t,"sessionIDStorageTTL",600000);m=f(l)}if(!m&&v){m=p.getCookieValue(l)}if(!m){if(o){m=o}else{if(u){m=s(l)}if(!m&&v){m=j()}}}if(!m){m="Check7UIC7Cookie7Configuration77"}w.push({name:"X-Tealeaf-SaaS-TLTSID",value:m});if(w.length){TLT.registerBridgeCallbacks([{enabled:true,cbType:"addRequestHeaders",cbFunction:function(){return w}}])}}function q(y){var v,u,t=false,x,w=i.appCookieWhitelist;if(!w||!w.length){return t}for(v=0,u=w.length;v<u&&!t;v+=1){x=w[v];if(x.regex){if(!x.cRegex){x.cRegex=new RegExp(x.regex,x.flags)}x.cRegex.lastIndex=0;t=x.cRegex.test(y)}else{t=(x===y)}}return t}function r(){var x,w,y,z={},u,D=document.cookie,v=[],C="",t="";if(!D){return}v=D.split("; ");for(x=0,y=v.length;x<y;x+=1){u=v[x];w=u.indexOf("=");if(w>=0){try{C=decodeURIComponent(u.substr(0,w))}catch(B){C=u.substr(0,w)}}t=u.substr(w+1);if(q(C)){try{z[C]=decodeURIComponent(t)}catch(A){z[C]=t}}}if(c&&!z[b]){z[b]=c}d.post({type:14,cookies:z})}return{init:function(){i=d.getConfig()||{};e(i);k()},destroy:function(){if(i.sessionIDUsesStorage){s(l,m)}},onevent:function(t){switch(t.type){case"screenview_load":if(p.getValue(i,"appCookieWhitelist.length",0)){k();r()}break;default:break}}}});if(TLT&&typeof TLT.addModule==="function"){TLT.addModule("overstat",function(e){var A=e.utils,p={},C={updateInterval:250,hoverThreshold:1000,hoverThresholdMax:2*60*1000,gridCellMaxX:10,gridCellMaxY:10,gridCellMinWidth:20,gridCellMinHeight:20},d=50;function y(H){var I=e.getConfig()||{},J=I[H];return typeof J==="number"?J:C[H]}function G(N,H){var M=A.getValue(N,"webEvent.target",{}),I=A.getValue(M,"element.tagName")||"",J=I.toLowerCase()==="input"?A.getValue(M,"element.type"):"",L=A.getTlType(M),K={type:9,event:{hoverDuration:N.hoverDuration,hoverToClick:A.getValue(H,"hoverToClick")},target:{id:M.id||"",idType:M.idType||"",name:M.name||"",tlType:L,type:I,subType:J,position:{width:A.getValue(M,"element.offsetWidth",0),height:A.getValue(M,"element.offsetHeight",0),relXY:N.relXY}}};if((typeof K.target.id)===undefined||K.target.id===""){return}e.post(K)}function i(H){if(H&&!H.nodeType&&H.element){H=H.element}return H}function s(H){H=i(H);return !H||H===document.body||H===document.html||H===document}function j(H){H=i(H);if(!H){return null}return H.parentNode}function n(H){H=i(H);if(!H){return null}return H.offsetParent||H.parentElement||j(H)}function w(I,J){var H=0;if(!J||J===I){return false}J=j(J);while(!s(J)&&H++<d){if(J===I){return true}J=j(J)}if(H>=d){A.clog("Overstat isChildOf() hit iterations limit")}return false}function E(H){if(H.nativeEvent){H=H.nativeEvent}return H}function z(H){return E(H).target}function h(H){H=i(H);if(!H){return -1}return H.nodeType||-1}function D(H){H=i(H);if(!H){return""}return H.tagName?H.tagName.toUpperCase():""}function t(H){if(!H){return}if(H.nativeEvent){H=H.nativeEvent}if(H.stopPropagation){H.stopPropagation()}else{if(H.cancelBubble){H.cancelBubble()}}}function m(I){var H=D(I);return h(I)!==1||H==="TR"||H==="TBODY"||H==="THEAD"}function g(H){if(!H){return""}if(H.xPath){return H.xPath}H=i(H);return e.getXPathFromNode(H)}function B(I,H){var J=p[I];if(J&&J[H]){return J[H]()}}function v(I,K,J,H){this.xPath=I!==null?g(I):"";this.domNode=I;this.hoverDuration=0;this.hoverUpdateTime=0;this.gridX=Math.max(K,0);this.gridY=Math.max(J,0);this.parentKey="";this.updateTimer=-1;this.disposed=false;this.childKeys={};this.webEvent=H;this.getKey=function(){return this.xPath+":"+this.gridX+","+this.gridY};this.update=function(){var M=new Date().getTime(),L=this.getKey();if(this.hoverUpdateTime!==0){this.hoverDuration+=M-this.hoverUpdateTime}this.hoverUpdateTime=M;clearTimeout(this.updateTimer);this.updateTimer=setTimeout(function(){B(L,"update")},y("updateInterval"))};this.dispose=function(L){clearTimeout(this.updateTimer);delete p[this.getKey()];this.disposed=true;if(L){var M=this.clone();p[M.getKey()]=M;M.update()}};this.process=function(P){clearTimeout(this.updateTimer);if(this.disposed){return false}var N=false,O=this,M=null,L=0;if(this.hoverDuration>=y("hoverThreshold")){this.hoverDuration=Math.min(this.hoverDuration,y("hoverThresholdMax"));N=true;G(this,{hoverToClick:!!P});while(typeof O!=="undefined"&&L++<d){O.dispose(P);O=p[O.parentKey]}if(L>=d){A.clog("Overstat process() hit iterations limit")}}else{this.dispose(P)}return N};this.clone=function(){var L=new v(this.domNode,this.gridX,this.gridY);L.parentKey=this.parentKey;return L}}function F(J,H,K,I){return new v(J,H,K,I)}function r(J){if(J&&J.position){return{x:J.position.x,y:J.position.y}}J=i(J);var H=J&&J.getBoundingClientRect?J.getBoundingClientRect():null,N=H?H.left:(J?J.offsetLeft:0),M=H?H.top:(J?J.offsetHeight:0),P=N,O=M,K=0,I=0,L=n(J),Q=0;while(L&&Q++<d){if(s(L)){break}K=L.offsetLeft-(L.scrollLeft||0);I=L.offsetTop-(L.scrollTop||0);if(K!==P||I!==O){N+=K;M+=I;P=K;O=I}L=n(L)}if(Q>=d){A.clog("Overstat calculateNodeOffset() hit iterations limit")}if(isNaN(N)){N=0}if(isNaN(M)){M=0}return{x:N,y:M}}function a(L,J,I){L=i(L);var K=r(L),H=J-K.x,M=I-K.y;if(!isFinite(H)){H=0}if(!isFinite(M)){M=0}return{x:H,y:M}}function x(H,I){H=Math.floor(Math.min(Math.max(H,0),1)*10000)/10000;I=Math.floor(Math.min(Math.max(I,0),1)*10000)/10000;return H+","+I}function f(L,O,N){L=i(L);var J=L.getBoundingClientRect?L.getBoundingClientRect():null,T=J?J.width:L.offsetWidth,K=J?J.height:L.offsetHeight,M=T&&T>0?Math.max(T/y("gridCellMaxX"),y("gridCellMinWidth")):y("gridCellMinWidth"),Q=K&&K>0?Math.max(K/y("gridCellMaxY"),y("gridCellMinHeight")):y("gridCellMinHeight"),I=Math.min(Math.floor(O/M),y("gridCellMaxX")),H=Math.min(Math.floor(N/Q),y("gridCellMaxY")),S=T>0?O/T:0,P=K>0?N/K:0,R="";if(!isFinite(I)){I=0}if(!isFinite(H)){H=0}R=x(S,P);return{x:I,y:H,relXY:R}}function c(M){var N=M,O=M.getKey(),I={},J=null,L=null,K=false,H=0;I[O]=true;while(typeof N!=="undefined"&&H++<d){I[N.parentKey]=true;if(N.parentKey===""||N.parentKey===N.getKey()){break}if(H>=d){A.clog("Overstat cleanupHoverEvents() hit iterations limit")}N=p[N.parentKey]}for(J in p){if(p.hasOwnProperty(J)&&!I[J]){N=p[J];if(N){if(!K){K=N.process()}else{N.dispose()}}}}}function u(I,K){var L=null,H=null,J=false;for(H in p){if(p.hasOwnProperty(H)){L=p[H];if(L&&L.domNode===I&&L.getKey()!==K){if(!J){J=L.process()}else{L.dispose()}}}}}function b(L,J,K){if(!J){J=L.target}if(s(J)){return null}if(A.isiOS||A.isAndroid){return null}var H,Q,M,P,N,O,I;if(!m(J)){H=a(J,L.position.x,L.position.y);Q=f(J,H.x,H.y);M=new v(J,Q.x,Q.y,L);M.relXY=Q.relXY;P=M.getKey();if(p[P]){M=p[P]}else{p[P]=M}M.update();if(!K){I=n(J);if(I){O=b(L,I,true);if(O!==null){N=O.getKey();P=M.getKey();if(P!==N){M.parentKey=N}}}c(M)}}else{M=b(L,n(J),K)}return M}function q(H){H=E(H);if(w(H.target,H.relatedTarget)){return}u(H.target)}function l(J){var K=null,H=null,I=false;for(H in p){if(p.hasOwnProperty(H)){K=p[H];if(K){if(!I){I=K.process(true)}else{K.dispose()}}}}}function o(H){e.performFormCompletion(true)}function k(I){var H=A.getValue(I,"target.id");if(!H){return}switch(I.type){case"mousemove":b(I);break;case"mouseout":q(I);break;case"click":l(I);break;case"submit":o(I);break;default:break}}return{init:function(){},destroy:function(){var I,H;for(I in p){if(p.hasOwnProperty(I)){p[I].dispose();delete p[I]}}},onevent:function(H){if(typeof H!=="object"||!H.type){return}k(H)},onmessage:function(H){},createHoverEvent:F,cleanupHoverEvents:c,eventMap:p}})}else{}if(TLT&&typeof TLT.addModule==="function"){TLT.addModule("performance",function(a){var g={loadReceived:false,unloadReceived:false,perfEventSent:false},e=0,c,h=a.utils;function f(l,k){if(typeof l!=="string"){return false}if(!k||typeof k!=="object"){return false}return(k[l]===true)}function b(m,k){var o=0,l={},p="",n=0;if(!m||typeof m!=="object"||!m.navigationStart){return{}}o=m.navigationStart;for(p in m){if(Object.prototype.hasOwnProperty.call(m,p)||typeof m[p]==="number"){if(!f(p,k)){n=m[p];if(typeof n==="number"&&n&&p!=="navigationStart"){l[p]=n-o}else{l[p]=n}}}}return l}function d(m){var n=0,l,k;if(m){l=(m.responseEnd>0&&m.responseEnd<m.domLoading)?m.responseEnd:m.domLoading;k=m.loadEventStart;if(h.isNumeric(l)&&h.isNumeric(k)&&k>l){n=k-l}}return n}function i(l){var k=a.getStartTime();if(l.timestamp>k&&!e){e=l.timestamp-k}}function j(n){var l="UNKNOWN",o={type:7,performance:{}},k,p,m;if(!n||g.perfEventSent){return}p=n.performance||{};m=p.timing;k=p.navigation;if(m){if(!m.loadEventStart){return}o.performance.timing=b(m,c.filter);o.performance.timing.renderTime=d(m)}else{if(c.calculateRenderTime){o.performance.timing={renderTime:e,calculated:true}}else{return}}if(c.renderTimeThreshold&&o.performance.timing.renderTime>c.renderTimeThreshold){o.performance.timing.invalidRenderTime=o.performance.timing.renderTime;delete o.performance.timing.renderTime}if(k){switch(k.type){case 0:l="NAVIGATE";break;case 1:l="RELOAD";break;case 2:l="BACKFORWARD";break;default:l="UNKNOWN";break}o.performance.navigation={type:l,redirectCount:k.redirectCount}}a.post(o);g.perfEventSent=true}return{init:function(){c=a.getConfig()},destroy:function(){c=null},onevent:function(k){if(typeof k!=="object"||!k.type){return}switch(k.type){case"load":g.loadReceived=true;i(k);setTimeout(function(){if(a.isInitialized()){j(window)}},h.getValue(c,"delay",2000));break;case"screenview_load":if(!g.perfEventSent){j(window)}break;case"unload":g.unloadReceived=true;if(!g.perfEventSent){j(window)}break;default:break}},onmessage:function(k){}}})}else{}TLT.addModule("replay",function(ad){var V=ad.utils,I=0,aj={scale:0,timestamp:0},aw={},aq=null,x=[],N=0,S=true,R=null,ai=null,s=0,W="",am="",Q=(new Date()).getTime(),q=0,ao=null,C=null,ac=null,ak=null,T=null,J=null,P=0,Y=0,f={inFocus:false},ap=null,E=ad.getConfig()||{},i=V.getValue(E,"viewPortWidthHeightLimit",10000),m=1,K=1,L,g={},r=V.getValue(E,"mousemove")||{},ae=ad.getSessionStart(),ab=r.sampleRate,F=r.ignoreRadius,D=null,h=[],t=[],b={},n=0,B=1000,d=0;function U(){var ax;for(ax in aw){if(aw.hasOwnProperty(ax)){aw[ax].visitedCount=0}}}function av(az){var ax=false,ay="|button|image|submit|reset|",aA=null;if(typeof az!=="object"||!az.type){return ax}switch(az.type.toLowerCase()){case"input":aA="|"+(az.subType||"")+"|";if(ay.indexOf(aA.toLowerCase())===-1){ax=false}else{ax=true}break;case"select":case"textarea":ax=false;break;default:ax=true;break}return ax}function an(ay){var ax=[];ay=ay.parentNode;while(ay){ax.push(ay);ay=ay.parentNode}return ax}function l(ax){return V.some(ax,function(az){var ay=V.getTagName(az);if(ay==="a"||ay==="button"){return az}return null})}function z(ax){var ay=ax.type,az=ax.target;if(typeof ay==="string"){ay=ay.toLowerCase()}else{ay="unknown"}if(ay==="blur"){ay="focusout"}if(ay==="change"){if(az.type==="INPUT"){switch(az.subType){case"text":case"date":case"time":ay=az.subType+"Change";break;default:ay="valueChange";break}}else{if(az.type==="TEXTAREA"){ay="textChange"}else{ay="valueChange"}}}return ay}function k(ax,az,ay){var aA=null;if(!ax){return aA}az=az||{};az.eventOn=S;S=false;if(ay){aA="dcid-"+V.getSerialNumber()+"."+(new Date()).getTime()+"s";window.setTimeout(function(){az.dcid=aA;ad.performDOMCapture(ax,az)},ay)}else{delete az.dcid;aA=ad.performDOMCapture(ax,az)}return aA}function M(ay,aA){var az,ax,aB,aC;for(az=0,ax=ay.length;az<ax;az+=1){aB=ay[az];if(aA&&aA.indexOf("#")===0){aC=location.pathname+aA}else{if(typeof aA==="undefined"||aA==="root"){aC=location.pathname+location.hash}else{aC=aA}}aC=ad.normalizeUrl(aC);switch(typeof aB){case"object":if(!aB.cRegex){aB.cRegex=new RegExp(aB.regex,aB.flags)}aB.cRegex.lastIndex=0;if(aB.cRegex.test(aC)){return true}break;case"string":if(aB===aC){return true}break;default:break}}return false}function af(){var ax=false,ay;if(!r.enabled){return}if(h.length===0){return}if(n>=B){ax=true}ay={type:18,mousemove:{elements:t.slice(0),data:h.slice(0),config:{ignoreRadius:r.ignoreRadius,sampleRate:r.sampleRate},limitReached:ax,maxInactivity:d}};ad.post(ay);t.length=0;h.length=0;b={};d=0;return ay}function at(aE,aN,az){var aH,aG,aF=false,aC={},aO=false,ay,aK,aB=null,aL=0,aI,aD,aA,ax,aM,aJ;if(!aE||(!aN&&!az)){return aB}if(!aN&&!(aE==="load"||aE==="unload")){return aB}E=ad.getConfig()||{};aO=V.getValue(E,"domCapture.enabled",false);if(!aO||V.isLegacyIE){return aB}aJ=V.getValue(E,"domCapture.screenviewBlacklist",[]);if(M(aJ,az)){return aB}aK=V.getValue(E,"domCapture.triggers")||[];for(aH=0,aI=aK.length;!aF&&aH<aI;aH+=1){ay=aK[aH];if(ay.event===aE){if(aE==="load"||aE==="unload"){if(ay.screenviews){aA=ay.screenviews;for(aG=0,ax=aA.length;!aF&&aG<ax;aG+=1){aD=aA[aG];switch(typeof aD){case"object":if(!aD.cRegex){aD.cRegex=new RegExp(aD.regex,aD.flags)}aD.cRegex.lastIndex=0;aF=aD.cRegex.test(az);break;case"string":aF=(aD===az);break;default:break}}}else{aF=true}}else{if(ay.targets){aF=(-1!==V.matchTarget(ay.targets,aN))}else{aF=true}}}}if(aF){aL=ay.delay||(ay.event==="load"?7:0);aC.forceFullDOM=!!ay.fullDOMCapture;aB=k(window.document,aC,aL);if(aB){af()}}return aB}function al(aF){var az,aA=V.getValue(aF,"webEvent.target",{}),ax=aA.type,aB=aA.subType||"",ay=V.getTlType(aA),aC=an(V.getValue(aA,"element")),aE=null,aD=V.getValue(aF,"webEvent.subType",null);az={timestamp:V.getValue(aF,"webEvent.timestamp",0),type:4,target:{id:aA.id||"",idType:aA.idType,name:aA.name,tlType:ay,type:ax,position:{width:V.getValue(aA,"size.width"),height:V.getValue(aA,"size.height")},currState:aF.currState||null},event:{tlEvent:z(V.getValue(aF,"webEvent")),type:V.getValue(aF,"webEvent.type","UNKNOWN")}};if(aB){az.target.subType=aB}if(typeof aF.dwell==="number"&&aF.dwell>0){az.target.dwell=aF.dwell}if(typeof aF.visitedCount==="number"){az.target.visitedCount=aF.visitedCount}if(typeof aF.prevState!=="undefined"){az.prevState=aF.prevState}if(aD){az.event.subType=aD}aE=l(aC);az.target.isParentLink=!!aE;if(aE){if(aE.href){az.target.currState=az.target.currState||{};az.target.currState.href=az.target.currState.href||aE.href}if(aE.value){az.target.currState=az.target.currState||{};az.target.currState.value=az.target.currState.value||aE.value}if(aE.innerText||aE.textContent){az.target.currState=az.target.currState||{};az.target.currState.innerText=V.trim(az.target.currState.innerText||aE.innerText||aE.textContent)}}if(V.isUndefOrNull(az.target.currState)){delete az.target.currState}if(V.isUndefOrNull(az.target.name)){delete az.target.name}return az}function aa(ax){ad.post(ax)}function au(aB){var az=0,ax,aC=aB.length,aE,aD,aA,aF={mouseout:true,mouseover:true},ay=[];for(az=0;az<aC;az+=1){aE=aB[az];if(!aE){continue}if(aF[aE.event.type]){ay.push(aE)}else{for(ax=az+1;ax<aC&&aB[ax];ax+=1){if(!aF[aB[ax].event.type]){break}}if(ax<aC){aD=aB[ax];if(aD&&aE.target.id===aD.target.id&&aE.event.type!==aD.event.type){if(aE.event.type==="click"){aA=aE;aE=aD;aD=aA}if(aD.event.type==="click"){aE.target.position=aD.target.position;az+=1}else{if(aD.event.type==="blur"){aE.target.dwell=aD.target.dwell;aE.target.visitedCount=aD.target.visitedCount;aE.focusInOffset=aD.focusInOffset;aE.target.position=aD.target.position;az+=1}}aB[ax]=null;aB[az]=aE}}ay.push(aB[az])}}for(aE=ay.shift();aE;aE=ay.shift()){ad.post(aE)}aB.splice(0,aB.length)}function ar(ay){var aA=null,aB,aD=V.getValue(ay,"nativeEvent.message"),az=V.getValue(ay,"nativeEvent.filename"),ax=V.getValue(ay,"nativeEvent.lineno"),aC=V.getValue(ay,"nativeEvent.error");if(typeof aD!=="string"){return}ax=ax||-1;if(aC&&aC.stack){aB=aC.stack.toString()}else{aB=(aD+" "+az+" "+ax).toString()}if(g[aB]){g[aB].exception.repeats=g[aB].exception.repeats+1}else{aA={type:6,exception:{description:aD,url:az,line:ax}};ad.post(aA);g[aB]={exception:{description:aD,url:az,line:ax,repeats:1}}}s+=1}function A(ax,ay){x.push(al({webEvent:ax,id:ay,currState:V.getValue(ax,"target.state")}))}function X(ay,aA,aF){var aC=false,ax=false,aD,az,aE,aB=0;if(!ay){return}if(x.length===0){return}aA=aA||(aw[ay]?aw[ay].webEvent:{});if(aA.type==="blur"||aA.type==="change"){aE=V.getValue(aA,"target.state",null)}else{if(aA.target){aE=V.getTargetState(aA.target.element)||{}}else{aE={}}}az=x[x.length-1];if(aw[ay]){az.focusInOffset=aw[ay].focusInOffset;az.target.visitedCount=aw[ay].visitedCount;if(aw[ay].focus){aw[ay].dwell=Number(new Date())-aw[ay].focus;az.target.dwell=aw[ay].dwell}if(!aw[ay].processedChange&&aw[ay].prevState&&!aF){if(!V.isEqual(aw[ay].prevState,aE)){ax=true;aA.type="change";az.event.type=aA.type;az.event.tlEvent=z(aA);az.target.prevState=aw[ay].prevState;az.target.currState=aE}}}else{aw[ay]={}}if(az.event.type==="click"){if(!av(az.target)){az.target.currState=aE;aC=true}}else{if(az.event.type==="focus"){aC=true}}if(aC&&!aF){az.event.type="blur";az.event.tlEvent="focusout"}if(!az.dcid){aD=at(az.event.type,aA.target);if(aD){az.dcid=aD}}if(!aF){f.inFocus=false}aw[ay].prevState=aE;au(x)}function j(aA,ay){var az=x.length,ax=az?x[az-1]:null;if(f.inFocus&&f.target.id===aA){if(!ax||ax.target.id!==aA){A(ay,aA);aw[aA].processedChange=false;aw[aA].processedClick=false}return}if(f.inFocus){X(f.target.id,f)}f=ay;f.inFocus=true;if(!aw[aA]){aw[aA]={}}aw[aA].focus=f.dwellStart=Number(new Date());aw[aA].focusInOffset=ac?f.dwellStart-Number(ac):-1;if(ay.type==="focus"||(ay.type==="click"&&!aw[aA].prevState)){aw[aA].prevState=V.getValue(ay,"target.state")}aw[aA].visitedCount=aw[aA].visitedCount+1||1;aw[aA].webEvent=ay;aw[aA].processedChange=false;aw[aA].processedClick=false;A(ay,aA)}function H(aD,az){var ay=false,aA,aC,aB=x.length,ax=aB?x[aB-1]:null;if(!ax){return ay}aA=ax.target.id;aC=ax.event.type;if(aA!==aD&&ax.target.tltype!=="selectList"){if(az.type==="focus"||az.type==="click"||az.type==="change"||az.type==="blur"){X(aA);ay=true}}if(aA===aD&&((az.type==="click"&&aw[aD].processedClick)||(az.type==="change"&&aw[aD].processedChange))){X(aA,null,true);ay=true}return ay}function w(az,ay){var ax;j(az,ay);ax=x[x.length-1];ax.event.type="change";ax.event.tlEvent=z(ay);ax.target.currState=ay.target.state;if(aw[az].prevState){ax.target.prevState=aw[az].prevState}aw[az].webEvent=ay;aw[az].processedChange=true}function G(aA,az){var ay,ax;if(az.target.type==="select"&&ap&&ap.target.id===aA){ap=null;return}j(aA,az);ay=x[x.length-1];if(ay.event.type==="focus"){ay.event.type="click";ay.event.tlEvent=z(az)}ax=az.nativeEvent;if(ax&&(!window.MouseEvent||!(ax instanceof MouseEvent&&ax.detail===0)||(window.PointerEvent&&ax instanceof PointerEvent&&ax.pointerType!==""))){ay.target.position.relXY=V.getValue(az,"target.position.relXY")}if(!aw[aA].processedChange){aw[aA].webEvent=az}aw[aA].processedClick=true;if(av(az.target)){X(aA,az)}ap=az}function c(aB){var az,aF=0,ax=0,aA,ay,aD,aE,aC;if(!r.enabled){return}if(n>=B){return}az={element:{id:aB.target.id,idType:aB.target.idType},x:aB.position.x,y:aB.position.y,offset:aB.timestamp-ae};if(D!==null){aF=az.offset-D.offset;if(ab&&aF<ab){return}aE=Math.abs(az.x-D.x);aC=Math.abs(az.y-D.y);ax=(aE>aC)?aE:aC;if(F&&ax<F){return}if(aF>d){d=aF}}aA=JSON.stringify(az.element);ay=b[aA];if(typeof ay==="undefined"){t.push(az.element);ay=t.length-1;b[aA]=ay}aD=V.getValue(aB,"target.position.relXY").split(",");h.push([ay,aD[0],aD[1],az.offset]);n+=1;D=az}function a(ay){var ax=ay.orientation,az={type:4,event:{type:"orientationchange"},target:{prevState:{orientation:I,orientationMode:V.getOrientationMode(I)},currState:{orientation:ax,orientationMode:V.getOrientationMode(ax)}}};aa(az);I=ax}function e(ay){var ax=false;if(!ay){return ax}ax=(aj.scale===ay.scale&&Math.abs((new Date()).getTime()-aj.timestamp)<500);return ax}function O(ax){aj.scale=ax.scale;aj.rotation=ax.rotation;aj.timestamp=(new Date()).getTime()}function y(){var ax,ay;ax=m-K;if(isNaN(ax)){ay="INVALID"}else{if(ax<0){ay="CLOSE"}else{if(ax>0){ay="OPEN"}else{ay="NONE"}}}return ay}function u(aB){var aG=document.documentElement||{},aD=document.body||{},aH=window.screen,ay=aH.width,az=aH.height,aC=V.getValue(aB,"orientation",0),aE=!V.isiOS?ay:Math.abs(aC)===90?az:ay,aA={type:1,clientState:{pageWidth:Math.max(aD.clientWidth||0,aG.offsetWidth||0,aG.scrollWidth||0),pageHeight:Math.max(aD.clientHeight||0,aG.offsetHeight||0,aG.scrollHeight||0),viewPortWidth:window.innerWidth||aG.clientWidth,viewPortHeight:window.innerHeight||aG.clientHeight,viewPortX:Math.round(window.pageXOffset||(aG||aD).scrollLeft||0),viewPortY:Math.round(window.pageYOffset||(aG||aD).scrollTop||0),deviceOrientation:aC,event:V.getValue(aB,"type")}},aF=aA.clientState,ax;ai=ai||aA;if(aF.event==="unload"&&aF.viewPortHeight===aF.pageHeight&&aF.viewPortWidth===aF.pageWidth){if(ai.clientState.viewPortHeight<aF.viewPortHeight){aF.viewPortHeight=ai.clientState.viewPortHeight;aF.viewPortWidth=ai.clientState.viewPortWidth}}if((aF.viewPortY+aF.viewPortHeight)>aF.pageHeight){aF.viewPortY=aF.pageHeight-aF.viewPortHeight}if(aF.viewPortY<0){aF.viewPortY=0}ax=!aF.viewPortWidth?1:(aE/aF.viewPortWidth);aF.deviceScale=ax.toFixed(3);aF.viewTime=0;if(ak&&T){aF.viewTime=T.getTime()-ak.getTime()}if(aB.type==="scroll"){aF.viewPortXStart=ai.clientState.viewPortX;aF.viewPortYStart=ai.clientState.viewPortY}return aA}function Z(){var ax;if(R){ax=R.clientState;if(ax.viewPortHeight>0&&ax.viewPortHeight<i&&ax.viewPortWidth>0&&ax.viewPortWidth<i){aa(R)}ai=R;R=null;ak=J||ak;T=null}Z.timeoutId=0}function v(ax){var ay=null;if(V.isOperaMini){return}R=u(ax);if(ax.type==="scroll"||ax.type==="resize"){if(Z.timeoutId){window.clearTimeout(Z.timeoutId)}Z.timeoutId=window.setTimeout(Z,V.getValue(E,"scrollTimeout",2000))}else{if(ax.type==="touchstart"||ax.type==="load"){if(R){K=parseFloat(R.clientState.deviceScale)}}else{if(ax.type==="touchend"){if(R){m=parseFloat(R.clientState.deviceScale);Z()}}}}if(ax.type==="load"||ax.type==="unload"){if(ax.type==="unload"&&Q){ay=V.clone(R);ay.clientState.event="attention";ay.clientState.viewTime=(new Date()).getTime()-Q}Z();if(ay){R=ay;Z()}}return R}function ah(ay){var ax=V.getValue(ay,"nativeEvent.touches.length",0);if(ax===2){v(ay)}}function p(aA){var az,ay={},aB=V.getValue(aA,"nativeEvent.rotation",0)||V.getValue(aA,"nativeEvent.touches[0].webkitRotationAngle",0),aC=V.getValue(aA,"nativeEvent.scale",1),ax=null,aD={type:4,event:{type:"touchend"},target:{id:V.getValue(aA,"target.id"),idType:V.getValue(aA,"target.idType")}};az=V.getValue(aA,"nativeEvent.changedTouches.length",0)+V.getValue(aA,"nativeEvent.touches.length",0);if(az!==2){return}v(aA);ax={rotation:aB?aB.toFixed(2):0,scale:m?m.toFixed(2):1};ax.pinch=y();ay.scale=K?K.toFixed(2):1;aD.target.prevState=ay;aD.target.currState=ax;aa(aD)}function ag(aH,aA){var aE=["type","name","target.id"],az=null,aB,aD,aC=true,aF=10,ay=0,aG=0,ax=0;if(!aH||!aA||typeof aH!=="object"||typeof aA!=="object"){return false}for(aB=0,aD=aE.length;aC&&aB<aD;aB+=1){az=aE[aB];if(V.getValue(aH,az)!==V.getValue(aA,az)){aC=false;break}}if(aC){aG=V.getValue(aH,"timestamp");ax=V.getValue(aA,"timestamp");if(!(isNaN(aG)&&isNaN(ax))){ay=Math.abs(V.getValue(aH,"timestamp")-V.getValue(aA,"timestamp"));if(isNaN(ay)||ay>aF){aC=false}}}return aC}function o(ax){var az={type:4,event:{type:ax.type},target:{id:V.getValue(ax,"target.id"),idType:V.getValue(ax,"target.idType"),currState:V.getValue(ax,"target.state")}},ay;ay=at(ax.type,ax.target);if(ay){az.dcid=ay}aa(az)}return{init:function(){x=[]},destroy:function(){X(aq);x=[];if(Z.timeoutId){window.clearTimeout(Z.timeoutId);Z.timeoutId=0}},onevent:function(ay){var aE=null,aB=null,ax,aC,aD,aA,az=null;if(typeof ay!=="object"||!ay.type){return}if(ag(ay,ao)){ao=ay;return}ao=ay;aE=V.getValue(ay,"target.id");if(!aw[aE]){aw[aE]={}}H(aE,ay);switch(ay.type){case"hashchange":break;case"focus":aB=j(aE,ay);break;case"blur":aB=X(aE,ay);break;case"click":aB=G(aE,ay);break;case"change":aB=w(aE,ay);break;case"orientationchange":aB=a(ay);break;case"touchstart":ah(ay);break;case"touchend":aB=p(ay);break;case"loadWithFrames":TLT.logScreenviewLoad("rootWithFrames");break;case"load":I=ay.orientation;ak=new Date();if(typeof window.orientation!=="number"||V.isAndroid){aC=(window.screen.width>window.screen.height?90:0);ax=window.orientation;if(Math.abs(ax)!==aC&&!(ax===180&&aC===0)){V.isLandscapeZeroDegrees=true;if(Math.abs(ax)===180||Math.abs(ax)===0){I=90}else{if(Math.abs(ax)===90){I=0}}}}setTimeout(function(){if(ad.isInitialized()){v(ay)}},100);TLT.logScreenviewLoad("root");break;case"screenview_load":ac=new Date();U();aB=at("load",null,ay.name);break;case"screenview_unload":aB=at("unload",null,ay.name);break;case"resize":case"scroll":if(!T){T=new Date()}J=new Date();v(ay);break;case"unload":for(aD in g){if(g.hasOwnProperty(aD)){aA=g[aD].exception;if(aA.repeats>1){az={type:6,exception:aA};ad.post(az)}}}if(x){au(x)}T=new Date();v(ay);TLT.logScreenviewUnload("root");break;case"mousemove":c(ay);break;case"error":ar(ay);break;default:o(ay);break}aq=aE;return aB},onmessage:function(){}}});
/* Ajax Listener v1.1.3*/
TLT.addModule("ajaxListener",function(b){var p={},a=false,k,l=b.utils;function j(z){var x,y,t={},u=p.filters,v,s=z.tListener.url,r=z.tListener.method,w=z.status.toString();if(!u||!u.length){return t}for(x=0,y=u.length,v=false;!v&&x<y;x+=1){t=u[x];v=true;if(t.url){v=t.url.cRegex.test(s)}if(v&&t.method){v=t.method.cRegex.test(r)}if(v&&t.status){v=t.status.cRegex.test(w)}}if(!v){t=null}return t}function g(v){var x={},t,r,w,s,u;v=v.split(/[\r\n]+/);for(t=0,r=v.length;t<r;t+=1){w=v[t].split(": ");s=w[0];u=l.rtrim(w[1]);if(s&&s.length){x[s]=u}}return x}function c(y,u){var x={type:5,customEvent:{name:"ajaxListener",data:{}}},t,s=x.customEvent.data,r;if(!y){return}t=document.createElement("a");t.href=y.tListener.url;s.originalURL=t.host+t.pathname;s.requestURL=b.normalizeUrl?b.normalizeUrl(t.host+t.pathname):s.originalURL;s.description="Full Ajax Monitor "+y.tListener.url;s.method=y.tListener.method;s.status=y.status;s.statusText=y.statusText||"";s.async=y.tListener.async;s.ajaxResponseTime=y.tListener.end-y.tListener.start;if(u.requestHeaders){s.requestHeaders=y.tListener.reqHeaders}if(u.requestData&&typeof y.tListener.reqData==="string"&&!y.tListener.isSystemXHR){try{s.request=JSON.parse(y.tListener.reqData)}catch(w){s.request=y.tListener.reqData}}if(u.responseHeaders){s.responseHeaders=g(y.getAllResponseHeaders())}if(u.responseData){if(typeof y.responseType==="undefined"){r=y.responseText}else{if(y.responseType===""||y.responseType==="text"){r=y.response}else{if(y.responseType==="json"){s.response=y.response}else{s.response=typeof y.response}}}if(r){try{s.response=JSON.parse(r)}catch(v){s.response=r}}if(y.responseType){s.responseType=y.responseType}}b.post(x)}function i(t){var r,s={requestHeaders:false,requestData:false,responseHeaders:false,responseData:false};r=j(t);if(r){if(r.log){s=r.log}c(t,s)}}function e(s){var t,r;if(!s||!s.target){return}t=s.target;r=t.readyState;if(r===4){t.removeEventListener("readystatechange",e);t.tListener.end=Date.now();i(t)}}function d(s){var r=s.setRequestHeader;s.setRequestHeader=function(w,u){var v=this,t=v.tListener;if(w&&w.length){t.reqHeaders[w]=u}return r.apply(v,arguments)}}function o(r){var s=r.send;r.send=function(u){var v=this,t=v.tListener;if(u){t.reqData=u}t.start=Date.now();return s.apply(v,arguments)}}function f(s){var t,r,u;r=TLT.getServiceConfig("queue");u=r.queues||[];for(t=0;t<u.length;t+=1){if(u[t].endpoint&&s.indexOf(u[t].endpoint)!==-1){return true}}return false}function h(u,r,s){var t=this;if(a){t.addEventListener("readystatechange",e);t.tListener={method:u,url:r,async:(typeof s==="undefined")?true:!!s,reqHeaders:{},isSystemXHR:f(r)};d(t);o(t)}return k.apply(t,arguments)}function n(){if(XMLHttpRequest){k=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=h}}function q(r){if(r&&r.regex){r.cRegex=new RegExp(r.regex,r.flags)}}function m(s){var t,r,u,v=[];if(s&&s.filters){v=s.filters}for(t=0,r=v.length;t<r;t+=1){u=v[t];l.forEach([u.url,u.method,u.status],q)}}return{init:function(){p=b.getConfig();m(p)},destroy:function(){a=false},onevent:function(r){switch(r.type){case"load":n();a=true;break;case"unload":a=false;break;default:break}},version:"1.1.3"}});

//************************ Begin Custom Modules ************************//

//----------------------------------------------------------------------------------------------------------
//----------------------------------------------------- Trigger DOM Capture based on DOM Mutation 10/3/2019
//----------------------------------------------------------------------------------------------------------
// MAY BE ABLE TO RETIRE WITH 5.7, WHICH WILL ADD NATIVE SUPPORT FOR DOM MUTATION CAPTURE
TLT.addModule("mutationDOMCapture", function (context) {
	var mdcFilters = TLT.getCoreConfig().modules.mutationDOMCapture.filters;
	function mutationDOMCapture(childObj) {
		var child = childObj.selector,
		//console.log("XXXXXXXXXXXx Child Object "+child);
		useDocTitleName = childObj.useDocTitleName,
		useSelectorName = childObj.useSelectorName,
		useCustomName = childObj.useCustomName,
		useCustomPrefix = childObj.useCustomPrefix,
		useCustomEvent = childObj.useCustomEvent,
		onAdd = childObj.onAdd,
		onRemove = childObj.onRemove,
		showStatus = childObj.showStatus,
		simulateClick = childObj.simulateClick,
		simulateCustom = childObj.simulateCustom,
		fireMultiple = childObj.fireMultiple,
		lazyLoad = childObj.lazyLoad,
		logAttribute = childObj.logAttribute,
		dupeTimer = childObj.dupeTimer,
		flushQueue = childObj.flushQueue,
		timeThis = 0,
		target = document,
		lastCheck = document.querySelectorAll(child).length;

		//------------------------------------------------ Event & CustomEvent Polyfills for IE9-11 Browsers
		if (typeof window.CustomEvent !== 'function') {
			window.CustomEvent = function (inType, params) {
				params = params || {};
				var e = document.createEvent('CustomEvent');
				e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
				return e;
			};
			window.CustomEvent.prototype = window.Event.prototype;
		}
		if (typeof window.Event !== 'function') {
			var origEvent = window.Event;
			window.Event = function (inType, params) {
				params = params || {};
				var e = document.createEvent('Event');
				e.initEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable));
				return e;
			};
			if (origEvent) {
				for (var i in origEvent) {
					window.Event[i] = origEvent[i];
				}
			}
			window.Event.prototype = origEvent.prototype;
		}

		var observer = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					var childStatus = document.querySelectorAll(child).length;
					if ((childStatus > lastCheck) || (childStatus === 1 && lastCheck === 0)) {
						var svName = useCustomPrefix;
						if (useDocTitleName) {
							svName = svName + document.title;
						} else if (useSelectorName) {
							svName = svName + child;
						} else if (useCustomName) {
							svName = svName + useCustomName;
						}
						if (svName === "") {
							svName = "DEFAULT";
						}
						if (simulateCustom) {
							try {
								var e = new Event(useCustomEvent);
							} catch (err) {
								try {
									var e = new CustomEvent(useCustomEvent);
								} catch (err) {}
							}
						}
					
						if (onAdd) {
							if (lazyLoad) {
								if (showStatus && onAdd && onRemove) {
									svName = svName + " -Shown-"
								}
								if (dupeTimer == 0 || (dupeTimer > 0 && timeThis < new Date().getTime())) {
									if (simulateClick || simulateCustom) {
										var s = document.getElementsByTagName("script")[0];
										var sv = svName.replace(/[`~!@#$%^&*()|+=?;'",<>\ \{\}\[\]\\\/]/gi, "");
										var myNode = document.createElement("input");
										myNode.setAttribute("type", "button");
										myNode.setAttribute("id", sv);
										myNode.setAttribute("hidden", "true");
										if (logAttribute) {
											try {
												myNode.setAttribute("value", document.querySelector(child).getAttribute(logAttribute));
											} catch (e) {};
										}
										s.parentNode.appendChild(myNode, s);
										if (simulateClick) {
											document.getElementById(sv).click();
										}
										if (simulateCustom) {
											document.getElementById(sv).dispatchEvent(e);
										}
										s.parentNode.removeChild(myNode);
									} else {
										TLT.logScreenviewLoad(svName);
									}
									//console.log("Logged DOM onAdd: " + child + " as " + svName);
									if (!fireMultiple) {
										observer.disconnect();
										//console.log("Blocked future logging on: " + child);
									}
									if (dupeTimer) {
										timeThis = new Date().getTime() + dupeTimer;
									}
									if (flushQueue) {
										TLT.flushAll();
									}
								}
							}
						}
						if (onRemove) {
							if (lazyLoad) {
								if (showStatus && onAdd && onRemove) {
									svName = svName + " -Hidden-"
								}
								if (dupeTimer == 0 || (dupeTimer > 0 && timeThis < new Date().getTime())) {
									if (simulateClick || simulateCustom) {
										var s = document.getElementsByTagName("script")[0];
										var sv = svName.replace(/[`~!@#$%^&*()|+=?;'",<>\ \{\}\[\]\\\/]/gi, "");
										var myNode = document.createElement("input");
										myNode.setAttribute("type", "button");
										myNode.setAttribute("id", sv);
										myNode.setAttribute("hidden", "true");
										if (logAttribute) {
											try {
												myNode.setAttribute("value", document.querySelector(child).getAttribute(logAttribute));
											} catch (e) {};
										}
										s.parentNode.appendChild(myNode, s);
										if (simulateClick) {
											document.getElementById(sv).click();
										}
										if (simulateCustom) {
											document.getElementById(sv).dispatchEvent(e);
										}
										s.parentNode.removeChild(myNode);
									} else {
										TLT.logScreenviewLoad(svName);
									}
									//console.log("Logged DOM onRemove: " + child + " as " + svName);
									if (!fireMultiple) {
										observer.disconnect();
										//console.log("Blocked future logging on: " + child);
									}
									if (dupeTimer) {
										timeThis = new Date().getTime() + dupeTimer;
									}
									if (flushQueue) {
										TLT.flushAll();
									}
								}
							}
						}
					}
					lastCheck = document.querySelectorAll(child).length;
				});
			});

		var config = {
			attributes: true,
			childList: true,
			characterData: true,
			subtree: true
		};
		observer.observe(target, config);
		//console.log ("Attached DOM Observer for: " + child);
	};

	return {
		init: function () {},
		destroy: function () {},
		onevent: function (webEvent) {
			if (typeof webEvent !== "object" || !webEvent.type) {
				return;
			} // Sanity check
			if (webEvent) {
				for (index = 0; index < mdcFilters.children.length; ++index) {
					var mdcObject = TLT.getCoreConfig().modules.mutationDOMCapture.filters.children[index];
					for (i = 0; i < mdcObject.enabledURLS.length; ++i) {
						var hash = window.location.pathname;
						if (hash.indexOf(mdcObject.enabledURLS[i]) > -1) {
							try {
								mutationDOMCapture(mdcObject);
							} catch (ex) {}
							break;
						}
					}
				}
			}
		}
	};
});

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
	// new with 5.6.0:  error logging no longer needed, included as standard type 6 exception message.
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
                case "click":
                    TLT.flushAll();
                    break;
                case "visibilitychange":
                    visDetect();
                    break;
                default:
                    break;
                }
            }
        }
    };
});
// MAY BE ABLE TO RETIRE WITH 5.7 WHICH WILL ADD NATIVE TAB MONITORING
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
// MAY BE ABLE TO RETIRE WITH 5.7 WHICH WILL ADD NATIVE PERFORMANCE
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
//----------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------- Custom SSL Protocol Violation Module
//----------------------------------------------------------------------------------------------------------
 TLT.addModule("sslcheck", function(context) {

	function postMsg(description, payload) {
		var jMsg = { "description" : description, "violations" : payload };
		TLT.logCustomEvent(description, jMsg);
	};

	function sslCheck() {
		if (performance !== undefined) {
			var pe = performance.getEntries(),
				urlIndex = 0;
				payload = {};
				payload.urls = [];
			if (location.protocol === 'https:') { // Check for SSL
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
		init : function () {},
		destroy : function () {},
		onevent : function (webEvent) {
			if (typeof webEvent !== "object" || !webEvent.type) { return; } // Sanity check
			if (webEvent) { sslCheck(); }
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
    var TLT = window.TLT;

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
			blockedElements: [],
			//ieExcludedLinks: ["a[href*=\"javascript:void\"]","input[onclick*='javascript:']"],
			// WARNING: For advanced users only. Modifying the modules section may lead to unexpected behavior and or performance issues.
			modules: {
				replay: {
					events: [
						{name: "change",recurseFrames: true},
						{name: "click",recurseFrames: true},
						{name: "hashchange",target: window},
						{name: "focus",	target: "input, select, textarea, button",recurseFrames: true},
						{name: "blur",target: "input, select, textarea, button",recurseFrames: true},
						{name: "load",target: window},
						{name: "lazyload",target: window}, // for custom mutationDOMCapture module
						{name: "unload",target: window},
						{name: "resize",target: window},
						{name: "scroll",target: window},
                        {name: "mousemove", recurseFrames: true },  // new with 5.6.0
						{name: "orientationchange",target: window},
						{name: "touchend"},
						{name: "touchstart"},
                        {name: "error", target: window},  // new with 5.6.0: improved type 6 exception messages
						{name: "visibilitychange" }   // for custom visDetect module
					]
				},
				ajaxListener: {
					enabled: true,
					events: [
						{ name: "load", target: window},
						{ name: "unload", target: window}
					]
				},
                digitalData: { // Add custom data logging (visDetect, iOS<12.2 TLT.flushAll();)
                    enabled: true,
                    events: [
                        { name: "load", target: window },
                        { name: "visibilitychange", target: document },
                    ]
                },
				tabMonitoring: {
					enabled: true,
					events: [
						{ name: "load", target: window }
					]
				},
				performanceData : {
					enabled : true,
					responseTime : 3000, // Time in ms to log slow static content - Recommended 2000+
					monitorJS: true,
					monitorCSS: true,
					monitorImages: true,
					monitorXHR: true,
					blacklist: [
						".tiff", ".jpg", "twitter.com", "bam.nr", "google"
					],
					events: [
						{ name: "load", target: window }
					]
				},
				sslcheck : {
					enabled : false,
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
				mutationDOMCapture: {
					enabled: false,
					events: [
						{ name: "load", target: window }
					],
					filters: {
						children: [{
								selector: '.sample', // CSS selector to trigger DOM capture
								useDocTitleName: false, // log title using document.title
								useSelectorName: false, // log title as selector
								useCustomName: "Preloader", // log title as custom text
								useCustomPrefix: "DOM-", // prefix screen view logging with custom text
								useCustomEvent: "lazyload", // specified when not using LOAD or CLICK event
								onAdd: true, // trigger when selector added to DOM
								onRemove: false, // trigger when selector removed from DOM
								showStatus: true, // log status as (Shown) or (Hidden)
								simulateClick: false, // simulate click event
								simulateCustom: true, // simulate custom event (must specify in Replay & DOM config)
								fireMultiple: true, // allow trigger to fire multiple times
								lazyLoad: true, // allow lazy loading of duplicates to trigger DOM
								logAttribute: "", // log custom data when trigger fires (optional)
								enabledURLS: [".sample"], // exclude partial URL to limit trigger (optional)
								dupeTimer: 500, // ms to prevent duplicate triggers
								flushQueue: false // flush queue to help prevent data loss on confirmation pages
							}
						]
					}
				},
				TLCookie: {
					enabled: true
				}
			},

            normalization: {  // new with 5.6.0
                /**
                  * User defined URL normalization function which accepts an URL or path and returns
                  * the normalized URL or normalized path.
                  * @param urlOrPath {String} URL or Path which needs to be normalized.
                  * @returns {String} The normalized URL or Path.
                  */
                urlFunction: function (urlOrPath) {
                    // Normalize the input URL or path here.
                    // Refer to the documentation for an example to normalize the URL path or URL query parameters.
                    return urlOrPath;
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
				"#iframe1"
			]
		},
		services: {
			queue: {
				// WARNING: Enabling asynchronous request on unload may result in incomplete or missing data
				asyncReqOnUnload: true,
				useBeacon: true,
//				useFetch: false,   // new with 5.6.0: useFetch:true is the new default if supported by browser
				// new with 5.6.0 for use with tltWorker.js.  Only initialized on browsers supporting the fetch API
//				web worker docs:  https://developer.ibm.com/customer-engagement/tutorials/implementing-the-tealeaf-web-worker-script/
//				9/11/2019: bug discovered where URL of worker tltWorker.js is captured in referrer instead of actual referrer
//				tltWorker: window.fetch && window.Worker ? new Worker("/js/tltWorker.js") : null,  // update URL as needed
				xhrLogging: true,
				queues: [
					{
						qid: "DEFAULT",
						endpoint: "https://uscollector.tealeaf.ibmcloud.com/collector/collectorPost",
						maxEvents: 15, // 15 events in queue triggers post
						timerInterval: 60000, // 60 seconds of user inactivity triggers post
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
					targets: [
						".tlPrivate", //-------------------------------------------------- Mask form fields by CLASS=tlPrivate
						"input[name=samplename]", //-------------------------------------- Mask form fields by name
						"input[name^=account_]", //--------------------------------------- Mask form fields by name beginning with account_
						{ id : "sampleid", idType : -1 }, //------------------------------ Mask form fields by ID
						{ id : { regex: "security[0-9]|answer[0-9]" }, idType : -1 }, //-- Mask form fields by ID using RegEx
						{ id : { regex: "account_.*" }, idType : -1 } //------------------ Mask form fields by ID beginning with account_ using RegEx
					],
						"maskType": 3  // mask with matching data type & case (a4ghRW = x9xxXX)
					},{
					targets: [
						"input[type=password]" //----- Mask all password fields
						],
						"maskType": 2  // mask with fixed value "XXXXX"
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
					removeComments: true     // Should comments be removed from the captured snapshot (YES!)
				}
            },
			browser: {
				useCapture: true,
				sizzleObject: "window.Sizzle",
				jQueryObject: "window.jQuery",
				customid: ["name"]           // Optional fall back to name when ID is missing
			}
		},
		modules: {
            performance: {
                calculateRenderTime: true,
                renderTimeThreshold: 600000,
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
					screenviewBlacklist: [  // new with 5.6.0. Blocks domCapture only.
						{regex: "#Screen[A,C]"}
					],
					triggers: [
						{event: "click"},
						{event: "change"},
						{event: "visibilitychange"},
						{event: "lazyload", delay: 100},
						{event: "load",	fullDOMCapture: true, delay: 100}
					],
				},
                mousemove: {  // new with 5.6.0: only included with unload event.  Not available for onprem 9.0.2 (targeting v10.2).
					enabled: true,
					sampleRate: 200,
					ignoreRadius: 3
				}
			},
			overstat: {
                hoverThreshold: 3000
            },
			ajaxListener: {
				// readme: https://github.com/ibm-watson-cxa/UICaptureSDK-Modules/tree/master/AjaxListener
				filters: [
					{  // suggested base standard: only log 4xx and 5xx messages (Headers and Data)
//						url: { regex: "^((?!(ibmcloud\\.com|TealeafTarget\\.jsp)).)*$", flags: "i" }, // exclude tealeaf requests
						status: { regex: "4\\d\\d|5\\d\\d", flags: "" }, // log 4xx and 5xx status messages
						log: {requestHeaders: true,
							requestData: true,
							responseHeaders: true,
							responseData: true
						}
					}
//					{  // example of URL filter
//						url: { regex: "somedocument\.jsp", flags: "i" } // for this URL, log existence but no Headers or Data
//					}
				]
			},
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
                tlAppKey: "2508cb55cf0a4b94be3d2679275b1c61",  // us collector 'Tealeaf' / 'WBird Test'
                sessionizationCookieName: "TLTSID"
			}
		}
	}

	//----------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------- Automatic tlAppKey using document.URL
	//----------------------------------------------------------------------------------------------------------
	if ((window.location.hostname === "www.site1.com")  // send data to prod appkeys
		|| (window.location.hostname === "www.site2.com")
		|| (window.location.hostname === "site2.com")) {
		if (window.location.hostname === "www.site1.com") {  
			config.modules.TLCookie.tlAppKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // appkey1
		} else if ((window.location.hostname === "www.site2.com")
			|| (window.location.hostname === "site2.com")) { 
			config.modules.TLCookie.tlAppKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // appkey2
		}
	} else {   // send data to test appkeys or unknown-sites appkeys
		if ((window.location.hostname.indexOf("test.site1.com") > -1) 
			|| (window.location.hostname === "test.site2.com"))  {  
			config.modules.TLCookie.tlAppKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // test appkey 1
		} else if (window.location.hostname.indexOf("site2test.com") > -1)  {  
			config.modules.TLCookie.tlAppKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // test appkey 2
		} else { // other unexpected domains (test or production)
			config.modules.TLCookie.tlAppKey = "2508cb55cf0a4b94be3d2679275b1c61"  // us collector 'Tealeaf' / 'WBird Test'
		}
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
                endpoint: "https://uscollector.tealeaf.ibmcloud.com/collector/collectorPost",
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
	//----------------------------------------------------------------------------------------------------------
	//-------------------------------------------------------------------------------- Disable SDK by User Agent
	//----------------------------------------------------------------------------------------------------------
	var disableSDK = false;
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