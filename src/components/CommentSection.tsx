// src/components/CommentSection.tsx
import React, { useState } from 'react';
import { List, Input, Button, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
}

interface CommentSectionProps {
  workspaceId: string;
  comments: Comment[];
  fetchComments: (workspaceId: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ 
  workspaceId, 
  comments, 
  fetchComments 
}) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  const handleAddComment = async () => {
    if (!user) {
      message.error('Yorum yapmak için giriş yapmalısınız');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/workspaces/${workspaceId}/comments`, {
        userId: user.id,
        content: newComment
      });

      setNewComment('');
      fetchComments(workspaceId);
      message.success('Yorumunuz eklendi');
    } catch (error) {
      console.error('Yorum ekleme hatası:', error);
      message.error('Yorum eklenirken bir hata oluştu');
    }
  };

  return (
    <div>
      <List
        header={<div>Yorumlar</div>}
        dataSource={comments}
        renderItem={comment => (
          <List.Item>
            <List.Item.Meta
              title={comment.userId}
              description={comment.content}
            />
          </List.Item>
        )}
      />
      {user && (
        <div style={{ marginTop: 16 }}>
          <Input.TextArea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Yorumunuzu yazın..."
            rows={4}
          />
          <Button 
            type="primary" 
            onClick={handleAddComment}
            style={{ marginTop: 8 }}
          >
            Yorum Ekle
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;