import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  userId: mongoose.Types.ObjectId;
  loginDate: Date;
  ipAddress: string;
  browser: {
    name: string;
    version: string;
    os: string;
  };
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
  browser: {
    name: {
      type: String,
      required: true
    },
    version: {
      type: String,
      required: true
    },
    os: {
      type: String,
      required: true
    }
  }
});

export default mongoose.model<ILog>('Log', logSchema); 