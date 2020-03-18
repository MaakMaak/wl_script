// ==UserScript==
// @name Tidy up your Dashboard
// @namespace https://greasyfork.org/users/10154
// @grant none
// @run-at document-start
// @match https://www.warzone.com/*
// @description Tidy Up Your Dashboard is a Userscript which brings along a lot of features for improving the user experience on Warzone.
// @version 3.3.7
// @icon http://i.imgur.com/XzA5qMO.png
// @require https://code.jquery.com/jquery-1.11.2.min.js
// @require https://code.jquery.com/ui/1.11.3/jquery-ui.min.js
// @require https://cdn.bootcss.com/datatables/1.10.10/js/jquery.dataTables.min.js
// @require https://cdn.bootcss.com/datatables/1.10.10/js/dataTables.bootstrap.js
// @require https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.4/moment.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.3/Chart.min.js
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
    createSelector(".container-fluid", "display: none")
    createSelector("body", "overflow: hidden")
}

setupDatabase()
log("indexedDB setup complete");

if (document.readyState == 'complete' || document.readyState == 'interactive') {
    log("Readystate complete|interactive")

    DOM_ContentReady();
} else {
    window.document.addEventListener("DOMContentLoaded", DOM_ContentReady);
    log("Readystate loading")
}
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
function setupAWPWorldTour() {
    if ($("title").text().toLowerCase().indexOf("awp world tour") != -1) {
        setupAWPRanking();
        setupAWPEvents();

        setupBottomForumContainer("awp")
        addCSS(`
            .AWPRanking {
                margin-bottom: 20px;
                width: 100%;
            }
            .awpUpdated {
                color: gray;
                float: right;
                font-size: 11px;
        `)

    }
}

function setupAWPRanking() {
    var minRow = 12;
    var maxRow = 30;
    var minCol = 1;
    var maxCol = 25;
    var url = `https://spreadsheets.google.com/feeds/cells/1YuV5WqthgmYsZqv4rFVSE1xhM0BKVrcbkivRZ8ht6-E/1/public/values?min-row=${minRow}&max-row=${maxRow}&min-col=${minCol}&max-col=${maxCol}&alt=json-in-script&callback=parseAWPRankingData`
    $.ajax({
        url: url,
        dataType: "script",
    });
}

function setupAWPEvents() {
    var minRow = 10;
    var minCol = 1;
    var maxCol = 6;
    var url = `https://spreadsheets.google.com/feeds/cells/1YuV5WqthgmYsZqv4rFVSE1xhM0BKVrcbkivRZ8ht6-E/2/public/values?min-row=${minRow}&min-col=${minCol}&max-col=${maxCol}&alt=json-in-script&callback=parseAWPEventData`;
    console.log(url)
    $.ajax({
        url: url,
        dataType: "script",
    });
}

window.parseAWPEventData = function (data) {
    var entries = data.feed.entry
    var lastUpdated = moment(data.feed.updated.$t)
    var content = $("<div>");
    content.prepend('<h4 class="text-medium card-title px-4 mb-0 py-3"><a href="https://www.warzone.com/Forum/156042-awp-world-tour">AWP World Tour</a>: Events</h4>')

    var table = $('<table class="AWPRanking table table-striped mb-0"><thead><tr><td>Week</td><td>Name</td><td>Champion</td></tr></thead><tbody></tbody></table>')
    var tbody = $("<tbody></tbody>")
    var tr = $("<tr></tr>");
    var events = [];
    var event = {finished: true};
    var currentRow = entries[0].gs$cell.row;
    try {
        $.each(entries, function (key, entry) {
            var col = entry.gs$cell.col
            var row = entry.gs$cell.row

            if ((row - currentRow) >= 3) {
                currentRow = row;
                events.push(event)
                if (event.url.match(/forum/i)) {
                    return;
                }
                event = {finished: true}
            }

            if (col == 1 && entry.content.$t) {
                event.url = entry.content.$t.match(/docs.google.com/i) ? undefined : entry.content.$t
            } else if (col == 3) {
                event.date = entry.content.$t
            } else if (col == 4) {
                if (event.name == undefined) {
                    event.name = entry.content.$t
                } else if (event.series == undefined) {
                    event.series = entry.content.$t
                }

            } else if (col == 5) {
                event.champion = entry.content.$t
            } else if (col == 6) {
                event.finished = false
            }
        })
    } catch (e) {
        log("error parsing awp event data")
        log(e)
    }
    var eventRows = events.filter(function (e) {
        return e.url && Math.abs(moment().diff(moment(e.date), 'days')) < 150
    }).map(function (e) {
        return `<tr>
                    <td>${moment(e.date).format('DD/MMM')}</td>
                    <td><a href="${e.url}">${e.name}</a><br>${e.series}</td>
                    <td>${e.finished ? e.champion : (e.url.match(/tournament/i) ? "in progress" : "not started")}</td>
                </tr>`
    }).join("")

    tbody.append(eventRows)
    tbody.append(`<tr class="lastRow"><td colspan="3"><span><a target="_blank" href="https://docs.google.com/spreadsheets/d/1Ao0SlM6Kv6CE1-Ha5mBIrI6nj4Uft2lMaE25qbXxWHs/pubhtml">Show All</a></span><span class="awpUpdated">Updated ${lastUpdated.from()}</span></td></tr>`)
    table.append(tbody);
    content.append($("<div class='scroller'>").append(table))
    $(".awp").append(content);
}
window.parseAWPRankingData = function (data) {
    var entries = data.feed.entry
    var lastUpdated = moment(data.feed.updated.$t)
    var content = $("<div>");
    content.prepend('<h4 class="text-medium card-title px-4 mb-0 py-3"><a href="https://www.warzone.com/Forum/156042-awp-world-tour">AWP World Tour</a>: Rankings</h4>')

    var table = $('<table class="AWPRanking table table-striped mb-0"><thead><tr><td>Rank</td><td>Name</td><td>Points</td></tr></thead><tbody></tbody></table>')
    var tbody = $("<tbody></tbody>")
    var tr = $("<tr></tr>");
    var url;
    try {
        $.each(entries, function (key, entry) {
            var col = entry.gs$cell.col
            var row = entry.gs$cell.row
            if (col == 1) {
                url = entry.content.$t;
            } else if (col == 3) {
                //rank
                tr.append($(`<td>${entry.content.$t}</td>`))
            } else if (col == 5) {
                //name
                tr.append($(`<td><a href="${url}">${entry.content.$t}</a></td>`))
            } else if (col == 25) {
                //points
                tr.append($(`<td>${entry.content.$t}</td>`))
                tbody.append(tr)
                tr = $("<tr></tr>");
            }
        })
    } catch (e) {
        log("error parsing awp event data")
        log(JSON.parse(e))
    }
    table.append(tbody);
    tbody.append(`<tr class="lastRow"><td colspan="3"><span><a target="_blank" href="https://docs.google.com/spreadsheets/d/1Ao0SlM6Kv6CE1-Ha5mBIrI6nj4Uft2lMaE25qbXxWHs/pubhtml">Show All</a></span><span class="awpUpdated">Updated ${lastUpdated.from()}</span></td></tr>`)

    content.append(table)
    $(".awp").prepend(content);
}
function setupMDLProfile() {
    var id = location.href.match(/([0-9]*)$/i)[1]
    var urlParam = "http://md-ladder.cloudapp.net/api/v1.0/players/" + id;
    var url = "https://w115l144.hoststar.ch/wl/httpTohttps.php?url=" + encodeURI(urlParam)
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'jsonp',
        crossDomain: true,
    }).done(function (response) {
        var data = JSON.parse(response.data);
        var player = data.player;
        if (player) {
            var mdlStats = '<td><a target="_blank" href="http://md-ladder.cloudapp.net/player?playerId=' + id + '">MDL</a></td>'
            if (player.rank) {
                mdlStats += '<td>' + getRankText(player.best_rank) + ' (' + player.best_displayed_rating + ')</td><td>' + getRankText(player.rank) + ' (' + player.displayed_rating + ')</td>'
            } else if (player.best_displayed_rating) {
                mdlStats += '<span>: Not Ranked with a rating of ' + player.displayed_rating + '. Best rating ever: ' + player.best_displayed_rating + ', best rank ever: ' + getRankText(player.best_rank) + '</span>'
            } else if (player.displayed_rating) {
                mdlStats += '<span>: Not Ranked with a rating of ' + player.displayed_rating
            }
        } else {
            var mdlStats = '<td><a target="_blank" href="http://md-ladder.cloudapp.net/">MDL</a></td>'
            mdlStats += '<td colspan="2">Currently not participating </td>'
        }
        $("h3:contains('Ladders')").next().find("table tbody").prepend('<tr>' + mdlStats + '</tr>');
    })
}

function setupMDLLadderTable() {
    addCSS(`
        .spinner {
          margin: 100px auto 0;
          width: 70px;
          text-align: center;
        }

        .spinner > div {
          width: 18px;
          height: 18px;
          background-color: #333;

          border-radius: 100%;
          display: inline-block;
          -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
          animation: sk-bouncedelay 1.4s infinite ease-in-out both;
        }

        .spinner .bounce1 {
          -webkit-animation-delay: -0.32s;
          animation-delay: -0.32s;
        }

        .spinner .bounce2 {
          -webkit-animation-delay: -0.16s;
          animation-delay: -0.16s;
        }

        @-webkit-keyframes sk-bouncedelay {
          0%, 80%, 100% { -webkit-transform: scale(0) }
          40% { -webkit-transform: scale(1.0) }
        }

        @keyframes sk-bouncedelay {
          0%, 80%, 100% { 
            -webkit-transform: scale(0);
            transform: scale(0);
          } 40% { 
            -webkit-transform: scale(1.0);
            transform: scale(1.0);
          }
        }
    `)
    var mdlTab = '<li class="nav-item"><a href="#MDLTab" data-toggle="tab" style="cursor: pointer" class="nav-link">Multi-day ladder</a></li>'
    $("#CommunityLadderTabs").append(mdlTab);
    var mdlData = `
    <div id="MDLTab" class="tab-pane" role="tabpanel" aria-hidden="false" style="height:400px">
       <div class="mdl-data">
          <div class="mdlPlayers" style="float:left">
            <div class="spinner mdlPlayerTable-loading" style="min-width:265px">
               <div class="bounce1"></div>
               <div class="bounce2"></div>
               <div class="bounce3"></div>
            </div>
            <div class="mdl-content" style="display:none">
                 <a href="http://md-ladder.cloudapp.net/allplayers" style="float:right;margin-top:5px">Show All</a>
            </div>
          </div>
          <div class="mdlGames" style="float:left; margin-left:10px">
            <div class="spinner mdlGamesTable-loading">
               <div class="bounce1"></div>
               <div class="bounce2"></div>
               <div class="bounce3"></div>
            </div>
          </div>
       </div>
    </div>`
    $("#myTabContent").append(mdlData);
    getMDLPlayerTable(function (table) {
        $(".mdlPlayers .mdl-content").prepend(table);
        $(".mdlPlayerTable-loading").remove();
        $(".mdlPlayers .mdl-content").show();
    })
    getMDLGamesTable(10, function (table) {
        $(".mdlGames").prepend(table);
        $(".mdlGamesTable-loading").remove();
        $("#DashboardLadderTabs-6 .mdlGames table").show();
    })
    $('#DashboardLadderTabs').tabs('destroy').tabs({
        event: 'mouseover'
    });
}

function getMDLGamesTable(numOfGames, cb) {
    var content = $("<div>");
    content.prepend('<h4 class="text-medium card-title px-4 mb-0 py-3"><a href="http://md-ladder.cloudapp.net/">Multi-day ladder</a>: Recent Games</h4>')
    var table = $("<table>").attr("cellpadding", 2).attr("cellspacing", 0).css("width", "100%").addClass("table table-striped mb-0")
    table.append(`
        <thead>
            <tr>
                <td>Game</td>
                <td>Link</td>
                <td>Date</td>
            </tr>
        </thead>
    `)
    table.append("<tbody></table>")
    var urlParam = "http://md-ladder.cloudapp.net/api/v1.0/games/?topk=" + numOfGames;
    var url = "https://w115l144.hoststar.ch/wl/httpTohttps.php?url=" + encodeURI(urlParam)
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'jsonp',
        crossDomain: true,
    }).done(function (response) {
        var data = JSON.parse(response.data);
        var games = data.games;
        $.each(games, function (key, game) {
            var p1 = game.players[0];
            var p2 = game.players[1]
            var winner = game.winner_id;
            var ended = moment(game.finish_date + "Z")
            var rowData = "<td>" + getPlayerGameString(p1, p2, winner) + "</td>"
            if (game.is_game_deleted) {
                rowData += "<td>DELETED</td>"
            } else {
                rowData += "<td><a href='https://www.warlight.net/MultiPlayer?GameID=" + game.game_id + "'>" + game.game_id + "</a></td>"
            }
            rowData += "<td>" + ended.from() + "</td>"
            table.append("<tr>" + rowData + "</tr>")
        })
        content.append(table)
        if (cb) {
            cb(content)
        }
    })
}

function getMDLPlayerTable(cb) {
    var content = $("<div>");
    content.prepend('<h4 class="text-medium card-title px-4 mb-0 py-3"><a href="http://md-ladder.cloudapp.net/">Multi-day ladder</a>: Rankings</h4>')
    var table = $("<table>").attr("cellpadding", 2).attr("cellspacing", 0).css("width", "100%").addClass("table table-striped mb-0")
    table.append(`
        <thead>
           <tr>
                <td>Rank</td>
                <td>Name</td>
                <td>Rating</td>
           </tr>
        </thead>`)
    table.append("<tbody></table>")
    var urlParam = "http://md-ladder.cloudapp.net/api/v1.0/players/?topk=10";
    var url = "https://w115l144.hoststar.ch/wl/httpTohttps.php?url=" + encodeURI(urlParam)
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'jsonp',
        crossDomain: true,
    }).done(function (response) {
        var data = JSON.parse(response.data);
        var players = data.players;
        players = players.filter(function (p) {
            return p.rank <= 10
        }).sort(function (p1, p2) {
            return p1.rank - p2.rank
        })
        $.each(players, function (key, player) {
            var rowData = "<td>" + player.rank + "</td>"
            var playerLink = getPlayerLink(player);
            var clanIcon = getClanIcon(player);
            rowData += "<td>" + clanIcon + playerLink + "</td>"
            rowData += "<td>" + player.displayed_rating + "</td>"
            $(table).find("tbody").append("<tr>" + rowData + "</tr>")
        })
        if (cb) {
            content.append(table)
            cb(content)
        }
    })
}

function setupMDLForumTable() {
    if ($("title").text().toLowerCase().indexOf("multi-day ladder") != -1) {
        var mdlContainer = setupBottomForumContainer("mdl")
        getMDLPlayerTable(function (table) {
            mdlContainer.prepend(table)
        })
        getMDLGamesTable(10, function (table) {
            mdlContainer.append(table);
        })
    }
}

function getPlayerGameString(p1, p2, winnerId) {
    var c1 = getClanIcon(p1)
    var c2 = getClanIcon(p2)
    var p1s = c1 + "<a target='_blank' href='http://md-ladder.cloudapp.net/player?playerId=" + p1.player_id + "'> " + p1.player_name + "</a>"
    var p2s = c2 + "<a target='_blank' href='http://md-ladder.cloudapp.net/player?playerId=" + p2.player_id + "'> " + p2.player_name + "</a>"
    if (p1.player_id == winnerId) {
        return p1s + " defeated " + p2s
    } else {
        return p2s + " defeated " + p1s
    }
}

function getPlayerLink(player) {
    return "<a href='http://md-ladder.cloudapp.net/player?playerId=" + player.player_id + "'> " + player.player_name + "</a>"
}

function getClanIcon(player) {
    if (player.clan_id) {
        return '<a href="http://md-ladder.cloudapp.net/clan?clanId=' + player.clan_id + '" title="' + player.clan + '"><img border="0" style="vertical-align: middle" src="' + player.clan_icon + '"></a>'
    } else {
        return ""
    }
}

function getRankText(n) {
    var s = ["th", "st", "nd", "rd"]
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function setupBottomForumContainer(className) {
    $("#ReplyDiv").after("<div class='" + className + "'></div>")
    addCSS(`
        .` + className + ` {
                padding: 20px;
                display: flex;
                justify-content: space-between;
        }
        .` + className + ` > * {
           flex: 0.47;
        }        
        .` + className + ` .scroller  {
                max-height: 750px;
                display: block;
                overflow-y: auto;
        }
    `)
    return $("." + className);
}
function setupDatabase() {
    log("indexedDB start setup")
    window.Database = {
        db: null,
        Table: {
            Bookmarks: "Bookmarks",
            Settings: "Settings",
            BlacklistedForumThreads: "BlacklistedForumThreads",
            TournamentData: "TournamentData"
        },
        Exports: {
            Bookmarks: "Bookmarks",
            Settings: "Settings",
            BlacklistedForumThreads: "BlacklistedForumThreads"
        },
        Row: {
            BlacklistedForumThreads: {
                ThreadId: "threadId",
                Date: "date"
            },
            Bookmarks: {
                Order: "order"
            },
            Settings: {
                Name: "name"
            },
            TournamentData: {
                Id: "tournamentId",
            }
        },
        init: function (callback) {
            log("indexedDB start init")
            if (!"indexedDB" in window) {
                log("IndexedDB not supported")
                return;
            }
            var openRequest = indexedDB.open("TidyUpYourDashboard_v3", 3);
            openRequest.onupgradeneeded = function (e) {

                var thisDB = e.target.result;
                if (!thisDB.objectStoreNames.contains("Bookmarks")) {
                    var objectStore = thisDB.createObjectStore("Bookmarks", {autoIncrement: true});
                    objectStore.createIndex("order", "order", {unique: true});
                }
                if (!thisDB.objectStoreNames.contains("Settings")) {
                    var objectStore = thisDB.createObjectStore("Settings", {keyPath: "name"});
                    objectStore.createIndex("name", "name", {unique: true});
                    objectStore.createIndex("value", "value", {unique: false});
                }
                if (!thisDB.objectStoreNames.contains("BlacklistedForumThreads")) {
                    var objectStore = thisDB.createObjectStore("BlacklistedForumThreads", {autoIncrement: true});
                    objectStore.createIndex("threadId", "threadId", {unique: true});
                    objectStore.createIndex("date", "date", {unique: false});
                }
                if (!thisDB.objectStoreNames.contains("TournamentData")) {
                    var objectStore = thisDB.createObjectStore("TournamentData", {keyPath: "tournamentId"});
                    objectStore.createIndex("tournamentId", "tournamentId", {unique: true});
                    objectStore.createIndex("value", "value", {unique: false});
                }
            }

            openRequest.onsuccess = function (e) {
                log("indexedDB init sucessful");
                db = e.target.result;
                callback()
            }

            openRequest.onerror = function (e) {
                log("Error Init IndexedDB")
                log(e.target.error)
//                alert("Sorry, Tidy Up Your Dashboard is not supported")
                $("<div>Sorry,<br> Tidy Up Your Dashboard is not supported.</div>").dialog();
            }
        },
        update: function (table, value, key, callback) {
            var transaction = db.transaction([table], "readwrite");
            var store = transaction.objectStore(table);


            //Perform the add
            try {
                if (key == undefined) {
                    var request = store.put(value);
                } else {
                    var request = store.put(value, Number(key));
                }
                request.onerror = function (e) {
                    log(`Error saving ${JSON.stringify(value)} in ${table}`)
                    log(JSON.stringify(e));
                }

                request.onsuccess = function (e) {
                    log(`Saved ${JSON.stringify(value)} in ${table}`)
                    callback()
                }
            } catch (e) {
                log(`Error saving ${JSON.stringify(value)} in ${table}`)
                log(JSON.stringify(e));
            }


        },
        read: function (table, key, callback) {
            var transaction = db.transaction([table], "readonly");
            var objectStore = transaction.objectStore(table);

            var ob = objectStore.get(Number(key));

            ob.onsuccess = function (e) {
                var result = e.target.result;
                callback(result)
            }
        },
        readIndex: function (table, row, value, callback) {
            var transaction = db.transaction([table], "readonly");
            var objectStore = transaction.objectStore(table);

            var index = objectStore.index(row);

            //name is some value
            var ob = index.get(value);

            ob.onsuccess = function (e) {
                var result = e.target.result;
                callback(result)
            }
        },
        readAll: function (table, callback) {
            var transaction = db.transaction([table], "readonly");
            var objectStore = transaction.objectStore(table);
            var items = []

            var ob = objectStore.openCursor()

            ob.onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                    var item = cursor.value;
                    item.id = cursor.primaryKey;
                    items.push(item);
                    cursor.continue();
                } else {
                    callback(items)
                }
            }
        },
        add: function (table, value, callback) {

            var transaction = db.transaction([table], "readwrite");
            var store = transaction.objectStore(table);

            try {
                var request = store.add(value);
                request.onerror = function (e) {
                    log(`Error saving ${JSON.stringify(value)} in ${table}`)
                    log(JSON.stringify(e));
                }

                request.onsuccess = function (e) {
                    log(`Saved ${JSON.stringify(value)} in ${table}`)
                    callback()
                }
            } catch (e) {
                log(`Error saving ${JSON.stringify(value)} in ${table}`)
                log(JSON.stringify(e));
            }
        },
        delete: function (table, key, callback) {
            var transaction = db.transaction([table], "readwrite");
            var store = transaction.objectStore(table);


            //Perform the add
            var request = store.delete(key)

            request.onerror = function (e) {
                log("Error deleting in " + table)
                log(e.target.error);
                //some type of error handler
            }

            request.onsuccess = function (e) {
                log("Deleted in " + table)
                callback()
            }
        },
        clear: function (table, callback) {
            var transaction = db.transaction([table], "readwrite");
            var store = transaction.objectStore(table);


            //Perform the add
            var request = store.clear();

            request.onerror = function (e) {
                log("Error clearing " + table)
                log(e.target.error);
                //some type of error handler
            }

            request.onsuccess = function (e) {
                log("Cleared " + table)
                callback()
            }
        },

    }

}
function setupDashboardSearch() {
    loadDataTableCSS();
    $(".navbar-nav .nav-item:first").before('<li class="nav-item"><a class="nav-link" data-toggle="modal" data-target="#userscriptSearch" style="cursor:pointer">Search</a></li>')
    $("body").append(`
        <div class="modal modal-1000 fade" id="userscriptSearch" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Search</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div id="searchTabs">
                    <ul class="nav nav-tabs" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" data-toggle="tab" href="#tab_player" role="tab">Player</a> </li>
                        <li class="nav-item"><a class="nav-link" id="tab_clan_header" data-toggle="tab" href="#tab_clan" role="tab">Clan</a> </li>
                    </ul>
                    <div class="tab-content" style="padding:20px;">
                        <div class="tab-pane active" id="tab_player" role="tabpanel">
                            <div class="form-group">
                                <div class="form-inline">
                                    <input placeholder='Player name' id='playerSearchQuery' class="form-control">
                                    <button id="searchPlayerBtn" class="btn btn-primary">Search</button>
                                </div>
                                <div id='foundPlayers'></div>
                            </div>
                        </div>
                        <div class="tab-pane active" id="tab_clan" role="tabpanel">
                            <div id='foundClans'></div>
                        </div>
                    </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" class="close" data-dismiss="modal" >Close</button>
              </div>
            </div>
          </div>
        </div>
    `)
    $('#userscriptSearch').on('shown.bs.modal', function () {
        $('#playerSearchQuery').focus();
    })

    window.tabsInit = false;
    $("#tab_clan_header").on("click", function (event, ui) {
        if (!tabsInit) {
            initClanSearch();
            tabsInit = true;
        }
    });
    createSelector("#searchTabs", "background: none;border: none;")
    $("#searchPlayerLink").on("click", function () {
        showPopup(".playersearch-show")
        $("#playerSearchQuery").val("")
        $("#playerSearchQuery").focus()
    })
    $("#searchPlayerBtn").on("click", function () {
        searchPlayer()
    })
    $("#findPlayerExtra").on("click", function (event) {
        $(".playersearch-context").finish().toggle(100).css({
            top: event.pageY + "px",
            left: event.pageX + "px"
        });
    })
    $('#playerSearchQuery').keyup(function (e) {
        if (e.keyCode == 13) {
            searchPlayer()
        }
    });
    createSelector(".SubTabCell", "cursor: pointer")
    createSelector(".foundPlayer", "display: block; height: 25px; padding: 2px; clear:both")
    createSelector(".foundPlayer a", "line-height: 25px; float: left")
    createSelector(".foundPlayer img", "height: 15px; display: block; float: left; margin: 5px")
    createSelector(".notFound", "clear: both; display: block; color: gray;")
    createSelector("#foundPlayers span", "color: gray; padding: 0 5px; line-height: 25px")
    createSelector("#foundPlayers > span", "display: block; clear: both; margin: 0px; padding: 10px 0")
    createSelector(".playerSearchName", "float: left")
    createSelector("#foundClansTable", "float: left; table-layout: fixed;width: 100%")
    createSelector("#foundClansTable thead", "text-align: left")
    createSelector("#foundClansTable td a", "display: block; width: 100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;")
    createSelector("#foundClansTable img", "margin-right: 5px;")
}

function initClanSearch() {
    warlight_shared_viewmodels_WaitDialogVM.Start("Setting up clans...")
    warlight_shared_messages_Message.GetClansAsync(null, null, function (a, b, clans) {
        parseFoundClans(clans)
        warlight_shared_viewmodels_WaitDialogVM.Stop();
    })
}

window.blockSearch = false;

function searchPlayer() {
    if (blockSearch) {
        return;
    }
    blockSearch = true;
    window.setTimeout(function () {
        blockSearch = false;
    }, 3000)
    $("#foundPlayers").empty()
    var query = $("#playerSearchQuery").val().toLowerCase()
    if (query.length < 3) {
        warlight_shared_viewmodels_AlertVM.DoPopup("Please enter at least 3 characters to search for");
        return
    }
    warlight_shared_viewmodels_main_manageplayers_ManagePlayersVM.SearchPlayers(query, function (players) {
        players = players.Results
        if (players.length >= 25) {
            $("#foundPlayers").append("<span>This query found more than 25 results. Only the first 25 results are shown below.</span>")
        }
        parseFoundGlobalPlayers(players)
        $("#playerSearchQuery").focus()
        $("#playerSearchQuery").select()
    })
}


function parseFoundClans(clans) {
    clans.sort(function (c1, c2) {
        return (c2.TotalPointsInThousands - c1.TotalPointsInThousands)
    });
    var clanTableHTML = '<table class="table table-striped mb-0" id="foundClansTable"><thead><tr><th width="50">#</th><th width="250">Name</th><th width="194">Created By</th><th width="110">Total Points</th><th width="110">Created On</th></tr></thead>'
    for (var i = 0; i < clans.length; i++) {
        var clan = clans[i];
        var name = clan.Name;
        var id = clan.ID;
        var createdBy = clan.CreatedBy;
        var iconId = clan.IconIncre;
        var imgTag = iconId == 0 ? "" : `<img src="https://d32kaghj56y4ei.cloudfront.net/Data/Clans/${id}/Icon/${iconId}.png">`;
        var totalpoints = (clan.TotalPointsInThousands * 1000).toLocaleString("en")
        var createdDate = moment(clan.CreatedDate.date).format('MM/DD/YYYY')
        var nameHTML = `<a target="_blank" href="https://www.warzone.com/Clans/?ID=${id}">${imgTag}${name}</a>`;
        clanTableHTML += `<tr><td>${i + 1}</td><td>${nameHTML}</td><td class="data-player" data-player-id="${createdBy}">Checking..</td><td>${totalpoints}</td><td data-order="${id}">${createdDate}</td></tr>`
    }
    clanTableHTML += "</table>"
    $("#foundClans").append(clanTableHTML)
    var dataTable = $$$("#foundClansTable").DataTable({
        "order": [],
        paging: true,
        "pageLength": 10,
        "bLengthChange": false,
        "autoWidth": false,
        columnDefs: [{
            targets: [0],
            searchable: false
        }, {
            targets: [1],
            orderData: [1, 0],
            sortable: false
        }, {
            targets: [2],
            orderData: [2, 1, 0],
            sortable: false,
            searchable: false
        }, {
            targets: [3],
            orderData: [3, 1, 0],
            type: "numeric-comma"
        }, {
            targets: [4],
            orderData: [4, 1]
        }],
        "aoColumns": [
            {
                "orderSequence": ["desc", "asc"]
            },
            {
                "orderSequence": ["asc", "desc"]
            },
            {
                "orderSequence": ["asc", "desc"]
            },
            {
                "orderSequence": ["asc", "desc"]
            },
            {
                "orderSequence": ["desc", "asc"]
            },
        ],
        initComplete: function () {
            window.setTimeout(loadClanCreators, 200);
            $("#foundClansTable").removeClass("dataTable")
        },
        "language": {
            "zeroRecords": "No matching clans found",
            "info": "Showing _START_ to _END_ of _TOTAL_ clans",
            "infoEmpty": "Showing 0 to 0 of 0 clans",
            "infoFiltered": "(filtered from _MAX_ total clans)",
        }
    });
    dataTable.on('draw.dt', function () {
        loadClanCreators()
    })
}

