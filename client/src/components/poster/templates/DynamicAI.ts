// ============================================
// BrandForge AI — Poster Template: Dynamic AI
// ============================================
// A fully fluid template that positions text dynamically based on the
// design style, giving each style a unique, distinctive layout and typography.

import { CANVAS_WIDTH, CANVAS_HEIGHT, PosterConfig, getCanvasDimensions, DESIGN_STYLES, DesignStyle } from '../../../types';

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

function getStyleFonts(config: PosterConfig, defaultStyle: DesignStyle) {
  const currentStyleId = config.designStyle || defaultStyle;
  const styleInfo = DESIGN_STYLES.find((s) => s.id === currentStyleId);
  const headlineFont = config.headlineFont || styleInfo?.headlineFont || "'Outfit', 'Plus Jakarta Sans', sans-serif";
  const bodyFont = config.bodyFont || styleInfo?.bodyFont || "'Inter', sans-serif";
  return { headlineFont, bodyFont };
}

// ─────────────────────────────────────────────────────────────────
// MODERN STYLE
// Centered layout, bold large headline, purple-to-pink gradient bar,
// clean sans-serif, slightly transparent subtext panel.
// ─────────────────────────────────────────────────────────────────
function renderModern(config: PosterConfig, CW: number, CH: number) {
  const { brandKit, headline, subtext, cta, fontSize, showContacts } = config;
  const { headlineFont, bodyFont } = getStyleFonts(config, 'modern');
  const primary = brandKit.primary_color || '#7c3aed';
  const nodes: any[] = [];

  // Full dark overlay for readability
  nodes.push({
    type: 'Rect',
    props: {
      x: 0, y: 0, width: CW, height: CH,
      fillLinearGradientStartPoint: { x: CW / 2, y: 0 },
      fillLinearGradientEndPoint: { x: CW / 2, y: CH },
      fillLinearGradientColorStops: [0, 'rgba(0,0,0,0.2)', 0.5, 'rgba(0,0,0,0.55)', 1, 'rgba(0,0,0,0.75)'],
    },
  });

  // Frosted glass card behind the text block
  const cardH = CH * 0.62;
  const cardY = (CH - cardH) / 2;
  nodes.push({
    type: 'Rect',
    props: {
      x: CW * 0.08, y: cardY,
      width: CW * 0.84, height: cardH,
      fill: 'rgba(10,5,25,0.45)',
      cornerRadius: 24,
      stroke: 'rgba(139,92,246,0.3)',
      strokeWidth: 1.5,
    },
  });

  let cy = cardY + CH * 0.07;

  // Company name — small, spaced, white
  nodes.push({
    type: 'Text',
    role: 'companyName',
    props: {
      x: CW * 0.08, y: cy, width: CW * 0.84,
      text: brandKit.company_name.toUpperCase(),
      fontSize: 20, fontFamily: bodyFont, fontStyle: '600',
      fill: 'rgba(255,255,255,0.7)', letterSpacing: 6, align: 'center',
    },
  });
  cy += 42;

  // Gradient accent bar
  nodes.push({
    type: 'Rect',
    props: {
      x: CW / 2 - 50, y: cy, width: 100, height: 4,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 100, y: 0 },
      fillLinearGradientColorStops: [0, '#7c3aed', 1, '#ec4899'],
      cornerRadius: 2,
    },
  });
  cy += 24;

  // Headline
  const { discount, rest: headlineRest } = extractDiscount(headline);
  if (discount) {
    nodes.push({
      type: 'Text', role: 'headline',
      props: {
        x: CW * 0.08, y: cy, width: CW * 0.84,
        text: headlineRest.toUpperCase(),
        fontSize: Math.min(fontSize.headline * 0.75, 52),
        fontFamily: headlineFont, fontStyle: '900',
        fill: '#ffffff', align: 'center', lineHeight: 1.1,
      },
    });
    cy += Math.min(fontSize.headline * 0.75, 52) * 1.2;
    const ds = Math.min(fontSize.headline * 2, 120);
    nodes.push({
      type: 'Text', role: 'discount',
      props: {
        x: CW * 0.08, y: cy, width: CW * 0.84,
        text: discount, fontSize: ds,
        fontFamily: headlineFont, fontStyle: '900',
        fill: primary, align: 'center',
        shadowColor: primary, shadowBlur: 40,
      },
    });
    cy += ds * 0.9;
  } else {
    nodes.push({
      type: 'Text', role: 'headline',
      props: {
        x: CW * 0.08, y: cy, width: CW * 0.84,
        text: headline.toUpperCase(),
        fontSize: fontSize.headline,
        fontFamily: headlineFont, fontStyle: '900',
        fill: '#ffffff', align: 'center', lineHeight: 1.1,
        shadowColor: 'rgba(139,92,246,0.6)', shadowBlur: 20,
      },
    });
    cy += fontSize.headline * 1.25;
  }

  cy += 16;
  // Subtext
  nodes.push({
    type: 'Text', role: 'subtext',
    props: {
      x: CW * 0.1, y: cy, width: CW * 0.8,
      text: subtext, fontSize: fontSize.subtext,
      fontFamily: bodyFont, fill: 'rgba(228,228,231,0.85)',
      align: 'center', lineHeight: 1.45,
    },
  });
  cy += fontSize.subtext * 3;

  // CTA pill
  const ctaW = Math.min(cta.length * (fontSize.cta * 0.62) + 100, CW * 0.7);
  const ctaH = fontSize.cta + 34;
  const ctaX = (CW - ctaW) / 2;
  nodes.push({
    type: 'Rect',
    props: {
      x: ctaX, y: cy, width: ctaW, height: ctaH,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: ctaW, y: 0 },
      fillLinearGradientColorStops: [0, '#7c3aed', 1, '#ec4899'],
      cornerRadius: ctaH / 2,
      shadowColor: '#7c3aed', shadowBlur: 24,
    },
  });
  nodes.push({
    type: 'Text', role: 'cta',
    props: {
      x: ctaX, y: cy + 17, width: ctaW,
      text: cta.toUpperCase(), fontSize: fontSize.cta,
      fontFamily: headlineFont, fontStyle: '900',
      fill: '#ffffff', align: 'center', letterSpacing: 2,
    },
  });

  if (showContacts) {
    const parts: string[] = [];
    if (brandKit.website) parts.push(brandKit.website.replace(/^https?:\/\//, ''));
    if (brandKit.social_handle) parts.push(brandKit.social_handle);
    if (parts.length) {
      nodes.push({
        type: 'Text',
        props: {
          x: 40, y: CH - 44, width: CW - 80,
          text: parts.join('   •   '), fontSize: 14,
          fontFamily: bodyFont, fontStyle: 'bold',
          fill: 'rgba(255,255,255,0.55)', align: 'center', letterSpacing: 2,
        },
      });
    }
  }
  return nodes;
}

// ─────────────────────────────────────────────────────────────────
// LUXURY STYLE
// High-end serif headline, gold rules and accents, elegant layout.
// ─────────────────────────────────────────────────────────────────
function renderLuxury(config: PosterConfig, CW: number, CH: number) {
  const { brandKit, headline, subtext, cta, fontSize, showContacts } = config;
  const { headlineFont, bodyFont } = getStyleFonts(config, 'luxury');
  const gold = brandKit.primary_color || '#d4af37';
  const nodes: any[] = [];

  // Deep dark vignette overlay
  nodes.push({
    type: 'Rect',
    props: {
      x: 0, y: 0, width: CW, height: CH,
      fillLinearGradientStartPoint: { x: 0, y: CH * 0.4 },
      fillLinearGradientEndPoint: { x: CW, y: 0 },
      fillLinearGradientColorStops: [0, 'rgba(5,2,0,0.85)', 0.6, 'rgba(5,2,0,0.5)', 1, 'rgba(5,2,0,0.15)'],
    },
  });

  // Gold top ornament bar
  nodes.push({
    type: 'Rect',
    props: { x: 70, y: 70, width: 60, height: 2, fill: gold, cornerRadius: 1 },
  });
  nodes.push({
    type: 'Rect',
    props: { x: 148, y: 70, width: 8, height: 2, fill: gold, cornerRadius: 1 },
  });

  // Company name top-left
  nodes.push({
    type: 'Text', role: 'companyName',
    props: {
      x: 70, y: 90, width: CW * 0.55,
      text: brandKit.company_name.toUpperCase(),
      fontSize: 18, fontFamily: bodyFont, fontStyle: '300',
      fill: gold, letterSpacing: 8, align: 'left',
    },
  });

  // Bottom-left text block starts from 58% down
  let cy = CH * 0.58;

  // Thin gold horizontal rule before headline
  nodes.push({
    type: 'Rect',
    props: { x: 70, y: cy, width: 100, height: 1.5, fill: gold, cornerRadius: 1 },
  });
  cy += 22;

  // Headline — large, elegant serif
  const { discount, rest: headlineRest } = extractDiscount(headline);
  nodes.push({
    type: 'Text', role: 'headline',
    props: {
      x: 70, y: cy, width: CW * 0.78,
      text: (discount ? headlineRest : headline).toUpperCase(),
      fontSize: fontSize.headline,
      fontFamily: headlineFont, fontStyle: '700',
      fill: '#ffffff', align: 'left', lineHeight: 1.1,
      letterSpacing: 1,
    },
  });
  cy += fontSize.headline * 1.3;

  if (discount) {
    nodes.push({
      type: 'Text', role: 'discount',
      props: {
        x: 70, y: cy, width: CW * 0.78,
        text: discount, fontSize: Math.min(fontSize.headline * 1.8, 100),
        fontFamily: headlineFont, fontStyle: '900',
        fill: gold, align: 'left', shadowColor: gold, shadowBlur: 30,
      },
    });
    cy += Math.min(fontSize.headline * 1.8, 100) * 0.9;
  }

  cy += 12;
  // Subtext
  nodes.push({
    type: 'Text', role: 'subtext',
    props: {
      x: 70, y: cy, width: CW * 0.72,
      text: subtext, fontSize: fontSize.subtext,
      fontFamily: bodyFont, fontStyle: '300',
      fill: 'rgba(255,255,255,0.75)', align: 'left', lineHeight: 1.5,
      letterSpacing: 0.5,
    },
  });
  cy += fontSize.subtext * 2.6;

  // CTA — outlined gold button
  const ctaW = Math.min(cta.length * (fontSize.cta * 0.6) + 80, CW * 0.6);
  const ctaH = fontSize.cta + 28;
  nodes.push({
    type: 'Rect',
    props: {
      x: 70, y: cy, width: ctaW, height: ctaH,
      fill: 'transparent', stroke: gold, strokeWidth: 1.5,
      cornerRadius: 4,
    },
  });
  nodes.push({
    type: 'Text', role: 'cta',
    props: {
      x: 70, y: cy + 14, width: ctaW,
      text: cta.toUpperCase(), fontSize: fontSize.cta,
      fontFamily: bodyFont, fontStyle: '600',
      fill: gold, align: 'center', letterSpacing: 3,
    },
  });

  if (showContacts) {
    const parts: string[] = [];
    if (brandKit.website) parts.push(brandKit.website.replace(/^https?:\/\//, ''));
    if (brandKit.social_handle) parts.push(brandKit.social_handle);
    if (parts.length) {
      nodes.push({
        type: 'Text',
        props: {
          x: 40, y: CH - 44, width: CW - 80,
          text: parts.join('   •   '), fontSize: 13,
          fontFamily: bodyFont, fontStyle: '300',
          fill: 'rgba(212,175,55,0.6)', align: 'center', letterSpacing: 2,
        },
      });
    }
  }
  return nodes;
}

// ─────────────────────────────────────────────────────────────────
// CREATIVE STYLE
// Expressive avant-garde typography (Syne), vivid colors, staggered layout.
// ─────────────────────────────────────────────────────────────────
function renderCreative(config: PosterConfig, CW: number, CH: number) {
  const { brandKit, headline, subtext, cta, fontSize, showContacts } = config;
  const { headlineFont, bodyFont } = getStyleFonts(config, 'creative');
  const primary = brandKit.primary_color || '#059669';
  const accent = '#f59e0b';
  const nodes: any[] = [];

  // Deep overlay left side
  nodes.push({
    type: 'Rect',
    props: {
      x: 0, y: 0, width: CW, height: CH,
      fillLinearGradientStartPoint: { x: CW * 0.6, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: CH },
      fillLinearGradientColorStops: [0, 'rgba(0,0,0,0.1)', 1, 'rgba(0,0,0,0.8)'],
    },
  });

  // Big vivid accent shape (circle) top-right corner
  nodes.push({
    type: 'Circle',
    props: {
      x: CW + 40, y: -40, radius: 260,
      fill: primary, opacity: 0.18,
    },
  });

  // Company badge top-left
  nodes.push({
    type: 'Rect',
    props: {
      x: 65, y: 68, width: 6, height: 36,
      fill: accent, cornerRadius: 3,
    },
  });
  nodes.push({
    type: 'Text', role: 'companyName',
    props: {
      x: 82, y: 72, width: CW * 0.6,
      text: brandKit.company_name.toUpperCase(),
      fontSize: 22, fontFamily: headlineFont, fontStyle: '800',
      fill: '#ffffff', letterSpacing: 3, align: 'left',
    },
  });

  // Main text block: right side starting mid-canvas
  const textX = CW * 0.07;
  let cy = CH * 0.38;

  // Tag line pill
  nodes.push({
    type: 'Rect',
    props: {
      x: textX, y: cy - 2, width: 110, height: 28,
      fill: accent, cornerRadius: 14,
    },
  });
  nodes.push({
    type: 'Text',
    props: {
      x: textX, y: cy + 5, width: 110,
      text: 'NEW DROP', fontSize: 13,
      fontFamily: bodyFont, fontStyle: '800',
      fill: '#000000', align: 'center', letterSpacing: 1,
    },
  });
  cy += 46;

  // Headline — expressive avant-garde font
  const { discount, rest: headlineRest } = extractDiscount(headline);
  nodes.push({
    type: 'Text', role: 'headline',
    props: {
      x: textX, y: cy, width: CW * 0.86,
      text: (discount ? headlineRest : headline).toUpperCase(),
      fontSize: Math.min(fontSize.headline * 1.05, 78),
      fontFamily: headlineFont, fontStyle: '800',
      fill: '#ffffff', align: 'left', lineHeight: 1.0,
      shadowColor: 'rgba(0,0,0,0.7)', shadowBlur: 10,
    },
  });
  cy += Math.min(fontSize.headline * 1.05, 78) * 1.1;

  if (discount) {
    nodes.push({
      type: 'Text', role: 'discount',
      props: {
        x: textX, y: cy, width: CW * 0.86,
        text: discount, fontSize: Math.min(fontSize.headline * 2.2, 130),
        fontFamily: headlineFont, fontStyle: '800',
        fill: primary, align: 'left',
        shadowColor: primary, shadowBlur: 35,
      },
    });
    cy += Math.min(fontSize.headline * 2.2, 130) * 0.85;
  }

  // Wavy accent line
  for (let i = 0; i < 3; i++) {
    nodes.push({
      type: 'Rect',
      props: {
        x: textX + i * 36, y: cy + i * 4,
        width: 28, height: 5,
        fill: i === 1 ? accent : primary,
        cornerRadius: 3,
      },
    });
  }
  cy += 26;

  nodes.push({
    type: 'Text', role: 'subtext',
    props: {
      x: textX, y: cy, width: CW * 0.75,
      text: subtext, fontSize: fontSize.subtext,
      fontFamily: bodyFont, fill: 'rgba(228,228,231,0.9)',
      align: 'left', lineHeight: 1.4,
    },
  });
  cy += fontSize.subtext * 2.8;

  // CTA — solid colored
  const ctaW = Math.min(cta.length * (fontSize.cta * 0.62) + 80, CW * 0.65);
  const ctaH = fontSize.cta + 30;
  nodes.push({
    type: 'Rect',
    props: {
      x: textX, y: cy, width: ctaW, height: ctaH,
      fill: primary, cornerRadius: 8,
      shadowColor: primary, shadowBlur: 22,
    },
  });
  nodes.push({
    type: 'Text', role: 'cta',
    props: {
      x: textX, y: cy + 15, width: ctaW,
      text: cta.toUpperCase(), fontSize: fontSize.cta,
      fontFamily: headlineFont, fontStyle: '800',
      fill: '#ffffff', align: 'center', letterSpacing: 2,
    },
  });

  if (showContacts) {
    const parts: string[] = [];
    if (brandKit.website) parts.push(brandKit.website.replace(/^https?:\/\//, ''));
    if (brandKit.social_handle) parts.push(brandKit.social_handle);
    if (parts.length) {
      nodes.push({
        type: 'Text',
        props: {
          x: 40, y: CH - 44, width: CW - 80,
          text: parts.join('   •   '), fontSize: 14,
          fontFamily: bodyFont, fontStyle: 'bold',
          fill: 'rgba(255,255,255,0.5)', align: 'center', letterSpacing: 2,
        },
      });
    }
  }
  return nodes;
}

// ─────────────────────────────────────────────────────────────────
// MINIMAL STYLE
// Architectural font pairing (Space Grotesk + DM Sans), clean white space.
// ─────────────────────────────────────────────────────────────────
function renderMinimal(config: PosterConfig, CW: number, CH: number) {
  const { brandKit, headline, subtext, cta, fontSize, showContacts } = config;
  const { headlineFont, bodyFont } = getStyleFonts(config, 'minimal');
  const primary = brandKit.primary_color || '#475569';
  const nodes: any[] = [];

  // Very light overlay — let the image breathe
  nodes.push({
    type: 'Rect',
    props: {
      x: 0, y: 0, width: CW, height: CH,
      fill: 'rgba(255,255,255,0.06)',
    },
  });

  // Bottom dark gradient panel
  const panelH = CH * 0.48;
  nodes.push({
    type: 'Rect',
    props: {
      x: 0, y: CH - panelH, width: CW, height: panelH,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: panelH },
      fillLinearGradientColorStops: [0, 'rgba(0,0,0,0)', 0.25, 'rgba(5,5,10,0.82)', 1, 'rgba(5,5,10,0.97)'],
    },
  });

  // Company name top-left — minimal, spaced
  nodes.push({
    type: 'Text', role: 'companyName',
    props: {
      x: 72, y: 74, width: CW * 0.7,
      text: brandKit.company_name,
      fontSize: 20, fontFamily: bodyFont, fontStyle: '400',
      fill: 'rgba(255,255,255,0.85)', letterSpacing: 5, align: 'left',
    },
  });

  let cy = CH - panelH + CH * 0.06;

  // Thin primary accent line
  nodes.push({
    type: 'Rect',
    props: { x: 72, y: cy, width: 48, height: 2, fill: primary, cornerRadius: 1 },
  });
  cy += 22;

  // Headline — clean Space Grotesk
  const { discount, rest: headlineRest } = extractDiscount(headline);
  nodes.push({
    type: 'Text', role: 'headline',
    props: {
      x: 72, y: cy, width: CW - 144,
      text: discount ? headlineRest : headline,
      fontSize: fontSize.headline,
      fontFamily: headlineFont, fontStyle: '600',
      fill: '#ffffff', align: 'left', lineHeight: 1.15,
    },
  });
  cy += fontSize.headline * 1.25;

  if (discount) {
    nodes.push({
      type: 'Text', role: 'discount',
      props: {
        x: 72, y: cy, width: CW - 144,
        text: discount, fontSize: Math.min(fontSize.headline * 1.5, 90),
        fontFamily: headlineFont, fontStyle: '700',
        fill: primary, align: 'left',
      },
    });
    cy += Math.min(fontSize.headline * 1.5, 90) * 0.9;
  }

  cy += 14;
  nodes.push({
    type: 'Text', role: 'subtext',
    props: {
      x: 72, y: cy, width: CW * 0.75,
      text: subtext, fontSize: fontSize.subtext,
      fontFamily: bodyFont, fontStyle: '400',
      fill: 'rgba(200,200,210,0.8)', align: 'left', lineHeight: 1.55,
    },
  });
  cy += fontSize.subtext * 2.8;

  // CTA — underline-style
  const ctaW = Math.min(cta.length * (fontSize.cta * 0.6) + 60, CW * 0.6);
  const ctaH = fontSize.cta + 20;
  nodes.push({
    type: 'Rect',
    props: {
      x: 72, y: cy, width: ctaW, height: ctaH,
      fill: 'transparent', stroke: 'rgba(255,255,255,0.7)', strokeWidth: 1,
      cornerRadius: 3,
    },
  });
  nodes.push({
    type: 'Text', role: 'cta',
    props: {
      x: 72, y: cy + 10, width: ctaW,
      text: cta, fontSize: fontSize.cta,
      fontFamily: bodyFont, fontStyle: '500',
      fill: '#ffffff', align: 'center', letterSpacing: 1,
    },
  });

  if (showContacts) {
    const parts: string[] = [];
    if (brandKit.website) parts.push(brandKit.website.replace(/^https?:\/\//, ''));
    if (brandKit.social_handle) parts.push(brandKit.social_handle);
    if (parts.length) {
      nodes.push({
        type: 'Text',
        props: {
          x: 40, y: CH - 40, width: CW - 80,
          text: parts.join('   •   '), fontSize: 13,
          fontFamily: bodyFont, fontStyle: '300',
          fill: 'rgba(255,255,255,0.4)', align: 'center', letterSpacing: 2,
        },
      });
    }
  }
  return nodes;
}

// ─────────────────────────────────────────────────────────────────
// CORPORATE STYLE
// Montserrat headline, structured corporate grid & blue accents.
// ─────────────────────────────────────────────────────────────────
function renderCorporate(config: PosterConfig, CW: number, CH: number) {
  const { brandKit, headline, subtext, cta, fontSize, showContacts } = config;
  const { headlineFont, bodyFont } = getStyleFonts(config, 'corporate');
  const blue = brandKit.primary_color || '#1d4ed8';
  const nodes: any[] = [];

  // Dark professional overlay
  nodes.push({
    type: 'Rect',
    props: {
      x: 0, y: 0, width: CW, height: CH,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: CH },
      fillLinearGradientColorStops: [0, 'rgba(0,10,30,0.75)', 0.5, 'rgba(0,10,30,0.55)', 1, 'rgba(0,10,30,0.8)'],
    },
  });

  // Top blue header band
  nodes.push({
    type: 'Rect',
    props: {
      x: 0, y: 0, width: CW, height: 90,
      fill: blue, opacity: 0.92,
    },
  });

  // Company name in header
  nodes.push({
    type: 'Text', role: 'companyName',
    props: {
      x: 64, y: 30, width: CW * 0.7,
      text: brandKit.company_name.toUpperCase(),
      fontSize: 26, fontFamily: headlineFont, fontStyle: '800',
      fill: '#ffffff', letterSpacing: 3, align: 'left',
    },
  });

  // Divider line under header
  nodes.push({
    type: 'Rect',
    props: { x: 0, y: 90, width: CW, height: 3, fill: 'rgba(255,255,255,0.15)' },
  });

  // Left vertical blue accent bar
  nodes.push({
    type: 'Rect',
    props: { x: 64, y: CH * 0.3, width: 5, height: CH * 0.5, fill: blue, cornerRadius: 3 },
  });

  let cy = CH * 0.3;

  // Headline — structured Montserrat
  const { discount, rest: headlineRest } = extractDiscount(headline);
  nodes.push({
    type: 'Text', role: 'headline',
    props: {
      x: 88, y: cy, width: CW - 152,
      text: (discount ? headlineRest : headline).toUpperCase(),
      fontSize: fontSize.headline,
      fontFamily: headlineFont, fontStyle: '800',
      fill: '#ffffff', align: 'left', lineHeight: 1.1,
      letterSpacing: 0.5,
    },
  });
  cy += fontSize.headline * 1.2;

  if (discount) {
    nodes.push({
      type: 'Text', role: 'discount',
      props: {
        x: 88, y: cy, width: CW - 152,
        text: discount, fontSize: Math.min(fontSize.headline * 1.6, 90),
        fontFamily: headlineFont, fontStyle: '900',
        fill: blue, align: 'left', shadowColor: blue, shadowBlur: 20,
      },
    });
    cy += Math.min(fontSize.headline * 1.6, 90) * 0.9;
  }

  cy += 20;
  // Subtext
  nodes.push({
    type: 'Text', role: 'subtext',
    props: {
      x: 88, y: cy, width: CW - 152,
      text: subtext, fontSize: fontSize.subtext,
      fontFamily: bodyFont, fontStyle: '400',
      fill: 'rgba(200,210,230,0.85)', align: 'left', lineHeight: 1.5,
    },
  });
  cy += fontSize.subtext * 2.8;

  // CTA — solid corporate blue rectangle
  const ctaW = Math.min(cta.length * (fontSize.cta * 0.6) + 80, CW * 0.65);
  const ctaH = fontSize.cta + 28;
  nodes.push({
    type: 'Rect',
    props: { x: 88, y: cy, width: ctaW, height: ctaH, fill: blue, cornerRadius: 6 },
  });
  nodes.push({
    type: 'Text', role: 'cta',
    props: {
      x: 88, y: cy + 14, width: ctaW,
      text: cta.toUpperCase(), fontSize: fontSize.cta,
      fontFamily: headlineFont, fontStyle: '700',
      fill: '#ffffff', align: 'center', letterSpacing: 2,
    },
  });

  if (showContacts) {
    // Footer band
    nodes.push({
      type: 'Rect',
      props: { x: 0, y: CH - 54, width: CW, height: 54, fill: 'rgba(0,10,30,0.85)' },
    });
    const parts: string[] = [];
    if (brandKit.website) parts.push(brandKit.website.replace(/^https?:\/\//, ''));
    if (brandKit.social_handle) parts.push(brandKit.social_handle);
    if (parts.length) {
      nodes.push({
        type: 'Text',
        props: {
          x: 40, y: CH - 38, width: CW - 80,
          text: parts.join('   |   '), fontSize: 14,
          fontFamily: bodyFont, fontStyle: '500',
          fill: 'rgba(180,200,230,0.7)', align: 'center', letterSpacing: 2,
        },
      });
    }
  }
  return nodes;
}

// ─────────────────────────────────────────────────────────────────
// PREMIUM STYLE
// Orbitron futuristic tech headline, dark neon glows.
// ─────────────────────────────────────────────────────────────────
function renderPremium(config: PosterConfig, CW: number, CH: number) {
  const { brandKit, headline, subtext, cta, fontSize, showContacts } = config;
  const { headlineFont, bodyFont } = getStyleFonts(config, 'premium');
  const neon = brandKit.primary_color || '#7c3aed';
  const neon2 = '#be185d';
  const nodes: any[] = [];

  // Very dark overlay
  nodes.push({
    type: 'Rect',
    props: {
      x: 0, y: 0, width: CW, height: CH,
      fill: 'rgba(5,0,15,0.7)',
    },
  });

  // Glowing circles — neon aura
  nodes.push({
    type: 'Circle',
    props: {
      x: CW / 2, y: CH * 0.42, radius: 320,
      fillRadialGradientStartPoint: { x: 0, y: 0 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: 0, y: 0 },
      fillRadialGradientEndRadius: 320,
      fillRadialGradientColorStops: [0, `${neon}40`, 1, 'rgba(0,0,0,0)'],
    },
  });

  // Top center company badge
  nodes.push({
    type: 'Rect',
    props: {
      x: CW / 2 - 90, y: 72, width: 180, height: 34,
      fill: 'rgba(255,255,255,0.06)',
      stroke: 'rgba(255,255,255,0.18)', strokeWidth: 1,
      cornerRadius: 17,
    },
  });
  nodes.push({
    type: 'Text', role: 'companyName',
    props: {
      x: CW / 2 - 90, y: 83, width: 180,
      text: brandKit.company_name.toUpperCase(),
      fontSize: 14, fontFamily: bodyFont, fontStyle: '600',
      fill: 'rgba(255,255,255,0.8)', letterSpacing: 4, align: 'center',
    },
  });

  let cy = CH * 0.28;

  // HEADLINE — futuristic Orbitron font
  const { discount, rest: headlineRest } = extractDiscount(headline);
  if (discount) {
    nodes.push({
      type: 'Text', role: 'headline',
      props: {
        x: CW * 0.06, y: cy, width: CW * 0.88,
        text: headlineRest.toUpperCase(),
        fontSize: Math.min(fontSize.headline * 0.8, 56),
        fontFamily: headlineFont, fontStyle: '800',
        fill: '#ffffff', align: 'center', lineHeight: 1.1,
        shadowColor: neon, shadowBlur: 28,
      },
    });
    cy += Math.min(fontSize.headline * 0.8, 56) * 1.15;

    const ds = Math.min(fontSize.headline * 2.2, 130);
    nodes.push({
      type: 'Text', role: 'discount',
      props: {
        x: CW * 0.06, y: cy, width: CW * 0.88,
        text: discount, fontSize: ds,
        fontFamily: headlineFont, fontStyle: '900',
        fill: neon, align: 'center',
        shadowColor: neon, shadowBlur: 50,
      },
    });
    cy += ds * 0.88;
  } else {
    nodes.push({
      type: 'Text', role: 'headline',
      props: {
        x: CW * 0.06, y: cy, width: CW * 0.88,
        text: headline.toUpperCase(),
        fontSize: fontSize.headline,
        fontFamily: headlineFont, fontStyle: '800',
        fill: '#ffffff', align: 'center', lineHeight: 1.0,
        shadowColor: neon, shadowBlur: 35,
      },
    });
    cy += fontSize.headline * 1.15;
  }

  cy += 14;
  // Neon horizontal line
  nodes.push({
    type: 'Rect',
    props: {
      x: CW / 2 - 60, y: cy, width: 120, height: 3,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 120, y: 0 },
      fillLinearGradientColorStops: [0, neon, 1, neon2],
      cornerRadius: 2, shadowColor: neon, shadowBlur: 14,
    },
  });
  cy += 22;

  // Subtext
  nodes.push({
    type: 'Text', role: 'subtext',
    props: {
      x: CW * 0.1, y: cy, width: CW * 0.8,
      text: subtext, fontSize: fontSize.subtext,
      fontFamily: bodyFont,
      fill: 'rgba(200,190,230,0.85)', align: 'center', lineHeight: 1.45,
    },
  });
  cy += fontSize.subtext * 3;

  // CTA — neon pill
  const ctaW = Math.min(cta.length * (fontSize.cta * 0.62) + 100, CW * 0.72);
  const ctaH = fontSize.cta + 36;
  const ctaX = (CW - ctaW) / 2;
  nodes.push({
    type: 'Rect',
    props: {
      x: ctaX, y: cy, width: ctaW, height: ctaH,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: ctaW, y: 0 },
      fillLinearGradientColorStops: [0, neon, 1, neon2],
      cornerRadius: ctaH / 2,
      shadowColor: neon, shadowBlur: 40,
      stroke: neon, strokeWidth: 1,
    },
  });
  nodes.push({
    type: 'Text', role: 'cta',
    props: {
      x: ctaX, y: cy + 18, width: ctaW,
      text: cta.toUpperCase(), fontSize: fontSize.cta,
      fontFamily: headlineFont, fontStyle: '800',
      fill: '#ffffff', align: 'center', letterSpacing: 3,
      shadowColor: '#ffffff', shadowBlur: 8,
    },
  });

  if (showContacts) {
    const parts: string[] = [];
    if (brandKit.website) parts.push(brandKit.website.replace(/^https?:\/\//, ''));
    if (brandKit.social_handle) parts.push(brandKit.social_handle);
    if (parts.length) {
      nodes.push({
        type: 'Text',
        props: {
          x: 40, y: CH - 44, width: CW - 80,
          text: parts.join('   •   '), fontSize: 14,
          fontFamily: bodyFont, fontStyle: '600',
          fill: `${neon}99`, align: 'center', letterSpacing: 2,
        },
      });
    }
  }
  return nodes;
}

// ─────────────────────────────────────────────────────────────────
// MAIN EXPORT
// Delegates to the appropriate style renderer
// ─────────────────────────────────────────────────────────────────
export function renderDynamicAI(config: PosterConfig) {
  const { width: CW, height: CH } = getCanvasDimensions((config as any).aspectRatio ?? '4:5');
  const designStyle: string = (config as any).designStyle || 'modern';

  switch (designStyle) {
    case 'luxury':
      return renderLuxury(config, CW, CH);
    case 'creative':
      return renderCreative(config, CW, CH);
    case 'minimal':
      return renderMinimal(config, CW, CH);
    case 'corporate':
      return renderCorporate(config, CW, CH);
    case 'premium':
      return renderPremium(config, CW, CH);
    case 'modern':
    default:
      return renderModern(config, CW, CH);
  }
}
