import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { sendError, ErrorCodes } from '../utils/apiResponse';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof ZodError) {
    sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'Validation failed',
      err.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'Invalid data',
      Object.values(err.errors).map(e => ({ field: e.path, message: e.message })));
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'Invalid ID format');
    return;
  }

  // Duplicate key
  if ('code' in err && (err as NodeJS.ErrnoException).code === '11000') {
    sendError(res, 409, ErrorCodes.DUPLICATE_ENTRY, 'Resource already exists');
    return;
  }

  sendError(
    res,
    500,
    ErrorCodes.INTERNAL_ERROR,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, 404, ErrorCodes.NOT_FOUND, `Route ${req.method} ${req.path} not found`);
};
