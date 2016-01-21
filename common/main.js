/*
* Main file covers all other js files
* @author: Cem Akpolat
* Documentation is formatted according to the JSDOC
* URL:http://usejsdoc.org/about-getting-started.html#getting-started
*/

$(function() {

    $("#loginPanel").show();
    $('#panel2').slidePanel({
        triggerName: '#trigger2',
        triggerTopPos: '20px',
        panelTopPos: '10px'
    });

    // start the communication between backend
    ajaxCommunicator.init(function(pref){
        console.debug("pref",pref);
        if(pref!=undefined && pref!=false) {
            createSwitchButtons(pref);
        }else {
            if (window.self === window.top) {
                createSwitchButtons(pref);
            }
        }
    });

    utils.init();                   // utility functions
    gmapHandler.init();             // start Google Map Components
    uiRoutePlanner.init();          // route planner ui functions
    travelGraph.boot();             // travel route, in other word, the route results page

    // DEBUG PARAMETERS
    ajaxCommunicator.defaults.debug=false;
    uiUtilities.defaults.debug=true;

    if(uiUtilities.xs()){
        $("#mapDiv").css("margin","0px");
        $("#mapDiv").css("height","300px");
    }else{
        $("#mapDiv").css("margin-top","20px");
        $("#mapDiv").css("height","450px");
    }
    // user data is loaded from session, once data is available
    ajaxCommunicator.getUserPreferencesFromSession(function(pref){
        if(pref!=undefined && pref!=false) {
           // console.debug("pref 1",pref);
            createSwitchButtons(pref);
//            ajaxCommunicator.getCurrentLocation(function(location){
//                setTimeout(function(){
//                    console.debug("My current Location", location);
//                },10000);
//            });
        }
    });

    // Navigation
    $('.navbar-collapse').click('li', function() {
        $('.navbar-collapse').collapse('hide');
    });
    $('#rp-header-button').click( function() {
        var className=$('.navbar-collapse').attr('class');
        if(contain(className,"collapse in")){
            $('.navbar-collapse').slideDown("slow");
        }else{
            $('.navbar-collapse').slideUp("slow");
        }
    });

    $('.navbar-collapse-1').click('li', function() {
        $('.navbar-collapse-1').collapse('hide');
    });
    $('#rv-header-btn').click( function() {
        var className=$('.navbar-collapse-1').attr('class');
        if(contain(className,"collapse in")){
            $('.navbar-collapse-1').slideDown("slow");
        }else{
            $('.navbar-collapse-1').slideUp("slow");
        }
    });
    function contain(text,word){
        if(text.indexOf(word) > -1){return true};
        return false;
    }

});//endof $(document).ready

function createSwitchButtonsFromIRA(modalities){
    var pref={opnv:false,ownCar:false,ownBike:false,nextBike:false,callABike:false,
        car2Go:false,flinkster:false,multicity:false,taxi:false,gehmeiden:false,barfree:false};
    if(modalities.indexOf("PUBLIC_TRANSPORT") > -1){
        pref.opnv=true;
    }
    if(modalities.indexOf("OWN_CAR") > -1){
        pref.ownCar=true;
    }
    if(modalities.indexOf("CAR_SHARING") > -1){
        pref.car2Go=true;
    }
    if(modalities.indexOf("BIKE_SHARING") > -1){
        pref.callABike=true;
    }
    if(modalities.indexOf("OWN_BIKE") > -1){
        pref.ownBike=true;
    }
    if(modalities.indexOf("TAXI") > -1){
        pref.taxi=true;
    }
    if(modalities.indexOf("GEHMEIDEN") > -1){
        pref.gehmeiden=true;
    }
//    if(modalities.indexOf("BARFREE") > -1){
//        pref.barfree=true;
//    }
    createSwitchButtons(pref);
};

