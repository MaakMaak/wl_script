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

function createUJSMenu(title, className, cb) {
    $(".navbar-nav .nav-item:first").before(`
        <li class="nav-item dropdown ${className}">
            <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#">${title}</a>
            <div class="dropdown-menu p-0 br-3 ${className}-dropdown"></div>
        </li>`);
    if (typeof cb == "function") {
        $("." + className).on("click", cb)
    }
}

function createUJSSubMenu(parentClass, name, className) {
    $("." + parentClass).append(`
     <li class="dropdown-submenu" id="` + className + `">
        <a class="dropdown-toggle dropdown-item" data-toggle="dropdown" href="#" aria-expanded="true">` + name + `</a>
        <ul class="dropdown-menu ` + className + `" aria-labelledby="navbarDropdownMenuLink"></ul>

      </li>
    `)
}

function createUJSSubMenuEntry(parent, name, cb) {
    var entry = $('<li><a class="dropdown-item" href="#">' + name + '</a></li>');
    $("." + parent).append(entry);
    if (typeof cb == "function") {
        $(entry).on("click", cb)
    }
    return entry;
}