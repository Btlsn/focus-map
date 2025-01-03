import Workspace, { IWorkspace } from '../models/Workspace';
import { Types } from 'mongoose';
import Rating from '../models/Rating';

export const workspaceService = {
  async createWorkspace(workspaceData: Partial<IWorkspace>) {
    const workspace = new Workspace({
      ...workspaceData,
      status: workspaceData.status || 'pending'
    });
    console.log('Workspace before save:', workspace);
    return await workspace.save();
  },

  async getWorkspaces(status: 'pending' | 'approved' | 'rejected') {
    try {
      const workspaces = await Workspace.find({ status })
        .populate({
          path: 'details.createdBy',
          select: 'fullName email'
        })
        .populate({
          path: 'addressId',
          select: 'country city district neighborhood fullAddress coordinates'
        })
        .lean()
        .exec();

      // Rating bilgilerini de ekleyelim
      const workspacesWithRatings = await Promise.all(
        workspaces.map(async (workspace) => {
          const ratings = await Rating.find({ workspaceId: workspace._id });
          const averageRatings = {
            wifi: 0,
            quiet: 0,
            power: 0,
            cleanliness: 0
          };

          if (ratings.length > 0) {
            ratings.forEach(rating => {
              // Her bir rating kategorisini topla
              Object.keys(averageRatings).forEach(key => {
                averageRatings[key] += rating.categories[key] / ratings.length;
              });
            });
          }

          return {
            ...workspace,
            address: workspace.addressId,
            ratings: averageRatings
          };
        })
      );

      return workspacesWithRatings;
    } catch (error) {
      console.error('Workspace listesi alınırken hata:', error);
      throw error;
    }
  },

  async approveWorkspace(workspaceId: string, adminId: string) {
    return await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        status: 'approved',
        'details.approvedBy': new Types.ObjectId(adminId),
        'details.approvedAt': new Date()
      },
      { new: true }
    ).populate([
      {
        path: 'details.approvedBy',
        select: 'fullName email role'
      },
      {
        path: 'details.createdBy',
        select: 'fullName email'
      },
      {
        path: 'addressId',
        select: 'country city district neighborhood fullAddress coordinates'
      }
    ]);
  },

  async rejectWorkspace(workspaceId: string) {
    return await Workspace.findByIdAndUpdate(
      workspaceId,
      { status: 'rejected' },
      { new: true }
    );
  }
}; 