import dotenv from 'dotenv'
import { PrismaClient } from '../generated/prisma'

// Load environment variables from .env
dotenv.config()

async function verify() {
  const prisma = new PrismaClient()

  try {
    const count = await prisma.testSuite.count()
    console.log('✅ Connected. Found', count, 'test suites in database.')
  } catch (error) {
    console.error('❌ Connection failed.')
    console.error('Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verify()
