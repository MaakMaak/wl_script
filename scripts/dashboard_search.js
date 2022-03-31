function setupDashboardSearch() {
    loadDataTableCSS();
    $(".navbar-nav .nav-item:first").before('<li class="nav-item"><a class="nav-link" data-toggle="modal" data-target="#userscriptSearch" style="cursor:pointer">Search</a></li>');
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
    `);
    $('#userscriptSearch').on('shown.bs.modal', function () {
        $('#playerSearchQuery').focus();
    });

    window.tabsInit = false;
    $("#tab_clan_header").on("click", function (event, ui) {
        if (!tabsInit) {
            initClanSearch();
            tabsInit = true;
        }
    });
    createSelector("#searchTabs", "background: none;border: none;");
    $("#searchPlayerLink").on("click", function () {
        showPopup(".playersearch-show");
        $("#playerSearchQuery").val("");
        $("#playerSearchQuery").focus()
    });
    $("#searchPlayerBtn").on("click", function () {
        searchPlayer()
    });
    $("#findPlayerExtra").on("click", function (event) {
        $(".playersearch-context").finish().toggle(100).css({
            top: event.pageY + "px",
            left: event.pageX + "px"
        });
    });
    $('#playerSearchQuery').keyup(function (e) {
        if (e.keyCode == 13) {
            searchPlayer()
        }
    });
    createSelector(".SubTabCell", "cursor: pointer");
    createSelector(".foundPlayer", "display: block; height: 25px; padding: 2px; clear:both");
    createSelector(".foundPlayer a", "line-height: 25px; float: left");
    createSelector(".foundPlayer img", "height: 15px; display: block; float: left; margin: 5px");
    createSelector(".notFound", "clear: both; display: block; color: gray;");
    createSelector("#foundPlayers span", "color: gray; padding: 0 5px; line-height: 25px");
    createSelector("#foundPlayers > span", "display: block; clear: both; margin: 0px; padding: 10px 0");
    createSelector(".playerSearchName", "float: left");
    createSelector("#foundClansTable", "float: left; table-layout: fixed;width: 100%");
    createSelector("#foundClansTable thead", "text-align: left");
    createSelector("#foundClansTable td a", "display: block; width: 100%;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;");
    createSelector("#foundClansTable img", "margin-right: 5px;")
}

function initClanSearch() {
    warlight_shared_viewmodels_WaitDialogVM.Start("Setting up clans...");
    warlight_shared_messages_Message.GetClansAsync(null, null, function (a, b, clans) {
        parseFoundClans(clans);
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
    }, 3000);
    $("#foundPlayers").empty();
    var query = $("#playerSearchQuery").val().toLowerCase();
    if (query.length < 3) {
        warlight_shared_viewmodels_AlertVM.DoPopup(null, "Please enter at least 3 characters to search for");
        return
    }
    warlight_shared_viewmodels_main_manageplayers_ManagePlayersVM.SearchPlayers(null, query, function (players) {
        players = players.Results;
        if (players.length >= 75) {
            $("#foundPlayers").append("<span>This query found more than 75 results. Only the first 75 results are shown below.</span>")
        }
        parseFoundGlobalPlayers(players);
        let $playerSearchQuery = $("#playerSearchQuery");
        $playerSearchQuery.select();
        $playerSearchQuery.focus();
    })
}


function parseFoundClans(clans) {
    clans.sort(function (c1, c2) {
        return (JSON.parse(c2.WarRating).r - JSON.parse(c1.WarRating).r)
    });
    var clanTableHTML = '<table class="table table-striped mb-0" id="foundClansTable"><thead><tr><th width="50">#</th><th width="250">Name</th><th width="194">Created By</th><th width="100">War Rating</th><th width="110">Total Points</th><th width="110">Created On</th></tr></thead>';
    for (var i = 0; i < clans.length; i++) {
        var clan = clans[i];
        var name = clan.Name;
        var id = clan.ID;
        var warRating = Math.round(JSON.parse(clan.WarRating).r * 100) / 100;
        var createdBy = clan.CreatedBy;
        var iconId = clan.IconIncre;
        var imgTag = iconId == 0 ? "" : `<img src="https://d32kaghj56y4ei.cloudfront.net/Data/Clans/${id}/Icon/${iconId}.png">`;
        var totalpoints = (clan.TotalPointsInThousands * 1000);
        var createdDate = moment(clan.CreatedDate.date).format('MM/DD/YYYY');
        var nameHTML = `<a target="_blank" href="https://www.warzone.com/Clans/?ID=${id}">${imgTag}${name}</a>`;
        clanTableHTML += `<tr><td>${i + 1}</td><td data-order="${name.replace(/\W/g, '') || "zzzz"+name}">${nameHTML}</td><td class="data-player" data-player-clan-id="${id}" data-player-id="${createdBy}">Checking..</td><td data-order="${warRating}">${warRating.toLocaleString(navigator.language)}</td><td data-order="${totalpoints}">${totalpoints.toLocaleString(navigator.language)}</td><td data-order="${id}">${createdDate}</td></tr>`
    }
    clanTableHTML += "</table>";
    $("#foundClans").append(clanTableHTML);
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
            sortable: true
        }, {
            targets: [2],
            orderData: [2, 1, 0],
            sortable: false,
            searchable: false
        }, {
            targets: [3],
            orderData: [3, 1, 0]
        }, {
            targets: [4],
            orderData: [4, 1, 0]
        }, {
            targets: [5],
            orderData: [5, 1]
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
                "orderSequence": ["asc", "desc"]
            },
            {
                "orderSequence": ["desc", "asc"]
            }
        ],
        initComplete: function () {
            window.setTimeout(loadClanCreators, 200);
            $("#foundClansTable").removeClass("dataTable")
        },
        "language": {
            "zeroRecords": "No matching clans found",
            "info": "Showing _START_ to _END_ of _TOTAL_ clans",
            "infoEmpty": "Showing 0 to 0 of 0 clans",
            "infoFiltered": "(filtered from _MAX_ total clans)"
        }
    });
    dataTable.on('draw.dt', function () {
        loadClanCreators()
    })
}

function loadClanCreators() {
    $.each($(".data-player"), function (k, cell) {
        if ($(cell).hasClass("data-player") && $(cell).is(":visible")) {
            var id = $(cell).attr("data-player-id");
            var clanId = $(cell).attr("data-player-clan-id");
            $.ajax({
                type: 'GET',
                url: `https://maak.ch/wl/wl_profile.php?p=${id}&c=${clanId}`,
                dataType: 'jsonp',
                crossDomain: true
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
        var nameLink = '<a href="/Profile?p=' + id + '">' + player.Name + '</a>';
        var clan = player.ClanOpt != null ? '<a href="https://www.warzone.com/Clans/?ID=' + player.ClanOpt.ClanID + '"><img onError="this.onError=null;$(this).remove()" class="playerSearchClan" src="https://d32kaghj56y4ei.cloudfront.net/Data/Clans/' + player.ClanOpt.ClanID + '/Icon/' + player.ClanOpt.IconIncre + '.png"></a>' : "";
        var member = player.IsMember ? '<img class="playerSearchMember" src="https://d2wcw7vp66n8b3.cloudfront.net/Images/MemberIcon.png">' : "";
        var name = '<div class="playerSearchName">' + nameLink + "<span>(" + player.Level + ")</span></div>";
        $("#foundPlayers").append('<div class="foundPlayer">' + clan + name + member + '</div>');
    }
}