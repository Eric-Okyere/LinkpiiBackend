const Notification = require("../models/Notification/Notification");
const { sendPushToAll } = require("./webPush");

/**
 * Records a site-wide notification that the web app's notification bell
 * polls for, AND sends a real phone push notification (OS default sound)
 * to every subscribed device. Every user sees/hears it - there's no
 * per-user targeting, since this is meant for "a new listing just went
 * live" style announcements.
 *
 * Never throws - a failure to save a notification or send a push should
 * never break the request (e.g. an admin approving a listing) that
 * triggered it.
 */
async function notifyWebUsers({ title, body, type, itemId }) {
  try {
    await Notification.create({ title, body, type, itemId });
  } catch (error) {
    console.error("Error creating web notification:", error);
  }

  try {
    await sendPushToAll({ title, body, type, itemId });
  } catch (error) {
    console.error("Error sending push notifications:", error);
  }
}

module.exports = { notifyWebUsers };
