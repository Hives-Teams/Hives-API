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

  describe('deleteTuto', () => {
    it('should return an array of string', async () => {
      prisma.tuto.findFirst = jest.fn().mockResolvedValue({ idBoard: 1 });

      jest
        .spyOn(service, 'boardBelongtoUser')
        .mockImplementation(
          async () => await new Promise((resolve) => resolve()),
        );

      prisma.tuto.delete = jest.fn().mockResolvedValue({ id: 1 });

      expect(await service.deleteTuto(1, 1)).toStrictEqual(undefined);
    });

    it('should throw an error if user is incorrect', async () => {
      prisma.tuto.findFirst = jest.fn().mockResolvedValue({ idBoard: 1 });

      jest.spyOn(service, 'boardBelongtoUser').mockImplementation(() => {
        throw new Error('Ce board ne vous appartient pas');
      });

      await expect(service.deleteTuto(2, 1)).rejects.toThrow(
        'Ce board ne vous appartient pas',
      );
    });
  });

  describe('deleteTutos', () => {
    it('should delete tutos', async () => {
      prisma.tuto.findFirst = jest.fn().mockResolvedValue({ idBoard: 1 });
      jest
        .spyOn(service, 'boardBelongtoUser')
        .mockImplementation(
          async () => await new Promise((resolve) => resolve()),
        );

      prisma.tuto.deleteMany = jest.fn().mockResolvedValue({ id: 1 });

      expect(await service.deleteTutos(1, [1])).toStrictEqual(undefined);
    });

    it('should throw an error if user is incorrect', async () => {
      prisma.tuto.findFirst = jest.fn().mockResolvedValue({ idBoard: 1 });
      jest.spyOn(service, 'boardBelongtoUser').mockImplementation(() => {
        throw new Error('Ce board ne vous appartient pas');
      });

      await expect(service.deleteTutos(2, [1])).rejects.toThrow(
        'Ce board ne vous appartient pas',
      );
    });

    it('should throw an error if tuto does not exist', async () => {
      jest
        .spyOn(service, 'boardBelongtoUser')
        .mockImplementation(
          async () => await new Promise((resolve) => resolve()),
        );

      prisma.tuto.findFirst = jest.fn().mockResolvedValue(null);

      await expect(service.deleteTutos(1, [1])).rejects.toThrow(
        "Le tuto n'existe pas",
      );
    });
  });

  describe('listSocial', () => {
    it('should return an array of string', async () => {
      prisma.socialNetwork.findMany = jest.fn().mockResolvedValue([
        {
          name: 'test',
        },
      ]);

      expect(await service.listSocial()).toStrictEqual([
        {
          name: 'test',
        },
      ]);
    });
  });

  describe('boardBelongtoUser', () => {
    it('should return an array of string', async () => {
      jest.spyOn(service, 'getBoardOfUser').mockImplementation(async () => [1]);

      expect(await service.boardBelongtoUser(1, 1)).toStrictEqual(undefined);
    });

    it('should throw an error if user is incorrect', async () => {
      jest.spyOn(service, 'getBoardOfUser').mockImplementation(async () => [2]);

      await expect(service.boardBelongtoUser(1, 1)).rejects.toThrow(
        'Board non existant pour cette utilisateur',
      );
    });
  });

  describe('getBoardOfUser', () => {
    it('should return an array of number', async () => {
      prisma.board.findMany = jest.fn().mockResolvedValue([
        {
          id: 1,
        },
      ]);

      expect(await service.getBoardOfUser(1)).toStrictEqual([1]);
    });
  });

  describe('isValidUrl', () => {
    it('should return true', async () => {
      expect(service.isValidUrl('https://www.google.com')).toStrictEqual(true);
    });

    it('should return false', async () => {
      expect(service.isValidUrl('test')).toStrictEqual(false);
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
      jest
        .spyOn(service, 'boardBelongtoUser')
        .mockImplementation(
          async () => await new Promise((resolve) => resolve()),
        );

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
      jest.spyOn(service, 'listSocial').mockImplementation(async () => [
        {
          id: 1,
          name: 'instagram',
        },
      ]);
      jest.spyOn(service, 'boardBelongtoUser').mockImplementation(() => {
        throw new Error('Pas une URL');
      });

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
      jest.spyOn(service, 'listSocial').mockImplementation(async () => [
        {
          id: 1,
          name: 'instagram',
        },
      ]);
      jest.spyOn(service, 'boardBelongtoUser').mockImplementation(() => {
        throw new Error('Réseau social non compatible');
      });
      await expect(
        service.setTutos(2, {
          url: 'https://www.google.com',
          board: [],
        }),
      ).rejects.toThrow('Réseau social non compatible');
    });
  });
});
