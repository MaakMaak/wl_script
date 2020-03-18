function setupBookmarkMenu() {
    bookmarkBody = "<label for='bookmarkName'>Name</label><input style='width:100%;color: lightgray;text-align: left;' type='text' id='bookmarkName'><br><br><label for='bookmarkURL'>Url</label><input style='width:100%; text-align: left; color: lightgray' id='bookmarkURL' type='text'><br><br><label for='bookmarkNewWindow'>Open in new Window</label><input style='float:left;' id='bookmarkNewWindow' type='checkbox'>";

    $("body").append(`
        <div class="modal modal-500 fade" id="bookmarkMenu" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLongTitle">Add Bookmark</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="d-flex flex-column">
                    <div style="padding:10px" class="d-flex flex-column">
                        <label for='bookmarkName'>Name</label>
                        <input type='text' id='bookmarkName'>
                        <label for='bookmarkURL'>Url</label>
                        <input id='bookmarkURL' type='text'>
                    </div>
                     <div class="form-check">
                        <label class="form-check-label">
                            <input id='bookmarkNewWindow' type='checkbox'>
                            Open in new Window
                        </label>
                    </div>
                </div>
              </div> 
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-success" data-dismiss="modal" onclick='saveBookmark()'>Save</button>
              </div>
            </div>
          </div>
        </div>
    `);

    createSelector(".highlightedBookmark", "background-color:rgb(50, 50, 50);cursor:pointer;");
    $("body").append("<ul class='context-menu bookmark-context'><li onclick='editBookmark()'>Edit</li><li onclick='moveBookmarkUp()'>Move up</li><li onclick='moveBookmarkDown()'>Move Down</li></ul>")
    $("body").append("<ul class='context-menu thread-context'><li onclick='hideThread()'>Hide</li></ul>")
    bindCustomContextMenu()

}

function setupBookmarkTable() {
    $(".SideColumn").prepend('<table class="dataTable" cellspacing="0" width="100%" id="BookmarkTable" style="text-align: left;"><thead><tr><td style="text-align: center">Bookmarks<img src="' + IMAGES.PLUS + '" width="15" height="15" onclick="showAddBookmark()"style="display:inline-block;float:right; opacity: 0.6; margin-right:15px; cursor: pointer"></td></tr></thead></table><br>');

    refreshBookmarks();
    bindBookmarkTable();
}

function refreshBookmarks() {
    Database.readAll(Database.Table.Bookmarks, function (bookmarks) {
        $("#BookmarkTable tbody").remove();
        bookmarks.sort(function (a, b) {
            return a.order - b.order
        })
        var data = "<tbody>";
        $.each(bookmarks, function (key, bookmark) {
            data += '<tr data-bookmarkId="' + bookmark.id + '" data-order="' + bookmark.order + '"><td><a ' + (bookmark.newWindow ? 'target="_blank"' : "") + ' href="' + bookmark.url + '">' + bookmark.name + '</a>';
            data += '<a onclick="deleteBookmark(' + bookmark.id + ')" style="display:inline-block;float:right; opacity: 0.6;cursor: pointer;margin-right:5px">';
            data += '<span class="ui-icon ui-icon-trash"></span></a></td></tr>';
        })

        $("#BookmarkTable").append(data + '</tbody>');
        warlight_shared_viewmodels_WaitDialogVM.Stop()

        $(".loader").fadeOut("fast", function () {
            if ($(".loader")) {
                $(".loader").remove();
                window.timeUserscriptReady = new Date().getTime();
                log("Time userscript ready " + (timeUserscriptReady - timeUserscriptStart) / 1000)
            }

        })
    })


}

window.bookmarkOrder;
window.bookmarkId;
window.showAddBookmark = function () {
    $("#bookmarkMenu").modal("show")
    bookmarkId = undefined
    bookmarkOrder = undefined
    $("#bookmarkURL").val("");
    $("#bookmarkName").val("");
    $("#bookmarkNewWindow").prop("checked", false);
}

window.editBookmark = function () {
    Database.read(Database.Table.Bookmarks, bookmarkId, function (bookmark) {
        $("#bookmarkURL").val(bookmark.url);
        $("#bookmarkName").val(bookmark.name);
        $("#bookmarkNewWindow").prop("checked", bookmark.newWindow);
        $("#bookmarkMenu").modal("show")
    })

}

window.moveBookmarkUp = function () {
    Database.readAll(Database.Table.Bookmarks, function (bookmarks) {
        var bookmark;
        var newIdx = -1
        $.each(bookmarks, function (key, bm) {
            if (bookmarkId == bm.id) {
                bookmark = bm
            }
        })
        bookmarks.sort(function (a, b) {
            return a.order - b.order
        });
        var previousBookmark1 = bookmarks[bookmarks.indexOf(bookmark) - 1]
        var previousBookmark2 = bookmarks[bookmarks.indexOf(bookmark) - 2] || {order: 0}
        if (previousBookmark1) {
            bookmark.order = (previousBookmark1.order + previousBookmark2.order) / 2

            Database.update(Database.Table.Bookmarks, bookmark, bookmark.id, function () {
                $("#bookmarkURL").val('');
                $("#bookmarkName").val('');
                $("#bookmarkNewWindow").prop('checked', false);
                $(".overlay").fadeOut();
                refreshBookmarks();
            })
        }
    })
}

