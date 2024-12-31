import React from 'react';
import { Card } from 'antd';
import AppLayout from '../components/Layout/AppLayout';

const NotificationsPage: React.FC = () => {
  return (
    <AppLayout>
      <Card>
        <h1>Bildirimler</h1>
        <p>Bildirimleriniz burada listelenecek.</p>
      </Card>
    </AppLayout>
  );
};

export default NotificationsPage; 