#!/usr/bin/env node
/**
 * Export Deliverables Script
 * Converts markdown deliverables to DOC, PDF, XLS, TXT formats
 */

const fs = require('fs');
const path = require('path');

const DELIVERABLES_DIR = path.join(__dirname, '..', 'deliverables');
const OUTPUT_DIR = path.join(__dirname, '..', 'exports');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Deliverables configuration
const deliverables = [
    { id: '01', name: 'Test_Plan', format: 'doc' },
    { id: '02', name: 'Test_Case_Log', format: 'xls' },
    { id: '03', name: 'Test_Findings_Report', format: 'pdf' },
    { id: '04', name: 'Reflective_Section', format: 'txt' },
    { id: '05', name: 'Automation_Proposal', format: 'txt' }
];

/**
 * Convert markdown to DOC format (HTML wrapper for Word)
 */
function convertToDoc(markdown, title) {
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: Calibri, Arial, sans-serif; line-height: 1.6; margin: 40px; }
        h1 { color: #2E74B5; font-size: 24pt; }
        h2 { color: #2E74B5; font-size: 18pt; margin-top: 24pt; }
        h3 { color: #404040; font-size: 14pt; }
        table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
        th, td { border: 1px solid #999; padding: 8px; text-align: left; }
        th { background-color: #2E74B5; color: white; }
        tr:nth-child(even) { background-color: #F2F2F2; }
        code { font-family: Consolas, monospace; background: #F5F5F5; padding: 2px 4px; }
        pre { background: #F5F5F5; padding: 12px; overflow-x: auto; }
        blockquote { border-left: 4px solid #2E74B5; margin: 0; padding-left: 16px; color: #555; }
    </style>
</head>
<body>
${markdownToHtml(markdown)}
</body>
</html>`;
    return html;
}

/**
 * Convert markdown to simple HTML
 */
function markdownToHtml(markdown) {
    return markdown
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/^\|(.+)\|$/gm, (match) => {
            const cells = match.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
        })
        .replace(/(<tr>.*<\/tr>\n)+/g, '<table>$&</table>')
        .replace(/^\s*-\s+(.*$)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>')
        .replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n)+/g, '<ol>$&</ol>')
        .replace(/^>(.*$)/gm, '<blockquote>$1</blockquote>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<[h|u|o|t|l|b|p|d])(.*$)/gm, '<p>$1</p>');
}

/**
 * Convert markdown to XLS (HTML table format for Excel)
 */
function convertToXls(markdown, title) {
    // Extract test cases from the markdown
    const testCases = extractTestCases(markdown);
    
    let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        table { border-collapse: collapse; }
        th { background-color: #4472C4; color: white; font-weight: bold; }
        th, td { border: 1px solid #4472C4; padding: 8px; }
        .pass { background-color: #C6EFCE; }
        .fail { background-color: #FFC7CE; }
        .partial { background-color: #FFEB9C; }
        .critical { color: #C00000; font-weight: bold; }
        .high { color: #FF6600; }
        .medium { color: #FFC000; }
    </style>
</head>
<body>
<h2>${title}</h2>
<table>
<tr>
    <th>TC ID</th>
    <th>Category</th>
    <th>Prompt</th>
    <th>Expected Behavior</th>
    <th>Actual Output</th>
    <th>Pass/Fail</th>
    <th>Severity</th>
    <th>Notes</th>
</tr>`;

    testCases.forEach(tc => {
        const rowClass = tc.result === 'PASS' ? 'pass' : tc.result === 'FAIL' ? 'fail' : 'partial';
        const sevClass = tc.severity === 'Critical' ? 'critical' : tc.severity === 'High' ? 'high' : 'medium';
        
        html += `
<tr class="${rowClass}">
    <td>${tc.id}</td>
    <td>${tc.category}</td>
    <td>${escapeHtml(tc.prompt)}</td>
    <td>${escapeHtml(tc.expected)}</td>
    <td>${escapeHtml(tc.actual)}</td>
    <td>${tc.result}</td>
    <td class="${sevClass}">${tc.severity}</td>
    <td>${escapeHtml(tc.notes)}</td>
</tr>`;
    });

    html += `</table></body></html>`;
    return html;
}

/**
 * Extract test cases from markdown
 */
function extractTestCases(markdown) {
    const testCases = [];
    const regex = /#### TC-(\d+):\s*(.+?)\n[\s\S]*?\| \*\*Category\*\* \| (.+?) \|[\s\S]*?\| \*\*Prompt\*\* \| (.+?) \|[\s\S]*?\| \*\*Expected Behavior\*\* \| ([\s\S]*?) \|[\s\S]*?\| \*\*Actual Output Summary\*\* \| ([\s\S]*?) \|[\s\S]*?\| \*\*Pass\/Fail\*\* \| \*\*(.+?)\*\* \|[\s\S]*?\| \*\*Severity\*\* \| (.+?) \|[\s\S]*?\| \*\*Notes\*\* \| (.+?) \|/g;
    
    let match;
    while ((match = regex.exec(markdown)) !== null) {
        testCases.push({
            id: `TC-${match[1]}`,
            name: match[2].trim(),
            category: match[3].trim(),
            prompt: match[4].trim(),
            expected: match[5].trim(),
            actual: match[6].trim(),
            result: match[7].trim(),
            severity: match[8].trim(),
            notes: match[9].trim()
        });
    }
    
    return testCases;
}

/**
 * Escape HTML entities
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Convert markdown to PDF-friendly HTML
 */
function convertToPdf(markdown, title) {
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        @page { size: A4; margin: 25mm; }
        body { 
            font-family: "Times New Roman", Times, serif; 
            font-size: 11pt; 
            line-height: 1.5;
            color: #000;
        }
        h1 { font-size: 18pt; color: #000; border-bottom: 2px solid #000; padding-bottom: 10pt; }
        h2 { font-size: 14pt; color: #000; margin-top: 18pt; }
        h3 { font-size: 12pt; color: #333; }
        table { border-collapse: collapse; width: 100%; margin: 12pt 0; font-size: 9pt; }
        th, td { border: 1px solid #333; padding: 6px; }
        th { background-color: #eee; }
        .critical { color: #cc0000; font-weight: bold; }
        .high { color: #ff6600; }
        code { font-family: "Courier New", monospace; font-size: 9pt; }
    </style>
</head>
<body>
${markdownToHtml(markdown)}
</body>
</html>`;
    return html;
}

/**
 * Convert markdown to plain text
 */
function convertToTxt(markdown) {
    return markdown
        .replace(/# /g, '\n\n')
        .replace(/## /g, '\n')
        .replace(/### /g, '\n')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/\|/g, ' | ')
        .replace(/---/g, '\n---\n')
        .trim();
}

/**
 * Main export function
 */
function exportDeliverables() {
    console.log('📦 Exporting Deliverables...\n');

    deliverables.forEach(item => {
        const inputFile = path.join(DELIVERABLES_DIR, `${item.id}_${item.name}.md`);
        
        if (!fs.existsSync(inputFile)) {
            console.log(`⚠️  Skipping ${item.name} - file not found`);
            return;
        }

        const markdown = fs.readFileSync(inputFile, 'utf-8');
        const title = item.name.replace(/_/g, ' ');

        let output, extension;
        
        switch (item.format) {
            case 'doc':
                output = convertToDoc(markdown, title);
                extension = 'html';
                break;
            case 'xls':
                output = convertToXls(markdown, title);
                extension = 'html';
                break;
            case 'pdf':
                output = convertToPdf(markdown, title);
                extension = 'html';
                break;
            case 'txt':
                output = convertToTxt(markdown);
                extension = 'txt';
                break;
            default:
                output = markdown;
                extension = 'md';
        }

        const outputFile = path.join(OUTPUT_DIR, `${item.name}.${extension}`);
        fs.writeFileSync(outputFile, output);
        console.log(`✅ ${item.name} → exports/${item.name}.${extension}`);
    });

    // Also copy original markdowns
    const indexFile = path.join(DELIVERABLES_DIR, '00_INDEX.md');
    if (fs.existsSync(indexFile)) {
        fs.copyFileSync(indexFile, path.join(OUTPUT_DIR, 'INDEX.md'));
        console.log(`✅ INDEX.md → exports/INDEX.md`);
    }

    const readmeFile = path.join(DELIVERABLES_DIR, 'README.md');
    if (fs.existsSync(readmeFile)) {
        fs.copyFileSync(readmeFile, path.join(OUTPUT_DIR, 'README.md'));
        console.log(`✅ README.md → exports/README.md`);
    }

    console.log(`\n🎉 Export complete! Files saved to: ${OUTPUT_DIR}`);
    console.log('\nNext steps:');
    console.log('1. Open .html files in browser');
    console.log('2. For PDF: Print HTML to PDF using browser');
    console.log('3. For DOC: Open HTML in Word and Save As .docx');
    console.log('4. For XLS: Open HTML in Excel and Save As .xlsx');
}

// Run export
exportDeliverables();
