import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaults = {
  otNursing: { Major: 1000, Intermediate: 800, Minor: 500 },
  cleaning: { Major: 300, Intermediate: 300, Minor: 300 },
};

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const settings = await prisma.rateSettings.findFirst({ orderBy: { createdAt: 'asc' } });
      return res.status(200).json(settings ? { otNursing: settings.otNursing, cleaning: settings.cleaning } : defaults);
    }

    if (req.method === 'PUT') {
      const { otNursing, cleaning } = req.body || {};
      const existing = await prisma.rateSettings.findFirst({ orderBy: { createdAt: 'asc' } });
      const settings = existing
        ? await prisma.rateSettings.update({ where: { id: existing.id }, data: { otNursing, cleaning } })
        : await prisma.rateSettings.create({ data: { otNursing, cleaning } });
      const records = await prisma.overtimeRecord.findMany({ select: { id: true, type: true, department: true } });
      await prisma.$transaction(
        records.map(record => prisma.overtimeRecord.update({
          where: { id: record.id },
          data: { amount: record.department === 'Cleaning' ? cleaning[record.type] : otNursing[record.type] },
        })),
      );
      return res.status(200).json({ otNursing: settings.otNursing, cleaning: settings.cleaning });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Settings request failed.' });
  } finally {
    await prisma.$disconnect();
  }
}
