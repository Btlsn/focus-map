import React from 'react';
import { Layout, Menu, Typography, Button, Card, Space, Row, Col } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const MainScreen: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Üst Menü */}
      <Header
        style={{
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px',
          borderBottom: '1px solid #e8e8e8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <HomeOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={3} style={{ margin: '0 10px', color: '#1890ff' }}>
            Focus Map
          </Title>
        </div>
        <Menu mode="horizontal" defaultSelectedKeys={['1']} style={{ border: 0 }}>
          <Menu.Item key="1" icon={<HomeOutlined />}>
            Ana Sayfa
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>
            Profil
          </Menu.Item>
          <Menu.Item key="3" icon={<SettingOutlined />}>
            Ayarlar
          </Menu.Item>
          <Menu.Item key="4" icon={<BellOutlined />}>
            Bildirimler
          </Menu.Item>
        </Menu>
      </Header>

      {/* Ana İçerik */}
      <Content style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Hoşgeldiniz Kartı */}
          <Card
            style={{
              borderRadius: 10,
              border: 'none',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Title level={2} style={{ marginBottom: 0 }}>
              Hoşgeldiniz, Kullanıcı!
            </Title>
            <Text style={{ fontSize: 16, color: '#595959' }}>
              Bugün odaklanmak istediğiniz hedefleri seçin ve başlayın.
            </Text>
            <Button
              type="primary"
              size="large"
              style={{
                marginTop: 20,
                borderRadius: 5,
                backgroundColor: '#1890ff',
                border: 'none',
                width: '100%',
              }}
            >
              Hedef Belirle
            </Button>
          </Card>

          {/* Özellik Kartları */}
          <Row gutter={[16, 16]} justify="center">
            <Col xs={24} sm={12} lg={8}>
              <Card
                style={{
                  textAlign: 'center',
                  borderRadius: 10,
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <UserOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                <Title level={4}>Profil Yönetimi</Title>
                <Text>Kullanıcı bilgilerinizi düzenleyin ve özelleştirin.</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card
                style={{
                  textAlign: 'center',
                  borderRadius: 10,
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <SettingOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                <Title level={4}>Ayarlar</Title>
                <Text>Uygulama ayarlarını kolayca yönetin.</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card
                style={{
                  textAlign: 'center',
                  borderRadius: 10,
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <BellOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                <Title level={4}>Bildirimler</Title>
                <Text>Güncel bildirimlerinizi görün.</Text>
              </Card>
            </Col>
          </Row>
        </Space>
      </Content>

      {/* Alt Bilgi */}
      <Footer style={{ textAlign: 'center', backgroundColor: '#ffffff' }}>
        Focus Map ©2024 - Tüm Hakları Saklıdır
      </Footer>
    </Layout>
  );
};

export default MainScreen;
