const mongoose = require("mongoose");

const BuildingsSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  description: {
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
  amenities: {
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
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buildingcats',
    required: true
  },
  phone: {
    type: String,
    require: true
  },
  picture: {
    type: String,
    default: ""
  },
  picturesec: {
    type: String,
    default: ""
  },
  price: {
    type: String,
    default: 0
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
  views: {
    type: Number,
    default: 6
  },
  boost: {
    type: Boolean,
    default: false
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});

BuildingsSchema.set('toJSON', {
  virtuals: true
});

exports.Buildings = mongoose.model("Buildings", BuildingsSchema);
