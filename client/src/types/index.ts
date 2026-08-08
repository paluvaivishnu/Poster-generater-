// ============================================
// BrandForge AI — Shared TypeScript Types
// ============================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface BrandKit {
  id: string;
  user_id: string;
  company_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  tagline: string;
  email: string;
  website: string;
  phone: string;
  social_handle: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedContent {
  headline: string;
  subtext: string;
  cta: string;
  theme: string;
  tone: string;
  layoutVariant?: string;
  source?: 'ai' | 'local';
}

// ============================================
// Design Style — controls AI background mood
// ============================================
export type DesignStyle =
  | 'modern'
  | 'luxury'
  | 'creative'
  | 'minimal'
  | 'corporate'
  | 'premium';

export interface DesignStyleInfo {
  id: DesignStyle;
  name: string;
  description: string;
  gradient: string;       // CSS gradient for the selected state
  overlayOpacity: number; // How dark the overlay on the AI background
  overlayColor: string;   // Overlay tint color
}

export const DESIGN_STYLES: DesignStyleInfo[] = [
  {
    id: 'modern',
    name: 'Modern Style',
    description: 'Clean, vibrant & contemporary with bold gradients',
    gradient: 'linear-gradient(135deg, #7c3aed, #ec4899)',
    overlayOpacity: 0.45,
    overlayColor: 'rgba(0,0,0,0.45)',
  },
  {
    id: 'luxury',
    name: 'Luxury Style',
    description: 'Dark, elegant & premium with gold accents',
    gradient: 'linear-gradient(135deg, #92400e, #d97706)',
    overlayOpacity: 0.55,
    overlayColor: 'rgba(10,5,0,0.55)',
  },
  {
    id: 'creative',
    name: 'Creative Style',
    description: 'Bold, expressive & artistic with vivid colors',
    gradient: 'linear-gradient(135deg, #059669, #0891b2)',
    overlayOpacity: 0.4,
    overlayColor: 'rgba(0,10,15,0.4)',
  },
  {
    id: 'minimal',
    name: 'Minimal Style',
    description: 'Clean, airy & typography-focused with white space',
    gradient: 'linear-gradient(135deg, #475569, #94a3b8)',
    overlayOpacity: 0.5,
    overlayColor: 'rgba(255,255,255,0.08)',
  },
  {
    id: 'corporate',
    name: 'Corporate Style',
    description: 'Professional, structured & trustworthy',
    gradient: 'linear-gradient(135deg, #1d4ed8, #0369a1)',
    overlayOpacity: 0.5,
    overlayColor: 'rgba(0,10,30,0.5)',
  },
  {
    id: 'premium',
    name: 'Premium Style',
    description: 'Ultra-high-end, dark neon & exclusive feel',
    gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed, #be185d)',
    overlayOpacity: 0.6,
    overlayColor: 'rgba(5,0,15,0.6)',
  },
];

// ============================================
// Aspect Ratio — controls poster dimensions
// ============================================
export type AspectRatioId = '1:1' | '4:5' | '9:16' | '16:9' | '3:4';

export interface AspectRatioInfo {
  id: AspectRatioId;
  label: string;
  description: string;
  width: number;
  height: number;
  icon: string;    // visual shape representation
}

export const ASPECT_RATIOS: AspectRatioInfo[] = [
  {
    id: '1:1',
    label: '1:1',
    description: 'Square · Instagram Feed',
    width: 1080,
    height: 1080,
    icon: '⬛',
  },
  {
    id: '4:5',
    label: '4:5',
    description: 'Portrait · Instagram',
    width: 1080,
    height: 1350,
    icon: '🟫',
  },
  {
    id: '9:16',
    label: '9:16',
    description: 'Story · Reels / TikTok',
    width: 1080,
    height: 1920,
    icon: '📱',
  },
  {
    id: '16:9',
    label: '16:9',
    description: 'Landscape · YouTube / LinkedIn',
    width: 1920,
    height: 1080,
    icon: '🖥️',
  },
  {
    id: '3:4',
    label: '3:4',
    description: 'Portrait · Pinterest / Print',
    width: 1080,
    height: 1440,
    icon: '📄',
  },
];

export function getCanvasDimensions(ratio: AspectRatioId = '4:5') {
  const found = ASPECT_RATIOS.find((r) => r.id === ratio);
  return { width: found?.width ?? 1080, height: found?.height ?? 1350 };
}

export interface PosterConfig {
  headline: string;
  subtext: string;
  cta: string;
  theme: string;
  tone: string;
  layoutVariant?: string;
  templateId: string;
  designStyle?: DesignStyle;
  aspectRatio?: AspectRatioId;
  fontSize: {
    headline: number;
    subtext: number;
    cta: number;
  };
  logoScale: number;
  logoX?: number;
  logoY?: number;
  showContacts: boolean;
  brandKit: BrandKit;
  bgImageUrl?: string;
  dragOffsets?: {
    headline?: { x: number; y: number };
    subtext?: { x: number; y: number };
    cta?: { x: number; y: number };
  };
}

export interface Poster {
  id: string;
  user_id: string;
  prompt: string;
  generated_content: GeneratedContent;
  template_id: string;
  poster_config: PosterConfig;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type TemplateId = 'bold-offer' | 'elegant-festive' | 'minimal-corporate' | 'dynamic-ai';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  icon: string;
  tags: string[];
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'dynamic-ai',
    name: 'Dynamic AI Layout',
    description: 'AI automatically positions text and graphics based on the generated background.',
    icon: '✨',
    tags: ['auto', 'dynamic', 'ai'],
  }
];

export function getTemplateForTheme(theme: string): TemplateId {
  return 'dynamic-ai';
}

// Legacy constants (default to 4:5 portrait)
export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1350;
