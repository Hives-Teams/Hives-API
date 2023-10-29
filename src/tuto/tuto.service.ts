import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTutoDTO } from './dto/create-tuto.dto';
import { SocialInterface } from 'src/interfaces/Social.interface';
import detectSocialNetwork from 'detect-social-network';
import { TutoDTO } from './dto/tuto.dto';
import { HttpService } from '@nestjs/axios';
import {
  Expo,
  ExpoPushMessage,
  ExpoPushSuccessTicket,
  ExpoPushTicket,
} from 'expo-server-sdk';
import { PhoneNotification } from 'src/interfaces/phone-notification.interface';
import { setTimeout } from 'timers/promises';

@Injectable()
export class TutoService {
  social: SocialInterface[];
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {
    this.listSocial();
  }

  async getTuto(id: number, idBoard: number): Promise<TutoDTO[]> {
    await this.boardBelongToUser(id, idBoard);

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
    await this.boardBelongToUser(idUser, idBoard);

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
    await this.boardBelongToUser(idUser, idBoard);

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
    if (!this.isValidUrl(createTuto.url))
      throw new BadRequestException('Pas une URL');

    const url = detectSocialNetwork(createTuto.url);
    const socialCompatibility = this.social.find((s) => s.name == url);

    if (!socialCompatibility)
      throw new BadRequestException('Réseau social non compatible');

    if (socialCompatibility.name == 'tiktok') {
      const longUrl = await this.httpService.axiosRef.get(createTuto.url);
      createTuto.url =
        longUrl.request._redirectable._options.href.split('?')[0];
    }

    await this.boardBelongToUser(id, createTuto.board);

    await this.prisma.tuto.create({
      data: {
        URL: createTuto.url,
        title: createTuto.title,
        idSocial: socialCompatibility.id,
        idBoard: createTuto.board,
      },
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

    await this.boardBelongToUser(idUser, idBoard.idBoard);

    await this.prisma.tuto.delete({
      where: {
        id: idTuto,
      },
    });
  }

  private async listSocial(): Promise<void> {
    this.social = await this.prisma.socialNetwork.findMany();
  }

  private async boardBelongToUser(
    idUser: number,
    idBoard: number,
  ): Promise<void> {
    const user = await this.prisma.board.findUnique({
      where: {
        id: idBoard,
        idUser: idUser,
      },
      include: {
        user: true,
      },
    });

    if (!user)
      throw new ForbiddenException('Board non existant pour cette utilisateur');
  }

  private isValidUrl(url: string): boolean {
    try {
      return Boolean(new URL(url));
    } catch (error) {
      return false;
    }
  }

  async reminderNotifications(): Promise<void> {
    const tokens = await this.prisma.refreshTokenUser.findMany({
      select: {
        idUser: true,
        Notification: true,
      },
      where: {
        NOT: [
          {
            Notification: null,
          },
        ],
      },
    });

    const messages: PhoneNotification[] = [];

    for (const t of tokens) {
      if (Expo.isExpoPushToken(`ExponentPushToken[${t.Notification}]`)) {
        const board = await this.prisma.board.findFirst({
          select: {
            id: true,
            name: true,
          },
          where: {
            idUser: t.idUser,
          },
        });
        if (board) {
          messages.push({
            to: `ExponentPushToken[${t.Notification}]`,
            title: 'Hives',
            body: `vous avez vu le tutos ${board.name} ?`,
            data: { board: board.id },
          });
        }
      } else {
        await this.prisma.refreshTokenUser.update({
          where: {
            Notification: t.Notification,
          },
          data: {
            Notification: null,
          },
        });
      }
    }

    const userWithNotif = await this.prisma.refreshTokenUser.findMany({
      select: {
        idUser: true,
        idDevice: true,
      },
      where: {
        NOT: [
          {
            Notification: null,
          },
        ],
      },
    });

    const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = await this.sendNotifications(chunks, expo);

    console.log(tickets);

    // // 15 min
    await setTimeout(900000);

    const receiptIds: string[] = [];

    for (const ticket of tickets as ExpoPushSuccessTicket[]) {
      if (ticket.id) {
        receiptIds.push(ticket.id);
      }
    }

    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    await this.errorNotifications(receiptIdChunks, expo, userWithNotif);
  }

  private async sendNotifications(
    chunks: ExpoPushMessage[][],
    expo: Expo,
  ): Promise<ExpoPushTicket[]> {
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }

    return tickets;
  }

  private async errorNotifications(
    receiptIdChunks: string[][],
    expo: Expo,
    idArray: {
      idUser: number;
      idDevice: string;
    }[],
  ): Promise<void> {
    receiptIdChunks.forEach(async (chunk, index) => {
      try {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        for (const receiptId in receipts) {
          const { status, details } = receipts[receiptId];
          if (status === 'error' && details && details.error) {
            console.error(`The error code is ${details.error}`);
            if (details.error == 'DeviceNotRegistered') {
              await this.prisma.refreshTokenUser.update({
                where: {
                  idUser: idArray[index].idUser,
                  idDevice: idArray[index].idDevice,
                },
                data: {
                  Notification: null,
                },
              });
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
}
