import mongoose, { Schema, Document } from 'mongoose';

export interface IUserInfo extends Document {
  userId: mongoose.Types.ObjectId;
  birthDate: Date;
  gender: 'male' | 'female' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

const UserInfoSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IUserInfo>('UserInfo', UserInfoSchema);