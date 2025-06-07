const COOKIE_NAME = "muli_wl_player";

function removePlayerDataCookie() {
    $.removeCookie(COOKIE_NAME);
}
function loadPlayerData() {
    let cookieValue = $.cookie('muli_wl_player');
    if (cookieValue) {
        window.WlPlayer = JSON.parse(cookieValue);
        log("Skipping reloading player data " + $.cookie('wlPlayerCacheValid'));
        return;
    }
    let player = {
        Name: null,
        PlayerId: null,
        ProfileId: null,
        ProfileToken: [],
        isMember: null,
        OnVacationUntil: null,
        Level: null,
        PointsThisLevel: null
    }
    let profileUrl = "https://www.warzone.com" + $(".dropdown-menu a[href*='Profile']").attr('href');
    $.ajax({
        url: profileUrl,
        async: false,
        success: function (response) {
            let page = $(response);
            player.Name = page.find("#AccountDropDown").text().trim();
            player.PlayerId = extractPlayerId(profileUrl);
            player.ProfileId = extractProfileId(profileUrl);
            player.ProfileToken = extractProfileToken(profileUrl);
            player.isMember = page.find("#MemberIcon").length > 0;
            player.OnVacationUntil = getVacationEndDate(page);
            player.Level = page.find("#LevelLink").text().trim().replace("L", "")
            player.PointsThisLevel = Number(page.find("#LevelLink").attr("title").match(/Progress to next:\s*([\d,]+)/)[1].replace(/[^\d]/g, ''));

            window.WlPlayer = player;

            // Create a cookie to cache the values for 1 hour
            $.cookie(COOKIE_NAME, JSON.stringify(player), { expires: new Date(new Date().getTime() + 1 * 60 * 60 * 1000) });
        }
    });
}

function getVacationEndDate(page) {
    let vacationText = page.find("img[src*='Vacation']")
        .parent()
        .contents()
        .filter(function () {
            if (this.nodeType === 3) {
                return this.nodeValue.includes("vacation")
            }
            return false;
        })
        .text()
        .trim();
    let match = vacationText.match(/(\d{1,2}\/\d{1,2}\/\d{4} \d{2}:\d{2}:\d{2})/);

    if (match) {
        return new Date(match[1]);
    }
    return null;
}

/**
 * Extracts the full id of a player. The player id is built as following:
 * - first 2 digits of the profile token
 * - the profile id
 * - last 2 digits of the profile token
 */
function extractPlayerId(url) {
    let match = url.match(/p=(\d+)/);
    if (match != null) {
        return match[1];
    }
    return null;
}


function extractProfileId(url) {
    let match = url.match(/p=(\d+)/);
    if (match != null) {
        return match[1].slice(2, -2);
    }
    return null;
}

function extractProfileToken(url) {
    let match = url.match(/p=(\d+)/);
    if (match != null) {
        return [match[1].slice(0, 2), match[1].slice(-2)];
    }
    return null;
}

wljs_WaitDialogJS = {
    Start: () => { },
    Stop: () => { }
}