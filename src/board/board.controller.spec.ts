import { Test, TestingModule } from '@nestjs/testing';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TokenPayloadInterface } from 'src/interfaces/TokenPayload.interface';
import { BoardDTO } from './dto/board.dto';
import { CreateInBoardDTO } from './dto/create-in-board.dto';
import { DeleteBoardDTO } from './dto/delete-board.dto';

describe('BoardController', () => {
  let controller: BoardController;
  let service: BoardService;

  const req: { user: TokenPayloadInterface } = {
    user: {
      sub: 1,
      email: 'test@test.fr',
      refreshToken: 'test',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [BoardController],
      providers: [BoardService],
    }).compile();

    controller = module.get<BoardController>(BoardController);
    service = module.get<BoardService>(BoardService);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBoard', () => {
    it('should return an array of boards', async () => {
      const result: BoardDTO[] = [
        {
          id: 1,
          name: 'test',
          boardImage: {
            name: 'test',
          },
        },
      ];

      jest.spyOn(service, 'getBoard').mockImplementation(async () => result);

      expect(await controller.getBoard(req)).toBe(result);
    });
  });

  describe('getModelBoard', () => {
    it('should return an array of board model', async () => {
      const result: string[] = ['test'];
      jest
        .spyOn(service, 'getBoardModel')
        .mockImplementation(async () => result);

      expect(await controller.getModelBoard(req)).toBe(result);
    });
  });

  describe('setBoard', () => {
    it('should create a board and return an id of board', async () => {
      const result: number = 1;

      jest.spyOn(service, 'setBoard').mockImplementation(async () => result);

      expect(
        await controller.setBoard(req, { name: 'test', image: 'test' }),
      ).toBe(result);
    });

    it('should throw an error if name is not in board model', async () => {
      jest.spyOn(service, 'setBoard').mockImplementation(async () => {
        throw new Error('Nom de board incorrect');
      });

      await expect(
        controller.setBoard(req, { name: 'test', image: 'test' }),
      ).rejects.toThrow('Nom de board incorrect');
    });
  });

  describe('setInBoard', () => {
    it('should create a board', async () => {
      jest.spyOn(service, 'setInBoard').mockImplementation(async () => {});

      const board: CreateInBoardDTO = {
        name: 'test',
        idBoard: 1,
      };

      expect(await controller.setInBoard(req, board)).toBe(undefined);
    });

    it('should throw an error if board id is not in board model', async () => {
      jest.spyOn(service, 'setInBoard').mockImplementation(async () => {
        throw new Error('Board non existant pour cette utilisateur');
      });

      const board: CreateInBoardDTO = {
        name: 'test',
        idBoard: 1,
      };

      await expect(controller.setInBoard(req, board)).rejects.toThrow(
        'Board non existant pour cette utilisateur',
      );
    });
  });

  describe('deleteBoard', () => {
    it('should delete a board', async () => {
      jest.spyOn(service, 'deleteBoard').mockImplementation(async () => {});

      const board: DeleteBoardDTO = {
        id: 1,
      };

      expect(await controller.deleteBoard(req, board)).toBe(undefined);
    });

    it('should throw an error if board id is not in board model', async () => {
      jest.spyOn(service, 'deleteBoard').mockImplementation(async () => {
        throw new Error();
      });

      const board: DeleteBoardDTO = {
        id: 1,
      };

      await expect(controller.deleteBoard(req, board)).rejects.toThrow();
    });
  });
});
