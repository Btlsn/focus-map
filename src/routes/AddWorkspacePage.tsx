import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, InputNumber, message, Typography, Space, Rate, Divider, Row, Col, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/Layout/AppLayout';
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';
import LocationPicker from '../components/LocationPicker';
import { CoffeeOutlined, BookOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const AddWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Oturum açmanız gerekiyor');
        return;
      }

      // Önce adresi kaydet
      const addressResponse = await axios.post(
        'http://localhost:5000/api/addresses',
        values.address,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Workspace verilerini hazırla
      const workspaceData = {
        name: values.name,
        type: values.type,
        details: {
          createdBy: user?._id,
          createdAt: new Date()
        },
        status: user?.role === 'admin' ? 'approved' : 'pending',
        addressId: addressResponse.data._id
      };

      // Workspace'i kaydet
      const workspaceResponse = await axios.post(
        'http://localhost:5000/api/workspaces',
        workspaceData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Rating'leri hazırla
      const baseRatings = {
        wifi: values.categories.wifi || 0,
        quiet: values.categories.quiet || 0,
        power: values.categories.power || 0,
        cleanliness: values.categories.cleanliness || 0
      };

      const specificRatings = values.type === 'cafe' 
        ? { taste: values.categories.taste || 0 }
        : {
            resources: values.categories.resources || 0,
            computers: values.categories.computers || 0
          };

      // Rating'leri kaydet
      const ratingData = {
        workspaceId: workspaceResponse.data._id,
        type: values.type,
        categories: {
          ...baseRatings,
          ...specificRatings
        }
      };

      await axios.post(
        'http://localhost:5000/api/ratings',
        ratingData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      message.success(
        user?.role === 'admin' 
          ? 'Mekan başarıyla eklendi!' 
          : 'Mekan başarıyla gönderildi! Admin onayından sonra yayınlanacaktır.'
      );
      navigate('/');
    } catch (error: any) {
      console.error('Hata:', error.response?.data || error);
      message.error('Mekan eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Card 
        style={{ 
          maxWidth: 800, 
          margin: '0 auto',
          padding: isMobile ? '16px' : '24px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        <Title level={2} style={{ 
          textAlign: 'center', 
          marginBottom: '32px',
          background: 'linear-gradient(45deg, #1890ff, #52c41a)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Yeni Mekan Ekle
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            type: 'cafe',
            categories: {}
          }}
          onValuesChange={(changedValues) => {
            if (changedValues.type) {
              const type = changedValues.type;
              if (type === 'cafe') {
                form.setFieldsValue({
                  categories: {
                    ...form.getFieldValue('categories'),
                    resources: undefined,
                    computers: undefined
                  }
                });
              } else {
                form.setFieldsValue({
                  categories: {
                    ...form.getFieldValue('categories'),
                    taste: undefined
                  }
                });
              }
            }
          }}
        >
          <Row gutter={[24, 24]}>
            <Col span={24} md={12}>
              <Form.Item
                name="name"
                label="Mekan Adı"
                rules={[{ required: true, message: 'Lütfen mekan adını giriniz' }]}
              >
                <Input size="large" placeholder="Örn: Starbucks Alsancak" />
              </Form.Item>
            </Col>

            <Col span={24} md={12}>
              <Form.Item
                name="type"
                label="Mekan Türü"
                rules={[{ required: true, message: 'Lütfen mekan türünü seçiniz' }]}
              >
                <Select size="large">
                  <Option value="cafe">
                    <Space>
                      <CoffeeOutlined />
                      Kafe
                    </Space>
                  </Option>
                  <Option value="library">
                    <Space>
                      <BookOutlined />
                      Kütüphane
                    </Space>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Konum Bilgisi</Divider>
          
          <Form.Item>
            
            <LocationPicker
              onLocationSelect={(location) => {
                // Google Geocoding API'den gelen adres bileşenlerini parse et
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: { lat: location.lat, lng: location.lng } }, (results, status) => {
                  if (status === 'OK' && results?.[0]) {
                    const addressComponents = results[0].address_components;
                    
                    // Adres bileşenlerini bul
                    const getComponent = (type: string) => {
                      const component = addressComponents.find(comp => 
                        comp.types.includes(type)
                      );
                      return component?.long_name || '';
                    };

                    // Form alanlarını otomatik doldur
                    form.setFieldsValue({
                      address: {
                        country: getComponent('country'),
                        city: getComponent('administrative_area_level_1'),
                        district: getComponent('administrative_area_level_2'),
                        neighborhood: getComponent('administrative_area_level_4') || getComponent('sublocality') || getComponent('neighborhood'),
                        fullAddress: results[0].formatted_address,
                        coordinates: {
                          lat: location.lat,
                          lng: location.lng
                        }
                      }
                    });

                    // Eğer mekan adı geldiyse, form'un name alanını güncelle
                    if (location.placeName) {
                      form.setFieldsValue({
                        name: location.placeName
                      });
                    }
                  }
                });
              }}
              initialLocation={form.getFieldValue(['address', 'coordinates'])}
            />
          </Form.Item>

          <Form.Item noStyle>
            <Input.Group>
              {/* Gizli form alanları */}
              <Form.Item name={['address', 'country']} hidden>
                <Input />
              </Form.Item>
              <Form.Item name={['address', 'city']} hidden>
                <Input />
              </Form.Item>
              <Form.Item name={['address', 'district']} hidden>
                <Input />
              </Form.Item>
              <Form.Item name={['address', 'neighborhood']} hidden>
                <Input />
              </Form.Item>
              <Form.Item name={['address', 'fullAddress']} hidden>
                <Input />
              </Form.Item>
              <Form.Item name={['address', 'coordinates', 'lat']} hidden>
                <Input />
              </Form.Item>
              <Form.Item name={['address', 'coordinates', 'lng']} hidden>
                <Input />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Divider orientation="left">Özellikler</Divider>

          <Row gutter={[24, 24]}>
            <Col span={24} md={12}>
              <Card size="small" bordered={false} style={{ background: '#f5f5f5' }}>
                <Title level={5}>Temel Özellikler</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item 
                    label="WiFi" 
                    name={['categories', 'wifi']}
                    rules={[{ required: true, message: 'Lütfen WiFi değerlendirmesi yapın' }]}
                  >
                    <Rate />
                  </Form.Item>
                  <Form.Item 
                    label="Sessizlik" 
                    name={['categories', 'quiet']}
                    rules={[{ required: true, message: 'Lütfen sessizlik değerlendirmesi yapın' }]}
                  >
                    <Rate />
                  </Form.Item>
                  <Form.Item 
                    label="Priz İmkanı" 
                    name={['categories', 'power']}
                    rules={[{ required: true, message: 'Lütfen priz imkanı değerlendirmesi yapın' }]}
                  >
                    <Rate />
                  </Form.Item>
                  <Form.Item 
                    label="Temizlik" 
                    name={['categories', 'cleanliness']}
                    rules={[{ required: true, message: 'Lütfen temizlik değerlendirmesi yapın' }]}
                  >
                    <Rate />
                  </Form.Item>
                </Space>
              </Card>
            </Col>

            <Col span={24} md={12}>
              <Form.Item dependencies={['type']} noStyle>
                {({ getFieldValue }) => {
                  const type = getFieldValue('type');
                  
                  return (
                    <Card size="small" bordered={false} style={{ background: '#f5f5f5' }}>
                      <Title level={5}>
                        {type === 'cafe' ? 'Kafe Özellikleri' : 'Kütüphane Özellikleri'}
                      </Title>
                      {type === 'cafe' ? (
                        <Form.Item 
                          label="Lezzet" 
                          name={['categories', 'taste']}
                          rules={[{ required: true, message: 'Lütfen lezzet değerlendirmesi yapın' }]}
                        >
                          <Rate />
                        </Form.Item>
                      ) : (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Form.Item 
                            label="Kaynak Yeterliliği" 
                            name={['categories', 'resources']}
                            rules={[{ required: true, message: 'Lütfen kaynak yeterliliği değerlendirmesi yapın' }]}
                          >
                            <Rate />
                          </Form.Item>
                          <Form.Item 
                            label="Bilgisayar İmkanları" 
                            name={['categories', 'computers']}
                            rules={[{ required: true, message: 'Lütfen bilgisayar imkanları değerlendirmesi yapın' }]}
                          >
                            <Rate />
                          </Form.Item>
                        </Space>
                      )}
                    </Card>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: '24px' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
              style={{
                height: '48px',
                borderRadius: '8px',
                background: 'linear-gradient(45deg, #1890ff, #52c41a)'
              }}
            >
              {user?.role === 'admin' ? 'Mekanı Ekle' : 'Onaya Gönder'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </AppLayout>
  );
};

export default AddWorkspacePage; 