function loadClanCreators() {
    $.each($(".data-player"), function (k, cell) {
        if ($(cell).hasClass("data-player") && $(cell).is(":visible")) {
            var id = $(cell).attr("data-player-id")
            $.ajax({
                type: 'GET',
                url: `https://w115l144.hoststar.ch/wl/wl_profile.php?p=${id}`,
                dataType: 'jsonp',
                crossDomain: true,
            }).done(function (response) {
                if (isFinite(response.data)) {
                    $(`[data-player-id="${id}"]`).html(`<a target="_blank" href="https://www.warzone.com/Profile?p=${response.data}">${decodeURI(atob(response.name)) || "Unknown"}</a>`)
                } else {
                    $(`[data-player-id="${id}"]`).html(`Unknown`)
                }
                if ($(cell).is(":visible")) {
                    $(cell).removeClass("data-player");
                }
            });
        }
    });
}

function parseFoundGlobalPlayers(players) {
    if (!players || players.length == 0) {
        $("#foundPlayers").append("<span class='notFound'>No Players found.</span>");
        return;
    }
    players.sort(function (p1, p2) {
        return (p2.Level - p1.Level != 0) ? p2.Level - p1.Level : p1.Name > p2.Name
    });
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        var id = String(player.ProfileToken).substr(0, 2) + String(player.PlayerID) + String(player.ProfileToken).substr(2, 2);
        var nameLink = '<a href="/Profile?p=' + id + '">' + player.Name + '</a>'
        var clan = player.ClanOpt != null ? '<a href="https://www.warzone.com/Clans/?ID=' + player.ClanOpt.ClanID + '"><img onError="this.onError=null;$(this).remove()" class="playerSearchClan" src="https://d32kaghj56y4ei.cloudfront.net/Data/Clans/' + player.ClanOpt.ClanID + '/Icon/' + player.ClanOpt.IconIncre + '.png"></a>' : "";
        var member = player.IsMember ? '<img class="playerSearchMember" src="https://d2wcw7vp66n8b3.cloudfront.net/Images/MemberIcon.png">' : "";
        var name = '<div class="playerSearchName">' + nameLink + "<span>(" + player.Level + ")</span></div>";
        $("#foundPlayers").append('<div class="foundPlayer">' + clan + name + member + '</div>');
    }
}
var mapData;

function setupMapSearch() {
    $("#PerPageBox").closest("tr").after('<tr><td></td><td><input id="mapSearchQuery" placeholder="Map Name"><br><button id="mapSearchBtn">Search</button><button style="margin: 4px" id="mapSearchResetBtn">Reset</button></td></tr>')

    $('#mapSearchQuery').on('keypress', function (event) {
        if (event.which === 13) {
            searchMaps();
        }
    });

    $("#mapSearchBtn").on("click", function () {
        searchMaps();
    })

    $("#FilterBox, #SortBox, #PerPageBox").on("change", function () {
        $("#mapSearchQuery").val("")
        $("#searchResultsTitle").remove()
    })

}

function searchMaps() {
    if (mapData == undefined) {
        $("<div />").load('Ajax/EnumerateMaps?Filter=' + 1 + '&Sort=' + 1 + "&PerPage=" + 2147483647 + "&Offset=" + 0, function (data) {
            mapData = data;
            filterMaps(this);
        })
    } else {
        var maps = $("<div />").html(mapData)
        filterMaps(maps);
    }
}

function filterMaps(selector) {
    var query = $("#mapSearchQuery").val()
    $.each($(selector).find("div"), function (key, div) {
        if ($(div).text().trim().toLowerCase().replace(/(rated.*$)/, "").indexOf(query.toLowerCase()) == -1) {
            $(div).remove()
        }
    })

    var count = $(selector).find("div").length
    $('#MapsContainer').empty()
    $(selector).detach().appendTo('#MapsContainer')
    $("#MapsContainer tr:last-of-type").html("Showing maps 1 - " + count + " of " + count);
    $("#ReceivePager").html("Showing maps 1 - " + count + " of " + count);
    $("#searchResultsTitle").length > 0 ? $("#searchResultsTitle").html("Searchresults for <i>" + query + "</i>") : $("#ReceivePager").after("<h2 id='searchResultsTitle'>Searchresults for <i>" + query + "</i></h2>")

}
function setupTournamentDecline() {
    $.each($(".TournamentRow"), function (key, val) {
        //Waiting for accept / decline
        if ($(val).find("[style='color: red']:not(.BootTimeLabel)").length > 0) {
            $(val).find("td:last-of-type").append('<button style="float: right;" class="DeclineBtn btn btn-primary" role="button">Decline</button>')
            $(val).find("td:last-of-type").attr("colspan", "2")
        }
    })
    $(".DeclineBtn").on("click", function (e) {
        var id = $(e.target).closest(".TournamentRow").attr("data-tournamentid")
        warlight_shared_messages_Message.DeclineTournamentAsync(null, warlight_shared_viewmodels_SignIn.Auth, id, null, function (b, c) {
            warlight_shared_viewmodels_WaitDialogVM.Stop();
            if (null != c && 129 != c.ErrorType) {
                if (135 == c.ErrorType) {
                    warlight_shared_viewmodels_AlertVM.DoPopup("The tournament has been deleted");
                } else {
                    throw c;
                }
            }
            var btn = $(e.target).closest(".DeclineBtn")
            $(e.target).text("Declined")
            btn.attr("disabled", true).addClass("ui-state-disabled");
            btn.closest(".TournamentRow").find("[style='color: red']:not(.BootTimeLabel)").remove()
            Database.update(Database.Table.TournamentData, {
                tournamentId: Number(id),
                value: false,
                name: false
            }, undefined, function () {
            })
        })
    })
}

function setupTournamentTableStyles() {
    createSelector("body", "overflow: hidden")
    $("#MyTournamentsTable").parent().css({
        "display": "block",
        "overflow-y": "scroll",
        "border-bottom": "1px solid #444444",
        "border-top": "1px solid #444444"
    });
    addCSS(`
        html, body {
            height: 100%;
            overflow: hidden;
            margin: 0!important;
        }
        html {
            overflow-y: scroll;
        }
    `);
    setTournamentTableHeight();
}

function updateCurrentTournamentData() {
    var tournament = WL_Tournament.Tourn
    var players = WL_Tournament.Players._players
    var name = WL_Tournament.Tourn.Settings.Name
    var id = tournament.ID
    try {
        Database.readIndex(Database.Table.TournamentData, Database.Row.TournamentData.Id, id, function (tourn) {
            if (tourn && tourn.value) {
                var details = getTournamentPlayerInfo(tournament, players, warlight_shared_viewmodels_SignIn.get_CurrentPlayer().ID)
                Database.update(Database.Table.TournamentData, {
                    tournamentId: Number(id),
                    value: details,
                    name: name
                }, undefined, function () {
                })
            }
        })
    } catch (e) {
        log("Bad tournament")
        log(e)
    }
}

function setDefaultElimnatedTournamentStatus() {
    ifSettingIsEnabled('hideEliminatedTournaments', function () {
        $('#hideElimnatedTournaments').prop('checked', true);
    }, undefined, function () {
        showHideEliminatedTournaments();
    })
}

function setupTournamentDataCheck() {
    log("setting up tournament data check")
    addCSS(`
        .hideEliminatedTournmanets {
            display: inline-block;
            float: right;
            margin-top: 6px;
        }
        .hideEliminatedTournmanets span {
            margin-right: 10px;
        }
    `)
    //    $("#MyTournamentsTable h2").after('<label id="showHideTournaments"><input id="hideElimnatedTournaments" type="checkbox" >Hide tournaments where I am eliminated</input></label>');
    $("#MyTournamentsTable h2").after('<div class="hideEliminatedTournmanets"><label class="switch" for="hideElimnatedTournaments"><input type="checkbox" id="hideElimnatedTournaments"><div class="slider round"></div></label><span>Hide tournaments where I am eliminated </span></div>');
    $("#MyTournamentsTable h2").after('<button class="btn btn-primary" id="dataTournamanetButton" onclick="updateAllTournamentData()">Update data</button>');
    $("body").append("<div style='display:none'><div id='ShowAllBtn'></div><div id='PlayersContainer'></div></div>")
    $("#MyTournamentsTable thead td").attr("colspan", 3)
    $("#MyTournamentsTable tr:last td").attr("colspan", 3)
    addCSS(`
        #showHideTournaments, #dataTournamanetButton {
            float: right;
            margin: 0 10px;
        }
    `)
    addCSS(`
        .TournamentRow.eliminated {
            background: rgba(255,0,0,0.05);
        }
        .TournamentRow {
            transition: all 1s ease-in;
        }
    `)
    showHideEliminatedTournaments();
    $('#hideElimnatedTournaments').change(function () {
        var hideEliminatedTournaments = {
            name: "hideEliminatedTournaments",
            value: this.checked
        }
        Database.update(Database.Table.Settings, hideEliminatedTournaments, undefined, function () {
        })
        showHideEliminatedTournaments()
    });
}

function showHideEliminatedTournaments() {
    var hide = $("#hideElimnatedTournaments").prop("checked");
    markEliminatedTournaments();
    if (hide) {
        hideElimatedTournaments();
    } else {
        showElimnatedTournaments();
    }
}

function markEliminatedTournaments() {
    $(".eliminated").removeClass("eliminated")
    $.each($("#MyTournamentsTable [data-tournamentid]"), function (key, row) {
        var text = $(row).find(".tournamentData").text();
        if (text.indexOf("None") != -1 && text.indexOf("Playing") == -1) {
            $(row).addClass("eliminated");
        }
    });
}

function updateAllTournamentData() {
    $.each($("#MyTournamentsTable [data-tournamentid]"), function (key, row) {
        if (!$(row).find("[style='color: red']:not(.BootTimeLabel)").length > 0) {
            var id = $(row).attr("data-tournamentid")
            Database.readIndex(Database.Table.TournamentData, Database.Row.TournamentData.Id, Number(id), function (tourn) {
                if (!tourn) {
                    Database.update(Database.Table.TournamentData, {
                        tournamentId: Number(id),
                        value: "-",
                        name: "-"
                    }, undefined, function () {
                    })
                }
            })
        }
    })
    Database.readAll(Database.Table.TournamentData, function (tournamentDatas) {
        $.each(tournamentDatas, function (key, tournamentData) {
            if ($(`#MyTournamentsTable [data-tournamentid='${tournamentData.tournamentId}']`).length) {
                $(`#MyTournamentsTable [data-tournamentid='${tournamentData.tournamentId}']`).find("td:last-of-type").attr("colspan", "1")
                $(`#MyTournamentsTable [data-tournamentid='${tournamentData.tournamentId}']`).append(`<td class="tournamentData">${tournamentData.value ? tournamentData.value : "-"}</td>`)
            } else if (tournamentData.value && tournamentData.name) {
                $("#MyTournamentsTable").prepend(`<tr class="TournamentRow" data-tournament="${tournamentData.tournamentId}"><td></td><td><a style="font-size: 17px; color: white" href="https://www.warzone.com/MultiPlayer/Tournament?ID=${tournamentData.tournamentId}"> ${tournamentData.name} (finished)</a></td><td><a><button class="removeTournament btn btn-primary" role="button">Remove</button></a></td></tr>`);
            }
        })
        $(".removeTournament").on("click", function () {
            var row = $(this).closest("tr");
            var id = row.attr("data-tournament")
            Database.update(Database.Table.TournamentData, {
                tournamentId: Number(id),
                value: false,
                name: false
            }, undefined, function () {
                row.remove();
            })
        })
        setDefaultElimnatedTournamentStatus();
    })
}

function showElimnatedTournaments() {
    $(".TournamentRow").show();
    updateTournamentCounter();
}

function hideElimatedTournaments() {
    $(".TournamentRow.eliminated").hide()
    updateTournamentCounter();
}

function updateTournamentCounter() {
    var total = $("#MyTournamentsTable .TournamentRow").length;
    var visible = $("#MyTournamentsTable .TournamentRow:visible").length;
    if (total > visible) {
        $("#MyTournamentsTable h2").text("My Tournaments (" + visible + "/" + total + ")")
    } else {
        $("#MyTournamentsTable h2").text("My Tournaments (" + total + ")")
    }
};
window.updateAllTournamentData = function () {
    addCSS(`
        .progress {
            width: 269px;
            float: right;
            margin-top: 6px;
        }
        .progress-bar {
            transition-duration: 0.1s;
        }
    `)
    $("#dataTournamanetButton").replaceWith(`
        <div class="progress" >
          <div class="progress-bar"></div>
        </div>
    `)
    var numOfMyTournaments = $("#MyTournamentsTable [data-tournamentid]").length;
    $.each($("#MyTournamentsTable [data-tournamentid]"), function (key, row) {
        var id = $(row).attr("data-tournamentid")
        loadTournamentDetails(id, function () {
            progressTournamentData(numOfMyTournaments)
            showHideEliminatedTournaments()
            updateTournamentCounter();
        })
    })
}

function showInfo(text, x, y) {
    window.setTimeout(function () {
        if (!$(".custom-menu").is(':visible')) {
            $(".custom-menu .content").html(text);
            $(".custom-menu").finish().toggle(100).// In the right position (the mouse)
            css({
                top: x + "px",
                left: y + "px"
            });
        }
    }, 10);
}

var counter = 0;

function progressTournamentData(max) {
    if (max >= ++counter) {
        $(".progress-bar").text(++counter + "/" + max)
    } else {
        $(".progress-bar").text("Done")
    }
    $(".progress-bar").css("width", counter / max * 100 + "%")
}

function loadTournamentDetails(id, cb) {
    $(".tournamentData").remove();
    warlight_shared_messages_Message.GetTournamentDetailsAsync(null, warlight_shared_viewmodels_SignIn.Auth, id, new system_Nullable_$Float(999999999), null, function (a, b, c) {
        var tournament = c["Tournament"]
        var name = tournament.Settings.Name
        var players = new wljs_multiplayer_tournaments_display_Players(tournament)["_players"];
        var details = getTournamentPlayerInfo(tournament, players, warlight_shared_viewmodels_SignIn.get_CurrentPlayer().ID)
        $(`[data-tournamentid='${id}']`).append(`<td class="tournamentData">${details}</td>`)
        Database.update(Database.Table.TournamentData, {
            tournamentId: Number(id),
            value: details,
            name: name
        }, undefined, function () {
        })
        if (cb) {
            cb();
        }
    })
}

window.getTournamentPlayerInfo = function (tournament, players, id) {
    var playerInfo = players["store"]["h"][id]
    var playing = playerInfo.NumInProgress
    var won = playerInfo.NumWins
    var lost = playerInfo.NumLosses
    var myGames = playing + won + lost
    var allowVacations = tournament.Settings.AllowVacations
    // 0 -> Single Elimination, 1 -> Double Elimination, 2 -> Robin Round
    var tournamentType = tournament.Type
    var myMaxGames;
    var tournamentTotalGames;
    var tournamentGamesStarted = tournament.Games.length
    var teamsPerGame = tournament.TeamsPerGame.val;
    var joker = 0;
    //Single Elimination
    if (tournamentType == 0) {
        tournamentTotalGames = (Math.pow(teamsPerGame, tournament.NumberOfRoundsOrNumberOfTeams) - 1) / (teamsPerGame - 1);
        if (lost == 1) {
            myMaxGames = undefined;
        } else {
            myMaxGames = [0, tournament.NumberOfRoundsOrNumberOfTeams]
        }
    }
    //Double Eliminiation
    else if (tournamentType == 1) {
        tournamentTotalGames = 2 * Math.pow(2, tournament.NumberOfRoundsOrNumberOfTeams) - 1;
        if (lost == 0) {
            joker = 1;
        }
        if (lost == 2) {
            myMaxGames = undefined;
        } else {
            myMaxGames = [0, tournament.NumberOfRoundsOrNumberOfTeams * 2]
        }
    }
    //Robin round
    else if (tournamentType == 2) {
        joker = 0;
        var teams = [];
        $.each(players.store.h, function (index, player) {
            if (player.TP.State == 1) {
                if (tournament.TeamSize > 1) {
                    teams.push(player.TP.TeamID)
                } else {
                    teams.push(Math.random())
                }
            }
        });
        var numOfTeams = teams.unique().length
        myMaxGames = numOfTeams - 1;
        tournamentTotalGames = ((numOfTeams - 1) * numOfTeams) / 2
    } else {
        myMaxGames = undefined;
        tournamentTotalGames = undefined;
    }
    var details;
    if (myMaxGames == undefined) {
        details = `
            <font color="#858585">Won:</font> ${won}  <br>
            <font color="#858585">Lost:</font> ${lost}  <br>
            <font color="#858585">Games left:</font> None  <br>
            <font color="#858585">Progress: </font>${getTournamentProgress(tournamentGamesStarted, tournamentTotalGames)} <br>`
    } else if (tournamentGamesStarted == 0) {
        details = `
            <font color="#858585">Games left:</font> ${getGamesLeftString(myGames, myMaxGames, playing, joker)}  <br>
            <font color="#858585">Progress: </font>Not started`
    } else {
        details = `
            <font color="#858585">Playing:</font> ${playing}  <br>
            <font color="#858585">Won:</font> ${won}  <br>
            <font color="#858585">Lost:</font> ${lost}  <br>
            <font color="#858585">Games left:</font> ${getGamesLeftString(myGames, myMaxGames, playing, joker)}  <br>
            <font color="#858585">Progress: </font>${getTournamentProgress(tournamentGamesStarted, tournamentTotalGames)} <br>`
    }
    log(details)
    return details;
}

function getTournamentProgress(tournamentGamesStarted, tournamentTotalGames) {
    var progress = Math.round(tournamentGamesStarted / tournamentTotalGames * 100, 0)
    if (progress == 100) {
        return "Almost done"
    } else {
        return progress + "%"
    }
}

function getGamesLeftString(myGames, myMaxGames, playing, joker) {
    if (typeof myMaxGames == "number") {
        return (myMaxGames - myGames == 0 ? "None" : (myMaxGames - myGames))
    } else if (typeof myMaxGames == "object") {
        if (playing == 1) {
            if (myMaxGames[1] - myGames == 0) {
                return "None"
            } else {
                return (Math.max(joker, myMaxGames[0] - myGames)) + " - " + (myMaxGames[1] - myGames)
            }
        } else {
            return (Math.max(joker + 1, myMaxGames[0] - myGames)) + " - " + (myMaxGames[1] - myGames)
        }
    } else {
        return "undefined"
    }
}

function setTournamentTableHeight() {
    $("#MyTournamentsTable").parent().height(window.innerHeight - 125);
}

window.findMeIndex = -1;
window.findNextInTournament = function () {
    var boxes = getPlayerBoxes();
    var max = boxes.length - 1;
    findMeIndex = findMeIndex == max ? 0 : findMeIndex + 1;
    panzoomMatrix = undefined;
    findInTournament();
}

function setupPlayerDataTable() {
    var dataTable = $$$("#PlayersContainer > table").DataTable({
        "order": [[4, "asc"], [3, "desc"]],
        paging: false,
        sDom: 't',
        columnDefs: [{
            targets: [0],
            orderData: [0, 3]
        }, {
            targets: [1],
            orderData: [1, 0]
        }, {
            targets: [2],
            orderData: [2, 1, 0],
            type: "rank"
        }, {
            targets: [3],
            orderData: [3,]
        }, {
            targets: [4],
            orderData: [4]
        }, {
            targets: [5],
            orderData: [5, 1, 0]
        }],
        "aoColumns": [
            {
                "orderSequence": ["asc", "desc"]
            },
            {
                "orderSequence": ["asc", "desc"]
            },
            {
                "orderSequence": ["asc", "desc"]
            },
            {
                "orderSequence": ["desc", "asc"]
            },
            {
                "orderSequence": ["desc", "asc"]
            },
            {
                "orderSequence": ["desc", "asc"]
            },
        ]
    });
    loadDataTableCSS();
}

window.setCurrentplayer = function (player, noSearch) {
    window.currentPlayer = {
        id: player.id,
        name: player.name,
        fullID: player.fullID,
        team: player.team
    };
    $("#selectContainer").toggle(100);
    $("#activePlayer").html(htmlEscape(player.name == self.name ? "Me" : player.name));
    $("#playerSelectInput").val("");
    panzoomMatrix = undefined;
    findMeIndex = 0;
    $(".gold").removeClass("gold")
    $("#PlayingPlayers [data-playerid='" + window.currentPlayer.id + "']").addClass("gold")
    $("#PlayingPlayers [data-playerid='" + window.currentPlayer.id + "'] a").addClass("gold")
    if (window.WL_Tournament.Tourn.Type == 2) { //Robin Round
        $(".TeamTip_" + (window.currentPlayer.team == "" ? window.currentPlayer.id : window.currentPlayer.team.replace("Team ", "").charCodeAt(0) - 65)).addClass("gold")
    } else { //Elimination Tournament
        getPlayerBoxes().find("a").addClass("gold")
    }
    if (noSearch != true) {
        window.findInTournament();
    }
}

function setupTournamentFindMe() {
    $("body").keyup(function (event) {
        // "Left" is pressed
        var boxes = getPlayerBoxes();
        var max = boxes.length - 1;
        if (event.which == 37) {
            findMeIndex = findMeIndex == 0 ? max : findMeIndex - 1;
            panzoomMatrix = undefined;
            findInTournament();
        }
        // "Right" is pressed
        else if (event.which == 39) {
            findMeIndex = findMeIndex == max ? 0 : findMeIndex + 1;
            panzoomMatrix = undefined;
            findInTournament();
        }
        // "Home" is pressed
        else if (event.which == 36) {
            findMeIndex = 0;
            panzoomMatrix = undefined;
            findInTournament();
        }
        // "End" is pressed
        else if (event.which == 35) {
            findMeIndex = boxes.length - 1;
            panzoomMatrix = undefined;
            findInTournament();
        }
    });
    window.players = []
    $("[href='#SettingsTab']").parent().after('<li id="findMe" class="ui-state-default ui-corner-top"><div style="cursor: pointer" class="ui-tabs-anchor" onclick="window.findNextInTournament()">Find <label id="activePlayer"></label></div><a id="showPlayerSelect">▼</a></li>');
    createSelector('#findMe:hover', 'border: 1px solid #59b4d4;background: #0078a3 url("https://d2wcw7vp66n8b3.cloudfront.net/jui4/images/ui-bg_glass_40_0078a3_1x400.png") 50% 50% repeat-x;font-weight: bold;color: #ffffff;border-bottom-width: 0')
    createSelector('#findMe', 'border: 1px solid #666666;border-bottom-width: 0')
    var css = '-webkit-keyframes pulsate{ 0% { background-color: rgba(0,0,0,0); } 50% { background-color: olive; } 100% { background-color: rgba(0,0,0,0); }}@keyframes pulsate { 0% { background-color: rgba(0,0,0,0); } 50% { background-color: olive; } 100% { background-color: rgba(0,0,0,0); }}.pulsate { -webkit-animation: pulsate 1s ease-in 1; -moz-animation: pulsate 1s ease-in 1; -ms-animation: pulsate 1s ease-in 1; -o-animation: pulsate 1s ease-in 1; animation: pulsate 1s ease-in 1;}-webkit-keyframes pulsate-border{ 0% { border: 3px solid #c4c2c4; } 25% { border: 3px solid red; } 50% { border: 3px solid red; } 100% { border: 3px solid #c4c2c4; }}@keyframes pulsate-border { 0% { border: 3px solid #c4c2c4; } 25% { border: 3px solid red; }50% { border: 3px solid red; } 100% { border: 3px solid #c4c2c4; }}.pulsate-border { -webkit-animation: pulsate-border 2s ease-in 1; -moz-animation: pulsate-border 2s ease-in 1; -ms-animation: pulsate-border 2s ease-in 1; -o-animation: pulsate-border 2s ease-in 1; animation: pulsate-border 2s ease-in 1;}'
    addCSS(css)
    $("#findMe").append('<div id="selectContainer"><div id="playerSelectInputContainer"><input placeholder="Search a Player" type="text" id="playerSelectInput"></input></div><div id="playerContainer"></div></div>');
    addCSS(`
        .TeamBox a {
            color: azure;
        }
    `)
    self = {
        id: warlight_shared_viewmodels_SignIn.get_CurrentPlayer().ID,
        name: warlight_shared_viewmodels_SignIn.get_CurrentPlayer().Name,
        fullID: String(warlight_shared_viewmodels_SignIn.get_CurrentPlayer().ProfileToken).substring(0, 2) + warlight_shared_viewmodels_SignIn.get_CurrentPlayer().ID + String(warlight_shared_viewmodels_SignIn.get_CurrentPlayer().ProfileToken).substring(2, 4),
        team: $("[data-playerid='" + warlight_shared_viewmodels_SignIn.get_CurrentPlayer().ID + "'] td:nth-of-type(2)").text()
    };
    window.setCurrentplayer(self, true);
    $.each($("#PlayingPlayers tr"), function (key, playerRow) {
        var id = $(playerRow).attr("data-playerid");
        var fullID = $(playerRow).find("a").get($(playerRow).find("a").length - 1).href.replace(/.*warzone.com\/Profile\?p=/, "");
        var name = $(playerRow).find("td a").text();
        var img = $(playerRow).find("td img").attr("src");
        var team = $("[data-playerid='" + id + "'] td:nth-of-type(2)").text();
        if (img && img.indexOf("MemberIcon") > -1) {
            img = "";
        }
        window.players.push({
            id: id,
            fullID: fullID,
            name: name,
            img: img,
            team: team
        });
    });
    $("#playerSelectInput").on('input', function (data) {
        $(".playerElement").remove();
        var search = $(this).val().toLowerCase();
        $("#playerContainer").append("<div class='playerElement' onclick='setCurrentplayer(self)'>" + self.name + " (Me)</div>")
        $.each(window.players, function (key, player) {
            if (player.name.toLowerCase().indexOf(search) > -1 && self.name != player.name) {
                var img = player.img ? "<img src='" + player.img + "'>" : "";
                $("#playerContainer").append("<div onclick='setCurrentplayer(players[" + key + "])' class='playerElement'>" + img + "<span>" + htmlEscape(player.name) + "</span>" + "</div>")
            }
        });
        $("#activePlayer").html(window.currentPlayer.name == self.name ? "Me" : window.currentPlayer.name);
        $("#playerContainer").scrollTop(0)
    });
    $("#playerSelectInput").trigger("input");
    $("#showPlayerSelect").on("click", function () {
        $("#selectContainer").toggle(100);
        $("#playerContainer").scrollTop(0);
        $("#playerSelectInput").trigger("input");
        $("#playerSelectInput").focus();
    });
    createSelector("#playerSelectInputContainer", "height: 28px; ");
    createSelector(".border-red", "border: 3px red solid !important; ");
    createSelector(".playerElement span, .playerElement img", "display:inline-block; margin-right: 10px");
    createSelector("#showPlayerSelect", "color: #DDDDDD;font-size: 14px;margin: 8px 10px 0px -3px;;cursor: pointer; display: inline-block;");
    createSelector("#playerSelectInput", "display: block;margin: 5px 3%;width: 93%;");
    createSelector("#activePlayer", "cursor:pointer; margin: 0");
    createSelector(".playerElement", "border-bottom: 1px gray solid;padding: 7px;color: white; clear:both; height: 30px; font-weight: normal;");
    createSelector(".playerElement:hover", "background: rgb(102, 102, 102);");
    createSelector("#playerContainer", "border: 2px gray solid; overflow-y: auto; overflow-x: hidden;max-height: 275px; min-width: 175px; ");
    createSelector(".gold", "color: gold!important")
    createSelector("#selectContainer", "cursor: pointer; background:rgb(23, 23, 23);position: fixed; z-index: 10;border: 2px gray solid;border-radius: 5px;box-shadow: 0 20px 50px 3px black;margin-top: 16px;display: none");
}

