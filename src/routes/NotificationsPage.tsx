import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Typography, message } from 'antd';
import AppLayout from '../components/Layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import dayjs from 'dayjs';

interface Notification {
  _id: string;
  type: 'workspace_approved' | 'workspace_rejected';
  workspaceId: string;
  workspaceName: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      message.error('Bildirimler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'workspace_approved':
        return `"${notification.workspaceName}" mekanınız onaylandı!`;
      case 'workspace_rejected':
        return `"${notification.workspaceName}" mekanınız reddedildi.`;
      default:
        return 'Bilinmeyen bildirim';
    }
  };

  return (
    <AppLayout>
      <Card title="Bildirimler">
        <List
          loading={loading}
          dataSource={notifications}
          renderItem={notification => (
            <List.Item
              extra={
                <Tag color={notification.isRead ? 'default' : 'blue'}>
                  {notification.isRead ? 'Okundu' : 'Yeni'}
                </Tag>
              }
            >
              <List.Item.Meta
                title={getNotificationMessage(notification)}
                description={dayjs(notification.createdAt).format('DD/MM/YYYY HH:mm')}
              />
            </List.Item>
          )}
          locale={{ emptyText: 'Bildiriminiz bulunmuyor' }}
        />
      </Card>
    </AppLayout>
  );
};

export default NotificationsPage; 