// ============================================
// BrandForge AI — AI Background Generation Route
// ============================================
// Proxies requests to Pollinations.ai to generate rich, photorealistic
// poster backgrounds based on user prompt + design style + aspect ratio.
// Brand colors, logo, text are ALWAYS overlaid by the template engine.
//
// Festival Intelligence:
//   1. Known festivals: rich hardcoded visual descriptions.
//   2. Unknown festivals: Gemini with Google Search grounding looks it up
//      and returns an accurate visual description on-the-fly.

import { Router, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateBackgroundPrompt } from '../services/gemini';
import https from 'https';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Canvas dimensions for each aspect ratio
const RATIO_DIMENSIONS: Record<string, { w: number; h: number }> = {
  '1:1':  { w: 1080, h: 1080 },
  '4:5':  { w: 1080, h: 1350 },
  '9:16': { w: 1080, h: 1920 },
  '16:9': { w: 1920, h: 1080 },
  '3:4':  { w: 1080, h: 1440 },
};

// Design-style-specific visual direction for the AI
const STYLE_DIRECTION: Record<string, string> = {
  modern:    'clean modern commercial design, vibrant gradient colors, geometric bokeh, sharp contemporary aesthetic, bright and airy',
  luxury:    'ultra-luxury premium product photography, dark dramatic lighting, gold and amber tones, velvet textures, expensive bokeh, exclusive atmosphere',
  creative:  'bold creative artistic photography, vivid saturated colors, dynamic composition, painterly depth of field, energetic and expressive',
  minimal:   'minimalist clean background, white and neutral tones, soft light, airy open space, sophisticated simplicity, Japanese-inspired calm',
  corporate: 'modern professional office environment, glass and steel architecture, blue and white clean tones, structured geometric composition, trustworthy',
  premium:   'ultra-premium dark cinematic scene, deep purple and neon accents, sleek futuristic atmosphere, exclusive nighttime aesthetic, dramatic contrast',
};

