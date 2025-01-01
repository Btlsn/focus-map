import React, { useState } from 'react';
import { Card, Typography, Button, Row, Col, Select, Space, InputNumber, AutoComplete } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EnvironmentOutlined, WifiOutlined, SoundOutlined, ThunderboltOutlined } from '@ant-design/icons';
import AppLayout from '../components/Layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { useMediaQuery } from 'react-responsive';

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
            {['WiFi', 'Sessizlik', 'Priz'].map((item, index) => (
              <Col span={isMobile ? 24 : 8} key={index}>
                <InputNumber
                  min={0}
                  max={10}
                  defaultValue={3}
                  style={{ width: '100%' }}
                  addonBefore={index === 0 ? <WifiOutlined /> : 
                              index === 1 ? <SoundOutlined /> : 
                              <ThunderboltOutlined />}
                  addonAfter={item}
                />
              </Col>
            ))}
          </Row>

          <Button 
            type="primary" 
            size={isMobile ? 'large' : 'middle'} 
            block
            onClick={() => navigate('/map', { state: { location, filters: {} } })}
          >
            Mekanları Göster
          </Button>
        </Space>
      </Card>

      {!isLoggedIn && (
        <Card style={{ textAlign: 'center' }}>
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