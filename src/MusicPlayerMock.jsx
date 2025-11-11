import React, { useMemo, useState, useRef, useCallback } from "react";
import { Plus, Search, Music, Play, Pause, SkipForward, SkipBack, ListPlus, Headphones, Shuffle, Repeat, Volume2, LogIn, Star, Users, Library, User, Lock, Link2, Trash2, SettingsIcon, Maximize2, Minimize2 } from "lucide-react";
import Cropper from "react-easy-crop";

// --- helper data ---
const DEMO_SONGS = [
  { id: 1, title: "Neon Nights", artist: "Ava Lumen", duration: "3:21" },
  { id: 2, title: "Midnight Engine", artist: "Violet Drive", duration: "4:08" },
  { id: 3, title: "Glass River", artist: "Kairo", duration: "2:59" },
  { id: 4, title: "Orbiting", artist: "Sky Lanterns", duration: "3:42" },
  { id: 5, title: "Paper Kites", artist: "North & Pine", duration: "3:10" },
];

const DEMO_ARTISTS = [
  { id: 1, name: "Ava Lumen" },
  { id: 2, name: "Violet Drive" },
  { id: 3, name: "Kairo" },
  { id: 4, name: "Sky Lanterns" },
  { id: 5, name: "North & Pine" },
];

const DEMO_PLAYLISTS = [];

