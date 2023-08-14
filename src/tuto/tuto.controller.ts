import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TutoService } from './tuto.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TokenPayloadInterface } from 'src/interfaces/TokenPayload.interface';
import { CreateTutoDTO } from './dto/create-tuto.dto';
import { JwtGuard } from 'src/jwt/guards/jwt.guard';
import { TutoDTO } from './dto/tuto.dto';

@UseGuards(JwtGuard)
@ApiTags('tuto')
@ApiBearerAuth()
@Controller('tuto')
export class TutoController {
  constructor(private readonly tutoService: TutoService) {}

  @ApiOkResponse({
    type: TutoDTO,
    isArray: true,
  })
  @ApiParam({
    name: 'idBoard',
    required: true,
    type: Number,
  })
  @Get(':idBoard')
  async getTuto(
    @Req() req: { user: TokenPayloadInterface },
    @Param('idBoard') idBoard: string,
  ): Promise<TutoDTO[]> {
    return await this.tutoService.getTuto(req.user.sub, parseInt(idBoard));
  }

  @ApiCreatedResponse()
  @Post()
  async setTuto(
    @Req() req: { user: TokenPayloadInterface },
    @Body() createTuto: CreateTutoDTO,
  ): Promise<void> {
    return await this.tutoService.setTutos(req.user.sub, createTuto);
  }
}
