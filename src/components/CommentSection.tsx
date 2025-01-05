// src/components/CommentSection.tsx
import React, { useState } from 'react';
import { List, Card, Form, Button, Input, message, Typography } from 'antd';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const { TextArea } = Input;
const { Text } = Typography;

interface Comment {
  _id: string;
  userId: string;
  comment: string;
  details: {
    commentedAt: string;
  };
}

interface CommentSectionProps {
  workspaceId: string;
  comments: Comment[];
  fetchComments: (workspaceId: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ workspaceId, comments, fetchComments }) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  const handleAddComment = async () => {
    if (!user) {
      message.error('Yorum yapmak için giriş yapmalısınız');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/workspaces/${workspaceId}/comments`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success('Yorumunuz kaydedildi');
      setNewComment('');
      fetchComments(workspaceId);
    } catch (error) {
      console.error('Yorum eklenirken hata:', error);
      message.error('Yorum eklenirken bir hata oluştu');
    }
  };

  return (
    <Card size="small" title="Yorumlar">
      <List
        dataSource={comments}
        renderItem={(comment) => (
          <List.Item>
            <List.Item.Meta
              title={comment.userId}
              description={comment.comment}
            />
            <Text type="secondary">{new Date(comment.details.commentedAt).toLocaleString()}</Text>
          </List.Item>
        )}
      />
      {user && (
        <Form onFinish={handleAddComment}>
          <Form.Item>
            <TextArea 
              rows={4} 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              placeholder="Yorumunuzu yazın..." 
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Yorum Yap
            </Button>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
};

export default CommentSection;