//console.log("dataParser.js is called");
var googleLocations=[];

function NEWPARSER(incommingData) {
    this.debug = false;                       // For debugging can be used
    this.data =incommingData;
    this.ratings = null;
    this.requests = null;
    this.coordinates = null;
    if (this.debug == true) {
        console.log('Incoming Data Content *****************************************');
        console.log(incommingData);
        console.log('***************************************************************');
    }
    this.filterNullResult=function(iData){
        var slots = [];
        for(var i=0;i<iData.length;i++){
            if(iData[i].length>0 && iData[i]!=null){
                slots.push(iData[i]);
            }
        }
        return slots;
    };
    this.setRatings = function (info) {
        //console.log(info);
        this.ratings = info.ratings;
    };
    this.setRatingsForIRA = function (ratings) {
//        console.debug("ratings->",ratings);
        this.ratings = ratings;
    };
    this.setRequests = function (info) {
        //console.log(info);
        this.requests = info.requests;
    };
    this.getTravelDataForCalendar = function (slotData, rating) {
        this.data = slotData;
        var slots = [];
        //console.log("Lenght of data:"+this.data.length);
        var slot = null;
        slot = this.parseSlot(slotData, rating);

        if (slot != false || slot != undefined) {
            slots.push(slot);

        }
        var maxs = this.findMaxMinimums(slots);       // adding maximums to the tgData

        var res = slots;//this.sortSlots(slots, this.ratings);
        if (res != null) {
            slots = res;
        }
        var startStation = "";
        var endStation = "";
        var startDate = "";

        if (slots[0] !== undefined) {
            startStation = slots[0].segments[0].items[0].startstation;
            var temp = slots[slots.length - 1].segments[slots[slots.length - 1].segments.length - 1];
            endStation = temp.items[temp.items.length - 1].endstation;
            startDate = slots[0].segments[0].items[0].startdate;
        }
        var tgData = {
            headObj: {startDate: startDate, startStation: startStation, endStation: endStation},  // header object
            maximums: maxs,
            slots: slots
        };

        return tgData;
    };

//    this.removeSameRoutes=function(slots){
//        var list = [];
//        var copySlots=slots;
//        for (var i = 0; i < slots.length; i++) {
//            for (var j = 0; j < slots.length; j++) {
//                if (!(copySlots[j].overAllRating == slots[i].overallRating &&
//                    copySlots[j].costs == slots[i].costs &&
//                    copySlots[j].duration == slots[i].duration &&
//                    copySlots[j].realPrefValue.co2 == slots[i].realPrefValue.co2 &&
//                    copySlots[j].realPrefValue.duration == slots[i].realPrefValue.duration &&
//                    copySlots[j].realPrefValue.costs == slots[i].realPrefValue.costs)) { // TODO: If the rating are
//                    console.log("SAME ROUTE!");
//                    copySlots.splice(j,1);
//                    list.push(slots[i]);
//                }
//            }
//
//        }
//        return list;
//
//    };
    this.getTravelData = function () {
        this.data=this.filterNullResult(this.data);
        var slots = [];
        //console.log("Lenght of data:"+this.data.length);
        for (var i = 0; i < this.data.length; i++) {        // fills the slots with the data
            //console.log("SLOt:"+i);
            var slot = null;
            if((this.ratings!=null && this.data[i]!=null)  && this.requests!=null) {
                slot = this.parseSlot(this.data[i], this.ratings[i], this.requests[i]);
            }
            else if(this.ratings!=null && this.data[i]!=null) {
                slot = this.parseSlot(this.data[i], this.ratings[i]);
            }
            if (slot != false || slot != undefined) {
                slots.push(slot);
            }
        }
        //slots=this.removeSameRoutes(slots);

        var maxs = this.findMaxMinimums(slots);       // adding maximums to the tgData

       var res =slots;//this.sortSlots(slots, this.ratings);
        if (!window.sortMap){
            window.sortMap = {};
        }
        for (var i = 0; i < slots.length; i++) {
            var slot = slots[i];
            for (var j = 0; j < res.length; j++) {
                var re = res[j];
                if (slot === re){
                    window.sortMap[i] = j;
                }
            }
        }
        if (res != null) {
            slots = res;
        }
        var startStation = "";
        var endStation = "";
        var startDate = "";

        var notNullSlot=0;//this.getFirstNotNullRoute(slots);
        if (slots[notNullSlot] !== null && slots[notNullSlot] !=undefined ) {
            //console.debug("SLOT START STATION:",slots[notNullSlot]);
            if(slots[notNullSlot].segments[0]!=null) {
                if (slots[notNullSlot].segments[0].items[0].startstation !== undefined) {
                    startStation = slots[notNullSlot].segments[0].items[0].startstation;
                }
                var temp = slots[notNullSlot].segments[slots[notNullSlot].segments.length - 1];

                if (temp.items[temp.items.length - 1].endstation !== undefined) {
                    endStation = temp.items[temp.items.length - 1].endstation;
                    //console.debug("SLOT END STATION:",temp);
                }
                startDate = slots[notNullSlot].segments[0].items[0].startdate;
            }
        }
        var tgData = {
            headObj: {startDate: startDate, startStation: startStation, endStation: endStation},  // header object
            maximums: maxs,
            slots: slots
        };
        if (this.debug == true) {
            console.log(tgData);
        }
        return tgData;
    };
    this.getFirstNotNullRoute=function(slots){
        for(var i=0;i<slots.length;i++){
            if(slots[i].length>0){
                return i;
            }
        }
        return 0;

    };
    this.getTravelDataForMotSlider = function () {
        this.data=this.filterNullResult(this.data);

        var slots = [];
        for (var i = 0; i < this.data.length; i++) {
            var slot = null;

            if (this.requests != null) {
                slot = this.parseSlot(this.data[i], this.ratings[i], this.requests[i]);
            } else {
                slot = this.parseSlot(this.data[i], this.ratings[i]);
            }

            if (slot != false || slot != undefined) {
                slots.push(slot);

            }

        }
        var maxs = this.findMaxMinimums(slots);       // adding maximums to the tgData

        var res = slots;//this.sortSlots(slots, this.ratings);
        if (res != null) {
            slots = res;
        }
        var startStation = "";
        var endStation = "";
        var startDate = "";
        if (slots[0] !== undefined) {

            if (slots[0].segments[0].items[0].startstation!== undefined) {
                startStation = slots[0].segments[0].items[0].startstation;
                //console.debug("SLOT START STATION:",slots[0].segments[0]);
            }
            var temp = slots[0].segments[slots[0].segments.length - 1];

            if(temp.items[temp.items.length - 1].endstation!==undefined){
                endStation = temp.items[temp.items.length - 1].endstation;
                //console.debug("SLOT END STATION:",temp);
            }
            startDate = slots[0].segments[0].items[0].startdate;
        }
        var tgData = {
            headObj: {startDate: startDate, startStation: startStation, endStation: endStation},  // header object
            maximums: maxs,
            slots: slots
        };
        if (this.debug == true) {
            console.log(tgData);
        }
        return tgData;
    };


    /* This function should be moved under the main of the result view js*/

    this.findMaxMinimums = function (slots) {
        // need for maximum segment duration of each slot in the same coulumn
        // need for maximum cost, slot duration for doughnuts
        var segmentMaxDur = 0, slotMaxCo2 = 0, slotMaxDur = 0, slotMaxCost = 0, slotMaxComfort;
        var slotMinCo2 = 9999999999, slotMinDur = 99999999, slotMinCost = 9999999, slotMinComfort = 9999999;
        var tCost = 0, tDuration = 0, tCo2 = 0, tComfort=0;
        //console.log("slot LENG"+slots.length);
        for (var i = 0; i < slots.length; i++) {
            var slot = slots[i];
            if(slot!=null) {
                if (slot.segments != null) {
                    var segments = slot.segments;
                    for (var j = 0; j < segments.length; j++) {
                        var segment = segments[j];
                        if (segment.duration > segmentMaxDur) {
                            segmentMaxDur = segment.duration;
                        }
                    }
                }

                // max: cost, co2, duration
                if (slot.costs > slotMaxCost) {
                    slotMaxCost = slot.costs;
                }
                if (slot.co2 > slotMaxCo2) {
                    slotMaxCo2 = slot.co2;
                }
                if (slot.duration > slotMaxDur) {
                    slotMaxDur = slot.duration;
                }
                if (slot.comfort > slotMaxComfort) {
                    slotMaxComfort = slot.comfort;
                }
                // mins: cost, co2, duration
                if (slot.costs < slotMinCost) {
                    slotMinCost = slot.costs
                }
                if (slot.co2 < slotMinCo2) {
                    slotMinCo2 = slot.co2;
                }
                if (slot.duration < slotMinDur) {
                    slotMinDur = slot.duration;
                }
                if (slot.comfort < slotMinComfort) {
                    slotMinComfort = slot.comfort;
                }
                tCo2 = tCo2 + slot.co2;
                tCost = tCost + slot.costs;
                tDuration = tDuration + slot.duration;
                tComfort = tComfort + slot.comfort;
            }
        }
        var earliestdate=0,latestdate=0,earliesttime=0,latesttime=0,_duration;

        if(slots.length>0){
            if (slots[0] != null ) {
                if (slots[0].segments != null ) {
                     earliestdate = Date.parse(slots[0].segments[0].startdate);
                     latestdate = Date.parse(slots[0].segments[0].enddate);
                     earliesttime = slots[0].segments[0].starttime;
                     latesttime = slots[0].segments[0].endtime;
                }
            }
        }

        for (var i = 1; i < slots.length; i++) {
            var slot = slots[i];
            if(slot!=null) {
                if (slot.segments != null) {
                    var segments = slot.segments;

                    var segment = segments[0];
                    if (Date.parse(segment.startdate) < earliestdate) {
                        earliestdate = Date.parse(segment.startdate);
                        earliesttime = segment.starttime;
                    }
                    if (Date.parse(segment.enddate) > latestdate) {
                        latestdate = Date.parse(segment.enddate);
                        latesttime = segment.endtime;
                    }
                }

            }

        }
        _duration = (latestdate - earliestdate) / (1000 * 60);

        var maximums = {
            // Co2,Cost and Dur are needed for illustrating the doughnuts widget percentaages
            maxSlotCo2: slotMaxCo2,
            maxSlotCost: slotMaxCost,
            maxSlotDur: slotMaxDur,
            maxSlotComfort: slotMaxComfort,
            minSlotCo2: slotMinCo2,
            minSlotComfort: slotMinComfort,
            minSlotCost: slotMinCost,
            minSlotDur: slotMinDur,
            maxSegmentDur: segmentMaxDur,
            totalCost: tCost,
            totalCo2: tCo2,
            totalComfort: tComfort,
            earliesttime:earliesttime,
            latesttime:latesttime,
            earliestdate:earliestdate,
            latestdate:latestdate,
            totalTimeDiffBWEarlistAndLatest:_duration,// in minutes
            totalDuration: tDuration
            /* This is required for calculating the segment percentage. The maximum duration is the longest width and its value 100%, the other widths will be calculated with respect to this value. Basically, the width of a segment is equal to segmentDuration/maximumSegmentDuration.
             */
        };
        if(this.debug) {
            console.debug("earliesttime", maximums.earliesttime);
            console.debug("latesttime", maximums.latesttime);
            console.debug("earliest date", maximums.earliestdate);

            console.debug("duration", maximums.totalTimeDiffBWEarlistAndLatest);
        }
        return maximums;
    };

        /***/
    this.parseSlot = function (slotData, rating, request) {
        var requestVal = null;
        if (request !== undefined) {
            requestVal = request;
        }
        var _co2 = 0, _duration = 0, _costs = 0, _comfort = 0,_oRating = 0;
        //console.log("SEGMENT:"+slotData[0]);
        var segments = this.parseSegments(slotData);
        if (segments != false) {
            for (var i = 0; i < segments.length; i++) {
                _co2 += segments[i].co2;
                _duration += segments[i].duration;
                _costs += segments[i].costs;
                _comfort += segments[i].comfort;
                _oRating += segments[i].overallRating;
            }
            if (this.debug == true) {
                console.log("SLOT:" + _co2 + " " + _costs + " " + _duration + " " + _oRating);
            }
            var slot = null;
//            console.log("RATING COST:"+Math.round(rating.cost * 100) +" Planning ID:"+rating.planningID);
            slot = {
                request: requestVal,
                realPrefValue: {
                    co2: Math.round(rating.realco2 * 1000) / 1000,
                    duration: Math.round(rating.realduration * 100) / 100,  // TODO: try also _duration variable
                    costs: Math.round(rating.realcost * 100) / 100,
                    comfort: Math.round(rating.realcomfort * 100) / 100,
                },
                planningID: rating.planningID,
                segments: segments,
                comfort: (rating.comfort == 0 ? 0 : Math.round(rating.comfort * 100) ),//,
                co2: (rating.co2 == 0 ? 0 : Math.round(rating.co2 * 100) ),//_co2,
                duration: (rating.duration == 0 ? 0 : Math.round(rating.duration * 100) ), //_duration,                   // rounding
                costs: (rating.cost == 0 ? 0 : Math.round(rating.cost * 100) ),//Math.round(_costs   * 100) / 100,                 // rounding to at most 2 decimal places
                overallRating: (rating.overAllRating == 0 ? 0 :  Math.round(Math.round((rating.overAllRating * 100)) / 100 * 100)) //Math.round(_oRating   * 100) / 100        // rounding to at most 2 decimal

            };
            return slot;
        }
        return false;
    }

    this.removeSeconds=function(time){
        //console.warn("=========")
        //console.debug("incoming time",time);
        var startTime=Date.parse(time);
        //console.debug("incoming time in milli",startTime);
        var rest=(startTime/1000)%60;
        //console.debug("rest",rest);
        var newTime=startTime-rest*1000;
        //console.debug("newTime",new Date(newTime));

        return new Date(newTime);
    };

    /***/
    this.parseSegments = function (segmentData) {
        var segmentGroups = [];
        var _items = [];
        var _segmentCo2 = 0;
        var _segmentCosts = 0;
        var _segmentComfort = 0;
        var _oRating = 0;
        var _durationOfItems = 0;

        for (var i = 0; i < segmentData.length; i++) {
            var item = this.parseItem(segmentData[i]);
            if (item != false) {
                _segmentCo2 += item.co2;
                _segmentComfort += item.comfort;
                _segmentCosts += item.costs;
                _oRating += item.overallRating;
                _durationOfItems += item.duration;
                _items.push(item);
            } else {
                var _starttime = _items[0].starttime;               //The starttime of a segment is the starttime of this first item
                var _endtime = _items[_items.length - 1].endtime;  //The endtime of a segment is the endtime of this last item
                var _startdate = this.removeSeconds(_items[0].startdate);               //The startdate of a segment is the startdate of this first item
                var _enddate = this.removeSeconds(_items[_items.length - 1].enddate);  //The enddate of a segment is the enddate of this last item


                var _duration = (_enddate.getTime() - _startdate.getTime()) / (1000 * 60);
                //var _duration = (_enddate.getTime() - _startdate.getTime()) / (1000 * 60);


                if (this.debug == true) {
                    console.log("!!! SEGMENT-" + i + ": " + _startdate + " " + _enddate + " " + _duration + " " + _durationOfItems);
                }
                var segment = {
                    duration: _duration,
                    co2: _segmentCo2,
                    comfort: _segmentComfort,
                    costs: Math.round((_segmentCosts * 100) / 100),
                    starttime: _starttime,
                    startdate:_startdate,
                    endtime: _endtime,
                    enddate:_enddate,
                    overallRating: _oRating,
                    items: _items,
                    waydata: this.calculateDistance(segmentData),
                    startstation: _items[0].startstation,
                    endstation: _items[_items.length - 1].endstation
                };

                segmentGroups.push(segment);
                _segmentCo2 = 0;
                _segmentCosts = 0;
                _segmentComfort = 0;
                _oRating = 0;
                _durationOfItems = 0;
                _items = [];
            }
            // last part this is the same as in previous part
            if (segmentData.length - 1 == i) {
                var _starttime = _items[0].starttime;
                var _endtime = _items[_items.length - 1].endtime;
                var _startdate = this.removeSeconds(_items[0].startdate);
                var _enddate = this.removeSeconds(_items[_items.length - 1].enddate);  //The enddate of a segment is the enddate of this last item

                var _duration = (_enddate.getTime() - _startdate.getTime()) / (1000 * 60);

                var segment = {
                    duration: _duration,
                    co2: _segmentCo2,
                    comfort: _segmentComfort,
                    costs: _segmentCosts,
                    starttime: _starttime,
                    startdate:_startdate,
                    endtime: _endtime,
                    enddate:_enddate,
                    overallRating: _oRating,
                    items: _items,
                    waydata: this.calculateDistance(segmentData),
                    startstation: _items[0].startstation,
                    endstation: _items[_items.length - 1].endstation
                };
                if (this.debug == true) {
                    console.log("SEGMENT-LAST:" + _starttime + " " + _endtime + " " + _duration + " " + segment.overallRating);
                }
                segmentGroups.push(segment);
            }
        }
        if (segmentGroups.length == 0) {
            return false;
        }
        return segmentGroups;
    };// end of Segment


    this.parseItem = function (itemData) {
        //Get the next item from the given response slot
        //console.log(itemData);
        var itObj = itemData;
        if (itObj == false || itObj == undefined)//there no more items in the current response slot
        {
            return false;
        }

        //Is this item a Waypoint-Marker
        if (itObj.serviceProvider == "separate") {
            return false;
        }
//        console.log("CAPTION:"+itObj.serviceProvider);
        var caption = itObj.line;

        switch (itObj.type) {
            case "PEDESTRIAN":
                caption = "Zu Fuß";
                break;
            case "CAR":
                caption = itObj.serviceProvider;
                break;
            case "BICYCLE":
                caption = itObj.serviceProvider;
                break;
            //other knowned types. !!! All other are default
            case "REGIONAL_TRAIN":
            case "BUS":
            case "TRAM":
            case "SBAHN":
            case "UBAHN":
                //Do nothing BUT don't go to the "DEFAULT"-case
                break;
            default:
                itObj.type = false;
                caption = itObj.serviceProvider;
                console.info("New Transport-type to be added in the parser, see following object:");
                console.info(itObj);
                break;
        }
        if (caption.toLowerCase() == "car2go" || caption.toLowerCase() == "flinkster") {
            itObj.type = "CAR_SHARING";
        } else if (caption == "own car") {
            caption = "Eigenes Auto";
        } else if (caption == "nextbike") {
            caption = "NextBike";
            itObj.type = "BICYCLE_SHARING";
        } else if (caption == "own bike") {
            caption = "Eigenes Fahrrad";
            itObj.type = "BICYCLE";
        } else if (caption == "taxi") {
            itObj.type = "TAXI";
        } else if (caption == "TRAM") {
            itObj.type = "TRAM";
        }else if(caption=="CiteeCar"){
            itObj.type="CAR_SHARING";
        }

        //Replace spaces with the html-space so that no line break happens in small items
        caption = caption.replace(/ /g, "&nbsp;");

        //Format function to change "3" into "03"
        var formatTwoDigits =
            function (tNumb) {
                var str = '' + tNumb;
                if (tNumb < 10) {
                    str = '0' + tNumb;
                }
                return str;
            }

        //Get the start information (time and geolocation) of the item ------------------
        var startdateMilli = Date.parse(itObj.startDate.Ax1.date);
        var startDate = new Date(startdateMilli);
        var starttime = formatTwoDigits(startDate.getHours()) + ':' + formatTwoDigits(startDate.getMinutes());

        var startLatitude = itObj.startPosition.Ax1.geoLocation.Ax1.latitude;
        var startLongitude = itObj.startPosition.Ax1.geoLocation.Ax1.longitude;

        //Get the end information (time and geolocation) of the item ------------------
        var enddateMilli = Date.parse(itObj.endDate.Ax1.date);
        var endDate = new Date(enddateMilli);
        var endtime = formatTwoDigits(endDate.getHours()) + ':' + formatTwoDigits(endDate.getMinutes());

        var endLatitude = itObj.endPosition.Ax1.geoLocation.Ax1.latitude;
        var endLongitude = itObj.endPosition.Ax1.geoLocation.Ax1.longitude;

        //Get the duration of the item ------------------
        var diff = enddateMilli - startdateMilli;
        //var duration = Math.round(diff / 600) / 100; // in minutes (as float)
        var duration = (diff / 1000).toFixed(0); // in minutes (as float)

        var startPos = itObj.startPosition.Ax1.geoLocation.Ax1;
        var startStation = itObj.startStation;
        if (startStation == null || startStation == "undefined")//without a station, show after an address
        {
            if (itObj.startPosition.Ax1.address == null||itObj.startPosition.Ax1.address == "undefined")//if no address, find it through an geolocation request
            {
                //See used function in ira-gmapHandler.js
                if(itObj.startPosition.Ax1.name!=null && itObj.startPosition.Ax1.name!="undefined"){
                    startStation=itObj.startPosition.Ax1.name;
                }else {
                    startStation=this.getStationAddress(startPos);
                    //console.debug("startStation value ->",startStation);
                }
            }
            else {
                if (itObj.startPosition.Ax1.address.Ax1.name == null || itObj.startPosition.Ax1.address.Ax1.name == "undefined") {
                    //console.log("SP:Ax1.address.Ax1.name are null");
                    startStation=this.getStationAddress(startPos);
                    //console.debug("startStation value ->",startStation);
                }
                else {
                    startStation = itObj.startPosition.Ax1.address.Ax1.name;
                }//endof IF
            }//endof IF
        }//endof IF

        //Ensure an end adress/station
        var endPos = itObj.endPosition.Ax1.geoLocation.Ax1;
        var endStation = itObj.endStation;
        if (endStation == null || endStation == "undefined")//without a station, show after an address
        {

            if (itObj.endPosition.Ax1.address == null || itObj.endPosition.Ax1.address == "undefined")//if no address, find it througth an geolocation request
            {
                if(itObj.endPosition.Ax1.name!=null && itObj.endPosition.Ax1.name!="undefined"){
                    endStation=itObj.endPosition.Ax1.name;
                }else{
                    endStation=this.getStationAddress(endPos);
                    //console.debug("endStation value ->",endStation);
                }
            }
            else {
                if (itObj.endPosition.Ax1.address.Ax1.name == null || itObj.endPosition.Ax1.address.Ax1.name == "undefined") {
                    endStation=this.getStationAddress(endPos);
                    //console.debug("endStation value ->",endStation);
                }
                else {
                    endStation = itObj.endPosition.Ax1.address.Ax1.name;
                }//endof IF
            }//endof IF
        }//endof IF

        // This block obtains the related vehicle type information from a configuration file

        var vehicleTypeProp;

        var overallRating = 0;

        var parsedItemData =
        {
            iconProp: vehicleTypeProp,
            type: itObj.type,
            caption: caption,
            starttime: starttime,
            startpos: startPos,
            endtime: endtime,
            endpos: endPos,
            duration: duration,
            startdate: startDate,
            enddate: endDate,
            startstation: startStation,
            endstation: endStation,
            co2: itObj.co2,
            costs: itObj.costs,
            comfort:itObj.comfort,
            overallRating: overallRating,
            trippoints: itObj.tripPoints
        };
        return parsedItemData;

    };//endof this.parseNextItem
    this.getStationAddress=function(position){
        // local research
        var address=this.isThisAddressAvailable(position);

        if(!address){
            address = this.geoLocationToAdress(position);
            this.addPositionToCache(address,position);
            ajaxCommunicator.storeGeoLocation(position.latitude,position.longitude,address);
            //console.debug("address is received from GOOGLE ->",address);
            return address;
        }else{
            //console.debug("address is received from CACHE ->",address);
            return address;
        }
    };
    this.isThisAddressAvailable=function(position){
        var result=false;
        for(var i=0;i<googleLocations.length;i++)
        {
            if(googleLocations[i].comparePosition(position)){
                //console.debug("Get Location Address From Local Cache",  googleLocations[i].getAddress());
                return googleLocations[i].getAddress();
            }
        }
        // look for in the second cache
        if(!result){
            var address;
            address=JSON.parse(ajaxCommunicator.getAddressOfGeoLocation(position.latitude,position.longitude));
            //console.debug("Get Location Address From Backend Cache", address);
            if(address!=undefined && address.address!=""){
                return address.address;
            }
        }
        return false;
    }
    this.addPositionToCache =function(address,position){
        var pos= new LocationAddress();
        pos.setAddress(address);
        pos.setPosition(position);
        googleLocations.push(pos);
    };
    this.getItemRelatedProperties = function (item) {
        var vehicleTypeProp;
        if (this.type != false) {
            vehicleTypeProp = tgConfig.popup.item[this.type];
        }
        else {
            vehicleTypeProp = tgConfig.popup.item['DEFAULT'];
        }
    };
    this.getVehicleType = function (itObj) {
        var caption = itObj.line;

        switch (itObj.type) {
            case "PEDESTRIAN":
                caption = "Zu Fuß";
                break;
            case "CAR":
                caption = itObj.serviceProvider;
                break;
            case "BICYCLE":
                caption = itObj.serviceProvider;
                break;
            //other knowned types. !!! All other are default
            case "REGIONAL_TRAIN":
            case "BUS":
            case "TRAM":
            case "SBAHN":
            case "UBAHN":
                //Do nothing BUT don't go to the "DEFAULT"-case
                break;
            default:
                itObj.type = false;
                caption = itObj.serviceProvider;
                console.info("New Transport-type to be added in the parser, see following object:");
                console.info(itObj);
                break;
        }
        // console.log("CAPTION:"+caption+" SPROVIDER:"+itObj.serviceProvider );
        //Notice: Balcony for Demo
        if (caption == "own car") {
            caption = "Eigenes Auto";
        } else if (caption == "nextbike") {
            caption = "NextBike";
        } else if (caption == "own bike") {
            caption = "Eigenes Fahrrad";
        }
        return caption;
    };
     this.geoLocationToAdress = function (geoPos) {
            var STATION;
            gmapHandler.geocodeLatLngServerSide(
                function (data) {
                    STATION = data;
                    //console.warn(data);
                    return STATION;
                },
                new Position(geoPos.latitude, geoPos.longitude),0);
            return STATION;
        };

    var geoLocationToAdressCallback = function (geoPos,callback,delay) {

        var STATION;
        gmapHandler.geocodeLatLng(
            function (data) {
                STATION = data;
                console.debug("delay",delay+" "+data);
                callback(data);
            },
            new Position(geoPos.latitude, geoPos.longitude),0);
    };
    this.getRawItems = function () {
        var items = [];
        for (var i = 0; i < this.data[0].length; i++) {        // fills the slots with the data
            var item = this.data[0][i];

            if (item != false && item != undefined && item != "type:false" && item != "type") {
                items.push(item);
            }
        }
        return items;
    };
    this.getRawItemsForBI = function () {
        var items = [];

        for (var i = 0; i < this.data.length; i++) {        // fills the slots with the data
            var item = this.data[i][0];
            if (item != false || item != undefined) {
                items.push(item);
            }

        }
        return items;
    };
    this.getCoordinates = function () {
        if (this.coordinates != null) {
            return this.coordinates;
        } else {
            return null;
        }
    }
    this.calculateDistance = function (segmentRoute) {
        var lineCoords = [];
        var startPoint = null;
        var endPoint = null;

        //for each item
        for (var i = 0; i < segmentRoute.length; i++) {
            if (segmentRoute[i].startPosition != null) {
                startPoint = segmentRoute[i].startPosition.Ax1.geoLocation.Ax1;
                //Lon = segmentRoute[i].startpos.longitude;
                lineCoords.push(new google.maps.LatLng(startPoint.latitude, startPoint.longitude));
                //Add the trippoints of the current item
                var trippoints = segmentRoute[i].tripPoints;
                var n = trippoints.length;

                //Ignore the first and last because they are handle separately
                //for defining bounds
                for (var j = 1; j < n - 1; j++) {
                    Lat = trippoints[j].Ax1.geoLocation.Ax1.latitude;
                    Lon = trippoints[j].Ax1.geoLocation.Ax1.longitude;
                    lineCoords.push(new google.maps.LatLng(Lat, Lon));
                }//endof FOR
                endPoint = segmentRoute[i].endPosition.Ax1.geoLocation.Ax1;

                lineCoords.push(new google.maps.LatLng(endPoint.latitude, endPoint.longitude));
            }
        }//endof FOR
        this.coordinates = lineCoords;
        var distance = 0;
        //var googleDistance=0;
        for (var i = 0; i < lineCoords.length - 1; i++) {
            distance += getDistance(lineCoords[i], lineCoords[i + 1]);
            // googleDistance+=google.maps.geometry.spherical.computeDistanceBetween(lineCoords[i], lineCoords[i+1])
            // console.log("Google Mes:"+googleDistance+" our method:"+distance);
            i++;
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

        //console.log("TOTAL DISTANCE:"+Math.round(distance   * 100) / 100);
        //console.log("TOTAL DISTANCE:"+googleDistance);
        return {
            startPoint: startPoint,
            endPoint: endPoint,
            distance: Math.round(distance * 100) / 100
        }
    }//endof calculateDistance()

};
// TODO: Cache mechanism is required for collecting the gps points.
//

function LocationAddress(){
    this.latitude=null;
    this.longitude=null;
    this.address=null;
    this.position=new Position(0,0);

    this.setAddress=function(address){
        this.address=address;
    };
    this.getAddress=function(){
        return this.address;
    };
    this.setPosition=function(pos){
        this.position=pos;
        this.latitude=pos.latitude;
        this.longitude=pos.longitude;
    };
    this.comparePosition= function (position) {
        if(this.latitude==position.latitude && this.longitude==position.longitude){
            return true;
        }else{
            return false;
        }
    }
    this.getPosition=function(){
        return this.position;
    };

};
