import { Request, Response } from 'express';
import { Hospital } from '../models/Hospital';
import { sendSuccess, sendError, ErrorCodes } from '../utils/apiResponse';

export const getNearbyHospitals = async (req: Request, res: Response): Promise<void> => {
  const { lat, lng, radius = '50' } = req.query;

  if (!lat || !lng) {
    const hospitals = await Hospital.find({ isActive: true }).limit(50);
    sendSuccess(res, hospitals);
    return;
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);
  const radiusKm = parseFloat(radius as string);

  const hospitals = await Hospital.find({
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: radiusKm * 1000,
      },
    },
  }).limit(50);

  sendSuccess(res, hospitals);
};

export const getHospitalById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const hospital = await Hospital.findById(id);
  if (!hospital) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Hospital not found');
    return;
  }
  sendSuccess(res, hospital);
};
