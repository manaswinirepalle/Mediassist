# MediAssist AI - Deployment & Production Setup Guide

## Overview
This guide covers deploying MediAssist AI on:
- **Frontend**: Vercel
- **Backend**: Render

## Architecture

```
┌─────────────────────────┐
│   Vercel Frontend       │
│   (React + Vite)        │
│  mediassist-ai.vercel   │
│      .app               │
└──────────┬──────────────┘
           │ HTTPS
           ▼
┌─────────────────────────┐
│   Render Backend        │
│   (FastAPI + Python)    │
│  mediassist-9ibf        │
│   .onrender.com         │
└─────────────────────────┘
```

## Prerequisites

- Node.js 18+ (for frontend)
- Python 3.10+ (for backend)
- Git account
- Vercel account (free tier works)
- Render account (free tier works)

## Backend Deployment on Render

### Step 1: Prepare Backend

```bash
# 1. Ensure you're in the backend directory
cd mediassist/backend

# 2. Verify requirements.txt is up-to-date
cat requirements.txt

# 3. Test locally first
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py  # This won't work directly, use uvicorn below
```

### Step 2: Deploy to Render

1. **Create Render Account**: Go to https://render.com and sign up
2. **Connect GitHub**: Link your GitHub repository with Render
3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Select your GitHub repository
   - Configuration:
     - **Name**: `mediassist-ai-backend`
     - **Environment**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free (or Paid if you need better uptime)

4. **Environment Variables**: Add in Render dashboard under "Environment"
   ```
   ENVIRONMENT=production
   OPENAI_API_KEY=<your-key-here>  # Optional
   HOST=0.0.0.0
   ```

5. **Deploy**: Click "Deploy" and wait for build to complete

### Step 3: Verify Backend

Once deployed, test the endpoints:

```bash
# Health check
curl https://mediassist-9ibf.onrender.com/health

# Example question
curl -X POST https://mediassist-9ibf.onrender.com/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What are symptoms of fever?"}'
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "ai_enabled": false,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "knowledge_base_size": <number>
}
```

## Frontend Deployment on Vercel

### Step 1: Prepare Frontend

```bash
# 1. Go to frontend directory
cd mediassist/frontend

# 2. Update environment variables
# Edit .env and set the backend URL:
VITE_API_URL=https://mediassist-9ibf.onrender.com

# 3. Build locally to test
npm install
npm run build

# 4. Test production build
npm run preview
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy (from frontend directory)
cd mediassist/frontend
vercel --prod
```

**Option B: Using Vercel Website**

1. Go to https://vercel.com and sign up
2. Click "Add New +" → "Project"
3. Import your GitHub repository
4. Configuration:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Environment Variables**: Add in Vercel project settings
   ```
   VITE_API_URL=https://mediassist-9ibf.onrender.com
   ```

6. Click "Deploy"

### Step 3: Verify Frontend

Once deployed:

1. Visit: https://mediassist-ai.vercel.app (or your custom domain)
2. Open DevTools (F12) and check Console for errors
3. Try sending a message
4. Verify the response appears correctly

## Troubleshooting

### Issue: "Failed to connect to backend"

**Diagnosis**:
1. Check if backend is running:
   ```bash
   curl https://mediassist-9ibf.onrender.com/health
   ```

2. Check browser console (F12):
   - Look for CORS errors
   - Look for network errors
   - Check the API URL being used

3. Verify environment variables in Vercel:
   - Go to Vercel project → Settings → Environment Variables
   - Confirm `VITE_API_URL` is set correctly

**Solutions**:
- Ensure Render backend is deployed and running
- Check that backend URL in .env is correct
- Verify CORS is properly configured in backend
- Restart Render service if needed

### Issue: CORS Error in Console

**Cause**: Browser blocking cross-origin requests

**Solution**: Backend's CORS middleware should allow the Vercel frontend URL

Check in main.py:
```python
allow_origins=[
    "http://localhost:3000",
    "http://localhost:5173",
    "https://mediassist-ai.vercel.app",
    "*",
]
```

Update if needed and redeploy to Render.

### Issue: 502 Bad Gateway on Render

**Cause**: Backend crash or misconfiguration

**Solution**:
1. Check Render logs: Go to Render dashboard → Logs
2. Look for error messages
3. Common issues:
   - Missing `data/medical_kb.json`
   - Python version mismatch
   - Missing dependencies

### Issue: Vercel shows "Function Crashed"

**Cause**: Usually a build or deployment issue

**Solution**:
1. Check Vercel Build Logs: Vercel Dashboard → Deployments → Click build
2. Verify `vite.config.js` is correct
3. Ensure all dependencies are installed
4. Check `.env.example` and `.env` files

## Production Checklist

- [x] Backend deployed on Render
- [x] Frontend deployed on Vercel
- [x] CORS configured correctly
- [x] Environment variables set in both services
- [x] API endpoints responding correctly
- [x] Error messages are user-friendly
- [x] Loading states display correctly
- [x] No console errors when messaging
- [x] Health check endpoint working
- [x] Message history working
- [x] Sources display correctly

## Performance Tips

1. **Enable caching** in Vercel
2. **Use cdn** settings for static assets
3. **Minimize dependencies** to reduce bundle size
4. **Monitor usage** on Render to avoid overages

## Environment URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://mediassist-ai.vercel.app |
| Backend API (Render) | https://mediassist-9ibf.onrender.com |
| Health Check | https://mediassist-9ibf.onrender.com/health |
| Ask Endpoint | https://mediassist-9ibf.onrender.com/ask |

## Support

For issues:
1. Check browser console (F12)
2. Check Render logs
3. Check Vercel build logs
4. Verify environment variables
5. Test API manually with curl

---
Last Updated: 2024-01-15
Version: 1.0.0
