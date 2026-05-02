const request = require('supertest');
const express = require('express');

// Mock dependencies before requiring app
jest.mock('../src/utils/prisma', () => ({
  client: {
    testSuite: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    testCase: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    testExecution: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
  connect: jest.fn().mockResolvedValue(),
  healthCheck: jest.fn(),
  seedDatabase: jest.fn().mockResolvedValue(),
}));

const prismaService = require('../src/utils/prisma');

// Create a mock app for testing
const createMockApp = () => {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/health', async (req, res) => {
    const health = await prismaService.healthCheck();
    res.json(health);
  });

  // Test suites endpoint
  app.get('/api/v1/test-suites', async (req, res) => {
    const suites = await prismaService.client.testSuite.findMany();
    res.json({ success: true, data: suites });
  });

  return app;
};

describe('API Endpoints', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createMockApp();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      prismaService.healthCheck.mockResolvedValue({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });

    it('should handle health check failure', async () => {
      prismaService.healthCheck.mockResolvedValue({
        status: 'unhealthy',
        database: 'disconnected',
        error: 'Connection failed',
      });

      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('unhealthy');
    });
  });

  describe('GET /api/v1/test-suites', () => {
    it('should return list of test suites', async () => {
      const mockSuites = [
        { id: '1', name: 'Functional Testing', category: 'functional' },
        { id: '2', name: 'Non-Functional Testing', category: 'non-functional' },
      ];
      prismaService.client.testSuite.findMany.mockResolvedValue(mockSuites);

      const response = await request(app).get('/api/v1/test-suites');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when no test suites exist', async () => {
      prismaService.client.testSuite.findMany.mockResolvedValue([]);

      const response = await request(app).get('/api/v1/test-suites');
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      prismaService.client.testSuite.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/v1/test-suites');
      expect(response.status).toBe(500);
    });
  });
});

describe('Middleware', () => {
  it('should parse JSON request bodies', async () => {
    const app = express();
    app.use(express.json());
    app.post('/test', (req, res) => {
      res.json({ received: req.body });
    });

    const response = await request(app)
      .post('/test')
      .send({ test: 'data' })
      .set('Content-Type', 'application/json');

    expect(response.body.received).toEqual({ test: 'data' });
  });
});
