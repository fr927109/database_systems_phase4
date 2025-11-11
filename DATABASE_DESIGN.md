# Music Player Database Design Documentation

## 1. ER/EER Diagram & Relational Schema

### Entity Relationship Diagram (Text Representation)

```
┌─────────────────────────────────────────────────────────────────┐
│                      MUSIC PLAYER DATABASE                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│      USERS       │         │   PLAYLISTS      │
├──────────────────┤         ├──────────────────┤
│ PK: user_id      │────1:N──│ PK: playlist_id  │
│ email (UNIQUE)   │         │ FK: user_id      │
│ username         │         │ name             │
│ password_hash    │         │ description      │
│ created_at       │         │ color_hex        │
│ updated_at       │         │ created_at       │
└──────────────────┘         │ updated_at       │
                             └──────────────────┘
                                      │
                                      │ N:M
                                      │
┌────────────────────────────────┐   │   ┌──────────────────┐
│  PLAYLIST_SONGS (Junction)     │───┴───│     SONGS        │
├────────────────────────────────┤       ├──────────────────┤
│ PK: playlist_song_id           │       │ PK: song_id      │
│ FK: playlist_id                │───────│ FK: artist_id    │
│ FK: song_id                    │       │ title            │
│ track_order                    │       │ duration (sec)   │
│ added_at                       │       │ genre            │
└────────────────────────────────┘       │ release_year     │
                                         │ created_at       │
                                         │ updated_at       │
                                         └──────────────────┘
                                                  │
                                                  │ N:1
                                                  │
                                         ┌──────────────────┐
                                         │     ARTISTS      │
                                         ├──────────────────┤
                                         │ PK: artist_id    │
                                         │ name             │
                                         │ bio              │
                                         │ created_at       │
                                         └──────────────────┘
```

---

## 2. Relational Schema

### Table Definitions

#### Users Table
- **Primary Key:** user_id
- **Attributes:** user_id, email, username, password_hash, created_at, updated_at
- **Constraints:** email UNIQUE, NOT NULL

#### Artists Table
- **Primary Key:** artist_id
- **Attributes:** artist_id, name, bio, created_at
- **Constraints:** name UNIQUE, NOT NULL

#### Songs Table
- **Primary Key:** song_id
- **Foreign Key:** artist_id → Artists(artist_id)
- **Attributes:** song_id, artist_id, title, duration, genre, release_year, created_at, updated_at
- **Constraints:** title NOT NULL, duration NOT NULL

#### Playlists Table
- **Primary Key:** playlist_id
- **Foreign Key:** user_id → Users(user_id)
- **Attributes:** playlist_id, user_id, name, description, color_hex, created_at, updated_at
- **Constraints:** name NOT NULL, user_id NOT NULL

#### Playlist_Songs Table (Junction Table)
- **Primary Key:** playlist_song_id
- **Foreign Keys:** playlist_id → Playlists(playlist_id), song_id → Songs(song_id)
- **Attributes:** playlist_song_id, playlist_id, song_id, track_order, added_at
- **Constraints:** (playlist_id, song_id) UNIQUE to prevent duplicates

---

## 3. Normalization Process

### 3.1 First Normal Form (1NF)
**Objective:** Eliminate repeating groups and ensure atomic values.

**Analysis:**
- ✅ All attributes contain atomic (indivisible) values
- ✅ No repeating groups in any table
- ✅ Each cell contains a single value, not a list or set

**Justification:** 
The schema satisfies 1NF because:
- Songs are separated from Playlists (no repeating song arrays)
- Each attribute is a scalar value (no nested data structures)
- Junction table Playlist_Songs handles the many-to-many relationship atomically

---

### 3.2 Second Normal Form (2NF)
**Objective:** Eliminate partial dependencies (non-key attributes must depend on the entire primary key, not just part of it).

**Analysis:**

#### Potential Issues Resolved:
1. **Playlist_Songs Table:** 
   - Composite PK: (playlist_id, song_id)
   - All non-key attributes (track_order, added_at) depend on BOTH columns
   - ✅ Satisfies 2NF

