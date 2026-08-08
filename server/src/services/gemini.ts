import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import dotenv from 'dotenv';
import { refineFallbackContent } from './fallback';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const schema = z.object({
  headline: z.string(),
  subtext: z.string(),
  cta: z.string(),
  theme: z.string(),
  tone: z.string(),
  layoutVariant: z.string().optional()
});

export const generateContent = async (prompt: string, brandKit?: any) => {
  if (!genAI) {
    throw new Error('Gemini API key is not configured');
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const systemPrompt = `You are an expert marketing copywriter creating poster content. Generate PUNCHY, HIGH-IMPACT marketing copy.

Rules:
1. HEADLINE: Max 6 words. Include the festival/event name if mentioned. Feature the discount prominently. Make it bold and attention-grabbing.
2. SUBTEXT: Max 20 words. One compelling sentence about the offer. Reference the specific product/service.
3. CTA: 2-4 words. Action-oriented button text.
4. THEME: One lowercase keyword describing the visual theme. For Indian festivals use EXACTLY one of these keywords:
   diwali, sankranti, pongal, dasara, navratri, dussehra, ganesh, onam, ugadi, vishu, raksha_bandhan,
   baisakhi, holi, eid, lohri, krishna, durga_puja, independence, republic, christmas, newyear,
   bonalu, bathukamma, karthika, rath_yatra, teachers, mothers, fathers, sale, launch, corporate, festive.
   If the festival is not in this list, use the festival name directly in lowercase (e.g. "mahalaya", "bihu").
5. TONE: One word for the mood: festive, urgent, professional, celebratory, innovative, patriotic.
6. LAYOUT_VARIANT: Pick the best layout. Options: "top-heavy", "bottom-heavy", "split-left", "split-right", "center".

Examples:
- Prompt: "35% discount on Nike shoes for Sankranti" → { "headline": "Sankranti Sale: 35% Off!", "subtext": "Grab your favorite Nike shoes this festive season.", "cta": "Shop Now", "theme": "sankranti", "tone": "festive", "layoutVariant": "bottom-heavy" }
- Prompt: "Diwali 50% off electronics" → { "headline": "Diwali Mega Sale: 50% Off!", "subtext": "Light up your home with deals on top electronics.", "cta": "Shop Deals", "theme": "diwali", "tone": "festive", "layoutVariant": "top-heavy" }
- Prompt: "Happy Dasara wishes from our company" → { "headline": "Happy Dasara to All!", "subtext": "Wishing you victory, joy and prosperity this Vijayadashami.", "cta": "Celebrate With Us", "theme": "dasara", "tone": "festive", "layoutVariant": "center" }
- Prompt: "Navratri collection launch" → { "headline": "Navratri Glow Collection!", "subtext": "Dress up for nine nights of dance with our festive range.", "cta": "Shop Now", "theme": "navratri", "tone": "festive", "layoutVariant": "split-right" }
- Prompt: "Onam special offer on gold" → { "headline": "Onam Gold Rush!", "subtext": "Celebrate Kerala's harvest festival with our exclusive gold collection.", "cta": "View Collection", "theme": "onam", "tone": "festive", "layoutVariant": "bottom-heavy" }
- Prompt: "Wishing Bonalu festival from our company" → { "headline": "Happy Bonalu!", "subtext": "Wishing joy and blessings of Goddess Mahakali to all our customers.", "cta": "Celebrate With Us", "theme": "bonalu", "tone": "festive", "layoutVariant": "center" }
- Prompt: "Bathukamma festival greetings" → { "headline": "Happy Bathukamma!", "subtext": "Celebrate the Telangana flower festival with joy and colour.", "cta": "Join the Celebration", "theme": "bathukamma", "tone": "festive", "layoutVariant": "bottom-heavy" }
- Prompt: "New SaaS product launch" → { "headline": "Introducing Our New Platform", "subtext": "Built for teams who move fast and ship faster.", "cta": "Get Started", "theme": "launch", "tone": "innovative", "layoutVariant": "center" }

Return ONLY a strict JSON object:
{ "headline": "...", "subtext": "...", "cta": "...", "theme": "...", "tone": "...", "layoutVariant": "..." }
No markdown, no backticks, no explanation.`;

  const fullPrompt = `${systemPrompt}\n\nUser prompt: ${prompt}\nBrand Kit: ${JSON.stringify(brandKit || {})}`;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  let text = response.text();

  // Try to clean up the response if it has markdown formatting
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(text);
    return schema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error('Failed to generate valid JSON content');
  }
};

