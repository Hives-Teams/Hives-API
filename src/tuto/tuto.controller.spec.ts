import { Test, TestingModule } from '@nestjs/testing';
import { TutoController } from './tuto.controller';
import { TutoService } from './tuto.service';
import { TokenPayloadInterface } from 'src/interfaces/TokenPayload.interface';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { TutoDTO } from './dto/tuto.dto';
import { CreateTutoDTO } from './dto/create-tuto.dto';
import { DeleteTutosDTO } from './dto/delete-tutos.dto';

describe('TutoController', () => {
  let controller: TutoController;
  let service: TutoService;

  const req: { user: TokenPayloadInterface } = {
    user: {
      sub: 1,
      email: 'test@test.fr',
      firstName: 'John',
      lastName: 'Doe',
      refreshToken: 'test',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, HttpModule],
      controllers: [TutoController],
      providers: [TutoService],
    }).compile();

    controller = module.get<TutoController>(TutoController);
    service = module.get<TutoService>(TutoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSocialByIdBoard', () => {
    it('should return an array of string', async () => {
      const result = ['test'];
      jest
        .spyOn(service, 'getSocialByIdBoard')
        .mockImplementation(async () => result);
      expect(await controller.getSocialByIdBoard(req, '1')).toBe(result);
    });
  });

  describe('getTuto', () => {
    it('should return an array of tuto', async () => {
      const result: TutoDTO[] = [
        {
          id: 1,
          title: 'test',
          URL: 'test',
          image: 'test',
          createdAt: new Date(),
          idBoard: 1,
          SocialNetworks: {
            name: 'test',
          },
        },
      ];
      jest.spyOn(service, 'getTuto').mockImplementation(async () => result);
      expect(await controller.getTuto(req, '1')).toBe(result);
    });
  });

  describe('getTutoBySocial', () => {
    it('should return an array of tuto', async () => {
      const result: TutoDTO[] = [
        {
          id: 1,
          title: 'test',
          URL: 'test',
          image: 'test',
          createdAt: new Date(),
          idBoard: 1,
          SocialNetworks: {
            name: 'test',
          },
        },
      ];
      jest
        .spyOn(service, 'getTutoBySocial')
        .mockImplementation(async () => result);
      expect(await controller.getTutoBySocial(req, '1', 'test')).toBe(result);
    });

    it('should throw an error if social is incorrect', async () => {
      jest.spyOn(service, 'getTutoBySocial').mockImplementation(async () => {
        throw new Error('Format du tableau incorrect');
      });
      await expect(
        controller.getTutoBySocial(req, '1', 'test'),
      ).rejects.toThrow('Format du tableau incorrect');
    });
  });

  describe('setTuto', () => {
    it('should create a tuto', async () => {
      jest.spyOn(service, 'setTutos').mockImplementation(async () => {});
      const tuto: CreateTutoDTO = {
        url: 'test',
        board: [1],
      };
      expect(await controller.setTuto(req, tuto)).toBe(undefined);
    });

    it('should throw an error if board is not an array', async () => {
      jest.spyOn(service, 'setTutos').mockImplementation(async () => {
        throw new Error('createTuto.board.map is not a function');
      });
      const tuto: CreateTutoDTO = {
        url: 'test',
        board: 1 as any,
      };
      await expect(controller.setTuto(req, tuto)).rejects.toThrow(
        'createTuto.board.map is not a function',
      );
    });

    it('should throw an error if url is not a URL', async () => {
      jest.spyOn(service, 'setTutos').mockImplementation(async () => {
        throw new Error('Pas une URL');
      });
      const tuto: CreateTutoDTO = {
        url: 'test',
        board: [1],
      };
      await expect(controller.setTuto(req, tuto)).rejects.toThrow(
        'Pas une URL',
      );
    });

    it('should throw an error if social network is not compatible', async () => {
      jest.spyOn(service, 'setTutos').mockImplementation(async () => {
        throw new Error('Réseau social non compatible');
      });
      const tuto: CreateTutoDTO = {
        url: 'test',
        board: [1],
      };
      await expect(controller.setTuto(req, tuto)).rejects.toThrow(
        'Réseau social non compatible',
      );
    });
  });

  describe('deleteTuto', () => {
    it('should delete a tuto', async () => {
      jest.spyOn(service, 'deleteTuto').mockImplementation(async () => {});
      const tuto = {
        id: 1,
      };
      expect(await controller.deleteTuto(req, tuto)).toBe(undefined);
    });

    it('should throw an error if tuto does not exist', async () => {
      jest.spyOn(service, 'deleteTuto').mockImplementation(async () => {
        throw new Error("Le tuto n'existe pas");
      });
      const tuto = {
        id: 1,
      };
      await expect(controller.deleteTuto(req, tuto)).rejects.toThrow(
        "Le tuto n'existe pas",
      );
    });
  });

  describe('deleteTutos', () => {
    it('should delete array of tuto', async () => {
      jest.spyOn(service, 'deleteTutos').mockImplementation(async () => {});
      const tuto: DeleteTutosDTO = {
        id: [1],
      };
      expect(await controller.deleteTutos(req, tuto)).toBe(undefined);
    });

    it('should throw an error if tuto does not exist', async () => {
      jest.spyOn(service, 'deleteTutos').mockImplementation(async () => {
        throw new Error("Le tuto n'existe pas");
      });
      const tuto: DeleteTutosDTO = {
        id: [1],
      };
      await expect(controller.deleteTutos(req, tuto)).rejects.toThrow(
        "Le tuto n'existe pas",
      );
    });
  });
});
