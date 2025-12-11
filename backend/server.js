// ============================================================================
// EXPRESS SERVER - MUSIC PLAYER BACKEND
// Purpose: Run API server with MySQL database connection
// ============================================================================

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { testConnection } from './db.js';
import routes from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Enable CORS for frontend communication
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Parse JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Music Player Backend API',
    version: '1.0.0',
    endpoints: {
      artists: '/api/artists',
      songs: '/api/songs',
      playlists: '/api/playlists/:userId',
      search: '/api/search?q=query',
      health: '/api/health'
    }
  });
});

// Billboard Hot 100 Top 10 endpoint
app.get('/api/billboard/top10', async (req, res) => {
  try {
    // Static Billboard Hot 100 Top 10 (you can update this weekly or fetch from an API)
    const billboardTop10 = [
      { rank: 1, title: "Cruel Summer", artist: "Taylor Swift", duration: "2:58", chart_position: "↔️" },
      { rank: 2, title: "Paint The Town Red", artist: "Doja Cat", duration: "3:50", chart_position: "↑ 1" },
      { rank: 3, title: "Snooze", artist: "SZA", duration: "3:22", chart_position: "↓ 1" },
      { rank: 4, title: "I Remember Everything", artist: "Zach Bryan ft. Kacey Musgraves", duration: "3:38", chart_position: "↔️" },
      { rank: 5, title: "Fukumean", artist: "Gunna", duration: "2:04", chart_position: "↑ 2" },
      { rank: 6, title: "Strangers", artist: "Kenya Grace", duration: "2:47", chart_position: "NEW" },
      { rank: 7, title: "vampire", artist: "Olivia Rodrigo", duration: "3:39", chart_position: "↓ 2" },
      { rank: 8, title: "Lovin On Me", artist: "Jack Harlow", duration: "2:38", chart_position: "↑ 15" },
      { rank: 9, title: "greedy", artist: "Tate McRae", duration: "2:11", chart_position: "↑ 3" },
      { rank: 10, title: "Last Night", artist: "Morgan Wallen", duration: "2:51", chart_position: "↓ 1" }
    ];

    res.json({ success: true, songs: billboardTop10 });
  } catch (error) {
    console.error('Failed to fetch Billboard Top 10:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Test database connection
    const connected = await testConnection();
    
    if (!connected) {
      console.error('⚠️  Warning: Could not connect to MySQL database');
      console.log('📋 Please ensure:');
      console.log('  1. MySQL server is running');
      console.log('  2. Database "music_player_db" exists');
      console.log('  3. .env file has correct credentials');
      console.log('\n Starting server anyway (database queries will fail)...\n');
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`\n🎵 Music Player API Server Started`);
      console.log(`📍 Server running at http://localhost:${PORT}`);
      console.log(`🌐 CORS enabled for ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
      console.log(`📚 API Documentation at http://localhost:${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down server...');
  process.exit(0);
});
