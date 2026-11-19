import mongoose, { Schema, Document, Types } from 'mongoose';
import { BloodGroup } from '../types';

export interface IEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  isNotifyOnSOS: boolean;
}

export interface IProfile extends Document {
  userId: Types.ObjectId;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodGroup?: BloodGroup;
  address?: { city?: string; state?: string; country?: string; pincode?: string };
  emergencyContacts: IEmergencyContact[];
  avatarUrl?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
  bloodGroup: { type: String, enum: Object.values(BloodGroup) },
  address: {
    city: String, state: String, country: String, pincode: String,
  },
  emergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, required: true },
    isNotifyOnSOS: { type: Boolean, default: false },
  }],
  avatarUrl: String,
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

export const Profile = mongoose.model<IProfile>('Profile', ProfileSchema);
