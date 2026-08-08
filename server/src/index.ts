import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

import generateRouter from './routes/generate';
import generateBgRouter from './routes/generate-background';
import postersRouter from './routes/posters';
import authRouter from './routes/auth';
import uploadRouter from './routes/upload';
import brandKitsRouter from './routes/brand-kits';
import refineRouter from './routes/refine';
import { seedDemoUser } from './utils/seed';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use('/api/generate', generateRouter);
app.use('/api/generate-background', generateBgRouter);
app.use('/api/posters', postersRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/brand-kits', brandKitsRouter);
app.use('/api/refine', refineRouter);

mongoose
  .connect('mongodb://127.0.0.1:27017/brandforge')
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedDemoUser();
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
