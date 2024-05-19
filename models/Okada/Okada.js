const mongoose = require("mongoose");

const OkadaSchema = mongoose.Schema({

   
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
    card:{
        type:String,
        require:true
    },
    whatsapp: {
        type: String,
        default: ""
      },

    carpic:{
        type:String,
        default:""
    },
    driverpic:{
        type:String,
        default:""
    },
   
    view:{
        type:Number,
        default:6
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


exports.Okada = mongoose.model("okada", OkadaSchema)
