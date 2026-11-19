import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBloodBank extends Document {
  userId: Types.ObjectId;
  name: string;
  licenseNumber: string;
  phone: string;
  email: string;
  address: { street: string; city: string; state: string; country: string; pincode: string };
  location: { type: 'Point'; coordinates: [number, number] };
  isVerified: boolean;
  isActive: boolean;
  operatingHours?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BloodBankSchema = new Schema<IBloodBank>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true, trim: true },
  licenseNumber: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  address: {
    street: String, city: { type: String, required: true },
    state: { type: String, required: true }, country: { type: String, default: 'India' },
    pincode: String,
  },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  operatingHours: String,
}, { timestamps: true });

BloodBankSchema.index({ location: '2dsphere' });

export const BloodBank = mongoose.model<IBloodBank>('BloodBank', BloodBankSchema);
