import { Request, Response } from 'express';
import Comment from '../models/Comment';
import mongoose from 'mongoose';

export const commentController = {
  async getWorkspaceComments(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ message: 'Geçersiz mekan ID' });
      }

      const comments = await Comment.find({ workspaceId })
        .populate('userId', 'username')
        .sort({ createdAt: -1 });

      res.json(comments);
    } catch (error) {
      console.error('Error getting comments:', error);
      res.status(500).json({ message: 'Yorumlar alınırken bir hata oluştu' });
    }
  },

  async addComment(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params;
      const { text } = req.body;
      const userId = req.user?._id;

      if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        return res.status(400).json({ message: 'Geçersiz mekan ID' });
      }

      const comment = new Comment({
        workspaceId,
        userId,
        text
      });

      await comment.save();

      const populatedComment = await Comment.findById(comment._id)
        .populate('userId', 'username');

      res.status(201).json(populatedComment);
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ message: 'Yorum eklenirken bir hata oluştu' });
    }
  },

  async updateComment(req: Request, res: Response) {
    try {
      const { workspaceId, commentId } = req.params;
      const { text } = req.body;
      const userId = req.user?._id;

      const comment = await Comment.findOne({
        _id: commentId,
        workspaceId,
        userId
      });

      if (!comment) {
        return res.status(404).json({ message: 'Yorum bulunamadı' });
      }

      comment.text = text;
      await comment.save();

      res.json(comment);
    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).json({ message: 'Yorum güncellenirken bir hata oluştu' });
    }
  },

  async deleteComment(req: Request, res: Response) {
    try {
      const { workspaceId, commentId } = req.params;
      const userId = req.user?._id;

      const comment = await Comment.findOneAndDelete({
        _id: commentId,
        workspaceId,
        userId
      });

      if (!comment) {
        return res.status(404).json({ message: 'Yorum bulunamadı' });
      }

      res.json({ message: 'Yorum silindi' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ message: 'Yorum silinirken bir hata oluştu' });
    }
  }
};
