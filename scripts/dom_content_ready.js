function DOM_ContentReady() {
    $.cookie("UjsBig", "true", {
        expires: 7,
        path: "/"
    });
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
        Database.update(Database.Table.Settings, {
            name: "customFilter",
            value: customFilter
        }, undefined, function () {
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
