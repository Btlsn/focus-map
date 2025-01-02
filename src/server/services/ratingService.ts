import Rating, { IRating } from '../models/Rating';
import Workspace from '../models/Workspace';
import { Types } from 'mongoose';

export const ratingService = {
  async createRating(ratingData: Partial<IRating>) {
    // Workspace tipini kontrol et
    const workspace = await Workspace.findById(ratingData.workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Mekan tipine göre doğru rating kategorilerini kontrol et
    const rating = new Rating({
      ...ratingData,
      categories: {
        ...ratingData.categories,
        // Temel özellikleri ekle
        wifi: ratingData.categories?.wifi || 0,
        quiet: ratingData.categories?.quiet || 0,
        power: ratingData.categories?.power || 0,
        cleanliness: ratingData.categories?.cleanliness || 0,
      }
    });

    return await rating.save();
  },

  async getWorkspaceRatings(workspaceId: string) {
    return await Rating.find({ workspaceId })
      .populate('userId', 'fullName')
      .lean()
      .exec();
  },

  async getAverageRatings(workspaceId: string) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const ratings = await Rating.find({ workspaceId });
    if (ratings.length === 0) {
      return null;
    }

    // Temel özelliklerin ortalamasını hesapla
    const baseAverages = {
      wifi: 0,
      quiet: 0,
      power: 0,
      cleanliness: 0
    };

    // Mekan tipine özel özelliklerin ortalamasını hesapla
    const specificAverages: any = workspace.type === 'cafe' 
      ? { taste: 0 }
      : { resources: 0, computers: 0 };

    ratings.forEach(rating => {
      Object.keys(baseAverages).forEach(key => {
        baseAverages[key as keyof typeof baseAverages] += rating.categories[key] / ratings.length;
      });

      if (workspace.type === 'cafe') {
        specificAverages.taste += rating.categories.taste / ratings.length;
      } else {
        specificAverages.resources += rating.categories.resources / ratings.length;
        specificAverages.computers += rating.categories.computers / ratings.length;
      }
    });

    return {
      ...baseAverages,
      ...specificAverages,
      totalRatings: ratings.length
    };
  }
}; 