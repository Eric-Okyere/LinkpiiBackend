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
  video: {
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
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  commentsec: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  viewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shopviewers'
  }]
});

ShopSchema.set('toJSON', {
  virtuals: true
});

exports.Shops = mongoose.model("Shops", ShopSchema);
