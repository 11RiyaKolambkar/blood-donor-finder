import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types';

export interface IUser extends Document {
  email: string;
  phone: string;
  passwordHash: string;
  roles: UserRole[];
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, required: true, unique: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  roles: [{ type: String, enum: Object.values(UserRole), default: [UserRole.PATIENT] }],
  isActive: { type: Boolean, default: true, index: true },
  isVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
}, { timestamps: true });

UserSchema.index({ email: 1, isActive: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
