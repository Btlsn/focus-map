import mongoose, { Schema, Document } from 'mongoose';

export interface IPomodoro extends Document {
  userId: string;
  startDate: Date;
  endDate: Date;
  goal: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

const pomodoroSchema = new Schema<IPomodoro>({
  userId: {
    type: String,
    required: [true, 'Kullanıcı ID zorunludur'],
    ref: 'User'
  },
  startDate: {
    type: Date,
    required: [true, 'Başlangıç tarihi zorunludur']
  },
  endDate: {
    type: Date,
    required: [true, 'Bitiş tarihi zorunludur']
  },
  goal: {
    type: String,
    required: [true, 'Hedef zorunludur']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IPomodoro>('Pomodoro', pomodoroSchema); 