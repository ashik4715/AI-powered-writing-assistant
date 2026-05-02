const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const prismaService = require('../utils/prisma');

/**
 * @openapi
 * /results/summary:
 *   get:
 *     summary: Get overall test results summary
 *     description: Returns aggregate statistics about test executions including pass rate, average duration, and verdict distribution
 *     tags: [Results]
 *     responses:
 *       200:
 *         description: Summary statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalExecutions:
 *                           type: integer
 *                           example: 150
 *                         passRate:
 *                           type: number
 *                           example: 87.5
 *                         avgDuration:
 *                           type: integer
 *                           example: 1250
 *                         verdictDistribution:
 *                           type: array
 *                           items:
 *                             type: object
 *                     recentExecutions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TestExecution'
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/summary', asyncHandler(async (req, res) => {
    const [totalExecutions, verdictStats, suiteStats, recentExecutions] = await Promise.all([
        // Total executions count
        prismaService.client.testExecution.count(),

        // Verdict distribution
        prismaService.client.testExecution.groupBy({
            by: ['verdict'],
            _count: {
                id: true,
            },
        }),

        // Suite performance
        prismaService.client.testExecution.groupBy({
            by: ['testCase', 'suite'],
            where: {
                testCase: {
                    suite: {
                        id: { not: undefined },
                    },
                },
            },
            _count: {
                id: true,
            },
            _avg: {
                durationMs: true,
            },
        }),

        // Recent executions
        prismaService.client.testExecution.findMany({
            take: 10,
            orderBy: { startedAt: 'desc' },
            include: {
                testCase: {
                    include: {
                        suite: true,
                    },
                },
            },
        }),
    ]);

    // Calculate pass rate
    const passedExecutions = verdictStats.find(v => v.verdict === 'pass')?._count?.id || 0;
    const passRate = totalExecutions > 0 ? (passedExecutions / totalExecutions) * 100 : 0;

    // Calculate average duration
    const allDurations = suiteStats.map(s => s._avg.durationMs).filter(d => d);
    const avgDuration = allDurations.length > 0
        ? allDurations.reduce((sum, d) => sum + d, 0) / allDurations.length
        : 0;

    res.json({
        success: true,
        data: {
            summary: {
                totalExecutions,
                passRate: Math.round(passRate * 100) / 100,
                avgDuration: Math.round(avgDuration),
                verdictDistribution: verdictStats,
            },
            recentExecutions,
            timestamp: new Date().toISOString(),
        },
    });
}));

/**
 * @route GET /api/results/trends
 * @desc Get test execution trends over time
 */
