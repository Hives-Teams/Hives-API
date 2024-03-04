import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { MailModule } from 'src/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtRefreshTokenStrategy } from 'src/jwt/strategies/jwt-refresh-token-strategy';
import { JwtStrategy } from 'src/jwt/strategies/jwt.strategy';
import { TokenDTO } from './dto/token.dto';
import { ActivationCodeDTO } from './dto/activation-code.dto';
import { ChangeForgotPasswordDTO } from './dto/change-forgot-password.dto';
import { TokenPayloadInterface } from 'src/interfaces/TokenPayload.interface';
import { v4 as uuidv4 } from 'uuid';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, JwtModule.register({}), MailModule],
      providers: [AuthService, JwtRefreshTokenStrategy, JwtStrategy],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should return an id of user', async () => {
      const result: { id: number } = { id: 1 };
      jest.spyOn(service, 'register').mockImplementation(async () => result);

      expect(
        await service.register({
          email: '',
          firstname: '',
          lastname: '',
          password: '',
        }),
      ).toBe(result);
    });

    it('should throw an error if email is already used', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        email: '',
      });

      await expect(
        service.register({
          email: '',
          firstname: '',
          lastname: '',
          password: '',
        }),
      ).rejects.toThrow('Cet email est déjà associé à un compte');
    });
  });

  describe('login', () => {
    it('should return a token', async () => {
      const result: TokenDTO = {
        access_token: '',
        refresh_token: '',
      };
      jest.spyOn(service, 'login').mockImplementation(async () => result);

      expect(
        await service.login({
          email: '',
          password: '',
          idDevice: '',
        }),
      ).toBe(result);
    });

    it('should throw an error if user is not found', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        service.login({
          email: '',
          password: '',
          idDevice: '',
        }),
      ).rejects.toThrow("Ce compte n'existe pas");
    });

    it('should throw an error if user is not activated', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        email: '',
        password: '',
        codeActivate: '',
      });

      await expect(
        service.login({
          email: '',
          password: '',
          idDevice: '',
        }),
      ).rejects.toThrow('Forbidden Exception');
    });

    it('should throw an error if password is incorrect', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        email: '',
        password: 'test',
        activate: true,
      });

      await expect(
        service.login({
          email: '',
          password: '',
          idDevice: '',
        }),
      ).rejects.toThrow('Mot de passe incorrect');
    });
  });

  describe('activate', () => {
    it('should return an id of user', async () => {
      const result: TokenDTO = {
        access_token: '',
        refresh_token: '',
      };
      const params: ActivationCodeDTO = {
        id: 0,
        code: 0,
        idDevice: '',
      };
      jest.spyOn(service, 'activation').mockImplementation(async () => result);

      expect(await service.activation(params)).toBe(result);
    });

    it('should throw an error if code is incorrect', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        codeActivate: 1,
      });

      await expect(
        service.activation({
          id: 1,
          code: 2,
          idDevice: '',
        }),
      ).rejects.toThrow('Code incorrect');
    });
  });

  describe('forgotPassword', () => {
    it('should return an id of user', async () => {
      jest
        .spyOn(service, 'sendForgotPasswordEmail')
        .mockImplementation(async () => {});

      expect(await service.sendForgotPasswordEmail('')).toBe(undefined);
    });

    it('should throw an error if email is incorrect', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.sendForgotPasswordEmail('')).rejects.toThrow(
        "Cette adresse email n'est relié à aucun compte",
      );
    });
  });

  describe('resetPassword', () => {
    const pwd: ChangeForgotPasswordDTO = {
      email: '',
      code: 0,
      newPassword: '',
    };
    it('should return an id of user', async () => {
      jest
        .spyOn(service, 'changeForgotPassword')
        .mockImplementation(async () => undefined);

      expect(await service.changeForgotPassword(pwd)).toBe(undefined);
    });

    it('should throw an error if code is incorrect', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.changeForgotPassword(pwd)).rejects.toThrow(
        'Code incorrect',
      );
    });
  });

  describe('refreshToken', () => {
    const payload: TokenPayloadInterface = {
      sub: 0,
      email: '',
    };
    it('should return an id of user', async () => {
      const result: TokenDTO = {
        access_token: '',
        refresh_token: '',
      };
      jest
        .spyOn(service, 'refreshToken')
        .mockImplementation(async () => result);

      expect(await service.refreshToken(payload, uuidv4())).toBe(result);
    });

    it('should throw an error if user is incorrect', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.refreshToken(payload, uuidv4())).rejects.toThrow(
        'pas token',
      );
    });

    it('should throw an error if device is incorrect', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({ id: 1 });

      await expect(service.refreshToken(payload, '')).rejects.toThrow(
        'pas token',
      );
    });

    it('should throw an error if refreshtoken is incorrect', async () => {
      prisma.user.findUnique = jest
        .fn()
        .mockResolvedValue({ id: 1, refresh_token: 'test' });

      await expect(service.refreshToken(payload, uuidv4())).rejects.toThrow(
        'pas token',
      );
    });
  });

  describe('disconnect', () => {
    it('should return void', async () => {
      jest.spyOn(service, 'disconnect').mockImplementation(async () => {});

      expect(await service.disconnect(0, '')).toBe(undefined);
    });

    it('should throw an error if user is incorrect', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.disconnect(0, '')).rejects.toThrow(
        "Cette appareil n'appartient pas à cette utilisateur",
      );
    });
  });

  describe('deleteAccount', () => {
    it('should return void', async () => {
      jest.spyOn(service, 'deleteAccount').mockImplementation(async () => {});

      expect(await service.deleteAccount('', 0)).toBe(undefined);
    });

    it('should throw an error if user is incorrect', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.deleteAccount('', 0)).rejects.toThrow(
        "Le compte n'a pas pu être supprimé",
      );
    });
  });
});
