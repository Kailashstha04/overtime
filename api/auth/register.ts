import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { fullName, username, email, password, department } = req.body || {};
    if (!fullName || !username || !email || !password || !department) {
      return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) return res.status(409).json({ success: false, error: 'Username or email already exists.' });

    await prisma.user.create({
      data: { fullName, username, email, password, department, role: 'STAFF', isActive: true },
    });
    return res.status(201).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Registration failed.' });
  } finally {
    await prisma.$disconnect();
  }
}
