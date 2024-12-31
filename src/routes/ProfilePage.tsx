import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Tabs, Avatar, Typography, Descriptions } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import AppLayout from '../components/Layout/AppLayout';
import { userService } from '../services/userService';

const { Title } = Typography;
const { TabPane } = Tabs;

interface UserProfile {
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const [loginForm] = Form.useForm();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Kullanıcının giriş durumunu kontrol et
    const checkLoginStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const profile = await userService.getProfile();
          setUserProfile(profile);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Profil yüklenirken hata:', error);
      }
    };

    checkLoginStatus();
  }, []);

  const onLogin = async (values: any) => {
    try {
      const response = await userService.login(values);
      localStorage.setItem('token', response.token);
      setIsLoggedIn(true);
      setUserProfile(response.user);
      message.success('Başarıyla giriş yapıldı!');
    } catch (error) {
      message.error('Giriş yapılırken bir hata oluştu!');
    }
  };

  const onRegister = async (values: any) => {
    try {
      await userService.createUser(values);
      message.success('Kullanıcı başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
      form.resetFields();
    } catch (error) {
      message.error('Kayıt olurken bir hata oluştu!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserProfile(null);
    message.success('Çıkış yapıldı!');
  };

  if (isLoggedIn && userProfile) {
    return (
      <AppLayout>
        <Card style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Avatar size={64} icon={<UserOutlined />} />
            <Title level={2} style={{ marginTop: 16 }}>{userProfile.fullName}</Title>
          </div>

          <Descriptions bordered column={1}>
            <Descriptions.Item label="E-posta">{userProfile.email}</Descriptions.Item>
            <Descriptions.Item label="Rol">{userProfile.role}</Descriptions.Item>
            <Descriptions.Item label="Kayıt Tarihi">
              {new Date(userProfile.createdAt).toLocaleDateString('tr-TR')}
            </Descriptions.Item>
          </Descriptions>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button type="primary" danger onClick={handleLogout}>
              Çıkış Yap
            </Button>
          </div>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Card style={{ maxWidth: 600, margin: '0 auto' }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Giriş Yap" key="1">
            <Form
              form={loginForm}
              layout="vertical"
              onFinish={onLogin}
            >
              <Form.Item
                name="email"
                label="E-posta"
                rules={[
                  { required: true, message: 'Lütfen e-posta adresinizi giriniz' },
                  { type: 'email', message: 'Geçerli bir e-posta adresi giriniz' }
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="password"
                label="Şifre"
                rules={[{ required: true, message: 'Lütfen şifrenizi giriniz' }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Giriş Yap
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Kayıt Ol" key="2">
            <Form
              form={form}
              layout="vertical"
              onFinish={onRegister}
            >
              <Form.Item
                name="fullName"
                label="Ad Soyad"
                rules={[{ required: true, message: 'Lütfen adınızı giriniz' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="email"
                label="E-posta"
                rules={[
                  { required: true, message: 'Lütfen e-posta adresinizi giriniz' },
                  { type: 'email', message: 'Geçerli bir e-posta adresi giriniz' }
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="password"
                label="Şifre"
                rules={[
                  { required: true, message: 'Lütfen şifrenizi giriniz' },
                  { min: 6, message: 'Şifre en az 6 karakter olmalıdır' }
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Kayıt Ol
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </AppLayout>
  );
};

export default ProfilePage; 