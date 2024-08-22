const mongoose = require("mongoose");

const sparePartsCategoriesSchema = mongoose.Schema({
   
    name: {
        type:String,
        require:true
    },
    picture: {
        type:String,
      
    },
})

exports.Products = mongoose.model("SparepartsCategories", sparePartsCategoriesSchema)
