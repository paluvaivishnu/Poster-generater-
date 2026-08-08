// ============================================
// BrandForge AI — Poster Template: Bold Offer
// ============================================
// Aggressive, modern layout for sales and offers.
// High contrast, deep gradients, dynamic angles.
// Discount % is visually dominant. Strong CTA.

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
      .replace(/^\s*[^\w]*\s*/, '') // trim leading punctuation
      .trim();
    return { discount: match[1], rest: rest || text };
  }
  return { discount: null, rest: text };
}

export function renderBoldOffer(config: PosterConfig) {
  const { brandKit, headline, subtext, cta, fontSize, showContacts } = config;
  const primary = brandKit.primary_color || '#7c3aed';
  const secondary = brandKit.secondary_color || '#6366f1';

  const nodes: any[] = [];
  const { discount, rest: headlineRest } = extractDiscount(headline);

  // --- Base Dark Background ---
  nodes.push({
    type: 'Rect',
    props: {
      x: 0, y: 0,
      width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
      fill: '#0a0a0f',
    },
  });

  // --- Dynamic Diagonal Gradient (top half) ---
  nodes.push({
    type: 'Line',
    props: {
      points: [
        0, 0,
        CANVAS_WIDTH, 0,
        CANVAS_WIDTH, CANVAS_HEIGHT * 0.55,
        0, CANVAS_HEIGHT * 0.35
      ],
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: CANVAS_WIDTH, y: CANVAS_HEIGHT * 0.55 },
      fillLinearGradientColorStops: [0, primary, 1, secondary],
      closed: true,
      shadowColor: 'rgba(0,0,0,0.5)',
      shadowBlur: 30,
      shadowOffset: { x: 0, y: 10 },
    },
  });

  // Accent angled stripe (divider)
  nodes.push({
    type: 'Line',
    props: {
      points: [
        0, CANVAS_HEIGHT * 0.35,
        CANVAS_WIDTH, CANVAS_HEIGHT * 0.55,
        CANVAS_WIDTH, CANVAS_HEIGHT * 0.58,
        0, CANVAS_HEIGHT * 0.38
      ],
      fill: '#ffffff',
      opacity: 0.12,
      closed: true,
    },
  });

  // Glowing orb (top right)
  nodes.push({
    type: 'Circle',
    props: {
      x: CANVAS_WIDTH * 0.85,
      y: CANVAS_HEIGHT * 0.12,
      radius: 200,
      fillRadialGradientStartPoint: { x: 0, y: 0 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: 0, y: 0 },
      fillRadialGradientEndRadius: 200,
      fillRadialGradientColorStops: [0, 'rgba(255,255,255,0.25)', 1, 'rgba(255,255,255,0)'],
    }
  });

  // Modern dot grid pattern
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      nodes.push({
        type: 'Circle',
        props: {
          x: CANVAS_WIDTH * 0.78 + j * 25,
          y: CANVAS_HEIGHT * 0.65 + i * 25,
          radius: 3,
          fill: primary,
          opacity: 0.4,
        }
      });
    }
  }

  // --- Company Name (larger, top-left) ---
  nodes.push({
    type: 'Text',
    props: {
      x: 70, y: 45,
      text: brandKit.company_name.toUpperCase(),
      fontSize: 28,
      fontFamily: 'Inter, Arial, sans-serif',
      fontStyle: '900',
      fill: '#ffffff',
      letterSpacing: 6,
      opacity: 0.95,
    },
  });

  // --- MAIN CONTENT AREA ---

  if (discount) {
    // ═══════════════════════════════════════════
    // LAYOUT A: Discount is dominant (split layout)
    // ═══════════════════════════════════════════

    // Headline text (festival/event name) — above the discount
    nodes.push({
      type: 'Text',
      props: {
        x: 70, y: CANVAS_HEIGHT * 0.16,
        width: CANVAS_WIDTH - 140,
        text: headlineRest.toUpperCase(),
        fontSize: Math.min(fontSize.headline, 56),
        fontFamily: 'Outfit, Arial, sans-serif',
        fontStyle: '900',
        fill: '#ffffff',
        lineHeight: 1.1,
        letterSpacing: 3,
      },
    });

    // ── Giant Discount Percentage ──
    const discountFontSize = Math.min(fontSize.headline * 2.8, 180);

    // Discount glow shadow
    nodes.push({
      type: 'Text',
      props: {
        x: 70, y: CANVAS_HEIGHT * 0.32,
        width: CANVAS_WIDTH - 140,
        text: discount,
        fontSize: discountFontSize,
        fontFamily: 'Outfit, Arial, sans-serif',
        fontStyle: '900',
        fill: primary,
        opacity: 0.3,
        shadowColor: primary,
        shadowBlur: 60,
      },
    });

    // Discount main text
    nodes.push({
      type: 'Text',
      props: {
        x: 70, y: CANVAS_HEIGHT * 0.32,
        width: CANVAS_WIDTH - 140,
        text: discount,
        fontSize: discountFontSize,
        fontFamily: 'Outfit, Arial, sans-serif',
        fontStyle: '900',
        fill: '#ffffff',
        letterSpacing: -4,
      },
    });

    // "OFF" label below the percentage
    nodes.push({
      type: 'Text',
      props: {
        x: 70, y: CANVAS_HEIGHT * 0.32 + discountFontSize * 0.85,
        width: CANVAS_WIDTH - 140,
        text: 'OFF',
        fontSize: 52,
        fontFamily: 'Outfit, Arial, sans-serif',
        fontStyle: '900',
        fill: '#ffffff',
        letterSpacing: 20,
        opacity: 0.7,
      },
    });

    // Decorative accent line between discount and subtext
    nodes.push({
      type: 'Rect',
      props: {
        x: 70, y: CANVAS_HEIGHT * 0.64,
        width: 120, height: 6,
        fill: primary,
        cornerRadius: 3,
        shadowColor: primary,
        shadowBlur: 15,
      },
    });

    // Subtext
    nodes.push({
      type: 'Text',
      props: {
        x: 70, y: CANVAS_HEIGHT * 0.67,
        width: CANVAS_WIDTH - 140,
        text: subtext,
        fontSize: fontSize.subtext,
        fontFamily: 'Inter, Arial, sans-serif',
        fill: '#a1a1aa',
        lineHeight: 1.5,
        fontStyle: '500',
      },
    });

  } else {
    // ═══════════════════════════════════════════
    // LAYOUT B: No discount — headline is dominant
    // ═══════════════════════════════════════════

    // Thick accent bar
    nodes.push({
      type: 'Rect',
      props: {
        x: 70, y: CANVAS_HEIGHT * 0.28,
        width: 120, height: 8,
        fill: primary,
        cornerRadius: 4,
        shadowColor: primary,
        shadowBlur: 15,
      },
    });

    // Large headline
    nodes.push({
      type: 'Text',
      props: {
        x: 70, y: CANVAS_HEIGHT * 0.31,
        width: CANVAS_WIDTH - 140,
        text: headline.toUpperCase(),
        fontSize: fontSize.headline + 8,
        fontFamily: 'Outfit, Arial, sans-serif',
        fontStyle: '900',
        fill: '#ffffff',
        lineHeight: 1.05,
        letterSpacing: 2,
      },
    });

    // Subtext
    nodes.push({
      type: 'Text',
      props: {
        x: 70, y: CANVAS_HEIGHT * 0.58,
        width: CANVAS_WIDTH - 140,
        text: subtext,
        fontSize: fontSize.subtext,
        fontFamily: 'Inter, Arial, sans-serif',
        fill: '#a1a1aa',
        lineHeight: 1.5,
        fontStyle: '500',
      },
    });
  }

  // --- CTA Button (Full-Width Gradient Pill with Glow) ---
  const ctaWidth = CANVAS_WIDTH - 140;
  const ctaHeight = fontSize.cta + 48;
  const ctaY = CANVAS_HEIGHT * 0.80;

  // CTA Glow
  nodes.push({
    type: 'Rect',
    props: {
      x: 70 - 4, y: ctaY - 4,
      width: ctaWidth + 8, height: ctaHeight + 8,
      fill: primary,
      cornerRadius: 24,
      opacity: 0.4,
      shadowColor: primary,
      shadowBlur: 40,
    },
  });

  // CTA Base
  nodes.push({
    type: 'Rect',
    props: {
      x: 70, y: ctaY,
      width: ctaWidth, height: ctaHeight,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: ctaWidth, y: 0 },
      fillLinearGradientColorStops: [0, primary, 1, secondary],
      cornerRadius: 20,
    },
  });

  // CTA Text
  nodes.push({
    type: 'Text',
    props: {
      x: 70, y: ctaY + ctaHeight / 2 - fontSize.cta / 2 - 2,
      width: ctaWidth,
      text: cta.toUpperCase(),
      fontSize: fontSize.cta + 4,
      fontFamily: 'Outfit, Arial, sans-serif',
      fontStyle: '900',
      fill: '#ffffff',
      align: 'center',
      letterSpacing: 4,
    },
  });

  // --- Tagline ---
  if (brandKit.tagline) {
    nodes.push({
      type: 'Text',
      props: {
        x: 40, y: CANVAS_HEIGHT * 0.90,
        width: CANVAS_WIDTH - 80,
        text: brandKit.tagline,
        fontSize: 22,
        fontFamily: 'Inter, Arial, sans-serif',
        fontStyle: 'italic',
        fill: '#71717a',
        align: 'center',
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
          x: 40, y: CANVAS_HEIGHT - 50,
          width: CANVAS_WIDTH - 80,
          text: contactParts.join('   //   '),
          fontSize: 16,
          fontFamily: 'Inter, Arial, sans-serif',
          fontStyle: 'bold',
          fill: '#52525b',
          align: 'center',
          letterSpacing: 2,
        },
      });
    }
  }

  return nodes;
}
