const mongoose = require("mongoose");

// A single browser/device's Web Push subscription. Broadcast-only for now
// (see utils/webPush.js) - every stored subscription gets every
// notification, so there's no userId here, just the endpoint the browser
// gave us plus the encryption keys web-push needs to address it.
const PushSubscriptionSchema = mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("pushsubscriptions", PushSubscriptionSchema);
