import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, InputNumber, message, Typography, Space, Rate } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/Layout/AppLayout';
import axios from 'axios';
import { useMediaQuery } from 'react-responsive';
import LocationPicker from '../components/LocationPicker';

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
        addressId: addressResponse.data._id,
        categories: values.categories
      };

      console.log('Workspace data:', workspaceData); // Debug için

      // Workspace'i kaydet
      const response = await axios.post(
        'http://localhost:5000/api/workspaces',
        workspaceData,
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
      <Card style={{ 
        maxWidth: 800, 
        margin: '0 auto',
        padding: isMobile ? '16px' : '24px' 
      }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
          Yeni Mekan Ekle
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            type: 'cafe',
            features: {
              wifi: 5,
              quiet: 5,
              power: 5
            }
          }}
        >
          <Form.Item
            name="name"
            label="Mekan Adı"
            rules={[{ required: true, message: 'Lütfen mekan adını giriniz' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Mekan Türü"
            rules={[{ required: true, message: 'Lütfen mekan türünü seçiniz' }]}
          >
            <Select>
              <Option value="cafe">Kafe</Option>
              <Option value="library">Kütüphane</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Adres Bilgileri">
            <Form.Item
              name={['address', 'country']}
              label="Ülke"
              rules={[{ required: true, message: 'Lütfen ülke giriniz' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name={['address', 'city']}
              label="İl"
              rules={[{ required: true, message: 'Lütfen il giriniz' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name={['address', 'district']}
              label="İlçe"
              rules={[{ required: true, message: 'Lütfen ilçe giriniz' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name={['address', 'neighborhood']}
              label="Mahalle"
              rules={[{ required: true, message: 'Lütfen mahalle giriniz' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name={['address', 'fullAddress']}
              label="Tam Adres"
              rules={[{ required: true, message: 'Lütfen tam adresi giriniz' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item label="Konum">
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
                    }
                  });
                }}
                initialLocation={form.getFieldValue(['address', 'coordinates'])}
              />
              <Space.Compact block>
                <Form.Item
                  name={['address', 'coordinates', 'lat']}
                  rules={[{ required: true, message: 'Enlem gerekli' }]}
                  noStyle
                >
                  <InputNumber
                    placeholder="Enlem"
                    style={{ width: '50%' }}
                    step="0.000001"
                    disabled
                  />
                </Form.Item>
                <Form.Item
                  name={['address', 'coordinates', 'lng']}
                  rules={[{ required: true, message: 'Boylam gerekli' }]}
                  noStyle
                >
                  <InputNumber
                    placeholder="Boylam"
                    style={{ width: '50%' }}
                    step="0.000001"
                    disabled
                  />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          </Form.Item>

          <Title level={4}>Özellikler</Title>
          <Form.Item label="Özellikler">
            <Form.Item label="WiFi" name={['categories', 'wifi']}>
              <Rate count={5} />
            </Form.Item>

            <Form.Item label="Sessizlik" name={['categories', 'quiet']}>
              <Rate count={5} />
            </Form.Item>

            <Form.Item label="Priz İmkanı" name={['categories', 'power']}>
              <Rate count={5} />
            </Form.Item>

            <Form.Item label="Temizlik" name={['categories', 'cleanliness']}>
              <Rate count={5} />
            </Form.Item>

            {form.getFieldValue('type') === 'cafe' ? (
              <Form.Item label="Lezzet" name={['categories', 'taste']}>
                <Rate count={5} />
              </Form.Item>
            ) : (
              <>
                <Form.Item label="Kaynak Yeterliliği" name={['categories', 'resources']}>
                  <Rate count={5} />
                </Form.Item>
                <Form.Item label="Bilgisayar İmkanları" name={['categories', 'computers']}>
                  <Rate count={5} />
                </Form.Item>
              </>
            )}
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size={isMobile ? 'large' : 'middle'}
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