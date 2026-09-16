import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(users);
    }

    if (req.method === 'POST') {
      const { fullName, username, email, password, department } = req.body || {};

      if (!fullName || !username || !email || !password || !department) {
        return res.status(400).json({ error: 'Missing required user fields.' });
      }

      const exists = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (exists) {
        return res.status(409).json({ error: 'Username or email already exists.' });
      }

      const user = await prisma.user.create({
        data: {
          fullName,
          username,
          email,
          password,
          department,
          role: 'STAFF',
          isActive: true,
        },
      });

      return res.status(201).json(user);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unexpected server error',
    });
  } finally {
    await prisma.$disconnect();
  }
}
