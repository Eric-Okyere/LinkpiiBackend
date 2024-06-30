const mongoose = require("mongoose");

const CallSchema = mongoose.Schema({

   
    name:{
       type: String,
        require:true
    },
    email:{
       type: String,
        require:true
    },
    phone:{
       type: String,
        require:true
    },

    receiverphone:{
        type: String,
        require:true
    }, 
    recname:{
        type: String,
        require:true
    }, 
    dateCreated:{
        type:Date, 
        default: Date.now 
      },
})

exports.Call = mongoose.model("call", CallSchema)
