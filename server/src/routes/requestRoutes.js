const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateRequestStatus } = require('../controllers/requestController');
const auth = require('../middleware/auth');

router.post('/', auth, createRequest);
router.get('/', auth, getRequests);
router.put('/:id/status', auth, updateRequestStatus);

module.exports = router;
