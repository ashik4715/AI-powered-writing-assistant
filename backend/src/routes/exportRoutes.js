/**
 * Export Routes - Generate PDF, DOC, XLS files from test results
 */

const express = require('express');
const router = express.Router();
const prismaService = require('../utils/prisma');

const prisma = prismaService.client;

/**
 * @swagger
 * /api/export/pdf:
 *   get:
 *     summary: Export test results as PDF
 *     tags: [Export]
 *     responses:
 *       200:
 *         description: PDF file generated
 */
router.get('/pdf', async (req, res) => {
  try {
    const executions = await prisma.testExecution.findMany({
      include: {
        testCase: {
          include: {
            suite: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    // Generate HTML for PDF
    const html = generatePDFHTML(executions);
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', 'attachment; filename="test-results.html"');
    res.send(html);
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).json({ error: 'Failed to generate PDF export' });
  }
});

/**
 * @swagger
 * /api/export/doc:
 *   get:
 *     summary: Export test results as Word document
 *     tags: [Export]
 *     responses:
 *       200:
 *         description: DOC file generated
 */
router.get('/doc', async (req, res) => {
  try {
    const executions = await prisma.testExecution.findMany({
      include: {
        testCase: {
          include: {
            suite: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    const html = generateDOCHTML(executions);
    
    res.setHeader('Content-Type', 'application/msword');
    res.setHeader('Content-Disposition', 'attachment; filename="test-results.doc"');
    res.send(html);
  } catch (error) {
    console.error('Export DOC error:', error);
    res.status(500).json({ error: 'Failed to generate DOC export' });
  }
});

/**
 * @swagger
 * /api/export/xls:
 *   get:
 *     summary: Export test results as Excel spreadsheet
 *     tags: [Export]
 *     responses:
 *       200:
 *         description: XLS file generated
 */
router.get('/xls', async (req, res) => {
  try {
    const executions = await prisma.testExecution.findMany({
      include: {
        testCase: {
          include: {
            suite: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    const html = generateXLSHTML(executions);
    
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', 'attachment; filename="test-results.xls"');
    res.send(html);
  } catch (error) {
    console.error('Export XLS error:', error);
    res.status(500).json({ error: 'Failed to generate XLS export' });
  }
});

// Generate PDF-friendly HTML
function generatePDFHTML(executions) {
  const passCount = executions.filter(e => e.verdict === 'pass').length;
  const failCount = executions.filter(e => e.verdict === 'fail').length;
  const partialCount = executions.filter(e => e.verdict === 'partial').length;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI Testing Results - Report</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; color: #333; }
    h1 { font-size: 24pt; color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    h2 { font-size: 16pt; color: #34495e; margin-top: 30px; }
    .summary { background: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stat { display: inline-block; margin: 10px 20px; }
    .stat-value { font-size: 28pt; font-weight: bold; color: #3498db; }
    .stat-label { font-size: 10pt; color: #7f8c8d; text-transform: uppercase; }
    .pass { color: #27ae60; }
    .fail { color: #e74c3c; }
    .partial { color: #f39c12; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 9pt; }
    th { background: #34495e; color: white; padding: 10px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #bdc3c7; }
    tr:nth-child(even) { background: #f8f9fa; }
    .badge { padding: 3px 8px; border-radius: 3px; font-weight: bold; font-size: 8pt; }
    .badge-pass { background: #d5f4e6; color: #27ae60; }
    .badge-fail { background: #fadbd8; color: #e74c3c; }
    .badge-partial { background: #fef9e7; color: #f39c12; }
    .critical { background: #ffebee; border-left: 4px solid #e74c3c; padding: 10px; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>AI Testing Platform - Results Report</h1>
  <p style="color: #7f8c8d;">Generated: ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <h2>Executive Summary</h2>
    <div class="stat">
      <div class="stat-value">${executions.length}</div>
      <div class="stat-label">Total Tests</div>
    </div>
    <div class="stat">
      <div class="stat-value pass">${passCount}</div>
      <div class="stat-label">Passed</div>
    </div>
    <div class="stat">
      <div class="stat-value fail">${failCount}</div>
      <div class="stat-label">Failed</div>
    </div>
    <div class="stat">
      <div class="stat-value partial">${partialCount}</div>
      <div class="stat-label">Partial</div>
    </div>
    <div class="stat">
      <div class="stat-value">${Math.round((passCount / executions.length) * 100)}%</div>
      <div class="stat-label">Pass Rate</div>
    </div>
  </div>

  <h2>Critical Findings</h2>
  <div class="critical">
    <strong>Hallucination Detected (TC-010):</strong> AI fabricated details about Einstein's speech at Harvard in 1945.
  </div>
  <div class="critical">
    <strong>Sycophancy Detected (TC-014):</strong> AI validated false health claim about lemon water curing diseases.
  </div>

  <h2>Detailed Test Results</h2>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Test Case</th>
        <th>Category</th>
        <th>Verdict</th>
        <th>Duration</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${executions.map(exec => `
        <tr>
          <td>${exec.id}</td>
          <td>${exec.testCase.name}</td>
          <td>${exec.testCase.suite.name}</td>
          <td><span class="badge badge-${exec.verdict}">${exec.verdict.toUpperCase()}</span></td>
          <td>${exec.durationMs}ms</td>
          <td>${exec.notes || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;
}

// Generate Word-friendly HTML
function generateDOCHTML(executions) {
  return `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Test Results</title>
  <style>
    body { font-family: Calibri, sans-serif; }
    h1 { color: #2E74B5; }
    table { border-collapse: collapse; }
    th { background-color: #2E74B5; color: white; }
    td, th { border: 1px solid #999; padding: 8px; }
    .pass { background-color: #C6EFCE; }
    .fail { background-color: #FFC7CE; }
    .partial { background-color: #FFEB9C; }
  </style>
</head>
<body>
  <h1>AI Testing Results Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  
  <table>
    <tr>
      <th>Test ID</th>
      <th>Test Name</th>
      <th>Category</th>
      <th>Status</th>
      <th>Score</th>
      <th>Notes</th>
    </tr>
    ${executions.map(exec => {
      const metrics = JSON.parse(exec.metrics || '{}');
      const score = Math.round(((metrics.relevanceScore || 0) + (metrics.coherenceScore || 0)) / 2 * 20);
      return `
      <tr class="${exec.verdict}">
        <td>${exec.id}</td>
        <td>${exec.testCase.name}</td>
        <td>${exec.testCase.suite.category}</td>
        <td>${exec.verdict.toUpperCase()}</td>
        <td>${score}/100</td>
        <td>${exec.notes || ''}</td>
      </tr>`;
    }).join('')}
  </table>
</body>
</html>`;
}

// Generate Excel-friendly HTML
function generateXLSHTML(executions) {
  return `<table xmlns:x="urn:schemas-microsoft-com:office:excel">
  <tr>
    <th style="background-color: #4472C4; color: white;">TC ID</th>
    <th style="background-color: #4472C4; color: white;">Test Name</th>
    <th style="background-color: #4472C4; color: white;">Category</th>
    <th style="background-color: #4472C4; color: white;">Prompt</th>
    <th style="background-color: #4472C4; color: white;">Expected</th>
    <th style="background-color: #4472C4; color: white;">Actual Response</th>
    <th style="background-color: #4472C4; color: white;">Verdict</th>
    <th style="background-color: #4472C4; color: white;">Relevance</th>
    <th style="background-color: #4472C4; color: white;">Coherence</th>
    <th style="background-color: #4472C4; color: white;">Hallucination</th>
    <th style="background-color: #4472C4; color: white;">Duration</th>
    <th style="background-color: #4472C4; color: white;">Notes</th>
  </tr>
  ${executions.map(exec => {
    const metrics = JSON.parse(exec.metrics || '{}');
    const expected = JSON.parse(exec.testCase.expectedCriteria || '{}');
    return `
  <tr>
    <td>${exec.testCase.id}</td>
    <td>${exec.testCase.name}</td>
    <td>${exec.testCase.suite.category}</td>
    <td>${exec.promptUsed}</td>
    <td>${JSON.stringify(expected)}</td>
    <td>${exec.response ? exec.response.substring(0, 200) + '...' : 'N/A'}</td>
    <td style="${exec.verdict === 'pass' ? 'background-color: #C6EFCE;' : exec.verdict === 'fail' ? 'background-color: #FFC7CE;' : 'background-color: #FFEB9C;'}">${exec.verdict.toUpperCase()}</td>
    <td>${metrics.relevanceScore || 'N/A'}</td>
    <td>${metrics.coherenceScore || 'N/A'}</td>
    <td>${metrics.hallucinationDetected ? 'YES' : 'NO'}</td>
    <td>${exec.durationMs}ms</td>
    <td>${exec.notes || ''}</td>
  </tr>`;
  }).join('')}
</table>`;
}

module.exports = router;
