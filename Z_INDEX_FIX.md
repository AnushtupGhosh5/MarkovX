# Z-Index Fix - Shader Background Behind All Content

## Problem
The shader background (floating purple lines) was appearing in front of UI elements, making the interface look messy and unprofessional.

## Solution
Implemented proper z-index layering throughout the application to ensure the shader background always stays behind all content.

---

## 🎯 Changes Made

### 1. Shader Background - Deepest Layer
```tsx
<div style={{ zIndex: -1 }}>
  <canvas className="opacity-20" />
</div>
```

**Changes**:
- Changed from `className="-z-10"` to `style={{ zIndex: -1 }}`
- Reduced opacity from 30% to 20% for more subtlety
- Added `pointer-events-none` to prevent interaction
- Ensures it's always at the very back

### 2. Main Content Area - Middle Layer
```tsx
<main className="z-10 bg-gray-950/50">
  <div className="z-10">
    {/* Content */}
  </div>
</main>
```

**Changes**:
- Added `z-10` to main workspace
- Added semi-transparent background `bg-gray-950/50`
- Content area also has `z-10`

### 3. UI Chrome - Top Layer
```tsx
<header className="z-30 bg-black/40">
<aside className="z-30 bg-black/40">
<footer className="z-30 bg-black/40">
```

**Changes**:
- Header: `z-30` (was z-20)
- Sidebar: `z-30` (was z-20)
- Audio controls: `z-30` (was z-20)
- AI Co-Pilot: `z-30` (was z-20)
- Increased background opacity to `black/40` (was black/30)

### 4. Content Components - Proper Layering
```tsx
<div className="relative z-10">
  {/* Mixer, Lyrics, TextToMusic */}
</div>
```

**Changes**:
- Added `relative z-10` to all content components
- Ensures content is above shader background
- Maintains proper stacking context

---

## 📐 Z-Index Hierarchy

```
Layer 3 (z-30):  UI Chrome
                 ├─ Header
                 ├─ Sidebar
                 ├─ Audio Controls
                 └─ AI Co-Pilot

Layer 2 (z-10):  Content
                 ├─ Main Workspace
                 ├─ Mixer
                 ├─ Lyrics Editor
                 ├─ Text to Music
                 └─ Piano Roll

Layer 1 (z-0):   Default
                 └─ Body background

Layer 0 (z--1):  Background
                 └─ Shader Background
```

---

## 🎨 Background Opacity Updates

### Shader Background
- **Before**: `opacity-30` (30%)
- **After**: `opacity-20` (20%)
- **Reason**: More subtle, less distracting

### UI Chrome Backgrounds
- **Before**: `bg-black/30` (30%)
- **After**: `bg-black/40` (40%)
- **Reason**: Better contrast, clearer separation

### Main Workspace
- **Before**: No background
- **After**: `bg-gray-950/50` (50%)
- **Reason**: Creates layer between shader and content

---

## 🔧 Technical Details

### Inline Style vs Tailwind
```tsx
// Using inline style for z-index: -1
style={{ zIndex: -1 }}

// Tailwind's -z-10 translates to z-index: -10
// Using -1 ensures it's just behind default (0)
```

### Pointer Events
```tsx
pointer-events-none
```
- Prevents shader canvas from capturing clicks
- Ensures all interactions go to UI elements

### Stacking Context
```tsx
relative z-10
```
- Creates new stacking context
- Ensures children stack properly
- Prevents z-index conflicts

---

## ✅ Result

The shader background now:

- **Always stays behind** all UI elements
- **More subtle** with 20% opacity
- **Non-interactive** with pointer-events-none
- **Properly layered** with explicit z-index
- **Consistent** across all pages

The interface now looks clean and professional with the shader background providing ambient visual interest without interfering with content.

---

## 🎯 Testing Checklist

- [x] Shader behind header
- [x] Shader behind sidebar
- [x] Shader behind main content
- [x] Shader behind mixer panels
- [x] Shader behind lyrics editor
- [x] Shader behind text-to-music
- [x] Shader behind AI co-pilot
- [x] Shader behind audio controls
- [x] Shader behind login page
- [x] No interaction with shader canvas
