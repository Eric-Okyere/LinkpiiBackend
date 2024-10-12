const mongoose = require("mongoose");

const RequestSchema = mongoose.Schema({
    phone:{
       type: String,
        require:true
    },
    usermessage:{
       type: String,
        def:""
    },
    dateCreated:{
        type:Date, 
        default: Date.now 
      },
})

exports.Reqt = mongoose.model("request", RequestSchema)
