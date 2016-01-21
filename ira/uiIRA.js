/**
 *
 *@namespace
 * @author Cem Akpolat
 */
var uiIra={
    defaults:{
        _lineCoordinations:null,
        _loadingProcessForMessages:null,
        _totalRouteLength:null,
        _infoWindow:null,
        _notificationMarker:null,
        _selectedRoute:'',
        _latestGPSData:null,
        _gpsMarker:null,
        _gpsMarker_BR:null,
        _gpsView:null,
        _plannedRoutes:'',
        _selectedPlanningId:0,
        _selectedPlanningOrder:0,
        _updateIRA:0,
        _travelDuration:0,
        _passedDuration:0,
        _currentSegment:'',
        _currentVehicle:'',
        _popupSegmentOpened:false,
        _simulationTimer:'',
        _simStartTime:'',
        _simCurrentTime:'',
        _manuallUpdateStarted:false,
        _updateDuration:2000 // INFO:normally should be in minutes but this time it is in miliseconds
    },
    clearMapComponents:function(){
        if(this.defaults._gpsMarker!=null){
            this.defaults._gpsMarker.setMap(null);
        }
        if(this.defaults._gpsMarker_BR!=null){
            this.defaults._gpsMarker_BR.setMap(null);
        }
        if(this.defaults._notificationMarker!=null){
            this.defaults._notificationMarker.setMap(null);
        }
    },
    startIRA:function(planningId,planningOrder){

        uiIra.clearMapComponents();
        uiIra.defaults._selectedRouteOrder=planningOrder;
        uiIra.defaults._selectedPlanningId=planningId;
        //var route=this.getSelectedRoutePath(planningId);
        var route=uiIra.getSelectedRoutePath(planningOrder);

        uiIra.defaults._gpsMarker = new google.maps.Marker({
            position: null,
            icon: {
                id:'gpsMarker',
                path: google.maps.SymbolPath.CIRCLE,
                fillOpacity: 1.0,
                fillColor: '#0099FF',
                strokeOpacity: 1.0,
                strokeColor: '#ffffff',
                strokeWeight: 2.0,
                scale: 10 //pixels
            },
            map: motMap
        });
        uiIra.defaults._gpsMarker_BR = new google.maps.Marker({
            position: null,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillOpacity: 0.2,
                fillColor: '#0099FF',
                strokeOpacity: 0,
                strokeColor: '#0099FF',
                strokeWeight: 1.0,
                scale: 20 //pixels
            },
            map: motMap
        });

        uiIra.srCommonIRA(route);
    },

    restartIRA:function(newPlanning){
        // stop the current plan and restart it
        uiIra.stopTimer();
        uiIra.stopUpdateIRA();
        var route=uiIra.getUpdatedRoutePath(newPlanning);
        uiIra.srCommonIRA(route);

    },
    // if the same route is restarted, then this will be called
    restartSameRoute:function(){
        uiIra.stopUpdateIRA();
        var route=uiIra.getRoutePath();
        uiIra.srCommonIRA(route);
    },

    srCommonIRA:function(route){
        uiIra.drawPolyLine(uiIra.defaults._currentSegment);
        uiIra.extractRoutePath(uiIra.defaults._currentSegment);
        uiIra.calculateTotalPath(this.defaults._lineCoordinations);
        uiIra.drawRouteBar(route.view);
        uiIra.startTimer();
        uiIra.startUpdateIRA();
        google.maps.event.trigger(motMap, "resize");

        uiIra.getCurrentPosition(function(position){
            uiIra.updateCurrentPosition(position.lat,position.lng);
            uiIra.defaults._latestGPSData=position;
        });

        // get vehicle type
        uiIra.getVehicleType(function(type){
            uiIra.defaults._currentVehicle=type;
        });

        uiIra.defaults._popupSegmentOpened=false;
        $(".slider-routes").on("click",function(){
            if(!uiIra.defaults._popupSegmentOpened) {
                drawRoutes.generateSegmentPopup(uiIra.defaults._currentSegment, $(this));
                uiIra.defaults._popupSegmentOpened=true;
            }else{
                $('.rv-route-list').remove();
                uiIra.defaults._popupSegmentOpened=false;
            }
        });
        $("#btn-replanning").on("click",function(){
            //$("#replannedRoutes").fadeIn();
            if(!uiIra.defaults._manuallUpdateStarted){
                uiIra.defaults._manuallUpdateStarted=true;
                this.updateIRAManually();
            }
            //$("#replannedRoutes").css('top',($(this).position().top-240)+'px');
        });

    },

    startUpdateIRA:function(){
        uiIra.defaults._updateIRA=setInterval(uiIra.updateIRA,uiIra.defaults._updateDuration); // every 10 seconds call
    },
    stopUpdateIRA:function(){
        clearInterval(uiIra.defaults._updateIRA);
    },
    removeLoadingSlotForPR:function(){
        drawRoutes.removeLoadingSlotForNewPlanningRequests();
        uiIra.defaults._loadingProcessForMessages=null;
    },
    addLoadingSlotForPR:function(){
        uiIra.removeLoadingSlotForPR();
        uiIra.defaults._loadingProcessForMessages=drawRoutes.addLoadingSlotForNewPlanningRequests();
    },
    updateIRAManually:function(){
        uiIra.getReplanningProposals(uiIra.defaults._selectedPlanningId,function(message){
            if(message.title=="REPLANNING"){
                uiIra.addLoadingSlotForPR();
                //var plan=message.plannings;
                uiIra.popupMessage(message,  uiIra.defaults._latestGPSData);
                uiIra.defaults._manuallUpdateStarted=false; // The message is received and the replanning button can be activated again.
            }
        });
    },
    updateIRA:function(){
        //TODO: Enable the code below for real data
        uiIra.getAnyMessage(function(message){

            if(message.title=="REPLANNING"){
                uiIra.addLoadingSlotForPR();
                uiIra.popupMessage(message,  uiIra.defaults._latestGPSData);
            }
            else if(message.title=="FINE"){
                //popup
                console.log("message: FINE");
            }
            else if(message.title=="TRAFFIC_INCIDENCE"){
                //popup
                console.log("message: TRAFFIC_INCIDENCE");
            }
            else if (message.title=="RECALLING") {
                if(uiIra.defaults._infoWindow!=null){
                    uiIra.defaults._infoWindow.setContent(null);
                    uiIra.defaults._infoWindow.close();
                    uiUtilities.popupTimeout('Die Ihnen gemachten Vorschläge wurden ungültig und deswegen verworfen!',
                        'Vorschläge verworfen!');
                }
            }
            uiIra.getCurrentPosition(function(position){
                //uiIra.markCurrentPosition(position.lat,position.lng);
                uiIra.updateCurrentPosition(position.lat,position.lng);
                uiIra.defaults._latestGPSData=position;
            });
            // get GPS Data From Backend
            uiIra.getVehicleType(function(type){
                uiIra.defaults._currentVehicle=type;
            });// get Possible Vehicle Type from Backend
        });
    },

    getCurrentProgress:function(callback){
        ajaxCommunicator.getCurrentProgress(uiIra.defaults._selectedPlanningId, function(progress){
            if(progress!=null && progress!=""){
                callback(progress);
             }
        });
    },
    updateTimeBar:function(progress){
        var distance=progress*100;
        if(distance!=null){
//            var blackSpace=100-distance;
            console.log("Progress:"+distance );
            $("#slider-filler").css("width",/*blackSpace*/distance+"%");
            $("#slider-separator").css("margin-left",(/*blackSpace*/distance-0.5)+"%");
        }
    },
    getReplanningProposals:function(callback){
        ajaxCommunicator.getReplanningProposals(uiIra.defaults._selectedPlanningId, function(message){
            console.debug('ira manually called', message);
            callback(message);

        });
    },
    getCurrentPosition:function(callback){
        ajaxCommunicator.getCurrentLocation(function(res){
            console.log("C. POSITION:",uiIra.defaults._latestGPSData);
            callback(res);
        });
    },

    updateCurrentPosition:function(lat,lng){
        if(lat!=null && lng!=null) {
            var latlng = new google.maps.LatLng(lat, lng);
            uiIra.defaults._gpsMarker.setPosition(latlng);
            uiIra.defaults._gpsMarker_BR.setPosition(latlng);

        }
    },
    getVehicleType:function(callback){
        ajaxCommunicator.getCurrentTransportationMode(function(res){
            console.debug("Vehicle Type:",res);
            callback(res);
        });

    },
    getAnyMessage:function(callback){
        ajaxCommunicator.messageFromMonitoringTool(uiIra.defaults._selectedPlanningId, function(data){
            callback(data);

        });
    },
    getUpdatedRoutePath:function(newPlanning){
        uiIra.defaults._selectedRoute=newPlanning.slots[0];
        return uiIra.getRoutePath();
    },

    getSelectedRoutePath:function(planningId){
        uiIra.defaults._selectedRoute=drawRoutes.getSelectedPlanning(planningId);
        return uiIra.getRoutePath();
    },
    getRoutePath:function(){
        var result=drawRoutes.generateTravelSlider(uiIra.defaults._selectedRoute);
        uiIra.defaults._currentSegment=uiIra.defaults._selectedRoute.segments[0]; // here only one segment is regarded
        uiIra.defaults._travelDuration=result.duration;
        return result;
    },
    startTimer:function(){
        uiIra.defaults._passedDuration=0; // start the from null;
        uiIra.defaults._timer=setInterval(uiIra.updateRouteBar,uiIra.defaults._updateDuration);
    },
    stopTimer:function(){
        clearInterval(uiIra.defaults._timer);
    },

    //TODO: Use the time, transport-mode info and
    updateRouteBar:function(){
        uiIra.getCurrentProgress(function(progress){
            console.debug("Progress:",progress.progress);
            uiIra.updateTimeBar(progress.progress);
        });
    },

    drawRouteBar:function(bar){
        $("#mot-map_canvas").append(bar);
        var x=$(window).height()-75;
        $("#mot-map_canvas").css( "height", x );
        $('#return-to-routes').show();
    },
    drawPolyLine:function(segment){
        drawRoutes.drawMapPolyline(segment);

    },
    popupMessage:function(message,currentPosition){

        var infoContent ='';
        if(message.title=="REPLANNING") {
            //console.log("MESSAGE:"+message.message);
            var routes=drawRoutes.getFirstItemsFromPlannings(message.plannings, message.message);
            // creates the content of the alternative routes
            infoContent=  uiIra.prepareInfoWindow(message.message,currentPosition,routes,message.plannings.length);

        } else {
            infoContent=  uiIra.prepareInfoWindow(message.message,currentPosition);
        }
        infoWindowMaxZIndex+=1;
        // define the options for inforwindow
        var options = {
            map: motMap,
            position: new google.maps.LatLng(currentPosition.lat, currentPosition.lng),
            content: infoContent,
            zIndex:	infoWindowMaxZIndex,
            boxClass: "infoWindow"
        };
        // remove the first window
        if(uiIra.defaults._infoWindow!=null ){
            uiIra.defaults._infoWindow.setContent(null);
            uiIra.defaults._infoWindow.close();
        }
        if(uiIra.defaults._notificationMarker!=null ){
            uiIra.defaults._notificationMarker.setMap(null);
        }
        // assign new window object
        uiIra.defaults._infoWindow = new google.maps.InfoWindow(options);
        google.maps.event.addListener(uiIra.defaults._infoWindow, 'domready', function() {
            var l = $('.infoBox').parent().parent().parent().prev();
            l.children().css('border-radius', '10px');
            l.children().css('background-color', '#FFF');
        });
        if(image!=null){
            image.setMap(null);
        }
        var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
        var image = {
            //url: 'images/notification.png',
            url: iconBase + 'caution.png',
            // This marker is 20 pixels wide by 32 pixels tall.
            //size: new google.maps.Size(30, 30),
            scaledSize: new google.maps.Size(30, 30),
            // The origin for this image is 0,0.
            origin: new google.maps.Point(0,0),
            // The anchor for this image is the base of the flagpole at 0,32.
            anchor: new google.maps.Point(0, 32)
        };

        // listen close event of info window
        google.maps.event.addListener(uiIra.defaults._infoWindow, 'closeclick', function(result) {
            uiIra.defaults._notificationMarker = new google.maps.Marker({
                position:  new google.maps.LatLng(currentPosition.lat, currentPosition.lng),
                map: motMap,
                icon:image,
                title: 'Notification'
            });
            google.maps.event.addListener( uiIra.defaults._notificationMarker, 'click', function() {
                uiIra.defaults._infoWindow.open(motMap, uiIra.defaults._notificationMarker);
                uiIra.enableButtonsOnInfoWindow(message, uiIra.defaults._notificationMarker);
            });
        });

        google.maps.event.trigger(motMap, "resize");
        motMap.setCenter(options.position);
        // enable the buttons on the infowindow
        uiIra.enableButtonsOnInfoWindow(message);
        uiIra.removeLoadingSlotForPR();

    },
    showWrapper:function(infoContent){
        var html='<div  id="infoWrapper" style="width:100%;padding-left:5%;padding-right:5%"><div style="width:90%;height:300px;text-align:center;position:absolute;bottom:0px; background:white;">'+infoContent+'</div></div>';
        $("#infoWrapper").remove();
        $("#mot-container-ira").append(html).show();
    },

    enableButtonsOnInfoWindow:function(message,marker){
        function refreshButtons() {

            $(".routeCapsule").mousedown(function () {
                $(this).css("background-color", " #436684 ");
                $(this).css("border", "1px #436684 solid");
            });

            $(".routeCapsule").click(function (event) {
                if (marker != undefined) {
                    marker.setMap(null);
                }
                event.stopPropagation();
                uiIra.defaults._infoWindow.setContent(null);
                uiIra.defaults._infoWindow.close();
                var itemid = $(this).attr("itemid");

                uiIra.replacePlannings(itemid, message);
            });
        };
        refreshButtons();
        $("#refreshAltBtn").on("click",function(){
            uiIra.addLoadingSlotForPR();
            $('.alternativeRoutes').empty();
            $('#refresh').css("padding-top","0px");
            $('.alternativeRoutes').html(js_ira_newAlternativeRoutes);
            $('.alternativeRoutes').html(uiIra.addLoader().canvas);

            uiIra.getPlanningProposals(function(newPlans){
                $('.alternativeRoutes').empty();
                var routes=drawRoutes.getFirstItemsFromPlannings(newPlans, message.message);
                $('.alternativeRoutes').append(routes);
                // remove the loading icon
                refreshButtons();
            });
        });

    },
    getPlanningProposals:function(callback){
        ajaxCommunicator.getPlanningProposals(uiIra.defaults._selectedPlanningId, function(newPlans){
            callback(newPlans);

        });
    },

    prepareInfoWindow:function(message,location,routes,itemCount){
        var html='',information='';
        if(routes!=undefined){
            information=message;
            html='<div class="infoBox">'
                +'<div class="messageBox">'
                +'<div class="messageIcon"><span class="glyphicon glyphicon-warning-sign"></span></div>'
                +'<div class="messageText">'+information+'</div>'
                +'</div>'
                +'<br style="clear:both;">'
                +'<div class="routesBox">'
                +'<div id="refresh" style="padding-top:'+((itemCount*26)/2-16)+'px"><button id="refreshAltBtn" class="btn btn-large" ><span class="glyphicon glyphicon-repeat"></span></button></div>'
                +'<div class="alternativeRoutes h">'+routes+'</div>'
                +'</div>'
                +'</div>';

        }else{
            html='<div class="infoBox">'
                +'<div class="messageBox">'
                +    '<div class="messageIcon"><img src="static/images/ira/notification.png"></div>'
                +'<div class="messageText">'+information+'</div>'
                +'</div>'
                +'<br style="clear:both;">'
                +'</div>';
        }
        //console.log(html);
        return html;
    },
    addLoader:function(){
        var circle = new Sonic({
            width: 50,
            height: 50,
            padding: 4,
            strokeColor: 'gray',//'#2E6687',
            pointDistance: .01,
            stepsPerFrame: 3,
            trailLength: .7,

            step: 'fader',

            setup: function() {
                this._.lineWidth = 5;
            },
            path: [
                ['arc', 15, 15, 15, 0, 360]
            ]
        });
        circle.play(); // for playing the ajax loader
        return circle;
    },

    replacePlannings:function(itemid,message){
        var selectedPlanning=message.plannings[itemid-1];
        var pid=message.plannings[itemid-1][0].planningID;
        var rating=message.pratings.ratings[itemid-1];
        ajaxCommunicator.acceptPlanning(uiIra.defaults._selectedPlanningId, pid);
        var obj=[];
        obj.push(selectedPlanning);
        var parser=new NEWPARSER(obj);
        var obj1=[];
        obj1.push(rating);
        parser.setRatingsForIRA(obj1);
        var tgData= parser.getTravelDataForMotSlider();
        // restart ira
        uiIra.restartIRA(tgData);
        // remove the loading icon
        uiIra.removeLoadingSlotForPR();
    },
