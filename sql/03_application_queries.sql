-- ============================================================================
-- MUSIC PLAYER APPLICATION - DYNAMIC QUERIES
-- Database: music_player_db
-- Purpose: SQL queries executed through the application UI
-- ============================================================================

USE music_player_db;

-- ============================================================================
-- QUERY 1: Search Songs by Genre with Artist Information
-- Purpose: Allow users to search and filter songs by genre
-- UI Feature: Search/Filter page with genre dropdown
-- Tables: Songs (S), Artists (A)
-- Aggregation: None (filtering and joining)
-- ============================================================================
SELECT 
    S.song_id,
    S.title AS song_title,
    A.name AS artist_name,
    S.genre,
    S.duration,
    S.release_year
FROM Songs S
INNER JOIN Artists A ON S.artist_id = A.artist_id
WHERE S.genre = 'Synth-pop'
ORDER BY S.title ASC;

-- Example usage variations:
-- WHERE S.genre = 'Ambient' OR S.genre = 'Lo-fi Hip-hop'
-- WHERE S.genre LIKE '%rock%'


-- ============================================================================
-- QUERY 2: Get Playlist Details with Song Count and Total Duration
-- Purpose: Display playlist statistics and metadata
-- UI Feature: Playlist overview/details page
-- Tables: Playlists (P), Playlist_Songs (PS), Songs (S)
-- Aggregation: COUNT, SUM
-- ============================================================================
SELECT 
    P.playlist_id,s
    P.name AS playlist_name,
    P.description,
    P.color_hex,
    COUNT(PS.song_id) AS total_songs,
    ROUND(SUM(S.duration) / 60.0, 2) AS total_duration_minutes
FROM Playlists P
LEFT JOIN Playlist_Songs PS ON P.playlist_id = PS.playlist_id
LEFT JOIN Songs S ON PS.song_id = S.song_id
WHERE P.user_id = 1  -- Parameter: logged-in user ID
GROUP BY P.playlist_id, P.name, P.description, P.color_hex
ORDER BY P.created_at DESC;


-- ============================================================================
-- QUERY 3: Get All Songs in a Specific Playlist (Ordered by Track Order)
-- Purpose: Display songs within a selected playlist
-- UI Feature: Playlist view page with song list
-- Tables: Playlist_Songs (PS), Songs (S), Artists (A)
-- Aggregation: None (ordering and joining)
-- ============================================================================
SELECT 
    PS.track_order,
    S.song_id,
    S.title AS song_title,
    A.name AS artist_name,
    S.genre,
    S.duration,
    PS.added_at
FROM Playlist_Songs PS
INNER JOIN Songs S ON PS.song_id = S.song_id
INNER JOIN Artists A ON S.artist_id = A.artist_id
WHERE PS.playlist_id = 1  -- Parameter: selected playlist ID
ORDER BY PS.track_order ASC;


-- ============================================================================
-- QUERY 4: Get Most Popular Genres by Song Count
-- Purpose: Show genre statistics and trends
-- UI Feature: Dashboard/Analytics page with genre distribution chart
-- Tables: Songs (S)
-- Aggregation: COUNT, GROUP BY
-- ============================================================================
SELECT 
    S.genre,
    COUNT(*) AS song_count,
    ROUND(AVG(S.duration), 2) AS avg_duration_seconds,
    MIN(S.release_year) AS earliest_year,
    MAX(S.release_year) AS latest_year
FROM Songs S
GROUP BY S.genre
HAVING COUNT(*) >= 1  -- Filter: genres with at least 1 song
ORDER BY song_count DESC, S.genre ASC;


-- ============================================================================
-- QUERY 5: Get Artist Statistics with Song Count and Playlist Appearances
-- Purpose: Show artist popularity and activity metrics
-- UI Feature: Artist profile page or browse artists page
-- Tables: Artists (A), Songs (S), Playlist_Songs (PS)
-- Aggregation: COUNT, DISTINCT
-- ============================================================================
SELECT 
    A.artist_id,
    A.name AS artist_name,
    COUNT(DISTINCT S.song_id) AS total_songs,
    COUNT(DISTINCT PS.playlist_id) AS playlist_appearances,
    GROUP_CONCAT(DISTINCT S.genre ORDER BY S.genre SEPARATOR ', ') AS genres,
    MIN(S.release_year) AS first_release,
    MAX(S.release_year) AS latest_release
