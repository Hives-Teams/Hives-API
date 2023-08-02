import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardDTO } from './dto/board.dto';
import { JwtGuard } from 'src/jwt/guards/jwt.guard';
import { TokenPayload } from 'src/interfaces/TokenPayload';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateBoardDTO } from './dto/create-board.dto';

@UseGuards(JwtGuard)
@ApiTags('board')
@ApiBearerAuth()
@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @ApiOkResponse({
    type: BoardDTO,
    isArray: true,
  })
  @Get()
  async getBoard(@Req() req: { user: TokenPayload }): Promise<BoardDTO[]> {
    return await this.boardService.getBoard(req.user.sub);
  }

  @ApiCreatedResponse()
  @Post()
  async setBoard(
    @Req() req: { user: TokenPayload },
    @Body() board: CreateBoardDTO,
  ): Promise<void> {
    return await this.boardService.setBoard(req.user.sub, board.name);
  }
}
