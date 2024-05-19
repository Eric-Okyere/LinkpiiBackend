const mongoose = require("mongoose");

const WhatsappSchema = mongoose.Schema({

   
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

exports.Whatsapp = mongoose.model("whatsapp", WhatsappSchema)
