import Notification, { INotification } from '../models/Notification';

export const notificationService = {
  async createNotification(data: Partial<INotification>) {
    try {
      const notification = new Notification(data);
      return await notification.save();
    } catch (error) {
      console.error('Bildirim oluşturma hatası:', error);
      throw error;
    }
  },

  async getUserNotifications(userId: string) {
    try {
      return await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .lean();
    } catch (error) {
      console.error('Bildirimler alınırken hata:', error);
      throw error;
    }
  },

  async markAsRead(notificationId: string) {
    try {
      return await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
    } catch (error) {
      console.error('Bildirim güncelleme hatası:', error);
      throw error;
    }
  }
}; 