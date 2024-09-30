const mongoose= require("mongoose");

const BoostPost = mongoose.Schema({
    productname:{
        type:String,
        default:""
    },
    pagename:{
        type:String,
        default:""
    },
    dateCreated:{
        type:Date, 
        default: Date.now 
    }
})

exports.Boost = mongoose.model("boost", BoostPost)