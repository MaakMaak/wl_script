function addCSS(css) {
    var head = document.head || document.getElementsByTagName('head')[0]
    var style = document.createElement('style');
    style.type = 'text/css';
    if (head) {
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
    } else {
        $$$(document).ready(function () {
            addCSS(css)
        })
    }
}

/**
 * Create a CSS selector
 * @param name The name of the object, which the rules are applied to
 * @param rules The CSS rules
 */
function createSelector(name, rules) {
    var head = document.head || document.getElementsByTagName('head')[0]
    var style = document.createElement('style');
    style.type = 'text/css';
    if (head) {
        head.appendChild(style);
        if (!(style.sheet || {}).insertRule) {
            (style.styleSheet || style.sheet).addRule(name, rules);
        } else {
            style.sheet.insertRule(name + "{" + rules + "}", 0);
        }
    } else {
        $$$(document).ready(function () {
            createSelector(name, rules)
        })
    }
}

function setGlobalStyles() {
    /** Warzone **/
    addCSS(`
        body > .container-fluid {
            font-size: 15px;
        }
        .modal-1000 .modal-dialog {
            max-width: 1000px;
        }        
        .modal-750 .modal-dialog {
            max-width: 750px;
        }
        .modal-500 .modal-dialog {
            max-width: 500px;
        }
        .modal-dialog {
            border: 1px gray solid;
        }
        .modal-header {
            background-image: radial-gradient(circle at center,#88888855,transparent),url(https://warzonecdn.com/Images/Warzone/MainNavBacking2.jpg);
            background-repeat: no-repeat,repeat;
            background-size: 100% 100%,194px 194px;
           }   
        .modal-content {
            background-image: linear-gradient(-10deg,#33333322 0%,transparent 70%),url(https://warzonecdn.com/Images/Warzone/Background2.jpg);
            background-repeat: no-repeat,repeat;
            background-size: 100% 100%,10px 15px;
            color: grey;
        }   
        .modal-content a {
            color: #5a9da5;
        }
        .modal-content .title {
            border-bottom: 1px solid #928f59;
            margin-top: 25px;
        }
        .p-4 table {
            width: 100%;
        }
        .GameRow p {
            margin: 0 !important;
        }
        h2, h3 {
            font-size: 25px;
        }
        img[src*='/Images/X.png'] {
            width: 100%; 
            height: 100%;
        }
    `)

    /** Warlight **/

    $("tr:contains('WarLight Shop')").closest(".dataTable").attr("id", "ShopTable");
    createSelector('.help-icon', 'display:inline-block;position:absolute; margin-left:10px;margin-top: 2px;cursor:pointer; height: 15px; width: 15px;')
    var winHeight = $(window).height();
    createSelector(".popup", "position: fixed;;left: 50%;background: #171717;top: 100px;z-index: 9999; color:white;padding:60px 30px 30px 30px;border: 2px solid gray;border-radius:8px;max-height:" + (winHeight - 200) + "px;overflow-y:auto");
    createSelector(".close-popup-img", "float:right;margin:5px;cursor:pointer;margin-right: 20px");
    addCSS(`.popup .title {
                color: crimson;
                font-size: 15px;
                margin-top: 10px;
                display: inline-block;
                width: 95%;
                padding-bottom: 3px;
                border-bottom: 1px solid crimson;
            }`)
    createSelector(".popup input[type='checkbox']", "width: 20px;height: 20px;margin-left:30px;margin: 5px;");
    createSelector(".overlay", "position: absolute;background: white;top: 0;left: 0;right: 0;bottom: 0;z-index: 98;opacity: 0.5;width: 100%;height: 100%;position: fixed;");
    createSelector(".popup .head", "position: fixed;height: 40px;background: #330000;width: 660px;left: 0;right: 0;top: 100px;color: white;font-size: 15px;text-align: center;line-height: 40px;border-top-left-radius:8px;border-top-right-radius:8px;margin:auto;z-index:10000;");
    createSelector(".userscript-show", "display:none");
    createSelector(".newSetting", "color: gold;font-weight: bold;");
    createSelector(".userscript-menu img", "height: 18px;display: inline-block;position: relative;margin-bottom: -5px;margin-right: 7px;");
    createSelector(".custom-menu", "display: none;z-index: 98;position: absolute;overflow: hidden;border: 1px solid #CCC;white-space: nowrap;font-family: sans-serif;background: #FFF;color: #333;border-radius:5px;padding: 10px;z-index:100000000; cursor:pointer");
    createSelector(".custom-menu .content", "width: 300px;white-space: pre-wrap;");
    createSelector('.popup input[type="text"]', 'display: inline-block;background: none;border-top: none;border-left: none;border-right: none;color: green;font-size: 15px;border-bottom: 1px white dashed;font-family: Verdana;padding: 0 5px 0 5px;text-align: center;margin-right: 5px');
    createSelector(".popup840", "width: 840px;margin-left: -452px");
    createSelector(".popup600", "width: 600px;margin-left: -332px");
    createSelector(".popup840 .head", "width: 900px");
    createSelector(".popup600 .head", "width: 660px");
    createSelector(".context-menu", "display: none;z-index: 100;position: absolute;overflow: hidden;border: 1px solid #CCC;white-space: nowrap;font-family: sans-serif;background: #FFF;color: #333;border-radius: 5px;padding: 0;");
    createSelector(".context-menu li", "padding: 8px 12px;cursor: pointer;list-style-type: none;");
    createSelector(".context-menu li:hover", "background-color: #DEF;");
    createSelector("#MyGamesTable select", "margin: 0 10px 0 5px; width: 125px")
    createSelector("#MyGamesFilter", "float:right")
    createSelector("#MyGamesTable thead tr", "text-align: right")
    $("body").on("click", function (e) {
        if ($(".custom-menu").is(':visible')) {
            $(".custom-menu").hide(100);
        }
    });
}

