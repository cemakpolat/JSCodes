
// this is a global listener to hide/remove context menus
$('html').click(function() {
    gmapHandler.removeMenus();
    $(".calendarClickMenu").each(function(){
        this.parentNode.removeChild(this);
    })
});

//var activeRoute = new activeRouteObject();
//

//
var language = "de";


//
// autologin if parameters are set in the url
//var startEmail = utils.get_url_param("user");
//var startPassword = utils.get_url_param("password");
//var startToken = utils.get_url_param("token");
////
//if (startEmail != ""){
//    // do not logout when a token is passed, as this would render the token useless
//    console.log("LOGIN IS CALLED");
////    ajaxCommunicator.login(startEmail, startPassword, startToken);
//    ajaxCommunicator.loginCallback(startEmail,startPassword, startToken,function(res){
//        if(res){
//            $("#loggedInDivUser").empty().append(startEmail);
//            $("#loginDiv").hide();
//            $("#loggedInDiv").show();
//            $("#ul_HeaderMenu").show();
//        }else{
//            console.log("res: "+res);
//        }
//    });
//
//}
//



/**
 * Utilities for the User Interface (UI)
 * @type {{default: {debug: boolean, debugLevel: number}, init: init, popupModal: popupModal, debug: debug, debug: debug, scrollToElement: scrollToElement, xs: xs, sm: sm, md: md, lg: lg}}
 * @author Cem Akpolat
 */
var uiUtilities={
    defaults:{
        debug:true,
        debugLevel:1 /* Debug level can be used for detailing the debug information, the bigger number the more detail */
    },
    /**
     *
     */
    init:function(){},
    /**
     *
     * @param message
     * @param title
     * @param footer
     */
    popupModal:function(message,title,footer){
        $("#myModal").find('.modal-body').removeData().html(message);
        $("#myModal").find('.modal-title').removeData().html(title);

        var basicFooter='<button type="button" class="btn btn-default" data-dismiss="modal">Fenster schließen</button>';
        footer = typeof(footer) != 'undefined' ? footer : basicFooter;
        $("#myModal").find('.modal-footer').removeData().html(footer);
        $("#myModal").modal('show');
    },
    /**
    *
    * @param message
    * @param title
    * @param footer
    */
   popupTimeout:function(message,title,footer){
	   // Set a timeout to hide the element again
       setTimeout(function() { $('#myModal').modal('hide'); }, 4000);
       uiUtilities.popupModal(message,title,footer);
   },
    /**
     *
     * @param message
     */
    debug:function(message){
        //if(uiUtilities.defaults.debug){
            console.log(message);
        //}
    },
    /**
     *
     * @param message
     * @param level
     */
    debug:function(message,level){
        if(this.defaults.debugLevel===level && uiUtilities.defaults.debug){
            console.log(message);
        }
    },
    /**
     *
     * @param selector
     * @param time
     * @param verticalOffset
     */
    scrollToElement: function (selector, time, verticalOffset) {
        time = typeof(time) != 'undefined' ? time : 1000;
        verticalOffset = typeof(verticalOffset) != 'undefined' ? verticalOffset : 0;
        element = $(selector);
        offset = element.offset();
        offsetTop = offset.top + verticalOffset;
        $('html, body').animate({
            scrollTop: offsetTop
        }, time);
    },
    /**
     *
     * @returns {boolean}
     */
    xs:function() {
        return $("#media-width-detection-element").css("width") === "0px";
    },
    /**
     *
     * @returns {boolean}
     */
    sm:function() {
        return $("#media-width-detection-element").css("width") === "768px";
    },
    /**
     *
     * @returns {boolean}
     */
    md:function() {
        return $("#media-width-detection-element").css("width") === "992px";
    },
    /**
     *
     * @returns {boolean}
     */
    lg:function() {
        return $("#media-width-detection-element").css("width") === "1200px";
    },
    /**
     * TODO: raise action after obtaining the endresize, this function will be used later
     */
    endresize:function(){
        var rtime = new Date(1, 1, 2000, 12,00,00);
        var timeout = false;
        var delta = 200;
        $(window).resize(function() {
            rtime = new Date();
            if (timeout === false) {
                timeout = true;
                setTimeout(resizeend, delta);
            }
        });

        function resizeend() {
            if (new Date() - rtime < delta) {
                setTimeout(resizeend, delta);
            } else {
                timeout = false;
                alert('Done resizing');
            }
        }
    }
};

/**
 * Represents the user preferences object that covers all parameters related the users.
 * @constructor
 * @author Cem Akpolat
 */

// The following
var xsDrawn=false;
var smDrawn=false;
// Once the request from IRA here to find a new routes possibilities, requestFromIRAEnabled is set to true, thus the generation of the routes on the route planer site will be
//skipped thereby the crash possibility of the google map would be prevented.
var requestFromIRAEnabled=false;

