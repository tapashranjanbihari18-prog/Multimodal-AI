import React, { useState, useEffect, useRef } from 'react';
import { Message, Asset, Citation } from '../api.ts';
import api from '../api.ts';
import { 
  Send, 
  Sparkles, 
  Layers, 
  FileText, 
  Headphones, 
  Video, 
  Image as ImageIcon, 
  FileCode, 
  Download, 
  ExternalLink, 
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock,
  ChevronDown,
  Filter
} from 'lucide-react';

interface ChatInterfaceProps {
  projectId: string;
  projectTitle: string;
  conversationId: string;
  assets: Asset[];
  onOpenAsset: (assetId: string, timestampOrPage?: string) => void;
  onOpenExport: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  projectId,
  projectTitle,
  conversationId,
  assets,
  onOpenAsset,
  onOpenExport,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize selected assets to all project assets
  useEffect(() => {
    setSelectedAssetIds(assets.map((a) => a.id));
  }, [assets]);

  // Load conversation messages
  const loadMessages = async () => {
    if (!conversationId) return;
    try {
      const res = await api.get(`/chats/${conversationId}/messages`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    setInputQuery('');
    setIsLoading(true);

    // Optimistically add user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender: 'user',
      content: textToSend,
      citations: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.post(`/chats/${conversationId}/messages`, {
        content: textToSend,
        asset_ids: selectedAssetIds.length > 0 ? selectedAssetIds : undefined,
      });

      // Replace with confirmed messages
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== tempUserMsg.id);
        return [...filtered, res.data.user_message, res.data.ai_message];
      });
    } catch (err: any) {
      console.error('Failed to send message:', err);
      // Append error message
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        conversation_id: conversationId,
        sender: 'ai',
        content: `Error synthesizing response: ${err.response?.data?.error || err.message}. Please check your connection and API status.`,
        citations: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAssetFilter = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const promptSuggestions = [
    'Compare figures between the PDF report and audio interview statements.',
    'List all risk disclosures and compliance action points identified.',
    'Summarize the key chronological milestones and audio/video timestamps.',
    'Generate a consolidated executive briefing table across all sources.',
  ];

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-3.5 w-3.5 text-red-400" />;
      case 'audio': return <Headphones className="h-3.5 w-3.5 text-emerald-400" />;
      case 'video': return <Video className="h-3.5 w-3.5 text-purple-400" />;
      case 'image': return <ImageIcon className="h-3.5 w-3.5 text-amber-400" />;
      default: return <FileCode className="h-3.5 w-3.5 text-blue-400" />;
    }
  };

  // Render markdown-like simple formatting for tables, bold, lists, and headers
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    let inTable = false;
    let tableRows: string[][] = [];

    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check table row
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        const cells = trimmed.split('|').slice(1, -1).map((c) => c.trim());
        // Skip separator row like |---|---|
        if (!cells.every((c) => /^:?-+:?$/.test(c))) {
          tableRows.push(cells);
        }
        return;
      } else if (inTable) {
        // Flush table
        elements.push(
          <div key={`table-${idx}`} className="my-3 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60 p-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-300 font-semibold">
                  {tableRows[0]?.map((cell, cIdx) => (
                    <th key={cIdx} className="p-2">{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {tableRows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-900/40">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableRows = [];
      }

      if (trimmed.startsWith('#### ')) {
        elements.push(<h5 key={idx} className="font-semibold text-cyan-300 text-sm mt-3 mb-1">{trimmed.replace('#### ', '')}</h5>);
      } else if (trimmed.startsWith('### ')) {
        elements.push(<h4 key={idx} className="font-bold text-white text-base mt-4 mb-2">{trimmed.replace('### ', '')}</h4>);
      } else if (trimmed.startsWith('## ')) {
        elements.push(<h3 key={idx} className="font-bold text-white text-lg mt-4 mb-2">{trimmed.replace('## ', '')}</h3>);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <li key={idx} className="ml-4 list-disc text-slate-300 text-xs my-0.5 leading-relaxed">
            {renderInlineMarkdown(trimmed.substring(2))}
          </li>
        );
      } else if (trimmed.startsWith('> ')) {
        elements.push(
          <blockquote key={idx} className="my-2 border-l-2 border-cyan-500 pl-3 italic text-slate-300 text-xs">
            {renderInlineMarkdown(trimmed.substring(2))}
          </blockquote>
        );
      } else if (trimmed === '---') {
        elements.push(<hr key={idx} className="my-3 border-slate-800" />);
      } else if (trimmed.length > 0) {
        elements.push(
          <p key={idx} className="text-xs text-slate-300 leading-relaxed my-1">
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      }
    });

    if (inTable && tableRows.length > 0) {
      elements.push(
        <div key="table-end" className="my-3 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-300 font-semibold">
                {tableRows[0]?.map((cell, cIdx) => (
                  <th key={cIdx} className="p-2">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {tableRows.slice(1).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/40">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return elements;
  };

  const renderInlineMarkdown = (text: string) => {
    // Basic bold parsing: **bold**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md overflow-hidden">
      {/* Workspace Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-3.5 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Cross-Modal Synthesis Workspace</h2>
            <p className="text-[11px] text-slate-400">
              Querying {selectedAssetIds.length} of {assets.length} active repository assets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
              filterDrawerOpen
                ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filter Sources ({selectedAssetIds.length})</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            title="Export Report"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Asset Filter Bar (Collapsible) */}
      {filterDrawerOpen && (
        <div className="border-b border-slate-800 bg-slate-950/90 px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Select Assets to Include in Reasoning Context
            </span>
            <div className="flex gap-2 text-[11px]">
              <button
                onClick={() => setSelectedAssetIds(assets.map((a) => a.id))}
                className="text-cyan-400 hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setSelectedAssetIds([])}
                className="text-slate-400 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {assets.map((asset) => {
              const isSelected = selectedAssetIds.includes(asset.id);
              return (
                <button
                  key={asset.id}
                  onClick={() => toggleAssetFilter(asset.id)}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-all ${
                    isSelected
                      ? 'border-indigo-500/80 bg-indigo-950/60 text-indigo-200'
                      : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {getAssetIcon(asset.file_type)}
                  <span className="truncate max-w-[140px]">{asset.file_name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600/30 to-indigo-600/30 border border-indigo-500/30 text-cyan-400 mb-4 shadow-xl">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-base font-semibold text-white">Ask Anything Across Your Multimodal Repository</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Synthesize findings across PDFs, audio transcripts, video frames, OCR slides, and text notes. Answers are strictly grounded with verifiable timestamp & page citations.
            </p>

            <div className="w-full mt-6 space-y-2 text-left">
              <p className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">Suggested Inquiries</p>
              {promptSuggestions.map((sugg, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sugg)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300 hover:border-cyan-500/50 hover:bg-slate-900/80 hover:text-white transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <span>"{sugg}"</span>
                  <Send className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white text-xs font-bold shadow-md">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                      : 'border border-slate-800/90 bg-slate-950/80 text-slate-200 shadow-lg'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div>
                      {renderFormattedContent(msg.content)}

                      {/* Source Citation Cards */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-800/80">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-400 mb-2">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Verified Source Citations ({msg.citations.length})</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {msg.citations.map((cite, cIdx) => (
                              <div
                                key={cIdx}
                                onClick={() => onOpenAsset(cite.asset_id, cite.timestamp_or_page)}
                                className="group/cite flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 hover:border-cyan-500/60 hover:bg-slate-900 transition-all cursor-pointer"
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <div className="flex items-center gap-1.5 truncate">
                                    {getAssetIcon(cite.file_type)}
                                    <span className="font-semibold text-slate-200 truncate group-hover/cite:text-cyan-300 text-[11px]">
                                      {cite.file_name}
                                    </span>
                                  </div>
                                  {cite.timestamp_or_page && (
                                    <span className="font-mono text-[10px] bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded shrink-0">
                                      {cite.timestamp_or_page}
                                    </span>
                                  )}
                                </div>
                                {cite.snippet && (
                                  <p className="text-[10px] text-slate-400 line-clamp-2 italic">
                                    "{cite.snippet}"
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 items-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white text-xs font-bold">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-400 flex items-center gap-2">
              <span className="animate-pulse">Synthesizing cross-modal evidence across PDF, audio, and visual assets...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Bar */}
      <div className="border-t border-slate-800 p-4 bg-slate-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question across your multimodal project assets (e.g. compare figures, extract timelines, verify claims)..."
            disabled={isLoading}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-3 pl-4 pr-12 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md disabled:opacity-40 hover:from-cyan-400 hover:to-indigo-500 transition-all cursor-pointer"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
