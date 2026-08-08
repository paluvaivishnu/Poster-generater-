// ============================================
// BrandForge AI — Generate Page
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../lib/api';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';
import {
  TEMPLATES,
  TemplateId,
  DESIGN_STYLES,
  DesignStyle,
  ASPECT_RATIOS,
  AspectRatioId,
  getTemplateForTheme,
} from '../types/index';
import {
  Wand2,
  Sparkles,
  AlertTriangle,
  Layout,
  Check,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export default function GeneratePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>('modern');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioId>('4:5');
  const [hasBrandKit, setHasBrandKit] = useState<boolean | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [brandKit, setBrandKit] = useState<any>(null);

  const loadingMessages = [
    'Crafting your campaign copy...',
    'Building visual scene prompt...',
    'Generating AI background art...',
    'Applying your brand kit...',
    'Composing your poster...',
  ];

  useEffect(() => {
    const checkBrandKit = async () => {
      if (!user) return;
      try {
        const res = await fetchWithAuth('/api/brand-kits');
        if (res.ok) {
          const data = await res.json();
          setHasBrandKit(!!data);
          setBrandKit(data || null);
        } else {
          setHasBrandKit(false);
        }
      } catch {
        setHasBrandKit(false);
      }
    };
    checkBrandKit();
  }, [user]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (generating) {
      interval = setInterval(() => {
        setLoadingStep((prev) =>
          prev < loadingMessages.length - 1 ? prev + 1 : prev
        );
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [generating]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setLoadingStep(0);

    try {
      // 1. Generate Content (text + layoutVariant)
      const contentResponse = await fetchWithAuth('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      
      if (!contentResponse.ok) throw new Error('Failed to generate content');
      
      const result = await contentResponse.json();
      const generatedContent = result.content || result;
      const layoutVariant = generatedContent.layoutVariant || 'center';

      // 2. Generate Background — Gemini engineers the full image prompt
      const bgResponse = await fetchWithAuth('/api/generate-background', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          theme: generatedContent.theme || 'default',
          designStyle: selectedStyle,
          aspectRatio: selectedRatio,
          brandKit: brandKit || undefined,
        }),
      });

      let bgImageUrl: string | undefined;
      if (bgResponse.ok) {
        const bgData = await bgResponse.json();
        bgImageUrl = bgData.imageUrl;
      }

      toast.success('Poster generated! AI built a custom layout 🎨');

      navigate('/editor/new', {
        state: {
          generatedContent,
          templateId: 'dynamic-ai',
          prompt,
          source: result.source,
          bgImageUrl,
          designStyle: selectedStyle,
          aspectRatio: selectedRatio,
        },
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate poster. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const currentStyle = DESIGN_STYLES.find((s) => s.id === selectedStyle);
  const currentRatio = ASPECT_RATIOS.find((r) => r.id === selectedRatio);

  return (
    <div className="min-h-screen bg-surface-950 text-surface-50">
      <Navbar />

      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 fade-in">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-sm font-medium mb-4">
            <Sparkles size={16} />
            <span>AI-Powered Generation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Create Your{' '}
            <span className="gradient-text">Next Campaign</span>
          </h1>
          <p className="text-surface-400 text-lg">
            Describe what you want to promote, pick a style and ratio, and our AI crafts an industry-level poster.
          </p>
        </div>

        {/* No brand kit warning */}
        {hasBrandKit === false && (
          <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between slide-up">
            <div className="flex gap-3">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-amber-500 font-medium">No Brand Kit Found</h4>
                <p className="text-amber-500/80 text-sm mt-1">
                  Please set up your brand kit first so we can apply your colors and logo.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/brand-kit')}
              className="btn-secondary whitespace-nowrap bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 border-0"
            >
              Set Up Brand Kit
            </button>
          </div>
        )}

        <div className="space-y-10">
          {/* ── Step 1: Prompt ── */}
          <section className="space-y-4 slide-up" style={{ animationDelay: '0.05s' }}>
            <StepHeader number={1} title="What's your campaign about?" />
            <div className="relative pl-11">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Diwali 35% off Nike shoes for festive season..."
                className="input-field w-full min-h-[140px] p-4 text-lg resize-y placeholder:text-surface-600"
                maxLength={500}
              />
              <div className="absolute bottom-4 right-4 text-xs text-surface-500 font-mono bg-surface-900 px-2 py-1 rounded">
                {prompt.length} / 500
              </div>
            </div>
          </section>

          {/* ── Step 2: Design Style ── */}
          <section className="space-y-4 slide-up" style={{ animationDelay: '0.1s' }}>
            <StepHeader number={2} title="Select Design Style" />
            <div className="pl-11 space-y-2">
              {DESIGN_STYLES.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-left"
                    style={
                      isSelected
                        ? {
                            background: style.gradient,
                            borderColor: 'transparent',
                            boxShadow: '0 8px 30px rgba(124,58,237,0.3)',
                          }
                        : {
                            background: 'var(--color-surface-850)',
                            borderColor: 'var(--color-surface-800)',
                          }
                    }
                  >
                    <div>
                      <p className={`font-semibold text-base ${isSelected ? 'text-white' : 'text-surface-200'}`}>
                        {style.name}
                      </p>
                      <p className={`text-sm mt-0.5 ${isSelected ? 'text-white/80' : 'text-surface-400'}`}>
                        {style.description}
                      </p>
                    </div>
                    {isSelected ? (
                      <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 ml-4 shrink-0">
                        <CheckCircle2 size={14} className="text-white" />
                        <span className="text-white text-xs font-bold tracking-wide">SELECTED</span>
                      </div>
                    ) : (
                      <div className="text-surface-400 text-xs font-bold tracking-wider ml-4 shrink-0 hover:text-surface-200">
                        SELECT
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Step 3: Aspect Ratio ── */}
          <section className="space-y-4 slide-up" style={{ animationDelay: '0.15s' }}>
            <StepHeader number={3} title="Choose Aspect Ratio" />
            <div className="pl-11 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {ASPECT_RATIOS.map((ratio) => {
                const isSelected = selectedRatio === ratio.id;
                // Visual rectangle proportional to ratio
                const rw = ratio.width;
                const rh = ratio.height;
                const scale = 36 / Math.max(rw, rh);
                const boxW = Math.round(rw * scale);
                const boxH = Math.round(rh * scale);

                return (
                  <button
                    key={ratio.id}
                    onClick={() => setSelectedRatio(ratio.id)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-900/20'
                        : 'border-surface-800 bg-surface-900/50 hover:border-surface-600'
                    }`}
                  >
                    {/* Visual ratio shape */}
                    <div className="flex items-center justify-center h-10">
                      <div
                        className={`rounded-sm border-2 transition-colors ${
                          isSelected ? 'border-brand-400 bg-brand-500/20' : 'border-surface-600 bg-surface-800'
                        }`}
                        style={{ width: boxW, height: boxH }}
                      />
                    </div>
                    <div className="text-center">
                      <p className={`font-bold text-sm ${isSelected ? 'text-brand-400' : 'text-surface-200'}`}>
                        {ratio.label}
                      </p>
                      <p className="text-surface-500 text-[10px] leading-tight mt-0.5">{ratio.description}</p>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-brand-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Summary Bar ── */}
          {currentStyle && currentRatio && (
            <section className="pl-11 slide-up" style={{ animationDelay: '0.25s' }}>
              <div className="flex flex-wrap gap-3 p-4 rounded-2xl bg-surface-900 border border-surface-800">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-surface-500">Style:</span>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-white text-xs font-semibold"
                    style={{ background: currentStyle.gradient }}
                  >
                    {currentStyle.name}
                  </span>
                </div>
                <div className="w-px h-5 bg-surface-800 self-center" />
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-surface-500">Ratio:</span>
                  <span className="text-surface-200 font-semibold">{currentRatio.label}</span>
                  <span className="text-surface-500 text-xs">({currentRatio.description})</span>
                </div>
                <div className="w-px h-5 bg-surface-800 self-center" />
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-surface-500">Canvas:</span>
                  <span className="text-surface-200 font-mono text-xs">{currentRatio.width}×{currentRatio.height}px</span>
                </div>
              </div>
            </section>
          )}

          {/* ── Generate Button ── */}
          <section className="pt-2 pl-11 slide-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || hasBrandKit === false || generating}
              className={`btn-primary w-full md:w-auto px-12 py-4 text-lg font-medium flex items-center justify-center gap-3 transition-all ${
                generating
                  ? 'opacity-90 cursor-not-allowed'
                  : 'hover:scale-105 hover:shadow-2xl hover:shadow-brand-500/25'
              }`}
            >
              {generating ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>{loadingMessages[loadingStep]}</span>
                </>
              ) : (
                <>
                  <Wand2 size={22} />
                  <span>Generate Poster</span>
                  <ChevronRight size={18} className="opacity-50" />
                </>
              )}
            </button>
            {hasBrandKit === false && (
              <p className="text-amber-500/80 text-sm mt-3">
                Please set up your brand kit to enable generation.
              </p>
            )}
          </section>
        </div>
      </main>

      {/* Full-screen loading overlay */}
      {generating && (
        <div className="fixed inset-0 z-50 bg-surface-950/85 backdrop-blur-sm flex flex-col items-center justify-center fade-in">
          <div className="w-24 h-24 mb-8 relative">
            <div className="absolute inset-0 rounded-full border-4 border-surface-800" />
            <div
              className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: `transparent`, borderTopColor: currentStyle?.gradient.match(/#[0-9a-f]{6}/i)?.[0] ?? '#8b5cf6' }}
            />
            <Wand2 className="absolute inset-0 m-auto text-brand-400 animate-pulse" size={32} />
          </div>
          <h2 className="text-2xl font-display font-medium text-surface-100 mb-2">
            {loadingMessages[loadingStep]}
          </h2>
          <p className="text-surface-500 text-sm mb-6">
            {currentStyle?.name} · {currentRatio?.label} · {currentRatio?.width}×{currentRatio?.height}px
          </p>
          <div className="w-72 h-1.5 bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${((loadingStep + 1) / loadingMessages.length) * 100}%`,
                background: currentStyle?.gradient ?? 'var(--color-brand-500)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: step header component
function StepHeader({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
        {number}
      </div>
      <h2 className="text-2xl font-display font-semibold">{title}</h2>
    </div>
  );
}
