
$(document).ready(function(){
    // debug parameter
    up.defaults.debug=true;
    upSlider.debug=false;

    if (utils.get_url_param("user") != "" || utils.get_url_param("email") != "") {
        ajaxCommunicator.automaticallyLogin(function(userPref){
//            console.debug("Automatically-Login Function is called",userPref);
            //if(userPref!=undefined && userPref!=false) {
                up.loadPreferences(userPref);
                upSlider.init(userPref);
                upSliderMaxBikeWay.init(userPref);
                upSliderMaxFootWay.init(userPref);
                upSliderAvgBikeSpeed.init(userPref);
           // }
        });
    }else{
        ajaxCommunicator.init();
        ajaxCommunicator.getUserPreferencesFromSession(function(userPref){
            //if(userPref!=undefined && userPref!=false) {
                up.loadPreferences(userPref);
                upSlider.init(userPref);
                upSliderMaxBikeWay.init(userPref);
                upSliderMaxFootWay.init(userPref);
                upSliderAvgBikeSpeed.init(userPref);
            //}
        });

    }

    $("#loginPanel").show();
    $('#panel2').slidePanel({
        triggerName: '#trigger2',
        triggerTopPos: '20px',
        panelTopPos: '10px'
    });
    $(".upcontainer").hide();
    $("#up-container-1").show();

    var activeContainer=function(){
        var id;
        var name;
        $('.upcontainer').each(function () {
            var state = $(this).attr('state');
            if(state=="active"){
                id=$(this).attr("id");
                name=$(this).attr("name");
            }else{
                // console.log("disactive "+$(this).attr("id"));
            }
        });
        var obj={
            id:id,
            name:name
        };
        return obj;
    };
    var showContainer=function(itemName){
        var id;
        $('.upcontainer').each(function () {
            var state = $(this).attr('state');
            if( utils.toUTF8(itemName).trim() == utils.toUTF8( $(this).attr("name")).trim()){
                $(this).attr("state","active");
                id=$(this).attr("id");
                $(this).show();
            }else{
                $(this).attr("state","disactive");
                //console.log("disactive "+$(this).attr("id"));
            }
        });
    };


    $(".c-link").click(function(){
        var activeObj=activeContainer();
        $('.upcontainer').hide();
        // look for the clicked item name at the containers, which one has the same name and disactivate them
        var clickedItemName=$(this).text();
        showContainer(clickedItemName);
        // assign its name to the up-section-name
        $("#up-section-name").text(clickedItemName);
        // replace the name of the selected item with the previous container name
        $(this).text(activeObj.name);
    });

    $('.navbar-collapse').click('li', function() {
        $('.navbar-collapse').collapse('hide');
    });
    $('#up-header-btn').click( function() {
        var className=$('.navbar-collapse').attr('class');
        if(contain(className,"collapse in")){
            $('.navbar-collapse').slideDown("slow");
        }else{
            $('.navbar-collapse').slideUp("slow");
        }
    });
    // adjusting the height of the slider
    $("#up-slider").css("height", $(window).height()-55+"px"); // TODO:Padding top change it
    $(".up-slider-wrapper").css("height", $(window).height()-55+"px");
    //HELPER FUNCTION
    function contain(text,word){
        if(text.indexOf(word) > -1){return true};
        return false;
    }
    gmapHandler.initForUserProfil();  // to enable finding the current location!
});

/**
 *
 *
 *@namespace
 * @author Cem Akpolat
 */
