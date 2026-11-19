import mongoose, { Schema, Document, Types } from 'mongoose';
import { BloodGroup } from '../types';

export interface IDonor extends Document {
  userId: Types.ObjectId;
  bloodGroup: BloodGroup;
  isAvailable: boolean;
  isVerified: boolean;
  verifiedAt?: Date;
  lastDonationDate?: Date;
  totalDonations: number;
  location?: { type: 'Point'; coordinates: [number, number] };
  locationUpdatedAt?: Date;
  locationConsentGranted: boolean;
  eligibilityNotes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DonorSchema = new Schema<IDonor>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  bloodGroup: { type: String, enum: Object.values(BloodGroup), required: true, index: true },
  isAvailable: { type: Boolean, default: true, index: true },
  isVerified: { type: Boolean, default: false },
  verifiedAt: Date,
  lastDonationDate: Date,
  totalDonations: { type: Number, default: 0 },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] },
  },
  locationUpdatedAt: Date,
  locationConsentGranted: { type: Boolean, default: false },
  eligibilityNotes: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

DonorSchema.index({ location: '2dsphere' });
DonorSchema.index({ bloodGroup: 1, isAvailable: 1, isActive: 1 });

export const Donor = mongoose.model<IDonor>('Donor', DonorSchema);
