import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  fullName: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email zorunludur'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Şifre zorunludur'],
    minlength: 6
  },
  fullName: {
    type: String,
    required: [true, 'İsim zorunludur']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Email benzersizliğini kontrol eden middleware
userSchema.pre('save', async function(next) {
  if (this.isModified('email')) {
    const existingUser = await this.model('User').findOne({ email: this.email });
    if (existingUser) {
      throw new Error('Bu email adresi zaten kullanımda');
    }
  }
  next();
});

export default mongoose.model<IUser>('User', userSchema); 