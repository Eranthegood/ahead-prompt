import express from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

// Rate limiting: 10 requests per minute per IP
const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Trop de feedback envoyés, veuillez réessayer dans une minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schema
const feedbackSchema = z.object({
  message: z.string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(500, 'Le message ne peut pas dépasser 500 caractères')
    .trim(),
  path: z.string().optional(),
  userId: z.string().optional()
});

// Sanitize function to escape HTML and prevent XSS
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// POST /api/feedback
router.post('/feedback', feedbackLimiter, async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validate request body
    const validationResult = feedbackSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Données invalides',
        details: validationResult.error.errors
      });
    }

    const { message, path, userId } = validationResult.data;

    // Sanitize inputs
    const sanitizedMessage = sanitizeInput(message);
    const sanitizedPath = path ? sanitizeInput(path) : null;
    const sanitizedUserId = userId ? sanitizeInput(userId) : null;

    // Get user agent
    const userAgent = req.get('User-Agent') || 'Unknown';

    // Create feedback record
    const feedback = await prisma.feedback.create({
      data: {
        message: sanitizedMessage,
        path: sanitizedPath || req.get('Referer') || '/',
        userId: sanitizedUserId,
        userAgent: sanitizeInput(userAgent)
      }
    });

    // Log the event for observability
    console.log('feedback_submitted', {
      id: feedback.id,
      path: feedback.path,
      userId: feedback.userId,
      timestamp: feedback.createdAt,
      userAgent: feedback.userAgent,
      responseTime: Date.now() - startTime
    });

    const responseTime = Date.now() - startTime;
    
    res.status(201).json({
      success: true,
      message: 'Feedback envoyé avec succès',
      id: feedback.id,
      responseTime: `${responseTime}ms`
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('feedback_error', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`
    });

    res.status(500).json({
      error: 'Erreur interne du serveur',
      message: 'Impossible d\'envoyer le feedback pour le moment'
    });
  }
});

export default router;