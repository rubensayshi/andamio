/*jshint latedef:true, undef:true, unused:false boss:true */
/*global $, document, window */

var APP = APP || {};


/**
 * Module for accessing all Andamio DOM elements
 * @author Jeroen Coumans
 * @class dom
 * @namespace APP
 */
APP.dom = (function () {

    var doc = $(document),
        win = window,
        html = $("html"),
        viewport = $(".viewport"),

        // page wrapper
        pageView = $("#page-view"),

        // parent view
        parentView = $("#parent-view"),
        parentViewTitle = parentView.find(".js-title"),
        parentViewContent = parentView.find(".js-content"),

        // child view
        childView = $("#child-view"),
        childViewTitle = childView.find(".js-title"),
        childViewContent = childView.find(".js-content"),

        // alternate child view
        childViewAlt = $("#child-view-alternate"),
        childViewAltTitle = childViewAlt.find(".js-title"),
        childViewAltContent = childViewAlt.find(".js-content"),

        // modal view
        modalView = $("#modal-view"),
        modalViewTitle = modalView.find(".js-title"),
        modalViewContent = modalView.find(".js-content"),

        // navigation
        pageNav = $("#page-navigation"),
        pageNavItems = pageNav.find(".action-nav-item"),
        pageNavActive = pageNavItems.filter(".active"),

        // loader
        pageLoader = $("#loader"),
        pageLoaderImg = pageLoader.find("img"),

        // tabs
        pageTabs = $("#page-tabs"),
        pageTabItems = pageTabs.find(".action-tab-item"),
        pageTabActive = pageTabItems.filter(".active"),

        // alert
        pageAlert = $("#page-alert");

    return {
        win: win,
        doc: doc,
        html: html,
        viewport: viewport,
        pageView: pageView,
        parentView: parentView,
        parentViewTitle: parentViewTitle,
        parentViewContent: parentViewContent,
        childView: childView,
        childViewTitle: childViewTitle,
        childViewContent: childViewContent,
        childViewAlt: childViewAlt,
        childViewAltTitle: childViewAltTitle,
        childViewAltContent: childViewAltContent,
        modalView: modalView,
        modalViewTitle: modalViewTitle,
        modalViewContent: modalViewContent,
        pageNav: pageNav,
        pageNavItems: pageNavItems,
        pageNavActive: pageNavActive,
        pageLoader: pageLoader,
        pageLoaderImg: pageLoaderImg,
        pageTabs: pageTabs,
        pageTabItems: pageTabItems,
        pageTabActive: pageTabActive,
        pageAlert: pageAlert
    };

})();

/**
 * Various utility functions
 * @author Jeroen Coumans
 * @class util
 * @namespace APP
 */
APP.util = (function () {

    /**
     * Returns the value for a given query string key.
     * @method getQueryParam
     * @todo It would be better to parse the query string once and cache the result.
     *
     * @param {String} name Query string key
     * @param {String} defaultValue If the query string is not found it returns this value.
     * @param {String} queryString Query string to pick the value from, if none is provided
     *                    window.location.search query string will be used. This
     *                    parameter makes the function testable.
     *
     * @return The value of the query string or defaultValue if the key is
     *         not found. If the value is empty an empty string is returned.
     */
    function getQueryParam(name, defaultValue, queryString) {

        if (!queryString) {
            queryString = window.location.search;
        }
        var match = RegExp("[?&]" + name + "=([^&]*)").exec(queryString);

        return match ?
            decodeURIComponent(match[1].replace(/\+/g, " "))
            : defaultValue;
    }

    /**
     * Returns whether the given (anchor) element contains an external link
     * @method isExternalLink
     * @param {HTMLElement} elem an anchor element
     * @return {Boolean} true when the anchor contains `target="_blank"`
     */
    function isExternalLink(elem) {

        var element = $(elem);

        return element.attr("target") === "_blank";
    }

    /**
     * Get URL from the data attribute, falling back to the href
     * @method getUrl
     * @param {HTMLElement} elem the element to get the URL from
     * @return {String} Will return the URL when a `data-url` value is found, else return the href if an href is found that doesn't start with `javascript`, else return the hash if hash is found
     */
    function getUrl(elem) {

        var url = $(elem).data("url"),
            href = $(elem).attr("href"),
            hash = $(elem).hash;

        if (url) { return url; }
        else if (href.substring(0,10) !== "javascript") { return href; }
        else if (hash) { return hash; }
    }

    /**
     * Returns an array of URL's
     * @method getUrlList
     * @param {HTMLElement} selector the selector used to get the DOM elements, e.g. ".article-list .action-pjax"
     * @return {Array} an array of URL's
     */
    function getUrlList(selector) {

        if (! selector) return;

        var urlList = [];

        $(selector).each(function(index, item) {

            var url = APP.util.getUrl(item);
            urlList.push(url);
        });

        return urlList;
    }

    /**
     * Get title from the data attribute, falling back to the text
     * @method getTitle
     * @param {HTMLElement} elem the element to get the title from
     * @return {String} the value of `data-title` if it's found, else the text of the element
     */
    function getTitle(elem) {

        var title;

        if (elem.data("title")) {
            title = elem.data("title");
        } else if (elem.text()) {
            title = elem.text();
        }

        return title;
    }

    return {
        "getQueryParam": getQueryParam,
        "isExternalLink": isExternalLink,
        "getUrl": getUrl,
        "getUrlList": getUrlList,
        "getTitle": getTitle
    };
})();

