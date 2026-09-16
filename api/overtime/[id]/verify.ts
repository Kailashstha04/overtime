import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { id } = req.query || {};
    const { verified, adminName } = req.body || {};
    const record = await prisma.overtimeRecord.update({
      where: { id },
      data: verified === false
        ? { status: 'PENDING', verifiedAt: null, verifiedBy: null }
        : { status: 'VERIFIED', verifiedAt: new Date(), verifiedBy: adminName || 'Administrator' },
    });
    return res.status(200).json(record);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Verification failed.' });
  } finally {
    await prisma.$disconnect();
  }
}
