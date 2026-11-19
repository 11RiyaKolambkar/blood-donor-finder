import mongoose, { Schema, Document, Types } from 'mongoose';
import { BloodGroup } from '../types';

export type InventoryUnitStatus = 'available' | 'reserved' | 'expired' | 'discarded' | 'transfused';

export interface IInventory extends Document {
  bloodBankId: Types.ObjectId;
  bloodGroup: BloodGroup;
  units: number;
  status: InventoryUnitStatus;
  expiryDate: Date;
  storageLocation?: string;
  donorId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>({
  bloodBankId: { type: Schema.Types.ObjectId, ref: 'BloodBank', required: true, index: true },
  bloodGroup: { type: String, enum: Object.values(BloodGroup), required: true, index: true },
  units: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['available', 'reserved', 'expired', 'discarded', 'transfused'], default: 'available', index: true },
  expiryDate: { type: Date, required: true, index: true },
  storageLocation: String,
  donorId: { type: Schema.Types.ObjectId, ref: 'Donor' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  notes: String,
}, { timestamps: true });

InventorySchema.index({ bloodBankId: 1, bloodGroup: 1, status: 1 });
InventorySchema.index({ expiryDate: 1, status: 1 });

export const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);
