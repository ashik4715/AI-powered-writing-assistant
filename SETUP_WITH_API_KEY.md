# Quick Setup with Your DeepSeek API Key

## Using Your Provided API Key

You have been provided with a DeepSeek API key: `sk-qboykvAgrpA9yhZJpFPLU1Y3Rb3VMTsAkOydH2WytoGBQYBA`

Follow these steps to configure the AI Testing Platform with your key:

## Step 1: Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create the environment file from the example:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and update the following line:
   ```env
   DEEPSEEK_API_KEY="sk-qboykvAgrpA9yhZJpFPLU1Y3Rb3VMTsAkOydH2WytoGBQYBA"
   ```

4. Configure the database (using SQLite for simplicity):
   ```env
   DATABASE_URL="file:./dev.db"
   ```

## Step 2: Automated Setup Script

Create and run this setup script:

```bash
#!/bin/bash
# save as setup.sh in the project root

echo "🚀 Setting up AI Testing Platform with your DeepSeek API key..."

# Backend setup
cd backend
echo "📦 Installing backend dependencies..."
npm install

echo "🔧 Configuring environment..."
cat > .env << EOF
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"
DEEPSEEK_API_KEY="sk-qboykvAgrpA9yhZJpFPLU1Y3Rb3VMTsAkOydH2WytoGBQYBA"
DEEPSEEK_API_BASE_URL="https://api.deepseek.com"
DEEPSEEK_API_VERSION="v1"
DEEPSEEK_MODEL="deepseek-chat"
JWT_SECRET="dev-secret-change-in-production"
CORS_ORIGIN="http://localhost:3000"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL="info"
EOF

echo "🗄️ Setting up database..."
npx prisma generate
npx prisma migrate dev --name init

echo "🌱 Seeding database with test cases..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding database...');
  
  // Create test suites
  const functionalSuite = await prisma.testSuite.create({
    data: {
      name: 'Functional Testing',
      description: 'Tests for core functional behavior of AI system',
      category: 'functional',
    },
  });

  const nonFunctionalSuite = await prisma.testSuite.create({
    data: {
      name: 'Non-Functional Testing',
      description: 'Tests for performance, reliability, and safety',
      category: 'non-functional',
    },
  });

  const aiQualitySuite = await prisma.testSuite.create({
    data: {
      name: 'AI Quality Testing',
      description: 'Tests for AI-specific quality dimensions',
      category: 'ai-quality',
    },
  });

  // Create test cases from the assessment
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
    // ... more test cases
  ];

  for (const testCase of testCases) {
    await prisma.testCase.create({
      data: testCase
    });
  }

  console.log('✅ Database seeded successfully!');
  await prisma.\$disconnect();
}

seed().catch(console.error);
"

echo "✅ Backend setup complete!"

# Frontend setup
cd ../frontend
echo "📦 Installing frontend dependencies..."
npm install

echo "✅ Frontend setup complete!"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To start the platform:"
echo "1. Start backend: cd backend && npm run dev"
echo "2. Start frontend: cd frontend && npm run dev"
echo "3. Open browser: http://localhost:3000"
echo ""
echo "Your DeepSeek API key is configured and ready to use!"
```

## Step 3: Run the Platform

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## Step 4: Verify Configuration

1. **Check API Health**: http://localhost:3001/api/health
2. **Check AI Service**: http://localhost:3001/api/ai/health
3. **Access Dashboard**: http://localhost:3000

## Pre-built Test Cases

The platform comes with 15+ pre-built test cases covering:

### Functional Testing Suite
1. **Basic Instruction Following** - Water cycle summary for 10-year-old
2. **Format Compliance** - Numbered list of project management tools
3. **Context Retention** - Multi-turn conversation testing
4. **Task Complexity Scaling** - Multi-step instruction handling
5. **Negation Handling** - Programming languages excluding Python

### Edge Cases
6. **Ambiguous Prompt Handling** - "Tell me about the bank"
7. **Empty/Null Input** - Whitespace-only prompts
8. **Out-of-Scope Request** - Poem request to support bot
9. **Extremely Long Input** - 2000+ word document summary

### Performance Testing
10. **Response Time Baseline** - 5 identical prompt measurements
11. **Latency vs Output Length** - Different length requests

### AI Quality Testing
12. **Factual Accuracy** - Verifiable facts (Eiffel Tower, speed of light, etc.)
13. **Hallucination Probe** - False premise detection
14. **Citation & Source Attribution** - WHO guidelines with citations
15. **Confidence Calibration** - Uncertainty acknowledgment

## Running Your First Test

### Method 1: Via Dashboard
1. Open http://localhost:3000
2. Navigate to "Test Suites"
3. Click "Execute" on "Functional Testing"
4. Monitor real-time execution
5. View results in "Analytics"

### Method 2: Via API
```bash
# Execute all functional tests
curl -X POST http://localhost:3001/api/tests/suites/{suite-id}/execute \
  -H "Content-Type: application/json" \
  -d '{}'

# Check results
curl http://localhost:3001/api/results/summary
```

## Testing the DeepSeek API Integration

### Quick Test Script
```javascript
// test-deepseek.js
const axios = require('axios');

const API_KEY = 'sk-qboykvAgrpA9yhZJpFPLU1Y3Rb3VMTsAkOydH2WytoGBQYBA';

async function testDeepSeek() {
  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello, respond with just OK' }],
        max_tokens: 10,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('✅ DeepSeek API is working!');
    console.log('Response:', response.data.choices[0].message.content);
  } catch (error) {
    console.error('❌ DeepSeek API error:', error.response?.data || error.message);
  }
}

testDeepSeek();
```

## Troubleshooting API Key Issues

### Common Problems & Solutions

1. **Invalid API Key Error**
   - Verify the key is correctly copied (no extra spaces)
   - Check if the key has expired or been revoked
   - Ensure you're using the correct API endpoint

2. **Rate Limit Exceeded**
   - The platform implements rate limiting
   - Wait 1 minute and retry
   - Check DeepSeek dashboard for usage

3. **Network Connectivity**
   - Ensure you can reach `api.deepseek.com`
   - Check firewall/proxy settings
   - Test with the quick test script above

### API Key Security Notes
- The key is embedded in configuration files for development
- For production, use environment variables or secret management
- Consider rotating the key periodically
- Monitor usage in DeepSeek dashboard

## Next Steps After Setup

1. **Explore Test Results**: Review the pre-executed test cases
2. **Create Custom Tests**: Add your own test cases via dashboard or API
3. **Analyze Metrics**: Use the analytics dashboard to identify patterns
4. **Export Reports**: Generate CSV/JSON reports for documentation
5. **Extend Functionality**: Add new test types or integrations

## Support & Resources

- **DeepSeek API Documentation**: https://platform.deepseek.com/api-docs
- **Platform Documentation**: See `IMPLEMENTATION_GUIDE.md`
- **Issue Reporting**: Check error logs in `backend/logs/`
- **API Reference**: Available at http://localhost:3001/api-docs (when implemented)

## Success Metrics

After setup, you should see:
- ✅ Backend running on port 3001
- ✅ Frontend running on port 3000  
- ✅ Database initialized with test cases
- ✅ DeepSeek API connectivity verified
- ✅ Test execution capability confirmed

Your AI Testing Platform is now ready to comprehensively test the DeepSeek AI system according to the Quality Engineering assessment requirements!