/**
 * Module for doing search and autocomplete
 */
APP.search = (function () {

    // Variables
    var searchForm,
        searchUrl,
        searchInput,
        searchText,
        searchSubmit,
        searchResult,
        searchDelay;

    function form() {
        return searchForm;
    }

    function loadResults(request) {

        $.ajax({
            url: request,
            // data: { name: 'Zepto.js' },
            timeout: 5000,
            beforeSend: function() {

                // show loader if nothing is shown within 0,5 seconds
                timeoutToken = setTimeout(function() {
                    APP.loader.show();

                }, 250);

            },
            success: function(response) {
                // if we were offline, reset the connection to online
                APP.connection.status("online");

                searchResult.html(response).show();
            },
            error: function(xhr, errorType, error){

                APP.connection.status("offline");
            },
            complete: function() {

                clearTimeout(timeoutToken);
                APP.loader.hide();
            }
        });
    }

    function doSearch(query) {

        var searchText = query || searchInput.attr("value");

        if (searchText) {
            searchUrl = searchForm.attr("action") + "?" + searchInput.attr("name") + "=" + searchText;
            loadResults(searchUrl);
        }
    }

    /**
     * Attach event listeners
     */
    function attachListeners() {

        /*** Submit search form ***/
        APP.events.attachClickHandler(".action-search-submit", function (event) {

            doSearch();
        });

        searchInput.on("keyup", function() {
            APP.delay(function() {
                doSearch();
            }, 1000);
        });
    }

    /***
     * Initialize variables and attach listeners
     */
    function init(id) {

        searchForm = id ? $("#" + id) : $("#search-form");
        searchInput = searchForm.find(".action-search-input");
        searchSubmit = searchForm.find(".action-search-submit");
        searchResult = searchForm.find(".js-search-results");
        searchDelay = null;

        attachListeners();
    }

    return {
        "init": init,
        "form": form
    };

})();