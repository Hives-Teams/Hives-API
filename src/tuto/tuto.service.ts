import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTutoDTO } from './dto/create-tuto.dto';
import detectSocialNetwork from 'detect-social-network';
import { TutoDTO } from './dto/tuto.dto';
import { HttpService } from '@nestjs/axios';
import getMetaData from 'metadata-scraper';
import { MetadataDTO } from './dto/metadata.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class TutoService {
  constructor(
    readonly prisma: PrismaService,
    readonly httpService: HttpService,
  ) {}

  async getTuto(id: number, idBoard: number): Promise<TutoDTO[]> {
    return await this.prisma.tuto.findMany({
      select: {
        id: true,
        title: true,
        image: true,
        URL: true,
        idBoard: true,
        SocialNetworks: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
      where: {
        AND: [
          {
            board: {
              idUser: id,
            },
          },
          {
            idBoard: idBoard,
          },
        ],
      },
    });
  }

  async getTutoBySocial(
    idUser: number,
    idBoard: number,
    social: string,
  ): Promise<TutoDTO[]> {
    try {
      const socialArray: string[] = JSON.parse(social);

      return await this.prisma.tuto.findMany({
        select: {
          id: true,
          title: true,
          image: true,
          URL: true,
          idBoard: true,
          SocialNetworks: {
            select: {
              name: true,
            },
          },
          createdAt: true,
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
            {
              board: {
                idUser: idUser,
              },
            },
          ],
        },
      });
    } catch (err) {
      Logger.error(err, 'TutoService.getTutoBySocial');
      throw new BadRequestException('Format du tableau incorrect');
    }
  }

  async getSocialByIdBoard(idUser: number, idBoard: number): Promise<string[]> {
    const socialPrisma = await this.prisma.socialNetwork.findMany({
      select: {
        name: true,
      },
      where: {
        Tuto: {
          some: {
            AND: [
              {
                board: {
                  idUser: idUser,
                },
              },
              {
                idBoard: idBoard,
              },
            ],
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

  async setTutos(idUser: number, createTuto: CreateTutoDTO): Promise<void> {
    const boards = await this.prisma.board
      .findMany({
        select: {
          id: true,
        },
        where: {
          id: {
            in: createTuto.board,
          },
          idUser: idUser,
        },
      })
      .then((b) => b.map((b) => b.id));

    if (boards.length == 0)
      throw new ForbiddenException(
        "au moins un board n'existe pas pour cette utilisateur",
      );

    if (!this.isValidUrl(createTuto.url))
      throw new BadRequestException("Ce champ de texte n'est pas une URL");

    const url = detectSocialNetwork(createTuto.url);
    const social = await this.prisma.socialNetwork.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    const socialCompatibility = social.find((s) => s.name == url);

    if (!socialCompatibility)
      throw new BadRequestException('Réseau social non compatible');

    createTuto.url = await this.getLongUrl(createTuto.url);

    const metadata = await getMetaData(createTuto.url);

    const data = createTuto.board.map((b) => {
      return {
        URL: createTuto.url,
        idSocial: socialCompatibility.id,
        idBoard: b,
        title:
          metadata.title == undefined
            ? 'Post'
            : metadata.title.length > 191
              ? metadata.title.substring(0, 188) + '...'
              : metadata.title,
        image: metadata.image,
      };
    });

    await this.prisma.tuto.createMany({
      data: data,
    });
  }

  async updateTuto(
    idUser: number,
    idTuto: number,
    nameTuto: string,
  ): Promise<void> {
    await this.prisma.tuto
      .update({
        data: {
          title: nameTuto,
        },
        where: {
          board: {
            idUser: idUser,
          },
          id: idTuto,
        },
      })
      .catch((err: PrismaClientKnownRequestError) => {
        Logger.error(err, 'TutoService.editTuto');
        throw new BadRequestException("Le posts n'existe pas");
      });
  }

  async setMetadata(idUser: number, idTuto: number): Promise<MetadataDTO> {
    const tuto = await this.prisma.tuto
      .findFirstOrThrow({
        select: {
          URL: true,
          board: true,
        },
        where: {
          AND: [
            {
              id: idTuto,
            },
            {
              board: {
                idUser: idUser,
              },
            },
          ],
        },
      })
      .catch((err: PrismaClientKnownRequestError) => {
        Logger.error(err, 'TutoService.setMetadata');
        throw new BadRequestException("Le tuto n'existe pas");
      });

    const metadata = await getMetaData(tuto.URL);

    await this.prisma.tuto.update({
      where: {
        id: idTuto,
      },
      data: {
        title:
          metadata.title != undefined
            ? metadata.title.length > 191
              ? metadata.title.substring(0, 188) + '...'
              : metadata.title
            : 'Nom du post',
        image: metadata.image,
      },
    });

    return {
      title: metadata.title,
      image: metadata.image,
    };
  }

  async deleteTuto(idUser: number, idTuto: number): Promise<void> {
    await this.prisma.tuto
      .delete({
        where: {
          id: idTuto,
          board: {
            idUser: idUser,
          },
        },
      })
      .catch((err: PrismaClientKnownRequestError) => {
        Logger.error(err, 'TutoService.deleteTuto');
        throw new BadRequestException("Le tuto n'existe pas");
      });
  }

  async deleteTutos(idUser: number, idTuto: number[]): Promise<void> {
    await this.prisma.tuto.deleteMany({
      where: {
        id: {
          in: idTuto,
        },
        board: {
          idUser: idUser,
        },
      },
    });
  }

  private isValidUrl(url: string): boolean {
    try {
      return Boolean(new URL(url));
    } catch (error) {
      return false;
    }
  }

  private async getLongUrl(url: string): Promise<string> {
    return await this.httpService.axiosRef
      .get(url)
      .then((res) => res.request._redirectable._currentUrl);
  }
}
