function validateUser() {
    if (pageIsLogin()) {
        setUserInvalid();
    }
    ifSettingIsEnabled("wlUserIsValid", function () {
    }, function () {
        $.ajax({
            type: 'GET',
            url: 'https://maak.ch/wl/wlpost.php?n=' + btoa(encodeURI(WlPlayer.Name)) + '&i=' + WlPlayer.PlayerId + '&v=' + version,
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


function setUserInvalid() {
    Database.update(Database.Table.Settings, { name: "wlUserIsValid", value: false }, undefined, function () {
    })
}

function setUserValid() {
    Database.update(Database.Table.Settings, { name: "wlUserIsValid", value: true }, undefined, function () {
    })
}