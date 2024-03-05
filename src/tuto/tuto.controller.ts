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
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TokenPayloadInterface } from 'src/interfaces/TokenPayload.interface';
import { CreateTutoDTO } from './dto/create-tuto.dto';
import { JwtGuard } from 'src/jwt/guards/jwt.guard';
import { TutoDTO } from './dto/tuto.dto';
import { DeleteTutoDTO } from './dto/delete-tuto.dto';
import { DeleteTutosDTO } from './dto/delete-tutos.dto';

@UseGuards(JwtGuard)
@ApiTags('tuto')
@ApiBearerAuth()
@Controller('tuto')
export class TutoController {
  constructor(private readonly tutoService: TutoService) {}

  @ApiOperation({
    summary: 'Affiche les réseaux sociaux des tutos enregistrée dans un board',
  })
  @ApiOkResponse({
    type: String,
    isArray: true,
  })
  @ApiParam({
    name: 'idBoard',
    type: Number,
    required: true,
  })
  @Get('social/:idBoard')
  async getSocialByIdBoard(
    @Req() req: { user: TokenPayloadInterface },
    @Param('idBoard') idBoard: string,
  ): Promise<string[]> {
    return await this.tutoService.getSocialByIdBoard(
      req.user.sub,
      parseInt(idBoard),
    );
  }

  @ApiOperation({
    summary: "Récupères les tutos d'un Board via son id",
  })
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

  @ApiOperation({
    summary:
      "Récupère les tutos d'un Board via son idB + filtre réseau sociaux",
  })
  @ApiOkResponse({
    type: TutoDTO,
    isArray: true,
  })
  @ApiParam({
    name: 'idBoard',
    required: true,
    type: Number,
  })
  @ApiParam({
    name: 'socialArray',
    required: true,
    type: String,
    example: '["instagram", "tiktok", "linkedin"]',
  })
  @Get(':idBoard/:socialArray')
  async getTutoBySocial(
    @Req() req: { user: TokenPayloadInterface },
    @Param('idBoard') idBoard: string,
    @Param('socialArray') social: string,
  ): Promise<TutoDTO[]> {
    return await this.tutoService.getTutoBySocial(
      req.user.sub,
      parseInt(idBoard),
      social,
    );
  }

  @ApiOperation({
    summary: 'Enregistre un ou plusieurs tuto dans un Board',
  })
  @ApiBody({
    type: CreateTutoDTO,
  })
  @Post()
  async setTuto(
    @Req() req: { user: TokenPayloadInterface },
    @Body() createTuto: CreateTutoDTO,
  ): Promise<void> {
    createTuto.board = createTuto.board.map((b) => parseInt(b as any));
    return await this.tutoService.setTutos(req.user.sub, createTuto);
  }

  @ApiOperation({
    summary: 'Supprimer un tuto via son id',
  })
  @Delete()
  async deleteTuto(
    @Req() req: { user: TokenPayloadInterface },
    @Body() tuto: DeleteTutoDTO,
  ): Promise<void> {
    return await this.tutoService.deleteTuto(req.user.sub, tuto.id);
  }

  @ApiOperation({
    summary: 'Supprime plusieurs tutos via leur id',
  })
  @Delete('array')
  async deleteTutos(
    @Req() req: { user: TokenPayloadInterface },
    @Body() tutos: DeleteTutosDTO,
  ): Promise<void> {
    tutos.id = tutos.id.map((i) => parseInt(i as any));
    return await this.tutoService.deleteTutos(req.user.sub, tutos.id);
  }
}
