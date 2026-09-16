import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(_req: any, res: any) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      ok: true,
      status: 'healthy',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      status: 'unhealthy',
      database: 'not connected',
      error: error instanceof Error ? error.message : 'Database connection failed',
    });
  } finally {
    await prisma.$disconnect();
  }
}
