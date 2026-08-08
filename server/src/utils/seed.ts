import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

export const seedDemoUser = async () => {
  try {
    const existingUser = await User.findOne({ email: 'demo@brandforge.ai' });
    if (!existingUser) {
      const passwordHash = await bcrypt.hash('password123', 10);
      await User.create({
        email: 'demo@brandforge.ai',
        passwordHash,
      });
      console.log('Demo user seeded.');
    }
  } catch (error) {
    console.error('Error seeding demo user:', error);
  }
};
