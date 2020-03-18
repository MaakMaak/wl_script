function getArt() {
    return {
        Types: {
            DivA: {
                Player: {
                    FullHeight: 250,
                    IconHeight: 60
                },
                Clan: {
                    FullHeight: 350,
                    IconHeight: 80
                }
            },
            DivB: {
                Player: {
                    FullHeight: 200,
                    IconHeight: 50
                },
                Clan: {
                    FullHeight: 250,
                    IconHeight: 70
                }
            }
        },
        Groups: [
            {
                Type: "DivA",
                Title: "Clan League 9",
                Players: {
                    //Malakkan
                    257509174: ["https://i.imgur.com/16vS4Ut.png"],
                    //#Master [QB]
                    5518973792: ["https://i.imgur.com/ZssJxOk.png", "https://i.imgur.com/5xKJQVQ.png"],
                    //Master Ryiro
                    5015900432: ["https://i.imgur.com/NDCh1iF.png", "https://i.imgur.com/9AchdrO.png"],
                    //Master Jz
                    4439722815: ["https://i.imgur.com/ZH0MaxV.png"],
                    //Master of the Dead
                    2428496679: ["https://i.imgur.com/OLo56yI.png", "https://i.imgur.com/0Wy9qmT.png", "https://i.imgur.com/HeInmGN.png"],
                    //PanagiotisTheGreekFreak
                    2049943516: ["https://i.imgur.com/mz3FZql.png"],
                    //Timinator • apex
                    816809922: ["https://i.imgur.com/6kljYSb.png", "https://i.imgur.com/BqCAzbp.png"],
                    //{101st} Master Sarah♦
                    4543063534: ["https://i.imgur.com/QbffPl9.png", "https://i.imgur.com/RTNBhYr.png"],
                    //Beren • apex
                    314032996: ["https://i.imgur.com/98JUdFy.png"],
                    //Muli
                    2211733141: ["https://i.imgur.com/XqV4Hjy.png"],
                    //Sephiroth
                    9911415828: ["https://i.imgur.com/PD93aHT.png"],
                    //Master Atom ◆Elite◆
                    3427873563: ["https://i.imgur.com/SDTtj3O.png"],
                    //Jefferspin
                    6319040229: ["https://i.imgur.com/ewDBddw.png"],
                    //master of desaster
                    2214950915: ["https://i.imgur.com/1oTZcHn.png", "https://i.imgur.com/xeuvFzs.png"],
                    //AWESOMEGUY
                    796423469: ["https://i.imgur.com/17IV10e.png"]
                },
                Clans: {
                    //Masters
                    11: ["https://i.imgur.com/spTbW2c.png"],
                    //One
                    170: ["https://i.imgur.com/r0KGhkC.png"],
                    //Outlaws
                    260: ["https://i.imgur.com/rjYJbAL.png"]
                }
            }, {
                Type: "DivB",
                Title: "Clan League 9",
                Players: {
                    //smileyleg
                    3929495241: ["https://i.imgur.com/bGzoMkd.png"],
                    //Master Moto
                    6862295334: ["https://i.imgur.com/eO6T4D2.png"],
                    //Ollie
                    7524524629: ["https://i.imgur.com/OCFI7Lw.png"],
                    //almosttricky
                    4817205946: ["https://i.imgur.com/W9EugfQ.png"],
                    //Hobo
                    239359818: ["https://i.imgur.com/aoe1IAH.png"],
                    //Botanator
                    633358359: ["https://i.imgur.com/FIXeYG5.png"],
                    //ViralGoat
                    7841556925: ["https://i.imgur.com/DOXeAsO.png"],
                    //EZPickens
                    55998716: ["https://i.imgur.com/6QoMxs5.png"],
                    //Mifran
                    4825272432: ["https://i.imgur.com/3Dcq6eh.png"],
                    //JV
                    8019640756: ["https://i.imgur.com/IxdYo7S.png"],
                    //KO
                    7818276235: ["https://i.imgur.com/sOOvMDz.png"],
                    //DarrenDieHard
                    82622046: ["https://i.imgur.com/ieeUKje.png"],
                    //Inside
                    105380470: ["https://i.imgur.com/xYSTPm4.png"],
                    //Tobe
                    4514168736: ["https://i.imgur.com/xQkMg9h.png"],
                    //Jaymer
                    3237238849: ["https://i.imgur.com/i1HxTh8.png"],
                    //kirby
                    8818886504: ["https://i.imgur.com/hrdHmXm.png"],
                    //rakleader
                    8136895102: ["https://i.imgur.com/ugUpnM2.png"],
                    //Timtimie
                    8311000679: ["https://i.imgur.com/oQg2idd.png"],
                    //Cluster
                    7010496305: ["https://i.imgur.com/3wN6HDI.png"]
                },
                Clans: {
                    //GG
                    9: ["https://i.imgur.com/90oitx6.png"],
                    //MH
                    141: ["https://i.imgur.com/n55iL2y.png"],
                    //VS
                    188: ["https://i.imgur.com/c4bDQ6u.png"]
                }
            }
        ],
    }
}

