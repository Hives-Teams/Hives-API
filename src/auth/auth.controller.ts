import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
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
import { TokenDTO } from './dto/Token.dto';
import { JwtGuard } from 'src/jwt/guards/jwt.guard';

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
    type: TokenDTO,
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() user: CreateUserDTO): Promise<TokenDTO> {
    return await this.authService.login(user);
  }

  @UseGuards(JwtGuard)
  @Get('test')
  async test(): Promise<any> {
    return 'salut';
  }
}
