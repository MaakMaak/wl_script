function hideCoinsGlobally() {
    $("#LeaderboardTable").prev().remove();
    $("#LeaderboardTable").css({
        opacity: 0,
        cursor: 'default'
    });
    $("#LeaderboardTable a").css('display', 'none');
    $("body").find("a[href='/Coins/']").css('display', 'none');

    $("a[href='/Win-Money']").css('display', 'none');
    $("#OpenTournamentsTable").css('display', 'none');
}

function updateTotalPointsEarned() {
    var pointsEarned = {
        name: "totalPoints",
        value: warlight_shared_points_PointValues.Get(warlight_unity_viewmodels_SignIn.get_CurrentPlayer().Level).RawPoints + warlight_unity_viewmodels_SignIn.get_CurrentPlayer().PointsThisLevel
    };
    Database.update(Database.Table.Settings, pointsEarned, undefined, function () {
    })
}