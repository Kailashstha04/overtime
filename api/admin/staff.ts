import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json(users);
    }

    if (req.method === 'PATCH') {
      const { id, fullName, email, password, isActive } = req.body || {};
      if (!id) return res.status(400).json({ error: 'User id is required.' });
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(fullName !== undefined ? { fullName } : {}),
          ...(email !== undefined ? { email } : {}),
          ...(password ? { password } : {}),
          ...(isActive !== undefined ? { isActive } : {}),
        },
      });
      return res.status(200).json(user);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Staff request failed.' });
  } finally {
    await prisma.$disconnect();
  }
}
