const mongoose = require("mongoose");

const ShopsCat = mongoose.Schema({
   
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
      }
})

exports.Shops = mongoose.model("ShopsCat", ShopsCat)
