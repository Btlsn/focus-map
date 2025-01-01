import React from 'react';
import { Card, Typography } from 'antd';
import AppLayout from '../components/Layout/AppLayout';
import GoogleMapComponent from '../components/GoogleMapComponent';

const { Title } = Typography;

const MapPage: React.FC = () => {
  return (
    <AppLayout>
      <Card
        style={{
          borderRadius: 10,
          border: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          padding: '10px',
        }}
      >
        <Title level={3} style={{ marginBottom: '20px' }}>
          Konum Haritası
        </Title>
        <GoogleMapComponent />
      </Card>
    </AppLayout>
  );
};

export default MapPage; 