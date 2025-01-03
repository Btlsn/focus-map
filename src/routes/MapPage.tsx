import React from 'react';
import { Layout } from 'antd';
import AppLayout from '../components/Layout/AppLayout';
import GoogleMapComponent from '../components/GoogleMapComponent';

const MapPage: React.FC = () => {
  return (
    <AppLayout>
      <Layout.Content style={{ 
        height: 'calc(100vh - 64px)',
        padding: 0,
        margin: 0,
        overflow: 'hidden'
      }}>
        <GoogleMapComponent />
      </Layout.Content>
    </AppLayout>
  );
};

export default MapPage; 