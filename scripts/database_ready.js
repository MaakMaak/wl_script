function databaseReady() {
    log("Running main");
    if (pageIsForumOverview()) {
        ifSettingIsEnabled("hideOffTopic", function () {
            hideOffTopicThreads()
        });
        ifSettingIsEnabled("hideWarzoneIdle", function () {
            hideWarzoneIdleThreads()
        });
        formatHiddenThreads();
    }
    if (pageIsCommunityLevels()) {
        setupCommunityLevels()
    }

    if (pageIsForumOverview() || pageIsSubForum()) {
        setupSpammersBeGone();
        addCSS(`
            #MainSiteContent > table table tr td:nth-of-type(4), #MainSiteContent > table table tr td:nth-of-type(5) {
                max-width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
    
        `)
    }
    if (pageIsProfile() && $("#BlockListLink").length > 0) {
        ifSettingIsEnabled('showPrivateNotesOnProfile', function () {
            loadPrivateNotes();
        })
    }
    if (pageIsCommunity()) {
        hideIgnoredForumThreadsFromCommnuityList();
    }
    if (pageIsBlacklistPage()) {
        $("#MainSiteContent ul").before(`<span id="numBlacklisted">You have <b>${$("#MainSiteContent ul li:visible").length}</b> players on your blacklist.</span>`);
        window.setInterval(function () {
            $("#numBlacklisted").replaceWith(`<span id="numBlacklisted">You have <b>${$("#MainSiteContent ul li:visible").length}</b> players on your blacklist.</span>`)
        }, 500)
    }
    if (pageIsPointsPage()) {
        displayTotalPointsEarned();
    }
    if (pageIsDashboard()) {
        setupVacationAlert();

        hideBlacklistedThreads();
        setupBasicDashboardStyles();
        Database.readIndex(Database.Table.Settings, Database.Row.Settings.Name, "customFilter", function (f) {
            var filter = (f && f.value) ? f.value : 4;
            refreshMyGames();
        });
        ifSettingIsEnabled('hideCoinsGlobally', function () {
            hideCoinsGlobally()
        });
        ifSettingIsEnabled('useDefaultBootLabel', function () {
            createSelector(".BootTimeLabel", "z-index:50;");
        }, function () {
            createSelector(".BootTimeLabel", "color:white !important;font-weight:normal!important;font-style:italic;font-size:13px!important;z-index:50;");
        });
        ifSettingIsEnabled("highlightTournaments", function () {
            createSelector("#MyTournamentsTable tbody", "background:#4C4C33;");
        });
        ifSettingIsEnabled("hideMyGamesIcons", function () {
            createSelector("#MyGamesTable td div > img, #MyGamesTable td div a > img", "display:none;");
        });
        ifSettingIsEnabled("scrollGames", function () {
            setupFixedWindowWithScrollableGames();
        }, function () {
            createSelector("body", "overflow: auto");
            createSelector("#MainSiteContent > table", "width: 100%;max-width: 1400px;");
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
        });
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
        window.setTimeout(setupRefreshFunction, 0);
    } else {
        ifSettingIsEnabled('hideCoinsGlobally', function () {
            hideCoinsGlobally();
        })
    }
}