FROM Artists A
LEFT JOIN Songs S ON A.artist_id = S.artist_id
LEFT JOIN Playlist_Songs PS ON S.song_id = PS.song_id
GROUP BY A.artist_id, A.name
ORDER BY total_songs DESC, playlist_appearances DESC;


-- ============================================================================
-- QUERY 6: Search Songs by Title or Artist Name
-- Purpose: Universal search functionality
-- UI Feature: Global search bar in navigation
-- Tables: Songs (S), Artists (A)
-- Aggregation: None (filtering with LIKE)
-- ============================================================================
SELECT 
    S.song_id,
    S.title AS song_title,
    A.name AS artist_name,
    S.genre,
    S.duration,
    S.release_year
FROM Songs S
INNER JOIN Artists A ON S.artist_id = A.artist_id
WHERE S.title LIKE '%Neon%'  -- Parameter: user search term
   OR A.name LIKE '%Neon%'   -- Parameter: user search term
ORDER BY 
    CASE 
        WHEN S.title LIKE 'Neon%' THEN 1  -- Exact start match
        WHEN A.name LIKE 'Neon%' THEN 2
        ELSE 3
    END,
    S.title ASC;

-- ============================================================================
-- QUERY 7: Get Available Songs to Add to Playlist
-- Purpose: Show songs that can be added to a specific playlist
-- UI Feature: "Add Songs" button (left of Delete button) that opens a modal/dropdown
-- Tables: Songs (S), Artists (A), Playlist_Songs (PS)
-- Aggregation: None (filtering with NOT IN subquery)
-- ============================================================================
SELECT 
    S.song_id,
    S.title AS song_title,
    A.name AS artist_name,
    S.genre,
    S.duration,
    S.release_year
FROM Songs S
INNER JOIN Artists A ON S.artist_id = A.artist_id
WHERE S.song_id NOT IN (
    SELECT song_id 
    FROM Playlist_Songs 
    WHERE playlist_id = 1  -- Parameter: current playlist_id
)
ORDER BY S.title ASC;


-- ============================================================================
-- QUERY 8: Get User's Favorite Songs with Play Statistics
-- Purpose: Show user's favorite songs with aggregated listening data
-- UI Feature: Favorites page (activated by clicking the star button)
-- Tables: Favorite_Songs (FS), Songs (S), Artists (A), User_Listening_History (ULH)
-- Aggregation: COUNT, MAX, AVG
-- ============================================================================
SELECT 
    S.song_id,
    S.title AS song_title,
    A.name AS artist_name,
    S.genre,
    S.duration,
    FS.favorited_at,
    COUNT(ULH.history_id) AS play_count,
    MAX(ULH.played_at) AS last_played,
    ROUND(AVG(S.duration), 2) AS avg_song_duration
FROM Favorite_Songs FS
INNER JOIN Songs S ON FS.song_id = S.song_id
INNER JOIN Artists A ON S.artist_id = A.artist_id
LEFT JOIN User_Listening_History ULH ON S.song_id = ULH.song_id 
    AND FS.user_id = ULH.user_id
WHERE FS.user_id = 1  -- Parameter: logged-in user ID
GROUP BY S.song_id, S.title, A.name, S.genre, S.duration, FS.favorited_at
ORDER BY FS.favorited_at DESC;


-- ============================================================================
-- QUERY 9: Get Playlists Filtered by Genre with Song Statistics
-- Purpose: Filter playlists that contain songs from selected genre(s)
-- UI Feature: Genre dropdown filter on playlists page
-- Tables: Playlists (P), Playlist_Songs (PS), Songs (S)
-- Aggregation: COUNT, SUM, GROUP BY, HAVING
-- ============================================================================
SELECT 
    P.playlist_id,
    P.name AS playlist_name,
    P.color_hex,
    COUNT(DISTINCT PS.song_id) AS total_songs,
    COUNT(DISTINCT CASE WHEN S.genre = 'pop' THEN S.song_id END) AS pop_songs,
    ROUND(SUM(S.duration) / 60.0, 2) AS total_duration_minutes,
    GROUP_CONCAT(DISTINCT S.genre ORDER BY S.genre SEPARATOR ', ') AS all_genres
FROM Playlists P
INNER JOIN Playlist_Songs PS ON P.playlist_id = PS.playlist_id
INNER JOIN Songs S ON PS.song_id = S.song_id
WHERE P.user_id = 1  -- Parameter: logged-in user ID
  AND S.genre IN ('pop', 'rock')  -- Parameter: selected genres from dropdown
