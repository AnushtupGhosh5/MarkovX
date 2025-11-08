# AI Lyrics Generation Feature

## Overview
Added AI-powered lyrics generation to the Lyrics Editor using Google Gemini API.

---

## 🎯 Features Added

### 1. AI Generation Button
- Located next to "Lyrics" label
- Shows/hides generation prompt
- Clean, minimal design

### 2. Generation Prompt Panel
- Collapsible panel above lyrics textarea
- Input field for theme/mood description
- Generate button with loading state
- Error handling display
- Close button to dismiss

### 3. Smart Prompt Engineering
The AI receives context including:
- User's description/theme
- Song title (if provided)
- Artist name (if provided)
- Instructions for proper formatting

### 4. API Integration
- Uses `/api/gemini` endpoint
- Gemini 2.5 Flash model
- Proper error handling
- Loading states

---

## 🎨 UI Components

### Generate Button
```tsx
<button className="text-xs text-gray-500 hover:text-white">
  <svg>⚡</svg>
  Generate with AI
</button>
```

### Prompt Panel
```tsx
<div className="p-4 bg-white/5 border border-white/10 rounded-md">
  <input placeholder="Describe the theme, mood, or story..." />
  <button>Generate Lyrics</button>
</div>
```

### States
- **Default**: Button visible, panel hidden
- **Active**: Panel visible, button hidden
- **Generating**: Button disabled, loading text
- **Error**: Error message displayed
- **Success**: Lyrics populated, panel closes

---

## 🔧 API Configuration

### Gemini API Route
**Endpoint**: `/api/gemini`
**Method**: POST

**Request**:
```json
{
  "prompt": "Generate song lyrics based on..."
}
```

**Response**:
```json
{
  "success": true,
  "text": "Generated lyrics...",
  "response": "Generated lyrics..."
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error message"
}
```

### Environment Variable
```
GEMINI_API_KEY=your_api_key_here
```

---

## 📝 Prompt Template

```
Generate song lyrics based on this description: {user_description}

Song Title: {title || 'Untitled'}
Artist: {artist || 'Unknown'}

Please format the lyrics with proper structure including 
[Verse], [Chorus], [Bridge] tags. Make it creative and meaningful.
```

---

## 🎯 User Flow

1. **Open Lyrics Editor**
2. **Click "Generate with AI"** button
3. **Enter description** (e.g., "A sad song about lost love")
4. **Click "Generate Lyrics"**
5. **Wait for generation** (loading state)
6. **Lyrics appear** in textarea
7. **Edit as needed**
8. **Save** when done

---

## ✅ Features

- **Smart Context**: Uses song title and artist in generation
- **Proper Formatting**: Generates structured lyrics with tags
- **Error Handling**: Clear error messages
- **Loading States**: Visual feedback during generation
- **Non-intrusive**: Collapsible panel, doesn't block editing
- **Editable**: Generated lyrics can be edited immediately

---

## 🎨 Styling

### Colors
- Button: `text-gray-500 hover:text-white`
- Panel: `bg-white/5 border-white/10`
- Input: `bg-white/5 border-white/10`
- Error: `bg-red-500/10 border-red-500/20 text-red-400`

### Layout
- Panel appears above textarea
- Smooth transitions
- Minimal, clean design
- Matches app aesthetic

---

## 🔑 API Key Setup

The Gemini API key is already configured in `.env.local`:
```
GEMINI_API_KEY=AIzaSyBDJcS-9yeOJbnByCoAQhQ5rkJaTO7Yw4c
```

---

## ✅ Result

The Lyrics Editor now features:
- **AI-powered generation** using Gemini API
- **Clean, minimal UI** that doesn't clutter the interface
- **Smart prompting** with context awareness
- **Proper error handling** and loading states
- **Editable output** - generated lyrics can be modified
- **Professional formatting** with verse/chorus structure

Users can now generate creative, well-structured lyrics with a single click!
