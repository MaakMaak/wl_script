function setupQuickmatchTemplates() {
    var interval = window.setInterval(function () {
        if ($("[id^=ujs_HeaderLabel]:contains('Quickmatch Templates')").length > 0) {
            if ($(".qmtemplates-menu").length === 0) {
                setupQuickmatchTemplatesMenu();
            }
        } else {
            $(".qmtemplates-menu").remove();
        }
    }, 1500);

}

function setupQuickmatchTemplatesMenu() {
    $(".qmtemplates-menu").remove();
    createUJSMenu("Templates", "qmtemplates-menu");
    //Check all
    createUJSSubMenuEntry("qmtemplates-menu-dropdown", "Check All", function () {
        getTemplates().forEach(function (template) {
            if (!template.isChecked) {
                template.toggleButton.trigger("click");
            }
        })
    });

    //Uncheck all
    createUJSSubMenuEntry("qmtemplates-menu-dropdown", "Uncheck All", function () {
        uncheckAll();
    });

    //Store templates
    createUJSSubMenu("qmtemplates-menu-dropdown", "Store Set", "store-set");
    createUJSSubMenuEntry("store-set", "<i>New Set</i>", function () {
        var name = prompt("Enter name");
        if (name) {
            Database.add(Database.Table.QuickmatchTemplates, {
                value: getTemplatesToStore(name)
            }, function () {
                setupQuickmatchTemplatesMenu();
            });
        } else {
            createModal("No name set", "Give your selected templates a name if you want to store them for later.")
        }
    });
    getStoredSets(function (sets) {
        sets.forEach(function (set) {
            createUJSSubMenuEntry("store-set", set.value.name, function () {
                Database.update(Database.Table.QuickmatchTemplates, {
                    setId: set.setId,
                    value: getTemplatesToStore(set.value.name)
                }, undefined, function () {
                    setupQuickmatchTemplatesMenu();
                });
            });
        });
    });

    //Load templates
    createUJSSubMenu("qmtemplates-menu-dropdown", "Load Set", "load-set");
    getStoredSets(function (sets) {
        sets.forEach(function (set) {
            createUJSSubMenuEntry("load-set", set.value.name, function () {
                uncheckAll();
                var templates = set.value.templates;
                getTemplates().filter(function (template) {
                    return templates.indexOf(templateToString(template)) !== -1
                }).forEach(function (template) {
                    template.toggleButton.trigger("click");
                })
            });
        });
    });

    //Delete Set
    createUJSSubMenu("qmtemplates-menu-dropdown", "Delete Set", "delete-set");
    getStoredSets(function (sets) {
        sets.forEach(function (set) {
            createUJSSubMenuEntry("delete-set", set.value.name, function () {
                Database.delete(Database.Table.QuickmatchTemplates, set.setId, function () {
                    log("Deleted set " + set.setId);
                    setupQuickmatchTemplatesMenu();
                })
            });
        });
    });
}

function getTemplatesToStore(name) {
    return {
        name: name,
        templates: getSelectedTemplates().map(function (template) {
            return templateToString(template);
        })
    };
}

function uncheckAll() {
    getTemplates().forEach(function (template) {
        if (template.isChecked) {
            template.toggleButton.trigger("click");
        }
    });
}

function getStoredSets(cb) {
    return Database.readAll(Database.Table.QuickmatchTemplates, cb);
}

function getSelectedTemplates() {
    return getTemplates().filter(function (template) {
        return template.isChecked;
    });
}

function templateToString(template) {
    return template.name + template.mapImage;
}

function getTemplates() {
    return $("[id^=ujs_TemplatesSceneTemplate]")
        .filter(function (key, row) {
            return $(row).attr("id").indexOf("img") === -1;
        })
        .map(function (key, row) {
            return {
                toggleButton: $(row).find(".ujsToggle "),
                isChecked: $(row).find(".ujsToggle ").is(":checked"),
                mapImage: $(row).find("[id^=ujs_MapThumbnail].ujsImg").html().match(/.*Maps\/([0-9]*)/)[1],
                name: $(row).find("[id^=ujs_TemplateNameLabel].ujsTextInner").text()
            }
        }).toArray();
}
