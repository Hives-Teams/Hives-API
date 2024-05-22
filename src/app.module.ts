/* istanbul ignore file */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BoardModule } from './board/board.module';
import { TutoModule } from './tuto/tuto.module';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';

function loadController(): any[] {
  const modules = [];
  if (!Boolean(Number(process.env.MAINTENANCE))) {
    modules.push(AuthModule);
    modules.push(PrismaModule);
    modules.push(BoardModule);
    modules.push(TutoModule);
    modules.push(MailModule);
    modules.push(CronModule);
  }
  return modules;
}

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ScheduleModule.forRoot(),
    ...loadController(),
  ],
})
export class AppModule {}
