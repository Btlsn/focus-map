import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, Marker, StandaloneSearchBox, InfoWindow } from '@react-google-maps/api';
import { Card, Input, Button, Space, message, Alert, Typography } from 'antd';
import { SearchOutlined, AimOutlined, CoffeeOutlined, BookOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Title } = Typography;

interface LocationPickerProps {
  onLocationSelect: (location: { 
    lat: number; 
    lng: number; 
    placeName?: string;
  }) => void;
  initialLocation?: { lat: number; lng: number };
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialLocation }) => {
  const [selectedMarker, setSelectedMarker] = useState<any>(initialLocation || null);
  const [tempMarker, setTempMarker] = useState<any>(null);
  const [address, setAddress] = useState<string>('');
  const [existingWorkspaces, setExistingWorkspaces] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const searchBoxRef = useRef<any>(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/workspaces/approved');
        setExistingWorkspaces(response.data);
      } catch (error) {
        console.error('Mekanlar yüklenirken hata:', error);
      }
    };
    fetchWorkspaces();
  }, []);

  const checkExistingAddress = (newAddress: string) => {
    return existingWorkspaces.find(workspace => 
      workspace.address.fullAddress === newAddress
    );
  };

  const handlePlacesChanged = () => {
    if (searchBoxRef.current) {
      const places = searchBoxRef.current.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };

        const existingWorkspace = checkExistingAddress(place.formatted_address);
        if (existingWorkspace) {
          message.error(`Bu adreste zaten "${existingWorkspace.name}" adlı bir mekan bulunuyor!`);
          return;
        }

        setTempMarker(newLocation);
        setAddress(place.formatted_address);
        onLocationSelect({
          ...newLocation,
          placeName: place.name || ''
        });
        setSelectedMarker(newLocation);
        setTempMarker(null);
      }
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const newLocation = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: newLocation }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const addressResult = results[0];
        const existingWorkspace = checkExistingAddress(addressResult.formatted_address);
        
        if (existingWorkspace) {
          message.error(`Bu adreste zaten "${existingWorkspace.name}" adlı bir mekan bulunuyor!`);
          return;
        }

        setAddress(addressResult.formatted_address);
        const establishment = addressResult.address_components.find(
          component => component.types.includes('establishment')
        );

        onLocationSelect({
          ...newLocation,
          placeName: establishment?.long_name || ''
        });

        setSelectedMarker(newLocation);
        setTempMarker(null);
      }
    });
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: newLocation }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              const addressResult = results[0];
              const existingWorkspace = checkExistingAddress(addressResult.formatted_address);
              
              if (existingWorkspace) {
                message.error(`Bu adreste zaten "${existingWorkspace.name}" adlı bir mekan bulunuyor!`);
                return;
              }

              setAddress(addressResult.formatted_address);
              const establishment = addressResult.address_components.find(
                component => component.types.includes('establishment')
              );

              onLocationSelect({
                ...newLocation,
                placeName: establishment?.long_name || ''
              });

              setSelectedMarker(newLocation);
              setTempMarker(null);
            }
          });
        },
        (error) => {
          message.error('Konum alınamadı: ' + error.message);
        }
      );
    } else {
      message.error('Tarayıcınız konum özelliğini desteklemiyor.');
    }
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
        <StandaloneSearchBox
          onLoad={ref => searchBoxRef.current = ref}
          onPlacesChanged={handlePlacesChanged}
        >
          <Input
            placeholder="Konum ara..."
            prefix={<SearchOutlined />}
            suffix={
              <Button
                type="text"
                icon={<AimOutlined />}
                onClick={handleCurrentLocation}
              />
            }
          />
        </StandaloneSearchBox>

        {address && (
          <Alert
            message="Seçilen Konum"
            description={address}
            type="info"
            showIcon
          />
        )}
      </Space>

      <GoogleMap
        mapContainerStyle={{ height: 'calc(100% - 100px)', width: '100%' }}
        center={selectedMarker || { lat: 38.4192, lng: 27.1287 }}
        zoom={15}
        onClick={handleMapClick}
        options={{
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
          scrollwheel: true,
          keyboardShortcuts: false,
        }}
      >
        {/* Mevcut mekanların marker'ları */}
        {existingWorkspaces.map((workspace) => (
          <Marker
            key={workspace._id}
            position={workspace.address.coordinates}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: workspace.type === 'cafe' ? '#1890ff' : '#52c41a',
              fillOpacity: 0.6,
              strokeWeight: 2,
              strokeColor: '#ffffff',
            }}
            onClick={() => setSelectedWorkspace(workspace)}
          />
        ))}

        {/* Seçili marker */}
        {selectedMarker && (
          <Marker
            position={selectedMarker}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#f5222d',
              fillOpacity: 0.8,
              strokeWeight: 3,
              strokeColor: '#ffffff',
            }}
          />
        )}

        {/* InfoWindow için */}
        {selectedWorkspace && (
          <InfoWindow
            position={selectedWorkspace.address.coordinates}
            onCloseClick={() => setSelectedWorkspace(null)}
          >
            <Card size="small" style={{ width: 200, border: 'none' }}>
              <Space direction="vertical" size="small">
                <Space>
                  {selectedWorkspace.type === 'cafe' ? 
                    <CoffeeOutlined style={{ color: '#1890ff' }} /> :
                    <BookOutlined style={{ color: '#52c41a' }} />
                  }
                  <Text strong>{selectedWorkspace.name}</Text>
                </Space>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {selectedWorkspace.address.fullAddress}
                </Text>
              </Space>
            </Card>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default LocationPicker; 