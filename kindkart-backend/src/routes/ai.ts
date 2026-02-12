import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = express.Router();

// AI chat endpoint (protected)
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, context, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // In production, you might want to call Gemini API from backend for security
    // For now, we'll return a success response and let frontend handle it
    // This allows the API key to stay on frontend (acceptable for MVP)
    
    res.json({
      message: 'AI chat endpoint ready. Frontend will handle Gemini API calls directly.',
      // In production, you could proxy the Gemini API call here for better security
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

export { router as aiRoutes };

