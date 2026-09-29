const express = require("express");
const router = express.Router();
const PushSubscription = require("../models/PushSubscription/PushSubscription");

// Save (or refresh) a browser's Web Push subscription so it starts
// receiving phone notifications - e.g. "a new listing was approved".
// Body: the raw PushSubscription object from the browser's
// pushManager.subscribe() call: { endpoint, keys: { p256dh, auth } }.
router.post("/subscribe", async (req, res) => {
  try {
    const { endpoint, keys } = req.body || {};
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ success: false, message: "Invalid subscription" });
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { endpoint, keys },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Stop sending push notifications to this browser (e.g. the user turned
// notifications off, or the subscription is being replaced).
router.post("/unsubscribe", async (req, res) => {
  try {
    const { endpoint } = req.body || {};
    if (!endpoint) {
      return res.status(400).json({ success: false, message: "endpoint is required" });
    }
    await PushSubscription.deleteOne({ endpoint });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error removing push subscription:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
