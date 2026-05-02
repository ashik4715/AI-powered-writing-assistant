# AI Testing Platform - Project Architecture

## Overview
A full-stack platform for testing AI systems (specifically DeepSeek API) with comprehensive test cases covering functional, non-functional, and AI-quality dimensions as outlined in the Quality Engineering assessment.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (React)                  │
│  • Test Management Dashboard                                 │
│  • Real-time Test Execution Visualization                   │
│  • Results Analysis & Charts                                │
│  • Reactive State Management (Zustand/Redux)                │
└─────────────────┬───────────────────────────────────────────┘
                  │ REST API / WebSocket
┌─────────────────▼───────────────────────────────────────────┐
│                    Node.js Backend (Express)                 │
│  • Test Execution Engine                                    │
│  • DeepSeek API Integration                                 │
│  • Test Result Processing & Analysis                        │
│  • Database Operations                                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│  • Test Suites & Test Cases                                 │
│  • Test Execution Results                                   │
│  • Performance Metrics                                      │
│  • AI Quality Metrics                                       │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend (Node.js/Express)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database ORM**: Prisma (supports SQLite, PostgreSQL, MySQL)
- **Testing Framework**: Jest + Supertest
- **API Client**: Axios for DeepSeek API calls
- **Validation**: Zod
- **Logging**: Winston
- **Metrics**: Prometheus client

### Database
- **Primary**: PostgreSQL (production)
- **Development**: SQLite (for easy setup)
- **Schema**: See database schema below

### Frontend (Next.js)
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: Shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **HTTP Client**: TanStack Query (React Query)

### AI Integration
- **AI Provider**: DeepSeek API (v3.2)
- **API Key Management**: Environment variables + secure storage
- **Rate Limiting**: Express-rate-limit
- **Retry Logic**: Exponential backoff

## Database Schema

```sql
-- Test Suites
CREATE TABLE test_suites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'functional', 'non-functional', 'ai-quality'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Cases
CREATE TABLE test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suite_id UUID REFERENCES test_suites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prompt TEXT NOT NULL,
    expected_criteria JSONB, -- JSON structure for expected behavior
    test_type VARCHAR(50) NOT NULL, -- 'happy-path', 'edge-case', 'performance', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Executions
CREATE TABLE test_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_case_id UUID REFERENCES test_cases(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL, -- 'pending', 'running', 'passed', 'failed', 'error'
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    prompt_used TEXT,
    ai_response TEXT,
    metrics JSONB, -- {response_time: 1500, token_count: 250, ...}
    verdict VARCHAR(20), -- 'pass', 'fail', 'partial'
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Quality Metrics
CREATE TABLE ai_quality_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES test_executions(id) ON DELETE CASCADE,
    hallucination_score DECIMAL(3,2), -- 0-1 scale
    relevance_score DECIMAL(3,2), -- 0-1 scale
    coherence_score DECIMAL(3,2), -- 0-1 scale
    factual_accuracy BOOLEAN,
    safety_violation BOOLEAN,
    bias_detected BOOLEAN,
    metrics JSONB, -- Additional metrics
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Metrics
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES test_executions(id) ON DELETE CASCADE,
    response_time_ms INTEGER NOT NULL,
    tokens_per_second DECIMAL(8,2),
    time_to_first_token_ms INTEGER,
    model_latency_ms INTEGER,
    network_latency_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Project Structure

```
ai-testing-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   ├── tests/           # Backend tests
│   │   └── app.js           # Express app
│   ├── prisma/              # Database schema & migrations
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── app/                 # Next.js app router
│   │   ├── dashboard/       # Dashboard page
│   │   ├── tests/           # Test management
│   │   ├── results/         # Results visualization
│   │   ├── api/             # Frontend API routes
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   ├── lib/                 # Utilities, hooks, etc.
│   ├── store/               # Zustand store
│   ├── public/              # Static assets
│   ├── package.json
│   └── .env.example
├── shared/                  # Shared types/config
├── docker-compose.yml       # Docker setup
├── .github/                 # CI/CD workflows
└── README.md
```

## Test Categories Implementation

Based on the Quality Engineering assessment, we'll implement:

### 1. Functional Testing
- **Happy Path Coverage**: 5+ test cases
- **Negative & Edge Cases**: 4+ test cases
- **Custom Test Cases**: 3+ user-defined cases

### 2. Non-Functional Testing
- **Latency & Response Time**: Automated measurement
- **Consistency & Determinism**: Multiple runs analysis
- **Safety & Responsible AI**: Guardrail testing
- **Resilience**: Typo tolerance, degraded input

### 3. AI Output Quality Testing
- **Factual Accuracy**: Verification against sources
- **Hallucination Detection**: False premise testing
- **Relevance & Completeness**: Scoring system
- **Confidence Calibration**: Uncertainty acknowledgment

## Implementation Plan

### Phase 1: Backend Foundation
1. Set up Node.js/Express project
2. Configure Prisma with PostgreSQL/SQLite
3. Create database schema
4. Implement basic CRUD APIs for test management
5. Integrate DeepSeek API client

### Phase 2: Test Execution Engine
1. Build test runner service
2. Implement test case templates from assessment
3. Create metrics collection system
4. Add result analysis logic

### Phase 3: Frontend Development
1. Set up Next.js project with TypeScript
2. Create dashboard layout
3. Implement test management UI
4. Add real-time results visualization
5. Build charts and analytics

### Phase 4: Advanced Features
1. Add automated test scheduling
2. Implement alerting system
3. Create report generation
4. Add user authentication
5. Implement team collaboration features

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or SQLite for development)
- DeepSeek API key
- Docker (optional)

### Quick Start
```bash
# Clone repository
git clone <repo-url>
cd ai-testing-platform

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your database and API keys
npx prisma migrate dev
npm run dev

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

## Next Steps
1. Create package.json files for backend and frontend
2. Set up database with Prisma
3. Implement core test execution logic
4. Build basic UI components
5. Integrate DeepSeek API
6. Create comprehensive test cases from assessment