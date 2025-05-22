const iOSAppVersion = require('../models/iOSAppVersion');

// Create a new app version
exports.createAppVersion = async (req, res) => {
  const { latestVersion, updateMessage } = req.body;

  // Validate request body
  if (!latestVersion || !updateMessage) {
    return res.status(400).json({ message: 'Both latestVersion and updateMessage are required.' });
  }

  try {
    // Create a new app version document
    const newAppVersion = new iOSAppVersion({ latestVersion, updateMessage });
    await newAppVersion.save();

    res.status(201).json({
      message: 'App version created successfully.',
      data: newAppVersion,
    });
  } catch (error) {
    console.error('Error creating app version:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Other existing functions...
exports.getAppVersion = async (req, res) => {
  try {
    const appVersion = await iOSAppVersion.findOne().sort({ _id: -1 });
    if (!appVersion) {
      return res.status(404).json({ message: 'No app version data found.' });
    }

    res.status(200).json({
      _id: appVersion._id,
      latestVersion: appVersion.latestVersion,
      updateMessage: appVersion.updateMessage,
      __v: appVersion.__v,
    });
  } catch (error) {
    console.error('Error fetching app version:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};



exports.updateAppVersion = async (req, res) => {
  const { id } = req.params;
  const { latestVersion, updateMessage } = req.body;

  if (!latestVersion || !updateMessage) {
    return res.status(400).json({ message: 'Both latestVersion and updateMessage are required.' });
  }

  try {
    const updatedAppVersion = await iOSAppVersion.findByIdAndUpdate(
      id,
      { latestVersion, updateMessage },
      { new: true, runValidators: true }
    );

    if (!updatedAppVersion) {
      return res.status(404).json({ message: 'App version not found.' });
    }

    res.status(200).json({
      message: 'App version updated successfully.',
      data: updatedAppVersion,
    });
  } catch (error) {
    console.error('Error updating app version:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
const AppVersion = require('../models/AppVersion');

// Create a new app version
exports.createAppVersion = async (req, res) => {
  const { latestVersion, updateMessage } = req.body;

  // Validate request body
  if (!latestVersion || !updateMessage) {
    return res.status(400).json({ message: 'Both latestVersion and updateMessage are required.' });
  }

  try {
    // Create a new app version document
    const newAppVersion = new iOSAppVersion({ latestVersion, updateMessage });
    await newAppVersion.save();

    res.status(201).json({
      message: 'App version created successfully.',
      data: newAppVersion,
    });
  } catch (error) {
    console.error('Error creating app version:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Other existing functions...
exports.getAppVersion = async (req, res) => {
  try {
    const appVersion = await iOSAppVersion.findOne().sort({ _id: -1 });
    if (!appVersion) {
      return res.status(404).json({ message: 'No app version data found.' });
    }

    res.status(200).json({
      latestVersion: appVersion.latestVersion,
      updateMessage: appVersion.updateMessage,
    });
  } catch (error) {
    console.error('Error fetching app version:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.updateAppVersion = async (req, res) => {
  const { id } = req.params;
  const { latestVersion, updateMessage } = req.body;

  if (!latestVersion || !updateMessage) {
    return res.status(400).json({ message: 'Both latestVersion and updateMessage are required.' });
  }

  try {
    const updatedAppVersion = await iOSAppVersion.findByIdAndUpdate(
      id,
      { latestVersion, updateMessage },
      { new: true, runValidators: true }
    );

    if (!updatedAppVersion) {
      return res.status(404).json({ message: 'App version not found.' });
    }

    res.status(200).json({
      message: 'App version updated successfully.',
      data: updatedAppVersion,
    });
  } catch (error) {
    console.error('Error updating app version:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
