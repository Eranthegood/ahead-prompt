import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { ErrorPrompt } from './models/ErrorPrompt.js';
import { Feedback } from './models/Feedback.js';
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

// Feedback endpoints
app.get('/api/feedback', async (req, res) => {
  try {
    const { status, category, limit = 50, page = 1 } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const feedback = await Feedback.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();
      
    const total = await Feedback.countDocuments(query);
    
    res.json({
      feedback,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { feedback, timestamp, userAgent, url } = req.body || {};
    
    if (!feedback || !feedback.trim()) {
      return res.status(400).json({ error: 'Feedback is required' });
    }
    
    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
      (req.connection.socket ? req.connection.socket.remoteAddress : null) || 'unknown';
    
    const feedbackDoc = await Feedback.create({
      feedback: feedback.trim(),
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      userAgent: userAgent || '',
      url: url || '',
      ipAddress
    });
    
    console.log('New feedback received:', {
      id: feedbackDoc._id,
      feedback: feedback.substring(0, 100) + (feedback.length > 100 ? '...' : ''),
      url,
      timestamp: feedbackDoc.timestamp
    });
    
    res.status(201).json({
      success: true,
      id: feedbackDoc._id,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

// Update feedback status (for admin use)
app.patch('/api/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, category, priority } = req.body;
    
    const updateFields = {};
    if (status) updateFields.status = status;
    if (category) updateFields.category = category;
    if (priority) updateFields.priority = priority;
    
    const feedback = await Feedback.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json(feedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
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

