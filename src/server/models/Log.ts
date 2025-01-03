import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  userId: mongoose.Types.ObjectId;
  loginDate: Date;
  ipAddress: string;
  userAgent: string;
}

const logSchema = new Schema<ILog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loginDate: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  }
});

export default mongoose.model<ILog>('Log', logSchema); 