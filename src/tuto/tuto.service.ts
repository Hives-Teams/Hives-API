import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTutoDTO } from './dto/create-tuto.dto';
import detectSocialNetwork from 'detect-social-network';
import { TutoDTO } from './dto/tuto.dto';
import { HttpService } from '@nestjs/axios';
import { SocialNetwork } from '@prisma/client';

@Injectable()
export class TutoService {
  constructor(
    readonly prisma: PrismaService,
    readonly httpService: HttpService,
  ) {}

  async getTuto(id: number, idBoard: number): Promise<TutoDTO[]> {
    await this.boardBelongtoUser(id, idBoard);

    const tuto: TutoDTO[] = await this.prisma.tuto.findMany({
      select: {
        id: true,
        title: true,
        URL: true,
        idBoard: true,
        SocialNetworks: {
          select: {
            name: true,
          },
        },
      },
      where: {
        idBoard: idBoard,
      },
    });
    return tuto;
  }

  async getTutoBySocial(
    idUser: number,
    idBoard: number,
    social: string,
  ): Promise<TutoDTO[]> {
    await this.boardBelongtoUser(idUser, idBoard);

    try {
      const socialArray: string[] = JSON.parse(social);

      const tuto: TutoDTO[] = await this.prisma.tuto.findMany({
        select: {
          id: true,
          title: true,
          URL: true,
          idBoard: true,
          SocialNetworks: {
            select: {
              name: true,
            },
          },
        },
        where: {
          AND: [
            {
              idBoard: idBoard,
            },
            {
              SocialNetworks: {
                name: { in: socialArray },
              },
            },
          ],
        },
      });

      return tuto;
    } catch (error) {
      throw new BadRequestException('Format du tableau incorrect');
    }
  }

  async getSocialByIdBoard(idUser: number, idBoard: number): Promise<string[]> {
    await this.boardBelongtoUser(idUser, idBoard);

    const socialPrisma = await this.prisma.socialNetwork.findMany({
      select: {
        name: true,
      },
      where: {
        Tuto: {
          some: {
            idBoard: idBoard,
          },
        },
      },
    });

    const social: string[] = [];

    socialPrisma.forEach((s) => {
      social.push(s.name);
    });

    return social;
  }

  async setTutos(id: number, createTuto: CreateTutoDTO): Promise<void> {
    const boards = await this.getBoardOfUser(id);

    const belongToUser = createTuto.board.every((b) => boards.includes(b));

    if (!belongToUser)
      throw new ForbiddenException(
        "au moins un board n'existe pas pour cette utilisateur",
      );

    if (!this.isValidUrl(createTuto.url))
      throw new BadRequestException('Pas une URL');

    const url = detectSocialNetwork(createTuto.url);
    const social = await this.listSocial();
    const socialCompatibility = social.find((s) => s.name == url);

    if (!socialCompatibility)
      throw new BadRequestException('Réseau social non compatible');

    if (socialCompatibility.name == 'tiktok') {
      const longUrl = await this.httpService.axiosRef.get(createTuto.url);
      createTuto.url =
        longUrl.request._redirectable._options.href.split('?')[0];
    }

    if (socialCompatibility.name == 'instagram') {
      if (!/\/\//.test(createTuto.url))
        createTuto.url = createTuto.url.replace(/^(https:)(\/)/, '$1/$2');
    }

    const data = createTuto.board.map((b) => {
      return {
        URL: createTuto.url,
        idSocial: socialCompatibility.id,
        idBoard: b,
      };
    });

    await this.prisma.tuto.createMany({
      data: data,
    });
  }

  async deleteTuto(idUser: number, idTuto: number): Promise<void> {
    const idBoard = await this.prisma.tuto.findFirst({
      select: {
        idBoard: true,
      },
      where: {
        id: idTuto,
      },
    });

    if (!idBoard) throw new BadRequestException("Le tuto n'existe pas");

    await this.boardBelongtoUser(idUser, idBoard.idBoard);

    await this.prisma.tuto.delete({
      where: {
        id: idTuto,
      },
    });
  }

  async deleteTutos(idUser: number, idTuto: number[]): Promise<void> {
    const idBoard = await this.prisma.tuto.findFirst({
      select: {
        idBoard: true,
      },
      where: {
        id: idTuto[0],
      },
    });

    if (!idBoard) throw new BadRequestException("Le tuto n'existe pas");

    await this.boardBelongtoUser(idUser, idBoard.idBoard);

    await this.prisma.tuto.deleteMany({
      where: {
        id: {
          in: idTuto,
        },
      },
    });
  }

  async listSocial(): Promise<SocialNetwork[]> {
    return await this.prisma.socialNetwork.findMany();
  }

  async boardBelongtoUser(idUser: number, idBoard: number): Promise<void> {
    const boards = await this.getBoardOfUser(idUser);

    const belongToUser = boards.filter((b) => b == idBoard);

    if (!belongToUser.length)
      throw new ForbiddenException('Board non existant pour cette utilisateur');
  }

  async getBoardOfUser(idUser: number): Promise<number[]> {
    const boardObject = await this.prisma.board.findMany({
      where: {
        idUser: idUser,
      },
    });
    const boardArray: number[] = [];
    for (const b of boardObject) {
      boardArray.push(b.id);
    }
    return boardArray;
  }

  isValidUrl(url: string): boolean {
    try {
      return Boolean(new URL(url));
    } catch (error) {
      return false;
    }
  }
}
