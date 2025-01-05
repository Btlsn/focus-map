import express from 'express';
import { auth } from '../middleware/auth';
import Comment from '../models/Comment';

const router = express.Router();

// Get comments for a workspace
router.get('/workspaces/:workspaceId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ workspaceId: req.params.workspaceId })
      .populate('userId', 'fullName')
      .sort('-createdAt');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching comments' });
  }
});

// Add a comment (requires authentication)
router.post('/workspaces/:workspaceId/comments', auth, async (req, res) => {
  try {
    const comment = new Comment({
      workspaceId: req.params.workspaceId,
      userId: req.user?.userId,
      text: req.body.text
    });
    await comment.save();
    
    const populatedComment = await Comment
      .findById(comment._id)
      .populate('userId', 'fullName');
    
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ error: 'Error creating comment' });
  }
});

export default router;