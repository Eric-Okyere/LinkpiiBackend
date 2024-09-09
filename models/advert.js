const mongoose = require("mongoose");

const Advert = mongoose.Schema({
  name: {
    type: String,
    default: ""
  },
  phone:{
    type:String,
    default:""
  },
  whatsapp:{
    type:String,
    default:""
  },
  picture: {
    type: String,
    default: ""
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

Advert.set('toJSON', {
  virtuals: true
});

exports.Advert = mongoose.model("Avdert", Advert);
