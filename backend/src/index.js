import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { ErrorPrompt } from './models/ErrorPrompt.js';
import feedbackRoutes from './routes/feedback.js';
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

// Feedback routes
app.use('/api', feedbackRoutes);

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

