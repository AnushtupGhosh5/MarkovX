# Lyrics Editor Documentation

## Overview

The Lyrics Editor is a professional songwriting tool with AI-powered generation, real-time analysis, and intelligent rhyme detection.

## ✨ Key Features

### 🎵 Multi-Section Management
- **Section Types**: Intro, Verse, Pre-Chorus, Chorus, Bridge, Outro
- **Unlimited Sections**: Add as many sections as needed
- **Easy Navigation**: Click sections to switch between them
- **Section Reordering**: Organize your song structure

### 🤖 AI-Powered Generation
- **Full Song Generation**: Create complete songs with verses, choruses, and bridges
- **Section Generation**: Generate specific sections (verse, chorus, etc.)
- **Single Line Generation**: Get AI suggestions for individual lines
- **Context-Aware**: Uses your session's tempo, key, and mood
- **Quick Prompts**: Pre-made prompts for common song types

### 📊 Real-Time Analysis

#### Syllable Counting
- Automatic syllable detection for each line
- Total syllable count per section
- Average syllables per line
- Helps maintain consistent rhythm

#### Rhyme Detection
- Automatic rhyme scheme detection (AABB, ABAB, etc.)
- Visual rhyme indicators
- Rhyme sound extraction
- Color-coded rhyme groups

#### Line-by-Line Breakdown
- Individual line analysis
- Syllable count per line
- Rhyme sound identification
- Line numbering for reference

### 📝 Professional Editor
- **Clean Interface**: Distraction-free writing environment
- **Serif Font**: Easy-to-read typography for lyrics
- **Auto-Save**: Changes saved automatically to session
- **Copy All**: Export all lyrics with one click
- **Multi-Line Support**: Natural line-by-line editing

### 📈 Song Statistics
- Total sections count
- Total lines count
- Total syllables count
- Average syllables per line
- Real-time updates

## 🎨 User Interface

### Layout
```
┌─────────────────────────────────────────────────────────┐
│ Header: Title, Stats, AI Generate, Copy All            │
├──────────┬──────────────────────────────┬──────────────┤
│ Section  │ Editor Area                  │ AI Tools     │
│ List     │ - Section Header             │ - Quick      │
│          │ - Text Editor                │   Prompts    │
│ - Verse  │ - Line Analysis              │ - Writing    │
│ - Chorus │                              │   Tips       │
│ - Bridge │                              │ - Stats      │
│          │                              │              │
└──────────┴──────────────────────────────┴──────────────┘
```

### Color Coding
- **Blue**: Syllable count indicators
- **Purple**: Rhyme sound indicators
- **Gradient**: AI generation buttons
- **White/Gray**: Text and UI elements

## 🚀 How to Use

### Opening the Editor
1. Click the **Lyrics icon** (document) in the left sidebar
2. Or click **"Open Lyrics"** from the welcome screen

### Writing Lyrics

#### Manual Writing
1. Select a section from the left panel
2. Type your lyrics in the editor
3. Press Enter for new lines
4. Analysis updates automatically

#### AI Generation
1. Click **"✨ AI Generate"** button
2. Choose generation mode:
   - **Full Song**: Complete song structure
   - **Section**: Current section only
   - **Single Line**: One line at a time
3. Enter your prompt (theme, mood, story)
4. Click **"✨ Generate Lyrics"**
5. AI creates lyrics based on your input

### Managing Sections

#### Adding Sections
1. Click **"+ Add Section"** button
2. New section appears in the list
3. Change section type from dropdown

#### Changing Section Type
1. Click the dropdown in section card
2. Select: Intro, Verse, Pre-Chorus, Chorus, Bridge, or Outro
3. Type updates automatically

#### Deleting Sections
1. Click the **X button** on section card
2. Section is removed immediately
3. Selection moves to first available section

### Using Quick Prompts
1. Find **"Quick Prompts"** in right sidebar
2. Click any prompt to use it
3. Modify in the generation dialog
4. Generate lyrics

### Analyzing Your Lyrics

#### Syllable Analysis
- View syllable count for each line
- Check total syllables per section
- Maintain consistent rhythm
- Match syllables to melody

#### Rhyme Scheme
- See rhyme pattern (AABB, ABAB, etc.)
- Identify rhyming lines
- Create consistent patterns
- Experiment with different schemes

#### Line Breakdown
- Review each line individually
- Check syllable distribution
- Verify rhyme sounds
- Edit specific lines

## 💡 Writing Tips

### Song Structure
```
Typical Pop Song:
- Intro (optional)
- Verse 1
- Pre-Chorus (optional)
- Chorus
- Verse 2
- Pre-Chorus
- Chorus
- Bridge
- Chorus (final)
- Outro (optional)
```

### Rhyme Schemes
- **AABB**: Couplets (lines 1-2 rhyme, 3-4 rhyme)
- **ABAB**: Alternating (lines 1-3 rhyme, 2-4 rhyme)
- **ABCB**: Simple (only lines 2-4 rhyme)
- **AAAA**: Monorhyme (all lines rhyme)

### Syllable Guidelines
- **Verses**: 8-12 syllables per line
- **Chorus**: 6-10 syllables per line (catchier)
- **Bridge**: Vary from verses for contrast
- **Consistency**: Keep similar syllable counts within sections

### Content Tips
1. **Verses**: Tell the story, set the scene
2. **Chorus**: Main message, most memorable
3. **Bridge**: New perspective, contrast
4. **Pre-Chorus**: Build tension to chorus
5. **Show, Don't Tell**: Use imagery and metaphors
6. **Emotion**: Connect with feelings
7. **Simplicity**: Clear, relatable language

