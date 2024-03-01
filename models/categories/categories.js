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

exports.Category = mongoose.model("Category", categorySchema)
