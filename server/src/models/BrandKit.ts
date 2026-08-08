import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBrandKit extends Document {
  userId: Types.ObjectId;
  company_name: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  tagline?: string;
  email?: string;
  website?: string;
  phone?: string;
  social_handle?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandKitSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company_name: { type: String, required: true },
    logo_url: { type: String },
    primary_color: { type: String, default: '#7c3aed' },
    secondary_color: { type: String, default: '#6366f1' },
    tagline: { type: String },
    email: { type: String },
    website: { type: String },
    phone: { type: String },
    social_handle: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IBrandKit>('BrandKit', BrandKitSchema);
