const mongoose = require("mongoose");

const ShopsCat = mongoose.Schema({
   
    name: {
        type:String,
        require:true
    },
    picture: {
        type:String,
      
    },
})

exports.Shops = mongoose.model("ShopsCat", ShopsCat)
