# Music Player Database Integration - Setup Guide

## Overview
This guide walks you through setting up the MySQL database, running the backend server, and integrating it with the React frontend.

---

## Part 1: Database Setup

### Step 1: Create Database and Tables

1. **Open MySQL Command Line or MySQL Workbench**
   
2. **Run the table creation script:**
   ```bash
   mysql -u root -p < sql/01_create_tables.sql
   ```
   
   Or paste the contents of `sql/01_create_tables.sql` into MySQL Workbench

3. **Verify tables were created:**
   ```sql
   USE music_player_db;
   SHOW TABLES;
   ```
   
   You should see 5 tables:
   - Users
   - Artists
   - Songs
   - Playlists
   - Playlist_Songs

### Step 2: Insert Sample Data

1. **Run the sample data script:**
   ```bash
   mysql -u root -p music_player_db < sql/02_insert_sample_data.sql
   ```
   
   Or paste the contents of `sql/02_insert_sample_data.sql` into MySQL Workbench

2. **Verify data was inserted:**
   ```sql
   SELECT 'Users' AS table_name, COUNT(*) AS count FROM Users
   UNION ALL
   SELECT 'Artists', COUNT(*) FROM Artists
   UNION ALL
   SELECT 'Songs', COUNT(*) FROM Songs
   UNION ALL
   SELECT 'Playlists', COUNT(*) FROM Playlists
   UNION ALL
   SELECT 'Playlist_Songs', COUNT(*) FROM Playlist_Songs;
   ```
   
   Expected results:
   - Users: 7 rows
   - Artists: 8 rows
   - Songs: 15 rows
   - Playlists: 10 rows
   - Playlist_Songs: 50 rows

---

## Part 2: Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This installs:
- **express** - Web server framework
- **mysql2** - MySQL database driver
- **cors** - Enable cross-origin requests from frontend
- **dotenv** - Environment variable management
- **body-parser** - Parse JSON request bodies
- **nodemon** - Auto-reload during development

### Step 2: Configure Environment Variables

1. **Copy the example env file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your MySQL credentials:**
   ```
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password_here
   MYSQL_DATABASE=music_player_db
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173
   ```

### Step 3: Start Backend Server

```bash
npm start
```

You should see:
```
✅ MySQL Database connected successfully!

🎵 Music Player API Server Started
📍 Server running at http://localhost:5000
🌐 CORS enabled for http://localhost:5173
📚 API Documentation at http://localhost:5000
✅ Health check: http://localhost:5000/api/health
```

### Step 4: Test API Endpoints

Open your browser or Postman and test these endpoints:

1. **Health Check:**
   ```
   GET http://localhost:5000/api/health
   ```
   
   Response:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "timestamp": "2025-11-10T..."
   }
   ```

2. **Get All Artists:**
   ```
   GET http://localhost:5000/api/artists
   ```

3. **Get All Songs:**
   ```
   GET http://localhost:5000/api/songs
   ```

4. **Get User Playlists:**
   ```
   GET http://localhost:5000/api/playlists/1
   ```
   
   (Replace `1` with any user_id from 1-7)

5. **Get Songs in Playlist:**
   ```
   GET http://localhost:5000/api/playlists/1/songs
   ```

6. **Search:**
   ```
   GET http://localhost:5000/api/search?q=neon
   ```

---

## Part 3: Frontend Integration

### Step 1: Update Environment Variables (Frontend)

Create a `.env` file in the `src` directory:

```
VITE_API_URL=http://localhost:5000/api
```

### Step 2: Create API Service Module

Create `src/services/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchSongs = async () => {
  const response = await fetch(`${API_URL}/songs`);
  return response.json();
};

export const fetchArtists = async () => {
  const response = await fetch(`${API_URL}/artists`);
  return response.json();
};

export const fetchUserPlaylists = async (userId) => {
  const response = await fetch(`${API_URL}/playlists/${userId}`);
  return response.json();
};

export const fetchPlaylistSongs = async (playlistId) => {
  const response = await fetch(`${API_URL}/playlists/${playlistId}/songs`);
  return response.json();
};

export const searchMusic = async (query) => {
  const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
  return response.json();
};

