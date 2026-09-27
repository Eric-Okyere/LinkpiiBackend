const Notification = require("../models/Notification/Notification");

/**
 * Records a site-wide notification that the web app's notification bell
 * polls for. Every logged-in user sees it - there's no per-user targeting,
 * since this is meant for "a new listing just went live" style announcements.
 *
 * Never throws - a failure to save a notification should never break the
 * request (e.g. an admin approving a listing) that triggered it.
 */
async function notifyWebUsers({ title, body, type, itemId }) {
  try {
    await Notification.create({ title, body, type, itemId });
  } catch (error) {
    console.error("Error creating web notification:", error);
  }
}

module.exports = { notifyWebUsers };
