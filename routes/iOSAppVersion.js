const express = require('express');
const { getAppVersion, updateAppVersion, createAppVersion } = require('../controllers/iOSAppVersion');
const router = express.Router();


// Route to fetch the latest app version
router.get('/', getAppVersion);

router.post('/', createAppVersion);

// Route to update the app version using a PUT request
router.put('/:id', updateAppVersion);

module.exports = router;