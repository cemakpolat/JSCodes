
/**
 *
 *
 *@namespace
 * @author Cem Akpolat
 */
var BackendImitator={

    def:{
        _newPlanning:'',
        _secondNewPlanning:'',
        _oldPlanning:'',
        _list:'',
        _data:'',
        _totalItem:0,
        _lastUsedItemNumber:0,
        _totalTripForItem:'',
        _lastTripNumber:0,
        _newPlanningRequestTime:1 // after two item request, new planning will be sent
    },
    restart:function(){
//        this.def._oldPlanning=null;
//        this.def._newPlanning=null;
//        this.def._list=null;
//        this.def._data=null;
      this.init(this.def._newPlanning,this.def._secondNewPlanning);
    },
    init:function(currentPlanning, newPlanning,secondNewPlanning){

        // get the latest route
        this.def._oldPlanning=currentPlanning;
        var parser=new NEWPARSER(currentPlanning[0].data);

        parser.setRatings(currentPlanning[1]);
        var items=parser.getRawItemsForBI();

        //console.log(currentPlanning[0].data);
        //var parser=new NEWPARSER(currentPlanning.data);
        //var parser2=new NEWPARSER(newPlanning);
        //var newItems=parser2.getRawItems();
        //console.log(newItems)

        this.def._data=items;
        this.def._newPlanning=newPlanning;
        this.def._secondNewPlanning=secondNewPlanning;

        this.def._list=new Array();

        this.def._totalItem= items.length;

        this.def._totalTripForItem=new Array();

        for(var i=0;i< items.length;i++){

            var temp= items[i];
            //console.log(temp);
            var tripPoints=new Array();

            for(var j=0;j<temp.tripPoints.length;j++){
                var trip={
                    lat:temp.tripPoints[j].Ax1.geoLocation.Ax1.latitude,
                    lng:temp.tripPoints[j].Ax1.geoLocation.Ax1.longitude
                };
                tripPoints.push(trip);
            }

            this.def._totalTripForItem.push(temp.tripPoints.length);

            var temp1={
                type:temp.type,
                line:temp.line,
                startPosition:{
                    lat:temp.startPosition.Ax1.geoLocation.Ax1.longitude,
                    lng:temp.startPosition.Ax1.geoLocation.Ax1.latitude
                },
                endPosition:{
                    lat:temp.endPosition.Ax1.geoLocation.Ax1.longitude,
                    lng:temp.endPosition.Ax1.geoLocation.Ax1.latitude
                },
                startDate:temp.startDate.Ax1.date,
                endDate:temp.endDate.Ax1.date,
                tripPoints:tripPoints

            };
            //console.log(temp+" "+  this.def._totalTripForItem.length);
            this.def._list.push(temp1);
        }
//       console.log("BIMATOR:"+this.def._list.length);
    },

    getGPSData:function() {

//       if (BackendImitator.def._lastUsedItemNumber < BackendImitator.def._totalTripForItem.length) {

            var lastNumber = BackendImitator.def._totalTripForItem[BackendImitator.def._lastUsedItemNumber];
//            console.log("GPS item:"+BackendImitator.def._lastUsedItemNumber+" lastnumber:"+lastNumber);
            if (lastNumber == BackendImitator.def._lastTripNumber) {
                BackendImitator.def._lastUsedItemNumber++;
                this.def._lastTripNumber = 0;
            }
            var trip = BackendImitator.def._list[BackendImitator.def._lastUsedItemNumber].tripPoints[BackendImitator.def._lastTripNumber];
            this.def._lastTripNumber++;
            //console.log("TRIP:"+trip.lng+" "+trip.lat);
            //console.log("GPS item:"+BackendImitator.def._lastUsedItemNumber+" lastnumber:"+lastNumber+" tripNum:"+this.def._lastTripNumber );
            return trip;

//        }
    },
    getVehicleType:function(){
            return this.def._list[this.def._lastUsedItemNumber].type;
    },
    getNewPlanning:function(){
        var message={

            title:"REPLANNING",
//                plannings:this.def._newPlanning
            plannings:this.def._newPlanning[0].data,

            pratings:this.def._newPlanning[1].ratings,
            message:''
        }
        return message;
    },
    getAnyMessageFromMOT:function(){

        //console.log("Last item:"+this.def._lastUsedItemNumber);
      //  if(this.def._lastUsedItemNumber==this.def._newPlanningRequestTime){
        if(this.def._lastTripNumber==1){
            //console.log("Last item:"+this.def._lastUsedItemNumber);
            this.def._lastUsedItemNumber=0;
            //plans.push(this.def._secondNewPlanning);
            var message={

                title:"REPLANNING",
//                plannings:this.def._newPlanning
                plannings:this.def._newPlanning[0].data,

                ratings:this.def._newPlanning[1].ratings,
                message:''
            }
            return message; // return here new planning
        }else{
            var message={
                title:"FINE",
                plan:'',
                message:''
            }
            return message;
        }
         // return new planning
         //
    }
};