## 🎯 AI Generation Tips

### Effective Prompts
**Good Prompts:**
- "A love song about summer nights by the beach, nostalgic and romantic"
- "Upbeat party anthem about living in the moment, energetic and fun"
- "Emotional breakup ballad about moving on, sad but hopeful"

**Bad Prompts:**
- "Write a song" (too vague)
- "Something good" (no direction)
- "Lyrics" (no context)

### Prompt Elements
1. **Theme**: What's the song about?
2. **Mood**: How should it feel?
3. **Style**: Genre or reference artists
4. **Story**: Specific narrative or message
5. **Perspective**: First person, storytelling, etc.

### Generation Modes

#### Full Song
- Best for: Starting from scratch
- Creates: Multiple sections with structure
- Use when: You need a complete song

#### Section
- Best for: Filling specific parts
- Creates: 4-8 lines for current section
- Use when: You have structure, need content

#### Single Line
- Best for: Writer's block on specific lines
- Creates: One line at a time
- Use when: You need inspiration for one line

## 🔧 Advanced Features

### Keyboard Shortcuts (Coming Soon)
- `Ctrl/Cmd + S`: Save lyrics
- `Ctrl/Cmd + C`: Copy all
- `Ctrl/Cmd + N`: New section
- `Delete`: Remove selected section
- `↑/↓`: Navigate sections
- `Ctrl/Cmd + G`: Open AI generator

### Export Options
- **Copy All**: Copies all lyrics with section labels
- **Plain Text**: Just the lyrics
- **With Timestamps**: For synchronization
- **PDF Export**: Formatted lyrics sheet

### Integration
- Lyrics sync with session data
- Tempo and key awareness
- Mood detection from tempo
- Context-aware AI suggestions

## 📊 Understanding the Analysis

### Syllable Count
```
Example: "I love you more than words can say"
Words:    I(1) love(1) you(1) more(1) than(1) words(1) can(1) say(1)
Total:    8 syllables
```

### Rhyme Detection
```
Example:
Line 1: "The sun is shining bright" → rhyme: "ight"
Line 2: "Dancing through the night" → rhyme: "ight"
Result: Lines 1 and 2 rhyme (AA pattern)
```

### Rhyme Scheme
```
A: "I see the stars above"     (rhyme: "ove")
B: "The moon is shining bright" (rhyme: "ight")
A: "Thinking of your love"      (rhyme: "ove")
B: "On this summer night"       (rhyme: "ight")
Pattern: ABAB
```

## 🎵 Best Practices

### Workflow
1. **Start with structure**: Add all sections first
2. **Write chorus first**: It's the core message
3. **Verses tell story**: Build narrative
4. **Use AI for inspiration**: Not replacement
5. **Edit and refine**: First draft is rarely final
6. **Read aloud**: Check flow and rhythm
7. **Match to melody**: Syllables should fit music

### Common Mistakes
❌ Too many syllables (hard to sing)
❌ Forced rhymes (sounds unnatural)
❌ Vague lyrics (no clear message)
❌ Inconsistent perspective (I vs. you vs. they)
❌ Clichés without twist (overused phrases)

✅ Natural syllable flow
✅ Meaningful rhymes
✅ Specific imagery
✅ Consistent voice
✅ Fresh perspectives

## 🐛 Troubleshooting

### AI Not Generating
- Check if GEMINI_API_KEY is set
- Verify internet connection
- Try simpler prompts
- Check browser console for errors

### Syllable Count Seems Wrong
- Algorithm is approximate
- Works best for English
- Manual verification recommended
- Some words have variable syllables

### Rhyme Detection Issues
- Based on phonetic similarity
- May miss perfect rhymes
- May show false positives
- Use as a guide, not absolute

### Performance Issues
- Too many sections (>20)
- Very long lyrics (>1000 lines)
- Clear browser cache
- Refresh the page

## 🔮 Future Enhancements

- [ ] Timestamp synchronization with audio
- [ ] Melody suggestion based on lyrics
- [ ] Rhyme dictionary integration
- [ ] Thesaurus for word alternatives
- [ ] Collaboration features
- [ ] Version history
- [ ] Export to PDF/Word
- [ ] Import from text files
- [ ] Vocal melody notation
- [ ] Karaoke mode
- [ ] Translation support
- [ ] Sentiment analysis
- [ ] Reading level analysis
- [ ] Plagiarism detection

## 📚 Resources

### Songwriting References
- [Songwriting Tips](https://www.songwriting.net)
- [Rhyme Schemes Guide](https://www.rhymezone.com)
- [Lyric Writing Techniques](https://www.berklee.edu)

### AI Prompting
- Be specific about mood and theme
- Include genre references
- Mention tempo and energy
- Describe the story or message

## 🎤 Example Workflows

### Writing a Love Song
1. Add sections: Verse, Chorus, Verse, Chorus, Bridge, Chorus
2. Use AI prompt: "Romantic love song about first meeting, warm and nostalgic"
3. Generate full song
4. Edit verses to tell your story
5. Refine chorus for catchiness
6. Add personal touches

### Writing a Hip-Hop Track
1. Add sections: Intro, Verse, Hook, Verse, Hook, Outro
2. Focus on syllable density (12-16 per line)
3. Use internal rhymes
4. Maintain consistent flow
5. Add wordplay and metaphors

### Writing a Ballad
1. Add sections: Verse, Chorus, Verse, Chorus, Bridge, Chorus
2. Keep syllables lower (6-10 per line)
3. Focus on emotional imagery
4. Simple, powerful chorus
5. Bridge provides resolution

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Built with**: React, TypeScript, Google Gemini AI, Tailwind CSS
