import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest, JwtPayload, UserRole } from '../types';
import { sendError, ErrorCodes } from '../utils/apiResponse';
import { User } from '../models/User';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      sendError(res, 401, ErrorCodes.UNAUTHORIZED, 'Authentication required');
      return;
    }
    const token = authHeader.substring(7);
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;

    if (payload.type !== 'access') {
      sendError(res, 401, ErrorCodes.TOKEN_INVALID, 'Invalid token type');
      return;
    }

    const user = await User.findById(payload.sub).select('+isActive +roles +email +phone');
    if (!user || !user.isActive) {
      sendError(res, 401, ErrorCodes.UNAUTHORIZED, 'User not found or inactive');
      return;
    }

    req.user = {
      _id: user.id,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      isActive: user.isActive,
      isVerified: user.isVerified,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 401, ErrorCodes.TOKEN_EXPIRED, 'Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, 401, ErrorCodes.TOKEN_INVALID, 'Invalid token');
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, ErrorCodes.UNAUTHORIZED, 'Authentication required');
      return;
    }
    const hasRole = req.user.roles.some(r => roles.includes(r));
    if (!hasRole) {
      sendError(res, 403, ErrorCodes.FORBIDDEN, 'Insufficient permissions');
      return;
    }
    next();
  };

export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
      const user = await User.findById(payload.sub).select('+isActive +roles');
      if (user && user.isActive) {
        req.user = {
          _id: user.id,
          email: user.email,
          phone: user.phone,
          roles: user.roles,
          isActive: user.isActive,
          isVerified: user.isVerified,
        };
      }
    }
  } catch (_) { /* ignore auth errors for optional */ }
  next();
};
