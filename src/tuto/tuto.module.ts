/* istanbul ignore file */

import { Module } from '@nestjs/common';
import { TutoService } from './tuto.service';
import { TutoController } from './tuto.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [TutoController],
  providers: [TutoService],
})
export class TutoModule {}
