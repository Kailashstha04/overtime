import { PrismaClient } from '@prisma/client';
import { adToBS, formatBS, calcMinutes, parseADString } from '../src/lib/nepaliDate';

const prisma = new PrismaClient();

async function amountFor(type: string, department: string) {
  const settings = await prisma.rateSettings.findFirst({ orderBy: { createdAt: 'asc' } });
  const defaults: any = { otNursing: { Major: 1000, Intermediate: 800, Minor: 500 }, cleaning: { Major: 300, Intermediate: 300, Minor: 300 } };
  const rates: any = settings ?? defaults;
  return department === 'Cleaning' ? rates.cleaning[type] : rates.otNursing[type];
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const records = await prisma.overtimeRecord.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json(records);
    }

    if (req.method === 'POST') {
      const { staffId, staffName, department, dateAD, patientName, procedure, type, shiftDuty, startTime, endTime, remarks } = req.body || {};
      if (!staffId || !staffName || !department || !dateAD || !patientName || !procedure || !type || !shiftDuty || !startTime || !endTime) {
        return res.status(400).json({ error: 'Missing required overtime fields.' });
      }
      const dateBS = formatBS(adToBS(parseADString(dateAD)));
      const record = await prisma.overtimeRecord.create({
        data: {
          staffId, staffName, department, dateAD, dateBS, patientName, procedure, type, shiftDuty,
          startTime, endTime, remarks: remarks || '', totalMinutes: calcMinutes(startTime, endTime),
          amount: await amountFor(type, department), status: 'PENDING',
        },
      });
      return res.status(201).json(record);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Overtime request failed.' });
  } finally {
    await prisma.$disconnect();
  }
}
