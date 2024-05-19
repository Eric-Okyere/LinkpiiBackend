const mongoose = require("mongoose");

const MechanicsSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  services: {
    type: String,
    require: true
  },
  region: {
    type: String,
    require: true
  },
  town: {
    type: String,
    require: true
  },
  whatsapp: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    require: true
  },
 
  phone: {
    type: String,
    require: true
  },
  picture: {
    type: String,
    default: ""
  },
  servpic: {
    type: String,
    default: ""
  },
  views: {
    type: String,
    default: 6
  },
  
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  approved: {
    type: Boolean,
    default: false
  }

});

MechanicsSchema.set('toJSON', {
  virtuals: true
});

exports.Mechanics = mongoose.model("Mechanics", MechanicsSchema);
