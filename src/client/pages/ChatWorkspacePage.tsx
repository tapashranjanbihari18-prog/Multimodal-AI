import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { Project, Conversation, Asset } from '../api.ts';
import { ChatInterface } from '../components/ChatInterface.tsx';
import { AssetViewerModal } from '../components/AssetViewerModal.tsx';
import { ExportModal } from '../components/ExportModal.tsx';
import { 
  ArrowLeft, 
  Plus, 
  MessageSquare, 
  FolderGit2, 
  Layers, 
  Loader2,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const ChatWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssetForModal, setSelectedAssetForModal] = useState<Asset | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const fetchProjectAndChats = async () => {
    if (!id) return;
    try {
      const [projRes, chatsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/chats`),
      ]);

      setProject(projRes.data);
      const chats: Conversation[] = chatsRes.data || [];
      setConversations(chats);

      if (chats.length > 0 && !activeConversationId) {
        setActiveConversationId(chats[0].id);
      } else if (chats.length === 0) {
        // Automatically create first conversation if none exist
        const newChatRes = await api.post(`/projects/${id}/chats`, {
          title: 'Primary Cross-Modal Synthesis',
        });
        setConversations([newChatRes.data]);
        setActiveConversationId(newChatRes.data.id);
      }
    } catch (err) {
      console.error('Error loading chat workspace:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndChats();
  }, [id]);

  const handleCreateNewChat = async () => {
    if (!id) return;
    const title = prompt('Enter a title for this chat session:', `Synthesis Session ${conversations.length + 1}`);
    if (!title) return;

    try {
      const res = await api.post(`/projects/${id}/chats`, { title });
      setConversations((prev) => [res.data, ...prev]);
      setActiveConversationId(res.data.id);
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const handleOpenAsset = (assetId: string) => {
    const asset = project?.assets?.find((a) => a.id === assetId);
    if (asset) {
      setSelectedAssetForModal(asset);
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
        <h2 className="text-lg font-bold text-white">Project Workspace Not Found</h2>
        <Link to="/dashboard" className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs text-white">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const assets = project.assets || [];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
      {/* Left Conversations Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-slate-800 bg-slate-950/90 backdrop-blur-md">
        {/* Project Context Box */}
        <div className="p-4 border-b border-slate-800">
          <Link
            to={`/projects/${project.id}`}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Asset Repository</span>
          </Link>
          <h2 className="text-sm font-bold text-white truncate" title={project.title}>
            {project.title}
          </h2>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-cyan-400" />
              <span>{assets.length} Assets</span>
            </span>
            <span>•</span>
            <span className="text-emerald-400">RAG Ready</span>
          </div>
        </div>

        {/* New Session Button */}
        <div className="p-3">
          <button
            onClick={handleCreateNewChat}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800/80 border border-slate-700/80 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-cyan-400" />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          <p className="text-[10px] font-semibold uppercase text-slate-500 px-2 py-1 tracking-wider">
            Chat Sessions
          </p>
          {conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-700/60 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{conv.title}</span>
                </div>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Quick Repository Summary at Bottom */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/30 text-[11px] text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">Indexed Modalities:</p>
          <div className="flex flex-wrap gap-1">
            {assets.map((a) => (
              <span key={a.id} className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 uppercase">
                {a.file_type}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="flex-1 p-3 sm:p-6 overflow-hidden">
        {activeConversationId ? (
          <ChatInterface
            projectId={project.id}
            projectTitle={project.title}
            conversationId={activeConversationId}
            assets={assets}
            onOpenAsset={handleOpenAsset}
            onOpenExport={() => setShowExportModal(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-center text-slate-400">
            <p>Select or create a chat session to begin multimodal synthesis.</p>
          </div>
        )}
      </main>

      {/* Asset Viewer Modal */}
      {selectedAssetForModal && (
        <AssetViewerModal
          asset={selectedAssetForModal}
          onClose={() => setSelectedAssetForModal(null)}
        />
      )}

      {/* Export Report Modal */}
      {showExportModal && (
        <ExportModal
          projectTitle={project.title}
          messages={[]}
          assets={assets}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};
