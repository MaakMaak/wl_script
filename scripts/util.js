function domRefresh() {
    $("body").hide(0).show(0);
    $(window).trigger('resize')
}

function htmlEscape(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function hideTable(selector) {
    $(selector).closest("table").remove()
}

function browserIsFirefox() {
    return navigator.userAgent.toLowerCase().indexOf('firefox') > -1
}

function WLJSDefined() {
    return (typeof WLJSLoaded) != "undefined" && WLJSLoaded();
}

function setupImages() {
    window.IMAGES = {
        EYE: 'https://i.imgur.com/kekYrsO.png',
        CROSS: 'https://i.imgur.com/RItbpDS.png',
        QUESTION: 'https://i.imgur.com/TUyoZOP.png',
        PLUS: 'https://i.imgur.com/lT6SvSY.png',
        SAVE: 'https://i.imgur.com/Ze4h3NQ.png',
        FILTER: 'https://i.imgur.com/Q5Jq3EX.png?1',
        BOOKMARK: 'https://i.imgur.com/c6IxAql.png'

    }
}

Array.prototype.unique = function () {
    var n = {}, r = [];
    for (var i = 0; i < this.length; i++) {
        if (!n[this[i]]) {
            n[this[i]] = true;
            r.push(this[i]);
        }
    }
    return r;
};