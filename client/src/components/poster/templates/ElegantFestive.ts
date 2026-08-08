// ============================================
// BrandForge AI — Poster Template: Elegant Festive
// ============================================
// Warm festive background, gold accents, decorative elements,
// glowing typography, and complex geometry.
// Suitable for Diwali, Christmas, Sankranti, New Year, celebrations.
// Discount % is visually dominant when present.

import { CANVAS_WIDTH, CANVAS_HEIGHT, PosterConfig } from '../../../types';

/**
 * Extract discount percentage from text (e.g. "35% Off Sale!" → "35%")
 * and the remaining headline text without the percentage.
 */
function extractDiscount(text: string): { discount: string | null; rest: string } {
  const match = text.match(/(\d+%)/);
  if (match) {
    const rest = text
      .replace(match[1], '')
      .replace(/\s{2,}/g, ' ')
      .replace(/^\s*[^\w]*\s*/, '')
      .trim();
    return { discount: match[1], rest: rest || text };
  }
  return { discount: null, rest: text };
}

export function renderElegantFestive(config: PosterConfig) {
  const { brandKit, headline, subtext, cta, fontSize, showContacts, theme } = config;
  const primary = brandKit.primary_color || '#7c3aed';
  const secondary = brandKit.secondary_color || '#6366f1';

  const nodes: any[] = [];
  const goldColor = '#d4a847';
  const goldLight = '#fcf2c5';
  const { discount, rest: headlineRest } = extractDiscount(headline);

  // --- Rich Background ---
  nodes.push({
    type: 'Rect',
    props: {
      x: 0, y: 0,
      width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
      fill: '#080514', // Deep, very dark purple/black
    },
  });

  // Glowing radial gradient at the center
  nodes.push({
    type: 'Circle',
    props: {
      x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT * 0.35,
      radius: CANVAS_WIDTH * 0.8,
      fillRadialGradientStartPoint: { x: 0, y: 0 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: 0, y: 0 },
      fillRadialGradientEndRadius: CANVAS_WIDTH * 0.8,
      fillRadialGradientColorStops: [
        0, 'rgba(120,40,80,0.4)',
        0.4, 'rgba(80,30,120,0.2)',
        1, 'rgba(0,0,0,0)'
      ],
    },
  });

  // Background stars / dots (subtle noise)
  for (let i = 0; i < 40; i++) {
    nodes.push({
      type: 'Circle',
      props: {
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        radius: 1 + Math.random() * 2,
        fill: goldColor,
        opacity: Math.random() * 0.3 + 0.1,
        shadowBlur: 5,
        shadowColor: goldColor,
      },
    });
  }

  // --- Elegant Gold Border ---
  const margin = 40;

  // Outer glowing line
  nodes.push({
    type: 'Rect',
    props: {
      x: margin, y: margin,
      width: CANVAS_WIDTH - margin * 2, height: CANVAS_HEIGHT - margin * 2,
      stroke: goldColor,
      strokeWidth: 2,
      opacity: 0.8,
      shadowBlur: 10,
      shadowColor: goldColor,
    },
  });

  // Inner subtle border
  nodes.push({
    type: 'Rect',
    props: {
      x: margin + 12, y: margin + 12,
      width: CANVAS_WIDTH - (margin + 12) * 2, height: CANVAS_HEIGHT - (margin + 12) * 2,
      stroke: goldColor,
      strokeWidth: 1,
      opacity: 0.3,
    },
  });

  // Corner diamonds
  const corners = [
    { x: margin, y: margin },
    { x: CANVAS_WIDTH - margin, y: margin },
    { x: margin, y: CANVAS_HEIGHT - margin },
    { x: CANVAS_WIDTH - margin, y: CANVAS_HEIGHT - margin },
  ];
  corners.forEach(({ x, y }) => {
    nodes.push({
      type: 'RegularPolygon',
      props: {
        x, y,
        sides: 4,
        radius: 14,
        fill: goldColor,
        shadowBlur: 15,
        shadowColor: goldColor,
      },
    });
  });

  // --- Intricate Logo Background Frame (Clock/Mandala style) ---
  const cx = CANVAS_WIDTH / 2;
  const cy = CANVAS_HEIGHT * 0.15;

  // Outer ring of triangles
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12;
    nodes.push({
      type: 'RegularPolygon',
      props: {
        x: cx + Math.cos(angle) * 90,
        y: cy + Math.sin(angle) * 90,
        sides: 3,
        radius: 8,
        fill: goldColor,
        rotation: (i * 30) + 90,
        opacity: 0.6,
      },
    });
  }

  // Inner glowing rings
  nodes.push({
    type: 'Circle',
    props: {
      x: cx, y: cy,
      radius: 65,
      stroke: 'rgba(212,168,71,0.2)',
      strokeWidth: 1,
    }
  });
  nodes.push({
    type: 'Circle',
    props: {
      x: cx, y: cy,
      radius: 50,
      stroke: goldColor,
      strokeWidth: 2,
      shadowBlur: 15,
      shadowColor: goldColor,
    }
  });

  // Side decorative medallions
  const leftMx = margin + 40;
  const rightMx = CANVAS_WIDTH - margin - 40;
  const my = CANVAS_HEIGHT * 0.38;

  [leftMx, rightMx].forEach(x => {
    nodes.push({
      type: 'Circle',
      props: { x, y: my, radius: 45, fill: 'rgba(212,168,71,0.1)' }
    });
    nodes.push({
      type: 'Circle',
      props: { x, y: my, radius: 30, stroke: goldColor, strokeWidth: 1.5, opacity: 0.6 }
    });
    nodes.push({
      type: 'Line',
      props: {
        points: [x, my - 20, x, my - 10],
        stroke: goldColor,
        strokeWidth: 3,
        lineCap: 'round',
      }
    });
    nodes.push({
      type: 'Circle',
      props: { x, y: my, radius: 8, fill: goldColor, shadowBlur: 10, shadowColor: goldColor }
    });
  });

  // --- Company Name (more prominent, centered) ---
  nodes.push({
    type: 'Text',
    props: {
      x: margin, y: margin + 28,
      width: CANVAS_WIDTH - margin * 2,
      text: brandKit.company_name.toUpperCase(),
      fontSize: 22,
      fontFamily: 'Inter, Arial, sans-serif',
      fontStyle: '900',
      fill: goldLight,
      align: 'center',
      letterSpacing: 6,
      opacity: 0.95,
    },
  });

  // --- MAIN CONTENT AREA ---

  if (discount) {
    // ═══════════════════════════════════════════
    // LAYOUT A: Discount is dominant (festive sale)
    // ═══════════════════════════════════════════

    // Festival/Event headline (above discount)
    nodes.push({
      type: 'Text',
      props: {
        x: margin + 20, y: CANVAS_HEIGHT * 0.28,
        width: CANVAS_WIDTH - (margin + 20) * 2,
        text: headlineRest.toUpperCase(),
        fontSize: Math.min(fontSize.headline, 52),
        fontFamily: 'Outfit, Georgia, serif',
        fontStyle: 'bold',
        fill: goldLight,
        align: 'center',
        lineHeight: 1.15,
        letterSpacing: 4,
        shadowColor: 'rgba(212,168,71,0.4)',
        shadowBlur: 20,
      },
    });

    // ── Giant Discount Percentage ──
    const discountFontSize = Math.min(fontSize.headline * 2.5, 160);

    // Discount glow (gold)
    nodes.push({
      type: 'Text',
      props: {
        x: margin + 20, y: CANVAS_HEIGHT * 0.38,
        width: CANVAS_WIDTH - (margin + 20) * 2,
        text: discount,
        fontSize: discountFontSize,
        fontFamily: 'Outfit, Arial, sans-serif',
        fontStyle: '900',
        fill: goldColor,
        align: 'center',
        opacity: 0.25,
        shadowColor: goldColor,
        shadowBlur: 60,
      },
    });

    // Discount main text
    nodes.push({
      type: 'Text',
      props: {
        x: margin + 20, y: CANVAS_HEIGHT * 0.38,
        width: CANVAS_WIDTH - (margin + 20) * 2,
        text: discount,
        fontSize: discountFontSize,
        fontFamily: 'Outfit, Arial, sans-serif',
        fontStyle: '900',
        fill: '#ffffff',
        align: 'center',
        letterSpacing: -2,
        shadowColor: 'rgba(0,0,0,0.8)',
        shadowBlur: 15,
        shadowOffset: { x: 0, y: 5 },
      },
    });

    // "OFF" label below
    nodes.push({
      type: 'Text',
      props: {
        x: margin + 20, y: CANVAS_HEIGHT * 0.38 + discountFontSize * 0.85,
        width: CANVAS_WIDTH - (margin + 20) * 2,
        text: 'OFF',
        fontSize: 44,
        fontFamily: 'Outfit, Arial, sans-serif',
        fontStyle: '900',
        fill: goldLight,
        align: 'center',
        letterSpacing: 20,
        opacity: 0.7,
      },
    });

    // Gold divider line
    nodes.push({
      type: 'Rect',
      props: {
        x: CANVAS_WIDTH * 0.3, y: CANVAS_HEIGHT * 0.66,
        width: CANVAS_WIDTH * 0.4, height: 2,
        fill: goldColor,
        opacity: 0.5,
        shadowBlur: 8,
        shadowColor: goldColor,
      },
    });

    // Subtext
    nodes.push({
      type: 'Text',
      props: {
        x: margin + 40, y: CANVAS_HEIGHT * 0.69,
        width: CANVAS_WIDTH - (margin + 40) * 2,
        text: subtext,
        fontSize: fontSize.subtext,
        fontFamily: 'Inter, Arial, sans-serif',
        fill: '#e4e4e7',
        align: 'center',
        lineHeight: 1.5,
        opacity: 0.9,
      },
    });

  } else {
    // ═══════════════════════════════════════════
    // LAYOUT B: No discount — headline is dominant
    // ═══════════════════════════════════════════

    // Glowing Headline
    nodes.push({
      type: 'Text',
      props: {
        x: margin + 20, y: CANVAS_HEIGHT * 0.35,
        width: CANVAS_WIDTH - (margin + 20) * 2,
        text: headline,
        fontSize: fontSize.headline + 6,
        fontFamily: 'Outfit, Georgia, serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        lineHeight: 1.15,
        shadowColor: 'rgba(0,0,0,0.8)',
        shadowBlur: 15,
        shadowOffset: { x: 0, y: 5 },
      },
    });

    // Divider Line
    nodes.push({
      type: 'Rect',
      props: {
        x: CANVAS_WIDTH * 0.3, y: CANVAS_HEIGHT * 0.58,
        width: CANVAS_WIDTH * 0.4, height: 1,
        fill: goldColor,
        opacity: 0.4,
      },
    });

    // Subtext
    nodes.push({
      type: 'Text',
      props: {
        x: margin + 40, y: CANVAS_HEIGHT * 0.63,
        width: CANVAS_WIDTH - (margin + 40) * 2,
        text: subtext,
        fontSize: fontSize.subtext,
        fontFamily: 'Inter, Arial, sans-serif',
        fill: '#e4e4e7',
        align: 'center',
        lineHeight: 1.6,
        opacity: 0.9,
      },
    });
  }

  // --- CTA Button (Bold Filled Gold Pill with Glow) ---
  const ctaWidth = Math.min(cta.length * (fontSize.cta * 0.6) + 160, CANVAS_WIDTH - 160);
  const ctaHeight = fontSize.cta + 44;
  const ctaX = (CANVAS_WIDTH - ctaWidth) / 2;
  const ctaY = CANVAS_HEIGHT * 0.78;

  // Glow
  nodes.push({
    type: 'Rect',
    props: {
      x: ctaX - 4, y: ctaY - 4,
      width: ctaWidth + 8, height: ctaHeight + 8,
      fill: goldColor,
      cornerRadius: ctaHeight / 2 + 4,
      opacity: 0.3,
      shadowBlur: 30,
      shadowColor: goldColor,
    },
  });

  // Button filled background
  nodes.push({
    type: 'Rect',
    props: {
      x: ctaX, y: ctaY,
      width: ctaWidth, height: ctaHeight,
      fill: goldColor,
      cornerRadius: ctaHeight / 2,
      shadowBlur: 20,
      shadowColor: 'rgba(212,168,71,0.4)',
    },
  });

  // CTA Text (dark on gold)
  nodes.push({
    type: 'Text',
    props: {
      x: ctaX, y: ctaY + ctaHeight / 2 - fontSize.cta / 2 - 2,
      width: ctaWidth,
      text: cta.toUpperCase(),
      fontSize: fontSize.cta + 2,
      fontFamily: 'Outfit, Arial, sans-serif',
      fontStyle: '900',
      fill: '#1a0f00',
      align: 'center',
      letterSpacing: 3,
    },
  });

  // --- Tagline ---
  if (brandKit.tagline) {
    nodes.push({
      type: 'Text',
      props: {
        x: margin, y: CANVAS_HEIGHT * 0.87,
        width: CANVAS_WIDTH - margin * 2,
        text: `"${brandKit.tagline}"`,
        fontSize: 24,
        fontFamily: 'Georgia, serif',
        fontStyle: 'italic',
        fill: goldColor,
        align: 'center',
        opacity: 0.8,
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
        type: 'Text',
        props: {
          x: margin, y: CANVAS_HEIGHT - margin - 25,
          width: CANVAS_WIDTH - margin * 2,
          text: contactParts.join('   ·   '),
          fontSize: 14,
          fontFamily: 'Inter, Arial, sans-serif',
          fill: 'rgba(255,255,255,0.4)',
          align: 'center',
        },
      });
    }
  }

  return nodes;
}
