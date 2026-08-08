import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { Search, Edit2, Copy, Download, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PosterHistory {
  id: string;
  template_id: string;
  prompt_excerpt: string;
  generated_content: { headline: string; [key: string]: any };
  theme: string;
  image_url: string | null;
  created_at: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posters, setPosters] = useState<PosterHistory[]>([]);
  const [filtered, setFiltered] = useState<PosterHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        const res = await fetchWithAuth('/api/posters');
        if (!res.ok) throw new Error('Failed to fetch posters');
        
        const data = await res.json();
        
        const processed = (data || []).map((p: any) => ({
          ...p,
          prompt_excerpt: p.ai_prompt?.substring(0, 50) || 'AI generated via BrandForge',
          theme: p.theme || 'Default Brand'
        }));
        
        setPosters(processed);
        setFiltered(processed);
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load history');
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, [user]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(posters);
      return;
    }
    const q = search.toLowerCase();
    const matches = posters.filter(p => 
      p.template_id.toLowerCase().includes(q) || 
      (p.generated_content?.headline || '').toLowerCase().includes(q)
    );
    setFiltered(matches);
  }, [search, posters]);

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this poster?')) return;
    try {
      const res = await fetchWithAuth(`/api/posters/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setPosters(prev => prev.filter(p => p.id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleDuplicate = async (poster: PosterHistory) => {
    if (!user) return;
    const loadingToast = toast.loading('Duplicating...');
    try {
      const { id, created_at, ...rest } = poster as any; // Ignore strict typing to strip id
      const res = await fetchWithAuth('/api/posters', {
        method: 'POST',
        body: JSON.stringify(rest)
      });
      
      if (!res.ok) throw new Error('Failed to duplicate');
      const data = await res.json();
      
      const newPoster = {
        ...data,
        prompt_excerpt: data.ai_prompt?.substring(0, 50) || 'AI generated via BrandForge',
        theme: data.theme || 'Default Brand'
      };
      
      setPosters([newPoster, ...posters]);
      toast.success('Duplicated successfully', { id: loadingToast });
    } catch (err) {
      console.error(err);
      toast.error('Failed to duplicate', { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Poster History</h1>
          <p className="text-surface-400">All your generated brand assets in one place.</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            <input
              type="text"
              placeholder="Search by headline or template..."
              className="input-field w-full pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card p-0 skeleton h-80 rounded-xl overflow-hidden border border-surface-800"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 px-6 card bg-surface-900/30">
            <ImageIcon className="w-12 h-12 text-surface-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No results found</h3>
            <p className="text-surface-400 mb-6">
              {search ? "No posters matched your search query." : "You haven't generated any posters yet."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(poster => (
              <div key={poster.id} className="card p-0 overflow-hidden flex flex-col border border-surface-800 hover:border-surface-600 transition-colors">
                {/* Preview Thumbnail */}
                <div 
                  className="aspect-square bg-surface-900 border-b border-surface-800 relative flex items-center justify-center p-4 cursor-pointer group"
                  onClick={() => navigate(`/editor/${poster.id}`)}
                >
                  {poster.image_url ? (
                    <img src={poster.image_url} alt="Poster preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-surface-400 px-4">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="font-display font-bold text-lg text-surface-100 opacity-90 truncate leading-tight">
                        {poster.generated_content?.headline || 'Untitled'}
                      </p>
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-surface-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-brand-600 text-surface-100 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2">
                      <Edit2 className="w-4 h-4" /> Open Editor
                    </span>
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="p-4 flex-1 flex flex-col bg-surface-950">
                  <div className="flex-1 mb-4">
                    <h4 className="font-bold mb-1 truncate" title={poster.generated_content?.headline}>
                      {poster.generated_content?.headline || 'Untitled'}
                    </h4>
                    <p className="text-xs text-surface-400 line-clamp-2 mb-2" title={poster.prompt_excerpt}>
                      "{poster.prompt_excerpt}"
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="badge text-xs bg-surface-800 px-2 py-0.5 rounded text-surface-300">
                        {poster.template_id}
                      </span>
                      <span className="badge text-xs bg-surface-800 px-2 py-0.5 rounded text-surface-300">
                        {poster.theme}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-surface-800">
                    <span className="text-xs text-surface-500">
                      {new Date(poster.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      {poster.image_url && (
                        <a 
                          href={poster.image_url} 
                          download 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1.5 text-surface-400 hover:text-surface-100 hover:bg-surface-800 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button 
                        onClick={() => handleDuplicate(poster)}
                        className="p-1.5 text-surface-400 hover:text-surface-100 hover:bg-surface-800 rounded transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(poster.id)}
                        className="p-1.5 text-surface-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
