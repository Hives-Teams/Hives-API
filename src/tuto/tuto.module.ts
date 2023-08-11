import { Module } from '@nestjs/common';
import { TutoService } from './tuto.service';
import { TutoController } from './tuto.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TutoController],
  providers: [TutoService],
})
export class TutoModule {}
