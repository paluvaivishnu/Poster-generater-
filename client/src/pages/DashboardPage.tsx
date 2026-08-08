import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { fetchWithAuth } from '../lib/api';
import { Plus, Edit2, Trash2, Clock, CheckCircle, AlertTriangle, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Poster {
  id: string;
  template_id: string;
  generated_content: { headline: string; [key: string]: any };
  poster_config?: { thumbnail?: string; designStyle?: string; aspectRatio?: string; [key: string]: any };
  created_at: string;
}

// ── Styled delete confirmation modal ──────────────────────────────
function DeleteConfirmModal({
  headline,
  onConfirm,
  onCancel,
}: {
  headline: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
      <div
        className="bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-100 text-base mb-1">Delete Poster?</h3>
            <p className="text-surface-400 text-sm leading-relaxed">
              <span className="text-surface-300 font-medium">"{headline}"</span> will be permanently deleted. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="btn-ghost text-sm !py-2 !px-4"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-secondary !py-2 !px-4 text-sm !bg-red-500/15 !text-red-400 hover:!bg-red-500/25 border-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Design style badge colours ─────────────────────────────────────
const STYLE_COLORS: Record<string, string> = {
  modern: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  luxury: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  creative: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  minimal: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
  corporate: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  premium: 'bg-pink-500/15 text-pink-700 dark:text-pink-300',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [posters, setPosters] = useState<Poster[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [brandComplete, setBrandComplete] = useState(false);
  const [posterToDelete, setPosterToDelete] = useState<Poster | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        // Fetch brand kit status
        const brandRes = await fetchWithAuth('/api/brand-kits');
        if (brandRes.ok) {
          const brandKit = await brandRes.json();
          if (brandKit) setBrandComplete(true);
        }

        // Fetch recent posters (limit 6 for display, but count all)
        const postersRes = await fetchWithAuth('/api/posters');
        if (postersRes.ok) {
          const allPosters = await postersRes.json();
          if (allPosters) {
            setTotalCount(allPosters.length);
            setPosters(allPosters.slice(0, 6)); // show 6 most recent
          }
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  const confirmDelete = (poster: Poster) => {
    setPosterToDelete(poster);
  };

  const handleDelete = async () => {
    if (!posterToDelete) return;
    setDeleting(true);
    try {
      const res = await fetchWithAuth(`/api/posters/${posterToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setPosters(prev => prev.filter(p => p.id !== posterToDelete.id));
      setTotalCount(prev => (prev !== null ? prev - 1 : null));
      toast.success('Poster deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete poster');
    } finally {
      setDeleting(false);
      setPosterToDelete(null);
    }
  };

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Creator';

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 flex flex-col">
      <Navbar />

      {/* Delete confirmation modal */}
      {posterToDelete && (
        <DeleteConfirmModal
          headline={posterToDelete.generated_content?.headline || 'Untitled Poster'}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setPosterToDelete(null)}
        />
      )}

      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Welcome back, {displayName}!</h1>
            <p className="text-surface-400">Here's what's happening with your brand assets.</p>
          </div>
          <Link to="/generate" className="btn-primary">
            <Plus className="w-5 h-5 mr-2 inline" />
            Create New Poster
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card p-6 border-l-4 border-brand-500">
            <h3 className="text-surface-400 font-medium mb-2">Brand Kit Status</h3>
            {brandComplete ? (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold text-lg">Complete</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold text-lg">Incomplete</span>
                </div>
                <Link to="/settings" className="text-sm text-brand-400 hover:underline">Complete setup &rarr;</Link>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-surface-400 font-medium mb-2">Total Posters</h3>
            <div className="text-3xl font-bold font-display">
              {isLoading ? '-' : (totalCount ?? 0)}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-surface-400 font-medium mb-2">Last Created</h3>
            <div className="text-lg font-medium text-surface-200">
              {posters.length > 0 ? (
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-surface-400" />
                  {new Date(posters[0].created_at).toLocaleDateString()}
                </span>
              ) : (
                'No activity yet'
              )}
            </div>
          </div>
        </div>

        {/* Recent Posters */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-display font-bold">Recent Posters</h2>
            {totalCount !== null && totalCount > 6 && (
              <Link to="/history" className="text-brand-400 hover:text-brand-300 text-sm font-medium">
                View all {totalCount} posters &rarr;
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-0 overflow-hidden border border-surface-800">
                  <div className="aspect-[4/3] bg-surface-800 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-surface-800 rounded animate-pulse w-2/3" />
                    <div className="h-3 bg-surface-800 rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : posters.length === 0 ? (
            <div className="text-center py-20 px-6 card border-dashed border-2 border-surface-700 bg-surface-900/20">
              <div className="w-16 h-16 bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-surface-500">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">No posters yet</h3>
              <p className="text-surface-400 max-w-md mx-auto mb-6">
                You haven't generated any brand posters. Start by creating a new AI-powered poster tailored to your brand.
              </p>
              <Link to="/generate" className="btn-primary inline-flex">
                <Plus className="w-5 h-5 mr-2 inline" />
                Create First Poster
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posters.map(poster => {
                const thumbnail = poster.poster_config?.thumbnail;
                const designStyle = poster.poster_config?.designStyle || 'modern';
                const styleColor = STYLE_COLORS[designStyle] || STYLE_COLORS.modern;
                const headline = poster.generated_content?.headline || 'Untitled Poster';

                return (
                  <div
                    key={poster.id}
                    className="card p-0 overflow-hidden group border border-surface-800 hover:border-brand-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/10"
                  >
                    {/* Thumbnail or placeholder */}
                    <div className="relative aspect-[4/5] bg-surface-800 overflow-hidden">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={headline}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 text-center bg-gradient-to-br from-surface-800 to-surface-900">
                          <Sparkles className="w-8 h-8 text-brand-500/50" />
                          <p className="text-base font-bold font-display leading-tight text-surface-300 line-clamp-3">
                            {headline}
                          </p>
                          <p className="text-xs text-surface-500">Save to generate thumbnail</p>
                        </div>
                      )}

                      {/* Hover overlay with actions */}
                      <div className="absolute inset-0 bg-surface-950/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                        <Link
                          to={`/editor/${poster.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl text-white text-sm font-medium transition-colors shadow-lg"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Link>
                        <button
                          onClick={() => confirmDelete(poster)}
                          className="p-2 bg-surface-800 hover:bg-red-600 rounded-xl text-surface-300 hover:text-white transition-colors shadow-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Card footer */}
                    <div className="p-4 bg-surface-900 border-t border-surface-800">
                      <h4 className="font-semibold text-sm truncate mb-2" title={headline}>
                        {headline}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-surface-500">
                        <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${styleColor}`}>
                          {designStyle}
                        </span>
                        <span>{new Date(poster.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
