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