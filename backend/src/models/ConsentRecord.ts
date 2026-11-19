import mongoose, { Schema, Document, Types } from 'mongoose';
import { ConsentPurpose } from '../types';

export interface IConsentRecord extends Document {
  userId: Types.ObjectId;
  purpose: ConsentPurpose;
  granted: boolean;
  policyVersion: string;
  noticeShown: string;
  language: string;
  dataCategories: string[];
  recipients: string[];
  grantedAt?: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentRecordSchema = new Schema<IConsentRecord>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  purpose: { type: String, enum: Object.values(ConsentPurpose), required: true },
  granted: { type: Boolean, required: true },
  policyVersion: { type: String, required: true },
  noticeShown: { type: String, required: true },
  language: { type: String, default: 'en' },
  dataCategories: [String],
  recipients: [String],
  grantedAt: Date,
  expiresAt: Date,
  revokedAt: Date,
  ipAddress: String,
  userAgent: String,
}, { timestamps: true });

ConsentRecordSchema.index({ userId: 1, purpose: 1, createdAt: -1 });

export const ConsentRecord = mongoose.model<IConsentRecord>('ConsentRecord', ConsentRecordSchema);
