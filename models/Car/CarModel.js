const mongoose = require("mongoose");

const CarSchema = mongoose.Schema({

   
    name:{
       type: String,
        require:true
    },
    location:{
       type: String,
        require:true
    },
    carnum:{
       type: String,
        require:true
    },

    region:{
        type: String,
        require:true
    }, 
    town:{
        type: String,
        require:true
    }, 

    phone:{
        type:String,
        require:true
    },

    carpic:{
        type:String,
        default:""
    },
    views:{
        type:String,
        default:6
    },
   
    driverpic:{
        type:String,
        default:""
    },


    author: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    dateCreated:{
        type:Date, 
        default: Date.now 
    },
    approved: {
        type: Boolean,
        default: false
      }
})


exports.Car = mongoose.model("cars", CarSchema)
