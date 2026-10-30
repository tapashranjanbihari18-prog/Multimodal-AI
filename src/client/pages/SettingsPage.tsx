import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import api from '../api.ts';
import { 
  User, 
  ShieldCheck, 
  Sliders, 
  Database, 
  Cpu, 
  CheckCircle2, 
  Server, 
  HardDrive,
  Lock,
  Layers
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    api.get('/health')
      .then((res) => setHealthStatus(res.data))
      .catch((err) => console.error('Health check failed:', err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 pb-20 pt-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Platform Settings & System Status</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review your tenant identity, multimodal model configurations, and storage specifications.
        </p>
      </div>

      <div className="space-y-6">
        {/* User Profile Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-cyan-400" />
            <span>Authenticated User Profile</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <span className="text-slate-400">Full Name</span>
              <p className="text-sm font-semibold text-white mt-1">{user?.full_name || 'Dr. Elena Rostova'}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <span className="text-slate-400">Email Address</span>
              <p className="text-sm font-semibold text-white mt-1">{user?.email || 'demo@omniverse.ai'}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <span className="text-slate-400">User ID (Tenant Scoped)</span>
              <p className="text-xs font-mono text-slate-300 mt-1 truncate">{user?.id || 'u-demo-1001'}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <span className="text-slate-400">Security Architecture</span>
              <p className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>JWT Bearer (Bcrypt 12 Rounds)</span>
              </p>
            </div>
          </div>
        </div>

        {/* AI Multimodal Model Architecture */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-400" />
            <span>Multimodal Reasoning Engine</span>
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">Primary LLM: gemini-3.8-flash</span>
                  <span className="rounded-full bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-[10px] text-emerald-300 font-medium">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Handles multi-page document OCR, image analysis, audio/video transcription, and cross-modal synthesis.
                </p>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-1 rounded">
                  @google/genai SDK
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400">Server Status</span>
                <p className="text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{healthStatus?.status?.toUpperCase() || 'ONLINE'}</span>
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400">Context Window</span>
                <p className="text-white font-semibold mt-1">1 Million Tokens</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <span className="text-slate-400">Supported Modalities</span>
                <p className="text-white font-semibold mt-1">PDF, Audio, Video, Image, Text</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Constraints & Ingestion Profiles */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-purple-400" />
            <span>Ingestion Constraints & Profiles</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <h4 className="font-semibold text-slate-200 mb-2">File Upload Constraints</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li>• Video & Audio Files: <strong className="text-white">Up to 50 MB</strong> (.mp4, .webm, .mp3, .wav)</li>
                <li>• Documents & Images: <strong className="text-white">Up to 15 MB</strong> (.pdf, .png, .jpg, .docx, .txt)</li>
                <li>• Validation: Whitelist MIME-type verification with Multer storage</li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <h4 className="font-semibold text-slate-200 mb-2">Pre-Configured AI Profiles</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li>• <strong className="text-cyan-300">Executive Summary:</strong> High-level synthesis & actions</li>
                <li>• <strong className="text-emerald-300">Deep Compliance:</strong> Regulatory audit & disclosures</li>
                <li>• <strong className="text-purple-300">Key Takeaways & Timestamps:</strong> Audio/video markers</li>
                <li>• <strong className="text-amber-300">Entity & Financial:</strong> Currency, tables & organizations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
