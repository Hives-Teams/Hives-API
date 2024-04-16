import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshTokenStrategy } from 'src/jwt/strategies/jwt-refresh-token-strategy';
import { JwtStrategy } from 'src/jwt/strategies/jwt.strategy';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';
import { TokenDTO } from './dto/token.dto';
import { v4 as uuidv4 } from 'uuid';
import { TokenPayloadInterface } from 'src/interfaces/TokenPayload.interface';
import { DeviceDTO } from './dto/device.dto';
import { EmailDTO } from './dto/email.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const req: { user: TokenPayloadInterface } = {
    user: {
      sub: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.fr',
      refreshToken: 'test',
    },
  };

  const device: DeviceDTO = {
    idDevice: uuidv4(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, JwtModule.register({}), MailModule],
      controllers: [AuthController],
      providers: [AuthService, JwtRefreshTokenStrategy, JwtStrategy],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should return an id of user', async () => {
      const result: { id: number } = { id: 1 };
      jest.spyOn(service, 'register').mockImplementation(async () => result);

      expect(
        await controller.register({
          email: 'test@test.fr',
          firstname: 'test',
          lastname: 'test',
          password: 'Abcdeg@',
        }),
      ).toBe(result);
    });
  });

  describe('registerApple', () => {
    it('should return a token', async () => {
      const result: TokenDTO = {
        access_token: '',
        refresh_token: '',
      };
      jest
        .spyOn(service, 'registerApple')
        .mockImplementation(async () => result);
    });
    it('should throw an error apple account is not verified', async () => {
      jest.spyOn(service, 'registerApple').mockImplementation(async () => {
        throw new Error('Compte Apple non vérifié');
      });

      await expect(
        controller.registerApple({
          id: 'test',
          firstname: 'test',
          lastname: 'test',
          nonce: 'test',
          idDevice: uuidv4(),
        }),
      ).rejects.toThrow('Compte Apple non vérifié');
    });
    it('should throw an error if account is already register', async () => {
      jest.spyOn(service, 'registerApple').mockImplementation(async () => {
        throw new Error('Cet email est déjà associé à un compte');
      });

      await expect(
        controller.registerApple({
          id: 'test',
          firstname: 'test',
          lastname: 'test',
          nonce: 'test',
          idDevice: uuidv4(),
        }),
      ).rejects.toThrow('Cet email est déjà associé à un compte');
    });
  });

  describe('registerGoogle', () => {
    it('should return a token', async () => {
      const result: TokenDTO = {
        access_token: '',
        refresh_token: '',
      };
      jest
        .spyOn(service, 'registerGoogle')
        .mockImplementation(async () => result);

      expect(
        await controller.registerGoogle({
          id: 'test',
          idDevice: uuidv4(),
        }),
      ).toBe(result);
    });
    it('should throw an error google account is not verified', async () => {
      jest.spyOn(service, 'registerGoogle').mockImplementation(async () => {
        throw new Error('Compte Google non vérifié');
      });

      await expect(
        controller.registerGoogle({
          id: 'test',
          idDevice: uuidv4(),
        }),
      ).rejects.toThrow('Compte Google non vérifié');
    });
    it('should throw an error if account is already register', async () => {
      jest.spyOn(service, 'registerGoogle').mockImplementation(async () => {
        throw new Error('Cet email est déjà associé à un compte');
      });

      await expect(
        controller.registerGoogle({
          id: 'test',
          idDevice: uuidv4(),
        }),
      ).rejects.toThrow('Cet email est déjà associé à un compte');
    });
  });

  describe('activate', () => {
    it('should return a token', async () => {
      const result: TokenDTO = {
        access_token: 'test',
        refresh_token: 'test',
      };
      jest.spyOn(service, 'activation').mockImplementation(async () => result);

      expect(
        await controller.activation({
          code: 1,
          id: 0,
          idDevice: uuidv4(),
        }),
      ).toBe(result);
    });
  });

  describe('login', () => {
    it('should return a token', async () => {
      const result: TokenDTO = {
        access_token: 'test',
        refresh_token: 'test',
      };
      jest.spyOn(service, 'login').mockImplementation(async () => result);

      expect(
        await controller.login({
          email: '',
          password: '',
          idDevice: '',
        }),
      ).toBe(result);
    });
  });

  describe('loginGoogle', () => {
    it('should return a token', async () => {
      const result: TokenDTO = {
        access_token: 'test',
        refresh_token: 'test',
      };
      jest.spyOn(service, 'loginGoogle').mockImplementation(async () => result);
      expect(
        await controller.loginGoogle({ id: 'test', idDevice: uuidv4() }),
      ).toBe(result);
    });
    it('should throw an error google account is not verified', async () => {
      jest.spyOn(service, 'loginGoogle').mockImplementation(async () => {
        throw new Error('Compte Google non vérifié');
      });

      await expect(
        controller.loginGoogle({ id: 'test', idDevice: uuidv4() }),
      ).rejects.toThrow('Compte Google non vérifié');
    });
    it('should throw an error if account is not register', async () => {
      jest.spyOn(service, 'loginGoogle').mockImplementation(async () => {
        throw new Error("Ce compte Google n'est pas associé à un compte");
      });

      await expect(
        controller.loginGoogle({ id: 'test', idDevice: uuidv4() }),
      ).rejects.toThrow("Ce compte Google n'est pas associé à un compte");
    });
  });

  describe('loginApple', () => {
    it('should return a token', async () => {
      const result: TokenDTO = {
        access_token: 'test',
        refresh_token: 'test',
      };
      jest.spyOn(service, 'loginApple').mockImplementation(async () => result);
      expect(
        await controller.loginApple({
          id: 'test',
          idDevice: uuidv4(),
          nonce: 'test',
        }),
      ).toBe(result);
    });
    it('should throw an error apple account is not verified', async () => {
      jest.spyOn(service, 'loginApple').mockImplementation(async () => {
        throw new Error('Compte Apple non vérifié');
      });

      await expect(
        controller.loginApple({
          id: 'test',
          idDevice: uuidv4(),
          nonce: 'test',
        }),
      ).rejects.toThrow('Compte Apple non vérifié');
    });
    it('should throw an error if account is not register', async () => {
      jest.spyOn(service, 'loginApple').mockImplementation(async () => {
        throw new Error("Ce compte Apple n'est pas associé à un compte");
      });

      await expect(
        controller.loginApple({
          id: 'test',
          idDevice: uuidv4(),
          nonce: 'test',
        }),
      ).rejects.toThrow("Ce compte Apple n'est pas associé à un compte");
    });
  });

  describe('refreshToken', () => {
    it('should return a token', async () => {
      const result: TokenDTO = {
        access_token: 'test',
        refresh_token: 'test',
      };
      jest
        .spyOn(service, 'refreshToken')
        .mockImplementation(async () => result);

      expect(await controller.refresh(req, device)).toBe(result);
    });
  });

  describe('disconnect', () => {
    it('should return void', async () => {
      jest.spyOn(service, 'disconnect').mockImplementation(async () => {});

      expect(await controller.disconnect(req, device)).toBeUndefined();
    });
  });

  describe('forgotPassword', () => {
    it('should return void', async () => {
      const user: EmailDTO = {
        email: '',
      };
      jest
        .spyOn(service, 'sendForgotPasswordEmail')
        .mockImplementation(async () => {});

      expect(await controller.sendForgotPasswordEmail(user)).toBeUndefined();
    });
  });

  describe('deleteAccount', () => {
    it('should return void', async () => {
      jest.spyOn(service, 'deleteAccount').mockImplementation(async () => {});

      expect(await controller.requestDeleteAccount(req)).toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    it('should return void', async () => {
      jest
        .spyOn(service, 'changeForgotPassword')
        .mockImplementation(async () => {});

      expect(
        await controller.resetForgotPassword({
          code: 1,
          email: '',
          newPassword: '',
        }),
      ).toBeUndefined();
    });
  });
});
