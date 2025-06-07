function hideExtraBlanks() {
    var content = $(".container .my-2:first-of-type div.p-3");
    var replacement = '<br><br>';
    content.html(content.html().replace(/(<br\s*\/?>){3,}/gi, replacement))
}

function foldProfileStats() {
    addCSS(`
        h3.expander  {
            cursor: pointer;
    `);
    $.each($("big").parent().contents(), function (key, val) {
        if (val.nodeType == 3) {
            $(val).replaceWith(`<span>${val.data}</span>`)
        }
    });
    $.each($(".container .my-2:first-of-type div.p-3 h3"), function (key, val) {
        $(val).addClass("expander");
        $(val).nextUntil("h3").wrapAll("<div class='exp'></div>")
    });
    $('h3.expander').click(function (e) {
        $(this).next().slideToggle();
    });
}

function showGlobalWinRate() {
    var regex = /\((\d*)[^\d]*(\d*).*\)/g;
    let $h3 = $("h3:contains('Ranked Games')");
    var text = $h3.next().find("span:contains('ranked games')").text();
    var matches = regex.exec(text);
    if (matches !== null) {
        $h3.next().find("span:contains('ranked games')").append(", " + Math.round(matches[1] / matches[2] * 100) + "%")
    }
}

function loadCommunityLevelRecords() {
    var playerId = location.href.match(/p=(\d+)/)[1];
    $.ajax({
        type: 'GET',
        url: `https://maak.ch/wl/v2/api.php?player=${playerId}`,
        dataType: 'jsonp',
        crossDomain: true
    }).done(function (response) {
        if (response.data) {
            var records = response.data;
            $("h3:contains('Single-player stats')").after(`<font class="text-muted">Community Levels:</font> <span><a href="http://communitylevels.online" target="_blank"> ${records} record${records != 1 ? "s" : ""}</a></span>`);
        }
    });
}


function loadPrivateNotes() {
    log("Loading private notes");
    $("#FeedbackMsg").after('<div class="profileBox" id="privateNotes"><h3>Private Notes</h3><p style="width: 285px;overflow:hidden" class="content">Loading Privates Notes..</p></div>');
    var url = "https://www.warzone.com" + $(".container a[href*='Discussion/Notes']").attr("href")
    var page = $('<div />').load(url, function () {
        var notes = page.find('#PostForDisplay_0').html().trim();
        if (notes) {
            $('#privateNotes .content').html(notes);
        } else {
            $('#privateNotes .content').html('You don\'t have any Private Notes.');
        }

    });
}

function displayTrophies() {
    var trophies = {
        5286630035: ["Get on the immediate roadmap"]
    };

    Object.keys(trophies).forEach(playerId => {
        if (window.location.href.indexOf(playerId) != -1) {
            trophies[playerId].forEach(text => {
                $("h3:contains('Achievements ')").next().find("tbody").prepend('<tr title="Trophy awarded by Muli"> <td> <img style="vertical-align: middle" src="https://warzonecdn.com/Images/TrophyImage.png" width="21" height="20"> </td> <td>Trophy: ' + text + '</td> </tr>')
            })
        }
    });
}