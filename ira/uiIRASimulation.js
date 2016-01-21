/**
 *
 *@namespace
 * @author Cem Akpolat
 */
var uiIraSimulation={
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

        this.clearMapComponents();
        this.defaults._selectedRouteOrder=planningOrder;
        this.defaults._selectedPlanningId=planningId;
        //var route=this.getSelectedRoutePath(planningId);
        var route=this.getSelectedRoutePath(planningOrder);

        this.defaults._gpsMarker = new google.maps.Marker({
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
        this.defaults._gpsMarker_BR = new google.maps.Marker({
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

        this.srCommonIRA(route);
    },

    restartIRA:function(newPlanning){
        // stop the current plan and restart it
        this.stopUpdateIRA();
        var route=this.getUpdatedRoutePath(newPlanning);
        this.srCommonIRA(route);

    },
    // if the same route is restarted, then this will be called
    restartSameRoute:function(){
        this.stopUpdateIRA();
        var route=this.getRoutePath();
        this.srCommonIRA(route);
    },

    srCommonIRA:function(route){
        this.drawPolyLine(this.defaults._currentSegment);
        this.extractRoutePath(this.defaults._currentSegment);
        this.drawRouteBar(route.view);
        this.startUpdateIRA();
        google.maps.event.trigger(motMap, "resize");

        uiIraSimulation.getCurrentPosition(function(position){
            uiIraSimulation.updateCurrentPosition(position.lat,position.lng);
            uiIraSimulation.defaults._latestGPSData=position;

        });

        uiIraSimulation.defaults._popupSegmentOpened=false;
        $(".slider-routes").on("click",function(){
            if(!uiIraSimulation.defaults._popupSegmentOpened) {
                drawRoutes.generateSegmentPopup(uiIraSimulation.defaults._currentSegment, $(this));
                uiIraSimulation.defaults._popupSegmentOpened=true;
            }else{
                $('.rv-route-list').remove();
                uiIraSimulation.defaults._popupSegmentOpened=false;
            }
        });
        // replanning of the travel
        $("#btn-replanning").on("click",function(){
            if(!uiIraSimulation.defaults._manuallUpdateStarted){
                uiIraSimulation.defaults._manuallUpdateStarted=true;
                uiIraSimulation.updateIRAManually();
            }
        });
    },

    startUpdateIRA:function(){
        this.defaults._updateIRA=setInterval(this.updateIRA,uiIraSimulation.defaults._updateDuration); // every 10 seconds call
    },
    stopUpdateIRA:function(){
        clearInterval(this.defaults._updateIRA);
    },
    removeLoadingSlotForPR:function(){
        drawRoutes.removeLoadingSlotForNewPlanningRequests();
        uiIraSimulation.defaults._loadingProcessForMessages=null;
    },
    addLoadingSlotForPR:function(){
        uiIraSimulation.removeLoadingSlotForPR();
        uiIraSimulation.defaults._loadingProcessForMessages=drawRoutes.addLoadingSlotForNewPlanningRequests();
    },
    updateIRAManually:function(){
        uiIraSimulation.getReplanningProposals(uiIraSimulation.defaults._selectedPlanningId,function(message){
            if(message.title=="REPLANNING"){
                uiIraSimulation.addLoadingSlotForPR();
                uiIraSimulation.popupMessage(message,  uiIraSimulation.defaults._latestGPSData);
                uiIraSimulation.defaults._manuallUpdateStarted=false; // The message is received and the replanning button can be activated again.
            }
        });
    },
    updateIRA:function(){
    	uiIraSimulation.getAnyMessage(function(message){

            if(message.title=="REPLANNING"){
                uiIraSimulation.addLoadingSlotForPR();
                uiIraSimulation.popupMessage(message,  uiIraSimulation.defaults._latestGPSData);
            }
            else if(message.title=="FINE"){
                console.log("message: FINE");
            }
            else if(message.title=="TRAFFIC_INCIDENCE"){
                //popup
                console.log("message: TRAFFIC_INCIDENCE");
            }
            else if (message.title=="RECALLING") {
                if(uiIraSimulation.defaults._infoWindow!=null){
                    uiIraSimulation.defaults._infoWindow.setContent(null);
                    uiIraSimulation.defaults._infoWindow.close();
                    uiUtilities.popupTimeout('Die Ihnen gemachten Vorschläge wurden ungültig und deswegen verworfen!',
                        'Vorschläge verworfen!');
                }
            }
            uiIraSimulation.getCurrentPosition(function(position){
                uiIraSimulation.updateCurrentPosition(position.lat,position.lng);
                uiIraSimulation.defaults._latestGPSData=position;
            });

        });
        uiIraSimulation.updateRouteBar();
    },
    getCurrentProgress:function(callback){
        ajaxCommunicator.getCurrentProgress(uiIraSimulation.defaults._selectedPlanningId, function(progress){
            if(progress!=null && progress!=""){
                callback(progress);
            }
        });
    },
    //TODO: Use the time, transport-mode info and
    updateRouteBar:function(){
        uiIraSimulation.getCurrentProgress(function(progress){
            //console.debug("Progress:",progress.progress);
            uiIraSimulation.updateTimeBar(progress.progress);
        });
    },
    updateTimeBar:function(progress){
        var distance=progress*100;
        if(distance!=null){
            console.log("Progress:"+distance );
            $("#slider-filler").css("width",distance+"%");
            $("#slider-separator").css("margin-left",(distance-0.5)+"%");
        }
    },
    getCurrentPosition:function(callback){
        ajaxCommunicator.getCurrentLocation(function(res){
            //console.log("C. POSITION:"+uiIraSimulation.defaults._latestGPSData);
            callback(res);
        });
    },

    updateCurrentPosition:function(lat,lng){
        if(lat!=null && lng!=null) {
            var latlng = new google.maps.LatLng(lat, lng);
            uiIraSimulation.defaults._gpsMarker.setPosition(latlng);
            uiIraSimulation.defaults._gpsMarker_BR.setPosition(latlng);

        }
    },

    getVehicleType:function(callback){
        ajaxCommunicator.getCurrentTransportationMode(function(res){
          // console.log("Vehicle Type:"+res);
            callback(res);
        });

    },
    getAnyMessage:function(callback){
        ajaxCommunicator.messageFromMonitoringTool(this.defaults._selectedPlanningId, function(data){
            callback(data);

        });
    },
    getUpdatedRoutePath:function(newPlanning){
        this.defaults._selectedRoute=newPlanning.slots[0];
        return this.getRoutePath();
    },

    getSelectedRoutePath:function(planningId){
        this.defaults._selectedRoute=drawRoutes.getSelectedPlanning(planningId);
        return this.getRoutePath();
    },
    getRoutePath:function(){
        var result=drawRoutes.generateTravelSlider(this.defaults._selectedRoute);
        this.defaults._currentSegment=this.defaults._selectedRoute.segments[0]; // here only one segment is regarded
        this.defaults._travelDuration=result.duration;
        return result;
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
            infoContent=  this.prepareInfoWindow(message.message,currentPosition,routes,message.plannings.length);

        } else {
            infoContent=  this.prepareInfoWindow(message.message,currentPosition);
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
        if(uiIraSimulation.defaults._infoWindow!=null ){
            uiIraSimulation.defaults._infoWindow.setContent(null);
            uiIraSimulation.defaults._infoWindow.close();
        }
        if(uiIraSimulation.defaults._notificationMarker!=null ){
            uiIraSimulation.defaults._notificationMarker.setMap(null);
        }
        // assign new window object
        uiIraSimulation.defaults._infoWindow = new google.maps.InfoWindow(options);
        google.maps.event.addListener(uiIraSimulation.defaults._infoWindow, 'domready', function() {
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
        google.maps.event.addListener(uiIraSimulation.defaults._infoWindow, 'closeclick', function(result) {
            uiIraSimulation.defaults._notificationMarker = new google.maps.Marker({
                position:  new google.maps.LatLng(currentPosition.lat, currentPosition.lng),
                map: motMap,
                icon:image,
                title: 'Notification'
            });
            google.maps.event.addListener( uiIraSimulation.defaults._notificationMarker, 'click', function() {
                uiIraSimulation.defaults._infoWindow.open(motMap, uiIraSimulation.defaults._notificationMarker);
                uiIraSimulation.enableButtonsOnInfoWindow(message, uiIraSimulation.defaults._notificationMarker);
            });
        });

        google.maps.event.trigger(motMap, "resize");
        motMap.setCenter(options.position);
        // enable the buttons on the infowindow
        uiIraSimulation.enableButtonsOnInfoWindow(message);
        uiIraSimulation.removeLoadingSlotForPR();

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
                uiIraSimulation.defaults._infoWindow.setContent(null);
                uiIraSimulation.defaults._infoWindow.close();
                var itemid = $(this).attr("itemid");

                uiIraSimulation.replacePlannings(itemid, message);
            });
        };
        refreshButtons();
        $("#refreshAltBtn").click(function(){
            uiIraSimulation.addLoadingSlotForPR();
            $('.alternativeRoutes').empty();
            $('#refresh').css("padding-top","0px");
            $('.alternativeRoutes').html(js_ira_newAlternativeRoutes);
            $('.alternativeRoutes').html(uiIraSimulation.addLoader().canvas);

            ajaxCommunicator.getPlanningProposals(uiIraSimulation.defaults._selectedPlanningId,function(newPlans){
                $('.alternativeRoutes').empty();
                var routes=drawRoutes.getFirstItemsFromPlannings(newPlans, message.message);
                $('.alternativeRoutes').append(routes);
                refreshButtons();
            });

        });

    },
    prepareInfoWindow:function(message,location,routes,itemCount){
        var html='',information='';
        if(routes!=undefined){
            information=message;//"Gleis Strörung U6 fährt unregelmaßig"
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
        ajaxCommunicator.acceptPlanning(this.defaults._selectedPlanningId, pid);
        var obj=[];
        obj.push(selectedPlanning);
        var parser=new NEWPARSER(obj);
        var obj1=[];
        obj1.push(rating);
        parser.setRatingsForIRA(obj1);
        var tgData= parser.getTravelDataForMotSlider();
        // restart ira simulation
        this.restartIRA(tgData);

        // remove the loading icon
        uiIraSimulation.removeLoadingSlotForPR();
    },
    // Extract the route path from the trippoints call this function once the route is drawn.
    extractRoutePath:function(segmentRoute){
        var lineCoords = [];

        //for each item
        for (var i = 0; i <  segmentRoute.items.length; i++)
        {
            Lat = segmentRoute.items[i].startpos.latitude;
            Lon = segmentRoute.items[i].startpos.longitude;
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
                lineCoords.push( new google.maps.LatLng(Lat , Lon) );
            }//endof FOR

            Lat = segmentRoute.items[i].endpos.latitude;
            Lon = segmentRoute.items[i].endpos.longitude;
            lineCoords.push( new google.maps.LatLng(Lat, Lon) );
            //Recognize extrema

        }//endof FOR
        this.defaults._lineCoordinations=lineCoords;

    }

    // Calculate the distance of the traveled route
//    calculateDistance:function(latestPoint)
//    {
//        var distance=0;
//        //var googleDistance=0;
//        if(latestPoint!="undefined" && latestPoint!=null) {
//
//            var coor=null;
//            var point=new google.maps.LatLng(latestPoint.lat, latestPoint.lng);
//            //console.log("P LON:"+point.lng()+" P LAT:"+point.lat());
//            var nomatch=true;
//            for (var i = 0; i < this.defaults._lineCoordinations.length - 1; i++) {
//                coor=this.defaults._lineCoordinations[i];
//
//                if (point.lat()== coor.lat() && point.lng()== coor.lng()) {
//                    distance += getDistance(coor, this.defaults._lineCoordinations[i + 1]);
//                    //console.log("Place:"+i+" LON:"+coor.lng()+"  LAT:"+coor.lat());
//                    i = this.defaults._lineCoordinations.length - 1;
//                    nomatch=false;
//                } else {
//                    distance += getDistance(this.defaults._lineCoordinations[i], this.defaults._lineCoordinations[i + 1]);
//                }
//                // googleDistance+=google.maps.geometry.spherical.computeDistanceBetween(lineCoords[i], lineCoords[i+1])
////                console.log("Google Mes:"+googleDistance+" our method:"+distance);
//                i++;
//            }
//        }
//
//        function rad(x) {
//            return x * Math.PI / 180;
//        };
//
//        function getDistance(p1, p2) {
//            var R = 6378137; // Earth’s mean radius in meter
//            var dLat = rad(p2.lat() - p1.lat());
//            var dLong = rad(p2.lng() - p1.lng());
//            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//                Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
//                Math.sin(dLong / 2) * Math.sin(dLong / 2);
//            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//            var d = R * c;
//            return d; // returns the distance in meter
//        };
//
//        //console.log("TRAVELED ROUTE UNTIL NOW:"+Math.round(distance   * 100) / 100);
//        //console.log("TOTAL DISTANCE:"+googleDistance);
//        if(!nomatch){
//            return Math.round(distance   * 100) / 100;
//        }else{
//            return null;
//        }
//
//    }//endof calculateDistance()

};

