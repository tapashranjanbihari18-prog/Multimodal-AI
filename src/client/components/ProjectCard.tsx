import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../api.ts';
import { 
  FolderGit2, 
  FileText, 
  MessageSquare, 
  Trash2, 
  ArrowRight, 
  FileCode, 
  Headphones, 
  Video, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'finance & compliance':
      case 'finance':
        return 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300';
      case 'engineering & research':
      case 'research':
        return 'bg-cyan-950/80 border-cyan-800/60 text-cyan-300';
      case 'legal & compliance':
      case 'legal':
        return 'bg-amber-950/80 border-amber-800/60 text-amber-300';
      case 'media & creative':
        return 'bg-fuchsia-950/80 border-fuchsia-800/60 text-fuchsia-300';
      default:
        return 'bg-indigo-950/80 border-indigo-800/60 text-indigo-300';
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/10">
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(project.category)}`}>
            {project.category || 'General'}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
                onDelete(project.id);
              }
            }}
            className="text-slate-500 hover:text-rose-400 p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
            title="Delete Project"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Title */}
        <Link to={`/projects/${project.id}`}>
          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {project.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-relaxed">
          {project.description || 'No description provided.'}
        </p>

        {/* Multimodal Asset Badges */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {project.asset_types && project.asset_types.length > 0 ? (
            project.asset_types.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 rounded bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 text-[11px] font-medium text-slate-300"
              >
                {type === 'pdf' && <FileText className="h-3 w-3 text-red-400" />}
                {type === 'audio' && <Headphones className="h-3 w-3 text-emerald-400" />}
                {type === 'video' && <Video className="h-3 w-3 text-purple-400" />}
                {type === 'image' && <ImageIcon className="h-3 w-3 text-amber-400" />}
                {type === 'text' && <FileCode className="h-3 w-3 text-blue-400" />}
                <span className="capitalize">{type}</span>
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-500 italic">No assets uploaded yet</span>
          )}
        </div>
      </div>

      {/* Footer stats & links */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <FolderGit2 className="h-3.5 w-3.5 text-slate-400" />
            <span>{project.asset_count ?? 0} Assets</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
            <span>{project.conversation_count ?? 0} Chats</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/workspace/${project.id}/chat`}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600/20 border border-indigo-500/40 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 transition-colors"
            title="Open Chat & Synthesis"
          >
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>Chat</span>
          </Link>
          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
          >
            <span>Open</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
