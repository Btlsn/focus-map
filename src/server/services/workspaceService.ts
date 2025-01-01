import Workspace, { IWorkspace } from '../models/Workspace';
import { Types } from 'mongoose';

export const workspaceService = {
  async createWorkspace(workspaceData: Partial<IWorkspace>, userId: string) {
    const workspace = new Workspace({
      ...workspaceData,
      createdBy: new Types.ObjectId(userId),
      status: 'pending'
    });
    return await workspace.save();
  },

  async getWorkspaces(status?: string) {
    const query = status ? { status } : {};
    return await Workspace.find(query).populate('createdBy', 'fullName email');
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