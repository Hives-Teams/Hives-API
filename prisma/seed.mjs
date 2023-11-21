import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.socialNetwork.createMany({
    data: [
      {
        id: 1,
        name: 'tiktok',
      },
      {
        id: 2,
        name: 'instagram',
      },
      {
        id: 3,
        name: 'linkedin',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.boardModel.createMany({
    data: [
      {
        id: 1,
        name: 'Never gonna give you up',
      },
      {
        id: 2,
        name: 'Never gonna let you down',
      },
      {
        id: 3,
        name: 'Never gonna run around and desert you',
      },
      {
        id: 4,
        name: 'Never gonna make you cry',
      },
    ],
    skipDuplicates: true,
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
