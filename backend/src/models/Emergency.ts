import mongoose, { Schema, Document, Types } from 'mongoose';
import { EmergencyStatus, BloodGroup } from '../types';

export interface IEmergencyEvent {
  status: EmergencyStatus;
  timestamp: Date;
  actor?: Types.ObjectId;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface IEmergency extends Document {
  userId: Types.ObjectId;
  status: EmergencyStatus;
  bloodGroup?: BloodGroup;
  location?: { type: 'Point'; coordinates: [number, number] };
  locationAccuracy?: number;
  locationConsentGranted: boolean;
  liveLocationActive: boolean;
  liveLocationExpiresAt?: Date;
  description?: string;
  notifiedContacts: Types.ObjectId[];
  notifiedDonors: Types.ObjectId[];
  notifiedHospitals: Types.ObjectId[];
  acknowledgedBy?: Types.ObjectId;
  acknowledgedAt?: Date;
  escalatedAt?: Date;
  escalationReason?: string;
  resolvedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: Types.ObjectId;
  operatorNotes?: string;
  idempotencyKey?: string;
  auditTrail: IEmergencyEvent[];
  requiresHumanReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencySchema = new Schema<IEmergency>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: Object.values(EmergencyStatus), default: EmergencyStatus.DRAFT, index: true },
  bloodGroup: { type: String, enum: Object.values(BloodGroup) },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] },
  },
  locationAccuracy: Number,
  locationConsentGranted: { type: Boolean, default: false },
  liveLocationActive: { type: Boolean, default: false },
  liveLocationExpiresAt: Date,
  description: String,
  notifiedContacts: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  notifiedDonors: [{ type: Schema.Types.ObjectId, ref: 'Donor' }],
  notifiedHospitals: [{ type: Schema.Types.ObjectId, ref: 'Hospital' }],
  acknowledgedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  acknowledgedAt: Date,
  escalatedAt: Date,
  escalationReason: String,
  resolvedAt: Date,
  cancelledAt: Date,
  cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
  operatorNotes: String,
  idempotencyKey: { type: String, sparse: true, unique: true },
  auditTrail: [{
    status: { type: String, enum: Object.values(EmergencyStatus) },
    timestamp: { type: Date, required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    metadata: Schema.Types.Mixed,
  }],
  requiresHumanReview: { type: Boolean, default: false },
}, { timestamps: true });

EmergencySchema.index({ location: '2dsphere' });
EmergencySchema.index({ userId: 1, status: 1 });
EmergencySchema.index({ status: 1, createdAt: -1 });

export const Emergency = mongoose.model<IEmergency>('Emergency', EmergencySchema);
