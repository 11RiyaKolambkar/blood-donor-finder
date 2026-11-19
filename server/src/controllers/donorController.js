const User = require('../models/User');

// @route GET /api/donors/nearby
// Query: bloodGroup, lat, lng, radius (meters, default 10km)
exports.getNearbyDonors = async (req, res) => {
  try {
    const { bloodGroup, lat, lng, radius = 10000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng are required' });

    const query = {
      role: 'donor',
      isAvailable: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      },
    };

    if (bloodGroup) query.bloodGroup = bloodGroup;

    const donors = await User.find(query)
      .select('-password -fcmToken')
      .limit(20);

    res.json({ count: donors.length, donors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/donors/availability
exports.toggleAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.isAvailable = !user.isAvailable;
    await user.save();
    res.json({ message: `Availability set to ${user.isAvailable}`, isAvailable: user.isAvailable });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
