const mongoose = require("mongoose");

const categoryFashionSchema = mongoose.Schema({
   
    name: {
        type:String,
        require:true
    },
    picture: {
        type:String,
      
    },
})

exports.Products = mongoose.model("CategoryFashion", categoryFashionSchema)
