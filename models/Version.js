const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema({
  latestVersion: { type: String, required: true },
  updateRequired: { type: Boolean, required: true },
});

module.exports = mongoose.model('Version', VersionSchema);
