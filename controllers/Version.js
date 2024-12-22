const express = require('express');
const Version = require('../models/Version');
const router = express.Router();

// GET: Fetch the latest version
router.get('/', async (req, res) => {
  try {
    const versionInfo = await Version.findOne();
    if (!versionInfo) {
      return res.status(404).json({ message: 'Version information not found' });
    }
    res.json(versionInfo);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST: Create or update version info
router.post('/', async (req, res) => {
  const { latestVersion, updateRequired } = req.body;

  try {
    // Check if version info already exists
    let versionInfo = await Version.findOne();

    if (versionInfo) {
      // Update existing version info
      versionInfo.latestVersion = latestVersion;
      versionInfo.updateRequired = updateRequired;
    } else {
      // Create new version info
      versionInfo = new Version({ latestVersion, updateRequired });
    }

    await versionInfo.save();
    res.json(versionInfo);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
