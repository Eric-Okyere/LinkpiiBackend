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
  }

});

EmployeeSchema.set('toJSON', {
  virtuals: true
});

exports.Product = mongoose.model("employee", EmployeeSchema);
