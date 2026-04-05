import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables BEFORE importing anything else that may need them
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');
console.log(`📍 __dirname: ${__dirname}`);
console.log(`📍 Looking for .env at: ${envPath}`);

// Check if .env file exists
if (fs.existsSync(envPath)) {
  console.log(`📍 .env file found! Size: ${fs.statSync(envPath).size} bytes`);
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  const tmdbLine = lines.find(l => l.includes('TMDB_API_KEY'));
  const omdbLine = lines.find(l => l.includes('OMDB_API_KEY'));
  console.log(`📍 OMDB line in .env: ${omdbLine ? omdbLine.substring(0, 30) + '...' : 'NOT FOUND'}`);
  console.log(`📍 TMDB line in .env: ${tmdbLine ? tmdbLine.substring(0, 30) + '...' : 'NOT FOUND'}`);
} else {
  console.log(`⚠️ .env file NOT found at ${envPath}`);
}

const result = dotenv.config({ path: envPath });
console.log(`📍 dotenv.config result:`, result.error ? `❌ ${result.error.message}` : `✅ Loaded`);
console.log(`📍 Parsed variables count: ${result.parsed ? Object.keys(result.parsed).length : 0}`);
if (result.parsed) {
  console.log(`📍 OMDB in parsed: ${result.parsed.OMDB_API_KEY ? '✅' : '❌'}`);
  console.log(`📍 TMDB in parsed: ${result.parsed.TMDB_API_KEY ? '✅' : '❌'}`);
}
console.log(`📍 process.env.OMDB_API_KEY: ${process.env.OMDB_API_KEY ? 'SET' : 'UNDEFINED'}`);
console.log(`📍 process.env.TMDB_API_KEY: ${process.env.TMDB_API_KEY ? 'SET' : 'UNDEFINED'}`);

// NOW import other modules that depend on process.env
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/database.js';
import { initializeFirebase } from './utils/firebase.js';
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import reviewRoutes from './routes/reviews.js';
import watchlistRoutes from './routes/watchlist.js';
import listRoutes from './routes/lists.js';
import curatedListRoutes from './routes/curatedLists.js';
import socialRoutes from './routes/social.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase
initializeFirebase();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/curated-lists', curatedListRoutes);
app.use('/api/users', socialRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

export default app;
