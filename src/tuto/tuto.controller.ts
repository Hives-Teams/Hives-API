import {
  Body,
  Controller,
  Delete,
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
import { DeleteTutoDTO } from './dto/delete-tuto.dto';

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

  @ApiParam({
    name: 'idBoard',
    required: true,
    type: Number,
  })
  @ApiParam({
    name: 'social',
    required: true,
    type: String,
  })
  @Get(':idBoard/:social')
  async getTutoBySocial(
    @Req() req: { user: TokenPayloadInterface },
    @Param('idBoard') idBoard: string,
    @Param('idSocial') social: string,
  ): Promise<TutoDTO[]> {
    return await this.tutoService.getTutoBySocial(
      req.user.sub,
      parseInt(idBoard),
      social,
    );
  }

  @ApiCreatedResponse()
  @Post()
  async setTuto(
    @Req() req: { user: TokenPayloadInterface },
    @Body() createTuto: CreateTutoDTO,
  ): Promise<void> {
    return await this.tutoService.setTutos(req.user.sub, createTuto);
  }

  @Delete()
  async deleteTuto(
    @Req() req: { user: TokenPayloadInterface },
    @Body() board: DeleteTutoDTO,
  ): Promise<void> {
    return await this.tutoService.deleteTuto(req.user.sub, board.id);
  }
}
