import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { Project, Asset } from '../api.ts';
import { AssetUploader } from '../components/AssetUploader.tsx';
import { AssetViewerModal } from '../components/AssetViewerModal.tsx';
import { 
  ArrowLeft, 
  Sparkles, 
  Search, 
  FileText, 
  Headphones, 
  Video, 
  Image as ImageIcon, 
  FileCode, 
  Trash2, 
  Clock, 
  ExternalLink, 
  Loader2, 
  RefreshCw,
  FolderGit2,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const ProjectWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  const fetchProjectDetails = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error('Error fetching project:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  // Handle semantic search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/projects/${id}/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.results || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, id]);

  const handleDeleteAsset = async (assetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this asset from the repository?')) return;
    try {
      await api.delete(`/assets/${assetId}`);
      if (project) {
        setProject({
          ...project,
          assets: project.assets?.filter((a) => a.id !== assetId),
        });
      }
    } catch (err) {
      console.error('Failed to delete asset:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-lg font-bold text-white">Project Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">This workspace might have been deleted or moved.</p>
        <Link to="/dashboard" className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs text-white">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const assets = project.assets || [];

  const filteredAssets = assets.filter((asset) => {
    if (selectedType !== 'All' && asset.file_type !== selectedType.toLowerCase()) {
      return false;
    }
    return true;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-400" />;
      case 'audio': return <Headphones className="h-5 w-5 text-emerald-400" />;
      case 'video': return <Video className="h-5 w-5 text-purple-400" />;
      case 'image': return <ImageIcon className="h-5 w-5 text-amber-400" />;
      default: return <FileCode className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
        <Link to="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </Link>
        <span>/</span>
        <span className="text-cyan-400 font-medium truncate max-w-xs">{project.title}</span>
      </div>

      {/* Project Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 p-6 sm:p-8 backdrop-blur-md mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-md border border-indigo-700/60 bg-indigo-950/80 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
                {project.category || 'General'}
              </span>
              <span className="text-xs text-slate-400">
                Created {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {project.title}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {project.description || 'Multimodal intelligence workspace for document OCR, audio/video transcription, and synthesis.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <span>{showUploader ? 'Hide Uploader' : '+ Ingest Multi-Format Files'}</span>
            </button>

            <Link
              to={`/workspace/${project.id}/chat`}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xl shadow-indigo-500/20 hover:opacity-95 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch Multimodal Chat</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Uploader Section */}
      {showUploader && (
        <div className="mb-8">
          <AssetUploader
            projectId={project.id}
            onUploadSuccess={() => {
              fetchProjectDetails();
            }}
          />
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Media Type Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {['All', 'PDF', 'Audio', 'Video', 'Image', 'Text'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  selectedType === type
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Cross-Modal Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across documents, audio notes & videos..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-cyan-400" />
            )}
          </div>
        </div>

        {/* Semantic Search Results Preview */}
        {searchResults && (
          <div className="rounded-2xl border border-cyan-900/60 bg-cyan-950/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-cyan-300">
                Search matches for "{searchQuery}" ({searchResults.length})
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            </div>
            {searchResults.length === 0 ? (
              <p className="text-xs text-slate-400">No matching snippets or metadata found.</p>
            ) : (
              <div className="space-y-2">
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedAsset(item.asset)}
                    className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs hover:border-cyan-500/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getFileIcon(item.asset.file_type)}
                        <span className="font-semibold text-white">{item.asset.file_name}</span>
                        <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                          Score: {item.score}
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    {item.matches.map((m: string, mIdx: number) => (
                      <p key={mIdx} className="text-slate-300 text-[11px] line-clamp-1 italic mt-0.5">
                        {m}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Asset Repository Cards */}
      {assets.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-12 text-center">
          <FolderGit2 className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">Repository is empty</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Upload PDFs, audio calls, video telemetry, images, or notes to index them for cross-modal synthesis.
          </p>
          <button
            onClick={() => setShowUploader(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
          >
            Upload First Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 backdrop-blur-sm hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all cursor-pointer shadow-lg"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700/60">
                      {getFileIcon(asset.file_type)}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {asset.file_type}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <span>{(asset.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    </div>
                  </div>

                  {/* Processing Status badge */}
                  <div className="flex items-center gap-2">
                    {asset.processing_status === 'COMPLETED' && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 text-[10px] text-emerald-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        <span>Indexed</span>
                      </span>
                    )}
                    {asset.processing_status === 'PROCESSING' && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 text-[10px] text-amber-300">
                        <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
                        <span>Extracting</span>
                      </span>
                    )}
                    {asset.processing_status === 'FAILED' && (
                      <span className="flex items-center gap-1 rounded-full bg-rose-950/80 border border-rose-800/60 px-2 py-0.5 text-[10px] text-rose-300">
                        <AlertTriangle className="h-3 w-3 text-rose-400" />
                        <span>Failed</span>
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDeleteAsset(asset.id, e)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* File Title */}
                <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {asset.file_name}
                </h4>

                {/* Summary Snippet */}
                <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {asset.metadata?.summary || asset.extracted_text?.slice(0, 160) || 'Processing contents...'}
                </p>

                {/* Timestamps or Pages preview badge */}
                {asset.metadata?.timestamps && asset.metadata.timestamps.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-purple-400 bg-purple-950/40 border border-purple-800/40 px-2 py-1 rounded-md">
                    <Clock className="h-3 w-3" />
                    <span>{asset.metadata.timestamps.length} Timeline Markers</span>
                  </div>
                )}
                {asset.metadata?.pages && asset.metadata.pages.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-red-400 bg-red-950/40 border border-red-800/40 px-2 py-1 rounded-md">
                    <FileText className="h-3 w-3" />
                    <span>{asset.metadata.pages.length} Audited Pages</span>
                  </div>
                )}
              </div>

              {/* Topics Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap gap-1">
                {asset.metadata?.key_topics?.slice(0, 3).map((topic, tIdx) => (
                  <span
                    key={tIdx}
                    className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-400"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Asset Viewer Modal */}
      {selectedAsset && (
        <AssetViewerModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onAssetUpdated={() => {
            fetchProjectDetails();
          }}
        />
      )}
    </div>
  );
};
