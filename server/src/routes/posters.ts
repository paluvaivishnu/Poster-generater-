import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import Poster from '../models/Poster';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

router.use(authenticate);

// List user's posters
router.get('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const posters = await Poster.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(posters);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single poster
router.get('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const poster = await Poster.findOne({ _id: req.params.id, userId: req.user.id });
    if (!poster) return res.status(404).json({ error: 'Poster not found' });
    res.json(poster);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create poster
router.post('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const newPoster = await Poster.create({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(newPoster);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update poster
router.put('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const updatedPoster = await Poster.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedPoster) return res.status(404).json({ error: 'Poster not found' });
    res.json(updatedPoster);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete poster
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const deleted = await Poster.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: 'Poster not found' });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
