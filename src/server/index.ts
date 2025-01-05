import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from './config/db';
import { userService } from './services/userService';
import { workspaceService } from './services/workspaceService';
import { ratingService } from './services/ratingService';
import { addressService } from './services/addressService';
import UserInfo from './models/UserInfo';
import mongoose from 'mongoose';
import { IUser } from './models/User';
import Rating from './models/Rating';
import { Request, Response, NextFunction } from 'express';
import Log from './models/Log';
import * as UAParser from 'ua-parser-js';
import { pomodoroService } from './services/pomodoroService';
import { favoriteService } from './services/favoriteService';
import { startGrpcServer } from '../protocols/grpc/grpcServer';
import { startSoapServer } from '../protocols/soap/soapServer';
import commentRoutes from './routes/commentRoutes';
import { notificationService } from './services/notificationService';
import { getRatingClient } from '../protocols/grpc/grpcClient';
import Workspace from './models/Workspace';



const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.set('trust proxy', true);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

interface AuthRequest extends express.Request {
  user?: {
    userId: string;
    email: string;
  };
}

// Token doğrulama middleware'i
const authenticateToken = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token bulunamadı' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Geçersiz token' });
  }
};

// MongoDB bağlantısı
connectDB().then(() => {
   // Kullanıcı oluşturma
   app.post('/api/users', async (req, res) => {
    try {
      // Şifreyi hashle
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      const result = await userService.createUser({
        ...req.body,
        password: hashedPassword
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Kullanıcı oluşturulamadı' });
    }
  });

  // Login endpoint'i
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await userService.findUserByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Geçersiz şifre' });
      }

      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Log kaydı oluştur
      const parser = new UAParser.UAParser(req.headers['user-agent']);
      const browserInfo = parser.getResult();

      // IPv4 adresini al
      let ipAddress = req.ip || req.connection.remoteAddress;
      // IPv6 formatındaysa IPv4'e dönüştür
      if (ipAddress?.includes('::ffff:')) {
        ipAddress = ipAddress.split(':').pop();
      }

      const log = new Log({
        userId: user._id,
        ipAddress: ipAddress || 'unknown',
        browser: {
          name: browserInfo.browser.name || 'unknown',
          version: browserInfo.browser.version || 'unknown',
          os: browserInfo.os.name + ' ' + browserInfo.os.version || 'unknown'
        }
      });
      await log.save();

      const userData = {
        id: user._id.toString(),
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      };

      console.log('Login response:', userData);
      res.json({ token, user: userData });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Giriş yapılırken bir hata oluştu' });
    }
  });

  // Profil endpoint'i
  app.get('/api/users/profile', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Token bulunamadı' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await userService.findUserById(decoded.userId);

      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }

      res.json({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      });
    } catch (error) {
      res.status(401).json({ error: 'Geçersiz token' });
    }
  });

  // Workspace endpoints
  app.post('/api/workspaces', authenticateToken, async (req, res) => {
    try {
      const workspace = await workspaceService.createWorkspace({
        ...req.body,
        details: {
          ...req.body.details,
          createdBy: req.user.userId
        }
      });
      
      res.status(201).json(workspace);
    } catch (error) {
      console.error('Workspace oluşturma hatası:', error);
      res.status(500).json({ error: 'Mekan eklenirken bir hata oluştu' });
    }
  });

  app.get('/api/workspaces/pending', async (req, res) => {
    try {
      const workspaces = await workspaceService.getWorkspaces('pending');
      res.json(workspaces);
    } catch (error) {
      res.status(500).json({ error: 'Mekanlar yüklenirken bir hata oluştu' });
    }
  });

  app.post('/api/workspaces/:id/approve', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Token bulunamadı' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      console.log('Onaylama isteği:', { 
        workspaceId: req.params.id, 
        adminId: decoded.userId 
      });

      const workspace = await workspaceService.approveWorkspace(
        req.params.id, 
        decoded.userId
      );
      
      console.log('Onaylanan workspace:', workspace);
      res.json(workspace);
    } catch (error) {
      console.error('Onaylama hatası:', error);
      res.status(500).json({ error: 'Onaylama işlemi başarısız oldu' });
    }
  });

  app.post('/api/workspaces/:id/reject', async (req, res) => {
    try {
      const workspace = await workspaceService.rejectWorkspace(req.params.id);
      res.json(workspace);
    } catch (error) {
      res.status(500).json({ error: 'Reddetme işlemi başarısız oldu' });
    }
  });

  app.get('/api/workspaces/approved', async (req, res) => {
    try {
      const workspaces = await workspaceService.getWorkspaces('approved');
      res.json(workspaces);
    } catch (error) {
      res.status(500).json({ error: 'Mekanlar yüklenirken bir hata oluştu' });
    }
  });

  // Address endpoints
  app.post('/api/addresses', authenticateToken, async (req, res) => {
    try {
      const address = await addressService.createAddress(req.body);
      res.status(201).json(address);
    } catch (error) {
      console.error('Address oluşturma hatası:', error);
      res.status(500).json({ error: 'Adres eklenirken bir hata oluştu' });
    }
  });

  // Rating endpoints
  app.post('/api/ratings', async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Token bulunamadı' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const rating = await ratingService.createRating({
        ...req.body,
        userId: decoded.userId
      });
      
      res.status(201).json(rating);
    } catch (error) {
      console.error('Rating oluşturma hatası:', error);
      res.status(500).json({ error: 'Puanlama eklenirken bir hata oluştu' });
    }
  });

  app.get('/api/workspaces/:id/ratings', async (req, res) => {
    try {
      const ratings = await ratingService.getWorkspaceRatings(req.params.id);
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ error: 'Puanlamalar yüklenirken bir hata oluştu' });
    }
  });

  app.get('/api/workspaces/:id/ratings/average', async (req, res) => {
    try {
      const averages = await ratingService.getAverageRatings(req.params.id);
      res.json(averages);
    } catch (error) {
      res.status(500).json({ error: 'Ortalama puanlar hesaplanırken bir hata oluştu' });
    }
  });

  app.get('/api/workspaces/:id/ratings/grpc', async (req, res) => {
    try {
      const client = getRatingClient();
      console.log('GRPC Client created for workspace:', req.params.id);
      
      const workspace = await Workspace.findById(req.params.id);
      console.log('Workspace type:', workspace?.type);
      
      const ratings = await new Promise((resolve, reject) => {
        client.calculateAverageRatings({ 
          workspaceId: req.params.id,
          type: workspace?.type || 'cafe'  // Add workspace type to request
        }, (error: any, response: any) => {
          if (error) {
            console.error('GRPC service error:', error);
            reject(error);
            return;
          }
          console.log('GRPC response received:', response);
          resolve(response);
        });
      });
      
      console.log('Final ratings to be sent:', ratings);
      res.json(ratings);
    } catch (error) {
      console.error('GRPC rating error:', error);
      res.status(500).json({ 
        error: 'Rating calculation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // UserInfo endpoint'leri
  app.get('/api/users/:id/info', authenticateToken, async (req, res) => {
    try {
      const userInfo = await UserInfo.findOne({ userId: req.params.id });
      if (!userInfo) {
        // Kullanıcı bilgisi yoksa boş bir obje döndür
        return res.json({
          userId: req.params.id,
          birthDate: null,
          gender: null
        });
      }
      res.json(userInfo);
    } catch (error) {
      console.error('UserInfo getirme hatası:', error);
      res.status(500).json({ error: 'Kullanıcı bilgileri alınamadı' });
    }
  });

  app.put('/api/users/:id/info', authenticateToken, async (req, res) => {
    try {
      const { birthDate, gender } = req.body;
      
      const userInfo = await UserInfo.findOneAndUpdate(
        { userId: req.params.id },
        { 
          userId: req.params.id,
          birthDate, 
          gender 
        },
        { new: true, upsert: true } // upsert: true ile yoksa yeni kayıt oluşturur
      );
      
      res.json(userInfo);
    } catch (error) {
      console.error('UserInfo güncelleme hatası:', error);
      res.status(500).json({ error: 'Kullanıcı bilgileri güncellenemedi' });
    }
  });

  // Kullanıcının bir workspace için verdiği puanı getir
  app.get('/api/workspaces/:id/user-rating', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
      const rating = await Rating.findOne({
        workspaceId: req.params.id,
        userId: req.user?.userId
      });
      
      if (!rating) {
        return res.json(null);
      }
      
      res.json(rating.categories);
    } catch (error) {
      res.status(500).json({ error: 'Kullanıcı puanı alınırken bir hata oluştu' });
    }
  });

  app.post('/api/workspaces/:id/ratings/update', authenticateToken, async (req, res) => {
    try {
      const rating = await ratingService.updateRating(
        req.params.id,
        req.user.userId,
        req.body.categories
      );
      
      if (!rating) {
        return res.status(404).json({ error: 'Puan bulunamadı' });
      }
      
      res.json(rating);
    } catch (error) {
      console.error('Rating güncelleme hatası:', error);
      res.status(500).json({ error: 'Puanlama güncellenirken bir hata oluştu' });
    }
  });

  // Pomodoro routes
  app.post('/api/pomodoros', authenticateToken, async (req, res) => {
    try {
      const pomodoro = await pomodoroService.createPomodoro({
        ...req.body,
        userId: req.user.userId
      });
      res.status(201).json(pomodoro);
    } catch (error) {
      res.status(500).json({ error: 'Pomodoro oluşturulamadı' });
    }
  });

  app.get('/api/pomodoros', authenticateToken, async (req, res) => {
    try {
      const pomodoros = await pomodoroService.getUserPomodoros(req.user.userId);
      res.json(pomodoros);
    } catch (error) {
      res.status(500).json({ error: 'Pomodorolar alınamadı' });
    }
  });

  app.patch('/api/pomodoros/:id/status', authenticateToken, async (req, res) => {
    try {
      const pomodoro = await pomodoroService.updatePomodoroStatus(
        req.params.id,
        req.body.status
      );
      res.json(pomodoro);
    } catch (error) {
      res.status(500).json({ error: 'Pomodoro durumu güncellenemedi' });
    }
  });

  // Favori endpoints
  app.post('/api/favorites', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
      const favorite = await favoriteService.addFavorite(
        req.user.userId,
        req.body.workspaceId
      );
      res.status(201).json(favorite);
    } catch (error) {
      if (error.message === 'Bu mekan zaten favorilerinizde') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Favori eklenirken bir hata oluştu' });
      }
    }
  });

  app.delete('/api/favorites/:workspaceId', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
      await favoriteService.removeFavorite(req.user.userId, req.params.workspaceId);
      res.json({ message: 'Favori başarıyla kaldırıldı' });
    } catch (error) {
      res.status(500).json({ error: 'Favori kaldırılırken bir hata oluştu' });
    }
  });

  app.get('/api/favorites', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
      const favorites = await favoriteService.getUserFavorites(req.user.userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: 'Favoriler alınırken bir hata oluştu' });
    }
  });

  app.get('/api/favorites/check/:workspaceId', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
      const isFavorite = await favoriteService.isFavorite(
        req.user.userId,
        req.params.workspaceId
      );
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ error: 'Favori kontrolü yapılırken bir hata oluştu' });
    }
  });

  // Notification endpoints
  app.get('/api/notifications', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
      const notifications = await notificationService.getUserNotifications(req.user.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: 'Bildirimler alınamadı' });
    }
  });

  app.patch('/api/notifications/:id/read', authenticateToken, async (req: AuthRequest, res: express.Response) => {
    try {
      const notification = await notificationService.markAsRead(req.params.id);
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: 'Bildirim güncellenemedi' });
    }
  });

  console.log('MongoDB Atlas bağlantısı başarılı 🌟');

  // Express sunucusunu başlat
  app.listen(PORT, () => {
    console.log(`REST API Server running on port ${PORT}`);
    
    // gRPC sunucusunu başlat
    startGrpcServer();
    
    // SOAP sunucusunu başlat
    startSoapServer();
  });
}).catch(err => {
  console.error('Server başlatma hatası:', err);
  process.exit(1);
});

app.use('/api', commentRoutes);

// ... mevcut Express route'ları ve middleware'ler ...

// ... mevcut Express route'ları ve middleware'ler ...