GROUP BY P.playlist_id, P.name, P.color_hex
HAVING COUNT(DISTINCT PS.song_id) > 0  -- Only playlists with songs
ORDER BY total_songs DESC;


-- ============================================================================
-- QUERY 10: Get Recently Added Songs Across All Playlists
-- Purpose: Show latest songs added to any playlist with aggregation
-- UI Feature: "Recently Added" section on dashboard
-- Tables: Playlist_Songs (PS), Songs (S), Artists (A), Playlists (P)
-- Aggregation: COUNT, MAX, GROUP BY
-- ============================================================================
SELECT 
    S.song_id,
    S.title AS song_title,
    A.name AS artist_name,
    S.genre,
    S.duration,
    COUNT(DISTINCT PS.playlist_id) AS in_playlists_count,
    MAX(PS.added_at) AS most_recent_add,
    GROUP_CONCAT(DISTINCT P.name ORDER BY PS.added_at DESC SEPARATOR ', ') AS playlist_names
FROM Songs S
INNER JOIN Artists A ON S.artist_id = A.artist_id
INNER JOIN Playlist_Songs PS ON S.song_id = PS.song_id
INNER JOIN Playlists P ON PS.playlist_id = P.playlist_id
WHERE P.user_id = 1  -- Parameter: logged-in user ID
GROUP BY S.song_id, S.title, A.name, S.genre, S.duration
HAVING MAX(PS.added_at) >= DATE_SUB(NOW(), INTERVAL 7 DAY)  -- Last 7 days
ORDER BY most_recent_add DESC
LIMIT 10;


-- ============================================================================
-- QUERY 11: Get Top Artists by Playlist Presence with Duration Stats
-- Purpose: Show most featured artists across user's playlists
-- UI Feature: "Top Artists" widget with filtering capability
-- Tables: Artists (A), Songs (S), Playlist_Songs (PS), Playlists (P)
-- Aggregation: COUNT, SUM, AVG, DISTINCT
-- ============================================================================
SELECT 
    A.artist_id,
    A.name AS artist_name,
    COUNT(DISTINCT S.song_id) AS unique_songs,
    COUNT(DISTINCT PS.playlist_id) AS playlist_count,
    COUNT(PS.song_id) AS total_playlist_entries,
    ROUND(SUM(S.duration) / 60.0, 2) AS total_minutes,
    ROUND(AVG(S.duration), 2) AS avg_song_duration,
    GROUP_CONCAT(DISTINCT S.genre ORDER BY S.genre SEPARATOR ', ') AS genres
FROM Artists A
INNER JOIN Songs S ON A.artist_id = S.artist_id
INNER JOIN Playlist_Songs PS ON S.song_id = PS.song_id
INNER JOIN Playlists P ON PS.playlist_id = P.playlist_id
WHERE P.user_id = 1  -- Parameter: logged-in user ID
GROUP BY A.artist_id, A.name
HAVING COUNT(DISTINCT PS.playlist_id) >= 1  -- Artists in at least 1 playlist
ORDER BY playlist_count DESC, total_playlist_entries DESC
LIMIT 10;


-- ============================================================================
-- QUERY 12: Get Songs by Duration Range with Playlist Information
-- Purpose: Filter songs by duration (short/medium/long)
-- UI Feature: Duration filter slider or dropdown in song browser
-- Tables: Songs (S), Artists (A), Playlist_Songs (PS)
-- Aggregation: COUNT
-- ============================================================================
SELECT 
    S.song_id,
    S.title AS song_title,
    A.name AS artist_name,
    S.genre,
    S.duration,
    CONCAT(FLOOR(S.duration / 60), ':', LPAD(S.duration % 60, 2, '0')) AS formatted_duration,
    COUNT(DISTINCT PS.playlist_id) AS in_playlists,
    CASE 
        WHEN S.duration < 180 THEN 'Short'
        WHEN S.duration BETWEEN 180 AND 300 THEN 'Medium'
        ELSE 'Long'
    END AS duration_category
FROM Songs S
INNER JOIN Artists A ON S.artist_id = A.artist_id
LEFT JOIN Playlist_Songs PS ON S.song_id = PS.song_id
WHERE S.duration BETWEEN 180 AND 300  -- Parameter: duration range (3-5 minutes)
GROUP BY S.song_id, S.title, A.name, S.genre, S.duration
ORDER BY S.duration ASC;


