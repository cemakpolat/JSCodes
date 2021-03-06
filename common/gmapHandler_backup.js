/*TODO:
 Settings buttons für meldedaten


 */

//console.log("gmapHandler.js is called");


var geocoder;


//extend the googleMaps Marker with a MarkerMenu
google.maps.Marker.prototype.markerMenu = null;
google.maps.Marker.prototype.infoWindow = new google.maps.InfoWindow();//google.maps.infoWindow

//gmap infowindow zIndex increased when render a new gmap infowindow to render the next infowindow above the old
var infoWindowMaxZIndex = 1000;

function Position(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
};

function Vehicle(type, latitude, longitude, address, licensePlate, name) {
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude,longitude),
        draggable : true,
        title: utils.toUTF8(name) + "\n" + licensePlate + "\n\n" + utils.toUTF8(address)
    });
    this.marker.setMap(rpMap);
    this.oldLat = latitude;
    this.oldLng = longitude;
    this.type = type;
    this.name = name;
    this.address = address;
    this.licensePlate = licensePlate;

};



//function ToggleVehicleControl(controlDiv) {
//
//    // Set CSS styles for the DIV containing the control
//    // Setting padding to 5 px will offset the control
//    // from the edge of the map.
//    controlDiv.style.padding = '7px';
//
//    // Set CSS for the control border.
//    var controlUI = document.createElement('div');
//    controlUI.style.backgroundColor = 'white';
//    // controlUI.style.borderStyle = 'inset';
//    // controlUI.style.borderWidth = '2px';
//    controlUI.style.cursor = 'pointer';
//    controlUI.style.textAlign = 'center';
//    controlUI.title = 'Click to set the map to Home';
//    controlDiv.appendChild(controlUI);
//
//    // Set CSS for the control interior.
//    var controlText = document.createElement('div');
//    controlText.style.fontFamily = 'Arial,sans-serif';
//    controlText.style.fontSize = '11px';
//    controlText.style.paddingTop = '2px';
//    controlText.style.paddingLeft = '4px';
//    controlText.style.paddingRight = '4px';
//    controlText.style.boxShadow = "0px 0px 3px #888";
//    controlText.innerHTML = '<strong>Vehicles</strong>';
//    controlUI.appendChild(controlText);
//
//    //controlText.style = google.maps.MapTypeControlStyle.DEFAULT;
//    // Setup the click event listeners: simply set the map to Chicago.
//    google.maps.event.addDomListener(controlUI, 'click', function() {
//
//        if (vehicles.length > 0){
//            //console.log(vehicles[0].marker.map);
//            if (vehicles[0].marker.map == null){
//                for (idx in vehicles){
//                    vehicles[idx].marker.setMap(rpMap);
//                }
//            }
//            else{
//                for (idx in vehicles){
//                    vehicles[idx].marker.setMap(null);
//                }
//            }
//        }
//    });
//};


/**
 * This is a target Object representing a target with position, address, time and its representation
 * @constructor
 * @author Cem Akpolat
 */
function Target(){
    this.position=new Position(0,0);
    this.address=null;
    this.selectedTime=null;
    this.selectedDate=null;
    this.startPoint=false;
    this.targetNumber=null;// ? there could be no need for that
    this.travelDirection=null;
    this.setAddress=function(address){
        this.address=address;
    };
    this.getAddress=function(){
        return this.address;
    };
    this.setPosition=function(pos){
        this.position=pos;
    };
    this.getPosition=function(){
        return this.position;
    };
    this.setSelectedTime=function(time){
        this.selectedTime=time;
    };
    this.setSelectedDate=function(date){
        this.selectedDate=date;
    };
    this.setTravelDirection=function(direction){
        this.travelDirection=direction;
    };
    this.setTargetNumber=function(num){
        this.targetNumber=num;
    };
    this.showMarkerInfoWindow = (function(target){
        return function(){
            gmapHandler.showInfoWindow2(target);
        }
    })(this);

    this.updateMarkerInfoWindow = (function(target){
        return function(){
            if(target.marker.infoWindow.getContent() != null){
                //   gmapHandler.showInfoWindow(target);
            }
        }
    })(this);

};

///////////////////// TARGET LIST /////////////

