const mongoose = require("mongoose");

const Airtel = mongoose.Schema({
   
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

exports.Airtel = mongoose.model("Airtel", Airtel)
