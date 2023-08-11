import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
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
import { Response } from 'express';
import { ConnectUserDTO } from './dto/connect-user.dto';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse()
  @Post('register')
  async register(@Body() user: CreateUserDTO): Promise<void> {
    return await this.authService.register(user);
  }

  @ApiOkResponse({
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() user: ConnectUserDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    const token = await this.authService.login(user);
    response.cookie('refresh-token', token.refresh_token, {
      httpOnly: true,
      secure: true,
    });
    return token.access_token;
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response): Promise<void> {
    response.clearCookie('refresh-token');
    return null;
  }

  @ApiOkResponse({
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @Req() req: { user: TokenPayloadInterface },
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    const token = await this.authService.generateToken(req.user);
    response.cookie('refresh-token', token.refresh_token, {
      httpOnly: true,
      secure: true,
    });
    return token.access_token;
  }

  @UseGuards(JwtGuard)
  @Get('test')
  async test(): Promise<string> {
    const test = 'salut';
    return test;
  }
}
