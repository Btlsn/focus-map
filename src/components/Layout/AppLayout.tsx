import React, { useState } from 'react';
import { Layout, Menu, Drawer, Button } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeOutlined, 
  UserOutlined, 
  EnvironmentOutlined, 
  StarOutlined,
  MenuOutlined ,
  PlusOutlined,
  SettingOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import { useAuth } from '../../contexts/AuthContext';


const { Header, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { user } = useAuth();

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: 'Kafeler' },
    { key: '/map', icon: <EnvironmentOutlined />, label: 'Harita' },
    { key: '/profile', icon: <UserOutlined />, label: 'Profil' },
    { key: '/favorites', icon: <StarOutlined />, label: 'Favoriler' },
    { key: '/add-workspace', icon: <PlusOutlined />, label: 'Mekan Ekle' },
    { key: '/pomodoro', icon: <ClockCircleOutlined />, label: 'Pomodoro' },
    ...(user?.role === 'admin' ? [
      { key: '/admin', icon: <SettingOutlined />, label: 'Admin Panel' }
    ] : [])
  ];

  const renderMenu = () => (
    <Menu
      mode="horizontal"
      selectedKeys={[location.pathname]}
      items={menuItems.map(item => ({
        key: item.key,
        icon: item.icon,
        label: <Link to={item.key}>{item.label}</Link>
      }))}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: 'bold',
          flex: isMobile ? 1 : 'none' 
        }}>
          Focus Map
        </div>
        
        {isMobile ? (
          <>
            <Button 
              type="text" 
              icon={<MenuOutlined />} 
              onClick={() => setDrawerVisible(true)}
            />
            <Drawer
              title="Menü"
              placement="right"
              onClose={() => setDrawerVisible(false)}
              visible={drawerVisible}
            >
              {renderMenu()}
            </Drawer>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {renderMenu()}
          </div>
        )}
      </Header>

      <Content style={{ 
        backgroundColor: '#f5f5f5',
        overflow: 'hidden'
      }}>
        {children}
      </Content>

      
    </Layout>
  );
};

export default AppLayout; 