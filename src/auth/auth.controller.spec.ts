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

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

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
});
