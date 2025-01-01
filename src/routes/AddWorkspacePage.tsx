import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, InputNumber, message, Typography, Space } from 'antd';
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
      const response = await axios.post(
        'http://localhost:5000/api/workspaces',
        {
          ...values,
          userId: user?._id,
          status: user?.role === 'admin' ? 'approved' : 'pending'
        },
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
    } catch (error) {
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

          <Form.Item
            name="address"
            label="Adres"
            rules={[{ required: true, message: 'Lütfen adresi giriniz' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Konum">
  <LocationPicker
    onLocationSelect={(location) => {
      form.setFieldsValue({
        coordinates: {
          lat: location.lat,
          lng: location.lng
        },
        address: location.address // Otomatik adres doldurma
      });
    }}
    initialLocation={form.getFieldValue(['coordinates'])}
  />
  <Space.Compact block>
    <Form.Item
      name={['coordinates', 'lat']}
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
      name={['coordinates', 'lng']}
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

          <Title level={4}>Özellikler</Title>
          <Form.Item label="WiFi" name={['features', 'wifi']}>
            <InputNumber min={0} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Sessizlik" name={['features', 'quiet']}>
            <InputNumber min={0} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Priz İmkanı" name={['features', 'power']}>
            <InputNumber min={0} max={10} style={{ width: '100%' }} />
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