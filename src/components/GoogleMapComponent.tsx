import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const containerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
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
  const location = useLocation();
  const [center, setCenter] = useState(defaultCenter);
  const [markers, setMarkers] = useState<any[]>([]);
  const [allWorkspaces, setAllWorkspaces] = useState<any[]>([]);

  useEffect(() => {
    // Tüm onaylanmış mekanları getir
    const fetchWorkspaces = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/workspaces/approved');
        setAllWorkspaces(response.data.map((workspace: any) => ({
          id: workspace._id,
          position: workspace.coordinates,
          name: workspace.name,
          type: workspace.type
        })));
      } catch (error) {
        console.error('Mekanlar yüklenirken hata:', error);
      }
    };

    fetchWorkspaces();
  }, []);

  useEffect(() => {
    // location.state'ten gelen verileri kontrol et
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
      {allWorkspaces.map((workspace) => (
        <Marker
          key={workspace.id}
          position={workspace.position}
          title={workspace.name}
          icon={{
            url: workspace.type === 'cafe' 
              ? 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new window.google.maps.Size(32, 32),
          }}
        />
      ))}
      {/* Seçili mekan varsa onu kırmızı marker ile gösterir */}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          title={marker.name}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(32, 32),
          }}
        />
      ))}
    </GoogleMap>
  );
};

export default GoogleMapComponent;
