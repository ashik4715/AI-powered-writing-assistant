const { PrismaClient } = require('../../generated/prisma');
const { createLogger } = require('./logger');

const logger = createLogger('prisma');

class PrismaService {
    constructor() {
        this.prisma = new PrismaClient({
            log: [
                {
                    emit: 'event',
                    level: 'query',
                },
                {
                    emit: 'event',
                    level: 'error',
                },
                {
                    emit: 'event',
                    level: 'info',
                },
                {
                    emit: 'event',
                    level: 'warn',
                },
            ],
        });

        // Logging for development
        if (process.env.NODE_ENV === 'development') {
            this.prisma.$on('query', (e) => {
                logger.debug({
                    message: 'Database Query',
                    query: e.query,
                    duration: `${e.duration}ms`,
                    params: e.params,
                });
            });
        }

        this.prisma.$on('error', (e) => {
            logger.error({
                message: 'Database Error',
                error: e.message,
                target: e.target,
            });
        });
    }

    /**
     * Get the Prisma client instance
     */
    get client() {
        return this.prisma;
    }

    /**
     * Connect to the database
     */
    async connect() {
        try {
            await this.prisma.$connect();
            logger.info('Successfully connected to database');
        } catch (error) {
            logger.error({
                message: 'Failed to connect to database',
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Disconnect from the database
     */
    async disconnect() {
        try {
            await this.prisma.$disconnect();
            logger.info('Successfully disconnected from database');
        } catch (error) {
            logger.error({
                message: 'Failed to disconnect from database',
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Execute a transaction
     */
    async transaction(callback) {
        return this.prisma.$transaction(callback);
    }

    /**
     * Health check for database
     */
    async healthCheck() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                database: 'connected',
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                database: 'disconnected',
                error: error.message,
            };
        }
    }

    /**
     * Seed the database with initial test data
     */
    async seedDatabase() {
        try {
            logger.info('Starting database seeding...');

            // Check if test suites already exist
            const existingSuites = await this.prisma.testSuite.count();
            if (existingSuites > 0) {
                logger.info('Database already seeded, skipping...');
                return;
            }

            // Create test suites
            const functionalSuite = await this.prisma.testSuite.create({
                data: {
                    name: 'Functional Testing',
                    description: 'Tests for core functional behavior of AI system',
                    category: 'functional',
                },
            });

            const nonFunctionalSuite = await this.prisma.testSuite.create({
                data: {
                    name: 'Non-Functional Testing',
                    description: 'Tests for performance, reliability, and safety',
                    category: 'non-functional',
                },
            });

            const aiQualitySuite = await this.prisma.testSuite.create({
                data: {
                    name: 'AI Quality Testing',
                    description: 'Tests for AI-specific quality dimensions',
                    category: 'ai-quality',
                },
            });

            // Create test cases based on the assessment document
            const testCases = [
                // Functional - Happy Path
                {
                    suiteId: functionalSuite.id,
                    name: 'Basic Instruction Following',
                    description: 'Verify the model follows a clear, unambiguous instruction within its intended domain.',
                    prompt: 'Write a 3-sentence summary of the water cycle suitable for a 10-year-old.',
                    expectedCriteria: {
                        criteria: [
                            'Output is exactly 3 sentences (or close)',
                            'Language is age-appropriate (no jargon)',
                            'Content is factually accurate',
                            'Format matches instruction (summary, not a list)'
                        ],
                        verificationMethod: 'manual',
                        expectedVerdict: 'pass'
                    },
                    testType: 'happy-path'
                },
                {
                    suiteId: functionalSuite.id,
                    name: 'Format Compliance',
                    description: 'Verify the model adheres to a specific structural output format when explicitly requested.',
                    prompt: 'List 5 project management tools. Return ONLY a numbered list with the tool name and one sentence description.',
                    expectedCriteria: {
                        criteria: [
                            'Exactly 5 items returned',
                            'Format is a numbered list (not bullets, not prose)',
                            'No preamble or trailing commentary added',
                            'Each item has exactly: name + one sentence'
                        ],
                        verificationMethod: 'manual',
                        expectedVerdict: 'pass'
                    },
                    testType: 'happy-path'
                },
                {
                    suiteId: functionalSuite.id,
                    name: 'Context Retention (Multi-turn)',
                    description: 'Test that the AI correctly uses context from earlier in the conversation.',
                    prompt: 'Turn 1: "My name is Alex and I am a software engineer."\nTurn 2: "What career advice would you give someone like me?"',
                    expectedCriteria: {
                        criteria: [
                            'Response in Turn 2 references software engineering',
                            'Advice is relevant to the stated role',
                            'Name is optionally acknowledged (not mandatory)'
                        ],
                        verificationMethod: 'manual',
                        expectedVerdict: 'pass'
                    },
                    testType: 'happy-path'
                },
                // Functional - Edge Cases
                {
                    suiteId: functionalSuite.id,
                    name: 'Ambiguous Prompt Handling',
                    description: 'Submit a genuinely ambiguous prompt and evaluate whether the AI asks for clarification.',
                    prompt: 'Tell me about the bank.',
                    expectedCriteria: {
                        criteria: [
                            'Does it ask for clarification? (ideal)',
                            'If it assumes, does it state the assumption?',
                            'Does it hallucinate specifics without flagging uncertainty?'
                        ],
                        verificationMethod: 'manual',
                        expectedVerdict: 'partial'
                    },
                    testType: 'edge-case'
                },
                {
                    suiteId: functionalSuite.id,
                    name: 'Empty/Null Input',
                    description: 'Submit an empty or whitespace-only prompt.',
                    prompt: '   ',
                    expectedCriteria: {
                        criteria: [
                            'System does not crash or produce an error page',
                            'Response is sensible (e.g., asks for input)',
                            'No hallucinated content generated from nothing'
                        ],
                        verificationMethod: 'manual',
                        expectedVerdict: 'pass'
                    },
                    testType: 'edge-case'
                },
                // Non-Functional - Performance
                {
                    suiteId: nonFunctionalSuite.id,
                    name: 'Response Time Baseline',
                    description: 'Measure time-to-first-token for identical prompts.',
                    prompt: 'What are the top 3 benefits of automated testing? Be concise.',
                    expectedCriteria: {
                        criteria: [
                            'Average response time within acceptable UX threshold (<5s for short output)',
                            'Variance across identical runs is noted and assessed'
                        ],
                        verificationMethod: 'automated',
                        expectedVerdict: 'pass',
                        performanceThresholds: {
                            maxResponseTime: 5000, // 5 seconds
                            maxVariance: 2000 // 2 seconds
                        }
                    },
                    testType: 'performance'
                },
                // AI Quality - Factual Accuracy
                {
                    suiteId: aiQualitySuite.id,
                    name: 'Factual Accuracy Check',
                    description: 'Ask questions with objectively verifiable answers.',
                    prompt: 'What year was the Eiffel Tower completed?',
                    expectedCriteria: {
                        criteria: [
                            'Answer verified against credible source',
                            'Accuracy rate calculated',
                            'Errors classified: hallucination / outdated data / close-but-wrong'
                        ],
                        verificationMethod: 'manual',
                        expectedVerdict: 'pass',
                        expectedAnswer: '1889'
                    },
                    testType: 'factual-accuracy'
                },
                {
                    suiteId: aiQualitySuite.id,
                    name: 'Hallucination Probe - False Premise',
                    description: 'Ask a question containing a false premise.',
                    prompt: 'Can you tell me more about the famous speech Einstein gave at Harvard in 1945?',
                    expectedCriteria: {
                        criteria: [
                            'AI identifies and corrects the false premise',
                            'AI does not fabricate details about a non-existent event',
                            'Response expresses appropriate uncertainty'
                        ],
                        verificationMethod: 'manual',
                        expectedVerdict: 'pass'
                    },
                    testType: 'hallucination-detection'
                }
            ];

            // Create all test cases
            for (const testCase of testCases) {
                await this.prisma.testCase.create({
                    data: testCase
                });
            }

            logger.info(`Successfully seeded database with ${testCases.length} test cases`);
            return { success: true, count: testCases.length };
        } catch (error) {
            logger.error({
                message: 'Failed to seed database',
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}

// Create singleton instance
const prismaService = new PrismaService();

module.exports = prismaService;