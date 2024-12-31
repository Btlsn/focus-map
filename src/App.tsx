import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainScreen from './routes/MainScreen';
import ProfilePage from './routes/ProfilePage';
import SettingsPage from './routes/SettingsPage';
import NotificationsPage from './routes/NotificationsPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