/**
 * Executes the callback function after a specified delay
 * @author Jeroen Coumans
 * @class delay
 * @namespace APP
 * @param {Integer} timer the delay in milliseconds after which to execute the callback
 */
APP.delay = (function(){
    var timer = 0;
    return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();
/*jshint latedef:true, undef:true, unused:true boss:true */
/*global APP, $, navigator, lscache */

/**
 * Core module for initializing capabilities and modules
 * @author Jeroen Coumans
 * @class core
 * @namespace APP
 */
APP.config = (function () {

    /*** Zepto detect.js ***/
    function detect(ua) {

        var os = this.os = {}, browser = this.browser = {},
            webkit = ua.match(/WebKit\/([\d.]+)/),
            android = ua.match(/(Android)\s+([\d.]+)/),
            ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
            iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
            webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
            touchpad = webos && ua.match(/TouchPad/),
            kindle = ua.match(/Kindle\/([\d.]+)/),
            silk = ua.match(/Silk\/([\d._]+)/),
            blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
            bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
            rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
            playbook = ua.match(/PlayBook/),
            chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
            firefox = ua.match(/Firefox\/([\d.]+)/);

        if (browser.webkit = !!webkit) browser.version = webkit[1];

        if (android) os.android = true, os.version = android[2];
        if (iphone) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.');
        if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.');
        if (webos) os.webos = true, os.version = webos[2];
        if (touchpad) os.touchpad = true;
        if (blackberry) os.blackberry = true, os.version = blackberry[2];
        if (bb10) os.bb10 = true, os.version = bb10[2];
        if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2];
        if (playbook) browser.playbook = true;
        if (kindle) os.kindle = true, os.version = kindle[1];
        if (silk) browser.silk = true, browser.version = silk[1];
        if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true;
        if (chrome) browser.chrome = true, browser.version = chrome[1];
        if (firefox) browser.firefox = true, browser.version = firefox[1];

        os.tablet = !!(ipad || playbook || (android && !ua.match(/Mobile/)) || (firefox && ua.match(/Tablet/)));
        os.phone  = !!(!os.tablet && (android || iphone || webos || blackberry || bb10 || chrome || firefox));
    }

    /**
     * Initialize capabilities based on UA detection
     * @method init
     */
    function init(params) {

        detect.call($, navigator.userAgent);

        if (typeof params !== "object" || typeof params === "undefined") params = false;

        // basic ios detection
        $.os.ios5 = $.os.ios && $.os.version.indexOf("5.") !== -1;
        $.os.ios6 = $.os.ios && $.os.version.indexOf("6.") !== -1;

        // basic android detection
        $.os.android2 = $.os.android && $.os.version >= "2" && $.os.version < "4"; // yes we also count android 3 as 2 ;-)
        $.os.android4 = $.os.android && $.os.version >= "4" && $.os.version < "5";

        // basic blackberry detection
        $.os.bb10 = navigator.userAgent.indexOf("BB10") > -1;

        // Enable for phone & tablet
        APP.config.ftfastclick = $.os.phone || $.os.tablet;

        // Configurable settings
        APP.config.cordova  = (typeof params.cordova !== "undefined") ? params.cordova : navigator.userAgent.indexOf("TMGContainer") > -1;
        APP.config.offline  = (typeof params.offline !== "undefined") ? params.offline : lscache.supported();
        APP.config.server   = (typeof params.server  !== "undefined") ? params.server  : APP.dom.win.location.origin + APP.dom.win.location.pathname;

        if (typeof params.webapp !== "undefined") {
            APP.config.webapp   = params.webapp;
        } else {
            APP.config.webapp = APP.config.cordova || APP.util.getQueryParam("webapp", false) === "1" || navigator.standalone;
        }

        APP.config.touch = 'ontouchstart' in APP.dom.win;

        // Yes, everything above 980 is considered desktop
        APP.config.tablet = $.os.tablet || APP.dom.doc.width() >= 980;

        if (APP.config.tablet) {
            APP.dom.html.removeClass("website").addClass("desktop has-navigation");
            APP.config.webapp = true;
        }

        if (! APP.config.touch) APP.dom.html.addClass("no-touch");

        // When used as standalone app or springboard app
        if (APP.config.webapp) APP.dom.html.removeClass("website").addClass("webapp");
        if ($.os.ios)          APP.dom.html.addClass("ios");
        if ($.os.ios5)         APP.dom.html.addClass("ios5");
        if ($.os.ios6)         APP.dom.html.addClass("ios6");
        if ($.os.android)      APP.dom.html.addClass("android");
        if ($.os.android2)     APP.dom.html.addClass("android2");
        if ($.os.android4)     APP.dom.html.addClass("android4");
    }

    return {
        "init": init
    };
})();

/**
 * Module for dealing with events, esp. preventing click events to happen multiple times during animation or while content is loading.
 * @author Jeroen Coumans
 * @class events
 * @namespace APP
 */
APP.events = (function () {

    // declare variables
    var EVENT_LOCK_TIMEOUT,
        EVENT_LOCK_LOCKED,
        EVENT_LOCK_UNLOCKED,
        eventLock,
        body;

    /**
     * Enable or disables the event lock. The event lock prevents double tapping during animation.
     * @method setEventLock
     * @param {Boolean} lock Whether to lock or unlock events: `EVENT_LOCK_LOCKED` or `EVENT_LOCK_UNLOCKED`
     * @param {Integer} timeout The timeout before the lock will automatically unlock.
     * Set to 0 to disable
     */
    function setEventLock(lock, timeout) {

        eventLock = lock;
        if (eventLock === EVENT_LOCK_LOCKED && timeout !== 0) {
            setTimeout(function () {
                eventLock = EVENT_LOCK_UNLOCKED;
            }, timeout || EVENT_LOCK_TIMEOUT);
        }
    }

    /**
     * Locks all click events
     * @method lock
     * @param {Integer} timeout Optional timeout before lock will automatically unlock.
     * Default is 500ms, set to 0 to disable
     */
    function lock(timeout) {

        setEventLock(EVENT_LOCK_LOCKED, timeout);
    }

    /**
     * Unlocks click events lock
     * @method unlock
     */
    function unlock() {

        setEventLock(EVENT_LOCK_LOCKED);
    }

    /**
     * @method isLocked
     * @return {Boolean} Whether click events are currently locked
     */
    function isLocked() {

        return  eventLock === EVENT_LOCK_LOCKED;
    }

    /**
     * Attaches a 'click' handler to elements with the given
     * selector. Will use 'tap' events if supported by the browser.
     *
     * @method attachClickHandler
     * @param {String} selector element selector
     * @param {Function} fn the function to call when clicked
     * @param {Boolean} [bubbles] Whether the event will bubble up. Default: false
     */
    function attachClickHandler(selector, fn, bubbles) {

        body.on("click", selector, function(event) {
            if (!APP.events.isLocked()) {
                fn(event);
                if (bubbles !== true) {
                    return false;
                }
            }
        });
    }

    /**
     * Initialize variables and ftFastClick
     * @method init
     */
    function init() {

        // initialize variables
        EVENT_LOCK_TIMEOUT = 500,
        EVENT_LOCK_LOCKED = true,
        EVENT_LOCK_UNLOCKED = false,

        eventLock = EVENT_LOCK_UNLOCKED,

        body = $(document.body);

        if (APP.config.ftfastclick) {
            var fastclick = new FastClick(document.body);
        }
    }

    return {
        "init": init,
        "lock": lock,
        "unlock": unlock,
        "isLocked": isLocked,
        "attachClickHandler": attachClickHandler
    };
})();

/*jshint latedef:true, undef:true, unused:true, boss:true */
/*global APP, $, navigator, cordova */

/**
 * Module that enhances the webapp with Cordova functionality
 * @author Jeroen Coumans
 * @class phone
 * @namespace APP
 */
APP.phone = (function () {

    var APP_FROM_BACKGROUND_REFRESH_TIMEOUT = 30 * 60 * 1000,
        lastUpdated = new Date();

    /**
     * Attach Cordova listeners
     * @method attachListeners
     * @private
     */
    function attachListeners() {

        // Listens to all clicks on anchor tags and opens them in Cordova popover if it's an external URL
        APP.dom.viewport.on("click", "a", function() {
            if (APP.util.isExternalLink(this)) {

                // open external URL's in in-app Cordova browser
                var href = $(this).attr("href");
                navigator.utility.openUrl(href, "popover");
                return false;
            } else {
                return true;
            }
        });

        // hide splashscreen
        navigator.bootstrap.addConstructor(function() {
            cordova.exec(null, null, "SplashScreen", "hide", []);
        });

        // scroll to top on tapbar tap
        APP.dom.doc.on("statusbartap", function() {

            var pageScroller;

            if (APP.nav.status()) {

                pageScroller = APP.dom.pageNav;
            } else {

                pageScroller = $(".active-view").find(".overthrow");
            }

            pageScroller.each(function() {

                var that = $(this),
                    hasOverflow = that.css("overflow");

                if (hasOverflow === "auto") {
                    $.scrollElement(that.get(0), 0);
                }
            });
        });

        // refresh when application is activated from background
        APP.dom.doc.on("resign", function() {
            lastUpdated = new Date();
        });

        APP.dom.doc.on("active", function() {
            var now = new Date();
            if (now - lastUpdated > APP_FROM_BACKGROUND_REFRESH_TIMEOUT) {

                if (APP.alert.status) APP.alert.hide();
                APP.open.refresh();
            }
        });
    }

    /**
     * Checks wether Cordova is available, and then calls initCordova
     * @method init
     */
    function init() {

        // When Cordovia is loaded and talking to the device, initialize it
        navigator.bootstrap.addConstructor(function() {
            attachListeners();
        });
    }

    return {
        "init": init
    };
})();

/**
 * Module that deals with internet connectivity
 * @author Jeroen Coumans
 * @class connection
 * @namespace APP
 */
APP.connection = (function () {

    // variables
    var connection,
        offlineMessage;

    /**
     * Called when the connection goes online, will hide the offline alert
     * @method goOnline
     * @private
     */
    function goOnline() {

        connection = "online";

        if (APP.alert.status()) {
            APP.alert.hide();
        }
    }

    /**
     * Called when the connection goes offline, will show an offline alert
     * @method goOffline
     * @private
     */
    function goOffline() {

        connection = "offline";
        APP.alert.show(offlineMessage);
    }

    /**
     * Returns the status of the connection
     * @method status
     * @return {String} the connection, either `offline` or `online`
     *
     **/
    function getStatus() {

        return connection;
    }

    /**
     * Sets the status of the connection
     * @method status
     * @param [msg] {String} accepts `offline` or `online` to set the connection status
     * @return {String} the connection, either `offline` or `online`
     *
     **/
    function setStatus(msg) {

        // useful for testing offline / online
        if (msg === "offline") {
            goOffline();
        } else if (msg === "online") {
            goOnline();
        }

        return connection;
    }

    /**
     * Attach event listeners
     * @method attachListeners
     */
    function attachListeners() {

        APP.dom.doc.on("ajaxSuccess", function() {

            APP.connection.setStatus("online");
        });

        APP.dom.doc.on("ajaxError", function() {

            APP.connection.setStatus("offline");
        });
    }

    /***
     * Sets the default connection to online
     * @method init
     */
    function init(params) {

        offlineMessage = (params && params.offlineMessage) ? params.offlineMessage : '<a href="javascript:void(0)" class="action-refresh">De verbinding is verbroken. Probeer opnieuw.</a>';

        // set default connection to online
        goOnline();
        attachListeners();
    }

    return {
        "init": init,
        "getStatus": getStatus,
        "setStatus": setStatus
    };

})();
/**
 * Controls the global loader
 * @author Jeroen Coumans
 * @class loader
 * @namespace APP
 */
APP.loader = (function () {

    // Variables
    var spinnerType,
        loaderText,
        hasLoader,
        timeoutToken;

    /**
     * Shows the loader on top of the page. When no message is given, it will use the text inside #loader .loader-text
     * @method show
     * @param {String} [msg] the message to show in the spinner
     */
    function show(msg) {

        var message = msg || loaderText.text();

        APP.dom.html.addClass("has-loader");
        hasLoader = true;

        if (navigator.spinner) {

            navigator.spinner.show({"message": message});
        } else {

            if (!APP.dom.pageLoaderImg.attr("src")) {
                APP.dom.pageLoaderImg.attr("src", APP.dom.pageLoaderImg.data("img-src"));
            }

            APP.dom.pageLoader.show();
            loaderText.text(message);
        }

    }

    /**
     * Hides the loader
     * @method hide
     */
    function hide() {

        APP.dom.html.removeClass("has-loader");
        hasLoader = false;

        if (navigator.spinner) {
            navigator.spinner.hide();
        }
        else {
            APP.dom.pageLoader.hide();
        }
    }

    /**
     * Returns wether the loader is active or not
     * @method status
     */
    function status() {

        return hasLoader;
    }

    /**
     * Attach event listeners
     * @method attachListeners
     */
    function attachListeners() {

        APP.dom.doc.on("APP:views:loadPage:start", function() {

            // show loader if nothing is shown within 0,250 seconds
            timeoutToken = setTimeout(function() {
                APP.loader.show();

            }, 250);
        });

        APP.dom.doc.on("APP:views:loadPage:finish", function() {

            clearTimeout(timeoutToken);
            APP.loader.hide();
        });
    }

    /**
     * Check wether we use native or HTML spinner based on APP.config.cordova
     * @method init
     */
    function init() {

        hasLoader = APP.dom.html.hasClass("has-loader") ? true : false;
        loaderText = APP.dom.pageLoader.find(".loader-text");

        attachListeners();
    }

    return {
        "init": init,
        "show": show,
        "hide": hide,
        "status": status
    };

})();

/**
 * Wrapper for doing an AJAX request
 * @author Jeroen Coumans
 * @class open
 * @namespace APP
 */
APP.open = (function () {

    // function variables
    var active,
        parent,
        child,
        modal;

    /**
     * This method is used to set or return the active URL. It's used for e.g. refreshing the current page
     * @method activeUrl
     * @param {String} [href] the URL that should be set to active
     * @return {String} the URL that is currently set to active
     **/
    function activeUrl(href) {
        if (href) {
            active = href;
        } else {
            return active;
        }
    }

    /**
     * @method parentUrl
     * @return {String} the URL that is loaded in the parent element
    */
    function parentUrl() { return parent; }

    /**
     * @method childUrl
     * @return {String} the URL that is loaded in the child element
    */
    function childUrl()  { return child;  }

    /**
     * @method modalUrl
     * @return {String} the URL that is loaded in the modal element
    */
    function modalUrl()  { return modal;  }

    /**
     * Do an AJAX request and insert it into a view. This method also maintains the URL's for each view, and sets the activeUrl to the called URL.
     * @method page
     * @param {String} url the URL to call
     * @param {HTMLElement} view what page to insert the content int (child, parent or modal)
     * @param {Boolean} [refresh] when set, the activeUrl will be downloaded again. You need to set this parameter if you want to explicitly refresh a page.
     * @param {Function} [callback] optional callback function that will be called when the AJAX call completes
     */
    function page(url, view, refresh, callback) {

        if (! url || ! view) return;

        // make sure to open the parent
        if (APP.views.hasChildPage() && view === APP.dom.parentView) {

            APP.views.openParentPage();
        }

        // variables
        var content = $(view).find(".js-content"),
            scrollPosition = content.get(0).scrollTop,
            timeoutToken = null,
            loaderText;

        // Set the URL of the view
        switch (view) {
            case APP.dom.parentView:
                parent = url;
                break;

            case APP.dom.childView:
                child = url;
                break;

            case APP.dom.modalView:
                modal = url;
                break;
        }

        // Prevent page load when opening the same URL
        if (active === url && ! refresh) {

            return false;
        } else {

            // Set the active url to the passed url
            active = url;
            content.empty();
        }

        if (refresh) {
            loaderText = "Refreshing...";
        } else {
            loaderText = "Loading...";
        }

        $.ajax({
            url: url,
            timeout: 7500,
            headers: { "X-PJAX": true },
            beforeSend: function() {
                APP.dom.doc.trigger("APP:views:loadPage:start");
            },
            success: function(response) {

                $(content).html(response);

                if (scrollPosition > 10) {
                    $.scrollElement($(content).get(0), 0);
                }
            },
            complete: function() {
                APP.dom.doc.trigger("APP:views:loadPage:finish");
            }
        });
    }

    /**
     * Checks what the active view is and then calls APP.open.page with its respective URL, view and refresh
     * @method refresh
     */
    function refresh() {

        // check wether to refresh child or parent page
        if (APP.views.hasChildPage()) {

            page(child, APP.dom.childView, true);

        } else if (APP.modal.status()) {

            page(modal, APP.dom.modalView, true);

        } else {

            page(parent, APP.dom.parentView, true);
        }
    }

    /**
     * Attach event listeners
     * @method attachListeners
     */
    function attachListeners() {

        // Open parent page
        APP.events.attachClickHandler(".action-refresh", function (event) {

            if (APP.alert.status) APP.alert.hide();
            refresh();
        });
    }

    /***
     * Attach listeners
     * @method init
     */
    function init() {

        attachListeners();
    }

    return {
        "init": init,
        "page": page,
        "refresh": refresh,
        "activeUrl": activeUrl,
        "parentUrl": parentUrl,
        "childUrl": childUrl,
        "modalUrl": modalUrl
    };

})();

/**
 * Module for dealing with modals
 * @author Jeroen Coumans
 * @class modal
 * @namespace APP
 */
APP.modal = (function () {

    // Variables
    var hasModalview;

    /**
     * Opens the modal view
     * @method show
     */
    function show() {

        if (APP.alert.status) APP.alert.hide();

        APP.dom.html.addClass("has-modalview");
        APP.dom.pageView.addClass("view-hidden");
        APP.dom.modalView.removeClass("view-hidden");
        APP.dom.modalView.addClass("active-view");
        hasModalview = true;
    }

    /**
     * Hides the modal view
     * @method hide
     */
    function hide() {

        APP.dom.html.removeClass("has-modalview");
        APP.dom.pageView.removeClass("view-hidden");
        APP.dom.modalView.addClass("view-hidden");
        APP.dom.modalView.removeClass("active-view");
        hasModalview = false;
    }

    /**
     * Returns the status of the modal view
     * @method status
     * @return {Boolean} wether modal view is shown or not
     */
    function status() {

        return hasModalview;
    }

    /**
     * Attach event listeners
     * @method attachListeners
     * @private
     */
    function attachListeners() {

        /*
         * Open modal
         * - if data-url is specified, it will be loaded into the modal content
         * - otherwise, if href has a URL, it will be loaded into the modal content
         * - if the action has text, it will be used as the title
         */
        APP.events.attachClickHandler(".action-show-modal", function (event) {

            var target = $(event.target).closest(".action-show-modal"),
                url = APP.util.getUrl(target),
                title = APP.util.getTitle(target);

            show();

            if (url) {
                APP.open.page(url, APP.dom.modalView);
            }

            if (title) {
                APP.dom.modalViewTitle.text(title);
            }
        });

        /*
         * Close modal
         */
        APP.events.attachClickHandler(".action-hide-modal", function () {

            hide();
        });
    }

    /**
     * Initialize variables and attach listeners
     * @method init
     */
    function init() {

        hasModalview = APP.dom.html.hasClass("has-modalview") ? true : false;

        attachListeners();
    }

    return {
        "init": init,
        "show": show,
        "hide": hide,
        "status": status
    };

})();

/**
 * Module for page navigation
 * @author Jeroen Coumans
 * @class nav
 * @namespace APP
 */
APP.nav = (function () {

    // Variables
    var navheight,
        bodyheight,
        hasNavigation;

    /**
     * Sets height of content based on height of navigation
     * @method setPageHeight
     * @private
     * @param {Integer} height the height to which the page must be set
     */
    function setPageHeight(height) {

        // if navigation is enabled, set the page height to navigation height
        APP.dom.viewport.height(height);
        APP.dom.pageView.height(height);
    }

    /**
     * Shows the navigation
     * @method show
     */
    function show() {

        APP.dom.html.addClass("has-navigation");

        if (!APP.config.webapp) {
            setPageHeight(navheight);
        }

        hasNavigation = true;
    }

    /**
     * Hides the navigation
     * @method hide
     */
    function hide() {

        // never hide on tablet
        if (APP.config.tablet) return;

        APP.dom.html.removeClass("has-navigation");

        if (!APP.config.webapp) {
            setPageHeight("");
        }

        hasNavigation = false;
    }

    /**
     * Returns the status of the navigation
     * @method status
     * @return {Boolean} wether the navigation is shown or hidden
     */
    function status() {

        return hasNavigation;
    }

    /**
     * Returns the active item
     * @method active
     * @param {HTMLElement} [elem] sets the HTMLElement to the active navigation element
     * @return {HTMLElement} the active navigation element
     */
    function setActive(elem) {

        if (elem) {

            APP.dom.pageNavActive.removeClass("active");
            APP.dom.pageNavActive = elem.addClass("active");
        }
    }


    /**
     * Attach event listeners
     * @method attachListeners
     * @private
     */
    function attachListeners() {

        // Menu button
        APP.events.attachClickHandler(".action-show-nav", function () {

            show();
        });

        // Hide menu when it's open
        APP.events.attachClickHandler(".action-hide-nav", function () {

            hide();
        });

        // page navigation
        APP.events.attachClickHandler(".action-nav-item", function (event) {

            var target  = $(event.target).closest(".action-nav-item"),
                url     = APP.util.getUrl(target),
                title   = APP.util.getTitle(target);

            setActive(target);
            hide();

            // If user selects the active element, or no URL is found, just close the menu
            if (target === APP.nav.pageNavActive || ! url) return;

            // set page title
            if (title) APP.dom.parentViewTitle.text(title);
            if (url) APP.open.page(url, APP.dom.parentView);
        });
    }

    /**
     * Initialize capabilities and attach listeners
     * - Sets the active navigation element
     * - Sets the navigation status based on the `has-navigation` class on the HTML element
     * @method init
     */
    function init() {

        hasNavigation = APP.dom.html.hasClass("has-navigation") ? true : false;

        bodyheight = $(window).height();
        navheight = APP.dom.pageNav.height();

        // make sure the navigation is as high as the page
        if (bodyheight > navheight) {
            navheight = bodyheight;
            APP.dom.pageNav.height(navheight);
        }

        attachListeners();
    }

    return {
        "init": init,
        "show": show,
        "hide": hide,
        "status": status,
        "setActive": setActive
    };

})();

/**
 * Module for revealing contet
 * @author Jeroen Coumans
 * @class reveal
 * @namespace APP
 */
APP.reveal = (function () {

    /**
     * Attach event listeners
     * @method attachListeners
     * @private
     */
    function attachListeners() {

        APP.events.attachClickHandler(".action-reveal", function (event) {

            var activeReveal,
                activeContent,
                targetContent,
                activeClass = 'active',
                activeClassSelector = '.' + activeClass,
                target  = $(event.target).closest(".action-reveal");

            if (!target) {
                return;
            }

            activeReveal = target.siblings(activeClassSelector);

            if (activeReveal) {
                activeReveal.removeClass(activeClass);
            }

            target.addClass(activeClass);

            targetContent = APP.util.getUrl(target);

            if (!targetContent) {
                return;
            }

            activeContent = $(targetContent).siblings(activeClassSelector);

            if (activeContent) {
                activeContent.removeClass("active");
            }

            $(targetContent).addClass(activeClass);

            // don't follow the link
            event.preventDefault();
        });
    }

    /***
     * Ataches listeners
     * @method init
     */
    function init() {

        attachListeners();
    }

    return {
        "init": init
    };

})();

/**
 * Module for doing search and autocomplete
 * @author Jeroen Coumans
 * @class search
 * @namespace APP
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

    /**
     * @method form
     * @return {HTMLElement} the search form
     */
    function form() {
        return searchForm;
    }

    /**
     * Does an AJAX post to a URL and inserts it into searchResult
     * @method loadResults
     * @param {String} URL the URL to post to
     * @private
     */
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
                APP.connection.setStatus("online");

                searchResult.html(response).show();
            },
            error: function(xhr, errorType, error){

                APP.connection.setStatus("offline");
            },
            complete: function() {

                clearTimeout(timeoutToken);
                APP.loader.hide();
            }
        });
    }

    /**
     * Calls loadResults with the searchText. If no query is given, it will check the value of searchInput and use that
     * @method doSearch
     * @param {String} [query] text that should be searched
     */
    function doSearch(query) {

        var searchText = query || searchInput.attr("value");

        if (searchText) {
            searchUrl = searchForm.attr("action") + "?" + searchInput.attr("name") + "=" + searchText;
            loadResults(searchUrl);
        }
    }

    /**
     * Attach event listeners
     * @method attachListeners
     */
    function attachListeners() {

        // Submit search form
        APP.events.attachClickHandler(".action-search-submit", function (event) {

            doSearch();
        });

        // Listen on keys pressed and every 1s, get the search results
        searchInput.on({
            "keyup": function() {
                APP.delay(function() {
                    doSearch();
                }, 1000);
            }
        });
    }

    /**
     * Initialize variables and attach listeners.
     *
     * Sets searchInput (`.action-search-input`), searchSubmit (`.action-search-submit`) and searchResult (`.js-search-results`) based on the searchForm
     * @method init
     * @param {String} [id="#search-form"] sets searchForm to the ID specified
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
/**
 * Provides methods for storing HTML documents offline
 * @author Jeroen Coumans
 * @class store
 * @namespace APP
 */
