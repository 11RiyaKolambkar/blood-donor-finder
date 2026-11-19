import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  registerBloodBank,
  getNearbyBloodBanks,
  getBloodBankById,
  updateInventory,
  getInventory,
} from '../controllers/blood-bank.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

export const bloodBankRouter = Router();

bloodBankRouter.get('/nearby', asyncHandler(getNearbyBloodBanks));
bloodBankRouter.get('/:id', asyncHandler(getBloodBankById));
bloodBankRouter.get('/:id/inventory', asyncHandler(getInventory));

bloodBankRouter.use(authenticate);
bloodBankRouter.post('/register', authorize(UserRole.BLOOD_BANK, UserRole.ADMIN), asyncHandler(registerBloodBank));
bloodBankRouter.patch('/:id/inventory', authorize(UserRole.BLOOD_BANK, UserRole.ADMIN), asyncHandler(updateInventory));
