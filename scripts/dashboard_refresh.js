/**
 * Reloads all Games
 */
function refreshAllGames(force) {
    log("Reloading Games");
    if ($(".popup").is(":visible") && !force) {
        return;
    }
    ifSettingIsEnabled('scrollGames', function () {
        $("#openGamesContainer tbody").scrollTop(0);
        $("#myGamesContainer tbody").scrollTop(0);
    });
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
];

function refreshMyGames(data) {
    log("refreshing games");
    $("#myGamesContainer").find("tbody").fadeTo('fast', 0.15);
    var filterKey = 4;
    var filterText = $("#MyGamesFilterBtn").text();
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
    removeMyGames();
    var dueGames = myGames.filter(function (a) {
        var game = (new warlight_shared_viewmodels_main_MyGamesGameVM).Init(warlight_shared_viewmodels_ConfigurationVM.Settings, 0, a, warlight_shared_viewmodels_SignIn.get_CurrentPlayer());
        return (game != null) && (game.UsOpt != null) && !game.UsOpt.HasCommittedOrders && (game.Game.State == 3 || game.Game.State == 5) && game.UsOpt.State == 2
    });
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
            var timeLeft = Math.min(game.AutoBoot._totalMilliseconds, game.DirectBoot._totalMilliseconds) - game.WaitingFor._totalMilliseconds;
            var bootTime = new Date().getTime() + parseInt(timeLeft);
            $("[gameid='" + id + "']").find("td div + span").append(`<span data-boottime="${bootTime}" data-inline> (${getTimeLeft(timeLeft)} left)</span>`)
        });
        //Setup time left tooltip
        $.each(myGames, function (key, game) {
            var id = game.GameID;
            var timeLeft = Math.min(game.AutoBoot._totalMilliseconds, game.DirectBoot._totalMilliseconds) - game.WaitingFor._totalMilliseconds;
            var bootTime = new Date().getTime() + parseInt(timeLeft);
            var label = $("[gameid='" + id + "']").find(".BootTimeLabel");
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
        });
        // Setup mdlRating
        displayMdlRating(myGames);
        //Setup NextGameId
        var nextGameIds = [];
        $.each(myGames, function (key, game) {
            var id = game.GameID;
            if (gameCanBeNextGame(game)) {
                nextGameIds.push(id)
            }
        });
        $.each(myGames, function (key, game) {
            var id = game.GameID;
            if (nextGameIds.length > 0 && nextGameIds[0]) {
                var ids = [];
                var url = "https://www.warzone.com/MultiPlayer?GameID=" + id + (nextGameIds.length > 1 ? ("&NextGameIDs=" + nextGameIds.slice(1, nextGameIds.length).join()) : "");
                $("[gameid='" + id + "'] td > a").attr("href", url);
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

function getTimeLeft(time, detailed) {
    var hours1 = 60 * 60 * 1000;
    var hours5 = 5 * 60 * 60 * 1000;
    var days5 = 5 * 25 * 60 * 60 * 1000;
    var secs = time / 1000;
    var mins = secs / 60;
    var hours = mins / 60;
    var days = hours / 24;
    if (time < 0) {
        return "Hurry up! No time"
    } else if (time < hours1) {
        var m = Math.round(Math.floor(mins) % 60);
        var s = Math.round(Math.floor(secs) % 60);
        return m > 0 ? (m + (m == 1 ? " minute " : " minutes ")) : "" + s + (s == 1 ? " second" : " seconds")
    } else if (time < hours5) {
        var m = Math.round(Math.floor(mins) % 60);
        var h = Math.floor(hours);
        return h + (h == 1 ? " hour " : " hours ") + m + (m == 1 ? " minute" : " minutes")
    } else if (time < days5 && !detailed) {
        var d = Math.floor(days);
        var h = Math.round(Math.floor(hours) % 24);
        return (d > 0 ? d + (d == 1 ? " day " : " days ") : "") + h + (h == 1 ? " hour" : " hours")
    } else if (time >= days5 && !detailed) {
        return Math.round(days) + " days "
    } else if (detailed) {
        var d = Math.floor(days);
        var h = Math.round(Math.floor(hours) % 24);
        var m = Math.round(Math.floor(mins) % 60);
        return (d > 0 ? d + (d == 1 ? " day " : " days ") : "") + h + (h == 1 ? " hour " : " hours ") + m + (m == 1 ? " minute" : " minutes")
    } else {
        return "undefined left " + time
    }
}

function gameCanBeNextGame(g) {
    var game = (new warlight_shared_viewmodels_main_MyGamesGameVM).Init(warlight_shared_viewmodels_ConfigurationVM.Settings, 0, g, warlight_shared_viewmodels_SignIn.get_CurrentPlayer());
    if (game != null && game.Game != null && game.UsOpt != null) {
        var playing = (game.Game.State == 3 || game.Game.State == 5) && game.UsOpt.State == 2;
        var prio0 = game.Game.PrivateMessagesWaiting || game.Game.PublicChatWaiting || game.Game.TeamChatWaiting;
        var prio1 = game.Game.State == 2 && game.UsOpt.State == 1; //Waiting to join
        var prio3 = playing && !game.UsOpt.HasCommittedOrders; //Your turn 3 = turn, 5 = picking
        var prio4 = game.Game.State == 2 && game.Game.WaitingForYouToStart; //Waiting for you to start
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
        WL_MPDash.OpenGamesCtrl.AllOpenGamesData = data;
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
            $("#ClanForumTable").replaceWith(page.find("#ClanForumTable").outerHTML());
            setupRightColumn();
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
            var gamesToShow = warlight_shared_viewmodels_main_MultiPlayerDashboardVM.GamesToShow(wljs_AllOpenGames, player.OpenGamePreference, 0 == this.ShowingAllOpenGames);
            var gamesToShow = warlight_shared_viewmodels_main_MultiPlayerDashboardVM.GamesToShow(wljs_AllOpenGames, player.OpenGamePreference, 0 == this.ShowingAllOpenGames);
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
    $("a:contains('Refresh (F5)')").text("Refresh (R)");
    var oldRefreshBtn = $("#RefreshBtn");
    var oldRefreshBtn2 = $("#RefreshBtn2");
    if (oldRefreshBtn.length) {
        var newRefreshBtn = $("#refreshAll");
        oldRefreshBtn.replaceWith(oldRefreshBtn.clone().removeAttr("id").attr("id", "refreshAll").attr("value", "Refresh (R)"));
        newRefreshBtn.appendTo("body");
        $("#refreshAll").on("click", function () {
            if (new Date() - lastRefresh > 3000) {
                lastRefresh = new Date();
                log("Refresh by click");
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
                log("Refresh by click");
                refreshAllGames();
            }
        });
    }
    ifSettingIsEnabled('autoRefreshOnFocus', function () {
        $(window).on('focus', function () {
            if (new Date() - lastRefresh > 30000) {
                lastRefresh = new Date();
                log("Refresh by focus");
                refreshAllGames();
            }
        });
    });
    $("body").keyup(function (event) {
        // "R" is pressed
        if (event.which == 82) {
            if (new Date() - lastRefresh > 3000) {
                lastRefresh = new Date();
                log("Refresh by key r");
                refreshAllGames();
            }
        }
    });
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
            'height': gameTableHeight
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
        var div = $("<div>");;
        div.load("/MultiPlayer/PastGames #MyGamesTable", function (data) {
            div.find("#MyGamesTable").attr("id", "PastGamesTable");
            div.find("#PastGamesTable thead tr td").html('<h2 style="margin: 0">Past Games</h2>');;
            div.find("#PastGamesTable thead tr td").attr("colspan", "2").css("padding-bottom", "17px");
            $("#pastGamesContainer").html("");;
            $("#pastGamesContainer").append(div);;
            makePlayerBoxesClickable("#pastGamesContainer");
            refreshSingleColumnSize()
        });
    }
}