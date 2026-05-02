# Quick Start Guide - AI Testing Platform

## TL;DR - Get Running in 5 Minutes

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
npm install
npm run dev
```

### Step 2: Start Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

### Step 3: Access Services
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Docs (Swagger):** http://localhost:3001/api-docs
- **Download Results:** http://localhost:3000/results/download

---

## Detailed Setup Instructions

### Prerequisites
- Node.js 18+ (check: `node --version`)
- npm or yarn
- PostgreSQL (optional - can use SQLite for testing)

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install all dependencies (includes swagger packages)
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env file with your settings (see below)

# 4. Set up database (Prisma)
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# 5. Start development server
npm run dev
```

**Backend Environment Variables (.env):**
```env
# Required
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/ai_testing?schema=public"
DEEPSEEK_API_KEY="your-api-key-here"

# Optional
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Backend Available Commands:**
| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot-reload (nodemon) |
| `npm start` | Start production server |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npx prisma studio` | Open database GUI (http://localhost:5555) |
| `npx prisma migrate dev` | Run database migrations |
| `npx prisma db seed` | Seed with test data |
| `npx prisma generate` | Regenerate Prisma client |

---

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install all dependencies
npm install

# 3. Start development server
npm run dev
```

**Frontend Environment Variables (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Frontend Available Commands:**
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (http://localhost:3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Testing the APIs

### Method 1: Swagger UI (Recommended for exploration)
Open http://localhost:3001/api-docs in your browser

**Try these endpoints:**
1. **Health Check:** GET `/api/health` - Should return "healthy"
2. **Results Summary:** GET `/api/results/summary` - View test statistics
3. **Export JSON:** GET `/api/results/export?format=json&limit=100`
4. **Export CSV:** GET `/api/results/export?format=csv&limit=100`

### Method 2: curl commands
```bash
# Health check
curl http://localhost:3001/api/health

# Get results summary
curl http://localhost:3001/api/results/summary

# Export as JSON
curl http://localhost:3001/api/results/export?format=json > results.json

# Export as CSV
curl http://localhost:3001/api/results/export?format=csv > results.csv
```

### Method 3: Frontend Download Page
1. Open http://localhost:3000/results/download
2. Select format (JSON or CSV)
3. Set record limit
4. Click "Download Results"

---

## Project Structure

```
AI-powered-writing-assistant/
├── SOLUTION.md                    ⭐ Main deliverable (test strategy)
├── Advance_Interview_QA.md        ⭐ Interview documentation
├── QUICK_START.md                 ⭐ This file
├── backend/                       ⭐ Backend API
│   ├── src/
│   │   ├── app.js                # Express server + Swagger
│   │   ├── swagger.js            # OpenAPI configuration
│   │   ├── routes/
│   │   │   ├── testRoutes.js     # Test management APIs
│   │   │   ├── resultsRoutes.js  # Export & metrics APIs
│   │   │   └── aiRoutes.js       # AI service APIs
│   │   └── prisma/
│   │       └── schema.prisma     # Database schema
│   └── package.json
├── frontend/                      ⭐ Next.js frontend
│   ├── app/
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   └── results/
│   │       └── download/
│   │           └── page.tsx      # ⭐ Download interface
│   └── package.json
└── README.md                      # Original assignment
```

---

## Troubleshooting

### Issue: "Cannot find module 'swagger-jsdoc'"
**Solution:** Make sure you ran `npm install` in the backend directory

### Issue: "Database connection error"
**Solution:** 
- Check DATABASE_URL in .env file
- Or use SQLite for testing: `DATABASE_URL="file:./dev.db"`
- Run: `npx prisma migrate dev`

### Issue: "Port 3001 already in use"
**Solution:** 
```bash
# Find and kill process using port 3001
npx kill-port 3001
# Or change PORT in .env to another number (e.g., 3002)
```

### Issue: Frontend shows "Module not found" errors
**Solution:** Run `npm install` in frontend directory

### Issue: CORS errors in browser
**Solution:** Make sure CORS_ORIGIN in backend .env matches frontend URL (http://localhost:3000)

---

## API Quick Reference

### Test Management
```
GET    /api/tests/suites              # List all test suites
GET    /api/tests/suites/:id          # Get specific suite
GET    /api/tests/cases               # List test cases
GET    /api/tests/cases/:id           # Get specific test case
POST   /api/tests/cases/:id/execute   # Execute test case
POST   /api/tests/suites/:id/execute  # Execute all tests in suite
POST   /api/tests/execute-all         # Execute all tests
GET    /api/tests/executions          # Get execution history
GET    /api/tests/statistics          # Get statistics
```

### Results & Export
```
GET    /api/results/summary           # Overall statistics
GET    /api/results/trends            # Execution trends over time
GET    /api/results/quality-metrics     # AI quality metrics
GET    /api/results/performance-metrics # Performance metrics
GET    /api/results/export?format=json|csv&limit=N  # ⭐ Download results
DELETE /api/results/cleanup           # Clean old results (admin)
```

### AI Services
```
GET    /api/ai/health                 # AI service health check
POST   /api/ai/generate               # Generate AI response
POST   /api/ai/batch-generate         # Batch generate responses
POST   /api/ai/evaluate               # LLM-as-a-judge evaluation
```

---

## Key Features Demonstrated

✅ **Swagger/OpenAPI Documentation** - Interactive API docs at /api-docs  
✅ **Test Results Export** - JSON and CSV formats with configurable limits  
✅ **AI Quality Metrics** - Hallucination scores, relevance, coherence, safety  
✅ **Performance Metrics** - TTFT, TPOT, latency percentiles  
✅ **Risk-Based Testing** - Prioritized test strategy  
✅ **Comprehensive Test Plan** - AI-specific oracle strategies  

---

## What to Show in Interview

1. **Open SOLUTION.md** - Walk through the test strategy
2. **Start Backend** - Show Swagger UI with all documented APIs
3. **Test Export API** - Demonstrate downloading results via curl or browser
4. **Start Frontend** - Show the download interface
5. **Open Advance_Interview_QA.md** - Discuss learnings and technical decisions

---

**Happy Testing! 🚀**
