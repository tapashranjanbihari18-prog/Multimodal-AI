import { Router, Response } from 'express';
import { db } from '../db.ts';
import { messageSchema } from '../validation.ts';
import { requireAuth, AuthRequest } from '../middleware/auth.ts';
import { synthesizeCrossModalChat } from '../services/ai.ts';

const router = Router();
router.use(requireAuth);

// GET /api/projects/:id/chats - List conversations in a project
router.get('/projects/:id/chats', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const project = db.getProjectById(req.params.id, userId);

    if (!project) {
      res.status(404).json({ error: 'Project not found or unauthorized' });
      return;
    }

    const conversations = db.getConversationsByProjectId(project.id, userId);
    res.json(conversations);
  } catch (error: any) {
    console.error('List chats error:', error);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
});

// POST /api/projects/:id/chats - Create a new conversation
router.post('/projects/:id/chats', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const project = db.getProjectById(req.params.id, userId);

    if (!project) {
      res.status(404).json({ error: 'Project not found or unauthorized' });
      return;
    }

    const title = (req.body.title as string) || `Workspace Session ${new Date().toLocaleDateString()}`;
    const newConv = db.createConversation(project.id, userId, title);

    res.status(201).json(newConv);
  } catch (error: any) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// GET /api/chats/:id/messages - Get messages for a conversation
router.get('/chats/:id/messages', (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const conv = db.getConversationById(req.params.id, userId);

    if (!conv) {
      res.status(404).json({ error: 'Conversation not found or unauthorized' });
      return;
    }

    const messages = db.getMessagesByConversationId(conv.id);
    res.json({
      conversation: conv,
      messages,
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/chats/:id/messages - Send a message and get Gemini multimodal response
router.post('/chats/:id/messages', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const conv = db.getConversationById(req.params.id, userId);

    if (!conv) {
      res.status(404).json({ error: 'Conversation not found or unauthorized' });
      return;
    }

    const parseResult = messageSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation error',
        details: parseResult.error.issues.map((e) => e.message),
      });
      return;
    }

    const userContent = parseResult.data.content;

    // 1. Save user message
    const userMsg = db.createMessage(conv.id, 'user', userContent);

    // 2. Fetch project and assets for multimodal synthesis
    const project = db.getProjectById(conv.project_id, userId);
    const projectTitle = project ? project.title : 'Omniverse Workspace';
    const assets = db.getAssetsByProjectId(conv.project_id, userId);

    // Filter to selected asset IDs if specified in request body
    const selectedAssetIds = Array.isArray(req.body.asset_ids) ? req.body.asset_ids : null;
    const filteredAssets = selectedAssetIds
      ? assets.filter(a => selectedAssetIds.includes(a.id))
      : assets;

    // Fetch conversation history
    const history = db.getMessagesByConversationId(conv.id).map(m => ({
      sender: m.sender,
      content: m.content,
    }));

    // 3. Synthesize response using Gemini
    const { answer, citations } = await synthesizeCrossModalChat(
      projectTitle,
      userContent,
      history,
      filteredAssets
    );

    // 4. Save AI message with citations
    const aiMsg = db.createMessage(conv.id, 'ai', answer, citations);

    res.status(201).json({
      user_message: userMsg,
      ai_message: aiMsg,
    });
  } catch (error: any) {
    console.error('Chat message error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

export default router;
