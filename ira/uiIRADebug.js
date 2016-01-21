
/**
 *
 *@namespace
 * @author Cem Akpolat
 */
var uiIraDebug={
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
        if(uiIraDebug.defaults._gpsMarker!=null){
            uiIraDebug.defaults._gpsMarker.setMap(null);
        }
        if(uiIraDebug.defaults._gpsMarker_BR!=null){
            uiIraDebug.defaults._gpsMarker_BR.setMap(null);
        }
        if(uiIraDebug.defaults._notificationMarker!=null){
            uiIraDebug.defaults._notificationMarker.setMap(null);
        }
    },
    startIRA:function(planningId,planningOrder){

        uiIraDebug.clearMapComponents();
        uiIraDebug.defaults._selectedRouteOrder=planningOrder;
        uiIraDebug.defaults._selectedPlanningId=planningId;
        //var route=uiIraDebug.getSelectedRoutePath(planningId);
        var route=uiIraDebug.getSelectedRoutePath(planningOrder);

//        uiIraDebug.defaults._simStartTime=uiIraDebug.getSimulationTime(function(time){
//            uiIraDebug.updateRouteBar(time);
//            uiIraDebug.defaults._simStartTime=time;
//        });

        uiIraDebug.defaults._gpsMarker = new google.maps.Marker({
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
        uiIraDebug.defaults._gpsMarker_BR = new google.maps.Marker({
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

        uiIraDebug.srCommonIRA(route);
    },

    restartIRA:function(newPlanning){
        // stop the current plan and restart it
        uiIraDebug.stopTimer();
        uiIraDebug.stopUpdateIRA();
//        uiIraDebug.defaults._simStartTime=uiIraDebug.getSimulationTime(function(time){
//            uiIraDebug.updateRouteBar(time);
//            uiIraDebug.defaults._simStartTime=time;
//        });
        var route=uiIraDebug.getUpdatedRoutePath(newPlanning);
        uiIraDebug.srCommonIRA(route);

    },
    // if the same route is restarted, then uiIraDebug will be called
    restartSameRoute:function(){
        uiIraDebug.stopUpdateIRA();
        var route=uiIraDebug.getRoutePath();
        uiIraDebug.srCommonIRA(route);
    },

    srCommonIRA:function(route){

        uiIraDebug.drawPolyLine(uiIraDebug.defaults._currentSegment);
        uiIraDebug.extractRoutePath(uiIraDebug.defaults._currentSegment);
        this.calculateTotalPath(this.defaults._lineCoordinations);
        uiIraDebug.drawRouteBar(route.view);
        uiIraDebug.startTimer();
        //uiIraDebug.startUpdateIRA();
        google.maps.event.trigger(motMap, "resize");


        uiIraDebug.getCurrentPosition(function(position){
//            uiIraDebug.markCurrentPosition(position.lat,position.lng);
            uiIraDebug.updateCurrentPosition(position.lat,position.lng);
            uiIraDebug.defaults._latestGPSData=position;

        });
        // get GPS Data From Backend
        uiIraDebug.getVehicleType(function(type){
            uiIraDebug.defaults._currentVehicle=type;
        });// get Possible Vehicle Type from Backend

//        uiIraDebug.getSimulationTime(function(time){
//            uiIraDebug.updateRouteBar(time);
//            uiIraDebug.defaults._simStartTime=time;
//        });

        uiIraDebug.defaults._popupSegmentOpened=false;
        $(".slider-routes").on("click",function(){
            if(!uiIraDebug.defaults._popupSegmentOpened) {
                drawRoutes.generateSegmentPopup(uiIraDebug.defaults._currentSegment, $(this));
                uiIraDebug.defaults._popupSegmentOpened=true;
            }else{
                $('.rv-route-list').remove();
                uiIraDebug.defaults._popupSegmentOpened=false;
            }
        });
        $("#btn-replanning").on("click",function(){
            if(!uiIraDebug.defaults._manuallUpdateStarted){
                uiIraDebug.defaults._manuallUpdateStarted=true;
                this.updateIRAManually();
            }
        });
    },

    startUpdateIRA:function(){
        uiIraDebug.defaults._updateIRA=setInterval(uiIraDebug.updateIRA,uiIraDebug.defaults._updateDuration); // every 10 seconds call
    },
    stopUpdateIRA:function(){
        clearInterval(uiIraDebug.defaults._updateIRA);
    },
    updateIRAManually:function(){
        var message=this.getReplanningProposals();
        // manually replanning Requst
        console.debug("message",message);
        if(message.title=="REPLANNING"){
            drawRoutes.removeLoadingSlotForNewPlanningRequests();
            uiIraDebug.defaults._loadingProcessForMessages=drawRoutes.addLoadingSlotForNewPlanningRequests();
            //var plan=message.plannings;
            uiIraDebug.popupMessage(message,  uiIraDebug.defaults._latestGPSData);
            uiIraDebug.defaults._manuallUpdateStarted=false;
        }
    },
    getReplanningProposals:function(){
        return BackendImitator.getNewPlanning();

    },
    updateIRA:function(){

        //TODO: Enable the code below for real data
        uiIraDebug.getAnyMessage(function(message){

            if(message.title=="REPLANNING"){
                drawRoutes.removeLoadingSlotForNewPlanningRequests();
                uiIraDebug.defaults._loadingProcessForMessages=drawRoutes.addLoadingSlotForNewPlanningRequests();
                //var plan=message.plannings;
                uiIraDebug.popupMessage(message,  uiIraDebug.defaults._latestGPSData);
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
                //close popup
                //console.log("message: RECALLING");
                if(uiIraDebug.defaults._infoWindow!=null){
                    uiIraDebug.defaults._infoWindow.setContent(null);
                    uiIraDebug.defaults._infoWindow.close();
                    uiUtilities.popupTimeout('Die Ihnen gemachten Vorschläge wurden ungültig und deswegen verworfen!',
                        'Vorschläge verworfen!');
                }
            }

            uiIraDebug.getCurrentPosition(function(position){
                //uiIraDebug.markCurrentPosition(position.lat,position.lng);
                uiIraDebug.updateCurrentPosition(position.lat,position.lng);
                uiIraDebug.defaults._latestGPSData=position;
            });
            // get GPS Data From Backend
//            uiIraDebug.getVehicleType(function(type){
//                uiIraDebug.defaults._currentVehicle=type;
//            });
            // get Possible Vehicle Type from Backend
//            uiIraDebug.getSimulationTime(function(time){
//                uiIraDebug.updateRouteBar(time);
//            });

        });

    },

    getCurrentPosition:function(callback){
        var res=BackendImitator.getGPSData();
        uiIraDebug.updateCurrentPosition(res.lat,res.lng);
        callback(res);
//
//        ajaxCommunicator.getCurrentLocation(function(res){
//            console.log("C. POSITION:"+uiIraDebug.defaults._latestGPSData);
//            callback(res);
//        });
    },

    updateCurrentPosition:function(lat,lng){
        if(lat!=null && lng!=null) {
            var latlng = new google.maps.LatLng(lat, lng);
            uiIraDebug.defaults._gpsMarker.setPosition(latlng);
            uiIraDebug.defaults._gpsMarker_BR.setPosition(latlng);

        }
    },

    getVehicleType:function(callback){
        var res=BackendImitator.getVehicleType();
        callback(res);
//        ajaxCommunicator.getCurrentTransportationMode(function(res){
//            // console.log("Vehicle Type:"+res);
//            callback(res);
//        });

    },
    getAnyMessage:function(callback){
        var res=BackendImitator.getAnyMessageFromMOT();
        callback(res);
//        ajaxCommunicator.messageFromMonitoringTool(uiIraDebug.defaults._selectedPlanningId, function(data){
//            callback(data);
//
//        });
    },

    getUpdatedRoutePath:function(newPlanning){
        uiIraDebug.defaults._selectedRoute=newPlanning.slots[0];
        return uiIraDebug.getRoutePath();
    },

    getSelectedRoutePath:function(planningId){
        uiIraDebug.defaults._selectedRoute=drawRoutes.getSelectedPlanning(planningId);
        return uiIraDebug.getRoutePath();
    },
    getRoutePath:function(){
        var result=drawRoutes.generateTravelSlider(uiIraDebug.defaults._selectedRoute);
        uiIraDebug.defaults._currentSegment=uiIraDebug.defaults._selectedRoute.segments[0]; // here only one segment is regarded
        uiIraDebug.defaults._travelDuration=result.duration;
//        console.log("Travel Duration:"+uiIraDebug.defaults._travelDuration);
        return result;
    },
    startTimer:function(){
        uiIraDebug.defaults._passedDuration=0; // start the from null;
        uiIraDebug.defaults._timer=setInterval(uiIraDebug.updateRouteBar,uiIraDebug.defaults._updateDuration);
    },
    stopTimer:function(){
        clearInterval(uiIraDebug.defaults._timer);
    },
    updateRouteBar:function(time){

        var currentTime = new Date(time);
        var startTime=new Date(uiIraDebug.defaults._simStartTime);
        console.log("current time :"+uiIraDebug.defaults._simStartTime +"startTime:"+time);
        console.log("current time :"+currentTime +"startTime:"+startTime);
        var diffMs = (currentTime - startTime); // milliseconds between now & Christmas
        var passedDuration = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
        //var passedDuration=currentTime-uiIraDebug.defaults._simStartTime;
        var blackSpace= (passedDuration/uiIraDebug.defaults._travelDuration)*100;
        console.log("Passed Duration:"+passedDuration +" Black Space:"+blackSpace);

        $("#slider-filler").css("width",blackSpace+"%");
        $("#slider-separator").css("margin-left",(blackSpace-0.5)+"%");
    },
    updateRouteBar:function(){
        var distance=uiIraDebug.calculateDistance(uiIraDebug.defaults._latestGPSData);
        if(distance!=null){
            var blackSpace= (distance/uiIraDebug.defaults._totalRouteLength)*100;
            console.debug("Passed Duration:"+distance +" Black Space:"+blackSpace +" ",uiIraDebug.defaults._totalRouteLength);
            $("#slider-filler").css("width",blackSpace+"%");
            $("#slider-separator").css("margin-left",(blackSpace-0.5)+"%");
        }
    },
//    updateRouteBar:function(){
//        // increase here the
//        uiIraDebug.defaults._passedDuration=uiIraDebug.defaults._passedDuration+0.250;
//        var blackSpace= (uiIraDebug.defaults._passedDuration/uiIraDebug.defaults._travelDuration)*100;
//        //console.log("Passed Duration:"+uiIraDebug.defaults._passedDuration +" Black Space:"+blackSpace);
//
//
//        $("#slider-filler").css("width",blackSpace+"%");
//        $("#slider-separator").css("margin-left",(blackSpace-0.5)+"%");
//    },
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
            infoContent=  uiIraDebug.prepareInfoWindow(message.message,currentPosition,routes,message.plannings.length);

        } else {
            infoContent=  uiIraDebug.prepareInfoWindow(message.message,currentPosition);
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
        if(uiIraDebug.defaults._infoWindow!=null ){
            uiIraDebug.defaults._infoWindow.setContent(null);
            uiIraDebug.defaults._infoWindow.close();
        }
        if(uiIraDebug.defaults._notificationMarker!=null ){
            uiIraDebug.defaults._notificationMarker.setMap(null);
        }
        // assign new window object
        uiIraDebug.defaults._infoWindow = new google.maps.InfoWindow(options);
        google.maps.event.addListener(uiIraDebug.defaults._infoWindow, 'domready', function() {
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
        google.maps.event.addListener(uiIraDebug.defaults._infoWindow, 'closeclick', function(result) {
            uiIraDebug.defaults._notificationMarker = new google.maps.Marker({
                position:  new google.maps.LatLng(currentPosition.lat, currentPosition.lng),
                map: motMap,
                icon:image,
                title: 'Notification'
            });
            google.maps.event.addListener( uiIraDebug.defaults._notificationMarker, 'click', function() {
                uiIraDebug.defaults._infoWindow.open(motMap, uiIraDebug.defaults._notificationMarker);
                uiIraDebug.enableButtonsOnInfoWindow(message, uiIraDebug.defaults._notificationMarker);
            });
        });

        google.maps.event.trigger(motMap, "resize");
        motMap.setCenter(options.position);
        // enable the buttons on the infowindow
        uiIraDebug.enableButtonsOnInfoWindow(message);
        //uiIraDebug.showWrapper(infoContent);
    },
    showWrapper:function(infoContent){
        var html='<div  id="infoWrapper" style="width:100%;padding-left:5%;padding-right:5%"><div style="width:90%;height:300px;text-align:center;position:absolute;bottom:0px; background:white;">'+infoContent+'</div></div>';
        $("#infoWrapper").remove();
        $("#mot-container-ira").append(html).show();
    },
    enableButtonsOnInfoWindow:function(message,marker) {
        function refreshButtons() {

            $(".routeCapsule").on("mousedown", function () {
                $(this).css("background-color", " #436684 ");
                $(this).css("border", "1px #436684 solid");
            });

            $(".routeCapsule").on("click", function (event) {
                if (marker != undefined) {
                    marker.setMap(null);
                }
                event.stopPropagation();
                uiIraDebug.defaults._infoWindow.setContent(null);
                uiIraDebug.defaults._infoWindow.close();
                var itemid = $(this).attr("itemid");
//                uiIraDebug.replacePlannings(message.plannings[itemid - 1][0].planningID, itemid, message.plannings, message.ratings[itemid - 1]);
                uiIraDebug.replacePlannings(itemid,message.plannings,message.pratings);

            });
        }
        refreshButtons();
        $("#refreshAltBtn").click(function(){

            // clear the routes and title
            // add new request is being sent
            // show the routes on the popup
            $('.alternativeRoutes').empty();
            $('#refresh').css("padding-top","0px");
            $('.alternativeRoutes').html(js_ira_newAlternativeRoutes);
            $('.alternativeRoutes').html(uiIraDebug.addLoader().canvas);


            uiIraDebug.getPlanningProposals(uiIraDebug.defaults._selectedPlanningId,function(newPlans){
                $('.alternativeRoutes').empty();
                console.debug('New Plannings', newPlans);
                var routes=drawRoutes.getFirstItemsFromPlannings(newPlans.plannings, message.message);
                $('.alternativeRoutes').append(routes);
                // remove the loading icon
                drawRoutes.removeLoadingSlotForNewPlanningRequests();
                refreshButtons();
            })


        });

    },

    getPlanningProposals:function(planningId,callback){
        var newPlans=BackendImitator.getNewPlanning();
        callback(newPlans);
        //ajaxCommunicator.getPlanningProposals(uiIraDebug.defaults._selectedPlanningId,function(newPlans){...});
    },
    prepareInfoWindow:function(message,location,routes,itemCount){
        var html='',information='';
        if(routes!=undefined){
            information=message;
            information="Gleis Strörung U6 fährt unregelmaßig";// TODO: Remove this line once you receive the right message from monitoring
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

    replacePlannings:function(itemid,plannings,rating){
        BackendImitator.restart();
//        ajaxCommunicator.acceptPlanning(this.defaults._selectedPlanningId);
        var obj=[];
        obj.push(plannings[itemid-1]); // selected planning
        var parser=new NEWPARSER(obj); // selected rating

        var obj1=[];
        obj1.push(rating[itemid-1]);
        parser.setRatingsForIRA(obj1);
        var tgData= parser.getTravelDataForMotSlider();
        this.restartIRA(tgData);
        drawRoutes.removeLoadingSlotForNewPlanningRequests();


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

        uiIraDebug.defaults._lineCoordinations=lineCoords;

    },
    calculateTotalPath:function(coordinates){

        var coor1=null;
        var coor2=null;
        var distance=0;
        for (var i = 0; i < uiIraDebug.defaults._lineCoordinations.length - 1; i++) {
            coor1=uiIraDebug.defaults._lineCoordinations[i];
            coor2=uiIraDebug.defaults._lineCoordinations[i+1];
            distance += getDistance(coor1, coor2);
            i++; // linecoords is composed of [start1, end1, start2, end2].
            // As end1 and start2 are nearly on the same environment
            // we jump one item.
        }
        console.debug("Total Distance from start and end points",distance);
        this.defaults._totalRouteLength=distance;

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
            for (var i = 0; i < uiIraDebug.defaults._lineCoordinations.length - 1; i++) {
                coor=uiIraDebug.defaults._lineCoordinations[i];

                if (point.lat()== coor.lat() && point.lng()== coor.lng()) {
                    distance += getDistance(coor, uiIraDebug.defaults._lineCoordinations[i + 1]);
                    //console.log("Place:"+i+" LON:"+coor.lng()+"  LAT:"+coor.lat());
                    i = uiIraDebug.defaults._lineCoordinations.length - 1;
                    nomatch=false;
                } else {
                    distance += getDistance(uiIraDebug.defaults._lineCoordinations[i], uiIraDebug.defaults._lineCoordinations[i + 1]);
                }
                // googleDistance+=google.maps.geometry.spherical.computeDistanceBetween(lineCoords[i], lineCoords[i+1])
//                console.log("Google Mes:"+googleDistance+" our method:"+distance);
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
    //    popupMessage:function(message,currentPosition){
//
//        var infoContent ='';
//
//        if(message.title=="REPLANNING") {
//            console.log("MESSAGE:"+message.message);
//            var routes=drawRoutes.getFirstItemsFromPlannings(message.plannings, message.message);
//            console.log("HTML"+routes);
//            infoContent='<div>'+routes+'</div>';
//            //add routes to the content
//        } else {
//            var title='<div class="">'+message.title+'</div>';
//            infoContent=title;
//        }
//
//
//        infoWindowMaxZIndex+=1;
//
//        var options = {
//            map: motMap,
//            position: new google.maps.LatLng(currentPosition.lat, currentPosition.lng),
//            content: infoContent,
//            zIndex:	infoWindowMaxZIndex,
//            boxClass: "infoWindow"
//        };
//
//        if(uiIraDebug.defaults._infoWindow!=null ){
//            uiIraDebug.defaults._infoWindow.setContent(null);
//            uiIraDebug.defaults._infoWindow.close();
//        }
//        uiIraDebug.defaults._infoWindow = new google.maps.InfoWindow(options);
//
//        google.maps.event.addListener(uiIraDebug.defaults._infoWindow, 'closeclick', function(result) {
//            uiIraDebug.defaults._infoWindow.setContent(null);
//        });
//        google.maps.event.trigger(motMap, "resize");
//        motMap.setCenter(options.position);
//
//
//        $(".infoWindowButton").mousedown(function(){
//            $(this).css("background-color","grey");
//            $(this).css("border","1px black solid");
//        });
//
//        $(".infoWindowButton").click(function(event){
//            event.stopPropagation();
//            uiIraDebug.defaults._infoWindow.setContent(null);
//            uiIraDebug.defaults._infoWindow.close();
//            var itemid=$(this).attr("itemid"); // selected slot, item id can be thought as slot-id
//            var pid=$(this).attr("planningid");
//            console.log("clicked itemid"+itemid);
//            uiIraDebug.replacePlannings(pid,itemid,message.plannings,message.pratings);
//        });
//    },
};


