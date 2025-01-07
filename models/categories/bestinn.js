const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
   
    name: {
        type:String,
        require:true
    },
    icon: {
        type:String,
      
    },
})

exports.Bestcate = mongoose.model("Bestcategories", categorySchema)
