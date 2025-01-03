import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext<any>(undefined);

interface User {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    }
    setLoading(false);
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
      const { token, user } = response.data;
      
      console.log('Login response in AuthContext:', { token, user });

      if (!user || !user._id) {
        throw new Error('Invalid user data received');
      }

      localStorage.setItem('token', token);
      const userData = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      };
      
      setUser(userData);
      setIsLoggedIn(true);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };


  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 