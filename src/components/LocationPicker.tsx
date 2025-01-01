import React, { useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { Card, Input, Button, Space, Popconfirm, message } from 'antd';
import { SearchOutlined, AimOutlined, PushpinOutlined } from '@ant-design/icons';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialLocation }) => {
  const [tempMarker, setTempMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMarker, setSelectedMarker] = useState(initialLocation || { lat: 38.50055, lng: 27.69973 });
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [address, setAddress] = useState<string>('');

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setTempMarker(newLocation);
      
      // Adres bilgisini al
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: newLocation }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          setAddress(results[0].formatted_address);
        }
      });
    }
  };

  const handleConfirmLocation = () => {
    if (tempMarker) {
      setSelectedMarker(tempMarker);
      onLocationSelect({ ...tempMarker, address });
      setTempMarker(null);
      message.success('Konum seçildi');
    }
  };

  const handleCancelLocation = () => {
    setTempMarker(null);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setTempMarker(location);
          map?.panTo(location);
          map?.setZoom(17);

          // Adres bilgisini al
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              setAddress(results[0].formatted_address);
            }
          });
        },
        () => message.error('Konum alınamadı')
      );
    }
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%', marginBottom: '16px' }}>
        <Input.Search
          placeholder="Konum ara..."
          onSearch={(value) => {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: value }, (results, status) => {
              if (status === 'OK' && results?.[0]?.geometry?.location) {
                const location = {
                  lat: results[0].geometry.location.lat(),
                  lng: results[0].geometry.location.lng()
                };
                setTempMarker(location);
                map?.panTo(location);
                map?.setZoom(17);
                setAddress(results[0].formatted_address);
              } else {
                message.error('Konum bulunamadı');
              }
            });
          }}
          prefix={<SearchOutlined />}
        />
        
        <Button 
          icon={<AimOutlined />}
          onClick={getCurrentLocation}
          block
        >
          Mevcut Konumumu Kullan
        </Button>
      </Space>

      <GoogleMap
        mapContainerStyle={{
          width: '100%',
          height: '400px',
          borderRadius: '8px'
        }}
        center={selectedMarker}
        zoom={15}
        onClick={handleMapClick}
        onLoad={setMap}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy'
        }}
      >
        {selectedMarker && !tempMarker && (
          <Marker
            position={selectedMarker}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              scaledSize: new window.google.maps.Size(32, 32)
            }}
          />
        )}

        {tempMarker && (
          <Marker
            position={tempMarker}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(32, 32)
            }}
          >
            <Popconfirm
              title="Konumu Onayla"
              description={address || 'Bu konumu seçmek istiyor musunuz?'}
              icon={<PushpinOutlined style={{ color: '#1890ff' }} />}
              onConfirm={handleConfirmLocation}
              onCancel={handleCancelLocation}
              okText="Seç"
              cancelText="İptal"
              open={true}
            />
          </Marker>
        )}
      </GoogleMap>
    </Card>
  );
};

export default LocationPicker; 