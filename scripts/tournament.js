function setupTournamentDecline() {
    $.each($(".TournamentRow"), function (key, val) {
        //Waiting for accept / decline
        if ($(val).find("[style='color: red']:not(.BootTimeLabel)").length > 0) {
            $(val).find("td:last-of-type").append('<button style="float: right;" class="DeclineBtn btn btn-primary" role="button">Decline</button>');
            $(val).find("td:last-of-type").attr("colspan", "2")
        }
    });
    $(".DeclineBtn").on("click", function (e) {
        var id = $(e.target).closest(".TournamentRow").attr("data-tournamentid");
        warlight_shared_messages_Message.DeclineTournamentAsync(null, warlight_unity_viewmodels_SignIn.Auth, id, null, function (b, c) {
            wljs_WaitDialogJS.Stop();
            if (null != c && 129 != c.ErrorType) {
                if (135 == c.ErrorType) {
                    warlight_shared_viewmodels_AlertVM.DoPopup(null, "The tournament has been deleted");
                } else {
                    throw c;
                }
            }
            var btn = $(e.target).closest(".DeclineBtn");
            $(e.target).text("Declined");
            btn.attr("disabled", true).addClass("ui-state-disabled");
            btn.closest(".TournamentRow").find("[style='color: red']:not(.BootTimeLabel)").remove();
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
    createSelector("body", "overflow: hidden");
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
    var tournament = WL_Tournament.Tourn;
    var players = WL_Tournament.Players._players;
    var name = WL_Tournament.Tourn.Settings.Name;
    var id = tournament.ID;
    try {
        Database.readIndex(Database.Table.TournamentData, Database.Row.TournamentData.Id, id, function (tourn) {
            if (tourn && tourn.value) {
                var details = getTournamentPlayerInfo(tournament, players, warlight_unity_viewmodels_SignIn.get_CurrentPlayer().ID);
                Database.update(Database.Table.TournamentData, {
                    tournamentId: Number(id),
                    value: details,
                    name: name
                }, undefined, function () {
                })
            }
        })
    } catch (e) {
        log("Bad tournament");
        log(e)
    }
}

function setupTournamentDataCheck() {
    log("setting up tournament data check");
    $("#MyTournamentsTable h2").after('<button class="btn btn-primary" id="dataTournamentButton" onclick="updateAllTournamentData()">Update data</button>');
    $("body").append("<div style='display:none'><div id='ShowAllBtn'></div><div id='PlayersContainer'></div></div>");
    $("#MyTournamentsTable thead td").attr("colspan", 3);
    $("#MyTournamentsTable tr:last td").attr("colspan", 3);
    addCSS(`
        #dataTournamentButton {
            float: right;
            margin: 0 10px;
        }
    `);
    addCSS(`
        .TournamentRow {
            transition: all 1s ease-in;
        }
    `);
}

function updateAllTournamentData() {
    $.each($("#MyTournamentsTable [data-tournamentid]"), function (key, row) {
        if (!$(row).find("[style='color: red']:not(.BootTimeLabel)").length > 0) {
            var id = $(row).attr("data-tournamentid");
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
    });
    Database.readAll(Database.Table.TournamentData, function (tournamentDatas) {
        $.each(tournamentDatas, function (key, tournamentData) {
            var $table = $(`#MyTournamentsTable [data-tournamentid='${tournamentData.tournamentId}']`);
            if ($table.length) {
                $table.find("td:last-of-type").attr("colspan", "1");
                $table.append(`<td class="tournamentData">${tournamentData.value ? tournamentData.value : "-"}</td>`)
            } else if (tournamentData.value && tournamentData.name) {
                createTournamentRow($("#MyTournamentsTable"), tournamentData);
            }
        });
    })
}

function createTournamentRow(parent, tournamentData) {
    var id = tournamentData.tournamentId;
    warlight_shared_messages_Message.GetTournamentDetailsAsync(null, warlight_unity_viewmodels_SignIn.Auth, id, new system_Nullable_$Float(999999999), null, function (a, b, c) {
        var tournament = c["Tournament"];
        var player = tournament.Players.store.h[warlight_unity_viewmodels_SignIn.get_CurrentPlayer().ID];
        if (player.State === 2) { // declined
            Database.update(Database.Table.TournamentData, {
                tournamentId: Number(id),
                value: false,
                name: false
            }, undefined, function () {
            });
            return;
        }

        parent.prepend(`<tr class="TournamentRow" data-tournament="${id}"><td></td><td><a style="font-size: 17px; color: white" href="https://www.warzone.com/MultiPlayer/Tournament?ID=${tournamentData.tournamentId}"> ${tournamentData.name} (${getTournamentStateText(tournament.State, tournament.Type)})</a></td><td><a><button class="removeTournament btn btn-primary" role="button">Remove</button></a></td></tr>`);
        $(`.TournamentRow[data-tournament=${id}] .removeTournament`).on("click", function () {
            var row = $(this).closest("tr");
            var id = row.attr("data-tournament");
            Database.update(Database.Table.TournamentData, {
                tournamentId: Number(id),
                value: false,
                name: false
            }, undefined, function () {
                row.remove();
            })
        });
        updateTournamentCounter();
    });
}

function getTournamentStateText(state, type) {
    // States 0=Not started, 1=In Progress, 2=Finished
    var text = "";
    switch (state) {
        case 1:
            if(type === 2) { // Robin Round
                text = "no games remaining";
            } else {
                text = "eliminated";
            }

            break;
        case 2:
            text = "finished";
            break;
        default:
            break;
    }
    return text;
}

function updateTournamentCounter() {
    var total = $("#MyTournamentsTable .TournamentRow").length;
    var visible = $("#MyTournamentsTable .TournamentRow:visible").length;
    if (total > visible) {
        $("#MyTournamentsTable h2").text("My Tournaments (" + visible + "/" + total + ")")
    } else {
        $("#MyTournamentsTable h2").text("My Tournaments (" + total + ")")
    }
}

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
    `);
    $("#dataTournamentButton").replaceWith(`
        <div class="progress" >
          <div class="progress-bar"></div>
        </div>
    `);
    var rows = $("#MyTournamentsTable [data-tournamentid]");
    var numOfMyTournaments = rows.length;
    $.each(rows, function (key, row) {
        var id = $(row).attr("data-tournamentid");
        loadTournamentDetails(id, function () {
            progressTournamentData(numOfMyTournaments);
            updateTournamentCounter();
        })
    })
};

function showInfo(text, x, y) {
    window.setTimeout(function () {
        var menu = $(".custom-menu");
        if (!menu.is(':visible')) {
            $(".custom-menu .content").html(text);
            menu.finish().toggle(100).// In the right position (the mouse)
            css({
                top: x + "px",
                left: y + "px"
            });
        }
    }, 10);
}

var counter = 0;

function progressTournamentData(max) {
    var $progressBar = $(".progress-bar");
    if (max >= ++counter) {
        $progressBar.text(++counter + "/" + max)
    } else {
        $progressBar.text("Done")
    }
    $progressBar.css("width", counter / max * 100 + "%")
}

function loadTournamentDetails(id, cb) {
    $(".tournamentData").remove();
    warlight_shared_messages_Message.GetTournamentDetailsAsync(null, warlight_unity_viewmodels_SignIn.Auth, id, new system_Nullable_$Float(999999999), null, function (a, b, c) {
        var tournament = c["Tournament"];
        var name = tournament.Settings.Name;
        var players = new wljs_multiplayer_tournaments_display_Players(tournament)["_players"];
        var details = getTournamentPlayerInfo(tournament, players, warlight_unity_viewmodels_SignIn.get_CurrentPlayer().ID);
        $(`[data-tournamentid='${id}']`).append(`<td class="tournamentData">${details}</td>`);
        Database.update(Database.Table.TournamentData, {
            tournamentId: Number(id),
            value: details,
            name: name
        }, undefined, function () {
        });
        if (cb) {
            cb();
        }
    })
}

window.getTournamentPlayerInfo = function (tournament, players, id) {
    var playerInfo = players["store"]["h"][id];
    var playing = playerInfo.NumInProgress;
    var won = playerInfo.NumWins;
    var lost = playerInfo.NumLosses;
    var myGames = playing + won + lost;
    // 0 -> Single Elimination, 1 -> Double Elimination, 2 -> Robin Round
    var tournamentType = tournament.Type;
    var myMaxGames;
    var tournamentTotalGames;
    var tournamentGamesStarted = tournament.Games.length;
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
        var numOfTeams = teams.unique().length;
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
    log(details);
    return details;
};

function getTournamentProgress(tournamentGamesStarted, tournamentTotalGames) {
    var progress = Math.round(tournamentGamesStarted / tournamentTotalGames * 100, 0);
    if (progress === 100) {
        return "Almost done"
    } else {
        return progress + "%"
    }
}

function getGamesLeftString(myGames, myMaxGames, playing, joker) {
    if (typeof myMaxGames == "number") {
        return (myMaxGames - myGames === 0 ? "None" : (myMaxGames - myGames))
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
};

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
            orderData: [3]
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
            }
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
    $("#activePlayer").html(htmlEscape(player.name == myself.name ? "Me" : player.name));
    $("#playerSelectInput").val("");
    panzoomMatrix = undefined;
    findMeIndex = 0;
    $(".gold").removeClass("gold");
    $("#PlayingPlayers [data-playerid='" + window.currentPlayer.id + "']").addClass("gold");
    $("#PlayingPlayers [data-playerid='" + window.currentPlayer.id + "'] a").addClass("gold");
    if (window.WL_Tournament.Tourn.Type == 2) { //Robin Round
        $(".TeamTip_" + (window.currentPlayer.team == "" ? window.currentPlayer.id : window.currentPlayer.team.replace("Team ", "").charCodeAt(0) - 65)).addClass("gold")
    } else { //Elimination Tournament
        getPlayerBoxes().find("a").addClass("gold")
    }
    if (noSearch != true) {
        window.findInTournament();
    }
};

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
    window.players = [];
    $("[href='#SettingsTab']").parent().after('<li id="findMe" class="ui-state-default ui-corner-top"><div style="cursor: pointer" class="ui-tabs-anchor" onclick="window.findNextInTournament()">Find <label id="activePlayer"></label></div><a id="showPlayerSelect">▼</a></li>');
    createSelector('#findMe:hover', 'border: 1px solid #59b4d4;background: #0078a3 url("https://d2wcw7vp66n8b3.cloudfront.net/jui4/images/ui-bg_glass_40_0078a3_1x400.png") 50% 50% repeat-x;font-weight: bold;color: #ffffff;border-bottom-width: 0');
    createSelector('#findMe', 'border: 1px solid #666666;border-bottom-width: 0');
    var css = '-webkit-keyframes pulsate{ 0% { background-color: rgba(0,0,0,0); } 50% { background-color: olive; } 100% { background-color: rgba(0,0,0,0); }}@keyframes pulsate { 0% { background-color: rgba(0,0,0,0); } 50% { background-color: olive; } 100% { background-color: rgba(0,0,0,0); }}.pulsate { -webkit-animation: pulsate 1s ease-in 1; -moz-animation: pulsate 1s ease-in 1; -ms-animation: pulsate 1s ease-in 1; -o-animation: pulsate 1s ease-in 1; animation: pulsate 1s ease-in 1;}-webkit-keyframes pulsate-border{ 0% { border: 3px solid #c4c2c4; } 25% { border: 3px solid red; } 50% { border: 3px solid red; } 100% { border: 3px solid #c4c2c4; }}@keyframes pulsate-border { 0% { border: 3px solid #c4c2c4; } 25% { border: 3px solid red; }50% { border: 3px solid red; } 100% { border: 3px solid #c4c2c4; }}.pulsate-border { -webkit-animation: pulsate-border 2s ease-in 1; -moz-animation: pulsate-border 2s ease-in 1; -ms-animation: pulsate-border 2s ease-in 1; -o-animation: pulsate-border 2s ease-in 1; animation: pulsate-border 2s ease-in 1;}';
    addCSS(css);
    $("#findMe").append('<div id="selectContainer"><div id="playerSelectInputContainer"><input placeholder="Search a Player" type="text" id="playerSelectInput"></input></div><div id="playerContainer"></div></div>');
    addCSS(`
        .TeamBox a {
            color: azure;
        }
    `);
    myself = {
        id: warlight_unity_viewmodels_SignIn.get_CurrentPlayer().ID,
        name: warlight_unity_viewmodels_SignIn.get_CurrentPlayer().Name,
        fullID: String(warlight_unity_viewmodels_SignIn.get_CurrentPlayer().ProfileToken).substring(0, 2) + warlight_unity_viewmodels_SignIn.get_CurrentPlayer().ID + String(warlight_unity_viewmodels_SignIn.get_CurrentPlayer().ProfileToken).substring(2, 4),
        team: $("[data-playerid='" + warlight_unity_viewmodels_SignIn.get_CurrentPlayer().ID + "'] td:nth-of-type(2)").text()
    };
    window.setCurrentplayer(myself, true);
    $.each($("#PlayingPlayers tr"), function (key, playerRow) {
        var id = $(playerRow).attr("data-playerid");
        var fullID = new URL($($(playerRow)).find("a").get($($(playerRow)).find("a").length - 1).href).searchParams.get("p");
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
        $("#playerContainer").append("<div class='playerElement' onclick='setCurrentplayer(myself)'>" + myself.name + " (Me)</div>");
        $.each(window.players, function (key, player) {
            if (player.name.toLowerCase().indexOf(search) > -1 && myself.name != player.name) {
                var img = player.img ? "<img src='" + player.img + "'>" : "";
                $("#playerContainer").append("<div onclick='setCurrentplayer(players[" + key + "])' class='playerElement'>" + img + "<span>" + htmlEscape(player.name) + "</span>" + "</div>")
            }
        });
        $("#activePlayer").html(window.currentPlayer.name == myself.name ? "Me" : window.currentPlayer.name);
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
    createSelector(".gold", "color: gold!important");
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
            var box = $("#CenterTabs").parent();
            var offset = player.offset().top - box.offset().top - box.height() / 2;
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
                });
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
                });
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
            $(".TeamTip_" + (window.WL_Tournament.Tourn.TeamSize == 1 ? window.currentPlayer.id : window.currentPlayer.team.replace("Team ", "").charCodeAt(0) - 65)).addClass("pulsate");
            window.setTimeout(function () {
                $(".pulsate").removeClass("pulsate")
            }, 2000)
        } else {
            showFindMeError()
        }
    }
};

function showFindMeError() {
    if ($("#PlayingPlayers [data-playerid='" + window.currentPlayer.id + "']").length == 0) {
        showInfo("You didn't join this tournament.", $("#findMe").offset().top + 25, $("#findMe").offset().left + 25);
    } else {
        showInfo("This tournament didn't start yet.", $("#findMe").offset().top + 25, $("#findMe").offset().left + 25);
    }
}

function getPlayerBoxes() {
    var boxes = $(".GameBox [href^='/Profile?p=" + window.currentPlayer.fullID + "']").closest(".TeamBox");
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
    var creatorLink = $("#HostLabel a:last").attr("href");
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
    `);
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
    `);
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
            console.log(("#DataTables_Table_0").length);
            a.attr("href", url);
            $("#ShowAllBtn").prev().before(a);
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