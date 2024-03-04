import { ChangeForgotPasswordDTO } from './dto/change-forgot-password.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { TokenPayloadInterface } from 'src/interfaces/TokenPayload.interface';
import { JwtService } from '@nestjs/jwt';
import { TokenDTO } from './dto/token.dto';
import { ConnectUserDTO } from './dto/connect-user.dto';
import { MailService } from 'src/mail/mail.service';
import { ActivationCodeDTO } from './dto/activation-code.dto';
import { IdUserDTO } from './dto/id-user.dto';
import { createHash } from 'crypto';
import { NotificationDTO } from './dto/notification.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(user: CreateUserDTO): Promise<IdUserDTO> {
    const userExist = await this.userExist(user.email);
    if (userExist)
      throw new ConflictException('Cet email est déjà associé à un compte');

    const hashpwd = await this.hash(user.password);

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
      Logger.error(error);
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

    const payload: TokenPayloadInterface = {
      sub: user.id,
      email: user.email,
    };

    const jwt = await this.generateToken(payload);

    let refreshToken = createHash('sha256')
      .update(jwt.refresh_token)
      .digest('hex');

    refreshToken = await this.hash(refreshToken);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: code.id,
        },
        data: {
          activate: true,
          codeActivate: null,
        },
      }),

      this.prisma.refreshTokenUser.upsert({
        where: {
          idDevice: code.idDevice,
        },
        create: {
          idDevice: code.idDevice,
          refreshToken: refreshToken,
          idUser: code.id,
        },
        update: {
          refreshToken: refreshToken,
          idUser: code.id,
        },
      }),
    ]);

    return jwt;
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

    const jwt = await this.generateToken(payload);

    let refreshToken = createHash('sha256')
      .update(jwt.refresh_token)
      .digest('hex');

    refreshToken = await this.hash(refreshToken);

    await this.prisma.refreshTokenUser.upsert({
      where: {
        idDevice: user.idDevice,
      },
      create: {
        idDevice: user.idDevice,
        refreshToken: refreshToken,
        idUser: userResult.id,
      },
      update: {
        refreshToken: refreshToken,
        idUser: userResult.id,
      },
    });

    return jwt;
  }

  async disconnect(id: number, idDevice: string): Promise<void> {
    try {
      await this.prisma.refreshTokenUser.delete({
        where: {
          idDevice: idDevice,
          idUser: id,
        },
      });
    } catch (error) {
      if (error.code == 'P2025') {
        Logger.error(error, 'Disconnect');
        throw new ForbiddenException(
          "Cette appareil n'appartient pas à cette utilisateur",
        );
      }
      throw new ForbiddenException('Erreur inconnu');
    }
  }

  async deleteAccount(email: string, id: number): Promise<void> {
    try {
      await this.prisma.refreshTokenUser.deleteMany({
        where: {
          idUser: id,
        },
      });
      await this.prisma.board.deleteMany({
        where: {
          idUser: id,
        },
      });
      await this.prisma.user.delete({
        where: {
          id: id,
        },
      });
      this.mailService.sendRequestAccountDelete(email);
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async setTokenNotification(
    idUser: number,
    notif: NotificationDTO,
  ): Promise<void> {
    try {
      await this.prisma.refreshTokenUser.updateMany({
        data: {
          Notification: notif.token,
        },
        where: {
          AND: [
            {
              idUser: idUser,
            },
            {
              idDevice: notif.idDevice,
            },
          ],
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async sendForgotPasswordEmail(email: string): Promise<void> {
    try {
      const code = this.activationCode();

      const idUser = await this.prisma.user.findFirstOrThrow({
        where: {
          email: email,
        },
        select: {
          id: true,
        },
      });

      await this.prisma.forgotPassword.upsert({
        where: {
          idUser: idUser.id,
        },
        update: {
          codeForgot: code,
        },
        create: {
          user: {
            connect: {
              email: email,
            },
          },
          codeForgot: code,
        },
        include: {
          user: true,
        },
      });
      this.mailService.sendForgotPasswordMail(email, code);
    } catch (error) {
      throw new BadRequestException(
        "Cette adresse email n'est relié à aucun compte",
      );
    }
  }

  async changeForgotPassword(user: ChangeForgotPasswordDTO): Promise<void> {
    const code = await this.prisma.forgotPassword.findFirst({
      where: {
        user: {
          email: user.email,
        },
      },
    });

    if (!code || code.codeForgot != user.code)
      throw new BadRequestException('Code incorrect');

    const newPassword = await this.hash(user.newPassword);

    await this.prisma.user.update({
      data: {
        password: newPassword,
      },
      where: {
        email: user.email,
      },
    });

    await this.prisma.forgotPassword.delete({
      where: {
        idUser: code.idUser,
      },
    });
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

  async refreshToken(
    payload: TokenPayloadInterface,
    idDevice: string,
  ): Promise<TokenDTO> {
    const refreshTokenDB = await this.prisma.refreshTokenUser.findFirst({
      where: {
        idDevice: idDevice,
        idUser: payload.sub,
      },
    });

    if (!refreshTokenDB) throw new UnauthorizedException('pas token');

    const refreshTokenCrypt = createHash('sha256')
      .update(payload.refreshToken)
      .digest('hex');

    const isMatch = await bcrypt.compare(
      refreshTokenCrypt,
      refreshTokenDB.refreshToken,
    );

    if (!isMatch) throw new ForbiddenException('not match');

    payload.refreshToken = null;

    const jwt = await this.generateToken(payload);

    let refreshToken = createHash('sha256')
      .update(jwt.refresh_token)
      .digest('hex');

    refreshToken = await this.hash(refreshToken);

    await this.prisma.refreshTokenUser.updateMany({
      data: {
        refreshToken: refreshToken,
      },
      where: {
        AND: [
          {
            idUser: payload.sub,
          },
          {
            idDevice: idDevice,
          },
        ],
      },
    });

    return jwt;
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
      expiresIn: '15m',
    });

    const refresh_token = await this.jwtService.signAsync(newPayloard, {
      secret: process.env.REFRESH,
      expiresIn: '30d',
    });

    return {
      access_token: access_token,
      refresh_token: refresh_token,
    };
  }

  private async hash(key: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);

    return await bcrypt.hash(key, salt);
  }
}
