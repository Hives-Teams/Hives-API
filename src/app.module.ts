import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { BoardModule } from './board/board.module';
import { TutoModule } from './tuto/tuto.module';
import { MailModule } from './mail/mail.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot(),

    AuthModule,
    PrismaModule,
    BoardModule,
    TutoModule,
    MailModule,
  ],
})
export class AppModule {}