export const createPlaylist = async (userId, name, description, colorHex) => {
  const response = await fetch(`${API_URL}/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      name,
      description,
      color_hex: colorHex
    })
  });
  return response.json();
};

export const addSongToPlaylist = async (playlistId, songId, trackOrder) => {
  const response = await fetch(`${API_URL}/playlists/${playlistId}/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      song_id: songId,
      track_order: trackOrder
    })
  });
  return response.json();
};
```

### Step 3: Update React Component

Replace hardcoded demo data in `MusicPlayerMock.jsx` with API calls:

```javascript
import { useEffect } from 'react';
import * as api from './services/api';

// In component:
useEffect(() => {
  // Fetch data on mount
  const loadData = async () => {
    try {
      const songs = await api.fetchSongs();
      const artists = await api.fetchArtists();
      // Update state with fetched data
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };
  
  loadData();
}, []);
```

---

## Part 4: Testing & Troubleshooting

### Verify Everything Works

1. **Start MySQL server**
2. **Run backend:** `npm start` (in `backend` folder)
3. **Run frontend:** `npm run dev` (in main folder)
4. **Test API:** Open `http://localhost:5000/api/health`
5. **Test UI:** Open `http://localhost:5173` in browser

### Common Issues

**Issue: "ECONNREFUSED" - Can't connect to MySQL**
- Solution: Ensure MySQL server is running
  - Windows: `net start MySQL80` (or your version)
  - Mac: Check System Preferences > MySQL
  - Linux: `sudo systemctl start mysql`

**Issue: "Database does not exist"**
- Solution: Run `01_create_tables.sql` first

**Issue: "No data showing in UI"**
- Solution: 
  1. Verify backend API returns data: `GET http://localhost:5000/api/songs`
  2. Check browser console for errors
  3. Verify `VITE_API_URL` is correct

**Issue: "CORS error in browser console"**
- Solution: Check `.env` file in backend:
  ```
  CORS_ORIGIN=http://localhost:5173
  ```

---

## Part 5: API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Artists
- `GET /artists` - Get all artists
- `GET /artists/:id` - Get artist by ID
- `GET /songs/by-artist/:artistId` - Get songs by artist

#### Songs
- `GET /songs` - Get all songs
- `GET /songs/:id` - Get song by ID

#### Users
- `GET /users/:id` - Get user profile
- `POST /auth/login` - Login user

#### Playlists
- `GET /playlists/:userId` - Get user's playlists
- `GET /playlists/:playlistId/songs` - Get songs in playlist
- `POST /playlists` - Create new playlist
- `POST /playlists/:playlistId/songs` - Add song to playlist

#### Search
- `GET /search?q=query` - Search songs and artists

#### Health
- `GET /health` - Check API health status

---

## Deliverables Checklist

✅ **Database Design Documentation**
- [x] ER/EER diagram in `DATABASE_DESIGN.md`
- [x] Relational schema
- [x] Normalization process with functional dependencies
- [x] 1NF, 2NF, 3NF justification

✅ **SQL Scripts**
- [x] `sql/01_create_tables.sql` - Table creation with 5 tables, properly normalized
- [x] `sql/02_insert_sample_data.sql` - Sample data (70+ rows across tables)

✅ **Backend Integration**
- [x] Express.js server with MySQL connection pool
- [x] 10+ RESTful API endpoints
- [x] Error handling and logging

✅ **UI Integration** (Ready to implement)
- [x] API service module (`src/services/api.js`)
- [x] Instructions for fetching database data
- [x] CORS enabled for frontend

---

## Next Steps

1. **Database:**
   - Run SQL scripts to create tables and populate data

2. **Backend:**
   - Navigate to `backend` folder
   - Run `npm install`
   - Create `.env` file with your MySQL credentials
   - Run `npm start`

3. **Frontend:**
   - Create `src/services/api.js` with API calls
   - Update `src/MusicPlayerMock.jsx` to use API data
   - Test in browser

4. **Documentation:**
   - Take screenshots of working UI with database data
   - Document any customizations or changes

---

## File Structure

```
music-player-demo/
├── backend/
│   ├── server.js           # Express server entry point
│   ├── db.js              # MySQL connection pool
│   ├── routes.js          # API route handlers
│   ├── package.json       # Dependencies
│   ├── .env               # Environment variables (create from .env.example)
│   └── .env.example       # Example env file
├── src/
│   ├── MusicPlayerMock.jsx    # React UI component
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles.css
│   └── services/
│       └── api.js         # API client (to create)
├── sql/
│   ├── 01_create_tables.sql
│   └── 02_insert_sample_data.sql
├── DATABASE_DESIGN.md     # Schema documentation
└── SETUP_GUIDE.md        # This file
```

