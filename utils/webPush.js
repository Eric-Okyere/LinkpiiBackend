const webpush = require("web-push");
const PushSubscription = require("../models/PushSubscription/PushSubscription");

const vapidConfigured = Boolean(
  process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
);

if (vapidConfigured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:linkpiiapp@gmail.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.error(
    "Web Push not configured: set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY env vars."
  );
}

/**
 * Sends a real phone push notification - shown by the OS with its default
 * notification sound, even if the site isn't open - to every subscribed
 * browser/device. Broadcast-only: there's no per-user targeting, matching
 * notifyWebUsers()'s in-app bell that this runs alongside.
 *
 * Never throws - a failed or partial push send should never break the
 * request (e.g. an admin approving a listing) that triggered it.
 */
async function sendPushToAll({ title, body, type, itemId }) {
  if (!vapidConfigured) return;

  const subscriptions = await PushSubscription.find();
  if (subscriptions.length === 0) return;

  const payload = JSON.stringify({ title, body, type, itemId });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload
        );
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          // Browser revoked/expired this subscription - stop trying it.
          await PushSubscription.deleteOne({ _id: sub._id }).catch(() => {});
        } else {
          console.error("Push send error:", error.statusCode, error.body);
        }
      }
    })
  );
}

module.exports = { sendPushToAll };
