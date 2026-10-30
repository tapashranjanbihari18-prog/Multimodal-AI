import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  BrainCircuit, 
  Sparkles, 
  FileText, 
  Headphones, 
  Video, 
  Image as ImageIcon, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  CheckCircle2,
  Database,
  Sliders,
  Cpu
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemoStart = async () => {
    try {
      await loginDemo();
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login failed:', err);
      navigate('/login');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-indigo-900/20 via-cyan-900/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-40 right-10 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-800/80 bg-cyan-950/40 px-3.5 py-1 text-xs text-cyan-300 backdrop-blur-md mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Multimodal Knowledge & Insight Architecture</span>
          <span className="rounded-full bg-cyan-900 px-1.5 py-0.2 text-[10px] text-white">v2.6</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Unify All Modalities in a Single{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
            Reasoning Engine
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Break through the fragmentation of modern information. Ingest PDFs, audio interview recordings, video telemetry, OCR slides, and raw text into cross-modal synthesis workspaces with verifiable citations.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <button
                onClick={handleDemoStart}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Launch Interactive Demo Workspace</span>
              </button>
              <Link
                to="/register"
                className="rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-3.5 text-sm font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
              >
                Create Free Account
              </Link>
            </>
          )}
        </div>

        {/* Modality Icons Bar */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2">
            <FileText className="h-4 w-4 text-red-400" />
            <span>PDFs & Scanned Invoices</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2">
            <Headphones className="h-4 w-4 text-emerald-400" />
            <span>Audio Recordings (MP3/WAV)</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2">
            <Video className="h-4 w-4 text-purple-400" />
            <span>Video Feeds (MP4/WebM)</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2">
            <ImageIcon className="h-4 w-4 text-amber-400" />
            <span>High-Res Slides & OCR Charts</span>
          </div>
        </div>
      </section>

      {/* Feature Architecture Matrix */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Engineered for Complex Enterprise Synthesis</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Built on Gemini 3.8 multimodal models with structured JSON schemas and strict citation grounding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 mb-4">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Cross-Modal Semantic Search</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Query naturally across heterogeneous formats. Retrieve relevant sound bites from an audio interview alongside matching tables from an audited 10-Q filing.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-950/80 border border-indigo-800/80 text-indigo-400 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Zero-Hallucination Citations</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Every synthesized claim links back to verifiable evidence: exact audio timestamps (e.g., [04:20]) or specific document page numbers (e.g., Page 7).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950/80 border border-purple-800/80 text-purple-400 mb-4">
              <Sliders className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Configurable Analysis Profiles</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Tailor extraction to your objective: Executive Summary, Deep Compliance Audit, Chronological Timestamps, or Financial Entity Extraction.
            </p>
          </div>
        </div>
      </section>

      {/* Target Domains */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">
          Accelerating High-Stakes Knowledge Domains
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/30">
            <h4 className="font-semibold text-white text-sm mb-1 text-emerald-400">Finance & Compliance</h4>
            <p className="text-xs text-slate-400">Invoice reconciliation, earnings call cross-referencing, and GAAP disclosures.</p>
          </div>
          <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/30">
            <h4 className="font-semibold text-white text-sm mb-1 text-cyan-400">Legal & Discovery</h4>
            <p className="text-xs text-slate-400">Video deposition review, contract clause analysis, and trial exhibits matching.</p>
          </div>
          <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/30">
            <h4 className="font-semibold text-white text-sm mb-1 text-purple-400">Robotics & Engineering</h4>
            <p className="text-xs text-slate-400">Flight test telemetry review, LiDAR inspection, and sensor fusion debugging.</p>
          </div>
          <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/30">
            <h4 className="font-semibold text-white text-sm mb-1 text-amber-400">Education & Research</h4>
            <p className="text-xs text-slate-400">Lecture transcription, textbook diagram extraction, and multi-source literature review.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
