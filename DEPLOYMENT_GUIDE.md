# 🚀 Deployment Guide - AI Testing Platform

## Executive Summary

You have **two deployment options**:

| Option | Frontend | Backend | Database | Complexity | Cost | Best For |
|--------|----------|---------|----------|------------|------|----------|
| **Option 1** ✅ | Vercel | Railway/Render | PostgreSQL | Low | Free tier available | **Production, scalability, reliability** |
| **Option 2** ⚠️ | Vercel | Vercel Serverless | Vercel Postgres | Medium-High | Free tier available | Simple apps, low traffic, experimental |

---

## ❌ Why NOT Deploy Both to Vercel?

### The Core Problem

Vercel is a **serverless platform** designed for:
- ✅ Frontend frameworks (Next.js, React, Vue)
- ✅ Simple API endpoints (serverless functions)
- ✅ Static site generation
- ✅ Edge functions

**Vercel is NOT designed for:**
- ❌ Traditional Node.js/Express servers with persistent connections
- ❌ Long-running processes
- ❌ WebSocket servers
- ❌ Background job processing
- ❌ Complex middleware chains

### Your Backend Issues on Vercel

Your current backend has these **Vercel-incompatible features**:

```javascript
// ❌ PROBLEM 1: Express server with persistent listening
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Vercel expects exported functions, not persistent servers

// ❌ PROBLEM 2: Database connection pooling
const prisma = new PrismaClient();
// Vercel serverless functions create new connections per request
// You'll exhaust database connection limits quickly

// ❌ PROBLEM 3: Swagger UI with static file serving
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// Vercel has file system limitations in serverless

// ❌ PROBLEM 4: Multiple route files with complex middleware
app.use('/api/tests', testRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/results', resultsRoutes);
// Each becomes a separate serverless function = cold start issues
```

### What Would Happen If You Deployed to Vercel

1. **Database Connection Exhaustion**: Each request creates a new connection → PostgreSQL limit hit quickly
2. **Cold Start Latency**: 2-5 second delays on every API call
3. **Swagger UI Breaks**: Static files won't serve properly
4. **Request Timeout**: 10s limit on Vercel free tier, 60s on pro
5. **State Loss**: In-memory caches, sessions don't persist between requests
6. **File Uploads Fail**: No persistent file system

---

## ✅ Option 1: Split Deployment (RECOMMENDED)

### Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│     Vercel      │──────▶│     Railway      │──────▶│   PostgreSQL    │
│   (Frontend)    │      │   (Backend API)    │      │   (Database)    │
│  Next.js App    │      │  Express Server    │      │                 │
│  Static/SSR/ISR │      │  Swagger Docs      │      │                 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
       │                          │
       │                          │
   https://ai-           https://api-ai-
   testing.vercel.app   testing.up.railway.app
```

### Step-by-Step Setup

#### 1. Deploy Backend to Railway (Free Tier)

**Sign up:** https://railway.app/

**Method A: GitHub Integration (Easiest)**
```bash
# Railway will automatically detect your backend
1. Login to Railway with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add PostgreSQL service (New → Database → Add PostgreSQL)
5. Railway auto-detects Node.js and sets up build command
```

**Method B: Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
cd backend
railway link

# Deploy
railway up

# Add PostgreSQL
railway add --database postgres

# Get connection string
railway variables
```

**Environment Variables in Railway:**
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-set by Railway
DEEPSEEK_API_KEY=your_api_key_here
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

**Database Migrations:**
```bash
cd backend
railway run npx prisma migrate deploy
railway run npm run prisma:seed
```

#### 2. Deploy Frontend to Vercel

**Using Vercel Dashboard:**
```bash
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select "frontend" as root directory
4. Framework preset: Next.js
5. Add environment variable:
   NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app/api
6. Deploy
```

**Using Vercel CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-railway-url.up.railway.app/api
```

**Connect Frontend to Backend:**
```bash
# Option 1: Vercel Dashboard
Settings → Environment Variables → Add
Key: NEXT_PUBLIC_API_URL
Value: https://your-railway-app.up.railway.app/api

# Option 2: Using CLI
vercel env add NEXT_PUBLIC_API_URL
```

#### 3. Alternative: Deploy Backend to Render (Free Tier)

If Railway doesn't work for you, Render is an excellent alternative:

**Steps:**
1. https://dashboard.render.com/
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
   - **Root Directory:** `backend`
5. Add PostgreSQL service
6. Copy database URL to environment variables

---

## ⚠️ Option 2: All-on-Vercel (NOT Recommended)

### Why You Might Consider This

- ✅ One platform to manage
- ✅ Unified CDN/edge network
- ✅ Preview deployments for both

### Why We Don't Recommend It

| Issue | Impact | Workaround Complexity |
|-------|--------|----------------------|
| Database connections | High | Connection pooling with PgBouncer |
| Cold starts | High | Keep-warm functions, edge config |
| File system limits | Medium | External storage (S3, Vercel Blob) |
| Request timeouts | Medium | Background jobs via webhooks |
| Swagger UI | Low | Static export, separate hosting |
| WebSocket support | High | Ably, Pusher, or Server-Sent Events |

### If You MUST Use Vercel Only

**Architecture Changes Required:**

```
Before (Express Server):
  app.js → server.listen(3001)

After (Vercel Serverless):
  api/health.js     → export default handler
  api/tests.js      → export default handler  
  api/results.js    → export default handler
  api/ai.js         → export default handler
```

**Files to Create:**

```javascript
// backend/api/health.js
import app from '../src/app';

