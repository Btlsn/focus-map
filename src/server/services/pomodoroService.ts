import Pomodoro, { IPomodoro } from '../models/Pomodoro';

export const pomodoroService = {
  async createPomodoro(data: Partial<IPomodoro>) {
    const pomodoro = new Pomodoro(data);
    await pomodoro.save();
    return pomodoro;
  },

  async getUserPomodoros(userId: string) {
    return Pomodoro.find({ userId }).sort({ createdAt: -1 });
  },

  async updatePomodoroStatus(id: string, status: 'completed' | 'cancelled') {
    return Pomodoro.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }
}; 