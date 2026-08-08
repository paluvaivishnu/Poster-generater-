import express from 'express';
import BrandKit from '../models/BrandKit';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const brandKit = await BrandKit.findOne({ userId: req.user.id });
    res.json(brandKit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch brand kits' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { 
    company_name, logo_url, primary_color, secondary_color, 
    tagline, email, website, phone, social_handle 
  } = req.body;

  if (!company_name) {
    return res.status(400).json({ error: 'Company Name is required' });
  }

  try {
    // Upsert (update if exists, create if not)
    const updatedBrandKit = await BrandKit.findOneAndUpdate(
      { userId: req.user.id },
      {
        company_name, logo_url, primary_color, secondary_color,
        tagline, email, website, phone, social_handle
      },
      { new: true, upsert: true }
    );
    res.status(200).json(updatedBrandKit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save brand kit' });
  }
});

export default router;
