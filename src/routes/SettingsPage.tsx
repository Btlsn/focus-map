import React from 'react';
import { Card } from 'antd';
import AppLayout from '../components/Layout/AppLayout';

const SettingsPage: React.FC = () => {
  return (
    <AppLayout>
      <Card>
        <h1>Ayarlar</h1>
        <p>Uygulama ayarlarınızı buradan yönetebilirsiniz.</p>
      </Card>
    </AppLayout>
  );
};

export default SettingsPage; 