//Array containing all targets
var targetList = new Array();
targetList.polyline = {};
targetList.polyline.polylineArray = new Array();
targetList.polyline.polyPath =  new google.maps.Polyline();
//clears current Polyline and draws new one
targetList.polyline.drawPolyline = function(){
    /*	targetList.polyline.polyPath.setMap(null);
     targetList.polyline.polylineArray = new Array();
     for(var i = 0; i < targetList.length; i++){
     var x = targetList[i];
     var coord = new google.maps.LatLng(x.position.latitude, x.position.longitude);
     targetList.polyline.polylineArray.push(coord);
     }
     targetList.polyline.polyPath = new google.maps.Polyline({
     path: targetList.polyline.polylineArray,
     strokeColor: "#B84DFF",
     strokeOpacity: 0.8,
     strokeWeight: 2
     });

     targetList.polyline.polyPath.setMap(map);*/ //TODO currently hidden, as polyline drawing is not just done between targets
};
targetList.redrawMarkers=function(){
    //clear all markers
    for(var i=0;i<markers.length;i++){
        if (markers[i] != null) {
            markers[i].setMap(null);
        }
    }
    markers.length=0;
    if(uiUtilities.xs()){
        var previous=new Target();
        var markerNumber=1;
        for(var i=0;i<this.length;i++){
            if(!this.compareTargets(previous,this[i])) {
                this.addMarker(this[i], markerNumber); // old code was only this line
                previous=this[i];
                markerNumber++;
            }
        }
    }else{
        for(var i=0;i<this.length;i++){
            this.addMarker(this[i],i+1); // old code was only this line
        }
    }
};
targetList.compareTargets=function(target1,target2){
    var result=false;
    if (target1.getPosition().latitude==target2.getPosition().latitude &&
        target1.getPosition().longitude==target2.getPosition().longitude) {
        result=true;
    }
    return result;
}
targetList.addMarker=function(target,markerNumber){
    if (target.marker != null ) {
        target.marker =  null;
    };
        var icon = appContext+ "/images/markerIcons/POIs/POI-"+markerNumber+".png";
    //var icon = appContext+ "/images/markerIcons/POIs/POI-"+target.targetNumber+".png";

    //create new marker
    var marker = new google.maps.Marker({
        position : new google.maps.LatLng(target.position.latitude, target.position.longitude),
        map : rpMap,
        draggable : true,
        icon: icon,
//        animation: google.maps.Animation, // for animating
        title : target.address
    });


    markers.push(marker);           //add the marker to the marker array
    target.marker = marker;

    //rightclick listener for menu : used for the created marker
    google.maps.event.addListener(target.marker, 'rightclick', function(result) {
        gmapHandler.showMarkerMenu(result.latLng, target);
    });

    var currentTarget = target;
    //show the information for the marker with the click event
    google.maps.event.addListener(target.marker, 'click', function(result) {
        currentTarget.showMarkerInfoWindow();
    });

    // During dragging, change the place of the marker
    google.maps.event.addListener(target.marker, 'drag', function(evt) {
         console.info("DRAG");
        var pos = new Position(evt.latLng.lat(), evt.latLng.lng());
    });

    //draglistener once the dragging is ended, then this event is operated.
    google.maps.event.addListener(target.marker, 'dragend', function(evt) {
        var pos = new Position(evt.latLng.lat(), evt.latLng.lng());
        var possibleClone=targetList[currentTarget.targetNumber];
        //console.log(targetList[currentTarget.targetNumber].address+" "+targetList[currentTarget.targetNumber-1].address+" ");
        var state=false;
        if(uiUtilities.xs() ){
            if(currentTarget.startPoint==false) {
               //console.log("start point ");
               if (targetList.length > 2 && (typeof possibleClone !== undefined)) {
                    if (targetList.compareTargets(currentTarget, possibleClone)) {
                        possibleClone.setPosition(pos);
                        state=true;
                    }
                }
            }
        }
        currentTarget.setPosition(pos);
        gmapHandler.geocodeLatLng(function(address){
            currentTarget.setAddress(address);
            if(uiUtilities.xs() && state==true) {
                possibleClone.setAddress(address);
            }
            uiRoutePlanner.redrawTargets(targetList);                  // redraw the table on the uiHandler side.
            targetList.redrawMarkers();
        }, pos,0);

    });
    // the markers are automatically zoomed according to the maps except that there is only a marker.
    if(markers.length>1){
        var fullBounds = new google.maps.LatLngBounds();
        for(var i=0;i<markers.length;i++){
            //var point=new google.maps.LatLng(lat,long);
            fullBounds.extend(markers[i].position);
        }
        rpMap.fitBounds(fullBounds);
    }
};
// Resultview Map
targetList.redrawMarkersForResultView=function(){

    //clear all markers
    for(var i=0;i<markers.length;i++){
        if (markers[i] != null) {
            markers[i].setMap(null);
        }
    }
    markers.length=0;
    if(uiUtilities.xs()){
        var previous=new Target();
        var markerNumber=1;
        for(var i=0;i<this.length;i++){
            if(!this.compareTargets(previous,this[i])) {
                this.addMarkerForResultView(this[i], markerNumber); // old code was only this line
                previous=this[i];
                markerNumber++;
            }
        }
    }else{
        for(var i=0;i<this.length;i++){
            this.addMarkerForResultView(this[i],i+1); // old code was only this line
        }
    }
};
// Resultview Map
targetList.addMarkerForResultView=function(target,markerNumber){
    if (target.marker != null ) {
        target.marker =  null;
    };
    var icon = appContext+ "/images/markerIcons/POIs/POI-"+markerNumber+".png";

    //create new marker
    var marker = new google.maps.Marker({
        position : new google.maps.LatLng(target.position.latitude, target.position.longitude),
        map : rvMap,
        icon: icon,
        title : target.address
    });

    markers.push(marker);           //add the marker to the marker array
    target.marker = marker;

    // the markers are automatically zoomed according to the maps except that there is only a marker.
    if(markers.length>1){
        var fullBounds = new google.maps.LatLngBounds();
        for(var i=0;i<markers.length;i++){
            fullBounds.extend(markers[i].position);
        }
        rvMap.fitBounds(fullBounds);
    }
};

//adding a handler to pop function//currently not used
targetList.pop = function() {
    var target = arguments[0];
    return Array.prototype.pop.apply(this, arguments);
};
targetList.getTargetByNumber=function(targetNumber){
    for(var i=0;i<targetList.length;i++){
        if(targetList[i].targetNumber==targetNumber){
            return targetList[i];
        }
    }
    return null;
}
targetList.getIndexByTargetNumber=function(targetNumber){
    for(var i=0;i<targetList.length;i++){
        if(targetList[i].targetNumber==targetNumber){
            return i;
        }
    }
    return null;
}

targetList.contains=function(target){
    var index = $.inArray(target,this);
    if(index != -1){
        return true;
    };
    return false;
};
targetList.removeTarget = function(target){
    var index = $.inArray(target,this);
    if(index != -1){
        this.splice(index,1);//remove item from array
    };
    uiRoutePlanner.redrawTargets(this);                  // redraw the table on the uiHandler side.
    this.redrawMarkers();                           // redraw the markers on the google map.
};

targetList.push = function() {
    //console.warn("TARGET LIST push: "+targetList.length);
    var target = arguments[0];                      // get the added objects through arguments array;
    Array.prototype.push.apply(this, arguments);    // add the item to the list

    //list updated, the gui should be redrawn!
    if(!requestFromIRAEnabled){ // TODO: Check IRA REQUEST FROM
        uiRoutePlanner.redrawTargets(this);                  // redraw the table on the uiHandler side.
        this.redrawMarkers();                           // redraw the markers on the google map.
    }
   // requestFromIRAEnabled=false;
    // TODO: This variable indicates whether there is any request from IRA or not, if the request comes, the route won't be drawn due to the google map crash.
    return;
};

//////////////// LONG PRESS EVENT FOR GOOGLE MAP
// For Long press event

function LongPress(map, length) {
    this.length_ = length;
    var me = this;
    me.map_ = map;
    me.timeoutId_ = null;
    google.maps.event.addListener(map, 'mousedown', function(e) {
        me.onMouseDown_(e);
    });
    google.maps.event.addListener(map, 'mouseup', function(e) {
        me.onMouseUp_(e);
    });
    google.maps.event.addListener(map, 'drag', function(e) {
        me.onMapDrag_(e);
    });
};

LongPress.prototype.onMouseUp_ = function(e) {
    clearTimeout(this.timeoutId_);
};

LongPress.prototype.onMouseDown_ = function(e) {
    clearTimeout(this.timeoutId_);
    var map = this.map_;
    var event = e;
    this.timeoutId_ = setTimeout(function() {
        google.maps.event.trigger(map, 'longpress', event);
    }, this.length_);
};

LongPress.prototype.onMapDrag_ = function(e) {
    clearTimeout(this.timeoutId_);
};

