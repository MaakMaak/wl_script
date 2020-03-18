var logData = "";

function log(entry) {
    var time = moment(new Date()).format('h:mm:ss');
    logData += `\n${time} | ${entry}`;
}

function logError(entry) {
    var time = moment(new Date()).format('h:mm:ss');
    logData += `\n${time} | ${entry}`;
}

//ctrl+shift+2
$$$(document).keydown(function (e) {
    if (e.which === 50 && e.ctrlKey && e.shiftKey) {
        getLog()
    }
});

window.logDialog = undefined;
window.getLog = function () {
    if (logDialog) {
        logDialog.html(`<textarea style="height:100%;width:100%">${logData}</textarea>`);
        logDialog.dialog('open')
    } else {
        logDialog = $$$(`<div style="overflow:hidden"><textarea style="height:100%;width:100%">${logData}</textarea></div>`).dialog({
            width: 800,
            title: "Userscript log",
            height: 400
        });
    }
};
window.onerror = windowError

function windowError(message, source, lineno, colno, error) {
    logError(`Error on line ${lineno} col ${colno} in ${source}`);
    logError(`${JSON.stringify(error)} ${message}`);

    if (typeof $().dialog == "function") {
        window.wlerror(message, source, lineno, colno, error)
    }
}