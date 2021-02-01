function pageIsMultiplayer() {
    return location.href.match(/.*warzone[.]com\/MultiPlayer.*/i);
}

function pageIsPointsPage() {
    return location.href.match(/.*warzone[.]com\/Points.*/i);
}

function pageIsDashboard() {
    return location.href.match(/.*warzone[.]com\/MultiPlayer\/(?:#|\?|$).*$/i);
}

function pageIsProfile() {
    return location.href.match(/.*warzone[.]com\/profile\?p=[0-9]+$/i);
}

function pageIsLevelOverview() {
    return location.href.match(/.*warzone[.]com\/SinglePlayer\/Level\?ID=[0-9]+$/i);
}

function pageIsLevelPlayLog() {
    return location.href.match(/.*warzone[.]com\/SinglePlayer\/PlayLog\?ID=[0-9]+$/i);
}

function pageIsMapsPage() {
    return location.href.match(/.*warzone[.]com\/maps/i);
}

function pageIsNewThread() {
    return location.href.match(/.*warzone[.]com\/Forum\/NewThread.*/i);
}

function pageIsForumThread() {
    return location.href.match(/.*warzone[.]com\/Forum\/[0-9]+.*/i);
}

function pageIsForumOverview() {
    return location.href.match(/.*warzone[.]com\/Forum\/Forum.*/i);
}

function pageIsThread() {
    return location.href.match(/.*warzone[.]com\/(Forum|Discussion|Clans\/CreateThread).*/i);
}

function pageIsSubForum() {
    return location.href.match(/.*warzone[.]com\/Forum\/[A-Z]+.*/i);
}

function pageIsForum() {
    return location.href.match(/.*warzone[.]com\/Forum\/.*/);
}

function pageIsLadderOverview() {
    return location.href.match(/.*warzone[.]com\/Ladders/);
}

function pageIsLogin() {
    return location.href.match(/.*warzone[.]com\/LogIn.*/);
}

function pageIsClanForumThread() {
    return location.href.match(/.*warzone[.]com\/Discussion\/\?ID=[0-9]+.*/);
}

function pageIsTournament() {
    return location.href.match(/.*warzone[.]com\/MultiPlayer\/Tournament\?ID=[0-9]+/i);
}

function pageIsTournamentOverview() {
    return location.href.match(/.*warzone[.]com\/MultiPlayer\/Tournaments\/$/i);
}

function pageIsGame() {
    return location.href.match(/.*warzone[.]com\/MultiPlayer\?GameID=[0-9]+/i);
}

function pageIsExamineMap() {
    return location.href.match(/.*warzone[.]com\/SinglePlayer\?PreviewMap.*/i);
}

function pageIsDesignMap() {
    return location.href.match(/.*warzone[.]com\/MultiPlayer\?DesignMaps.*/i);
}

function pageIsCommonGames() {
    return location.href.match(/.*warzone[.]com\/CommonGames\?p=[0-9]+$/i);
}

function pageIsQuickmatch() {
    return location.href.match(/.*warzone[.]com\/multiplayer\?quickmatch/i);
}

function pageIsCommunityLevels() {
    return location.href.match(/.*warzone[.]com\/SinglePlayer\/CommunityLevels/i);
}

function pageIsCommunity() {
    return location.href.match(/.*warzone[.]com\/Community/i);
}

function pageIsMapOfTheWeek() {
    return location.href.match(/.*warzone[.]com\/MapOfTheWeek.*/i);
}

function pageIsBlacklistPage() {
    return location.href.match(/.*warzone[.]com\/ManageBlackList.*/i);
}

function pageIsMapPage() {
    return location.href.match(/.*warzone[.]com\/Map.*/i);
}

function pageIsMyAccount() {
    return location.href.match(/.*warzone[.]com\/MyAccount.*/i);
}

function mapIsPublic() {
    return $("a:contains('Start a')").length > 0;
}