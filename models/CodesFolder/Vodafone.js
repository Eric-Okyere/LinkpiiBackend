const mongoose = require("mongoose");

const Vodafone = mongoose.Schema({
   
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

exports.Vodafone = mongoose.model("Vodafone", Vodafone)
