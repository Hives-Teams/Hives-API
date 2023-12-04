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
        name: 'Marketing digital',
      },
      {
        id: 2,
        name: 'UX-UI',
      },
      {
        id: 3,
        name: 'Développement',
      },
      {
        id: 4,
        name: 'Graphisme digital',
      },
      {
        id: 5,
        name: 'Vidéo',
      },
      {
        id: 6,
        name: 'Photographie',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.boardImage.createMany({
    data: [
      {
        id: 1,
        name: 'Board-3D',
      },
      {
        id: 2,
        name: 'Board-dev',
      },
      {
        id: 3,
        name: 'Board-graphic_design',
      },
      {
        id: 4,
        name: 'Board-marketing',
      },
      {
        id: 5,
        name: 'Board-ux',
      },
      {
        id: 6,
        name: 'Board-video',
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
