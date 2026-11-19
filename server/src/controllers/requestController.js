const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const { messaging } = require('../config/firebase');

// Find nearby donors and send FCM push notifications
const notifyNearbyDonors = async (request) => {
  try {
    if (!messaging) {
      console.log('FCM disabled: no valid Firebase credentials configured.');
      return;
    }

    const [lng, lat] = request.location.coordinates;
    const nearbyDonors = await User.find({
      role: 'donor',
      isAvailable: true,
      bloodGroup: request.bloodGroup,
      fcmToken: { $ne: '' },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 15000, // 15 km
        },
      },
    }).limit(20);

    if (nearbyDonors.length === 0) return;

    const tokens = nearbyDonors.map((d) => d.fcmToken).filter(Boolean);
    const donorIds = nearbyDonors.map((d) => d._id);

    // Update request with notified donor IDs
    await BloodRequest.findByIdAndUpdate(request._id, { notifiedDonors: donorIds });

    const urgencyEmoji = { normal: '🩸', urgent: '⚠️', critical: '🚨' };
    const emoji = urgencyEmoji[request.urgency] || '🩸';

    const multicastMessage = {
      tokens,
      notification: {
        title: `${emoji} Blood Needed: ${request.bloodGroup}`,
        body: `${request.urgency.toUpperCase()} request nearby. ${request.message || 'Please respond if available.'}`,
      },
      data: {
        requestId: request._id.toString(),
        bloodGroup: request.bloodGroup,
        urgency: request.urgency,
        lat: lat.toString(),
        lng: lng.toString(),
      },
      android: { priority: 'high' },
      apns: { headers: { 'apns-priority': '10' } },
    };

    const response = await messaging.sendEachForMulticast(multicastMessage);
    console.log(`📱 FCM: ${response.successCount} sent, ${response.failureCount} failed`);
  } catch (err) {
    console.error('FCM notification error:', err.message);
  }
};

// @route POST /api/requests
exports.createRequest = async (req, res) => {
  try {
    const { bloodGroup, urgency, message, lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({ message: 'Location required' });

    const request = await BloodRequest.create({
      requesterId: req.user.id,
      bloodGroup,
      urgency,
      message,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
    });

    // Fire and forget — notify donors in background
    notifyNearbyDonors(request);

    res.status(201).json({
      message: 'Request posted. Matching donors with notifications enabled may be alerted.',
      request,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/requests
exports.getRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requesterId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('requesterId', 'name bloodGroup');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/requests/:id/status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BloodRequest.findOneAndUpdate(
      { _id: req.params.id, requesterId: req.user.id },
      { status },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Request not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
