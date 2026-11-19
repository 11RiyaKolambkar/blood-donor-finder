import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { sendError, ErrorCodes } from '../utils/apiResponse';

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    sendError(res, 429, ErrorCodes.TOO_MANY_REQUESTS, 'Too many requests, please try again later'),
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    sendError(res, 429, ErrorCodes.TOO_MANY_REQUESTS, 'Too many auth attempts, please try again in 15 minutes'),
});
