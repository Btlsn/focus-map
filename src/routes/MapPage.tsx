import React, { useState, useEffect } from 'react';
import { Layout, List, Card, Rate, Tag, Space, Typography, Button, Modal, Form, message } from 'antd';
import AppLayout from '../components/Layout/AppLayout';
import GoogleMapComponent from '../components/GoogleMapComponent';
import { CoffeeOutlined, BookOutlined, WifiOutlined, SoundOutlined, ThunderboltOutlined, LaptopOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import CommentSection from '../components/CommentSection';
import { createSoapClient } from '../utils/soapClient';

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

interface Comment {
  _id: string;
  text: string;
  userId: {
    fullName: string;
  };
  createdAt: string;
}

const MapPage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const { user } = useAuth();
  const [ratingForm] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleCardClick = async (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setIsEditing(false);
    if (workspace.userRating) {
      ratingForm.setFieldsValue(workspace.userRating);
    } else {
      ratingForm.resetFields();
    }
    await fetchComments(workspace._id);
    setModalVisible(true);
  };

  const handleRateWorkspace = async (values: any) => {
    if (!user || !selectedWorkspace) {
      message.error('Puan vermek için giriş yapmalısınız');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = selectedWorkspace.userRating 
        ? `http://localhost:5000/api/workspaces/${selectedWorkspace._id}/ratings/update`
        : 'http://localhost:5000/api/ratings';

      await axios.post(
        endpoint,
        {
          workspaceId: selectedWorkspace._id,
          categories: values
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      message.success(selectedWorkspace.userRating 
        ? 'Puanınız güncellendi' 
        : 'Puanınız kaydedildi'
      );
      
      const userRatingResponse = await axios.get(
        `http://localhost:5000/api/workspaces/${selectedWorkspace._id}/user-rating`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSelectedWorkspace({
        ...selectedWorkspace,
        userRating: userRatingResponse.data
      });

      setIsEditing(false);
      await fetchWorkspaces();
    } catch (error) {
      console.error('Rating error:', error);
      message.error('İşlem sırasında bir hata oluştu');
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/workspaces/approved', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const workspacesWithRatings = await Promise.all(
        response.data.map(async (workspace: Workspace) => {
          try {
            const [ratingsResponse, userRatingResponse] = await Promise.all([
              axios.get(`http://localhost:5000/api/workspaces/${workspace._id}/ratings/average`),
              user && token ? 
                axios.get(
                  `http://localhost:5000/api/workspaces/${workspace._id}/user-rating`,
                  { headers: { Authorization: `Bearer ${token}` } }
                ) : Promise.resolve({ data: null })
            ]);

            return {
              ...workspace,
              ratings: ratingsResponse.data || {
                wifi: 0,
                quiet: 0,
                power: 0,
                cleanliness: 0,
                ...(workspace.type === 'cafe' ? { taste: 0 } : { resources: 0, computers: 0 })
              },
              userRating: userRatingResponse.data
            };
          } catch (error) {
            console.error('Workspace rating error:', error);
            return workspace;
          }
        })
      );

      setWorkspaces(workspacesWithRatings);
    } catch (error) {
      console.error('Mekanlar yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async (workspaceId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/workspaces/${workspaceId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
      message.error('Yorumlar yüklenemedi');
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  useEffect(() => {
    if (modalVisible && selectedWorkspace) {
      const updatedWorkspace = workspaces.find(w => w._id === selectedWorkspace._id);
      if (updatedWorkspace) {
        setSelectedWorkspace(updatedWorkspace);
      }
    }
  }, [modalVisible, workspaces]);

  const canRate = (workspace: Workspace) => {
    return !workspace.userRating && user;
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
        onCancel={() => {
          setModalVisible(false);
          setIsEditing(false);
          ratingForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Card size="small" title="Ortalama Puanlar">
            <Space direction="vertical">
              <span>
                <WifiOutlined /> WiFi: <Rate disabled value={selectedWorkspace?.ratings?.wifi || 0} />
                <Text type="secondary"> ({selectedWorkspace?.ratings?.wifi?.toFixed(1)})</Text>
              </span>
              <span>
                <SoundOutlined /> Sessizlik: <Rate disabled value={selectedWorkspace?.ratings?.quiet || 0} />
                <Text type="secondary"> ({selectedWorkspace?.ratings?.quiet?.toFixed(1)})</Text>
              </span>
              <span>
                <ThunderboltOutlined /> Priz: <Rate disabled value={selectedWorkspace?.ratings?.power || 0} />
                <Text type="secondary"> ({selectedWorkspace?.ratings?.power?.toFixed(1)})</Text>
              </span>
              <span>
                Temizlik: <Rate disabled value={selectedWorkspace?.ratings?.cleanliness || 0} />
                <Text type="secondary"> ({selectedWorkspace?.ratings?.cleanliness?.toFixed(1)})</Text>
              </span>
              {selectedWorkspace?.type === 'cafe' ? (
                <span>
                  <CoffeeOutlined /> Lezzet: <Rate disabled value={selectedWorkspace?.ratings?.taste || 0} />
                  <Text type="secondary"> ({selectedWorkspace?.ratings?.taste?.toFixed(1)})</Text>
                </span>
              ) : (
                <>
                  <span>
                    <BookOutlined /> Kaynaklar: <Rate disabled value={selectedWorkspace?.ratings?.resources || 0} />
                    <Text type="secondary"> ({selectedWorkspace?.ratings?.resources?.toFixed(1)})</Text>
                  </span>
                  <span>
                    <LaptopOutlined /> Bilgisayarlar: <Rate disabled value={selectedWorkspace?.ratings?.computers || 0} />
                    <Text type="secondary"> ({selectedWorkspace?.ratings?.computers?.toFixed(1)})</Text>
                  </span>
                </>
              )}
            </Space>
          </Card>

          {user ? (
            <Card size="small" title="Sizin Puanlarınız">
              {selectedWorkspace?.userRating ? (
                <>
                  <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                    <span>
                      <WifiOutlined /> WiFi: <Rate disabled value={selectedWorkspace.userRating.wifi} />
                    </span>
                    <span>
                      <SoundOutlined /> Sessizlik: <Rate disabled value={selectedWorkspace.userRating.quiet} />
                    </span>
                    <span>
                      <ThunderboltOutlined /> Priz: <Rate disabled value={selectedWorkspace.userRating.power} />
                    </span>
                    <span>
                      Temizlik: <Rate disabled value={selectedWorkspace.userRating.cleanliness} />
                    </span>
                    {selectedWorkspace.type === 'cafe' ? (
                      <span>
                        <CoffeeOutlined /> Lezzet: <Rate disabled value={selectedWorkspace.userRating.taste} />
                      </span>
                    ) : (
                      <>
                        <span>
                          <BookOutlined /> Kaynaklar: <Rate disabled value={selectedWorkspace.userRating.resources} />
                        </span>
                        <span>
                          <LaptopOutlined /> Bilgisayarlar: <Rate disabled value={selectedWorkspace.userRating.computers} />
                        </span>
                      </>
                    )}
                  </Space>
                  <Button 
                    type="primary" 
                    onClick={() => setIsEditing(true)} 
                    block
                    style={{ marginBottom: 16 }}
                  >
                    Puanı Düzenle
                  </Button>
                  {isEditing && (
                    <Form
                      form={ratingForm}
                      onFinish={handleRateWorkspace}
                      layout="vertical"
                      initialValues={selectedWorkspace.userRating}
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

                      {selectedWorkspace.type === 'cafe' ? (
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
                          Puanı Güncelle
                        </Button>
                      </Form.Item>
                    </Form>
                  )}
                </>
              ) : (
                <Form
                  form={ratingForm}
                  onFinish={handleRateWorkspace}
                  layout="vertical"
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
                      Puan Ver
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </Card>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">Puan vermek için giriş yapmalısınız</Text>
            </div>
          )}

<CommentSection 
  workspaceId={selectedWorkspace._id} 
  comments={comments} 
  fetchComments={() => fetchComments(selectedWorkspace._id)} 
/>
        </Space>
      </Modal>
    </AppLayout>
  );
};

export default MapPage;