export default async function handler(req, res) {
  // Vercel serverless handler
  return app(req, res);
}
```

```javascript
// backend/vercel.json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ],
  "functions": {
    "api/*.js": {
      "maxDuration": 30
    }
  }
}
```

```javascript
// backend/src/lib/prisma.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// Prevent multiple instances in development
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Vercel Postgres (Required):**
```bash
# Instead of external PostgreSQL
vercel storage add postgres
# This provides serverless-compatible PostgreSQL
```

**Trade-offs:**
- ❌ Requires significant code refactoring
- ❌ Swagger UI needs static export workaround
- ❌ Complex database connection management
- ❌ No WebSocket support
- ❌ Request timeout limits (10s-60s)
- ✅ Everything on one platform
- ✅ Edge deployment for low latency

---

## 🔧 CI/CD Setup (Automated Deployments)

### GitHub Actions Workflow

I've created two workflows in `.github/workflows/`:

#### 1. Frontend Deployment (`deploy-frontend.yml`)

```yaml
Triggers:
  - Push to main with frontend changes
  - Pull requests for preview deployments

Jobs:
  - Install dependencies
  - Run tests
  - Build Next.js app
  - Deploy to Vercel
```

**Required Secrets:**
```bash
# Add to GitHub: Settings → Secrets and variables → Actions
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

Get these from:
```bash
cd frontend
vercel login
vercel link
# Then check .vercel/project.json
cat .vercel/project.json
```

#### 2. Backend Deployment (`deploy-backend.yml`)

```yaml
Triggers:
  - Push to main with backend changes
  - Runs tests before deploying

Jobs:
  - Run tests
  - Deploy to Railway
  - Run database migrations
  - Seed database if needed
```

**Required Secrets:**
```bash
# Add to GitHub: Settings → Secrets and variables → Actions
RAILWAY_TOKEN=your_railway_token
PROD_DATABASE_URL=your_production_db_url
```

---

## 📋 Environment Variables Reference

### Backend (.env for Railway)

```env
# Database (auto-set by Railway if using their PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# AI Service
DEEPSEEK_API_KEY=sk-your-api-key-here

# Server
PORT=3001
NODE_ENV=production

# Security
CORS_ORIGIN=https://your-vercel-domain.vercel.app
JWT_SECRET=your_random_jwt_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env.local for Vercel)

```env
# API URL
NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app/api

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

---

## 🌐 Custom Domain Setup

### Option A: Separate Subdomains (Recommended)

```
Frontend: https://ai-testing.yourcompany.com
Backend:  https://api.ai-testing.yourcompany.com
```

**Vercel Custom Domain:**
1. Project Settings → Domains
2. Add `ai-testing.yourcompany.com`
3. Update DNS with provided records

**Railway Custom Domain:**
1. Service Settings → Domains
2. Add `api.ai-testing.yourcompany.com`
3. Update DNS with provided records

### Option B: Same Domain with Path Routing

```
https://ai-testing.yourcompany.com        → Frontend (Vercel)
https://ai-testing.yourcompany.com/api   → Backend (Railway via rewrite)
```

**Vercel Configuration:**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-railway-app.up.railway.app/api/:path*"
    }
  ]
}
```

---

## 🔍 Troubleshooting

### Database Connection Issues

**Problem:** `P1001: Can't reach database server`
```bash
# Solution: Check Railway allowed IPs
Railway → Database → Settings → Allowed IPs
Add: 0.0.0.0/0 (allow all) for testing
```

**Problem:** `Too many connections`
```bash
# Solution: Add connection pooling
# Install pgBouncer or use @prisma/adapter-pg
npm install @prisma/adapter-pg pg
```

### CORS Errors

**Problem:** `Access-Control-Allow-Origin` error
```javascript
// backend/src/app.js
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
```

### API Not Responding

**Checklist:**
1. ✅ Backend deployed successfully (check Railway logs)
2. ✅ Environment variables set in Railway
3. ✅ Database migrations ran
4. ✅ CORS origin matches frontend URL
5. ✅ Frontend using correct `NEXT_PUBLIC_API_URL`

---

## 💰 Cost Comparison

### Option 1: Vercel + Railway (Recommended)

| Service | Free Tier | Production Cost |
|---------|-----------|-----------------|
| Vercel (Frontend) | 100GB bandwidth, 6M function invocations | $20/month (Pro) |
| Railway (Backend) | 500 hours, 512MB RAM, 1GB disk | $5-20/month |
| Railway PostgreSQL | 500 hours, 512MB RAM | $5-15/month |
| **Total** | **$0** | **$30-55/month** |

### Option 2: All-on-Vercel

| Service | Free Tier | Production Cost |
|---------|-----------|-----------------|
| Vercel Pro | Same as above | $20/month |
| Vercel Postgres | 256MB RAM, 60K queries/day | $15-30/month |
| **Total** | **$0** | **$35-50/month** |

---

## 🎯 Our Recommendation

**Use Option 1: Split Deployment**

**Why:**
1. ✅ **No code changes needed** - Deploy as-is
2. ✅ **Production-ready** - Proven architecture at scale
3. ✅ **Best tool for each job** - Vercel for frontend, Railway for backend
4. ✅ **Easier debugging** - Clear separation of concerns
5. ✅ **Scalable** - Scale each service independently

**Deployment Order:**
1. Deploy backend to Railway first
2. Test backend API with Swagger UI
3. Note the Railway URL
4. Deploy frontend to Vercel with Railway URL as env var
5. Test full application
6. Add CI/CD for automated deployments

---

## 📞 Need Help?

### Railway Support
- Docs: https://docs.railway.app/
- Discord: https://discord.gg/railway

### Vercel Support  
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

### Debugging Commands
```bash
# Check Railway logs
railway logs

# Test backend locally
npm run dev

# Test database connection
railway run npx prisma studio

# Check Vercel deployment
vercel --version
vercel inspect <deployment-url>
```

---

**Good luck with your deployment! 🚀**
