/*!
v1.4
Updated by Jai on 14/02/2020  for chrome 80 and to 5.6
Updated by WHB on 30/04/2020 to endpoint: "https://lib-eu-1.brilliantcollector.com/collector/collectorPost", 
Updated by WHB on 21/7/2020 to UIC 5.7.0.1915 to correct Uncaught TypeError: Failed to execute 'contains' on 'Node': parameter 1 is not of type 'Node'.

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
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).pako=t()}}(function(){return function i(s,h,l){function o(e,t){if(!h[e]){if(!s[e]){var a="function"==typeof require&&require;if(!t&&a)return a(e,!0);if(_)return _(e,!0);var n=new Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}var r=h[e]={exports:{}};s[e][0].call(r.exports,function(t){return o(s[e][1][t]||t)},r,r.exports,i,s,h,l)}return h[e].exports}for(var _="function"==typeof require&&require,t=0;t<l.length;t++)o(l[t]);return o}({1:[function(t,e,a){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;a.assign=function(t){for(var e,a,n=Array.prototype.slice.call(arguments,1);n.length;){var r=n.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var i in r)e=r,a=i,Object.prototype.hasOwnProperty.call(e,a)&&(t[i]=r[i])}}return t},a.shrinkBuf=function(t,e){return t.length===e?t:t.subarray?t.subarray(0,e):(t.length=e,t)};var r={arraySet:function(t,e,a,n,r){if(e.subarray&&t.subarray)t.set(e.subarray(a,a+n),r);else for(var i=0;i<n;i++)t[r+i]=e[a+i]},flattenChunks:function(t){var e,a,n,r,i,s;for(e=n=0,a=t.length;e<a;e++)n+=t[e].length;for(s=new Uint8Array(n),e=r=0,a=t.length;e<a;e++)i=t[e],s.set(i,r),r+=i.length;return s}},i={arraySet:function(t,e,a,n,r){for(var i=0;i<n;i++)t[r+i]=e[a+i]},flattenChunks:function(t){return[].concat.apply([],t)}};a.setTyped=function(t){t?(a.Buf8=Uint8Array,a.Buf16=Uint16Array,a.Buf32=Int32Array,a.assign(a,r)):(a.Buf8=Array,a.Buf16=Array,a.Buf32=Array,a.assign(a,i))},a.setTyped(n)},{}],2:[function(t,e,a){"use strict";var l=t("./common"),r=!0,i=!0;try{String.fromCharCode.apply(null,[0])}catch(t){r=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(t){i=!1}for(var o=new l.Buf8(256),n=0;n<256;n++)o[n]=252<=n?6:248<=n?5:240<=n?4:224<=n?3:192<=n?2:1;function _(t,e){if(e<65534&&(t.subarray&&i||!t.subarray&&r))return String.fromCharCode.apply(null,l.shrinkBuf(t,e));for(var a="",n=0;n<e;n++)a+=String.fromCharCode(t[n]);return a}o[254]=o[254]=1,a.string2buf=function(t){var e,a,n,r,i,s=t.length,h=0;for(r=0;r<s;r++)55296==(64512&(a=t.charCodeAt(r)))&&r+1<s&&56320==(64512&(n=t.charCodeAt(r+1)))&&(a=65536+(a-55296<<10)+(n-56320),r++),h+=a<128?1:a<2048?2:a<65536?3:4;for(e=new l.Buf8(h),r=i=0;i<h;r++)55296==(64512&(a=t.charCodeAt(r)))&&r+1<s&&56320==(64512&(n=t.charCodeAt(r+1)))&&(a=65536+(a-55296<<10)+(n-56320),r++),a<128?e[i++]=a:(a<2048?e[i++]=192|a>>>6:(a<65536?e[i++]=224|a>>>12:(e[i++]=240|a>>>18,e[i++]=128|a>>>12&63),e[i++]=128|a>>>6&63),e[i++]=128|63&a);return e},a.buf2binstring=function(t){return _(t,t.length)},a.binstring2buf=function(t){for(var e=new l.Buf8(t.length),a=0,n=e.length;a<n;a++)e[a]=t.charCodeAt(a);return e},a.buf2string=function(t,e){var a,n,r,i,s=e||t.length,h=new Array(2*s);for(a=n=0;a<s;)if((r=t[a++])<128)h[n++]=r;else if(4<(i=o[r]))h[n++]=65533,a+=i-1;else{for(r&=2===i?31:3===i?15:7;1<i&&a<s;)r=r<<6|63&t[a++],i--;1<i?h[n++]=65533:r<65536?h[n++]=r:(r-=65536,h[n++]=55296|r>>10&1023,h[n++]=56320|1023&r)}return _(h,n)},a.utf8border=function(t,e){var a;for((e=e||t.length)>t.length&&(e=t.length),a=e-1;0<=a&&128==(192&t[a]);)a--;return a<0?e:0===a?e:a+o[t[a]]>e?a:e}},{"./common":1}],3:[function(t,e,a){"use strict";e.exports=function(t,e,a,n){for(var r=65535&t|0,i=t>>>16&65535|0,s=0;0!==a;){for(a-=s=2e3<a?2e3:a;i=i+(r=r+e[n++]|0)|0,--s;);r%=65521,i%=65521}return r|i<<16|0}},{}],4:[function(t,e,a){"use strict";var h=function(){for(var t,e=[],a=0;a<256;a++){t=a;for(var n=0;n<8;n++)t=1&t?3988292384^t>>>1:t>>>1;e[a]=t}return e}();e.exports=function(t,e,a,n){var r=h,i=n+a;t^=-1;for(var s=n;s<i;s++)t=t>>>8^r[255&(t^e[s])];return-1^t}},{}],5:[function(t,e,a){"use strict";var l,u=t("../utils/common"),o=t("./trees"),f=t("./adler32"),c=t("./crc32"),n=t("./messages"),_=0,d=4,p=0,g=-2,m=-1,b=4,r=2,v=8,w=9,i=286,s=30,h=19,y=2*i+1,k=15,z=3,x=258,B=x+z+1,A=42,C=113,S=1,j=2,E=3,U=4;function D(t,e){return t.msg=n[e],e}function I(t){return(t<<1)-(4<t?9:0)}function O(t){for(var e=t.length;0<=--e;)t[e]=0}function q(t){var e=t.state,a=e.pending;a>t.avail_out&&(a=t.avail_out),0!==a&&(u.arraySet(t.output,e.pending_buf,e.pending_out,a,t.next_out),t.next_out+=a,e.pending_out+=a,t.total_out+=a,t.avail_out-=a,e.pending-=a,0===e.pending&&(e.pending_out=0))}function T(t,e){o._tr_flush_block(t,0<=t.block_start?t.block_start:-1,t.strstart-t.block_start,e),t.block_start=t.strstart,q(t.strm)}function L(t,e){t.pending_buf[t.pending++]=e}function N(t,e){t.pending_buf[t.pending++]=e>>>8&255,t.pending_buf[t.pending++]=255&e}function R(t,e){var a,n,r=t.max_chain_length,i=t.strstart,s=t.prev_length,h=t.nice_match,l=t.strstart>t.w_size-B?t.strstart-(t.w_size-B):0,o=t.window,_=t.w_mask,d=t.prev,u=t.strstart+x,f=o[i+s-1],c=o[i+s];t.prev_length>=t.good_match&&(r>>=2),h>t.lookahead&&(h=t.lookahead);do{if(o[(a=e)+s]===c&&o[a+s-1]===f&&o[a]===o[i]&&o[++a]===o[i+1]){i+=2,a++;do{}while(o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&i<u);if(n=x-(u-i),i=u-x,s<n){if(t.match_start=e,h<=(s=n))break;f=o[i+s-1],c=o[i+s]}}}while((e=d[e&_])>l&&0!=--r);return s<=t.lookahead?s:t.lookahead}function H(t){var e,a,n,r,i,s,h,l,o,_,d=t.w_size;do{if(r=t.window_size-t.lookahead-t.strstart,t.strstart>=d+(d-B)){for(u.arraySet(t.window,t.window,d,d,0),t.match_start-=d,t.strstart-=d,t.block_start-=d,e=a=t.hash_size;n=t.head[--e],t.head[e]=d<=n?n-d:0,--a;);for(e=a=d;n=t.prev[--e],t.prev[e]=d<=n?n-d:0,--a;);r+=d}if(0===t.strm.avail_in)break;if(s=t.strm,h=t.window,l=t.strstart+t.lookahead,o=r,_=void 0,_=s.avail_in,o<_&&(_=o),a=0===_?0:(s.avail_in-=_,u.arraySet(h,s.input,s.next_in,_,l),1===s.state.wrap?s.adler=f(s.adler,h,_,l):2===s.state.wrap&&(s.adler=c(s.adler,h,_,l)),s.next_in+=_,s.total_in+=_,_),t.lookahead+=a,t.lookahead+t.insert>=z)for(i=t.strstart-t.insert,t.ins_h=t.window[i],t.ins_h=(t.ins_h<<t.hash_shift^t.window[i+1])&t.hash_mask;t.insert&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[i+z-1])&t.hash_mask,t.prev[i&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=i,i++,t.insert--,!(t.lookahead+t.insert<z)););}while(t.lookahead<B&&0!==t.strm.avail_in)}function F(t,e){for(var a,n;;){if(t.lookahead<B){if(H(t),t.lookahead<B&&e===_)return S;if(0===t.lookahead)break}if(a=0,t.lookahead>=z&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+z-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!==a&&t.strstart-a<=t.w_size-B&&(t.match_length=R(t,a)),t.match_length>=z)if(n=o._tr_tally(t,t.strstart-t.match_start,t.match_length-z),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=z){for(t.match_length--;t.strstart++,t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+z-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart,0!=--t.match_length;);t.strstart++}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+1])&t.hash_mask;else n=o._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(n&&(T(t,!1),0===t.strm.avail_out))return S}return t.insert=t.strstart<z-1?t.strstart:z-1,e===d?(T(t,!0),0===t.strm.avail_out?E:U):t.last_lit&&(T(t,!1),0===t.strm.avail_out)?S:j}function K(t,e){for(var a,n,r;;){if(t.lookahead<B){if(H(t),t.lookahead<B&&e===_)return S;if(0===t.lookahead)break}if(a=0,t.lookahead>=z&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+z-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=z-1,0!==a&&t.prev_length<t.max_lazy_match&&t.strstart-a<=t.w_size-B&&(t.match_length=R(t,a),t.match_length<=5&&(1===t.strategy||t.match_length===z&&4096<t.strstart-t.match_start)&&(t.match_length=z-1)),t.prev_length>=z&&t.match_length<=t.prev_length){for(r=t.strstart+t.lookahead-z,n=o._tr_tally(t,t.strstart-1-t.prev_match,t.prev_length-z),t.lookahead-=t.prev_length-1,t.prev_length-=2;++t.strstart<=r&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+z-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!=--t.prev_length;);if(t.match_available=0,t.match_length=z-1,t.strstart++,n&&(T(t,!1),0===t.strm.avail_out))return S}else if(t.match_available){if((n=o._tr_tally(t,0,t.window[t.strstart-1]))&&T(t,!1),t.strstart++,t.lookahead--,0===t.strm.avail_out)return S}else t.match_available=1,t.strstart++,t.lookahead--}return t.match_available&&(n=o._tr_tally(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<z-1?t.strstart:z-1,e===d?(T(t,!0),0===t.strm.avail_out?E:U):t.last_lit&&(T(t,!1),0===t.strm.avail_out)?S:j}function M(t,e,a,n,r){this.good_length=t,this.max_lazy=e,this.nice_length=a,this.max_chain=n,this.func=r}function P(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=v,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new u.Buf16(2*y),this.dyn_dtree=new u.Buf16(2*(2*s+1)),this.bl_tree=new u.Buf16(2*(2*h+1)),O(this.dyn_ltree),O(this.dyn_dtree),O(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new u.Buf16(k+1),this.heap=new u.Buf16(2*i+1),O(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new u.Buf16(2*i+1),O(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function G(t){var e;return t&&t.state?(t.total_in=t.total_out=0,t.data_type=r,(e=t.state).pending=0,e.pending_out=0,e.wrap<0&&(e.wrap=-e.wrap),e.status=e.wrap?A:C,t.adler=2===e.wrap?0:1,e.last_flush=_,o._tr_init(e),p):D(t,g)}function J(t){var e,a=G(t);return a===p&&((e=t.state).window_size=2*e.w_size,O(e.head),e.max_lazy_match=l[e.level].max_lazy,e.good_match=l[e.level].good_length,e.nice_match=l[e.level].nice_length,e.max_chain_length=l[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=z-1,e.match_available=0,e.ins_h=0),a}function Q(t,e,a,n,r,i){if(!t)return g;var s=1;if(e===m&&(e=6),n<0?(s=0,n=-n):15<n&&(s=2,n-=16),r<1||w<r||a!==v||n<8||15<n||e<0||9<e||i<0||b<i)return D(t,g);8===n&&(n=9);var h=new P;return(t.state=h).strm=t,h.wrap=s,h.gzhead=null,h.w_bits=n,h.w_size=1<<h.w_bits,h.w_mask=h.w_size-1,h.hash_bits=r+7,h.hash_size=1<<h.hash_bits,h.hash_mask=h.hash_size-1,h.hash_shift=~~((h.hash_bits+z-1)/z),h.window=new u.Buf8(2*h.w_size),h.head=new u.Buf16(h.hash_size),h.prev=new u.Buf16(h.w_size),h.lit_bufsize=1<<r+6,h.pending_buf_size=4*h.lit_bufsize,h.pending_buf=new u.Buf8(h.pending_buf_size),h.d_buf=1*h.lit_bufsize,h.l_buf=3*h.lit_bufsize,h.level=e,h.strategy=i,h.method=a,J(t)}l=[new M(0,0,0,0,function(t,e){var a=65535;for(a>t.pending_buf_size-5&&(a=t.pending_buf_size-5);;){if(t.lookahead<=1){if(H(t),0===t.lookahead&&e===_)return S;if(0===t.lookahead)break}t.strstart+=t.lookahead,t.lookahead=0;var n=t.block_start+a;if((0===t.strstart||t.strstart>=n)&&(t.lookahead=t.strstart-n,t.strstart=n,T(t,!1),0===t.strm.avail_out))return S;if(t.strstart-t.block_start>=t.w_size-B&&(T(t,!1),0===t.strm.avail_out))return S}return t.insert=0,e===d?(T(t,!0),0===t.strm.avail_out?E:U):(t.strstart>t.block_start&&(T(t,!1),t.strm.avail_out),S)}),new M(4,4,8,4,F),new M(4,5,16,8,F),new M(4,6,32,32,F),new M(4,4,16,16,K),new M(8,16,32,32,K),new M(8,16,128,128,K),new M(8,32,128,256,K),new M(32,128,258,1024,K),new M(32,258,258,4096,K)],a.deflateInit=function(t,e){return Q(t,e,v,15,8,0)},a.deflateInit2=Q,a.deflateReset=J,a.deflateResetKeep=G,a.deflateSetHeader=function(t,e){return t&&t.state?2!==t.state.wrap?g:(t.state.gzhead=e,p):g},a.deflate=function(t,e){var a,n,r,i;if(!t||!t.state||5<e||e<0)return t?D(t,g):g;if(n=t.state,!t.output||!t.input&&0!==t.avail_in||666===n.status&&e!==d)return D(t,0===t.avail_out?-5:g);if(n.strm=t,a=n.last_flush,n.last_flush=e,n.status===A)if(2===n.wrap)t.adler=0,L(n,31),L(n,139),L(n,8),n.gzhead?(L(n,(n.gzhead.text?1:0)+(n.gzhead.hcrc?2:0)+(n.gzhead.extra?4:0)+(n.gzhead.name?8:0)+(n.gzhead.comment?16:0)),L(n,255&n.gzhead.time),L(n,n.gzhead.time>>8&255),L(n,n.gzhead.time>>16&255),L(n,n.gzhead.time>>24&255),L(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),L(n,255&n.gzhead.os),n.gzhead.extra&&n.gzhead.extra.length&&(L(n,255&n.gzhead.extra.length),L(n,n.gzhead.extra.length>>8&255)),n.gzhead.hcrc&&(t.adler=c(t.adler,n.pending_buf,n.pending,0)),n.gzindex=0,n.status=69):(L(n,0),L(n,0),L(n,0),L(n,0),L(n,0),L(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),L(n,3),n.status=C);else{var s=v+(n.w_bits-8<<4)<<8;s|=(2<=n.strategy||n.level<2?0:n.level<6?1:6===n.level?2:3)<<6,0!==n.strstart&&(s|=32),s+=31-s%31,n.status=C,N(n,s),0!==n.strstart&&(N(n,t.adler>>>16),N(n,65535&t.adler)),t.adler=1}if(69===n.status)if(n.gzhead.extra){for(r=n.pending;n.gzindex<(65535&n.gzhead.extra.length)&&(n.pending!==n.pending_buf_size||(n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),q(t),r=n.pending,n.pending!==n.pending_buf_size));)L(n,255&n.gzhead.extra[n.gzindex]),n.gzindex++;n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),n.gzindex===n.gzhead.extra.length&&(n.gzindex=0,n.status=73)}else n.status=73;if(73===n.status)if(n.gzhead.name){r=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),q(t),r=n.pending,n.pending===n.pending_buf_size)){i=1;break}L(n,i=n.gzindex<n.gzhead.name.length?255&n.gzhead.name.charCodeAt(n.gzindex++):0)}while(0!==i);n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),0===i&&(n.gzindex=0,n.status=91)}else n.status=91;if(91===n.status)if(n.gzhead.comment){r=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),q(t),r=n.pending,n.pending===n.pending_buf_size)){i=1;break}L(n,i=n.gzindex<n.gzhead.comment.length?255&n.gzhead.comment.charCodeAt(n.gzindex++):0)}while(0!==i);n.gzhead.hcrc&&n.pending>r&&(t.adler=c(t.adler,n.pending_buf,n.pending-r,r)),0===i&&(n.status=103)}else n.status=103;if(103===n.status&&(n.gzhead.hcrc?(n.pending+2>n.pending_buf_size&&q(t),n.pending+2<=n.pending_buf_size&&(L(n,255&t.adler),L(n,t.adler>>8&255),t.adler=0,n.status=C)):n.status=C),0!==n.pending){if(q(t),0===t.avail_out)return n.last_flush=-1,p}else if(0===t.avail_in&&I(e)<=I(a)&&e!==d)return D(t,-5);if(666===n.status&&0!==t.avail_in)return D(t,-5);if(0!==t.avail_in||0!==n.lookahead||e!==_&&666!==n.status){var h=2===n.strategy?function(t,e){for(var a;;){if(0===t.lookahead&&(H(t),0===t.lookahead)){if(e===_)return S;break}if(t.match_length=0,a=o._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++,a&&(T(t,!1),0===t.strm.avail_out))return S}return t.insert=0,e===d?(T(t,!0),0===t.strm.avail_out?E:U):t.last_lit&&(T(t,!1),0===t.strm.avail_out)?S:j}(n,e):3===n.strategy?function(t,e){for(var a,n,r,i,s=t.window;;){if(t.lookahead<=x){if(H(t),t.lookahead<=x&&e===_)return S;if(0===t.lookahead)break}if(t.match_length=0,t.lookahead>=z&&0<t.strstart&&(n=s[r=t.strstart-1])===s[++r]&&n===s[++r]&&n===s[++r]){i=t.strstart+x;do{}while(n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&n===s[++r]&&r<i);t.match_length=x-(i-r),t.match_length>t.lookahead&&(t.match_length=t.lookahead)}if(t.match_length>=z?(a=o._tr_tally(t,1,t.match_length-z),t.lookahead-=t.match_length,t.strstart+=t.match_length,t.match_length=0):(a=o._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++),a&&(T(t,!1),0===t.strm.avail_out))return S}return t.insert=0,e===d?(T(t,!0),0===t.strm.avail_out?E:U):t.last_lit&&(T(t,!1),0===t.strm.avail_out)?S:j}(n,e):l[n.level].func(n,e);if(h!==E&&h!==U||(n.status=666),h===S||h===E)return 0===t.avail_out&&(n.last_flush=-1),p;if(h===j&&(1===e?o._tr_align(n):5!==e&&(o._tr_stored_block(n,0,0,!1),3===e&&(O(n.head),0===n.lookahead&&(n.strstart=0,n.block_start=0,n.insert=0))),q(t),0===t.avail_out))return n.last_flush=-1,p}return e!==d?p:n.wrap<=0?1:(2===n.wrap?(L(n,255&t.adler),L(n,t.adler>>8&255),L(n,t.adler>>16&255),L(n,t.adler>>24&255),L(n,255&t.total_in),L(n,t.total_in>>8&255),L(n,t.total_in>>16&255),L(n,t.total_in>>24&255)):(N(n,t.adler>>>16),N(n,65535&t.adler)),q(t),0<n.wrap&&(n.wrap=-n.wrap),0!==n.pending?p:1)},a.deflateEnd=function(t){var e;return t&&t.state?(e=t.state.status)!==A&&69!==e&&73!==e&&91!==e&&103!==e&&e!==C&&666!==e?D(t,g):(t.state=null,e===C?D(t,-3):p):g},a.deflateSetDictionary=function(t,e){var a,n,r,i,s,h,l,o,_=e.length;if(!t||!t.state)return g;if(2===(i=(a=t.state).wrap)||1===i&&a.status!==A||a.lookahead)return g;for(1===i&&(t.adler=f(t.adler,e,_,0)),a.wrap=0,_>=a.w_size&&(0===i&&(O(a.head),a.strstart=0,a.block_start=0,a.insert=0),o=new u.Buf8(a.w_size),u.arraySet(o,e,_-a.w_size,a.w_size,0),e=o,_=a.w_size),s=t.avail_in,h=t.next_in,l=t.input,t.avail_in=_,t.next_in=0,t.input=e,H(a);a.lookahead>=z;){for(n=a.strstart,r=a.lookahead-(z-1);a.ins_h=(a.ins_h<<a.hash_shift^a.window[n+z-1])&a.hash_mask,a.prev[n&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=n,n++,--r;);a.strstart=n,a.lookahead=z-1,H(a)}return a.strstart+=a.lookahead,a.block_start=a.strstart,a.insert=a.lookahead,a.lookahead=0,a.match_length=a.prev_length=z-1,a.match_available=0,t.next_in=h,t.input=l,t.avail_in=s,a.wrap=i,p},a.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":1,"./adler32":3,"./crc32":4,"./messages":6,"./trees":7}],6:[function(t,e,a){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],7:[function(t,e,a){"use strict";var l=t("../utils/common"),h=0,o=1;function n(t){for(var e=t.length;0<=--e;)t[e]=0}var _=0,s=29,d=256,u=d+1+s,f=30,c=19,g=2*u+1,m=15,r=16,p=7,b=256,v=16,w=17,y=18,k=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],z=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],x=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],B=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],A=new Array(2*(u+2));n(A);var C=new Array(2*f);n(C);var S=new Array(512);n(S);var j=new Array(256);n(j);var E=new Array(s);n(E);var U,D,I,O=new Array(f);function q(t,e,a,n,r){this.static_tree=t,this.extra_bits=e,this.extra_base=a,this.elems=n,this.max_length=r,this.has_stree=t&&t.length}function i(t,e){this.dyn_tree=t,this.max_code=0,this.stat_desc=e}function T(t){return t<256?S[t]:S[256+(t>>>7)]}function L(t,e){t.pending_buf[t.pending++]=255&e,t.pending_buf[t.pending++]=e>>>8&255}function N(t,e,a){t.bi_valid>r-a?(t.bi_buf|=e<<t.bi_valid&65535,L(t,t.bi_buf),t.bi_buf=e>>r-t.bi_valid,t.bi_valid+=a-r):(t.bi_buf|=e<<t.bi_valid&65535,t.bi_valid+=a)}function R(t,e,a){N(t,a[2*e],a[2*e+1])}function H(t,e){for(var a=0;a|=1&t,t>>>=1,a<<=1,0<--e;);return a>>>1}function F(t,e,a){var n,r,i=new Array(m+1),s=0;for(n=1;n<=m;n++)i[n]=s=s+a[n-1]<<1;for(r=0;r<=e;r++){var h=t[2*r+1];0!==h&&(t[2*r]=H(i[h]++,h))}}function K(t){var e;for(e=0;e<u;e++)t.dyn_ltree[2*e]=0;for(e=0;e<f;e++)t.dyn_dtree[2*e]=0;for(e=0;e<c;e++)t.bl_tree[2*e]=0;t.dyn_ltree[2*b]=1,t.opt_len=t.static_len=0,t.last_lit=t.matches=0}function M(t){8<t.bi_valid?L(t,t.bi_buf):0<t.bi_valid&&(t.pending_buf[t.pending++]=t.bi_buf),t.bi_buf=0,t.bi_valid=0}function P(t,e,a,n){var r=2*e,i=2*a;return t[r]<t[i]||t[r]===t[i]&&n[e]<=n[a]}function G(t,e,a){for(var n=t.heap[a],r=a<<1;r<=t.heap_len&&(r<t.heap_len&&P(e,t.heap[r+1],t.heap[r],t.depth)&&r++,!P(e,n,t.heap[r],t.depth));)t.heap[a]=t.heap[r],a=r,r<<=1;t.heap[a]=n}function J(t,e,a){var n,r,i,s,h=0;if(0!==t.last_lit)for(;n=t.pending_buf[t.d_buf+2*h]<<8|t.pending_buf[t.d_buf+2*h+1],r=t.pending_buf[t.l_buf+h],h++,0===n?R(t,r,e):(R(t,(i=j[r])+d+1,e),0!==(s=k[i])&&N(t,r-=E[i],s),R(t,i=T(--n),a),0!==(s=z[i])&&N(t,n-=O[i],s)),h<t.last_lit;);R(t,b,e)}function Q(t,e){var a,n,r,i=e.dyn_tree,s=e.stat_desc.static_tree,h=e.stat_desc.has_stree,l=e.stat_desc.elems,o=-1;for(t.heap_len=0,t.heap_max=g,a=0;a<l;a++)0!==i[2*a]?(t.heap[++t.heap_len]=o=a,t.depth[a]=0):i[2*a+1]=0;for(;t.heap_len<2;)i[2*(r=t.heap[++t.heap_len]=o<2?++o:0)]=1,t.depth[r]=0,t.opt_len--,h&&(t.static_len-=s[2*r+1]);for(e.max_code=o,a=t.heap_len>>1;1<=a;a--)G(t,i,a);for(r=l;a=t.heap[1],t.heap[1]=t.heap[t.heap_len--],G(t,i,1),n=t.heap[1],t.heap[--t.heap_max]=a,t.heap[--t.heap_max]=n,i[2*r]=i[2*a]+i[2*n],t.depth[r]=(t.depth[a]>=t.depth[n]?t.depth[a]:t.depth[n])+1,i[2*a+1]=i[2*n+1]=r,t.heap[1]=r++,G(t,i,1),2<=t.heap_len;);t.heap[--t.heap_max]=t.heap[1],function(t,e){var a,n,r,i,s,h,l=e.dyn_tree,o=e.max_code,_=e.stat_desc.static_tree,d=e.stat_desc.has_stree,u=e.stat_desc.extra_bits,f=e.stat_desc.extra_base,c=e.stat_desc.max_length,p=0;for(i=0;i<=m;i++)t.bl_count[i]=0;for(l[2*t.heap[t.heap_max]+1]=0,a=t.heap_max+1;a<g;a++)c<(i=l[2*l[2*(n=t.heap[a])+1]+1]+1)&&(i=c,p++),l[2*n+1]=i,o<n||(t.bl_count[i]++,s=0,f<=n&&(s=u[n-f]),h=l[2*n],t.opt_len+=h*(i+s),d&&(t.static_len+=h*(_[2*n+1]+s)));if(0!==p){do{for(i=c-1;0===t.bl_count[i];)i--;t.bl_count[i]--,t.bl_count[i+1]+=2,t.bl_count[c]--,p-=2}while(0<p);for(i=c;0!==i;i--)for(n=t.bl_count[i];0!==n;)o<(r=t.heap[--a])||(l[2*r+1]!==i&&(t.opt_len+=(i-l[2*r+1])*l[2*r],l[2*r+1]=i),n--)}}(t,e),F(i,o,t.bl_count)}function V(t,e,a){var n,r,i=-1,s=e[1],h=0,l=7,o=4;for(0===s&&(l=138,o=3),e[2*(a+1)+1]=65535,n=0;n<=a;n++)r=s,s=e[2*(n+1)+1],++h<l&&r===s||(h<o?t.bl_tree[2*r]+=h:0!==r?(r!==i&&t.bl_tree[2*r]++,t.bl_tree[2*v]++):h<=10?t.bl_tree[2*w]++:t.bl_tree[2*y]++,i=r,(h=0)===s?(l=138,o=3):r===s?(l=6,o=3):(l=7,o=4))}function W(t,e,a){var n,r,i=-1,s=e[1],h=0,l=7,o=4;for(0===s&&(l=138,o=3),n=0;n<=a;n++)if(r=s,s=e[2*(n+1)+1],!(++h<l&&r===s)){if(h<o)for(;R(t,r,t.bl_tree),0!=--h;);else 0!==r?(r!==i&&(R(t,r,t.bl_tree),h--),R(t,v,t.bl_tree),N(t,h-3,2)):h<=10?(R(t,w,t.bl_tree),N(t,h-3,3)):(R(t,y,t.bl_tree),N(t,h-11,7));i=r,(h=0)===s?(l=138,o=3):r===s?(l=6,o=3):(l=7,o=4)}}n(O);var X=!1;function Y(t,e,a,n){var r,i,s,h;N(t,(_<<1)+(n?1:0),3),i=e,s=a,h=!0,M(r=t),h&&(L(r,s),L(r,~s)),l.arraySet(r.pending_buf,r.window,i,s,r.pending),r.pending+=s}a._tr_init=function(t){X||(function(){var t,e,a,n,r,i=new Array(m+1);for(n=a=0;n<s-1;n++)for(E[n]=a,t=0;t<1<<k[n];t++)j[a++]=n;for(j[a-1]=n,n=r=0;n<16;n++)for(O[n]=r,t=0;t<1<<z[n];t++)S[r++]=n;for(r>>=7;n<f;n++)for(O[n]=r<<7,t=0;t<1<<z[n]-7;t++)S[256+r++]=n;for(e=0;e<=m;e++)i[e]=0;for(t=0;t<=143;)A[2*t+1]=8,t++,i[8]++;for(;t<=255;)A[2*t+1]=9,t++,i[9]++;for(;t<=279;)A[2*t+1]=7,t++,i[7]++;for(;t<=287;)A[2*t+1]=8,t++,i[8]++;for(F(A,u+1,i),t=0;t<f;t++)C[2*t+1]=5,C[2*t]=H(t,5);U=new q(A,k,d+1,u,m),D=new q(C,z,0,f,m),I=new q(new Array(0),x,0,c,p)}(),X=!0),t.l_desc=new i(t.dyn_ltree,U),t.d_desc=new i(t.dyn_dtree,D),t.bl_desc=new i(t.bl_tree,I),t.bi_buf=0,t.bi_valid=0,K(t)},a._tr_stored_block=Y,a._tr_flush_block=function(t,e,a,n){var r,i,s=0;0<t.level?(2===t.strm.data_type&&(t.strm.data_type=function(t){var e,a=4093624447;for(e=0;e<=31;e++,a>>>=1)if(1&a&&0!==t.dyn_ltree[2*e])return h;if(0!==t.dyn_ltree[18]||0!==t.dyn_ltree[20]||0!==t.dyn_ltree[26])return o;for(e=32;e<d;e++)if(0!==t.dyn_ltree[2*e])return o;return h}(t)),Q(t,t.l_desc),Q(t,t.d_desc),s=function(t){var e;for(V(t,t.dyn_ltree,t.l_desc.max_code),V(t,t.dyn_dtree,t.d_desc.max_code),Q(t,t.bl_desc),e=c-1;3<=e&&0===t.bl_tree[2*B[e]+1];e--);return t.opt_len+=3*(e+1)+5+5+4,e}(t),r=t.opt_len+3+7>>>3,(i=t.static_len+3+7>>>3)<=r&&(r=i)):r=i=a+5,a+4<=r&&-1!==e?Y(t,e,a,n):4===t.strategy||i===r?(N(t,2+(n?1:0),3),J(t,A,C)):(N(t,4+(n?1:0),3),function(t,e,a,n){var r;for(N(t,e-257,5),N(t,a-1,5),N(t,n-4,4),r=0;r<n;r++)N(t,t.bl_tree[2*B[r]+1],3);W(t,t.dyn_ltree,e-1),W(t,t.dyn_dtree,a-1)}(t,t.l_desc.max_code+1,t.d_desc.max_code+1,s+1),J(t,t.dyn_ltree,t.dyn_dtree)),K(t),n&&M(t)},a._tr_tally=function(t,e,a){return t.pending_buf[t.d_buf+2*t.last_lit]=e>>>8&255,t.pending_buf[t.d_buf+2*t.last_lit+1]=255&e,t.pending_buf[t.l_buf+t.last_lit]=255&a,t.last_lit++,0===e?t.dyn_ltree[2*a]++:(t.matches++,e--,t.dyn_ltree[2*(j[a]+d+1)]++,t.dyn_dtree[2*T(e)]++),t.last_lit===t.lit_bufsize-1},a._tr_align=function(t){var e;N(t,2,3),R(t,b,A),16===(e=t).bi_valid?(L(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):8<=e.bi_valid&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}},{"../utils/common":1}],8:[function(t,e,a){"use strict";e.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],"/lib/deflate.js":[function(t,e,a){"use strict";var s=t("./zlib/deflate"),h=t("./utils/common"),l=t("./utils/strings"),r=t("./zlib/messages"),i=t("./zlib/zstream"),o=Object.prototype.toString,_=0,d=-1,u=0,f=8;function c(t){if(!(this instanceof c))return new c(t);this.options=h.assign({level:d,method:f,chunkSize:16384,windowBits:15,memLevel:8,strategy:u,to:""},t||{});var e=this.options;e.raw&&0<e.windowBits?e.windowBits=-e.windowBits:e.gzip&&0<e.windowBits&&e.windowBits<16&&(e.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new i,this.strm.avail_out=0;var a=s.deflateInit2(this.strm,e.level,e.method,e.windowBits,e.memLevel,e.strategy);if(a!==_)throw new Error(r[a]);if(e.header&&s.deflateSetHeader(this.strm,e.header),e.dictionary){var n;if(n="string"==typeof e.dictionary?l.string2buf(e.dictionary):"[object ArrayBuffer]"===o.call(e.dictionary)?new Uint8Array(e.dictionary):e.dictionary,(a=s.deflateSetDictionary(this.strm,n))!==_)throw new Error(r[a]);this._dict_set=!0}}function n(t,e){var a=new c(e);if(a.push(t,!0),a.err)throw a.msg||r[a.err];return a.result}c.prototype.push=function(t,e){var a,n,r=this.strm,i=this.options.chunkSize;if(this.ended)return!1;n=e===~~e?e:!0===e?4:0,"string"==typeof t?r.input=l.string2buf(t):"[object ArrayBuffer]"===o.call(t)?r.input=new Uint8Array(t):r.input=t,r.next_in=0,r.avail_in=r.input.length;do{if(0===r.avail_out&&(r.output=new h.Buf8(i),r.next_out=0,r.avail_out=i),1!==(a=s.deflate(r,n))&&a!==_)return this.onEnd(a),!(this.ended=!0);0!==r.avail_out&&(0!==r.avail_in||4!==n&&2!==n)||("string"===this.options.to?this.onData(l.buf2binstring(h.shrinkBuf(r.output,r.next_out))):this.onData(h.shrinkBuf(r.output,r.next_out)))}while((0<r.avail_in||0===r.avail_out)&&1!==a);return 4===n?(a=s.deflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===_):2!==n||(this.onEnd(_),!(r.avail_out=0))},c.prototype.onData=function(t){this.chunks.push(t)},c.prototype.onEnd=function(t){t===_&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=h.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},a.Deflate=c,a.deflate=n,a.deflateRaw=function(t,e){return(e=e||{}).raw=!0,n(t,e)},a.gzip=function(t,e){return(e=e||{}).gzip=!0,n(t,e)}},{"./utils/common":1,"./utils/strings":2,"./zlib/deflate":5,"./zlib/messages":6,"./zlib/zstream":8}]},{},[])("/lib/deflate.js")});

/*!
 * Copyright (c) 2020 Acoustic, L.P. All rights reserved.
 *
 * NOTICE: This file contains material that is confidential and proprietary to
 * Acoustic, L.P. and/or other developers. No license is granted under any intellectual or
 * industrial property rights of Acoustic, L.P. except as may be provided in an agreement with
 * Acoustic, L.P. Any unauthorized copying or distribution of content from this file is
 * prohibited.
 *
 * @version 5.7.0.1915
 * @flags w3c,NDEBUG
 */