//uiRoutePlanner.xsDrawn=false;
//uiRoutePlanner.smDrawn=false;
var uiRoutePlanner={
    /**
     *
     */
    defaults:{
        iraRequest:false,
       /*Calendar defaults*/
       dtimepickerCounter:1, /*While generating new date- and timepickers, a stable number should be used, since each route has its own*/
       timeOptions:{
            language:  'de', // you have to add also lanuage from the library as js file.
            format: 'hh:ii',
            weekStart: 1,
            todayBtn: 0,
            autoclose: 1,
            todayHighlight: 0,
            startView: 1,
            minView: 0,
            maxView: 1,
            forceParse: 0
        },
         dateOptions:{
            language:  'de',
            format: 'dd-mm',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            minView: 2,
            forceParse: 0
        }
    },
    /**
     *TODO: Change the name of function
     */

    urlCall:function(){

        var edit=utils.get_url_param_decode("edit");
        var routeRequest=utils.get_url_param_decode("routeRequest");
        var numberOfRequest=utils.get_url_param_decode("numberOfRequest");
        var addresses=[];
        for(var i=0;i<numberOfRequest;i++){
            addresses.push(utils.get_url_param_decode("address"+i));
        }

        var time=utils.get_url_param_decode("time");
        var direction=utils.get_url_param_decode("direction");
        var modalities=utils.get_url_param_decode("modalities");
        // Edit
//        if(from&& to&& time&& direction){
            if(edit.toLowerCase().indexOf("yes") >= 0){
                //console.log("EDIT FROM IRA");
                createSwitchButtonsFromIRA(modalities);
                for(var i=0;i<numberOfRequest-1;i++){
                    gmapHandler.addTargetFromGoogleCalendar(addresses[i],addresses[i+1],new Date(),direction);
                }
            }else if(routeRequest.indexOf("yes") > -1){
                //console.log("REQUEST FROM IRA");
                //IRA, saved route time is over, therefore new route results should be obtained

                for(var i=0;i<numberOfRequest-1;i++){
                    gmapHandler.addTargetFromIRA(addresses[i],addresses[i+1],new Date(),direction);
                }
                uiRoutePlanner.defaults.iraRequest=true;
                requestFromIRAEnabled=true;
            }
//        }
    },
    init:function(){

        this.urlCall();

        /* add the calendars for the bar where you can insert address and time*/
        $('#timepicker1').datetimepicker(this.defaults.timeOptions).on('changeDate', function(ev){
                console.log(ev.date);
        });

        $('#datepicker1').datetimepicker(this.defaults.dateOptions).on('changeDate', function(ev){
            console.log(ev.date);
        });

//        $(".googleBtn").click(function(){
//            var title='<p class="text-center">'+"Bitte Zeit Eingeben "+'</p>';
//            var middleContent='<div class="row"><div class=" ">'+
//                '<div class="radio radio-info"><input  type="radio" name="googleCalendarTime" id="radio_daily" value="option1" checked><label for="radio_daily">Heute</label></div>'+
//                '<div class="radio radio-info"><input type="radio" name="googleCalendarTime" id="radio_weeks" value="option2"><label for="radio_weeks">in drei Tagen</label></div>'+
//                '<div class="radio radio-info"><input type="radio" name="googleCalendarTime" id="radio_twoweeks" value="option3"><label for="radio_twoweeks">eine Woche</label></div>'+
//                '</div>';
//            var footer='<button type="button" class="btn btn-default" data-dismiss="modal">Close</button><button  id="getCalendars" type="button" class="btn btn-primary">Next</button>';
//            uiUtilities.popupModal(middleContent,title,footer);
//
//            // This object first is created after the above code is executed
//            $("#getCalendars").on("click",function(){
//                googleApiHandler.handleSynchClick();
//                var title='<p class="text-center" style="display:block">'+"Wählen Sie bitte einen Kalendar"+'</p>';
//                var middleContent='<div class="row"><div class="middle"><div class="calendersProvided"><ul id="calendarsFromGoogle2" style="display:none"></ul></div></div></div>';
//                var footer='<button type="button" class="btn btn-default" data-dismiss="modal">Close</button><button id="calendarOKID2" type="button" class="btn btn-primary">OK</button>';
//                uiUtilities.popupModal(middleContent,title,footer);
//                //console.log("called ");
//                $( "#calendarPopup" ).hide();
//                // get results from google through ajax request...
//                $( "#calendarResults" ).slideToggle();
//            });
//        });

        /* invoke here for creating the mobilitiy plan*/
        $("#rpCalculateRoutes").click(function(){
            if (targetList.length > 1) {
                $("#rp-view").hide();
                $("#rv-view").show();
                ajaxCommunicator.createMobilityPlan(0);
            } else {
                uiUtilities.popupModal("Wählen Sie bitte den Startpunkt und Entpunkt aus!","Adresseingabe fehlt!");
            }

        });

        $("#btn_add_cur_pos").click(function(){
            $(this).removeClass('icon-cur-pos');
            $(this).button('loading');
            gmapHandler.addLocationByCPBtnForUP($("#startPlace"),$(this));
            //gmapHandler.addLocationByCPBtn($(this)); // This is for adding the root
        });

        $("#clearMapButton").live('click',function(){ // TODO: This isn't currently used
            gmapHandler.clear();            // Should be called after showing the routes
        });

        $("#addNewRouteButton").unbind().click(function(){
            uiRoutePlanner.addNewRoute(); // TODO Add here some control parameters, such as tooltip for the related issue.

        });

        $(window).resize(function() {
            if (uiUtilities.xs()) {
                if(!xsDrawn){
                    uiRoutePlanner.redrawTargets(targetList);
                    xsDrawn=true;
                    $("#mapDiv").css("margin-top","0px");
                    $("#mapDiv").css("height","300px");
                }
                smDrawn=false;
            }
            else{
                if(!smDrawn){
                    uiRoutePlanner.redrawTargets(targetList);
                    smDrawn=true;
                    $("#mapDiv").css("height","450px");
                    $("#mapDiv").css("margin-top","20px");
                }
                xsDrawn=false;
            }
        });

        // TODO: Check this function whether it disturbs the added routes
        $(".dropdown-menu li a").click(function () {
            $(this).parent().parent().parent().find(".btn").html($(this).text() + ' <span class="caret"></span>');
        });



    },

    /**
     *  Add the given two targets into the route planner page
     * @param target1
     * @param target2
     */
    addNewTargets:function(target1,target2){

        var timepicker1 = ++uiRoutePlanner.defaults.dtimepickerCounter;
        var datepicker1 = timepicker1;

        var table = '<table><tr>' +
            '<td><div class="positioner"><div class="added-route-icons rp-row-icon"><div>' + target1.targetNumber + '</div><div class="ima_iconfont">a</div></div></div></td>' +
            '<td class="fluid visible-xs"> <span class="text-left " >' + target1.address + '</span></td>' +
            '<td class="fluid vcenter visible-md visible-sm visible-lg"><span class="text-left " >' + target1.address + '</span></td>' +
            '</tr></table>';

        var div_1_Address = '<div class="col-xs-5 col-sm-12 moreinfo">' + table + '</div>';

        var divNext = '<div class="row">' +
            '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4" style="padding:0px">' +
            '<div class="positioner vcenter "><div class="added-route-icons rp-row-icon"> <div class="ima_iconfont">B</div></div></div>' +
            '<div class="positioner "> <input  readonly="readonly" class="input-sm vcenter rp-row-grad" style="border:none;padding:0px;" placeHolder="Time"id="' + "timepicker" + timepicker1 + '" type="text" size="4"/></div>' +
            '</div>' +
            '<div class="col-xs-6 col-sm-6 col-md-5 col-lg-5"  style="padding:0px"><div class="btn-group vcenter" style="float:left" >' +
            '<button type="button" style="background-color: transparent;border: none;"class="btn btn-default  btn-sm  dropdown-toggle" data-toggle="dropdown">' +
            target1.travelDirection + '<span class="caret"></span></button> ' +
            '<ul class="dropdown-travel-direction dropdown-menu" style="z-index:10001;"><li><a href="javascript:void(0);">Ab</a></li>' +
            '<li><a href="javascript:void(0);">An</a></li></ul></div>' +
            '<div style="float:left"><input  readonly="readonly" class="input-sm vcenter rp-row-grad" style="padding:0px;border:none;"  type="text" placeHolder="Date" id="' + "datepicker" + datepicker1 + '" size="4"/></div></div>' +
            '<div class="col-xs-2 col-sm-2 col-md-3 col-lg-3 "  style="padding:0px">' +
            '<div class="positioner " style="float:right;font-weight: bold;padding:2px 0px;"><div class="routeDeleteBtn" ></div></div></div>' +
            '</div>';

//        console.log("uiHandler addNewTargets 1 ->"+target1.travelDirection );

        var div_1_Detail = '<div class="col-xs-7 col-sm-6 visible-xs">' + divNext + '</div>';

        var smallDiv = '<div class="col-xs-12 col-sm-4 col-md-4 target " target-id="'+target1.targetNumber+'" style="border-bottom:1px solid #D2E6ED;padding:0px"><div class="row">' + div_1_Address + div_1_Detail + '</div></div>';

        var table2 = '<table><tr>' +
            '<td><div class="positioner"><div class="added-route-icons rp-row-icon"><div>' + target2.targetNumber + '</div><div class="ima_iconfont">b</div></div></div></td>' +
            '<td class="fluid visible-xs"> <span class="text-left " >' + target2.address+ '</span></td>' +
            '<td class="fluid vcenter visible-md visible-sm visible-lg"><span class="text-left " >' + target2.address + '</span></td>' +
            '</tr></table>';

        var timepicker2 = ++uiRoutePlanner.defaults.dtimepickerCounter;
        var datepicker2 = timepicker2;

        var div_2_Address = '<div class="col-xs-5 col-sm-6 moreinfo">' + table2 + '</div>';

        var divNext2 = '<div class="row">' +
            '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4" style="padding:0px">' +
            '<div class="positioner vcenter "><div class="added-route-icons rp-row-icon" style="padding-top: 8px"> <div class="ima_iconfont">B</div></div></div>' +
            '<div class="positioner "> <input  readonly="readonly" class="input-sm vcenter rp-row-grad" style="border:none;padding:0px;padding-top: 5px" placeHolder="Time" id="' + "timepicker" + timepicker2 + '" type="text" size="4"/></div>' +
            '</div>' +
            '<div class="col-xs-6 col-sm-6 col-md-5 col-lg-5"  style="padding:0px"><div class="btn-group vcenter" style="float:left;padding-top: 2px" >' +
            '<button type="button" style="background-color: transparent;border: none;"class="btn btn-default  btn-sm  dropdown-toggle" data-toggle="dropdown">' +
            target2.travelDirection+ '<span class="caret"></span></button> ' +
            '<ul class="dropdown-travel-direction dropdown-menu" style="z-index:10001;"><li><a href="javascript:void(0);">Ab</a></li>' +
            '<li><a href="javascript:void(0);">An</a></li></ul></div>' +
            '<div style="float:left"><input readonly="readonly" class="input-sm vcenter rp-row-grad" style="padding:0px;border:none;padding-top: 2px"  type="text" placeHolder="Date" id="' + "datepicker" + datepicker2 + '" size="4"/></div></div>' +
            '<div class="col-xs-2 col-sm-2 col-md-3 col-lg-3 "  style="padding:0px">' +
            '<div class="positioner " style="float:right;font-weight: bold;padding:2px 0px;display: block;"><div class="routeDeleteBtn" ></div></div></div>' +
            '</div>';

        var div_2_Detail = '<div class="col-xs-7 col-sm-6">' + divNext2 + '</div>';

        var bigDiv = '<div class="col-xs-12 col-sm-8 col-md-8 target " target-id="'+target2.targetNumber+'" style=" border-bottom:1px solid #D2E6ED; padding:0px"><div class="row">' + div_2_Address + div_2_Detail + '</div></div>';

        var all = '<div class="row rp-row-grad"   style="background-color: white; padding:0px">' + smallDiv + bigDiv + '</div>';

        $(all).appendTo("#addedRoutes");

        $("#timepicker" + timepicker1).datetimepicker(uiRoutePlanner.defaults.timeOptions).on('changeDate', function (ev) {
            var targetNumber=$(this).closest(".target").attr('target-id');
            var target=targetList[targetNumber-1];
            target=uiRoutePlanner.updateTime($(this).val(),target,"time");
            $("#datepicker" + datepicker1).datetimepicker('update', target.selectedTime);
        });
        $("#timepicker" + timepicker1).datetimepicker('update',new Date(target1.selectedTime));

        $("#datepicker" + datepicker1).datetimepicker(uiRoutePlanner.defaults.dateOptions).on('changeDate', function (ev) {
            var targetNumber=$(this).closest(".target").attr('target-id');
            var target=targetList[targetNumber-1];
            target=uiRoutePlanner.updateTime($(this).val(),target,"date");
            $("#timepicker" + timepicker1).datetimepicker('update', target.selectedTime);

        });
        $("#datepicker" + datepicker1).datetimepicker('update', new Date(target1.selectedDate));

        $("#timepicker" + timepicker2).datetimepicker(uiRoutePlanner.defaults.timeOptions).on('changeDate', function (ev) {


            if(uiUtilities.xs()){
                var targetNumber=$(this).closest(".target").attr('target-id');
                var target=targetList[targetNumber-1];
                target=uiRoutePlanner.updateTime($(this).val(),target,"date");
                $("#datepicker" + datepicker2).datetimepicker('update', target.selectedTime);

            }else{
                var res = $(this).parent().parent().next().children(".btn-group").children(".btn").html().split("<span");
                if(res[0]=="Ab"){
                    // assign the previous target
                    var targetNumber=$(this).closest(".target").attr('target-id');
                    var target=targetList[targetNumber-2];
                    target=uiRoutePlanner.updateTime($(this).val(),target,"time");
                    $("#datepicker" + datepicker2).datetimepicker('update', target.selectedTime);
                }else if(res[0]=="An"){
                    var targetNumber=$(this).closest(".target").attr('target-id');
                    var target=targetList[targetNumber-1];
                    target=uiRoutePlanner.updateTime($(this).val(),target,"time");

                    $("#datepicker" + datepicker2).datetimepicker('update', target.selectedTime);
                }
            }

        });
        $("#timepicker" + timepicker2).datetimepicker('update', new Date(target2.selectedTime));
        $("#datepicker" + datepicker2).datetimepicker(uiRoutePlanner.defaults.dateOptions).on('changeDate', function (ev) {

            if(uiUtilities.xs()){
                var targetNumber=$(this).closest(".target").attr('target-id');
                var target=targetList[targetNumber-1];
                target=uiRoutePlanner.updateTime($(this).val(),target,"date");
                $("#timepicker" + timepicker2).datetimepicker('update', target.selectedDate);
            }else{
                var res = $(this).parent().prev().children(".btn").html().split("<span");
                if(res[0]=="Ab"){
                    // assign the previous target
                    var targetNumber=$(this).closest(".target").attr('target-id');
                    var target=targetList[targetNumber-2];
                    target=uiRoutePlanner.updateTime($(this).val(),target,"date");
                    $("#timepicker" + timepicker2).datetimepicker('update', target.selectedDate);
                }else if(res[0]=="An"){
                    var targetNumber=$(this).closest(".target").attr('target-id');
                    var target=targetList[targetNumber-1];
                    target=uiRoutePlanner.updateTime($(this).val(),target,"date");
                    $("#timepicker" + timepicker2).datetimepicker('update', target.selectedDate);
                }
            }

        });
        $("#datepicker" + datepicker2).datetimepicker('update', new Date(target2.selectedDate));
        $(".routeDeleteBtn").unbind().click(function () {

            var targetNumber=$(this).closest(".target").attr('target-id');
            var index =targetList.getIndexByTargetNumber(targetNumber);
            var target=targetList[index];

            //console.log(" add routes is called");
                if(targetList.length==1){
                    targetList.removeTarget(targetList[0]);   //get the second td
                }
                else if(targetList.length==2){
                    targetList.length=0;
                    uiRoutePlanner.redrawTargets(targetList);
                    targetList.redrawMarkers();
                }else{
//                    console.log("Target nummber->"+index);
                    if(targetList.length%2==1 && index==targetList.length-1){
                        targetList.removeTarget(target);
                    }else{
//                        console.log("Target nummber->"+index);
                        targetList.removeTarget(target);   //get the second td
                        var previousTarget=targetList[index-1];
                        targetList.removeTarget(previousTarget);   //get the second td
                    }
                }

        });

        $(".dropdown-travel-direction li a").unbind().click(function () {
            /* Get the value of the selected element*/
            $(this).parent().parent().parent().find(".btn").html($(this).text() + ' <span class="caret"></span>');
            var res = $(this).parent().parent().parent().find(".btn").html().split("<span");
            var targetNumber=$(this).closest(".target").attr('target-id');
            //console.log("clicked->" + res[0]);
            //alert($(this).closest(".target").attr('target-id'));
            var target=targetList[targetNumber-1];
            target.travelDirection=res[0];

        });
        if(uiRoutePlanner.defaults.iraRequest==true){
            ajaxCommunicator.createMobilityPlan();
        }
        //rightclick standard menu disable
//        $(tr).bind("contextmenu", function(e) { //contextmenu isn't known for now
//            e.preventDefault();
//        });

    },
    updateTime:function(timeStr,target,goal){
        //console.log("incoming Time:"+timeStr);
        if(goal=="time"){
            var times=timeStr.split(":");
            var date =target.selectedDate;
            date.setHours(times[0]);
            date.setMinutes(times[1]);
            target.setSelectedTime(date);
            target.setSelectedDate(date);
        }else{
            var times=timeStr.split("-");
            var date =new Date(target.selectedTime);
            //console.log("current date:"+date);
            //console.log("current date:"+date.getFullYear()+" "+(date.getMonth()+1)+" "+date.getDate()+" "+date.getHours()+" :"+date.getMinutes());

            var act = new Date(date.getFullYear(), times[1]-1, times[0],date.getHours(),date.getMinutes());
            target.setSelectedTime(act);
            target.setSelectedDate(act);
        }
        //console.log("Selected Time:"+target.selectedTime);
        //console.log("Selected Date:"+target.selectedDate);
        return target;
    },
    /**
     * Insert a location (target) in the route planner website
     * @param target
     */
    addTarget:function(target) {

        var timepicker = ++uiRoutePlanner.defaults.dtimepickerCounter;
        var datepicker = timepicker;
        var icon="a";
        if(target.targetNumber>1){
            icon="b";
        }else{
            icon="a";
        }
        var table = '<table><tr>' +

            '<td style="width: 5%;"  class="visible-md visible-sm visible-lg "><div class="positioner"><div class="added-route-icons rp-row-icon "><div class="rp-row-icon">' + target.targetNumber + '</div><div class="ima_iconfont">a</div></div></div></td>' +
            '<td class="visible-xs" style="padding-left: 5px;" ><div class="positioner"><div class="added-route-icons rp-row-icon"><div>' + target.targetNumber + '</div><div class="ima_iconfont">'+icon+'</div></div></div></td>' +
            '<td class="fluid"> <span class="text-left " >' + target.address + '</span></td>' +
            '</tr></table>';

        var div_1_Address = '<div class="col-xs-5 col-sm-8 moreinfo" style="padding: 0px">' + table + '</div>';
        //console.log("uiHandler addTarget ->"+target.travelDirection );
        var divNext = '<div class="row">' +
            '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4" style="padding:0px">' +
            '<div class="positioner vcenter "><div class="added-route-icons rp-row-icon" style="padding-top: 8px"> <div class="ima_iconfont">B</div></div></div>' +
            '<div class="positioner " style="padding-top: 2px"> <input readonly="readonly" class="input-sm vcenter rp-row-grad" style="border:none;padding:0px; padding-top: 2px" placeHolder="Time"id="' + "timepicker" + timepicker + '" type="text" size="4"/></div>' +
            '</div>' +
            '<div class="col-xs-6 col-sm-6 col-md-5 col-lg-5"  style="padding:0px"><div class="btn-group vcenter" style="float:left;padding-top: 2px" >' +
            '<button type="button" style="background-color: transparent;border: none;"class="btn btn-default  btn-sm  dropdown-toggle" data-toggle="dropdown">' +
            target.travelDirection + '<span class="caret"></span></button> ' +
            '<ul class="dropdown-travel-direction dropdown-menu" style="z-index:10001;"><li><a href="javascript:void(0);">Ab</a></li>' +
            '<li><a href="javascript:void(0);">An</a></li></ul></div>' +
            '<div style="float:left;padding-top: 2px""><input readonly="readonly"  class="input-sm vcenter rp-row-grad" style="padding:0px;border:none;"  type="text" placeHolder="Date" id="' + "datepicker" + datepicker + '" size="4"/></div></div>' +
            '<div class="col-xs-2 col-sm-2 col-md-3 col-lg-3 "  style="padding:0px">' +
            '<div class="positioner " style="float:right;font-weight: bold;padding:2px 0px;"><div   class="routeDeleteBtn" ></div></div></div>' +
            '</div>';

        var div_1_Detail = '<div class="col-xs-7 col-sm-4" style="padding: 0px">' + divNext + '</div>';

        var smallDiv = '<div class="col-xs-12 col-sm-12 col-md-12 target" target-id="'+target.targetNumber+'" style="border-bottom:1px solid #D2E6ED; padding:0px"><div class="row">' + div_1_Address + div_1_Detail + '</div></div>';


        var all = '<div class="row rp-row-grad"   style="background-color: white;padding:0px">' + smallDiv + '</div>';

        $(all).appendTo("#addedRoutes");

        $("#timepicker" + timepicker).datetimepicker(uiRoutePlanner.defaults.timeOptions).on('changeDate', function (ev) {
            var targetNumber=$(this).closest(".target").attr('target-id');
            var target=targetList[targetNumber-1];
            target=uiRoutePlanner.updateTime($(this).val(),target,"time");
            $("#datepicker" + datepicker).datetimepicker('update', target.selectedTime);

        });
        $("#timepicker" + timepicker).datetimepicker('update', new Date(target.selectedTime));

        $("#datepicker" + datepicker).datetimepicker(uiRoutePlanner.defaults.dateOptions).on('changeDate', function (ev) {
            var targetNumber=$(this).closest(".target").attr('target-id');
            var target=targetList[targetNumber-1];
            target=uiRoutePlanner.updateTime($(this).val(),target,"date");
            $("#timepicker" + timepicker).datetimepicker('update', target.selectedTime);
        });
        $("#datepicker" + datepicker).datetimepicker('update', new Date(target.selectedDate));

        // TODO: Test here whether it works or not
        $(".routeDeleteBtn").unbind().click(function () {

            var targetNumber=$(this).closest(".target").attr('target-id');

            var index =targetList.getIndexByTargetNumber(targetNumber);
            //var index = $.inArray(tar,targetList);
            //console.log(" add target is called");
            if(uiUtilities.xs()) {

                if (targetList.length == 1) {
                    targetList.length = 0;
                    uiRoutePlanner.redrawTargets(targetList);
                    targetList.redrawMarkers();
                } else {
                    if (targetList[index].startPoint || index == 0) {

                        if (index == targetList.length - 1) {
                            targetList.removeTarget(targetList[index]);//get the first t
                        } else {
                            //console.log("target-id->start point" + index);
                            targetList.removeTarget(targetList[index]);
                            if (targetList.length > 1) { // TODO: Check again here
                                if ((typeof targetList[index + 1] !== undefined)) {
                                    if (targetList.compareTargets(targetList[index], targetList[index + 1])) {
                                        targetList.removeTarget(targetList[index]);
                                    }
                                }
                            }
                        }
                    }
                    else if (index == targetList.length - 1) {
                        targetList.removeTarget(targetList[index]);//get the first t
                        if (targetList.length > 2) {
                            if ((typeof targetList[index - 2] !== undefined)) {
                                if (targetList.compareTargets(targetList[index - 1], targetList[index - 2])) {
                                    targetList.removeTarget(targetList[index - 1]);
                                }
                            }
                        }
                    } else {
                        var currentTarget = targetList[index];
                        var possibleClone = targetList[index + 1];
                        targetList.removeTarget(targetList[index]);
                        if (targetList.length > 1 && (typeof possibleClone !== undefined)) {
                            if (targetList.compareTargets(currentTarget, possibleClone)) {
                                targetList.removeTarget(targetList[index]);
                            }
                        }
                    }

                }
            }else{
                var target=targetList[index];
                if(target.startPoint){
                    targetList.removeTarget(targetList[index]);//get the first t
                }else{
                    targetList.removeTarget(targetList[index]);//get the first t
                    targetList.removeTarget(targetList[index-1]);//get the first t
                }
            }


        });

        $(".dropdown-travel-direction li a").click(function () {
            /* Get the value of the selected element*/

            $(this).parent().parent().parent().find(".btn").html($(this).text() + ' <span class="caret"></span>');
            var res = $(this).parent().parent().parent().find(".btn").html().split("<span");
            var targetNumber=$(this).closest(".target").attr('target-id');
            //console.log("clicked->" + res[0]);
            //alert($(this).closest(".target").attr('target-id'));
            var target=targetList[targetNumber-1];
            target.travelDirection=res[0];
        });


    },
    /**
     * Add new route through the menu in the route planner
     */
    addNewRoute:function(){



        if( $("#endPlace").val()!="" &&  $("#startPlace").val()!="") {
            if (targetList.length == 1) {
                uiUtilities.popupModal("Fuehlen Sie bitte das nachste Ziel oder loeschen Sie den vorher hinzufuegte StartPunkt! ");
            } else {
                gmapHandler.geocodeAddress(function (latlng1, address) {
                    if (latlng1 != false) {
                        gmapHandler.geocodeAddress(function (latlng2, address) {
                            if (latlng2 != false) {
                                //$("#menubtn-dropdown").html($("#menubtn-dropdown").text() + ' <span class="caret"></span>');
                                var res = $("#menubtn-dropdown").html().split("<span");
                                var time2=$("#datepicker1").data("datetimepicker").getDate();
                                var time1=$("#timepicker1").data("datetimepicker").getDate();
                                var date = time2;
                                date.setMinutes(time1.getMinutes());
                                date.setHours(time1.getHours());
                                //console.log("Time:"+date.toString()+" direction");
                                //$("#datepicker" + datepicker1).datetimepicker('update', date);
                                // $("#datepicker" + datepicker1).data('datetimepicker').setDate(d);
                                gmapHandler.addRouteWithTime(latlng1,latlng2,date,$("#startPlace").val(),$("#endPlace").val(),res[0]);
                            }

                        }, $("#endPlace").val());
                    }
                }, $("#startPlace").val());
            }
        }else{
            uiUtilities.popupModal("Bitte füllen Sie die Start und Ziel Adresse volständig aus!");
        }

    },
    /**
     * Clean the previously typed texts in the input fields
     */
    cleanInputs:function(){
        $('#startPlace').val('');
        $('#endPlace').val('');
        $('#timepicker1').val('');
        $('#datepicker1').val('');
    },
    /**
     * Redraw the targetlist in order to apply the last change
     * @param targetList
     */
    redrawTargets:function(targetList){

        //clean routes
        $( "#addedRoutes").html('');

        if(!uiUtilities.xs()) {

            if (targetList.length==1) {
                var target1=targetList[0];
                target1.targetNumber = 1;
                uiRoutePlanner.addTarget(target1);
               // console.log("targetlist "+targetList.length+" ");
            } else {
                var rest = targetList.length % 2;
                for (var i = 0; i < targetList.length - (rest + 1); i++) {
                    var target1 = targetList[i];
                    var target2 = targetList[i + 1];
                    target1.targetNumber=i+1;
                    target2.targetNumber=i+2;
                    uiRoutePlanner.addNewTargets(target1, target2);
                    i++;
                    //console.log("targets-> "+target1.targetNumber+" "+target2.targetNumber);
                }
                if (rest == 1) {
                    var lastTarget = targetList[targetList.length - 1];
                    lastTarget.targetNumber=targetList.length;
                    uiRoutePlanner.addTarget(lastTarget);
                    //console.log("Last Target "+lastTarget.targetNumber);
                }
            }
        }else{
            //console.log("xs "+targetList.length+" ");
            var previousTarget=new Target();
            var targetNumber=1;
            for (var i = 0; i < targetList.length; i++) {
                var newTarget = targetList[i];
                if(!targetList.compareTargets(newTarget,previousTarget)){
                    newTarget.targetNumber =targetNumber;
                    uiRoutePlanner.addTarget(newTarget);
                    previousTarget=newTarget;
                    targetNumber++;
                }else{
                    newTarget.targetNumber=0;
                }
            }
        }
        targetList.redrawMarkers();
    }
};

