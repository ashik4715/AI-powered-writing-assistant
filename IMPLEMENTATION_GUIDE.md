# AI Testing Platform - Implementation Guide

## Project Overview

This is a comprehensive AI Testing Platform designed to test AI systems (specifically DeepSeek API) with automated test cases covering functional, non-functional, and AI-quality dimensions as outlined in the Quality Engineering assessment.

## Architecture

The platform consists of three main components:

1. **Backend API** (Node.js/Express): Test execution engine, database operations, and DeepSeek API integration
2. **Database** (PostgreSQL/SQLite): Stores test suites, test cases, execution results, and metrics
3. **Frontend Dashboard** (Next.js/React): Test management, real-time visualization, and analytics

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (or SQLite for development)
- DeepSeek API key
- npm or yarn

### Step 1: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database and DeepSeek API key

# Set up database
npx prisma generate
npx prisma migrate dev --name init

# Seed database with test cases
node -e "require('./src/utils/prisma.js').seedDatabase()"

# Start backend server
npm run dev
```

### Step 2: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

### Step 3: Access the Platform

1. Backend API: http://localhost:3001
2. Frontend Dashboard: http://localhost:3000
3. API Health Check: http://localhost:3001/api/health
4. Database Studio: http://localhost:5555 (run `npx prisma studio` in backend)

## Test Categories Implemented

### 1. Functional Testing
- **Happy Path Coverage**: 5+ test cases including instruction following, format compliance, context retention
- **Negative & Edge Cases**: 4+ test cases including ambiguous prompts, empty input, out-of-scope requests
- **Custom Test Cases**: Framework for adding user-defined test cases

### 2. Non-Functional Testing
- **Latency & Response Time**: Automated measurement with statistical analysis
- **Consistency & Determinism**: Multiple runs analysis with variance tracking
- **Safety & Responsible AI**: Guardrail testing and safety violation detection
- **Resilience Testing**: Typo tolerance and degraded input handling

### 3. AI Output Quality Testing
- **Factual Accuracy**: Verification against known sources
- **Hallucination Detection**: False premise testing and confidence calibration
- **Relevance & Completeness**: Scoring system with AI-as-a-judge evaluation
- **Bias & Fairness**: Demographic variable substitution testing

## Database Schema

The platform uses a comprehensive database schema with the following main tables:

- `test_suites`: Groups of related test cases
- `test_cases`: Individual test definitions with prompts and expected criteria
- `test_executions`: Results of test runs with status and verdict
- `ai_quality_metrics`: AI-specific quality scores (hallucination, relevance, coherence)
- `performance_metrics`: Timing and performance data

## API Endpoints

### Test Management
- `GET /api/tests/suites` - List all test suites
- `GET /api/tests/cases` - List test cases with filtering
- `POST /api/tests/cases/:id/execute` - Execute a specific test case
- `POST /api/tests/suites/:id/execute` - Execute all tests in a suite
- `POST /api/tests/execute-all` - Execute all tests

### AI Integration
- `POST /api/ai/generate` - Generate AI response
- `POST /api/ai/evaluate` - Evaluate response quality using AI-as-a-judge
- `POST /api/ai/safety-check` - Check for safety violations
- `GET /api/ai/health` - Check AI service connectivity

### Results & Analytics
- `GET /api/results/summary` - Overall test results summary
- `GET /api/results/trends` - Test execution trends over time
- `GET /api/results/quality-metrics` - AI quality metrics analysis
- `GET /api/results/performance-metrics` - Performance statistics
- `GET /api/results/export` - Export results in JSON/CSV format

## Frontend Features

### Dashboard
- Real-time test execution monitoring
- Interactive charts for performance metrics
- Test suite management interface
- Results visualization with filtering

### Test Execution
- One-click test execution for individual cases or entire suites
- Real-time progress tracking
- Detailed execution logs and results

### Analytics
- Pass/fail rate trends over time
- Performance benchmarking
- AI quality score tracking
- Comparative analysis across test runs

## Configuration

### Backend Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/ai_testing_db"

# DeepSeek API
DEEPSEEK_API_KEY="your_api_key_here"
DEEPSEEK_API_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-chat"

# Security
JWT_SECRET="your_secret_key"
CORS_ORIGIN="http://localhost:3000"
```

### Frontend Configuration

The frontend is configured to proxy API requests to the backend (see `next.config.js`). Update the proxy URL if running on different ports.

## Running Tests

### Backend Tests
```bash
cd backend
npm test
```

### Manual Test Execution
1. Access the frontend dashboard at http://localhost:3000
2. Navigate to "Test Suites"
3. Select a test suite and click "Execute Suite"
4. Monitor real-time execution in the "Results" section

### Automated Test Scheduling
The platform supports scheduled test execution via cron jobs or CI/CD pipelines using the API endpoints.

## Extending the Platform

### Adding New Test Cases

1. **Via API**:
```bash
curl -X POST http://localhost:3001/api/tests/cases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Test Case",
    "description": "Test description",
    "prompt": "Test prompt",
    "expectedCriteria": {"criteria": ["Expected behavior"]},
    "testType": "custom",
    "suiteId": "suite-uuid"
  }'
```

2. **Via Database Seed**:
   Edit `backend/src/utils/prisma.js` and add to the `testCases` array in the `seedDatabase` method.

### Custom Test Types

The platform supports custom test types:
- `happy-path`: Core functionality tests
- `edge-case`: Boundary and error condition tests
- `performance`: Response time and load tests
- `security`: Safety and guardrail tests
- `ai-quality`: Hallucination and accuracy tests
- `custom`: User-defined test types

## Monitoring & Alerting

### Built-in Monitoring
- Real-time execution status dashboard
- Performance degradation alerts
- Quality score thresholds
- Safety violation notifications

### Integration with External Tools
- Export results to CSV/JSON for external analysis
- Webhook support for CI/CD integration
- Prometheus metrics endpoint (planned)

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Run `npx prisma migrate dev` to create tables

2. **DeepSeek API Errors**
   - Verify API key is valid and has sufficient credits
   - Check network connectivity to api.deepseek.com
   - Review rate limits in DeepSeek documentation

3. **Frontend Not Connecting to Backend**
   - Ensure backend is running on port 3001
   - Check CORS configuration in backend
   - Verify proxy settings in next.config.js

### Logs
- Backend logs: `backend/logs/` directory
- Console output with `npm run dev`
- Database logs via Prisma Studio

## Performance Considerations

### Scaling
- Database connection pooling
- API rate limiting
- Response caching for identical prompts
- Batch processing for large test suites

### Optimization
- Indexed database queries
- Streaming responses for long AI generations
- Parallel test execution
- Incremental result processing

## Security

### Implemented Security Measures
- API key encryption
- Rate limiting
- CORS configuration
- Input validation and sanitization
- SQL injection prevention via Prisma

### Recommended Additional Measures
- JWT authentication for multi-user support
- API key rotation
- Audit logging
- HTTPS enforcement in production

## Deployment

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/. .
EXPOSE 3001
CMD ["npm", "start"]
```

### Cloud Deployment Options
- **Vercel**: Frontend deployment
- **Railway/Heroku**: Backend and database
- **AWS/GCP**: Full stack with managed services

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request

### Code Standards
- ESLint configuration provided
- Prettier formatting
- TypeScript for frontend
- Comprehensive documentation

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
1. Check troubleshooting section
2. Review API documentation
3. Submit GitHub issues
4. Contact maintainers

---

**Next Steps**:
1. Configure your DeepSeek API key
2. Set up the database
3. Run the seed script to populate test cases
4. Start exploring the test results dashboard