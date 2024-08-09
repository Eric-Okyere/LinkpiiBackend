const mongoose = require("mongoose");

const MechanicsSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  fullname: {
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
  card: {
    type: String,
    require: true
  },
  town: {
    type: String,
    require: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mechanicscats',
    required: true
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
  propicture: {
    type: String,
    default: ""
  },
  // servpic: {
  //   type: String,
  //   default: ""
  // },
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
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]

});

MechanicsSchema.set('toJSON', {
  virtuals: true
});

exports.Mechanics = mongoose.model("Mechanics", MechanicsSchema);