if(window.TLT){throw"Attempting to recreate TLT. Library may be included more than once on the page."}window.TLT=(function(){var w,q,z,H,n,C,d,f,D;function x(Q,J,K,R){var O=null,S=null,M=TLT.getModule("replay"),P=TLT.getModule("TLCookie"),T=TLT.getModule("performance"),L=null,N=D.getOriginAndPath();if(!J||typeof J!=="string"){return}if(!K||typeof K!=="string"){K=""}S={type:2,screenview:{type:Q,name:J,originalUrl:N.path,url:TLT.normalizeUrl(N.path),host:N.origin,referrer:K,title:document.title,queryParams:N.queryParams}};if(Q==="LOAD"){L={type:"screenview_load",name:J}}else{if(Q==="UNLOAD"){L={type:"screenview_unload",name:J}}}if(L&&M){O=M.onevent(L)}if(O){S.dcid=O}if(Q==="LOAD"||Q==="UNLOAD"){C.post("",S)}if(L&&P){P.onevent(L)}if(L&&T){T.onevent(L)}}var B=(new Date()).getTime(),v,F,E={},b={},h=false,j=null,t=(function(){var K,M=[];function L(Q){var N=f.framesBlacklist,P,O;K=K||[];Q=Q||null;if(typeof N!=="undefined"&&N.length>0){for(O=0;O<N.length;O+=1){P=z.queryAll(N[O],Q);if(P&&P.length>0){K=K.concat(P)}}M=M.concat(z.queryAll("iframe",Q))}}function J(N){if(D.indexOf(M,N)<0){L(N.ownerDocument)}return D.indexOf(K,N)>-1}J.clearCache=function(){K=null};return J}()),u=null,k={config:["getConfig","updateConfig","getCoreConfig","updateCoreConfig","getModuleConfig","updateModuleConfig","getServiceConfig","updateServiceConfig"],queue:["post","setAutoFlush","flushAll"],browserBase:["getXPathFromNode","processDOMEvent"]},y=(function(){var J={};return{normalizeModuleEvents:function(O,M,Q,L){var K=J[O],P=false,N=false;Q=Q||A._getLocalTop();L=L||Q.document;if(K){return}J[O]={loadFired:false,pageHideFired:false};D.forEach(M,function(R){switch(R.name){case"load":P=true;M.push(D.mixin(D.mixin({},R),{name:"pageshow"}));break;case"unload":N=true;M.push(D.mixin(D.mixin({},R),{name:"pagehide"}));M.push(D.mixin(D.mixin({},R),{name:"beforeunload"}));break;case"change":if(D.isLegacyIE&&A.getFlavor()==="w3c"){M.push(D.mixin(D.mixin({},R),{name:"propertychange"}))}break}});if(!P&&!N){delete J[O];return}J[O].silentLoad=!P;J[O].silentUnload=!N;if(!P){M.push({name:"load",target:Q})}if(!N){M.push({name:"unload",target:Q})}},canPublish:function(K,M){var L;if(J.hasOwnProperty(K)===false){return true}L=J[K];switch(M.type){case"load":L.pageHideFired=false;L.loadFired=true;return !L.silentLoad;case"pageshow":L.pageHideFired=false;M.type="load";return !L.loadFired&&!L.silentLoad;case"pagehide":M.type="unload";L.loadFired=false;L.pageHideFired=true;return !L.silentUnload;case"unload":case"beforeunload":M.type="unload";L.loadFired=false;return !L.pageHideFired&&!L.silentUnload}return true},isUnload:function(K){return typeof K==="object"?(K.type==="unload"||K.type==="beforeunload"||K.type==="pagehide"):false}}}()),G={},c={},a={},r=[],m=function(){},p=null,o=true,g=function(){},l=false,s=(function(){var J=window.location,L=J.pathname,K=J.hash,M="";return function(){var P=J.pathname,N=J.hash,O=M;if(P!==L){O=TLT.normalizeUrl(P+N)}else{if(N!==K){O=TLT.normalizeUrl(N)}}if(O!==M){if(M){x("UNLOAD",M)}x("LOAD",O);M=O;L=P;K=N}}}()),i=function(L,S){var M,K,N,R=false,J=f.blockedElements,P,Q,O;if(!J||!J.length){i=function(){return false};return R}if(!L||!L.nodeType){return R}S=S||D.getDocument(L);for(M=0,N=J.length;M<N&&!R;M+=1){Q=z.queryAll(J[M],S);for(K=0,O=Q.length;K<O&&!R;K+=1){P=Q[K];R=P.contains?P.contains(L):P===L}}return R},I=function(K){var J=false,L=["intent:","mailto:","sms:","tel:"];if(K&&D.getTagName(K)==="a"&&L.indexOf(K.protocol)!==-1){J=true}return J},e=function(){var L,O,N,K,S=D.getValue(f,"sessionIDUsesStorage",false),P=D.getValue(f,"sessionIDUsesCookie",true),J=f.sessionizationCookieName||"TLTSID",U,T="tltTabSid",M="tltTabId",R="tltUnload";try{if(!sessionStorage||!localStorage){return 0}}catch(Q){return 0}if(S){U=localStorage.getItem(J);if(U){O=U.split("|")[1]}}if(!O&&P){O=D.getCookieValue(J)}if(sessionStorage.getItem(R)===null){sessionStorage.removeItem(M)}sessionStorage.removeItem(R);L=sessionStorage.getItem(M);K=localStorage.getItem(T);N=localStorage.getItem(M);if(L===null){if(N===null){L=1}else{if(O===K){L=parseInt(N,10)+1}else{L=1}}localStorage.setItem(M,L);sessionStorage.setItem(M,L);if(O){localStorage.setItem(T,O)}}else{L=parseInt(L,10)}return L},A={_loadGlobalsForUnitTesting:function(J){D=J.utils;w=J.getService("ajax");q=J.getService("browserBase");z=J.getService("browser");H=J.getService("config");n=J.getService("domCapture");C=J.getService("queue");d=J.getService("serializer");f=H?H.getCoreConfig():null},getStartTime:function(){return B},getPageId:function(){return v||"#"},getTabId:function(){return F},getLibraryVersion:function(){return"5.7.0.1915"},getCurrentWebEvent:function(){return G},normalizeUrl:function(M,L){var K,J;if(typeof L==="undefined"){L=M}K=this.getCoreConfig();if(K.normalization&&K.normalization.urlFunction){J=K.normalization.urlFunction;if(typeof J==="string"){J=D.access(J)}return J(L)}return L},getSessionStart:function(){return this.getService("message").getSessionStart()},init:function(K,L){var J;D=this.utils;if(D.isLegacyIE){return}p=L;if(!o){throw"init must only be called once!"}v="P."+D.getRandomString(28);o=false;J=function(M){M=M||window.event||{};if(M.type==="load"||document.readyState!=="loading"){if(document.removeEventListener){document.removeEventListener("DOMContentLoaded",J,false);window.removeEventListener("load",J,false)}else{document.detachEvent("onreadystatechange",J);window.detachEvent("onload",J)}m(K,L);F=e()}};if(document.readyState==="complete"||(document.readyState==="interactive"&&!D.isIE)){setTimeout(J)}else{if(document.addEventListener){document.addEventListener("DOMContentLoaded",J,false);window.addEventListener("load",J,false)}else{document.attachEvent("onreadystatechange",J);window.attachEvent("onload",J)}}},isInitialized:function(){return h},getState:function(){return j},destroy:function(L){var M="",K="",Q=null,N=null,J=null,O=false;if(o){return false}this.stopAll();if(!L){for(M in c){if(c.hasOwnProperty(M)){K=M.split("|")[0];Q=c[M].target;O=c[M].delegateTarget||undefined;z.unsubscribe(K,Q,this._publishEvent,O)}}}for(N in b){if(b.hasOwnProperty(N)){J=b[N].instance;if(J&&typeof J.destroy==="function"){J.destroy()}b[N].instance=null}}t.clearCache();c={};h=false;o=true;j="destroyed";if(typeof p==="function"){try{p("destroyed")}catch(P){}}},_updateModules:function(L){var N=null,K=null,J=true;if(f&&f.modules){try{for(K in f.modules){if(f.modules.hasOwnProperty(K)){N=f.modules[K];if(E.hasOwnProperty(K)){if(N.enabled===false){this.stop(K);continue}this.start(K);if(N.events){this._registerModuleEvents(K,N.events,L)}}}}this._registerModuleEvents.clearCache()}catch(M){A.destroy();J=false}}else{J=false}return J},rebind:function(J){A._updateModules(J)},getSessionData:function(){if(!A.isInitialized()){return}var M=null,J=null,K,L;if(!f||!f.sessionDataEnabled){return null}J=f.sessionData||{};K=J.sessionQueryName;if(K){L=D.getQueryStringValue(K,J.sessionQueryDelim)}else{K=J.sessionCookieName||"TLTSID";L=D.getCookieValue(K)}if(K&&L){M=M||{};M.tltSCN=K;M.tltSCV=L;M.tltSCVNeedsHashing=!!J.sessionValueNeedsHashing}return M},logGeolocation:function(J){var K;if(!A.isInitialized()){return}if(!J||!J.coords){return}K={type:13,geolocation:{lat:D.getValue(J,"coords.latitude",0),"long":D.getValue(J,"coords.longitude",0),accuracy:Math.ceil(D.getValue(J,"coords.accuracy",0))}};C.post("",K)},logCustomEvent:function(L,J){if(!A.isInitialized()){return}var K=null;if(!L||typeof L!=="string"){L="CUSTOM"}J=J||{};K={type:5,customEvent:{name:L,data:J}};C.post("",K)},logExceptionEvent:function(M,K,J){if(!A.isInitialized()){return}var L=null;if(!M||typeof M!=="string"){return}K=K||"";J=J||"";L={type:6,exception:{description:M,url:K,line:J}};C.post("",L)},logFormCompletion:function(J,L){if(!A.isInitialized()){return}var K={type:15,formCompletion:{submitted:!!J,valid:(typeof L==="boolean"?L:null)}};C.post("",K)},logScreenviewLoad:function(L,K,J){if(!A.isInitialized()){return}x("LOAD",L,K,J)},logScreenviewUnload:function(J){if(!A.isInitialized()){return}x("UNLOAD",J)},logDOMCapture:function(J,M){var N=null,L,K,O;if(!this.isInitialized()){return N}if(D.isLegacyIE){return N}if(n){J=J||window.document;K=this.getServiceConfig("domCapture");M=D.mixin({},K.options,M);L=n.captureDOM(J,M);if(L){N=M.dcid||("dcid-"+D.getSerialNumber()+"."+(new Date()).getTime());L.dcid=N;L.eventOn=!!M.eventOn;O={type:12,domCapture:L};C.post("",O);if(M.qffd!==false&&!l&&O.domCapture.fullDOM){C.flush();l=true}}else{N=null}}return N},performDOMCapture:function(L,J,K){return this.logDOMCapture(J,K)},performFormCompletion:function(K,J,L){return this.logFormCompletion(J,L)},_bridgeCallback:function(K){var J=a[K];if(J&&J.enabled){return J}return null},logScreenCapture:function(){if(!A.isInitialized()){return}var J=A._bridgeCallback("screenCapture");if(J!==null){J.cbFunction()}},enableTealeafFramework:function(){if(!A.isInitialized()){return}var J=A._bridgeCallback("enableTealeafFramework");if(J!==null){J.cbFunction()}},disableTealeafFramework:function(){if(!A.isInitialized()){return}var J=A._bridgeCallback("disableTealeafFramework");if(J!==null){J.cbFunction()}},startNewTLFSession:function(){if(!A.isInitialized()){return}var J=A._bridgeCallback("startNewTLFSession");if(J!==null){J.cbFunction()}},currentSessionId:function(){if(!A.isInitialized()){return}var K,J=A._bridgeCallback("currentSessionId");if(J!==null){K=J.cbFunction()}return K},defaultValueForConfigurableItem:function(J){if(!A.isInitialized()){return}var L,K=A._bridgeCallback("defaultValueForConfigurableItem");if(K!==null){L=K.cbFunction(J)}return L},valueForConfigurableItem:function(J){if(!A.isInitialized()){return}var L,K=A._bridgeCallback("valueForConfigurableItem");if(K!==null){L=K.cbFunction(J)}return L},setConfigurableItem:function(K,M){if(!A.isInitialized()){return}var J=false,L=A._bridgeCallback("setConfigurableItem");if(L!==null){J=L.cbFunction(K,M)}return J},addAdditionalHttpHeader:function(K,M){if(!A.isInitialized()){return}var J=false,L=A._bridgeCallback("addAdditionalHttpHeader");if(L!==null){J=L.cbFunction(K,M)}return J},logCustomEventBridge:function(L,M,K){if(!A.isInitialized()){return}var J=false,N=A._bridgeCallback("logCustomEventBridge");if(N!==null){J=N.cbFunction(L,M,K)}return J},registerBridgeCallbacks:function(Q){var N,L,O,K=null,M,S,J,R=TLT.utils;if(!Q){return false}if(Q.length===0){a={};return false}try{for(N=0,O=Q.length;N<O;N+=1){K=Q[N];if(typeof K==="object"&&K.cbType&&K.cbFunction){M={enabled:K.enabled,cbFunction:K.cbFunction,cbOrder:K.order||0};if(R.isUndefOrNull(a[K.cbType])){a[K.cbType]=M}else{if(!R.isArray(a[K.cbType])){a[K.cbType]=[a[K.cbType]]}S=a[K.cbType];for(L=0,J=S.length;L<J;L+=1){if(S[L].cbOrder>M.cbOrder){break}}S.splice(L,0,M)}}}}catch(P){return false}return true},registerMutationCallback:function(J,L){var K;if(!J||typeof J!=="function"){return false}if(L){K=r.indexOf(J);if(K===-1){r.push(J)}}else{K=r.indexOf(J);if(K!==-1){r.splice(K--,1)}}return true},invokeMutationCallbacks:function(L){var M,J,Q,P,O,N=[],K=[];if(r.length===0){return}if(Map){O=new Map()}else{O=new D.WeakMap()}for(M=0;M<L.length;M++){P=L[M].target;if(P){Q=D.getDocument(P);if(O.get(Q)===undefined){if(Q.host){K.push(Q)}else{N.push(Q)}O.set(Q,true)}}}O.clear();for(M=0;M<r.length;M++){J=r[M];J(L,N,K)}},redirectQueue:function(M){var P,O,L,K,J,Q,N;if(!M||!M.length){return M}K=a.messageRedirect;if(!K){return M}if(!D.isArray(K)){J=[K]}else{J=K}for(O=0,Q=J.length;O<Q;O+=1){K=J[O];if(K&&K.enabled){for(P=0,L=M.length;P<L;P+=1){N=K.cbFunction(d.serialize(M[P]),M[P]);if(N&&typeof N==="object"){M[P]=N}else{M.splice(P,1);P-=1;L=M.length}}}}return M},_hasSameOrigin:function(J){try{return J.document.location.host===document.location.host&&J.document.location.protocol===document.location.protocol}catch(K){}return false},provideRequestHeaders:function(){var K=null,J=a.addRequestHeaders;if(J&&J.enabled){K=J.cbFunction()}return K},_registerModuleEvents:(function(){var L,N=0,M=function(R,Q,P){if(R==="window"){return Q}if(R==="document"){return P}return R};function O(P,V,X){var W=D.getDocument(X),R=A._getLocalTop(),Q=D.isIFrameDescendant(X),U,T,S;X=X||W;y.normalizeModuleEvents(P,V,R,W);if(Q){U=q.ElementData.prototype.examineID(X).id;if(typeof U==="string"){U=U.slice(0,U.length-1);for(T in c){if(c.hasOwnProperty(T)){for(S=0;S<c[T].length;S+=1){if(P===c[T][S]){if(T.indexOf(U)!==-1){delete c[T];break}}}}}}}D.forEach(V,function(Y){var ab=M(Y.target,R,W)||W,aa=M(Y.delegateTarget,R,W),Z="";if(Y.recurseFrames!==true&&Q){return}if(typeof ab==="string"){if(Y.delegateTarget&&A.getFlavor()==="jQuery"){Z=A._buildToken4delegateTarget(Y.name,ab,Y.delegateTarget);if(!c.hasOwnProperty(Z)){c[Z]=[P];c[Z].target=ab;c[Z].delegateTarget=aa;z.subscribe(Y.name,ab,A._publishEvent,aa,Z)}else{c[Z].push(P)}}else{D.forEach(z.queryAll(ab,X),function(ac){var ad=L.get(ac);if(!ad){ad=q.ElementData.prototype.examineID(ac);L.set(ac,ad)}Z=Y.name+"|"+ad.id+ad.idType;if(D.indexOf(c[Z],P)!==-1){return}c[Z]=c[Z]||[];c[Z].push(P);c[Z].target=ac;z.subscribe(Y.name,ac,A._publishEvent)})}}else{Z=A._buildToken4bubbleTarget(Y.name,ab,typeof Y.target==="undefined");if(!c.hasOwnProperty(Z)){c[Z]=[P];z.subscribe(Y.name,ab,A._publishEvent)}else{if(D.indexOf(c[Z],P)===-1){c[Z].push(P)}}}if(Z!==""){if(typeof ab!=="string"){c[Z].target=ab}}})}function K(P){var Q=D.getIFrameWindow(P);return(Q!==null)&&A._hasSameOrigin(Q)&&(Q.document!==null)&&Q.document.readyState==="complete"}function J(S,Q,W){W=W||A._getLocalTop().document;L=L||new D.WeakMap();O(S,Q,W);if(S!=="performance"){var V=null,R=null,P=z.queryAll("iframe, frame",W),U,T;for(U=0,T=P.length;U<T;U+=1){V=P[U];if(t(V)){continue}if(K(V)){R=D.getIFrameWindow(V);A._registerModuleEvents(S,Q,R.document);n.observeWindow(R);continue}N+=1;(function(Z,X,aa){var Y=null,ab={moduleName:Z,moduleEvents:X,hIFrame:aa,_registerModuleEventsDelayed:function(){var ac=null;if(!t(aa)){ac=D.getIFrameWindow(aa);if(A._hasSameOrigin(ac)){A._registerModuleEvents(Z,X,ac.document);n.observeWindow(ac)}}N-=1;if(!N){A._publishEvent({type:"loadWithFrames",custom:true})}}};D.addEventListener(aa,"load",function(){ab._registerModuleEventsDelayed()});if(D.isLegacyIE&&K(aa)){Y=D.getIFrameWindow(aa);D.addEventListener(Y.document,"readystatechange",function(){ab._registerModuleEventsDelayed()})}}(S,Q,V))}}}J.clearCache=function(){if(L){L.clear();L=null}};return J}()),_buildToken4currentTarget:function(K){var L=K.nativeEvent?K.nativeEvent.currentTarget:null,J=L?q.ElementData.prototype.examineID(L):{id:K.target?K.target.id:null,idType:K.target?K.target.idType:-1};return K.type+"|"+J.id+J.idType},_buildToken4delegateTarget:function(J,L,K){return J+"|"+L+"|"+K},_buildToken4bubbleTarget:function(K,Q,P,T){var N=A._getLocalTop(),J,U=function(V){var W=null;if(A._hasSameOrigin(J.parent)){D.forEach(z.queryAll("iframe, frame",J.parent.document),function(X){var Y=null;if(!t(X)){Y=D.getIFrameWindow(X);if(A._hasSameOrigin(Y)&&Y.document===V){W=X}}})}return W},R=D.getDocument(Q),S=null,M,L=K,O;if(R){J=R.defaultView||R.parentWindow}if(Q===window||Q===window.window){L+="|null-2|window"}else{if(P&&J&&A._hasSameOrigin(J.parent)&&typeof R!=="undefined"&&N.document!==R){S=U(R);if(S){M=q.ElementData.prototype.examineID(S);L+="|"+M.xPath+"-2"}}else{if(T&&T!==document&&A.getFlavor()==="jQuery"){L+="|null-2|"+D.getTagName(Q)+"|"+D.getTagName(T)}else{L+="|null-2|document"}}}return L},_reinitConfig:function(){A._updateModules()},_publishEvent:function(J){var K=null,M=null,O=(J.delegateTarget&&J.data)?J.data:A._buildToken4currentTarget(J),P=null,Q,R,S,L=null,T=false,U=false,W=J.delegateTarget||null,V,N;G=J;if(J.type.match(/^(click|change|blur|mouse|touch)/)){g();C.resetFlushTimer()}V=D.getValue(f,"screenviewAutoDetect",true);if(V){s()}if((J.type==="load"||J.type==="pageshow")&&!J.nativeEvent.customLoad){G={};return}if(J.type==="click"){u=J.target.element}if(J.type==="beforeunload"){T=false;N=(D.getTagName(u)==="a")?u:document.activeElement;if(N){if(I(N)){T=true}else{D.forEach(f.ieExcludedLinks,function(Y){var Z,X,aa=z.queryAll(Y);for(Z=0,X=aa?aa.length:0;Z<X;Z+=1){if(typeof aa[Z]!==undefined&&aa[Z]===u){T=true;G={};return}}})}}if(T){G={};return}}if(y.isUnload(J)){j="unloading"}if(J.type==="change"&&D.isLegacyIE&&A.getFlavor()==="w3c"&&(J.target.element.type==="checkbox"||J.target.element.type==="radio")){G={};return}if(J.type==="propertychange"){if(J.nativeEvent.propertyName==="checked"&&(J.target.element.type==="checkbox"||(J.target.element.type==="radio"&&J.target.element.checked))){J.type="change";J.target.type="INPUT"}else{G={};return}}if(J.target&&i(J.target.element)){G={};return}if(!c.hasOwnProperty(O)){if(J.hasOwnProperty("nativeEvent")){S=J.nativeEvent.currentTarget||J.nativeEvent.target}O=A._buildToken4bubbleTarget(J.type,S,true,W)}if(c.hasOwnProperty(O)){P=c[O];for(Q=0,R=P.length;Q<R;Q+=1){K=P[Q];M=A.getModule(K);L=D.mixin({},J);if(M&&A.isStarted(K)&&typeof M.onevent==="function"){U=y.canPublish(K,L);if(U){M.onevent(L)}}}}if(L&&L.type==="unload"&&U){A.destroy()}G={}},_getLocalTop:function(){return window.window},addModule:function(J,K){E[J]={creator:K,instance:null,context:null,messages:[]};if(this.isInitialized()){this.start(J)}},getModule:function(J){if(E[J]&&E[J].instance){return E[J].instance}return null},removeModule:function(J){this.stop(J);delete E[J]},isStarted:function(J){return E.hasOwnProperty(J)&&E[J].instance!==null},start:function(K){var L=E[K],J=null;if(L&&L.instance===null){L.context=new TLT.ModuleContext(K,this);J=L.instance=L.creator(L.context);if(typeof J.init==="function"){J.init()}}},startAll:function(){var J=null;for(J in E){if(E.hasOwnProperty(J)){this.start(J)}}},stop:function(K){var L=E[K],J=null;if(L&&L.instance!==null){J=L.instance;if(typeof J.destroy==="function"){J.destroy()}L.instance=L.context=null}},stopAll:function(){var J=null;for(J in E){if(E.hasOwnProperty(J)){this.stop(J)}}},addService:function(K,J){b[K]={creator:J,instance:null}},getService:function(J){if(b.hasOwnProperty(J)){if(!b[J].instance){try{b[J].instance=b[J].creator(this);if(typeof b[J].instance.init==="function"){b[J].instance.init()}}catch(K){D.clog("UIC terminated due to error when instanciating the "+J+" service.");throw K}if(typeof b[J].instance.getServiceName!=="function"){b[J].instance.getServiceName=function(){return J}}}return b[J].instance}return null},removeService:function(J){delete b[J]},broadcast:function(M){var L=0,J=0,N=null,K=null;if(M&&typeof M==="object"){for(N in E){if(E.hasOwnProperty(N)){K=E[N];if(D.indexOf(K.messages,M.type)>-1){if(typeof K.instance.onmessage==="function"){K.instance.onmessage(M)}}}}}},listen:function(J,L){var K=null;if(this.isStarted(J)){K=E[J];if(D.indexOf(K.messages,L)===-1){K.messages.push(L)}}},fail:function(L,K,J){L="UIC FAILED. "+L;try{A.destroy(!!J)}finally{D.clog(L);throw new A.UICError(L,K)}},UICError:(function(){function J(K,L){this.message=K;this.code=L}J.prototype=new Error();J.prototype.name="UICError";J.prototype.constructor=J;return J}()),getFlavor:function(){return"w3c"},isCrossOrigin:function(N,M){var L,K,J=[];if(M){J=M.split("//")}K=J.length>1?J[1]:M;if(K){K=K.split(":")[0]}if(N&&K&&(N.match(/^\s*http/)||N.match(/^\s*\/\//))&&!(N.match(K))){L=true}else{L=false}return L}};g=function(){var L=null,K=D.getValue(f,"inactivityTimeout",600000);if(!K){g=function(){};return}function J(){D.clog("UIC self-terminated due to inactivity timeout.");A.destroy()}g=function(){if(L){clearTimeout(L);L=null}L=setTimeout(J,K)};g()};m=function(K,X){var L,U,P,M,Y,J,N,W=null,O,Q,V,R;if(h){D.clog("TLT.init() called more than once. Ignoring.");return}if(TLT&&TLT.replay){return}H=A.getService("config");H.updateConfig(K);w=A.getService("ajax");q=A.getService("browserBase");z=A.getService("browser");n=A.getService("domCapture");C=A.getService("queue");d=A.getService("serializer");f=H.getCoreConfig();L=H.getModuleConfig("TLCookie")||{};M=L.sessionizationCookieName||"TLTSID";Y=D.getCookieValue(M);if(Y==="DND"){if(j!=="destroyed"){A.destroy()}return}if(!A._updateModules()){if(j!=="destroyed"){A.destroy()}return}if(H.subscribe){H.subscribe("configupdated",A._reinitConfig)}h=true;j="loaded";try{if(typeof TLFExtensionNotify==="function"){TLFExtensionNotify("Initialized")}}catch(T){}U=A.getServiceConfig("queue");P=U.queues||[];if(D.isLegacyIE||D.isIE9){W=D.getOriginAndPath().origin}for(O=0;O<P.length;O+=1){if(W&&A.isCrossOrigin(P[O].endpoint,W)){D.clog("UIC terminated because IE 9 and below doesn't support cross-origin XHR");A.setAutoFlush(false);A.destroy();return}if(!Y&&L.tlAppKey){J=P[O].endpoint;N=P[O].killswitchURL||(J.match("collectorPost")?J.replace("collectorPost","switch/"+L.tlAppKey):null);if(N){w.sendRequest({type:"GET",url:N,async:true,timeout:5000,oncomplete:function(Z){if(Z.responseText==="0"||Z.data===0){A.setAutoFlush(false);D.setCookie(M,"DND");A.destroy()}}})}}if(P[O].checkEndpoint&&!U.asyncReqOnUnload){U.asyncReqOnUnload=true;w.sendRequest({oncomplete:function(Z){if(Z.success){U.asyncReqOnUnload=false}},timeout:P[O].endpointCheckTimeout||3000,url:P[O].endpoint,headers:{"X-PageId":v,"X-Tealeaf-SaaS-AppKey":L.tlAppKey,"X-Tealeaf-EndpointCheck":true},async:true,error:function(Z){if(Z.success){return}U.endpointCheckFailed=true}})}}R=function(ab){var aa,Z;aa={type:"load",target:window.window,srcElement:window.window,currentTarget:window.window,bubbles:true,cancelBubble:false,cancelable:true,timeStamp:+new Date(),customLoad:true};Z=new q.WebEvent(aa);A._publishEvent(Z);if(ab){z.unsubscribe(Q,V,R)}};if(f.screenviewLoadEvent){Q=f.screenviewLoadEvent.name;V=f.screenviewLoadEvent.target||window;z.subscribe(Q,V,R)}else{R()}if(A.isInitialized()){j="initialized";g()}if(typeof p==="function"){try{p(j)}catch(S){D.clog("Error in callback.",S)}}};(function(){var K=null,L,J;for(K in k){if(k.hasOwnProperty(K)){for(L=0,J=k[K].length;L<J;L+=1){(function(N,M){A[M]=function(){var O=this.getService(N);if(O){return O[M].apply(O,arguments)}}}(K,k[K][L]))}}}}());return A}());(function(){var a=window.navigator.userAgent.toLowerCase(),j=(a.indexOf("msie")!==-1||a.indexOf("trident")!==-1),b=(function(){var k=!!window.performance;return(j&&(!k||document.documentMode<9))}()),e=(function(){return(j&&document.documentMode===9)}()),f=(a.indexOf("android")!==-1),g=/(ipad|iphone|ipod)/.test(a),c=(a.indexOf("opera mini")!==-1),i=1,d={"a:":"link","button:button":"button","button:submit":"button","input:button":"button","input:checkbox":"checkBox","input:color":"colorPicker","input:date":"datePicker","input:datetime":"datetimePicker","input:datetime-local":"datetime-local","input:email":"emailInput","input:file":"fileInput","input:image":"button","input:month":"month","input:number":"numberPicker","input:password":"textBox","input:radio":"radioButton","input:range":"slider","input:reset":"button","input:search":"searchBox","input:submit":"button","input:tel":"tel","input:text":"textBox","input:time":"timePicker","input:url":"urlBox","input:week":"week","select:":"selectList","select:select-one":"selectList","textarea:":"textBox","textarea:textarea":"textBox"},h={isIE:j,isLegacyIE:b,isIE9:e,isAndroid:f,isLandscapeZeroDegrees:false,isiOS:g,isOperaMini:c,isUndefOrNull:function(k){return typeof k==="undefined"||k===null},isArray:function(k){return !!(k&&Object.prototype.toString.call(k)==="[object Array]")},getSerialNumber:function(){var k;k=i;i+=1;return k},getRandomString:function(p,o){var n,m,k="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",l="";if(!p){return l}if(typeof o!=="string"){o=k}for(n=0,m=o.length;n<p;n+=1){l+=o.charAt(Math.floor(Math.random()*m))}return l},getValue:function(p,o,l){var n,k,m;l=typeof l==="undefined"?null:l;if(!p||typeof p!=="object"||typeof o!=="string"){return l}m=o.split(".");for(n=0,k=m.length;n<k;n+=1){if(this.isUndefOrNull(p)||typeof p[m[n]]==="undefined"){return l}p=p[m[n]]}return p},indexOf:function(n,m){var l,k;if(n&&n.indexOf){return n.indexOf(m)}if(n&&n instanceof Array){for(l=0,k=n.length;l<k;l+=1){if(n[l]===m){return l}}}return -1},forEach:function(o,n,m){var l,k;if(!o||!o.length||!n||!n.call){return}for(l=0,k=o.length;l<k;l+=1){n.call(m,o[l],l,o)}},some:function(o,n){var l,k,m=false;for(l=0,k=o.length;l<k;l+=1){m=n(o[l],l,o);if(m){return m}}return m},convertToArray:function(m){var n=0,l=m.length,k=[];while(n<l){k.push(m[n]);n+=1}return k},mixin:function(o){var n,m,l,k;for(l=1,k=arguments.length;l<k;l+=1){m=arguments[l];for(n in m){if(Object.prototype.hasOwnProperty.call(m,n)){o[n]=m[n]}}}return o},extend:function(k,l,m){var n="";for(n in m){if(Object.prototype.hasOwnProperty.call(m,n)){if(k&&Object.prototype.toString.call(m[n])==="[object Object]"){if(typeof l[n]==="undefined"){l[n]={}}this.extend(k,l[n],m[n])}else{l[n]=m[n]}}}return l},clone:function(l){var m,k;if(null===l||"object"!==typeof l){return l}if(l instanceof Object){m=(Object.prototype.toString.call(l)==="[object Array]")?[]:{};for(k in l){if(Object.prototype.hasOwnProperty.call(l,k)){m[k]=this.clone(l[k])}}return m}},parseVersion:function(m){var n,k,l=[];if(!m||!m.length){return l}l=m.split(".");for(n=0,k=l.length;n<k;n+=1){l[n]=/^[0-9]+$/.test(l[n])?parseInt(l[n],10):l[n]}return l},isEqual:function(m,l){var n,o,q,p,k;if(m===l){return true}if(typeof m!==typeof l){return false}if(m instanceof Object&&l instanceof Object){if(Object.prototype.toString.call(m)==="[object Array]"&&Object.prototype.toString.call(l)==="[object Array]"){if(m.length!==l.length){return false}for(n=0,k=m.length;n<k;n+=1){if(!this.isEqual(m[n],l[n])){return false}}return true}if(Object.prototype.toString.call(m)==="[object Object]"&&Object.prototype.toString.call(l)==="[object Object]"){for(n=0;n<2;n+=1){for(q in m){if(m.hasOwnProperty(q)){if(!l.hasOwnProperty(q)){return false}o=this.isEqual(m[q],l[q]);if(!o){return false}}}p=m;m=l;l=p}return true}}return false},calculateRelativeXY:function(m){if(h.isUndefOrNull(m)||h.isUndefOrNull(m.x)||h.isUndefOrNull(m.y)||h.isUndefOrNull(m.width)||h.isUndefOrNull(m.height)){return"0.5,0.5"}var l=Math.abs(m.x/m.width).toFixed(4),k=Math.abs(m.y/m.height).toFixed(4);l=l>1||l<0?0.5:l;k=k>1||k<0?0.5:k;return l+","+k},createObject:(function(){var k=null,l=null;if(typeof Object.create==="function"){k=Object.create}else{l=function(){};k=function(m){if(typeof m!=="object"&&typeof m!=="function"){throw new TypeError("Object prototype need to be an object!")}l.prototype=m;return new l()}}return k}()),access:function(p,n){var o=n||window,l,m,k;if(typeof p!=="string"||(typeof o!=="object"&&o!==null)){return}l=p.split(".");for(m=0,k=l.length;m<k;m+=1){if(m===0&&l[m]==="window"){continue}if(!Object.prototype.hasOwnProperty.call(o,l[m])){return}o=o[l[m]];if(m<(k-1)&&!(o instanceof Object)){return}}return o},isNumeric:function(k){var l=false;if(h.isUndefOrNull(k)||!(/\S/.test(k))){return l}l=!isNaN(k*2);return l},isUpperCase:function(k){return k===k.toUpperCase()&&k!==k.toLowerCase()},isLowerCase:function(k){return k===k.toLowerCase()&&k!==k.toUpperCase()},extractResponseHeaders:function(m){var o={},l,k,n=null;if(!m||!m.length){m=[]}else{m=m.split("\n")}for(l=0,k=m.length;l<k;l+=1){n=m[l].split(": ");if(n.length===2){o[n[0]]=n[1]}}return o},getTargetState:function(r){var k={a:["innerText","href"],input:{range:["maxValue:max","value"],checkbox:["value","checked"],radio:["value","checked"],image:["src"]},select:["value"],button:["value","innerText"],textarea:["value"]},m=this.getTagName(r),s=k[m]||null,n=null,l=null,o=0,q=0,p=null,t="";if(s!==null){if(Object.prototype.toString.call(s)==="[object Object]"){s=s[r.type]||["value"]}l={};for(t in s){if(s.hasOwnProperty(t)){if(s[t].indexOf(":")!==-1){p=s[t].split(":");l[p[0]]=r[p[1]]}else{if(s[t]==="innerText"){l[s[t]]=this.trim(r.innerText||r.textContent)}else{l[s[t]]=r[s[t]]}}}}}if(m==="select"&&r.options&&!isNaN(r.selectedIndex)){l.index=r.selectedIndex;if(l.index>=0&&l.index<r.options.length){n=r.options[r.selectedIndex];l.value=n.getAttribute("value")||n.getAttribute("label")||n.text||n.innerText;l.text=n.text||n.innerText}}if(l&&r.disabled){l.disabled=true}return l},getDocument:function(k){var l=k;if(k&&k.nodeType!==9){if(k.getRootNode){l=k.getRootNode()}else{l=k.ownerDocument||k.document}}return l},getWindow:function(l){try{if(l.self!==l){var k=h.getDocument(l);return(!h.isUndefOrNull(k.defaultView))?(k.defaultView):(k.parentWindow)}}catch(m){l=null}return l},getOriginAndPath:function(s){var n={},u,v,q,t,r,k=[],l={},o,m;s=s||window.location;if(s.origin){n.origin=s.origin}else{n.origin=(s.protocol||"")+"//"+(s.host||"")}n.path=(s.pathname||"").split(";",1)[0];if(n.origin.indexOf("file://")>-1){u=n.path.match(/(.*)(\/.*app.*)/);if(u!==null){n.path=u[2]}}v=s.search||"";try{q=new URLSearchParams(v);q.forEach(function(x,w){l[w]=x})}catch(p){if(v.length>1&&v.charAt(0)==="?"){k=decodeURIComponent(v).substring(1).split("&")}for(o=0;o<k.length;o+=1){m=k[o].indexOf("=");if(m>-1){t=k[o].substring(0,m);r=k[o].substring(m+1);l[t]=r}}}n.queryParams=l;return n},getIFrameWindow:function(m){var k=null;if(!m){return k}try{k=m.contentWindow||(m.contentDocument?m.contentDocument.parentWindow:null)}catch(l){}return k},getTagName:function(l){var k="";if(h.isUndefOrNull(l)){return k}if(l===document||l.nodeType===9){k="document"}else{if(l===window||l===window.window){k="window"}else{if(typeof l==="string"){k=l.toLowerCase()}else{if(l.tagName){k=l.tagName.toLowerCase()}else{if(l.nodeName){k=l.nodeName.toLowerCase()}else{k=""}}}}}return k},getTlType:function(m){var k,l,n="";if(h.isUndefOrNull(m)||!m.type){return n}k=m.type.toLowerCase();l=k+":";if(m.subType){l+=m.subType.toLowerCase()}n=d[l]||k;return n},isIFrameDescendant:function(l){var k=h.getWindow(l);return(k?(k!=TLT._getLocalTop()):false)},getOrientationMode:function(k){var l="INVALID";if(typeof k!=="number"){return l}switch(k){case 0:case 180:case 360:l="PORTRAIT";break;case 90:case -90:case 270:l="LANDSCAPE";break;default:l="UNKNOWN";break}return l},clog:(function(k){return function(){}}(window)),trim:function(k){if(!k||!k.toString){return k}return k.toString().replace(/^\s+|\s+$/g,"")},ltrim:function(k){if(!k||!k.toString){return k}return k.toString().replace(/^\s+/,"")},rtrim:function(k){if(!k||!k.toString){return k}return k.toString().replace(/\s+$/,"")},setCookie:function(u,l,s,w,p,k){var q,r,o,n,m="",v,t=k?";secure":"";if(!u){return}u=encodeURIComponent(u);l=encodeURIComponent(l);o=(p||location.hostname).split(".");v=";path="+(w||"/");if(typeof s==="number"){if(this.isIE){n=new Date();n.setTime(n.getTime()+(s*1000));m=";expires="+n.toUTCString()}else{m=";max-age="+s}}for(r=o.length,q=(r===1?1:2);q<=r;q+=1){document.cookie=u+"="+l+";domain="+o.slice(-q).join(".")+v+m+t;if(this.getCookieValue(u)===l){break}if(r===1){document.cookie=u+"="+l+v+m+t}}},getCookieValue:function(q,s){var n,o,m,r,l=null,k;try{s=s||document.cookie;if(!q||!q.toString){return null}q+="=";k=q.length;r=s.split(";");for(n=0,o=r.length;n<o;n+=1){m=r[n];m=h.ltrim(m);if(m.indexOf(q)===0){l=m.substring(k,m.length);break}}}catch(p){l=null}return l},getQueryStringValue:function(o,r,k){var n,m,s,l=null,p;try{k=k||window.location.search;s=k.length;if(!o||!o.toString||!s){return null}r=r||"&";k=r+k.substring(1);o=r+o+"=";n=k.indexOf(o);if(n!==-1){p=n+o.length;m=k.indexOf(r,p);if(m===-1){m=s}l=decodeURIComponent(k.substring(p,m))}}catch(q){}return l},addEventListener:(function(){if(window.addEventListener){return function(l,k,m){l.addEventListener(k,m,false)}}return function(l,k,m){l.attachEvent("on"+k,m)}}()),matchTarget:function(u,q){var o,m,n,t=-1,s,k,l,p,r,v=document;if(!u||!q){return t}if(!this.browserService||!this.browserBaseService){this.browserService=TLT.getService("browser");this.browserBaseService=TLT.getService("browserBase")}if(q.idType===-2){n=this.browserBaseService.getNodeFromID(q.id,q.idType);v=this.getDocument(n)}for(o=0,p=u.length;o<p&&t===-1;o+=1){r=u[o];if(typeof r==="string"){s=this.browserService.queryAll(r,v);for(m=0,k=s?s.length:0;m<k;m+=1){if(s[m]){l=this.browserBaseService.ElementData.prototype.examineID(s[m]);if(l.idType===q.idType&&l.id===q.id){t=o;break}}}}else{if(r&&r.id&&r.idType&&q.idType&&q.idType.toString()===r.idType.toString()){switch(typeof r.id){case"string":if(r.id===q.id){t=o}break;case"object":if(!r.cRegex){r.cRegex=new RegExp(r.id.regex,r.id.flags)}r.cRegex.lastIndex=0;if(r.cRegex.test(q.id)){t=o}break}}}}return t},WeakMap:(function(){function k(o,n){var m,l;o=o||[];for(m=0,l=o.length;m<l;m+=1){if(o[m][0]===n){return m}}return -1}return function(){var l=[];this.set=function(n,o){var m=k(l,n);l[m>-1?m:l.length]=[n,o]};this.get=function(n){var m=l[k(l,n)];return(m?m[1]:undefined)};this.clear=function(){l=[]};this.has=function(m){return(k(l,m)>=0)};this.remove=function(n){var m=k(l,n);if(m>=0){l.splice(m,1)}};this["delete"]=this.remove}}())};if(typeof TLT==="undefined"||!TLT){window.TLT={}}TLT.utils=h}());(function(){TLT.EventTarget=function(){this._handlers={}};TLT.EventTarget.prototype={constructor:TLT.EventTarget,publish:function(c,f){var d=0,a=0,b=this._handlers[c],e={type:c,data:f};if(typeof b!=="undefined"){for(a=b.length;d<a;d+=1){b[d](e)}}},subscribe:function(a,b){if(!this._handlers.hasOwnProperty(a)){this._handlers[a]=[]}this._handlers[a].push(b)},unsubscribe:function(c,e){var d=0,a=0,b=this._handlers[c];if(b){for(a=b.length;d<a;d+=1){if(b[d]===e){b.splice(d,1);return}}}}}}());TLT.ModuleContext=(function(){var a=["broadcast","getConfig:getModuleConfig","listen","post","getXPathFromNode","performDOMCapture","performFormCompletion","isInitialized","getStartTime","normalizeUrl","getSessionStart","getTabId"];return function(f,d){var h={},g=0,b=a.length,j=null,e=null,c=null;for(g=0;g<b;g+=1){j=a[g].split(":");if(j.length>1){c=j[0];e=j[1]}else{c=j[0];e=j[0]}h[c]=(function(i){return function(){var k=d.utils.convertToArray(arguments);k.unshift(f);return d[i].apply(d,k)}}(e))}h.utils=d.utils;return h}}());TLT.addService("config",function(a){function d(f,e){a.utils.extend(true,f,e);c.publish("configupdated",c.getConfig())}var b={core:{},modules:{},services:{}},c=a.utils.extend(false,a.utils.createObject(new TLT.EventTarget()),{getConfig:function(){return b},updateConfig:function(e){d(b,e)},getCoreConfig:function(){return b.core},updateCoreConfig:function(e){d(b.core,e)},getServiceConfig:function(e){return b.services[e]||{}},updateServiceConfig:function(f,e){if(typeof b.services[f]==="undefined"){b.services[f]={}}d(b.services[f],e)},getModuleConfig:function(e){return b.modules[e]||{}},updateModuleConfig:function(f,e){if(typeof b.modules[f]==="undefined"){b.modules[f]={}}d(b.modules[f],e)},destroy:function(){b={core:{},modules:{},services:{}}}});return c});TLT.addService("queue",function(r){var M=r.utils,k=null,i={},G=600000,p=r.getService("ajax"),c=r.getService("browser"),e=r.getService("encoder"),v=r.getService("serializer"),E=r.getService("config"),s=r.getService("message"),A=null,m={},J=true,h=true,z={5:{limit:300,count:0},6:{limit:400,count:0}},d=[],C=false,q=true,I=true,u=(function(){var S={};function V(W){return typeof S[W]!=="undefined"}function O(W,X){if(!V(W)){S[W]={lastOffset:0,data:[],queueId:W,url:X.url,eventThreshold:X.eventThreshold,sizeThreshold:X.sizeThreshold||0,timerInterval:X.timerInterval,size:-1,serializer:X.serializer,encoder:X.encoder,crossDomainEnabled:!!X.crossDomainEnabled,crossDomainIFrame:X.crossDomainIFrame}}return S[W]}function Q(W){if(V(W)){delete S[W]}}function T(W){if(V(W)){return S[W]}return null}function R(X){var W=T(X);if(W!==null){W.data=[]}}function U(W){var X=null;if(V(W)){X=T(W).data;R(W)}return X}function P(Y,aa){var W=null,Z=null,ac=window.tlBridge,X=window.iOSJSONShuttle;try{Z=v.serialize(aa)}catch(ab){Z="Serialization failed: "+(ab.name?ab.name+" - ":"")+ab.message;aa={error:Z}}if((typeof ac!=="undefined")&&(typeof ac.addMessage==="function")){ac.addMessage(Z)}else{if((typeof X!=="undefined")&&(typeof X==="function")){X(Z)}else{if(V(Y)){W=T(Y);W.data.push(aa);W.data=r.redirectQueue(W.data);if(W.sizeThreshold){Z=v.serialize(W.data);W.size=Z.length}return W.data.length}}}return 0}return{exists:V,add:O,remove:Q,reset:function(){S={}},get:T,clear:R,flush:U,push:P}}());function n(O){if(q){I=true}if(O&&O.id){M.extend(true,d[O.id-1],{xhrRspEnd:s.createMessage({type:0}).offset,success:O.success,statusCode:O.statusCode,statusText:O.statusText})}}function x(){var O=M.getOriginAndPath(window.location);return r.normalizeUrl(O.path)}function B(Q,U,R,T){var O=u.get(Q),S={name:U,value:R},P=null;if(typeof U!=="string"||typeof R!=="string"){return}if(!O.headers){O.headers={once:[],always:[]}}P=!!T?O.headers.always:O.headers.once;P.push(S)}function g(Q,T){var S=0,P=0,O=u.get(Q),U=O.headers,R=null;T=T||{};function V(X,Z){var Y=0,W=0,aa=null;for(Y=0,W=X.length;Y<W;Y+=1){aa=X[Y];Z[aa.name]=aa.value}}if(U){R=[U.always,U.once];for(S=0,P=R.length;S<P;S+=1){V(R[S],T)}}return T}function o(P){var O=null,Q=null;if(!u.exists(P)){throw new Error("Queue: "+P+" does not exist!")}O=u.get(P);Q=O?O.headers:null;if(Q){Q.once=[]}}function l(){var P=0,O,R,Q=r.provideRequestHeaders();if(Q&&Q.length){for(P=0,O=Q.length;P<O;P+=1){R=Q[P];B("DEFAULT",R.name,R.value,R.recurring)}}return P}function L(S){var R,O,Q=[],P="";if(!S||!S.length){return P}for(R=0,O=S.length;R<O;R+=1){Q[S[R].type]=true}for(R=0,O=Q.length;R<O;R+=1){if(Q[R]){if(P){P+=","}P+=R}}return P}function j(Q,ac){var X=u.get(Q),W=X.url?u.flush(Q):null,Y=W?W.length:0,S={"Content-Type":"application/json","X-PageId":r.getPageId(),"X-Tealeaf":"device (UIC) Lib/5.7.0.1915","X-TealeafType":"GUI","X-TeaLeaf-Page-Url":x(),"X-Tealeaf-SyncXHR":(!!ac).toString()},aa=null,U=s.createMessage({type:0}).offset,ad=X.serializer||"json",P=X.encoder,T,V,O,R=k.tltWorker,ae,ab=null;if(!Y||!X){return}O=U-W[Y-1].offset;if(O>(G+60000)){return}I=false;X.lastOffset=W[Y-1].offset;S["X-Tealeaf-MessageTypes"]=L(W);W=s.wrapMessages(W);if(k.xhrLogging){aa=W.serialNumber;d[aa-1]={serialNumber:aa,xhrReqStart:U};W.log={xhr:d};if(k.endpointCheckFailed){W.log.endpointCheckFailed=true}}l();g(Q,S);if(R&&!ac){R.onmessage=function(ag){var af;af=ag.data;n(af)};ae={id:aa,url:X.url,headers:S,data:W};R.postMessage(ae)}else{if(ad){W=v.serialize(W,ad)}if(P){V=e.encode(W,P);if(V){if(V.data&&!V.error){if(!(V.data instanceof window.ArrayBuffer)){V.error="Encoder did not apply "+P+" encoding."}else{if(V.data.byteLength<W.length){W=V.data;S["Content-Encoding"]=V.encoding}else{V.error=P+" encoder did not reduce payload ("+V.data.byteLength+") compared to original data ("+W.length+")"}}}if(V.error){r.logExceptionEvent("EncoderError: "+V.error,"UIC",-1)}}}if(X.crossDomainEnabled){ab=M.getIFrameWindow(X.crossDomainIFrame);if(!ab){return}T={request:{id:aa,url:X.url,async:!ac,headers:S,data:W}};if(typeof window.postMessage==="function"){ab.postMessage(T,X.crossDomainIFrame.src)}else{try{ab.sendMessage(T)}catch(Z){return}}I=true}else{p.sendRequest({id:aa,oncomplete:n,url:X.url,async:!ac,headers:S,data:W})}}o(Q)}function K(R){var O=null,Q=k.queues,P=0;for(P=0;P<Q.length;P+=1){O=Q[P];j(O.qid,R)}return true}function N(R,T){var Q,P,U=s.createMessage(T),O=u.get(R),S,V;P=O.data.length;if(P){V=U.offset-O.data[P-1].offset;if(V>G){u.flush(R);r.destroy();return}}P=u.push(R,U);S=O.size;if(q&&!I){return}if((P>=O.eventThreshold||S>=O.sizeThreshold)&&J&&r.getState()!=="unloading"){Q=r.getCurrentWebEvent();if(Q.type==="click"&&!k.ddfoc){if(h){h=false;window.setTimeout(function(){if(u.exists(R)){j(R);h=true}},500)}}else{j(R)}}}function a(Q){var O,P=false;if(!Q||!Q.type){return true}O=z[Q.type];if(O){O.count+=1;if(O.count>O.limit){P=true;if(O.count===O.limit+1){N("DEFAULT",{type:16,dataLimit:{messageType:Q.type,maxCount:O.limit}})}}}return P}function H(Q){var P=null,T=k.queues,S="",R=0,O=0;for(R=0;R<T.length;R+=1){P=T[R];if(P&&P.modules){for(O=0;O<P.modules.length;O+=1){S=P.modules[O];if(S===Q){return P.qid}}}}return A.qid}function y(Q,O){m[Q]=window.setTimeout(function P(){if(J&&(!q||(q&&I))){j(Q)}m[Q]=window.setTimeout(P,O)},O)}function f(P){var O=false;if(P&&m[P]){window.clearTimeout(m[P]);delete m[P];O=true}return O}function w(){var O=0;for(O in m){if(m.hasOwnProperty(O)){f(O)}}m={}}function b(P){var O;if(!P){return}if(f(P)){O=u.get(P);if(O.timerInterval){y(P,O.timerInterval)}}}function F(O){}function t(O){k=O;i=r.getCoreConfig();G=M.getValue(i,"inactivityTimeout",600000);q=M.getValue(k,"serializePost",true);M.forEach(k.queues,function(P,Q){var R=null;if(P.qid==="DEFAULT"){A=P}if(P.crossDomainEnabled){R=c.query(P.crossDomainFrameSelector);if(!R){r.fail("Cross domain iframe not found")}}u.add(P.qid,{url:P.endpoint,eventThreshold:P.maxEvents,sizeThreshold:P.maxSize||0,serializer:P.serializer,encoder:P.encoder,timerInterval:P.timerInterval||0,crossDomainEnabled:P.crossDomainEnabled||false,crossDomainIFrame:R});if(typeof P.timerInterval!=="undefined"&&P.timerInterval>0){y(P.qid,P.timerInterval)}});E.subscribe("configupdated",F);C=true}function D(){if(J){K(!k.asyncReqOnUnload)}E.unsubscribe("configupdated",F);w();u.reset();k=null;A=null;C=false}return{init:function(){if(!C){t(E.getServiceConfig("queue")||{})}else{}},destroy:function(){D()},_getQueue:function(O){return u.get(O).data},setAutoFlush:function(O){if(O===true){J=true}else{J=false}},flush:function(O){O=O||A.qid;if(!u.exists(O)){throw new Error("Queue: "+O+" does not exist!")}j(O)},flushAll:function(O){return K(!!O)},post:function(P,Q,O){if(!r.isInitialized()){return}O=O||H(P);if(!u.exists(O)){return}if(!a(Q)){N(O,Q)}},resetFlushTimer:function(O){O=O||A.qid;if(!u.exists(O)){return}b(O)}}});TLT.addService("browserBase",function(s){var h,M=s.utils,j={optgroup:true,option:true,nobr:true},q={},f,n=null,B,x,g,d,r,G=false;function t(){f=s.getService("config");n=s.getService("serializer");B=f?f.getServiceConfig("browser"):{};x=B.blacklist||[];g=B.customid||[];d=M.getValue(B,"normalizeTargetToParentLink",true)}function b(){t();if(f){f.subscribe("configupdated",t)}G=true}function H(){if(f){f.unsubscribe("configupdated",t)}G=false}function w(Q){var O,N,P;if(!Q||!Q.id||typeof Q.id!=="string"){return false}for(O=0,N=x.length;O<N;O+=1){if(typeof x[O]==="string"){if(Q.id===x[O]){return false}}else{if(typeof x[O]==="object"){if(!x[O].cRegex){x[O].cRegex=new RegExp(x[O].regex,x[O].flags)}x[O].cRegex.lastIndex=0;if(x[O].cRegex.test(Q.id)){return false}}}}return true}function p(P,Q){var N={type:null,subType:null},O;if(!P){return N}O=P.type;switch(O){case"focusin":O="focus";break;case"focusout":O="blur";break;default:break}N.type=O;return N}function z(O){var N={type:null,subType:null};if(!O){return N}N.type=M.getTagName(O);N.subType=O.type||null;return N}function c(N,P,O){var T={HTML_ID:"-1",XPATH_ID:"-2",ATTRIBUTE_ID:"-3"},S,Q=null,R;if(!N||!P){return Q}S=O||window.document;P=P.toString();if(P===T.HTML_ID){if(S.getElementById){Q=S.getElementById(N)}else{if(S.querySelector){Q=S.querySelector("#"+N)}}}else{if(P===T.ATTRIBUTE_ID){R=N.split("=");if(S.querySelector){Q=S.querySelector("["+R[0]+'="'+R[1]+'"]')}}else{if(P===T.XPATH_ID){Q=q.xpath(N,S)}}}return Q}r=(function(){var N={nobr:true};return function(T,Q,aa){var W,U,ad=document.documentElement,V=false,ac=null,S=null,Z=null,ab=[],O,Y=true,R=s._getLocalTop(),P="",X=false,ae;if(!T||!T.nodeType){return ab}if(T.nodeType===11){T=T.host;if(T){X=true}else{return ab}}while(Y){Y=false;P=M.getTagName(T);if(P==="window"){continue}if(P&&!X){if(N[P]){T=T.parentNode;Y=true;continue}}for(V=w(T);T&&(T.nodeType===1||T.nodeType===9)&&T!==document&&(Q||!V);V=w(T)){Z=T.parentNode;if(!Z){S=M.getWindow(T);if(!S||aa){O=[P,0];ab[ab.length]=O;return ab.reverse()}if(S===R){return ab.reverse()}T=S.frameElement;P=M.getTagName(T);Z=T.parentNode;continue}ac=Z.firstChild;if(!ac){ab.push(["XPath Error(1)"]);T=null;break}for(U=0;ac;ac=ac.nextSibling){if(ac.nodeType===1&&M.getTagName(ac)===P){if(ac===T){O=[P,U];if(X){O.push("h");X=false}ab[ab.length]=O;break}U+=1}}if(Z.nodeType===11){T=Z.host;X=true}else{T=Z}P=M.getTagName(T)}if(V&&!Q){O=[T.id];if(X){O.push("h");X=false}ab[ab.length]=O;if(M.isIFrameDescendant(T)){Y=true;T=M.getWindow(T).frameElement}else{if(!aa&&!ad.contains(T)){if(T.getRootNode){ae=T.getRootNode();if(ae){T=ae.host;X=true;Y=true}}}}}}return ab.reverse()}}());function D(N){var O="null";if(!N||!N.length){return O}O=n.serialize(N,"json");return O}function v(Q,O,S,P){var R,N;N=r(Q,!!O,!!P);if(S){R=N}else{R=D(N)}return R}function L(O){var P={left:-1,top:-1},N;O=O||document;N=O.documentElement||O.body.parentNode||O.body;P.left=Math.round((typeof window.pageXOffset==="number")?window.pageXOffset:N.scrollLeft);P.top=Math.round((typeof window.pageYOffset==="number")?window.pageYOffset:N.scrollTop);return P}function K(N){return N&&typeof N.originalEvent!=="undefined"&&typeof N.isDefaultPrevented!=="undefined"&&!N.isSimulated}function k(N){if(!N){return null}if(N.type&&N.type.indexOf("touch")===0){if(K(N)){N=N.originalEvent}if(N.type==="touchstart"){N=N.touches[N.touches.length-1]}else{if(N.type==="touchend"){N=N.changedTouches[0]}}}return N}function u(O){var T=O||window.event,R,U=document.documentElement,S=document.body,V=false,N=null,P,Q=0;if(K(T)){T=T.originalEvent}if(typeof O==="undefined"||typeof T.target==="undefined"){T.target=T.srcElement||window.window;T.timeStamp=Number(new Date());if(T.pageX===null||typeof T.pageX==="undefined"){T.pageX=T.clientX+((U&&U.scrollLeft)||(S&&S.scrollLeft)||0)-((U&&U.clientLeft)||(S&&S.clientLeft)||0);T.pageY=T.clientY+((U&&U.scrollTop)||(S&&S.scrollTop)||0)-((U&&U.clientTop)||(S&&S.clientTop)||0)}T.preventDefault=function(){this.returnValue=false};T.stopPropagation=function(){this.cancelBubble=true}}if(T.type==="click"){R=T.composedPath?T.composedPath():[];for(Q=0;Q<R.length;Q+=1){P=M.getTagName(R[Q]);if(P==="button"){V=true;N=R[Q];break}}if(V){return{originalEvent:T,target:N,srcElement:N,type:T.type,pageX:T.pageX,pageY:T.pageY}}}return T}function y(P){var O,N,Q,R=null;if(!P||!P.type){return null}if(P.type.indexOf("touch")===0){R=k(P).target}else{if(typeof P.composedPath==="function"){Q=P.composedPath();if(Q&&Q.length){R=Q[0];if(d){for(O=0,N=Q.length;O<N;O+=1){if(M.getTagName(Q[O])==="a"){R=Q[O];break}}}}else{R=P.target||window.window}}else{if(P.srcElement){R=P.srcElement}else{R=P.target}}}while(R&&j[M.getTagName(R)]){if(R.parentElement){R=R.parentElement}else{break}}if(R.nodeType===9&&R.documentElement){R=R.documentElement}return R}function J(O){var R=0,Q=0,P=document.documentElement,N=document.body;O=k(O);if(O){if(O.pageX||O.pageY){R=O.pageX;Q=O.pageY}else{if(O.clientX||O.clientY){R=O.clientX+(P?P.scrollLeft:(N?N.scrollLeft:0))-(P?P.clientLeft:(N?N.clientLeft:0));Q=O.clientY+(P?P.scrollTop:(N?N.scrollTop:0))-(P?P.clientTop:(N?N.clientTop:0))}}}return{x:R,y:Q}}q.xpath=function(V,X){var T=null,O,U=null,Y=false,N,R,Q,P,S,W;if(!V){return null}T=n.parse(V);X=X||document;O=X;if(!T){return null}for(R=0,S=T.length;R<S&&O;R+=1){U=T[R];Y=U.length>1&&U[U.length-1]==="h";if(U.length===1||(U.length===2&&Y)){if(X.getElementById){O=X.getElementById(U[0])}else{if(X.querySelector){O=X.querySelector("#"+U[0])}else{O=null}}}else{for(Q=0,P=-1,W=O.childNodes.length;Q<W;Q+=1){if(O.childNodes[Q].nodeType===1&&M.getTagName(O.childNodes[Q])===U[0].toLowerCase()){P+=1;if(P===U[1]){O=O.childNodes[Q];break}}}if(P!==U[1]){return null}}if(!O){return null}if(Y){if(R<S-1){if(!O.shadowRoot){return null}O=O.shadowRoot;X=O}}N=M.getTagName(O);if(N==="frame"||N==="iframe"){O=M.getIFrameWindow(O).document;X=O}}return(O===X||!O)?null:O};function m(N,O){this.x=Math.round(N||0);this.y=Math.round(O||0)}function a(O,N){this.width=Math.round(O||0);this.height=Math.round(N||0)}function e(O,P){var R,N,Q;P=y(O);R=this.examineID(P);N=z(P);Q=this.examinePosition(O,P);this.element=P;this.id=R.id;this.idType=R.idType;this.type=N.type;this.subType=N.subType;this.state=this.examineState(P);this.position=new m(Q.x,Q.y);this.position.relXY=Q.relXY;this.size=new a(Q.width,Q.height);this.xPath=R.xPath;this.name=R.name}e.HTML_ID=-1;e.XPATH_ID=-2;e.ATTRIBUTE_ID=-3;e.prototype.examineID=function(U,P){var S={id:"",idType:0,xPath:"",name:""},O=g.length,R,N,Q=document.documentElement;if(!U){return S}S.xPath=v(U,false,false,P);S.name=U.name;try{N=typeof Q.contains==="function"?Q.contains(U):true;if((P||N)&&(!M.getWindow(U)||!M.isIFrameDescendant(U))){if(w(U)){S.id=U.id;S.idType=e.HTML_ID}else{if(g.length&&U.attributes){while(O){O-=1;R=U.attributes[g[O]];if(typeof R!=="undefined"){S.id=g[O]+"="+(R.value||R);S.idType=e.ATTRIBUTE_ID}}}}}}catch(T){}if(!S.id){S.id=S.xPath;if(S.id!=="null"){S.idType=e.XPATH_ID}}return S};e.prototype.examineState=function(N){return M.getTargetState(N)};function F(){var O=1,P,R,N;if(document.body.getBoundingClientRect){try{P=document.body.getBoundingClientRect()}catch(Q){return O}R=P.right-P.left;N=document.body.offsetWidth;O=Math.round((R/N)*100)/100}return O}function o(O){var Q,N,P,S;if(!O||!O.getBoundingClientRect){return{x:0,y:0,width:0,height:0}}try{Q=O.getBoundingClientRect();S=L(document)}catch(R){return{x:0,y:0,width:0,height:0}}N={x:Q.left+S.left,y:Q.top+S.top,width:Q.right-Q.left,height:Q.bottom-Q.top};if(M.isIE){N.x-=document.documentElement.clientLeft;N.y-=document.documentElement.clientTop;P=F();if(P!==1){N.x=Math.round(N.x/P);N.y=Math.round(N.y/P);N.width=Math.round(N.width/P);N.height=Math.round(N.height/P)}}return N}e.prototype.examinePosition=function(O,P){var Q=J(O),N=o(P);N.x=(Q.x||Q.y)?Math.round(Math.abs(Q.x-N.x)):N.width/2;N.y=(Q.x||Q.y)?Math.round(Math.abs(Q.y-N.y)):N.height/2;N.relXY=M.calculateRelativeXY(N);return N};function I(){var N=(typeof window.orientation==="number")?window.orientation:0;if(M.isLandscapeZeroDegrees){if(Math.abs(N)===180||Math.abs(N)===0){N=90}else{if(Math.abs(N)===90){N=0}}}return N}function C(T){var Q,N,S,R,P,O;if(T){return T}S=s.getCoreConfig()||{};P=S.modules;T={};for(O in P){if(P.hasOwnProperty(O)&&P[O].events){for(Q=0,N=P[O].events.length;Q<N;Q+=1){R=P[O].events[Q];if(R.state){T[R.name]=R.state}}}}return T}function i(N){var O;h=C(h);if(h[N.type]){O=M.getValue(N,h[N.type],null)}return O}function l(O){var Q,N,P;this.data=O.data||null;this.delegateTarget=O.delegateTarget||null;if(O.gesture||(O.originalEvent&&O.originalEvent.gesture)){this.gesture=O.gesture||O.originalEvent.gesture;this.gesture.idType=(new e(this.gesture,this.gesture.target)).idType}O=u(O);Q=J(O);this.custom=false;this.nativeEvent=this.custom===true?null:O;this.position=new m(Q.x,Q.y);this.target=new e(O,O.target);this.orientation=I();P=i(O);if(P){this.target.state=P}this.timestamp=(new Date()).getTime();N=p(O,this.target);this.type=N.type;this.subType=N.subType}function E(N){if(s.isInitialized()){s._publishEvent(new l(N))}else{}}function A(U,T){var S="",P=[],O,R,N="",Q=[];if(!(this instanceof A)){return null}if(typeof U!=="object"||!U.nodeType){this.fullXpath="";this.xpath="";this.fullXpathList=[];this.xpathList=[];return}if(U.nodeType===3){U=U.parentElement}Q=r(U,false,T);O=Q[0];if(Q.length&&(O.length===1||(O.length===2&&O[1]==="h"))){P=r(U,true,T)}else{P=M.clone(Q)}this.xpath=D(Q);this.xpathList=Q;this.fullXpath=D(P);this.fullXpathList=P;R=P[P.length-1];this.isShadowHost=R?R[R.length-1]==="h":false;this.applyPrefix=function(X){var V,W;if(!(X instanceof A)||!X.fullXpathList.length){return}W=X.fullXpathList[X.fullXpathList.length-1];V=this.fullXpathList.shift();if(M.isEqual(V[0],W[0])){this.fullXpathList=X.fullXpathList.concat(this.fullXpathList)}else{this.fullXpathList.unshift(V);return}this.fullXpath=D(this.fullXpathList);V=this.xpathList.shift();if(V.length===1){this.xpathList.unshift(V);return}this.xpathList=X.xpathList.concat(this.xpathList);this.xpath=D(this.xpathList)};this.compare=function(V){if(!(V instanceof A)){return 0}return(this.fullXpathList.length-V.fullXpathList.length)};this.isSame=function(V){var W=false;if(!(V instanceof A)){return W}if(this.compare(V)===0){W=(this.fullXpath===V.fullXpath)}return W};this.containedIn=function(X,W){var Z,Y,V,aa;if(!(X instanceof A)){return false}if(X.fullXpathList.length>this.fullXpathList.length){return false}for(Z=0,V=X.fullXpathList.length;Z<V;Z+=1){if(!M.isEqual(X.fullXpathList[Z],this.fullXpathList[Z])){return false}}if(!W){for(Y=Z,V=this.fullXpathList.length;Y<V;Y+=1){aa=this.fullXpathList[Y];if(aa[aa.length-1]==="h"){return false}}}return true}}A.prototype=(function(){return{}}());return{init:function(){if(!G){b()}else{}},destroy:function(){H()},WebEvent:l,ElementData:e,Xpath:A,processDOMEvent:E,getNormalizedOrientation:I,getXPathFromNode:function(O,Q,N,R,P){return v(Q,N,R,P)},getNodeFromID:c,queryDom:q}});TLT.addService("browser",function(d){var m=d.utils,h=d.getService("config"),f=d.getService("browserBase"),n=d.getService("ajax"),g=null,c=null,k=h?h.getServiceConfig("browser"):{},b=m.getValue(k,"useCapture",true),l=false,e={NO_QUERY_SELECTOR:"NOQUERYSELECTOR"},p=function(q){return function(s){var r=new f.WebEvent(s);if(s.type==="resize"||s.type==="hashchange"){setTimeout(function(){q(r)},5)}else{q(r)}}},a={list2Array:function(s){var r=s.length,q=[],t;if(typeof s.length==="undefined"){return[s]}for(t=0;t<r;t+=1){q[t]=s[t]}return q},find:function(s,r,q){q=q||"css";return this.list2Array(this[q](s,r))},css:function(r,u){var v=this,y=null,w=document.getElementsByTagName("body")[0],x=k.jQueryObject?m.access(k.jQueryObject):window.jQuery,t=k.sizzleObject?m.access(k.sizzleObject):window.Sizzle;if(typeof document.querySelectorAll==="undefined"){v.css=function(A,z){z=z||document;return v.Sizzle(A,z)};if(typeof v.Sizzle==="undefined"){try{if(w===t("html > body",document)[0]){v.Sizzle=t}}catch(s){try{if(w===x(document).find("html > body").get()[0]){v.Sizzle=function(A,z){return x(z).find(A).get()}}}catch(q){d.fail("Neither querySelectorAll nor Sizzle was found.",e.NO_QUERY_SELECTOR)}}}}else{v.css=function(A,z){z=z||document;return z.querySelectorAll(A)}}return v.css(r,u)}},o=(function(){var q=new m.WeakMap();return{add:function(r){var s=q.get(r)||[p(r),0];s[1]+=1;q.set(r,s);return s[0]},find:function(r){var s=q.get(r);return s?s[0]:null},remove:function(r){var s=q.get(r);if(s){s[1]-=1;if(s[1]<=0){q.remove(r)}}}}}());function j(){var r=k.jQueryObject?m.access(k.jQueryObject):window.jQuery,q=k.sizzleObject?m.access(k.sizzleObject):window.Sizzle;if(!document.querySelectorAll&&!r&&!q){d.fail("querySelectorAll does not exist!",e.NO_QUERY_SELECTOR)}}function i(){a.xpath=f.queryDom.xpath;j();if(typeof document.addEventListener==="function"){g=function(s,q,r){s.addEventListener(q,r,b)};c=function(s,q,r){s.removeEventListener(q,r,b)}}else{if(typeof document.attachEvent!=="undefined"){g=function(s,q,r){s.attachEvent("on"+q,r)};c=function(s,q,r){s.detachEvent("on"+q,r)}}else{throw new Error("Unsupported browser")}}l=true}return{init:function(){if(!l){i()}else{}},destroy:function(){l=false},getServiceName:function(){return"W3C"},query:function(t,r,q){try{return a.find(t,r,q)[0]||null}catch(s){return[]}},queryAll:function(t,r,q){try{return a.find(t,r,q)}catch(s){return[]}},subscribe:function(q,t,r){var s=o.add(r);g(t,q,s)},unsubscribe:function(q,u,r){var s=o.find(r);if(s){try{c(u,q,s)}catch(t){}o.remove(r)}}}});TLT.addService("ajax",function(e){var k=e.utils,i,m=false,b=false,j=false;function g(p){var o="",n=[];for(o in p){if(p.hasOwnProperty(o)){n.push([o,p[o]])}}return n}function h(p){var o="",n="?";for(o in p){if(p.hasOwnProperty(o)){n+=encodeURIComponent(o)+"="+encodeURIComponent(p[o])+"&"}}return n.slice(0,-1)}function l(n){var p,q=false,o=h(n.headers);if(typeof n.data==="string"){p=n.data}else{p=n.data?new Uint8Array(n.data):""}q=navigator.sendBeacon(n.url+o,p);return q}function f(o){var q=o.headers||{},p=o.id||0,n=o.oncomplete||function(){};q["X-Requested-With"]="fetch";window.fetch(o.url,{method:o.type,headers:q,body:o.data,mode:"cors",cache:"no-store"}).then(function(s){var r={success:s.ok,statusCode:s.status,statusText:s.statusText,id:p};if(r.success){s.text().then(function(t){try{r.data=JSON.parse(t)}catch(u){r.data=t}n(r)})["catch"](function(t){r.statusCode=1;r.statusText=t.message;n(r)})}else{n(r)}})["catch"](function(s){var r={success:false,statusCode:2,statusText:s.message,id:p};n(r)})}function a(o){if(typeof o!=="function"){return}return function n(q){var s,p,r=false;if(!q){return}s=q.target;if(!s){return o(q)}p=s.status;if(p>=200&&p<300){r=true}o({headers:k.extractResponseHeaders(s.getAllResponseHeaders()),responseText:s.responseText,statusCode:p,statusText:s.statusText,id:s.id,success:r})}}function d(v){var u=i(),o=[["X-Requested-With","XMLHttpRequest"]],t=0,p=typeof v.async!=="boolean"?true:v.async,r="",s=null,q,n;if(v.headers){o=o.concat(g(v.headers))}if(v.contentType){o.push(["Content-Type",v.contentType])}u.open(v.type.toUpperCase(),v.url,p);for(q=0,n=o.length;q<n;q+=1){r=o[q];if(r[0]&&r[1]){u.setRequestHeader(r[0],r[1])}}if(v.error){v.error=a(v.error);u.addEventListener("error",v.error)}u.onreadystatechange=s=function(){if(u.readyState===4){u.onreadystatechange=s=function(){};if(v.timeout){window.clearTimeout(t)}v.oncomplete({id:v.id,headers:k.extractResponseHeaders(u.getAllResponseHeaders()),responseText:(u.responseText||null),statusCode:u.status,statusText:u.statusText,success:(u.status>=200&&u.status<300)});u=null}};u.send(v.data||null);s();if(v.timeout){t=window.setTimeout(function(){if(!u){return}u.onreadystatechange=function(){};if(u.readyState!==4){u.abort();if(typeof v.error==="function"){v.error({id:v.id,statusCode:u.status,statusText:"timeout",success:false})}}v.oncomplete({id:v.id,headers:k.extractResponseHeaders(u.getAllResponseHeaders()),responseText:(u.responseText||null),statusCode:u.status,statusText:"timeout",success:false});u=null},v.timeout)}}function c(){var n=e.getServiceConfig("queue");if(typeof window.XMLHttpRequest!=="undefined"){i=function(){return new XMLHttpRequest()}}else{i=function(){return new ActiveXObject("Microsoft.XMLHTTP")}}if(n){m=k.getValue(n,"useBeacon",true)&&(typeof navigator.sendBeacon==="function");b=k.getValue(n,"useFetch",true)&&(typeof window.fetch==="function")}j=true}return{init:function(){if(!j){c()}},destroy:function(){j=false},sendRequest:function(n){var p=e.getState()==="unloading",q=true,o;n.type=n.type||"POST";if((p||!n.async)&&m){q=false;o=l(n);if(!o){q=true}}if(q){if(n.async&&b&&!n.timeout){f(n)}else{d(n)}}}}});TLT.addService("domCapture",function(C){var j=C.getService("config"),k=C.getService("browserBase"),d=C.getService("browser"),y,i,g={maxMutations:100,maxLength:1000000,captureShadowDOM:false,captureFrames:false,removeScripts:true,removeComments:true},ab={childList:true,attributes:true,attributeOldValue:true,characterData:true,subtree:true},a=(typeof window.MutationObserver!=="undefined"),A,K=ab,S=[],N=[],z=[],ac=[],x=[],B=0,I=100,c=false,s=false,T=false,M=1,u=function(){},w=function(){},E=function(){},O=C._publishEvent,p=false,ag=C.utils;function J(){ac=[];x=[];B=0;c=false}function X(ak){var aj,ai,ah;if(!ak||!ak.length){return}ak=ak.sort(function(am,al){return am.compare(al)});for(aj=0;aj<ak.length;aj+=1){ah=ak[aj];for(ai=aj+1;ai<ak.length;ai+=0){if(ak[ai].containedIn(ah)){ak.splice(ai,1)}else{ai+=1}}}}function t(aj){var ai,ah;if(!aj){return aj}for(ai=0,ah=aj.length;ai<ah;ai+=1){delete aj[ai].oldValue}return aj}function e(al,aj){var ai,ah,ak=false;if(!al||!aj){return ak}for(ai=0,ah=al.length;ai<ah;ai+=1){if(al[ai].name===aj){ak=true;break}}return ak}function D(ak,am){var aj,ai,ah,al;for(aj=0,ai=ak.length,al=false;aj<ai;aj+=1){ah=ak[aj];if(ah.name===am.name){if(ah.oldValue===am.value){ak.splice(aj,1)}else{ah.value=am.value}al=true;break}}if(!al){ak.push(am)}return ak}function R(am,ah){var al,aj,ai,an,ap,ao,ak;am.removedNodes=ah.removedNodes.length;am.addedNodes=ag.convertToArray(ah.addedNodes);for(al=0,an=ac.length;al<an;al+=1){ao=ac[al];if(am.isSame(ao)){if(am.removedNodes){for(aj=0;aj<ah.removedNodes.length;aj+=1){ai=ao.addedNodes.indexOf(ah.removedNodes[aj]);if(ai!==-1){ao.addedNodes.splice(ai,1);am.removedNodes-=1}}}ao.removedNodes+=am.removedNodes;ao.addedNodes.concat(am.addedNodes);if(!ao.removedNodes&&!ao.addedNodes.length){ak=false;for(aj=0;aj<ac.length;aj+=1){if(ao!==ac[aj]&&ac[aj].containedIn(ao)){ak=true;break}}if(!ak){ac.splice(al,1)}}ap=true;break}}if(!ap){ac.push(am)}}function Y(ai,am){var ak,aj,ah,an=false,al,ao;for(ak=0,ah=ac.length;!an&&ak<ah;ak+=1){ao=ac[ak];if(ai.containedIn(ao)){al=ao.addedNodes;for(aj=0;aj<al.length;aj+=1){if(al[aj].contains&&al[aj].contains(am)){an=true;break}}}}return an}function H(aj,ai){var am,ah,al,ak,an,ao=null;al=ai.attributeName;if(al==="checked"||al==="selected"){ao=k.ElementData.prototype.examineID(ai.target);if(y.isPrivacyMatched(ao)){return}ao=null}if(al==="value"){ao=k.ElementData.prototype.examineID(ai.target);ao.currState=ag.getTargetState(ai.target)||{};if(ao.currState.value){y.applyPrivacyToTarget(ao)}else{ao=null}}aj.attributes=[{name:al,oldValue:ai.oldValue,value:ao?ao.currState.value:ai.target.getAttribute(al)}];ak=aj.attributes[0];if(ak.oldValue===ak.value){return}for(am=0,ah=x.length,an=false;am<ah;am+=1){ao=x[am];if(aj.isSame(ao)){ao.attributes=D(ao.attributes,ak);if(!ao.attributes.length){x.splice(am,1)}else{if(Y(aj,ai.target)){x.splice(am,1)}}an=true;break}}if(!an&&!Y(aj,ai.target)){x.push(aj)}}function o(ak){var am,ah,al,ai,aj;if(!ak||!ak.length){return}B+=ak.length;if(B>=I){if(!c){c=true}return}for(am=0,ah=ak.length;am<ah;am+=1){ai=ak[am];aj=new k.Xpath(ai.target);if(aj){al=aj.fullXpathList;if(al.length&&al[0][0]==="html"){switch(ai.type){case"characterData":case"childList":R(aj,ai);break;case"attributes":H(aj,ai);break;default:ag.clog("Unknown mutation type: "+ai.type);break}}}}}function v(){var ah;ah=new window.MutationObserver(function(ai){if(ai){o(ai);ag.clog("Processed ["+ai.length+"] mutation records.");C.invokeMutationCallbacks(ai)}});return ah}function L(){var ah=Element.prototype.attachShadow;if(!A){return null}A.observe(window.document,K);if(ag.getValue(i,"options.captureShadowDOM",false)){Element.prototype.attachShadow=function(aj){var ai=ah.call(this,aj);if(this.shadowRoot){A.observe(this.shadowRoot,K)}return ai}}p=true;return A}function l(aj){var al,ah,ak,ao,an,ai,am=j.getCoreConfig();j.subscribe("configupdated",E);y=C.getService("message");i=aj;i.options=ag.mixin({},g,i.options);a=a&&ag.getValue(i,"diffEnabled",true);I=ag.getValue(i.options,"maxMutations",100);if(a){K=ag.getValue(i,"diffObserverConfig",ab);A=v();S.push(window)}ai=i.options.captureShadowDOM;if(ai&&!(window.ShadyDOM&&window.ShadyDOM.inUse)&&(Element.prototype.attachShadow||"").toString().indexOf("[native code]")<0){i.options.captureShadowDOM=false;ai=false}if(ai){for(ak in am.modules){if(am.modules.hasOwnProperty(ak)){an=am.modules[ak].events||[];for(al=0,ah=an.length;al<ah;al+=1){if(an[al].attachToShadows){ao=an[al].name;if(ag.indexOf(z,ao)===-1){z.push(ao)}}}}}}L();T=true}function W(){j.unsubscribe("configupdated",E);if(A){A.disconnect()}T=false}function q(){var ah;ah="tlt-"+ag.getSerialNumber();return ah}function h(an,al,am){var ak,aj,ao,ai,ah;if(!an||!an.getElementsByTagName||!al){return}if(am&&am.length===2){aj=am[0];ao=am[1]}ai=an.getElementsByTagName(al);if(ai&&ai.length){for(ak=ai.length-1;ak>=0;ak-=1){ah=ai[ak];if(!aj){ah.parentNode.removeChild(ah)}else{if(ah[aj]===ao){ah.parentNode.removeChild(ah)}}}}return an}function Q(aj,ah){var ai,ak;for(ai=0;aj.hasChildNodes()&&ai<aj.childNodes.length;ai+=1){ak=aj.childNodes[ai];if(ak.nodeType===ah){aj.removeChild(ak);ai-=1}else{if(ak.hasChildNodes()){Q(ak,ah)}}}return aj}function aa(aj){var ak,ai,ah=null;if(!aj){return ah}switch(aj.nodeType){case 1:ak=aj.ownerDocument;if(ak&&ak.documentElement===aj){ai=ak.doctype}break;case 9:ai=aj.doctype;break;default:break}if(ai){ah="<!DOCTYPE "+ai.name+(ai.publicId?' PUBLIC "'+ai.publicId+'"':"")+(!ai.publicId&&ai.systemId?" SYSTEM":"")+(ai.systemId?' "'+ai.systemId+'"':"")+">"}return ah}function Z(an,ao){var am,aj,al,ak,ai,ah;if(!ao){return}ak=an.getElementsByTagName("input");ai=ao.getElementsByTagName("input");if(ai){for(am=0,ah=ai.length;am<ah;am+=1){aj=ak[am];al=ai[am];switch(al.type){case"checkbox":case"radio":if(ag.isIE?aj.checked:al.checked){al.setAttribute("checked","checked")}else{al.removeAttribute("checked")}break;default:al.setAttribute("value",al.value);if(!al.getAttribute("type")){al.setAttribute("type","text")}break}}}}function m(an,ao){var ak,ah,am,ai,aj,al;if(!an||!an.getElementsByTagName||!ao||!ao.getElementsByTagName){return}ai=an.getElementsByTagName("textarea");al=ao.getElementsByTagName("textarea");if(ai&&al){for(ak=0,ah=ai.length;ak<ah;ak+=1){am=ai[ak];aj=al[ak];aj.setAttribute("value",am.value);aj.value=aj.textContent=am.value}}}function U(ah,am){var ai,ao,an,ap,ak,aj,al;if(!ah||!ah.getElementsByTagName||!am||!am.getElementsByTagName){return}ao=ah.getElementsByTagName("select");ap=am.getElementsByTagName("select");if(ao){for(ak=0,al=ao.length;ak<al;ak+=1){ai=ao[ak];an=ap[ak];for(aj=0;aj<ai.options.length;aj+=1){if(aj===ai.selectedIndex||ai.options[aj].selected){an.options[aj].setAttribute("selected","selected")}else{an.options[aj].removeAttribute("selected")}}}}}function F(ai){var ah,aj=null;if(ai){ah=ai.nodeType||-1;switch(ah){case 11:aj=ai.innerHTML;break;case 9:aj=ai.documentElement?ai.documentElement.outerHTML:"";break;case 1:aj=ai.outerHTML;break;default:aj=null;break}}return aj}function af(aj){var ah,ai=false;if(aj&&typeof aj==="object"){ah=aj.nodeType||-1;switch(ah){case 9:case 1:ai=true;break;default:ai=false;break}}return ai}function b(ao,ay,ai){var ar,aq,at,az,ap=["iframe","frame"],ax,aj,am,aw,ak,av,al={frames:[]},aA,an,ah;for(aq=0;aq<ap.length;aq+=1){az=ap[aq];aA=ao.getElementsByTagName(az);an=ay.getElementsByTagName(az);if(aA){for(ar=0,at=aA.length;ar<at;ar+=1){try{ax=aA[ar];aj=ag.getIFrameWindow(ax);if(aj&&aj.document&&aj.location.href!=="about:blank"){am=aj.document;aw=w(am,am.documentElement||am,"",ai);ak=q();an[ar].setAttribute("tltid",ak);aw.tltid=ak;ah=ag.getOriginAndPath(am.location);aw.host=ah.origin;aw.url=ah.path;aw.charset=am.characterSet||am.charset;av=an[ar].getAttribute("src");if(!av){av=aj.location.href;an[ar].setAttribute("src",av)}al.frames=al.frames.concat(aw.frames);delete aw.frames;al.frames.push(aw)}}catch(au){}}}}return al}function ad(ai){var aj,ah,ak;ai.TLTListeners=ai.TLTListeners||{};for(aj=0,ah=z.length;aj<ah;aj+=1){ak=z[aj];if(!ai.TLTListeners[ak]){d.subscribe(ak,ai,O);ai.TLTListeners[ak]=true}}}function f(ai,ar,at,al){var am,ap,aj,an,ah,ak,ao={shadows:[]};if(!ai||(!al&&!ai.children)){return ao}if(al){ah=[ai]}else{ah=ai.children}for(am=0,ap=ah.length;am<ap;am+=1){an=ah[am];if(an.shadowRoot){ak=new k.Xpath(an);aj=w(an.ownerDocument,an.shadowRoot,"",at);ao.shadows.push({root:aj.root,xpath:ak.xpath});ao.shadows=ao.shadows.concat(aj.shadows);ad(an.shadowRoot);if(a){try{A.observe(an.shadowRoot,K);an.shadowRoot.TLTListeners.mutation=true;if(ag.indexOf(N,an)===-1){N.push(an)}}catch(aq){ag.clog("Failed to observe shadow root.",aq,an)}}}aj=f(an,null,at);ao.shadows=ao.shadows.concat(aj.shadows)}return ao}function ae(an){var al,aj,ah,ak,ai,am,ao=0;if(!an){return ao}if(an.root){ao+=an.root.length;if(an.frames){for(al=0,ah=an.frames.length;al<ah;al+=1){if(an.frames[al].root){ao+=an.frames[al].root.length}}}}else{if(an.diffs){for(al=0,ah=an.diffs.length;al<ah;al+=1){am=an.diffs[al];ao+=am.xpath.length;if(am.root){ao+=am.root.length}else{if(am.attributes){for(aj=0,ak=am.attributes.length;aj<ak;aj+=1){ai=am.attributes[aj];ao+=ai.name.length;if(ai.value){ao+=ai.value.length}}}}}}}return ao}function V(){var ak,aj,ah,ai;for(ak=0,ah=ac.length;ak<ah&&x.length;ak+=1){ai=ac[ak];for(aj=0;aj<x.length;aj+=1){if(x[aj].containedIn(ai)){x.splice(aj,1);aj-=1}}}}function n(ak){var aj,ah,ai,al,am=[];if(!ak||!ak.children){return am}al=ak.children;for(aj=0,ah=al.length;aj<ah;aj+=1){ai=al[aj];if(ai.shadowRoot){if(!ai.shadowRoot.TLTListeners){am.push([ai,ai.shadowRoot])}am=am.concat(n(ai.shadowRoot))}am=am.concat(n(ai))}return am}function G(an,aj){var ak,ah,al,am,ai;if(!an||!aj){return}if(!aj.captureShadowDOM){return}ai=n(an,aj);for(ak=0,ah=ai.length,al=[];ak<ah;ak+=1){am=f(ai[ak][0],null,aj,true);al=al.concat(am.shadows)}return al}function r(am,aj){var an,ai,al,ak,ah;an=w(am,am.documentElement||am,null,aj);if(!an){an={}}an.charset=am.characterSet||am.charset;ai=ag.getOriginAndPath(am.location);an.host=ai.origin;an.url=ai.path;return an}function P(aq){var ak,am,ap={fullDOM:false,diffs:[],attributeDiffs:{}},ao,al,ai,an,ah;X(ac);V();al=aq.captureShadowDOM;aq.captureShadowDOM=false;for(ak=0,am=ac.length;ak<am;ak+=1){ah=ac[ak];an=k.getNodeFromID(ah.xpath,-2);if(ah.isShadowHost){an=an.shadowRoot}if(an===window.document.body){aq.captureShadowDOM=al;return r(window.document,aq)}ao=w(window.document,an,ah,aq);if(ao.shadows&&ao.shadows.length===0){delete ao.shadows}if(ao.frames&&ao.frames.length===0){delete ao.frames}ao.xpath=ah.xpath;ap.diffs.push(ao)}function aj(at,ar){if(!at||!at.name){return}ap.attributeDiffs[ao.xpath][at.name]={value:at.value}}for(ak=0,am=x.length;ak<am;ak+=1){ah=x[ak];ao={xpath:e(ah.attributes,"id")?ah.fullXpath:ah.xpath,attributes:t(ah.attributes)};ap.diffs.push(ao);ap.attributeDiffs[ao.xpath]={};ag.forEach(ao.attributes,aj)}aq.captureShadowDOM=al;ai=G(window.document,aq);if(ai&&ai.length){ap.shadows=ai}return ap}u=function(ah){var ai=null;if(af(ah)){ai=ah.cloneNode(true);if(!ai&&ah.documentElement){ai=ah.documentElement.cloneNode(true)}}return ai};w=function(aq,ao,am,ar){var aj=true,ah,ai,ap,al={},an,ak;if(!aq||!ao){return al}ah=u(ao,aq);if(!ah&&ao.host){aj=false}else{if(!ah){return al}}if(aj){if(!!ar.removeScripts){h(ah,"script");h(ah,"noscript")}if(!ar.keepImports){h(ah,"link",["rel","import"])}if(!!ar.removeComments){Q(ah,8)}U(ao,ah);Z(ao,ah);m(ao,ah);ah=y.applyPrivacyToNode(ah,am,aq);if(!!ar.captureFrames){ai=b(ao,ah,ar)}}if(!!ar.captureShadowDOM){ap=f(ao,ah,ar)}if(ai){al=ag.mixin(al,ai)}if(ap){al=ag.mixin(al,ap)}an=(aa(ao)||"")+F(ah||ao);al.root=y.applyPrivacyPatterns(an);return al};E=function(){j=C.getService("config");l(j.getServiceConfig("domCapture")||{})};return{init:function(){j=C.getService("config");if(!T){l(j.getServiceConfig("domCapture")||{})}else{}},destroy:function(){W()},observeWindow:function(aj){var ai,ah;if(!aj){return}if(!ag.getValue(i,"options.captureFrames",false)&&!(aj===window)){return}if(ag.indexOf(S,aj)===-1){S.push(aj);if(A&&p){A.observe(aj.document,K)}}},captureDOM:function(ai,aj){var ak,ah,an=null,al,ao=0;if(!T||(ag.isIE&&document.documentMode<10)){return an}aj=ag.mixin({},i.options,aj);ai=ai||window.document;if(!s||!a||c||aj.forceFullDOM){if(A){A.disconnect()}an=r(ai,aj);an.fullDOM=true;an.forced=!!(c||aj.forceFullDOM);s=true;if(A){for(ak=0,ah=S.length;ak<ah;ak+=1){al=S[ak];try{A.observe(al.document,K)}catch(am){S.splice(ak,1);ah=S.length;ak-=1}}}}else{an=P(aj);an.fullDOM=an.diffs?false:true}if(a){an.mutationCount=B}J();if(aj.maxLength){ao=ae(an);if(ao>aj.maxLength){an={errorCode:101,error:"Captured length ("+ao+") exceeded limit ("+aj.maxLength+")."}}}return an}}});TLT.addService("encoder",function(a){var f={},g=null,b=null,d=false;function e(j){var i=null;if(!j){return i}i=f[j];if(i&&typeof i.encode==="string"){i.encode=a.utils.access(i.encode)}return i}function h(i){f=i;g.subscribe("configupdated",b);d=true}function c(){g.unsubscribe("configupdated",b);d=false}b=function(){g=a.getService("config");h(g.getServiceConfig("encoder")||{})};return{init:function(){g=a.getService("config");if(!d){h(g.getServiceConfig("encoder")||{})}else{}},destroy:function(){c()},encode:function(m,l){var k,i,j={data:null,encoding:null,error:null};if((typeof m!=="string"&&!m)||!l){j.error="Invalid "+(!m?"data":"type")+" parameter.";return j}k=e(l);if(!k){j.error="Specified encoder ("+l+") not found.";return j}if(typeof k.encode!=="function"){j.error="Configured encoder ("+l+") 'encode' method is not a function.";return j}try{i=k.encode(m)}catch(n){j.error="Exception "+(n.name?n.name+" - ":"")+(n.message||n);return j}if(!i||a.utils.getValue(i,"buffer",null)===null){j.error="Encoder ("+l+") returned an invalid result.";return j}j.data=i.buffer;j.encoding=k.defaultEncoding;return j}}});TLT.addService("message",function(w){var R=w.utils,r=0,t=0,J=0,j=0,s=new Date(),i=w.getService("browserBase"),b=w.getService("browser"),h=w.getService("config"),B=h.getServiceConfig("message")||{},n=w.normalizeUrl(window.location.href),O=window.location.hostname,S=B.hasOwnProperty("privacy")?B.privacy:[],c,G={},P={lower:"x",upper:"X",numeric:"9",symbol:"@"},f=parseFloat((window.devicePixelRatio||1).toFixed(2)),g=window.screen||{},a=g.width||0,z=g.height||0,Q=i.getNormalizedOrientation(),k=!R.isiOS?a:Math.abs(Q)===90?z:a,E=!R.isiOS?z:Math.abs(Q)===90?a:z,M=(window.screen?window.screen.height-window.screen.availHeight:0),L=window.innerWidth||document.documentElement.clientWidth,o=window.innerHeight||document.documentElement.clientHeight,I=false,y={},m=false;function e(U){var T="",V=U.timestamp||(new Date()).getTime();delete U.timestamp;this.type=U.type;this.offset=V-s.getTime();this.screenviewOffset=0;if(U.type===2){r=t;t=V;if(U.screenview.type==="UNLOAD"){this.screenviewOffset=V-(r||s.getTime())}}else{if(t){this.screenviewOffset=V-t}}if(!this.type){return}this.count=(j+=1);this.fromWeb=true;for(T in U){if(U.hasOwnProperty(T)){this[T]=U[T]}}}G.PVC_MASK_EMPTY=function(T){return""};G.PVC_MASK_BASIC=function(U){var T="XXXXX";if(typeof U!=="string"){return""}return(U.length?T:"")};G.PVC_MASK_TYPE=function(X){var U,W=0,T=0,V="";if(typeof X!=="string"){return V}U=X.split("");for(W=0,T=U.length;W<T;W+=1){if(R.isNumeric(U[W])){V+=P.numeric}else{if(R.isUpperCase(U[W])){V+=P.upper}else{if(R.isLowerCase(U[W])){V+=P.lower}else{V+=P.symbol}}}}return V};G.PVC_MASK_EMPTY.maskType=1;G.PVC_MASK_BASIC.maskType=2;G.PVC_MASK_TYPE.maskType=3;G.PVC_MASK_CUSTOM={maskType:4};function d(T,V){var U=G.PVC_MASK_BASIC;if(typeof V!=="string"){return V}if(!T){U=G.PVC_MASK_BASIC}else{if(T.maskType===G.PVC_MASK_EMPTY.maskType){U=G.PVC_MASK_EMPTY}else{if(T.maskType===G.PVC_MASK_BASIC.maskType){U=G.PVC_MASK_BASIC}else{if(T.maskType===G.PVC_MASK_TYPE.maskType){U=G.PVC_MASK_TYPE}else{if(T.maskType===G.PVC_MASK_CUSTOM.maskType){if(typeof T.maskFunction==="string"){U=R.access(T.maskFunction)}else{U=T.maskFunction}if(typeof U!=="function"){U=G.PVC_MASK_BASIC}}}}}}return U(V)}function D(T,U){var V;if(!T||!U){return}for(V in U){if(U.hasOwnProperty(V)){if(V==="value"){U[V]=d(T,U[V])}else{delete U[V]}}}}function N(T,U){return(R.matchTarget(T,U)!==-1)}function H(Y){var U,T,V,X,W;if(!Y){return""}for(U=0,T=c.length;U<T;U+=1){W=c[U];W.cRegex.lastIndex=0;Y=Y.replace(W.cRegex,W.replacement)}return Y}function F(aa){var X,T,W,U,Z=false,Y,V;if(!aa||(!aa.currState&&!aa.prevState)||!aa.id){return aa}Y=aa.prevState;V=aa.currState;for(X=0,T=S.length;X<T;X+=1){U=S[X];W=R.getValue(U,"exclude",false);if(N(U.targets,aa)!==W){if(Y&&Y.hasOwnProperty("value")){D(U,Y)}if(V&&V.hasOwnProperty("value")){D(U,V)}Z=true;break}}if(!Z){if(Y&&Y.value){Y.value=H(Y.value)}if(V&&V.value){V.value=H(V.value)}}return aa}function p(T){if(!T||!T.target){return T}F(T.target);return T}function l(W,U){var V,T,Y,X;if(!U||!W){return}if(W.value){Y=d(U,W.value);W.setAttribute("value",Y);W.value=Y}if(W.checked){W.removeAttribute("checked")}if(R.getTagName(W)==="select"){W.selectedIndex=-1;for(V=0,T=W.options.length;V<T;V+=1){X=W.options[V];X.removeAttribute("selected");X.selected=false}}else{if(R.getTagName(W)==="textarea"){W.textContent=W.value}}}function v(af,ac,ag,al,Y,ab){var ah,ae,ad,ai,V,W,aa=[],aj,T,Z,X,ak,U;if(!af.length&&!Y.length&&!ab){return[]}U=b.queryAll("input, select, textarea",ac);if(!U||!U.length){return[]}for(ah=0,ai=Y.length;ah<ai;ah+=1){ae=U.indexOf(Y[ah]);if(ae!==-1){U.splice(ae,1)}}if(af.length){for(ah=0,ai=U.length,aa=[];ah<ai;ah+=1){if(U[ah].value){W=i.ElementData.prototype.examineID(U[ah],true);if(W.idType===-2){aj=new i.Xpath(U[ah],true);aj.applyPrefix(ag);W.id=aj.xpath}aa.push({id:W.id,idType:W.idType,element:U[ah]})}}}for(ah=0,ai=af.length;ah<ai;ah+=1){X=S[af[ah].ruleIndex];T=R.getValue(X,"exclude",false);ak=X.targets[af[ah].targetIndex];if(typeof ak.id==="string"&&ak.idType===-2){for(ae=0;ae<aa.length;ae+=1){if(aa[ae].idType===ak.idType&&aa[ae].id===ak.id){if(!T){V=aa[ae].element;l(V,X)}else{ad=U.indexOf(V);U.splice(ad,1)}}}}else{for(ae=0;ae<aa.length;ae+=1){ak.cRegex.lastIndex=0;if(aa[ae].idType===ak.idType&&ak.cRegex.test(aa[ae].id)){V=aa[ae].element;if(!T){l(V,X)}else{ad=U.indexOf(V);U.splice(ad,1)}}}}}if(ab){for(ah=0,ai=U.length;ah<ai;ah+=1){l(U[ah],ab)}}}function q(aa,af,al){var ag,ac,ab,V,T,W=[],Z,ah,ad,X,U,ai,ae=[],ak,aj,Y;if(!aa||!al){return null}for(ag=0,ah=S.length;ag<ah;ag+=1){ad=S[ag];T=R.getValue(ad,"exclude",false);if(T){Z=ad}aj=ad.targets;for(ac=0,Y=aj.length;ac<Y;ac+=1){ak=aj[ac];if(typeof ak==="string"){U=b.queryAll(ak,aa);if(!T){for(ab=0,ai=U.length;ab<ai;ab+=1){V=U[ab];l(V,ad)}}else{W=W.concat(U)}}else{if(typeof ak.id==="string"){switch(ak.idType){case -1:case -3:V=i.getNodeFromID(ak.id,ak.idType,aa);if(!T){l(V,ad)}else{W.push(V)}break;case -2:ae.push({ruleIndex:ag,targetIndex:ac,exclude:T});break;default:break}}else{ae.push({ruleIndex:ag,targetIndex:ac,exclude:T})}}}}v(ae,aa,af,al,W,Z);return aa}function u(X){var V,T,U,W=false;if(!X){return W}for(V=0,T=S.length;V<T;V+=1){U=S[V];if(N(U.targets,X)){W=true;break}}return W}function x(){var W,V,T,Z,aa,Y,U,X;h=w.getService("config");B=h.getServiceConfig("message")||{};S=B.privacy||[];c=B.privacyPatterns||[];m=B.shadowDomCacheEnabled||false;for(W=0,aa=S.length;W<aa;W+=1){Z=S[W];U=Z.targets;for(V=0,X=U.length;V<X;V+=1){Y=U[V];if(typeof Y==="object"){if(typeof Y.idType==="string"){Y.idType=+Y.idType}if(typeof Y.id==="object"){Y.cRegex=new RegExp(Y.id.regex,Y.id.flags)}}}}for(T=c.length,W=T-1;W>=0;W-=1){Z=c[W];if(typeof Z.pattern==="object"){Z.cRegex=new RegExp(Z.pattern.regex,Z.pattern.flags)}else{c.splice(W,1)}}}function A(){if(h.subscribe){h.subscribe("configupdated",x)}x();I=true}function K(){h.unsubscribe("configupdated",x);I=false}function C(ab){var Y=ab.dcid,V=ab.shadows||[],X=ab.fullDOM,ac=1,W,Z,aa,U,T;if(V.length===0||!X){return}for(aa in y){if(y.hasOwnProperty(aa)){y[aa].age+=1}}for(W=0,Z=V.length;W<Z;W+=1){U=V[W];T=y[U.xpath];if(T&&T.root===U.root){T.hitCount+=1;T.age-=1;U.cacheDCID=T.dcid;delete U.root}else{y[U.xpath]={root:U.root,dcid:Y,hitCount:0,age:0}}}for(aa in y){if(y.hasOwnProperty(aa)){T=y[aa];if(T.age>T.hitCount+ac){delete y[aa]}}}}return{init:function(){if(!I){A()}else{}},destroy:function(){K()},applyPrivacyToNode:q,applyPrivacyToMessage:p,applyPrivacyToTarget:F,applyPrivacyPatterns:H,isPrivacyMatched:u,createMessage:function(T){if(typeof T.type==="undefined"){throw new TypeError("Invalid queueEvent given!")}if(T.type===12&&m){C(T.domCapture)}return p(new e(T))},wrapMessages:function(U){var T={messageVersion:"11.0.0.0",serialNumber:(J+=1),sessions:[{id:w.getPageId(),tabId:w.getTabId(),startTime:s.getTime(),timezoneOffset:s.getTimezoneOffset(),messages:U,clientEnvironment:{webEnvironment:{libVersion:"5.7.0.1915",domain:O,page:n,referrer:document.referrer,screen:{devicePixelRatio:f,deviceWidth:k,deviceHeight:E,deviceToolbarHeight:M,width:L,height:o,orientation:Q}}}}]},V=T.sessions[0].clientEnvironment.webEnvironment.screen;V.orientationMode=R.getOrientationMode(V.orientation);return T},getSessionStart:function(){return s}}});TLT.addService("serializer",function(b){var d=b.getService("config"),j={},c={},k={json:(function(){if(typeof window.JSON!=="undefined"){return{serialize:window.JSON.stringify,parse:window.JSON.parse}}return{}}())},f=null,i=false;function e(q,o,m){var n,l,p;q=q||[];for(n=0,l=q.length;n<l;n+=1){p=q[n];if(typeof p==="string"){p=b.utils.access(p)}if(typeof p==="function"){o[m]=p;break}}}function h(){var l;if(typeof j.json!=="function"||typeof c.json!=="function"){l=true}else{if(typeof c.json('{"foo": "bar"}')==="undefined"){l=true}else{l=c.json('{"foo": "bar"}').foo!=="bar"}if(typeof c.json("[1, 2]")==="undefined"){l=true}else{l=l||c.json("[1, 2]")[0]!==1;l=l||c.json("[1,2]")[1]!==2}l=l||j.json({foo:"bar"})!=='{"foo":"bar"}';l=l||j.json([1,2])!=="[1,2]"}return l}function a(l){var m;for(m in l){if(l.hasOwnProperty(m)){e(l[m].stringifiers,j,m);e(l[m].parsers,c,m)}}j.json=j.json||k.json.serialize;c.json=c.json||k.json.parse;if(typeof j.json!=="function"||typeof c.json!=="function"){b.fail("JSON parser and/or serializer not provided in the UIC config. Can't continue.")}if(h()){b.fail("JSON stringification and parsing are not working as expected")}if(d){d.subscribe("configupdated",f)}i=true}function g(){j={};c={};if(d){d.unsubscribe("configupdated",f)}i=false}f=function(){d=b.getService("config");a(d.getServiceConfig("serializer"))};return{init:function(){var l;if(!i){l=d?d.getServiceConfig("serializer"):{};a(l)}else{}},destroy:function(){g()},parse:function(m,l){l=l||"json";return c[l](m)},serialize:function(n,m){var l;m=m||"json";l=j[m](n);return l}}});TLT.addModule("TLCookie",function(d){var j={},i=0,f=true,n=false,h="WCXSID",m="TLTSID",b="CoreID6",q,o,c=null,p,r=d.utils;function a(){var w="123456789",v=r.getRandomString(1,w)+r.getRandomString(31,w+"0");return v}function k(){var x=a(),v=!!j.secureTLTSID,w;r.setCookie(m,x,w,w,w,v);return r.getCookieValue(m)}function l(){if(c||!window.cmRetrieveUserID){return}try{window.cmRetrieveUserID(function(w){c=w})}catch(v){c=null}}function g(z){var v,w,y,x;if(!localStorage||!z){return}y=localStorage.getItem(z);if(y){w=y.split("|");v=parseInt(w[0],10);if(Date.now()>v){localStorage.removeItem(z)}else{x=w[1]}}return x}function u(x,w){var v;if(!localStorage||!x){return}w=w||a();v=Date.now()+i;localStorage.setItem(x,v+"|"+w);return g(x)}function e(v){var y=[];f=r.getValue(v,"sessionIDUsesCookie",true);n=r.getValue(v,"sessionIDUsesStorage",false);if(v.tlAppKey){p=v.tlAppKey;y.push({name:"X-Tealeaf-SaaS-AppKey",value:p})}if(v.visitorCookieName){b=v.visitorCookieName}if(v.wcxCookieName){h=v.wcxCookieName}q=r.getCookieValue(h);if(q){y.push({name:"X-WCXSID",value:q})}if(v.sessionizationCookieName){m=v.sessionizationCookieName}if(n){i=r.getValue(v,"sessionIDStorageTTL",600000);try{o=g(m)}catch(x){n=false}}if(!o&&f){o=r.getCookieValue(m)}if(!o){if(q){o=q}else{if(n){try{o=u(m)}catch(w){n=false}}if(!o&&f){o=k()}}}if(!o){o="Check7UIC7Cookie7Configuration77"}y.push({name:"X-Tealeaf-SaaS-TLTSID",value:o});if(y.length){TLT.registerBridgeCallbacks([{enabled:true,cbType:"addRequestHeaders",cbFunction:function(){return y}}])}}function s(A){var x,w,v=false,z,y=j.appCookieWhitelist;if(!y||!y.length){return v}for(x=0,w=y.length;x<w&&!v;x+=1){z=y[x];if(z.regex){if(!z.cRegex){z.cRegex=new RegExp(z.regex,z.flags)}z.cRegex.lastIndex=0;v=z.cRegex.test(A)}else{v=(z===A)}}return v}function t(){var z,y,A,B={},w,F=document.cookie,x=[],E="",v="";if(!F){return}x=F.split("; ");for(z=0,A=x.length;z<A;z+=1){w=x[z];y=w.indexOf("=");if(y>=0){try{E=decodeURIComponent(w.substr(0,y))}catch(D){E=w.substr(0,y)}}v=w.substr(y+1);if(s(E)){try{B[E]=decodeURIComponent(v)}catch(C){B[E]=v}}}if(c&&!B[b]){B[b]=c}d.post({type:14,cookies:B})}return{init:function(){j=d.getConfig()||{};e(j);l()},destroy:function(){if(n){u(m,o)}},onevent:function(v){switch(v.type){case"screenview_load":if(r.getValue(j,"appCookieWhitelist.length",0)){l();t()}break;default:break}}}});if(TLT&&typeof TLT.addModule==="function"){TLT.addModule("overstat",function(e){var A=e.utils,p={},C={updateInterval:250,hoverThreshold:1000,hoverThresholdMax:2*60*1000,gridCellMaxX:10,gridCellMaxY:10,gridCellMinWidth:20,gridCellMinHeight:20},d=50;function y(H){var I=e.getConfig()||{},J=I[H];return typeof J==="number"?J:C[H]}function G(N,H){var M=A.getValue(N,"webEvent.target",{}),I=A.getValue(M,"element.tagName")||"",J=I.toLowerCase()==="input"?A.getValue(M,"element.type"):"",L=A.getTlType(M),K={type:9,event:{hoverDuration:N.hoverDuration,hoverToClick:A.getValue(H,"hoverToClick")},target:{id:M.id||"",idType:M.idType||"",name:M.name||"",tlType:L,type:I,subType:J,position:{width:A.getValue(M,"element.offsetWidth",0),height:A.getValue(M,"element.offsetHeight",0),relXY:N.relXY}}};if((typeof K.target.id)===undefined||K.target.id===""){return}e.post(K)}function i(H){if(H&&!H.nodeType&&H.element){H=H.element}return H}function s(H){H=i(H);return !H||H===document.body||H===document.html||H===document}function j(H){H=i(H);if(!H){return null}return H.parentNode}function n(H){H=i(H);if(!H){return null}return H.offsetParent||H.parentElement||j(H)}function w(I,J){var H=0;if(!J||J===I){return false}J=j(J);while(!s(J)&&H++<d){if(J===I){return true}J=j(J)}if(H>=d){A.clog("Overstat isChildOf() hit iterations limit")}return false}function E(H){if(H.nativeEvent){H=H.nativeEvent}return H}function z(H){return E(H).target}function h(H){H=i(H);if(!H){return -1}return H.nodeType||-1}function D(H){H=i(H);if(!H){return""}return H.tagName?H.tagName.toUpperCase():""}function t(H){if(!H){return}if(H.nativeEvent){H=H.nativeEvent}if(H.stopPropagation){H.stopPropagation()}else{if(H.cancelBubble){H.cancelBubble()}}}function m(I){var H=D(I);return h(I)!==1||H==="TR"||H==="TBODY"||H==="THEAD"}function g(H){if(!H){return""}if(H.xPath){return H.xPath}H=i(H);return e.getXPathFromNode(H)}function B(I,H){var J=p[I];if(J&&J[H]){return J[H]()}}function v(I,K,J,H){this.xPath=I!==null?g(I):"";this.domNode=I;this.hoverDuration=0;this.hoverUpdateTime=0;this.gridX=Math.max(K,0);this.gridY=Math.max(J,0);this.parentKey="";this.updateTimer=-1;this.disposed=false;this.childKeys={};this.webEvent=H;this.getKey=function(){return this.xPath+":"+this.gridX+","+this.gridY};this.update=function(){var M=new Date().getTime(),L=this.getKey();if(this.hoverUpdateTime!==0){this.hoverDuration+=M-this.hoverUpdateTime}this.hoverUpdateTime=M;clearTimeout(this.updateTimer);this.updateTimer=setTimeout(function(){B(L,"update")},y("updateInterval"))};this.dispose=function(L){clearTimeout(this.updateTimer);delete p[this.getKey()];this.disposed=true;if(L){var M=this.clone();p[M.getKey()]=M;M.update()}};this.process=function(P){clearTimeout(this.updateTimer);if(this.disposed){return false}var N=false,O=this,M=null,L=0;if(this.hoverDuration>=y("hoverThreshold")){this.hoverDuration=Math.min(this.hoverDuration,y("hoverThresholdMax"));N=true;G(this,{hoverToClick:!!P});while(typeof O!=="undefined"&&L++<d){O.dispose(P);O=p[O.parentKey]}if(L>=d){A.clog("Overstat process() hit iterations limit")}}else{this.dispose(P)}return N};this.clone=function(){var L=new v(this.domNode,this.gridX,this.gridY);L.parentKey=this.parentKey;return L}}function F(J,H,K,I){return new v(J,H,K,I)}function r(J){if(J&&J.position){return{x:J.position.x,y:J.position.y}}J=i(J);var H=J&&J.getBoundingClientRect?J.getBoundingClientRect():null,N=H?H.left:(J?J.offsetLeft:0),M=H?H.top:(J?J.offsetHeight:0),P=N,O=M,K=0,I=0,L=n(J),Q=0;while(L&&Q++<d){if(s(L)){break}K=L.offsetLeft-(L.scrollLeft||0);I=L.offsetTop-(L.scrollTop||0);if(K!==P||I!==O){N+=K;M+=I;P=K;O=I}L=n(L)}if(Q>=d){A.clog("Overstat calculateNodeOffset() hit iterations limit")}if(isNaN(N)){N=0}if(isNaN(M)){M=0}return{x:N,y:M}}function a(L,J,I){L=i(L);var K=r(L),H=J-K.x,M=I-K.y;if(!isFinite(H)){H=0}if(!isFinite(M)){M=0}return{x:H,y:M}}function x(H,I){H=Math.floor(Math.min(Math.max(H,0),1)*10000)/10000;I=Math.floor(Math.min(Math.max(I,0),1)*10000)/10000;return H+","+I}function f(L,O,N){L=i(L);var J=L.getBoundingClientRect?L.getBoundingClientRect():null,T=J?J.width:L.offsetWidth,K=J?J.height:L.offsetHeight,M=T&&T>0?Math.max(T/y("gridCellMaxX"),y("gridCellMinWidth")):y("gridCellMinWidth"),Q=K&&K>0?Math.max(K/y("gridCellMaxY"),y("gridCellMinHeight")):y("gridCellMinHeight"),I=Math.min(Math.floor(O/M),y("gridCellMaxX")),H=Math.min(Math.floor(N/Q),y("gridCellMaxY")),S=T>0?O/T:0,P=K>0?N/K:0,R="";if(!isFinite(I)){I=0}if(!isFinite(H)){H=0}R=x(S,P);return{x:I,y:H,relXY:R}}function c(M){var N=M,O=M.getKey(),I={},J=null,L=null,K=false,H=0;I[O]=true;while(typeof N!=="undefined"&&H++<d){I[N.parentKey]=true;if(N.parentKey===""||N.parentKey===N.getKey()){break}if(H>=d){A.clog("Overstat cleanupHoverEvents() hit iterations limit")}N=p[N.parentKey]}for(J in p){if(p.hasOwnProperty(J)&&!I[J]){N=p[J];if(N){if(!K){K=N.process()}else{N.dispose()}}}}}function u(I,K){var L=null,H=null,J=false;for(H in p){if(p.hasOwnProperty(H)){L=p[H];if(L&&L.domNode===I&&L.getKey()!==K){if(!J){J=L.process()}else{L.dispose()}}}}}function b(L,J,K){if(!J){J=L.target}if(s(J)){return null}if(A.isiOS||A.isAndroid){return null}var H,Q,M,P,N,O,I;if(!m(J)){H=a(J,L.position.x,L.position.y);Q=f(J,H.x,H.y);M=new v(J,Q.x,Q.y,L);M.relXY=Q.relXY;P=M.getKey();if(p[P]){M=p[P]}else{p[P]=M}M.update();if(!K){I=n(J);if(I){O=b(L,I,true);if(O!==null){N=O.getKey();P=M.getKey();if(P!==N){M.parentKey=N}}}c(M)}}else{M=b(L,n(J),K)}return M}function q(H){H=E(H);if(w(H.target,H.relatedTarget)){return}u(H.target)}function l(J){var K=null,H=null,I=false;for(H in p){if(p.hasOwnProperty(H)){K=p[H];if(K){if(!I){I=K.process(true)}else{K.dispose()}}}}}function o(H){e.performFormCompletion(true)}function k(I){var H=A.getValue(I,"target.id");if(!H){return}switch(I.type){case"mousemove":b(I);break;case"mouseout":q(I);break;case"click":l(I);break;case"submit":o(I);break;default:break}}return{init:function(){},destroy:function(){var I,H;for(I in p){if(p.hasOwnProperty(I)){p[I].dispose();delete p[I]}}},onevent:function(H){if(typeof H!=="object"||!H.type){return}k(H)},onmessage:function(H){},createHoverEvent:F,cleanupHoverEvents:c,eventMap:p}})}else{}if(TLT&&typeof TLT.addModule==="function"){TLT.addModule("performance",function(b){var k={loadReceived:false,unloadReceived:false,perfEventSent:false},g=null,f=0,e,m=b.utils,j,i=[],o,a={enabled:false,threshold:2000,resourceTypes:[],blacklist:[]};function h(s,r){if(typeof s!=="string"){return false}if(!r||typeof r!=="object"){return false}return(r[s]===true)}function d(t,r){var v=0,s={},w="",u=0;if(!t||typeof t!=="object"||!t.navigationStart){return{}}v=t.navigationStart;for(w in t){if(Object.prototype.hasOwnProperty.call(t,w)||typeof t[w]==="number"){if(!h(w,r)){u=t[w];if(typeof u==="number"&&u&&w!=="navigationStart"){s[w]=u-v}else{s[w]=u}}}}return s}function c(t){var u=0,s,r;if(t){s=(t.responseEnd>0&&t.responseEnd<t.domLoading)?t.responseEnd:t.domLoading;r=t.loadEventStart;if(m.isNumeric(s)&&m.isNumeric(r)&&r>s){u=r-s}}return u}function n(s){var r=b.getStartTime();if(s.timestamp>r&&!f){f=s.timestamp-r}}function q(u){var s="UNKNOWN",v={type:7,performance:{}},r,w,t;if(!u||k.perfEventSent){return}w=u.performance||{};t=w.timing;r=w.navigation;if(t){if(!t.loadEventStart){return}v.performance.timing=d(t,e.filter);v.performance.timing.renderTime=c(t)}else{if(e.calculateRenderTime){v.performance.timing={renderTime:f,calculated:true}}else{return}}if(e.renderTimeThreshold&&v.performance.timing.renderTime>e.renderTimeThreshold){v.performance.timing.invalidRenderTime=v.performance.timing.renderTime;delete v.performance.timing.renderTime}if(r){switch(r.type){case 0:s="NAVIGATE";break;case 1:s="RELOAD";break;case 2:s="BACKFORWARD";break;default:s="UNKNOWN";break}v.performance.navigation={type:s,redirectCount:r.redirectCount}}b.post(v);k.perfEventSent=true;if(g){clearInterval(g);g=null}}function p(w){var v,u,z,r,y,t=o.blacklist,x,s;for(v=0;v<w.length;v+=1){z=w[v];r=z.name;y=z.initiatorType;s=false;if(o.resourceTypes.length>0&&o.resourceTypes.indexOf(y)===-1){continue}for(u=0;u<t.length;u+=1){x=t[u];switch(typeof x){case"object":if(!x.cRegex){x.cRegex=new RegExp(x.regex,x.flags)}x.cRegex.lastIndex=0;if(x.cRegex.test(r)){s=true}break;case"string":if(r.indexOf(x)!==-1){s=true}break;default:break}}if(!s&&z.duration>o.threshold){i.push({resourceType:y,name:r,duration:z.duration,transferSize:z.transferSize})}}}function l(){var r;if(!o.enabled||(typeof window.PerformanceObserver!=="function")){return}j=new window.PerformanceObserver(function(s,t){p(s.getEntries())});r=window.performance.getEntriesByType("resource");p(r);j.observe({entryTypes:["resource"]})}return{init:function(){e=b.getConfig();o=m.mixin({},a,e.performanceAlert)},destroy:function(){e=null;if(g){clearInterval(g);g=null}if(i.length>0){b.post({type:17,performanceAlert:i})}i=[];if(j){j.disconnect()}},onevent:function(r){if(typeof r!=="object"||!r.type){return}switch(r.type){case"load":k.loadReceived=true;n(r);if(!k.perfEventSent&&!g){g=setInterval(function(){if(b.isInitialized()){q(window)}},m.getValue(e,"delay",2000))}l();break;case"screenview_load":if(!k.perfEventSent){q(window)}break;case"unload":k.unloadReceived=true;if(!k.perfEventSent){q(window)}break;default:break}},onmessage:function(r){}}})}else{}TLT.addModule("replay",function(ai){var Z=ai.utils,L=0,ao={scale:0,timestamp:0},aE={},az=null,A=[],R=0,W=true,V=null,an=null,u=0,aa="",au="",o=null,U=(new Date()).getTime(),s=0,aw=null,r="root",ac,F=null,ah=null,ap=null,X=null,M=null,T=0,ad=0,f={inFocus:false},ay=null,H=ai.getConfig()||{},i=Z.getValue(H,"viewPortWidthHeightLimit",10000),m=1,N=1,P,g={},t=Z.getValue(H,"mousemove")||{},aj=ai.getSessionStart(),ag=t.sampleRate,I=t.ignoreRadius,G=null,h=[],v=[],b={},n=0,E=1000,d=0,ax=[],w=[];function Y(){var aF;for(aF in aE){if(aE.hasOwnProperty(aF)){aE[aF].visitedCount=0}}}function aD(aH){var aF=false,aG="|button|image|submit|reset|",aI=null;if(typeof aH!=="object"||!aH.type){return aF}switch(aH.type.toLowerCase()){case"input":aI="|"+(aH.subType||"")+"|";if(aG.indexOf(aI.toLowerCase())===-1){aF=false}else{aF=true}break;case"select":case"textarea":aF=false;break;default:aF=true;break}return aF}function av(aG){var aF=[];aG=aG.parentNode;while(aG){aF.push(aG);aG=aG.parentNode}return aF}function l(aF){return Z.some(aF,function(aH){var aG=Z.getTagName(aH);if(aG==="a"||aG==="button"){return aH}return null})}function C(aF){var aG=aF.type,aH=aF.target;if(typeof aG==="string"){aG=aG.toLowerCase()}else{aG="unknown"}if(aG==="blur"){aG="focusout"}if(aG==="change"){if(aH.type==="INPUT"){switch(aH.subType){case"text":case"date":case"time":aG=aH.subType+"Change";break;default:aG="valueChange";break}}else{if(aH.type==="TEXTAREA"){aG="textChange"}else{aG="valueChange"}}}return aG}function ar(aF,aJ,aG){var aH,aI,aK;if(document.querySelector(aF)){return true}for(aH=0;aH<aJ.length;aH++){aK=aJ[aH];if(aK.querySelector(aF)){return true}}for(aH=0;aH<aG.length;aH++){aI=aG[aH];if(aI.querySelector(aF)){return true}}return false}function aq(aI,aM,aG){var aK,aJ,aN,aH,aO,aF,aL;for(aK=0;aK<w.length;aK++){aL=w[aK];aJ=aL.delayUntil.selector;aN=Z.getValue(aL.delayUntil,"exists",true);aH=aL.delayUntil.dualSnapshot||false;aO=ar(aJ,aM,aG);aF=aL.lastStatus||false;if((aN===true&&aO===true&&aF===false)||(aN===false&&aO===false&&aF===true)||(aH===true&&aO===true&&aF===false)||(aH===true&&aO===false&&aF===true)){ai.performDOMCapture(document,{eventOn:true,dcid:aL.dcid});if(!aH||aO===false){w.splice(aK--,1);if(w.length===0){TLT.registerMutationCallback(aq,false)}}aL.lastStatus=aO;break}aL.lastStatus=aO}}function k(aF,aH,aG){var aI=null;if(!aF){return aI}aH=aH||{};aH.eventOn=W;W=false;if(aG){aI="dcid-"+Z.getSerialNumber()+"."+(new Date()).getTime()+"s";if(typeof aG==="object"){w.push({dcid:aI,delayUntil:aG,lastStatus:false});TLT.registerMutationCallback(aq,true)}else{window.setTimeout(function(){aH.dcid=aI;ai.performDOMCapture(aF,aH)},aG)}}else{delete aH.dcid;aI=ai.performDOMCapture(aF,aH)}return aI}function Q(aG,aI){var aH,aF,aJ,aK;for(aH=0,aF=aG.length;aH<aF;aH+=1){aJ=aG[aH];if(aI&&aI.indexOf("#")===0){aK=location.pathname+aI}else{if(typeof aI==="undefined"||aI===r){aK=location.pathname+location.hash}else{aK=aI}}aK=ai.normalizeUrl(aK);switch(typeof aJ){case"object":if(!aJ.cRegex){aJ.cRegex=new RegExp(aJ.regex,aJ.flags)}aJ.cRegex.lastIndex=0;if(aJ.cRegex.test(aK)){return true}break;case"string":if(aJ===aK){return true}break;default:break}}return false}function ak(){var aF=false,aG;if(!t.enabled||window.hasOwnProperty("ontouchstart")){return}if(h.length===0){return}if(n>=E){aF=true}aG={type:18,mousemove:{elements:v.slice(0),data:h.slice(0),config:{ignoreRadius:t.ignoreRadius,sampleRate:t.sampleRate},limitReached:aF,maxInactivity:d}};ai.post(aG);v.length=0;h.length=0;b={};d=0;return aG}function aB(aM,aV,aH){var aP,aO,aN=false,aK={},aW=false,aG,aS,aJ=null,aT=0,aQ,aL,aI,aF,aU,aR;if(!aM||(!aV&&!aH)){return aJ}if(!aV&&!(aM==="load"||aM==="unload")){return aJ}H=ai.getConfig()||{};aW=Z.getValue(H,"domCapture.enabled",false);if(!aW||Z.isLegacyIE){return aJ}aR=Z.getValue(H,"domCapture.screenviewBlacklist",[]);if(Q(aR,aH)){return aJ}aS=Z.getValue(H,"domCapture.triggers")||[];for(aP=0,aQ=aS.length;!aN&&aP<aQ;aP+=1){aG=aS[aP];if(aG.event===aM){if(aM==="load"||aM==="unload"){if(aG.screenviews){aI=aG.screenviews;for(aO=0,aF=aI.length;!aN&&aO<aF;aO+=1){aL=aI[aO];switch(typeof aL){case"object":if(!aL.cRegex){aL.cRegex=new RegExp(aL.regex,aL.flags)}aL.cRegex.lastIndex=0;aN=aL.cRegex.test(aH);break;case"string":aN=(aL===aH);break;default:break}}}else{aN=true}}else{if(aG.targets){aN=(-1!==Z.matchTarget(aG.targets,aV))}else{aN=true}}}if(aG.event==="change"&&aG.delayUntil){ax=ax.concat(aG.targets)}}if(aN){aT=aG.delay||aG.delayUntil||(aG.event==="load"?7:0);aK.forceFullDOM=!!aG.fullDOMCapture;aJ=k(window.document,aK,aT);if(aJ){ak()}}return aJ}function at(aN){var aH,aI=Z.getValue(aN,"webEvent.target",{}),aF=aI.type,aJ=aI.subType||"",aG=Z.getTlType(aI),aK=av(Z.getValue(aI,"element")),aM=null,aL=Z.getValue(aN,"webEvent.subType",null);aH={timestamp:Z.getValue(aN,"webEvent.timestamp",0),type:4,target:{id:aI.id||"",idType:aI.idType,name:aI.name,tlType:aG,type:aF,position:{width:Z.getValue(aI,"size.width"),height:Z.getValue(aI,"size.height")},currState:aN.currState||null},event:{tlEvent:C(Z.getValue(aN,"webEvent")),type:Z.getValue(aN,"webEvent.type","UNKNOWN")}};if(aJ){aH.target.subType=aJ}if(typeof aN.dwell==="number"&&aN.dwell>0){aH.target.dwell=aN.dwell}if(typeof aN.visitedCount==="number"){aH.target.visitedCount=aN.visitedCount}if(typeof aN.prevState!=="undefined"){aH.prevState=aN.prevState}if(aL){aH.event.subType=aL}aM=l(aK);aH.target.isParentLink=!!aM;if(aM){if(aM.href){aH.target.currState=aH.target.currState||{};aH.target.currState.href=aH.target.currState.href||aM.href}if(aM.value){aH.target.currState=aH.target.currState||{};aH.target.currState.value=aH.target.currState.value||aM.value}if(aM.innerText||aM.textContent){aH.target.currState=aH.target.currState||{};aH.target.currState.innerText=Z.trim(aH.target.currState.innerText||aM.innerText||aM.textContent)}}if(Z.isUndefOrNull(aH.target.currState)){delete aH.target.currState}if(Z.isUndefOrNull(aH.target.name)){delete aH.target.name}return aH}function af(aF){ai.post(aF)}function aC(aJ){var aH=0,aF,aK=aJ.length,aM,aL,aI,aN={mouseout:true,mouseover:true},aG=[];for(aH=0;aH<aK;aH+=1){aM=aJ[aH];if(!aM){continue}if(aN[aM.event.type]){aG.push(aM)}else{for(aF=aH+1;aF<aK&&aJ[aF];aF+=1){if(!aN[aJ[aF].event.type]){break}}if(aF<aK){aL=aJ[aF];if(aL&&aM.target.id===aL.target.id&&aM.event.type!==aL.event.type){if(aM.event.type==="click"){aI=aM;aM=aL;aL=aI}if(aL.event.type==="click"){aM.target.position=aL.target.position;aH+=1}else{if(aL.event.type==="blur"){aM.target.dwell=aL.target.dwell;aM.target.visitedCount=aL.target.visitedCount;aM.focusInOffset=aL.focusInOffset;aM.target.position=aL.target.position;aH+=1}}aJ[aF]=null;aJ[aH]=aM}}aG.push(aJ[aH])}}for(aM=aG.shift();aM;aM=aG.shift()){ai.post(aM)}aJ.splice(0,aJ.length)}function aA(aG){var aI=null,aJ,aL=Z.getValue(aG,"nativeEvent.message"),aH=Z.getValue(aG,"nativeEvent.filename"),aF=Z.getValue(aG,"nativeEvent.lineno"),aK=Z.getValue(aG,"nativeEvent.error");if(typeof aL!=="string"){return}aF=aF||-1;if(aK&&aK.stack){aJ=aK.stack.toString()}else{aJ=(aL+" "+aH+" "+aF).toString()}if(g[aJ]){g[aJ].exception.repeats=g[aJ].exception.repeats+1}else{aI={type:6,exception:{description:aL,url:aH,line:aF}};ai.post(aI);g[aJ]={exception:{description:aL,url:aH,line:aF,repeats:1}}}u+=1}function D(aF,aG){A.push(at({webEvent:aF,id:aG,currState:Z.getValue(aF,"target.state")}))}function ab(aG,aI,aN){var aK=false,aF=false,aL,aH,aM,aJ=0;if(!aG){return}if(A.length===0){return}aI=aI||(aE[aG]?aE[aG].webEvent:{});if(aI.type==="blur"||aI.type==="change"){aM=Z.getValue(aI,"target.state",{})}else{if(aI.target){aM=Z.getTargetState(aI.target.element)||{}}else{aM={}}}if(aM&&aM.disabled){aN=true}aH=A[A.length-1];if(aE[aG]){aH.focusInOffset=aE[aG].focusInOffset;aH.target.visitedCount=aE[aG].visitedCount;if(aE[aG].focus){aE[aG].dwell=Number(new Date())-aE[aG].focus;aH.target.dwell=aE[aG].dwell}if(!aE[aG].processedChange&&aE[aG].prevState&&!aN){if(!Z.isEqual(aE[aG].prevState,aM)){aF=true;aI.type="change";aH.event.type=aI.type;aH.event.tlEvent=C(aI);aH.target.prevState=aE[aG].prevState;aH.target.currState=aM}}}else{aE[aG]={}}if(aH.event.type==="click"){if(!aD(aH.target)){aH.target.currState=aM;aK=true}}else{if(aH.event.type==="focus"){aK=true}}if(aK&&!aN){aH.event.type="blur";aH.event.tlEvent="focusout"}if(!aH.dcid){aL=aB(aH.event.type,aI.target);if(aL){aH.dcid=aL}}if(!aN){f.inFocus=false}aE[aG].prevState=aM?Z.mixin({},aM):aM;aC(A)}function j(aI,aG){var aH=A.length,aF=aH?A[aH-1]:null;if(f.inFocus&&f.target.id===aI){if(!aF||aF.target.id!==aI){D(aG,aI);aE[aI].processedChange=false;aE[aI].processedClick=false}return}if(f.inFocus){ab(f.target.id,f)}f=aG;f.inFocus=true;if(!aE[aI]){aE[aI]={}}aE[aI].focus=f.dwellStart=Number(new Date());aE[aI].focusInOffset=ah?f.dwellStart-Number(ah):-1;if(aG.type==="focus"||(aG.type==="click"&&!aE[aI].prevState)){aE[aI].prevState=Z.getValue(aG,"target.state")}aE[aI].visitedCount=aE[aI].visitedCount+1||1;aE[aI].webEvent=aG;aE[aI].processedChange=false;aE[aI].processedClick=false;D(aG,aI)}function K(aL,aH){var aG=false,aI,aK,aJ=A.length,aF=aJ?A[aJ-1]:null;if(!aF){return aG}aI=aF.target.id;aK=aF.event.type;if(aI!==aL&&aF.target.tltype!=="selectList"){if(aH.type==="focus"||aH.type==="click"||aH.type==="change"||aH.type==="blur"){ab(aI);aG=true}}if(aI===aL&&((aH.type==="click"&&aE[aL].processedClick)||(aH.type==="change"&&aE[aL].processedChange)||(aH.type==="pointerup"&&aE[aL].processedClick&&Z.getValue(aH.target,"state.disabled",false)))){ab(aI,null,true);aG=true}return aG}function z(aH,aG){var aF;j(aH,aG);aF=A[A.length-1];aF.event.type="change";aF.event.tlEvent=C(aG);aF.target.currState=aG.target.state;if(aE[aH].prevState){aF.target.prevState=aE[aH].prevState}aE[aH].webEvent=aG;aE[aH].processedChange=true;if(Z.matchTarget(ax,aG.target)!==-1){ab(aH,aG)}}function J(aI,aH){var aG,aF;if(aH.target.type==="select"&&ay&&ay.target.id===aI){ay=null;return}j(aI,aH);aG=A[A.length-1];if(aG.event.type==="focus"){aG.event.type="click";aG.event.tlEvent=C(aH)}aF=aH.nativeEvent;if(aF&&(!window.MouseEvent||!(aF instanceof MouseEvent&&aF.detail===0)||(window.PointerEvent&&aF instanceof PointerEvent&&aF.pointerType!==""))){aG.target.position.relXY=Z.getValue(aH,"target.position.relXY")}if(!aE[aI].processedChange){aE[aI].webEvent=aH}aE[aI].processedClick=true;if(aD(aH.target)){ab(aI,aH)}ay=aH}function O(aH,aG){var aF=aH;if(!Z.getValue(aG,"target.element.disabled",false)){return}switch(aG.type){case"pointerdown":o=aF;break;case"pointerup":if(aF===o){aG.type="click";J(aH,aG)}o=null;break}}function c(aJ){var aH,aN=0,aF=0,aI,aG,aL,aM,aK;if(!t.enabled||window.hasOwnProperty("ontouchstart")){return}if(n>=E){return}aH={element:{id:aJ.target.id,idType:aJ.target.idType},x:aJ.position.x,y:aJ.position.y,offset:aJ.timestamp-aj};if(G!==null){aN=aH.offset-G.offset;if(ag&&aN<ag){return}aM=Math.abs(aH.x-G.x);aK=Math.abs(aH.y-G.y);aF=(aM>aK)?aM:aK;if(I&&aF<I){return}if(aN>d){d=aN}}aI=JSON.stringify(aH.element);aG=b[aI];if(typeof aG==="undefined"){v.push(aH.element);aG=v.length-1;b[aI]=aG}aL=Z.getValue(aJ,"target.position.relXY").split(",");h.push([aG,aL[0],aL[1],aH.offset]);n+=1;G=aH}function a(aG){var aF=aG.orientation,aH={type:4,event:{type:"orientationchange"},target:{prevState:{orientation:L,orientationMode:Z.getOrientationMode(L)},currState:{orientation:aF,orientationMode:Z.getOrientationMode(aF)}}};af(aH);L=aF}function e(aG){var aF=false;if(!aG){return aF}aF=(ao.scale===aG.scale&&Math.abs((new Date()).getTime()-ao.timestamp)<500);return aF}function S(aF){ao.scale=aF.scale;ao.rotation=aF.rotation;ao.timestamp=(new Date()).getTime()}function B(){var aF,aG;aF=m-N;if(isNaN(aF)){aG="INVALID"}else{if(aF<0){aG="CLOSE"}else{if(aF>0){aG="OPEN"}else{aG="NONE"}}}return aG}function x(aJ){var aO=document.documentElement||{},aL=document.body||{},aP=window.screen,aG=aP.width,aH=aP.height,aK=Z.getValue(aJ,"orientation",0),aM=!Z.isiOS?aG:Math.abs(aK)===90?aH:aG,aI={type:1,clientState:{pageWidth:Math.max(aL.clientWidth||0,aO.offsetWidth||0,aO.scrollWidth||0),pageHeight:Math.max(aL.clientHeight||0,aO.offsetHeight||0,aO.scrollHeight||0),viewPortWidth:window.innerWidth||aO.clientWidth,viewPortHeight:window.innerHeight||aO.clientHeight,viewPortX:Math.round(window.pageXOffset||(aO||aL).scrollLeft||0),viewPortY:Math.round(window.pageYOffset||(aO||aL).scrollTop||0),deviceOrientation:aK,event:Z.getValue(aJ,"type")}},aN=aI.clientState,aF;an=an||aI;if(aN.event==="unload"&&aN.viewPortHeight===aN.pageHeight&&aN.viewPortWidth===aN.pageWidth){if(an.clientState.viewPortHeight<aN.viewPortHeight){aN.viewPortHeight=an.clientState.viewPortHeight;aN.viewPortWidth=an.clientState.viewPortWidth}}if((aN.viewPortY+aN.viewPortHeight)>aN.pageHeight){aN.viewPortY=aN.pageHeight-aN.viewPortHeight}if(aN.viewPortY<0){aN.viewPortY=0}aF=!aN.viewPortWidth?1:(aM/aN.viewPortWidth);aN.deviceScale=aF.toFixed(3);aN.viewTime=0;if(ap&&X){aN.viewTime=X.getTime()-ap.getTime()}if(aJ.type==="scroll"){aN.viewPortXStart=an.clientState.viewPortX;aN.viewPortYStart=an.clientState.viewPortY}return aI}function ae(){var aF;if(V){aF=V.clientState;if(aF.viewPortHeight>0&&aF.viewPortHeight<i&&aF.viewPortWidth>0&&aF.viewPortWidth<i){af(V)}an=V;V=null;ap=M||ap;X=null}ae.timeoutId=0}function y(aF){var aG=null;if(Z.isOperaMini){return}V=x(aF);if(aF.type==="scroll"||aF.type==="resize"){if(ae.timeoutId){window.clearTimeout(ae.timeoutId)}ae.timeoutId=window.setTimeout(ae,Z.getValue(H,"scrollTimeout",2000))}else{if(aF.type==="touchstart"||aF.type==="load"){if(V){N=parseFloat(V.clientState.deviceScale)}}else{if(aF.type==="touchend"){if(V){m=parseFloat(V.clientState.deviceScale);ae()}}}}if(aF.type==="load"||aF.type==="unload"){if(aF.type==="unload"&&U){aG=Z.clone(V);aG.clientState.event="attention";aG.clientState.viewTime=(new Date()).getTime()-U}ae();if(aG){V=aG;ae()}}return V}function am(aG){var aF=Z.getValue(aG,"nativeEvent.touches.length",0);if(aF===2){y(aG)}}function q(aI){var aH,aG={},aJ=Z.getValue(aI,"nativeEvent.rotation",0)||Z.getValue(aI,"nativeEvent.touches[0].webkitRotationAngle",0),aK=Z.getValue(aI,"nativeEvent.scale",1),aF=null,aL={type:4,event:{type:"touchend"},target:{id:Z.getValue(aI,"target.id"),idType:Z.getValue(aI,"target.idType")}};aH=Z.getValue(aI,"nativeEvent.changedTouches.length",0)+Z.getValue(aI,"nativeEvent.touches.length",0);if(aH!==2){return}y(aI);aF={rotation:aJ?aJ.toFixed(2):0,scale:m?m.toFixed(2):1};aF.pinch=B();aG.scale=N?N.toFixed(2):1;aL.target.prevState=aG;aL.target.currState=aF;af(aL)}function al(aP,aI){var aM=["type","name","target.id"],aH=null,aJ,aL,aK=true,aN=10,aG=0,aO=0,aF=0;if(!aP||!aI||typeof aP!=="object"||typeof aI!=="object"){return false}for(aJ=0,aL=aM.length;aK&&aJ<aL;aJ+=1){aH=aM[aJ];if(Z.getValue(aP,aH)!==Z.getValue(aI,aH)){aK=false;break}}if(aK){aO=Z.getValue(aP,"timestamp");aF=Z.getValue(aI,"timestamp");if(!(isNaN(aO)&&isNaN(aF))){aG=Math.abs(Z.getValue(aP,"timestamp")-Z.getValue(aI,"timestamp"));if(isNaN(aG)||aG>aN){aK=false}}}return aK}function p(aF){var aH={type:4,event:{type:aF.type},target:{id:Z.getValue(aF,"target.id"),idType:Z.getValue(aF,"target.idType"),currState:Z.getValue(aF,"target.state")}},aG;aG=aB(aF.type,aF.target);if(aG){aH.dcid=aG}af(aH)}return{init:function(){A=[]},destroy:function(){ab(az);A=[];if(ae.timeoutId){window.clearTimeout(ae.timeoutId);ae.timeoutId=0}},onevent:function(aI){var aF=null,aN=null,aG,aM,aJ,aH,aK=null;if(typeof aI!=="object"||!aI.type){return}if(al(aI,aw)){aw=aI;return}aw=aI;aF=Z.getValue(aI,"target.id");if(!aE[aF]){aE[aF]={}}K(aF,aI);switch(aI.type){case"hashchange":break;case"focus":aN=j(aF,aI);break;case"blur":aN=ab(aF,aI);break;case"pointerdown":O(aF,aI);break;case"pointerup":O(aF,aI);break;case"click":aN=J(aF,aI);break;case"change":aN=z(aF,aI);break;case"orientationchange":aN=a(aI);break;case"touchstart":am(aI);break;case"touchend":aN=q(aI);break;case"loadWithFrames":TLT.logScreenviewLoad("rootWithFrames");break;case"load":L=aI.orientation;ap=new Date();if(typeof window.orientation!=="number"||Z.isAndroid){aM=(window.screen.width>window.screen.height?90:0);aG=window.orientation;if(Math.abs(aG)!==aM&&!(aG===180&&aM===0)){Z.isLandscapeZeroDegrees=true;if(Math.abs(aG)===180||Math.abs(aG)===0){L=90}else{if(Math.abs(aG)===90){L=0}}}}setTimeout(function(){if(ai.isInitialized()){y(aI)}},100);if(Z.getValue(H,"forceRootScreenview",false)){ac=r}else{ac=TLT.normalizeUrl(location.hash)||r}TLT.logScreenviewLoad(ac);break;case"screenview_load":ah=new Date();Y();aN=aB("load",null,aI.name);break;case"screenview_unload":aN=aB("unload",null,aI.name);break;case"resize":case"scroll":if(!X){X=new Date()}M=new Date();y(aI);break;case"unload":for(aJ in g){if(g.hasOwnProperty(aJ)){aH=g[aJ].exception;if(aH.repeats>1){aK={type:6,exception:aH};ai.post(aK)}}}if(A){aC(A)}X=new Date();y(aI);if(ac===r||TLT.normalizeUrl(location.hash)===ac){TLT.logScreenviewUnload(ac)}try{if(sessionStorage){sessionStorage.setItem("tltUnload",1)}}catch(aL){}break;case"mousemove":c(aI);break;case"error":aA(aI);break;default:p(aI);break}az=aF;return aN},onmessage:function(){}}});

var isChrome = /Chrome/.test(navigator.userAgent) && /Google/.test(navigator.vendor); //Identify Chrome Browser, changes to True if chrome, False if browser is not chrome

//
//----------------------------------------------------------- Digital Data (QueryString, JS Exceptions, etc)
//----------------------------------------------------------------------------------------------------------
TLT.addModule("digitalData", function(context) {
	var config = {},
		qKeys = {},
		q,
		svChange = false,
		utils = context.utils;


    function customEvent(description, action, value) {
        var jsonMsg = {
            type: 5
            , fromWeb: true
            , customEvent: {
                data: {
                    description: description
                    , action: action
                    , value: value
                }
            }
        };
        context.post(jsonMsg);
    }

	/* function postEvent(e, eventType) {
            var jsonMsg = {
                type: 5,
                event: {
                    type: eventType,
                    tlname: eventType
                },
                target: {
                    id: e.target.id,
                    idType: e.target.idType,
                    currState: {
                        value: e.target.value
                    }
                }
            };
            context.post(jsonMsg);

        }*/

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

	//------------------------------------------------------- Query String Logging -----
	// Resolved Error With Query String - Jai31072019
	function parseQueryString() {
		q = (location.search.length > 1 ? location.search.substring(1).split("&") : []);
		for (var i = 0; i < q.length; i++) {
			qKeys[q[i].match(/^[^=^,^.^%^-^20]+/)] = q[i].replace(/^[^=^,^.^%^-^20]+=?/, "");
		}
		if (i > 0) {
			customEvent("QueryString Values", "Retrieve", qKeys)
		}
	}

  function sessionCookies(cookies) {
    var str = decodeURIComponent(cookies);
    str = str.replace(/[{}]/g, "").replace(/\",\"/g, ";").replace(/\":\"/g, "=");
    str = str.split(';');
    var value = {};
    for (var i = 0; i < str.length; i++) {
     var cur = str[i].trim().split('=');
     value[cur[0]] = cur[1];
    }
    customEvent("Cookies", "Retreive", value);
   }

	//------------------------------------------------ Unhandled Exception Logging -----
	function logExceptions() {
		window.onerror = function(errorMsg, url, lineNumber) {
			customEvent("Error: " + errorMsg, "Captured", {
				url : url,
				lineNumber : lineNumber,
				errorMsg : errorMsg
			})
		};
	}

	 //----------------- Initialize Tealeaf Digital Data Objects -----//
    return {
        init: function () {
            config = context.getConfig();
        }, destroy: function () {
            config = null;
        }, onevent: function (webEvent) {
            if (typeof webEvent !== "object" || !webEvent.type) {
                return;
            } // Sanity check



            if (webEvent) {
                try {
                    customEvent("Domain - " + window.location.hostname, "Retrieve", window.location.hostname);
                }
                catch (e) {
                    customEvent("Domain", "Domain Logging Error", e);
                }
                try {
                    customEvent("Referrer", "Retrieve", document.referrer);
                }
                catch (e) {
                    customEvent("Referrer", "Referrer Logging Error", e);
                }
                try {
                    parseQueryString();
                }
                catch (e) {
                    customEvent("QueryString", "QueryString Logging Error", e);
                }
                try {
                    logExceptions();
                }
                catch (e) {
                    customEvent("logExceptions", "Exceptions Logging Error", e);
				}
				try {
                  TLT.flushAll();
                }
                catch (e) {
                    customEvent("Flush Queue", "Flush Queue Error", e);
                }
        }
    }
}
});


//TeleTicket digital data only Module

TLT.addModule("TeleTicketDigitalData", function(context) {
	var config = {},
		qKeys = {},
		q,
		svChange = false,
		utils = context.utils;


    function customEvent(description, action, value) {
        var jsonMsg = {
            type: 5
            , fromWeb: true
            , customEvent: {
                data: {
                    description: description
                    , action: action
                    , value: value
                }
            }
        };
        context.post(jsonMsg);
    }
/*
	 function postEvent(e, eventType) {
            var jsonMsg = {
                type: 5,
                event: {
                    type: eventType,
                    tlname: eventType
                },
                target: {
                    id: e.target.id,
                    idType: e.target.idType,
                    currState: {
                        value: e.target.value
                    }
                }
            };
            context.post(jsonMsg);

        }
*/
	//------------------------------------------------------- Removed Query String Logging -----



//Convert GTM datalayer nested Objects in to single array
 var flatLayer = function(dataobject) {
  var extract = {};
  for (var i = 0; i < dataobject.length; i++) {
    for (var p in dataobject[i]) {
      extract[p] = dataobject[i][p];
    }
  }
  return extract;
}

 //get the DataLayer values in to Digital Data
 function TeleTicketData(){
 setTimeout(function(){
  try{
    if(typeof window.dataLayer !== "undefined"){
        var s = [];
		s.push(flatLayer(dataLayer));
		customEvent("DigitalData", "Retreive", JSON.parse(JSON.stringify(s)));
	};
  } catch (e) {
    customEvent("DataLayer Exceptions", "DataLayer Logging Error", e);
  }
},200);
};



	//------------------------------------------------ Unhandled Exception Logging -----
	function logExceptions() {
		window.onerror = function(errorMsg, url, lineNumber) {
			customEvent("Error: " + errorMsg, "Captured", {
				url : url,
				lineNumber : lineNumber,
				errorMsg : errorMsg
			})
		};
	}

	 //----------------- Initialize Tealeaf Digital Data Objects -----//
    return {
        init: function () {
            config = context.getConfig();
        }, destroy: function () {
            config = null;
        }, onevent: function (webEvent) {
            if (typeof webEvent !== "object" || !webEvent.type) {
                return;
            } // Sanity check
            if (webEvent) {
				try {
                  TeleTicketData();
                }
                catch (e) {
                    customEvent("DataLayer Exceptions", "DataLayer Logging Error", e);
                }
				try {
                    logExceptions();
                }
                catch (e) {
                    customEvent("logExceptions", "Exceptions Logging Error", e);
				}
			    try {
                  TLT.flushAll();
                }
                catch (e) {
                    customEvent("Flush Queue", "Flush Queue Error", e);
                }
        }
    }
}
});

//-------------------------------------------------------------------------------------- Tab Monitoring v1.3
//

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

//-------------------------------------------------------------------- Client Side Performance Monitoring V4
//----------------------------------------------------------------------------------------------------------
TLT.addModule("performanceData", function (context) {
	var	epFilter, 
		perfDur = TLT.getCoreConfig().modules.performanceData.responseTime,
		logJS = TLT.getCoreConfig().modules.performanceData.monitorJS,
		logCSS = TLT.getCoreConfig().modules.performanceData.monitorCSS, 
		logImages = TLT.getCoreConfig().modules.performanceData.monitorImages,
		logXHR = TLT.getCoreConfig().modules.performanceData.monitorXHR,
		blacklist = TLT.getCoreConfig().modules.performanceData.blacklist;

	function postMsg(description, urlNormalized, urlFull, initiator, responseTime, totalTime, size) {
		var jMsg = {"description":description, 
				"urlNormalized":urlNormalized, 
				"urlFull":urlFull, 
				"initiator":initiator, 
				"response time":responseTime, 
				"total time":totalTime,
				"size(kBytes)":size};
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
						var size = (resources[i].transferSize/1024).toFixed(2);
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
		init : function () {},
		destroy : function () {},
		onevent : function (webEvent) {
			if (typeof webEvent !== "object" || !webEvent.type) { return; } // Sanity check
			if (webEvent) {
				getPerfObject();
			}
		}
	};
});
//******************* End Custom Data Module *************************// 

//------------------------------------------------------------------------------------ Tealeaf Configuration
//

(function () {
"use strict";
 var TLT = window.TLT,changeTarget,config;
if (TLT.getFlavor() === "w3c" && TLT.utils.isLegacyIE) {
changeTarget = "input, select, textarea, button";
}

//Custom Delay
var loadDelay = 100;
var f;
f = window.location.pathname;
if (f.indexOf("/") > -1) {
        loadDelay = 300
   }

//TeleTicket UISDK Config UISDK Config
// Cross Domain Support - assign the config to the TLT object instead of placing directly into the TLT.init() call
window.TLT.config={
  "services": {
    "browser": {
      "useCapture": true,
      "sizzleObject": "window.Sizzle",
	   "jQueryObject": "window.jQuery"//,
		//customeid:["name"]
    },
    "queue": {
      "queues": [
        {
          "qid": "DEFAULT",
//          "endpoint": "//decollector.tealeaf.ibmcloud.com/collector/collectorPost",
          "endpoint": "https://decollector.tealeaf.ibmcloud.com/collector/collectorPost",   // WHB 20200430
          "maxEvents": "10",
          "maxSize": 0,
          "timerinterval": 30000,
          "checkEndpoint": true,
          "endpointCheckTimeout": 3000,
		   "encoder": "gzip"
        }
      ],
      "asyncReqOnUnload": isChrome,
	  "useFetch": true,   
      "useBeacon": isChrome,
      "xhrLogging": false// Debug logging for Tealeaf support
    },
    "serializer": {
      "json": {
        "defaultToBuiltin": true,
        "parsers": [
          "JSON.parse"
        ],
        "stringifiers": [
          "JSON.stringify"
        ]
      }
    },
    "domCapture": {
      "options": {
        "captureFrames": false,
        "removeScripts": true,
        "removeComments": true,
        "maxLength": 5000000,
        "maxMutations": 100
      },
      "diffEnabled": true
    },
    "message": {
      "privacy": [
        {
          "targets": [
            "input[type=password]",{ "id": "Password", "idType": "-1" },
			  { "id": "forgot-password", "idType": "-1" },
			  { "id": "register-password", "idType": "-1" }
			 ],
          "maskType": 3
        }
      ],"privacyPatterns": []
	},
    "encoder": {
	"enabled": true,
      "gzip": {
        "encode": "window.pako.gzip",
        "defaultEncoding": "gzip"
      }
    }
  },
  "core": {
    "blockedElements": [],
	  "ieExcludedLinks": ["a[href*=\"javascript:void\"]",
	  "input[onclick*='javascript:']"],
	"inactivityTimeout": 1000 * 60 * 60, /* 60 minutes */
    "modules": {
      "performance": {
        "enabled": true,
        "events": [
          {
            "name": "load",
            "target": "window"
          },
          {
            "name": "unload",
            "target": "window"
          }
        ]
      },
      "replay": {
        "enabled": true,
        "events": [
          {
            "name": "change",
            "target": changeTarget,
            "recurseFrames": true
          },
          {
            "name": "click",
            "recurseFrames": true
          },
          {
            "name": "hashchange",
            "target": "window"
          },
          {
            "name": "focus",
            "target": "input, select, textarea, button",
            "recurseFrames": true
          },
          {
            "name": "blur",
            "target": "input, select, textarea, button",
            "recurseFrames": true
          },
          {
            "name": "load",
            "target": "window"
          },
          {
            "name": "unload",
            "target": "window"
          },
          {
            "name": "resize",
            "target": "window"
          },
          {
            "name": "scroll",
            "target": "window"
          },
          {
            "name": "orientationchange",
            "target": "window"
          },
          {
            "name": "touchend"
          },
          {
            "name": "touchstart"
          },{name: "mousemove", recurseFrames: true },
          {name: "error", target: window},
          {name: "visibilitychange" }
        ]
      },
		"digitalData": {
					"enabled": true,
					"events":[{ "name": "load", "target": window }]
	  },"TeleTicketDigitalData": {
					"enabled": true,
					"events":[
							  { "name": "click", "target": ".ts-btn"},  // forgot your password
							  { "name": "click", "target": ".sales_button"}
							 ]
	  },tabMonitoring: {
      enabled: true,
      events: [
        { name: "load", target: window }
      ]
    },"performanceData" : {
					"enabled" : true,
					"responseTime" : 3000, // Time in ms to log slow static content - Recommended 2000+
					"monitorJS": true,
					"monitorCSS": true,
					"monitorImages": true,
					"monitorXHR": true,
					"blacklist": ["twitter", "google"],
					"events": [{ "name": "load", "target": window}]
				},"tabMonitoring": {
					"enabled": true,
					"events": [
						{ "name": "load", "target": window }
					]
				},
      "overstat": {
        "enabled": true,
        "events": [
          {
            "name": "click",
            "recurseFrames": true
          },
          {
            "name": "mousemove",
            "recurseFrames": true
          },
          {
            "name": "mouseout",
            "recurseFrames": true
          },
          {
            "name": "submit",
            "recurseFrames": true
          }
        ]
      },"normalization": {  // new with 5.6.0
				/**
				  * User defined URL normalization function which accepts an URL or path and returns
				  * the normalized URL or normalized path.
				  * @param urlOrPath {String} URL or Path which needs to be normalized.
				  * @returns {String} The normalized URL or Path.
				  */
				"urlFunction": function (url) {
					// Normalize the input URL or path here.
					// Refer to the documentation for an example to normalize the URL path or URL query parameters.
					return url.replace("/param1/123","/param1/XXX");
				}
			},"sessionDataEnabled": false,
			"sessionData": {
				"sessionValueNeedsHashing": true,
				"sessionQueryName": "sessionID",
				"sessionQueryDelim": ";",
				"sessionCookieName": "jsessionid"
			},
      "TLCookie": {
        "enabled": true
      }
    },
    "screenviewAutoDetect": true,//changed to false to remove the duplicate name changes in pages
    "framesBlacklist": ["#salesIframe","#ts-iframe-tickets"]//#salesIframe - Old teleTicket,ts-iframe-tickets - New tele Ticket
  },
  "modules": {
    "performance": {
	"delay": 10000, // Added as potential fix for performance data issues
      "calculateRenderTime": true,
      "renderTimeThreshold": 600000,
      "filter": {
        "navigationStart": true,
        "unloadEventStart": true,
        "unloadEventEnd": true,
        "redirectStart": true,
        "redirectEnd": true,
        "fetchStart": true,
        "domainLookupStart": true,
        "domainLookupEnd": true,
        "connectStart": true,
        "connectEnd": true,
        "secureConnectionStart": true,
        "requestStart": true,
        "responseStart": true,
        "responseEnd": true,
        "domLoading": true,
        "domInteractive": true,
        "domContentLoadedEventStart": true,
        "domContentLoadedEventEnd": true,
        "domComplete": true,
        "loadEventStart": true,
        "loadEventEnd": true
      }
    },
    "replay": {
      "domCapture": {
        "enabled": true,
        "triggers": [
          {
            "event": "click"
          },{
            "event": "change"
		  },{
              event: "load",
			  "fullDOMCapture": true
           }
        ]
      },mousemove: {  // new with 5.6.0: only included with unload event.  Not available for onprem 9.0.2 (targeting v10.2).
      enabled: true,
      sampleRate: 200,
      ignoreRadius: 3
    }
  },overstat: {
      hoverThreshold: 3000
  },
    "TLCookie": {
      "appCookieWhitelist": [
        {
          "regex": ".*"
        }
      ],
      "tlAppKey": "ae3030afd0204b418e7f4afbf61501a8",  // default for testing
	   "sessionizationCookieName": "TLTSID"
    }
  }
};

	//-------------------------------------------------------------------- Automatic tlAppKey using document.URL
	//----------------------------------------------------------------------------------------------------------
	var getLocation = function(href) {
		var getURL = document.createElement("a");
		getURL.href = href;
		return getURL;
	}

		var getHostname=getLocation(document.URL).hostname;
	    var isTeleticketStaging = /staging(\d{0,9})\.teleticketservice\.com/;

	if(isTeleticketStaging.test(getHostname)){
		window.TLT.config.modules.TLCookie.tlAppKey = "ae3030afd0204b418e7f4afbf61501a8"; // Test
		}

	if (getHostname === "www.teleticketservice.com" ) {
		 window.TLT.config.modules.TLCookie.tlAppKey = "25cba69c9d5441c5b51a4f59e0db2b4b"; // Prod
		}
	if ((getHostname === "sales.teleticketservice.com")
		  ||(getHostname === "www.sales.teleticketservice.com")) {
		  window.TLT.config.modules.TLCookie.tlAppKey = "25cba69c9d5441c5b51a4f59e0db2b4b"; // Prod
		}
	if (getHostname === "www.sportpaleis.be" ) {
				window.TLT.config.modules.TLCookie.tlAppKey = "13b28cfc0e8f407588a7baf7003d28f4"; // Prod
		}
	if ((getHostname === "rendering.acc.teleticketservice.portico.nl" )||(isTeleticketStaging.test(getHostname))){
			window.TLT.config.modules.TLCookie.tlAppKey = "ae3030afd0204b418e7f4afbf61501a8"; // Test
		}
	if (getHostname === "www-ethias-arena-be-beta.sportpaleisgroep.be" ){
			window.TLT.config.modules.TLCookie.tlAppKey = "9ae74294b93d4a128142549cae08ea62"; // Test
		}
	if (getHostname === "www-sportpaleis-be-beta.sportpaleisgroep.be" ){
			window.TLT.config.modules.TLCookie.tlAppKey = "4fbb533024274c4a8ef3ca68ba960baa"; // Test
		}
	if (getHostname === "sportpaleis-test.tickets4.biz" ){
			window.TLT.config.modules.TLCookie.tlAppKey = "0727cfdf4d8f4c618333155385032dee"; // Test
		}
	if (getHostname === "sportpaleis.tickets4.biz" ){
			window.TLT.config.modules.TLCookie.tlAppKey = "7a5adc3e50a441e7b07d6682903ea5c7"; // Prod
		}



//ALternate Config for Final Pages

	var captureURL = window.location.pathname;
	if (captureURL.indexOf("/gva/proc") > -1)// Insert list of confirmation and other important pages
		{
		window.TLT.config.services.queue.asyncReqOnUnload = false;
		window.TLT.config.modules.replay.domCapture.triggers = [
			{ event: "click" },
			{ event: "change" },
			{ event: "load", fullDOMCapture: true },
			{ event: "unload" } // Add DOM trigger to UNLOAD event on confirmation pages
		]//Jai 02082019	Digital Events Removed
	}


	//------------------------------------------------------- Disable Beacon & tune Queue settings for Apple iOS
	//----------------------------------------------------------------------------------------------------------
	if (TLT.utils.isiOS) {
		window.TLT.config.services.queue.asyncReqOnUnload = true,
		window.TLT.config.services.queue.useBeacon = false,
		window.TLT.config.services.queue.useFetch = true,
		window.TLT.config.services.queue.queues = [{
				qid: "DEFAULT",
//				endpoint: "//decollector.tealeaf.ibmcloud.com/collector/collectorPost",
				endpoint: "https://lib-eu-1.brilliantcollector.com/collector/collectorPost",  // WHB 20200430
				maxEvents: 10,
				maxSize: 0,
				timerinterval: 10000,
				checkEndpoint: true,
				endPointCheckTimeout: 10000,
				encoder: "gzip"
			}
		],
		window.TLT.config.core.modules.digitalData.events = [
				{ name: "load",	target: window }
		],
		window.TLT.config.core.modules.TeleTicketDigitalData.events = [
				{ name: "click", target: "[type=button]", recurseFrames: true }, //flushall on button clicked
				{ name: "click", target: "[type=submit]", recurseFrames: true }, //flushall on any submit clicked
				{ name: "click", target: "[href*='\/']", recurseFrames: true }/* //flush all on any href containing a slash
				{ name: "visibilitychange" } //flushall on any visability change*/
		]
	}


//------------------------------------------------------------------------------------- Alternate IE Configs
	//----------------------------------------------------------------------------------------------------------
	var disableSDK = false;
	if (document.documentMode === 8) { //----------------------------- Disable SDK for IE8 (No DOM/CORS Support)
		disableSDK = true;
	}

	if (document.documentMode === 9) { //----------------------- Alternate config for IE9 (No Diff/GZIP Support)
		window.TLT.config.modules.replay.domCapture.enabled = false;
		window.TLT.config.services.domCapture.diffEnabled = false;
	}
	if (document.documentMode === 10) { //-------------------------- Alternate config for IE10 (No Diff Support)
		window.TLT.config.services.domCapture.diffEnabled = false;
		window.TLT.config.modules.replay.domCapture.triggers = [
			{ event: "click" },{ event: "change" },
			{ event: "load","screenviews": ["root"], delay: 100 }
		];
	}


if (typeof window.TLT !== "undefined" && typeof window.TLT.isInitialized === "function" && !(window.TLT.isInitialized()) && typeof window.TLT.config === "object" && disableSDK === false) {window.TLT.init(window.TLT.config)}
}());

/* Custom message redirect callback configuration(s) */

	//------------------------------------------------------------------------------------------
	// Third Party Data Logging - Logs GTM dataLayer into LOAD event on each screen view change
	//------------------------------------------------------------------------------------------

  TLT.registerBridgeCallbacks([{
		enabled: true,
		cbType: "messageRedirect",
		cbFunction: function (msg, msgObj) {
			if (msgObj && msgObj.type === 2 && msgObj.screenview.type === "LOAD") {
				if (typeof window.dataLayer !== "undefined" && !msgObj.hasOwnProperty("DatalayerData")) {
					try {
					//Convert GTM datalayer nested Objects in to single array
 var flatLayer = function(dataobject) {
  var extract = {};
  for (var i = 0; i < dataobject.length; i++) {
    for (var p in dataobject[i]) {
      extract[p] = dataobject[i][p];
    }
  }
  return (JSON.parse(JSON.stringify(extract)));
}
msgObj["DatalayerData"] =flatLayer(window.dataLayer);

					} catch (e) {};
				}
			}
			return msgObj;
		}
	}]);

// Adds the Step Number from DataLayer Value to every Iframe URL load so They can be identified Individually in Overstat
					//Convert GTM datalayer nested Objects in to single array
	//-----------------------------------------------------------------------------------
	TLT.registerBridgeCallbacks([{
		enabled: true,
		cbType: "messageRedirect",
		cbFunction: function (msg, msgObj) {
			var iframeStepName;
			var origURL;
			function addIframeStep(url) {
				try{
				if (typeof url !== "undefined") {
					if (url.length > 0 && url == '/gva/proc') {
						if (typeof window.dataLayer !== "undefined") {
                             var extract = {};
                             for (var i = 0; i < window.dataLayer.length; i++) {
                             for (var p in window.dataLayer[i]) {
                             extract[p] = window.dataLayer[i][p];
                                       }
                                     }
                                 iframeStepName=url+"/"+extract.gva.step;
						     }
					      }
				       }
				return iframeStepName;
				 }catch(e){
			    return url;
			   }
			 }

			if (msgObj) {
				if (msgObj.type > 0) {
					try{
					// Loop over all places where URL exists and replace it if a match if found
					if ((typeof msgObj.screenview !== "undefined") && (typeof msgObj.screenview.url !== "undefined") && (msgObj.screenview.url == '/gva/proc')) {
						msgObj.screenview.url = addIframeStep(msgObj.screenview.url);
						msgObj.screenview.origURL = window.location.pathname;
					} else if ((typeof msgObj.domCapture !== "undefined") && (typeof msgObj.domCapture.url !== "undefined") && (msgObj.domCapture.url == '/gva/proc')) {
						msgObj.domCapture.url = addIframeStep(msgObj.domCapture.url);
						msgObj.screenview.origURL = window.location.pathname;
					} else if ((typeof msgObj.clientEnvironment !== "undefined") && (typeof msgObj.clientEnvironment.webEnvironment !== "undefined") && (msgObj.clientEnvironment.webEnvironment.page == '/gva/proc')) {
						msgObj.clientEnvironment.webEnvironment.page = addIframeStep(msgObj.clientEnvironment.webEnvironment.page);
						msgObj.screenview.origURL = window.location.pathname;
					}
					}catch(e){}
				}
			}
			return msgObj;
		}
	}]);