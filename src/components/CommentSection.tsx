import React, { useState } from 'react';
import { List, Card, Input, Button, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Comment {
  _id: string;
  text: string;
  userId: {
    _id: string;
    fullName: string;
  };
  createdAt: string;
}

interface CommentSectionProps {
  workspaceId: string;
  comments: Comment[];
  fetchComments: (workspaceId: string) => Promise<Comment[]>;
}

const CommentSection: React.FC<CommentSectionProps> = ({ workspaceId, comments, fetchComments }) => {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      message.warning('Yorum yapmak için giriş yapmalısınız');
      return;
    }

    if (!newComment.trim()) {
      message.warning('Lütfen bir yorum yazın');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Oturum süreniz dolmuş, lütfen tekrar giriş yapın');
        return;
      }

      console.log('Sending comment request:', {
        workspaceId,
        text: newComment,
        hasToken: true
      });

      const response = await axios.post(
        `http://localhost:5000/api/workspaces/${workspaceId}/comments`,
        { text: newComment },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Comment response:', response.data);
      setNewComment('');
      await fetchComments(workspaceId);
      message.success('Yorumunuz eklendi');
    } catch (error) {
      console.error('Comment submission error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.details || 
                          error.response?.data?.error || 
                          'Yorum eklenirken bir hata oluştu';
      
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card size="small" title="Yorumlar">
      {user && (
        <div style={{ marginBottom: 16 }}>
          <Input.TextArea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Yorumunuzu yazın..."
            rows={2}
            style={{ marginBottom: 8 }}
          />
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!newComment.trim()}
          >
            Yorum Yap
          </Button>
        </div>
      )}

      <List
        dataSource={comments}
        locale={{ emptyText: 'Henüz yorum yapılmamış' }}
        renderItem={comment => (
          <List.Item>
            <List.Item.Meta
              title={comment.userId.fullName}
              description={comment.text}
            />
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default CommentSection;