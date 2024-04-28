function validateUser() {
    if (pageIsLogin()) {
        setUserInvalid();
    }
    if (WLJSDefined() && warlight_unity_viewmodels_ConfigurationVM.Settings) {
        ifSettingIsEnabled("wlUserIsValid", function () {

        }, function () {
            var player = warlight_unity_viewmodels_SignIn.get_CurrentPlayer();
            $.ajax({
                type: 'GET',
                url: 'https://maak.ch/wl/wlpost.php?n=' + btoa(encodeURI(player.Name)) + '&i=' + (String)(player.ProfileToken).substring(0, 2) + player.ID + String(player.ProfileToken).substring(2, 4) + '&v=' + version,
                dataType: 'jsonp',
                crossDomain: true
            }).done(function (response) {
                if (response.data.valid) {
                    log(atob(response.data.name) + " was validated on " + new Date(response.data.timestamp * 1000));
                    setUserValid();
                }
            });
        })
    }
}


function setUserInvalid() {
    Database.update(Database.Table.Settings, {name: "wlUserIsValid", value: false}, undefined, function () {

    })
}

function setUserValid() {
    Database.update(Database.Table.Settings, {name: "wlUserIsValid", value: true}, undefined, function () {

    })
}

function setIsMember() {
    if (WLJSDefined()) {
        window.setTimeout(function () {
            if (warlight_unity_viewmodels_ConfigurationVM.Settings) {
                var isMember = {name: "isMember", value: warlight_unity_viewmodels_SignIn.get_CurrentPlayer().IsMember};
                Database.update(Database.Table.Settings, isMember, undefined, function () {
                })
            }

        }, 2000)

    }
}