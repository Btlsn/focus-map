import React, { useState, useEffect } from 'react';
import { Card, Button, Input, List, Tag, Typography, Modal, message } from 'antd';
import { ClockCircleOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import AppLayout from '../components/Layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface Pomodoro {
  _id: string;
  startDate: string;
  endDate: string;
  goal: string;
  status: 'active' | 'completed' | 'cancelled';
}

const PomodoroPage: React.FC = () => {
  const [pomodoros, setPomodoros] = useState<Pomodoro[]>([]);
  const [activePomodoro, setActivePomodoro] = useState<Pomodoro | null>(null);
  const [goal, setGoal] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 dakika
  const { user } = useAuth();

  useEffect(() => {
    fetchPomodoros();
  }, []);

  const fetchPomodoros = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/pomodoros', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPomodoros(response.data);
    } catch (error) {
      message.error('Pomodorolar yüklenirken bir hata oluştu');
    }
  };

  const startPomodoro = async () => {
    if (!goal) {
      message.error('Lütfen bir hedef belirleyin');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 25 * 60000); // 25 dakika

      const response = await axios.post(
        'http://localhost:5000/api/pomodoros',
        {
          startDate,
          endDate,
          goal,
          status: 'active'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setActivePomodoro(response.data);
      setModalVisible(true);
      setTimeLeft(25 * 60);
      setGoal('');
    } catch (error) {
      message.error('Pomodoro başlatılırken bir hata oluştu');
    }
  };

  const updatePomodoroStatus = async (id: string, status: 'completed' | 'cancelled') => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/pomodoros/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setModalVisible(false);
      setActivePomodoro(null);
      fetchPomodoros();
    } catch (error) {
      message.error('Pomodoro durumu güncellenirken bir hata oluştu');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (modalVisible && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [modalVisible, timeLeft]);

  return (
    <AppLayout>
      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <Title level={2}>Pomodoro Timer</Title>
        
        <div style={{ marginBottom: 24 }}>
          <Input
            placeholder="Hedefinizi yazın"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Button type="primary" onClick={startPomodoro} block>
            Pomodoro Başlat
          </Button>
        </div>

        <List
          header={<Title level={4}>Pomodoro Geçmişi</Title>}
          dataSource={pomodoros}
          renderItem={item => (
            <List.Item
              extra={
                <Tag color={
                  item.status === 'completed' ? 'success' :
                  item.status === 'cancelled' ? 'error' : 'processing'
                }>
                  {item.status === 'completed' ? 'Tamamlandı' :
                   item.status === 'cancelled' ? 'İptal Edildi' : 'Aktif'}
                </Tag>
              }
            >
              <List.Item.Meta
                title={item.goal}
                description={`${dayjs(item.startDate).format('HH:mm')} - ${dayjs(item.endDate).format('HH:mm')}`}
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Pomodoro Devam Ediyor"
        open={modalVisible}
        footer={[
          <Button 
            key="cancel" 
            danger 
            onClick={() => activePomodoro && updatePomodoroStatus(activePomodoro._id, 'cancelled')}
          >
            İptal Et
          </Button>,
          <Button
            key="complete"
            type="primary"
            onClick={() => activePomodoro && updatePomodoroStatus(activePomodoro._id, 'completed')}
          >
            Tamamlandı
          </Button>
        ]}
        closable={false}
        maskClosable={false}
      >
        <div style={{ textAlign: 'center' }}>
          <Title level={1}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </Title>
          <Text>{activePomodoro?.goal}</Text>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default PomodoroPage; 