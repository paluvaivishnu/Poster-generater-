// ============================================
// BrandForge AI — Local Deterministic Content Generator
// ============================================
// Fallback when Gemini API is unavailable. Detects keywords and themes
// from the user's prompt and generates appropriate marketing copy.
// Returns the same JSON shape as the AI service.

interface FallbackResult {
  headline: string;
  subtext: string;
  cta: string;
  theme: string;
  tone: string;
}

/**
 * Extract percentage/number values from prompt (e.g., "10% off", "50% discount")
 */
function extractDiscount(prompt: string): string | null {
  const match = prompt.match(/(\d+)\s*%/);
  return match ? match[1] + '%' : null;
}

/**
 * Extract a key subject/product from the prompt (after "on", "for", "of")
 */
function extractSubject(prompt: string): string | null {
  const patterns = [
    /(?:on|for|of)\s+(.+?)(?:\.|$)/i,
    /(?:discount|offer|sale)\s+(?:on|for)\s+(.+?)(?:\.|$)/i,
  ];
  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

/**
 * Generate deterministic content based on keyword detection.
 * Tries to incorporate actual prompt details (discount %, product name) into copy.
 */
export const generateFallbackContent = (prompt: string): FallbackResult => {
  const lower = prompt.toLowerCase();
  const discount = extractDiscount(prompt);
  const subject = extractSubject(prompt);
  const subjectText = subject || 'our products';

  // --- Theme detection (priority ordered) ---

  // Diwali
  if (lower.includes('diwali') || lower.includes('deepavali')) {
    return {
      headline: discount ? `Diwali Sale: ${discount} Off!` : 'Light Up Your Diwali!',
      subtext: `This festive season, enjoy special offers on ${subjectText}. Spread the joy of Diwali with amazing deals.`,
      cta: discount ? `Get ${discount} Off Now` : 'Shop Festive Offers',
      theme: 'diwali',
      tone: 'festive',
    };
  }

  // Dasara / Dussehra / Vijayadashami
  if (lower.includes('dasara') || lower.includes('dussehra') || lower.includes('dussera') || lower.includes('vijayadashami') || lower.includes('navratri') && lower.includes('end')) {
    return {
      headline: discount ? `Dasara Sale: ${discount} Off!` : 'Happy Dasara to All!',
      subtext: `Wishing you victory, joy and prosperity this Vijayadashami. Celebrate with special offers on ${subjectText}.`,
      cta: discount ? `Shop & Save ${discount}` : 'Celebrate With Us',
      theme: 'dasara',
      tone: 'festive',
    };
  }

  // Bonalu
  if (lower.includes('bonalu')) {
    return {
      headline: discount ? `Bonalu Sale: ${discount} Off!` : 'Happy Bonalu!',
      subtext: `Wishing you the blessings of Goddess Mahakali. Celebrate Bonalu with joy and special offers on ${subjectText}.`,
      cta: discount ? `Get ${discount} Off` : 'Celebrate With Us',
      theme: 'bonalu',
      tone: 'festive',
    };
  }

  // Bathukamma
  if (lower.includes('bathukamma')) {
    return {
      headline: discount ? `Bathukamma Offers: ${discount} Off!` : 'Happy Bathukamma!',
      subtext: `Celebrate the Telangana flower festival with vibrant joy and special offers on ${subjectText}.`,
      cta: 'Join the Celebration',
      theme: 'bathukamma',
      tone: 'festive',
    };
  }

  // Navratri
  if (lower.includes('navratri') || lower.includes('navaratri') || lower.includes('garba') || lower.includes('dandiya')) {
    return {
      headline: discount ? `Navratri Sale: ${discount} Off!` : 'Celebrate Nine Nights of Joy!',
      subtext: `Dance into the festive season with special offers on ${subjectText}. Navratri blessings to you!`,
      cta: discount ? `Get ${discount} Off` : 'Shop Navratri Specials',
      theme: 'navratri',
      tone: 'festive',
    };
  }

  // Ganesh Chaturthi
  if (lower.includes('ganesh') || lower.includes('ganeshotsav') || lower.includes('chaturthi') || lower.includes('vinayaka')) {
    return {
      headline: discount ? `Ganesh Chaturthi: ${discount} Off!` : 'Ganpati Bappa Morya!',
      subtext: `May Lord Ganesha bring you success and happiness. Enjoy festive offers on ${subjectText}.`,
      cta: discount ? `Save ${discount} Now` : 'Celebrate With Us',
      theme: 'ganesh',
      tone: 'festive',
    };
  }

  // Onam
  if (lower.includes('onam') || lower.includes('pookalam') || lower.includes('mahabali')) {
    return {
      headline: discount ? `Onam Special: ${discount} Off!` : 'Happy Onam to All!',
      subtext: `Celebrate Kerala's harvest festival with special offers on ${subjectText}. Onam wishes!`,
      cta: discount ? `Get ${discount} Off` : 'Shop Onam Deals',
      theme: 'onam',
      tone: 'festive',
    };
  }

  // Ugadi
  if (lower.includes('ugadi') || lower.includes('yugadi') || lower.includes('gudi padwa')) {
    return {
      headline: discount ? `Ugadi Sale: ${discount} Off!` : 'Happy Ugadi New Year!',
      subtext: `Welcome the Telugu/Kannada New Year with special offers on ${subjectText}.`,
      cta: 'Celebrate Ugadi',
      theme: 'ugadi',
      tone: 'festive',
    };
  }

  // Baisakhi / Lohri
  if (lower.includes('baisakhi') || lower.includes('vaisakhi')) {
    return {
      headline: discount ? `Baisakhi Offers: ${discount} Off!` : 'Happy Baisakhi!',
      subtext: `Celebrate the harvest festival with joy and great offers on ${subjectText}.`,
      cta: 'Shop Baisakhi Deals',
      theme: 'baisakhi',
      tone: 'festive',
    };
  }

  if (lower.includes('lohri')) {
    return {
      headline: discount ? `Lohri Sale: ${discount} Off!` : 'Happy Lohri!',
      subtext: `Warm up this winter with festive offers on ${subjectText}. Lohri blessings!`,
      cta: 'Shop Lohri Deals',
      theme: 'lohri',
      tone: 'festive',
    };
  }

  // Raksha Bandhan
  if (lower.includes('raksha bandhan') || lower.includes('raksha') || lower.includes('rakhi')) {
    return {
      headline: discount ? `Rakhi Special: ${discount} Off!` : 'Celebrate the Bond of Love!',
      subtext: `Make this Raksha Bandhan extra special with our exclusive offers on ${subjectText}.`,
      cta: 'Shop Rakhi Gifts',
      theme: 'raksha_bandhan',
      tone: 'festive',
    };
  }

  // Durga Puja
  if (lower.includes('durga') || lower.includes('durga puja') || lower.includes('pujo')) {
    return {
      headline: discount ? `Durga Puja Sale: ${discount} Off!` : 'Subho Bijoya!',
      subtext: `Celebrate the triumph of good over evil with special offers on ${subjectText}.`,
      cta: 'Shop Puja Deals',
      theme: 'durga_puja',
      tone: 'festive',
    };
  }

  // Christmas
  if (lower.includes('christmas') || lower.includes('xmas') || lower.includes('holiday season')) {
    return {
      headline: discount ? `Christmas Special: ${discount} Off!` : 'Merry & Bright Holiday Deals!',
      subtext: `Unwrap joy this holiday season with exclusive offers on ${subjectText}. Make this Christmas unforgettable.`,
      cta: discount ? `Save ${discount} Today` : 'Shop Christmas Gifts',
      theme: 'christmas',
      tone: 'festive',
    };
  }

  // New Year
  if (lower.includes('new year') || lower.includes('newyear') || lower.includes('nye')) {
    return {
      headline: discount ? `New Year, New Deals: ${discount} Off!` : 'Cheers to a Brand New Year!',
      subtext: `Start the year right with incredible offers on ${subjectText}. Fresh beginnings, fresh savings.`,
      cta: 'Explore New Year Deals',
      theme: 'newyear',
      tone: 'celebratory',
    };
  }

  // Independence Day
  if (lower.includes('independence day') || lower.includes('republic day') || lower.includes('15 august') || lower.includes('26 january')) {
    return {
      headline: discount ? `Freedom Sale: ${discount} Off!` : 'Celebrate Freedom, Celebrate Savings!',
      subtext: `Honor the spirit of our nation with special offers on ${subjectText}. Proud to serve you.`,
      cta: 'Claim Your Offer',
      theme: lower.includes('republic') ? 'republic' : 'independence',
      tone: 'patriotic',
    };
  }

  // Eid
  if (lower.includes('eid') || lower.includes('ramadan') || lower.includes('ramzan')) {
    return {
      headline: discount ? `Eid Mubarak! ${discount} Off!` : 'Eid Mubarak — Celebrate with Us!',
      subtext: `Wishing you blessings and joy. Enjoy special festive offers on ${subjectText}.`,
      cta: 'Shop Eid Specials',
      theme: 'eid',
      tone: 'festive',
    };
  }

  // Holi
  if (lower.includes('holi')) {
    return {
      headline: discount ? `Holi Splash: ${discount} Off!` : 'Add Colors to Your Celebrations!',
      subtext: `Celebrate Holi with vibrant deals on ${subjectText}. Splash of savings awaits!`,
      cta: 'Shop Holi Deals',
      theme: 'holi',
      tone: 'festive',
    };
  }

  // Sankranti / Pongal / Makar Sankranti / Lohri / Uttarayan
  if (lower.includes('sankranti') || lower.includes('sankaranti') || lower.includes('sankranthi') || lower.includes('pongal') || lower.includes('makar') || lower.includes('uttarayan')) {
    return {
      headline: discount ? `Sankranti Festival Sale: ${discount} Off!` : 'Celebrate Sankranti with Amazing Deals!',
      subtext: `This harvest season, enjoy festive offers on ${subjectText}. Celebrate Sankranti with joy and savings.`,
      cta: discount ? `Get ${discount} Off Now` : 'Shop Sankranti Deals',
      theme: lower.includes('pongal') ? 'pongal' : 'sankranti',
      tone: 'festive',
    };
  }

  // General sale/discount/offer
  if (lower.includes('sale') || lower.includes('discount') || lower.includes('offer') || lower.includes('% off')) {
    return {
      headline: discount
        ? (subject ? `${discount} Off on ${subjectText}!` : `Massive ${discount} Off Sale!`)
        : 'Unbeatable Sale Live Now!',
      subtext: `Don't miss out on incredible savings on ${subjectText}. Limited time offer — act fast!`,
      cta: discount ? `Get ${discount} Off` : 'Shop the Sale',
      theme: 'sale',
      tone: 'urgent',
    };
  }

  // Launch / new product
  if (lower.includes('launch') || lower.includes('introducing') || lower.includes('announcing') || lower.includes('new product')) {
    return {
      headline: `Introducing: ${subject || 'Something Incredible'}`,
      subtext: `Experience the future of ${subjectText}. Be the first to explore our latest innovation.`,
      cta: 'Discover Now',
      theme: 'launch',
      tone: 'innovative',
    };
  }

  // Event / webinar / workshop
  if (lower.includes('event') || lower.includes('webinar') || lower.includes('workshop') || lower.includes('conference')) {
    return {
      headline: `Join Our ${subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Exclusive Event'}`,
      subtext: 'Connect, learn, and grow with industry leaders and peers. Reserve your spot today.',
      cta: 'Register Now',
      theme: 'corporate',
      tone: 'professional',
    };
  }

  // Festival (generic)
  if (lower.includes('festival') || lower.includes('celebration') || lower.includes('festive')) {
    return {
      headline: discount
        ? `Festive Special: ${discount} Off!`
        : 'Join the Celebration!',
      subtext: `Mark the occasion with joy and our special festival offers on ${subjectText}.`,
      cta: 'Celebrate With Us',
      theme: 'festival',
      tone: 'festive',
    };
  }

  // Business / corporate / services
  if (lower.includes('business') || lower.includes('corporate') || lower.includes('service') || lower.includes('consulting')) {
    return {
      headline: `Elevate Your ${subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : 'Business'}`,
      subtext: `Professional solutions designed to drive growth and deliver results for ${subjectText}.`,
      cta: 'Get Started',
      theme: 'corporate',
      tone: 'professional',
    };
  }

  // Default — try to create something useful from the prompt
  return {
    headline: subject
      ? subject.charAt(0).toUpperCase() + subject.slice(1)
      : 'Discover What\'s Possible',
    subtext: prompt.length > 20
      ? `${prompt.charAt(0).toUpperCase() + prompt.slice(1)}. Explore our latest offerings and find the perfect solution for you.`
      : 'Explore our latest solutions designed to help you achieve your goals and stand out.',
    cta: 'Learn More',
    theme: 'corporate',
    tone: 'professional',
  };
};

/**
 * Local fallback for AI Refinement when Gemini API key is not configured.
 */
export interface RefineResult {
  action: 'update_text' | 'update_bg' | 'update_both';
  updatedText?: {
    headline?: string;
    subtext?: string;
    cta?: string;
    theme?: string;
    tone?: string;
    layoutVariant?: string;
  };
  newBgPrompt?: string;
}

export const refineFallbackContent = (
  instruction: string,
  currentConfig: any,
  currentBgPrompt: string
): RefineResult => {
  const lower = instruction.toLowerCase();

  const isText =
    lower.includes('headline') ||
    lower.includes('subtext') ||
    lower.includes('text') ||
    lower.includes('cta') ||
    lower.includes('shorter') ||
    lower.includes('longer') ||
    lower.includes('discount') ||
    lower.includes('word');

  const cleanedInstruction = instruction.replace(/^(add|show|make|put|change)\s+/i, '');
  const basePrompt = currentBgPrompt || currentConfig?.theme || 'festive poster background';
  const newBgPrompt = `${basePrompt}, featuring ${cleanedInstruction}`;

  if (isText) {
    return {
      action: 'update_both',
      updatedText: {
        ...currentConfig,
      },
      newBgPrompt,
    };
  }

  return {
    action: 'update_bg',
    newBgPrompt,
  };
};

