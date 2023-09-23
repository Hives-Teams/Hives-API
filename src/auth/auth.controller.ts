import {
  Body,
  Controller,
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
  ApiCreatedResponse,
  ApiOkResponse,
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

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({
    type: IdUserDTO,
  })
  @Post('register')
  async register(@Body() user: CreateUserDTO): Promise<IdUserDTO> {
    return await this.authService.register(user);
  }

  @ApiCreatedResponse({
    type: TokenDTO,
  })
  @Post('activation')
  async activation(@Body() code: ActivationCodeDTO): Promise<TokenDTO> {
    return await this.authService.activation(code);
  }

  @ApiOkResponse({
    type: TokenDTO,
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() user: ConnectUserDTO): Promise<TokenDTO> {
    return await this.authService.login(user);
  }

  @Post('forgotPassword')
  async sendForgotPasswordEmail(@Body() user: EmailDTO): Promise<void> {
    return await this.authService.sendForgotPasswordEmail(user.email);
  }

  @Post('resetForgotPassword')
  async resetForgotPassword(
    @Body() user: ChangeForgotPasswordDTO,
  ): Promise<void> {
    return await this.authService.changeForgotPassword(user);
  }

  @ApiOkResponse({
    type: TokenDTO,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @Req() req: { user: TokenPayloadInterface },
  ): Promise<TokenDTO> {
    return await this.authService.generateToken(req.user);
  }

  @UseGuards(JwtGuard)
  @Get('test')
  async test(): Promise<string> {
    const test = 'salut';
    return test;
  }
}
