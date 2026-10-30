import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import authRoutes from './src/server/routes/auth.ts';
import projectRoutes from './src/server/routes/projects.ts';
import assetRoutes from './src/server/routes/assets.ts';
import chatRoutes from './src/server/routes/chats.ts';
import { initializeSeedData } from './src/server/seed.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Ensure uploads and data directories exist
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Request body parsing
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Static uploads serving for document/audio/video/image previewing
app.use('/uploads', express.static(UPLOADS_DIR));

// Seed default dataset on boot
initializeSeedData().catch(err => {
  console.error('Failed to initialize seed data:', err);
});

// System health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    platform: 'Omniverse AI',
    timestamp: new Date().toISOString(),
    aiEngine: process.env.GEMINI_API_KEY ? 'gemini-3.8-flash (configured)' : 'local-indexer (fallback ready)',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', assetRoutes);
app.use('/api', chatRoutes);

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Omniverse AI] Multimodal Engine server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Omniverse AI server:', err);
});
