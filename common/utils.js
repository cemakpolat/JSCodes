
/**
 * Represents the util functions
 * @class
 * @author Cem Akpolat
 */

/**
 * Global Definitions
 */

/*
 *  If you want leading zero's for values < 10, use this number extension
 */
//console.log("utils.js is called");
Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}


var utils = {
    /**
     *
     * @param {Target} target - The title of the book.
     */
    init : function() {
    },
    /**
     *
     *function returning an one hour offset Date from current time if there are already targets in list
     */
    autoFromTime : function(){
        var date = new Date();
        if(targetList.length > 0){
            date = new Date(targetList[targetList.length - 1].selectedTime.getTime());
            date.setHours(date.getHours() + 2);
        }
        return date;
    },
    /**
     *
     * Return time only in hour and time format
     */
    getOnlyHourMinutes:function(){
        var date=new Date();
        //new Date(year, month, day [, hour, minute, second, millisecond ])
        var hour="";
        var min="";
        if(targetList.length > 0){
            var hour= targetList[targetList.length - 1].selectedTime.substring(0,2);
            var min= targetList[targetList.length - 1].selectedTime.substring(3,5);
            date.setHours(hour);
            date.setMinutes(min);

            date.setHours(date.getHours() + 1);
        }
        // var dateInString=date.toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")
        return date.toLocaleTimeString();//.replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
    },
    /**
     * Return the given time in milliseconds
     * @param {Target} target - The target object containing the time object.
     */
    getTimeInMilliSeconds:function(target){
        var _timestamp = 0;
        if(target != null && target.selectedTime != null && target.selectedDate != null) {
            _timestamp = new Date(target.selectedDate);
            _timestamp = _timestamp.getTime();	//set timestamp
            var _tmp = new Date(_timestamp);
        }
        return _timestamp
    },
    getParameterByName:function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" :
            decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    /**
     * Extract the parameter from the given url
     * @param {string} string
     */
    get_url_param : function( name ) {
        name=decodeURIComponent(name)
        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");

        var regexS = "[\\?&]"+name+"=([^&#]*)";
        var regex = new RegExp( regexS );
        var results = regex.exec( window.location.href );

        if ( results == null )
            return "";
        else
            return results[1];
    },
    get_url_param_decode : function( name ) {

        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");

        var regexS = "[\\?&]"+name+"=([^&#]*)";
        var regex = new RegExp( regexS );
        var results = regex.exec( decodeURIComponent(window.location.href ));

        if ( results == null )
            return "";
        else
            return results[1];
    },
    /**
     *This is currently only needed for the title of the google maps markers as they dont convert the html special characters
     * this way the i18n messages can also be used for these titles
     * @param {string} text - The text to be altered
     */
    toUTF8 : function ( string ) {

        var result = string;
        result = result.replace("&Agrave;", "À");
        result = result.replace("&Aacute;", "Á");
        result = result.replace("&Eacute;", "É");
        result = result.replace("&Egrave;", "È");
        result = result.replace("&aacute;", "á");
        result = result.replace("&agrave;", "à");
        result = result.replace("&eacute;", "é");
        result = result.replace("&egrave;", "è");

        result = result.replace("&Ucirc;", "Û");
        result = result.replace("&ucirc;", "û");

        result = result.replace("&Uuml;", "Ü");
        result = result.replace("&uuml;", "ü");
        result = result.replace("&Auml;", "Ä");
        result = result.replace("&auml;", "ä");
        result = result.replace("&Ouml;", "Ö");
        result = result.replace("&ouml;", "ö");

        result = result.replace("&deg;", "°");

        return result;
    },

    /**
     *  Receive time and return in  23 h 23 min 30 s format
     * @param time
     * @returns {string}
     */
    convertHoursToString : function (time){
        var hours = Math.floor(time);
        var minutes = time%1 * 60;
        var seconds = Math.floor(minutes%1 * 60);
        minutes = Math.floor(minutes);
        if (hours>0) return hours + " h " + minutes + " min";
        if (minutes>0) return minutes + " min";
        return seconds + " s"
    },
    /**
     * The given object is cloned and return it back.
     * @param obj
     * @returns {*}
     */
    clone:function (obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    },
    /**
     * Seconds are converted to String TODO: Explain more
     * @param seconds
     * @returns {string}
     */
    secondsToString:function (seconds)
    {
        var numyears = Math.floor(seconds / 31536000);
        var numdays = Math.floor((seconds % 31536000) / 86400);
        var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
        var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
        var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
        return numyears + " years " +  numdays + " days " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";
    },
    getTimeDiffInMin:function(future,past){
        var fut = new Date(future);
        var pas=new Date(past);
        var diffMs = (fut - pas); // milliseconds between now & Christmas
        return Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

    },
    getTimeDiffInMillis:function(future,past){
        var fut = new Date(future);
        var pas=new Date(past);
        return (fut - pas); // milliseconds between now & Christmas
    },
    getTimeDiffInDays:function(future,past){
        var fut = new Date(future);
        var pas=new Date(past);
        var diffMs = (fut - pas); // milliseconds between now & Christmas
        return Math.round(diffMs / 86400000); // days
    },
    getTimeDiffInSec:function(future,past){
        var fut = new Date(future);
        var pas=new Date(past);
        return (fut - pas)/1000; // milliseconds between now & Christmas
    },
    getTimeDiffInHrs:function(future,past){
        var fut = new Date(future);
        var pas=new Date(past);
        var diffMs= (fut - pas); // milliseconds between now & Christmas
        return Math.round((diffMs % 86400000) / 3600000); // hours
    },

    /**
     * Get Current Date in dd:mm:yy hh:mm format
     * @returns {string}
     */
    getCurrentDate:function(){
        var d = new Date,
            dformat = [d.getDate().padLeft(),
                (d.getMonth()+1).padLeft(),
                d.getFullYear()].join('-')+
                ' ' +
                [d.getHours().padLeft(),
                    d.getMinutes().padLeft()].join(':');
        return dformat;
    },
    /**
     *
     * @param time
     * @returns {boolean}
     */
    isArrivalTimeAppropriate:function(time){
        var minArrivalTimeDifference=20;
        var currentTime=new Date();
        var timeDifference=time.getTime()-currentTime.getTime();
        //console.log("timeDiff->"+timeDifference);
        var numminutes = Math.floor((((timeDifference % 31536000) % 86400) % 3600) / 60);
        if(!(numminutes>=minArrivalTimeDifference)){
            return false;
        }
        return true;
    },
    formatTwoDigits:function(tNumb){
            var str = '' + tNumb;
            if (tNumb < 10)
            {
                str = '0' + tNumb;
            }
            return str;
        }

};
