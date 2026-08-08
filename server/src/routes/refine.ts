import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { refineContent } from '../services/gemini';

const router = express.Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  const { instruction, currentConfig, currentBgPrompt } = req.body;

  if (!instruction || !currentConfig) {
    return res.status(400).json({ error: 'Instruction and currentConfig are required' });
  }

  try {
    const result = await refineContent(instruction, currentConfig, currentBgPrompt || '');
    return res.json(result);
  } catch (error: any) {
    console.error('Error in refine API:', error);
    return res.status(500).json({ error: error.message || 'Failed to refine content' });
  }
});

export default router;
