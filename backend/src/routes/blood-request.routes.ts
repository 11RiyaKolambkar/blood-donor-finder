import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createBloodRequest,
  getMyRequests,
  getBloodRequestById,
  updateRequestStatus,
  cancelBloodRequest,
} from '../controllers/blood-request.controller';
import { authenticate } from '../middleware/auth';

export const bloodRequestRouter = Router();

bloodRequestRouter.use(authenticate);

bloodRequestRouter.get('/', asyncHandler(getMyRequests));
bloodRequestRouter.get('/my', asyncHandler(getMyRequests));
bloodRequestRouter.post('/', asyncHandler(createBloodRequest));
bloodRequestRouter.get('/:id', asyncHandler(getBloodRequestById));
bloodRequestRouter.patch('/:id/status', asyncHandler(updateRequestStatus));
bloodRequestRouter.delete('/:id', asyncHandler(cancelBloodRequest));