//////////////// END OF LONG PRESS EVENT FOR GOOGLE MAP

// this is the gmap object
var rpMap;
// needed to convert pixeldata to latLng and vice versa
var overlay;

// list of all polylines on the map
var gmapPolylines;
// list of all markers (non-target) on the map
var markers;
//collection of functions needed to render menus windows and markers on map

/**
 *
 *
 *@namespace
 * @author Cem Akpolat
 */
var gmapHandler = {

    initForUserProfil:function(){
        geocoder = new google.maps.Geocoder;
    },
    init : function() {
        geocoder = new google.maps.Geocoder;

        $("#map_canvas").css({
            "width" : "100%",
            "height" : "100%"
        });

        var mapOptions = {
            zoom : 14,
            center : new google.maps.LatLng(52.5122315, 13.3271348000000),
            mapTypeId : google.maps.MapTypeId.ROADMAP,
            scrollwheel:true

        };

        rpMap = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
        new LongPress(rpMap, 500); // enable here the long press
        this.initMapContextMenu(rpMap);
        google.maps.event.trigger(rpMap, 'resize');

        gmapPolylines = new Array();
        markers = new Array();

        overlay = new google.maps.OverlayView();
        overlay.draw = function() {
        };
        overlay.setMap(rpMap);

        google.maps.event.addListener(rpMap, 'zoom_changed', function(e){
            gmapHandler.removeMenus();
        });
       // map.setOptions({'scrollwheel': false});

        // Create the DIV to hold the control and call the ToggleVehicleControl() constructor
        // passing in this DIV.

//        var toggleVehicleControlDiv = document.createElement('div');
//        var toggleVehicleControl = new ToggleVehicleControl(toggleVehicleControlDiv);
//
//        toggleVehicleControlDiv.index = 1;
//        rpMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(toggleVehicleControlDiv);

        var autocompleteOptions = {
            componentRestrictions: {country: 'de'}
        };


        var autocomplete_new1 = new google.maps.places.Autocomplete($("#startPlace")[0],autocompleteOptions);
        var autocomplete_new2 = new google.maps.places.Autocomplete($("#endPlace")[0],autocompleteOptions);

        //GEO LOCATION FOR HTML 5  TODO: For finding current location
        //google.maps.event.addDomListener(window, 'load', initialize);
        // googleApiHandler.callPeriodicallyCalendars();// TODO: Sending periodically request to Google for getting information from google calendar

    },

    /**
     * add Location through current position button
     * @param errorFlag
     */
    addLocationByCPBtnForUP:function(elem,btn,callback){

        gmapHandler.getCurrentLocation(function(pos){
            gmapHandler.geocodeLatLng(function(address){
                console.debug("Address",address);
                elem.val(address);
                btn.button('reset');
                btn.addClass('icon-cur-pos');
                if(callback!="undefined"){
                    callback({lat:pos.lat(),lng:pos.lng()});
                }
            }, 	new Position(pos.lat(), pos.lng()),0);
        });
    },
    getPositionForUP:function(address,callback){
        geocoder.geocode({
            'address' : address
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var latlng = results[0].geometry.location;
                if(results[0].formatted_address){
                    console.debug("Address", latlng );
                    console.debug("formatted address",  results[0].formatted_address );
                    callback({lat:latlng.lat(),lng:latlng.lng()});
                }
                else{callback(false);}
            } else {
                 callback(false);
            }
        });
    },
    addLocationByCPBtn:function(btn){

        gmapHandler.getCurrentLocation(function(pos){
        //console.log("CONSOLE: My Current Position -> "+pos.latitude+" "+pos.longitude);
            var target=targetList[targetList.length-1];//targetList[index_lastAssignedTime];
            if(typeof target!= 'undefined') {
                //console.log("btn_add_cur_pos called");
                if(target.startPoint==true){
                    var _date = new Date(target.selectedDate);
                    _date.setMinutes(_date.getMinutes() + 30);
                    gmapHandler.addTargetFromMapMenu(pos, _date, js_rp_timeFrom, "");
                }else{
                    var cloneTarget=new Target();
                    cloneTarget.setPosition(target.getPosition());
                    cloneTarget.setAddress(target.getAddress());
                    cloneTarget.setSelectedTime(target.selectedTime);
                    cloneTarget.setSelectedDate(target.selectedDate);
                    cloneTarget.setTravelDirection(target.travelDirection);
                    cloneTarget.startPoint=false;
                    targetList.push(cloneTarget);
                    var _date = new Date(target.selectedDate);
                    _date.setMinutes(_date.getMinutes() + 30);
                    gmapHandler.addTargetFromMapMenu(pos, _date, js_rp_timeFrom, "");
                }
            }else{
                gmapHandler.addTargetFromMapMenu(pos,new Date(),js_rp_timeFrom,"startPoint");
            }
            btn.button('reset');
            btn.addClass('icon-cur-pos');
       });
    },
    /**
     *
     * @param errorFlag
     */
    handleNoGeolocation: function(errorFlag) {
        if (errorFlag) {
            var content = 'Error: The Geolocation service failed.';
        } else {
            var content = 'Error: Your browser doesn\'t support geolocation.';
        }

//        var options = {
//            map: rpMap,
//            position: new google.maps.LatLng(60, 105),
//            content: content
//        };
//        var infowindow = new google.maps.InfoWindow(options);
//        rpMap.setCenter(options.position);
    },
    /**
     *
     * @param callback
     */
    getCurrentLocation:function(callback){
        // Try HTML5 geolocation
        var currentPosition=null;
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);
                // if you want to see the info window enable the following
//                var infowindow = new google.maps.InfoWindow({
//                    map: rpMap,
//                    position: pos,
//                    content: '<div style="width:200px; height:30px;text-align: center; padding:10px;">Your current location.</div>' // TODO:gm-style-iw is the class name of the GOOGLE-INFO WINDOW
//                });
                currentPosition=pos;
