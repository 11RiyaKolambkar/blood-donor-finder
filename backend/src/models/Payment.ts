import mongoose, { Schema, Document, Types } from 'mongoose';

export type PaymentStatus = 'created' | 'pending' | 'captured' | 'failed' | 'refunded' | 'cancelled';

export interface IPayment extends Document {
  userId: Types.ObjectId;
  orderId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  purpose: string;
  resourceId?: string;
  idempotencyKey: string;
  webhookVerified: boolean;
  refundAmount?: number;
  refundedAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderId: { type: String, required: true, unique: true },
  razorpayOrderId: { type: String, sparse: true },
  razorpayPaymentId: { type: String, sparse: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['created', 'pending', 'captured', 'failed', 'refunded', 'cancelled'], default: 'created', index: true },
  purpose: { type: String, required: true },
  resourceId: String,
  idempotencyKey: { type: String, required: true, unique: true },
  webhookVerified: { type: Boolean, default: false },
  refundAmount: Number,
  refundedAt: Date,
  metadata: Schema.Types.Mixed,
}, { timestamps: true });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
