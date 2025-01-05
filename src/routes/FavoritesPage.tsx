import React, { useState, useEffect } from 'react';
import { Card, List, Rate, Space, Button, message, Tag } from 'antd';
import { WifiOutlined, SoundOutlined, ThunderboltOutlined, HeartFilled } from '@ant-design/icons';
import AppLayout from '../components/Layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Workspace {
  _id: string;
  name: string;
  type: 'cafe' | 'library';
  address: {
    fullAddress: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  ratings: {
    wifi: number;
    quiet: number;
    power: number;
    cleanliness: number;
    taste?: number;
    resources?: number;
    computers?: number;
  };
}

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data);
    } catch (error) {
      message.error('Favoriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (workspaceId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/favorites/${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Favori başarıyla kaldırıldı');
      fetchFavorites();
    } catch (error) {
      message.error('Favori kaldırılırken bir hata oluştu');
    }
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  if (!user) {
    return (
      <AppLayout>
        <Card>
          <h1>Giriş Yapın</h1>
          <p>Favorilerinizi görmek için lütfen giriş yapın.</p>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Card title="Favori Mekanlarım">
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={favorites}
          renderItem={(workspace) => (
            <List.Item
              actions={[
                <Button 
                  danger
                  icon={<HeartFilled />}
                  onClick={() => removeFavorite(workspace._id)}
                >
                  Favorilerden Çıkar
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    {workspace.name}
                    <Tag color={workspace.type === 'cafe' ? 'blue' : 'green'}>
                      {workspace.type === 'cafe' ? 'Kafe' : 'Kütüphane'}
                    </Tag>
                  </Space>
                }
                description={workspace.address.fullAddress}
              />
              <Space size="large">
                
                <Button 
                  type="primary"
                  onClick={() => navigate('/map', { 
                    state: { 
                      location: {
                        label: workspace.name,
                        value: workspace._id,
                        coordinates: workspace.address.coordinates
                      }
                    } 
                  })}
                >
                  Haritada Göster
                </Button>
              </Space>
            </List.Item>
          )}
        />
      </Card>
    </AppLayout>
  );
};

export default FavoritesPage; 