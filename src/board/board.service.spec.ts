import { Test, TestingModule } from '@nestjs/testing';
import { BoardService } from './board.service';
import { PrismaModule } from 'src/prisma/prisma.module';

describe('BoardService', () => {
  let service: BoardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [BoardService],
    }).compile();

    service = module.get<BoardService>(BoardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
