import mongoose, { Schema, Document, Types } from 'mongoose';
import { BloodGroup } from '../types';

export type BloodRequestStatus = 'pending' | 'matched' | 'accepted' | 'rejected' | 'fulfilled' | 'cancelled' | 'expired';
export type UrgencyLevel = 'routine' | 'urgent' | 'critical';

export interface IBloodRequest extends Document {
  requesterId: Types.ObjectId;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  urgency: UrgencyLevel;
  hospitalName?: string;
  location: { type: 'Point'; coordinates: [number, number] };
  status: BloodRequestStatus;
  matchedDonorId?: Types.ObjectId;
  matchedBloodBankId?: Types.ObjectId;
  contactSharedAt?: Date;
  expiresAt: Date;
  clinicalNotes?: string;
  requiresHumanReview: boolean;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BloodRequestSchema = new Schema<IBloodRequest>({
  requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  patientName: { type: String, required: true, trim: true },
  bloodGroup: { type: String, enum: Object.values(BloodGroup), required: true, index: true },
  unitsRequired: { type: Number, required: true, min: 1, max: 20 },
  urgency: { type: String, enum: ['routine', 'urgent', 'critical'], default: 'routine', index: true },
  hospitalName: String,
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
  status: { type: String, enum: ['pending', 'matched', 'accepted', 'rejected', 'fulfilled', 'cancelled', 'expired'], default: 'pending', index: true },
  matchedDonorId: { type: Schema.Types.ObjectId, ref: 'Donor' },
  matchedBloodBankId: { type: Schema.Types.ObjectId, ref: 'BloodBank' },
  contactSharedAt: Date,
  expiresAt: { type: Date, required: true, index: true },
  clinicalNotes: String,
  requiresHumanReview: { type: Boolean, default: false },
  idempotencyKey: { type: String, sparse: true, unique: true },
}, { timestamps: true });

BloodRequestSchema.index({ location: '2dsphere' });
BloodRequestSchema.index({ requesterId: 1, status: 1 });

export const BloodRequest = mongoose.model<IBloodRequest>('BloodRequest', BloodRequestSchema);
