import React, { useState } from 'react';
import { Message, Asset } from '../api.ts';
import { X, Download, FileText, Check, Copy } from 'lucide-react';

interface ExportModalProps {
  projectTitle: string;
  messages: Message[];
  assets: Asset[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ projectTitle, messages, assets, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [includeCitations, setIncludeCitations] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);

  const generateMarkdownReport = () => {
    let md = `# OMNIVERSE AI - MULTIMODAL SYNTHESIS REPORT\n`;
    md += `**Project:** ${projectTitle}\n`;
    md += `**Date:** ${new Date().toLocaleString()}\n`;
    md += `**Total Indexed Assets:** ${assets.length}\n\n`;

    if (includeMetadata) {
      md += `## 1. Indexed Multimodal Assets\n\n`;
      assets.forEach((a, i) => {
        md += `### ${i + 1}. ${a.file_name} (${a.file_type.toUpperCase()})\n`;
        md += `- **Summary:** ${a.metadata?.summary || 'N/A'}\n`;
        if (a.metadata?.key_topics?.length) {
          md += `- **Topics:** ${a.metadata.key_topics.join(', ')}\n`;
        }
        md += `\n`;
      });
      md += `---\n\n`;
    }

    md += `## 2. Multimodal Synthesis & Interactive Inquiries\n\n`;
    messages.forEach((m, idx) => {
      const senderLabel = m.sender === 'user' ? 'USER INQUIRY' : 'OMNIVERSE AI SYNTHESIS';
      md += `### [${idx + 1}] ${senderLabel}\n\n`;
      md += `${m.content}\n\n`;

      if (includeCitations && m.citations && m.citations.length > 0) {
        md += `**Verified Source Citations:**\n`;
        m.citations.forEach((c) => {
          md += `- **${c.file_name}** (${c.file_type.toUpperCase()}) ${c.timestamp_or_page ? `— *${c.timestamp_or_page}*` : ''}\n`;
          if (c.snippet) md += `  > "${c.snippet}"\n`;
        });
        md += `\n`;
      }
      md += `---\n\n`;
    });

    md += `*Report generated via Omniverse AI Multimodal Intelligence Platform.*`;
    return md;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const mdContent = generateMarkdownReport();
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Synthesis_Report.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">Export Multimodal Synthesis Report</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-300">
            Export the complete cross-modal analysis, conversation history, and verified source citations into a formatted markdown dossier or printable PDF.
          </p>

          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2">Export Options</h4>
            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCitations}
                onChange={(e) => setIncludeCitations(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
              />
              <span>Include verified source citations and timestamp/page footnotes</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
              />
              <span>Include full project multimodal asset manifest & summaries</span>
            </label>
          </div>

          {/* Preview Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 max-h-56 overflow-y-auto font-mono text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap">
            {generateMarkdownReport()}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-950/50">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Markdown'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Print / Save as PDF
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Download .MD Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
