function setupWLError() {
    window.wlerror = window.onerror;
    window.onerror = windowError;
    window.timeDomContentReady = new Date().getTime();
    log("Time DOM content ready " + (timeDomContentReady - timeUserscriptStart) / 1000);
    log("DOM content ready");

    window.WLError = function (a, b) {
        logError(a);
        null == a && (a = "");
        console.log("WLError: " + a + ", silent=" + b);
        -1 != a.indexOf("NotAuth") ? location.reload() : -1 != a.indexOf("WarLight Server returned CouldNotConnect") ? CNCDialog() : -1 == a.indexOf("TopLine is not defined") && -1 == a.indexOf("_TPIHelper") && -1 == a.indexOf("Syntax error, unrecognized expression: a[href^=http://]:not([href*=") && -1 == a.indexOf("y2_cc2242") && -1 == a.indexOf("Error calling method on NPObject") && (-1 != a.indexOf("WARLIGHTERROR48348927984712893471394") ? a = "ServerError" : -1 !=
            a.indexOf("WARLIGHTHEAVYLOAD48348927984712893471394") && (a = "HeavyLoad"), ReportError(a), b || PopErrorDialog(a))
    }
}