import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { Sparkles, Palette, MessageSquare, LayoutTemplate, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-32 pb-20 overflow-hidden">
          {/* Gradient background effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="container mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-900/50 border border-surface-800 text-brand-300 text-sm font-medium mb-8 fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Introducing BrandForge AI 2.0</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 slide-up">
              AI-Powered <br className="hidden md:block" />
              <span className="gradient-text">Brand Poster Generator</span>
            </h1>
            
            <p className="text-xl text-surface-300 max-w-2xl mx-auto mb-10 slide-up" style={{ animationDelay: '100ms' }}>
              Create stunning, conversion-optimized marketing assets in seconds. Our AI understands and strictly preserves your unique brand identity across every design.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/signup" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
                Log In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-surface-900/30">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-16">
              Everything you need to scale your brand
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card p-8 rounded-2xl">
                <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 mb-6">
                  <Palette className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display">Global Brand Kit</h3>
                <p className="text-surface-400 leading-relaxed">
                  Define your colors, typography, logos, and voice once. The AI automatically applies them to every generative output.
                </p>
              </div>

              <div className="glass-card p-8 rounded-2xl">
                <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 mb-6">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display">AI Copywriter</h3>
                <p className="text-surface-400 leading-relaxed">
                  Generate compelling headlines and engaging subtext tailored to your campaign goals and target audience.
                </p>
              </div>

              <div className="glass-card p-8 rounded-2xl">
                <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 mb-6">
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-display">Smart Canvas</h3>
                <p className="text-surface-400 leading-relaxed">
                  Start with AI suggestions, then tweak every element perfectly using our deterministic, layer-based canvas editor.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-16">
              How it works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-6 left-[15%] right-[15%] h-0.5 bg-surface-800" />
              
              <div className="relative text-center">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-surface-100 font-bold text-xl flex items-center justify-center mx-auto mb-6 relative z-10 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Setup Brand Kit</h3>
                <p className="text-surface-400">Upload your logo and pick your brand colors.</p>
              </div>
              
              <div className="relative text-center">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-surface-100 font-bold text-xl flex items-center justify-center mx-auto mb-6 relative z-10 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Describe Campaign</h3>
                <p className="text-surface-400">Tell the AI what you're promoting or celebrating.</p>
              </div>
              
              <div className="relative text-center">
                <div className="w-12 h-12 rounded-full bg-brand-600 text-surface-100 font-bold text-xl flex items-center justify-center mx-auto mb-6 relative z-10 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Export & Share</h3>
                <p className="text-surface-400">Download high-res assets ready for social media.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-surface-800 py-8 text-center text-surface-500">
        <p>© {new Date().getFullYear()} BrandForge AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
