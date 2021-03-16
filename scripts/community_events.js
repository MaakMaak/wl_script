function setupLadderClotOverview() {
    console.log("setupLadderClotOverview");
    $("h1").text($("h1").text() + " & Community Events");
    loadClots(function (clotInfo) {
        console.log("clotInfo");
        console.log(clotInfo);
        if (!clotInfo) {
            return
        }
        var ladders = clotInfo['leagues'];
        var md = "";
        var rt = "";
        var leagues = "";
        var counter = 0;
        $.each(ladders, function (key, val) {
            if (val.type == "realtime") {
                rt += "<li><big><a target='_blank' href=" + val.url + ">" + val.name + "</a> using Real-Time boot times</big></li><br><br>";
                counter++
            } else if (val.type == "multiday") {
                md += "<li><big><a target='_blank' href = " + val.url + ">" + val.name + "</a> using Multi-Day boot times</big></li><br><br>";
                counter++
            } else {
                leagues += `<li><big><a target='_blank' href="${val.url}">${val.name}</a> ${getPlayerString(val.players)}</big></li><br><br>`;
                counter++
            }

        });
        var $mainSite = $("#AutoContainer > div");
        $mainSite.append("Warzone currently has " + toWords(counter) + " Community Events:<br><br>");

        $mainSite.append("<ul id='clotInfo'></ul>");
        let $clotInfo = $("#clotInfo");
        $clotInfo.append(rt);
        $clotInfo.append(md);
        $clotInfo.append(leagues)
    });
}

function getPlayerString(players) {
    if (players) {
        return `<span class='clotPlayers'>${players} players participating</span>`
    }
    return ""
}

function loadClots(cb) {
    log("loading clots");
    $.ajax({
        type: 'GET',
        url: 'https://raw.githubusercontent.com/psenough/wl_clot/master/hub/list.jsonp',
        dataType: 'text',
        crossDomain: true
    }).done(function (response) {
        try {
            var response = eval(response);
            console.log(response.data);
            var json = response.data;
            var clotInfo = JSON.stringify(json);
            sessionStorage.setItem('clots', clotInfo);
            if (cb) {
                cb(json)
            }

            var datetime = json.datetime;
            log("clot update " + datetime)

        } catch (e) {
            log("Error parsing CLOTs");
            log(e)
        }
    }).fail(function (e) {
        log("Error loading CLOTs");
        log(e);
    });
}

function toWords(number) {

    var NS = [
        {value: 1000000000000000000000, str: "sextillion"},
        {value: 1000000000000000000, str: "quintillion"},
        {value: 1000000000000000, str: "quadrillion"},
        {value: 1000000000000, str: "trillion"},
        {value: 1000000000, str: "billion"},
        {value: 1000000, str: "million"},
        {value: 1000, str: "thousand"},
        {value: 100, str: "hundred"},
        {value: 90, str: "ninety"},
        {value: 80, str: "eighty"},
        {value: 70, str: "seventy"},
        {value: 60, str: "sixty"},
        {value: 50, str: "fifty"},
        {value: 40, str: "forty"},
        {value: 30, str: "thirty"},
        {value: 20, str: "twenty"},
        {value: 19, str: "nineteen"},
        {value: 18, str: "eighteen"},
        {value: 17, str: "seventeen"},
        {value: 16, str: "sixteen"},
        {value: 15, str: "fifteen"},
        {value: 14, str: "fourteen"},
        {value: 13, str: "thirteen"},
        {value: 12, str: "twelve"},
        {value: 11, str: "eleven"},
        {value: 10, str: "ten"},
        {value: 9, str: "nine"},
        {value: 8, str: "eight"},
        {value: 7, str: "seven"},
        {value: 6, str: "six"},
        {value: 5, str: "five"},
        {value: 4, str: "four"},
        {value: 3, str: "three"},
        {value: 2, str: "two"},
        {value: 1, str: "one"}
    ];

    var result = '';
    for (var n of NS) {
        if (number >= n.value) {
            if (number <= 20) {
                result += n.str;
                number -= n.value;
                if (number > 0) result += ' ';
            } else {
                var t = Math.floor(number / n.value);
                var d = number % n.value;
                if (d > 0) {
                    return intToEnglish(t) + ' ' + n.str + ' ' + intToEnglish(d);
                } else {
                    return intToEnglish(t) + ' ' + n.str;
                }

            }
        }
    }
    return result;
}