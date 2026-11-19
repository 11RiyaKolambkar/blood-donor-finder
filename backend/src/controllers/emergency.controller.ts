import { Response } from 'express';
import { z } from 'zod';
import { Emergency, IEmergencyEvent } from '../models/Emergency';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest, BloodGroup, EmergencyStatus } from '../types';
import { sendSuccess, sendError, ErrorCodes } from '../utils/apiResponse';
import { emitEmergencyUpdate } from '../utils/socketSetup';

const createEmergencySchema = z.object({
  bloodGroup: z.nativeEnum(BloodGroup).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationAccuracy: z.number().optional(),
  locationConsentGranted: z.boolean().default(false),
  description: z.string().max(1000).optional(),
});

const cancelEmergencySchema = z.object({
  reason: z.string().min(3),
});

const acknowledgeSchema = z.object({
  notes: z.string().optional(),
});

export const createEmergency = async (req: AuthRequest, res: Response): Promise<void> => {
  const idempotencyKey = req.headers['x-idempotency-key'] as string | undefined;

  if (idempotencyKey) {
    const existing = await Emergency.findOne({ idempotencyKey });
    if (existing) {
      sendSuccess(res, existing);
      return;
    }
  }

  const data = createEmergencySchema.parse(req.body);
  const userId = req.user!._id;

  const location = data.latitude !== undefined && data.longitude !== undefined
    ? { type: 'Point' as const, coordinates: [data.longitude, data.latitude] as [number, number] }
    : undefined;

  const initialEvent: IEmergencyEvent = {
    status: EmergencyStatus.DRAFT,
    timestamp: new Date(),
    actor: userId as any,
    reason: 'Emergency triggered by user',
  };

  const emergency = await Emergency.create({
    userId,
    status: EmergencyStatus.DRAFT,
    bloodGroup: data.bloodGroup,
    location,
    locationAccuracy: data.locationAccuracy,
    locationConsentGranted: data.locationConsentGranted,
    liveLocationActive: data.locationConsentGranted,
    description: data.description,
    idempotencyKey,
    auditTrail: [initialEvent],
    requiresHumanReview: false,
  });

  await AuditLog.create({
    actor: userId,
    actorRole: req.user!.roles[0] || 'patient',
    action: 'EMERGENCY_CREATED',
    resource: 'Emergency',
    resourceId: emergency.id,
    outcome: 'success',
    details: { status: emergency.status },
  });

  emitEmergencyUpdate(emergency.id, {
    action: 'created',
    emergencyId: emergency.id,
    status: emergency.status,
  });

  sendSuccess(res, emergency, 201);
};

export const getActiveEmergency = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!._id;
  const emergency = await Emergency.findOne({
    userId,
    status: { $in: [EmergencyStatus.DRAFT, EmergencyStatus.CONFIRMED, EmergencyStatus.NOTIFICATION_PENDING, EmergencyStatus.ACKNOWLEDGED, EmergencyStatus.ESCALATED] },
  }).sort({ createdAt: -1 });

  sendSuccess(res, emergency);
};

export const getEmergencyById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const emergency = await Emergency.findById(id).populate('userId', 'email phone');
  if (!emergency) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Emergency not found');
    return;
  }
  sendSuccess(res, emergency);
};

export const confirmEmergency = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!._id;

  const emergency = await Emergency.findById(id);
  if (!emergency) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Emergency not found');
    return;
  }

  emergency.status = EmergencyStatus.NOTIFICATION_PENDING;
  emergency.auditTrail.push({
    status: EmergencyStatus.CONFIRMED,
    timestamp: new Date(),
    actor: userId as any,
    reason: 'SOS countdown completed and confirmed',
  });
  await emergency.save();

  await AuditLog.create({
    actor: userId,
    actorRole: req.user!.roles[0] || 'patient',
    action: 'EMERGENCY_CONFIRMED',
    resource: 'Emergency',
    resourceId: emergency.id,
    outcome: 'success',
  });

  emitEmergencyUpdate(emergency.id, {
    action: 'confirmed',
    emergencyId: emergency.id,
    status: emergency.status,
  });

  sendSuccess(res, emergency);
};

