import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { AuditLog } from '../models/AuditLog';
import { logger } from '../utils/logger';

export const auditLog = (action: string, resource: string) =>
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.json.bind(res);
    res.json = (body: unknown) => {
      setImmediate(async () => {
        try {
          await AuditLog.create({
            actor: req.user?._id || 'anonymous',
            actorRole: req.user?.roles?.[0] || 'anonymous',
            action,
            resource,
            resourceId: req.params.id,
            details: { method: req.method, path: req.path },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            outcome: res.statusCode < 400 ? 'success' : 'failure',
            timestamp: new Date(),
          });
        } catch (err) {
          logger.error('Failed to write audit log', { err });
        }
      });
      return originalSend(body);
    };
    next();
  };
