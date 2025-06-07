function setupCommunityLevels() {
    $("h1").after(`
        <div class="alert alert-success" role="alert">
            Visit <a target="_blank" href="http://communitylevels.online/">communitylevels.online</a> for advanced search options!
        </div>
    `);
}

function renderLevelRow(level) {
    if (!level) {
        return;
    }
    return `
        <tr>
            <td style="position: relative">
                <img src="${level.MAP_IMAGE}" width="140" height="80" style="position:relative">
            </td>
            <td>
                <a style="font-size: 17px; color: white" 
                    href="/SinglePlayer/Level?ID=${level.ID}">${level.NAME}
                </a> &nbsp;&nbsp;
                <font color="gray">${level.LIKES} likes, ${level.WINS} wins in ${level.ATTEMPTS} attempts</font><br>
                <font color="gray">Created by</font> ${level.CREATOR_CLAN_ID > 0 ? '<a href="/Clans/?ID=' + level.CREATOR_CLAN_ID + '" title="' + level.CREATOR_CLAN_NAME + '"><img border="0" style="vertical-align: middle" src="' + level.CREATOR_CLAN_IMAGE + '"></a>' : ''} <a href="https://www.warzone.com/Profile?p=${level.CREATOR_ID}">${decode(level.CREATOR_NAME)}</a><br>
                <font color="gray">Record holder:</font> ${level.RECORD_HOLDER_CLAN_ID > 0 ? '<a href="/Clans/?ID=' + level.RECORD_HOLDER_CLAN_ID + '" title="' + level.RECORD_HOLDER_CLAN_ID + '"><img border="0" style="vertical-align: middle" src="' + level.RECORD_HOLDER_CLAN_IMAGE + '"></a>' : ''} ${level.RECORD_HOLDER_NAME ? '<a href="https://www.warzone.com/Profile?p=' + level.RECORD_HOLDER_ID + '">' + decode(level.RECORD_HOLDER_NAME) + '</a>' + getTurnText(level.RECORD_TURNS) : 'None'}<br>
                <font color="gray">Win rate: </font>${level.WIN_RATE}%<br>
            </td>
            <td><span style="font-size: 17px"><a href="/SinglePlayer?Level=${level.ID}">Play</a></span></td>
        </tr>`
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

function getTurnText(turns) {
    return ` in ${turns} ${turns > 1 ? 'turns' : 'turn'}`
}
