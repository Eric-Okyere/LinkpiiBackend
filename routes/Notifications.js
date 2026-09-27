const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification/Notification");

// Latest site-wide notifications for the web app's notification bell,
// newest first. The frontend polls this and figures out "unread" itself
// (it remembers the newest id/time it has already shown).
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
