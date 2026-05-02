const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const testExecutionService = require('../services/testExecutionService');
const prismaService = require('../utils/prisma');

/**
 * @route GET /api/tests/suites
 * @desc Get all test suites
 */
router.get('/suites', asyncHandler(async (req, res) => {
    const suites = await prismaService.client.testSuite.findMany({
        include: {
            _count: {
                select: { testCases: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    res.json({
        success: true,
        data: suites,
        count: suites.length,
    });
}));

/**
 * @route GET /api/tests/suites/:id
 * @desc Get a specific test suite with its test cases
 */
router.get('/suites/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const suite = await prismaService.client.testSuite.findUnique({
        where: { id },
        include: {
            testCases: {
                orderBy: { createdAt: 'asc' },
            },
        },
    });

    if (!suite) {
        return res.status(404).json({
            success: false,
            error: 'Test suite not found',
        });
    }

    res.json({
        success: true,
        data: suite,
    });
}));

/**
 * @route GET /api/tests/cases
 * @desc Get all test cases
 */
router.get('/cases', asyncHandler(async (req, res) => {
    const { suiteId, testType, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (suiteId) where.suiteId = suiteId;
    if (testType) where.testType = testType;

    const [testCases, total] = await Promise.all([
        prismaService.client.testCase.findMany({
            where,
            include: {
                suite: true,
                _count: {
                    select: { testExecutions: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset),
        }),
        prismaService.client.testCase.count({ where }),
    ]);

    res.json({
        success: true,
        data: testCases,
        pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: parseInt(offset) + parseInt(limit) < total,
        },
    });
}));

/**
 * @route GET /api/tests/cases/:id
 * @desc Get a specific test case
 */
router.get('/cases/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const testCase = await prismaService.client.testCase.findUnique({
        where: { id },
        include: {
            suite: true,
            testExecutions: {
                take: 10,
                orderBy: { startedAt: 'desc' },
                include: {
                    aiQualityMetrics: true,
                    performanceMetrics: true,
                },
            },
        },
    });

    if (!testCase) {
        return res.status(404).json({
            success: false,
            error: 'Test case not found',
        });
    }

    res.json({
        success: true,
        data: testCase,
    });
}));

/**
 * @route POST /api/tests/cases/:id/execute
 * @desc Execute a specific test case
 */
router.post('/cases/:id/execute', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const options = req.body;

    // Check if test case exists
    const testCase = await prismaService.client.testCase.findUnique({
        where: { id },
    });

    if (!testCase) {
        return res.status(404).json({
            success: false,
            error: 'Test case not found',
        });
    }

    // Execute the test case
    const result = await testExecutionService.executeTestCase(id, options);

    res.json({
        success: true,
        message: 'Test execution completed',
        data: result,
    });
}));

/**
 * @route POST /api/tests/suites/:id/execute
 * @desc Execute all test cases in a suite
 */
router.post('/suites/:id/execute', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const options = req.body;

    // Check if suite exists
    const suite = await prismaService.client.testSuite.findUnique({
        where: { id },
    });

    if (!suite) {
        return res.status(404).json({
            success: false,
            error: 'Test suite not found',
        });
    }

    // Execute the test suite
    const result = await testExecutionService.executeTestSuite(id, options);

    res.json({
        success: true,
        message: 'Test suite execution completed',
        data: result,
    });
}));

/**
 * @route POST /api/tests/execute-all
 * @desc Execute all test cases across all suites
 */
router.post('/execute-all', asyncHandler(async (req, res) => {
    const options = req.body;

    // Execute all tests
    const result = await testExecutionService.executeAllTests(options);

    res.json({
        success: true,
        message: 'All tests execution completed',
        data: result,
    });
}));

/**
 * @route GET /api/tests/executions
 * @desc Get test execution history
 */
router.get('/executions', asyncHandler(async (req, res) => {
    const { limit = 50, offset = 0, testCaseId, status, verdict } = req.query;

    const where = {};
    if (testCaseId) where.testCaseId = testCaseId;
    if (status) where.status = status;
    if (verdict) where.verdict = verdict;

    const [executions, total] = await Promise.all([
        prismaService.client.testExecution.findMany({
            where,
            include: {
                testCase: {
                    include: {
                        suite: true,
                    },
                },
                aiQualityMetrics: true,
                performanceMetrics: true,
            },
            orderBy: { startedAt: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset),
        }),
        prismaService.client.testExecution.count({ where }),
    ]);

    res.json({
        success: true,
        data: executions,
        pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: parseInt(offset) + parseInt(limit) < total,
        },
    });
}));

/**
 * @route GET /api/tests/executions/:id
 * @desc Get a specific test execution
 */
router.get('/executions/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const execution = await prismaService.client.testExecution.findUnique({
        where: { id },
        include: {
            testCase: {
                include: {
                    suite: true,
                },
            },
            aiQualityMetrics: true,
            performanceMetrics: true,
        },
    });

    if (!execution) {
        return res.status(404).json({
            success: false,
            error: 'Test execution not found',
        });
    }

    res.json({
        success: true,
        data: execution,
    });
}));

/**
 * @route GET /api/tests/statistics
 * @desc Get test execution statistics
 */
router.get('/statistics', asyncHandler(async (req, res) => {
    const { timeRange = '7d' } = req.query;

    const statistics = await testExecutionService.getExecutionStatistics(timeRange);

    res.json({
        success: true,
        data: statistics,
    });
}));

/**
 * @route POST /api/tests/cases
 * @desc Create a new test case
 */
router.post('/cases', asyncHandler(async (req, res) => {
    const testCaseData = req.body;

    // Validate required fields
    if (!testCaseData.name || !testCaseData.prompt || !testCaseData.suiteId) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: name, prompt, suiteId',
        });
    }

    const testCase = await prismaService.client.testCase.create({
        data: {
            name: testCaseData.name,
            description: testCaseData.description,
            prompt: testCaseData.prompt,
            expectedCriteria: testCaseData.expectedCriteria || {},
            testType: testCaseData.testType || 'custom',
            suiteId: testCaseData.suiteId,
        },
        include: {
            suite: true,
        },
    });

    res.status(201).json({
        success: true,
        message: 'Test case created successfully',
        data: testCase,
    });
}));

/**
 * @route PUT /api/tests/cases/:id
 * @desc Update a test case
 */
router.put('/cases/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const testCase = await prismaService.client.testCase.update({
        where: { id },
        data: updateData,
        include: {
            suite: true,
        },
    });

    res.json({
        success: true,
        message: 'Test case updated successfully',
        data: testCase,
    });
}));

/**
 * @route DELETE /api/tests/cases/:id
 * @desc Delete a test case
 */
router.delete('/cases/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prismaService.client.testCase.delete({
        where: { id },
    });

    res.json({
        success: true,
        message: 'Test case deleted successfully',
    });
}));

module.exports = router;