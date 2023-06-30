import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({
    type: Number,
  })
  @Post('register')
  async register(@Body() user: CreateUserDTO): Promise<number> {
    return await this.authService.register(user);
  }
}
