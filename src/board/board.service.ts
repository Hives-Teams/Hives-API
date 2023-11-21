import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BoardDTO } from './dto/board.dto';
import { CreateInBoardDTO } from './dto/create-in-board.dto';

@Injectable()
export class BoardService {
  board: string[] = [];

  constructor(private readonly prisma: PrismaService) {
    this.listBoard();
  }

  async getBoard(id: number): Promise<BoardDTO[]> {
    const data: BoardDTO[] = await this.prisma.board.findMany({
      select: {
        id: true,
        name: true,
      },
      where: {
        AND: [
          {
            idUser: id,
          },
          {
            InBoard: null,
          },
        ],
      },
    });
    return data;
  }

  async getBoardModel(): Promise<string[]> {
    return this.board;
  }

  async setBoard(id: number, name: string): Promise<number> {
    if (!this.board.includes(name))
      throw new BadRequestException('Nom de board incorrect');

    try {
      const board = await this.prisma.board.create({
        data: {
          name: name,
          idUser: id,
        },
      });
      return board.id;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async setInBoard(
    id: number,
    createSubBoard: CreateInBoardDTO,
  ): Promise<void> {
    const board = await this.prisma.board.findFirst({
      where: {
        AND: [
          {
            id: createSubBoard.idBoard,
          },
          {
            idUser: id,
          },
        ],
      },
    });

    if (!board)
      throw new ForbiddenException('Board non existant pour cette utilisateur');

    await this.prisma.board.create({
      data: {
        name: createSubBoard.name,
        InBoard: createSubBoard.idBoard,
        idUser: id,
      },
    });
  }

  async deleteBoard(idUser: number, idBoard: number): Promise<void> {
    try {
      await this.prisma.board.delete({
        where: {
          id: idBoard,
          idUser: idUser,
        },
      });
    } catch (error) {
      throw new BadRequestException();
    }
  }

  private async listBoard(): Promise<void> {
    const board = await this.prisma.boardModel.findMany({
      select: {
        name: true,
      },
    });
    board.forEach((b) => {
      this.board.push(b.name);
    });
  }
}
