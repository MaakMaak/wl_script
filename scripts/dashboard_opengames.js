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
        type: "custom"
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
    openGamesFilters["hideKeyword"] = $("#hideKeyword").val();
    openGamesFilters["hideRealTimeBootTime"] = $("#hideRealTimeBootTime").val();
    openGamesFilters["hideMultiDayBootTimeDays"] = $("#hideMultiDayBootTimeDays").val();
    openGamesFilters["hideMultiDayBootTimeHours"] = $("#hideMultiDayBootTimeHours").val();
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
    };
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
        `);
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
    log("Refresh by userscript settings close");
    refreshAllGames(true);
};
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
};

function getNumHiddenLabelText(num) {
    return num == 1 ? "1 Game is hidden" : (num + " Games are hidden");
}

window.showFilterOptions = function () {
    $("#openGamesFilter").modal("show")
};
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
    });
    return maxTeam + 1;
};
$$$.fn.containsKeyword = function (openGamesFilters) {
    var game = this[0];
    var keywords = openGamesFilters["hideKeyword"].split(",");
    var title = game._nameLowered || game.Name.toLowerCase();
    var filtered = false;
    $.each(keywords, function (key, keyword) {
        if (title.indexOf(keyword.trim().toLowerCase()) >= 0) {
            filtered = true;
        }
    });
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