export const cancelEmergency = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = cancelEmergencySchema.parse(req.body);
  const userId = req.user!._id;

  const emergency = await Emergency.findById(id);
  if (!emergency) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Emergency not found');
    return;
  }

  emergency.status = EmergencyStatus.CANCELLED;
  emergency.cancelledAt = new Date();
  emergency.cancelledBy = userId as any;
  emergency.liveLocationActive = false;
  emergency.auditTrail.push({
    status: EmergencyStatus.CANCELLED,
    timestamp: new Date(),
    actor: userId as any,
    reason: data.reason,
  });
  await emergency.save();

  await AuditLog.create({
    actor: userId,
    actorRole: req.user!.roles[0] || 'patient',
    action: 'EMERGENCY_CANCELLED',
    resource: 'Emergency',
    resourceId: emergency.id,
    outcome: 'success',
    details: { reason: data.reason },
  });

  emitEmergencyUpdate(emergency.id, {
    action: 'cancelled',
    emergencyId: emergency.id,
    status: emergency.status,
  });

  sendSuccess(res, emergency);
};

export const resolveEmergency = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!._id;

  const emergency = await Emergency.findById(id);
  if (!emergency) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Emergency not found');
    return;
  }

  emergency.status = EmergencyStatus.RESOLVED;
  emergency.resolvedAt = new Date();
  emergency.liveLocationActive = false;
  emergency.auditTrail.push({
    status: EmergencyStatus.RESOLVED,
    timestamp: new Date(),
    actor: userId as any,
    reason: 'Emergency marked as resolved',
  });
  await emergency.save();

  await AuditLog.create({
    actor: userId,
    actorRole: req.user!.roles[0] || 'patient',
    action: 'EMERGENCY_RESOLVED',
    resource: 'Emergency',
    resourceId: emergency.id,
    outcome: 'success',
  });

  emitEmergencyUpdate(emergency.id, {
    action: 'resolved',
    emergencyId: emergency.id,
    status: emergency.status,
  });

  sendSuccess(res, emergency);
};

export const updateLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { latitude, longitude, accuracy } = req.body;

  const emergency = await Emergency.findById(id);
  if (!emergency || !emergency.liveLocationActive) {
    sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'Live location not active for this emergency');
    return;
  }

  emergency.location = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
  if (accuracy !== undefined) {
    emergency.locationAccuracy = accuracy;
  }
  await emergency.save();

  emitEmergencyUpdate(emergency.id, {
    action: 'location_updated',
    coordinates: [longitude, latitude],
  });

  sendSuccess(res, { message: 'Location updated' });
};

export const acknowledgeEmergency = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = acknowledgeSchema.parse(req.body);
  const operatorId = req.user!._id;

  const emergency = await Emergency.findById(id);
  if (!emergency) {
    sendError(res, 404, ErrorCodes.NOT_FOUND, 'Emergency not found');
    return;
  }

  emergency.status = EmergencyStatus.ACKNOWLEDGED;
  emergency.acknowledgedBy = operatorId as any;
  emergency.acknowledgedAt = new Date();
  if (data.notes) {
    emergency.operatorNotes = data.notes;
  }
  emergency.auditTrail.push({
    status: EmergencyStatus.ACKNOWLEDGED,
    timestamp: new Date(),
    actor: operatorId as any,
    reason: data.notes || 'Acknowledged by operator',
  });
  await emergency.save();

  await AuditLog.create({
    actor: operatorId,
    actorRole: req.user!.roles[0] || 'operator',
    action: 'EMERGENCY_ACKNOWLEDGED',
    resource: 'Emergency',
    resourceId: emergency.id,
    outcome: 'success',
    details: { notes: data.notes },
  });

  emitEmergencyUpdate(emergency.id, {
    action: 'acknowledged',
    emergencyId: emergency.id,
    operatorId,
  });

  sendSuccess(res, emergency);
};