router.get('/trends', asyncHandler(async (req, res) => {
    const { days = 7 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Get daily execution counts
    const dailyExecutions = await prismaService.client.$queryRaw`
    SELECT 
      DATE(started_at) as date,
      COUNT(*) as count,
      SUM(CASE WHEN verdict = 'pass' THEN 1 ELSE 0 END) as passed,
      SUM(CASE WHEN verdict = 'fail' THEN 1 ELSE 0 END) as failed,
      AVG(duration_ms) as avg_duration
    FROM test_executions
    WHERE started_at >= ${daysAgo}
    GROUP BY DATE(started_at)
    ORDER BY date DESC
  `;

    // Get hourly distribution for last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const hourlyExecutions = await prismaService.client.$queryRaw`
    SELECT 
      EXTRACT(HOUR FROM started_at) as hour,
      COUNT(*) as count
    FROM test_executions
    WHERE started_at >= ${yesterday}
    GROUP BY EXTRACT(HOUR FROM started_at)
    ORDER BY hour
  `;

    res.json({
        success: true,
        data: {
            dailyExecutions,
            hourlyExecutions,
            timeRange: {
                start: daysAgo.toISOString(),
                end: new Date().toISOString(),
                days: parseInt(days),
            },
        },
    });
}));

/**
 * @route GET /api/results/quality-metrics
 * @desc Get AI quality metrics summary
 */
router.get('/quality-metrics', asyncHandler(async (req, res) => {
    const { limit = 100 } = req.query;

    const qualityMetrics = await prismaService.client.aiQualityMetric.findMany({
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
            execution: {
                include: {
                    testCase: {
                        include: {
                            suite: true,
                        },
                    },
                },
            },
        },
    });

    // Calculate averages
    const metrics = qualityMetrics.filter(m =>
        m.hallucinationScore !== null ||
        m.relevanceScore !== null ||
        m.coherenceScore !== null
    );

    const avgHallucinationScore = metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.hallucinationScore || 0), 0) / metrics.length
        : 0;

    const avgRelevanceScore = metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.relevanceScore || 0), 0) / metrics.length
        : 0;

    const avgCoherenceScore = metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.coherenceScore || 0), 0) / metrics.length
        : 0;

    const safetyViolations = metrics.filter(m => m.safetyViolation === true).length;
    const biasDetected = metrics.filter(m => m.biasDetected === true).length;
    const factualInaccuracies = metrics.filter(m => m.factualAccuracy === false).length;

    res.json({
        success: true,
        data: {
            qualityMetrics,
            summary: {
                avgHallucinationScore: Math.round(avgHallucinationScore * 100) / 100,
                avgRelevanceScore: Math.round(avgRelevanceScore * 100) / 100,
                avgCoherenceScore: Math.round(avgCoherenceScore * 100) / 100,
                safetyViolations,
                biasDetected,
                factualInaccuracies,
                totalMetrics: metrics.length,
            },
        },
    });
}));

/**
 * @route GET /api/results/performance-metrics
 * @desc Get performance metrics summary
 */
router.get('/performance-metrics', asyncHandler(async (req, res) => {
    const { limit = 100 } = req.query;

    const performanceMetrics = await prismaService.client.performanceMetric.findMany({
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
            execution: {
                include: {
                    testCase: {
                        include: {
                            suite: true,
                        },
                    },
                },
            },
        },
    });

    // Calculate statistics
    const responseTimes = performanceMetrics.map(m => m.responseTimeMs).filter(t => t);
    const tokensPerSecond = performanceMetrics.map(m => m.tokensPerSecond).filter(t => t);
    const timeToFirstToken = performanceMetrics.map(m => m.timeToFirstTokenMs).filter(t => t);

    const calculateStats = (values) => {
        if (values.length === 0) return null;

        const sorted = values.sort((a, b) => a - b);
        const avg = sorted.reduce((sum, val) => sum + val, 0) / sorted.length;
        const p95 = sorted[Math.floor(sorted.length * 0.95)];
        const p99 = sorted[Math.floor(sorted.length * 0.99)];

        return {
            avg: Math.round(avg),
            min: Math.round(sorted[0]),
            max: Math.round(sorted[sorted.length - 1]),
            p95: Math.round(p95),
            p99: Math.round(p99),
            count: sorted.length,
        };
    };

    res.json({
        success: true,
        data: {
            performanceMetrics,
            statistics: {
                responseTime: calculateStats(responseTimes),
                tokensPerSecond: calculateStats(tokensPerSecond),
                timeToFirstToken: calculateStats(timeToFirstToken),
            },
        },
    });
}));

/**
 * @openapi
 * /results/export:
 *   get:
 *     summary: Export test results
 *     description: Download test results in JSON or CSV format. Supports filtering by limit.
 *     tags: [Results]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Export format (json or csv)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 1000
 *           maximum: 10000
 *         description: Maximum number of records to export
 *     responses:
 *       200:
 *         description: Results exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TestExecution'
 *                 exportInfo:
 *                   type: object
 *           text/csv:
 *             schema:
 *               type: string
 *               description: CSV formatted data with test results
 *       400:
 *         description: Invalid export format specified
 *       500:
 *         description: Internal server error
 */
router.get('/export', asyncHandler(async (req, res) => {
    const { format = 'json', limit = 1000 } = req.query;

    const executions = await prismaService.client.testExecution.findMany({
        take: parseInt(limit),
        orderBy: { startedAt: 'desc' },
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

    switch (format.toLowerCase()) {
        case 'csv':
            // Convert to CSV
            const csvHeaders = [
                'Execution ID',
                'Test Case',
                'Suite',
                'Status',
                'Verdict',
                'Duration (ms)',
                'Response Time (ms)',
                'Hallucination Score',
                'Relevance Score',
                'Started At',
            ];

            const csvRows = executions.map(exec => [
                exec.id,
                exec.testCase.name,
                exec.testCase.suite.name,
                exec.status,
                exec.verdict || 'N/A',
                exec.durationMs || 'N/A',
                exec.performanceMetrics?.[0]?.responseTimeMs || 'N/A',
                exec.aiQualityMetrics?.[0]?.hallucinationScore || 'N/A',
                exec.aiQualityMetrics?.[0]?.relevanceScore || 'N/A',
                exec.startedAt.toISOString(),
            ]);

            const csvContent = [
                csvHeaders.join(','),
                ...csvRows.map(row => row.map(cell => `"${cell}"`).join(',')),
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=test-results.csv');
            return res.send(csvContent);

        case 'json':
        default:
            res.json({
                success: true,
                data: executions,
                exportInfo: {
                    format: 'json',
                    count: executions.length,
                    exportedAt: new Date().toISOString(),
                },
            });
    }
}));

/**
 * @route DELETE /api/results/cleanup
 * @desc Clean up old test results (admin only)
 */
router.delete('/cleanup', asyncHandler(async (req, res) => {
    const { days = 30 } = req.query;

    if (parseInt(days) < 7) {
        return res.status(400).json({
            success: false,
            error: 'Cannot delete results less than 7 days old',
        });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    // Delete old executions and their related records
    const oldExecutions = await prismaService.client.testExecution.findMany({
        where: {
            startedAt: {
                lt: cutoffDate,
            },
        },
        select: {
            id: true,
        },
    });

    const executionIds = oldExecutions.map(e => e.id);

    if (executionIds.length === 0) {
        return res.json({
            success: true,
            message: 'No old results to clean up',
            deletedCount: 0,
        });
    }

    // Delete in transaction
    await prismaService.client.$transaction([
        prismaService.client.aiQualityMetric.deleteMany({
            where: {
                executionId: {
                    in: executionIds,
                },
            },
        }),
        prismaService.client.performanceMetric.deleteMany({
            where: {
                executionId: {
                    in: executionIds,
                },
            },
        }),
        prismaService.client.testExecution.deleteMany({
            where: {
                id: {
                    in: executionIds,
                },
            },
        }),
    ]);

    res.json({
        success: true,
        message: `Successfully cleaned up ${executionIds.length} old test results`,
        deletedCount: executionIds.length,
        cutoffDate: cutoffDate.toISOString(),
    });
}));

module.exports = router;