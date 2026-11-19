import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateLocation,
  getProfile,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, asyncHandler(register));
authRouter.post('/login', authRateLimiter, asyncHandler(login));
authRouter.post('/refresh', asyncHandler(refreshToken));
authRouter.post('/logout', authenticate, asyncHandler(logout));
authRouter.get('/me', authenticate, asyncHandler(getMe));
authRouter.get('/profile', authenticate, asyncHandler(getProfile));
authRouter.put('/location', authenticate, asyncHandler(updateLocation));
