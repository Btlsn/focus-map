import React, { useEffect, useState } from 'react';
import { Card, Table, Button, message, Tag, Space } from 'antd';
import AppLayout from '../components/Layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [pendingWorkspaces, setPendingWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingWorkspaces = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/workspaces/pending');
      console.log('Pending workspaces:', JSON.stringify(response.data, null, 2));
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
      await axios.post(`http://localhost:5000/api/workspaces/${id}/approve`);
      message.success('Mekan onaylandı');
      fetchPendingWorkspaces();
    } catch (error) {
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

  useEffect(() => {
    fetchPendingWorkspaces();
  }, []);

  const columns = [
    {
      title: 'Mekan Adı',
      dataIndex: 'name',
      key: 'name',
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
      title: 'Ekleyen',
      key: 'createdBy',
      render: (_, record: any) => {
        return record.createdBy?.fullName || 'Bilinmiyor';
      }
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: any) => (
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
    </AppLayout>
  );
};

export default AdminPage; 