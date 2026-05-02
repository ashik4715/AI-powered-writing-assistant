# API Routes Documentation

## Backend API Routes

### v1 API (Frontend Compatible)
Base: `/api/v1`

| Route | Method | Description |
|-------|--------|-------------|
| `/dashboard/stats` | GET | Dashboard statistics (test suites, cases, executions, pass rate) |
| `/test-suites` | GET | List all test suites with their test cases |
| `/test-suites/:id` | GET | Get specific test suite details |
| `/test-executions` | GET | List test execution history |
| `/test-executions` | POST | Execute a test case |
| `/test-executions/:id` | GET | Get specific execution details |
| `/results/export` | GET | Export results (JSON or CSV) |
| `/results/summary` | GET | Get execution summary stats |

### Legacy API Routes
Base: `/api`

| Route | Description |
|-------|-------------|
| `/api/tests/suites` | Test suites management |
| `/api/tests/cases` | Test cases management |
| `/api/tests/executions` | Test execution history |
| `/api/ai/*` | AI service endpoints |
| `/api/results/*` | Results management |
| `/api/health` | Health check |
| `/api-docs` | Swagger documentation |

---

## Frontend Integration

The frontend expects these API endpoints:

### Dashboard Page
- `GET /api/v1/dashboard/stats` - Loads dashboard statistics

### Test Suites Page
- `GET /api/v1/test-suites` - Lists all test suites
- `POST /api/v1/test-executions` - Runs a test case

### Results Page
- `GET /api/v1/test-executions` - Lists execution history
- `GET /api/v1/results/export?format=json` - Download results
- `GET /api/v1/results/summary` - Get summary stats

---

## Testing the API

```bash
# Health check
curl http://localhost:3001/api/health

# Dashboard stats
curl http://localhost:3001/api/v1/dashboard/stats

# List test suites
curl http://localhost:3001/api/v1/test-suites

# List test executions
curl http://localhost:3001/api/v1/test-executions

# Export results
curl http://localhost:3001/api/v1/results/export?format=json
```
