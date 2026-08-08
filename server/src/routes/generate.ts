import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { generateContent } from '../services/gemini';
import { generateFallbackContent } from '../services/fallback';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  const { prompt, brandKit } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    if (process.env.GEMINI_API_KEY) {
      try {
        const content = await generateContent(prompt, brandKit);
        return res.json({ ...content, source: "ai" });
      } catch (aiError) {
        console.error("AI Generation failed, falling back to local:", aiError);
      }
    }
    
    const fallbackContent = generateFallbackContent(prompt);
    return res.json({ ...fallbackContent, source: "local" });
  } catch (error) {
    console.error("Generate route error:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
