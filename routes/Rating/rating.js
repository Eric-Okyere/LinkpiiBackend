const express = require('express');
const router = express.Router();
const rating = require("../../controllers/rating")
const {getServiceRating, rateService} = require("../../controllers/rating")


// Route for submitting a rating
router.post('/:id/rate',rateService );

// Route for getting the average rating
router.get('/:id/rating', getServiceRating);

module.exports = router;
