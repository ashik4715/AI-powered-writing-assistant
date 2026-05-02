const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AI Testing Platform API',
            version: '1.0.0',
            description: `
Backend API for testing AI-powered features with comprehensive test management, 
execution, and reporting capabilities. Supports functional, non-functional, and 
AI-specific quality testing for LLM-based systems.

## Key Features
- **Test Management**: Create and manage test suites and test cases
- **Test Execution**: Run tests against AI systems with detailed metrics
- **AI Quality Metrics**: Measure hallucination, coherence, relevance, safety
- **Performance Monitoring**: Track TTFT, TPOT, latency under load
- **Results Export**: Download test results in JSON or CSV format

## AI Testing Capabilities
- Hallucination detection and fact-checking
- Sycophancy (bias toward user assumptions) testing
- Semantic drift monitoring across conversation turns
- Safety guardrail efficacy validation
- RAG (Retrieval-Augmented Generation) faithfulness scoring
            `,
            contact: {
                name: 'AI Testing Platform Team',
                email: 'qa-team@codesage.io'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3001/api',
                description: 'Local development server'
            },
            {
                url: 'https://api.codesage.io/api',
                description: 'Production server'
            }
        ],
        tags: [
            {
                name: 'Health',
                description: 'Health check and system status endpoints'
            },
            {
                name: 'Tests',
                description: 'Test suite and test case management, execution'
            },
            {
                name: 'Results',
                description: 'Test results, metrics, and export functionality'
            },
            {
                name: 'AI',
                description: 'AI service integration and evaluation'
            }
        ],
        components: {
            schemas: {
                TestSuite: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'Functional Tests' },
                        description: { type: 'string' },
                        category: { 
                            type: 'string', 
                            enum: ['functional', 'performance', 'ai_quality', 'safety'],
                            example: 'functional'
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        _count: {
                            type: 'object',
                            properties: {
                                testCases: { type: 'integer', example: 25 }
                            }
                        }
                    }
                },
                TestCase: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { 
                            type: 'string', 
                            example: 'TC-FUNC-001: Basic Code Explanation' 
                        },
                        description: { type: 'string' },
                        prompt: { 
                            type: 'string', 
                            example: 'function add(a,b){return a+b;}' 
                        },
                        expectedCriteria: {
                            type: 'object',
                            properties: {
                                containsExplanation: { type: 'boolean' },
                                mentionsParameters: { type: 'boolean' },
                                maxResponseTime: { type: 'integer' }
                            }
                        },
                        testType: {
                            type: 'string',
                            enum: ['functional', 'performance', 'ai_quality', 'safety', 'custom'],
                            example: 'functional'
                        },
                        suiteId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                TestExecution: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        status: {
                            type: 'string',
                            enum: ['pending', 'running', 'completed', 'failed'],
                            example: 'completed'
                        },
                        verdict: {
                            type: 'string',
                            enum: ['pass', 'fail', 'partial', 'error'],
                            example: 'pass'
                        },
                        durationMs: { type: 'integer', example: 1250 },
                        startedAt: { type: 'string', format: 'date-time' },
                        completedAt: { type: 'string', format: 'date-time' },
                        testCase: { $ref: '#/components/schemas/TestCase' },
                        aiQualityMetrics: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/AIQualityMetric' }
                        },
                        performanceMetrics: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/PerformanceMetric' }
                        }
                    }
                },
                AIQualityMetric: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        hallucinationScore: { 
                            type: 'number', 
                            minimum: 0, 
                            maximum: 1, 
                            example: 0.15,
                            description: 'Lower is better (0 = no hallucination)'
                        },
                        relevanceScore: { 
                            type: 'number', 
                            minimum: 0, 
                            maximum: 1, 
                            example: 0.92 
                        },
                        coherenceScore: { 
                            type: 'number', 
                            minimum: 0, 
                            maximum: 1, 
                            example: 0.88 
                        },
                        safetyViolation: { type: 'boolean', example: false },
                        biasDetected: { type: 'boolean', example: false },
                        factualAccuracy: { type: 'boolean', example: true },
                        semanticDriftScore: { 
                            type: 'number', 
                            minimum: 0, 
                            maximum: 1, 
                            example: 0.95 
                        },
                        ragFaithfulness: { 
                            type: 'number', 
                            minimum: 0, 
                            maximum: 1, 
                            example: 0.93 
                        },
                        sycophancyScore: { 
                            type: 'number', 
                            minimum: 0, 
                            maximum: 1, 
                            example: 0.05,
                            description: 'Lower is better (0 = no sycophancy)'
                        },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                PerformanceMetric: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        responseTimeMs: { 
                            type: 'integer', 
                            example: 1450,
                            description: 'Total time for complete response (TTFT + generation)'
                        },
                        timeToFirstTokenMs: { 
                            type: 'integer', 
                            example: 320,
                            description: 'TTFT - Time to First Token'
                        },
                        tokensPerSecond: { 
                            type: 'number', 
                            example: 45.5 
                        },
                        tokensGenerated: { type: 'integer', example: 150 },
                        promptTokens: { type: 'integer', example: 250 },
                        totalTokens: { type: 'integer', example: 400 },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Test case not found' },
                        timestamp: { type: 'string', format: 'date-time' }
                    }
                }
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/routes/*.js', './src/app.js']
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
