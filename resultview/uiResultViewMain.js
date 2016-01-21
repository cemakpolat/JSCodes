/**
 *
 *
 *@namespace
 * @author Cem Akpolat
 */
var rvMap = null;
function initializeRVMap() {
    var map_canvas = document.getElementById('rv-map_canvas');
    var map_options = {
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false
    };

    rvMap = new google.maps.Map(map_canvas, map_options);
}

google.maps.event.addDomListener(window, 'load', initializeRVMap);

/* The following functions are used to figure out the screen size of the screen */
function xs() {
    return $("#media-width-detection-element").css("width") === "0px";
};
function sm() {
    return $("#media-width-detection-element").css("width") === "768px";
};
function md() {
    return $("#media-width-detection-element").css("width") === "992px";
};
function lg() {
    return $("#media-width-detection-element").css("width") === "1200px";
};

var travelGraph = {
    defaults: {
        timeout: "",
        results: null,
        popupSegmentOpened: false
    },
    createMobilityPlan: function (incomingData) {
        $("#rv-routes").html('');       // remove previously obtained datas
        $("#rp-view").hide();
        $("#rv-view").show();
        drawTravelResults.addEmptyLoadingSlot();
        drawTravelResults.generateWeatherInfo(location,function(weather){
            drawTravelResults.generateAddressBar(weather);
        })

        var parser = null;
        if (ajaxCommunicator.defaults.debug) {
            parser = new NEWPARSER(realdummy2[0].data);
            parser.setRatings(realdummy2[1]);
        } else {
            parser = new NEWPARSER(incomingData);
        }
        //parser=new NEWPARSER(incomingData);
        var tgData = parser.getTravelData();
        drawTravelResults.generateResults(tgData);
        drawTravelResults.clearMap();
        targetList.redrawMarkersForResultView();
    },

    updateMobilityPlan: function (incomingData, ratings) {
        var parser = new NEWPARSER(incomingData);
        parser.setRatings(ratings);
        var tgData = parser.getTravelData();
        drawTravelResults.generateResults(tgData);
        travelGraph.defaults.results = tgData;
    },
    /* How to hide an element when the click event outside of the element*/
    boot: function () {
        if (xs()) {
            $("#rv-map_canvas").hide();
        } else {
            $("#rv-map_canvas").show();
        }
        $(".rpCalRoute10MinEarly").click(function(event){
            ajaxCommunicator.stopUpdateMobilityPlan();
            ajaxCommunicator.createMobilityPlan(-10);
        });
        $(".rpCalRoute10MinLater").click(function(event){
            // event.stopPropagation();
            ajaxCommunicator.stopUpdateMobilityPlan();
            ajaxCommunicator.createMobilityPlan(10);
        });

        $("#rvStopUpdateMobPlan").click(function () {
            if (drawTravelResults.defaults.updateMobilityResults) {
                ajaxCommunicator.stopUpdateMobilityPlan();
            }
        });

        $(".returnToRoutePlanner").unbind().click(function () {
            ajaxCommunicator.stopUpdateMobilityPlan();
            $("#rp-view").show();
            $("#rv-view").hide();
            targetList.redrawMarkers(rpMap); // required for fitting the bounds
            google.maps.event.trigger(rpMap, 'resize');
            // stop animation or remove the whole animation
            drawTravelResults.defaults.updateMobilityResults = false;
        });

        //move this part to the routeplanner and add if="returToResultView"
        $(".returnToResultView").unbind().click(function () {
            drawTravelResults.clearMap();
            $("#rp-view").hide();
            $("#rv-view").show();
            targetList.redrawMarkersForResultView();
            // stop animation or remove the whole animation
            drawTravelResults.defaults.updateMobilityResults = false;
        });

    },
    init: function () {

        $(document).mouseup(function (e) {
            var slot = $('.rv-slot');
            var routeList = $('.rv-route-list');
            var segment = $('.segment-container');
            var doughnutWrapper = $('.rv-dougnuth-wrapper').parent();

            if (!slot.is(e.target) // if the target of the click isn't the container...
                && slot.has(e.target).length === 0) // ... nor a descendant of the container
            {
                //container.hide();
                slot.css("border-color", "white");
            }
            if (!routeList.is(e.target) // if the target of the click isn't the container...
                && routeList.has(e.target).length === 0) // ... nor a descendant of the container
            {
                $('.rv-segment').children(".segment-times").css("font-weight", "normal");
                $('.rv-segment').children(".segment-times").css("color", "#000");
                routeList.remove();
            }
            if (!segment.is(e.target) // if the target of the click isn't the container...
                && segment.has(e.target).length === 0) // ... nor a descendant of the container
            {
                segment.css("border-color", "white");
            }
            if (!doughnutWrapper.is(e.target) // if the target of the click isn't the container...
                && doughnutWrapper.has(e.target).length === 0) // ... nor a descendant of the container
            {
                if ($('.rv-dougnuth-wrapper').is(":visible")) {
//                    $('.rv-dougnuth-wrapper').animate({width:'toggle'},350);
                    $('.rv-dougnuth-wrapper').hide();
                }
            }

        });

        var icon = $(".rv-addPlanning");
        if (xs()) {
            $("#rv-map_canvas").hide();
            $('.rv-dougnuth-wrapper').css("right", ($('.xs-rater').parent().outerWidth()));
            var h = ($('.xs-rater').parent().parent().parent().height() - (32));
            $('.xs-rater').css("margin-top", h / 2);
            icon.css("margin-top", h / 2 - 5);

        } else {

            $("#rv-map_canvas").show();
            var h = ($(' .sm-rater').parent().parent().parent().parent().height() - 32); // image pixel
            var m = ($('.sm-rater').parent().parent().parent().parent().height() - ( $('.rv-dougnuth-wrapper-sm').height())); // image pixel
            $('.sm-rater').css("margin-top", h / 2);
            icon.css("margin-top", h / 2 - 5);
            $('.rv-dougnuth-wrapper-sm').css("margin-top", (m) / 2);

        }
        //drawTravelResults.locked=false; TODO: True oder false
        if (window.self === window.top) {
            //dayplanner is stand alone started...
            icon.on('click', function (e) {
                var pid = $(this).closest('.rv-slot').attr('slotnr') - 1;
                var $this = $(this);
                if ($(this).attr("value") == "nonchecked") {
//                $(this).css('background-image', 'url(' +appContext+ '/images/travelgraph/nochecked.png' + ')');
                    $(this).css('border', '2px #4B6E88 solid');
                    $this.attr("value", "checked");
                    $this.popover({
                        trigger: 'manual',
                        placement: 'right',
                        content: 'Route ist gespeichert!'
                    });
                    $this.popover("show");
                    setTimeout(function () {
                        $this.popover('destroy')
                    }, 1000);
                    // TODO: Replacement of PID should be done in SPA not in Dayplanner-gui
                   // if(uiRoutePlanner.defaults.pidToBeReplaced!=false){
                    //    ajaxCommunicator.replacePlanning(uiRoutePlanner.defaults.pidToBeReplaced,drawTravelResults._data.slots[pid].planningID);
                    //    uiRoutePlanner.defaults.pidToBeReplaced=false;
                    //}else{
                        ajaxCommunicator.addPlanning(drawTravelResults._data.slots[pid].planningID);
                   // }
                } else {
                    $(this).css('border', 'none');
                    $this.attr("value", "nonchecked");
                    $this.popover({
                        trigger: 'manual',
                        placement: 'right',
                        content: 'Route ist gelöscht!'
                    });
                    $this.popover("show");
                    setTimeout(function () {
                        $this.popover('destroy')
                    }, 1000);
                    ajaxCommunicator.removePlanning(travelGraph.defaults.results.slots[pid].planningID);
                }
            });
        } else {  //dayplanner is started in SPA...
            icon.each(function () {
                $(this).removeAttr('data-toggle');
                $(this).css("margin-left","-10px");
                var planningID = $(this).closest('.rv-slot').attr('planningid');

                var functionString = "(function (e) {\
                    var routeFun;\
                    if (typeof(_dataFunctions) == 'undefined') return;\
                    for (var i = 0; i < _dataFunctions.length; i++) {\
                        if ((_dataFunctions[i]()).getPlanningId() == \"" + planningID + "\") {\
                            routeFun = _dataFunctions[i];\
                            break;\
                        }\
                    }\
                    if (!routeFun) return;\
                    if(document.getElementById('Layer_" + planningID + "')) {\
                        var div = document.getElementById('Layer');\
                        document.getElementById('mainPageWrapper').removeChild(div);\
                        $('#Layer_" + planningID + "').css('top', " + this.getBoundingClientRect().top + " + document.getElementById(" + slave.getClientId() + ").getBoundingClientRect().top + \"px\");\
                        $('#Layer_" + planningID + "').css('left', " + this.getBoundingClientRect().left + " + document.getElementById(" + slave.getClientId() + ").getBoundingClientRect().left + \"px\");\
                        $('#Layer_" + planningID + "').show();\
                        return null;\
                    }\
                    document.getElementById('Layer').setAttribute('id','Layer_" + planningID + "');\
                    $('#Layer_" + planningID + "').bind('mouseenter', function () {\
                        master.evalRemoteFunction(\"" + slave.getClientId() + "\", function () {\
                            drawTravelResults.locked=true;\
                            return document.location.href;\
                        }, function (mastersUrl) {}, []);\
                    }).bind('mouseleave', function () {\
                        master.evalRemoteFunction(\"" + slave.getClientId() + "\", function () {\
                            drawTravelResults.locked=false;\
                            return document.location.href;\
                        }, function (mastersUrl) {}, []);\
                    }).bind('dragstop', function () {\
                        master.evalRemoteFunction(\"" + slave.getClientId() + "\", function () {\
                            drawTravelResults.locked=false;\
                            return document.location.href;\
                        }, function (mastersUrl) {}, []);\
                    });\
                    return routeFun();\
                })";
                window.siClient.addIcon(this, eval.call(null,functionString));
            });
        }

        $(window).resize(function() {
            if (uiUtilities.xs()) {
                if(!uiRoutePlanner.defaults.xsDrawn){
                    $("#rv-map_canvas").hide();
                    $('.rv-dougnuth-wrapper').css("right", $('.xs-rater').parent().outerWidth());
                    var h = ($('.xs-rater').parent().parent().parent().height() - ($('.xs-rater').parent().height()));
                    $('.xs-rater').css("margin-top", h / 2);
                    $('.rv-addPlanning').css("margin-top", h / 2 - 5);
                    drawTravelResults.loadGUI(); // TODO: You can't load the each time the image
                    uiRoutePlanner.defaults.xsDrawn=true;
                }
                uiRoutePlanner.defaults.smDrawn=false;
            }
            else{
                if(!uiRoutePlanner.defaults.smDrawn){
                    $('.rv-slot').show();// show all slots
                    $("#rv-map_canvas").appendTo($('#map-wrapper-sm'));
                    $("#rv-map_canvas").show();
                    google.maps.event.trigger(rvMap, 'resize');
                    var h = ($('.sm-rater').parent().parent().parent().parent().height() - (32));
                    var m = ($('.sm-rater').parent().parent().parent().parent().height() - ( $('.rv-dougnuth-wrapper-sm').height())); // image pixel
                    $('.sm-rater').css("margin-top", h / 2);
                    $('.rv-dougnuth-wrapper-sm').css("margin-top", (m) / 2);
                    $('.rv-addPlanning').css("margin-top", h / 2 - 5);
                    drawTravelResults.loadGUI(); // TODO: You can't load the each time the image
                    uiRoutePlanner.defaults.smDrawn=true;
                }
                uiRoutePlanner.defaults.xsDrawn=false;
            }
        });
//        $(window).resize(function () {
//            if (xs()) {
//                $("#rv-map_canvas").hide();
//                $('.rv-dougnuth-wrapper').css("right", $('.xs-rater').parent().outerWidth());
//                var h = ($('.xs-rater').parent().parent().parent().height() - ($('.xs-rater').parent().height()));
//                $('.xs-rater').css("margin-top", h / 2);
//                $('.rv-addPlanning').css("margin-top", h / 2 - 5);
//                drawTravelResults.loadGUI(); // TODO: You can't load the each time the image
//                //$("#map_canvas").appendTo(this);
//            } else {
//                $('.rv-slot').show();// show all slots
//                $("#rv-map_canvas").appendTo($('#map-wrapper-sm'));
//                $("#rv-map_canvas").show();
//                google.maps.event.trigger(rvMap, 'resize');
//                var h = ($('.sm-rater').parent().parent().parent().parent().height() - (32));
//                var m = ($('.sm-rater').parent().parent().parent().parent().height() - ( $('.rv-dougnuth-wrapper-sm').height())); // image pixel
//                $('.sm-rater').css("margin-top", h / 2);
//                $('.rv-dougnuth-wrapper-sm').css("margin-top", (m) / 2);
//                $('.rv-addPlanning').css("margin-top", h / 2 - 5);
//                drawTravelResults.loadGUI(); // TODO: You can't load the each time the image
//            }
//        });
        // Segment container is applied only to Desktop Designs
        var popupSegmentOpened = false;
        var segmentNumber = null;
        var slotNumber = null;

        $(".segment-container").on("click", function (event) {
            event.stopPropagation();
            $('.rv-slot').css("border-color", "white");
            $('.rv-route-list').remove();
            $('.segment-container').css("border-color", "white");
            $(this).css("border-color", "#FFFFFF");
            var selectedSegmentNumber = $(this).closest('.rv-segment').attr("segmentnr");
            var selectedSlotNumber = $(this).closest('.rv-slot').attr('slotnr');

            if (!uiUtilities.xs()) {
                $(this).closest('.rv-slot').css("border-color", "#496C85");

                //console.log(' selectedSegmentNumber' + selectedSegmentNumber + "segmentNum" + segmentNumber + "slot" + selectedSlotNumber);
                if (popupSegmentOpened == true && selectedSegmentNumber == segmentNumber && selectedSlotNumber == slotNumber) {
                    popupSegmentOpened = false;
                } else {
                    $(this).css("border-color", "#496C85");
                    var opt = {"font-weight": "bold", "color": "#496C85"};
                    $(this).closest('.rv-segment').children(".segment-times").css(opt);
                    // drawRoutePath
                    drawTravelResults.generateSegmentPopup(selectedSlotNumber, selectedSegmentNumber, $(this));

                    popupSegmentOpened = true;
                    segmentNumber = selectedSegmentNumber;
                    slotNumber = selectedSlotNumber;
                }
            } else {
                var selectedSlot = $(this).closest('.rv-slot');
                if (slotOpenedForXS != true) {
                    slotOpenedForXS = true;
                    // show slot and map
                    $('.rv-slot').hide(); // hide all
                    selectedSlot.show(); // show only the selected one
                    $("#rv-map_canvas").insertAfter(selectedSlot); // TODO: Urgent find solution here, insertAfter can be used if the code is already exist
                    // as our code always are updated, the clone of the rvmap should be held on the web site. In other words at each request we need to
                    // create a new map
                    $("#rv-map_canvas").show();
                    google.maps.event.trigger(rvMap, 'resize');
                    var ids = [];
                    selectedSlot.find('.rv-segment').each(function () {
                        ids.push($(this).attr('segmentnr')); // ids.push(this.id) would work as well.
                    });
                    drawTravelResults.generateSegmentPopup(selectedSlot.closest('.rv-slot').attr('slotnr'), selectedSlot.closest('.rv-segment').attr("segmentnr"), selectedSlot);
                } else {
                    slotOpenedForXS = false;
                    var effected = selectedSlot.next().next();
                    var res = $(effected).is(':visible');
                    $('.rv-slot').fadeIn();// show all slots
                    $("#rv-map_canvas").hide();
                }
            }
        });


        var slotOpenedForXS = false;
        $('.rv-slot').css("border-color", "white");

        $('.rv-slot').on('click', function (event) {
            if (uiUtilities.xs()) {
                if (slotOpenedForXS != true) {
                    slotOpenedForXS = true;
                    // show slot and map
                    $('.rv-slot').hide(); // hide all
                    $(this).show(); // show only the selected one
                    $("#rv-map_canvas").insertAfter(this); // TODO: Urgent find solution here, insertAfter can be used if the code is already exist
                    // as our code always are updated, the clone of the rvmap should be held on the web site. In other words at each request we need to
                    // create a new map
                    $("#rv-map_canvas").show();
                    google.maps.event.trigger(rvMap, 'resize');

                    var ids = [];

                    $(this).find('.rv-segment').each(function () {
                        ids.push($(this).attr('segmentnr')); // ids.push(this.id) would work as well.
                    });
                    drawTravelResults.generateSegmentPopup($(this).closest('.rv-slot').attr('slotnr'), $(this).closest('.rv-segment').attr("segmentnr"), $(this));
                } else {
                    slotOpenedForXS = false;
                    var effected = $(this).next().next();
                    var res = $(effected).is(':visible');
                    $('.rv-slot').fadeIn();// show all slots
                    $("#rv-map_canvas").hide();
                }
                // draw paths,
                //drawTravelResults.drawRoutePath($(this).attr('slotnr'));//TODO: Draw all segments

            }
            $('.rv-slot').css("border-color", "white"); //
            $(this).css("border-color", "#496C85");
            drawTravelResults.drawRoutePath($(this).attr('slotnr'));//TODO: Send all segments

        });

        $('.rv-rater').jRater({
            imagePath: appContext + '/images/resultview/'
        });
        $(".rv-dougnuth-wrapper").css("overflow", "visible");
        $('.rv-rater').click(function (event) {
            event.stopPropagation();
            if (xs()) {
                if (!$(this).children('.rv-dougnuth-wrapper').is(":visible")) {
                    $(this).children('.rv-dougnuth-wrapper').animate({width: 'toggle'}, 350,function(){
                        $(this).parent().children('.rv-dougnuth-wrapper').css("overflow", "visible");
                        $('.dougnuts-all').children().tooltip({trigger: 'manual'}).tooltip('show');
                    });
                    $(this).children('.rv-dougnuth-wrapper').css("opacity", "1");
                } else {
                    $(this).children('.rv-dougnuth-wrapper').animate({width: 'toggle'}, 350);
                }

            }
        });
        this.showResultNavButton();
    },
    showResultNavButton: function () {
        $(".header-button").show();
    }
};
