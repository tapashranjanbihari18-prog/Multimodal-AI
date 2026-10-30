import React, { useState, useRef } from 'react';
import { Asset } from '../api.ts';
import api from '../api.ts';
import { 
  X, 
  FileText, 
  Headphones, 
  Video, 
  Image as ImageIcon, 
  FileCode, 
  Clock, 
  BookOpen, 
  Tags, 
  Building2, 
  Copy, 
  Check, 
  RefreshCw,
  ExternalLink,
  Play,
  Pause
} from 'lucide-react';

interface AssetViewerModalProps {
  asset: Asset | null;
  onClose: () => void;
  onAssetUpdated?: () => void;
}

export const AssetViewerModal: React.FC<AssetViewerModalProps> = ({ asset, onClose, onAssetUpdated }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'intelligence' | 'raw'>('intelligence');
  const [copied, setCopied] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string>('Executive Summary');
  const mediaRef = useRef<HTMLMediaElement | null>(null);

  if (!asset) return null;

  const handleCopyText = () => {
    navigator.clipboard.writeText(asset.extracted_text || asset.metadata?.summary || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTimestampJump = (timeStr: string) => {
    if (!mediaRef.current) return;
    // Parse time MM:SS or HH:MM:SS into seconds
    const parts = timeStr.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    mediaRef.current.currentTime = seconds;
    mediaRef.current.play();
    setActiveTab('preview');
  };

  const handleReprocess = async () => {
    setIsReprocessing(true);
    try {
      await api.post(`/assets/${asset.id}/reprocess`, {
        analysis_profile: selectedProfile,
      });
      if (onAssetUpdated) onAssetUpdated();
    } catch (err) {
      console.error('Reprocess failed:', err);
    } finally {
      setIsReprocessing(false);
    }
  };

  const getBadgeType = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-950/70 text-red-300 border-red-800/60';
      case 'audio': return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';
      case 'video': return 'bg-purple-950/70 text-purple-300 border-purple-800/60';
      case 'image': return 'bg-amber-950/70 text-amber-300 border-amber-800/60';
      default: return 'bg-blue-950/70 text-blue-300 border-blue-800/60';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase border ${getBadgeType(asset.file_type)}`}>
              {asset.file_type}
            </span>
            <div>
              <h2 className="text-base font-semibold text-white truncate max-w-md">{asset.file_name}</h2>
              <p className="text-xs text-slate-400">
                {(asset.file_size / (1024 * 1024)).toFixed(2)} MB • Status: <span className="text-cyan-400 font-medium">{asset.processing_status}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/30 text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('intelligence')}
              className={`py-3 px-3 border-b-2 font-medium transition-colors ${
                activeTab === 'intelligence'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              AI Extracted Intelligence
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-3 px-3 border-b-2 font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Media Preview
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`py-3 px-3 border-b-2 font-medium transition-colors ${
                activeTab === 'raw'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw Extracted Text & OCR
            </button>
          </div>

          {/* Reprocess controls */}
          <div className="hidden sm:flex items-center gap-2 py-1.5">
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-300"
            >
              <option value="Executive Summary">Executive Summary</option>
              <option value="Deep Compliance Audit">Deep Compliance Audit</option>
              <option value="Key Takeaways & Timestamps">Key Takeaways & Timestamps</option>
              <option value="Entity & Financial Extraction">Entity & Financial Extraction</option>
            </select>
            <button
              onClick={handleReprocess}
              disabled={isReprocessing}
              className="flex items-center gap-1 rounded bg-slate-800 border border-slate-700 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isReprocessing ? 'animate-spin' : ''}`} />
              <span>Re-analyze</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'intelligence' && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>Multimodal Executive Summary</span>
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {asset.metadata?.summary || 'AI synthesis pending or in progress...'}
                </p>
              </div>

              {/* Topics & Entities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Key Topics */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Tags className="h-4 w-4 text-indigo-400" />
                    <span>Identified Topics & Themes</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {asset.metadata?.key_topics && asset.metadata.key_topics.length > 0 ? (
                      asset.metadata.key_topics.map((topic, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-1 text-xs text-indigo-300"
                        >
                          {topic}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No topics extracted yet</span>
                    )}
                  </div>
                </div>

                {/* Key Entities */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-emerald-400" />
                    <span>Key Entities & Organizations</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {asset.metadata?.entities && asset.metadata.entities.length > 0 ? (
                      asset.metadata.entities.map((entity, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 text-xs text-emerald-300"
                        >
                          {entity}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No entities extracted yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamps (Audio / Video) */}
              {asset.metadata?.timestamps && asset.metadata.timestamps.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>Chronological Timestamps & Cues (Click to Jump)</span>
                  </h4>
                  <div className="space-y-2">
                    {asset.metadata.timestamps.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleTimestampJump(item.time)}
                        className="flex items-start gap-3 rounded-lg border border-slate-800/80 bg-slate-900/50 p-2.5 text-xs hover:border-purple-500/50 hover:bg-slate-900 cursor-pointer transition-all"
                      >
                        <span className="font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60 shrink-0">
                          {item.time}
                        </span>
                        <span className="text-slate-300">{item.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Page Sections (PDF) */}
              {asset.metadata?.pages && asset.metadata.pages.length > 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>Document Page Index</span>
                  </h4>
                  <div className="space-y-2">
                    {asset.metadata.pages.map((p, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-800/80 bg-slate-900/50 p-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/60">
                            Page {p.page}
                          </span>
                          <span className="font-medium text-slate-200">{p.heading || 'Section'}</span>
                        </div>
                        <p className="text-slate-400 italic">"{p.snippet}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="flex flex-col items-center justify-center p-4 bg-slate-950/70 rounded-xl border border-slate-800">
              {asset.file_type === 'image' && (
                <div className="max-h-[500px] overflow-hidden rounded-lg">
                  <img
                    src={asset.file_url}
                    alt={asset.file_name}
                    className="max-h-[500px] object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <p className="text-xs text-slate-400 mt-2 text-center">{asset.file_name}</p>
                </div>
              )}

              {asset.file_type === 'audio' && (
                <div className="w-full max-w-lg p-6 space-y-4 text-center">
                  <div className="h-20 w-20 mx-auto rounded-full bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shadow-lg">
                    <Headphones className="h-10 w-10 animate-pulse" />
                  </div>
                  <h4 className="text-base font-semibold text-white">{asset.file_name}</h4>
                  <audio
                    ref={(el) => {
                      mediaRef.current = el;
                    }}
                    controls
                    className="w-full mt-4"
                    src={asset.file_url}
                  >
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}

              {asset.file_type === 'video' && (
                <div className="w-full max-w-2xl space-y-3">
                  <video
                    ref={(el) => {
                      mediaRef.current = el;
                    }}
                    controls
                    className="w-full rounded-lg border border-slate-800 bg-black aspect-video"
                    src={asset.file_url}
                  >
                    Your browser does not support video playback.
                  </video>
                  <p className="text-xs text-slate-400 text-center">{asset.file_name}</p>
                </div>
              )}

              {asset.file_type === 'pdf' && (
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-300">Document Reader View</span>
                    <a
                      href={asset.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Open in Browser Tab</span>
                    </a>
                  </div>
                  <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-800 max-h-[400px] overflow-y-auto whitespace-pre-wrap font-mono text-xs text-slate-300 leading-relaxed">
                    {asset.extracted_text || 'No extracted text available for this document.'}
                  </div>
                </div>
              )}

              {asset.file_type === 'text' && (
                <div className="w-full p-4 bg-slate-900 rounded-lg border border-slate-800 max-h-[450px] overflow-y-auto whitespace-pre-wrap font-mono text-xs text-slate-300 leading-relaxed">
                  {asset.extracted_text}
                </div>
              )}
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Extracted Transcript & OCR Output ({asset.extracted_text?.length || 0} characters)</span>
                <span className="text-cyan-400">Indexed for Vector & Semantic RAG</span>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[450px] overflow-y-auto">
                {asset.extracted_text || 'No raw extracted content available.'}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
