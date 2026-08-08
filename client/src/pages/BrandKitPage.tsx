// ============================================
// BrandForge AI — Brand Kit Page
// ============================================
// Users define their brand identity: company name, logo, colors,
// tagline, and contact details. Data is stored in Supabase.

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../lib/api';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';
import { BrandKit } from '../types/index';
import { UploadCloud, CheckCircle, AlertCircle, Image as ImageIcon, Save, Loader2 } from 'lucide-react';

interface FormState {
  company_name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  tagline: string;
  email: string;
  website: string;
  phone: string;
  social_handle: string;
}

const defaultForm: FormState = {
  company_name: '',
  logo_url: '',
  primary_color: '#7c3aed',
  secondary_color: '#6366f1',
  tagline: '',
  email: '',
  website: '',
  phone: '',
  social_handle: '',
};

export default function BrandKitPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState<FormState>(defaultForm);
  const [hasExistingKit, setHasExistingKit] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Fetch existing brand kit on mount
  useEffect(() => {
    const fetchBrandKit = async () => {
      if (!user) return;
      try {
        const res = await fetchWithAuth('/api/brand-kits');
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();

        if (data) {
          setFormData({
            company_name: data.company_name || '',
            logo_url: data.logo_url || '',
            primary_color: data.primary_color || '#7c3aed',
            secondary_color: data.secondary_color || '#6366f1',
            tagline: data.tagline || '',
            email: data.email || '',
            website: data.website || '',
            phone: data.phone || '',
            social_handle: data.social_handle || '',
          });
          setHasExistingKit(true);
        }
      } catch (error: any) {
        toast.error('Failed to load brand kit');
      } finally {
        setLoading(false);
      }
    };

    fetchBrandKit();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const processLogoFile = async (file: File) => {
    if (!user) return;

    if (!['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'].includes(file.type)) {
      toast.error('Only PNG, JPG, SVG, and WebP files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.');
      return;
    }

    setUploadingLogo(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetchWithAuth('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      setFormData(prev => ({ ...prev, logo_url: data.url }));
      toast.success('Logo uploaded successfully!');
    } catch (error: any) {
      toast.error('Error uploading logo: ' + error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processLogoFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processLogoFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.company_name.trim()) {
      toast.error('Company Name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData };

      const res = await fetchWithAuth('/api/brand-kits', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      toast.success(hasExistingKit ? 'Brand kit updated!' : 'Brand kit created!');
      if (!hasExistingKit) setHasExistingKit(true);
    } catch (error: any) {
      toast.error('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const isComplete = !!(formData.company_name && formData.logo_url && formData.primary_color);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950">
        <Navbar />
        <div className="pt-24 flex justify-center items-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            <p className="text-surface-400">Loading brand kit...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-24 fade-in">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-[Outfit] font-bold mb-2">
            Your <span className="gradient-text">Brand Kit</span>
          </h1>
          <p className="text-surface-400">
            Define your brand identity to generate perfectly on-brand posters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Form Column — 3/5 */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-6">
              {/* Company Name */}
              <div>
                <label className="label">Company Name *</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., BrandForge"
                  required
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="label">Logo</label>
                <div
                  className={`mt-2 border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative ${
                    dragOver
                      ? 'border-brand-500 bg-brand-500/5'
                      : 'border-surface-700 hover:border-surface-500 bg-surface-900/50'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                  />
                  {uploadingLogo ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                      <span className="text-sm text-surface-400">Uploading...</span>
                    </div>
                  ) : formData.logo_url ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={formData.logo_url}
                        alt="Logo preview"
                        className="w-20 h-20 object-contain rounded-lg"
                      />
                      <span className="text-sm text-surface-400">Click or drop to replace</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-surface-800 flex items-center justify-center text-brand-400">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-surface-500 mt-1">SVG, PNG, JPG, WebP (max 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Primary Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      name="primary_color"
                      value={formData.primary_color}
                      onChange={handleChange}
                      className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      name="primary_color"
                      value={formData.primary_color}
                      onChange={handleChange}
                      className="input-field flex-1 font-mono text-sm"
                      placeholder="#7c3aed"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Secondary Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      name="secondary_color"
                      value={formData.secondary_color}
                      onChange={handleChange}
                      className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      name="secondary_color"
                      value={formData.secondary_color}
                      onChange={handleChange}
                      className="input-field flex-1 font-mono text-sm"
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="label">Tagline / Slogan</label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Intelligence Amplified"
                />
              </div>

              {/* Contact Details */}
              <div className="space-y-4 pt-4 border-t border-surface-800">
                <h3 className="text-lg font-medium text-surface-200">Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="hello@brand.com"
                    />
                  </div>
                  <div>
                    <label className="label">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="https://brand.com"
                    />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div>
                    <label className="label">Social Handle</label>
                    <input
                      type="text"
                      name="social_handle"
                      value={formData.social_handle}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="@brandforge"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {saving ? 'Saving...' : hasExistingKit ? 'Update Brand Kit' : 'Save Brand Kit'}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Column — 2/5 */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 h-fit space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-surface-200">Live Preview</h3>
              <div className={`badge ${isComplete ? 'badge-success' : 'badge-warning'} flex items-center gap-1.5`}>
                {isComplete ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {isComplete ? 'Complete' : 'Incomplete'}
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden shadow-2xl shadow-brand-900/10 border border-surface-800/50">
              {/* Color banner */}
              <div
                className="h-32 w-full relative"
                style={{
                  background: `linear-gradient(135deg, ${formData.primary_color}, ${formData.secondary_color})`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                  }}
                />
              </div>

              <div className="px-6 pb-6 pt-0 relative">
                {/* Logo */}
                <div className="w-20 h-20 rounded-xl bg-surface-900 border-4 border-surface-850 shadow-xl -mt-10 mb-4 flex items-center justify-center overflow-hidden relative z-10">
                  {formData.logo_url ? (
                    <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <ImageIcon className="text-surface-600 w-8 h-8" />
                  )}
                </div>

                <div className="space-y-4">
                  {/* Name + Tagline */}
                  <div>
                    <h2 className="text-xl font-[Outfit] font-bold">
                      {formData.company_name || 'Your Company Name'}
                    </h2>
                    {formData.tagline && (
                      <p className="text-brand-300 text-sm mt-1 italic">"{formData.tagline}"</p>
                    )}
                  </div>

                  {/* Color swatches */}
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full shadow-inner border border-white/10"
                        style={{ backgroundColor: formData.primary_color }}
                      />
                      <span className="text-xs text-surface-400 font-mono">{formData.primary_color}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full shadow-inner border border-white/10"
                        style={{ backgroundColor: formData.secondary_color }}
                      />
                      <span className="text-xs text-surface-400 font-mono">{formData.secondary_color}</span>
                    </div>
                  </div>

                  {/* Contact info */}
                  {(formData.email || formData.website || formData.phone || formData.social_handle) && (
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-surface-300 pt-3 border-t border-surface-800/50">
                      {formData.email && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-brand-400">✉</span>
                          <span className="truncate">{formData.email}</span>
                        </div>
                      )}
                      {formData.website && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-brand-400">🌐</span>
                          <span className="truncate">{formData.website.replace(/^https?:\/\//, '')}</span>
                        </div>
                      )}
                      {formData.phone && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-brand-400">📞</span>
                          <span className="truncate">{formData.phone}</span>
                        </div>
                      )}
                      {formData.social_handle && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-brand-400">@</span>
                          <span className="truncate">{formData.social_handle}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
