const mongoose = require('mongoose');

const AppVersionSchema = new mongoose.Schema({
  latestVersion: { type: String, required: true },
  updateMessage: { type: String, required: true },
});

module.exports = mongoose.model('AppVersion', AppVersionSchema);