APP.store = (function() {

    var isLoading;

    /**
     * Loads an URL from localStorage.
     * @method showUrl
     * @param {String} url the URL that will be loaded. The URL is used as the key. The value will be parsed as JSON.
     * @param {Boolean} loaded wether or not to load silently (default) or show a loader when fetching the URL
     * @return {String} the value that was stored. Usually, this is raw HTML.
     */
    function showUrl(url, loader, callback) {

        if (! url) return;

        // set result
        var result = lscache.get(url);

        if (result) {

            callback(result);
        } else {

            if (loader) APP.loader.show();
            // console.log("Article wasn't stored, storing it now...");

            storeUrl(url, false, false, function(status) {

                // console.log("Article stored, calling showUrl again...");

                if (status === "success") {

                    if (loader) APP.loader.hide();
                    var result = lscache.get(url);

                    callback(result);
                } else {

                    APP.alert.show("Couldn't load article");
                }
            });
        }
    }

    /**
     * Does an AJAX call to URL and stores it with the URL as the key
     * @method storeUrl
     * @param {String} url the URL to be stored
     * @param {Boolean} [absolute] if false, the server will be prefixed to URL's
     * @param {Integer} [expiration=365*24*60] after how long should the stored URL expire. Set in minutes, defaults to 1 year.
     * @param {Function} [callback] callback function when the AJAX call is complete
    */
    function storeUrl(url, absolute, expiration, callback) {

        if (! url || lscache.get(url)) return;

        var expire = expiration ? expiration : 365*24*60,
            request = absolute ? url : APP.config.server + url;

        $.ajax({
            url: request,
            timeout: 20000,
            global: false, // don't fire off global AJAX events, we want to load in the background
            headers: { "X-PJAX": true },
            beforeSend: function() {

                isLoading = true;
            },
            success: function(response) {

                lscache.set(url, response, expire);
            },
            complete: function(xhr,status) {

                isLoading = false;

                if ($.isFunction(callback)) callback(status);
            }
        });
    }

    /**
     * Wrapper around storeUrl to store an array of URLs
     * @method storeUrlList
     * @param {Array} list an array of URL's
     * @param {Boolean} [absolute] if false, the server will be prefixed to URL's
     * @param {Integer} [expiration=365*24*60] after how long should the stored URL expire. Set in minutes, defaults to 1 year.
     * @param {Function} [callback] callback function when the AJAX call is complete
     */
    function storeUrlList(list, absolute, expiration, callback) {

        if (! list) return;

        // TODO: show progress meter
        // var loaded = 0;

        $(list).each(function(index, item) {

            storeUrl(item, absolute, expiration, function(status) {
                if (status === "success") {
                    // loaded++;
                    // var loadedPercentage = Math.round(loaded / list.length * 100) + "%";
                    // console.log(loadedPercentage);
                } else {
                    // console.log(status);
                }
            });
        });

        if ($.isFunction(callback)) callback();
    }

    /**
     * Initialize variables and settings
     * @method init
     */
    function init() {

        isLoading = false;
    }

    return {
        "init": init,
        "loading": isLoading,
        "storeUrl": storeUrl,
        "storeUrlList": storeUrlList,
        "showUrl": showUrl
    };

})();

