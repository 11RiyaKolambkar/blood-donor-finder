import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  registerDonor,
  getDonorProfile,
  updateAvailability,
  toggleAvailability,
  getNearbyDonors,
  searchDonors,
  getDonorById,
} from '../controllers/donor.controller';
import { authenticate } from '../middleware/auth';

export const donorRouter = Router();

// Public discovery endpoints
donorRouter.get('/nearby', asyncHandler(getNearbyDonors));
donorRouter.get('/search', asyncHandler(searchDonors));

// Authenticated endpoints
donorRouter.use(authenticate);
donorRouter.post('/register', asyncHandler(registerDonor));
donorRouter.get('/me/profile', asyncHandler(getDonorProfile));
donorRouter.patch('/me/availability', asyncHandler(updateAvailability));
donorRouter.put('/availability', asyncHandler(toggleAvailability));

// Parametrized route LAST
donorRouter.get('/:id', asyncHandler(getDonorById));
