import { Test, TestingModule } from '@nestjs/testing';
import { TutoService } from './tuto.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';

describe('TutoService', () => {
  let service: TutoService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, HttpModule],
      providers: [TutoService],
    }).compile();

    service = module.get<TutoService>(TutoService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTuto', () => {
    it('should return an array of tuto', async () => {
      prisma.tuto.findMany = jest.fn().mockResolvedValue([
        {
          id: 1,
          title: 'test',
          URL: 'test',
          idBoard: 1,
          SocialNetworks: {
            name: 'test',
          },
        },
      ]);

      expect(await service.getTuto(1, 1)).toStrictEqual([
        {
          id: 1,
          title: 'test',
          URL: 'test',
          idBoard: 1,
          SocialNetworks: {
            name: 'test',
          },
        },
      ]);
    });

    it('should throw an error if user is incorrect', async () => {
      await expect(service.getTuto(2, 1)).rejects.toThrow(
        'Ce board ne vous appartient pas',
      );
    });
  });
  describe('getTutoBySocial', () => {
    it('should return an array of tuto', async () => {
      prisma.tuto.findMany = jest.fn().mockResolvedValue([
        {
          id: 1,
          title: 'test',
          URL: 'test',
          idBoard: 1,
          SocialNetworks: {
            name: 'test',
          },
        },
      ]);

      expect(await service.getTutoBySocial(1, 1, '["test"]')).toStrictEqual([
        {
          id: 1,
          title: 'test',
          URL: 'test',
          idBoard: 1,
          SocialNetworks: {
            name: 'test',
          },
        },
      ]);
    });

    it('should throw an error if user is incorrect', async () => {
      await expect(service.getTutoBySocial(2, 1, '["test"]')).rejects.toThrow(
        'Ce board ne vous appartient pas',
      );
    });
  });

  describe('getSocialByIdBoard', () => {
    it('should return an array of string', async () => {
      prisma.board.findFirst = jest.fn().mockResolvedValue({ id: 1 });

      prisma.socialNetwork.findMany = jest.fn().mockResolvedValue([
        {
          name: 'test',
        },
      ]);

      expect(await service.getSocialByIdBoard(1, 1)).toStrictEqual(['test']);
    });

    it('should throw an error if user is incorrect', async () => {
      await expect(service.getSocialByIdBoard(2, 1)).rejects.toThrow(
        'Ce board ne vous appartient pas',
      );
    });
  });

  describe('deleteTuto', () => {
    it('should return an array of string', async () => {
      prisma.tuto.findFirst = jest.fn().mockResolvedValue({ idBoard: 1 });
      prisma.tuto.delete = jest.fn().mockResolvedValue({ id: 1 });

      expect(await service.deleteTuto(1, 1)).toStrictEqual(undefined);
    });

    it('should throw an error if user is incorrect', async () => {
      prisma.tuto.findFirst = jest.fn().mockResolvedValue({ idBoard: 1 });
      await expect(service.deleteTuto(2, 1)).rejects.toThrow(
        'Ce board ne vous appartient pas',
      );
    });
  });

  describe('deleteTutos', () => {
    it('should delete tutos', async () => {
      prisma.tuto.findFirst = jest.fn().mockResolvedValue({ idBoard: 1 });

      prisma.tuto.deleteMany = jest.fn().mockResolvedValue({ id: 1 });

      expect(await service.deleteTutos(1, [1])).toStrictEqual(undefined);
    });

    it('should throw an error if user is incorrect', async () => {
      prisma.tuto.findFirst = jest.fn().mockResolvedValue({ idBoard: 1 });

      await expect(service.deleteTutos(2, [1])).rejects.toThrow(
        'Ce board ne vous appartient pas',
      );
    });

    it('should throw an error if tuto does not exist', async () => {
      prisma.tuto.findFirst = jest.fn().mockResolvedValue(null);

      await expect(service.deleteTutos(1, [1])).rejects.toThrow(
        "Le tuto n'existe pas",
      );
    });
  });

  describe('setTutos', () => {
    it('should return undefined', async () => {
      prisma.board.findMany = jest.fn().mockResolvedValue([]);
      prisma.socialNetwork.findMany = jest.fn().mockResolvedValue([
        {
          name: 'instagram',
        },
      ]);

      prisma.tuto.createMany = jest.fn().mockResolvedValue({
        id: 1,
        title: 'test',
        URL: 'test',
        idBoard: 1,
        SocialNetworks: {
          name: 'test',
        },
      });

      expect(
        await service.setTutos(1, {
          url: 'https://www.instagram.com/reel/CxlXglmLzWr/?igsh=MXNob3hvYzFneW52ZA==',
          board: [],
        }),
      ).toStrictEqual(undefined);
    });

    it('should throw an error if tuto is not a url', async () => {
      prisma.board.findMany = jest.fn().mockResolvedValue([]);
      prisma.socialNetwork.findMany = jest.fn().mockResolvedValue([
        {
          name: 'instagram',
        },
      ]);

      await expect(
        service.setTutos(2, {
          url: '',
          board: [],
        }),
      ).rejects.toThrow('Pas une URL');
    });
    it('should throw an error if social network is not compatible', async () => {
      prisma.board.findMany = jest.fn().mockResolvedValue([]);
      prisma.socialNetwork.findMany = jest.fn().mockResolvedValue([
        {
          name: 'instagram',
        },
      ]);
      await expect(
        service.setTutos(2, {
          url: 'https://www.google.com',
          board: [],
        }),
      ).rejects.toThrow('Réseau social non compatible');
    });
  });
});