-- ============================================================================
-- QUERY 13: Get Playlist Comparison by Genre Distribution
-- Purpose: Compare genre distribution across multiple playlists
-- UI Feature: Playlist analytics/comparison view
-- Tables: Playlists (P), Playlist_Songs (PS), Songs (S)
-- Aggregation: COUNT, GROUP BY with multiple levels
-- ============================================================================
SELECT 
    P.playlist_id,
    P.name AS playlist_name,
    S.genre,
    COUNT(S.song_id) AS songs_in_genre,
    ROUND(COUNT(S.song_id) * 100.0 / SUM(COUNT(S.song_id)) OVER (PARTITION BY P.playlist_id), 2) AS genre_percentage,
    ROUND(SUM(S.duration) / 60.0, 2) AS genre_duration_minutes
FROM Playlists P
INNER JOIN Playlist_Songs PS ON P.playlist_id = PS.playlist_id
INNER JOIN Songs S ON PS.song_id = S.song_id
WHERE P.user_id = 1  -- Parameter: logged-in user ID
  AND P.playlist_id IN (1, 2, 3)  -- Parameter: selected playlists to compare
GROUP BY P.playlist_id, P.name, S.genre
ORDER BY P.playlist_id, songs_in_genre DESC;


-- ============================================================================
-- QUERY 14: Get Songs Not in Any Playlist (Available to Add)
-- Purpose: Show all songs that haven't been added to any user playlist yet
-- UI Feature: "Discover New Songs" or "Add to Playlist" modal
-- Tables: Songs (S), Artists (A), Playlist_Songs (PS), Playlists (P)
-- Aggregation: LEFT JOIN with NULL filtering
-- ============================================================================
SELECT 
    S.song_id,
    S.title AS song_title,
    A.name AS artist_name,
    S.genre,
    S.duration,
    S.release_year,
    CONCAT(FLOOR(S.duration / 60), ':', LPAD(S.duration % 60, 2, '0')) AS formatted_duration
FROM Songs S
INNER JOIN Artists A ON S.artist_id = A.artist_id
LEFT JOIN Playlist_Songs PS ON S.song_id = PS.song_id
LEFT JOIN Playlists P ON PS.playlist_id = P.playlist_id AND P.user_id = 1
WHERE P.playlist_id IS NULL  -- Songs not in any of user's playlists
  AND S.genre = 'pop'  -- Parameter: optional genre filter
ORDER BY S.title ASC;


-- ============================================================================
-- QUERY 15: Get Average Playlist Statistics by User
-- Purpose: Show user's overall playlist statistics and trends
-- UI Feature: User dashboard/profile statistics section
-- Tables: Playlists (P), Playlist_Songs (PS), Songs (S)
-- Aggregation: AVG, COUNT, SUM with subqueries
-- ============================================================================
SELECT 
    P.user_id,
    COUNT(DISTINCT P.playlist_id) AS total_playlists,
    COUNT(DISTINCT PS.song_id) AS unique_songs_across_playlists,
    ROUND(AVG(playlist_song_count), 2) AS avg_songs_per_playlist,
    ROUND(AVG(playlist_duration), 2) AS avg_playlist_duration_minutes,
    ROUND(SUM(playlist_duration), 2) AS total_music_minutes,
    MAX(playlist_song_count) AS largest_playlist_size,
    MIN(playlist_song_count) AS smallest_playlist_size
FROM Playlists P
INNER JOIN (
    SELECT 
        PS.playlist_id,
        COUNT(PS.song_id) AS playlist_song_count,
        SUM(S.duration) / 60.0 AS playlist_duration
    FROM Playlist_Songs PS
    INNER JOIN Songs S ON PS.song_id = S.song_id
    GROUP BY PS.playlist_id
) AS playlist_stats ON P.playlist_id = playlist_stats.playlist_id
LEFT JOIN Playlist_Songs PS ON P.playlist_id = PS.playlist_id
WHERE P.user_id = 1  -- Parameter: logged-in user ID
GROUP BY P.user_id;


