import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '600px',
};

const center = {
  lat: 38.50055,
  lng: 27.69973,
};

const mapStyles = [
  {
    featureType: 'all',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }, { color: '#ffffff' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#a2daf2' }],
  },
];

const mapOptions = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: 'greedy',
};

const GoogleMapComponent: React.FC = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const markers = [
    { id: 1, position: { lat: 38.50055, lng: 27.69973 }, name: "Turgutlu HFFT" },
  ];

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      options={mapOptions}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {markers.map((marker) => (
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
  );
};

export default React.memo(GoogleMapComponent);
