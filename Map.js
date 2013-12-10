define(['jquery', "util/smartResize"], function($, smartresize) {

    /**
     * Bing Map
     *
     * @class
     */
    var Map = function(element, params) {

        var opts = $.extend({
            API_KEY: "ADD_API_KEY",
            zoom: 7,
            width: 600,
            height: 600,
            center: [40.702880, -73.990655],
            showScalebar: false,
            disableBirdseye: true,
            autoResize: false,
            showCopyright: false,
            disableUserInput: false,
            showDashboard: true,
            showMapTypeSelector: false,
            theme: 'Microsoft.Maps.Themes.BingTheme',
            enableSearchLogo: false,
            mapType: Microsoft.Maps.MapTypeId.road,
            pinIcon: {
                icon: "/assets/img/global/bing-map-pin-dark.png",
                width: 33,
                height: 48
            },
            pinIconHover: {
                icon: "/assets/img/dealer-locator/icon-marker-gold-hightlighted.png",
                width: 33,
                height: 48
            },
            pinIconCurrentLocation: {
                icon: "/assets/img/dealer-locator/icon-marker-current-location.png",
                width: 103,
                height: 103
            },
            pins: [],
            onResize: function() {},
            onReady: function() {},
            onGeoLocationReady: function() {}
        }, params),
            $win = $(window),
            map,
            locations = [],
            microsoftMap,
            infobox,
            self = this,
            el = element,
            elParent = $(el).parent();

        /**
         * Initialize Module, wait for Map Theme callback
         */

        function init() {
            Microsoft.Maps.loadModule(opts.theme, {
                callback: initMap
            });
        }

        /**
         * Initialze the Map
         */

        function initMap() {
            bindEvents();
            create();
            //getGeoLocation();
            addPins(opts.pins);
            initInfoBox();
        }

        /**
         * Create the Map
         */

        function create() {

            map = new Microsoft.Maps.Map(el, {
                credentials: opts.API_KEY,
                center: new Microsoft.Maps.Location(opts.center[0], opts.center[1]),
                mapTypeId: opts.mapType,
                zoom: opts.zoom,
                width: opts.width,
                disableUserInput: opts.disableUserInput,
                height: opts.height,
                showScalebar: opts.showScalebar,
                disableBirdseye: opts.disableBirdseye,
                showCopyright: opts.showCopyright,
                showMapTypeSelector: opts.showMapTypeSelector,
                enableSearchLogo: opts.enableSearchLogo,
                theme: new Microsoft.Maps.Themes.BingTheme()
            });


            //get a reference to the newly created map
            if (map !== undefined) {
                microsoftMap = $(el).find(".MicrosoftMap");
            }

            if (opts.autoResize) autoResize();

        }

        /**
         * Bind Events
         */

        function bindEvents() {
            $win.smartresize(function() {
                opts.onResize.call(self);

                if (opts.autoResize) autoResize();

            });
        }

        /**
         * Reset Map
         */

        function reset() {
            removePins();
            //getGeoLocation();
        }

        /**
         * Auto Resize based on Parent Element
         */

        function autoResize() {
            setDimensions(elParent.width(), elParent.height());
        }

        /**
         * Set Dimensions
         */

        function setDimensions(width, height) {
            if (width !== "") {
                //console.log(width);
                //$(el).width(1204);
                // microsoftMap.css({
                //     width: width
                // });

                map.setView({
                    width: width
                });
            }

            if (height !== "") {
                //$(el).width(height);
                //microsoftMap.height(height);

                map.setView({
                    height: height
                });
            }
        }

        /**
         * Get Location
         */

        /*function getGeoLocation() {
            if (Modernizr.geolocation) {
                var geoLocationProvider = new Microsoft.Maps.GeoLocationProvider(map);
                geoLocationProvider.getCurrentPosition({
                    successCallback: onGeoLocationPositionReady,
                    errorCallback: onGeoLocationPositionError
                });
                opts.onGeoLocationReady.call(this);
            } else {
                console.log("no geolocation support");
            }

            function onGeoLocationPositionReady(location) {
                var position = location.position.coords;
                var loc = [position.latitude, position.longitude];

                setZoom(15);
                /*map.setView({
                    zoom: 2,
                    center: loc
                });
				

               geoLocationProvider.addAccuracyCircle(loc, 1000, 1000, {
                    polygonOptions: {
                        strokeThickness: 1,
                        fillColor: new Microsoft.Maps.Color(200, 255, 128, 0)
                    }
                }); 
	
                //setCenter(loc);
                //setZoom(opts.Zoom);
            }

            function onGeoLocationPositionError() {
                console.log("error retrieving geo location");
            }

        }*/

        /**
         * Set the Map Zoom level
         */

        function setZoom(zoom) {
            map.setView({
                zoom: zoom
            });
        }

        /**
         * Set the Map center point
         */

        function setCenter(location) {
            var center = new Microsoft.Maps.Location(location[0], location[1]);
            map.setView({
                center: center
            });
        }

        /**
         * Calculate the best viewport based on the number of markers
         */

        function setBestView() {
            var bestview = Microsoft.Maps.LocationRect.fromLocations(locations);
            map.setView({
                bounds: bestview
            });
        }


        /**
         * Init Info Box
         */

        function initInfoBox() {
            infobox = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(0, 0), {
                visible: false,
                offset: new Microsoft.Maps.Point(10, 20),
                height: 300,
                showCloseButton: true
            });
            map.entities.push(infobox);
        }

        /**
         * Show Info Box
         */

        function displayInfobox(e) {
            infobox.setLocation(e.target.getLocation());
            infobox.setOptions({
                visible: true,
                title: e.target.Title,
                description: e.target.Description
            });
        }

        /**
         * Hide Info Box
         */

        function hideInfoBox(e) {
            if (infobox !== null) {
                infobox.setOptions({
                    visible: false
                });
            }
        }

        /**
         * Add Multiple Pins to the Map
         */

        function addPins(locations) {

            if (locations.length === 0) return;

            locations.forEach(function(location) {
                addPin(location);
            });

            setBestView();
        }

        /**	
         * Add Single Pin to the Map
         */

        function addPin(location) {
            var loc = new Microsoft.Maps.Location(location.lat, location.lng);
            var pin = new Microsoft.Maps.Pushpin(loc, {
                icon: opts.pinIcon.icon,
                height: opts.pinIcon.height,
                width: opts.pinIcon.width,
                typeName: "dealer-" + location.dealerId
            });
            pin.Title = location.dealerName;
            map.entities.push(pin);
            locations.push(loc); //add loc to temp array to calculate the best view

            Microsoft.Maps.Events.addHandler(pin, 'mouseover', pinMouseOver);
            Microsoft.Maps.Events.addHandler(pin, 'mouseout', pinMouseOut);
            Microsoft.Maps.Events.addHandler(pin, 'click', displayInfobox);

        }

        /**
         * Push Pin Mouseover
         */

        function pinMouseOver(e) {
            e.target._icon = opts.pinIconHover.icon;
        }

        /**
         * Push Pin Mouseout
         */

        function pinMouseOut(e) {
            e.target._icon = opts.pinIcon.icon;
        }

        /**
         * Highlight Pin based on Pin ID
         */

        function highlightPin(id) {
            microsoftMap.find(".dealer-" + id).find("img").attr("src", opts.pinIconHover.icon);
        }

        /**
         * Remove Highlight State from Pin
         */

        function unHighlightPin(id) {
            microsoftMap.find(".dealer-" + id).find("img").attr("src", opts.pinIcon.icon);
        }

        /**
         * Remove all Pins
         */

        function removePins() {
            locations = [];

            for (var i = map.entities.getLength() - 1; i >= 0; i--) {
                var pushpin = map.entities.get(i);
                if (pushpin instanceof Microsoft.Maps.Pushpin && pushpin._typeName !== "current-location") {
                    map.entities.removeAt(i);
                }
            }
        }

        init();

        return {
            setDimensions: setDimensions,
            setZoom: setZoom,
            addPins: addPins,
            removePins: removePins,
            setCenter: setCenter,
            reset: reset,
            highlightPin: highlightPin,
            unHighlightPin: unHighlightPin
        };

    };

    return Map;
});
Window size: x 
Viewport size: x