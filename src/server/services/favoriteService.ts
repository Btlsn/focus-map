import Favorite from '../models/Favorite';
import mongoose from 'mongoose';

export const favoriteService = {
  async addFavorite(userId: string, workspaceId: string) {
    try {
      const favorite = new Favorite({
        userId,
        workspaceId
      });
      return await favorite.save();
    } catch (error) {
      if (error.code === 11000) { // Duplicate key error
        throw new Error('Bu mekan zaten favorilerinizde');
      }
      throw error;
    }
  },

  async removeFavorite(userId: string, workspaceId: string) {
    return await Favorite.findOneAndDelete({ userId, workspaceId });
  },

  async getUserFavorites(userId: string) {
    try {
      const favorites = await Favorite.aggregate([
        {
          $match: { 
            userId: userId 
          }
        },
        {
          $lookup: {
            from: 'workspaces',
            let: { workspaceId: "$workspaceId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", { $toObjectId: "$$workspaceId" }] }
                }
              }
            ],
            as: 'workspace'
          }
        },
        {
          $unwind: '$workspace'
        },
        {
          $lookup: {
            from: 'addresses',
            let: { addressId: "$workspace.addressId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$_id", { $toObjectId: "$$addressId" }] }
                }
              }
            ],
            as: 'address'
          }
        },
        {
          $unwind: '$address'
        },
        {
          $lookup: {
            from: 'ratings',
            let: { workspaceId: "$workspaceId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$workspaceId", "$$workspaceId"] }
                }
              }
            ],
            as: 'ratings'
          }
        },
        {
          $project: {
            _id: "$workspace._id",
            name: "$workspace.name",
            type: "$workspace.type",
            status: "$workspace.status",
            address: {
              fullAddress: "$address.fullAddress",
              city: "$address.city",
              district: "$address.district",
              coordinates: "$address.coordinates"
            },
            ratings: {
              wifi: { $avg: "$ratings.categories.wifi" },
              quiet: { $avg: "$ratings.categories.quiet" },
              power: { $avg: "$ratings.categories.power" },
              cleanliness: { $avg: "$ratings.categories.cleanliness" },
              taste: { $avg: "$ratings.categories.taste" },
              resources: { $avg: "$ratings.categories.resources" },
              computers: { $avg: "$ratings.categories.computers" }
            },
            createdAt: 1
          }
        },
        {
          $addFields: {
            ratings: {
              wifi: { $ifNull: ["$ratings.wifi", 0] },
              quiet: { $ifNull: ["$ratings.quiet", 0] },
              power: { $ifNull: ["$ratings.power", 0] },
              cleanliness: { $ifNull: ["$ratings.cleanliness", 0] },
              taste: { $ifNull: ["$ratings.taste", 0] },
              resources: { $ifNull: ["$ratings.resources", 0] },
              computers: { $ifNull: ["$ratings.computers", 0] }
            }
          }
        }
      ]);

      return favorites;
    } catch (error) {
      console.error('Favoriler alınırken hata:', error);
      throw error;
    }
  },

  async isFavorite(userId: string, workspaceId: string) {
    const favorite = await Favorite.findOne({ userId, workspaceId });
    return !!favorite;
  }
}; 