/*jshint latedef:true, undef:true, unused:true boss:true */
/*global APP, $, Swipe, document */

/**
 * Module for setting up swipe.js
 */
APP.slideshow = (function () {

    var slideShow,
        slideShowDotsWrapper,
        slideShowDotsItems;

    function prev() {

        if (slideShow) {
            slideShow.prev();
        }
    }

    function next() {

        if (slideShow) {
            slideShow.next();
        }
    }

    function slide(index) {

        if (slideShow) {
            slideShow.slide(index, 300);
        }
    }

    /**
     * Attach event listeners
     */
    function attachListeners() {

        APP.events.attachClickHandler(".action-slideshow-next", function () {
            slideShow.next();
        });

    }

    function init(id) {

        slideShowDotsWrapper = $('<div class="slideshow-dots"></div>');

        slideShow = new Swipe(document.getElementById(id), {
            startSlide: 0,
            speed: 300,
            continuous: true,
            disableScroll: false,
            callback: function (index, item) {
                slideShowDotsWrapper.find(".active").removeClass("active");
                $(slideShowDotsItems[index]).addClass("active");
                var img = $(item).find(".js-slideshow-media");
                if (img) img.attr("src", img.data("src"));
            }
        });

        // generate dots
        for (var i=0;i<slideShow.length;i++) {
            slideShowDotsWrapper.append($('<div class="slideshow-dot"></div>'));
        }

        slideShowDotsItems = slideShowDotsWrapper.find(".slideshow-dot");

        // set first to active
        slideShowDotsItems.first().addClass("active");

        // insert after the swipe container
        slideShowDotsWrapper.insertAfter(slideShow.container);

        attachListeners();
    }

    return {
        "init": init,
        "prev": prev,
        "next": next,
        "slide": slide
    };
})();

