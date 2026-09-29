const express = require("express");
const router = express.Router();
const webpush = require("web-push");
const PushSubscription = require("../models/PushSubscription/PushSubscription");

// TEMPORARY, secret-protected diagnostic endpoint - not linked from
// anywhere in the app. Remove this file and its require/app.use lines in
// index.js once phone push notifications are confirmed working.
//
// GET /admin/push-diagnostics?key=SECRET
//   -> reports whether VAPID is configured and how many devices are
//      subscribed, without sending anything.
// GET /admin/push-diagnostics?key=SECRET&test=1
//   -> also sends a real test push to every subscribed device.
const ADMIN_SECRET = "7f2c6cb055a0ea709b7af8c0e8301b2a13626b19c82d206a";

router.get("/push-diagnostics", async (req, res) => {
  if (req.query.key !== ADMIN_SECRET) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const vapidConfigured = Boolean(
    process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
  );

  const subscriptions = await PushSubscription.find();

  const result = {
    success: true,
    vapidConfigured,
    vapidPublicKeyPresent: Boolean(process.env.VAPID_PUBLIC_KEY),
    vapidPrivateKeyPresent: Boolean(process.env.VAPID_PRIVATE_KEY),
    vapidSubject: process.env.VAPID_SUBJECT || "(not set - defaults to mailto:linkpiiapp@gmail.com)",
    subscriptionCount: subscriptions.length,
    subscriptions: subscriptions.map((s) => ({
      id: s._id,
      endpointHost: (() => {
        try {
          return new URL(s.endpoint).host;
        } catch (e) {
          return "invalid endpoint";
        }
      })(),
      createdAt: s.createdAt,
    })),
  };

  if (req.query.test === "1") {
    if (!vapidConfigured) {
      result.testSkipped = "VAPID not configured - nothing sent.";
      return res.json(result);
    }
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:linkpiiapp@gmail.com",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const payload = JSON.stringify({
      title: "🔔 Test push from Linkpii",
      body: "If you see this, phone push notifications are working!",
      type: "test",
      itemId: null,
    });

    const testResults = await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            payload
          );
          return { id: sub._id, status: "sent" };
        } catch (error) {
          return {
            id: sub._id,
            status: "failed",
            statusCode: error.statusCode,
            message: error.body || error.message,
          };
        }
      })
    );
    result.testResults = testResults;
  }

  res.json(result);
});

module.exports = router;
