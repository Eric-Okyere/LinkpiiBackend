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
  condition: {
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
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CategoryFashion',
    required: true
  },
  phone: {
    type: String,
    require: true
  },
  discount: {
    type: String,
    default: ""
  },  
  picture: {
    type: String,
    default: ""
  },
  picturesec: {
    type: String,
    default: ""
  },
  video: {
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
  }],
  commentsec: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
 
});

EmployeeSchema.set('toJSON', {
  virtuals: true
});

exports.Product = mongoose.model("Fashion", EmployeeSchema);