/**
 * Module for using tabs
 * @author Jeroen Coumans
 * @class tabs
 * @namespace APP
 */
APP.tabs = (function () {

    // Variables
    var hasTabs;

    /**
     * Shows the tabs
     * @method show
     */
    function show() {

        APP.dom.html.addClass("has-tabs");
        APP.dom.pageTabs.show();
        hasTabs = true;
    }

    /**
     * Hides the tabs
     * @method hide
     */
    function hide() {

        APP.dom.html.removeClass("has-tabs");
        APP.dom.pageTabs.hide();
        hasTabs = false;
    }

    /**
     * Wether the tabs are shown or not
     * @method status
     * @return {Boolean} true when shown, false when hidden
     */
    function status() {

        return hasTabs;
    }

    /**
     * Sets or returns the active tab item. NOTE: this only sets the `active` class on the tab item!
     *
     * @method active
     * @param {HTMLElement} [elem] set the active tab item
     * @return {HTMLElement} the active tab item
     */

    function setActive(elem) {

        if (elem) {

            APP.dom.pageTabActive.removeClass("active");
            APP.dom.pageTabActive = elem.addClass("active");
        }
    }

    /**
     * Attach event listeners
     * @method attachListeners
     * @private
     */
    function attachListeners() {

        APP.events.attachClickHandler(".action-tab-item", function (event) {

            var target = $(event.target).closest(".action-tab-item"),
                url = APP.util.getUrl(target);

            if (target === APP.dom.pageTabActive) {

                return true;
            }

            if (url) {

                setActive(target);
                APP.open.page(url, APP.dom.parentView);
            }
        });
    }

    /***
     * Initialize variables and attach listeners
     * @method init
     */
    function init() {

        hasTabs = APP.dom.html.hasClass("has-tabs") ? true : false;

        attachListeners();
    }

    return {
        "init": init,
        "show": show,
        "hide": hide,
        "status": status,
        "setActive": setActive
    };

})();

