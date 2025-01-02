import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  type: 'cafe' | 'library';
  status: 'pending' | 'approved' | 'rejected';
  addressId: mongoose.Types.ObjectId;
  details: {
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
  };
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  addressId: {
    type: Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  details: {
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
  }
});

export default mongoose.model<IWorkspace>('Workspace', workspaceSchema); 