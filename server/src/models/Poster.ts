import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPoster extends Document {
  userId: Types.ObjectId;
  title: string;
  imageUrl?: string;
  content: string; // The generation prompt or description
  style?: string;
  brandKitId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PosterSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    imageUrl: { type: String },
    content: { type: String, required: true },
    style: { type: String },
    brandKitId: { type: Schema.Types.ObjectId, ref: 'BrandKit' },
  },
  { timestamps: true }
);

export default mongoose.model<IPoster>('Poster', PosterSchema);