//
//
var uiHandler = {

    registerPopup: function () {
        var registerDialog = document.createElement('div');
        registerDialog.id = "registerDialog";

        registerDialog.title = "Registration";

        var form = document.createElement('form');
        var fieldset = document.createElement('fieldset');


        // email
        var emailInput = document.createElement('input');
        emailInput.id = "registration_addressInputEmailInput";
        emailInput.setAttribute("type", "text");
        emailInput.setAttribute("size", "50");
        emailInput.style.display = "block";

        var emailLabel = document.createElement('label');
        emailLabel.innerHTML = js_registration_email + ":";
        emailLabel.setAttribute("for", emailInput.id);


        // userName
        var userNameInput = document.createElement('input');
        userNameInput.id = "registration_addressInputUserNameInput";
        userNameInput.setAttribute("type", "text");
        userNameInput.setAttribute("size", "50");
        userNameInput.style.display = "block";

        var userNameLabel = document.createElement('label');
        userNameLabel.innerHTML = js_registration_username + ":";
        userNameLabel.setAttribute("for", userNameInput.id);


        // password
        var passwordInput = document.createElement('input');
        passwordInput.id = "registration_addressInputPasswordInput";
        passwordInput.setAttribute("type", "text");
        passwordInput.setAttribute("size", "50");
        passwordInput.style.display = "block";

        var passwordLabel = document.createElement('label');
        passwordLabel.innerHTML = js_registration_password + ":";
        passwordLabel.setAttribute("for", passwordInput.id);

        // verification
        var verificationInput = document.createElement('input');
        verificationInput.id = "registration_addressInputVerificationInput";
        verificationInput.setAttribute("type", "text");
        verificationInput.setAttribute("size", "50");
        verificationInput.style.display = "block";

        var verificationLabel = document.createElement('label');
        verificationLabel.innerHTML = js_registration_verification + ":";
        verificationLabel.setAttribute("for", verificationInput.id);


        // divs
        var divEmail = document.createElement("div");
        divEmail.style.margin = "5px 0px 15px 0px";
        divEmail.appendChild(emailLabel);
        divEmail.appendChild(emailInput);

        var divUserName = document.createElement("div");
        divUserName.style.margin = "5px 0px 15px 0px";
        divUserName.appendChild(userNameLabel);
        divUserName.appendChild(userNameInput);

        var divPassword = document.createElement("div");
        divPassword.style.margin = "5px 0px 15px 0px";
        divPassword.appendChild(passwordLabel);
        divPassword.appendChild(passwordInput);

        var divVerification = document.createElement("div");
        divVerification.style.margin = "5px 0px 15px 0px";
        divVerification.appendChild(verificationLabel);
        divVerification.appendChild(verificationInput);

        form.appendChild(fieldset);
        fieldset.appendChild(divEmail);
        fieldset.appendChild(divUserName);
        fieldset.appendChild(divPassword);
        fieldset.appendChild(divVerification);

        registerDialog.appendChild(form);
        var html='<button type="button" id="registerUser" class="btn btn-default" >'+'Registration'+'</button>'+
            '<button type="button" id="verifyUser" class="btn btn-default" >'+'Verify Registration'+'</button>'+
        '<button type="button" id="closeRegistrationDialog"class="btn btn-primary" data-dismiss="modal">'+'Close'+'</button>';

        uiUtilities.popupModal(registerDialog,"User Registration",html);

        $("#registerUser").click(function(){
            //console.log("register request");
            ajaxCommunicator.register(emailInput.value, userNameInput.value, passwordInput.value);
        });
        $("#verifyUser").click(function(){
            //console.log("verfy request");
            ajaxCommunicator.verify(userNameInput.value, verificationInput.value);

        });

    }
};