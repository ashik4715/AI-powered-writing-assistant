const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const prismaService = require('../utils/prisma');
const testExecutionService = require('../services/testExecutionService');

// Dashboard Stats Route
router.get('/dashboard/stats', asyncHandler(async (req, res) => {
    const [
        totalTestSuites,
        totalTestCases,
        totalExecutions,
        passCount,
        failCount,
        recentExecutions
    ] = await Promise.all([
        prismaService.client.testSuite.count(),
        prismaService.client.testCase.count(),
        prismaService.client.testExecution.count(),
        prismaService.client.testExecution.count({ where: { verdict: 'pass' } }),
        prismaService.client.testExecution.count({ where: { verdict: 'fail' } }),
        prismaService.client.testExecution.findMany({
            take: 5,
            orderBy: { startedAt: 'desc' },
            include: {
                testCase: {
                    select: { name: true }
                }
            }
        })
    ]);

    const passRate = totalExecutions > 0 ? ((passCount / totalExecutions) * 100).toFixed(1) : 0;

    res.json({
        success: true,
        data: {
            totalTestSuites,
            totalTestCases,
            totalExecutions,
            passRate: parseFloat(passRate),
            recentExecutions: recentExecutions.map(exec => ({
                id: exec.id,
                testCaseName: exec.testCase.name,
                status: exec.status,
                verdict: exec.verdict,
                startedAt: exec.startedAt
            }))
        }
    });
}));

// Test Suites Routes
router.get('/test-suites', asyncHandler(async (req, res) => {
    const suites = await prismaService.client.testSuite.findMany({
        include: {
            testCases: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    prompt: true,
                    testType: true,
                    createdAt: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json({
        success: true,
        data: suites
    });
}));

router.get('/test-suites/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const suite = await prismaService.client.testSuite.findUnique({
        where: { id },
        include: { testCases: true }
    });

    if (!suite) {
        return res.status(404).json({ success: false, error: 'Test suite not found' });
    }

    res.json({ success: true, data: suite });
}));

// Test Executions Routes
router.get('/test-executions', asyncHandler(async (req, res) => {
    const { limit = 50, offset = 0 } = req.query;

    const [executions, total] = await Promise.all([
        prismaService.client.testExecution.findMany({
            take: parseInt(limit),
            skip: parseInt(offset),
            orderBy: { startedAt: 'desc' },
            include: {
                testCase: {
                    select: { name: true, testType: true }
                }
            }
        }),
        prismaService.client.testExecution.count()
    ]);

    res.json({
        success: true,
        data: executions.map(exec => ({
            id: exec.id,
            testCaseName: exec.testCase.name,
            testType: exec.testCase.testType,
            status: exec.status,
            verdict: exec.verdict,
            startedAt: exec.startedAt,
            completedAt: exec.completedAt,
            durationMs: exec.durationMs,
            promptUsed: exec.promptUsed,
            aiResponse: exec.aiResponse?.substring(0, 500) + '...' // Truncate for list view
        })),
        pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: parseInt(offset) + parseInt(limit) < total
        }
    });
}));

router.post('/test-executions', asyncHandler(async (req, res) => {
    const { testCaseId, options = {} } = req.body;

    if (!testCaseId) {
        return res.status(400).json({ success: false, error: 'testCaseId is required' });
    }

    const testCase = await prismaService.client.testCase.findUnique({
        where: { id: testCaseId }
    });

    if (!testCase) {
        return res.status(404).json({ success: false, error: 'Test case not found' });
    }

    const result = await testExecutionService.executeTestCase(testCaseId, options);

    res.json({
        success: true,
        message: 'Test execution started',
        data: result
    });
}));

router.get('/test-executions/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;

    const execution = await prismaService.client.testExecution.findUnique({
        where: { id },
        include: {
            testCase: { include: { suite: true } },
            aiQualityMetrics: true,
            performanceMetrics: true
        }
    });

    if (!execution) {
        return res.status(404).json({ success: false, error: 'Test execution not found' });
    }

    res.json({ success: true, data: execution });
}));

// Results Export Route
router.get('/results/export', asyncHandler(async (req, res) => {
    const { format = 'json', limit = 1000 } = req.query;

    const executions = await prismaService.client.testExecution.findMany({
        take: parseInt(limit),
        orderBy: { startedAt: 'desc' },
        include: {
            testCase: { select: { name: true, testType: true } },
            aiQualityMetrics: true,
            performanceMetrics: true
        }
    });

    if (format === 'csv') {
        const csvHeaders = [
            'ID', 'Test Case', 'Type', 'Status', 'Verdict', 'Started At',
            'Duration (ms)', 'Response Time (ms)', 'Hallucination Score'
        ].join(',');

        const csvRows = executions.map(exec => [
            exec.id,
            `"${exec.testCase.name}"`,
            exec.testCase.testType,
            exec.status,
            exec.verdict,
            exec.startedAt,
            exec.durationMs || '',
            exec.performanceMetrics?.responseTimeMs || '',
            exec.aiQualityMetrics?.hallucinationScore || ''
        ].join(','));

        const csv = [csvHeaders, ...csvRows].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="test-results.csv"');
        return res.send(csv);
    }

    res.json({ success: true, data: executions, count: executions.length });
}));

router.get('/results/summary', asyncHandler(async (req, res) => {
    const totalExecutions = await prismaService.client.testExecution.count();
    const passCount = await prismaService.client.testExecution.count({ where: { verdict: 'pass' } });
    const passRate = totalExecutions > 0 ? ((passCount / totalExecutions) * 100).toFixed(1) : 0;

    res.json({
        success: true,
        data: {
            summary: {
                totalExecutions,
                passRate: parseFloat(passRate)
            }
        }
    });
}));

module.exports = router;
