function setupDatabase() {
    log("indexedDB start setup");
    window.Database = {
        db: null,
        Table: {
            Bookmarks: "Bookmarks",
            Settings: "Settings",
            BlacklistedForumThreads: "BlacklistedForumThreads",
            TournamentData: "TournamentData",
            QuickmatchTemplates: "QuickmatchTemplates"
        },
        Exports: {
            Bookmarks: "Bookmarks",
            Settings: "Settings",
            BlacklistedForumThreads: "BlacklistedForumThreads"
        },
        Row: {
            BlacklistedForumThreads: {
                ThreadId: "threadId",
                Date: "date"
            },
            Bookmarks: {
                Order: "order"
            },
            Settings: {
                Name: "name"
            },
            TournamentData: {
                Id: "tournamentId"
            },
            QuickmatchTemplates: {
                Id: "setId"
            }
        },
        init: function (callback) {
            log("indexedDB start init");
            if (!"indexedDB" in window) {
                log("IndexedDB not supported");
                return;
            }
            var openRequest = indexedDB.open("TidyUpYourDashboard_v3", 7);
            openRequest.onupgradeneeded = function (e) {
                var thisDB = e.target.result;
                if (!thisDB.objectStoreNames.contains("Bookmarks")) {
                    var objectStore = thisDB.createObjectStore("Bookmarks", {autoIncrement: true});
                    objectStore.createIndex("order", "order", {unique: true});
                }
                if (!thisDB.objectStoreNames.contains("Settings")) {
                    var objectStore = thisDB.createObjectStore("Settings", {keyPath: "name"});
                    objectStore.createIndex("name", "name", {unique: true});
                    objectStore.createIndex("value", "value", {unique: false});
                }
                if (!thisDB.objectStoreNames.contains("BlacklistedForumThreads")) {
                    var objectStore = thisDB.createObjectStore("BlacklistedForumThreads", {autoIncrement: true});
                    objectStore.createIndex("threadId", "threadId", {unique: true});
                    objectStore.createIndex("date", "date", {unique: false});
                }
                if (!thisDB.objectStoreNames.contains("TournamentData")) {
                    var objectStore = thisDB.createObjectStore("TournamentData", {keyPath: "tournamentId"});
                    objectStore.createIndex("tournamentId", "tournamentId", {unique: true});
                    objectStore.createIndex("value", "value", {unique: false});
                }
                if (!thisDB.objectStoreNames.contains("QuickmatchTemplates")) {
                    var objectStore = thisDB.createObjectStore("QuickmatchTemplates", {
                        keyPath: "setId",
                        autoIncrement: true
                    });
                    objectStore.createIndex("setId", "setId", {unique: true});
                    objectStore.createIndex("value", "value", {unique: false});
                }
            };

            openRequest.onsuccess = function (e) {
                log("indexedDB init sucessful");
                db = e.target.result;
                callback()
            };
            openRequest.onblocked = function (e) {
                log("indexedDB blocked");
            };

            openRequest.onerror = function (e) {
                log("Error Init IndexedDB");
                log(e.target.error)
//                alert("Sorry, Tidy Up Your Dashboard is not supported")
                // $("<div>Sorry,<br> Tidy Up Your Dashboard is not supported.</div>").dialog();
            }
        },
        update: function (table, value, key, callback) {
            var transaction = db.transaction([table], "readwrite");
            var store = transaction.objectStore(table);


            //Perform the add
            try {
                if (key == undefined) {
                    var request = store.put(value);
                } else {
                    var request = store.put(value, Number(key));
                }
                request.onerror = function (e) {
                    log(`Error saving ${JSON.stringify(value)} in ${table}`);
                    log(JSON.stringify(e));
                };

                request.onsuccess = function (e) {
                    log(`Saved ${JSON.stringify(value)} in ${table}`);
                    callback()
                }
            } catch (e) {
                log(`Error saving ${JSON.stringify(value)} in ${table}`);
                log(JSON.stringify(e));
            }


        },
        read: function (table, key, callback) {
            var transaction = db.transaction([table], "readonly");
            var objectStore = transaction.objectStore(table);

            var ob = objectStore.get(Number(key));

            ob.onsuccess = function (e) {
                var result = e.target.result;
                callback(result)
            }
        },
        readIndex: function (table, row, value, callback) {
            var transaction = db.transaction([table], "readonly");
            var objectStore = transaction.objectStore(table);

            var index = objectStore.index(row);

            //name is some value
            var ob = index.get(value);

            ob.onsuccess = function (e) {
                var result = e.target.result;
                callback(result)
            }
        },
        readAll: function (table, callback) {
            var transaction = db.transaction([table], "readonly");
            var objectStore = transaction.objectStore(table);
            var items = [];

            var ob = objectStore.openCursor();

            ob.onsuccess = function (e) {
                var cursor = e.target.result;
                if (cursor) {
                    var item = cursor.value;
                    item.id = cursor.primaryKey;
                    items.push(item);
                    cursor.continue();
                } else {
                    callback(items)
                }
            }
        },
        add: function (table, value, callback) {

            var transaction = db.transaction([table], "readwrite");
            var store = transaction.objectStore(table);

            try {
                var request = store.add(value);
                request.onerror = function (e) {
                    log(`Error saving ${JSON.stringify(value)} in ${table}`);
                    log(JSON.stringify(e));
                };

                request.onsuccess = function (e) {
                    log(`Saved ${JSON.stringify(value)} in ${table}`);
                    callback()
                }
            } catch (e) {
                log(`Error saving ${JSON.stringify(value)} in ${table}`);
                log(JSON.stringify(e));
            }
        },
        delete: function (table, key, callback) {
            var transaction = db.transaction([table], "readwrite");
            var store = transaction.objectStore(table);


            //Perform the add
            var request = store.delete(key);

            request.onerror = function (e) {
                log("Error deleting in " + table);
                log(e.target.error);
                //some type of error handler
            };

            request.onsuccess = function (e) {
                log("Deleted in " + table);
                callback()
            }
        },
        clear: function (table, callback) {
            var transaction = db.transaction([table], "readwrite");
            var store = transaction.objectStore(table);


            //Perform the add
            var request = store.clear();

            request.onerror = function (e) {
                log("Error clearing " + table);
                log(e.target.error);
                //some type of error handler
            };

            request.onsuccess = function (e) {
                log("Cleared " + table);
                callback()
            }
        }

    }

}