//                console.debug("current position", pos);
                callback(currentPosition);
                rpMap.setCenter(pos);
            }, function() {
                gmapHandler.handleNoGeolocation(true);
            },callback);
        } else {
            // Browser doesn't support Geolocation
            gmapHandler.handleNoGeolocation(false);
        }

    },
    //remove all menus from map
    removeMenus :function(){
        var mm = $("#map_canvas").children(".markerMenu");
        if (mm) {
            for(var i = 0; i < mm.length; i++){
                $(mm[i]).hide();
                $("#map_canvas")[0].removeChild(mm[i]);
            }
        }
        $("#mapContextMenu").hide();

    },
    /**
     * show the right-click popup on the google map
     * @param map
     */
    initMapContextMenu : function(rpMap) {

        var contextMenu = document.createElement('div');
        contextMenu.id = "mapContextMenu";
        $(contextMenu).addClass("mapMenu");


        var buttonWrapper = document.createElement('div');
        buttonWrapper.id = "mapButtonWrapper";

        //start Button

        var startButton = document.createElement('button');
        startButton.id = "startButtonForMap";
//        startButton.addClass("mapButton");
        startButton.innerHTML = js_rp_startPoint;//js_gmap_newwaypoint

//        $(startButton).button({
//            icons: { primary: 'icon-from' },
//            text: true
//        });
        //Next Button
        var nextStepButton = document.createElement('button');
        nextStepButton.id = "nextStepButtonForMap";
        nextStepButton.innerHTML = js_rp_newTarget;//js_gmap_newwaypoint
//        nextStepButton.addClass("mapButton");

        buttonWrapper.appendChild(startButton);
        buttonWrapper.appendChild(nextStepButton);
        contextMenu.appendChild(buttonWrapper);


        var closeButton = document.createElement('button');
        closeButton.innerHTML = "Ok";
        $(closeButton).click(function () {
            $(contextMenu).hide();
        });
//        $(closeButton).button();

        $("#map_canvas")[0].appendChild(contextMenu);

        $(contextMenu).click(function (event) {
            event.stopPropagation();
        });


        $(contextMenu).hide();
        //listener on the gmap to open context menu

            google.maps.event.addListener(rpMap, 'rightclick', function (e) {
                //$(contextMenu).fadeOut(75);
                // start by hiding the context menu if its open
                $(contextMenu).hide();

                // if target list ==0
                // show start and GPs button
                // if target list ==1
                //     if start point is true then show next
                //     else show start point
                // if target list==2
                // if startPointShown==false
                //    show first startpoint + gps
                //    then startPointShown=true
                // else
                //    show next point
                //    startPointShown=false

                if (targetList.length == 0) {
                    $("#nextStepButtonForMap").hide();
                    $("#startButtonForMap").show();
                    // add here also small GPS button

                } else if (targetList[targetList.length - 1].startPoint == true) {
                    $("#startButtonForMap").hide();
                    $("#nextStepButtonForMap").show();
                    // if target 0 is startPoint then show map
                } else {
                    $("#startButtonForMap").show();
                    $("#nextStepButtonForMap").show();
                }

                //unbinding old listeners
                $(startButton).unbind('click');
                $(nextStepButton).unbind('click');

                $(startButton).click(function () {
                    $(contextMenu).fadeOut(75);
                    gmapHandler.addTargetFromMapMenu(e.latLng, new Date(), js_rp_timeFrom, "startPoint");
                    //console.info("Start Point is added, DATE-> "+date);
                });

                $(nextStepButton).click(function () {
                    $(contextMenu).fadeOut(75);
                    var target = targetList[targetList.length - 1];//targetList[index_lastAssignedTime];
                    if (typeof target != 'undefined') {
                        if (target.startPoint == true) {
                            var _date = new Date(target.selectedDate);
                            _date.setMinutes(_date.getMinutes() + 30);
                            gmapHandler.addTargetFromMapMenu(e.latLng, _date, js_rp_timeFrom, "");
                        } else {
                            var cloneTarget = new Target();
                            cloneTarget.setPosition(target.getPosition());
                            cloneTarget.setAddress(target.getAddress());
                            cloneTarget.setSelectedTime(target.selectedTime);
                            cloneTarget.setSelectedDate(target.selectedDate);
                            cloneTarget.setTravelDirection(target.travelDirection);
                            cloneTarget.startPoint = false;

                            targetList.push(cloneTarget);
                            var _date = new Date(target.selectedDate);
                            _date.setMinutes(_date.getMinutes() + 30);
                            gmapHandler.addTargetFromMapMenu(e.latLng, _date, js_rp_timeFrom, "");
                        }
                    } else {
                        uiUtilities.popupModal('Previous target object is not exist!', " Google Map Issue");
                    }
                });

                //position the menu div
                var mapDiv = $(rpMap.getDiv()), x = e.pixel.x, y = e.pixel.y;

                // adjust if clicked to close to the edge of the map
                if (x > mapDiv.width() - $(contextMenu).width())
                    x -= $(contextMenu).width();
                if (y > mapDiv.height() - $(contextMenu).height())
                    y -= $(contextMenu).height();

                // Set the location and fade in the context menu
                $(contextMenu).css({
                    top: y,
                    left: x,
                    position: "absolute",
                    "z-index": 1000
                }).fadeIn(100);

            });
        if(uiUtilities.xs()) {

            var timerForNextButton=null;
            var timerForStartButton=null;
            var disappreanceTime=3000;
            function cancelDelay(){
                if(timerForNextButton!=null){
                    clearTimeout(timerForNextButton);
                }
                if(timerForStartButton!=null){
                    clearTimeout(timerForStartButton);
                }
            };

            google.maps.event.addListener(rpMap, 'click', function (e) {
                // start by hiding the context menu if its open
                $(contextMenu).hide();
                cancelDelay();
                if (targetList.length == 0) {
                    $("#nextStepButtonForMap").hide();
                    $("#startButtonForMap").show();
                    timerForStartButton=setTimeout(function(){$("#startButtonForMap").hide(500);}, disappreanceTime);
                } else if (targetList[targetList.length - 1].startPoint == true) {
                    $("#startButtonForMap").hide();
                    $("#nextStepButtonForMap").show();
                    timerForNextButton=setTimeout(function(){$("#nextStepButtonForMap").hide(500);}, 3000);
                } else {
                    $("#startButtonForMap").show();
                    $("#nextStepButtonForMap").show();
                    timerForStartButton=setTimeout(function(){$("#startButtonForMap").hide(500);}, disappreanceTime);
                    timerForNextButton=setTimeout(function(){$("#nextStepButtonForMap").hide(500);}, 3000);
                }

                //unbinding old listeners
                $(startButton).unbind('click');
                $(nextStepButton).unbind('click');

                $(startButton).click(function () {
                    $(contextMenu).fadeOut(75);
                    gmapHandler.addTargetFromMapMenu(e.latLng, new Date(), js_rp_timeFrom, "startPoint");
                    //console.info("Start Point is added, DATE-> "+date);
                });

                $(nextStepButton).click(function () {
                    $(contextMenu).fadeOut(75);
                    var target = targetList[targetList.length - 1];//targetList[index_lastAssignedTime];
                    if (typeof target != 'undefined') {
                        if (target.startPoint == true) {
                            var _date = new Date(target.selectedDate);
                            _date.setMinutes(_date.getMinutes() + 30);
                            gmapHandler.addTargetFromMapMenu(e.latLng, _date, js_rp_timeFrom, "");
                        } else {
                            var cloneTarget = new Target();
                            cloneTarget.setPosition(target.getPosition());
                            cloneTarget.setAddress(target.getAddress());
                            cloneTarget.setSelectedTime(target.selectedTime);
                            cloneTarget.setSelectedDate(target.selectedDate);
                            cloneTarget.setTravelDirection(target.travelDirection);
                            cloneTarget.startPoint = false;

                            targetList.push(cloneTarget);
                            var _date = new Date(target.selectedDate);
                            _date.setMinutes(_date.getMinutes() + 30);
                            gmapHandler.addTargetFromMapMenu(e.latLng, _date, js_rp_timeFrom, "");
                        }
                    } else {
                        uiUtilities.popupModal('Previous target object is not exist!', " Google Map Issue");
                    }
                });

                //position the menu div
                var mapDiv = $(rpMap.getDiv()), x = e.pixel.x, y = e.pixel.y;

                // adjust if clicked to close to the edge of the map
                if (x > mapDiv.width() - $(contextMenu).width())
                    x -= $(contextMenu).width();
                if (y > mapDiv.height() - $(contextMenu).height())
                    y -= $(contextMenu).height();

                // Set the location and fade in the context menu
                $(contextMenu).css({
                    top: y,
                    left: x,
                    position: "absolute",
                    "z-index": 1000
                }).fadeIn(500);

            });
        }
        /*
        google.maps.event.addListener(map, 'click', function(e) {
            $(contextMenu).fadeOut(75);
            // start by hiding the context menu if its open
            $(contextMenu).hide();

            if(targetList.length==0){
                $("#nextStepButtonForMap").hide();
                $("#startButtonForMap").show();
            } else if(targetList[targetList.length-1].startPoint==true){
                $("#startButtonForMap").hide();
                $("#nextStepButtonForMap").show();
            }else{
                $("#startButtonForMap").show();
                $("#nextStepButtonForMap").show();
            }

            //unbinding old listeners
            $(startButton).unbind('click');
            $(nextStepButton).unbind('click');

            $(startButton).click(function() {
                $(contextMenu).fadeOut(75);
                gmapHandler.addTargetFromMapMenu(e.latLng,new Date(),js_time_from,"startPoint");
                //console.info("Start Point is added, DATE-> "+date);
            });

            $(nextStepButton).click(function() {
                $(contextMenu).fadeOut(75);
                var target=targetList[targetList.length-1];//targetList[index_lastAssignedTime];
                if(typeof target!= 'undefined') {
                    if(target.startPoint==true){
                        var _date = new Date(target.selectedDate);
                        _date.setMinutes(_date.getMinutes() + 30);
                        gmapHandler.addTargetFromMapMenu(e.latLng, _date, js_time_from, "");
                    }else{
                        var cloneTarget=new Target();
                        cloneTarget.setPosition(target.getPosition());
                        cloneTarget.setAddress(target.getAddress());
                        cloneTarget.setSelectedTime(target.selectedTime);
                        cloneTarget.setSelectedDate(target.selectedDate);
                        cloneTarget.setTravelDirection(target.travelDirection);
                        cloneTarget.startPoint=false;

                        targetList.push(cloneTarget);
                        var _date = new Date(target.selectedDate);
                        _date.setMinutes(_date.getMinutes() + 30);
                        gmapHandler.addTargetFromMapMenu(e.latLng, _date, js_time_from, "");
                    }
                }else{
                    uiUtilities.popupModal('Previous target object is not exist!'," Google Map Issue");
                }
            });

            //position the menu div
            var mapDiv = $(map.getDiv()), x = e.pixel.x, y = e.pixel.y;

            // adjust if clicked to close to the edge of the map
            if (x > mapDiv.width() - $(contextMenu).width())
                x -= $(contextMenu).width();
            if (y > mapDiv.height() - $(contextMenu).height())
                y -= $(contextMenu).height();

            // Set the location and fade in the context menu
            $(contextMenu).css({
                top : y,
                left : x,
                position : "absolute",
                "z-index" : 1000
            }).fadeIn(100);

        });
        */
        google.maps.event.addListener(rpMap,"locationAdded", function(evt){
            //console.log("Location Added");
            if(!evt.location){
                addLocation(evt.location);
            }

        });

        google.maps.event.addListener(rpMap,"routeAdded", function(evt){
            //console.log("Route Added");
            addRoute(evt.route);
        });

    },
    /**
     *
     * @param location1
     * @param location2
     * @param date
     * @param timeDir
     */
    addTargetFromGoogleCalendar:function(location1,location2,date,timeDir){

        gmapHandler.geocodeAddress(function(latlng1, address){
            if(latlng1 != false){
                gmapHandler.geocodeAddress(function(latlng2, address){
                    if(latlng2 != false){
                        console.info("Result:"+latlng1+" "+latlng2+" selected Time:"+$("#selectedTime").datetimepicker('getDate'));
                        gmapHandler.addRouteWithTime(latlng1,latlng2,date,location1,location2,timeDir);
                    }
                },  location2);
            }
        },  location1);

    },
    addTargetFromIRA:function(location1,location2,date,timeDir){
        //console.log("CEEEEM currentTime:"+location1+" "+"location2:"+location2+ ", time :"+date);

        gmapHandler.geocodeAddress(function(latlng1, address){
            if(latlng1 != false){
                gmapHandler.geocodeAddress(function(latlng2, address){
                    if(latlng2 != false){
                        console.info("Result:"+latlng1+" "+latlng2+" selected Time:"+$("#selectedTime").datetimepicker('getDate'));
                        gmapHandler.addRouteWithTime(latlng1,latlng2,date,location1,location2,timeDir);
                        requestFromIRAEnabled=false;
                        ajaxCommunicator.createMobilityPlan();
                    }
                },  location2);
            }
        },  location1);

    },
    /**
     *
     * @param location
     * @returns {Target}
     */
    addLocation: function(location){
        var t = new Target();
        t.position = new Position(location.lat(), location.lng());
        if(targetList.length==0){
            t.startPoint=true;
        }
//        gmapHandler.geocodeLatLngServerSide(function(address){
//            t.setAddress(address);
//        }, 	t.position,0);

        gmapHandler.geocodeLatLng(function(address){
            t.setAddress(address);
            var _date = new Date();
            t.setSelectedDate(_date); // For assigning the current time to start time
            t.setSelectedTime(_date);
            t.travelDirection=js_rp_timeFrom;
            t.setTravelDirection(js_rp_timeFrom);
            targetList.push(t);
            //t.setTravelDirection(js_time_from);
//            console.log("Assigned Direction for travel ->"+ js_rp_timeFrom);
//            console.log("**************************");
//            console.log("GMAP HANDLER TEST FOR SPA --> addLocation");
//            console.log(t.selectedDate);
//            console.log("**************************");

            return t;

        }, 	t.position,0);
      },
    /**
     *
     * @param route
     */
    addRoute: function(route){
        // var route={start:{lat:21.123,lng:31.1121},end:{lng:21.123,lat:31.1121}};
        var t1 = new Target();
        var t2 = new Target();
        t1.position = new Position( route.start.lat, route.start.lng);
        t2.position = new Position(route.end.lat, route.end.lng);
//        gmapHandler.geocodeLatLngServerSide(function(address){
//            t1.setAddress(address);
//        }, 	t1.position,0);
//
//        gmapHandler.geocodeLatLngServerSide(function(address){
//            t2.setAddress(address);
//        }, 	t2.position,0);
        var _date = new Date();
        gmapHandler.geocodeLatLng(function(address){
            t1.setAddress(address);
            t1.startPoint=true;
            t1.setSelectedDate(_date); // For assigning the current time to start time
            t1.setSelectedTime(_date);
            t1.travelDirection=js_rp_timeFrom;
        }, 	t1.position,0);

        gmapHandler.geocodeLatLng(function(address){
            t2.setAddress(address);
            t2.setSelectedDate(_date); //TODO: This cannot be true
            t2.setSelectedTime(_date);
            t2.travelDirection=js_rp_timeFrom;
            //t2.setTravelDirection(js_time_to);
            targetList.push(t1);
            targetList.push(t2);

        }, 	t2.position,0);
    },


    /**
     *
     * @param latLng1
     * @param latLng2
     * @param date
     * @param add1
     * @param add2
     * @param direction
     */
    addRouteWithTime: function(latLng1,latLng2,date,add1,add2,direction) {
        var t1 = new Target();
        var t2= new Target();


        t1.startPoint=true;
        t1.position = new Position(latLng1.lat(), latLng1.lng());
        t2.position = new Position(latLng2.lat(), latLng2.lng());


        t1.selectedTime=new Date(date);
        t1.selectedDate=new Date(date);

        t1.address=add1;
        t2.address=add2;

  //      console.log("NEW  TARGET ADDED location1:"+add1+" "+"location2:"+add2+ ", time :"+   t1.selectedTime+" direction->"+direction);
        //t1.travelDirection=direction;
        //t2.travelDirection=direction;

        if(direction.indexOf(js_rp_timeFrom) > -1) {
            //        console.log("NEW  TARGET ADDED FOR FROM ");

            date.setMinutes(date.getMinutes() + 30);
            t2.selectedTime = date; // for the time from it can work w
            t2.selectedDate = date;
            t2.travelDirection=js_rp_timeFrom;
            t1.travelDirection = js_rp_timeFrom;
        }
        else if(direction.indexOf(js_rp_timeTo) > -1){
      //      console.log("NEW  TARGET ADDED FOR TO ");
            date.setMinutes(date.getMinutes() - 30); // 30 minutes earlier than the appointment time
            t2.selectedTime=date;
            t2.selectedDate=date;
            t1.travelDirection=js_rp_timeTo;
            t2.travelDirection=js_rp_timeTo;

        }
        targetList.push(t1);
        targetList.push(t2);

        uiRoutePlanner.cleanInputs();
    },
    /**
     *
     * @param location
     * @param date
     * @param timeDir
     * @param whichPoint
     * @returns {Target}
     */
    addTargetFromMapMenu:function(location,date,timeDir,whichPoint){
        var t=new Target();
        t.position = new Position(location.lat(), location.lng());

//        gmapHandler.geocodeLatLngServerSide(function(address){
//            t.setAddress(address);
//        }, 	t.position,0);

        gmapHandler.geocodeLatLng(function(address){
            t.setAddress(address);
            console.info("date:"+date+": address ->"+ t.address);

            if(whichPoint=="startPoint"){
                t.startPoint=true;
            }
            if(date!=null || date!=""){
                t.selectedTime=date;
                t.selectedDate=date;
                //console.info("time is assigned " +date);
            }
            t.travelDirection=timeDir;
            targetList.push(t);
        }, 	t.position,0);

    },
    /**
     * Adds a rightclick menu to a marker (e.latLng must be set)
     * @param latLng
     * @param target
     */
    showMarkerMenu : function(latLng, target) {
        console.info("Show Marker menu is clicked");
        //in case of double click on marker reset markermenu
        if( $($("#map_canvas")[0]).has(target.marker.markerMenu).length){
            $("#map_canvas")[0].removeChild(target.marker.markerMenu);
        }
        target.marker.markerMenu = null;

        var markerMenu = document.createElement('div');
        $(markerMenu).click(function(event) {
            event.stopPropagation();
        });
        $(markerMenu).addClass("markerMenu");
        var deleteButton = document.createElement('button');
        deleteButton.innerHTML = js_gmap_delete;

        $(deleteButton).button({
            icons : {
                primary : "ui-icon-closethick"
            }
        });

        //disable windows menu
        $(markerMenu).bind('contextmenu', function() {
            return false;
        });
        $(deleteButton).click(function() {
            $(markerMenu).fadeOut(75);
            //target.marker.setMap(null);
            targetList.removeTarget(target);
            $("#map_canvas")[0].removeChild(markerMenu);
        });

//        var fromDateInput = document.createElement('input');
//        $(fromDateInput).attr("type", "text");
//        $(fromDateInput).datetimepicker({
//            onClose : function() {
//                target.setFromTime($(fromDateInput).datetimepicker('getDate'));
//            }
//        });
//        $(fromDateInput).datetimepicker('setDate', target.fromTime);
//
//
//        var toDateInput = document.createElement('input');
//        $(toDateInput).attr("type", "text");
//        $(toDateInput).datetimepicker('setDate',target.toTime);
//        $(toDateInput).datetimepicker({
//            onClose : function() {
//                target.setToTime($(toDateInput).datetimepicker('getDate'));
//                $(toDateInput).datetimepicker('setDate', $(toDateInput).datetimepicker('getDate'));
//            }
//        });
//        $(toDateInput).datetimepicker('setDate', target.toTime);


        $(markerMenu).css({
            "background-color" : "yellow"
        });
        var closeButton = document.createElement('button');
        closeButton.innerHTML = "Ok";
        $(closeButton).click(function() {
            target.setFromTime($(fromDateInput).datetimepicker('getDate'));
            $(markerMenu).hide();
            $("#map_canvas")[0].removeChild(markerMenu);
        });
        $(closeButton).button();

        var addTargetButton = document.createElement('div');
        $(addTargetButton).button();
        $(addTargetButton).click(function() {
            //TODO: handle multiple target selection
        });

        markerMenu.appendChild(deleteButton);

        //stop bubbling of events through the datepicker
        $("#ui-datepicker-div").click(function(event) {
            event.stopPropagation();
        });

        $("#map_canvas")[0].appendChild(markerMenu);
        //position the menu div
        var containerPixel = overlay.getProjection().fromLatLngToContainerPixel(latLng);
        var mapDiv = $(rpMap.getDiv());
        var x = containerPixel.x
        var y = containerPixel.y;

        // adjust if clicked to close to the edge of the map
        // if (x > mapDiv.width() - $(markerMenu).width())
        // x -= $(markerMenu).width();
        // if (y > mapDiv.height() - $(markerMenu).height())
        // y -= $(markerMenu).height();

        // Set the location and fade in the context menu
        $(markerMenu).css({
            top : y,
            left : x,
            position : "absolute",
            "max-width" : "200px",
            "overflow" : "hidden",
            // "width" : "200px",
            // "min-width" : "200px",
            "z-index" : 1000
        }).fadeIn(100);

        $(deleteButton).css({
            "width" : $(markerMenu).width()
        });
        $(fromDateInput).css({
            "max-width" : $(markerMenu).width()
        });
        $(closeButton).css({
            "width" : $(markerMenu).width()
        });
        target.marker.markerMenu = markerMenu;
    },
    //shows the info bubble over target marker on gmap
    showInfoWindow : function(target){
        target.marker.infoWindow.close();
        var infoContent = document.createElement('div');
        $(infoContent).click(function(event) {
            event.stopPropagation();
        });

        $(infoContent).addClass("infoContent");



        //disable windows menu
        $(infoContent).bind('contextmenu', function() {
            return false;
        });
        var fromDateInput = document.createElement('input');
        fromDateInput.id = "id" + new Date().getTime() ;
        $(fromDateInput).attr("type", "text");
//        $(fromDateInput).datetimepicker({
//            onClose : function() {
//                target.setFromTime($(fromDateInput).datetimepicker('getDate'));
//            }
//        });
//
//        $(fromDateInput).datetimepicker('setDate', target.fromTime);


        var toDateInput = document.createElement('input');
        toDateInput.id = "id" + new Date().getTime() ;
        $(toDateInput).attr("type", "text");
//        $(toDateInput).datetimepicker('setDate',target.toTime);
//        $(toDateInput).datetimepicker({
//            onClose : function() {
//                target.setToTime($(toDateInput).datetimepicker('getDate'));
//                $(toDateInput).datetimepicker('setDate', $(toDateInput).datetimepicker('getDate'));
//            }
//        });
//        $(toDateInput).datetimepicker('setDate', target.toTime);

        var fromDateLabel = document.createElement('label');
        fromDateLabel.innerHTML = "Von:";
        fromDateLabel.setAttribute("for", fromDateInput.id);
        var toDateLabel = document.createElement('label');
        toDateLabel.innerHTML = "Bis:";
        toDateLabel.setAttribute("for", toDateInput.id);


        var form = document.createElement('form');
        var fieldset = document.createElement('fieldset');
        document.createElement("br");

        form.appendChild(fieldset);
        fieldset.appendChild(fromDateLabel);
        fieldset.appendChild(document.createElement("br"));
        fieldset.appendChild(fromDateInput);
        fieldset.appendChild(document.createElement("br"));
        fieldset.appendChild(toDateLabel);
        fieldset.appendChild(document.createElement("br"));
        fieldset.appendChild(toDateInput);
        //fieldset.appendChild(fromTimeInput);
        infoContent.appendChild(form);
        $(infoContent).addClass("ui-dialog-content ui-widget-content");
        $(infoContent).css({
            margin: "5px"
        });

        //stop bubbling of events through the datepicker
        $("#ui-datepicker-div").click(function(event) {
            event.stopPropagation();
        });


        infoWindowMaxZIndex+=1;

        var infowindow = new google.maps.InfoWindow(
            { 	content:infoContent,
                zIndex:	infoWindowMaxZIndex
            });
        google.maps.event.addListener(infowindow, 'closeclick', function(result) {
            infowindow.setContent(null);

        });
        target.marker.infoWindow = infowindow;
        infowindow.open(rpMap,target.marker);

    },

    //expects Array of google.maps.LatLng
    drawPolyline : function(coordArray, color){
        //console.log("draw polyline");
        var polyline = new google.maps.Polyline({
            path:coordArray,
            strokeColor: color,
            strokeOpacity: 1.0,
            strokeWeight: 2
        })
        polyline.setMap(rpMap);
        return polyline;
    },

    centerMap : function(coords){
        var minLat = 2000;
        var maxLat = -2000;
        var minLon = 2000;
        var maxLon = -2000;
        for (var coord = 0; coord < coords.length; coord++){

            if (coords[coord].lat() > maxLat) maxLat = coords[coord].lat();
            if (coords[coord].lat() < minLat) minLat = coords[coord].lat();
            if (coords[coord].lng() > maxLon) maxLon = coords[coord].lng();
            if (coords[coord].lng() < minLon) minLon = coords[coord].lng();

        }

        var center = new google.maps.LatLng((maxLat+minLat)/2, (maxLon+minLon)/2);
        //console.log((maxLat+minLat)/2);
        //console.log((maxLon+minLon)/2);
        //console.log(minLat);
        //console.log(minLon);
        //console.log(maxLat);
        //console.log(maxLon);
        //map.setCenter(new google.maps.LatLng(50,12));
        var adjustedMaxLon = 0.5*(maxLon-minLon) + maxLon;
        var adjustedMinLon = 0.2*(maxLon-minLon) + minLon;
        var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(minLat, adjustedMinLon), new google.maps.LatLng(maxLat, adjustedMaxLon));
        rpMap.fitBounds(bounds);
        //	map.setCenter(center);

    },

    /*	cause geocode is asynchronous we need a callback function
     callback is a postion or false
     geocodes given address to Position
     */
    geocodeAddress : function(callback, address) {
        geocoder.geocode({
            'address' : address
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                rpMap.setCenter(results[0].geometry.location);
                /*var marker = new google.maps.Marker({
                 map : map,
                 position : results[0].geometry.location
                 });*/
                var latlng = results[0].geometry.location;
                if(results[0].formatted_address){
                    callback(latlng, results[0].formatted_address);

                }
                else{callback(latlng, "fault");}

            } else {
                if (i<5) {
                    gmapHandler.geocodeAddress(callback, address);
                }else{
                    callback(false);
                    console.log("Geocoder failed due to: " + status," Google Map Issue");
                }
            }
        });
    },


    geocodeLatLngDeferred :function (position) {
        var deferred = $.Deferred();
        var latLng = new google.maps.LatLng(position.latitude, position.longitude);
        geocoder.geocode({
            'latLng' : latLng
        }, deferred.resolve);
        return deferred.promise();
    },
    //geocodes given position to an address
    geocodeLatLngDelayed : function(callback, position,i) {
        // console.info("geocode geocodeLatLng:"+position);
        var latLng = new google.maps.LatLng(position.latitude, position.longitude);
        geocoder.geocode({
            'latLng' : latLng
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
               console.info("GEOCODE RESULT:"+results[0].formatted_address);
                if (results[0]) {
                    callback(results[0].formatted_address);
                } else {
                    callback("no address");
                }
            }  else {
                // === if we were sending the requests to fast, try this one again and increase the delay
                if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    console.log("Geocoder failed due to: " + status," Google Map Issue");
                    if (i < 5) {
                        console.debug("Repeated Again ->" +i);
//                    setTimeout(gmapHandler.geocodeLatLngDelayed(callback, position,i+1),600);
                    }
                }
            }
        })

    },
    geocodeLatLng : function(callback, position,i) {
        // console.info("geocode geocodeLatLng:"+position);
        var latLng = new google.maps.LatLng(position.latitude, position.longitude);
        geocoder.geocode({
            'latLng' : latLng
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
//               console.info("GEOCODE RESULT:"+results[0].formatted_address);
                if (results[0]) {
                    callback(results[0].formatted_address);
                } else {
                    callback("no address");
                }
            } else {
//                if (i<5) {
//                    gmapHandler.geocodeLatLng(callback, position,i+1);
//                }else{
                    callback("no Address");
                    console.log("Geocoder failed due to: " + status," Google Map Issue");
                //}
            }
        });

    },
    // server side geocode or local side geocode
    // client side geocoding, limitation is only valid for the session, it is always recommended
    // server side has already a limitation for the requests. happens when you get a dataset that comes separately from user input, for instance if you have a fixed, finite,The 2,500 request limit is per IP address

    // geocode api should be activated in order to tackle the issue of the limits
    //1-https://console.developers.google.com/project/399811154158/apiui/apis/library
    // Under Google Maps APIs, activate Geocoding
    // add the key into the url address below and send the request to the google.
    // alternative method is to utilize directly the geocode function.
    geocodeLatLngServerSide : function(callback, position, i) {
        //var data;
        //var latLng = new google.maps.LatLng(position.latitude, position.longitude);
        var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.latitude + "," + position.longitude + "&sensor=true&language=" + language+"";
        //var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.latitude + "," + position.longitude + "&sensor=true&language=" + language+"&key=AIzaSyCPOwW1QC5QMALxxGZvHlzkOnPBK88h9Ds";

        //console.log("ServerSide:"+position);
        var xmlHttp = null;
        try{
            xmlHttp = new XMLHttpRequest();
            // xmlHttp.onreadystatechange = gmapHandler.processRequest(callback, xmlHttp);
            xmlHttp.open( "GET", url, false );
            xmlHttp.send( null );
            var result = JSON.parse(xmlHttp.responseText);
            //console.log(result);
            callback(result.results[0].formatted_address);
            //return xmlHttp.responseText;
        }
        catch(e){
            console.log("got exception when trying to geocode latlng -> address");
            console.log(e);
            if (i<5) gmapHandler.geocodeLatLngServerSide(callback, position, i+1);
        }

    },
