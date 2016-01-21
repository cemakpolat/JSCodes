/**
 * Represents the user preferences object that covers all parameters related the users.
 * @class
 * @author Cem Akpolat
 */

function User(userPreferences) {
    this.userPreferences = userPreferences;
}
var user = new User(null);
/**
 * Represents the ajax communicator structure enabling to communicate with the backend by means of the ajax methods.
 *
 *@namespace
 * @author Cem Akpolat
 */
var ajaxCommunicator = {

    defaults: {
        timeout: "",
        timeInterval: "",
        passedDuration:0,
        debug: false
    },
    automaticallyLogin: function (callback) {
        // autologin if parameters are set in the url
        var startEmail = utils.get_url_param("user");
        var startPassword = utils.get_url_param("password");
        var startToken = utils.get_url_param("token");
        //
        if (startEmail != "") {
            // do not logout when a token is passed, as this would render the token useless
            console.log("LOGIN IS CALLED");
            //    ajaxCommunicator.login(startEmail, startPassword, startToken);
            ajaxCommunicator.loginCallback(startEmail, startPassword, startToken, function (res) {
                // will be removed
                if (res!=false) {
                    $("#loggedInDivUser").empty().append(startEmail);
                    $("#loginDiv").hide();
                    $("#loggedInDiv").show();
                    $("#ul_HeaderMenu").show();
                }
                //if(callback!==undefined){
                    callback(res);
                //}
            });

        }
    },

    temporaryLoginFunction: function (callback) {

        // hover effect for the login panel
        $("#trigger2").hover(function () {
            $(this).stop()
                .animate({
                    width: '40px',
                    right: '0px'
                }, 200)
                .css({'z-index': '10'});
        }, function () {
            $(this).stop()
                .animate({
                    width: '30px',
                    right: '0px'
                }, 200)
                .css({'z-index': '10'});
        });

//        // for updating the login panel
        ajaxCommunicator.getUserPreferencesFromSessionCallback(function (username) {
            if(username){
                if (user.username != '' || user.userPreferences.username != 'undefined') {
                    $("#loggedInDivUser").empty().append(username);
                    $("#loginDiv").hide();
                    $("#loggedInDiv").show();
                    $("#ul_HeaderMenu").show();

                }else{
                    console.debug('username doesnt exist!');
                }
            }else{
                callback(false);
            }
       });

        //# login panel elements and their functions
        // login button
        var loginbutton = $("#b_loginButton");
        loginbutton.button();
        loginbutton.click(function () {
            ajaxCommunicator.loginCallback($("#i_loginUser").val(), $("#i_loginPassword").val(), "", function (res) {
                if (res!=false) {
                    $("#loggedInDivUser").empty().append($("#i_loginUser").val());
                    $("#loginDiv").hide();
                    $("#loggedInDiv").show();
                    $("#ul_HeaderMenu").show();

                    if (window.self === window.top) {
                        location.reload();
                    }else{
                        console.log("logging process is performed in SPA");
                    }
                }
            });
        });
        // user data is loaded from session, once data is available
//        ajaxCommunicator.getUserPreferencesFromSession(function(pref){
//            //console.debug("pref 0",pref);
//            if(pref!=undefined && pref!=false) {
//                if (user.username != '' || user.userPreferences.username != 'undefined') {
//                    $("#loggedInDivUser").empty().append(user.userPreferences.username);
//                    $("#loginDiv").hide();
//                    $("#loggedInDiv").show();
//                    $("#ul_HeaderMenu").show();
//                }
//                callback(pref);
//            }else{
//                callback(false);
//            }
//        });
        $('#i_loginUser').keypress(function (event) {
            if (event.keyCode == 13) {
                loginbutton.click();
            }
        });
        $('#i_loginPassword').keypress(function (event) {
            if (event.keyCode == 13) {
                loginbutton.click();
            }
        });
        $("#i_logoutUser").unbind().click(function () {
            ajaxCommunicator.logoutCallback(function (res) {
                if (res) {
                    $("#loggedInDivUser").empty();
                    $("#loginDiv").show();
                    $("#loggedInDiv").hide();
                    $("#ul_HeaderMenu").hide();
                }
            });
        });
        // registration button
        $("#ul_HeaderMenu").css('display', 'none');
        var registerbutton = $("#b_registerButton");
        registerbutton.button();
        registerbutton.click(function () {
            uiHandler.registerPopup();
        });
        registerbutton.addClass("small-button");

        if (utils.get_url_param("user") != "" || utils.get_url_param("email") != "") {
            console.debug("login is called in spa");
            ajaxCommunicator.automaticallyLogin(callback);
        }

    },
    /**
     * Initiation function
     */

    init: function (callback) {
        ajaxCommunicator.temporaryLoginFunction(callback); // TODO: Temporary Function, will be removed later
        ajaxCommunicator.throwError();
    },
    throwError: function () {

        jQuery(document).off('ajaxError');
        jQuery(document).ajaxError(function (event, jqxhr, settings, exception) {
//            uiUtilities.popupModal("Ajax Error Occurred!","Ajax Error");
            console.log("Ajax Error Occurred!");
        });

    },
//    // TODO: Remove this function, it is just used for the test case
//    sendUpdateBrackerFunctionToBackend:function(functionName,seconds){
//        var toSend = "functionName=" + functionName+"&seconds="+seconds;
//
//        $.ajax({
//            url: '/dayplanner-gui/main/writeUpdateBreakerInFile',
//            data: toSend,
//            success: function (data) {
//                if (data.successful) {
//                    console.log("Test is successfully done!");
//                }
//            }
//        });
//    },
//    // TODO: Remove this function, it is just used for the test case
    sendResultViewPercentageFunctionToBackend:function(percentage){
        var toSend = "percentage=" + percentage;

        $.ajax({
            url: '/dayplanner-gui/main/writeRVPercentageInFile',
            data: toSend,
            success: function (data) {
            }
        });
    },
    stopUpdateMobilityPlan: function (whoCalled) {
        //if(whoCalled!="undefined" && whoCalled!==undefined){
            //var seconds = ((new Date()).getTime() - ajaxCommunicator.defaults.passedDuration.getTime())/1000;
            //console.debug("UPDATE request is STOPPED!");
            //console.debug("Passed Duration ->",seconds);
            //console.debug("Which method is called ->", whoCalled);
           //ajaxCommunicator.sendUpdateBrackerFunctionToBackend(whoCalled,seconds);
        //}
        drawTravelResults.removeEmptyLoadingSlot();
        clearInterval(ajaxCommunicator.defaults.timeInterval);
        clearTimeout(ajaxCommunicator.defaults.timeout);
    },
    startUpdateMobilityPlan: function () {
        ajaxCommunicator.defaults.passedDuration=new Date();

        ajaxCommunicator.defaults.timeInterval = setInterval(function () {
            ajaxCommunicator.updateMobilityPlan();
        }, 5000);

        ajaxCommunicator.defaults.timeout=setTimeout(function(){
            ajaxCommunicator.stopUpdateMobilityPlan("SET-TIMEOUT");
        }, 80000);
    },

    /**
     * Send a request to the backend whereby all route request informations are sent.
     * The response of the server is forwarded to the travelgraph object
     */
    createMobilityPlan: function (time) {
        if(time==undefined){
            time=0;
        }
        if (targetList.length >= 2) {
            //targets
            var toSend = "targets=" + targetList.length;
            toSend += "&targetLat0=" + targetList[0].position.latitude
            + "&targetLng0=" + targetList[0].position.longitude
            + "&targetAddress0=" + targetList[0].address
            + "&fromTargetTime0=" + (utils.getTimeInMilliSeconds(targetList[0]) + time * 60 * 1000);

            for (var i = 1; i < targetList.length; i++) {
                toSend += "&targetLat" + i + "=" + targetList[i].position.latitude
                + "&targetLng" + i + "=" + targetList[i].position.longitude
                + "&targetAddress" + i + "=" + targetList[i].address
                + "&fromTargetTime" + i + "=" + (utils.getTimeInMilliSeconds(targetList[i]) + time * 60 * 1000)
                + "&toTargetTime" + i + "=" + (utils.getTimeInMilliSeconds(targetList[i]) + time * 60 * 1000);
            }

            toSend += "&opnvSession=" + $("#tt_opvn").is(':checked');
            toSend += "&ownCarSession=" + $("#tt_ownCar").is(':checked');
            toSend += "&bikeSharingSession=" + $("#tt_bikeSharing").is(':checked');
            toSend += "&carSharingSession=" + $("#tt_carSharing").is(':checked');


            toSend += "&ownBikeSession=" + $("#tt_ownBike").is(':checked');
            toSend += "&taxiSession=" + $("#tt_taxi").is(':checked');
            toSend += "&gehmeidenSession=" + $("#tt_gehmeiden").is(':checked');
//            toSend += "&barfreeSession=" + $("#tt_barfrei").is(':checked');

            // planner settings
            // TODO: Remove this planner settings
            var plannerSettings1 = 3;//$("#i_plannerSettings1").val();
            var plannerSettings2 = 1;//$("#i_plannerSettings2").val();
            var plannerSettings3 = 3;//$("#i_plannerSettings3").val();
            var plannerSettings4 = 40000;//$("#i_plannerSettings4").val();
            console.debug("travelDirection",targetList[0].travelDirection);
            toSend +="&travelDirection="+targetList[0].travelDirection;

            toSend += "&plannerSettings1=" + plannerSettings1;
            toSend += "&plannerSettings2=" + plannerSettings2;
            toSend += "&plannerSettings3=" + plannerSettings3;
            toSend += "&plannerSettings4=" + plannerSettings4;

            if (ajaxCommunicator.defaults.debug) {
                console.log("=== CREATE MOBILITY SENT PARAMETERS ===");
                console.log(toSend);
                console.log("=======================================");
            }
            window.getConvertedData = null;

            var success = true;
            $.ajax({
                url: '/dayplanner-gui/main/createMobilityPlan',
                data: toSend,
                success: function (data) {
                    if (ajaxCommunicator.defaults.debug) {
                        $("#navRoutenPlanner").click();
                        window.scrollTo(0, 0);
                        travelGraph.createMobilityPlan(data); // Load here the data and sent to the uiResultview
                        return;
                    } else {
                        if ('content' in data && 'error' in data.content && data.content.error == "notLoggedIn") {
                            uiUtilities.popupModal(js_notLoggedInError);
                            success = false;
                        }
                        else {
                            $("#navRoutenPlanner").click();
                            window.scrollTo(0, 0);
                            travelGraph.createMobilityPlan(data); // Load here the data and sent to the uiResultview
                            ajaxCommunicator.startUpdateMobilityPlan();
                        }
                    }

                },
                timeout: 10000,
                complete: function () {
                }
            });
        }
        else {
            uiUtilities.popupModal(js_enterPointsError, "Ajax Error");
        }
    },

    sendDataToSPA: function (data) {
        if (window.self !== window.top) {
            if(!window.getConvertedData || window.getConvertedData.length < data.length) {
                window.getConvertedData = data;
                slave.evalRemoteFunction("SPA", function (data) {
                    window._dataFunctions = data;
                    return document.location.href;
                }, function (master) {
                }, [window.getConvertedData]);
            }
        }
    },
    /**
     * Responsible for fetching new possible routes from backend.
     */
    updateMobilityPlan: function () {
        //console.log("UPDATE IS STARTED!");
        $.ajax({
            url: '/dayplanner-gui/main/updateMobilityPlan',
            data: '',
            success: function (data) {

                if(ajaxCommunicator.defaults.debug) {
                    console.log("===== UPDATE MOBILITY PLAN ====");
                    console.log(data.data);
                    console.log("===============================");
                }
                if (data.convertedData) {
                    ajaxCommunicator.sendDataToSPA(eval(data.convertedData));
                    //window.getConvertedData = eval(data.convertedData);
                }
                if ('content' in data && data.content != "") {
                    if (data.content == "completed") {
                        console.debug("content ->",data.content );
                        ajaxCommunicator.stopUpdateMobilityPlan("Update Mobility Plan, data is COMPLETED!");
                        travelGraph.updateMobilityPlan(data.data, data.pratings);
                    }
                    else if ('error' in data.content && data.content.error == "notLoggedIn") {
                        console.log(js_notLoggedInError);
                    }
                } else {
                    $("#navRoutenPlanner").click();
                    //window.scrollTo(0, 0);
                    travelGraph.updateMobilityPlan(data.data, data.pratings);
                }
            },
            complete: function () {
            },
            error: function () {
                // alert("error");
            },
            timeout: 15000
        });

    },
    /**
     * Login on server as user with email and password
     * @param email
     * @param password
     * @param token
     * @returns {boolean}
     */
    login: function (email, password, token) {
        var toSend = "email=" + email + "&password=" + password + "&token=" + token;
        $.ajax({
            url: '/dayplanner-gui/main/login',
            data: toSend,
            success: function (data) {
                if(ajaxCommunicator.defaults.debug) {
                    console.log("===== USER DATA ====");
                    console.log(data);
                    console.log("======================");
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                ajaxCommunicator.errorCall(xhr, "error while logging in", textStatus, errorThrown);
            },
            timeout: 10000
        });

    },
    /**
     *
     * @param email
     * @param password
     * @param token
     * @param callback
     */
    loginCallback: function (email, password, token, callback) {
        var toSend = "email=" + email + "&password=" + password + "&token=" + token;

        $.ajax({
            url: '/dayplanner-gui/main/login',
            data: toSend,
            success: function (data) {
                if(ajaxCommunicator.defaults.debug) {
                    console.log("===== USER DATA ====");
                    console.log(data);
                    console.log("======================");
                }
                if ('content' in data && 'error' in data.content) {
                    if (data.content.error == "noLogin") {
                        callback(false);
                    }
                    else if (data.content.error == "noUserData") {
                        console.log(js_error_noUserData);
                        callback(false);
                    }
                } else {

                    user.userPreferences = data;
                    callback(data);
                }
            },
            timeout: 15000,
            error: function (xhr, textStatus, errorThrown) {
                ajaxCommunicator.errorCall(xhr, "error while logging in (callback)", textStatus, errorThrown);
            }
        });

    },
    isUserLoggedIn:function(){
        if(user.userPreferences!==undefined && user.userPreferences!==null){
            return true;
        }
        return false;
    },
    /**
     * Performs the log out from the system
     * @returns {boolean}
     */
    logout: function () {
        $.ajax({
            url: '/dayplanner-gui/main/logout',
            async: true,
            success: function (data) {
                if (data.successful) {
                    window.location.search = "";
                    return true;
                } else {
                    return false;
                }
            },
            timeout: 5000,
            error: function (jqXHR, textStatus, errorThrown) {
                if (textStatus === "timeout") {
                    uiUtilities.popupModal("timeout", "Ajax Error");
                    window.location.search = "";
                    return false;
                }
            }
        });
    },
    logoutCallback: function (callback) {
        $.ajax({
            url: '/dayplanner-gui/main/logout',
            async: true,
            success: function (data) {
                if (data.successful) {
                    if(callback!=undefined){
                        callback(true);
                    }
                } else {
                    if(callback!=undefined){
                        callback(false);
                    }
                }
            },
            timeout: 5000,
            error: function (jqXHR, textStatus, errorThrown) {
                if (textStatus === "timeout") {
                    uiUtilities.popupModal("timeout", "Ajax Error");
                    callback(false);
                }
            }
        });
    },
    /**
     * Register the user with the following parameters
     * @param email
     * @param username
     * @param password
     */
    register: function (email, username, password) {
        var toSend = "email=" + email + "&password=" + password + "&username=" + username;
        $.ajax({
            url: '/dayplanner-gui/main/register',
            data: toSend,
            success: function (data) {
                console.log(data.successful);
                if (data.successful) {
                    uiUtilities.popupModal(js_registration_regSuccess, "Registration State");
                } else {
                    uiUtilities.popupModal(js_registration_regError, "Registration State");
                }
            }
        });
    },
    /**
     * Verify the registered user
     * @param username
     * @param verification
     */
    verify: function (username, verification) {
        var toSend = "verification=" + verification + "&username=" + username;

        $.ajax({
            url: '/dayplanner-gui/main/verify',
            data: toSend,
            success: function (data) {
                if (data.successful) {
                    uiUtilities.popupModal(js_registration_verSuccess, "Verification State");

                } else {
                    uiUtilities.popupModal(js_registration_verError, "Verification State");
                }
            }
        });
    },

    /**
     *Function to update the user object with sessiondata from server returns false if no session is available, else true
     * @param callback
     * @returns {boolean}
     */
    getUserPreferencesFromSession: function (callback) {
        var returnVal = true;
        $.ajax({
            url: '/dayplanner-gui/main/UserPreferencesFromSession',
            success: function (data) {
                if(ajaxCommunicator.defaults.debug) {
                    console.log("==== FORM SESSION ====");
                    console.log(data);
                    console.log("======================");
                }
                if (!( $.isEmptyObject(data) )) {
                    user.userPreferences = data;
                    callback(user.userPreferences);
                } else {
                    callback(false);
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                callback(false);
            }
        });

        // return returnVal;
    },
    getUserPreferencesFromSessionCallback: function (callback) {
        var returnVal = true;
        $.ajax({
            url: '/dayplanner-gui/main/UserPreferencesFromSession',
            success: function (data) {
                if(ajaxCommunicator.defaults.debug) {
                    console.log("==== FORM SESSION ====");
                    console.log(data);
                    console.log("======================");
                }
                if (!( $.isEmptyObject(data) )) {
                    user.userPreferences = data;
                    callback(data.username);
                } else {
                    //returnVal = false;
                    callback(false);
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                callback(false);
            }
        });
    },
    handleVehicle:function(actionName,vehicleType,vehicleId,motorType,co2Usage,isOwn,callback){
//    handleVehicle:function(actionName,vehicleType,vehicleId,motorType,location,co2Usage,callback){
        var pref = user.userPreferences;
        if(pref!=null|| pref!==undefined) {
            if(vehicleType=="Car"){
                var toSend = 'category=' + "vehicles"
                    +'&actionName='+actionName
                    + '&vehicleType=' + "Car"
                    + '&vehicleId=' + vehicleId
                    + '&motorType=' + motorType
                    + '&co2Usage=' + co2Usage
                    + '&isOwn=' + isOwn;
//                + '&locationLng='+location.lng
//                + '&locationLat='+location.lat;


            }else if(vehicleType=="Bike"){
                var toSend = 'category=' + "vehicles"
                    +'&actionName='+actionName
                    + '&vehicleType=' + "Bike"
                    + '&vehicleId=' + vehicleId
                    + '&motorType=' + motorType
                    + '&co2Usage=""'
                    + '&isOwn=' + isOwn;
//                + '&locationLng='+location.lng
//                + '&locationLat='+location.lat;
            }
            if (ajaxCommunicator.defaults.debug) {
                console.log("=== Submitted User Parameters ===");
                console.log(toSend);
                console.log(location);
                console.log("=================================");
            }
            $.ajax({
                url: '/dayplanner-gui/main/submitPreference',
                data: toSend,
                success: function (data) {
                    if (ajaxCommunicator.defaults.debug) {
                        console.log("Submission of User Data Result ->" + data.msg);
                    }
                    callback(data.msg);
                }, error: function (textStatus, errorThrown) {
                    console.log(errorThrown);
                    console.log(textStatus);
                }
            });
        }
    },

    submitAttribute: function (category,changedParam,changedParamValue) {
        var pref = user.userPreferences;
        if(pref!=null|| pref!==undefined) {
            var ownCar = pref.ownCar;
            var ownBike = pref.ownBike;
            var toSend = 'category=' + category
                + '&changedParam=' + changedParam
                + '&changedParamValue=' + changedParamValue
                + '&ownCar=' + ownCar
                + '&ownBike=' + ownBike;


            if (ajaxCommunicator.defaults.debug) {
                console.log("=== Submitted User Parameters ===");
                console.log(toSend);
                console.log("=================================");
            }
            $.ajax({
                url: '/dayplanner-gui/main/submitPreference',
                data: toSend,
                success: function (data) {
                    if (ajaxCommunicator.defaults.debug) {
                        console.log("Submission of User Data Result ->" + data.msg);
                    }
                }, error: function (textStatus, errorThrown) {
                    console.log(errorThrown);
                    console.log(textStatus);
                }
            });
        }

    },
    submitPreference: function () {
        var pref = user.userPreferences;
        if(pref!=null|| pref!==undefined) {
            var comfortPreference = pref.comfortPreference;
            var costPreference = pref.costPreference;
            var ecoPreference = pref.ecoPreference;
            var timePreference = pref.timePreference;
            var toSend = 'category=' + "preferences"
                + '&comfortPreference=' + comfortPreference
                + '&costPreference=' + costPreference
                + '&ecoPreference=' + ecoPreference
                + '&timePreference=' + timePreference;

            if (ajaxCommunicator.defaults.debug) {
                console.log("=== Submitted User Parameters ===");
                console.log(toSend);
                console.log("=================================");
            }
            $.ajax({
                url: '/dayplanner-gui/main/submitPreference',
                data: toSend,
                success: function (data) {
                    if (ajaxCommunicator.defaults.debug) {
                        console.log("Submission of User Data Result ->" + data.msg);
                    }
                }, error: function (textStatus, errorThrown) {
                    console.log(errorThrown);
                    console.log(textStatus);
                }
            });
        }
    },


    /**
     * Save Planner Settings
     */
    savePlannerSettings: function () {
        var plannerSettings1 = $("#i_plannerSettings1").val();
        var plannerSettings2 = $("#i_plannerSettings2").val();
        var plannerSettings3 = $("#i_plannerSettings3").val();
        var plannerSettings4 = $("#i_plannerSettings4").val();

        var toSend = "";
        toSend += "plannerSettings1=" + plannerSettings1;
        toSend += "&plannerSettings2=" + plannerSettings2;
        toSend += "&plannerSettings3=" + plannerSettings3;
        toSend += "&plannerSettings4=" + plannerSettings4;

        $.ajax({
            url: '/dayplanner-gui/main/savePlannerSettings',
            data: toSend,
            error: function (textStatus, errorThrown) {
                $.event.global.ajaxError = false;
                uiUtilities.popupModal(js_prompt_plannerSettingSaveError, "Ajax Error");

            },
            timeout: 6000
        });
    },

    /* ##############  WHEATHER FUNCTION   ###############  */

    /* ##############  MONITORING TOOL FUNCTIONS   ###############  */

    /**
     * Add a new route into the database for monitoring tool
     * @param indexNumberOfRoute
     */
    addPlanning: function (planningID, callback) {
        var toSend = "planningID=" + planningID;
        $.ajax({
            url: '/dayplanner-gui/main/addPlanning',
            data: toSend,
            success: function (data) {
                if (callback !== undefined) {
                    callback(data);
                }
                if(ajaxCommunicator.defaults.debug){
                    console.log("=== Add Planning ===");
                    console.log(data);
                    console.log("====================")
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                if (callback !== undefined) {
                    callback(xhr.responseText);
                } else {
                    ajaxCommunicator.errorCall(xhr, "error while obtaining the result of accepted plannig", textStatus, errorThrown);
                }
            },
            timeout: 20000
        });
    },
    // TODO: Test this function
    replacePlanning:function(oldPId,planningID){
        var toSend = "planningID=" + planningID;
        $.ajax({
            url: '/dayplanner-gui/main/addPlanning',
            data: toSend,
            success: function (data) {
                ajaxCommunicator.removePlanning(oldPId,function(isRemoved){
                   if(isRemoved){
                        // add here popup
                        uiUtilities.popupModalForReplanning('Neu Plannung wurde mit der alten Plannung ersetzt.',"Routenplaner Info");
                   }else{
                       uiUtilities.popupModalForReplanning('Alte Plannung konnte nicht gelöscht werden.',"Routenplaner Info");
                   }
                });

            },
            error: function (xhr, textStatus, errorThrown) {
                if (callback !== undefined) {
                    callback(xhr.responseText);
                } else {
                    ajaxCommunicator.errorCall(xhr, "error while obtaining the result of replacing planning", textStatus, errorThrown);
                }
            },
            timeout: 20000
        });
    },
    /**
     * Obtain the saved routes from database
     */
    getAllPlannings: function (callback) {
        drawRoutes.addEmptyLoadingSlot();
        $.ajax({
            url: '/dayplanner-gui/main/getAllPlannings',
            success: function (data) {
                if(true) {
                    console.log('************ GET ALL PLANNINGS Incoming Data Content *****************');
                    console.log(data);
                    console.log('**********************************************************************');
                }
                drawRoutes.removeEmptyLoadingSlot();
                callback(data);
            },
            error: function (xhr, textStatus, errorThrown) {
                uiUtilities.popupModal(xhr.responseText+" "+textStatus, errorThrown);
                ajaxCommunicator.errorCall(xhr, "Error while getting all plannings", textStatus, errorThrown);
            },
            timeout: 25000
        });

    },
    /**
     * Remove the saved route and update the database
     * @param indexToBeRemovedRoute
     */
    removePlanning: function (planningID,callback) {
        //console.log("REMOVE PLANNING ID:" + planningID);
        var toSend = "planningID=" + planningID;
        $.ajax({
            url: '/dayplanner-gui/main/removePlanning',
            data: toSend,
            success: function (data) {
                if(callback!==undefined){
                    callback(data.successful);
                }
            },
            error: function (textStatus, errorThrown) {
                $.event.global.ajaxError = false;
                uiUtilities.popupModal("error while removing Planning", "Ajax Error");
                if(callback!==undefined){
                    callback(data.successful);
                }
            },
            timeout: 8000
        });
    },

    /**
     * Get current location of the user
     */
    getCurrentLocation: function (callback) {
        $.ajax({
            url: '/dayplanner-gui/main/getCurrentLocation',
            data: '',
            success: function (result) {
                callback(result);
            },
            error: function (textStatus, errorThrown) {
                $.event.global.ajaxError = false;
//                uiUtilities.popupModal("error while getting current location","Ajax Error");
                console.log("error while getting current location ->" + textStatus + " " + errorThrown);
            },
            timeout: 8000
        });
    },
    getCurrentPosition: function (callback) {
        $.ajax({
            url: '/dayplanner-gui/main/UserPreferencesFromProxyNode',
            data: '',
            success: function (result) {
                callback(result);
            },
            error: function (textStatus, errorThrown) {
                $.event.global.ajaxError = false;
//                uiUtilities.popupModal("error while getting current location","Ajax Error");
                console.log("error while getting current location ->" + textStatus + " " + errorThrown);
            },
            timeout: 8000
        });
    },

    /**
     * Get current location of the user
     */
    getCurrentProgress: function (planningID,callback) {
        $.ajax({
            url: '/dayplanner-gui/main/getCurrentProgress',
            data: 'planningID=' + planningID,
            success: function (result) {
                callback(result);
            },
            error: function (textStatus, errorThrown) {
                $.event.global.ajaxError = false;
                console.log("error while getting current progress ->" + textStatus + " " + errorThrown);
            },
            timeout: 10000
        });
    },
    /**
     * Get currently used vehicle by User
     */
    getCurrentTransportationMode: function (callback) {
        $.ajax({
            url: '/dayplanner-gui/main/getCurrentTransportationMode',
            data: '',
            success: function (result) {
                callback(result);
            },
            error: function (textStatus, errorThrown) {
                $.event.global.ajaxError = false;
//                uiUtilities.popupModal("error while getting currently used vehicle","Ajax Error");
                console.log("error while getting current used vehicle ->" + textStatus + " " + errorThrown);
            },
            timeout: 8000
        });
    },

    /**
     * Accept one of the proposed route by Monitoring Tool and send the selected planning ID
     * to the Monitoring Tool for the replacement with the old planning.
     * @param selectedRoute
     */
    acceptPlanning: function (oldPlanningID, newPlanningID) {
        var toSend = "";
        toSend += "oldPlanningID=" + oldPlanningID;
        toSend += "&newPlanningID=" + newPlanningID;
        $.ajax({
            url: '/dayplanner-gui/main/acceptPlanning',
            data: toSend,
            success: function (data) {
                if(ajaxCommunicator.defaults.debug) {
                    console.log("=== NEW PLANNING IS ACCEPTED ===");
                    console.log(data);
                    console.log("==============");
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                $.event.global.ajaxError = false;
                uiUtilities.popupModal("Error while accepting the planning proposal:\n" + xhr.responseText, errorThrown);
                console.log("error while obtaining the result of accepted plannig ->" + textStatus + " " + errorThrown);
            },
            timeout: 30000
        });
    },

    /**
     * Obtain all proposed Plannings by Monitoring Tool
     */
    getPlanningProposals: function (planningID, callback) {
        $.ajax({
            url: '/dayplanner-gui/main/getPlanningProposals',
            data: 'planningID=' + planningID,
            success: function (data) {
                if(ajaxCommunicator.defaults.debug) {
                    console.log("=== getPlanningProposals===");
                    console.log(data);
                    console.log("==============");
                }
                callback(data)
            },
            error: function (xhr, textStatus, errorThrown) {
                $.event.global.ajaxError = false;
                uiUtilities.popupModal("Error while getting currently proposed plannings: " + xhr.responseText, errorThrown);
                console.log("error while getting currently proposed plannings ->" + textStatus + " " + errorThrown);
            },
            timeout: 8000
        });
    },
    /**
     * Obtain all proposed Plannings by Monitoring Tool
     */
    getReplanningProposals: function (planningID, callback) {
        $.ajax({
            url: '/dayplanner-gui/main/getReplanningProposals',
            data: 'planningID=' + planningID,
            success: function (data) {
                if(ajaxCommunicator.defaults.debug) {
                    console.log("=== getReplanningProposals===");
                    console.log(data);
                    console.log("==============");
                }
                callback(data)
            },
            error: function (xhr, textStatus, errorThrown) {
                $.event.global.ajaxError = false;
                uiUtilities.popupModal("Error while getting currently proposed plannings: " + xhr.responseText, errorThrown);
                console.log("error while getting currently proposed plannings ->" + textStatus + " " + errorThrown);
            },
            timeout: 8000
        });
    },
    /**
     * Obtain request for given planning id.
     */
    getReq: function (planningID, callback) {
        $.ajax({
            url: '/dayplanner-gui/main/getReq',
            data: 'planningID=' + planningID,
            success: function (data) {
                callback(data)
            },
            error: function (xhr, textStatus, errorThrown) {
                $.event.global.ajaxError = false;
                uiUtilities.popupModal("Error while getting request for planning " + planningID +  ": " + xhr.responseText, errorThrown);
                console.log("error while getting request for planning " + planningID +  "->" + textStatus + " " + errorThrown);
            },
            timeout: 8000
        });
    },
    startSimulation: function (planningID) {
        $.ajax({
            url: '/dayplanner-gui/main/startSimulation',
            data: 'planningID=' + planningID,
            success: function (data) {
                console.log("Simulation is started successfully!");
            },
            error: function (xhr, textStatus, errorThrown) {
                ajaxCommunicator.errorCall(xhr, "error while getting current used vehicle", textStatus, errorThrown);
                uiUtilities.popupModal(xhr.responseText, errorThrown);
            },
            timeout: 8000
        });
    },


    /**
     * Fetch any message from Monitoring Tool
     */
    messageFromMonitoringTool: function (planningID, callback) {
        $.ajax({
            url: '/dayplanner-gui/main/getPlanningProposals',
            data: 'planningID=' + planningID,
            success: function (data) {
                if(ajaxCommunicator.defaults.debug) {
                    console.log("got message from monitoring component for planning id: " + planningID
                        + " -> [" + data.title + "] " + data.message + " :plannings: " + data.plannings
                        + " :ratings: " + data.pratings);
                }
                callback(data);
            },
            error: function (textStatus, errorThrown) {
                $.event.global.ajaxError = false;
//                uiUtilities.popupModal("error while fetching message from monitoring tool","Ajax Error");
                console.log("error while fetching message from monitoring tool ->" + textStatus + " " + errorThrown);
            },
            timeout: 8000
        });

    },
    restartSimIra: function (planningID, callback) {
        $.ajax({
            url: '/dayplanner-gui/main/restartSimIra',
            data: 'planningID=' + planningID,
            success: function (data, textStatus, xhr) {
                uiUtilities.popupModal(xhr.responseText, "Information");
                callback(data);
            },
            error: function (xhr, textStatus, errorThrown) {
                ajaxCommunicator.errorCall(xhr, "error while fetching message from monitoring tool", textStatus, errorThrown);
            },
            timeout: 8000
        });
    },
    resumeSimIra: function (planningID, callback) {
        ajaxCommunicator.simIra(planningID, callback, "resume");
    },
    pauseSimIra: function (planningID, callback) {
        ajaxCommunicator.simIra(planningID, callback, "pause");
    },
    stopSimIra: function (planningID, callback) {
        ajaxCommunicator.simIra(planningID, callback, "stop");
    },
    errorCall: function (xhr, msg, textStatus, errorThrown) {
        $.event.global.ajaxError = false;
//        uiUtilities.popupModal(xhr.responseText+" "+msg, errorThrown);
        console.log(msg + " ->" + textStatus + " " + errorThrown);
    },
    simIra: function (planningID, callback, mode) {
        $.ajax({
            url: '/dayplanner-gui/main/' + mode + 'SimIra',
            data: 'planningID=' + planningID,
            success: function (data) {
                callback(data);
            },
            error: function (xhr, textStatus, errorThrown) {
                ajaxCommunicator.errorCall(xhr, "error while fetching message from monitoring tool", textStatus, errorThrown);
            },
            timeout: 8000
        });
    },

    getSimulationTime: function (callback) {
        $.ajax({
            url: '/dayplanner-gui/main/getCurrentTime',
            data: '',
            success: function (data) {
                console.log("simTime: " + data.time);
                callback(data.time);
            },
            error: function (textStatus, errorThrown) {
                $.event.global.ajaxError = false;
//                uiUtilities.popupModal("error while fetching message from monitoring tool","Ajax Error");
                console.log("error while fetching message from monitoring tool ->" + textStatus + " " + errorThrown);
            },
            timeout: 8000
        });
    },
    checkAvailabilityOfUserAgent: function () {
        $.ajax({
            url: '/dayplanner-gui/main/checkAvailabilityOfUserAgent',
            data: '',
            success: function (data) {
                //console.log("checked availability of user agent.");
            },
            error: function (xhr, textStatus, errorThrown) {
                $.event.global.ajaxError = false;
                // uiUtilities.popupModal(xhr.responseText, errorThrown);
                console.log("error while fetching message from monitoring tool ->" + textStatus + " " + errorThrown);
            },
            timeout: 8000
        });
    },
    activatePushMonitoring: function (planningID) {
        $.ajax({
            url: '/dayplanner-gui/main/activatePush',
            data: 'planningID=' + planningID,
            success: function (data) {
                console.log("activated push monitoring!");
            },
            error: function (xhr, textStatus, errorThrown) {
                ajaxCommunicator.errorCall(xhr, "could not activate push monitoring!", textStatus, errorThrown);
                uiUtilities.popupModal(xhr.responseText, errorThrown);
            },
            timeout: 20000
        });
    },
    activateForegroundMonitoring: function (planningID) {
        $.ajax({
            url: '/dayplanner-gui/main/activateForegroundMonitoring',
            data: 'planningID=' + planningID,
            success: function (data) {
                console.log("activated foreground monitoring!");
            },
            error: function (xhr, textStatus, errorThrown) {
                ajaxCommunicator.errorCall(xhr, "could not activate foreground monitoring!", textStatus, errorThrown);
                uiUtilities.popupModal(xhr.responseText, errorThrown);
            },
            timeout: 20000
        });
    },
    getWeather:function(latitude,longitude,time, callback){
        $.ajax({
            url: '/dayplanner-gui/main/getWeather',
            data: 'latitude=' + latitude +"&longitude="+longitude+"&time="+time,
            success: function (data) {
//                console.debug("Wheather information",data);
                callback(data.weatherData);

            },
            error: function (xhr, textStatus, errorThrown) {
                ajaxCommunicator.errorCall(xhr, "Wheather information couldn't be retrieved from backend!", textStatus, errorThrown);
                uiUtilities.popupModal(xhr.responseText, errorThrown);
            },
            timeout: 20000
        });
    },
    storeGeoLocation:function(latitude,longitude,address){
        $.ajax({
            url: '/dayplanner-gui/main/storeGeoLocation',
            data: 'latitude=' + latitude +"&longitude="+longitude+"&address="+address,
            success: function (data) {
                console.debug("Store Operation ->",data);
            },
            error: function (xhr, textStatus, errorThrown) {
                ajaxCommunicator.errorCall(xhr, "Wheather information couldn't be fetched from backend!", textStatus, errorThrown);
                uiUtilities.popupModal(xhr.responseText, errorThrown);
            },
            timeout: 10000
        });
    },
    getAddressOfGeoLocation:function(latitude,longitude){
        return $.ajax({
            url: '/dayplanner-gui/main/getAddressOfGeoLocation',
            data: 'latitude=' + latitude +"&longitude="+longitude,
            success: function (data) {
                //console.debug("Get Location Address Operation",data );
                //console.debug("Get Location Address Operation", Object.keys(data)+" " + data.address );
            },
            error: function (xhr, textStatus, errorThrown) {
                ajaxCommunicator.errorCall(xhr, "Wheather information couldn't be fetched from backend!", textStatus, errorThrown);
                uiUtilities.popupModal(xhr.responseText, errorThrown);
            },
            async:false
        }).responseText;
    },
    /**
     * Get the current language from backend
     */
    getLanguage: function () {
        //console.log("GET LANGUAGE");
        $.ajax({
            url: '/dayplanner-gui/main/getLanguage',
            data: "getLang=true",
            success: function (data) {
                language = data.lang.substring(0, 2);
            }
        });
    }
    //    // TODO: Remove this function
//    automaticallyLoginForTestCase: function (callback) {
//        var startEmail = "cema";
//        var startPassword = "Test1234"
//        var startToken = "";
//        //
//        if (startEmail != "") {
//            console.log("LOGIN IS CALLED");
//            ajaxCommunicator.loginCallback(startEmail, startPassword, startToken, function (res) {
//                // will be removed
//                if (res!=false) {
//                    $("#loggedInDivUser").empty().append(startEmail);
//                    $("#loginDiv").hide();
//                    $("#loggedInDiv").show();
//                    $("#ul_HeaderMenu").show();
//                }
//                if(callback!==undefined){
//                    callback(res);
//                }
//            });
//        }
//    },

};
