import { Request, Response } from 'express';
import { z } from 'zod';
import { BloodBank } from '../models/BloodBank';
import { Inventory } from '../models/Inventory';
import { AuthRequest, BloodGroup } from '../types';
import { sendSuccess, sendError, ErrorCodes } from '../utils/apiResponse';

const registerBloodBankSchema = z.object({
  name: z.string().min(2),
  licenseNumber: z.string().min(3),
  phone: z.string(),
  email: z.string().email(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string().default('India'),
  }),
});

const updateInventorySchema = z.object({
  bloodGroup: z.nativeEnum(BloodGroup),
  unitsAvailable: z.number().int().min(0),
  unitsReserved: z.number().int().min(0).default(0),
});

export const registerBloodBank = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = registerBloodBankSchema.parse(req.body);
  const userId = req.user!._id;

  const bloodBank = await BloodBank.create({
    userId,
    name: data.name,
    licenseNumber: data.licenseNumber,
    phone: data.phone,
    email: data.email,
    location: {
      type: 'Point',
      coordinates: [data.longitude, data.latitude],
    },
    address: data.address,
    isVerified: true,
  });

  sendSuccess(res, bloodBank, 201);
};

export const getNearbyBloodBanks = async (req: Request, res: Response): Promise<void> => {
  const { lat, lng, radius = '50' } = req.query;

  if (!lat || !lng) {
    const allBanks = await BloodBank.find({ isActive: true }).limit(50);
    sendSuccess(res, allBanks);
    return;
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lng as string);
  const radiusKm = parseFloat(radius as string);

  const bloodBanks = await BloodBank.find({
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

  sendSuccess(res, bloodBanks);
};

export const getBloodBankById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const bloodBank = await BloodBank.findById(id);
  if (!bloodBank) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Blood bank not found');
    return;
  }
  sendSuccess(res, bloodBank);
};

export const updateInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = updateInventorySchema.parse(req.body);

  const inventory = await Inventory.findOneAndUpdate(
    { bloodBankId: id, bloodGroup: data.bloodGroup },
    {
      unitsAvailable: data.unitsAvailable,
      unitsReserved: data.unitsReserved,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );

  sendSuccess(res, inventory);
};

export const getInventory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const inventory = await Inventory.find({ bloodBankId: id });
  sendSuccess(res, inventory);
};
