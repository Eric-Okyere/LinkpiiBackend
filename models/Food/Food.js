const mongoose = require("mongoose");

const FoodSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  description: {
    type: String,
    require: true
  },
  foodtypes: {
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
 rating: { type: Number, default: 0 },

  whatsapp: {
    type: String,
    default: ""
  },
  latitude: {
  type: Number,
  required: false
},
longitude: {
  type: Number,
  required: false
},
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodCats',
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
  video: {
    type: String,
    default: ""
  },
  boost: {
    type: Boolean,
    default: false
  },
    numofBoost: {
    type: Number,
    default: 0
  },
   dateBoost:{
    type:Date,
    default:Date.now
  },
    hot: {
    type: Boolean,
    default: false
  },
  openingTime: { type: String, default: "" },
  closingTime: { type: String, default: "" },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Foodcomment'
  }]
});

FoodSchema.set('toJSON', {
  virtuals: true
});

exports.Food = mongoose.model("Food", FoodSchema);
