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
    if (!req.user?.userId) {
      console.error('No user ID in request');
      return res.status(401).json({ error: 'User ID not found' });
    }

    if (!req.body.text) {
      console.error('No comment text provided');
      return res.status(400).json({ error: 'Comment text is required' });
    }

    console.log('Creating comment with data:', {
      workspaceId: req.params.workspaceId,
      userId: req.user.userId,
      text: req.body.text
    });

    const comment = new Comment({
      workspaceId: req.params.workspaceId,
      userId: req.user.userId,
      text: req.body.text
    });

    await comment.save();
    
    const populatedComment = await Comment
      .findById(comment._id)
      .populate('userId', 'fullName');
    
    if (!populatedComment) {
      throw new Error('Failed to populate comment');
    }

    console.log('Successfully created comment:', populatedComment);
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error in comment creation:', error);
    res.status(500).json({ 
      error: 'Error creating comment',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;