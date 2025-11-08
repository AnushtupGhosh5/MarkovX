# Quick Start: Text→Music Feature

## 🚀 Get Started in 3 Steps

### Step 1: Get Your Replicate API Token (Free)

1. Visit https://replicate.com and create a free account
2. Go to https://replicate.com/account/api-tokens
3. Click "Create token"
4. Copy your token (starts with `r8_...`)

**You get $5 free credit!** Each 10-second generation costs ~$0.01.

### Step 2: Configure Environment

Create `.env.local` in the project root:

```bash
REPLICATE_API_TOKEN=r8_your_token_here
```

### Step 3: Run the App

```bash
npm install
npm run dev
```

Open http://localhost:3000 and click **"Generate Music"**!

## 🎵 Try It Out

1. Click one of the sample prompts (Lo-fi, Cinematic, or Upbeat Pop)
2. Or write your own: "a peaceful guitar melody with ocean sounds"
3. Adjust duration (5-20 seconds)
4. Click "Generate Music"
5. Wait 10-30 seconds
6. Play your generated audio!

## 🧪 Test the API

```bash
curl -X POST http://localhost:3000/api/gen/text \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a relaxing piano melody", "durationSec": 10}'
```

## ⚠️ Common Issues

**"REPLICATE_API_TOKEN not configured"**: Check your `.env.local` file

**Takes too long**: First generation may take 30-60 seconds (model loading)

**"Insufficient credits"**: Add credits at https://replicate.com/account/billing

## 💡 Why Replicate?

HuggingFace removed free serverless inference for MusicGen. Replicate is now the best option:

✅ Reliable and fast  
✅ Better quality (stereo-melody-large model)  
✅ Pay-per-use (~$0.01 per 10 seconds)  
✅ $5 free credit to start  

## 📚 Full Documentation

See `TEXT_TO_MUSIC_IMPLEMENTATION.md` for complete details.

## 🎯 What's Included

✅ Server API route with Replicate integration  
✅ Frontend UI with sample prompts and audio player  
✅ Session context integration  
✅ Prompt engineering with tempo/key support  
✅ Comprehensive error messages  
✅ Audio history tracking  

Enjoy creating music with AI! 🎶
