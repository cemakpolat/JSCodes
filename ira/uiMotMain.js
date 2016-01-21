
/**
 *
 *
 *@namespace
 * @author Cem Akpolat
 */
/*
 This variable is defined global, we want to hide map first by setting display to none.
 in order to show it again, then resize has to be called!
 */

var motMap = null;
//console.log("uiMotMain.js is called");
function initialize1() {
    var map_canvas = document.getElementById('mot-map_canvas');
    var map_options = {
        zoom : 14,
        center : new google.maps.LatLng(52.5122315, 13.3271348000000),
        mapTypeId: google.maps.MapTypeId.ROADMAP
//        scrollwheel:false
    };
    motMap = new google.maps.Map(map_canvas, map_options);
}
google.maps.event.addDomListener(window, 'load', initialize1);


uiMotMain={
    defaults:{
        simulationMode:false,
        debug:false
    },
    selectedPlanningID:null,
    selectedPlanningOrder:1,
    prepareSimulationPanel:function(){


        // Sim Panel hover effect for the panel
        $("#sim-trigger").hover(function(){
            $(this).stop()
                .animate({
                    width: '50px',
                    right: '0px'
                }, 200)
                .css({ 'z-index' : '100' });
        }, function () {
            $(this).stop()
                .animate({
                    width: '30px',
                    right: '0px'
                }, 200)
                .css({'z-index' : '100'});
        });

        $('#sim-panel').slidePanel({
            triggerName: '#sim-trigger',
            triggerTopPos: '70px',
            panelTopPos: '50px'
        });
        // End of Sim Panel

        var activateSimMode = $("#b_activeteSim");
        activateSimMode.button();
        activateSimMode.click(function(){
            $(".mot-header").switchClass("mot-header-gradian","mot-header-gradian-sim");
            $(".deactive-sim").hide();
            $(".active-sim").show();
            uiMotMain.defaults.simulationMode=true;
        });
        var deactivateSimMode = $("#b_deactiveteSim");
        deactivateSimMode.button();
        deactivateSimMode.click(function(){
            $(".mot-header").switchClass("mot-header-gradian-sim","mot-header-gradian");
            $(".deactive-sim").show();
            $(".active-sim").hide();
            $('#mot-container-routes').show();
            $('#mot-container-ira').hide();
            uiIraSimulation.stopUpdateIRA();
            uiMotMain.defaults.simulationMode=false;
        });


        var startSimBtn = $("#b_startSim");
        startSimBtn.button();
        startSimBtn.click(function(){
//            uiIraSimulation.startIRA(this.selectedPlanningID,this.selectedPlanningOrder);
            ajaxCommunicator.startSimulation(uiIraSimulation.defaults._selectedPlanningId);
        });


        var resumeSimBtn = $("#b_resumeSim");
        resumeSimBtn.button();
        resumeSimBtn.click(function(){
            $("#b_pauseSim").show();
            $(this).hide();
            ajaxCommunicator.resumeSimIra(uiIraSimulation.defaults._selectedPlanningId,function(){
                uiIraSimulation.startUpdateIRA();
            });

        });
        var restartSimBtn = $("#b_restartSim");
        restartSimBtn.button();
        restartSimBtn.click(function(){
            ajaxCommunicator.restartSimIra(uiIraSimulation.defaults._selectedPlanningId,function(){
                uiIraSimulation.restartSameRoute();
            });
        });

        var pauseSimBtn = $("#b_pauseSim");
        pauseSimBtn.button();
        pauseSimBtn.click(function(){
            $("#b_resumeSim").show();
            $(this).hide();
            ajaxCommunicator.pauseSimIra(uiIraSimulation.defaults._selectedPlanningId,function(){
                uiIraSimulation.stopUpdateIRA();
            });

        });
        $(document).on('click', '.number-spinner button', function () {
            var btn = $(this),
                oldValue=$("#simTimeParameter").text().trim();
                var newVal = 0;
            if (btn.attr('data-dir') == 'up') {
                newVal = parseInt(oldValue) + 1;
            } else {
                if (oldValue > 1) {
                    newVal = parseInt(oldValue) - 1;
                } else {
                    newVal = 1;
                }
            }
//            btn.closest('.number-spinner').find('span').text(newVal);
            $("#simTimeParameter").html(newVal);
            uiIraSimulation.defaults._updateDuration=newVal*1000;
            //console.log("New Simulation Update Duration ->"+uiIraSimulation.defaults._updateDuration);
        });

    },

    start:function(){

        $("#loginPanel").show();
        $('#panel2').slidePanel({
            triggerName: '#trigger2',
            triggerTopPos: '20px',
            panelTopPos: '10px'
        });
        this.prepareSimulationPanel();
        $('#mot-container-ira').hide();
        $('#return-to-routes').hide();

        if (utils.get_url_param("user") != "" || utils.get_url_param("email") != "") { // TODO: After removing the
            ajaxCommunicator.automaticallyLogin(function(userPref){
                console.debug("Automatically-Login Function is called",userPref);
                if(userPref!=undefined && userPref!=false) {
                    runMot(userPref);
                }
            });
        }else{
            ajaxCommunicator.init();
            ajaxCommunicator.getUserPreferencesFromSession(function(userPref){
                if(userPref!=undefined && userPref!=false) {
                    runMot(userPref);
                }
            });

        }
        function runMot(userPref){
            if(userPref.gpsLocation!=null && userPref.gpsLocation!=false){
                // start corresponding user agent if not yet started
                ajaxCommunicator.checkAvailabilityOfUserAgent();

                ajaxCommunicator.getAllPlannings(function(data){
                    var parser=new NEWPARSER(data.data);
                    parser.setRatings(data.pratings);
                    parser.setRequests(data.prequests);
                    var tgData= parser.getTravelData();
                    drawRoutes.generateResults(tgData);
                    uiMotMain.init();
                });
            }else{
                uiUtilities.popupModal("GPS Lokation ist in dem Nutzerprofil deaktiviert, bitte aktivieren Sie unter dem Nutzerprofil!","IRA kann nicht benutzt werden!");
            }

        }

    },
    startDebug:function(){

        ajaxCommunicator.init();     // start the communication between backend
        utils.init();               // utility functions
        
        // start corresponding user agent if not yet started
        ajaxCommunicator.checkAvailabilityOfUserAgent();

        $("#loginPanel").show();
        $('#panel2').slidePanel({
            triggerName: '#trigger2',
            triggerTopPos: '20px',
            panelTopPos: '10px'
        });
        this.prepareSimulationPanel();

        $('#mot-container-ira').hide();
        $('#return-to-routes').hide();

        //var parser=new NEWPARSER(dummy4);
        var parser=new NEWPARSER(dummy4[0].data);
        parser.setRatings(dummy4[1]);
        var tgData= parser.getTravelDataForMotSlider();
        drawRoutes.generateResults(tgData);
        this.init();


    },
    startByCalendar:function(planningID){

        $("#loginPanel").show();
        $('#panel2').slidePanel({
            triggerName: '#trigger2',
            triggerTopPos: '20px',
            panelTopPos: '10px'
        });
        this.prepareSimulationPanel();
        $('#mot-container-ira').hide();
        $('#return-to-routes').hide();

        if (utils.get_url_param("user") != "" || utils.get_url_param("email") != "") {
            ajaxCommunicator.automaticallyLogin(function(userPref){
                console.debug("Automatically-Login Function is called",userPref);
                if(userPref!=undefined && userPref!=false) {
                    runMot(userPref);
                }
            });
        }else{
            ajaxCommunicator.init();
            ajaxCommunicator.getUserPreferencesFromSession(function(userPref){
                if(userPref!=undefined && userPref!=false) {
                    runMot(userPref);
                }
            });

        }
        function runMot(userPref) {
            // start corresponding user agent if not yet started
            ajaxCommunicator.checkAvailabilityOfUserAgent();
            ajaxCommunicator.getAllPlannings(function (data) {
                var relatedID = null;
                for (var i = 0; i < data.pratings.ratings.length; i++) {
                    console.log("PlanningId" + data.pratings.ratings[i].planningID + " the searched:" + planningID);
                    if (data.pratings.ratings[i].planningID == planningID) {
                        //console.log(" SAME PlanningId"+data.pratings.ratings[i].planningID+" the searched:"+ planningID);
                        relatedID = i;
                        i = data.pratings.ratings.length;
                    }
                }
                if (relatedID != null) {
                    var slot = data.data[relatedID];
                    var rate = data.pratings.ratings[relatedID];
                    var parser = new NEWPARSER(null);
                    parser.setRequests(data.prequests);
                    var tgData = parser.getTravelDataForCalendar(slot, rate);
                    drawRoutes.generateResults(tgData);
                    uiMotMain.init();
                }

            });
        }

        uiMotMain.init();

    },

    changeTitleToIRA:function(){
        $('#btn-replanning').show();
        $('#ira_header_title').hide();
        if(uiUtilities.xs()){
            $('#ira_inter_title_abbr').show();
        }else{
            $('#ira_inter_title').show();
        }
    },
    changeTitleToRouteLists:function(){
        //$('#ira_inter_title').hide();
        $('#btn-replanning').hide();
        $('#ira_header_title').show();
        if(uiUtilities.xs()){
            $('#ira_inter_title_abbr').hide();
        }else{
            $('#ira_inter_title').hide();
        }
    },
    gotoRoutePlaner:function(planningorder,pid,requestType){
        var slot=drawRoutes.getSelectedPlanning(planningorder);
        console.debug("slot",slot.request);
        var request=slot.request;
        var direction='Ab';

        var modalities='';

        for (var i=0;i<request.modalities.length;i++){
            modalities+=request.modalities[i].name+',';
        }
        var addresses='';
        for(var key in request) {
            if(request.hasOwnProperty(key)) {
                if(key.indexOf("address")>-1){
                    addresses+='&'+key+"="+request[key];
                }
            }
        }
        pid='&pid='+pid;
        direction='&direction='+direction
        modalities='&modalities='+modalities;
        var numberOfRequest='&numberOfRequest='+request.numberOfTargets;
        var when='&date='+request.startDate;

        if(requestType=="edit"){
            window.location.href=window.location.href.split('?')[0]+'?edit=yes'+numberOfRequest+addresses+when+direction+modalities+pid;
        }else if(requestType=="routeRequest"){
            window.location.href=window.location.href.split('?')[0]+'?routeRequest=yes'+numberOfRequest+addresses+when+direction;
        }

    },
    init:function(){

        $(".address-bar").on("click",function(){
            //alert("called");
            var effected=$(this).next().next();
            var res=$(effected).is(':visible');

            if(res==true){
                $(effected)
                    .css('opacity', 1)
                    .slideUp('normal')
                    .animate(
                    { opacity: 0 },
                    { queue: false, duration: 'normal' }
                );
            }
            else{
                $(effected)
                    .css('opacity', 0)
                    .slideDown('normal')
                    .animate(
                    { opacity: 1 },
                    { queue: false, duration: 'normal' }
                );
            }
        });

        $("#return-to-routes").click(function(){
            $('#mot-container-ira').hide();
            $('#mot-container-routes').show();
            $('#return-to-routes').hide();
            uiMotMain.changeTitleToRouteLists();
            $(".travelSlider").remove();
            drawRoutes.removeLoadingSlotForNewPlanningRequests();
        });

        $('.btn-edit').on("click",function(){
            //get selected route id
            // remove edit ? how
            console.log("PlanningID:"+$(this).parent().parent().parent().attr('planningid')+" PlanningOrder:"+$(this).parent().parent().parent().attr('planningorder'));
            var planningorder=$(this).parent().parent().parent().attr('planningorder');
            var pid=$(this).parent().parent().parent().attr('planningid');
            uiMotMain.gotoRoutePlaner(planningorder,pid,"edit");

        });

        $('.btn-delete').on("click",function(){
            var pid=$(this).parent().parent().parent().attr('planningid');
            var $this = $(this);
            ajaxCommunicator.removePlanning(pid,function(result){
                if(result==true) {
                    $this.parent().parent().parent().remove();
                }
            });
        });

        $('.btn-pushMessage').on("click",function(){
        	var pid=$(this).parent().parent().parent().attr('planningid');
        	ajaxCommunicator.activatePushMonitoring(pid);
        });

        $('.btn-ira-start').on("click",function(){

            var planningId=$(this).parent().parent().parent().attr('planningid');
            var planningOrder=$(this).parent().parent().parent().attr('planningorder');

            // find here generic way
            var slot=drawRoutes.getSelectedPlanning(planningOrder);
            var when=slot.segments[0].items[0].startdate;
            var currentTime= new Date(when)-new Date();
            //console.log("Current Time Diff:"+currentTime);
            var time_is_over=false;
            var time_is_early=true;
            var time_is_on=false;

//            if(currentTime>0 || currentTime==0){
//               time_is_early=true;
//            }
////            if(currentTime==0) {
////                time_is_on=true;
////            }
//            else {
//                time_is_over=true;
//            }
//            if(time_is_over){
//                uiMotMain.gotoRoutePlaner(planningOrder,"routeRequest");
//            }
//////          else if(time_is_early){
//////                uiUtilities.popupModal("IRA Message","There is still time to the next travel!");
//////          }
//            else if(time_is_on ||time_is_early){
                $(this).closest('.mot-container-routes').attr("container-id") // get container id
                $('#mot-container-routes').hide();
                $('#mot-container-ira').show();
                uiMotMain.changeTitleToIRA();

                // this required for refreshing the map, without this the map canno
                google.maps.event.trigger(motMap, 'resize');
                
                ajaxCommunicator.activateForegroundMonitoring(planningId);

                if(uiMotMain.defaults.debug){
                    if (!uiMotMain.defaults.simulationMode) {
                        uiIraDebug.startIRA(planningId,planningOrder);
                    }else {
                        uiIraSimulationDebug.startIRA(planningId,planningOrder);
                    }
                }else {
                    if (!uiMotMain.defaults.simulationMode) {
                        uiIra.startIRA(planningId, planningOrder);
                    } else {
                        uiIraSimulation.startIRA(planningId, planningOrder);
                    }
                }
//            }
        });
        $('.mot-rater').jRater({
            imagePath: appContext + '/images/resultview/'
        });

        //HELPER FUNCTION
        function contain(text,word){
            if(text.indexOf(word) > -1){return true};
            return false;
        }
        // Navigation
        $('.navbar-collapse').click('li', function() {
            $('.navbar-collapse').collapse('hide');
        });
        $('#rp-mot-header-btn').click( function() {
            var className=$('.navbar-collapse').attr('class');
            if(contain(className,"collapse in")){
                $('.navbar-collapse').slideDown("slow");
            }else{
                $('.navbar-collapse').slideUp("slow");
            }
        });


    }
};
$(document).ready(function(){

    uiMotMain.defaults.debug=false;
    ajaxCommunicator.defaults.debug=true;
    uiMotMain.defaults.simulationMode=false;

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" :
            decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    if(uiMotMain.defaults.debug){
        BackendImitator.init(dummy4,dummy4,dummy4);
        uiMotMain.startDebug();
    }else{
        //uiMotMain.defaults.simulationMode=true;
        var id=null;
        id=getParameterByName("id");


        if(id!="" && id!=null){
            uiMotMain.startByCalendar(id);
        }else{
            uiMotMain.start();
        }

    }

});
