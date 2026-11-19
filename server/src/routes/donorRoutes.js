const express = require('express');
const router = express.Router();
const { getNearbyDonors, toggleAvailability } = require('../controllers/donorController');
const auth = require('../middleware/auth');

// GET /api/donors/nearby?bloodGroup=A+&lat=12.9&lng=77.5&radius=10000
router.get('/nearby', auth, getNearbyDonors);
router.put('/availability', auth, toggleAvailability);

module.exports = router;
