const mongoose = require("mongoose");

const categorymechanicsSchema = mongoose.Schema({
   
    name: {
        type:String,
        require:true
    },
    picture: {
        type:String,
    },
})

exports.Mechacates = mongoose.model("mechanicscats", categorymechanicsSchema)
