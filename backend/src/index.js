import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { ErrorPrompt } from './models/ErrorPrompt.js';
import { InvitationError } from './models/InvitationError.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt_errors';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Serve static frontend (MVP)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendDir));
app.get('/', (_req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Fetch latest errors
app.get('/api/errors', async (_req, res) => {
  try {
    const errors = await ErrorPrompt.find({}).sort({ createdAt: -1 }).limit(100).lean();
    res.json(errors);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch errors' });
  }
});

// Save an error
app.post('/api/errors', async (req, res) => {
  try {
    const { message, stack, source, meta } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }
    const doc = await ErrorPrompt.create({ message, stack, source: source || 'keyboard', meta: meta || {} });
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save error' });
  }
});

// Invitation Error Logging Endpoints

// Log invitation error
app.post('/api/invitation-errors', async (req, res) => {
  try {
    const {
      errorType,
      message,
      stack,
      userId,
      userEmail,
      workspaceId,
      invitationId,
      invitationToken,
      action,
      requestPath,
      responseStatus,
      responseTime,
      retryAttempt,
      browserInfo
    } = req.body;

    // Validate required fields
    if (!errorType || !message || !action) {
      return res.status(400).json({ 
        error: 'errorType, message, and action are required' 
      });
    }

    // Get client info from request headers
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Hash sensitive data
    let hashedToken = null;
    if (invitationToken) {
      // Simple hash for demo - in production use proper crypto
      hashedToken = Buffer.from(invitationToken).toString('base64').slice(0, 16);
    }

    const errorDoc = await InvitationError.create({
      errorType,
      message,
      stack,
      userId,
      userEmail,
      userAgent,
      ipAddress,
      workspaceId,
      invitationId,
      invitationToken: hashedToken,
      action,
      requestPath,
      responseStatus,
      responseTime,
      retryAttempt: retryAttempt || 0,
      browserInfo: {
        ...browserInfo,
        userAgent
      }
    });

    res.status(201).json({ 
      id: errorDoc._id,
      message: 'Error logged successfully',
      timestamp: errorDoc.createdAt
    });
  } catch (error) {
    console.error('Failed to log invitation error:', error);
    res.status(500).json({ error: 'Failed to log invitation error' });
  }
});

// Get invitation errors (for admin/debugging)
app.get('/api/invitation-errors', async (req, res) => {
  try {
    const { 
      userId, 
      workspaceId, 
      errorType, 
      resolved, 
      limit = 50, 
      offset = 0 
    } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (workspaceId) filter.workspaceId = workspaceId;
    if (errorType) filter.errorType = errorType;
    if (resolved !== undefined) filter.resolved = resolved === 'true';

    const errors = await InvitationError
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    const total = await InvitationError.countDocuments(filter);

    res.json({
      errors,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch invitation errors:', error);
    res.status(500).json({ error: 'Failed to fetch invitation errors' });
  }
});

// Get error statistics
app.get('/api/invitation-errors/stats', async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    const stats = await InvitationError.getErrorStats(timeframe);
    
    const summary = await InvitationError.aggregate([
      {
        $group: {
          _id: null,
          totalErrors: { $sum: 1 },
          resolvedErrors: { $sum: { $cond: ['$resolved', 1, 0] } },
          unresolvedErrors: { $sum: { $cond: ['$resolved', 0, 1] } }
        }
      }
    ]);

    res.json({
      stats,
      summary: summary[0] || { totalErrors: 0, resolvedErrors: 0, unresolvedErrors: 0 }
    });
  } catch (error) {
    console.error('Failed to fetch error stats:', error);
    res.status(500).json({ error: 'Failed to fetch error statistics' });
  }
});

// Mark error as resolved
app.patch('/api/invitation-errors/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, resolvedBy } = req.body;

    const updatedError = await InvitationError.findByIdAndUpdate(
      id,
      {
        resolved: true,
        resolvedAt: new Date(),
        resolution,
        resolvedBy
      },
      { new: true }
    );

    if (!updatedError) {
      return res.status(404).json({ error: 'Error not found' });
    }

    res.json(updatedError);
  } catch (error) {
    console.error('Failed to resolve error:', error);
    res.status(500).json({ error: 'Failed to resolve error' });
  }
});

async function start() {
  try {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log(`Connected to MongoDB at ${mongoUri}`);
    } catch (primaryErr) {
      console.warn('Primary MongoDB connection failed, starting in-memory MongoDB:', primaryErr.message);
      const mem = await MongoMemoryServer.create();
      const memUri = mem.getUri();
      await mongoose.connect(memUri);
      console.log('Connected to in-memory MongoDB');
    }

    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

start();