window.panzoomMatrix;
window.findInTournament = function () {
    var id;
    $("#selectContainer").hide(100);
    if ($("[href='#PlayersTab']").parent().hasClass("ui-state-active")) {
        id = window.currentPlayer.id;
        if ($("#PlayingPlayers [data-playerid='" + id + "']").length > 0) {
            var player = $("#PlayingPlayers [data-playerid='" + id + "']");
            var box = $("#CenterTabs").parent()
            var offset = player.offset().top - box.offset().top - box.height() / 2
            box.stop().animate({
                scrollTop: offset
            }, '500', 'swing');
            window.setTimeout(function () {
                $("#PlayingPlayers [data-playerid='" + window.currentPlayer.id + "']").addClass("pulsate");
                window.setTimeout(function () {
                    $(".pulsate").removeClass("pulsate");
                }, 1000);
            }, 250);
        } else {
            showInfo("You didn't join this tournament.", $("#findMe").offset().top + 25, $("#findMe").offset().left + 25);
        }
        // Elimination Tournament
    } else if ($("[href='#BracketTab']").parent().hasClass("ui-state-active") && window.WL_Tournament.Tourn.Type != 2) {
        id = window.currentPlayer.fullID;
        //Started
        if (window.WL_Tournament.Tourn.State >= 1 && $("#PlayingPlayers [data-playerid='" + window.currentPlayer.id + "']").length > 0) {
            if (!panzoomMatrix) {
                var currentMatrix = $("#Visualize").panzoom("getMatrix");
                $("#Visualize").panzoom("reset", {
                    animate: false
                });
                VisualizePanzoom.panzoom("zoom", {
                    increment: 0.75,
                    animate: false
                })
                var boxes = getPlayerBoxes();
                $(".TeamBoxHighlighted").removeClass("TeamBoxHighlighted");
                boxes.each(function (index, element) {
                    $(element).addClass("TeamBoxHighlighted");
                });
                var offsetTop = $(boxes.get(findMeIndex)).offset().top - $("#VisualizeContainer").offset().top - $("#VisualizeContainer").height() / 4;
                var offsetLeft = $(boxes.get(findMeIndex)).offset().left - $("#VisualizeContainer").offset().left - $("#VisualizeContainer").width() / 2;
                $(".border-red").removeClass("border-red");
                $(boxes.get(findMeIndex)).addClass("border-red");
                $("#Visualize").panzoom("pan", 0 - offsetLeft, 100 - offsetTop, {
                    relative: true,
                    animate: false
                });
                panzoomMatrix = $("#Visualize").panzoom("getMatrix");
                $("#Visualize").panzoom("setMatrix", currentMatrix, {
                    animate: false
                });
            }
            window.setTimeout(function () {
                $("#Visualize").panzoom("setMatrix", panzoomMatrix, {
                    animate: true
                })
                window.setTimeout(function () {
                    //getPlayerBoxes().addClass("pulsate-border");
                    window.setTimeout(function () {
                        $(".pulsate-border").removeClass("pulsate-border");
                    }, 2000)
                }, 400);
            }, 10)
        } else {
            showFindMeError();
        }
        // Robin Round Tournament
    } else if ($("[href='#BracketTab']").parent().hasClass("ui-state-active") && window.WL_Tournament.Tourn.Type == 2) {
        //Started
        if ($("#PlayingPlayers [data-playerid='" + window.currentPlayer.id + "']").length > 0) {
            $(".TeamTip_" + (window.WL_Tournament.Tourn.TeamSize == 1 ? window.currentPlayer.id : window.currentPlayer.team.replace("Team ", "").charCodeAt(0) - 65)).addClass("pulsate")
            window.setTimeout(function () {
                $(".pulsate").removeClass("pulsate")
            }, 2000)
        } else {
            showFindMeError()
        }
    }
}

function showFindMeError() {
    if ($("#PlayingPlayers [data-playerid='" + window.currentPlayer.id + "']").length == 0) {
        showInfo("You didn't join this tournament.", $("#findMe").offset().top + 25, $("#findMe").offset().left + 25);
    } else {
        showInfo("This tournament didn't start yet.", $("#findMe").offset().top + 25, $("#findMe").offset().left + 25);
    }
}

function getPlayerBoxes() {
    var boxes = $(".GameBox [href='/Profile?p=" + window.currentPlayer.fullID + "']").closest(".TeamBox");
    if (boxes.length == 0) {
        boxes = $(".GameBox a").map(function () {
            if ($(this).text() == window.currentPlayer.team) {
                return $(this).closest(".TeamBox");
            }
        });
    }
    return boxes;
}

function colorTournamentCreatorInChat() {
    var creatorLink = $("#HostLabel a:last").attr("href")
    addCSS(`
        #ChatContainer a[href='` + creatorLink + `'] {
            color: cornflowerblue
        }
    `)
}

function highlightEliminatedPlayers() {
    addCSS(`
        .eliminated {
            color: crimson;
            background: rgba(255,0,0,0.03);
        }
    `)
    var players = WL_Tournament.Players._players.store.h;
    var maxLosses;
    var tournamentType = WL_Tournament.Tourn.Type;
    if (tournamentType == 0 || tournamentType == 1) {
        if (tournamentType == 0) {
            //single elimination
            maxLosses = 1;
        } else if (tournamentType == 1) {
            //double elimination
            maxLosses = 2;
        }
        $.each(players, function (key, player) {
            if (player.NumLosses >= maxLosses) {
                //player is eliminated
                $("[data-playerid='" + key + "']").closest("tr").addClass("eliminated")
            }
        })
    }
}

function setupWhoInvitedMe() {
    console.log("running this");
    addCSS(`
        .whoInvited {
            font-size: 11px;
            color: gray!important;
            cursor: pointer;
            margin-bottom: 25px;
            display: inline-block;
        }
    `)
    window.setTimeout(function () {
        var id = $(".navbar a[href*='Profile']").attr("href").match(/[\/a-zA-Z\?=]*([0-9]*)/)[1].slice(2, -2);
        var invitedById = WL_Tournament.Players._players.store["h"][id].TP.InvitedBy.val;
        if (invitedById > 0) {
            var invitingPlayer = WL_Tournament.Players._players.store["h"][invitedById].TP.Player;
            var url = "/Profile?p=" + [String(invitingPlayer.ProfileToken).slice(0, 2), invitedById, String(invitingPlayer.ProfileToken).slice(-2)].join("");
            var a = $("<a>");
            a.addClass("whoInvited");
            a.attr("target", "_blank");
            a.text("Invited by " + invitingPlayer.Name);
            console.log(("#DataTables_Table_0").length)
            a.attr("href", url);
            $("#ShowAllBtn").prev().before(a)
            console.log(invitingPlayer)
        }
    }, 1500)
}

function setupTournamentTable() {
    if ($("#OpenTournamentTable").length == 0) {
        return;
    }
    if ($("#MyTournamentsTable").length == 0) {
        $(".SideColumn").prepend('<table class="dataTable" cellspacing="0" width="100%" id="MyTournamentsTable" style="text-align: left;"><thead><tr><td style="text-align: center" colspan="2">Open Tournament</td></tr></thead><tbody></tbody></table><br>');
        $("#MyTournamentsTable tbody").append($(".TournamentRow").detach());
    }

    $("#MyTournamentsTable thead td").attr("colspan", "2");
    addCSS(`
        #MyTournamentsTable tbody .TournamentRow {
            background-color: #131313;
            text-align: left;
        }
    `)
}
function setupBookmarkMenu() {
    bookmarkBody = "<label for='bookmarkName'>Name</label><input style='width:100%;color: lightgray;text-align: left;' type='text' id='bookmarkName'><br><br><label for='bookmarkURL'>Url</label><input style='width:100%; text-align: left; color: lightgray' id='bookmarkURL' type='text'><br><br><label for='bookmarkNewWindow'>Open in new Window</label><input style='float:left;' id='bookmarkNewWindow' type='checkbox'>";

    $("body").append(`
        <div class="modal modal-500 fade" id="bookmarkMenu" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Add Bookmark</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="d-flex flex-column">
                    <div style="padding:10px" class="d-flex flex-column">
                        <label for='bookmarkName'>Name</label>
                        <input type='text' id='bookmarkName'>
                        <label for='bookmarkURL'>Url</label>
                        <input id='bookmarkURL' type='text'>
                    </div>
                     <div class="form-check">
                        <label class="form-check-label">
                            <input id='bookmarkNewWindow' type='checkbox'>
                            Open in new Window
                        </label>
                    </div>
                </div>
              </div> 
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-success" data-dismiss="modal" onclick='saveBookmark()'>Save</button>
              </div>
            </div>
          </div>
        </div>
    `);

    createSelector(".highlightedBookmark", "background-color:rgb(50, 50, 50);cursor:pointer;");
    $("body").append("<ul class='context-menu bookmark-context'><li onclick='editBookmark()'>Edit</li><li onclick='moveBookmarkUp()'>Move up</li><li onclick='moveBookmarkDown()'>Move Down</li></ul>")
    $("body").append("<ul class='context-menu thread-context'><li onclick='hideThread()'>Hide</li></ul>")
    bindCustomContextMenu()

}

function setupBookmarkTable() {
    $(".SideColumn").prepend('<table class="dataTable" cellspacing="0" width="100%" id="BookmarkTable" style="text-align: left;"><thead><tr><td style="text-align: center">Bookmarks<img src="' + IMAGES.PLUS + '" width="15" height="15" onclick="showAddBookmark()"style="display:inline-block;float:right; opacity: 0.6; margin-right:15px; cursor: pointer"></td></tr></thead></table><br>');

    refreshBookmarks();
    bindBookmarkTable();
}

function refreshBookmarks() {
    Database.readAll(Database.Table.Bookmarks, function (bookmarks) {
        $("#BookmarkTable tbody").remove();
        bookmarks.sort(function (a, b) {
            return a.order - b.order
        })
        var data = "<tbody>";
        $.each(bookmarks, function (key, bookmark) {
            data += '<tr data-bookmarkId="' + bookmark.id + '" data-order="' + bookmark.order + '"><td><a ' + (bookmark.newWindow ? 'target="_blank"' : "") + ' href="' + bookmark.url + '">' + bookmark.name + '</a>';
            data += '<a onclick="deleteBookmark(' + bookmark.id + ')" style="display:inline-block;float:right; opacity: 0.6;cursor: pointer;margin-right:5px">';
            data += '<span class="ui-icon ui-icon-trash"></span></a></td></tr>';
        })

        $("#BookmarkTable").append(data + '</tbody>');
        warlight_shared_viewmodels_WaitDialogVM.Stop()

        $(".loader").fadeOut("fast", function () {
            if ($(".loader")) {
                $(".loader").remove();
                window.timeUserscriptReady = new Date().getTime();
                log("Time userscript ready " + (timeUserscriptReady - timeUserscriptStart) / 1000)
            }

        })
    })


}

window.bookmarkOrder;
window.bookmarkId;
window.showAddBookmark = function () {
    $("#bookmarkMenu").modal("show")
    bookmarkId = undefined
    bookmarkOrder = undefined
    $("#bookmarkURL").val("");
    $("#bookmarkName").val("");
    $("#bookmarkNewWindow").prop("checked", false);
}

window.editBookmark = function () {
    Database.read(Database.Table.Bookmarks, bookmarkId, function (bookmark) {
        $("#bookmarkURL").val(bookmark.url);
        $("#bookmarkName").val(bookmark.name);
        $("#bookmarkNewWindow").prop("checked", bookmark.newWindow);
        $("#bookmarkMenu").modal("show")
    })

}

window.moveBookmarkUp = function () {
    Database.readAll(Database.Table.Bookmarks, function (bookmarks) {
        var bookmark;
        var newIdx = -1
        $.each(bookmarks, function (key, bm) {
            if (bookmarkId == bm.id) {
                bookmark = bm
            }
        })
        bookmarks.sort(function (a, b) {
            return a.order - b.order
        });
        var previousBookmark1 = bookmarks[bookmarks.indexOf(bookmark) - 1]
        var previousBookmark2 = bookmarks[bookmarks.indexOf(bookmark) - 2] || {order: 0}
        if (previousBookmark1) {
            bookmark.order = (previousBookmark1.order + previousBookmark2.order) / 2

            Database.update(Database.Table.Bookmarks, bookmark, bookmark.id, function () {
                $("#bookmarkURL").val('');
                $("#bookmarkName").val('');
                $("#bookmarkNewWindow").prop('checked', false);
                $(".overlay").fadeOut();
                refreshBookmarks();
            })
        }
    })
}

window.moveBookmarkDown = function () {
    Database.readAll(Database.Table.Bookmarks, function (bookmarks) {
        var bookmark;
        var newIdx = -1
        $.each(bookmarks, function (key, bm) {
            if (bookmarkId == bm.id) {
                bookmark = bm
            }
        })
        bookmarks.sort(function (a, b) {
            return a.order - b.order
        });
        var nextBookmark1 = bookmarks[bookmarks.indexOf(bookmark) + 1]
        var nextBookmark2 = bookmarks[bookmarks.indexOf(bookmark) + 2] || {order: 100000}
        if (nextBookmark1) {
            bookmark.order = (nextBookmark1.order + nextBookmark2.order) / 2
            Database.update(Database.Table.Bookmarks, bookmark, bookmark.id, function () {
                $("#bookmarkURL").val('');
                $("#bookmarkName").val('');
                $("#bookmarkNewWindow").prop('checked', false);
                $(".overlay").fadeOut();
                refreshBookmarks();
            })
        }
    })
}


window.deleteBookmark = function (id) {
    Database.delete(Database.Table.Bookmarks, id, function () {
        refreshBookmarks();
    })
}

window.saveBookmark = function () {
    $("#bookmarkMenu").hide();
    var url = $("#bookmarkURL").val().trim();
    url = (url.lastIndexOf('http', 0) != 0) && (url.lastIndexOf('javascript', 0) != 0) ? "http://" + url : url;
    var name = $("#bookmarkName").val().trim();
    var newWindow = $("#bookmarkNewWindow").prop("checked");

    if (bookmarkId == undefined) {
        Database.readAll(Database.Table.Bookmarks, function (bookmarks) {
            bookmarks.sort(function (a, b) {
                return a.order - b.order
            })
            var bookmark = {
                name: name,
                url: url,
                newWindow: newWindow,
                order: (bookmarks.length > 0) ? bookmarks[bookmarks.length - 1].order + 1 : 1
            }
            Database.add(Database.Table.Bookmarks, bookmark, function () {
                showBookmarkTable();
                refreshBookmarks();
            })
        })
    } else {
        var bookmark = {
            name: name,
            url: url,
            newWindow: newWindow,
            order: bookmarkOrder
        }
        Database.update(Database.Table.Bookmarks, bookmark, bookmarkId, function () {
            showBookmarkTable();
            refreshBookmarks();
        })
    }

    $("#bookmarkURL").val('');
    $("#bookmarkName").val('');
    $("#bookmarkNewWindow").prop('checked', false);
    $(".overlay").fadeOut();
}

function hideBookmarkTable() {
    $("#BookmarkTable").hide();
    if ($("#BookmarkTable").next().is('br')) {
        $("#BookmarkTable").next().hide();
    }
}

function showBookmarkTable() {
    $("#BookmarkTable").show();
    if ($("#BookmarkTable").next().is('br')) {
        $("#BookmarkTable").next().show();
    }
}

window.bookmarkForumThread = function () {
    var title = $("title").text().replace(' - Play Risk Online Free - WarLight', '');
    var url = window.location.href;

    $("#bookmarkURL").val(url);
    $("#bookmarkName").val(title);
    showAddBookmark();

}
window.bookmarkTournament = function () {
    var title = $("#TournamentName").text().replace("Tournament: ", "").trim();
    var url = window.location.href;

    $("#bookmarkURL").val(url);
    $("#bookmarkName").val(title);
    showAddBookmark();

}

window.bookmarkLevel = function () {
    var title = $("h1").text()
    var url = window.location.href;

    $("#bookmarkURL").val(url);
    $("#bookmarkName").val(title);
    showAddBookmark();

}

function addDefaultBookmark() {
    var bookmark = {
        name: "Muli's userscript (Tidy up Your Dashboard)",
        url: "https://www.warlight.net/Forum/106092-tidy-up-dashboard-2",
        newWindow: false,
        order: 0
    }
    Database.add(Database.Table.Bookmarks, bookmark, function () {
        showBookmarkTable();
        refreshBookmarks();
    })
}

function bindBookmarkTable() {
    $("#BookmarkTable").bind("contextmenu", function (event) {
        $(".highlightedBookmark").removeClass("highlightedBookmark")
        var row = $(event.target).closest("tr");


        bookmarkId = row.attr("data-bookmarkid")
        bookmarkOrder = row.attr("data-order")

        if (bookmarkId && bookmarkOrder) {
            event.preventDefault();
            row.addClass("highlightedBookmark")
            // Show contextmenu
            $(".bookmark-context").finish().toggle(100).css({
                top: event.pageY + "px",
                left: event.pageX + "px"
            });
        }

    });
}

function setupLevelBookmark() {
    $("h1").after(`
       <a style="cursor:pointer" onclick="bookmarkLevel()">Bookmark</a><br>
    `)
}
function setupLadderClotOverview() {
    console.log("setupLadderClotOverview")
    $("h1").text($("h1").text() + " & Community Events")
    loadClots(function (clotInfo) {
        console.log("clotInfo")
        console.log(clotInfo)
        if (!clotInfo) {
            return
        }
        var clots = clotInfo

        var ladders = clots['leagues']
        var md = ""
        var rt = ""
        var leagues = ""
        var counter = 0
        $.each(ladders, function (key, val) {
            if (val.type == "realtime") {
                rt += "<li><big><a target='_blank' href=" + val.url + ">" + val.name + "</a> using Real-Time boot times</big></li><br><br>"
                counter++
            } else if (val.type == "multiday") {
                md += "<li><big><a target='_blank' href = " + val.url + ">" + val.name + "</a> using Multi-Day boot times</big></li><br><br>"
                counter++
            } else {
                leagues += `<li><big><a target='_blank' href="${val.url}">${val.name}</a> ${getPlayerString(val.players)}</big></li><br><br>`
                counter++
            }

        })
        $("#MainSiteContent > div").append("Warlight currently has " + toWords(counter) + " Community Events:<br><br>")

        $("#MainSiteContent > div").append("<ul id='clotInfo'></ul>")
        $("#clotInfo").append(rt)
        $("#clotInfo").append(md)
        $("#clotInfo").append(leagues)
    });
}

function getPlayerString(players) {
    if (players) {
        return `<span class='clotPlayers'>${players} players participating</span>`
    }
    return ""
}

function loadClots(cb) {
    log("loading clots");
    $.ajax({
        type: 'GET',
        url: 'https://raw.githubusercontent.com/psenough/wl_clot/master/hub/list.jsonp',
        dataType: 'text',
        crossDomain: true,
    }).done(function (response) {
        try {
            var response = eval(response);
            console.log(response.data)
            var json = response.data
            var clotInfo = JSON.stringify(json)
            sessionStorage.setItem('clots', clotInfo);
            if (cb) {
                cb(json)
            }

            var datetime = json.datetime
            log("clot update " + datetime)

        } catch (e) {
            log("Error parsing CLOTs")
            log(e)
        }
    }).fail(function (e) {
        log("Error loading CLOTs")
        log(e);
    });
}

function toWords(number) {

    var NS = [
        {value: 1000000000000000000000, str: "sextillion"},
        {value: 1000000000000000000, str: "quintillion"},
        {value: 1000000000000000, str: "quadrillion"},
        {value: 1000000000000, str: "trillion"},
        {value: 1000000000, str: "billion"},
        {value: 1000000, str: "million"},
        {value: 1000, str: "thousand"},
        {value: 100, str: "hundred"},
        {value: 90, str: "ninety"},
        {value: 80, str: "eighty"},
        {value: 70, str: "seventy"},
        {value: 60, str: "sixty"},
        {value: 50, str: "fifty"},
        {value: 40, str: "forty"},
        {value: 30, str: "thirty"},
        {value: 20, str: "twenty"},
        {value: 19, str: "nineteen"},
        {value: 18, str: "eighteen"},
        {value: 17, str: "seventeen"},
        {value: 16, str: "sixteen"},
        {value: 15, str: "fifteen"},
        {value: 14, str: "fourteen"},
        {value: 13, str: "thirteen"},
        {value: 12, str: "twelve"},
        {value: 11, str: "eleven"},
        {value: 10, str: "ten"},
        {value: 9, str: "nine"},
        {value: 8, str: "eight"},
        {value: 7, str: "seven"},
        {value: 6, str: "six"},
        {value: 5, str: "five"},
        {value: 4, str: "four"},
        {value: 3, str: "three"},
        {value: 2, str: "two"},
        {value: 1, str: "one"}
    ];

    var result = '';
    for (var n of NS) {
        if (number >= n.value) {
            if (number <= 20) {
                result += n.str;
                number -= n.value;
                if (number > 0) result += ' ';
            } else {
                var t = Math.floor(number / n.value);
                var d = number % n.value;
                if (d > 0) {
                    return intToEnglish(t) + ' ' + n.str + ' ' + intToEnglish(d);
                } else {
                    return intToEnglish(t) + ' ' + n.str;
                }

            }
        }
    }
    return result;
}
window.userscriptSettings = [
    {
        id: 'scrollGames',
        text: 'Fixed Window with Scrollable Games',
        selected: true,
        title: 'Dashboard',
        addBreak: false,
        help: 'This option displays My-, Open-, Coin-Games in a scrollable box, which removes a lot of unesessary scrolling. You can find tabs to switch between the different type of games. '
    },
    {
        id: 'hideMyGamesIcons',
        text: 'Hide Icons in "My Games"',
        selected: false,
        title: '',
        addBreak: false,
        help: 'This option hides game icons for My Games on the dashboard'
    },
    {
        id: 'autoRefreshOnFocus',
        text: 'Automatically Refresh Games on Tab-Focus',
        selected: true,
        title: '',
        addBreak: false,
        help: 'This option automatically refreshes your games after switching back to WarLight from a different tab / program. This only applies if WarLight was idle for 30 or more seconds.'
    },
    {
        id: 'highlightTournaments',
        text: 'Highlight Tournament Invites',
        selected: false,
        title: '',
        addBreak: false
    },
    {
        id: 'hideCoinsGlobally',
        text: 'Hide Coins Globally',
        selected: false,
        title: '',
        addBreak: false,
        help: 'This option removes everything from Warlight related to Coins'
    },
    {
        id: 'useDefaultBootLabel',
        text: 'Use the Default Boot Time Label',
        selected: false,
        title: 'Advanced',
        addBreak: false
    },
    {
        id: 'showPrivateNotesOnProfile',
        text: 'Show Private Notes on Profile',
        selected: true,
        title: '',
        addBreak: false,
        help: 'This option will show you your private notes which you made on a player directly on their profile page. You can find them on the left side under the profile picture.'
    },
    {
        id: 'hideOffTopic',
        text: 'Automatically Hide Off-Topic Threads',
        selected: false,
        title: '',
        addBreak: false,
        help: 'This option automatically hides all off-topic threads everytime you visit the All Forum Posts page'
    },
    {
        id: 'disableHideThreadOnDashboard',
        text: 'Disable Right-Click on the Forum Table',
        selected: false,
        title: '',
        addBreak: false,
        help: 'This option will allow you to right-click forum thread on the dashboard and use the default browser options.'
    }
];

/**
 * Creates the Userscript-Menu
 */
