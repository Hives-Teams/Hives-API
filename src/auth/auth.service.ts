import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { TokenPayload } from 'src/interfaces/TokenPayload';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(user: CreateUserDTO): Promise<number> {
    const userExist = await this.userExist(user.email);
    if (userExist) {
      throw new ConflictException('Cet email est déjà associé à un compte');
    }
    const salt = await bcrypt.genSalt(10);
    const hashpwd = await bcrypt.hash(user.password, salt);
    const activationCode = this.activationCode();
    await this.prisma.user.create({
      data: {
        email: user.email,
        password: hashpwd,
        codeActivate: activationCode,
        refreshToken: 'dgferg',
      },
    });
    return activationCode;
  }

  private async userExist(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (user) {
      return true;
    }
    return false;
  }

  activationCode(): number {
    return Math.floor(Math.random() * (10000 - 1000) + 1000);
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    payload: TokenPayload,
  ): Promise<TokenPayload> {
    const refreshTokenDB = await this.prisma.user.findUnique({
      select: {
        refreshToken: true,
      },
      where: {
        id: payload.sub,
      },
    });

    if (!refreshTokenDB) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(
      refreshToken,
      refreshTokenDB.refreshToken,
    );

    if (!isMatch) {
      throw new ForbiddenException();
    }

    return payload;
  }
}
