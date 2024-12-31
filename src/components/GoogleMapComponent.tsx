import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

// Harita kapsayıcı stili
const containerStyle = {
  width: '100%',
  height: '600px',
};

// Harita merkezi (Turgutlu HFFT koordinatları)
const center = {
  lat: 38.50055, // Turgutlu HFFT'nin enlemi
  lng: 27.69973, // Turgutlu HFFT'nin boylamı
};

// Harita stili (minimalist)
const mapStyles = [
  {
    featureType: 'all',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }], // Etiketleri gizler
  },
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }], // İlgi noktalarını gizler
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }, { color: '#ffffff' }], // Yolları açık tutar
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#a2daf2' }], // Su alanlarına renk verir
  },
];

// Harita ayarları
const mapOptions = {
  styles: mapStyles,        // Minimalist stil
  disableDefaultUI: true,   // Varsayılan UI öğelerini gizler
  zoomControl: true,        // Zoom kontrolünü aktif eder
  gestureHandling: 'greedy', // CTRL olmadan yakınlaştırmayı sağlar
};

const GoogleMapComponent: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  const markers = [
    { id: 1, position: { lat: 38.50055, lng: 27.69973 }, name: "Turgutlu HFFT" },
  ];

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <LoadScript 
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
      onLoad={handleLoad}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        options={mapOptions}
      >
        {isLoaded && markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={{
              url: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;
