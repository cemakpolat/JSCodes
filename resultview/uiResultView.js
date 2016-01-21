
/**
 *
 *
 *@namespace
 * @author Cem Akpolat
 */
var drawTravelResults = {
    locked:false,
    _data:'',
    defaults:{
        _latestData:'',
        _latestView:'',
        debug:false,
        doughnutsNumber:1,
        updateMobilityResults:true,
        selectedSlotNumber:null
    },
    /**
     Add empty ajax loading slots for indicating that the routes are still fetched from the backend
     */
    addEmptyLoadingSlot:function(){

        var html='<div class="rv-route-grad row "  onclick="return false;" style="border:none;" >'+
            '<div class="col-xs-12 col-sm-12 col-md-12  col-lg-12" onclick="return false;"  id="rv-ajaxLoadingView" style="text-align:center" >'+
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
    loadGUI:function(){
        this.generateResults(this._data);
    },

    generateResults:function(data){
        if(!drawTravelResults.locked) {
            google.maps.event.trigger(rvMap, 'resize');
            if (xs()) {
                //$("#rv-map_canvas").hide();
                if (!$("#rv-map_canvas").is(":visible") && !$(".rv-dougnuth-wrapper").is(":visible") && !$("#rv-segment-popup").is(":visible")) {
                    this._data = data;
                    this.defaults.doughnutsNumber = 1;

                    var slots = data.slots;
                    var html = '';
                    var allSlotsNotNull=false;
                    for (var i = 0; i < slots.length; i++) {
                        if(slots[i]!=null) {
                            html += this.generateSlot(slots[i], i + 1);                    // add all created slots
                            allSlotsNotNull=true;
                        }
                    }
                    $("#rv-map_canvas").appendTo($("#map-wrapper-sm"));
                    $("#rv-routes").html('');       // remove previously obtained datas
                    $("#rv-routes").append(html);   // add here new data
                    if(allSlotsNotNull) {
                        drawTravelResults.activateDoughnuts(slots);
                        $(".rv-dougnuth-wrapper").css("overflow", "visible");
                        travelGraph.init();
                    }

                } else {
                    this.defaults._latestData = data;

                }

            } else {
                if (!$("#rv-segment-popup").is(":visible")) {
                    this._data = data;
                    this.defaults.doughnutsNumber = 1;

                    var slots = data.slots;
                    var html = '';
                    console.log(slots);
                    var allSlotsNotNull=false;
                    for (var i = 0; i < slots.length; i++) {
                        if(slots[i]!=null) {
                            html += this.generateSlot(slots[i], i + 1);                    // add all created slots
                            allSlotsNotNull=true;
                        }
                    }
                    $("#rv-routes").html('');// remove previously obtained datas
                    //$("#rv-routes").css('display','block');
                    $("#rv-routes").append(html); // add here new data
                    if(allSlotsNotNull) {
                        drawTravelResults.activateDoughnuts(slots);
                        travelGraph.init();
                    }
                } else {
                    this.defaults._latestData = data;
                }
            }
        }else{
            this.defaults._latestData=data;
        }
        $('[data-toggle="tooltip"]').tooltip({
            'placement': 'top'
        });

    },
    generateResultsOLD:function(data){
        this._data = data;
        this.defaults.doughnutsNumber = 1;

        var slots = data.slots;
        var html = '';
        for (var i = 0; i < slots.length; i++) {
            html += this.generateSlot(slots[i], i + 1);                    // add all created slots
        }
        google.maps.event.trigger(rvMap, 'resize');

        if (xs()) {
            if (!$("#rv-map_canvas").is(":visible") && !$(".rv-dougnuth-wrapper").is(":visible") && !$("#rv-segment-popup").is(":visible")) {

                $("#rv-map_canvas").appendTo($("#map-wrapper-sm"));
                $("#rv-routes").html('');       // remove previously obtained datas
                $("#rv-routes").append(html);   // add here new data
                drawTravelResults.activateDoughnuts(slots);
                $(".rv-dougnuth-wrapper").css("overflow", "visible");
                travelGraph.init();

            } else {
                this.defaults._latestData = data;
                this.defaults._latestView = html;

            }

        } else {
            if (!$("#rv-segment-popup").is(":visible")) {
                $("#rv-routes").html('');// remove previously obtained datas
                //$("#rv-routes").css('display','block');
                $("#rv-routes").append(html); // add here new data
                drawTravelResults.activateDoughnuts(slots);
                travelGraph.init();
            } else {
                this.defaults._latestData = data;
                this.defaults._latestView = html;
            }
        }
        $('[data-toggle="tooltip"]').tooltip({
            'placement': 'top'
        });

    },

    /**
     *This function should be called after the map or/and route-details are disappeared.
     */

    loadLatestView:function(){
        this._data = this.defaults._latestData;
        this.defaults.doughnutsNumber = 1;
        var slots = this._data.slots;
        var html = '';
        for (var i = 0; i < slots.length; i++) {
            html += this.generateSlot(slots[i], i + 1);                    // add all created slots
        }
        $("#rv-routes").html('');// remove previously obtained datas
        $("#rv-routes").css('display','block');
        $("#rv-routes").append(html); // add here new data

        // OR

//        $("#rv-routes").html('');// remove previously obtained datas
//        $("#rv-routes").css('display','block');
//        $("#rv-routes").append(this.defaults._latestView); // add here new data

    },

    generateWeatherInfo:function(location,callback){
        // This part is for the WEATHER Component
        //console.debug("Weather Info Positions ->",targetList[0].getPosition().latitude +" "+targetList[0].getPosition().longitude);
        ajaxCommunicator.getWeather(targetList[0].getPosition().latitude,targetList[0].getPosition().longitude,new Date().getTime(),function(weatherData){
            var weather=undefined;
            if(weatherData.weatherType==undefined){
                $("#weatherBlock").hide();
                callback(undefined);
            }else{
                weather={
                    humidity:weatherData.humidity,
                    pressure:weatherData.pressure,
                    rainPrecipitation:weatherData.rainPrecipitation,
                    snowPrecipitation:weatherData.snowPrecipitation,
                    temperatureAverage:weatherData.temperatureAverage,
                    temperatureMax: weatherData.temperatureMax,
                    temperatureMin: weatherData.temperatureMin,
                    weatherDes:weatherData.weatherDescription,
                    weatherType:weatherData.weatherType,
                    windDirection: weatherData.windDirection,
                    windSpeed: weatherData.windSpeed,
                    weatherIcon:weatherConfig.type[weatherData.weatherType].icon
                };
                callback(weather);
            }
        });


    },

    generateAddressBar:function(weather){
        // get address information from the slots
        var html='';
        $("#rv-address-bar-container").html('');
        if(weather!=undefined){
            html+='<div class="row rv-address-bar">'+
                        '<div class="col-xs-12 col-sm-5 col-md-5 col-lg-4 " style="margin-bottom: 5px;">'+
                            '<span class="icon-from-small"></span><span style="font-weight:bold;margin-left:10px;">'+
                                this.formatAddress(targetList[0].getAddress()) +'</span>'+
                        '</div>'+
                        '<div class="col-xs-12 col-sm-5 col-md-5  col-lg-4 " style="margin-bottom: 5px;">'+
                            '<span class="icon-to-small"></span><span style="font-weight:bold;margin-left:10px;">'+
                                this.formatAddress(targetList[targetList.length-1].getAddress())+ '</span>'+
                        '</div>'+
                         '<div class="col-xs-12 col-sm-2 col-md-2 col-lg-4">'+
                             '<span style="font-weight:bold;margin-left:0px;"><i id="weatherState" class="wi '+ weather.weatherIcon +'"></i></span>'+
                              '<span style="font-weight:bold;margin-left:10px;font-size:inherit">'+weather.temperatureAverage+'&deg;C</span>'+
                         '</div>'+
                '</div>'+
                '<div style="height:2px"></div>';

        }else{
            //if(xs() || sm() ){
            html+='<div class="row rv-address-bar">'+
                    '<div class="col-xs-12 col-sm-6 col-md-6 col-lg-4 " style="margin-bottom: 5px;">'+
                        '<span class="icon-from-small"></span><span style="font-weight:bold;margin-left:10px;">'+
                            this.formatAddress(targetList[0].getAddress()) +'</span>'+
                    '</div>'+
                    '<div class="col-xs-12 col-sm-6 col-md-6  col-lg-4 " style="margin-bottom: 5px;">'+
                        '<span class="icon-to-small"></span><span style="font-weight:bold;margin-left:10px;">'+
                            this.formatAddress(targetList[targetList.length-1].getAddress())+ '</span>'+
                    '</div>'+
                '</div>'+
                '<div style="height:2px"></div>';
            //}

        }


        $("#rv-address-bar-container").append(html);
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
    generateSlot:function (slot,slotNr){


        var html='';
//        console.log("Planning ID from generateSlot:"+slot.planningID);
        html +='<div style="padding-top:5px" class="row rv-route-grad rv-slot" planningid="'+slot.planningID+'" slotnr="'+slotNr+'"><div class="col-xs-12 col-sm-11 col-md-10  col-lg-11">'+
                    '<div class="routes" style="margin-left:-15px;margin-right:-15px;">';
        var segmentNr=1;
        //check screen xs or sm
        if (xs()) {
            html += '<div class="col-xs-11 visible-xs"  style="margin-left:-15px;margin-right:-15px;">' +
            '<div class=" col-xs-1 col-sm-1 col-md-1 col-lg-1" >' +

            '<div class="rv-addPlanning" data-toggle="popover" value="nonchecked" alt="Check-Icon"></div>' +
            '</div>' +
            ' <div class="col-xs-11 col-sm-11 col-md-11 col-lg-11" style="margin-left: 10px; margin-right:-15px;">';

            for (var i = 0; i < slot.segments.length; i++) {
                //console.debug("Slot duration", slot.segment[i].duration);
                html += this.generateSegment(slot.segments[i], (slot.segments[i].duration / this._data.maximums.totalTimeDiffBWEarlistAndLatest) * 100, segmentNr, slot.segments.length);
                segmentNr++;

            }
            html += '</div></div>';  // end of segments
            //  add here doughnuts
            html += this.generateDoughnuts(slot, slotNr);
        } else {
            html += '<div class="visible-sm visible-md visible-lg col-sm-8 col-md-10">' +
            '<div class=" col-xs-1 col-sm-1 col-md-1 col-lg-1" style="margin-right:0px;padding-left:0px;padding-right:0px;padding-top:5px;">' +

            '<div class="rv-addPlanning" data-toggle="popover"  value="nonchecked" alt="Check-Icon"></div>' +
            '</div>' +
            '<div class="col-xs-11 col-sm-11 col-md-11 col-lg-11" style="margin-right:0px;padding-left:0px;padding-right:0px;margin-left:-5px;">';
            for (var i = 0; i < slot.segments.length; i++) {
//                console.log("Percentage:"+slot.segments[i].duration/this._data.maximums.totalTimeDiffBWEarlistAndLatest+" slot.segments[i].duration:"+slot.segments[i].duration);
                html += this.generateSegment(slot.segments[i], (slot.segments[i].duration / this._data.maximums.totalTimeDiffBWEarlistAndLatest) * 100, segmentNr, slot.segments.length);
                segmentNr++;
            }
            html += '</div></div>';
            //  add here doughnuts
            html+=this.generateDoughnuts(slot,slotNr);
        }
        html+='</div></div></div>'; // end of slot

        return html;
    },
    
    /**
        Segment data encompanses many item objects aside from its parameters and its structure could be displayed as below:
        segment:{
            items:[],
            duration:,
            co2:, 
            overallRating:,
            ...
        }
        For more info, please see parser.js file
    */
    generateSegment:function(segment,segmentPercentage,segNr,segmentCount){
        var html='';
        var bigSizeLayout='';
        if(segmentCount==2){
            bigSizeLayout='col-xs-12 col-sm-6 col-md-4 col-lg-4';

        }else  if(segmentCount>2){
            bigSizeLayout='col-xs-12 col-sm-6 col-md-4 col-lg-4';

        }
        else{
            bigSizeLayout='col-xs-12 col-sm-10 col-md-10 col-lg-10';
        }


        var startTime=Date.parse(segment.startdate);


        if(xs()){
            var spacePercentage=(startTime-this._data.maximums.earliestdate)/ ((10 * 60)*this._data.maximums.totalTimeDiffBWEarlistAndLatest);
          /* start-,end-time */
            html+='<div class="rv-segment col-xs-12" segmentnr="'+segNr+'" style="margin:0px;padding:0px;">'+
                    '<div class="segment-times" style="background:transparent;padding:0px;">'+
                        '<div class="row" style="margin:0px;padding:0px">' +
                            '<div style="height:10px;float:left;width:'+spacePercentage+'%"></div>'+
                            '<div style="height:15px;float:left;width:'+segmentPercentage+'%">'+                   // add here percentage of the slot
                                '<small style="float:left">'+segment.starttime+'</small>'+         // add here start time
                                '<small style="float:right">'+segment.endtime+'</small>'+   // add here end time
                            '</div>'+
                        '</div>'+
                    '</div>';

            /* add items */
            html+='<div class="">'+
                        '<div class="col-xs-12"  style="background:transparent;padding:0px;">'+
                            '<div class="row" style="margin:0px;padding:0px">' +
                                '<div style="height:30px;float:left;width:'+spacePercentage+'%"></div>'+
                                '<div class="segment-container" style="float:left;width:'+segmentPercentage+'%; ">';
                                    // add here items
                                    var newItems=this.addTimeGapsInSegment(segment.items,segment.duration);
                                    for(var i=0;i<newItems.length;i++){
                                        html+=this.generateItem(newItems[i],segment.duration);
                                    }

            html+='</div></div></div></div>'; // end of items

            html+='</div>'; // end of segment
        }
        else{
            var spacePercentage=(startTime-this._data.maximums.earliestdate)/ ((10 * 60)*this._data.maximums.totalTimeDiffBWEarlistAndLatest);
            /* start-,end-time */
            html+='<div class="rv-segment col-xs-12'+bigSizeLayout+'" segmentnr="'+segNr+'" style="margin:0px;padding:0px;">'+
                    '<div class="segment-times" style="background:transparent;padding:0px;">'+
                        '<div class="row" style="margin:0px;padding:0px">' +
                            '<div class="empty-space"  style="height:10px;float:left;width:'+spacePercentage+'%"></div>'+
                            '<div style="float:left;width:'+segmentPercentage+'%">'+                   // add here percentage of the slot
                                '<small style="float:left">'+segment.starttime+'</small>'+  // add here start time
                                '<small style="float:right">'+segment.endtime+'</small>'+   // add here end time
                            '</div>'+
                        '</div>'+
                    '</div>';


            html+='<div class="row">'+
                        '<div class="item col-xs-12"  style="background:transparent;padding:0px;">'+
                            '<div class="row" style="margin:0px;padding:0px">' +
                                '<div class="empty-space" style="height:30px;float:left;width:'+spacePercentage+'%"></div>'+
                                '<div class="segment-container" style="float:left;width:'+segmentPercentage+'%; ">';
                                    // add here items
                                    var newItems=this.addTimeGapsInSegment(segment.items,segment.duration);
                                    for(var i=0;i<newItems.length;i++){
                                        html+=this.generateItem(newItems[i]);
                                    }
            html+='</div></div></div></div>'; // end of items

            html+='</div>'; // end of segment
        }
        return html;
    },
    addTimeGapsInSegment:function(items,segDur){

        var _duration = (items[items.length-1].enddate.getTime() - items[0].startdate.getTime()) / (1000);
        //var _duration = (items[items.length-1].enddate.getTime() - items[0].startdate.getTime()) / (1000 * 60);
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
            //console.debug("Total percentage ->", totalPercentage);

            // TODO: Remove this part later, this function is written just for the test case
            ajaxCommunicator.sendResultViewPercentageFunctionToBackend(totalPercentage);
        }


        calculatePercentages(newItemsSetDuration);

//        // Do Optimisations
//        function lastOptimization(items){
//            var totalPercentage=0;
//            var percentages =[];
//            for(var i=0;i<items.length;i++){
//                if(items[i].percentage>0){
//                    totalPercentage+=items[i].percentage;
//                }else{
//                    totalPercentage=totalPercentage-items[i].percentage;
//                }
//                percentages.push(items[i].percentage);
//            }
//            var newtotal=0;
//            if(totalPercentage>100){
//                var difference=totalPercentage-99;
//                for(var i=0;i<percentages.length;i++){
//                    newItemsSetDuration[i].percentage=percentages[i]-(difference*percentages[i]/totalPercentage);
//                }
//            }else if (totalPercentage<99){
//                var difference=99-totalPercentage;
//                for(var i=0;i<percentages.length;i++){
//                    newItemsSetDuration[i].percentage=percentages[i]+(difference*percentages[i]/totalPercentage)-0.1;
//                    newtotal+=newItemsSetDuration[i].percentage;
//                }
//            }
//
////            ajaxCommunicator.sendUpdateBrackerFunctionToBackend("resultview",totalPercentage);
//        }

        //lastOptimization(newItemsSetDuration);
        return newItemsSetDuration;
    },
    // TODO: Add here the route and also percentage
    /***/
    generateItem:function(item){

        var html = '';
        var color = tgConfig.popup.item[item.item.type].color;// item type will be substitued/replaced with like "CAR" or others
        var mapcolor = tgConfig.popup.item[item.item.type].mapcolor;
        var icon = tgConfig.popup.item[item.item.type].icon;

        if(item.item!="space"){
            html+=' <div title="'+ "tooltip" +'" class="item inner1" style="width:'+item.percentage.toFixed(1)+'%;background-color:'+color+'">'+item.item.caption+'</div>';
        }else{
            html+=' <div class="item innerspace" style="width:'+item.percentage.toFixed(1)+'%;"></div>';  // this is required for adding spaces between items
        }
        return html;
    },

    activateDoughnuts:function(slots){
//        var max=this._data.maximums;
        var k=2;
        for(var i=0;i<slots.length;i++){

            var pCost=Math.round(slots[i].costs.toFixed(2));
            var pDur=slots[i].duration;
            var pCo2=slots[i].co2;
            var pComfort=slots[i].comfort;

            var costs = [{value: 100-pCost,color:"#496C85"},{value : pCost,color : "#F0F1F2"}];
            var duration = [{value: 100-pDur,color:"#496C85"},{value : pDur,color : "#F0F1F2"}];
            var co2 = [{value: 100-pCo2,color:"#496C85"},{value : pCo2,color : "#F0F1F2"}];
            var comfort = [{value: 100-pComfort,color:"#496C85"},{value : pComfort,color : "#F0F1F2"}];

            var options={percentageInnerCutout : 70,  segmentShowStroke : false,segmentStrokeColor : "#000",    segmentStrokeWidth : 2};
            //console.log(i+" costs:"+costs[0].value+" space:"+costs[1].value);
            new Chart(document.getElementById("myChart"+(k)).getContext("2d")).Doughnut(costs,options);
            new Chart(document.getElementById("myChart"+(k+1)).getContext("2d")).Doughnut(duration,options);
            new Chart(document.getElementById("myChart"+(k+2)).getContext("2d")).Doughnut(co2,options);
            new Chart(document.getElementById("myChart"+(k+3)).getContext("2d")).Doughnut(comfort,options);


            k=k+3;
        }
    },
    /***/
    addDoughnut:function(realValue,ratingValue,iconName,min){

        var unit='';
        if(iconName=="icon-euro-big"){
            unit=' \u20AC';
        }else if(iconName=="icon-time-big"){
            unit=' min'
            realValue=Math.round(realValue/60);
        }else if(iconName=="icon-eco-big"){
            unit=' g';
        }

        var html='';
        html='<div data-toggle="tooltip" title="'+realValue+''+unit+'"  style="width: 50px; height: 50px; float: left; position: relative; margin-top: -5px;">'+
                '<div style="width: 100%; height: 40px; position: absolute; top: 50%; '+
                'left: 1px; margin-top: -11px; line-height:19px; text-align: center; z-index: 9999">'+
                    '<i  style="color:#496C85" class="'+iconName+'"></i>'+
                '</div>';


        if(min==ratingValue){
            html+=this.addStarToDoughnut();      // for adding to the bes result
        }

        this.defaults.doughnutsNumber++;    // increase dougnuts count    
              html+='<canvas id="myChart'+this.defaults.doughnutsNumber+  '"style="margin-left:-2px;"  class="chart" width="50" height="50"></canvas>'+
                '</div>';
        return html;

    },
    /***/
    addStarToDoughnut:function(){
        var html='';
        html='<div style="width: 100%; height: 40px; position: absolute; top: 50%; left: 17px; margin-top: -24px; line-height:19px; text-align: center; z-index: 99999">' +
            '<i  style="color:#FDC563"class="icon-star"></i></div>';
        return html;
    },


    /****/
    generateDoughnuts: function(slot,slotNr){
        var html='';
        if(xs()){

            html+='<div class="col-xs-1 visible-xs  col-sm-2 col-md-2" style="padding:0px">'+
                        '<div class="rv-rater xs-rater" data-percentage="'+(slot.overallRating)+'">'+
                            '<div class="rv-dougnuth-wrapper text-center row arrow_box_right" style="overflow: visible">'+
                                '<div  class="dougnuts-all col-xs-9" style="padding-left:0px;padding-right:0px;margin-top:0px">';

                                    html+=this.addDoughnut(slot.realPrefValue.costs.toFixed(2),slot.costs,'icon-euro-big', this._data.maximums.maxSlotCost);
                                    html+=this.addDoughnut(slot.realPrefValue.duration,slot.duration,'icon-time-big', this._data.maximums.maxSlotDur);
                                    html+=this.addDoughnut(slot.realPrefValue.co2,slot.co2,'icon-eco-big', this._data.maximums.maxSlotCo2);
                                    html+=this.addDoughnut(slot.realPrefValue.comfort,slot.comfort,'icon-eco-big', this._data.maximums.maxSlotComfort);
                          html+='</div>'+
                                '<span class="col-xs-3 percentage" style="padding:0px;margin-top:10px;">'+slot.overallRating+'%</span>';
            html+='</div></div></div>';
        }else{

            html+='<div class=" visible-sm visible-md visible-lg col-sm-4 col-md-2">'+
                        '<div class=" col-xs-1 col-sm-4 col-md-4 col-lg-3">'+
                            '<div class="row" style="float:left" >'+
                                '<div class="col-xs-2" style="padding-left:0px;margin-top: 0px;" >'+
                                    '<div class="rv-rater sm-rater" data-percentage="'+(slot.overallRating)+'"></div>'+
                                '</div>'+
                                '<div class="col-xs-10 ">'+
                                    '<div class="rv-dougnuth-wrapper-sm text-center row arrow_box">';
                                        html+='<span class="col-xs-3 percentage" style="padding-left:0px;padding-right:0px">'+slot.overallRating+'%</span>';

                                        html+=this.addDoughnut(slot.realPrefValue.costs.toFixed(2),slot.costs,'icon-euro-big', this._data.maximums.maxSlotCost);
                                        html+=this.addDoughnut(slot.realPrefValue.duration,slot.duration,'icon-time-big', this._data.maximums.maxSlotDur);
                                        html+=this.addDoughnut(slot.realPrefValue.co2,slot.co2,'icon-eco-big', this._data.maximums.maxSlotCo2);
                                        html+=this.addDoughnut(slot.realPrefValue.comfort,slot.comfort,'icon-eco-big', this._data.maximums.maxSlotComfort);

                              html+='</div>';
                          html+='</div>';

            html+='</div></div></div>'; // end of big screen doughnuts

        }

        //create the doughnuts
        return html;
        
    },

    generateSegmentPopup:function(slotNr,segmentNr,obj){
        var html='';
        var slot=this._data.slots[slotNr-1];

        if(xs()){

            $('.rv-route-list').remove();

            html += '<div  id="rv-segment-popup" class="rv-route-list rv-segment-popup-xs"  style="border:none;margin-top:0px;padding-top:10px;width: 100%">';

            for(var j=0;j<slot.segments.length;j++) {
                var segment=slot.segments[j];
                var startPos = '', endPos = '';
                html += '<ul style="height:100%">';
                for (var i = 0; i < segment.items.length; i++) {
                    var item = segment.items[i];
                    var color = tgConfig.popup.item[item.type].color;// item type will be substitued/replaced with like "CAR" or others
                    var icon = tgConfig.popup.item[item.type].icon;
                    startPos = this.formatAddress(item.startposition);
                    endPos = this.formatAddress(item.endposition);

                    html += '<li><div class="item-lg">' +
                        '<div class="item-logo" style="background-color:' + color + ' ">' +
                        '<i class="' + icon + '"></i>' +
                        '</div>';
                    if (i < segment.items.length - 1) {
                        html += '<div class="separator" style=" background-color:' + color + '"></div>';
                    }
                    html += '</div>' +
                        '<div class="item-info">' +
                        '<div class="item-exp">' + item.caption + "  " + '<span st  yle="font-style:italic;font-weight: normal;font-size:small">' + item.starttime + ' - ' + item.endtime + '</span></div>' +
                        '<div class="item-address">' + this.formatAddress(item.startstation).split(",")[0] + ' - ' + this.formatAddress(item.endstation).split(",")[0] + '</div>' +
                        '</div>' +
                        '</li>';
                }
                html += '</ul>';

                html += '<div class=""   style="margin-top:10px;height:3px;width: 100%;border-top:1px solid black;" > </div>';
            }
            html += '<div  style="height:30px;width: 100%;" class="center-x closeRouteDetails visible-sm visible-lg visible-md"> Close</div>';
            html += '<div  style="height:30px;width: 100%;margin-top:10px" class="center-x closeRouteDetails visible-xs"> Close</div>';
            html+='</div>';
            var slot=obj.closest('.rv-slot');
            $(html).insertAfter(slot).hide().slideDown(200);
            $(html).slideDown(200).show()
            //TODO: Add here an open button so as to display the route details
            var close=false;
            $(".closeRouteDetails").on("click",function(){
                //console.log("Close");
                if(!close){
                    $('.rv-route-list').slideUp();
                }else{
                    $('.rv-route-list').show().slideDown();
                }

            });
            this.drawRoutePath(slotNr,segmentNr);
            //this.drawRouteAllPath(slotNr,segmentNr);
        }
        else{
            var marginLeftSpace=obj.parent().parent().find('.empty-space').width();
            var segment=slot.segments[segmentNr-1];
            $('.rv-route-list').remove();
            var segmentDuration=Math.round(segment.duration) +' min';

            var height=(45+segment.items.length*45+15) ;
            //console.debug("items length:"+segment.items.length+" height:"+height);
            var segmentConfiguration=this.changePositionOfPopup(height,"450",obj);


            //Each li element is 50px!
            html+='<div  id="rv-segment-popup" style="overflow:visible; margin-left:'+marginLeftSpace+'px;" class="rv-route-list '+segmentConfiguration.arrowPos+' rv-segment-popup-sm" ><ul style="height: 100%">'+
               '<li><div class="header"> <div style="float:left;padding-top:10px"><i class="icon-clock-big"></i><div style="margin-left:40px;margin-top:-25px;font-size:16px;">'+segmentDuration+'</div></div></div></li>';
                var startPos='',endPos='';
                for(var i=0;i<segment.items.length;i++){
                    var item=segment.items[i];
                    var color = tgConfig.popup.item[item.type].color;// item type will be substitued/replaced with like "CAR" or others
                    var icon = tgConfig.popup.item[item.type].icon;
                    startPos=this.formatAddress(item.startposition);
                    endPos=this.formatAddress(item.endposition);

                    html+='<li><div class="item-lg">' +
                                    '<div class="item-logo" style="background-color:'+color+' ">' +
                                        '<i class="'+icon+'"></i>' +
                                    '</div>' ;
                                    if(i<segment.items.length-1) {
                                        html += '<div class="separator" style=" background-color:' + color + '"></div>';
                                    }
                    var endStation="";
                    var startStation="";
                    if(item.endstation!==undefined){
                        endStation=this.formatAddress(item.endstation).split(",")[0];
                    }else{
                        console.log("Google Map limit should be exceeded");
                    }
                    if(item.startstation!==undefined){
                        startStation=this.formatAddress(item.startstation).split(",")[0];
                    }else{
                        console.log("Google Map limit should be exceeded");
                    }

                    html+='</div>' +
                                '<div class="item-info">' +
                                    '<div class="item-exp">'+item.caption+"  "+'<span style="font-style:italic;font-weight: normal;font-size:small">'+item.starttime+' - '+item.endtime+'</span></div>' +
                                    '<div class="item-address">'+startStation+' - '+endStation+'</div>' +
//                                    '<div class="item-settime">'+item.starttime+' - '+item.endtime+'</div>' + // TODO: add here the date time
                                '</div>' +
                            '</li>';
                }

            html+='</ul></div>';
            var row=obj.closest('.rv-segment');
            $(html).appendTo(row);
            if(segmentConfiguration.arrowPos=="arrow_box_bottom"){
                var popupHeight=-($('#rv-segment-popup').height()+2);
                $('#rv-segment-popup').css('top',popupHeight);
            }
            $(html).show(200);

            $("#rv-segment-popup").css("overflow","visible");
            $("#rv-segment-popup").css("margin-top","5px");

            this.drawRoutePath(slotNr,segmentNr);
        }

    },
    changePositionOfPopup:function(heightOfSegment, widthOfSegment,obj){

        var dist=new distanceTo();
        dist.init(heightOfSegment,widthOfSegment,obj);
        if(dist.isBottomAppropriate()){
            return {
                arrowPos:"arrow_box_top"
            };

        }else  if(dist.isTopAppropriate()){
            return {
                arrowPos:"arrow_box_bottom"
//                height:-heightOfSegment
            };
        }else{
            return {
                arrowPos:"arrow_box_top"
            };
        }
    },
    drawRoutePath:function(slotNr,segmentNr){
        var selectedSlot=this._data.slots[slotNr-1];

        // get segment numbers
        var segments=[];
        for(var j=0;j<selectedSlot.segments.length;j++){
            segments.push(selectedSlot.segments[j]);
        }

        var activeList=[];
        if(segmentNr!=undefined) {
            for(var i=0;i<selectedSlot.segments.length;i++){
                //console.log("Segment Number:"+segmentNr);
                if (i== segmentNr - 1) {
                    var obj={type:"activeSelected",place:(segmentNr-1)};
                    activeList.push(obj);
                }else{
                    var obj={type:"active",place:(i)};
                    activeList.push(obj);
                }
            }
        }else{
            for(var i=0;i<selectedSlot.segments.length;i++){
                var obj={type:"active",place:(i)};
                activeList.push(obj);
            }
        }
        this.drawMapPolyline(segments,activeList);
    },
    drawRouteAllPath:function(slotNr,segmentNr){

        // get all Segment
        var otherSegments=[];
        for(var i=0;i<this._data.slots.length;i++){
            var otherSlot=this._data.slots[i];
            if(otherSlot.segments.length!=undefined ) {
                for (var j = 0; j < otherSlot.segments.length; j++) {
                    otherSegments.push(otherSlot.segments[j]);
                }
            }
        }
        // get only the segments of the selected slot
        var slot=this._data.slots[slotNr-1];
        var activeList=[];
        var slotNum=slotNr-1;
        var segmentCount=slot.segments.length;
        if(segmentNr!=undefined) {
            for(var i=0;i<segmentCount;i++){
                if (i== segmentNr - 1) {
                    var obj={type:"activeSelected",place:(slotNum*segmentCount+i)};
                    activeList.push(obj);
                }else{
                    var obj={type:"active",place:(slotNum*segmentCount+i)};
                    activeList.push(obj);
                }
            }
        }else{
            for(var i=0;i<slot.segments.length;i++){
                var obj={type:"active",place:(slotNum*segmentCount+i)};
                activeList.push(obj);
            }
        }


        // draw other map lines
        this.drawMapPolyline(otherSegments,activeList);
    },

    drawMapPolyline:function(segments,activeList){
        setAllItemsOnMapIRA(this.getPolylineData(segments,activeList),rvMap);
        //setItemsOnMapIRA(this.getPolylineDataOld(segments,activeList),rvMap);
    },

    getPolylineData:function(segments,activeList){
        var strokeWeight=3;
        var mapcolor="gray";
        var polylineDatas = new Array();
        for (var j = 0; j < segments.length; j++){
            var segment=segments[j];

            var isActiveSegment=false;
            for(var k=0;k<activeList.length;k++){
                if(activeList[k].place==j){
                    if(activeList[k].type=="activeSelected"){
                        strokeWeight=7;
                    }else{
                        strokeWeight=5;
                    }
                    isActiveSegment=true;
                   break;
                }
            }
            if(!isActiveSegment){
                strokeWeight=2;
            }
            if(segment!=null){
                for (var i = 0; i < segment.items.length; i++){
                  var item=segment.items[i];
                    if(item!=null){
                       if(isActiveSegment){
                           mapcolor = tgConfig.popup.item[item.type].mapcolor;
                       }else{
                           mapcolor="gray";
                       }
                       var obj =
                       {
                            startpos:item.startpos,
                            endpos:item.endpos,
                            color:mapcolor,
                            trippoints:item.trippoints,
                            strokeWeight:strokeWeight,
                            type:item.type
                       }
                      polylineDatas.push(obj);
                    }
                }
            }
        }

        return polylineDatas;
    },
    getPolylineDataOld:function(segments,activeList){
        var strokeWeight=4; // default
        var polylineDatas = new Array();

        for (var j = 0; j < segments.length; j++){
            var segment=segments[j];
            if(activeList[j].type=="activeSelected"){
                strokeWeight=6;
            }else{
                strokeWeight=4;
            }
            if(segment!=null){
                for (var i = 0; i < segment.items.length; i++){

                    var item=segment.items[i];
                    if(item!=null){
                        var mapcolor = tgConfig.popup.item[item.type].mapcolor;
                        var obj =
                        {
                            startpos:item.startpos,
                            endpos:item.endpos,
                            color:mapcolor,
                            trippoints:item.trippoints,
                            strokeWeight:strokeWeight,
                            type:item.type
                        }
                        polylineDatas.push(obj);
                    }
                }
            }
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
    clearMap: function () {
        if (typeof polylines != "undefined") {
//            for (var i = 0; i < polylines.length; i++)
//            {
//                polylines[i].setMap(null);
//            }//endof FOR

            for (var i = 0; i < polylines.length; i++) {
                for (var j = 0; j < polylines[i].length; j++) {
                    polylines[i][j].setMap(null);
                }//endof FOR
            }//endof FOR

        }//endof IF
    },
    clearMapAll: function () {
        if (typeof polylines != "undefined") {
            for (var i = 0; i < polylines.length; i++) {
                for (var j = 0; j < polylines[i].length; j++) {
                    polylines[i][j].setMap(null);
                }//endof FOR
            }//endof FOR
        }//endof IF
    }
};
var polylines = new Array();

//##############Create the map#############################################################
setItemsOnMapIRA =
    function (segmentRoute, mapObj) {

        var minLat = segmentRoute[0].startpos.latitude;
        var minLon = segmentRoute[0].startpos.longitude;

        var maxLat = segmentRoute[0].startpos.latitude;
        var maxLon = segmentRoute[0].startpos.longitude;


        //If polylines were drawed, remove them before new drawing
        if (typeof polylineList != "undefined") {
            for (var i = 0; i < polylineList.length; i++) {
                polylineList[i].setMap(null);
                polylineListShadow1[i].setMap(null);
                polylineListShadow2[i].setMap(null);
            }//endof FOR
        }//endof IF

        //Allways re-instantiate polylineList
        polylineList = [];
        polylineListShadow1 = [];
        polylineListShadow2 = [];

        var polylineCoords = [];
        //for each item

        for (var i = 0; i < segmentRoute.length; i++) {
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
                        fixedRotation: true,
                        offset: '100%',
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 7,
                            strokeWeight: 2.0,
                            strokeColor: '#000',
                            fillColor: '#FFF',
                            fillOpacity: 1.0
                        },
                        repeat: 0
                    }
//                    {
//                        fixedRotation:false,
//                        offset:'100%',
//                        icon:
//                        {
//                            path:google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
//                            scale: 2
//                        },
//                        repeat:0
//                    }
                ];

//            polylineList[i] = new google.maps.Polyline({
//                path:lineCoords,
//                strokeColor: segmentRoute[i].color,
//                strokeOpacity: 1.0,
//                strokeWeight: segmentRoute[i].strokeWeight,
//                icons: iconList
//            });
//            polylines=polylineList;
//
//            polylineList[i].setMap(mapObj);

            polylineList[i] = new google.maps.Polyline({
                path:lineCoords,
                strokeColor: segmentRoute[i].color,
                strokeOpacity:strokeOpacity,
                strokeWeight: segmentRoute[i].strokeWeight,
                icons: iconList
                //geodesic: true
            });
            // Shadows 1
            polylineListShadow1[i] = new google.maps.Polyline({
                path:lineCoords,
                //geodesic: true,
                strokeColor: "white",//segmentRoute[i].color,
                strokeOpacity: 0.3,
                strokeWeight: 6,
                icons: iconList
            });
            // Shadows 2
            polylineListShadow2[i] = new google.maps.Polyline({
                path:lineCoords,
                strokeColor:"black",// segmentRoute[i].color,
                strokeOpacity: 0.6,
                strokeWeight: 10,
                //geodesic: true,
                icons: iconList
            });

            //polylines=polylineList;
            //polylineList[i].setMap(mapObj);

            polylines.push(polylineListShadow1);
            polylines.push(polylineListShadow2);
            polylines.push(polylineList);

            polylineListShadow1[i].setMap(mapObj);
            polylineListShadow2[i].setMap(mapObj);
            polylineList[i].setMap(mapObj);
            //polylines.push(polylineList);
        }//endof FOR

        var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(minLat, minLon), new google.maps.LatLng(maxLat, maxLon));
        mapObj.fitBounds(bounds);


        mapObj.setCenter(bounds.getCenter());

        google.maps.event.trigger(mapObj, "resize");

    };//endof setItemsOnMap()

