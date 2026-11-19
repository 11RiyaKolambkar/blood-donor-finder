import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createEmergency,
  getActiveEmergency,
  getEmergencyById,
  confirmEmergency,
  cancelEmergency,
  resolveEmergency,
  updateLocation,
  acknowledgeEmergency,
} from '../controllers/emergency.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

export const emergencyRouter = Router();

emergencyRouter.use(authenticate);

emergencyRouter.post('/', asyncHandler(createEmergency));
emergencyRouter.get('/active', asyncHandler(getActiveEmergency));
emergencyRouter.get('/:id', asyncHandler(getEmergencyById));
emergencyRouter.post('/:id/confirm', asyncHandler(confirmEmergency));
emergencyRouter.post('/:id/cancel', asyncHandler(cancelEmergency));
emergencyRouter.post('/:id/resolve', asyncHandler(resolveEmergency));
emergencyRouter.patch('/:id/location', asyncHandler(updateLocation));
emergencyRouter.post('/:id/acknowledge', authorize(UserRole.OPERATOR, UserRole.ADMIN), asyncHandler(acknowledgeEmergency));