function loadDataTableCSS() {
    var styles = document.createElement("style");
    styles.type = "text/css";
    styles.innerHTML = getDataTableCSS();
    document.body.appendChild(styles);
}

function getDataTableCSS() {
    return `table.dataTable thead td,table.dataTable thead th{padding:6px 18px 6px 6px}table.dataTable tfoot td,table.dataTable tfoot th{padding:10px 18px 6px;border-top:1px solid #111}table.dataTable thead .sorting,table.dataTable thead .sorting_asc,table.dataTable thead .sorting_desc{cursor:pointer}table.dataTable thead .sorting,table.dataTable thead .sorting_asc,table.dataTable thead .sorting_asc_disabled,table.dataTable thead .sorting_desc,table.dataTable thead .sorting_desc_disabled{background-repeat:no-repeat;background-position:center right}table.dataTable thead .sorting{background-image:url(https://cdn.datatables.net/1.10.10/images/sort_both.png)}table.dataTable thead .sorting_asc{background-image:url(https://cdn.datatables.net/1.10.10/images/sort_asc.png)}table.dataTable thead .sorting_desc{background-image:url(https://cdn.datatables.net/1.10.10/images/sort_desc.png)}table.dataTable thead .sorting_asc_disabled{background-image:url(https://cdn.datatables.net/1.10.10/images/sort_asc_disabled.png)}table.dataTable thead .sorting_desc_disabled{background-image:url(https://cdn.datatables.net/1.10.10/images/sort_desc_disabled.png)}.dataTables_wrapper{position:relative;clear:both;zoom:1}#PlayersContainer td{white-space:nowrap}

    .dataTables_filter {
	float: right;
    }

    .dataTables_filter label {
        display: inline!important;
    }    

    .dataTables_filter input {
        padding: 3px;
        border-radius: 5px;
        margin: 5px;
    }

    .dataTables_info {
        clear: both;
        padding-top: 10px;
    }

    .pagination {
        display: inline-block;
        float: right;

    }
    #foundClansTable_wrapper .row {
        width: 100%;
    }
    .paginate_button {
        display: inline;
        padding: 5px;
    }.paginate_button.active {
        text-decoration: underline;
    }`
}