const mongoose = require("mongoose");

const EmployeeSchema = mongoose.Schema({
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
    ref: 'Servicescategories',
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
  video:{
    type:String,
    default:""
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
  whatsapp: {
    type: String,
    default: ""
  },
  boost: {
    type: Boolean,
    default: false
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  rating: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, 
    score: { type: Number, required: true, min: 1, max: 5 } 
  }],
  averageRating: {
    type: Number,
    default: 0, 
    min: 0,
    max: 5
  }

});

EmployeeSchema.set('toJSON', {
  virtuals: true
});

exports.Services = mongoose.model("Services", EmployeeSchema);