//key=AIzaSyCPOwW1QC5QMALxxGZvHlzkOnPBK88h9Ds&
    geocodeAddressServerSide : function(callback, address, i) {
        //var data;
        //var latLng = new google.maps.LatLng(position.latitude, position.longitude);
        var url = "http://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&sensor=false";
        //jQuery.getJSON(url, callback(data));
        //console.log(url);
        var xmlHttp = null;
        try{
            xmlHttp = new XMLHttpRequest();
            // xmlHttp.onreadystatechange = gmapHandler.processRequest(callback, xmlHttp);
            xmlHttp.open( "GET", url, false );
            xmlHttp.send( null );
            var result = JSON.parse(xmlHttp.responseText);
            callback(result.results[0].geometry.location);
            //return xmlHttp.responseText;
        }
        catch(e){
            console.log("got exception when trying to geocode address -> latlng");
            console.log(e);
            if (i<5) gmapHandler.geocodeAddressServerSide(callback, address, i+1);
        }

    },

    addMarker : function(latLng, number, dayplRoute, address) {
        //   console.log("Marker: "+address);
        var marker;
        if (number > 0){
            //console.log("adress:");
            //console.log(address);
            var icon = appContext+ "/images/markerIcons/largeTDYellowIcons/marker"+number+".png";
            marker = new google.maps.Marker({
                position : latLng,
                map : rpMap,
                draggable : true,
                icon: icon,
                title : address
            });
        }
        else if (number == -1){
            var icon = uiHandler.getCorrectIcon(dayplRoute, true);
            marker = new google.maps.Marker({
                position : latLng,
                map : rpMap,
                draggable : true,
                icon: icon,
                title : uiHandler.getDescription(dayplRoute)
            });
        }
        markers.push(marker);
    },

    clear : function() {
        // disable old targets
        for(var i=targetList.length-1; i >= 0; i-- ){
            //console.log("deleting target");
            //console.log(i);
            targetList.removeTarget(targetList[i]);
        }

        // reset polylines
        for (var i = 0; i<gmapPolylines.length; i++){
            gmapPolylines[i].setMap(null);
        }
        gmapPolylines = new Array();

        // reset markers
        for (var i = 0; i<markers.length; i++){
            markers[i].setMap(null);
        }
        markers = new Array();

        // reset layout
        uiMode = 0;
        uiHandler.updateLayout();
        $("#routeTableDiv").hide();
    },

    clearMap : function() {

        // reset polylines
        for (var i = 0; i<gmapPolylines.length; i++){
            gmapPolylines[i].setMap(null);
        }
        gmapPolylines = new Array();

        // reset markers
        for (var i = 0; i<markers.length; i++){
            markers[i].setMap(null);
        }
        markers = new Array();

    }

};

