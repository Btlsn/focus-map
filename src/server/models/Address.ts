import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  country: string;
  city: string;
  district: string;
  neighborhood: string;
  fullAddress: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const addressSchema = new Schema<IAddress>({
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  neighborhood: {
    type: String,
    required: [true, 'Neighborhood is required'],
    trim: true
  },
  fullAddress: {
    type: String,
    required: [true, 'Full address is required'],
    trim: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required']
    }
  }
});

export default mongoose.model<IAddress>('Address', addressSchema); 