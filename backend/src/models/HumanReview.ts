import mongoose, { Schema, Document, Types } from 'mongoose';

export type HumanReviewStatus = 'pending' | 'assigned' | 'in_review' | 'approved' | 'rejected' | 'escalated' | 'closed';
export type HumanReviewDecision = 'approve' | 'reject' | 'escalate' | 'defer';

export interface IHumanReview extends Document {
  reviewType: string;
  resourceId: string;
  resourceType: string;
  status: HumanReviewStatus;
  priority: 'low' | 'normal' | 'high' | 'critical';
  assignedTo?: Types.ObjectId;
  assignedAt?: Date;
  dueAt?: Date;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  decision?: HumanReviewDecision;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const HumanReviewSchema = new Schema<IHumanReview>({
  reviewType: { type: String, required: true, index: true },
  resourceId: { type: String, required: true },
  resourceType: { type: String, required: true },
  status: { type: String, enum: ['pending', 'assigned', 'in_review', 'approved', 'rejected', 'escalated', 'closed'], default: 'pending', index: true },
  priority: { type: String, enum: ['low', 'normal', 'high', 'critical'], default: 'normal', index: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedAt: Date,
  dueAt: { type: Date, index: true },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  decision: { type: String, enum: ['approve', 'reject', 'escalate', 'defer'] },
  notes: String,
  metadata: Schema.Types.Mixed,
}, { timestamps: true });

HumanReviewSchema.index({ status: 1, priority: -1, dueAt: 1 });

export const HumanReview = mongoose.model<IHumanReview>('HumanReview', HumanReviewSchema);
