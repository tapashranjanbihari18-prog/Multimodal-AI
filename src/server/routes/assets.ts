import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db.ts';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import { processAssetMultimodal } from '../services/ai.ts';

const router = Router();
router.use(requireAuth);

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  },
});

// File validation per section 9 of Master Prompt
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMime = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMime.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, Images, Audio, Video, Plaintext.`));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 52428800, // 50MB
  },
  fileFilter,
});

function determineFileType(mime: string, originalName: string): 'pdf' | 'image' | 'audio' | 'video' | 'text' {
  const lowerMime = mime.toLowerCase();
  const ext = path.extname(originalName).toLowerCase();

  if (lowerMime.includes('pdf') || ext === '.pdf') return 'pdf';
  if (lowerMime.startsWith('image/')) return 'image';
  if (lowerMime.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) return 'audio';
  if (lowerMime.startsWith('video/') || ['.mp4', '.webm', '.mov'].includes(ext)) return 'video';
  return 'text';
}

// POST /api/projects/:id/assets - Upload asset(s) and trigger AI ingestion
router.post('/projects/:id/assets', upload.array('files', 10), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.id;
    const project = db.getProjectById(projectId, userId);

    if (!project) {
      res.status(404).json({ error: 'Project not found or unauthorized' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const analysisProfile = (req.body.analysis_profile as string) || 'Executive Summary';
    const createdAssets = [];

    for (const file of files) {
      const fileType = determineFileType(file.mimetype, file.originalname);
      const fileUrl = `/uploads/${file.filename}`;

      // Create asset in DB initially as PROCESSING
      const asset = db.createAsset({
        project_id: projectId,
        user_id: userId,
        file_name: file.originalname,
        file_type: fileType,
        file_size: file.size,
        file_url: fileUrl,
        storage_path: file.path,
        processing_status: 'PROCESSING',
        extracted_text: '',
        metadata: {
          mime_type: file.mimetype,
          original_name: file.originalname,
          analysis_profile: analysisProfile,
        },
      });

      createdAssets.push(asset);

      // Trigger AI extraction asynchronously
      processAssetMultimodal(file.path, file.originalname, fileType, file.mimetype, analysisProfile)
        .then(extraction => {
          db.updateAsset(asset.id, {
            processing_status: 'COMPLETED',
            extracted_text: extraction.extracted_text,
            metadata: {
              ...asset.metadata,
              summary: extraction.summary,
              key_topics: extraction.key_topics,
              entities: extraction.entities,
              extracted_text_summary: extraction.extracted_text_summary,
              timestamps: extraction.timestamps,
              pages: extraction.pages,
            },
          });
        })
        .catch(err => {
          console.error(`Error processing asset ${asset.id}:`, err);
          db.updateAsset(asset.id, {
            processing_status: 'FAILED',
            metadata: {
              ...asset.metadata,
              error: err.message,
            },
          });
        });
    }

    res.status(201).json({
      message: `${createdAssets.length} asset(s) uploaded and queued for multimodal AI processing.`,
      assets: createdAssets,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Asset upload failed' });
  }
});

// GET /api/assets/:id - Get asset details and extracted content
router.get('/assets/:id', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const asset = db.getAssetById(req.params.id, userId);

    if (!asset) {
      res.status(404).json({ error: 'Asset not found or unauthorized' });
      return;
    }

    res.json(asset);
  } catch (error: any) {
    console.error('Fetch asset error:', error);
    res.status(500).json({ error: 'Failed to retrieve asset details' });
  }
});

// DELETE /api/assets/:id - Delete asset
router.delete('/assets/:id', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const asset = db.getAssetById(req.params.id, userId);

    if (!asset) {
      res.status(404).json({ error: 'Asset not found or unauthorized' });
      return;
    }

    // Try deleting the physical file if it exists and is not a sample file
    if (asset.storage_path && !asset.storage_path.startsWith('samples/')) {
      try {
        if (fs.existsSync(asset.storage_path)) {
          fs.unlinkSync(asset.storage_path);
        }
      } catch (err) {
        console.warn('Could not remove file on disk:', err);
      }
    }

    db.deleteAsset(asset.id, userId);
    res.json({ message: 'Asset deleted successfully' });
  } catch (error: any) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

// POST /api/assets/:id/reprocess - Trigger re-analysis with custom profile
router.post('/assets/:id/reprocess', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const asset = db.getAssetById(req.params.id, userId);

    if (!asset) {
      res.status(404).json({ error: 'Asset not found or unauthorized' });
      return;
    }

    const newProfile = req.body.analysis_profile || asset.metadata?.analysis_profile || 'Executive Summary';

    db.updateAsset(asset.id, {
      processing_status: 'PROCESSING',
      metadata: { ...asset.metadata, analysis_profile: newProfile },
    });

    res.json({ message: 'Reprocessing initiated', status: 'PROCESSING' });

    // Run extraction in background
    processAssetMultimodal(
      asset.storage_path,
      asset.file_name,
      asset.file_type,
      asset.metadata?.mime_type || '',
      newProfile
    )
      .then(extraction => {
        db.updateAsset(asset.id, {
          processing_status: 'COMPLETED',
          extracted_text: extraction.extracted_text,
          metadata: {
            ...asset.metadata,
            analysis_profile: newProfile,
            summary: extraction.summary,
            key_topics: extraction.key_topics,
            entities: extraction.entities,
            extracted_text_summary: extraction.extracted_text_summary,
            timestamps: extraction.timestamps,
            pages: extraction.pages,
          },
        });
      })
      .catch(err => {
        console.error('Reprocess error:', err);
        db.updateAsset(asset.id, {
          processing_status: 'FAILED',
          metadata: { ...asset.metadata, error: err.message },
        });
      });
  } catch (error: any) {
    console.error('Reprocess route error:', error);
    res.status(500).json({ error: 'Failed to reprocess asset' });
  }
});

export default router;
