import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Tabs, Avatar, Typography, Descriptions, Spin, DatePicker, Select, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import AppLayout from '../components/Layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface UserInfo {
  _id: string;
  userId: string;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

const ProfilePage: React.FC = () => {
  const [userInfoForm] = Form.useForm();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const { user, loading: authLoading, logout, login } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  const fetchUserInfo = async () => {
    if (!user?.id && !user?._id) {
      console.log('User ID yok:', user);
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Oturum süreniz dolmuş');
        setLoading(false);
        return;
      }

      const userId = user.id || user._id;
      console.log('Fetching user info for ID:', userId);
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/info`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('User info response:', response.data);
      if (response.data) {
        setUserInfo(response.data);
        userInfoForm.setFieldsValue({
          birthDate: response.data.birthDate ? dayjs(response.data.birthDate) : null,
          gender: response.data.gender || null
        });
      }
    } catch (error: any) {
      console.error('Kullanıcı bilgileri alınamadı:', error.response?.data || error);
      message.error('Kullanıcı bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [user?._id, userInfoForm]);

  const updateUserInfo = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Oturum süreniz dolmuş');
        return;
      }

      const userId = user?.id || user?._id;
      if (!userId) {
        console.error('User ID bulunamadı:', user);
        message.error('Kullanıcı bilgisi bulunamadı');
        return;
      }

      console.log('Updating user info:', { userId, values });
      await axios.put(
        `http://localhost:5000/api/users/${userId}/info`,
        {
          birthDate: values.birthDate.toDate(),
          gender: values.gender
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      message.success('Bilgileriniz güncellendi!');
      await fetchUserInfo();
    } catch (error: any) {
      console.error('Güncelleme hatası:', error.response?.data || error);
      message.error('Bilgiler güncellenirken bir hata oluştu!');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      message.success('Başarıyla çıkış yapıldı');
      navigate('/');
    } catch (error) {
      message.error('Çıkış yapılırken bir hata oluştu');
    }
  };

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoginLoading(true);
    try {
      const response = await login(values);
      console.log('Login response in ProfilePage:', response);
      if (!response?._id) {
        throw new Error('Invalid user data received');
      }
      message.success('Başarıyla giriş yapıldı');
      await fetchUserInfo();
    } catch (error) {
      console.error('Login error:', error);
      message.error('Giriş yapılırken bir hata oluştu');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (values: { fullName: string; email: string; password: string }) => {
    setRegisterLoading(true);
    try {
      await axios.post('http://localhost:5000/api/users', values);
      message.success('Kayıt başarılı! Lütfen giriş yapın.');
      setActiveTab('login');
      registerForm.resetFields();
    } catch (error) {
      message.error('Kayıt olurken bir hata oluştu');
    } finally {
      setRegisterLoading(false);
    }
  };

  if (!user && !authLoading) {
    return (
      <AppLayout>
        <Card style={{ maxWidth: 400, margin: '0 auto' }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            centered
          >
            <TabPane tab="Giriş Yap" key="login">
              <Form
                form={loginForm}
                layout="vertical"
                onFinish={handleLogin}
              >
                <Form.Item
                  name="email"
                  label="E-posta"
                  rules={[
                    { required: true, message: 'Lütfen e-posta adresinizi girin' },
                    { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
                  ]}
                >
                  <Input size="large" placeholder="ornek@email.com" />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Şifre"
                  rules={[{ required: true, message: 'Lütfen şifrenizi girin' }]}
                >
                  <Input.Password size="large" placeholder="********" />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loginLoading}
                    block
                    size="large"
                  >
                    Giriş Yap
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="Üye Ol" key="register">
              <Form
                form={registerForm}
                layout="vertical"
                onFinish={handleRegister}
              >
                <Form.Item
                  name="fullName"
                  label="Ad Soyad"
                  rules={[{ required: true, message: 'Lütfen adınızı ve soyadınızı girin' }]}
                >
                  <Input size="large" placeholder="Ad Soyad" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="E-posta"
                  rules={[
                    { required: true, message: 'Lütfen e-posta adresinizi girin' },
                    { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
                  ]}
                >
                  <Input size="large" placeholder="ornek@email.com" />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Şifre"
                  rules={[
                    { required: true, message: 'Lütfen şifrenizi girin' },
                    { min: 6, message: 'Şifre en az 6 karakter olmalıdır' }
                  ]}
                >
                  <Input.Password size="large" placeholder="********" />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={registerLoading}
                    block
                    size="large"
                  >
                    Üye Ol
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </Card>
      </AppLayout>
    );
  }

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar size={64} icon={<UserOutlined />} />
          <Title level={2} style={{ marginTop: 16 }}>{user?.fullName}</Title>
          <Button 
            type="primary" 
            danger
            onClick={handleLogout}
            style={{ marginTop: 16 }}
          >
            Çıkış Yap
          </Button>
        </div>

        <Tabs defaultActiveKey="1">
          <TabPane tab="Profil Bilgileri" key="1">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="E-posta">{user?.email}</Descriptions.Item>
              <Descriptions.Item label="Rol">{user?.role}</Descriptions.Item>
              <Descriptions.Item label="Doğum Tarihi">
                {userInfo?.birthDate ? dayjs(userInfo.birthDate).format('DD/MM/YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Cinsiyet">
                {userInfo?.gender === 'male' ? 'Erkek' : 
                 userInfo?.gender === 'female' ? 'Kadın' : 
                 userInfo?.gender === 'other' ? 'Diğer' : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Kayıt Tarihi">
                {dayjs(user?.createdAt).format('DD/MM/YYYY')}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="Bilgileri Güncelle" key="2">
            <Form
              form={userInfoForm}
              layout="vertical"
              onFinish={updateUserInfo}
            >
              <Form.Item
                name="birthDate"
                label="Doğum Tarihi"
                rules={[{ required: true, message: 'Lütfen doğum tarihinizi seçin' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item
                name="gender"
                label="Cinsiyet"
                rules={[{ required: true, message: 'Lütfen cinsiyetinizi seçin' }]}
              >
                <Select>
                  <Option value="male">Erkek</Option>
                  <Option value="female">Kadın</Option>
                  <Option value="other">Diğer</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Bilgileri Güncelle
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