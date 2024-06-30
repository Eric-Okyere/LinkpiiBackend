const mongoose = require("mongoose");

const equipmentSchema = mongoose.Schema({
   
    name: {
        type:String,
        require:true
    },
    picture: {
        type:String
    }
})

exports.Equipments = mongoose.model("equipments", equipmentSchema)
