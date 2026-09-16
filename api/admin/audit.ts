import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json(logs);
    }

    if (req.method === 'POST') {
      const { userId, userName, action, recordId, details } = req.body || {};
      if (!userId || !userName || !action || !details) {
        return res.status(400).json({ error: 'Missing audit log fields.' });
      }
      const log = await prisma.auditLog.create({ data: { userId, userName, action, recordId, details } });
      return res.status(201).json(log);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Audit request failed.' });
  } finally {
    await prisma.$disconnect();
  }
}
