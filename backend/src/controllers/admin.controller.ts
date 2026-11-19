import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Emergency } from '../models/Emergency';
import { BloodRequest } from '../models/BloodRequest';
import { AuditLog } from '../models/AuditLog';
import { HumanReview } from '../models/HumanReview';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, ErrorCodes } from '../utils/apiResponse';

export const listUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '20', search } = req.query;
  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

  const query: any = {};
  if (search) {
    query.$or = [
      { email: { $regex: search as string, $options: 'i' } },
      { phone: { $regex: search as string, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .sort({ createdAt: -1 });

  sendSuccess(res, users, 200, {
    page: pageNum,
    limit: limitNum,
    total,
    hasNextPage: pageNum * limitNum < total,
  });
};

export const deactivateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!user) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'User not found');
    return;
  }

  await AuditLog.create({
    userId: req.user!._id,
    action: 'USER_DEACTIVATED',
    resourceType: 'User',
    resourceId: user._id,
  });

  sendSuccess(res, { message: 'User deactivated successfully' });
};

export const listEmergencies = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, page = '1', limit = '20' } = req.query;
  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

  const query: any = {};
  if (status) query.status = status;

  const total = await Emergency.countDocuments(query);
  const emergencies = await Emergency.find(query)
    .populate('userId', 'email phone')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  sendSuccess(res, emergencies, 200, {
    page: pageNum,
    limit: limitNum,
    total,
    hasNextPage: pageNum * limitNum < total,
  });
};

export const listBloodRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, page = '1', limit = '20' } = req.query;
  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

  const query: any = {};
  if (status) query.status = status;

  const total = await BloodRequest.countDocuments(query);
  const requests = await BloodRequest.find(query)
    .populate('patientId', 'email phone')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  sendSuccess(res, requests, 200, {
    page: pageNum,
    limit: limitNum,
    total,
    hasNextPage: pageNum * limitNum < total,
  });
};

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '50' } = req.query;
  const pageNum = Math.max(1, parseInt(page as string, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

  const total = await AuditLog.countDocuments({});
  const logs = await AuditLog.find({})
    .populate('userId', 'email roles')
    .sort({ timestamp: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  sendSuccess(res, logs, 200, {
    page: pageNum,
    limit: limitNum,
    total,
    hasNextPage: pageNum * limitNum < total,
  });
};

export const listHumanReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  const reviews = await HumanReview.find({ status: 'pending' }).sort({ createdAt: -1 });
  sendSuccess(res, reviews);
};

export const updateHumanReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const review = await HumanReview.findByIdAndUpdate(
    id,
    {
      status,
      reviewerNotes: notes,
      reviewedBy: req.user!._id,
      reviewedAt: new Date(),
    },
    { new: true }
  );

  if (!review) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Human review not found');
    return;
  }

  sendSuccess(res, review);
};