/**
 *
 *
 *
 * Just like in the example you posted, create a function to create the click events listeners and call it from inside the locations loop:

 function createInfoWindow(poly,content) {
    google.maps.event.addListener(poly, 'click', function(event) {
        infowindow.content = content;
        infowindow.position = event.latLng;
        infowindow.open(map);
    });
}
 And you can call this at the end of the loop:

 createInfoWindow(poly,info);

 *
 *
 * @param segmentRoute
 * @param mapObj
 * @param strokeWeight
 */

setAllItemsOnMapIRA =
    function (segmentRoute, mapObj) {

        var minLat = segmentRoute[0].startpos.latitude;
        var minLon = segmentRoute[0].startpos.longitude;

        var maxLat = segmentRoute[0].startpos.latitude;
        var maxLon = segmentRoute[0].startpos.longitude;

        //If polylines were drawed, remove them before new drawing
        if (typeof polylineList != "undefined") {
            for (var i = 0; i < polylineList.length; i++) {
                polylineList[i].setMap(null);
                polylineListShadow1[i].setMap(null);
                polylineListShadow2[i].setMap(null);
            }//endof FOR
        }//endof IF

        //Allways re-instantiate polylineList
        polylineList = [];
        polylineListShadow1 = [];
        polylineListShadow2 = [];

        var polylineCoords = [];
        //for each item

        for (var i = 0; i < segmentRoute.length; i++) {


            // TODO: As the selected routes with other route paths is overlapped, they should be redrawn after all others are drawn.
            // For this reason, activeList should be given as a parameter here and the following part move into another function.
            // once the selected elements are encountered, then should be stored in a list, once the whole segments are drawn, the stored list
            // will be again redrawn.


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
                            fillOpacity: 1.0,
                            strokeOpacity: 1

                        },
                        repeat:0
                    }
