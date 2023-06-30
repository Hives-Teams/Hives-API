import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(@Body() user: CreateUserDTO): Promise<CreateUserDTO> {
    return await this.authService.register(user);
  }
}
