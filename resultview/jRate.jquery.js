
(function($) {
	$.fn.jRater = function(op) {
		
        var defaults = {
            /*Background image properties*/
            size:'32',                  // the size of the star
            bgColor:'default',          // background color, the relevant image is selected from the directory
            imagePath:'../images/',   // place where background images are stored
            
            /*Rate layer properties*/
            rateRotation:'downToUp',    // shows how the star will be filled
                                        // options: downToUp, upToDown, leftToRight, rightToLeft
            rateColor:'#6587A8',        // indicate the fill color (inner color of the star)
            
            /*Info Label*/              
			showRateInfo: false,         // enable the information label
            infoPlace:'bottom',         // specify the place of the info label
                                        // optons: top, right, bottom, left 
            distanceToInfo:'20px',      // distance to the information label 
            infoColor:'black',          // color of the information label
            infoSize:'9pt'              // size of the information label
		};
        
		return this.each(function() {
			var opts = $.extend(defaults, op);
			var maxHeight = opts.size-1;
            var maxWidth = opts.size;
            var path=opts.imagePath+opts.size+'_'+opts.bgColor+".png";
            var average = parseFloat($(this).attr('data-percentage')); // get the average of all rates
            bgStar =
                    $('<div>',
                    {
                        'class' : 'bg-star',
                        css:{
                            position:'relative',
                            width:maxWidth-1,
                            height:maxHeight-1,
                            backgroundColor:'#FFF',
                            zIndex:0
                        }
                    }).appendTo($(this));

            switch(opts.rateRotation){
               case "downToUp":
//                   console.log("INCOMING % ->"+average);
                    formRating(maxWidth-2,(average*maxHeight)/100,'','','0','');
                    break;
               case "leftToRight":
                    formRating((average*maxWidth)/100,maxHeight-2 ,'','','','0');
                    break;
               case "upToDown":
                   formRating(maxWidth-2,(average*maxHeight)/100,'0','','','');
                    break;
               case "rightToLeft":
                    formRating((average*maxWidth)/100,maxHeight-2,'','0','','');
                    break;    
            }
            formStar();
            if (opts.showRateInfo){
               switch(opts.infoPlace) {
                    case 'bottom':
                       formInfo('','','-'+opts.distanceToInfo,'');
                       break;
                    case 'top':
                       formInfo('-'+opts.distanceToInfo,'','','');
                        break;
                    case 'left':
                       formInfo('','','','-'+opts.distanceToInfo);
                       break;
                    case 'right':
                       formInfo('','-'+opts.distanceToInfo,'','');
                       break;
               }
            }
            
            
            function formRating(width,height,top,right,bottom,left){
                inner =
                        $('<div>',
                        {
                            'class' : 'inner',
                            css:{
                                zIndex:2,
                                backgroundColor:opts.rateColor,
            					width:width,
                                height:height-4,// TODO:
                                bottom:bottom+'px',
                                left:left +'px',
                                right:right+'px',
                                top:top +'px',
                                position:'absolute'
                            }
                        }).appendTo(bgStar);
            };
            
            function formStar(){
                star =
                $('<div>',
                {
                    'class' : 'star',
                    css:{
                        zIndex:3,
                        position:'absolute',
                        top:'0',
                        background: 'url('+path+') no-repeat',
                        width:'100%',
                        height:maxHeight
                    }
                }).appendTo(bgStar);
            }
            
            function formInfo(top,right,bottom,left){
                 info =
                        $('<div>',
                        {
                            'class' : 'info',
                            css:{
                                zIndex:4,
            					width:maxWidth,
                                bottom:bottom,
                                left:left,
                                right:right,
                                top:top,
                                textAlign:'center',
                                position:'absolute'
                            }
                        }).appendTo(bgStar);
                
                infoLabel =
                        $('<div>',
                        {
                            'class' : 'infoLabel',
                            css:{
                                color:opts.infoColor,
                                fontWeight:'bold',
                                fontSize:opts.infoColor
                            }
                        }).appendTo(info);
                $(infoLabel).html(average+'%');
            }
		});
	}
})(jQuery);