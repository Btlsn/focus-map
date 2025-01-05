import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  type: 'workspace_approved' | 'workspace_rejected';
  workspaceId: string;
  workspaceName: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: ['workspace_approved', 'workspace_rejected']
  },
  workspaceId: {
    type: String,
    required: true,
    ref: 'Workspace'
  },
  workspaceName: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<INotification>('Notification', notificationSchema); 