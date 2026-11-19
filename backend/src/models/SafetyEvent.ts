import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISafetyEvent extends Document {
  userId?: Types.ObjectId;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resourceId?: string;
  resourceType?: string;
  metadata?: Record<string, unknown>;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SafetyEventSchema = new Schema<ISafetyEvent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  eventType: { type: String, required: true, index: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true, index: true },
  description: { type: String, required: true },
  resourceId: String,
  resourceType: String,
  metadata: Schema.Types.Mixed,
  resolvedAt: Date,
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolutionNotes: String,
}, { timestamps: true });

SafetyEventSchema.index({ severity: 1, createdAt: -1 });

export const SafetyEvent = mongoose.model<ISafetyEvent>('SafetyEvent', SafetyEventSchema);