const refineSchema = z.object({
  action: z.enum(['update_text', 'update_bg', 'update_both']),
  updatedText: schema.optional(),
  newBgPrompt: z.string().optional()
});

export const refineContent = async (
  instruction: string,
  currentConfig: any,
  currentBgPrompt: string,
  brandKit?: any
) => {
  if (!genAI) {
    return refineFallbackContent(instruction, currentConfig, currentBgPrompt);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const systemPrompt = `You are an expert AI editor managing a poster generation system. The user has an existing poster and is giving a conversational instruction to refine it.
Your job is to determine what needs to change to fulfill the user's instruction: the poster's text, the background image, or both.

Current State:
- Text: ${JSON.stringify(currentConfig)}
- Background Prompt: "${currentBgPrompt}"

Instruction from user: "${instruction}"

Rules:
1. If the instruction is about text (e.g. "make it shorter", "change the CTA", "add a discount"), set action to "update_text" and provide the updatedText object.
2. If the instruction is about the visuals (e.g. "add a kite", "make it nighttime", "remove the trees", "add lord lakshmi devi"), set action to "update_bg" and provide a NEW, complete newBgPrompt that includes the original concept plus the new visual elements. Do NOT include layout instructions (e.g., "leave empty space") in the newBgPrompt, as the system handles that separately. Just describe the scene.
3. If it affects both (e.g. "make it a Diwali poster instead of Holi"), set action to "update_both" and provide both.

Return ONLY a strict JSON object matching this structure:
{
  "action": "update_text" | "update_bg" | "update_both",
  "updatedText": { "headline": "...", "subtext": "...", "cta": "...", "theme": "...", "tone": "...", "layoutVariant": "..." },
  "newBgPrompt": "..."
}
No markdown, no backticks, no explanation.`;

    const result = await model.generateContent(systemPrompt);
    let text = result.response.text();
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(text);
    return refineSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse Gemini refine response, using fallback:", error);
    return refineFallbackContent(instruction, currentConfig, currentBgPrompt);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GEMINI AS PROMPT ENGINEER
// ─────────────────────────────────────────────────────────────────────────────
// Instead of concatenating hardcoded strings, Gemini reads the full context
// (user intent, festival, design style, brand palette, canvas size, text zone)
// and writes a single, coherent, expert-level image generation prompt.
//
// Why this is better than string concatenation:
//  • Style × Festival coherence: "Luxury Onam" differs from "Minimal Onam"
//  • Cultural accuracy: Gemini knows every festival's visual vocabulary
//  • Brand context: brand colors and industry are naturally woven into the scene
//  • Spatial awareness: describes a scene that organically leaves space for text
// ─────────────────────────────────────────────────────────────────────────────

export interface BgPromptInput {
  userPrompt: string;       // Raw user request e.g. "Onam wishing poster for our company"
  theme: string;            // Detected festival/theme e.g. "onam"
  designStyle: string;      // e.g. "luxury", "modern", "minimal"
  aspectRatio: string;      // e.g. "4:5", "9:16", "16:9"
  canvasW: number;
  canvasH: number;
  brandColors?: string[];   // e.g. ["#1a1a2e", "#e94560"] from brand kit
  brandIndustry?: string;   // e.g. "Fashion", "Food", "Technology"
}

const STYLE_AESTHETIC: Record<string, string> = {
  modern:    'clean modern commercial photography, vibrant bokeh, sharp contemporary aesthetic, bright and airy',
  luxury:    'ultra-luxury product photography, dark dramatic lighting, gold and amber tones, velvet textures, exclusive high-end atmosphere',
  creative:  'bold artistic photography, vivid saturated colors, painterly depth of field, energetic and expressive composition',
  minimal:   'minimalist background, neutral tones, soft natural light, airy open space, calm sophisticated aesthetic',
  corporate: 'modern professional environment, glass and steel architecture, clean structured composition, trustworthy business tone',
  premium:   'cinematic dark scene, deep jewel tones with metallic or neon accents, exclusive nighttime aesthetic, dramatic contrast',
};

const TEXT_ZONE_INSTRUCTION: Record<string, string> = {
  modern:    'the center area should be a naturally darker, emptier space — visual elements frame the top and bottom edges',
  luxury:    'the subject and decorative elements occupy the upper-right — the bottom-left area is open, dark, and clear',
  creative:  'the visual subject is concentrated on the right side — the left side is open and atmospheric',
  minimal:   'the subject sits in the upper portion — the bottom half is clean, open, and softly lit',
  corporate: 'architectural or environmental elements frame the top — the middle and lower area is open and structured',
  premium:   'dramatic elements frame the outer edges — the center glows atmospherically and remains visually open',
};

export const generateBackgroundPrompt = async (input: BgPromptInput): Promise<string> => {
  const styleDesc = STYLE_AESTHETIC[input.designStyle] ?? STYLE_AESTHETIC.modern;
  const textZoneDesc = TEXT_ZONE_INSTRUCTION[input.designStyle] ?? TEXT_ZONE_INSTRUCTION.modern;

  if (!genAI) {
    return `${input.userPrompt}, ${input.theme} festival, ${styleDesc}, ${textZoneDesc}, ultra high quality, 4K resolution, cinematic lighting, photorealistic, no text, no logos, no watermarks`;
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const brandColorHint = input.brandColors?.length
    ? `The brand's primary colors are ${input.brandColors.join(', ')} — subtly weave these tones into the scene's lighting or background.`
    : '';
  const industryHint = input.brandIndustry
    ? `The company is in the ${input.brandIndustry} industry — reflect this subtly in the scene atmosphere.`
    : '';

  const engineerPrompt = `You are a world-class commercial photography art director and AI image prompt specialist.

A company wants to generate a photorealistic poster background image.

USER REQUEST: "${input.userPrompt}"
FESTIVAL / THEME: "${input.theme}"
DESIGN STYLE: "${input.designStyle}" — ${styleDesc}
CANVAS: ${input.canvasW}×${input.canvasH}px (${input.aspectRatio} ratio)
TEXT COMPOSITION NOTE: ${textZoneDesc}
${brandColorHint}
${industryHint}

YOUR TASK:
Write a single image generation prompt (120–160 words) for the Flux/Stable Diffusion model that:

1. CULTURAL ACCURACY — Describe the specific visual elements of "${input.theme}":
   - The correct deity, goddess, or central figure if applicable (e.g. Lord Lakshmi Devi, Durga, Ganesha)
   - Authentic traditional decorations, props, and symbols
   - Festival-specific colors, flowers, lamps, clothing
   - Correct atmosphere and setting

2. DESIGN STYLE — Naturally blend the "${input.designStyle}" aesthetic into the lighting, color grade, and mood.

3. SMART COMPOSITION — Describe the scene such that ${textZoneDesc}. Do NOT say "leave space" — instead place visual elements naturally so the composition achieves this.

4. END with these quality tags: ultra high quality, professional commercial photography, 4K resolution, cinematic lighting, photorealistic, no text, no logos, no watermarks.

Return ONLY the final image generation prompt. No label, no explanation, no markdown.`;

  try {
    const result = await model.generateContent(engineerPrompt);
    const prompt = result.response.text().trim().replace(/```[\s\S]*?```/g, '').trim();
    console.log(`[Prompt Engineer] ${prompt.split(' ').length} words | theme="${input.theme}" style="${input.designStyle}"`);
    return prompt;
  } catch (err: any) {
    console.error('[Prompt Engineer] Gemini call failed:', err.message);
    return `${input.userPrompt}, ${input.theme} festival celebration, ${styleDesc}, ${textZoneDesc}, ultra high quality, 4K resolution, cinematic lighting, photorealistic, no text, no logos, no watermarks`;
  }
};