// ─────────────────────────────────────────────────────────────────────────────
// THEME SCENES — richly described visual environments for each known festival
// or event type. Add new entries here as needed.
// ─────────────────────────────────────────────────────────────────────────────
const THEME_SCENES: Record<string, string> = {

  // ── Indian Festivals ──────────────────────────────────────────────────────

  diwali:
    'warm glowing oil diyas arranged in rows, golden bokeh lights, marigold garlands, rangoli patterns on the floor, ' +
    'sparklers, festive Indian celebration, orange gold and warm amber tones',

  sankranti:
    'colorful kites flying in a bright blue sky, Makar Sankranti harvest festival, tilgul sesame sweets, ' +
    'golden wheat fields, warm sunrise, kolam rangoli patterns, orange and gold celebration, South India harvest joy',

  pongal:
    'traditional Pongal clay pot overflowing with boiling rice and milk, sugarcane stalks, banana leaves, ' +
    'kolam floor art, turmeric yellow and red tones, warm harvest celebration, golden sunlight',

  dasara:
    'Goddess Durga / Chamundeshwari idol decorated with flowers and gold jewellery, vibrant idol pandal, ' +
    'golden yellow and deep red marigold garlands, effigies of Ravana, Mysore Dasara golden chariot procession, ' +
    'elephants draped in embroidered caparisons, firecrackers in the sky, Karnataka celebration, ' +
    'royal palace illuminated with thousands of lights, joyful crowds, deep saffron and gold tones',

  navratri:
    'Goddess Durga nine-day festival, Garba dance with women in colorful chaniya choli, ' +
    'dandiya sticks, bright red orange and gold colors, marigold decorations, diya lights, ' +
    'traditional Indian folk dance celebration, vibrant festive atmosphere',

  dussehra:
    'burning effigy of Ravana with fireworks, victory of good over evil, Ram Lila celebrations, ' +
    'giant illuminated Ravana effigy, firecrackers bursting in the sky, crowds celebrating, ' +
    'orange and gold colors, festive Indian atmosphere',

  ganesh:
    'beautiful elaborately decorated Lord Ganesha idol, modak sweets, marigold garlands, ' +
    'Ganesh Chaturthi pandal with flowers and lights, warm orange and saffron tones, ' +
    'festive Maharashtra celebration, crowds worshipping',

  onam:
    'Kerala Onam harvest festival, colorful pookkalam flower carpet on the ground, ' +
    'women in white and gold Kerala saree, Vallamkali snake boat race on backwaters, ' +
    'banana leaf Onam sadhya feast, lush green Kerala scenery, gold and white tones',

  bonalu:
    'Telangana Bonalu goddess festival, women carrying decorated bonalu pots with cooked rice on their heads, ' +
    'Goddess Mahakali / Kali Mata idol adorned with flowers and vermillion, ' +
    'red and saffron decorated pots with neem leaves and turmeric, ' +
    'colourful procession through streets, traditional Potharaju warrior figure, ' +
    'lamps and offerings, Telangana folk celebration, vibrant red orange and gold tones',

  bathukamma:
    'Telangana Bathukamma festival, beautiful flower stack arrangement of seasonal wildflowers, ' +
    'women in colorful sarees playing around the flower arrangement, ' +
    'marigolds, banti, tangedu, gunugu flowers stacked in a cone, ' +
    'festive Telangana harvest celebration, vibrant pink orange yellow and green tones',

  karthika:
    'Karthika Masam month festival, oil lamps deepam lit in rows on steps and courtyards, ' +
    'sacred Tulasi plant decorated with lamps, devotees bathing in holy rivers, ' +
    'Lord Shiva and Vishnu worship, golden lamp glow, serene spiritual atmosphere, ' +
    'white flowers, soft golden light',

  rath_yatra:
    'Puri Jagannath Rath Yatra chariot festival, massive decorated wooden chariot pulled by thousands, ' +
    'Lord Jagannath idol on the chariot, colourful flags and flowers, Odisha celebration, ' +
    'devotees in white and yellow, festive crowd, vibrant saffron and gold tones',

  ugadi:
    'Telugu/Kannada New Year Ugadi, neem flowers and mango leaves torana door decoration, ' +
    'colorful rangoli, Ugadi pachadi bowl with mixed flavors, spring flowers, ' +
    'fresh green and vibrant color palette, joyful harvest celebration',

  vishu:
    'Kerala Vishu festival, Vishukkani arrangement with golden cucumber, golden bell flowers kani konna, ' +
    'mirror, holy text, rice, fruits, Krishna idol, bright golden and green tones, new year prosperity',

  raksha_bandhan:
    'sister tying colorful rakhi thread on brother\'s wrist, decorative rakhi collection, ' +
    'sweets mithai, warm family celebration, golden and pink tones, Indian sibling festival',

  baisakhi:
    'Punjab Baisakhi harvest festival, golden wheat fields ready for harvest, ' +
    'Bhangra dance men in colorful turbans and kurta, mustard yellow and green fields, ' +
    'joyful celebration, Sikh traditions, sunny warm atmosphere',

  krishna:
    'Lord Krishna with flute in Vrindavan, colourful peacock feathers, yellow marigold flowers, ' +
    'Janmashtami celebration, golden blue and violet tones, traditional Indian devotional art',

  durga_puja:
    'Goddess Durga ten-armed idol with lion, Durga Puja pandal in Bengal, ' +
    'dhunuchi incense dance, red sindoor, white and red shefali flowers, ' +
    'elaborate idol with gold ornaments, festive West Bengal celebration',

  lohri:
    'bonfire burning with logs at night, people doing Bhangra around the fire, ' +
    'puffed rice popcorn revdi sesame til gajak sweets, Punjab winter harvest festival, ' +
    'warm orange fire glow, winter night stars, joyful celebration',

  holi:
    'explosion of vibrant colorful powder gulal in the air, Holi festival of colors, ' +
    'splashes of pink purple yellow green and red, joyful people throwing colors, ' +
    'water guns pichkari, celebration atmosphere, vivid rainbow tones',

  eid:
    'crescent moon and star in a beautiful night sky, Eid al-Fitr celebration, ' +
    'intricate henna mehndi patterns, dates and sweets sewaiyan dessert, ' +
    'mosque silhouette with golden lights, family gathering, green and gold tones',

  christmas:
    'sparkling christmas lights bokeh, snow-covered pine trees, warm fireplace glow, ' +
    'gift boxes with red ribbons, red and gold baubles, festive winter atmosphere',

  newyear:
    'fireworks bursting over a city skyline at midnight, confetti and streamers, ' +
    'champagne glasses clinking, glittering countdown celebration atmosphere, ' +
    'colorful lights reflecting in water, festive new year joy',

  independence:
    'Indian tricolor flag saffron white green waving in breeze, Ashoka Chakra, ' +
    'historical monuments like India Gate silhouette, patriotic national pride atmosphere, ' +
    'saffron white and green color palette',

  republic:
    'Republic Day parade on Rajpath New Delhi, military tanks and colorful state floats, ' +
    'Indian flag waving, President\'s address, tricolor confetti, patriotic celebration',

  teachers:
    'apple on a book, classroom with warm lighting, chalk on blackboard, ' +
    'flowers for teacher, appreciative warm academic atmosphere',

  mothers:
    'mother and child in warm embrace, soft pink and white flowers roses, ' +
    'love heart bokeh, gentle spring atmosphere, warm emotional celebration',

  fathers:
    'father and child portrait, warm sunset bokeh, wooden textures, ' +
    'tie and cufflinks accessories, strong warm celebration',

  // ── Commerce ─────────────────────────────────────────────────────────────

  sale:
    'luxury retail shopping bags, product display spotlights, elegant minimalist store space, ' +
    'price tags with bold offers, modern commercial atmosphere',

  launch:
    'dramatic product reveal stage, dark studio, futuristic spotlight beams, ' +
    'sleek technology unboxing atmosphere, cinematic dark dramatic',

  festive:
    'colorful celebration confetti falling, warm bokeh fairy lights, joyful festive atmosphere, ' +
    'gift ribbons, balloons, flowers, warm golden glow',

  // ── Professional ─────────────────────────────────────────────────────────

  corporate:
    'modern professional office environment, glass panels and steel architecture, ' +
    'blue and white clean tones, structured geometric composition, trustworthy business atmosphere',

  default:
    'abstract luxury commercial backdrop, soft bokeh depth-of-field gradient, ' +
    'editorial high-end commercial photography atmosphere',
};