-- ============================================================================
-- QUERY 16: Get Complete User Profile with Activity Statistics
-- Purpose: Display user profile information with aggregated activity data
-- UI Feature: User profile page showing personal info and music statistics
-- Tables: Users (U), Playlists (P), Favorite_Songs (FS), User_Listening_History (ULH)
-- Aggregation: COUNT, MAX, SUM
-- ============================================================================
SELECT 
    U.user_id,
    U.username,
    U.email,
    U.created_at AS member_since,
    COUNT(DISTINCT P.playlist_id) AS total_playlists,
    COUNT(DISTINCT FS.song_id) AS total_favorites,
    COUNT(DISTINCT ULH.song_id) AS unique_songs_played,
    COUNT(ULH.history_id) AS total_plays,
    MAX(ULH.played_at) AS last_activity,
    DATEDIFF(NOW(), U.created_at) AS days_as_member,
    ROUND(COUNT(ULH.history_id) / GREATEST(DATEDIFF(NOW(), U.created_at), 1), 2) AS avg_plays_per_day
FROM Users U
LEFT JOIN Playlists P ON U.user_id = P.user_id
LEFT JOIN Favorite_Songs FS ON U.user_id = FS.user_id
LEFT JOIN User_Listening_History ULH ON U.user_id = ULH.user_id
WHERE U.user_id = 1  -- Parameter: logged-in user ID
GROUP BY U.user_id, U.username, U.email, U.created_at;


-- ============================================================================
-- QUERY 17: Get User's Music Preferences by Genre
-- Purpose: Show user's listening habits and genre preferences
-- UI Feature: Profile statistics showing favorite genres
-- Tables: User_Listening_History (ULH), Songs (S), Users (U)
-- Aggregation: COUNT, GROUP BY, percentage calculation
-- ============================================================================
SELECT 
    U.user_id,
    U.username,
    S.genre,
    COUNT(ULH.history_id) AS plays_count,
    COUNT(DISTINCT S.song_id) AS unique_songs,
    ROUND(COUNT(ULH.history_id) * 100.0 / SUM(COUNT(ULH.history_id)) OVER (PARTITION BY U.user_id), 2) AS percentage_of_total,
    ROUND(SUM(S.duration) / 60.0, 2) AS total_minutes_listened
FROM Users U
INNER JOIN User_Listening_History ULH ON U.user_id = ULH.user_id
INNER JOIN Songs S ON ULH.song_id = S.song_id
WHERE U.user_id = 1  -- Parameter: logged-in user ID
GROUP BY U.user_id, U.username, S.genre
ORDER BY plays_count DESC;


-- ============================================================================
-- QUERY 18: Get User Profile with Top Listened Artists
-- Purpose: Show user's most played artists for profile page
-- UI Feature: "Your Top Artists" section on profile
-- Tables: Users (U), User_Listening_History (ULH), Songs (S), Artists (A)
-- Aggregation: COUNT, GROUP BY, LIMIT
-- ============================================================================
SELECT 
    U.user_id,
    U.username,
    A.artist_id,
    A.name AS artist_name,
    COUNT(DISTINCT S.song_id) AS unique_songs_played,
    COUNT(ULH.history_id) AS total_plays,
    MAX(ULH.played_at) AS last_played,
    ROUND(SUM(S.duration) / 60.0, 2) AS total_minutes_listened,
    GROUP_CONCAT(DISTINCT S.genre ORDER BY S.genre SEPARATOR ', ') AS genres_played
FROM Users U
INNER JOIN User_Listening_History ULH ON U.user_id = ULH.user_id
INNER JOIN Songs S ON ULH.song_id = S.song_id
INNER JOIN Artists A ON S.artist_id = A.artist_id
WHERE U.user_id = 1  -- Parameter: logged-in user ID
GROUP BY U.user_id, U.username, A.artist_id, A.name
ORDER BY total_plays DESC
LIMIT 5;  -- Top 5 artists


