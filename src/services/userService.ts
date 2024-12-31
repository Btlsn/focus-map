import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface UserData {
  email: string;
  fullName: string;
  password: string;
}

export const userService = {
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Giriş yapılırken bir hata oluştu');
      }
      throw error;
    }
  },

  async createUser(userData: UserData) {
    try {
      const response = await axios.post(`${API_URL}/users`, userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Kullanıcı oluşturulurken bir hata oluştu');
      }
      throw error;
    }
  },

  async getProfile() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Profil bilgileri alınamadı');
      }
      throw error;
    }
  }
}; 