export default function MusicPlayerMock() {
  const [authed, setAuthed] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [registeredAccounts, setRegisteredAccounts] = useState(["demo@example.com", "test@example.com"]);
  const [authError, setAuthError] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  const [playlists, setPlaylists] = useState(DEMO_PLAYLISTS);
  const [currentTrack, setCurrentTrack] = useState(DEMO_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [newPlaylistImage, setNewPlaylistImage] = useState(null); // base64 image
  const [playlistImagePreview, setPlaylistImagePreview] = useState(null); // preview for upload
  const [selectedSongsForPlaylist, setSelectedSongsForPlaylist] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState({});
  const [showProfile, setShowProfile] = useState(false);
  const [profileTab, setProfileTab] = useState("profile"); // "profile" or "preferences"
  const [userName, setUserName] = useState("Demo User");
  const [username, setUsername] = useState("demouser");
  const [userBio, setUserBio] = useState("");
  const [theme, setTheme] = useState("System");
  const [avatarPreview, setAvatarPreview] = useState(null); // null = use initials, or base64 image string
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const canvasRef = useRef(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCropImage(event.target?.result);
        setShowCropModal(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImage = useCallback(async () => {
    if (!cropImage || !croppedAreaPixels || !canvasRef.current) return;

    const image = new Image();
    image.src = cropImage;

    image.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      const croppedImage = canvas.toDataURL("image/jpeg", 0.9);
      setAvatarPreview(croppedImage);
      setShowCropModal(false);
      setCropImage(null);
    };
  }, [cropImage, croppedAreaPixels]);

  const filteredSongs = useMemo(
    () =>
      DEMO_SONGS.filter(
        (s) => s.title.toLowerCase().includes(query.toLowerCase()) || s.artist.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  const filteredArtists = useMemo(
    () => DEMO_ARTISTS.filter((a) => a.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  function handleCreatePlaylist() {
    setShowCreatePlaylist(true);
    setNewPlaylistName("");
    setNewPlaylistDesc("");
    setSelectedSongsForPlaylist([]);
    setNewPlaylistImage(null);
    setPlaylistImagePreview(null);
  }

  function handleConfirmCreatePlaylist(e) {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    
    const n = playlists.length + 1;
    const colors = ["#a855f7", "#10b981", "#f59e0b", "#3b82f6", "#f43f5e"];
    const playlistId = `p${n}`;
    const next = { 
      id: playlistId, 
      name: newPlaylistName, 
      count: selectedSongsForPlaylist.length, 
      color: colors[n % colors.length],
      image: newPlaylistImage // Add custom image if uploaded
    };
    setPlaylists((p) => [next, ...p]);
    
    // Save the songs for this playlist
    const songsInPlaylist = DEMO_SONGS.filter((s) => selectedSongsForPlaylist.includes(s.id));
    setPlaylistSongs((prev) => ({ ...prev, [playlistId]: songsInPlaylist }));
    
    // Reset and close modal
    setShowCreatePlaylist(false);
    setNewPlaylistName("");
    setNewPlaylistDesc("");
    setSelectedSongsForPlaylist([]);
    setNewPlaylistImage(null);
    setPlaylistImagePreview(null);
  }

  function toggleSongForPlaylist(songId) {
    setSelectedSongsForPlaylist((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  }

  function handlePlaylistImageChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        setPlaylistImagePreview(base64);
        setNewPlaylistImage(base64);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError("");
    
    if (authMode === "login") {
      // Check if account exists
      if (registeredAccounts.includes(authEmail.toLowerCase())) {
        // Account exists - proceed with login
        setLoginEmail(authEmail);
        setAuthed(true);
        setShowAuth(false);
        setAuthEmail("");
        setAuthPassword("");
      } else {
        // Account doesn't exist - redirect to signup
        setAuthError("Account not found. Please create a new account.");
        setAuthMode("signup");
      }
    } else {
      // Signup mode - create new account
      if (registeredAccounts.includes(authEmail.toLowerCase())) {
        setAuthError("This email is already registered. Please log in instead.");
      } else {
        // Add new account
        setRegisteredAccounts([...registeredAccounts, authEmail.toLowerCase()]);
        setLoginEmail(authEmail);
        setAuthed(true);
        setShowAuth(false);
        setAuthEmail("");
        setAuthPassword("");
        setAuthError("");
      }
    }
  }

  return (
    <div style={{ background: "#F8F7F3" }} className="min-h-screen w-full text-[#24354A]">
      {/* Header */}
      <header className="header sticky top-0 z-20">
        <div className="header-content">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Headphones style={{ width: "24px", height: "24px" }} />
            <span style={{ fontWeight: 600, letterSpacing: "0.05em" }}>McMusic Hub</span>
          </div>
          <div className="header-right">
            {authed ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button 
                  className="btn btn-icon" 
                  onClick={() => { setShowProfile(true); setProfileTab("profile"); }}
                  style={{ padding: "0", background: "transparent", border: "none" }}
                >
                  <div 
                    key={avatarPreview}
                    className="avatar avatar-sm" 
                    style={{ 
                      background: avatarPreview ? "white" : "white", 
                      border: "2px solid #10b981", 
                      color: "#24354A", 
                      cursor: "pointer",
                      backgroundImage: avatarPreview ? `url(${avatarPreview})` : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700
                    }}
                  >
                    {!avatarPreview && "FR"}
                  </div>
                </button>
                <button className="btn btn-secondary" onClick={() => {setAuthed(false); setShowAuth(true); setAuthMode("login");}}>Sign out</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button className="btn btn-secondary btn-small" onClick={() => {setAuthMode("login"); setShowAuth(true);}}><LogIn style={{ width: "16px", height: "16px", marginRight: "4px" }}/>Log in</button>
                <button className="btn btn-primary btn-small" onClick={() => {setAuthMode("signup"); setShowAuth(true);}}><Plus style={{ width: "16px", height: "16px", marginRight: "4px" }}/>Sign up</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="main-grid" style={{ paddingTop: "16px", paddingBottom: "120px" }}>
        {/* Sidebar: Playlists */}
        <aside>
          <div className="card" style={{ borderRadius: "16px" }}>
            <div className="card-header">
              <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Library style={{ width: "20px", height: "20px" }} /> Your Playlists
              </h3>
            </div>
            <div className="card-content">
              <button className="btn btn-primary btn-full-width" onClick={handleCreatePlaylist} style={{ marginBottom: "12px" }}>
                <ListPlus style={{ width: "16px", height: "16px", marginRight: "8px" }}/>New playlist
              </button>
              <div className="scroll-area" style={{ height: "420px" }}>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                  {playlists.map((p) => (
                    <li key={p.id} className="list-item" style={{ cursor: "pointer" }} onClick={() => setSelectedPlaylist(p)}>
                      <div className="list-item-icon" style={{ background: p.color, overflow: "hidden" }}>
                        {p.image ? (
                          <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <Music style={{ width: "16px", height: "16px", color: "white" }}/>
                        )}
                      </div>
                      <div className="list-item-content">
                        <div className="list-item-title">{p.name}</div>
                        <div className="list-item-subtitle">{p.count} songs</div>
                      </div>
                      <button className="btn btn-icon" style={{ padding: "4px" }} onClick={(e) => { e.stopPropagation(); }}>
                        <Star style={{ width: "16px", height: "16px" }}/>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Search Card */}
          <div className="card" style={{ borderRadius: "16px" }}>
            <div className="card-header">
              <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Search style={{ width: "20px", height: "20px" }} /> Browse & Search
              </h3>
            </div>
            <div className="card-content">
              <div style={{ display: "flex", flexDirection: "row", gap: "8px", alignItems: "stretch", flexWrap: "wrap" }}>
                <div className="input-wrapper" style={{ flex: 1 }}>
                  <Search style={{ width: "16px", height: "16px" }} />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search songs, artists..." />
                </div>
                <div className="tabs-list">
                  {["search", "songs", "artists"].map((tab) => (
                    <button
                      key={tab}
                      className={`tab-trigger ${activeTab === tab ? "active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="separator" style={{ margin: "16px 0" }}></div>

              {/* Results */}
              <div>
                {activeTab === "search" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                    <div className="card" style={{ borderRadius: "16px" }}>
                      <div className="card-header"><h4 className="card-title">Top Songs</h4></div>
                      <div className="card-content">
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                          {filteredSongs.map((s) => (
                            <li key={s.id} className="list-item">
                              <div className="list-item-icon" style={{ background: "#E6E2D9" }}>
                                <Music style={{ width: "16px", height: "16px" }}/>
                              </div>
                              <div className="list-item-content">
                                <div className="list-item-title">{s.title}</div>
                                <div className="list-item-subtitle">{s.artist}</div>
                              </div>
                              <span style={{ fontSize: "12px", color: "#6b7280", marginRight: "8px" }}>{s.duration}</span>
                              <button className="btn btn-secondary btn-small" onClick={() => {setCurrentTrack(s); setIsPlaying(true);}}>
                                <Play style={{ width: "16px", height: "16px", marginRight: "4px" }}/> Play
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="card" style={{ borderRadius: "16px" }}>
                      <div className="card-header"><h4 className="card-title">Top Artists</h4></div>
                      <div className="card-content">
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                          {filteredArtists.map((a) => (
                            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderRadius: "8px", background: "#F8F7F3", minWidth: 0 }}>
                              <div className="avatar avatar-sm" style={{ background: "#24354A", color: "white", fontWeight: 600, flexShrink: 0 }}>
                                {a.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                                <div style={{ fontSize: "11px", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <Users style={{ width: "12px", height: "12px" }}/> Artist
                                </div>
                              </div>
                              <button className="btn btn-icon" style={{ padding: "4px", flexShrink: 0 }}>
                                <Play style={{ width: "14px", height: "14px" }}/>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "songs" && (
                  <div style={{ border: "1px solid #E6E2D9", borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", background: "#F1EEE6", padding: "8px 16px" }}>
                      <div>Title</div>
                      <div>Artist</div>
                      <div style={{ textAlign: "right" }}>Duration</div>
                    </div>
                    <div className="scroll-area" style={{ height: "360px" }}>
                      {filteredSongs.map((s, i) => (
                        <div key={s.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr", alignItems: "center", padding: "8px 16px", borderBottom: "1px solid #E6E2D9" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button className="btn btn-icon" style={{ padding: "4px" }} onClick={() => {setCurrentTrack(s); setIsPlaying(true);}}>
                              <Play style={{ width: "16px", height: "16px" }}/>
                            </button>
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i + 1}. {s.title}</span>
                          </div>
                          <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.artist}</div>
                          <div style={{ textAlign: "right" }}>{s.duration}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "artists" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
                    {filteredArtists.map((a) => (
                      <div key={a.id} className="card" style={{ borderRadius: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
                        <div className="avatar avatar-lg" style={{ background: "#24354A", color: "white", fontWeight: 600 }}>
                          {a.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>Artist profile</div>
                        </div>
                        <button className="btn btn-secondary btn-small"><Play style={{ width: "16px", height: "16px", marginRight: "4px" }}/> Play</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Now Playing */}
          <div className="card" style={{ borderRadius: "16px" }}>
            <div className="card-content">
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "#E6E2D9", display: "grid", placeItems: "center" }}>
                  <Music style={{ width: "24px", height: "24px" }}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentTrack.title}</div>
                  <div style={{ fontSize: "14px", color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentTrack.artist}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button className="btn btn-icon"><Shuffle style={{ width: "16px", height: "16px" }}/></button>
                  <button className="btn btn-icon"><Repeat style={{ width: "16px", height: "16px" }}/></button>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <button className="btn btn-secondary btn-icon" style={{ borderRadius: "50%" }}><SkipBack style={{ width: "20px", height: "20px" }}/></button>
                <button className="btn btn-primary" onClick={() => setIsPlaying(!isPlaying)} style={{ borderRadius: "50%", width: "48px", height: "48px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isPlaying ? <Pause style={{ width: "20px", height: "20px" }}/> : <Play style={{ width: "20px", height: "20px" }}/>}
                </button>
                <button className="btn btn-secondary btn-icon" style={{ borderRadius: "50%" }}><SkipForward style={{ width: "20px", height: "20px" }}/></button>
                <div style={{ marginLeft: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#6b7280" }}>
                  <Volume2 style={{ width: "16px", height: "16px" }}/>
                  <div style={{ width: "128px", height: "6px", background: "#E6E2D9", borderRadius: "9999px" }}>
                    <div style={{ width: "50%", height: "100%", background: "#6b7280", borderRadius: "9999px" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Player Bar */}
      <footer className="footer-player">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#E6E2D9", display: "grid", placeItems: "center" }}>
            <Music style={{ width: "20px", height: "20px" }}/>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "14px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentTrack.title}</div>
            <div style={{ fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentTrack.artist}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button className="btn btn-icon"><SkipBack style={{ width: "16px", height: "16px" }}/></button>
            <button className="btn btn-primary btn-icon" style={{ borderRadius: "50%" }}>{isPlaying ? <Pause style={{ width: "16px", height: "16px" }}/> : <Play style={{ width: "16px", height: "16px" }}/>}</button>
            <button className="btn btn-icon"><SkipForward style={{ width: "16px", height: "16px" }}/></button>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <div className="dialog-overlay open">
          <div className="dialog-content">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              {authMode === "login" ? <LogIn style={{ width: "20px", height: "20px" }}/> : <Plus style={{ width: "20px", height: "20px" }}/>}
              <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>
                {authMode === "login" ? "Log in to McMusic Hub" : "Create your account"}
              </h2>
            </div>
            <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {authError && (
                <div style={{ padding: "8px 12px", background: "#FEE2E2", color: "#991B1B", borderRadius: "6px", fontSize: "12px", border: "1px solid #FCA5A5" }}>
                  {authError}
                </div>
              )}
              <div className="dialog-form-group">
                <label style={{ fontSize: "12px", color: "white" }}>Email</label>
                <input 
                  required 
                  type="email" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="you@example.com" 
                  style={{ background: "#F1EEE6", border: "1px solid #E6E2D9", color: "#24354A" }}
                />
              </div>
              <div className="dialog-form-group">
                <label style={{ fontSize: "12px", color: "white" }}>Password</label>
                <input 
                  required 
                  type="password" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••" 
                  style={{ background: "#F1EEE6", border: "1px solid #E6E2D9", color: "#24354A" }}
                />
              </div>
              {authMode === "signup" && (
                <div className="dialog-form-group">
                  <label style={{ fontSize: "12px", color: "white" }}>Confirm Password</label>
                  <input required type="password" placeholder="••••••••" style={{ background: "#F1EEE6", border: "1px solid #E6E2D9", color: "#24354A" }}/>
                </div>
              )}
              <div className="dialog-actions">
                <button type="submit" className="btn" style={{ background: "#D9B86C", color: "#24354A", fontWeight: 600, padding: "8px 24px" }}>
                  {authMode === "login" ? "Log in" : "Sign up"}
                </button>
                <button type="button" className="btn" style={{ background: "transparent", color: "white", textDecoration: "underline", padding: "8px 0" }} onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }}>
                  {authMode === "login" ? "Create account" : "I have an account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreatePlaylist && (
        <div className="dialog-overlay open">
          <div className="dialog-content" style={{ maxHeight: "90vh", overflowY: "auto", maxWidth: "600px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 600, margin: 0, color: "white" }}>Create playlist</h2>
              <button type="button" className="btn" style={{ background: "transparent", color: "white", padding: "4px", textDecoration: "underline" }} onClick={() => setShowCreatePlaylist(false)}>Close</button>
            </div>

            <form onSubmit={handleConfirmCreatePlaylist} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Name Field */}
              <div className="dialog-form-group">
                <label style={{ fontSize: "12px", color: "white", fontWeight: 600, textTransform: "uppercase" }}>NAME</label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My playlist"
                  style={{ background: "white", border: "2px dashed #E6E2D9", color: "#24354A", padding: "10px 12px", borderRadius: "6px" }}
                />
              </div>

              {/* Description Field */}
              <div className="dialog-form-group">
                <label style={{ fontSize: "12px", color: "white", fontWeight: 600, textTransform: "uppercase" }}>DESCRIPTION</label>
                <input
                  type="text"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Optional"
                  style={{ background: "white", border: "2px dashed #E6E2D9", color: "#24354A", padding: "10px 12px", borderRadius: "6px" }}
                />
              </div>

              {/* Playlist Image Upload */}
              <div className="dialog-form-group">
                <label style={{ fontSize: "12px", color: "white", fontWeight: 600, textTransform: "uppercase" }}>PLAYLIST PICTURE</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {playlistImagePreview && (
                    <div style={{ width: "100%", height: "150px", borderRadius: "8px", background: "white", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={playlistImagePreview} alt="Playlist preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePlaylistImageChange}
                    style={{ 
                      background: "white", 
                      border: "2px dashed #E6E2D9", 
                      color: "#24354A", 
                      padding: "10px 12px", 
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  />
                  {playlistImagePreview && (
                    <button
                      type="button"
                      onClick={() => { setPlaylistImagePreview(null); setNewPlaylistImage(null); }}
                      style={{ background: "#dc2626", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", fontWeight: 500 }}
                    >
                      Remove image
                    </button>
                  )}
                </div>
              </div>

              {/* Add Songs Field */}
              <div className="dialog-form-group">
                <label style={{ fontSize: "12px", color: "white", fontWeight: 600, textTransform: "uppercase" }}>ADD SONGS</label>
                <input
                  type="text"
                  placeholder="Search songs or artists"
                  style={{ background: "white", border: "2px dashed #E6E2D9", color: "#24354A", padding: "10px 12px", borderRadius: "6px" }}
                />
              </div>

              {/* Song List */}
              <div style={{ background: "white", border: "1px solid #E6E2D9", borderRadius: "6px", maxHeight: "300px", overflowY: "auto", padding: "0" }}>
                {DEMO_SONGS.map((song) => (
                  <div
                    key={song.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      borderBottom: "1px solid #E6E2D9",
                      cursor: "pointer",
                      background: selectedSongsForPlaylist.includes(song.id) ? "#F0F0F0" : "transparent"
                    }}
                    onClick={() => toggleSongForPlaylist(song.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSongsForPlaylist.includes(song.id)}
                      onChange={() => toggleSongForPlaylist(song.id)}
                      style={{ cursor: "pointer" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: "#24354A" }}>{song.title} — {song.artist}</div>
                    </div>
                    <span style={{ fontSize: "12px", color: "#6b7280", marginLeft: "auto" }}>{song.duration}</span>
                  </div>
                ))}
              </div>

              {/* Selected Count */}
              <div style={{ fontSize: "13px", color: "white", marginTop: "8px" }}>
                {selectedSongsForPlaylist.length === 0 ? "No songs selected yet." : `${selectedSongsForPlaylist.length} song(s) selected`}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
                <button
                  type="button"
                  className="btn"
                  style={{ background: "white", color: "#24354A", border: "1px solid #E6E2D9", padding: "8px 20px", fontWeight: 500 }}
                  onClick={() => setShowCreatePlaylist(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: "#24354A", color: "white", padding: "8px 20px", fontWeight: 600 }}
                >
                  Create playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playlist Detail View Modal */}
      {selectedPlaylist && (
        <div className="dialog-overlay open" onClick={() => setSelectedPlaylist(null)}>
          <div 
            className="dialog-content" 
            style={{ maxHeight: "90vh", overflowY: "auto", maxWidth: "700px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "12px", background: selectedPlaylist.color, display: "grid", placeItems: "center", overflow: "hidden" }}>
                {selectedPlaylist.image ? (
                  <img src={selectedPlaylist.image} alt={selectedPlaylist.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <Music style={{ width: "40px", height: "40px", color: "white" }}/>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px 0", color: "white" }}>{selectedPlaylist.name}</h2>
                <p style={{ fontSize: "14px", color: "#b0b0b0", margin: 0 }}>{selectedPlaylist.count} songs</p>
              </div>
              <button 
                className="btn" 
                style={{ background: "transparent", color: "white", padding: "4px", textDecoration: "underline", fontSize: "14px" }}
                onClick={() => setSelectedPlaylist(null)}
              >
                Close
              </button>
            </div>

            {/* Songs List */}
            <div>
              {playlistSongs[selectedPlaylist.id] && playlistSongs[selectedPlaylist.id].length > 0 ? (
                <div style={{ border: "1px solid #E6E2D9", borderRadius: "8px", overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", background: "#2a3a4a", padding: "10px 14px", color: "#b0b0b0", fontWeight: 600 }}>
                    <div>#</div>
                    <div>Title & Artist</div>
                    <div style={{ textAlign: "right" }}>Duration</div>
                  </div>
                  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {playlistSongs[selectedPlaylist.id].map((song, idx) => (
                      <div
                        key={song.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1.5fr 1fr",
                          alignItems: "center",
                          padding: "10px 14px",
                          borderBottom: "1px solid #E6E2D9",
                          cursor: "pointer",
                          transition: "background 0.2s",
                          background: currentTrack.id === song.id ? "rgba(168, 85, 247, 0.1)" : "transparent"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(168, 85, 247, 0.05)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = currentTrack.id === song.id ? "rgba(168, 85, 247, 0.1)" : "transparent"}
                        onClick={() => { setCurrentTrack(song); setIsPlaying(true); }}
                      >
                        <div style={{ fontSize: "13px", color: "#b0b0b0" }}>{idx + 1}</div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 500, color: "white" }}>{song.title}</div>
                          <div style={{ fontSize: "12px", color: "#b0b0b0" }}>{song.artist}</div>
                        </div>
                        <div style={{ textAlign: "right", fontSize: "13px", color: "#b0b0b0" }}>{song.duration}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#b0b0b0" }}>
                  <Music style={{ width: "48px", height: "48px", margin: "0 auto 16px", opacity: 0.5 }}/>
                  <p>No songs in this playlist yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Crop Image Modal */}
      {showCropModal && cropImage && (
        <div className="dialog-overlay open crop-overlay" onClick={() => setShowCropModal(false)}>
          <div 
            className="dialog-content" 
            style={{ maxWidth: "600px", background: "#F8F7F3", color: "#24354A" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #E6E2D9" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Crop your photo</h2>
              <button 
                className="btn" 
                style={{ background: "transparent", color: "#24354A", padding: "4px", cursor: "pointer" }}
                onClick={() => setShowCropModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Crop Preview */}
            <div className="crop-container">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={true}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Zoom Slider */}
            <div className="crop-controls">
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "8px" }}>
                  Zoom
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="crop-zoom-slider"
                />
                <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>
                  {Math.round(zoom * 100)}%
                </div>
              </div>

              {/* Action Buttons */}
              <div className="crop-buttons">
                <button
                  className="btn"
                  style={{ background: "white", color: "#24354A", border: "1px solid #E6E2D9", padding: "8px 20px", fontWeight: 500 }}
                  onClick={() => setShowCropModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ background: "#a855f7", color: "white", padding: "8px 20px", fontWeight: 600, border: "none" }}
                  onClick={getCroppedImage}
                >
                  Apply crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="dialog-overlay open" onClick={() => setShowProfile(false)}>
          <div 
            className="dialog-content" 
            style={{ maxHeight: "90vh", overflowY: "auto", maxWidth: "800px", background: "#F8F7F3", color: "#24354A" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #E6E2D9" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Profile</h2>
              <button 
                className="btn" 
                style={{ background: "transparent", color: "#24354A", padding: "4px", cursor: "pointer" }}
                onClick={() => setShowProfile(false)}
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "2px solid #E6E2D9" }}>
              <button
                onClick={() => setProfileTab("profile")}
                style={{
                  padding: "12px 0",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: profileTab === "profile" ? "#a855f7" : "#9ca3af",
                  borderBottom: profileTab === "profile" ? "2px solid #a855f7" : "none",
                  paddingBottom: profileTab === "profile" ? "10px" : "12px",
                  marginBottom: "-2px"
                }}
              >
                Profile
              </button>
              <button
                onClick={() => setProfileTab("preferences")}
                style={{
                  padding: "12px 0",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: profileTab === "preferences" ? "#a855f7" : "#9ca3af",
                  borderBottom: profileTab === "preferences" ? "2px solid #a855f7" : "none",
                  paddingBottom: profileTab === "preferences" ? "10px" : "12px",
                  marginBottom: "-2px"
                }}
              >
                Preferences
              </button>
            </div>

            {/* Profile Tab */}
            {profileTab === "profile" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Left: Avatar and Basic Info */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", borderRight: "1px solid #E6E2D9", paddingRight: "24px" }}>
                  <div 
                    key={avatarPreview}
                    className="avatar"
                    style={{ 
                      background: avatarPreview ? "#f5f5f5" : "linear-gradient(135deg, #a855f7, #10b981)",
                      width: "120px",
                      height: "120px",
                      fontSize: "48px",
                      fontWeight: 700,
                      color: avatarPreview ? "#24354A" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "12px",
                      backgroundImage: avatarPreview ? `url(${avatarPreview})` : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: "2px solid #E6E2D9",
                      position: "relative"
                    }}
                  >
                    {!avatarPreview && "FR"}
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: "none" }}
                      id="avatar-upload"
                    />
                    <label 
                      htmlFor="avatar-upload"
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        background: "#24354A",
                        color: "white",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "none",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#374151"}
                      onMouseLeave={(e) => e.target.style.background = "#24354A"}
                    >
                      Choose image
                    </label>
                  </div>
                  {avatarPreview && (
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setAvatarPreview(null)}
                      style={{ fontSize: "12px", padding: "4px 8px", color: "#ef4444", border: "1px solid #fecaca" }}
                    >
                      Remove image
                    </button>
                  )}

                  {/* Name */}
                  <div style={{ width: "100%" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>NAME</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #E6E2D9",
                        borderRadius: "6px",
                        fontSize: "14px",
                        background: "white"
                      }}
                    />
                  </div>

                  {/* Username */}
                  <div style={{ width: "100%" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>USERNAME</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #E6E2D9",
                        borderRadius: "6px",
                        fontSize: "14px",
                        background: "white"
                      }}
                    />
                  </div>
                </div>

                {/* Right: Email and Bio */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Email */}
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>EMAIL (READ-ONLY)</label>
                    <input
                      type="email"
                      value={loginEmail}
                      disabled
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #E6E2D9",
                        borderRadius: "6px",
                        fontSize: "14px",
                        background: "#f5f5f5",
                        color: "#9ca3af",
                        cursor: "not-allowed"
                      }}
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>BIO</label>
                    <textarea
                      value={userBio}
                      onChange={(e) => setUserBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "1px solid #E6E2D9",
                        borderRadius: "6px",
                        fontSize: "14px",
                        background: "white",
                        fontFamily: "inherit",
                        minHeight: "100px",
                        resize: "vertical"
                      }}
                    />
                  </div>

                  {/* Save Changes Button */}
                  <button className="btn btn-primary" style={{ marginTop: "16px", background: "#a855f7", border: "none", padding: "8px 20px", fontWeight: 600 }}>
                    Save changes
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {profileTab === "preferences" && (
              <div>
                {/* Theme Section */}
                <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid #E6E2D9" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", textTransform: "uppercase", color: "#6b7280" }}>THEME</h3>
                  <select 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value)}
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      padding: "10px 12px",
                      border: "1px solid #E6E2D9",
                      borderRadius: "6px",
                      fontSize: "14px",
                      background: "white",
                      cursor: "pointer"
                    }}
                  >
                    <option>System</option>
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                  <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>Choose how you'd like McMusic Hub to look</p>
                </div>

                {/* Connected Services Section */}
                <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid #E6E2D9" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", textTransform: "uppercase", color: "#6b7280" }}>CONNECTED SERVICES</h3>
                  
                  {/* Spotify */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "12px", background: "#f5f5f5", borderRadius: "8px" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "#24354A" }}>Spotify</div>
                      <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>Not connected</div>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: "6px 16px", fontSize: "13px", fontWeight: 600 }}>
                      Connect
                    </button>
                  </div>

                  {/* YouTube */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f5f5f5", borderRadius: "8px" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "#24354A" }}>YouTube</div>
                      <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>Not connected</div>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: "6px 16px", fontSize: "13px", fontWeight: 600 }}>
                      Connect
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", textTransform: "uppercase", color: "#ef4444" }}>DANGER ZONE</h3>
                  <button 
                    className="btn"
                    style={{ 
                      padding: "8px 16px", 
                      border: "2px solid #ef4444", 
                      color: "#ef4444", 
                      background: "transparent",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Delete account
                  </button>
                  <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>This is a wireframe-only action.</p>
                </div>
              </div>
            )}

            {/* Close Button at Bottom */}
            <div style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid #E6E2D9", display: "flex", justifyContent: "flex-end" }}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowProfile(false)}
                style={{ background: "#a855f7", border: "none", padding: "8px 24px", fontWeight: 600 }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for image cropping */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

// --- lightweight runtime checks (non-blocking) ---
try {
  const byTitle = DEMO_SONGS.filter((s) => s.title.toLowerCase().includes("neon"));
  console.assert(byTitle.length === 1 && byTitle[0].artist === "Ava Lumen", "Song filter basic check failed");
  const artistHit = DEMO_ARTISTS.filter((a) => a.name.toLowerCase().includes("kairo"));
  console.assert(artistHit.length === 1 && artistHit[0].name === "Kairo", "Artist filter basic check failed");
} catch {}