/**
 * Module for handling views
 * @author Jeroen Coumans
 * @class views
 * @namespace APP
 */
APP.views = (function () {

    // Variables
    var hasChild;

    /**
     * Returns wether the childview is active or not
     * @method hasChildPage
     * @return {Boolean} true if childPage is active, false if parentView is active
     */
    function hasChildPage() {

        return hasChild;
    }

    /**
     * Opens child page
     * @method openChildPage
     * @param {String} [url] will call APP.open.page to do an AJAX request to URL and open it in the `.js-content` of childView
     * @param {String} [title] will set the title of the childView in the `.js-title` element
     */
    function openChildPage(url, title) {

        if (APP.alert.status) APP.alert.hide();

        // go forward when called from parent page
        if (! hasChild) {
            APP.dom.html.addClass("childview-in");
            APP.dom.childView.removeClass("view-hidden").addClass("active-view");
            APP.dom.parentView.addClass("view-hidden").removeClass("active-view");

            // execute after animation timeout
            APP.delay(function() {
                APP.dom.html.addClass("has-childview");
                APP.dom.html.removeClass("childview-in");
            }, 300);
        }

        // load URL
        if (url) {

            APP.dom.childViewTitle.html("");
            APP.open.page(url, APP.dom.childView);
        }

        // set title
        if (title) {
            APP.dom.childViewTitle.text(title);
        }

        hasChild = true;
    }

    /**
     * Opens parent page. If a childView is active, first go back to the parentView.
     * @method openParentPage
     * @param {String} [url] will call APP.open.page to do an AJAX request to URL and open it in the `.js-content` of parentView
     * @param {String} [title] will set the title of the parentView in the `.js-title` element
     */
    function openParentPage(url, title) {

        if (APP.alert.status) APP.alert.hide();

        // go back when called from child page
        if (hasChild) {
            APP.dom.html.addClass("childview-out");
            APP.dom.childView.addClass("view-hidden").removeClass("active-view");
            APP.dom.parentView.removeClass("view-hidden").addClass("active-view");

            // execute after animation timeout
            APP.delay(function() {
                APP.dom.html.removeClass("has-childview childview-out");
            }, 300);
        }

        // load URL
        if (url) {
            APP.open.page(url, APP.dom.parentView);
        }

        // set title
        if (title) {
            APP.dom.parentViewTitle.text(title);
        }

        hasChild = false;
    }

    /**
     * Attach event listeners
     * @method attachListeners
     * @private
     */
    function attachListeners() {

        // Open parent page
        APP.events.attachClickHandler(".action-pop", function (event) {

            /*
             *  Stop loader if one was already being displayed,
             *  e.g. by going navigating while the previous AJAX call wass not finished
            */
            if (APP.loader.status()) {
                APP.loader.hide();
            }

            var target = $(event.target).closest(".action-pop"),
                title = APP.util.getTitle(target),
                url = APP.util.getUrl(target);

            if (url) {

                openParentPage(url, title);
            } else {

                // update the active url manually since this action often doesn't use a URL
                APP.open.activeUrl(APP.open.parentUrl());

                openParentPage();
            }
        });

        // Open child page
        APP.events.attachClickHandler(".action-push", function (event) {

            var target = $(event.target).closest(".action-push"),
                title = APP.util.getTitle(target),
                url = APP.util.getUrl(target);

            if (url) {

                openChildPage(url, title);
            } else {

                openChildPage();
            }
        });
    }

    /***
     * Initialize variables and attach listeners. Sets the status of hasChildPage to true if the `html` element has the `.has-childview` class
     * @method init
     */
    function init() {

        hasChild = APP.dom.html.hasClass("has-childview") ? true : false;

        attachListeners();
    }

    return {
        "init": init,
        "openChildPage": openChildPage,
        "openParentPage": openParentPage,
        "hasChildPage": hasChildPage
    };

})();

