-- ============================================================================
-- MUSIC PLAYER DATABASE - SAMPLE DATA INSERTION SCRIPT
-- Database: music_player_db
-- Purpose: Populate tables with sample data for testing and demonstration
-- ============================================================================

USE music_player_db;

-- ============================================================================
-- INSERT SAMPLE USERS (Functional Dependency: user_id → email, username, password_hash)
-- ============================================================================
INSERT INTO Users (email, username, password_hash) VALUES
('fr927@email.com', 'frankie', '$2b$10$YourHashedPasswordHere1'),
('alex.music@email.com', 'alexmusic', '$2b$10$YourHashedPasswordHere2'),
('jordan.listener@email.com', 'jlisten', '$2b$10$YourHashedPasswordHere3'),
('taylor.songs@email.com', 'taylorsongs', '$2b$10$YourHashedPasswordHere4'),
('casey.beats@email.com', 'caseybeats', '$2b$10$YourHashedPasswordHere5'),
('morgan.audio@email.com', 'morganaud', '$2b$10$YourHashedPasswordHere6'),
('raven.music@email.com', 'ravenmusic', '$2b$10$YourHashedPasswordHere7');

-- ============================================================================
-- INSERT SAMPLE ARTISTS (Functional Dependency: artist_id → name, bio)
-- ============================================================================
INSERT INTO Artists (name, bio) VALUES
('Ava Lumen', 'Ava Lumen is an electronic music producer known for creating atmospheric synth-pop tracks with ethereal vocals.'),
('Violet Drive', 'A rock/alternative band combining powerful guitar riffs with introspective lyrics about urban life.'),
('Kairo', 'Kairo is a minimalist electronic artist focusing on ambient and downtempo compositions for meditation and focus.'),
('Sky Lanterns', 'An indie folk band drawing inspiration from nature and storytelling traditions across diverse cultures.'),
('North & Pine', 'A lo-fi hip-hop collective creating sample-based beats for studying, relaxing, and creative work.'),
('Luna Waves', 'Luna Waves produces synth-wave and synthpop music with 80s and 90s influences.'),
('Echo Chamber', 'A post-rock experimental group exploring complex rhythms and layered instrumental arrangements.'),
('Neon Nights', 'A synthwave musician creating retro-futuristic electronic music with nostalgic 80s aesthetics.');

-- ============================================================================
-- INSERT SAMPLE SONGS 
-- (Functional Dependency: song_id → title, duration, genre, release_year, artist_id)
-- Note: artist_id references Artists table to avoid data duplication (3NF compliance)
-- ============================================================================
INSERT INTO Songs (artist_id, title, duration, genre, release_year) VALUES
(1, 'Neon Nights', 201, 'Synth-pop', 2023),
(2, 'Midnight Engine', 248, 'Rock', 2022),
(3, 'Glass River', 179, 'Ambient', 2023),
(4, 'Orbiting', 222, 'Indie Folk', 2023),
(5, 'Paper Kites', 190, 'Lo-fi Hip-hop', 2021),
(1, 'Electric Dreams', 215, 'Synth-pop', 2023),
(6, 'Luminescence', 203, 'Synthwave', 2022),
(3, 'Whispered Echoes', 165, 'Ambient', 2023),
(7, 'Crystalline Structures', 267, 'Post-rock', 2022),
(2, 'Echoing Thunder', 256, 'Rock', 2023),
(5, 'Vinyl Memories', 185, 'Lo-fi Hip-hop', 2022),
(8, 'Synthwave Horizon', 210, 'Synthwave', 2023),
(4, 'Autumn Whispers', 198, 'Indie Folk', 2023),
(6, 'Retro Future', 225, 'Synthwave', 2022),
(1, 'Aurora', 192, 'Synth-pop', 2023);

-- ============================================================================
-- INSERT SAMPLE PLAYLISTS
-- (Functional Dependency: playlist_id → name, description, color_hex, user_id)
-- Note: user_id references Users table; user data not duplicated here (3NF compliance)
-- ============================================================================
INSERT INTO Playlists (user_id, name, description, color_hex) VALUES
(1, 'Daily Mix', 'My favorite tracks for daily listening', '#a855f7'),
(1, 'Focus Flow', 'Ambient music for concentration and work', '#10b981'),
(1, 'Roadtrip 25', 'High-energy tracks for road trips', '#f59e0b'),
(2, 'Chill Vibes', 'Relaxing tracks for unwinding', '#3b82f6'),
(2, 'Workout Beats', 'Energetic tracks for exercise', '#f43f5e'),
(3, 'Studying Essentials', 'Lo-fi and ambient for study sessions', '#8b5cf6'),
(3, 'Rock Anthems', 'Classic and modern rock tracks', '#ec4899'),
(4, 'Evening Ambiance', 'Soft instrumental for evening relaxation', '#06b6d4'),
(4, 'Night Driving', 'Synthwave for late-night drives', '#14b8a6'),
(5, 'Indie Favorites', 'Curated indie and alternative tracks', '#f97316');

-- ============================================================================
-- INSERT SAMPLE PLAYLIST_SONGS (Junction Table)
-- (Functional Dependency: (playlist_id, song_id) → track_order, added_at)
-- Purpose: Implements many-to-many relationship between Playlists and Songs
-- Note: Unique constraint on (playlist_id, song_id) prevents duplicate entries
-- ============================================================================

