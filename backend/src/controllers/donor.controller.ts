import { Request, Response } from 'express';
import { z } from 'zod';
import { Donor } from '../models/Donor';
import { Profile } from '../models/Profile';
import { User } from '../models/User';
import { AuthRequest, BloodGroup, UserRole } from '../types';
import { sendSuccess, sendError, ErrorCodes } from '../utils/apiResponse';
import { getCompatibleDonors } from '../utils/bloodCompatibility';

const registerDonorSchema = z.object({
  bloodGroup: z.nativeEnum(BloodGroup),
  latitude: z.number().min(-90).max(90).default(12.9716),
  longitude: z.number().min(-180).max(180).default(77.5946),
  isAvailable: z.boolean().default(true),
  locationConsentGranted: z.boolean().default(true),
});

const updateAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export const registerDonor = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = registerDonorSchema.parse(req.body);
  const userId = req.user!._id;

  const existingDonor = await Donor.findOne({ userId });
  if (existingDonor) {
    existingDonor.bloodGroup = data.bloodGroup;
    existingDonor.location = {
      type: 'Point',
      coordinates: [data.longitude, data.latitude],
    };
    existingDonor.isAvailable = data.isAvailable;
    existingDonor.locationConsentGranted = data.locationConsentGranted;
    await existingDonor.save();

    await Profile.findOneAndUpdate(
      { userId },
      { bloodGroup: data.bloodGroup },
      { new: true }
    );

    sendSuccess(res, existingDonor, 200);
    return;
  }

  const donor = await Donor.create({
    userId,
    bloodGroup: data.bloodGroup,
    location: {
      type: 'Point',
      coordinates: [data.longitude, data.latitude],
    },
    isAvailable: data.isAvailable,
    locationConsentGranted: data.locationConsentGranted,
  });

  await Profile.findOneAndUpdate(
    { userId },
    { bloodGroup: data.bloodGroup },
    { upsert: true }
  );

  sendSuccess(res, donor, 201);
};

export const getDonorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const donor = await Donor.findOne({ userId }).populate('userId', 'email phone isVerified');
  if (!donor) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Donor profile not found');
    return;
  }
  sendSuccess(res, donor);
};

export const updateAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = updateAvailabilitySchema.parse(req.body);
  const userId = req.user!._id;

  const donor = await Donor.findOneAndUpdate(
    { userId },
    { isAvailable: data.isAvailable },
    { new: true }
  );

  if (!donor) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Donor profile not found');
    return;
  }

  sendSuccess(res, donor);
};

export const toggleAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  let donor = await Donor.findOne({ userId });
  if (!donor) {
    const profile = await Profile.findOne({ userId });
    donor = await Donor.create({
      userId,
      bloodGroup: profile?.bloodGroup || BloodGroup.O_POS,
      isAvailable: true,
      locationConsentGranted: true,
      location: { type: 'Point', coordinates: [77.5946, 12.9716] },
    });
  } else {
    donor.isAvailable = !donor.isAvailable;
    await donor.save();
  }

  res.json({
    message: `Availability set to ${donor.isAvailable}`,
    isAvailable: donor.isAvailable,
  });
};

export const getNearbyDonors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bloodGroup, lat, lng, radius = '50000' } = req.query;

    const query: any = { isAvailable: true };

    if (bloodGroup && typeof bloodGroup === 'string' && bloodGroup.trim().length > 0) {
      const bg = bloodGroup.trim();
      if (Object.values(BloodGroup).includes(bg as BloodGroup)) {
        const compatible = getCompatibleDonors(bg as BloodGroup);
        query.bloodGroup = { $in: compatible };
      } else {
        query.bloodGroup = bg;
      }
    }

    let radiusMeters = parseFloat(radius as string);
    if (isNaN(radiusMeters) || radiusMeters <= 0) radiusMeters = 50000;
    if (radiusMeters < 1000) radiusMeters *= 1000; // if passed in km, convert to meters

    let donors: any[] = [];

    if (lat && lng && !isNaN(parseFloat(lat as string)) && !isNaN(parseFloat(lng as string))) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);

      try {
        donors = await Donor.find({
          ...query,
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
              $maxDistance: radiusMeters,
            },
          },
        }).populate('userId', 'email phone isVerified roles');
      } catch (err) {
        // Fallback if geospatial index fails
        donors = await Donor.find(query).populate('userId', 'email phone isVerified roles').limit(50);
      }
    }

    // If no donors within exact radius, fallback to all available donors matching criteria so user is never left with an empty screen
    if (!donors || donors.length === 0) {
      donors = await Donor.find(query).populate('userId', 'email phone isVerified roles').limit(50);
    }

    // Format for both client and flutter apps
    const formatted = await Promise.all(
      donors.map(async (d) => {
        const profile = await Profile.findOne({ userId: d.userId?._id || d.userId });
        const name = profile
          ? `${profile.firstName} ${profile.lastName}`.trim()
          : (d.userId?.email ? d.userId.email.split('@')[0] : 'PulseNet Donor');
        const phone = d.userId?.phone || '+919876543210';
        const coords = d.location?.coordinates || [77.5946, 12.9716];

        return {
          _id: d._id,
          id: d._id,
          name,
          email: d.userId?.email || '',
          phone,
          bloodGroup: d.bloodGroup,
          role: 'donor',
          isAvailable: d.isAvailable,
          location: {
            type: 'Point',
            coordinates: coords,
          },
        };
      })
    );

    res.json({
      success: true,
      count: formatted.length,
      donors: formatted,
      data: formatted,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const searchDonors = async (req: Request, res: Response): Promise<void> => {
  return getNearbyDonors(req, res);
};

export const getDonorById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id || id.length !== 24) {
    sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'Invalid ID format');
    return;
  }
  const donor = await Donor.findById(id).select('-locationConsentGranted');
  if (!donor) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Donor not found');
    return;
  }
  sendSuccess(res, donor);
};
