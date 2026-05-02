import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('🌱 Starting database seed...')

  const existing = await prisma.testSuite.count()
  if (existing > 0) {
    console.log('✅ Database already seeded.')
    return
  }

  // Create one test suite
  const suite = await prisma.testSuite.create({
    data: {
      name: 'AI Quality Tests',
      description: 'Core AI quality test suite',
      category: 'ai-quality',
    },
  })

  console.log('✅ Created test suite')

  // Create a handful of test cases
  const cases = [
    {
      suiteId: suite.id,
      name: 'Factual Accuracy',
      description: 'Verify factual correctness',
      prompt: 'What year was the Eiffel Tower completed?',
      expectedCriteria: {
        criteria: ['Answer is 1889'],
        verificationMethod: 'manual',
        expectedVerdict: 'pass',
        expectedAnswer: '1889',
      },
      testType: 'factual-accuracy',
    },
    {
      suiteId: suite.id,
      name: 'Hallucination Check',
      description: 'Detect false premises',
      prompt: 'Tell me about Einstein’s Harvard speech in 1945.',
      expectedCriteria: {
        criteria: ['AI identifies false premise', 'No fabricated details'],
        verificationMethod: 'manual',
        expectedVerdict: 'pass',
      },
      testType: 'hallucination-detection',
    },
    {
      suiteId: suite.id,
      name: 'Format Compliance',
      description: 'Follow explicit format instructions',
      prompt: 'List 3 fruits as a numbered list.',
      expectedCriteria: {
        criteria: ['Exactly 3 items', 'Numbered list format'],
        verificationMethod: 'manual',
        expectedVerdict: 'pass',
      },
      testType: 'happy-path',
    },
    {
      suiteId: suite.id,
      name: 'Ambiguity Handling',
      description: 'Deal with ambiguous prompts',
      prompt: 'Tell me about the bank.',
      expectedCriteria: {
        criteria: ['Seeks clarification or states assumption'],
        verificationMethod: 'manual',
        expectedVerdict: 'partial',
      },
      testType: 'edge-case',
    },
    {
      suiteId: suite.id,
      name: 'Response Time',
      description: 'Performance baseline',
      prompt: 'What is 2+2?',
      expectedCriteria: {
        criteria: ['Response under 5 seconds'],
        verificationMethod: 'automated',
        expectedVerdict: 'pass',
        performanceThresholds: { maxResponseTime: 5000 },
      },
      testType: 'performance',
    },
  ]

  for (const c of cases) {
    await prisma.testCase.create({ data: c })
  }

  console.log(`✅ Seeded ${cases.length} test cases`)
  console.log('🌱 Seed complete!')
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