-- ============================================================================
-- QUERY 19: Get User Profile Summary with Collection Size
-- Purpose: Comprehensive profile overview with all collection statistics
-- UI Feature: Profile dashboard header with key metrics
-- Tables: Users (U), Playlists (P), Playlist_Songs (PS), Songs (S), Favorite_Songs (FS)
-- Aggregation: COUNT DISTINCT, SUM, multiple subqueries
-- ============================================================================
SELECT 
    U.user_id,
    U.username,
    U.email,
    U.created_at,
    COUNT(DISTINCT P.playlist_id) AS total_playlists,
    COUNT(DISTINCT PS.song_id) AS songs_in_playlists,
    COUNT(DISTINCT FS.song_id) AS favorite_songs,
    ROUND(SUM(S.duration) / 60.0, 2) AS total_collection_minutes,
    ROUND(SUM(S.duration) / 3600.0, 2) AS total_collection_hours,
    (SELECT COUNT(DISTINCT genre) 
     FROM Songs S2
     INNER JOIN Playlist_Songs PS2 ON S2.song_id = PS2.song_id
     INNER JOIN Playlists P2 ON PS2.playlist_id = P2.playlist_id
     WHERE P2.user_id = U.user_id) AS unique_genres,
    (SELECT COUNT(DISTINCT artist_id)
     FROM Songs S3
     INNER JOIN Playlist_Songs PS3 ON S3.song_id = PS3.song_id
     INNER JOIN Playlists P3 ON PS3.playlist_id = P3.playlist_id
     WHERE P3.user_id = U.user_id) AS unique_artists
FROM Users U
LEFT JOIN Playlists P ON U.user_id = P.user_id
LEFT JOIN Playlist_Songs PS ON P.playlist_id = PS.playlist_id
LEFT JOIN Songs S ON PS.song_id = S.song_id
LEFT JOIN Favorite_Songs FS ON U.user_id = FS.user_id
WHERE U.user_id = 1  -- Parameter: logged-in user ID
GROUP BY U.user_id, U.username, U.email, U.created_at;


-- ============================================================================
-- QUERY 20: Get User's Recent Activity Timeline
-- Purpose: Show recent user actions and listening history
-- UI Feature: "Recent Activity" feed on profile page
-- Tables: Users (U), User_Listening_History (ULH), Songs (S), Artists (A), Favorite_Songs (FS)
-- Aggregation: UNION of different activity types with dates
-- ============================================================================
(SELECT 
    'Played' AS activity_type,
    S.title AS song_title,
    A.name AS artist_name,
    S.genre,
    ULH.played_at AS activity_date
FROM User_Listening_History ULH
INNER JOIN Songs S ON ULH.song_id = S.song_id
INNER JOIN Artists A ON S.artist_id = A.artist_id
WHERE ULH.user_id = 1  -- Parameter: logged-in user ID
)
UNION ALL
(SELECT 
    'Favorited' AS activity_type,
    S.title AS song_title,
    A.name AS artist_name,
    S.genre,
    FS.favorited_at AS activity_date
FROM Favorite_Songs FS
INNER JOIN Songs S ON FS.song_id = S.song_id
INNER JOIN Artists A ON S.artist_id = A.artist_id
WHERE FS.user_id = 1  -- Parameter: logged-in user ID
)
ORDER BY activity_date DESC
LIMIT 20;


-- ============================================================================
-- QUERY 21: Get User's Favorite Songs with Details
-- Purpose: Display all favorite songs for user profile summary
-- UI Feature: "Favorite Songs" section on profile page
-- Tables: Favorite_Songs (FS), Songs (S), Artists (A), Playlist_Songs (PS)
-- Aggregation: COUNT
-- ============================================================================
SELECT 
    FS.song_id,
    S.title AS song_title,
    A.name AS artist_name,
    S.genre,
    S.duration,
    CONCAT(FLOOR(S.duration / 60), ':', LPAD(S.duration % 60, 2, '0')) AS formatted_duration,
    FS.favorited_at,
    COUNT(DISTINCT PS.playlist_id) AS in_playlists_count,
    DATEDIFF(NOW(), FS.favorited_at) AS days_favorited
FROM Favorite_Songs FS
INNER JOIN Songs S ON FS.song_id = S.song_id
INNER JOIN Artists A ON S.artist_id = A.artist_id
LEFT JOIN Playlist_Songs PS ON S.song_id = PS.song_id
WHERE FS.user_id = 1  -- Parameter: logged-in user ID
GROUP BY FS.song_id, S.title, A.name, S.genre, S.duration, FS.favorited_at
ORDER BY FS.favorited_at DESC;


