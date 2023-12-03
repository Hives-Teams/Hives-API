import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BoardDTO } from './dto/board.dto';
import { CreateInBoardDTO } from './dto/create-in-board.dto';

@Injectable()
export class BoardService {
  constructor(private readonly prisma: PrismaService) {}

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
    const board = await this.prisma.boardModel.findMany({
      select: {
        name: true,
      },
    });
    const boardArray: string[] = [];
    board.forEach((b) => {
      boardArray.push(b.name);
    });
    return boardArray;
  }

  async setBoard(id: number, name: string, image: string): Promise<number> {
    const boardModel = await this.prisma.boardModel.findMany({
      select: {
        name: true,
      },
    });
    const boardArray: string[] = [];
    boardModel.forEach((b) => {
      boardArray.push(b.name);
    });

    if (!boardArray.includes(name))
      throw new BadRequestException('Nom du Hives incorrect');

    const boardUserObject = await this.prisma.board.findMany({
      select: {
        name: true,
      },
      where: {
        idUser: id,
      },
    });

    const boardUser: string[] = [];
    boardUserObject.forEach((b) => {
      boardUser.push(b.name);
    });

    if (boardUser.includes(name))
      throw new BadRequestException(
        'Vous avez déjà ajouté un Board avec ce nom.',
      );

    try {
      const board = await this.prisma.board.create({
        data: {
          name: name,
          user: {
            connect: {
              id: id,
            },
          },
          boardImage: {
            connect: {
              name: image,
            },
          },
        },
      });
      return board.id;
    } catch (error) {
      Logger.error(error.meta.cause, 'setBoard');
      if (error.code == 'P2025') {
        throw new BadRequestException('Image de board incorrect');
      }
      throw new BadRequestException('Erreur lors de la création du board');
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
}
