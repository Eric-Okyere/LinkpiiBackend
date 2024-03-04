const mongoose = require("mongoose");

const MyTime = mongoose.Schema({
    startTime: {
    type: String,
    default: ""
  },
  endTime: {
    type: String,
    default: ""
  },
  totalTimeSpent: {
    type: String,
    default: ""
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

MyTime.set('toJSON', {
  virtuals: true
});

exports.MyTime = mongoose.model("MyTime", MyTime);