//                    ,
//                    {
//                        icon:lineSymbol,
//                        offset:'0',
//                        repeat:'20px'
//                    }
            ];
            var strokeOpacity=1;
           // Dash length is controlled by path's +/-1, and spacing is controlled by repeat
            var lineSymbol = {
                path: 'M 0,-0.2 0,0.2',
                strokeOpacity: 1,
                scale: 4

            };
            if(segmentRoute[i].type=="PEDESTRIAN"){
                var obj= {
                    icon:lineSymbol,
                    offset:'0',
                    repeat:'10px'

                };
                strokeOpacity=0;
                iconList.push(obj);
            }

            polylineList[i] = new google.maps.Polyline({
                path:lineCoords,
                strokeColor: segmentRoute[i].color,
                strokeOpacity:strokeOpacity,
                strokeWeight: segmentRoute[i].strokeWeight,
                icons: iconList,
                geodesic: true
            });
            // Shadows 1
            polylineListShadow1[i] = new google.maps.Polyline({
                path:lineCoords,
                geodesic: true,
                strokeColor: "black",
//                strokeOpacity: 0.3,
                strokeOpacity:strokeOpacity,
                strokeWeight: 6,
                icons: iconList
            });
            // Shadows 2
            polylineListShadow2[i] = new google.maps.Polyline({
                path:lineCoords,
                strokeColor: segmentRoute[i].color,
                //strokeOpacity: 0.6,
                strokeOpacity:strokeOpacity,
                strokeWeight: 10,
                geodesic: true,
                icons: iconList
            });

            //polylines=polylineList;
            //polylineList[i].setMap(mapObj);

            polylines.push(polylineListShadow1);
            polylines.push(polylineListShadow1);
            polylines.push(polylineList);

            polylineListShadow1[i].setMap(mapObj);
            polylineListShadow1[i].setMap(mapObj);
            polylineList[i].setMap(mapObj);


        }//endof FOR

        var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(minLat, minLon), new google.maps.LatLng(maxLat, maxLon));
        mapObj.fitBounds(bounds);


        mapObj.setCenter(bounds.getCenter());

        google.maps.event.trigger(mapObj, "resize");

    };//endof setItemsOnMap()





