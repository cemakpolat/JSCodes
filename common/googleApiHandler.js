////console.log("googleApiHandler.js is called");
////Load first of all google api, then call the googleApiHandler!
//function handleClientLoadGoogleAPI() {
//    googleApiHandler.setupGoogleCalendarAPI();
//}
///**
// *
// *
// *@namespace
// * @author Cem Akpolat
// */
//var googleApiHandler = {
////    clientId: '406697488776.apps.googleusercontent.com',
////    apiKey: 'AIzaSyB7hiUcx9dTMbuwGxTwNRc1k1JbX1fCTx8',
//    clientId:'399811154158-k3uk2km4dsk9h0t9gqle46hpic0m08pk.apps.googleusercontent.com',//TODO: my cliet id
//    apiKey:'AIzaSyCPOwW1QC5QMALxxGZvHlzkOnPBK88h9Ds',                                   // TODO: My API Key
//    //scopes: 'https://www.googleapis.com/auth/plus.me',
//    scopes: 'https://www.googleapis.com/auth/calendar',
//    setupGoogleCalendarAPI: function () {
//        gapi.client.setApiKey(googleApiHandler.apiKey);
//        window.setTimeout(googleApiHandler.checkAuth, 1);
//        gapi.client.load('calendar', 'v3', function () {
//            console.log('google client calendar api loaded.');
//        });
//    },
//    checkAuth: function () {
//        gapi.auth.authorize({
//            client_id: googleApiHandler.clientId,
//            scope: googleApiHandler.scopes,
//            immediate: true
//        }, function () {
//        });
//    },
//    handleAuthResult: function (authResult) {
//        // var authorizeButton = document.getElementById('authorize-button');
//        if (authResult && !authResult.error) {
//            //authorizeButton.style.visibility = 'hidden';
//            googleApiHandler.synchronizeCalendars();
//
//            //alert("authorized");
//        } else {
//            alert("fail");
//            //authorizeButton.style.visibility = '';
//            //  authorizeButton.onclick = handleAuthClick;
//        }
//    },
//
//    handleSynchClick: function (event) {
//
//        gapi.auth.authorize({
//            client_id: googleApiHandler.clientId,
//            scope: googleApiHandler.scopes,
//            immediate: false
//        },googleApiHandler.handleAuthResult);
//        return false;
//    },
//    synchronizeCalendars: function () {
//        var incomingDate=googleApiHandler.timeFilter();
//        gapi.client.load('calendar', 'v3', function() {
//            var ApiRequest = gapi.client.calendar.calendarList.list();
//            ApiRequest.execute(function(response) {
//                //  console.log(resp);
//                //console.log("INCOMING DATE:"+incomingDate);
//                googleApiHandler.openSelectCalendarsPlane(response,incomingDate, googleApiHandler.generateCalendarEvents_new);
//            });
//        });
//    },
//
//    saveRoute: function (time) {
//        var incomingDate=googleApiHandler.timeFilter();
//        gapi.client.load('calendar', 'v3', function() {
//            var ApiRequest = gapi.client.calendar.calendarList.list();
//            ApiRequest.execute(function(response) { //response means here calendar list
////                console.log(response);
//                var calendarIds = [];
//                for (var val in response.items) {
//                    var calendarTemp = response.items[val];
//
//                    var calendar = {};
//                    calendar.calendarId=calendarTemp.id;
//                    calendar.calendarName=calendarTemp.summary;
////                    console.log("TRIAL: "+ calendar.calendarName+ " "+ calendar.calendarId );
//
//                    calendarIds.push(calendar);
//                }
//                googleApiHandler.insertEvent(calendarIds[0],incomingDate);
//            });
//        });
//
//    },
//    callPeriodicallyCalendars: function(){
//        var duration=1*30*1000; // 10min
//        //call calendars
//        //call calendar ids
//        setInterval(function(){
//            googleApiHandler.checkAuth();
//
//            var incomingDate=googleApiHandler.getCurrentTime();
//            //console.warn("CREATED DATE->"+ incomingDate.startTime+" "+incomingDate.endTime+" "+incomingDate.thresholdTimeForInfo);
//
//            gapi.client.load('calendar', 'v3', function() {
//                var ApiRequest = gapi.client.calendar.calendarList.list();
//                ApiRequest.execute(function(response) { //response means here calendar list
//                    //console.log(response);
//                    var calendarIds = [];
//                    for (var val in response.items) {
//                        var calendarTemp = response.items[val];
//
//                        var calendar = {};
//                        calendar.calendarId=calendarTemp.id;
//                        calendar.calendarName=calendarTemp.summary;
//                        //console.log("TRIAL: "+ calendar.calendarName+ " "+ calendar.calendarId );
//
//                        calendarIds.push(calendar);
//                    }
//                    googleApiHandler.getCalendarEvents(calendarIds,incomingDate);
//                });
//            });
//
//        },duration);
//
//        // check their events whether there is any near time to current time
//        // inform clients about the next meetin.sliderCoverg in  a dialog/popup box. (BUTTONS START, CANCEL)
//        // START  ->> add target
//
//    },
//
//    getCurrentTime:function(){
//        var startDate = new Date();
//        var endDate = new Date();
//        var threshold=3600000;
//        endDate.setHours(23,59,59,999);
//        return {startTime:startDate,endTime:endDate,thresholdTimeForInfo:threshold};
//    },
//
//    getCalendarEvents: function (calendars,incomingDate) {
//        // console.warn("CREATED DATE->"+ incomingDate.startTime+" "+incomingDate.endTime+" "+incomingDate.thresholdTimeForInfo);
//
//        // console.warn("CREATED DATE->"+ googleApiHandler.isoDate(incomingDate.startTime)+" "+googleApiHandler.isoDate(incomingDate.endTime));
//        // console.log("CALENDAR IDS-> " + calendarIds.length);
//
//        for (var i = 0; i < calendars.length; i++) {
//            //   console.warn("CALENDAR IDS-> " + calendarIds[i]);
//            var calendarName=calendars[i].calendarName;
//            var eventRequest = gapi.client.calendar.events.list({ "calendarId": calendars[i].calendarId,
//                "singleEvents" : true,
//                "orderBy" : "startTime",
//                "timeMin": googleApiHandler.isoDate(incomingDate.startTime),     // GOOGLE TIME FORMAT: "timeMin": "2013-05-09T09:43:00+02:00"
//                "timeMax": googleApiHandler.isoDate(incomingDate.endTime)
//            });
//
//            eventRequest.execute(function (response) {
//                var events = response.items;
//                //console.warn("CALENDAR EVENT COUNT-> " + response.items.length);
//                if (response.items) {
//                    var occurrenceList=new Array();
//                    if(response.items.length>1) {
//
//                        for (var j = 0; j < response.items.length; j++) {
//                            var currentCalendarEvent = events[j];
//
//                            //var googleCalendarEvent = events[j];
//
//                            var calendarEvent = {};
//                            calendarEvent.title = currentCalendarEvent.summary;
//                            calendarEvent.start = new Date(currentCalendarEvent.start.dateTime);
//                            calendarEvent.end = new Date(currentCalendarEvent.end.dateTime);
//                            calendarEvent.allDay = false;
//                            calendarEvent.location = currentCalendarEvent.location;
//                            calendarEvent.calendarName=calendarName;
//
//                            //occurrenceList.push(calendarEvent);
//                            var diff= calendarEvent.start.getTime()-incomingDate.startTime.getTime();
//                            //console.info("CALENDAR TIME DIFF->" +calendarName+ " "+"time diff in "+diff+" ms");
//
//                            if(!((calendarEvent.start.getTime()-incomingDate.startTime.getTime())>incomingDate.thresholdTimeForInfo))
//                                occurrenceList.push(calendarEvent);
//                            //console.info("CALENDAR ->"+calendarName+ " " + calendarEvent.title+" start:"+ calendarEvent.start+" end:"+ calendarEvent.end);
//                            if (currentCalendarEvent.location) {
//                                calendarEvent.location = currentCalendarEvent.location;
//                                //calendarEvent.title += "\n" + currentCalendarEvent.summary;
//
//                            } else {
//                                console.warn("CALENDAR location-> NULL" + calendarEvent.location);
//                            }
//
//                        }
//                    }
//                    googleApiHandler.openInfoDialog(occurrenceList);
//
//                }
//            });
//
//        }
//
//    },
//    openInfoDialog:function(occurrenceList){
//        $( ".google_update_panel" ).remove();
//
//        var selectCalendarsDiv = document.createElement("div");
//        $(selectCalendarsDiv).addClass("google_update_panel"); // change the class name
//
//        var p = document.createElement("p");
//
//        for (var i=0;i<occurrenceList.length;i++) {
//
//            var calendar = occurrenceList[i];
//
//            // change the following content with respect to our needs
//            //console.log("CALENDAR LOCATION:->"+ calendar.start+" "+ calendar.end+" "+calendar.location);
//            var checkbox = document.createElement("input");
//            checkbox.type = "checkbox";
//            checkbox.value ="" +calendar.start+" "+ calendar.end+" "+calendar.location;
//            var span=document.createElement('span');
//            $(span)[0].innerHTML = calendar.calendarName;
//            var span2=document.createElement('span');
//            $(span2)[0].innerHTML = calendar.location;
//            p.appendChild(span);
//            p.appendChild(checkbox);
//            p.appendChild(span2);
//            p.innerHTML += calendar.location + "</br>";
//        }
//
//        selectCalendarsDiv.appendChild(p);
//        // There is no need to use dialog
//
//        $(selectCalendarsDiv).dialog({
//            autoOpen: false,
//            height: 400,
//            width: 650,
//            modal: true,
//            buttons: {
//                "Ok": function () {
//                    $(selectCalendarsDiv).dialog("close");
//                    $(selectCalendarsDiv).dialog("destroy").remove();
//                    $("#spinner").fadeIn();
//                    gmapHandler.getCurrentLocation(function(pos){
//
//                        gmapHandler.geocodeAddress(function(latlng1, address){
//                            $("#spinner").fadeOut();
//                            if(latlng1 != false){
//                                gmapHandler.addLocation(pos);
//                                gmapHandler.addLocation(latlng1);
//
//                            }
//                        },  calendar.location);
//
//
//                    });
//                },
//                "Schließen": function () {
//                    $(this).dialog("close");
//                    $(selectCalendarsDiv).dialog("destroy").remove();
//                }
//            }
//        });
//
////       var temp = {
////               html:'<p>These are the terms of use.  You should agree to these terms before proceeding.</p><p>(This is just an example)</p>',
////               buttons: { Cancel: false, Next: true },
////               focus: 1,
////               submit:function(e,v,m,f){
////                   if(v){
////                       e.preventDefault();
////                       $.prompt.goToState('state1');
////                       return false;
////                   }
////                   $.prompt.close();
////               }
////       };
////       $.prompt(temp);
//
//        $(selectCalendarsDiv).dialog("open");
//    },
//// FUNCTION TO DELETE EVENT
//    deleteEvent: function(calendarID,eventID) {
//        gapi.client.load('calendar', 'v3', function() {
//            var request = gapi.client.calendar.events.delete({
//                'calendarId': calendarID,
//                'eventId': eventID
//            });
//            request.execute(function(resp) {
//                if (typeof resp === 'undefined') {
//                    alert("Event was successfully removed from the calendar!");
//                }
//                else{
//                    alert('An error occurred, please try again later.')
//                }
//            });
//        });
//    },
//    // END DELETE EVENT FUNCTION
//
//    // FUNCTION TO INSERT EVENT
//    insertEvent:function(calendar,idate) {
//        //console.log(calendar);
//        var resource = {
//            "summary":"My Summary",
//            "location": "My Location",
//            "description": "My Description",
//            "start": {
//                "dateTime": idate.startTime// "2014/06/18"  //if not an all day event, "date" should be "dateTime" with a dateTime value formatted according to RFC 3339
//            },
//            "end": {
//                "dateTime": idate.endTime//"2014/06/18"  //if not an all day event, "date" should be "dateTime" with a dateTime value formatted according to RFC 3339
//            }
//        };
//        gapi.client.load('calendar', 'v3', function() {
//            var request = gapi.client.calendar.events.insert({
//                'calendarId': calendar.calendarId,
//                'resource': resource
//            });
//            request.execute(function(resp) {
//                //console.log(resp);
//                if (resp.id){
//                    alert("Event was successfully added to the calendar!");
//                }
//                else{
//                    alert("An error occurred. Please try again later.")
//                }
//
//            });
//        });
//    },
//
//    // END INSERT EVENT FUNCTION
//
//    // LIST AVAILABLE CALENDARS THAT HAVE WRITE ACCESS
//    listWritableCalendars:function() {
//        gapi.client.load('calendar', 'v3', function() {
//            var request = gapi.client.calendar.calendarList.list({
//                'minAccessRole': 'writer'
//            });
//            request.execute(function(resp) {
//
//            });
//        });
//    },
//    // END LIST CALENDARS FUNCTION
//
//    // QUERY EXISTING EVENTS FUNCTION
//    checkExists:function (calID){
//        gapi.client.load('calendar', 'v3', function() {
//            var request = gapi.client.calendar.events.list({
//                'calendarId': calID,
//                'q': "My query string" //set the query string variable
//            });
//            request.execute(function(resp) {
//                //console.log(resp);
//                if (resp.items){
//                    for (var i = 0; i < resp.items.length; i++) {
//                        //set event variables and list matching events
//                    }
//                }
//                else{
//                    alert("No matching events!");
//                }
//            });
//        });
//    },
//    // END QUERY EVENTS FUNCTION
//
//
//    //add new meeting to calendar
//
//    // add here two function
//    saveSelectedRouterToCalendar:function(routes) {
//
//
//    },
//    saveSelectedRouterToBackend:function(routes){
//
//    },
//
//    generateCalendarEvents_new: function(calendarIds,incomingDate) {
//        //console.warn("CREATED DATE->"+ incomingDate.startTime+" "+incomingDate.endTime);
//
//        //console.warn("CREATED DATE->"+ googleApiHandler.isoDate(incomingDate.startTime)+" "+googleApiHandler.isoDate(incomingDate.endTime));
//
//        for (var i = 0; i < calendarIds.length; i++) {
//            // console.warn("CALENDAR IDS-> " + calendarIds[i]);
//
//            var eventRequest = gapi.client.calendar.events.list({ "calendarId": calendarIds[i],
//                "singleEvents" : true,
//                "orderBy" : "startTime",
//                "timeMin": googleApiHandler.isoDate(incomingDate.startTime),     // GOOGLE TIME FORMAT: "timeMin": "2013-05-09T09:43:00+02:00"
//                "timeMax": googleApiHandler.isoDate(incomingDate.endTime)
//            });
//
//            eventRequest.execute(function (response) {
//                var events = response.items;
//                // console.warn("CALENDAR EVENT COUNT-> " + response.items.length);
//
//                if (response.items) {
//                    if(response.items.length>1) {
//
//                        for (var j = 0; j < response.items.length-1; j++) {
//                            var currentCalendarEvent = events[j];
//                            var nextCalendarEvent = events[j + 1];
//                            //var googleCalendarEvent = events[j];
//
//                            var calendarEvent = {};
//                            // calendarEvent.title = currentCalendarEvent.summary;
//                            calendarEvent.start = new Date(currentCalendarEvent.start.dateTime);
//                            calendarEvent.end = new Date(currentCalendarEvent.end.dateTime);
//                            calendarEvent.allDay = false;
//                            calendarEvent.location = currentCalendarEvent.location;
//
//                            var calendarEvent2 = {};
//                            //calendarEvent2.title = nextCalendarEvent.summary;
//                            calendarEvent2.start = new Date(nextCalendarEvent.start.dateTime);
//                            calendarEvent2.end = new Date(nextCalendarEvent.end.dateTime);
//                            calendarEvent2.allDay = false;
//                            calendarEvent2.location = nextCalendarEvent.location;
//
//                            // console.info("CALENDAR->" + calendarEvent.title+"location:"+calendarEvent.location+" start:"+ calendarEvent.start+" end:"+ calendarEvent.end);
//
//                            if (currentCalendarEvent.location!=="undefined" && nextCalendarEvent.location!=="undefined" ) {
//                                console.warn("CALENDAR location-> NULL" + calendarEvent.location+" "+nextCalendarEvent.location);
//                                calendarEvent.location = currentCalendarEvent.location;
//                                //calendarEvent.title += "\n" + currentCalendarEvent.summary;
//
//                                calendarEvent2.location = nextCalendarEvent.location;
//                                //calendarEvent2.title += "\n" + nextCalendarEvent.summary;
//
//                                gmapHandler.addTargetFromGoogleCalendar(calendarEvent.location,calendarEvent2.location, calendarEvent.end, "ab");
//
//                                // gmapHandler.addTargetFromGoogleCalendar(calendarEvent.location, calendarEvent.end, "ab", "startPoint");
//                                //gmapHandler.addTargetFromGoogleCalendar(calendarEvent2.location, null, "", "");
//
//                            } else {
//                                console.warn("CALENDAR location-> NULL" + calendarEvent.location);
//                            }
//
//                            //For not provided locations TODO: Later implement this
//                            if (calendarEvent.location != "undefined") {
//
//                            } else {
//
//                            }
//
//                        }
//                    }
//                }
//            });
//
//        }
//
//    },
//
//
//    openSelectCalendarsPlane:function(calendarList,date,callback){
//
//        var listParent=$("#calendarsFromGoogle2");
//
//        $('#calendarsFromGoogle2 li').remove();
//        for (var val in calendarList.items) {
//            var calendar = calendarList.items[val];
//            listParent.append("<li><input type='checkbox' value="+val+" name='googleCalendarTime2'> "+calendar.summary+"</li>");
//        }
//
//        $(".calendarAbbruch").click(function(){
//            $('#calendarsFromGoogle2 li').remove();
//        });
//
//        $("#calendarsFromGoogle2").show();
//
//        var calendarIds = [];
//        $("#calendarOKID2").unbind("click").click(function(){
//            //googleApiHandler.saveRoute();
//            console.warn("CALENDAR calendarOKID2 is called");
//            listParent.find("li").each(function () {
//                if ($(this).find("input").prop('checked')) {// INFO: check whether a checkbox is checked
//                    console.warn("CALENDAR: INPUT VALUE -> "+calendarList.items[$(this).find("input").val()].id);
//                    calendarIds.push(calendarList.items[$(this).find("input").val()].id); // get the value of inbox
//                }
//            });
////            console.warn("CALENDAR: INPUT VALUE -> "+calendarIds.length );
//            callback(calendarIds,date);
//            $("#myModal").modal('hide');
//
//        });
//        // console.info("calendar lenght: "+calendarList.length());
//
//    },
//    timeFilter:function(){
//        var id=$("div #calendarTime ul li input:checked").attr('id');
//        var start = new Date();//start.setHours(0,0,0,0);
//        var endDate = new Date();
//        endDate.setHours(23,59,59,999);
//        return {startTime:start,endTime:endDate};
//
//
//        if(id=="gcalendar_daily"){
//            var endDate = new Date();
//            endDate.setHours(23,59,59,999);
//            return {startTime:start,endTime:endDate};
//        }else if(id=="gcalendar_three_days"){
//            return {startTime:start,endTime: googleApiHandler.calculateDayWeek(start,3)};
//        }else if(id=="gcalendar_one_week"){
//            return {startTime:start,endTime: googleApiHandler.calculateDayWeek(start,7)};
//        }
//        /*else if(id=="gcalendar_month"){
//         var endDate=new Date();
//         if(start.getMonth()+1<11){
//         endDate.setMonth(start.getMonth()+1);
//         }else{
//         endDate.setYear(start.getYear()+1);
//         endDate.setMonth(1);
//         }
//         return {startTime:start,endTime:endDate};
//         }
//         */
//    },
//    calculateDayWeek:function(currentDate,increase){
//        var endDate=new Date();
//        var monthDay=30;
//        var dateDiff=currentDate.getDay()+increase;
//        if(dateDiff>monthDay ){ //TODO: this must be adapted with respect to month's days.
//            endDate.setMonth(currentDate.getMonth()+1);
//            dateDiff=dateDiff-monthDay;
//            endDate.setDate(dateDiff);
//            endDate.setHours(currentDate.getHours(),currentDate.getMinutes(),currentDate.getSeconds());
//        }else{
//            endDate.setDate(dateDiff);
//            endDate.setHours(currentDate.getHours(),currentDate.getMinutes(),currentDate.getSeconds());
//        }
//        return endDate;
//
//    },
//    //finding the accurate time
//    isoDate:function(msSinceEpoch) {
//        var d = new Date(msSinceEpoch);
//
//        d.setHours(d.getHours()+2);
//
//        return d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate() + 'T' +
//            d.getUTCHours()+ ':' + d.getUTCMinutes() + ':' + d.getUTCSeconds()+googleApiHandler.getOffsetFromUTC(msSinceEpoch);
//        //INFO: time zone info : http://www.donathan.com/dave/p0200.html
//    },
//    getOffsetFromUTC:function(date) {
//        var offset = date.getTimezoneOffset();
//        return ((offset < 0 ? '+' : '-')
//            + googleApiHandler.pad(Math.abs(offset / 60), 2)
//            + googleApiHandler.pad(Math.abs(offset % 60), 2))
//    },
//    pad:function(number, length, padChar) {
//        if (typeof length === 'undefined') length = 2;
//        if (typeof padChar === 'undefined') padChar = '0';
//        var str = "" + number;
//        while (str.length < length) {
//            str = padChar + str;
//        }
//        return str;
//    },
//
//    /************************************************************************************/
////                          OLD FUNCTIONS: THEY AREN'T USED ANYMORE
//    /************************************************************************************/
//
//    //build calendarEvents for FullCalender and render them
//    generateCalendarEvents: function (calendarIds,incomingDate) {
//
//        var date=new Date();
//        date.setYear(2013);
//        date.setMonth(0); // TODO: JS date -> month starts always from zero
//
//        var date2=new Date();
//        date2.setYear(2013);
//        date2.setMonth(0);
//        date2.setDate(30);
//
//        var today = new Date();
//
//        for (var i = 0; i < calendarIds.length; i++) {
//
//            var eventRequest = gapi.client.calendar.events.list({ "calendarId": calendarIds[i],
//                "singleEvents" : true,
//                "orderBy" : "startTime",
//                "timeMin": googleApiHandler.isoDate(date),     // GOOGLE TIME FORMAT: "timeMin": "2013-05-09T09:43:00+02:00"
//                "timeMax": googleApiHandler.isoDate(date2)
//            });
//            // GOOGLE SIMPLE REQUEST
////                var eventRequest = gapi.client.calendar.events.list({
////                     "calendarId": calendarIds[i]
////                });
//
//
//            eventRequest.execute(function (response) {
//
//                var events = response.items;
//                if (response.items) {
//                    // var fullCalendarDiv = $("#calendar");
//                    for (var j = 0; j < response.items.length; j++) {
//                        var googleCalendarEvent = events[j];
//                        var fullCalendarEvent = {};
//                        fullCalendarEvent.title = googleCalendarEvent.summary;
//
//                        fullCalendarEvent.start = new Date(googleCalendarEvent.start.dateTime);
//                        fullCalendarEvent.end = new Date(googleCalendarEvent.end.dateTime);
//                        fullCalendarEvent.allDay = false;
//
//                        if (googleCalendarEvent.location) {
//                            fullCalendarEvent.location = googleCalendarEvent.location;
//                            fullCalendarEvent.title += "\n" + googleCalendarEvent.location;
//                        }
//
//                        //  fullCalendarDiv.fullCalendar('renderEvent', fullCalendarEvent, true)
//
//                    }
//                }
//            });
//
//        }
//
//    },
//    //opens a dialog to select with wich calendars to synchronize and calls callback with calendarIds
//    openSelectCalendarsDialog: function (calendarList, callback) {
//
//        var selectCalendarsDiv = document.createElement("div");
//        var p = document.createElement("p");
//        for (var val in calendarList.items) {
//
//            var calendar = calendarList.items[val];
//
//            var checkbox = document.createElement("input");
//            checkbox.type = "checkbox";
//            checkbox.value = val;
//            p.appendChild(checkbox);
//            p.innerHTML += calendar.summary + "</br>";
//        }
//
//        selectCalendarsDiv.appendChild(p);
//        // There is no need to use dialog
//
//        $(selectCalendarsDiv).dialog({
//            autoOpen: false,
//            height: 400,
//            width: 650,
//            modal: true,
//            buttons: {
//                "Ok": function () {
//                    //uiHandler.destroyCalendar();
//                    // uiHandler.showCalendar();
//                    var calendarIds = [];
//                    $(p).children(":input").each(function () {
//
//                        if (this.checked) {
//                            calendarIds.push(calendarList.items[this.value].id);
//                        }
//                    });
//                    var sad = 0;
//                    callback(calendarIds);
//                    $(selectCalendarsDiv).dialog("close");
//                    $(selectCalendarsDiv).dialog("destroy").remove();
//
//                },
//                "Schließen": function () {
//                    $(this).dialog("close");
//                    $(selectCalendarsDiv).dialog("destroy").remove();
//                }
//            }
//        });
//
//        $(selectCalendarsDiv).dialog("open");
//
//    }
//    /************************************************************************************/
//};
//
