import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'
import { Pool } from 'pg'
import { PrismaClient } from '../../generated/prisma'

// Load environment variables from .env file
dotenv.config()

// Create a connection pool
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

// Add PrismaClient to globalThis to prevent hot reload from creating new instances
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// Create and export the PrismaClient instance
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

// Export the adapter and pool for direct use if needed
export { adapter, pool }

// Helper function to disconnect (useful for tests)
export async function disconnect() {
    await prisma.$disconnect()
    await pool.end()
}

// Helper function to check database connection
export async function checkConnection() {
    try {
        await prisma.$queryRaw`SELECT 1`
        return { connected: true }
    } catch (error) {
        return { connected: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export default prisma