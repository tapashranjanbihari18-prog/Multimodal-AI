import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
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

export interface Citation {
  asset_id: string;
  file_name: string;
  file_type: string;
  citation_label: string;
  timestamp_or_page?: string;
  snippet?: string;
}

export interface Conversation {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  content: string;
  citations: Citation[];
  created_at: string;
}

export interface DatabaseSchema {
  users: User[];
  projects: Project[];
  assets: Asset[];
  conversations: Conversation[];
  messages: Message[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'omniverse_db.json');

class DatabaseService {
  private data: DatabaseSchema = {
    users: [],
    projects: [],
    assets: [],
    conversations: [],
    messages: []
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (error) {
      console.error('Error initializing database file:', error);
      this.data = {
        users: [],
        projects: [],
        assets: [],
        conversations: [],
        messages: []
      };
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving database file:', error);
    }
  }

  // Users
  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const now = new Date().toISOString();
    const newUser: User = {
      id: uuidv4(),
      ...userData,
      created_at: now,
      updated_at: now,
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // Projects
  getProjectsByUserId(userId: string): Project[] {
    return this.data.projects.filter(p => p.user_id === userId);
  }

  getProjectById(id: string, userId?: string): Project | undefined {
    const project = this.data.projects.find(p => p.id === id);
    if (!project) return undefined;
    if (userId && project.user_id !== userId) return undefined;
    return project;
  }

  createProject(userId: string, data: { title: string; description?: string; category?: string }): Project {
    const now = new Date().toISOString();
    const project: Project = {
      id: uuidv4(),
      user_id: userId,
      title: data.title,
      description: data.description || '',
      category: data.category || 'General',
      created_at: now,
      updated_at: now
    };
    this.data.projects.push(project);
    this.save();
    return project;
  }

  deleteProject(id: string, userId: string): boolean {
    const index = this.data.projects.findIndex(p => p.id === id && p.user_id === userId);
    if (index === -1) return false;

    // Delete associated assets, conversations, and messages
    this.data.projects.splice(index, 1);
    this.data.assets = this.data.assets.filter(a => a.project_id !== id);
    const convIds = this.data.conversations.filter(c => c.project_id === id).map(c => c.id);
    this.data.conversations = this.data.conversations.filter(c => c.project_id !== id);
    this.data.messages = this.data.messages.filter(m => !convIds.includes(m.conversation_id));

    this.save();
    return true;
  }

  // Assets
  getAssetsByProjectId(projectId: string, userId: string): Asset[] {
    return this.data.assets.filter(a => a.project_id === projectId && a.user_id === userId);
  }

  getAssetById(id: string, userId?: string): Asset | undefined {
    const asset = this.data.assets.find(a => a.id === id);
    if (!asset) return undefined;
    if (userId && asset.user_id !== userId) return undefined;
    return asset;
  }

  createAsset(assetData: Omit<Asset, 'id' | 'created_at'>): Asset {
    const now = new Date().toISOString();
    const asset: Asset = {
      id: uuidv4(),
      ...assetData,
      created_at: now
    };
    this.data.assets.push(asset);
    this.save();
    return asset;
  }

  updateAsset(id: string, update: Partial<Asset>): Asset | undefined {
    const asset = this.data.assets.find(a => a.id === id);
    if (!asset) return undefined;
    Object.assign(asset, update);
    this.save();
    return asset;
  }

  deleteAsset(id: string, userId: string): boolean {
    const index = this.data.assets.findIndex(a => a.id === id && a.user_id === userId);
    if (index === -1) return false;
    this.data.assets.splice(index, 1);
    this.save();
    return true;
  }

  // Conversations
  getConversationsByProjectId(projectId: string, userId: string): Conversation[] {
    return this.data.conversations.filter(c => c.project_id === projectId && c.user_id === userId);
  }

  getConversationById(id: string, userId?: string): Conversation | undefined {
    const conv = this.data.conversations.find(c => c.id === id);
    if (!conv) return undefined;
    if (userId && conv.user_id !== userId) return undefined;
    return conv;
  }

  createConversation(projectId: string, userId: string, title: string): Conversation {
    const conv: Conversation = {
      id: uuidv4(),
      project_id: projectId,
      user_id: userId,
      title,
      created_at: new Date().toISOString()
    };
    this.data.conversations.push(conv);
    this.save();
    return conv;
  }

  // Messages
  getMessagesByConversationId(conversationId: string): Message[] {
    return this.data.messages.filter(m => m.conversation_id === conversationId);
  }

  createMessage(conversationId: string, sender: 'user' | 'ai', content: string, citations: Citation[] = []): Message {
    const msg: Message = {
      id: uuidv4(),
      conversation_id: conversationId,
      sender,
      content,
      citations,
      created_at: new Date().toISOString()
    };
    this.data.messages.push(msg);
    this.save();
    return msg;
  }

  // Utility to seed initial sample data
  seedDemoData(defaultUsers: User[], defaultProjects: Project[], defaultAssets: Asset[], defaultConversations: Conversation[], defaultMessages: Message[]) {
    if (this.data.users.length === 0) {
      this.data.users = defaultUsers;
      this.data.projects = defaultProjects;
      this.data.assets = defaultAssets;
      this.data.conversations = defaultConversations;
      this.data.messages = defaultMessages;
      this.save();
    }
  }
}

export const db = new DatabaseService();
