window.mtlRatingCache = {};

function loadMtlPlayer(playerId) {
    var cachedRating = mtlRatingCache[playerId];
    if (cachedRating != undefined) {
        return $.Deferred().resolve({ data: JSON.stringify({ player: { displayed_rating: cachedRating } }) });
    }
    var urlParam = "https://warlight-mtl.com/api/v1.0/players/" + playerId;
    var url = "https://maak.ch/wl/httpTohttps.php?url=" + encodeURI(urlParam);
    return $.ajax({
        type: 'GET',
        url: url,
        dataType: 'jsonp',
        crossDomain: true,
        timeout: 9000,
    });
}

function setupMtlProfile() {
    var playerId = location.href.match(/p=(\d+)/)[1];
    var urlParam = "https://warlight-mtl.com/api/v1.0/players/" + playerId;
    var url = "https://maak.ch/wl/httpTohttps.php?url=" + encodeURI(urlParam);
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'jsonp',
        crossDomain: true
    }).done(function (response) {
        var data = JSON.parse(response.data);
        var player = data.player;
        if (player) {
            var mdlStats = '<td><a target="_blank" href="https://warlight-mtl.com/player?playerId=' + playerId + '">MDL</a></td>';
            if (player.rank) {
                mdlStats += '<td>' + getRankText(player.best_rank) + ' (' + player.best_displayed_rating + ')</td><td>' + getRankText(player.rank) + ' (' + player.displayed_rating + ')</td>'
            } else if (player.best_displayed_rating) {
                mdlStats += `<td> ${getRankText(player.best_rank)} (${player.best_displayed_rating}) </td><td> Unranked (${player.displayed_rating}) </td>`;
            } else if (player.displayed_rating) {
                mdlStats += `<td></td><td> Unranked (${player.displayed_rating}) </td>`;
            }
        } else {
            var mdlStats = '<td><a target="_blank" href="https://warlight-mtl.com/">MDL</a></td>';
            mdlStats += '<td colspan="2">Currently not participating </td>'
        }
        $("h3:contains('Ladders')").next().find("table tbody").prepend('<tr>' + mdlStats + '</tr>');
    })
}

