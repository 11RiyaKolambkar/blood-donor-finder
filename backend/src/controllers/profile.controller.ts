import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import { Profile } from '../models/Profile';
import { BloodGroup } from '../types';
import { sendSuccess, sendError, ErrorCodes } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  address: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
});

const updateBloodGroupSchema = z.object({
  bloodGroup: z.nativeEnum(BloodGroup),
});

const emergencyContactSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/),
  relationship: z.string().min(1).max(50),
  isNotifyOnSOS: z.boolean().default(false),
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const profile = await Profile.findOne({ userId: req.user!._id, isDeleted: false });
  if (!profile) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Profile not found');
    return;
  }
  sendSuccess(res, profile);
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const data = updateProfileSchema.parse(req.body);
  const profile = await Profile.findOneAndUpdate(
    { userId: req.user!._id, isDeleted: false },
    { $set: data },
    { new: true, runValidators: true },
  );
  if (!profile) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Profile not found');
    return;
  }
  sendSuccess(res, profile);
});

export const updateBloodGroup = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { bloodGroup } = updateBloodGroupSchema.parse(req.body);
  const profile = await Profile.findOneAndUpdate(
    { userId: req.user!._id, isDeleted: false },
    { $set: { bloodGroup } },
    { new: true },
  );
  if (!profile) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Profile not found');
    return;
  }
  sendSuccess(res, { bloodGroup: profile.bloodGroup });
});

export const addEmergencyContact = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const contact = emergencyContactSchema.parse(req.body);
  const profile = await Profile.findOne({ userId: req.user!._id, isDeleted: false });
  if (!profile) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Profile not found');
    return;
  }
  if (profile.emergencyContacts.length >= 5) {
    sendError(res, 400, ErrorCodes.CONFLICT, 'Maximum 5 emergency contacts allowed');
    return;
  }
  profile.emergencyContacts.push(contact);
  await profile.save();
  sendSuccess(res, profile.emergencyContacts, 201);
});

export const removeEmergencyContact = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { contactId } = req.params;
  const profile = await Profile.findOne({ userId: req.user!._id, isDeleted: false });
  if (!profile) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Profile not found');
    return;
  }
  const originalLength = profile.emergencyContacts.length;
  profile.emergencyContacts = profile.emergencyContacts.filter(
    (c) => (c as any)._id?.toString() !== contactId,
  );
  if (profile.emergencyContacts.length === originalLength) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Emergency contact not found');
    return;
  }
  await profile.save();
  sendSuccess(res, profile.emergencyContacts);
});
