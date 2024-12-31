import React from 'react';
import { Card, Typography } from 'antd';
import AppLayout from '../components/Layout/AppLayout';
import GoogleMapComponent from '../components/GoogleMapComponent';

const { Title, Text } = Typography;

const MainScreen: React.FC = () => {
  return (
    <AppLayout>
      <Card style={{ marginBottom: '24px' }}>
        <h1>Hoş Geldiniz</h1>
        <p>Focus Map ile konumunuzu takip edin.</p>
      </Card>
      <Card
            style={{
              borderRadius: 10,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              padding: '10px',
            }}
          >
            <Title level={3} style={{ marginBottom: '20px' }}>
              Harita
            </Title>
            <GoogleMapComponent />
          </Card>
    </AppLayout>
  );
};

export default MainScreen; 