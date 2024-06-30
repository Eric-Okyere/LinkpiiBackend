const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

exports.Comment = mongoose.model("Comment", CommentSchema);

