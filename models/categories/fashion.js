const mongoose = require("mongoose");

const categoryFashionSchema = mongoose.Schema({
   
    name: {
        type:String,
        require:true
    },
    picture: {
        type:String,
      
    },
    dateCreated: {
        type: Date,
        default: Date.now
      },
})

exports.Products = mongoose.model("CategoryFashion", categoryFashionSchema)
