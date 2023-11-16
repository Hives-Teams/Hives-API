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
        name: 'les trucs de dev la',
      },
      {
        id: 2,
        name: 'les trucs de da je sais pas moi photoshop et tous',
      },
      {
        id: 3,
        name: 'juste le market',
      },
      {
        id: 4,
        name: 'rien',
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
