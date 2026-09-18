import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
  const latestRun = await prisma.stagingRun.findFirst({
    orderBy: { startedAt: 'desc' },
    where: { status: 'completed' }
  });
  console.log('Latest completed run:', latestRun);
}
main().finally(() => prisma.$disconnect());
