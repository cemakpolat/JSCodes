
// For IRA polylines which will be showing on the mot Map
var iraPolylines=[];
//console.log("uiMotView.js is called");
var drawRoutes = {

    defaults:{
        _data:'',
        _headObj:''
    },

    /*Generate Whole slots based on the given datas*/
    generateResults:function(plannings){
        //console.log("Generate Routes "+ plannings);

        this._data=plannings;
        this._headObj=plannings.headObj;
        var html='';
        var slots=plannings.slots;
        for(var i=0;i<slots.length;i++){
            html+=this.generateRoute(slots[i],slots[i].planningID,i+1);
        }
        //console.log("SLOT LEN:"+slots.length);
        if(slots.length==0){
            //console.log("No Route Available");
            html+='<div class="row noRouteAvailable" >'+
                '<div class="col-xs-12 visible-xs"  style=" margin:0 auto;"><div class="noRouteMessage">'+"No Route Available"+'</div></div>' +
                '<div class="col-sm-4 col-md-4 col-lg-4 visible-sm visible-md visible-lg"></div>'+
                '<div class="col-sm-4 col-md-4 col-lg-4 visible-sm visible-md visible-lg">'+"No Route Available"+'</div>'+
                '<div class="col-sm-4 col-md-4 col-lg-4 visible-sm visible-md visible-lg"></div>'+
                '</div>';
        }

        $("#mot-container-routes").empty();         // remove previously obtained datas
        $("#mot-container-routes").append(html);    // add here new data

    },

    /** Each slot data is composed of one or more segments as well as slot related information. The maximum and minimum values extracted from the segments are appended as a parameter to each slot for reaching the data without loosing performance.The structure of the slot can be formed as below:
        slot{
            segments:[],
            co2:,
            costs:,
            ....,
            maximums:{
                maxSegmentDuration:,
                ...
            }
        }
        For more info, please see parser.js file
    */

    hello:function(id){

        uiIraSimulationDebug.defaults._infoWindow.setContent(null);
        uiIraSimulationDebug.defaults._infoWindow.close();
        //console.log("clicked itemid "+id.split(',')[1]);
//        uiIraSimulationDebug.replacePlannings(itemid,message.plannings,message.pratings);
    },
    /**
     * Extract the first items of the provided plannings
     */
    getFirstItemsFromPlannings:function(plans){

        var html='';
        for(var j=0;j<plans.length;j++){
            var item=plans[j];
            if(item!==undefined){
                var list=[]; // TODO: dataParser waits arrayList
                list.push(item);
                var parser=new NEWPARSER(list);

                var items=parser.getRawItems();
                //console.log(items);
                html+='<div class="routeCapsule" itemid="'+(j+1)+'" planningid="'+items[0].planningID+'">';
                for(var i=0;i<items.length;i++) {

                    if(items[i].type!=false){
                        color=tgConfig.popup.item[items[i].type].color;
                    }else{
                        color=tgConfig.popup.item[items[i].serviceProvider].color;
                    }
                    html+='<div class="item inner1 infoWindowButton" style="float:left;background-color:'+color+'">'+parser.getVehicleType(items[i])+'</div>';
//                    html+='<div planningid="'+items[i].planningID+'" itemid="'+(j+1)+'" class="item inner1 infoWindowButton" style="float:left;background-color:'+color+'">'+parser.getVehicleType(items[i])+'</div>';
                    // this is for infobuble
//                  html+='<div onclick="drawRoutes.hello(\'' + items[i].planningID+','+(j+1)+ '\')" planningid="'+items[i].planningID+'" itemid="'+(j+1)+'" class="item inner1 infoWindowButton" style="float:left;background-color:'+color+'">'+parser.getVehicleType(items[i])+'</div>';
                }

                html+='</div>';
            }
        }

        html+='</div>';
        return html;
    },
    getCurrentlyUsedItem:function(slots,currenttime){

    },
    getSelectedPlanning:function(planningID){
        return this._data.slots[planningID-1];
    },
    generateTravelSlider:function(slot){
        $(".travelSlider").remove();
        var segment=slot.segments[0];

        var html='<div class="travelSlider">'+
                    '<div class="slider-routes"><div class="segment row" style="margin-top:3px;margin-bottom: 3px; ">'+
                        '<div class=" col-xs-12"  style="background:transparent;padding:0px;margin:0px;">'+
                            '<div class="segment-container" style="width:100%; ">';
                                var newItems=this.addTimeGapsInSegment(segment.items,segment.duration);
                                for(var i=0;i<newItems.length;i++){
                                    html+=this.generateItem(newItems[i]);
                                }

                      html+='</div>';
                  html+='</div>';
              html+='</div>';
           html+='</div>';
           html+='<div>'+
                    '<div id="slider-filler"></div>'+
                    '<div id="slider-separator" ></div>'+
                 '</div>';

        return {
            duration:segment.duration,
            view:html
        };

    },
    // TODO: For mobile devices owing to the screen size, the detailed route should be displayed in the scroll panel.
    // The maximum screen size should be detected and then
    generateSegmentPopup:function(segment,obj){
        var html='';

        $('.rv-route-list').remove();
        html+='<div  id="rv-segment-popup" class="row rv-route-list rv-segment-popup-xs"  style="border:none;margin-top:40px;padding-top:20px;width:100%;"><ul style="height: 100%">';
        var startPos='',endPos='';
        for(var i=0;i<segment.items.length;i++){
            var item=segment.items[i];
            var color = tgConfig.popup.item[item.type].color;// item type will be substitued/replaced with like "CAR" or others
            var icon = tgConfig.popup.item[item.type].icon;

            html += '<li><div class="item-lg">' +
                '<div class="item-logo" style="background-color:' + color + ' ">' +
                '<i class="' + icon + '"></i>' +
                '</div>';
            if (i < segment.items.length - 1) {
                html += '<div class="separator" style=" background-color:' + color + '"></div>';
            }
            html += '</div>' +
                '<div class="item-info">' +
                '<div class="item-exp">' + item.caption + "  " + '<span style="font-style:italic;font-weight: normal;font-size:small">' + item.starttime + ' - ' + item.endtime + '</span></div>' +
                '<div class="item-address">' + this.formatAddress(item.startstation).split(",")[0] + ' - ' + this.formatAddress(item.endstation).split(",")[0] + '</div>' +
                '</div>' +
                '</li>';
        }
        //html+= '<li><div class="item-lg" style="margin-top: -5px"><div class="ima_iconfont" style="font-size: 16px">a</div></div></li>' ;
        html+='</ul></div>';


//        var height=(segment.items.length*30+70) +"px";
        var slot=obj.closest('.slider-routes');
//        $(html).css("height",height).insertAfter(slot).hide().slideDown(200);
        $(html).insertAfter(slot).hide().slideDown(200);
        $(html).show();


    },
    generateRoute:function(planning,planningsNr,order){
        //console.log(planning);
        var html='<div class="route-box row " style="margin:-2px 0px;" planningorder="'+order+'" planningId="'+planningsNr+'" >';
                    html+=this.generateAddressBar(planning.realPrefValue.duration,planning);
                    html+='<div style="height:4px" > </div>';
                    html+=this.generateRouteControlPart(planning);
            html+='</div>';
        return html;
    },
    generateAddressBar:function(duration,planning){
        //console.log("ROUTE DURATION:"+duration);
        var temp=planning.segments[planning.segments.length-1];

        var from= planning.segments[0].items[0].startstation;
        var to= endStation=temp.items[temp.items.length-1].endstation;
        //var travelDurations=addressInfo.possibleTravelDuration;
        var when=planning.segments[0].items[0].startdate;
          //Format function to change "3" into "03"
          var formatTwoDigits =
              function(tNumb)
              {
                  var str = '' + tNumb;
                  if (tNumb < 10)
                  {
                      str = '0' + tNumb;
                  }
                  return str;
              }
          // TODO: Change here according to the specified language

          var startdateMilli = Date.parse(when);
          var startDate = new Date(startdateMilli);
          //console.debug("Startdate",startDate);
          var starttime = formatTwoDigits( startDate.getHours() ) + ':' + formatTwoDigits( startDate.getMinutes() );
          //console.debug("stattime",starttime);

          var weekday = new Array(7);
          weekday[0]=  "So";
          weekday[1] = "Mo";
          weekday[2] = "Di";
          weekday[3] = "Mi";
          weekday[4] = "Do";
          weekday[5] = "Fr";
          weekday[6] = "Sa";

          //console.debug("uiMotView incoming data 1->",startDate);
          //console.debug("uiMotView incoming day ->",startDate.getDay());
         //console.debug("uiMotView incoming date->",startDate.getDate());

        var n = weekday[startDate.getDay()];
          var formattedWhen=starttime+" "+js_ira_hour +"|"+n+" " + formatTwoDigits(startDate.getDate())+"."+ formatTwoDigits(startDate.getMonth()+1);
          var duration=Math.round(duration/60); // in min

        // get address information from the slots
        var html='<div class="address-bar row " style="padding:5px 0px 5px 0px;" >'+
                    '<div class="col-xs-12 col-sm-4 col-md-4 col-lg-3 ">'+
                        '<span class="icon-from" style="color: #4F84A0"></span>'+
                        '<span style="margin-left: 10px">'+this.formatAddress(from)+'</span>'+
                    '</div>'+
                     '<div class="col-xs-12 col-sm-4 col-md-4  col-lg-3 ">'+
                       '<span class="icon-to" style="color: #4F84A0"></span>'+
                        '<span style="margin-left: 10px">'+this.formatAddress(to)+'</span>'+
                     '</div>'+
                    '<div class="col-xs-12 col-sm-4 col-md-4 col-lg-6">'+
                        '<span class="icon-calendar" style="color: #4F84A0;"></span>'+ ''+
                        '<span style="margin-left: 10px">'+formattedWhen+'</span>' +
                        '<span style="padding-top:5px>"><i style="margin-left:20px;color: #4F84A0" class="icon-clock"></i></span>'+
                        '<span style="margin-left: 10px">'+duration+' min'+'</span>'+
                     '</div>'+
                '</div>';
        return html;
    },
  generateRouteControlPart:function(slot){
        var overAllRating=slot.overallRating;
        var html='<div class="route-control-bar col-xs-12 " >';
            html+=this.generateControlBar();
            html+=  '<div class="route-bar col-xs-12"  >'+
                        '<div style="margin:5px -15px; ">'+
                            '<div class="col-xs-10"  style="padding:0px;">'+
                               '<div class="mot-slot" >';

                                  for (var i=0;i<slot.segments.length;i++){
                                      html+=this.generateSegments(slot.segments[i],(slot.segments[i].duration/this._data.maximums.maxSegmentDur)*100,i+1);
                                  }

                html+=         '</div>'+
                            '</div>'+
                            '<div class="col-xs-2 "  style="padding:8px;margin:0px;">'+
                                '<div class="mot-rater" data-percentage="'+overAllRating+'"></div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                 '</div>';
        return html;
    },
    generateControlBar:function(){
        var routeStart=js_ira_startIRA;
        var pushMessage=js_ira_pushMessage;

        var html=' <div class="control-bar col-xs-12 "  style="padding:0px;">'+
                        '<a href="#" class="col-xs-2 btn btn-default btn-xs btn-edit" style="padding:5px 1px 0px 1px;">' +
                            '<i  class="icon-edit"></i></a>'+
                        '<a href="#" class="col-xs-2 btn btn-default btn-xs btn-delete" style="padding:5px 1px 0px 1px; ">' +
                           '<i  class="icon-delete"></i></a>'+
                        '<a href="#" class=" col-xs-4  btn btn-default btn-xs btn-pushMessage" style=" padding:2px 1px 2px 1px; white-space: normal;">' +
                           '<div style="width:80px;margin:0px auto;">'+pushMessage+'</div> </a>'+
                        '<a href="#" class=" col-xs-4  btn btn-default btn-xs btn-ira-start" style="padding:2px 1px 2px 1px;white-space: normal;">' +
                            '<div style="width:80px;margin:0px auto;">'+routeStart+'</div></a>'+
                '</div>';
        return html;
    },

    generateSegments:function(segment,segmentPercentage,segNr){
        var startTime=segment.starttime;
        var endTime=segment.endtime;


        var html='<div class="segment col-xs-12" segmentnr="'+segNr+'">'+
                    '<div class="segment-times" style="background:transparent;padding:0px;" >'+
                        '<div style="width:'+segmentPercentage+'%">'+
                            '<small style="float:left">'+startTime+'</small>'+
                            '<small style="float:right">'+endTime+'</small>'+
                        '</div>'+
                    '</div>'+
                    '<div class=" col-xs-12"  style="background:transparent;padding:0px;">'+
                        '<div class="segment-container" style="width:'+segmentPercentage+'%; ">';

                            var newItems=this.addTimeGapsInSegment(segment.items,segment.duration);
                            for(var i=0;i<newItems.length;i++){
                                html+=this.generateItem(newItems[i]);
                            }

                  html+='</div>';
             html+='</div> ';
           html+='</div> ';
        return html;
    },
    // TODO: Add here the route and also percentage
    generateItem:function(item){
        var html='';

        var color = tgConfig.popup.item[item.item.type].color;// item type will be substitued/replaced with like "CAR" or others

        if(item.item!="space"){
            html+=' <div title="'+ "tooltip" +'" class="item inner1" style="width:'+item.percentage+'%;background-color:'+color+'">'+item.item.caption+'</div>';

        }else{
            html+=' <div class="item innerspace" style="width:'+item.percentage+'%;"></div>';  // this is required for adding spaces between items
        }
        return html;
    },

    addTimeGapsInSegment:function(items,segDur){
        //console.log("addTimeGapsInSegment is called");
        var _duration = (items[items.length-1].enddate.getTime() - items[0].startdate.getTime()) / (1000);
        var percentage=0;
        var newItemsSetDuration=[];

        for(var i=0;i<items.length-1;i++){

            percentage=((items[i].duration/_duration)*100);
            if(percentage>1){
                percentage=percentage-0.1;
            }
            var ite={
                item:items[i],
                percentage:percentage,
                duration:items[i].duration
            };
            newItemsSetDuration.push(ite);

            // add space between this and the next vehicle if it exists
            var _endtime=items[i].enddate;
            var _starttime=items[i+1].startdate;
            var _difference=(_starttime.getTime()-_endtime.getTime())/(1000);
            percentage=((_difference/_duration)*100);

            if(percentage>1){
                percentage=percentage-0.1;
            }
            if(_difference>0.1){
                ite={
                    item:"space",
                    percentage:percentage,
                    duration:_difference
                };
                newItemsSetDuration.push(ite);
            }
            percentage=0;
        }

        //add latest vehicle item
        var latest=items.length-1;
        percentage=((items[latest].duration/_duration)*100);
        if(percentage>1){
            percentage=percentage-0.1;
        }
        var ite={
            item:items[latest],
            percentage:percentage,
            duration:items[latest].duration
        };
        newItemsSetDuration.push(ite);
        // calculate Percentages
        function calculatePercentages(items){
            var percentages =[];
            var totalPercentage=0;
            for(var i=0;i<items.length;i++){
                if(items[i].percentage>0){
                    totalPercentage+=items[i].percentage;
                }else{
                    totalPercentage=totalPercentage-items[i].percentage;
                }
                percentages.push(items[i].percentage);
            }
            console.debug("Total percentage ->", totalPercentage);

            // TODO: Remove this part later, this function is written just for the test case
            ajaxCommunicator.sendResultViewPercentageFunctionToBackend(totalPercentage);
        }
        calculatePercentages(newItemsSetDuration);
        return newItemsSetDuration;
    },

    drawMapPolyline:function(segment){

        this.setItemsOnMapIRA(this.getPolylineData(segment),motMap);
    },
    getPolylineData:function(segment){
        var polylineDatas = [];

        for (var i = 0; i < segment.items.length; i++)
        {
            var item=segment.items[i];
            var mapcolor = tgConfig.popup.item[item.type].mapcolor;
            var obj =
            {
                startpos:item.startpos,
                endpos:item.endpos,
                color:mapcolor,
                trippoints:item.trippoints
            }
            polylineDatas.push(obj);
        }

        return polylineDatas;
    },
    formatAddress:function(address){
    	if (address!=null) {
			if (typeof address === 'string') {
				return address.replace(/, Deutschland/, "");
			} else if (typeof address === 'object' && address.address && typeof address.address === 'string') {
				console.warn("FIXME: Address expected to be 'string' but really is an object with an inner address " +
						"string!");
				return address.address.replace(/, Deutschland/, "");
			}
			return JSON.stringify(address);
		}
        return address;
    },
    clearMap:function(){
        if (typeof iraPolylines != "undefined")
        {
            for (var i = 0; i < iraPolylines.length; i++)
            {
                iraPolylines[i].setMap(null);
            }//endof FOR
        }//endof IF
    },
    setItemsOnMapIRA :function(segmentRoute, mapObj)
    {

        var minLat = segmentRoute[0].startpos.latitude;
        var minLon = segmentRoute[0].startpos.longitude;

        var maxLat = segmentRoute[0].startpos.latitude;
        var maxLon = segmentRoute[0].startpos.longitude;

        //If polylines were drawed, remove them before new drawing
        if (typeof polylineList != "undefined")
        {
            for (var j = 0; j < polylineList.length; j++)
            {
                polylineList[j].setMap(null);
            }//endof FOR
        }//endof IF

        //Allways re-instantiate polylineList
        polylineList = [];

        var polylineCoords = [];
        //for each item
        //console.log("SEGLENT:"+ segmentRoute.length);
        for (var i = 0; i < segmentRoute.length; i++)
        {
            var lineCoords = [];

            Lat = segmentRoute[i].startpos.latitude;
            Lon = segmentRoute[i].startpos.longitude;
            lineCoords.push( new google.maps.LatLng(Lat , Lon) );
            //Recognize extrema
            if (Lat <= minLat){ minLat = Lat}
            if (Lat > maxLat){ maxLat = Lat}
            if (Lon <= minLon){ minLon = Lon}
            if (Lon > maxLon){ maxLon = Lon}

            //Add the trippoints of the current item
            var trippoints = segmentRoute[i].trippoints;
            var n = trippoints.length;

            //Ignore the first and last because they are handle separately
            //for defining bounds
            for (var j = 1; j < n-1; j++)
            {
                Lat = trippoints[j].Ax1.geoLocation.Ax1.latitude;
                Lon = trippoints[j].Ax1.geoLocation.Ax1.longitude;
                lineCoords.push( new google.maps.LatLng(Lat , Lon) );
            }//endof FOR

            Lat = segmentRoute[i].endpos.latitude;
            Lon = segmentRoute[i].endpos.longitude;
            lineCoords.push( new google.maps.LatLng(Lat, Lon) );
            //Recognize extrema
            if (Lat <= minLat){ minLat = Lat}
            if (Lat > maxLat){ maxLat = Lat}
            if (Lon <= minLon){ minLon = Lon}
            if (Lon > maxLon){ maxLon = Lon}

            var iconList =
                [
                    {
                        fixedRotation:true,
                        offset:'100%',
                        icon:
                        {
                            path:google.maps.SymbolPath.CIRCLE,
                            scale: 7,
                            strokeWeight: 2.0,
                            strokeColor: '#000',
                            fillColor: '#FFF',
                            fillOpacity: 1.0
                        },
                        repeat:0
                    }

                ];

            polylineList[i] = new google.maps.Polyline({
                path:lineCoords,
                strokeColor: segmentRoute[i].color,
                strokeOpacity: 1.0,
                strokeWeight: 4,
                icons: iconList
            });
            iraPolylines=polylineList;
            polylineList[i].setMap(mapObj);
        }//endof FOR

        var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(minLat, minLon), new google.maps.LatLng(maxLat, maxLon));
        mapObj.fitBounds(bounds);


        mapObj.setCenter(bounds.getCenter());

        google.maps.event.trigger(mapObj, "resize");

    },//endof setItemsOnMap()
    /**
     Add empty ajax loading slots for indicating that the routes are still fetched from the backend
     */
    addEmptyLoadingSlot:function(){

        var html='<div class="row mot-loader-slot " >'+
            '<div class="col-xs-12 col-sm-12 col-md-12  col-lg-12"  id="rv-ajaxLoadingView" style="text-align:center" >'+
            '</div></div>';
//        $(".mot-container-routes").append(html);
//        $(html).appendTo($(".mot-container-routes"));

        //$(".rv-ajaxLoaderSlot").show();
        var circle = new Sonic({
            width: 60,
            height: 60,

            stepsPerFrame: 1,
            trailLength: 1,
            pointDistance: .03,
            fps: 30,
            fillColor: '#2E6687',

            step: function(point, index) {
                this._.beginPath();
                this._.moveTo(point.x, point.y);
                this._.arc(point.x, point.y, index * 7, 0, Math.PI*2, false);
                this._.closePath();
                this._.fill();
            },

            path: [['arc', 30, 30, 20, 0, 360]]

        });

        circle.play(); // for playing the ajax loader
        // circle.stop();// for stoping the ajax loader

        $("#rv-ajaxLoaderSlot").append(html);
        $("#rv-ajaxLoadingView").append(circle.canvas);
    },
    /*deactivate the slots once either there is no data available or user returns to the routenplanner*/
    removeEmptyLoadingSlot:function(){
        $("#rv-ajaxLoaderSlot").empty();
    },
    addLoadingSlotForNewPlanningRequests:function(){
        var circle = new Sonic({
            width: 30,
            height: 30,

            stepsPerFrame: 5,
            trailLength: 1,
            pointDistance: .01,
            fps: 30,
            step: 'fader',

            strokeColor: '#FFF',

            setup: function() {
                this._.lineWidth = 6;
            },

            path: [['arc', 15, 15, 10, 0, 360]]

        });

        circle.play(); // for playing the ajax loader
        // circle.stop();// for stoping the ajax loader
        $("#rv-newPlanningRequest").append(circle.canvas);
    },
    removeLoadingSlotForNewPlanningRequests:function(){
        console.debug("loading circle is removed");
        $("#rv-newPlanningRequest").empty();
    }

};