function setupUserscriptMenu() {
    addCSS(`
        /* The switch - the box around the slider */
        .switch {
            position: relative;
            width: 50px;
            height: 24px;
            margin-right: 30px;
            float: right;
        }

        /* Hide default HTML checkbox */
        .switch input {display:none;}

        /* The slider */
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          -webkit-transition: .4s;
          transition: .4s;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          -webkit-transition: .4s;
          transition: .4s;
        }

        input:checked + .slider {
          background-color: #0E5C83;
        }

        input:focus + .slider {
          box-shadow: 0 0 1px crimson;
        }

        input:checked + .slider:before {
          -webkit-transform: translateX(26px);
          -ms-transform: translateX(26px);
          transform: translateX(26px);
        }

        /* Rounded sliders */
        .slider.round {
          border-radius: 34px;
        }

        .slider.round:before {
          border-radius: 50%;
        }
        .settingsListItem {
            padding-top: 25px;
            font-size: 15px;
        }
    `);
    var inputs = '';
    $.each(userscriptSettings, function (key, setting) {
        if (setting.title != '') {
            inputs += `<div class="title">${setting.title}</div>`;
        }
        var help = setting.help != undefined ? `<img tabindex="0" class="help-icon" src="${IMAGES.QUESTION}" data-content="${getSettingInfo(setting.id)}" data-toggle="popover">` : '';
        inputs += '<div class="settingsListItem">' + setting.text + help + '<label class="switch"><input id="' + setting.id + '" type="checkbox"><div class="slider round"></div></label></div>';
        if (setting.addBreak) {
            inputs += '<hr>';
        }
    });
    $("body").append(`
        <div class="modal modal-750 fade" id="userscriptMenu" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Muli's Userscript  ${GM_info.script.version}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                ${inputs}
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary close-userscript" data-dismiss="modal">Close & Refresh</button>
              </div>
            </div>
          </div>
        </div>
    `);
    $("body").append('<ul class="custom-menu"><div class="content"></div></ul>');
    $("[data-toggle=popover]").popover({
        trigger: 'focus'
    });
    $("#userscriptMenu").on("change", function () {
        console.log("storing settings");
        storeSettingsVariables();
    });
    $("#AccountDropDown").next(".dropdown-menu").append('<div class="dropdown-divider"></div><a class="dropdown-item " href="#" data-toggle="modal" data-target="#userscriptMenu">Muli\'s Userscript</a>')
    $(".close-userscript").on("click", function () {
        $(".userscript-show").fadeOut();
        $(".overlay").fadeOut();
        location.reload();
    });
    $(".close-popup-img").on("click", function () {
        $(".userscript-show").fadeOut();
        $(".overlay").fadeOut();
        $("embed#main").css('opacity', '1');
    });
    $("#hideCoinsGlobally").parent().parent().after('<button class="btn btn-primary" data-toggle="modal" data-target="#dashboardTableSortMenu" style="margin-top:15px;">Sort Right Column Tables</button><br>');
    createSelector("#sortTables", "margin-top: 5px");
    addCSS(`
        .userscriptSettingsButtons {
            display: flex;
            justify-content: space-between;
            margin-top: 25px;
        }
    `);
    $("#userscriptMenu .modal-body").append("<div class='userscriptSettingsButtons'></div>");
    //Export settings button
    $(".userscriptSettingsButtons").append('<button data-target="#userscriptExportSettings" data-toggle="modal" id="exportSettings" class="btn btn-primary">Export Settings</button>')
    //Import settings button
    $(".userscriptSettingsButtons").append('<button data-toggle="modal" data-target="#userscriptImportSettings" class="btn btn-primary">Import Settings</button>')
    //Reset hidden threads button
    $(".userscriptSettingsButtons").append('<button id="resetHiddenThreads" class="btn btn-primary">Reset Hidden Threads</button>')
    $("body").append(`
        <div class="modal fade" id="userscriptExportSettings" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Export Settings</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                Copy or download this text and save it somewhere on your computer!
                <textarea id='exportSettingsBox'></textarea>
                <a id='downloadExportSettingsFile' href='' download='tuyd_settings.txt'>Download Text-File</a>
              </div>
              <div class="modal-footer">
                <button type="button" data-dismiss="modal" class="btn btn-primary close-userscript">Close</button>
              </div>
            </div>
          </div>
        </div>
    `);
    $("body").append(`
        <div class="modal fade" id="userscriptImportSettings" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Import Settings</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <textarea id='importSettingsBox' placeholder='Copy settings here'></textarea><button id='importSettings' class="btn btn-primary">Import Settings</button>
              </div>
              <div class="modal-footer">
                <button type="button" data-dismiss="modal" class="btn btn-primary close-userscript">Close</button>
              </div>
            </div>
          </div>
        </div>
    `);
    createSelector("#exportSettingsBox, #importSettingsBox", "width:100%; height: 300px")
    $("#exportSettings").on("click", function () {
        exportSettings();
    });
    $("#importSettings").on("click", function () {
        importSettings();
    });
    $("#resetHiddenThreads").on("click", function () {
        window.undoIgnore();
    });
    getSortTables(function (tables) {
        var tableCode = '';
        $.each(tables, function (key, table) {
            tableCode += '<div class="sortableLadder ' + (table.hidden ? 'tableSortHidden' : '') + '" data-name="' + table.name + '" data-tableId="' + table.id + '">' + table.name + '<div class="tableSortNavigation"><span class="tableSortUp">▲</span><span class="tableSortDown">▼</span><span class="tableSortHideShow"><img src="' + IMAGES.EYE + '"></span></div></div>'
        });
        createSelector(".sortableLadder", "border: 1px gray solid;margin: 5px;padding: 5px;background-color:rgb(25, 25, 25);");
        createSelector(".tableSortNavigation", "display: inline-block;float: right;margin-top: -2px;");
        createSelector(".tableSortNavigation span", "padding: 3px 10px; cursor: pointer");
        createSelector(".tableSortNavigation span:hover", "color: #C0D0FF");
        createSelector(".sortTableHighlight", "background-color: rgb(60, 60, 60)");
        createSelector(".tableSortHideShow img", "height: 10px");
        createSelector(".tableSortHidden", "opacity: 0.2;");
        $("body").append(`
            <div class="modal modal-500 fade" id="dashboardTableSortMenu" tabindex="-1" role="dialog">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLongTitle">Sort dashboard tables</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    ${tableCode}
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>                    
                    <button type="button" class="btn btn-primary" data-dismiss="modal" onclick="window.saveTableSort()">Save</button>
                  </div>
                </div>
              </div>
            </div>
        `);
        $(".close-popup-img").unbind();
        $(".close-popup-img").on("click", function () {
            $(".popup").fadeOut();
            $(".overlay").fadeOut();
        });
        $(".tableSortUp").on("click", function () {
            $(".sortTableHighlight").removeClass("sortTableHighlight");
            var table = $(this).closest(".sortableLadder");
            table.addClass("sortTableHighlight");
            var prev = table.prev();
            table = table.detach();
            prev.before(table)
        });
        $(".tableSortDown").on("click", function () {
            $(".sortTableHighlight").removeClass("sortTableHighlight");
            var table = $(this).closest(".sortableLadder");
            table.addClass("sortTableHighlight");
            var next = table.next();
            table = table.detach();
            next.after(table)
        });
        $(".tableSortHideShow").on("click", function () {
            $(".sortTableHighlight").removeClass("sortTableHighlight");
            var table = $(this).closest(".sortableLadder");
            table.addClass("sortTableHighlight");
            table.toggleClass("tableSortHidden")
        });
        checkUserscriptMenuButtons();
    })
}

function importSettings() {
    var deferredCount = 0;
    var resolvedCount = 0;
    var clearPromises = [];
    $.each(Database.Table, function (key, table) {
        clearPromises[deferredCount++] = $.Deferred();
        Database.clear(table, function () {
            clearPromises[resolvedCount++].resolve();
        })
    });
    if (WLJSDefined()) {
        warlight_shared_viewmodels_WaitDialogVM.Start("Importing Settings...")
    }
    $('.modal').modal("hide");
    var settings = $("#importSettingsBox").val().trim();
    $.when.apply($, clearPromises).done(function () {
        var deferredCount = 0;
        var resolvedCount = 0;
        var promises = [];
        try {
            settings = JSON.parse(atob(settings))
            $.each(settings, function (key, data) {
                var table = data.table
                var content = data.data
                $.each(content, function (key, value) {
                    promises[deferredCount++] = $.Deferred();
                    Database.add(table, value, function () {
                        promises[resolvedCount++].resolve();
                    })
                })
            });
            $.when.apply($, promises).done(function () {
                window.location.reload();
            })
        } catch (e) {
            log(e);
            if (WLJSDefined()) {
                warlight_shared_viewmodels_WaitDialogVM.Stop();
                warlight_shared_viewmodels_AlertVM.DoPopup("There was an error importing the settings.");
            }
            $(".overlay").fadeOut();
        }
    });
}

function exportSettings() {
    var settings = [];
    var deferredCount = 0;
    var resolvedCount = 0;
    var promises = [];
    $.each(Database.Exports, function (key, table) {
        promises[deferredCount++] = $.Deferred();
        Database.readAll(table, function (data) {
            settings.push({
                table: table,
                data: data
            });
            promises[resolvedCount++].resolve();
        })
    });
    $.when.apply($, promises).done(function () {
        var settingsString = btoa(JSON.stringify(settings));
        $("#exportSettingsBox").html(settingsString);
        showPopup(".exportSettings-show");
        $("#downloadExportSettingsFile").click(function () {
            this.href = "data:text/plain;charset=UTF-8," + settingsString;
        });
    });
}

function showPopup(selector) {
    if ($(selector).length > 0) {
        $(".popup").fadeOut();
        $(selector).fadeIn();
        $(".overlay").fadeIn();
        makePopupVisible();
    }
}

function makePopupVisible() {
    let popup = $(".popup600:visible");
    if (popup.offset() && popup.offset().top + popup.height() + 150 > $(window).height() || (popup.offset() && popup.offset().top < 100)) {
        popup.css("margin-top", $(window).height() - 250 - popup.height());
        $(".popup600:visible .head").css("margin-top", $(window).height() - 250 - popup.height() + 2)
    }
}

function getSortTables(callback) {
    var defaultTables = [
        {
            id: "#BookmarkTable",
            name: "Bookmarks",
            hidden: false,
            order: 0
        },
        {
            id: "#MyTournamentsTable",
            name: "Open Tournaments",
            hidden: false,
            order: 2
        },
        {
            id: "#MapOfTheWeekTable",
            name: "Map of the Week",
            hidden: false,
            order: 4
        },
        {
            id: "#ForumTable",
            name: "Forum Posts",
            hidden: false,
            order: 5
        },
        {
            id: "#ClanForumTable",
            name: "Clan Forum Posts",
            hidden: false,
            order: 6
        },
        {
            id: "#BlogTable",
            name: "Recent Blog Posts",
            hidden: false,
            order: 7
        },
        {
            id: "#LeaderboardTable",
            name: "Coin Leaderboard",
            hidden: false,
            order: 8
        }
    ];
    if ($("#ShopTable").length > 0) {
        defaultTables.push({
            id: "#ShopTable",
            name: "WarLight Shop",
            hidden: false,
            order: -1
        })
    }
    if ($(".dataTable thead td:contains('Quickmatch')").length > 0) {
        defaultTables.push({
            id: ".dataTable thead:contains('Quickmatch')",
            name: "Quickmatch",
            hidden: false,
            order: 1
        })
    }
    Database.readIndex(Database.Table.Settings, Database.Row.Settings.Name, "tableSort", function (tableData) {
        if (tableData && tableData.value.length > 3) {
            var tables = tableData.value;
            if ($("#ShopTable").length > 0 && !arrayHasObjWithId(tables, "#ShopTable")) {
                tables.push({
                    id: "#ShopTable",
                    name: "WarLight Shop",
                    hidden: false,
                    order: -1
                })
            }
            if ($(".dataTable thead td:contains('Quickmatch')").length > 0 && !arrayHasObjWithId(tables, ".dataTable thead:contains('Quickmatch')")) {
                tables.push({
                    id: ".dataTable thead:contains('Quickmatch')",
                    name: "Quickmatch",
                    hidden: false,
                    order: 1
                })
            }
            callback($(tables).sort(compareTable));
        } else {
            callback($(defaultTables).sort(compareTable))
        }
    })
}

function arrayHasObjWithId(arr, id) {
    var found = false;
    $.each(arr, function (key, val) {
        if (val.id == id) {
            found = true;
        }
    });
    return found;
}

window.saveTableSort = function () {
    var tables = [];
    $.each($("#dashboardTableSortMenu div.sortableLadder"), function (key, table) {
        var order = key;
        var id = $(table).attr('data-tableId');
        var hidden = $(table).hasClass("tableSortHidden");
        var name = $(table).attr('data-name');
        tables.push({
            id: id,
            name: name,
            hidden: hidden,
            order: order
        })
    });
    var tableSort = {
        name: "tableSort",
        value: tables
    };
    Database.update(Database.Table.Settings, tableSort, undefined, function () {
        $("#sortTablePopup").fadeOut();
        $(".overlay").fadeOut();
        refreshOpenGames();
    })
};

function compareTable(a, b) {
    if (a.order < b.order) return -1;
    if (a.order > b.order) return 1;
    return 0;
}

window.getSettingInfo = function (id) {
    var help = "";
    $.each(userscriptSettings, function (key, setting) {
        if (setting.id == id) {
            help = setting.help;
        }
    });
    return help;
};

function checkUserscriptMenuButtons() {
    $.each(userscriptSettings, function (key, set) {
        Database.readIndex(Database.Table.Settings, Database.Row.Settings.Name, set.id, function (setting) {
            if (setting) {
                $("#" + setting.name).prop("checked", setting.value);
            } else {
                $("#" + set.id).prop("checked", set.selected);
            }
        })
    });
}

/**
 * Stores User-Settings to local Storage
 */
function storeSettingsVariables() {
    $.each(userscriptSettings, function (key, set) {
        var isEnabled = $("#" + set.id).prop("checked");
        var setting = {
            name: set.id,
            value: isEnabled
        };
        Database.update(Database.Table.Settings, setting, undefined, function () {
        })
    });
}

function setupSettingsDatabase() {
    if (WLJSDefined()) {
        warlight_shared_viewmodels_WaitDialogVM.Start("Setting up Muli's Userscript...")
    }
    var promises = [];
    $.each(userscriptSettings, function (key, set) {
        promises[key] = $.Deferred();
        var setting = {
            name: set.id,
            value: set.selected
        };
        Database.update(Database.Table.Settings, setting, undefined, function () {
            promises[key].resolve();
        })
    });
    $.when.apply($, promises).done(function () {
        sessionStorage.setItem("showUserscriptMenu", true);
        window.setTimeout(window.location.reload(), 2000)
    })
}

function ifSettingIsEnabled(setting, positive, negative, cb) {
    Database.readIndex(Database.Table.Settings, Database.Row.Settings.Name, setting, function (setting) {
        if (setting && setting.value) {
            positive();
            if (typeof cb == "function") {
                cb();
            }
        } else {
            if (typeof negative == 'function') {
                negative();
            }
            if (typeof cb == 'function') {
                cb();
            }
        }
    })
}
function pageIsMultiplayer() {
    return location.href.match(/.*warzone[.]com\/MultiPlayer.*/i);
}

function pageIsPointsPage() {
    return location.href.match(/.*warzone[.]com\/Points.*/i);
}

