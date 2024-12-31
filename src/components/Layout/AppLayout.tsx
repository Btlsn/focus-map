import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, UserOutlined, SettingOutlined, BellOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
          Focus Map
        </div>
        <Menu 
          mode="horizontal" 
          selectedKeys={[location.pathname]}
          style={{ flex: 1, justifyContent: 'flex-end', border: 'none' }}
        >
          <Menu.Item key="/" icon={<HomeOutlined />}>
            <Link to="/">Ana Sayfa</Link>
          </Menu.Item>
          <Menu.Item key="/profile" icon={<UserOutlined />}>
            <Link to="/profile">Profil</Link>
          </Menu.Item>
          <Menu.Item key="/settings" icon={<SettingOutlined />}>
            <Link to="/settings">Ayarlar</Link>
          </Menu.Item>
          <Menu.Item key="/notifications" icon={<BellOutlined />}>
            <Link to="/notifications">Bildirimler</Link>
          </Menu.Item>
        </Menu>
      </Header>

      <Content style={{ padding: '24px', backgroundColor: '#f5f5f5' }}>
        {children}
      </Content>

      <Footer style={{ textAlign: 'center', backgroundColor: '#fff' }}>
        Focus Map ©2024 - Tüm Hakları Saklıdır
      </Footer>
    </Layout>
  );
};

export default AppLayout; 