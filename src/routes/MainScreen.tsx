import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Row, Col, Select, Space, InputNumber, AutoComplete, List, Rate, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EnvironmentOutlined, WifiOutlined, SoundOutlined, ThunderboltOutlined } from '@ant-design/icons';
import AppLayout from '../components/Layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { useMediaQuery } from 'react-responsive';
import axios from 'axios';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface LocationType {
  label: string;
  value: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const MainScreen: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState<LocationType | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    wifi: 3,
    quiet: 3,
    power: 3
  });

  // Konum önerileri için örnek veri
  const locationOptions = [
    { label: 'Mevcut Konum', value: 'current', coordinates: { lat: 0, lng: 0 } },
    { label: 'Turgutlu Merkez', value: 'turgutlu', coordinates: { lat: 38.50055, lng: 27.69973 } },
  ];

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            label: 'Mevcut Konum',
            value: 'current',
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          };
          setLocation(newLocation);
          setSearchText('Mevcut Konum');
        },
        (error) => {
          console.error('Konum alınamadı:', error);
        }
      );
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/workspaces/approved');
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Mekanlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWorkspaces = (workspace: any) => {
    return (
      workspace.ratings.wifi >= filters.wifi &&
      workspace.ratings.quiet >= filters.quiet &&
      workspace.ratings.power >= filters.power
    );
  };

  return (
    <AppLayout>
      <Card style={{ 
        marginBottom: isMobile ? '16px' : '24px', 
        textAlign: 'center',
        borderRadius: '12px'
      }}>
        <Title level={isMobile ? 3 : 2}>Çalışma Mekanı Bul</Title>
        <Paragraph>
          Konumunuza yakın en iyi çalışma mekanlarını keşfedin
        </Paragraph>
      </Card>

      <Card style={{ 
        marginBottom: isMobile ? '16px' : '24px',
        borderRadius: '12px'
      }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col span={isMobile ? 24 : 20}>
              <AutoComplete
                value={searchText}
                style={{ width: '100%' }}
                options={locationOptions}
                placeholder="Konum seçin veya arayın"
                onChange={(value) => setSearchText(value)}
                onSelect={(value, option: any) => {
                  setLocation(option);
                  setSearchText(option.label);
                }}
              />
            </Col>
            <Col span={isMobile ? 24 : 4}>
              <Button 
                type="primary" 
                icon={<EnvironmentOutlined />}
                onClick={getCurrentLocation}
                block
              >
                Konumumu Bul
              </Button>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {[
              { key: 'wifi', icon: <WifiOutlined />, label: 'WiFi' },
              { key: 'quiet', icon: <SoundOutlined />, label: 'Sessizlik' },
              { key: 'power', icon: <ThunderboltOutlined />, label: 'Priz' }
            ].map((item) => (
              <Col span={isMobile ? 24 : 8} key={item.key}>
                <InputNumber
                  min={0}
                  max={10}
                  value={filters[item.key as keyof typeof filters]}
                  style={{ width: '100%' }}
                  addonBefore={item.icon}
                  addonAfter={item.label}
                  onChange={(value) => setFilters(prev => ({ ...prev, [item.key]: value ?? 0 }))}
                />
              </Col>
            ))}
          </Row>

          <Button 
            type="primary" 
            size={isMobile ? 'large' : 'middle'} 
            block
            onClick={() => navigate('/map', { state: { location, filters } })}
          >
            Mekanları Göster
          </Button>
        </Space>
      </Card>

      <Card style={{ marginTop: '24px', borderRadius: '12px' }}>
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={workspaces.filter(filterWorkspaces)}
          renderItem={(workspace) => (
            <List.Item>
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
                <Space>
                  <WifiOutlined />
                  <Rate disabled defaultValue={workspace.ratings.wifi} count={10} />
                </Space>
                <Space>
                  <SoundOutlined />
                  <Rate disabled defaultValue={workspace.ratings.quiet} count={10} />
                </Space>
                <Space>
                  <ThunderboltOutlined />
                  <Rate disabled defaultValue={workspace.ratings.power} count={10} />
                </Space>
                <Button 
                  type="primary"
                  onClick={() => {
                    navigate('/map', { 
                      state: { 
                        location: {
                          label: workspace.name,
                          value: workspace._id,
                          coordinates: workspace.address.coordinates
                        },
                        filters
                      } 
                    });
                  }}
                >
                  Haritada Göster
                </Button>
              </Space>
            </List.Item>
          )}
        />
      </Card>

      {!isLoggedIn && (
        <Card style={{ textAlign: 'center', marginTop: '24px' }}>
          <Title level={4}>Favori mekanlarınızı kaydetmek için giriş yapın</Title>
          <Button type="primary" onClick={() => navigate('/profile')}>
            Giriş Yap / Kayıt Ol
          </Button>
        </Card>
      )}
    </AppLayout>
  );
};

export default MainScreen; 