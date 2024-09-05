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
    ref: 'Category',
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
  video: {
    type: String,
    default: ""
  },
  price: {
    type: String,
    default: 0
  },
  views: {
    type: String,
    default: 6
  },
  whatsapp: {
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

exports.Product = mongoose.model("employee", EmployeeSchema);