window.moveBookmarkDown = function () {
    Database.readAll(Database.Table.Bookmarks, function (bookmarks) {
        var bookmark;
        var newIdx = -1
        $.each(bookmarks, function (key, bm) {
            if (bookmarkId == bm.id) {
                bookmark = bm
            }
        })
        bookmarks.sort(function (a, b) {
            return a.order - b.order
        });
        var nextBookmark1 = bookmarks[bookmarks.indexOf(bookmark) + 1]
        var nextBookmark2 = bookmarks[bookmarks.indexOf(bookmark) + 2] || {order: 100000}
        if (nextBookmark1) {
            bookmark.order = (nextBookmark1.order + nextBookmark2.order) / 2
            Database.update(Database.Table.Bookmarks, bookmark, bookmark.id, function () {
                $("#bookmarkURL").val('');
                $("#bookmarkName").val('');
                $("#bookmarkNewWindow").prop('checked', false);
                $(".overlay").fadeOut();
                refreshBookmarks();
            })
        }
    })
}


window.deleteBookmark = function (id) {
    Database.delete(Database.Table.Bookmarks, id, function () {
        refreshBookmarks();
    })
}

window.saveBookmark = function () {
    $("#bookmarkMenu").hide();
    var url = $("#bookmarkURL").val().trim();
    url = (url.lastIndexOf('http', 0) != 0) && (url.lastIndexOf('javascript', 0) != 0) ? "http://" + url : url;
    var name = $("#bookmarkName").val().trim();
    var newWindow = $("#bookmarkNewWindow").prop("checked");

    if (bookmarkId == undefined) {
        Database.readAll(Database.Table.Bookmarks, function (bookmarks) {
            bookmarks.sort(function (a, b) {
                return a.order - b.order
            })
            var bookmark = {
                name: name,
                url: url,
                newWindow: newWindow,
                order: (bookmarks.length > 0) ? bookmarks[bookmarks.length - 1].order + 1 : 1
            }
            Database.add(Database.Table.Bookmarks, bookmark, function () {
                showBookmarkTable();
                refreshBookmarks();
            })
        })
    } else {
        var bookmark = {
            name: name,
            url: url,
            newWindow: newWindow,
            order: bookmarkOrder
        }
        Database.update(Database.Table.Bookmarks, bookmark, bookmarkId, function () {
            showBookmarkTable();
            refreshBookmarks();
        })
    }

    $("#bookmarkURL").val('');
    $("#bookmarkName").val('');
    $("#bookmarkNewWindow").prop('checked', false);
    $(".overlay").fadeOut();
}

function hideBookmarkTable() {
    $("#BookmarkTable").hide();
    if ($("#BookmarkTable").next().is('br')) {
        $("#BookmarkTable").next().hide();
    }
}

function showBookmarkTable() {
    $("#BookmarkTable").show();
    if ($("#BookmarkTable").next().is('br')) {
        $("#BookmarkTable").next().show();
    }
}

window.bookmarkForumThread = function () {
    var title = $("title").text().replace(' - Play Risk Online Free - WarLight', '');
    var url = window.location.href;

    $("#bookmarkURL").val(url);
    $("#bookmarkName").val(title);
    showAddBookmark();

}
window.bookmarkTournament = function () {
    var title = $("#TournamentName").text().replace("Tournament: ", "").trim();
    var url = window.location.href;

    $("#bookmarkURL").val(url);
    $("#bookmarkName").val(title);
    showAddBookmark();

}

window.bookmarkLevel = function () {
    var title = $("h1").text()
    var url = window.location.href;

    $("#bookmarkURL").val(url);
    $("#bookmarkName").val(title);
    showAddBookmark();

}

function addDefaultBookmark() {
    var bookmark = {
        name: "Muli's userscript (Tidy up Your Dashboard)",
        url: "https://www.warlight.net/Forum/106092-tidy-up-dashboard-2",
        newWindow: false,
        order: 0
    }
    Database.add(Database.Table.Bookmarks, bookmark, function () {
        showBookmarkTable();
        refreshBookmarks();
    })
}

function bindBookmarkTable() {
    $("#BookmarkTable").bind("contextmenu", function (event) {
        $(".highlightedBookmark").removeClass("highlightedBookmark")
        var row = $(event.target).closest("tr");


        bookmarkId = row.attr("data-bookmarkid")
        bookmarkOrder = row.attr("data-order")

        if (bookmarkId && bookmarkOrder) {
            event.preventDefault();
            row.addClass("highlightedBookmark")
            // Show contextmenu
            $(".bookmark-context").finish().toggle(100).css({
                top: event.pageY + "px",
                left: event.pageX + "px"
            });
        }

    });
}

function setupLevelBookmark() {
    $("h1").after(`
       <a style="cursor:pointer" onclick="bookmarkLevel()">Bookmark</a><br>
    `)
}