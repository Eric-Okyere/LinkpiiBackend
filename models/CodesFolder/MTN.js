const mongoose = require("mongoose");

const MTN = mongoose.Schema({
   
    name: {
        type:String,
        require:true
    },
    code: {
        type:String,
        require:true
    },
    dateCreated: {
        type: Date,
        default: Date.now
      }
})

exports.MTN = mongoose.model("MTN", MTN)
