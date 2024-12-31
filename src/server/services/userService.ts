import User, { IUser } from '../models/User';

interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
}

export const userService = {
  async createUser(userData: CreateUserData) {
    try {
      const user = new User({
        ...userData,
        role: 'user'
      });
      
      await user.save();
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Kullanıcı oluşturulurken bir hata oluştu');
    }
  },

  async findUserByEmail(email: string) {
    return User.findOne({ email });
  },

  async findUserById(id: string) {
    return User.findById(id);
  }
};