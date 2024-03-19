const mongoose = require("mongoose");

const Servicescategories = mongoose.Schema({
   
    name: {
        type:String,
        require:true
    },
    picture: {
        type:String,
      
    },
})

exports.Servicescat = mongoose.model("Servicescategories", Servicescategories)
