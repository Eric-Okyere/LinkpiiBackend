const mongoose = require("mongoose");

const categoryMechSchema = mongoose.Schema({
   
    name: {
        type:String,
        require:true
    },
    picture: {
        type:String,
      
    },
})

exports.Products = mongoose.model("newmechcats", categoryMechSchema)