function pageIsDashboard() {
    return location.href.match(/.*warzone[.]com\/MultiPlayer\/(?:#|\?|$).*$/i);
}

function pageIsProfile() {
    return location.href.match(/.*warzone[.]com\/profile\?p=[0-9]+$/i);
}

function pageIsClanPage() {
    return location.href.match(/.*warzone[.]com\/Clans\/\?ID=[0-9]+$/i);
}

function pageIsLevelOverview() {
    return location.href.match(/.*warzone[.]com\/SinglePlayer\/Level\?ID=[0-9]+$/i);
}

function pageIsLevelPlayLog() {
    return location.href.match(/.*warzone[.]com\/SinglePlayer\/PlayLog\?ID=[0-9]+$/i);
}

function pageIsMapsPage() {
    return location.href.match(/.*warzone[.]com\/maps/i);
}

function pageIsNewThread() {
    return location.href.match(/.*warzone[.]com\/Forum\/NewThread.*/i);
}

function pageIsForumThread() {
    return location.href.match(/.*warzone[.]com\/Forum\/[0-9]+.*/i);
}

function pageIsForumOverview() {
    return location.href.match(/.*warzone[.]com\/Forum\/Forum.*/i);
}

function pageIsThread() {
    return location.href.match(/.*warzone[.]com\/(Forum|Discussion|Clans\/CreateThread).*/i);
}

function pageIsSubForum() {
    return location.href.match(/.*warzone[.]com\/Forum\/[A-Z]+.*/i);
}

function pageIsForum() {
    return location.href.match(/.*warzone[.]com\/Forum\/.*/);
}

function pageIsLadderOverview() {
    return location.href.match(/.*warzone[.]com\/Ladders/);
}

function pageIsLogin() {
    return location.href.match(/.*warzone[.]com\/LogIn.*/);
}

function pageIsClanForumThread() {
    return location.href.match(/.*warzone[.]com\/Discussion\/\?ID=[0-9]+.*/);
}

function pageIsTournament() {
    return location.href.match(/.*warzone[.]com\/MultiPlayer\/Tournament\?ID=[0-9]+/i);
}

function pageIsTournamentOverview() {
    return location.href.match(/.*warzone[.]com\/MultiPlayer\/Tournaments\/$/i);
}

function pageIsGame() {
    return location.href.match(/.*warzone[.]com\/MultiPlayer\?GameID=[0-9]+/i);
}

function pageIsExamineMap() {
    return location.href.match(/.*warzone[.]com\/SinglePlayer\?PreviewMap.*/i);
}

function pageIsDesignMap() {
    return location.href.match(/.*warzone[.]com\/MultiPlayer\?DesignMaps.*/i);
}

function pageIsCommonGames() {
    return location.href.match(/.*warzone[.]com\/CommonGames\?p=[0-9]+$/i);
}

function pageIsCommunityLevels() {
    return location.href.match(/.*warzone[.]com\/SinglePlayer\/CommunityLevels/i);
}

function pageIsCommunity() {
    return location.href.match(/.*warzone[.]com\/Community/i);
}

function pageIsMapOfTheWeek() {
    return location.href.match(/.*warzone[.]com\/MapOfTheWeek.*/i);
}

function pageIsBlacklistPage() {
    return location.href.match(/.*warzone[.]com\/ManageBlackList.*/i);
}

function pageIsMapPage() {
    return location.href.match(/.*warzone[.]com\/Map.*/i);
}

function pageIsMyAccount() {
    return location.href.match(/.*warzone[.]com\/MyAccount.*/i);
}

function mapIsPublic() {
    return $("a:contains('Start a')").length > 0;
}
function addCSS(css) {
    var head = document.head || document.getElementsByTagName('head')[0]
    var style = document.createElement('style');
    style.type = 'text/css';
    if (head) {
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
    } else {
        $$$(document).ready(function () {
            addCSS(css)
        })
    }
}

/**
 * Create a CSS selector
 * @param name The name of the object, which the rules are applied to
 * @param rules The CSS rules
 */
function createSelector(name, rules) {
    var head = document.head || document.getElementsByTagName('head')[0]
    var style = document.createElement('style');
    style.type = 'text/css';
    if (head) {
        head.appendChild(style);
        if (!(style.sheet || {}).insertRule) {
            (style.styleSheet || style.sheet).addRule(name, rules);
        } else {
            style.sheet.insertRule(name + "{" + rules + "}", 0);
        }
    } else {
        $$$(document).ready(function () {
            createSelector(name, rules)
        })
    }
}

function setGlobalStyles() {
    /** Warzone **/
    addCSS(`
        body > .container-fluid {
            font-size: 15px;
        }
        .modal-1000 .modal-dialog {
            max-width: 1000px;
        }        
        .modal-750 .modal-dialog {
            max-width: 750px;
        }
        .modal-500 .modal-dialog {
            max-width: 500px;
        }
        .modal-dialog {
            border: 1px gray solid;
        }
        .modal-header {
            background-image: radial-gradient(circle at center,#88888855,transparent),url(https://warzonecdn.com/Images/Warzone/MainNavBacking2.jpg);
            background-repeat: no-repeat,repeat;
            background-size: 100% 100%,194px 194px;
           }   
        .modal-content {
            background-image: linear-gradient(-10deg,#33333322 0%,transparent 70%),url(https://warzonecdn.com/Images/Warzone/Background2.jpg);
            background-repeat: no-repeat,repeat;
            background-size: 100% 100%,10px 15px;
            color: grey;
        }   
        .modal-content a {
            color: #5a9da5;
        }
        .modal-content .title {
            border-bottom: 1px solid #928f59;
            margin-top: 25px;
        }
        .p-4 table {
            width: 100%;
        }
        .GameRow p {
            margin: 0 !important;
        }
        h2, h3 {
            font-size: 25px;
        }
        img[src*='/Images/X.png'] {
            width: 100%; 
            height: 100%;
        }
    `)

    /** Warlight **/

    $("tr:contains('WarLight Shop')").closest(".dataTable").attr("id", "ShopTable");
    createSelector('.help-icon', 'display:inline-block;position:absolute; margin-left:10px;margin-top: 2px;cursor:pointer; height: 15px; width: 15px;')
    var winHeight = $(window).height();
    createSelector(".popup", "position: fixed;;left: 50%;background: #171717;top: 100px;z-index: 9999; color:white;padding:60px 30px 30px 30px;border: 2px solid gray;border-radius:8px;max-height:" + (winHeight - 200) + "px;overflow-y:auto");
    createSelector(".close-popup-img", "float:right;margin:5px;cursor:pointer;margin-right: 20px");
    addCSS(`.popup .title {
                color: crimson;
                font-size: 15px;
                margin-top: 10px;
                display: inline-block;
                width: 95%;
                padding-bottom: 3px;
                border-bottom: 1px solid crimson;
            }`)
    createSelector(".popup input[type='checkbox']", "width: 20px;height: 20px;margin-left:30px;margin: 5px;");
    createSelector(".overlay", "position: absolute;background: white;top: 0;left: 0;right: 0;bottom: 0;z-index: 98;opacity: 0.5;width: 100%;height: 100%;position: fixed;");
    createSelector(".popup .head", "position: fixed;height: 40px;background: #330000;width: 660px;left: 0;right: 0;top: 100px;color: white;font-size: 15px;text-align: center;line-height: 40px;border-top-left-radius:8px;border-top-right-radius:8px;margin:auto;z-index:10000;");
    createSelector(".userscript-show", "display:none");
    createSelector(".newSetting", "color: gold;font-weight: bold;");
    createSelector(".userscript-menu img", "height: 18px;display: inline-block;position: relative;margin-bottom: -5px;margin-right: 7px;");
    createSelector(".custom-menu", "display: none;z-index: 98;position: absolute;overflow: hidden;border: 1px solid #CCC;white-space: nowrap;font-family: sans-serif;background: #FFF;color: #333;border-radius:5px;padding: 10px;z-index:100000000; cursor:pointer");
    createSelector(".custom-menu .content", "width: 300px;white-space: pre-wrap;");
    createSelector('.popup input[type="text"]', 'display: inline-block;background: none;border-top: none;border-left: none;border-right: none;color: green;font-size: 15px;border-bottom: 1px white dashed;font-family: Verdana;padding: 0 5px 0 5px;text-align: center;margin-right: 5px');
    createSelector(".popup840", "width: 840px;margin-left: -452px");
    createSelector(".popup600", "width: 600px;margin-left: -332px");
    createSelector(".popup840 .head", "width: 900px");
    createSelector(".popup600 .head", "width: 660px");
    createSelector(".context-menu", "display: none;z-index: 100;position: absolute;overflow: hidden;border: 1px solid #CCC;white-space: nowrap;font-family: sans-serif;background: #FFF;color: #333;border-radius: 5px;padding: 0;");
    createSelector(".context-menu li", "padding: 8px 12px;cursor: pointer;list-style-type: none;");
    createSelector(".context-menu li:hover", "background-color: #DEF;");
    createSelector("#MyGamesTable select", "margin: 0 10px 0 5px; width: 125px")
    createSelector("#MyGamesFilter", "float:right")
    createSelector("#MyGamesTable thead tr", "text-align: right")
    $("body").on("click", function (e) {
        if ($(".custom-menu").is(':visible')) {
            $(".custom-menu").hide(100);
        }
    });
}

function loadDataTableCSS() {
    var styles = document.createElement("style");
    styles.type = "text/css";
    styles.innerHTML = getDataTableCSS();
    document.body.appendChild(styles);
}

function getDataTableCSS() {
    return `table.dataTable thead td,table.dataTable thead th{padding:6px 18px 6px 6px}table.dataTable tfoot td,table.dataTable tfoot th{padding:10px 18px 6px;border-top:1px solid #111}table.dataTable thead .sorting,table.dataTable thead .sorting_asc,table.dataTable thead .sorting_desc{cursor:pointer}table.dataTable thead .sorting,table.dataTable thead .sorting_asc,table.dataTable thead .sorting_asc_disabled,table.dataTable thead .sorting_desc,table.dataTable thead .sorting_desc_disabled{background-repeat:no-repeat;background-position:center right}table.dataTable thead .sorting{background-image:url(https://cdn.datatables.net/1.10.10/images/sort_both.png)}table.dataTable thead .sorting_asc{background-image:url(https://cdn.datatables.net/1.10.10/images/sort_asc.png)}table.dataTable thead .sorting_desc{background-image:url(https://cdn.datatables.net/1.10.10/images/sort_desc.png)}table.dataTable thead .sorting_asc_disabled{background-image:url(https://cdn.datatables.net/1.10.10/images/sort_asc_disabled.png)}table.dataTable thead .sorting_desc_disabled{background-image:url(https://cdn.datatables.net/1.10.10/images/sort_desc_disabled.png)}.dataTables_wrapper{position:relative;clear:both;zoom:1}#PlayersContainer td{white-space:nowrap}

    .dataTables_filter {
	float: right;
    }

    .dataTables_filter label {
        display: inline!important;
    }    

    .dataTables_filter input {
        padding: 3px;
        border-radius: 5px;
        margin: 5px;
    }

    .dataTables_info {
        clear: both;
        padding-top: 10px;
    }

    .pagination {
        display: inline-block;
        float: right;

    }
    #foundClansTable_wrapper .row {
        width: 100%;
    }
    .paginate_button {
        display: inline;
        padding: 5px;
    }.paginate_button.active {
        text-decoration: underline;
    }`
}
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
function setupWLError() {
    window.wlerror = window.onerror
    window.onerror = windowError
    window.timeDomContentReady = new Date().getTime();
    log("Time DOM content ready " + (timeDomContentReady - timeUserscriptStart) / 1000)
    log("DOM content ready")

    window.WLError = function (a, b) {
        logError(a)
        null == a && (a = "");
        console.log("WLError: " + a + ", silent=" + b);
        -1 != a.indexOf("NotAuth") ? location.reload() : -1 != a.indexOf("WarLight Server returned CouldNotConnect") ? CNCDialog() : -1 == a.indexOf("TopLine is not defined") && -1 == a.indexOf("_TPIHelper") && -1 == a.indexOf("Syntax error, unrecognized expression: a[href^=http://]:not([href*=") && -1 == a.indexOf("y2_cc2242") && -1 == a.indexOf("Error calling method on NPObject") && (-1 != a.indexOf("WARLIGHTERROR48348927984712893471394") ? a = "ServerError" : -1 !=
            a.indexOf("WARLIGHTHEAVYLOAD48348927984712893471394") && (a = "HeavyLoad"), ReportError(a), b || PopErrorDialog(a))
    }
}
function hideCoinsGlobally() {
    $("#LeaderboardTable").prev().remove();
    $("#LeaderboardTable").css({
        opacity: 0,
        cursor: 'default'
    });
    $("#LeaderboardTable a").css('display', 'none');
    $("body").find("a[href='/Coins/']").css('display', 'none');

    $("a[href='/Win-Money']").css('display', 'none');
    $("#OpenTournamentsTable").css('display', 'none');
}

function updateTotalPointsEarned() {
    var pointsEarned = {
        name: "totalPoints",
        value: warlight_shared_points_PointValues.Get(warlight_shared_viewmodels_SignIn.get_CurrentPlayer().Level).RawPoints + warlight_shared_viewmodels_SignIn.get_CurrentPlayer().PointsThisLevel
    }
    Database.update(Database.Table.Settings, pointsEarned, undefined, function () {
    })
}
function hideExtraBlanks() {
    var content = $(".container .my-2:first-of-type div.p-3");
    var replacement = '<br><br>';
    content.html(content.html().replace(/(<br\s*\/?>){3,}/gi, replacement))
}

function foldProfileStats() {
    addCSS(`
        h3.expander  {
            cursor: pointer;
    `);
    $.each($("big").parent().contents(), function (key, val) {
        if (val.nodeType == 3) {
            $(val).replaceWith(`<span>${val.data}</span>`)
        }
    });
    $.each($(".container .my-2:first-of-type div.p-3 h3"), function (key, val) {
        $(val).addClass("expander");
        $(val).nextUntil("h3").wrapAll("<div class='exp'></div>")
    });
    $('h3.expander').click(function (e) {
        $(this).next().slideToggle();
    });
}

function showGlobalWinRate() {
    var regex = /\((\d*)[^\d]*(\d*).*\)/g;
    let $h3 = $("h3:contains('Ranked Games')");
    var text = $h3.next().find("span:contains('ranked games')").text();
    var matches = regex.exec(text);
    $h3.next().find("span:contains('ranked games')").append(", " + Math.round(matches[1] / matches[2] * 100) + "%")
}

function loadCommunityLevelRecords() {
    var id = location.href.match(/([0-9]*)$/i)[1];
    $.ajax({
        type: 'GET',
        url: `https://w115l144.hoststar.ch/wl/communityLevels.php?m=11&p=${id}`,
        dataType: 'jsonp',
        crossDomain: true
    }).done(function (response) {
        if (response.data) {
            console.log(response.data);
            var records = response.data[0].numRecords;
            $("h3:contains('Single-player stats')").after(`<font class="text-muted">Community Levels:</font> <span> ${records} record${records != 1 ? "s" : ""}</span>`);
            console.log(response);
        }
    });
}


function loadPrivateNotes() {
    log("Loading private notes");
    $("#FeedbackMsg").after('<div class="profileBox" id="privateNotes"><h3>Private Notes</h3><p style="width: 285px;overflow:hidden" class="content">Loading Privates Notes..</p></div>');
    var url = $("img[alt='Private Notes']").parent()[0].href;
    var page = $('<div />').load(url, function () {
        var notes = page.find('#PostForDisplay_0').html().trim();
        if (notes) {
            $('#privateNotes .content').html(notes);
        } else {
            $('#privateNotes .content').html('You don\'t have any Private Notes.');
        }

    });
}
function databaseReady() {
    log("Running main")
    if (pageIsForumOverview()) {
        ifSettingIsEnabled("hideOffTopic", function () {
            hideOffTopicThreads()
        })
        formatHiddenThreads();
    }
    if (pageIsCommunityLevels()) {
        setupCommunityLevels()
    }

    if (pageIsForumOverview() || pageIsSubForum()) {
        setupSpammersBeGone()
        addCSS(`
            #MainSiteContent > table table tr td:nth-of-type(4), #MainSiteContent > table table tr td:nth-of-type(5) {
                max-width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
    
        `)
    }
    if (pageIsProfile() && $("#BlackListImage").length > 0) {
        ifSettingIsEnabled('showPrivateNotesOnProfile', function () {
            loadPrivateNotes();
        })
    }
    if (pageIsTournamentOverview()) {
        log("loading tournament data")
        updateAllTournamentData();
    }
    if (pageIsCommunity()) {
        hideIgnoredForumThreadsFromCommnuityList();
    }
    if (pageIsTournament()) {
        updateCurrentTournamentData()
        $("#JoinBtn").on("click", updateCurrentTournamentData)
    }
    if (pageIsBlacklistPage()) {
        $("#MainSiteContent ul").before(`<span id="numBlacklisted">You have <b>${$("#MainSiteContent ul li:visible").length}</b> players on your blacklist.</span>`)
        window.setInterval(function () {
            $("#numBlacklisted").replaceWith(`<span id="numBlacklisted">You have <b>${$("#MainSiteContent ul li:visible").length}</b> players on your blacklist.</span>`)
        }, 500)
    }
    if (pageIsPointsPage()) {
        Database.readIndex(Database.Table.Settings, Database.Row.Settings.Name, "totalPoints", function (res) {
            if (res) {
                $(".container.px-4").append(`<br><span>In total, you've earned <b>${res.value.toLocaleString("en")}</b> points.</span>`)
            } else {
                $(".container.px-4").append(`<br><span>Visit the Dashboard once to see how many points you've earned in total.</span>`)
            }
        })
    }
    if (pageIsDashboard()) {
        setupVacationAlert();

        window.StringTools.htmlEscape = function (a) {
            if (a.indexOf("##joined##") >= 0) {
                a = a.replace("##joined##", "");
                return htmlEscape(a) + '<img style="display:inline-block;height:16px;width:16px;margin-left:10px;z-index:10;cursor:default" src="https://i.imgur.com/6akgXa7.png" title="You already joined this game">';
            } else {
                return htmlEscape(a);
            }
        }
        hideBlacklistedThreads();
        setupBasicDashboardStyles();
        Database.readIndex(Database.Table.Settings, Database.Row.Settings.Name, "customFilter", function (f) {
            var filter = (f && f.value) ? f.value : 4;
            refreshMyGames();
        })
        ifSettingIsEnabled('hideCoinsGlobally', function () {
            hideCoinsGlobally()
        })
        ifSettingIsEnabled('useDefaultBootLabel', function () {
            createSelector(".BootTimeLabel", "z-index:50;");
        }, function () {
            createSelector(".BootTimeLabel", "color:white !important;font-weight:normal!important;font-style:italic;font-size:13px!important;z-index:50;");
        })
        ifSettingIsEnabled("highlightTournaments", function () {
            createSelector("#MyTournamentsTable tbody", "background:#4C4C33;");
        })
        ifSettingIsEnabled("hideMyGamesIcons", function () {
            createSelector("#MyGamesTable td div > img, #MyGamesTable td div a > img", "display:none;");
        })
        ifSettingIsEnabled("scrollGames", function () {
            setupFixedWindowWithScrollableGames();
        }, function () {
            createSelector("body", "overflow: auto")
            createSelector("#MainSiteContent > table", "width: 100%;max-width: 1400px;")
            addCSS(`
                @media (max-width: 1050px) {
                   #MyGamesTable > thead > tr * {
                        font-size: 14px;
                    }
                    #MyGamesTable > thead > tr > td > div:nth-of-type(1) {
                        margin-top: 5px!important;
                        display: block;
                        float: left;
                        padding-right: 5px;
                    }
                }

                @media (max-width: 750px) {
                    #MyGamesTable > thead > tr > td > div:nth-of-type(1) {
                        display:none;
                    }
                }`)
        }, function () {
            setupRightColumn(true);
            refreshOpenGames();
            setupOpenGamesFilter();
        })
        $("label#MultiDayRadio").on("click", function () {
            registerGameTabClick()
        });
        $("label#RealTimeRadio").on("click", function () {
            registerGameTabClick()
        });
        $("label#BothRadio").on("click", function () {
            registerGameTabClick()
        });
        $(window).resize(function () {
            ifSettingIsEnabled("scrollGames", function () {
                refreshSingleColumnSize();
            }, undefined, function () {
                makePopupVisible()
            })
        });
        window.setTimeout(setupRefreshFunction, 00);
        updateTotalPointsEarned()
    } else {
        ifSettingIsEnabled('hideCoinsGlobally', function () {
            hideCoinsGlobally();
        })
    }
}
function DOM_ContentReady() {
    $.cookie("UjsBig", "true", {expires: 7, path: "/"});
    $(".order-xl-2").addClass("SideColumn");

    log("DOM content ready")
    if ($(".navbar").length > 0) {
        log("Unity is not full screen")
    } else {
        log("Unity is full screen")
        return;
    }

    //Add tournament link to multiplayer
    $(".dropdown a[href='/MultiPlayer?CreateGame=1']").after('<a class="dropdown-item" href="/MultiPlayer/Tournaments/">Tournaments</a>')
    setupWLError();
    createSelector('body > footer', 'display:none');

    $.fn.outerHTML = function (s) {
        return s ? this.before(s).remove() : jQuery("<p>").append(this.eq(0).clone()).html();
    };

    if (pageIsNewThread()) {
        $("[onclick='undoIgnore()']").closest("th").remove();
        $(".checkbox").closest("td").remove()
    }

    if (document.getElementById("MyGamesFilter") != null) {
        document.getElementById("MyGamesFilter").onchange = null
    }
    $("#MyGamesFilter").on("change", function () {
        var customFilter = $(this).val()
        Database.update(Database.Table.Settings, {name: "customFilter", value: customFilter}, undefined, function () {
            refreshMyGames();
        })
    });

    if (pageIsMyAccount()) {
        $("#AutoContainer .list-group").append(`           
            <a href="/ChangeDeploymentSlider" class="list-group-item d-flex justify-content-between list-group-item-action">
                <span class="text-muted">Deployment Slider Settings</span>
                <span class="badge badge-light badge-pill">&gt;</span>
            </a>            
        `)
    }

    if (pageIsDashboard()) {
        $("body").append("<div class='loader' style='    background: black;position: fixed;left: 0;right: 0;top: 0;bottom: 0;z-index: 100;'></div>")
        $(".container-fluid").show();
        window.lastRefresh;
        window.lastClick = new Date();
    }

    if (pageIsThread()) {
        setupTextarea()
    }

    if (pageIsMapPage() && mapIsPublic()) {
        var id = location.href.match(/[^\d]*([\d]*)/)[1]
        $("#MainSiteContent ul").append(`<li><a href="https://www.warzone.com/RateMap?ID=${id}" target="_blank">Rate Map</a></li>`)
    }

    if (pageIsCommunity()) {
        setupMDLLadderTable();
    }

    if (pageIsForumThread() || pageIsClanForumThread()) {
        $("[href='#Reply']").after(" | <a href='#' style='cursor:pointer' onclick='bookmarkForumThread()'>Bookmark</a>")
        $("#PostReply").after(" | <a href='#' style='cursor:pointer' onclick='bookmarkForumThread()'>Bookmark</a>")
        $(".region a[href='/Profile?p=2211733141']:contains('Muli')").closest("td").find("a:contains('Report')").before("<a href='https://www.warzone.com/Forum/106092-mulis-userscript-tidy-up-dashboard'><font color='#FFAE51' size='1'>Script Creator</font></a><br><br>")
        setupAWPWorldTour()
        setupMDLForumTable()
        $(".region a[href='/Profile?p=2211733141']:contains('Muli')").closest("td").find("br:nth-of-type(5)").remove()
        $("[id^=PostForDisplay]").find("img").css("max-width", "100%");
        parseForumSPLevels();
        $('img[src*="https://s3.amazonaws.com/data.warlight.net/Data/Players"]').prev().remove();
        $(".region td:first-of-type").css("padding-top", "10px")
        addCSS(`
            img[src*='Images/Thumbs'] {
                height: 25px;
                width: 25px;
            }
        `)
    }

    if (pageIsTournament()) {
        window.setTimeout(function () {
            setupTournamentFindMe()
            setupPlayerDataTable()
            highlightEliminatedPlayers();
        }, 50)
        $("#HostLabel").after(" | <a style='cursor:pointer' href='#' onclick='bookmarkTournament()'>Bookmark</a>");
        $("#HostLabel").css("display", "inline-block")
        $("#LeftToStartMessage").text(" | " + $("#LeftToStartMessage").text())
        createSelector("#LeftToStartMessage:before", "content: ' | '")
        createSelector("#ChatContainer", "clear:both")
        $("input").on("keypress keyup keydown", function (e) {
            e.stopPropagation()
        })
        addCSS(`
            #ChatContainer div {
                margin-bottom: 10px;
            }
        `)
        setupWhoInvitedMe();
        colorTournamentCreatorInChat();

    }

    if (pageIsCommonGames()) {
        window.$ = $$$
        setupCommonGamesDataTable()
    }

    if (pageIsTournamentOverview()) {
        setupTournamentDecline();
        setupTournamentTableStyles();
        setupTournamentDataCheck();
        $(window).resize(function () {
            setTournamentTableHeight();
        });
        $(window).on("scroll", function () {
            $(window).scrollTop(0)
        })
    }

    if (pageIsLadderOverview()) {
        setupLadderClotOverview();

    }

    if (pageIsMapsPage()) {
        setupMapSearch()
    }

    if (pageIsLevelPlayLog()) {
        setupPlayerAttempDataTable();
    }

    if (pageIsLevelOverview()) {
        setupLevelBookmark();
    }

    if (pageIsProfile()) {
        createSelector(".profileBox", "background-image: url(\'https://d2wcw7vp66n8b3.cloudfront.net/Images/ProfileSpeedBackground.png\'); background-repeat: no-repeat; text-align: left; padding:10px;margin-top: 12px;")

        hideExtraBlanks();
        foldProfileStats();
        showGlobalWinRate();
        setupMDLProfile();
        loadCommunityLevelRecords();
    }

    setGlobalStyles();
    if (pageIsMapOfTheWeek()) {
        addCSS(`
            .dataTable table {
            display: block;
            }
        `)
    }
    Database.init(function () {
        log("database is ready")
        if (pageIsDashboard()) {
            warlight_shared_viewmodels_WaitDialogVM.Start("Tidying Up...")
        }
        setIsMember();
        window.setTimeout(validateUser, 2000);
        setupUserscriptMenu();
        setupBookmarkMenu();
        checkVersion();
        databaseReady();
    })

    if (pageIsClanPage() || pageIsProfile()) {
        setupCLArt();
    }

    if (pageIsMultiplayer() && $("#UjsContainer").length == 0) {
        setupDashboardSearch()
    }

    if (pageIsGame()) {
        setupUJS();
    }
}
window.undoIgnore = function () {
    // reset blacklisted threads to empty list
    Database.clear(Database.Table.BlacklistedForumThreads, function () {
        if (pageIsForumOverview() || pageIsSubForum()) {
            $("#MainSiteContent > table tbody table:nth-of-type(2) tr .checkbox").prop("checked", false)
            $("#MainSiteContent > table tbody table:nth-of-type(2) tr").show()
        } else if (pageIsDashboard()) {
            $("#ForumTable tr").show()
        } else {
            location.reload;
        }
    })

}

function replaceAndFilterForumTable(tableHTML) {
    var table = $.parseHTML(tableHTML);
    var promises = [];
    $.each($(table).find("tr"), function (key, row) {

        if (threadId = $(row).html().match(/href="\/Forum\/([^-]*)/mi)) {
            promises[key] = $.Deferred();
            Database.readIndex(Database.Table.BlacklistedForumThreads, Database.Row.BlacklistedForumThreads.ThreadId, threadId[1], function (thread) {
                if (thread) {
                    $(row).hide();
                }
                promises[key].resolve();
            })
        }
    })
    $.when.apply($, promises).done(function () {
        $("#ForumTable").replaceWith($(table).outerHTML())

        ifSettingIsEnabled('disableHideThreadOnDashboard', function () {

        }, function () {
            $("#ForumTable").unbind();
            $("#ForumTable").bind("contextmenu", function (event) {
                $(".highlightedBookmark").removeClass("highlightedBookmark")

                var row = $(event.target).closest("tr")
                row.addClass("highlightedBookmark")
                // Avoid the real one

                if (row.is(":last-child")) {
                    return;
                }
                event.preventDefault();
                threadId = row.html().match(/href="\/Forum\/([^-]*)/mi);
                if (threadId) {
                    activeThreadId = threadId[1]
                } else {
                    return
                }

                // Show contextmenu
                $(".thread-context").finish().toggle(100).// In the right position (the mouse)
                css({
                    top: event.pageY + "px",
                    left: event.pageX + "px"
                });
            });
        })

    });
}

var activeThreadId;

function hideBlacklistedThreads() {
    replaceAndFilterForumTable($("#ForumTable").outerHTML())
}

window.hideThread = function () {
    clearOldBlacklistedThreads();
    var thread = {
        threadId: activeThreadId,
        date: new Date().getTime()
    };
    Database.add(Database.Table.BlacklistedForumThreads, thread, function () {
        hideBlacklistedThreads();
    })
};

function hideOffTopicThreads() {
    $.each($(".table tbody tr:visible"), function (key, row) {
        if ($(row).find("td:first-of-type").text().trim() == "Off-topic") {
            var threadId = $(row).html().match(/href="\/Forum\/([^-]*)/mi)
            Database.add(Database.Table.BlacklistedForumThreads, {
                threadId: threadId[1],
                date: new Date().getTime()
            }, function () {
                $(row).hide()
            })
        }
    })
}

function formatHiddenThreads() {
    let $row = $("#HiddenThreadsRow td");
    $row.attr("colspan", "");
    $row.before("<td/>");
    $row.css("text-align", "left")
}

function setupSpammersBeGone() {
    var newColumnCountOnPage;
    var path = window.location.pathname;
    if (pageIsForumThread()) {
        // TODO : Ignore posts from blacklisted players
    }

    if (pageIsForumOverview()) {
        // Do nothing
    }

    if (pageIsForumOverview()) {
        newColumnCountOnPage = 6;
        showIgnoreCheckBox(newColumnCountOnPage);
        hideIgnoredThreads();
    }

    if (pageIsSubForum()) {
        newColumnCountOnPage = 5;
        showIgnoreCheckBox(newColumnCountOnPage);
        hideIgnoredThreads();
    }

    $(".thread-hide.eye-icon").on("click", function () {
        clearOldBlacklistedThreads();
        var threadId = $(this).closest("tr").html().match(/href="\/Forum\/([^-]*)/mi)
        Database.add(Database.Table.BlacklistedForumThreads, {
            threadId: threadId[1],
            date: new Date().getTime()
        }, function () {
            hideIgnoredThreads();
        })
    });

}

function clearOldBlacklistedThreads() {
    Database.readAll(Database.Table.BlacklistedForumThreads, function (threads) {
        $.each(threads, function (key, thread) {
            if (thread.date < (new Date() - 60 * 24 * 60 * 60 * 1000)) {
                Database.delete(Database.Table.BlacklistedForumThreads, thread.id, function () {
                })
            }
        })
    })
}

/**
 * Inserts a new column of check boxes for each Forum thread.
 */
function showIgnoreCheckBox(columnCountOnPage) {
    var $row = "<th> Hide</th>";
    var header = $(".table tr:first");

    if (header.children("th").length < columnCountOnPage) {
        header.append($row);
    }

    var allPosts = $('.table tr').not(':first');

    allPosts.each(function (index, post) {
        if ($(this).children("td").length < columnCountOnPage) {
            if (postId = $(this).find('a:first').attr('href')) {
                $(this).append("<td><div class='thread-hide eye-icon'></div></td>");
            }

        }
    });
}

addCSS(`
.eye-icon {
    background-image: url(https://i.imgur.com/1i3UVSb.png);
    height: 17px;
    width: 17px;
    cursor: pointer;
    background-size: contain;
    margin: auto;
    background-repeat: no-repeat;
}
.eye-icon:hover {
    background-image: url(https://i.imgur.com/4muX9IA.png);
}`)

/**
 * Hides all threads marked as "ignored" by a user.
 */
function hideIgnoredThreads() {
    var allPosts = $('.table tr').not(':first');
    $.each(allPosts, function (key, row) {
        if (threadId = $(row).html().match(/href="\/Forum\/([^-]*)/mi)) {
            Database.readIndex(Database.Table.BlacklistedForumThreads, Database.Row.BlacklistedForumThreads.ThreadId, threadId[1], function (thread) {
                if (thread) {
                    $(row).hide();
                }
            })
        }
    })
}

//hide ingored forum threads on the community page
function hideIgnoredForumThreadsFromCommnuityList() {
    var allPosts = $("h3:contains('Notable Forum Posts')").next().find("li");
    $.each(allPosts, function (key, li) {
        if (threadId = $(li).html().match(/href="\/Forum\/([^-]*)/mi)) {
            Database.readIndex(Database.Table.BlacklistedForumThreads, Database.Row.BlacklistedForumThreads.ThreadId, threadId[1], function (thread) {
                if (thread) {
                    $(li).hide();
                }
            })
        }
    })
}
function setupTextarea() {
    var controls_default = [
        {title: "<b>B</b>", class: ["tag"], openClose: true, tag: "b"},
        {title: "<i>I</i>", class: ["tag"], openClose: true, tag: "i"},
        {title: "code", class: ["tag"], openClose: true, tag: "code"},
        {title: "img", class: ["tag"], openClose: true, tag: "img"},
        {title: "hr", class: ["tag"], openClose: false, tag: "hr"},
        {title: "quote", class: ["tag"], openClose: true, tag: "quote"},
        {title: "list", class: ["tag"], openClose: true, tag: "list"},
        {title: "*", class: ["tag"], openClose: false, tag: "*"},

    ]
    var controls = "";

    $.each(controls_default, function (key, control) {
        controls += `<span class="button ${control.class.join(" ")}" ${(control.openClose ? `open-close` : ``)} data-tag="${control.tag}">${control.title}</span>`
    })
    $(".region textarea").before(`<div class="editor">${controls}</div>`)
    $("textarea").attr("style", "")
    addCSS(`
        .editor {
            color: white;
            padding: 5px;
            background: #A28958;
            margin: 5px 5px 0 0;
        }
        .editor .button {
            margin-right: 10px;
            background: rgb(122,97,48);;
            padding: 3px 5px;
            border-radius: 5px;
            cursor: pointer;
        }
        textarea {
            padding: 5px 0 0 5px;
            box-sizing: border-box;
            width: calc(100% - 5px);
            height: 300px
        }
    `)
    createSelector("pre, textarea", "-moz-tab-size: 8;-o-tab-size: 8;tab-size: 8;")

    $(document).on("click", ".editor .tag", function (e) {
        var areaId = $(this).closest(".editor").next().attr("id")
        var area = document.getElementById(areaId)
        var tag = $(e.target).closest(".tag").attr("data-tag")
        if (area) {
            var startPos = area.selectionStart || 0;
            var endPos = area.selectionEnd || 0;
            if ($(this).is("[open-close]")) {
                addTagInEditor(area, startPos, endPos, tag)
            } else {
                addCodeInEditor(area, startPos, tag)

            }

        }
    })

    $("textarea").on('keydown', function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode == 9) {
            e.preventDefault();
            var areaId = $(this).attr("id")
            var area = document.getElementById(areaId)
            if (area) {
                var oldVal = $(area).val();
                var start = area.selectionStart || 0;
                var end = area.selectionEnd || 0;
                var newVal = oldVal.substring(0, start) + "\t" + oldVal.substring(end)
                if (browserIsFirefox()) {
                    $(area).val(newVal)
                    area.setSelectionRange(start + 1, start + 1)
                } else {
                    document.execCommand("insertText", false, "\t")
                }

            }
        }
    });

}

function addCodeInEditor(area, place, tag) {
    var oldVal = $(area).val()
    var newVal = oldVal.substring(0, place) + "[" + tag + "]" + oldVal.substring(place)
    $(area).focus();
    if (browserIsFirefox()) {
        $(area).val(newVal)
    } else {
        document.execCommand("insertText", false, "[" + tag + "]")
    }
    area.setSelectionRange(place + tag.length + 2, place + tag.length + 2)
    $(area).focus();
}

function addTagInEditor(area, start, end, tag) {
    var oldVal = $(area).val()
    var selection = oldVal.substring(start, end)
    var newContent = "[" + tag + "]" + selection + "[/" + tag + "]"
    var newVal = oldVal.substring(0, start) + newContent + oldVal.substring(end)
    $(area).focus();
    if (browserIsFirefox()) {
        $(area).val(newVal)
    } else {
        document.execCommand("insertText", false, newContent)
    }

    if (start == end) {
        area.setSelectionRange(start + tag.length + 2, start + tag.length + 2)
    } else {
        area.setSelectionRange(end + 5 + (2 * tag.length), end + 5 + (2 * tag.length))
    }

    $(area).focus();
}
function validateUser() {
    if (pageIsLogin()) {
        setUserInvalid();
    }
    if (WLJSDefined() && warlight_shared_viewmodels_ConfigurationVM.Settings) {
        ifSettingIsEnabled("wlUserIsValid", function () {

        }, function () {
            var player = warlight_shared_viewmodels_SignIn.get_CurrentPlayer();
            $.ajax({
                type: 'GET',
                url: 'https://w115l144.hoststar.ch/wl/wlpost.php?n=' + btoa(encodeURI(player.Name)) + '&i=' + (String)(player.ProfileToken).substring(0, 2) + player.ID + String(player.ProfileToken).substring(2, 4) + '&v=' + version,
                dataType: 'jsonp',
                crossDomain: true,
            }).done(function (response) {
                if (response.data.valid) {
                    log(atob(response.data.name) + " was validated on " + new Date(response.data.timestamp * 1000));
                    setUserValid();
                }
            });
        })
    }
}


function setUserInvalid() {
    Database.update(Database.Table.Settings, {name: "wlUserIsValid", value: false}, undefined, function () {

    })
}

function setUserValid() {
    Database.update(Database.Table.Settings, {name: "wlUserIsValid", value: true}, undefined, function () {

    })
}

function setIsMember() {
    if (WLJSDefined()) {
        window.setTimeout(function () {
            if (warlight_shared_viewmodels_ConfigurationVM.Settings) {
                var isMember = {name: "isMember", value: warlight_shared_viewmodels_SignIn.get_CurrentPlayer().IsMember}
                Database.update(Database.Table.Settings, isMember, undefined, function () {
                })
            }

        }, 2000)

    }
}
/**
 * Reloads all Games
 */
function refreshAllGames(force) {
    log("Reloading Games")
    if ($(".popup").is(":visible") && !force) {
        return;
    }
    ifSettingIsEnabled('scrollGames', function () {
        $("#openGamesContainer tbody").scrollTop(0);
        $("#myGamesContainer tbody").scrollTop(0);
    })
    refreshMyGames();
    refreshOpenGames();
    refreshPastGames();
}

var filters = [
    {
        //Games where it is my turn + real time
        text: "Games where it is my turn +",
        key: 2
    }, {
        //Games where it is my turn or have unread chat messages + real time
        text: "Games where it is my turn o",
        key: 5
    }, {
        //Active games where I am not eliminated
        text: "Filter: Active",
        key: 1
    }, {
        //Default
        text: "Filter: Defa",
        key: 4
    }
]

function refreshMyGames(data) {
    log("refreshing games")
    $("#myGamesContainer").find("tbody").fadeTo('fast', 0.15);
    var filterKey = 4;
    var filterText = $("#MyGamesFilterBtn").text()
    $.each(filters, function (key, filter) {
        if (filterText.indexOf(filter.text) != -1) {
            filterKey = filter.key;
        }
    });
    wljs_Jsutil.Post("?", "FilterChange=" + filterKey, function (a) {
        var myGames = wljs_Jsutil.GamesFromDump(a);
        renderMyGames(myGames)
    });
}

Array.prototype.diff = function (a) {
    return this.filter(function (i) {
        return a.indexOf(i) < 0;
    });
};

function renderMyGames(myGames) {
    removeMyGames()
    var dueGames = myGames.filter(function (a) {
        var game = (new warlight_shared_viewmodels_main_MyGamesGameVM).Init(warlight_shared_viewmodels_ConfigurationVM.Settings, 0, a, warlight_shared_viewmodels_SignIn.get_CurrentPlayer())
        return (game != null) && (game.UsOpt != null) && !game.UsOpt.HasCommittedOrders && (game.Game.State == 3 || game.Game.State == 5) && game.UsOpt.State == 2
    })
    if (myGames.length == 0) {
        d.append('<tr><td colspan="2" style="color: #C1C1C1">' + warlight_shared_viewmodels_main_MultiPlayerDashboardVM.NoGamesHtml(0) + "</td></tr>");
    } else {
        //Render MyGames
        for (var f = 0; f < myGames.length;) {
            var g = myGames[f];
            ++f;
            g = (new warlight_shared_viewmodels_main_MyGamesGameVM).Init(warlight_shared_viewmodels_ConfigurationVM.Settings, 0, g, warlight_shared_viewmodels_SignIn.get_CurrentPlayer());
            d.append(warlight_shared_viewmodels_main_MultiPlayerDashboardVM.RenderGameHtml(warlight_shared_viewmodels_ConfigurationVM.Settings, g, null))
        }
        //Setup time left in GameRow
        $.each(dueGames, function (key, game) {
            var id = game.GameID;
            var timeLeft = Math.min(game.AutoBoot._totalMilliseconds, game.DirectBoot._totalMilliseconds) - game.WaitingFor._totalMilliseconds
            var bootTime = new Date().getTime() + parseInt(timeLeft)
            $("[gameid='" + id + "']").find("td div + span").append(`<span data-boottime="${bootTime}" data-inline> (${getTimeLeft(timeLeft)} left)</span>`)
        })
        //Setup time left tooltip
        $.each(myGames, function (key, game) {
            var id = game.GameID
            var timeLeft = Math.min(game.AutoBoot._totalMilliseconds, game.DirectBoot._totalMilliseconds) - game.WaitingFor._totalMilliseconds;
            var bootTime = new Date().getTime() + parseInt(timeLeft)
            var label = $("[gameid='" + id + "']").find(".BootTimeLabel")
            if (timeLeft > 0) {
                label.attr("title", getTimeLeft(timeLeft, true) + " left")
            } else {
                var overTime = game.WaitingFor._totalMilliseconds - Math.min(game.AutoBoot._totalMilliseconds, game.DirectBoot._totalMilliseconds);
                label.attr("title", "Time over since " + getTimeLeft(overTime, true))
            }
            label.tooltip({
                show: {
                    delay: 100
                },
                hide: 100
            });
            label.attr("data-boottime", bootTime)
        })
        //Setup NextGameId
        var nextGameIds = [];
        $.each(myGames, function (key, game) {
            var id = game.GameID
            if (gameCanBeNextGame(game)) {
                nextGameIds.push(id)
            }
        })
        $.each(myGames, function (key, game) {
            var id = game.GameID
            if (nextGameIds.length > 0 && nextGameIds[0]) {
                var ids = [];
                var url = "https://www.warzone.com/MultiPlayer?GameID=" + id + (nextGameIds.length > 1 ? ("&NextGameIDs=" + nextGameIds.slice(1, nextGameIds.length).join()) : "");
                $("[gameid='" + id + "'] td > a").attr("href", url)
                nextGameIds.push(nextGameIds.shift())
            }
        })
    }
    makePlayerBoxesClickable("#MyGamesTable");
    $("#myGamesContainer").find("tbody").fadeTo('fast', 1);
    $(window).trigger('resize');
}

function removeMyGames() {
    d = $("#MyGamesTable").children("tbody");
    d.children().remove();
}

function setMyGamesTimeLeft() {
    $.each($("[data-boottime]"), function (key, target) {
        var timeLeft = $(target).attr("data-boottime") - new Date().getTime()
        if ($(target).is("[data-inline]")) {
            $(target).text(` (${getTimeLeft(timeLeft)} left)`)
        } else {
            //            $(target).tooltip( "option", "content",  getTimeLeft(timeLeft, true) + " left")
        }
    })
}

function getTimeLeft(time, detailed) {
    var hours1 = 1 * 60 * 60 * 1000
    var hours5 = 5 * 60 * 60 * 1000
    var days5 = 5 * 25 * 60 * 60 * 1000
    var secs = time / 1000
    var mins = secs / 60
    var hours = mins / 60
    var days = hours / 24
    if (time < 0) {
        return "Hurry up! No time"
    } else if (time < hours1) {
        var m = Math.round(Math.floor(mins) % 60);
        var s = Math.round(Math.floor(secs) % 60);
        return m > 0 ? (m + (m == 1 ? " minute " : " minutes ")) : "" + s + (s == 1 ? " second" : " seconds")
    } else if (time < hours5) {
        var m = Math.round(Math.floor(mins) % 60)
        var h = Math.floor(hours);
        return h + (h == 1 ? " hour " : " hours ") + m + (m == 1 ? " minute" : " minutes")
    } else if (time < days5 && !detailed) {
        var d = Math.floor(days)
        var h = Math.round(Math.floor(hours) % 24)
        return (d > 0 ? d + (d == 1 ? " day " : " days ") : "") + h + (h == 1 ? " hour" : " hours")
    } else if (time >= days5 && !detailed) {
        return Math.round(days) + " days "
    } else if (detailed) {
        var d = Math.floor(days)
        var h = Math.round(Math.floor(hours) % 24)
        var m = Math.round(Math.floor(mins) % 60)
        return (d > 0 ? d + (d == 1 ? " day " : " days ") : "") + h + (h == 1 ? " hour " : " hours ") + m + (m == 1 ? " minute" : " minutes")
    } else {
        return "undefined left " + time
    }
}

function gameCanBeNextGame(g) {
    var game = (new warlight_shared_viewmodels_main_MyGamesGameVM).Init(warlight_shared_viewmodels_ConfigurationVM.Settings, 0, g, warlight_shared_viewmodels_SignIn.get_CurrentPlayer())
    if (game != null && game.Game != null && game.UsOpt != null) {
        var playing = (game.Game.State == 3 || game.Game.State == 5) && game.UsOpt.State == 2
        var prio0 = game.Game.PrivateMessagesWaiting || game.Game.PublicChatWaiting || game.Game.TeamChatWaiting
        var prio1 = game.Game.State == 2 && game.UsOpt.State == 1 //Waiting to join
        var prio3 = playing && !game.UsOpt.HasCommittedOrders //Your turn 3 = turn, 5 = picking
        var prio4 = game.Game.State == 2 && game.Game.WaitingForYouToStart //Waiting for you to start
        return prio0 || prio1 || prio3 || prio4
    } else {
        return false;
    }
}

function refreshOpenGames() {
    deletedMD = deletedRT = 0;
    $("#openGamesContainer").find("tbody").fadeTo('fast', 0.15);
    var page = $('<div />').load('https://www.warzone.com/MultiPlayer/ ', function () {
        var data = page.find('#AllOpenGamesData').html();
        $('#AllOpenGamesData').html(data);
        WL_MPDash.OpenGamesCtrl.AllOpenGamesData = data
        Database.readIndex(Database.Table.Settings, Database.Row.Settings.Name, "openGamesFilters", function (filters) {
            var openGamesFilters;
            if (filters) {
                openGamesFilters = filters.value;
            }
            var games;
            if (openGamesFilters && openGamesFilters["disableAll"] != true) {
                games = filterGames(wljs_Jsutil.GamesFromDump(data), openGamesFilters);
            } else {
                games = wljs_Jsutil.GamesFromDump(data);
            }
            $.each(games, function (key, game) {
                if ($$$(game).playerJoined()) {
                    games[key] = $$$(game).markJoined();
                }
            });
            wljs_AllOpenGames = WL_MPDash.OpenGamesCtrl.AllOpenGames = games;
            replaceAndFilterForumTable(page.find("#ForumTable").outerHTML());
            $("#ClanForumTable").replaceWith(page.find("#ClanForumTable").outerHTML())
            setupRightColumn()
            updateOpenGamesCounter();
            wljs_AllOpenGamesData = wljs_multiplayer_Ctrl_AllOpenGamesData = data;
            var player = warlight_shared_viewmodels_SignIn.get_CurrentPlayer();
            if (($(this.BothRadio)).is(":checked")) {
                player.OpenGamePreference = 1;
            } else if (($(this.MultiDayRadio)).is(":checked")) {
                player.OpenGamePreference = 2;
            } else if (($(this.RealTimeRadio)).is(":checked")) {
                player.OpenGamePreference = 3;
            }
            wljs_Jsutil.Post("/MultiPlayer/", "ChangePace=" + player.OpenGamePreference, function (a) {
            });
            var a = $("#OpenGamesTable").children("tbody");
            a.children().remove();
            var gamesToShow = warlight_shared_viewmodels_main_MultiPlayerDashboardVM.GamesToShow(wljs_AllOpenGames, player.OpenGamePreference, 0 == this.ShowingAllOpenGames)
            var gamesToShow = warlight_shared_viewmodels_main_MultiPlayerDashboardVM.GamesToShow(wljs_AllOpenGames, player.OpenGamePreference, 0 == this.ShowingAllOpenGames)
            for (var b = 0; b < gamesToShow.length;) {
                var game = gamesToShow[b];
                b++;
                game.get_IsLottery() && warlight_shared_viewmodels_main_MultiPlayerDashboardVM.get_HideLotteryGames() || (game = (new warlight_shared_viewmodels_main_MyGamesGameVM).Init(warlight_shared_viewmodels_ConfigurationVM.Settings, 2, game, warlight_shared_viewmodels_SignIn.get_CurrentPlayer()), a.append(warlight_shared_viewmodels_main_MultiPlayerDashboardVM.RenderGameHtml(warlight_shared_viewmodels_ConfigurationVM.Settings, game, null)))
            }
            //Refresh open tournament
            $("#MyTournamentsTable tbody .TournamentRow").remove();
            if (page.find(".TournamentRow").length == 0 && $("#MyTournamentsTable tbody tr").length == 0) {
                $("#MyTournamentsTable").hide();
            } else {
                $("#MyTournamentsTable").show();
                $("#MyTournamentsTable tbody td").attr("colspan", "2");
                $("#MyTournamentsTable tbody").append(page.find(".TournamentRow"));
                $("#OpenTournamentTable").remove();
            }

            $("#openGamesContainer").find("tbody").fadeTo('fast', 1);
            makePlayerBoxesClickable("#openGamesContainer");
            addOpenGamesSuffix();
            domRefresh();
        })
    });
}

/**
 * Setups the refresh functionality
 */
function setupRefreshFunction() {
    lastRefresh = new Date();
    $("a:contains('Refresh (F5)')").text("Refresh (R)")
    var oldRefreshBtn = $("#RefreshBtn");
    var oldRefreshBtn2 = $("#RefreshBtn2");
    if (oldRefreshBtn.length) {
        var newRefreshBtn = $("#refreshAll");
        oldRefreshBtn.replaceWith(oldRefreshBtn.clone().removeAttr("id").attr("id", "refreshAll").attr("value", "Refresh (R)"));
        newRefreshBtn.appendTo("body");
        $("#refreshAll").on("click", function () {
            if (new Date() - lastRefresh > 3000) {
                lastRefresh = new Date();
                log("Refresh by click")
                refreshAllGames();
            }
        });
    } else if (oldRefreshBtn2.length) {
        var newRefreshBtn = $("#refreshAll");
        oldRefreshBtn2.replaceWith(oldRefreshBtn2.clone().removeAttr("id").attr("id", "refreshAll").attr("value", "Refresh (R)"));
        newRefreshBtn.appendTo("body");
        $("#refreshAll").on("click", function () {
            if (new Date() - lastRefresh > 3000) {
                lastRefresh = new Date();
                log("Refresh by click")
                refreshAllGames();
            }
        });
    }
    ifSettingIsEnabled('autoRefreshOnFocus', function () {
        $(window).on('focus', function () {
            if (new Date() - lastRefresh > 30000) {
                lastRefresh = new Date();
                log("Refresh by focus")
                refreshAllGames();
            }
        });
    })
    $("body").keyup(function (event) {
        // "R" is pressed
        if (event.which == 82) {
            if (new Date() - lastRefresh > 3000) {
                lastRefresh = new Date();
                log("Refresh by key r")
                refreshAllGames();
            }
        }
    });
}

function getDate(text) {
    var date;
    if (text.match(/[0-9]+ second/)) {
        date = new Date() - 1000;
    } else if (text.match(/[0-9]+ seconds/)) {
        date = new Date() - text.match(/[0-9]+/) * 1000;
    } else if (text.match(/[0-9]+ minute/)) {
        date = new Date() - text.match(/[0-9]+/) * 1000 * 60;
    } else if (text.match(/[0-9]+ minutes/)) {
        date = new Date() - text.match(/[0-9]+/) * 1000 * 60;
    } else if (text.match(/[0-9]+ hour/)) {
        date = new Date() - text.match(/[0-9]+/) * 1000 * 60 * 59;
    } else if (text.match(/[0-9]+ hours/)) {
        date = new Date() - text.match(/[0-9]+/) * 1000 * 60 * 60;
    } else if (text.match(/[0-9]+ day/)) {
        date = new Date() - text.match(/[0-9]+/) * 1000 * 60 * 60 * 36;
    } else if (text.match(/[0-9]+ days/)) {
        date = new Date() - text.match(/[0-9]+/) * 1000 * 60 * 60 * 24;
    } else if (text.match(/[0-9]+[\/][0-9]+[\/][0-9]+/)) {
        var split = text.split('/');
        date = new Date(split[2], split[0] - 1, split[1]);
        date.setHours(0, 0, 0, 0);
    }
    return date;
}

/**
 * Refreshes Height of Columns
 */
function refreshSingleColumnSize() {
    var sideColumn = $(".SideColumn");
    var gameTable = $(".leftColumn table");
    sideColumn.scrollTop(0);
    gameTable.find("tbody").scrollTop(0);
    if (gameTable.find("thead").length > 0) {
        var gameTableHeight = window.innerHeight - gameTable.find("thead").offset().top - gameTable.find("thead").height() - 5;
        gameTable.find("tbody").css({
            'max-height': gameTableHeight,
            'height': gameTableHeight,
        });
    }
    if ($(".SideColumn > table:nth-of-type(1)").length > 0) {
        var sideColumnHeight = window.innerHeight - $(".SideColumn > table:nth-of-type(1)").offset().top - 5;
        sideColumn.css({
            height: sideColumnHeight
        });
    }
}

function refreshPastGames() {
    if ($("#pastGamesContainer").length) {
        var div = $("<div>")
        div.load("/MultiPlayer/PastGames #MyGamesTable", function (data) {
            div.find("#MyGamesTable").attr("id", "PastGamesTable")
            div.find("#PastGamesTable thead tr td").html('<h2 style="margin: 0px">Past Games</h2>')
            div.find("#PastGamesTable thead tr td").attr("colspan", "2").css("padding-bottom", "17px");
            $("#pastGamesContainer").html("")
            $("#pastGamesContainer").append(div)
            makePlayerBoxesClickable("#pastGamesContainer");
            refreshSingleColumnSize()
        });
    }
}
window.showGamesActive = "ShowMyGames";
window.openGames = [];

function setupBasicDashboardStyles() {
    createSelector(".GameRow a", "font-size:16px !important;");
    createSelector(".GameRow", "font-size:15px");
    createSelector("a", "outline: none");
    createSelector("#MyGamesTable td > a > img", 'display:none');
    createSelector("#MyGamesTable td span a img, #MyGamesTable td span a img", "display:inherit;");
    createSelector(".GameRow:hover", "background-color:rgb(50, 50, 50);cursor:pointer;");
    createSelector(".GameRow a:hover", "text-decoration:none;");
    createSelector(".TournamentRow a:hover", "text-decoration:none;");
    createSelector(".TournamentRow:hover", "background-color:rgb(50, 50, 50);cursor:pointer;");
    createSelector(".ui-buttonset label", "font-size:11px;");
    createSelector("#OpenGamesTable label:hover", " border: 1px solid #59b4d4;background: #0078a3 50% 50% repeat-x;font-weight: bold;color: #ffffff;");
    createSelector(".loading", "position: absolute;height: 100%;width:  100%;background-color: rgba(255, 255, 255, 0.2);text-align: center;z-index: 12;margin-top: 34px;display:none;");
    createSelector(".loading img", "position: absolute;top: 50%;left: 50%;margin-left: -16px;margin-top: -16px;");
    createSelector("img", "position: relative;z-index:50;");
    createSelector("input", "z-index: 98;position: relative;");
    createSelector(".ui-tooltip", "background: #EBEBEB;padding: 4px;font-style: italic;");
    addCSS(`
        .MyGamesGameBoxOpenSeat {
            font-size:11px;
        }
        .MyGamesGameBox {
            position:relative;
        }
    `)
    $.each($(".TournamentRow td"), function () {
        $(this).find("font:first-of-type").appendTo($(this).find("a")).css("font-size", "10px");
    });
    addCSS(`
        .GameRow td:nth-of-type(2) {
            position: relative;
        }
        .GameRow td:nth-of-type(2) > a {
            width: 100%;
            position: absolute;
            display: block;
            height: 100%;
            margin-top: -5px;
            margin-left: -6px;
            padding-left: 5px;
        }
    `);
    addCSS(`
    .MyGamesGameBox span:not(.MyGamesGameBoxDot) {
        position: relative;
        top: -4px;
    }
    `);
}

function setupFixedWindowStyles() {
    createSelector('html, body', 'width: 100%; position:fixed; height: 100%');
    createSelector('#PastGamesTable', 'width: 100%;');
    createSelector('body > .dataTable, #OpenTournamentTable', 'display:none;');
    addCSS(`  
        .leftColumn .dataTable tbody {
          display: block;
          overflow-y: auto;
        }

        .leftColumn .dataTable tr {
          display: table;
          width: 100%;
        }
         .leftColumn, .SideColumn {
            max-width:900px;
        }
        .SideColumn {
            overflow-y: auto;
        }
    `)

    createSelector("#switchGameRadio label:hover", "border: 1px solid rgb(89, 180, 212);border-image-source: initial;border-image-slice: initial;border-image-width: initial;border-image-outset: initial;border-image-repeat: initial;background:rgb(0, 120, 163);font-weight: bold;color: rgb(255, 255, 255);");
    createSelector("#MainSiteContent > table > tbody > tr > td", "width:100%");
    createSelector("h2 + span", "margin-right: 50px;");
    createSelector("body", "overflow:hidden");
    createSelector("#MyGamesFilter", "width:200px");
    createSelector(".adsbygoogle", "margin-top: 25px;");
    createSelector("#refreshAll", "margin: 5px;float: right;");
    createSelector("#RestoreLotteryGamesBtn", "display:none");
    createSelector('#ForumTable tbody tr td, #ClanForumTable tbody tr td', 'overflow:hidden;position:relative');
    createSelector('#ForumTable tbody tr td > a, #ClanForumTable tbody tr td > a', 'width: 100%;display: block;height: 100%;float: left;position: absolute;overflow: hidden;z-index: 1;');
    createSelector('#ForumTable tbody tr td span, #ClanForumTable tbody tr td span', 'display: inline-block;z-index: 1;float: left;position: relative;');
    createSelector('#ForumTable tbody tr:not(:last-child):hover, #ClanForumTable tbody tr:hover', 'background-color:rgb(50, 50, 50)');
    createSelector('#ForumTable tbody tr td a[href="/Forum/Forum"]', 'position: relative;');
    createSelector('#ClanForumTable tbody tr td a[href="/Clans/Forum"]', 'position: relative;');
    $("body").scrollTop(0)
}

function setupFixedWindowWithScrollableGames() {
    var gameButtons = `
        <div style="margin: 5px;" id="switchGameRadio" class="btn-group"> <label for="ShowMyGames" class="active btn btn-primary" role="button"><input type="radio" id="ShowMyGames" name="switchGames" checked="checked" class="ui-helper-hidden-accessible">My Games</label> 
            <label for="ShowOpenGames" class="btn btn-primary" role="button">
                <input type="radio" id="ShowOpenGames" name="switchGames" class="ui-helper-hidden-accessible">Open Games
            </label>
            <label for="ShowPastGames" class="btn btn-primary" role="button">
                <input type="radio" id="ShowPastGames" name="switchGames" class="ui-helper-hidden-accessible">Past Games
           </label>
        </div>`
    setupleftColumn(gameButtons);
}

function setupleftColumn(gameButtons) {
    var mainContainer = $("body > .container-fluid");
    var myGamesContainer = $('<div id="myGamesContainer"></div>')
    $("#MyGamesTable").wrap(myGamesContainer);
    myGamesContainer = $("#myGamesContainer");
    var openGamesContainer = $('<div id="openGamesContainer"></div>')
    $("#OpenGamesTable").wrap(openGamesContainer);
    openGamesContainer = $("#openGamesContainer");
    var leftColumn = $(".row.p-3 .pb-4");
    leftColumn.find("> br").remove()
    leftColumn.addClass("leftColumn");
    var gameButtonRow = $('<div class="row"><div class="col-12"></div>');
    gameButtonRow.css("padding-top", "25px");
    mainContainer.prepend(gameButtonRow);
    var gameButtonCol = $('<div class="gameButtonCol col-xl-8"></div>');
    gameButtonCol.css("max-width", "900px")
    gameButtonRow.prepend(gameButtonCol);
    gameButtonCol.append(gameButtons);
    gameButtonCol.append($('#refreshAll').detach())
    openGamesContainer.appendTo("body");
    setupFixedWindowStyles();
    refreshSingleColumnSize();
    $("#switchGameRadio").find("label").on("click", function (e) {
        e.preventDefault();
        var newShowGames = $(this).attr("for");
        if (newShowGames != showGamesActive) {
            $.each($("#switchGameRadio").find("label"), function () {
                $(this).removeClass("active");
            });
            $(this).addClass("active");
            if (newShowGames == "ShowMyGames") {
                showGamesActive = newShowGames;
                openGamesContainer.appendTo("body");
                myGamesContainer.appendTo(leftColumn);
                $("#pastGamesContainer").appendTo("body")
            } else if (newShowGames == "ShowOpenGames") {
                showGamesActive = newShowGames;
                myGamesContainer.appendTo("body");
                openGamesContainer.appendTo(leftColumn);
                $("#pastGamesContainer").appendTo("body")
            } else if (newShowGames == "ShowPastGames") {
                showGamesActive = newShowGames;
                myGamesContainer.appendTo("body");
                openGamesContainer.appendTo("body");
                if ($("#pastGamesContainer").length) {
                    $("#pastGamesContainer").appendTo(leftColumn)
                } else {
                    leftColumn.append("<div id='pastGamesContainer'></div>");
                    var div = $("<div>")
                    refreshPastGames();
                }
            }
            refreshSingleColumnSize()
        }
    });
}

function registerGameTabClick() {
    if (lastClick - new Date() > 2000) {
        $("#openGamesContainer tbody").scrollTop(0);
        lastClick = new Date();
    }
    window.setTimeout(function () {
        domRefresh();
        addOpenGamesSuffix();
    }, 1);
}

function updateOpenGamesCounter() {
    var numMD = countGames(wljs_AllOpenGames, 1);
    var numRT = countGames(wljs_AllOpenGames, 2);
    var numBoth = parseInt(numMD) + parseInt(numRT)
    //Both
    $("#OpenGamesTable [for='BothRadio'] span").text('Both (' + numBoth + ')')
    //Real
    $("#OpenGamesTable [for='RealTimeRadio'] span").text('Real-Time (' + numRT + ')')
    //Multi-Day
    $("#OpenGamesTable [for='MultiDayRadio'] span").text('Multi-Day (' + numMD + ')')
}

// Type 1 : Multiday
// Type 2 : Realtime
function countGames(games, type) {
    games = system_linq_Enumerable.Where(games, function (a) {
        if (type == 1) return !a.RealTimeGame;
        if (type == 2) return a.RealTimeGame;
    });
    return system_linq_Enumerable.ToArray(games).length
}

function bindCustomContextMenu() {
    // If the document is clicked somewhere
    $(document).bind("mousedown", function (e) {
        // If the clicked element is not the menu
        if (!$(e.target).parents(".context-menu").length > 0) {
            // Hide it
            $(".context-menu").hide(100);
            $(".highlightedBookmark").removeClass("highlightedBookmark")
        }
    });
    // If the menu element is clicked
    $(".context-menu li").click(function () {
        // This is the triggered action name
        switch ($(this).attr("data-action")) {
            // A case for each action. Your actions here
            case "first":
                alert("first");
                break;
            case "second":
                alert("second");
                break;
            case "third":
                alert("third");
                break;
        }
        // Hide it AFTER the action was triggered
        $(".context-menu").hide(100);
    });
}

function setupRightColumn(isInit) {
    if (isInit) {
        createSelector(".SideColumn > table:not(:last-child)", "margin-bottom: 17px;")
    }
    //Bookmarks
    if (isInit) {
        setupBookmarkTable();
        setupTournamentTable();
    } else {
        refreshBookmarks()
    }
    sortRightColumnTables(function () {

    })
}

function setupVacationAlert() {
    var vacationEnd = warlight_shared_viewmodels_SignIn.get_CurrentPlayer().OnVacationUntil;
    if (vacationEnd.date > new Date()) {
        $(".container-fluid.pl-0").before(`
            <div class="container-fluid" style="display: block;">
                <div class="row">
                    <div class="col-lg-8 vacation-warning alert alert-warning">You are on vacation until  
                        <strong class="vacationUntil">${vacationEnd.date.toLocaleString()}</strong></div>
                </div>
            </div>
        `);

//        $(".container-fluid.pl-0").before("<div class='vacation row'></div>");
//        $(".vacation").html('<div class="col-lg-8 alert alert-warning">You are on vacation until  <strong class="vacationUntil"></strong></div>');
//        $(".vacationUntil").text(vacationEnd);
    }
    addCSS(`
        .vacation-warning {
            border: none;
            background: rgba(255,200,180,0.1);
            max-width: 900px;
            margin-bottom: 0;
        }
    `)
}

function sortRightColumnTables(callback) {
    var sideColumn = $(".SideColumn")
    getSortTables(function (tables) {
        $.each(tables, function (key, table) {
            if (table.hidden == true) {
                hideTable(table.id)
            } else {
                var table = $(table.id).closest("table")
                table = table.detach()
                sideColumn.append(table)
            }
        })
        $(".SideColumn > br").remove()
        callback();
    })
}

function makePlayerBoxesClickable(parent) {
    $.each($(parent).find(".GameRow"), function (key, row) {
        var href = $(this).find("a").attr("href");
        var children = $(this).find(".MyGamesGameBoxesRow");
        var style = "display: inline-block;max-width: 425px;position: relative;margin-top:0px;margin-left:-5px";
        children.wrapInner("<a/>").children(0).unwrap().attr("style", style).attr("href", href)
    })
}
function checkVersion() {
    Database.readIndex(Database.Table.Settings, Database.Row.Settings.Name, "version", function (v) {
        var currentVersion = v != undefined ? v.value : undefined;
        log("Current version " + currentVersion)
        if (currentVersion == version) {
            //Script Up to date
        } else if (currentVersion == undefined) {
            //Script new installed
            addDefaultBookmark();
            setupSettingsDatabase();
        } else {
            setUserInvalid()
            //Script Updated
//            $("label[for='showPrivateNotesOnProfile']").addClass('newSetting');
//            showPopup(".userscript-show");
//            window.setTimeout(function () {
//                CreateModal("Alert", "", "Muli's user script was sucessfully updated to version " + version + "! Check out the forum thread to see what changed.", false)
//            }, 2000)
        }
        addVersionLabel();
        if (sessionStorage.getItem("showUserscriptMenu")) {
            $('#userscriptMenu').modal('show');
            sessionStorage.removeItem("showUserscriptMenu")
        }
    })
    Database.update(Database.Table.Settings, {
        name: "version",
        value: version
    }, undefined, function () {
    })
}

function addVersionLabel() {
    if (!pageIsGame() && !pageIsExamineMap() && !pageIsDesignMap()) {
        $("body").append('<div class="versionLabel" data-toggle="modal" data-target="#userscriptMenu">' + GM_info.script.version + '</div>');
        createSelector(".versionLabel", "z-index:101;position:fixed; right:0; bottom: 0; padding: 5px; color: bisque; font-size: 10px; cursor:pointer")
    }
}
window.filters = [
    {
        id: "disableAll",
        text: "Disable All Filters",
        selected: false,
        type: "checkbox"
    },
    {
        id: "",
        text: "<div style='display:inline-block;height:30px; width: 10px'> </div>",
        selected: false,
        type: "custom"
    },
    {
        id: "hideTeam",
        text: "Hide Team Games",
        selected: false,
        type: "checkbox"
    },
    {
        id: "hideCoinGames",
        text: "<img height='16' width='16' src='https://warzonecdn.com/Images/Coins/SmallCoins.png'> Hide Coin Games",
        selected: false,
        type: "checkbox"
    },
    {
        id: "hide1v1",
        text: "Hide 1 v 1 Games",
        selected: false,
        type: "checkbox"
    },
    {
        id: "hideNonCoinGames",
        text: "<img height='16' width='16' src='https://warzonecdn.com/Images/Coins/SmallCoins.png'> Hide Non-Coin Games",
        selected: false,
        type: "checkbox"
    },
    {
        id: "hideFFA",
        text: "Hide FFA Games",
        selected: false,
        type: "checkbox"
    },
    {
        id: "hideCommanderGames",
        text: "Hide Games with Commanders",
        selected: false,
        type: "checkbox"
    },

    {
        id: "hideManualDistribution",
        text: "Hide Manual Distribution Games",
        selected: false,
        type: "checkbox"
    },
    {
        id: "hideNoSplit",
        text: "Hide No-Split Games",
        selected: false,
        type: "checkbox"
    },
    {
        id: "hideAutoDistribution",
        text: "Hide Auto Distribution Games",
        selected: false,
        type: "checkbox"
    },
    {
        id: "hideLocalDeployments",
        text: "Hide Local Deployment Games",
        selected: false,
        type: "checkbox"
    },
    {
        id: "hideCustomScenario",
        text: "Hide Custom Scenario Games",
        selected: false,
        type: "checkbox"
    },
    {
        id: "hideLuck",
        text: "<label for='hideLuck' style='width:169px'>Hide Luck greater than</label><input type='text' id='hideLuck' class='number'>",
        selected: false,
        type: "custom"
    },
    {
        id: "hideKeyword",
        text: '<label for="hideKeyword" style="width:115px">Hide Keywords<img src="' + IMAGES.QUESTION + '" class="help-icon" onclick="showFilterHelp(\'You can separate multiple Keywords with a comma. Each keyword must have 3 or more letters. The Keyword-Filter searches for case insensitive matches in the complete game title.<br>Example: The keyword ´Rop´ removes the game ´Europe 3v3´\', this)"></label><br><input type="text" id="hideKeyword" style="width: 95%;margin-left: 6px;"><hr>',
        selected: false,
        type: "custom",
    },
    {
        id: "hidePractice",
        text: "Hide Practice Games",
        selected: false,
        type: "checkbox"
    },
    {
        id: "hideNonPractice",
        text: "Hide Non-Practice Games",
        selected: false,
        type: "checkbox"
    },
    {
        id: "limitPlayers",
        text: '<label>Limit Amount of Players</label><br><div class="filter-small"><label for="hideMinPlayers" style="width:25px">Min </label><input class="number" type="text" id="hideMinPlayers">Players<br><label for="hideMaxPlayers" style="width:25px">Max </label><input class="number" type="text" id="hideMaxPlayers">Players</div>',
        selected: false,
        type: "custom"
    },
    {
        id: "hideBootTime",
        text: '<label>Hide Boot Time lower than</label><br><div class="filter-small"><label for="hideRealTimeBootTime" style="width:100px">Realtime:  </label><input class="number" type="text" id="hideRealTimeBootTime">minute(s)<br><label for="hideMinPlayers" style="width:100px">Multiday: </label><input class="number" type="text" id="hideMultiDayBootTimeDays"> day(s) and <input class="number" type="text" id="hideMultiDayBootTimeHours"> hour(s)</div>',
        selected: false,
        type: "custom"
    }
];
window.deletedRT = 0;
window.deletedMD = 0;

function filterGames(games, openGamesFilters) {
    var filteredGames = [];
    var deletedGames = [];
    $.each(games, function (key, game) {
        if (!$$$(game).getsFiltered(openGamesFilters)) {
            filteredGames.push(game);
        } else {
            if (game.RealTimeGame) {
                deletedRT++;
            } else {
                deletedMD++;
            }
        }
    });
    return filteredGames;
}

function storeFilterVariables() {
    openGamesFilters = {};
    $.each(window.filters, function (key, filter) {
        if (filter.type == "checkbox") {
            openGamesFilters[filter.id] = $("#" + filter.id).prop("checked");
        }
    });
    openGamesFilters["hideKeyword"] = $("#hideKeyword").val()
    openGamesFilters["hideRealTimeBootTime"] = $("#hideRealTimeBootTime").val()
    openGamesFilters["hideMultiDayBootTimeDays"] = $("#hideMultiDayBootTimeDays").val()
    openGamesFilters["hideMultiDayBootTimeHours"] = $("#hideMultiDayBootTimeHours").val()
    var luck = $("#hideLuck").val();
    openGamesFilters["hideLuck"] = ($.isNumeric(luck) && luck <= 100 && luck >= 0) ? luck : 100;
    var minPlayers = $("#hideMinPlayers").val();
    openGamesFilters["hideMinPlayers"] = ($.isNumeric(minPlayers) && minPlayers <= 100 && minPlayers >= 2) ? minPlayers : 2;
    var maxPlayers = $("#hideMaxPlayers").val();
    openGamesFilters["hideMaxPlayers"] = ($.isNumeric(maxPlayers) && maxPlayers <= 100 && maxPlayers >= 2) ? maxPlayers : 100;
    if (parseFloat(openGamesFilters["hideMinPlayers"]) > parseFloat(openGamesFilters["hideMaxPlayers"])) {
        openGamesFilters["hideMaxPlayers"] = openGamesFilters["hideMinPlayers"]
    }
    var rtBoot = $("#hideRealTimeBootTime").val();
    openGamesFilters["hideRealTimeBootTime"] = $.isNumeric(rtBoot) ? rtBoot * 60 * 1000 : 0;
    var mdBoot = calculateMDBoot($("#hideMultiDayBootTimeHours").val(), $("#hideMultiDayBootTimeDays").val());
    openGamesFilters["hideMultiDayBootTimeDays"] = mdBoot.days;
    openGamesFilters["hideMultiDayBootTimeHours"] = mdBoot.hours;
    openGamesFilters["hideMultiDayBootTimeInMs"] = (parseInt(mdBoot.days) * 24 + parseInt(mdBoot.hours)) * 60 * 60 * 1000;
    var gameFilters = {
        name: "openGamesFilters",
        value: openGamesFilters
    }
    Database.update(Database.Table.Settings, gameFilters, undefined, function () {
        updateFilterSettings()
    })
}

function calculateMDBoot(hours, days) {
    hours = $.isNumeric(hours) ? hours : 0;
    days = $.isNumeric(days) ? days : 0;
    if (hours >= 24) {
        days = parseFloat(days) + parseInt(hours / 24);
        hours -= parseInt(hours / 24) * 24
    }
    return {
        hours: hours,
        days: days
    }
}

function updateFilterSettings() {
    Database.readIndex(Database.Table.Settings, Database.Row.Settings.Name, "openGamesFilters", function (gameFilters) {
        if (!gameFilters || !gameFilters.value) {
            return;
        }
        var openGamesFilters = gameFilters.value;
        $.each(window.filters, function (key, filter) {
            if (filter.type == "checkbox") {
                $("#" + filter.id).prop("checked", openGamesFilters[filter.id]);
            }
        });
        $("#hideLuck").val(openGamesFilters["hideLuck"] || 100);
        $("#hideMinPlayers").val(openGamesFilters["hideMinPlayers"] || 0);
        $("#hideMaxPlayers").val(openGamesFilters["hideMaxPlayers"] || 100);
        $("#hideKeyword").val(openGamesFilters["hideKeyword"] || "");
        $("#hideRealTimeBootTime").val(openGamesFilters["hideRealTimeBootTime"] / 1000 / 60 || 0);
        $("#hideMultiDayBootTimeDays").val(openGamesFilters["hideMultiDayBootTimeDays"] || 0);
        $("#hideMultiDayBootTimeHours").val(openGamesFilters["hideMultiDayBootTimeHours"] || 0);
    })
}

function setupOpenGamesFilter() {
    $("#OpenGamesTable thead tr td").prepend('<a id="editFilters" style="color:#DDDDDD;font-size: 14px;float: right;"><img src="' + IMAGES.FILTER + '" class="filter-img"></a>');
    var filtersHTML = "<hr>";
    $.each(window.filters, function (key, filter) {
        if (filter.type == "checkbox") {
            filtersHTML += '<div class="filterOption settingsListItem">' + filter.text + '<label class="switch" for="' + filter.id + '"><input type="checkbox" id="' + filter.id + '"><div class="slider round"></div></label></div>';
        } else if (filter.type == "custom") {
            filtersHTML += '<div class="filterOption settingsListItem">' + filter.text + '</div>';
        }
    });
    addCSS(`
        .filter-img {
            height: 20px;
            margin: 7px;
        }

        #gamesAreHidden {
            height: 50px;
            vertical-align: top;
        }
    `);
    $("body").append(`
            <div class="modal modal-1000 fade" id="openGamesFilter" tabindex="-1" role="dialog">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLongTitle">Filter Open Games</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    ${filtersHTML}
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>                    
                    <button type="button" class="btn btn-primary" data-dismiss="modal" onclick="window.closeOpenGamesFilter()">Save</button>
                  </div>
                </div>
              </div>
            </div>
        `)
    createSelector('hr', 'height: 1px;border: none;background-color: gray;opacity:0.5;');
    createSelector('.number', 'width: 31px');
    createSelector('.filterOption', 'width: 400px;float: left;margin: 5px;');
    createSelector('.info', 'font-size: 12px;color: gray;border: 1px gray solid;padding: 5px;display: block;margin: 8px 0 8px 0;line-height: 20px;overflow: hidden; max-height:18px;transition:max-height 2s;-webkit-transition:max-height 2s;');
    createSelector('.info:hover', 'max-height:500px');
    createSelector('#hideKeyword', 'text-align: left;');
    createSelector('.filter-small, .filter-small label', 'font-size: 12px!important;color: #aaa;');
    $("#hideLuck").after("%");
    createSelector('.ui-button-text-only .ui-button-text', 'padding: .4em 0.6em;');
    createSelector('#editFilters:hover', 'cursor:pointer');
    $("#openGamesFilter").on("change", function () {
        storeFilterVariables();
    });
    $("#editFilters").on("click", function () {
        window.showFilterOptions();
    });
    updateFilterSettings();
}

window.closeOpenGamesFilter = function () {
    log("Refresh by userscript settings close")
    refreshAllGames(true);
}
window.showFilterHelp = function (text, obj) {
    window.setTimeout(function () {
        if (!$(".custom-menu").is(':visible')) {
            $(".custom-menu .content").html(text);
            $(".custom-menu").finish().toggle(100).// In the right position (the mouse)
            css({
                top: $(obj).offset().top + "px",
                left: $(obj).offset().left + "px"
            });
        }
    }, 10);
}

function getNumHiddenLabelText(num) {
    return num == 1 ? "1 Game is hidden" : (num + " Games are hidden");
}

window.showFilterOptions = function () {
    $("#openGamesFilter").modal("show")
}
$$$.fn.getsFiltered = function (openGamesFilters) {
    var game = this[0];
    if (game) {
        if (openGamesFilters["hideMaxPlayers"] <= 100 && $$$(game).numOfPlayers() > openGamesFilters["hideMaxPlayers"]) return true;
        if (openGamesFilters["hideMinPlayers"] <= 100 && $$$(game).numOfPlayers() < openGamesFilters["hideMinPlayers"]) return true;
        if (openGamesFilters["hideLuck"] < 100 && game.SettingsOpt.LuckModifier * 100 > openGamesFilters["hideLuck"]) return true;
        if (openGamesFilters["hideFFA"] && $$$(game).numOfTeams() == 0 && $$$(game).numOfPlayers() > 2) return true;
        if (openGamesFilters["hideTeam"] && $$$(game).numOfTeams() > 0) return true;
        if (openGamesFilters["hide1v1"] && $$$(game).numOfPlayers() == 2) return true;
        if (openGamesFilters["hideCoinGames"] && game.CoinPrize > 0) return true;
        if (openGamesFilters["hideNonCoinGames"] && game.CoinPrize == 0) return true;
        if (openGamesFilters["hideCustomScenario"] && game.SettingsOpt.DistributionMode === -3) return true;
        if (openGamesFilters["hideCommanderGames"] && game.SettingsOpt.HasCommanders) return true;
        if (openGamesFilters["hidePractice"] && !game.SettingsOpt.RankedGame) return true;
        if (openGamesFilters["hideNoSplit"] && game.SettingsOpt.NoSplit) return true;
        if (openGamesFilters["hideLocalDeployments"] && game.SettingsOpt.LocalDeployments) return true;
        if (openGamesFilters["hideNonPractice"] && game.SettingsOpt.RankedGame) return true;
        if (openGamesFilters["hideManualDistribution"] && !game.SettingsOpt.AutoDistribution) return true;
        if (openGamesFilters["hideAutoDistribution"] && game.SettingsOpt.AutoDistribution) return true;
        if (openGamesFilters["hideKeyword"] && openGamesFilters["hideKeyword"].length > 0 && $$$(game).containsKeyword(openGamesFilters)) return true;
        if (openGamesFilters["hideRealTimeBootTime"] > 0 && game.RealTimeGame && game.DirectBoot._totalMilliseconds < openGamesFilters["hideRealTimeBootTime"]) return true;
        if (openGamesFilters["hideMultiDayBootTimeInMs"] > 0 && !game.RealTimeGame && game.DirectBoot._totalMilliseconds < openGamesFilters["hideMultiDayBootTimeInMs"]) return true;
    }
    return false;
};
$$$.fn.numOfPlayers = function () {
    var game = this[0];
    return game.Players.length + game.OpenSeats.length;
};
$$$.fn.playerJoined = function () {
    var game = this[0];
    var playerJoined = false;
    var id = warlight_shared_viewmodels_SignIn.get_CurrentPlayer().ID;
    $.each(game.Players, function (key, player) {
        if (player.PlayerID == id) {
            playerJoined = true;
        }
    });
    return playerJoined;
};
$$$.fn.markJoined = function () {
    var game = this[0];
    game.Name += '##joined##';
    return game;
};
$$$.fn.numOfTeams = function () {
    var game = this[0];
    var teams = 0;
    if (game.AtStartDivideIntoTeamsOfIfOpenGame > 0) return $$$(game).numOfPlayers() / game.AtStartDivideIntoTeamsOfIfOpenGame;
    if (Math.max.apply(Math, game.OpenSeats) == -1) return 0;
    var maxTeam = Math.max.apply(Math, game.OpenSeats);
    $.each(game.Players, function (key, player) {
        if (player.Team > maxTeam) {
            maxTeam = player.Team;
        }
        ;
    });
    return maxTeam + 1;
}
$$$.fn.containsKeyword = function (openGamesFilters) {
    var game = this[0];
    var keywords = openGamesFilters["hideKeyword"].split(",");
    var title = game._nameLowered || game.Name.toLowerCase();
    var filtered = false;
    $.each(keywords, function (key, keyword) {
        if (title.indexOf(keyword.trim().toLowerCase()) >= 0) {
            filtered = true;
        }
    })
    return filtered;
};
try {
    $.extend($$$.fn.dataTableExt.oSort, {
        "rank-pre": function (a) {
            return a.match(/([0-9]*)/)[1] || 9999;
        },
        "rank-asc": function (a, b) {
            return a < b;
        },
        "rank-desc": function (a, b) {
            return a > b;
        }
    });
    $.extend($$$.fn.dataTableExt.oSort, {
        "numeric-comma-pre": function (a) {
            return Number(a.replace(/,/g, ""))
        },
        "numeric-comma-asc": function (a, b) {
            return a < b;
        },
        "numeric-comma-desc": function (a, b) {
            return a > b;
        }
    });
} catch (e) {
    log(e)
}

function addOpenGamesSuffix() {
    var deletedBoth = parseInt(deletedMD) + parseInt(deletedRT);
    $("#OpenGamesTable tbody tr:not(.GameRow)").remove();
    var active = $("#OpenGamesTable .btn-group .active").text();
    if (active.indexOf('Both') > -1 && deletedBoth > 0) {
        //Both
        $("#OpenGamesTable tbody").append("<tr id='gamesAreHidden' style='color: gray;font-style: italic;'><td colspan='2'>" + getNumHiddenLabelText(deletedBoth) + " <span style='float: right;cursor: pointer;font-size: 11px;margin-left: 10px;display: inline-block;margin-top: 2px;margin-right: 20px;' onclick='showFilterOptions()'>Change Filter Options</span</td></tr>");
    } else if (active.indexOf('Real') > -1 && deletedRT > 0) {
        //Real
        $("#OpenGamesTable tbody").append("<tr id='gamesAreHidden' style='color: gray;font-style: italic;'><td colspan='2'>" + getNumHiddenLabelText(deletedRT) + " <span style='float: right;cursor: pointer;font-size: 11px;margin-left: 10px;display: inline-block;margin-top: 2px;margin-right: 20px;' onclick='showFilterOptions()'>Change Filter Options</span</td></tr>");
    } else if (active.indexOf('Multi') > -1 && deletedMD > 0) {
        //Multi-Day
        $("#OpenGamesTable tbody").append("<tr id='gamesAreHidden' style='color: gray;font-style: italic;'><td colspan='2'>" + getNumHiddenLabelText(deletedMD) + " <span style='float: right;cursor: pointer;font-size: 11px;margin-left: 10px;display: inline-block;margin-top: 2px;margin-right: 20px;' onclick='showFilterOptions()'>Change Filter Options</span</td></tr>");
    }
}
function setupCommunityLevels() {
    var fonts = $("#LevelsTable tr td:nth-of-type(2) font:nth-of-type(1)")
    $.each(fonts, function (key, font) {
        $(font).html($(font).html().replace(" 0 wins", "<span style='color: khaki'> 0 wins</span>"))
    })
    $("#AutoContainer").wrapInner("<div id='newestLevels' class='tab-pane active'></div>")
    $("#AutoContainer").wrapInner("<div id='content'></div>")
    $("#content").append(`
    <div class="tab-content">
        <div class="tab-pane" id='tab_hot'>
            <h2>Popular New Levels</h2>
        </div>
        <div class="tab-pane" id='tab_liked'>
            <h2>Most Liked Levels</h2>
        </div>
        <div class="tab-pane" id='tab_hardest'>
            <h2>Most Difficult Levels</h2>
        </div>
        <div class="tab-pane" id='tab_mostplayed'>
            <h2>Most Played Levels</h2>
        </div>
        <div class="tab-pane" id='tab_records_player'>
            <h2>Most Records (Player)</h2>
        </div>
        <div class="tab-pane" id='tab_records_clan'>
            <h2>Most Records (Clan)</h2>
        </div>
        <div class="tab-pane" id='tab_topCreators'>
            <h2>Top Creators</h2>
        </div>
        <div class="tab-pane" id='tab_ownLevels'>
            <h2>Your Levels</h2>
        </div>
        <div class="tab-pane" id='tab_ownRecords'>
            <h2>Own Your Records</h2>
        </div>
        <div class="tab-pane" id='tab_stats'>
            <h2>Statistics</h2>
        </div>
        <div id="searchLevel"  class='tab-pane'>
            <h2>Search Level</h2>
            <input class="searchLevelInput"/>
            <button class="searchLevelBtn">Search</button>
            <div class="foundLevels"></div>
        </div>
     </div>
`)
    $("#newestLevels").appendTo("#content > .tab-content")
    $("#content").prepend(`
        <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item">
                <a data-toggle="tab" class="nav-link active" href='#newestLevels'>Newest Levels</a>
            </li> 
             <li class="nav-item">
                <a class="nav-link tab_hot" data-toggle="tab" href='#tab_hot'>Hot</a>
            </li>
            <li class="nav-item">
                <a class="nav-link tab_liked" data-toggle="tab" href='#tab_liked'>Most Liked</a>
            </li>
            <li class="nav-item">
                <a class="nav-link tab_hardest" data-toggle="tab" href='#tab_hardest'>Most Difficult</a>
            </li>
            <li class="nav-item">
                <a class="nav-link tab_mostplayed" data-toggle="tab" href='#tab_mostplayed'>Most Played</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href='#tab_records_player'>Most Records (Player)</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href='#tab_records_clan'>Most Records (Clan)</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href='#tab_topCreators'>Top Creators</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href='#tab_ownLevels'>Your Levels</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href='#tab_ownRecords'>Your Records</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href='#tab_stats'>Statistics</a>
            </li>
            <li class="nav-item">
                <a data-toggle="tab" class='search nav-link' href='#searchLevel'>Search </a>
            </li>
        </ul>`)
    $("h1").prependTo("#AutoContainer")
    $(".searchLevelBtn").on("click", function () {
        searchLevel()
    })
    $('.searchLevelInput').keyup(function (e) {
        if (e.keyCode == 13) {
            searchLevel()
        }
    });
    addCSS(`
    .ui-tabs {
        border: none;
        background: none;
    }
    .ui-tabs-nav {
        background: none;
        border: none;
        border-bottom: 1px gray solid;
    }
    .striped th, .striped td {
        border-bottom: 1px gray solid;
        text-align: left;
    }
    `)
    $("li").on("click", function () {
        $('[data-toggle=popover]').popover('hide');
    })
    var mainjsReady = $.Deferred();
    $(".tab_hot").on("click", function () {
        $.when(mainjsReady).done(function () {
            $.each($("#tab_hot tr[data-levelid]:visible"), function (key, row) {
                var id = $(row).attr("data-levelid")
                loadLevelData(id)
            })
        })
    })
    $(".tab_liked").on("click", function () {
        $.when(mainjsReady).done(function () {
            $.each($("#tab_liked tr[data-levelid]:visible"), function (key, row) {
                var id = $(row).attr("data-levelid")
                loadLevelData(id)
            })
        })
    })
    $(".tab_hardest").on("click", function () {
        $.when(mainjsReady).done(function () {
            $.each($("#tab_hardest tr[data-levelid]:visible"), function (key, row) {
                var id = $(row).attr("data-levelid")
                loadLevelData(id)
            })
        })
    })
    $(".tab_mostplayed").on("click", function () {
        $.when(mainjsReady).done(function () {
            $.each($("#tab_mostplayed tr[data-levelid]:visible"), function (key, row) {
                var id = $(row).attr("data-levelid")
                loadLevelData(id)
            })
        })
    })
    $.ajax({
        type: 'GET',
        url: `https://w115l144.hoststar.ch/wl/communityLevels.php?m=7`,
        dataType: 'jsonp',
        crossDomain: true,
    }).done(function (response) {
        if (response.data) {
            var levels = response.data
            $("#tab_hot").append(`<table id="HotLevelsTable" cellpadding="8"></table>`)
            $.each(levels, function (key, level) {
                $("#HotLevelsTable").append(renderLevelRow(level, key))
                $(`[data-levelid='${level.levelId}']`).attr("data-rating", level.rating)
            })
            $("#HotLevelsTable").append("<button  class='btn btn-primary' id='loadMoreHot'>Load More</button>")
            $("#loadMoreHot").on("click", function () {
                $.each($("#tab_hot tr:hidden:lt(5)"), function (key, row) {
                    $(this).fadeIn()
                    $.when(mainjsReady).done(function () {
                        loadLevelData($(row).attr("data-levelid"))
                    })
                })
                if ($("#tab_hot tr:hidden:lt(5)").length == 0) {
                    $("#loadMoreHot").remove();
                }
            })
        }
    });
    $.ajax({
        type: 'GET',
        url: `https://w115l144.hoststar.ch/wl/communityLevels.php?m=8`,
        dataType: 'jsonp',
        crossDomain: true,
    }).done(function (response) {
        if (response.data) {
            var levels = response.data
            $("#tab_liked").append(`<table id="MostLikedLevels" cellpadding="8"></table>`)
            $.each(levels, function (key, level) {
                $("#MostLikedLevels").append(renderLevelRow(level, key))
                $(`[data-levelid='${level.levelId}']`).attr("data-rating", level.rating)
            })
            $("#MostLikedLevels").append("<button  class='btn btn-primary' id='loadMoreLiked'>Load More</button>")
            $("#loadMoreLiked").on("click", function () {
                $.each($("#tab_liked tr:hidden:lt(5)"), function (key, row) {
                    $(this).fadeIn()
                    $.when(mainjsReady).done(function () {
                        loadLevelData($(row).attr("data-levelid"))
                    })
                })
                if ($("#tab_liked tr:hidden:lt(5)").length == 0) {
                    $("#loadMoreLiked").remove();
                }
            })
        }
    });
    $.ajax({
        type: 'GET',
        url: `https://w115l144.hoststar.ch/wl/communityLevels.php?m=1`,
        dataType: 'jsonp',
        crossDomain: true,
    }).done(function (response) {
        if (response.data) {
            var levels = response.data
            $("#tab_hardest").append(`<table id="HardestLevelsTable" cellpadding="8"></table>`)
            $.each(levels, function (key, level) {
                $("#HardestLevelsTable").append(renderLevelRow(level, key))
            })
            $("#HardestLevelsTable").append("<button  class='btn btn-primary' id='loadMoreDifficult'>Load More</button>")
            $("#loadMoreDifficult").on("click", function () {
                $.each($("#tab_hardest tr:hidden:lt(5)"), function (key, row) {
                    $(this).fadeIn()
                    $.when(mainjsReady).done(function () {
                        loadLevelData($(row).attr("data-levelid"))
                    })
                })
                if ($("#tab_hardest tr:hidden:lt(5)").length == 0) {
                    $("#loadMoreDifficult").remove();
                }
            })
        }
    });
    $.ajax({
        type: 'GET',
        url: `https://w115l144.hoststar.ch/wl/communityLevels.php?m=2`,
        dataType: 'jsonp',
        crossDomain: true,
    }).done(function (response) {
        if (response.data) {
            var levels = response.data
            $("#tab_mostplayed").append(`<table id="MostPlayedLevelsTable" cellpadding="8"></table>`)
            $.each(levels, function (key, level) {
                $("#MostPlayedLevelsTable").append(renderLevelRow(level, key))
            })
            $("#MostPlayedLevelsTable").append("<button  class='btn btn-primary' id='loadMoreMostPlayed'>Load More</button>")
            $("#loadMoreMostPlayed").on("click", function () {
                $.each($("#tab_mostplayed tr:hidden:lt(5)"), function (key, row) {
                    $(this).fadeIn()
                    $.when(mainjsReady).done(function () {
                        loadLevelData($(row).attr("data-levelid"))
                    })
                })
                if ($("#tab_mostplayed tr:hidden:lt(5)").length == 0) {
                    $("#loadMoreMostPlayed").remove();
                }
            })
        }
    });
    $.ajax({
        type: 'GET',
        url: `https://w115l144.hoststar.ch/wl/communityLevels.php?m=3`,
        dataType: 'jsonp',
        crossDomain: true,
    }).done(function (response) {
        if (response.data) {
            var players = response.data;
            var pointsHelp = "The points for every player are calculated as following:<br><br> <pre>AVG = Average win rate of every level the player has a record on<br>N = Number of records the player has <br><br>Points = (1 - AVG) * N</pre>";
            $("#tab_records_player").append(`<table id="PlayerRecordsTable" cellpadding="8" class="striped"></table>`)
            $("#PlayerRecordsTable").prepend(`<thead><th>#</th><th>Name</th><th>Number of Records</th><th>Points <img tabindex="0" class="help-icon" src="${IMAGES.QUESTION}" data-content="${pointsHelp}" data-toggle="popover"></th></thead>`)
            $.each(players, function (key, player) {
                $("#PlayerRecordsTable").append(renderRecordPlayerRow(player, key))
            });
            $("[data-toggle=popover]").popover({
                trigger: 'click',
                html: true
            })
        }
    });
    $.ajax({
        type: 'GET',
        url: `https://w115l144.hoststar.ch/wl/communityLevels.php?m=4`,
        dataType: 'jsonp',
        crossDomain: true,
    }).done(function (response) {
        if (response.data) {
            var clans = response.data
            $("#tab_records_clan").append(`<table id="ClanRecordsTable" cellpadding="8" class="striped"></table>`)
            $("#ClanRecordsTable").prepend(`<thead><th>#</th><th>Name</th><th>Number of Records</th></thead>`)
            $.each(clans, function (key, clan) {
                $("#ClanRecordsTable").append(renderClanRow(clan, key))
            })
        }
    });
    $.ajax({
        type: 'GET',
        url: `https://w115l144.hoststar.ch/wl/communityLevels.php?m=9`,
        dataType: 'jsonp',
        crossDomain: true,
    }).done(function (response) {
        if (response.data) {
            var stats = response.data
            console.log(stats)
            $("#tab_stats").append(renderStatsRow("Total number of levels", stats.totalLevels))
            $("#tab_stats").append(renderStatsRow("Total attempts", stats.totalAttempts))
            $("#tab_stats").append(renderStatsRow("Average attempts", Math.round(stats.totalAttempts / stats.totalLevels, 0)))
            $("#tab_stats").append(renderStatsRow("Total likes", stats.totalLikes))
            $("#tab_stats").append(renderStatsRow("Average likes", Math.round(stats.totalLikes / stats.totalLevels, 0)))
            $("#tab_stats").append(renderStatsRow("Total creators", stats.totalCreators))
            $("#tab_stats").append(renderStatsRow("Total record holders", stats.totalRecordHolders))
            $("#tab_stats").append('<div style="may-width:800px"><canvas id="percentageDistribution"></canvas></(div>)')
            var ctx = document.getElementById('percentageDistribution').getContext('2d');
            var options = {
                responsive: true
            };
            var dataset = stats.percentageDistribution.map(function (val) {
                return val[0];
            });
            var labels = stats.percentageDistribution.map(function (val) {
                return val[1] + "% - " + (parseInt(val[1]) + 5) + "%";
            });
            var data = {
                labels: labels,
                datasets: [{
                    label: "Winrates",
                    backgroundColor: '#a28958',
                    borderColor: '#a28958',
                    data: dataset,
                }]
            };
            var myLineChart = new Chart(ctx, {
                type: 'line',
                data: data,
                options: options
            });
        }
    });
    addCSS(`
        tr td {
            vertical-align: middle!important;
        }
    `)
    $.ajax({
        type: 'GET',
        url: `https://w115l144.hoststar.ch/wl/communityLevels.php?m=6`,
        dataType: 'jsonp',
        crossDomain: true,
    }).done(function (response) {
        if (response.data) {
            var players = response.data;
            var pointsHelp = `The points for every creator are calculated as following:<br><br> <pre>N = Total number of levels created<br>L = Total number of likes received<br>A = Total number of attempts<br>W = Total number of wins<br><br>x = when N < 8 then 0.1 * N + 0.2 else 1 <br><br>Points = L / (N + 2) * 10 * x + A /(N + 2) * 0.5 * x + 350* (1 - W / A) * x
</pre>`;
            $("#tab_topCreators").append(`<table id="CreatorsTable" cellpadding="8" class="table table-striped mb-0"></table>`)
            $("#CreatorsTable").prepend(`<thead><th>#</th><th>Name</th><th>Total Likes</th><th>Total Attempts</th><th>Total Wins</th><th>Overall Win Rate</th><th>Total Levels</th><th>Points <img tabindex="0" class="help-icon" src="${IMAGES.QUESTION}" data-content="${pointsHelp}" data-toggle="popover"></th><th>-</th></thead><tbody></tbody>`)
            $.each(players, function (key, player) {
                $("#CreatorsTable tbody").append(renderCreatorPlayerRow(player, key))
            })
            var dataTable = $$$("#CreatorsTable").DataTable({
                paging: false,
                sDom: 't',
                initComplete: function () {
                    $("#CreatorsTable").removeClass("dataTable")
                },
            });
            $("[data-toggle=popover]").popover({
                trigger: 'click',
                html: true
            });
            $("[data-toggle=popover]").on("click", function (e) {
                e.stopPropagation();
                e.preventDefault();
            })
        }
    });
    var id = $("nav a[href*='Profile']").attr("href").replace(/\/Profile\?p=/, "");
    $.ajax({
        type: 'GET',
        url: `https://w115l144.hoststar.ch/wl/communityLevels.php?p=${id}`,
        dataType: 'jsonp',
        crossDomain: true,
    }).done(function (response) {
        if (response.data) {
            var levels = response.data
            $("#tab_ownLevels").append(`<table id="OwnLevelsTable" cellpadding="8"></table>`)
            $.each(levels, function (key, level) {
                $("#OwnLevelsTable").append(renderLevelRow(level, key, true))
            })
        }
    });
    $.ajax({
        type: 'GET',
        url: `https://w115l144.hoststar.ch/wl/communityLevels.php?o=${id}`,
        dataType: 'jsonp',
        crossDomain: true,
    }).done(function (response) {
        if (response.data) {
            var levels = response.data
            $("#tab_ownRecords").append(`<table id="OwnRecordsTable" cellpadding="8"></table>`)
            $.each(levels, function (key, level) {
                $("#OwnRecordsTable").append(renderLevelRow(level, key, true))
            })
        }
    });
    var div = $("<div></div>")
    var mainjs = "";
    div.load('https://www.warzone.com/SinglePlayer/Level?ID=882053', function () {
        mainjs = div.find("script:contains(MainJS.Init)").html()
        $.getScript("https://d2wcw7vp66n8b3.cloudfront.net/js/Release/wl.js?v=636045359309573936").done(function () {
            eval(mainjs);
            $("#WaitDialogJSWhiteBox").remove();
            $("#WaitDialogJSBacking").remove();
            mainjsReady.resolve();
        })
    });
}

function renderStatsRow(name, value) {
    if (value && Number(value)) {
        return $("<div style='margin-bottom: 10px'>").html("<b>" + name + "</b>: " + Number(value).toLocaleString("en"))
    }
}

function searchLevel() {
    var query = $(".searchLevelInput").val().toLowerCase();
    $(".foundLevels *").remove();
    $.ajax({
        type: 'GET',
        url: `https://w115l144.hoststar.ch/wl/communityLevels.php?q=${query}`,
        dataType: 'jsonp',
        crossDomain: true,
    }).done(function (response) {
        if (response.data) {
            if (response.data.length > 0) {
                var levels = response.data
                $(".foundLevels").append(`<table id="FoundLevelTable" cellpadding="8"></table>`)
                $.each(levels, function (key, level) {
                    $("#FoundLevelTable").append(renderLevelRow(level, key))
                })
            } else {
                $(".foundLevels").append(`<span>No levels found!</span>`)
            }
        } else {
            $(".foundLevels").append(`<span>Error searching for levels</span>`)
        }
    });
}

function decode(str) {
    var decoded = "";
    try {
        decoded = decodeURIComponent((str + '').replace(/%(?![\da-f]{2})/gi, function () {
            return '%25'
        }).replace(/\+/g, '%20'))
    } catch (e) {
        decoded = unescape(str);
    }
    return decoded;
}

function renderRecordPlayerRow(player, key) {
    var rank = getRankHtml(key + 1)
    return `
        <tr>
            <td>${rank}</td>
            <td>
                ${player.recordClanId > 0 ? '<a href="/Clans/?ID=' + player.recordClanId + '" title="' + player.recordClanName + '"><img border="0" style="vertical-align: middle" src="' + player.recordClanImage + '"></a>' : ''}
                <a href="${player.recordHolderUrl}"> ${decode(player.recordHolderName)} </a>
            </td>
            <td>
               ${player.numOfRecords}
            </td>
            <td>
               ${(Math.round(player.points * 10) / 10).toFixed(2)}
            </td>
        </tr>`
}

function renderCreatorPlayerRow(player, key) {
    var id = player.createdByUrl.match(/[0-9]+/)[0]
    var rank = getRankHtml(key + 1)
    return `
        <tr>
            <td style="text-align:center;padding:0" data-sort="${key + 1}">${rank}</td>
            <td>
                ${player.creatorClanId > 0 ? '<a href="/Clans/?ID=' + player.creatorClanId + '" title="' + player.creatorClanName + '"><img border="0" style="vertical-align: middle" src="' + player.creatorClanImage + '"></a>' : ''}
                <a href="${player.createdByUrl}"> ${decode(player.createdByName)} </a>
            </td>
            <td>
               ${player.numOfTotalLikes}
            </td> 
            <td>
               ${player.numOfTotalAttempts}
            </td> 
            <td>
               ${player.numOfTotalWins}
            </td> 
            <td>
               ${(player.numOfTotalWins / player.numOfTotalAttempts * 100).toFixed(2)}%
            </td> 
            <td>
               ${player.numOfCreatedLevels}
            </td> 
            <td>
               ${player.points}
            </td> 
            <td>
               <a href="https://www.warzone.com/SinglePlayer/LevelsByCreator?p=${id.substring(2, id.length - 2)}">Show Levels</a>
            </td>
        </tr>`
}

function renderClanRow(clan, key) {
    var rank = getRankHtml(key + 1)
    return `
        <tr>
            <td>${rank}</td>
            <td>
                <a href="/Clans/?ID=${clan.recordClanId}" title="${clan.recordClanId}"><img border="0" style="vertical-align: middle" src="${clan.recordClanImage}">${decode(clan.recordClanName)}</a>
            </td>
            <td>
               ${clan.numOfRecords}
            </td>
        </tr>`
}

function renderLevelRow(level, key, showAll) {
    return `
        <tr data-levelid="${level.levelId}" ${(key >= 10 && showAll != true) ? 'style="display:none"' : ''}>
            <td style="position: relative">
                <img src="${level.mapImage}" width="140" height="80" style="position:relative">
            </td>
            <td>
                <a style="font-size: 17px; color: white" 
                    href="/SinglePlayer/Level?ID=${level.levelId}">${key + 1}. ${decode(level.name)}
                </a> &nbsp;&nbsp;
                <font color="gray">${level.likes} likes, ${level.wins} wins in ${level.attempts} attempts</font><br>

                <font color="gray">Created by</font> ${level.creatorClanId > 0 ? '<a href="/Clans/?ID=' + level.creatorClanId + '" title="' + level.creatorClanName + '"><img border="0" style="vertical-align: middle" src="' + level.creatorClanImage + '"></a>' : ''} <a href="${level.createdByUrl}">${decode(level.createdByName)}</a><br>

                <font color="gray">Record holder:</font> ${level.recordClanId > 0 ? '<a href="/Clans/?ID=' + level.recordClanId + '" title="' + level.recordClanId + '"><img border="0" style="vertical-align: middle" src="' + level.recordClanImage + '"></a>' : ''} ${level.recordHolderName ? '<a href="' + level.recordHolderUrl + '">' + decode(level.recordHolderName) + '</a>' + getTurnText(level.recordHolderText) : 'None'}<br>

                <font color="gray">Win rate: </font>${level.percentage}%<br>
            </td>
            <td><span style="font-size: 17px"><a href="/SinglePlayer?Level=${level.levelId}">Play</a></span></td>
        </tr>`
}

function getTurnText(turns) {
    return ` in ${turns} ${turns > 1 ? 'turns' : 'turn'}`
}

function getRankHtml(rank) {
    if (rank == 1) {
        return `<img height=30 width=30 style="padding:0" src="https://i.imgur.com/dG4hKlp.gif">`
    } else if (rank == 2) {
        return `<img height=30 width=30 style="padding:0" src="https://imgur.com/qmpjRNs.gif">`
    } else if (rank == 3) {
        return `<img height=30 width=30 style="padding:0" src="https://imgur.com/DgtbQDN.gif">`
    }
    return rank;
}

function loadLevelData(id) {
    warlight_shared_viewmodels_spe_SPEManager.GetLevelResult(id, function (levelData) {
        if (levelData && levelData.WinCount > 0) {
            $(`[data-levelid="${id}"] td:nth-of-type(2)`).append(`You won ${getTurnText(levelData.WonInTurns)}`)
            $(`[data-levelid="${id}"] td:nth-of-type(1)`).append('<img src="https://d2wcw7vp66n8b3.cloudfront.net/Images/TransparentCheck.png" width="61" height="53" style="position: absolute; right: 0px; bottom: 0px">')
        }
        $(`[data-levelid="${id}"]`).attr("data-levelid", "done")
    })
}

function setupPlayerAttempDataTable() {
    var playerData = []
    $("#AutoContainer ul").find("li").map(function () {
        var player = $(this).children().map(function () {
            return $(this).outerHTML()
        }).get().join("")
        var str = $(this).clone().children().remove().end().text();
        var attempts = str.split(", ")[0].replace(/[^0-9]/g, '');
        var wins = str.split(", ")[1].replace(/[^0-9]/g, '')
        playerData.push({
            player: player,
            attempts: attempts,
            wins: wins
        })
    });
    var table = "<table id='playlogPreview'><thead><th>Name</th><th>Attempts</th><th>Wins</th></thead>";
    $.each(playerData, function (k, player) {
        var tr = `<tr><td>${player.player}</td><td>${player.attempts}</td><td>${player.wins}</td></tr>`;
        table += tr;
    });
    table += "</table>";
    $("#AutoContainer ul").replaceWith(table);
    loadDataTableCSS();
    var dataTable = $$$("#playlogPreview").DataTable({
        "order": [2],
        paging: false,
        sDom: 't',
        columnDefs: [{
            targets: [0, 1, 2],
        }, {
            targets: [1],
            orderData: [1, 2, 0]
        }, {
            targets: [2],
            orderData: [2, 1, 0],
        }],
        "aoColumns": [
            {
                "orderSequence": ["asc", "desc"]
            },
            {
                "orderSequence": ["desc", "asc"]
            },
            {
                "orderSequence": ["desc", "asc"]
            }
        ]
    });
    addCSS(`
        #playlogPreview a {
            margin-right: 10px;
        }
        #playlogPreview td {
            white-space: nowrap;
        }
    `)
}
function parseForumSPLevels() {
    console.log("parsing sp levels")
    var path = 'SinglePlayer';
    var regex = new RegExp(path, 'i');
    $('.region a').each(function () {
        var href = $(this).attr('href')
        if (href && href.match(regex)) {
            parseSPLevel(this, href);
        }
    });
    addCSS(`
        table.SPTable {
            width:100%;
            background: rgba(255,255,255,0.05)
        }
        .SPTable tr {
            display: flex;
            align-items: stretch;
        }
        .SPTable td:last-child {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-right: 5px;
        }
    `)
}

function parseSPLevel(elem, href) {
    var levelId = getLeveId(href);
    if (levelId) {
        $.ajax({
            type: 'GET',
            url: `https://w115l144.hoststar.ch/wl/communityLevels.php?id=` + levelId,
            dataType: 'jsonp',
            crossDomain: true,
        }).done(function (response) {
            if (response.data) {
                console.log(response.data)
                var level = response.data[0]
                var row = renderLevelRow(level, 0, true);
                var table = $("<table class='SPTable'></table>")
                table.append(row)
                $(elem).replaceWith(table);
                table.find("tr td").css("text-align", "left");
            }
        });

    }
}

function getLeveId(href) {
    var match = href.match(/level\?id=(.*)/i) || href.match(/level=(.*)/i)
    if (match) {
        return match[1]
    }
}
function getArt() {
    return {
        Types: {
            DivA: {
                Player: {
                    FullHeight: 250,
                    IconHeight: 60
                },
                Clan: {
                    FullHeight: 350,
                    IconHeight: 80
                }
            },
            DivB: {
                Player: {
                    FullHeight: 200,
                    IconHeight: 50
                },
                Clan: {
                    FullHeight: 250,
                    IconHeight: 70
                }
            }
        },
        Groups: [
            {
                Type: "DivA",
                Title: "Clan League 9",
                Players: {
                    //Malakkan
                    257509174: ["https://i.imgur.com/16vS4Ut.png"],
                    //#Master [QB]
                    5518973792: ["https://i.imgur.com/ZssJxOk.png", "https://i.imgur.com/5xKJQVQ.png"],
                    //Master Ryiro
                    5015900432: ["https://i.imgur.com/NDCh1iF.png", "https://i.imgur.com/9AchdrO.png"],
                    //Master Jz
                    4439722815: ["https://i.imgur.com/ZH0MaxV.png"],
                    //Master of the Dead
                    2428496679: ["https://i.imgur.com/OLo56yI.png", "https://i.imgur.com/0Wy9qmT.png", "https://i.imgur.com/HeInmGN.png"],
                    //PanagiotisTheGreekFreak
                    2049943516: ["https://i.imgur.com/mz3FZql.png"],
                    //Timinator • apex
                    816809922: ["https://i.imgur.com/6kljYSb.png", "https://i.imgur.com/BqCAzbp.png"],
                    //{101st} Master Sarah♦
                    4543063534: ["https://i.imgur.com/QbffPl9.png", "https://i.imgur.com/RTNBhYr.png"],
                    //Beren • apex
                    314032996: ["https://i.imgur.com/98JUdFy.png"],
                    //Muli
                    2211733141: ["https://i.imgur.com/XqV4Hjy.png"],
                    //Sephiroth
                    9911415828: ["https://i.imgur.com/PD93aHT.png"],
                    //Master Atom ◆Elite◆
                    3427873563: ["https://i.imgur.com/SDTtj3O.png"],
                    //Jefferspin
                    6319040229: ["https://i.imgur.com/ewDBddw.png"],
                    //master of desaster
                    2214950915: ["https://i.imgur.com/1oTZcHn.png", "https://i.imgur.com/xeuvFzs.png"],
                    //AWESOMEGUY
                    796423469: ["https://i.imgur.com/17IV10e.png"]
                },
                Clans: {
                    //Masters
                    11: ["https://i.imgur.com/spTbW2c.png"],
                    //One
                    170: ["https://i.imgur.com/r0KGhkC.png"],
                    //Outlaws
                    260: ["https://i.imgur.com/rjYJbAL.png"]
                }
            }, {
                Type: "DivB",
                Title: "Clan League 9",
                Players: {
                    //smileyleg
                    3929495241: ["https://i.imgur.com/bGzoMkd.png"],
                    //Master Moto
                    6862295334: ["https://i.imgur.com/eO6T4D2.png"],
                    //Ollie
                    7524524629: ["https://i.imgur.com/OCFI7Lw.png"],
                    //almosttricky
                    4817205946: ["https://i.imgur.com/W9EugfQ.png"],
                    //Hobo
                    239359818: ["https://i.imgur.com/aoe1IAH.png"],
                    //Botanator
                    633358359: ["https://i.imgur.com/FIXeYG5.png"],
                    //ViralGoat
                    7841556925: ["https://i.imgur.com/DOXeAsO.png"],
                    //EZPickens
                    55998716: ["https://i.imgur.com/6QoMxs5.png"],
                    //Mifran
                    4825272432: ["https://i.imgur.com/3Dcq6eh.png"],
                    //JV
                    8019640756: ["https://i.imgur.com/IxdYo7S.png"],
                    //KO
                    7818276235: ["https://i.imgur.com/sOOvMDz.png"],
                    //DarrenDieHard
                    82622046: ["https://i.imgur.com/ieeUKje.png"],
                    //Inside
                    105380470: ["https://i.imgur.com/xYSTPm4.png"],
                    //Tobe
                    4514168736: ["https://i.imgur.com/xQkMg9h.png"],
                    //Jaymer
                    3237238849: ["https://i.imgur.com/i1HxTh8.png"],
                    //kirby
                    8818886504: ["https://i.imgur.com/hrdHmXm.png"],
                    //rakleader
                    8136895102: ["https://i.imgur.com/ugUpnM2.png"],
                    //Timtimie
                    8311000679: ["https://i.imgur.com/oQg2idd.png"],
                    //Cluster
                    7010496305: ["https://i.imgur.com/3wN6HDI.png"]
                },
                Clans: {
                    //GG
                    9: ["https://i.imgur.com/90oitx6.png"],
                    //MH
                    141: ["https://i.imgur.com/n55iL2y.png"],
                    //VS
                    188: ["https://i.imgur.com/c4bDQ6u.png"]
                }
            }
        ],
    }
}

function setupCLArt() {
    setupArtIcons();
    addCSS(`
        #clArt img {
            float: left;
            margin: 5px;
        }
        #clArt {
            max-width: 250px;
            cursor: pointer;
        }
        #clArt a {
            clear: both;
            display: block;
        }
        #awardDialog {
            display: none;
        }
        #awardDialog img {
            display: inline-block;
            margin: 20px;
            webkit-filter: drop-shadow(5px 10px 6px black);
            filter: drop-shadow(5px 10px 6px black);
        }
        #awardDialog .group {
            text-align: left;
            padding: 8px 30px;
            margin: 20px 10px;
            background-size: cover;
        }
        #awardDialog h1 {
            text-align: left;
            text-transform: uppercase;
            font-weight: bold;
            color: rgba(255, 255, 255, 0.66);
            display: block;
            font-size: 28px;
        }
        .clearFloat{
            display: block;
            width: 100%;
        }
        .ui-widget-header {
            border: none;
            background: none;
        }
        .ui-state-default, .ui-widget-content .ui-state-default, .ui-widget-header .ui-state-default {
            border: none;
            background: none;
            outline: none;
            margin: -2px;
            z-index: 10;
        }
        .ui-dialog {
            background: url(https://i.imgur.com/woAdW0h.png);
            background-size: cover;
        }
    `)
}

function setupArtIcons() {
    if (pageIsProfile()) {
        setupArtIconsProfile();
    } else if (pageIsClanPage()) {
        setupArtIconsClan();
    }
}

function setupArtIconsProfile() {
    var dialog = $('<div id="awardDialog" title=""></div>');
    var dialogContent = $('<div class="content"></div>');
    var id = window.location.href.replace(/.*warzone.com\/Profile\?p=/, "");
    $('a[href*="Achievements"]').closest("tr").after("<tr><td colspan='3' id='clArt'></td></tr>");
    var count = 0;
    getArt().Groups.forEach(function (group, key) {
        var groupContent = $("<div class='group'></div>")
        groupContent.append("<h1>" + group.Title + "</h1><div class='clearFloat'></div>")
        if (group.Players[id]) {
            group.Players[id].forEach(function (img, key) {
                $("#clArt").append(getImageIcon(img, group, "Player"))
                groupContent.append(getImageFullSize(img, group, "Player"))
                count++;
            })
            dialogContent.append(groupContent);
        }
    })
    $("#clArt").prepend("<h3>Awards <font color='gray'>(" + count + ")</font></h3>")
    if (count > 0) {
        $("#clArt").append("<a>Show All</a>")
    } else {
        $("#clArt").append("<em>No awards yet</em>")
    }
    dialog.append(dialogContent);
    appendDialog($(dialog).html())
    if (count > 0) {
        $("#clArt").on("click", function () {
            $("#userscriptAwards").modal("show");
        })
    }
}

function setupArtIconsClan() {
    $("#AutoContainer > table tr > td:nth-of-type(3)").append("<div id='clArt'></div>");
    $("#AutoContainer > table tr > td:nth-of-type(3)").css("padding-top", 0);
    addCSS(`
        #clArt {
            display: inline-block;
            top: 45px;
            position: absolute;
        }
    `)
    var dialog = $('<div id="awardDialog" title=""></div>');
    var dialogContent = $('<div class="content"></div>');
    var id = window.location.href.replace(/.*Clans\/\?ID=/, "");
    var count = 0;
    getArt().Groups.forEach(function (group, key) {
        var groupContent = $("<div class='group'></div>")
        groupContent.append("<h1>" + group.Title + "</h1><div class='clearFloat'></div>")
        if (group.Clans[id]) {
            group.Clans[id].forEach(function (img, key) {
                $("#clArt").append(getImageIcon(img, group, "Clan"))
                groupContent.append(getImageFullSize(img, group, "Clan"))
                count++;
            })
            dialogContent.append(groupContent);
        }
    })
    $("#clArt").prepend("<h3>Achievements <font color='gray'>(" + count + ")</font></h3>")
    if (count > 0) {
        $("#clArt").append("<a>Show All</a>")
    } else {
        $("#clArt").append("<em>No achievements yet</em>")
    }

    $("#clArt").css("position", "inherit")

    dialog.append(dialogContent);
    appendDialog($(dialog).html())
    if (count > 0) {
        $("#clArt").on("click", function () {
            $("#userscriptAwards").modal("show");
        })
    }
}

function appendDialog(content) {
    $("body").append(`
        <div class="modal modal-1000 fade" id="userscriptAwards" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                ${content}
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
    `)
}

function getImageFullSize(href, group, type) {
    var height = getArt().Types[group.Type][type].FullHeight;
    return "<img src='" + href + "' height='" + height + "'>"
}

function getImageIcon(href, group, type) {
    var height = getArt().Types[group.Type][type].IconHeight;
    return "<img src='" + href + "' height='" + height + "'>"
}
function setupUJS() {
    if ($("#UjsContainer").length == 0) {
        log("UjsContainer not found");
        return;
    }
    createUJSMenu();
    var interval = window.setInterval(function () {
        if (typeof UJS_Hooks != "undefined") {
            log("UJS_Hooks loaded");
            window.clearInterval(interval);
            setupMirrorPicks();
        }
    }, 100);
}

function createUJSMenu() {
    $(".navbar-nav .nav-item:first").before(`
        <li class="nav-item dropdown game-menu">
            <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#">Game</a>
            <div class="dropdown-menu p-0 br-3 ujs-dropdown"></div>
        </li>`);
    $(".game-menu").on("click", function () {
        setupMirrorPicks();
    })
}

function createUJSSubMenu(name, className) {
    $(".ujs-dropdown").append(`
     <li class="dropdown-submenu" id="` + className + `">
        <a class="dropdown-toggle dropdown-item" data-toggle="dropdown" href="#" aria-expanded="true">` + name + `</a>
        <ul class="dropdown-menu ` + className + `" aria-labelledby="navbarDropdownMenuLink"></ul>

      </li>
    `)
}

function createUJSSubMenuEntry(parent, name) {
    var entry = $('<li><a class="dropdown-item" href="#">' + name + '</a></li>');
    $("." + parent).append(entry);
    return entry;
}

function setupMirrorPicks() {
    if (UJS_Hooks.Links.Latest == undefined || UJS_Hooks.Links._gameDetails.NumberOfTurns >= 0 || UJS_Hooks.Links.Latest.TeammatesOrders == null) {
        return;
    }
    console.log("creating menu");
    $("#mirror-picks").remove();
    createUJSSubMenu("Mirror Picks", "mirror-picks");
    var orders = UJS_Hooks.Links.Latest.TeammatesOrders.store.h;
    var players = UJS_Hooks.Links._gameDetails.Players.store.h;
    var myLongId = $("nav a[href*='Profile']").attr("href").replace(/\/Profile\?p=/, "");
    var myId = myLongId.substring(2, myLongId.length - 2);
    var myPlayer = players[myId];
    Object.keys(players).map(function (playerId) {
        var player = players[playerId];
        if (player.IsTeammate(myPlayer.Team) && player.GamePlayerID != myPlayer.GamePlayerID) {
            var playerName = player.DisplayName();
            var entry = createUJSSubMenuEntry("mirror-picks", "Mirror " + playerName);
            entry.on("click", function () {
                try {
                    mirrorPicks(playerId);
                } catch (e) {
                    log(e);
                    throw e;
                }
            });
        }
    })
}

function mirrorPicks(playerId) {
    var player = UJS_Hooks.Links.Latest.TeammatesOrders.store.h[playerId];
    console.log(playerId, player)
    if (player) {
        pickTerritories(player.Picks)
    }
}

function pickTerritories(picks) {
    console.log(picks)
    if ($("#ujs_OrdersListItemContents").children().length == 0) {
        $("svg").click()
        $.each(picks, function (key, val) {
            pickTerritory(val);
        });
    } else {
        CreateModal("Alert", "", "Please clear your orders first.", false)
    }
}

function pickTerritory(id) {
    var state = UJS_Hooks.BuildingTurnState;
    var order = new UJS_Hooks.GameOrderPick(state.Root.Links.get_Us().get_ID(), id, state.Orders.length)
    state.InsertOrder(new UJS_Hooks.OrdersListItemVM(order, state.Root, state.Root.Links.Latest.LatestStanding))
}

addCSS(`
    .navbar-nav li:hover > ul.dropdown-menu {
        display: block;
    }
    .dropdown-submenu {
        position:relative;
    }
    .dropdown-submenu>.dropdown-menu {
        top:0;
        left:100%;
        margin-top:-6px;
    }
    .ujs-menu .dropdown-menu {
    padding: 0px;

    }
`);
function setupCommonGamesDataTable() {
    var $$$$$ = jQuery.noConflict(true);
    var dataTable = $$$(".dataTable").DataTable({
        "order": [],
        paging: false,
        sDom: 't',
        columnDefs: [{
            targets: [0],
            orderData: [0, 3]
        }, {
            targets: [1],
            orderData: [1, 2, 3, 0]
        }, {
            targets: [2],
            orderData: [2, 3, 0]
        }, {
            targets: [3],
            orderData: [3, 2, 0]
        }],
        "aoColumns": [
            {
                "orderSequence": ["asc", "desc"]
            },
            {
                "orderSequence": ["asc", "desc"]
            },
            {
                "orderSequence": ["asc", "desc"]
            },
            {
                "orderSequence": ["asc", "desc"]
            },
        ]
    });
    loadDataTableCSS();
    setupCommonGamesHead2Head();
}

function setupCommonGamesHead2Head() {
    var games = $(".dataTable tbody tr").map(function (key, row) {
        return $(row).find("td").map(function (key, td) {
            return $(td).text()
        });
    });
    var games1v1 = games.filter(function (key, val) {
        return val[2] == "1v1"
    }).length || 0;
    var wins1v1 = games.filter(function (key, val) {
        return val[2] == "1v1" && val[3] == "Won";
    }).length;
    var gamesNotCounted = games.filter(function (key, val) {
        return val[2] == "1v1" && (val[3] == "Playing"
            || val[3] == "Removed by Host"
            || val[3] == "Ended by vote");
    }).length;
    var winRate = (wins1v1 / (games1v1 - gamesNotCounted) * 100).toFixed(2);
    var losses = games1v1 - wins1v1 - gamesNotCounted;
    $(".dataTable").before(`
        <table cellspacing="0" cellpadding="2" width="100%" class="dataTable head2head">
           <thead>
              <tr>
                 <td colspan="2">Head-To-Head</td>
              </tr>
           </thead>
           <tbody>
              <tr>
                 <td>1v1 Games</td>
                 <td>${games1v1}</td>
              </tr>
              <tr>
                 <td>1v1 Wins</td>
                 <td>${wins1v1}</td>
              </tr>
              <tr>
                 <td>1v1 Losses</td>
                 <td>${losses}</td>
              </tr>
              <tr>
                 <td>1v1 Win Rate</td>
                 <td>${winRate}%</td>
              </tr>
           </tbody>
        </table>
    `);
    addCSS(`
        .head2head {
            width: 50% !important;
            margin-bottom: 25px;
        }
    `)
}