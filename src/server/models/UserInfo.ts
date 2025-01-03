import mongoose, { Schema, Document } from 'mongoose';

export interface IUserInfo extends Document {
  userId: string;
  birthDate: Date | null;
  gender: 'male' | 'female' | 'other' | null;
  createdAt: Date;
  updatedAt: Date;
}

const userInfoSchema = new Schema<IUserInfo>({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  birthDate: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', null],
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model<IUserInfo>('UserInfo', userInfoSchema);