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
driverphone:{
    type:String,
    required:true
},
time:{
    type:String,
    required:true
},
datepick:{
    type:String,
    require:true
},
region:{
    type:String,
    required:true
}, 
location:{
    type:String,
    required:true
},
deslocation:{
    type:String,
    required:true
},
desregion:{
    type:String,
    required:true
},
userlocation: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
date:{
    type:Date,
    default: Date.now
}

})
module.exports = mongoose.model('Carappointment', AppontmentShema);