function distanceTo(){
    this.requestedWidth=200;     // default width
    this.requestedHeight=200;    // default height
    this.obj=null

    this.init=function(height,width,object){
        this.obj=object;
        this.requestedWidth=width;
        this.requestedHeight=height;
       // console.info("INIT-> width:"+this.requestedWidth+" height:"+this.requestedHeight);
    },
        this.isBottomAppropriate=function(){
            //console.info("BOTTOM",this.bottom());
            if(this.bottom()>=this.requestedHeight){
//                   console.info("BOTTOM-> true");
                return true;
            }else{
                return false;
            }
        },
        this.isTopAppropriate=function(){
            if(this.top()>=this.requestedHeight){
//                console.info("TOP-> true");
                return true;
            }else{
                return false;
            }
        },
        this.isLeftAppropriate=function(){
            if(this.left()>=this.requestedWidth){
                //console.info("LEFT-> true");
                return true;
            }else{
                return false;
            }
        },
        this.isRightAppropriate=function(){
            if(this.right()>=this.requestedHeight){
                //    console.info("RIGHT-> true");
                return true;
            }else{
                return false;
            }
        },
        this.getAppropriatePlace=function(){
            if(this.bottom()>=this.requestedHeight){
                // console.info("BOTTOM-> true");
                return true;
            }else if(this.top()>=this.requestedHeight){
                //console.info("TOP-> true");
                return true;
            }else if(this.left()>=this.requestedWidth){
                //console.info("LEFT-> true");
                return true;
            }else if(this.right()>=this.requestedHeight){
                //  console.info("RIGHT-> true");
                return true;
            }
        },

        this.left=function(){
            var left=$(window).scrollLeft();
            var elementOffset = this.obj.offset().left;
            var  distance      = (elementOffset - left);
            //console.info("LEFT->"+distance);
            return distance;
        },
        this.right=function(){
            var myLeft = this.obj.offset().left;
            var myRight = myLeft +this.obj.outerWidth();
            var viewportRight = $(window).width() + $(window).scrollLeft();
            var  distance      = (viewportRight - myRight);
            //console.info("RIGHT->"+distance);
            return distance;

        },
        this.bottom=function(){

            var myTop = this.obj.offset().top;
            var myBottom = myTop + this.obj.outerHeight();
            var viewportBottom = $(window).height() + $(window).scrollTop();
            var  distance      = (viewportBottom - myBottom);
//               console.info("BOTTOM->"+distance);
            return distance;

        },
        this.top=function(){
            var top=$(window).scrollTop();
            var elementOffset= this.obj.offset().top;
            var  distance      = (elementOffset - top);
//            console.info("TOP->"+distance);
            return distance;
        }
};

    
    