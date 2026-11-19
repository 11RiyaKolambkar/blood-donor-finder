import mongoose, { Schema, Document } from 'mongoose';

export interface IHospital extends Document {
  name: string;
  phone: string;
  address: { city: string; state: string; country: string };
  location: { type: 'Point'; coordinates: [number, number] };
  emergencyContact?: string;
  hasBloodBank: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HospitalSchema = new Schema<IHospital>({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  address: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
  },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
  emergencyContact: String,
  hasBloodBank: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

HospitalSchema.index({ location: '2dsphere' });

export const Hospital = mongoose.model<IHospital>('Hospital', HospitalSchema);
