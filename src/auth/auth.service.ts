import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { TokenPayloadInterface } from 'src/interfaces/TokenPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { TokenDTO } from './dto/token.dto';
import { ConnectUserDTO } from './dto/connect-user.dto';
import { createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(user: CreateUserDTO): Promise<void> {
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
        firstName:
          user.firstName.charAt(0).toUpperCase() +
          user.firstName.slice(1).toLowerCase(),
        lastName:
          user.lastname.charAt(0).toUpperCase() +
          user.lastname.slice(1).toLowerCase(),
        password: hashpwd,
        codeActivate: activationCode,
      },
    });
  }

  async login(user: ConnectUserDTO): Promise<TokenDTO> {
    const userResult = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });
    if (!userResult) {
      throw new ForbiddenException("Ce compte n'existe pas");
    }
    const compare = await bcrypt.compare(user.password, userResult.password);
    if (!compare) {
      throw new ForbiddenException('Mot de passe incorrect');
    }
    const payload: TokenPayloadInterface = {
      sub: userResult.id,
    };
    return await this.generateToken(payload);
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
    payload: TokenPayloadInterface,
  ): Promise<TokenPayloadInterface> {
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

    const hash = createHash('sha256').update(refreshToken).digest('hex');

    const isMatch = await bcrypt.compare(hash, refreshTokenDB.refreshToken);

    if (!isMatch) {
      throw new ForbiddenException();
    }

    return payload;
  }

  async generateToken(payload: TokenPayloadInterface): Promise<TokenDTO> {
    const access_token = await this.jwtService.signAsync(
      {
        sub: payload.sub,
      },
      {
        secret: process.env.JWT,
        expiresIn: '30m',
      },
    );

    const refresh_token = await this.jwtService.signAsync(
      {
        sub: payload.sub,
        test: 'salut',
      },
      {
        secret: process.env.REFRESH,
        expiresIn: '7d',
      },
    );

    const hash = createHash('sha256').update(refresh_token).digest('hex');

    const refreshTokenHashed = await bcrypt.hash(
      hash,
      parseInt(process.env.SALT),
    );

    await this.prisma.user.update({
      data: {
        refreshToken: refreshTokenHashed,
        codeActivate: null,
      },
      where: {
        id: payload.sub,
      },
    });

    return {
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }
}