-- ============================================================================
-- QUERY 22: Get User's Favorite Playlists Summary
-- Purpose: Display favorite playlists with aggregated statistics
-- UI Feature: "Favorite Playlists" section on profile page
-- Tables: Playlists (P), Playlist_Songs (PS), Songs (S), Favorite_Playlists (FP)
-- Aggregation: COUNT, SUM, AVG
-- ============================================================================
SELECT 
    P.playlist_id,
    P.name AS playlist_name,
    P.description,
    P.color_hex,
    P.created_at,
    COUNT(DISTINCT PS.song_id) AS total_songs,
    ROUND(SUM(S.duration) / 60.0, 2) AS total_duration_minutes,
    ROUND(AVG(S.duration), 2) AS avg_song_duration,
    GROUP_CONCAT(DISTINCT S.genre ORDER BY S.genre SEPARATOR ', ') AS genres,
    FP.favorited_at,
    CASE 
        WHEN P.user_id = 1 THEN 'Owner'
        ELSE 'Shared'
    END AS playlist_type
FROM Favorite_Playlists FP
INNER JOIN Playlists P ON FP.playlist_id = P.playlist_id
LEFT JOIN Playlist_Songs PS ON P.playlist_id = PS.playlist_id
LEFT JOIN Songs S ON PS.song_id = S.song_id
WHERE FP.user_id = 1  -- Parameter: logged-in user ID
GROUP BY P.playlist_id, P.name, P.description, P.color_hex, P.created_at, FP.favorited_at, P.user_id
ORDER BY FP.favorited_at DESC;


-- ============================================================================
-- QUERY 23: Get Complete Profile Summary with Favorites Count
-- Purpose: Comprehensive profile overview including favorites
-- UI Feature: Profile header/summary card with all key statistics
-- Tables: Users (U), Playlists (P), Favorite_Songs (FS), Favorite_Playlists (FP)
-- Aggregation: COUNT DISTINCT, multiple subqueries
-- ============================================================================
SELECT 
    U.user_id,
    U.username,
    U.email,
    U.created_at AS member_since,
    DATEDIFF(NOW(), U.created_at) AS days_as_member,
    COUNT(DISTINCT P.playlist_id) AS total_playlists_created,
    COUNT(DISTINCT FS.song_id) AS favorite_songs_count,
    COUNT(DISTINCT FP.playlist_id) AS favorite_playlists_count,
    (SELECT COUNT(DISTINCT PS.song_id)
     FROM Playlist_Songs PS
     INNER JOIN Playlists P2 ON PS.playlist_id = P2.playlist_id
     WHERE P2.user_id = U.user_id) AS total_songs_in_playlists,
    (SELECT ROUND(SUM(S.duration) / 60.0, 2)
     FROM Playlist_Songs PS
     INNER JOIN Playlists P3 ON PS.playlist_id = P3.playlist_id
     INNER JOIN Songs S ON PS.song_id = S.song_id
     WHERE P3.user_id = U.user_id) AS total_music_minutes,
    (SELECT COUNT(DISTINCT S.genre)
     FROM Playlist_Songs PS
     INNER JOIN Playlists P4 ON PS.playlist_id = P4.playlist_id
     INNER JOIN Songs S ON PS.song_id = S.song_id
     WHERE P4.user_id = U.user_id) AS unique_genres_in_collection
FROM Users U
LEFT JOIN Playlists P ON U.user_id = P.user_id
LEFT JOIN Favorite_Songs FS ON U.user_id = FS.user_id
LEFT JOIN Favorite_Playlists FP ON U.user_id = FP.user_id
WHERE U.user_id = 1  -- Parameter: logged-in user ID
GROUP BY U.user_id, U.username, U.email, U.created_at;


-- ============================================================================
-- QUERY 24: Get Recently Favorited Items (Songs and Playlists Combined)
-- Purpose: Show recent favorite activity on profile
-- UI Feature: "Recently Favorited" timeline on profile page
-- Tables: Favorite_Songs (FS), Songs (S), Artists (A), Favorite_Playlists (FP), Playlists (P)
-- Aggregation: UNION of songs and playlists
-- ============================================================================
(SELECT 
    'song' AS item_type,
    FS.song_id AS item_id,
    S.title AS item_name,
    A.name AS artist_or_owner,
    S.genre,
    CONCAT(FLOOR(S.duration / 60), ':', LPAD(S.duration % 60, 2, '0')) AS duration,
    FS.favorited_at
FROM Favorite_Songs FS
INNER JOIN Songs S ON FS.song_id = S.song_id
INNER JOIN Artists A ON S.artist_id = A.artist_id
WHERE FS.user_id = 1  -- Parameter: logged-in user ID
)
UNION ALL
(SELECT 
    'playlist' AS item_type,
    FP.playlist_id AS item_id,
    P.name AS item_name,
    U.username AS artist_or_owner,
    'Playlist' AS genre,
    CONCAT(
        (SELECT COUNT(*) FROM Playlist_Songs PS WHERE PS.playlist_id = P.playlist_id),
        ' songs'
    ) AS duration,
    FP.favorited_at
FROM Favorite_Playlists FP
INNER JOIN Playlists P ON FP.playlist_id = P.playlist_id
INNER JOIN Users U ON P.user_id = U.user_id
WHERE FP.user_id = 1  -- Parameter: logged-in user ID
)
ORDER BY favorited_at DESC
LIMIT 20;


