// ============================================
// BrandForge AI — Export Utilities
// ============================================
// PNG and PDF export from Konva stage

import Konva from 'konva';
import { jsPDF } from 'jspdf';

/**
 * Export the Konva stage as a high-quality PNG
 */
export async function exportPNG(stage: Konva.Stage, filename: string = 'poster.png'): Promise<void> {
  const dataUrl = stage.toDataURL({
    pixelRatio: 2, // 2x for high quality
    mimeType: 'image/png',
    quality: 1,
  });

  // Create download link
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export the Konva stage as a PDF
 */
export async function exportPDF(
  stage: Konva.Stage,
  filename: string = 'poster.pdf',
  canvasWidth: number = 1080,
  canvasHeight: number = 1350
): Promise<void> {
  const dataUrl = stage.toDataURL({
    pixelRatio: 2,
    mimeType: 'image/png',
    quality: 1,
  });

  // Scale to A4 width while preserving the actual aspect ratio
  const pdfWidth = 210; // A4 width in mm
  const pdfHeight = (canvasHeight / canvasWidth) * pdfWidth;

  const pdf = new jsPDF({
    orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
    unit: 'mm',
    format: [pdfWidth, pdfHeight],
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}

/**
 * Get data URL from stage for preview/saving
 */
export function getStageDataUrl(stage: Konva.Stage): string {
  return stage.toDataURL({
    pixelRatio: 1,
    mimeType: 'image/png',
    quality: 0.8,
  });
}

/**
 * Share the stage natively (mobile) or copy to clipboard (desktop)
 */
export async function shareStage(stage: Konva.Stage, title: string = 'My Poster'): Promise<void> {
  const dataUrl = stage.toDataURL({
    pixelRatio: 2,
    mimeType: 'image/png',
    quality: 1,
  });

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'poster.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text: 'Check out this poster I designed with BrandForge!',
        files: [file],
      });
    } else {
      // Fallback to clipboard
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([item]);
        throw new Error('COPIED');
      } else {
        throw new Error('Sharing not supported on this browser.');
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') return; // user cancelled share
    throw err;
  }
}

