import axios from 'axios';

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at?: string;
}

export interface AssetMetadata {
  summary?: string;
  key_topics?: string[];
  entities?: string[];
  extracted_text_summary?: string;
  analysis_profile?: string;
  timestamps?: { time: string; note: string }[];
  pages?: { page: number; heading?: string; snippet: string }[];
  mime_type?: string;
  original_name?: string;
  [key: string]: any;
}

export interface Asset {
  id: string;
  project_id: string;
  user_id: string;
  file_name: string;
  file_type: 'pdf' | 'image' | 'audio' | 'video' | 'text';
  file_size: number;
  file_url: string;
  storage_path: string;
  processing_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  extracted_text: string;
  metadata: AssetMetadata;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  asset_count?: number;
  conversation_count?: number;
  asset_types?: string[];
  created_at: string;
  updated_at: string;
  assets?: Asset[];
  conversations?: Conversation[];
}

export interface Conversation {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Citation {
  asset_id: string;
  file_name: string;
  file_type: string;
  citation_label: string;
  timestamp_or_page?: string;
  snippet?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  content: string;
  citations: Citation[];
  created_at: string;
}

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('omniverse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized on a protected route, clear token
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('omniverse_token');
        localStorage.removeItem('omniverse_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
