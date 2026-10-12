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
    pagename:{
       type: String,
        default:""
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
    // Captured client-side (navigator.geolocation) at the moment the
    // user taps "Call" on any listing, so admin/driver can be given
    // the caller's exact position. Optional - the browser permission
    // may be denied.
    userlocation: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
    },
})

exports.Call = mongoose.model("call", CallSchema)
