const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const aiService = require('../services/aiService');

/**
 * @route GET /api/ai/health
 * @desc Check AI service health
 */
router.get('/health', asyncHandler(async (req, res) => {
    const healthCheck = await aiService.testConnection();

    res.json({
        success: healthCheck.connected,
        data: healthCheck,
        timestamp: new Date().toISOString(),
    });
}));

/**
 * @route POST /api/ai/generate
 * @desc Generate a response from AI
 */
router.post('/generate', asyncHandler(async (req, res) => {
    const { prompt, options = {} } = req.body;

    if (!prompt) {
        return res.status(400).json({
            success: false,
            error: 'Prompt is required',
        });
    }

    const result = await aiService.generateResponse(prompt, options);

    res.json({
        success: true,
        data: result,
    });
}));

/**
 * @route POST /api/ai/batch-generate
 * @desc Generate responses for multiple prompts
 */
router.post('/batch-generate', asyncHandler(async (req, res) => {
    const { prompts, options = {} } = req.body;

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Prompts array is required and must not be empty',
        });
    }

    // Limit batch size for safety
    const maxBatchSize = 10;
    const limitedPrompts = prompts.slice(0, maxBatchSize);

    const result = await aiService.batchGenerate(limitedPrompts, {
        ...options,
        delayBetweenRequests: 100, // 100ms delay between requests
    });

    res.json({
        success: true,
        data: result,
        warning: prompts.length > maxBatchSize
            ? `Limited to first ${maxBatchSize} prompts`
            : undefined,
    });
}));

/**
 * @route POST /api/ai/evaluate
 * @desc Evaluate a response using AI-as-a-judge
 */
router.post('/evaluate', asyncHandler(async (req, res) => {
    const { prompt, response, criteria } = req.body;

    if (!prompt || !response) {
        return res.status(400).json({
            success: false,
            error: 'Prompt and response are required',
        });
    }

    const evaluation = await aiService.evaluateResponseQuality(
        prompt,
        response,
        criteria || {}
    );

    res.json({
        success: true,
        data: evaluation,
    });
}));

/**
 * @route POST /api/ai/safety-check
 * @desc Check response for safety violations
 */
router.post('/safety-check', asyncHandler(async (req, res) => {
    const { prompt, response } = req.body;

    if (!prompt || !response) {
        return res.status(400).json({
            success: false,
            error: 'Prompt and response are required',
        });
    }

    const safetyCheck = await aiService.checkSafety(prompt, response);

    res.json({
        success: true,
        data: safetyCheck,
    });
}));

/**
 * @route POST /api/ai/analyze
 * @desc Comprehensive analysis of AI response
 */
router.post('/analyze', asyncHandler(async (req, res) => {
    const { prompt, response } = req.body;

    if (!prompt || !response) {
        return res.status(400).json({
            success: false,
            error: 'Prompt and response are required',
        });
    }

    // Run multiple analyses in parallel
    const [qualityEvaluation, safetyCheck] = await Promise.all([
        aiService.evaluateResponseQuality(prompt, response, {
            relevance: 'How relevant is the response to the prompt?',
            accuracy: 'How accurate is the information provided?',
            coherence: 'How coherent and well-structured is the response?',
            completeness: 'How complete is the response in addressing the prompt?',
        }),
        aiService.checkSafety(prompt, response),
    ]);

    // Calculate overall score
    const scores = qualityEvaluation.scores || {};
    const scoreValues = Object.values(scores);
    const averageScore = scoreValues.length > 0
        ? scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length
        : 0;

    res.json({
        success: true,
        data: {
            qualityEvaluation,
            safetyCheck,
            overallScore: averageScore,
            isSafe: safetyCheck.is_safe !== false,
            verdict: qualityEvaluation.verdict || 'unknown',
            timestamp: new Date().toISOString(),
        },
    });
}));

/**
 * @route GET /api/ai/models
 * @desc Get available AI models (placeholder)
 */
router.get('/models', asyncHandler(async (req, res) => {
    // In a real implementation, this would fetch available models from the API
    res.json({
        success: true,
        data: {
            models: [
                {
                    id: 'deepseek-chat',
                    name: 'DeepSeek Chat',
                    description: 'General purpose chat model',
                    maxTokens: 4096,
                    capabilities: ['chat', 'completion', 'instruction-following'],
                },
                {
                    id: 'deepseek-coder',
                    name: 'DeepSeek Coder',
                    description: 'Code generation and explanation',
                    maxTokens: 4096,
                    capabilities: ['code-generation', 'code-explanation', 'debugging'],
                },
            ],
            currentModel: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        },
    });
}));

/**
 * @route POST /api/ai/compare
 * @desc Compare multiple AI responses
 */
router.post('/compare', asyncHandler(async (req, res) => {
    const { prompt, responses } = req.body;

    if (!prompt || !responses || !Array.isArray(responses) || responses.length < 2) {
        return res.status(400).json({
            success: false,
            error: 'Prompt and at least 2 responses are required',
        });
    }

    // Limit to 5 responses for performance
    const limitedResponses = responses.slice(0, 5);

    // Evaluate each response
    const evaluations = await Promise.all(
        limitedResponses.map((response, index) =>
            aiService.evaluateResponseQuality(prompt, response, {
                prompt,
                responseIndex: index,
            }).catch(error => ({
                error: error.message,
                responseIndex: index,
            }))
        )
    );

    // Rank responses by score
    const rankedResponses = evaluations
        .filter(eval => !eval.error)
        .map((eval, index) => ({
            response: limitedResponses[index],
            evaluation: eval,
            overallScore: Object.values(eval.scores || {}).reduce((a, b) => a + b, 0) /
                Object.keys(eval.scores || {}).length || 0,
        }))
        .sort((a, b) => b.overallScore - a.overallScore);

    res.json({
        success: true,
        data: {
            prompt,
            evaluations,
            rankedResponses,
            bestResponse: rankedResponses[0],
            worstResponse: rankedResponses[rankedResponses.length - 1],
        },
    });
}));

module.exports = router;