-- ============================================================================
-- QUERY 25: Get Favorite Songs Grouped by Genre
-- Purpose: Show favorite music preferences by genre
-- UI Feature: Genre breakdown chart on profile page
-- Tables: Favorite_Songs (FS), Songs (S)
-- Aggregation: COUNT, GROUP BY with percentage
-- ============================================================================
SELECT 
    S.genre,
    COUNT(FS.song_id) AS favorite_count,
    ROUND(COUNT(FS.song_id) * 100.0 / (
        SELECT COUNT(*) 
        FROM Favorite_Songs 
        WHERE user_id = 1
    ), 2) AS percentage_of_favorites,
    GROUP_CONCAT(DISTINCT S.title ORDER BY FS.favorited_at DESC SEPARATOR ', ') AS sample_songs
FROM Favorite_Songs FS
INNER JOIN Songs S ON FS.song_id = S.song_id
WHERE FS.user_id = 1  -- Parameter: logged-in user ID
GROUP BY S.genre
ORDER BY favorite_count DESC;


-- ============================================================================
-- QUERY 26: Get Favorite Artists Based on Favorited Songs
-- Purpose: Show top artists from user's favorite songs
-- UI Feature: "Favorite Artists" section on profile
-- Tables: Favorite_Songs (FS), Songs (S), Artists (A)
-- Aggregation: COUNT, GROUP BY
-- ============================================================================
SELECT 
    A.artist_id,
    A.name AS artist_name,
    COUNT(DISTINCT FS.song_id) AS favorited_songs_count,
    GROUP_CONCAT(DISTINCT S.title ORDER BY FS.favorited_at DESC SEPARATOR ', ') AS favorited_songs,
    MIN(FS.favorited_at) AS first_favorite,
    MAX(FS.favorited_at) AS most_recent_favorite,
    GROUP_CONCAT(DISTINCT S.genre ORDER BY S.genre SEPARATOR ', ') AS genres
FROM Favorite_Songs FS
INNER JOIN Songs S ON FS.song_id = S.song_id
INNER JOIN Artists A ON S.artist_id = A.artist_id
WHERE FS.user_id = 1  -- Parameter: logged-in user ID
GROUP BY A.artist_id, A.name
ORDER BY favorited_songs_count DESC, most_recent_favorite DESC
LIMIT 10;


-- ============================================================================
-- QUERY 27: Toggle Song as Favorite (INSERT/DELETE)
-- Purpose: Add or remove a song from user's favorites
-- UI Feature: Star button click handler
-- Tables: Favorite_Songs
-- Note: Application should check if exists first, then INSERT or DELETE
-- ============================================================================

-- Check if song is already favorited
SELECT COUNT(*) as is_favorited
FROM Favorite_Songs
WHERE user_id = 1 AND song_id = 5;

-- Add to favorites (if not exists)
INSERT INTO Favorite_Songs (user_id, song_id, favorited_at)
VALUES (1, 5, NOW());

-- Remove from favorites (if exists)
DELETE FROM Favorite_Songs
WHERE user_id = 1 AND song_id = 5;


-- ============================================================================
-- QUERY 28: Toggle Playlist as Favorite (INSERT/DELETE)
-- Purpose: Add or remove a playlist from user's favorites
-- UI Feature: Star button on playlist
-- Tables: Favorite_Playlists
-- ============================================================================

-- Check if playlist is already favorited
SELECT COUNT(*) as is_favorited
FROM Favorite_Playlists
WHERE user_id = 1 AND playlist_id = 3;

-- Add playlist to favorites (if not exists)
INSERT INTO Favorite_Playlists (user_id, playlist_id, favorited_at)
VALUES (1, 3, NOW());

-- Remove playlist from favorites (if exists)
DELETE FROM Favorite_Playlists
WHERE user_id = 1 AND playlist_id = 3;
