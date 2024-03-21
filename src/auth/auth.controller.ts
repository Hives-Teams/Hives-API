import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/create-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/jwt/guards/jwt.guard';
import { TokenPayloadInterface } from 'src/interfaces/TokenPayload.interface';
import { JwtRefreshGuard } from 'src/jwt/guards/jwt-refresh-guard';
import { ConnectUserDTO } from './dto/connect-user.dto';
import { TokenDTO } from './dto/token.dto';
import { ActivationCodeDTO } from './dto/activation-code.dto';
import { IdUserDTO } from './dto/id-user.dto';
import { EmailDTO } from './dto/email.dto';
import { ChangeForgotPasswordDTO } from './dto/change-forgot-password.dto';
import { DeviceDTO } from './dto/device.dto';
import { v4 as uuidv4 } from 'uuid';
import { GoogleIdDTO } from './dto/google-id.dto';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: "Création d'un nouveau compte",
  })
  @ApiCreatedResponse({
    type: IdUserDTO,
    description:
      "Id du compte que l'application mobile récupère afin de vérifier si le code d'activation du compte appartient bien à l'utilisateur",
  })
  @ApiBody({
    type: CreateUserDTO,
    examples: {
      inscription: {
        value: {
          email: 'JohnDoe@gmail.com',
          firstname: 'William',
          lastname: 'Afton',
          password: 'Abcdefg&',
        },
      },
    },
  })
  @Post('register')
  async register(@Body() user: CreateUserDTO): Promise<IdUserDTO> {
    return await this.authService.register(user);
  }
  @ApiOperation({
    summary: "Création d'un nouveau compte avec Google",
  })
  @ApiCreatedResponse({
    type: TokenDTO,
  })
  @ApiBody({
    type: GoogleIdDTO,
    examples: {
      inscription: {
        value: {
          id: 'string',
          idDevice: uuidv4(),
        },
      },
    },
  })
  @Post('register/google')
  async registerGoogle(@Body() user: GoogleIdDTO): Promise<TokenDTO> {
    return await this.authService.registerGoogle(user.id, user.idDevice);
  }

  @ApiOperation({
    summary: 'Activation du compte',
  })
  @ApiCreatedResponse({
    type: TokenDTO,
  })
  @ApiBody({
    type: ActivationCodeDTO,
    examples: {
      activation: {
        description:
          "Demande l'id de l'utilisateur, le code reçu par mail, ainsi que l'id unique du téléphone (ici généré automatiquement pour les tests)",
        value: {
          id: 0,
          code: 0,
          idDevice: uuidv4(),
        },
      },
    },
  })
  @Post('activation')
  async activation(@Body() code: ActivationCodeDTO): Promise<TokenDTO> {
    return await this.authService.activation(code);
  }

  @ApiOperation({
    summary: 'Connexion à un compte',
  })
  @ApiOkResponse({
    type: TokenDTO,
  })
  @ApiBody({
    type: ConnectUserDTO,
    examples: {
      connexion: {
        value: {
          email: 'Bee@Miel.com',
          password: 'Abcdefg&',
          idDevice: uuidv4(),
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() user: ConnectUserDTO): Promise<TokenDTO> {
    return await this.authService.login(user);
  }

  @ApiOperation({
    summary: 'Connexion à un compte via Google',
  })
  @ApiOkResponse({
    type: TokenDTO,
  })
  @ApiBody({
    type: GoogleIdDTO,
    examples: {
      inscription: {
        value: {
          id: 'string',
          idDevice: uuidv4(),
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('login/google')
  async loginGoogle(@Body() user: GoogleIdDTO): Promise<TokenDTO> {
    return await this.authService.loginGoogle(user.id, user.idDevice);
  }

  @ApiOperation({
    summary: "Deconnecte l'appareil de l'app",
  })
  @ApiBody({
    type: DeviceDTO,
    examples: {
      deconnexion: {
        value: {
          idDevice: uuidv4(),
        },
      },
    },
  })
  @UseGuards(JwtGuard)
  @Delete('disconnect')
  async disconnect(
    @Req() req: { user: TokenPayloadInterface },
    @Body() device: DeviceDTO,
  ): Promise<void> {
    return await this.authService.disconnect(req.user.sub, device.idDevice);
  }

  @UseGuards(JwtGuard)
  @Delete('delete')
  async requestDeleteAccount(
    @Req() req: { user: TokenPayloadInterface },
  ): Promise<void> {
    return await this.authService.deleteAccount(req.user.email, req.user.sub);
  }

  @ApiOperation({
    summary: 'Envoi un code pour réinitialiser son mot de passe',
  })
  @Post('forgotPassword')
  async sendForgotPasswordEmail(@Body() user: EmailDTO): Promise<void> {
    return await this.authService.sendForgotPasswordEmail(user.email);
  }

  @ApiOperation({
    summary: "Réinitialise son mot de passe à l'aide du code reçu par mail",
  })
  @Post('resetForgotPassword')
  async resetForgotPassword(
    @Body() user: ChangeForgotPasswordDTO,
  ): Promise<void> {
    return await this.authService.changeForgotPassword(user);
  }

  @ApiOperation({
    summary:
      "Actualise l'access_token à l'aide du refresh_token (via le bouton Authorize sur Swagger)",
  })
  @ApiOkResponse({
    type: TokenDTO,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiBody({
    type: DeviceDTO,
    description: 'Vous devez donner un idDevice qui soit valide',
  })
  @Post('refresh')
  async refresh(
    @Req() req: { user: TokenPayloadInterface },
    @Body() device: DeviceDTO,
  ): Promise<TokenDTO> {
    return this.authService.refreshToken(req.user, device.idDevice);
  }

  @UseGuards(JwtGuard)
  @Get('test')
  async test(): Promise<string> {
    const test = 'salut';
    return test;
  }
}
