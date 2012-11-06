/**
 * Core module for handling events and initializing capabilities
 */
APP.core = (function () {

    // Variables
    var loader,
        html,
        pageView,
        parentView,
        childView,
        modalView,
        pageNav,
        pageNavItems,
        pageNavActive,
        pageNavUrl,
        pageTabs,
        pageTabItems,
        pageTabActive,
        pageTabUrl;

    function initCapabilities() {

        $.os = $.os || {};

        // basic ios5 detection
        $.os.ios5 = $.os.ios && $.os.version.indexOf("5.") !== -1;
        $.os.ios6 = $.os.ios && $.os.version.indexOf("6.") !== -1;

        // basic android4 detection
        $.os.android4 = $.os.android && $.os.version.indexOf("4.") !== -1;

        $.supports = $.supports || {};
        $.supports.cordova = navigator.userAgent.indexOf("TMGContainer") > -1;

        $.supports.webapp = false;
        $.supports.webapp =  APP.util.getQueryParam("webapp", false) === "1" || navigator.standalone || $.supports.cordova;

        // Only enable for iPhone/iPad for now
        $.supports.ftfastclick = $.os.ios;
    }

    /**
     * Attach event listeners
     */
    function attachListeners() {

        /*** Menu button ***/
        APP.events.attachClickHandler(".action-navigation", function (event) {
            toggleNavigation();

            if (!$.supports.webapp) {
                toggleHeight();
            }
        });

        /*** Hide menu when it's open ***/
        APP.events.attachClickHandler(".action-hide-navigation", function (event) {
            hideNavigation();

            if (!$.supports.webapp) {
                toggleHeight();
            }
        });

        /*** TODO - Open page stub ***/
        APP.events.attachClickHandler(".action-push", function (event) {

            var target = $(event.target).closest(".action-push");
            var title = target.text();
            var url = getUrl(target);

            openChildPage(url, title);
        });

        /*** TODO - Go back stub ***/
        APP.events.attachClickHandler(".action-pop", function (event) {

            openParentPage();
        });

        /*** TODO - modal stub ***/
        APP.events.attachClickHandler(".action-modal", function (event) {

            openModal();
        });

        /*** TODO - modal stub ***/
        APP.events.attachClickHandler(".action-close-modal", function (event) {

            closeModal();
        });

        /*** TODO - page tab stub ***/
        APP.events.attachClickHandler(".action-page-tab", function (event) {

            var pageTabTarget = $(event.target);
            var pageTabTitle = pageTabTarget.text();

            // get URL
            pageTabUrl = getUrl(pageTabTarget);

            // set active class
            pageTabActive.removeClass("tab-item-active");
            pageTabActive = pageTabTarget.addClass("tab-item-active");

            loadPage(pageTabUrl, parentView);
        });

        /*** TODO - page navigation stub ***/
        APP.events.attachClickHandler(".action-nav-item", function (event) {

            var pageNavTarget = $(event.target),
                pageNavUrl = getUrl(pageNavTarget),
                pageNavTitle = pageNavTarget.text();

            if (! pageNavUrl) {
                return;
            }

            // set active class
            pageNavActive.removeClass("navigation-item-active");
            pageNavActive = pageNavTarget.addClass("navigation-item-active");

            hideNavigation();

            // set page title
            parentView.find(".action-page-title").text(pageNavTitle);

            loadPage(pageNavUrl, parentView)
        });
    }

    /**
     * Attach event listeners for global (application) events
     */
    function attachGlobalListeners() {

    }

    /**
     * Attach Cordova listeners
     */
    function attachCordovaListeners() {

        // scroll to top on tapbar tap
        document.addEventListener("statusbartap", function() {

            var pageScroller = $(".active-view .overthrow");
            $.scrollElement(pageScroller.get(0), 0);

        });
    }

    /**
     * Get URL from href or data attribute
     */
    function getUrl(elem) {

        if (elem.data("url")) {
            return elem.data("url");
        } else if (elem.attr("href")) {
            return elem.attr("href");
        } else {
            console.log("Specify either an href or data-url");
        }

    }

    /**
     * Do an AJAX request and insert it into a view
     * - url: the URL to call
     * - view: what page to insert the content int (childView, parentView or modalView)
     */
     function loadPage(url, view) {

        // make sure to open the parent
        if (html.hasClass("has-childview") && view === parentView) {

            backwardAnimation();
        }

        var timeoutToken = null;
        $.ajax({
            url: url,
            timeout: 10000,
            headers: { "X-PJAX": true },
            beforeSend: function(xhr, settings) {

                // show loader if nothing is shown within 0,5 seconds
                timeoutToken = setTimeout(function() {
                    showLoader();

                }, 500);

            },
            success: function(response){
                var page = view.find(".page-content");

                clearTimeout(timeoutToken);

                $(page).html(response);
                $.scrollElement($(page).get(0), 0);
            },
            error: function(xhr, type){

                console.log(xhr);
                console.log(type);
            },
            complete: function(xhr, status) {

                hideLoader();
            }
        });
     }

    /**
     * Sets height of content based on height of navigation
     */
    function toggleHeight() {

        var navigationHeight,
            viewport;

        windowHeight = $(window).height();
        navigationHeight = $("#page-navigation").height();
        if (windowHeight > navigationHeight) {
            navigationHeight = windowHeight;
            $("#page-navigation").height(navigationHeight);
        }

        viewport = $(".viewport");
        pageContent = $(".page-view");

        if (html.hasClass("has-navigation")) {
            viewport.height(navigationHeight);
            pageContent.height(navigationHeight);
        } else {
            viewport.height("");
            pageContent.height("");
        }
    }

    /**
     * Shows or hides the sections menu
     */
    function toggleNavigation() {

        html.toggleClass("has-navigation");
    }

    /**
     * Hides the sections menu
     */
    function hideNavigation() {

        html.removeClass("has-navigation");
    }

    /**
     * Opens child page
     */
    function openChildPage(url, title) {

        childView.find(".page-content").html("");

        if (url) {
            loadPage(url, childView);
        }

        if (title) {
            childView.find(".page-logo").text(title);
        }

        forwardAnimation();
    }

    /**
     * Opens parent page
     */
    function openParentPage(url, title) {

        if (html.hasClass("has-childview")) {

            backwardAnimation();
        }

        if (url) {
            loadPage(url, parentView);
        }

        if (title) {
            parentView.find(".page-logo").text(title);
        }

        backwardAnimation();
    }

     /**
      * Forward animation
      */
    function forwardAnimation() {

        childView.removeClass("view-hidden").addClass("active-view");
        parentView.addClass("view-hidden").removeClass("active-view");
        html.addClass("has-childview");
    }

     /**
      * Forward animation
      */
    function backwardAnimation() {

        childView.addClass("view-hidden").removeClass("active-view");
        parentView.removeClass("view-hidden").addClass("active-view");
        html.removeClass("has-childview");
    }

    /**
     * Shows or hides the sections menu
     */
    function openModal() {

        html.addClass("has-modalview");
        pageView.addClass("view-hidden");
        modalView.removeClass("view-hidden");
    }

    /**
     * Hides the sections menu
     */
    function closeModal() {

        html.removeClass("has-modalview");
        pageView.removeClass("view-hidden");
        modalView.addClass("view-hidden");
    }

    /**
     * Shows the loader in an overlay
     */
    function showLoader() {

        var img = $("#loader").find("img");

        if (!img.attr("src")) {
            img.attr("src", img.data("img-src"));
        }

        html.addClass("has-loader");
        loader.show();
    }

    /**
     * Hides the loader
     */
    function hideLoader() {

        html.removeClass("has-loader");
        loader.hide();
    }

    /***
     * Initialize capabilities and attach listeners
     */
    function init() {

        loader = $("#loader");
        html = $("html");
        pageView = $("#page-view");
        parentView = $("#parent-view");
        childView = $("#child-view");
        modalView = $("#modal-view")

        pageNav = $("#page-navigation");
        pageNavItems = pageNav.find(".action-nav-item");
        pageNavActive = pageNav.find(".navigation-item-active");

        pageTabs = $("#page-tabs");
        pageTabItems = pageTabs.find(".action-page-tab");
        pageTabActive = pageTabs.find(".tab-item-active");

        initCapabilities();

        // When used as standalone app or springboard app
        if ($.supports.webapp) {
            html.removeClass("website");
            html.addClass("webapp");
        }

        if ($.os.ios5) {
            html.addClass("ios5");
        }

        // TODO - Lazy media query
        if (document.width >= 980) {
            html.removeClass("website").addClass("webapp desktop no-touch");
        }

        attachListeners();
        attachGlobalListeners();

        if ($.supports.cordova) {
            attachCordovaListeners();
        }

        APP.events.init();
    }

    return {
        "init": init,
        "showLoader": showLoader,
        "hideLoader": hideLoader,
        "loadPage": loadPage,
        "openChildPage": openChildPage,
        "openParentPage": openParentPage,
        "openModal": openModal,
        "closeModal": closeModal,
        "toggleNavigation": toggleNavigation,
        "hideNavigation": hideNavigation
    };

})();
