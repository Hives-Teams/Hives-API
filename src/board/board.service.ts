import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BoardDTO } from './dto/board.dto';

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
        idUser: id,
      },
    });
    return data;
  }

  async setBoard(id: number, name: string): Promise<void> {
    try {
      await this.prisma.board.create({
        data: {
          name: name,
          idUser: id,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
