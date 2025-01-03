import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Row, Col, Select, Space, InputNumber, AutoComplete, List, Rate, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EnvironmentOutlined, WifiOutlined, SoundOutlined, ThunderboltOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import AppLayout from '../components/Layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { useMediaQuery } from 'react-responsive';
import axios from 'axios';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface LocationType {
  label: string;
  value: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: {
    country?: string;
    city?: string;
    district?: string;
    neighborhood?: string;
    fullAddress?: string;
  };
}

// İki nokta arasındaki mesafeyi kilometre cinsinden hesapla
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Kilometre cinsinden mesafe
  
  return distance;
};

const MainScreen: React.FC = () => {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState<LocationType | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    wifi: 0,
    quiet: 0,
    power: 0
  });
  const [addressFilter, setAddressFilter] = useState({
    country: '',
    city: '',
    district: '',
    neighborhood: ''
  });
  const [favorites, setFavorites] = useState<string[]>([]);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: 'tr' },
    },
    debounce: 300,
  });

  const handleAddressSelect = async (address: string) => {
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      
      const addressComponents = results[0].address_components;
      const getComponent = (type: string) => {
        const component = addressComponents.find(comp => 
          comp.types.includes(type)
        );
        return component?.long_name || '';
      };

      setLocation({
        label: address,
        value: 'selected',
        coordinates: { lat, lng },
        address: {
          country: getComponent('country'),
          city: getComponent('administrative_area_level_1'),
          district: getComponent('administrative_area_level_2'),
          neighborhood: getComponent('sublocality'),
          fullAddress: address
        }
      });

      setAddressFilter({
        country: getComponent('country'),
        city: getComponent('administrative_area_level_1'),
        district: getComponent('administrative_area_level_2'),
        neighborhood: getComponent('sublocality')
      });

      clearSuggestions();
    } catch (error) {
      console.error('Adres dönüştürme hatası:', error);
    }
  };

  const addressSuggestions = data.map(suggestion => ({
    value: suggestion.description,
    label: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <EnvironmentOutlined style={{ marginRight: 8 }} />
        {suggestion.description}
      </div>
    )
  }));

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
          
          // Geocoding API ile adres bilgilerini al
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: { 
              lat: position.coords.latitude, 
              lng: position.coords.longitude 
            }}, 
            (results, status) => {
              if (status === 'OK' && results?.[0]) {
                const addressComponents = results[0].address_components;
                
                const getComponent = (type: string) => {
                  const component = addressComponents.find(comp => 
                    comp.types.includes(type)
                  );
                  return component?.long_name || '';
                };

                setAddressFilter({
                  country: getComponent('country'),
                  city: getComponent('administrative_area_level_1'),
                  district: getComponent('administrative_area_level_2'),
                  neighborhood: getComponent('sublocality')
                });
              }
            }
          );
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
    const ratings = workspace.ratings || {};
    return (
      (ratings.wifi || 0) >= filters.wifi &&
      (ratings.quiet || 0) >= filters.quiet &&
      (ratings.power || 0) >= filters.power
    );
  };

  const filterByAddress = (workspace: any) => {
    if (!addressFilter.country && !addressFilter.city && 
        !addressFilter.district && !addressFilter.neighborhood) {
      return true;
    }

    return (
      (!addressFilter.country || workspace.address.country === addressFilter.country) &&
      (!addressFilter.city || workspace.address.city === addressFilter.city) &&
      (!addressFilter.district || workspace.address.district === addressFilter.district) &&
      (!addressFilter.neighborhood || workspace.address.neighborhood === addressFilter.neighborhood)
    );
  };

  // Workspace'leri filtrele
  const filteredWorkspaces = workspaces
    .filter(filterByAddress)
    .filter(filterWorkspaces)
    .filter(workspace => {
      if (location?.coordinates) {
        const distance = calculateDistance(
          location.coordinates.lat,
          location.coordinates.lng,
          workspace.address.coordinates.lat,
          workspace.address.coordinates.lng
        );
        return distance <= 5; // 5km yarıçapında
      }
      return true;
    });

  // Favori durumlarını kontrol et
  const checkFavorites = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const promises = workspaces.map(workspace =>
        axios.get(`http://localhost:5000/api/favorites/check/${workspace._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      const results = await Promise.all(promises);
      const favoriteIds = workspaces
        .filter((_, index) => results[index].data.isFavorite)
        .map(workspace => workspace._id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Favori kontrolü yapılırken hata:', error);
    }
  };

  // Favoriye ekle/çıkar
  const toggleFavorite = async (workspaceId: string) => {
    if (!user) {
      message.warning('Favoriye eklemek için giriş yapmalısınız');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const isFavorite = favorites.includes(workspaceId);

      if (isFavorite) {
        await axios.delete(`http://localhost:5000/api/favorites/${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavorites(favorites.filter(id => id !== workspaceId));
        message.success('Favorilerden çıkarıldı');
      } else {
        await axios.post('http://localhost:5000/api/favorites', 
          { workspaceId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites([...favorites, workspaceId]);
        message.success('Favorilere eklendi');
      }
    } catch (error) {
      message.error('İşlem sırasında bir hata oluştu');
    }
  };

  useEffect(() => {
    if (workspaces.length > 0) {
      checkFavorites();
    }
  }, [workspaces, user]);

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
                value={value}
                options={addressSuggestions}
                onSelect={handleAddressSelect}
                onChange={setValue}
                placeholder="Adres veya konum arayın..."
                style={{ width: '100%' }}
                disabled={!ready}
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
                  max={5}
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
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 3,
            xxl: 4,
          }}
          dataSource={filteredWorkspaces}
          renderItem={(workspace) => (
            <List.Item>
              <Card
                actions={[
                  <Button
                    type="text"
                    icon={favorites.includes(workspace._id) ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                    onClick={() => toggleFavorite(workspace._id)}
                  >
                    {favorites.includes(workspace._id) ? 'Favorilerde' : 'Favoriye Ekle'}
                  </Button>,
                  <Button
                    type="link"
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
                <Space>
  <WifiOutlined />
  <Rate disabled defaultValue={workspace.ratings.wifi} count={5} />
</Space>
<Space>
  <SoundOutlined />
  <Rate disabled defaultValue={workspace.ratings.quiet} count={5} />
</Space>
<Space>
  <ThunderboltOutlined />
  <Rate disabled defaultValue={workspace.ratings.power} count={5} />
</Space>
                </Space>
              </Card>
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