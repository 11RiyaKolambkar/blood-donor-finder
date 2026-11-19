import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  actor: Types.ObjectId | string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  outcome: 'success' | 'failure' | 'denied';
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  actor: { type: Schema.Types.Mixed, required: true, index: true },
  actorRole: { type: String, required: true },
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true, index: true },
  resourceId: String,
  details: Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  outcome: { type: String, enum: ['success', 'failure', 'denied'], required: true },
  timestamp: { type: Date, default: Date.now, immutable: true },
}, {
  timestamps: false,
});

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ actor: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1, timestamp: -1 });

// Prevent updates — immutable record
AuditLogSchema.pre('findOneAndUpdate', function() { throw new Error('AuditLog records are immutable'); });
AuditLogSchema.pre('updateOne', function() { throw new Error('AuditLog records are immutable'); });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
