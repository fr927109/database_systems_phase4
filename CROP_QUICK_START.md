# 🎨 Quick Start: Image Cropping Guide

## Visual Walkthrough

### 1️⃣ Click "Choose image" 
In your Profile tab, click the button to open file browser.

### 2️⃣ Select Your Photo
Pick any image from your device (PNG, JPG, GIF, etc.)

### 3️⃣ See the Crop Modal
```
┌─────────────────────────────────┐
│   Crop your photo        ✕       │
├─────────────────────────────────┤
│                                 │
│   ┌──────────────────────────┐  │
│   │  ●●●●●●●●●●●●●●●●●●●●●  │  │
│   │ ●●● IMAGE TO CROP●●●●●●●  │  │
│   │ ●●●●●●●●●●●●●●●●●●●●●●●  │  │
│   │ ●●●●●●●●●●●●●●●●●●●●●●●  │  │
│   │   ●●●●●●●●●●●●●●●●●●●●  │  │
│   └──────────────────────────┘  │
│                                 │
│   Zoom: [===●────────] 100%     │
│                                 │
│   [Cancel]      [Apply crop]    │
└─────────────────────────────────┘
```

### 4️⃣ Adjust Your Crop
**Drag** the image to move it inside the circle
**Use slider** to zoom in (up to 300%)

### 5️⃣ Click "Apply crop"
Your cropped photo becomes your avatar instantly! ✨

---

## What Happens Behind the Scenes

1. **FileReader API** reads your image
2. **react-easy-crop** renders interactive crop UI
3. **Drag/zoom** adjusts what part to keep
4. **Canvas API** extracts the cropped region
5. **Base64 encoding** converts to text format
6. **State update** displays new avatar
7. **Ready to send** to your backend database

---

## Perfect For

✅ Profile pictures (circular crop)
✅ Removing unwanted background
✅ Focusing on face/subject
✅ Improving photo composition
✅ Quick editing without external tools

---

## Tips & Tricks

**Zoom In** - Get closer to the subject you want
**Center Positioning** - Drag image to center your best angle
**Reset** - Close modal and try again
**Try Multiple** - Upload different images and crop them
**High Quality** - Saved as JPEG 90% quality (great balance)

---

## Save to Database

When you're ready to persist avatars:

```javascript
// Step 1: Crop image (done! ✅)
const croppedBase64 = avatarPreview; // Already stored

// Step 2: Send to backend
fetch('/api/users/123/avatar', {
  method: 'POST',
  body: JSON.stringify({ avatar: croppedBase64 })
})

// Step 3: Backend saves to database
// UPDATE users SET avatar = croppedBase64 WHERE user_id = 123

// Step 4: Load on next login
// SELECT avatar FROM users WHERE user_id = 123
```

---

## Currently Running on http://localhost:5174

**Try It Now:**
1. Log in (click "Log in" if you haven't already)
2. Click your profile avatar (top right)
3. Click "Choose image"
4. Pick any photo and crop it!

Enjoy your new cropping feature! 🎉