function setupMtlLadderTable() {
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
    `);
    var mtlData = `
    <section class="container" id="mtlData">
        <div class="p-3"> 
            <div class="row bg-gray p-3 br-4">
                <div class="mdlPlayers p-3 " style="flex:1">
                    <div class="spinner mdlPlayerTable-loading" style="min-width:265px">
                    <div class="bounce1"></div>
                    <div class="bounce2"></div>
                    <div class="bounce3"></div>
                    </div>
                    <div class="mdl-content" style="display:none">
                        <a href="https://warlight-mtl.com/allplayers" style="float:right;margin-top:5px">Show All</a>
                    </div>
                </div>
                <div class="mdlGames p-3 " style="flex:1">
                    <div class="spinner mdlGamesTable-loading">
                    <div class="bounce1"></div>
                    <div class="bounce2"></div>
                    <div class="bounce3"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>`;
    $(".container:nth-of-type(1)").after(mtlData);
    getMtlPlayerTable(function (table) {
        $(".mdlPlayers .mdl-content").prepend(table);
        $(".mdlPlayerTable-loading").remove();
        $(".mdlPlayers .mdl-content").show();
    });
    getMtlGamesTable(10, function (table) {
        $(".mdlGames").prepend(table);
        $(".mdlGamesTable-loading").remove();
        $("#DashboardLadderTabs-6 .mdlGames table").show();
    });
}

function getMtlGamesTable(numOfGames, cb) {
    var content = $("<div>");
    content.prepend('<h4 class="mb-0 py-3"><a href="https://warlight-mtl.com/">Multi-day ladder</a>: Recent Games</h4>');
    var table = $("<table>").attr("cellpadding", 2).attr("cellspacing", 0).css("width", "100%").addClass("table table-striped mb-0");
    table.append(`
        <thead>
            <tr>
                <td>Game</td>
                <td>Link</td>
            </tr>
        </thead>
    `);
    table.append("<tbody></table>");
    var urlParam = "https://warlight-mtl.com/api/v1.0/games/?topk=" + numOfGames;
    var url = "https://maak.ch/wl/httpTohttps.php?url=" + encodeURI(urlParam);
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'jsonp',
        crossDomain: true
    }).done(function (response) {
        var data = JSON.parse(response.data);
        var games = data.games;
        $.each(games, function (key, game) {
            var p1 = game.players[0];
            var p2 = game.players[1];
            var winner = game.winner_id;
            var rowData = "<td>" + getPlayerGameString(p1, p2, winner) + "</td>";
            if (game.is_game_deleted) {
                rowData += "<td>DELETED</td>"
            } else {
                rowData += "<td><a href='https://www.warlight.net/MultiPlayer?GameID=" + game.game_id + "'>" + game.game_id + "</a></td>"
            }
            table.append("<tr>" + rowData + "</tr>")
        });
        content.append(table);
        if (cb) {
            cb(content)
        }
    })
}

function getMtlPlayerTable(cb) {
    var content = $("<div>");
    content.prepend('<h4 class="mb-0 py-3"><a href="https://warlight-mtl.com/">Multi-day ladder</a>: Rankings</h4>');
    var table = $("<table>").attr("cellpadding", 2).attr("cellspacing", 0).css("width", "100%").addClass("table table-striped mb-0");
    table.append(`
        <thead>
           <tr>
                <td>Rank</td>
                <td>Name</td>
                <td>Rating</td>
           </tr>
        </thead>`);
    table.append("<tbody></table>");
    var urlParam = "https://warlight-mtl.com/api/v1.0/players/?topk=10";
    var url = "https://maak.ch/wl/httpTohttps.php?url=" + encodeURI(urlParam);
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'jsonp',
        crossDomain: true
    }).done(function (response) {
        var data = JSON.parse(response.data);
        var players = data.players;
        players = players.filter(function (p) {
            return p.rank <= 10
        }).sort(function (p1, p2) {
            return p1.rank - p2.rank
        });
        $.each(players, function (key, player) {
            var rowData = "<td>" + player.rank + "</td>";
            var playerLink = getPlayerLink(player);
            var clanIcon = getClanIcon(player);
            rowData += "<td>" + clanIcon + playerLink + "</td>";
            rowData += "<td>" + player.displayed_rating + "</td>";
            $(table).find("tbody").append("<tr>" + rowData + "</tr>")
        });
        if (cb) {
            content.append(table);
            cb(content)
        }
    })
}

function setupMtlForumTable() {
    let title = $("title").text().toLowerCase();
    title = title.replace(/[^a-zA-Z]/g, '');
    if (title.includes("mtl") || title.includes("multitemplate") || title.includes("mdl") || title.includes("multiday")) {
        var mdlContainer = setupBottomForumContainer("mdl");
        getMtlPlayerTable(function (table) {
            mdlContainer.prepend(table)
        });
        getMtlGamesTable(10, function (table) {
            mdlContainer.append(table);
        })
    }
}

function getPlayerGameString(p1, p2, winnerId) {
    var c1 = getClanIcon(p1);
    var c2 = getClanIcon(p2);
    var p1s = c1 + "<a target='_blank' href='https://warlight-mtl.com/player?playerId=" + p1.player_id + "'> " + p1.player_name + "</a>";
    var p2s = c2 + "<a target='_blank' href='https://warlight-mtl.com/player?playerId=" + p2.player_id + "'> " + p2.player_name + "</a>";
    if (p1.player_id == winnerId) {
        return p1s + " defeated " + p2s
    } else {
        return p2s + " defeated " + p1s
    }
}

function getPlayerLink(player) {
    return "<a href='https://warlight-mtl.com/player?playerId=" + player.player_id + "'> " + player.player_name + "</a>"
}

function getClanIcon(player) {
    if (player.clan_id) {
        return '<a href="https://warlight-mtl.com/clan?clanId=' + player.clan_id + '" title="' + player.clan + '"><img border="0" style="vertical-align: middle" src="' + player.clan_icon + '"></a>'
    } else {
        return ""
    }
}

function getRankText(n) {
    var s = ["th", "st", "nd", "rd"];
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function setupBottomForumContainer(className) {
    $("#ReplyDiv").after("<div class='" + className + "'></div>");
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
    `);
    return $("." + className);
}