import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from './config/db';
import { userService } from './services/userService';
import { workspaceService } from './services/workspaceService';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

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
      console.log('Login isteği:', req.body); // Debug için
      const { email, password } = req.body;
      const user = await userService.findUserByEmail(email);

      if (!user) {
        console.log('Kullanıcı bulunamadı:', email); // Debug için
        return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('Şifre kontrolü:', isValidPassword); // Debug için

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Geçersiz şifre' });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Login hatası:', error); // Debug için
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
  app.post('/api/workspaces', async (req, res) => {
    try {
      const { userId } = req.body;
      const workspace = await workspaceService.createWorkspace(req.body, userId);
      res.status(201).json(workspace);
    } catch (error) {
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
      const workspace = await workspaceService.approveWorkspace(req.params.id, req.body.adminId);
      res.json(workspace);
    } catch (error) {
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

  app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor 🌍`);
  });
}); 