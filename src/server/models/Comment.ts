import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  details: {
    commentedAt: Date;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
  };
}

const commentSchema = new Schema<IComment>({
  workspaceId: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  details: {
    commentedAt: {
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

export default mongoose.model<IComment>('Comment', commentSchema); 