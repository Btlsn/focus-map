import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoadScript } from '@react-google-maps/api';
import MainScreen from './routes/MainScreen';
import ProfilePage from './routes/ProfilePage';
import SettingsPage from './routes/SettingsPage';
import NotificationsPage from './routes/NotificationsPage';
import MapPage from './routes/MapPage';
import AddWorkspacePage from './routes/AddWorkspacePage';
import AdminPage from './routes/AdminPage';

const App = () => {
  return (
    <AuthProvider>
      <LoadScript 
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
        libraries={['places']}
        loadingElement={<div>Harita yükleniyor...</div>}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainScreen />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/add-workspace" element={<AddWorkspacePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LoadScript>
    </AuthProvider>
  );
};

export default App;
