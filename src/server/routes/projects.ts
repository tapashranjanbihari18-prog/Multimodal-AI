import { Router, Response } from 'express';
import { db } from '../db.ts';
import { projectSchema } from '../validation.ts';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';

const router = Router();

// Apply auth middleware to all project endpoints
router.use(requireAuth);

router.get('/', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const projects = db.getProjectsByUserId(userId);

    const enriched = projects.map(p => {
      const assets = db.getAssetsByProjectId(p.id, userId);
      const conversations = db.getConversationsByProjectId(p.id, userId);
      return {
        ...p,
        asset_count: assets.length,
        conversation_count: conversations.length,
        asset_types: Array.from(new Set(assets.map(a => a.file_type))),
        last_updated: p.updated_at,
      };
    });

    res.json(enriched);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/', (req: AuthRequest, res: Response): void => {
  try {
    const parseResult = projectSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation error',
        details: parseResult.error.issues.map((e) => e.message),
      });
      return;
    }

    const userId = req.user!.id;
    const newProject = db.createProject(userId, parseResult.data);
    res.status(201).json(newProject);
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.get('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const project = db.getProjectById(req.params.id, userId);

    if (!project) {
      res.status(404).json({ error: 'Project not found or unauthorized' });
      return;
    }

    const assets = db.getAssetsByProjectId(project.id, userId);
    const conversations = db.getConversationsByProjectId(project.id, userId);

    res.json({
      ...project,
      assets,
      conversations,
    });
  } catch (error: any) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
});

router.delete('/:id', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const success = db.deleteProject(req.params.id, userId);
    if (!success) {
      res.status(404).json({ error: 'Project not found or unauthorized' });
      return;
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Cross-modal semantic search endpoint
router.get('/:id/search', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const project = db.getProjectById(req.params.id, userId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const query = String(req.query.q || '').trim().toLowerCase();
    const assets = db.getAssetsByProjectId(project.id, userId);

    if (!query) {
      res.json({ query: '', results: [] });
      return;
    }

    const results = assets
      .map(asset => {
        let score = 0;
        const matches: string[] = [];

        if (asset.file_name.toLowerCase().includes(query)) {
          score += 10;
          matches.push(`Filename match: ${asset.file_name}`);
        }
        if (asset.metadata?.summary?.toLowerCase().includes(query)) {
          score += 6;
          matches.push(`Summary: ${asset.metadata.summary}`);
        }
        if (asset.metadata?.key_topics?.some(t => t.toLowerCase().includes(query))) {
          score += 5;
          matches.push(`Topic match: ${asset.metadata.key_topics.join(', ')}`);
        }
        if (asset.extracted_text?.toLowerCase().includes(query)) {
          score += 4;
          // Extract snippet around query
          const idx = asset.extracted_text.toLowerCase().indexOf(query);
          const start = Math.max(0, idx - 40);
          const end = Math.min(asset.extracted_text.length, idx + query.length + 60);
          matches.push(`Snippet: "...${asset.extracted_text.substring(start, end)}..."`);
        }
        if (asset.metadata?.timestamps?.some(ts => ts.note.toLowerCase().includes(query))) {
          score += 7;
          matches.push(`Timestamp match in audio/video timeline`);
        }

        return {
          asset,
          score,
          matches,
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    res.json({
      query,
      results,
      count: results.length,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
