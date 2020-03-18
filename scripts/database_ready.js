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