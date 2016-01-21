/**
 *
 *@namespace
 * @author Cem Akpolat
 */
// TODO: Add a Message Handler for applying the right icons as well as functions.
var uiIraSimulationDebug={
    defaults:{
        _lineCoordinations:null,
        _totalRouteLength:null,
        _infoWindow:null,
        _notificationMarker:null,
        _selectedRoute:'',
        _latestGPSData:null,
        _plannedRoutes:'',
        _gpsMarker:null,
        _gpsMarker_BR:null,
        _gpsView:null,
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
        // clear all
        this.clearMapComponents();
        this.defaults._selectedRouteOrder=planningOrder;
        this.defaults._selectedPlanningId=planningId;
        //var route=this.getSelectedRoutePath(planningId);
        var route=this.getSelectedRoutePath(planningOrder);

        this.defaults._simStartTime=this.getSimulationTime();
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
        this.stopUpdateIRA();
        this.defaults._simStartTime=this.getSimulationTime();
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

        this.defaults._totalRouteLength=this.defaults._selectedRoute.segments[0].waydata.distance;
        //console.log("TOTAL LEN:"+this.defaults._totalRouteLength);
        this.drawPolyLine(this.defaults._currentSegment);
        this.extractRoutePath(this.defaults._currentSegment);
        this.drawRouteBar(route.view);
        this.startUpdateIRA();

        google.maps.event.trigger(motMap, "resize");

        // showing route details
        uiIraSimulationDebug.defaults._popupSegmentOpened=false;
        $(".slider-routes").on("click",function(){
            if(!uiIraSimulationDebug.defaults._popupSegmentOpened) {
                drawRoutes.generateSegmentPopup(uiIraSimulationDebug.defaults._currentSegment, $(this));
                uiIraSimulationDebug.defaults._popupSegmentOpened=true;
            }else{
                $('.rv-route-list').remove();
                uiIraSimulationDebug.defaults._popupSegmentOpened=false;
            }
        });
    },

    startUpdateIRA:function(){
        this.defaults._updateIRA=setInterval(this.updateIRA,uiIraSimulationDebug.defaults._updateDuration); // every 10 seconds call
    },
    stopUpdateIRA:function(){
        clearInterval(this.defaults._updateIRA);
    },
    updateIRA:function(){

        uiIraSimulationDebug.getAnyMessage(function(message){
            if(message.title=="REPLANNING"){
                var plan=message.plan;
                uiIraSimulationDebug.popupMessage(message,  uiIraSimulationDebug.defaults._latestGPSData);
            }
            else if(message.title=="FINE"){
                //popup
                console.log("MOT: FINE");
            }
        });

        uiIraSimulationDebug.getCurrentPosition(function(gps){
            uiIraSimulationDebug.defaults._latestGPSData=gps;
            uiIraSimulationDebug.updateRouteBar();
        }); // get GPS Data From Backend

       // uiIra.getVehicleType();// get Possible Vehicle Type from Backend

    },

    getCurrentPosition:function(callback){
        var res=BackendImitator.getGPSData();
//        uiIraSimulationDebug.markCurrentPosition(res.lat,res.lng);
        uiIraSimulationDebug.updateCurrentPosition(res.lat,res.lng);

        callback(res);
    },
    updateCurrentPosition:function(lat,lng){
        if(lat!=null && lng!=null) {
            var latlng = new google.maps.LatLng(lat, lng);
            uiIraSimulationDebug.defaults._gpsMarker.setPosition(latlng);
            uiIraSimulationDebug.defaults._gpsMarker_BR.setPosition(latlng);
//            $("#gpsMarker").css("width","50px");
//            $("#gpsMarker").css("background-color","black");
        }
    },
    getVehicleType:function(){
        var res=BackendImitator.getVehicleType();
        return res;
    },
    getAnyMessage:function(callback){
        var res=BackendImitator.getAnyMessageFromMOT();
        callback(res);

    },
    getSimulationTime:function(){
        return null;
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

    updateRouteBar:function(){
        var distance=this.calculateDistance(uiIraSimulationDebug.defaults._latestGPSData);
        if(distance!=null){
            var blackSpace= (distance/uiIraSimulationDebug.defaults._totalRouteLength)*100;
            //console.log("Passed Duration:"+distance +" Black Space:"+blackSpace);
            $("#slider-filler").css("width",blackSpace+"%");
            $("#slider-separator").css("margin-left",(blackSpace-0.5)+"%");
        }
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
        if(uiIraSimulationDebug.defaults._infoWindow!=null ){
            uiIraSimulationDebug.defaults._infoWindow.setContent(null);
            uiIraSimulationDebug.defaults._infoWindow.close();
        }
        if(uiIraSimulationDebug.defaults._notificationMarker!=null ){
            uiIraSimulationDebug.defaults._notificationMarker.setMap(null);
        }
        // assign new window object
        uiIraSimulationDebug.defaults._infoWindow = new google.maps.InfoWindow(options);
        google.maps.event.addListener(uiIraSimulationDebug.defaults._infoWindow, 'domready', function() {
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
       // var iconBase = 'images/';
        // listen close event of info window
        google.maps.event.addListener(uiIraSimulationDebug.defaults._infoWindow, 'closeclick', function(result) {
            uiIraSimulationDebug.defaults._notificationMarker = new google.maps.Marker({
                position:  new google.maps.LatLng(currentPosition.lat, currentPosition.lng),
                map: motMap,
                icon: image,
                title: 'Notification'
            });
            google.maps.event.addListener(uiIraSimulationDebug.defaults._notificationMarker, 'click', function() {
                uiIraSimulationDebug.defaults._infoWindow.open(motMap,uiIraSimulationDebug.defaults._notificationMarker);
                uiIraSimulationDebug.enableButtonsOnInfoWindow(message,uiIraSimulationDebug.defaults._notificationMarker);
            });
        });

        google.maps.event.trigger(motMap, "resize");
        motMap.setCenter(options.position);
        // enable the buttons on the infowindow
        uiIraSimulationDebug.enableButtonsOnInfoWindow(message);
        //uiIraSimulationDebug.showWrapper(infoContent);
    },
    showWrapper:function(infoContent){
        var html='<div  id="infoWrapper" style="width:100%;padding-left:5%;padding-right:5%"><div style="width:90%;height:300px;text-align:center;position:absolute;bottom:0px; background:white;">'+infoContent+'</div></div>';
        $("#infoWrapper").remove();
        $("#mot-container-ira").append(html).show();
    },
    enableButtonsOnInfoWindow:function(message,marker){
        $(".routeCapsule").mousedown(function(){
            $(this).css("background-color"," #436684 ");
            $(this).css("border","1px #436684 solid");
        });

        $(".routeCapsule").click(function(event){
            if(marker!=undefined){
                marker.setMap(null);
            }
            event.stopPropagation();
            uiIraSimulationDebug.defaults._infoWindow.setContent(null);
            uiIraSimulationDebug.defaults._infoWindow.close();
            var itemid=$(this).attr("itemid");

            //console.log("clicked itemid "+itemid);
            uiIraSimulationDebug.replacePlannings(itemid,message.plannings,message.ratings);
            //update New Planning Route
        });
        $("#refreshAltBtn").click(function(){

            // clear the routes and title
            // add new request is being sent
            // show the routes on the popup
            $('.alternativeRoutes').empty();
            $('#refresh').css("padding-top","0px");
            $('.alternativeRoutes').html(js_ira_newAlternativeRoutes);
            $('.alternativeRoutes').html(uiIraSimulationDebug.addLoader().canvas);

            ajaxCommunicator.getPlanningProposals(uiIraSimulationDebug.defaults._selectedPlanningId,function(newPlans){
                $('.alternativeRoutes').empty();
                var routes=drawRoutes.getFirstItemsFromPlannings(newPlans, message.message);
                $('.alternativeRoutes').append(routes);
            });
            // TODOL Test this function with dummy data

//            ajaxCommunicator.getPlanningProposals(uiIraSimulationDebug.defaults._selectedPlanningId,function(newPlans){
//                $('.alternativeRoutes').empty();
//                var routes=drawRoutes.getFirstItemsFromPlannings(newPlans, message.message);
//                $('.alternativeRoutes').append(routes);
//            });


            //console.log("clicked refreshAltBtn ");

        });

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
    replacePlannings:function(itemid,plannings,rating){
        BackendImitator.restart();
        var selectedPlanning=plannings[itemid-1];
        //console.log(selectedPlanning);
//        ajaxCommunicator.acceptPlanning(this.defaults._selectedPlanningId);
        var obj=[];
        obj.push(selectedPlanning);
        var parser=new NEWPARSER(obj);
//        console.log(parser);
        parser.setRatingsForIRA(rating);
        var tgData= parser.getTravelDataForMotSlider();
        this.restartIRA(tgData);


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
    // pupup Message and prepareInfo Buble functions are intended to implemenet a custom
    // infowindow. However, the change in using button click functionality requires the re-implementation of the
    // major part of the codes, we don't apply the custom info buble.
    popupMessageNEW:function(message,currentPosition){

        var infoContent ='';
        if(message.title=="REPLANNING") {
            //console.log("MESSAGE:"+message.message);
            var routes=drawRoutes.getFirstItemsFromPlannings(message.plannings, message.message);
            this.prepareInfoBubble(message.message,currentPosition,routes);
        } else {

            this.prepareInfoBubble(message.message,currentPosition);
        }

    },
    prepareInfoBubble:function(message,location,routes){
        var information=message;
        var html='';

        //TODO Adapt the size of the box with CSS parameters

        if(routes!=undefined){
            information="Gleis Strörung U6 fährt unregelmaßig";
            html='<div class="infoBox">'
                    +'<div class="messageBox">'
                        +'<div class="messageIcon"><span class="glyphicon glyphicon-warning-sign"></span></div>'
                        +'<div class="messageText">'+information+'</div>'
                    +'</div>'
                +'<br style="clear:both;">'
                    +'<div class="routesBox">'
                        +'<div class="refreshAlternativeBtn"><button id="refreshAltBtn" class="btn btn-default"><span class="glyphicon glyphicon-repeat"></span></button></div>'
                            +'<div class="alternativeRoutes">'
                            +'<div class="routeCapsule">'+routes+'</div>'
                        +'</div>'
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

        if(uiIraSimulationDebug.defaults._infoWindow!=null ){
            uiIraSimulationDebug.defaults._infoWindow.setContent(null);
            uiIraSimulationDebug.defaults._infoWindow.close();
        }
        uiIraSimulationDebug.defaults._infoWindow  = new InfoBubble({
            map: motMap,
            content: html,
            //position: new google.maps.LatLng(-36, 150),
            position: new google.maps.LatLng(location.lat, location.lng),
            shadowStyle: 1,
            padding: 0,
            backgroundColor: "#F0f0f0",//'rgb(57,57,57)',
            borderRadius: 10,
//          arrowSize: 10,
            borderWidth: 1,
//          borderColor: '#2c2c2c',
            disableAutoPan: true,
//          hideCloseButton: true,
//          arrowPosition: 30,
//          backgroundClassName: 'phoney',
            arrowStyle: 0 //0,1,2
        });
//        $(".infoBox").parent().parent().css("overflow","hidden");
        uiIraSimulationDebug.defaults._infoWindow.open();

//        google.maps.event.addDomListener(document.getElementById('open'),
//            'click', function() {
//                uiIraSimulationDebug.defaults._infoWindow.open();
//            });
//        google.maps.event.addDomListener(document.getElementById('close'),
//            'click', function() {
//                uiIraSimulationDebug.defaults._infoWindow.close();
//            });
//

        motMap.setCenter(location);
        google.maps.event.trigger(motMap, "resize");

        $(".infoWindowButton").mousedown(function(){
            $(this).css("background-color","#436684");
            $(this).css("border","1px black solid");
        });

        $(".infoWindowButton").live("click",function(event){

            event.stopPropagation();
            uiIraSimulationDebug.defaults._infoWindow.setContent(null);
            uiIraSimulationDebug.defaults._infoWindow.close();
            var itemid=$(this).attr("itemid"); // selected slot, item id can be thought as slot-id
            //alert("itemid"+itemid+" "+message.plan);
            //console.log("clicked itemid "+itemid);
            uiIraSimulationDebug.replacePlannings(itemid,message.plannings,message.pratings);
            //update New Planning Route
        });
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

        this.defaults._lineCoordinations=lineCoords;

    },

    // Calculate the distance of the traveled route
    calculateDistance:function(latestPoint)
    {
        var distance=0;
        //var googleDistance=0;
        if(latestPoint!="undefined") {

            var coor=null;
            var point=new google.maps.LatLng(latestPoint.lat, latestPoint.lng);
            //console.log("P LON:"+point.lng()+" P LAT:"+point.lat());
            var nomatch=true;
            for (var i = 0; i < this.defaults._lineCoordinations.length - 1; i++) {
                coor=this.defaults._lineCoordinations[i];

                if (point.lat()== coor.lat() && point.lng()== coor.lng()) {
                    distance += getDistance(coor, this.defaults._lineCoordinations[i + 1]);
                    //console.log("Place:"+i+" LON:"+coor.lng()+"  LAT:"+coor.lat());
                    i = this.defaults._lineCoordinations.length - 1;
                    nomatch=false;
                } else {
                    distance += getDistance(this.defaults._lineCoordinations[i], this.defaults._lineCoordinations[i + 1]);
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


};

