import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  type: 'cafe' | 'library';
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  features: {
    wifi: number;
    quiet: number;
    power: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
}

const workspaceSchema = new Schema<IWorkspace>({
  name: {
    type: String,
    required: [true, 'Mekan adı zorunludur'],
    trim: true
  },
  type: {
    type: String,
    enum: ['cafe', 'library'],
    required: true
  },
  address: {
    type: String,
    required: [true, 'Adres zorunludur']
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  features: {
    wifi: { type: Number, min: 0, max: 10, default: 0 },
    quiet: { type: Number, min: 0, max: 10, default: 0 },
    power: { type: Number, min: 0, max: 10, default: 0 }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
});

export default mongoose.model<IWorkspace>('Workspace', workspaceSchema); 