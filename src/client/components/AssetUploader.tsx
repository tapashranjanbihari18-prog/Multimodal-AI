import React, { useState, useRef } from 'react';
import api from '../api.ts';
import { 
  UploadCloud, 
  File, 
  FileText, 
  Headphones, 
  Video, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  SlidersHorizontal,
  Loader2
} from 'lucide-react';

interface AssetUploaderProps {
  projectId: string;
  onUploadSuccess: () => void;
}

export const AssetUploader: React.FC<AssetUploaderProps> = ({ projectId, onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analysisProfile, setAnalysisProfile] = useState<string>('Executive Summary');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profiles = [
    { id: 'Executive Summary', label: 'Executive Summary', desc: 'High-level synthesis, key findings, and action items' },
    { id: 'Deep Compliance Audit', label: 'Deep Compliance Audit', desc: 'Regulatory checks, liability disclosures, and financial figures' },
    { id: 'Key Takeaways & Timestamps', label: 'Key Takeaways & Timestamps', desc: 'Audio/video timeline indexing and chronological cues' },
    { id: 'Entity & Financial Extraction', label: 'Entity & Financial Extraction', desc: 'Names, metrics, currency tables, and organization mapping' },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const validFiles: File[] = [];

    for (const file of files) {
      if (file.size > 52428800) {
        setErrorMessage(`File "${file.name}" exceeds the 50MB maximum limit.`);
        return;
      }
      validFiles.push(file);
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('analysis_profile', analysisProfile);

    try {
      const res = await api.post(`/projects/${projectId}/assets`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage(res.data.message || 'Assets uploaded and queued for multimodal AI extraction!');
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadSuccess();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMessage(err.response?.data?.error || err.message || 'Failed to upload assets.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="h-4 w-4 text-red-400" />;
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '')) return <Headphones className="h-4 w-4 text-emerald-400" />;
    if (['mp4', 'webm', 'mov'].includes(ext || '')) return <Video className="h-4 w-4 text-purple-400" />;
    if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext || '')) return <ImageIcon className="h-4 w-4 text-amber-400" />;
    return <File className="h-4 w-4 text-blue-400" />;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-cyan-400" />
            <span>Multimodal Ingestion Pipeline</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingest PDFs, audio recordings (MP3/WAV), video clips (MP4), images, or raw text.
          </p>
        </div>

        {/* Profile Selector */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <select
            value={analysisProfile}
            onChange={(e) => setAnalysisProfile(e.target.value)}
            disabled={isUploading}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                Profile: {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20'
            : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          accept=".pdf,.png,.jpg,.jpeg,.webp,.mp3,.wav,.ogg,.mp4,.webm,.txt,.docx"
          className="hidden"
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 text-cyan-400 mb-3 shadow-inner">
          <UploadCloud className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-slate-200">
          Click to upload or drag & drop files here
        </p>
        <p className="text-xs text-slate-400 mt-1">
          PDF, PNG, JPG, MP3, WAV, MP4, TXT, DOCX (Up to 50MB per file)
        </p>
      </div>

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Selected Files ({selectedFiles.length})</span>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-slate-400 hover:text-rose-400 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  {getFileIcon(file.name)}
                  <span className="text-slate-200 truncate">{file.name}</span>
                  <span className="text-[10px] text-slate-400">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Extracting Multimodal Intelligence...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  <span>Start Multimodal Processing</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Feedback alerts */}
      {successMessage && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-950/70 border border-emerald-800/80 px-3 py-2 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-950/70 border border-rose-800/80 px-3 py-2 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
