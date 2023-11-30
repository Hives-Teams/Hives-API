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
      jest
        .spyOn(service, 'boardBelongtoUser')
        .mockImplementation(
          async () => await new Promise((resolve) => resolve()),
        );

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
      jest.spyOn(service, 'boardBelongtoUser').mockImplementation(() => {
        throw new Error('Ce board ne vous appartient pas');
      });

      await expect(service.getTuto(2, 1)).rejects.toThrow(
        'Ce board ne vous appartient pas',
      );
    });
  });
  describe('getTutoBySocial', () => {
    it('should return an array of tuto', async () => {
      jest
        .spyOn(service, 'boardBelongtoUser')
        .mockImplementation(
          async () => await new Promise((resolve) => resolve()),
        );

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
      jest.spyOn(service, 'boardBelongtoUser').mockImplementation(() => {
        throw new Error('Ce board ne vous appartient pas');
      });

      await expect(service.getTutoBySocial(2, 1, '["test"]')).rejects.toThrow(
        'Ce board ne vous appartient pas',
      );
    });
  });

  describe('getSocialByIdBoard', () => {
    it('should return an array of string', async () => {
      jest
        .spyOn(service, 'boardBelongtoUser')
        .mockImplementation(
          async () => await new Promise((resolve) => resolve()),
        );

      prisma.board.findFirst = jest.fn().mockResolvedValue({ id: 1 });

      prisma.socialNetwork.findMany = jest.fn().mockResolvedValue([
        {
          name: 'test',
        },
      ]);

      expect(await service.getSocialByIdBoard(1, 1)).toStrictEqual(['test']);
    });

    it('should throw an error if user is incorrect', async () => {
      jest.spyOn(service, 'boardBelongtoUser').mockImplementation(() => {
        throw new Error('Ce board ne vous appartient pas');
      });

      await expect(service.getSocialByIdBoard(2, 1)).rejects.toThrow(
        'Ce board ne vous appartient pas',
      );
    });
  });
});
