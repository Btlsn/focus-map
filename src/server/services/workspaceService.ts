import Workspace, { IWorkspace } from '../models/Workspace';
import { Types } from 'mongoose';

export const workspaceService = {
  async createWorkspace(workspaceData: Partial<IWorkspace>) {
    const workspace = new Workspace({
      ...workspaceData,
      status: workspaceData.status || 'pending'
    });
    console.log('Workspace before save:', workspace);
    return await workspace.save();
  },

  async getWorkspaces(status?: string) {
    const query = status ? { status } : {};
    return await Workspace.find(query)
      .populate({
        path: 'createdBy',
        select: 'fullName email role',
        model: 'User'
      })
      .populate({
        path: 'approvedBy',
        select: 'fullName email role',
        model: 'User'
      })
      .lean()
      .exec();
  },

  async approveWorkspace(workspaceId: string, adminId: string) {
    return await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        status: 'approved',
        approvedBy: new Types.ObjectId(adminId),
        approvedAt: new Date()
      },
      { new: true }
    );
  },

  async rejectWorkspace(workspaceId: string) {
    return await Workspace.findByIdAndUpdate(
      workspaceId,
      { status: 'rejected' },
      { new: true }
    );
  }
}; 