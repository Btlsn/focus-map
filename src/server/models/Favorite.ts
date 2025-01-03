import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  userId: string;
  workspaceId: string;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>({
  userId: {
    type: String,
    required: [true, 'Kullanıcı ID zorunludur'],
    ref: 'User'
  },
  workspaceId: {
    type: String,
    required: [true, 'Workspace ID zorunludur'],
    ref: 'Workspace'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Bir kullanıcının aynı workspace'i birden fazla kez favoriye eklemesini önle
favoriteSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', favoriteSchema); 