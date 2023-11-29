import { Test, TestingModule } from '@nestjs/testing';
import { TutoService } from './tuto.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { TutoDTO } from './dto/tuto.dto';

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
  });
});
