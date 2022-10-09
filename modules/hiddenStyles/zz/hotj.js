

var syncStylesEl = document.createElement('style');
syncStylesEl.type = 'text/css';
document.head.insertBefore(syncStylesEl, document.head.children[0]);

var syncHotJarStylesTimeout;

function debouncedSyncHotJarStyles() {
    var later = function() {
        var styleNodes = [].slice.call(document.querySelectorAll('head [data-styled-components]'))
        if (!styleNodes.length) { return }
        var styles = styleNodes
        .map(({ sheet }) => [].slice.call(sheet.cssRules)
            .map(rule => rule.cssText)
            .join(' ')
        )
        .join(' ')
        syncStylesEl.textContent = styles;
    };
    clearTimeout(syncHotJarStylesTimeout);
    syncHotJarStylesTimeout = setTimeout(later, 1000);
};

var originalInsertRule = CSSStyleSheet.prototype.insertRule;
CSSStyleSheet.prototype.insertRule = function (style, index) {
    originalInsertRule.call(this, style, index);
    if (window.hj && window.hj.settings && window.hj.settings.record) {
        debouncedSyncHotJarStyles();
    }
}