const mongoose = require("mongoose");

// A single site-wide announcement shown to every user on the web app (the
// notification bell in the navbar). Created automatically whenever an
// admin approves a listing - never on submission, since an unapproved
// listing isn't visible to anyone yet.
const NotificationSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "product",
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("notifications", NotificationSchema);
