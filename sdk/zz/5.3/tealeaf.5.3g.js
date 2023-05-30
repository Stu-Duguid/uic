/* pako 1.0.1 nodeca/pako */
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.pako=t()}}(function(){return function t(e,a,i){function n(s,o){if(!a[s]){if(!e[s]){var l="function"==typeof require&&require;if(!o&&l)return l(s,!0);if(r)return r(s,!0);var h=new Error("Cannot find module '"+s+"'");throw h.code="MODULE_NOT_FOUND",h}var d=a[s]={exports:{}};e[s][0].call(d.exports,function(t){var a=e[s][1][t];return n(a?a:t)},d,d.exports,t,e,a,i)}return a[s].exports}for(var r="function"==typeof require&&require,s=0;s<i.length;s++)n(i[s]);return n}({1:[function(t,e,a){"use strict";function i(t){if(!(this instanceof i))return new i(t);this.options=l.assign({level:w,method:v,chunkSize:16384,windowBits:15,memLevel:8,strategy:p,to:""},t||{});var e=this.options;e.raw&&e.windowBits>0?e.windowBits=-e.windowBits:e.gzip&&e.windowBits>0&&e.windowBits<16&&(e.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new f,this.strm.avail_out=0;var a=o.deflateInit2(this.strm,e.level,e.method,e.windowBits,e.memLevel,e.strategy);if(a!==b)throw new Error(d[a]);if(e.header&&o.deflateSetHeader(this.strm,e.header),e.dictionary){var n;if(n="string"==typeof e.dictionary?h.string2buf(e.dictionary):"[object ArrayBuffer]"===_.call(e.dictionary)?new Uint8Array(e.dictionary):e.dictionary,a=o.deflateSetDictionary(this.strm,n),a!==b)throw new Error(d[a]);this._dict_set=!0}}function n(t,e){var a=new i(e);if(a.push(t,!0),a.err)throw a.msg;return a.result}function r(t,e){return e=e||{},e.raw=!0,n(t,e)}function s(t,e){return e=e||{},e.gzip=!0,n(t,e)}var o=t("./zlib/deflate"),l=t("./utils/common"),h=t("./utils/strings"),d=t("./zlib/messages"),f=t("./zlib/zstream"),_=Object.prototype.toString,u=0,c=4,b=0,g=1,m=2,w=-1,p=0,v=8;i.prototype.push=function(t,e){var a,i,n=this.strm,r=this.options.chunkSize;if(this.ended)return!1;i=e===~~e?e:e===!0?c:u,"string"==typeof t?n.input=h.string2buf(t):"[object ArrayBuffer]"===_.call(t)?n.input=new Uint8Array(t):n.input=t,n.next_in=0,n.avail_in=n.input.length;do{if(0===n.avail_out&&(n.output=new l.Buf8(r),n.next_out=0,n.avail_out=r),a=o.deflate(n,i),a!==g&&a!==b)return this.onEnd(a),this.ended=!0,!1;0!==n.avail_out&&(0!==n.avail_in||i!==c&&i!==m)||("string"===this.options.to?this.onData(h.buf2binstring(l.shrinkBuf(n.output,n.next_out))):this.onData(l.shrinkBuf(n.output,n.next_out)))}while((n.avail_in>0||0===n.avail_out)&&a!==g);return i===c?(a=o.deflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===b):i===m?(this.onEnd(b),n.avail_out=0,!0):!0},i.prototype.onData=function(t){this.chunks.push(t)},i.prototype.onEnd=function(t){t===b&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=l.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},a.Deflate=i,a.deflate=n,a.deflateRaw=r,a.gzip=s},{"./utils/common":3,"./utils/strings":4,"./zlib/deflate":8,"./zlib/messages":13,"./zlib/zstream":15}],2:[function(t,e,a){"use strict";function i(t){if(!(this instanceof i))return new i(t);this.options=o.assign({chunkSize:16384,windowBits:0,to:""},t||{});var e=this.options;e.raw&&e.windowBits>=0&&e.windowBits<16&&(e.windowBits=-e.windowBits,0===e.windowBits&&(e.windowBits=-15)),!(e.windowBits>=0&&e.windowBits<16)||t&&t.windowBits||(e.windowBits+=32),e.windowBits>15&&e.windowBits<48&&0===(15&e.windowBits)&&(e.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new f,this.strm.avail_out=0;var a=s.inflateInit2(this.strm,e.windowBits);if(a!==h.Z_OK)throw new Error(d[a]);this.header=new _,s.inflateGetHeader(this.strm,this.header)}function n(t,e){var a=new i(e);if(a.push(t,!0),a.err)throw a.msg;return a.result}function r(t,e){return e=e||{},e.raw=!0,n(t,e)}var s=t("./zlib/inflate"),o=t("./utils/common"),l=t("./utils/strings"),h=t("./zlib/constants"),d=t("./zlib/messages"),f=t("./zlib/zstream"),_=t("./zlib/gzheader"),u=Object.prototype.toString;i.prototype.push=function(t,e){var a,i,n,r,d,f,_=this.strm,c=this.options.chunkSize,b=this.options.dictionary,g=!1;if(this.ended)return!1;i=e===~~e?e:e===!0?h.Z_FINISH:h.Z_NO_FLUSH,"string"==typeof t?_.input=l.binstring2buf(t):"[object ArrayBuffer]"===u.call(t)?_.input=new Uint8Array(t):_.input=t,_.next_in=0,_.avail_in=_.input.length;do{if(0===_.avail_out&&(_.output=new o.Buf8(c),_.next_out=0,_.avail_out=c),a=s.inflate(_,h.Z_NO_FLUSH),a===h.Z_NEED_DICT&&b&&(f="string"==typeof b?l.string2buf(b):"[object ArrayBuffer]"===u.call(b)?new Uint8Array(b):b,a=s.inflateSetDictionary(this.strm,f)),a===h.Z_BUF_ERROR&&g===!0&&(a=h.Z_OK,g=!1),a!==h.Z_STREAM_END&&a!==h.Z_OK)return this.onEnd(a),this.ended=!0,!1;_.next_out&&(0!==_.avail_out&&a!==h.Z_STREAM_END&&(0!==_.avail_in||i!==h.Z_FINISH&&i!==h.Z_SYNC_FLUSH)||("string"===this.options.to?(n=l.utf8border(_.output,_.next_out),r=_.next_out-n,d=l.buf2string(_.output,n),_.next_out=r,_.avail_out=c-r,r&&o.arraySet(_.output,_.output,n,r,0),this.onData(d)):this.onData(o.shrinkBuf(_.output,_.next_out)))),0===_.avail_in&&0===_.avail_out&&(g=!0)}while((_.avail_in>0||0===_.avail_out)&&a!==h.Z_STREAM_END);return a===h.Z_STREAM_END&&(i=h.Z_FINISH),i===h.Z_FINISH?(a=s.inflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===h.Z_OK):i===h.Z_SYNC_FLUSH?(this.onEnd(h.Z_OK),_.avail_out=0,!0):!0},i.prototype.onData=function(t){this.chunks.push(t)},i.prototype.onEnd=function(t){t===h.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},a.Inflate=i,a.inflate=n,a.inflateRaw=r,a.ungzip=n},{"./utils/common":3,"./utils/strings":4,"./zlib/constants":6,"./zlib/gzheader":9,"./zlib/inflate":11,"./zlib/messages":13,"./zlib/zstream":15}],3:[function(t,e,a){"use strict";var i="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;a.assign=function(t){for(var e=Array.prototype.slice.call(arguments,1);e.length;){var a=e.shift();if(a){if("object"!=typeof a)throw new TypeError(a+"must be non-object");for(var i in a)a.hasOwnProperty(i)&&(t[i]=a[i])}}return t},a.shrinkBuf=function(t,e){return t.length===e?t:t.subarray?t.subarray(0,e):(t.length=e,t)};var n={arraySet:function(t,e,a,i,n){if(e.subarray&&t.subarray)return void t.set(e.subarray(a,a+i),n);for(var r=0;i>r;r++)t[n+r]=e[a+r]},flattenChunks:function(t){var e,a,i,n,r,s;for(i=0,e=0,a=t.length;a>e;e++)i+=t[e].length;for(s=new Uint8Array(i),n=0,e=0,a=t.length;a>e;e++)r=t[e],s.set(r,n),n+=r.length;return s}},r={arraySet:function(t,e,a,i,n){for(var r=0;i>r;r++)t[n+r]=e[a+r]},flattenChunks:function(t){return[].concat.apply([],t)}};a.setTyped=function(t){t?(a.Buf8=Uint8Array,a.Buf16=Uint16Array,a.Buf32=Int32Array,a.assign(a,n)):(a.Buf8=Array,a.Buf16=Array,a.Buf32=Array,a.assign(a,r))},a.setTyped(i)},{}],4:[function(t,e,a){"use strict";function i(t,e){if(65537>e&&(t.subarray&&s||!t.subarray&&r))return String.fromCharCode.apply(null,n.shrinkBuf(t,e));for(var a="",i=0;e>i;i++)a+=String.fromCharCode(t[i]);return a}var n=t("./common"),r=!0,s=!0;try{String.fromCharCode.apply(null,[0])}catch(o){r=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(o){s=!1}for(var l=new n.Buf8(256),h=0;256>h;h++)l[h]=h>=252?6:h>=248?5:h>=240?4:h>=224?3:h>=192?2:1;l[254]=l[254]=1,a.string2buf=function(t){var e,a,i,r,s,o=t.length,l=0;for(r=0;o>r;r++)a=t.charCodeAt(r),55296===(64512&a)&&o>r+1&&(i=t.charCodeAt(r+1),56320===(64512&i)&&(a=65536+(a-55296<<10)+(i-56320),r++)),l+=128>a?1:2048>a?2:65536>a?3:4;for(e=new n.Buf8(l),s=0,r=0;l>s;r++)a=t.charCodeAt(r),55296===(64512&a)&&o>r+1&&(i=t.charCodeAt(r+1),56320===(64512&i)&&(a=65536+(a-55296<<10)+(i-56320),r++)),128>a?e[s++]=a:2048>a?(e[s++]=192|a>>>6,e[s++]=128|63&a):65536>a?(e[s++]=224|a>>>12,e[s++]=128|a>>>6&63,e[s++]=128|63&a):(e[s++]=240|a>>>18,e[s++]=128|a>>>12&63,e[s++]=128|a>>>6&63,e[s++]=128|63&a);return e},a.buf2binstring=function(t){return i(t,t.length)},a.binstring2buf=function(t){for(var e=new n.Buf8(t.length),a=0,i=e.length;i>a;a++)e[a]=t.charCodeAt(a);return e},a.buf2string=function(t,e){var a,n,r,s,o=e||t.length,h=new Array(2*o);for(n=0,a=0;o>a;)if(r=t[a++],128>r)h[n++]=r;else if(s=l[r],s>4)h[n++]=65533,a+=s-1;else{for(r&=2===s?31:3===s?15:7;s>1&&o>a;)r=r<<6|63&t[a++],s--;s>1?h[n++]=65533:65536>r?h[n++]=r:(r-=65536,h[n++]=55296|r>>10&1023,h[n++]=56320|1023&r)}return i(h,n)},a.utf8border=function(t,e){var a;for(e=e||t.length,e>t.length&&(e=t.length),a=e-1;a>=0&&128===(192&t[a]);)a--;return 0>a?e:0===a?e:a+l[t[a]]>e?a:e}},{"./common":3}],5:[function(t,e,a){"use strict";function i(t,e,a,i){for(var n=65535&t|0,r=t>>>16&65535|0,s=0;0!==a;){s=a>2e3?2e3:a,a-=s;do n=n+e[i++]|0,r=r+n|0;while(--s);n%=65521,r%=65521}return n|r<<16|0}e.exports=i},{}],6:[function(t,e,a){"use strict";e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],7:[function(t,e,a){"use strict";function i(){for(var t,e=[],a=0;256>a;a++){t=a;for(var i=0;8>i;i++)t=1&t?3988292384^t>>>1:t>>>1;e[a]=t}return e}function n(t,e,a,i){var n=r,s=i+a;t^=-1;for(var o=i;s>o;o++)t=t>>>8^n[255&(t^e[o])];return-1^t}var r=i();e.exports=n},{}],8:[function(t,e,a){"use strict";function i(t,e){return t.msg=D[e],e}function n(t){return(t<<1)-(t>4?9:0)}function r(t){for(var e=t.length;--e>=0;)t[e]=0}function s(t){var e=t.state,a=e.pending;a>t.avail_out&&(a=t.avail_out),0!==a&&(R.arraySet(t.output,e.pending_buf,e.pending_out,a,t.next_out),t.next_out+=a,e.pending_out+=a,t.total_out+=a,t.avail_out-=a,e.pending-=a,0===e.pending&&(e.pending_out=0))}function o(t,e){C._tr_flush_block(t,t.block_start>=0?t.block_start:-1,t.strstart-t.block_start,e),t.block_start=t.strstart,s(t.strm)}function l(t,e){t.pending_buf[t.pending++]=e}function h(t,e){t.pending_buf[t.pending++]=e>>>8&255,t.pending_buf[t.pending++]=255&e}function d(t,e,a,i){var n=t.avail_in;return n>i&&(n=i),0===n?0:(t.avail_in-=n,R.arraySet(e,t.input,t.next_in,n,a),1===t.state.wrap?t.adler=N(t.adler,e,n,a):2===t.state.wrap&&(t.adler=O(t.adler,e,n,a)),t.next_in+=n,t.total_in+=n,n)}function f(t,e){var a,i,n=t.max_chain_length,r=t.strstart,s=t.prev_length,o=t.nice_match,l=t.strstart>t.w_size-ft?t.strstart-(t.w_size-ft):0,h=t.window,d=t.w_mask,f=t.prev,_=t.strstart+dt,u=h[r+s-1],c=h[r+s];t.prev_length>=t.good_match&&(n>>=2),o>t.lookahead&&(o=t.lookahead);do if(a=e,h[a+s]===c&&h[a+s-1]===u&&h[a]===h[r]&&h[++a]===h[r+1]){r+=2,a++;do;while(h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&_>r);if(i=dt-(_-r),r=_-dt,i>s){if(t.match_start=e,s=i,i>=o)break;u=h[r+s-1],c=h[r+s]}}while((e=f[e&d])>l&&0!==--n);return s<=t.lookahead?s:t.lookahead}function _(t){var e,a,i,n,r,s=t.w_size;do{if(n=t.window_size-t.lookahead-t.strstart,t.strstart>=s+(s-ft)){R.arraySet(t.window,t.window,s,s,0),t.match_start-=s,t.strstart-=s,t.block_start-=s,a=t.hash_size,e=a;do i=t.head[--e],t.head[e]=i>=s?i-s:0;while(--a);a=s,e=a;do i=t.prev[--e],t.prev[e]=i>=s?i-s:0;while(--a);n+=s}if(0===t.strm.avail_in)break;if(a=d(t.strm,t.window,t.strstart+t.lookahead,n),t.lookahead+=a,t.lookahead+t.insert>=ht)for(r=t.strstart-t.insert,t.ins_h=t.window[r],t.ins_h=(t.ins_h<<t.hash_shift^t.window[r+1])&t.hash_mask;t.insert&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[r+ht-1])&t.hash_mask,t.prev[r&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=r,r++,t.insert--,!(t.lookahead+t.insert<ht)););}while(t.lookahead<ft&&0!==t.strm.avail_in)}function u(t,e){var a=65535;for(a>t.pending_buf_size-5&&(a=t.pending_buf_size-5);;){if(t.lookahead<=1){if(_(t),0===t.lookahead&&e===I)return vt;if(0===t.lookahead)break}t.strstart+=t.lookahead,t.lookahead=0;var i=t.block_start+a;if((0===t.strstart||t.strstart>=i)&&(t.lookahead=t.strstart-i,t.strstart=i,o(t,!1),0===t.strm.avail_out))return vt;if(t.strstart-t.block_start>=t.w_size-ft&&(o(t,!1),0===t.strm.avail_out))return vt}return t.insert=0,e===F?(o(t,!0),0===t.strm.avail_out?yt:xt):t.strstart>t.block_start&&(o(t,!1),0===t.strm.avail_out)?vt:vt}function c(t,e){for(var a,i;;){if(t.lookahead<ft){if(_(t),t.lookahead<ft&&e===I)return vt;if(0===t.lookahead)break}if(a=0,t.lookahead>=ht&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+ht-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!==a&&t.strstart-a<=t.w_size-ft&&(t.match_length=f(t,a)),t.match_length>=ht)if(i=C._tr_tally(t,t.strstart-t.match_start,t.match_length-ht),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=ht){t.match_length--;do t.strstart++,t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+ht-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart;while(0!==--t.match_length);t.strstart++}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+1])&t.hash_mask;else i=C._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(i&&(o(t,!1),0===t.strm.avail_out))return vt}return t.insert=t.strstart<ht-1?t.strstart:ht-1,e===F?(o(t,!0),0===t.strm.avail_out?yt:xt):t.last_lit&&(o(t,!1),0===t.strm.avail_out)?vt:kt}function b(t,e){for(var a,i,n;;){if(t.lookahead<ft){if(_(t),t.lookahead<ft&&e===I)return vt;if(0===t.lookahead)break}if(a=0,t.lookahead>=ht&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+ht-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=ht-1,0!==a&&t.prev_length<t.max_lazy_match&&t.strstart-a<=t.w_size-ft&&(t.match_length=f(t,a),t.match_length<=5&&(t.strategy===q||t.match_length===ht&&t.strstart-t.match_start>4096)&&(t.match_length=ht-1)),t.prev_length>=ht&&t.match_length<=t.prev_length){n=t.strstart+t.lookahead-ht,i=C._tr_tally(t,t.strstart-1-t.prev_match,t.prev_length-ht),t.lookahead-=t.prev_length-1,t.prev_length-=2;do++t.strstart<=n&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+ht-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart);while(0!==--t.prev_length);if(t.match_available=0,t.match_length=ht-1,t.strstart++,i&&(o(t,!1),0===t.strm.avail_out))return vt}else if(t.match_available){if(i=C._tr_tally(t,0,t.window[t.strstart-1]),i&&o(t,!1),t.strstart++,t.lookahead--,0===t.strm.avail_out)return vt}else t.match_available=1,t.strstart++,t.lookahead--}return t.match_available&&(i=C._tr_tally(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<ht-1?t.strstart:ht-1,e===F?(o(t,!0),0===t.strm.avail_out?yt:xt):t.last_lit&&(o(t,!1),0===t.strm.avail_out)?vt:kt}function g(t,e){for(var a,i,n,r,s=t.window;;){if(t.lookahead<=dt){if(_(t),t.lookahead<=dt&&e===I)return vt;if(0===t.lookahead)break}if(t.match_length=0,t.lookahead>=ht&&t.strstart>0&&(n=t.strstart-1,i=s[n],i===s[++n]&&i===s[++n]&&i===s[++n])){r=t.strstart+dt;do;while(i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&r>n);t.match_length=dt-(r-n),t.match_length>t.lookahead&&(t.match_length=t.lookahead)}if(t.match_length>=ht?(a=C._tr_tally(t,1,t.match_length-ht),t.lookahead-=t.match_length,t.strstart+=t.match_length,t.match_length=0):(a=C._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++),a&&(o(t,!1),0===t.strm.avail_out))return vt}return t.insert=0,e===F?(o(t,!0),0===t.strm.avail_out?yt:xt):t.last_lit&&(o(t,!1),0===t.strm.avail_out)?vt:kt}function m(t,e){for(var a;;){if(0===t.lookahead&&(_(t),0===t.lookahead)){if(e===I)return vt;break}if(t.match_length=0,a=C._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++,a&&(o(t,!1),0===t.strm.avail_out))return vt}return t.insert=0,e===F?(o(t,!0),0===t.strm.avail_out?yt:xt):t.last_lit&&(o(t,!1),0===t.strm.avail_out)?vt:kt}function w(t,e,a,i,n){this.good_length=t,this.max_lazy=e,this.nice_length=a,this.max_chain=i,this.func=n}function p(t){t.window_size=2*t.w_size,r(t.head),t.max_lazy_match=Z[t.level].max_lazy,t.good_match=Z[t.level].good_length,t.nice_match=Z[t.level].nice_length,t.max_chain_length=Z[t.level].max_chain,t.strstart=0,t.block_start=0,t.lookahead=0,t.insert=0,t.match_length=t.prev_length=ht-1,t.match_available=0,t.ins_h=0}function v(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=V,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new R.Buf16(2*ot),this.dyn_dtree=new R.Buf16(2*(2*rt+1)),this.bl_tree=new R.Buf16(2*(2*st+1)),r(this.dyn_ltree),r(this.dyn_dtree),r(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new R.Buf16(lt+1),this.heap=new R.Buf16(2*nt+1),r(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new R.Buf16(2*nt+1),r(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function k(t){var e;return t&&t.state?(t.total_in=t.total_out=0,t.data_type=Q,e=t.state,e.pending=0,e.pending_out=0,e.wrap<0&&(e.wrap=-e.wrap),e.status=e.wrap?ut:wt,t.adler=2===e.wrap?0:1,e.last_flush=I,C._tr_init(e),H):i(t,K)}function y(t){var e=k(t);return e===H&&p(t.state),e}function x(t,e){return t&&t.state?2!==t.state.wrap?K:(t.state.gzhead=e,H):K}function z(t,e,a,n,r,s){if(!t)return K;var o=1;if(e===Y&&(e=6),0>n?(o=0,n=-n):n>15&&(o=2,n-=16),1>r||r>$||a!==V||8>n||n>15||0>e||e>9||0>s||s>W)return i(t,K);8===n&&(n=9);var l=new v;return t.state=l,l.strm=t,l.wrap=o,l.gzhead=null,l.w_bits=n,l.w_size=1<<l.w_bits,l.w_mask=l.w_size-1,l.hash_bits=r+7,l.hash_size=1<<l.hash_bits,l.hash_mask=l.hash_size-1,l.hash_shift=~~((l.hash_bits+ht-1)/ht),l.window=new R.Buf8(2*l.w_size),l.head=new R.Buf16(l.hash_size),l.prev=new R.Buf16(l.w_size),l.lit_bufsize=1<<r+6,l.pending_buf_size=4*l.lit_bufsize,l.pending_buf=new R.Buf8(l.pending_buf_size),l.d_buf=l.lit_bufsize>>1,l.l_buf=3*l.lit_bufsize,l.level=e,l.strategy=s,l.method=a,y(t)}function B(t,e){return z(t,e,V,tt,et,J)}function S(t,e){var a,o,d,f;if(!t||!t.state||e>L||0>e)return t?i(t,K):K;if(o=t.state,!t.output||!t.input&&0!==t.avail_in||o.status===pt&&e!==F)return i(t,0===t.avail_out?P:K);if(o.strm=t,a=o.last_flush,o.last_flush=e,o.status===ut)if(2===o.wrap)t.adler=0,l(o,31),l(o,139),l(o,8),o.gzhead?(l(o,(o.gzhead.text?1:0)+(o.gzhead.hcrc?2:0)+(o.gzhead.extra?4:0)+(o.gzhead.name?8:0)+(o.gzhead.comment?16:0)),l(o,255&o.gzhead.time),l(o,o.gzhead.time>>8&255),l(o,o.gzhead.time>>16&255),l(o,o.gzhead.time>>24&255),l(o,9===o.level?2:o.strategy>=G||o.level<2?4:0),l(o,255&o.gzhead.os),o.gzhead.extra&&o.gzhead.extra.length&&(l(o,255&o.gzhead.extra.length),l(o,o.gzhead.extra.length>>8&255)),o.gzhead.hcrc&&(t.adler=O(t.adler,o.pending_buf,o.pending,0)),o.gzindex=0,o.status=ct):(l(o,0),l(o,0),l(o,0),l(o,0),l(o,0),l(o,9===o.level?2:o.strategy>=G||o.level<2?4:0),l(o,zt),o.status=wt);else{var _=V+(o.w_bits-8<<4)<<8,u=-1;u=o.strategy>=G||o.level<2?0:o.level<6?1:6===o.level?2:3,_|=u<<6,0!==o.strstart&&(_|=_t),_+=31-_%31,o.status=wt,h(o,_),0!==o.strstart&&(h(o,t.adler>>>16),h(o,65535&t.adler)),t.adler=1}if(o.status===ct)if(o.gzhead.extra){for(d=o.pending;o.gzindex<(65535&o.gzhead.extra.length)&&(o.pending!==o.pending_buf_size||(o.gzhead.hcrc&&o.pending>d&&(t.adler=O(t.adler,o.pending_buf,o.pending-d,d)),s(t),d=o.pending,o.pending!==o.pending_buf_size));)l(o,255&o.gzhead.extra[o.gzindex]),o.gzindex++;o.gzhead.hcrc&&o.pending>d&&(t.adler=O(t.adler,o.pending_buf,o.pending-d,d)),o.gzindex===o.gzhead.extra.length&&(o.gzindex=0,o.status=bt)}else o.status=bt;if(o.status===bt)if(o.gzhead.name){d=o.pending;do{if(o.pending===o.pending_buf_size&&(o.gzhead.hcrc&&o.pending>d&&(t.adler=O(t.adler,o.pending_buf,o.pending-d,d)),s(t),d=o.pending,o.pending===o.pending_buf_size)){f=1;break}f=o.gzindex<o.gzhead.name.length?255&o.gzhead.name.charCodeAt(o.gzindex++):0,l(o,f)}while(0!==f);o.gzhead.hcrc&&o.pending>d&&(t.adler=O(t.adler,o.pending_buf,o.pending-d,d)),0===f&&(o.gzindex=0,o.status=gt)}else o.status=gt;if(o.status===gt)if(o.gzhead.comment){d=o.pending;do{if(o.pending===o.pending_buf_size&&(o.gzhead.hcrc&&o.pending>d&&(t.adler=O(t.adler,o.pending_buf,o.pending-d,d)),s(t),d=o.pending,o.pending===o.pending_buf_size)){f=1;break}f=o.gzindex<o.gzhead.comment.length?255&o.gzhead.comment.charCodeAt(o.gzindex++):0,l(o,f)}while(0!==f);o.gzhead.hcrc&&o.pending>d&&(t.adler=O(t.adler,o.pending_buf,o.pending-d,d)),0===f&&(o.status=mt)}else o.status=mt;if(o.status===mt&&(o.gzhead.hcrc?(o.pending+2>o.pending_buf_size&&s(t),o.pending+2<=o.pending_buf_size&&(l(o,255&t.adler),l(o,t.adler>>8&255),t.adler=0,o.status=wt)):o.status=wt),0!==o.pending){if(s(t),0===t.avail_out)return o.last_flush=-1,H}else if(0===t.avail_in&&n(e)<=n(a)&&e!==F)return i(t,P);if(o.status===pt&&0!==t.avail_in)return i(t,P);if(0!==t.avail_in||0!==o.lookahead||e!==I&&o.status!==pt){var c=o.strategy===G?m(o,e):o.strategy===X?g(o,e):Z[o.level].func(o,e);if(c!==yt&&c!==xt||(o.status=pt),c===vt||c===yt)return 0===t.avail_out&&(o.last_flush=-1),H;if(c===kt&&(e===U?C._tr_align(o):e!==L&&(C._tr_stored_block(o,0,0,!1),e===T&&(r(o.head),0===o.lookahead&&(o.strstart=0,o.block_start=0,o.insert=0))),s(t),0===t.avail_out))return o.last_flush=-1,H}return e!==F?H:o.wrap<=0?j:(2===o.wrap?(l(o,255&t.adler),l(o,t.adler>>8&255),l(o,t.adler>>16&255),l(o,t.adler>>24&255),l(o,255&t.total_in),l(o,t.total_in>>8&255),l(o,t.total_in>>16&255),l(o,t.total_in>>24&255)):(h(o,t.adler>>>16),h(o,65535&t.adler)),s(t),o.wrap>0&&(o.wrap=-o.wrap),0!==o.pending?H:j)}function E(t){var e;return t&&t.state?(e=t.state.status,e!==ut&&e!==ct&&e!==bt&&e!==gt&&e!==mt&&e!==wt&&e!==pt?i(t,K):(t.state=null,e===wt?i(t,M):H)):K}function A(t,e){var a,i,n,s,o,l,h,d,f=e.length;if(!t||!t.state)return K;if(a=t.state,s=a.wrap,2===s||1===s&&a.status!==ut||a.lookahead)return K;for(1===s&&(t.adler=N(t.adler,e,f,0)),a.wrap=0,f>=a.w_size&&(0===s&&(r(a.head),a.strstart=0,a.block_start=0,a.insert=0),d=new R.Buf8(a.w_size),R.arraySet(d,e,f-a.w_size,a.w_size,0),e=d,f=a.w_size),o=t.avail_in,l=t.next_in,h=t.input,t.avail_in=f,t.next_in=0,t.input=e,_(a);a.lookahead>=ht;){i=a.strstart,n=a.lookahead-(ht-1);do a.ins_h=(a.ins_h<<a.hash_shift^a.window[i+ht-1])&a.hash_mask,a.prev[i&a.w_mask]=a.head[a.ins_h],a.head[a.ins_h]=i,i++;while(--n);a.strstart=i,a.lookahead=ht-1,_(a)}return a.strstart+=a.lookahead,a.block_start=a.strstart,a.insert=a.lookahead,a.lookahead=0,a.match_length=a.prev_length=ht-1,a.match_available=0,t.next_in=l,t.input=h,t.avail_in=o,a.wrap=s,H}var Z,R=t("../utils/common"),C=t("./trees"),N=t("./adler32"),O=t("./crc32"),D=t("./messages"),I=0,U=1,T=3,F=4,L=5,H=0,j=1,K=-2,M=-3,P=-5,Y=-1,q=1,G=2,X=3,W=4,J=0,Q=2,V=8,$=9,tt=15,et=8,at=29,it=256,nt=it+1+at,rt=30,st=19,ot=2*nt+1,lt=15,ht=3,dt=258,ft=dt+ht+1,_t=32,ut=42,ct=69,bt=73,gt=91,mt=103,wt=113,pt=666,vt=1,kt=2,yt=3,xt=4,zt=3;Z=[new w(0,0,0,0,u),new w(4,4,8,4,c),new w(4,5,16,8,c),new w(4,6,32,32,c),new w(4,4,16,16,b),new w(8,16,32,32,b),new w(8,16,128,128,b),new w(8,32,128,256,b),new w(32,128,258,1024,b),new w(32,258,258,4096,b)],a.deflateInit=B,a.deflateInit2=z,a.deflateReset=y,a.deflateResetKeep=k,a.deflateSetHeader=x,a.deflate=S,a.deflateEnd=E,a.deflateSetDictionary=A,a.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":3,"./adler32":5,"./crc32":7,"./messages":13,"./trees":14}],9:[function(t,e,a){"use strict";function i(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}e.exports=i},{}],10:[function(t,e,a){"use strict";var i=30,n=12;e.exports=function(t,e){var a,r,s,o,l,h,d,f,_,u,c,b,g,m,w,p,v,k,y,x,z,B,S,E,A;a=t.state,r=t.next_in,E=t.input,s=r+(t.avail_in-5),o=t.next_out,A=t.output,l=o-(e-t.avail_out),h=o+(t.avail_out-257),d=a.dmax,f=a.wsize,_=a.whave,u=a.wnext,c=a.window,b=a.hold,g=a.bits,m=a.lencode,w=a.distcode,p=(1<<a.lenbits)-1,v=(1<<a.distbits)-1;t:do{15>g&&(b+=E[r++]<<g,g+=8,b+=E[r++]<<g,g+=8),k=m[b&p];e:for(;;){if(y=k>>>24,b>>>=y,g-=y,y=k>>>16&255,0===y)A[o++]=65535&k;else{if(!(16&y)){if(0===(64&y)){k=m[(65535&k)+(b&(1<<y)-1)];continue e}if(32&y){a.mode=n;break t}t.msg="invalid literal/length code",a.mode=i;break t}x=65535&k,y&=15,y&&(y>g&&(b+=E[r++]<<g,g+=8),x+=b&(1<<y)-1,b>>>=y,g-=y),15>g&&(b+=E[r++]<<g,g+=8,b+=E[r++]<<g,g+=8),k=w[b&v];a:for(;;){if(y=k>>>24,b>>>=y,g-=y,y=k>>>16&255,!(16&y)){if(0===(64&y)){k=w[(65535&k)+(b&(1<<y)-1)];continue a}t.msg="invalid distance code",a.mode=i;break t}if(z=65535&k,y&=15,y>g&&(b+=E[r++]<<g,g+=8,y>g&&(b+=E[r++]<<g,g+=8)),z+=b&(1<<y)-1,z>d){t.msg="invalid distance too far back",a.mode=i;break t}if(b>>>=y,g-=y,y=o-l,z>y){if(y=z-y,y>_&&a.sane){t.msg="invalid distance too far back",a.mode=i;break t}if(B=0,S=c,0===u){if(B+=f-y,x>y){x-=y;do A[o++]=c[B++];while(--y);B=o-z,S=A}}else if(y>u){if(B+=f+u-y,y-=u,x>y){x-=y;do A[o++]=c[B++];while(--y);if(B=0,x>u){y=u,x-=y;do A[o++]=c[B++];while(--y);B=o-z,S=A}}}else if(B+=u-y,x>y){x-=y;do A[o++]=c[B++];while(--y);B=o-z,S=A}for(;x>2;)A[o++]=S[B++],A[o++]=S[B++],A[o++]=S[B++],x-=3;x&&(A[o++]=S[B++],x>1&&(A[o++]=S[B++]))}else{B=o-z;do A[o++]=A[B++],A[o++]=A[B++],A[o++]=A[B++],x-=3;while(x>2);x&&(A[o++]=A[B++],x>1&&(A[o++]=A[B++]))}break}}break}}while(s>r&&h>o);x=g>>3,r-=x,g-=x<<3,b&=(1<<g)-1,t.next_in=r,t.next_out=o,t.avail_in=s>r?5+(s-r):5-(r-s),t.avail_out=h>o?257+(h-o):257-(o-h),a.hold=b,a.bits=g}},{}],11:[function(t,e,a){"use strict";function i(t){return(t>>>24&255)+(t>>>8&65280)+((65280&t)<<8)+((255&t)<<24)}function n(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new w.Buf16(320),this.work=new w.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function r(t){var e;return t&&t.state?(e=t.state,t.total_in=t.total_out=e.total=0,t.msg="",e.wrap&&(t.adler=1&e.wrap),e.mode=T,e.last=0,e.havedict=0,e.dmax=32768,e.head=null,e.hold=0,e.bits=0,e.lencode=e.lendyn=new w.Buf32(bt),e.distcode=e.distdyn=new w.Buf32(gt),e.sane=1,e.back=-1,Z):N}function s(t){var e;return t&&t.state?(e=t.state,e.wsize=0,e.whave=0,e.wnext=0,r(t)):N}function o(t,e){var a,i;return t&&t.state?(i=t.state,0>e?(a=0,e=-e):(a=(e>>4)+1,48>e&&(e&=15)),e&&(8>e||e>15)?N:(null!==i.window&&i.wbits!==e&&(i.window=null),i.wrap=a,i.wbits=e,s(t))):N}function l(t,e){var a,i;return t?(i=new n,t.state=i,i.window=null,a=o(t,e),a!==Z&&(t.state=null),a):N}function h(t){return l(t,wt)}function d(t){if(pt){var e;for(g=new w.Buf32(512),m=new w.Buf32(32),e=0;144>e;)t.lens[e++]=8;for(;256>e;)t.lens[e++]=9;for(;280>e;)t.lens[e++]=7;for(;288>e;)t.lens[e++]=8;for(y(z,t.lens,0,288,g,0,t.work,{bits:9}),e=0;32>e;)t.lens[e++]=5;y(B,t.lens,0,32,m,0,t.work,{bits:5}),pt=!1}t.lencode=g,t.lenbits=9,t.distcode=m,t.distbits=5}function f(t,e,a,i){var n,r=t.state;return null===r.window&&(r.wsize=1<<r.wbits,r.wnext=0,r.whave=0,r.window=new w.Buf8(r.wsize)),i>=r.wsize?(w.arraySet(r.window,e,a-r.wsize,r.wsize,0),r.wnext=0,r.whave=r.wsize):(n=r.wsize-r.wnext,n>i&&(n=i),w.arraySet(r.window,e,a-i,n,r.wnext),i-=n,i?(w.arraySet(r.window,e,a-i,i,0),r.wnext=i,r.whave=r.wsize):(r.wnext+=n,r.wnext===r.wsize&&(r.wnext=0),r.whave<r.wsize&&(r.whave+=n))),0}function _(t,e){var a,n,r,s,o,l,h,_,u,c,b,g,m,bt,gt,mt,wt,pt,vt,kt,yt,xt,zt,Bt,St=0,Et=new w.Buf8(4),At=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!t||!t.state||!t.output||!t.input&&0!==t.avail_in)return N;a=t.state,a.mode===X&&(a.mode=W),o=t.next_out,r=t.output,h=t.avail_out,s=t.next_in,n=t.input,l=t.avail_in,_=a.hold,u=a.bits,c=l,b=h,xt=Z;t:for(;;)switch(a.mode){case T:if(0===a.wrap){a.mode=W;break}for(;16>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(2&a.wrap&&35615===_){a.check=0,Et[0]=255&_,Et[1]=_>>>8&255,a.check=v(a.check,Et,2,0),_=0,u=0,a.mode=F;break}if(a.flags=0,a.head&&(a.head.done=!1),!(1&a.wrap)||(((255&_)<<8)+(_>>8))%31){t.msg="incorrect header check",a.mode=_t;break}if((15&_)!==U){t.msg="unknown compression method",a.mode=_t;break}if(_>>>=4,u-=4,yt=(15&_)+8,0===a.wbits)a.wbits=yt;else if(yt>a.wbits){t.msg="invalid window size",a.mode=_t;break}a.dmax=1<<yt,t.adler=a.check=1,a.mode=512&_?q:X,_=0,u=0;break;case F:for(;16>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(a.flags=_,(255&a.flags)!==U){t.msg="unknown compression method",a.mode=_t;break}if(57344&a.flags){t.msg="unknown header flags set",a.mode=_t;break}a.head&&(a.head.text=_>>8&1),512&a.flags&&(Et[0]=255&_,Et[1]=_>>>8&255,a.check=v(a.check,Et,2,0)),_=0,u=0,a.mode=L;case L:for(;32>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}a.head&&(a.head.time=_),512&a.flags&&(Et[0]=255&_,Et[1]=_>>>8&255,Et[2]=_>>>16&255,Et[3]=_>>>24&255,a.check=v(a.check,Et,4,0)),_=0,u=0,a.mode=H;case H:for(;16>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}a.head&&(a.head.xflags=255&_,a.head.os=_>>8),512&a.flags&&(Et[0]=255&_,Et[1]=_>>>8&255,a.check=v(a.check,Et,2,0)),_=0,u=0,a.mode=j;case j:if(1024&a.flags){for(;16>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}a.length=_,a.head&&(a.head.extra_len=_),512&a.flags&&(Et[0]=255&_,Et[1]=_>>>8&255,a.check=v(a.check,Et,2,0)),_=0,u=0}else a.head&&(a.head.extra=null);a.mode=K;case K:if(1024&a.flags&&(g=a.length,g>l&&(g=l),g&&(a.head&&(yt=a.head.extra_len-a.length,a.head.extra||(a.head.extra=new Array(a.head.extra_len)),w.arraySet(a.head.extra,n,s,g,yt)),512&a.flags&&(a.check=v(a.check,n,g,s)),l-=g,s+=g,a.length-=g),a.length))break t;a.length=0,a.mode=M;case M:if(2048&a.flags){if(0===l)break t;g=0;do yt=n[s+g++],a.head&&yt&&a.length<65536&&(a.head.name+=String.fromCharCode(yt));while(yt&&l>g);if(512&a.flags&&(a.check=v(a.check,n,g,s)),l-=g,s+=g,yt)break t}else a.head&&(a.head.name=null);a.length=0,a.mode=P;case P:if(4096&a.flags){if(0===l)break t;g=0;do yt=n[s+g++],a.head&&yt&&a.length<65536&&(a.head.comment+=String.fromCharCode(yt));while(yt&&l>g);if(512&a.flags&&(a.check=v(a.check,n,g,s)),l-=g,s+=g,yt)break t}else a.head&&(a.head.comment=null);a.mode=Y;case Y:if(512&a.flags){for(;16>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(_!==(65535&a.check)){t.msg="header crc mismatch",a.mode=_t;break}_=0,u=0}a.head&&(a.head.hcrc=a.flags>>9&1,a.head.done=!0),t.adler=a.check=0,a.mode=X;break;case q:for(;32>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}t.adler=a.check=i(_),_=0,u=0,a.mode=G;case G:if(0===a.havedict)return t.next_out=o,t.avail_out=h,t.next_in=s,t.avail_in=l,a.hold=_,a.bits=u,C;t.adler=a.check=1,a.mode=X;case X:if(e===E||e===A)break t;case W:if(a.last){_>>>=7&u,u-=7&u,a.mode=ht;break}for(;3>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}switch(a.last=1&_,_>>>=1,u-=1,3&_){case 0:a.mode=J;break;case 1:if(d(a),a.mode=at,e===A){_>>>=2,u-=2;break t}break;case 2:a.mode=$;break;case 3:t.msg="invalid block type",a.mode=_t}_>>>=2,u-=2;break;case J:for(_>>>=7&u,u-=7&u;32>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if((65535&_)!==(_>>>16^65535)){t.msg="invalid stored block lengths",a.mode=_t;break}if(a.length=65535&_,_=0,u=0,a.mode=Q,e===A)break t;case Q:a.mode=V;case V:if(g=a.length){if(g>l&&(g=l),g>h&&(g=h),0===g)break t;w.arraySet(r,n,s,g,o),l-=g,s+=g,h-=g,o+=g,a.length-=g;break}a.mode=X;break;case $:for(;14>u;){
if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(a.nlen=(31&_)+257,_>>>=5,u-=5,a.ndist=(31&_)+1,_>>>=5,u-=5,a.ncode=(15&_)+4,_>>>=4,u-=4,a.nlen>286||a.ndist>30){t.msg="too many length or distance symbols",a.mode=_t;break}a.have=0,a.mode=tt;case tt:for(;a.have<a.ncode;){for(;3>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}a.lens[At[a.have++]]=7&_,_>>>=3,u-=3}for(;a.have<19;)a.lens[At[a.have++]]=0;if(a.lencode=a.lendyn,a.lenbits=7,zt={bits:a.lenbits},xt=y(x,a.lens,0,19,a.lencode,0,a.work,zt),a.lenbits=zt.bits,xt){t.msg="invalid code lengths set",a.mode=_t;break}a.have=0,a.mode=et;case et:for(;a.have<a.nlen+a.ndist;){for(;St=a.lencode[_&(1<<a.lenbits)-1],gt=St>>>24,mt=St>>>16&255,wt=65535&St,!(u>=gt);){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(16>wt)_>>>=gt,u-=gt,a.lens[a.have++]=wt;else{if(16===wt){for(Bt=gt+2;Bt>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(_>>>=gt,u-=gt,0===a.have){t.msg="invalid bit length repeat",a.mode=_t;break}yt=a.lens[a.have-1],g=3+(3&_),_>>>=2,u-=2}else if(17===wt){for(Bt=gt+3;Bt>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}_>>>=gt,u-=gt,yt=0,g=3+(7&_),_>>>=3,u-=3}else{for(Bt=gt+7;Bt>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}_>>>=gt,u-=gt,yt=0,g=11+(127&_),_>>>=7,u-=7}if(a.have+g>a.nlen+a.ndist){t.msg="invalid bit length repeat",a.mode=_t;break}for(;g--;)a.lens[a.have++]=yt}}if(a.mode===_t)break;if(0===a.lens[256]){t.msg="invalid code -- missing end-of-block",a.mode=_t;break}if(a.lenbits=9,zt={bits:a.lenbits},xt=y(z,a.lens,0,a.nlen,a.lencode,0,a.work,zt),a.lenbits=zt.bits,xt){t.msg="invalid literal/lengths set",a.mode=_t;break}if(a.distbits=6,a.distcode=a.distdyn,zt={bits:a.distbits},xt=y(B,a.lens,a.nlen,a.ndist,a.distcode,0,a.work,zt),a.distbits=zt.bits,xt){t.msg="invalid distances set",a.mode=_t;break}if(a.mode=at,e===A)break t;case at:a.mode=it;case it:if(l>=6&&h>=258){t.next_out=o,t.avail_out=h,t.next_in=s,t.avail_in=l,a.hold=_,a.bits=u,k(t,b),o=t.next_out,r=t.output,h=t.avail_out,s=t.next_in,n=t.input,l=t.avail_in,_=a.hold,u=a.bits,a.mode===X&&(a.back=-1);break}for(a.back=0;St=a.lencode[_&(1<<a.lenbits)-1],gt=St>>>24,mt=St>>>16&255,wt=65535&St,!(u>=gt);){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(mt&&0===(240&mt)){for(pt=gt,vt=mt,kt=wt;St=a.lencode[kt+((_&(1<<pt+vt)-1)>>pt)],gt=St>>>24,mt=St>>>16&255,wt=65535&St,!(u>=pt+gt);){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}_>>>=pt,u-=pt,a.back+=pt}if(_>>>=gt,u-=gt,a.back+=gt,a.length=wt,0===mt){a.mode=lt;break}if(32&mt){a.back=-1,a.mode=X;break}if(64&mt){t.msg="invalid literal/length code",a.mode=_t;break}a.extra=15&mt,a.mode=nt;case nt:if(a.extra){for(Bt=a.extra;Bt>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}a.length+=_&(1<<a.extra)-1,_>>>=a.extra,u-=a.extra,a.back+=a.extra}a.was=a.length,a.mode=rt;case rt:for(;St=a.distcode[_&(1<<a.distbits)-1],gt=St>>>24,mt=St>>>16&255,wt=65535&St,!(u>=gt);){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(0===(240&mt)){for(pt=gt,vt=mt,kt=wt;St=a.distcode[kt+((_&(1<<pt+vt)-1)>>pt)],gt=St>>>24,mt=St>>>16&255,wt=65535&St,!(u>=pt+gt);){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}_>>>=pt,u-=pt,a.back+=pt}if(_>>>=gt,u-=gt,a.back+=gt,64&mt){t.msg="invalid distance code",a.mode=_t;break}a.offset=wt,a.extra=15&mt,a.mode=st;case st:if(a.extra){for(Bt=a.extra;Bt>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}a.offset+=_&(1<<a.extra)-1,_>>>=a.extra,u-=a.extra,a.back+=a.extra}if(a.offset>a.dmax){t.msg="invalid distance too far back",a.mode=_t;break}a.mode=ot;case ot:if(0===h)break t;if(g=b-h,a.offset>g){if(g=a.offset-g,g>a.whave&&a.sane){t.msg="invalid distance too far back",a.mode=_t;break}g>a.wnext?(g-=a.wnext,m=a.wsize-g):m=a.wnext-g,g>a.length&&(g=a.length),bt=a.window}else bt=r,m=o-a.offset,g=a.length;g>h&&(g=h),h-=g,a.length-=g;do r[o++]=bt[m++];while(--g);0===a.length&&(a.mode=it);break;case lt:if(0===h)break t;r[o++]=a.length,h--,a.mode=it;break;case ht:if(a.wrap){for(;32>u;){if(0===l)break t;l--,_|=n[s++]<<u,u+=8}if(b-=h,t.total_out+=b,a.total+=b,b&&(t.adler=a.check=a.flags?v(a.check,r,b,o-b):p(a.check,r,b,o-b)),b=h,(a.flags?_:i(_))!==a.check){t.msg="incorrect data check",a.mode=_t;break}_=0,u=0}a.mode=dt;case dt:if(a.wrap&&a.flags){for(;32>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(_!==(4294967295&a.total)){t.msg="incorrect length check",a.mode=_t;break}_=0,u=0}a.mode=ft;case ft:xt=R;break t;case _t:xt=O;break t;case ut:return D;case ct:default:return N}return t.next_out=o,t.avail_out=h,t.next_in=s,t.avail_in=l,a.hold=_,a.bits=u,(a.wsize||b!==t.avail_out&&a.mode<_t&&(a.mode<ht||e!==S))&&f(t,t.output,t.next_out,b-t.avail_out)?(a.mode=ut,D):(c-=t.avail_in,b-=t.avail_out,t.total_in+=c,t.total_out+=b,a.total+=b,a.wrap&&b&&(t.adler=a.check=a.flags?v(a.check,r,b,t.next_out-b):p(a.check,r,b,t.next_out-b)),t.data_type=a.bits+(a.last?64:0)+(a.mode===X?128:0)+(a.mode===at||a.mode===Q?256:0),(0===c&&0===b||e===S)&&xt===Z&&(xt=I),xt)}function u(t){if(!t||!t.state)return N;var e=t.state;return e.window&&(e.window=null),t.state=null,Z}function c(t,e){var a;return t&&t.state?(a=t.state,0===(2&a.wrap)?N:(a.head=e,e.done=!1,Z)):N}function b(t,e){var a,i,n,r=e.length;return t&&t.state?(a=t.state,0!==a.wrap&&a.mode!==G?N:a.mode===G&&(i=1,i=p(i,e,r,0),i!==a.check)?O:(n=f(t,e,r,r))?(a.mode=ut,D):(a.havedict=1,Z)):N}var g,m,w=t("../utils/common"),p=t("./adler32"),v=t("./crc32"),k=t("./inffast"),y=t("./inftrees"),x=0,z=1,B=2,S=4,E=5,A=6,Z=0,R=1,C=2,N=-2,O=-3,D=-4,I=-5,U=8,T=1,F=2,L=3,H=4,j=5,K=6,M=7,P=8,Y=9,q=10,G=11,X=12,W=13,J=14,Q=15,V=16,$=17,tt=18,et=19,at=20,it=21,nt=22,rt=23,st=24,ot=25,lt=26,ht=27,dt=28,ft=29,_t=30,ut=31,ct=32,bt=852,gt=592,mt=15,wt=mt,pt=!0;a.inflateReset=s,a.inflateReset2=o,a.inflateResetKeep=r,a.inflateInit=h,a.inflateInit2=l,a.inflate=_,a.inflateEnd=u,a.inflateGetHeader=c,a.inflateSetDictionary=b,a.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":3,"./adler32":5,"./crc32":7,"./inffast":10,"./inftrees":12}],12:[function(t,e,a){"use strict";var i=t("../utils/common"),n=15,r=852,s=592,o=0,l=1,h=2,d=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],f=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],_=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],u=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(t,e,a,c,b,g,m,w){var p,v,k,y,x,z,B,S,E,A=w.bits,Z=0,R=0,C=0,N=0,O=0,D=0,I=0,U=0,T=0,F=0,L=null,H=0,j=new i.Buf16(n+1),K=new i.Buf16(n+1),M=null,P=0;for(Z=0;n>=Z;Z++)j[Z]=0;for(R=0;c>R;R++)j[e[a+R]]++;for(O=A,N=n;N>=1&&0===j[N];N--);if(O>N&&(O=N),0===N)return b[g++]=20971520,b[g++]=20971520,w.bits=1,0;for(C=1;N>C&&0===j[C];C++);for(C>O&&(O=C),U=1,Z=1;n>=Z;Z++)if(U<<=1,U-=j[Z],0>U)return-1;if(U>0&&(t===o||1!==N))return-1;for(K[1]=0,Z=1;n>Z;Z++)K[Z+1]=K[Z]+j[Z];for(R=0;c>R;R++)0!==e[a+R]&&(m[K[e[a+R]]++]=R);if(t===o?(L=M=m,z=19):t===l?(L=d,H-=257,M=f,P-=257,z=256):(L=_,M=u,z=-1),F=0,R=0,Z=C,x=g,D=O,I=0,k=-1,T=1<<O,y=T-1,t===l&&T>r||t===h&&T>s)return 1;for(var Y=0;;){Y++,B=Z-I,m[R]<z?(S=0,E=m[R]):m[R]>z?(S=M[P+m[R]],E=L[H+m[R]]):(S=96,E=0),p=1<<Z-I,v=1<<D,C=v;do v-=p,b[x+(F>>I)+v]=B<<24|S<<16|E|0;while(0!==v);for(p=1<<Z-1;F&p;)p>>=1;if(0!==p?(F&=p-1,F+=p):F=0,R++,0===--j[Z]){if(Z===N)break;Z=e[a+m[R]]}if(Z>O&&(F&y)!==k){for(0===I&&(I=O),x+=C,D=Z-I,U=1<<D;N>D+I&&(U-=j[D+I],!(0>=U));)D++,U<<=1;if(T+=1<<D,t===l&&T>r||t===h&&T>s)return 1;k=F&y,b[k]=O<<24|D<<16|x-g|0}}return 0!==F&&(b[x+F]=Z-I<<24|64<<16|0),w.bits=O,0}},{"../utils/common":3}],13:[function(t,e,a){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],14:[function(t,e,a){"use strict";function i(t){for(var e=t.length;--e>=0;)t[e]=0}function n(t,e,a,i,n){this.static_tree=t,this.extra_bits=e,this.extra_base=a,this.elems=i,this.max_length=n,this.has_stree=t&&t.length}function r(t,e){this.dyn_tree=t,this.max_code=0,this.stat_desc=e}function s(t){return 256>t?lt[t]:lt[256+(t>>>7)]}function o(t,e){t.pending_buf[t.pending++]=255&e,t.pending_buf[t.pending++]=e>>>8&255}function l(t,e,a){t.bi_valid>W-a?(t.bi_buf|=e<<t.bi_valid&65535,o(t,t.bi_buf),t.bi_buf=e>>W-t.bi_valid,t.bi_valid+=a-W):(t.bi_buf|=e<<t.bi_valid&65535,t.bi_valid+=a)}function h(t,e,a){l(t,a[2*e],a[2*e+1])}function d(t,e){var a=0;do a|=1&t,t>>>=1,a<<=1;while(--e>0);return a>>>1}function f(t){16===t.bi_valid?(o(t,t.bi_buf),t.bi_buf=0,t.bi_valid=0):t.bi_valid>=8&&(t.pending_buf[t.pending++]=255&t.bi_buf,t.bi_buf>>=8,t.bi_valid-=8)}function _(t,e){var a,i,n,r,s,o,l=e.dyn_tree,h=e.max_code,d=e.stat_desc.static_tree,f=e.stat_desc.has_stree,_=e.stat_desc.extra_bits,u=e.stat_desc.extra_base,c=e.stat_desc.max_length,b=0;for(r=0;X>=r;r++)t.bl_count[r]=0;for(l[2*t.heap[t.heap_max]+1]=0,a=t.heap_max+1;G>a;a++)i=t.heap[a],r=l[2*l[2*i+1]+1]+1,r>c&&(r=c,b++),l[2*i+1]=r,i>h||(t.bl_count[r]++,s=0,i>=u&&(s=_[i-u]),o=l[2*i],t.opt_len+=o*(r+s),f&&(t.static_len+=o*(d[2*i+1]+s)));if(0!==b){do{for(r=c-1;0===t.bl_count[r];)r--;t.bl_count[r]--,t.bl_count[r+1]+=2,t.bl_count[c]--,b-=2}while(b>0);for(r=c;0!==r;r--)for(i=t.bl_count[r];0!==i;)n=t.heap[--a],n>h||(l[2*n+1]!==r&&(t.opt_len+=(r-l[2*n+1])*l[2*n],l[2*n+1]=r),i--)}}function u(t,e,a){var i,n,r=new Array(X+1),s=0;for(i=1;X>=i;i++)r[i]=s=s+a[i-1]<<1;for(n=0;e>=n;n++){var o=t[2*n+1];0!==o&&(t[2*n]=d(r[o]++,o))}}function c(){var t,e,a,i,r,s=new Array(X+1);for(a=0,i=0;K-1>i;i++)for(dt[i]=a,t=0;t<1<<et[i];t++)ht[a++]=i;for(ht[a-1]=i,r=0,i=0;16>i;i++)for(ft[i]=r,t=0;t<1<<at[i];t++)lt[r++]=i;for(r>>=7;Y>i;i++)for(ft[i]=r<<7,t=0;t<1<<at[i]-7;t++)lt[256+r++]=i;for(e=0;X>=e;e++)s[e]=0;for(t=0;143>=t;)st[2*t+1]=8,t++,s[8]++;for(;255>=t;)st[2*t+1]=9,t++,s[9]++;for(;279>=t;)st[2*t+1]=7,t++,s[7]++;for(;287>=t;)st[2*t+1]=8,t++,s[8]++;for(u(st,P+1,s),t=0;Y>t;t++)ot[2*t+1]=5,ot[2*t]=d(t,5);_t=new n(st,et,M+1,P,X),ut=new n(ot,at,0,Y,X),ct=new n(new Array(0),it,0,q,J)}function b(t){var e;for(e=0;P>e;e++)t.dyn_ltree[2*e]=0;for(e=0;Y>e;e++)t.dyn_dtree[2*e]=0;for(e=0;q>e;e++)t.bl_tree[2*e]=0;t.dyn_ltree[2*Q]=1,t.opt_len=t.static_len=0,t.last_lit=t.matches=0}function g(t){t.bi_valid>8?o(t,t.bi_buf):t.bi_valid>0&&(t.pending_buf[t.pending++]=t.bi_buf),t.bi_buf=0,t.bi_valid=0}function m(t,e,a,i){g(t),i&&(o(t,a),o(t,~a)),N.arraySet(t.pending_buf,t.window,e,a,t.pending),t.pending+=a}function w(t,e,a,i){var n=2*e,r=2*a;return t[n]<t[r]||t[n]===t[r]&&i[e]<=i[a]}function p(t,e,a){for(var i=t.heap[a],n=a<<1;n<=t.heap_len&&(n<t.heap_len&&w(e,t.heap[n+1],t.heap[n],t.depth)&&n++,!w(e,i,t.heap[n],t.depth));)t.heap[a]=t.heap[n],a=n,n<<=1;t.heap[a]=i}function v(t,e,a){var i,n,r,o,d=0;if(0!==t.last_lit)do i=t.pending_buf[t.d_buf+2*d]<<8|t.pending_buf[t.d_buf+2*d+1],n=t.pending_buf[t.l_buf+d],d++,0===i?h(t,n,e):(r=ht[n],h(t,r+M+1,e),o=et[r],0!==o&&(n-=dt[r],l(t,n,o)),i--,r=s(i),h(t,r,a),o=at[r],0!==o&&(i-=ft[r],l(t,i,o)));while(d<t.last_lit);h(t,Q,e)}function k(t,e){var a,i,n,r=e.dyn_tree,s=e.stat_desc.static_tree,o=e.stat_desc.has_stree,l=e.stat_desc.elems,h=-1;for(t.heap_len=0,t.heap_max=G,a=0;l>a;a++)0!==r[2*a]?(t.heap[++t.heap_len]=h=a,t.depth[a]=0):r[2*a+1]=0;for(;t.heap_len<2;)n=t.heap[++t.heap_len]=2>h?++h:0,r[2*n]=1,t.depth[n]=0,t.opt_len--,o&&(t.static_len-=s[2*n+1]);for(e.max_code=h,a=t.heap_len>>1;a>=1;a--)p(t,r,a);n=l;do a=t.heap[1],t.heap[1]=t.heap[t.heap_len--],p(t,r,1),i=t.heap[1],t.heap[--t.heap_max]=a,t.heap[--t.heap_max]=i,r[2*n]=r[2*a]+r[2*i],t.depth[n]=(t.depth[a]>=t.depth[i]?t.depth[a]:t.depth[i])+1,r[2*a+1]=r[2*i+1]=n,t.heap[1]=n++,p(t,r,1);while(t.heap_len>=2);t.heap[--t.heap_max]=t.heap[1],_(t,e),u(r,h,t.bl_count)}function y(t,e,a){var i,n,r=-1,s=e[1],o=0,l=7,h=4;for(0===s&&(l=138,h=3),e[2*(a+1)+1]=65535,i=0;a>=i;i++)n=s,s=e[2*(i+1)+1],++o<l&&n===s||(h>o?t.bl_tree[2*n]+=o:0!==n?(n!==r&&t.bl_tree[2*n]++,t.bl_tree[2*V]++):10>=o?t.bl_tree[2*$]++:t.bl_tree[2*tt]++,o=0,r=n,0===s?(l=138,h=3):n===s?(l=6,h=3):(l=7,h=4))}function x(t,e,a){var i,n,r=-1,s=e[1],o=0,d=7,f=4;for(0===s&&(d=138,f=3),i=0;a>=i;i++)if(n=s,s=e[2*(i+1)+1],!(++o<d&&n===s)){if(f>o){do h(t,n,t.bl_tree);while(0!==--o)}else 0!==n?(n!==r&&(h(t,n,t.bl_tree),o--),h(t,V,t.bl_tree),l(t,o-3,2)):10>=o?(h(t,$,t.bl_tree),l(t,o-3,3)):(h(t,tt,t.bl_tree),l(t,o-11,7));o=0,r=n,0===s?(d=138,f=3):n===s?(d=6,f=3):(d=7,f=4)}}function z(t){var e;for(y(t,t.dyn_ltree,t.l_desc.max_code),y(t,t.dyn_dtree,t.d_desc.max_code),k(t,t.bl_desc),e=q-1;e>=3&&0===t.bl_tree[2*nt[e]+1];e--);return t.opt_len+=3*(e+1)+5+5+4,e}function B(t,e,a,i){var n;for(l(t,e-257,5),l(t,a-1,5),l(t,i-4,4),n=0;i>n;n++)l(t,t.bl_tree[2*nt[n]+1],3);x(t,t.dyn_ltree,e-1),x(t,t.dyn_dtree,a-1)}function S(t){var e,a=4093624447;for(e=0;31>=e;e++,a>>>=1)if(1&a&&0!==t.dyn_ltree[2*e])return D;if(0!==t.dyn_ltree[18]||0!==t.dyn_ltree[20]||0!==t.dyn_ltree[26])return I;for(e=32;M>e;e++)if(0!==t.dyn_ltree[2*e])return I;return D}function E(t){bt||(c(),bt=!0),t.l_desc=new r(t.dyn_ltree,_t),t.d_desc=new r(t.dyn_dtree,ut),t.bl_desc=new r(t.bl_tree,ct),t.bi_buf=0,t.bi_valid=0,b(t)}function A(t,e,a,i){l(t,(T<<1)+(i?1:0),3),m(t,e,a,!0)}function Z(t){l(t,F<<1,3),h(t,Q,st),f(t)}function R(t,e,a,i){var n,r,s=0;t.level>0?(t.strm.data_type===U&&(t.strm.data_type=S(t)),k(t,t.l_desc),k(t,t.d_desc),s=z(t),n=t.opt_len+3+7>>>3,r=t.static_len+3+7>>>3,n>=r&&(n=r)):n=r=a+5,n>=a+4&&-1!==e?A(t,e,a,i):t.strategy===O||r===n?(l(t,(F<<1)+(i?1:0),3),v(t,st,ot)):(l(t,(L<<1)+(i?1:0),3),B(t,t.l_desc.max_code+1,t.d_desc.max_code+1,s+1),v(t,t.dyn_ltree,t.dyn_dtree)),b(t),i&&g(t)}function C(t,e,a){return t.pending_buf[t.d_buf+2*t.last_lit]=e>>>8&255,t.pending_buf[t.d_buf+2*t.last_lit+1]=255&e,t.pending_buf[t.l_buf+t.last_lit]=255&a,t.last_lit++,0===e?t.dyn_ltree[2*a]++:(t.matches++,e--,t.dyn_ltree[2*(ht[a]+M+1)]++,t.dyn_dtree[2*s(e)]++),t.last_lit===t.lit_bufsize-1}var N=t("../utils/common"),O=4,D=0,I=1,U=2,T=0,F=1,L=2,H=3,j=258,K=29,M=256,P=M+1+K,Y=30,q=19,G=2*P+1,X=15,W=16,J=7,Q=256,V=16,$=17,tt=18,et=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],at=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],it=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],nt=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],rt=512,st=new Array(2*(P+2));i(st);var ot=new Array(2*Y);i(ot);var lt=new Array(rt);i(lt);var ht=new Array(j-H+1);i(ht);var dt=new Array(K);i(dt);var ft=new Array(Y);i(ft);var _t,ut,ct,bt=!1;a._tr_init=E,a._tr_stored_block=A,a._tr_flush_block=R,a._tr_tally=C,a._tr_align=Z},{"../utils/common":3}],15:[function(t,e,a){"use strict";function i(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}e.exports=i},{}],"/":[function(t,e,a){"use strict";var i=t("./lib/utils/common").assign,n=t("./lib/deflate"),r=t("./lib/inflate"),s=t("./lib/zlib/constants"),o={};i(o,n,r,s),e.exports=o},{"./lib/deflate":1,"./lib/inflate":2,"./lib/utils/common":3,"./lib/zlib/constants":6}]},{},[])("/")});

/*! Hammer.JS - v2.0.8 - 2016-04-23
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
!function(a,b,c,d){"use strict";function e(a,b,c){return setTimeout(j(a,c),b)}function f(a,b,c){return Array.isArray(a)?(g(a,c[b],c),!0):!1}function g(a,b,c){var e;if(a)if(a.forEach)a.forEach(b,c);else if(a.length!==d)for(e=0;e<a.length;)b.call(c,a[e],e,a),e++;else for(e in a)a.hasOwnProperty(e)&&b.call(c,a[e],e,a)}function h(b,c,d){var e="DEPRECATED METHOD: "+c+"\n"+d+" AT \n";return function(){var c=new Error("get-stack-trace"),d=c&&c.stack?c.stack.replace(/^[^\(]+?[\n$]/gm,"").replace(/^\s+at\s+/gm,"").replace(/^Object.<anonymous>\s*\(/gm,"{anonymous}()@"):"Unknown Stack Trace",f=a.console&&(a.console.warn||a.console.log);return f&&f.call(a.console,e,d),b.apply(this,arguments)}}function i(a,b,c){var d,e=b.prototype;d=a.prototype=Object.create(e),d.constructor=a,d._super=e,c&&la(d,c)}function j(a,b){return function(){return a.apply(b,arguments)}}function k(a,b){return typeof a==oa?a.apply(b?b[0]||d:d,b):a}function l(a,b){return a===d?b:a}function m(a,b,c){g(q(b),function(b){a.addEventListener(b,c,!1)})}function n(a,b,c){g(q(b),function(b){a.removeEventListener(b,c,!1)})}function o(a,b){for(;a;){if(a==b)return!0;a=a.parentNode}return!1}function p(a,b){return a.indexOf(b)>-1}function q(a){return a.trim().split(/\s+/g)}function r(a,b,c){if(a.indexOf&&!c)return a.indexOf(b);for(var d=0;d<a.length;){if(c&&a[d][c]==b||!c&&a[d]===b)return d;d++}return-1}function s(a){return Array.prototype.slice.call(a,0)}function t(a,b,c){for(var d=[],e=[],f=0;f<a.length;){var g=b?a[f][b]:a[f];r(e,g)<0&&d.push(a[f]),e[f]=g,f++}return c&&(d=b?d.sort(function(a,c){return a[b]>c[b]}):d.sort()),d}function u(a,b){for(var c,e,f=b[0].toUpperCase()+b.slice(1),g=0;g<ma.length;){if(c=ma[g],e=c?c+f:b,e in a)return e;g++}return d}function v(){return ua++}function w(b){var c=b.ownerDocument||b;return c.defaultView||c.parentWindow||a}function x(a,b){var c=this;this.manager=a,this.callback=b,this.element=a.element,this.target=a.options.inputTarget,this.domHandler=function(b){k(a.options.enable,[a])&&c.handler(b)},this.init()}function y(a){var b,c=a.options.inputClass;return new(b=c?c:xa?M:ya?P:wa?R:L)(a,z)}function z(a,b,c){var d=c.pointers.length,e=c.changedPointers.length,f=b&Ea&&d-e===0,g=b&(Ga|Ha)&&d-e===0;c.isFirst=!!f,c.isFinal=!!g,f&&(a.session={}),c.eventType=b,A(a,c),a.emit("hammer.input",c),a.recognize(c),a.session.prevInput=c}function A(a,b){var c=a.session,d=b.pointers,e=d.length;c.firstInput||(c.firstInput=D(b)),e>1&&!c.firstMultiple?c.firstMultiple=D(b):1===e&&(c.firstMultiple=!1);var f=c.firstInput,g=c.firstMultiple,h=g?g.center:f.center,i=b.center=E(d);b.timeStamp=ra(),b.deltaTime=b.timeStamp-f.timeStamp,b.angle=I(h,i),b.distance=H(h,i),B(c,b),b.offsetDirection=G(b.deltaX,b.deltaY);var j=F(b.deltaTime,b.deltaX,b.deltaY);b.overallVelocityX=j.x,b.overallVelocityY=j.y,b.overallVelocity=qa(j.x)>qa(j.y)?j.x:j.y,b.scale=g?K(g.pointers,d):1,b.rotation=g?J(g.pointers,d):0,b.maxPointers=c.prevInput?b.pointers.length>c.prevInput.maxPointers?b.pointers.length:c.prevInput.maxPointers:b.pointers.length,C(c,b);var k=a.element;o(b.srcEvent.target,k)&&(k=b.srcEvent.target),b.target=k}function B(a,b){var c=b.center,d=a.offsetDelta||{},e=a.prevDelta||{},f=a.prevInput||{};b.eventType!==Ea&&f.eventType!==Ga||(e=a.prevDelta={x:f.deltaX||0,y:f.deltaY||0},d=a.offsetDelta={x:c.x,y:c.y}),b.deltaX=e.x+(c.x-d.x),b.deltaY=e.y+(c.y-d.y)}function C(a,b){var c,e,f,g,h=a.lastInterval||b,i=b.timeStamp-h.timeStamp;if(b.eventType!=Ha&&(i>Da||h.velocity===d)){var j=b.deltaX-h.deltaX,k=b.deltaY-h.deltaY,l=F(i,j,k);e=l.x,f=l.y,c=qa(l.x)>qa(l.y)?l.x:l.y,g=G(j,k),a.lastInterval=b}else c=h.velocity,e=h.velocityX,f=h.velocityY,g=h.direction;b.velocity=c,b.velocityX=e,b.velocityY=f,b.direction=g}function D(a){for(var b=[],c=0;c<a.pointers.length;)b[c]={clientX:pa(a.pointers[c].clientX),clientY:pa(a.pointers[c].clientY)},c++;return{timeStamp:ra(),pointers:b,center:E(b),deltaX:a.deltaX,deltaY:a.deltaY}}function E(a){var b=a.length;if(1===b)return{x:pa(a[0].clientX),y:pa(a[0].clientY)};for(var c=0,d=0,e=0;b>e;)c+=a[e].clientX,d+=a[e].clientY,e++;return{x:pa(c/b),y:pa(d/b)}}function F(a,b,c){return{x:b/a||0,y:c/a||0}}function G(a,b){return a===b?Ia:qa(a)>=qa(b)?0>a?Ja:Ka:0>b?La:Ma}function H(a,b,c){c||(c=Qa);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return Math.sqrt(d*d+e*e)}function I(a,b,c){c||(c=Qa);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return 180*Math.atan2(e,d)/Math.PI}function J(a,b){return I(b[1],b[0],Ra)+I(a[1],a[0],Ra)}function K(a,b){return H(b[0],b[1],Ra)/H(a[0],a[1],Ra)}function L(){this.evEl=Ta,this.evWin=Ua,this.pressed=!1,x.apply(this,arguments)}function M(){this.evEl=Xa,this.evWin=Ya,x.apply(this,arguments),this.store=this.manager.session.pointerEvents=[]}function N(){this.evTarget=$a,this.evWin=_a,this.started=!1,x.apply(this,arguments)}function O(a,b){var c=s(a.touches),d=s(a.changedTouches);return b&(Ga|Ha)&&(c=t(c.concat(d),"identifier",!0)),[c,d]}function P(){this.evTarget=bb,this.targetIds={},x.apply(this,arguments)}function Q(a,b){var c=s(a.touches),d=this.targetIds;if(b&(Ea|Fa)&&1===c.length)return d[c[0].identifier]=!0,[c,c];var e,f,g=s(a.changedTouches),h=[],i=this.target;if(f=c.filter(function(a){return o(a.target,i)}),b===Ea)for(e=0;e<f.length;)d[f[e].identifier]=!0,e++;for(e=0;e<g.length;)d[g[e].identifier]&&h.push(g[e]),b&(Ga|Ha)&&delete d[g[e].identifier],e++;return h.length?[t(f.concat(h),"identifier",!0),h]:void 0}function R(){x.apply(this,arguments);var a=j(this.handler,this);this.touch=new P(this.manager,a),this.mouse=new L(this.manager,a),this.primaryTouch=null,this.lastTouches=[]}function S(a,b){a&Ea?(this.primaryTouch=b.changedPointers[0].identifier,T.call(this,b)):a&(Ga|Ha)&&T.call(this,b)}function T(a){var b=a.changedPointers[0];if(b.identifier===this.primaryTouch){var c={x:b.clientX,y:b.clientY};this.lastTouches.push(c);var d=this.lastTouches,e=function(){var a=d.indexOf(c);a>-1&&d.splice(a,1)};setTimeout(e,cb)}}function U(a){for(var b=a.srcEvent.clientX,c=a.srcEvent.clientY,d=0;d<this.lastTouches.length;d++){var e=this.lastTouches[d],f=Math.abs(b-e.x),g=Math.abs(c-e.y);if(db>=f&&db>=g)return!0}return!1}function V(a,b){this.manager=a,this.set(b)}function W(a){if(p(a,jb))return jb;var b=p(a,kb),c=p(a,lb);return b&&c?jb:b||c?b?kb:lb:p(a,ib)?ib:hb}function X(){if(!fb)return!1;var b={},c=a.CSS&&a.CSS.supports;return["auto","manipulation","pan-y","pan-x","pan-x pan-y","none"].forEach(function(d){b[d]=c?a.CSS.supports("touch-action",d):!0}),b}function Y(a){this.options=la({},this.defaults,a||{}),this.id=v(),this.manager=null,this.options.enable=l(this.options.enable,!0),this.state=nb,this.simultaneous={},this.requireFail=[]}function Z(a){return a&sb?"cancel":a&qb?"end":a&pb?"move":a&ob?"start":""}function $(a){return a==Ma?"down":a==La?"up":a==Ja?"left":a==Ka?"right":""}function _(a,b){var c=b.manager;return c?c.get(a):a}function aa(){Y.apply(this,arguments)}function ba(){aa.apply(this,arguments),this.pX=null,this.pY=null}function ca(){aa.apply(this,arguments)}function da(){Y.apply(this,arguments),this._timer=null,this._input=null}function ea(){aa.apply(this,arguments)}function fa(){aa.apply(this,arguments)}function ga(){Y.apply(this,arguments),this.pTime=!1,this.pCenter=!1,this._timer=null,this._input=null,this.count=0}function ha(a,b){return b=b||{},b.recognizers=l(b.recognizers,ha.defaults.preset),new ia(a,b)}function ia(a,b){this.options=la({},ha.defaults,b||{}),this.options.inputTarget=this.options.inputTarget||a,this.handlers={},this.session={},this.recognizers=[],this.oldCssProps={},this.element=a,this.input=y(this),this.touchAction=new V(this,this.options.touchAction),ja(this,!0),g(this.options.recognizers,function(a){var b=this.add(new a[0](a[1]));a[2]&&b.recognizeWith(a[2]),a[3]&&b.requireFailure(a[3])},this)}function ja(a,b){var c=a.element;if(c.style){var d;g(a.options.cssProps,function(e,f){d=u(c.style,f),b?(a.oldCssProps[d]=c.style[d],c.style[d]=e):c.style[d]=a.oldCssProps[d]||""}),b||(a.oldCssProps={})}}function ka(a,c){var d=b.createEvent("Event");d.initEvent(a,!0,!0),d.gesture=c,c.target.dispatchEvent(d)}var la,ma=["","webkit","Moz","MS","ms","o"],na=b.createElement("div"),oa="function",pa=Math.round,qa=Math.abs,ra=Date.now;la="function"!=typeof Object.assign?function(a){if(a===d||null===a)throw new TypeError("Cannot convert undefined or null to object");for(var b=Object(a),c=1;c<arguments.length;c++){var e=arguments[c];if(e!==d&&null!==e)for(var f in e)e.hasOwnProperty(f)&&(b[f]=e[f])}return b}:Object.assign;var sa=h(function(a,b,c){for(var e=Object.keys(b),f=0;f<e.length;)(!c||c&&a[e[f]]===d)&&(a[e[f]]=b[e[f]]),f++;return a},"extend","Use `assign`."),ta=h(function(a,b){return sa(a,b,!0)},"merge","Use `assign`."),ua=1,va=/mobile|tablet|ip(ad|hone|od)|android/i,wa="ontouchstart"in a,xa=u(a,"PointerEvent")!==d,ya=wa&&va.test(navigator.userAgent),za="touch",Aa="pen",Ba="mouse",Ca="kinect",Da=25,Ea=1,Fa=2,Ga=4,Ha=8,Ia=1,Ja=2,Ka=4,La=8,Ma=16,Na=Ja|Ka,Oa=La|Ma,Pa=Na|Oa,Qa=["x","y"],Ra=["clientX","clientY"];x.prototype={handler:function(){},init:function(){this.evEl&&m(this.element,this.evEl,this.domHandler),this.evTarget&&m(this.target,this.evTarget,this.domHandler),this.evWin&&m(w(this.element),this.evWin,this.domHandler)},destroy:function(){this.evEl&&n(this.element,this.evEl,this.domHandler),this.evTarget&&n(this.target,this.evTarget,this.domHandler),this.evWin&&n(w(this.element),this.evWin,this.domHandler)}};var Sa={mousedown:Ea,mousemove:Fa,mouseup:Ga},Ta="mousedown",Ua="mousemove mouseup";i(L,x,{handler:function(a){var b=Sa[a.type];b&Ea&&0===a.button&&(this.pressed=!0),b&Fa&&1!==a.which&&(b=Ga),this.pressed&&(b&Ga&&(this.pressed=!1),this.callback(this.manager,b,{pointers:[a],changedPointers:[a],pointerType:Ba,srcEvent:a}))}});var Va={pointerdown:Ea,pointermove:Fa,pointerup:Ga,pointercancel:Ha,pointerout:Ha},Wa={2:za,3:Aa,4:Ba,5:Ca},Xa="pointerdown",Ya="pointermove pointerup pointercancel";a.MSPointerEvent&&!a.PointerEvent&&(Xa="MSPointerDown",Ya="MSPointerMove MSPointerUp MSPointerCancel"),i(M,x,{handler:function(a){var b=this.store,c=!1,d=a.type.toLowerCase().replace("ms",""),e=Va[d],f=Wa[a.pointerType]||a.pointerType,g=f==za,h=r(b,a.pointerId,"pointerId");e&Ea&&(0===a.button||g)?0>h&&(b.push(a),h=b.length-1):e&(Ga|Ha)&&(c=!0),0>h||(b[h]=a,this.callback(this.manager,e,{pointers:b,changedPointers:[a],pointerType:f,srcEvent:a}),c&&b.splice(h,1))}});var Za={touchstart:Ea,touchmove:Fa,touchend:Ga,touchcancel:Ha},$a="touchstart",_a="touchstart touchmove touchend touchcancel";i(N,x,{handler:function(a){var b=Za[a.type];if(b===Ea&&(this.started=!0),this.started){var c=O.call(this,a,b);b&(Ga|Ha)&&c[0].length-c[1].length===0&&(this.started=!1),this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:za,srcEvent:a})}}});var ab={touchstart:Ea,touchmove:Fa,touchend:Ga,touchcancel:Ha},bb="touchstart touchmove touchend touchcancel";i(P,x,{handler:function(a){var b=ab[a.type],c=Q.call(this,a,b);c&&this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:za,srcEvent:a})}});var cb=2500,db=25;i(R,x,{handler:function(a,b,c){var d=c.pointerType==za,e=c.pointerType==Ba;if(!(e&&c.sourceCapabilities&&c.sourceCapabilities.firesTouchEvents)){if(d)S.call(this,b,c);else if(e&&U.call(this,c))return;this.callback(a,b,c)}},destroy:function(){this.touch.destroy(),this.mouse.destroy()}});var eb=u(na.style,"touchAction"),fb=eb!==d,gb="compute",hb="auto",ib="manipulation",jb="none",kb="pan-x",lb="pan-y",mb=X();V.prototype={set:function(a){a==gb&&(a=this.compute()),fb&&this.manager.element.style&&mb[a]&&(this.manager.element.style[eb]=a),this.actions=a.toLowerCase().trim()},update:function(){this.set(this.manager.options.touchAction)},compute:function(){var a=[];return g(this.manager.recognizers,function(b){k(b.options.enable,[b])&&(a=a.concat(b.getTouchAction()))}),W(a.join(" "))},preventDefaults:function(a){var b=a.srcEvent,c=a.offsetDirection;if(this.manager.session.prevented)return void b.preventDefault();var d=this.actions,e=p(d,jb)&&!mb[jb],f=p(d,lb)&&!mb[lb],g=p(d,kb)&&!mb[kb];if(e){var h=1===a.pointers.length,i=a.distance<2,j=a.deltaTime<250;if(h&&i&&j)return}return g&&f?void 0:e||f&&c&Na||g&&c&Oa?this.preventSrc(b):void 0},preventSrc:function(a){this.manager.session.prevented=!0,a.preventDefault()}};var nb=1,ob=2,pb=4,qb=8,rb=qb,sb=16,tb=32;Y.prototype={defaults:{},set:function(a){return la(this.options,a),this.manager&&this.manager.touchAction.update(),this},recognizeWith:function(a){if(f(a,"recognizeWith",this))return this;var b=this.simultaneous;return a=_(a,this),b[a.id]||(b[a.id]=a,a.recognizeWith(this)),this},dropRecognizeWith:function(a){return f(a,"dropRecognizeWith",this)?this:(a=_(a,this),delete this.simultaneous[a.id],this)},requireFailure:function(a){if(f(a,"requireFailure",this))return this;var b=this.requireFail;return a=_(a,this),-1===r(b,a)&&(b.push(a),a.requireFailure(this)),this},dropRequireFailure:function(a){if(f(a,"dropRequireFailure",this))return this;a=_(a,this);var b=r(this.requireFail,a);return b>-1&&this.requireFail.splice(b,1),this},hasRequireFailures:function(){return this.requireFail.length>0},canRecognizeWith:function(a){return!!this.simultaneous[a.id]},emit:function(a){function b(b){c.manager.emit(b,a)}var c=this,d=this.state;qb>d&&b(c.options.event+Z(d)),b(c.options.event),a.additionalEvent&&b(a.additionalEvent),d>=qb&&b(c.options.event+Z(d))},tryEmit:function(a){return this.canEmit()?this.emit(a):void(this.state=tb)},canEmit:function(){for(var a=0;a<this.requireFail.length;){if(!(this.requireFail[a].state&(tb|nb)))return!1;a++}return!0},recognize:function(a){var b=la({},a);return k(this.options.enable,[this,b])?(this.state&(rb|sb|tb)&&(this.state=nb),this.state=this.process(b),void(this.state&(ob|pb|qb|sb)&&this.tryEmit(b))):(this.reset(),void(this.state=tb))},process:function(a){},getTouchAction:function(){},reset:function(){}},i(aa,Y,{defaults:{pointers:1},attrTest:function(a){var b=this.options.pointers;return 0===b||a.pointers.length===b},process:function(a){var b=this.state,c=a.eventType,d=b&(ob|pb),e=this.attrTest(a);return d&&(c&Ha||!e)?b|sb:d||e?c&Ga?b|qb:b&ob?b|pb:ob:tb}}),i(ba,aa,{defaults:{event:"pan",threshold:10,pointers:1,direction:Pa},getTouchAction:function(){var a=this.options.direction,b=[];return a&Na&&b.push(lb),a&Oa&&b.push(kb),b},directionTest:function(a){var b=this.options,c=!0,d=a.distance,e=a.direction,f=a.deltaX,g=a.deltaY;return e&b.direction||(b.direction&Na?(e=0===f?Ia:0>f?Ja:Ka,c=f!=this.pX,d=Math.abs(a.deltaX)):(e=0===g?Ia:0>g?La:Ma,c=g!=this.pY,d=Math.abs(a.deltaY))),a.direction=e,c&&d>b.threshold&&e&b.direction},attrTest:function(a){return aa.prototype.attrTest.call(this,a)&&(this.state&ob||!(this.state&ob)&&this.directionTest(a))},emit:function(a){this.pX=a.deltaX,this.pY=a.deltaY;var b=$(a.direction);b&&(a.additionalEvent=this.options.event+b),this._super.emit.call(this,a)}}),i(ca,aa,{defaults:{event:"pinch",threshold:0,pointers:2},getTouchAction:function(){return[jb]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.scale-1)>this.options.threshold||this.state&ob)},emit:function(a){if(1!==a.scale){var b=a.scale<1?"in":"out";a.additionalEvent=this.options.event+b}this._super.emit.call(this,a)}}),i(da,Y,{defaults:{event:"press",pointers:1,time:251,threshold:9},getTouchAction:function(){return[hb]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime>b.time;if(this._input=a,!d||!c||a.eventType&(Ga|Ha)&&!f)this.reset();else if(a.eventType&Ea)this.reset(),this._timer=e(function(){this.state=rb,this.tryEmit()},b.time,this);else if(a.eventType&Ga)return rb;return tb},reset:function(){clearTimeout(this._timer)},emit:function(a){this.state===rb&&(a&&a.eventType&Ga?this.manager.emit(this.options.event+"up",a):(this._input.timeStamp=ra(),this.manager.emit(this.options.event,this._input)))}}),i(ea,aa,{defaults:{event:"rotate",threshold:0,pointers:2},getTouchAction:function(){return[jb]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.rotation)>this.options.threshold||this.state&ob)}}),i(fa,aa,{defaults:{event:"swipe",threshold:10,velocity:.3,direction:Na|Oa,pointers:1},getTouchAction:function(){return ba.prototype.getTouchAction.call(this)},attrTest:function(a){var b,c=this.options.direction;return c&(Na|Oa)?b=a.overallVelocity:c&Na?b=a.overallVelocityX:c&Oa&&(b=a.overallVelocityY),this._super.attrTest.call(this,a)&&c&a.offsetDirection&&a.distance>this.options.threshold&&a.maxPointers==this.options.pointers&&qa(b)>this.options.velocity&&a.eventType&Ga},emit:function(a){var b=$(a.offsetDirection);b&&this.manager.emit(this.options.event+b,a),this.manager.emit(this.options.event,a)}}),i(ga,Y,{defaults:{event:"tap",pointers:1,taps:1,interval:300,time:250,threshold:9,posThreshold:10},getTouchAction:function(){return[ib]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime<b.time;if(this.reset(),a.eventType&Ea&&0===this.count)return this.failTimeout();if(d&&f&&c){if(a.eventType!=Ga)return this.failTimeout();var g=this.pTime?a.timeStamp-this.pTime<b.interval:!0,h=!this.pCenter||H(this.pCenter,a.center)<b.posThreshold;this.pTime=a.timeStamp,this.pCenter=a.center,h&&g?this.count+=1:this.count=1,this._input=a;var i=this.count%b.taps;if(0===i)return this.hasRequireFailures()?(this._timer=e(function(){this.state=rb,this.tryEmit()},b.interval,this),ob):rb}return tb},failTimeout:function(){return this._timer=e(function(){this.state=tb},this.options.interval,this),tb},reset:function(){clearTimeout(this._timer)},emit:function(){this.state==rb&&(this._input.tapCount=this.count,this.manager.emit(this.options.event,this._input))}}),ha.VERSION="2.0.8",ha.defaults={domEvents:!1,touchAction:gb,enable:!0,inputTarget:null,inputClass:null,preset:[[ea,{enable:!1}],[ca,{enable:!1},["rotate"]],[fa,{direction:Na}],[ba,{direction:Na},["swipe"]],[ga],[ga,{event:"doubletap",taps:2},["tap"]],[da]],cssProps:{userSelect:"none",touchSelect:"none",touchCallout:"none",contentZooming:"none",userDrag:"none",tapHighlightColor:"rgba(0,0,0,0)"}};var ub=1,vb=2;ia.prototype={set:function(a){return la(this.options,a),a.touchAction&&this.touchAction.update(),a.inputTarget&&(this.input.destroy(),this.input.target=a.inputTarget,this.input.init()),this},stop:function(a){this.session.stopped=a?vb:ub},recognize:function(a){var b=this.session;if(!b.stopped){this.touchAction.preventDefaults(a);var c,d=this.recognizers,e=b.curRecognizer;(!e||e&&e.state&rb)&&(e=b.curRecognizer=null);for(var f=0;f<d.length;)c=d[f],b.stopped===vb||e&&c!=e&&!c.canRecognizeWith(e)?c.reset():c.recognize(a),!e&&c.state&(ob|pb|qb)&&(e=b.curRecognizer=c),f++}},get:function(a){if(a instanceof Y)return a;for(var b=this.recognizers,c=0;c<b.length;c++)if(b[c].options.event==a)return b[c];return null},add:function(a){if(f(a,"add",this))return this;var b=this.get(a.options.event);return b&&this.remove(b),this.recognizers.push(a),a.manager=this,this.touchAction.update(),a},remove:function(a){if(f(a,"remove",this))return this;if(a=this.get(a)){var b=this.recognizers,c=r(b,a);-1!==c&&(b.splice(c,1),this.touchAction.update())}return this},on:function(a,b){if(a!==d&&b!==d){var c=this.handlers;return g(q(a),function(a){c[a]=c[a]||[],c[a].push(b)}),this}},off:function(a,b){if(a!==d){var c=this.handlers;return g(q(a),function(a){b?c[a]&&c[a].splice(r(c[a],b),1):delete c[a]}),this}},emit:function(a,b){this.options.domEvents&&ka(a,b);var c=this.handlers[a]&&this.handlers[a].slice();if(c&&c.length){b.type=a,b.preventDefault=function(){b.srcEvent.preventDefault()};for(var d=0;d<c.length;)c[d](b),d++}},destroy:function(){this.element&&ja(this,!1),this.handlers={},this.session={},this.input.destroy(),this.element=null}},la(ha,{INPUT_START:Ea,INPUT_MOVE:Fa,INPUT_END:Ga,INPUT_CANCEL:Ha,STATE_POSSIBLE:nb,STATE_BEGAN:ob,STATE_CHANGED:pb,STATE_ENDED:qb,STATE_RECOGNIZED:rb,STATE_CANCELLED:sb,STATE_FAILED:tb,DIRECTION_NONE:Ia,DIRECTION_LEFT:Ja,DIRECTION_RIGHT:Ka,DIRECTION_UP:La,DIRECTION_DOWN:Ma,DIRECTION_HORIZONTAL:Na,DIRECTION_VERTICAL:Oa,DIRECTION_ALL:Pa,Manager:ia,Input:x,TouchAction:V,TouchInput:P,MouseInput:L,PointerEventInput:M,TouchMouseInput:R,SingleTouchInput:N,Recognizer:Y,AttrRecognizer:aa,Tap:ga,Pan:ba,Swipe:fa,Pinch:ca,Rotate:ea,Press:da,on:m,off:n,each:g,merge:ta,extend:sa,assign:la,inherit:i,bindFn:j,prefixed:u});var wb="undefined"!=typeof a?a:"undefined"!=typeof self?self:{};wb.Hammer=ha,"function"==typeof define&&define.amd?define(function(){return ha}):"undefined"!=typeof module&&module.exports?module.exports=ha:a[c]=ha}(window,document,"Hammer");
//# sourceMappingURL=hammer.min.js.map

/*!
 * Licensed Materials - Property of IBM
 * � Copyright IBM Corp. 2017
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 *
 * @version 5.3.0.1788
 * @flags w3c,NDEBUG
 */
if(window.TLT){throw"Attempting to recreate TLT. Library may be included more than once on the page."}window.TLT=(function(){function r(F,x,y,G){var D=null,H=null,C=TLT.getService("queue"),A=TLT.getModule("replay"),E=TLT.getModule("TLCookie"),z=null,B=TLT.utils.getOriginAndPath();if(!x||typeof x!=="string"){return}if(!y||typeof y!=="string"){y=""}H={type:2,screenview:{type:F,name:x,url:B.path,host:B.origin,referrer:y}};if(F==="LOAD"){z={type:"screenview_load",name:x}}else{if(F==="UNLOAD"){z={type:"screenview_unload",name:x}}}if(z&&A){D=A.onevent(z)}if(D){H.dcid=D}if(F==="LOAD"||F==="UNLOAD"){C.post("",H,"DEFAULT")}if(z&&E){E.onevent(z)}}function s(y){var z,x=TLT.getService("queue");if(!y||!y.coords){return}z={type:13,geolocation:{lat:y.coords.latitude,"long":y.coords.longitude,accuracy:Math.ceil(y.coords.accuracy)}};x.post("",z,"DEFAULT")}function m(){var y,x=TLT.getService("queue");y={type:13,geolocation:{errorCode:201,error:"Permission denied."}};x.post("",y,"DEFAULT")}var v=(new Date()).getTime(),q,w={},b={},e=false,g=null,o=(function(){var y,A=[];function z(F){var E=u.getService("browser"),B=u.getCoreConfig().framesBlacklist,D,C;y=y||[];F=F||null;if(typeof B!=="undefined"&&B.length>0){for(C=0;C<B.length;C+=1){D=E.queryAll(B[C],F);if(D&&D.length>0){y=y.concat(D)}}A=A.concat(E.queryAll("iframe",F))}}function x(B){if(u.utils.indexOf(A,B)<0){z(B.ownerDocument)}return u.utils.indexOf(y,B)>-1}x.clearCache=function(){y=null};return x}()),p=null,h={config:["getConfig","updateConfig","getCoreConfig","updateCoreConfig","getModuleConfig","updateModuleConfig","getServiceConfig","updateServiceConfig"],queue:["post","setAutoFlush","flushAll"],browserBase:["getXPathFromNode","processDOMEvent"]},t=(function(){var x={};return{normalizeModuleEvents:function(C,A,F,z){var y=x[C],E=false,B=false,D=u.getService("browser");F=F||u._getLocalTop();z=z||F.document;if(y){return}x[C]={loadFired:false,pageHideFired:false};u.utils.forEach(A,function(G){switch(G.name){case"load":E=true;A.push(u.utils.mixin(u.utils.mixin({},G),{name:"pageshow"}));break;case"unload":B=true;A.push(u.utils.mixin(u.utils.mixin({},G),{name:"pagehide"}));A.push(u.utils.mixin(u.utils.mixin({},G),{name:"beforeunload"}));break;case"change":if(u.utils.isLegacyIE&&u.getFlavor()==="w3c"){A.push(u.utils.mixin(u.utils.mixin({},G),{name:"propertychange"}))}break}});if(!E&&!B){delete x[C];return}x[C].silentLoad=!E;x[C].silentUnload=!B;if(!E){A.push({name:"load",target:F})}if(!B){A.push({name:"unload",target:F})}},canPublish:function(y,A){var z;if(x.hasOwnProperty(y)===false){return true}z=x[y];switch(A.type){case"load":z.pageHideFired=false;z.loadFired=true;return !z.silentLoad;case"pageshow":z.pageHideFired=false;A.type="load";return !z.loadFired&&!z.silentLoad;case"pagehide":A.type="unload";z.loadFired=false;z.pageHideFired=true;return !z.silentUnload;case"unload":case"beforeunload":A.type="unload";z.loadFired=false;return !z.pageHideFired&&!z.silentUnload}return true},isUnload:function(y){return typeof y==="object"?(y.type==="unload"||y.type==="beforeunload"||y.type==="pagehide"):false}}}()),c={},a={},j=function(){},l=null,k=true,d=function(){},i=false,n=(function(){var x=window.location,z=x.pathname,y=x.hash,A="";return function(){var D=x.pathname,B=x.hash,C=A;if(D!==z){C=D+B}else{if(B!==y){C=B}}if(C!==A){if(A){r("UNLOAD",A)}r("LOAD",C);A=C;z=D;y=B}}}()),f=function(A,H){var B,z,C,G=false,x=u.getService("browser"),y=u.getCoreConfig().blockedElements,E,F,D;if(!y||!y.length){f=function(){return false};return G}if(!A||!A.nodeType){return G}H=H||u.utils.getDocument(A);for(B=0,C=y.length;B<C&&!G;B+=1){F=x.queryAll(y[B],H);for(z=0,D=F.length;z<D&&!G;z+=1){E=F[z];G=E.contains?E.contains(A):E===A}}return G},u={getStartTime:function(){return v},getPageId:function(){return q||"#"},getLibraryVersion:function(){return"5.3.0.1788"},init:function(y,z){var x;l=z;if(!k){throw"init must only be called once!"}q="P."+this.utils.getRandomString(28);k=false;x=function(A){A=A||window.event||{};if(document.addEventListener||A.type==="load"||document.readyState==="complete"){if(document.removeEventListener){document.removeEventListener("DOMContentLoaded",x,false);window.removeEventListener("load",x,false)}else{document.detachEvent("onreadystatechange",x);window.detachEvent("onload",x)}j(y,z)}};if(document.readyState==="complete"){setTimeout(x)}else{if(document.addEventListener){document.addEventListener("DOMContentLoaded",x,false);window.addEventListener("load",x,false)}else{document.attachEvent("onreadystatechange",x);window.attachEvent("onload",x)}}},isInitialized:function(){return e},getState:function(){return g},destroy:function(y){var x="",A="",D=null,E=null,B=null,z=null,F=false;if(k){return false}this.stopAll();if(!y){z=this.getService("browser");for(x in c){if(c.hasOwnProperty(x)&&z!==null){A=x.split("|")[0];D=c[x].target;F=c[x].delegateTarget||undefined;z.unsubscribe(A,D,this._publishEvent,F)}}}for(E in b){if(b.hasOwnProperty(E)){B=b[E].instance;if(B&&typeof B.destroy==="function"){B.destroy()}b[E].instance=null}}o.clearCache();c={};e=false;k=true;g="destroyed";if(typeof l==="function"){try{l("destroyed")}catch(C){}}},_updateModules:function(A){var z=this.getCoreConfig(),y=this.getService("browser"),C=null,x=null;if(z&&y&&z.modules){try{for(x in z.modules){if(z.modules.hasOwnProperty(x)){C=z.modules[x];if(w.hasOwnProperty(x)){if(C.enabled===false){this.stop(x);continue}this.start(x);if(C.events){this._registerModuleEvents(x,C.events,A)}}}}this._registerModuleEvents.clearCache()}catch(B){u.destroy();return false}}else{return false}return true},rebind:function(x){u._updateModules(x)},getSessionData:function(){if(!u.isInitialized()){return}var B=null,y=null,z,A,x=u.getCoreConfig();if(!x||!x.sessionDataEnabled){return null}y=x.sessionData||{};z=y.sessionQueryName;if(z){A=u.utils.getQueryStringValue(z,y.sessionQueryDelim)}else{z=y.sessionCookieName||"TLTSID";A=u.utils.getCookieValue(z)}if(z&&A){B=B||{};B.tltSCN=z;B.tltSCV=A;B.tltSCVNeedsHashing=!!y.sessionValueNeedsHashing}return B},logGeolocation:function(x){var B=u.getModuleConfig("replay")||{},A=u.utils.getValue(B,"geolocation.options",{timeout:30000,enableHighAccuracy:true,maximumAge:0}),z=u.utils.getValue(B,"geolocation.enabled",false),y=window.navigator;if(!x){if(!z||!y||!y.geolocation||!y.geolocation.getCurrentPosition){return}y.geolocation.getCurrentPosition(s,m,A)}else{s(x)}},logCustomEvent:function(A,y){if(!u.isInitialized()){return}var z=null,x=this.getService("queue");if(!A||typeof A!=="string"){A="CUSTOM"}y=y||{};z={type:5,customEvent:{name:A,data:y}};x.post("",z,"DEFAULT")},logExceptionEvent:function(B,z,y){if(!u.isInitialized()){return}var A=null,x=this.getService("queue");if(!B||typeof B!=="string"){return}z=z||"";y=y||"";A={type:6,exception:{description:B,url:z,line:y}};x.post("",A)},logFormCompletion:function(y,A){if(!u.isInitialized()){return}var x=this.getService("queue"),z={type:15,formCompletion:{submitted:!!y,valid:(typeof A==="boolean"?A:null)}};x.post("",z)},logScreenviewLoad:function(z,y,x){if(!u.isInitialized()){return}r("LOAD",z,y,x)},logScreenviewUnload:function(x){if(!u.isInitialized()){return}r("UNLOAD",x)},logDOMCapture:function(z,C){var D=null,B,y,A,E,x;if(!this.isInitialized()){return D}if(u.utils.isLegacyIE){return D}y=this.getService("domCapture");if(y){z=z||window.document;A=this.getServiceConfig("domCapture");C=this.utils.mixin({},A.options,C);B=y.captureDOM(z,C);if(B){D=C.dcid||("dcid-"+this.utils.getSerialNumber()+"."+(new Date()).getTime());B.dcid=D;B.eventOn=!!C.eventOn;E={type:12,domCapture:B};x=this.getService("queue");x.post("",E,"DEFAULT");if(C.qffd!==false&&!i&&E.domCapture.fullDOM){x.flush();i=true}}else{D=null}}return D},performDOMCapture:function(z,x,y){return this.logDOMCapture(x,y)},performFormCompletion:function(y,x,z){return this.logFormCompletion(x,z)},_bridgeCallback:function(y){var x=a[y];if(x&&x.enabled){return x}return null},logScreenCapture:function(){if(!u.isInitialized()){return}var x=u._bridgeCallback("screenCapture");if(x!==null){x.cbFunction()}},enableTealeafFramework:function(){if(!u.isInitialized()){return}var x=u._bridgeCallback("enableTealeafFramework");if(x!==null){x.cbFunction()}},disableTealeafFramework:function(){if(!u.isInitialized()){return}var x=u._bridgeCallback("disableTealeafFramework");if(x!==null){x.cbFunction()}},startNewTLFSession:function(){if(!u.isInitialized()){return}var x=u._bridgeCallback("startNewTLFSession");if(x!==null){x.cbFunction()}},currentSessionId:function(){if(!u.isInitialized()){return}var y,x=u._bridgeCallback("currentSessionId");if(x!==null){y=x.cbFunction()}return y},defaultValueForConfigurableItem:function(x){if(!u.isInitialized()){return}var z,y=u._bridgeCallback("defaultValueForConfigurableItem");if(y!==null){z=y.cbFunction(x)}return z},valueForConfigurableItem:function(x){if(!u.isInitialized()){return}var z,y=u._bridgeCallback("valueForConfigurableItem");if(y!==null){z=y.cbFunction(x)}return z},setConfigurableItem:function(y,A){if(!u.isInitialized()){return}var x=false,z=u._bridgeCallback("setConfigurableItem");if(z!==null){x=z.cbFunction(y,A)}return x},addAdditionalHttpHeader:function(y,A){if(!u.isInitialized()){return}var x=false,z=u._bridgeCallback("addAdditionalHttpHeader");if(z!==null){x=z.cbFunction(y,A)}return x},logCustomEventBridge:function(z,A,y){if(!u.isInitialized()){return}var x=false,B=u._bridgeCallback("logCustomEventBridge");if(B!==null){x=B.cbFunction(z,A,y)}return x},registerBridgeCallbacks:function(E){var B,z,C,y=null,A,G,x,F=this.utils;if(!E){return false}if(E.length===0){a={};return false}try{for(B=0,C=E.length;B<C;B+=1){y=E[B];if(typeof y==="object"&&y.cbType&&y.cbFunction){A={enabled:y.enabled,cbFunction:y.cbFunction,cbOrder:y.order||0};if(F.isUndefOrNull(a[y.cbType])){a[y.cbType]=A}else{if(!F.isArray(a[y.cbType])){a[y.cbType]=[a[y.cbType]]}G=a[y.cbType];for(z=0,x=G.length;z<x;z+=1){if(G[z].cbOrder>A.cbOrder){break}}G.splice(z,0,A)}}}}catch(D){return false}return true},redirectQueue:function(D){var C,B,E,z,G,x,y,F=this.utils,A;if(!D||!D.length){return D}z=a.messageRedirect;if(!z){return D}if(!F.isArray(z)){G=[z]}else{G=z}A=u.getService("serializer");for(B=0,x=G.length;B<x;B+=1){z=G[B];if(z&&z.enabled){for(C=0,E=D.length;C<E;C+=1){y=z.cbFunction(A.serialize(D[C]),D[C]);if(y&&typeof y==="object"){D[C]=y}else{D.splice(C,1);C-=1;E=D.length}}}}return D},_hasSameOrigin:function(x){try{return x.document.location.host===document.location.host&&x.document.location.protocol===document.location.protocol}catch(y){}return false},provideRequestHeaders:function(){var y=null,x=a.addRequestHeaders;if(x&&x.enabled){y=x.cbFunction()}return y},_registerModuleEvents:(function(){var z,B=0,A=function(F,E,D){if(F==="window"){return E}if(F==="document"){return D}return F};function C(D,K,N){var M=u.getService("browserBase"),H=u.getService("browser"),L=u.utils.getDocument(N),F=u._getLocalTop(),E=u.utils.isIFrameDescendant(N),J,I,G;N=N||L;t.normalizeModuleEvents(D,K,F,L);if(E){J=M.ElementData.prototype.examineID(N).id;if(typeof J==="string"){J=J.slice(0,J.length-1);for(I in c){if(c.hasOwnProperty(I)){for(G=0;G<c[I].length;G+=1){if(D===c[I][G]){if(I.indexOf(J)!==-1){delete c[I];break}}}}}}}u.utils.forEach(K,function(O){var R=A(O.target,F,L)||L,Q=A(O.delegateTarget,F,L),P="";if(O.recurseFrames!==true&&E){return}if(typeof R==="string"){if(O.delegateTarget&&u.getFlavor()==="jQuery"){P=u._buildToken4delegateTarget(O.name,R,O.delegateTarget);if(!c.hasOwnProperty(P)){c[P]=[D];c[P].target=R;c[P].delegateTarget=Q;H.subscribe(O.name,R,u._publishEvent,Q,P)}else{c[P].push(D)}}else{u.utils.forEach(H.queryAll(R,N),function(S){var T=z.get(S);if(!T){T=M.ElementData.prototype.examineID(S);z.set(S,T)}P=O.name+"|"+T.id+T.idType;if(u.utils.indexOf(c[P],D)!==-1){return}c[P]=c[P]||[];c[P].push(D);c[P].target=S;H.subscribe(O.name,S,u._publishEvent)})}}else{P=u._buildToken4bubbleTarget(O.name,R,typeof O.target==="undefined");if(!c.hasOwnProperty(P)){c[P]=[D];H.subscribe(O.name,R,u._publishEvent)}else{if(u.utils.indexOf(c[P],D)===-1){c[P].push(D)}}}if(P!==""){if(typeof R!=="string"){c[P].target=R}}})}function y(D){var E=u.utils.getIFrameWindow(D);return(E!==null)&&u._hasSameOrigin(E)&&(E.document!==null)&&E.document.readyState==="complete"}function x(E,K,M){M=M||u._getLocalTop().document;z=z||new u.utils.WeakMap();C(E,K,M);if(E!=="performance"){var I=null,D=null,F=u.getService("browser"),L=u.getService("domCapture"),J=F.queryAll("iframe, frame",M),H,G;for(H=0,G=J.length;H<G;H+=1){I=J[H];if(o(I)){continue}if(y(I)){D=u.utils.getIFrameWindow(I);u._registerModuleEvents(E,K,D.document);L.observeWindow(D);continue}B+=1;(function(P,N,Q){var O=null,R={moduleName:P,moduleEvents:N,hIFrame:Q,_registerModuleEventsDelayed:function(){var S=null;if(!o(Q)){S=u.utils.getIFrameWindow(Q);if(u._hasSameOrigin(S)){u._registerModuleEvents(P,N,S.document);L.observeWindow(S)}}B-=1;if(!B){u._publishEvent({type:"loadWithFrames",custom:true})}}};u.utils.addEventListener(Q,"load",function(){R._registerModuleEventsDelayed()});if(u.utils.isLegacyIE&&y(Q)){O=u.utils.getIFrameWindow(Q);u.utils.addEventListener(O.document,"readystatechange",function(){R._registerModuleEventsDelayed()})}}(E,K,I))}}}x.clearCache=function(){if(z){z.clear();z=null}};return x}()),_buildToken4currentTarget:function(y){var z=y.nativeEvent?y.nativeEvent.currentTarget:null,x=z?this.getService("browserBase").ElementData.prototype.examineID(z):{id:y.target?y.target.id:null,idType:y.target?y.target.idType:-1};return y.type+"|"+x.id+x.idType},_buildToken4delegateTarget:function(x,z,y){return x+"|"+z+"|"+y},_buildToken4bubbleTarget:function(y,F,E,J){var C=u._getLocalTop(),x,z=u.getService("browser"),K=function(L){var M=null;if(u._hasSameOrigin(x.parent)){u.utils.forEach(z.queryAll("iframe, frame",x.parent.document),function(N){var O=null;if(!o(N)){O=u.utils.getIFrameWindow(N);if(u._hasSameOrigin(O)&&O.document===L){M=N}}})}return M},G=u.utils.getDocument(F),I=this.getService("browserBase"),H=null,B,A=y,D;if(G){x=G.defaultView||G.parentWindow}if(F===window||F===window.window){A+="|null-2|window"}else{if(E&&x&&u._hasSameOrigin(x.parent)&&typeof G!=="undefined"&&C.document!==G){H=K(G);if(H){B=I.ElementData.prototype.examineID(H);A+="|"+B.xPath+"-2"}}else{if(J&&J!==document&&u.getFlavor()==="jQuery"){A+="|null-2|"+u.utils.getTagName(F)+"|"+u.utils.getTagName(J)}else{A+="|null-2|document"}}}return A},_reinitConfig:function(){u._updateModules()},_publishEvent:function(x){var y=null,B=null,D=(x.delegateTarget&&x.data)?x.data:u._buildToken4currentTarget(x),E=null,F,G,H,A=null,I=false,J=false,C=u.getCoreConfig(),z=u.getService("browser"),L=x.delegateTarget||null,K;if(x.type.match(/^(click|change|blur|mouse|touch)/)){d()}K=u.utils.getValue(C,"screenviewAutoDetect",true);if(K){n()}if((x.type==="load"||x.type==="pageshow")&&!x.nativeEvent.customLoad){return}if(u.utils.isIE){if(x.type==="click"){p=x.target.element}if(x.type==="beforeunload"){I=false;u.utils.forEach(C.ieExcludedLinks,function(N){var O,M,P=z.queryAll(N);for(O=0,M=P?P.length:0;O<M;O+=1){if(typeof P[O]!==undefined&&P[O]===p){I=true;return}}});if(I){return}}}if(t.isUnload(x)){g="unloading"}if(x.type==="change"&&u.utils.isLegacyIE&&u.getFlavor()==="w3c"&&(x.target.element.type==="checkbox"||x.target.element.type==="radio")){return}if(x.type==="propertychange"){if(x.nativeEvent.propertyName==="checked"&&(x.target.element.type==="checkbox"||(x.target.element.type==="radio"&&x.target.element.checked))){x.type="change";x.target.type="INPUT"}else{return}}if(x.target&&f(x.target.element)){return}if(!c.hasOwnProperty(D)){if(x.hasOwnProperty("nativeEvent")){H=x.nativeEvent.currentTarget||x.nativeEvent.target}D=u._buildToken4bubbleTarget(x.type,H,true,L)}if(c.hasOwnProperty(D)){E=c[D];for(F=0,G=E.length;F<G;F+=1){y=E[F];B=u.getModule(y);A=u.utils.mixin({},x);if(B&&u.isStarted(y)&&typeof B.onevent==="function"){J=t.canPublish(y,A);if(J){B.onevent(A)}}}}if(A&&A.type==="unload"&&J){u.destroy()}},_getLocalTop:function(){return window.window},addModule:function(x,y){w[x]={creator:y,instance:null,context:null,messages:[]};if(this.isInitialized()){this.start(x)}},getModule:function(x){if(w[x]&&w[x].instance){return w[x].instance}return null},removeModule:function(x){this.stop(x);delete w[x]},isStarted:function(x){return w.hasOwnProperty(x)&&w[x].instance!==null},start:function(y){var z=w[y],x=null;if(z&&z.instance===null){z.context=new TLT.ModuleContext(y,this);x=z.instance=z.creator(z.context);if(typeof x.init==="function"){x.init()}}},startAll:function(){var x=null;for(x in w){if(w.hasOwnProperty(x)){this.start(x)}}},stop:function(y){var z=w[y],x=null;if(z&&z.instance!==null){x=z.instance;if(typeof x.destroy==="function"){x.destroy()}z.instance=z.context=null}},stopAll:function(){var x=null;for(x in w){if(w.hasOwnProperty(x)){this.stop(x)}}},addService:function(y,x){b[y]={creator:x,instance:null}},getService:function(x){if(b.hasOwnProperty(x)){if(!b[x].instance){try{b[x].instance=b[x].creator(this);if(typeof b[x].instance.init==="function"){b[x].instance.init()}}catch(y){return null}if(typeof b[x].instance.getServiceName!=="function"){b[x].instance.getServiceName=function(){return x}}}return b[x].instance}return null},removeService:function(x){delete b[x]},broadcast:function(A){var z=0,x=0,B=null,y=null;if(A&&typeof A==="object"){for(B in w){if(w.hasOwnProperty(B)){y=w[B];if(u.utils.indexOf(y.messages,A.type)>-1){if(typeof y.instance.onmessage==="function"){y.instance.onmessage(A)}}}}}},listen:function(x,z){var y=null;if(this.isStarted(x)){y=w[x];if(u.utils.indexOf(y.messages,z)===-1){y.messages.push(z)}}},fail:function(z,y,x){z="UIC FAILED. "+z;try{u.destroy(!!x)}finally{u.utils.clog(z);throw new u.UICError(z,y)}},UICError:(function(){function x(y,z){this.message=y;this.code=z}x.prototype=new Error();x.prototype.name="UICError";x.prototype.constructor=x;return x}()),getFlavor:function(){return"w3c"}};d=function(){var z=u.getCoreConfig(),A=null,y=u.utils.getValue(z,"inactivityTimeout",600000);if(!y){d=function(){};return}function x(){u.utils.clog("UIC self-terminated due to inactivity timeout.");u.destroy()}d=function(){if(A){clearTimeout(A);A=null}A=setTimeout(x,y)};d()};j=function(A,M){var F,x,D,N,y,C,J,K,H,B,L,z,E,G;if(e){u.utils.clog("TLT.init() called more than once. Ignoring.");return}if(TLT&&TLT.replay){return}F=u.getService("config");F.updateConfig(A);C=F.getModuleConfig("TLCookie")||{};B=C.sessionizationCookieName||"TLTSID";L=u.utils.getCookieValue(B);if(L==="DND"){if(g!=="destroyed"){u.destroy()}return}if(!u._updateModules()){if(g!=="destroyed"){u.destroy()}return}if(F.subscribe){F.subscribe("configupdated",u._reinitConfig)}e=true;g="loaded";x={type:"load",target:window.window,srcElement:window.window,currentTarget:window.window,bubbles:true,cancelBubble:false,cancelable:true,timeStamp:+new Date(),customLoad:true};N=u.getService("browserBase");D=new N.WebEvent(x);u._publishEvent(D);K=u.getService("ajax");J=u.getServiceConfig("queue");H=J.queues||[];for(G=0;G<H.length;G+=1){if(!L&&C.tlAppKey){z=H[G].endpoint;E=H[G].killswitchURL||(z.match("collectorPost")?z.replace("collectorPost","switch/"+C.tlAppKey):null);if(E){K.sendRequest({type:"GET",url:E,async:true,timeout:5000,oncomplete:function(O){if(O.responseText==="0"){u.setAutoFlush(false);u.utils.setCookie(B,"DND");u.destroy()}}})}}if(H[G].checkEndpoint){K.sendRequest({oncomplete:function(O){},timeout:H[G].endpointCheckTimeout||3000,url:H[G].endpoint,headers:{"X-PageId":q,"X-Tealeaf-SaaS-AppKey":C.tlAppKey,"X-Tealeaf-EndpointCheck":true},async:true,error:function(O){if(O.success){return}u.setAutoFlush(false);u.destroy()}})}}if(typeof l==="function"){try{l("initialized")}catch(I){}}};(function(){var y=null,z,x;for(y in h){if(h.hasOwnProperty(y)){for(z=0,x=h[y].length;z<x;z+=1){(function(B,A){u[A]=function(){var C=this.getService(B);if(C){return C[A].apply(C,arguments)}}}(y,h[y][z]))}}}}());return u}());(function(){var a=window.navigator.userAgent.toLowerCase(),i=(a.indexOf("msie")!==-1||a.indexOf("trident")!==-1),b=(function(){var j=!!window.performance;return(i&&(!j||document.documentMode<9))}()),e=(a.indexOf("android")!==-1),f=/(ipad|iphone|ipod)/.test(a),c=(a.indexOf("opera mini")!==-1),h=1,d={"a:":"link","button:button":"button","button:submit":"button","input:button":"button","input:checkbox":"checkBox","input:color":"colorPicker","input:date":"datePicker","input:datetime":"datetimePicker","input:datetime-local":"datetime-local","input:email":"emailInput","input:file":"fileInput","input:image":"button","input:month":"month","input:number":"numberPicker","input:password":"textBox","input:radio":"radioButton","input:range":"slider","input:reset":"button","input:search":"searchBox","input:submit":"button","input:tel":"tel","input:text":"textBox","input:time":"timePicker","input:url":"urlBox","input:week":"week","select:":"selectList","select:select-one":"selectList","textarea:":"textBox","textarea:textarea":"textBox"},g={isIE:i,isLegacyIE:b,isAndroid:e,isLandscapeZeroDegrees:false,isiOS:f,isOperaMini:c,isUndefOrNull:function(j){return typeof j==="undefined"||j===null},isArray:function(j){return !!(j&&Object.prototype.toString.call(j)==="[object Array]")},getSerialNumber:function(){var j;j=h;h+=1;return j},getRandomString:function(o,n){var m,l,j="ABCDEFGHJKLMNPQRSTUVWXYZ23456789",k="";if(!o){return k}if(typeof n!=="string"){n=j}for(m=0,l=n.length;m<o;m+=1){k+=n.charAt(Math.floor(Math.random()*l))}return k},getValue:function(o,n,k){var m,j,l;k=typeof k==="undefined"?null:k;if(!o||typeof o!=="object"||typeof n!=="string"){return k}l=n.split(".");for(m=0,j=l.length;m<j;m+=1){if(this.isUndefOrNull(o)||typeof o[l[m]]==="undefined"){return k}o=o[l[m]]}return o},indexOf:function(m,l){var k,j;if(m&&m.indexOf){return m.indexOf(l)}if(m&&m instanceof Array){for(k=0,j=m.length;k<j;k+=1){if(m[k]===l){return k}}}return -1},forEach:function(n,m,l){var k,j;if(!n||!n.length||!m||!m.call){return}for(k=0,j=n.length;k<j;k+=1){m.call(l,n[k],k,n)}},some:function(n,m){var k,j,l=false;for(k=0,j=n.length;k<j;k+=1){l=m(n[k],k,n);if(l){return l}}return l},convertToArray:function(l){var m=0,k=l.length,j=[];while(m<k){j.push(l[m]);m+=1}return j},mixin:function(n){var m,l,k,j;for(k=1,j=arguments.length;k<j;k+=1){l=arguments[k];for(m in l){if(Object.prototype.hasOwnProperty.call(l,m)){n[m]=l[m]}}}return n},extend:function(j,k,l){var m="";for(m in l){if(Object.prototype.hasOwnProperty.call(l,m)){if(j&&Object.prototype.toString.call(l[m])==="[object Object]"){if(typeof k[m]==="undefined"){k[m]={}}g.extend(j,k[m],l[m])}else{k[m]=l[m]}}}return k},clone:function(k){var l,j;if(null===k||"object"!==typeof k){return k}if(k instanceof Object){l=(Object.prototype.toString.call(k)==="[object Array]")?[]:{};for(j in k){if(Object.prototype.hasOwnProperty.call(k,j)){l[j]=g.clone(k[j])}}return l}},parseVersion:function(l){var m,j,k=[];if(!l||!l.length){return k}k=l.split(".");for(m=0,j=k.length;m<j;m+=1){k[m]=/^[0-9]+$/.test(k[m])?parseInt(k[m],10):k[m]}return k},isEqual:function(l,k){var m,j;if(l===k){return true}if(typeof l!==typeof k){return false}if(l instanceof Object){if(Object.prototype.toString.call(l)==="[object Array]"){if(l.length!==k.length){return false}for(m=0,j=l.length;m<j;m+=1){if(!this.isEqual(l[m],k[m])){return false}}return true}}return false},createObject:(function(){var j=null,k=null;if(typeof Object.create==="function"){j=Object.create}else{k=function(){};j=function(l){if(typeof l!=="object"&&typeof l!=="function"){throw new TypeError("Object prototype need to be an object!")}k.prototype=l;return new k()}}return j}()),access:function(o,m){var n=m||window,k,l,j;if(typeof o!=="string"||(typeof n!=="object"&&n!==null)){return}k=o.split(".");for(l=0,j=k.length;l<j;l+=1){if(l===0&&k[l]==="window"){continue}if(!Object.prototype.hasOwnProperty.call(n,k[l])){return}n=n[k[l]];if(l<(j-1)&&!(n instanceof Object)){return}}return n},isNumeric:function(j){var k=false;if(g.isUndefOrNull(j)||j===""){return k}k=!isNaN(j*2);return k},isUpperCase:function(j){return j===j.toUpperCase()&&j!==j.toLowerCase()},isLowerCase:function(j){return j===j.toLowerCase()&&j!==j.toUpperCase()},getDocument:function(j){if(j&&j.nodeType!==9){return(!g.isUndefOrNull(j.ownerDocument))?(j.ownerDocument):(j.document)}return j},getWindow:function(k){try{if(k.self!==k){var j=g.getDocument(k);return(!g.isUndefOrNull(j.defaultView))?(j.defaultView):(j.parentWindow)}}catch(l){k=null}return k},getOriginAndPath:function(j){var k={};j=j||window.location;if(j.origin){k.origin=j.origin}else{k.origin=(j.protocol||"")+"//"+(j.host||"")}k.path=(j.pathname||"").split(";",1)[0];if(k.origin.indexOf("file://")>-1){k.path=k.path.replace(/(.*?)(?=\/[^.\/]*\.app)/g,"").replace(".app//",".app/")}return k},getIFrameWindow:function(l){var j=null;if(!l){return j}try{j=l.contentWindow||(l.contentDocument?l.contentDocument.parentWindow:null)}catch(k){}return j},getTagName:function(k){var j="";if(g.isUndefOrNull(k)){return j}if(k===document||k.nodeType===9){j="document"}else{if(k===window||k===window.window){j="window"}else{if(typeof k==="string"){j=k.toLowerCase()}else{if(k.tagName){j=k.tagName.toLowerCase()}else{if(k.nodeName){j=k.nodeName.toLowerCase()}else{j=""}}}}}return j},getTlType:function(l){var j,k,m="";if(g.isUndefOrNull(l)||!l.type){return m}j=l.type.toLowerCase();k=j+":";if(l.subType){k+=l.subType.toLowerCase()}m=d[k]||j;return m},isIFrameDescendant:function(k){var j=g.getWindow(k);return(j?(j!=TLT._getLocalTop()):false)},getOrientationMode:function(j){var k="INVALID";if(typeof j!=="number"){return k}switch(j){case 0:case 180:case 360:k="PORTRAIT";break;case 90:case -90:case 270:k="LANDSCAPE";break;default:k="UNKNOWN";break}return k},clog:(function(j){return function(){}}(window)),trim:function(j){if(!j||!j.toString){return j}return j.toString().replace(/^\s+|\s+$/g,"")},ltrim:function(j){if(!j||!j.toString){return j}return j.toString().replace(/^\s+/,"")},rtrim:function(j){if(!j||!j.toString){return j}return j.toString().replace(/\s+$/,"")},setCookie:function(r,j,q,t,m){var o,p,n,l,k="",s;if(!r){return}r=encodeURIComponent(r);j=encodeURIComponent(j);n=(m||location.hostname).split(".");s=";path="+(t||"/");if(typeof q==="number"){if(this.isIE){l=new Date();l.setTime(l.getTime()+(q*1000));k=";expires="+l.toUTCString()}else{k=";max-age="+q}}for(o=2,p=n.length;o<=p;o+=1){document.cookie=r+"="+j+";domain="+n.slice(-o).join(".")+s+k;if(this.getCookieValue(r)===j){break}}},getCookieValue:function(p,r){var m,n,l,q,k=null,j;try{r=r||document.cookie;if(!p||!p.toString){return null}p+="=";j=p.length;q=r.split(";");for(m=0,n=q.length;m<n;m+=1){l=q[m];l=g.ltrim(l);if(l.indexOf(p)===0){k=l.substring(j,l.length);break}}}catch(o){k=null}return k},getQueryStringValue:function(o,r,k){var n,m,s,l=null,p;try{k=k||window.location.search;s=k.length;if(!o||!o.toString||!s){return null}r=r||"&";k=r+k.substring(1);o=r+o+"=";n=k.indexOf(o);if(n!==-1){p=n+o.length;m=k.indexOf(r,p);if(m===-1){m=s}l=decodeURIComponent(k.substring(p,m))}}catch(q){}return l},addEventListener:(function(){if(window.addEventListener){return function(k,j,l){k.addEventListener(j,l,false)}}return function(k,j,l){k.attachEvent("on"+j,l)}}()),matchTarget:function(u,p){var n,m,t=-1,r,k,l,s,o,q;if(!u||!p){return t}if(!this.browserService||!this.browserBaseService){this.browserService=TLT.getService("browser");this.browserBaseService=TLT.getService("browserBase")}for(n=0,o=u.length;n<o&&t===-1;n+=1){q=u[n];if(typeof q==="string"){r=this.browserService.queryAll(q);for(m=0,k=r?r.length:0;m<k;m+=1){if(r[m]){l=this.browserBaseService.ElementData.prototype.examineID(r[m]);if(l.idType===p.idType&&l.id===p.id){t=n;break}}}}else{if(q&&q.id&&q.idType&&p.idType.toString()===q.idType.toString()){switch(typeof q.id){case"string":if(q.id===p.id){t=n}break;case"object":s=new RegExp(q.id.regex,q.id.flags);if(s.test(p.id)){t=n}break}}}}return t},WeakMap:(function(){function j(n,m){var l,k;n=n||[];for(l=0,k=n.length;l<k;l+=1){if(n[l][0]===m){return l}}return -1}return function(){var k=[];this.set=function(m,n){var l=j(k,m);k[l>-1?l:k.length]=[m,n]};this.get=function(m){var l=k[j(k,m)];return(l?l[1]:undefined)};this.clear=function(){k=[]};this.has=function(l){return(j(k,l)>=0)};this.remove=function(m){var l=j(k,m);if(l>=0){k.splice(l,1)}};this["delete"]=this.remove}}())};if(typeof TLT==="undefined"||!TLT){window.TLT={}}TLT.utils=g}());(function(){TLT.EventTarget=function(){this._handlers={}};TLT.EventTarget.prototype={constructor:TLT.EventTarget,publish:function(c,f){var d=0,a=0,b=this._handlers[c],e={type:c,data:f};if(typeof b!=="undefined"){for(a=b.length;d<a;d+=1){b[d](e)}}},subscribe:function(a,b){if(!this._handlers.hasOwnProperty(a)){this._handlers[a]=[]}this._handlers[a].push(b)},unsubscribe:function(c,e){var d=0,a=0,b=this._handlers[c];if(b){for(a=b.length;d<a;d+=1){if(b[d]===e){b.splice(d,1);return}}}}}}());TLT.ModuleContext=(function(){var a=["broadcast","getConfig:getModuleConfig","listen","post","getXPathFromNode","performDOMCapture","performFormCompletion","isInitialized","getStartTime"];return function(f,d){var h={},g=0,b=a.length,j=null,e=null,c=null;for(g=0;g<b;g+=1){j=a[g].split(":");if(j.length>1){c=j[0];e=j[1]}else{c=j[0];e=j[0]}h[c]=(function(i){return function(){var k=d.utils.convertToArray(arguments);k.unshift(f);return d[i].apply(d,k)}}(e))}h.utils=d.utils;return h}}());TLT.addService("config",function(a){function d(f,e){a.utils.extend(true,f,e);c.publish("configupdated",c.getConfig())}var b={core:{},modules:{},services:{}},c=a.utils.extend(false,a.utils.createObject(new TLT.EventTarget()),{getConfig:function(){return b},updateConfig:function(e){d(b,e)},getCoreConfig:function(){return b.core},updateCoreConfig:function(e){d(b.core,e)},getServiceConfig:function(e){return b.services[e]||{}},updateServiceConfig:function(f,e){if(typeof b.services[f]==="undefined"){b.services[f]={}}d(b.services[f],e)},getModuleConfig:function(e){return b.modules[e]||null},updateModuleConfig:function(f,e){if(typeof b.modules[f]==="undefined"){b.modules[f]={}}d(b.modules[f],e)},destroy:function(){b={core:{},modules:{},services:{}}}});return c});TLT.addService("queue",function(u){var z=u.utils,G=null,f={},o=600000,g=u.getService("ajax"),n=u.getService("browser"),p=u.getService("encoder"),k=u.getService("serializer"),D=u.getService("config"),i=u.getService("message"),s=null,F={},c=true,m=[],r=false,l=(function(){var L={};function O(P){return typeof L[P]!=="undefined"}function H(P,Q){if(!O(P)){L[P]={lastOffset:0,data:[],queueId:P,url:Q.url,eventThreshold:Q.eventThreshold,sizeThreshold:Q.sizeThreshold||0,size:-1,serializer:Q.serializer,encoder:Q.encoder,crossDomainEnabled:!!Q.crossDomainEnabled,crossDomainIFrame:Q.crossDomainIFrame}}return L[P]}function J(P){if(O(P)){delete L[P]}}function M(P){if(O(P)){return L[P]}return null}function K(Q){var P=M(Q);if(P!==null){P.data=[]}}function N(P){var Q=null;if(O(P)){Q=M(P).data;K(P)}return Q}function I(R,T){var P=null,S=null,V=window.tlBridge,Q=window.iOSJSONShuttle;try{S=k.serialize(T)}catch(U){S="Serialization failed: "+(U.name?U.name+" - ":"")+U.message;T={error:S}}if((typeof V!=="undefined")&&(typeof V.addMessage==="function")){V.addMessage(S)}else{if((typeof Q!=="undefined")&&(typeof Q==="function")){Q(S)}else{if(O(R)){P=M(R);P.data.push(T);P.data=u.redirectQueue(P.data);if(P.sizeThreshold){S=k.serialize(P.data);P.size=S.length}return P.data.length}}}return 0}return{exists:O,add:H,remove:J,reset:function(){L={}},get:M,clear:K,flush:N,push:I}}());function b(H){if(H&&H.id){z.extend(true,m[H.id-1],{xhrRspEnd:i.createMessage({type:0}).offset,success:H.success,statusCode:H.statusCode,statusText:H.statusText})}}function q(){return window.location.pathname}function a(J,N,K,M){var H=l.get(J),L={name:N,value:K},I=null;if(typeof N!=="string"||typeof K!=="string"){return}if(!H.headers){H.headers={once:[],always:[]}}I=!!M?H.headers.always:H.headers.once;I.push(L)}function E(J,M){var L=0,I=0,H=l.get(J),N=H.headers,K=null;M=M||{};function O(Q,S){var R=0,P=0,T=null;for(R=0,P=Q.length;R<P;R+=1){T=Q[R];S[T.name]=T.value}}if(N){K=[N.always,N.once];for(L=0,I=K.length;L<I;L+=1){O(K[L],M)}}return M}function w(I){var H=null,J=null;if(!l.exists(I)){throw new Error("Queue: "+I+" does not exist!")}H=l.get(I);J=H?H.headers:null;if(J){J.once=[]}}function C(){var I=0,H,K,J=u.provideRequestHeaders();if(J&&J.length){for(I=0,H=J.length;I<H;I+=1){K=J[I];a("DEFAULT",K.name,K.value,K.recurring)}}return I}function h(L){var K,H,J=[],I="";if(!L||!L.length){return I}for(K=0,H=L.length;K<H;K+=1){J[L[K].type]=true}for(K=0,H=J.length;K<H;K+=1){if(J[K]){if(I){I+=","}I+=K}}return I}function y(J,U){var O=l.flush(J),Q=O?O.length:0,P=l.get(J),K={"Content-Type":"application/json","X-PageId":u.getPageId(),"X-Tealeaf":"device (UIC) Lib/5.3.0.1788","X-TealeafType":"GUI","X-TeaLeaf-Page-Url":q(),"X-Tealeaf-SyncXHR":(!!U).toString()},S=null,M=i.createMessage({type:0}).offset,V=P.serializer||"json",I=P.encoder,L,N,H,T=null;if(!Q||!P){return}H=M-O[Q-1].offset;if(H>(o+60000)){return}P.lastOffset=O[Q-1].offset;K["X-Tealeaf-MessageTypes"]=h(O);O=i.wrapMessages(O);if(G.xhrLogging){S=O.serialNumber;m[S-1]={serialNumber:S,xhrReqStart:M};O.log={xhr:m}}if(V){O=k.serialize(O,V)}if(I){N=p.encode(O,I);if(N){if(N.data&&!N.error){O=N.data;K["Content-Encoding"]=N.encoding}else{O=N.error}}}C();E(J,K);if(P.crossDomainEnabled){T=z.getIFrameWindow(P.crossDomainIFrame);if(!T){return}L={request:{id:S,url:P.url,async:!U,headers:K,data:O}};if(!z.isIE&&typeof window.postMessage==="function"){T.postMessage(L,P.crossDomainIFrame.src)}else{try{T.sendMessage(L)}catch(R){return}}}else{g.sendRequest({id:S,oncomplete:b,url:P.url,async:!U,headers:K,data:O})}w(J)}function e(K){var H=null,J=G.queues,I=0;for(I=0;I<J.length;I+=1){H=J[I];y(H.qid,K)}return true}function j(J,L){var I,M=i.createMessage(L),H=l.get(J),K,N;I=H.data.length;if(I){N=M.offset-H.data[I-1].offset;if(N>o){l.flush(J);u.destroy();return}}I=l.push(J,M);K=H.size;if((I>=H.eventThreshold||K>=H.sizeThreshold)&&c&&u.getState()!=="unloading"){y(J)}}function d(J){var I=null,M=G.queues,L="",K=0,H=0;for(K=0;K<M.length;K+=1){I=M[K];if(I&&I.modules){for(H=0;H<I.modules.length;H+=1){L=I.modules[H];if(L===J){return I.qid}}}}return s.qid}function A(J,H){F[J]=window.setTimeout(function I(){y(J);F[J]=window.setTimeout(I,H)},H)}function x(){var H=0;for(H in F){if(F.hasOwnProperty(H)){window.clearTimeout(F[H]);delete F[H]}}F={}}function v(H){}function t(H){G=H;f=u.getCoreConfig();o=z.getValue(f,"inactivityTimeout",600000);z.forEach(G.queues,function(I,J){var K=null;if(I.qid==="DEFAULT"){s=I}if(I.crossDomainEnabled){K=n.query(I.crossDomainFrameSelector);if(!K){u.fail("Cross domain iframe not found")}}l.add(I.qid,{url:I.endpoint,eventThreshold:I.maxEvents,sizeThreshold:I.maxSize||0,serializer:I.serializer,encoder:I.encoder,timerInterval:I.timerInterval||0,crossDomainEnabled:I.crossDomainEnabled||false,crossDomainIFrame:K});if(typeof I.timerInterval!=="undefined"&&I.timerInterval>0){A(I.qid,I.timerInterval)}});D.subscribe("configupdated",v);r=true}function B(){if(c){e(!G.asyncReqOnUnload)}D.unsubscribe("configupdated",v);x();l.reset();G=null;s=null;r=false}return{init:function(){if(!r){t(D.getServiceConfig("queue")||{})}else{}},destroy:function(){B()},_getQueue:function(H){return l.get(H).data},setAutoFlush:function(H){if(H===true){c=true}else{c=false}},flush:function(H){H=H||s.qid;if(!l.exists(H)){throw new Error("Queue: "+H+" does not exist!")}y(H)},flushAll:function(H){return e(!!H)},post:function(I,J,H){H=H||d(I);if(!l.exists(H)){return}j(H,J)}}});TLT.addService("browserBase",function(r){var h,L=r.utils,i={optgroup:true,option:true,nobr:true},q={},e=r.getService("config"),n=null,A,w,g,u,F=false;function s(){e=r.getService("config");n=r.getService("serializer");A=r.getService("config").getServiceConfig("browser")||{};w=A.hasOwnProperty("blacklist")?A.blacklist:[];g=A.hasOwnProperty("customid")?A.customid:[]}function b(){s();e.subscribe("configupdated",s);n=r.getService("serializer");F=true}function G(){e.unsubscribe("configupdated",s);F=false}function v(P){var N,M,O;if(!P||!P.id||typeof P.id!=="string"){return false}for(N=0,M=w.length;N<M;N+=1){if(typeof w[N]==="string"){if(P.id===w[N]){return false}}else{if(typeof w[N]==="object"){O=new RegExp(w[N].regex,w[N].flags);if(O.test(P.id)){return false}}}}return true}function p(O,P){var M={type:null,subType:null},N;if(!O){return M}N=O.type;switch(N){case"focusin":N="focus";break;case"focusout":N="blur";break;default:break}M.type=N;return M}function y(N){var M={type:null,subType:null};if(!N){return M}M.type=L.getTagName(N);M.subType=N.type||null;return M}function c(M,O,N){var S={HTML_ID:"-1",XPATH_ID:"-2",ATTRIBUTE_ID:"-3"},R,P=null,Q;if(!M||!O){return P}R=N||window.document;O=O.toString();if(O===S.HTML_ID){if(R.getElementById){P=R.getElementById(M)}else{if(R.querySelector){P=R.querySelector("#"+M)}}}else{if(O===S.ATTRIBUTE_ID){Q=M.split("=");if(R.querySelector){P=R.querySelector("["+Q[0]+'="'+Q[1]+'"]')}}else{if(O===S.XPATH_ID){P=q.xpath(M,R)}}}return P}u=(function(){var M={nobr:true,p:true};function N(S,Q){var V,T,U=false,Y=null,O=null,Z=null,X=[],W=true,R=r._getLocalTop(),P="";while(W){W=false;if(!L.isUndefOrNull(S)){P=L.getTagName(S);if(!L.isUndefOrNull(P)){if(M.hasOwnProperty(P)){S=S.parentNode;P=L.getTagName(S)}}for(U=v(S);S!==document&&(!U||Q);U=v(S)){Z=S.parentNode;if(!Z){O=r.utils.getWindow(S);if(!O){return X}Z=(O!==R)?O.frameElement:document}Y=Z.firstChild;if(typeof Y==="undefined"){return X}for(T=0;Y;Y=Y.nextSibling){if(Y.nodeType===1&&L.getTagName(Y)===P){if(Y===S){X[X.length]=[P,T];break}T+=1}}S=Z;P=L.getTagName(S)}if(U&&!Q){X[X.length]=[S.id];if(r.utils.isIFrameDescendant(S)){W=true;S=r.utils.getWindow(S).frameElement}}}}return X}return function(R,P){var O=N(R,!!P),S=[],Q=O.length;if(Q<1){return"null"}while(Q){Q-=1;if(O[Q].length>1){S[S.length]='["'+O[Q][0]+'",'+O[Q][1]+"]"}else{S[S.length]="["+n.serialize(O[Q][0],"json")+"]"}}return("["+S.join(",")+"]")}}());function K(N){var O={left:-1,top:-1},M;N=N||document;M=N.documentElement||N.body.parentNode||N.body;O.left=Math.round((typeof window.pageXOffset==="number")?window.pageXOffset:M.scrollLeft);O.top=Math.round((typeof window.pageYOffset==="number")?window.pageYOffset:M.scrollTop);return O}function J(M){return M&&typeof M.originalEvent!=="undefined"&&typeof M.isDefaultPrevented!=="undefined"&&!M.isSimulated}function k(M){if(!M){return null}if(M.type&&M.type.indexOf("touch")===0){if(J(M)){M=M.originalEvent}if(M.type==="touchstart"){M=M.touches[M.touches.length-1]}else{if(M.type==="touchend"){M=M.changedTouches[0]}}}return M}function t(P){var S=P||window.event,R=document.documentElement,M=document.body,Q=false,O=null,N=0;if(J(S)){S=S.originalEvent}if(typeof P==="undefined"||typeof S.target==="undefined"){S.target=S.srcElement||window.window;S.timeStamp=Number(new Date());if(S.pageX===null||typeof S.pageX==="undefined"){S.pageX=S.clientX+((R&&R.scrollLeft)||(M&&M.scrollLeft)||0)-((R&&R.clientLeft)||(M&&M.clientLeft)||0);S.pageY=S.clientY+((R&&R.scrollTop)||(M&&M.scrollTop)||0)-((R&&R.clientTop)||(M&&M.clientTop)||0)}S.preventDefault=function(){this.returnValue=false};S.stopPropagation=function(){this.cancelBubble=true}}if(window.chrome&&S.path!==undefined&&S.type==="click"){if(S.path.length===undefined){return S}for(N=0;N<S.path.length;N++){if(L.getTagName(S.path[N])==="button"){Q=true;O=S.path[N];N=S.path.length}}if(Q){return{originalEvent:S,target:O,srcElement:O,type:S.type,pageX:document.body.scrollLeft+O.getBoundingClientRect().left,pageY:document.body.scrollTop+O.getBoundingClientRect().top}}}return S}function x(N){var M=null;if(!N){return null}if(N.srcElement){M=N.srcElement}else{M=N.target;if(!M){M=N.explicitOriginalTarget}if(!M){M=N.originalTarget}}if(!M&&N.type.indexOf("touch")===0){M=k(N).target}while(M&&i[L.getTagName(M)]){M=M.parentNode}if(!M&&N.srcElement===null){M=window.window}return M}function I(N){var Q=0,P=0,O=document.documentElement,M=document.body;N=k(N);if(N){if(N.pageX||N.pageY){Q=N.pageX;P=N.pageY}else{if(N.clientX||N.clientY){Q=N.clientX+(O?O.scrollLeft:(M?M.scrollLeft:0))-(O?O.clientLeft:(M?M.clientLeft:0));P=N.clientY+(O?O.scrollTop:(M?M.scrollTop:0))-(O?O.clientTop:(M?M.clientTop:0))}}}return{x:Q,y:P}}q.xpath=function(U,W){var S=null,N,T=null,M,Q,P,O,R,V;if(!U){return null}S=n.parse(U);W=W||document;N=W;if(!S){return null}for(Q=0,R=S.length;Q<R&&N;Q+=1){T=S[Q];if(T.length===1){if(W.getElementById){N=W.getElementById(T[0])}else{if(W.querySelector){N=W.querySelector("#"+T[0])}else{N=null}}}else{for(P=0,O=-1,V=N.childNodes.length;P<V;P+=1){if(N.childNodes[P].nodeType===1&&L.getTagName(N.childNodes[P])===T[0].toLowerCase()){O+=1;if(O===T[1]){N=N.childNodes[P];break}}}if(O===-1){return null}}M=L.getTagName(N);if(M==="frame"||M==="iframe"){N=L.getIFrameWindow(N).document;W=N}}return(N===W||!N)?null:N};function m(M,N){this.x=M||0;this.y=N||0}function a(N,M){this.width=Math.round(N||0);this.height=Math.round(M||0)}function d(N,O){var Q,M,P;O=x(N);Q=this.examineID(O);M=y(O);P=this.examinePosition(N,O);this.element=O;this.id=Q.id;this.idType=Q.idType;this.type=M.type;this.subType=M.subType;this.state=this.examineState(O);this.position=new m(P.x,P.y);this.size=new a(P.width,P.height);this.xPath=Q.xPath;this.name=Q.name}d.HTML_ID=-1;d.XPATH_ID=-2;d.ATTRIBUTE_ID=-3;d.prototype.examineID=function(S){var O,U,V,M,N,Q=g.length,P;try{V=u(S)}catch(R){}N=S.name;try{if(!r.utils.getWindow(S)||!r.utils.isIFrameDescendant(S)){if(v(S)){O=S.id;U=d.HTML_ID}else{if(g.length&&S.attributes){while(Q){Q-=1;P=S.attributes[g[Q]];if(typeof P!=="undefined"){O=g[Q]+"="+(P.value||P);U=d.ATTRIBUTE_ID}}}}}}catch(T){}if(!O){O=V;U=d.XPATH_ID}return{id:O,idType:U,xPath:V,name:N}};d.prototype.examineState=function(S){var M={a:["innerText","href"],input:{range:["maxValue:max","value"],checkbox:["value","checked"],radio:["value","checked"],image:["src"]},select:["value"],button:["value","innerText"],textarea:["value"]},N=L.getTagName(S),T=M[N]||null,O=null,V=null,P=0,R=0,Q=null,U="";if(T!==null){if(Object.prototype.toString.call(T)==="[object Object]"){T=T[S.type]||["value"]}V={};for(U in T){if(T.hasOwnProperty(U)){if(T[U].indexOf(":")!==-1){Q=T[U].split(":");V[Q[0]]=S[Q[1]]}else{if(T[U]==="innerText"){V[T[U]]=r.utils.trim(S.innerText||S.textContent)}else{V[T[U]]=S[T[U]]}}}}}if(N==="select"&&S.options&&!isNaN(S.selectedIndex)){V.index=S.selectedIndex;if(V.index>=0&&V.index<S.options.length){O=S.options[S.selectedIndex];V.value=O.getAttribute("value")||O.getAttribute("label")||O.text||O.innerText;V.text=O.text||O.innerText}}return V};function E(){var N=1,O,Q,M;if(document.body.getBoundingClientRect){try{O=document.body.getBoundingClientRect()}catch(P){r.utils.clog("getBoundingClientRect failed.",P);return N}Q=O.right-O.left;M=document.body.offsetWidth;N=Math.round((Q/M)*100)/100}return N}function o(N){var P,M,O,R;if(!N||!N.getBoundingClientRect){return{x:0,y:0,width:0,height:0}}try{P=N.getBoundingClientRect();R=K(document)}catch(Q){r.utils.clog("getBoundingClientRect failed.",Q);return{x:0,y:0,width:0,height:0}}M={x:P.left+R.left,y:P.top+R.top,width:P.right-P.left,height:P.bottom-P.top};if(r.utils.isIE){M.x-=document.documentElement.clientLeft;M.y-=document.documentElement.clientTop;O=E();if(O!==1){M.x=Math.round(M.x/O);M.y=Math.round(M.y/O);M.width=Math.round(M.width/O);M.height=Math.round(M.height/O)}}return M}d.prototype.examinePosition=function(N,O){var P=I(N),M=o(O);M.x=(P.x||P.y)?Math.round(Math.abs(P.x-M.x)):M.width/2;M.y=(P.x||P.y)?Math.round(Math.abs(P.y-M.y)):M.height/2;return M};function H(){var M=(typeof window.orientation==="number")?window.orientation:0;if(r.utils.isLandscapeZeroDegrees){if(Math.abs(M)===180||Math.abs(M)===0){M=90}else{if(Math.abs(M)===90){M=0}}}return M}function B(S){var P,M,R,Q,O,N;if(S){return S}R=r.getCoreConfig()||{};O=R.modules;S={};for(N in O){if(O.hasOwnProperty(N)&&O[N].events){for(P=0,M=O[N].events.length;P<M;P+=1){Q=O[N].events[P];if(Q.state){S[Q.name]=Q.state}}}}return S}function j(M){var N;h=B(h);if(h[M.type]){N=L.getValue(M,h[M.type],null)}return N}function l(N){var P,M,O;this.data=N.data||null;this.delegateTarget=N.delegateTarget||null;if(N.gesture||(N.originalEvent&&N.originalEvent.gesture)){this.gesture=N.gesture||N.originalEvent.gesture;this.gesture.idType=(new d(this.gesture,this.gesture.target)).idType}N=t(N);P=I(N);this.custom=false;this.nativeEvent=this.custom===true?null:N;this.position=new m(P.x,P.y);this.target=new d(N,N.target);this.orientation=H();O=j(N);if(O){this.target.state=O}this.timestamp=(new Date()).getTime();M=p(N,this.target);this.type=M.type;this.subType=M.subType}function D(M){r._publishEvent(new l(M))}function f(Q,O){var T,R,S=false,W=null,M=null,X=null,V=[],U=true,P=r._getLocalTop(),N="";while(U){U=false;if(L.isUndefOrNull(Q)){break}N=L.getTagName(Q);if(!L.isUndefOrNull(N)){if(f.specialChildNodes.hasOwnProperty(N)){Q=Q.parentNode;U=true;continue}}for(S=v(Q);Q!==document&&(!S||O);S=v(Q)){X=Q.parentNode;if(!X){M=r.utils.getWindow(Q);if(!M||Q.nodeType!==9){V.push([N,0]);break}X=(M!==P)?M.frameElement:document}W=X.firstChild;if(typeof W==="undefined"){break}for(R=0;W;W=W.nextSibling){if(W.nodeType===1&&L.getTagName(W)===N){if(W===Q){V[V.length]=[N,R];break}R+=1}}Q=X;N=L.getTagName(Q)}if(S&&!O){V[V.length]=[Q.id];if(r.utils.isIFrameDescendant(Q)){U=true;Q=r.utils.getWindow(Q).frameElement}}}V.reverse();return V}f.specialChildNodes={nobr:true,p:true};function C(M){var N;if(!M||!M.length){return null}N=n.serialize(M,"json");return N}function z(Q){var P="",N=[],M="",O=[];if(!(this instanceof z)){return null}if(typeof Q!=="object"){this.fullXpath="";this.xpath="";this.fullXpathList=[];this.xpathList=[];return}O=f(Q,false);if(O.length&&O[0].length===1){N=f(Q,true)}else{N=L.clone(O)}this.xpath=C(O);this.xpathList=O;this.fullXpath=C(N);this.fullXpathList=N;this.applyPrefix=function(T){var R,S;if(!(T instanceof z)||!T.fullXpathList.length){return}S=T.fullXpathList[T.fullXpathList.length-1];R=this.fullXpathList.shift();if(L.isEqual(R[0],S[0])){this.fullXpathList=T.fullXpathList.concat(this.fullXpathList)}else{this.fullXpathList.unshift(R);return}this.fullXpath=C(this.fullXpathList);R=this.xpathList.shift();if(R.length===1){this.xpathList.unshift(R);return}this.xpathList=T.xpathList.concat(this.xpathList);this.xpath=C(this.xpathList)};this.compare=function(R){if(!(R instanceof z)){return 0}return(this.fullXpathList.length-R.fullXpathList.length)};this.isSame=function(R){var S=false;if(!(R instanceof z)){return S}if(this.compare(R)===0){S=(this.fullXpath===R.fullXpath)}return S};this.containedIn=function(S){var T,R;if(!(S instanceof z)){return false}if(S.fullXpathList.length>this.fullXpathList.length){return false}for(T=0,R=S.fullXpathList.length;T<R;T+=1){if(!L.isEqual(S.fullXpathList[T],this.fullXpathList[T])){return false}}return true}}z.prototype=(function(){return{}}());return{init:function(){if(!F){b()}else{}},destroy:function(){G()},WebEvent:l,ElementData:d,Xpath:z,processDOMEvent:D,getNormalizedOrientation:H,getXPathFromNode:function(N,O,M,P){return u(O,M,P)},getNodeFromID:c,queryDom:q}});TLT.addService("browser",function(d){var h=d.getService("config"),f=d.getService("browserBase"),l=d.getService("ajax"),g=null,c=null,j=h.getServiceConfig("browser")||{},b=(j.useCapture===true),k=false,e={NO_QUERY_SELECTOR:"NOQUERYSELECTOR"},n=function(o){return function(q){var p=new f.WebEvent(q);if(q.type==="resize"||q.type==="hashchange"){setTimeout(function(){o(p)},5)}else{o(p)}}},a={list2Array:function(q){var p=q.length,o=[],r;if(typeof q.length==="undefined"){return[q]}for(r=0;r<p;r+=1){o[r]=q[r]}return o},find:function(q,p,o){o=o||"css";return this.list2Array(this[o](q,p))},css:function(q,t){var u=this,x=null,v=document.getElementsByTagName("body")[0],o=h.getServiceConfig("browser")||{},w=o.hasOwnProperty("jQueryObject")?d.utils.access(o.jQueryObject):window.jQuery,s=o.hasOwnProperty("sizzleObject")?d.utils.access(o.sizzleObject):window.Sizzle;if(typeof document.querySelectorAll==="undefined"){u.css=function(z,y){y=y||document;return u.Sizzle(z,y)};if(typeof u.Sizzle==="undefined"){try{if(v===s("html > body",document)[0]){u.Sizzle=s}}catch(r){try{if(v===w(document).find("html > body").get()[0]){u.Sizzle=function(z,y){return w(y).find(z).get()}}}catch(p){d.fail("Sizzle was not found",e.NO_QUERY_SELECTOR)}}}}else{u.css=function(z,y){y=y||document;return y.querySelectorAll(z)}}return u.css(q,t)}},m=(function(){var o=new d.utils.WeakMap();return{add:function(p){var q=o.get(p)||[n(p),0];q[1]+=1;o.set(p,q);return q[0]},find:function(p){var q=o.get(p);return q?q[0]:null},remove:function(p){var q=o.get(p);if(q){q[1]-=1;if(q[1]<=0){o.remove(p)}}}}}());function i(){a.xpath=f.queryDom.xpath;if(typeof document.addEventListener==="function"){g=function(q,o,p){q.addEventListener(o,p,b)};c=function(q,o,p){q.removeEventListener(o,p,b)}}else{if(typeof document.attachEvent!=="undefined"){g=function(q,o,p){q.attachEvent("on"+o,p)};c=function(q,o,p){q.detachEvent("on"+o,p)}}else{throw new Error("Unsupported browser")}}k=true}return{init:function(){if(!k){i()}else{}},destroy:function(){k=false},getServiceName:function(){return"W3C"},query:function(r,p,o){try{return a.find(r,p,o)[0]||null}catch(q){return[]}},queryAll:function(r,p,o){try{return a.find(r,p,o)}catch(q){return[]}},subscribe:function(o,r,p){var q=m.add(p);g(r,o,q)},unsubscribe:function(o,s,p){var q=m.find(p);if(q){try{c(s,o,q)}catch(r){}m.remove(p)}}}});TLT.addService("ajax",function(c){var g,j=false,h=false;function e(m){var l="",k=[];for(l in m){if(m.hasOwnProperty(l)){k.push([l,m[l]])}}return k}function f(m){var l="",k="?";for(l in m){if(m.hasOwnProperty(l)){k+=encodeURIComponent(l)+"="+encodeURIComponent(m[l])+"&"}}return k.slice(0,-1)}function d(m){m=m.split("\n");var o={},l=0,k=m.length,n=null;for(l=0;l<k;l+=1){n=m[l].split(": ");o[n[0]]=n[1]}return o}function i(k){var m,n=false,l=f(k.headers);if(typeof k.data==="string"){m=k.data}else{m=k.data?new Uint8Array(k.data):""}n=navigator.sendBeacon(k.url+l,m);return n}function b(s){var r=g(),l=[["X-Requested-With","XMLHttpRequest"]],q=0,m=typeof s.async!=="boolean"?true:s.async,o="",p=null,n,k;if(s.headers){l=l.concat(e(s.headers))}if(s.contentType){l.push(["Content-Type",s.contentType])}r.open(s.type.toUpperCase(),s.url,m);for(n=0,k=l.length;n<k;n+=1){o=l[n];if(o[0]&&o[1]){r.setRequestHeader(o[0],o[1])}}r.onreadystatechange=p=function(){if(r.readyState===4){r.onreadystatechange=p=function(){};if(s.timeout){window.clearTimeout(q)}s.oncomplete({id:s.id,headers:d(r.getAllResponseHeaders()),responseText:(r.responseText||null),statusCode:r.status,statusText:r.statusText,success:(r.status>=200&&r.status<300)});r=null}};r.send(s.data||null);p();if(s.timeout){q=window.setTimeout(function(){if(!r){return}r.onreadystatechange=function(){};if(r.readyState!==4){r.abort();if(typeof s.error==="function"){s.error({id:s.id,statusCode:r.status,statusText:"timeout",success:false})}}s.oncomplete({id:s.id,headers:d(r.getAllResponseHeaders()),responseText:(r.responseText||null),statusCode:r.status,statusText:"timeout",success:false});r=null},s.timeout)}}function a(){var k=c.getServiceConfig("queue");if(typeof window.XMLHttpRequest!=="undefined"){g=function(){return new XMLHttpRequest()}}else{g=function(){return new ActiveXObject("Microsoft.XMLHTTP")}}j=!!k.useBeacon&&(typeof navigator.sendBeacon==="function");h=true}return{init:function(){if(!h){a()}},destroy:function(){h=false},sendRequest:function(k){var m=c.getState()==="unloading",l;k.type=k.type||"POST";if(m&&j){l=i(k);if(!l){b(k)}}else{b(k)}}}});TLT.addService("domCapture",function(x){var h=x.getService("config"),i=x.getService("browserBase"),u,g,e={captureFrames:false,removeScripts:true,removeComments:true},S={childList:true,attributes:true,attributeOldValue:true,characterData:true,subtree:true},a=(typeof window.MutationObserver!=="undefined"),v,E=S,J=[],T=[],t=[],w=0,C=100,c=false,o=false,K=false,F=1,q=function(){},r=function(){},z=function(){},W=x.utils;function D(){T=[];t=[];w=0;c=false}function O(aa){var Z,Y,X;if(!aa||!aa.length){return}aa=aa.sort(function(ac,ab){return ac.compare(ab)});for(Z=0;Z<aa.length;Z+=1){X=aa[Z];for(Y=Z+1;Y<aa.length;Y+=0){if(aa[Y].containedIn(X)){aa.splice(Y,1)}else{Y+=1}}}}function p(Z){var Y,X;if(!Z){return Z}for(Y=0,X=Z.length;Y<X;Y+=1){delete Z[Y].oldValue}return Z}function d(ab,Z){var Y,X,aa=false;if(!ab||!Z){return aa}for(Y=0,X=ab.length;Y<X;Y+=1){if(ab[Y].name===Z){aa=true;break}}return aa}function y(aa,ac){var Z,Y,X,ab;for(Z=0,Y=aa.length,ab=false;Z<Y;Z+=1){X=aa[Z];if(X.name===ac.name){if(X.oldValue===ac.value){aa.splice(Z,1)}else{X.value=ac.value}ab=true;break}}if(!ab){aa.push(ac)}return aa}function I(aa,Y){var ac,ab,Z,X,ad,ae;aa.removedNodes=Y.removedNodes.length;aa.addedNodes=W.convertToArray(Y.addedNodes);for(ac=0,X=T.length;ac<X;ac+=1){ae=T[ac];if(aa.isSame(ae)){if(aa.removedNodes){for(ab=0;ab<Y.removedNodes.length;ab+=1){Z=ae.addedNodes.indexOf(Y.removedNodes[ab]);if(Z!==-1){ae.addedNodes.splice(Z,1);aa.removedNodes-=1}}}ae.removedNodes+=aa.removedNodes;ae.addedNodes.concat(aa.addedNodes);if(!ae.removedNodes&&!ae.addedNodes.length){T.splice(ac,1)}ad=true;break}}if(!ad){T.push(aa)}}function P(Y,ac){var aa,Z,X,ad=false,ab,ae;for(aa=0,X=T.length;!ad&&aa<X;aa+=1){ae=T[aa];if(Y.containedIn(ae)){ab=ae.addedNodes;for(Z=0;Z<ab.length;Z+=1){if(ab[Z].contains&&ab[Z].contains(ac)){ad=true;break}}}}return ad}function B(Z,Y){var ac,X,ab,aa,ad,ae=null;ab=Y.attributeName;if(ab==="checked"||ab==="selected"){ae=i.ElementData.prototype.examineID(Y.target);if(u.isPrivacyMatched(ae)){return}ae=null}if(ab==="value"){ae=i.ElementData.prototype.examineID(Y.target);ae.currState=i.ElementData.prototype.examineState(Y.target)||{};if(ae.currState.value){u.applyPrivacyToTarget(ae)}else{ae=null}}Z.attributes=[{name:ab,oldValue:Y.oldValue,value:ae?ae.currState.value:Y.target.getAttribute(ab)}];aa=Z.attributes[0];if(aa.oldValue===aa.value){return}for(ac=0,X=t.length,ad=false;ac<X;ac+=1){ae=t[ac];if(Z.isSame(ae)){ae.attributes=y(ae.attributes,aa);if(!ae.attributes.length){t.splice(ac,1)}else{if(P(Z,Y.target)){t.splice(ac,1)}}ad=true;break}}if(!ad&&!P(Z,Y.target)){t.push(Z)}}function l(aa){var ac,X,ab,Y,Z;if(!aa||!aa.length){return}w+=aa.length;if(w>=C){if(!c){c=true}return}for(ac=0,X=aa.length;ac<X;ac+=1){Y=aa[ac];Z=new i.Xpath(Y.target);if(Z){ab=Z.fullXpathList;if(ab.length&&ab[0][0]==="html"){switch(Y.type){case"characterData":case"childList":I(Z,Y);break;case"attributes":B(Z,Y);break;default:W.clog("Unknown mutation type: "+Y.type);break}}}}}function s(){var X;X=new window.MutationObserver(function(Y){if(Y){l(Y);W.clog("Processed ["+Y.length+"] mutation records.")}});return X}function j(Y){var Z,X;h.subscribe("configupdated",z);u=x.getService("message");g=Y;g.options=W.mixin({},e,g.options);a=a&&W.getValue(g,"diffEnabled",true);C=W.getValue(g.options,"maxMutations",100);if(a){E=W.getValue(g,"diffObserverConfig",S);v=s();J.push(window)}K=true}function N(){h.unsubscribe("configupdated",z);if(v){v.disconnect()}K=false}function m(){var X;X="tlt-"+W.getSerialNumber();return X}function f(aa,Z){var Y,X;if(!aa||!aa.getElementsByTagName||!Z){return}X=aa.getElementsByTagName(Z);if(X&&X.length){for(Y=X.length-1;Y>=0;Y-=1){X[Y].parentNode.removeChild(X[Y])}}return aa}function H(Z,X){var Y,aa;for(Y=0;Z.hasChildNodes()&&Y<Z.childNodes.length;Y+=1){aa=Z.childNodes[Y];if(aa.nodeType===X){Z.removeChild(aa);Y-=1}else{if(aa.hasChildNodes()){H(aa,X)}}}return Z}function R(Z){var Y,X=null;if(!Z||!Z.doctype){return null}Y=Z.doctype;if(Y){X="<!DOCTYPE "+Y.name+(Y.publicId?' PUBLIC "'+Y.publicId+'"':"")+(!Y.publicId&&Y.systemId?" SYSTEM":"")+(Y.systemId?' "'+Y.systemId+'"':"")+">"}return X}function Q(ad,ae){var ac,Z,ab,aa,Y,X;if(!ae){return}aa=ad.getElementsByTagName("input");Y=ae.getElementsByTagName("input");if(Y){for(ac=0,X=Y.length;ac<X;ac+=1){Z=aa[ac];ab=Y[ac];switch(ab.type){case"checkbox":case"radio":if(W.isIE?Z.checked:ab.checked){ab.setAttribute("checked","checked")}else{ab.removeAttribute("checked")}break;default:ab.setAttribute("value",ab.value);if(!ab.getAttribute("type")){ab.setAttribute("type","text")}break}}}}function k(ad,ae){var aa,X,ac,Y,Z,ab;if(!ad||!ad.getElementsByTagName||!ae||!ae.getElementsByTagName){return}Y=ad.getElementsByTagName("textarea");ab=ae.getElementsByTagName("textarea");if(Y&&ab){for(aa=0,X=Y.length;aa<X;aa+=1){ac=Y[aa];Z=ab[aa];Z.setAttribute("value",ac.value);Z.value=Z.textContent=ac.value}}}function L(X,ac){var Y,ae,ad,af,aa,Z,ab;if(!X||!X.getElementsByTagName||!ac||!ac.getElementsByTagName){return}ae=X.getElementsByTagName("select");af=ac.getElementsByTagName("select");if(ae){for(aa=0,ab=ae.length;aa<ab;aa+=1){Y=ae[aa];ad=af[aa];for(Z=0;Z<Y.options.length;Z+=1){if(Z===Y.selectedIndex||Y.options[Z].selected){ad.options[Z].setAttribute("selected","selected")}else{ad.options[Z].removeAttribute("selected")}}}}}function A(Y){var X,Z=null;if(Y){X=Y.nodeType||-1;switch(X){case 9:Z=Y.documentElement.outerHTML;break;case 1:Z=Y.outerHTML;break;default:Z=null;break}}return Z}function V(Z){var X,Y=false;if(Z&&typeof Z==="object"){X=Z.nodeType||-1;switch(X){case 9:case 1:Y=true;break;default:Y=false;break}}return Y}function b(ae,an,Y){var ah,ag,ai,ao,af=["iframe","frame"],am,Z,ac,al,aa,ak,ab={frames:[]},ap,ad,X;for(ag=0;ag<af.length;ag+=1){ao=af[ag];ap=ae.getElementsByTagName(ao);ad=an.getElementsByTagName(ao);if(ap){for(ah=0,ai=ap.length;ah<ai;ah+=1){try{am=ap[ah];Z=W.getIFrameWindow(am);if(Z&&Z.document){ac=Z.document;al=r(ac,ac,"",Y);aa=m();ad[ah].setAttribute("tltid",aa);al.tltid=aa;X=W.getOriginAndPath(ac.location);al.host=X.origin;al.url=X.path;al.charset=ac.characterSet||ac.charset;ak=ad[ah].getAttribute("src");if(!ak){ak=Z.location.href;ad[ah].setAttribute("src",ak)}ab.frames=ab.frames.concat(al.frames);delete al.frames;ab.frames.push(al)}}catch(aj){}}}}return ab}function U(ad){var ab,Z,X,aa,Y,ac,ae=0;if(!ad){return ae}if(ad.root){ae+=ad.root.length;if(ad.frames){for(ab=0,X=ad.frames.length;ab<X;ab+=1){if(ad.frames[ab].root){ae+=ad.frames[ab].root.length}}}}else{if(ad.diffs){for(ab=0,X=ad.diffs.length;ab<X;ab+=1){ac=ad.diffs[ab];ae+=ac.xpath.length;if(ac.root){ae+=ac.root.length}else{if(ac.attributes){for(Z=0,aa=ac.attributes.length;Z<aa;Z+=1){Y=ac.attributes[Z];ae+=Y.name.length;if(Y.value){ae+=Y.value.length}}}}}}}return ae}function M(){var aa,Z,X,Y;for(aa=0,X=T.length;aa<X&&t.length;aa+=1){Y=T[aa];for(Z=0;Z<t.length;Z+=1){if(t[Z].containedIn(Y)){t.splice(Z,1);Z-=1}}}}function n(Z,Y){var aa,X;aa=r(Z,Z,null,Y);if(!aa){aa={}}aa.charset=Z.characterSet||Z.charset;X=W.getOriginAndPath(Z.location);aa.host=X.origin;aa.url=X.path;return aa}function G(Z){var ab,X,aa={fullDOM:false,diffs:[]},ad,ac,Y;O(T);M();for(ab=0,X=T.length;ab<X;ab+=1){Y=T[ab];ac=i.getNodeFromID(Y.xpath,-2);if(ac===window.document.body){return n(window.document,Z)}ad=r(window.document,ac,Y,Z);ad.xpath=Y.xpath;aa.diffs.push(ad)}for(ab=0,X=t.length;ab<X;ab+=1){Y=t[ab];ad={xpath:d(Y.attributes,"id")?Y.fullXpath:Y.xpath,attributes:p(Y.attributes)};aa.diffs.push(ad)}return aa}q=function(X){var Y=null;if(V(X)){Y=X.cloneNode(true);if(!Y&&X.documentElement){Y=X.documentElement.cloneNode(true)}}return Y};r=function(ad,Z,Y,ab){var ac,X,ae={},aa;if(!ad||!Z){return ae}ac=q(Z,ad);if(!ac){return ae}if(!!ab.removeScripts){f(ac,"script");f(ac,"noscript")}if(!!ab.removeComments){H(ac,8)}L(Z,ac);Q(Z,ac);k(Z,ac);ac=u.applyPrivacyToNode(ac,Y,ad);if(!!ab.captureFrames){X=b(Z,ac,ab)}if(X){ae=W.mixin(ae,X)}ae.root=(R(Z)||"")+A(ac);return ae};z=function(){h=x.getService("config");j(h.getServiceConfig("domCapture")||{})};return{init:function(){h=x.getService("config");if(!K){j(h.getServiceConfig("domCapture")||{})}else{}},destroy:function(){N()},observeWindow:function(Z){var Y,X;if(!Z){return}if(!W.getValue(g,"options.captureFrames",false)&&!(Z===window)){return}if(W.indexOf(J,Z)===-1){J.push(Z)}},captureDOM:function(Y,Z){var aa,X,ad=null,ab,ae=0;if(!K||W.isLegacyIE){return ad}Z=W.mixin({},g.options,Z);Y=Y||window.document;if(!o||!a||c||Z.forceFullDOM){if(v){v.disconnect()}ad=n(Y,Z);ad.fullDOM=true;ad.forced=!!(c||Z.forceFullDOM);o=true;if(v){for(aa=0,X=J.length;aa<X;aa+=1){ab=J[aa];try{v.observe(ab.document,E)}catch(ac){J.splice(aa,1);X=J.length;aa-=1}}}}else{ad=G(Z);ad.fullDOM=ad.diffs?false:true}if(a){ad.mutationCount=w}D();if(Z.maxLength){ae=U(ad);if(ae>Z.maxLength){ad={errorCode:101,error:"Captured length ("+ae+") exceeded limit ("+Z.maxLength+")."}}}return ad}}});TLT.addService("encoder",function(a){var f={},g=null,b=null,d=false;function e(j){var i=null;if(!j){return i}i=f[j];if(i&&typeof i.encode==="string"){i.encode=a.utils.access(i.encode)}return i}function h(i){f=i;g.subscribe("configupdated",b);d=true}function c(){g.unsubscribe("configupdated",b);d=false}b=function(){g=a.getService("config");h(g.getServiceConfig("encoder")||{})};return{init:function(){g=a.getService("config");if(!d){h(g.getServiceConfig("encoder")||{})}else{}},destroy:function(){c()},encode:function(m,l){var k,i,j={data:null,encoding:null,error:null};if((typeof m!=="string"&&!m)||!l){j.error="Invalid "+(!m?"data":"type")+" parameter.";return j}k=e(l);if(!k){j.error="Specified encoder ("+l+") not found.";return j}if(typeof k.encode!=="function"){j.error="Configured encoder ("+l+") encode method is not a function.";return j}try{i=k.encode(m)}catch(n){j.error="Encoding failed: "+(n.name?n.name+" - ":"")+n.message;return j}if(!i||a.utils.getValue(i,"buffer",null)===null){j.error="Encoder ("+l+") returned an invalid result.";return j}j.data=i.buffer;j.encoding=k.defaultEncoding;return j}}});TLT.addService("message",function(x){var P=x.utils,q=0,t=0,H=0,j=0,r=new Date(),i=x.getService("browserBase"),b=x.getService("browser"),h=x.getService("config"),B=h.getServiceConfig("message")||{},m=window.location.href,M=window.location.hostname,Q=B.hasOwnProperty("privacy")?B.privacy:[],E={},N={lower:"x",upper:"X",numeric:"9",symbol:"@"},w=P.isiOS,s=navigator.userAgent.indexOf("Chrome")>-1&&P.isAndroid,f=window.devicePixelRatio||1,g=window.screen||{},a=g.width||0,z=g.height||0,O=i.getNormalizedOrientation(),k=!w?a:Math.abs(O)===90?z:a,D=!w?z:Math.abs(O)===90?a:z,K=(window.screen?window.screen.height-window.screen.availHeight:0),J=window.innerWidth||document.documentElement.clientWidth,n=window.innerHeight||document.documentElement.clientHeight,G=false;function d(S){var R="",T=S.timestamp||(new Date()).getTime();delete S.timestamp;this.type=S.type;this.offset=T-r.getTime();this.screenviewOffset=0;if(S.type===2){q=t;t=T;if(S.screenview.type==="UNLOAD"){this.screenviewOffset=T-q}}else{if(t){this.screenviewOffset=T-t}}if(!this.type){return}this.count=(j+=1);this.fromWeb=true;for(R in S){if(S.hasOwnProperty(R)){this[R]=S[R]}}}E.PVC_MASK_EMPTY=function(R){return""};E.PVC_MASK_BASIC=function(S){var R="XXXXX";if(typeof S!=="string"){return""}return(S.length?R:"")};E.PVC_MASK_TYPE=function(V){var S,U=0,R=0,T="";if(typeof V!=="string"){return T}S=V.split("");for(U=0,R=S.length;U<R;U+=1){if(P.isNumeric(S[U])){T+=N.numeric}else{if(P.isUpperCase(S[U])){T+=N.upper}else{if(P.isLowerCase(S[U])){T+=N.lower}else{T+=N.symbol}}}}return T};E.PVC_MASK_EMPTY.maskType=1;E.PVC_MASK_BASIC.maskType=2;E.PVC_MASK_TYPE.maskType=3;E.PVC_MASK_CUSTOM={maskType:4};function c(R,T){var S=E.PVC_MASK_BASIC;if(typeof T!=="string"){return T}if(!R){S=E.PVC_MASK_BASIC}else{if(R.maskType===E.PVC_MASK_EMPTY.maskType){S=E.PVC_MASK_EMPTY}else{if(R.maskType===E.PVC_MASK_BASIC.maskType){S=E.PVC_MASK_BASIC}else{if(R.maskType===E.PVC_MASK_TYPE.maskType){S=E.PVC_MASK_TYPE}else{if(R.maskType===E.PVC_MASK_CUSTOM.maskType){if(typeof R.maskFunction==="string"){S=P.access(R.maskFunction)}else{S=R.maskFunction}if(typeof S!=="function"){S=E.PVC_MASK_BASIC}}}}}}return S(T)}function C(R,S){var T;if(!R||!S){return}for(T in S){if(S.hasOwnProperty(T)){if(T==="value"){S[T]=c(R,S[T])}else{delete S[T]}}}}function L(Z,aa){var W,U,X,ab,R,T,ac,Y,S,V,ad=document;if(!Z||!aa||!aa.id){return false}if(aa.idType===-2){V=i.getNodeFromID(aa.id,aa.idType);ad=P.getDocument(V)}for(W=0,Y=Z.length;W<Y;W+=1){S=Z[W];if(typeof S==="string"){ab=b.queryAll(S,ad);for(U=0,R=ab?ab.length:0;U<R;U+=1){if(ab[U]){T=i.ElementData.prototype.examineID(ab[U]);if(T.idType===aa.idType&&T.id===aa.id){return true}}}}else{if(S&&S.id&&S.idType&&aa.idType===S.idType){switch(typeof S.id){case"string":if(S.id===aa.id){return true}break;case"object":ac=new RegExp(S.id.regex,S.id.flags);if(ac.test(aa.id)){return true}break}}}}return false}function F(U){var T,R,S;if(!U||(!U.currState&&!U.prevState)){return U}for(T=0,R=Q.length;T<R;T+=1){S=Q[T];if(L(S.targets,U)){C(S,U.prevState);C(S,U.currState);break}}return U}function o(R){if(!R||!R.target){return R}F(R.target);return R}function l(U,S){var T,R,W,V;if(!S||!U){return}if(U.value){W=c(S,U.value);U.setAttribute("value",W);U.value=W}if(P.getTagName(U)==="select"){U.selectedIndex=-1;for(T=0,R=U.options.length;T<R;T+=1){V=U.options[T];V.removeAttribute("selected");V.selected=false}}}function e(ab){var U,T,S,V,X,ac,aa,R,Z,W,Y;if(!ab){return ab}for(U=0,X=Q.length;U<X;U+=1){ac=Q[U];W=ac.targets;for(T=0,Y=W.length;T<Y;T+=1){Z=W[T];if(typeof Z==="string"){aa=b.queryAll(Z,ab);for(S=0,R=aa.length;S<R;S+=1){V=aa[S];if(V.value){V.setAttribute("value",c(ac,V.value))}}}else{if(typeof Z.id==="string"){V=i.getNodeFromID(Z.id,Z.idType,ab);if(V&&V.value){V.setAttribute("value",c(ac,V.value))}}}}}return ab}function v(af,ad,Y,ae){var W,V,Z,X,T,S=[],U,R,ac,aa,ab;if(!af.length){return}ab=b.queryAll("input, select, textarea",ad);if(!ab||!ab.length){return}for(W=0,Z=ab.length;W<Z;W+=1){if(ab[W].value){T=i.ElementData.prototype.examineID(ab[W]);if(T.idType===-2){U=new i.Xpath(ab[W]);U.applyPrefix(Y);T.id=U.xpath}S.push({id:T.id,idType:T.idType,element:ab[W]})}}for(W=0,Z=af.length;W<Z;W+=1){ac=Q[af[W].ruleIndex];aa=ac.targets[af[W].targetIndex];if(typeof aa.id==="string"&&aa.idType===-2){for(V=0;V<S.length;V+=1){if(S[V].idType===aa.idType&&S[V].id===aa.id){X=S[V].element;l(X,ac)}}}else{for(V=0;V<S.length;V+=1){if(S[V].idType===aa.idType&&aa.regex.test(S[V].id)){X=S[V].element;l(X,ac)}}}}}function p(ad,X,af){var V,U,T,W,Z,ag,S,ac,R,ae=[],ab,Y,aa;if(!ad||!af){return null}for(V=0,Z=Q.length;V<Z;V+=1){ag=Q[V];Y=ag.targets;for(U=0,aa=Y.length;U<aa;U+=1){ab=Y[U];if(typeof ab==="string"){ac=b.queryAll(ab,ad);for(T=0,R=ac.length;T<R;T+=1){W=ac[T];l(W,ag)}}else{if(typeof ab.id==="string"){switch(ab.idType){case -1:case -3:W=i.getNodeFromID(ab.id,ab.idType,ad);l(W,ag);break;case -2:ae.push({ruleIndex:V,targetIndex:U});break;default:break}}else{ae.push({ruleIndex:V,targetIndex:U})}}}}v(ae,ad,X,af);return ad}function u(V){var T,R,S,U=false;if(!V){return U}for(T=0,R=Q.length;T<R;T+=1){S=Q[T];if(L(S.targets,V)){U=true;break}}return U}function y(){var T,S,W,X,V,R,U;h=x.getService("config");B=h.getServiceConfig("message")||{};Q=B.hasOwnProperty("privacy")?B.privacy:[];for(T=0,X=Q.length;T<X;T+=1){W=Q[T];R=W.targets;for(S=0,U=R.length;S<U;S+=1){V=R[S];if(typeof V==="object"){if(typeof V.idType==="string"){V.idType=+V.idType}if(typeof V.id==="object"){V.regex=new RegExp(V.id.regex,V.id.flags)}}}}}function A(){if(h.subscribe){h.subscribe("configupdated",y)}y();G=true}function I(){h.unsubscribe("configupdated",y);G=false}return{init:function(){if(!G){A()}else{}},destroy:function(){I()},applyPrivacyToDocument:e,applyPrivacyToNode:p,applyPrivacyToMessage:o,applyPrivacyToTarget:F,isPrivacyMatched:u,createMessage:function(R){if(typeof R.type==="undefined"){throw new TypeError("Invalid queueEvent given!")}return o(new d(R))},wrapMessages:function(S){var R={messageVersion:"8.0.0.0",serialNumber:(H+=1),sessions:[{id:x.getPageId(),startTime:r.getTime(),timezoneOffset:r.getTimezoneOffset(),messages:S,clientEnvironment:{webEnvironment:{libVersion:"5.3.0.1788",domain:M,page:m,referrer:document.referrer,screen:{devicePixelRatio:f,deviceWidth:k,deviceHeight:D,deviceToolbarHeight:K,width:J,height:n,orientation:O}}}}]},T=R.sessions[0].clientEnvironment.webEnvironment.screen;T.orientationMode=P.getOrientationMode(T.orientation);return R}}});TLT.addService("serializer",function(core){function serializeToJSON(obj){var str,key,len=0;if(typeof obj!=="object"||obj===null){switch(typeof obj){case"function":case"undefined":return"null";case"string":return'"'+obj.replace(/\"/g,'\\"')+'"';default:return String(obj)}}else{if(Object.prototype.toString.call(obj)==="[object Array]"){str="[";for(key=0,len=obj.length;key<len;key+=1){if(Object.prototype.hasOwnProperty.call(obj,key)){str+=serializeToJSON(obj[key])+","}}}else{str="{";for(key in obj){if(Object.prototype.hasOwnProperty.call(obj,key)){str=str.concat('"',key,'":',serializeToJSON(obj[key]),",");len+=1}}}}if(len>0){str=str.substring(0,str.length-1)}str+=String.fromCharCode(str.charCodeAt(0)+2);return str}var configService=core.getService("config"),serialize={},parse={},defaultSerializers={json:(function(){if(typeof window.JSON!=="undefined"){return{serialize:window.JSON.stringify,parse:window.JSON.parse}}return{serialize:serializeToJSON,parse:function(data){return eval("("+data+")")}}}())},updateConfig=null,isInitialized=false;function addObjectIfExist(paths,rootObj,propertyName){var i,len,obj;paths=paths||[];for(i=0,len=paths.length;i<len;i+=1){obj=paths[i];if(typeof obj==="string"){obj=core.utils.access(obj)}if(typeof obj==="function"){rootObj[propertyName]=obj;break}}}function checkParserAndSerializer(){var isParserAndSerializerInvalid;if(typeof serialize.json!=="function"||typeof parse.json!=="function"){isParserAndSerializerInvalid=true}else{if(typeof parse.json('{"foo": "bar"}')==="undefined"){isParserAndSerializerInvalid=true}else{isParserAndSerializerInvalid=parse.json('{"foo": "bar"}').foo!=="bar"}if(typeof parse.json("[1, 2]")==="undefined"){isParserAndSerializerInvalid=true}else{isParserAndSerializerInvalid=isParserAndSerializerInvalid||parse.json("[1, 2]")[0]!==1;isParserAndSerializerInvalid=isParserAndSerializerInvalid||parse.json("[1,2]")[1]!==2}isParserAndSerializerInvalid=isParserAndSerializerInvalid||serialize.json({foo:"bar"})!=='{"foo":"bar"}';isParserAndSerializerInvalid=isParserAndSerializerInvalid||serialize.json([1,2])!=="[1,2]"}return isParserAndSerializerInvalid}function initSerializerService(config){var format;for(format in config){if(config.hasOwnProperty(format)){addObjectIfExist(config[format].stringifiers,serialize,format);addObjectIfExist(config[format].parsers,parse,format)}}if(!(config.json&&config.json.hasOwnProperty("defaultToBuiltin"))||config.json.defaultToBuiltin===true){serialize.json=serialize.json||defaultSerializers.json.serialize;parse.json=parse.json||defaultSerializers.json.parse}if(typeof serialize.json!=="function"||typeof parse.json!=="function"){core.fail("JSON parser and/or serializer not provided in the UIC config. Can't continue.")}if(checkParserAndSerializer()){core.fail("JSON stringification and parsing are not working as expected")}if(configService.subscribe){configService.subscribe("configupdated",updateConfig)}isInitialized=true}function destroy(){serialize={};parse={};configService.unsubscribe("configupdated",updateConfig);isInitialized=false}updateConfig=function(){configService=core.getService("config");initSerializerService(configService.getServiceConfig("serializer")||{})};return{init:function(){if(!isInitialized){initSerializerService(configService.getServiceConfig("serializer")||{})}else{}},destroy:function(){destroy()},parse:function(data,type){type=type||"json";return parse[type](data)},serialize:function(data,type){var serializedData;type=type||"json";serializedData=serialize[type](data);return serializedData}}});TLT.addModule("TLCookie",function(d){var i={},g="WCXSID",k="TLTSID",a="CoreID6",o,m,c=null,h=1800,n,f,p=d.utils;function l(){var s="123456789",t=o||(p.getRandomString(1,s)+p.getRandomString(27,s+"0"));p.setCookie(k,"0000"+t);return p.getCookieValue(k)}function b(){var s="123456789",t=o||(p.getRandomString(1,s)+p.getRandomString(27,s+"0"));p.setCookie(g,t,h);return p.getCookieValue(g)}function j(){if(!window.cmRetrieveUserID){return}window.cmRetrieveUserID(function(s){c=s})}function e(s){var t=[];if(s.tlAppKey){n=s.tlAppKey;t.push({name:"X-Tealeaf-SaaS-AppKey",value:n})}if(s.wcxCookieName){g=s.wcxCookieName}if(s.wcxCookieAge){h=s.wcxCookieAge}o=p.getCookieValue(g);if(!o){o=b()}t.push({name:"X-WCXSID",value:o});if(s.sessionizationCookieName){k=s.sessionizationCookieName}m=p.getCookieValue(k);if(!m){m=l()}t.push({name:"X-Tealeaf-SaaS-TLTSID",value:m});if(t.length){TLT.registerBridgeCallbacks([{enabled:true,cbType:"addRequestHeaders",cbFunction:function(){return t}}])}}function q(x){var u,t,s=false,w,v=i.appCookieWhitelist;if(!v||!v.length){return s}for(u=0,t=v.length;u<t&&!s;u+=1){w=v[u];if(w.regex){if(!w.regexp){w.regexp=new RegExp(w.regex,w.flags)}s=w.regexp.test(x)}else{s=(w===x)}}return s}function r(){var w,v,x,y={},t,A=document.cookie,u=[],z="",s="";if(!A){return}u=A.split("; ");for(w=0,x=u.length;w<x;w+=1){t=u[w];v=t.indexOf("=");if(v>=0){z=decodeURIComponent(t.substr(0,v))}s=t.substr(v+1);if(q(z)){y[z]=decodeURIComponent(s)}}if(c&&!y[a]){y[a]=c}d.post({type:14,cookies:y})}return{init:function(){i=d.getConfig()||{};e(i);j()},destroy:function(){},onevent:function(s){switch(s.type){case"screenview_load":if(p.getValue(i,"appCookieWhitelist.length",0)){j();r()}break;case"screenview_unload":b();break;default:break}}}});if(TLT&&typeof TLT.addModule==="function"){TLT.addModule("overstat",function(e){var A=e.utils,p={},C={updateInterval:250,hoverThresholdMin:1000,hoverThresholdMax:2*60*1000,gridCellMaxX:10,gridCellMaxY:10,gridCellMinWidth:20,gridCellMinHeight:20},d=50;function y(H){var I=e.getConfig()||{},J=I[H];return typeof J==="number"?J:C[H]}function G(N,H){var M=A.getValue(N,"webEvent.target",{}),I=A.getValue(M,"element.tagName")||"",J=I.toLowerCase()==="input"?A.getValue(M,"element.type"):"",L=A.getTlType(M),K={type:9,event:{hoverDuration:N.hoverDuration,hoverToClick:A.getValue(H,"hoverToClick")},target:{id:M.id||"",idType:M.idType||"",name:M.name||"",tlType:L,type:I,subType:J,position:{width:A.getValue(M,"element.offsetWidth",0),height:A.getValue(M,"element.offsetHeight",0),relXY:N.relXY}}};if((typeof K.target.id)===undefined||K.target.id===""){return}e.post(K)}function i(H){if(H&&!H.nodeType&&H.element){H=H.element}return H}function s(H){H=i(H);return !H||H===document.body||H===document.html||H===document}function j(H){H=i(H);if(!H){return null}return H.parentNode}function n(H){H=i(H);if(!H){return null}return H.offsetParent||H.parentElement||j(H)}function w(I,J){var H=0;if(!J||J===I){return false}J=j(J);while(!s(J)&&H++<d){if(J===I){return true}J=j(J)}if(H>=d){A.clog("Overstat isChildOf() hit iterations limit")}return false}function E(H){if(H.nativeEvent){H=H.nativeEvent}return H}function z(H){return E(H).target}function h(H){H=i(H);if(!H){return -1}return H.nodeType||-1}function D(H){H=i(H);if(!H){return""}return H.tagName?H.tagName.toUpperCase():""}function t(H){if(!H){return}if(H.nativeEvent){H=H.nativeEvent}if(H.stopPropagation){H.stopPropagation()}else{if(H.cancelBubble){H.cancelBubble()}}}function m(I){var H=D(I);return h(I)!==1||H==="TR"||H==="TBODY"||H==="THEAD"}function g(H){if(!H){return""}if(H.xPath){return H.xPath}H=i(H);return e.getXPathFromNode(H)}function B(I,H){var J=p[I];if(J&&J[H]){return J[H]()}}function v(I,K,J,H){this.xPath=I!==null?g(I):"";this.domNode=I;this.hoverDuration=0;this.hoverUpdateTime=0;this.gridX=Math.max(K,0);this.gridY=Math.max(J,0);this.parentKey="";this.updateTimer=-1;this.disposed=false;this.childKeys={};this.webEvent=H;this.getKey=function(){return this.xPath+":"+this.gridX+","+this.gridY};this.update=function(){var M=new Date().getTime(),L=this.getKey();if(this.hoverUpdateTime!==0){this.hoverDuration+=M-this.hoverUpdateTime}this.hoverUpdateTime=M;clearTimeout(this.updateTimer);this.updateTimer=setTimeout(function(){B(L,"update")},y("updateInterval"))};this.dispose=function(L){clearTimeout(this.updateTimer);delete p[this.getKey()];this.disposed=true;if(L){var M=this.clone();p[M.getKey()]=M;M.update()}};this.process=function(P){clearTimeout(this.updateTimer);if(this.disposed){return false}var N=false,O=this,M=null,L=0;if(this.hoverDuration>=y("hoverThresholdMin")){this.hoverDuration=Math.min(this.hoverDuration,y("hoverThresholdMax"));N=true;G(this,{hoverToClick:!!P});while(typeof O!=="undefined"&&L++<d){O.dispose(P);O=p[O.parentKey]}if(L>=d){A.clog("Overstat process() hit iterations limit")}}else{this.dispose(P)}return N};this.clone=function(){var L=new v(this.domNode,this.gridX,this.gridY);L.parentKey=this.parentKey;return L}}function F(J,H,K,I){return new v(J,H,K,I)}function r(J){if(J&&J.position){return{x:J.position.x,y:J.position.y}}J=i(J);var H=J&&J.getBoundingClientRect?J.getBoundingClientRect():null,N=H?H.left:(J?J.offsetLeft:0),M=H?H.top:(J?J.offsetHeight:0),P=N,O=M,K=0,I=0,L=n(J),Q=0;while(L&&Q++<d){if(s(L)){break}K=L.offsetLeft-(L.scrollLeft||0);I=L.offsetTop-(L.scrollTop||0);if(K!==P||I!==O){N+=K;M+=I;P=K;O=I}L=n(L)}if(Q>=d){A.clog("Overstat calculateNodeOffset() hit iterations limit")}if(isNaN(N)){N=0}if(isNaN(M)){M=0}return{x:N,y:M}}function a(L,J,I){L=i(L);var K=r(L),H=J-K.x,M=I-K.y;if(!isFinite(H)){H=0}if(!isFinite(M)){M=0}return{x:H,y:M}}function f(L,O,N){L=i(L);var J=L.getBoundingClientRect?L.getBoundingClientRect():null,T=J?J.width:L.offsetWidth,K=J?J.height:L.offsetHeight,M=T&&T>0?Math.max(T/y("gridCellMaxX"),y("gridCellMinWidth")):y("gridCellMinWidth"),Q=K&&K>0?Math.max(K/y("gridCellMaxY"),y("gridCellMinHeight")):y("gridCellMinHeight"),I=Math.floor(O/M),H=Math.floor(N/Q),S=T>0?O/T:0,P=K>0?N/K:0,R="";if(!isFinite(I)){I=0}if(!isFinite(H)){H=0}R=x(S,P);return{x:I,y:H,relXY:R}}function x(H,I){H=Math.floor(Math.min(Math.max(H,0),1)*100)/100;I=Math.floor(Math.min(Math.max(I,0),1)*100)/100;return H+","+I}function c(M){var N=M,O=M.getKey(),I={},J=null,L=null,K=false,H=0;I[O]=true;while(typeof N!=="undefined"&&H++<d){I[N.parentKey]=true;if(N.parentKey===""||N.parentKey===N.getKey()){break}if(H>=d){A.clog("Overstat cleanupHoverEvents() hit iterations limit")}N=p[N.parentKey]}for(J in p){if(p.hasOwnProperty(J)&&!I[J]){N=p[J];if(N){if(!K){K=N.process()}else{N.dispose()}}}}}function u(I,K){var L=null,H=null,J=false;for(H in p){if(p.hasOwnProperty(H)){L=p[H];if(L&&L.domNode===I&&L.getKey()!==K){if(!J){J=L.process()}else{L.dispose()}}}}}function b(L,J,K){if(!J){J=L.target}if(s(J)){return null}if(A.isiOS||A.isAndroid){return null}var H,Q,M,P,N,O,I;if(!m(J)){H=a(J,L.position.x,L.position.y);Q=f(J,H.x,H.y);M=new v(J,Q.x,Q.y,L);M.relXY=Q.relXY;P=M.getKey();if(p[P]){M=p[P]}else{p[P]=M}M.update();if(!K){I=n(J);if(I){O=b(L,I,true);if(O!==null){N=O.getKey();P=M.getKey();if(P!==N){M.parentKey=N}}}c(M)}}else{M=b(L,n(J),K)}return M}function q(H){H=E(H);if(w(H.target,H.relatedTarget)){return}u(H.target)}function l(J){var K=null,H=null,I=false;for(H in p){if(p.hasOwnProperty(H)){K=p[H];if(K){if(!I){I=K.process(true)}else{K.dispose()}}}}}function o(H){e.performFormCompletion(true)}function k(I){var H=A.getValue(I,"target.id");if(!H){return}switch(I.type){case"mousemove":b(I);break;case"mouseout":q(I);break;case"click":l(I);break;case"submit":o(I);break;default:break}}return{init:function(){},destroy:function(){var I,H;for(I in p){if(p.hasOwnProperty(I)){p[I].dispose();delete p[I]}}},onevent:function(H){if(typeof H!=="object"||!H.type){return}k(H)},onmessage:function(H){},createHoverEvent:F,cleanupHoverEvents:c,eventMap:p}})}else{}if(TLT&&typeof TLT.addModule==="function"){TLT.addModule("performance",function(f){var h={loadReceived:false,unloadReceived:false,perfEventSent:false},g=0;function b(j,i){if(typeof j!=="string"){return false}if(!i||typeof i!=="object"){return false}return(i[j]===true)}function e(k,i){var m=0,j={},n="",l=0;if(!k||typeof k!=="object"||!k.navigationStart){return{}}m=k.navigationStart;for(n in k){if(Object.prototype.hasOwnProperty.call(k,n)||typeof k[n]==="number"){if(!b(n,i)){l=k[n];if(typeof l==="number"&&l&&n!=="navigationStart"){j[n]=l-m}else{j[n]=l}}}}return j}function d(l){var m=0,k,j,i=f.utils;if(l){k=(l.responseEnd>0&&l.responseEnd<l.domLoading)?l.responseEnd:l.domLoading;j=l.loadEventStart;if(i.isNumeric(k)&&i.isNumeric(j)&&j>k){m=j-k}}return m}function c(j){var i=f.getStartTime();if(j.timestamp>i&&!g){g=j.timestamp-i}}function a(m){var k=f.getConfig()||{},j="UNKNOWN",n={type:7,performance:{}},i,o,l;if(!m||h.perfEventSent){return}o=m.performance||{};l=o.timing;i=o.navigation;if(l){n.performance.timing=e(l,k.filter);n.performance.timing.renderTime=d(l)}else{if(k.calculateRenderTime){n.performance.timing={renderTime:g,calculated:true}}else{return}}if(k.renderTimeThreshold&&n.performance.timing.renderTime>k.renderTimeThreshold){n.performance.timing.invalidRenderTime=n.performance.timing.renderTime;delete n.performance.timing.renderTime}if(i){switch(i.type){case 0:j="NAVIGATE";break;case 1:j="RELOAD";break;case 2:j="BACKFORWARD";break;default:j="UNKNOWN";break}n.performance.navigation={type:j,redirectCount:i.redirectCount}}f.post(n);h.perfEventSent=true}return{init:function(){},destroy:function(){},onevent:function(i){if(typeof i!=="object"||!i.type){return}switch(i.type){case"load":h.loadReceived=true;c(i);break;case"unload":h.unloadReceived=true;if(!h.perfEventSent){a(window)}break;default:break}},onmessage:function(i){}}})}else{}TLT.addModule("replay",function(an){var ao=an.utils,L=0,ai={scale:0,timestamp:0},ab={},I=null,e=[],ac=0,G=true,ad=null,D=null,X=false,l=0,U="",A="",O=(new Date()).getTime(),k=0,R=null,al=null,P=null,E=null,aj=null,V=null,Z=0,w=0,ag=null,v={inFocus:false},M=null,B=ao.isiOS,y=navigator.userAgent.indexOf("Chrome")>-1&&ao.isAndroid,q=window.devicePixelRatio||1,W=(window.screen?window.screen.height-window.screen.availHeight:0),ae=an.getConfig()||{},z=ao.getValue(ae,"viewPortWidthHeightLimit",10000),ah=1,F=1,Q,af={cellMaxX:10,cellMaxY:10,cellMinWidth:20,cellMinHeight:20};function t(){var ap;for(ap in ab){if(ab.hasOwnProperty(ap)){ab[ap].visitedCount=0}}}function s(ar){var ap=false,aq="|button|image|submit|reset|",at=null;if(typeof ar!=="object"||!ar.type){return ap}switch(ar.type.toLowerCase()){case"input":at="|"+(ar.subType||"")+"|";if(aq.indexOf(at.toLowerCase())===-1){ap=false}else{ap=true}break;case"select":case"textarea":ap=false;break;default:ap=true;break}return ap}function h(aq){var ap=[];aq=aq.parentNode;while(aq){ap.push(aq);aq=aq.parentNode}return ap}function x(ap){return ao.some(ap,function(ar){var aq=ao.getTagName(ar);if(aq==="a"||aq==="button"){return ar}return null})}function n(ap){var aq=ap.type,ar=ap.target;if(typeof aq==="string"){aq=aq.toLowerCase()}else{aq="unknown"}if(aq==="blur"){aq="focusout"}if(aq==="change"){if(ar.type==="INPUT"){switch(ar.subType){case"text":case"date":case"time":aq=ar.subType+"Change";break;default:aq="valueChange";break}}else{if(ar.type==="TEXTAREA"){aq="textChange"}else{aq="valueChange"}}}return aq}function C(ap,ar,aq){var at=null;if(!ap){return at}ar=ar||{};ar.eventOn=G;G=false;if(aq){at="dcid-"+ao.getSerialNumber()+"."+(new Date()).getTime()+"s";window.setTimeout(function(){ar.dcid=at;an.performDOMCapture(ap,ar)},aq)}else{delete ar.dcid;at=an.performDOMCapture(ap,ar)}return at}function K(aq,aD,ar){var ay,aw,aF=false,at={},aE=false,av,aA,aC=null,ax=0,aB,az,ap,au;if(!aq||(!aD&&!ar)){return aC}if(!aD&&!(aq==="load"||aq==="unload")){return aC}ae=an.getConfig()||{};aE=ao.getValue(ae,"domCapture.enabled",false);if(!aE||ao.isLegacyIE){return aC}aA=ao.getValue(ae,"domCapture.triggers")||[];for(ay=0,aB=aA.length;!aF&&ay<aB;ay+=1){av=aA[ay];if(av.event===aq){if(aq==="load"||aq==="unload"){if(av.screenviews){ap=av.screenviews;for(aw=0,au=ap.length;!aF&&aw<au;aw+=1){az=ap[aw];switch(typeof az){case"object":if(!az.rgxp){az.rgxp=new RegExp(az.regex,az.flags)}aF=az.rgxp.test(ar);break;case"string":aF=(az===ar);break;default:break}}}else{aF=true}}else{if(av.targets){aF=(-1!==ao.matchTarget(av.targets,aD))}else{aF=true}}}}if(aF){ax=av.delay||(av.event==="load"?7:0);at.forceFullDOM=!!av.fullDOMCapture;aC=C(window.document,at,ax)}return aC}function aa(aA){var ar,at,au=ao.getValue(aA,"webEvent.target",{}),ap=au.type,aw=au.subType||"",aq=ao.getTlType(au),ax=h(ao.getValue(au,"element")),az=null,av=ao.getValue(au,"position.relXY"),ay=ao.getValue(aA,"webEvent.subType",null);ar={timestamp:ao.getValue(aA,"webEvent.timestamp",0),type:4,target:{id:au.id||"",idType:au.idType,name:au.name,tlType:aq,type:ap,position:{width:ao.getValue(au,"size.width"),height:ao.getValue(au,"size.height")},currState:aA.currState||null},event:{tlEvent:n(ao.getValue(aA,"webEvent")),type:ao.getValue(aA,"webEvent.type","UNKNOWN")}};if(aw){ar.target.subType=aw}if(av){ar.target.position.relXY=av}if(typeof aA.dwell==="number"&&aA.dwell>0){ar.target.dwell=aA.dwell}if(typeof aA.visitedCount==="number"){ar.target.visitedCount=aA.visitedCount}if(typeof aA.prevState!=="undefined"){ar.prevState=aA.prevState}if(ay){ar.event.subType=ay}az=x(ax);ar.target.isParentLink=!!az;if(az){if(az.href){ar.target.currState=ar.target.currState||{};ar.target.currState.href=ar.target.currState.href||az.href}if(az.value){ar.target.currState=ar.target.currState||{};ar.target.currState.value=ar.target.currState.value||az.value}if(az.innerText||az.textContent){ar.target.currState=ar.target.currState||{};ar.target.currState.innerText=ao.trim(ar.target.currState.innerText||az.innerText||az.textContent)}}if(ao.isUndefOrNull(ar.target.currState)){delete ar.target.currState}if(ao.isUndefOrNull(ar.target.name)){delete ar.target.name}if(ar.event.type!=="click"||s(au)){at=K(ar.event.type,au);if(at){ar.dcid=at}}return ar}function H(ap){an.post(ap)}function J(au){var ar=0,ap,av=au.length,ax,aw,at,ay={mouseout:true,mouseover:true},aq=[];for(ar=0;ar<av;ar+=1){ax=au[ar];if(!ax){continue}if(ay[ax.event.type]){aq.push(ax)}else{for(ap=ar+1;ap<av&&au[ap];ap+=1){if(!ay[au[ap].event.type]){break}}if(ap<av){aw=au[ap];if(aw&&ax.target.id===aw.target.id&&ax.event.type!==aw.event.type){if(ax.event.type==="click"){at=ax;ax=aw;aw=at}if(aw.event.type==="click"){ax.target.position=aw.target.position;ar+=1}else{if(aw.event.type==="blur"){ax.target.dwell=aw.target.dwell;ax.target.visitedCount=aw.target.visitedCount;ax.focusInOffset=aw.focusInOffset;ax.target.position=aw.target.position;ar+=1}}au[ap]=null;au[ar]=ax}}aq.push(au[ar])}}for(ax=aq.shift();ax;ax=aq.shift()){an.post(ax)}au.splice(0,au.length)}if(typeof window.onerror!=="function"){window.onerror=function(at,ar,ap){var aq=null;if(typeof at!=="string"){return}ap=ap||-1;aq={type:6,exception:{description:at,url:ar,line:ap}};l+=1;an.post(aq)};X=true}function o(aq,ap){v=ap;v.inFocus=true;if(typeof ab[aq]==="undefined"){ab[aq]={}}ab[aq].focus=v.dwellStart=Number(new Date());ab[aq].focusInOffset=P?v.dwellStart-Number(P):-1;ab[aq].prevState=ao.getValue(ap,"target.state");ab[aq].visitedCount=ab[aq].visitedCount+1||1}function Y(ap,aq){e.push(aa({webEvent:ap,id:aq,currState:ao.getValue(ap,"target.state")}))}function d(av,aq){var ar=false,au,ap,at=0;if(typeof av==="undefined"||av===null||typeof aq==="undefined"||aq===null){return}if(typeof ab[av]!=="undefined"&&ab[av].hasOwnProperty("focus")){ab[av].dwell=Number(new Date())-ab[av].focus}else{ab[av]={};ab[av].dwell=0}if(e.length===0){if(!v.inFocus){return}Y(aq,av)}v.inFocus=false;if(e[e.length-1]){for(at=e.length-1;at>=0;at--){e[at].target.visitedCount=ab[av].visitedCount}}ap=e[e.length-1];if(ap){ap.target.dwell=ab[av].dwell;ap.focusInOffset=ab[av].focusInOffset;ap.target.visitedCount=ab[av].visitedCount;if(ap.event.type==="click"){if(!s(ap.target)){ap.target.currState=ao.getValue(aq,"target.state")||ao.getValue(aq,"target.currState");ar=true}}else{if(ap.event.type==="focus"){ar=true}}if(ar){ap.event.type="blur";ap.event.tlEvent="focusout";au=K(ap.event.type,aq.target);if(au){ap.dcid=au}}}J(e)}function m(au,ar){var aq=false,at=e.length,ap=at>0?e[at-1]:null;if(!ap){return aq}if(ap.target.id!==au&&ap.target.tltype!=="selectList"){if(ar.type==="focus"||ar.type==="click"||ar.type==="change"){d(ap.target.id,ap);aq=true}}return aq}function c(aq,ap){if(typeof ab[aq]!=="undefined"&&!ab[aq].hasOwnProperty("focus")){o(aq,ap)}Y(ap,aq);if(typeof ab[aq]!=="undefined"&&typeof ab[aq].prevState!=="undefined"){if(e[e.length-1].target.tlType==="textBox"||e[e.length-1].target.tlType==="selectList"){e[e.length-1].target.prevState=ab[aq].prevState}}}function r(av){var au,ay,aq,ap,at=ao.getValue(av,"target.element",{}),az=ao.getValue(av,"target.size.width",at.offsetWidth),ar=ao.getValue(av,"target.size.height",at.offsetHeight),ax=ao.getValue(av,"target.position.x",0),aw=ao.getValue(av,"target.position.y",0);au=az?Math.max(az/af.cellMaxX,af.cellMinWidth):af.cellMinWidth;ay=ar?Math.max(ar/af.cellMaxY,af.cellMinHeight):af.cellMinHeight;aq=Math.floor(ax/au);ap=Math.floor(aw/ay);if(!isFinite(aq)){aq=0}if(!isFinite(ap)){ap=0}return aq+","+ap}function b(au,ar){var aq,ap=true,at=0;if(ar.target.type==="select"&&M&&M.target.id===au){M=null;return}if(!v.inFocus){o(au,ar)}at=e.length;if(at&&ao.getValue(e[at-1],"event.type")!=="change"){c(au,ar)}aq=r(ar);at=e.length;if(ar.position.x===0&&ar.position.y===0&&at&&ao.getValue(e[at-1],"target.tlType")==="radioButton"){ap=false}else{ar.target.position.relXY=aq}if(at&&ao.getValue(e[at-1],"target.id")===au){if(ap){e[at-1].target.position.relXY=aq}}else{Y(ar,au);if(s(ar.target)){d(au,ar)}}M=ar}function a(aq){var ap=aq.orientation,ar={type:4,event:{type:"orientationchange"},target:{prevState:{orientation:L,orientationMode:ao.getOrientationMode(L)},currState:{orientation:ap,orientationMode:ao.getOrientationMode(ap)}}};H(ar);L=ap}function am(aq){var ap=false;if(!aq){return ap}ap=(ai.scale===aq.scale&&Math.abs((new Date()).getTime()-ai.timestamp)<500);return ap}function j(ap){ai.scale=ap.scale;ai.rotation=ap.rotation;ai.timestamp=(new Date()).getTime()}function N(){var ap,aq;ap=ah-F;if(isNaN(ap)){aq="INVALID"}else{if(ap<0){aq="CLOSE"}else{if(ap>0){aq="OPEN"}else{aq="NONE"}}}return aq}function g(au){var az=document.documentElement,aw=document.body,aA=window.screen,aq=aA.width,ar=aA.height,av=ao.getValue(au,"orientation",0),ax=!B?aq:Math.abs(av)===90?ar:aq,at={type:1,clientState:{pageWidth:document.width||(!az?0:az.offsetWidth),pageHeight:Math.max((!document.height?0:document.height),(!az?0:az.offsetHeight),(!az?0:az.scrollHeight)),viewPortWidth:window.innerWidth||az.clientWidth,viewPortHeight:window.innerHeight||az.clientHeight,viewPortX:Math.round(window.pageXOffset||(!az?(!aw?0:aw.scrollLeft):az.scrollLeft||0)),viewPortY:Math.round(window.pageYOffset||(!az?(!aw?0:aw.scrollTop):az.scrollTop||0)),deviceOrientation:av,event:ao.getValue(au,"type")}},ay=at.clientState,ap;D=D||at;if(ay.event==="unload"&&ay.viewPortHeight===ay.pageHeight&&ay.viewPortWidth===ay.pageWidth){if(D.clientState.viewPortHeight<ay.viewPortHeight){ay.viewPortHeight=D.clientState.viewPortHeight;ay.viewPortWidth=D.clientState.viewPortWidth}}if((ay.viewPortY+ay.viewPortHeight)>ay.pageHeight){ay.viewPortY=ay.pageHeight-ay.viewPortHeight}if(ay.viewPortY<0){ay.viewPortY=0}ap=!ay.viewPortWidth?1:(ax/ay.viewPortWidth);ay.deviceScale=ap.toFixed(3);ay.viewTime=0;if(E&&aj){ay.viewTime=aj.getTime()-E.getTime()}if(au.type==="scroll"){ay.viewPortXStart=D.clientState.viewPortX;ay.viewPortYStart=D.clientState.viewPortY}return at}function p(){var ap;if(ad){ap=ad.clientState;if(ap.viewPortHeight>0&&ap.viewPortHeight<z&&ap.viewPortWidth>0&&ap.viewPortWidth<z){H(ad)}D=ad;ad=null;E=V||E;aj=null}p.timeoutId=0}function S(ap){var aq=null;if(ao.isOperaMini){return}ad=g(ap);if(ap.type==="scroll"||ap.type==="resize"){if(p.timeoutId){window.clearTimeout(p.timeoutId)}p.timeoutId=window.setTimeout(p,ao.getValue(ae,"scrollTimeout",2000))}else{if(ap.type==="touchstart"||ap.type==="load"){if(ad){F=parseFloat(ad.clientState.deviceScale)}}else{if(ap.type==="touchend"){if(ad){ah=parseFloat(ad.clientState.deviceScale);p()}}}}if(ap.type==="load"||ap.type==="unload"){if(ap.type==="unload"&&O){aq=ao.clone(ad);aq.clientState.event="attention";aq.clientState.viewTime=(new Date()).getTime()-O}p();if(aq){ad=aq;p()}}return ad}function ak(aq){var ap=ao.getValue(aq,"nativeEvent.touches.length",0);if(ap===2){S(aq)}}function i(at){var ar,aq={},au=ao.getValue(at,"nativeEvent.rotation",0)||ao.getValue(at,"nativeEvent.touches[0].webkitRotationAngle",0),av=ao.getValue(at,"nativeEvent.scale",1),ap=null,aw={type:4,event:{type:"touchend"},target:{id:ao.getValue(at,"target.id"),idType:ao.getValue(at,"target.idType")}};ar=ao.getValue(at,"nativeEvent.changedTouches.length",0)+ao.getValue(at,"nativeEvent.touches.length",0);if(ar!==2){return}S(at);ap={rotation:au?au.toFixed(2):0,scale:ah?ah.toFixed(2):1};ap.pinch=N();aq.scale=F?F.toFixed(2):1;aw.target.prevState=aq;aw.target.currState=ap;H(aw)}function f(aA,at){var ax=["type","name","target.id"],ar=null,au,aw,av=true,ay=10,aq=0,az=0,ap=0;if(!aA||!at||typeof aA!=="object"||typeof at!=="object"){return false}for(au=0,aw=ax.length;av&&au<aw;au+=1){ar=ax[au];if(ao.getValue(aA,ar)!==ao.getValue(at,ar)){av=false;break}}if(av){az=ao.getValue(aA,"timestamp");ap=ao.getValue(at,"timestamp");if(!(isNaN(az)&&isNaN(ap))){aq=Math.abs(ao.getValue(aA,"timestamp")-ao.getValue(at,"timestamp"));if(isNaN(aq)||aq>ay){av=false}}}return av}function u(ap){var ar={type:4,event:{type:ap.type},target:{id:ao.getValue(ap,"target.id"),idType:ao.getValue(ap,"target.idType"),currState:ao.getValue(ap,"target.state")}},aq;aq=K(ap.type,ap.target);if(aq){ar.dcid=aq}H(ar)}function T(aq){var ap=ao.getValue(ae,"geolocation"),ar;if(!ap||!ap.enabled){return}ar=ap.triggers||[];if(!ar.length){return}if(ar[0].event===aq){TLT.logGeolocation()}}return{init:function(){e=[]},destroy:function(){d(I);e=[];if(X){window.onerror=null;X=false}},onevent:function(aq){var au=null,ar=null,ap,at;if(typeof aq!=="object"||!aq.type){return}if(f(aq,R)){R=aq;return}R=aq;au=ao.getValue(aq,"target.id");if(Object.prototype.toString.call(ab[au])!=="[object Object]"){ab[au]={}}m(au,aq);ag=new Date();switch(aq.type){case"hashchange":break;case"focus":ar=o(au,aq);break;case"blur":ar=d(au,aq);break;case"click":ar=b(au,aq);break;case"change":ar=c(au,aq);break;case"orientationchange":ar=a(aq);break;case"touchstart":ak(aq);break;case"touchend":ar=i(aq);break;case"loadWithFrames":TLT.logScreenviewLoad("rootWithFrames");break;case"load":L=aq.orientation;E=new Date();if(typeof window.orientation!=="number"||ao.isAndroid){at=(window.screen.width>window.screen.height?90:0);ap=window.orientation;if(Math.abs(ap)!==at&&!(ap===180&&at===0)){ao.isLandscapeZeroDegrees=true;if(Math.abs(ap)===180||Math.abs(ap)===0){L=90}else{if(Math.abs(ap)===90){L=0}}}}setTimeout(function(){if(an.isInitialized()){S(aq)}},100);T(aq.type);TLT.logScreenviewLoad("root");break;case"screenview_load":P=new Date();t();ar=K("load",null,aq.name);break;case"screenview_unload":ar=K("unload",null,aq.name);break;case"resize":case"scroll":if(!aj){aj=new Date()}V=new Date();S(aq);break;case"unload":if(e!==null){J(e)}aj=new Date();S(aq);TLT.logScreenviewUnload("root");break;default:u(aq);break}I=au;return ar},onmessage:function(){}}});

/**
 * Licensed Materials - Property of IBM
 * © Copyright IBM Corp. 2017
 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/**
 * @fileOverview The Gesture module implements the logic for capturing Hammer.js gesture events.
 * @version 5.3.0.1788
 * @exports gesture
 */

/*global TLT:true */
/*global Hammer:true */

TLT.addModule("gestures", function (context) {
    "use strict";

    var tlTypes = {
            "input:radio": "radioButton",
            "input:checkbox": "checkBox",
            "input:text": "textBox",
            "input:password": "textBox",
            "input:file": "fileInput",
            "input:button": "button",
            "input:submit": "submitButton",
            "input:reset": "resetButton",
            "input:image": "image",
            "input:color": "color",
            "input:date": "date",
            "input:datetime": "datetime",
            "input:datetime-local": "datetime-local",
            "input:number": "number",
            "input:email": "email",
            "input:tel": "tel",
            "input:search": "search",
            "input:url": "url",
            "input:time": "time",
            "input:week": "week",
            "input:month": "month",
            "textarea:": "textBox",
            "select:": "selectList",
            "select:select-one": "selectList",
            "button:": "button",
            "a:": "link"
        },
        utils = context.utils,
        firstTouches = [],
        tapCount = 0,
        swipeOk = true,
        timer,
        gestureOptions = {
            swipeAfterPinchInterval: 300,
            doubleTapInterval: 300,
            preventMouse: true,
            dragMinDistance: 10
        },
        hammertimeArray = [],
        elementArray = [],
        prevGestureQueueEvent,
        hammerVersion,
        startEventTarget,
        i;

    /**
     * Posts Gesture Event to Queue
     * @private
     * @param {object} queueEvent A queueEvent created with createGestureQueueEvent.
     * @return {void}
     */
    function postGestureEvent(queueEvent) {
        context.post(queueEvent);
    }

    /**
     * Get tlEvent from webEvent.
     * @private
     * @param {object} webEvent A webEvent with properties a type 11 object that is a control.
     * @return {string} tlEvent.
     */
    function getTlEvent(webEvent) {
        var tlEvent;

        //We consider the Hammer.js event named "drag" a swipe. We currently do not support the Hammer.js event named "swipe".
        if (webEvent.type === "drag") {
            tlEvent = "swipe";
        //We consider the Hammer.js event named "hold" a tapHold. There is no Hammer.js event called "tapHold".
        } else if (webEvent.type === "hold") {
            tlEvent = "tapHold";
        } else {
            tlEvent = webEvent.type;
        }

        if (typeof tlEvent === "string") {
            tlEvent = tlEvent.toLowerCase();
        } else {
            tlEvent = "unknown";
        }

        return tlEvent;
    }
    /**
     * Gets the top left X & Y values of a webEvent target.
     * @private
     * @param {WebEvent} webEvent Normalized browser event
     * @return value of top left X & Y
     */
    function getElementTopLeft(webEvent) {
        var target = webEvent.gesture.srcEvent.target,
            topLeftY = 0,
            topLeftX = 0;
        while (target && target.tagName !== "BODY") {
            topLeftY += target.offsetTop;
            topLeftX += target.offsetLeft;
            target = target.offsetParent;
        }
        return { topLeftX: topLeftX, topLeftY: topLeftY };
    }

    /**
     * Gets the relative X & Y values to a webEvent.
     * @private
     * @param {WebEvent} webEvent Normalized browser event
     * @return String value of relative X & Y
     */
    function getRelativeXY(webEvent, touchX, touchY) {
        var elementX = getElementTopLeft(webEvent).topLeftX,
            elementY = getElementTopLeft(webEvent).topLeftY,
            width = webEvent.gesture.srcEvent.target.offsetWidth,
            height = webEvent.gesture.srcEvent.target.offsetHeight,
            relX = Math.abs((touchX - elementX) / width).toFixed(1),
            relY = Math.abs((touchY - elementY) / height).toFixed(1);

        relX = relX > 1 || relX < 0 ? 0.5 : relX;
        relY = relY > 1 || relY < 0 ? 0.5 : relY;

        return relX + "," + relY;
    }

    /**
     * Cleans a gesture touch by removing fields if they do not exist, are null, or otherwise should not be included. Works by cleaning the first object in the sent array.
     * @private
     * @param {obj} touch Gesture touch object (an object containing  information about a single position of a single finger).
     * @param {string} tlType The tealeaf name of the element.
     * @return Array A cleaned touchPosition array.
     */
    function cleanGestureQueueEvent(touch, tlType) {

        //Delete relXY for radio buttons.
        if (tlType === "radioButton") {
            delete touch.control.position.relXY;
        }
        //Delete the element name from the touch position if name does not exist.
        if (touch.control.name === null || touch.control.name === undefined || touch.control.name === "") {
            delete touch.control.name;
        }
        //Delete the element subType from the touch position if subType does not exist.
        if (touch.control.subType === null || touch.control.subType === undefined || touch.control.subType === "") {
            delete touch.control.subType;
        }
    }

    /**
     * Creates a gesture queue event with the specified options.
     * @private
     * @param {obj} options Includes the data that will be used to create the gesture queue event.
     * @return Object A gesture queue event.

Queue Event JSON Schema

{
    "$ref" : "MessageHeader",
    "event": {
        "description": "Event from control",
        "type": "object",
        "properties": {
            "tlEvent": {
                "title": "Tealeaf type of event",
                "type": "string",
                "required": true
            },
            "type": {
                "title": "Type of event framework reports",
                "type": "string",
                "required": false
            }
        }
    },
    "touches": {
        "description": "Gestures touch objects per finger.",
        "type": "array",
        "required": true
        "items": {
                "description": "Touch objects per finger starting with intial and ends with last object when finger is lifted from device.",
                "type": "array",
                "required": true,
                "$ref": "Touch"
            }
        }
    },
    "direction": {
        "title": "The direction of the swipe which can be up, down. left or right.",
        "type": "string",
        "required": false
    },
    "velocityX": {
        "title": "The velocity of this measured in pixels per second along the x axis",
        "type": "float",
        "required": false
    },
    "velocityY": {
        "title": "The velocity of this measured in pixels per second along the y axis",
        "type": "float",
        "required": false
    }

     */
    function createGestureQueueEvent(options) {
        var control,
            tlEventType = getTlEvent(utils.getValue(options, "webEvent")),
            target = utils.getValue(options, "webEvent.gesture.srcEvent.target", document.body),
            tagName = utils.getTagName(target) || "body",
            elType = utils.getValue(target, "type", ""),
            tlType = tlTypes[tagName.toLowerCase() + ":" + elType.toLowerCase()] || tagName,
            eventSubtype = utils.getValue(options, "webEvent.target.subtype"),
            tlTouches = [],
            hammerTouches,
            hammerTouchesLocation,
            saveFirstTouch,
            addFirstTouch,
            screenWidth,
            screenHeight,
            i;

        //Screen width and height are not updated in landscape mode for iOS devices.
        if (utils.isiOS && utils.getOrientationMode(window.orientation) === "LANDSCAPE") {
            screenWidth = screen.height;
            screenHeight = screen.width;
        } else {
            screenWidth = screen.width;
            screenHeight = screen.height;
        }

        if (hammerVersion === "1") {
            hammerTouches = options.webEvent.gesture.touches;
            hammerTouchesLocation = "webEvent.gesture.touches.";
            saveFirstTouch = (tlEventType === "swipe" && !(prevGestureQueueEvent !== undefined && prevGestureQueueEvent.event.tlEvent === "swipe")) || (tlEventType === "pinch" && !(prevGestureQueueEvent !== undefined && prevGestureQueueEvent.event.tlEvent === "pinch"));
            addFirstTouch = tlEventType === "swipe" || tlEventType === "pinch";
        } else {
            hammerTouches = options.webEvent.gesture.pointers;
            hammerTouchesLocation = "webEvent.gesture.pointers.";
            saveFirstTouch = utils.getValue(options, "webEvent.gesture.firstOrLastSwipeEvent") === "first" || utils.getValue(options, "webEvent.gesture.firstOrLastPinchEvent") === "first";
            addFirstTouch = utils.getValue(options, "webEvent.gesture.firstOrLastSwipeEvent") === "last" || utils.getValue(options, "webEvent.gesture.firstOrLastPinchEvent") === "last";
        }
        //Cycle through all finger touches.
        for (i = 0; i < hammerTouches.length; i += 1) {
            //Add the final position of each finger. All gestures apply.
            tlTouches.push(
                [
                    {
                        position: {
                            y: utils.getValue(options, hammerTouchesLocation + i + ".pageY"),
                            x: utils.getValue(options, hammerTouchesLocation + i + ".pageX")
                        },
                        control: {
                            position: {
                                width: utils.getValue(options, hammerTouchesLocation + i + ".target.offsetWidth"),
                                height: utils.getValue(options, hammerTouchesLocation + i + ".target.offsetHeight"),
                                relXY: getRelativeXY(options.webEvent, utils.getValue(options, hammerTouchesLocation + i + ".pageX"), utils.getValue(options, hammerTouchesLocation + i + ".pageY")),
                                scrollX: document.documentElement.scrollLeft || document.body.scrollLeft,
                                scrollY: document.documentElement.scrollTop || document.body.scrollTop
                            },
                            id: utils.getValue(options, hammerTouchesLocation + i + ".target.id") || context.getXPathFromNode(utils.getValue(options, hammerTouchesLocation + i + ".target")),
                            idType: utils.getValue(options, "webEvent.gesture.idType"),
                            name: utils.getValue(options, hammerTouchesLocation + i + ".target.name"),
                            tlType: tlType,
                            type: tagName,
                            subType: elType
                        }
                    }
                ]
            );

            //Clean after adding a position of a finger
            cleanGestureQueueEvent(tlTouches[i][0], tlType);
        }

        //Save the first touches for pinch and swipe events.
        if (saveFirstTouch) {
            //Cycle through all finger touches.
            for (i = 0; i < hammerTouches.length; i += 1) {
                firstTouches.push(tlTouches[i][0]);
            }
        }

        //Add in the first touch for pinch and swipe events.
        if (addFirstTouch) {
            //Cycle through all finger touches.
            for (i = 0; i < hammerTouches.length; i += 1) {
                tlTouches[i].unshift(firstTouches[i]);
            }
        }

        //Build the control object
        control = {
            type: 11,
            event: {
                tlEvent: tlEventType,
                type: tagName
            },
            touches: tlTouches
        };

        //Handle Gestures with Velocity, currently just swipe
        if (tlEventType === "swipe") {
            control.velocityX = options.webEvent.gesture.velocityX;
            control.velocityY = options.webEvent.gesture.velocityY;
        }

        //Handle Gestures with Direction, currently swipe and pinch
        if (tlEventType === "swipe") {
            control.direction = options.webEvent.gesture.direction;
            //Hammer JS 2 supplies the directions as the numbers 2,4,8,16(left,right,up,down)
            if (control.direction === 2) {
                control.direction = "left";
            }
            if (control.direction === 4) {
                control.direction = "right";
            }
            if (control.direction === 8) {
                control.direction = "up";
            }
            if (control.direction === 16) {
                control.direction = "down";
            }
        }
        if (tlEventType === "pinch") {
            if (options.webEvent.gesture.scale > 1) {
                control.direction = "open";
            } else if (options.webEvent.gesture.scale < 1) {
                control.direction = "close";
            }
        }
        //Add the event subtype if it exists.
        if (eventSubtype !== undefined && eventSubtype !== null) {
            control.event.subType = eventSubtype;
        }

        return control;
    }

    /**
     * Handles the fired gesture event, except tap which gets handled specially in handleTap.
     * @private
     * @param {string} id ID of the target the event is fired on.
     * @param {obj} webEvent The event object.
     */
    function handleGesture(id, webEvent) {
        if (hammerVersion === "1") {
            //Immediately post a doubletap, tap, or hold event.
            if (webEvent.type === "doubletap" || webEvent.type === "hold" || webEvent.type === "tap") {
                postGestureEvent(createGestureQueueEvent({
                    webEvent: webEvent,
                    id: id,
                    currState: utils.getValue(webEvent, "target.state")
                }));
            } else if (webEvent.type === "release" && prevGestureQueueEvent !== undefined && (prevGestureQueueEvent.event.tlEvent === "swipe" || prevGestureQueueEvent.event.tlEvent === "pinch")) {
                //If a release is fired after a pinch/swipe post that pinch/swipe since it is the final pinch/swipe. The logic to store the first pinch/touch is included in createGestureQueueEvent.
                postGestureEvent(prevGestureQueueEvent);
                //Reset the previous gesture event after posting it.
                prevGestureQueueEvent = undefined;
                //Reset firstTouches used in createGestureQueueEvent
                firstTouches = [];
            } else if (webEvent.type === "drag" || webEvent.type === "pinch") {
                //Store an event to be posted later. Note that webEvent.type === "drag" is the tlEvent swipe.
                prevGestureQueueEvent = createGestureQueueEvent({
                    webEvent: webEvent,
                    id: id,
                    currState: utils.getValue(webEvent, "target.state")
                });
            }
        } else {
            //Immediately post a doubletap, tap, or hold event.
            if (webEvent.type === "doubletap" || webEvent.type === "tapHold" || webEvent.type === "tap") {
                postGestureEvent(createGestureQueueEvent({
                    webEvent: webEvent,
                    id: id,
                    currState: utils.getValue(webEvent, "target.state")
                }));
            } else if (webEvent.gesture.firstOrLastSwipeEvent === "last" || webEvent.gesture.firstOrLastPinchEvent === "last") {
                postGestureEvent(createGestureQueueEvent({
                    webEvent: webEvent,
                    id: id,
                    currState: utils.getValue(webEvent, "target.state")
                }));
                //Reset firstTouches used in createGestureQueueEvent
                firstTouches = [];
            } else if (webEvent.gesture.firstOrLastSwipeEvent === "first" || webEvent.gesture.firstOrLastPinchEvent === "first") {
                //The logic to store the first pinch/touch is included in createGestureQueueEvent.
                createGestureQueueEvent({
                    webEvent: webEvent,
                    id: id,
                    currState: utils.getValue(webEvent, "target.state")
                });
            }
        }
    }

    /**
     * Specially handles the tap gesture event
     * @private
     * @param {string} id ID of the target the event is fired on.
     * @param {obj} webEvent The event object.
     */
    function handleTap(id, webEvent) {
        var doubleTapInterval = gestureOptions.doubleTapInterval;

        //Increment the tap count as more taps happen
        tapCount += 1;

        if (tapCount === 1) {
            timer = setTimeout(function () {
                handleGesture(id, webEvent);
                //Reset the tap count after the specified delay
                tapCount = 0;
            }, doubleTapInterval);
        } else {
            clearTimeout(timer);
            //Change the tap into a doubletap
            webEvent.type = "doubletap";
            handleGesture(id, webEvent);
            //Reset the tap count after a doubletap
            tapCount = 0;
        }
    }

    /**
     * Specially handles the pinch and swipe gesture event
     * @private
     * @param {string} id ID of the target the event is fired on.
     * @param {obj} webEvent The event object.
     */
    function handlePinchAndSwipe(id, webEvent) {
        var swipeAfterPinchInterval = gestureOptions.swipeAfterPinchInterval;

        if (swipeOk && (webEvent.type === "swipe" || webEvent.type === "drag")) {
            handleGesture(id, webEvent);
        }

        if (webEvent.type === "pinch") {
            handleGesture(id, webEvent);
            //Do not capture swipe events immediately after a pinch
            swipeOk = false;
            timer = setTimeout(function () {
                //Allow swipe events after the timeout
                swipeOk = true;
            }, swipeAfterPinchInterval);
        }
    }

    function createEvent(eventData) {
        var webEvent;
        if (document.createEvent) {
            webEvent = document.createEvent("HTMLEvents");
            //the arguments are event name, bubbles, cancelable
            webEvent.initEvent(eventData.type, true, true);
            webEvent.gesture = eventData;
        } else {
            webEvent = document.createEventObject();
            webEvent.eventType = eventData.type;
            webEvent.gesture = eventData;
        }
        return webEvent;
    }

    function callEvent(ev, target) {
        if (target === undefined) {
            return;
        }
        if (document.createEvent) {
            target.dispatchEvent(ev);
        } else {
            target.fireEvent("on" + ev.eventType, ev);
        }
    }

    function callTealeafEvent(eventData) {
        var eventName = eventData.type,
            target = eventData.target;

        if (eventName === "tap") {
            callEvent(createEvent(eventData), target);
            startEventTarget = undefined;
        } else if (eventName === "press") {
            //the tealeaf event tapHold is called press in hammer.js 2.0 
            eventData.type = "tapHold";
            callEvent(createEvent(eventData), target);
            startEventTarget = undefined;
        } else if (eventName === "panstart") {
            //the tealeaf event swipe is called pan in hammer.js 2.0
            eventData.type = "swipe";
            //Save the fact this is the first swipe event since the data is lost when panstart is renamed to swipe
            eventData.firstOrLastSwipeEvent = "first";
            callEvent(createEvent(eventData), target);
            startEventTarget = target;
        } else if (eventName === "panend") {
            //the tealeaf event swipe is called pan in hammer.js 2.0
            eventData.type = "swipe";
            //Save the fact this is the last swipe event since the data is lost when panend is renamed to swipe
            eventData.firstOrLastSwipeEvent = "last";
            //Use the target of the panstart as the panend target could be different
            callEvent(createEvent(eventData), startEventTarget);
            startEventTarget = undefined;
        } else if (eventName === "pinchstart") {
            eventData.type = "pinch";
            //Save the fact this is the last pinch event since the data is lost when pinchstart is renamed to pinch
            eventData.firstOrLastPinchEvent = "first";
            callEvent(createEvent(eventData), target);
            startEventTarget = target;
        } else if (eventName === "pinchend") {
            eventData.type = "pinch";
            //Save the fact this is the last pinch event since the data is lost when pinchend is renamed to pinch
            eventData.firstOrLastPinchEvent = "last";
            //Use the target of the pinchstart as the pinchend target could be different
            callEvent(createEvent(eventData), startEventTarget);
            startEventTarget = undefined;
        }
    }

    // Return the module's interface object. This contains callback functions which
    // will be invoked by the UIC core.
    return {
        init: function () {
            var cssSelectors,
                cssSelectorArray,
                elements = [],
                gestureEvents = TLT.getCoreConfig().modules.gestures.events,
                elementPosition,
                eventsToEnable = "",
                hammertime,
                eventName,
                counter = 0,
                j,
                k;

            //Check hammer.js is available and check the version
            if (typeof Hammer === "function") {
                //Set the hammer version to the major version number to easily compare between Hammer.js 1.x.x and 2.x.x
                hammerVersion = Hammer.VERSION.split(".")[0];
            } else {
                return;
            }

            if (hammerVersion === "1") {
                //Set hammer default options so that default behaviors are not prevented
                Hammer.defaults.behavior.userSelect = "auto";
                Hammer.defaults.behavior.userDrag = "auto";
                Hammer.defaults.behavior.contentZooming = "auto";
                Hammer.defaults.behavior.touchCallout = "default";
                Hammer.defaults.behavior.touchAction = "auto";
            }

            if (context.getConfig()) {
                if (context.getConfig().options) {
                    //Add the user specified gesture options to gestureOptions, overriding the default options if there is a conflict
                    utils.extend(true, gestureOptions, context.getConfig().options);
                }
            }

            //Build the element array. This is to avoid creating multiple hammertimes for an element.
            //Iterate over all of the gesture events specified in the user configuration
            for (i = 0; i < gestureEvents.length; i += 1) {
                eventName = gestureEvents[i].name;
                //Add the events that are configured to eventsToEnable so the proper events are enabled when Hammer2 is enabled
                if (eventName === "tap") {
                    eventsToEnable += "tap ";
                }
                if (eventName === "swipe") {
                    eventsToEnable += "panstart panend ";
                }
                if (eventName === "tapHold") {
                    eventsToEnable += "press ";
                }
                if (eventName === "pinch") {
                    eventsToEnable += "pinchstart pinchend";
                }
                //Set the css selectors that will determine what elements hammertimes should be registered for
                cssSelectors = gestureEvents[i].target;
                //Check if Hammer is being enabled for the entire page
                if (cssSelectors === window || cssSelectors === "window") {
                    if (hammerVersion === "1") {
                        hammertimeArray.push(new Hammer(window, gestureOptions));
                    }
                } else {
                    if (cssSelectorArray !== undefined && cssSelectorArray !== null) {
                        //Separate each css selector
                        cssSelectorArray = cssSelectors.split(", ");
                        //iterate over all of the css selectors
                        for (j = 0; j < cssSelectorArray.length; j += 1) {
                            //Query for each element the css selector applies to
                            elements = TLT.getService('browser').queryAll(cssSelectorArray[j], document);
                            //Iterate over each element.
                            for (k = 0; k < elements.length; k += 1) {
                                elementPosition = utils.indexOf(elementArray, elements[k]);
                                //check if element is unique
                                if (elementPosition === -1) {
                                    //add element to the elementArray
                                    elementArray.push(elements[k]);
                                    counter += 1;
                                }
                            }
                        }
                    }
                }
            }
            //enable hammer js for the specified elements
            if (hammerVersion === "1") {
                for (i = 0; i < elementArray.length; i += 1) {
                    hammertimeArray.push(new Hammer(elementArray[i], gestureOptions));
                }
            } else {
                if (elementArray.length !== 0) {
                    for (i = 0; i < elementArray.length; i += 1) {
                        hammertime = new Hammer.Manager(elementArray[i]);
                        hammertime.add(new Hammer.Tap({event: 'tap'}));
                        hammertime.add(new Hammer.Pan({direction: Hammer.DIRECTION_ALL}));
                        hammertime.add(new Hammer.Press());
                        hammertime.add(new Hammer.Pinch({enable: true}));
                        hammertime.on(eventsToEnable, function hammertimeOnCallback(eventData) {
                            if ((eventData.type === "panend" || eventData.type === "pinchend") && elementArray.indexOf(startEventTarget) > -1) {
                                //a pan or pinch might start on a element that is being captured and end on a element that is not being captured
                                callTealeafEvent(eventData);
                            } else if (elementArray.indexOf(eventData.target) > -1) {
                                //hammer.js 2.0 no longer relies on firing it's own gesture events like in hammer.js 1.0. Because of this an event should be created and fired.
                                callTealeafEvent(eventData);
                            }
                        });
                        hammertimeArray.push(hammertime);
                    }
                } else {
                    if (window.style === undefined) {
                        //hammerjs expects a style property
                        window.style = [];
                    }
                    hammertime = new Hammer.Manager(window);
                    hammertime.add(new Hammer.Tap({event: 'tap'}));
                    hammertime.add(new Hammer.Pan({direction: Hammer.DIRECTION_ALL}));
                    hammertime.add(new Hammer.Press());
                    hammertime.add(new Hammer.Pinch({enable: true}));
                    hammertime.on(eventsToEnable, function hammertimeOnCallback(eventData) {
                        callTealeafEvent(eventData);
                    });
                    hammertimeArray.push(hammertime);
                }
            }
        },
        destroy: function () {
            //Turn off all the hammertimes
            if (hammertimeArray !== undefined && hammertimeArray !== null) {
                for (i = 0; i < hammertimeArray.length; i += 1) {
                    hammertimeArray[i].off("tap press pinchstart pinchend panstart panend");
                    hammertimeArray[i].enabled = false;
                }
            }
            //Reset the hammertime and element arrays
            hammertimeArray = [];
            elementArray = [];
        },
        onevent: function (webEvent) {
            var id = null,
                position;

            // Sanity checks
            if (typeof webEvent !== "object" || !webEvent.type || !webEvent.gesture || !webEvent.target) {
                return;
            }
            //Find the position of the element in elementArray to find the corresponding gesture option object
            position = utils.indexOf(elementArray, webEvent.target.element);
            if (webEvent.gesture.pointerType === "mouse" && gestureOptions.preventMouse) {
                return;
            }

            id = utils.getValue(webEvent, "target.id");

            switch (webEvent.type) {
            case "tap":
                handleTap(id, webEvent);
                break;
            case "swipe":
                handlePinchAndSwipe(id, webEvent);
                break;
            case "pinch":
                handlePinchAndSwipe(id, webEvent);
                break;
            case "tapHold":
                handleGesture(id, webEvent);
                break;
            case "hold":
                handleGesture(id, webEvent);
                break;
            case "drag":
                handlePinchAndSwipe(id, webEvent);
                break;
            case "release":
                handleGesture(id, webEvent);
                break;
            }
        }
    };

});

// end gestures

// Default configuration
(function () {
    "use strict";
        // TLT is expected to be defined in the global scope i.e. window.TLT
    var TLT = window.TLT,
        /**
         * Due to issue with lack of change event propagation on legacy IE (W3C version of UIC)
         * its mandatory to provide more specific configuration on IE6, IE7, IE8 and IE9 in legacy
         * compatibility mode. For other browsers changeTarget can remain undefined as it is
         * sufficient to listen to the change event at the document level.
         */
        changeTarget;

    if (TLT.getFlavor() === "w3c" && TLT.utils.isLegacyIE) {
        changeTarget = "input, select, textarea, button";
    }


	/**
	 * Licensed Materials - Property of IBM
	 * © Copyright IBM Corp. 2017
	 * US Government Users Restricted Rights - Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
	 */

	/**
	 * @fileOverview The Gesture module implements the logic for capturing Hammer.js gesture events.
	 * @version 5.3.0.1788
	 * @exports gesture
	 */

	/*global TLT:true */
	/*global Hammer:true */

	TLT.addModule("gestures", function (context) {
		"use strict";

		var tlTypes = {
				"input:radio": "radioButton",
				"input:checkbox": "checkBox",
				"input:text": "textBox",
				"input:password": "textBox",
				"input:file": "fileInput",
				"input:button": "button",
				"input:submit": "submitButton",
				"input:reset": "resetButton",
				"input:image": "image",
				"input:color": "color",
				"input:date": "date",
				"input:datetime": "datetime",
				"input:datetime-local": "datetime-local",
				"input:number": "number",
				"input:email": "email",
				"input:tel": "tel",
				"input:search": "search",
				"input:url": "url",
				"input:time": "time",
				"input:week": "week",
				"input:month": "month",
				"textarea:": "textBox",
				"select:": "selectList",
				"select:select-one": "selectList",
				"button:": "button",
				"a:": "link"
			},
			utils = context.utils,
			firstTouches = [],
			tapCount = 0,
			swipeOk = true,
			timer,
			gestureOptions = {
				swipeAfterPinchInterval: 300,
				doubleTapInterval: 300,
				preventMouse: true,
				dragMinDistance: 10
			},
			hammertimeArray = [],
			elementArray = [],
			prevGestureQueueEvent,
			hammerVersion,
			startEventTarget,
			i;

		/**
		 * Posts Gesture Event to Queue
		 * @private
		 * @param {object} queueEvent A queueEvent created with createGestureQueueEvent.
		 * @return {void}
		 */
		function postGestureEvent(queueEvent) {
			context.post(queueEvent);
		}

		/**
		 * Get tlEvent from webEvent.
		 * @private
		 * @param {object} webEvent A webEvent with properties a type 11 object that is a control.
		 * @return {string} tlEvent.
		 */
		function getTlEvent(webEvent) {
			var tlEvent;

			//We consider the Hammer.js event named "drag" a swipe. We currently do not support the Hammer.js event named "swipe".
			if (webEvent.type === "drag") {
				tlEvent = "swipe";
			//We consider the Hammer.js event named "hold" a tapHold. There is no Hammer.js event called "tapHold".
			} else if (webEvent.type === "hold") {
				tlEvent = "tapHold";
			} else {
				tlEvent = webEvent.type;
			}

			if (typeof tlEvent === "string") {
				tlEvent = tlEvent.toLowerCase();
			} else {
				tlEvent = "unknown";
			}

			return tlEvent;
		}
		/**
		 * Gets the top left X & Y values of a webEvent target.
		 * @private
		 * @param {WebEvent} webEvent Normalized browser event
		 * @return value of top left X & Y
		 */
		function getElementTopLeft(webEvent) {
			var target = webEvent.gesture.srcEvent.target,
				topLeftY = 0,
				topLeftX = 0;
			while (target && target.tagName !== "BODY") {
				topLeftY += target.offsetTop;
				topLeftX += target.offsetLeft;
				target = target.offsetParent;
			}
			return { topLeftX: topLeftX, topLeftY: topLeftY };
		}

		/**
		 * Gets the relative X & Y values to a webEvent.
		 * @private
		 * @param {WebEvent} webEvent Normalized browser event
		 * @return String value of relative X & Y
		 */
		function getRelativeXY(webEvent, touchX, touchY) {
			var elementX = getElementTopLeft(webEvent).topLeftX,
				elementY = getElementTopLeft(webEvent).topLeftY,
				width = webEvent.gesture.srcEvent.target.offsetWidth,
				height = webEvent.gesture.srcEvent.target.offsetHeight,
				relX = Math.abs((touchX - elementX) / width).toFixed(1),
				relY = Math.abs((touchY - elementY) / height).toFixed(1);

			relX = relX > 1 || relX < 0 ? 0.5 : relX;
			relY = relY > 1 || relY < 0 ? 0.5 : relY;

			return relX + "," + relY;
		}

		/**
		 * Cleans a gesture touch by removing fields if they do not exist, are null, or otherwise should not be included. Works by cleaning the first object in the sent array.
		 * @private
		 * @param {obj} touch Gesture touch object (an object containing  information about a single position of a single finger).
		 * @param {string} tlType The tealeaf name of the element.
		 * @return Array A cleaned touchPosition array.
		 */
		function cleanGestureQueueEvent(touch, tlType) {

			//Delete relXY for radio buttons.
			if (tlType === "radioButton") {
				delete touch.control.position.relXY;
			}
			//Delete the element name from the touch position if name does not exist.
			if (touch.control.name === null || touch.control.name === undefined || touch.control.name === "") {
				delete touch.control.name;
			}
			//Delete the element subType from the touch position if subType does not exist.
			if (touch.control.subType === null || touch.control.subType === undefined || touch.control.subType === "") {
				delete touch.control.subType;
			}
		}

		/**
		 * Creates a gesture queue event with the specified options.
		 * @private
		 * @param {obj} options Includes the data that will be used to create the gesture queue event.
		 * @return Object A gesture queue event.

	Queue Event JSON Schema

	{
		"$ref" : "MessageHeader",
		"event": {
			"description": "Event from control",
			"type": "object",
			"properties": {
				"tlEvent": {
					"title": "Tealeaf type of event",
					"type": "string",
					"required": true
				},
				"type": {
					"title": "Type of event framework reports",
					"type": "string",
					"required": false
				}
			}
		},
		"touches": {
			"description": "Gestures touch objects per finger.",
			"type": "array",
			"required": true
			"items": {
					"description": "Touch objects per finger starting with intial and ends with last object when finger is lifted from device.",
					"type": "array",
					"required": true,
					"$ref": "Touch"
				}
			}
		},
		"direction": {
			"title": "The direction of the swipe which can be up, down. left or right.",
			"type": "string",
			"required": false
		},
		"velocityX": {
			"title": "The velocity of this measured in pixels per second along the x axis",
			"type": "float",
			"required": false
		},
		"velocityY": {
			"title": "The velocity of this measured in pixels per second along the y axis",
			"type": "float",
			"required": false
		}

		 */
		function createGestureQueueEvent(options) {
			var control,
				tlEventType = getTlEvent(utils.getValue(options, "webEvent")),
				target = utils.getValue(options, "webEvent.gesture.srcEvent.target", document.body),
				tagName = utils.getTagName(target) || "body",
				elType = utils.getValue(target, "type", ""),
				tlType = tlTypes[tagName.toLowerCase() + ":" + elType.toLowerCase()] || tagName,
				eventSubtype = utils.getValue(options, "webEvent.target.subtype"),
				tlTouches = [],
				hammerTouches,
				hammerTouchesLocation,
				saveFirstTouch,
				addFirstTouch,
				screenWidth,
				screenHeight,
				i;

			//Screen width and height are not updated in landscape mode for iOS devices.
			if (utils.isiOS && utils.getOrientationMode(window.orientation) === "LANDSCAPE") {
				screenWidth = screen.height;
				screenHeight = screen.width;
			} else {
				screenWidth = screen.width;
				screenHeight = screen.height;
			}

			if (hammerVersion === "1") {
				hammerTouches = options.webEvent.gesture.touches;
				hammerTouchesLocation = "webEvent.gesture.touches.";
				saveFirstTouch = (tlEventType === "swipe" && !(prevGestureQueueEvent !== undefined && prevGestureQueueEvent.event.tlEvent === "swipe")) || (tlEventType === "pinch" && !(prevGestureQueueEvent !== undefined && prevGestureQueueEvent.event.tlEvent === "pinch"));
				addFirstTouch = tlEventType === "swipe" || tlEventType === "pinch";
			} else {
				hammerTouches = options.webEvent.gesture.pointers;
				hammerTouchesLocation = "webEvent.gesture.pointers.";
				saveFirstTouch = utils.getValue(options, "webEvent.gesture.firstOrLastSwipeEvent") === "first" || utils.getValue(options, "webEvent.gesture.firstOrLastPinchEvent") === "first";
				addFirstTouch = utils.getValue(options, "webEvent.gesture.firstOrLastSwipeEvent") === "last" || utils.getValue(options, "webEvent.gesture.firstOrLastPinchEvent") === "last";
			}
			//Cycle through all finger touches.
			for (i = 0; i < hammerTouches.length; i += 1) {
				//Add the final position of each finger. All gestures apply.
				tlTouches.push(
					[
						{
							position: {
								y: utils.getValue(options, hammerTouchesLocation + i + ".pageY"),
								x: utils.getValue(options, hammerTouchesLocation + i + ".pageX")
							},
							control: {
								position: {
									width: utils.getValue(options, hammerTouchesLocation + i + ".target.offsetWidth"),
									height: utils.getValue(options, hammerTouchesLocation + i + ".target.offsetHeight"),
									relXY: getRelativeXY(options.webEvent, utils.getValue(options, hammerTouchesLocation + i + ".pageX"), utils.getValue(options, hammerTouchesLocation + i + ".pageY")),
									scrollX: document.documentElement.scrollLeft || document.body.scrollLeft,
									scrollY: document.documentElement.scrollTop || document.body.scrollTop
								},
								id: utils.getValue(options, hammerTouchesLocation + i + ".target.id") || context.getXPathFromNode(utils.getValue(options, hammerTouchesLocation + i + ".target")),
								idType: utils.getValue(options, "webEvent.gesture.idType"),
								name: utils.getValue(options, hammerTouchesLocation + i + ".target.name"),
								tlType: tlType,
								type: tagName,
								subType: elType
							}
						}
					]
				);

				//Clean after adding a position of a finger
				cleanGestureQueueEvent(tlTouches[i][0], tlType);
			}

			//Save the first touches for pinch and swipe events.
			if (saveFirstTouch) {
				//Cycle through all finger touches.
				for (i = 0; i < hammerTouches.length; i += 1) {
					firstTouches.push(tlTouches[i][0]);
				}
			}

			//Add in the first touch for pinch and swipe events.
			if (addFirstTouch) {
				//Cycle through all finger touches.
				for (i = 0; i < hammerTouches.length; i += 1) {
					tlTouches[i].unshift(firstTouches[i]);
				}
			}

			//Build the control object
			control = {
				type: 11,
				event: {
					tlEvent: tlEventType,
					type: tagName
				},
				touches: tlTouches
			};

			//Handle Gestures with Velocity, currently just swipe
			if (tlEventType === "swipe") {
				control.velocityX = options.webEvent.gesture.velocityX;
				control.velocityY = options.webEvent.gesture.velocityY;
			}

			//Handle Gestures with Direction, currently swipe and pinch
			if (tlEventType === "swipe") {
				control.direction = options.webEvent.gesture.direction;
				//Hammer JS 2 supplies the directions as the numbers 2,4,8,16(left,right,up,down)
				if (control.direction === 2) {
					control.direction = "left";
				}
				if (control.direction === 4) {
					control.direction = "right";
				}
				if (control.direction === 8) {
					control.direction = "up";
				}
				if (control.direction === 16) {
					control.direction = "down";
				}
			}
			if (tlEventType === "pinch") {
				if (options.webEvent.gesture.scale > 1) {
					control.direction = "open";
				} else if (options.webEvent.gesture.scale < 1) {
					control.direction = "close";
				}
			}
			//Add the event subtype if it exists.
			if (eventSubtype !== undefined && eventSubtype !== null) {
				control.event.subType = eventSubtype;
			}

			return control;
		}

		/**
		 * Handles the fired gesture event, except tap which gets handled specially in handleTap.
		 * @private
		 * @param {string} id ID of the target the event is fired on.
		 * @param {obj} webEvent The event object.
		 */
		function handleGesture(id, webEvent) {
			if (hammerVersion === "1") {
				//Immediately post a doubletap, tap, or hold event.
				if (webEvent.type === "doubletap" || webEvent.type === "hold" || webEvent.type === "tap") {
					postGestureEvent(createGestureQueueEvent({
						webEvent: webEvent,
						id: id,
						currState: utils.getValue(webEvent, "target.state")
					}));
				} else if (webEvent.type === "release" && prevGestureQueueEvent !== undefined && (prevGestureQueueEvent.event.tlEvent === "swipe" || prevGestureQueueEvent.event.tlEvent === "pinch")) {
					//If a release is fired after a pinch/swipe post that pinch/swipe since it is the final pinch/swipe. The logic to store the first pinch/touch is included in createGestureQueueEvent.
					postGestureEvent(prevGestureQueueEvent);
					//Reset the previous gesture event after posting it.
					prevGestureQueueEvent = undefined;
					//Reset firstTouches used in createGestureQueueEvent
					firstTouches = [];
				} else if (webEvent.type === "drag" || webEvent.type === "pinch") {
					//Store an event to be posted later. Note that webEvent.type === "drag" is the tlEvent swipe.
					prevGestureQueueEvent = createGestureQueueEvent({
						webEvent: webEvent,
						id: id,
						currState: utils.getValue(webEvent, "target.state")
					});
				}
			} else {
				//Immediately post a doubletap, tap, or hold event.
				if (webEvent.type === "doubletap" || webEvent.type === "tapHold" || webEvent.type === "tap") {
					postGestureEvent(createGestureQueueEvent({
						webEvent: webEvent,
						id: id,
						currState: utils.getValue(webEvent, "target.state")
					}));
				} else if (webEvent.gesture.firstOrLastSwipeEvent === "last" || webEvent.gesture.firstOrLastPinchEvent === "last") {
					postGestureEvent(createGestureQueueEvent({
						webEvent: webEvent,
						id: id,
						currState: utils.getValue(webEvent, "target.state")
					}));
					//Reset firstTouches used in createGestureQueueEvent
					firstTouches = [];
				} else if (webEvent.gesture.firstOrLastSwipeEvent === "first" || webEvent.gesture.firstOrLastPinchEvent === "first") {
					//The logic to store the first pinch/touch is included in createGestureQueueEvent.
					createGestureQueueEvent({
						webEvent: webEvent,
						id: id,
						currState: utils.getValue(webEvent, "target.state")
					});
				}
			}
		}

		/**
		 * Specially handles the tap gesture event
		 * @private
		 * @param {string} id ID of the target the event is fired on.
		 * @param {obj} webEvent The event object.
		 */
		function handleTap(id, webEvent) {
			var doubleTapInterval = gestureOptions.doubleTapInterval;

			//Increment the tap count as more taps happen
			tapCount += 1;

			if (tapCount === 1) {
				timer = setTimeout(function () {
					handleGesture(id, webEvent);
					//Reset the tap count after the specified delay
					tapCount = 0;
				}, doubleTapInterval);
			} else {
				clearTimeout(timer);
				//Change the tap into a doubletap
				webEvent.type = "doubletap";
				handleGesture(id, webEvent);
				//Reset the tap count after a doubletap
				tapCount = 0;
			}
		}

		/**
		 * Specially handles the pinch and swipe gesture event
		 * @private
		 * @param {string} id ID of the target the event is fired on.
		 * @param {obj} webEvent The event object.
		 */
		function handlePinchAndSwipe(id, webEvent) {
			var swipeAfterPinchInterval = gestureOptions.swipeAfterPinchInterval;

			if (swipeOk && (webEvent.type === "swipe" || webEvent.type === "drag")) {
				handleGesture(id, webEvent);
			}

			if (webEvent.type === "pinch") {
				handleGesture(id, webEvent);
				//Do not capture swipe events immediately after a pinch
				swipeOk = false;
				timer = setTimeout(function () {
					//Allow swipe events after the timeout
					swipeOk = true;
				}, swipeAfterPinchInterval);
			}
		}

		function createEvent(eventData) {
			var webEvent;
			if (document.createEvent) {
				webEvent = document.createEvent("HTMLEvents");
				//the arguments are event name, bubbles, cancelable
				webEvent.initEvent(eventData.type, true, true);
				webEvent.gesture = eventData;
			} else {
				webEvent = document.createEventObject();
				webEvent.eventType = eventData.type;
				webEvent.gesture = eventData;
			}
			return webEvent;
		}

		function callEvent(ev, target) {
			if (target === undefined) {
				return;
			}
			if (document.createEvent) {
				target.dispatchEvent(ev);
			} else {
				target.fireEvent("on" + ev.eventType, ev);
			}
		}

		function callTealeafEvent(eventData) {
			var eventName = eventData.type,
				target = eventData.target;

			if (eventName === "tap") {
				callEvent(createEvent(eventData), target);
				startEventTarget = undefined;
			} else if (eventName === "press") {
				//the tealeaf event tapHold is called press in hammer.js 2.0 
				eventData.type = "tapHold";
				callEvent(createEvent(eventData), target);
				startEventTarget = undefined;
			} else if (eventName === "panstart") {
				//the tealeaf event swipe is called pan in hammer.js 2.0
				eventData.type = "swipe";
				//Save the fact this is the first swipe event since the data is lost when panstart is renamed to swipe
				eventData.firstOrLastSwipeEvent = "first";
				callEvent(createEvent(eventData), target);
				startEventTarget = target;
			} else if (eventName === "panend") {
				//the tealeaf event swipe is called pan in hammer.js 2.0
				eventData.type = "swipe";
				//Save the fact this is the last swipe event since the data is lost when panend is renamed to swipe
				eventData.firstOrLastSwipeEvent = "last";
				//Use the target of the panstart as the panend target could be different
				callEvent(createEvent(eventData), startEventTarget);
				startEventTarget = undefined;
			} else if (eventName === "pinchstart") {
				eventData.type = "pinch";
				//Save the fact this is the last pinch event since the data is lost when pinchstart is renamed to pinch
				eventData.firstOrLastPinchEvent = "first";
				callEvent(createEvent(eventData), target);
				startEventTarget = target;
			} else if (eventName === "pinchend") {
				eventData.type = "pinch";
				//Save the fact this is the last pinch event since the data is lost when pinchend is renamed to pinch
				eventData.firstOrLastPinchEvent = "last";
				//Use the target of the pinchstart as the pinchend target could be different
				callEvent(createEvent(eventData), startEventTarget);
				startEventTarget = undefined;
			}
		}

		// Return the module's interface object. This contains callback functions which
		// will be invoked by the UIC core.
		return {
			init: function () {
				var cssSelectors,
					cssSelectorArray,
					elements = [],
					gestureEvents = TLT.getCoreConfig().modules.gestures.events,
					elementPosition,
					eventsToEnable = "",
					hammertime,
					eventName,
					counter = 0,
					j,
					k;

				//Check hammer.js is available and check the version
				if (typeof Hammer === "function") {
					//Set the hammer version to the major version number to easily compare between Hammer.js 1.x.x and 2.x.x
					hammerVersion = Hammer.VERSION.split(".")[0];
				} else {
					return;
				}

				if (hammerVersion === "1") {
					//Set hammer default options so that default behaviors are not prevented
					Hammer.defaults.behavior.userSelect = "auto";
					Hammer.defaults.behavior.userDrag = "auto";
					Hammer.defaults.behavior.contentZooming = "auto";
					Hammer.defaults.behavior.touchCallout = "default";
					Hammer.defaults.behavior.touchAction = "auto";
				}

				if (context.getConfig()) {
					if (context.getConfig().options) {
						//Add the user specified gesture options to gestureOptions, overriding the default options if there is a conflict
						utils.extend(true, gestureOptions, context.getConfig().options);
					}
				}

				//Build the element array. This is to avoid creating multiple hammertimes for an element.
				//Iterate over all of the gesture events specified in the user configuration
				for (i = 0; i < gestureEvents.length; i += 1) {
					eventName = gestureEvents[i].name;
					//Add the events that are configured to eventsToEnable so the proper events are enabled when Hammer2 is enabled
					if (eventName === "tap") {
						eventsToEnable += "tap ";
					}
					if (eventName === "swipe") {
						eventsToEnable += "panstart panend ";
					}
					if (eventName === "tapHold") {
						eventsToEnable += "press ";
					}
					if (eventName === "pinch") {
						eventsToEnable += "pinchstart pinchend";
					}
					//Set the css selectors that will determine what elements hammertimes should be registered for
					cssSelectors = gestureEvents[i].target;
					//Check if Hammer is being enabled for the entire page
					if (cssSelectors === window || cssSelectors === "window") {
						if (hammerVersion === "1") {
							hammertimeArray.push(new Hammer(window, gestureOptions));
						}
					} else {
						if (cssSelectorArray !== undefined && cssSelectorArray !== null) {
							//Separate each css selector
							cssSelectorArray = cssSelectors.split(", ");
							//iterate over all of the css selectors
							for (j = 0; j < cssSelectorArray.length; j += 1) {
								//Query for each element the css selector applies to
								elements = TLT.getService('browser').queryAll(cssSelectorArray[j], document);
								//Iterate over each element.
								for (k = 0; k < elements.length; k += 1) {
									elementPosition = utils.indexOf(elementArray, elements[k]);
									//check if element is unique
									if (elementPosition === -1) {
										//add element to the elementArray
										elementArray.push(elements[k]);
										counter += 1;
									}
								}
							}
						}
					}
				}
				//enable hammer js for the specified elements
				if (hammerVersion === "1") {
					for (i = 0; i < elementArray.length; i += 1) {
						hammertimeArray.push(new Hammer(elementArray[i], gestureOptions));
					}
				} else {
					if (elementArray.length !== 0) {
						for (i = 0; i < elementArray.length; i += 1) {
							hammertime = new Hammer.Manager(elementArray[i]);
							hammertime.add(new Hammer.Tap({event: 'tap'}));
							hammertime.add(new Hammer.Pan({direction: Hammer.DIRECTION_ALL}));
							hammertime.add(new Hammer.Press());
							hammertime.add(new Hammer.Pinch({enable: true}));
							hammertime.on(eventsToEnable, function hammertimeOnCallback(eventData) {
								if ((eventData.type === "panend" || eventData.type === "pinchend") && elementArray.indexOf(startEventTarget) > -1) {
									//a pan or pinch might start on a element that is being captured and end on a element that is not being captured
									callTealeafEvent(eventData);
								} else if (elementArray.indexOf(eventData.target) > -1) {
									//hammer.js 2.0 no longer relies on firing it's own gesture events like in hammer.js 1.0. Because of this an event should be created and fired.
									callTealeafEvent(eventData);
								}
							});
							hammertimeArray.push(hammertime);
						}
					} else {
						if (window.style === undefined) {
							//hammerjs expects a style property
							window.style = [];
						}
						hammertime = new Hammer.Manager(window);
						hammertime.add(new Hammer.Tap({event: 'tap'}));
						hammertime.add(new Hammer.Pan({direction: Hammer.DIRECTION_ALL}));
						hammertime.add(new Hammer.Press());
						hammertime.add(new Hammer.Pinch({enable: true}));
						hammertime.on(eventsToEnable, function hammertimeOnCallback(eventData) {
							callTealeafEvent(eventData);
						});
						hammertimeArray.push(hammertime);
					}
				}
			},
			destroy: function () {
				//Turn off all the hammertimes
				if (hammertimeArray !== undefined && hammertimeArray !== null) {
					for (i = 0; i < hammertimeArray.length; i += 1) {
						hammertimeArray[i].off("tap press pinchstart pinchend panstart panend");
						hammertimeArray[i].enabled = false;
					}
				}
				//Reset the hammertime and element arrays
				hammertimeArray = [];
				elementArray = [];
			},
			onevent: function (webEvent) {
				var id = null,
					position;

				// Sanity checks
				if (typeof webEvent !== "object" || !webEvent.type || !webEvent.gesture || !webEvent.target) {
					return;
				}
				//Find the position of the element in elementArray to find the corresponding gesture option object
				position = utils.indexOf(elementArray, webEvent.target.element);
				if (webEvent.gesture.pointerType === "mouse" && gestureOptions.preventMouse) {
					return;
				}

				id = utils.getValue(webEvent, "target.id");

				switch (webEvent.type) {
				case "tap":
					handleTap(id, webEvent);
					break;
				case "swipe":
					handlePinchAndSwipe(id, webEvent);
					break;
				case "pinch":
					handlePinchAndSwipe(id, webEvent);
					break;
				case "tapHold":
					handleGesture(id, webEvent);
					break;
				case "hold":
					handleGesture(id, webEvent);
					break;
				case "drag":
					handlePinchAndSwipe(id, webEvent);
					break;
				case "release":
					handleGesture(id, webEvent);
					break;
				}
			}
		};

	});


    TLT.init({
        core: {
            // List of CSS selectors corresponding to elements for which no user interaction is to be reported.
            // WARNING: Since this list has to be evaluated for each event, specifying inefficient selectors can cause performance issues.
            blockedElements: [],

            // WARNING: For advanced users only. Modifying the modules section may lead to unexpected behavior and or performance issues.
            modules: {
                overstat: {
                    events: [
                        { name: "click", recurseFrames: true },
                        { name: "mousemove", recurseFrames: true },
                        { name: "mouseout", recurseFrames: true },
                        { name: "submit", recurseFrames: true }
                    ]
                },
                performance: {
                    events: [
                        { name: "load", target: window },
                        { name: "unload", target: window }
                    ]
                },
                replay: {
                    events: [
                        { name: "change", target: changeTarget, recurseFrames: true },
                        { name: "click", recurseFrames: true },
                        { name: "hashchange", target: window },
                        { name: "focus", target: "input, select, textarea, button", recurseFrames: true },
                        { name: "blur", target: "input, select, textarea, button", recurseFrames: true },
                        { name: "load", target: window},
                        { name: "unload", target: window},
                        { name: "resize", target: window},
                        { name: "scroll", target: window},
                        { name: "orientationchange", target: window},
                        { name: "touchend" },
                        { name: "touchstart" }
                    ]
                },
                gestures: {
            				events: [
            						{ name: "tap", target: window},
            						{ name: "hold", target: window},
            						{ name: "drag", target: window},
            						{ name: "pinch", target: window},
            						{ name: "release", target: window}
            				]
         				},
                TLCookie: {
                    enabled: true // xxx changed from false
                }
            },
            // Set the sessionDataEnabled flag to true only if it's OK to expose Tealeaf session data to 3rd party scripts.
            sessionDataEnabled: false,
            sessionData: {
                // Set this flag if the session value needs to be hashed to derive the Tealeaf session ID
                sessionValueNeedsHashing: true,

                // Specify sessionQueryName only if the session id is derived from a query parameter.
                sessionQueryName: "sessionID",
                sessionQueryDelim: ";",

                // sessionQueryName, if specified, takes precedence over sessionCookieName.
                sessionCookieName: "jsessionid"
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
                asyncReqOnUnload: false,
                useBeacon: true, // xxxx changed from false
                queues: [
                    {
                        qid: "DEFAULT",
                        endpoint: "//aucollector.tealeaf.ibmcloud.com/collector/collectorPost", // xxxx changed from TealeafTarget.php
                        maxEvents: 50,
                        timerInterval: 3000, // xxxx changed from 300000
                        maxSize: 0,
                        checkEndpoint: false,
                        endpointCheckTimeout: 3000
                    }
                ]
            },
            message: {
                privacy: [
                    {
                        targets: [
                            // CSS Selector: All password input fields
                            "input[type=password]"
                        ],
                        "maskType": 3
                    }
                ]
            },
            serializer: {
                json: {
                    defaultToBuiltin: true,
                    parsers: [ "JSON.parse" ],
                    stringifiers: [ "JSON.stringify" ]
                }
            },
            encoder: {
                gzip: {
                    /**
                     * The encode function should return encoded data in an object like this:
                     * {
                     *     buffer: "encoded data"
                     * }
                     */
                    encode: "window.pako.gzip",
                    defaultEncoding: "gzip"
                }
            },
            domCapture: {
                diffEnabled: true,
                // DOM Capture options
                options: {
                    maxMutations: 100,       // If this threshold is met or exceeded, a full DOM is captured instead of a diff.
                    maxLength: 1000000,      // If this threshold is exceeded, the snapshot will not be sent
                    captureFrames: true,     // Should child frames/iframes be captured
                    removeScripts: true      // Should script tags be removed from the captured snapshot
                }
            },
            browser: {
                useCapture: true,
                sizzleObject: "window.Sizzle", // xxxx was commented out before
                jQueryObject: "window.jQuery"
            }
        },
        modules: {
            overstat: {
                hoverThreshold: 1000
            },
            performance: {
                calculateRenderTime: true,
                renderTimeThreshold: 600000,
                filter: {
                    navigationStart: true,
                    unloadEventStart: true,
                    unloadEventEnd: true,
                    redirectStart: true,
                    redirectEnd: true,
                    fetchStart: true,
                    domainLookupStart: true,
                    domainLookupEnd: true,
                    connectStart: true,
                    connectEnd: true,
                    secureConnectionStart: true,
                    requestStart: true,
                    responseStart: true,
                    responseEnd: true,
                    domLoading: true,
                    domInteractive: true,
                    domContentLoadedEventStart: true,
                    domContentLoadedEventEnd: true,
                    domComplete: true,
                    loadEventStart: true,
                    loadEventEnd: true
                }
            },
            replay: {
                // Geolocation configuration
                geolocation: {
                    enabled: true, // xxxx changed from false
                    triggers: [
                        {
                            event: "load"
                        }
                    ]
                },
                // DOM Capture configuration
                domCapture: {
                    /**
                     * NOTE: Enabling DOM Capture has significant implications on data transmission and infrastructure.
                     * Hence this feature should be enabled judiciously. If enabled, it requires further configuration
                     * to only perform the DOM Capture based on specific events and elements. Please refer to the
                     * documentation for more details.
                     */
                    enabled: true, // xxxx changed from false
                    /**
                     * The rules for triggering DOM Snapshots are similar to the Privacy configuration.
                     * It accepts a mandatory "event" followed by one or more optional targets
                     * as well as an optional delay after which to take the DOM snapshot.
                     * 
                     * The default configuration below will capture a full DOM snapshot for each and every click, change
                     * action as well as for all screenview load and unloads. Please refer to the documentation for
                     * details on fine tuning this configuration to specific elements and screenviews.
                     */
                    triggers: [
                        {
                            event: "click"
                        },
                        {
                            event: "change"
                        },
                        {
                            event: "load"
                        },
                        {
                            event: "unload" // xxxx was commented out
                        }
                    ]
                }
            },
            gestures: {
        				options: {
            				doubleTapInterval: 300
        				}
    				},
            TLCookie: {
                appCookieWhitelist: [
                    { regex: ".*" }
                ],
                tlAppKey: "bdaf730b41b54acba9bf0eab7f9429a4" // xxxx had extra config sessionizationCookieName: "TLTSID"
            }
        }
    });
}());