// extract the route path from the trippoints call this function once the route is drawn.
    extractRoutePath:function(segmentRoute){
        var lineCoords = [];

        //for each item
        //console.log("SEGLENT:"+ segmentRoute.items.length);
        for (var i = 0; i <  segmentRoute.items.length; i++)
        {

            Lat = segmentRoute.items[i].startpos.latitude;
            Lon = segmentRoute.items[i].startpos.longitude;
//            console.log("LAT:"+Lat+" LON:"+Lon);
            lineCoords.push( new google.maps.LatLng(Lat , Lon) );
            //Recognize extrema

            //Add the trippoints of the current item
            var trippoints = segmentRoute.items[i].trippoints;
            var n = trippoints.length;

            //Ignore the first and last because they are handle separately
            //for defining bounds
            for (var j = 1; j < n-1; j++)
            {
                Lat = trippoints[j].Ax1.geoLocation.Ax1.latitude;
                Lon = trippoints[j].Ax1.geoLocation.Ax1.longitude;
//                console.log("LAT:"+Lat+" LON:"+Lon);
                lineCoords.push( new google.maps.LatLng(Lat , Lon) );
            }//endof FOR

            Lat = segmentRoute.items[i].endpos.latitude;
            Lon = segmentRoute.items[i].endpos.longitude;
//            console.log("LAT:"+Lat+" LON:"+Lon);
            lineCoords.push( new google.maps.LatLng(Lat, Lon) );
            //Recognize extrema


        }//endof FOR
        //console.log("LIECOORDS:"+lineCoords.length);

        uiIra.defaults._lineCoordinations=lineCoords;

    },
    calculateTotalPath:function(coordinates){

        var coor1=null;
        var coor2=null;
        var distance=0;

        function rad(x) {
            return x * Math.PI / 180;
        };

        function getDistance(p1, p2) {
            var R = 6378137; // Earth’s mean radius in meter
            var dLat = rad(p2.lat() - p1.lat());
            var dLong = rad(p2.lng() - p1.lng());
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
                Math.sin(dLong / 2) * Math.sin(dLong / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return d; // returns the distance in meter
        };

        for (var i = 0; i < uiIra.defaults._lineCoordinations.length - 1; i++) {
            coor1=uiIra.defaults._lineCoordinations[i];
            coor2=uiIra.defaults._lineCoordinations[i+1];
            distance += getDistance(coor1, coor2);
            i++; // linecoords is composed of [start1, end1, start2, end2].
            // As end1 and start2 are nearly on the same environment
            // we jump one item.
        }

       // console.debug("Total Distance from start and end points",distance);
        this.defaults._totalRouteLength=distance;


    },
    // Calculate the distance of the traveled route
    calculateDistance:function(latestPoint)
    {
        var distance=0;
        //var googleDistance=0;
        if(latestPoint!="undefined" && latestPoint!=null) {

            var coor=null;
            var point=new google.maps.LatLng(latestPoint.lat, latestPoint.lng);
            //console.log("P LON:"+point.lng()+" P LAT:"+point.lat());
            var nomatch=true;
            for (var i = 0; i < uiIra.defaults._lineCoordinations.length - 1; i++) {
                coor=uiIra.defaults._lineCoordinations[i];

                if (point.lat()== coor.lat() && point.lng()== coor.lng()) {
                    distance += getDistance(coor, uiIra.defaults._lineCoordinations[i + 1]);
                    //console.log("Place:"+i+" LON:"+coor.lng()+"  LAT:"+coor.lat());
                    i = uiIra.defaults._lineCoordinations.length - 1;
                    nomatch=false;
                } else {
                    distance += getDistance(uiIra.defaults._lineCoordinations[i], uiIra.defaults._lineCoordinations[i + 1]);
                }
                i++;
            }
        }

        function rad(x) {
            return x * Math.PI / 180;
        };

        function getDistance(p1, p2) {
            var R = 6378137; // Earth’s mean radius in meter
            var dLat = rad(p2.lat() - p1.lat());
            var dLong = rad(p2.lng() - p1.lng());
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
                Math.sin(dLong / 2) * Math.sin(dLong / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return d; // returns the distance in meter
        };

        //console.log("TRAVELED ROUTE UNTIL NOW:"+Math.round(distance   * 100) / 100);
        //console.log("TOTAL DISTANCE:"+googleDistance);
        if(!nomatch){
            return Math.round(distance   * 100) / 100;
        }else{
            return null;
        }

    }//endof calculateDistance()
};


