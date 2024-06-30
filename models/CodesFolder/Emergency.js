const mongoose = require("mongoose");

const Emegency = mongoose.Schema({
   
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

exports.Emegency = mongoose.model("Emegency", Emegency)
