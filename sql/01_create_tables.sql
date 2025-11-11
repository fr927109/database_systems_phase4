-- ============================================================================
-- MUSIC PLAYER DATABASE - TABLE CREATION SCRIPT
-- Database: music_player_db
-- Purpose: Create normalized tables for music player application
-- ============================================================================

-- Drop existing database if it exists (for testing purposes)
DROP DATABASE IF EXISTS music_player_db;

-- Create database
CREATE DATABASE music_player_db;
USE music_player_db;

-- ============================================================================
-- TABLE 1: USERS
-- Description: Stores user account information and authentication credentials
-- Primary Key: user_id
-- Normalization: 3NF - Each attribute depends on entire primary key, no transitive dependencies
-- ============================================================================
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE COMMENT 'User email address - unique identifier',
    username VARCHAR(100) NOT NULL COMMENT 'Display name for user',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last account update timestamp',
    
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores user authentication and profile information';

-- ============================================================================
-- TABLE 2: ARTISTS
-- Description: Stores artist information
-- Primary Key: artist_id
-- Normalization: 3NF - All non-key attributes depend on artist_id only
-- ============================================================================
CREATE TABLE Artists (
    artist_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Artist name',
    bio TEXT COMMENT 'Artist biography',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores artist information and metadata';

-- ============================================================================
-- TABLE 3: SONGS
-- Description: Stores song/track information
-- Primary Key: song_id
-- Foreign Key: artist_id references Artists(artist_id)
-- Normalization: 3NF - No transitive dependencies; artist info stored in Artists table
-- Functional Dependency: song_id → (title, duration, genre, release_year, artist_id)
-- ============================================================================
CREATE TABLE Songs (
    song_id INT AUTO_INCREMENT PRIMARY KEY,
    artist_id INT NOT NULL COMMENT 'Foreign key to Artists table',
    title VARCHAR(255) NOT NULL COMMENT 'Song title',
    duration INT NOT NULL COMMENT 'Song duration in seconds',
    genre VARCHAR(100) COMMENT 'Music genre (e.g., pop, rock, jazz)',
    release_year INT COMMENT 'Year song was released',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    
    FOREIGN KEY (artist_id) REFERENCES Artists(artist_id) ON DELETE CASCADE,
    INDEX idx_title (title),
    INDEX idx_artist_id (artist_id),
    INDEX idx_genre (genre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores song/track information with artist reference';

-- ============================================================================
-- TABLE 4: PLAYLISTS
-- Description: Stores user-created playlists
-- Primary Key: playlist_id
-- Foreign Key: user_id references Users(user_id)
-- Normalization: 3NF - Playlist info stored here; user info stored in Users table
-- Functional Dependency: playlist_id → (name, description, color_hex, user_id)
-- ============================================================================
CREATE TABLE Playlists (
    playlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'Foreign key to Users table',
    name VARCHAR(255) NOT NULL COMMENT 'Playlist name',
    description TEXT COMMENT 'Optional playlist description',
    color_hex VARCHAR(7) DEFAULT '#a855f7' COMMENT 'Hex color code for playlist (e.g., #FF5733)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Playlist creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
    
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores user-created playlists with customization options';

-- ============================================================================
-- TABLE 5: PLAYLIST_SONGS (Junction Table)
-- Description: Implements many-to-many relationship between Playlists and Songs
-- Primary Key: playlist_song_id
-- Foreign Keys: playlist_id, song_id
-- Normalization: 3NF - Junction table eliminates N:M relationship
-- Functional Dependency: (playlist_id, song_id) → (track_order, added_at)
-- Note: Composite unique constraint on (playlist_id, song_id) prevents duplicates
-- ============================================================================
CREATE TABLE Playlist_Songs (
    playlist_song_id INT AUTO_INCREMENT PRIMARY KEY,
    playlist_id INT NOT NULL COMMENT 'Foreign key to Playlists table',
    song_id INT NOT NULL COMMENT 'Foreign key to Songs table',
    track_order INT NOT NULL COMMENT 'Position of song in playlist (1-based index)',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when song was added to playlist',
    
    FOREIGN KEY (playlist_id) REFERENCES Playlists(playlist_id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES Songs(song_id) ON DELETE CASCADE,
    UNIQUE KEY unique_playlist_song (playlist_id, song_id),
    INDEX idx_song_id (song_id),
    INDEX idx_track_order (playlist_id, track_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Junction table for many-to-many relationship between Playlists and Songs';

-- ============================================================================
-- SUMMARY OF NORMALIZATION
-- ============================================================================
/*
✓ 1NF (First Normal Form):
  - All values are atomic (no repeating groups)
  - No composite attributes
  - Each cell contains a single, indivisible value
  
✓ 2NF (Second Normal Form):
  - Satisfies 1NF
  - No partial dependencies on composite keys
  - In Playlist_Songs: (playlist_id, song_id) → all non-key attributes
  
✓ 3NF (Third Normal Form):
  - Satisfies 2NF
  - No transitive dependencies
  - Artists separated from Songs (song_id → artist_id → artist_name prevented)
  - Users separated from Playlists (playlist_id → user_id → user_info prevented)
  - Playlist info not duplicated in Playlist_Songs

✓ BCNF (Boyce-Codd Normal Form):
  - Every determinant is a superkey
  - No anomalies from functional dependencies
*/

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
/*
Created indexes on:
1. Users.email - Used for login queries
2. Users.username - Used for profile lookups
3. Artists.name - Used for artist searches
4. Songs.title - Used for song search
5. Songs.artist_id - Used for JOIN with Artists
6. Songs.genre - Used for filtering by genre
7. Playlists.user_id - Used for user's playlists query
8. Playlists.name - Used for playlist name search
9. Playlist_Songs.song_id - Used for finding playlists containing a song
10. Playlist_Songs.(playlist_id, track_order) - Used for ordered playlist retrieval
*/

