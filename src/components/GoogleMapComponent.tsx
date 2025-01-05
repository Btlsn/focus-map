import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useLocation } from 'react-router-dom';
import { Tag, Typography, Rate, Space, Card, Radio } from 'antd';
import { WifiOutlined, SoundOutlined, ThunderboltOutlined, CoffeeOutlined, BookOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Title } = Typography;

const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 180px)',
  borderRadius: '16px',
  overflow: 'hidden'
};

const defaultCenter = {
  lat: 38.50055,
  lng: 27.69973,
};

const mapStyles = [
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#c9c9c9"}]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [{"color": "#f5f5f5"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [{"color": "#ffffff"}]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{"color": "#ffffff"}]
  },
  {
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [{"color": "#ffffff"}]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{"color": "#e5e5e5"}]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#fefefe"}]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [{"visibility": "on"}]
  },
  {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "transit",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "poi.business",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "poi.government",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [{"visibility": "off"}]
  },
  {
    "featureType": "building",
    "elementType": "geometry",
    "stylers": [{"visibility": "on"}]
  }
];

const mapOptions = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: 'greedy',
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  minZoom: 11,
  maxZoom: 18,
  backgroundColor: '#f5f5f5',
  tilt: 0,
  restriction: {
    latLngBounds: {
      north: 85,
      south: -85,
      west: -180,
      east: 180
    },
    strictBounds: true
  }
};

const GoogleMapComponent: React.FC = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const location = useLocation();
  const [center, setCenter] = useState(defaultCenter);
  const [markers, setMarkers] = useState<any[]>([]);
  const [allWorkspaces, setAllWorkspaces] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'cafe' | 'library'>('all');

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/workspaces/approved');
        const workspacesWithAddresses = response.data.map((workspace: any) => ({
          id: workspace._id,
          position: workspace.address.coordinates,
          name: workspace.name,
          type: workspace.type,
          address: workspace.address,
          ratings: workspace.ratings
        }));
        setAllWorkspaces(workspacesWithAddresses);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Mekanlar yüklenirken hata:', error.message);
          console.error('Error code:', error.code);
          console.error('Error response:', error.response);
        } else {
          console.error('Unexpected error:', error);
        }
      }
    };

    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (location.state?.location) {
      const { coordinates } = location.state.location;
      setCenter(coordinates);
      setMarkers([{
        id: 1,
        position: coordinates,
        name: location.state.location.label
      }]);
    }
  }, [location.state]);

  const getMarkerIcon = (type: string) => ({
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: type === 'cafe' ? '#1890ff' : '#52c41a',
    fillOpacity: 1,
    strokeWeight: 1,
    strokeColor: '#ffffff',
    scale: 10,
  });

  const filteredWorkspaces = allWorkspaces.filter(workspace => 
    selectedType === 'all' || workspace.type === selectedType
  );

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px',
      height: '100%',
      overflow: 'hidden'
    }}>
      <Card style={{ borderRadius: '12px' }}>
        <Radio.Group 
          value={selectedType} 
          onChange={e => setSelectedType(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="all">Tümü</Radio.Button>
          <Radio.Button value="cafe">
            <Space>
              <CoffeeOutlined />
              Kafeler
            </Space>
          </Radio.Button>
          <Radio.Button value="library">
            <Space>
              <BookOutlined />
              Kütüphaneler
            </Space>
          </Radio.Button>
        </Radio.Group>
      </Card>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        options={mapOptions}
        onLoad={setMap}
      >
        {filteredWorkspaces.map((workspace) => (
          <Marker
            key={workspace.id}
            position={workspace.position}
            onClick={() => setSelectedWorkspace(workspace)}
            icon={getMarkerIcon(workspace.type)}
          />
        ))}

        {selectedWorkspace && (
          <InfoWindow
            position={selectedWorkspace.position}
            onCloseClick={() => setSelectedWorkspace(null)}
          >
            <Card
              style={{
                width: 300,
                border: 'none',
                borderRadius: '12px',
                boxShadow: 'none',
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space align="center">
                  {selectedWorkspace.type === 'cafe' ? 
                    <CoffeeOutlined style={{ fontSize: '20px', color: '#1890ff' }} /> :
                    <BookOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                  }
                  <Title level={5} style={{ margin: 0 }}>
                    {selectedWorkspace.name}
                  </Title>
                </Space>

                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {selectedWorkspace.address.fullAddress}
                </Text>

                <Space direction="vertical" size={0} style={{ marginTop: '8px' }}>
                  <Space>
                    <WifiOutlined style={{ color: '#1890ff' }} />
                    <Rate disabled defaultValue={selectedWorkspace.ratings.wifi} style={{ fontSize: '14px' }} />
                  </Space>
                  <Space>
                    <SoundOutlined style={{ color: '#52c41a' }} />
                    <Rate disabled defaultValue={selectedWorkspace.ratings.quiet} style={{ fontSize: '14px' }} />
                  </Space>
                  <Space>
                    <ThunderboltOutlined style={{ color: '#faad14' }} />
                    <Rate disabled defaultValue={selectedWorkspace.ratings.power} style={{ fontSize: '14px' }} />
                  </Space>
                </Space>
              </Space>
            </Card>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapComponent;
