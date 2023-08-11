import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { TutoService } from './tuto.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { TokenPayloadInterface } from 'src/interfaces/TokenPayload.interface';
import { CreateTutoDTO } from './dto/create-tuto.dto';
import { JwtGuard } from 'src/jwt/guards/jwt.guard';

@UseGuards(JwtGuard)
@ApiTags('tuto')
@ApiBearerAuth()
@Controller('tuto')
export class TutoController {
  constructor(private readonly tutoService: TutoService) {}

  @ApiCreatedResponse()
  @Post()
  async setTuto(
    @Req() req: { user: TokenPayloadInterface },
    @Body() createTuto: CreateTutoDTO,
  ): Promise<void> {
    return await this.tutoService.setTutos(req.user.sub, createTuto);
  }
}
