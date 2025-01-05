import Comment from '@models/Comment';
import Workspace from '@models/Workspace';

export const commentService = {
  CommentService: {
    CommentPort: {
      async getWorkplaceComments(args: { workspaceId: string }) {
        try {
          const comments = await Comment.find({ 
            workspaceId: args.workspaceId 
          }).sort({ createdAt: -1 });
          
          return {
            comments: comments.map(comment => ({
              id: comment._id,
              content: comment.comment,
              userId: comment.userId,
              createdAt: comment.details.commentedAt
            }))
          };
        } catch (error) {
          throw error;
        }
      },

      async addComment(args: { 
        workspaceId: string, 
        userId: string, 
        content: string 
      }) {
        try {
          const comment = new Comment({
            workspaceId: args.workspaceId,
            userId: args.userId,
            content: args.content
          });

          await comment.save();

          return {
            comment: {
              id: comment._id,
              content: comment.content,
              userId: comment.userId,
              createdAt: comment.createdAt
            }
          };
        } catch (error) {
          throw error;
        }
      }
    }
  }
}; 