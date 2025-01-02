import mongoose, { Schema, Document } from 'mongoose';

interface BaseRating {
  wifi: number;
  quiet: number;
  power: number;
  cleanliness: number;
}

interface CafeRating extends BaseRating {
  taste: number;
}

interface LibraryRating extends BaseRating {
  resources: number;
  computers: number;
}

export interface IRating extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  categories: CafeRating | LibraryRating;
}

const baseRatingSchema = {
  wifi: { type: Number, min: 0, max: 5, required: true },
  quiet: { type: Number, min: 0, max: 5, required: true },
  power: { type: Number, min: 0, max: 5, required: true },
  cleanliness: { type: Number, min: 0, max: 5, required: true }
};

const cafeRatingSchema = {
  ...baseRatingSchema,
  taste: { type: Number, min: 0, max: 5, required: true }
};

const libraryRatingSchema = {
  ...baseRatingSchema,
  resources: { type: Number, min: 0, max: 5, required: true },
  computers: { type: Number, min: 0, max: 5, required: true }
};

const ratingSchema = new Schema<IRating>({
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
  categories: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: async function(categories: CafeRating | LibraryRating) {
        const workspace = await mongoose.model('Workspace').findById(this.workspaceId);
        if (!workspace) return false;

        if (workspace.type === 'cafe') {
          return 'taste' in categories;
        } else if (workspace.type === 'library') {
          return 'resources' in categories && 'computers' in categories;
        }
        return false;
      },
      message: 'Rating categories must match workspace type'
    }
  }
});

// Puanlama başına bir kullanıcı kontrolü
ratingSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IRating>('Rating', ratingSchema); 