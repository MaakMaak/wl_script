// ==UserScript==
// @name Tidy up your Dashboard
// @namespace https://greasyfork.org/users/10154
// @grant none
// @run-at document-start
// @match https://www.warzone.com/*
// @description Tidy Up Your Dashboard is a Userscript which brings along a lot of features for improving the user experience on Warzone.
// @version 3.3.25
// @icon http://i.imgur.com/XzA5qMO.png
// @require https://code.jquery.com/jquery-1.11.2.min.js
// @require https://code.jquery.com/ui/1.11.3/jquery-ui.min.js
// @require https://cdn.bootcss.com/datatables/1.10.10/js/jquery.dataTables.min.js
// @require https://cdn.bootcss.com/datatables/1.10.10/js/dataTables.bootstrap.js
// @require https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.4/moment.min.js
// ==/UserScript==
window.timeUserscriptStart = new Date().getTime();
window.MULIS_USERSCRIPT = true;
var version = GM_info.script.version;
this.$$$ = jQuery.noConflict(true);
window.wlerror = function () {
};
setupImages();
console.log("Running Muli's userscript");
if (pageIsDashboard()) {
    createSelector(".container-fluid", "display: none");
    createSelector("body", "overflow: hidden")
}

setupDatabase();
log("indexedDB setup complete");

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    log("Readystate complete|interactive");

    DOM_ContentReady();
} else {
    window.document.addEventListener("DOMContentLoaded", DOM_ContentReady);
    log("Readystate loading")
}