-- Playlist 1: Daily Mix (user_id=1)
INSERT INTO Playlist_Songs (playlist_id, song_id, track_order) VALUES
(1, 1, 1),  -- Neon Nights
(1, 3, 2),  -- Glass River
(1, 6, 3),  -- Electric Dreams
(1, 7, 4),  -- Luminescence
(1, 12, 5); -- Synthwave Horizon

-- Playlist 2: Focus Flow (user_id=1)
INSERT INTO Playlist_Songs (playlist_id, song_id, track_order) VALUES
(2, 3, 1),  -- Glass River
(2, 8, 2),  -- Whispered Echoes
(2, 11, 3), -- Vinyl Memories
(2, 13, 4), -- Autumn Whispers
(2, 5, 5);  -- Paper Kites

-- Playlist 3: Roadtrip 25 (user_id=1)
INSERT INTO Playlist_Songs (playlist_id, song_id, track_order) VALUES
(3, 2, 1),  -- Midnight Engine
(3, 10, 2), -- Echoing Thunder
(3, 4, 3),  -- Orbiting
(3, 6, 4),  -- Electric Dreams
(3, 12, 5), -- Synthwave Horizon
(3, 9, 6);  -- Crystalline Structures

-- Playlist 4: Chill Vibes (user_id=2)
INSERT INTO Playlist_Songs (playlist_id, song_id, track_order) VALUES
(4, 3, 1),  -- Glass River
(4, 8, 2),  -- Whispered Echoes
(4, 7, 3),  -- Luminescence
(4, 13, 4), -- Autumn Whispers
(4, 5, 5);  -- Paper Kites

-- Playlist 5: Workout Beats (user_id=2)
INSERT INTO Playlist_Songs (playlist_id, song_id, track_order) VALUES
(5, 2, 1),  -- Midnight Engine
(5, 10, 2), -- Echoing Thunder
(5, 1, 3),  -- Neon Nights
(5, 4, 4),  -- Orbiting
(5, 6, 5);  -- Electric Dreams

-- Playlist 6: Studying Essentials (user_id=3)
INSERT INTO Playlist_Songs (playlist_id, song_id, track_order) VALUES
(6, 5, 1),  -- Paper Kites
(6, 11, 2), -- Vinyl Memories
(6, 3, 3),  -- Glass River
(6, 8, 4),  -- Whispered Echoes
(6, 13, 5); -- Autumn Whispers

-- Playlist 7: Rock Anthems (user_id=3)
INSERT INTO Playlist_Songs (playlist_id, song_id, track_order) VALUES
(7, 2, 1),  -- Midnight Engine
(7, 10, 2), -- Echoing Thunder
(7, 9, 3),  -- Crystalline Structures
(7, 4, 4),  -- Orbiting
(7, 1, 5);  -- Neon Nights

-- Playlist 8: Evening Ambiance (user_id=4)
INSERT INTO Playlist_Songs (playlist_id, song_id, track_order) VALUES
(8, 3, 1),  -- Glass River
(8, 8, 2),  -- Whispered Echoes
(8, 7, 3),  -- Luminescence
(8, 13, 4), -- Autumn Whispers
(8, 15, 5); -- Aurora

-- Playlist 9: Night Driving (user_id=4)
INSERT INTO Playlist_Songs (playlist_id, song_id, track_order) VALUES
(9, 12, 1), -- Synthwave Horizon
(9, 14, 2), -- Retro Future
(9, 7, 3),  -- Luminescence
(9, 1, 4),  -- Neon Nights
(9, 6, 5);  -- Electric Dreams

-- Playlist 10: Indie Favorites (user_id=5)
INSERT INTO Playlist_Songs (playlist_id, song_id, track_order) VALUES
(10, 4, 1),  -- Orbiting
(10, 13, 2), -- Autumn Whispers
(10, 9, 3),  -- Crystalline Structures
(10, 5, 4),  -- Paper Kites
(10, 11, 5); -- Vinyl Memories

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify data insertion)
-- ============================================================================
/*
-- Count rows in each table
SELECT 'Users' AS table_name, COUNT(*) AS row_count FROM Users
UNION ALL
SELECT 'Artists', COUNT(*) FROM Artists
UNION ALL
SELECT 'Songs', COUNT(*) FROM Songs
UNION ALL
SELECT 'Playlists', COUNT(*) FROM Playlists
UNION ALL
SELECT 'Playlist_Songs', COUNT(*) FROM Playlist_Songs;

-- Show user with their playlists
SELECT 
    u.username, 
    p.name AS playlist_name,
    COUNT(ps.song_id) AS song_count
FROM Users u
LEFT JOIN Playlists p ON u.user_id = p.user_id
LEFT JOIN Playlist_Songs ps ON p.playlist_id = ps.playlist_id
GROUP BY u.user_id, p.playlist_id
ORDER BY u.username, p.name;

-- Show all songs in a specific playlist (with artist names)
SELECT 
    p.name AS playlist_name,
    ps.track_order,
    s.title AS song_title,
    a.name AS artist_name,
    s.duration,
    s.genre
FROM Playlists p
JOIN Playlist_Songs ps ON p.playlist_id = ps.playlist_id
JOIN Songs s ON ps.song_id = s.song_id
JOIN Artists a ON s.artist_id = a.artist_id
WHERE p.playlist_id = 1
ORDER BY ps.track_order;
*/

