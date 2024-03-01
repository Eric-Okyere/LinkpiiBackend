const mongoose = require("mongoose")
// const {Schema} = mongoose;


const userSchema = mongoose.Schema({
    name:String,
    email:{type:String, unique:true},
    password:String,
    products:[{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "employee",
        }
    }]
})
exports.User = mongoose.model("User", userSchema)
exports.userSchema= userSchema;