/**
 * Controls global alerts
 * @author Jeroen Coumans
 * @class alert
 * @namespace APP
 */
APP.alert = (function () {

    var hasAlert;

    /**
     * Show alert
     * @method show
     * @param {String} msg the message of the alert
     */
    function show(msg) {

        if (msg) {
            APP.dom.pageAlert.html(msg);
            APP.dom.pageAlert.show();
            hasAlert = true;
        }
    }

    /**
     * Hide alert
     * @method hide
     */
    function hide() {

        APP.dom.pageAlert.hide();
        hasAlert = false;
    }

    /**
     * Status of alert
     * @method status
     * @return {Boolean} true when alert is displayed, false when alert is hidden
     */
    function status() {

        return hasAlert;
    }

    /**
     * Attach event listeners
     * @method attachListeners
     * @private
     */
    function attachListeners() {

        // Calls hide() when .action-hide-alert is clicked
        APP.events.attachClickHandler(".action-hide-alert", function () {

            hide();
        });
    }

    /**
     * Initialize variables and attach listeners
     * @method init
     */
    function init() {

        // assign variables
        hasAlert = false;

        attachListeners();
    }

    return {
        "init": init,
        "show": show,
        "hide": hide,
        "status": status
    };

})();

/*jshint latedef:true, undef:true, unused:true boss:true */
/*global APP */

/**
 * Core module for initializing capabilities and modules
 * @author Jeroen Coumans
 * @class core
 * @namespace APP
 */
APP.core = (function () {

    /**
     * Initialize variables and attach listeners
     * @method init
     */
    function init(params) {

        APP.config.init(params);
        APP.events.init();

        // needs to come first so we're "online"
        APP.connection.init();
        APP.loader.init();
        APP.open.init();
        APP.nav.init();
        APP.modal.init();
        APP.reveal.init();
        APP.store.init(params);
        APP.tabs.init();
        APP.views.init();
        APP.alert.init();

        if (APP.config.offline) APP.store.init();
        if (APP.config.cordova) APP.phone.init();
    }

    return {
        "init": init
    };

})();
