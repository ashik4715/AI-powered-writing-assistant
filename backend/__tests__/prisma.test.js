const { PrismaClient } = require('../generated/prisma');
const prismaService = require('../src/utils/prisma');

// Mock the PrismaClient
jest.mock('../generated/prisma', () => {
  const mockPrisma = {
    $connect: jest.fn().mockResolvedValue(),
    $disconnect: jest.fn().mockResolvedValue(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    $transaction: jest.fn((callback) => callback(mockPrisma)),
    $on: jest.fn(),
    testSuite: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue({ id: '1', name: 'Test Suite' }),
    },
    testCase: {
      create: jest.fn().mockResolvedValue({ id: '1', name: 'Test Case' }),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

describe('PrismaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize PrismaClient with logging configuration', () => {
      expect(PrismaClient).toHaveBeenCalledWith({
        log: [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
        ],
      });
    });

    it('should set up event listeners', () => {
      const mockInstance = PrismaClient.mock.results[0]?.value;
      expect(mockInstance?.$on).toHaveBeenCalledWith('query', expect.any(Function));
      expect(mockInstance?.$on).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });

  describe('client getter', () => {
    it('should return the prisma client instance', () => {
      const client = prismaService.client;
      expect(client).toBeDefined();
    });
  });

  describe('connect', () => {
    it('should connect to database successfully', async () => {
      await prismaService.connect();
      expect(prismaService.client.$connect).toHaveBeenCalled();
    });

    it('should throw error on connection failure', async () => {
      prismaService.client.$connect.mockRejectedValueOnce(new Error('Connection failed'));
      await expect(prismaService.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('disconnect', () => {
    it('should disconnect from database', async () => {
      await prismaService.disconnect();
      expect(prismaService.client.$disconnect).toHaveBeenCalled();
    });
  });

  describe('transaction', () => {
    it('should execute transaction callback', async () => {
      const callback = jest.fn().mockResolvedValue('result');
      await prismaService.transaction(callback);
      expect(prismaService.client.$transaction).toHaveBeenCalledWith(callback);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when database is connected', async () => {
      prismaService.client.$queryRaw.mockResolvedValueOnce([{ 1: 1 }]);
      const result = await prismaService.healthCheck();
      expect(result.status).toBe('healthy');
      expect(result.database).toBe('connected');
    });

    it('should return unhealthy status when database is disconnected', async () => {
      prismaService.client.$queryRaw.mockRejectedValueOnce(new Error('Connection lost'));
      const result = await prismaService.healthCheck();
      expect(result.status).toBe('unhealthy');
      expect(result.database).toBe('disconnected');
      expect(result.error).toBe('Connection lost');
    });
  });

  describe('seedDatabase', () => {
    it('should skip seeding if test suites already exist', async () => {
      prismaService.client.testSuite.count.mockResolvedValueOnce(5);
      const result = await prismaService.seedDatabase();
      expect(prismaService.client.testSuite.create).not.toHaveBeenCalled();
    });

    it('should create test suites when database is empty', async () => {
      prismaService.client.testSuite.count.mockResolvedValueOnce(0);
      prismaService.client.testSuite.create
        .mockResolvedValueOnce({ id: '1', name: 'Functional Testing' })
        .mockResolvedValueOnce({ id: '2', name: 'Non-Functional Testing' })
        .mockResolvedValueOnce({ id: '3', name: 'AI Quality Testing' });

      await prismaService.seedDatabase();
      expect(prismaService.client.testSuite.create).toHaveBeenCalledTimes(3);
    });
  });
});
