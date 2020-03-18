function parseForumSPLevels() {
    console.log("parsing sp levels")
    var path = 'SinglePlayer';
    var regex = new RegExp(path, 'i');
    $('.region a').each(function () {
        var href = $(this).attr('href')
        if (href && href.match(regex)) {
            parseSPLevel(this, href);
        }
    });
    addCSS(`
        table.SPTable {
            width:100%;
            background: rgba(255,255,255,0.05)
        }
        .SPTable tr {
            display: flex;
            align-items: stretch;
        }
        .SPTable td:last-child {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-right: 5px;
        }
    `)
}

function parseSPLevel(elem, href) {
    var levelId = getLeveId(href);
    if (levelId) {
        $.ajax({
            type: 'GET',
            url: `https://w115l144.hoststar.ch/wl/communityLevels.php?id=` + levelId,
            dataType: 'jsonp',
            crossDomain: true,
        }).done(function (response) {
            if (response.data) {
                console.log(response.data)
                var level = response.data[0]
                var row = renderLevelRow(level, 0, true);
                var table = $("<table class='SPTable'></table>")
                table.append(row)
                $(elem).replaceWith(table);
                table.find("tr td").css("text-align", "left");
            }
        });

    }
}

function getLeveId(href) {
    var match = href.match(/level\?id=(.*)/i) || href.match(/level=(.*)/i)
    if (match) {
        return match[1]
    }
}