2. **Users Table:**
   - Single PK: user_id
   - All attributes depend on user_id
   - ✅ Satisfies 2NF

3. **Songs Table:**
   - Single PK: song_id
   - All attributes depend on song_id
   - ✅ Satisfies 2NF

**Functional Dependencies:**
```
Songs:
  song_id → title, duration, genre, release_year, artist_id
  artist_id → artist_name (transitive, handled in Artists table)

Playlists:
  playlist_id → name, description, color_hex, user_id
  user_id → username (transitive, not repeated in Playlists)

Playlist_Songs:
  (playlist_id, song_id) → track_order, added_at
```

**Justification:**
The schema satisfies 2NF because:
- No non-key attributes are partially dependent on composite keys
- All non-key attributes depend on their entire primary key
- Transitive dependencies are minimized through proper table decomposition

---

### 3.3 Third Normal Form (3NF)
**Objective:** Eliminate transitive dependencies (non-key attributes must depend directly on the primary key, not on other non-key attributes).

**Analysis:**

#### Transitive Dependencies Removed:
1. **Artists removed from Songs table:**
   - ❌ BEFORE: Songs table contained artist_name (transitive via artist_id)
   - ✅ AFTER: Songs has FK to Artists; artist_name stored only in Artists table

2. **Users info not duplicated in Playlists:**
   - ❌ BEFORE: Playlists might contain user_email, username
   - ✅ AFTER: Playlists has FK to Users; user details stored only in Users

3. **Playlist info not duplicated in Playlist_Songs:**
   - ❌ BEFORE: Playlist_Songs might contain playlist_name
   - ✅ AFTER: Playlist_Songs has FK to Playlists; playlist details stored only in Playlists

**Functional Dependencies (3NF Check):**
```
For each table, verify: If X → Y and Y is non-key, then X must be a superkey.

Users:
  user_id → email, username, password_hash ✅ (user_id is superkey)

Artists:
  artist_id → name, bio ✅ (artist_id is superkey)

Songs:
  song_id → title, duration, genre, release_year, artist_id ✅ (song_id is superkey)
  artist_id → (FK reference, properly separated) ✅

Playlists:
  playlist_id → name, description, color_hex, user_id ✅ (playlist_id is superkey)
  user_id → (FK reference, properly separated) ✅

Playlist_Songs:
  playlist_song_id → playlist_id, song_id, track_order, added_at ✅ (PK is superkey)
```

**Justification:**
The schema satisfies 3NF because:
- No non-key attribute depends on another non-key attribute
- All transitive dependencies have been eliminated through decomposition
- Each table focuses on one entity/concept
- Foreign keys properly reference other tables without data duplication

---

## 4. Design Rationale

### Why This Schema?

1. **Users Table:** Stores authentication credentials and user metadata
2. **Artists Table:** Separates artist data to avoid duplication in Songs
3. **Songs Table:** Central repository for song information with artist reference
4. **Playlists Table:** User-owned playlists with customization (name, color, description)
5. **Playlist_Songs Junction Table:** Implements N:M relationship between Playlists and Songs
   - Allows songs in multiple playlists
   - Allows playlists to have multiple songs
   - Maintains track order within playlists

### Scalability Considerations

- ✅ Easily extensible (can add Genres, Albums tables later)
- ✅ Efficient indexing on foreign keys and email
- ✅ No data redundancy → lower storage, easier updates
- ✅ Supports future features (user favorites, song ratings, collaborations)

---

## 5. Summary Table

| Aspect | Status | Notes |
|--------|--------|-------|
| **1NF** | ✅ Pass | All values atomic, no repeating groups |
| **2NF** | ✅ Pass | No partial key dependencies |
| **3NF** | ✅ Pass | No transitive dependencies |
| **BCNF** | ✅ Pass | Every determinant is a superkey |
| **Atomicity** | ✅ Pass | Each cell contains single value |
| **Scalability** | ✅ Good | Normalized for future expansion |

