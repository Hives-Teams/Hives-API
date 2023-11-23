import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInBoardDTO } from './dto/create-in-board.dto';

describe('BoardService', () => {
  let service: BoardService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [BoardService],
    }).compile();

    service = module.get<BoardService>(BoardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBoard', () => {
    it('should return an array of boards', async () => {
      prisma.board.findMany = jest
        .fn()
        .mockResolvedValue([{ id: 1, name: 'test' }]);

      expect(await service.getBoard(1)).toStrictEqual([
        { id: 1, name: 'test' },
      ]);
    });
  });

  describe('getBoardModel', () => {
    it('should return an array of board model', async () => {
      prisma.boardModel.findMany = jest
        .fn()
        .mockResolvedValue([{ name: 'test' }]);

      expect(await service.getBoardModel()).toStrictEqual(['test']);
    });
  });

  describe('setBoard', () => {
    it('should create a board and return an id of board', async () => {
      prisma.boardModel.findMany = jest
        .fn()
        .mockResolvedValue([{ name: 'test' }]);

      prisma.board.create = jest.fn().mockResolvedValue({ id: 1 });

      expect(await service.setBoard(1, 'test')).toBe(1);
    });

    it('should throw an error if board name is incorrect', async () => {
      prisma.boardModel.findMany = jest
        .fn()
        .mockResolvedValue([{ name: 'test' }]);

      await expect(service.setBoard(1, 'test2')).rejects.toThrow(
        'Nom de board incorrect',
      );
    });
  });

  describe.skip('setInBoard', () => {
    it('should create a inBoard', async () => {
      prisma.board.findFirst = jest.fn().mockResolvedValue({
        id: 1,
        InBoard: null,
        name: 'test',
        idUser: 1,
        createdAt: new Date(),
      });

      const inboard: CreateInBoardDTO = {
        idBoard: 1,
        name: 'test',
      };

      expect(await service.setInBoard(1, inboard)).toBeUndefined();
    });
  });

  describe('deleteBoard', () => {
    it('should delete a board', async () => {
      prisma.board.delete = jest.fn().mockResolvedValue({ id: 1 });

      expect(await service.deleteBoard(1, 1)).toBeUndefined();
    });
  });
});
