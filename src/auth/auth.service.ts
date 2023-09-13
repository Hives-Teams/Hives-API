import {
  BadRequestException,
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
import { MailService } from 'src/mail/mail.service';
import { ActivationCodeDTO } from './dto/activation-code.dto';
import { IdUserDTO } from './dto/id-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(user: CreateUserDTO): Promise<IdUserDTO> {
    const userExist = await this.userExist(user.email);
    if (userExist) {
      throw new ConflictException('Cet email est déjà associé à un compte');
    }
    const salt = await bcrypt.genSalt(10);

    const hashpwd = await bcrypt.hash(user.password, salt);

    const activationCode = this.activationCode();

    const newUser = await this.prisma.user.create({
      data: {
        email: user.email,
        firstName:
          user.firstname.charAt(0).toUpperCase() +
          user.firstname.slice(1).toLowerCase(),
        lastName:
          user.lastname.charAt(0).toUpperCase() +
          user.lastname.slice(1).toLowerCase(),
        password: hashpwd,
        codeActivate: activationCode,
      },
    });

    try {
      await this.mailService.sendConfirmationMail(user.email, activationCode);
      return {
        id: newUser.id,
      };
    } catch (error) {
      await this.prisma.user.delete({
        where: {
          id: newUser.id,
        },
      });
      throw new BadRequestException(error);
    }
  }

  async activation(code: ActivationCodeDTO): Promise<TokenDTO> {
    const user = await this.prisma.user.findFirst({
      where: {
        AND: [
          {
            id: code.id,
          },
          {
            codeActivate: code.code,
          },
        ],
      },
    });

    if (!user) throw new ForbiddenException('Code incorrect');

    await this.prisma.user.update({
      where: {
        id: code.id,
      },
      data: {
        codeActivate: null,
        activate: true,
      },
    });

    const payload: TokenPayloadInterface = {
      sub: user.id,
      email: user.email,
    };

    return await this.generateToken(payload);
  }

  async login(user: ConnectUserDTO): Promise<TokenDTO> {
    const userResult = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (!userResult) throw new ForbiddenException("Ce compte n'existe pas");

    if (!userResult.activate) throw new ForbiddenException(userResult.id);

    const compare = await bcrypt.compare(user.password, userResult.password);

    if (!compare) throw new ForbiddenException('Mot de passe incorrect');

    const payload: TokenPayloadInterface = {
      sub: userResult.id,
      email: userResult.email,
    };

    return await this.generateToken(payload);
  }

  private async userExist(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (user) return true;

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

    if (!refreshTokenDB) throw new UnauthorizedException();

    const hash = createHash('sha256').update(refreshToken).digest('hex');

    const isMatch = await bcrypt.compare(hash, refreshTokenDB.refreshToken);

    if (!isMatch) {
      throw new ForbiddenException();
    }

    return payload;
  }

  async userIsActivated(id: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
        activate: true,
      },
    });

    if (!user) throw new ForbiddenException('Compte non activé');
  }

  async generateToken(payload: TokenPayloadInterface): Promise<TokenDTO> {
    const newPayloard: TokenPayloadInterface = {
      email: payload.email,
      sub: payload.sub,
    };

    const access_token = await this.jwtService.signAsync(newPayloard, {
      secret: process.env.JWT,
      expiresIn: '30m',
    });

    const refresh_token = await this.jwtService.signAsync(newPayloard, {
      secret: process.env.REFRESH,
      expiresIn: '7d',
    });

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
