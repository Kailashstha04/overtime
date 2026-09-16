import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { username: '54278899' },
    update: {},
    create: {
      fullName: 'System Administrator',
      username: '54278899',
      email: 'admin@smartovertime.np',
      password: '5427885427',
      role: 'ADMIN',
      department: 'OT Nursing',
      isActive: true,
    },
  });

  const existing = await prisma.rateSettings.findFirst();
  if (!existing) {
    await prisma.rateSettings.create({
      data: {
        otNursing: { Major: 1000, Intermediate: 800, Minor: 500 },
        cleaning: { Major: 300, Intermediate: 300, Minor: 300 },
      },
    });
  }

  console.log('Seed complete:', { admin: admin.username });
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