function setupCLArt() {
    setupArtIcons();
    addCSS(`
        #clArt img {
            float: left;
            margin: 5px;
        }
        #clArt {
            max-width: 250px;
            cursor: pointer;
        }
        #clArt a {
            clear: both;
            display: block;
        }
        #awardDialog {
            display: none;
        }
        #awardDialog img {
            display: inline-block;
            margin: 20px;
            webkit-filter: drop-shadow(5px 10px 6px black);
            filter: drop-shadow(5px 10px 6px black);
        }
        #awardDialog .group {
            text-align: left;
            padding: 8px 30px;
            margin: 20px 10px;
            background-size: cover;
        }
        #awardDialog h1 {
            text-align: left;
            text-transform: uppercase;
            font-weight: bold;
            color: rgba(255, 255, 255, 0.66);
            display: block;
            font-size: 28px;
        }
        .clearFloat{
            display: block;
            width: 100%;
        }
        .ui-widget-header {
            border: none;
            background: none;
        }
        .ui-state-default, .ui-widget-content .ui-state-default, .ui-widget-header .ui-state-default {
            border: none;
            background: none;
            outline: none;
            margin: -2px;
            z-index: 10;
        }
        .ui-dialog {
            background: url(https://i.imgur.com/woAdW0h.png);
            background-size: cover;
        }
    `)
}

function setupArtIcons() {
    if (pageIsProfile()) {
        setupArtIconsProfile();
    } else if (pageIsClanPage()) {
        setupArtIconsClan();
    }
}

function setupArtIconsProfile() {
    var dialog = $('<div id="awardDialog" title=""></div>');
    var dialogContent = $('<div class="content"></div>');
    var id = window.location.href.replace(/.*warzone.com\/Profile\?p=/, "");
    $('a[href*="Achievements"]').closest("tr").after("<tr><td colspan='3' id='clArt'></td></tr>");
    var count = 0;
    getArt().Groups.forEach(function (group, key) {
        var groupContent = $("<div class='group'></div>")
        groupContent.append("<h1>" + group.Title + "</h1><div class='clearFloat'></div>")
        if (group.Players[id]) {
            group.Players[id].forEach(function (img, key) {
                $("#clArt").append(getImageIcon(img, group, "Player"))
                groupContent.append(getImageFullSize(img, group, "Player"))
                count++;
            })
            dialogContent.append(groupContent);
        }
    })
    $("#clArt").prepend("<h3>Awards <font color='gray'>(" + count + ")</font></h3>")
    if (count > 0) {
        $("#clArt").append("<a>Show All</a>")
    } else {
        $("#clArt").append("<em>No awards yet</em>")
    }
    dialog.append(dialogContent);
    appendDialog($(dialog).html())
    if (count > 0) {
        $("#clArt").on("click", function () {
            $("#userscriptAwards").modal("show");
        })
    }
}

function setupArtIconsClan() {
    $("#AutoContainer > table tr > td:nth-of-type(3)").append("<div id='clArt'></div>");
    $("#AutoContainer > table tr > td:nth-of-type(3)").css("padding-top", 0);
    addCSS(`
        #clArt {
            display: inline-block;
            top: 45px;
            position: absolute;
        }
    `)
    var dialog = $('<div id="awardDialog" title=""></div>');
    var dialogContent = $('<div class="content"></div>');
    var id = window.location.href.replace(/.*Clans\/\?ID=/, "");
    var count = 0;
    getArt().Groups.forEach(function (group, key) {
        var groupContent = $("<div class='group'></div>")
        groupContent.append("<h1>" + group.Title + "</h1><div class='clearFloat'></div>")
        if (group.Clans[id]) {
            group.Clans[id].forEach(function (img, key) {
                $("#clArt").append(getImageIcon(img, group, "Clan"))
                groupContent.append(getImageFullSize(img, group, "Clan"))
                count++;
            })
            dialogContent.append(groupContent);
        }
    })
    $("#clArt").prepend("<h3>Achievements <font color='gray'>(" + count + ")</font></h3>")
    if (count > 0) {
        $("#clArt").append("<a>Show All</a>")
    } else {
        $("#clArt").append("<em>No achievements yet</em>")
    }

    $("#clArt").css("position", "inherit")

    dialog.append(dialogContent);
    appendDialog($(dialog).html())
    if (count > 0) {
        $("#clArt").on("click", function () {
            $("#userscriptAwards").modal("show");
        })
    }
}

function appendDialog(content) {
    $("body").append(`
        <div class="modal modal-1000 fade" id="userscriptAwards" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                ${content}
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
    `)
}

function getImageFullSize(href, group, type) {
    var height = getArt().Types[group.Type][type].FullHeight;
    return "<img src='" + href + "' height='" + height + "'>"
}

function getImageIcon(href, group, type) {
    var height = getArt().Types[group.Type][type].IconHeight;
    return "<img src='" + href + "' height='" + height + "'>"
}