const mongoose = require("mongoose");

const ShopSchema = mongoose.Schema({
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
  location: {
    type: String,
    require: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopsCat',
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
  whatsapp: {
    type: String,
    default: ""
  },
  views: {
    type: Number,
    default: 6
  },
  boost: {
    type: Boolean,
    default: false
  }
});

ShopSchema.set('toJSON', {
  virtuals: true
});

exports.Shops = mongoose.model("Shops", ShopSchema);