function createSwitchButtons(pref){
    //console.log("create Switch Buttons is called");
    if(pref!=false) {
        $("#tt_opvn").attr("checked", pref.opnv);
        if (pref.nextBike || pref.callABike) {
            $("#tt_bikeSharing").attr("checked", true);
        } else {
            $("#tt_bikeSharing").attr("checked", false);
        }
        if (pref.car2Go || pref.flinkster || pref.driveNow || pref.multicity) {
            $("#tt_carSharing").attr("checked", true);
        } else {
            $("#tt_carSharing").attr("checked", false);
        }
        $("#tt_ownCar").attr("checked", pref.ownCar);
        $("#tt_ownBike").attr("checked", pref.ownBike);

        $( "#tt_taxi").attr( "checked", pref.betterTaxi );
        if(pref.gehmeiden!=undefined) $( "#tt_gehmeiden").attr( "checked", pref.gehmeiden );
        //if(pref.barfree!=undefined) $( "#tt_barfrei").attr( "checked", pref.barfree );

    }else{//default
        $("#tt_opvn").attr("checked", false);
        $("#tt_bikeSharing").attr("checked", false);
        $("#tt_bikeSharing").attr("checked", false);
        $("#tt_carSharing").attr("checked", false);
        $("#tt_carSharing").attr("checked", false);
        $("#tt_ownCar").attr("checked", false);
        $("#tt_ownBike").attr("checked", false);
        $( "#tt_taxi").attr( "checked", false );
        $( "#tt_gehmeiden").attr( "checked", false );
    }
    var options={
        width: 70,
        height: 40,
        button_width: 38,
        show_labels: false,
        btn_bg_class:'switch-button-background-1',
        btn_class:'switch-button-button-1',
        btn_icon:'icon-start',
        btn_icon_color_active:'#0088CC',
        btn_icon_color_non_active:'gray',
        btn_active_class:'btn-active',
        btn_non_active_class:'btn-nonactive'
    };

    options.btn_icon="icon-opvn";
    options.btn_icon_color_active="#9E8A33";
    $("input#tt_opvn").switchBtn(options);

    options.btn_icon="icon-car-sharing";
    options.btn_icon_color_active="#E29A34";
    $("input#tt_carSharing").switchBtn(options);

    options.btn_icon="icon-my-car";
    options.btn_icon_color_active="#E06F36";
    $("input#tt_ownCar").switchBtn(options);

    options.btn_icon="icon-bicycle";
    options.btn_icon_color_active="#CC5E50";
    $("input#tt_ownBike").switchBtn(options);

    options.btn_icon="icon-bike-sharing";
    options.btn_icon_color_active="#C4486B";
    $("input#tt_bikeSharing").switchBtn(options);

    options.btn_icon="icon-taxi";
    options.btn_icon_color_active="#4C9794";
    $("input#tt_taxi").switchBtn(options);

    // For gehen meiden
    options.btn_bg_active_class="bg-active-1";
    options.btn_class="switch-button-button-1";
    options.btn_icon="icon-walk-disabled";
    options.btn_icon_color_active="#F2662F";
    options.btn_active_class='btn-active-1';
    options.label_on_class='switch-button-label-on-1';
    options.label_off_class='switch-button-label-off-1';
    $("input#tt_gehmeiden").switchBtn(options);
    // for  barrierless
//
//    options.btn_bg_active_class="bg-active-2";
//    options.btn_class="switch-button-button-1";
//    options.btn_icon="icon-barrier-free";
//    options.btn_icon_color_active="#A1B744";
//    options.btn_active_class='btn-active-2';
//    options.label_on_class='switch-button-label-on-2';
//    options.label_off_class='switch-button-label-off-2';
//    $("input#tt_barfrei").switchBtn(options);
}

//function testRoutePlaner(){
//
//    // First iteration
//    setTimeout(function(){
//            ajaxCommunicator.automaticallyLoginForTestCase(function (userData) {
//            if (userData != undefined && userData != false) {
//                // add two specific routes
//                gmapHandler.addRoute({lat:52.516221, lng:13.312168}, {lat: 52.505146, lng: 13.359032});
//                // calculates the routes
//                window.setTimeout(function(){ $("#rpCalculateRoutes").click();},4000);
//                // wait for the results
//                console.debug("New test will be started in 5 minutes");
//                // return to the route-planer page
//                window.setTimeout(function(){ $(".returnToRoutePlanner").unbind().click();},100000);
//            }
//        });
//    }, 5000);
//    // And then start the feature measurements
//    var timeInterval=4*60000;
//    window.setInterval(function() {
//        console.debug("Test is called!");
//        //window.setTimeout(function(){
//            ajaxCommunicator.automaticallyLoginForTestCase(function (userData) {
//                if (userData != undefined && userData != false) {
//                    // add two specific routes
//                    //gmapHandler.addRoute({lat:52.516221, lng:13.312168}, {lat: 52.497205, lng: 13.364525});
//                    gmapHandler.addRoute({lat:52.516221, lng:13.312168}, {lat: 52.505146, lng: 13.359032});
//                    // calculates the routes
//                    window.setTimeout(function(){ $("#rpCalculateRoutes").click();},4000);
//                    // wait for the results
//                    console.debug("New test will be started in 5 minutes");
//                    // return to the route-planer page
//                    window.setTimeout(function(){ $(".returnToRoutePlanner").unbind().click();},100000);
//                }
//           });
//    },timeInterval);
//
//}