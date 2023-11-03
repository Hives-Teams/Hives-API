import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/jwt/strategies/jwt.strategy';
import { JwtRefreshTokenStrategy } from 'src/jwt/strategies/jwt-refresh-token-strategy';
import { MailModule } from 'src/mail/mail.module';
import { CodeStrategy } from 'src/jwt/strategies/code.strategy';

@Module({
  imports: [PrismaModule, JwtModule.register({}), MailModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshTokenStrategy, CodeStrategy],
})
export class AuthModule {}
