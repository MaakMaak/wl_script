window.mdlRatingCache = {};

function loadMdlPlayer(playerId) {
    var cachedRating = mdlRatingCache[playerId];
    if (cachedRating != undefined) {
        return $.Deferred().resolve({ data: JSON.stringify({ player: { displayed_rating: cachedRating } }) });
    }
    var urlParam = "http://md-ladder.cloudapp.net/api/v1.0/players/" + playerId;
    var url = "https://maak.ch/wl/httpTohttps.php?url=" + encodeURI(urlParam);
    return $.ajax({
        type: 'GET',
        url: url,
        dataType: 'jsonp',
        crossDomain: true,
        timeout: 9000,
    });
}
function displayMdlRating(games) {
    var playerId =  warlight_shared_viewmodels_SignIn.get_CurrentPlayer().ID;
    var fullPlayerId = String(warlight_shared_viewmodels_SignIn.get_CurrentPlayer().ProfileToken).substring(0, 2) + playerId + String(warlight_shared_viewmodels_SignIn.get_CurrentPlayer().ProfileToken).substring(2, 4);
    try {
        loadMdlPlayer(fullPlayerId).done(response => {
            var player = JSON.parse(response.data).player;
            var playerRating = player.displayed_rating || Math.floor(Math.random() * 3);
            window.mdlRatingCache[fullPlayerId] = playerRating;
            $.each(games, function (key, game) {
                if (game._nameLowered.startsWith("mtl|")) {
                    var id = game.GameID;
                    var opponent = game.Players.filter(p => p.PlayerID != playerId)[0]
                    var opponentId = opponent.PlayerID
                    warlight_shared_viewmodels_main_manageplayers_ManagePlayersVM.SearchPlayers(null, opponent.Name, function (players) {
                        var opponentSearchResult = players.Results.filter(p => p.PlayerID == opponentId)[0]
                        var opponentFullId = String(opponentSearchResult.ProfileToken).substr(0, 2) + String(opponentSearchResult.PlayerID) + String(opponentSearchResult.ProfileToken).substr(2, 2);;
                        loadMdlPlayer(opponentFullId).done(response => {
                            var opponent = JSON.parse(response.data).player;
                            var opponentRating = opponent.displayed_rating || Math.floor(Math.random() * 4);
                            window.mdlRatingCache[opponentFullId] = opponentRating;
                            var change = calculateEloChange(playerRating, opponentRating);
                            $(`[gameid='${id}'] td:nth-of-type(2) a:nth-of-type(1)`).append(`<span title="Expected Multi-Template Ladder rating change" style="color: gray; font-size: small"> (+${change.win} / ${change.lose})</span>`)
                        });
                    })
                }
            });
        });
    } catch (e) {
        console.error("Failed loading mdl elo changes", e)
    }
}

function calculateEloChange(playerRating, opponentRarting) {
    var k = 32;
    var winChange = Math.round(k * (1 - (1 / (1 + Math.pow(10, (opponentRarting - playerRating) / 400)))));
    var loseChange = Math.round(k * (0 - (1 / (1 + Math.pow(10, (opponentRarting - playerRating) / 400)))));
    return { win: winChange, lose: loseChange };
}

function setupMDLProfile() {
    var id = location.href.match(/([0-9]*)$/i)[1];
    var urlParam = "http://md-ladder.cloudapp.net/api/v1.0/players/" + id;
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
            var mdlStats = '<td><a target="_blank" href="http://md-ladder.cloudapp.net/player?playerId=' + id + '">MDL</a></td>';
            if (player.rank) {
                mdlStats += '<td>' + getRankText(player.best_rank) + ' (' + player.best_displayed_rating + ')</td><td>' + getRankText(player.rank) + ' (' + player.displayed_rating + ')</td>'
            } else if (player.best_displayed_rating) {
                mdlStats += '<span>: Not Ranked with a rating of ' + player.displayed_rating + '. Best rating ever: ' + player.best_displayed_rating + ', best rank ever: ' + getRankText(player.best_rank) + '</span>'
            } else if (player.displayed_rating) {
                mdlStats += '<span>: Not Ranked with a rating of ' + player.displayed_rating
            }
        } else {
            var mdlStats = '<td><a target="_blank" href="http://md-ladder.cloudapp.net/">MDL</a></td>';
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
    `);
    var mdlTab = '<li class="nav-item"><a href="#MDLTab" data-toggle="tab" style="cursor: pointer" class="nav-link">Multi-day ladder</a></li>';
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
    </div>`;
    $("#myTabContent").append(mdlData);
    getMDLPlayerTable(function (table) {
        $(".mdlPlayers .mdl-content").prepend(table);
        $(".mdlPlayerTable-loading").remove();
        $(".mdlPlayers .mdl-content").show();
    });
    getMDLGamesTable(10, function (table) {
        $(".mdlGames").prepend(table);
        $(".mdlGamesTable-loading").remove();
        $("#DashboardLadderTabs-6 .mdlGames table").show();
    });
    $('#DashboardLadderTabs').tabs('destroy').tabs({
        event: 'mouseover'
    });
}

function getMDLGamesTable(numOfGames, cb) {
    var content = $("<div>");
    content.prepend('<h4 class="text-medium card-title px-4 mb-0 py-3"><a href="http://md-ladder.cloudapp.net/">Multi-day ladder</a>: Recent Games</h4>');
    var table = $("<table>").attr("cellpadding", 2).attr("cellspacing", 0).css("width", "100%").addClass("table table-striped mb-0");
    table.append(`
        <thead>
            <tr>
                <td>Game</td>
                <td>Link</td>
                <td>Date</td>
            </tr>
        </thead>
    `);
    table.append("<tbody></table>");
    var urlParam = "http://md-ladder.cloudapp.net/api/v1.0/games/?topk=" + numOfGames;
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
            var ended = moment(game.finish_date + "Z");
            var rowData = "<td>" + getPlayerGameString(p1, p2, winner) + "</td>";
            if (game.is_game_deleted) {
                rowData += "<td>DELETED</td>"
            } else {
                rowData += "<td><a href='https://www.warlight.net/MultiPlayer?GameID=" + game.game_id + "'>" + game.game_id + "</a></td>"
            }
            rowData += "<td>" + ended.from() + "</td>";
            table.append("<tr>" + rowData + "</tr>")
        });
        content.append(table);
        if (cb) {
            cb(content)
        }
    })
}

function getMDLPlayerTable(cb) {
    var content = $("<div>");
    content.prepend('<h4 class="text-medium card-title px-4 mb-0 py-3"><a href="http://md-ladder.cloudapp.net/">Multi-day ladder</a>: Rankings</h4>');
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
    var urlParam = "http://md-ladder.cloudapp.net/api/v1.0/players/?topk=10";
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

function setupMDLForumTable() {
    if ($("title").text().toLowerCase().indexOf("multi-day ladder") != -1) {
        var mdlContainer = setupBottomForumContainer("mdl");
        getMDLPlayerTable(function (table) {
            mdlContainer.prepend(table)
        });
        getMDLGamesTable(10, function (table) {
            mdlContainer.append(table);
        })
    }
}

function getPlayerGameString(p1, p2, winnerId) {
    var c1 = getClanIcon(p1);
    var c2 = getClanIcon(p2);
    var p1s = c1 + "<a target='_blank' href='http://md-ladder.cloudapp.net/player?playerId=" + p1.player_id + "'> " + p1.player_name + "</a>";
    var p2s = c2 + "<a target='_blank' href='http://md-ladder.cloudapp.net/player?playerId=" + p2.player_id + "'> " + p2.player_name + "</a>";
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