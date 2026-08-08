// ============================================
// BrandForge AI — Poster Template: Minimal Corporate
// ============================================
// Clean layout, professional typography, geometric shapes.
// Features frosted glassmorphism and subtle gradients.

import { CANVAS_WIDTH, CANVAS_HEIGHT, PosterConfig } from '../../../types';

export function renderMinimalCorporate(config: PosterConfig) {
  const { brandKit, headline, subtext, cta, fontSize, showContacts } = config;
  const primary = brandKit.primary_color || '#7c3aed';
  const secondary = brandKit.secondary_color || '#6366f1';

  const nodes: any[] = [];

  // --- Premium Background ---
  nodes.push({
    type: 'Rect',
    props: {
      x: 0, y: 0,
      width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
      fill: '#f3f4f6', // subtle off-white
    },
  });

  // Soft glowing orb (mesh gradient effect)
  nodes.push({
    type: 'Circle',
    props: {
      x: CANVAS_WIDTH * 0.8, y: CANVAS_HEIGHT * 0.2,
      radius: CANVAS_WIDTH * 0.6,
      fillRadialGradientStartPoint: { x: 0, y: 0 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: 0, y: 0 },
      fillRadialGradientEndRadius: CANVAS_WIDTH * 0.6,
      fillRadialGradientColorStops: [0, primary, 1, 'rgba(255,255,255,0)'],
      opacity: 0.15,
    },
  });
  nodes.push({
    type: 'Circle',
    props: {
      x: CANVAS_WIDTH * 0.2, y: CANVAS_HEIGHT * 0.8,
      radius: CANVAS_WIDTH * 0.5,
      fillRadialGradientStartPoint: { x: 0, y: 0 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: 0, y: 0 },
      fillRadialGradientEndRadius: CANVAS_WIDTH * 0.5,
      fillRadialGradientColorStops: [0, secondary, 1, 'rgba(255,255,255,0)'],
      opacity: 0.15,
    },
  });

  // --- Subtle Grid Texture ---
  for(let i=0; i<15; i++) {
    nodes.push({
      type: 'Line',
      props: {
        points: [0, i * 60, CANVAS_WIDTH, i * 60],
        stroke: '#e5e7eb',
        strokeWidth: 1,
        opacity: 0.5,
      },
    });
  }
  for(let j=0; j<15; j++) {
    nodes.push({
      type: 'Line',
      props: {
        points: [j * 60, 0, j * 60, CANVAS_HEIGHT],
        stroke: '#e5e7eb',
        strokeWidth: 1,
        opacity: 0.5,
      },
    });
  }

  // --- Glassmorphism Card (Main Content Area) ---
  const cardMargin = 50;
  nodes.push({
    type: 'Rect',
    props: {
      x: cardMargin, y: cardMargin,
      width: CANVAS_WIDTH - cardMargin * 2, height: CANVAS_HEIGHT - cardMargin * 2,
      fill: 'rgba(255,255,255,0.7)',
      cornerRadius: 16,
      stroke: 'rgba(255,255,255,1)',
      strokeWidth: 2,
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowBlur: 30,
      shadowOffset: { x: 0, y: 15 },
    },
  });

  // Top accent bar
  nodes.push({
    type: 'Rect',
    props: {
      x: cardMargin + 40, y: cardMargin,
      width: 100, height: 4,
      fill: primary,
      cornerRadius: [0,0,4,4],
    },
  });

  // Side accent line
  nodes.push({
    type: 'Rect',
    props: {
      x: cardMargin, y: cardMargin + 100,
      width: 4, height: 120,
      fill: secondary,
      cornerRadius: [0,4,4,0],
    },
  });

  // --- Abstract Geometry Accent ---
  nodes.push({
    type: 'RegularPolygon',
    props: {
      x: CANVAS_WIDTH - cardMargin - 60, y: CANVAS_HEIGHT - cardMargin - 60,
      sides: 6,
      radius: 40,
      stroke: primary,
      strokeWidth: 2,
      fill: 'transparent',
      opacity: 0.2,
      rotation: 15,
    },
  });
  nodes.push({
    type: 'Circle',
    props: {
      x: CANVAS_WIDTH - cardMargin - 90, y: CANVAS_HEIGHT - cardMargin - 40,
      radius: 12,
      fill: secondary,
      opacity: 0.3,
    },
  });

  // --- Company Name ---
  nodes.push({
    type: 'Text',
    props: {
      x: cardMargin + 40, y: cardMargin + 40,
      text: brandKit.company_name.toUpperCase(),
      fontSize: 14,
      fontFamily: 'Inter, Arial, sans-serif',
      fontStyle: '800',
      fill: primary,
      letterSpacing: 3,
    },
  });

  // --- Headline ---
  nodes.push({
    type: 'Text',
    props: {
      x: cardMargin + 40, y: cardMargin + 100,
      width: CANVAS_WIDTH - cardMargin * 2 - 80,
      text: headline,
      fontSize: fontSize.headline,
      fontFamily: 'Inter, Arial, sans-serif',
      fontStyle: '800',
      fill: '#111827',
      lineHeight: 1.1,
      letterSpacing: -1,
    },
  });

  // --- Subtext ---
  nodes.push({
    type: 'Text',
    props: {
      x: cardMargin + 40, y: cardMargin + 120 + fontSize.headline * 1.2,
      width: CANVAS_WIDTH - cardMargin * 2 - 120,
      text: subtext,
      fontSize: fontSize.subtext,
      fontFamily: 'Inter, Arial, sans-serif',
      fontStyle: '400',
      fill: '#4b5563',
      lineHeight: 1.6,
    },
  });

  // --- CTA Button (Clean & Modern) ---
  const ctaWidth = Math.min(cta.length * (fontSize.cta * 0.6) + 80, CANVAS_WIDTH - cardMargin * 2 - 80);
  const ctaHeight = fontSize.cta + 32;
  const ctaY = CANVAS_HEIGHT * 0.65;

  nodes.push({
    type: 'Rect',
    props: {
      x: cardMargin + 40, y: ctaY,
      width: ctaWidth, height: ctaHeight,
      fill: '#111827',
      cornerRadius: 6,
      shadowColor: 'rgba(17,24,39,0.3)',
      shadowBlur: 15,
      shadowOffset: { x: 0, y: 8 },
    },
  });
  nodes.push({
    type: 'Text',
    props: {
      x: cardMargin + 40, y: ctaY + 14,
      width: ctaWidth,
      text: cta,
      fontSize: fontSize.cta,
      fontFamily: 'Inter, Arial, sans-serif',
      fontStyle: '600',
      fill: '#ffffff',
      align: 'center',
    },
  });

  // --- Tagline ---
  if (brandKit.tagline) {
    nodes.push({
      type: 'Text',
      props: {
        x: cardMargin + 40, y: CANVAS_HEIGHT - cardMargin - 120,
        width: CANVAS_WIDTH - cardMargin * 2 - 80,
        text: brandKit.tagline,
        fontSize: 20,
        fontFamily: 'Inter, Arial, sans-serif',
        fontStyle: 'italic',
        fill: '#9ca3af',
      },
    });
  }

  // --- Contact Info ---
  if (showContacts) {
    const contactParts: string[] = [];
    if (brandKit.website) contactParts.push(brandKit.website.replace(/^https?:\/\//, ''));
    if (brandKit.email) contactParts.push(brandKit.email);
    if (brandKit.phone) contactParts.push(brandKit.phone);
    if (brandKit.social_handle) contactParts.push(brandKit.social_handle);

    if (contactParts.length > 0) {
      nodes.push({
        type: 'Rect',
        props: {
          x: cardMargin + 40, y: CANVAS_HEIGHT - cardMargin - 70,
          width: CANVAS_WIDTH - cardMargin * 2 - 80, height: 1,
          fill: '#e5e7eb',
        },
      });
      nodes.push({
        type: 'Text',
        props: {
          x: cardMargin + 40, y: CANVAS_HEIGHT - cardMargin - 45,
          width: CANVAS_WIDTH - cardMargin * 2 - 80,
          text: contactParts.join('    •    '),
          fontSize: 14,
          fontFamily: 'Inter, Arial, sans-serif',
          fontStyle: '500',
          fill: '#6b7280',
          align: 'left',
        },
      });
    }
  }

  return nodes;
}