var up={
    defaults:{debug: true, vehicles:null,bikeCount:0,carCount:0},
    init:function(){
    },
    popupLoginMenu:function(){
        // either boostrap popup here or use another popup
        var html='<div class="row col-xs-12" style="z-index:2;margin:10px;">'+
            '<div class="col-xs-12">Benutzer:<input id="username"/></div>'+
            '<div class="col-xs-12">Kennwort:<input id="password"/></div>'+
            '</div>';
        this.popupModal(html," Membership Checking");
        var username=$("#username").val(); var password=$("#password").val();
        var res={username:username,password:password};
        return res;

    },
    popupModal:function(message,title,footer){
        $("#myModal").find('.modal-body').removeData().html(message);
        $("#myModal").find('.modal-title').removeData().html(title);

        var basicFooter='<button type="button" class="btn btn-default" data-dismiss="modal">Abbrechen</button>'+
            '<button type="button" class="btn btn-default" data-dismiss="modal">Authenticate</button>';
        footer = typeof(footer) != 'undefined' ? footer : basicFooter;
        $("#myModal").find('.modal-footer').removeData().html(footer);
        $("#myModal").modal('show');
    },
    popupModalAddVehicleCallback:function(callback){

        var basicFooter='<button id="btn_privacy_cancel_car" type="button" class="btn btn-default" data-dismiss="modal">Abbrechen</button>'+
            '<button id="btn_privacy_ok_car" type="button" class="btn btn-default" data-dismiss="modal">OK</button>';

        $("#myModal-addVehicle").find('.modal-footer').removeData().html(basicFooter);
        $("#myModal-addVehicle").modal('show');
        $("#btn_privacy_ok_car").click(function(){
            // check here
            function checkFields(){
                if($("#vehicle-Name").val() == ''){
                    console.debug("vehicle field is empty");
                    $("#vehicle-info").text('Bitte einen Name eintragen');
                    return false;
                }
                if($("#vehicle-position").val() == ''){
                    $("#vehicle-info").text('Bitte ein Position eintragen');
                    return false;
                }
                return true;
            };
            if(checkFields()){
                callback(true);
            }else{
                return false;
            }
        });
        $("#btn_privacy_cancel_car").click(function(){
            callback(false);
        });
    },
    popupModalAddBikeCallback:function(callback){

        var basicFooter='<button id="btn_privacy_cancel_bike" type="button" class="btn btn-default" data-dismiss="modal">Abbrechen</button>'+
            '<button id="btn_privacy_ok_bike" type="button" class="btn btn-default" data-dismiss="modal">OK</button>';

        $("#myModal-addBike").find('.modal-footer').removeData().html(basicFooter);
        $("#myModal-addBike").modal('show');
        $("#btn_privacy_ok_bike").click(function(){
            function checkFields(){
                if($("#bike-Name").val() == ''){
                    console.debug("vehicle field is empty");
                    $("#bike-info").text('Bitte einen Name ausfüllen');
                    return false;
                }
                if($("#bike-position").val() == ''){
                    $("#bike-info").text('Bitte ein Position eintragen');
                    return false;
                }
                return true;
            };
            if(checkFields()){
                callback(true);
            }else{
                return false;
            }
        });
        $("#btn_privacy_cancel_bike").click(function(){
            callback(false);
        });
    },
    popupModalPrivacy:function(message,title,footer){
        $("#myModal").find('.modal-body').removeData().html(message);
        $("#myModal").find('.modal-title').removeData().html(title);

        var basicFooter='<button type="button" class="btn btn-default" data-dismiss="modal">Abbrechen</button>';
        footer = typeof(footer) != 'undefined' ? footer : basicFooter;
        $("#myModal").find('.modal-footer').removeData().html(footer);
        $("#myModal").modal('show');
    },
    popupModalPrivacyCallback:function(message,title,callback){

        $("#myModal").find('.modal-body').removeData().html(message);
        $("#myModal").find('.modal-title').removeData().html(title);
        var basicFooter='<button id="btn_privacy_cancel" type="button" class="btn btn-default" data-dismiss="modal">Abbrechen</button>'+
            '<button id="btn_privacy_ok" type="button" class="btn btn-default" data-dismiss="modal">OK</button>';
        var footer = typeof(footer) != 'undefined' ? footer : basicFooter;
        $("#myModal").find('.modal-footer').removeData().html(footer);
        $("#myModal").modal('show');

        $("#btn_privacy_ok").click(function(){
            callback(true);
        });
        $("#btn_privacy_cancel").click(function(){
            callback(false);
        });

    },
    isThisVehicleIdDefined:function(possibleId){
        for(var i=0;i<up.vehicles.length;i++){
            if(possibleId.localeCompare(up.vehicles[i].vehicleId)==0){
                return true;
            }
        }
        return false;
    },
    getAccurateVehicleType:function(vehicle,type){
        if(vehicle=="car"){
            if(type=="combustion"){
                return "PKW-Verbrennerfahrzeug";
            }else{
                return "Elektrofahrzeug";
            }
        }else if(vehicle=="bike"){
            if(type=="electric"){
                return "Pedelec";
            }else{
                return "Standard Fahrrad";
            }
        }
    },
    addVehicleToOwnCars:function(vehicleId,motorType,isOwn,firstCreation){
        var isOwnIcon="glyphicon glyphicon-unchecked";

        if(up.carCount==0){
            isOwnIcon="glyphicon glyphicon-check";
        }else{
            if(isOwn=="true"){
                isOwnIcon="glyphicon glyphicon-check";
            }
        }
        if(firstCreation==undefined){
            up.carCount=up.carCount+1;
        }

        var html='<div class="row myOwnCar"  style="margin-bottom: 5px" >' +
            '<div class="col-xs-1 pull-left" style="padding: 0px" >' +
            '<div class="enableOwnCar" style="font-size: 32px;margin-top:20px">'+
            '<i class="'+isOwnIcon+'"></i>'+
            '</div>'+
            '</div>'+
            '<div class="col-xs-10 vehicle-info-block" style="padding: 0px">' +
            '<div   class="row " style="margin: 0px">' +
            '<p class="col-xs-1 "></p>  ' +
            '<p style="text-align: left; font-weight: bold;" class="col-xs-4 ">'+"Name"+'</p>' +
            '<p style="text-align: right" class="col-xs-6 ">'+vehicleId+'</p>' +
            '</div>' +
            '<div  class="row " style="margin: 0px">' +
            '<p class="col-xs-1 "></p>' +
            '<p style="text-align: left; font-weight: bold;" class="col-xs-4 ">'+"Motortyp"+'</p>' +
            '<p style="text-align: right" class="col-xs-6 ">'+motorType+'</p>'+
            '</div>' +
            '</div>'+
            '<div class="col-xs-1 pull-right" style="padding: 0px;margin-top:20px" >' +
            '<a href="#" class="col-xs-2 removeOwnCar" style="padding:5px 1px 0px 1px; ">' +
            '<i  class="icon-delete"></i>' +
            '</a>' +
            '</div>'+
            '</div>';

        $("#collapseOne").find('.panel-body').prepend(html);

        $(".removeOwnCar").on("click",function(){
            $this=$(this);
            event.preventDefault();
            up.popupModalPrivacyCallback("Möchten Sie Ihr Auto entfernen?","Auto entfernen",
                function(response){
                    if(response){
                        var vehicleId=$this.parent().parent().find('p').eq(2).html();
                        var motorType=$this.parent().parent().find('p').eq(5).html();
                        ajaxCommunicator.handleVehicle("removeVehicle","Car", vehicleId,motorType,"","",function(response){
                            if(response){
                                up.carCount=up.carCount-1;
                                $this.parent().parent().remove();
                                up.isThereAnyVehicle('car');
                                if($(".myOwnCar").length==1){
                                    motorType=$(".myOwnCar").children().eq(1).find('p').eq(5).html();
                                    vehicleId=$(".myOwnCar").children().eq(1).find('p').eq(2).html()
                                    ajaxCommunicator.handleVehicle("enableOwnCar","Car", vehicleId,motorType,"",true,function(response){
                                        if(response){
                                            $(".myOwnCar").children().eq(0).find(".glyphicon").removeClass('glyphicon-unchecked').addClass('glyphicon-check');
                                        }
                                    });
                                }
                            }
                        });
                    }

                });
        });
        $(".enableOwnCar").on("click",function(event){
            var $this=$(this);
            event.preventDefault();
            //console.debug("child",$(this).children());
            if($(this).children().hasClass('glyphicon glyphicon-unchecked')){
                var vehicleId=$this.parent().parent().find('p').eq(2).html();
                var motorType=$this.parent().parent().find('p').eq(5).html();
                ajaxCommunicator.handleVehicle("enableOwnCar","Car", vehicleId,motorType,"",true,function(response){
                    if(response){
                        $(".enableOwnCar i").removeClass('glyphicon-check').addClass('glyphicon-unchecked');
                        $this.children().removeClass('glyphicon-unchecked').addClass('glyphicon-check');
                    }
                });
            }
        });
        up.isThereAnyVehicle('car');
    },
    addBikeToOwnBikes:function(vehicleId,selectedBike,isOwn,firstCreation){

        var isOwnIcon="glyphicon glyphicon-unchecked";

        if(up.bikeCount==0){
            isOwnIcon="glyphicon glyphicon-check";
        }else{
            if(isOwn=="true"){
                isOwnIcon="glyphicon glyphicon-check";
            }
        }
        if(firstCreation==undefined){
            up.bikeCount=up.bikeCount+1;
            //console.debug("bike count",up.bikeCount);
        }
        var html='<div class="row myOwnBike"  style="margin-bottom: 5px" >'+
            '<div class="col-xs-1 pull-left" style="padding: 0px" >' +
            '<div class="enableOwnBike" style="font-size: 32px;margin-top:20px">'+
            '<i class="'+isOwnIcon+'"></i>'+
            '</div>'+
            '</div>'+
            '<div class=" col-xs-10  ">' +
            '<div  class="row" style="padding: 0px">' +
            '<p class="col-xs-1 "></p>  ' +
            '<p style="text-align: left; font-weight: bold;"  class="col-xs-4 ">'+"Name"+'</p>' +
            '<p style="text-align: right" class="col-xs-6 ">'+vehicleId+'</p>' +
            '</div>'+
            '<div  class="row" style="padding: 0px">' +
            '<p class="col-xs-1 "></p>  ' +
            '<p style="text-align: left; font-weight: bold;" class="col-xs-4 ">'+"Fahrradtyp"+'</p>' +
            '<p style="text-align: right" class="col-xs-6 ">'+selectedBike+'</p>' +
            '</div>'+
            '</div>'+
            '<div class="col-xs-1 pull-right" style="padding: 0px;margin-top:20px" >' +
            '<a href="#" class="col-xs-2 removeOwnBike" style="padding:5px 1px 0px 1px; "><i style="font-size: 26px" class="glyphicon glyphicon-trash"></i></a></div>'+
            '</div>'+
            '</div>';

        $("#collapseTwo").find('.panel-body').prepend(html);
        $(".removeOwnBike").on("click",function(event){
            event.preventDefault();
            var $this=$(this);
            up.popupModalPrivacyCallback("Möchten Sie Ihr Fahrrad entfernen?","Fahrrad entfernen",
                function(response){
                    if(response){
                        // This corresponds to TYPE 1
                        var bikeId=$this.parent().parent().find('p').eq(2).html();// get all p in the closest div - even child in child elements
                        var bikeType=$this.parent().parent().find('p').eq(5).html();
                        ajaxCommunicator.handleVehicle("removeVehicle","Bike", bikeId,name,"",false,function(response){
                            if(response){
                                up.bikeCount=up.bikeCount-1;
                                $this.parent().parent().remove();
                                if($(".myOwnBike").length==1){
                                    bikeType=$(".myOwnBike").children().eq(1).find('p').eq(5).html();
                                    bikeId=$(".myOwnBike").children().eq(1).find('p').eq(2).html();
                                    ajaxCommunicator.handleVehicle("enableOwnBike","Bike", bikeId,bikeType,"",true,function(response){
                                        if(response){
                                            $(".myOwnBike").children().eq(0).find("i").removeClass('glyphicon-unchecked').addClass('glyphicon-check');
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            );
        });
        $(".enableOwnBike").on("click",function(event){
            event.preventDefault();
            var $this=$(this);
            if($(this).children().hasClass('glyphicon glyphicon-unchecked')){
                var vehicleId=$(this).parent().parent().find('p').eq(2).html();
                var bikeType=$(this).parent().parent().find('p').eq(5).html();
                ajaxCommunicator.handleVehicle("enableOwnBike","Bike", vehicleId,bikeType,"",true,function(response){
                    if(response){
                        $(".enableOwnBike i").removeClass('glyphicon-check').addClass('glyphicon-unchecked');
                        $this.children().removeClass('glyphicon-unchecked').addClass('glyphicon-check');
                    }
                });
            }

        });
        up.isThereAnyVehicle('bike');
    },
    loadVehicles:function(vlist){
        var vehicles=vlist.vehicles;
        up.vehicles=vlist.vehicles;
        up.bikeCount=0;
        up.carCount=0;
        var ownCarCount=0;
        var ownBikeCount=0;
        console.debug("vehicles",up);
        for(var i=0;i<vehicles.length;i++){
            if(vehicles[i].type=="0" || vehicles[i].type=="1") { //  electric car
                ownCarCount=ownCarCount+1;
            }else if(vehicles[i].type=="2"){//bike
                ownBikeCount=ownBikeCount+1;
            }
        }
        up.bikeCount=ownBikeCount;
        up.carCount=ownCarCount;
        for(var i=0;i<vehicles.length;i++){
            if(vehicles[i].type=="0" || vehicles[i].type=="1") { //  electric car
                up.addVehicleToOwnCars(vehicles[i].vehicleId,vehicles[i].motorType,vehicles[i].isOwn,true);
            }else if(vehicles[i].type=="2"){//bike
                up.addBikeToOwnBikes(vehicles[i].vehicleId,vehicles[i].bikeType,vehicles[i].isOwn,true);
            }
        }
        if(ownCarCount==0){
            $("#noneCarInfo").css("display","none");
        }
        if(ownBikeCount==0){
            $("#noneBikeInfo").css("display","none");
        }
    },
    isThereAnyVehicle:function(vehicleType){
        if(vehicleType=="car"){
            if($("#collapseOne").find('.panel-body').children().hasClass("myOwnCar")){
                $("#noneCarInfo").css("display","none");
                return true;
            }else{
                $("#noneCarInfo").css("display","block");
                return false;
            }
        }else if(vehicleType=="bike"){
            if($("#collapseTwo").find('.panel-body').children().hasClass("myOwnBike")){
                $("#noneBikeInfo").css("display","none");
                return true;
            }else{
                $("#noneBikeInfo").css("display","block");
                return false;
            }
        }
    },
    loadPreferences:function(pref){
        if(typeof pref =="undefined"){
            var options={
                width: 50,
                height: 26,
                button_width: 24,
                show_labels: false,
                btn_bg_class:'switch-button-background-user-pref',
                btn_class:'switch-button-button-user-pref',
                btn_bg_active_class:'bg-active-user-pref',
                btn_bg_non_active_class:'bg-nonactive',
                btn_icon:'icon',
                btn_active_class:'btn-active-3',
                btn_non_active_class:'btn-nonactive'
            };
            $("input.vehicle-chkbox").switchBtn(options);
        }else{
            $( "#up-opnv").prop( "checked", pref.opnv );
            $( "#up-car2Go").prop( "checked", pref.car2Go );
            $( "#up-flinkster").prop( "checked", pref.flinkster);
            $( "#up-callABike").prop( "checked", pref.callABike );
            $( "#up-ownCar").prop( "checked", pref.ownCar );
            $( "#up-ownBike").prop( "checked", pref.ownBike );
            $( "#up-citeeCar").prop( "checked", pref.citeeCar );
            $( "#up-nextBike").prop( "checked", pref.nextBike );

            // Private space
            $( "#up-privacy-gps").prop( "checked", pref.gpsLocation );
            $( "#up-privacy-transportMode").prop( "checked", pref.transportMode );
            // can be added more part here
            var options={
                width: 50,
                height: 26,
                button_width: 24,
                show_labels: false,
                btn_bg_class:'switch-button-background-user-pref',
                btn_class:'switch-button-button-user-pref',
                btn_bg_active_class:'bg-active-user-pref',
                btn_bg_non_active_class:'bg-nonactive',
                btn_icon:'icon',
                btn_active_class:'btn-active-3',
                btn_non_active_class:'btn-nonactive'
            };
            $("input.vehicle-chkbox").switchBtn(options);
            $("input.privacy-chkbox").switchBtn(options);
            $("input.others-chkbox").switchBtn(options);
            if(pref.vehicleList!==undefined){
                console.debug("debug",pref);
                up.loadVehicles(pref.vehicleList);
            }
        }
        $(".vehicle-chkbox").change(function(e) {
            e.preventDefault();
            var checked = $(this).is(':checked');
            if($(this).attr("service-name")=="flinkster"){
                user.userPreferences.flinkster=checked;
                ajaxCommunicator.submitAttribute("memberships","flinkster",checked);
            }else if($(this).attr("service-name")=="car2Go"){
                user.userPreferences.car2Go=checked;
                ajaxCommunicator.submitAttribute("memberships","car2Go",checked);
            }
            else if($(this).attr("service-name")=="citeeCar"){
                user.userPreferences.citeeCar=checked;
                ajaxCommunicator.submitAttribute("memberships","citeeCar",checked);
            }
            else if($(this).attr("service-name")=="callABike"){
                user.userPreferences.callABike=checked;
                ajaxCommunicator.submitAttribute("memberships","callABike",checked);
            }else if($(this).attr("service-name")=="nextBike"){
                user.userPreferences.nextBike=checked;
                ajaxCommunicator.submitAttribute("memberships","nextBike",checked);
            }
            else if($(this).attr("service-name")=="ownBike"){
                if(up.isThereAnyVehicle('bike')){
                    user.userPreferences.ownBike=checked;
                    ajaxCommunicator.submitAttribute("others","ownBike",checked);
                }else{
                    if(!$(this).parent().parent().next().hasClass("collapse in") && checked==true){
                        $(this).parent().parent().click();
                    }
                }
            }else if($(this).attr("service-name")=="ownCar"){
                if(up.isThereAnyVehicle('car')){
                    user.userPreferences.ownCar=checked;
                    ajaxCommunicator.submitAttribute("others","ownCar",checked);
                }else{
                    if(!$(this).parent().parent().next().hasClass("collapse in") && checked==true){
                        $(this).parent().parent().click();
                    }
                }
            }
        });

        $(".privacy-chkbox").change(function(e) {
            e.preventDefault();// stop to check
            var checked = $(this).is(':checked');
            if($(this).attr("service-name")=="gpsLocation"){
                user.userPreferences.gpsLocation=checked;
                ajaxCommunicator.submitAttribute("privacy","gpsLocation",checked);
                if(!checked){
                    up.popupModalPrivacy("Falls Sie GPS Lokation deaktivieren wuerden, koennen Sie IRA nicht nutzen! ","Achtung!");
                }
            }else if($(this).attr("service-name")=="transportMode"){
                user.userPreferences.transportMode=checked;
                ajaxCommunicator.submitAttribute("privacy","transportMode",checked);
            }
        });

        $('#addNewVehicle').on("click",function (){
            up.popupModalAddVehicleCallback(
                function(response){
                    if(response) {
                        ajaxCommunicator.handleVehicle("addVehicle","Car", $("#vehicle-Name").val(),selectedCar,getCo2Usage(),"",function(response){
                            if(response){
                                if($(".myOwnCar").length==0 &&  user.userPreferences.ownCar==true){
                                    ajaxCommunicator.submitAttribute("others","ownCar","true");
                                }
                                up.addVehicleToOwnCars($("#vehicle-Name").val(),up.getAccurateVehicleType('car',selectedCar));
                            }
                        });
                    }
                }
            );

            var selectedCar="combustion";//default
            $("#vehicle-info").text("");
            $('#vehicle-Name').on('input', function() {
                if(up.isThisVehicleIdDefined($(this).val())){
                    $("#vehicle-info").text("Bitte geben Sie einen anderen Fahrzeugsname ein!");
                }else{
                    $("#vehicle-info").text("");
                }
            });
            function getCo2Usage(){
                var co2Usage="less";
                $('.co2-usage-amount').each(function(){
                    if($(this).hasClass("active")){
                        co2Usage=$(this).attr('co2usage');
                        return false;
                    }
                });
                return co2Usage;
            }
            $('.co2-usage-amount').on("click",function(e) {
                e.preventDefault();
                $('.co2-usage-amount').each(function(){
                    $(this).removeClass('active');
                    $(this).children().removeClass('highlightCo2');
                });

                $(this).toggleClass('active');
                $(this).children().eq(1).toggleClass("highlightCo2");
            });
            $(".dropdown-menu li a").on("click",function () {
                $(this).parent().parent().parent().find(".btn").html($(this).text() + ' <span class="caret"></span>');
                selectedCar= $(this).attr("motortype");
                if (selectedCar.indexOf("combustion") !=-1) {
                    $(".co2Consumptions").show();
                }else{
                    $(".co2Consumptions").hide();
                }
            });

        });

        $('#addNewBicycle').on("click",function (){
            up.popupModalAddBikeCallback(
                function(response){
                    if(response){
                        ajaxCommunicator.handleVehicle("addVehicle","Bike", $("#bike-Name").val(),selectedBike,"","",function(response){
                            if(response){
                               if($(".myOwnBike").length==0 &&  user.userPreferences.ownBike==true){
                                   ajaxCommunicator.submitAttribute("others","ownBike","true");
                                }
                                up.addBikeToOwnBikes($("#bike-Name").val(),up.getAccurateVehicleType('bike',selectedBike));
                            }
                        });
                    }
                    console.log(response);
                });
            var selectedBike="Standard";
            $("#bike-info").text("");
            $('#bike-Name').on('input', function() {
                if(up.isThisVehicleIdDefined($(this).val())){
                    $("#bike-info").text("Bitte geben Sie einen anderen Fahrzeugsname ein!");
                }else{
                    $("#bike-info").text("");
                }
            });
            $(".dropdown-menu li a").on("click",function () {
                $(this).parent().parent().parent().find(".btn").html($(this).text() + ' <span class="caret"></span>');
                selectedBike= $(this).attr("motortype");
            });
        });

        $(".others-chkbox").change(function(e) {
            e.preventDefault();
            var checked = $(this).is(':checked');
            if($(this).attr("service-name")=="flinkster"){
                user.userPreferences.flinkster=checked;
                ajaxCommunicator.submitAttribute("memberships","flinkster",checked);
            }else if($(this).attr("service-name")=="car2Go"){
                user.userPreferences.car2Go=checked;
                ajaxCommunicator.submitAttribute("memberships","car2Go",checked);
            }
        });
    },

    // required for membership
    checkMembership:function(serviceName,username, password){
        var result=ajaxCommunicator.investigateServiceMembership(serviceName,username,password); // TODO Implement this function
        return result;
    },
    // TODO: move this function to the ajaxCommunicator.
    investigateServiceMembership:function(serviceName,username,password){
        var data="serviceName:"+serviceName+"&username:"+username+"&password:"+password;
        $.ajax({
            url:'dayplanner-gui/main/checkMembership',
            data:data,
            success:function(data){
                if(data){
                    return true;
                }else{
                    return false;
                }
            }
        });
    }
};

/**
 * Sliders
 *
 *@namespace
 * @author Cem Akpolat
 */

//3 Handle TODO: http://jsfiddle.net/U5VEY/55/
//3 Handle TODO:http://www.icodeya.com/2014/10/creating-three-handle-slider-with.html
//var upSlider={
//    debug:true,
//    userPref:null,
//    init:function(pref){
//        //userPref=pref;
//        $( "#up-slider" ).slider({
//            orientation: "vertical",
//            range: true,
//            animate:fast,
//            values: [ 10, 40, 70 ],
//            start:function(){
//                $("#con-3 span").css("font-size",16+70+'%');
//                $("#con-2 span").css("font-size",67+70+'%');
//                $("#con-1 span").css("font-size",100-80+70+'%');
//            },
//            create: function( event, ui ) {
//                ajaxCommunicator.getUserPreferencesFromSession(function(userPref){
//
//                    if(upSlider.debug) {
//                        console.log("UP Time %:" + userPref.timePreference);
//                        console.log("UP Cost %:" + userPref.costPreference);
//                        console.log("UP ECO %:" + userPref.ecoPreference);
//                    }
//
//                    var time=userPref.timePreference;
//                    var cost=userPref.costPreference;
//                    var eco=userPref.ecoPreference;
//
//                    $("#con-3").css("height",cost+'%');
//                    $("#con-2").css("height",eco+'%');
//                    $("#con-1").css("height",time+'%');
//
//                    $("#con-3 span").css("font-size",cost+50+'%');
//                    $("#con-2 span").css("font-size",eco+50+'%');
//                    $("#con-1 span").css("font-size",time+50+'%');
//
//                    var winHeight1 = Math.round(($('#con-1').parent().height()/100)*$('#con-1').height());
//                    var winHeight2 = Math.round(($('#con-2').parent().height()/100)*$('#con-2').height());
//                    var winHeight3 = Math.round(($('#con-3').parent().height()/100)*$('#con-3').height());
//
//                    $("#con-1").css("padding-top",(winHeight1/2-30)+'px');
//                    $("#con-2").css("padding-top",(winHeight2/2-30)+'px');
//                    $("#con-3").css("padding-top",(winHeight3/2-30)+'px');
//
//                    $("#costPercentage").html(cost+"%");
//                    $("#ecoPercentage").html(eco+"%");
//                    $("#timePercentage").html(time+"%");
//
//                    $("#up-slider div:eq(0)").css("height",(100-time-cost)+"%");
//                    $("#up-slider a:eq(1)").css("bottom",(100-time)+"%");
//                    $("#up-slider a:eq(0)").css("bottom",+cost+"%");
//                    upSlider.preferenceEvaluater(cost,100-time);
//                });
//
//            },
//            slide: function( event, ui ) {
//
//
//                var time=100-ui.values[1];
//                var eco=ui.values[1]-ui.values[0];
//                var cost=ui.values[ 0 ];
//                //$("#amount").val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
//                $("#con-3").css("height",cost+'%');
//                $("#con-2").css("height",eco+'%');
//                $("#con-1").css("height",time+'%');
//
//                $("#con-3 span").css("font-size",(cost+50)+'%');
//                $("#con-2 span").css("font-size",(eco+50)+'%');
//                $("#con-1 span").css("font-size",(time+50)+'%');
//
//                $("#con-3 .icon-euro").css("font-size",(cost+90)+'%');
//                $("#con-2 .icon-eco").css("font-size",(eco+90)+'%');
//                $("#con-1 .icon-clock").css("font-size",(time+90)+'%');
//
//                var winHeight1 = $("#con-1").height();
//                var winHeight2 = $("#con-2").height();
//                var winHeight3 = $("#con-3").height();
//                $("#con-1").css("padding-top",winHeight1/2-10);
//                $("#con-2").css("padding-top",winHeight2/2-10);
//                $("#con-3").css("padding-top",winHeight3/2-10);
//
//                // ui.values[0] corresponds to cost and ui.values[1] to time
//                $("#costPercentage").html(cost+"%");
//                $("#ecoPercentage").html(eco+"%");
//                $("#timePercentage").html(time+"%");
//
//                upSlider.preferenceEvaluater(ui.values[0],ui.values[1]);
//            },
//            stop:function(event,ui){
//                user.userPreferences.costPreference=ui.values[0];
//                user.userPreferences.timePreference=100-ui.values[1];
//                user.userPreferences.ecoPreference=ui.values[1]-ui.values[0];
//                ajaxCommunicator.submitPreference();
//            }
//        });
//
//    },
//    preferenceEvaluater:function(val1,val2){
//        var cost=val1;
//        var time=100-val2;
//        var co2=val2-val1;
//
//        upSlider.contentChanger($(".eco-level"),upSlider.helper(co2));
//        upSlider.contentChanger($(".cost-level"),upSlider.helper(cost));
//        upSlider.contentChanger($(".time-level"),upSlider.helper(time));
//    },
//
//    contentChanger:function(element,result){
//        if(result===3){
//            //get element span and add sehr wichtig
//            $(element).text(js_up_moreImportant);
//        }else if(result===2){
//            //get element span and write wichtig
//            $(element).text(js_up_important);
//        }else{
//            //get element span and write irrelevant
//            $(element).text(js_up_notRelevant);
//        }
//
//    },
//    helper:function(val){
//        var result=1;
//        if(val>=50){
//            result=3;
//        }else if(val>=30 && val<50){
//            result=2;
//        }else if(val<30){
//            result=1;
//        }
//        return result;
//    }
//};


//3 Handle TODO: http://jsfiddle.net/U5VEY/55/
//3 Handle TODO:http://www.icodeya.com/2014/10/creating-three-handle-slider-with.html
var upSlider={
    debug:true,
    userPref:null,
    init:function(pref){
        //userPref=pref;
        $( "#up-slider" ).slider({
            orientation: "vertical",
            range: true,
            values: [ 10, 40, 70 ],
            start:function(){
                $("#con-4 span").css("font-size",16+70+'%');
                $("#con-3 span").css("font-size",16+70+'%');
                $("#con-2 span").css("font-size",67+70+'%');
                $("#con-1 span").css("font-size",100-80+70+'%');
            },
            create: function( event, ui ) {
                ajaxCommunicator.getUserPreferencesFromSession(function(userPref){

                    if(upSlider.debug) {
                        console.log("UP Time %:" + userPref.timePreference);
                        console.log("UP Cost %:" + userPref.costPreference);
                        console.log("UP ECO %:" + userPref.ecoPreference);
                    }

                    console.log ("handle0: " + ui.values[0]);
                    console.log ("handle1: " +  ui.values[1]);
                    console.log ("handle2: " + ui.values[2]);

                    var time=userPref.timePreference;
                    var cost=userPref.costPreference;
                    var eco=userPref.ecoPreference;
                    var comfort=userPref.comfortPreference;

                    $("#con-4").css("height",comfort+'%');
                    $("#con-3").css("height",cost+'%');
                    $("#con-2").css("height",eco+'%');
                    $("#con-1").css("height",time+'%');

                    $("#con-4 span").css("font-size",comfort+50+'%');
                    $("#con-3 span").css("font-size",cost+50+'%');
                    $("#con-2 span").css("font-size",eco+50+'%');
                    $("#con-1 span").css("font-size",time+50+'%');

                    var winHeight1 = Math.round(($('#con-1').parent().height()/100)*$('#con-1').height());
                    var winHeight2 = Math.round(($('#con-2').parent().height()/100)*$('#con-2').height());
                    var winHeight3 = Math.round(($('#con-3').parent().height()/100)*$('#con-3').height());
                    var winHeight4 = Math.round(($('#con-4').parent().height()/100)*$('#con-4').height());

                    $("#con-1").css("padding-top",(winHeight1/2-30)+'px');
                    $("#con-2").css("padding-top",(winHeight2/2-30)+'px');
                    $("#con-3").css("padding-top",(winHeight3/2-30)+'px');
                    $("#con-4").css("padding-top",(winHeight4/2-30)+'px');

                    $("#costPercentage").html(cost+"%");
                    $("#ecoPercentage").html(eco+"%");
                    $("#timePercentage").html(time+"%");
                    $("#comfortPercentage").html(comfort+"%");

                    $("#up-slider div:eq(0)").css("height",(100-time-cost-comfort)+"%");
                    $("#up-slider a:eq(2)").css("bottom",(100-time-comfort)+"%");
                    $("#up-slider a:eq(1)").css("bottom",(100-time)+"%");
                    $("#up-slider a:eq(0)").css("bottom",+cost+"%");

                    upSlider.assignFirstPreferences(eco,cost,time,comfort);
                });

            },
            slide: function( event, ui ) {

                console.log ("handle0: " + ui.values[0]);
                console.log ("handle1: " +  ui.values[1]);
                console.log ("handle2: " + ui.values[2]);

                var comfort=100-ui.values[2];
                var time=ui.values[2]-ui.values[1];
                var eco=ui.values[1]-ui.values[0];
                var cost=ui.values[ 0 ];

                //$("#amount").val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
                $("#con-4").css("height",comfort+'%');
                $("#con-3").css("height",cost+'%');
                $("#con-2").css("height",eco+'%');
                $("#con-1").css("height",time+'%');

                $("#con-4 span").css("font-size",(cost+50)+'%');
                $("#con-3 span").css("font-size",(cost+50)+'%');
                $("#con-2 span").css("font-size",(eco+50)+'%');
                $("#con-1 span").css("font-size",(time+50)+'%');

                $("#con-4 .icon-euro").css("font-size",comfort+50+'%');
                $("#con-3 .icon-euro").css("font-size",(cost+90)+'%');
                $("#con-2 .icon-eco").css("font-size",(eco+90)+'%');
                $("#con-1 .icon-clock").css("font-size",(time+90)+'%');

                var winHeight1 = $("#con-1").height();
                var winHeight2 = $("#con-2").height();
                var winHeight3 = $("#con-3").height();
                var winHeight4 = $("#con-4").height();

                $("#con-1").css("padding-top",winHeight1/2-10);
                $("#con-2").css("padding-top",winHeight2/2-10);
                $("#con-3").css("padding-top",winHeight3/2-10);
                $("#con-4").css("padding-top",winHeight4/2-10);

                // ui.values[0] corresponds to cost and ui.values[1] to time
                $("#costPercentage").html(cost+"%");
                $("#ecoPercentage").html(eco+"%");
                $("#timePercentage").html(time+"%");
                $("#comfortPercentage").html(comfort+"%");

                upSlider.preferenceEvaluater(ui.values[0],ui.values[1],ui.values[2]);
            },
            stop:function(event,ui){
                user.userPreferences.costPreference=ui.values[0];
                user.userPreferences.timePreference=100-ui.values[1];
                user.userPreferences.ecoPreference=ui.values[1]-ui.values[0];
                ajaxCommunicator.submitPreference();
            }
        });

    },
    assignFirstPreferences:function(co2,cost,time,comfort){
        upSlider.contentChanger($(".eco-level"),upSlider.helper(co2));
        upSlider.contentChanger($(".cost-level"),upSlider.helper(cost));
        upSlider.contentChanger($(".time-level"),upSlider.helper(time));
        upSlider.contentChanger($(".comfort-level"),upSlider.helper(comfort));
    },

    // comes two values
    preferenceEvaluater:function(val1,val2,val3){
        // receive here the class
        var cost=val1;
        var co2=val2-val1;
        var time=val3-val2
        var comfort=100-val3;
        upSlider.contentChanger($(".eco-level"),upSlider.helper(co2));
        upSlider.contentChanger($(".cost-level"),upSlider.helper(cost));
        upSlider.contentChanger($(".time-level"),upSlider.helper(time));
        upSlider.contentChanger($(".comfort-level"),upSlider.helper(comfort));
    },

    contentChanger:function(element,result){
        if(result===3){
            //get element span and add sehr wichtig
            $(element).text(js_up_moreImportant);
        }else if(result===2){
            //get element span and write wichtig
            $(element).text(js_up_important);
        }else{
            //get element span and write irrelevant
            $(element).text(js_up_notRelevant);
        }

    },
    helper:function(val){
        var result=1;
        if(val>=50){
            result=3;
        }else if(val>=30 && val<50){
            result=2;
        }else if(val<30){
            result=1;
        }
        return result;
    }
};

var upSliderMaxBikeWay={
    debug:true,
    userPref:null,
    init:function(pref){
        userPref=pref;
        $( "#slider-maxBikeWay" ).slider({
            range: "min",
            value: 0,
            min: 0,
            max: 50,
            step:5,
            start:function(){},
            create: function( event, ui ) {
                var maxBikeway=userPref.maxBikeway/1000;
                $( "#max-bike-amount-1" ).text( maxBikeway +"km");
                $( "#max-bike-amount-2" ).text( maxBikeway +"km");
                $('#slider-maxBikeWay').slider('value', maxBikeway);
            },
            slide: function( event, ui ) {
                $( "#max-bike-amount-1" ).text( ui.value +"km");
                $( "#max-bike-amount-2" ).text( ui.value +"km");
            },
            stop:function(event,ui){
                user.userPreferences.maxBikeway=ui.value;
                ajaxCommunicator.submitAttribute("restrictions","maxBikeway",ui.value*1000);
            }
        });

    }
};

var upSliderMaxFootWay={
    debug:true,
    userPref:null,
    init:function(pref){
        //console.debug("bikeway",pref);
        userPref=pref;
        $( "#slider-maxFootWay" ).slider({
            range: "min",
            value: 0,
            min: 0,
            max: 10,
            step:0.1,
            start:function(){},
            create: function( event, ui ) {
                var maxFootway=userPref.maxFootway/1000;
                $( "#max-foot-amount-1" ).text( maxFootway +"km");
                $( "#max-foot-amount-2" ).text( maxFootway +"km");
                $('#slider-maxFootWay').slider('value', maxFootway);
            },
            slide: function( event, ui ) {
                $( "#max-foot-amount-1" ).text( ui.value +"km");
                $( "#max-foot-amount-2" ).text( ui.value +"km");
            },
            stop:function(event,ui){
                user.userPreferences.maxFootway=ui.value;
                ajaxCommunicator.submitAttribute("restrictions","maxFootway",ui.value*1000);
            }
        });

    }
};

var upSliderAvgBikeSpeed={
    debug:true,
    userPref:null,
    init:function(pref){
        userPref=pref;
        $( "#slider-avgBikeSpeed" ).slider({
            range: "min",
            value: 0,
            min: 5,
            max: 30,
            step:2,
            start:function(){},
            create: function( event, ui ) {
                var avgBikeSpeed=userPref.avgBikeSpeed/1000;
                $( "#average-bike-speed-1" ).text( avgBikeSpeed +"km/h");
                $( "#average-bike-speed-2" ).text( avgBikeSpeed+"km/h");
                $('#slider-avgBikeSpeed').slider('value', avgBikeSpeed);
            },
            slide: function( event, ui ) {
                $( "#average-bike-speed-1" ).text( ui.value +"km/h");
                $( "#average-bike-speed-2" ).text( ui.value +"km/h");
            },
            stop:function(event,ui){
                user.userPreferences.maxFootway=ui.value;
                ajaxCommunicator.submitAttribute("restrictions","avgBikeSpeed",ui.value*1000);
            }
        });

    }
};