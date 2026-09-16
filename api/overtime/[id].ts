import { PrismaClient } from '@prisma/client';
import { adToBS, formatBS, calcMinutes, parseADString } from '../../src/lib/nepaliDate';

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  const id = req.query?.id;
  if (!id) return res.status(400).json({ error: 'Record id is required.' });

  try {
    if (req.method === 'PATCH') {
      const existing = await prisma.overtimeRecord.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: 'Record not found.' });
      const body = req.body || {};
      const dateAD = body.dateAD ?? existing.dateAD;
      const startTime = body.startTime ?? existing.startTime;
      const endTime = body.endTime ?? existing.endTime;
      const type = body.type ?? existing.type;
      const department = body.department ?? existing.department;
      const settings = await prisma.rateSettings.findFirst({ orderBy: { createdAt: 'asc' } });
      const defaults: any = { otNursing: { Major: 1000, Intermediate: 800, Minor: 500 }, cleaning: { Major: 300, Intermediate: 300, Minor: 300 } };
      const rates: any = settings ?? defaults;
      const amount = department === 'Cleaning' ? rates.cleaning[type] : rates.otNursing[type];
      const updated = await prisma.overtimeRecord.update({
        where: { id },
        data: {
          ...body,
          dateAD,
          dateBS: formatBS(adToBS(parseADString(dateAD))),
          startTime,
          endTime,
          type,
          department,
          totalMinutes: calcMinutes(startTime, endTime),
          amount,
        },
      });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      await prisma.overtimeRecord.delete({ where: { id } });
      return res.status(204).end();
    }

    if (req.method === 'POST' && req.url?.endsWith('/verify')) {
      const { verified, adminName } = req.body || {};
      const updated = await prisma.overtimeRecord.update({
        where: { id },
        data: verified === false
          ? { status: 'PENDING', verifiedAt: null, verifiedBy: null }
          : { status: 'VERIFIED', verifiedAt: new Date(), verifiedBy: adminName || 'Administrator' },
      });
      return res.status(200).json(updated);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Record request failed.' });
  } finally {
    await prisma.$disconnect();
  }
}