// ─────────────────────────────────────────────────────────────────────────────
// THEME ALIASES — map alternate spellings / synonyms to canonical keys
// ─────────────────────────────────────────────────────────────────────────────
const THEME_ALIASES: Record<string, string> = {
  bonalu:           'bonalu',
  'bonalu festival': 'bonalu',
  bathukamma:       'bathukamma',
  karthika:         'karthika',
  karthika_masam:   'karthika',
  'karthika masam': 'karthika',
  rath_yatra:       'rath_yatra',
  'rath yatra':     'rath_yatra',
  'ratha yatra':    'rath_yatra',
  deepavali:        'diwali',
  'makar sankranti':'sankranti',
  dussera:          'dasara',
  dussehara:        'dasara',
  vijaya_dashami:   'dasara',
  vijayadashami:    'dasara',
  navaratri:        'navratri',
  ganesha:          'ganesh',
  ganeshotsav:      'ganesh',
  chaturthi:        'ganesh',
  janmashtami:      'krishna',
  'krishna jayanti':'krishna',
  rakhi:            'raksha_bandhan',
  'raksha bandhan': 'raksha_bandhan',
  'durga puja':     'durga_puja',
  'durga pooja':    'durga_puja',
  eid_ul_fitr:      'eid',
  'eid mubarak':    'eid',
  ramadan:          'eid',
  xmas:             'christmas',
  'new year':       'newyear',
  nye:              'newyear',
  'independence day':'independence',
  '15 august':      'independence',
  '26 january':     'republic',
  'republic day':   'republic',
};

