if (typeof jQuery !== 'undefined') {
    (function ($) {
//        $('#spinner').ajaxStart(function () {
//            $(this).fadeIn();
//        }).ajaxStop(function () {
//            $(this).fadeOut();
//        });
        $(document).bind("ajaxSend", function(){
            $("#spinner").fadeIn();
        }).bind("ajaxComplete", function(){
            $("#spinner").fadeOut();
        });
    })(jQuery);
}
