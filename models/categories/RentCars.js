const mongoose = require("mongoose");

const rentcarscategorySchema = mongoose.Schema({
   
    name: {
        type:String,
        require:true
    },
    picture: {
        type:String,
        
      
    }
})

exports.Rentcarscats = mongoose.model("Rentcarscats", rentcarscategorySchema)