// ─────────────────────────────────────────────────────────────────────────────
// AI-POWERED FALLBACK
// When a theme/festival is not in our map, ask Gemini to describe the visual
// elements of that festival so we can generate an accurate background.
// SDK v0.11 doesn't support googleSearch tool — we use a crafted prompt that
// asks Gemini to use its training knowledge to describe the festival visually.
// ─────────────────────────────────────────────────────────────────────────────
async function getThemeFromAI(theme: string, userPrompt: string): Promise<string> {
  if (!genAI) return THEME_SCENES.default;

  try {
    console.log(`[AI BG] Theme "${theme}" not in map — asking Gemini for visual description`);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const searchPrompt =
      `I need to generate a photorealistic poster background for "${theme}" festival/event. ` +
      `Context: "${userPrompt}". ` +
      `Describe ONLY the key visual elements of "${theme}" in 2-3 sentences for an image generation prompt. ` +
      `Include: the main deity or central figure (if any), traditional colors, decorations, typical scene, atmosphere. ` +
      `Be very specific to this festival. Return ONLY the visual description, no explanation.`;

    const result = await model.generateContent(searchPrompt);
    const description = result.response.text().trim();

    if (description && description.length > 20) {
      console.log(`[AI BG] AI description for "${theme}": ${description.substring(0, 150)}...`);
      return description;
    }
    return THEME_SCENES.default;
  } catch (err: any) {
    console.error('[AI BG] AI fallback failed:', err.message);
    return THEME_SCENES.default;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolve theme key → visual scene description
// ─────────────────────────────────────────────────────────────────────────────
async function resolveThemeScene(theme: string, userPrompt: string): Promise<string> {
  const key = (theme || 'default').toLowerCase().replace(/\s+/g, '_');

  // 1. Direct match
  if (THEME_SCENES[key]) return THEME_SCENES[key];

  // 2. Alias match
  const normalized = key.replace(/_/g, ' ');
  if (THEME_ALIASES[normalized]) return THEME_SCENES[THEME_ALIASES[normalized]] ?? THEME_SCENES.default;
  if (THEME_ALIASES[key]) return THEME_SCENES[THEME_ALIASES[key]] ?? THEME_SCENES.default;

  // 3. Partial key match (e.g. "diwali sale" → diwali)
  for (const k of Object.keys(THEME_SCENES)) {
    if (key.includes(k) || k.includes(key)) return THEME_SCENES[k];
  }

  // 4. AI Web Grounding — search the internet for this festival's visuals
  return getThemeFromAI(theme, userPrompt);
}

// Design-style text position — tells AI where to leave negative space
const STYLE_SPATIAL: Record<string, string> = {
  modern:    'leave a large dark empty rectangular area in the center-middle of the image for text overlay, elements framing top and bottom edges',
  luxury:    'leave a large empty negative space in the lower-left area for text overlay, dark vignette bottom-left, subject occupying upper-right',
  creative:  'leave large open negative space on the left side for bold text overlay, dynamic subject fills the right portion',
  minimal:   'leave a clean open negative space across the entire bottom half for text overlay, subject occupying only the top half',
  corporate: 'leave a clear structured negative space across the middle and lower two-thirds for text, architectural subject framing the top',
  premium:   'leave a large glowing negative space in the center with elements framing the outer edges, dark atmospheric center for text overlay',
};

async function buildImagePrompt(userPrompt: string, theme: string, designStyle: string): Promise<string> {
  const stylePart = STYLE_DIRECTION[designStyle] ?? STYLE_DIRECTION.modern;
  const themePart = await resolveThemeScene(theme, userPrompt);
  const spatialInstruction = STYLE_SPATIAL[designStyle] ?? STYLE_SPATIAL.modern;
  const quality = [
    'ultra high quality',
    'professional commercial photography',
    '4K resolution',
    'cinematic lighting',
    'photorealistic',
    'no text overlay',
    'no logos',
    'no watermarks',
  ].join(', ');

  return [stylePart, themePart, spatialInstruction, `inspired by ${userPrompt}`, quality].join(', ');
}

const downloadImage = (url: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadImage(response.headers.location!).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP ${response.statusCode}`));
      }
      const chunks: Buffer[] = [];
      response.on('data', (c) => chunks.push(c));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
};

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<any> => {
  const { prompt, theme = 'default', designStyle = 'modern', aspectRatio = '4:5', brandKit } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const dims = RATIO_DIMENSIONS[aspectRatio] ?? RATIO_DIMENSIONS['4:5'];

    // ── Step 1: Gemini acts as Prompt Engineer ─────────────────────────────────
    // Extract brand colors and industry from brand kit if available
    const brandColors: string[] = [];
    if (brandKit?.primaryColor) brandColors.push(brandKit.primaryColor);
    if (brandKit?.secondaryColor) brandColors.push(brandKit.secondaryColor);
    const brandIndustry: string | undefined = brandKit?.industry;

    let imagePrompt: string;
    try {
      imagePrompt = await generateBackgroundPrompt({
        userPrompt: prompt,
        theme,
        designStyle,
        aspectRatio,
        canvasW: dims.w,
        canvasH: dims.h,
        brandColors: brandColors.length ? brandColors : undefined,
        brandIndustry,
      });
    } catch {
      // Fallback to hardcoded prompt if Gemini prompt engineering fails
      imagePrompt = await buildImagePrompt(prompt, theme, designStyle);
    }

    // ── Step 2: Send engineered prompt to Pollinations.ai ─────────────────────
    const encodedPrompt = encodeURIComponent(imagePrompt);
    const seed = Math.floor(Math.random() * 999999);

    const pollinationsUrl =
      `https://image.pollinations.ai/prompt/${encodedPrompt}` +
      `?width=${dims.w}&height=${dims.h}&model=flux&nologo=true&enhance=true&seed=${seed}`;

    console.log(`[AI BG] style="${designStyle}" theme="${theme}" ratio="${aspectRatio}" ${dims.w}×${dims.h}`);
    const imageBuffer = await downloadImage(pollinationsUrl);
    const base64 = imageBuffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    console.log(`[AI BG] Done — ${Math.round(imageBuffer.length / 1024)}KB`);

    return res.json({
      imageUrl: dataUrl,
      promptUsed: imagePrompt,
      dimensions: dims,
    });

  } catch (error: any) {
    console.error('[AI BG] Error:', error.message);
    return res.status(500).json({ error: 'Failed to generate background image. Please try again.' });
  }
});

export default router;
