import mongoose from 'mongoose';
import { startGrpcServer } from './grpc/grpcServer';
import { startSoapServer } from './soap/soapServer';
import Workspace from '@models/Workspace';
import Comment from '@models/Comment';
import Rating from '@models/Rating';
import dotenv from 'dotenv';

// Ana projedeki .env dosyasını kullan
dotenv.config({ path: '../.env' });

// MongoDB Atlas bağlantısı
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('MongoDB Atlas bağlantısı başarılı 🌟');
    
    // Model bağlantılarını kontrol et
    console.log('Models loaded:', {
      Workspace: !!Workspace,
      Comment: !!Comment,
      Rating: !!Rating
    });
    
    // GRPC Sunucusunu başlat
    startGrpcServer();
    
    // SOAP Sunucusunu başlat
    startSoapServer();
  })
  .catch(err => console.error('MongoDB Atlas bağlantı hatası:', err)); 