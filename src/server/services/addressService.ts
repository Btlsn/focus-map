import Address, { IAddress } from '../models/Address';

export const addressService = {
  createAddress: async (addressData: any): Promise<IAddress> => {
    try {
      const address = new Address(addressData);
      return await address.save();
    } catch (error) {
      console.error('Address oluşturma hatası:', error);
      throw error;
    }
  },

  getAddressById: async (id: string): Promise<IAddress | null> => {
    try {
      return await Address.findById(id);
    } catch (error) {
      console.error('Address bulma hatası:', error);
      throw error;
    }
  }
}; 