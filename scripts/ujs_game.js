function setupUJS() {
    if ($("#UjsContainer").length == 0) {
        log("UjsContainer not found");
        return;
    }
    createUJSMenu("Game", "game-menu", setupMirrorPicks);
    var interval = window.setInterval(function () {
        if (typeof UJS_Hooks != "undefined") {
            log("UJS_Hooks loaded");
            window.clearInterval(interval);
            setupMirrorPicks();
        }
    }, 100);
}

function setupMirrorPicks() {
    if (UJS_Hooks.Links.Latest == undefined || UJS_Hooks.Links._gameDetails.NumberOfTurns >= 0 || UJS_Hooks.Links.Latest.TeammatesOrders == null) {
        return;
    }
    console.log("creating menu");
    $("#mirror-picks").remove();
    createUJSSubMenu("game-menu-dropdown", "Mirror Picks", "mirror-picks");
    var orders = UJS_Hooks.Links.Latest.TeammatesOrders.store.h;
    var players = UJS_Hooks.Links._gameDetails.Players.store.h;
    var myLongId = $("nav a[href*='Profile']").attr("href").replace(/\/Profile\?p=/, "");
    var myId = myLongId.substring(2, myLongId.length - 2);
    var myPlayer = players[myId];
    Object.keys(players).map(function (playerId) {
        var player = players[playerId];
        if (player.IsTeammate(myPlayer.Team) && player.GamePlayerID != myPlayer.GamePlayerID) {
            var playerName = player.DisplayName();
            var entry = createUJSSubMenuEntry("mirror-picks", "Mirror " + playerName);
            entry.on("click", function () {
                try {
                    mirrorPicks(playerId);
                } catch (e) {
                    log(e);
                    throw e;
                }
            });
        }
    })
}

function mirrorPicks(playerId) {
    var player = UJS_Hooks.Links.Latest.TeammatesOrders.store.h[playerId];
    console.log(playerId, player)
    if (player) {
        pickTerritories(player.Picks)
    }
}

function pickTerritories(picks) {
    console.log(picks)
    if ($("#ujs_OrdersListItemContents").children().length == 0) {
        $("svg").click()
        $.each(picks, function (key, val) {
            pickTerritory(val);
        });
    } else {
        CreateModal("Alert", "", "Please clear your orders first.", false)
    }
}

function pickTerritory(id) {
    var state = UJS_Hooks.BuildingTurnState;
    var order = new UJS_Hooks.GameOrderPick(state.Root.Links.get_Us().get_ID(), id, state.Orders.length)
    state.InsertOrder(new UJS_Hooks.OrdersListItemVM(order, state.Root, state.Root.Links.Latest.LatestStanding))
}

addCSS(`
    .navbar-nav li:hover > ul.dropdown-menu {
        display: block;
    }
    .dropdown-submenu {
        position:relative;
    }
    .dropdown-submenu>.dropdown-menu {
        top:0;
        left:100%;
        margin-top:-6px;
    }
    .ujs-menu .dropdown-menu {
    padding: 0px;

    }
`);