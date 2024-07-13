// routes/commentRoutes.js

const express = require('express');
const { analyzeComment } = require('./commentController');
const router = express.Router();

router.post('/analyze', analyzeComment);

module.exports = router;
