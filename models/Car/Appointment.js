const mongoose = require("mongoose");

const AppontmentShema = mongoose.Schema({
username:{
    type:String,
    required:true
},
userphone:{
    type:String,
    required:true
},
drivername:{
    type:String,
    required:true
},
drivername:{
    type:String,
    required:true
},
date:{
    type:Date,
    default: Date.now
}

})
module.exports = mongoose.model('Carappointment', AppontmentShema);