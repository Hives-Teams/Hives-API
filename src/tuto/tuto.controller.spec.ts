import { Test, TestingModule } from '@nestjs/testing';
import { TutoController } from './tuto.controller';
import { TutoService } from './tuto.service';

describe('TutoController', () => {
  let controller: TutoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TutoController],
      providers: [TutoService],
    }).compile();

    controller = module.get<TutoController>(TutoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
