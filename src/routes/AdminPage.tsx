import React, { useEffect, useState } from 'react';
import { Card, Table, Button, message, Tag, Space, Rate, Descriptions, Modal } from 'antd';
import AppLayout from '../components/Layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface PendingWorkspace {
  _id: string;
  name: string;
  type: 'cafe' | 'library';
  status: 'pending' | 'approved' | 'rejected';
  details: {
    createdBy: {
      _id: string;
      fullName: string;
      email: string;
    };
    createdAt: string;
  };
  address: {
    country: string;
    city: string;
    district: string;
    neighborhood: string;
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
}

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [pendingWorkspaces, setPendingWorkspaces] = useState<PendingWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkspace, setSelectedWorkspace] = useState<PendingWorkspace | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchPendingWorkspaces = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Oturum süreniz dolmuş');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/workspaces/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingWorkspaces(response.data);
    } catch (error) {
      console.error('Mekanlar yüklenirken hata:', error);
      message.error('Mekanlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/workspaces/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      message.success('Mekan onaylandı');
      fetchPendingWorkspaces();
    } catch (error) {
      console.error('Onaylama hatası:', error);
      message.error('Onaylama işlemi başarısız oldu');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.post(`http://localhost:5000/api/workspaces/${id}/reject`);
      message.success('Mekan reddedildi');
      fetchPendingWorkspaces();
    } catch (error) {
      message.error('Reddetme işlemi başarısız oldu');
    }
  };

  const showWorkspaceDetails = (workspace: PendingWorkspace) => {
    setSelectedWorkspace(workspace);
    setModalVisible(true);
  };

  useEffect(() => {
    fetchPendingWorkspaces();
  }, []);

  const columns = [
    {
      title: 'Mekan Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: PendingWorkspace) => (
        <Button type="link" onClick={() => showWorkspaceDetails(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'cafe' ? 'blue' : 'green'}>
          {type === 'cafe' ? 'Kafe' : 'Kütüphane'}
        </Tag>
      ),
    },
    {
      title: 'Konum',
      key: 'location',
      render: (_: any, record: PendingWorkspace) => (
        `${record.address.district}, ${record.address.city}`
      ),
    },
    {
      title: 'Ekleyen',
      key: 'createdBy',
      render: (_: any, record: PendingWorkspace) => (
        <span>{record.details.createdBy.fullName}</span>
      ),
    },
    {
      title: 'Eklenme Tarihi',
      key: 'createdAt',
      render: (_: any, record: PendingWorkspace) => (
        new Date(record.details.createdAt).toLocaleDateString('tr-TR')
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: PendingWorkspace) => (
        <Space>
          <Button type="primary" onClick={() => handleApprove(record._id)}>
            Onayla
          </Button>
          <Button danger onClick={() => handleReject(record._id)}>
            Reddet
          </Button>
        </Space>
      ),
    },
  ];

  if (user?.role !== 'admin') {
    return (
      <AppLayout>
        <Card>
          <h1>Yetkisiz Erişim</h1>
          <p>Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Card title="Onay Bekleyen Mekanlar">
        <Table
          columns={columns}
          dataSource={pendingWorkspaces}
          loading={loading}
          rowKey="_id"
        />
      </Card>

      <Modal
        title="Mekan Detayları"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedWorkspace && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mekan Adı">{selectedWorkspace.name}</Descriptions.Item>
            <Descriptions.Item label="Tür">
              {selectedWorkspace.type === 'cafe' ? 'Kafe' : 'Kütüphane'}
            </Descriptions.Item>
            <Descriptions.Item label="Adres">
              {selectedWorkspace.address.fullAddress}
            </Descriptions.Item>
            <Descriptions.Item label="Ekleyen">
              {selectedWorkspace.details.createdBy.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="İletişim">
              {selectedWorkspace.details.createdBy.email}
            </Descriptions.Item>
            <Descriptions.Item label="Değerlendirmeler">
              <Space direction="vertical">
                <span>WiFi: <Rate disabled defaultValue={selectedWorkspace.ratings.wifi} /></span>
                <span>Sessizlik: <Rate disabled defaultValue={selectedWorkspace.ratings.quiet} /></span>
                <span>Priz: <Rate disabled defaultValue={selectedWorkspace.ratings.power} /></span>
                <span>Temizlik: <Rate disabled defaultValue={selectedWorkspace.ratings.cleanliness} /></span>
                {selectedWorkspace.type === 'cafe' ? (
                  <span>Lezzet: <Rate disabled defaultValue={selectedWorkspace.ratings.taste} /></span>
                ) : (
                  <>
                    <span>Kaynaklar: <Rate disabled defaultValue={selectedWorkspace.ratings.resources} /></span>
                    <span>Bilgisayarlar: <Rate disabled defaultValue={selectedWorkspace.ratings.computers} /></span>
                  </>
                )}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </AppLayout>
  );
};

export default AdminPage; 