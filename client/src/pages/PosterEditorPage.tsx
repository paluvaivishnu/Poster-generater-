// ============================================
// BrandForge AI — Poster Editor Page
// ============================================
// Live editable poster preview with controls panel.
// Users can switch templates, edit text, adjust sizes,
// toggle contacts, and export PNG/PDF.

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../lib/api';
import toast from 'react-hot-toast';
import {
  Download,
  FileText,
  RefreshCw,
  RotateCcw,
  Save,
  Type,
  Image as ImageIcon,
  Contact,
  Palette,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  ArrowLeft,
  Eye,
  Wand2,
  Share2,
  Undo2,
  Redo2,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import PosterCanvas, { PosterCanvasRef } from '../components/poster/PosterCanvas';
import { exportPNG, exportPDF, shareStage } from '../utils/export';
import {
  BrandKit,
  GeneratedContent,
  PosterConfig,
  Poster,
  TEMPLATES,
  TemplateId,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  getCanvasDimensions,
  getTemplateForTheme,
  DESIGN_STYLES,
  DesignStyle,
} from '../types';

// ── Undo / Redo History ──────────────────────────────────────────
interface History {
  past: PosterConfig[];
  present: PosterConfig | null;
  future: PosterConfig[];
}

const MAX_HISTORY = 40;

// Default poster config
function createDefaultConfig(
  content: GeneratedContent,
  templateId: TemplateId,
  brandKit: BrandKit
): PosterConfig {
  return {
    headline: content.headline,
    subtext: content.subtext,
    cta: content.cta,
    theme: content.theme,
    tone: content.tone,
    templateId,
    fontSize: {
      headline: templateId === 'minimal-corporate' ? 58 : templateId === 'elegant-festive' ? 54 : 64,
      subtext: 26,
      cta: 24,
    },
    logoScale: 1,
    showContacts: true,
    brandKit,
  };
}

export default function PosterEditorPage() {
  const { posterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  const canvasRef = useRef<PosterCanvasRef>(null);

  // ── Undo / Redo history ──
  const [history, setHistory] = useState<History>({ past: [], present: null, future: [] });
  const config = history.present;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const [originalConfig, setOriginalConfig] = useState<PosterConfig | null>(null);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regeneratingBg, setRegeneratingBg] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [refinePrompt, setRefinePrompt] = useState('');
  const [refining, setRefining] = useState(false);
  const [currentPosterId, setCurrentPosterId] = useState<string | null>(posterId || null);

  // Collapsible sections
  const [sectionsOpen, setSectionsOpen] = useState({
    text: true,
    template: true,
    style: true,
    sizing: true,
    display: true,
  });

  // Calculate responsive scale (aspect-ratio-aware)
  const [canvasScale, setCanvasScale] = useState(0.45);
  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth;
      // Landscape (16:9) needs smaller scale to fit
      const isLandscape = config?.aspectRatio === '16:9';
      const isStory = config?.aspectRatio === '9:16';
      if (width < 768) {
        setCanvasScale(isLandscape ? 0.18 : 0.28);
      } else if (width < 1024) {
        setCanvasScale(isLandscape ? 0.25 : 0.35);
      } else if (width < 1440) {
        setCanvasScale(isLandscape ? 0.30 : isStory ? 0.36 : 0.42);
      } else {
        setCanvasScale(isLandscape ? 0.35 : isStory ? 0.42 : 0.5);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [config?.aspectRatio]);

  // Load brand kit and poster data
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);

      try {
        // Fetch brand kit
        const bkRes = await fetchWithAuth('/api/brand-kits');
        const bk = bkRes.ok ? await bkRes.json() : null;

        if (!bk) {
          toast.error('Please create a Brand Kit first');
          navigate('/brand-kit');
          return;
        }
        setBrandKit(bk);

        // Check if loading existing poster or new from generation
        if (posterId && posterId !== 'new') {
          // Load existing poster
          const pRes = await fetchWithAuth(`/api/posters/${posterId}`);
          const poster = pRes.ok ? await pRes.json() : null;

          if (!poster) {
            toast.error('Poster not found');
            navigate('/dashboard');
            return;
          }

          setPrompt(poster.prompt);
          const posterConfig = {
            ...poster.poster_config,
            brandKit: bk, // Always use current brand kit
          } as PosterConfig;
          initHistory(posterConfig);
          setOriginalConfig(posterConfig);
          setCurrentPosterId(poster.id);
        } else if (location.state?.generatedContent) {
          // New poster from generation flow
          const { generatedContent, templateId, prompt: genPrompt, bgImageUrl, designStyle, aspectRatio } = location.state as {
            generatedContent: GeneratedContent;
            templateId: TemplateId;
            prompt: string;
            bgImageUrl?: string;
            designStyle?: string;
            aspectRatio?: string;
          };
          setPrompt(genPrompt);
          const newConfig = createDefaultConfig(generatedContent, templateId, bk);
          if (bgImageUrl) newConfig.bgImageUrl = bgImageUrl;
          if (designStyle) newConfig.designStyle = designStyle as DesignStyle;
          if (aspectRatio) newConfig.aspectRatio = aspectRatio as any;
          initHistory(newConfig);
          setOriginalConfig(newConfig);
        } else {
          // Direct access with no state — create blank
          const defaultContent: GeneratedContent = {
            headline: 'Your Headline Here',
            subtext: 'Add your promotional message',
            cta: 'Learn More',
            theme: 'corporate',
            tone: 'professional',
          };
          const newConfig = createDefaultConfig(defaultContent, 'bold-offer', bk);
          initHistory(newConfig);
          setOriginalConfig(newConfig);
        }
      } catch (err) {
        console.error('Error loading editor data:', err);
        toast.error('Failed to load editor');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, posterId]);

  // ── History helpers ──────────────────────────────────────────
  /** Replace present config — push old value to past, clear future */
  const pushHistory = useCallback((next: PosterConfig) => {
    setHistory(prev => ({
      past: [...prev.past.slice(-MAX_HISTORY + 1), ...(prev.present ? [prev.present] : [])],
      present: next,
      future: [],
    }));
  }, []);

  /** Set initial config without polluting undo history */
  const initHistory = useCallback((initial: PosterConfig) => {
    setHistory({ past: [], present: initial, future: [] });
  }, []);

  // Update config field
  const updateConfig = useCallback((updates: Partial<PosterConfig>) => {
    setHistory(prev => {
      if (!prev.present) return prev;
      const next = { ...prev.present, ...updates };
      return {
        past: [...prev.past.slice(-MAX_HISTORY + 1), prev.present],
        present: next,
        future: [],
      };
    });
  }, []);

  const handleUndo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      return {
        past: prev.past.slice(0, -1),
        present: previous,
        future: prev.present ? [prev.present, ...prev.future] : prev.future,
      };
    });
    toast('Undone', { icon: '↩️', duration: 1000 });
  }, []);

  const handleRedo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
      const next = prev.future[0];
      return {
        past: prev.present ? [...prev.past, prev.present] : prev.past,
        present: next,
        future: prev.future.slice(1),
      };
    });
    toast('Redone', { icon: '↪️', duration: 1000 });
  }, []);

  // Keyboard shortcuts: Ctrl/Cmd+Z = undo, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y = redo
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleUndo, handleRedo]);

  const updateFontSize = useCallback((key: 'headline' | 'subtext' | 'cta', value: number) => {
    setHistory(prev => {
      if (!prev.present) return prev;
      const next = { ...prev.present, fontSize: { ...prev.present.fontSize, [key]: value } };
      return {
        past: [...prev.past.slice(-MAX_HISTORY + 1), prev.present],
        present: next,
        future: [],
      };
    });
  }, []);

  // Handle drag-to-reposition from canvas
  const handlePositionChange = useCallback(
    (role: 'headline' | 'subtext' | 'cta', pos: { x: number; y: number }) => {
      setHistory(prev => {
        if (!prev.present) return prev;
        const next = { ...prev.present, dragOffsets: { ...prev.present.dragOffsets, [role]: pos } };
        return {
          past: [...prev.past.slice(-MAX_HISTORY + 1), prev.present],
          present: next,
          future: [],
        };
      });
    },
    []
  );

  // Reset all dragged positions
  const handleResetPositions = useCallback(() => {
    setHistory(prev => {
      if (!prev.present) return prev;
      const next = { ...prev.present, dragOffsets: {} };
      return {
        past: [...prev.past.slice(-MAX_HISTORY + 1), prev.present],
        present: next,
        future: [],
      };
    });
    toast('Positions reset to template defaults', { icon: '↺' });
  }, []);
  const handleSave = async () => {
    if (!config || !user || !getToken()) return;
    setSaving(true);

    try {
      // Capture a thumbnail from the canvas
      let thumbnail: string | undefined;
      try {
        const stage = canvasRef.current?.getStage();
        if (stage) {
          const origScaleX = stage.scaleX();
          const origScaleY = stage.scaleY();
          stage.scaleX(1);
          stage.scaleY(1);
          thumbnail = stage.toDataURL({ pixelRatio: 0.25, mimeType: 'image/jpeg', quality: 0.7 });
          stage.scaleX(origScaleX);
          stage.scaleY(origScaleY);
        }
      } catch { /* thumbnail is optional */ }

      const posterData = {
        user_id: user.id,
        prompt,
        generated_content: {
          headline: config.headline,
          subtext: config.subtext,
          cta: config.cta,
          theme: config.theme,
          tone: config.tone,
        },
        template_id: config.templateId,
        poster_config: { ...config, thumbnail },
      };

      if (currentPosterId && currentPosterId !== 'new') {
        // Update existing
        const res = await fetchWithAuth(`/api/posters/${currentPosterId}`, {
          method: 'PUT',
          body: JSON.stringify(posterData)
        });

        if (!res.ok) throw new Error('Update failed');
        toast.success('Poster saved!');
      } else {
        // Create new
        const res = await fetchWithAuth('/api/posters', {
          method: 'POST',
          body: JSON.stringify(posterData)
        });

        if (!res.ok) throw new Error('Create failed');
        const data = await res.json();
        
        setCurrentPosterId(data.id);
        toast.success('Poster created!');
        // Update URL without full reload
        window.history.replaceState(null, '', `/editor/${data.id}`);
      }

      setOriginalConfig(config);
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save poster');
    } finally {
      setSaving(false);
    }
  };

  // Export handlers
  const handleExportPNG = async () => {
    const stage = canvasRef.current?.getStage();
    if (!stage) return;
    setExporting('png');
    try {
      // Temporarily set scale to 1 for full-res export
      const origScaleX = stage.scaleX();
      const origScaleY = stage.scaleY();
      const origWidth = stage.width();
      const origHeight = stage.height();
      stage.scaleX(1);
      stage.scaleY(1);
      const { width: exportW, height: exportH } = getCanvasDimensions(config?.aspectRatio ?? '4:5');
      stage.width(exportW);
      stage.height(exportH);
      await exportPNG(stage, `brandforge-poster-${Date.now()}.png`);
      stage.scaleX(origScaleX);
      stage.scaleY(origScaleY);
      stage.width(origWidth);
      stage.height(origHeight);
      toast.success('PNG downloaded!');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    const stage = canvasRef.current?.getStage();
    if (!stage) return;
    setExporting('pdf');
    try {
      const origScaleX = stage.scaleX();
      const origScaleY = stage.scaleY();
      const origWidth = stage.width();
      const origHeight = stage.height();
      stage.scaleX(1);
      stage.scaleY(1);
      const { width: cw, height: ch } = getCanvasDimensions(config?.aspectRatio ?? '4:5');
      stage.width(cw);
      stage.height(ch);
      // Pass actual canvas dimensions for correct PDF aspect ratio
      await exportPDF(stage, `brandforge-poster-${Date.now()}.pdf`, cw, ch);
      stage.scaleX(origScaleX);
      stage.scaleY(origScaleY);
      stage.width(origWidth);
      stage.height(origHeight);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setExporting(null);
    }
  };

  const handleShare = async () => {
    const stage = canvasRef.current?.getStage();
    if (!stage) return;
    setSharing(true);
    try {
      const origScaleX = stage.scaleX();
      const origScaleY = stage.scaleY();
      const origWidth = stage.width();
      const origHeight = stage.height();
      stage.scaleX(1);
      stage.scaleY(1);
      const { width: shareW, height: shareH } = getCanvasDimensions(config?.aspectRatio ?? '4:5');
      stage.width(shareW);
      stage.height(shareH);

      await shareStage(stage, config?.headline || 'BrandForge Poster');
      
      stage.scaleX(origScaleX);
      stage.scaleY(origScaleY);
      stage.width(origWidth);
      stage.height(origHeight);
      
      toast.success('Shared successfully!');
    } catch (err: any) {
      if (err.message === 'COPIED') {
        toast.success('Image copied to clipboard! Paste it into WhatsApp, Facebook, etc.');
      } else {
        toast.error(err.message || 'Share failed');
      }
    } finally {
      setSharing(false);
    }
  };

  // Regenerate AI background image
  const handleRegenerateBg = async () => {
    if (!prompt || !config) return;
    setRegeneratingBg(true);
    try {
      const res = await fetchWithAuth('/api/generate-background', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          theme: config.theme,
          designStyle: config.designStyle || 'modern',
          aspectRatio: config.aspectRatio || '4:5',
        }),
      });
      if (!res.ok) throw new Error('Background generation failed');
      const data = await res.json();
      updateConfig({ bgImageUrl: data.imageUrl });
      toast.success('New background generated! 🎨');
    } catch (err) {
      toast.error('Failed to generate background. Please try again.');
    } finally {
      setRegeneratingBg(false);
    }
  };

  // Remove background (revert to template background)
  const handleRemoveBg = () => {
    updateConfig({ bgImageUrl: undefined });
    toast('Using template background', { icon: '🎨' });
  };

  // Regenerate marketing copy
  const handleRegenerate = async () => {
    if (!prompt || !getToken()) return;
    setRegenerating(true);

    try {
      const res = await fetchWithAuth('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();

      // Auto-switch template if the theme changed
      const newTheme = data.theme || '';
      const currentTheme = config?.theme || '';
      const themeChanged = newTheme.toLowerCase() !== currentTheme.toLowerCase();
      const autoTemplate = themeChanged ? getTemplateForTheme(newTheme) : undefined;

      updateConfig({
        headline: data.headline,
        subtext: data.subtext,
        cta: data.cta,
        theme: data.theme,
        tone: data.tone,
        ...(autoTemplate ? { templateId: autoTemplate } : {}),
      });

      if (data.source === 'local') {
        toast('Using smart local copy generation', { icon: '💡' });
      } else {
        toast.success('Copy regenerated with AI!');
      }

      if (autoTemplate && themeChanged) {
        const tmplName = TEMPLATES.find((t) => t.id === autoTemplate)?.name || autoTemplate;
        toast(`Layout switched to "${tmplName}" for new theme`, { icon: '🎨' });
      }
    } catch (err) {
      toast.error('Failed to regenerate. Try again.');
    } finally {
      setRegenerating(false);
    }
  };

  // Handle AI Refinement
  const handleRefine = async () => {
    if (!refinePrompt.trim() || !config) return;
    setRefining(true);

    try {
      const res = await fetchWithAuth('/api/refine', {
        method: 'POST',
        body: JSON.stringify({
          instruction: refinePrompt,
          currentConfig: {
            headline: config.headline,
            subtext: config.subtext,
            cta: config.cta,
            theme: config.theme,
            tone: config.tone,
            layoutVariant: (config as any).layoutVariant
          },
          currentBgPrompt: prompt
        })
      });

      if (!res.ok) throw new Error('Failed to refine');

      const data = await res.json();
      
      let backgroundUpdated = false;
      let textUpdated = false;

      // 1. Update text if requested
      if ((data.action === 'update_text' || data.action === 'update_both') && data.updatedText) {
        updateConfig(data.updatedText);
        textUpdated = true;
      }

      // 2. Update background if requested
      if ((data.action === 'update_bg' || data.action === 'update_both') && data.newBgPrompt) {
        setPrompt(data.newBgPrompt); // Update the active prompt
        setRegeneratingBg(true);
        try {
          const bgRes = await fetchWithAuth('/api/generate-background', {
            method: 'POST',
            body: JSON.stringify({
              prompt: data.newBgPrompt,
              theme: data.updatedText?.theme || config.theme,
              designStyle: (config as any).designStyle || 'modern',
              aspectRatio: (config as any).aspectRatio || '4:5',
              layoutVariant: data.updatedText?.layoutVariant || (config as any).layoutVariant
            }),
          });
          if (bgRes.ok) {
            const bgData = await bgRes.json();
            updateConfig({ bgImageUrl: bgData.imageUrl } as any);
            backgroundUpdated = true;
          }
        } catch {
          toast.error('Failed to generate refined background.');
        } finally {
          setRegeneratingBg(false);
        }
      }

      if (backgroundUpdated && textUpdated) {
        toast.success('Poster fully refined! 🎨', { icon: '✨' });
      } else if (backgroundUpdated) {
        toast.success('Background updated!', { icon: '🖼️' });
      } else if (textUpdated) {
        toast.success('Text updated!', { icon: '📝' });
      }

      setRefinePrompt('');
    } catch (error) {
      toast.error('Refinement failed. Try again.');
    } finally {
      setRefining(false);
    }
  };

  // Reset to original
  const handleReset = () => {
    if (originalConfig) {
      initHistory(originalConfig);
      toast('Reset to original', { icon: '↩️' });
    }
  };

  // Toggle section
  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-surface-950">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            <p className="text-surface-400">Loading editor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />
      <div className="pt-16">
        {/* Top bar */}
        <div className="border-b border-surface-800 bg-surface-950/80 backdrop-blur-xl sticky top-16 z-40">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="btn-ghost !p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold font-[Outfit]">Poster Editor</h1>
              {config.theme && (
                <span className="badge badge-brand">{config.theme}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
                {/* Undo / Redo buttons */}
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                  className="btn-ghost !p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Y)"
                  className="btn-ghost !p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-surface-800" />
                <button
                  onClick={handleExportPNG}
                  disabled={!!exporting}
                  className="btn-secondary !py-2 !px-3 text-sm"
                >
                {exporting === 'png' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">PNG</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={!!exporting}
                className="btn-secondary !py-2 !px-3 text-sm"
              >
                {exporting === 'pdf' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={handleShare}
                disabled={sharing || !!exporting}
                className="btn-secondary !py-2 !px-3 text-sm"
              >
                {sharing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary !py-2 !px-4 text-sm"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Main content: Canvas + Controls */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Canvas preview with click-to-edit overlay */}
            <div className="flex-1 flex items-start justify-center">
              <div className="sticky top-36">
                {/* Drag-to-reposition instruction banner */}
                <div className="mb-3 flex items-center justify-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                    Hover over text → drag to reposition
                  </div>
                </div>

                {/* Poster canvas — drag directly on text elements */}
                <div className="relative">
                  <PosterCanvas
                    ref={canvasRef}
                    config={config}
                    scale={canvasScale}
                    onPositionChange={handlePositionChange}
                  />

                  {/* Transparent click zones overlaid on canvas */}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <p className="text-surface-500 text-xs flex items-center gap-2">
                    <Eye className="w-3 h-3" />
                    {(() => {
                      const { width, height } = getCanvasDimensions(config?.aspectRatio ?? '4:5');
                      return `${width} × ${height}px • ${config?.aspectRatio ?? '4:5'} • ${Math.round(canvasScale * 100)}%`;
                    })()}
                  </p>
                  {/* Reset dragged positions */}
                  {config.dragOffsets && Object.keys(config.dragOffsets).length > 0 && (
                    <button
                      onClick={handleResetPositions}
                      className="text-xs text-surface-400 hover:text-brand-400 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset positions
                    </button>
                  )}
                </div>

                {/* Quick Logo Position Controls */}
                {config.brandKit.logo_url && (
                  <div className="mt-4 p-3 rounded-xl bg-surface-900 border border-surface-800 text-xs">
                    <p className="text-surface-400 font-medium mb-3">🖼️ Logo Position</p>
                    <div className="space-y-2">
                      <div>
                        <label className="text-surface-500 block mb-1">Left / Right (X)</label>
                        <input
                          type="range"
                          min={0}
                          max={CANVAS_WIDTH - 200}
                          step={10}
                          value={config.logoX ?? (config.templateId === 'minimal-corporate' ? CANVAS_WIDTH - 210 : 70)}
                          onChange={(e) => updateConfig({ logoX: Number(e.target.value) })}
                          className="w-full accent-brand-500"
                        />
                      </div>
                      <div>
                        <label className="text-surface-500 block mb-1">Up / Down (Y)</label>
                        <input
                          type="range"
                          min={40}
                          max={CANVAS_HEIGHT * 0.35}
                          step={10}
                          value={config.logoY ?? 80}
                          onChange={(e) => updateConfig({ logoY: Number(e.target.value) })}
                          className="w-full accent-brand-500"
                        />
                      </div>
                      <button
                        onClick={() => updateConfig({ logoX: undefined, logoY: undefined })}
                        className="text-surface-500 hover:text-surface-300 text-xs transition-colors"
                      >
                        ↺ Reset to default position
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>



            {/* Controls panel */}
            <div className="w-full lg:w-[380px] space-y-3">

              {/* 🎨 AI Background Panel */}
              <div className="card border border-brand-500/30 bg-brand-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <span className="font-semibold text-sm text-brand-300">AI Background</span>
                  {config.bgImageUrl && (
                    <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">Active</span>
                  )}
                </div>
                <p className="text-xs text-surface-400 mb-3">
                  Generate a photorealistic background using AI, then your brand kit is overlaid on top.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleRegenerateBg}
                    disabled={regeneratingBg || !prompt}
                    className="btn-primary text-xs !py-2 !px-3 flex-1"
                  >
                    {regeneratingBg ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="w-3 h-3" /> {config.bgImageUrl ? 'New Background' : 'Generate Background'}</>
                    )}
                  </button>
                  {config.bgImageUrl && (
                    <button
                      onClick={handleRemoveBg}
                      className="btn-ghost text-xs !py-2 !px-3 text-surface-400 hover:text-surface-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {!prompt && (
                  <p className="text-xs text-amber-500/70 mt-2">Enter a prompt on the Generate page first.</p>
                )}
              </div>

              {/* Design Style selector */}
              <div className="card">
                <button
                  onClick={() => toggleSection('style')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-brand-400" />
                    <span className="font-semibold text-sm">Design Style</span>
                    <span className="text-xs text-surface-500 ml-1">
                      {DESIGN_STYLES.find((s) => s.id === (config?.designStyle || 'modern'))?.name || 'Modern'}
                    </span>
                  </div>
                  {sectionsOpen.style ? (
                    <ChevronUp className="w-4 h-4 text-surface-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-surface-500" />
                  )}
                </button>
                  {sectionsOpen.style && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-surface-500 mb-2">Controls the AI background mood & visual feel. Changing style will regenerate the background.</p>
                      {DESIGN_STYLES.map((style) => {
                        const isSelected = (config?.designStyle || 'modern') === style.id;
                      return (
                        <button
                          key={style.id}
                          onClick={async () => {
                            updateConfig({ designStyle: style.id as DesignStyle });
                            // Auto-regenerate background with new style
                            if (prompt && config) {
                              setRegeneratingBg(true);
                              try {
                                const res = await fetchWithAuth('/api/generate-background', {
                                  method: 'POST',
                                  body: JSON.stringify({
                                    prompt,
                                    theme: config.theme,
                                    designStyle: style.id,
                                    aspectRatio: config.aspectRatio || '4:5',
                                  }),
                                });
                                if (res.ok) {
                                  const data = await res.json();
                                  updateConfig({ bgImageUrl: data.imageUrl, designStyle: style.id as DesignStyle });
                                  toast.success(`Background updated to ${style.name} style! 🎨`);
                                }
                              } catch {
                                toast.error('Failed to regenerate background.');
                              } finally {
                                setRegeneratingBg(false);
                              }
                            }
                          }}
                          disabled={regeneratingBg}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left text-sm ${
                            isSelected
                              ? 'border-brand-500 bg-brand-500/10'
                              : 'border-surface-700 bg-surface-900 hover:border-surface-600'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm ${isSelected ? 'text-brand-300' : 'text-surface-200'}`}>{style.name}</p>
                            <p className="text-xs text-surface-500 truncate">{style.description}</p>
                            <span className="text-[10px] text-brand-400 font-mono block mt-0.5">Aa {style.fontBadge}</span>
                          </div>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-brand-400 shrink-0 ml-2" />
                          )}
                          {regeneratingBg && isSelected && (
                            <Loader2 className="w-3 h-3 animate-spin text-brand-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}

                    {/* Font Family controls */}
                    <div className="pt-3 mt-3 border-t border-surface-800 space-y-2">
                      <label className="text-xs text-surface-400 block font-medium">Headline Font Family</label>
                      <select
                        value={config.headlineFont || ''}
                        onChange={(e) => updateConfig({ headlineFont: e.target.value || undefined })}
                        className="input-field text-xs py-2"
                      >
                        <option value="">Auto (Default by Design Style)</option>
                        <option value="'Outfit', 'Plus Jakarta Sans', sans-serif">Outfit (Modern Punchy)</option>
                        <option value="'Playfair Display', 'Cinzel', Georgia, serif">Playfair Display (Luxury Serif)</option>
                        <option value="'Syne', 'Plus Jakarta Sans', sans-serif">Syne (Creative Avant-Garde)</option>
                        <option value="'Space Grotesk', 'DM Sans', sans-serif">Space Grotesk (Minimal Display)</option>
                        <option value="'Montserrat', 'Helvetica Neue', sans-serif">Montserrat (Corporate Bold)</option>
                        <option value="'Orbitron', 'Outfit', sans-serif">Orbitron (Futuristic Neon)</option>
                        <option value="'Cinzel', Georgia, serif">Cinzel (Classic Royal Serif)</option>
                        <option value="'Inter', sans-serif">Inter (Clean UI Sans)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Refine Chatbox */}
              <div className="card border-2 border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-transparent">
                <div className="flex items-center gap-2 mb-3">
                  <Wand2 className="w-4 h-4 text-brand-400" />
                  <span className="font-semibold text-sm text-brand-300">Refine with AI</span>
                </div>
                <p className="text-xs text-surface-400 mb-3">
                  Chat with the AI to change the background or update the text. (e.g. "add a kite", "make it shorter")
                </p>
                <div className="flex flex-col gap-2">
                  <textarea
                    value={refinePrompt}
                    onChange={(e) => setRefinePrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleRefine();
                      }
                    }}
                    placeholder="E.g., Add a kite in the sky..."
                    className="input-field text-sm p-3 min-h-[80px] resize-y bg-surface-950/50"
                  />
                  <button
                    onClick={handleRefine}
                    disabled={refining || !refinePrompt.trim()}
                    className="btn-primary w-full text-sm !py-2.5"
                  >
                    {refining ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Refining...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Apply Changes</>
                    )}
                  </button>
                </div>
              </div>
              {/* Text editing */}
              <div className="card">
                <button
                  onClick={() => toggleSection('text')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-brand-400" />
                    <span className="font-semibold text-sm">Text Content</span>
                  </div>
                  {sectionsOpen.text ? (
                    <ChevronUp className="w-4 h-4 text-surface-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-surface-500" />
                  )}
                </button>
                {sectionsOpen.text && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="label flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500" />
                        Headline
                      </label>
                      <textarea
                        id="edit-headline"
                        value={config.headline}
                        onChange={(e) => updateConfig({ headline: e.target.value })}
                        className="input-field resize-none focus:ring-2 focus:ring-brand-500/50 transition-shadow"
                        rows={2}
                        placeholder="Main headline of the poster..."
                      />
                    </div>
                    <div>
                      <label className="label flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500" />
                        Subtext / Description
                      </label>
                      <textarea
                        id="edit-subtext"
                        value={config.subtext}
                        onChange={(e) => updateConfig({ subtext: e.target.value })}
                        className="input-field resize-none focus:ring-2 focus:ring-brand-500/50 transition-shadow"
                        rows={3}
                        placeholder="Supporting details, offer info..."
                      />
                    </div>
                    <div>
                      <label className="label flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Call to Action Button
                      </label>
                      <input
                        id="edit-cta"
                        type="text"
                        value={config.cta}
                        onChange={(e) => updateConfig({ cta: e.target.value })}
                        className="input-field focus:ring-2 focus:ring-green-500/50 transition-shadow"
                        placeholder="e.g. Shop Now, Get 35% Off..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRegenerate}
                        disabled={regenerating || !prompt}
                        className="btn-secondary text-sm flex-1 !py-2"
                      >
                        {regenerating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        Regenerate
                      </button>
                      <button
                        onClick={handleReset}
                        className="btn-ghost text-sm !py-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sizing controls */}
              <div className="card">
                <button
                  onClick={() => toggleSection('sizing')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-brand-400" />
                    <span className="font-semibold text-sm">Sizing</span>
                  </div>
                  {sectionsOpen.sizing ? (
                    <ChevronUp className="w-4 h-4 text-surface-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-surface-500" />
                  )}
                </button>
                {sectionsOpen.sizing && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="label">Headline Size: {config.fontSize.headline}px</label>
                      <input
                        type="range"
                        min={28}
                        max={96}
                        value={config.fontSize.headline}
                        onChange={(e) => updateFontSize('headline', Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <div>
                      <label className="label">Subtext Size: {config.fontSize.subtext}px</label>
                      <input
                        type="range"
                        min={14}
                        max={40}
                        value={config.fontSize.subtext}
                        onChange={(e) => updateFontSize('subtext', Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <div>
                      <label className="label">CTA Size: {config.fontSize.cta}px</label>
                      <input
                        type="range"
                        min={14}
                        max={40}
                        value={config.fontSize.cta}
                        onChange={(e) => updateFontSize('cta', Number(e.target.value))}
                        className="w-full accent-brand-500"
                      />
                    </div>
                    <div>
                      <label className="label">Logo Size: {Math.round(config.logoScale * 100)}%</label>
                      <input
                        type="range"
                        min={0.3}
                        max={3}
                        step={0.1}
                        value={config.logoScale}
                        onChange={(e) => updateConfig({ logoScale: Number(e.target.value) })}
                        className="w-full accent-brand-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Display toggles */}
              <div className="card">
                <button
                  onClick={() => toggleSection('display')}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Contact className="w-4 h-4 text-brand-400" />
                    <span className="font-semibold text-sm">Display Options</span>
                  </div>
                  {sectionsOpen.display ? (
                    <ChevronUp className="w-4 h-4 text-surface-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-surface-500" />
                  )}
                </button>
                {sectionsOpen.display && (
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.showContacts}
                        onChange={(e) => updateConfig({ showContacts: e.target.checked })}
                        className="w-4 h-4 rounded accent-brand-500"
                      />
                      <span className="text-sm text-surface-300">Show contact details</span>
                    </label>
                    <div className="pt-2 border-t border-surface-800">
                      <p className="text-xs text-surface-500">
                        Brand colors are always applied from your Brand Kit.
                        <span className="text-brand-400 ml-1">
                          {config.brandKit.primary_color}
                        </span>
                        {' '}&{' '}
                        <span style={{ color: config.brandKit.secondary_color }}>
                          {config.brandKit.secondary_color}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
