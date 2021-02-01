function setupAWPWorldTour() {
    if ($("title").text().toLowerCase().indexOf("awp world tour") != -1) {
        setupAWPRanking();
        setupAWPEvents();

        setupBottomForumContainer("awp");
        addCSS(`
            .AWPRanking {
                margin-bottom: 20px;
                width: 100%;
            }
            .awpUpdated {
                color: gray;
                float: right;
                font-size: 11px;
        `)

    }
}

function setupAWPRanking() {
    var minRow = 12;
    var maxRow = 30;
    var minCol = 1;
    var maxCol = 25;
    var url = `https://spreadsheets.google.com/feeds/cells/1YuV5WqthgmYsZqv4rFVSE1xhM0BKVrcbkivRZ8ht6-E/1/public/values?min-row=${minRow}&max-row=${maxRow}&min-col=${minCol}&max-col=${maxCol}&alt=json-in-script&callback=parseAWPRankingData`;
    $.ajax({
        url: url,
        dataType: "script"
    });
}

function setupAWPEvents() {
    var minRow = 10;
    var minCol = 1;
    var maxCol = 6;
    var url = `https://spreadsheets.google.com/feeds/cells/1YuV5WqthgmYsZqv4rFVSE1xhM0BKVrcbkivRZ8ht6-E/2/public/values?min-row=${minRow}&min-col=${minCol}&max-col=${maxCol}&alt=json-in-script&callback=parseAWPEventData`;
    console.log(url);
    $.ajax({
        url: url,
        dataType: "script"
    });
}

window.parseAWPEventData = function (data) {
    var entries = data.feed.entry;
    var lastUpdated = moment(data.feed.updated.$t);
    var content = $("<div>");
    content.prepend('<h4 class="text-medium card-title px-4 mb-0 py-3"><a href="https://www.warzone.com/Forum/156042-awp-world-tour">AWP World Tour</a>: Events</h4>');

    var table = $('<table class="AWPRanking table table-striped mb-0"><thead><tr><td>Week</td><td>Name</td><td>Champion</td></tr></thead><tbody></tbody></table>');
    var tbody = $("<tbody></tbody>");
    var tr = $("<tr></tr>");
    var events = [];
    var event = {finished: true};
    var currentRow = entries[0].gs$cell.row;
    try {
        $.each(entries, function (key, entry) {
            var col = entry.gs$cell.col;
            var row = entry.gs$cell.row;

            if ((row - currentRow) >= 3) {
                currentRow = row;
                events.push(event);
                if (event.url.match(/forum/i)) {
                    return;
                }
                event = {finished: true}
            }

            if (col == 1 && entry.content.$t) {
                event.url = entry.content.$t.match(/docs.google.com/i) ? undefined : entry.content.$t
            } else if (col == 3) {
                event.date = entry.content.$t
            } else if (col == 4) {
                if (event.name == undefined) {
                    event.name = entry.content.$t
                } else if (event.series == undefined) {
                    event.series = entry.content.$t
                }

            } else if (col == 5) {
                event.champion = entry.content.$t
            } else if (col == 6) {
                event.finished = false
            }
        })
    } catch (e) {
        log("error parsing awp event data");
        log(e)
    }
    var eventRows = events.filter(function (e) {
        return e.url && Math.abs(moment().diff(moment(e.date), 'days')) < 150
    }).map(function (e) {
        return `<tr>
                    <td>${moment(e.date).format('DD/MMM')}</td>
                    <td><a href="${e.url}">${e.name}</a><br>${e.series}</td>
                    <td>${e.finished ? e.champion : (e.url.match(/tournament/i) ? "in progress" : "not started")}</td>
                </tr>`
    }).join("");

    tbody.append(eventRows);
    tbody.append(`<tr class="lastRow"><td colspan="3"><span><a target="_blank" href="https://docs.google.com/spreadsheets/d/1Ao0SlM6Kv6CE1-Ha5mBIrI6nj4Uft2lMaE25qbXxWHs/pubhtml">Show All</a></span><span class="awpUpdated">Updated ${lastUpdated.from()}</span></td></tr>`);
    table.append(tbody);
    content.append($("<div class='scroller'>").append(table));
    $(".awp").append(content);
};
window.parseAWPRankingData = function (data) {
    var entries = data.feed.entry;
    var lastUpdated = moment(data.feed.updated.$t);
    var content = $("<div>");
    content.prepend('<h4 class="text-medium card-title px-4 mb-0 py-3"><a href="https://www.warzone.com/Forum/156042-awp-world-tour">AWP World Tour</a>: Rankings</h4>');

    var table = $('<table class="AWPRanking table table-striped mb-0"><thead><tr><td>Rank</td><td>Name</td><td>Points</td></tr></thead><tbody></tbody></table>');
    var tbody = $("<tbody></tbody>");
    var tr = $("<tr></tr>");
    var url;
    try {
        $.each(entries, function (key, entry) {
            var col = entry.gs$cell.col;
            var row = entry.gs$cell.row;
            if (col == 1) {
                url = entry.content.$t;
            } else if (col == 3) {
                //rank
                tr.append($(`<td>${entry.content.$t}</td>`))
            } else if (col == 5) {
                //name
                tr.append($(`<td><a href="${url}">${entry.content.$t}</a></td>`))
            } else if (col == 25) {
                //points
                tr.append($(`<td>${entry.content.$t}</td>`));
                tbody.append(tr);
                tr = $("<tr></tr>");
            }
        })
    } catch (e) {
        log("error parsing awp event data");
        log(JSON.parse(e))
    }
    table.append(tbody);
    tbody.append(`<tr class="lastRow"><td colspan="3"><span><a target="_blank" href="https://docs.google.com/spreadsheets/d/1Ao0SlM6Kv6CE1-Ha5mBIrI6nj4Uft2lMaE25qbXxWHs/pubhtml">Show All</a></span><span class="awpUpdated">Updated ${lastUpdated.from()}</span></td></tr>`);

    content.append(table);
    $(".awp").prepend(content);
};