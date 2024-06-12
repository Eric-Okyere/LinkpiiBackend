const mongoose = require("mongoose");

const buildcategorySchema = mongoose.Schema({
   
    name: {
        type:String,
        require:true
    },
    picture: {
        type:String,
        
      
    }
})

exports.Buildingcats = mongoose.model("Buildingcats", buildcategorySchema)
