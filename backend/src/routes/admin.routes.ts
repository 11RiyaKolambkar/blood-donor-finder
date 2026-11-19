import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  listUsers,
  listEmergencies,
  listBloodRequests,
  deactivateUser,
  getAuditLogs,
  listHumanReviews,
  updateHumanReview,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

export const adminRouter = Router();

adminRouter.use(authenticate, authorize(UserRole.ADMIN, UserRole.OPERATOR));

adminRouter.get('/users', asyncHandler(listUsers));
adminRouter.patch('/users/:id/deactivate', asyncHandler(deactivateUser));
adminRouter.get('/emergencies', asyncHandler(listEmergencies));
adminRouter.get('/blood-requests', asyncHandler(listBloodRequests));
adminRouter.get('/audit-logs', asyncHandler(getAuditLogs));
adminRouter.get('/human-reviews', asyncHandler(listHumanReviews));
adminRouter.patch('/human-reviews/:id', authorize(UserRole.ADMIN), asyncHandler(updateHumanReview));
