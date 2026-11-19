import mongoose, { Schema, Document, Types } from 'mongoose';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'expired';
export type NotificationChannel = 'push' | 'sms' | 'email' | 'in_app';

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  title: string;
  body: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  priority: 'low' | 'normal' | 'high' | 'critical';
  purpose: string;
  resourceId?: string;
  resourceType?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  acknowledgedAt?: Date;
  failureReason?: string;
  retryCount: number;
  expiresAt?: Date;
  requiresAcknowledgement: boolean;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  channel: { type: String, enum: ['push', 'sms', 'email', 'in_app'], required: true },
  status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed', 'expired'], default: 'pending', index: true },
  priority: { type: String, enum: ['low', 'normal', 'high', 'critical'], default: 'normal' },
  purpose: { type: String, required: true },
  resourceId: String,
  resourceType: String,
  sentAt: Date,
  deliveredAt: Date,
  acknowledgedAt: Date,
  failureReason: String,
  retryCount: { type: Number, default: 0 },
  expiresAt: Date,
  requiresAcknowledgement: { type: Boolean, default: false },
  idempotencyKey: { type: String, required: true, unique: true },
}, { timestamps: true });

NotificationSchema.index({ recipientId: 1, status: 1 });
NotificationSchema.index({ expiresAt: 1, status: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
