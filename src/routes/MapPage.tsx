import React, { useState, useEffect } from 'react';
import { Layout, List, Card, Rate, Tag, Space, Typography, Button, Modal, Form, message } from 'antd';
import AppLayout from '../components/Layout/AppLayout';
import GoogleMapComponent from '../components/GoogleMapComponent';
import { CoffeeOutlined, BookOutlined, WifiOutlined, SoundOutlined, ThunderboltOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const { Content, Sider } = Layout;
const { Text, Title } = Typography;

interface Workspace {
  _id: string;
  name: string;
  type: 'cafe' | 'library';
  address: {
    fullAddress: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  ratings: {
    wifi: number;
    quiet: number;
    power: number;
    cleanliness: number;
    taste?: number;
    resources?: number;
    computers?: number;
  };
  userRating?: {
    wifi: number;
    quiet: number;
    power: number;
    cleanliness: number;
    taste?: number;
    resources?: number;
    computers?: number;
  };
}

const MapPage: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [ratingForm] = Form.useForm();
  const { user } = useAuth();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (modalVisible && selectedWorkspace?.userRating) {
      ratingForm.setFieldsValue({
        wifi: selectedWorkspace.userRating.wifi,
        quiet: selectedWorkspace.userRating.quiet,
        power: selectedWorkspace.userRating.power,
        cleanliness: selectedWorkspace.userRating.cleanliness,
        ...(selectedWorkspace.type === 'cafe' 
          ? { taste: selectedWorkspace.userRating.taste }
          : {
              resources: selectedWorkspace.userRating.resources,
              computers: selectedWorkspace.userRating.computers
            }
        )
      });
    } else {
      ratingForm.resetFields();
    }
  }, [modalVisible, selectedWorkspace]);

  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/workspaces/approved', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const workspacesWithRatings = await Promise.all(
        response.data.map(async (workspace: Workspace) => {
          try {
            const ratingsResponse = await axios.get(
              `http://localhost:5000/api/workspaces/${workspace._id}/ratings/average`
            );
            return {
              ...workspace,
              ratings: ratingsResponse.data || {
                wifi: 0,
                quiet: 0,
                power: 0,
                cleanliness: 0,
                ...(workspace.type === 'cafe' ? { taste: 0 } : { resources: 0, computers: 0 })
              }
            };
          } catch (error) {
            return workspace;
          }
        })
      );

      if (user) {
        const workspacesWithUserRatings = await Promise.all(
          workspacesWithRatings.map(async (workspace: Workspace) => {
            try {
              const userRatingResponse = await axios.get(
                `http://localhost:5000/api/workspaces/${workspace._id}/user-rating`,
                {
                  headers: { Authorization: `Bearer ${token}` }
                }
              );
              return {
                ...workspace,
                userRating: userRatingResponse.data
              };
            } catch (error) {
              return workspace;
            }
          })
        );
        setWorkspaces(workspacesWithUserRatings);
      } else {
        setWorkspaces(workspacesWithRatings);
      }
    } catch (error) {
      console.error('Mekanlar yüklenirken hata:', error);
    }
  };

  const handleRateWorkspace = async (values: any) => {
    if (!user) {
      message.error('Puan vermek için giriş yapmalısınız');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = selectedWorkspace?.userRating 
        ? `http://localhost:5000/api/workspaces/${selectedWorkspace?._id}/ratings/update`
        : 'http://localhost:5000/api/ratings';

      await axios.post(
        endpoint,
        {
          workspaceId: selectedWorkspace?._id,
          categories: values
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      message.success(selectedWorkspace?.userRating 
        ? 'Puanınız güncellendi' 
        : 'Puanınız kaydedildi'
      );
      setModalVisible(false);
      fetchWorkspaces();
    } catch (error) {
      message.error('İşlem sırasında bir hata oluştu');
    }
  };

  const canRate = (workspace: Workspace) => {
    return !workspace.userRating && user;
  };

  const handleCardClick = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setModalVisible(true);
  };

  return (
    <AppLayout>
      <Layout style={{ height: 'calc(100vh - 64px)' }}>
        <Sider 
          width={400} 
          theme="light"
          style={{ 
            overflowY: 'auto',
            padding: '16px',
            borderRight: '1px solid #f0f0f0'
          }}
        >
          <List
            dataSource={workspaces}
            renderItem={(workspace) => (
              <Card 
                hoverable
                style={{ marginBottom: '16px', cursor: 'pointer' }}
                onClick={() => handleCardClick(workspace)}
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space>
                    {workspace.type === 'cafe' ? 
                      <CoffeeOutlined style={{ color: '#1890ff' }} /> :
                      <BookOutlined style={{ color: '#52c41a' }} />
                    }
                    <Text strong>{workspace.name}</Text>
                    <Tag color={workspace.type === 'cafe' ? 'blue' : 'green'}>
                      {workspace.type === 'cafe' ? 'Kafe' : 'Kütüphane'}
                    </Tag>
                  </Space>

                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {workspace.address.fullAddress}
                  </Text>

                  <Space direction="vertical" size={0}>
                    <Space>
                      <WifiOutlined />
                      <Rate 
                        disabled 
                        defaultValue={workspace.ratings.wifi} 
                        style={{ fontSize: '12px' }} 
                      />
                    </Space>
                    <Space>
                      <SoundOutlined />
                      <Rate 
                        disabled 
                        defaultValue={workspace.ratings.quiet} 
                        style={{ fontSize: '12px' }} 
                      />
                    </Space>
                    <Space>
                      <ThunderboltOutlined />
                      <Rate 
                        disabled 
                        defaultValue={workspace.ratings.power} 
                        style={{ fontSize: '12px' }} 
                      />
                    </Space>
                  </Space>
                </Space>
              </Card>
            )}
          />
        </Sider>

        <Content style={{ padding: 0, margin: 0, overflow: 'hidden' }}>
          <GoogleMapComponent />
        </Content>
      </Layout>

      <Modal
        title={selectedWorkspace?.name}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {user ? (
          <Form
            form={ratingForm}
            onFinish={handleRateWorkspace}
            layout="vertical"
            initialValues={selectedWorkspace?.userRating || {}}
          >
            <Form.Item name="wifi" label="WiFi" rules={[{ required: true }]}>
              <Rate />
            </Form.Item>
            <Form.Item name="quiet" label="Sessizlik" rules={[{ required: true }]}>
              <Rate />
            </Form.Item>
            <Form.Item name="power" label="Priz İmkanı" rules={[{ required: true }]}>
              <Rate />
            </Form.Item>
            <Form.Item name="cleanliness" label="Temizlik" rules={[{ required: true }]}>
              <Rate />
            </Form.Item>

            {selectedWorkspace?.type === 'cafe' ? (
              <Form.Item name="taste" label="Lezzet" rules={[{ required: true }]}>
                <Rate />
              </Form.Item>
            ) : (
              <>
                <Form.Item name="resources" label="Kaynak Yeterliliği" rules={[{ required: true }]}>
                  <Rate />
                </Form.Item>
                <Form.Item name="computers" label="Bilgisayar İmkanları" rules={[{ required: true }]}>
                  <Rate />
                </Form.Item>
              </>
            )}

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {selectedWorkspace?.userRating ? 'Puanı Güncelle' : 'Puan Ver'}
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">Puan vermek için giriş yapmalısınız</Text>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
};

export default MapPage; 